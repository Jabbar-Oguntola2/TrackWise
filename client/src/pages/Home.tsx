import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getTotals,
  getCategoryBreakdown,
  getTopCategories,
  getBudgetStatuses,
  getRecentTransactions,
} from "../api/analytics";
import {
  PeriodTotal,
  CategoryBreakdown as CategoryBreakdownData,
  CategoryTotal,
  BudgetStatus,
  Transaction,
} from "../types";
import { StatTiles } from "../components/dashboard/StatTiles";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { BudgetList } from "../components/dashboard/BudgetList";
import { TopCategories } from "../components/dashboard/TopCategories";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";

type Period = "day" | "week" | "month";
const PERIODS: Period[] = ["day", "week", "month"];

// Pulls from all five analytics endpoints and hands results to widgets as props.
export function Home() {
  const { user } = useAuth();

  const [period, setPeriod] = useState<Period>("month");
  const [thisPeriod, setThisPeriod] = useState<PeriodTotal | null>(null);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownData[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryTotal[]>([]);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Runs once - nothing here depends on the period toggle.
  useEffect(() => {
    async function loadStatic() {
      const [topCategoriesData, budgetsData, transactionsData] = await Promise.all([
        getTopCategories(3),
        getBudgetStatuses(),
        getRecentTransactions(5),
      ]);
      setTopCategories(topCategoriesData.topCategories);
      setBudgets(budgetsData.budgets);
      setTransactions(transactionsData.transactions);
      setLoading(false);
    }
    loadStatic();
  }, []);

  // Re-runs whenever period changes - this is the toggle.
  useEffect(() => {
    async function loadPeriodData() {
      const [totalsData, breakdownData] = await Promise.all([
        getTotals(period),
        getCategoryBreakdown(period),
      ]);
      setThisPeriod(totalsData.totals[0] ?? null);
      setBreakdown(breakdownData.breakdown);
    }
    loadPeriodData();
  }, [period]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}</h1>
        <div className="period-toggle">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={p === period ? "active" : ""}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <StatTiles totals={thisPeriod} period={period} />

      <div className="dashboard-grid">
        <CategoryChart data={breakdown} period={period} />
        <BudgetList budgets={budgets} />
        <TopCategories categories={topCategories} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}
