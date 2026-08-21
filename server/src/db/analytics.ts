import db from "./index";
import { Budget } from "./budgets";

export type Period = "day" | "week" | "month";
export type BreakdownPeriod = Period | "all";

// strftime() format for grouping dates into each period.
const PERIOD_FORMATS: Record<Period, string> = {
  day: "%Y-%m-%d",
  week: "%Y-W%W",
  month: "%Y-%m",
};

// Asks SQLite for "today", already formatted as the given period's key.
function currentPeriodKey(period: Period): string {
  const today = new Date().toISOString().slice(0, 10);
  const row = db
    .prepare("SELECT strftime(?, ?) AS key")
    .get(PERIOD_FORMATS[period], today) as { key: string };
  return row.key;
}

export interface PeriodTotal {
  period: string;
  expenses: number;
  incomes: number;
  balance: number;
}

export function getTotalsByPeriod(
  userId: number,
  period: Period
): PeriodTotal[] {
  const format = PERIOD_FORMATS[period];

  const expenseRows = db
    .prepare(
      "SELECT strftime(?, date) AS period, SUM(cost) AS total FROM expenses WHERE user_id = ? GROUP BY period"
    )
    .all(format, userId) as { period: string; total: number }[];

  const incomeRows = db
    .prepare(
      "SELECT strftime(?, date) AS period, SUM(cost) AS total FROM incomes WHERE user_id = ? GROUP BY period"
    )
    .all(format, userId) as { period: string; total: number }[];

  const totals = new Map<string, { expenses: number; incomes: number }>();

  for (const row of expenseRows) {
    totals.set(row.period, { expenses: row.total, incomes: 0 });
  }
  for (const row of incomeRows) {
    const existing = totals.get(row.period);
    if (existing) {
      existing.incomes = row.total;
    } else {
      totals.set(row.period, { expenses: 0, incomes: row.total });
    }
  }

  return Array.from(totals.entries())
    .map(([period, { expenses, incomes }]) => ({
      period,
      expenses,
      incomes,
      balance: incomes - expenses,
    }))
    .sort((a, b) => (a.period < b.period ? 1 : -1));
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

// Categories come straight from the data - never hardcoded.
export function getCategoryBreakdown(
  userId: number,
  period: BreakdownPeriod
): CategoryBreakdown[] {
  const rows =
    period === "all"
      ? (db
          .prepare(
            "SELECT category, SUM(cost) AS total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC"
          )
          .all(userId) as { category: string; total: number }[])
      : (db
          .prepare(
            "SELECT category, SUM(cost) AS total FROM expenses WHERE user_id = ? AND strftime(?, date) = ? GROUP BY category ORDER BY total DESC"
          )
          .all(userId, PERIOD_FORMATS[period], currentPeriodKey(period)) as {
            category: string;
            total: number;
          }[]);

  const overallTotal = rows.reduce((sum, row) => sum + row.total, 0);
  if (overallTotal === 0) return [];

  return rows.map((row) => ({
    category: row.category,
    total: row.total,
    percentage: Math.round((row.total / overallTotal) * 10000) / 100,
  }));
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export function getTopCategories(
  userId: number,
  limit = 3
): CategoryTotal[] {
  return db
    .prepare(
      "SELECT category, SUM(cost) AS total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC LIMIT ?"
    )
    .all(userId, limit) as CategoryTotal[];
}

export interface BudgetStatus {
  id: number;
  category: string;
  timeFrame: "day" | "week" | "month";
  limit: number;
  spent: number;
  percentage: number;
  status: "ok" | "warning" | "over";
  message: string;
}

export function getBudgetStatuses(userId: number): BudgetStatus[] {
  const budgets = db
    .prepare("SELECT * FROM budgets WHERE user_id = ?")
    .all(userId) as Budget[];

  return budgets.map((budget) => {
    const row = db
      .prepare(
        "SELECT SUM(cost) AS total FROM expenses WHERE user_id = ? AND category = ? AND strftime(?, date) = ?"
      )
      .get(
        userId,
        budget.category,
        PERIOD_FORMATS[budget.time_frame],
        currentPeriodKey(budget.time_frame)
      ) as { total: number | null };

    // SUM() returns NULL, not 0, when nothing matches - ?? catches that.
    const spent = row.total ?? 0;
    const percentage =
      Math.round((spent / budget.budget_limit) * 10000) / 100;

    let status: "ok" | "warning" | "over";
    let message: string;

    if (spent > budget.budget_limit) {
      status = "over";
      message = `❌ You are over your ${budget.category} budget.`;
    } else if (percentage <= 50) {
      status = "ok";
      message = `✅ You have used ${percentage}% of your ${budget.category} budget.`;
    } else {
      status = "warning";
      message = `⚠️ You have used ${percentage}% of your ${budget.category} budget.`;
    }

    return {
      id: budget.id,
      category: budget.category,
      timeFrame: budget.time_frame,
      limit: budget.budget_limit,
      spent,
      percentage,
      status,
      message,
    };
  });
}

interface TransactionRow {
  id: number;
  cost: number;
  category: string;
  date: string;
  time: string;
}

export interface Transaction {
  id: number;
  cost: number;
  category: string;
  date: string;
  time: string;
  type: "expense" | "income";
}

export function getRecentTransactions(
  userId: number,
  limit = 3
): Transaction[] {
  const expenseRows = db
    .prepare(
      "SELECT id, cost, category, date, time FROM expenses WHERE user_id = ?"
    )
    .all(userId) as TransactionRow[];

  const incomeRows = db
    .prepare(
      "SELECT id, cost, category, date, time FROM incomes WHERE user_id = ?"
    )
    .all(userId) as TransactionRow[];

  const combined: Transaction[] = [
    ...expenseRows.map((row) => ({ ...row, type: "expense" as const })),
    ...incomeRows.map((row) => ({ ...row, type: "income" as const })),
  ];

  combined.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.time < b.time ? 1 : -1;
  });

  return combined.slice(0, limit);
}
