"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

const GSAP_BASE = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/";
const LENIS_SRC = "https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js";

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

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const DEFAULT_PROJECTS = [
  { id: 1, title: "Silence", year: "2021", image: photo("1595598034023-ca08624ce05d") },
  { id: 2, title: "Resonance", year: "2022", image: photo("1781798715946-2e198afc29a7") },
  { id: 3, title: "Essence", year: "2022", image: photo("1725161834547-ba8a90bf5a15") },
  { id: 4, title: "Void", year: "2023", image: photo("1782806007529-90a2ab4b98d9") },
  { id: 5, title: "Presence", year: "2023", image: photo("1779877716206-f441d5d384d4") },
  { id: 6, title: "Flow", year: "2024", image: photo("1779862946918-a129ac57c60e") },
  { id: 7, title: "Clarity", year: "2024", image: photo("1780580940878-248a6ad4b626") },
  { id: 8, title: "Breath", year: "2024", image: photo("1781513747645-757fb2619e57") },
  { id: 9, title: "Stillness", year: "2025", image: photo("1780163930838-1502715c3bc1") },
  { id: 10, title: "Surrender", year: "2025", image: photo("1780269579991-79bc18ee6f56") },
];

const CLIP_HIDDEN = "inset(100% 0% 0% 0%)";
const CLIP_SHOWN = "inset(-10% -10% -10% -10%)";
const EASE_OUT = "power2.out";

