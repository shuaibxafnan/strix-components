"use client";

import { useEffect, useRef } from "react";

export default function InteractiveHoverGrid({
  bgCellColor = "#111",
  bgRevealColor = "#222",
  cursorGlowColor = "rgba(0, 170, 255, 0.3)",
  glowSize = 400,
  lerpSpeed = 0.1,
  rows = 3,
  columns = 4,
  revealIndices = [5],
  revealText = "This grid cell is transparent.",
  className = "",
}) {
  const cursorRef = useRef(null);
  const requestRef = useRef(null);

  const coords = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      coords.current.targetX = e.clientX;
      coords.current.targetY = e.clientY;
    };

    const animate = () => {
      const c = coords.current;

      c.currentX += (c.targetX - c.currentX) * lerpSpeed;
      c.currentY += (c.targetY - c.currentY) * lerpSpeed;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${c.currentX}px, ${c.currentY}px, 0)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handleMouseMove);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [lerpSpeed]);

  const totalCells = rows * columns;
  const cells = Array.from({ length: totalCells });

  return (
    <div
      className={`relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden font-mono ${className}`}
      style={{ backgroundColor: bgRevealColor }}
    >
      <section className="absolute inset-0 w-full z-10 pointer-events-none">
        <div
          className="w-full h-full grid gap-[2px]"
          style={{
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((_, index) => {
            const isRevealed = revealIndices.includes(index);
            return (
              <div
                key={index}
                className="relative w-full h-full p-2.5 flex flex-col pointer-events-auto"
                style={{
                  backgroundColor: isRevealed ? "transparent" : bgCellColor,
                }}
              >
                {isRevealed && (
                  <p
                    className="m-0 p-0 text-[13px] md:text-sm select-none break-words"
                    style={{ color: bgCellColor }}
                  >
                    {revealText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="relative w-full h-screen overflow-hidden pointer-events-none">
        <div
          ref={cursorRef}
          className="absolute top-0 left-0 will-change-transform preserve-3d"
        >
          <div
            className="rounded-full opacity-100 blur-[70px]"
            style={{
              width: `${glowSize}px`,
              aspectRatio: "1",
              marginTop: `-${glowSize / 2}px`,
              marginLeft: `-${glowSize / 2}px`,
              backgroundImage: `radial-gradient(circle farthest-corner at 50% 50%, ${cursorGlowColor} 10%, transparent 70%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
