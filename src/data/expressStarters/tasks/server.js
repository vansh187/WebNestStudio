// A task manager API: the app, its middleware, and the routes from routes/tasks.js.
const express = require('express');
const tasks = require('./routes/tasks');

const app = express();
app.use(express.json());

// Every route in routes/tasks.js starts with /api/tasks.
app.use('/api/tasks', tasks);

// Unknown routes get a JSON 404 instead of an HTML page.
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// Errors thrown in a route end up here; invalid JSON bodies too.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
});

app.listen(3000, () => console.log('Tasks API listening on port 3000'));
