"use client";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  function toggleTheme() {
    const next: Theme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";

    window.localStorage.setItem("stagetrack-theme", next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar tema claro ou escuro"
      title="Alternar tema"
      className="fixed right-4 bottom-20 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white lg:bottom-4"
    >
      <span aria-hidden="true" className="text-lg dark:hidden">
        ☾
      </span>
      <span aria-hidden="true" className="hidden text-lg dark:inline">
        ☀
      </span>
    </button>
  );
}
