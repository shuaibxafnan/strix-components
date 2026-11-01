"use client";

import { useEffect, useRef, useState } from "react";

export default function SvgStickerEffect({
  radius = 4,
  outlineColor = "#fafafa",
  baseFrequency = 0.03,
  numOctaves = 3,
  seed = 1,
  type = "turbulence",
  stdDeviation = 3,
  surfaceScale = 5,
  specularConstant = 0.5,
  specularExponent = 120,
  lightingColor = "#ffffff",
  lightZ = 300,
  followPointer = true,
  dx = 0,
  dy = 2,
  shadowBlur = 2,
  shadowColor = "#000000",
  shadowOpacity = 0.5,
  className = "",
}) {
  const stickerRef = useRef(null);
  const [lightCoords, setLightCoords] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!followPointer) return;

    const handlePointerMove = (e) => {
      if (!stickerRef.current) return;
      const rect = stickerRef.current.getBoundingClientRect();

      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);

      setLightCoords({ x, y });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [followPointer]);

  return (
    <div className={`relative w-full h-screen flex items-center justify-center overflow-hidden ${className}`}>
      <svg
        className="absolute h-1 w-1 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="nextjs-sticker-filter"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feMorphology
              in="SourceAlpha"
              result="dilate"
              operator="dilate"
              radius={radius}
            />
            <feFlood floodColor={outlineColor} result="outlinecolor" />

            <feTurbulence
              baseFrequency={baseFrequency}
              seed={seed}
              numOctaves={numOctaves}
              type={type}
              result="turb"
            />
            <feComposite
              in="turb"
              in2="dilate"
              operator="in"
              result="outline"
            />
            <feComposite
              in="outlinecolor"
              in2="dilate"
              operator="in"
              result="outlineflat"
            />

            <feMerge result="merged">
              <feMergeNode in="outlineflat" />
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>

            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation={stdDeviation}
              result="blur"
            />
            <feSpecularLighting
              result="lighting"
              in="blur"
              surfaceScale={surfaceScale}
              specularConstant={specularConstant}
              specularExponent={specularExponent}
              lightingColor={lightingColor}
            >
              <fePointLight x={lightCoords.x} y={lightCoords.y} z={lightZ} />
            </feSpecularLighting>

            <feComposite
              in="lighting"
              in2="SourceAlpha"
              operator="in"
              result="composite"
            />
            <feComposite
              in="merged"
              in2="composite"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              result="litPaint"
            />

            <feDropShadow
              dx={dx}
              dy={dy}
              stdDeviation={shadowBlur}
              floodColor={shadowColor}
              floodOpacity={shadowOpacity}
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={stickerRef}
        className="w-full max-w-[400px] sm:max-w-[35vmin] min-w-[200px] overflow-visible select-none"
        style={{ filter: "url(#nextjs-sticker-filter)" }}
      >
        <svg
          viewBox="0 0 885 1059"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto overflow-visible"
        >
          <rect
            x="528"
            y="962"
            width="115"
            height="52"
            rx="26"
            transform="rotate(-90 528 962)"
            fill="#AF7128"
            stroke="#000"
            strokeWidth="6"
          />
          <path d="M552 948a3 3 0 1 0-6 0h6Zm0 12v-12h-6v12h6Z" fill="#000" />
          <path d="M564 948a3 3 0 1 0-6 0h6Zm0 12v-12h-6v12h6Z" fill="#000" />

          <path
            d="M506 673a37 37 0 1 1 66-7c13 4 26 11 36 21l14 14c10 11 18 23 21 36a37 37 0 1 1-7 67c-4 6-8 12-14 18l-47 47-77 77-6 7-15 25c-4 5-7 11-13 13-8 3-17 1-23-5l-13-12-8-7-9-9c-8-9-6-20-1-31l13-23-6-6-4-7-16 21c-6 9-20 10-29 2l-26-26c-8-9-15-21-5-37l47-60-2-8v-63a29 29 0 1 1 58 0v15l48-48c5-5 11-10 18-14Z"
            fill="#AF7128"
          />
          <path
            d="m575 869 47-47c6-6 10-12 14-18a37 37 0 1 0 7-67c-3-13-11-25-21-36l-14-14a85 85 0 0 0-36-21 37 37 0 1 0-66 7c-7 4-13 9-18 14l-48 48v-15a29 29 0 0 0-58 0v63l2 8-47 60c-10 16-3 28 5 37l26 26c9 8 23 7 29-2l16-21 4 7 6 6-13 23c-5 11-7 22 1 31l9 9 8 7 13 12c6 6 15 8 23 5 6-2 9-8 13-13l15-25 6-7 39-39"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path d="M412 705a3 3 0 0 0 6 0h-6Zm0-12v12h6v-12h-6Z" fill="#000" />
          <path d="M400 705a3 3 0 0 0 6 0h-6Zm0-12v12h6v-12h-6Z" fill="#000" />
          <path fill="#FF1E1E" d="m542 703 63 63-9 9-63-63z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M650 753c3 23-6 46-21 61l-43-44c9-10 9-25 0-35l-14-13a25 25 0 0 0-35 0l-43-44c14-14 37-23 60-21 23 3 46 14 64 32s30 41 32 64Z"
            fill="#000"
          />
          <circle
            cx="582.1"
            cy="803.3"
            transform="rotate(45 582 803)"
            fill="#000"
            r="8.1"
          />
          <circle
            cx="505.2"
            cy="726.4"
            transform="rotate(45 505 726)"
            fill="#000"
            r="8.1"
          />
          <path
            d="M548 790c-6 6-19 5-27-3-8-7-8-21-2-27 5-5 15-1 23 6 8 8 12 18 6 24Z"
            fill="#000"
          />
          <path
            d="m430 956-8 8"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="m447 973-8 8"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="m357 883-8 8"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="m374 900-8 8"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="m427 822-5-376"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
          />

          <circle
            cx="421.5"
            cy="273.5"
            r="169"
            fill="#D52828"
            stroke="#000"
            strokeWidth="6"
          />
          <path
            d="M406 445h31l10 20h-50l9-20Z"
            fill="#F20000"
            stroke="#000"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="m380 757 62-42"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
          />

          <path
            d="M384 143a136 136 0 0 0-98 119"
            stroke="#fff"
            strokeOpacity=".5"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
