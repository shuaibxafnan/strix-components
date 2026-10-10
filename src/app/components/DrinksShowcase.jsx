"use client";

import { useEffect, useState, useRef } from "react";

// ─── Interactive Flavor Inventory ────────────────────────────────────────────
const DEFAULT_FLAVORS = [
  {
    name: ["Chai", "Vanilla"],
    tagline: "Warm Spices & Creamy Botanicals",
    color: "#2C5282", // Modern Deep Slate Blue
    image:
      "https://raw.githubusercontent.com/nidal1111/storage/master/assets/milkshake_banana.png",
    nutrition: [
      { val: "20g", desc: "Plant Protein" },
      { val: "13g", desc: "Net Fiber" },
      { val: "15", desc: "Vitamins" },
      { val: "1.8g", desc: "Omega-3" },
      { val: "1B", desc: "Probiotics" },
    ],
  },
  {
    name: ["Maple", "Peanut"],
    tagline: "Rich Autumn Sweetness & Crunch",
    color: "#9B2C2C", // Modern Deep Crimson
    image:
      "https://raw.githubusercontent.com/nidal1111/storage/master/assets/milkShake_caffe%CC%80.png",
    nutrition: [
      { val: "35g", desc: "Plant Protein" },
      { val: "10g", desc: "Net Fiber" },
      { val: "10", desc: "Vitamins" },
      { val: "1.5g", desc: "Omega-3" },
      { val: "2B", desc: "Probiotics" },
    ],
  },
  {
    name: ["Cacao", "Coconut"],
    tagline: "Pure Velvety Dark Chocolate Blend",
    color: "#B7791F", // Modern Warm Amber Gold
    image:
      "https://raw.githubusercontent.com/nidal1111/storage/master/assets/milkShake_fragole.png",
    nutrition: [
      { val: "40g", desc: "Plant Protein" },
      { val: "25g", desc: "Net Fiber" },
      { val: "22", desc: "Vitamins" },
      { val: "2.2g", desc: "Omega-3" },
      { val: "1B", desc: "Probiotics" },
    ],
  },
  {
    name: ["Berry", "Blend"],
    tagline: "Antioxidant-Rich Wildfield Infusion",
    color: "#553C9A", // Modern Royal Indigo Purple
    image:
      "https://raw.githubusercontent.com/nidal1111/storage/master/assets/milkshake_banana.png",
    nutrition: [
      { val: "28g", desc: "Plant Protein" },
      { val: "18g", desc: "Net Fiber" },
      { val: "25", desc: "Vitamins" },
      { val: "2.0g", desc: "Omega-3" },
      { val: "3B", desc: "Probiotics" },
    ],
  },
];

