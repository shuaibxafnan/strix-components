"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_MENU_ITEMS = [
  { id: "m-1", label: "Facebook" },
  { id: "m-2", label: "Netflix" },
  { id: "m-3", label: "Instagram" },
  { id: "m-4", label: "Google" },
  { id: "m-5", label: "Twitter" },
  { id: "m-6", label: "Amazon" },
  { id: "m-7", label: "Pinterest" },
  { id: "m-8", label: "Spotify" },
  { id: "m-9", label: "YouTube" },
];

const lerp = (f0, f1, t) => (1 - t) * f0 + t * f1;

export default function InfiniteInertialMenu({
  bgColor = "#ffffff",
  fontColor = "#020000",
  accentColor = "#862929",
  lerpFactor = 0.1,
  touchSpeedFactor = 2.5,
  menuItems = DEFAULT_MENU_ITEMS,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const menuRef = useRef(null);
  const itemsRef = useRef([]);

  const scrollYState = useRef(0);
  const currentY = useRef(0);
  const oldScrollY = useRef(0);
  const itemHeightRef = useRef(0);
  const wrapHeightRef = useRef(0);
  const draggingFlag = useRef(false);
  const startY = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateLayout = () => {
      if (!itemsRef.current[0] || !menuRef.current) return;
      itemHeightRef.current = itemsRef.current[0].clientHeight;
      wrapHeightRef.current = menuItems.length * itemHeightRef.current;
    };

    const handleWheelTrack = (e) => {
      scrollYState.current -= e.deltaY;
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
      currentY.current = lerp(
        currentY.current,
        scrollYState.current,
        lerpFactor,
      );

      const scrollSpeed = currentY.current - oldScrollY.current;
      oldScrollY.current = currentY.current;

      const scaleValue = 1 - Math.min(100, Math.abs(scrollSpeed)) * 0.005;
      const rotateValue = scrollSpeed * 0.2;

      menuItems.forEach((_, idx) => {
        const itemEl = itemsRef.current[idx];
        if (!itemEl) return;

        const baseOffset = idx * itemHeightRef.current + currentY.current;
        const loopedY = wrapValue(
          -itemHeightRef.current,
          wrapHeightRef.current - itemHeightRef.current,
          baseOffset,
        );

        itemEl.style.transform = `translateY(${loopedY}px) scale(${scaleValue}) rotate(${rotateValue}deg)`;
      });

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", calculateLayout);
      window.removeEventListener("wheel", handleWheelTrack);
      cancelAnimationFrame(rafId);
    };
  }, [mounted, menuItems, lerpFactor]);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    draggingFlag.current = true;
    setIsDragging(true);
    startY.current = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  };

  const handlePointerMove = (e) => {
    if (!draggingFlag.current) return;
    const yCoord = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const directionalDelta = (yCoord - startY.current) * touchSpeedFactor;

    scrollYState.current += directionalDelta;
    startY.current = yCoord;
  };

  const handlePointerUp = () => {
    draggingFlag.current = false;
    setIsDragging(false);
  };

  if (!mounted) {
    return (
      <div
        className={`w-full h-screen ${className}`}
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  return (
    <div
      ref={menuRef}
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
        @import url("https://fonts.googleapis.com/css2?family=Playball&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap");
      `}</style>

      <ul className="w-full h-full relative list-none m-0 p-0">
        {menuItems.map((item, idx) => {
          const countIndex = idx + 1;
          const displayCount = countIndex < 10 ? `0${countIndex}` : countIndex;

          return (
            <li
              key={item.id}
              ref={(el) => (itemsRef.current[idx] = el)}
              className="absolute top-0 left-0 w-full text-center py-[4vh] h-[26vh] md:h-[32vh] will-change-transform flex items-center justify-center"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              <button
                type="button"
                className="relative bg-transparent border-none outline-none p-0 cursor-pointer inline-flex items-center group text-[10vw] md:text-[120px] leading-[1.1] tracking-normal"
                style={{
                  color: fontColor,
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                }}
                draggable="false"
                onDragStart={(e) => e.preventDefault()}
              >
                <span
                  className="absolute left-0 -translate-x-[160%] text-[4vw] md:text-[45px] transition-transform duration-300 ease-out origin-right group-hover:scale-110 group-hover:-translate-x-[180%]"
                  style={{
                    color: accentColor,
                    fontFamily: "'Playball', cursive",
                    transform: "translateY(-5%)",
                  }}
                >
                  {displayCount}
                </span>

                <span className="transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
