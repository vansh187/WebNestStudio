"""Repository layer: the only code that knows SQL and table names.
Each function takes a database connection and returns plain dicts or values."""

COLUMNS = "id, title, description, priority, done, created_at"
UPDATABLE = {"title", "description", "priority", "done"}


def list_tasks(db, done=None, priority=None, limit=20, offset=0):
    sql = f"SELECT {COLUMNS} FROM tasks WHERE 1 = 1"
    params = []
    if done is not None:
        sql += " AND done = ?"
        params.append(int(done))
    if priority is not None:
        sql += " AND priority = ?"
        params.append(priority)
    sql += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params += [limit, offset]
    return [dict(row) for row in db.execute(sql, params).fetchall()]


def get_task(db, task_id):
    row = db.execute(f"SELECT {COLUMNS} FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return dict(row) if row else None


def insert_task(db, title, description, priority):
    cursor = db.execute(
        "INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)",
        (title, description, priority),
    )
    return cursor.lastrowid


def update_task(db, task_id, changes):
    # Values always go through ? placeholders. Column names come from this allow-list,
    # never from the request, so they cannot be used for SQL injection.
    columns = [column for column in changes if column in UPDATABLE]
    if not columns:
        return
    assignments = ", ".join(f"{column} = ?" for column in columns)
    db.execute(f"UPDATE tasks SET {assignments} WHERE id = ?", [changes[c] for c in columns] + [task_id])


def delete_task(db, task_id):
    return db.execute("DELETE FROM tasks WHERE id = ?", (task_id,)).rowcount
