"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [theme, setThemeState] = useState<string>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read current theme from DOM
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setThemeState(currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setThemeState(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("heroui-theme", newTheme);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0 min-w-9">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="tertiary"
      size="sm"
      className="w-9 h-9 p-0 min-w-9"
      onPress={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ?  <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
