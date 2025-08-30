import pandas as pd
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Float, ForeignKey
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
from datetime import datetime
load_dotenv()

class Base(DeclarativeBase):
    pass
db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_KEY')

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DB_URI', 'sqlite:///track-wise.db')
db.init_app(app)

formatted_date = str(datetime.today().strftime('%d/%m/%Y'))
time = str(datetime.today().time())
formatted_time = time.split(".")[0]
week_number = datetime.today().isocalendar()[1]
month_number = datetime.today().month


# Tables
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(250), nullable=False)
    email: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(250), nullable=False)
    creation_date: Mapped[str] = mapped_column(String(250), nullable=False)

    #expenses relationship
    expenses = relationship("Expenses", back_populates="user")

    #incomes relationship
    user_income = relationship("Incomes", back_populates="user")

    #Budgets relationship
    budgets = relationship("Budgets", back_populates="user")


class Expenses(db.Model):
    __tablename__ = 'expenses'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cost: Mapped[str] = mapped_column(Float, nullable=False)
    date: Mapped[str] = mapped_column(String(250), nullable=False)
    time: Mapped[str] = mapped_column(String(250), nullable=False)
    category: Mapped[str] = mapped_column(String(250), nullable=False)

    #User relationship
    users_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="expenses")

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}



class Incomes(db.Model):
    __tablename__ = 'incomes'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cost: Mapped[str] = mapped_column(Float, nullable=False)
    date: Mapped[str] = mapped_column(String(250), nullable=False)
    time: Mapped[str] = mapped_column(String(250), nullable=False)
    category: Mapped[str] = mapped_column(String(250), nullable=False)

    # User relationship
    users_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="user_income")

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

class Budgets(db.Model):
    __tablename__ = 'budgets'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    limit: Mapped[int] = mapped_column(Float, nullable=False)
    category: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    time_frame: Mapped[str] = mapped_column(String(250), nullable=False) #day, week, month

    #relationship with User
    users_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="budgets")

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

with app.app_context():
    db.create_all()
    engine = db.engine




login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.get_or_404(User, user_id)

@app.route("/")
def home():
    return "<h1>Welcome to the Trackwise API!</h1>"


@app.route("/sign-in", methods=["GET","POST"])
def sign_in():
    global formatted_date
    name = request.args.get("name")
    hashed_and_salted_password = generate_password_hash(request.args.get("password"), method="pbkdf2:sha256", salt_length=8)
    user_email = request.args.get("email")
    check_email = db.session.execute(db.select(User).where(User.email == user_email)).first()
    if check_email:
        return jsonify(unsuccessful={
        "message": "Email already registered",}), 422

    new_user = User(
        name=name,
        password=hashed_and_salted_password,
        email=user_email,
        creation_date=formatted_date,

        )

    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return jsonify(success={
        "message": f"Welcome to TrackWise {current_user.name}! Your account was created on {current_user.creation_date}"}), 200



@app.route("/login", methods=["POST"])
def login():
    email = request.args.get("email")
    user_password = request.args.get("password")
    user = db.session.execute(db.select(User).where(User.email == email)).scalar()
    if not user:
        return jsonify(unsuccessful={
            "message": "Email or Password is incorrect",
        }), 401
    correct_password = check_password_hash(pwhash=user.password, password=user_password)
    if not correct_password:
        return jsonify(unsuccessful={
            "message": "Email or password is incorrect",
        }), 401

    else:
        login_user(user)
        return jsonify(success={
            "message": f"You have successfully logged in. Welcome back {current_user.name}!"
        }), 200


@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify(success={
        "message": "You have successfully logged out",
    }), 200



@app.route("/add-expense", methods=["POST"])
@login_required
def add_expense():
    global formatted_date, formatted_time
    expense_cost = request.args.get("cost")
    expense_category = request.args.get("category")

    new_expense = Expenses(
        cost=expense_cost,
        date=formatted_date,
        time=formatted_time,
        category = expense_category,
        user = current_user
    )

    db.session.add(new_expense)
    db.session.commit()
    return jsonify(success={
        "message": "Expense added successfully",
        "info":{
            "name": new_expense.user.name,
            "expense_cost": new_expense.cost,
            "expense_category": new_expense.category,
            "expense_date": new_expense.date,
            "expense_time": new_expense.time,
        }
    }), 200

