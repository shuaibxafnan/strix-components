"use client";

import { useEffect, useRef, useState } from "react";

// ─── EaseMate ─────────────────────────────────────────────────────────────────
//
// A hero section with a moon/sun toggle that triggers a radial View Transition
// ripple from the toggle's position. Faithfully ported from the jh3yy CodePen.
//
// ─── Props ────────────────────────────────────────────────────────────────────
//
// headline         string   "easemate."
//                  The top-left plain text portion of the h1 (gradient fill).
//
// headlineSub      string   "every"
//                  Continues on the same line as headline (gradient fill).
//
// headlineAccent   string   "transition"
//                  The bold center word rendered with the circle-texture overlay.
//                  This is the typographic hero of the layout.
//
// headlineTail     string   "count."
//                  Trailing word on the second line (gradient fill).
//
// circleImageUrl   string   (codepen asset)
//                  URL for the SVG texture overlaid on headlineAccent via
//                  background-blend-mode: overlay. Swap for your own asset.
//
// fontFamily       string   "'Instrument Sans', sans-serif"
//                  Font family for the whole component. Must be loaded in your
//                  layout (e.g. Google Fonts link).
//
// transitionDuration  number   500
//                  Duration in ms for the View Transition ripple animation.
//                  If View Transitions aren't supported the theme still changes
//                  instantly.
//
// defaultDark      bool     false
//                  Force the component to start in dark mode, regardless of the
//                  OS preference. When false (default) the OS prefers-color-scheme
//                  is read on mount.
//
// respectSystemPref  bool   true
//                  When true, reads window.matchMedia on mount and sets the
//                  initial theme from the OS. Set false if you want to fully
//                  control starting state via defaultDark.
//
// ── Light theme tokens ────────────────────────────────────────────────────────
// bgLight          string   "hsla(230,80%,98%,1)"     Page background
// toggleLight      string   "hsla(230,25%,10%,1)"     Moon/crescent color
// lineLight        string   "hsla(230,35%,92.5%,1)"   HR + vertical rule color
// dotLight         string   "hsla(230,25%,75%,1)"     Corner dot color
// textTopLight     string   "hsla(240,25%,10%,1)"     Gradient top stop
// textBottomLight  string   "hsla(240,25%,25%,1)"     Gradient bottom stop
// textCircleLight  string   "hsla(240,25%,25%,1)"     Accent word fill
//
// ── Dark theme tokens ─────────────────────────────────────────────────────────
// bgDark           string   "hsla(230,55%,4%,1)"      Page background
// toggleDark       string   "hsla(230,25%,75%,1)"     Sun ray color
// lineDark         string   "hsla(230,25%,15%,0.75)"  HR + vertical rule color
// dotDark          string   "hsla(230,25%,90%,1)"     Corner dot color
// textTopDark      string   "hsla(240,60%,90%,1)"     Gradient top stop
// textBottomDark   string   "hsla(240,60%,95%,1)"     Gradient bottom stop
// textCircleDark   string   "hsla(240,60%,95%,0.15)"  Accent word fill
//
// ─────────────────────────────────────────────────────────────────────────────

