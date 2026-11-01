"use client";

import { useEffect, useRef } from "react";

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
  textColor = "#050908",
  onClick,
  className = "",
}) {
  const buttonRef = useRef(null);
  const rectRefs = useRef([]);

  useEffect(() => {
    if (!buttonRef.current) return;
    const rx = getComputedStyle(buttonRef.current).borderRadius;
    rectRefs.current.forEach((rect) => rect?.setAttribute("rx", rx));
  }, [borderRadius]);

  const containerOffset = "100px";

  return (
    <div className={`w-full h-screen flex items-center justify-center ${className}`}>
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

      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        className="glow-btn relative cursor-pointer text-[clamp(1.25rem,5vw,2rem)] font-normal px-[1.25em] py-[0.75em] max-w-full"
        style={{
          background: bgColor,
          color: textColor,
          border: `2px solid ${borderColor}`,
          borderRadius,
          fontFamily: "system-ui",
        }}
      >
        {children}

        <svg
          className="glow-container pointer-events-none absolute opacity-0"
          style={{
            inset: `calc(${containerOffset} / -2)`,
            width: `calc(100% + ${containerOffset})`,
            height: `calc(100% + ${containerOffset})`,
          }}
        >
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
  );
}
