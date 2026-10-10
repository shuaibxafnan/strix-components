"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── CoffeeMilkSlider ────────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// initialValue     number   86         Starting slider value (0-100, coffee %)
// trackHeight      number   60         Height of the track in px
// coffeeSolid      string   null       Override coffee fill (opaque). Uses amber if null.
// milkSolid        string   null       Override milk fill (opaque). Uses white/cream if null.
// indicatorColor   string   null       Center bar color. Defaults to contrasting auto color.
// bgColor          string   "#0a0a0a"  Background color of the wrapper
// gridColor        string   null       Grid line color. Auto-derives from bgColor if null.
// showDebug        boolean  false      Show reveal/debug outline mode
// springDuration   number   650        Transition duration for track height (ms)
// updateDuration   number   100        Transition duration for slide position (ms)
// ─────────────────────────────────────────────────────────────────────────────

export default function CoffeeMilkSlider({
  initialValue = 86,
  trackHeight = 60,
  coffeeSolid = null,
  milkSolid = null,
  indicatorColor = null,
  bgColor = "#0a0a0a",
  gridColor = null,
  showDebug = false,
  springDuration = 650,
  updateDuration = 100,
}) {
  const [value, setValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);
  const [shift, setShift] = useState(0);
  const shiftTimerRef = useRef(null);

  // Shift tooltip down when thumb is in the middle zone (labels would overlap)
  useEffect(() => {
    const inMiddle = value > 40 && value < 68;
    if (shiftTimerRef.current) clearTimeout(shiftTimerRef.current);
    if (inMiddle) {
      setShift(1);
    } else {
      shiftTimerRef.current = setTimeout(() => setShift(0), 50);
    }
    return () => clearTimeout(shiftTimerRef.current);
  }, [value]);

  const handleChange = useCallback((e) => setValue(Number(e.target.value)), []);
  const handlePointerDown = useCallback(() => setIsActive(true), []);
  const handlePointerUp = useCallback(() => setIsActive(false), []);

  // ── Color logic ─────────────────────────────────────────────────────────
  // Coffee: rich amber-brown, opacity 0.85–1 so it reads on any bg
  const coffeeL = Math.round(28 + 18 * ((100 - value) / 100)); // 28–46% lightness
  const coffeeFill = coffeeSolid || `hsl(24, 74%, ${coffeeL}%)`;

  // Milk: creamy white with slight warmth, opacity scales with milk dominance
  const milkAlpha = (0.55 + 0.45 * ((100 - value) / 100)).toFixed(2);
  const milkFill = milkSolid || `rgba(240, 228, 210, ${milkAlpha})`;

  // Auto indicator: white on dark bg, dark on light bg (simple heuristic)
  const autoIndicator = (() => {
    // parse bgColor hex to determine if dark
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? "rgba(255,255,255,0.9)" : "rgba(30,20,10,0.7)";
  })();
  const barColor = indicatorColor || autoIndicator;

  // ── Grid lines ──────────────────────────────────────────────────────────
  const resolvedGridColor = gridColor || "rgba(255,255,255,0.06)";

  // ── Layout ──────────────────────────────────────────────────────────────
  const trackHeightPct = shift === 1 ? "100%" : "50%";
  const slideTranslate = `calc(-50% + ${value}%)`;
  const coffeePercent = value;
  const milkPercent = 100 - value;

  const debugStyle = showDebug
    ? { outline: "2px dashed rgba(255,255,255,0.6)" }
    : { clipPath: "inset(0 -4px 0 -4px round 6px)" };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* ── Grid background (pseudo-element via absolute div) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${resolvedGridColor} 1px, transparent 1px 45px), linear-gradient(90deg, ${resolvedGridColor} 1px, transparent 1px 45px)`,
          backgroundSize: "45px 45px",
          backgroundPosition: "50% 50%",
          maskImage: "linear-gradient(-20deg, transparent 40%, white 80%)",
          WebkitMaskImage:
            "linear-gradient(-20deg, transparent 40%, white 80%)",
        }}
      />

      {/* ── Control wrapper ── */}
      <div
        className="relative grid place-items-center mx-auto"
        style={{ width: 300, height: trackHeight }}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
      >
        {/* ── Range input — invisible, captures all pointer events ── */}
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          aria-label="Coffee to Milk Ratio"
          className="absolute z-10"
          style={{
            width: 300,
            height: trackHeight,
            opacity: 0,
            cursor: "grab",
            touchAction: "none",
            WebkitAppearance: "none",
            appearance: "none",
          }}
        />

        {/* ── Tooltip labels ── */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 z-[6] pointer-events-none flex items-center justify-between px-2"
          style={{
            height: "50%",
            transform: `translateY(${shift * 50}%)`,
            transition: `transform ${springDuration}ms cubic-bezier(0.34,1.56,0.64,1)`,
          }}
        >
          <span
            className="font-mono font-bold text-sm tabular-nums tracking-tight select-none"
            style={{
              color: `hsl(24, 74%, ${Math.round(coffeeFill === coffeeSolid ? 54 : Math.min(coffeeL + 26, 78))}%)`,
              opacity: value > 65 ? 1 : Math.max(0.4, 0.5 + value / 200),
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            COFFEE {coffeePercent}%
          </span>
          <span
            className="font-mono font-bold text-sm tabular-nums tracking-tight select-none"
            style={{
              color: "rgb(240, 228, 210)",
              opacity:
                value < 35 ? 1 : Math.max(0.4, 0.5 + (100 - value) / 200),
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {milkPercent}% MILK
          </span>
        </div>

        {/* ── Visual track ── */}
        <div
          className="absolute bottom-0 w-full pointer-events-none z-[5]"
          style={{
            height: trackHeightPct,
            transition: `height ${springDuration}ms cubic-bezier(0.34,1.56,0.64,1)`,
            ...debugStyle,
          }}
        >
          {/* Sliding strip */}
          <div
            className="relative w-full h-full"
            style={{
              transform: `translateX(${slideTranslate})`,
              transition: `transform ${updateDuration}ms linear`,
            }}
          >
            {/* Coffee fill — left of center */}
            <div
              className="absolute h-full"
              style={{
                background: coffeeFill,
                right: "calc(50% + 8px)",
                width: "100%",
                borderRadius: 6,
              }}
            />

            {/* Center indicator bar */}
            <div
              className="absolute"
              style={{
                height: "75%",
                width: 4,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: isActive
                  ? barColor
                  : barColor.replace(/[\d.]+\)$/, "0.45)"),
                borderRadius: 4,
                transition: "background 0.2s",
                zIndex: 2,
                boxShadow: isActive ? `0 0 8px ${barColor}` : "none",
              }}
            />

            {/* Milk fill — right of center */}
            <div
              className="absolute h-full"
              style={{
                background: milkFill,
                left: "calc(50% + 8px)",
                width: "100%",
                borderRadius: 6,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
