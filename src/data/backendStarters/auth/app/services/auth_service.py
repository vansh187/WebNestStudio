"""Service layer for accounts: registration and login rules."""
import sqlite3

from app.core import security
from app.repositories import user_repository


class EmailAlreadyRegistered(Exception):
    pass


class InvalidCredentials(Exception):
    pass


def register(db, data):
    email = data.email.strip().lower()  # rule: emails are case-insensitive
    password_hash = security.hash_password(data.password)
    try:
        user_id = user_repository.insert_user(db, email, data.full_name.strip(), password_hash)
    except sqlite3.IntegrityError:
        # The UNIQUE constraint in schema.sql is the real guarantee, even if two
        # requests with the same email arrive at the same moment.
        raise EmailAlreadyRegistered(email)
    return user_repository.find_by_id(db, user_id)


def login(db, email, password):
    user = user_repository.find_by_email(db, email.strip().lower())
    # Same error for "no such user" and "wrong password", so attackers cannot
    # find out which emails have accounts.
    if user is None or not security.verify_password(password, user["password_hash"]):
        raise InvalidCredentials()
    return security.create_access_token(user["id"])
