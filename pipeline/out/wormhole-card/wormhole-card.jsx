"use client";

import { useEffect, useRef } from "react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-manrope",
});

const KEYFRAMES = `
@keyframes wh-orb-x {
  0% { translate: var(--startX) var(--startY); }
  20%, 100% { translate: 0 0; }
}
@keyframes wh-orb-y {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  20%, 100% { transform: translateY(calc(0.3 * var(--sz))) scale(0.5); opacity: 0; }
}
@keyframes wh-spin {
  to { rotate: 360deg; }
}
@keyframes wh-bob {
  50% { translate: 0 -16px; }
  100% { translate: 0 0; }
}
`;

const Glyph = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-full w-full"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const DEFAULT_ORBS = [
  {
    icon: (
      <Glyph>
        <polygon points="12,2 14.9,8.9 22,9.6 16.6,14.4 18.2,21.5 12,17.8 5.8,21.5 7.4,14.4 2,9.6 9.1,8.9" />
      </Glyph>
    ),
    offset: "0s",
    startX: "-0.6",
    startY: "0",
  },
  {
    icon: (
      <Glyph>
        <polygon points="12,2 22,12 12,22 2,12" />
      </Glyph>
    ),
    offset: "4s",
    startX: "0.6",
    startY: "0",
  },
  {
    icon: (
      <Glyph>
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </Glyph>
    ),
    offset: "8s",
    startX: "-0.3",
    startY: "-0.3",
  },
  {
    icon: (
      <Glyph>
        <polygon points="12,3 22,21 2,21" />
      </Glyph>
    ),
    offset: "12s",
    startX: "0.3",
    startY: "-0.3",
  },
  {
    icon: (
      <Glyph>
        <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" />
      </Glyph>
    ),
    offset: "16s",
    startX: "-0.6",
    startY: "-0.15",
  },
  {
    icon: (
      <Glyph>
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
      </Glyph>
    ),
    offset: "20s",
    startX: "0.6",
    startY: "-0.15",
  },
];

const RINGS = [
  { cx: 251.32, cy: 130.01, rx: 248.36, ry: 125.82, w: 2 },
  { cx: 251.73, cy: 150.5, rx: 160.66, ry: 81.39, w: 1.6 },
  { cx: 251.43, cy: 186.57, rx: 107.6, ry: 54.51, w: 1 },
];

const LINES = [
  "m123.45,22.63c52.05,62.7,97.93,131.45,114.34,213.52.41,2.05,1.23,5.33,1.23,5.33,4.92,18.85,7.79,35.66,10.88,54.9",
  "m248.86,4.6c2.05,97.95,6.15,194.67,9.31,291.95",
  "m35.75,67.71c6.15,2.05,11.89,5.33,17.62,8.61,21.31,13.11,40.16,24.59,59.84,40.16,33.61,26.23,56.97,49.59,82.38,84.02,2.46,3.28,6.97,10.25,8.61,13.52,18.03,26.23,31.15,52.46,37.22,82.46",
  "m5.42,127.55c19.35,2.86,38.36,7.77,56.78,14.33,18.57,6.62,36.53,14.92,53.8,24.41,17.83,9.79,34.96,20.69,50.32,34.09,13.95,12.16,26.41,26.36,36.86,41.65,10.26,14.99,18.58,31.3,24.51,48.48.74,2.15,1.45,4.31,2.11,6.49",
  "m33.29,190.66c47.95-12.7,102.05-4.51,143.85,27.46,27.05,20.49,45.9,47.54,56.53,78.63",
  "m137.39,241.48c11.89-12.7,29.1-22.54,46.31-19.26,36.07,5.74,50.82,43.44,61.11,73.93",
  "m458.7,61.16c-46.31,23.36-84.84,58.61-119.26,98.77-10.66,13.11-18.85,25.41-27.05,39.34-17.21,31.15-31.15,63.11-36.91,98.23",
  "m495.58,115.25c-42.21,8.61-80.74,25.82-117.62,52.05-31.97,22.13-58.2,46.72-75.41,81.15-.82.82-2.05,3.69-2.87,4.51-8.2,14.75-13.52,28.28-18.2,44.71",
  "m479.19,180.01c-18.21-1.09-36.54-.34-54.6,2.23-18.1,2.57-35.95,6.98-53.15,13.19-17.54,6.34-34.66,14.39-49.94,25.16-12.74,8.98-24.38,19.6-34.01,31.88-9.22,11.75-16.53,25.03-21.02,39.3-.57,1.8-1.09,3.61-1.56,5.44",
  "m384.93,236.57c-14.34-13.52-34.84-25-55.33-16.8-31.97,13.11-50,45.9-60.17,77.81",
  "m378.37,21.81c-33.2,38.93-57.79,84.02-77.46,131.56-18.85,45.9-31.15,94.26-36.16,143.74",
];

