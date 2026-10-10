"use client";

import { useEffect, useRef } from "react";

// ─── GlowButton ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// children         ReactNode   "Hi there 👋"     Button label
// glowLineColor    string      #fff               Glow line stroke color
// glowLineThick    string      2px                Glow line stroke width
// glowLineLength   number      20                 Dash length (pathLength units)
// glowBlurColor    string      #fff               Blur stroke color
// glowBlurSize     string      10px               Blur radius + stroke width
// animationSpeed   string      1200ms             Dash animation + visibility dur
// borderRadius     string      1.25rem            Button & SVG rect corner radius
// bgColor          string      #E1EAFF            Outer wrapper bg
// borderColor      string      #ccd2e6            Button border color
// onClick          fn          —                  Click handler
// ──────────────────────────────────────────────────────────────────────────

export default function GlowButton({
  children = "Hi there 👋",
  glowLineColor = "#fff",
  glowLineThick = "2px",
  glowLineLength = 20,
  glowBlurColor = "#fff",
  glowBlurSize = "10px",
  animationSpeed = "1200ms",
  borderRadius = "1.25rem",
  bgColor = "#E1EAFF",
  borderColor = "#ccd2e6",
  onClick,
}) {
  const buttonRef = useRef(null);
  const rectRefs = useRef([]);

  // Mirror the IIFE: read computed border-radius and apply it to SVG rects
  useEffect(() => {
    if (!buttonRef.current) return;
    const rx = getComputedStyle(buttonRef.current).borderRadius;
    rectRefs.current.forEach((rect) => rect?.setAttribute("rx", rx));
  }, [borderRadius]);

  const containerOffset = "100px";

  return (
    <>
      <style>{`
        @keyframes glow-visibility {
          0%,  100% { opacity: 0; }
          25%, 75%  { opacity: 1; }
        }
        .glow-btn:is(:hover, :focus) .glow-container {
          animation: glow-visibility ${animationSpeed} ease-in;
        }
        .glow-btn:is(:hover, :focus) .glow-rect {
          stroke-dashoffset: -80px;
          transition:
            stroke-dashoffset ${animationSpeed} ease-in,
            stroke-dasharray  ${animationSpeed} ease-in;
        }
      `}</style>

      <div
        className="grid place-content-center min-h-screen"
        style={{ background: bgColor }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={onClick}
          className="glow-btn relative cursor-pointer text-[2rem] font-normal text-[#050908] bg-transparent px-[1.25em] py-[0.75em]"
          style={{
            border: `2px solid ${borderColor}`,
            borderRadius,
            fontFamily: "system-ui",
          }}
        >
          {children}

          {/* SVG glow container — inset by containerOffset/2 on each side */}
          <svg
            className="glow-container pointer-events-none absolute opacity-0"
            style={{
              inset: `calc(${containerOffset} / -2)`,
              width: `calc(100% + ${containerOffset})`,
              height: `calc(100% + ${containerOffset})`,
            }}
          >
            {/* blur rect */}
            <rect
              ref={(el) => (rectRefs.current[0] = el)}
              pathLength="100"
              strokeLinecap="round"
              className="glow-rect"
              style={{
                width: `calc(100% - ${containerOffset})`,
                height: `calc(100% - ${containerOffset})`,
                x: `calc(${containerOffset} / 2)`,
                y: `calc(${containerOffset} / 2)`,
                rx: borderRadius,
                fill: "transparent",
                stroke: glowBlurColor,
                strokeWidth: glowBlurSize,
                strokeDasharray: `${glowLineLength} ${50 - glowLineLength}`,
                filter: `blur(${glowBlurSize})`,
              }}
            />
            {/* line rect */}
            <rect
              ref={(el) => (rectRefs.current[1] = el)}
              pathLength="100"
              strokeLinecap="round"
              className="glow-rect"
              style={{
                width: `calc(100% - ${containerOffset})`,
                height: `calc(100% - ${containerOffset})`,
                x: `calc(${containerOffset} / 2)`,
                y: `calc(${containerOffset} / 2)`,
                rx: borderRadius,
                fill: "transparent",
                stroke: glowLineColor,
                strokeWidth: glowLineThick,
                strokeDasharray: `${glowLineLength} ${50 - glowLineLength}`,
              }}
            />
          </svg>
        </button>
      </div>
    </>
  );
}
