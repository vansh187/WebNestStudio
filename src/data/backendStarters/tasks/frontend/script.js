// The frontend talks to the FastAPI app with fetch(). In the playground, requests to
// /api/... reach your in-browser API; on a real server the same code calls the same paths.
const list = document.querySelector('#tasks');
const form = document.querySelector('#new-task');
const message = document.querySelector('#message');

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data.detail === 'string' ? data.detail : 'Please check the form and try again.');
  }
  return data;
}

function render(tasks) {
  list.replaceChildren();
  if (!tasks.length) {
    list.innerHTML = '<li class="empty">No tasks yet. Add one above.</li>';
    return;
  }
  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = task.done ? 'done' : '';
    item.innerHTML = '<label><input type="checkbox"> <span></span></label><em class="badge"></em><button type="button" aria-label="Delete task">x</button>';
    item.querySelector('input').checked = task.done;
    item.querySelector('span').textContent = task.title;
    const badge = item.querySelector('.badge');
    badge.textContent = task.priority;
    badge.classList.add(task.priority);
    item.querySelector('input').addEventListener('change', (event) => toggle(task.id, event.target.checked));
    item.querySelector('button').addEventListener('click', () => remove(task.id));
    list.append(item);
  }
}

async function load() {
  try {
    render(await api('/api/tasks'));
    message.textContent = '';
  } catch (error) {
    message.textContent = error.message;
  }
}

async function toggle(id, done) {
  try {
    await api(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) });
  } catch (error) {
    message.textContent = error.message;
  }
  load();
}

async function remove(id) {
  try {
    await api(`/api/tasks/${id}`, { method: 'DELETE' });
  } catch (error) {
    message.textContent = error.message;
  }
  load();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  try {
    await api('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: fields.get('title'), priority: fields.get('priority') }),
    });
    form.reset();
  } catch (error) {
    message.textContent = error.message;
  }
  load();
});

load();
