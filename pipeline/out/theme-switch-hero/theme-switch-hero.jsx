"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Instrument_Sans } from "next/font/google";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-instrument",
});

const VIEW_TRANSITION_CSS = `
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-image-pair(root) {
  isolation: isolate;
}
::view-transition-old(root) {
  z-index: 0;
}
::view-transition-new(root) {
  z-index: 1;
}
`;

const GRADIENT_TEXT =
  "bg-clip-text text-transparent [background-image:linear-gradient(180deg,var(--text-top),var(--text-bottom))]";

const DOT_POSITIONS = [
  "-left-[2px] -top-[2px]",
  "-right-[2px] -top-[2px]",
  "-bottom-[2px] -right-[2px]",
  "-bottom-[2px] -left-[2px]",
];

export default function ThemeSwitchHero({
  headline = "make",
  headlineSub = "every",
  headlineAccent = "transition",
  headlineTail = "count.",
  accentTexture = "repeating-conic-gradient(from var(--texture-angle) at 50% 80%, #ffffff 0 6deg, transparent 6deg 18deg), repeating-radial-gradient(circle at 50% 80%, #ffffff 0 2px, transparent 2px 14px)",
  textureSpinDuration = 12000,
  toggleToLightLabel = "Switch to light mode",
  toggleToDarkLabel = "Switch to dark mode",
  transitionDuration = 500,
  defaultDark = false,
  respectSystemPref = true,
  className = "",

  bgLight = "#ffffff",
  toggleLight = "#000000",
  lineLight = "rgba(0,0,0,0.1)",
  dotLight = "rgba(0,0,0,0.35)",
  textTopLight = "#000000",
  textBottomLight = "#404040",
  textCircleLight = "#404040",

  bgDark = "#000000",
  toggleDark = "#d4d4d4",
  lineDark = "rgba(255,255,255,0.15)",
  dotDark = "rgba(255,255,255,0.9)",
  textTopDark = "#ffffff",
  textBottomDark = "#e5e5e5",
  textCircleDark = "rgba(255,255,255,0.15)",
}) {
  const [isDark, setIsDark] = useState(defaultDark);
  const toggleRef = useRef(null);
  const accentRef = useRef(null);

  useEffect(() => {
    if (!respectSystemPref) return;
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, [respectSystemPref]);

  useEffect(() => {
    const el = accentRef.current;
    if (!el || !textureSpinDuration || typeof CSS === "undefined") return undefined;
    try {
      CSS.registerProperty({
        name: "--texture-angle",
        syntax: "<angle>",
        inherits: false,
        initialValue: "0deg",
      });
    } catch { }
    const spin = el.animate(
      { "--texture-angle": ["0deg", "360deg"] },
      { duration: textureSpinDuration, iterations: Infinity, easing: "linear" },
    );
    return () => spin.cancel();
  }, [textureSpinDuration]);

  const tokens = isDark
    ? {
      bg: bgDark,
      toggle: toggleDark,
      line: lineDark,
      dot: dotDark,
      textTop: textTopDark,
      textBottom: textBottomDark,
      textCircle: textCircleDark,
    }
    : {
      bg: bgLight,
      toggle: toggleLight,
      line: lineLight,
      dot: dotLight,
      textTop: textTopLight,
      textBottom: textBottomLight,
      textCircle: textCircleLight,
    };

  const handleToggle = () => {
    const flip = () => flushSync(() => setIsDark((prev) => !prev));

    if (!document.startViewTransition || !toggleRef.current) {
      flip();
      return;
    }

    const rect = toggleRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    document.startViewTransition(flip).ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0% at ${x}px ${y}px)`,
            `circle(150% at ${x}px ${y}px)`,
          ],
        },
        {
          duration: transitionDuration,
          easing: "ease-in-out",
          fill: "forwards",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <div
      className={`${instrument.variable} relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[var(--bg)] [font-family:var(--font-instrument)] ${className}`}
      style={{
        "--bg": tokens.bg,
        "--toggle-color": tokens.toggle,
        "--line-color": tokens.line,
        "--dot-color": tokens.dot,
        "--text-top": tokens.textTop,
        "--text-bottom": tokens.textBottom,
        "--text-circle": tokens.textCircle,
      }}
    >
      <style>{VIEW_TRANSITION_CSS}</style>

      <label
        ref={toggleRef}
        className="fixed left-1/2 top-3 z-10 -translate-x-1/2 scale-50 cursor-pointer"
      >
        <input
          type="checkbox"
          checked={isDark}
          onChange={handleToggle}
          aria-label={isDark ? toggleToLightLabel : toggleToDarkLabel}
          className="peer sr-only"
        />
        <div className="relative h-9 w-9 rounded-full [box-shadow:inset_16px_-16px_0_0_var(--toggle-color)] [transform:scale(1)_rotate(-2deg)] [transition:box-shadow_0.5s_ease_0s,transform_0.4s_ease_0.1s] peer-checked:[box-shadow:inset_32px_-32px_0_0_var(--bg)] peer-checked:[transform:scale(0.5)_rotate(0deg)] peer-checked:[transition:transform_0.3s_ease_0.1s,box-shadow_0.2s_ease_0s] before:absolute before:inset-0 before:rounded-full before:bg-transparent before:transition-colors before:duration-300 before:content-[''] peer-checked:before:bg-[var(--toggle-color)] peer-checked:before:delay-100 after:absolute after:left-1/2 after:top-1/2 after:-ml-1 after:-mt-1 after:h-2 after:w-2 after:scale-0 after:rounded-full after:transition-all after:duration-300 after:content-[''] after:[box-shadow:0_-23px_0_var(--toggle-color),0_23px_0_var(--toggle-color),23px_0_0_var(--toggle-color),-23px_0_0_var(--toggle-color),15px_15px_0_var(--toggle-color),-15px_15px_0_var(--toggle-color),15px_-15px_0_var(--toggle-color),-15px_-15px_0_var(--toggle-color)] peer-checked:after:scale-150 peer-checked:after:[transition:transform_0.5s_ease_0.15s]" />
      </label>

      <main className="w-full">
        <hr className="m-0 h-px w-full border-none bg-[var(--line-color)]" />

        <section className="relative mx-auto grid aspect-[1.55/0.5] min-h-[200px] w-[clamp(360px,60vw,780px)] place-items-center text-center">
          <div className="pointer-events-none absolute -top-[100dvh] -bottom-[100dvh] left-0 w-px bg-[var(--line-color)]" />
          <div className="pointer-events-none absolute -top-[100dvh] -bottom-[100dvh] right-0 w-px bg-[var(--line-color)]" />

          {DOT_POSITIONS.map((position) => (
            <div
              key={position}
              className={`absolute z-10 h-[5px] w-[5px] rounded-full bg-[var(--dot-color)] [box-shadow:0_0_0_3px_var(--bg)] ${position}`}
            />
          ))}

          <h1 className="m-0 text-left text-[clamp(32px,6vw,68px)] font-bold leading-[1.05] [font-optical-sizing:auto] [font-variation-settings:'wdth'_95]">
            <span className={GRADIENT_TEXT}>
              {headline} {headlineSub}
            </span>
            <br />
            <strong
              ref={accentRef}
              style={{ "--texture": accentTexture }}
              className="inline-block bg-clip-text tracking-[0.015em] text-transparent [background-blend-mode:overlay] [background-color:var(--text-circle)] [background-image:var(--texture)] [background-position:50%_80%] [background-size:100%_100%]">
              {headlineAccent}
            </strong>{" "}
            <span className={GRADIENT_TEXT}>{headlineTail}</span>
          </h1>
        </section>

        <hr className="m-0 h-px w-full border-none bg-[var(--line-color)]" />
      </main>
    </div>
  );
}