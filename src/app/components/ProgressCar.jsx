"use client";

import { useEffect, useRef } from "react";

const DEFAULT_PARAGRAPHS = [
  "Scroll progress is usually shown as a thin bar at the top of the page. It works, but it says very little. A moving object tells the same story and gives the reader something to watch while they read.",
  "Here the distance the car travels is mapped directly to how far down the page you are. At the top it sits at the left edge. At the very bottom it has crossed the whole width of the screen and arrived at the right edge.",
  "The position is calculated from the scroll height and the width of the window, so the car covers the same fraction of the road at any screen size.",
  "Because the car size is tied to the viewport, the same component scales from a phone to a wide monitor. The body is capped at a maximum width so it never grows larger than the artwork can handle.",
  "Updates are written straight to CSS variables on every animation frame instead of going through React state. That keeps scrolling smooth, because the page does not re-render while the car is moving.",
  "A short transition on the car softens the motion between scroll events, which helps on trackpads and mouse wheels that scroll in coarse steps.",
  "Keep scrolling and the car will reach the end of the road right as you reach the end of the page.",
];

export default function ProgressCar({
  carImageUrl = "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/ford.png",
  carAlt = "Car driving across the page",
  carHeightScale = 3.2,
  eyebrow = "Scroll progress",
  title = "A car that drives as you read",
  heading = "How it works",
  paragraphs = DEFAULT_PARAGRAPHS,
  backgroundColor = "bg-black",
  textColor = "text-neutral-400",
  className = "",
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      const width = window.innerWidth;
      const carWidth = Math.min(width / 3, 600);
      const road = width - carWidth;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(Math.max(window.scrollY / total, 0), 1) : 0;
      root.style.setProperty("--tx", `${progress * road}px`);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`min-h-screen font-mono antialiased selection:bg-zinc-800 selection:text-white ${backgroundColor} ${textColor} ${className}`}
      style={{
        "--tx": "0px",
        "--car-w": "min(33.3333vw, 600px)",
        "--ratio": carHeightScale,
      }}
    >
      <div className="mx-auto max-w-2xl px-6 py-24 sm:py-32">
        <header className="mb-20">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
            {eyebrow}
          </span>
          <h1 className="text-4xl font-light tracking-tight text-zinc-100 sm:text-5xl">
            {title}
          </h1>
        </header>

        <main className="space-y-6 text-justify text-sm leading-relaxed">
          <h2 className="mb-4 text-lg font-medium tracking-tight text-zinc-200">
            {heading}
          </h2>
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </main>
      </div>

      <div className="fixed bottom-0 left-0 z-10 h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="pointer-events-none fixed bottom-0 left-0 z-20 h-[calc(var(--car-w)/var(--ratio))] w-[var(--car-w)] transition-transform duration-100 ease-out will-change-transform [transform:scaleX(-1)_translateX(calc(var(--tx)*-1))]">
        <img
          src={carImageUrl}
          alt={carAlt}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}