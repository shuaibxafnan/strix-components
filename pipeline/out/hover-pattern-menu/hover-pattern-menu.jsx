"use client";

import { useState } from "react";

const DEFAULT_ITEMS = [
  { label: "Home", href: "#" },
  { label: "Shop", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact Us", href: "#" },
];

const PATTERN_POSITIONS = ["0% -25%", "0% -50%", "0% -75%", "0% -100%"];
const IMAGE_POSITIONS = [
  "center 45%",
  "center 50%",
  "center 55%",
  "center 60%",
];

export default function HoverPatternMenu({
  className = "",
  items = DEFAULT_ITEMS,
  backgroundImage = "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=2574&q=80",
  bgColor = "rgb(20, 20, 20)",
  patternColor = "rgba(255,255,255,0.1)",
  patternSize = "12vmin",
  patternSizeHover = "11vmin",
  bgImageSize = "110vmax",
  bgImageSizeHover = "100vmax",
  bgImageOpacity = 0.15,
  bgImageOpacityHover = 0.1,
  patternOpacityHover = 0.5,
  transitionDuration = "800ms",
  itemTransition = "400ms",
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [menuHovered, setMenuHovered] = useState(false);

  const patternPos =
    activeIndex !== null ? PATTERN_POSITIONS[activeIndex] : "0% 0%";
  const imagePos =
    activeIndex !== null ? IMAGE_POSITIONS[activeIndex] : "center 40%";

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Ibarra+Real+Nova:wght@400;700&display=swap"
      />

      <style>{`
        .hm-root { background-color: ${bgColor}; }
        .hm-pattern {
          background-image: radial-gradient(${patternColor} 9%, transparent 9%);
          background-size: ${menuHovered ? patternSizeHover : patternSize} ${menuHovered ? patternSizeHover : patternSize};
          background-position: ${patternPos};
          opacity: ${menuHovered ? patternOpacityHover : 1};
          transition: opacity ${transitionDuration} ease, background-size ${transitionDuration} ease, background-position ${transitionDuration} ease;
        }
        .hm-bgimage {
          background-image: url("${backgroundImage}");
          background-size: ${menuHovered ? bgImageSizeHover : bgImageSize};
          background-position: ${imagePos};
          opacity: ${menuHovered ? bgImageOpacityHover : bgImageOpacity};
          transition: opacity ${transitionDuration} ease, background-size ${transitionDuration} ease, background-position ${transitionDuration} ease;
        }
        .hm-item {
          font-family: 'Ibarra Real Nova', serif;
          font-size: clamp(2rem, 5vw, 5rem);
          padding: clamp(0.25rem, 0.5vw, 1rem) 0;
          transition: opacity ${itemTransition} ease;
        }
        .hm-items-wrap:hover .hm-item { opacity: 0.3; }
        .hm-item:hover { opacity: 1 !important; }
      `}</style>

      <div className={`hm-root relative flex items-center w-full h-screen overflow-hidden ${className}`}>
        <div className="hm-pattern absolute inset-0 z-[1]" />
        <div className="hm-bgimage absolute inset-0 z-0 bg-no-repeat" />
        <div
          className="hm-items-wrap relative z-[2]"
          style={{ marginLeft: "clamp(4rem, 20vw, 48rem)" }}
          onMouseEnter={() => setMenuHovered(true)}
          onMouseLeave={() => {
            setMenuHovered(false);
            setActiveIndex(null);
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="hm-item text-white cursor-pointer block select-none"
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => {
                setMenuHovered(true);
                setActiveIndex(i);
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
