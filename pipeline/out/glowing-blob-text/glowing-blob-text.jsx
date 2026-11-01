"use client";

import { useEffect, useState, useRef } from "react";

export default function GlowingBlobText({
  text = "MOUSEMOVE",
  blobGradient = "from-[aquamarine] to-[mediumpurple]",
  blobSize = "25vmax",
  blurAmount = "10vmax",
  animationDuration = "20s",
  transitionSpeed = 3000,
  textFont = "font-mono",
  textColor = "text-white",
  backgroundColor = "bg-black",
  className = "",
}) {
  const [displayText, setDisplayText] = useState(text);
  const [mounted, setMounted] = useState(false);
  const blobRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    if (!mounted) return;

    const handlePointerMove = (event) => {
      if (!blobRef.current) return;
      const { clientX, clientY } = event;

      blobRef.current.animate(
        {
          left: `${clientX}px`,
          top: `${clientY}px`,
        },
        { duration: transitionSpeed, fill: "forwards" },
      );
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [mounted, transitionSpeed]);

  const handleMouseOver = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let iteration = 0;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const scrambled = text
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return text[index];
          }

          return letters[Math.floor(Math.random() * 26)];
        })
        .join("");

      setDisplayText(scrambled);

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1 / 3;
    }, 30);
  };

  if (!mounted) {
    return (
      <div className={`w-full h-screen flex items-center justify-center overflow-hidden ${backgroundColor} ${className}`} />
    );
  }

  return (
    <div className={`relative w-full h-screen flex items-center justify-center overflow-hidden select-none ${backgroundColor} ${className}`}>
      <div
        ref={blobRef}
        style={{
          height: blobSize,
          width: blobSize,
          animationDuration: animationDuration,
        }}
        className={`absolute bg-white aspect-square left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r ${blobGradient} animate-[spin_20s_linear_infinite] opacity-80 mix-blend-normal`}
      />

      <div
        style={{ backdropFilter: `blur(${blurAmount})` }}
        className="absolute inset-0 h-full w-full z-[2]"
      />

      <h1
        onMouseOver={handleMouseOver}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] m-0 whitespace-nowrap px-[clamp(1rem,2vw,3rem)] rounded-[clamp(0.4rem,0.75vw,1rem)] text-[clamp(3rem,10vw,10rem)] tracking-wide font-bold transition-colors ${textFont} ${textColor}`}
      >
        {displayText}
      </h1>
    </div>
  );
}
