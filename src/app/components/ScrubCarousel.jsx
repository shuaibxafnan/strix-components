"use client";

import { useEffect, useId, useRef } from "react";

// ─── ScrollSyncedCarousel ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #0a0a0a        Page/section background
// textColor          string   #f5f5f5        Heading + body base color
// mutedColor         string   #6b6b6b        Muted/secondary text (descriptions, index numbers)
// accentColor        string   #ff2b1f        Stark accent — slide badge, links, active nav button
// gridColor          string   #2a2a2a        Grid-line / border color used everywhere
// sections           array    [see below]    Array of carousel section configs (see shape below)
// slidesPerView      number   2.25           Desktop slides visible at once
// slidesPerViewMobile number  1.05           Mobile (<mdBreakpoint) slides visible at once
// gap                string   0rem           Gap between slides (desktop) — 0 by default so grid lines touch
// gapMobile          string   0rem           Gap between slides (mobile)
// mdBreakpoint        number   820            Pixel width where mobile layout kicks in
// maxWrapperWidth     string   90rem          Max width each carousel's track is measured against
// sidePadding          string  "1rem"          Horizontal padding shared by header row + slide track (keeps them aligned)
// sidePaddingMd         string  "2rem"          Horizontal padding at md breakpoint+
// headingFont         string   "Space Grotesk, sans-serif"   Font stack for display headings
// bodyFont             string  "Inter, sans-serif"           Font stack for paragraph/label text
// monoFont             string  "JetBrains Mono, monospace"   Font stack for index numbers + metadata
// ctaLabel             string  "SOURCE"                      Text shown next to each card's link
//
// Each entry in `sections` has this shape:
// {
//   id: "collapse",
//   heading: "Fragments of a Digital Collapse.",
//   scrub: true,                    // true = pinned + scroll-scrubbed, false = free swipe (arrows only, no dots)
//   scrubDirection: 1,               // 1 = normal, -1 = reversed scrub direction
//   aspectRatio: "8 / 5",
//   aspectRatioMobile: "4 / 3",
//   slides: [{ image, alt, title, description }, ...],
// }
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SECTIONS = [
  {
    id: "collapse",
    heading: "Fragments of a Digital Collapse.",
    scrub: true,
    scrubDirection: 1,
    aspectRatio: "8 / 5",
    aspectRatioMobile: "4 / 3",
    slides: [
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-01.png",
        alt: "Exploding digital billboard structure",
        title: "Billboard Implosion",
        description:
          "A towering billboard disintegrates into sharp shards and tangled frames, caught mid-collapse in a surreal desert landscape.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-02.png",
        alt: "Twisted billboard becoming a sculpture",
        title: "Signal Vortex",
        description:
          "A digital storm of wires and signage spirals upward, twisting collapsed signage into a sculpture of chaotic motion.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-03.png",
        alt: "Giant shark built from mechanical debris",
        title: "Machine Shark",
        description:
          "A monstrous shark forged from steel and circuitry erupts from the ground, jaws wide in mechanical fury.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-04.png",
        alt: "Decomposed cartoon head in desert",
        title: "Desert Mascot Ruin",
        description:
          "A decaying robotic icon lies half-buried in sand, its twisted mouth agape like a relic from a lost theme park.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-05.png",
        alt: "Exploding structure of digital billboards",
        title: "Outburst of Screens",
        description:
          "An eruption of digital panels and wires tears through the desert silence in a spectacular burst of tech debris.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-06.png",
        alt: "Swirling paper chaos in industrial yard",
        title: "Twister of Sheets",
        description:
          "A whirlwind of tangled wire and flying sheets twists through a barren yard like a storm made of sketches.",
      },
    ],
  },
  {
    id: "broadcasts",
    heading: "Broadcasts from a Broken World.",
    scrub: false,
    scrubDirection: 1,
    aspectRatio: "1 / 1",
    aspectRatioMobile: "1 / 1",
    slides: [
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-07.png",
        alt: "Glitched mouse character with distorted facial features",
        title: "Glitch Mascot Face",
        description:
          "An iconic cartoon face fragments into digital decay, smiling eerily through bands of static distortion.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-08.png",
        alt: "Exploding structure of a giant cartoon mouse head",
        title: "Mascot in Ruin",
        description:
          "A once-cheerful icon collapses violently, scattering wooden debris across a barren digital wasteland.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-09.png",
        alt: "Organic architecture glitching in desert",
        title: "Pixel Spire",
        description:
          "A twisted tower of organic forms disintegrates under digital strain, architecture rewired by corruption.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-10.png",
        alt: "Collapsed alien-looking structure with glitch effects",
        title: "Cradle of Collapse",
        description:
          "An alien form splinters apart in the heat, held together by threads of unreality.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-11.png",
        alt: "Cartoon dog statue overtaken by mechanical wires",
        title: "Playland Remains",
        description:
          "A cartoon dog gives a thumbs up from a mound of wreckage, half-cheerful, half-abandoned by time.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-12.png",
        alt: "Distorted mickey-shaped head floating above desert",
        title: "Echo in the Dust",
        description:
          "Suspended above a wasteland, a fragmented relic hovers like the ghost of a forgotten broadcast dream.",
      },
    ],
  },
  {
    id: "artifacts",
    heading: "Artifacts of Collapse.",
    scrub: true,
    scrubDirection: -1,
    aspectRatio: "3 / 3.25",
    aspectRatioMobile: "4 / 3",
    slides: [
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-13.png",
        alt: "Pagoda-like structure breaking apart with glitch fragments",
        title: "Fractured Pagoda",
        description:
          "A spiraling structure collapses into shards under digital wind, disassembled by glitching vectors.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-14.png",
        alt: "Detached mouse mascot head with cables in post-apocalyptic setting",
        title: "Lost Icon Head",
        description:
          "A familiar character's head lies split on the asphalt, wireframe nerves still twitching at sunset.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-15.png",
        alt: "Billboard structure spiraling into a digital tornado",
        title: "Billboard Tornado",
        description:
          "What once was signage twists into a data-storm, pulling itself skyward from the desert floor.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-16.png",
        alt: "Glitch-formed ocean wave crashing under a digital sun",
        title: "Wave Error",
        description:
          "A great crest of glitch surges forward like a corrupted tsunami, its foam pixelated into static.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-17.png",
        alt: "Cartoon character face melting through glitch distortions",
        title: "Smile Collapse",
        description:
          "A distorted character smiles through fractured pixels, cheer smeared across broken data streams.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-18.png",
        alt: "Constructed mascot face from patched metal with glitching",
        title: "Mascot Redux",
        description:
          "Mechanical ears and a stitched smile define a rebuilt amusement relic, warped by wear.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-19.png",
        alt: "Cybernetic shark erupting through ground debris",
        title: "Steel Shark",
        description:
          "A serrated predator bursts through layers of earth and code, jaws open in mechanical frenzy.",
      },
      {
        image:
          "https://www.lessrain.com/dev/images-2025/carousel/lr-demo-img-20.png",
        alt: "Curved wave of threads and clouds in surreal motion",
        title: "Threaded Tide",
        description:
          "A wave of winding lines and cloud wisps curls in slow motion, frozen between reality and render.",
      },
    ],
  },
];

