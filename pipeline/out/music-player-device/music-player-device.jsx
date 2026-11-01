"use client";

import { useEffect, useRef, useState } from "react";

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=820&q=80`;

const DEFAULT_TRACKS = [
  {
    song: "Happy Happy HardPopCoreTastic",
    band: "Mesostic",
    audio:
      "https://upload.wikimedia.org/wikipedia/commons/6/61/Happy_Happy_HardPopCoreTastic.ogg",
    art: unsplash("photo-1749330513873-09ffa91b0aae"),
  },
  {
    song: "Friendly Evil Gangsta Synth Hip Hop",
    band: "Mesostic",
    audio:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Friendly_Evil_Gangsta_Synth_Hip_Hop.ogg",
    art: unsplash("photo-1627896157734-4d7d4388f28b"),
  },
  {
    song: "Laylat al-Uns",
    band: "Sanaa of Algiers",
    audio: "https://upload.wikimedia.org/wikipedia/commons/6/63/Lalat-u-l-uns.ogg",
    art: unsplash("photo-1778789172736-e8ba37c71124"),
  },
];

const DIAL_TILT = {
  "": "[box-shadow:0px_4px_7px_1px_rgba(255,255,255,0.11)_inset]",
  left: "[transform:rotateY(-6deg)_skew(1deg,-1deg)] [box-shadow:0px_4px_7px_1px_rgba(255,255,255,0.11)_inset,16px_4px_14px_0px_rgba(0,0,0,0.05)_inset]",
  right:
    "[transform:rotateY(6deg)_skew(-1deg,1deg)] [box-shadow:0px_4px_7px_1px_rgba(255,255,255,0.11)_inset,-16px_4px_14px_0px_rgba(0,0,0,0.05)_inset]",
  up: "[transform:rotateX(8deg)] [box-shadow:0px_4px_7px_1px_rgba(255,255,255,0.09)_inset,0px_-4px_14px_0px_rgba(0,0,0,0.05)_inset]",
  down: "[transform:rotateX(-8deg)] [box-shadow:0px_4px_7px_1px_rgba(255,255,255,0.1)_inset,0px_-14px_14px_0px_rgba(0,0,0,0.05)_inset]",
};

const Icon = ({ children, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export default function MusicPlayerDevice({
  tracks = DEFAULT_TRACKS,
  initialVolume = 0.1,
  volumeStep = 0.1,
  playerBg = "linear-gradient(380deg,#1a1a1a 0%,#3C3C3C 100%)",
  innerBg = "linear-gradient(180deg,#1b1b1b 0%,#212121 11.2%,#3A3A3A 100%)",
  dialBg = "linear-gradient(180deg,#292929 0%,#1F1F1F 100%)",
  dialInnerBg = "linear-gradient(175deg,#1F1F1F 3.94%,#2D2D2D 44.59%,#3D3D3D 81.99%)",
  playBtnBg = "linear-gradient(180deg,#292929 0%,#1F1F1F 100%)",
  playBtnOverlayBg = "linear-gradient(189deg,#1F1F1F 6.91%,#2D2D2D 50.27%,#393939 83.66%)",
  width = "697px",
  height = "372px",
  playLabel = "Play",
  pauseLabel = "Pause",
  previousLabel = "Previous track",
  nextLabel = "Next track",
  volumeUpLabel = "Volume up",
  volumeDownLabel = "Volume down",
  className = "",
}) {
  const audioRef = useRef(null);
  const autoplayRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [tilt, setTilt] = useState("");

  const track = tracks[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (autoplayRef.current) audio.play().catch(() => setPlaying(false));
  }, [index, track.audio]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };

  const select = (next) => {
    autoplayRef.current = true;
    setIndex((next + tracks.length) % tracks.length);
  };

  const adjustVolume = (delta) =>
    setVolume((current) => Math.round(Math.min(1, Math.max(0, current + delta)) * 10) / 10);

  const tiltProps = (direction) => ({
    onPointerDown: () => setTilt(direction),
    onPointerUp: () => setTilt(""),
    onPointerLeave: () => setTilt(""),
  });

  const controlClass =
    "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-[#232323]";

  return (
    <div
      className={`flex h-screen w-full items-center justify-center overflow-hidden text-white ${className}`}
    >
      <audio
        ref={audioRef}
        src={track.audio}
        preload="none"
        onPlay={() => {
          autoplayRef.current = true;
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => select(index + 1)}
      />

      <div
        className="relative flex origin-center items-center justify-center rounded-[43px] border-2 border-[#1A1A1A] [background:var(--player-bg)] max-[760px]:scale-[0.85] max-[640px]:scale-[0.7] max-[520px]:scale-[0.55] max-[420px]:scale-[0.45]"
        style={{
          width,
          height,
          "--player-bg": playerBg,
          "--inner-bg": innerBg,
          "--dial-bg": dialBg,
          "--dial-inner-bg": dialInnerBg,
          "--play-bg": playBtnBg,
          "--play-overlay-bg": playBtnOverlayBg,
        }}
      >
        <div className="absolute -bottom-[16%] -z-[2] h-[18%] w-[98%] rounded-[20px] opacity-30 [background:radial-gradient(ellipse_at_center,rgba(115,115,115,0.9)_0%,transparent_70%)]" />

        <div className="flex h-[96%] w-[98%] items-center justify-around rounded-[37px] [background:var(--inner-bg)]">
          <div className="relative z-[2] h-[313px] w-[345px] overflow-hidden rounded-[28px] border-4 border-[#1E1E1E]">
            <img
              src={track.art}
              alt={`${track.song} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute bottom-0 h-[40%] w-full rounded-b-[24px] opacity-[0.89] [background:linear-gradient(180deg,rgba(2,2,2,0)_0%,rgba(2,2,2,0.9)_100%)]">
              <h1 className="mx-5 mb-1 mt-6 truncate text-[28px] [text-shadow:0px_2px_2px_rgba(0,0,0,0.5)]">
                {track.song}
              </h1>
              <p className="mx-5 truncate text-[20px] [text-shadow:0px_2px_4px_rgba(0,0,0,0.4)]">
                {track.band}
              </p>
            </div>

            <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(90deg,rgba(2,2,2,0.1)_0_4px,transparent_4px_6px)] [mask-image:linear-gradient(180deg,#000,transparent)]" />

            <div className="pointer-events-none absolute h-full w-[30%] opacity-40 [background:linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%)] [transform:translateX(128px)_skewX(-30deg)]" />

            <div className="pointer-events-none absolute inset-0 rounded-[24px] [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_-40px_40px_-30px_rgba(0,0,0,0.5)]" />
          </div>

          <div className="mr-[10px] flex h-[254px] w-[254px] items-center justify-center rounded-full border-4 border-[#0D0D0D] [background:var(--dial-bg)] [perspective:120em]">
            <div
              className={`relative h-[236px] w-[236px] rounded-full transition-transform duration-100 ease-in-out [background:var(--dial-inner-bg)] ${DIAL_TILT[tilt]}`}
            >
              <div className="absolute left-1/2 top-1/2 h-[108px] w-[108px] -translate-x-1/2 -translate-y-1/2 rounded-full [background:radial-gradient(circle,rgba(0,0,0,0.75)_62%,transparent_74%)]" />

              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? pauseLabel : playLabel}
                className="absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-0 p-0 transition-transform duration-100 ease-in-out [background:var(--play-bg)] active:scale-[0.96]"
              >
                <span className="absolute left-1/2 top-1/2 flex h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[#232323] [background:var(--play-overlay-bg)] [box-shadow:0px_1px_2px_0px_rgba(255,255,255,0.12)_inset]">
                  {playing ? (
                    <Icon className="h-9 w-9">
                      <rect x="6" y="4" width="4.5" height="16" rx="1.2" />
                      <rect x="13.5" y="4" width="4.5" height="16" rx="1.2" />
                    </Icon>
                  ) : (
                    <Icon className="h-9 w-9">
                      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
                    </Icon>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => select(index - 1)}
                aria-label={previousLabel}
                className={`${controlClass} left-[15%] top-[52%]`}
                {...tiltProps("left")}
              >
                <Icon className="h-7 w-7">
                  <rect x="3" y="4" width="3" height="16" rx="1" />
                  <path d="M20 5v14l-11-7z" />
                </Icon>
              </button>

              <button
                type="button"
                onClick={() => select(index + 1)}
                aria-label={nextLabel}
                className={`${controlClass} right-[-2%] top-[52%]`}
                {...tiltProps("right")}
              >
                <Icon className="h-7 w-7">
                  <rect x="18" y="4" width="3" height="16" rx="1" />
                  <path d="M4 5v14l11-7z" />
                </Icon>
              </button>

              <button
                type="button"
                onClick={() => adjustVolume(volumeStep)}
                aria-label={volumeUpLabel}
                className={`${controlClass} left-1/2 top-[15%]`}
                {...tiltProps("up")}
              >
                <Icon className="h-7 w-7">
                  <rect x="10" y="3" width="4" height="18" rx="1.2" />
                  <rect x="3" y="10" width="18" height="4" rx="1.2" />
                </Icon>
              </button>

              <button
                type="button"
                onClick={() => adjustVolume(-volumeStep)}
                aria-label={volumeDownLabel}
                className={`${controlClass} left-1/2 top-[85%]`}
                {...tiltProps("down")}
              >
                <Icon className="h-7 w-7">
                  <rect x="3" y="10" width="18" height="4" rx="1.2" />
                </Icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}