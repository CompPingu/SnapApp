/**
 * Vision provider (food recognition from an image).
 *
 * Default: a simple stub (free, offline).
 * Optional (free-tier): Hugging Face Inference API if you set:
 *   - HF_API_TOKEN=...
 *   - (optional) HF_MODEL=nateraw/food
 *
 * Notes:
 * - HF free-tier is rate-limited; if it errors, we fall back to the stub.
 */

const fs = require("fs/promises");
const path = require("path");

function stubGuess(imagePath) {
  const base = path.basename(imagePath).toLowerCase();
  const hints = ["apple", "banana", "chicken", "rice", "salad", "yogurt", "egg", "oats"];
  const hit = hints.find((h) => base.includes(h));
  return {
    foodName: hit || "apple",
    confidence: hit ? 0.6 : 0.2,
    provider: "stub"
  };
}

async function hfRecognize({ imagePath }) {
  const token = process.env.HF_API_TOKEN;
  const model = process.env.HF_MODEL || "nateraw/food";
  if (!token) return null;

  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
  const bytes = await fs.readFile(imagePath);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: bytes
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HF inference failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  // Expected shape: [{ label: "pizza", score: 0.87 }, ...]
  const top = Array.isArray(json) ? json[0] : null;
  const label = top?.label ? String(top.label) : null;
  const score = typeof top?.score === "number" ? top.score : null;
  if (!label) return null;

  return {
    foodName: label,
    confidence: score ?? 0,
    provider: "huggingface",
    model
  };
}

async function recognizeFoodFromImage({ imagePath }) {
  try {
    const hf = await hfRecognize({ imagePath });
    if (hf) return hf;
  } catch {
    // Ignore and fall back to stub.
  }
  return stubGuess(imagePath);
}

module.exports = { recognizeFoodFromImage };


