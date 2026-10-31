"use client";

import { useCallback, useEffect, useRef } from "react";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&h=1080&q=80`;

const DEFAULT_SLIDES = [
  {
    image: photo("1749330513873-09ffa91b0aae"),
    name: "Morning",
    description: "The first hour, before the street has an opinion.",
  },
  {
    image: photo("1778789172736-e8ba37c71124"),
    name: "Concrete",
    description: "Hard edges and the long afternoon that falls across them.",
  },
  {
    image: photo("1634325232058-e7b8f80cc20b"),
    name: "Frame",
    description: "What holds a picture up when everything else is taken away.",
  },
  {
    image: photo("1759458856846-097935f54111"),
    name: "Grain",
    description: "Close enough to feel the surface without touching it.",
  },
  {
    image: photo("1752150127767-77bccbed07e2"),
    name: "Horizon",
    description: "A single line doing most of the work.",
  },
  {
    image: photo("1781935307999-e8bb5e62ebb1"),
    name: "Quiet",
    description: "Nothing moves, and that is the whole subject.",
  },
  {
    image: photo("1777947085284-d454d1aa2f40"),
    name: "Passage",
    description: "A moment caught on its way somewhere else.",
  },
  {
    image: photo("1595598034023-ca08624ce05d"),
    name: "Dusk",
    description: "The hour when black and white stop arguing.",
  },
];

const Chevron = ({ dir }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d={dir === "right" ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
  </svg>
);

const arrowBtn =
  "grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-white/5 text-white backdrop-blur-sm transition duration-300 hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function ThumbStripSlideshow({
  slides = DEFAULT_SLIDES,
  accentColor = "#ffffff",
  onAccentColor = "#0a0a0a",
  fontFamily = "Archivo",
  grayscale = true,
  contentLeft = "100px",
  contentWidth = "460px",
  nameFontSize = "clamp(3.5rem, 10vw, 8.5rem)",
  desFontSize = "1.125rem",
  primaryLabel = "See more",
  primaryHref = "#",
  secondaryLabel = "Subscribe",
  secondaryHref = "#",
  counterOf = "of",
  prevLabel = "Previous slide",
  nextLabel = "Next slide",
  thumbWidth = "180px",
  thumbHeight = "250px",
  thumbTop = "80%",
  thumbStartLeft = "67%",
  thumbGap = 200,
  timeRunning = 3000,
  timeAutoNext = 7000,
  progressHeight = "3px",
  className = "",
}) {
  const carouselRef = useRef(null);
  const listRef = useRef(null);
  const progressRef = useRef(null);
  const counterRef = useRef(null);
  const runTimeOutRef = useRef(null);
  const runNextAutoRef = useRef(null);

  const total = slides.length;
  const pad = (n) => String(n).padStart(2, "0");
  const ordered = [slides[total - 1], ...slides.slice(0, total - 1)];

  const resetTimeAnimation = useCallback(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = `sliderProgress ${timeAutoNext}ms linear 1 forwards`;
  }, [timeAutoNext]);

  const showSlider = useCallback(
    (type) => {
      const listEl = listRef.current;
      const carouselEl = carouselRef.current;
      if (!listEl || !carouselEl) return;

      const items = listEl.querySelectorAll(".slider-item");

      if (type === "next") {
        listEl.appendChild(items[0]);
        carouselEl.classList.add("slider-next");
      } else {
        listEl.prepend(items[items.length - 1]);
        carouselEl.classList.add("slider-prev");
      }

      const hero = listEl.children[1];
      if (hero && counterRef.current) {
        counterRef.current.textContent = pad(Number(hero.dataset.index) + 1);
      }

      clearTimeout(runTimeOutRef.current);
      runTimeOutRef.current = setTimeout(() => {
        carouselEl.classList.remove("slider-next");
        carouselEl.classList.remove("slider-prev");
      }, timeRunning);

      clearTimeout(runNextAutoRef.current);
      runNextAutoRef.current = setTimeout(() => {
        showSlider("next");
      }, timeAutoNext);

      resetTimeAnimation();
    },
    [timeRunning, timeAutoNext, resetTimeAnimation],
  );

  useEffect(() => {
    resetTimeAnimation();
    runNextAutoRef.current = setTimeout(() => {
      showSlider("next");
    }, timeAutoNext);

    return () => {
      clearTimeout(runTimeOutRef.current);
      clearTimeout(runNextAutoRef.current);
    };
  }, [showSlider, resetTimeAnimation, timeAutoNext]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&display=swap"
      />
      <style>{`
        @keyframes sliderProgress { from { width: 0%; } to { width: 100%; } }
        @keyframes sliderContentIn {
          from { opacity: 0; transform: translateY(60px); filter: blur(24px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>

      <div
        ref={carouselRef}
        className={`group/c relative h-[100dvh] w-full overflow-hidden bg-black font-[family-name:var(--font)] text-white [--cl:var(--d-cl)] [--th:var(--d-th)] [--tg:calc(var(--d-gap)*1px)] [--tl:var(--d-tl)] [--top:var(--d-top)] [--tw:var(--d-tw)] max-[999px]:[--cl:50px] max-[690px]:[--cl:20px] max-[690px]:[--tg:78px] max-[690px]:[--th:104px] max-[690px]:[--tl:5%] max-[690px]:[--top:88%] max-[690px]:[--tw:72px] ${className}`}
        style={{
          "--font": `"${fontFamily}", sans-serif`,
          "--accent": accentColor,
          "--on-accent": onAccentColor,
          "--d-cl": contentLeft,
          "--d-cw": contentWidth,
          "--nfs": nameFontSize,
          "--dfs": desFontSize,
          "--d-tw": thumbWidth,
          "--d-th": thumbHeight,
          "--d-top": thumbTop,
          "--d-tl": thumbStartLeft,
          "--d-gap": thumbGap,
          "--ph": progressHeight,
        }}
      >
        <div ref={listRef} className="h-full w-full">
          {ordered.map((slide, i) => {
            const index = (i - 1 + total) % total;
            return (
              <div
                key={index}
                data-index={index}
                className="slider-item group/item absolute left-[var(--tl)] top-[var(--top)] z-[100] h-[var(--th)] w-[var(--tw)] overflow-hidden rounded-[20px] shadow-[0_25px_50px_rgba(0,0,0,0.25)] [transform:translateY(-70%)] [transition:left_1s,top_1s,transform_1s,width_1s,height_1s,border-radius_1s] [&:nth-child(-n+2)]:left-0 [&:nth-child(-n+2)]:top-0 [&:nth-child(-n+2)]:h-full [&:nth-child(-n+2)]:w-full [&:nth-child(-n+2)]:rounded-none [&:nth-child(-n+2)]:[transform:translate(0,0)] [&:nth-child(4)]:[left:calc(var(--tl)_+_var(--tg))] [&:nth-child(5)]:[left:calc(var(--tl)_+_var(--tg)_*_2)] [&:nth-child(6)]:[left:calc(var(--tl)_+_var(--tg)_*_3)] [&:nth-child(n+7)]:opacity-0 [&:nth-child(n+7)]:[left:calc(var(--tl)_+_var(--tg)_*_4)] group-[.slider-next]/c:[&:nth-child(1)]:-left-full group-[.slider-prev]/c:[&:nth-child(2)]:-left-full group-[.slider-prev]/c:[&:nth-child(3)]:left-0 group-[.slider-prev]/c:[&:nth-child(3)]:top-0 group-[.slider-prev]/c:[&:nth-child(3)]:h-full group-[.slider-prev]/c:[&:nth-child(3)]:w-full group-[.slider-prev]/c:[&:nth-child(3)]:rounded-none group-[.slider-prev]/c:[&:nth-child(3)]:[transform:translate(0,0)]"
              >
                <img
                  src={slide.image}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover ${grayscale ? "grayscale" : ""
                    }`}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.72),rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.05)),linear-gradient(to_top,rgba(0,0,0,0.55),transparent_40%)]"
                />

                <span className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium group-[:nth-child(-n+2)]/item:hidden max-[690px]:hidden">
                  {slide.name}
                </span>

                <div className="hidden w-[var(--d-cw)] max-w-[calc(100vw-var(--cl)-1.25rem)] [transform:translateY(-50%)] group-[:nth-child(2)]/item:block absolute left-[var(--cl)] top-1/2 max-[690px]:top-[40%]">

                  <div className="mt-3 animate-[sliderContentIn_1s_ease-in-out_0.6s_1_forwards] text-[length:var(--nfs)] font-extrabold uppercase leading-[0.85] tracking-[-0.02em] opacity-0 [font-stretch:75%]">
                    {slide.name}
                  </div>

                  <div className="mt-6 max-w-[34ch] animate-[sliderContentIn_1s_ease-in-out_0.9s_1_forwards] text-[length:var(--dfs)] font-light leading-relaxed text-white/75 opacity-0">
                    {slide.description}
                  </div>

                  <div className="mt-8 flex animate-[sliderContentIn_1s_ease-in-out_1.2s_1_forwards] gap-3 opacity-0">
                    <a
                      href={primaryHref}
                      className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] transition duration-300 hover:bg-white/80 max-[690px]:px-4 max-[690px]:py-2.5"
                    >
                      {primaryLabel}
                    </a>
                    <a
                      href={secondaryHref}
                      className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-white hover:bg-white hover:text-black max-[690px]:px-4 max-[690px]:py-2.5"
                    >
                      {secondaryLabel}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-[10%] left-[var(--cl)] z-[100] flex items-center gap-4 max-[690px]:bottom-[24%]">
          <button
            type="button"
            aria-label={prevLabel}
            className={arrowBtn}
            onClick={() => showSlider("prev")}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            className={arrowBtn}
            onClick={() => showSlider("next")}
          >
            <Chevron dir="right" />
          </button>
          <span className="ml-2 text-sm tabular-nums text-white/70">
            <span ref={counterRef} className="text-white">
              {pad(1)}
            </span>{" "}
            {counterOf} {pad(total)}
          </span>
        </div>

        <div
          ref={progressRef}
          className="absolute left-0 top-0 z-[1000] h-[var(--ph)] w-0 bg-[var(--accent)]"
        />
      </div>
    </>
  );
}