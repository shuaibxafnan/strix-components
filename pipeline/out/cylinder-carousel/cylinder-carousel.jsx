"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_IMAGES = Array.from(
  { length: 24 },
  (_, i) => `https://picsum.photos/id/${i + 1}/200/300`,
);

export default function CylinderCarousel({
  itemWidth = 45,
  itemHeight = 45,
  itemGap = 5,
  perspective = 250,
  translateZ = -100,
  bgColor = "#f8fafc",
  tipColor = "#64748b",
  tipText = "Use your finger or mouse to swipe up and down :)",
  imageList = DEFAULT_IMAGES,
  imageAlt = "",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [rotateX, setRotateX] = useState(0);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startRotateX = useRef(0);

  const itemGapDouble = itemGap * 2;
  const cameraWidth = itemWidth + itemGapDouble;
  const cameraHeight = itemHeight + itemGapDouble;

  const itemCount = imageList.length;
  const itemDeg = 360 / itemCount;
  const radAngleHalf = ((itemDeg / 2) * Math.PI) / 180;
  const computedRadius = cameraHeight / 2 / Math.tan(radAngleHalf);

  useEffect(() => {
    setMounted(true);

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

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    startRotateX.current = rotateX;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const deltaY = currentY - startY.current;

    const swiperTrackHeight = 468;
    const sweepDegDelta = (deltaY / swiperTrackHeight) * 360;

    setRotateX(startRotateX.current - sweepDegDelta);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  if (!mounted) {
    return (
      <div
        className={`w-full h-screen flex flex-col items-center justify-center ${className}`}
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden relative select-none ${className}`}
      style={{ backgroundColor: bgColor }}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
    >
      <div
        className="absolute top-16 px-4 text-center text-xs md:text-sm tracking-wide font-medium pointer-events-none select-none"
        style={{ color: tipColor }}
      >
        {tipText}
      </div>

      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        className="absolute w-[120px] h-[468px] max-h-full cursor-grab active:cursor-grabbing z-50 rounded-xl"
      />

      <div
        className="relative pointer-events-none"
        style={{
          width: `${cameraWidth}px`,
          height: `${cameraHeight}px`,
          perspective: `${perspective}px`,
        }}
      >
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
                alt={imageAlt}
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
