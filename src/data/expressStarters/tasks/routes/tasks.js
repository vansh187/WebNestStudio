// CRUD routes for tasks, kept in memory. Each Run starts empty; your earlier successful
// POST, PUT and DELETE requests are replayed first, so the tasks you added are still there.
const express = require('express');
const { z } = require('zod');

const router = express.Router();

const tasks = [
  { id: 1, title: 'Learn Express', done: false },
  { id: 2, title: 'Build a REST API', done: false },
];
let nextId = 3;

// What a valid task body looks like.
const TaskInput = z.object({
  title: z.string().trim().min(1, 'title is required'),
  done: z.boolean().default(false),
});

function findTask(req, res) {
  const task = tasks.find((item) => item.id === Number(req.params.id));
  if (!task) res.status(404).json({ error: `Task ${req.params.id} not found` });
  return task;
}

// GET /api/tasks?done=true
router.get('/', (req, res) => {
  const { done } = req.query;
  res.json(done === undefined ? tasks : tasks.filter((task) => String(task.done) === done));
});

router.get('/:id', (req, res) => {
  const task = findTask(req, res);
  if (task) res.json(task);
});

router.post('/', (req, res) => {
  const parsed = TaskInput.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ errors: z.flattenError(parsed.error).fieldErrors });
  if (tasks.some((task) => task.title === parsed.data.title)) {
    return res.status(409).json({ error: 'A task with this title already exists' });
  }
  const task = { id: nextId++, ...parsed.data };
  tasks.push(task);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const task = findTask(req, res);
  if (!task) return;
  const parsed = TaskInput.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ errors: z.flattenError(parsed.error).fieldErrors });
  Object.assign(task, parsed.data);
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const task = findTask(req, res);
  if (!task) return;
  tasks.splice(tasks.indexOf(task), 1);
  res.status(204).end();
});

module.exports = router;
