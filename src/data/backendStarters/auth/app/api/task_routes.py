"""Task routes. Depends(get_current_user) protects every route in this router."""
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_current_user
from app.database import get_db
from app.schemas.task import TaskCreate, TaskDoneUpdate, TaskOut
from app.services import task_service

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
def list_tasks(user=Depends(get_current_user), db=Depends(get_db)):
    return task_service.list_tasks(db, user)


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(body: TaskCreate, user=Depends(get_current_user), db=Depends(get_db)):
    return task_service.create_task(db, user, body)


@router.patch("/{task_id}", response_model=TaskOut)
def set_done(task_id: int, body: TaskDoneUpdate, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        return task_service.set_done(db, user, task_id, body.done)
    except task_service.TaskNotFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Task {task_id} not found")


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        task_service.delete_task(db, user, task_id)
    except task_service.TaskNotFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Task {task_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
