import db from "./index";

export interface Budget {
  id: number;
  budget_limit: number;
  category: string;
  time_frame: "day" | "week" | "month";
  user_id: number;
}

export function listBudgetsForUser(userId: number): Budget[] {
  return db
    .prepare("SELECT * FROM budgets WHERE user_id = ? ORDER BY category ASC")
    .all(userId) as Budget[];
}

export function findBudgetById(id: number): Budget | undefined {
  return db.prepare("SELECT * FROM budgets WHERE id = ?").get(id) as
    | Budget
    | undefined;
}

// Lets us return a friendly "category already exists" error before inserting.
export function findBudgetByCategory(
  userId: number,
  category: string
): Budget | undefined {
  return db
    .prepare("SELECT * FROM budgets WHERE user_id = ? AND category = ?")
    .get(userId, category) as Budget | undefined;
}

export function createBudget(input: {
  budgetLimit: number;
  category: string;
  timeFrame: string;
  userId: number;
}): Budget {
  const result = db
    .prepare(
      "INSERT INTO budgets (budget_limit, category, time_frame, user_id) VALUES (?, ?, ?, ?)"
    )
    .run(input.budgetLimit, input.category, input.timeFrame, input.userId);

  return findBudgetById(result.lastInsertRowid as number)!;
}

// category can't be changed here - delete and re-add instead.
export function updateBudget(
  id: number,
  updates: { budgetLimit?: number; timeFrame?: string }
): Budget | undefined {
  const existing = findBudgetById(id);
  if (!existing) return undefined;

  const budgetLimit = updates.budgetLimit ?? existing.budget_limit;
  const timeFrame = updates.timeFrame ?? existing.time_frame;

  db.prepare(
    "UPDATE budgets SET budget_limit = ?, time_frame = ? WHERE id = ?"
  ).run(budgetLimit, timeFrame, id);

  return findBudgetById(id);
}

export function deleteBudget(id: number): boolean {
  const result = db.prepare("DELETE FROM budgets WHERE id = ?").run(id);
  return result.changes > 0;
}
