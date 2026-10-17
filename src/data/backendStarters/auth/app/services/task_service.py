"""Service layer for tasks. The current user always comes from the token, never from
the request body."""
from app.repositories import task_repository


class TaskNotFound(Exception):
    pass


def list_tasks(db, user):
    return task_repository.list_for_user(db, user["id"])


def create_task(db, user, data):
    task_id = task_repository.insert(db, user["id"], data.title.strip())
    return task_repository.get_for_user(db, user["id"], task_id)


def set_done(db, user, task_id, done):
    if task_repository.set_done(db, user["id"], task_id, done) == 0:
        raise TaskNotFound(task_id)
    return task_repository.get_for_user(db, user["id"], task_id)


def delete_task(db, user, task_id):
    if task_repository.delete(db, user["id"], task_id) == 0:
        raise TaskNotFound(task_id)
