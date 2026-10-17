"""Entry point: creates the FastAPI app and plugs in the routers.

Try it in the API tab:
  1. POST /api/auth/register  with an email, full_name and password
  2. POST /api/auth/login     the token is saved for you ("Authorize")
  3. GET  /api/auth/me        and the /api/tasks routes now know who you are
"""
from fastapi import FastAPI

from app.api import auth_routes, task_routes

app = FastAPI(title="Tasks with Login API", version="1.0.0")
app.include_router(auth_routes.router)
app.include_router(task_routes.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
