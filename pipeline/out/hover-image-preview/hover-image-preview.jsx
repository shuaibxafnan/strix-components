"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_INTRO = "Contrary to popular belief, Lorem Ipsum is not ";

const DEFAULT_LINKS = [
  {
    id: "img-1",
    text: "simply random text",
    after: ". It has roots in a piece of classical ",
    src: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "img-2",
    text: "Latin literature",
    after:
      " from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in ",
    src: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "img-3",
    text: "Virginia",
    after: ", looked up one of the more obscure ",
    src: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "img-4",
    text: "Latin words",
    after: ", consectetur, from a Lorem Ipsum passage.",
    src: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HoverImagePreview({
  intro = DEFAULT_INTRO,
  links = DEFAULT_LINKS,
  primaryTextColor = "#0f172a",
  highlightColor = "#fbbf24",
  linkTextColor = "#4f46e5",
  backgroundColor = "#fbfbfd",
  dotColor = "#e2e8f0",
  lensSize = 340,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);

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

    const handleTouch = (e) => {
      const t = e.touches[0];
      if (!t) return;
      frameCoords.current.targetX = t.clientX;
      frameCoords.current.targetY = t.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });

    let frameId;
    const updatePhysics = () => {
      const frameEase = 0.08;
      const innerEase = 0.15;

      const f = frameCoords.current;
      f.x += (f.targetX - f.x) * frameEase;
      f.y += (f.targetY - f.y) * frameEase;

      const deltaX = (f.targetX - f.x) * 0.12;
      const deltaY = (f.targetY - f.y) * 0.12;

      innerCoords.current.x += (deltaX - innerCoords.current.x) * innerEase;
      innerCoords.current.y += (deltaY - innerCoords.current.y) * innerEase;

      if (frameRef.current) {
        frameRef.current.style.transform = `translate3d(${f.x}px, ${f.y}px, 0)`;
      }

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
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!mounted) return null;

  const showLens = !!activeTarget;
  const lensHeight = lensSize * 0.65;

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none ${className}`}
      style={{ backgroundColor }}
    >
      <div
        className="absolute inset-0 [background-size:24px_24px] opacity-70 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        }}
      />

      <div className="w-full max-w-[1000px] px-2 py-16 z-10 mx-auto transition-all duration-500">
        <p
          className={`font-serif tracking-tight font-light text-2xl sm:text-3xl md:text-[36px] leading-[1.65] text-left transition-opacity duration-300 ${showLens ? "opacity-40" : "opacity-100"}`}
          style={{ color: primaryTextColor }}
        >
          {intro}
          {links.map((link) => (
            <span key={link.id}>
              <span
                onMouseEnter={() => setActiveTarget(link.id)}
                onMouseLeave={() => setActiveTarget(null)}
                onClick={() =>
                  setActiveTarget((cur) => (cur === link.id ? null : link.id))
                }
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
              {link.after}
            </span>
          ))}
        </p>
      </div>

      <div
        ref={frameRef}
        className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform"
        style={{
          width: showLens ? `min(${lensSize}px, 80vw)` : "20px",
          height: showLens ? `min(${lensHeight}px, 52vw)` : "20px",
          marginTop: showLens ? `max(-${lensHeight / 2}px, -26vw)` : "-10px",
          marginLeft: showLens ? `max(-${lensSize / 2}px, -40vw)` : "-10px",
          opacity: showLens ? 1 : 0,
          borderRadius: showLens ? "24px" : "50%",
          transition:
            "width 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, border-radius 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="w-full h-full relative overflow-hidden rounded-[inherit] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] bg-neutral-900 border border-white/20 backdrop-blur-md">
          {links.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (innerImgRef.current[index] = el)}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-out will-change-transform"
              style={{
                backgroundImage: `url(${item.src})`,
                opacity: activeTarget === item.id ? 1 : 0,
              }}
            />
          ))}

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40 mix-blend-difference transition-transform duration-500"
            style={{ transform: showLens ? "scale(1)" : "scale(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
