"use client";

import { useEffect, useRef, useState } from "react";

// ─── ConceptInsightMatrix ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// backgroundColor string   "#000000" Dynamic backdrop canvas color value
// initialColor    string   "#4f4f4f" Unlit resting color state for typography rows
// activeColor     string   "#ffffff" Lit highlight color state for rows
// staggerSpeed    number   0.075     Sequential delay gap between array items
// displayDuration number   1.5       Retention window for active visibility states
// ──────────────────────────────────────────────────────────────────────────

const MATRIX_ITEMS = [
  { concept: "Creative Process", insight: "Embrace The Empty Space" },
  { concept: "Visual Language", insight: "What You Remove Matters" },
  { concept: "Digital Minimalism", insight: "Subtract Until It Breaks" },
  { concept: "Cinematic Vision", insight: "First Thought - Best Thought" },
  { concept: "Sound Design", insight: "Listen To The Silence" },
  { concept: "Future Interfaces", insight: "Invisible Is Powerful" },
  { concept: "Creative Coding", insight: "Intuition Over Logic" },
  { concept: "Authentic Creation", insight: "Truth Resonates" },
];

export default function ConceptInsightMatrix({
  backgroundColor = "#000000",
  initialColor = "#4f4f4f",
  activeColor = "#ffffff",
  staggerSpeed = 0.075,
  displayDuration = 1.5,
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const additionsRef = useRef([]);
  const centerDotRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const loadGSAP = async () => {
      try {
        const { default: gsap } = await import("gsap");
        if (!containerRef.current) return;

        const header = containerRef.current.querySelector(".matrix-header");
        const items = containerRef.current.querySelectorAll(".matrix-item");
        const triggerBtn = buttonRef.current;

        const runSequence = () => {
          const tl = gsap.timeline();

          gsap.set([header, items, triggerBtn], { opacity: 0 });
          gsap.set(items, { color: initialColor });

          tl.to(header, {
            opacity: 1,
            duration: 0.25,
            ease: "power3.out",
          })
            .to(
              items,
              {
                opacity: 1,
                duration: 0.3,
                stagger: staggerSpeed,
                ease: "power2.out",
              },
              "-=0.1",
            )
            .to(
              items,
              {
                color: activeColor,
                duration: 0.3,
                stagger: staggerSpeed,
                ease: "power1.inOut",
              },
              "-=0.4",
            )
            .to(items, {
              opacity: 0,
              duration: 0.4,
              stagger: staggerSpeed,
              delay: displayDuration,
              ease: "power3.in",
            })
            .to(
              header,
              {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
              },
              "-=0.2",
            )
            .to(triggerBtn, {
              opacity: 1,
              duration: 0.4,
              ease: "back.out(1.7)",
            });
        };

        // Initialize Matrix sequence
        runSequence();

        // Attach layout activation cycle hook
        triggerBtn.onclick = () => {
          gsap.to(triggerBtn, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: runSequence,
          });
        };
      } catch (error) {
        console.error(
          "Failed to load or construct GSAP matrix context:",
          error,
        );
      }
    };

    loadGSAP();
  }, [initialColor, activeColor, staggerSpeed, displayDuration]);

  const handleMouseEnter = () => {
    if (typeof window === "undefined" || !window.gsap) return;
    const gsap = window.gsap;

    gsap.to(additionsRef.current, {
      opacity: 1,
      duration: 0.3,
      stagger: 0.03,
      ease: "power2.out",
    });

    gsap.to(centerDotRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "back.out(2)",
    });
  };

  const handleMouseLeave = () => {
    if (typeof window === "undefined" || !window.gsap) return;
    const gsap = window.gsap;

    gsap.to(additionsRef.current, {
      opacity: 0,
      duration: 0.2,
      stagger: 0.02,
      ease: "power1.in",
    });

    gsap.to(centerDotRef.current, {
      opacity: 0,
      scale: 0,
      duration: 0.2,
      ease: "power1.in",
    });
  };

  if (!mounted) return null;

  return (
    <div
      className="w-full h-screen flex justify-center items-center p-8 select-none"
      style={{ backgroundColor }}
    >
      {/* Structural Data Matrix Container */}
      <div ref={containerRef} className="w-full max-w-[800px] flex flex-col">
        {/* Dynamic Matrix Column Titles */}
        <div className="matrix-header flex gap-8 py-2 border-b border-zinc-900 mb-2 opacity-0">
          <div className="flex-1 uppercase font-mono text-[10px] tracking-[0.2em] text-zinc-500">
            Concept
          </div>
          <div className="flex-1 uppercase font-mono text-[10px] tracking-[0.2em] text-zinc-500">
            Insight
          </div>
        </div>

        {/* Mapped Row Generation Nodes */}
        {MATRIX_ITEMS.map((item, index) => (
          <div
            key={index}
            className="matrix-item flex gap-8 py-2 border-b border-zinc-950/40 text-xs tracking-wide opacity-0"
            style={{ color: initialColor }}
          >
            <div className="flex-1 font-mono uppercase text-[11px] font-semibold tracking-wider">
              {item.concept}
            </div>
            <div className="flex-1 font-serif italic text-zinc-400 font-light text-[13px]">
              {item.insight}
            </div>
          </div>
        ))}
      </div>

      {/* Radial Loop Control Trigger Mod */}
      <button
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed bottom-8 right-8 w-12 h-12 border-0 bg-transparent cursor-pointer p-0 opacity-0 z-50 focus:outline-none group"
        aria-label="Restart Grid Animation Sequence"
      >
        <div className="relative w-full h-full">
          {/* Axis Node 01 - Top Anchor */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-white top-0 left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-110" />
          {/* Axis Node 02 - Right Anchor */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-white top-1/2 right-0 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110" />
          {/* Axis Node 03 - Bottom Anchor */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-white bottom-0 left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-110" />
          {/* Axis Node 04 - Left Anchor */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-white top-1/2 left-0 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110" />

          {/* Sub-Diagonal Anchor Array Sets (Hidden at Rest) */}
          <div
            ref={(el) => (additionsRef.current[0] = el)}
            className="absolute w-1.5 h-1.5 rounded-full bg-zinc-400 top-2 right-2 opacity-0"
          />
          <div
            ref={(el) => (additionsRef.current[1] = el)}
            className="absolute w-1.5 h-1.5 rounded-full bg-zinc-400 bottom-2 right-2 opacity-0"
          />
          <div
            ref={(el) => (additionsRef.current[2] = el)}
            className="absolute w-1.5 h-1.5 rounded-full bg-zinc-400 bottom-2 left-2 opacity-0"
          />
          <div
            ref={(el) => (additionsRef.current[3] = el)}
            className="absolute w-1.5 h-1.5 rounded-full bg-zinc-400 top-2 left-2 opacity-0"
          />

          {/* Core Central System Processing Light */}
          <div
            ref={centerDotRef}
            className="absolute w-2 h-2 rounded-full bg-emerald-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-0 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
          />
        </div>
      </button>
    </div>
  );
}
