from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedColumn
from sqlalchemy import Integer, Column, String
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
load_dotenv()

class Base(DeclarativeBase):
    pass
db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_KEY')

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DB_URI', 'sqlite:///track-wise.db')
db.init_app(app)

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id: Mapped[int] = Column(Integer, primary_key=True)
    name: Mapped[str] = Column(String(250), nullable=False)
    email: Mapped[str] = Column(String(250), nullable=False, unique=True)
    password: Mapped[str] = Column(String(250), nullable=False)

with app.app_context():
    db.create_all()

from flask_login import LoginManager, UserMixin

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)

@app.route("/")
def home():
    return "<h1>Welcome to the Trackwise API!</h1>"



@app.route("/sign-in", methods=["GET","POST"])
def sign_in():
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
        email=user_email
        )

    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return jsonify(success={
        "message": f"Welcome to TrackWise {current_user.name}!"}), 200



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



if __name__ == "__main__":
    app.run(debug=True)










