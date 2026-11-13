// A notes API with a real SQL database: node:sqlite, built into Node.js, kept in memory.
const express = require('express');
const db = require('./db/database');

const app = express();
app.use(express.json());

app.get('/api/notes', (req, res) => {
  const search = req.query.q ? `%${req.query.q}%` : '%';
  // Placeholders (?) keep user input out of the SQL text.
  const notes = db.prepare('SELECT id, title, body FROM notes WHERE title LIKE ? ORDER BY id').all(search);
  res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
  const note = db.prepare('SELECT id, title, body FROM notes WHERE id = ?').get(Number(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.post('/api/notes', (req, res) => {
  const { title, body = '' } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ error: 'title is required' });
  const result = db.prepare('INSERT INTO notes (title, body) VALUES (?, ?)').run(title.trim(), String(body));
  res.status(201).json({ id: Number(result.lastInsertRowid), title: title.trim(), body: String(body) });
});

app.delete('/api/notes/:id', (req, res) => {
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ error: 'Note not found' });
  res.status(204).end();
});

app.listen(3000, () => console.log('Notes API listening on port 3000'));
