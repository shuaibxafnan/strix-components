"use client";

import { useEffect, useRef, useState } from "react";

const IMG = (n) =>
  `https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/${n}.png`;

const DEFAULT_SECTIONS = [
  {
    image: IMG("blue"),
    titleLead: "The",
    title: "Algorithm",
    text: "The algorithm's workings are shrouded in complexity, and its decision-making processes are inscrutable to the general populace.",
    cardColor: "bg-neutral-900",
  },
  {
    image: IMG("red"),
    titleLead: "The",
    title: "Dogma",
    text: "The digital gospel etched into the very code of the algorithmic society, served as the bedrock of the cognitive regime.",
    cardColor: "bg-neutral-800",
  },
  {
    image: IMG("purple"),
    titleLead: "The",
    title: "Architects",
    text: "The elusive entities, lacking human form, operate in the shadows, skillfully shaping societal norms through the complex interplay of algorithms and dogmas.",
    cardColor: "bg-neutral-900",
  },
  {
    image: IMG("green"),
    titleLead: "The",
    title: "Wasteland",
    text: "This overlooked realm, a consequence of algorithmic judgments, is a haunting landscape filled with the echoes of untold stories and uncharted thoughts.",
    cardColor: "bg-neutral-800",
  },
  {
    image: IMG("black"),
    titleLead: "The",
    title: "Narrative",
    text: "The narrative unfolds as the omnipresent thread weaving through the fabric of the algorithmic society.",
    cardColor: "bg-neutral-900",
  },
  {
    image: IMG("dblue"),
    titleLead: "The",
    title: "Opulence",
    text: "Opulence epitomizes the cognitive elite's wealth in the algorithmic society, where opulent thoughts and experiences shape the societal narrative.",
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

export default function StickySectionsCollapse({
  sections = DEFAULT_SECTIONS,
  heroTitleLead = "The",
  heroTitle = "Periphery",
  heroDescription = "As data conglomerates reveled in the opulence of cognitive wealth, a silent underclass manifested, condemned to the digital periphery.",
  outro = "Lost in perpetual dependency, inhabitants of the Synthetic Era found solace in cryptic simulations, where pain ebbed and cognitive loads momentarily lightened.",
  fontFamily = "DM Sans",
  fontFaces = DEFAULT_FONT_FACES,
  backgroundColor = "bg-black",
  textColor = "text-white",
  loaderColor = "bg-white/60",
  cardRadius = "rounded-md",
  imageSize = "h-[50%]",
  stickyOffset = 0,
  scrollLength = "+=100%",
  scaleTo = 0,
  rotation = 10,
  originX = 2,
  originY = 2,
  lastOriginY = 0,
  lastYPercent = 100,
  alternateDirection = true,
  keepLastSection = true,
  imageFromContrast = 400,
  imageToContrast = 100,
  imageScrollStart = "top bottom",
  imageScrollEnd = "max",
  smoothScroll = true,
  lerp = 0.2,
  smoothWheel = true,
  showLoader = true,
  className = "",
}) {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(!showLoader);

  useEffect(() => {
    let killed = false;
    let ctx;
    let lenis;
    let tick;
    let gsapRef;

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
      const [gsapMod, stMod, lenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        smoothScroll ? import("lenis") : Promise.resolve(null),
      ]);
      if (killed || !rootRef.current) return;

      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const Lenis = lenisMod ? lenisMod.default : null;
      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;

      await preloadImages();
      if (killed) return;
      setReady(true);

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (Lenis && !reduceMotion) {
        lenis = new Lenis({ lerp, smoothWheel });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      ctx = gsap.context(() => {
        const panels = gsap.utils.toArray("[data-panel]");
        panels.forEach((el, i) => {
          const isLast = keepLastSection && i === panels.length - 1;
          const flip = alternateDirection && i % 2 !== 0;
          const ox = flip ? 100 - originX : originX;
          const oy = isLast ? lastOriginY : originY;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: el,
                start: "top top",
                end: scrollLength,
                scrub: true,
              },
            })
            .set(el, { transformOrigin: `${ox}% ${oy}%` })
            .to(
              el,
              {
                ease: "none",
                scale: scaleTo,
                yPercent: isLast ? lastYPercent : 0,
                rotation: flip ? -rotation : rotation,
              },
              0,
            );
        });
        panels.forEach((el) => {
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
      console.error("[StickySectionsCollapse]", e.message);
      setReady(true);
    });

    return () => {
      killed = true;
      if (gsapRef && tick) gsapRef.ticker.remove(tick);
      if (lenis) lenis.destroy();
      if (ctx) ctx.revert();
    };
  }, [
    sections.length,
    scrollLength,
    scaleTo,
    rotation,
    originX,
    originY,
    lastOriginY,
    lastYPercent,
    alternateDirection,
    keepLastSection,
    smoothScroll,
    lerp,
    smoothWheel,
    imageFromContrast,
    imageToContrast,
    imageScrollStart,
    imageScrollEnd,
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
      className={`relative w-full overflow-x-clip antialiased ${backgroundColor} ${textColor} ${className}`}
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

      <div className="relative w-full">
        {sections.map((item, i) => (
          <div
            key={i}
            data-panel
            className={`sticky flex w-full flex-col items-center justify-center gap-[3vh] overflow-hidden p-6 text-center ring-1 ring-white/10 ${cardRadius} ${item.cardColor}`}
            style={{
              top: `${stickyOffset}px`,
              height: `calc(100vh - ${stickyOffset}px)`,
              zIndex: i + 1,
            }}
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

            <p className="m-0 max-w-[520px] px-4 text-sm leading-[1.6] opacity-70">
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