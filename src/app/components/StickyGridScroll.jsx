"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── StickyGridScroll ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor              string   #ffffff    Page background color
// textColor            string   #000000    Text color for title/description/button
// introImage           string   [see DEFAULT_INTRO_IMAGE]  Full-bleed image shown in the intro section
// introCaption         string   "Scroll-driven layout experiment"  Caption centered over the intro image
// introHeight          string   "100vh"    Height of the intro section
// title                string   "Sticky Grid Scroll"  Heading shown centered in the sticky block
// titleFontFamily      string   "'Fraunces', serif"  Title font (loaded from Google Fonts automatically)
// titleFontSize        string   "clamp(2.5rem, 6vw, 6.5rem)"  Title font size (CSS clamp, runtime value)
// description          string   [see default]  Paragraph shown below the title once revealed
// buttonLabel          string   "Read the tutorial"  Link label shown below the description
// buttonHref           string   "#"        Link target for the button
// images               array    [see DEFAULT_IMAGES]  12 images distributed across the grid columns
// numColumns           number   3          Number of grid columns (and animation column groups)
// gridMaxWidth         string   "46rem"    Max width of the centered gallery grid
// columnGap            string   "2rem"     Horizontal gap between grid items
// rowGap               string   "2.5rem"   Vertical gap between grid items
// scrollLength         string   "425vh"    Total scrollable height of the sticky block (controls animation duration)
// zoomScale            number   2.05       Scale the grid reaches at the peak of the zoom animation
// lateralShiftPercent  number   40         xPercent shift applied to the first/last column during zoom
// revealStagger        number   0.06       Stagger (s) between each item's reveal animation within a column
// enableSmoothScroll   boolean  true       Enable Lenis smooth scrolling synced with ScrollTrigger
// lerp                 number   0.08       Lenis smoothing amount (lower = smoother/slower)
// wheelMultiplier      number   1.4        Lenis mouse wheel scroll speed multiplier
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_INTRO_IMAGE =
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1200&q=80";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
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

const preloadImages = (srcs) =>
  Promise.all(
    srcs.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        }),
    ),
  );

