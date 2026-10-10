"use client";

import React, { useState, useEffect } from "react";

// ─── SparkleMagicText ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// prefixText        string   "Sometimes I'll start a line of code and I"
// magicText         string   "don't even know"
// suffixText        string   "where it's going."
// starCount         number   4                  Number of simultaneous sparkles
// sparkleInterval   number   800                Speed of sparkle relocation (ms)
// gradientColors    string   From violet/pink   Tailwind CSS linear-gradient string
// starColor         string   "#A78BFA"          Hex color code for the SVG stars
// ──────────────────────────────────────────────────────────────────────────

export default function SparkleMagicText({
  prefixText = "Sometimes I'll start a line of code and I",
  magicText = "don't even know",
  suffixText = "where it's going.",
  starCount = 4,
  sparkleInterval = 800,
  gradientColors = "linear-gradient(to right, #7C3AED, #A78BFA, #F472B6, #7C3AED)",
  starColor = "#A78BFA",
}) {
  const [stars, setStars] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Helper logic calculating safe bounding distribution offsets
  const getRandomPositions = () => ({
    left: `${Math.floor(Math.random() * 110) - 10}%`,
    top: `${Math.floor(Math.random() * 110) - 30}%`,
    scale: Math.random() * 0.6 + 0.5,
  });

  useEffect(() => {
    setMounted(true);

    // Seed initial star position values accurately on client mounting hook
    const initialStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      ...getRandomPositions(),
    }));
    setStars(initialStars);
  }, [starCount]);

  useEffect(() => {
    if (!mounted) return;

    // Interval engine updating single random stars sequentially over time frames
    const interval = setInterval(() => {
      setStars((prevStars) =>
        prevStars.map((star) => {
          // Keep updating periodically or completely switch placement if user is hovering
          if (Math.random() > 0.4 || isHovered) {
            return {
              ...star,
              ...getRandomPositions(),
            };
          }
          return star;
        }),
      );
    }, sparkleInterval);

    return () => clearInterval(interval);
  }, [mounted, sparkleInterval, isHovered]);

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center relative overflow-hidden px-4 select-none">
      {/* Decorative Modern Spatial Background Grid Glowing Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Typography Layout Frame */}
      <h1 className="max-w-4xl text-center text-[2rem] sm:text-[3rem] md:text-[4rem] leading-[1.2] font-normal tracking-tight text-zinc-100 font-sans px-4">
        {prefixText} {/* Magic Text Container Span wrapper trigger */}
        <span
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative inline-block cursor-default group"
        >
          {/* Loop structural generation over reactive sparkle coordinate positions */}
          {stars.map((star) => (
            <span
              key={star.id}
              className="absolute pointer-events-none block animate-[pulse_1.5s_infinite]"
              style={{
                left: star.left,
                top: star.top,
                transform: `scale(${star.scale})`,
                width: "clamp(20px, 2vw, 32px)",
                height: "clamp(20px, 2vw, 32px)",
                transition: `left ${sparkleInterval}ms cubic-bezier(0.25, 1, 0.5, 1), top ${sparkleInterval}ms cubic-bezier(0.25, 1, 0.5, 1)`,
              }}
            >
              <svg
                viewBox="0 0 512 512"
                className="w-full h-full animate-[spin_3s_linear_infinite] opacity-80 filter drop-shadow-[0_0_4px_rgba(167,139,250,0.6)]"
              >
                <path
                  fill={starColor}
                  d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z"
                />
              </svg>
            </span>
          ))}

          {/* Core Text Layer utilizing an infinity pan background linear setup */}
          <span
            className="font-bold tracking-tight select-none bg-clip-text text-transparent animate-[background-pan_4s_linear_infinite] bg-[length:200%_auto] relative after:absolute after:bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-violet-500/0 after:via-pink-500/30 after:to-purple-500/0"
            style={{ backgroundImage: gradientColors }}
          >
            {magicText}
          </span>
        </span>{" "}
        {suffixText}
      </h1>

      {/* Dynamic Style Injection for Continuous Background Panning Animations */}
      <style jsx global>{`
        @keyframes background-pan {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>
    </div>
  );
}
