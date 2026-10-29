"use client";

import { useEffect, useRef, useState } from "react";

const CLIP =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const DEFAULT_VIDEOS = [
  {
    id: 1,
    src: CLIP,
    title: "Slow Bloom",
    category: "Macro Study",
  },
  {
    id: 2,
    src: CLIP,
    title: "Petal Study",
    category: "Nature",
  },
];

const PlayIcon = () => (
  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export default function CustomVideoGrid({
  videos = DEFAULT_VIDEOS,
  playHint = "Click to play",
  pauseHint = "Click to pause",
  playLabel = "Play",
  pauseLabel = "Pause",
  cursorBgColor = "bg-emerald-400",
  activeBorderColor = "border-emerald-500/50",
}) {
  const [hoveredPlayerId, setHoveredPlayerId] = useState(null);
  const [playbackStates, setPlaybackStates] = useState({});
  const [focusedPlayerId, setFocusedPlayerId] = useState(null);

  const videoRefs = useRef({});
  const progressRefs = useRef({});
  const cursorRef = useRef(null);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      }
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
      Object.keys(videoRefs.current).forEach((key) => {
        if (key !== id.toString() && videoRefs.current[key]) {
          videoRefs.current[key].pause();
          setPlaybackStates((prev) => ({ ...prev, [key]: false }));
        }
      });

      video.play().catch(() => { });
      setPlaybackStates((prev) => ({ ...prev, [id]: true }));
    } else {
      video.pause();
      setPlaybackStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const updateProgress = (id) => {
    const video = videoRefs.current[id];
    const bar = progressRefs.current[id];
    if (!video || !bar || !video.duration) return;
    bar.style.width = `${(video.currentTime / video.duration) * 100}%`;
  };

  const isAnyHovered = hoveredPlayerId !== null;
  const activeVideoPlaying = isAnyHovered
    ? playbackStates[hoveredPlayerId]
    : false;

  return (
    <div className="relative flex min-h-screen select-none flex-col items-center justify-center overflow-hidden bg-neutral-950 p-8 text-neutral-100 md:p-16">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="z-10 grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
        {videos.map((item) => {
          const isPlaying = playbackStates[item.id] || false;
          const isFocused = focusedPlayerId === item.id;

          return (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl border bg-neutral-900 transition-all duration-500 ease-out ${isPlaying
                  ? `${activeBorderColor} shadow-[0_20px_50px_rgba(16,185,129,0.15)]`
                  : "border-neutral-800 shadow-xl hover:border-neutral-700"
                } ${isFocused
                  ? "ring-2 ring-emerald-400 ring-offset-4 ring-offset-neutral-950"
                  : ""
                }`}
              onMouseEnter={() => setHoveredPlayerId(item.id)}
              onMouseLeave={() => setHoveredPlayerId(null)}
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[item.id] = el;
                  }}
                  src={item.src}
                  loop
                  muted
                  playsInline
                  onTimeUpdate={() => updateProgress(item.id)}
                  className="pointer-events-none h-full w-full cursor-none object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-30" />

                <span
                  ref={(el) => {
                    if (el) progressRefs.current[item.id] = el;
                  }}
                  className={`pointer-events-none absolute bottom-0 left-0 z-10 h-[2px] w-0 ${cursorBgColor}`}
                />

                <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex items-start justify-between">
                  <span className="rounded-md border border-neutral-800 bg-neutral-950/60 px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-neutral-400 backdrop-blur-md">
                    {item.category}
                  </span>

                  {isPlaying && (
                    <span className="relative mt-2 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pointer-events-none flex items-center justify-between gap-4 border-t border-neutral-800 px-5 py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {isPlaying ? pauseHint : playHint}
                  </p>
                </div>

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-neutral-700 text-white transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-neutral-950">
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </span>
              </div>

              <button
                type="button"
                onClick={() => togglePlayback(item.id)}
                onFocus={() => setFocusedPlayerId(item.id)}
                onBlur={() => setFocusedPlayerId(null)}
                className="absolute inset-0 z-30 h-full w-full cursor-none opacity-0 outline-none"
                aria-label={`${isPlaying ? pauseLabel : playLabel} ${item.title}`}
              >
                <span className="sr-only">
                  {isPlaying ? pauseLabel : playLabel}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-50 transition-transform duration-300 ease-out"
      >
        <div
          className={`grid h-16 w-16 place-items-center rounded-full text-neutral-950 shadow-2xl transition-transform duration-300 ease-out ${cursorBgColor} ${isAnyHovered ? "scale-100" : "scale-0"
            }`}
        >
          <div className="grid h-full w-full place-items-center rounded-full bg-white/20 p-4">
            {activeVideoPlaying ? (
              <svg className="h-full w-full fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="h-full w-full fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}