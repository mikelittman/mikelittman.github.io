"use client";

import { useEffect, useState } from "react";

import styles from "./dayNightToggle.module.css";

enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

const Emoji = {
  [Theme.DARK]: "🌑",
  [Theme.LIGHT]: "☀️",
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return Theme.LIGHT;
  }

  const explicitTheme = document.documentElement.getAttribute(
    "data-theme",
  );

  if (explicitTheme === Theme.DARK) {
    return Theme.DARK;
  }

  if (explicitTheme === Theme.LIGHT) {
    return Theme.LIGHT;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? Theme.DARK
    : Theme.LIGHT;
}

function invertTheme(theme: Theme): Theme {
  return theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
}

export function DayNightToggle() {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    document.documentElement.setAttribute(
      "data-theme",
      initialTheme,
    );
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    document.documentElement.setAttribute("data-theme", theme);
  }, [mounted, theme]);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme((current) => invertTheme(current))}
    >
      {mounted ? Emoji[theme] : ""}
    </button>
  );
}
