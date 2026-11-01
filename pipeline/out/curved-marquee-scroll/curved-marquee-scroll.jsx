"use client";

import { useEffect, useRef, useId, useState } from "react";

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1920&q=80",
    alt: "K2 summit under clear sky",
    marqueeMain: "K2.",
    marqueeSub: "Summit",
  },
  {
    src: "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1920&q=80",
    alt: "Mount Everest ridgeline",
    marqueeMain: "Everest.",
    marqueeSub: "Ascend",
  },
  {
    src: "https://images.unsplash.com/photo-1706341299879-4c52bd9c88fa?auto=format&fit=crop&w=1920&q=80",
    alt: "Aoraki Mount Cook, New Zealand",
    marqueeMain: "Aoraki.",
    marqueeSub: "Peak",
  },
];

const FONT_LINK_ID = "infinite-scroll-story-fonts";

function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Ms+Madi&display=swap";
  document.head.appendChild(link);
}

const VIEWBOX_W = 1600;
const VIEWBOX_H = 700;
const CENTER_Y = VIEWBOX_H / 2;
const ROW_OFFSET_MAIN = 100;
const ROW_OFFSET_SUB = 60;

export default function CurvedMarqueeScroll({
  images = DEFAULT_IMAGES,
  bgColor = "#000",
  imageParallaxBefore = -50,
  imageParallaxAfter = 50,
  marqueeMainColor = "#fff",
  marqueeSubColor = "#EE2625",
  marqueeMainFont = "'Archivo Black', sans-serif",
  marqueeSubFont = "'Ms Madi', cursive",
  marqueeMainFontSize = 220,
  marqueeSubFontSize = 110,
  marqueeCurveDepth = 320,
  marqueeMainGap = 1,
  marqueeSubGap = 5,
  marqueeRepeat = 100,
  marqueeSpeedMain = 5,
  marqueeSpeedSub = 2.5,
  marqueeScaleBefore = 1.4,
  marqueeScaleAfter = 0.7,
  snapDuration = 0.5,
  snapDebounce = 500,
  marqueeCurveMinScale = 0.4,
  className = "",
}) {
  const uid = useId();
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const heroRefs = useRef([]);
  const imageRefs = useRef([]);
  const mainPathRefs = useRef([]);
  const subPathRefs = useRef([]);
  const mainTextRefs = useRef([]);
  const subTextRefs = useRef([]);
  const gsapRef = useRef(null);
  const lenisRef = useRef(null);
  const snapRef = useRef(null);
  const triggersRef = useRef([]);
  const tickersRef = useRef([]);
  const [curveScale, setCurveScale] = useState(1);

  useEffect(() => {
    const baseAspect = VIEWBOX_W / VIEWBOX_H;
    const updateScale = () => {
      const el = wrapperRef.current;
      const w = el ? el.clientWidth : window.innerWidth;
      const h = el ? el.clientHeight : window.innerHeight;
      if (!w || !h) return;
      const aspect = w / h;
      const scale = Math.min(
        1,
        Math.max(marqueeCurveMinScale, aspect / baseAspect),
      );
      setCurveScale(scale);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [marqueeCurveMinScale]);

  const loopedImages =
    images.length > 0 ? [...images, { ...images[0], isDuplicate: true }] : [];
  const effectiveCurveDepth = marqueeCurveDepth * curveScale;
  const baselineMain = CENTER_Y - effectiveCurveDepth / 2 + ROW_OFFSET_MAIN;
  const baselineSub = CENTER_Y - effectiveCurveDepth / 2 + ROW_OFFSET_SUB;
  const arcMain = `M -300 ${baselineMain} Q ${VIEWBOX_W / 2} ${baselineMain + effectiveCurveDepth} ${VIEWBOX_W + 300} ${baselineMain}`;
  const arcSub = `M -300 ${baselineSub} Q ${VIEWBOX_W / 2} ${baselineSub + effectiveCurveDepth} ${VIEWBOX_W + 300} ${baselineSub}`;

  useEffect(() => {
    ensureFonts();
    let cancelled = false;
    let lenisTickerFn = null;

    async function init() {
      const [gsapMod, stMod, lenisMod, snapMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
        import("lenis/snap"),
      ]);
      if (cancelled) return;

      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const Lenis = lenisMod.default || lenisMod.Lenis;
      const Snap = snapMod.default || snapMod.Snap;
      gsapRef.current = gsap;
      gsap.registerPlugin(ScrollTrigger);

      const wrapper = wrapperRef.current;
      const content = contentRef.current;
      if (!wrapper || !content) return;

      const lenis = new Lenis({
        infinite: true,
        wrapper,
        content,
        syncTouch: true,
      });
      lenisRef.current = lenis;

      const snap = new Snap(lenis, {
        type: "mandatory",
        debounce: snapDebounce,
        duration: snapDuration,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
      snapRef.current = snap;

      ScrollTrigger.scrollerProxy(wrapper, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          } else {
            return lenis.scroll;
          }
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: wrapper.clientWidth,
            height: wrapper.clientHeight,
          };
        },
        pinType: "transform",
      });

      const heroEls = heroRefs.current.filter(Boolean);
      snap.addElements(heroEls, { align: "start" });

      lenis.on("scroll", ScrollTrigger.update);
      lenisTickerFn = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(lenisTickerFn);
      gsap.ticker.lagSmoothing(0);

      const sharedSettings = {
        ease: "none",
        scrollTrigger: {
          scroller: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          fastScrollEnd: true,
        },
      };

      heroEls.forEach((hero, i) => {
        const image = imageRefs.current[i];
        const marquees = hero.querySelectorAll("svg");

        gsap.set(image, { yPercent: imageParallaxBefore });
        const imgTween = gsap.fromTo(
          image,
          { yPercent: imageParallaxBefore },
          {
            yPercent: imageParallaxAfter,
            ...sharedSettings,
            scrollTrigger: { ...sharedSettings.scrollTrigger, trigger: hero },
          },
        );
        triggersRef.current.push(imgTween.scrollTrigger);

        marquees.forEach((marquee) => {
          gsap.set(marquee, { scale: marqueeScaleBefore });
          const marqueeTween = gsap.fromTo(
            marquee,
            { scale: marqueeScaleBefore },
            {
              scale: marqueeScaleAfter,
              ...sharedSettings,
              scrollTrigger: { ...sharedSettings.scrollTrigger, trigger: hero },
            },
          );
          triggersRef.current.push(marqueeTween.scrollTrigger);
        });

        const mainTextEl = mainTextRefs.current[i];
        const subTextEl = subTextRefs.current[i];
        const mainPath = mainPathRefs.current[i];
        const subPath = subPathRefs.current[i];

        const startLoop = () => {
          if (mainPath && mainTextEl) {
            const unitPx = mainTextEl.getComputedTextLength() / marqueeRepeat;
            const pxPerSecond = unitPx / marqueeSpeedMain;
            let elapsed = 0;
            const tick = (time, deltaMs) => {
              elapsed += deltaMs;
              const raw = (elapsed / 1000) * pxPerSecond;
              const offset = -(raw % unitPx);
              mainPath.setAttribute("startOffset", offset);
            };
            gsap.ticker.add(tick);
            tickersRef.current.push(tick);
          }
          if (subPath && subTextEl) {
            const unitPx = subTextEl.getComputedTextLength() / marqueeRepeat;
            const pxPerSecond = unitPx / marqueeSpeedSub;
            let elapsed = 0;
            const tick = (time, deltaMs) => {
              elapsed += deltaMs;
              const raw = (elapsed / 1000) * pxPerSecond;
              const offset = raw % unitPx;
              subPath.setAttribute("startOffset", offset);
            };
            gsap.ticker.add(tick);
            tickersRef.current.push(tick);
          }
        };

        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            if (!cancelled) startLoop();
          });
        } else {
          startLoop();
        }
      });
    }

    init();

    return () => {
      cancelled = true;
      triggersRef.current.forEach((st) => st && st.kill());
      triggersRef.current = [];
      if (gsapRef.current) {
        tickersRef.current.forEach((fn) => gsapRef.current.ticker.remove(fn));
        if (lenisTickerFn) gsapRef.current.ticker.remove(lenisTickerFn);
      }
      tickersRef.current = [];
      if (snapRef.current && typeof snapRef.current.destroy === "function")
        snapRef.current.destroy();
      if (lenisRef.current) lenisRef.current.destroy();
    };
  }, [images.length]);

  return (
    <div
      className={`relative h-[100svh] overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${className}`}
      style={{ backgroundColor: bgColor }}
      ref={wrapperRef}
    >
      <div ref={contentRef} className="relative">
        {loopedImages.map((img, i) => {
          const mainText =
            `${img.marqueeMain ?? ""}${" ".repeat(marqueeMainGap)}`.repeat(
              marqueeRepeat,
            );
          const subText =
            `${img.marqueeSub ?? ""}${" ".repeat(marqueeSubGap)}`.repeat(
              marqueeRepeat,
            );
          const mainPathId = `${uid}-arc-main-${i}`;
          const subPathId = `${uid}-arc-sub-${i}`;

          return (
            <section
              key={`${uid}-hero-${i}`}
              ref={(el) => (heroRefs.current[i] = el)}
              aria-hidden={img.isDuplicate ? "true" : undefined}
              className="relative z-[1] grid h-[100svh] w-full place-items-center overflow-clip"
            >
              <picture
                ref={(el) => (imageRefs.current[i] = el)}
                aria-hidden={img.isDuplicate ? "true" : undefined}
                className="absolute inset-0 -z-10 block"
                style={{ backgroundColor: bgColor }}
              >
                <img
                  src={img.src}
                  alt={img.isDuplicate ? `${img.alt} Duplicate` : img.alt}
                  aria-hidden={img.isDuplicate ? "true" : undefined}
                  className="block h-full w-full object-cover"
                />
              </picture>

              <svg
                aria-hidden="true"
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              >
                <defs>
                  <path id={mainPathId} d={arcMain} fill="none" />
                </defs>
                <text
                  xmlSpace="preserve"
                  ref={(el) => (mainTextRefs.current[i] = el)}
                  fill={marqueeMainColor}
                  fontSize={marqueeMainFontSize}
                  style={{ fontFamily: marqueeMainFont }}
                >
                  <textPath
                    ref={(el) => (mainPathRefs.current[i] = el)}
                    href={`#${mainPathId}`}
                    startOffset="0%"
                  >
                    {mainText}
                  </textPath>
                </text>
              </svg>

              <svg
                aria-hidden="true"
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              >
                <defs>
                  <path id={subPathId} d={arcSub} fill="none" />
                </defs>
                <text
                  xmlSpace="preserve"
                  ref={(el) => (subTextRefs.current[i] = el)}
                  fill={marqueeSubColor}
                  fontSize={marqueeSubFontSize}
                  style={{ fontFamily: marqueeSubFont }}
                >
                  <textPath
                    ref={(el) => (subPathRefs.current[i] = el)}
                    href={`#${subPathId}`}
                    startOffset="0%"
                  >
                    {subText}
                  </textPath>
                </text>
              </svg>
            </section>
          );
        })}
      </div>
    </div>
  );
}
