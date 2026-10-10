"use client";

import { useEffect, useState, useRef } from "react";

// ─── GlowingBlobText ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// text              string   "MOUSEMOVE"     The string displayed and scrubbed
// blobGradient      string   "from-[aquamarine] to-[mediumpurple]"
//                                            Tailwind gradient pairs for blob
// blobSize          string   "34vmax"        Width & Height size of fluid blob
// blurAmount        string   "12vmax"        Backdrop blur strength overlay
// animationDuration string   "20s"           Blob full spin animation cycle
// transitionSpeed   number   3000            Cursor tracking latency (ms)
// textFont          string   "font-mono"     Font styling tailwind class
// textColor         string   "text-white"    Settled text element color
// ──────────────────────────────────────────────────────────────────────────

export default function GlowingBlobText({
  text = "MOUSEMOVE",
  blobGradient = "from-[aquamarine] to-[mediumpurple]",
  blobSize = "25vmax",
  blurAmount = "10vmax",
  animationDuration = "20s",
  transitionSpeed = 3000,
  textFont = "font-mono",
  textColor = "text-white",
}) {
  const [displayText, setDisplayText] = useState(text);
  const [mounted, setMounted] = useState(false);
  const blobRef = useRef(null);
  const intervalRef = useRef(null);

  // Avoid hydration mismatches by ensuring client-only code runs post-mount
  useEffect(() => {
    setMounted(true);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Sync state if text prop changes dynamically
  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  // Track pointer position across window viewports
  useEffect(() => {
    if (!mounted) return;

    const handlePointerMove = (event) => {
      if (!blobRef.current) return;
      const { clientX, clientY } = event;

      // Animate blob coordinates with fluid transition durations
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

  // Matrix Scrambler Text Effect on mouse entry
  const handleMouseOver = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let iteration = 0;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const scrambled = text
        .split("")
        .map((letter, index) => {
          // If our sub-step iteration covers this index, lock the target character
          if (index < iteration) {
            return text[index];
          }
          // Otherwise keep scrubbing randomly
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
      <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden" />
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Dynamic Ambient Fluid Blob */}
      <div
        ref={blobRef}
        style={{
          height: blobSize,
          width: blobSize,
          animationDuration: animationDuration,
        }}
        className={`absolute bg-white aspect-square left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r ${blobGradient} animate-[spin_20s_linear_infinite] opacity-80 mix-blend-normal`}
      />

      {/* Backdrop Glassmorphism Blur Shield */}
      <div
        style={{ backdropFilter: `blur(${blurAmount})` }}
        className="absolute inset-0 h-full w-full z-[2]"
      />

      {/* Interactive Matrix Heading */}
      <h1
        onMouseOver={handleMouseOver}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] m-0 whitespace-nowrap px-[clamp(1rem,2vw,3rem)] rounded-[clamp(0.4rem,0.75vw,1rem)] text-[clamp(3rem,10vw,10rem)] tracking-wide font-bold transition-colors ${textFont} ${textColor}`}
      >
        {displayText}
      </h1>
    </div>
  );
}
