require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const { randomUUID } = require("crypto");

const { addMeal, readMeals, deleteMeal } = require("./storage");
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
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/api/today", async (_req, res) => {
  const { meals } = await readMeals();
  const start = startOfLocalDayISO();
  const end = endOfLocalDayISO();
  const todayMeals = meals.filter((m) => isWithinISO(m.timestamp, start, end));
  const totals = sumMeals(todayMeals);
  res.json({ date: start.slice(0, 10), totals, meals: todayMeals });
});

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
    if (!byDate[date]) byDate[date] = { date, totals: { calories: 0, protein: 0 }, meals: [] };
    byDate[date].meals.push(m);
    byDate[date].totals.calories += Number(m.calories || 0);
    byDate[date].totals.protein += Number(m.protein || 0);
  }

  const items = Object.values(byDate).sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json({ days, items });
});

app.post("/api/meals", async (req, res) => {
  const { name, calories, protein, timestamp } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const meal = {
    id: randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: timestamp || new Date().toISOString(),
    name: String(name),
    calories: Number(calories || 0),
    protein: Number(protein || 0),
    source: "manual"
  };
  await addMeal(meal);
  res.json({ meal });
});

app.delete("/api/meals/:id", async (req, res) => {
  const ok = await deleteMeal(req.params.id);
  res.json({ ok });
});

app.post("/api/scan", upload.single("image"), async (req, res) => {
  if (!req.file?.path) return res.status(400).json({ error: "image file is required (field name: image)" });

  const imagePath = req.file.path;
  const vision = await recognizeFoodFromImage({ imagePath });

  let nutrition = { calories: null, protein: null, source: "usda" };
  let nutritionError = null;

  try {
    nutrition = await getNutritionForFoodName({ apiKey: USDA_API_KEY, foodName: vision.foodName });
  } catch (e) {
    nutritionError = e?.message || String(e);
  }

  const meal = {
    id: randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    name: vision.foodName,
    calories: nutrition.calories ?? 0,
    protein: nutrition.protein ?? 0,
    source: "scan",
    image: `/uploads/${path.basename(imagePath)}`,
    meta: {
      vision,
      nutrition: nutritionError ? { error: nutritionError } : nutrition
    }
  };

  await addMeal(meal);

  res.json({
    meal,
    debug: {
      vision,
      nutrition,
      nutritionError
    }
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});


