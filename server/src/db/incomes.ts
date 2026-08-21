import db from "./index";

export interface Income {
  id: number;
  cost: number;
  date: string;
  time: string;
  category: string;
  user_id: number;
}

export function listIncomesForUser(userId: number): Income[] {
  return db
    .prepare(
      "SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC, time DESC"
    )
    .all(userId) as Income[];
}

export function findIncomeById(id: number): Income | undefined {
  return db.prepare("SELECT * FROM incomes WHERE id = ?").get(id) as
    | Income
    | undefined;
}

export function createIncome(input: {
  cost: number;
  category: string;
  date: string;
  time: string;
  userId: number;
}): Income {
  const result = db
    .prepare(
      "INSERT INTO incomes (cost, date, time, category, user_id) VALUES (?, ?, ?, ?, ?)"
    )
    .run(input.cost, input.date, input.time, input.category, input.userId);

  return findIncomeById(result.lastInsertRowid as number)!;
}

export function updateIncome(
  id: number,
  updates: { cost?: number; category?: string }
): Income | undefined {
  const existing = findIncomeById(id);
  if (!existing) return undefined;

  const cost = updates.cost ?? existing.cost;
  const category = updates.category ?? existing.category;

  db.prepare("UPDATE incomes SET cost = ?, category = ? WHERE id = ?").run(
    cost,
    category,
    id
  );

  return findIncomeById(id);
}

export function deleteIncome(id: number): boolean {
  const result = db.prepare("DELETE FROM incomes WHERE id = ?").run(id);
  return result.changes > 0;
}
