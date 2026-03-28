require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const { randomUUID } = require("crypto");

const { addMeal, readMeals, deleteMeal, updateMeal, readGoals, writeGoals } = require("./storage");
const { recognizeFoodFromImage } = require("./vision");
const { getNutritionForFoodName } = require("./usda");
const { startOfLocalDayISO, endOfLocalDayISO, isWithinISO, sumMeals } = require("./utils");

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const USDA_API_KEY = process.env.USDA_API_KEY || "";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        cb(null, UPLOADS_DIR);
      } catch (e) {
        cb(e);
      }
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || ".jpg") || ".jpg";
      const safeExt = ext.length <= 10 ? ext : ".jpg";
      const id = randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      cb(null, `${id}${safeExt}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/uploads", express.static(UPLOADS_DIR));

// --- Goals ---

app.get("/api/goals", async (_req, res) => {
  const goals = await readGoals();
  res.json(goals);
});

app.put("/api/goals", async (req, res) => {
  const { calories, protein, carbs, fat } = req.body || {};
  const goals = {
    calories: Number(calories || 2000),
    protein: Number(protein || 150),
    carbs: Number(carbs || 250),
    fat: Number(fat || 65)
  };
  await writeGoals(goals);
  res.json(goals);
});

// --- Today ---

app.get("/api/today", async (_req, res) => {
  const { meals } = await readMeals();
  const start = startOfLocalDayISO();
  const end = endOfLocalDayISO();
  const todayMeals = meals.filter((m) => isWithinISO(m.timestamp, start, end));
  const totals = sumMeals(todayMeals);
  const goals = await readGoals();
  res.json({ date: start.slice(0, 10), totals, meals: todayMeals, goals });
});

// --- History ---

app.get("/api/history", async (req, res) => {
  const days = Number(req.query.days || 14);
  const { meals } = await readMeals();
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - Math.max(1, Math.min(365, days - 1)));
  start.setHours(0, 0, 0, 0);

  const filtered = meals.filter((m) => new Date(m.timestamp).getTime() >= start.getTime());

  const byDate = {};
  for (const m of filtered) {
    const date = m.timestamp.slice(0, 10);
    if (!byDate[date]) byDate[date] = { date, totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }, meals: [] };
    byDate[date].meals.push(m);
    byDate[date].totals.calories += Number(m.calories || 0);
    byDate[date].totals.protein += Number(m.protein || 0);
    byDate[date].totals.carbs += Number(m.carbs || 0);
    byDate[date].totals.fat += Number(m.fat || 0);
  }

  const items = Object.values(byDate).sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json({ days, items });
});

// --- Meals CRUD ---

app.post("/api/meals", async (req, res) => {
  const { name, calories, protein, carbs, fat, timestamp } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const meal = {
    id: randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: timestamp || new Date().toISOString(),
    name: String(name),
    calories: Number(calories || 0),
    protein: Number(protein || 0),
    carbs: Number(carbs || 0),
    fat: Number(fat || 0),
    source: "manual"
  };
  await addMeal(meal);
  res.json({ meal });
});

app.patch("/api/meals/:id", async (req, res) => {
  const { name, calories, protein, carbs, fat } = req.body || {};
  const updates = {};
  if (name !== undefined) updates.name = String(name);
  if (calories !== undefined) updates.calories = Number(calories);
  if (protein !== undefined) updates.protein = Number(protein);
  if (carbs !== undefined) updates.carbs = Number(carbs);
  if (fat !== undefined) updates.fat = Number(fat);

  const meal = await updateMeal(req.params.id, updates);
  if (!meal) return res.status(404).json({ error: "meal not found" });
  res.json({ meal });
});

app.delete("/api/meals/:id", async (req, res) => {
  const ok = await deleteMeal(req.params.id);
  res.json({ ok });
});

// --- Scan ---

app.post("/api/scan", upload.single("image"), async (req, res) => {
  if (!req.file?.path) return res.status(400).json({ error: "image file is required (field name: image)" });

  const imagePath = req.file.path;
  const vision = await recognizeFoodFromImage({ imagePath });

  let { calories, protein, carbs, fat } = vision;

  // If the vision provider only identified the name (HF/stub), look up nutrition via USDA
  if (vision.needsNutritionLookup && USDA_API_KEY) {
    try {
      const nutrition = await getNutritionForFoodName({ apiKey: USDA_API_KEY, foodName: vision.foodName });
      calories = nutrition.calories ?? 0;
      protein = nutrition.protein ?? 0;
      carbs = nutrition.carbs ?? 0;
      fat = nutrition.fat ?? 0;
    } catch (e) {
      console.warn("USDA lookup failed:", e?.message);
    }
  }

  const meal = {
    id: randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    name: vision.foodName,
    calories: calories ?? 0,
    protein: protein ?? 0,
    carbs: carbs ?? 0,
    fat: fat ?? 0,
    source: "scan",
    image: `/uploads/${path.basename(imagePath)}`,
    meta: { vision }
  };

  await addMeal(meal);

  res.json({ meal, debug: { vision } });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
