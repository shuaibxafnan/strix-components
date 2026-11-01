"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function ExplodingPieceCarousel({
  bgColor = "#ffffff",
  arrowColor = "#262626",
  width = 400,
  height = 400,
  pieceCount = 10,
  xChange = 1000,
  yChange = 1000,
  rotationAngle = 25,
  duration = 1,
  imageOptions = DEFAULT_IMAGES,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chunks, setChunks] = useState([]);

  const isChanging = useRef(false);
  const alive = useRef(true);
  const chunkRefs = useRef([]);

  const bgPosPercentStep = 100 / (pieceCount - 1 || 1);

  useEffect(() => {
    alive.current = true;
    setMounted(true);
    return () => {
      alive.current = false;
      import("gsap").then(({ gsap }) => {
        chunkRefs.current.forEach((el) => el && gsap.killTweensOf(el));
      });
    };
  }, []);

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
      <div
        className={`w-full h-screen ${className}`}
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  const handlePositionChange = async (movement) => {
    if (isChanging.current) return;
    isChanging.current = true;

    try {
      const { gsap } = await import("gsap");

      let nextIndex = currentIndex + movement;
      if (nextIndex < 0) {
        nextIndex = imageOptions.length - 1;
      } else if (nextIndex > imageOptions.length - 1) {
        nextIndex = 0;
      }

      const removePromises = chunks.map((chunk, i) => {
        return new Promise((resolve) => {
          const el = chunkRefs.current[i];
          if (!el) return resolve();

          gsap.to(el, {
            duration: duration,
            rotation: rotationAngle,
            ease: "power3.inOut",
            onComplete: () => {
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
      if (!alive.current) return;

      setCurrentIndex(nextIndex);

      const resetChunks = chunks.map((chunk, i) => {
        const startX = i % 2 === 0 ? -xChange : xChange;
        const startY = i % 2 === 0 ? yChange : -yChange;
        const startRot = -rotationAngle;

        const el = chunkRefs.current[i];
        if (el) {
          gsap.set(el, { x: startX, y: startY, rotation: startRot });
        }

        return { ...chunk, x: startX, y: startY, rotation: startRot };
      });
      setChunks(resetChunks);

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
      isChanging.current = false;
    }
  };

  const arrowClass =
    "px-2 py-4 sm:px-[30px] sm:py-[30px] cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150";

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden select-none font-sans ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="flex items-center justify-center text-[48px] sm:text-[100px] leading-none"
        style={{ color: arrowColor }}
      >
        <span onClick={() => handlePositionChange(-1)} className={arrowClass}>
          &#8592;
        </span>

        <div
          className="flex flex-row flex-wrap bg-no-repeat relative overflow-visible"
          style={{
            width: `min(${width}px, 65vw)`,
            aspectRatio: `${width} / ${height}`,
          }}
        >
          {chunks.map((chunk, i) => (
            <div
              key={chunk.id}
              ref={(el) => (chunkRefs.current[i] = el)}
              className="bg-no-repeat will-change-transform"
              style={{
                width: "100%",
                height: `${100 / pieceCount}%`,
                backgroundImage: `url('${imageOptions[currentIndex]}')`,
                backgroundPosition: chunk.bgPos,
                backgroundSize: `100% ${pieceCount * 100}%`,
              }}
            />
          ))}
        </div>

        <span onClick={() => handlePositionChange(1)} className={arrowClass}>
          &#8594;
        </span>
      </div>
    </div>
  );
}
