"use client";

import { useEffect, useRef, useState } from "react";
import { Bricolage_Grotesque, Inter } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=800&q=80`;

const DEFAULT_SONGS = [
  {
    songName: "Happy Happy HardPopCoreTastic",
    artist: "Mesostic",
    cover: unsplash("photo-1749330513873-09ffa91b0aae"),
    audio:
      "https://upload.wikimedia.org/wikipedia/commons/6/61/Happy_Happy_HardPopCoreTastic.ogg",
    duration: "4:33",
  },
  {
    songName: "Friendly Evil Gangsta Synth Hip Hop",
    artist: "Mesostic",
    cover: unsplash("photo-1627896157734-4d7d4388f28b"),
    audio:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Friendly_Evil_Gangsta_Synth_Hip_Hop.ogg",
    duration: "6:15",
  },
  {
    songName: "Laylat al-Uns",
    artist: "Sanaa of Algiers",
    cover: unsplash("photo-1778789172736-e8ba37c71124"),
    audio: "https://upload.wikimedia.org/wikipedia/commons/6/63/Lalat-u-l-uns.ogg",
    duration: "3:11",
  },
];

const WAVE_HEIGHTS = [0.5, 1, 0.7, 0.9, 0.55];

const KEYFRAMES =
  "@keyframes mp-wave{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}";

const formatTime = (secs) => {
  if (!secs || Number.isNaN(secs)) return "0:00";
  const minutes = Math.floor(secs / 60);
  const seconds = String(Math.floor(secs % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    {children}
  </svg>
);

const Bars = ({ playing, height }) => (
  <span className={`flex items-end gap-[2px] ${height}`}>
    {WAVE_HEIGHTS.map((h, i) => (
      <span
        key={i}
        style={{ "--h": h, "--d": `${0.7 + i * 0.12}s`, "--delay": `${i * 0.08}s` }}
        className={`block h-full w-[2px] origin-bottom rounded-sm ${playing
            ? "bg-[var(--accent)] [animation:mp-wave_var(--d)_var(--delay)_ease-in-out_infinite]"
            : "bg-white/25 [transform:scaleY(var(--h))]"
          }`}
      />
    ))}
  </span>
);

export default function MusicPlayer({
  songs = DEFAULT_SONGS,
  accentColor = "#ffffff",
  cardBg = "#0a0a0a",
  playlistBg = "#141414",
  backgroundColor = "bg-black",
  borderRadius = "20px",
  animDuration = "0.7s",
  queueLabel = "Queue",
  playLabel = "Play",
  pauseLabel = "Pause",
  previousLabel = "Previous track",
  nextLabel = "Next track",
  showPlaylistLabel = "Show playlist",
  showNowPlayingLabel = "Show now playing",
  closePlaylistLabel = "Close playlist",
  className = "",
}) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const scrubbingRef = useRef(false);
  const wantPlayRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");

  const song = songs[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    setProgress(0);
    setCurrentTime("0:00");
    setTotalTime("0:00");
    if (wantPlayRef.current) audio.play().catch(() => setPlaying(false));
  }, [index]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      wantPlayRef.current = true;
      audio.play().catch(() => setPlaying(false));
    } else {
      wantPlayRef.current = false;
      audio.pause();
    }
  };

  const changeTrack = (next) => {
    if (next < 0 || next >= songs.length || next === index) return;
    setIndex(next);
  };

  const selectFromPlaylist = (i) => {
    if (i === index) {
      togglePlay();
      return;
    }
    wantPlayRef.current = true;
    setIndex(i);
  };

  const handleEnded = () => {
    if (index < songs.length - 1) setIndex(index + 1);
    else {
      wantPlayRef.current = false;
      setPlaying(false);
    }
  };

  const scrubTo = (e) => {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !audio.duration) return;
    const { left, width } = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - left) / width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const iconButton =
    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition-[color,transform] duration-150 active:scale-90 disabled:cursor-default text-white/60 hover:text-white disabled:text-white/15 disabled:hover:text-white/15";

  return (
    <div
      className={`${bricolage.variable} ${inter.variable} flex min-h-screen w-full items-center justify-center p-4 [font-family:var(--font-sans)] ${backgroundColor} ${className}`}
      style={{
        "--accent": accentColor,
        "--card": cardBg,
        "--playlist": playlistBg,
        "--radius": borderRadius,
        "--dur": animDuration,
        "--i": index,
      }}
    >
      <style>{KEYFRAMES}</style>

      <audio
        ref={audioRef}
        src={song.audio}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => setTotalTime(formatTime(e.currentTarget.duration))}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          if (!audio.duration) return;
          setProgress(audio.currentTime / audio.duration);
          setCurrentTime(formatTime(audio.currentTime));
        }}
      />

      <div className="relative flex w-[340px] max-w-full select-none flex-col overflow-hidden rounded-[var(--radius)] bg-[var(--card)] text-white [-webkit-tap-highlight-color:transparent] [box-shadow:0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="relative h-[300px] overflow-hidden">
          <div className="absolute inset-0 flex transition-transform duration-[var(--dur)] [transform:translateX(calc(var(--i)*-100%))] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)]">
            {songs.map((s, i) => (
              <img
                key={i}
                src={s.cover}
                alt={s.songName}
                className="pointer-events-none h-full w-full min-w-full flex-shrink-0 object-cover"
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(to_bottom,transparent_40%,color-mix(in_srgb,var(--card)_80%,transparent)_80%,var(--card)_100%)]" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
            <span className="text-xs font-medium uppercase tracking-widest text-white/35">
              {index + 1} / {songs.length}
            </span>
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-label={expanded ? showNowPlayingLabel : showPlaylistLabel}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white/80"
            >
              <Icon className="h-4 w-4">
                <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h12v2H3z" />
              </Icon>
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
            <div className="truncate text-[22px] font-bold leading-tight tracking-[-0.02em] [font-family:var(--font-display)]">
              {song.songName}
            </div>
            <div className="mt-0.5 flex items-center gap-2 truncate text-sm font-medium text-white/55">
              <Bars playing={playing} height="h-3" />
              {song.artist}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-[var(--card)] px-5 pb-5 pt-4">
          <div className="flex flex-col gap-1.5">
            <div
              ref={progressRef}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                scrubbingRef.current = true;
                scrubTo(e);
              }}
              onPointerMove={(e) => scrubbingRef.current && scrubTo(e)}
              onPointerUp={() => (scrubbingRef.current = false)}
              onPointerCancel={() => (scrubbingRef.current = false)}
              className="group relative flex h-5 cursor-pointer touch-none items-center"
            >
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10 transition-[height] group-hover:h-1">
                <div
                  className="h-full w-full origin-left rounded-full bg-[var(--accent)]"
                  style={{ transform: `scaleX(${progress})` }}
                />
              </div>
              <div
                className="pointer-events-none absolute h-3 w-3 scale-[0.6] rounded-full bg-white opacity-0 transition-[opacity,transform] duration-150 group-hover:scale-100 group-hover:opacity-100"
                style={{ left: `calc(${progress * 100}% - 6px)` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-medium tabular-nums text-white/30">
              <span>{currentTime}</span>
              <span>{totalTime}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => changeTrack(index - 1)}
              disabled={index === 0}
              aria-label={previousLabel}
              className={iconButton}
            >
              <Icon className="h-6 w-6">
                <rect x="4" y="5" width="3" height="14" rx="1" />
                <path d="M20 5v14L9 12z" />
              </Icon>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? pauseLabel : playLabel}
              className="relative flex h-[60px] w-[60px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--accent)] text-[var(--card)] transition-transform duration-100 active:scale-90"
            >
              {playing ? (
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[var(--accent)] opacity-30 [animation-duration:2.4s]" />
              ) : null}
              {playing ? (
                <Icon className="h-6 w-6">
                  <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
                  <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
                </Icon>
              ) : (
                <Icon className="h-6 w-6">
                  <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" />
                </Icon>
              )}
            </button>

            <button
              type="button"
              onClick={() => changeTrack(index + 1)}
              disabled={index === songs.length - 1}
              aria-label={nextLabel}
              className={iconButton}
            >
              <Icon className="h-6 w-6">
                <rect x="17" y="5" width="3" height="14" rx="1" />
                <path d="M4 5v14l11-7z" />
              </Icon>
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-col overflow-y-auto rounded-[var(--radius)] bg-[var(--playlist)] transition-transform duration-[var(--dur)] [scrollbar-width:none] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] [&::-webkit-scrollbar]:hidden ${expanded ? "translate-y-0" : "translate-y-full"
            }`}
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 px-5 py-4">
            <span className="text-sm font-semibold uppercase tracking-[0.12em] text-white/35">
              {queueLabel}
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label={closePlaylistLabel}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white/60"
            >
              <Icon className="h-3.5 w-3.5">
                <path d="M5.3 4 12 10.7 18.7 4 20 5.3 13.3 12 20 18.7 18.7 20 12 13.3 5.3 20 4 18.7 10.7 12 4 5.3z" />
              </Icon>
            </button>
          </div>

          <ul className="m-0 flex list-none flex-col gap-1 p-3">
            {songs.map((s, i) => {
              const active = i === index;
              return (
                <li
                  key={i}
                  onClick={() => selectFromPlaylist(i)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-white/[0.04]"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={s.cover}
                      alt={s.songName}
                      className="block h-11 w-11 rounded-[10px] object-cover"
                    />
                    {active ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/50">
                        <Bars playing={playing} height="h-3.5" />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={`truncate text-sm font-semibold tracking-[-0.01em] [font-family:var(--font-display)] ${active ? "text-[var(--accent)]" : "text-white/85"
                        }`}
                    >
                      {s.songName}
                    </span>
                    <span className="mt-0.5 truncate text-xs text-white/30">
                      {s.artist}
                    </span>
                  </div>

                  <span className="flex-shrink-0 text-xs tabular-nums text-white/25">
                    {s.duration}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}