import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listExpensesForUser,
  createExpense,
  findExpenseById,
  updateExpense,
  deleteExpense,
} from "../db/expenses";

const router = Router();

// Every route below requires being logged in.
router.use(requireAuth);

// Computed fresh per request, not once at server startup.
function currentDateParts() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const time = now.toTimeString().slice(0, 8); // "HH:MM:SS"
  return { date, time };
}

router.get("/", (req, res) => {
  // An empty list is normal, not an error.
  const expenses = listExpensesForUser(req.session.userId!);
  res.json({ expenses });
});

router.post("/", (req, res) => {
  const { cost, category } = req.body;
  const parsedCost = Number(cost);

  if (!category || typeof category !== "string") {
    res.status(400).json({ error: "category is required" });
    return;
  }
  if (cost === undefined || Number.isNaN(parsedCost) || parsedCost <= 0) {
    res.status(400).json({ error: "cost must be a positive number" });
    return;
  }

  const { date, time } = currentDateParts();
  const expense = createExpense({
    cost: parsedCost,
    category,
    date,
    time,
    userId: req.session.userId!,
  });

  res.status(201).json({ message: "Expense added successfully", expense });
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid expense id" });
    return;
  }

  const expense = findExpenseById(id);

  // Confirms this expense actually belongs to the logged-in user.
  if (!expense || expense.user_id !== req.session.userId) {
    res.status(404).json({ error: "No expense found" });
    return;
  }

  res.json({ expense });
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid expense id" });
    return;
  }

  const existing = findExpenseById(id);
  if (!existing || existing.user_id !== req.session.userId) {
    res.status(404).json({ error: "No expense found" });
    return;
  }

  const { cost, category } = req.body;
  if (cost === undefined && category === undefined) {
    res.status(400).json({ error: "Provide cost and/or category to update" });
    return;
  }
  if (cost !== undefined && (Number.isNaN(Number(cost)) || Number(cost) <= 0)) {
    res.status(400).json({ error: "cost must be a positive number" });
    return;
  }

  const expense = updateExpense(id, {
    cost: cost !== undefined ? Number(cost) : undefined,
    category,
  });

  res.json({ message: "Expense edited successfully", expense });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid expense id" });
    return;
  }

  const existing = findExpenseById(id);
  if (!existing || existing.user_id !== req.session.userId) {
    res.status(404).json({ error: "No expense found" });
    return;
  }

  deleteExpense(id);
  res.json({ message: "Expense deleted successfully" });
});

export default router;
