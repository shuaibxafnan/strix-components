"use client";

import { useEffect, useState, useRef } from "react";

// ─── ModernAmbientSlideshow ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images          array    [...]       Image configuration dataset items
// slideDuration   number   5000        Interval runtime per active item (ms)
// moteInterval    number   4000        Dust generation loop frequency (ms)
// initialBlur     number   0.4         Intro wrapper blur coefficient (em)
// baseBgColor     string   "bg-[#0a0a0a]" Clean, dark luxury backdrop fill
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1501949997128-2fdb9f6428f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "Closeup of a curling ocean wave.",
    title: "Jeremy Bishop",
  },
  {
    src: "https://images.unsplash.com/photo-1476673160081-cf065607f449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "Foamy waves gently lapping a sandy beach shore.",
    title: "Frank McKenna",
  },
  {
    src: "https://images.unsplash.com/photo-1490365728022-deae76380607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "A starfish at the shallow edge of ocean water, alone on white sand.",
    title: "Amy Humphries",
  },
  {
    src: "https://images.unsplash.com/photo-1506252374453-ef5237291d83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "An aerial view of waves rolling onto a sandy beach.",
    title: "Samuel Scrimshaw",
  },
];

export default function SlideProjector({
  images = DEFAULT_IMAGES,
  slideDuration = 5000,
  moteInterval = 4000,
  initialBlur = 0.4,
  baseBgColor = "bg-[#0c0d0e]",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);
  const [globalBlur, setGlobalBlur] = useState(initialBlur);
  const [brightness, setBrightness] = useState(0.99);
  const [motes, setMotes] = useState([]);

  const moteIdCounter = useRef(0);

  // Smooth entry fade clearing blur configurations
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalBlur(0);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Main structural carousel execution hook
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        setPrevIndex(prev);
        return prev === images.length - 1 ? 0 : prev + 1;
      });
    }, slideDuration);

    return () => clearInterval(interval);
  }, [images.length, slideDuration]);

  // Clean obsolete layout visibility layers safely
  useEffect(() => {
    if (prevIndex !== -1) {
      const clearPrevTimer = setTimeout(() => {
        setPrevIndex(-1);
      }, 400);
      return () => clearTimeout(clearPrevTimer);
    }
  }, [activeIndex, prevIndex]);

  // Subtle natural light flickering engine
  useEffect(() => {
    const lightInterval = setInterval(() => {
      setBrightness(0.97 + Math.random() * 0.03);
    }, 24);
    return () => clearInterval(lightInterval);
  }, []);

  // Ambient Floating Dust Engine
  useEffect(() => {
    const generateMote = () => {
      const id = moteIdCounter.current++;
      const startX = Math.random();
      const startY = Math.random();
      const endX = Math.random();
      const endY = Math.random();
      const duration = 9000 + Math.random() * 4000;
      const size = Math.random() * 0.4 + 0.2; // Slightly smaller for premium scale look
      const targetOpacity = Math.random() * 0.15 + 0.35;

      const newMote = {
        id,
        size,
        startX,
        startY,
        endX,
        endY,
        duration,
        targetOpacity,
      };

      setMotes((prev) => [...prev, newMote]);

      setTimeout(() => {
        setMotes((prev) => prev.filter((m) => m.id !== id));
      }, duration);
    };

    generateMote();
    const interval = setInterval(generateMote, moteInterval);

    return () => clearInterval(interval);
  }, [moteInterval]);

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden relative select-none font-sans ${baseBgColor}`}
    >
      {/* Structural Framing Content Canvas */}
      <div
        className="relative overflow-hidden w-[95vmin] md:w-[105vmin] h-[75vmin] bg-[#141619] rounded-2xl border border-white/[0.04] shadow-[0_24px_70px_-10px_rgba(0,0,0,0.7),_inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-[6000ms] ease-out"
        style={{
          filter: `brightness(${brightness})`,
          fontSize: "2vmin",
        }}
      >
        {images.map((img, idx) => {
          const isVisible = idx === activeIndex || idx === prevIndex;

          return (
            <div
              key={idx}
              className="absolute w-[92%] h-[92%] left-[4%] top-[4%] overflow-hidden rounded-xl transition-[transform,filter] duration-270 ease-linear"
              style={{
                filter: `blur(${globalBlur}em)`,
                transform: isVisible
                  ? "translateX(0%) rotate(0deg) translateX(0%) rotate(1.2deg)"
                  : "translateX(1050%) rotate(7deg) translateX(-1050%) rotate(1.2deg)",
                zIndex: idx === activeIndex ? 10 : idx === prevIndex ? 5 : 0,
                transitionDuration: isVisible ? "270ms, 8s" : "270ms, 0s",
              }}
            >
              {/* Dynamic Overlay Shadow Mapping to neutralize hard contrast limits */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 pointer-events-none" />

              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover block scale-[1.02] mix-blend-luminosity brightness-[0.9] contrast-[1.05]"
              />
            </div>
          );
        })}

        {/* Minimal Editorial UX Metadata Overlays */}
        <div className="absolute bottom-10 left-10 z-30 text-white/40 font-light tracking-[0.2em] text-[1.1rem] uppercase pointer-events-none hidden md:block">
          {images[activeIndex]?.title || "Gallery Exhibit"}
        </div>

        <div className="absolute bottom-10 right-10 z-30 font-mono text-white/50 text-[1.2rem] tracking-wider pointer-events-none hidden md:block">
          <span className="text-white font-normal">
            {(activeIndex + 1).toString().padStart(2, "0")}
          </span>
          <span className="text-white/20 mx-1">/</span>
          {images.length.toString().padStart(2, "0")}
        </div>

        {/* Fluid Ambient Microparticles Layer */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {motes.map((m) => (
            <span
              key={m.id}
              className="absolute rounded-full bg-neutral-400/40 blur-[0.4em] block will-change-[transform,opacity]"
              style={{
                width: `${m.size}em`,
                height: `${m.size}em`,
                animation: `moteMove-${m.id} ${m.duration}ms linear forwards, moteFade-${m.id} ${m.duration}ms linear forwards`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Global CSS Style Variable Keyframe Injector */}
      <style
        dangerouslySetInnerHTML={{
          __html: motes
            .map(
              (m) => `
          @keyframes moteMove-${m.id} {
            0% { left: ${m.startX * 100}%; top: ${m.startY * 100}%; }
            100% { left: ${m.endX * 100}%; top: ${m.endY * 100}%; }
          }
          @keyframes moteFade-${m.id} {
            0%, 100% { opacity: 0; }
            50% { opacity: ${m.targetOpacity}; }
          }
        `,
            )
            .join("\n"),
        }}
      />
    </div>
  );
}
