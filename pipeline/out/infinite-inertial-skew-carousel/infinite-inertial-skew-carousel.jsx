"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_SLIDER_ITEMS = [
  {
    id: "s-1",
    src: "https://images.unsplash.com/photo-1595265677860-9a3168007dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "s-2",
    src: "https://images.unsplash.com/photo-1594786118579-95ba90c801ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "s-3",
    src: "https://images.unsplash.com/photo-1509339022327-1e1e25360a41?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "s-4",
    src: "https://images.unsplash.com/photo-1525417071002-5ee4e6bb44f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "s-5",
    src: "https://images.unsplash.com/photo-1594072702031-f0e2a602dd2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "s-6",
    src: "https://images.unsplash.com/photo-1592989819277-a3aafa40c66a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];

const lerp = (f0, f1, t) => (1 - t) * f0 + t * f1;

export default function InfiniteInertialSkewCarousel({
  bgColor = "#000000",
  accentColor = "#ffffff",
  lerpFactor = 0.1,
  touchSpeedFactor = 2.5,
  sliderItems = DEFAULT_SLIDER_ITEMS,
  altPrefix = "Slider Graphic",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const itemsRef = useRef([]);

  const scrollXState = useRef(0);
  const currentX = useRef(0);
  const oldScrollX = useRef(0);
  const itemWidthRef = useRef(0);
  const wrapWidthRef = useRef(0);
  const draggingFlag = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateLayout = () => {
      if (!itemsRef.current[0] || !containerRef.current) return;
      itemWidthRef.current = itemsRef.current[0].clientWidth;
      wrapWidthRef.current = sliderItems.length * itemWidthRef.current;
    };

    const handleWheelTrack = (e) => {
      scrollXState.current -= e.deltaY * 0.9;
    };

    calculateLayout();
    window.addEventListener("resize", calculateLayout);
    window.addEventListener("wheel", handleWheelTrack);

    const wrapValue = (min, max, value) => {
      const range = max - min;
      return ((((value - min) % range) + range) % range) + min;
    };

    let rafId;
    const renderLoop = () => {
      currentX.current = lerp(
        currentX.current,
        scrollXState.current,
        lerpFactor,
      );

      const scrollSpeed = currentX.current - oldScrollX.current;
      oldScrollX.current = currentX.current;

      const skewValue = -scrollSpeed * 0.2;
      const rotateValue = scrollSpeed * 0.01;
      const scaleValue = 1 - Math.min(100, Math.abs(scrollSpeed)) * 0.003;

      sliderItems.forEach((_, idx) => {
        const itemEl = itemsRef.current[idx];
        if (!itemEl) return;

        const baseOffset = idx * itemWidthRef.current + currentX.current;
        const loopedX = wrapValue(
          -itemWidthRef.current,
          wrapWidthRef.current - itemWidthRef.current,
          baseOffset,
        );

        itemEl.style.transform = `translateX(${loopedX}px) skewX(${skewValue}deg) rotate(${rotateValue}deg) scale(${scaleValue})`;
      });

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", calculateLayout);
      window.removeEventListener("wheel", handleWheelTrack);
      cancelAnimationFrame(rafId);
    };
  }, [mounted, sliderItems, lerpFactor]);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    draggingFlag.current = true;
    setIsDragging(true);
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  };

  const handlePointerMove = (e) => {
    if (!draggingFlag.current) return;
    const xCoord = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const directionalDelta = (xCoord - startX.current) * touchSpeedFactor;

    scrollXState.current += directionalDelta;
    startX.current = xCoord;
  };

  const handlePointerUp = () => {
    draggingFlag.current = false;
    setIsDragging(false);
  };

  if (!mounted) {
    return (
      <div className={`w-full h-screen ${className}`} style={{ backgroundColor: bgColor }} />
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
      className={`w-full h-screen overflow-hidden relative select-none flex items-center justify-center ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playball&display=swap");
      `}</style>

      <div className="w-full h-[55vh] md:h-[45vh] relative flex items-center whitespace-nowrap">
        {sliderItems.map((item, idx) => {
          const countIndex = idx + 1;
          const displayCount = countIndex < 10 ? `0${countIndex}` : countIndex;

          return (
            <div
              key={item.id}
              ref={(el) => (itemsRef.current[idx] = el)}
              className="absolute top-0 left-0 w-[70vw] sm:w-[45vw] md:w-[30vw] h-full px-[3.5vw] md:px-[1.5vw] will-change-transform flex items-center justify-center"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              <div
                className="w-full h-full relative overflow-hidden group cursor-pointer rounded-sm bg-neutral-900"
                draggable="false"
              >
                          <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between pointer-events-none">
                              <span
                    className="text-[6vw] sm:text-[4vw] md:text-[36px] font-normal leading-none tracking-wide transition-all duration-500 ease-out translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 mix-blend-difference"
                    style={{
                      color: accentColor,
                      fontFamily: "'Playball', cursive",
                    }}
                  >
                    {displayCount}
                  </span>
                </div>

                          <div className="absolute inset-0 z-10 bg-black/10 transition-opacity duration-500 group-hover:opacity-0" />

                          <img
                  src={item.src}
                  alt={item.alt || `${altPrefix} ${displayCount}`}
                  className="w-full h-full object-cover select-none pointer-events-none transition-all duration-700 ease-out filter grayscale contrast-[1.1] brightness-[0.9] group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
