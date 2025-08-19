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


class Expenses(db.Model):
    __tablename__ = 'expenses'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cost: Mapped[int] = mapped_column(Float, nullable=False)
    date: Mapped[str] = mapped_column(String(250), nullable=False)
    category: Mapped[str] = mapped_column(String(250), nullable=False)

    #User relationship
    users_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="expenses")



class Incomes(db.Model):
    __tablename__ = 'incomes'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cost: Mapped[int] = mapped_column(Float, nullable=False)
    date: Mapped[str] = mapped_column(String(250), nullable=False)
    category: Mapped[str] = mapped_column(String(250), nullable=False)

    # User relationship
    users_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="user_income")


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



@app.route("/sign-in", methods=["GET","POST"])
def sign_in():
    date = str(datetime.today().date())
    corrected_date_format = date.replace("-", "/")
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
        creation_date=corrected_date_format,

        )

    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return jsonify(success={
        "message": f"Welcome to TrackWise {current_user.name}!Your account was created on {current_user.creation_date}"}), 200



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
def add_expense():
    expense_cost = request.args.get("cost")
    date_of_expense = request.args.get("date")
    expense_category = request.args.get("category")

    new_expense = Expenses(
        cost=expense_cost,
        date=date_of_expense,
        category = expense_category,
        users_id = current_user.id
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
    })



@app.route("/add-income", methods=["POST"])
def add_income():
    income_cost = request.args.get("cost")
    income_category = request.args.get("category")
    income_date = request.args.get("date")

    new_income = Incomes(
        cost=income_cost,
        date=income_date,
        category = income_category,
        users_id = current_user.id
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
    })



if __name__ == "__main__":
    app.run(debug=True)










