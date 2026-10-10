"use client";

import React, { useState, useRef } from "react";

// ─── ShinyButton ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// label             string   "Shiny Button"  Button text content
// baseBgColor       string   "bg-zinc-800"   Outer border/accent background
// innerBgColor      string   "bg-zinc-900/75" Inner core background container
// textColor         string   "text-zinc-300" Rest state text color
// hoverTextColor    string   "text-zinc-50"  Hovered state text color
// borderRadius      string   "rounded-[20px]" Outer button boundary curve
// innerRadius       string   "rounded-[18px]" Inner body curve matching border
// py                string   "py-3.5"        Vertical padding
// px                string   "px-7"          Horizontal padding
// glowColor         string   "#ffffff44"     Radial glow tint (HEX/RGBA)
// shineColor        string   "#ffffff44"     Linear gloss streak tint (HEX/RGBA)
// glowSize          string   "100% 50%"      Spread dimension of radial ambient light
// ──────────────────────────────────────────────────────────────────────────

export default function ShinyButton({
  label = "Shiny Button",
  baseBgColor = "bg-zinc-800",
  innerBgColor = "bg-zinc-900/75",
  textColor = "text-zinc-300",
  hoverTextColor = "text-zinc-50",
  borderRadius = "rounded-[20px]",
  innerRadius = "rounded-[18px]",
  py = "py-3.5",
  px = "px-7",
  glowColor = "rgba(255, 255, 255, 0.27)",
  shineColor = "rgba(255, 255, 255, 0.27)",
  glowSize = "100% 50%",
}) {
  const buttonRef = useRef(null);
  const [mouseX, setMouseX] = useState(0.5);
  const [mouseY, setMouseY] = useState(0.5);

  const handlePointerMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMouseX((e.clientX - rect.left) / rect.width);
    setMouseY((e.clientY - rect.top) / rect.height);
  };

  // Pre-calculate style matrices using state values to avoid raw runtime tailwind interpolation
  const mxPercent = `${mouseX * 100}%`;
  const myPercent = `${mouseY * 100}%`;

  const dynamicStyles = {
    "--mx": mxPercent,
    "--my": myPercent,
    backgroundImage: `
      radial-gradient(${glowSize} at calc(50% - ${mxPercent}) 0%, ${glowColor} 0%, transparent 80%),
      radial-gradient(${glowSize} at calc(${mxPercent} + 50%) 100%, ${glowColor} 0%, transparent 80%),
      repeating-linear-gradient(125deg, transparent 0%, transparent 15%, ${shineColor} 25%, transparent 35%, transparent 50%)
    `,
    backgroundSize: "100% 100%, 100% 100%, 200% 200%",
    backgroundPosition: `0% 0%, 0% 0%, calc(${mxPercent} + 20%) ${myPercent}`,
  };

  return (
    <button
      ref={buttonRef}
      onPointerMove={handlePointerMove}
      className={`group relative overflow-hidden select-none transition-transform active:scale-[0.98] ${py} ${px} ${borderRadius} ${baseBgColor}`}
    >
      {/* Interactive Light Layers (Glow + Shine Combined for rendering safety) */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen"
        style={dynamicStyles}
      />

      {/* Solid Inner Body Mask */}
      <div className={`absolute inset-[2px] ${innerRadius} ${innerBgColor}`} />

      {/* Interactive Text Label */}
      <span
        className={`relative z-10 font-medium tracking-wide transition-colors duration-200 ${textColor} group-hover:${hoverTextColor}`}
      >
        {label}
      </span>
    </button>
  );
}
