"use client";

import { useEffect, useState, useRef } from "react";

const CAROUSEL_DEFAULT_DATA = [
  { id: "slide-1", title: "PROTOTYPE // 01", imgUrl: "https://images.unsplash.com/photo-1595265677860-9a3168007dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" },
  { id: "slide-2", title: "PROTOTYPE // 02", imgUrl: "https://images.unsplash.com/photo-1594786118579-95ba90c801ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" },
  { id: "slide-3", title: "PROTOTYPE // 03", imgUrl: "https://images.unsplash.com/photo-1509339022327-1e1e25360a41?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" },
  { id: "slide-4", title: "PROTOTYPE // 04", imgUrl: "https://images.unsplash.com/photo-1525417071002-5ee4e6bb44f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" },
  { id: "slide-5", title: "PROTOTYPE // 05", imgUrl: "https://images.unsplash.com/photo-1594072702031-f0e2a602dd2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" },
  { id: "slide-6", title: "PROTOTYPE // 06", imgUrl: "https://images.unsplash.com/photo-1592989819277-a3aafa40c66a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" },
  { id: "slide-7", title: "PROTOTYPE // 07", imgUrl: "https://images.unsplash.com/photo-1548374797-d13fd5d2b2a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" }
];

const lerp = (f0, f1, t) => (1 - t) * f0 + t * f1;
const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

export default function InertialSkewCarousel({
  bgColor = "#09090b",
  lerpFactor = 0.1,
  touchSpeedFactor = 2.5,
  itemWidthVw = 28,
  itemPaddingVw = 2.5,
  initialBarWidth = 0.15,
  carouselData = CAROUSEL_DEFAULT_DATA,
  titleColor = "#a1a1aa",
  frameBgColor = "#18181b",
  frameBorderColor = "#27272a",
  barTrackColor = "#27272a",
  barColor = "#f4f4f5",
  className = ""
}) {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const wrapRef = useRef(null);
  const progressRef = useRef(null);
  const itemsRef = useRef([]);
  const imagesRef = useRef([]);

  const progressState = useRef(0);
  const currentX = useRef(0);
  const oldX = useRef(0);
  const maxScroll = useRef(0);
  const startX = useRef(0);
  const draggingFlag = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateLayout = () => {
      if (!itemsRef.current[0] || !containerRef.current || !wrapRef.current) return;
      
      const individualItemWidth = itemsRef.current[0].clientWidth;
      const totalWrapWidth = individualItemWidth * carouselData.length;
      
      wrapRef.current.style.width = `${totalWrapWidth}px`;
      maxScroll.current = totalWrapWidth - containerRef.current.clientWidth;
    };

    const handleWheelTrack = (e) => {
      progressState.current += e.deltaY;
      progressState.current = clamp(progressState.current, 0, maxScroll.current);
    };

    calculateLayout();
    window.addEventListener("resize", calculateLayout);
    window.addEventListener("wheel", handleWheelTrack);

    let rafId;
    const renderLoop = () => {
      currentX.current = lerp(currentX.current, progressState.current, lerpFactor);
      const playrate = maxScroll.current > 0 ? currentX.current / maxScroll.current : 0;

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translateX(${-currentX.current}px)`;
      }
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${initialBarWidth + playrate * (1 - initialBarWidth)})`;
      }

      const currentSpeed = clamp(oldX.current - currentX.current, -100, 100);
      oldX.current = currentX.current;

      carouselData.forEach((_, idx) => {
        const targetItem = itemsRef.current[idx];
        const targetImage = imagesRef.current[idx];

        if (targetItem) {
          targetItem.style.transform = `scale(${1 - Math.abs(currentSpeed) * 0.002})`;
        }
        if (targetImage) {
          targetImage.style.transform = `scaleX(${1 + Math.abs(currentSpeed) * 0.004})`;
        }
      });

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", calculateLayout);
      window.removeEventListener("wheel", handleWheelTrack);
      cancelAnimationFrame(rafId);
    };
  }, [mounted, carouselData, lerpFactor, initialBarWidth]);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    draggingFlag.current = true;
    setIsDragging(true);
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  };

  const handlePointerMove = (e) => {
    if (!draggingFlag.current) return;
    const xCoord = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const directionalDelta = (startX.current - xCoord) * touchSpeedFactor;
    
    progressState.current += directionalDelta;
    progressState.current = clamp(progressState.current, 0, maxScroll.current);
    startX.current = xCoord;
  };

  const handlePointerUp = () => {
    draggingFlag.current = false;
    setIsDragging(false);
  };

  if (!mounted) {
    return <div className="w-full h-screen" style={{ backgroundColor: bgColor }} />;
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
      className={`w-full h-screen flex justify-center items-center overflow-hidden font-sans antialiased select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
      `}</style>

      <div className="w-full relative flex flex-col justify-center">
        <div 
          ref={wrapRef} 
          className="will-change-transform flex flex-row items-center whitespace-nowrap"
        >
          {carouselData.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => (itemsRef.current[idx] = el)}
              className="inline-block shrink-0 relative will-change-transform flex flex-col"
              style={{ 
                width: `${itemWidthVw}vw`, 
                padding: `${itemPaddingVw}vw` 
              }}
            >
              <div 
                className="mb-3 text-xs tracking-[0.2em] font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: titleColor }}
              >
                {item.title}
              </div>
              <figure
                className="relative z-10 block h-0 pb-[60%] overflow-hidden border rounded"
                style={{ backgroundColor: frameBgColor, borderColor: frameBorderColor }}
              >
                <img
                  ref={(el) => (imagesRef.current[idx] = el)}
                  src={item.imgUrl}
                  alt={item.title}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  loading={idx > 3 ? "lazy" : "eager"}
                  className="absolute top-0 left-0 z-10 h-full w-full object-cover vertical-middle origin-center will-change-transform max-w-none grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </figure>
            </div>
          ))}
        </div>
        <div className="fixed z-20 pointer-events-none bottom-[3vw] left-[3vw] w-[16vw] h-[2px] rounded-full overflow-hidden"
          style={{ backgroundColor: barTrackColor }}
        >
          <div
            ref={progressRef}
            className="absolute z-10 top-0 left-0 w-full h-full origin-left will-change-transform"
            style={{ backgroundColor: barColor, transform: `scaleX(${initialBarWidth})` }}
          />
        </div>

      </div>
    </div>
  );
}