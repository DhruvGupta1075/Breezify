/* ==========================================================================
   Breezify Theme Manager - Site-wide Dark / Light Mode Persistence
   ========================================================================== */

(function () {
  // Apply saved theme immediately to prevent flash of wrong theme
  const savedTheme = localStorage.getItem("breezify-theme");
  const isDark = savedTheme ? savedTheme === "dark" : true;

  if (isDark) {
    document.documentElement.classList.add("dark-mode");
    if (document.body) document.body.classList.add("dark-mode");
  } else {
    document.documentElement.classList.remove("dark-mode");
    if (document.body) document.body.classList.remove("dark-mode");
  }
})();

document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("breezify-theme");
  const isDark = savedTheme ? savedTheme === "dark" : true;

  updateThemeUI(isDark);

  const darkModeBtns = document.querySelectorAll("#darkModeBtn");
  darkModeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const currentlyDark = document.body.classList.contains("dark-mode");
      const nextIsDark = !currentlyDark;

      if (nextIsDark) {
        document.body.classList.add("dark-mode");
        document.documentElement.classList.add("dark-mode");
        localStorage.setItem("breezify-theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        document.documentElement.classList.remove("dark-mode");
        localStorage.setItem("breezify-theme", "light");
      }

      updateThemeUI(nextIsDark);
    });
  });
});

function updateThemeUI(isDark) {
  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  const darkModeBtns = document.querySelectorAll("#darkModeBtn");
  darkModeBtns.forEach((btn) => {
    btn.innerHTML = isDark
      ? '<i class="fas fa-sun" title="Switch to Light Mode"></i>'
      : '<i class="fas fa-moon" title="Switch to Dark Mode"></i>';
  });
}
