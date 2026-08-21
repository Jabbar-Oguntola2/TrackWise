import { api } from "./client";
import { Expense } from "../types";

export function listExpenses() {
  return api.get<{ expenses: Expense[] }>("/expenses");
}

export function createExpense(input: { cost: number; category: string }) {
  return api.post<{ expense: Expense }>("/expenses", input);
}

export function updateExpense(
  id: number,
  input: { cost?: number; category?: string }
) {
  return api.patch<{ expense: Expense }>(`/expenses/${id}`, input);
}

export function deleteExpense(id: number) {
  return api.del<{ message: string }>(`/expenses/${id}`);
}
