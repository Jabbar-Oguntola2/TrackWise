import { CategoryTotal } from "../../types";

export function TopCategories({ categories }: { categories: CategoryTotal[] }) {
  return (
    <div className="dashboard-card">
      <h2>Top categories (all-time)</h2>
      {categories.length === 0 ? (
        <p>No expenses logged yet.</p>
      ) : (
        <ol className="top-categories-list">
          {categories.map((c) => (
            <li key={c.category}>
              <span>{c.category}</span>
              <span>${c.total.toFixed(2)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
