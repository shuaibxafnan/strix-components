"use client";

import React, { useState, useRef } from "react";

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
  className = "",
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
    <div className={`w-full h-screen flex items-center justify-center ${className}`}>
    <button
      ref={buttonRef}
      onPointerMove={handlePointerMove}
      className={`group relative overflow-hidden select-none transition-transform active:scale-[0.98] ${py} ${px} ${borderRadius} ${baseBgColor}`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen"
        style={dynamicStyles}
      />

      <div className={`absolute inset-[2px] ${innerRadius} ${innerBgColor}`} />

      <span
        className={`relative z-10 font-medium tracking-wide transition-colors duration-200 ${textColor} group-hover:${hoverTextColor}`}
      >
        {label}
      </span>
    </button>
    </div>
  );
}
