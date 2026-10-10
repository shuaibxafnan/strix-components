"use client";

import { useState, useEffect } from "react";

// ─── EphemeralSlider ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items           array    Collection of slide datasets containing backgrounds and titles
// shadowOpacity   number   0.3         Global card frame overlay value depth modifier
// buttonText      string   "Read More" Content action label text value configuration
// navBgColor      string   "bg-white/50" Tailwind background styling variant string for arrows
// navHoverBgColor string   "hover:bg-white/30" Tailwind state ruleset additions for toggle actions
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    title: "Lossless Youths",
    desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.",
    img: "https://cdn.mos.cms.futurecdn.net/dP3N4qnEZ4tCTCLq59iysd.jpg",
  },
  {
    title: "Estrange Bond",
    desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.",
    img: "https://i.redd.it/tc0aqpv92pn21.jpg",
  },
  {
    title: "The Gate Keeper",
    desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.",
    img: "https://wharferj.files.wordpress.com/2015/11/bio_north.jpg",
  },
  {
    title: "Last Trace Of Us",
    desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.",
    img: "https://images7.alphacoders.com/878/878663.jpg",
  },
  {
    title: "Urban Decay",
    desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.",
    img: "https://theawesomer.com/photos/2017/07/simon_stalenhag_the_electric_state_6.jpg",
  },
  {
    title: "The Migration",
    desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.",
    img: "https://da.se/app/uploads/2015/09/simon-december1994.jpg",
  },
];

export default function EphemeralSlider({
  items = DEFAULT_SLIDES,
  shadowOpacity = 0.3,
  buttonText = "Read More",
  navBgColor = "bg-white/50",
  navHoverBgColor = "hover:bg-white/30",
}) {
  const [slides, setSlides] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Synchronize on mount to verify server-side hydration values step perfectly
  useEffect(() => {
    setSlides(items);
    setMounted(true);
  }, [items]);

  const handleNext = () => {
    setSlides((prev) => {
      const updated = [...prev];
      const first = updated.shift();
      updated.push(first);
      return updated;
    });
  };

  const handlePrev = () => {
    setSlides((prev) => {
      const updated = [...prev];
      const last = updated.pop();
      updated.unshift(last);
      return updated;
    });
  };

  if (!mounted || slides.length === 0) return null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Structural Styles Injected Safely via Tailwind Layer Compositions */}
      <ul className="relative w-full h-full">
        {slides.map((slide, index) => {
          // Dynamic layout assignments mimicking native css pseudo selectors :nth-child
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;
          const isFourth = index === 3;
          const isFifth = index === 4;
          const isPastVisible = index >= 5;

          return (
            <li
              key={`${slide.title}-${index}`}
              className={`
                absolute list-none bg-center bg-cover transition-all duration-[0.75s] ease-in-out
                ${
                  isFirst || isSecond
                    ? "left-0 top-0 w-full h-full rounded-none opacity-100 transform-none shadow-none"
                    : "top-1/2 -translate-y-1/2 w-[130px] h-[220px] rounded-[20px] sm:w-[160px] sm:h-[270px] md:w-[200px] md:h-[300px]"
                }
                ${isThird ? "left-1/2" : ""}
                ${isFourth ? "left-[calc(50%+140px)] sm:left-[calc(50%+170px)] md:left-[calc(50%+220px)]" : ""}
                ${isFifth ? "left-[calc(50%+280px)] sm:left-[calc(50%+340px)] md:left-[calc(50%+440px)]" : ""}
                ${isPastVisible ? "left-[calc(50%+420px)] sm:left-[calc(50%+510px)] md:left-[calc(50%+660px)] opacity-0 pointer-events-none" : "opacity-100"}
              `}
              style={{
                backgroundImage: `url('${slide.img}')`,
                boxShadow:
                  isFirst || isSecond
                    ? "none"
                    : `inset 0 20px 30px rgba(255,255,255,${shadowOpacity})`,
              }}
            >
              {/* Context text overlay layer wrapper - exclusively animated on secondary index mapping */}
              {isSecond && (
                <div className="absolute top-1/2 left-12 -translate-y-1/2 text-white font-sans text-left max-w-[400px] w-[30vw] min-w-[260px] drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)] animate-[show_0.75s_ease-in-out_0.3s_forwards] opacity-0">
                  <h2 className="font-sans font-black uppercase text-xl sm:text-2xl md:text-3xl tracking-tight leading-none mb-2">
                    {slide.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-light leading-relaxed mb-6 opacity-90">
                    {slide.desc}
                  </p>
                  <button className="px-5 py-2.5 bg-black/10 border-2 border-white rounded font-medium text-xs sm:text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300">
                    {buttonText}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Modern Interface Arrow Direction Controller Elements */}
      <nav className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        <button
          onClick={handlePrev}
          aria-label="Previous Slide Frame"
          className={`w-12 h-12 rounded-full flex items-center justify-center border border-black/60 text-black/70 cursor-pointer backdrop-blur-sm transition-all duration-200 ${navBgColor} ${navHoverBgColor}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide Frame"
          className={`w-12 h-12 rounded-full flex items-center justify-center border border-black/60 text-black/70 cursor-pointer backdrop-blur-sm transition-all duration-200 ${navBgColor} ${navHoverBgColor}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </nav>

      {/* Global Embedded Styles Injection Keyframes for Complex Animation Modifiers */}
      <style jsx global>{`
        @keyframes show {
          0% {
            filter: blur(5px);
            transform: translateY(calc(-50% + 75px));
            opacity: 0;
          }
          100% {
            filter: blur(0);
            transform: translateY(-50%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
