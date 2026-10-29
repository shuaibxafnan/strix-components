"use client";

import { useEffect, useState, useRef } from "react";

export default function ClippedImageText({
  text = "Tokyo Tower",
  imageSrc = "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1600&q=80",
  circleRadius = 75,
  textColor = "#808080",
  textHoverColor = "#333333",
  litTextColor = "#ffffff",
  bgColor = "#f2f0ed",
  transitionDuration = "100ms",
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const rafRef = useRef(null);

  // Secure client-only mounting state to bypass SSR or hydration gaps
  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Tracking mouse movement and scheduling render pipeline updates
  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setCoords({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center select-none"
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  // Double dimensions calculated cleanly for layout sizing constraints
  const outerDiameter = circleRadius * 2;

  return (
    <div
      className="relative flex items-center justify-center w-full min-h-screen overflow-hidden select-none font-black uppercase"
      style={{ backgroundColor: bgColor }}
    >
      {/* Underlying Anchor Interaction Trigger Layer */}
      <a
        href="#"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="z-10 relative inline-block text-[3em] transition-colors ease"
        style={{
          color: isHovered ? textHoverColor : textColor,
          transitionDuration: transitionDuration,
        }}
      >
        {text}
      </a>

      {/* Synchronized Spotlight Reveal Canvas Container */}
      <span
        className="pointer-events-none absolute inset-0 block"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: `opacity ${transitionDuration} ease`,
        }}
      >
        {/* Dynamic High-Contrast Cutout Masked Letter Layer */}
        <span
          className="z-20 absolute inset-0 flex items-center justify-center text-[3em] pointer-events-none"
          style={{
            color: litTextColor,
            clipPath: `circle(${circleRadius}px at ${coords.x}px ${coords.y}px)`,
            backgroundImage: "inherit",
          }}
          aria-hidden="true"
        >
          {text}
        </span>

        {/* Following Graphic Content Core Frame */}
        <span
          className="z-0 absolute top-0 left-0 block pointer-events-none"
          style={{
            width: `${outerDiameter}px`,
            height: `${outerDiameter}px`,
            transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
            // Offsets center of container context manually with negative limits
            marginLeft: `-${circleRadius}px`,
            marginTop: `-${circleRadius}px`,
          }}
        >
          <span className="absolute top-0 left-0 w-full h-full block">
            <img
              className="block max-w-full object-cover object-center rounded-full brightness-[0.9]"
              src={imageSrc}
              alt={text}
              style={{
                width: `${outerDiameter}px`,
                height: `${outerDiameter}px`,
              }}
            />
          </span>
        </span>
      </span>
    </div>
  );
}
