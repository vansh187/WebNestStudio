"""Pydantic models describe request and response bodies. FastAPI validates incoming
JSON against them (422 on bad input) and shows them in the API tab.

Example:

from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    body: str | None = None


class NoteOut(NoteCreate):
    id: int
    created_at: str
"""
