"use client";

import { useEffect, useId, useRef } from "react";

// ─── RandomGridTransition ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #000000    Page background color
// textColor          string   #ffffff    Text + grid cells + progress-bar fill color
// slides             array    [see DEFAULT_SLIDES]  [{ image, kicker, title, description }] — one grid-reveal transition per slide
// mobileCols         number   6          Grid column count at/below mobileBreakpoint
// tabletCols         number   10         Grid column count at/below tabletBreakpoint
// desktopCols        number   14         Grid column count above tabletBreakpoint
// mobileBreakpoint   number   599        Max width (px) considered "mobile"
// tabletBreakpoint   number   1024       Max width (px) considered "tablet"
// cellStagger        number   0.02       Stagger (s) between each shuffled cell's fade-in
// scrubAmount        number   2.5        Scroll-scrub smoothing for the master reveal timeline
// lerp               number   0.15       Lenis smoothing amount (lower = smoother/slower)
// showIntro          boolean  true       Show the intro spacer section before the sticky stage
// introTitle         string   "On-Scroll Mask Transitions"  Intro heading
// introSubtitle      string   "Random Grid"  Intro sub-heading (shown dimmed under the title)
// introHint          string   "Scroll down"  Small hint under the intro heading
// showOutro          boolean  true       Show the outro spacer section after the sticky stage
// outroText          string   "End of transition"  Text shown in the outro spacer
// showProgressBar    boolean  true       Show the segmented scroll-progress bar at the bottom of the stage
// titleFontFamily    string   "'Playfair Display', serif"  Font for slide titles + intro/outro headings (loaded from Google Fonts automatically)
// bodyFontFamily     string   system sans stack  Font for descriptions and the intro hint
// labelFontFamily    string   "'Space Mono', monospace"  Font for the index counter + kicker tag (loaded from Google Fonts automatically)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=1600&q=80",
    kicker: "Chapter One",
    title: "First Light",
    description:
      "Each image is masked by a grid of cells that fade in at random as you scroll, dissolving into the next composition.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1600&q=80",
    kicker: "Chapter Two",
    title: "Between Frames",
    description:
      "No two cells reveal in the same order twice, giving every scroll pass a slightly different rhythm.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1600&q=80",
    kicker: "Chapter Three",
    title: "Final Reveal",
    description:
      "A closing sequence that ties the transition together, timed precisely to the scroll position rather than the clock.",
  },
];

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

