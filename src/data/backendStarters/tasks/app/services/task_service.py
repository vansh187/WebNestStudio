"""Service layer: business rules. It knows nothing about HTTP or SQL. It calls the
repository and raises plain Python exceptions that the routes turn into HTTP errors."""
from app.repositories import task_repository


class TaskNotFound(Exception):
    pass


class TaskAlreadyDone(Exception):
    pass


def list_tasks(db, done=None, priority=None, page=1, size=20):
    size = max(1, min(size, 100))  # rule: never return more than 100 tasks at once
    offset = (max(page, 1) - 1) * size
    return task_repository.list_tasks(db, done, priority, size, offset)


def get_task(db, task_id):
    task = task_repository.get_task(db, task_id)
    if task is None:
        raise TaskNotFound(task_id)
    return task


def create_task(db, data):
    task_id = task_repository.insert_task(db, data.title.strip(), data.description, data.priority)
    return get_task(db, task_id)


def update_task(db, task_id, data):
    task = get_task(db, task_id)
    changes = data.model_dump(exclude_unset=True)
    # Rule: a finished task cannot be edited, only reopened with done=false.
    reopening = changes.get("done") is False
    if task["done"] and not reopening and any(field != "done" for field in changes):
        raise TaskAlreadyDone(task_id)
    if "done" in changes:
        changes["done"] = int(changes["done"])
    task_repository.update_task(db, task_id, changes)
    return get_task(db, task_id)


def delete_task(db, task_id):
    if task_repository.delete_task(db, task_id) == 0:
        raise TaskNotFound(task_id)
