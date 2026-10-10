"use client";

import { useEffect, useState, useRef } from "react";

// ─── Perspective3DParallaxCarousel ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   "#2e2d31"           Page background profile color
// perspective        number   250                 3D field-of-view depth distortion (px)
// rotationAngle      number   100                 Y-axis rotation skew angle for wing panes
// initialSlide       number   2                   Starting structural array index (1-based)
// horizontalPadding  number   200                 Active viewport offset edge bounds padding
// imageOptions       array    [MOCK_DATA]         Image sources matrix stream
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1492970471430-bc6bd7eb2b13?ixlib=rb-0.3.5&s=9893bc89e46e2b77a5d8c091fbba04e9&auto=format&fit=crop&w=1355&q=80",
  "https://images.unsplash.com/photo-1501707305551-9b2adda5e527?ixlib=rb-0.3.5&s=0cf5887247e17503ce4e542d00d86b9d&auto=format&fit=crop&w=1335&q=80",
  "https://images.unsplash.com/photo-1496749843252-699a989877a1?ixlib=rb-0.3.5&s=fe5da9650707e5a93c8c3cf164c2e74b&auto=format&fit=crop&w=1375&q=80",
];

export default function Perspective3DParallaxCarousel({
  bgColor = "#2e2d31",
  perspective = 250,
  rotationAngle = 100,
  initialSlide = 2,
  horizontalPadding = 200,
  imageOptions = DEFAULT_IMAGES,
}) {
  const [mounted, setMounted] = useState(false);
  const [debugValue, setDebugValue] = useState(0);

  const wrapperRef = useRef(null);
  const leftTrackRef = useRef(null);
  const centerTrackRef = useRef(null);
  const rightTrackRef = useRef(null);

  const totalSlides = imageOptions.length;
  const maxDeltaIndex = totalSlides - 1;

  // Derive initial default transform alignment coordinates
  const initialOffset = 100 - 100 * initialSlide;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !wrapperRef.current) return;

    const mapRange = (value, inMin, inMax, outMin, outMax) => {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };

    const handleGlobalMouseMove = (e) => {
      const containerRect = wrapperRef.current.getBoundingClientRect();

      // Enforce interactive edge boundary clipping matrix
      const relativeMouseX = Math.min(
        Math.max(e.clientX - horizontalPadding, 0),
        containerRect.width - horizontalPadding * 2,
      );

      const targetPercent = mapRange(
        relativeMouseX,
        0,
        containerRect.width - horizontalPadding * 2,
        100 - 100 * maxDeltaIndex,
        100,
      );

      const computedPercent = Math.round(targetPercent);
      setDebugValue(computedPercent);

      // Instantly inject layout metrics bypassing component recalculations completely
      if (leftTrackRef.current) {
        leftTrackRef.current.style.transform = `translateX(${computedPercent}%)`;
      }
      if (centerTrackRef.current) {
        centerTrackRef.current.style.transform = `translateX(${computedPercent - 100}%)`;
      }
      if (rightTrackRef.current) {
        rightTrackRef.current.style.transform = `translateX(${computedPercent - 200}%)`;
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [mounted, horizontalPadding, maxDeltaIndex]);

  if (!mounted) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: bgColor }} />
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full h-screen relative flex items-center justify-center overflow-hidden select-none"
      style={{ backgroundColor: bgColor }}
    >
      {/* 3D Render Perspective Engine Viewport */}
      <div
        className="relative flex items-center justify-center"
        style={{
          perspective: `${perspective}px`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* ─── LEFT PANEL WING (Rotated Plane) ─── */}
        <div
          className="overflow-hidden w-[60vw] h-[80vh] absolute top-0 bottom-0 right-full will-change-transform"
          style={{
            transformOrigin: "right center",
            transform: `rotateY(${rotationAngle}deg)`,
          }}
        >
          <div
            ref={leftTrackRef}
            className="flex flex-row w-full h-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(${initialOffset + 100}%)` }}
          >
            {imageOptions.map((src, idx) => (
              <div
                key={`left-pane-${idx}`}
                className="flex-shrink-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundPositionY: idx > 0 ? "50%" : "initial",
                }}
              />
            ))}
          </div>
        </div>

        {/* ─── CENTER PANEL WINDOW (Flat Base Plane) ─── */}
        <div className="overflow-hidden w-[60vw] h-[80vh] will-change-transform relative">
          <div
            ref={centerTrackRef}
            className="flex flex-row w-full h-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(${initialOffset}%)` }}
          >
            {imageOptions.map((src, idx) => (
              <div
                key={`center-pane-${idx}`}
                className="flex-shrink-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundPositionY: idx > 0 ? "50%" : "initial",
                }}
              />
            ))}
          </div>
        </div>

        {/* ─── RIGHT PANEL WING (Rotated Plane) ─── */}
        <div
          className="overflow-hidden w-[60vw] h-[80vh] absolute top-0 bottom-0 left-full will-change-transform"
          style={{
            transformOrigin: "left center",
            transform: `rotateY(-${rotationAngle}deg)`,
          }}
        >
          <div
            ref={rightTrackRef}
            className="flex flex-row w-full h-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(${initialOffset - 100}%)` }}
          >
            {imageOptions.map((src, idx) => (
              <div
                key={`right-pane-${idx}`}
                className="flex-shrink-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundPositionY: idx > 0 ? "50%" : "initial",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Layout Position Tracking Metrics */}
      <p className="absolute top-[2vh] w-full text-center font-sans text-sm font-light tracking-[0.1em] m-0 text-neutral-100/90">
        {debugValue}
      </p>

      <p className="absolute bottom-[2vh] w-full text-center font-sans text-sm font-light tracking-[0.1em] leading-relaxed m-0 text-neutral-100/90">
        Move your mouse horizontally
      </p>
    </div>
  );
}
