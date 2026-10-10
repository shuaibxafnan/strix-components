"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ─── ActionBar ────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items          array    (see DEFAULT_ITEMS)   Button definitions
// initialIndex   number   2                     Initially selected button index
// tooltipDelay   number   300                   First-hover tooltip delay (ms)
// tooltipQuick   number   100                   Quick delay when one is already showing (ms)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  { icon: "person", label: "Profile" },
  { icon: "push_pin", label: "Pinned" },
  { icon: "alternate_email", label: "Following" },
  { icon: "mail", label: "Inbox" },
  { icon: "edit", label: "Edit" },
  { icon: "cases", label: "Business" },
];

const SPRING =
  "linear(0,0.0018,0.0069 1.15%,0.026 2.3%,0.0637,0.1135 5.18%,0.2229 7.78%,0.5977 15.84%,0.7014,0.7904,0.8641,0.9228,0.9676 28.8%,1.0032 31.68%,1.0225,1.0352 36.29%,1.0431 38.88%,1.046 42.05%,1.0448 44.35%,1.0407 47.23%,1.0118 61.63%,1.0025 69.41%,0.9981 80.35%,0.9992 99.94%)";

export default function ActionBar({
  items = DEFAULT_ITEMS,
  initialIndex = 2,
  tooltipDelay = 300,
  tooltipQuick = 100,
}) {
  const [selectedIdx, setSelectedIdx] = useState(initialIndex);
  const [activeIdx, setActiveIdx] = useState(null); // hovered button index
  const [tooltip, setTooltip] = useState(null); // index of visible tooltip
  const [pointerPos, setPointerPos] = useState(null); // {top, left, width, height}

  const barRef = useRef(null);
  const btnRefs = useRef([]);
  const tooltipRef = useRef(null); // timeout
  const hasTooltip = tooltip !== null;

  // ── Measure a button's position relative to the bar ──────────────────
  const measureBtn = useCallback((idx) => {
    const btn = btnRefs.current[idx];
    const bar = barRef.current;
    if (!btn || !bar) return null;
    const bRect = btn.getBoundingClientRect();
    const pRect = bar.getBoundingClientRect();
    return {
      left: bRect.left - pRect.left,
      top: bRect.top - pRect.top,
      width: bRect.width,
      height: bRect.height,
    };
  }, []);

  // ── Set pointer to a button index ────────────────────────────────────
  const movePointer = useCallback(
    (idx) => {
      const pos = measureBtn(idx);
      if (pos) setPointerPos(pos);
    },
    [measureBtn],
  );

  // Init pointer on mount + resize
  useEffect(() => {
    movePointer(selectedIdx);
    const ro = new ResizeObserver(() => {
      const target = activeIdx !== null ? activeIdx : selectedIdx;
      movePointer(target);
    });
    if (barRef.current) ro.observe(barRef.current);
    return () => ro.disconnect();
  }, [selectedIdx, activeIdx, movePointer]);

  // ── Tooltip helpers ───────────────────────────────────────────────────
  const showTooltip = useCallback(
    (idx) => {
      clearTimeout(tooltipRef.current);
      const delay = hasTooltip ? tooltipQuick : tooltipDelay;
      tooltipRef.current = setTimeout(() => setTooltip(idx), delay);
    },
    [hasTooltip, tooltipDelay, tooltipQuick],
  );

  const hideTooltip = useCallback(() => {
    clearTimeout(tooltipRef.current);
    setTooltip(null);
  }, []);

  useEffect(() => () => clearTimeout(tooltipRef.current), []);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleClick = (idx) => {
    setSelectedIdx(idx);
    setActiveIdx(null);
    movePointer(idx);
    hideTooltip();
  };

  const handleEnter = (idx) => {
    setActiveIdx(idx);
    movePointer(idx);
    showTooltip(idx);
  };

  const handleLeave = (idx) => {
    setActiveIdx(null);
    movePointer(selectedIdx);
    hideTooltip();
  };

  return (
    <>
      {/* Material Symbols font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0"
      />

      {/* Hidden SVG filter */}
      <svg width="0" height="0" className="absolute">
        <filter
          id="cyber-filter"
          colorInterpolationFilters="linearRGB"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
        >
          <feDisplacementMap
            in="SourceGraphic"
            in2="SourceGraphic"
            scale="5"
            xChannelSelector="A"
            yChannelSelector="A"
            x="5"
            y="-5"
            width="100%"
            height="100%"
            result="displacementMap"
          />
        </filter>
      </svg>

      {/* Bar + pointer in a relative container */}
      <div className="relative inline-block isolation-auto">
        {/* Pointer pill (Glass blob) */}
        {pointerPos ? (
          <div
            className="absolute w-12 h-20 rounded-[2rem] border border-gray-300 bg-none pointer-events-none overflow-hidden drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)] z-10"
            style={{
              top: pointerPos.top + pointerPos.height / 2 - 40,
              left: pointerPos.left + pointerPos.width / 2 - 24,
              backdropFilter: "url(#cyber-filter) blur(4px)",
              transitionProperty: "top, left",
              transitionDuration: "1s",
              transitionTimingFunction: SPRING,
            }}
          >
            {/* Shimmer gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: [
                  "radial-gradient(1rem 3rem ellipse at 50% 85% in oklch, oklch(100% 0 0 / 0%) 10% 50%, oklch(100% 0 0 / 100%) 175% 165%)",
                  "radial-gradient(2rem 3.5rem ellipse at 45% 35% in oklch, oklch(0% 0 0 / 0%) 80%, rgba(128,128,128,0.15) 150%)",
                ].join(", "),
              }}
            />
          </div>
        ) : null}

        {/* Light Theme Action Bar */}
        <div
          ref={barRef}
          className="flex items-center bg-white border border-gray-200 rounded-2xl p-2 shadow-[0_6px_20px_rgba(0,0,0,0.06)] relative text-black"
        >
          {items.map((item, idx) => {
            const isSel = idx === selectedIdx;
            const isHovered = idx === activeIdx;

            return (
              <div key={idx} className="relative">
                {/* Tooltip */}
                {tooltip === idx && (
                  <div className="absolute bottom-[calc(100%+0.9rem)] left-1/2 -translate-x-1/2 bg-white text-black px-2.5 py-1 rounded-lg text-xs font-sans tracking-[0.3px] border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] whitespace-nowrap z-30 pointer-events-none animate-[tooltipIn_0.12s_ease-out]">
                    {item.label}
                  </div>
                )}

                <button
                  ref={(el) => (btnRefs.current[idx] = el)}
                  onClick={() => handleClick(idx)}
                  onMouseEnter={() => handleEnter(idx)}
                  onMouseLeave={() => handleLeave(idx)}
                  onFocus={() => handleEnter(idx)}
                  onBlur={() => handleLeave(idx)}
                  aria-label={item.label}
                  aria-pressed={isSel}
                  className={`relative px-4 py-2.5 flex items-center justify-center border-none rounded-full mx-1 cursor-pointer transition-colors duration-300 outline-none select-none z-20
                    ${isSel ? "bg-red-50 text-red-500" : isHovered ? "bg-gray-100 text-black" : "bg-transparent text-black"}
                  `}
                >
                  <span
                    className="material-symbols-outlined text-[24px] bg-none transition-all duration-100"
                    style={{
                      fontVariationSettings: isSel
                        ? "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24"
                        : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                      filter: isSel
                        ? "drop-shadow(0 0 4px rgba(239,68,68,0.4))"
                        : "none",
                    }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translate(-50%, 4px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </>
  );
}
