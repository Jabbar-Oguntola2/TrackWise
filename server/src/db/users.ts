import db from "./index";

// Shape of a row in the users table.
export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // the bcrypt hash, never the plain password
  created_at: string;
}

export function findUserByEmail(email: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | User
    | undefined;
}

export function findUserById(id: number): User | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | User
    | undefined;
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): User {
  const result = db
    .prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
    .run(input.name, input.email, input.passwordHash);

  // lastInsertRowid is the id SQLite just assigned; use it to fetch the full row.
  return findUserById(result.lastInsertRowid as number)!;
}

// Strips the password hash before a user is sent back in an API response.
export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}
