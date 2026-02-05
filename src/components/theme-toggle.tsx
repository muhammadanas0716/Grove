"use client";

import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-[var(--border)] border border-[var(--border)] hover:opacity-80 transition-all"
      aria-label="Toggle theme"
      style={{ fontFamily: 'var(--font-mono), monospace' }}
    >
      <span className="text-[var(--foreground)] text-xl">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
