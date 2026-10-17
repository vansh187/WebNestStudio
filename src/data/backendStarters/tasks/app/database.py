"""Database connection. Each request gets its own connection through get_db()."""
import sqlite3

DATABASE_FILE = "app.db"  # the playground database; see the Database tab


def get_db():
    """FastAPI dependency: opens a connection, commits when the request succeeds,
    rolls back when it fails, and always closes it."""
    connection = sqlite3.connect(DATABASE_FILE)
    connection.row_factory = sqlite3.Row  # rows behave like dicts: row["title"]
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
