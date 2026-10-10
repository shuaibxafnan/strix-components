"use client";

import { useEffect, useRef } from "react";

// ─── StaggeredParticlesEffect ─────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// rows              number   13        Grid size (rows × rows particles)
// particleSize      string   "4em"     Width/height of each particle
// particleMargin    string   "3em"     Margin around each particle
// particleRadius    string   "2em"     Border-radius of each particle
// baseFontSize      string   ".2vh"    Font-size on creature el (scales em units)
// hue               number   4         HSL hue of the creature color
// saturation        number   70        HSL saturation %
// frameRate         number   15        Main loop frame rate
// staggerDelay      number   40        Stagger delay between particles (ms)
// pulseInterval     number   1650      Time before pulse fires (ms)
// bgColor           string   "#0a0000" Page background color
// ──────────────────────────────────────────────────────────────────────────────
//
// Install dep:  npm install animejs
// ──────────────────────────────────────────────────────────────────────────────

export default function StaggeredParticlesEffect({
  rows = 13,
  particleSize = "4em",
  particleMargin = "3em",
  particleRadius = "2em",
  baseFontSize = ".2vh",
  hue = 4,
  saturation = 70,
  frameRate = 15,
  staggerDelay = 40,
  pulseInterval = 1650,
  bgColor = "#0a0000",
}) {
  const creatureRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // animejs v4 is ESM-only — dynamic import keeps it out of the SSR bundle
    import("animejs").then(
      ({ animate, createTimeline, createTimer, stagger, utils }) => {
        if (cancelled || !creatureRef.current) return;

        const creatureEl = creatureRef.current;
        creatureEl.innerHTML = ""; // guard against React StrictMode double-invoke

        const viewport = {
          w: window.innerWidth * 0.5,
          h: window.innerHeight * 0.5,
        };
        const cursor = { x: 0, y: 0 };
        const grid = [rows, rows];
        const from = "center";

        const scaleStagger = stagger([2, 5], { ease: "inQuad", grid, from });
        const opacityStagger = stagger([1, 0.1], { grid, from });

        for (let i = 0; i < rows * rows; i++) {
          creatureEl.appendChild(document.createElement("div"));
        }

        const particleEls = creatureEl.querySelectorAll("div");

        utils.set(creatureEl, {
          width: rows * 10 + "em",
          height: rows * 10 + "em",
        });

        utils.set(particleEls, {
          x: 0,
          y: 0,
          scale: scaleStagger,
          opacity: opacityStagger,
          background: stagger([80, 20], {
            grid,
            from,
            modifier: (v) => `hsl(${hue}, ${saturation}%, ${v}%)`,
          }),
          boxShadow: stagger([8, 1], {
            grid,
            from,
            modifier: (v) =>
              `0px 0px ${utils.round(v, 0)}em 0px hsl(${hue}, ${saturation}%, 55%)`,
          }),
          zIndex: stagger([rows * rows, 1], {
            grid,
            from,
            modifier: utils.round(0),
          }),
        });

        const pulse = () => {
          animate(particleEls, {
            keyframes: [
              {
                scale: 5,
                opacity: 1,
                delay: stagger(90, { start: pulseInterval, grid, from }),
                duration: 150,
              },
              {
                scale: scaleStagger,
                opacity: opacityStagger,
                ease: "inOutQuad",
                duration: 600,
              },
            ],
          });
        };

        const mainLoop = createTimer({
          frameRate,
          onUpdate: () => {
            animate(particleEls, {
              x: cursor.x,
              y: cursor.y,
              delay: stagger(staggerDelay, { grid, from }),
              duration: stagger(120, {
                start: 750,
                ease: "inQuad",
                grid,
                from,
              }),
              ease: "inOut",
              composition: "blend",
            });
          },
        });

        const autoMove = createTimeline()
          .add(
            cursor,
            {
              x: [-viewport.w * 0.45, viewport.w * 0.45],
              modifier: (x) =>
                x + Math.sin(mainLoop.currentTime * 0.0007) * viewport.w * 0.5,
              duration: 3000,
              ease: "inOutExpo",
              alternate: true,
              loop: true,
              onBegin: pulse,
              onLoop: pulse,
            },
            0,
          )
          .add(
            cursor,
            {
              y: [-viewport.h * 0.45, viewport.h * 0.45],
              modifier: (y) =>
                y + Math.cos(mainLoop.currentTime * 0.00012) * viewport.h * 0.5,
              duration: 1000,
              ease: "inOutQuad",
              alternate: true,
              loop: true,
            },
            0,
          );

        const manualMovementTimeout = createTimer({
          duration: 1500,
          onComplete: () => autoMove.play(),
        });

        const followPointer = (e) => {
          const event = e.type === "touchmove" ? e.touches[0] : e;
          cursor.x = event.pageX - viewport.w;
          cursor.y = event.pageY - viewport.h;
          autoMove.pause();
          manualMovementTimeout.restart();
        };

        document.addEventListener("mousemove", followPointer);
        document.addEventListener("touchmove", followPointer);

        cleanupRef.current = () => {
          document.removeEventListener("mousemove", followPointer);
          document.removeEventListener("touchmove", followPointer);
          mainLoop.pause?.();
          autoMove.pause?.();
        };
      },
    );

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  }, [rows, hue, saturation, frameRate, staggerDelay, pulseInterval]);

  return (
    <>
      {/* Particle style — targets JS-injected divs, can't use Tailwind */}
      <style>{`
        #creature-inner > div {
          transform-style: preserve-3d;
          will-change: transform;
          mix-blend-mode: plus-lighter;
          width: ${particleSize};
          height: ${particleSize};
          margin: ${particleMargin};
          border-radius: ${particleRadius};
        }
      `}</style>

      <div
        className="absolute inset-0 overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <div
          id="creature-inner"
          ref={creatureRef}
          className="flex flex-wrap justify-center items-center"
          style={{ fontSize: baseFontSize }}
        />
      </div>
    </>
  );
}