const loadFont = (href) => {
  if (document.querySelector(`link[data-id="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-id", href);
  document.head.appendChild(link);
};

const SVG_NS = "http://www.w3.org/2000/svg";

export default function RandomGridTransition({
  bgColor = "#000000",
  textColor = "#ffffff",
  slides = DEFAULT_SLIDES,
  mobileCols = 6,
  tabletCols = 10,
  desktopCols = 14,
  mobileBreakpoint = 599,
  tabletBreakpoint = 1024,
  cellStagger = 0.02,
  scrubAmount = 2.5,
  lerp = 0.15,
  showIntro = true,
  introTitle = "On-Scroll Mask Transitions",
  introHint = "Scroll down",
  showOutro = true,
  outroText = "End of transition",
  showProgressBar = true,
  titleFontFamily = "'Playfair Display', serif",
  bodyFontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  labelFontFamily = "'Space Mono', monospace",
}) {
  const uid = useId().replace(/:/g, "");

  const stageRef = useRef(null);
  const svgRefs = useRef([]);
  const groupRefs = useRef([]);
  const maskRectRefs = useRef([]);
  const imageRefs = useRef([]);
  const textRefs = useRef([]);
  const progressFillRefs = useRef([]);

  const lenisRef = useRef(null);
  const tickerFnRef = useRef(null);
  const masterRef = useRef(null);
  const progressTriggerRef = useRef(null);
  const resizeTimerRef = useRef(null);

  useEffect(() => {
    loadFont(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&family=Space+Mono:wght@400;700&display=swap",
    );

    let cancelled = false;

    const scripts = [
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      ),
      loadScript("https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"),
    ];

    Promise.all(scripts)
      .then(() => {
        if (cancelled) return;
        const { gsap, ScrollTrigger, Lenis } = window;
        if (!gsap || !ScrollTrigger || !stageRef.current) return;

        gsap.registerPlugin(ScrollTrigger);
        gsap.config({ trialWarn: false });

        // ── Lenis smooth scroll ───────────────────────────────────────
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        const lenis = new Lenis({
          lerp,
          smoothWheel: true,
          smoothTouch: !isTouch,
        });
        lenisRef.current = lenis;
        lenis.on("scroll", ScrollTrigger.update);

        const tickerFn = (time) => lenis.raf(time * 1000);
        tickerFnRef.current = tickerFn;
        gsap.ticker.add(tickerFn);

        // ── responsive column count ────────────────────────────────────
        const getGridCols = () => {
          if (window.innerWidth <= mobileBreakpoint) return mobileCols;
          if (window.innerWidth <= tabletBreakpoint) return tabletCols;
          return desktopCols;
        };

        // ── build grid cells for one <g> element ────────────────────────
        const createCells = (groupEl) => {
          if (!groupEl) return null;
          groupEl.innerHTML = "";

          const width = window.innerWidth;
          const height = window.innerHeight;
          const vbWidth = 100;
          const vbHeight = (height / width) * 100;

          const cols = getGridCols();
          const rows = Math.round(cols * (vbHeight / vbWidth));

          const cellW = vbWidth / cols;
          const cellH = vbHeight / rows;

          const cells = [];

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const rect = document.createElementNS(SVG_NS, "rect");
              rect.setAttribute("x", x * cellW);
              rect.setAttribute("y", y * cellH);
              rect.setAttribute("width", cellW);
              rect.setAttribute("height", cellH);
              rect.setAttribute("fill", "white");
              rect.setAttribute("shape-rendering", "crispEdges");
              rect.setAttribute("opacity", 0);

              groupEl.appendChild(rect);
              cells.push(rect);
            }
          }

          return cells;
        };

        // ── open animation for one image's grid ─────────────────────────
        const openGrid = (cells) => {
          const shuffled = gsap.utils.shuffle([...cells]);
          return gsap.timeline().to(shuffled, {
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
            stagger: { each: cellStagger },
          });
        };

        const textIn = (el) =>
          gsap.to(el, {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 2.6,
            ease: "expo.out",
          });

        const textOut = (el) =>
          gsap.to(el, {
            clipPath: "inset(0% 0% 100% 0%)",
            y: 0,
            duration: 2.0,
            ease: "power2.inOut",
          });

        // ── master scrubbed timeline ─────────────────────────────────
        const buildMasterTimeline = (cellSets) => {
          if (masterRef.current) masterRef.current.kill();

          const texts = textRefs.current.filter(Boolean);

          masterRef.current = gsap.timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: scrubAmount,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          cellSets.forEach((cells, i) => {
            masterRef.current.add(openGrid(cells));
            if (texts[i]) {
              masterRef.current.add(textIn(texts[i]), "-=0.3");
              masterRef.current.add(textOut(texts[i]), "+=0.8");
            }
          });
        };

        // ── layout (re)build, called on mount + resize ─────────────────
        const updateLayout = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const vbWidth = 100;
          const vbHeight = (height / width) * 100;

          const cellSets = [];

          svgRefs.current.filter(Boolean).forEach((svg, i) => {
            svg.setAttribute("viewBox", `0 0 ${vbWidth} ${vbHeight}`);

            const maskRect = maskRectRefs.current[i];
            if (maskRect) {
              maskRect.setAttribute("width", vbWidth);
              maskRect.setAttribute("height", vbHeight);
            }

            const img = imageRefs.current[i];
            if (img) {
              img.setAttribute("width", vbWidth);
              img.setAttribute("height", vbHeight);
            }

            const cells = createCells(groupRefs.current[i]);
            if (cells) cellSets.push(cells);
          });

          buildMasterTimeline(cellSets);
        };

        // ── progress bar ─────────────────────────────────────────────
        const initProgressBar = () => {
          const fills = progressFillRefs.current.filter(Boolean);
          if (fills.length === 0) return;

          progressTriggerRef.current = ScrollTrigger.create({
            trigger: stageRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
            onUpdate: (self) => {
              const progress = self.progress;
              const totalSteps = fills.length;
              fills.forEach((fill, i) => {
                let p = (progress - i / totalSteps) * totalSteps;
                p = Math.max(0, Math.min(1, p));
                fill.style.width = `${p * 100}%`;
              });
            },
          });
        };

        updateLayout();
        initProgressBar();

        const onResize = () => {
          clearTimeout(resizeTimerRef.current);
          resizeTimerRef.current = setTimeout(() => {
            ScrollTrigger.refresh();
            updateLayout();
          }, 250);
        };
        window.addEventListener("resize", onResize);

        stageRef.current._cleanup = () => {
          window.removeEventListener("resize", onResize);
          clearTimeout(resizeTimerRef.current);
        };
      })
      .catch((e) =>
        console.error("[RandomGridTransition] Setup failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (stageRef.current?._cleanup) stageRef.current._cleanup();
      if (masterRef.current) masterRef.current.kill();
      if (progressTriggerRef.current) progressTriggerRef.current.kill();
      if (tickerFnRef.current && window.gsap) {
        window.gsap.ticker.remove(tickerFnRef.current);
      }
      if (lenisRef.current) lenisRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ backgroundColor: bgColor, color: textColor }}>
      {showIntro && (
        <div className="grid h-screen place-items-center px-6 text-center">
          <div className="flex flex-col items-center gap-6">
            <h1
              className="leading-[0.9] tracking-tight"
              style={{
                fontFamily: titleFontFamily,
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
              }}
            >
              {introTitle}
            </h1>
            <div className="flex flex-col items-center gap-3">
              <span
                className="text-sm uppercase tracking-[0.2em] opacity-60"
                style={{ fontFamily: bodyFontFamily }}
              >
                {introHint}
              </span>
              <svg
                viewBox="0 0 16 9"
                className={`${uid}-chevron h-2.5 w-4 opacity-60`}
                fill="none"
              >
                <path
                  d="M1 1l7 7 7-7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      <section
        ref={stageRef}
        className="relative"
        style={{ height: `${slides.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-screen overflow-hidden">
          {slides.map((slide, i) => (
            <svg
              key={i}
              ref={(el) => (svgRefs.current[i] = el)}
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <mask id={`${uid}-mask${i}`} maskUnits="userSpaceOnUse">
                  <rect
                    ref={(el) => (maskRectRefs.current[i] = el)}
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    fill="black"
                  />
                  <g ref={(el) => (groupRefs.current[i] = el)} />
                </mask>
              </defs>
              <image
                ref={(el) => (imageRefs.current[i] = el)}
                href={slide.image}
                x="0"
                y="0"
                width="100"
                height="100"
                preserveAspectRatio="xMidYMid slice"
                mask={`url(#${uid}-mask${i})`}
                style={{ filter: "brightness(0.75)" }}
              />
            </svg>
          ))}

          {slides.map((slide, i) => (
            <div
              key={i}
              ref={(el) => (textRefs.current[i] = el)}
              className="absolute inset-0 flex flex-col justify-between p-6 normal-case sm:p-12 lg:p-16"
              style={{
                clipPath: "inset(100% 0 0 0)",
                transform: "translateY(40px)",
              }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="text-xs tracking-[0.15em] opacity-50"
                  style={{ fontFamily: labelFontFamily }}
                >
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
                <span
                  className="rounded-full border px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] sm:text-xs"
                  style={{
                    fontFamily: labelFontFamily,
                    borderColor: `${textColor}4d`,
                  }}
                >
                  {slide.kicker}
                </span>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <h2
                  className="max-w-3xl leading-[0.85] tracking-tight"
                  style={{
                    fontFamily: titleFontFamily,
                    fontSize: "clamp(2.5rem, 7vw, 7rem)",
                  }}
                >
                  {slide.title}
                </h2>
                {slide.description && (
                  <p
                    className="max-w-xs text-sm leading-relaxed opacity-70 sm:text-base lg:text-right"
                    style={{ fontFamily: bodyFontFamily }}
                  >
                    {slide.description}
                  </p>
                )}
              </div>
            </div>
          ))}

          {showProgressBar && (
            <div className="absolute bottom-0 z-20 flex w-full gap-4 p-8">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="relative h-[2px] flex-1 overflow-hidden"
                  style={{ backgroundColor: `${textColor}33` }}
                >
                  <div
                    ref={(el) => (progressFillRefs.current[i] = el)}
                    className="absolute left-0 top-0 h-full w-0"
                    style={{ backgroundColor: textColor }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showOutro && (
        <div className="grid h-screen place-items-center px-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <span
              className="text-xs tracking-[0.3em] opacity-40"
              style={{ fontFamily: labelFontFamily }}
            >
              — FIN —
            </span>
            <h1
              className="leading-[0.9] tracking-tight opacity-70"
              style={{
                fontFamily: titleFontFamily,
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
              }}
            >
              {outroText}
            </h1>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${uid}-chevron {
              animation: ${uid}-bounce 1.6s ease-in-out infinite;
            }
            @keyframes ${uid}-bounce {
              0%, 100% { transform: translateY(0); opacity: 0.6; }
              50% { transform: translateY(4px); opacity: 0.3; }
            }
          `,
        }}
      />
    </div>
  );
}
