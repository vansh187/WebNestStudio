CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT ''
);

INSERT INTO notes (title, body) VALUES
  ('Welcome', 'This note comes from db/schema.sql.'),
  ('SQL in Node.js', 'node:sqlite is built into Node.js 24.');
