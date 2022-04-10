import { useState, useEffect } from "react";

import styles from "./dayNightToggle.module.css";

enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

const Emoji = {
  [Theme.DARK]: "🌑",
  [Theme.LIGHT]: "☀️",
};

const isDark = (): boolean => {
  const currentTheme =
    document.documentElement.getAttribute("data-theme");
  const hasTheme = currentTheme !== null;
  const themeDark = currentTheme === Theme.DARK;
  const preferDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  return hasTheme ? themeDark : preferDark;
};

const emojiFromTheme = (theme: Theme | null): string => {
  return theme ? Emoji[theme] : " ";
};

const invertTheme = (theme: Theme): Theme => {
  switch (theme) {
    case Theme.DARK:
      return Theme.LIGHT;
    case Theme.LIGHT:
      return Theme.DARK;
  }
};

export function DayNightToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (theme !== null) {
      document.documentElement.setAttribute(
        "data-theme",
        theme
      );
    }
  }, [theme]);

  useEffect(() => {
    setTheme(isDark() ? Theme.DARK : Theme.LIGHT);
  }, []);

  return (
    <div
      className={styles.toggle}
      onClick={() => theme && setTheme(invertTheme(theme))}
    >
      {emojiFromTheme(theme)}
    </div>
  );
}
