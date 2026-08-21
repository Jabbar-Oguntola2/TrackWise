import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import db from "./db";
import authRouter from "./routes/auth";
import expensesRouter from "./routes/expenses";
import incomesRouter from "./routes/incomes";
import budgetsRouter from "./routes/budgets";
import analyticsRouter from "./routes/analytics";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Allows the Vite dev server's origin to send cookies with its requests.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Parses incoming JSON request bodies into req.body.
app.use(express.json());

// Creates/reads the signed session cookie that requireAuth relies on.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false, // don't rewrite the session if nothing changed
    saveUninitialized: false, // don't create a session until something's stored in it
    cookie: {
      httpOnly: true, // JavaScript in the browser can't read this cookie - blocks a common XSS attack
      sameSite: "lax", // blocks the cookie being sent from most cross-site requests (CSRF protection)
      secure: false, // set to true once this is served over HTTPS in production
      maxAge: 1000 * 60 * 60 * 24 * 7, // sessions expire after 7 days
    },
  })
);

app.use("/auth", authRouter);
app.use("/expenses", expensesRouter);
app.use("/incomes", incomesRouter);
app.use("/budgets", budgetsRouter);
app.use("/analytics", analyticsRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the TrackWise API" });
});

// Confirms the DB connection succeeded too, not just that the server is up.
app.get("/health", (_req, res) => {
  const row = db.prepare("SELECT 1 AS ok").get();
  res.json({ status: "ok", db: row });
});

app.listen(PORT, () => {
  console.log(`TrackWise server listening on http://localhost:${PORT}`);
});
