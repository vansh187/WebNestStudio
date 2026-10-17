-- schema.sql: users who log in, and tasks that belong to one user each.
-- Run creates the database from this file the first time. After you change it,
-- open the Database tab and press "Rebuild from schema.sql" (this deletes the data).

CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    NOT NULL UNIQUE,            -- one account per email
    full_name     TEXT    NOT NULL,
    password_hash TEXT    NOT NULL,                   -- never store the password itself
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tasks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title      TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    done       INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Every task query filters by user_id, so index it.
CREATE INDEX idx_tasks_user ON tasks (user_id);
