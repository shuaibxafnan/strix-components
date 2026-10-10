"use client";

import { useEffect, useState } from "react";

// ─── AnimatedRevealBoxes ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// data            array     Custom steps text, titles, and step badges
// boxColors       array     Array of gradient/solid CSS strings for panels
// staggerDelay    number    Time delay between consecutive panel animations (ms)
// animDuration    number    Duration of the expansion animation (seconds)
// gridLayout      string    Tailwind responsive grid column configurations
// showBackdrops   boolean   Toggle the ambient glowing background blobs
// hoverTransform  string    Tailwind translate utility on mouse hover
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_STEPS = [
  {
    step: "01",
    title: "State Capture",
    desc: "Get the element's background colour and store it dynamically.",
  },
  {
    step: "02",
    title: "Alpha Reset",
    desc: "Set the parent element's background layer colour to completely transparent.",
  },
  {
    step: "03",
    title: "Node Injection",
    desc: "Add a lightweight child element loaded with the stored background signature.",
  },
  {
    step: "04",
    title: "Interpolation",
    desc: "Animate in the nested child element using custom hardware-accelerated transforms.",
  },
];

const DEFAULT_COLORS = [
  "linear-gradient(135deg, #ff007f 0%, #7928ca 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #e11d48 100%)",
  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
];

export default function AnimatedRevealBoxes({
  data = DEFAULT_STEPS,
  boxColors = DEFAULT_COLORS,
  staggerDelay = 500,
  animDuration = 0.85,
  gridLayout = "grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6",
  showBackdrops = true,
  hoverTransform = "hover:-translate-y-1",
}) {
  const [mounted, setMounted] = useState(false);
  const [startTrigger, setStartTrigger] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setStartTrigger(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="w-full h-screen bg-[#09090b]" />;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center m-0 font-sans bg-[#09090b] text-neutral-100 relative overflow-hidden selection:bg-purple-500/30">
      {/* Optional Ambient Background Blobs */}
      {showBackdrops && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
        </>
      )}

      <div className="max-w-4xl w-full mx-auto p-6 md:p-12 z-10">
        {/* Dynamic Bento Grid Container */}
        <div className={`grid ${gridLayout}`}>
          {data.map((item, index) => {
            const backgroundStyle =
              boxColors[index % boxColors.length] || "#222";
            const currentDelay = index * staggerDelay;

            return (
              <div
                key={index}
                className={`group relative flex flex-col justify-between h-52 p-6 rounded-2xl overflow-hidden bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-neutral-700/50 hover:shadow-neutral-950/50 cursor-pointer ${hoverTransform}`}
              >
                {/* Radial Reveal Core Background */}
                <div
                  style={{
                    background: backgroundStyle,
                    transitionDuration: `${animDuration}s`,
                    transitionDelay: `${currentDelay}ms`,
                    transform: startTrigger
                      ? "translate(0%, 0%) scale(2.5)"
                      : "translate(100%, 100%) scale(0)",
                  }}
                  className="absolute inset-0 z-0 rounded-full transition-transform cubic-bezier(0.34, 1.56, 0.64, 1) pointer-events-none opacity-[0.85] group-hover:opacity-100 duration-500"
                />

                {/* Internal Grid Overlay Mesh Layer */}
                <div className="absolute inset-0 z-[1] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

                {/* Top Row Meta Information Row */}
                <div className="flex justify-between items-start z-10 pointer-events-none">
                  {item.step && (
                    <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 group-hover:text-white/80 transition-colors duration-300 bg-neutral-950/40 group-hover:bg-black/20 px-2.5 py-1 rounded-md border border-neutral-800/30 group-hover:border-transparent">
                      {item.step}
                    </span>
                  )}
                  <div className="w-2 h-2 rounded-full bg-neutral-700 group-hover:bg-white transition-all duration-500 group-hover:scale-125 group-hover:shadow-[0_0_8px_#fff]" />
                </div>

                {/* Typography Engine Area */}
                <div className="z-10 pointer-events-none mt-auto">
                  <h3 className="text-lg font-bold text-neutral-100 group-hover:text-white tracking-tight transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 group-hover:text-white/85 mt-1.5 leading-relaxed tracking-wide transition-colors duration-300">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
