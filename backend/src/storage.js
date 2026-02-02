const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const MEALS_FILE = path.join(DATA_DIR, "meals.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(MEALS_FILE);
  } catch {
    await fs.writeFile(MEALS_FILE, JSON.stringify({ meals: [] }, null, 2), "utf8");
  }
}

async function readMeals() {
  await ensureDataFile();
  const raw = await fs.readFile(MEALS_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}");
  if (!parsed.meals) parsed.meals = [];
  return parsed;
}

async function writeMeals(data) {
  await ensureDataFile();
  await fs.writeFile(MEALS_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function addMeal(meal) {
  const data = await readMeals();
  data.meals.unshift(meal);
  await writeMeals(data);
  return meal;
}

async function deleteMeal(id) {
  const data = await readMeals();
  const before = data.meals.length;
  data.meals = data.meals.filter((m) => m.id !== id);
  await writeMeals(data);
  return data.meals.length !== before;
}

module.exports = {
  readMeals,
  writeMeals,
  addMeal,
  deleteMeal,
  MEALS_FILE
};


