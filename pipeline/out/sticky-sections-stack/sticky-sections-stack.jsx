"use client";

import { useEffect, useRef, useState } from "react";

const IMG = (n) =>
  `https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/${n}.png`;

const DEFAULT_SECTIONS = [
  {
    image: IMG("blue"),
    titleLead: "The",
    title: "Algorithm",
    alt: "",
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

const pad = (n) => String(n).padStart(2, "0");

export default function StickySectionsStack({
  sections = DEFAULT_SECTIONS,
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
  showLoader = true,
  className = "",
}) {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(!showLoader);

  useEffect(() => {
    let killed = false;
    let ctx;
    let gsap;
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
      const [gsapMod, stMod, lenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        smoothScroll ? import("lenis") : Promise.resolve(null),
      ]);
      if (killed || !rootRef.current) return;

      gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const Lenis = lenisMod ? lenisMod.default || lenisMod.Lenis : null;
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
      console.error(e);
      setReady(true);
    });

    return () => {
      killed = true;
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
  ]);

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-x-clip antialiased ${backgroundColor} ${textColor} ${className}`}
    >
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
              alt={item.alt || ""}
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
    </div>
  );
}