"use client";

import { useEffect, useRef } from "react";

export default function FallingTextGravity({
  bgColor = "#1A1A1A",
  textColor = "text-[#efeeec]",
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
}) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    let ctx;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    // Ensure dependent scripts load in structural ordering sequentially
    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"),
    ])
      .then(() => {
        return Promise.all([
          loadScript(
            "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js",
          ),
          loadScript(
            "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js",
          ),
          loadScript(
            "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Physics2DPlugin.min.js",
          ),
        ]);
      })
      .then(() => {
        const { gsap, ScrollTrigger, SplitText, Physics2DPlugin } = window;
        if (
          !gsap ||
          !ScrollTrigger ||
          !SplitText ||
          !Physics2DPlugin ||
          !wrapperRef.current
        )
          return;

        gsap.registerPlugin(ScrollTrigger, SplitText, Physics2DPlugin);

        // Target matching [data-drop-text] containers within this component tree reference
        new SplitText(wrapperRef.current.querySelectorAll("[data-drop-text]"), {
          type: "lines, chars",
          autoSplit: true,
          linesClass: "block", // Mirror original .line { display: block } behavior via standard utilities
          onSplit(self) {
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
      })
      .catch((err) =>
        console.error(
          "[FallingTextGravity] Script dependency injection failed:",
          err,
        ),
      );

    return () => {
      if (ctx) ctx.revert();
    };
  }, [
    minDuration,
    maxDuration,
    minVelocity,
    maxVelocity,
    gravity,
    minRotation,
    maxRotation,
  ]);

  return (
    <div
      className="w-full justify-center items-center flex overflow-clip select-none"
      style={{ backgroundColor: bgColor }}
    >
      <div ref={wrapperRef} className="w-full" style={{ minHeight: minHeight }}>
        {/* Section 1 */}
        <div
          className={`w-full ${sectionHeight} justify-center items-center flex relative`}
        >
          <h1
            data-drop-text=""
            className={`${textColor} ${maxTextWidth} text-center mt-0 mb-0 text-[4rem] font-medium leading-[1]`}
          >
            This is just a
            <span className="z-[2] w-[1.5em] inline-block relative -rotate-20 translate-x-[0.15em] -translate-y-[0.2em]">
              <img
                loading="lazy"
                src="https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/duo-brown.png"
                alt="Squiggle 1"
                className="w-full max-w-full object-cover"
              />
            </span>
            random quote
            <span className="z-[2] w-[1.5em] inline-block relative translate-x-[-0.1em] translate-y-[0.2em] rotate-10">
              <img
                loading="lazy"
                src="https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/solid-dblue.png"
                alt="Squiggle 2"
                className="w-full max-w-full"
              />
            </span>
            we used
          </h1>
        </div>

        {/* Section 2 */}
        <div
          className={`w-full ${sectionHeight} justify-center items-center flex relative`}
        >
          <h1
            data-drop-text=""
            className={`${textColor} ${maxTextWidth} text-center mt-0 mb-0 text-[4rem] font-medium leading-[1]`}
          >
            See how our window acts like
            <span className="z-[2] w-[1.5em] inline-block relative -mt-[0.2em] translate-x-[-0.05em] translate-y-[0.1em] rotate-50">
              <img
                loading="lazy"
                src="https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/duo-blue.png"
                alt="Squiggle 3"
                className="w-full max-w-full"
              />
            </span>{" "}
            a roof?
          </h1>
        </div>

        {/* Section 3 */}
        <div
          className={`w-full ${sectionHeight} justify-center items-center flex relative`}
        >
          <h1
            data-drop-text=""
            className={`${textColor} ${maxTextWidth} text-center mt-0 mb-0 text-[4rem] font-medium leading-[1]`}
          >
            So much fun!
          </h1>
        </div>
      </div>
    </div>
  );
}