export default function EaseMate({
  headline = "easemate.",
  headlineSub = "every",
  headlineAccent = "transition",
  headlineTail = "count.",
  circleImageUrl = "https://assets.codepen.io/165585/circle-bg_1.svg",
  fontFamily = "'Instrument Sans', sans-serif",
  transitionDuration = 500,
  defaultDark = false,
  respectSystemPref = true,

  // ── Light tokens ────────────────────────────────────────────────────────
  bgLight = "hsla(230,80%,98%,1)",
  toggleLight = "hsla(230,25%,10%,1)",
  lineLight = "hsla(230,35%,92.5%,1)",
  dotLight = "hsla(230,25%,75%,1)",
  textTopLight = "hsla(240,25%,10%,1)",
  textBottomLight = "hsla(240,25%,25%,1)",
  textCircleLight = "hsla(240,25%,25%,1)",

  // ── Dark tokens ─────────────────────────────────────────────────────────
  bgDark = "hsla(230,55%,4%,1)",
  toggleDark = "hsla(230,25%,75%,1)",
  lineDark = "hsla(230,25%,15%,0.75)",
  dotDark = "hsla(230,25%,90%,1)",
  textTopDark = "hsla(240,60%,90%,1)",
  textBottomDark = "hsla(240,60%,95%,1)",
  textCircleDark = "hsla(240,60%,95%,0.15)",
}) {
  // ── isDark drives every visual token in the component ───────────────────
  // Initialised to false; actual OS pref is applied in useEffect to avoid
  // SSR/hydration mismatch (window is not available during SSR).
  const [isDark, setIsDark] = useState(defaultDark);

  // Ripple origin — updated on each toggle click to the toggle's centre
  const rippleRef = useRef({ x: "50%", y: "50%" });
  const toggleRef = useRef(null);
  const wrapperRef = useRef(null);

  // ── On mount: read OS preference ────────────────────────────────────────
  useEffect(() => {
    if (!respectSystemPref) return;
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, [respectSystemPref]);

  // ── Derive all runtime tokens from isDark ───────────────────────────────
  // These change at runtime (theme switch) so they must be inline styles /
  // CSS custom properties — Tailwind classes can't react to JS state.
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

  // ── Handle toggle click with View Transition ripple ─────────────────────
  const handleToggle = () => {
    // Compute ripple origin from toggle element's bounding rect
    if (toggleRef.current) {
      const rect = toggleRef.current.getBoundingClientRect();
      rippleRef.current = {
        x: `${rect.left + rect.width / 2}px`,
        y: `${rect.top + rect.height / 2}px`,
      };
    }

    const applyTheme = () => setIsDark((prev) => !prev);

    // View Transition API — progressively enhanced
    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    const transition = document.startViewTransition(applyTheme);

    // Inject ripple origin as CSS vars so the ::view-transition keyframes
    // can use them (must happen after transition.ready resolves)
    transition.ready.then(() => {
      document.documentElement.style.setProperty("--vt-x", rippleRef.current.x);
      document.documentElement.style.setProperty("--vt-y", rippleRef.current.y);
    });
  };

  // ── CSS variables injected on the root wrapper ───────────────────────────
  // Only runtime-dynamic values live here; layout/spacing stays in Tailwind.
  const cssVars = {
    "--bg": tokens.bg,
    "--toggle-color": tokens.toggle,
    "--line-color": tokens.line,
    "--dot-color": tokens.dot,
    "--text-top": tokens.textTop,
    "--text-bottom": tokens.textBottom,
    "--text-circle": tokens.textCircle,
    "--transition-duration": `${transitionDuration}ms`,
    fontFamily,
  };

  return (
    <div
      ref={wrapperRef}
      className="min-h-dvh flex flex-col justify-center items-center w-full transition-colors duration-300"
      style={{ backgroundColor: tokens.bg, ...cssVars }}
    >
      {/* ── Injected styles ─────────────────────────────────────────────────
          These cannot be expressed in Tailwind because they:
          1. Use ::view-transition-* pseudo-elements (browser-level, not scoped)
          2. Reference CSS custom properties inside clip-path calc()
          3. Are animation keyframes for the ripple
          4. Contain complex multi-shadow box-shadow for the toggle rays
      ─────────────────────────────────────────────────────────────────────── */}
      <style>{`
        /* ── View Transition ripple keyframes ── */
        @keyframes em-reveal-in {
          from { clip-path: circle(0% at var(--vt-x, 50%) var(--vt-y, 50%)); }
          to   { clip-path: circle(150% at var(--vt-x, 50%) var(--vt-y, 50%)); }
        }
        @keyframes em-reveal-out {
          from { clip-path: circle(150% at var(--vt-x, 50%) var(--vt-y, 50%)); }
          to   { clip-path: circle(0% at var(--vt-x, 50%) var(--vt-y, 50%)); }
        }

        ::view-transition-new(root) {
          animation: em-reveal-in var(--transition-duration, 500ms) ease-in-out forwards;
          z-index: 1;
          mix-blend-mode: normal;
        }
        ::view-transition-old(root) {
          animation: em-reveal-out var(--transition-duration, 500ms) ease-in-out forwards;
          animation-delay: var(--transition-duration, 500ms);
          z-index: 0;
          mix-blend-mode: normal;
        }
        ::view-transition-image-pair(root) {
          isolation: isolate;
        }

        /* ── Toggle: moon crescent ── */
        .em-toggle-knob {
          border-radius: 50%;
          width: 36px;
          height: 36px;
          position: relative;
          /* inset box-shadow creates the crescent cutout */
          box-shadow: inset 16px -16px 0 0 var(--toggle-color);
          transform: scale(1) rotate(-2deg);
          transition: box-shadow 0.5s ease 0s, transform 0.4s ease 0.1s;
        }

        /* ── Toggle: dark overlay that fills the circle in dark mode ── */
        .em-toggle-knob::before {
          content: '';
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: absolute;
          left: 0;
          top: 0;
          /* transparent in light → shows crescent; filled in dark → hides it */
          background: transparent;
          transition: background 0.3s ease;
        }

        /* ── Toggle: sun rays (8 box-shadow dots) ── */
        .em-toggle-knob::after {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: -4px 0 0 -4px;
          position: absolute;
          top: 50%;
          left: 50%;
          box-shadow:
            0 -23px 0 var(--toggle-color),
            0  23px 0 var(--toggle-color),
            23px 0 0 var(--toggle-color),
           -23px 0 0 var(--toggle-color),
            15px  15px 0 var(--toggle-color),
           -15px  15px 0 var(--toggle-color),
            15px -15px 0 var(--toggle-color),
           -15px -15px 0 var(--toggle-color);
          transform: scale(0);
          transition: all 0.3s ease;
        }

        /* ── Toggle checked (dark mode = sun) ── */
        .em-toggle-input:checked + .em-toggle-knob {
          /* push crescent off-screen by making inset huge */
          box-shadow: inset 32px -32px 0 0 var(--bg);
          transform: scale(0.5) rotate(0deg);
          transition: transform 0.3s ease 0.1s, box-shadow 0.2s ease 0s;
        }

        .em-toggle-input:checked + .em-toggle-knob::before {
          background: var(--toggle-color);
          transition: background 0.3s ease 0.1s;
        }

        .em-toggle-input:checked + .em-toggle-knob::after {
          transform: scale(1.5);
          transition: transform 0.5s ease 0.15s;
        }
      `}</style>

      {/* ── Toggle button ─────────────────────────────────────────────────── */}
      {/* Fixed at top-centre; scale(0.5) in CSS origin keeps it compact      */}
      <label
        ref={toggleRef}
        className="fixed top-3 left-1/2 -translate-x-1/2 cursor-pointer z-10"
        style={{ transform: "translateX(-50%) scale(0.5)" }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <input
          type="checkbox"
          checked={isDark}
          onChange={handleToggle}
          className="em-toggle-input hidden"
        />
        <div className="em-toggle-knob" />
      </label>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="w-full">
        {/* Top HR — full viewport width, 1px, themed */}
        <hr
          className="border-none h-px w-full m-0"
          style={{ backgroundColor: tokens.line }}
        />

        {/* ── Section: corner dots + vertical rules + h1 ────────────────── */}
        <section
          className="mx-auto text-center grid place-items-center relative"
          style={{
            // clamp matches the original: 360px → 780px over 60vw
            width: "clamp(360px, 60vw, 780px)",
            aspectRatio: "1.55 / 0.5",
            minHeight: "200px",
          }}
        >
          {/* Vertical rules — pseudo-elements aren't available in Tailwind  */}
          {/* so we render two absolutely-positioned divs instead            */}
          <div
            className="absolute left-0 top-0 w-px pointer-events-none"
            style={{ height: "100dvh", backgroundColor: tokens.line }}
          />
          <div
            className="absolute right-0 top-0 w-px pointer-events-none"
            style={{ height: "100dvh", backgroundColor: tokens.line }}
          />

          {/* ── Corner dots (4) ─────────────────────────────────────────── */}
          {/* Each is 5×5px, outlined with the bg color for a "floating" look */}
          {[
            "top-[-2px] left-[-2px]",
            "top-[-2px] right-[-2px]",
            "bottom-[-2px] right-[-2px]",
            "bottom-[-2px] left-[-2px]",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-[5px] h-[5px] rounded-full z-10`}
              style={{
                backgroundColor: tokens.dot,
                // ring uses bg color so dot appears to float above the rule lines
                boxShadow: `0 0 0 3px ${tokens.bg}`,
              }}
            />
          ))}

          {/* ── Headline ────────────────────────────────────────────────── */}
          {/* text-left so the multi-line typographic hierarchy reads correctly */}
          <h1
            className="font-bold m-0 text-left leading-[1.05]"
            style={{
              // clamp font size: 32px → 68px over viewport width
              fontSize: "clamp(32px, 6vw, 68px)",
              fontOpticalSizing: "auto",
              fontVariationSettings: '"wdth" 95',
            }}
          >
            {/* Line 1: plain text + sub — both get the vertical gradient fill */}
            <span
              style={{
                backgroundImage: `linear-gradient(180deg, ${tokens.textTop} 0%, ${tokens.textBottom} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {headline} {headlineSub}
            </span>
            <br />
            {/* Line 2: accent word — texture image blended over a flat color fill */}
            <strong
              className="inline-block tracking-[0.015em]"
              style={{
                color: "transparent",
                // The SVG texture is overlaid on a flat color via background-blend-mode
                // so the word reads as a richly-textured fill, not just flat paint
                backgroundImage: `url('${circleImageUrl}')`,
                backgroundColor: tokens.textCircle,
                backgroundSize: "400px",
                backgroundPosition: "50% 80%",
                backgroundBlendMode: "overlay",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {headlineAccent}
            </strong>{" "}
            {/* Trailing word — same gradient as line 1 */}
            <span
              style={{
                backgroundImage: `linear-gradient(180deg, ${tokens.textTop} 0%, ${tokens.textBottom} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {headlineTail}
            </span>
          </h1>
        </section>

        {/* Bottom HR */}
        <hr
          className="border-none h-px w-full m-0"
          style={{ backgroundColor: tokens.line }}
        />
      </main>
    </div>
  );
}