export default function DrinksShowcase({
  autoPlayDuration = 4500,
  panelBgColor = "bg-white/90",
  panelTextColor = "text-neutral-900",
  labelTextColor = "text-neutral-500",
  customFlavors = DEFAULT_FLAVORS,
}) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overlayColor, setOverlayColor] = useState(customFlavors[0].color);
  const [slideDownActive, setSlideDownActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const autoPlayRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const initAutoPlay = () => {
    clearAutoPlay();
    autoPlayRef.current = setInterval(() => {
      handleSlideChange((currentIndex + 1) % customFlavors.length);
    }, autoPlayDuration);
  };

  useEffect(() => {
    if (!mounted) return;
    initAutoPlay();
    return () => clearAutoPlay();
  }, [currentIndex, mounted, autoPlayDuration]);

  const handleSlideChange = (newIndex) => {
    if (newIndex === currentIndex || isAnimating) return;

    setIsAnimating(true);
    const nextFlavor = customFlavors[newIndex];

    setOverlayColor(nextFlavor.color);
    setSlideDownActive(true);

    setTimeout(() => {
      setCurrentIndex(newIndex);
    }, 400);

    setTimeout(() => {
      setSlideDownActive(false);
      setIsAnimating(false);
    }, 1200);
  };

  if (!mounted) {
    return (
      <div className="w-[640px] h-[520px] bg-neutral-950 rounded-[32px] animate-pulse flex items-center justify-center text-neutral-500 font-sans tracking-widest text-xs font-semibold">
        LOADING SHOWCASE EXPERIENCE...
      </div>
    );
  }

  const currentFlavor = customFlavors[currentIndex];

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-neutral-950 p-6 antialiased font-sans">
      {/* Container Shell */}
      <div
        className="relative w-[640px] h-[520px] rounded-[40px] overflow-hidden shadow-[0_40px_90px_rgba(0,0,0,0.7)] select-none border border-white/10 transition-colors duration-300"
        style={{ backgroundColor: currentFlavor.color }}
      >
        {/* Dynamic Color Overlay Slide Track */}
        <div
          className="absolute left-0 w-full h-full pointer-events-none will-change-transform z-10 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            backgroundColor: overlayColor,
            top: "-100%",
            transform: slideDownActive ? "translateY(100%)" : "translateY(0%)",
          }}
        />

        {/* Core Canvas Viewport */}
        <div className="relative w-full h-full flex flex-col justify-between p-10 z-20">
          {/* Header Typography Elements */}
          <div className="relative flex flex-col items-center text-center mt-2">
            <div
              className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] duration-700 ${
                slideDownActive
                  ? "opacity-0 -translate-y-4 blur-sm"
                  : "opacity-100 translate-y-0 blur-0"
              }`}
            >
              <h2 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                {currentFlavor.name[0]}{" "}
                <span className="font-light italic text-white/80">
                  {currentFlavor.name[1]}
                </span>
              </h2>
              <p className="text-xs font-medium tracking-wide text-white/60 uppercase mt-1.5">
                {currentFlavor.tagline}
              </p>
            </div>
          </div>

          {/* Centered Floating Hero Asset */}
          <div className="absolute inset-x-0 top-[20%] bottom-[26%] flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Ground Shadow */}
              <div className="absolute w-48 h-8 bg-black/30 rounded-full blur-xl bottom-2 scale-x-110" />

              <img
                className={`w-[290px] h-full object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.5)] transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-700 ${
                  slideDownActive
                    ? "opacity-0 scale-75 rotate-3 blur-sm"
                    : "opacity-100 scale-100 rotate-0 blur-0 pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-105"
                }`}
                src={currentFlavor.image}
                alt={`${currentFlavor.name.join(" ")} Display`}
              />
            </div>
          </div>

          {/* Premium Modular Metric Panel */}
          <div
            className={`w-full ${panelBgColor} backdrop-blur-xl rounded-2xl p-5 px-6 flex justify-between items-center gap-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/20 transition-all duration-500 ${
              slideDownActive
                ? "opacity-30 translate-y-4 blur-[1px]"
                : "opacity-100 translate-y-0 blur-0"
            }`}
          >
            {currentFlavor.nutrition.map((item, idx) => (
              <div
                key={idx}
                className="text-center flex-1 border-r last:border-r-0 border-neutral-300/40 last:border-transparent"
              >
                <div
                  className={`text-xl font-black tracking-tight ${panelTextColor} transition-all duration-300`}
                  style={{ transitionDelay: `${idx * 25}ms` }}
                >
                  {item.val}
                </div>
                <div
                  className={`text-[9px] uppercase font-bold tracking-widest mt-1 opacity-70 ${labelTextColor}`}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Ergonomic Navigation Dots */}
        <div className="absolute top-8 right-8 flex flex-col gap-2 z-30">
          {customFlavors.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              aria-label={`Jump to slide ${index + 1}`}
              className="group flex items-center justify-center w-5 h-5 rounded-full cursor-pointer transition-transform duration-200 active:scale-90"
            >
              <div
                className={`rounded-full transition-all duration-500 ease-out ${
                  index === currentIndex
                    ? "w-5 h-5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    : "w-4 h-4 bg-transparent border-2 border-white/40 group-hover:border-white/80 group-hover:scale-110"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
