const fs = require("fs/promises");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const FOOD_PROMPT = `You are a nutrition expert. Look at this food image and identify ALL foods visible.

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "name": "Short descriptive name of the meal/food (e.g. Turkey Sandwich With Potato Chips)",
  "calories": <estimated total calories as a number>,
  "protein": <estimated grams of protein as a number>,
  "carbs": <estimated grams of carbs as a number>,
  "fat": <estimated grams of fat as a number>
}

Be specific with the name — include all items visible on the plate.
Estimate macros for the full visible portion, not per 100g.
If you cannot identify the food, make your best guess.`;

function getMimeType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const map = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
  return map[ext] || "image/jpeg";
}

function parseJsonResponse(text) {
  console.log("[DEBUG] Raw AI response:", text);
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  console.log("[DEBUG] Parsed result:", JSON.stringify(parsed));
  return {
    foodName: parsed.name || "Unknown food",
    calories: Number(parsed.calories) || 0,
    protein: Number(parsed.protein) || 0,
    carbs: Number(parsed.carbs) || 0,
    fat: Number(parsed.fat) || 0,
  };
}

// --- Google Gemini (official SDK) ---

const GEMINI_MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash-preview-04-17",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

async function geminiRecognize({ imagePath }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[DEBUG] No GEMINI_API_KEY set, skipping Gemini");
    return null;
  }

  console.log("[DEBUG] Starting Gemini recognition...");
  console.log("[DEBUG] Image:", imagePath);

  const ai = new GoogleGenAI({ apiKey });
  const imageBytes = await fs.readFile(imagePath);
  const base64 = imageBytes.toString("base64");
  const mimeType = getMimeType(imagePath);
  console.log("[DEBUG] Image size:", imageBytes.length, "bytes | MIME:", mimeType);

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[DEBUG] Trying Gemini model: ${model}...`);
      const startTime = Date.now();

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: base64 } },
              { text: FOOD_PROMPT },
            ],
          },
        ],
      });

      const elapsed = Date.now() - startTime;
      const rawText = response.text || "";
      console.log(`[DEBUG] Gemini ${model} responded in ${elapsed}ms`);

      const parsed = parseJsonResponse(rawText);
      console.log(`[DEBUG] SUCCESS via Gemini ${model}: "${parsed.foodName}" | ${parsed.calories} cal`);
      return { ...parsed, provider: "gemini", model };
    } catch (e) {
      console.warn(`[DEBUG] Gemini ${model} FAILED: ${e?.message?.slice(0, 200)}`);
    }
  }

  console.log("[DEBUG] All Gemini models exhausted");
  return null;
}

// --- OpenAI (GPT-4o-mini with vision) ---

async function openaiRecognize({ imagePath }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[DEBUG] No OPENAI_API_KEY set, skipping OpenAI");
    return null;
  }

  console.log("[DEBUG] Starting OpenAI recognition...");
  const startTime = Date.now();

  const imageBytes = await fs.readFile(imagePath);
  const base64 = imageBytes.toString("base64");
  const mimeType = getMimeType(imagePath);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            { type: "text", text: FOOD_PROMPT },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn(`[DEBUG] OpenAI FAILED (${res.status}): ${text.slice(0, 200)}`);
    throw new Error(`OpenAI (${res.status}): ${text.slice(0, 150)}`);
  }

  const elapsed = Date.now() - startTime;
  const json = await res.json();
  const rawText = json?.choices?.[0]?.message?.content || "";
  console.log(`[DEBUG] OpenAI responded in ${elapsed}ms`);

  const parsed = parseJsonResponse(rawText);
  console.log(`[DEBUG] SUCCESS via OpenAI: "${parsed.foodName}" | ${parsed.calories} cal`);
  return { ...parsed, provider: "openai", model: "gpt-4o-mini" };
}

// --- Hugging Face fallback (food name only) ---

async function hfRecognize({ imagePath }) {
  const token = process.env.HF_API_TOKEN;
  const model = process.env.HF_MODEL || "nateraw/food";
  if (!token) {
    console.log("[DEBUG] No HF_API_TOKEN set, skipping Hugging Face");
    return null;
  }

  console.log(`[DEBUG] Starting Hugging Face recognition (model: ${model})...`);
  const startTime = Date.now();

  const bytes = await fs.readFile(imagePath);
  const res = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: bytes,
  });

  if (!res.ok) {
    console.warn(`[DEBUG] HF FAILED (${res.status})`);
    return null;
  }

  const elapsed = Date.now() - startTime;
  const json = await res.json();
  const top = Array.isArray(json) ? json[0] : null;
  console.log(`[DEBUG] HF responded in ${elapsed}ms | Top result:`, top);

  if (!top?.label) return null;

  const foodName = String(top.label).replace(/_/g, " ");
  console.log(`[DEBUG] SUCCESS via HF: "${foodName}" (score: ${top.score})`);

  return {
    foodName,
    calories: 0, protein: 0, carbs: 0, fat: 0,
    provider: "huggingface",
    needsNutritionLookup: true,
  };
}

// --- Main: Gemini → OpenAI → HF → stub ---

async function recognizeFoodFromImage({ imagePath }) {
  console.log("\n========== FOOD SCAN START ==========");
  console.log("[DEBUG] File:", imagePath);
  console.log("[DEBUG] Keys configured: Gemini=%s OpenAI=%s HF=%s",
    process.env.GEMINI_API_KEY ? "YES" : "NO",
    process.env.OPENAI_API_KEY ? "YES" : "NO",
    process.env.HF_API_TOKEN ? "YES" : "NO"
  );

  try {
    const gemini = await geminiRecognize({ imagePath });
    if (gemini) {
      console.log("========== SCAN COMPLETE (Gemini) ==========\n");
      return gemini;
    }
  } catch (e) {
    console.warn("[DEBUG] Gemini top-level error:", e?.message?.slice(0, 100));
  }

  try {
    const oai = await openaiRecognize({ imagePath });
    if (oai) {
      console.log("========== SCAN COMPLETE (OpenAI) ==========\n");
      return oai;
    }
  } catch (e) {
    console.warn("[DEBUG] OpenAI top-level error:", e?.message?.slice(0, 100));
  }

  try {
    const hf = await hfRecognize({ imagePath });
    if (hf) {
      console.log("========== SCAN COMPLETE (HuggingFace) ==========\n");
      return hf;
    }
  } catch (e) {
    console.warn("[DEBUG] HF top-level error:", e?.message?.slice(0, 100));
  }

  console.warn("[DEBUG] ALL PROVIDERS FAILED — returning stub");
  console.log("========== SCAN COMPLETE (stub) ==========\n");

  return {
    foodName: "Unknown food",
    calories: 0, protein: 0, carbs: 0, fat: 0,
    provider: "stub",
  };
}

module.exports = { recognizeFoodFromImage };
