import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// null default lets useAuth() below detect a missing Provider.
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Runs once on mount - checks whether a valid session cookie already exists.
  useEffect(() => {
    api
      .get<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<{ user: User }>("/auth/login", { email, password });
    setUser(data.user);
  }

  async function signup(name: string, email: string, password: string) {
    const data = await api.post<{ user: User }>("/auth/signup", { name, email, password });
    setUser(data.user);
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Lets components call useAuth() instead of useContext(AuthContext) directly.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
