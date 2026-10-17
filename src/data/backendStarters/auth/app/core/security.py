"""Password hashing and JWT tokens. Nothing here touches HTTP or the database."""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core import config


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=config.BCRYPT_ROUNDS)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=config.ACCESS_TOKEN_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expires}, config.SECRET_KEY, algorithm=config.ALGORITHM)


def read_access_token(token: str) -> int:
    """Returns the user id inside a valid token. Raises jwt.InvalidTokenError otherwise
    (wrong signature, expired, malformed)."""
    payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
    return int(payload["sub"])
