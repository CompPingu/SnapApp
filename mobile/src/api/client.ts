import { API_URL } from "../config";
import type { Goals, HistoryResponse, Meal, TodayResponse } from "./types";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  return (await res.json()) as T;
}

export async function fetchToday(): Promise<TodayResponse> {
  return await http<TodayResponse>("/api/today");
}

export async function fetchHistory(days = 14): Promise<HistoryResponse> {
  return await http<HistoryResponse>(`/api/history?days=${encodeURIComponent(String(days))}`);
}

export async function fetchGoals(): Promise<Goals> {
  return await http<Goals>("/api/goals");
}

export async function saveGoals(goals: Goals): Promise<Goals> {
  return await http<Goals>("/api/goals", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goals)
  });
}

export async function addMealManual(input: {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp?: string;
}) {
  return await http<{ meal: Meal }>("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}

export async function updateMeal(
  id: string,
  updates: Partial<Pick<Meal, "name" | "calories" | "protein" | "carbs" | "fat">>
) {
  return await http<{ meal: Meal }>(`/api/meals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  });
}

export async function deleteMeal(id: string) {
  return await http<{ ok: boolean }>(`/api/meals/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function scanFoodImage(image: { uri: string; name: string; type: string }) {
  const form = new FormData();
  form.append("image", image as any);

  return await http<{ meal: Meal; debug: any }>("/api/scan", {
    method: "POST",
    body: form
  });
}
