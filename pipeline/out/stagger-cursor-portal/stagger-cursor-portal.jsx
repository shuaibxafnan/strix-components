"use client";

import { useEffect, useRef } from "react";

const CSS = `
.scp-root ::selection {
  color: #ffffff;
  background-color: var(--scp-selection);
}
.scp-root ::-moz-selection {
  color: #ffffff;
  background-color: var(--scp-selection);
}
`;

export default function StaggerCursorPortal({
  canvasBg = "#2128bd",
  contentBg = "#ffffff",
  cursorBg = "#2128bd",
  shapeColors = ["#005ffe", "#ffe5e3", "#ffcc57"],
  shapeSizes = [650, 440, 270],
  staggerOffset = -0.1,
  cursorSize = 20,
  textHeading = "Hello there!",
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let gsap;
    let handleMove;

    import("gsap").then((mod) => {
      if (cancelled) return;
      gsap = mod.gsap || mod.default;
      const cursor = container.querySelector(".custom-cursor");
      const shapes = container.querySelectorAll(".stagger-shape");

      handleMove = (evt) => {
        const x = evt.clientX;
        const y = evt.clientY;
        gsap.set(cursor, { x, y });
        gsap.to(shapes, {
          x,
          y,
          stagger: staggerOffset,
          ease: "power2.out",
        });
      };

      window.addEventListener("pointermove", handleMove);
    });

    return () => {
      cancelled = true;
      if (handleMove) window.removeEventListener("pointermove", handleMove);
      if (gsap) {
        gsap.killTweensOf(container.querySelectorAll(".stagger-shape"));
        gsap.killTweensOf(container.querySelector(".custom-cursor"));
      }
    };
  }, [staggerOffset]);

  return (
    <div
      ref={containerRef}
      className={`scp-root relative w-full h-screen overflow-hidden select-none [&_*]:cursor-none ${className}`}
      style={{ backgroundColor: canvasBg, "--scp-selection": canvasBg }}
    >
      <style>{CSS}</style>
      <div
        className="custom-cursor fixed top-0 left-0 rounded-full pointer-events-none z-[10000] will-change-transform"
        style={{
          width: `${cursorSize}px`,
          height: `${cursorSize}px`,
          marginLeft: `-${cursorSize / 2}px`,
          marginTop: `-${cursorSize / 2}px`,
          backgroundColor: cursorBg,
        }}
      />

      <div className="relative w-full h-full overflow-hidden">
        {shapeColors.map((color, index) => {
          const size = shapeSizes[index] || 300;
          return (
            <div
              key={index}
              className="stagger-shape absolute rounded-full top-0 left-0 will-change-transform"
              style={{
                backgroundColor: color,
                width: `${size}px`,
                height: `${size}px`,
                marginLeft: `-${size / 2}px`,
                marginTop: `-${size / 2}px`,
              }}
            />
          );
        })}
      </div>

      <div
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center mix-blend-screen pointer-events-none"
        style={{ backgroundColor: contentBg }}
      >
        <h1 className="font-sans font-black text-black m-0 text-center select-text pointer-events-auto text-[clamp(4rem,10vw,12rem)] tracking-tight">
          {textHeading}
        </h1>
      </div>
    </div>
  );
}
