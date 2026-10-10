"use client";

import { useEffect, useRef, useState } from "react";

// ─── PaperPlaneButton ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// defaultLabel         string    'Send'      Initial unclicked state text copy
// successLabel         string    'Sent'      Final completion state text copy
// primaryColor         string    '#275EFE'   Base resting background theme accent
// darkColor            string    '#2055EE'   Shadow wing tint used for depth variations
// darkestColor         string    '#133FC0'   Crease contrast fold fill highlight
// textColor            string    '#FFFFFF'   Typography character fill color
// successBgColor       string    '#2B3044'   Button layer backdrop color when sent
// minWidth             string    '100px'     Enforced inline structural base footprint
// ──────────────────────────────────────────────────────────────────────────

export default function PaperPlaneButton({
  defaultLabel = "Send",
  successLabel = "Sent",
  primaryColor = "#275EFE",
  darkColor = "#2055EE",
  darkestColor = "#133FC0",
  textColor = "#FFFFFF",
  successBgColor = "#2B3044",
  minWidth = "100px",
}) {
  const buttonRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = async () => {
    if (isActive || !buttonRef.current) return;
    setIsActive(true);

    const button = buttonRef.current;

    // Safely pull GSAP dependency client-side
    const { default: gsap } = await import("gsap");

    const getVar = (variable) =>
      getComputedStyle(button).getPropertyValue(variable);

    // Timeline 1: Handle structural folding transformations
    gsap.to(button, {
      keyframes: [
        {
          "--left-wing-first-x": 50,
          "--left-wing-first-y": 100,
          "--right-wing-second-x": 50,
          "--right-wing-second-y": 100,
          duration: 0.2,
          onComplete() {
            gsap.set(button, {
              "--left-wing-first-y": 0,
              "--left-wing-second-x": 40,
              "--left-wing-second-y": 100,
              "--left-wing-third-x": 0,
              "--left-wing-third-y": 100,
              "--left-body-third-x": 40,
              "--right-wing-first-x": 50,
              "--right-wing-first-y": 0,
              "--right-wing-second-x": 60,
              "--right-wing-second-y": 100,
              "--right-wing-third-x": 100,
              "--right-wing-third-y": 100,
              "--right-body-third-x": 60,
            });
          },
        },
        {
          "--left-wing-third-x": 20,
          "--left-wing-third-y": 90,
          "--left-wing-second-y": 90,
          "--left-body-third-y": 90,
          "--right-wing-third-x": 80,
          "--right-wing-third-y": 90,
          "--right-body-third-y": 90,
          "--right-wing-second-y": 90,
          duration: 0.2,
        },
        {
          "--rotate": 50,
          "--left-wing-third-y": 95,
          "--left-wing-third-x": 27,
          "--right-body-third-x": 45,
          "--right-wing-second-x": 45,
          "--right-wing-third-x": 60,
          "--right-wing-third-y": 83,
          duration: 0.25,
        },
        {
          "--rotate": 55,
          "--plane-x": -8,
          "--plane-y": 24,
          duration: 0.2,
        },
        {
          "--rotate": 40,
          "--plane-x": 45,
          "--plane-y": -180,
          "--plane-opacity": 0,
          duration: 0.3,
          onComplete() {
            setTimeout(() => {
              button.removeAttribute("style");
              gsap.fromTo(
                button,
                { opacity: 0, y: -8 },
                {
                  opacity: 1,
                  y: 0,
                  clearProps: true,
                  duration: 0.3,
                  onComplete() {
                    setIsActive(false);
                  },
                },
              );
            }, 2000);
          },
        },
      ],
    });

    // Timeline 2: Handle label visibility states and shading highlights concurrently
    gsap.to(button, {
      keyframes: [
        {
          "--text-opacity": 0,
          "--border-radius": 0,
          "--left-wing-background": darkestColor,
          "--right-wing-background": darkestColor,
          duration: 0.1,
        },
        {
          "--left-wing-background": primaryColor,
          "--right-wing-background": primaryColor,
          duration: 0.1,
        },
        {
          "--left-body-background": darkColor,
          "--right-body-background": darkestColor,
          duration: 0.4,
        },
        {
          "--success-opacity": 1,
          "--success-scale": 1,
          duration: 0.25,
          delay: 0.25,
        },
      ],
    });
  };

  if (!isMounted) {
    return (
      <div
        style={{ minWidth }}
        className="h-[40px] bg-[#275EFE] opacity-20 rounded-[7px] animate-pulse"
      />
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      style={{
        minWidth: minWidth,
        color: textColor,
        transform: "rotate(calc(var(--rotate, 0) * 1deg)) translateZ(0)",
        // Initializing structural polygon token variables natively safely inside the dynamic inline scope
        "--border-radius": "7",
        "--text-opacity": "1",
        "--success-scale": ".2",
        "--success-opacity": "0",
        "--rotate": "0",
        "--plane-x": "0",
        "--plane-y": "0",
        "--plane-opacity": "1",
        "--left-wing-background": primaryColor,
        "--left-wing-first-x": "0",
        "--left-wing-first-y": "0",
        "--left-wing-second-x": "50",
        "--left-wing-second-y": "0",
        "--left-wing-third-x": "0",
        "--left-wing-third-y": "100",
        "--left-body-background": primaryColor,
        "--left-body-first-x": "50",
        "--left-body-first-y": "0",
        "--left-body-second-x": "50",
        "--left-body-second-y": "100",
        "--left-body-third-x": "0",
        "--left-body-third-y": "100",
        "--right-wing-background": primaryColor,
        "--right-wing-first-x": "50",
        "--right-wing-first-y": "0",
        "--right-wing-second-x": "100",
        "--right-wing-second-y": "0",
        "--right-wing-third-x": "100",
        "--right-wing-third-y": "100",
        "--right-body-background": primaryColor,
        "--right-body-first-x": "50",
        "--right-body-first-y": "0",
        "--right-body-second-x": "50",
        "--right-body-second-y": "100",
        "--right-body-third-x": "100",
        "--right-body-third-y": "100",
      }}
      className="group relative block cursor-pointer border-0 bg-transparent py-[8px] px-0 text-center font-sans font-medium text-[14px] leading-[24px] outline-none select-none [-webkit-appearance:none] [-webkit-tap-highlight-color:transparent]"
    >
      {/* Default Label Context View */}
      <span
        style={{ opacity: "var(--text-opacity)" }}
        className="relative z-30 block transition-opacity"
      >
        {defaultLabel}
      </span>

      {/* Success Complete Label View */}
      <span
        style={{
          transform:
            "rotate(calc(var(--rotate) * -1deg)) scale(var(--success-scale)) translateZ(0)",
          opacity: "var(--success-opacity)",
          color: successBgColor,
        }}
        className="absolute left-0 right-0 top-[8px] z-0 block origin-center"
      >
        {successLabel}
      </span>

      {/* Left Vector Wing & Body Group */}
      <div
        style={{
          opacity: "var(--plane-opacity)",
          transform:
            "translate(calc(var(--plane-x) * 1px), calc(var(--plane-y) * 1px)) translateZ(0)",
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Left Wing */}
        <div
          style={{
            borderRadius: "calc(var(--border-radius) * 1px)",
            transform: "translate(0.4%, 0) translateZ(0)",
            zIndex: 2,
            background: "var(--left-wing-background)",
            clipPath:
              "polygon(calc(var(--left-wing-first-x) * 1%) calc(var(--left-wing-first-y) * 1%), calc(var(--left-wing-second-x) * 1%) calc(var(--left-wing-second-y) * 1%), calc(var(--left-wing-third-x) * 1%) calc(var(--left-wing-third-y) * 1%))",
          }}
          className="absolute inset-0"
        />
        {/* Left Body */}
        <div
          style={{
            borderRadius: "calc(var(--border-radius) * 1px)",
            transform: "translate(0, 0) translateZ(0)",
            zIndex: 1,
            background: "var(--left-body-background)",
            clipPath:
              "polygon(calc(var(--left-body-first-x) * 1%) calc(var(--left-body-first-y) * 1%), calc(var(--left-body-second-x) * 1%) calc(var(--left-body-second-y) * 1%), calc(var(--left-body-third-x) * 1%) calc(var(--left-body-third-y) * 1%))",
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Right Vector Wing & Body Group */}
      <div
        style={{
          opacity: "var(--plane-opacity)",
          transform:
            "translate(calc(var(--plane-x) * 1px), calc(var(--plane-y) * 1px)) translateZ(0)",
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Right Wing */}
        <div
          style={{
            borderRadius: "calc(var(--border-radius) * 1px)",
            transform: "translate(-0.4%, 0) translateZ(0)",
            zIndex: 2,
            background: "var(--right-wing-background)",
            clipPath:
              "polygon(calc(var(--right-wing-first-x) * 1%) calc(var(--right-wing-first-y) * 1%), calc(var(--right-wing-second-x) * 1%) calc(var(--right-wing-second-y) * 1%), calc(var(--right-wing-third-x) * 1%) calc(var(--right-wing-third-y) * 1%))",
          }}
          className="absolute inset-0"
        />
        {/* Right Body */}
        <div
          style={{
            borderRadius: "calc(var(--border-radius) * 1px)",
            transform: "translate(0, 0) translateZ(0)",
            zIndex: 1,
            background: "var(--right-body-background)",
            clipPath:
              "polygon(calc(var(--right-body-first-x) * 1%) calc(var(--right-body-first-y) * 1%), calc(var(--right-body-second-x) * 1%) calc(var(--right-body-second-y) * 1%), calc(var(--right-body-third-x) * 1%) calc(var(--right-body-third-y) * 1%))",
          }}
          className="absolute inset-0"
        />
      </div>
    </button>
  );
}
