"use client";

import { useEffect, useRef } from "react";

const GSAP_URL = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
const SCROLL_TRIGGER_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

const DEFAULT_IMAGES = [
  { id: "photo-1533387520709-752d83de3630", alt: "Nebula glowing in deep space", layer: 2 },
  { id: "photo-1752150127767-77bccbed07e2", alt: "Orion nebula in pink and purple", layer: 2 },
  { id: "photo-1781935307999-e8bb5e62ebb1", alt: "Blue galaxy against a black sky", layer: 1 },
  { id: "photo-1595598034023-ca08624ce05d", alt: "Horsehead Nebula among stars", layer: 2 },
  { id: "photo-1781798715946-2e198afc29a7", alt: "Dense star cluster", layer: 3 },
  { id: "photo-1725161834547-ba8a90bf5a15", alt: "Starfield at night", layer: 1 },
  { id: "photo-1782806007529-90a2ab4b98d9", alt: "Bright star in the night sky", layer: 3 },
  { id: "photo-1779877716206-f441d5d384d4", alt: "Purple and blue spiral galaxy", layer: 3 },
  { id: "photo-1779862946918-a129ac57c60e", alt: "Nebula clouds in space", layer: 1 },
  { id: "photo-1780269579991-79bc18ee6f56", alt: "Milky Way over the night sky", layer: 3 },
  { id: "photo-1611419010196-a360856fc42f", alt: "Starry night with dark clouds", layer: 2 },
  { id: "photo-1777902609361-a8b8b7a697fb", alt: "Large star in the sky", layer: 1 },
].map(({ id, alt, layer }) => ({ src: unsplash(id), alt, layer }));

const DEFAULT_CHAPTERS = [
  {
    tag: "01 Origin",
    title: "Born in Dust",
    desc: "Every star begins inside a cold cloud of gas and dust that slowly collapses under its own weight.",
  },
  {
    tag: "02 Light",
    title: "Old Messengers",
    desc: "The light reaching your eyes tonight left its source long before anyone could name the sky above.",
  },
  {
    tag: "03 Scale",
    title: "Room to Wander",
    desc: "A single galaxy holds hundreds of billions of suns, and the universe holds countless galaxies.",
  },
];

const DEFAULT_MARQUEE = ["Deep Space", "Quiet Light", "Deep Space", "Quiet Light"];

const POSITIONS = [
  "left-[15vw] top-[21%] w-[11.5vw]",
  "left-[29%] top-[15%] w-[9.2vw]",
  "left-[36%] top-[3%] w-[11.5vw]",
  "right-[30%] top-[11%] w-[7.6vw]",
  "right-[7%] top-[28%] w-[13.2vw]",
  "bottom-[32%] right-[3.5%] w-[4.7vw]",
  "bottom-[13.5%] left-[16%] w-[10.5vw]",
  "bottom-[24%] left-[29%] w-[5.9vw]",
  "bottom-[46%] left-[7.5%] w-[5.2vw]",
  "bottom-[5.5%] right-[15%] w-[15vw]",
  "bottom-[10.5%] right-[38%] w-[8.3vw]",
  "right-[4%] top-[5%] w-[6.1vw]",
];

const LAYER_CLASSES = {
  1: "opacity-20 z-[1]",
  2: "opacity-40 z-[2]",
  3: "opacity-60 z-[3]",
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.addEventListener("load", () => {
      el.dataset.loaded = "true";
      resolve();
    });
    el.addEventListener("error", () => reject(new Error(`Failed: ${src}`)));
    document.head.appendChild(el);
  });

