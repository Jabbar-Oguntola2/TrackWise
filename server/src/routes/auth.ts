import { Router } from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserById, toPublicUser } from "../db/users";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// bcrypt's cost factor - higher is slower but harder to brute-force.
const SALT_ROUNDS = 10;

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are all required" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const existing = findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  // bcrypt.hash is slow on purpose, so this route stays async.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = createUser({ name, email, passwordHash });

  // Signing in is just writing the user's id into the session.
  req.session.userId = user.id;

  res.status(201).json({
    message: `Welcome to TrackWise, ${user.name}!`,
    user: toPublicUser(user),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Email or password is incorrect" });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    res.status(401).json({ error: "Email or password is incorrect" });
    return;
  }

  req.session.userId = user.id;
  res.json({
    message: `Welcome back, ${user.name}!`,
    user: toPublicUser(user),
  });
});

router.post("/logout", requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log out, please try again" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ message: "You have successfully logged out" });
  });
});

// Lets the frontend check "is anyone logged in?" when a page first loads.
router.get("/me", requireAuth, (req, res) => {
  const user = findUserById(req.session.userId!);
  if (!user) {
    res.status(401).json({ error: "Session user no longer exists" });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

export default router;
