import { api } from "./client";
import { Budget } from "../types";

type TimeFrame = "day" | "week" | "month";

export function listBudgets() {
  return api.get<{ budgets: Budget[] }>("/budgets");
}

export function createBudget(input: {
  limit: number;
  category: string;
  timeFrame: TimeFrame;
}) {
  return api.post<{ budget: Budget }>("/budgets", input);
}

export function updateBudget(
  id: number,
  input: { limit?: number; timeFrame?: TimeFrame }
) {
  return api.patch<{ budget: Budget }>(`/budgets/${id}`, input);
}

export function deleteBudget(id: number) {
  return api.del<{ message: string }>(`/budgets/${id}`);
}
