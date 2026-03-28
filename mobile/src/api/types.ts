export type Meal = {
  id: string;
  timestamp: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "manual" | "scan";
  image?: string;
};

export type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Goals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type TodayResponse = {
  date: string;
  totals: Totals;
  meals: Meal[];
  goals: Goals;
};

export type HistoryDay = {
  date: string;
  totals: Totals;
  meals: Meal[];
};

export type HistoryResponse = {
  days: number;
  items: HistoryDay[];
};
