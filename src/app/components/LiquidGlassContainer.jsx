"use client";

import React, { useEffect, useState } from "react";

// ─── LiquidGlassContainer ────────────────────────────────────────────────────
//
// Props Description
// ──────────────────────────────────────────────────────────────────────────
// bgImage          string   A flower image URL   The scrolling background image
// bgSize           string   400px                CSS background-size value
// bgScrollDuration string   60s                  Duration of background scroll
// containerWidth   string   300px                Width of the card container
// containerHeight  string   200px                Height of the card container
// containerRadius  string   30px                 Border radius of the container
// btnSize          string   70px                 Width & height of the inner button
// btnBgOpacity     number   0.1                  White background opacity of button (0-1)
// containerScale   number   77                   SVG Displacement scale for container glass
// baseFrequencyX   number   0.008                Horizontal frequency of fractal noise
// baseFrequencyY   number   0.008                Vertical frequency of fractal noise
// seed             number   92                   Random seed for fractal noise
// iconStrokeWidth  number   2                    Stroke width of the internal plus icon
// btnMapPath       string   "/displacement-map.png" Path to your downloaded image inside /public
// ──────────────────────────────────────────────────────────────────────────

export default function LiquidGlassContainer({
  bgImage = "https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/flowers.jpg",
  bgSize = "400px",
  bgScrollDuration = "60s",
  containerWidth = "300px",
  containerHeight = "200px",
  containerRadius = "30px",
  btnSize = "70px",
  btnBgOpacity = 0.1,
  containerScale = 77,
  baseFrequencyX = 0.008,
  baseFrequencyY = 0.008,
  seed = 92,
  iconStrokeWidth = 2,
  btnMapPath = "/blob.png",
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes moveBackground {
          from { background-position: 0% 0%; }
          to { background-position: 0% -1000%; }
        }
      `,
        }}
      />

      {/* Main Page Wrapper */}
      <div
        className="relative w-full h-screen flex items-center justify-center m-0 p-0 overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: "center center",
          backgroundSize: bgSize,
          animation: `moveBackground ${bgScrollDuration} linear infinite`,
        }}
      >
        {/* Card Container */}
        <div
          className="fixed flex items-center justify-center z-10"
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
        >
          {/* 1. Liquid Glass Distortion Layer */}
          <div
            className="absolute inset-0 -z-10 backdrop-blur-0 overflow-hidden isolate"
            style={{
              borderRadius: containerRadius,
              filter: "url(#container-glass)",
            }}
          />

          {/* 2. Glass Inner Rim Highlight Layer */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              borderRadius: containerRadius,
              boxShadow:
                "inset 2px 2px 0px -2px rgba(255, 255, 255, 0.7), inset 0 0 3px 1px rgba(255, 255, 255, 0.7)",
            }}
          />

          {/* Interactive Central Button */}
          <button
            type="button"
            className="relative flex items-center justify-center cursor-pointer bg-transparent outline-none border-none z-10 group"
            style={{
              width: btnSize,
              height: btnSize,
            }}
          >
            {/* Button Liquid Filter Backing */}
            <div
              className="absolute inset-0 -z-10 rounded-full backdrop-blur-0 overflow-hidden isolate"
              style={{
                filter: "url(#btn-glass)",
              }}
            />

            {/* Button Glass Inner Highlight */}
            <div
              className="absolute inset-0 z-0 rounded-full transition-colors duration-300 group-hover:bg-white/15"
              style={{
                boxShadow:
                  "inset 2px 2px 0px -2px rgba(255, 255, 255, 0.7), inset 0 0 3px 1px rgba(255, 255, 255, 0.7)",
                backgroundColor: `rgba(255, 255, 255, ${btnBgOpacity})`,
              }}
            />

            {/* Plus Icon Graphic */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 stroke-white z-10 pointer-events-none"
              style={{ strokeWidth: iconStrokeWidth }}
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        </div>

        {/* Global Hidden SVG Filters definition */}
        <svg className="hidden absolute w-0 h-0">
          <defs>
            {/* Container Liquid Glass Configuration */}
            <filter
              id="container-glass"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={`${baseFrequencyX} ${baseFrequencyY}`}
                numOctaves="2"
                seed={seed}
                result="noise"
              />
              <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="blur"
                scale={containerScale}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            {/* Button Liquid Glass Configuration */}
            {/* objectBoundingBox ensures the image maps precisely over our fluid button dimensions */}
            {/* Button Liquid Glass Configuration */}
            <filter
              id="btn-glass"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              filterUnits="userSpaceOnUse"
            >
              <feImage
                href={btnMapPath}
                xlinkHref={
                  btnMapPath
                }
                x="0"
                y="0"
                width="100%"
                height="100%"
                result="png-map"
                preserveAspectRatio="none"
              />
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="5"
                result="blur"
              />
              <feDisplacementMap
                in="blur"
                in2="png-map"
                scale="30" /* Increased primitive scale for userSpaceOnUse */
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      </div>
    </>
  );
}
