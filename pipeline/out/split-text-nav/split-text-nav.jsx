"use client";

import { useEffect, useState } from "react";

const DEFAULT_ITEMS = [
  { text: "Home", href: "#" },
  { text: "About", href: "#" },
  { text: "Contact", href: "#" },
];

export default function SplitTextNav({
  items = DEFAULT_ITEMS,
  bgColor = "#000000",
  textColor = "#ffffff",
  fontSize = "text-[clamp(2.5rem,12vw,5rem)]",
  linkTranslateX = "3rem",
  primaryFont = "font-['Playfair_Display'] italic font-normal",
  secondaryFont = "font-['Roboto'] italic font-bold",
  staggerDelayMs = 25,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-full min-h-screen ${className}`}
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  return (
    <div
      className={`w-full min-h-screen flex flex-col justify-center items-center select-none overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=Roboto:ital,wght@1,500&display=swap");
      `}</style>

      <nav className="flex flex-col items-center justify-center gap-4">
        {items.map((item, itemIdx) => {
          const characters = item.text.split("");

          return (
            <a
              key={itemIdx}
              href={item.href}
              className={`
                group relative grid no-underline overflow-visible
                outline-none focus:outline-none focus:border-none ${fontSize}
              `}
              style={{
                "--link-x-shift": linkTranslateX,
                color: textColor,
              }}
            >
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
                    {char === " " ? " " : char}
                  </span>
                ))}
              </span>

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
                    {char === " " ? " " : char}
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
