// fetch('/api/...') reaches your in-browser FastAPI app.
document.querySelector('#check').addEventListener('click', async () => {
  const output = document.querySelector('#output');
  try {
    const response = await fetch('/api/health');
    output.textContent = `${response.status}\n${JSON.stringify(await response.json(), null, 2)}`;
  } catch (error) {
    output.textContent = error.message;
  }
});
