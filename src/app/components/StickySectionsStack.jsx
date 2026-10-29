"use client";

import { useEffect, useRef, useState } from "react";

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

const IMG = (n) =>
  `https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/${n}.png`;

const DEFAULT_SECTIONS = [
  {
    image: IMG("blue"),
    titleLead: "The",
    title: "Algorithm",
    text: "The algorithm's workings are shrouded in complexity.",
    cardColor: "bg-neutral-900",
  },
  {
    image: IMG("red"),
    titleLead: "The",
    title: "Dogma",
    text: "Enshrining the principles of conformity and reinforcing the status quo.",
    cardColor: "bg-neutral-800",
  },
  {
    image: IMG("purple"),
    titleLead: "The",
    title: "Architects",
    text: "The elusive entities, lacking human form, operate in the shadows.",
    cardColor: "bg-neutral-900",
  },
  {
    image: IMG("green"),
    titleLead: "The",
    title: "Wasteland",
    text: "This overlooked realm, a consequence of algorithmic judgments.",
    cardColor: "bg-neutral-800",
  },
  {
    image: IMG("black"),
    titleLead: "The",
    title: "Narrative",
    text: "The collective story sculpted by the architects.",
    cardColor: "bg-neutral-900",
  },
  {
    image: IMG("dblue"),
    titleLead: "The",
    title: "Opulence",
    text: "The cognitive elite's wealth in the algorithmic society.",
    cardColor: "bg-neutral-800",
  },
];

const DEFAULT_FONT_FACES = [
  {
    weight: 300,
    url: "https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-300-normal.woff2",
  },
  {
    weight: 500,
    url: "https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-500-normal.woff2",
  },
  {
    weight: 700,
    url: "https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-700-normal.woff2",
  },
];

const pad = (n) => String(n).padStart(2, "0");

