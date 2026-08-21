import { RequestHandler } from "express";

// Rejects the request if there's no logged-in user on the session.
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "You must be logged in to do that" });
    return;
  }
  next();
};
