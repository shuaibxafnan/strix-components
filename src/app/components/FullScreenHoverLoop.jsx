"use client";

import { useEffect, useRef } from "react";

// ─── FullscreenHoverLoop ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor           string   #ffffff    Panel background
// textColor         string   #000000    Primary text color
// mutedColor        string   #b4b4b4    Secondary text (subtitles, meta)
// accentColor       string   #f73378    Menu underline + inactive category color
// brandName         string   ...        Top-left label, doubles as the back trigger
// menuItems         array    [...]      Menu labels; entry with loop:true drives the effect
// items             array    [...]      Grid entries { img, year, title, subtitle, area }
// categories        array    [...]      Category strings shown beside the grid
// activeCategory    number   0          Index rendered as current/bold
// categoryRange     string   ...        Small meta label under the categories
// tagline           string   ...        One line of copy on the resting view
// hint              string   ...        Small prompt telling the user what to hover
// hoverDelay        number   40         Debounce before the loop starts (ms)
// loopInterval      number   350        Time each photo holds fullscreen (ms)
// gridRows          number   4          Row count the area strings map onto
// gridColumns       number   6          Column count the area strings map onto
// gridGap           string   0.6rem     Gap between cells
// height            string   100vh      Height of the whole component
// revealDuration    number   0.8        Focused photo settling into its cell (s)
// hideDuration      number   0.5        Grid exit animation duration (s)
// easing            string   power4.out GSAP ease for grid transitions
// zoomOnHover       bool     true       Scale the photo on cell hover
// showMeta          bool     true       Render year + title under each cell
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    img: "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    year: "2018",
    title: "Look at me",
    subtitle: "An exploration of the mind",
    area: "1 / 1 / 3 / 3",
  },
  {
    img: "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    year: "2017",
    title: "Versatile",
    subtitle: "Introspection",
    area: "1 / 3 / 2 / 5",
  },
  {
    img: "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    year: "2017",
    title: "Profile",
    subtitle: "Faces and stories",
    area: "1 / 5 / 3 / 7",
  },
  {
    img: "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    year: "2016",
    title: "Somewhere",
    subtitle: "Rare places",
    area: "2 / 3 / 4 / 5",
  },
  {
    img: "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    year: "2016",
    title: "The Set",
    subtitle: "Model works",
    area: "3 / 1 / 5 / 3",
  },
  {
    img: "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    year: "2015",
    title: "Stories",
    subtitle: "Milestones",
    area: "3 / 5 / 4 / 7",
  },
  {
    img: "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    year: "2015",
    title: "The Past",
    subtitle: "Culture trip",
    area: "4 / 3 / 5 / 5",
  },
  {
    img: "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    year: "2014",
    title: "Happiness",
    subtitle: "World of candy",
    area: "4 / 5 / 5 / 7",
  },
];

const DEFAULT_MENU = [
  { label: "photography", loop: true },
  { label: "exhibitions" },
  { label: "contact" },
];

const DEFAULT_CATEGORIES = ["Portraits", "Landscape", "Architecture", "Sports"];

