"use client";

import { useState, useEffect } from "react";

// ─── AnimatedTextButtons ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor           string    "#ECEFFC"  Full page wrapper backdrop color
// primaryBg         string    "#275efe"  Default background for regular button
// primaryText       string    "#ffffff"  Default text color for regular button
// darkBg            string    "#2F3545"  Background for the 'smoke' button
// darkText          string    "#ffffff"  Text color for the 'smoke' button
// whiteBg           string    "#ffffff"  Background for the 'drive' button
// whiteText         string    "#275efe"  Text color for the 'drive' button
// fontSize          string    "16px"     Base font size across all elements
// letterSpacing     string    "0.5px"    Tracking letter distance metrics
// ──────────────────────────────────────────────────────────────────────────

export default function AnimatedTextButtons({
  bgColor = "#ECEFFC",
  primaryBg = "#275efe",
  primaryText = "#ffffff",
  darkBg = "#2F3545",
  darkText = "#ffffff",
  whiteBg = "#ffffff",
  whiteText = "#275efe",
  fontSize = "16px",
  letterSpacing = "0.5px",
}) {
  const [hasMounted, setHasMounted] = useState(false);

  // Keep server/client layouts strictly matching before initial mount completes
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  // Split strings into explicit structures for CSS variable delay parsing loops
  const renderLetters = (text) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        className="block [backface-visibility:hidden] not-italic"
        style={{
          "--d": `${(index + 1) / 20}s`,
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <div
      className="w-full h-screen flex flex-col sm:flex-row gap-6 items-center justify-center overflow-hidden font-sans"
      style={{ backgroundColor: bgColor }}
    >
      {/* Button 1: Jumping (Primary Theme) */}
      <button
        className="group relative block outline-none border-0 font-medium rounded-[24px] cursor-pointer transition-all duration-500 ease-out select-none [box-shadow:0_2px_8px_-1px_rgba(39,94,254,0.32)] hover:[box-shadow:0_4px_20px_-2px_rgba(39,94,254,0.5)] hover:-translate-y-1"
        style={{
          padding: "16px 32px",
          fontSize: fontSize,
          lineHeight: fontSize,
          letterSpacing: letterSpacing,
          backgroundColor: primaryBg,
          color: primaryText,
          "--move-hover": "-4px",
          "--duration": "0.5s",
          "--shadow-active": "0 3px 1px rgba(0, 0, 0, 0.2)",
          "--move": "-4px",
        }}
      >
        <div className="flex group-hover:[&>span]:animate-[move_var(--duration)_linear_var(--d)]">
          {renderLetters("Jumping")}
        </div>
      </button>

      {/* Button 2: Smoke (Dark Theme) */}
      <button
        className="group relative block outline-none border-0 font-medium rounded-[24px] cursor-pointer transition-all duration-500 ease-out select-none [box-shadow:0_2px_8px_-1px_rgba(21,25,36,0.32)] hover:[box-shadow:0_4px_20px_-2px_rgba(21,25,36,0.5)] hover:-translate-y-1"
        style={{
          padding: "16px 32px",
          fontSize: fontSize,
          lineHeight: fontSize,
          letterSpacing: letterSpacing,
          backgroundColor: darkBg,
          color: darkText,
          "--move": "12px",
          "--move-y": "-8px",
          "--blur": "4px",
        }}
      >
        <div className="flex group-hover:[&>span]:animate-[smoke_1s_linear_var(--d)]">
          {renderLetters("Smoke")}
        </div>
      </button>

      {/* Button 3: Drive (White Theme) */}
      <button
        className="group relative block outline-none border-0 font-medium rounded-[24px] cursor-pointer transition-all duration-500 ease-out select-none [box-shadow:0_2px_8px_-1px_rgba(12,22,33,0.04)] hover:[box-shadow:0_4px_20px_-2px_rgba(12,22,33,0.12)] hover:-translate-y-1"
        style={{
          padding: "16px 32px",
          fontSize: fontSize,
          lineHeight: fontSize,
          letterSpacing: letterSpacing,
          backgroundColor: whiteBg,
          color: whiteText,
          "--move": "16px",
          "--skew": "25deg",
          "--skew-fast": "40deg",
          "--skew-bounce": "-12px",
        }}
      >
        <div className="flex group-hover:[&>span]:origin-[50%_100%] group-hover:[&>span]:animate-[drive_1s_linear_var(--d)]">
          {renderLetters("Drive")}
        </div>
      </button>

      {/* Embedded Global Keyframes Injection Layer */}
      <style jsx global>{`
        @keyframes move {
          40% {
            transform: translateY(var(--move));
            text-shadow: var(--shadow-active);
          }
        }

        @keyframes smoke {
          45%,
          55% {
            filter: blur(var(--blur));
          }
          50%,
          50.1% {
            opacity: 0;
          }
          25%,
          75% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(var(--move)) translateY(var(--move-y));
          }
          50.1% {
            transform: translateX(calc(var(--move) * -1));
          }
        }

        @keyframes drive {
          40% {
            opacity: 1;
          }
          55% {
            transform: skewX(var(--skew)) translateX(var(--move));
          }
          56% {
            transform: skewX(var(--skew-fast))
              translateX(calc(var(--move) * -1));
          }
          55%,
          56% {
            opacity: 0;
          }
          75% {
            transform: skewX(var(--skew));
          }
          85% {
            transform: skewX(var(--skew-bounce));
          }
        }
      `}</style>
    </div>
  );
}
