import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  getTotalsByPeriod,
  getCategoryBreakdown,
  getTopCategories,
  getBudgetStatuses,
  getRecentTransactions,
  Period,
  BreakdownPeriod,
} from "../db/analytics";

const router = Router();
router.use(requireAuth);

const VALID_PERIODS = ["day", "week", "month"];
const VALID_BREAKDOWN_PERIODS = ["day", "week", "month", "all"];

function parseLimit(raw: unknown, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

router.get("/totals", (req, res) => {
  const period = (req.query.period as string) || "month";
  if (!VALID_PERIODS.includes(period)) {
    res.status(400).json({ error: "period must be one of: day, week, month" });
    return;
  }

  const totals = getTotalsByPeriod(req.session.userId!, period as Period);
  res.json({ totals });
});

router.get("/categories", (req, res) => {
  const period = (req.query.period as string) || "month";
  if (!VALID_BREAKDOWN_PERIODS.includes(period)) {
    res
      .status(400)
      .json({ error: "period must be one of: day, week, month, all" });
    return;
  }

  const breakdown = getCategoryBreakdown(
    req.session.userId!,
    period as BreakdownPeriod
  );
  res.json({ breakdown });
});

router.get("/top-categories", (req, res) => {
  const limit = parseLimit(req.query.limit, 3);
  const topCategories = getTopCategories(req.session.userId!, limit);
  res.json({ topCategories });
});

router.get("/budgets", (req, res) => {
  const budgets = getBudgetStatuses(req.session.userId!);
  res.json({ budgets });
});

router.get("/recent-transactions", (req, res) => {
  const limit = parseLimit(req.query.limit, 3);
  const transactions = getRecentTransactions(req.session.userId!, limit);
  res.json({ transactions });
});

export default router;
