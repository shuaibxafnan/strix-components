"use client";

import { useEffect, useId, useRef } from "react";

// ─── GridMotionIntro ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            string[]  25 urls    Image pool, cycled across all cells
// rows              number    5          Grid row count (must be odd)
// columns           number    7          Items per row
// gap               string    '1rem'     Gap between cells
// angle             number    -15        Grid rotation in degrees
// itemRadius        number    10         Cell corner radius, px
// gridWidth         string    '200vw'    Grid overflow width
// gridHeight        string    '200vh'    Grid overflow height
// introBg           string    #000       Intro section background
// glowColor         string    #f9a13275  Radial glow over the intro + button
// enableTranslateX  bool      true       Mouse-driven horizontal drift
// enableSkewX       bool      false      Mouse-driven skew
// enableContrast    bool      true       Mouse-driven contrast shift
// enableBrightness  bool      true       Mouse-driven brightness falloff
// enableScale       bool      false      Mouse-driven scale
// translateRange    number    40         Max drift, % of viewport width
// skewRange         number    3          Max skew degrees at edges
// contrastEdge      number    330        Contrast % at viewport edges
// brightnessEdge    number    15         Brightness % at viewport edges
// scaleEdge         number    0.95       Scale at viewport edges
// baseAmt           number    0.1        Lerp amount for the middle row
// amtFalloff        number    0.03       Lerp decrease per row from middle
// minAmt            number    0.05       Lerp floor for outermost rows
// revealDuration    number    0.9        FLIP + timeline duration (s)
// revealEase        string    'power4'   Ease for the reveal
// zoomScale         number    1.2        Initial slow zoom on reveal
// settleScale       number    1.1        Scale the hero settles to
// settleBrightness  number    50         Hero brightness % after settling
// heroShiftY        string    '-5vh'     Hero vertical nudge after settling
// contentShift      string    '-30vh'    Distance content slides up
// buttonLabel       string    'Explore'  Reveal trigger label
// title             string    'NOVAMOTION'  Header title shown after reveal
// heading           string    'Nova Motion' Content heading
// paragraphs        string[]  —          Body copy blocks
// highlightIndex    number    1          Which paragraph renders oversized
// smoothScroll      bool      true       Load Lenis for smooth scrolling
// lenisLerp         number    0.15       Lenis smoothness
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
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
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_PARAGRAPHS = [
  "Our team of creative artists and tech experts work together to explore new possibilities. Each project shows our dedication to new ideas and high quality, whether it's a commercial, film, or interactive display.",
  "We believe motion design can tell stories, evoke emotions, and inspire imaginations.",
  "Our clients are at the core of everything we do. We pride ourselves on building strong, lasting relationships based on trust, communication, and mutual respect. We listen carefully to your needs and goals, ensuring we fully understand your vision.",
  "By collaborating closely, we tailor our approach to meet your unique requirements, delivering results that exceed expectations. Whether you are a small business or a large corporation, we are committed to helping you succeed.",
];

