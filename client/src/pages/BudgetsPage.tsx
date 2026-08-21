import { FormEvent, useEffect, useState } from "react";
import { Budget } from "../types";
import {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/budgets";
import { ApiError } from "../api/client";

type TimeFrame = "day" | "week" | "month";

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLimit, setEditLimit] = useState("");
  const [editTimeFrame, setEditTimeFrame] = useState<TimeFrame>("month");

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    try {
      const data = await listBudgets();
      setBudgets(data.budgets);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await createBudget({ limit: Number(limit), category, timeFrame });
      setBudgets((prev) => [...prev, data.budget]);
      setCategory("");
      setLimit("");
      setTimeFrame("month");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add budget");
    } finally {
      setSubmitting(false);
    }
  }

  // No category here - the server won't let it change once set.
  function startEdit(budget: Budget) {
    setEditingId(budget.id);
    setEditLimit(String(budget.budget_limit));
    setEditTimeFrame(budget.time_frame);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: number) {
    try {
      const data = await updateBudget(id, {
        limit: Number(editLimit),
        timeFrame: editTimeFrame,
      });
      setBudgets((prev) => prev.map((b) => (b.id === id ? data.budget : b)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update budget");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this budget?")) return;

    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete budget");
    }
  }

  if (loading) return <p>Loading budgets...</p>;

  return (
    <div className="crud-page">
      <h1>Budgets</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          required
        />
        <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add budget"}
        </button>
      </form>

      {budgets.length === 0 ? (
        <p>No budgets yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Limit</th>
              <th>Time frame</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget.id}>
                {editingId === budget.id ? (
                  <>
                    <td>{budget.category}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={editTimeFrame}
                        onChange={(e) => setEditTimeFrame(e.target.value as TimeFrame)}
                      >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => saveEdit(budget.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{budget.category}</td>
                    <td>${budget.budget_limit.toFixed(2)}</td>
                    <td>{budget.time_frame}</td>
                    <td>
                      <button onClick={() => startEdit(budget)}>Edit</button>
                      <button onClick={() => handleDelete(budget.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
