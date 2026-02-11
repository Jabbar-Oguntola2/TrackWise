# 📊 TrackWise API

TrackWise helps you take control of your finances by automatically tracking income and expenses.  
See where your money goes, analyze trends over time, and stay on top of your budgets — all in one simple, intuitive dashboard.

---

## 🚀 Features

### 🔐 User Authentication
- Secure sign-up and login
- Session management with Flask-Login
- Password hashing using Werkzeug

### 💸 Transaction Management
- Full CRUD operations for expenses
- Add and manage income sources
- Track categories and dates

### 🎯 Budgeting System
- Set spending limits per category
- Timeframes: Daily, Weekly, Monthly
- Monitor financial discipline

### 📊 Data Analysis
- Automatic balance calculations
- Category breakdowns
- Trend analysis using Pandas & NumPy

### 📈 Visual Insights
- Line charts (spending trends)
- Pie charts (category breakdown)
- Bar charts (comparisons)
- Generated as Base64-encoded images using Matplotlib

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Flask |
| Database | SQLite |
| ORM | SQLAlchemy |
| Data Processing | Pandas, NumPy |
| Visualization | Matplotlib |
| Authentication | Flask-Login, Werkzeug |

---

## 📋 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/sign-in` | Register a new user |
| POST | `/login` | Log in and start session |
| POST | `/logout` | Log out current user |

---

### 💸 Expenses

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/expenses` | Get all expenses |
| POST | `/add-expense` | Add new expense |
| PATCH | `/edit-expense/<id>` | Update expense cost |
| DELETE | `/delete-expense/<id>` | Delete expense |

---

### 💰 Income

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/incomes` | Get all income records |
| POST | `/add-income` | Add new income |

---

### 🎯 Budgets

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/budgets` | View active budgets |
| POST | `/add-budget` | Create new budget |
| DELETE | `/delete-budget/<id>` | Delete budget |

---

## 📊 Database Schema

### 🧑 User
- id
- username
- password_hash
- Relationship → Expenses
- Relationship → Incomes
- Relationship → Budgets

### 💸 Expenses
- id
- cost
- category
- date
- user_id

### 💰 Incomes
- id
- amount
- source
- date
- user_id

### 🎯 Budgets
- id
- category
- limit
- timeframe (Day / Week / Month)
- user_id

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd trackwise
```

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
FLASK_KEY=your_secret_key_here
DB_URI=sqlite:///track-wise.db
```

### 4️⃣ Run the Application

```bash
python main.py
```

---

## 🧪 Example: Test `/add-expense`

```bash
curl -X POST http://127.0.0.1:5000/add-expense \
-H "Content-Type: application/json" \
-d '{
  "category": "Food",
  "cost": 15.50,
  "date": "2026-02-10"
}'
```

---

## 📌 Future Improvements

- JWT Authentication
- Docker Deployment
- PostgreSQL Support
- Budget Alerts
- Frontend Dashboard Integration
