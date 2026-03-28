const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const MEALS_FILE = path.join(DATA_DIR, "meals.json");
const GOALS_FILE = path.join(DATA_DIR, "goals.json");

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

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

async function updateMeal(id, updates) {
  const data = await readMeals();
  const idx = data.meals.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  data.meals[idx] = { ...data.meals[idx], ...updates, id };
  await writeMeals(data);
  return data.meals[idx];
}

async function deleteMeal(id) {
  const data = await readMeals();
  const before = data.meals.length;
  data.meals = data.meals.filter((m) => m.id !== id);
  await writeMeals(data);
  return data.meals.length !== before;
}

async function readGoals() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(GOALS_FILE, "utf8");
    return { ...DEFAULT_GOALS, ...JSON.parse(raw || "{}") };
  } catch {
    return { ...DEFAULT_GOALS };
  }
}

async function writeGoals(goals) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(GOALS_FILE, JSON.stringify(goals, null, 2), "utf8");
}

module.exports = {
  readMeals,
  writeMeals,
  addMeal,
  updateMeal,
  deleteMeal,
  readGoals,
  writeGoals,
  MEALS_FILE
};
