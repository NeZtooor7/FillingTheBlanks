document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('dark-mode-toggle');
  const body = document.body;

  const savedTheme = localStorage.getItem('theme');

  // Dark mode is default when there is no saved preference.
  if (savedTheme === null || savedTheme === 'dark') {
    body.classList.add('dark-mode');
    button.textContent = '☀️ Light mode';
  } else {
    body.classList.remove('dark-mode');
    button.textContent = '🌙 Dark mode';
  }

  button.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    const isDarkMode = body.classList.contains('dark-mode');

    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    button.textContent = isDarkMode ? '☀️ Light mode' : '🌙 Dark mode';
  });
});