"use client";

import { useEffect, useRef } from "react";

// ─── ParticleFlairBurst ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   rgb(14,16,15)   Page background behind the canvas
// particleCount    number   99              Number of image particles drawn on the canvas
// imageUrlPattern  function (i)=>url        Returns the image src for particle index i (default cycles 21 flair PNGs)
// duration         number   5               Timeline duration (s) for one converge/diverge cycle
// ease             string   "sine"          GSAP ease for the timeline
// staggerEach       number   -0.05          Per-particle stagger offset (s); negative staggers back-to-front
// staggerRepeat    number   -1              Stagger repeat count (-1 = infinite)
// startScale       number   1.1             Particle scale at the scattered (start) state
// endScale         number   0               Particle scale at the converged (end) state
// startRotate      number   0               Canvas rotation (rad) at the scattered (start) state
// endRotate        number   -3              Canvas rotation (rad) at the converged (end) state
// radiusMultiplier number   1               Multiplier applied to the scatter radius (max of width/height)
// pauseOnClick     boolean  true            Whether a pointerup on the canvas toggles play/pause via timeScale
// ──────────────────────────────────────────────────────────────────────────

const defaultImageUrlPattern = (i) =>
  `https://assets.codepen.io/16327/flair-${2 + (i % 21)}.png`;

export default function ParticleFlairBurst({
  bgColor = "rgb(14,16,15)",
  particleCount = 99,
  imageUrlPattern = defaultImageUrlPattern,
  duration = 5,
  ease = "sine",
  staggerEach = -0.05,
  staggerRepeat = -1,
  startScale = 1.1,
  endScale = 0,
  startRotate = 0,
  endRotate = -3,
  radiusMultiplier = 1,
  pauseOnClick = true,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
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

    let handleResize;
    let handlePointerUp;
    let tl;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        const canvas = canvasRef.current;
        if (!gsap || !canvas) return;

        gsap.config({ trialWarn: false });

        const ctx = canvas.getContext("2d");
        let cw = (canvas.width = window.innerWidth);
        let ch = (canvas.height = window.innerHeight);
        let radius = Math.max(cw, ch) * radiusMultiplier;

        const particles = Array.from({ length: particleCount }, (_, i) => {
          const img = new Image();
          img.src = imageUrlPattern(i);
          return { x: 0, y: 0, scale: 0, rotate: 0, img };
        });

        const draw = () => {
          particles.sort((a, b) => a.scale - b.scale);
          ctx.clearRect(0, 0, cw, ch);
          particles.forEach((p) => {
            ctx.translate(cw / 2, ch / 2);
            ctx.rotate(p.rotate);
            ctx.drawImage(
              p.img,
              p.x,
              p.y,
              p.img.width * p.scale,
              p.img.height * p.scale,
            );
            ctx.resetTransform();
          });
        };

        tl = gsap
          .timeline({ onUpdate: draw })
          .fromTo(
            particles,
            {
              x: (i) => {
                const angle =
                  (i / particles.length) * Math.PI * 2 - Math.PI / 2;
                return Math.cos(angle * 10) * radius;
              },
              y: (i) => {
                const angle =
                  (i / particles.length) * Math.PI * 2 - Math.PI / 2;
                return Math.sin(angle * 10) * radius;
              },
              scale: startScale,
              rotate: startRotate,
            },
            {
              duration,
              ease,
              x: 0,
              y: 0,
              scale: endScale,
              rotate: endRotate,
              stagger: { each: staggerEach, repeat: staggerRepeat },
            },
            0,
          )
          .seek(particleCount);

        handleResize = () => {
          cw = canvas.width = window.innerWidth;
          ch = canvas.height = window.innerHeight;
          radius = Math.max(cw, ch) * radiusMultiplier;
          tl.invalidate();
        };
        window.addEventListener("resize", handleResize);

        if (pauseOnClick) {
          handlePointerUp = () => {
            gsap.to(tl, { timeScale: tl.isActive() ? 0 : 1 });
          };
          canvas.addEventListener("pointerup", handlePointerUp);
        }
      })
      .catch((e) =>
        console.error("[ParticleFlairBurst] GSAP load failed:", e.message),
      );

    return () => {
      if (handleResize) window.removeEventListener("resize", handleResize);
      if (handlePointerUp && canvasRef.current) {
        canvasRef.current.removeEventListener("pointerup", handlePointerUp);
      }
      if (tl) tl.kill();
    };
  }, [
    particleCount,
    imageUrlPattern,
    duration,
    ease,
    staggerEach,
    staggerRepeat,
    startScale,
    endScale,
    startRotate,
    endRotate,
    radiusMultiplier,
    pauseOnClick,
  ]);

  return (
    <main
      className="flex items-center justify-center w-full h-screen"
      style={{ backgroundColor: bgColor }}
    >
      <canvas ref={canvasRef} />
    </main>
  );
}
