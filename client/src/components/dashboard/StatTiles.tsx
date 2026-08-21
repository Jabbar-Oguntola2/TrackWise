import { PeriodTotal } from "../../types";

// Same lookup as CategoryChart's PERIOD_LABELS.
const PERIOD_LABELS: Record<"day" | "week" | "month", string> = {
  day: "today",
  week: "this week",
  month: "this month",
};

// Shows income/expense/balance totals for the selected period.
export function StatTiles({
  totals,
  period,
}: {
  totals: PeriodTotal | null;
  period: "day" | "week" | "month";
}) {
  if (!totals) {
    return <p>No activity yet {PERIOD_LABELS[period]}.</p>;
  }

  return (
    <div className="stat-tiles">
      <div className="stat-tile">
        <span className="stat-label">Income</span>
        <span className="stat-value income">${totals.incomes.toFixed(2)}</span>
      </div>
      <div className="stat-tile">
        <span className="stat-label">Expenses</span>
        <span className="stat-value expense">${totals.expenses.toFixed(2)}</span>
      </div>
      <div className="stat-tile">
        <span className="stat-label">Balance</span>
        <span className={`stat-value ${totals.balance >= 0 ? "income" : "expense"}`}>
          ${totals.balance.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
