"use client";

import { useEffect, useRef, useState, useId } from "react";

// ─── MusicPlayer ──────────────────────────────────────────────────────────────
//
// A dark-mode music player with full-bleed cover art, frosted-glass controls,
// a breathing play button, and an animated waveform indicator.
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// songs          array    null        Playlist array (see shape below).
//                                     If omitted, loads the original demo gist.
// accentColor    string   #c8ff3e     Chartreuse accent — play button glow,
//                                     active track dot, progress fill.
// cardBg         string   #0f0f11     Main card background (dark charcoal).
// playlistBg     string   #141418     Playlist panel background.
// borderRadius   string   20px        Card + thumbnail corner radius.
// animDuration   string   0.7s        Expand/collapse + cover slide duration.
//
// songs[i] shape:
//   {
//     songName: string,
//     artist:   string,
//     bg:       string,   // optional — tints the page backdrop when playing
//     files: {
//       cover: string,    // image URL
//       song:  string,    // audio URL
//     }
//   }
//
// Font note: Inter + Bricolage Grotesque loaded via Google Fonts CDN.
// icomoon icon font loaded from GitHub CDN — no local install needed.
// Audio + cover images are blobified on load to avoid CORS issues.
// ─────────────────────────────────────────────────────────────────────────────

// ── icomoon icon font (prev / next / play / pause / playlist) ─────────────────
const ICOMOON_CSS = `
@font-face {
  font-family: "icomoon";
  src: url("https://raw.githubusercontent.com/abxlfazl/music-player-widget/main/src/assets/icomoon/fonts/icomoon.eot?u8ckod");
  src: url("https://raw.githubusercontent.com/abxlfazl/music-player-widget/main/src/assets/icomoon/fonts/icomoon.eot?u8ckod#iefix") format("embedded-opentype"),
       url("https://raw.githubusercontent.com/abxlfazl/music-player-widget/main/src/assets/icomoon/fonts/icomoon.ttf?u8ckod") format("truetype"),
       url("https://raw.githubusercontent.com/abxlfazl/music-player-widget/main/src/assets/icomoon/fonts/icomoon.woff?u8ckod") format("woff"),
       url("https://raw.githubusercontent.com/abxlfazl/music-player-widget/main/src/assets/icomoon/fonts/icomoon.svg?u8ckod#icomoon") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: block;
}
[class^="icon-"], [class*=" icon-"] {
  font-family: "icomoon" !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.icon-back:before    { content: "\\e900"; }
.icon-next:before    { content: "\\e901"; }
.icon-pause:before   { content: "\\e902"; }
.icon-play:before    { content: "\\e903"; }
.icon-playlist:before { content: "\\e904"; }
`;

// ── Google Fonts: Inter (UI labels/numbers) + Bricolage Grotesque (song names) ─
const GFONTS_LINK =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=Inter:wght@400;500;600&display=swap";

// ── Default demo data ─────────────────────────────────────────────────────────
const DEFAULT_SONGS_URL =
  "https://gist.githubusercontent.com/abxlfazl/37404417d17230a629683eb3f2f0a88a/raw/366ad64df645e94592847283a306fe2276de458e/music-info.json";

// ── Waveform bar heights (5 bars, purely decorative) ─────────────────────────
const WAVE_HEIGHTS = [0.5, 1, 0.7, 0.9, 0.55];

