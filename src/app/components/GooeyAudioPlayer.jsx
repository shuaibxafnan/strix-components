"use client";

import { useState, useEffect, useRef } from "react";

export default function GooeyAudioPlayer({
  audioSrc = "https://upload.wikimedia.org/wikipedia/commons/6/61/Happy_Happy_HardPopCoreTastic.ogg",
  particleColor = "#0037a3",
  activeColor = "#00aaff",
  iconColor = "#ffffff",
  bgImage = "https://images.pexels.com/photos/1150988/pexels-photo-1150988.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  bgOverlay = "bg-black/60",
  buttonSize = 50,
  particleSize = 20,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const audioRef = useRef(null);

  // Eliminate server-side hydration mismatches by ensuring client-state flags are ready
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Playback prevented or error playing track:", err);
      });
      setIsPlaying(true);
    }
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Background Overlay */}
      <div className={`absolute inset-0 ${bgOverlay} z-0`} />

      {/* Main Block Shell */}
      <div className="relative z-10 flex justify-center py-[100px] px-[50px]">
        {/* Interactive Player Button */}
        <button
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
          className="relative cursor-pointer select-none border-0 bg-transparent p-0 outline-none group focus:outline-none"
        >
          {/* Prevent inner pointer triggers */}
          <div className="pointer-events-none">
            {/* Gooey Cluster Element */}
            <div
              className={`relative rounded-full transition-colors duration-300 ${
                isPlaying ? "animate-[spin_3s_linear_infinite]" : ""
              }`}
              style={{
                width: `${buttonSize}px`,
                height: `${buttonSize}px`,
                backgroundColor: isPlaying ? activeColor : particleColor,
                filter: "url(#fancy-goo)",
              }}
            >
              {/* Blobs / Satellites */}
              <div
                className={`absolute top-0 left-0 transition-all rounded-full ${
                  isPlaying
                    ? "animate-[particle-1_2s_ease-in-out_infinite]"
                    : ""
                }`}
                style={{
                  width: `${particleSize}px`,
                  height: `${particleSize}px`,
                  backgroundColor: isPlaying ? activeColor : particleColor,
                }}
              />
              <div
                className={`absolute top-0 right-0 transition-all rounded-full ${
                  isPlaying
                    ? "animate-[particle-2_2s_1s_ease-in-out_infinite]"
                    : ""
                }`}
                style={{
                  width: `${particleSize}px`,
                  height: `${particleSize}px`,
                  backgroundColor: isPlaying ? activeColor : particleColor,
                }}
              />
              <div
                className={`absolute bottom-0 right-0 transition-all rounded-full ${
                  isPlaying
                    ? "animate-[particle-3_2s_1.5s_ease-in-out_infinite]"
                    : ""
                }`}
                style={{
                  width: `${particleSize}px`,
                  height: `${particleSize}px`,
                  backgroundColor: isPlaying ? activeColor : particleColor,
                }}
              />
              <div
                className={`absolute bottom-0 left-0 transition-all rounded-full ${
                  isPlaying
                    ? "animate-[particle-4_2s_2s_ease-in-out_infinite]"
                    : ""
                }`}
                style={{
                  width: `${particleSize}px`,
                  height: `${particleSize}px`,
                  backgroundColor: isPlaying ? activeColor : particleColor,
                }}
              />
            </div>

            {/* Icon Morph Layer */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25px]"
            >
              <path
                stroke={iconColor}
                fill="transparent"
                strokeWidth={isPlaying ? 40 : 20}
                strokeDasharray="1000"
                strokeDashoffset="0"
                strokeLinejoin="round"
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-in-out ${
                  isPlaying
                    ? "animate-[to-pause_1s_ease-in-out_forwards]"
                    : "animate-[to-play_1s_ease-in-out_forwards]"
                }`}
                d={
                  isPlaying
                    ? "M50 20 V160 M140 20 V160"
                    : "M90 50 L30 15 L30 160 L170 100 L130 75"
                }
              />
            </svg>
          </div>
        </button>

        {/* Hidden Audio Core element */}
        <audio ref={audioRef} id="track" preload="auto">
          <source src={audioSrc} type="audio/mpeg" />
        </audio>
      </div>

      {/* SVG Matrix Meta-Filter */}
      <svg
        className="absolute h-0 w-0 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <defs>
          <filter id="fancy-goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Dynamic Keyframes Injection (Tailwind Fallback Configurations) */}
      <style jsx global>{`
        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes particle-1 {
          50% {
            transform: translate(-6px, 15px);
          }
        }
        @keyframes particle-2 {
          50% {
            transform: translate(-12px, -9px);
          }
        }
        @keyframes particle-3 {
          50% {
            transform: translate(10px, -25px);
          }
        }
        @keyframes particle-4 {
          50% {
            transform: translate(0px, 10px);
          }
        }
        @keyframes to-play {
          0% {
            stroke-width: 40;
            d: path("M50 20 V160 M140 20 V160");
            stroke-dashoffset: 1000;
          }
          50% {
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-width: 20;
            d: path("M90 50 L30 15 L30 160 L170 100 L130 75");
            stroke-dashoffset: 0;
          }
        }
        @keyframes to-pause {
          0% {
            stroke-dashoffset: 0;
            d: path("M90 50 L30 15 L30 160 L170 100 L130 75");
          }
          50% {
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-width: 40;
            d: path("M50 20 V160 M140 20 V160");
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