export default function FullscreenHoverLoop({
  bgColor = "#ffffff",
  textColor = "#000000",
  mutedColor = "#b4b4b4",
  accentColor = "#f73378",
  brandName = "Alexandra Sokolov",
  menuItems = DEFAULT_MENU,
  items = DEFAULT_ITEMS,
  categories = DEFAULT_CATEGORIES,
  activeCategory = 0,
  categoryRange = "2001 — 2018",
  tagline = "Selected work",
  hint = "hover photography",
  hoverDelay = 40,
  loopInterval = 350,
  gridRows = 4,
  gridColumns = 6,
  gridGap = "0.6rem",
  height = "100vh",
  revealDuration = 0.8,
  hideDuration = 0.5,
  easing = "power4.out",
  zoomOnHover = true,
  showMeta = true,
}) {
  const rootRef = useRef(null);
  const restRef = useRef(null);
  const gridRef = useRef(null);
  const sideRef = useRef(null);
  const itemRefs = useRef([]);
  const gsapRef = useRef(null);
  const stateRef = useRef({
    gridVisible: false,
    current: null,
    hoverTimer: null,
    loopTimer: null,
  });

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

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap) return;
        gsapRef.current = gsap;
        gsap.set(gridRef.current, { opacity: 0 });
        gsap.set(sideRef.current, { opacity: 0 });
        gsap.set(restRef.current, { opacity: 1 });
        itemRefs.current.forEach((el) => {
          if (!el) return;
          gsap.set(el.querySelector("[data-wrap]"), { opacity: 0 });
          gsap.set(el.querySelector("[data-meta]"), { opacity: 0 });
        });
      })
      .catch((e) =>
        console.error("[FullscreenHoverLoop] GSAP load failed:", e.message),
      );

    const st = stateRef.current;
    return () => {
      clearTimeout(st.hoverTimer);
      clearTimeout(st.loopTimer);
    };
  }, []);

  const bounds = () => {
    const r = rootRef.current
      ? rootRef.current.getBoundingClientRect()
      : { left: 0, top: 0, width: 0, height: 0 };
    return r;
  };

  const randNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const lineEq = (y2, y1, x2, x1, currentVal) => {
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;
    return m * currentVal + b;
  };

  const collectItems = () =>
    itemRefs.current.filter(Boolean).map((el) => ({
      el,
      wrap: el.querySelector("[data-wrap]"),
      meta: el.querySelector("[data-meta]"),
    }));

  const toggleContent = (isGrid = true) => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    gsap.set(restRef.current, {
      opacity: isGrid ? 0 : 1,
      pointerEvents: isGrid ? "none" : "auto",
    });
    gsap.set(gridRef.current, {
      opacity: 1,
      pointerEvents: isGrid ? "auto" : "none",
    });
  };

  const loopThroughPhotos = () => {
    const gsap = gsapRef.current;
    const st = stateRef.current;
    if (!gsap || st.gridVisible) return;

    toggleContent(true);
    const b = bounds();
    const pool = [];

    collectItems().forEach((item) => {
      const rect = item.wrap.getBoundingClientRect();
      const ratioWrap = rect.height / rect.width;
      const ratioBox = b.height / b.width;
      const scaleVal =
        ratioWrap > ratioBox ? b.width / rect.width : b.height / rect.height;
      gsap.set(item.wrap, {
        x: b.left + b.width / 2 - (rect.left + rect.width / 2),
        y: b.top + b.height / 2 - (rect.top + rect.height / 2),
        scale: scaleVal,
      });
      pool.push({ ...item, elRect: item.el.getBoundingClientRect() });
    });

    if (!pool.length) return;

    let oldpos = -1;
    const loop = (pos = 0) => {
      if (oldpos >= 0) gsap.set(pool[oldpos].wrap, { opacity: 0, zIndex: 1 });
      st.current = pool[pos];
      if (oldpos === -1) {
        gsap.set(st.current.wrap, { zIndex: 998 });
        gsap.to(st.current.wrap, { duration: 0.2, opacity: 1 });
      } else {
        gsap.set(st.current.wrap, { opacity: 1, zIndex: 998 });
      }
      oldpos = pos;
      const next = pos < pool.length - 1 ? pos + 1 : 0;
      st.loopTimer = setTimeout(() => loop(next), loopInterval);
    };
    loop();
  };

  const stopLoop = () => {
    const gsap = gsapRef.current;
    const st = stateRef.current;
    if (!gsap || st.gridVisible) return;
    toggleContent(false);
    clearTimeout(st.loopTimer);

    collectItems().forEach((item) => {
      if (st.current && item.wrap === st.current.wrap) {
        gsap.to(item.wrap, {
          duration: 0.2,
          opacity: 0,
          onComplete: () =>
            gsap.set(item.wrap, { x: 0, y: 0, scale: 1, zIndex: 1 }),
        });
      } else {
        gsap.set(item.wrap, { opacity: 0, x: 0, y: 0, scale: 1, zIndex: 1 });
      }
    });
  };

  const showGrid = () => {
    const gsap = gsapRef.current;
    const st = stateRef.current;
    if (!gsap || st.gridVisible) return;
    st.gridVisible = true;
    clearTimeout(st.hoverTimer);
    clearTimeout(st.loopTimer);
    toggleContent(true);

    const b = bounds();
    let side = "left";
    if (st.current) {
      const r = st.current.elRect;
      side = r.left + r.width / 2 < b.left + b.width / 2 ? "left" : "right";
    }

    collectItems().forEach((item) => {
      let duration;
      if (st.current && item.wrap === st.current.wrap) {
        duration = revealDuration;
        gsap.to(item.wrap, {
          duration,
          ease: easing,
          x: 0,
          y: 0,
          scale: 1,
          onComplete: () => gsap.set(item.wrap, { zIndex: 1 }),
        });
      } else {
        const r = item.el.getBoundingClientRect();
        const center = r.left + r.width / 2 - b.left;
        duration =
          lineEq(
            side === "right" ? 7 : 14,
            side === "right" ? 14 : 7,
            b.width,
            0,
            center,
          ) / 10;
        gsap.fromTo(
          item.wrap,
          {
            x:
              (side === "left" ? 1 : -1) *
              lineEq(
                side === "right" ? 80 : b.width,
                side === "right" ? b.width : 80,
                b.width,
                0,
                center,
              ),
            y:
              r.top + r.height / 2 < b.top + b.height / 2
                ? randNumber(-260, -120)
                : randNumber(120, 260),
            scale: 1,
            opacity: 1,
          },
          { duration, ease: easing, x: 0, y: 0, opacity: 1 },
        );
      }

      gsap.fromTo(
        item.meta,
        { x: side === "left" ? 120 : -120, opacity: 0 },
        { duration, ease: easing, x: 0, opacity: 1 },
      );
    });

    gsap.fromTo(
      sideRef.current,
      { x: -30, opacity: 0 },
      { duration: 0.9, ease: easing, x: 0, opacity: 1 },
    );
  };

  const hideGrid = () => {
    const gsap = gsapRef.current;
    const st = stateRef.current;
    if (!gsap || !st.gridVisible) return;

    gsap.to(sideRef.current, {
      duration: hideDuration,
      ease: easing,
      x: -30,
      opacity: 0,
    });

    collectItems().forEach((item) => {
      gsap.to([item.wrap, item.meta], {
        duration: hideDuration,
        ease: easing,
        x: -40,
        opacity: 0,
        onComplete: () => gsap.set(item.wrap, { x: 0, y: 0, scale: 1 }),
      });
    });

    gsap.fromTo(
      restRef.current,
      { x: 40, opacity: 0 },
      {
        duration: hideDuration,
        ease: easing,
        x: 0,
        opacity: 1,
        onComplete: () => {
          st.gridVisible = false;
          st.current = null;
          toggleContent(false);
        },
      },
    );
  };

  const handleEnter = () => {
    const st = stateRef.current;
    clearTimeout(st.hoverTimer);
    st.current = null;
    st.hoverTimer = setTimeout(() => loopThroughPhotos(), hoverDelay);
  };

  const handleLeave = () => {
    clearTimeout(stateRef.current.hoverTimer);
    stopLoop();
  };

  const scopedStyle =
    ".fhl-link::after{content:'';position:absolute;left:0;top:52%;width:100%;height:2px;" +
    "background:" +
    accentColor +
    ";transform:scale3d(0,1,1);transform-origin:0 0;" +
    "transition:transform .3s cubic-bezier(.2,1,.8,1);}" +
    ".fhl-link:hover::after{transform:scale3d(1,1,1);}";

  return (
    <div
      ref={rootRef}
      className="relative flex w-full flex-col overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor, height }}
    >
      <style>{scopedStyle}</style>

      <header className="relative z-[1000] flex shrink-0 items-baseline justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <h2
          className="m-0 cursor-pointer text-sm font-normal tracking-tight sm:text-base"
          onClick={hideGrid}
        >
          {brandName}
        </h2>
        <nav className="flex gap-5 text-sm lowercase sm:gap-7 sm:text-base">
          {menuItems.map((m, i) => (
            <span
              key={i}
              className="fhl-link relative cursor-pointer select-none"
              onMouseEnter={m.loop ? handleEnter : undefined}
              onMouseLeave={m.loop ? handleLeave : undefined}
              onClick={m.loop ? showGrid : undefined}
            >
              {m.label}
            </span>
          ))}
        </nav>
      </header>

      <div className="relative grid min-h-0 flex-1 px-6 py-6 sm:px-10 sm:py-8">
        <div
          ref={restRef}
          style={{ gridArea: "1 / 1" }}
          className="flex min-h-0 flex-col justify-end pb-2"
        >
          <p className="m-0 text-[13vw] leading-[0.85] tracking-tight sm:text-[7vw]">
            {tagline}
          </p>
          <span
            className="mt-4 text-xs uppercase tracking-[0.2em]"
            style={{ color: mutedColor }}
          >
            {hint}
          </span>
        </div>

        <div
          ref={gridRef}
          style={{ gridArea: "1 / 1", opacity: 0, pointerEvents: "none" }}
          className="grid min-h-0 grid-cols-1 gap-6 sm:grid-cols-[7rem_1fr]"
        >
          <aside ref={sideRef} className="hidden flex-col sm:flex">
            <button
              type="button"
              onClick={hideGrid}
              className="mb-6 border-0 bg-transparent p-0 outline-none"
              style={{ color: textColor }}
              aria-label="Back"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <polygon points="6.3,12.8 20.9,12.8 20.9,11.2 6.3,11.2 10.2,7.2 9,6 3.1,12 9,18 10.2,16.8" />
              </svg>
            </button>
            <ul className="m-0 list-none p-0">
              {categories.map((c, i) => (
                <li
                  key={i}
                  className="mb-1.5 cursor-default text-[0.68rem] uppercase tracking-[0.12em]"
                  style={{
                    color: i === activeCategory ? textColor : accentColor,
                    fontWeight: i === activeCategory ? 700 : 400,
                  }}
                >
                  {c}
                </li>
              ))}
            </ul>
            <span
              className="mt-auto text-[0.65rem] tracking-[0.12em]"
              style={{ color: mutedColor }}
            >
              {categoryRange}
            </span>
          </aside>

          <div
            className="min-h-0"
            style={{
              display: "grid",
              gap: gridGap,
              gridTemplateRows: `repeat(${gridRows}, 1fr)`,
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                ref={(el) => (itemRefs.current[i] = el)}
                className="relative min-h-0 overflow-visible"
                style={{ gridArea: item.area }}
              >
                <div
                  data-wrap
                  className="absolute inset-0 overflow-hidden"
                  style={{ opacity: 0 }}
                >
                  <div
                    className={
                      "h-full w-full bg-cover bg-center transition-transform duration-700 " +
                      (zoomOnHover ? "hover:scale-105" : "")
                    }
                    style={{ backgroundImage: `url(${item.img})` }}
                  />
                </div>
                {showMeta ? (
                  <div
                    data-meta
                    className="pointer-events-none absolute bottom-0 left-0 z-[999] flex items-baseline gap-2 p-2 text-[0.6rem] leading-none"
                    style={{ opacity: 0 }}
                  >
                    <span className="font-bold text-white mix-blend-difference">
                      {item.title}
                    </span>
                    <span className="text-white mix-blend-difference">
                      {item.year}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
