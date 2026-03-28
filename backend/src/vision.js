const fs = require("fs/promises");
const path = require("path");

const GEMINI_PROMPT = `You are a nutrition expert. Look at this food image and identify ALL foods visible.

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

const GEMINI_MODELS = [
  "gemini-2.5-flash-preview-04-17",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b",
];

async function callGemini({ apiKey, model, mimeType, base64 }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: GEMINI_PROMPT }
          ]
        }
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini ${model} (${res.status}): ${text.slice(0, 150)}`);
  }

  const json = await res.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    foodName: parsed.name || "Unknown food",
    calories: Number(parsed.calories) || 0,
    protein: Number(parsed.protein) || 0,
    carbs: Number(parsed.carbs) || 0,
    fat: Number(parsed.fat) || 0,
    provider: "gemini",
    model
  };
}

async function geminiRecognize({ imagePath }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const imageBytes = await fs.readFile(imagePath);
  const base64 = imageBytes.toString("base64");
  const ext = path.extname(imagePath).toLowerCase();
  const mimeMap = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
  const mimeType = mimeMap[ext] || "image/jpeg";

  for (const model of GEMINI_MODELS) {
    try {
      return await callGemini({ apiKey, model, mimeType, base64 });
    } catch (e) {
      console.warn(`Gemini ${model} failed: ${e?.message?.slice(0, 100)}`);
    }
  }
  return null;
}

// --- Hugging Face fallback (food image classification) ---

async function hfRecognize({ imagePath }) {
  const token = process.env.HF_API_TOKEN;
  const model = process.env.HF_MODEL || "nateraw/food";
  if (!token) return null;

  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
  const bytes = await fs.readFile(imagePath);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: bytes
  });

  if (!res.ok) return null;

  const json = await res.json();
  const top = Array.isArray(json) ? json[0] : null;
  if (!top?.label) return null;

  return {
    foodName: String(top.label).replace(/_/g, " "),
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    provider: "huggingface",
    needsNutritionLookup: true
  };
}

// --- Main entry ---

async function recognizeFoodFromImage({ imagePath }) {
  // Try Gemini first (identifies food + estimates macros)
  try {
    const gemini = await geminiRecognize({ imagePath });
    if (gemini) return gemini;
  } catch (e) {
    console.error("Gemini failed:", e?.message);
  }

  // Try Hugging Face (identifies food name only, macros via USDA)
  try {
    const hf = await hfRecognize({ imagePath });
    if (hf) return hf;
  } catch (e) {
    console.error("HF failed:", e?.message);
  }

  // Last resort stub
  return {
    foodName: "Unknown food",
    calories: 0, protein: 0, carbs: 0, fat: 0,
    provider: "stub"
  };
}

module.exports = { recognizeFoodFromImage };
