"use client";

import { useEffect, useState, useRef } from "react";

// ─── ElegantOverlayCarousel ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   "#ECEFFC"           Component frame background color
// imageWidth         number   450                 Width configuration of product images (px)
// imageHeight        number   450                 Height configuration of product images (px)
// overlayWidth       string   "36em"              Horizontal layout size profile of color bars
// overlayHeight      string   "18em"              Vertical layout size profile of color bars
// animDurationMs     number   600                 Image slide translation time index (ms)
// barDurationMs      number   1200                Color block expansion time index (ms)
// carouselData       array    [MOCK_DATA]         Interactive slide context list collection
// ──────────────────────────────────────────────────────────────────────────

const CAROUSEL_DEFAULT_DATA = [
  {
    id: "item-1",
    label: "Stainless Steel",
    imgUrl: "https://i.loli.net/2020/01/20/2wx8npJFiDUzu4T.png",
    color: "#bdc3c7",
  },
  {
    id: "item-2",
    label: "Army Green",
    imgUrl: "https://i.loli.net/2020/01/20/YWA6RhCcESgN3Ty.png",
    color: "#218c74",
  },
  {
    id: "item-3",
    label: "Cranberry",
    imgUrl: "https://i.loli.net/2020/01/19/4HaLyI7NQRf3teO.png",
    color: "#dd6b7b",
  },
  {
    id: "item-4",
    label: "Midnight Blue",
    imgUrl: "https://i.loli.net/2020/01/19/QVY6JSEbqiOvAp1.png",
    color: "#30465c",
  },
];

export default function ElegantOverlayCarousel({
  bgColor = "#ECEFFC",
  imageWidth = 450,
  imageHeight = 450,
  overlayWidth = "36em",
  overlayHeight = "18em",
  animDurationMs = 600,
  barDurationMs = 1200,
  carouselData = CAROUSEL_DEFAULT_DATA,
}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const maxZIndexRef = useRef(carouselData.length);
  const slidesRef = useRef([]);
  const overlaysRef = useRef([]);

  const easeInOutQuart = "cubic-bezier(0.77, 0, 0.175, 1)";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: bgColor }} />
    );
  }

  const handleNavLinkClick = (e, index) => {
    e.preventDefault();
    if (index === activeIndex) return;

    // 1. Slide Animation Sequence Execution
    const currentSlide = slidesRef.current[activeIndex];
    const nextSlide = slidesRef.current[index];

    if (currentSlide) {
      const slideFadeOut = currentSlide.animate(
        [
          { transform: "translateX(0)", opacity: 1 },
          { transform: "translateX(5%)", opacity: 0 },
        ],
        {
          duration: animDurationMs,
          easing: "ease-in",
          fill: "forwards",
        },
      );

      slideFadeOut.onfinish = () => {
        setActiveIndex(index);

        if (nextSlide) {
          nextSlide.animate(
            [
              { transform: "translateX(-5%)", opacity: 0 },
              { transform: "translateX(0)", opacity: 1 },
            ],
            {
              duration: animDurationMs,
              easing: "ease-out",
              fill: "forwards",
            },
          );
        }
      };
    } else {
      // Fallback edge-case safety anchor
      setActiveIndex(index);
    }

    // 2. Color Bar Overlay Animation Sequence Execution
    maxZIndexRef.current += 1;
    const targetOverlay = overlaysRef.current[index];
    if (targetOverlay) {
      targetOverlay.style.zIndex = `${maxZIndexRef.current}`;
      targetOverlay.animate(
        [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        {
          duration: barDurationMs,
          fill: "forwards",
          easing: easeInOutQuart,
        },
      );
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-start items-center overflow-hidden font-['Lora',_serif]"
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative flex select-none">
        {/* Core Product Imagery Stage Window Container */}
        <div className="relative -top-[4em] left-[10em]">
          {carouselData.map((item, idx) => (
            <img
              key={`slide-${item.id}`}
              ref={(el) => (slidesRef.current[idx] = el)}
              src={item.imgUrl}
              alt={item.label}
              className={`absolute z-[9999] max-w-none transition-opacity duration-300 pointer-events-none ${
                idx === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
              }}
            />
          ))}
        </div>

        {/* Dynamic Horizontal Overlay Canvas Layer */}
        <div
          className="relative"
          style={{ width: overlayWidth, height: overlayHeight }}
        >
          {carouselData.map((item, idx) => (
            <div
              key={`overlay-${item.id}`}
              ref={(el) => (overlaysRef.current[idx] = el)}
              className="absolute top-0 left-0 w-full h-full origin-left"
              style={{
                backgroundColor: item.color,
                zIndex: carouselData.length - idx,
              }}
            />
          ))}
        </div>

        {/* Text Navigation Interface Rails */}
        <ul className="flex flex-col justify-center items-start m-0 p-0 pl-[6em] list-none z-[10000]">
          {carouselData.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <li key={`link-${item.id}`}>
                <a
                  href="#"
                  onClick={(e) => handleNavLinkClick(e, idx)}
                  className={`text-[2rem] leading-[2] no-underline transition-colors duration-300 block ${
                    isActive
                      ? "text-black pointer-events-none font-bold"
                      : "text-[#7f8c8d] hover:text-[#1c1e1f]"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
