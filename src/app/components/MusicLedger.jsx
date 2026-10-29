"use client";

import { useEffect, useId, useRef, useState } from "react";

const GSAP_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";

const scriptCache = new Map();

const loadScript = (src) => {
  if (scriptCache.has(src)) return scriptCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = resolve;
    el.onerror = () => {
      scriptCache.delete(src);
      reject(new Error(`Failed: ${src}`));
    };
    document.head.appendChild(el);
  });
  scriptCache.set(src, promise);
  return promise;
};

const PHOTO_IDS = [
  "1595598034023-ca08624ce05d",
  "1781798715946-2e198afc29a7",
  "1725161834547-ba8a90bf5a15",
  "1782806007529-90a2ab4b98d9",
  "1779877716206-f441d5d384d4",
  "1779862946918-a129ac57c60e",
  "1780580940878-248a6ad4b626",
  "1781513747645-757fb2619e57",
  "1780163930838-1502715c3bc1",
  "1780269579991-79bc18ee6f56",
];

const photo = (i) =>
  `https://images.unsplash.com/photo-${PHOTO_IDS[i % PHOTO_IDS.length]}?auto=format&fit=crop&w=1200&q=80`;

const RAW_PROJECTS = [
  { artist: "DEATH ON THE BALCONY", album: "VICE", category: "SINGLE", label: "SELF RELEASED", year: "2023" },
  { artist: "JIMMY WHOO", album: "NIGHTFALL", category: "EP", label: "DEEP HOUSE", year: "2022" },
  { artist: "HERMANOS GUTIÉRREZ", album: "EL BUENO Y EL MALO", category: "ALBUM", label: "EASY EYE SOUND", year: "2022" },
  { artist: "NEIL FRANCES", album: "LINES", category: "ALBUM", label: "ISKA DHAMD", year: "2021" },
  { artist: "ADDEX", album: "MIDNIGHT SESSIONS", category: "EP", label: "ELECTRONIC", year: "2023" },
  { artist: "BEYHUDE", album: "YALNIZLIK", category: "SINGLE", label: "ALBÜM YAPIM", year: "2023" },
  { artist: "THING", album: "SHAPES", category: "ALBUM", label: "KOMPAKT", year: "2021" },
  { artist: "ABAKUS", album: "THAT MUCH CLOSER TO THE SUN", category: "ALBUM", label: "BEATSERVICE", year: "2020" },
  { artist: "SAINTÉ", album: "ANXIETY", category: "SINGLE", label: "PARLOPHONE", year: "2023" },
  { artist: "CANNONS", album: "FEVER DREAM", category: "ALBUM", label: "COLUMBIA", year: "2022" },
  { artist: "BAWO", album: "REAL LIES", category: "EP", label: "NINJA TUNE", year: "2023" },
  { artist: "SUMAC DUB", album: "ECHOES FROM THE VOID", category: "ALBUM", label: "DUB RECORDS", year: "2022" },
  { artist: "LEISURE", album: "THE BIG DOOR", category: "ALBUM", label: "CASCINE", year: "2021" },
  { artist: "MINDCHATTER", album: "IMAGINARY FRIENDS", category: "ALBUM", label: "INDEPENDENT", year: "2023" },
  { artist: "DJ CINÉMA QUARTIER LATIN", album: "NUIT BLANCHE", category: "MIX", label: "KITSUNE", year: "2023" },
  { artist: "EVREN FURTUNA", album: "COSMIC FREQUENCIES", category: "EP", label: "DEEP TECH", year: "2022" },
  { artist: "PABLO BOLIVAR", album: "MEMORIES", category: "ALBUM", label: "SEVEN VILLAS", year: "2021" },
  { artist: "DIALE", album: "FRAGMENTS", category: "EP", label: "AFTERLIFE", year: "2023" },
  { artist: "MARTIN ROTH", album: "REBIRTH", category: "ALBUM", label: "IBOGA", year: "2022" },
  { artist: "KLARTRAUM", album: "LUCID", category: "ALBUM", label: "LUCIDFLOW", year: "2023" },
];

const DEFAULT_PROJECTS = RAW_PROJECTS.map((p, i) => ({
  ...p,
  image: photo(i),
}));

const COLUMNS = ["artist", "album", "category", "label", "year"];

const pad = (n) => String(n).padStart(2, "0");

