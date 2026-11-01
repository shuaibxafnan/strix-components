"use client";

import { useEffect, useRef } from "react";

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export default function GalaxyButton({
  label = "Explore",
  hue = 245,
  sparkDuration = 1.8,
  fontSize = "2rem",
  paddingX = "1.3em",
  paddingY = "0.9em",
  borderRadius = "2rem",
  transitionDuration = 0.25,
  staticStarCount = 4,
  orbitStarCount = 20,
  glowIntensity = "6em",
  darkBg = true,
  className = "",
  onClick,
}) {
  const wrapperRef = useRef(null);
  const starsInitialized = useRef(false);

  useEffect(() => {
    if (starsInitialized.current || !wrapperRef.current) return;
    starsInitialized.current = true;

    const particles = wrapperRef.current.querySelectorAll(".star");
    particles.forEach((p) => {
      p.style.setProperty("--angle", rand(0, 360));
      p.style.setProperty("--duration", rand(6, 20));
      p.style.setProperty("--delay", rand(1, 10));
      p.style.setProperty("--alpha", rand(40, 90) / 100);
      p.style.setProperty("--size", rand(2, 6));
      p.style.setProperty("--distance", rand(40, 200));
    });
  }, []);

  const cssVars = {
    "--hue": hue,
    "--spark": `${sparkDuration}s`,
    "--transition": `${transitionDuration}s`,
    "--font-size": fontSize,
    "--padding-x": paddingX,
    "--padding-y": paddingY,
    "--border-radius": borderRadius,
    "--glow-intensity": glowIntensity,
  };

  return (
    <>
      <style>{`
        .galaxy-btn-wrap {
          position: relative;
        }

        .galaxy-btn {
          --cut: 0.1em;
          --active: 0;
          --bg:
            radial-gradient(
              120% 120% at 126% 126%,
              hsl(var(--hue) calc(var(--active) * 97%) 98% / calc(var(--active) * 0.9)) 40%,
              transparent 50%
            ) calc(100px - (var(--active) * 100px)) 0 / 100% 100% no-repeat,
            radial-gradient(
              120% 120% at 120% 120%,
              hsl(var(--hue) calc(var(--active) * 97%) 70% / calc(var(--active) * 1)) 30%,
              transparent 70%
            ) calc(100px - (var(--active) * 100px)) 0 / 100% 100% no-repeat,
            hsl(var(--hue) calc(var(--active) * 100%) calc(12% - (var(--active) * 8%)));

          background: var(--bg);
          font-size: var(--font-size);
          font-weight: 500;
          border: 0;
          cursor: pointer;
          padding: var(--padding-y) var(--padding-x);
          display: flex;
          align-items: center;
          gap: 0.25em;
          white-space: nowrap;
          border-radius: var(--border-radius);
          position: relative;
          box-shadow:
            0 0 calc(var(--active) * var(--glow-intensity)) calc(var(--active) * calc(var(--glow-intensity) * 0.5)) hsl(var(--hue) 97% 61% / 0.5),
            0 0.05em 0 0 hsl(var(--hue) calc(var(--active) * 97%) calc((var(--active) * 50%) + 30%)) inset,
            0 -0.05em 0 0 hsl(var(--hue) calc(var(--active) * 97%) calc(var(--active) * 10%)) inset;
          transition:
            box-shadow var(--transition),
            scale var(--transition),
            background var(--transition);
          scale: calc(1 + (var(--active) * 0.1));
          transform-style: preserve-3d;
          perspective: 100vmin;
          overflow: hidden;
          font-family: system-ui, sans-serif;
        }

        .galaxy-btn:active {
          scale: 1;
        }

        .galaxy-btn:is(:hover, :focus-visible) {
          --active: 1;
          --play-state: running;
        }
        .galaxy-btn .spark {
          position: absolute;
          inset: 0;
          border-radius: var(--border-radius);
          rotate: 0deg;
          overflow: hidden;
          mask: linear-gradient(white, transparent 50%);
          animation: galaxy-flip calc(var(--spark) * 2) infinite steps(2, end);
        }

        @keyframes galaxy-flip {
          to { rotate: 360deg; }
        }

        .galaxy-btn .spark::before {
          content: "";
          position: absolute;
          width: 200%;
          aspect-ratio: 1;
          top: 0%;
          left: 50%;
          z-index: -1;
          translate: -50% -15%;
          rotate: 0;
          transform: rotate(-90deg);
          opacity: calc((var(--active)) + 0.4);
          background: conic-gradient(from 0deg, transparent 0 340deg, white 360deg);
          transition: opacity var(--transition);
          animation: galaxy-rotate var(--spark) linear infinite both;
        }

        @keyframes galaxy-rotate {
          to { transform: rotate(90deg); }
        }

        .galaxy-btn .spark::after {
          content: "";
          position: absolute;
          inset: var(--cut);
          border-radius: var(--border-radius);
        }
        .galaxy-btn .backdrop {
          position: absolute;
          inset: var(--cut);
          background: var(--bg);
          border-radius: var(--border-radius);
          transition: background var(--transition);
        }
        .galaxy-btn .galaxy {
          position: absolute;
          width: 100%;
          aspect-ratio: 1;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
          overflow: hidden;
          opacity: var(--active);
          transition: opacity var(--transition);
        }

        .galaxy-btn .galaxy__ring {
          height: 200%;
          width: 200%;
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          transform: translate(-28%, -40%) rotateX(-24deg) rotateY(-30deg) rotateX(90deg);
          transform-style: preserve-3d;
        }
        .galaxy-btn .galaxy__container {
          position: absolute;
          inset: 0;
          opacity: var(--active);
          transition: opacity var(--transition);
          mask: radial-gradient(white, transparent);
        }
        .galaxy-btn .star {
          height: calc(var(--size) * 1px);
          aspect-ratio: 1;
          background: white;
          border-radius: 50%;
          position: absolute;
          opacity: var(--alpha);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(10deg) rotate(0deg) translateY(calc(var(--distance) * 1px));
          animation: galaxy-orbit calc(var(--duration) * 1s) calc(var(--delay) * -1s) infinite linear;
        }

        @keyframes galaxy-orbit {
          to {
            transform: translate(-50%, -50%) rotate(10deg) rotate(360deg) translateY(calc(var(--distance) * 1px));
          }
        }

        .galaxy-btn .star--static {
          animation:
            galaxy-move-x calc(var(--duration) * 0.1s) calc(var(--delay) * -0.1s) infinite linear,
            galaxy-move-y calc(var(--duration) * 0.2s) calc(var(--delay) * -0.2s) infinite linear;
          max-height: 4px;
          filter: brightness(4);
          opacity: 0.9;
          transform: translate(0, 0);
        }

        .galaxy-btn:hover .star--static {
          animation-play-state: paused;
        }

        @keyframes galaxy-move-x {
          0%   { translate: -100px 0; }
          100% { translate: 100px 0; }
        }

        @keyframes galaxy-move-y {
          0%   { transform: translate(0, -50px); }
          100% { transform: translate(0, 50px); }
        }
        .galaxy-btn .btn-text {
          translate: 2% -6%;
          letter-spacing: 0.01ch;
          color: hsl(0 0% calc(60% + (var(--active) * 26%)));
          position: relative;
          z-index: 1;
        }
        .galaxy-bodydrop {
          background: hsl(260 calc(var(--active, 0) * 97%) 6%);
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          transition: background var(--transition);
        }

        @supports (selector(:has(+ *))) {
          .galaxy-btn-wrap:has(.galaxy-btn:is(:hover, :focus-visible)) .galaxy-bodydrop {
            --active: 1;
          }
        }
      `}</style>

      <div
        ref={wrapperRef}
        className={`galaxy-btn-wrap w-full h-screen flex items-center justify-center ${className}`}
        style={cssVars}
      >
        <button className="galaxy-btn" onClick={onClick} type="button">
          <span className="spark" />
          <span className="backdrop" />
          <span className="galaxy__container">
            {Array.from({ length: staticStarCount }).map((_, i) => (
              <span key={i} className="star star--static" />
            ))}
          </span>
          <span className="galaxy">
            <span className="galaxy__ring">
              {Array.from({ length: orbitStarCount }).map((_, i) => (
                <span key={i} className="star" />
              ))}
            </span>
          </span>
          <span className="btn-text">{label}</span>
        </button>
        {darkBg && <div className="galaxy-bodydrop" />}
      </div>
    </>
  );
}
