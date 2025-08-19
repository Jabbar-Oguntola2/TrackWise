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
    cost: Mapped[int] = mapped_column(Float, nullable=False)
    date: Mapped[str] = mapped_column(String(250), nullable=False)
    category: Mapped[str] = mapped_column(String(250), nullable=False)

    #User relationship
    users_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="expenses")

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}



class Incomes(db.Model):
    __tablename__ = 'incomes'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cost: Mapped[int] = mapped_column(Float, nullable=False)
    date: Mapped[str] = mapped_column(String(250), nullable=False)
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
    category: Mapped[str] = mapped_column(String(250), nullable=False)
    time_frame: Mapped[str] = mapped_column(String(250), nullable=False) #day, week, month

    #relationship with User
    users_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="budgets")

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

with app.app_context():
    db.create_all()




login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.get_or_404(User, user_id)

@app.route("/")
def home():
    return "<h1>Welcome to the Trackwise API!</h1>"


def format_date(date):
    sliced_date = date.split("/")
    tmp = sliced_date[0]
    sliced_date[0] = sliced_date[-1]
    sliced_date[-1] = tmp
    new_date = "/".join(sliced_date)
    return new_date



@app.route("/sign-in", methods=["GET","POST"])
def sign_in():
    date = str(datetime.today().date())
    corrected_date_format = date.replace("-", "/")
    new_date = format_date(corrected_date_format)
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
        creation_date=new_date,

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
    expense_cost = request.args.get("cost")
    date_of_expense = request.args.get("date")
    expense_category = request.args.get("category")

    new_expense = Expenses(
        cost=expense_cost,
        date=date_of_expense,
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
            "budgets": all_user_expenses,
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




@app.route("/add-income", methods=["POST"])
@login_required
def add_income():
    income_cost = request.args.get("cost")
    income_category = request.args.get("category")
    income_date = request.args.get("date")

    new_income = Incomes(
        cost=income_cost,
        date=income_date,
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







@app.route('/add-budget', methods=["POST"])
@login_required
def add_budget():
    budget_limit = request.args.get("limit")
    budget_category = request.args.get("category")
    budget_time_frame = request.args.get("time_frame")


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








if __name__ == "__main__":
    app.run(debug=True)










