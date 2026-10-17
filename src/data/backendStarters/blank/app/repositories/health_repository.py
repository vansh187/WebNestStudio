"""Repository layer. The only place for SQL. Always pass values with ? placeholders,
never by putting them into the SQL string."""


def list_tables(db):
    rows = db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    return [row["name"] for row in rows]
