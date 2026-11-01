"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1600&q=80",
    kicker: "Chapter One",
    title: "First Light",
    description:
      "Each image is masked by a grid of cells that opens column by column, left to right, with a random order inside each column.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1600&q=80",
    kicker: "Chapter Two",
    title: "Between Frames",
    description:
      "The sweep gives the reveal a clear direction while still feeling organic, thanks to the shuffled cells within each column.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1600&q=80",
    kicker: "Chapter Three",
    title: "Final Reveal",
    description:
      "A closing sequence that ties the transition together, timed precisely to the scroll position rather than the clock.",
  },
];

const loadFont = (href) => {
  if (document.querySelector(`link[data-id="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-id", href);
  document.head.appendChild(link);
};

const SVG_NS = "http://www.w3.org/2000/svg";

export default function ColumnGridTransition({
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
  showProgressBar = true,
  titleFontFamily = "'Playfair Display', serif",
  bodyFontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  labelFontFamily = "'Space Mono', monospace",
  className = "",
}) {
  const uid = useId().replace(/:/g, "");

  const stageRef = useRef(null);
  const svgRefs = useRef([]);
  const groupRefs = useRef([]);
  const maskRectRefs = useRef([]);
  const imageRefs = useRef([]);
  const textRefs = useRef([]);
  const progressFillRefs = useRef([]);

  const gsapRef = useRef(null);
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

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ])
      .then(([gsapMod, stMod, lenisMod]) => {
        if (cancelled) return;
        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const Lenis = lenisMod.default || lenisMod.Lenis;
        if (!stageRef.current) return;
        gsapRef.current = gsap;

        gsap.registerPlugin(ScrollTrigger);
        gsap.config({ trialWarn: false });

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

        const getGridCols = () => {
          if (window.innerWidth <= mobileBreakpoint) return mobileCols;
          if (window.innerWidth <= tabletBreakpoint) return tabletCols;
          return desktopCols;
        };

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

          return { cells, rows, cols };
        };

        const openGrid = ({ cells, rows, cols }) => {
          const ordered = [];

          for (let x = 0; x < cols; x++) {
            const column = [];
            for (let y = 0; y < rows; y++) {
              const index = y * cols + x;
              column.push(cells[index]);
            }
            ordered.push(...gsap.utils.shuffle(column));
          }

          return gsap.timeline().to(ordered, {
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: { each: cellStagger },
          });
        };

        const textIn = (el) =>
          gsap.to(el, {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 2.2,
            ease: "expo.out",
          });

        const textOut = (el) =>
          gsap.to(el, {
            clipPath: "inset(0% 0% 100% 0%)",
            y: 0,
            duration: 1.6,
            ease: "power2.inOut",
          });

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

          cellSets.forEach((set, i) => {
            masterRef.current.add(openGrid(set));
            if (texts[i]) {
              masterRef.current.add(textIn(texts[i]), "-=0.3");
              masterRef.current.add(textOut(texts[i]), "+=0.8");
            }
          });
        };

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
        console.error("[ColumnGridTransition] Setup failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (stageRef.current?._cleanup) stageRef.current._cleanup();
      if (masterRef.current) masterRef.current.kill();
      if (progressTriggerRef.current) progressTriggerRef.current.kill();
      if (tickerFnRef.current && gsapRef.current) {
        gsapRef.current.ticker.remove(tickerFnRef.current);
      }
      if (lenisRef.current) lenisRef.current.destroy();
    };

  }, []);

  return (
    <div
      className={className}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
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
                    fill="#000000"
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

    </div>
  );
}
