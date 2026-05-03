"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

function applyTheme(theme: "dark" | "light") {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
  localStorage.setItem("atus-theme", theme);
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("atus-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"
      }
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-dd transition-all duration-150 text-dd-muted hover:bg-dd-surface hover:text-dd-on-surface",
        className,
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