export default function MusicPlayer({
  songs: songsProp = null,
  accentColor = "#c8ff3e",
  cardBg = "#0f0f11",
  playlistBg = "#141418",
  borderRadius = "20px",
  animDuration = "0.7s",
}) {
  const uid = useId().replace(/:/g, "");

  // ── state ──────────────────────────────────────────────────────────────────
  const [songs, setSongs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadPct, setLoadPct] = useState(0);
  const [songIndex, setSongIndex] = useState(0);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");

  // ── refs ───────────────────────────────────────────────────────────────────
  const audioRefs = useRef([]);
  const progressBarUpdating = useRef(false);
  const progressElRef = useRef(null);

  // ── helpers ────────────────────────────────────────────────────────────────
  function fmtTime(secs) {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = String(Math.floor(secs % 60)).padStart(2, "0");
    return m + ":" + s;
  }

  function getAudio(idx) {
    return audioRefs.current[idx] || null;
  }

  // ── asset loading (blobify covers + audio to avoid CORS) ──────────────────
  useEffect(() => {
    // Inject Google Fonts link
    if (!document.querySelector("link[data-gf-mp]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = GFONTS_LINK;
      link.setAttribute("data-gf-mp", "1");
      document.head.appendChild(link);
    }

    async function blobify(url) {
      const res = await fetch(url);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }

    async function loadAssets(rawSongs) {
      let done = 0;
      const total = rawSongs.length * 2;

      const withCovers = await Promise.all(
        rawSongs.map(async (s) => {
          const cover = await blobify(s.files.cover);
          done++;
          setLoadPct(Math.round((done / total) * 100));
          return { ...s, files: { ...s.files, cover } };
        }),
      );

      const withSongs = await Promise.all(
        withCovers.map(async (s) => {
          const song = await blobify(s.files.song);
          done++;
          setLoadPct(Math.round((done / total) * 100));
          return { ...s, files: { ...s.files, song } };
        }),
      );

      return withSongs;
    }

    async function init() {
      let rawSongs = songsProp;
      if (!rawSongs) {
        const res = await fetch(DEFAULT_SONGS_URL);
        const data = await res.json();
        rawSongs = data.songs;
      }
      const loaded = await loadAssets(rawSongs);
      setSongs(loaded);
      setLoading(false);
    }

    init().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!songs) return;
    const audio = audioRefs.current[songIndex];
    if (!audio) return;
    function sync() {
      setTotalTime(fmtTime(audio.duration));
    }
    if (audio.duration) {
      sync();
    } else {
      audio.addEventListener("loadedmetadata", sync, { once: true });
      return () => audio.removeEventListener("loadedmetadata", sync);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songIndex, songs]);

  // ── playback controls ──────────────────────────────────────────────────────
  function changeTrack(nextIdx) {
    if (!songs || nextIdx < 0 || nextIdx >= songs.length) return;
    if (nextIdx === songIndex) return;

    const prev = getAudio(songIndex);
    if (prev) {
      prev.pause();
      prev.currentTime = 0;
    }

    setSongIndex(nextIdx);
    setProgressPct(0);
    setCurrentTime("0:00");

    // totalTime is updated by the useEffect that watches songIndex.

    if (isPlayed) setTimeout(() => getAudio(nextIdx)?.play(), 0);
  }

  function togglePlay() {
    const audio = getAudio(songIndex);
    if (!audio) return;
    if (audio.currentTime === audio.duration) {
      changeTrack(songIndex + 1);
      return;
    }
    if (audio.paused) {
      audio.play();
      setIsPlayed(true);
    } else {
      audio.pause();
      setIsPlayed(false);
    }
  }

  function handlePlaylistSelect(idx) {
    if (idx === songIndex) {
      togglePlay();
      return;
    }
    changeTrack(idx);
    setIsPlayed(true);
    setTimeout(() => getAudio(idx)?.play(), 0);
  }

  // ── progress scrub ─────────────────────────────────────────────────────────
  function scrubTo(e) {
    const el = progressElRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - left) / width));
    const audio = getAudio(songIndex);
    if (audio && audio.duration) audio.currentTime = ratio * audio.duration;
  }

  // ── timeupdate ─────────────────────────────────────────────────────────────
  function handleTimeUpdate(idx) {
    if (idx !== songIndex) return;
    const audio = getAudio(idx);
    if (!audio || !audio.duration) return;
    setProgressPct((audio.currentTime / audio.duration) * 100);
    setCurrentTime(fmtTime(audio.currentTime));
    setTotalTime(fmtTime(audio.duration));

    if (audio.currentTime === audio.duration) {
      if (idx < songs.length - 1) {
        changeTrack(idx + 1);
        setIsPlayed(true);
        setTimeout(() => getAudio(idx + 1)?.play(), 0);
      } else {
        setIsPlayed(false);
      }
    }
  }

  const scopedCSS =
    ICOMOON_CSS +
    `
    /* Breathing glow on the play button when playing */
    @keyframes mp_breathe_${uid} {
      0%, 100% { box-shadow: 0 0 0 0 ${accentColor}55, 0 0 24px 4px ${accentColor}33; }
      50%       { box-shadow: 0 0 0 10px ${accentColor}00, 0 0 40px 12px ${accentColor}22; }
    }
    /* Waveform bar bounce */
    @keyframes mp_wave_${uid} {
      0%, 100% { transform: scaleY(0.3); }
      50%       { transform: scaleY(1);   }
    }
    /* Cover strip transition lock shimmer */
    @keyframes mp_shimmer_${uid} {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    /* Progress bar thumb — shows as a circle on hover */
    .mp_progress_${uid}:hover .mp_thumb_${uid} { opacity: 1 !important; transform: scale(1) !important; }
    .mp_progress_${uid}:hover .mp_track_fill_${uid} { height: 4px !important; }
    /* Playlist row hover */
    .mp_row_${uid}:hover { background: #ffffff08; }
    .mp_row_${uid} { transition: background 0.15s; border-radius: 12px; }
    /* Scrollbar hide */
    .mp_scroll_${uid}::-webkit-scrollbar { display: none; }
    .mp_scroll_${uid} { scrollbar-width: none; }
  `;

  const currentSong = songs?.[songIndex];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />

      {/* Hidden audio elements — one per song */}
      {songs &&
        songs.map((s, i) => (
          <audio
            key={i}
            ref={(el) => {
              audioRefs.current[i] = el;
            }}
            src={s.files.song}
            onTimeUpdate={() => handleTimeUpdate(i)}
            className="hidden"
          />
        ))}

      {/* ── Centering wrapper ── */}
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{
          backgroundColor: "#09090b",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: accentColor,
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span className="text-white/40 text-sm tracking-widest uppercase">
              {loadPct}%
            </span>
          </div>
        )}

        {/* ── Player card ── */}
        {!loading && songs && (
          <div
            className="relative flex flex-col overflow-hidden select-none"
            style={{
              width: 340,
              borderRadius,
              backgroundColor: cardBg,
              boxShadow: "0 32px 80px #000000cc, 0 0 0 1px #ffffff0a",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* ════════════════════════════════════════
                COVER ART SECTION
            ════════════════════════════════════════ */}
            <div className="relative overflow-hidden" style={{ height: 300 }}>
              {/* Cover image strip */}
              <div
                className="absolute inset-0 flex"
                style={{
                  transform: "translateX(" + -songIndex * 100 + "%)",
                  transition:
                    "transform " +
                    animDuration +
                    " cubic-bezier(0.65,0,0.35,1)",
                  willChange: "transform",
                }}
              >
                {songs.map((s, i) => (
                  <img
                    key={i}
                    src={s.files.cover}
                    alt={s.songName}
                    className="w-full h-full flex-shrink-0 object-cover pointer-events-none"
                    style={{ minWidth: "100%" }}
                  />
                ))}
              </div>

              {/* Gradient vignette — bottom fade into card */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, " +
                    "transparent 40%, " +
                    cardBg +
                    "cc 80%, " +
                    cardBg +
                    " 100%)",
                }}
              />

              {/* Top row: track counter left, playlist button right */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
                <span
                  className="text-xs font-medium tracking-widest uppercase"
                  style={{
                    color: "#ffffff55",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {songIndex + 1} / {songs.length}
                </span>
                <button
                  className="flex items-center justify-center rounded-full border-0 cursor-pointer"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: "#ffffff18",
                    backdropFilter: "blur(8px)",
                    color: "#ffffffcc",
                    fontSize: 14,
                  }}
                  onClick={() => setIsExpanded((v) => !v)}
                  aria-label={isExpanded ? "Show now playing" : "Show playlist"}
                >
                  <i className="icon-playlist" />
                </button>
              </div>

              {/* Song name + artist — pinned to bottom of cover */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <div
                  className="font-bold leading-tight truncate"
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: 22,
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {currentSong?.songName}
                </div>
                <div
                  className="mt-0.5 text-sm font-medium truncate flex items-center gap-2"
                  style={{ color: "#ffffff88" }}
                >
                  {/* Waveform bars — animated when playing, static when paused */}
                  <span
                    className="flex items-end gap-[2px]"
                    style={{ height: 12 }}
                  >
                    {WAVE_HEIGHTS.map((h, i) => (
                      <span
                        key={i}
                        style={{
                          display: "block",
                          width: 2,
                          height: 12,
                          borderRadius: 2,
                          backgroundColor: isPlayed ? accentColor : "#ffffff44",
                          transformOrigin: "bottom",
                          transform: isPlayed ? undefined : "scaleY(" + h + ")",
                          animation: isPlayed
                            ? "mp_wave_" +
                              uid +
                              " " +
                              (0.7 + i * 0.12) +
                              "s " +
                              i * 0.08 +
                              "s ease-in-out infinite"
                            : "none",
                        }}
                      />
                    ))}
                  </span>
                  {currentSong?.artist}
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════
                CONTROLS SECTION
            ════════════════════════════════════════ */}
            <div
              className="flex flex-col gap-4 px-5 pt-4 pb-5"
              style={{ backgroundColor: cardBg }}
            >
              {/* Progress bar */}
              <div className="flex flex-col gap-1.5">
                <div
                  ref={progressElRef}
                  className={
                    "mp_progress_" +
                    uid +
                    " relative flex items-center cursor-pointer"
                  }
                  style={{ height: 20 }}
                  onPointerDown={(e) => {
                    scrubTo(e);
                    progressBarUpdating.current = true;
                  }}
                >
                  {/* Track background */}
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{ height: 3, backgroundColor: "#ffffff14" }}
                  >
                    {/* Filled portion */}
                    <div
                      className={
                        "mp_track_fill_" + uid + " h-full rounded-full"
                      }
                      style={{
                        width: progressPct + "%",
                        backgroundColor: accentColor,
                        transition: "width 0.1s linear",
                      }}
                    />
                  </div>
                  {/* Scrub thumb */}
                  <div
                    className={
                      "mp_thumb_" +
                      uid +
                      " absolute rounded-full pointer-events-none"
                    }
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#ffffff",
                      left: "calc(" + progressPct + "% - 6px)",
                      opacity: 0,
                      transform: "scale(0.6)",
                      transition: "opacity 0.15s, transform 0.15s",
                      boxShadow: "0 0 8px " + accentColor + "88",
                    }}
                  />
                </div>

                {/* Time stamps */}
                <div className="flex justify-between">
                  <span
                    className="text-[11px] font-medium tabular-nums"
                    style={{ color: "#ffffff44" }}
                  >
                    {currentTime}
                  </span>
                  <span
                    className="text-[11px] font-medium tabular-nums"
                    style={{ color: "#ffffff44" }}
                  >
                    {totalTime}
                  </span>
                </div>
              </div>

              {/* Prev · Play · Next */}
              <div className="flex items-center justify-between px-2">
                {/* Previous */}
                <button
                  className="flex items-center justify-center border-0 bg-transparent cursor-pointer rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    color: songIndex === 0 ? "#ffffff22" : "#ffffff66",
                    fontSize: 22,
                    transition: "color 0.15s, transform 0.1s",
                  }}
                  onClick={() => changeTrack(songIndex - 1)}
                  aria-label="Previous track"
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.88)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <i className="icon-back" />
                </button>

                {/* Play / Pause — the signature breathing button */}
                <button
                  className="flex items-center justify-center rounded-full border-0 cursor-pointer"
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: accentColor,
                    color: "#0f0f11",
                    fontSize: 20,
                    flexShrink: 0,
                    animation: isPlayed
                      ? "mp_breathe_" + uid + " 2.4s ease-in-out infinite"
                      : "none",
                    transition: "transform 0.1s, box-shadow 0.3s",
                    boxShadow: isPlayed
                      ? "0 0 24px 4px " + accentColor + "44"
                      : "none",
                  }}
                  onClick={togglePlay}
                  aria-label={isPlayed ? "Pause" : "Play"}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.92)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <i className={isPlayed ? "icon-pause" : "icon-play"} />
                </button>

                {/* Next */}
                <button
                  className="flex items-center justify-center border-0 bg-transparent cursor-pointer rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    color:
                      songIndex === songs.length - 1
                        ? "#ffffff22"
                        : "#ffffff66",
                    fontSize: 22,
                    transition: "color 0.15s, transform 0.1s",
                  }}
                  onClick={() => changeTrack(songIndex + 1)}
                  aria-label="Next track"
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.88)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <i className="icon-next" />
                </button>
              </div>
            </div>

            {/* ════════════════════════════════════════
                PLAYLIST PANEL (slides up over controls)
            ════════════════════════════════════════ */}
            <div
              className={
                "mp_scroll_" +
                uid +
                " absolute inset-0 overflow-y-auto flex flex-col"
              }
              style={{
                backgroundColor: playlistBg,
                borderRadius,
                transform: isExpanded ? "translateY(0)" : "translateY(100%)",
                transition:
                  "transform " + animDuration + " cubic-bezier(0.65,0,0.35,1)",
                willChange: "transform",
              }}
            >
              {/* Playlist header */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid #ffffff0a" }}
              >
                <span
                  className="font-semibold text-sm tracking-widest uppercase"
                  style={{ color: "#ffffff55", letterSpacing: "0.12em" }}
                >
                  Queue
                </span>
                <button
                  className="flex items-center justify-center rounded-full border-0 cursor-pointer text-xs"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: "#ffffff12",
                    color: "#ffffff88",
                  }}
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close playlist"
                >
                  ✕
                </button>
              </div>

              {/* Song rows */}
              <ul className="list-none m-0 p-3 flex flex-col gap-1">
                {songs.map((s, i) => (
                  <PlaylistRow
                    key={i}
                    uid={uid}
                    song={s}
                    index={i}
                    isActive={i === songIndex}
                    isPlaying={i === songIndex && isPlayed}
                    accentColor={accentColor}
                    waveHeights={WAVE_HEIGHTS}
                    borderRadius={borderRadius}
                    onSelect={() => handlePlaylistSelect(i)}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Global pointer listeners for progress scrub drag */}
      {songs && (
        <ScrubListeners
          progressBarUpdating={progressBarUpdating}
          onScrub={scrubTo}
          getAudio={() => getAudio(songIndex)}
        />
      )}
    </>
  );
}