@app.route("/edit-expense/<int:expense_id>", methods=["PATCH"])
@login_required
def edit_expense(expense_id):
    new_cost = float(request.args.get("cost"))
    chosen_expense = db.get_or_404(Expenses, expense_id)
    chosen_expense.cost = new_cost
    db.session.commit()
    return jsonify(success={
        "message": "Expense edited successfully",
    }), 200


@app.route("/all-expenses", methods=["GET"])
def all_expenses():
    expenses = db.session.execute(db.select(Expenses).where(Expenses.users_id == current_user.get_id())).scalars().all()
    all_user_expenses = [expense.to_dict() for expense in expenses]
    if all_user_expenses:
        return jsonify(success={
            "expenses": all_user_expenses,
        })
    else:
        return jsonify(error={
            "message": "No expenses found"
        })


@app.route("/expense/<int:expense_id>", methods=["GET"])
@login_required
def show_expense(expense_id):
    specific_expense = db.session.execute(db.select(Expenses).where(Expenses.id == expense_id)).scalar()
    if specific_expense:
        return jsonify(success={
            "budgets": [specific_expense.to_dict()],
        })
    else:
        return jsonify(error={
            "message": "No expense found"
        })


@app.route("/delete-expense/<int:expense_id>", methods=["DELETE"])
@login_required
def delete_expense(expense_id):
    specific_expense = db.get_or_404(Expenses, expense_id)
    db.session.delete(specific_expense)
    db.session.commit()
    return jsonify(success={
        "message": "Expense deleted successfully",
    })




@app.route("/add-income", methods=["POST"])
@login_required
def add_income():
    global formatted_date, formatted_time
    income_cost = request.args.get("cost")
    income_category = request.args.get("category")
    new_income = Incomes(
        cost=income_cost,
        date=formatted_date,
        time=formatted_time,
        category = income_category,
        user = current_user
    )

    db.session.add(new_income)
    db.session.commit()

    return jsonify(success={
        "message": "Income added successfully",
        "info":{
            "name": new_income.user.name,
            "income_cost": new_income.cost,
            "income_category": new_income.category,
            "income_date": new_income.date,
            "income_time": new_income.time,
        }
    }), 200



@app.route("/edit-income/<int:income_id>", methods=["PATCH"])
@login_required
def edit_income(income_id):
    new_cost = float(request.args.get("cost"))
    chosen_income = db.get_or_404(Incomes, income_id)
    chosen_income.cost = new_cost
    db.session.commit()
    return jsonify(success={
        "message": "Income edited successfully",
    })

@app.route("/all-incomes", methods=["GET"])
def all_incomes():
    incomes = db.session.execute(db.select(Incomes).where(Incomes.users_id == current_user.get_id())).scalars().all()
    all_user_incomes = [income.to_dict() for income in incomes]
    if all_user_incomes:
        return jsonify(success={
            "budgets": all_user_incomes
        })
    else:
        return jsonify(error={
            "message": "No incomes found"
        })

@app.route("/income/<int:income_id>", methods=["GET"])
@login_required
def show_income(income_id):
    specific_income = db.session.execute(db.select(Incomes).where(Incomes.id == income_id)).scalar()
    if specific_income:
        return jsonify(success={
            "info": [specific_income.to_dict()],
        })
    else:
        return jsonify(error={
            "message": "Income does not exist"
        })

@app.route("/delete-income/<int:income_id>", methods=["DELETE"])
@login_required
def delete_income(income_id):
    specific_income = db.get_or_404(Incomes, income_id)
    db.session.delete(specific_income)
    db.session.commit()
    return jsonify(success={
        "message": "Income deleted successfully",
    })







