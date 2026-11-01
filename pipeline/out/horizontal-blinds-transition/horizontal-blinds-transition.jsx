"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1600&q=80",
    kicker: "Chapter One",
    title: "First Light",
    description:
      "Each image is masked by a row of horizontal strips that open in sequence as you scroll, dissolving smoothly into the next.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1600&q=80",
    kicker: "Chapter Two",
    title: "Between Frames",
    description:
      "The blinds close and reopen in reverse, guiding the eye from one composition to the next without a hard cut.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=1600&q=80",
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

export default function HorizontalBlindsTransition({
  bgColor = "#000000",
  textColor = "#ffffff",
  slides = DEFAULT_SLIDES,
  blindCount = 30,
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

  const lenisRef = useRef(null);
  const tickerFnRef = useRef(null);
  const masterRef = useRef(null);
  const progressTriggerRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const gsapRef = useRef(null);

  useEffect(() => {
    loadFont(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&family=Space+Mono:wght@400;700&display=swap",
    );

    let cancelled = false;

    let onResize = null;

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

        const createBlinds = (groupEl) => {
          if (!groupEl) return null;
          groupEl.innerHTML = "";

          const width = window.innerWidth;
          const height = window.innerHeight;
          const vbHeight = (height / width) * 100;
          const h = vbHeight / blindCount;
          const blinds = [];
          let currentY = 0;

          for (let i = 0; i < blindCount; i++) {
            const centerY = vbHeight - (currentY + h / 2);

            const rectTop = document.createElementNS(SVG_NS, "rect");
            const rectBottom = document.createElementNS(SVG_NS, "rect");

            [rectTop, rectBottom].forEach((r) => {
              r.setAttribute("x", 0);
              r.setAttribute("width", 100);
              r.setAttribute("height", 0);
              r.setAttribute("fill", "white");
              r.setAttribute("shape-rendering", "crispEdges");
            });

            rectTop.setAttribute("y", centerY);
            rectBottom.setAttribute("y", centerY);

            groupEl.appendChild(rectTop);
            groupEl.appendChild(rectBottom);

            blinds.push({
              top: rectTop,
              bottom: rectBottom,
              y: centerY,
              h: h / 2,
            });
            currentY += h;
          }
          return blinds;
        };

        const openBlinds = (blinds) =>
          gsap.timeline().to(
            blinds.flatMap((b) => [b.top, b.bottom]),
            {
              attr: {
                y: (i) => {
                  const b = blinds[Math.floor(i / 2)];
                  return i % 2 === 0 ? b.y - b.h : b.y;
                },
                height: (i) => {
                  const b = blinds[Math.floor(i / 2)];
                  return b.h + 0.01;
                },
              },
              ease: "power3.out",
              stagger: { each: 0.02, from: "start" },
            },
          );

        const textIn = (el) =>
          gsap.to(el, {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 1.5,
            ease: "expo.out",
          });

        const textOut = (el) =>
          gsap.to(el, {
            clipPath: "inset(0% 0% 100% 0%)",
            y: -30,
            duration: 1.2,
            ease: "power2.inOut",
          });

        const buildMasterTimeline = (blindsSets) => {
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

          blindsSets.forEach((blinds, i) => {
            masterRef.current.add(openBlinds(blinds));
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

          const blindsSets = [];

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

            const blinds = createBlinds(groupRefs.current[i]);
            if (blinds) blindsSets.push(blinds);
          });

          buildMasterTimeline(blindsSets);
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

        onResize = () => {
          clearTimeout(resizeTimerRef.current);
          resizeTimerRef.current = setTimeout(updateLayout, 250);
        };
        window.addEventListener("resize", onResize);
      })
      .catch((e) =>
        console.error("[HorizontalBlindsTransition] Setup failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (onResize) window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimerRef.current);
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
        <div className="sticky top-0 h-screen w-full overflow-hidden">
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
    </div>
  );
}
