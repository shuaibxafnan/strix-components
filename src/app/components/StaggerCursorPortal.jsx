"use client";

import { useEffect, useRef, useState } from "react";

// ─── StaggerCursorPortal ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// canvasBg         string    "#2128bd"                   Main wrapper background fill
// contentBg        string    "#ffffff"                   Clipping typography layer mask color
// cursorBg         string    "#2128bd"                   Interactive track cursor node accent color
// shapeColors      array     ["#005ffe", "#ffe5e3", ...] Sequence hex values defining tracking balls
// shapeSizes       array     [650, 440, 270]             Width/Height dimensions mapping color nodes
// staggerOffset    number    -0.1                        GSAP twin physics transition follow-delay factor
// cursorSize       number    20                          Viewport pixel weight parameter tuning pointer bounds
// textHeading      string    "Hello there!"              Central branding layout typography text node
// ──────────────────────────────────────────────────────────────────────────

export default function StaggerCursorPortal({
  canvasBg = "#2128bd",
  contentBg = "#ffffff",
  cursorBg = "#2128bd",
  shapeColors = ["#005ffe", "#ffe5e3", "#ffcc57"],
  shapeSizes = [650, 440, 270],
  staggerOffset = -0.1,
  cursorSize = 20,
  textHeading = "Hello there!",
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Eliminate layout flashes or hydration mismatches on server frameworks
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed to initialize: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !containerRef.current) return;

        const handleMouseMove = (evt) => {
          const mouseX = evt.clientX;
          const mouseY = evt.clientY;

          // Snap tracking cursor strictly to global matrix
          gsap.set(containerRef.current.querySelector(".custom-cursor"), {
            x: mouseX,
            y: mouseY,
          });

          // Compute stagger tracking layout variables natively
          gsap.to(containerRef.current.querySelectorAll(".stagger-shape"), {
            x: mouseX,
            y: mouseY,
            stagger: staggerOffset,
            ease: "power2.out",
          });
        };

        window.addEventListener("mousemove", handleMouseMove);

        // Clean event handling hooks during module unmount cycle
        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
        };
      })
      .catch((err) =>
        console.error(
          "[StaggerCursorPortal] Initialization error:",
          err.message,
        ),
      );
  }, [mounted, staggerOffset]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden select-none select-none-all [&_*]:cursor-none"
      style={{ backgroundColor: canvasBg }}
    >
      {/* Dynamic Cursor Target Layer */}
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

      {/* Physics Stagger Background Layer */}
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

      {/* Matte Foreground Overlay with Inverted Blending Mask */}
      <div
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center mix-blend-screen pointer-events-none"
        style={{ backgroundColor: contentBg }}
      >
        <h1 className="font-sans font-black text-black m-0 text-center select-text pointer-events-auto text-[clamp(4rem,10vw,12rem)] tracking-tight">
          {textHeading}
        </h1>
      </div>

      {/* Strict Custom Selection Style Injector */}
      <style jsx global>{`
        ::selection {
          color: #ffffff;
          background-color: ${canvasBg};
        }
        ::-moz-selection {
          color: #ffffff;
          background-color: ${canvasBg};
        }
      `}</style>
    </div>
  );
}
