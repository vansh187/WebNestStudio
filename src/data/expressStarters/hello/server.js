// The smallest Express API. Run it, then send requests from the API tab.
const express = require('express');

const app = express();
// Reads JSON request bodies into req.body.
app.use(express.json());

// GET /api/hello?name=Asha
app.get('/api/hello', (req, res) => {
  const name = req.query.name || 'world';
  res.json({ message: `Hello, ${name}!` });
});

// GET /api/square/7 - a path parameter arrives as text in req.params.
app.get('/api/square/:n', (req, res) => {
  const n = Number(req.params.n);
  if (Number.isNaN(n)) return res.status(400).json({ error: 'n must be a number' });
  res.json({ n, square: n * n });
});

// POST /api/echo with a JSON body such as {"text": "hi"}
app.post('/api/echo', (req, res) => {
  if (typeof req.body?.text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  res.status(201).json({ youSent: req.body.text, length: req.body.text.length });
});

// Any port works: the WebNest runner points the app at the right one.
app.listen(3000, () => console.log('Listening on port 3000'));
