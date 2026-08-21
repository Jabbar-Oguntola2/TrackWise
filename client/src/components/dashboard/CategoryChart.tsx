import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CategoryBreakdown } from "../../types";

// Kept in sync with the --chart-1..6 tokens in index.css - SVG can't read CSS vars.
const COLORS = ["#2dd4bf", "#60a5fa", "#f5a623", "#f46a6a", "#7a6fd0", "#64748b"];

// Same lookup-table pattern as the server's PERIOD_FORMATS.
const PERIOD_LABELS: Record<"day" | "week" | "month", string> = {
  day: "today",
  week: "this week",
  month: "this month",
};

export function CategoryChart({
  data,
  period,
}: {
  data: CategoryBreakdown[];
  period: "day" | "week" | "month";
}) {
  const label = PERIOD_LABELS[period];

  if (data.length === 0) {
    return (
      <div className="dashboard-card">
        <h2>Spending by category</h2>
        <p>No expenses logged {label} yet.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2>Spending by category ({label})</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
          >
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* No on-slice labels - they collide on narrow charts; shown on hover/legend instead. */}
          <Tooltip
            formatter={(value: number, _name, entry: any) => [
              `$${value.toFixed(2)}`,
              entry.payload.category,
            ]}
          />
          <Legend formatter={(value: string, entry: any) => `${value} — ${entry.payload.percentage}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
