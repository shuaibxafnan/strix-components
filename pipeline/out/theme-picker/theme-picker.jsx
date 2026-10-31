"use client";

import { useState } from "react";
const DEFAULT_THEMES = {
  dark: {
    bg: "#101214",
    border: "#22272B",
    surface: "#161A1D",
    textPrimary: "#DEE4EA",
    textSecondary: "#8A99A8",
    primary: "#1D7AFC",
    textInverse: "#FFFFFF",
  },
  sunset: {
    bg: "#151c19",
    border: "#424f4a",
    surface: "#2f3834",
    textPrimary: "#ecd2c5",
    textSecondary: "#A3907A",
    primary: "#C0AB92",
    textInverse: "#151c19",
  },
  sunrise: {
    bg: "#ecd2c5",
    border: "#d7c9c6",
    surface: "#f3e8e5",
    textPrimary: "#4f2733",
    textSecondary: "#7A6855",
    primary: "#a04d66",
    textInverse: "#f3e8e5",
  },
  light: {
    bg: "#F7F8F9",
    border: "#E4E6EA",
    surface: "#FFFFFF",
    textPrimary: "#091E42",
    textSecondary: "#626F86",
    primary: "#1D7AFC",
    textInverse: "#FFFFFF",
  },
};

const THEME_KEYS = ["dark", "sunset", "sunrise", "light"];
const DarkIcon = () => (
  <svg
    fill="currentColor"
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="w-full h-full"
  >
    <path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z" />
  </svg>
);
const SunsetIcon = () => (
  <svg
    fill="currentColor"
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="w-full h-full"
  >
    <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z" />
  </svg>
);
const SunriseIcon = () => (
  <svg
    fill="currentColor"
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="w-full h-full"
  >
    <path d="M20 15.31 23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z" />
  </svg>
);
const LightIcon = () => (
  <svg
    fill="currentColor"
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="w-full h-full"
  >
    <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
  </svg>
);

const ICONS = [DarkIcon, SunsetIcon, SunriseIcon, LightIcon];

export default function ThemePicker({
  title = "Variable Themes",
  description = "Cycle through 4 distinctive interface layers, optimized from darkest to lightest configurations.",
  buttonLabel = "Cycle Theme",
  themes = DEFAULT_THEMES,
  className = "",
}) {
  const THEME_KEYS = Object.keys(themes);
  const THEMES = themes;
  const [count, setCount] = useState(0);
  const [activeTheme, setActiveTheme] = useState(Object.keys(themes)[0]);

  const t = THEMES[activeTheme];

  const cycleTheme = () => {
    const next = count < THEME_KEYS.length - 1 ? count + 1 : 0;
    setCount(next);
    setActiveTheme(THEME_KEYS[count]);
  };

  const selectTheme = (key) => {
    const idx = THEME_KEYS.indexOf(key);
    setActiveTheme(key);
    setCount(idx < THEME_KEYS.length - 1 ? idx + 1 : 0);
  };
  const activeThemeStyles = {
    "--bg": t.bg,
    "--surface": t.surface,
    "--border": t.border,
    "--text-primary": t.textPrimary,
    "--text-secondary": t.textSecondary,
    "--primary": t.primary,
    "--text-inverse": t.textInverse,
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center p-6 font-sans bg-[var(--bg)] text-[var(--text-secondary)] transition-colors duration-300 ease-out ${className}`}
      style={activeThemeStyles}
    >
      <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 relative shadow-xl transition-colors duration-300 ease-out">
        <button
          onClick={cycleTheme}
          aria-label="Cycle theme"
          className="absolute top-6 right-6 w-9 h-9 overflow-hidden p-1.5 rounded-lg bg-transparent border border-transparent text-[var(--text-primary)] hover:border-[var(--border)] transition-all duration-200 focus:outline-none flex items-center justify-center"
        >
          <span className="absolute top-0 left-0 right-0 h-2 z-10 pointer-events-none bg-gradient-to-b from-[var(--surface)] to-transparent" />
          <span className="absolute bottom-0 left-0 right-0 h-2 z-10 pointer-events-none bg-gradient-to-t from-[var(--surface)] to-transparent" />
          <div
            className="relative w-5 h-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              transform: `translateY(${THEME_KEYS.indexOf(activeTheme) * -28}px)`,
            }}
          >
            {THEME_KEYS.map((_, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
              <div
                key={i}
                className="w-5 h-5 flex items-center justify-center mb-2"
              >
                <Icon />
              </div>
              );
            })}
          </div>
        </button>
        <div className="pr-12 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] transition-colors duration-300">
            {title}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] transition-colors duration-300 max-w-lg">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          {THEME_KEYS.map((key) => {
            const tk = THEMES[key];
            const isActive = activeTheme === key;
            const Icon = ICONS[THEME_KEYS.indexOf(key) % ICONS.length];

            return (
              <button
                key={key}
                onClick={() => selectTheme(key)}
                className="group flex flex-col text-left w-full p-4 rounded-xl border relative select-none transition-all duration-200 hover:-translate-y-0.5 focus:outline-none shadow-sm"
                style={{
                  background: tk.surface,
                  color: tk.textSecondary,
                  borderColor: isActive ? tk.primary : tk.border,
                  boxShadow: isActive ? `0 0 0 2px ${tk.primary}` : undefined,
                }}
              >
                {isActive && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold shadow-sm z-10 animate-in zoom-in-75 duration-150"
                    style={{ background: tk.primary, color: tk.textInverse }}
                  >
                    ✓
                  </span>
                )}
                <div
                  className="flex items-center space-x-1.5 text-[var(--text-primary)]"
                  style={{ color: tk.textPrimary }}
                >
                  <span className="w-4 h-4 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Icon />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {key}
                  </span>
                </div>
                <div className="flex items-center mt-4 pl-1">
                  {[
                    tk.bg,
                    tk.border,
                    tk.surface,
                    tk.textPrimary,
                    tk.textSecondary,
                    tk.primary,
                    tk.textInverse,
                  ].map((color, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border -ml-1.5 relative shadow-sm inline-block transform transition-transform group-hover:translate-x-0.5"
                      style={{
                        background: color,
                        borderColor: tk.border,
                        zIndex: i,
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={cycleTheme}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide shadow-md hover:opacity-95 active:scale-98 transition-all duration-150 focus:outline-none"
          style={{
            background: t.primary,
            color: t.textInverse,
          }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
