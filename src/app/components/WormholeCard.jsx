"use client";

import { useEffect, useRef, useState } from "react";

// ─── WormholeCard ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   #1e1e1e        Background of the viewport wrapper
// strokeColor      string   #ffffff        SVG vortex path stroke color line properties
// accentColor      string   #c13f1f        Deep core mist ambient spotlight box shadow glow color
// orbColor         string   #fe1e20        Floating structural orb particle filling color
// borderAccent     string   #9b6b51aa      Primary card glass structural housing border outline
// animationSpeed   string   24s            Orb path vector timing loop speed parameters
// tagText          string   05. Mistake    Heading label tracking value configuration
// titleText        string   "Don't Be a..." Primary bolded content display label text
// descriptionText  string   "Perfectionalism..." Core card message textual paragraph copy
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ORBS = [
  {
    src: "https://assets.codepen.io/3421562/codepen-logo-duotone.svg",
    offset: "0s",
    startX: "-0.6",
    startY: "0",
  },
  {
    src: "https://assets.codepen.io/3421562/slack-logo-duotone.svg",
    offset: "4s",
    startX: "0.6",
    startY: "0",
  },
  {
    src: "https://assets.codepen.io/3421562/android-logo-duotone.svg",
    offset: "8s",
    startX: "-0.3",
    startY: "-0.3",
  },
  {
    src: "https://assets.codepen.io/3421562/dribbble-logo-duotone.svg",
    offset: "12s",
    startX: "0.3",
    startY: "-0.3",
  },
  {
    src: "https://assets.codepen.io/3421562/github-logo-duotone.svg",
    offset: "16s",
    startX: "-0.6",
    startY: "-0.15",
  },
  {
    src: "https://assets.codepen.io/3421562/paypal-logo-duotone.svg",
    offset: "20s",
    startX: "0.6",
    startY: "-0.15",
  },
];

