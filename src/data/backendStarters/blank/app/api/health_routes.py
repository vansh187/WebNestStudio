"""API layer. A route file holds the HTTP side of one feature: paths, status codes,
Depends(...) and turning service errors into HTTPException."""
from fastapi import APIRouter, Depends

from app.database import get_db
from app.services import health_service

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health(db=Depends(get_db)):
    return health_service.check(db)
