// Login flow: register -> log in (get a JWT) -> send it as "Authorization: Bearer ..."
// on every request. The token is kept in a variable here; real apps often use
// sessionStorage or an HttpOnly cookie instead.
let token = null;
let mode = 'login';

const authSection = document.querySelector('#auth');
const dashboard = document.querySelector('#dashboard');
const authForm = document.querySelector('#auth-form');
const taskForm = document.querySelector('#new-task');
const list = document.querySelector('#tasks');
const message = document.querySelector('#message');

async function api(path, { method = 'GET', json, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }
  if (form) body = new URLSearchParams(form); // OAuth2 login expects form fields
  const response = await fetch(path, { method, headers, body });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.map((item) => item.msg).join(', ') : data.detail;
    throw new Error(detail || `Request failed with ${response.status}`);
  }
  return data;
}

function setMode(next) {
  mode = next;
  document.querySelectorAll('.tabs button').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
  authForm.full_name.hidden = mode !== 'register';
  authForm.full_name.required = mode === 'register';
  authForm.querySelector('button[type="submit"]').textContent = mode === 'register' ? 'Create account' : 'Log in';
  message.textContent = '';
}

async function showDashboard() {
  const me = await api('/api/auth/me');
  document.querySelector('#name').textContent = me.full_name;
  authSection.hidden = true;
  dashboard.hidden = false;
  await loadTasks();
}

async function loadTasks() {
  const tasks = await api('/api/tasks');
  list.replaceChildren(...tasks.map((task) => {
    const item = document.createElement('li');
    item.className = task.done ? 'done' : '';
    item.innerHTML = '<input type="checkbox" aria-label="Done"><span></span><button type="button" aria-label="Delete task">x</button>';
    item.querySelector('input').checked = task.done;
    item.querySelector('span').textContent = task.title;
    item.querySelector('input').addEventListener('change', async (event) => {
      await api(`/api/tasks/${task.id}`, { method: 'PATCH', json: { done: event.target.checked } });
      loadTasks();
    });
    item.querySelector('button').addEventListener('click', async () => {
      await api(`/api/tasks/${task.id}`, { method: 'DELETE' });
      loadTasks();
    });
    return item;
  }));
}

document.querySelectorAll('.tabs button').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = authForm.email.value;
  const password = authForm.password.value;
  try {
    if (mode === 'register') {
      await api('/api/auth/register', { method: 'POST', json: { email, password, full_name: authForm.full_name.value } });
    }
    const result = await api('/api/auth/login', { method: 'POST', form: { username: email, password } });
    token = result.access_token;
    message.textContent = '';
    await showDashboard();
  } catch (error) {
    message.textContent = error.message;
  }
});

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api('/api/tasks', { method: 'POST', json: { title: taskForm.elements.title.value } });
    taskForm.reset();
    await loadTasks();
  } catch (error) {
    message.textContent = error.message;
  }
});

document.querySelector('#logout').addEventListener('click', () => {
  token = null;
  dashboard.hidden = true;
  authSection.hidden = false;
  authForm.reset();
});

setMode('login');
