"use client";

import { useState, useRef, useEffect } from "react";

// ─── Card3D ──────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// cardWidth       string   300px                 Width of the 3D card
// cardHeight      string   400px                 Height of the 3D card
// bgImage         string   https://unsplash...   Card background image source
// cardRadius      string   10px                  Border radius for the frame
// sensitivity     number   100                   Higher = milder tilt response
// scaleOnHover    number   1.07                  3D scale depth when hovered
// glowColor       string   255,255,255           RGB format glow (e.g. "255,255,255")
// glowIntensity   number   0.33                  Max brightness factor of glow
// children        node     "3D Card"             Content overlay
// ──────────────────────────────────────────────────────────────────────────

export default function Glowing3DCard({
  cardWidth = "300px",
  cardHeight = "400px",
  bgImage = "https://images.unsplash.com/photo-1557672199-6e8c8b2b8fff?ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80",
  cardRadius = "10px",
  sensitivity = 100,
  scaleOnHover = 1.07,
  glowColor = "255,255,255",
  glowIntensity = 0.33,
  children = "3D Card",
}) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [glowStyle, setGlowStyle] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    let bounds = null;

    const handleMouseEnter = () => {
      bounds = cardElement.getBoundingClientRect();
      setIsHovered(true);
    };

    const handleMouseMove = (e) => {
      if (!bounds) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;

      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2,
      };

      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      // Compute structural 3D transformations
      const transformValue = `
        scale3d(${scaleOnHover}, ${scaleOnHover}, ${scaleOnHover})
        rotate3d(
          ${center.y / sensitivity},
          ${-center.x / sensitivity},
          0,
          ${Math.log(distance || 1) * 2}deg
        )
      `;
      setTransformStyle(transformValue);

      // Compute adaptive linear alpha properties for the flare reflection
      const glowValue = `
        radial-gradient(
          circle at
          ${center.x * 2 + bounds.width / 2}px
          ${center.y * 2 + bounds.height / 2}px,
          rgba(${glowColor}, ${glowIntensity}),
          rgba(0, 0, 0, 0.06)
        )
      `;
      setGlowStyle(glowValue);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTransformStyle("");
      setGlowStyle("");
      bounds = null;
    };

    // Bind event hooks directly to avoid cross-talk
    cardElement.addEventListener("mouseenter", handleMouseEnter);
    cardElement.addEventListener("mousemove", handleMouseMove);
    cardElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cardElement.removeEventListener("mouseenter", handleMouseEnter);
      cardElement.removeEventListener("mousemove", handleMouseMove);
      cardElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [sensitivity, scaleOnHover, glowColor, glowIntensity]);

  return (
    <div className="flex h-screen w-full items-center justify-center [perspective:1500px]">
      <div
        ref={cardRef}
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: cardRadius,
          backgroundImage: `url(${bgImage})`,
          transform: transformStyle,
        }}
        className={`relative p-4 text-right font-bold text-[#181a1a] bg-cover bg-center select-none shadow-[0_1px_5px_rgba(0,0,0,0.6)] transition-all ease-out ${
          isHovered
            ? "duration-[150ms] shadow-[0_5px_20px_5px_rgba(0,0,0,0.27)]"
            : "duration-300 [transform:rotate3d(0)]"
        }`}
      >
        {children}

        {/* Dynamic Highlight Glow Layer */}
        <div
          style={{
            backgroundImage:
              glowStyle ||
              `radial-gradient(circle at 50% -20%, rgba(${glowColor}, 0.13), rgba(0, 0, 0, 0.05))`,
            borderRadius: cardRadius,
          }}
          className="absolute inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}