@app.route('/add-budget', methods=["POST"])
@login_required
def add_budget():
    budget_limit = request.args.get("limit")
    budget_category = request.args.get("category")
    budget_time_frame = request.args.get("time_frame")

    check_category = db.session.execute(db.select(Budgets).where(Budgets.category == budget_category)).scalar_one_or_none()
    if check_category:
        return jsonify(error={
            "message": "Budget category already exists"
        })


    new_budget = Budgets(
        limit=budget_limit,
        category=budget_category,
        time_frame=budget_time_frame,
        user = current_user
    )

    db.session.add(new_budget)
    db.session.commit()

    return jsonify(success={
        "message": "Budget added successfully",
        "info":{
            "name": new_budget.user.name,
            "budget_limit": new_budget.limit,
            "budget_category": new_budget.category,
            "budget_time_frame": new_budget.time_frame,
        }
    })


@app.route('/edit-budget/<int:budget_id>', methods=["PATCH"])
@login_required
def edit_budget(budget_id):
    new_limit = float(request.args.get("limit"))
    chosen_budget = db.get_or_404(Budgets, budget_id)
    chosen_budget.limit = new_limit
    db.session.commit()
    return jsonify(success={
        "message": "Budget edited successfully",
    })

@app.route('/all-budgets', methods=["GET"])
@login_required
def all_budgets():
    budgets = db.session.execute(db.select(Budgets).where(Budgets.users_id == current_user.get_id())).scalars().all()
    all_user_budgets = [budget.to_dict() for budget in budgets]
    if all_user_budgets:
        return jsonify(success={
            "budgets": all_user_budgets
        })
    else:
        return jsonify(error={
            "message": "No budgets found"
        })

@app.route('/budget/<int:budget_id>', methods=["GET"])
@login_required
def show_budget(budget_id):
    specific_budget = db.session.execute(db.select(Budgets).where(Budgets.id == budget_id)).scalar()
    if specific_budget:
        return jsonify(success={
            "info": [specific_budget.to_dict()],
        })
    else:
        return jsonify(error={
            "message": "Budget does not exist"
        })



@app.route('/delete-budget/<int:budget_id>', methods=["DELETE"])
@login_required
def delete_budget(budget_id):
    specific_budget = db.get_or_404(Budgets, budget_id)
    db.session.delete(specific_budget)
    db.session.commit()
    return jsonify(success={
        "message": "Budget deleted successfully",
    })


def get_totals_by_period(period):
    """Gets the total expenses and incomes  and the balance for a given period."""
    global formatted_date, formatted_time
    with app.app_context():
        df_expenses = pd.read_sql_table("expenses", engine)
        df_incomes = pd.read_sql_table("incomes", engine)
        expenses = df_expenses[df_expenses["users_id"] == current_user.get_id()].groupby("date").cost.sum()
        incomes = df_incomes[df_incomes["users_id"] == current_user.get_id()].groupby("date").cost.sum()
        if period == "daily":
            daily_dic_total = {}

            for date, total in expenses.items():
                if date not in daily_dic_total.keys():
                    daily_dic_total[date] = {
                        "expenses": total,
                        "incomes": float(0),
                    }
                else:
                    daily_dic_total[date]["expenses"] += total

            for date, total in incomes.items():
                if date not in daily_dic_total.keys():
                    daily_dic_total[date] = {
                        "expenses": float(0),
                        "incomes": total,
                    }
                else:
                    daily_dic_total[date]["incomes"] += total

            for key in daily_dic_total.keys():
                daily_dic_total[key]["balance"] = daily_dic_total[key]["incomes"] - daily_dic_total[key]["expenses"]

            return daily_dic_total

        elif period == "weekly":
            weekly_dic_total = {}
            for date, total in expenses.items():
                date_week = datetime.strptime(date, "%d/%m/%Y").isocalendar()[1]
                if f"Week {date_week}" not in weekly_dic_total.keys():
                    weekly_dic_total[f"Week {date_week}"] = {
                        "expenses": total,
                        "incomes": float(0)
                    }
                else:
                    weekly_dic_total[f"Week {date_week}"]["expenses"] += total

            for date, total in incomes.items():
                date_week = datetime.strptime(date, "%d/%m/%Y").isocalendar()[1]
                if f"Week {date_week}" not in weekly_dic_total.keys():
                    weekly_dic_total[f"Week {date_week}"] = {
                        "expenses": float(0),
                        "incomes": total,
                    }
                else:
                    weekly_dic_total[f"Week {date_week}"]["incomes"] += total

            for key in weekly_dic_total.keys():
                weekly_dic_total[key]["balance"] = weekly_dic_total[key]["incomes"] - weekly_dic_total[key]["expenses"]
            return weekly_dic_total

        elif period == "monthly":
            months_list = ["January", "February", "March", "April", "May", "June", "July", "August",
                           "September", "October", "November", "December"]
            monthly_dic_total = {}
            for date, total in expenses.items():
                date_month = int(date.split("/")[1]) - 1
                if months_list[date_month] not in monthly_dic_total.keys():
                    monthly_dic_total[months_list[date_month]] = {
                        "expenses": total,
                        "incomes": float(0)
                    }
                else:
                     monthly_dic_total[months_list[date_month]]["expenses"] += total


            for date, total in incomes.items():
                date_month = int(date.split("/")[1]) - 1
                if months_list[date_month] not in monthly_dic_total.keys():
                    monthly_dic_total[months_list[date_month]] = {
                        "expenses": float(0),
                        "incomes": total
                    }
                else:
                    monthly_dic_total[months_list[date_month]]["incomes"] += total




            for key in monthly_dic_total.keys():
                monthly_dic_total[key]["balance"] = monthly_dic_total[key]["incomes"] - monthly_dic_total[key]["expenses"]


            return monthly_dic_total

        return None





