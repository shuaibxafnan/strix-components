"use client";

import { useEffect, useRef, useState, useId } from "react";

// ─── MusicPlayer ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// tracks           array    (see default)   Array of { song, band, audio, art } objects.
//                                           Each entry needs:
//                                             song  – track title string
//                                             band  – artist / band string
//                                             audio – URL to an mp3 preview
//                                             art   – URL to album-art image
//
// initialVolume    number   0.1             Starting playback volume (0–1).
//
// volumeStep       number   0.1             How much each vol-up/down tap changes
//                                           the volume (0–1).
//
// playerBg         string   "linear-gradient(380deg,#1a1a1a 0%,#3C3C3C 100%)"
//                                           CSS background for the outer shell.
//
// innerBg          string   "linear-gradient(180deg,#1b1b1b 0%,#212121 11.2%,#3A3A3A 100%)"
//                                           CSS background for the inner face.
//
// dialBg           string   "linear-gradient(180deg,#292929 0%,#1F1F1F 100%)"
//                                           CSS background for the d-pad ring.
//
// dialInnerBg      string   "linear-gradient(175deg,#1F1F1F 3.94%,#2D2D2D 44.59%,#3D3D3D 81.99%)"
//                                           CSS background for the d-pad inner disc.
//
// playBtnBg        string   "linear-gradient(180deg,#292929 0%,#1F1F1F 100%)"
//                                           CSS background for the centre play button.
//
// playBtnOverlayBg string   "linear-gradient(189deg,#1F1F1F 6.91%,#2D2D2D 50.27%,#393939 83.66%)"
//                                           CSS background for the play-button inner ring.
//
// width            string   "697px"         Outer player width (any CSS unit).
//
// height           string   "372px"         Outer player height (any CSS unit).
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_TRACKS = [
  {
    song: "Firestarter",
    band: "The Prodigy",
    audio:
      "https://p.scdn.co/mp3-preview/d2a34db8cc02a4839e7399a887d9a7abe9b0b75b?cid=967262c52b234de4a4d053b9a3c43704",
    art: "https://i.scdn.co/image/ab67616d0000b2737bb4dd1d02346ec2321a41d6",
  },
  {
    song: "Dance",
    band: "Justice",
    audio:
      "https://p.scdn.co/mp3-preview/0412ef6b21192bc79fc1fb3389d8c95172e2c2bf?cid=967262c52b234de4a4d053b9a3c43704",
    art: "https://i.scdn.co/image/ab67616d0000b2731c0bcf8b536295438d26c70d",
  },
  {
    song: "Where's Your Head At",
    band: "Basement Jaxx",
    audio:
      "https://p.scdn.co/mp3-preview/d1601f47f376497319dab1e7da3678c8a818f8d7?cid=967262c52b234de4a4d053b9a3c43704",
    art: "https://i.scdn.co/image/ab67616d0000b2737a9214e709915022f75a9044",
  },
];

