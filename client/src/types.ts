// Mirrors the server's db/*.ts response shapes.

export interface Expense {
  id: number;
  cost: number;
  date: string;
  time: string;
  category: string;
  user_id: number;
}

export interface Income {
  id: number;
  cost: number;
  date: string;
  time: string;
  category: string;
  user_id: number;
}

export interface Budget {
  id: number;
  budget_limit: number;
  category: string;
  time_frame: "day" | "week" | "month";
  user_id: number;
}

export interface PeriodTotal {
  period: string;
  expenses: number;
  incomes: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
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

export interface Transaction {
  id: number;
  cost: number;
  category: string;
  date: string;
  time: string;
  type: "expense" | "income";
}