def get_category_breakdown(period=None):
    """ Gets breakdown of user spending categories over a certain period """
    global formatted_date, week_number, month_number
    with app.app_context():
        categories = ["Food & Groceries", "Shopping & Entertainemnt", "Housing & Rent", "Transport", "Health & Personal"]
        df_expenses = pd.read_sql_table("expenses", engine)
        expenses = df_expenses[df_expenses["users_id"] == current_user.get_id()]

        if period == "daily":
            daily_break_down = {}
            df_today_total = expenses[expenses["date"] == formatted_date]
            if df_today_total.empty:
                return None

            daily_total = df_today_total.cost.sum()
            for category in categories:
                category_total = df_today_total[df_today_total["category"] == category].cost.sum()
                percentage = round((category_total / daily_total) * 100, 2)
                daily_break_down[category] = f"{percentage}%"

            return daily_break_down

        elif period == "weekly":
            weekly_break_down = {}
            weekly_total = 0
            for index, row in df_expenses.iterrows():
                date_week_number = datetime.strptime(row["date"], "%d/%m/%Y").isocalendar()[1]
                if date_week_number == week_number:
                    weekly_total += row["cost"]



            for category in categories:
                category_summary = expenses[expenses["category"] == category]

                category_total = 0
                for index, row in category_summary.iterrows():
                    date_week_number = datetime.strptime(row["date"], "%d/%m/%Y").isocalendar()[1]
                    if date_week_number == week_number:
                        category_total += row["cost"]

                percentage = round((category_total / weekly_total) * 100, 2)
                weekly_break_down[category] = f"{percentage}%"

            return weekly_break_down

        elif period == "monthly":
            monthly_break_down = {}
            monthly_total = 0
            for index, row in expenses.iterrows():
                date_month = int(row["date"].split("/")[1])
                if date_month == month_number:
                    monthly_total += row["cost"]


            for category in categories:
                category_summary = expenses[expenses["category"] == category]
                category_total = 0
                for index, row in category_summary.iterrows():
                    row_month_number = int(row["date"].split("/")[1])
                    if row_month_number == month_number:
                        category_total += row["cost"]

                percentage = round((category_total / monthly_total) * 100, 2)
                monthly_break_down[category] = f"{percentage}%"


            return monthly_break_down

        elif period == "all-time":
            overall_breakdown = {}
            overall_total = df_expenses["cost"].sum()

            for category in categories:
                category_total = expenses[expenses["category"] == category].cost.sum()
                percentage = round((category_total / overall_total) * 100, 2)
                overall_breakdown[category] = f"{percentage}%"

            return overall_breakdown




