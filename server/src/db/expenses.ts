import db from "./index";

export interface Expense {
  id: number;
  cost: number;
  date: string;
  time: string;
  category: string;
  user_id: number;
}

export function listExpensesForUser(userId: number): Expense[] {
  return db
    .prepare(
      "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, time DESC"
    )
    .all(userId) as Expense[];
}

export function findExpenseById(id: number): Expense | undefined {
  return db.prepare("SELECT * FROM expenses WHERE id = ?").get(id) as
    | Expense
    | undefined;
}

export function createExpense(input: {
  cost: number;
  category: string;
  date: string;
  time: string;
  userId: number;
}): Expense {
  const result = db
    .prepare(
      "INSERT INTO expenses (cost, date, time, category, user_id) VALUES (?, ?, ?, ?, ?)"
    )
    .run(input.cost, input.date, input.time, input.category, input.userId);

  return findExpenseById(result.lastInsertRowid as number)!;
}

// `??` not `||` - so a cost of 0 doesn't wrongly fall back to the old value.
export function updateExpense(
  id: number,
  updates: { cost?: number; category?: string }
): Expense | undefined {
  const existing = findExpenseById(id);
  if (!existing) return undefined;

  const cost = updates.cost ?? existing.cost;
  const category = updates.category ?? existing.category;

  db.prepare("UPDATE expenses SET cost = ?, category = ? WHERE id = ?").run(
    cost,
    category,
    id
  );

  return findExpenseById(id);
}

export function deleteExpense(id: number): boolean {
  const result = db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
  return result.changes > 0;
}
