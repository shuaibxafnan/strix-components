"use client";

import { useEffect, useState } from "react";

// ─── SplitTextNav ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items           array    List items with their target route urls and text
// bgColor         string   #000000     Component wrapper background color
// fontSize        string   ...         Tailwind font sizing rule
// linkTranslateX  string   3rem        Horizontal shift amount during transition hover
// primaryFont     string   ...         Font stack class definition for the static layer
// secondaryFont   string   ...         Font stack class definition for the revealed layer
// staggerDelayMs  number   25          Letter animation cascade staggering delay threshold
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  { text: "Home", href: "#" },
  { text: "About", href: "#" },
  { text: "Contact", href: "#" },
];

export default function SplitTextNav({
  items = DEFAULT_ITEMS,
  bgColor = "#000000",
  fontSize = "text-[5rem]",
  linkTranslateX = "3rem",
  primaryFont = "font-['Playfair_Display'] italic font-normal",
  secondaryFont = "font-['Roboto'] italic font-bold",
  staggerDelayMs = 25,
}) {
  const [mounted, setMounted] = useState(false);

  // Eliminate any server-side hydration mismatches for font styling metrics
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-full min-h-screen"
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col justify-center items-center select-none overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* External CSS Font Fallback Links injection to assure cross-origin safety */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=Roboto:ital,wght@1,500&display=swap");
      `}</style>

      <nav className="flex flex-col items-center justify-center gap-4">
        {items.map((item, itemIdx) => {
          // Convert plain text into split iterable characters string matrix
          const characters = item.text.split("");

          return (
            <a
              key={itemIdx}
              href={item.href}
              className={`
                group relative grid no-underline text-white overflow-visible
                outline-none focus:outline-none focus:border-none ${fontSize}
              `}
              style={{
                "--link-x-shift": linkTranslateX,
              }}
            >
              {/* Layer 1: Primary Font (Fades out & rotates forward on hover) */}
              <span
                className={`
                  [grid-area:1/1] flex flex-row items-center whitespace-nowrap opacity-100
                  group-hover:opacity-0 transition-all duration-[400ms] cubic-bezier(0.445, 0.05, 0.55, 0.95)
                  group-hover:translate-x-[var(--link-x-shift)]
                  ${primaryFont}
                `}
              >
                {characters.map((char, charIdx) => (
                  <span
                    key={charIdx}
                    className="
                      inline-block origin-[50%_50%_0.4em] [backface-visibility:hidden] -mx-[0.02em]
                      transition-transform duration-500 cubic-bezier(0.5, 0, 0, 1)
                      group-hover:[transform:rotate3d(1,0.3,0,-90deg)]
                    "
                    style={{
                      transitionDelay: `${charIdx * staggerDelayMs}ms`,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>

              {/* Layer 2: Secondary Font (Rotated downward initially, reveals on hover) */}
              <span
                className={`
                  [grid-area:1/1] flex flex-row items-center whitespace-nowrap opacity-0
                  group-hover:opacity-100 transition-all duration-[400ms] cubic-bezier(0.445, 0.05, 0.55, 0.95)
                  group-hover:translate-x-[var(--link-x-shift)]
                  ${secondaryFont}
                `}
              >
                {characters.map((char, charIdx) => (
                  <span
                    key={charIdx}
                    className="
                      inline-block origin-[50%_50%_0.4em] [backface-visibility:hidden] -mx-[0.02em]
                      [transform:rotate3d(1,-0.5,0,90deg)]
                      transition-transform duration-500 cubic-bezier(0.5, 0, 0, 1)
                      group-hover:[transform:rotate3d(0,0,0,90deg)]
                    "
                    style={{
                      transitionDelay: `${charIdx * staggerDelayMs}ms`,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
