"use client";

import { useEffect, useRef, useState } from "react";

// ─── DotMatrixControls ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// darkBg           string   #000000    Background in dark mode
// lightBg          string   hsl(…)     Background in light mode (auto-computed)
// darkFg           string   #ffffff    Foreground (text + dots) in dark mode
// lightFg          string   hsl(…)     Foreground in light mode (auto-computed)
// accentColor      string   hsl(0,80%,55%)  Accent used for value labels
// dotBgDark        string   #333       Unlit dot color in dark mode
// dotFgDark        string   #ffffff    Lit dot color in dark mode
// dotBgLight       string   #222       Unlit dot color in light mode
// dotFgLight       string   #ffffff    Lit dot color in light mode
// patternColorDark string   rgba(255,255,255,0.15)  Dot-grid pattern in dark mode
// patternColorLight string  rgba(0,0,0,0.07)        Dot-grid pattern in light mode
// gridCols         number   15         Dot columns per control canvas
// gridRows         number   30         Dot rows per control canvas
// dotRadiusFactor  number   0.3        Dot radius as fraction of cell size
// targetBrightness number   68         Initial brightness value animated to on mount
// targetVolume     number   45         Initial volume value animated to on mount
// targetFontIndex  number   2          Initial font size index animated to on mount
// animDuration     number   800        Entrance animation duration (ms)
// animStagger      number   150        Per-control stagger delay (ms)
// fontSizes        number[] [10..22]   Available font size steps (px)
// title            string   …          Top-left title line
// subtitle         string   …          Top-left subtitle line (supports plain text only)
// spotifyHref      string   …          Link href on subtitle artist name
// spotifyLabel     string   "LXSTNGHT" Clickable artist name in subtitle
// quote            string   …          Bottom-left quote
// creditsLabel     string   …          Bottom-right credits text
// creditsHref      string   …          Bottom-right credits link href
// creditsLinkLabel string   …          Bottom-right credits link text
// audioSrc         string   …          MP3 URL for background audio
// ──────────────────────────────────────────────────────────────────────────

// ── Icon pixel maps (21×21) ──────────────────────────────────────────────────

// Sun / brightness icon
const SUN_ICON = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Volume / speaker icon
const VOLUME_ICON = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Font size icon — built from 15×15 base, scaled 0.8×, centred in 21×21
const FONT_ICON = (() => {
  const base = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // Scale 0.8× around centre of 15×15
  const scaled = Array.from({ length: 15 }, () => Array(15).fill(0));
  const cx = 7,
    cy = 7;
  base.forEach((row, y) =>
    row.forEach((v, x) => {
      if (!v) return;
      const sx = Math.round((x - cx) * 0.8) + cx;
      const sy = Math.round((y - cy) * 0.8) + cy;
      if (sx >= 0 && sx < 15 && sy >= 0 && sy < 15) scaled[sy][sx] = 1;
    }),
  );
  // Centre into 21×21
  const out = Array.from({ length: 21 }, () => Array(21).fill(0));
  const ox = Math.floor((21 - 15) / 2);
  const oy = Math.floor((21 - 15) / 2);
  scaled.forEach((row, y) =>
    row.forEach((v, x) => {
      out[y + oy][x + ox] = v;
    }),
  );
  return out;
})();

