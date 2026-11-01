"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_ITEMS = [
  { id: "edit", label: "Edit", icon: "✏️" },
  { id: "sort", label: "Sort", icon: "↕️" },
  { id: "add", label: "Add", icon: "⭐" },
  { id: "export", label: "Export", icon: "📤", variant: "blue" },
  { id: "delete", label: "Delete", icon: "🗑️" },
];

export default function HoverHighlightMenu({
  menuWidth = "15rem",
  bgOverlayUrl = "https://unsplash.it/600/600?image=992",
  blurAmount = "blur-[6px]",
  gradientSize = 160,
  gradientHeight = 120,
  menuItems = DEFAULT_ITEMS,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-full h-screen bg-black ${className}`} />;
  }

  const handleMouseMove = (e, idx) => {
    const item = containerRef.current?.children[idx];
    if (!item) return;

    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    item.style.setProperty("--px", `${x}px`);
    item.style.setProperty("--py", `${y}px`);
  };

  return (
    <div className={`w-full h-screen relative flex items-center justify-center overflow-hidden font-sans select-none bg-black ${className}`}>
      {bgOverlayUrl && (
        <div
          className={`absolute inset-0 -m-[7px] bg-cover bg-center opacity-90 z-0 pointer-events-none transform scale-105 ${blurAmount}`}
          style={{ backgroundImage: `url(${bgOverlayUrl})` }}
        />
      )}

      <div
        ref={containerRef}
        className="relative z-10 border border-[#444444] rounded-[3px] opacity-[0.958] overflow-hidden bg-transparent shadow-2xl"
        style={{ width: menuWidth, maxWidth: "90%" }}
      >
        {menuItems.map((item, idx) => {
          const isBlue = item.variant === "blue";

          return (
            <div
              key={item.id || idx}
              onMouseMove={(e) => handleMouseMove(e, idx)}
              className={`
                group relative flex items-center cursor-pointer px-4 py-4 text-white z-[2] overflow-hidden
                border-b border-[#333333] last:border-b-0 transition-colors duration-200 linear
                ${isBlue ? "hover:bg-[#24455E]" : "hover:bg-[#383838]/90"}
                bg-[#242424]/90
              `}
            >
                      <div
                className="absolute inset-0 z-[-1] opacity-0 group-hover:opacity-60 transition-opacity duration-100 linear pointer-events-none mix-blend-screen will-change-transform"
                style={{
                  width: `${gradientSize}px`,
                  height: `${gradientHeight}px`,
                  background:
                    "radial-gradient(circle at center, #ffffff 0%, transparent 60%)",
                  transform:
                    "translate(calc(var(--px, 0px) - 50%), calc(var(--py, 0px) - 50%))",
                  top: 0,
                  left: 0,
                }}
              />

                      <div className="absolute inset-[2px] z-[-1] opacity-0 group-hover:opacity-85 transition-opacity duration-100 linear pointer-events-none delay-[0.05s] group-hover:delay-0 bg-inherit" />

                      {item.icon && (
                <span className="w-[1.25em] mr-2 text-[1.25em] inline-flex items-center justify-center text-center antialiased">
                  {item.icon}
                </span>
              )}

                      <span className="text-sm font-medium tracking-wide antialiased">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