def top_spending_categories():
    """returns the top 3 spending categories since account creation"""
    categories = ["Food & Groceries", "Shopping & Entertainment", "Housing & Rent", "Transport", "Health & Personal"]
    with app.app_context():
        df_expenses = pd.read_sql_table("expenses", engine)
        expenses = df_expenses[df_expenses["users_id"] == current_user.get_id()]
        if not expenses:
            return None
        summarised_categories = {}
        for c in categories:
            summarised_categories[c] = float(expenses[(expenses["category"] == c) & (expenses["users_id"] == current_user.get_id())].cost.sum())

        top_spending_categories = {}
        while len(top_spending_categories) < 3:
            values = list(summarised_categories.values())
            greatest_value = max(values)
            index = values.index(greatest_value)
            keys = list(summarised_categories.keys())
            category = keys[index]
            top_spending_categories[category] = greatest_value
            del summarised_categories[category]

        return top_spending_categories



def budget_tracker(category=None):
    global formatted_date, week_number, month_number
    if not category:
        return None
    with app.app_context():
        df_expenses = pd.read_sql_table("expenses", engine)
        expenses = df_expenses[df_expenses["users_id"] == current_user.get_id()]

        if expenses.empty:
            return "Please add expenese to allow budget tracking"

        df_budgets = pd.read_sql_table("budgets", engine)
        budget = df_budgets[(df_budgets["category"] == category) & (df_budgets["users_id"] == current_user.get_id())]

        if budget.empty:
            return "Budget does not exist"
        budget_limit = float(budget["limit"].iloc[0])
        period = budget["time_frame"].iloc[0]
        if period == "daily":
            category_total = expenses[(expenses["category"] == category) & (expenses["date"] == formatted_date)].cost.sum()

        elif period == "weekly":
            df_category = expenses[expenses["category"] == category]
            category_total = 0
            for index, row in df_category.iterrows():
                row_date_number = datetime.strptime(row["date"], "%d/%m/%Y").isocalendar()[1]
                if row_date_number == week_number:
                    category_total += float(row["cost"])


        elif period == "monthly":
            df_category = expenses[expenses["category"] == category]
            category_total = 0
            for index, row in df_category.iterrows():
                row_date_month_number = int(row["date"].split("/")[1])
                if row_date_month_number == month_number:
                    category_total += float(row["cost"])

        percentage = (category_total / budget_limit) * 100
        if not category_total <= budget_limit:
            return category_total, budget_limit, f" ❌ You are over your {category} budget."

        elif 0 <= percentage <= 50:
            return category_total, budget_limit ,f"✅ You have used {percentage}% of your {category} budget."

        elif 51 <= percentage <= 100:
            return category_total, budget_limit ,f"⚠️ You have used {percentage}% of your {category} budget."

        return None




# get the recent transactions of user
def recent_transactions():
    """Returns a dictionary of the 3 most recent transactions"""
    with app.app_context():
        df_expenses = pd.read_sql_table("expenses", engine)
        df_incomes = pd.read_sql_table("incomes", engine)
        expenses = df_expenses[df_expenses["users_id"] == current_user.get_id()]
        incomes = df_incomes[df_incomes["users_id"] == current_user.get_id()]


        df_transactions = pd.concat([expenses, incomes], join="outer")
        if df_transactions.empty:
            return None
        most_recent_transactions = df_transactions.sort_values(by=["date", "time"], ascending=[False, False]).head(3)
        recent_transactions_dic = {}

        for index, row in most_recent_transactions.iterrows():
            check_if_expense = expenses[expenses["category"] == row["category"]]
            check_if_income = incomes[incomes["category"] == row["category"]]
            if check_if_income.empty:
                recent_transactions_dic[row["category"]] = (float(row["cost"]), "Expense")

            else:
                recent_transactions_dic[row["category"]] = (float(row["cost"]), "Income")


        return recent_transactions_dic












# Speding trends over time

print(recent_transactions())



# plot graphs based o statistics



































if __name__ == "__main__":
    app.run(debug=True)










