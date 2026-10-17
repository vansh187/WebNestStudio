-- schema.sql: the database design for this project.
-- Run creates the database from this file the first time. After you change it,
-- open the Database tab and press "Rebuild from schema.sql" (this deletes the data).

CREATE TABLE tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description TEXT,
    priority    TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    done        INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Speeds up the most common query: open tasks, filtered by priority.
CREATE INDEX idx_tasks_done_priority ON tasks (done, priority);

-- Seed data so the API has something to return on the first run.
INSERT INTO tasks (title, description, priority) VALUES
    ('Design the tasks table', 'Columns, types and constraints', 'high'),
    ('Write the repository', 'Only SQL lives in app/repositories', 'medium'),
    ('Call the API from the frontend', NULL, 'low');
