"use client";

import React, { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

/**
 * AnimatedSparkleText Props
 * ──────────────────────────────────────────────────────────────────────────
 * text            string   "Animation" (Target string to separate into animated characters)
 * fontSize        string   "clamp(3rem,8vw,6rem)" (Fluid typography style declaration)
 * speed           number   1 (Speed value multiplier for the lottie canvas sequence)
 * accentColor     string   "#ffd36b" (Hex color utilized for drop shadow glowing text boundaries)
 * baseTextColor   string   "#ffffff" (Default standing color map for individual plates)
 * lottieSrc       string   Lottie JSON/DotLottie endpoint containing the secondary glow animation layers
 * canvasSize      number   240 (Width and height metrics parameter for sparkle bounding box)
 * hintText        string   Optional auxiliary layout string exposed directly below the master component
 * fontClass       string   "font-black tracking-wider" (Tailwind configuration variables)
 * transformYMax   number   -7 (Maximum negative pixel translate distance permitted during hover triggers)
 * ──────────────────────────────────────────────────────────────────────────
 */

export default function AnimatedSparkleText({
  text = "Animation",
  fontSize = "clamp(3rem, 8vw, 6rem)",
  speed = 1,
  accentColor = "#ffd36b",
  baseTextColor = "#ffffff",
  lottieSrc = "https://lottie.host/aa8461b8-0395-40aa-9916-3aa8737d127d/wgZlYJ42zU.lottie",
  canvasSize = 240,
  hintText = "Hover over the text to trigger magic physics",
  fontClass = "font-black tracking-wider",
  transformYMax = -7,
}) {
  const canvasRef = useRef(null);
  const lottiePlayerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize Lottie Player safely inside client lifecycle frame
  useEffect(() => {
    if (!canvasRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const player = new DotLottie({
      canvas: canvasRef.current,
      loop: true,
      autoplay: false,
      src: lottieSrc,
      renderConfig: {
        clearCanvas: true,
        backgroundAlpha: 0,
        devicePixelRatio: Math.min(2, window.devicePixelRatio || 1),
      },
    });

    player.setSpeed(speed);
    lottiePlayerRef.current = player;

    return () => {
      try {
        player.destroy();
      } catch (err) {
        // Safe disposal check fallback
      }
    };
  }, [lottieSrc, speed]);

  // Handle runtime states and structural mutations dynamically
  useEffect(() => {
    if (!lottiePlayerRef.current) return;

    if (isHovered) {
      lottiePlayerRef.current.play();
    } else {
      lottiePlayerRef.current.pause();
    }
  }, [isHovered]);

  // Dynamic character mapping math to simulate natural staggering offsets
  const characters = text.split("");

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,#1a1d22_0%,#0f1114_100%)] select-none overflow-hidden p-8">
      <div className="relative text-center grid gap-4 items-center">
        {/* Master Interactive Heading Label wrapper */}
        <h1
          id="word"
          aria-live="polite"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative inline-block cursor-pointer transition-all duration-500 ease-out ${fontClass}`}
          style={{
            fontSize: fontSize,
            color: baseTextColor,
            lineHeight: "0.9",
            textShadow: isHovered
              ? `0 2px 8px rgba(0,0,0,0.5), 0 0 25px ${accentColor}40`
              : "0 1px 0 rgba(255,255,255,0.05), 0 0 22px rgba(255,211,107,0.07)",
          }}
        >
          {characters.map((char, index) => {
            // Generate pseudo-stagger maps linked dynamically to individual key array matrices
            const rotationOffset =
              (index % 3 === 0 ? -1.5 : index % 2 === 0 ? 1 : -2) *
              (isHovered ? 1 : 0);
            const scaleOffset = isHovered
              ? 1 + (index % 4 === 0 ? 0.12 : 0.07)
              : 1;
            const translateOffset = isHovered
              ? transformYMax + (index % 2 === 0 ? 3 : index % 3 === 0 ? 1 : 5)
              : 0;

            // Stagger animation timing slightly down the sequence
            const transitionDelay = isHovered ? `${index * 45}ms` : "0ms";

            return (
              <span
                key={index}
                className="relative inline-block px-[0.03em] origin-center transition-all ease-out duration-500"
                style={{
                  transform: `translateY(${translateOffset}px) rotate(${rotationOffset}deg) scale(${scaleOffset})`,
                  transitionDelay: transitionDelay,
                  textShadow: isHovered
                    ? `0 3px 8px rgba(0,0,0,0.45), 0 0 15px ${accentColor}50`
                    : "none",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}

          {/* Sparkle Lottie Layer Sandbox */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300"
            style={{
              width: `${canvasSize}px`,
              height: `${canvasSize}px`,
              opacity: isHovered ? 1 : 0,
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
              style={{
                filter: `drop-shadow(0 0 0.5rem ${accentColor})`,
              }}
            />
          </div>
        </h1>

        {/* Informative Interaction Hint Label */}
        {hintText && (
          <p className="text-[#9aa0a6] text-sm font-medium tracking-wide mt-6 opacity-60 hover:opacity-100 transition-opacity duration-300 ease-in-out cursor-default">
            {hintText}
          </p>
        )}
      </div>
    </div>
  );
}
