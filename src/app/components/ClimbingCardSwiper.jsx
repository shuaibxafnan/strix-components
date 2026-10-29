"use client";

import { useEffect, useRef } from "react";

const SWIPER_CSS =
  "https://cdn.jsdelivr.net/npm/swiper@11.1.14/swiper-bundle.min.css";
const SWIPER_JS =
  "https://cdn.jsdelivr.net/npm/swiper@11.1.14/swiper-bundle.min.js";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=840&h=1080&q=80`;

const DEFAULT_SLIDES = [
  {
    img: photo("1749330513873-09ffa91b0aae"),
    title: "First light",
    caption: "The hour before anything has a shadow.",
  },
  {
    img: photo("1627896157734-4d7d4388f28b"),
    title: "Slow ground",
    caption: "Surfaces that remember every season.",
  },
  {
    img: photo("1778961938903-96617183f739"),
    title: "Low tide",
    caption: "What the sea leaves behind when it leaves.",
  },
  {
    img: photo("1678112553355-a9dab855ebf3"),
    title: "Open air",
    caption: "Nothing between the horizon and you.",
  },
  {
    img: photo("1743309411498-a0f4f4b96b65"),
    title: "Last warmth",
    caption: "The long exhale of a day well spent.",
  },
  {
    img: photo("1490682143684-14369e18dce8"),
    title: "Quiet hours",
    caption: "A town with its lights half out.",
  },
  {
    img: photo("1634325232058-e7b8f80cc20b"),
    title: "Soft weather",
    caption: "Gray skies and a good excuse to stay in.",
  },
  {
    img: photo("1759458856846-097935f54111"),
    title: "Cold and clear",
    caption: "Every edge a little sharper than yesterday.",
  },
];

const loadCSS = (href) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[data-id="${href}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", resolve);
        existing.addEventListener("error", reject);
      }
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-id", href);
    link.onload = () => {
      link.dataset.loaded = "true";
      resolve();
    };
    link.onerror = reject;
    document.head.appendChild(link);
  });

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-id="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", resolve);
        existing.addEventListener("error", reject);
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.setAttribute("data-id", src);
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

const TILTS = [
  "-rotate-[2.5deg]",
  "rotate-[2deg]",
  "-rotate-[1deg]",
  "rotate-[3deg]",
];

export default function ClimbingCardSwiper({
  slides = DEFAULT_SLIDES,
  bgColor = "#0a0a0a",
  fontFamily = "Schibsted Grotesk",
  titleFont = "Caveat",
  cardWidth = "420px",
  cardHeight = "540px",
  rotateAngle = 40,
  slideDepth = 140,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let swiper;

    Promise.all([loadCSS(SWIPER_CSS), loadScript(SWIPER_JS)])
      .then(() => {
        const { Swiper } = window;
        if (cancelled || !Swiper || !containerRef.current) return;

        swiper = new Swiper(containerRef.current, {
          effect: "coverflow",
          loop: true,
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: 1,
          coverflowEffect: {
            rotate: rotateAngle,
            stretch: -20,
            depth: slideDepth,
            modifier: 1,
            slideShadows: false,
          },
          breakpoints: {
            320: { slidesPerView: 1.4 },
            580: { slidesPerView: 1.8 },
            767: { slidesPerView: 2.4 },
            992: { slidesPerView: 2.8 },
            1200: { slidesPerView: 3.4 },
            1400: { slidesPerView: 3.8 },
          },
        });
      })
      .catch((err) =>
        console.error("[ClimbingCardSwiper] Swiper failed to load:", err),
      );

    return () => {
      cancelled = true;
      if (swiper) swiper.destroy(true, true);
    };
  }, [rotateAngle, slideDepth, slides.length]);

  return (
    <div
      className="relative flex min-h-screen w-full select-none items-center justify-center overflow-hidden bg-[var(--bg)] py-16 font-[family-name:var(--font)]"
      style={{
        "--bg": bgColor,
        "--font": `"${fontFamily}", sans-serif`,
        "--title-font": `"${titleFont}", serif`,
        "--cw": cardWidth,
        "--ch": cardHeight,
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
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Schibsted+Grotesk:wght@400;500&display=swap"
      />

      <div ref={containerRef} className="swiper w-full overflow-visible pb-12 pt-8">
        <div className="swiper-wrapper py-16">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              style={{ height: "var(--ch)", width: "var(--cw)" }}
              className="swiper-slide group"
            >
              <div
                className={`flex h-full w-full flex-col rounded-[3px] bg-[linear-gradient(180deg,#f8f5ee,#eee8da)] p-[14px] shadow-[0_28px_50px_-14px_rgba(0,0,0,0.75)] brightness-[0.62] transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-[.swiper-slide-active]:rotate-0 group-[.swiper-slide-active]:brightness-100 ${TILTS[idx % TILTS.length]
                  }`}
              >
                <div className="relative min-h-0 flex-1 overflow-hidden bg-neutral-300">
                  <img
                    src={slide.img}
                    alt={slide.alt ?? slide.title}
                    loading="lazy"
                    className="h-full w-full object-cover contrast-[1.05] saturate-[0.9] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
                </div>

                <div className="h-[118px] shrink-0 px-1 pt-4 text-[#2a2723]">
                  <h3 className="font-[family-name:var(--title-font)] text-[2.4rem] font-bold leading-none">
                    {slide.title}
                  </h3>
                  <p className="mt-2 max-w-[34ch] text-[0.8rem] leading-snug text-[#6a645b] [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-[1200ms] ease-out group-[.swiper-slide-active]:delay-300 group-[.swiper-slide-active]:[clip-path:inset(0_0_0_0)]">
                    {slide.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}