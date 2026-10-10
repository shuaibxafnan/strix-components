"use client";

import { useEffect, useState, useRef } from "react";

// ─── ModernVideoShowcase ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// videos            array    List of video objects with sources & metadata
// cursorBgColor     string   Background color for the custom circle cursor
// activeBorderColor string   Tailwind color class for the active playing card
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_VIDEOS = [
  {
    id: 1,
    src: "https://assets.codepen.io/605876/tunnel-26475.mp4",
    title: "The Hyperloop Tunnel",
    category: "Motion Graphic",
  },
  {
    id: 2,
    src: "https://assets.codepen.io/605876/seoul-21116.mp4",
    title: "Seoul Cyberpunk Nights",
    category: "Cinematic Timelapse",
  },
];

export default function ModernVideoShowcase({
  videos = DEFAULT_VIDEOS,
  cursorBgColor = "bg-emerald-400",
  activeBorderColor = "border-emerald-500/50",
}) {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPlayerId, setHoveredPlayerId] = useState(null);
  const [playbackStates, setPlaybackStates] = useState({});
  const [focusedPlayerId, setFocusedPlayerId] = useState(null);

  const videoRefs = useRef({});

  useEffect(() => {
    setMounted(true);

    const handlePointerMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  const togglePlayback = (id) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      // Pause other videos if you want a solo theater experience
      Object.keys(videoRefs.current).forEach((key) => {
        if (key !== id.toString() && videoRefs.current[key]) {
          videoRefs.current[key].pause();
          setPlaybackStates((prev) => ({ ...prev, [key]: false }));
        }
      });

      video.play();
      setPlaybackStates((prev) => ({ ...prev, [id]: true }));
    } else {
      video.pause();
      setPlaybackStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  const isAnyHovered = hoveredPlayerId !== null;
  const activeVideoPlaying = hoveredPlayerId
    ? playbackStates[hoveredPlayerId]
    : false;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-8 md:p-16 select-none relative overflow-hidden">
      {/* Ambient background glow mesh */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl z-10">
        {videos.map((item) => {
          const isPlaying = playbackStates[item.id] || false;
          const isCurrentHovered = hoveredPlayerId === item.id;
          const isFocused = focusedPlayerId === item.id;

          return (
            <div
              key={item.id}
              className={`
                video-player relative rounded-2xl overflow-hidden group border transition-all duration-500 ease-out bg-neutral-900/40 backdrop-blur-md
                ${isPlaying ? `${activeBorderColor} shadow-[0_20px_50px_rgba(16,185,129,0.15)]` : "border-neutral-800 hover:border-neutral-700 shadow-xl"}
                ${isFocused ? "ring-2 ring-emerald-400 ring-offset-4 ring-offset-neutral-950" : ""}
              `}
              onMouseEnter={() => setHoveredPlayerId(item.id)}
              onMouseLeave={() => setHoveredPlayerId(null)}
            >
              {/* Video Wrapper with scaling mask */}
              <div className="w-full aspect-video overflow-hidden relative">
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[item.id] = el;
                  }}
                  src={item.src}
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover pointer-events-none cursor-none transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Meta Info Header Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-20">
                <span className="text-xs font-mono uppercase tracking-widest bg-neutral-950/60 backdrop-blur-md text-neutral-400 px-2.5 py-1 rounded-md border border-neutral-800">
                  {item.category}
                </span>

                {/* Soft Live Pulsing Badge */}
                {isPlaying && (
                  <span className="flex h-2 w-2 relative mt-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              {/* Floating Glass UI Control Pill Footer */}
              <div
                className={`absolute bottom-4 left-4 right-4 bg-neutral-900/70 backdrop-blur-lg border border-neutral-800/60 p-4 rounded-xl flex items-center justify-between transition-all duration-300 pointer-events-none z-20
                  ${isCurrentHovered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}
                `}
              >
                <div className="flex flex-col truncate pr-4">
                  <h3 className="text-sm font-semibold tracking-wide text-white truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Click anywhere to {isPlaying ? "pause" : "view"}
                  </p>
                </div>

                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/80 text-white border border-neutral-700/50">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    {!isPlaying ? (
                      <path d="M8 5v14l11-7z" />
                    ) : (
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    )}
                  </svg>
                </div>
              </div>

              {/* Accessible Interactive Trigger Area */}
              <button
                onClick={() => togglePlayback(item.id)}
                onFocus={() => setFocusedPlayerId(item.id)}
                onBlur={() => setFocusedPlayerId(null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-none z-30 outline-none"
                aria-label={
                  isPlaying ? `Pause ${item.title}` : `Play ${item.title}`
                }
              >
                <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Global Fluid Follower Cursor */}
      <div
        className={`pointer-events-none fixed top-0 left-0 rounded-full grid place-items-center transition-transform duration-300 ease-out z-50 origin-center text-neutral-950 mix-blend-screen shadow-2xl backdrop-blur-sm
          ${cursorBgColor} w-16 h-16
        `}
        style={{
          transform: `translate(calc(${mousePos.x}px - 50%), calc(${mousePos.y}px - 50%)) scale(${isAnyHovered ? 1 : 0})`,
        }}
      >
        <div className="bg-white/20 w-full h-full rounded-full flex items-center justify-center p-4">
          {!activeVideoPlaying ? (
            <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
