/**
 * USDA FoodData Central (free, requires an API key):
 * https://fdc.nal.usda.gov/api-key-signup.html
 *
 * We use:
 * - POST /v1/foods/search  (search for food item)
 */

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

function pickNutrientsFromFdcFood(food) {
  const nutrients = food?.foodNutrients || [];
  const byName = new Map(
    nutrients
      .filter((n) => n?.nutrientName)
      .map((n) => [String(n.nutrientName).toLowerCase(), n])
  );

  const calories =
    byName.get("energy")?.value ??
    byName.get("energy, kcal")?.value ??
    byName.get("calories")?.value ??
    null;

  const protein = byName.get("protein")?.value ?? null;

  const carbs =
    byName.get("carbohydrate, by difference")?.value ??
    byName.get("carbohydrates")?.value ??
    byName.get("total carbohydrate")?.value ??
    null;

  const fat =
    byName.get("total lipid (fat)")?.value ??
    byName.get("fat")?.value ??
    byName.get("total fat")?.value ??
    null;

  return {
    calories: typeof calories === "number" ? calories : null,
    protein: typeof protein === "number" ? protein : null,
    carbs: typeof carbs === "number" ? carbs : null,
    fat: typeof fat === "number" ? fat : null
  };
}

async function usdaSearch({ apiKey, query, pageSize = 1 }) {
  if (!apiKey) {
    throw new Error("Missing USDA_API_KEY. Get one from https://fdc.nal.usda.gov/api-key-signup.html");
  }
  const res = await fetch(`${USDA_BASE}/foods/search?api_key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      pageSize
    })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`USDA search failed (${res.status}): ${text}`);
  }
  return await res.json();
}

async function getNutritionForFoodName({ apiKey, foodName }) {
  const results = await usdaSearch({ apiKey, query: foodName, pageSize: 5 });
  const foods = results?.foods || [];
  const best = foods[0];
  if (!best) {
    return { calories: null, protein: null, carbs: null, fat: null, source: "usda", note: "No match found" };
  }

  const { calories, protein, carbs, fat } = pickNutrientsFromFdcFood(best);

  return {
    calories,
    protein,
    carbs,
    fat,
    source: "usda",
    fdcId: best.fdcId,
    description: best.description
  };
}

module.exports = {
  getNutritionForFoodName
};
