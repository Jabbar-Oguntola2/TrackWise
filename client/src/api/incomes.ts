import { api } from "./client";
import { Income } from "../types";

export function listIncomes() {
  return api.get<{ incomes: Income[] }>("/incomes");
}

export function createIncome(input: { cost: number; category: string }) {
  return api.post<{ income: Income }>("/incomes", input);
}

export function updateIncome(
  id: number,
  input: { cost?: number; category?: string }
) {
  return api.patch<{ income: Income }>(`/incomes/${id}`, input);
}

export function deleteIncome(id: number) {
  return api.del<{ message: string }>(`/incomes/${id}`);
}