export default function StickyGridScroll({
  bgColor = "#ffffff",
  textColor = "#000000",
  introImage = DEFAULT_INTRO_IMAGE,
  introCaption = "Scroll-driven layout experiment",
  introHeight = "100vh",
  title = "Sticky Grid Scroll",
  titleFontFamily = "'Fraunces', serif",
  titleFontSize = "clamp(2.5rem, 6vw, 6.5rem)",
  description = "A structured scroll-driven image grid where movement unfolds progressively within a sticky layout.",
  buttonLabel = "Read the tutorial",
  buttonHref = "#",
  images = DEFAULT_IMAGES,
  numColumns = 3,
  gridMaxWidth = "46rem",
  columnGap = "2rem",
  rowGap = "2.5rem",
  scrollLength = "425vh",
  zoomScale = 2.05,
  lateralShiftPercent = 40,
  revealStagger = 0.06,
  enableSmoothScroll = true,
  lerp = 0.08,
  wheelMultiplier = 1.4,
}) {
  const uid = useId().replace(/:/g, "");
  const [isLoading, setIsLoading] = useState(true);

  const blockRef = useRef(null);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);
  const gridRef = useRef(null);
  const itemRefs = useRef([]);
  const lenisRef = useRef(null);
  const tickerFnRef = useRef(null);

  useEffect(() => {
    loadFont(
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&display=swap",
    );

    let cancelled = false;

    const scripts = [
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      ),
    ];
    if (enableSmoothScroll) {
      scripts.push(
        loadScript("https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"),
      );
    }

    Promise.all(scripts)
      .then(() => preloadImages([introImage, ...images]))
      .then(() => {
        if (cancelled) return;
        const { gsap, ScrollTrigger, Lenis } = window;
        if (!gsap || !ScrollTrigger || !blockRef.current) return;

        gsap.registerPlugin(ScrollTrigger);
        gsap.config({ trialWarn: false });
        setIsLoading(false);

        const block = blockRef.current;
        const wrapper = wrapperRef.current;
        const content = contentRef.current;
        const titleEl = titleRef.current;
        const descriptionEl = descriptionRef.current;
        const buttonEl = buttonRef.current;
        const grid = gridRef.current;
        const items = itemRefs.current.filter(Boolean);

        let titleOffsetY = 0;

        // ── initContent ──────────────────────────────────────────────
        if (descriptionEl && buttonEl) {
          gsap.set([descriptionEl, buttonEl], {
            opacity: 0,
            pointerEvents: "none",
          });
        }
        if (content && titleEl) {
          const dy = (content.offsetHeight - titleEl.offsetHeight) / 2;
          titleOffsetY = (dy / content.offsetHeight) * 100;
          gsap.set(titleEl, { yPercent: titleOffsetY });
        }

        // ── groupItemsByColumn ───────────────────────────────────────
        const columns = Array.from({ length: numColumns }, () => []);
        items.forEach((item, index) => {
          columns[index % numColumns].push(item);
        });

        // ── addParallaxOnScroll ──────────────────────────────────────
        const parallaxTween =
          block && wrapper
            ? gsap.from(wrapper, {
                yPercent: -100,
                ease: "none",
                scrollTrigger: {
                  trigger: block,
                  start: "top bottom",
                  end: "top top",
                  scrub: true,
                },
              })
            : null;

        // ── animateTitleOnScroll ─────────────────────────────────────
        const titleTween =
          block && titleEl
            ? gsap.from(titleEl, {
                opacity: 0,
                duration: 0.7,
                ease: "power1.out",
                scrollTrigger: {
                  trigger: block,
                  start: "top 57%",
                  toggleActions: "play none none reset",
                },
              })
            : null;

        // ── gridRevealTimeline ───────────────────────────────────────
        const gridRevealTimeline = () => {
          const timeline = gsap.timeline();
          const wh = window.innerHeight;
          const dy = wh - (wh - grid.offsetHeight) / 2;

          columns.forEach((column, colIndex) => {
            const fromTop = colIndex % 2 === 0;
            timeline.from(
              column,
              {
                y: dy * (fromTop ? -1 : 1),
                stagger: {
                  each: revealStagger,
                  from: fromTop ? "end" : "start",
                },
                ease: "power1.inOut",
              },
              "grid-reveal",
            );
          });

          return timeline;
        };

        // ── gridZoomTimeline ─────────────────────────────────────────
        const gridZoomTimeline = () => {
          const timeline = gsap.timeline({
            defaults: { duration: 1, ease: "power3.inOut" },
          });

          timeline.to(grid, { scale: zoomScale });

          if (columns.length >= 2) {
            timeline.to(columns[0], { xPercent: -lateralShiftPercent }, "<");
            timeline.to(
              columns[columns.length - 1],
              { xPercent: lateralShiftPercent },
              "<",
            );
          }

          const middleColumns = columns.slice(1, -1);
          middleColumns.forEach((column) => {
            timeline.to(
              column,
              {
                yPercent: (index) =>
                  (index < Math.floor(column.length / 2) ? -1 : 1) *
                  lateralShiftPercent,
                duration: 0.5,
                ease: "power1.inOut",
              },
              "-=0.5",
            );
          });

          return timeline;
        };

        // ── toggleContent ────────────────────────────────────────────
        const toggleContent = (isVisible = true) => {
          if (!titleEl || !descriptionEl || !buttonEl) return;

          gsap
            .timeline({ defaults: { overwrite: true } })
            .to(titleEl, {
              yPercent: isVisible ? 0 : titleOffsetY,
              duration: 0.7,
              ease: "power2.inOut",
            })
            .to(
              [descriptionEl, buttonEl],
              {
                opacity: isVisible ? 1 : 0,
                duration: 0.4,
                ease: `power1.${isVisible ? "inOut" : "out"}`,
                pointerEvents: isVisible ? "all" : "none",
              },
              isVisible ? "-=90%" : "<",
            );
        };

        // ── animateGridOnScroll ──────────────────────────────────────
        const gridScrollTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: "top 25%",
            end: "bottom bottom",
            scrub: true,
          },
        });

        gridScrollTimeline
          .add(gridRevealTimeline())
          .add(gridZoomTimeline(), "-=0.6")
          .add(
            () =>
              toggleContent(gridScrollTimeline.scrollTrigger.direction === 1),
            "-=0.32",
          );

        // ── smooth scrolling (Lenis synced with ScrollTrigger) ───────
        if (enableSmoothScroll && Lenis) {
          const lenis = new Lenis({ lerp, wheelMultiplier });
          lenisRef.current = lenis;

          lenis.on("scroll", ScrollTrigger.update);

          const tickerFn = (time) => lenis.raf(time * 1000);
          tickerFnRef.current = tickerFn;
          gsap.ticker.add(tickerFn);
          gsap.ticker.lagSmoothing(0);
        }

        blockRef.current._cleanup = () => {
          if (parallaxTween?.scrollTrigger) parallaxTween.scrollTrigger.kill();
          if (titleTween?.scrollTrigger) titleTween.scrollTrigger.kill();
          if (gridScrollTimeline?.scrollTrigger)
            gridScrollTimeline.scrollTrigger.kill();
          parallaxTween?.kill();
          titleTween?.kill();
          gridScrollTimeline?.kill();
        };
      })
      .catch((e) =>
        console.error("[StickyGridScroll] Setup failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (blockRef.current?._cleanup) blockRef.current._cleanup();
      if (tickerFnRef.current && window.gsap) {
        window.gsap.ticker.remove(tickerFnRef.current);
      }
      if (lenisRef.current) lenisRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ backgroundColor: bgColor, color: textColor }}>
      {isLoading && (
        <div
          className="fixed inset-0 z-[10000] pointer-events-none"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className={`${uid}-loader absolute top-1/2 left-1/2 w-[100px] h-[1px] -ml-[50px]`}
            style={{ backgroundColor: textColor }}
          />
        </div>
      )}

      <section
        className="relative flex w-full items-center justify-center px-6"
        style={{ height: introHeight }}
      >
        <img
          src={introImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <p
          className="relative z-[1] max-w-xs text-center text-sm uppercase leading-snug tracking-wide"
          style={{ color: "#fff" }}
        >
          {introCaption}
        </p>
      </section>

      <section
        ref={blockRef}
        className="relative w-full"
        style={{ height: scrollLength }}
      >
        <div
          ref={wrapperRef}
          className="sticky top-0 h-screen w-full overflow-hidden px-6"
          style={{ willChange: "transform" }}
        >
          <div
            ref={contentRef}
            className="relative z-[1] flex h-full w-full flex-col items-center justify-center text-center"
          >
            <h2
              ref={titleRef}
              className="max-w-4xl leading-[1.15] tracking-tight"
              style={{ fontFamily: titleFontFamily, fontSize: titleFontSize }}
            >
              {title}
            </h2>
            <p
              ref={descriptionRef}
              className="mt-6 max-w-md text-sm uppercase leading-snug tracking-wide"
            >
              {description}
            </p>
            <a
              ref={buttonRef}
              href={buttonHref}
              className="mt-8 text-sm uppercase tracking-wide underline-offset-4 hover:underline"
            >
              {buttonLabel}
            </a>
          </div>

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: gridMaxWidth }}
          >
            <ul
              ref={gridRef}
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
                columnGap,
                rowGap,
                willChange: "transform",
              }}
            >
              {images.map((src, i) => (
                <li
                  key={i}
                  ref={(el) => (itemRefs.current[i] = el)}
                  className="aspect-square w-full"
                  style={{ willChange: "transform" }}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${uid}-loader {
              animation: ${uid}-loaderAnim 1.5s ease-in-out infinite alternate forwards;
            }
            @keyframes ${uid}-loaderAnim {
              0% { transform: scaleX(0); transform-origin: 0% 50%; }
              50% { transform: scaleX(1); transform-origin: 0% 50%; }
              50.1% { transform: scaleX(1); transform-origin: 100% 50%; }
              100% { transform: scaleX(0); transform-origin: 100% 50%; }
            }
          `,
        }}
      />
    </div>
  );
}