const POINTS = [
  [3.37, 127.14],
  [36.16, 67.3],
  [33.7, 191.07],
  [136.16, 242.71],
  [384.52, 236.16],
  [479.6, 180.42],
  [497.63, 114.84],
  [459.11, 60.75],
  [377.96, 22.22],
  [249.27, 3.37],
  [123.04, 22.22],
];

const DOT_CLASSES = [
  "[animation:wh-spin_10s_linear_infinite,wh-bob_6s_ease-in-out_infinite]",
  "scale-[0.8] [animation:wh-spin_12s_linear_infinite,wh-bob_5s_ease-in-out_infinite] [animation-delay:-2s]",
  "scale-[0.7] [animation:wh-spin_8s_linear_infinite,wh-bob_4s_ease-in-out_infinite] [animation-delay:-6s] [animation-direction:reverse]",
  "[animation:wh-spin_22s_linear_infinite,wh-bob_5s_ease-in-out_infinite] [animation-delay:-5s]",
  "scale-[0.76] [animation:wh-spin_8s_linear_infinite,wh-bob_3.4s_ease-in-out_infinite] [animation-delay:-1s] [animation-direction:reverse]",
  "scale-[0.8] [animation:wh-spin_8.6s_linear_infinite,wh-bob_3.4s_ease-in-out_infinite] [animation-delay:-2s]",
  "scale-[0.9] [animation:wh-spin_9.2s_linear_infinite,wh-bob_3.4s_ease-in-out_infinite] [animation-delay:-3s] [animation-direction:reverse]",
];

const easeOutQuad = (t) => t * (2 - t);

