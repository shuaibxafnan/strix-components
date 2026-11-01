"use client";

import { useState, useEffect, useRef } from "react";

export default function NeumorphicWaveButton({
  baseColor = "#55b9f3",
  lightenColor = "#62d5ff",
  darkenColor = "#489dcf",
  iconColor = "#c8deeb",
  maxWaveSize = 900,
  waveDuration = 5000,
  className = "",
  onClick,
}) {
  const [mounted, setMounted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [waves, setWaves] = useState([]);

  const waveIdCounter = useRef(0);
  const debounceRef = useRef(false);
  const timersRef = useRef(new Set());

  const later = (fn, ms) => {
    const t = setTimeout(() => {
      timersRef.current.delete(t);
      fn();
    }, ms);
    timersRef.current.add(t);
  };

  useEffect(() => {
    setMounted(true);
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const handleClick = (e) => {
    if (debounceRef.current) return;
    debounceRef.current = true;

    if (onClick) {
      onClick(e);
    }

    setIsClicked(true);
    later(() => {
      setIsClicked(false);
      debounceRef.current = false;
    }, 700);

    const newWaveId = waveIdCounter.current++;
    setWaves((prev) => [...prev, newWaveId]);

    later(() => {
      setWaves((prev) => prev.filter((id) => id !== newWaveId));
    }, waveDuration + 2000);
  };

  if (!mounted) return null;

  const innerWaveOffset = maxWaveSize - 20;

  return (
    <>
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
        className={`w-full h-screen relative flex items-center justify-center overflow-hidden ${className}`}
        style={{
          backgroundColor: baseColor,
          "--lt": lightenColor,
          "--dk": darkenColor,
          "--mw": `${maxWaveSize}px`,
          "--iw": `${innerWaveOffset}px`,
        }}
      >
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
        {waves.map((id) => (
          <div
            key={id}
            className="z-[1] absolute rounded-full opacity-0 pointer-events-none flex items-center justify-center animate-wave-ripple"
            style={{
              boxShadow: `20px 20px 60px ${darkenColor}, -20px -20px 60px ${lightenColor}`,
            }}
          >
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
