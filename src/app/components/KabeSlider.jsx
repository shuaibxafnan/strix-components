"use client";

import { useState, useEffect, useRef } from "react";

// ─── KabeSlider ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// siteTitle        string    "KABE"           Main site title string
// navLinks         array     [...]            Navigation link configurations
// transitionSpeed  string    "duration-400"   Tailwind duration config class
// slideInterval    number    2000             Autoplay timing interval (ms)
// images           array     [...]            Grid item images and captions
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  { src: "https://i.ibb.co/HfQRNdRC/image10.jpg", label: "Abstract" },
  { src: "https://i.ibb.co/Q7F31VYw/image2.jpg", label: "Absurd" },
  { src: "https://i.ibb.co/VWm379JK/image3.jpg", label: "Irusu" },
  { src: "https://i.ibb.co/xSFdzFCY/image4.png", label: "Tokyo #1" },
  { src: "https://i.ibb.co/zWJ1Xtnj/three.jpg", label: "Cyberpunk" },
  { src: "https://i.ibb.co/60Lzfdcv/image7.jpg", label: "Tokyo #2" },
];

const DEFAULT_NAV = [
  { label: "Prints", href: "#" },
  { label: "A-Z", href: "#" },
  { label: "About", href: "#" },
];

const PATTERNS = [
  "4fr 4fr 3fr 2fr 0fr 0fr",
  "4fr 5fr 3fr 2fr 0fr 0fr",
  "0fr 3fr 2fr 3fr 0fr 0fr",
  "0fr 2fr 1fr 2fr 1fr 0fr",
  "0fr 0fr 2fr 4fr 3fr 2fr",
  "0fr 0fr 0fr 1fr 1fr 1fr",
];

export default function KabeSlider({
  siteTitle = "KABE",
  navLinks = DEFAULT_NAV,
  transitionSpeed = "duration-400",
  slideInterval = 2000,
  images = DEFAULT_IMAGES,
}) {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  // Parse current layout configuration string cleanly for safety
  const currentGridPattern = PATTERNS[index];
  const currentFractions = currentGridPattern.split(" ");

  const nextSlide = () => {
    setIndex((prevIndex) => (prevIndex + 1) % PATTERNS.length);
  };

  // Safe side effect cycle initialization
  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, slideInterval);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, slideInterval]);

  const handleManualClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    nextSlide();
  };

  return (
    <div className="min-h-screen bg-[#f2e9e1] text-[#191724] p-6 antialiased selection:bg-[#191724]/10">
      {/* Dynamic Font Embedding to guarantee layout parity without SSR hydration flashes */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cherry+Bomb+One&family=M+PLUS+Rounded+1c:wght@600&display=swap");
        .font-cherry-bomb {
          font-family: "Cherry Bomb One", serif;
        }
        .font-m-plus {
          font-family: "M PLUS Rounded 1c", serif;
          font-weight: 600;
        }
      `}</style>

      {/* Header element context */}
      <header className="font-m-plus flex items-center justify-between p-4 pb-0">
        <h1 className="font-cherry-bomb text-[36px] font-[700] leading-none">
          {siteTitle}
        </h1>
        <nav className="flex gap-4">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-current underline-offset-[2px] hover:opacity-80 transition-opacity"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Main Dynamic Grid Canvas */}
      <section
        onClick={handleManualClick}
        className={`grid gap-0 w-full cursor-e-resize p-4 px-2 transition-[grid-template-columns] ${transitionSpeed}`}
        style={{ gridTemplateColumns: currentGridPattern }}
      >
        {images.map((item, idx) => {
          // Detect visibility conditions using programmatic fraction boundaries
          const isHidden = currentFractions[idx] === "0fr";

          return (
            <div
              key={idx}
              className={`overflow-hidden transition-opacity ${transitionSpeed} ${
                isHidden ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <figure className="w-full px-2">
                <img
                  src={item.src}
                  alt={item.label}
                  className="max-w-full aspect-[4/5] object-cover"
                />
                <figcaption className="font-m-plus max-w-[10rem] mt-1 text-[18px] leading-[1.2]">
                  {item.label}
                </figcaption>
              </figure>
            </div>
          );
        })}
      </section>
    </div>
  );
}
