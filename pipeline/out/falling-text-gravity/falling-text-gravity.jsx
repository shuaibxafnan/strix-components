"use client";

import { useEffect, useRef } from "react";

const IMG = "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/";

const DEFAULT_LINES = [
  [
    "This is just a",
    {
      src: `${IMG}duo-brown.png`,
      alt: "Squiggle 1",
      className: "-rotate-20 translate-x-[0.15em] -translate-y-[0.2em]",
    },
    "random quote",
    {
      src: `${IMG}solid-dblue.png`,
      alt: "Squiggle 2",
      className: "translate-x-[-0.1em] translate-y-[0.2em] rotate-10",
    },
    "we used",
  ],
  [
    "See how our window acts like",
    {
      src: `${IMG}duo-blue.png`,
      alt: "Squiggle 3",
      className: "-mt-[0.2em] translate-x-[-0.05em] translate-y-[0.1em] rotate-50",
    },
    " a roof?",
  ],
  ["So much fun!"],
];

export default function FallingTextGravity({
  lines = DEFAULT_LINES,
  bgColor = "#1A1A1A",
  textColor = "#efeeec",
  minHeight = "350vh",
  sectionHeight = "min-h-screen",
  maxTextWidth = "max-w-[40rem]",
  minVelocity = 500,
  maxVelocity = 1000,
  gravity = 3000,
  minDuration = 1.5,
  maxDuration = 3.0,
  minRotation = -90,
  maxRotation = 90,
  className = "",
}) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    let ctx;
    let split;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }, { Physics2DPlugin }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/SplitText"),
          import("gsap/Physics2DPlugin"),
        ]);
      if (cancelled || !wrapperRef.current) return;

      gsap.registerPlugin(ScrollTrigger, SplitText, Physics2DPlugin);

      split = new SplitText(wrapperRef.current.querySelectorAll("[data-drop-text]"), {
        type: "lines, chars",
        autoSplit: true,
        linesClass: "block",
        onSplit(self) {
          if (ctx) ctx.revert();
          ctx = gsap.context(() => {
            self.lines.forEach((line) => {
              gsap
                .timeline({
                  scrollTrigger: {
                    once: true,
                    trigger: line,
                    start: "top top-=10",
                  },
                })
                .to(line.children, {
                  duration: `random(${minDuration}, ${maxDuration})`,
                  physics2D: {
                    velocity: `random(${minVelocity}, ${maxVelocity})`,
                    angle: 90,
                    gravity: gravity,
                  },
                  rotation: `random(${minRotation}, ${maxRotation})`,
                  ease: "none",
                })
                .to(
                  line.children,
                  {
                    autoAlpha: 0,
                    duration: 0.2,
                  },
                  "-=.2",
                );
            });
          }, wrapperRef.current);
        },
      });
    })();

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
      if (split) split.revert();
    };
  }, [
    minDuration,
    maxDuration,
    minVelocity,
    maxVelocity,
    gravity,
    minRotation,
    maxRotation,
    lines,
  ]);

  return (
    <div
      className={`w-full justify-center items-center flex overflow-clip select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div ref={wrapperRef} className="w-full" style={{ minHeight }}>
        {lines.map((segments, i) => (
          <div
            key={i}
            className={`w-full ${sectionHeight} justify-center items-center flex relative px-4`}
          >
            <h1
              data-drop-text=""
              className={`${maxTextWidth} text-center mt-0 mb-0 text-[2.5rem] sm:text-[3rem] md:text-[4rem] font-medium leading-[1]`}
              style={{ color: textColor }}
            >
              {segments.map((seg, j) =>
                typeof seg === "string" ? (
                  seg
                ) : (
                  <span
                    key={j}
                    className={`z-[2] w-[1.5em] inline-block relative ${seg.className || ""}`}
                  >
                    <img
                      loading="lazy"
                      src={seg.src}
                      alt={seg.alt || ""}
                      className="w-full max-w-full object-cover"
                    />
                  </span>
                ),
              )}
            </h1>
          </div>
        ))}
      </div>
    </div>
  );
}
