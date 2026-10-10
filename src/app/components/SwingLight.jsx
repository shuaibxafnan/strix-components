"use client";

import { useEffect, useRef } from "react";

// ─── SwingLight ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   #111       Page background
// swingDuration    number   1          Lamp swing duration (s)
// swingAngle       number   26         Lamp swing rotation degrees
// swingOriginX     number   400        SVG origin X for rotation
// swingOriginY     number   130        SVG origin Y for rotation
// glowColor        string   #FEFFD9    Glow flood color
// glowOpacity      number   0.5        Glow flood opacity
// glowBlur         number   19         Glow gaussian blur stdDeviation Y
// darkFill         string   #454545    Unlit letter fill
// litFill          string   #F5F5F5    Lit letter fill (under light)
// ──────────────────────────────────────────────────────────────────────────

// Letter paths — shared between dark group and lit group
const LETTER_PATHS = [
  "m313.26,268.73v39.85h18.23v13.08h-31.76v-52.94h13.54Z",
  "m336.4,321.67v-52.94h13.54v52.94h-13.54Z",
  "m384.12,291.34h26.69v5.37c0,7.76-2.45,14.06-7.34,18.9-4.89,4.79-11.19,7.18-18.91,7.18-8.22,0-15.02-2.65-20.42-7.94-5.29-5.29-7.94-11.82-7.94-19.59s2.65-14.27,7.94-19.66c5.29-5.34,11.85-8.02,19.66-8.02,4.89,0,9.4,1.11,13.54,3.33,4.08,2.17,7.31,5.12,9.68,8.85l-11.49,6.58c-1.06-1.66-2.62-3-4.69-4.01-2.07-1.01-4.36-1.51-6.88-1.51-4.19,0-7.61,1.36-10.29,4.08-2.67,2.77-4.01,6.25-4.01,10.44s1.31,7.59,3.93,10.36c2.67,2.82,6.4,4.24,11.19,4.24,6.15,0,10.21-2.32,12.17-6.96h-12.86v-11.65Z",
  "m445.52,288.32v-19.59h13.46v52.94h-13.46v-20.34h-14.9v20.34h-13.54v-52.94h13.54v19.59h14.9Z",
  "m463.97,268.73h39.7v13.08h-13.08v39.85h-13.54v-39.85h-13.08v-13.08Z",
];

// Clip-path letter paths (full tall versions)
const CLIP_PATHS = [
  "m313.26,268.73v39.85h18.23v121.36h-31.76v-161.21h13.54Z",
  "m336.4,429.94v-161.21h13.54v161.21h-13.54Z",
  "m445.52,288.32v-19.59h13.46v161.21h-13.46v-128.62h-14.9v128.62h-13.54v-161.21h13.54v19.59h14.9Z",
  "m463.97,268.73h39.7v13.08h-13.08v148.13h-13.54v-148.13h-13.08v-13.08Z",
  "m384.12,291.34v18.58c-4.46-.13-7.97-1.52-10.51-4.21-2.62-2.77-3.93-6.23-3.93-10.36s1.33-7.66,4.01-10.44c2.67-2.72,6.1-4.08,10.29-4.08,2.52,0,4.81.5,6.88,1.51,2.07,1.01,3.63,2.34,4.69,4.01l11.49-6.58c-2.37-3.73-5.6-6.68-9.68-8.85-4.13-2.22-8.65-3.33-13.54-3.33-7.82,0-14.37,2.67-19.66,8.02-5.29,5.4-7.94,11.95-7.94,19.66v134.29l54.6.76v-138.98h-26.69Z",
];

export default function SwingLight({
  bgColor = "#111",
  swingDuration = 1,
  swingAngle = 26,
  swingOriginX = 400,
  swingOriginY = 130,
  glowColor = "#FEFFD9",
  glowOpacity = 0.5,
  glowBlur = 19,
  darkFill = "#454545",
  litFill = "#F5F5F5",
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !svgRef.current) return;

        gsap.config({ trialWarn: false });
        gsap.set(svgRef.current, { visibility: "visible" });

        gsap.fromTo(
          svgRef.current.querySelector("#lamp"),
          {
            rotation: -swingAngle,
            svgOrigin: `${swingOriginX} ${swingOriginY}`,
          },
          {
            duration: swingDuration,
            rotation: swingAngle,
            svgOrigin: `${swingOriginX} ${swingOriginY}`,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
          },
        );
      })
      .catch((e) => console.error("[SwingLight] GSAP load failed:", e.message));
  }, [swingDuration, swingAngle, swingOriginX, swingOriginY]);

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <svg
        id="mainSVG"
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        className="w-full h-full invisible"
      >
        <defs>
          {/* Clip mask — tall letter outlines */}
          <clipPath id="lightTextMask">
            {CLIP_PATHS.map((d, i) => (
              <path key={i} d={d} fill="#fcee21" />
            ))}
          </clipPath>

          {/* Glow filter */}
          <filter id="glow" x="-100%" y="-100%" width="550%" height="550%">
            <feGaussianBlur
              stdDeviation={`0 ${glowBlur}`}
              result="coloredBlur"
            />
            <feOffset dx="0" dy="0" result="offsetblur" />
            <feFlood
              id="glowAlpha"
              floodColor={glowColor}
              floodOpacity={glowOpacity}
            />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Light cone mask */}
          <mask id="lightMask">
            <path
              id="lamp"
              d="m383,275.25l-29.1,37.09c-1.06,1.34-.1,3.31,1.61,3.31h88.99c1.71,0,2.67-1.97,1.61-3.31l-29.1-37.09c-8.65-11.03-25.35-11.03-34,0Z"
              fill="#FFF"
            />
          </mask>
        </defs>

        {/* Dark (unlit) letters */}
        <g fill={darkFill}>
          {LETTER_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Lit letters — clipped to tall outlines, filtered with glow, masked by lamp cone */}
        <g clipPath="url(#lightTextMask)">
          <g filter="url(#glow)">
            <g mask="url(#lightMask)">
              <g fill={litFill}>
                {LETTER_PATHS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
