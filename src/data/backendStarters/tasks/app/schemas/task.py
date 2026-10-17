"""Pydantic models: the shape of the data that goes in and out of the API.
FastAPI uses them to validate requests (422 on bad input) and to build the docs."""
from typing import Literal

from pydantic import BaseModel, Field

Priority = Literal["low", "medium", "high"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    priority: Priority = "medium"


class TaskUpdate(BaseModel):
    """Every field is optional: a PATCH sends only what changes."""
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    priority: Priority | None = None
    done: bool | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str | None
    priority: Priority
    done: bool
    created_at: str