// ─── PlaylistRow ──────────────────────────────────────────────────────────────
function PlaylistRow({
  uid,
  song,
  index,
  isActive,
  isPlaying,
  accentColor,
  waveHeights,
  borderRadius,
  onSelect,
}) {
  const [duration, setDuration] = useState("");

  function handleLoaded(e) {
    const d = e.target.duration;
    if (!d) return;
    const m = Math.floor(d / 60);
    const s = String(Math.floor(d % 60)).padStart(2, "0");
    setDuration(m + ":" + s);
  }

  return (
    <li
      className={
        "mp_row_" + uid + " cursor-pointer flex items-center gap-3 px-2 py-2"
      }
      onClick={onSelect}
    >
      {/* Hidden audio just to get duration */}
      <audio
        src={song.files.song}
        onLoadedData={handleLoaded}
        className="hidden"
      />

      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <img
          src={song.files.cover}
          alt={song.songName}
          className="block object-cover"
          style={{ width: 44, height: 44, borderRadius: 10 }}
        />
        {/* Active track overlay */}
        {isActive && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              borderRadius: 10,
              backgroundColor: "#00000077",
            }}
          >
            {isPlaying ? (
              /* Waveform bars on active + playing */
              <span className="flex items-end gap-[2px]" style={{ height: 14 }}>
                {waveHeights.map((h, i) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      width: 2,
                      height: 14,
                      borderRadius: 2,
                      backgroundColor: accentColor,
                      transformOrigin: "bottom",
                      animation:
                        "mp_wave_" +
                        uid +
                        " " +
                        (0.7 + i * 0.12) +
                        "s " +
                        i * 0.08 +
                        "s ease-in-out infinite",
                    }}
                  />
                ))}
              </span>
            ) : (
              /* Paused indicator */
              <span className="text-[10px]" style={{ color: accentColor }}>
                ▐▐
              </span>
            )}
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className="text-sm font-semibold truncate"
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            color: isActive ? accentColor : "#ffffffdd",
            letterSpacing: "-0.01em",
          }}
        >
          {song.songName}
        </span>
        <span
          className="text-xs mt-0.5 truncate"
          style={{ color: "#ffffff44", fontFamily: "'Inter', sans-serif" }}
        >
          {song.artist}
        </span>
      </div>

      {/* Duration */}
      <span
        className="text-xs flex-shrink-0 tabular-nums"
        style={{ color: "#ffffff33", fontFamily: "'Inter', sans-serif" }}
      >
        {duration}
      </span>
    </li>
  );
}

function ScrubListeners({ progressBarUpdating, onScrub, getAudio }) {
  useEffect(() => {
    function onMove(e) {
      if (!progressBarUpdating.current) return;
      onScrub(e);
      const a = getAudio();
      if (a) a.muted = true;
    }
    function onUp() {
      if (progressBarUpdating.current) {
        const a = getAudio();
        if (a) a.muted = false;
        progressBarUpdating.current = false;
      }
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
