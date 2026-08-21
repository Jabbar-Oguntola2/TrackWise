import { BudgetStatus } from "../../types";

export function BudgetList({ budgets }: { budgets: BudgetStatus[] }) {
  return (
    <div className="dashboard-card">
      <h2>Budgets</h2>
      {budgets.length === 0 ? (
        <p>No budgets set up yet.</p>
      ) : (
        <ul className="budget-list">
          {budgets.map((budget) => (
            <li key={budget.id} className={`budget-item budget-${budget.status}`}>
              <div className="budget-item-header">
                <span>
                  {budget.category}{" "}
                  <span className="budget-timeframe">per {budget.timeFrame}</span>
                </span>
                <span>{budget.percentage}%</span>
              </div>
              <div className="budget-bar">
                <div
                  className="budget-bar-fill"
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <p className="budget-message">{budget.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