export default function GridMotionIntro({
  images = DEFAULT_IMAGES,
  rows = 5,
  columns = 7,
  gap = "1rem",
  angle = -15,
  itemRadius = 10,
  gridWidth = "200vw",
  gridHeight = "200vh",
  introBg = "#000",
  glowColor = "#f9a13275",
  enableTranslateX = true,
  enableSkewX = false,
  enableContrast = true,
  enableBrightness = true,
  enableScale = false,
  translateRange = 40,
  skewRange = 3,
  contrastEdge = 330,
  brightnessEdge = 15,
  scaleEdge = 0.95,
  baseAmt = 0.1,
  amtFalloff = 0.03,
  minAmt = 0.05,
  revealDuration = 0.9,
  revealEase = "power4",
  zoomScale = 1.2,
  settleScale = 1.1,
  settleBrightness = 50,
  heroShiftY = "-5vh",
  contentShift = "-30vh",
  buttonLabel = "Explore",
  title = "NOVAMOTION",
  heading = "Nova Motion",
  paragraphs = DEFAULT_PARAGRAPHS,
  highlightIndex = 1,
  smoothScroll = true,
  lenisLerp = 0.15,
}) {
  const rawId = useId();
  const uid = `gm${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const fullviewRef = useRef(null);
  const contentRef = useRef(null);
  const buttonRef = useRef(null);
  const frameRef = useRef(null);

  const middleRowIndex = Math.floor(rows / 2);
  const middleColIndex = Math.floor(columns / 2);

  useEffect(() => {
    let cancelled = false;
    let requestId;
    const listeners = [];

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

    const preload = (urls) =>
      Promise.all(
        urls.map(
          (url) =>
            new Promise((resolve) => {
              const img = new window.Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = url;
            }),
        ),
      );

    const scripts = [
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
    ];
    if (smoothScroll) {
      scripts.push(
        "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js",
      );
    }

    const sequential = scripts.reduce(
      (chain, src) =>
        chain.then(() =>
          loadScript(src).catch((e) => {
            if (src.includes("lenis")) {
              console.warn(
                "[GridMotionIntro] Lenis unavailable, native scroll:",
                e.message,
              );
              return;
            }
            throw e;
          }),
        ),
      Promise.resolve(),
    );

    Promise.all([sequential, preload(images.slice(0, rows * columns))])
      .then(() => {
        if (cancelled) return;

        const { gsap, Flip } = window;
        const gridEl = gridRef.current;
        if (!gsap || !Flip || !gridEl) return;

        gsap.registerPlugin(Flip);
        gsap.set(rootRef.current, { autoAlpha: 1 });

        const gridRows = Array.from(gridEl.querySelectorAll(`.${uid}-row`));
        const numRows = gridRows.length;
        const midIndex = Math.floor(numRows / 2);
        const midRowItems = Array.from(
          gridRows[midIndex].querySelectorAll(`.${uid}-item`),
        );
        const heroInner = midRowItems[
          Math.floor(midRowItems.length / 2)
        ].querySelector(`.${uid}-inner`);
        const heroImage = heroInner.querySelector(`.${uid}-img`);

        let winsize = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        let mousepos = { x: winsize.width / 2, y: winsize.height / 2 };

        const onResize = () => {
          winsize = { width: window.innerWidth, height: window.innerHeight };
        };
        window.addEventListener("resize", onResize);
        listeners.push(() => window.removeEventListener("resize", onResize));

        const onMouseMove = (ev) => {
          mousepos.x = ev.clientX;
          mousepos.y = ev.clientY;
        };
        const onTouchMove = (ev) => {
          const t = ev.touches[0];
          if (t) {
            mousepos.x = t.clientX;
            mousepos.y = t.clientY;
          }
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onTouchMove);
        listeners.push(() =>
          window.removeEventListener("mousemove", onMouseMove),
        );
        listeners.push(() =>
          window.removeEventListener("touchmove", onTouchMove),
        );

        const config = {
          translateX: enableTranslateX,
          skewX: enableSkewX,
          contrast: enableContrast,
          scale: enableScale,
          brightness: enableBrightness,
        };

        const lerp = (a, b, n) => (1 - n) * a + n * b;

        const renderedStyles = gridRows.map((_, index) => {
          const distance = Math.abs(index - midIndex);
          const style = {
            amt: Math.max(baseAmt - distance * amtFalloff, minAmt),
            scaleAmt: Math.min(baseAmt + distance * amtFalloff, baseAmt),
          };
          if (config.translateX) style.translateX = { previous: 0, current: 0 };
          if (config.skewX) style.skewX = { previous: 0, current: 0 };
          if (config.contrast) style.contrast = { previous: 100, current: 100 };
          if (config.scale) style.scale = { previous: 1, current: 1 };
          if (config.brightness)
            style.brightness = { previous: 100, current: 100 };
          return style;
        });

        const norm = () => (mousepos.x / winsize.width) * 2 - 1;

        const mapped = () => ({
          translateX: (norm() * translateRange * winsize.width) / 100,
          skewX: norm() * skewRange,
          contrast: 100 - Math.pow(Math.abs(norm()), 2) * (100 - contrastEdge),
          scale: 1 - Math.abs(norm()) * (1 - scaleEdge),
          brightness:
            100 - Math.pow(Math.abs(norm()), 2) * (100 - brightnessEdge),
        });

        const render = () => {
          const values = mapped();

          gridRows.forEach((row, index) => {
            const style = renderedStyles[index];

            for (const prop in config) {
              if (!config[prop]) continue;
              style[prop].current = values[prop];
              const amt = prop === "scale" ? style.scaleAmt : style.amt;
              style[prop].previous = lerp(
                style[prop].previous,
                style[prop].current,
                amt,
              );
            }

            const settings = {};
            if (config.translateX) settings.x = style.translateX.previous;
            if (config.skewX) settings.skewX = style.skewX.previous;
            if (config.scale) settings.scale = style.scale.previous;
            if (config.contrast)
              settings.filter = `contrast(${style.contrast.previous}%)`;
            if (config.brightness)
              settings.filter = `${
                settings.filter ? settings.filter + " " : ""
              }brightness(${style.brightness.previous}%)`;

            gsap.set(row, settings);
          });

          requestId = requestAnimationFrame(render);
        };

        render();

        const stopRendering = () => {
          if (requestId) {
            cancelAnimationFrame(requestId);
            requestId = undefined;
          }
        };

        let revealed = false;
        const enterFullview = () => {
          if (revealed) return;
          revealed = true;

          const flipstate = Flip.getState(heroInner);
          fullviewRef.current.appendChild(heroInner);
          heroInner.classList.add(`${uid}-inner-full`);

          const tl = gsap.timeline();

          tl.add(
            Flip.from(flipstate, {
              duration: revealDuration,
              ease: revealEase,
              absolute: true,
              onComplete: stopRendering,
            }),
          )
            .to(
              gridEl,
              { duration: revealDuration, ease: revealEase, opacity: 0.01 },
              0,
            )
            .to(
              heroImage,
              { scale: zoomScale, duration: 3, ease: "sine" },
              `<-=${revealDuration / 2}`,
            )
            .to(contentRef.current, {
              y: contentShift,
              duration: revealDuration,
              ease: revealEase,
            })
            .add(() => {
              frameRef.current.classList.remove("opacity-0");
            }, "<")
            .to(
              heroImage,
              {
                scale: settleScale,
                startAt: { filter: "brightness(100%)" },
                filter: `brightness(${settleBrightness}%)`,
                y: heroShiftY,
                duration: revealDuration,
                ease: revealEase,
              },
              "<",
            );

          buttonRef.current.classList.add("opacity-0", "pointer-events-none");
          document.body.classList.remove(`${uid}-noscroll`);

          if (smoothScroll && window.Lenis) {
            const lenis = new window.Lenis({ lerp: lenisLerp });
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
          }
        };

        const btn = buttonRef.current;
        btn.addEventListener("click", enterFullview);
        btn.addEventListener("touchstart", enterFullview);
        listeners.push(() => btn.removeEventListener("click", enterFullview));
        listeners.push(() =>
          btn.removeEventListener("touchstart", enterFullview),
        );

        document.body.classList.add(`${uid}-noscroll`);
      })
      .catch((e) => console.error("[GridMotionIntro] load failed:", e.message));

    return () => {
      cancelled = true;
      if (requestId) cancelAnimationFrame(requestId);
      listeners.forEach((fn) => fn());
      document.body.classList.remove(`${uid}-noscroll`);
    };
  }, [
    uid,
    images,
    rows,
    columns,
    enableTranslateX,
    enableSkewX,
    enableContrast,
    enableScale,
    enableBrightness,
    translateRange,
    skewRange,
    contrastEdge,
    brightnessEdge,
    scaleEdge,
    baseAmt,
    amtFalloff,
    minAmt,
    revealDuration,
    revealEase,
    zoomScale,
    settleScale,
    settleBrightness,
    heroShiftY,
    contentShift,
    smoothScroll,
    lenisLerp,
  ]);

  const css = `
    .${uid}-noscroll {
      height: 100dvh;
      width: 100%;
      overflow: hidden;
      position: fixed;
      top: 0;
    }
    .${uid}-glow {
      background: radial-gradient(circle, ${glowColor} 0%, transparent 100%);
    }
    .${uid}-grid {
      gap: ${gap};
      width: ${gridWidth};
      height: ${gridHeight};
      grid-template-rows: repeat(${rows}, 1fr);
      grid-template-columns: 100%;
      transform: rotate(${angle}deg);
      transform-origin: center center;
    }
    .${uid}-row {
      gap: ${gap};
      grid-template-columns: repeat(${columns}, 1fr);
    }
    .${uid}-inner {
      border-radius: ${itemRadius}px;
    }
    .${uid}-inner-full {
      border-radius: 0px;
    }
    .${uid}-content::before {
      content: '';
      position: absolute;
      border-radius: ${itemRadius}px ${itemRadius}px 0 0;
      height: calc(100% + (-1) * (${contentShift}));
      width: 100%;
      top: 0;
      left: 0;
      z-index: 0;
      background: radial-gradient(at top, #f9a132 0%, #ddd 100%);
    }
    .${uid}-footer {
      transform: translateY(calc(-1 * (${contentShift})));
    }
  `;

  return (
    <div
      ref={rootRef}
      className="relative w-full uppercase text-[#292828] bg-[#ddd] invisible opacity-0 [font-size:12px]"
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <header
        ref={frameRef}
        className="absolute top-0 left-0 z-[1000] w-full grid grid-cols-1 gap-y-4 gap-x-8 justify-items-start p-4 pointer-events-none text-[#e3b774] opacity-0 transition-opacity duration-300 md:px-12 md:py-8"
      >
        <h1 className="m-0 text-[1.25rem] font-normal tracking-tight">
          {title}
        </h1>
      </header>

      <section
        className="relative flex w-full h-screen items-center justify-center overflow-hidden"
        style={{ background: introBg }}
      >
        <div ref={gridRef} className={`${uid}-grid relative grid flex-none`}>
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className={`${uid}-row grid [will-change:transform,filter]`}
            >
              {Array.from({ length: columns }).map((_, c) => {
                const flat = r * columns + c;
                const isHero = r === middleRowIndex && c === middleColIndex;
                return (
                  <div key={c} className={`${uid}-item relative`}>
                    <div
                      className={`${uid}-inner relative w-full h-full overflow-hidden`}
                    >
                      <div
                        className={
                          isHero
                            ? `${uid}-img absolute top-1/2 left-1/2 w-screen h-screen -mt-[50vh] -ml-[50vw] bg-cover bg-[50%_70%] [will-change:transform,filter]`
                            : `${uid}-img absolute top-0 left-0 w-full h-full bg-cover bg-center`
                        }
                        style={{
                          backgroundImage: `url(${
                            images[flat % images.length]
                          })`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className={`${uid}-glow absolute inset-0 pointer-events-none`} />

        <div
          ref={fullviewRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        <button
          ref={buttonRef}
          type="button"
          className={`${uid}-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-16 py-7 text-[1.15rem] font-bold uppercase text-black/80 border border-black/80 rounded-[3rem] cursor-pointer transition-all duration-300 hover:bg-black/20`}
        >
          {buttonLabel}
        </button>
      </section>

      <section
        ref={contentRef}
        className={`${uid}-content relative p-4 md:px-12 md:py-8`}
      >
        <div className="relative">
          <h2 className="m-0 mt-24 mb-[10vh] font-normal leading-[0.9] text-[2rem] md:text-[clamp(2rem,20vh,16rem)]">
            {heading}
          </h2>
        </div>

        <div className="relative flex flex-col gap-[10vh] px-[5vw] [text-wrap:balance]">
          {paragraphs.map((text, i) => (
            <p
              key={i}
              className={
                i === highlightIndex
                  ? "m-0 ml-auto max-w-[1000px] font-normal leading-[1.4] text-[2rem] md:text-[clamp(2rem,7vh,4rem)]"
                  : "m-0 ml-auto max-w-[700px] text-[1.5rem] leading-[1.4]"
              }
            >
              {text}
            </p>
          ))}
        </div>

        <div className={`${uid}-footer relative mt-[20vh]`} />
      </section>
    </div>
  );
}
