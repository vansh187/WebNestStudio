"""Request and response models for accounts. UserOut has no password_hash, so it can
never leak in a response."""
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=254)
    full_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=72)


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
