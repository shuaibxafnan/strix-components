"use client";

import { useEffect, useRef } from "react";

const GSAP_BASE = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/";

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

const FILES = ["hd_1920_1080", "uhd_2560_1440"];

const video = (id, fps) => ({
  sources: fps.flatMap((f) =>
    FILES.map(
      (size) =>
        `https://videos.pexels.com/video-files/${id}/${id}-${size}_${f}fps.mp4`,
    ),
  ),
});

const pexelsStill = (path) =>
  `https://images.pexels.com/videos/${path}?auto=compress&cs=tinysrgb&w=1600`;

const unsplashStill = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=70`;

const DEFAULT_ITEMS = [
  {
    image: pexelsStill("8438294/pexels-photo-8438294.jpeg"),
    videos: [video(8438294, [30]), video(8438292, [30]), video(8438291, [30, 25])],
    titleLines: ["SEA", "AND STONE"],
    titleAccentWord: "STONE",
    subtitleLines: [
      "Rocky coast",
      "Seen from above",
      "Waves breaking on stone",
      "Footage: RDNE Stock project",
    ],
  },
  {
    image: unsplashStill("1502252430442-aac78f397426"),
    videos: [
      video(14386849, [30]),
      video(3177845, [24, 25, 30]),
      video(6062828, [30]),
    ],
    titleLines: ["PINE", "IN FOG"],
    titleAccentWord: "FOG",
    subtitleLines: [
      "Pine forest",
      "Early light",
      "Mist from above",
      "Footage: Max Parada Valdivia, James Cheney, Grzegorz Stalmach",
      "Photo: Paul Pastourmatzis",
    ],
  },
  {
    image: pexelsStill(
      "17833704/desert-dune-dunes-maspalomas-17833704.jpeg",
    ),
    videos: [
      video(17833704, [25]),
      video(17833702, [25, 24, 30]),
      video(17833701, [25, 24, 30]),
    ],
    titleLines: ["SAND", "AND WIND"],
    titleAccentWord: "WIND",
    subtitleLines: [
      "Maspalomas, Gran Canaria",
      "Dunes meeting the sea",
      "Aerial, 4K",
      "Footage: Adrien JACTA",
    ],
  },
];

function TitleLine({ line, accentWord, accentClass }) {
  if (!accentWord || !line.includes(accentWord)) {
    return <div data-line>{line}</div>;
  }
  const [before, after] = line.split(accentWord);
  return (
    <div data-line>
      {before}
      <span className={accentClass}>{accentWord}</span>
      {after}
    </div>
  );
}

function BigTitle({ top, bottom, suffix, accentClass, fontFamily }) {
  return (
    <div
      className="relative flex-1 px-[4vw] pb-[4vw] text-[12.5vw] font-medium uppercase leading-[0.9] text-white"
      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
    >
      {top}
      <br />
      <span className={accentClass}>{bottom}</span>
      {suffix ? ` ${suffix}` : null}
    </div>
  );
}

export default function ScrollTriggerShowcase({
  items = DEFAULT_ITEMS,
  heroImage = unsplashStill("1765871319901-0aaafe3f1a2a"),
  heroTitleTop = "Three",
  heroTitleBottom = "terrains",
  heroTitleSuffix = "",
  footerImage = pexelsStill(
    "8774553/beach-canary-islands-desert-drone-8774553.jpeg",
  ),
  footerTitleTop = "Scroll",
  footerTitleBottom = "back",
  footerTitleSuffix = "up.",
  backgroundColor = "bg-black",
  textColor = "text-white",
  accentColor = "text-white/50",
  displayFontFamily = "Space Grotesk",
  displayFontUrl = "https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-500-normal.woff2",
  bodyFontFamily = "Sora",
  bodyFontUrl = "https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-400-normal.woff2",
  revealDuration = 1.25,
  slideDistance = "100vw",
  imageScaleStart = 1.4,
  imageScaleEnd = 1.2,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let ctx;

    const run = async () => {
      await loadScript(GSAP_BASE + "gsap.min.js");
      await loadScript(GSAP_BASE + "ScrollTrigger.min.js");
      if (cancelled) return;

      const { gsap, ScrollTrigger } = window;
      const root = rootRef.current;
      if (!gsap || !ScrollTrigger || !root) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      ctx = gsap.context(() => {
        const ghosts = gsap.utils.toArray("[data-ghost]");

        gsap.utils.toArray("[data-item]").forEach((item, i) => {
          const ghost = ghosts[i];
          const lines = item.querySelectorAll("[data-line]");
          const image = item.querySelector("[data-image]");
          const tiles = item.querySelectorAll("[data-tile]");
          const players = item.querySelectorAll("video");
          const overlay = item.querySelector("[data-overlay]");

          let playing = false;
          const setPlaying = (on) => {
            if (on === playing) return;
            playing = on;
            players.forEach((p) => {
              if (on && !reduceMotion) p.play().catch(() => { });
              else p.pause();
            });
          };

          gsap.set(image, { scale: imageScaleStart, yPercent: 10 });

          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: ghost,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                onToggle: (self) => {
                  gsap.set(item, {
                    visibility: self.isActive ? "visible" : "hidden",
                  });
                  if (!self.isActive) setPlaying(false);
                },
                onUpdate: (self) =>
                  setPlaying(self.progress > 0.2 && self.progress < 0.8),
              },
            })
            .to(item, { clipPath: "inset(0% 0 0 0)", duration: 175 }, 0)
            .to(image, { scale: imageScaleEnd, duration: 175 }, 0)
            .to(image, { opacity: 0.3, duration: 105 }, 100)
            .fromTo(
              tiles,
              { x: i % 2 === 0 ? slideDistance : `-${slideDistance}` },
              { x: 0, duration: 195 },
              100,
            )
            .to(overlay, { opacity: 1, duration: 85 }, 315)
            .to(tiles, { yPercent: 15, duration: 85 }, 315);

          if (!reduceMotion) {
            gsap.fromTo(
              lines,
              { yPercent: 125, rotate: 2.5 },
              {
                yPercent: 0,
                rotate: 0,
                ease: "power2.inOut",
                duration: revealDuration,
                stagger: 0.06,
                scrollTrigger: {
                  trigger: ghost,
                  start: "top 75%",
                  toggleActions: "play reverse restart reverse",
                },
              },
            );
          }
        });
      }, root);
    };

    run().catch((e) =>
      console.error("[ScrollTriggerShowcase] Setup failed:", e.message),
    );

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
      if (rootRef.current) {
        rootRef.current.querySelectorAll("video").forEach((p) => p.pause());
      }
    };
  }, [revealDuration, slideDistance, imageScaleStart, imageScaleEnd]);

  const fontCss =
    '@font-face{font-family:"' +
    displayFontFamily +
    '";src:url("' +
    displayFontUrl +
    '") format("woff2");font-weight:500;font-display:swap;}' +
    '@font-face{font-family:"' +
    bodyFontFamily +
    '";src:url("' +
    bodyFontUrl +
    '") format("woff2");font-weight:400;font-display:swap;}';

  return (
    <div
      ref={rootRef}
      className={`relative w-full antialiased ${backgroundColor} ${textColor}`}
    >
      <style>{fontCss}</style>

      <section className="sticky top-0 z-0 h-screen">
        <div className="relative flex h-full items-end justify-between">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <BigTitle
            top={heroTitleTop}
            bottom={heroTitleBottom}
            suffix={heroTitleSuffix}
            accentClass={accentColor}
            fontFamily={displayFontFamily}
          />
        </div>
      </section>

      <section className="relative z-10">
        {items.map((item, i) => (
          <div
            key={i}
            data-item
            className="invisible fixed inset-x-0 top-0 flex h-screen w-full items-stretch overflow-hidden bg-black [clip-path:inset(100%_0_0_0)]"
          >
            <img
              data-image
              src={item.image}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-75 will-change-transform"
            />

            <div className="relative flex w-full flex-col gap-4 px-[4vw] py-[2vw]">
              <div className="relative z-[1] flex flex-1 items-center justify-center gap-[2.5vw]">
                {item.videos.map((v, vi) => (
                  <div
                    key={vi}
                    data-tile
                    className="relative aspect-video flex-1 overflow-hidden bg-neutral-900 will-change-transform"
                  >
                    <video
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      disablePictureInPicture
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                    >
                      {v.sources.map((src) => (
                        <source
                          key={src}
                          src={src}
                          type={
                            src.endsWith(".webm") ? "video/webm" : "video/mp4"
                          }
                        />
                      ))}
                    </video>
                  </div>
                ))}
              </div>

              <div className="relative flex w-full items-end justify-between pt-[4vw]">
                <div
                  className="relative flex flex-col text-[8vw] font-medium uppercase leading-none text-white"
                  style={{ fontFamily: `"${displayFontFamily}", sans-serif` }}
                >
                  {item.titleLines.map((line, li) => (
                    <div key={li} className="overflow-hidden">
                      <TitleLine
                        line={line}
                        accentWord={item.titleAccentWord}
                        accentClass={item.titleAccentClass ?? accentColor}
                      />
                    </div>
                  ))}
                </div>

                <div
                  className="flex max-w-[28vw] flex-col gap-[0.5vw] pb-[0.5vw] pr-[1vw] text-[0.8rem] uppercase leading-snug text-white"
                  style={{ fontFamily: `"${bodyFontFamily}", sans-serif` }}
                >
                  {item.subtitleLines.map((line, li) => (
                    <div key={li} className="overflow-hidden">
                      <div data-line>{line}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              data-overlay
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[2] bg-black opacity-0"
            />
          </div>
        ))}

        <div>
          {items.map((_, i) => (
            <div key={i} data-ghost className="h-[300vh] w-full" />
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-black">
        <div className="relative flex h-screen items-end justify-between">
          <img
            src={footerImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <BigTitle
            top={footerTitleTop}
            bottom={footerTitleBottom}
            suffix={footerTitleSuffix}
            accentClass={accentColor}
            fontFamily={displayFontFamily}
          />
        </div>
      </section>
    </div>
  );
}