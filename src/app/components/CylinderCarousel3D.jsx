"use client";

import { useEffect, useState, useRef } from "react";

// ─── CylinderCarousel3D ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// itemWidth          number   45              Width of each thumbnail card (px)
// itemHeight         number   45              Height of each thumbnail card (px)
// itemGap            number   5               Padding gutter margin spacing around cards (px)
// perspective        number   250             3D camera perspective focal view depth (px)
// translateZ         number   -100            Z-axis translation setback depth placement (px)
// pageBgColor        string   "bg-zinc-50"    Background color class for full view canvas
// tipText            string   "Use your finger or mouse to swipe up and down"
// imageList          array    [...]           Custom imagery string reference path collection
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = Array.from(
  { length: 24 },
  (_, i) => `https://picsum.photos/id/${i + 1}/200/300`,
);

export default function CylinderCarousel3D({
  itemWidth = 45,
  itemHeight = 45,
  itemGap = 5,
  perspective = 250,
  translateZ = -100,
  pageBgColor = "bg-slate-50",
  tipText = "Use your finger or mouse to swipe up and down :)",
  imageList = DEFAULT_IMAGES,
}) {
  const [mounted, setMounted] = useState(false);
  const [rotateX, setRotateX] = useState(0);

  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startRotateX = useRef(0);

  // Structural dynamic dimensions derived on-the-fly via sizing parameters
  const itemGapDouble = itemGap * 2;
  const cameraWidth = itemWidth + itemGapDouble;
  const cameraHeight = itemHeight + itemGapDouble;

  // 3D Polar projection radial calculations for the cylinder spine geometry
  const itemCount = imageList.length;
  const itemDeg = 360 / itemCount;
  const radAngleHalf = ((itemDeg / 2) * Math.PI) / 180;
  const computedRadius = cameraHeight / 2 / Math.tan(radAngleHalf);

  useEffect(() => {
    setMounted(true);

    // Global touch canvas interaction lock to prevent bouncy elastic pulling on mobile targets
    const treatPreventDefault = (e) => {
      if (isDragging.current) e.preventDefault();
    };

    document.body.addEventListener("touchmove", treatPreventDefault, {
      passive: false,
    });
    return () => {
      document.body.removeEventListener("touchmove", treatPreventDefault);
    };
  }, []);

  // Gesture Interaction Handlers (Unifies Touch and Mouse Tracking Systems)
  const handlePointerDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    startRotateX.current = rotateX;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const deltaY = currentY - startY.current;

    // Direct proportional translation factor mapping scroll delta to continuous angle rotation degrees
    const swiperTrackHeight = 468;
    const sweepDegDelta = (deltaY / swiperTrackHeight) * 360;

    // Inverted operator here from '+' to '-' so that drag direction perfectly maps 1:1 to spatial movement
    setRotateX(startRotateX.current - sweepDegDelta);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  if (!mounted) {
    return (
      <div
        className={`w-full h-screen flex flex-col items-center justify-center ${pageBgColor}`}
      />
    );
  }

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden relative select-none ${pageBgColor}`}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
    >
      {/* Floating User Guide Header Banner */}
      <div className="absolute top-16 text-xs md:text-sm tracking-wide font-medium text-slate-500 pointer-events-none select-none">
        {tipText}
      </div>

      {/* Transparent Interactive Capture Area Overlay */}
      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        className="absolute w-[120px] h-[468px] cursor-grab active:cursor-grabbing z-50 rounded-xl"
      />

      {/* Main Perspective Framework Block */}
      <div
        ref={containerRef}
        className="relative pointer-events-none"
        style={{
          width: `${cameraWidth}px`,
          height: `${cameraHeight}px`,
          perspective: `${perspective}px`,
        }}
      >
        {/* Core Rotational Cylinder Hub Node */}
        <div
          className="absolute w-full h-full transition-transform duration-300 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(${translateZ}px) rotateX(${rotateX}deg)`,
          }}
        >
          {imageList.map((imgUrl, index) => {
            const currentItemRotationX = index * itemDeg;
            return (
              <img
                key={`slice-node-${index}`}
                src={imgUrl}
                alt=""
                loading={index > 6 ? "lazy" : "eager"}
                className="absolute object-cover shadow-md pointer-events-none [backface-visibility:hidden]"
                style={{
                  left: `${itemGap}px`,
                  top: `${itemGap}px`,
                  width: `${itemWidth}px`,
                  height: `${itemHeight}px`,
                  borderRadius: "5px",
                  transform: `rotateX(${currentItemRotationX}deg) translateZ(${computedRadius}px)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
