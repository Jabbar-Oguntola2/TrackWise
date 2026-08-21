# TrackWise

TrackWise is a personal finance tracker. Log your expenses and income, set
category-based budgets, and see it all laid out on a live dashboard.

## Tech stack

**Backend** — Node.js, Express, TypeScript, better-sqlite3 (raw SQL, no
ORM), express-session for cookie-based auth, bcryptjs for password hashing.

**Frontend** — React, TypeScript, Vite, React Router, Recharts.

## Project structure

```
TrackWise/
  server/   Express API - auth, expenses, incomes, budgets, analytics
  client/   React + Vite frontend - public landing page, dashboard, CRUD pages
```

## Getting started

### 1. Server

```bash
cd server
npm install
# create a .env file (see .env.example) with SESSION_SECRET and CLIENT_URL
npm run dev
```

Runs at http://localhost:4000.

### 2. Client

```bash
cd client
npm install
# create a .env file with:
# VITE_API_URL=http://localhost:4000
npm run dev
```

Runs at http://localhost:5173.

## Features

- Email/password auth with server-side sessions (httpOnly cookies)
- Full CRUD for expenses and incomes
- Category-based budgets with day/week/month limits and live status
- Analytics dashboard - totals by period, category breakdown, top
  categories, budget status, and recent activity, visualized with charts
- Public landing page for logged-out visitors; logged-in users land
  straight on their dashboard

## API overview

### Auth (`/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Create an account |
| POST | `/auth/login` | Log in, start a session |
| POST | `/auth/logout` | End the session |
| GET | `/auth/me` | Get the current logged-in user |

### Expenses / Incomes (`/expenses`, `/incomes`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses` | List your expenses |
| POST | `/expenses` | Add an expense |
| GET | `/expenses/:id` | Get one expense |
| PATCH | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |

`/incomes` follows the same shape.

### Budgets (`/budgets`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets` | List your budgets |
| POST | `/budgets` | Create a budget |
| GET | `/budgets/:id` | Get one budget |
| PATCH | `/budgets/:id` | Update a budget |
| DELETE | `/budgets/:id` | Delete a budget |

### Analytics (`/analytics`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/totals` | Income/expense/balance totals by period |
| GET | `/analytics/categories` | Spending broken down by category |
| GET | `/analytics/top-categories` | Highest-spending categories |
| GET | `/analytics/budgets` | Status of every budget (ok/warning/over) |
| GET | `/analytics/recent-transactions` | Most recent expenses + incomes |