function Wordmark({ text, dataKey, className }) {
  return (
    <div role="img" aria-label={text} className={className}>
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          {...{ [dataKey]: "" }}
          className="inline-block [clip-path:inset(100%_0_0_0)]"
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export default function NoirLenisShowcase({
  projects = DEFAULT_PROJECTS,
  initialView = "list",
  logoText = "NOIR",
  sectionLabel = "SELECTED WORKS",
  sectionCount = projects.length,
  listLabel = "List",
  gridLabel = "Grid",
  footerTagline = "Find the essence in simplicity,",
  footerBold = "Create without boundaries.",
  backgroundColor = "bg-black",
  textColor = "text-white",
  wipeColor = "bg-white",
  borderColor = "border-white/10",
  footerBackground = "bg-white",
  footerTextColor = "text-black",
  popupBg = "bg-black/90",
  popupFade = "duration-500",
  popupSwitch = "duration-100",
  fontFamily = "Inter Tight",
  fontUrlRegular = "https://cdn.jsdelivr.net/fontsource/fonts/inter-tight@latest/latin-400-normal.woff2",
  fontUrlBold = "https://cdn.jsdelivr.net/fontsource/fonts/inter-tight@latest/latin-700-normal.woff2",
  logoRevealDelay = 0.3,
  logoRevealStagger = 0.15,
  itemEntryStagger = 0.08,
}) {
  const [view, setView] = useState(initialView);
  const [hoveredId, setHoveredId] = useState(null);

  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let ctx;
    let lenis;
    let tick;

    const start = async () => {
      await loadScript(GSAP_BASE + "gsap.min.js");
      await Promise.allSettled([
        loadScript(GSAP_BASE + "ScrollTrigger.min.js"),
        loadScript(GSAP_BASE + "Flip.min.js"),
        loadScript(LENIS_SRC),
      ]);
      if (cancelled) return;

      const { gsap, ScrollTrigger, Flip, Lenis } = window;
      if (!gsap || !rootRef.current) return;
      gsap.registerPlugin(...[ScrollTrigger, Flip].filter(Boolean));

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      ctx = gsap.context(() => {
        if (Lenis && !reduceMotion) {
          lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,
          });
          if (ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
          tick = (time) => lenis.raf(time * 1000);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
        }

        gsap.set("[data-item]", { opacity: 0, y: 30 });
        gsap.set("[data-footer-line]", { opacity: 0, y: 20 });
        gsap.set(rootRef.current, { autoAlpha: 1 });

        gsap.to("[data-header-letter]", {
          clipPath: CLIP_SHOWN,
          duration: 1.2,
          ease: EASE_OUT,
          stagger: logoRevealStagger,
          delay: logoRevealDelay,
        });

        gsap.to("[data-item]", {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: EASE_OUT,
          stagger: { each: itemEntryStagger, from: "start" },
          delay: logoRevealDelay,
          clearProps: "transform,opacity",
        });

        if (ScrollTrigger) {
          ScrollTrigger.create({
            trigger: "[data-footer-logo]",
            start: "top 80%",
            once: true,
            onEnter: () =>
              gsap.to("[data-footer-letter]", {
                clipPath: CLIP_SHOWN,
                duration: 1.2,
                ease: EASE_OUT,
                stagger: logoRevealStagger,
              }),
          });

          ScrollTrigger.create({
            trigger: "[data-footer-header]",
            start: "top 85%",
            once: true,
            onEnter: () =>
              gsap.to("[data-footer-line]", {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: EASE_OUT,
                stagger: 0.2,
              }),
          });
        }
      }, rootRef.current);
    };

    start().catch((err) => {
      console.error("[NoirLenisShowcase] Setup failed:", err.message);
      if (rootRef.current) rootRef.current.style.visibility = "visible";
    });

    return () => {
      cancelled = true;
      clearTimeout(hideTimerRef.current);
      const { gsap } = window;
      if (gsap && tick) gsap.ticker.remove(tick);
      if (lenis) lenis.destroy();
      if (ctx) ctx.revert();
    };
  }, [logoRevealDelay, logoRevealStagger, itemEntryStagger]);

  const showPopup = (id) => {
    clearTimeout(hideTimerRef.current);
    if (!isAnimatingRef.current) setHoveredId(id);
  };

  const hidePopup = () => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setHoveredId(null), 150);
  };

  const toggleView = (next) => {
    if (view === next || isAnimatingRef.current) return;

    clearTimeout(hideTimerRef.current);
    setHoveredId(null);

    const { gsap, Flip } = window;
    const container = containerRef.current;
    if (!gsap || !Flip || !container) {
      setView(next);
      return;
    }

    isAnimatingRef.current = true;

    const finish = () => {
      isAnimatingRef.current = false;
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };

    const runFlip = () => {
      const state = Flip.getState(container.querySelectorAll("[data-sw]"));
      flushSync(() => setView(next));

      const images = container.querySelectorAll("[data-sw-image]");
      if (next === "grid") gsap.set(images, { clipPath: CLIP_HIDDEN });

      Flip.from(state, {
        duration: 1,
        ease: EASE_OUT,
        absolute: true,
        nested: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: EASE_OUT },
          ),
        onLeave: (els) =>
          gsap.to(els, { opacity: 0, duration: 0.5, ease: EASE_OUT }),
        onComplete: () => {
          if (next === "grid") {
            gsap.to(images, {
              clipPath: CLIP_SHOWN,
              duration: 1,
              ease: EASE_OUT,
              stagger: 0.06,
              onComplete: finish,
            });
          } else {
            finish();
          }
        },
      });
    };

    if (next === "list") {
      gsap.to(container.querySelectorAll("[data-sw-image]"), {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.6,
        ease: EASE_OUT,
        stagger: 0.04,
        onComplete: runFlip,
      });
    } else {
      runFlip();
    }
  };

  const fontCss =
    '@font-face{font-family:"' +
    fontFamily +
    '";src:url("' +
    fontUrlRegular +
    '") format("woff2");font-weight:400;font-display:swap;}' +
    '@font-face{font-family:"' +
    fontFamily +
    '";src:url("' +
    fontUrlBold +
    '") format("woff2");font-weight:700;font-display:swap;}';

  const isList = view === "list";

  return (
    <div
      ref={rootRef}
      className={`invisible relative w-full overflow-x-hidden text-[1.8rem] font-bold uppercase tracking-[-0.03em] antialiased ${backgroundColor} ${textColor}`}
      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
    >
      <style>{fontCss}</style>

      <main className="w-full">
        <div className="grid w-full grid-cols-12 gap-4 px-8">
          <Wordmark
            text={logoText}
            dataKey="data-header-letter"
            className="col-span-12 my-16 flex min-h-[60vh] items-start whitespace-nowrap text-[26vw] leading-[0.9]"
          />

          <div className="col-span-12 mb-16 flex items-center justify-between">
            <h1 className="m-0 text-[2.5rem] md:text-[4rem]">
              {sectionLabel}
              <sup className="ml-2 text-[1.25rem] md:text-[2rem]">
                {sectionCount}
              </sup>
            </h1>

            <div className="flex gap-8">
              {[
                ["list", listLabel],
                ["grid", gridLabel],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={view === key}
                  onClick={() => toggleView(key)}
                  className={`cursor-pointer py-3 text-[1.4rem] transition-opacity duration-300 ${view === key ? "opacity-100" : "opacity-50"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={containerRef}
            className={`col-span-12 mb-[20vh] min-h-screen ${isList
                ? "flex flex-col"
                : "grid grid-cols-5 gap-8 max-[1200px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1"
              }`}
          >
            {projects.map((project, i) => (
              <div
                key={project.id}
                data-sw
                data-item
                onMouseEnter={isList ? () => showPopup(project.id) : undefined}
                onMouseLeave={isList ? hidePopup : undefined}
                className={`group relative cursor-pointer will-change-transform ${isList
                    ? `flex justify-between overflow-hidden border-b py-8 ${borderColor}`
                    : "flex flex-col"
                  }`}
              >
                {isList ? (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute bottom-0 left-0 z-[1] h-0 w-full transition-[height] duration-[800ms] ease-[cubic-bezier(0.445,0.05,0.55,0.95)] group-hover:h-full group-hover:duration-200 ${wipeColor}`}
                  />
                ) : null}

                <div
                  data-sw
                  onMouseEnter={
                    isList ? undefined : () => showPopup(project.id)
                  }
                  onMouseLeave={isList ? undefined : hidePopup}
                  className={
                    isList
                      ? "hidden"
                      : `relative mb-4 w-full overflow-hidden ${i % 2 === 0 ? "aspect-square" : "aspect-[2/3]"
                      }`
                  }
                >
                  <img
                    data-sw-image
                    src={project.image}
                    alt={project.title}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>

                <div
                  data-sw
                  className={
                    isList
                      ? "relative z-[2] text-[1.8rem] mix-blend-exclusion"
                      : "mb-1 text-[1.6rem]"
                  }
                >
                  {project.title}
                </div>

                <div
                  data-sw
                  className={
                    isList
                      ? "relative z-[2] text-[1.8rem] mix-blend-exclusion"
                      : "text-[1.4rem] opacity-70"
                  }
                >
                  {project.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center transition-opacity ${popupFade} ${popupBg} ${hoveredId !== null ? "opacity-100" : "opacity-0"
          }`}
      >
        <div
          className={`relative aspect-video w-[70vw] max-w-[640px] overflow-hidden md:w-[40vw] ${backgroundColor}`}
        >
          {projects.map((project) => (
            <img
              key={project.id}
              src={project.image}
              alt=""
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity ${popupSwitch} ${hoveredId === project.id ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
        </div>
      </div>

      <footer
        className={`relative flex min-h-[75vh] w-full flex-col justify-between gap-16 px-8 py-16 ${footerBackground} ${footerTextColor}`}
      >
        <div data-footer-header>
          <h2 className="m-0 text-[2.5rem] normal-case leading-[1.1] tracking-[-0.03em] md:text-[4.5rem]">
            <span data-footer-line className="block font-normal opacity-70">
              {footerTagline}
            </span>
            <span data-footer-line className="block font-bold">
              {footerBold}
            </span>
          </h2>
        </div>

        <div data-footer-logo className="w-full">
          <Wordmark
            text={logoText}
            dataKey="data-footer-letter"
            className="flex items-start whitespace-nowrap text-[26vw] leading-[0.9]"
          />
        </div>
      </footer>
    </div>
  );
}