"""Entry point: create the FastAPI app and include one router per feature.

Layers in this project (see the Architecture tab):
    app/api           routes: HTTP only. Call a service, return the result.
    app/services      business rules. Call repositories. No HTTP, no SQL.
    app/repositories  SQL only. Take a connection, return dicts.
    app/schemas       Pydantic models for request and response bodies.
    app/database.py   the connection that repositories use.
"""
from fastapi import FastAPI

from app.api import health_routes

app = FastAPI(title="My API", version="0.1.0")
app.include_router(health_routes.router)

# When you add app/api/note_routes.py, include it here:
# from app.api import note_routes
# app.include_router(note_routes.router)