export default function WormholeCard({
  bgColor = "#000000",
  strokeColor = "#ffffff",
  accentColor = "#404040",
  orbColor = "#ffffff",
  borderAccent = "#ffffff55",
  animationSpeed = "24s",
  orbs = DEFAULT_ORBS,
  tagText = "Hand Thrown",
  titleText = "Shaped by Hand\nFinished by Fire",
  descriptionBefore = "Every vase begins as a lump of clay and ends as ",
  descriptionHighlight = "something that holds light",
  descriptionAfter = ". No two pieces are ever the same, and that is the point.",
  className = "",
}) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const frameRef = useRef(0);
  const easingRef = useRef(false);
  const tiltRef = useRef({ x: 0, y: 0 });

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const applyTilt = (x, y) => {
    tiltRef.current = { x, y };
    cardRef.current?.style.setProperty("--tx", x);
    cardRef.current?.style.setProperty("--ty", y);
  };

  const animateTo = (endX, endY, duration) => {
    const { x: startX, y: startY } = tiltRef.current;
    const startTime = performance.now();
    easingRef.current = true;
    cancelAnimationFrame(frameRef.current);

    const step = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = easeOutQuad(progress);
      applyTilt(startX + (endX - startX) * eased, startY + (endY - startY) * eased);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
      else easingRef.current = false;
    };
    frameRef.current = requestAnimationFrame(step);
  };

  const handleMouseMove = (e) => {
    if (easingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const intensity = 42;
    const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * intensity;
    const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * intensity;
    animateTo(rotateX, rotateY, 100);
  };

  const handleMouseLeave = () => animateTo(0, 0, 200);

  return (
    <div
      className={`${manrope.variable} flex h-screen w-full select-none items-center justify-center overflow-hidden bg-[var(--bg)] antialiased [font-family:var(--font-manrope)] ${className}`}
      style={{
        "--bg": bgColor,
        "--stroke": strokeColor,
        "--accent": accentColor,
        "--orb": orbColor,
        "--border-accent": borderAccent,
        "--speed": animationSpeed,
      }}
    >
      <style>{KEYFRAMES}</style>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex h-[calc(1.05*var(--sz))] w-[var(--sz)] max-w-[calc(100vw-24px)] items-center justify-center overflow-hidden [--sz:min(90vh,clamp(360px,60vw,500px))] [perspective:1200px] [transform-style:preserve-3d]"
      >
        <div className="pointer-events-none absolute h-full w-full">
          <svg
            className="absolute inset-x-0 bottom-[-6%] m-auto w-[88%] text-[color:var(--stroke)] opacity-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 501 297.81"
            aria-hidden="true"
          >
            <g fill="none" stroke="currentColor" strokeMiterlimit="10">
              {RINGS.map((r) => (
                <ellipse
                  key={r.cx}
                  cx={r.cx}
                  cy={r.cy}
                  rx={r.rx}
                  ry={r.ry}
                  strokeWidth={r.w}
                />
              ))}
              {LINES.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <g fill="currentColor" stroke="currentColor" strokeMiterlimit="10">
              {POINTS.map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.87" />
              ))}
            </g>
          </svg>
        </div>

        <div className="pointer-events-none absolute bottom-[-6%] left-[-20%] h-[200%] w-[140%] rounded-[calc(var(--sz)/2)] [box-shadow:inset_0_0_calc(var(--sz)/6)_calc(var(--sz)/10)_var(--accent)]" />

        <div className="pointer-events-none absolute h-full w-full">
          {orbs.map((orb, index) => (
            <div
              key={index}
              className="absolute inset-x-0 bottom-[20%] m-auto h-[calc(var(--sz)/6)] w-[calc(var(--sz)/6)] rounded-full bg-[var(--orb)] text-black opacity-0 [animation:wh-orb-x_var(--speed)_cubic-bezier(0.11,0,0.5,0)_infinite,wh-orb-y_var(--speed)_cubic-bezier(0.64,0,0.92,0)_infinite] [box-shadow:0_-2px_12px_-3px_var(--orb),inset_8px_-4px_2px_0_rgba(255,255,255,0.13),inset_0_0_12px_0_rgba(255,255,255,0.8),inset_0_6px_12px_-6px_rgba(0,0,0,0.5),inset_0_32px_12px_-12px_rgba(0,0,0,0.18)]"
              style={{
                "--startX": `calc(${orb.startX} * var(--sz))`,
                "--startY": `calc(${orb.startY} * var(--sz))`,
                animationDelay: orb.offset,
              }}
            >
              <div className="absolute inset-0 m-auto h-[64%] w-[64%]">
                {orb.icon}
              </div>
              {DOT_CLASSES.map((dotClass) => (
                <div
                  key={dotClass}
                  className={`absolute inset-x-0 bottom-0 top-full m-auto h-px w-0.5 bg-white [box-shadow:0_0_4px_1px_#fff] [transform-origin:0_-36px] ${dotClass}`}
                />
              ))}
            </div>
          ))}

          <div className="absolute inset-x-0 h-full w-full rounded-[calc(var(--sz)/3)] [box-shadow:inset_0_calc(0.78*var(--sz))_calc(0.08*var(--sz))_calc(-0.18*var(--sz))_var(--bg)]" />
        </div>

        <div
          ref={cardRef}
          className="relative block h-[86%] w-[86%] rounded-[22px] border border-[color:var(--border-accent)] transition-transform duration-[400ms] ease-out [--tx:0] [--ty:0] [container-type:inline-size] [background-image:linear-gradient(calc(var(--ty)_*_-0.4deg),transparent,transparent_calc(20%_+_(-3px_*_var(--tx))),rgba(255,255,255,0.06)_calc(40%_+_(-3px_*_var(--tx))),rgba(255,255,255,0.02)_calc(70%_+_(-3px_*_var(--tx))),transparent_calc(90%_+_(-3px_*_var(--tx))),transparent)] [box-shadow:0_0_0_10000px_var(--bg)] [transform:rotateX(calc(var(--tx)_*_1deg))_rotateY(calc(var(--ty)_*_1deg))] before:absolute before:-left-3 before:-top-3 before:block before:h-[calc(100%+24px)] before:w-[calc(100%+24px)] before:rounded-[28px] before:border before:border-white/[0.03] before:content-['']"
        >
          <div className="flex h-full min-h-0 flex-col items-center justify-center gap-[5cqi] overflow-hidden p-[6cqi] text-center">
            <span className="block w-fit max-w-full rounded-[4px] border border-white/20 px-[2.5cqi] py-[1cqi] text-[clamp(0.65rem,3cqi,0.85rem)] font-semibold tracking-wide text-white [overflow-wrap:anywhere]">
              {tagText}
            </span>

            <h2 className="m-0 select-text whitespace-pre-line bg-gradient-to-b from-white to-white/50 bg-clip-text text-[clamp(1.25rem,9cqi,2.6rem)] font-extrabold leading-[1.1] tracking-tight text-transparent [overflow-wrap:anywhere] [text-wrap:balance]">
              {titleText}
            </h2>

            <p className="m-0 select-text text-[clamp(0.75rem,4.2cqi,1.1rem)] font-semibold leading-[1.45] text-white/50 [overflow-wrap:anywhere] [text-wrap:balance]">
              {descriptionBefore}
              <span className="text-white/80">{descriptionHighlight}</span>
              {descriptionAfter}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}