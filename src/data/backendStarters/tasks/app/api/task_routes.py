"""API layer: HTTP only. Paths, status codes, input validation with Pydantic, and
turning service exceptions into HTTP errors. There is no SQL in this file."""
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.database import get_db
from app.schemas.task import Priority, TaskCreate, TaskOut, TaskUpdate
from app.services import task_service

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
def list_tasks(
    done: bool | None = None,
    priority: Priority | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
):
    return task_service.list_tasks(db, done, priority, page, size)


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db=Depends(get_db)):
    try:
        return task_service.get_task(db, task_id)
    except task_service.TaskNotFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Task {task_id} not found")


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(body: TaskCreate, db=Depends(get_db)):
    return task_service.create_task(db, body)


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, body: TaskUpdate, db=Depends(get_db)):
    try:
        return task_service.update_task(db, task_id, body)
    except task_service.TaskNotFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Task {task_id} not found")
    except task_service.TaskAlreadyDone:
        raise HTTPException(status.HTTP_409_CONFLICT, "This task is done. Reopen it with done=false before editing.")


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db=Depends(get_db)):
    try:
        task_service.delete_task(db, task_id)
    except task_service.TaskNotFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Task {task_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
