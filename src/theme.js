// --- Theme ---
const themeToggle = document.getElementById('theme-toggle');
function setTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('sudoku2-theme', 'dark');
    themeToggle.textContent = '☀️ Light Mode';
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('sudoku2-theme', 'light');
    themeToggle.textContent = '🌙 Dark Mode';
  }
}
themeToggle.addEventListener('click', () => {
  setTheme(!document.body.classList.contains('dark-mode'));
});
// Initialize theme
const savedTheme = localStorage.getItem('sudoku2-theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  setTheme(true);
} else {
  setTheme(false);
}
