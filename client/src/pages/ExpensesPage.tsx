import { FormEvent, useEffect, useState } from "react";
import { Expense } from "../types";
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api/expenses";
import { ApiError } from "../api/client";

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The "add new expense" form's own state.
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Which row (if any) is currently being edited, plus its draft values.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCost, setEditCost] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      const data = await listExpenses();
      setExpenses(data.expenses);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await createExpense({ cost: Number(cost), category });
      // Builds off the previous array instead of the outer variable.
      setExpenses((prev) => [data.expense, ...prev]);
      setCost("");
      setCategory("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    setEditCost(String(expense.cost));
    setEditCategory(expense.category);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: number) {
    try {
      const data = await updateExpense(id, {
        cost: Number(editCost),
        category: editCategory,
      });
      setExpenses((prev) => prev.map((e) => (e.id === id ? data.expense : e)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update expense");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete expense");
    }
  }

  if (loading) return <p>Loading expenses...</p>;

  return (
    <div className="crud-page">
      <h1>Expenses</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="number"
          step="0.01"
          placeholder="Cost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add expense"}
        </button>
      </form>

      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Cost</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                {editingId === expense.id ? (
                  <>
                    <td>{expense.date}</td>
                    <td>
                      <input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                      />
                    </td>
                    <td>
                      <button onClick={() => saveEdit(expense.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{expense.date}</td>
                    <td>{expense.category}</td>
                    <td>${expense.cost.toFixed(2)}</td>
                    <td>
                      <button onClick={() => startEdit(expense)}>Edit</button>
                      <button onClick={() => handleDelete(expense.id)}>Delete</button>
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