export default function StickySectionsStack({
  sections = DEFAULT_SECTIONS,
  heroTitleLead = "The",
  heroTitle = "Shadow",
  heroDescription = "As data conglomerates reveled in the opulence of cognitive wealth, a silent underclass manifested, condemned to the digital periphery.",
  outro = "Lost in perpetual dependency, inhabitants of the Synthetic Era found solace in cryptic simulations, where pain ebbed and cognitive loads momentarily lightened.",
  fontFamily = "DM Sans",
  fontFaces = DEFAULT_FONT_FACES,
  backgroundColor = "bg-black",
  textColor = "text-white",
  loaderColor = "bg-white/60",
  cardTop = "top-[10vh]",
  cardRadius = "rounded-md",
  imageSize = "h-[50%]",
  scrollStart = "center center",
  stackScrollLength = "max",
  scaleTo = 0.4,
  stackYPercent = -50,
  imageFromContrast = 400,
  imageToContrast = 100,
  imageScrollStart = "top bottom",
  imageScrollEnd = "max",
  smoothScroll = true,
  lerp = 0.2,
  smoothWheel = true,
  lenisUrl = "https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js",
  showLoader = true,
}) {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(!showLoader);

  useEffect(() => {
    let killed = false;
    let ctx;
    let lenis;
    let tick;

    const preloadImages = () =>
      Promise.all(
        Array.from(rootRef.current.querySelectorAll("img")).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
        ),
      );

    const run = async () => {
      await loadScript(GSAP_BASE + "gsap.min.js");
      await loadScript(GSAP_BASE + "ScrollTrigger.min.js");
      if (smoothScroll) {
        try {
          await loadScript(lenisUrl);
        } catch (e) {
          console.warn(
            "[StickySectionsBlurStack] Lenis unavailable:",
            e.message,
          );
        }
      }
      if (killed) return;

      const { gsap, ScrollTrigger, Lenis } = window;
      if (!gsap || !ScrollTrigger || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      await preloadImages();
      if (killed) return;
      setReady(true);

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (smoothScroll && Lenis && !reduceMotion) {
        lenis = new Lenis({ lerp, smoothWheel });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      ctx = gsap.context(() => {
        gsap.utils.toArray("[data-panel]").forEach((el) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: el,
                start: scrollStart,
                end: stackScrollLength,
                scrub: true,
              },
            })
            .to(el, { ease: "none", scale: scaleTo, yPercent: stackYPercent }, 0);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: el,
                start: imageScrollStart,
                end: imageScrollEnd,
                scrub: true,
              },
            })
            .fromTo(
              el.querySelector("[data-panel-img]"),
              { filter: `contrast(${imageFromContrast}%)` },
              { ease: "none", filter: `contrast(${imageToContrast}%)` },
              0,
            );
        });
      }, rootRef.current);

      ScrollTrigger.refresh();
    };

    run().catch((e) => {
      console.error("[StickySectionsBlurStack]", e.message);
      setReady(true);
    });

    return () => {
      killed = true;
      const { gsap } = window;
      if (gsap && tick) gsap.ticker.remove(tick);
      if (lenis) lenis.destroy();
      if (ctx) ctx.revert();
    };
  }, [
    sections.length,
    scrollStart,
    stackScrollLength,
    scaleTo,
    stackYPercent,
    imageFromContrast,
    imageToContrast,
    imageScrollStart,
    imageScrollEnd,
    smoothScroll,
    lerp,
    smoothWheel,
    lenisUrl,
  ]);

  const fontCss = fontFaces
    .map(
      ({ weight, url }) =>
        '@font-face{font-family:"' +
        fontFamily +
        '";src:url("' +
        url +
        '") format("woff2");font-weight:' +
        weight +
        ";font-display:swap;}",
    )
    .join("");

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-x-clip antialiased ${backgroundColor} ${textColor}`}
      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
    >
      <style>{fontCss}</style>

      {showLoader ? (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[5000] grid place-items-center transition-all duration-300 ${backgroundColor} ${ready ? "invisible opacity-0" : "visible opacity-100"
            }`}
        >
          <div
            className={`h-[60px] w-[60px] animate-pulse rounded-full ${loaderColor}`}
          />
        </div>
      ) : null}

      <header className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-[15vh] text-center">
        <h1 className="m-0 text-[clamp(3rem,12vw,9rem)] font-medium leading-[0.95] tracking-[-0.05em]">
          <span className="font-light">{heroTitleLead}</span> {heroTitle}
        </h1>
        <p className="mt-8 max-w-xl text-base leading-[1.6] opacity-70 md:text-lg">
          {heroDescription}
        </p>
      </header>

      <div className="relative flex w-full flex-col items-center">
        {sections.map((item, i) => (
          <div
            key={i}
            data-panel
            className={`sticky mx-auto mb-[5vh] flex h-[80vh] w-[95vw] max-w-[500px] flex-col items-center justify-center gap-[3vh] overflow-hidden p-6 text-center ring-1 ring-white/10 lg:w-[50vw] ${cardTop} ${cardRadius} ${item.cardColor}`}
          >
            <span className="absolute left-5 top-5 text-xs tabular-nums tracking-[0.1em] opacity-50">
              {pad(i + 1)} / {pad(sections.length)}
            </span>

            <img
              data-panel-img
              src={item.image}
              alt=""
              draggable={false}
              className={`w-auto select-none object-cover ${imageSize}`}
            />

            <h2 className="m-0 text-[clamp(1.75rem,4.5vw,3.5rem)] font-medium leading-none tracking-[-0.05em]">
              {item.titleLead ? (
                <span className="block font-light">{item.titleLead}</span>
              ) : null}
              {item.title}
            </h2>

            <p className="m-0 max-w-[420px] px-4 text-sm leading-[1.6] opacity-70">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <section className="flex flex-col items-center justify-center px-6 pb-[30vh] pt-[50vh]">
        <p className="m-0 max-w-[900px] text-[clamp(1.5rem,5vw,3rem)] font-medium leading-[1.2] tracking-[-0.02em]">
          {outro}
        </p>
      </section>
    </div>
  );
}