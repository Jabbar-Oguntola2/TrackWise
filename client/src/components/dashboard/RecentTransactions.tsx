import { Transaction } from "../../types";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="dashboard-card">
      <h2>Recent activity</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <ul className="transaction-list">
          {transactions.map((t) => (
            // type+id is unique; id alone isn't (expenses and incomes both start at 1).
            <li key={`${t.type}-${t.id}`} className={`transaction-item transaction-${t.type}`}>
              <span>{t.category}</span>
              <span className="transaction-date">{t.date}</span>
              <span className="transaction-cost">
                {t.type === "income" ? "+" : "-"}${t.cost.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
