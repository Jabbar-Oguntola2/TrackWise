import { ReactNode } from "react";
import { Navbar } from "./Navbar";

// Wraps logged-in pages with the shared navbar.
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">{children}</main>
    </div>
  );
}
