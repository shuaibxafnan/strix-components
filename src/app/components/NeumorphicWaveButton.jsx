"use client";

import { useState, useEffect, useRef } from "react";

// ─── NeumorphicWaveButton ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// baseColor          string    "#55b9f3"    Main backdrop and button color
// lightenColor       string    "#62d5ff"    Highlight layer color for soft shadows
// darkenColor        string    "#489dcf"    Lowlight layer color for deep shadows
// iconColor          string    "#c8deeb"    Color fill applied to the interior SVG
// maxWaveSize        number    900          Final diameter bound of the ripple grid
// waveDuration       number    5000         Lifetime duration of expanding wave (ms)
// onClick            function  undefined    Optional event callback executed on click
// ──────────────────────────────────────────────────────────────────────────

export default function NeumorphicWaveButton({
  baseColor = "#55b9f3",
  lightenColor = "#62d5ff",
  darkenColor = "#489dcf",
  iconColor = "#c8deeb",
  maxWaveSize = 900,
  waveDuration = 5000,
  onClick,
}) {
  const [mounted, setMounted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [waves, setWaves] = useState([]);

  const waveIdCounter = useRef(0);
  const debounceRef = useRef(false);

  // Guarantee hydration safety checks pass before displaying interface layout
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e) => {
    if (debounceRef.current) return;
    debounceRef.current = true;

    if (onClick) {
      onClick(e);
    }

    // Trigger button animation
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      debounceRef.current = false;
    }, 700);

    // Spawn a new distinct wave ring instance
    const newWaveId = waveIdCounter.current++;
    setWaves((prev) => [...prev, newWaveId]);

    // Cleanup wave instance reference out of memory when animation finishes
    setTimeout(() => {
      setWaves((prev) => prev.filter((id) => id !== newWaveId));
    }, waveDuration + 2000);
  };

  if (!mounted) return null;

  // Inner margin gap for concentric inner ring shadow calculation
  const innerWaveOffset = maxWaveSize - 20;

  return (
    <>
      {/* Structural global keyframe animations injected inline */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shadowFadeOut {
          0% { box-shadow: 6px 6px 12px var(--dk), -6px -6px 12px var(--lt); }
          50% { box-shadow: none; }
          100% { box-shadow: inset 6px 6px 12px var(--dk), inset -6px -6px 12px var(--lt); }
        }
        @keyframes shadowFadeIn {
          0% { box-shadow: inset 6px 6px 12px var(--dk), inset -6px -6px 12px var(--lt); }
          50% { box-shadow: none; }
          100% { box-shadow: 6px 6px 12px var(--dk), -6px -6px 12px var(--lt); }
        }
        @keyframes fillFadeOut {
          from { fill: none; }
          to { fill: currentColor; }
        }
        @keyframes fillFadeIn {
          from { fill: currentColor; }
          to { fill: none; }
        }
        @keyframes waveFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes waveFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes outsideGrow {
          from { width: 20px; height: 20px; }
          to { width: var(--mw); height: var(--mw); }
        }
        @keyframes insideGrow {
          from { width: 0px; height: 0px; }
          to { width: var(--iw); height: var(--iw); }
        }

        .animate-btn-click {
          animation: shadowFadeOut 200ms ease-out forwards,
                    shadowFadeIn 200ms 300ms ease-in forwards;
        }
        .animate-svg-click {
          animation: fillFadeOut 200ms ease-out forwards,
                    fillFadeIn 200ms 300ms ease-in forwards;
        }
        .animate-wave-ripple {
          animation: waveFadeIn 400ms ease-out forwards, 
                    outsideGrow ${waveDuration}ms cubic-bezier(0.1, 0.8, 0.25, 1) forwards,
                    waveFadeOut 3000ms 2000ms forwards;
        }
        .animate-wave-inner {
          animation: insideGrow ${waveDuration}ms cubic-bezier(0.1, 0.8, 0.25, 1) forwards;
        }
      `,
        }}
      />

      <div
        className="w-full h-screen relative flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: baseColor,
          "--lt": lightenColor,
          "--dk": darkenColor,
          "--mw": `${maxWaveSize}px`,
          "--iw": `${innerWaveOffset}px`,
        }}
      >
        {/* Core Interactive Neumorphic Trigger Mechanism */}
        <button
          onClick={handleClick}
          className={`
            z-10 absolute w-[40px] h-[40px] border-none rounded-full cursor-pointer outline-none select-none
            transition-transform duration-150 active:scale-95
            ${isClicked ? "animate-btn-click" : ""}
          `}
          style={{
            backgroundColor: baseColor,
            color: iconColor,
            boxShadow: `6px 6px 12px ${darkenColor}, -6px -6px 12px ${lightenColor}`,
          }}
        >
          {/* Lightning Vector Node Graphic */}
          <svg
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none
              ${isClicked ? "animate-svg-click" : ""}
            `}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>

        {/* Dynamic Neumorphic Backdrop Ripple Propagation Field */}
        {waves.map((id) => (
          <div
            key={id}
            className="z-[1] absolute rounded-full opacity-0 pointer-events-none flex items-center justify-center animate-wave-ripple"
            style={{
              boxShadow: `20px 20px 60px ${darkenColor}, -20px -20px 60px ${lightenColor}`,
            }}
          >
            {/* Embedded Pseudo Mask Element representing concentric shadow offsets */}
            <div
              className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-wave-inner"
              style={{
                boxShadow: `inset 20px 20px 60px ${darkenColor}, inset -20px -20px 60px ${lightenColor}`,
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
