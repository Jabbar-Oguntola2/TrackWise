import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listBudgetsForUser,
  createBudget,
  findBudgetById,
  findBudgetByCategory,
  updateBudget,
  deleteBudget,
} from "../db/budgets";

const router = Router();
router.use(requireAuth);

// Must match schema.sql's CHECK constraint on time_frame.
const VALID_TIME_FRAMES = ["day", "week", "month"];

router.get("/", (req, res) => {
  const budgets = listBudgetsForUser(req.session.userId!);
  res.json({ budgets });
});

router.post("/", (req, res) => {
  const { limit, category, timeFrame } = req.body;
  const parsedLimit = Number(limit);

  if (!category || typeof category !== "string") {
    res.status(400).json({ error: "category is required" });
    return;
  }
  if (limit === undefined || Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    res.status(400).json({ error: "limit must be a positive number" });
    return;
  }
  if (!VALID_TIME_FRAMES.includes(timeFrame)) {
    res
      .status(400)
      .json({ error: "timeFrame must be one of: day, week, month" });
    return;
  }

  const existing = findBudgetByCategory(req.session.userId!, category);
  if (existing) {
    res.status(409).json({ error: "Budget category already exists" });
    return;
  }

  try {
    const budget = createBudget({
      budgetLimit: parsedLimit,
      category,
      timeFrame,
      userId: req.session.userId!,
    });
    res.status(201).json({ message: "Budget added successfully", budget });
  } catch {
    // Backstop for the same UNIQUE constraint, in case of a race condition.
    res.status(409).json({ error: "Budget category already exists" });
  }
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid budget id" });
    return;
  }

  const budget = findBudgetById(id);
  if (!budget || budget.user_id !== req.session.userId) {
    res.status(404).json({ error: "Budget does not exist" });
    return;
  }

  res.json({ budget });
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid budget id" });
    return;
  }

  const existing = findBudgetById(id);
  if (!existing || existing.user_id !== req.session.userId) {
    res.status(404).json({ error: "Budget does not exist" });
    return;
  }

  const { limit, timeFrame } = req.body;
  if (limit === undefined && timeFrame === undefined) {
    res.status(400).json({ error: "Provide limit and/or timeFrame to update" });
    return;
  }
  if (limit !== undefined && (Number.isNaN(Number(limit)) || Number(limit) <= 0)) {
    res.status(400).json({ error: "limit must be a positive number" });
    return;
  }
  if (timeFrame !== undefined && !VALID_TIME_FRAMES.includes(timeFrame)) {
    res
      .status(400)
      .json({ error: "timeFrame must be one of: day, week, month" });
    return;
  }

  const budget = updateBudget(id, {
    budgetLimit: limit !== undefined ? Number(limit) : undefined,
    timeFrame,
  });

  res.json({ message: "Budget edited successfully", budget });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid budget id" });
    return;
  }

  const existing = findBudgetById(id);
  if (!existing || existing.user_id !== req.session.userId) {
    res.status(404).json({ error: "Budget does not exist" });
    return;
  }

  deleteBudget(id);
  res.json({ message: "Budget deleted successfully" });
});

export default router;