const SCREEN_LINE_COUNT = 59;

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
}) {
  const uid = useId();
  const id = (name) => `mp-${uid}-${name}`;

  const audioRefs = useRef([]);
  const playingRef = useRef(null);

  const [songPlaying, setSongPlaying] = useState(0);
  const [dialTilt, setDialTilt] = useState("");
  const [playPressed, setPlayPressed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // keep audio refs in sync with track count
  useEffect(() => {
    audioRefs.current = audioRefs.current.slice(0, tracks.length);
  }, [tracks]);

  function toggleAudio(idx) {
    const current = audioRefs.current[idx];
    if (!current) return;

    if (playingRef.current && playingRef.current !== current) {
      playingRef.current.pause();
    }

    if (current.paused) {
      current.volume = initialVolume;
      current.play();
      playingRef.current = current;
    } else {
      current.pause();
      playingRef.current = null;
    }
  }

  function goBack() {
    const next = songPlaying !== 0 ? songPlaying - 1 : tracks.length - 1;
    if (playingRef.current) {
      playingRef.current.pause();
      playingRef.current = null;
    }
    setSongPlaying(next);
    const audio = audioRefs.current[next];
    if (audio) {
      audio.volume = initialVolume;
      audio.play();
      playingRef.current = audio;
    }
  }

  function goForward() {
    const next = songPlaying !== tracks.length - 1 ? songPlaying + 1 : 0;
    if (playingRef.current) {
      playingRef.current.pause();
      playingRef.current = null;
    }
    setSongPlaying(next);
    const audio = audioRefs.current[next];
    if (audio) {
      audio.volume = initialVolume;
      audio.play();
      playingRef.current = audio;
    }
  }

  function adjustVolume(delta) {
    const audio = audioRefs.current[songPlaying];
    if (!audio) return;
    const next = Math.min(1, Math.max(0, audio.volume + delta));
    audio.volume = Math.round(next * 10) / 10;
  }

  // dial tilt box-shadow per direction
  const dialShadowMap = {
    left: "0px 4px 7px 1px rgba(255,255,255,0.11) inset, 16px 4px 14px 0px rgba(0,0,0,0.05) inset",
    right:
      "0px 4px 7px 1px rgba(255,255,255,0.11) inset, -16px 4px 14px 0px rgba(0,0,0,0.05) inset",
    up: "0px 4px 7px 1px rgba(255,255,255,0.09) inset, 0px -4px 14px 0px rgba(0,0,0,0.05) inset",
    down: "0px 4px 7px 1px rgba(255,255,255,0.1) inset, 0px -14px 14px 0px rgba(0,0,0,0.05) inset",
    "": "0px 4px 7px 1px rgba(255,255,255,0.11) inset",
  };

  const dialTransformMap = {
    left: "rotateY(-6deg) skew(1deg,-1deg)",
    right: "rotateY(6deg) skew(-1deg,1deg)",
    up: "rotateX(8deg)",
    down: "rotateX(-8deg)",
    "": "none",
  };

  const track = tracks[songPlaying];

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center w-full h-screen font-['Source_Sans_Pro',sans-serif] text-white">
      {/* hidden audio elements */}
      {tracks.map((t, i) => (
        <audio
          key={i}
          ref={(el) => (audioRefs.current[i] = el)}
          src={t.audio}
        />
      ))}

      <style>{`
        .${id("scrn-line")} {
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, rgba(2,2,2,0.10) 0%, rgba(2,2,2,0.00) 100%);
          filter: blur(0.5px);
        }
        .${id("player")}::before {
          content: "";
          z-index: -2;
          width: 98%;
          height: 18%;
          border-radius: 20px;
          opacity: 0.3;
          filter: blur(4px);
          background: linear-gradient(180deg, #727272 0%, rgba(115,115,115,0.00) 100%);
          position: absolute;
          bottom: -16%;
        }
      `}</style>

      {/* outer shell */}
      <div
        className={
          "relative flex items-center justify-center rounded-[43px] border-2 border-[#1A1A1A] " +
          id("player")
        }
        style={{ width, height, background: playerBg }}
      >
        {/* noise texture */}
        <div
          className="absolute z-[1] w-full h-full rounded-[40px] mix-blend-multiply opacity-25 pointer-events-none"
          style={{
            background:
              "url(https://upload.wikimedia.org/wikipedia/commons/9/9a/512x512_Dissolve_Noise_Texture.png)",
          }}
        />

        {/* inner face */}
        <div
          className="flex justify-around items-center w-[98%] h-[96%] rounded-[37px]"
          style={{ background: innerBg }}
        >
          {/* album artwork */}
          <div
            className="relative z-[2] w-[345px] h-[313px] rounded-[28px] border-4 border-[#1E1E1E] bg-cover bg-center transition-[background-image] duration-200 ease-in-out"
            style={{ backgroundImage: `url(${track.art})` }}
          >
            {/* song title / artist overlay */}
            <div
              className="absolute w-full h-[40%] bottom-0 opacity-[0.89] rounded-b-[24px] blur-[0.6px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(2,2,2,0.0) 0%, rgba(2,2,2,0.90) 100%)",
              }}
            >
              <h1
                className="text-[28px] mx-5 mt-6 mb-1"
                style={{ textShadow: "0px 2px 2px rgba(0,0,0,0.50)" }}
              >
                {track.song}
              </h1>
              <p
                className="text-[20px] mx-5"
                style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.40)" }}
              >
                {track.band}
              </p>
            </div>

            {/* scan-line effect */}
            <div className="absolute flex gap-[2px] rounded-[30px] w-full h-full">
              {Array.from({ length: SCREEN_LINE_COUNT }).map((_, i) => (
                <div key={i} className={id("scrn-line")} />
              ))}
            </div>

            {/* reflection streak */}
            <div
              className="absolute w-[30%] h-full opacity-40 blur-[2.4px]"
              style={{
                transform: "translateX(128px) skewX(-30deg)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.00) 100%)",
              }}
            />

            {/* border chrome SVGs */}
            <div className="flex flex-col justify-between w-full h-full blur-[1px]">
              <svg
                width="345"
                height="143"
                viewBox="0 0 345 143"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M340.505 143H345V28C345 12.536 332.464 2.37738e-05 317 2.25623e-05L29 0C12.9838 -1.25474e-06 1.2684e-05 12.9837 1.11215e-05 29L0 143H4.495L4.49501 33.0273C4.49501 17.0111 17.4788 4.02734 33.495 4.02734L312.505 4.02737C327.969 4.02737 340.505 16.5634 340.505 32.0274V143Z"
                  fill="url(#a1)"
                  fillOpacity="0.5"
                />
                <defs>
                  <linearGradient
                    id="a1"
                    x1="172.5"
                    y1="143"
                    x2="172.5"
                    y2="1.35139e-05"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#D9D9D9" stopOpacity="0" />
                    <stop offset="0.786458" stopColor="#D9D9D9" />
                  </linearGradient>
                </defs>
              </svg>
              <svg
                width="345"
                height="145"
                viewBox="0 0 345 135"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.34951 0H0V114C0 129.464 12.536 142 28 142H316C332.016 142 345 129.016 345 113V0H341.65V110C341.65 126.016 328.667 139 312.65 139H31.3495C15.8856 139 3.34951 126.464 3.34951 111V0Z"
                  fill="url(#a2)"
                  fillOpacity="0.5"
                />
                <defs>
                  <linearGradient
                    id="a2"
                    x1="172.5"
                    y1="0"
                    x2="172.5"
                    y2="149"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopOpacity="0" />
                    <stop offset="0.786458" stopColor="#0D0D0D" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* d-pad control ring */}
          <div
            className="flex items-center justify-center w-[254px] h-[254px] mr-[10px] border-4 border-[#0D0D0D] rounded-full"
            style={{ background: dialBg, perspective: "120em" }}
          >
            {/* inner disc — tilts on press */}
            <div
              className="relative w-[236px] h-[236px] rounded-full transition-transform duration-100 ease-in-out"
              style={{
                background: dialInnerBg,
                boxShadow: dialShadowMap[dialTilt],
                transform: dialTransformMap[dialTilt],
              }}
            >
              {/* play button shadow */}
              <div
                className="absolute w-[108px] h-[108px] rounded-full blur-[1.5px]"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  background: "rgba(0,0,0,0.70)",
                }}
              />

              {/* play / pause button */}
              <div
                className="cursor-pointer absolute w-[100px] h-[100px] rounded-full transition-transform duration-100 ease-in-out"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: playPressed
                    ? "translate(-50%,-50%) scale(0.96)"
                    : "translate(-50%,-50%)",
                  background: playBtnBg,
                }}
                onClick={() => toggleAudio(songPlaying)}
                onMouseDown={() => setPlayPressed(true)}
                onMouseUp={() => setPlayPressed(false)}
                onMouseLeave={() => setPlayPressed(false)}
              >
                <div
                  className="absolute w-[86px] h-[86px] rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    background: playBtnOverlayBg,
                    boxShadow: "0px 1px 2px 0px rgba(255,255,255,0.12) inset",
                  }}
                >
                  {/* play/pause icon */}
                  <div
                    className="absolute flex items-center justify-center w-[40px] h-[40px] rounded-full"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                    }}
                  >
                    <svg
                      width="48"
                      height="31"
                      viewBox="0 0 48 31"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g filter="url(#pi_f0)">
                        <path
                          d="M2 25.7434V3.31956C2 1.81294 3.60276 0.847294 4.93472 1.55143L26.5854 12.9969C28.0194 13.7551 28.0019 15.8153 26.5551 16.5489L4.9045 27.5272C3.57407 28.2018 2 27.2351 2 25.7434Z"
                          fill="#232323"
                        />
                      </g>
                      <g filter="url(#pi_f1)">
                        <path
                          d="M40 26V3C40 1.89543 40.8954 1 42 1H44C45.1046 1 46 1.89543 46 3V26C46 27.1046 45.1046 28 44 28H42C40.8954 28 40 27.1046 40 26Z"
                          fill="#232323"
                        />
                      </g>
                      <g filter="url(#pi_f2)">
                        <path
                          d="M30 26V3C30 1.89543 30.8954 1 32 1H34C35.1046 1 36 1.89543 36 3V26C36 27.1046 35.1046 28 34 28H32C30.8954 28 30 27.1046 30 26Z"
                          fill="#232323"
                        />
                      </g>
                      <defs>
                        <filter
                          id="pi_f0"
                          x="0"
                          y="0.316406"
                          width="29.6504"
                          height="30.4297"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="1" />
                          <feGaussianBlur stdDeviation="1" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow"
                            result="shape"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="1" />
                          <feGaussianBlur stdDeviation="1.5" />
                          <feComposite
                            in2="hardAlpha"
                            operator="arithmetic"
                            k2="-1"
                            k3="1"
                          />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="shape"
                            result="effect2_innerShadow"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="-2" />
                          <feGaussianBlur stdDeviation="0.5" />
                          <feComposite
                            in2="hardAlpha"
                            operator="arithmetic"
                            k2="-1"
                            k3="1"
                          />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.46 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="effect2_innerShadow"
                            result="effect3_innerShadow"
                          />
                        </filter>
                        <filter
                          id="pi_f1"
                          x="38"
                          y="0"
                          width="10"
                          height="31"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="1" />
                          <feGaussianBlur stdDeviation="1" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow"
                            result="shape"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="1" />
                          <feGaussianBlur stdDeviation="1.5" />
                          <feComposite
                            in2="hardAlpha"
                            operator="arithmetic"
                            k2="-1"
                            k3="1"
                          />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="shape"
                            result="effect2_innerShadow"
                          />
                        </filter>
                        <filter
                          id="pi_f2"
                          x="28"
                          y="0"
                          width="10"
                          height="31"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="1" />
                          <feGaussianBlur stdDeviation="1" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow"
                            result="shape"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="1" />
                          <feGaussianBlur stdDeviation="1.5" />
                          <feComposite
                            in2="hardAlpha"
                            operator="arithmetic"
                            k2="-1"
                            k3="1"
                          />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="shape"
                            result="effect2_innerShadow"
                          />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              {/* skip back */}
              <div
                className="cursor-pointer absolute"
                style={{
                  top: "52%",
                  left: "15%",
                  transform: "translate(-50%,-50%)",
                }}
                onClick={goBack}
                onMouseDown={() => setDialTilt("left")}
                onMouseUp={() => setDialTilt("")}
                onMouseLeave={() => setDialTilt("")}
              >
                <svg
                  width="40"
                  height="25"
                  viewBox="0 0 40 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#sl_f)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7 9.79778L7 3C7 1.89543 6.10457 0.999997 5 0.999997L4 0.999997C2.89543 0.999997 2 1.89543 2 3L2 20C2 21.1046 2.89543 22 4 22L5 22C6.10457 22 7 21.1046 7 20L7 12.8382C7.107 12.9288 7.22633 13.0104 7.35802 13.0809L21.0553 20.4218C22.3876 21.1359 24 20.1706 24 18.659L24 14.4969L35.0553 20.4218C36.3876 21.1359 38 20.1706 38 18.659L38 4.27691C38 2.78036 36.4166 1.81396 35.0856 2.49817L24 8.19687L24 4.27691C24 2.78035 22.4166 1.81396 21.0856 2.49817L7.38839 9.5394C7.24469 9.61327 7.11522 9.70027 7 9.79778Z"
                      fill="url(#sl_g)"
                    />
                  </g>
                  <defs>
                    <filter
                      id="sl_f"
                      x="0"
                      y="0"
                      width="40"
                      height="25"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect2_innerShadow"
                      />
                    </filter>
                    <linearGradient
                      id="sl_g"
                      x1="20"
                      y1="9"
                      x2="26"
                      y2="29"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#282828" />
                      <stop offset="1" stopColor="#1E1D1D" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* skip forward */}
              <div
                className="cursor-pointer absolute"
                style={{
                  top: "52%",
                  right: "-2%",
                  transform: "translate(-50%,-50%)",
                }}
                onClick={goForward}
                onMouseDown={() => setDialTilt("right")}
                onMouseUp={() => setDialTilt("")}
                onMouseLeave={() => setDialTilt("")}
              >
                <svg
                  width="40"
                  height="25"
                  viewBox="0 0 40 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#sr_f)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M33 13.2022V20C33 21.1046 33.8954 22 35 22H36C37.1046 22 38 21.1046 38 20V3C38 1.89543 37.1046 1 36 1H35C33.8954 1 33 1.89543 33 3V10.1618C32.893 10.0712 32.7737 9.98964 32.642 9.91906L18.9447 2.5782C17.6124 1.86415 16 2.82937 16 4.341V8.50312L4.94475 2.5782C3.61241 1.86415 2 2.82937 2 4.341V18.7231C2 20.2196 3.58339 21.186 4.91438 20.5018L16 14.8031V18.7231C16 20.2196 17.5834 21.186 18.9144 20.5018L32.6116 13.4606C32.7553 13.3867 32.8848 13.2997 33 13.2022Z"
                      fill="#232323"
                    />
                  </g>
                  <defs>
                    <filter
                      id="sr_f"
                      x="0"
                      y="0"
                      width="40"
                      height="25"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect2_innerShadow"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>

              {/* volume up */}
              <div
                className="cursor-pointer absolute"
                style={{
                  top: "15%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
                onClick={() => adjustVolume(volumeStep)}
                onMouseDown={() => setDialTilt("up")}
                onMouseUp={() => setDialTilt("")}
                onMouseLeave={() => setDialTilt("")}
              >
                <svg
                  width="32"
                  height="31"
                  viewBox="0 0 32 31"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#vu_f)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19 11.5V3C19 1.89543 18.1046 1 17 1H15C13.8954 1 13 1.89543 13 3L13 11.5H4.5C3.39543 11.5 2.5 12.3954 2.5 13.5V15.5C2.5 16.6046 3.39543 17.5 4.5 17.5H13L13 26C13 27.1046 13.8954 28 15 28H17C18.1046 28 19 27.1046 19 26V17.5H27.5C28.6046 17.5 29.5 16.6046 29.5 15.5V13.5C29.5 12.3954 28.6046 11.5 27.5 11.5H19Z"
                      fill="#1C1C1C"
                    />
                  </g>
                  <defs>
                    <filter
                      id="vu_f"
                      x="0.5"
                      y="0"
                      width="31"
                      height="31"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.13 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect2_innerShadow"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>

              {/* volume down */}
              <div
                className="cursor-pointer absolute"
                style={{
                  top: "85%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
                onClick={() => adjustVolume(-volumeStep)}
                onMouseDown={() => setDialTilt("down")}
                onMouseUp={() => setDialTilt("")}
                onMouseLeave={() => setDialTilt("")}
              >
                <svg
                  width="32"
                  height="11"
                  viewBox="0 0 32 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#vd_f)">
                    <path
                      d="M4.5 1.5L27.5 1.5C28.6046 1.5 29.5 2.39543 29.5 3.5L29.5 5.5C29.5 6.60457 28.6046 7.5 27.5 7.5L4.5 7.5C3.39543 7.5 2.5 6.60457 2.5 5.5L2.5 3.5C2.5 2.39543 3.39543 1.5 4.5 1.5Z"
                      fill="#262626"
                    />
                  </g>
                  <defs>
                    <filter
                      id="vd_f"
                      x="0.5"
                      y="0.5"
                      width="31"
                      height="10"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.13 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect2_innerShadow"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
