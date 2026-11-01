"use client";

import { useEffect, useRef } from "react";

export default function SpotlightCursor({
  imageUrl = "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1600&q=80",
  cursorSize = 500,
  cursorBlur = 70,
  mixBlendMode = "exclusion",
  bgColor = "#000",
  className = "",
}) {
  const cursorRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (!cursorRef.current) return;

      const offset = cursorSize / 2;
      cursorRef.current.style.left = `${e.clientX - offset}px`;
      cursorRef.current.style.top = `${e.clientY - offset}px`;
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [cursorSize]);

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="fixed inset-0 w-full h-full bg-no-repeat bg-center bg-cover mix-blend-overlay z-[2] pt-5"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[1] rounded-full"
        style={{
          width: `${cursorSize}px`,
          height: `${cursorSize}px`,
          background: `radial-gradient(circle, rgba(200, 200, 200, 0.7) 0%, rgba(25, 25, 25, 0) ${cursorBlur}%)`,
          mixBlendMode: mixBlendMode,
          top: "50%",
          left: "50%",
        }}
      />
    </div>
  );
}