export default function PerspectiveZoomEffect({
  images = DEFAULT_IMAGES,
  titleText = "Universe",
  revealText = "Look up long enough and the night sky stops feeling distant and starts feeling like home.",
  marqueeItems = DEFAULT_MARQUEE,
  chaptersLabel = "Chapters",
  chaptersTitle = "Three Ways to Look Up",
  chaptersIntro = "A short tour of where stars come from, how their light travels, and how much room there is out there.",
  chapters = DEFAULT_CHAPTERS,
  scrubSpeed = 1,
  zoomDuration = "+=150%",
  textRevealDuration = 1500,
  backgroundColor = "bg-black",
  textColor = "text-white",
  mutedColor = "text-white/60",
  borderColor = "border-white/10",
  marqueeColor = "text-white/15",
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let ctx;

    const run = async () => {
      await loadScript(GSAP_URL);
      await loadScript(SCROLL_TRIGGER_URL);
      const { gsap, ScrollTrigger } = window;
      if (cancelled || !gsap || !ScrollTrigger || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "[data-zoom]",
              start: "top top",
              end: zoomDuration,
              pin: true,
              scrub: scrubSpeed,
            },
          })
          .to("[data-layer='3']", { opacity: 1, z: 800, ease: "power1.inOut" }, 0)
          .to("[data-layer='2']", { opacity: 1, z: 600, ease: "power1.inOut" }, 0)
          .to("[data-layer='1']", { opacity: 1, z: 400, ease: "power1.inOut" }, 0)
          .fromTo(
            "[data-heading]",
            { opacity: 0.1, z: -2000 },
            { opacity: 1, z: 50, ease: "power1.inOut" },
            0,
          );

        const chars = gsap.utils.toArray("[data-char]");
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "[data-reveal]",
              pin: true,
              start: "center center",
              end: `+=${textRevealDuration}`,
              scrub: scrubSpeed,
            },
          })
          .to(chars, { opacity: 1, stagger: 1, ease: "none" })
          .to({}, { duration: chars.length * 0.1 })
          .to("[data-reveal-text]", {
            opacity: 0,
            scale: 1.15,
            duration: chars.length * 0.5,
          });

        gsap.to("[data-marquee-track]", {
          xPercent: -50,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-marquee]",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });

        gsap.from("[data-card]", {
          opacity: 0,
          y: 60,
          stagger: 0.2,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-chapters]",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }, rootRef.current);
    };

    run().catch(() => { });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [zoomDuration, scrubSpeed, textRevealDuration]);

  return (
    <main
      ref={rootRef}
      className={`m-0 overflow-x-clip font-sans antialiased ${backgroundColor} ${textColor}`}
    >
      <div
        data-zoom
        className="relative h-screen w-full overflow-hidden [perspective:100svh]"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <h1
            data-heading
            className="m-0 whitespace-pre-line text-center text-[clamp(3.125rem,3.464vw+2.229rem,5rem)] font-extrabold uppercase leading-[clamp(4.688rem,3.349vw+3.821rem,6.5rem)] tracking-tight"
          >
            {titleText}
          </h1>
        </div>

        {images.map((img, idx) => (
          <div
            key={idx}
            data-layer={img.layer}
            className={`absolute max-h-[300px] max-w-[300px] origin-center ${LAYER_CLASSES[img.layer] ?? LAYER_CLASSES[1]} ${POSITIONS[idx % POSITIONS.length]}`}
          >
            <img
              src={img.src}
              alt={img.alt ?? ""}
              className="h-auto w-full object-cover"
            />
          </div>
        ))}
      </div>

      <section
        data-reveal
        className={`flex min-h-screen items-center justify-center px-6 ${backgroundColor}`}
      >
        <p
          data-reveal-text
          className="w-full text-balance text-center text-4xl font-bold leading-[1.1] tracking-tight md:w-4/5 md:text-[5rem]"
        >
          {revealText.split(" ").map((word, w) => (
            <span key={w} className="mr-[0.25em] inline-block whitespace-nowrap">
              {[...word].map((char, c) => (
                <span key={c} data-char className="opacity-20">
                  {char}
                </span>
              ))}
            </span>
          ))}
        </p>
      </section>

      <section
        data-marquee
        className={`select-none overflow-hidden whitespace-nowrap border-y py-10 ${borderColor}`}
      >
        <div
          data-marquee-track
          className={`inline-flex items-center text-[clamp(4rem,10vw,12rem)] font-black uppercase leading-none tracking-tighter ${marqueeColor}`}
        >
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="inline-flex items-center">
              {item}
              <span className="mx-12 inline-block size-5 rounded-full bg-current" />
            </span>
          ))}
        </div>
      </section>

      <section data-chapters className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row">
          <div>
            <span
              className={`mb-3 block text-xs font-medium uppercase tracking-[0.3em] ${mutedColor}`}
            >
              {chaptersLabel}
            </span>
            <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
              {chaptersTitle}
            </h2>
          </div>
          <p className={`max-w-md pt-2 text-base leading-relaxed ${mutedColor}`}>
            {chaptersIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {chapters.map((item, idx) => (
            <div
              key={idx}
              data-card
              className={`group flex min-h-55 flex-col justify-between rounded-lg border bg-white/5 p-8 transition-colors duration-500 hover:border-white/30 ${borderColor}`}
            >
              <span className={`block text-xs uppercase tracking-widest ${mutedColor}`}>
                {item.tag}
              </span>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className={`text-sm leading-relaxed ${mutedColor}`}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}