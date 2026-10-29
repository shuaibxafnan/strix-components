"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function ExplodingPieceCarousel({
  bgColor = "#ffffff",
  width = 400,
  height = 400,
  pieceCount = 10,
  xChange = 1000,
  yChange = 1000,
  rotationAngle = 25,
  duration = 1,
  imageOptions = DEFAULT_IMAGES,
}) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track slice components array to manage clean declarative chunk states
  const [chunks, setChunks] = useState([]);

  const isChanging = useRef(false);
  const chunkRefs = useRef([]);

  // Calculate segment parameters dynamically based on prop limits
  const pieceHeight = height / pieceCount;
  const bgPosPercentStep = 100 / (pieceCount - 1 || 1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize first view state setup once component triggers layout mount safely
  useEffect(() => {
    if (!mounted) return;

    const initialChunks = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      rotation: 0,
      bgPos: `${i * bgPosPercentStep}% ${i * bgPosPercentStep}%`,
    }));
    setChunks(initialChunks);
  }, [mounted, pieceCount, bgPosPercentStep]);

  if (!mounted) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: bgColor }} />
    );
  }

  const loadGSAP = () => {
    return new Promise((resolve, reject) => {
      if (window.gsap) {
        resolve(window.gsap);
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
      script.setAttribute("data-id", "gsap-cdn");
      script.onload = () => resolve(window.gsap);
      script.onerror = () => reject(new Error("GSAP load failed"));
      document.head.appendChild(script);
    });
  };

  const handlePositionChange = async (movement) => {
    if (isChanging.current) return;
    isChanging.current = true;

    try {
      const gsap = await loadGSAP();

      // Calculate index looping sequence safely
      let nextIndex = currentIndex + movement;
      if (nextIndex < 0) {
        nextIndex = imageOptions.length - 1;
      } else if (nextIndex > imageOptions.length - 1) {
        nextIndex = 0;
      }

      // ─── STAGE 1: Explode Current Slices Outward ───
      const removePromises = chunks.map((chunk, i) => {
        return new Promise((resolve) => {
          const el = chunkRefs.current[i];
          if (!el) return resolve();

          // Phase 1A: Spin/Rotate Slices
          gsap.to(el, {
            duration: duration,
            rotation: rotationAngle,
            ease: "power3.inOut",
            onComplete: () => {
              // Phase 1B: Scatter Away from Focus Window Viewport
              gsap.to(el, {
                duration: duration,
                y: i % 2 === 0 ? -yChange : yChange,
                x: i % 2 === 0 ? -xChange : xChange,
                ease: "power3.inOut",
                onComplete: resolve,
              });
            },
          });
        });
      });

      await Promise.all(removePromises);

      // Swap texture buffer pointers to fresh frame data matrix source references
      setCurrentIndex(nextIndex);

      // ─── STAGE 2: Construct & Inwardly Pull Fresh Image Slices ───
      const resetChunks = chunks.map((chunk, i) => {
        const startX = i % 2 === 0 ? -xChange : xChange;
        const startY = i % 2 === 0 ? yChange : -yChange;
        const startRot = -rotationAngle;

        const el = chunkRefs.current[i];
        if (el) {
          // Instantly snap coordinates back to peripheral approach thresholds
          gsap.set(el, { x: startX, y: startY, rotation: startRot });
        }

        return { ...chunk, x: startX, y: startY, rotation: startRot };
      });
      setChunks(resetChunks);

      // Execute dynamic reverse assembly flow pipeline layout calculations
      const introPromises = chunks.map((_, i) => {
        return new Promise((resolve) => {
          const el = chunkRefs.current[i];
          if (!el) return resolve();

          gsap.to(el, {
            duration: duration,
            x: 0,
            y: 0,
            ease: "power3.inOut",
            onComplete: () => {
              gsap.to(el, {
                duration: duration,
                rotation: 0,
                ease: "power3.inOut",
                onComplete: resolve,
              });
            },
          });
        });
      });

      await Promise.all(introPromises);
      isChanging.current = false;
    } catch (err) {
      console.error("[ExplodingPieceCarousel] Animation sequence failed:", err);
      isChanging.current = false;
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center overflow-hidden select-none font-sans"
      style={{ backgroundColor: bgColor }}
    >
      <div
        id="app"
        className="flex items-center justify-center text-[100px] leading-none text-neutral-800"
      >
        {/* Left Directional Navigation Action Trigger */}
        <span
          onClick={() => handlePositionChange(-1)}
          className="p.30px px-[30px] py-[30px] cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 unselectable"
        >
          &#8592;
        </span>

        {/* Fragmented Shard Assembly Render Window */}
        <div
          id="theImage"
          className="flex flex-row flex-wrap bg-no-repeat relative overflow-visible"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {chunks.map((chunk, i) => (
            <div
              key={chunk.id}
              ref={(el) => (chunkRefs.current[i] = el)}
              className="bg-no-repeat will-change-transform"
              style={{
                id: `chunk${chunk.id}`,
                width: `${width}px`,
                height: `${pieceHeight}px`,
                backgroundImage: `url('${imageOptions[currentIndex]}')`,
                backgroundPosition: chunk.bgPos,
                backgroundSize: `${width}px ${height}px`,
              }}
            />
          ))}
        </div>

        {/* Right Directional Navigation Action Trigger */}
        <span
          onClick={() => handlePositionChange(1)}
          className="p.30px px-[30px] py-[30px] cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 unselectable"
        >
          &#8594;
        </span>
      </div>
    </div>
  );
}
