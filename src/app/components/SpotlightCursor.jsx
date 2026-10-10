"use client";

import { useEffect, useRef } from "react";

// ─── SpotlightCursor ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// imageUrl       string    Required background image URL
// cursorSize     number    500 (px) Diameter of the spotlight circle
// cursorBlur     number    70  (%)  Blur radius percentage
// mixBlendMode   string    "exclusion"  CSS blend mode for the spotlight
// bgColor        string    "#000"       Page background color
// ──────────────────────────────────────────────────────────────────────────

export default function SpotlightCursor({
  imageUrl = "https://github.com/fxi/geotickgen/assets/1196833/fa0cc168-f910-4840-ac2e-3ab70c2859a7",
  cursorSize = 500,
  cursorBlur = 70,
  mixBlendMode = "exclusion",
  bgColor = "#000",
}) {
  const cursorRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cursorRef.current) return;

      // Calculate offset to center the cursor on the mouse
      const offset = cursorSize / 2;
      cursorRef.current.style.left = `${e.clientX - offset}px`;
      cursorRef.current.style.top = `${e.clientY - offset}px`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorSize]);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Content Layer */}
      <div
        className="fixed inset-0 w-full h-full bg-no-repeat bg-center bg-cover mix-blend-overlay z-[2] pt-5"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Spotlight Cursor Layer */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[1] rounded-full"
        style={{
          width: `${cursorSize}px`,
          height: `${cursorSize}px`,
          background: `radial-gradient(circle, rgba(200, 200, 200, 0.7) 0%, rgba(25, 25, 25, 0) ${cursorBlur}%)`,
          mixBlendMode: mixBlendMode,
          // Initial position hidden off-screen or center
          top: "50%",
          left: "50%",
        }}
      />
    </div>
  );
}
