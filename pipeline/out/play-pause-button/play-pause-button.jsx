"use client";

import { useState, useEffect } from "react";

export default function PlayPauseButton({
  playColor = "#6D58FF",
  pauseColor = "#2B3044",
  textColor = "#ffffff",
  fontSize = "14px",
  iconColor = "#ffffff",
  className = "",
}) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const handleToggleState = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      if (isPaused) {
        setIsPlaying(true);
      }
    }
    if (!isPaused) {
      setIsPaused(true);
    }
  };

  const currentButtonClass = isPaused
    ? isPlaying
      ? "paused playing"
      : "paused"
    : "";

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden font-sans select-none ${className}`}
    >
      <button
        onClick={handleToggleState}
        className={`group relative m-0 flex items-center justify-center outline-none border-none cursor-pointer rounded-[22px] [backface-visibility:hidden] [-webkit-appearance:none] [-webkit-tap-highlight-color:transparent] transition-all duration-[0.8s] ease-out hover:-translate-y-[1px] active:translate-y-[1px] ${currentButtonClass}`}
        style={{
          fontSize: fontSize,
          lineHeight: "20px",

          padding: "11px 24px 11px 44px",
          color: textColor,
          "--play": playColor,
          "--play-shadow": `${playColor}3D`,
          "--pause": pauseColor,
          "--pause-shadow": `${pauseColor}3D`,
          "--icon": iconColor,
          "--shadow-y": isPlaying ? "6px" : "6px",
          "--shadow-b": "16px",
          boxShadow: `0 var(--shadow-y, 6px) var(--shadow-b, 16px) var(--shadow, ${
            isPaused && !isPlaying ? `${playColor}3D` : `${pauseColor}3D`
          })`,
          background: `radial-gradient(circle, var(--play) 0%, var(--play) 50%, var(--pause) 50.5%, var(--pause) 100%)`,
          backgroundSize: "400% 400%",
          backgroundPosition: isPaused
            ? isPlaying
              ? "100% 100%"
              : "50% 50%"
            : "0% 0%",
        }}
      >
        <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-4 h-3 flex items-center">
          <span
            className={`absolute left-0 top-0 block h-3 w-4 [backface-visibility:hidden] [transform-origin:50%_100%] transition-all duration-[0.6s] ease-in-out ${
              isPaused && !isPlaying
                ? "[clip-path:polygon(0_0,11px_6px,11px_6px,0_12px)] [transition-delay:0.9s]"
                : isPlaying
                  ? "[clip-path:polygon(0_0,3px_0,3px_12px,0_12px)] [transition-delay:0s]"
                  : "[clip-path:polygon(0_0,3px_0,3px_12px,0_12px)]"
            }`}
            style={{
              backgroundColor: "var(--icon)",
            }}
          />

          <span
            className={`absolute left-0 top-0 block h-3 w-[3px] [backface-visibility:hidden] transition-all duration-[0.6s] ease-in-out ${
              isPaused && !isPlaying
                ? "animate-[to-play_0.9s_ease_forwards]"
                : isPlaying
                  ? "animate-[to-pause_1.3s_ease_forwards]"
                  : ""
            }`}
            style={{
              backgroundColor: "var(--icon)",
              transform: isPaused && !isPlaying ? undefined : "translateX(6px)",
            }}
          />
        </div>

        <div className="flex items-center tracking-[0.2px]">
          <i
            className="block font-bold not-italic [backface-visibility:hidden] transition-all duration-[0.6s] ease-in-out"
            style={{
              transform: isPaused
                ? isPlaying
                  ? "translateX(0%)"
                  : "translateX(40%)"
                : "translateX(0%)",
            }}
          >
            P
          </i>
          <i
            className="block font-bold not-italic [backface-visibility:hidden] transition-all duration-[0.6s] ease-in-out"
            style={{
              opacity: isPaused ? (isPlaying ? "0" : "1") : "0",
              transform: isPaused
                ? isPlaying
                  ? "translateX(0%)"
                  : "translateX(100%)"
                : "translateX(0%)",
            }}
          >
            l
          </i>
          <i
            className="block font-bold not-italic [backface-visibility:hidden] transition-all duration-[0.6s] ease-in-out"
            style={{
              transform: isPaused
                ? isPlaying
                  ? "translateX(-50%)"
                  : "translateX(50%)"
                : "translateX(-50%)",
            }}
          >
            a
          </i>
          <i
            className="block font-bold not-italic [backface-visibility:hidden] transition-all duration-[0.6s] ease-in-out"
            style={{
              opacity: isPaused ? (isPlaying ? "0" : "1") : "0",
              transform: isPaused
                ? isPlaying
                  ? "translateX(0%)"
                  : "translateX(50%)"
                : "translateX(0%)",
            }}
          >
            y
          </i>
          <i
            className="block font-bold not-italic [backface-visibility:hidden] transition-all duration-[0.6s] ease-in-out"
            style={{
              transform: isPaused
                ? isPlaying
                  ? "translateX(-50%)"
                  : "translateX(0%)"
                : "translateX(-50%)",
              opacity: isPaused ? (isPlaying ? "1" : "0") : "1",
            }}
          >
            use
          </i>
        </div>
      </button>

      <style>{`
        @keyframes to-play {
          15% {
            transform: translateX(6px) scaleY(1.1);
          }
          30% {
            transform: translateX(6px) scaleY(0.9);
          }
          45% {
            transform: translateX(6px) scaleY(1.15);
            clip-path: polygon(0 0, 3px 0, 3px 12px, 0 12px);
            transform-origin: 50% 100%;
          }
          60%,
          100% {
            clip-path: polygon(0 9px, 3px 9px, 3px 12px, 0 12px);
            transform-origin: 50% 10.5px;
          }
          60% {
            transform: translateX(6px);
          }
          99% {
            transform: translateX(0) rotate(-270deg);
          }
          100% {
            transform: translateX(0) rotate(-270deg) scale(0);
          }
        }

        @keyframes to-pause {
          0%,
          50% {
            clip-path: polygon(0 9px, 3px 9px, 3px 12px, 0 12px);
            transform-origin: 50% 10.5px;
          }
          0%,
          39% {
            transform: translateX(0) rotate(-270deg) scale(0);
          }
          40% {
            transform: translateX(0) rotate(-270deg);
          }
          50% {
            transform: translateX(6px) rotate(0deg);
          }
          60%,
          100% {
            transform: translateX(6px);
            clip-path: polygon(0 0, 3px 0, 3px 12px, 0 12px);
            transform-origin: 50% 100%;
          }
          70% {
            transform: translateX(6px) scaleY(1.15);
          }
          80% {
            transform: translateX(6px) scaleY(0.9);
          }
          90% {
            transform: translateX(6px) scaleY(1.05);
          }
          100% {
            transform: translateX(6px);
          }
        }
      `}</style>
    </div>
  );
}