export default function DotMatrixControls({
  darkBg = "#000000",
  lightBg = null, // auto-computed from brightness
  darkFg = "#ffffff",
  lightFg = null, // auto-computed from brightness
  accentColor = "hsl(0, 80%, 55%)",
  dotBgDark = "#333",
  dotFgDark = "#ffffff",
  dotBgLight = "#222",
  dotFgLight = "#ffffff",
  patternColorDark = "rgba(255,255,255,0.15)",
  patternColorLight = "rgba(0,0,0,0.07)",
  gridCols = 15,
  gridRows = 30,
  dotRadiusFactor = 0.3,
  targetBrightness = 68,
  targetVolume = 45,
  targetFontIndex = 2,
  animDuration = 800,
  animStagger = 150,
  fontSizes = [10, 12, 14, 16, 18, 20, 22],
  title = "The Shape of Absence",
  subtitle = "Music by myself aka",
  spotifyHref = "https://open.spotify.com/artist/6YXgRMajnjib8j6Cxzcryp",
  spotifyLabel = "LXSTNGHT",
  quote = "Silence gives form to sound as darkness gives form to light.",
  creditsLabel = "Original Idea by",
  creditsHref = "https://x.com/jonkantner",
  creditsLinkLabel = "Jon Kantner",
  audioSrc = "https://dl.dropboxusercontent.com/scl/fi/kiioubd8rrkikem985ogn/the-shape-of-absence.mp3?rlkey=cy8jobnee3bocnlk1o9c2mjv8&dl=1",
}) {
  // ── Refs ────────────────────────────────────────────────────────────────────
  const brightnessCvs = useRef(null);
  const volumeCvs = useRef(null);
  const fontSizeCvs = useRef(null);
  const audioRef = useRef(null);
  const rafRef = useRef(null);

  // ── State — drives JSX re-render for theme, mode label, value labels ────────
  const [brightness, setBrightness] = useState(0);
  const [volume, setVolume] = useState(0);
  const [fontIdx, setFontIdx] = useState(0);
  const [isLightMode, setIsLightMode] = useState(false);

  // ── Mutable value refs — read by canvas draw loop without triggering renders ─
  const bValRef = useRef(0);
  const vValRef = useRef(0);
  const fValRef = useRef(0);

  // ─── Canvas helpers ─────────────────────────────────────────────────────────

  const setupCanvas = (canvas) => {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return ctx;
  };

  // Draws the dot-matrix column for one control.
  // value    — current 0–maxValue reading
  // maxValue — upper bound for fill calculation
  // icon     — 21×21 pixel map (1 = dot present)
  // isLight  — current theme flag to select dot colours
  const drawControl = (canvas, value, maxValue, icon, isLight) => {
    if (!canvas) return;
    const ctx = setupCanvas(canvas);
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    const cellW = width / gridCols;
    const cellH = height / gridRows;
    const dotR = Math.min(cellW, cellH) * dotRadiusFactor;
    const fillHeight = height * (value / maxValue);

    // Runtime colour values — must come from props, not Tailwind
    const bgCol = isLight ? dotBgLight : dotBgDark;
    const fgCol = isLight ? dotFgLight : dotFgDark;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const x = col * cellW + cellW / 2;
        const y = row * cellH + cellH / 2;

        // ── Icon overlay ─────────────────────────────────────────────────────
        let isIconDot = false;
        if (icon) {
          const iRows = icon.length;
          const iCols = icon[0].length;
          const iconStartRow =
            Math.floor(gridRows * 0.6) - Math.floor(iRows / 2);
          const iconStartCol = Math.floor((gridCols - iCols) / 2);
          const ir = row - iconStartRow;
          const ic = col - iconStartCol;
          if (
            ir >= 0 &&
            ir < iRows &&
            ic >= 0 &&
            ic < iCols &&
            icon[ir][ic] === 1
          ) {
            isIconDot = true;
          }
        }

        const isFilled = height - y <= fillHeight;

        ctx.beginPath();
        ctx.arc(x, y, isIconDot ? dotR * 1.1 : dotR, 0, Math.PI * 2);
        // Icon dots invert fg/bg relative to their fill level for contrast
        ctx.fillStyle = isIconDot
          ? isFilled
            ? bgCol
            : fgCol
          : isFilled
            ? fgCol
            : bgCol;
        ctx.fill();
      }
    }
  };

  // Redraws all three canvases with current ref values
  const redrawAll = (bv, vv, fv, light) => {
    drawControl(brightnessCvs.current, bv, 100, SUN_ICON, light);
    drawControl(volumeCvs.current, vv, 100, VOLUME_ICON, light);
    drawControl(
      fontSizeCvs.current,
      fv,
      fontSizes.length - 1,
      FONT_ICON,
      light,
    );
  };

  // ─── Drag handler factory ───────────────────────────────────────────────────

  const setupDrag = (containerRef, onUpdate) => {
    const el = containerRef.current;
    if (!el) return () => {};

    let dragging = false;

    const getY = (e) =>
      e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

    const update = (e) => {
      const rect = el.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(1, (rect.bottom - getY(e)) / rect.height),
      );
      onUpdate(pct);
    };

    const onMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      update(e);
    };
    const onEnd = () => {
      dragging = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchend", onEnd);
    };
    const onStart = (e) => {
      e.preventDefault();
      dragging = true;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchend", onEnd);
      update(e);
    };

    el.addEventListener("mousedown", onStart);
    el.addEventListener("touchstart", onStart, { passive: false });
    return () => {
      el.removeEventListener("mousedown", onStart);
      el.removeEventListener("touchstart", onStart);
      onEnd();
    };
  };

  // ── Drag ref containers — needed so setupDrag can reach the DOM nodes ───────
  const brightnessDragRef = useRef(null);
  const volumeDragRef = useRef(null);
  const fontSizeDragRef = useRef(null);

  // ─── Main effect — runs once on mount ──────────────────────────────────────

  useEffect(() => {
    // ── Easing ───────────────────────────────────────────────────────────────
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    // ── Sync state + redraw whenever values change ────────────────────────────
    const sync = () => {
      const bv = bValRef.current;
      const vv = vValRef.current;
      const fv = fValRef.current;
      const light = bv > 50;

      setBrightness(Math.round(bv));
      setVolume(Math.round(vv));
      setFontIdx(Math.round(fv));
      setIsLightMode(light);

      if (audioRef.current) audioRef.current.volume = vv / 100;

      redrawAll(bv, vv, fv, light);
    };

    // ── Drag setup ────────────────────────────────────────────────────────────
    const cleanB = setupDrag(brightnessDragRef, (pct) => {
      bValRef.current = Math.round(pct * 100);
      sync();
    });
    const cleanV = setupDrag(volumeDragRef, (pct) => {
      vValRef.current = Math.round(pct * 100);
      sync();
    });
    const cleanF = setupDrag(fontSizeDragRef, (pct) => {
      fValRef.current = Math.min(
        fontSizes.length - 1,
        Math.round(pct * (fontSizes.length - 1)),
      );
      sync();
    });

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => sync();
    window.addEventListener("resize", onResize);

    // ── Audio play on first interaction ───────────────────────────────────────
    const onFirstClick = () => {
      audioRef.current?.play().catch(() => {});
    };
    document.addEventListener("click", onFirstClick, { once: true });

    // ── Entrance animation ────────────────────────────────────────────────────
    const start = performance.now();
    const animate = (now) => {
      const el = now - start;

      // Brightness — starts at t=0
      bValRef.current =
        el <= animDuration
          ? easeOutCubic(el / animDuration) * targetBrightness
          : targetBrightness;

      // Volume — starts at t=stagger
      if (el >= animStagger) {
        const p = Math.min(1, (el - animStagger) / animDuration);
        vValRef.current =
          el <= animDuration + animStagger
            ? easeOutCubic(p) * targetVolume
            : targetVolume;
      }

      // Font size index — starts at t=2×stagger
      if (el >= animStagger * 2) {
        const p = Math.min(1, (el - animStagger * 2) / animDuration);
        fValRef.current =
          el <= animDuration + animStagger * 2
            ? easeOutCubic(p) * targetFontIndex
            : targetFontIndex;
      }

      sync();

      if (el < animDuration + animStagger * 2) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 300);

    return () => {
      cleanB();
      cleanV();
      cleanF();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onFirstClick);
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Derived display values (from state, safe for SSR) ───────────────────────
  const displayFontSize = fontSizes[Math.min(fontIdx, fontSizes.length - 1)];

  // Runtime bg/fg colours shift with brightness — must be inline, not Tailwind
  const bgColor = isLightMode
    ? (lightBg ?? `hsl(223, 10%, ${95 - (1 - brightness / 100) * 20}%)`)
    : darkBg;
  const fgColor = isLightMode ? (lightFg ?? "hsl(223, 10%, 15%)") : darkFg;
  const patternColor = isLightMode ? patternColorLight : patternColorDark;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex"
      style={{
        backgroundColor: bgColor,
        color: fgColor,
        fontSize: 12,
        fontFamily: "'TheGoodMonolith', 'Courier New', monospace",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* ── Dotted background grid — SVG pattern, full bleed ─────────────────── */}
      {/*   patternColor is runtime → inline style on the circle fill            */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dmc-dotgrid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            {/* fill is runtime (theme-dependent) → inline */}
            <circle cx="2" cy="2" r="1" fill={patternColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dmc-dotgrid)" />
      </svg>

      {/* ── Top-left: title + subtitle ────────────────────────────────────────── */}
      <div
        className="fixed top-8 left-8 tracking-[1px] z-10 leading-relaxed"
        style={{
          color: fgColor,
          fontSize: displayFontSize,
          transition: "color 0.3s ease, font-size 0.3s ease",
        }}
      >
        <p>{title}</p>
        <p>
          {subtitle}{" "}
          <a
            href={spotifyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold no-underline dmc-link"
            style={{ color: fgColor }}
          >
            {spotifyLabel}
          </a>
        </p>
      </div>

      {/* ── Top-right: theme mode indicator ──────────────────────────────────── */}
      <div
        className="fixed top-8 right-8 tracking-[1px] flex items-center gap-2 z-10"
        style={{
          color: fgColor,
          fontSize: displayFontSize,
          transition: "color 0.3s ease, font-size 0.3s ease",
        }}
      >
        {/* Indicator dot — runtime fg colour → inline */}
        <span
          className="inline-block w-[0.6em] h-[0.6em] rounded-full"
          style={{
            backgroundColor: fgColor,
            transition: "background-color 0.3s ease",
          }}
        />
        <p>{isLightMode ? "LIGHT MODE" : "DARK MODE"}</p>
      </div>

      {/* ── Centre: three dot-matrix controls ────────────────────────────────── */}
      <main className="flex overflow-x-hidden w-screen h-screen relative z-[1]">
        <div className="grid grid-cols-3 gap-6 m-auto py-6">
          {/* ── Brightness control ─────────────────────────────────────────── */}
          <div className="flex flex-col items-center">
            {/* Drag target wraps the canvas so the full column is interactive */}
            <div
              ref={brightnessDragRef}
              className="relative cursor-pointer"
              style={{ width: "10.5em", height: "22em" }}
            >
              <canvas
                ref={brightnessCvs}
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <p
              className="uppercase tracking-[1px] mt-3"
              style={{
                color: fgColor,
                fontSize: displayFontSize,
                transition: "color 0.5s ease, font-size 0.3s ease",
              }}
            >
              Brightness
            </p>
            <p
              className="mt-1"
              style={{
                color: accentColor,
                fontSize: displayFontSize,
                transition: "color 0.5s ease, font-size 0.3s ease",
              }}
            >
              {brightness}%
            </p>
          </div>

          {/* ── Volume control ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center">
            <div
              ref={volumeDragRef}
              className="relative cursor-pointer"
              style={{ width: "10.5em", height: "22em" }}
            >
              <canvas
                ref={volumeCvs}
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <p
              className="uppercase tracking-[1px] mt-3"
              style={{
                color: fgColor,
                fontSize: displayFontSize,
                transition: "color 0.5s ease, font-size 0.3s ease",
              }}
            >
              Volume
            </p>
            <p
              className="mt-1"
              style={{
                color: accentColor,
                fontSize: displayFontSize,
                transition: "color 0.5s ease, font-size 0.3s ease",
              }}
            >
              {volume}%
            </p>
          </div>

          {/* ── Font size control ──────────────────────────────────────────── */}
          <div className="flex flex-col items-center">
            <div
              ref={fontSizeDragRef}
              className="relative cursor-pointer"
              style={{ width: "10.5em", height: "22em" }}
            >
              <canvas
                ref={fontSizeCvs}
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <p
              className="uppercase tracking-[1px] mt-3"
              style={{
                color: fgColor,
                fontSize: displayFontSize,
                transition: "color 0.5s ease, font-size 0.3s ease",
              }}
            >
              Font Size
            </p>
            <p
              className="mt-1"
              style={{
                color: accentColor,
                fontSize: displayFontSize,
                transition: "color 0.5s ease, font-size 0.3s ease",
              }}
            >
              {displayFontSize}px
            </p>
          </div>
        </div>
      </main>

      {/* ── Bottom-left: quote ────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-8 left-8 tracking-[1px] z-10"
        style={{
          color: fgColor,
          fontSize: displayFontSize,
          transition: "color 0.3s ease, font-size 0.3s ease",
        }}
      >
        <p>{quote}</p>
      </div>

      {/* ── Bottom-right: credits ─────────────────────────────────────────────── */}
      <div
        className="fixed bottom-8 right-8 tracking-[1px] text-right z-10"
        style={{
          color: fgColor,
          fontSize: displayFontSize,
          transition: "color 0.3s ease, font-size 0.3s ease",
        }}
      >
        <p>
          {creditsLabel}{" "}
          <a
            href={creditsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold no-underline dmc-link"
            style={{ color: fgColor }}
          >
            {creditsLinkLabel}
          </a>
        </p>
      </div>

      {/* ── Audio element — hidden, autoplay + loop ───────────────────────────── */}
      <audio ref={audioRef} autoPlay loop className="hidden">
        <source src={audioSrc} type="audio/mp3" />
      </audio>

      {/* ── Scoped styles ─────────────────────────────────────────────────────────
          Link hover fill-sweep cannot be done with Tailwind:
          - ::after pseudo-element with animated width
          - mix-blend-mode: difference on :hover
          The font-family import also lives here so it is scoped to this component.
      ──────────────────────────────────────────────────────────────────────────── */}
      <style>{`
        @import url("https://fonts.cdnfonts.com/css/thegoodmonolith");

        .dmc-link {
          position: relative;
          display: inline-block;
          text-decoration: none;
        }
        .dmc-link::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 0;
          height: 100%;
          background-color: currentColor;
          z-index: -1;
          transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .dmc-link:hover::after {
          width: 100%;
        }
        .dmc-link:hover {
          mix-blend-mode: difference;
        }
      `}</style>
    </div>
  );
}
