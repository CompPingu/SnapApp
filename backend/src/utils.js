function startOfLocalDayISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfLocalDayISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function isWithinISO(iso, startISO, endISO) {
  const t = new Date(iso).getTime();
  return t >= new Date(startISO).getTime() && t <= new Date(endISO).getTime();
}

function sumMeals(meals) {
  return meals.reduce(
    (acc, m) => {
      acc.calories += Number(m.calories || 0);
      acc.protein += Number(m.protein || 0);
      return acc;
    },
    { calories: 0, protein: 0 }
  );
}

module.exports = {
  startOfLocalDayISO,
  endOfLocalDayISO,
  isWithinISO,
  sumMeals
};


