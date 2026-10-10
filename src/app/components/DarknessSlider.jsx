"use client";

import { useEffect, useRef, useState } from "react";

// ─── InfiniteCreatureCarousel ────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// scrollSpeed      number   0.5        Pixels to move per animation frame
// showCursorLight  boolean  true       Enables the reactive mouse flashlight overlay
// cursorLightSize  number   300        Diameter of the cursor flashlight circle (px)
// initialCreatures array               Base dataset of image items to loop over
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_CREATURES = [
  {
    color: "#00e1ff",
    image: "https://i.ibb.co/67Mk7FFb/1-Large.jpg",
    name: "Creature 1",
  },
  {
    color: "#00e1ff",
    image: "https://i.ibb.co/Q3JV70L7/2-Large.jpg",
    name: "Creature 2",
  },
  {
    color: "#00e1ff",
    image: "https://i.ibb.co/PZrgfcVB/3-Large.jpg",
    name: "Creature 3",
  },
  {
    color: "#00e1ff",
    image: "https://i.ibb.co/9kzcxtJL/4-Large.jpg",
    name: "Creature 4",
  },
];

export default function DarknessSlider({
  scrollSpeed = 0.5,
  showCursorLight = true,
  cursorLightSize = 300,
  initialCreatures = DEFAULT_CREATURES,
}) {
  const containerRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const cursorLightRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState([]);

  // Safely sync client rendering and bypass SSR mismatch states
  useEffect(() => {
    setMounted(true);
  }, []);

  // Structural generation of repeating layout structures with individualized dynamic timings
  useEffect(() => {
    if (!mounted) return;

    const tripleSet = [];
    // Render 3 exact duplicates of the data nodes array back-to-back to generate the seamless loop bounds
    for (let loop = 0; loop < 3; loop++) {
      initialCreatures.forEach((creature, idx) => {
        const glowDuration = 3 + Math.random() * 4; // Randomized pulse rates (3s - 7s)
        const glowDelay = Math.random() * -5; // Randomized timeline stagger values

        tripleSet.push({
          ...creature,
          id: `${loop}-${idx}-${creature.image}`,
          glowDuration: `${glowDuration}s`,
          glowDelay: `${glowDelay}s`,
        });
      });
    }
    setCards(tripleSet);
  }, [mounted, initialCreatures]);

  // Handle custom interactive flashlight track vectors
  useEffect(() => {
    if (!mounted || !showCursorLight || !cursorLightRef.current) return;

    const cursorElement = cursorLightRef.current;

    const handleMouseMove = (e) => {
      cursorElement.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mounted, showCursorLight]);

  // Premium high-performance hardware-accelerated ticking animation loop engine
  useEffect(() => {
    if (!mounted || cards.length === 0 || !cardsContainerRef.current) return;

    let scrollPosition = 0;
    let animationFrameId = null;
    const cardsContainer = cardsContainerRef.current;

    const computeLoopBoundaries = () => {
      // Dynamic reading of responsive sizing configurations from modern Tailwind container instances
      const firstCard = cardsContainer.firstElementChild;
      if (!firstCard) return 0;

      const style = window.getComputedStyle(cardsContainer);
      const gap = parseInt(style.gap || "40px", 10);
      const cardWidth = firstCard.offsetWidth;

      // True architectural length of exactly 1 baseline matching collection unit package
      return initialCreatures.length * (cardWidth + gap);
    };

    const runRenderLoop = () => {
      scrollPosition += scrollSpeed;
      const boundary = computeLoopBoundaries();

      if (boundary > 0 && scrollPosition >= boundary) {
        scrollPosition = 0;
      }

      cardsContainer.style.transform = `translate3d(-${scrollPosition}px, 0, 0)`;
      animationFrameId = requestAnimationFrame(runRenderLoop);
    };

    animationFrameId = requestAnimationFrame(runRenderLoop);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, cards, scrollSpeed, initialCreatures.length]);

  if (!mounted) return null;

  return (
    <div
      className="relative w-screen h-screen bg-[#000510] flex items-center justify-center overflow-hidden cursor-none select-none text-rendering-precision"
      ref={containerRef}
    >
      {/* Global CSS Injectors for unique keyframe configurations and performance rules */}
      <style jsx global>{`
        .text-rendering-precision {
          text-rendering: geometricPrecision;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
        @keyframes autonomous-glow {
          0%,
          100% {
            box-shadow: 0 0 25px rgba(0, 225, 255, 0);
            filter: brightness(0.1);
            opacity: 0.1;
          }
          50% {
            box-shadow: 0 0 25px var(--glow-color);
            filter: brightness(1.3);
            opacity: 1;
          }
        }
        .animate-card-cycle {
          animation:
            float 3s ease-in-out infinite,
            autonomous-glow var(--glow-duration, 4s) ease-in-out infinite
              var(--glow-delay, 0s);
        }
      `}</style>

      {/* ─── DYNAMIC FLASHLIGHT LAYER ─────────────────────────────────────── */}
      {showCursorLight && (
        <div
          ref={cursorLightRef}
          className="fixed top-0 left-0 rounded-full pointer-events-none z-10 mix-blend-screen will-change-transform bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]"
          style={{
            width: `${cursorLightSize}px`,
            height: `${cursorLightSize}px`,
            transform: "translate3d(-100%, -100%, 0)",
          }}
        />
      )}

      {/* ─── CAROUSEL CONTAINER SLIDER TRACK ───────────────────────────────── */}
      <div
        ref={cardsContainerRef}
        className="relative flex gap-10 md:gap-5 p-[50px] md:p-5 will-change-transform [transform-style:preserve-3d]"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="animate-card-cycle relative w-[280px] h-[400px] md:w-[220px] md:h-[320px] bg-[#00050f]/80 rounded-[15px] overflow-hidden transition-transform duration-300 ease-out will-change-transform hover:scale-105 group"
            style={{
              "--glow-color": card.color,
              "--glow-duration": card.glowDuration,
              "--glow-delay": card.glowDelay,
            }}
          >
            {/* Overlay specularity layer item */}
            <div className="absolute inset-0 rounded-[15px] bg-gradient-to-br from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20 pointer-events-none" />

            {/* Asset Graphics Layer */}
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-110"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
