"use client";

import { useEffect, useRef, useState } from "react";

const UNIQUE_ITEMS = [
  {
    id: "minimal-01",
    title: "Structural Void",
    meta: "Edition 2026 / Axis",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "minimal-02",
    title: "Monolithic Shadow",
    meta: "Edition 2026 / Mass",
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "minimal-03",
    title: "Tectonic Surface",
    meta: "Edition 2026 / Slate",
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "minimal-04",
    title: "Abstract Plane",
    meta: "Edition 2026 / Core",
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function SpatialSplitCarousel({
  className = "",
  label = "Spatial Concept Gallery",
  prevLabel = "Prev",
  nextLabel = "Next",
  backgroundColor = "#07080b",
  width = "100%",
  height = "100vh",
  sliceCount = 5,
  autoPlaySpeed = 5000,
  accentColor = "#f43f5e",
  carouselItems = UNIQUE_ITEMS,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const autoPlayTimer = useRef(null);
  const slideTimeout = useRef(null);

  useEffect(() => () => clearTimeout(slideTimeout.current), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    startTimeline();
    return () => stopTimeline();
  }, [activeIndex, mounted]);

  const startTimeline = () => {
    stopTimeline();
    autoPlayTimer.current = setInterval(() => {
      triggerSlide((activeIndex + 1) % carouselItems.length);
    }, autoPlaySpeed);
  };

  const stopTimeline = () => {
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
  };

  const triggerSlide = (nextTarget) => {
    if (nextTarget === activeIndex || isAnimating) return;
    stopTimeline();
    setIsAnimating(true);
    setPrevIndex(activeIndex);
    setActiveIndex(nextTarget);

    clearTimeout(slideTimeout.current);
    slideTimeout.current = setTimeout(() => {
      setIsAnimating(false);
      setPrevIndex(null);
    }, 1100);
  };

  if (!mounted) {
    return <div className={className} style={{ width, height, backgroundColor }} />;
  }

  return (
    <div
      className={`relative overflow-hidden select-none touch-none font-sans tracking-tight ${className}`}
      style={{ width, height, backgroundColor }}
    >
      <div className="absolute inset-0 w-full h-full flex z-0">
        {carouselItems.map((item, itemIdx) => {
          const isActive = itemIdx === activeIndex;
          const isPrev = itemIdx === prevIndex;

          if (!isActive && !isPrev) return null;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 w-full h-full flex pointer-events-none ${
                isActive ? "z-20" : "z-10"
              }`}
            >
              {Array.from({ length: sliceCount }).map((_, sliceIdx) => {
                const clipLeft = (sliceIdx * 100) / sliceCount;
                const clipRight = 100 - ((sliceIdx + 1) * 100) / sliceCount;

                const translationDirection =
                  sliceIdx % 2 === 0 ? "101%" : "-101%";
                const dynamicDelay = isAnimating ? `${sliceIdx * 0.08}s` : "0s";

                return (
                  <div
                    key={sliceIdx}
                    className="absolute inset-0 h-full bg-cover bg-center transition-all"
                    style={{
                      backgroundImage: `url(${item.src})`,
                      clipPath: `inset(0% ${clipRight}% 0% ${clipLeft}%)`,
                      transform: isPrev
                        ? `translateY(${translationDirection})`
                        : "translateY(0%)",
                      opacity: isActive && isAnimating ? 0 : 1,
                      transitionTimingFunction:
                        "cubic-bezier(0.76, 0, 0.24, 1)",

                      animationName:
                        isActive && isAnimating ? "sliceReveal" : "none",
                      animationDuration:
                        isActive && isAnimating ? "0.85s" : "0s",
                      animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      animationFillMode: "forwards",
                      animationDelay: dynamicDelay,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-30 pointer-events-none" />
      </div>

      <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-8 md:p-12 z-40 pointer-events-none">
        <header className="flex justify-between items-start w-full">
          <div className="flex items-center gap-3">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase">
              {label}
            </span>
          </div>
          <div className="text-right font-mono text-xs text-white/30">
            <span className="text-white/90 font-medium">
              {(activeIndex + 1).toString().padStart(2, "0")}
            </span>
            <span className="mx-2">/</span>
            {carouselItems.length.toString().padStart(2, "0")}
          </div>
        </header>

        <main className="max-w-xl transition-all duration-700 ease-out">
          {carouselItems.map((item, idx) => {
            if (idx !== activeIndex) return null;
            return (
              <div key={item.id} className="animate-textUp flex flex-col gap-2">
                <span className="text-xs font-mono tracking-[0.15em] text-white/40">
                  {item.meta}
                </span>
                <h1 className="text-4xl md:text-5xl font-light text-white/90 leading-none tracking-tight">
                  {item.title}
                </h1>
              </div>
            );
          })}
        </main>

        <footer className="w-full flex justify-between items-center pointer-events-auto border-t border-white/[0.07] pt-6">
          <div className="flex gap-2">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => triggerSlide(idx)}
                className="h-1 rounded-full transition-all duration-500 relative overflow-hidden bg-white/10 group"
                style={{ width: idx === activeIndex ? "2.5rem" : "1.25rem" }}
              >
                <div
                  className="absolute inset-y-0 left-0 h-full rounded-full transition-transform ease-linear bg-white/70"
                  style={{
                    width: "100%",
                    transform:
                      idx === activeIndex && !isAnimating
                        ? "translateX(0%)"
                        : "translateX(-101%)",
                    transitionDuration:
                      idx === activeIndex ? `${autoPlaySpeed}ms` : "0ms",
                  }}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-4 font-mono text-[11px] uppercase tracking-widest text-white/40">
            <button
              onClick={() =>
                triggerSlide(
                  (activeIndex - 1 + carouselItems.length) %
                    carouselItems.length,
                )
              }
              className="hover:text-white transition-colors py-2"
            >
              {prevLabel}
            </button>
            <button
              onClick={() =>
                triggerSlide((activeIndex + 1) % carouselItems.length)
              }
              className="hover:text-white transition-colors py-2"
            >
              {nextLabel}
            </button>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes sliceReveal {
          0% {
            opacity: 0;
            transform: translateY(100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0%);
          }
        }
        @keyframes textUp {
          0% {
            opacity: 0;
            transform: translateY(25px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        .animate-textUp {
          animation: textUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
