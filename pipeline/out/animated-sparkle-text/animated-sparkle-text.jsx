"use client";

import React, { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

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
  hintColor = "#9aa0a6",
  className = "",
}) {
  const canvasRef = useRef(null);
  const lottiePlayerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

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
      } catch (err) {}
    };
  }, [lottieSrc, speed]);

  useEffect(() => {
    if (!lottiePlayerRef.current) return;

    if (isHovered) {
      lottiePlayerRef.current.play();
    } else {
      lottiePlayerRef.current.pause();
    }
  }, [isHovered]);

  const characters = text.split("");

  return (
    <div className={`w-full h-screen flex items-center justify-center select-none overflow-hidden ${className}`}>
      <div className="relative text-center grid gap-4 items-center">
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
            const rotationOffset =
              (index % 3 === 0 ? -1.5 : index % 2 === 0 ? 1 : -2) *
              (isHovered ? 1 : 0);
            const scaleOffset = isHovered
              ? 1 + (index % 4 === 0 ? 0.12 : 0.07)
              : 1;
            const translateOffset = isHovered
              ? transformYMax + (index % 2 === 0 ? 3 : index % 3 === 0 ? 1 : 5)
              : 0;
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

        {hintText && (
          <p style={{ color: hintColor }} className="text-sm font-medium tracking-wide mt-6 opacity-60 hover:opacity-100 transition-opacity duration-300 ease-in-out cursor-default">
            {hintText}
          </p>
        )}
      </div>
    </div>
  );
}
