const apiBase = '/api/auth';

const showMessage = (message, isError = false) => {
  const messageBox = document.getElementById('message');
  if (!messageBox) return;
  messageBox.textContent = message;
  messageBox.classList.toggle('error', isError);
  messageBox.style.display = 'block';
};

const redirectToDashboard = () => {
  window.location.href = 'dashboard.html';
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Unexpected error occurred');
  }
  return data;
};

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      localStorage.setItem('syscallToken', data.token);
      redirectToDashboard();
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await handleResponse(response);
      localStorage.setItem('syscallToken', data.token);
      redirectToDashboard();
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}
