import { FormEvent, useEffect, useState } from "react";
import { Income } from "../types";
import {
  listIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../api/incomes";
import { ApiError } from "../api/client";

// Structural twin of ExpensesPage, "income" instead of "expense".
export function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cost, setCost] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCost, setEditCost] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    loadIncomes();
  }, []);

  async function loadIncomes() {
    try {
      const data = await listIncomes();
      setIncomes(data.incomes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load incomes");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await createIncome({ cost: Number(cost), category });
      setIncomes((prev) => [data.income, ...prev]);
      setCost("");
      setCategory("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add income");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(income: Income) {
    setEditingId(income.id);
    setEditCost(String(income.cost));
    setEditCategory(income.category);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: number) {
    try {
      const data = await updateIncome(id, {
        cost: Number(editCost),
        category: editCategory,
      });
      setIncomes((prev) => prev.map((i) => (i.id === id ? data.income : i)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update income");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this income?")) return;

    try {
      await deleteIncome(id);
      setIncomes((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete income");
    }
  }

  if (loading) return <p>Loading incomes...</p>;

  return (
    <div className="crud-page">
      <h1>Incomes</h1>

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
          {submitting ? "Adding..." : "Add income"}
        </button>
      </form>

      {incomes.length === 0 ? (
        <p>No incomes yet.</p>
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
            {incomes.map((income) => (
              <tr key={income.id}>
                {editingId === income.id ? (
                  <>
                    <td>{income.date}</td>
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
                      <button onClick={() => saveEdit(income.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{income.date}</td>
                    <td>{income.category}</td>
                    <td>${income.cost.toFixed(2)}</td>
                    <td>
                      <button onClick={() => startEdit(income)}>Edit</button>
                      <button onClick={() => handleDelete(income.id)}>Delete</button>
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
