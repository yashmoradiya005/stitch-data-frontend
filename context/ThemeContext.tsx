"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type Lang = "en" | "gu";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("sd_theme") as Theme) || "dark";
    const savedLang = (localStorage.getItem("sd_lang") as Lang) || "en";
    setThemeState(savedTheme);
    setLangState(savedLang);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("sd_theme", t);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("sd_lang", l);
  }

  function toggleLang() {
    setLang(lang === "en" ? "gu" : "en");
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, lang, setLang, toggleLang }}>
      <div className="sd-app" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
