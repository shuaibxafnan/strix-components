"use client";

import { useEffect, useState } from "react";

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1200&q=80",
    label: "Abstract",
  },
  {
    src: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1200&q=80",
    label: "Absurd",
  },
  {
    src: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1200&q=80",
    label: "Irusu",
  },
  {
    src: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1200&q=80",
    label: "Tokyo #1",
  },
  {
    src: "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=1200&q=80",
    label: "Cyberpunk",
  },
  {
    src: "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1200&q=80",
    label: "Tokyo #2",
  },
];

const DEFAULT_PATTERNS = [
  "4fr 4fr 3fr 2fr 0fr 0fr",
  "4fr 5fr 3fr 2fr 0fr 0fr",
  "0fr 3fr 2fr 3fr 0fr 0fr",
  "0fr 2fr 1fr 2fr 1fr 0fr",
  "0fr 0fr 2fr 4fr 3fr 2fr",
  "0fr 0fr 0fr 1fr 1fr 1fr",
];

export default function KabeSlider({
  images = DEFAULT_IMAGES,
  patterns = DEFAULT_PATTERNS,
  ariaLabel = "Next slide",
  transitionSpeed = "duration-[600ms]",
  slideInterval = 2000,
  fontFamily = "M PLUS Rounded 1c",
  fontUrl = "https://cdn.jsdelivr.net/fontsource/fonts/m-plus-rounded-1c@latest/latin-500-normal.woff2",
  backgroundColor = "bg-white",
  textColor = "text-black",
}) {
  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const total = patterns.length;
  const fractions = (patterns[index] || "").split(" ");

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(query.matches);
    const onChange = (e) => setReduceMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || total < 2) return;
    const id = setTimeout(
      () => setIndex((prev) => (prev + 1) % total),
      slideInterval,
    );
    return () => clearTimeout(id);
  }, [index, slideInterval, total, reduceMotion]);

  useEffect(() => {
    setFilled(false);
    const id = setTimeout(() => setFilled(true), 50);
    return () => clearTimeout(id);
  }, [index]);

  const step = (delta) => setIndex((prev) => (prev + delta + total) % total);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  const fontCss =
    '@font-face{font-family:"' +
    fontFamily +
    '";src:url("' +
    fontUrl +
    '") format("woff2");font-weight:500;font-display:swap;}';

  const ease = "ease-[cubic-bezier(0.77,0,0.175,1)]";

  return (
    <div
      className={`flex min-h-screen flex-col justify-center p-6 antialiased selection:bg-black selection:text-white ${backgroundColor} ${textColor}`}
    >
      <style>{fontCss}</style>

      <section
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={() => step(1)}
        onKeyDown={handleKeyDown}
        className={`grid w-full cursor-e-resize select-none gap-0 px-2 py-4 outline-none transition-[grid-template-columns] focus-visible:ring-2 focus-visible:ring-current ${transitionSpeed} ${ease}`}
        style={{ gridTemplateColumns: patterns[index] }}
      >
        {images.map((item, idx) => {
          const isHidden = fractions[idx] === "0fr";

          return (
            <div
              key={idx}
              aria-hidden={isHidden}
              className={`overflow-hidden transition-opacity ${transitionSpeed} ${ease} ${isHidden ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
            >
              <figure className="w-full px-2">
                <img
                  src={item.src}
                  alt={item.label}
                  draggable={false}
                  decoding="async"
                  className="aspect-[4/5] h-auto w-full max-w-full object-cover"
                />
                <figcaption
                  className="mt-2 max-w-[10rem] text-[18px] font-medium leading-[1.2]"
                  style={{ fontFamily: `"${fontFamily}", sans-serif` }}
                >
                  {item.label}
                </figcaption>
              </figure>
            </div>
          );
        })}
      </section>

      {!reduceMotion && total > 1 ? (
        <div className="relative mx-2 mt-6 h-px">
          <div className="absolute inset-0 bg-current opacity-15" />
          <div
            className="absolute inset-0 origin-left bg-current"
            style={{
              transform: filled ? "scaleX(1)" : "scaleX(0)",
              transition: filled
                ? "transform " + slideInterval + "ms linear"
                : "none",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}