export default function ScrubCarousel({
  bgColor = "#0a0a0a",
  textColor = "#f5f5f5",
  mutedColor = "#6b6b6b",
  accentColor = "#ff2b1f",
  gridColor = "#2a2a2a",
  sections = DEFAULT_SECTIONS,
  slidesPerView = 2.25,
  slidesPerViewMobile = 1.05,
  gap = "0rem",
  gapMobile = "0rem",
  mdBreakpoint = 820,
  sidePadding = "1rem",
  sidePaddingMd = "2rem",
  headingFont = "Space Grotesk, sans-serif",
  bodyFont = "Inter, sans-serif",
  monoFont = "JetBrains Mono, monospace",
  ctaLabel = "SOURCE",
}) {
  const uid = useId().replace(/:/g, "");
  const wrapperRef = useRef(null);
  const swiperInstances = useRef([]);
  const scrollTriggers = useRef([]);

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    const loadStyle = (href) =>
      new Promise((resolve) => {
        if (document.querySelector(`link[data-id="${href}"]`)) {
          resolve();
          return;
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute("data-id", href);
        link.onload = resolve;
        link.onerror = resolve;
        document.head.appendChild(link);
      });

    let rafId;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    Promise.all([
      loadStyle("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"),
      loadScript("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      ),
    ])
      .then(() => {
        const { gsap, ScrollTrigger, Swiper } = window;
        if (!gsap || !ScrollTrigger || !Swiper || !wrapperRef.current) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({
          limitCallbacks: true,
          ignoreMobileResize: true,
        });

        sections.forEach((section) => {
          const root = wrapperRef.current.querySelector(
            `[data-carousel="${section.id}-${uid}"]`,
          );
          if (!root) return;

          const swiperEl = root.querySelector(".swiper");
          const wrapperEl = swiperEl?.querySelector(".swiper-wrapper");
          const nextEl = root.querySelector(".swiper-next-btn");
          const prevEl = root.querySelector(".swiper-prev-btn");
          if (!swiperEl || !wrapperEl) return;

          const isScrubActive = section.scrub && !isTouch;

          const swiper = new Swiper(swiperEl, {
            slidesPerView,
            spaceBetween: parseFloat(gap) * 16 || 0,
            breakpoints: {
              0: {
                slidesPerView: slidesPerViewMobile,
                spaceBetween: parseFloat(gapMobile) * 16 || 0,
              },
              [mdBreakpoint]: {
                slidesPerView,
                spaceBetween: parseFloat(gap) * 16 || 0,
              },
            },
            centeredSlides: true,
            speed: 700,
            grabCursor: !isScrubActive,
            watchSlidesProgress: true,
            resistanceRatio: 0.85,
            allowTouchMove: !isScrubActive || isTouch,
            pagination: false,
            navigation:
              !isScrubActive && nextEl && prevEl ? { nextEl, prevEl } : false,
            on: {
              progress(sw) {
                sw.slides.forEach((slide) => {
                  const p = Math.min(1, Math.max(-1, slide.progress ?? -1));
                  const abs = Math.min(0.85, Math.max(0.25, Math.abs(p)));
                  const opacity = 0.25 + ((0.85 - abs) / (0.85 - 0.25)) * 0.75;
                  slide.style.opacity = String(opacity.toFixed(3));
                });
              },
            },
          });
          swiperInstances.current.push(swiper);

          if (isScrubActive) {
            swiperEl.classList.add("swiper-no-swiping");

            const dir = section.scrubDirection === -1 ? -1 : 1;

            const st = ScrollTrigger.create({
              id: `carousel-${section.id}-${uid}`,
              trigger: wrapperEl,
              pin: swiperEl,
              pinSpacing: true,
              scrub: true,
              invalidateOnRefresh: true,
              start: () =>
                `${wrapperEl.offsetHeight * 0.5}px ${window.innerHeight * 0.5}px`,
              end: () =>
                `+=${Math.max(
                  swiperEl.offsetWidth,
                  swiper.slides.length * window.innerHeight * 0.5,
                )}`,
              onUpdate: (self) => {
                const progress = dir === -1 ? 1 - self.progress : self.progress;
                const min = swiper.minTranslate();
                const max = swiper.maxTranslate();
                swiper.setTranslate((max - min) * progress + min);
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
              },
              onRefreshInit: () => {
                swiper.updateSize();
                swiper.updateSlides();
              },
            });
            scrollTriggers.current.push(st);
          }
        });

        rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
      })
      .catch((e) =>
        console.error("[ScrollSyncedCarousel] load failed:", e.message),
      );

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      scrollTriggers.current.forEach((st) => st.kill());
      scrollTriggers.current = [];
      swiperInstances.current.forEach((s) => s.destroy(true, true));
      swiperInstances.current = [];
    };
  }, [
    uid,
    sections,
    slidesPerView,
    slidesPerViewMobile,
    gap,
    gapMobile,
    mdBreakpoint,
  ]);

  const trackPaddingStyle = {
    paddingLeft: sidePadding,
    paddingRight: sidePadding,
  };
  const trackPaddingStyleMd = {
    "--pad-mobile": sidePadding,
    "--pad-md": sidePaddingMd,
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full [--pad:var(--pad-mobile)] md:[--pad:var(--pad-md)]"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        ...trackPaddingStyleMd,
      }}
    >
      <div
        className="flex w-full flex-col gap-6 border-b-2 py-10 md:flex-row md:items-end md:justify-between md:py-16"
        style={{
          borderColor: gridColor,
          paddingLeft: "var(--pad)",
          paddingRight: "var(--pad)",
        }}
      >
        <h1
          className="text-[13vw] font-bold uppercase leading-[0.85] tracking-tighter md:text-[6vw]"
          style={{ fontFamily: headingFont }}
        >
          Archive of
          <br />
          Collapse
        </h1>
        <span
          className="text-xs uppercase leading-relaxed md:text-right"
          style={{ color: mutedColor, fontFamily: monoFont }}
        >
          {sections.length.toString().padStart(2, "0")} SETS
          <br />
          SCROLL ↓
        </span>
      </div>

      {sections.map((section, idx) => (
        <section
          key={section.id}
          data-carousel={`${section.id}-${uid}`}
          className="relative block w-full border-b-2"
          style={{ borderColor: gridColor }}
        >
          <div
            className="flex w-full flex-wrap items-center justify-between gap-3 border-b-2 py-6"
            style={{
              borderColor: gridColor,
              paddingLeft: "var(--pad)",
              paddingRight: "var(--pad)",
            }}
          >
            <h2
              className="text-2xl font-bold uppercase leading-none tracking-tight md:text-5xl"
              style={{ fontFamily: headingFont }}
            >
              {section.heading}
            </h2>
            <span
              className="shrink-0 text-xs uppercase"
              style={{ color: accentColor, fontFamily: monoFont }}
            >
              [{String(idx + 1).padStart(2, "0")}/
              {String(sections.length).padStart(2, "0")}]
            </span>
          </div>

          <div
            className="swiper relative w-full overflow-hidden"
            style={{ paddingLeft: "var(--pad)", paddingRight: "var(--pad)" }}
          >
            <div className="swiper-wrapper">
              {section.slides.map((slide, slideIdx) => (
                <div
                  key={slideIdx}
                  className="swiper-slide h-auto border-r-2 transition-opacity duration-300"
                  style={{ borderColor: gridColor }}
                >
                  <div className="group relative flex h-full flex-col">
                    <div
                      className="relative w-full overflow-hidden"
                      style={{ aspectRatio: section.aspectRatio }}
                    >
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        width={1024}
                        height={1024}
                        loading={idx === 0 && slideIdx < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="pointer-events-none h-full w-full select-none object-cover object-center transition-[filter] duration-300 group-hover:brightness-75"
                      />
                      <div
                        className="pointer-events-none absolute left-0 top-0 flex h-8 w-8 items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: accentColor,
                          color: bgColor,
                          fontFamily: monoFont,
                        }}
                      >
                        {String(slideIdx + 1).padStart(2, "0")}
                      </div>
                    </div>

                    <div
                      className="flex flex-1 flex-col justify-between gap-4 border-t-2 p-4 md:p-5"
                      style={{ borderColor: gridColor }}
                    >
                      <div>
                        <h3
                          className="text-base font-bold uppercase leading-tight tracking-tight md:text-lg"
                          style={{ fontFamily: headingFont }}
                        >
                          {slide.title}
                        </h3>
                        <p
                          className="mt-2 line-clamp-3 text-sm leading-relaxed"
                          style={{ color: mutedColor }}
                        >
                          {slide.description}
                        </p>
                      </div>

                      <a
                        href="https://codepen.io/luis-lessrain/pen/ogNKBmx"
                        className="pointer-events-none inline-flex w-max items-center gap-2 text-xs font-bold uppercase tracking-widest"
                        style={{ color: accentColor, fontFamily: monoFont }}
                      >
                        {ctaLabel} →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!section.scrub && (
              <>
                <div
                  className="swiper-prev-btn pointer-events-auto absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-2 md:flex"
                  style={{
                    left: "var(--pad)",
                    backgroundColor: bgColor,
                    borderColor: gridColor,
                    color: textColor,
                  }}
                >
                  <svg
                    viewBox="0 0 40 40"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="m27.042 4.792 1.333 1.25-13.917 13.917 13.917 13.833-1.333 1.333-15.167-15.166L27.042 4.792z"
                    />
                  </svg>
                </div>
                <div
                  className="swiper-next-btn pointer-events-auto absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-2 md:flex"
                  style={{
                    right: "var(--pad)",
                    backgroundColor: accentColor,
                    borderColor: gridColor,
                    color: bgColor,
                  }}
                >
                  <svg
                    viewBox="0 0 40 40"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="m13.208 35.125-1.333-1.25 13.917-13.917L11.875 6.125l1.333-1.333 15.167 15.166Z"
                    />
                  </svg>
                </div>
              </>
            )}
          </div>
        </section>
      ))}

      <div
        className="flex items-center justify-between py-10"
        style={{ paddingLeft: "var(--pad)", paddingRight: "var(--pad)" }}
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: mutedColor, fontFamily: monoFont }}
        >
          END OF ARCHIVE
        </span>
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: accentColor, fontFamily: monoFont }}
        >
          ↑ TOP
        </span>
      </div>
    </div>
  );
}