export default function WormholeCard({
  bgColor = "#1e1e1e",
  strokeColor = "#ffffff",
  accentColor = "#c13f1f",
  orbColor = "#fe1e20",
  borderAccent = "#9b6b51aa",
  animationSpeed = "24s",
  tagText = "05. Mistake",
  titleText = (
    <>
      Don't Be a <br />
      Perfectionist
    </>
  ),
  descriptionText = (
    <>
      Perfectionalism is the enemy of{" "}
      <span className="text-white/80">productivity and efficiency</span>. Your
      design will never be perfect, and that's perfectly fine.
    </>
  ),
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const isEasingRef = useRef(false);

  // Eliminate structural hydration gaps between initial render and client lifecycle
  useEffect(() => {
    setMounted(true);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Structural easing formula interpolation execution matrix logic
  const easeOutQuad = (t) => t * (2 - t);

  const animateEasing = (startX, startY, endX, endY, duration) => {
    const startTime = performance.now();
    isEasingRef.current = true;

    const performFrame = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = easeOutQuad(progress);

      const currentX = startX + (endX - startX) * easedProgress;
      const currentY = startY + (endY - startY) * easedProgress;

      setTilt({ x: currentX, y: currentY });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(performFrame);
      } else {
        isEasingRef.current = false;
      }
    };

    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(performFrame);
  };

  const handleMouseMove = (e) => {
    if (isEasingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const intensity = 42;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = (mouseY / rect.height - 0.5) * intensity;
    const rotateY = (mouseX / rect.width - 0.5) * intensity;

    animateEasing(tilt.x, tilt.y, rotateX, rotateY, 100);
  };

  const handleMouseLeave = () => {
    animateEasing(tilt.x, tilt.y, 0, 0, 200);
  };

  if (!mounted) return null;

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center m-0 overflow-hidden antialiased select-none font-['Mona_Sans',sans-serif]"
      style={{ backgroundColor: bgColor }}
    >
      {/* Structural Layer Style Injectors for Keyframe Animations */}
      <style jsx global>{`
        @import url("https://fonts.cdnfonts.com/css/mona-sans");

        @keyframes customOrbX {
          0% {
            translate: var(--startX) var(--startY);
          }
          20% {
            translate: 0px 0px;
          }
          100% {
            translate: 0px 0px;
          }
        }
        @keyframes customOrbY {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
          20% {
            transform: translateY(calc(0.3 * var(--sz))) scale(0.5);
            opacity: 0;
          }
          100% {
            transform: translateY(calc(0.3 * var(--sz))) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes customInnerDot {
          to {
            rotate: 360deg;
          }
        }
        @keyframes customInnerDot2 {
          50% {
            translate: 0 -16px;
          }
          100% {
            translate: 0 0px;
          }
        }

        .animate-inner-dot-1 {
          animation:
            customInnerDot 10s linear infinite,
            customInnerDot2 6s ease-in-out infinite;
        }
        .animate-inner-dot-2 {
          animation:
            customInnerDot 12s linear infinite,
            customInnerDot2 5s ease-in-out infinite;
          animation-delay: -2s;
        }
        .animate-inner-dot-3 {
          animation:
            customInnerDot 8s linear infinite,
            customInnerDot2 4s ease-in-out infinite;
          animation-delay: -6s;
          animation-direction: reverse;
        }
        .animate-inner-dot-4 {
          animation:
            customInnerDot 22s linear infinite,
            customInnerDot2 5s ease-in-out infinite;
          animation-delay: -5s;
        }
        .animate-inner-dot-5 {
          animation:
            customInnerDot 8s linear infinite,
            customInnerDot2 3.4s ease-in-out infinite;
          animation-delay: -1s;
          animation-direction: reverse;
        }
        .animate-inner-dot-6 {
          animation:
            customInnerDot 8.6s linear infinite,
            customInnerDot2 3.4s ease-in-out infinite;
          animation-delay: -2s;
        }
        .animate-inner-dot-7 {
          animation:
            customInnerDot 9.2s linear infinite,
            customInnerDot2 3.4s ease-in-out infinite;
          animation-delay: -3s;
          animation-direction: reverse;
        }
      `}</style>

      {/* Main Structural Wrapper Component Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex justify-center items-center overflow-hidden max-w-[calc(100vw-24px)] [transform-style:preserve-3d] perspective-[1200px]"
        style={{
          "--sz": "min(90vh, clamp(360px, 60vw, 500px))",
          "--fz": "calc(0.032 * var(--sz))",
          width: "var(--sz)",
          height: "calc(1.05 * var(--sz))",
        }}
      >
        {/* ─── VORTEX WIREFRAME VECTOR STAGE ─────────────────────────────── */}
        <div className="absolute w-full h-full pointer-events-none">
          <svg
            className="absolute inset-x-0 bottom-[-6%] w-[88%] m-auto opacity-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 501 297.81"
          >
            <ellipse
              cx="251.32"
              cy="130.01"
              rx="248.36"
              ry="125.82"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
                strokeWidth: "2px",
              }}
            />
            <ellipse
              cx="251.73"
              cy="150.5"
              rx="160.66"
              ry="81.39"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
                strokeWidth: "1.6px",
              }}
            />
            <ellipse
              cx="251.43"
              cy="186.57"
              rx="107.6"
              ry="54.51"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m123.45,22.63c52.05,62.7,97.93,131.45,114.34,213.52.41,2.05,1.23,5.33,1.23,5.33,4.92,18.85,7.79,35.66,10.88,54.9"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m248.86,4.6c2.05,97.95,6.15,194.67,9.31,291.95"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m35.75,67.71c6.15,2.05,11.89,5.33,17.62,8.61,21.31,13.11,40.16,24.59,59.84,40.16,33.61,26.23,56.97,49.59,82.38,84.02,2.46,3.28,6.97,10.25,8.61,13.52,18.03,26.23,31.15,52.46,37.22,82.46"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m5.42,127.55c19.35,2.86,38.36,7.77,56.78,14.33,18.57,6.62,36.53,14.92,53.8,24.41,17.83,9.79,34.96,20.69,50.32,34.09,13.95,12.16,26.41,26.36,36.86,41.65,10.26,14.99,18.58,31.3,24.51,48.48.74,2.15,1.45,4.31,2.11,6.49"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m33.29,190.66c47.95-12.7,102.05-4.51,143.85,27.46,27.05,20.49,45.9,47.54,56.53,78.63"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m137.39,241.48c11.89-12.7,29.1-22.54,46.31-19.26,36.07,5.74,50.82,43.44,61.11,73.93"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m458.7,61.16c-46.31,23.36-84.84,58.61-119.26,98.77-10.66,13.11-18.85,25.41-27.05,39.34-17.21,31.15-31.15,63.11-36.91,98.23"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m495.58,115.25c-42.21,8.61-80.74,25.82-117.62,52.05-31.97,22.13-58.2,46.72-75.41,81.15-.82.82-2.05,3.69-2.87,4.51-8.2,14.75-13.52,28.28-18.2,44.71"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m479.19,180.01c-18.21-1.09-36.54-.34-54.6,2.23-18.1,2.57-35.95,6.98-53.15,13.19-17.54,6.34-34.66,14.39-49.94,25.16-12.74,8.98-24.38,19.6-34.01,31.88-9.22,11.75-16.53,25.03-21.02,39.3-.57,1.8-1.09,3.61-1.56,5.44"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m384.93,236.57c-14.34-13.52-34.84-25-55.33-16.8-31.97,13.11-50,45.9-60.17,77.81"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="3.37"
              cy="127.14"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <path
              d="m378.37,21.81c-33.2,38.93-57.79,84.02-77.46,131.56-18.85,45.9-31.15,94.26-36.16,143.74"
              style={{
                fill: "none",
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="36.16"
              cy="67.3"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="33.7"
              cy="191.07"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="136.16"
              cy="242.71"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="384.52"
              cy="236.16"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="479.6"
              cy="180.42"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="497.63"
              cy="114.84"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="459.11"
              cy="60.75"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="377.96"
              cy="22.22"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="249.27"
              cy="3.37"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
            <circle
              cx="123.04"
              cy="22.22"
              r="2.87"
              style={{
                fill: strokeColor,
                stroke: strokeColor,
                strokeMiterlimit: 10,
              }}
            />
          </svg>
        </div>

        {/* ─── CHROMATIC MIST DEPTH SPOTLIGHT ────────────────────────────── */}
        <div
          className="absolute w-[140%] h-[200%] bottom-[-6%] left-[-20%] pointer-events-none"
          style={{
            boxShadow: `inset 0 0 calc(var(--sz) / 6) calc(var(--sz) / 10) ${accentColor}`,
            borderRadius: "calc(var(--sz) / 2)",
          }}
        />

        {/* ─── DYNAMIC CELESTIAL ORB CLUSTER ─────────────────────────────── */}
        <div className="absolute w-full h-full pointer-events-none">
          {DEFAULT_ORBS.map((orb, index) => (
            <div
              key={index}
              className="absolute left-0 right-0 m-auto bottom-[20%] opacity-0 rounded-full"
              style={{
                width: "calc(var(--sz) / 6)",
                height: "calc(var(--sz) / 6)",
                backgroundColor: orbColor,
                boxShadow: `0 -2px 12px -3px ${orbColor}, inset 8px -4px 2px 0 rgba(255,255,255,0.13), inset 0 0 12px 0 rgba(255,255,255,0.8), inset 0 6px 12px -6px rgba(0,0,0,0.5), inset 0 32px 12px -12px rgba(0,0,0,0.18)`,
                "--startX": `calc(${orb.startX} * var(--sz))`,
                "--startY": `calc(${orb.startY} * var(--sz))`,
                animation: `customOrbX ${animationSpeed} cubic-bezier(0.11, 0, 0.5, 0) infinite, customOrbY ${animationSpeed} cubic-bezier(0.64, 0, 0.92, 0) infinite`,
                animationDelay: orb.offset,
              }}
            >
              <img
                src={orb.src}
                alt=""
                className="w-[64%] h-auto absolute inset-0 m-auto"
              />

              {/* Core Nested Particle Projections */}
              <div className="absolute inset-x-0 top-full bottom-0 m-auto w-[2px] h-[1px] bg-white [transform-origin:0_-36px] rotate-0 shadow-[0_0_4px_1px_#fff] animate-inner-dot-1" />
              <div className="absolute inset-x-0 top-full bottom-0 m-auto w-[2px] h-[1px] bg-white [transform-origin:0_-36px] rotate-0 shadow-[0_0_4px_1px_#fff] scale-[0.8] animate-inner-dot-2" />
              <div className="absolute inset-x-0 top-full bottom-0 m-auto w-[2px] h-[1px] bg-white [transform-origin:0_-36px] rotate-0 shadow-[0_0_4px_1px_#fff] scale-[0.7] animate-inner-dot-3" />
              <div className="absolute inset-x-0 top-full bottom-0 m-auto w-[2px] h-[1px] bg-white [transform-origin:0_-36px] rotate-0 shadow-[0_0_4px_1px_#fff] animate-inner-dot-4" />
              <div className="absolute inset-x-0 top-full bottom-0 m-auto w-[2px] h-[1px] bg-white [transform-origin:0_-36px] rotate-0 shadow-[0_0_4px_1px_#fff] scale-[0.76] animate-inner-dot-5" />
              <div className="absolute inset-x-0 top-full bottom-0 m-auto w-[2px] h-[1px] bg-white [transform-origin:0_-36px] rotate-0 shadow-[0_0_4px_1px_#fff] scale-[0.8] animate-inner-dot-6" />
              <div className="absolute inset-x-0 top-full bottom-0 m-auto w-[2px] h-[1px] bg-white [transform-origin:0_-36px] rotate-0 shadow-[0_0_4px_1px_#fff] scale-[0.9] animate-inner-dot-7" />
            </div>
          ))}

          {/* Particle occlusion masking layer */}
          <div
            className="absolute left-0 right-0 w-full h-full"
            style={{
              borderRadius: "calc((1 / 3) * var(--sz))",
              boxShadow:
                "inset 0 calc(0.78 * var(--sz)) calc(0.08 * var(--sz)) calc(-0.18 * var(--sz)) #1e1e1e",
            }}
          />
        </div>

        {/* ─── INTERACTIVE TILT PROFILE GLASS LAYER ──────────────────────── */}
        <div
          className="w-[86%] h-[86%] border rounded-[22px] transition-all duration-[0.4s] ease-out shadow-[0_0_0_10000px_#1e1e1e] px- defaults px-[22px] py-3 relative block before:content-[''] before:block before:absolute before:left-[-12px] before:top-[-12px] before:m-auto before:w-[calc(100%+24px)] before:h-[calc(100%+24px)] before:border before:border-white/[0.03] before:rounded-[28px]"
          style={{
            borderColor: borderAccent,
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            backgroundImage: `linear-gradient(${tilt.y * -0.4}deg, transparent, transparent calc(20% + (-3px * ${tilt.x})), rgba(255, 255, 255, 0.06) calc(40% + (-3px * ${tilt.x})), rgba(255, 255, 255, 0.02) calc(70% + (-3px * ${tilt.x})), transparent calc(90% + (-3px * ${tilt.x})), transparent)`,
          }}
        >
          {/* Metadata Categorization Flag */}
          <span className="block w-fit border border-white/20 rounded-[4px] text-white font-semibold tracking-wide text-center mx-auto mb-[22px] px-2 py-1 text-[calc(0.8*var(--fz))]">
            {tagText}
          </span>

          {/* Main Visual Heading Node */}
          <h2 className="text-[calc(3.6*var(--fz))] font-extrabold tracking-tight leading-[116%] bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent text-center m-0 select-text">
            {titleText}
          </h2>

          {/* Main Descriptive Body Node */}
          <p className="text-[calc(1.3*var(--fz))] font-semibold leading-[142%] text-white/50 text-center mt-4 select-text">
            {descriptionText}
          </p>
        </div>
      </div>
    </div>
  );
}
