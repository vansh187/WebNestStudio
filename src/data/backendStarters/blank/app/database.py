"""Database connection. Use it in a route with: db=Depends(get_db)"""
import sqlite3

DATABASE_FILE = "app.db"  # the playground database; see the Database tab


def get_db():
    connection = sqlite3.connect(DATABASE_FILE)
    connection.row_factory = sqlite3.Row  # rows behave like dicts
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
