"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── TextTrail ───────────────────────────────────────────────────────────────
//
// Single-effect build: image slides horizontally, trail rows fade out from the
// middle then fade back in, image swap lands halfway through the cascade.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides            array    —          Slides: {text, image}
// trailRows         number   11         Repeated text rows per slide (odd is best)
// rowStyles         array    —          'fill' | 'stroke' | 'fillLow' | 'strokeLow'
// fullRows          array    [2,5,8]    Row indices that don't stretch (flex:none)
// trailOffset       string   0px        Nudge the whole trail vertically
// showInterval      number   80         Delay between each row appearing (ms)
// hideInterval      number   80         Delay between each row disappearing (ms)
// endIdleTime       number   80         Pause after a trail cascade finishes (ms)
// rowFade           number   0          Per-row opacity transition (ms)
// imageInMs         number   700        Incoming image duration (ms)
// imageOutMs        number   300        Outgoing image duration (ms)
// imageEaseIn       string   —          Incoming image timing function
// imageEaseOut      string   —          Outgoing image timing function
// bgColor           string   #1c1423    Page background
// textColor         string   #ffffff    Trail fill / stroke color
// accentColor       string   #ff00c4    Title and counter color
// navColor          string   #ffffff    Nav button color
// strokeWidth       string   2px        Outline width for stroke rows
// fontFamily        string   —          Trail font stack
// fontWeight        number   900        Trail font weight
// fontSize          string   17vh       Trail font size, desktop
// fontSizeSmall     string   3.5rem     Trail font size, narrow screens
// lineHeight        number   0.75       Trail line height
// letterSpacing     string   normal     Trail letter spacing
// blendMode         string   normal     Trail mix-blend-mode
// imageWidth        string   —          Image frame width
// imageHeight       string   60vh       Image frame height
// imageMaxWidth     string   889px      Image frame max width
// scrim             number   0          Dark overlay opacity over image (0-1)
// navLabels         array    —          Two labels: [prev, next]
// navPosition       string   bottom     'bottom' | 'top-right' | 'split' | 'corner'
// navInset          string   3rem       Distance from the edge
// showCounter       bool     true       Show 01 / 10 between the nav buttons
// title             string   ""         Optional heading in the corner
// showTitle         bool     false      Render the heading
// className         string   ""         Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const IMAGES = [
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

const DEFAULT_SLIDES = [
  { text: "Kobun", image: IMAGES[0] },
  { text: "De-Rezz", image: IMAGES[1] },
  { text: "X-Heads", image: IMAGES[2] },
  { text: "Nulltide", image: IMAGES[3] },
  { text: "Slipgate", image: IMAGES[4] },
  { text: "Halcyon", image: IMAGES[5] },
  { text: "Dead Air", image: IMAGES[6] },
  { text: "Vantablack", image: IMAGES[7] },
  { text: "Low Orbit", image: IMAGES[8] },
  { text: "Nightshift", image: IMAGES[9] },
];

const DEFAULT_ROW_STYLES = [
  "stroke",
  "fill",
  "stroke",
  "stroke",
  "fill",
  "fill",
  "fillLow",
  "fill",
  "stroke",
  "strokeLow",
  "fill",
];

const DEFAULT_FULL_ROWS = [2, 5, 8];

const pad = (n) => String(n).padStart(2, "0");

