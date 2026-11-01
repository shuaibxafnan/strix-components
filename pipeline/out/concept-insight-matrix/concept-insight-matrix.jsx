"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
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
  items = DEFAULT_ITEMS,
  conceptLabel = "Concept",
  insightLabel = "Insight",
  restartLabel = "Restart Grid Animation Sequence",
  backgroundColor = "#000000",
  initialColor = "#4f4f4f",
  activeColor = "#ffffff",
  insightColor = "#a1a1aa",
  headerColor = "#71717a",
  dotColor = "#ffffff",
  hoverDotColor = "#a1a1aa",
  accentColor = "#34d399",
  staggerSpeed = 0.075,
  displayDuration = 1.5,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const additionsRef = useRef([]);
  const centerDotRef = useRef(null);
  const gsapRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    let tl = null;
    let triggerBtn = null;

    const load = async () => {
      const { default: gsap } = await import("gsap");
      if (cancelled || !containerRef.current) return;
      gsapRef.current = gsap;

      const header = containerRef.current.querySelector(".matrix-header");
      const rows = containerRef.current.querySelectorAll(".matrix-item");
      triggerBtn = buttonRef.current;

      const runSequence = () => {
        if (tl) tl.kill();
        tl = gsap.timeline();

        gsap.set([header, rows, triggerBtn], { opacity: 0 });
        gsap.set(rows, { color: initialColor });

        tl.to(header, { opacity: 1, duration: 0.25, ease: "power3.out" })
          .to(
            rows,
            {
              opacity: 1,
              duration: 0.3,
              stagger: staggerSpeed,
              ease: "power2.out",
            },
            "-=0.1",
          )
          .to(
            rows,
            {
              color: activeColor,
              duration: 0.3,
              stagger: staggerSpeed,
              ease: "power1.inOut",
            },
            "-=0.4",
          )
          .to(rows, {
            opacity: 0,
            duration: 0.4,
            stagger: staggerSpeed,
            delay: displayDuration,
            ease: "power3.in",
          })
          .to(
            header,
            { opacity: 0, duration: 0.3, ease: "power2.in" },
            "-=0.2",
          )
          .to(triggerBtn, {
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
          });
      };

      runSequence();

      triggerBtn.onclick = () => {
        gsap.to(triggerBtn, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: runSequence,
        });
      };
    };

    load();

    return () => {
      cancelled = true;
      if (tl) tl.kill();
      if (triggerBtn) triggerBtn.onclick = null;
      const gsap = gsapRef.current;
      if (gsap) {
        gsap.killTweensOf(triggerBtn);
        gsap.killTweensOf(additionsRef.current);
        gsap.killTweensOf(centerDotRef.current);
      }
    };
  }, [mounted, items, initialColor, activeColor, staggerSpeed, displayDuration]);

  const handleMouseEnter = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;

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
    const gsap = gsapRef.current;
    if (!gsap) return;

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

  const corners = [
    "top-2 right-2",
    "bottom-2 right-2",
    "bottom-2 left-2",
    "top-2 left-2",
  ];

  return (
    <div
      className={`w-full h-screen flex items-center justify-center p-8 select-none ${className}`}
      style={{ backgroundColor }}
    >
      <div ref={containerRef} className="w-full max-w-[800px] flex flex-col">
        <div className="matrix-header flex gap-8 py-2 border-b border-zinc-900 mb-2 opacity-0">
          <div
            className="flex-1 uppercase font-mono text-[10px] tracking-[0.2em]"
            style={{ color: headerColor }}
          >
            {conceptLabel}
          </div>
          <div
            className="flex-1 uppercase font-mono text-[10px] tracking-[0.2em]"
            style={{ color: headerColor }}
          >
            {insightLabel}
          </div>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className="matrix-item flex gap-8 py-2 border-b border-zinc-950/40 text-xs tracking-wide opacity-0"
            style={{ color: initialColor }}
          >
            <div className="flex-1 font-mono uppercase text-[11px] font-semibold tracking-wider">
              {item.concept}
            </div>
            <div
              className="flex-1 font-serif italic font-light text-[13px]"
              style={{ color: insightColor }}
            >
              {item.insight}
            </div>
          </div>
        ))}
      </div>

      <button
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed bottom-8 right-8 w-12 h-12 border-0 bg-transparent cursor-pointer p-0 opacity-0 z-50 focus:outline-none group"
        aria-label={restartLabel}
      >
        <div className="relative w-full h-full">
          <div
            className="absolute w-1.5 h-1.5 rounded-full top-0 left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: dotColor }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full top-1/2 right-0 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: dotColor }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full bottom-0 left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: dotColor }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full top-1/2 left-0 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: dotColor }}
          />

          {corners.map((pos, i) => (
            <div
              key={pos}
              ref={(el) => (additionsRef.current[i] = el)}
              className={`absolute w-1.5 h-1.5 rounded-full opacity-0 ${pos}`}
              style={{ backgroundColor: hoverDotColor }}
            />
          ))}

          <div
            ref={centerDotRef}
            className="absolute w-2 h-2 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-0"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}99`,
            }}
          />
        </div>
      </button>
    </div>
  );
}
