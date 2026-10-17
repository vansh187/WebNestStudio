"""Shared route dependencies. get_current_user turns the Bearer token into a user, or
answers 401 before the route runs."""
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core import security
from app.database import get_db
from app.repositories import user_repository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not logged in or the token has expired",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        user_id = security.read_access_token(token)
    except jwt.InvalidTokenError:
        raise UNAUTHORIZED
    user = user_repository.find_by_id(db, user_id)
    if user is None:
        raise UNAUTHORIZED
    return user
