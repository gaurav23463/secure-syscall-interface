const token = localStorage.getItem('syscallToken');
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

const showMessage = (message, isError = false) => {
  const messageElement = document.getElementById('message');
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.classList.toggle('error', isError);
  messageElement.style.display = 'block';
  setTimeout(() => { messageElement.style.display = 'none'; }, 5000);
};

const redirectToLogin = () => {
  localStorage.removeItem('syscallToken');
  window.location.href = 'login.html';
};

if (!token) {
  redirectToLogin();
}

const fetchProfile = async () => {
  const response = await fetch('/api/auth/profile', { headers });
  if (!response.ok) {
    redirectToLogin();
    return null;
  }
  return response.json();
};

const refreshFiles = async () => {
  const response = await fetch('/api/syscall/files', { headers });
  if (!response.ok) {
    showMessage('Unable to load file list.', true);
    return;
  }
  const data = await response.json();
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = data.files.map((file) => `<li>${file}</li>`).join('') || '<li>No files yet.</li>';
};

const fetchLogs = async () => {
  const response = await fetch('/api/logs', { headers });
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  const logPanel = document.getElementById('logPanel');
  logPanel.innerHTML = data.logs.map((entry) => {
    const ts = new Date(entry.createdAt).toLocaleString();
    return `
      <div class="log-entry">
        <strong>${entry.action.toUpperCase()} &mdash; ${entry.outcome}</strong>
        <div><strong>User:</strong> ${entry.user.username} (${entry.user.role})</div>
        <div><strong>Resource:</strong> ${entry.resource}</div>
        <div><strong>Details:</strong> ${entry.details}</div>
        <div class="small-text">${ts}</div>
      </div>
    `;
  }).join('') || '<div class="log-entry">No audit records yet.</div>';
};

const performOperation = async (path, body, successMessage) => {
  try {
    const response = await fetch(path, {
      method: path === '/api/syscall/delete' ? 'DELETE' : 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Operation failed');
    }

    showMessage(successMessage);
    if (path !== '/api/syscall/read') {
      refreshFiles();
    }
    if (path === '/api/syscall/read') {
      document.getElementById('fileContent').value = data.content;
      showMessage(`File loaded: ${data.name}`);
    }
    fetchLogs();
  } catch (error) {
    showMessage(error.message, true);
  }
};

const bindEvents = () => {
  document.getElementById('logoutButton').addEventListener('click', redirectToLogin);
  document.getElementById('listButton').addEventListener('click', refreshFiles);
  document.getElementById('readButton').addEventListener('click', () => {
    const name = document.getElementById('fileName').value.trim();
    performOperation('/api/syscall/read', { name }, 'File read request completed.');
  });
  document.getElementById('writeButton').addEventListener('click', () => {
    const name = document.getElementById('fileName').value.trim();
    const content = document.getElementById('fileContent').value;
    performOperation('/api/syscall/write', { name, content }, 'File saved successfully.');
  });
  document.getElementById('deleteButton').addEventListener('click', () => {
    const name = document.getElementById('fileName').value.trim();
    performOperation('/api/syscall/delete', { name }, 'File deleted successfully.');
  });
};

const initializeDashboard = async () => {
  const profile = await fetchProfile();
  if (!profile || !profile.user) {
    return;
  }

  document.getElementById('userRole').textContent = `Signed in as ${profile.user.username} — ${profile.user.role.toUpperCase()}`;
  bindEvents();
  refreshFiles();
  fetchLogs();
};

initializeDashboard();
