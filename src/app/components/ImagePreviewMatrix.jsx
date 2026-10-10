"use client";

import { useEffect, useState, useRef } from "react";

// ─── ImagePreviewMatrix ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// primaryTextColor string   "#0f172a" Main typographical layout color profile
// highlightColor    string   "#fbbf24" Background accents used during cursor hooks
// linkTextColor     string   "#4f46e5" Inactive structural baseline link hue
// lensSize          number   340       Dimension scaling size of cursor frame (px)
// ──────────────────────────────────────────────────────────────────────────

const SOURCE_DATA = [
  {
    id: "img-1",
    text: "simply random text",
    src: "https://assets.codepen.io/1462889/sl1.jpg",
  },
  {
    id: "img-2",
    text: "Latin literature",
    src: "https://assets.codepen.io/1462889/sl2.jpg",
  },
  {
    id: "img-3",
    text: "Virginia",
    src: "https://assets.codepen.io/1462889/sl3.jpg",
  },
  {
    id: "img-4",
    text: "Latin words",
    src: "https://assets.codepen.io/1462889/sl4.jpg",
  },
];

export default function ImagePreviewMatrix({
  primaryTextColor = "#0f172a",
  highlightColor = "#fbbf24",
  linkTextColor = "#4f46e5",
  lensSize = 340,
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);
  const [isLogoActive, setIsLogoActive] = useState(false);

  // Tracking references for complex decoupled physics
  const frameCoords = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const innerCoords = useRef({ x: 0, y: 0 });

  const frameRef = useRef(null);
  const innerImgRef = useRef([]);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e) => {
      frameCoords.current.targetX = e.clientX;
      frameCoords.current.targetY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let frameId;
    const updatePhysics = () => {
      // Decoupled easing curves creating fluid structural delay inertia
      const frameEase = 0.08;
      const innerEase = 0.15;

      const f = frameCoords.current;
      f.x += (f.targetX - f.x) * frameEase;
      f.y += (f.targetY - f.y) * frameEase;

      // Inner calculation computes deltas between raw pointer and lagged frame
      const deltaX = (f.targetX - f.x) * 0.12;
      const deltaY = (f.targetY - f.y) * 0.12;

      innerCoords.current.x += (deltaX - innerCoords.current.x) * innerEase;
      innerCoords.current.y += (deltaY - innerCoords.current.y) * innerEase;

      if (frameRef.current) {
        frameRef.current.style.transform = `translate3d(${f.x}px, ${f.y}px, 0)`;
      }

      // Applies a counter-parallax distortion to structural imagery inside the mask
      innerImgRef.current.forEach((img) => {
        if (img) {
          img.style.transform = `scale(1.15) translate3d(${innerCoords.current.x}px, ${innerCoords.current.y}px, 0)`;
        }
      });

      frameId = requestAnimationFrame(updatePhysics);
    };

    updatePhysics();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!mounted) return null;

  const currentActive = SOURCE_DATA.find((item) => item.id === activeTarget);
  const showLens = !!activeTarget;

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8 relative bg-[#fbfbfd] overflow-hidden select-none">
      {/* Premium Minimal Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      {/* Brand Identity Navigation Keyway */}
      <a
        href="https://front.codes/"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsLogoActive(true)}
        onMouseLeave={() => setIsLogoActive(false)}
        className="fixed top-10 left-10 z-[1000] block transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <img
          src="https://assets.codepen.io/1462889/fcb.png"
          alt="Branded Identity Trademark Signet"
          className="h-5 w-auto block filter invert opacity-80"
        />
      </a>

      {/* Main Text Content Stage Block */}
      <div className="w-full max-w-[1000px] px-2 py-16 z-10 mx-auto transition-all duration-500">
        <p
          className={`font-serif tracking-tight font-light text-2xl sm:text-3xl md:text-[36px] leading-[1.65] text-left transition-opacity duration-300 ${showLens ? "opacity-40" : "opacity-100"}`}
          style={{ color: primaryTextColor }}
        >
          Contrary to popular belief, Lorem Ipsum is not{" "}
          {SOURCE_DATA.map((link, idx) => (
            <span key={link.id}>
              <span
                onMouseEnter={() => setActiveTarget(link.id)}
                onMouseLeave={() => setActiveTarget(null)}
                className="relative inline-block cursor-none font-normal mx-1 transition-all duration-300 group"
                style={{ color: linkTextColor }}
              >
                <span className="relative z-10 font-sans tracking-tight transition-transform duration-300 inline-block group-hover:-translate-y-[2px] group-hover:text-black">
                  {link.text}
                </span>
                <span
                  className="absolute bottom-1 left-[-4px] w-[calc(100%+8px)] h-[2px] block rounded-full transition-all duration-300 opacity-50 group-hover:h-full group-hover:opacity-100 group-hover:rounded-sm mix-blend-multiply"
                  style={{ backgroundColor: highlightColor }}
                />
              </span>
              {idx === 0 && ". It has roots in a piece of classical "}
              {idx === 1 &&
                " from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in "}
              {idx === 2 && ", looked up one of the more obscure "}
              {idx === 3 && ", consectetur, from a Lorem Ipsum passage."}
            </span>
          ))}
        </p>
      </div>

      {/* Fluid Dual-Inertia Portal Engine Layer */}
      <div
        ref={frameRef}
        className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform"
        style={{
          width: isLogoActive ? "50px" : showLens ? `${lensSize}px` : "20px",
          height: isLogoActive
            ? "50px"
            : showLens
              ? `${lensSize * 0.65}px`
              : "20px",
          marginTop: isLogoActive
            ? "-25px"
            : showLens
              ? `-${(lensSize * 0.65) / 2}px`
              : "-10px",
          marginLeft: isLogoActive
            ? "-25px"
            : showLens
              ? `-${lensSize / 2}px`
              : "-10px",
          opacity: showLens || isLogoActive ? 1 : 0,
          borderRadius: isLogoActive ? "50%" : showLens ? "24px" : "50%",
          transition:
            "width 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, border-radius 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Core Canvas Clipping Capsule Frame */}
        <div className="w-full h-full relative overflow-hidden rounded-[inherit] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] bg-neutral-900 border border-white/20 backdrop-blur-md">
          {/* Decoupled Parallax Surface Array Mapping */}
          {SOURCE_DATA.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (innerImgRef.current[index] = el)}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-out will-change-transform"
              style={{
                backgroundImage: `url(${item.src})`,
                opacity: currentActive?.id === item.id && !isLogoActive ? 1 : 0,
              }}
            />
          ))}

          {/* Solid Identity State Frame Overlay Block */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundColor: highlightColor,
              opacity: isLogoActive ? 1 : 0,
            }}
          />

          {/* Micro Geometric Center Sight Crosshair */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40 mix-blend-difference transition-transform duration-500"
            style={{ transform: showLens ? "scale(1)" : "scale(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
