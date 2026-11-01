"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
  {
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
  {
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
  {
    src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
  {
    src: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
  {
    src: "https://images.unsplash.com/photo-1536566482680-fca31930a0bd?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
  {
    src: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=600",
    alt: "Gallery image",
  },
];

export default function ArrowScrollCarousel({
  bgColor = "#0b0c10",
  itemSize = 200,
  gapSize = 24,
  scrollMultiplier = 2,
  arrowBgColor = "rgba(15, 23, 42, 0.6)",
  arrowIconColor = "#ffffff",
  items = DEFAULT_ITEMS,
  className = "",
}) {
  const carouselRef = useRef(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);

  const handleScrollVisibility = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;

    setShowPrev(scrollLeft > 4);
    setShowNext(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    const carouselNode = carouselRef.current;
    if (carouselNode) {
      carouselNode.addEventListener("scroll", handleScrollVisibility, {
        passive: true,
      });
      handleScrollVisibility();
    }
    return () => {
      if (carouselNode) {
        carouselNode.removeEventListener("scroll", handleScrollVisibility);
      }
    };
  }, [items]);

  const handleNextClick = () => {
    if (!carouselRef.current) return;
    const computeStepDist = (itemSize + gapSize) * scrollMultiplier;
    carouselRef.current.scrollBy({ left: computeStepDist, behavior: "smooth" });
  };

  const handlePrevClick = () => {
    if (!carouselRef.current) return;
    const computeStepDist = (itemSize + gapSize) * scrollMultiplier;
    carouselRef.current.scrollBy({
      left: -computeStepDist,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`w-full flex items-center justify-center flex-col overflow-hidden select-none py-8 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full relative px-6 md:px-12">
          <div
          ref={carouselRef}
          className="w-full overflow-x-auto scroll-smooth no-scrollbar py-6"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="grid grid-flow-col auto-cols-max box-border"
            style={{ gap: `${gapSize}px` }}
          >
            {items.map((item) => (
              <div
                key={item.src}
                style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
                className="overflow-hidden rounded-[20px] relative group border border-white/[0.04] bg-neutral-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] isolate"
              >
                          <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-[800ms] cubic-bezier(0.25, 1, 0.5, 1) group-hover:scale-105 filter brightness-[0.92] group-hover:brightness-100"
                  loading="lazy"
                />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>

          <button
          onClick={handlePrevClick}
          aria-label="Scroll left"
          className={`absolute top-1/2 left-8 md:left-16 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer outline-none transition-all duration-300 hover:scale-105 active:scale-95 group ${
            showPrev
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          style={{ backgroundColor: arrowBgColor }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke={arrowIconColor}
            className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

          <button
          onClick={handleNextClick}
          aria-label="Scroll right"
          className={`absolute top-1/2 right-8 md:right-16 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer outline-none transition-all duration-300 hover:scale-105 active:scale-95 group ${
            showNext
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          style={{ backgroundColor: arrowBgColor }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke={arrowIconColor}
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
          height: 0 !important;
          width: 0 !important;
        }
      `}</style>
    </div>
  );
}
