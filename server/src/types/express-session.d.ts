import "express-session";

// Adds userId to express-session's SessionData type.
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}