function ScrambleCell({
  text,
  col,
  active,
  chars,
  duration,
  speed,
  className,
  accentClass,
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }
    const start = performance.now();
    const id = setInterval(() => {
      const progress = Math.min((performance.now() - start) / duration, 1);
      if (progress >= 1) {
        clearInterval(id);
        setDisplay(text);
        return;
      }
      const resolved = Math.floor(progress * text.length);
      let out = text.slice(0, resolved);
      for (let i = resolved; i < text.length; i++) {
        out +=
          text[i] === " "
            ? " "
            : chars[Math.floor(Math.random() * chars.length)];
      }
      setDisplay(out);
    }, speed);
    return () => clearInterval(id);
  }, [active, text, chars, duration, speed]);

  return (
    <span data-col={col} className={className}>
      <span
        aria-hidden="true"
        className={`absolute left-[-8px] top-0 -z-10 h-[calc(100%-2px)] w-[calc(100%+16px)] origin-left scale-x-0 transition-transform duration-300 group-data-[active=true]/row:scale-x-100 ${accentClass}`}
      />
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

export default function MusicLedger({
  projects = DEFAULT_PROJECTS,
  srTitle = "Music Portfolio",
  backgroundColor = "bg-black",
  textColor = "text-white",
  accentColor = "bg-white",
  accentTextColor = "group-data-[active=true]/row:text-black",
  borderColor = "border-white/10",
  activeRowClass = "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(255,255,255,0.25)]",
  fontFamily = "JetBrains Mono",
  fontUrl = "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff2",
  scrambleChars = "qwerty1337h@ck3r",
  scrambleDuration = 800,
  scrambleSpeed = 40,
  bgImageSize = "h-[600px] w-[800px]",
  idleDelay = 3000,
  idleRepeatDelay = 2,
  showNoise = true,
  showScanlines = true,
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [bg, setBg] = useState({ src: "", phase: "out" });

  const rowRefs = useRef([]);
  const noiseId = "noise" + useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    projects.forEach(({ image }) => {
      if (!image) return;
      const img = new Image();
      img.src = image;
    });
  }, [projects]);

  useEffect(() => {
    if (activeIndex === -1) {
      setBg((prev) => ({ ...prev, phase: "out" }));
      return;
    }
    const src = projects[activeIndex]?.image;
    if (!src) return;
    setBg({ src, phase: "reset" });
    let inner;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setBg({ src, phase: "in" }));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [activeIndex, projects]);

  useEffect(() => {
    if (activeIndex !== -1) return;

    let cancelled = false;
    let tl = null;

    const getNodes = () =>
      rowRefs.current.flatMap((row) =>
        row
          ? Array.from(row.querySelectorAll("[data-counter],[data-col]"))
          : [],
      );

    const timer = setTimeout(() => {
      loadScript(GSAP_SRC)
        .then(() => {
          const { gsap } = window;
          if (cancelled || !gsap) return;
          gsap.config({ trialWarn: false });

          const rows = rowRefs.current.filter(Boolean);
          const rowStagger = 0.05;
          const colStagger = 0.25;
          const revealGap = rows.length * rowStagger * 0.5;

          tl = gsap.timeline({ repeat: -1, repeatDelay: idleRepeatDelay });

          rows.forEach((row, i) => {
            const counter = row.querySelector("[data-counter]");
            tl.to(
              counter,
              { duration: 0.1, opacity: 0.05, ease: "power2.inOut" },
              i * rowStagger,
            );
            tl.to(
              counter,
              { duration: 0.1, opacity: 0.6, ease: "power2.inOut" },
              revealGap + i * rowStagger,
            );
          });

          COLUMNS.forEach((col, ci) => {
            const base = (ci + 1) * colStagger;
            rows.forEach((row, ri) => {
              const span = row.querySelector(`[data-col="${col}"]`);
              if (!span) return;
              tl.to(
                span,
                { duration: 0.1, opacity: 0.05, ease: "power2.inOut" },
                base + ri * rowStagger,
              );
              tl.to(
                span,
                { duration: 0.1, opacity: 1, ease: "power2.inOut" },
                base + revealGap + ri * rowStagger,
              );
            });
          });
        })
        .catch((e) =>
          console.error("[MusicLedger] GSAP load failed:", e.message),
        );
    }, idleDelay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (tl) {
        tl.kill();
        window.gsap.set(getNodes(), { clearProps: "opacity" });
      }
    };
  }, [activeIndex, idleDelay, idleRepeatDelay, projects]);

  const fontCss =
    '@font-face{font-family:"' +
    fontFamily +
    '";src:url("' +
    fontUrl +
    '") format("woff2");font-weight:400;font-display:swap;}';

  const bgPhaseClass =
    bg.phase === "reset"
      ? "scale-[1.2] opacity-0 transition-none"
      : bg.phase === "in"
        ? "scale-100 opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        : "scale-100 opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

  const cellClass =
    "relative z-[1] overflow-hidden text-ellipsis whitespace-nowrap p-0.5 leading-none transition-colors duration-300 " +
    accentTextColor;

  return (
    <div
      className={`relative isolate z-10 flex min-h-screen items-center justify-center overflow-hidden text-[12px] font-normal uppercase tracking-[0.05em] ${backgroundColor} ${textColor}`}
      style={{ fontFamily: `"${fontFamily}", monospace` }}
    >
      <style>{fontCss}</style>

      {showScanlines ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[-1] bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.05)_4px)]"
        />
      ) : null}

      {showNoise ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none fixed inset-0 z-[100] opacity-30 mix-blend-overlay ${backgroundColor}`}
        >
          <svg className="h-full w-full">
            <filter id={noiseId}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="4"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
          </svg>
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[-2] flex items-center justify-center"
      >
        {bg.src ? (
          <img
            src={bg.src}
            alt=""
            draggable={false}
            className={`object-cover ${bgImageSize} ${bgPhaseClass}`}
          />
        ) : null}
      </div>

      <main
        className="relative flex w-full flex-col px-4 md:px-8"
        onMouseLeave={() => setActiveIndex(-1)}
      >
        <h1 className="sr-only">{srTitle}</h1>

        <ul className="m-0 w-full list-none p-0">
          {projects.map((p, i) => {
            const isActive = activeIndex === i;
            const dimmed = activeIndex !== -1 && !isActive;
            return (
              <li
                key={i}
                ref={(el) => (rowRefs.current[i] = el)}
                tabIndex={0}
                data-active={isActive}
                onMouseEnter={() => setActiveIndex(i)}
                onFocus={() => setActiveIndex(i)}
                onBlur={() => setActiveIndex(-1)}
                className={`group/row relative grid w-full cursor-pointer grid-cols-[30px_1fr_1fr] items-center gap-x-4 border-b py-3 outline-none transition-opacity duration-300 md:grid-cols-[30px_1fr_1.5fr_0.8fr_0.8fr_60px] min-[1201px]:grid-cols-[40px_1fr_2fr_1fr_1fr_80px] min-[1201px]:gap-x-8 ${borderColor} ${dimmed ? "opacity-30" : "opacity-100"
                  } ${isActive ? activeRowClass : ""}`}
              >
                <span
                  data-counter
                  aria-hidden="true"
                  className="relative z-10 justify-self-start py-1 leading-[0.8] opacity-60"
                >
                  {pad(i + 1)}
                </span>

                <ScrambleCell
                  text={p.artist}
                  col="artist"
                  active={isActive}
                  chars={scrambleChars}
                  duration={scrambleDuration}
                  speed={scrambleSpeed}
                  accentClass={accentColor}
                  className={cellClass}
                />
                <ScrambleCell
                  text={p.album}
                  col="album"
                  active={isActive}
                  chars={scrambleChars}
                  duration={scrambleDuration}
                  speed={scrambleSpeed}
                  accentClass={accentColor}
                  className={cellClass}
                />
                <ScrambleCell
                  text={p.category}
                  col="category"
                  active={isActive}
                  chars={scrambleChars}
                  duration={scrambleDuration}
                  speed={scrambleSpeed}
                  accentClass={accentColor}
                  className={`hidden md:block ${cellClass}`}
                />
                <ScrambleCell
                  text={p.label}
                  col="label"
                  active={isActive}
                  chars={scrambleChars}
                  duration={scrambleDuration}
                  speed={scrambleSpeed}
                  accentClass={accentColor}
                  className={`hidden md:block ${cellClass}`}
                />
                <ScrambleCell
                  text={p.year}
                  col="year"
                  active={isActive}
                  chars={scrambleChars}
                  duration={scrambleDuration}
                  speed={scrambleSpeed}
                  accentClass={accentColor}
                  className={`hidden justify-self-end text-right md:block ${cellClass}`}
                />
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}