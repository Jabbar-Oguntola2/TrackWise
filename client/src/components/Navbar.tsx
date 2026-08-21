import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <NavLink to="/dashboard" end>
          TrackWise
        </NavLink>
        <NavLink to="/expenses">Expenses</NavLink>
        <NavLink to="/incomes">Incomes</NavLink>
        <NavLink to="/budgets">Budgets</NavLink>
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button onClick={() => logout()}>Log out</button>
      </div>
    </nav>
  );
}
