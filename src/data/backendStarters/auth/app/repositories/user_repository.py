"""Repository layer for users: SQL only."""

PUBLIC_COLUMNS = "id, email, full_name, created_at"


def find_by_email(db, email):
    row = db.execute("SELECT id, email, full_name, password_hash, created_at FROM users WHERE email = ?", (email,)).fetchone()
    return dict(row) if row else None


def find_by_id(db, user_id):
    row = db.execute(f"SELECT {PUBLIC_COLUMNS} FROM users WHERE id = ?", (user_id,)).fetchone()
    return dict(row) if row else None


def insert_user(db, email, full_name, password_hash):
    cursor = db.execute(
        "INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)",
        (email, full_name, password_hash),
    )
    return cursor.lastrowid
