"""Service layer. Business rules live here: what is allowed, what happens in which
order, which repositories to call. Raise plain exceptions; never import FastAPI."""
from app.repositories import health_repository


def check(db):
    tables = health_repository.list_tables(db)
    return {"status": "ok", "tables": tables}
