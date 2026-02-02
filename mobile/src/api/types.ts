export type Meal = {
  id: string;
  timestamp: string; // ISO
  name: string;
  calories: number;
  protein: number;
  source: "manual" | "scan";
  image?: string; // backend-relative path (/uploads/...)
};

export type Totals = {
  calories: number;
  protein: number;
};

export type TodayResponse = {
  date: string; // YYYY-MM-DD
  totals: Totals;
  meals: Meal[];
};

export type HistoryDay = {
  date: string; // YYYY-MM-DD
  totals: Totals;
  meals: Meal[];
};

export type HistoryResponse = {
  days: number;
  items: HistoryDay[];
};


