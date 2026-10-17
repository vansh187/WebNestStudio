"""Entry point: creates the FastAPI app and plugs in the routers.

How a request flows through this project:

    frontend or API tab
        -> app/api           routes: HTTP only (paths, status codes, validation)
        -> app/services      business rules
        -> app/repositories  SQL only
        -> SQLite            tables defined in schema.sql
"""
from fastapi import FastAPI

from app.api import task_routes

app = FastAPI(title="Task Manager API", version="1.0.0")
app.include_router(task_routes.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
