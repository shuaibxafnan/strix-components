"use client";

import { useEffect, useRef } from "react";

export default function HeartFill({
  dimX = 80,
  dimY = 70,
  curveHeight = 20,
  bgGradFrom = "#c9d8f5",
  bgGradTo = "#afc4ee",
  tankColor = "rgb(103, 130, 191)",
  shadowColor = "rgba(174, 196, 238, 0.5)",
  waveOpacity1 = 0.5,
  waveOpacity2 = 0.3,
  waveOpacity3 = 1,
  pumpLevels = [15, 20, 25, 0],
  tankLevels = [25, 45, 70, -20],
  className = "",
}) {
  const heartRef = useRef(null);
  const tankRef = useRef(null);
  const curveRef = useRef(null);
  const counterRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const clipId = useRef(`heart-clip-${Math.random().toString(36).slice(2, 8)}`);
  const waveId = useRef(
    `gentle-wave-${Math.random().toString(36).slice(2, 8)}`,
  );

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    import("gsap").then(({ gsap }) => {
      if (cancelled) return;

      const heart = heartRef.current;
      const tank = tankRef.current;
      const curve = curveRef.current;
      if (!heart || !tank || !curve) return;

      const pumpHeart = () => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        const c = counterRef.current;

        gsap.to(heart, { translateZ: pumpLevels[c], duration: 0.5 });
        gsap.to(curve, {
          bottom: tankLevels[c],
          transformOrigin: "bottom",
          scaleY: 1,
          duration: 0.5,
        });
        gsap.to(tank, {
          height: c === 3 ? 0 : tankLevels[c],
          duration: 0.5,
        });

        gsap.to(curve, {
          delay: 0.6,
          bottom: tankLevels[c],
          transformOrigin: "bottom",
          scaleY: 0.5,
          duration: 0.5,
        });
        gsap.to(heart, {
          delay: 0.6,
          translateZ: 0,
          duration: 0.25,
          onComplete: () => {
            isAnimatingRef.current = false;
          },
        });

        counterRef.current = c + 1 > 3 ? 0 : c + 1;
      };

      heart.addEventListener("click", pumpHeart);
      cleanup = () => {
        heart.removeEventListener("click", pumpHeart);
        gsap.killTweensOf([heart, tank, curve]);
        isAnimatingRef.current = false;
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [pumpLevels, tankLevels]);

  const waveFill = (opacity) => {
    const match = tankColor.match(/\d+/g);
    if (!match || match.length < 3) return tankColor;
    return `rgba(${match[0]},${match[1]},${match[2]},${opacity})`;
  };

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${className}`}>
      <style>{`
        @keyframes hf-move {
          0%   { transform: translateX(-90px); }
          100% { transform: translateX(85px); }
        }
        .hf-curve use {
          animation: hf-move 2s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .hf-curve use:nth-child(1) { animation-duration: 3s; }
        .hf-curve use:nth-child(2) { animation-duration: 4s; }
        .hf-curve use:nth-child(3) { animation-duration: 2s; }
      `}</style>

      <svg
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId.current} clipPathUnits="objectBoundingBox">
            <path
              d="M0.373,0.967 S0.616,0.866,0.768,0.644 S0.912,0.107,0.739,0 S0.373,0.108,0.373,0.108 S0.166,-0.113,0,-0.002 S-0.159,0.432,-0.021,0.644 S0.373,0.967,0.373,0.967"
              style={{ transform: "translate(0.125px, 0.033px)" }}
            />
          </clipPath>
          <path
            id={waveId.current}
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
      </svg>

      <div
          style={{
            cursor: "pointer",
            perspective: "200px",
            filter: `drop-shadow(0px 10px 10px ${shadowColor})`,
          }}
        >
      <div
            ref={heartRef}
            style={{
              position: "relative",
              height: dimY,
              width: dimX,
              overflow: "hidden",
              clipPath: `url(#${clipId.current})`,
              backgroundImage: `radial-gradient(${bgGradFrom} 60%, ${bgGradTo})`,
            }}
          >
      <div
              ref={tankRef}
              style={{
                position: "absolute",
                bottom: 0,
                height: 0,
                width: dimX,
                backgroundColor: tankColor,
                zIndex: 5,
              }}
            />

                <svg
              ref={curveRef}
              className="hf-curve"
              viewBox="0 24 150 28"
              preserveAspectRatio="none"
              shapeRendering="auto"
              style={{
                position: "absolute",
                bottom: -curveHeight,
                width: dimX,
                height: curveHeight,
              }}
            >
              <g>
                <use
                  href={`#${waveId.current}`}
                  x="48"
                  y="0"
                  fill={waveFill(waveOpacity1)}
                />
                <use
                  href={`#${waveId.current}`}
                  x="48"
                  y="1"
                  fill={waveFill(waveOpacity2)}
                />
                <use
                  href={`#${waveId.current}`}
                  x="48"
                  y="2"
                  fill={waveFill(waveOpacity3)}
                />
              </g>
            </svg>
          </div>
        </div>
    </div>
  );
}
