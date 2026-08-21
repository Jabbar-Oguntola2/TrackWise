import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listIncomesForUser,
  createIncome,
  findIncomeById,
  updateIncome,
  deleteIncome,
} from "../db/incomes";

const router = Router();
router.use(requireAuth);

function currentDateParts() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8);
  return { date, time };
}

router.get("/", (req, res) => {
  const incomes = listIncomesForUser(req.session.userId!);
  res.json({ incomes });
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
  const income = createIncome({
    cost: parsedCost,
    category,
    date,
    time,
    userId: req.session.userId!,
  });

  res.status(201).json({ message: "Income added successfully", income });
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid income id" });
    return;
  }

  const income = findIncomeById(id);
  if (!income || income.user_id !== req.session.userId) {
    res.status(404).json({ error: "Income does not exist" });
    return;
  }

  res.json({ income });
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid income id" });
    return;
  }

  const existing = findIncomeById(id);
  if (!existing || existing.user_id !== req.session.userId) {
    res.status(404).json({ error: "Income does not exist" });
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

  const income = updateIncome(id, {
    cost: cost !== undefined ? Number(cost) : undefined,
    category,
  });

  res.json({ message: "Income edited successfully", income });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid income id" });
    return;
  }

  const existing = findIncomeById(id);
  if (!existing || existing.user_id !== req.session.userId) {
    res.status(404).json({ error: "Income does not exist" });
    return;
  }

  deleteIncome(id);
  res.json({ message: "Income deleted successfully" });
});

export default router;
