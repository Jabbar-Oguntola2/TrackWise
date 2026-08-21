import { api } from "./client";
import {
  PeriodTotal,
  CategoryBreakdown,
  CategoryTotal,
  BudgetStatus,
  Transaction,
} from "../types";

type Period = "day" | "week" | "month";
type BreakdownPeriod = Period | "all";

export function getTotals(period: Period = "month") {
  return api.get<{ totals: PeriodTotal[] }>(`/analytics/totals?period=${period}`);
}

export function getCategoryBreakdown(period: BreakdownPeriod = "month") {
  return api.get<{ breakdown: CategoryBreakdown[] }>(
    `/analytics/categories?period=${period}`
  );
}

export function getTopCategories(limit = 3) {
  return api.get<{ topCategories: CategoryTotal[] }>(
    `/analytics/top-categories?limit=${limit}`
  );
}

export function getBudgetStatuses() {
  return api.get<{ budgets: BudgetStatus[] }>("/analytics/budgets");
}

export function getRecentTransactions(limit = 5) {
  return api.get<{ transactions: Transaction[] }>(
    `/analytics/recent-transactions?limit=${limit}`
  );
}
