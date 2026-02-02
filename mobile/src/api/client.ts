import { API_URL } from "../config";
import type { HistoryResponse, TodayResponse } from "./types";

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

export async function addMealManual(input: {
  name: string;
  calories: number;
  protein: number;
  timestamp?: string;
}) {
  return await http<{ meal: any }>("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}

export async function deleteMeal(id: string) {
  return await http<{ ok: boolean }>(`/api/meals/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function scanFoodImage(image: { uri: string; name: string; type: string }) {
  const form = new FormData();
  // React Native FormData expects a "file" object with uri/name/type.
  form.append("image", image as any);

  return await http<{ meal: any; debug: any }>("/api/scan", {
    method: "POST",
    body: form
    // NOTE: do not set Content-Type; fetch will set multipart boundary.
  });
}


