"""Repository layer for tasks. Every query includes user_id, so one user can never read
or change another user's tasks, even by guessing an id."""

COLUMNS = "id, title, done, created_at"


def list_for_user(db, user_id):
    rows = db.execute(f"SELECT {COLUMNS} FROM tasks WHERE user_id = ? ORDER BY id DESC", (user_id,)).fetchall()
    return [dict(row) for row in rows]


def get_for_user(db, user_id, task_id):
    row = db.execute(f"SELECT {COLUMNS} FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id)).fetchone()
    return dict(row) if row else None


def insert(db, user_id, title):
    return db.execute("INSERT INTO tasks (user_id, title) VALUES (?, ?)", (user_id, title)).lastrowid


def set_done(db, user_id, task_id, done):
    return db.execute(
        "UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?", (int(done), task_id, user_id)
    ).rowcount


def delete(db, user_id, task_id):
    return db.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id)).rowcount