export default function TextTrailSlideshow({
  slides = DEFAULT_SLIDES,
  trailRows = 11,
  rowStyles = DEFAULT_ROW_STYLES,
  fullRows = DEFAULT_FULL_ROWS,
  trailOffset = "0px",
  showInterval = 80,
  hideInterval = 80,
  endIdleTime = 80,
  rowFade = 0,
  imageInMs = 700,
  imageOutMs = 300,
  imageEaseIn = "cubic-bezier(0.23, 1, 0.32, 1)",
  imageEaseOut = "cubic-bezier(0.23, 1, 0.32, 1)",
  bgColor = "#1c1423",
  textColor = "#ffffff",
  accentColor = "#ff00c4",
  navColor = "#ffffff",
  strokeWidth = "2px",
  fontFamily = "ui-sans-serif, system-ui, sans-serif",
  fontWeight = 900,
  fontSize = "17vh",
  fontSizeSmall = "3.5rem",
  lineHeight = 0.85,
  letterSpacing = "normal",
  blendMode = "normal",
  imageWidth = "calc(90% - 11rem)",
  imageHeight = "60vh",
  imageMaxWidth = "889px",
  scrim = 0,
  navLabels = ["prev", "next"],
  navPosition = "bottom",
  navInset = "3rem",
  showCounter = true,
  title = "",
  showTitle = false,
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  const total = slides.length;
  const rows = Math.max(3, trailRows);
  const middle = Math.floor(rows / 2);

  const rowRefs = useRef({});
  const wrapRefs = useRef([]);
  const innerRefs = useRef([]);
  const slideRefs = useRef([]);
  const busyRef = useRef(false);
  const currentRef = useRef(0);
  const timersRef = useRef([]);

  rowRefs.current = {};

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const key = (slide, row) => `${slide}:${row}`;

  const toggleRow = useCallback(
    (slide, action, pos) => {
      const apply = (rowIndex) => {
        const node = rowRefs.current[key(slide, rowIndex)];
        if (!node) return;
        node.style.opacity = action === "show" ? "1" : "0";
      };
      apply(middle - pos);
      apply(middle + pos);
    },
    [middle],
  );

  const runTrail = useCallback(
    (slide, mode, halfway) =>
      new Promise((resolve) => {
        const forward = mode === "show";

        const loopHide = (pos) => {
          const done = forward ? middle - pos === middle : middle - pos < 0;
          if (done) {
            later(resolve, endIdleTime);
            return;
          }
          toggleRow(slide, "hide", pos);
          later(() => loopHide(forward ? pos - 1 : pos + 1), hideInterval);
        };

        const loopShow = (pos) => {
          const done = forward ? middle - pos > middle : middle - pos < 0;
          if (done) {
            if (typeof halfway === "function") halfway();
            loopHide(forward ? middle : 0);
            return;
          }
          toggleRow(slide, "show", pos);
          later(() => loopShow(forward ? pos - 1 : pos + 1), showInterval);
        };

        loopShow(forward ? middle : 1);
      }),
    [middle, showInterval, hideInterval, endIdleTime, toggleRow, later],
  );

  const toggleImage = useCallback(
    (slideIndex, action, dir) => {
      const wrap = wrapRefs.current[slideIndex];
      const inner = innerRefs.current[slideIndex];
      if (!wrap || !inner) return Promise.resolve();

      const hiding = action === "hide";
      const ms = hiding ? imageOutMs : imageInMs;
      const ease = hiding ? imageEaseOut : imageEaseIn;
      const next = dir === "next";

      if (hiding) {
        return new Promise((resolve) => {
          wrap.style.transition = `transform ${ms}ms ${ease}, opacity ${ms}ms ${ease}`;
          inner.style.transition = `transform ${ms}ms ${ease}`;
          wrap.style.transform = `translateX(${next ? "-110%" : "110%"})`;
          wrap.style.opacity = "1";
          inner.style.transform = `translateX(${next ? "100%" : "-100%"})`;
          later(resolve, ms);
        });
      }

      wrap.style.transition = "none";
      inner.style.transition = "none";
      wrap.style.transform = `translateX(${next ? "110%" : "-110%"})`;
      wrap.style.opacity = "1";
      inner.style.transform = `translateX(${next ? "-100%" : "100%"})`;

      return new Promise((resolve) => {
        later(() => {
          wrap.style.transition = `transform ${ms}ms ${ease}, opacity ${ms}ms ${ease}`;
          inner.style.transition = `transform ${ms}ms ${ease}`;
          wrap.style.transform = "translateX(0%)";
          wrap.style.opacity = "1";
          inner.style.transform = "translateX(0%)";
          later(resolve, ms);
        }, 20);
      });
    },
    [imageInMs, imageOutMs, imageEaseIn, imageEaseOut, later],
  );

  const resetStage = useCallback(() => {
    clearTimers();
    busyRef.current = false;
    currentRef.current = 0;
    setIndex(0);

    slideRefs.current.forEach((node, i) => {
      if (node) node.style.opacity = i === 0 ? "1" : "0";
    });
    wrapRefs.current.forEach((node) => {
      if (!node) return;
      node.style.transition = "none";
      node.style.transform = "none";
      node.style.opacity = "1";
    });
    innerRefs.current.forEach((node) => {
      if (!node) return;
      node.style.transition = "none";
      node.style.transform = "none";
    });
    Object.entries(rowRefs.current).forEach(([id, node]) => {
      if (!node) return;
      node.style.opacity = id === key(0, middle) ? "1" : "0";
    });
  }, [clearTimers, middle]);

  useEffect(() => {
    resetStage();
    setMounted(true);
    return clearTimers;
  }, [resetStage, clearTimers]);

  const navigate = useCallback(
    (dir) => {
      if (busyRef.current || total < 2) return;
      busyRef.current = true;

      const from = currentRef.current;
      const to =
        dir === "next"
          ? from < total - 1
            ? from + 1
            : 0
          : from > 0
            ? from - 1
            : total - 1;
      currentRef.current = to;
      setIndex(to);

      const armIncoming = () => {
        const midRow = rowRefs.current[key(to, middle)];
        if (midRow) midRow.style.opacity = "0";
      };

      const halfway = () => {
        toggleImage(from, "hide", dir);
        armIncoming();
        const node = slideRefs.current[to];
        if (node) node.style.opacity = "1";
        toggleImage(to, "show", dir);
      };

      runTrail(from, "hide", halfway).then(() => {
        const node = slideRefs.current[from];
        if (node) node.style.opacity = "0";
        runTrail(to, "show").then(() => {
          busyRef.current = false;
        });
      });
    },
    [total, middle, runTrail, toggleImage],
  );

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowRight") navigate("next");
      if (event.key === "ArrowLeft") navigate("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const rowIndices = useMemo(
    () => Array.from({ length: rows }, (_, i) => i),
    [rows],
  );

  const navOuter = {
    bottom: "left-1/2 -translate-x-1/2 flex-row items-center gap-6",
    "top-right": "right-0 top-0 flex-row items-center gap-6",
    corner: "right-0 bottom-0 flex-row items-center gap-6",
    split: "left-0 right-0 top-1/2 -translate-y-1/2 flex-row justify-between",
  };

  const navStyle = {
    bottom: { bottom: navInset },
    "top-right": { padding: navInset },
    corner: { padding: navInset },
    split: { paddingLeft: navInset, paddingRight: navInset },
  };

  return (
    <div
      className={`relative w-full h-screen overflow-hidden isolate ${className}`}
      style={{ backgroundColor: bgColor, fontFamily }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .tt-${uid}-row {
              opacity: 0;
              pointer-events: none;
              overflow: hidden;
              transition: opacity ${rowFade}ms linear;
            }
            .tt-${uid}-inner {
              display: block;
              text-transform: uppercase;
              font-size: ${fontSizeSmall};
              font-weight: ${fontWeight};
              line-height: ${lineHeight};
              letter-spacing: ${letterSpacing};
              color: ${textColor};
              white-space: nowrap;
            }
            @media screen and (min-width: 53em) {
              .tt-${uid}-inner { font-size: ${fontSize}; }
            }
            .tt-${uid}-stroke {
              -webkit-text-stroke: ${strokeWidth} ${textColor};
              -webkit-text-fill-color: transparent;
              color: transparent;
            }
            .tt-${uid}-low { transform: translate3d(0, -40%, 0); }
            .tt-${uid}-slide { opacity: 0; pointer-events: none; }
            .tt-${uid}-btn {
              background: none;
              border: 0;
              padding: 0.25rem 0;
              margin: 0;
              cursor: pointer;
              transition: opacity 200ms linear, letter-spacing 200ms linear;
            }
            .tt-${uid}-btn:hover:not(:disabled) { letter-spacing: 0.12em; }
            .tt-${uid}-btn:disabled { opacity: 0.3; cursor: default; }
            .tt-${uid}-btn:focus-visible { outline: 1px solid currentColor; outline-offset: 6px; }
            @media (prefers-reduced-motion: reduce) {
              .tt-${uid}-btn { transition: none; }
            }
          `,
        }}
      />

      {showTitle && title ? (
        <header
          className="absolute top-0 left-0 z-40 pointer-events-none"
          style={{ padding: navInset }}
        >
          <h1
            className="m-0 text-base font-normal"
            style={{ color: accentColor }}
          >
            {title}
          </h1>
        </header>
      ) : null}

      <div className="absolute inset-0 grid place-items-center">
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            ref={(node) => {
              slideRefs.current[slideIndex] = node;
            }}
            className={`col-start-1 row-start-1 relative w-full h-full overflow-hidden isolate tt-${uid}-slide`}
          >
            <div className="absolute inset-0 z-0 grid place-items-center">
              <div
                className="relative overflow-hidden"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  maxWidth: imageMaxWidth,
                }}
              >
                <div
                  ref={(node) => {
                    wrapRefs.current[slideIndex] = node;
                  }}
                  className="relative w-full h-full overflow-hidden"
                >
                  <div
                    ref={(node) => {
                      innerRefs.current[slideIndex] = node;
                    }}
                    className="w-full h-full bg-center bg-cover bg-no-repeat"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                  {scrim > 0 ? (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `rgba(0,0,0,${scrim})` }}
                    />
                  ) : null}
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
              style={{
                mixBlendMode: blendMode,
                transform: `translateY(${trailOffset})`,
              }}
            >
              {rowIndices.map((rowIndex) => {
                const kind = rowStyles.length
                  ? rowStyles[rowIndex % rowStyles.length]
                  : "fill";
                const stroked = kind === "stroke" || kind === "strokeLow";
                const low = kind === "fillLow" || kind === "strokeLow";
                return (
                  <span
                    key={rowIndex}
                    ref={(node) => {
                      rowRefs.current[key(slideIndex, rowIndex)] = node;
                    }}
                    className={`tt-${uid}-row`}
                    style={{
                      flex: fullRows.includes(rowIndex) ? "none" : "1 1 0%",
                    }}
                  >
                    <span
                      className={`tt-${uid}-inner ${
                        stroked ? `tt-${uid}-stroke` : ""
                      } ${low ? `tt-${uid}-low` : ""}`}
                    >
                      {slide.text}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <nav
        className={`absolute z-40 flex gap-4 items-center bottom-8 right-8`}
        style={{
          color: navColor,
        }}
      >
        <button
          type="button"
          onClick={() => navigate("prev")}
          disabled={!mounted}
          aria-label="Previous slide"
          className={`text-xs font-bold uppercase tracking-[0.2em] leading-none tt-${uid}-btn`}
          style={{ color: "inherit" }}
        >
          {navLabels[0]}
        </button>

        {showCounter ? (
          <span
            className="text-xs font-bold tabular-nums leading-none select-none"
            style={{ color: accentColor }}
            aria-live="polite"
          >
            {pad(index + 1)}
            <span style={{ color: navColor, opacity: 0.4 }}>
              {" "}
              / {pad(total)}
            </span>
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="block h-3 w-px"
            style={{ background: navColor, opacity: 0.3 }}
          />
        )}

        <button
          type="button"
          onClick={() => navigate("next")}
          disabled={!mounted}
          aria-label="Next slide"
          className={`text-xs font-bold uppercase tracking-[0.2em] leading-none tt-${uid}-btn`}
          style={{ color: "inherit" }}
        >
          {navLabels[1]}
        </button>
      </nav>
    </div>
  );
}
