"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  {
    title: "Earth",
    subtitle: "Third planet",
    body: "Mass — 5.972 × 10²⁴ kg",
    image:
      "https://images.unsplash.com/photo-1614314107768-6018061b5b72?auto=format&fit=crop&q=80&w=1374",
    accent: "#6ab4c8",
  },
  {
    title: "Saturn",
    subtitle: "Sixth planet",
    body: "Mass — 5.683 × 10²⁶ kg",
    image:
      "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&q=80&w=1374",
    accent: "#c8c46a",
  },
  {
    title: "Neptune",
    subtitle: "Eighth planet",
    body: "Mass — 1.024 × 10²⁶ kg",
    image:
      "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&q=80&w=1374",
    accent: "#8485d6",
  },
  {
    title: "Pluto",
    subtitle: "Dwarf planet",
    body: "Mass — 1.303 × 10²² kg",
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=1374",
    accent: "#c09a7a",
  },
];

export default function VerticalSplitSlider({
  slides = DEFAULT_SLIDES,
  splitRatio = 35,
  transitionMs = 500,
  leftBg = "#0d0d0d",
  leftTextColor = "#e8e8e8",
  leftMutedColor = "#555555",
  fontFamily = "Sometype Mono",
  showCounter = true,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const total = slides.length;
  useEffect(() => {
    const left = leftRef.current;
    if (!left) return;
    left.style.top = `-${(total - 1) * 100}vh`;
  }, [total]);
  function changeSlide(direction) {
    setActiveIndex((prev) => {
      let next = prev;
      if (direction === "up") {
        next = prev + 1 >= total ? 0 : prev + 1;
      } else {
        next = prev - 1 < 0 ? total - 1 : prev - 1;
      }

      const sliderHeight =
        leftRef.current?.closest(".ps-container")?.clientHeight ??
        window.innerHeight;
      if (rightRef.current) {
        rightRef.current.style.transform = `translateY(-${next * sliderHeight}px)`;
      }
      if (leftRef.current) {
        leftRef.current.style.transform = `translateY(${next * sliderHeight}px)`;
      }

      return next;
    });
  }
  const accent = slides[activeIndex]?.accent ?? "#888";
  const pad = (n) => String(n + 1).padStart(2, "0");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;700&display=swap');

        .ps-left-panel,
        .ps-right-panel {
          transition: transform ${transitionMs}ms ease-in-out;
        }
        .ps-accent-rule {
          transition: border-color ${transitionMs}ms ease-in-out,
                      color        ${transitionMs}ms ease-in-out;
        }
        .ps-watermark {
          transition: color ${transitionMs}ms ease-in-out,
                      opacity ${transitionMs}ms ease-in-out;
        }
        .ps-nav-btn:hover {
          background-color: rgba(255,255,255,0.12);
        }
        .ps-nav-btn:focus {
          outline: none;
        }
        .ps-nav-btn:active {
          transform: scale(0.94);
        }
      `}</style>
      <div
        className={`ps-container relative w-full h-screen overflow-hidden ${className}`}
        style={{ fontFamily: `'${fontFamily}', monospace` }}
      >
        <div
          ref={leftRef}
          className="ps-left-panel absolute top-0 left-0 h-full"
          style={{
            width: `${splitRatio}%`,
            backgroundColor: leftBg,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative flex flex-col justify-center h-screen px-4 sm:px-10 overflow-hidden"
              style={{ backgroundColor: leftBg }}
            >
              <span
                className="ps-watermark absolute right-4 bottom-4 select-none pointer-events-none"
                style={{
                  fontSize: "clamp(6rem, 14vw, 11rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                  color: i === activeIndex ? slide.accent : "transparent",
                  opacity: i === activeIndex ? 0.08 : 0,
                }}
                aria-hidden="true"
              >
                {pad(i)}
              </span>
              <div
                className="ps-accent-rule pl-3 sm:pl-6 relative"
                style={{
                  borderLeft: `3px solid ${i === activeIndex ? slide.accent : "transparent"}`,
                }}
              >
                <p
                  className="mb-3 tracking-[0.2em] uppercase text-xs"
                  style={{ color: leftMutedColor }}
                >
                  {slide.subtitle}
                </p>
                <h1
                  className="mb-4 font-bold leading-none"
                  style={{
                    fontSize: "clamp(1.25rem, 4vw, 3.5rem)",
                    color: leftTextColor,
                  }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-sm tracking-wide"
                  style={{ color: leftMutedColor }}
                >
                  {slide.body}
                </p>
              </div>
              {showCounter && i === activeIndex && (
                <div
                  className="absolute bottom-10 left-4 sm:left-10 text-xs tracking-[0.25em]"
                  style={{ color: leftMutedColor }}
                >
                  <span style={{ color: slide.accent }}>{pad(i)}</span>
                  <span className="mx-1">/</span>
                  <span>{pad(total - 1)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          ref={rightRef}
          className="ps-right-panel absolute top-0 h-full"
          style={{
            left: `${splitRatio}%`,
            width: `${100 - splitRatio}%`,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative h-screen w-full bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 18%)",
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="absolute z-50"
          style={{
            left: `${splitRatio}%`,
            top: "50%",
          }}
        >
          <button
            className="ps-nav-btn absolute flex items-center justify-center cursor-pointer border-none"
            onClick={() => changeSlide("down")}
            aria-label="Previous slide"
            style={{
              transform: "translateX(-100%)",
              borderRadius: "50% 0 0 50%",
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.07)",
              color: accent,
              transition: `color ${transitionMs}ms ease-in-out, background-color 0.2s`,
              fontSize: 18,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="ps-nav-btn absolute flex items-center justify-center cursor-pointer border-none"
            onClick={() => changeSlide("up")}
            aria-label="Next slide"
            style={{
              transform: "translateY(-100%)",
              borderRadius: "0 50% 50% 0",
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.07)",
              color: accent,
              transition: `color ${transitionMs}ms ease-in-out, background-color 0.2s`,
              fontSize: 18,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 10l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
