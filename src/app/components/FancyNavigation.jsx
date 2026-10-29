"use client";

import { useEffect, useState } from "react";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1500&q=80`;

const DEFAULT_ITEMS = [
  {
    tag: "Approach",
    title: "We’re not afraid to rethink things",
    shortDesc:
      "Every project starts by questioning the brief, the floor plan and the way people actually move through a room.",
    img: photo("1759458856846-097935f54111"),
    paragraphs: [
      "Most rooms are arranged the way they were last time. We start by asking what the space is for, who uses it and at what hour, and we let the answers move the walls before they move the furniture.",
      "That can mean a kitchen that opens onto a reading nook, or a hallway that becomes the brightest room in the house. The result rarely looks like the sketch we started with, and that is usually a good sign.",
    ],
  },
  {
    tag: "Homes",
    title: "Enthusiastic creators for living environments",
    shortDesc:
      "Homes work best when they are shaped around daily habits, natural light and materials that age well.",
    img: photo("1533387520709-752d83de3630"),
    paragraphs: [
      "We care about the small routines: where the keys land, where the morning light falls, which chair gets used first. A good interior is built from those details, not from a mood board.",
    ],
  },
  {
    tag: "Style",
    title: "Create modern yet timeless experiences",
    shortDesc:
      "Clean lines and honest materials, chosen so a room still feels right a decade from now.",
    img: photo("1752150127767-77bccbed07e2"),
    paragraphs: [
      "Trends are easy to follow and expensive to live with. We lean on proportion, texture and restraint, and we leave room for the pieces our clients already love.",
      "Stone, timber, lime plaster and linen do most of the work. They are forgiving, they improve with wear, and they photograph well on a Tuesday afternoon as much as on a styled shoot.",
    ],
  },
  {
    tag: "Ethos",
    title: "Ultimately, design is about being",
    shortDesc:
      "A space succeeds when you stop noticing it and simply feel at ease inside.",
    img: photo("1781935307999-e8bb5e62ebb1"),
    paragraphs: [
      "The best compliment we get is that nothing feels designed. People sit down, exhale and forget there was ever a plan. That quiet is the whole point.",
    ],
  },
];

const ArrowUpRight = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default function FancyNavigation({
  speed = 0.6,
  customItems = null,
  readMoreLabel = "Read more",
  closeLabel = "Close",
  fontFamily = "Hanken Grotesk",
  titleFont = "Newsreader",
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const items = customItems || DEFAULT_ITEMS;

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex]);

  return (
    <div
      className="relative h-screen w-full select-none overflow-hidden bg-neutral-950 font-[family-name:var(--font)] text-neutral-200 antialiased"
      style={{
        "--font": `"${fontFamily}", sans-serif`,
        "--title-font": `"${titleFont}", serif`,
        "--speed": `${speed}s`,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500&family=Newsreader:opsz,wght@6..72,400..500&display=swap"
      />

      <nav className="grid h-full w-full grid-cols-1 gap-3 p-3 max-md:grid-rows-4 md:grid-cols-4">
        {items.map((item, idx) => (
          <article
            key={idx}
            className="group relative min-h-0 overflow-hidden rounded-2xl bg-neutral-900"
          >
            <img
              src={item.img}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover brightness-[0.65] grayscale-[0.4] transition-[filter,transform] duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.85] group-hover:grayscale-0"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

            {item.tag && (
              <span className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white/85">
                {item.tag}
              </span>
            )}

            <span className="pointer-events-none absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-7">
              <h3 className="m-0 max-w-[16ch] font-[family-name:var(--title-font)] text-2xl font-normal leading-[1.1] text-white md:text-[1.9rem]">
                {item.title}
              </h3>

              <div className="grid [grid-template-rows:0fr] [transition:grid-template-rows_var(--speed)_cubic-bezier(0.16,1,0.3,1)] group-hover:[grid-template-rows:1fr]">
                <div className="overflow-hidden">
                  <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-white/75">
                    {item.shortDesc}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label={`${readMoreLabel}: ${item.title}`}
              onClick={() => setActiveIndex(idx)}
              className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
            />
          </article>
        ))}
      </nav>

      {items.map((item, idx) => {
        const isActive = activeIndex === idx;
        return (
          <section
            key={idx}
            aria-hidden={!isActive}
            className={`absolute inset-0 z-30 grid grid-rows-[38vh_1fr] overflow-y-auto bg-[#0d0d0d] [transition:clip-path_calc(var(--speed)*1.6)_cubic-bezier(0.76,0,0.24,1)] md:grid-cols-2 md:grid-rows-1 md:overflow-hidden ${isActive
              ? "[clip-path:inset(0_0_0_0)]"
              : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
              }`}
          >
            <div className="relative h-full min-h-0 overflow-hidden">
              <img
                src={item.img}
                alt={item.title}
                className={`h-full w-full object-cover [transition:transform_1.4s_cubic-bezier(0.16,1,0.3,1)] ${isActive ? "scale-100" : "scale-110"
                  }`}
              />
            </div>

            <div className="relative flex min-h-0 flex-col justify-between gap-10 overflow-y-auto p-8 md:p-14">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {closeLabel}
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div
                className={`transition-all duration-700 ease-out ${isActive
                  ? "translate-y-0 opacity-100 delay-500"
                  : "translate-y-6 opacity-0"
                  }`}
              >
                <h3 className="m-0 max-w-[14ch] font-[family-name:var(--title-font)] text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-white md:text-6xl">
                  {item.title}
                </h3>

                <div className="mt-8 max-w-[52ch] space-y-5 text-base leading-relaxed text-neutral-400 md:text-lg">
                  {item.paragraphs.map((para, pIdx) => (
                    <p key={pIdx} className="m-0">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}