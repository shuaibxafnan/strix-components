"use client";

import { useEffect, useId, useMemo, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=1000&q=80",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ------------------------------------------------------------------ *
 * Flip engine (vanilla port of bookblock.js v2.0.1)
 * ------------------------------------------------------------------ */
function createBookBlock(el, options) {
  const opts = {
    orientation: "vertical",
    direction: "ltr",
    speed: 1000,
    easing: "ease-in-out",
    shadows: true,
    shadowSides: 0.2,
    shadowFlip: 0.1,
    circular: false,
    onEndFlip: () => {},
    onBeforeFlip: () => {},
    ...options,
  };

  el.classList.add(`bb-${opts.orientation}`);

  const items = Array.from(el.children).filter((n) =>
    n.classList.contains("bb-item"),
  );
  const itemsCount = items.length;

  const s = {
    currentIdx: 0,
    previous: -1,
    isAnimating: false,
    end: false,
    elWidth: el.offsetWidth,
    current: items[0],
    nextItem: items[0],
  };
  if (s.current) s.current.style.display = "block";

  let resizeTimer = null;
  const onResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      s.elWidth = el.offsetWidth;
      resizeTimer = null;
    }, 50);
  };
  window.addEventListener("resize", onResize);

  function addSide(side, dir) {
    const page = document.createElement("div");
    page.className = "bb-page";
    const cur = s.current.innerHTML;
    const nxt = s.nextItem.innerHTML;

    if (side === "left") {
      const inner = dir === "next" ? cur : nxt;
      page.innerHTML =
        `<div class="bb-back"><div class="bb-outer"><div class="bb-content">` +
        `<div class="bb-inner">${inner}</div></div><div class="bb-overlay"></div></div></div>`;
    } else if (side === "middle") {
      const front = dir === "next" ? cur : nxt;
      const back = dir === "next" ? nxt : cur;
      page.innerHTML =
        `<div class="bb-front"><div class="bb-outer"><div class="bb-content">` +
        `<div class="bb-inner">${front}</div></div><div class="bb-flipoverlay"></div></div></div>` +
        `<div class="bb-back"><div class="bb-outer"><div class="bb-content" style="width:${s.elWidth}px">` +
        `<div class="bb-inner">${back}</div></div><div class="bb-flipoverlay"></div></div></div>`;
    } else {
      const inner = dir === "next" ? nxt : cur;
      page.innerHTML =
        `<div class="bb-front"><div class="bb-outer"><div class="bb-content">` +
        `<div class="bb-inner">${inner}</div></div><div class="bb-overlay"></div></div></div>`;
    }
    return page;
  }

  function layout(dir) {
    const left = addSide("left", dir);
    const middle = addSide("middle", dir);
    const right = addSide("right", dir);

    const oLeft = left.querySelector("div.bb-overlay");
    const oMidFront = middle
      .querySelector("div.bb-front")
      ?.querySelector("div.bb-flipoverlay");
    const oMidBack = middle
      .querySelector("div.bb-back")
      ?.querySelector("div.bb-flipoverlay");
    const oRight = right.querySelector("div.bb-overlay");

    const speed = s.end ? 400 : opts.speed;
    const half = opts.speed / 2;

    const first = items[0];
    el.insertBefore(left, first);
    el.insertBefore(middle, first);
    el.insertBefore(right, first);
    left.style.zIndex = "102";
    middle.style.zIndex = "103";
    right.style.zIndex = "101";

    middle.style.transitionDuration = `${speed}ms`;
    middle.style.transitionTimingFunction = opts.easing;

    middle.addEventListener("transitionend", function onEnd(event) {
      if (!event.target.classList.contains("bb-page")) return;
      middle.removeEventListener("transitionend", onEnd);
      Array.from(el.querySelectorAll(".bb-page")).forEach((p) =>
        p.parentNode === el ? el.removeChild(p) : null,
      );
      s.nextItem.style.display = "block";
      s.end = false;
      s.isAnimating = false;
      const isLimit =
        (dir === "next" && s.currentIdx === itemsCount - 1) ||
        (dir === "prev" && s.currentIdx === 0);
      opts.onEndFlip(s.previous, s.currentIdx, isLimit);
    });

    if (dir === "prev") middle.classList.add("bb-flip-initial");

    if (opts.shadows && !s.end) {
      if (dir === "next") {
        if (oMidFront) oMidFront.style.transition = `opacity ${half}ms linear`;
        if (oMidBack) {
          oMidBack.style.transition = `opacity ${half}ms linear ${half}ms`;
          oMidBack.style.opacity = `${opts.shadowFlip}`;
        }
        if (oLeft)
          oLeft.style.transition = `opacity ${half}ms linear ${half}ms`;
        if (oRight) {
          oRight.style.transition = `opacity ${half}ms linear`;
          oRight.style.opacity = `${opts.shadowSides}`;
        }
      } else {
        if (oMidFront) {
          oMidFront.style.transition = `opacity ${half}ms linear ${half}ms`;
          oMidFront.style.opacity = `${opts.shadowFlip}`;
        }
        if (oMidBack) oMidBack.style.transition = `opacity ${half}ms linear`;
        if (oLeft) oLeft.style.transition = `opacity ${half}ms linear`;
        if (oLeft) oLeft.style.opacity = `${opts.shadowSides}`;
        if (oRight)
          oRight.style.transition = `opacity ${half}ms linear ${half}ms`;
      }
    }

    setTimeout(() => {
      middle.classList.add(s.end ? `bb-flip-${dir}-end` : `bb-flip-${dir}`);
      if (opts.shadows && !s.end) {
        if (oMidFront)
          oMidFront.style.opacity = dir === "next" ? `${opts.shadowFlip}` : "0";
        if (oMidBack)
          oMidBack.style.opacity = dir === "next" ? "0" : `${opts.shadowFlip}`;
        if (oLeft)
          oLeft.style.opacity = dir === "next" ? `${opts.shadowSides}` : "0";
        if (oRight)
          oRight.style.opacity = dir === "next" ? "0" : `${opts.shadowSides}`;
      }
    }, 25);
  }

  function navigate(dir, page) {
    if (s.isAnimating || itemsCount === 0) return false;
    opts.onBeforeFlip(s.currentIdx);
    s.isAnimating = true;
    s.current = items[s.currentIdx];

    const forward =
      (dir === "next" && opts.direction === "ltr") ||
      (dir === "prev" && opts.direction === "rtl");

    if (page !== undefined) {
      s.previous = s.currentIdx;
      s.currentIdx = page;
    } else if (forward) {
      if (!opts.circular && s.currentIdx === itemsCount - 1) s.end = true;
      else {
        s.previous = s.currentIdx;
        s.currentIdx = s.currentIdx < itemsCount - 1 ? s.currentIdx + 1 : 0;
      }
    } else {
      if (!opts.circular && s.currentIdx === 0) s.end = true;
      else {
        s.previous = s.currentIdx;
        s.currentIdx = s.currentIdx > 0 ? s.currentIdx - 1 : itemsCount - 1;
      }
    }

    s.nextItem = !opts.circular && s.end ? s.current : items[s.currentIdx];
    items.forEach((it) => (it.style.display = "none"));
    layout(dir);
    return true;
  }

  return {
    next: () => navigate(opts.direction === "ltr" ? "next" : "prev"),
    prev: () => navigate(opts.direction === "ltr" ? "prev" : "next"),
    jump: (page) => {
      const target = page - 1;
      if (target === s.currentIdx || target >= itemsCount || target < 0) return;
      const dir =
        opts.direction === "ltr"
          ? target > s.currentIdx
            ? "next"
            : "prev"
          : target > s.currentIdx
            ? "prev"
            : "next";
      navigate(dir, target);
    },
    isActive: () => s.isAnimating,
    destroy: () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      Array.from(el.querySelectorAll(".bb-page")).forEach((p) => p.remove());
      el.classList.remove(`bb-${opts.orientation}`);
      items.forEach((it) => (it.style.display = "none"));
      if (items[0]) items[0].style.display = "block";
    },
  };
}

/* ------------------------------------------------------------------ *
 * Calendar Model
 * ------------------------------------------------------------------ */
function buildMonth(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */
export default function BookBlockCalendar({
  images = DEFAULT_IMAGES,
  year = new Date().getFullYear(),
  width = 580,
  height = 640,
  calendarHeight = 310,
  speed = 700,
  shadows = true,
  circular = false,
  keyboard = true,
  caption = "",
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scope = `bbc-${uid}`;
  const blockRef = useRef(null);
  const apiRef = useRef(null);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => ({
        label: `${MONTHS[m]}`,
        year: `${year}`,
        rows: buildMonth(year, m),
      })),
    [year],
  );

  useEffect(() => {
    if (!blockRef.current) return;
    const api = createBookBlock(blockRef.current, {
      orientation: "horizontal",
      speed,
      shadows,
      circular,
    });
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = null;
    };
  }, [speed, shadows, circular, year, images]);

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e) => {
      const key = e.key;
      if (key === "ArrowUp" || key === "ArrowLeft") {
        apiRef.current?.prev();
        e.preventDefault();
      } else if (key === "ArrowDown" || key === "ArrowRight") {
        apiRef.current?.next();
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [keyboard]);

  // Mandatory 3D Engine CSS rules for DOM slicing
  const engineCss = `
.${scope} .bb-bookblock {
  perspective: 1300px;
  backface-visibility: hidden;
}
.${scope} .bb-item {
  display: none;
}
.${scope} .bb-page {
  position: absolute;
  transform-style: preserve-3d;
  transition-property: transform;
}
.${scope} .bb-horizontal .bb-page {
  width: 100%;
  height: 50%;
  top: 50%;
  transform-origin: center top;
}
.${scope} .bb-page > div,
.${scope} .bb-outer,
.${scope} .bb-content,
.${scope} .bb-inner {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  backface-visibility: hidden;
}
.${scope} .bb-page > div { width: 100%; transform-style: preserve-3d; }
.${scope} .bb-horizontal .bb-content { height: 200%; }
.${scope} .bb-horizontal .bb-back { transform: rotateX(-180deg); }
.${scope} .bb-outer { width: 100%; overflow: hidden; z-index: 999; }
.${scope} .bb-horizontal .bb-front .bb-content { top: -100%; }
.${scope} .bb-overlay,
.${scope} .bb-flipoverlay {
  background-color: rgba(0,0,0,0.4);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.${scope} .bb-flipoverlay { background-color: rgba(0,0,0,0.15); }
.${scope} .bb-bookblock.bb-horizontal > div.bb-page:first-child,
.${scope} .bb-bookblock.bb-horizontal > div.bb-page:first-child .bb-back {
  transform: rotateX(180deg);
}
.${scope} .bb-horizontal .bb-flip-next,
.${scope} .bb-horizontal .bb-flip-initial { transform: rotateX(180deg); }
.${scope} .bb-horizontal .bb-flip-prev { transform: rotateX(0deg); }
.${scope} .bb-horizontal .bb-flip-next-end { transform: rotateX(15deg); }
.${scope} .bb-horizontal .bb-flip-prev-end { transform: rotateX(165deg); }

@media (prefers-reduced-motion: reduce) {
  .${scope} .bb-page { transition-duration: 1ms !important; }
}
`;

  return (
    <div
      className={`${scope} relative mx-auto my-6 flex flex-col items-center justify-center font-sans ${className}`}
      style={{ width: `${width}px`, maxWidth: "100%" }}
    >
      <style dangerouslySetInnerHTML={{ __html: engineCss }} />

      {/* Main 3D Canvas Card */}
      <div
        ref={blockRef}
        className="bb-bookblock relative z-30 w-full bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {months.map((month, i) => (
          <div
            className="bb-item absolute left-0 top-0 h-full w-full overflow-hidden bg-white dark:bg-zinc-900"
            key={month.label}
          >
            {/* Top Image Box */}
            <div
              className="relative w-full overflow-hidden"
              style={{ height: `${height - calendarHeight}px` }}
            >
              <img
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                src={images[i % images.length]}
                alt={`${month.label} ${month.year}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Glassmorphic Month Badge Header */}
              <div className="absolute bottom-4 right-5 flex items-baseline gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-md ring-1 ring-white/30 shadow-lg">
                <span className="text-2xl font-light tracking-wide text-white uppercase drop-shadow-sm">
                  {month.label}
                </span>
                <span className="text-sm font-semibold text-white/80">
                  {month.year}
                </span>
              </div>
            </div>

            {/* Bottom Calendar Box */}
            <div
              className="relative w-full bg-white dark:bg-zinc-900"
              style={{ height: `${calendarHeight}px` }}
            >
              <div className="flex h-full w-full flex-col justify-between p-4">
                {/* Weekday Header */}
                <div className="grid grid-cols-7 border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  {WEEKDAYS_SHORT.map((d) => (
                    <div
                      key={d}
                      className="text-center text-[11px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Matrix */}
                <div className="flex flex-1 flex-col justify-around pt-2">
                  {month.rows.map((row, r) => (
                    <div className="grid flex-1 grid-cols-7" key={r}>
                      {row.map((day, c) => (
                        <div
                          key={c}
                          className="flex items-center justify-center p-1"
                        >
                          {day ? (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
                              {day}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Navigation Controls */}
      <nav className="z-10 mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Previous month"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md ring-1 ring-zinc-200/80 transition-all hover:scale-105 hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
          onClick={(e) => {
            e.preventDefault();
            apiRef.current?.prev();
          }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Next month"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md ring-1 ring-zinc-200/80 transition-all hover:scale-105 hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
          onClick={(e) => {
            e.preventDefault();
            apiRef.current?.next();
          }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </nav>

      {/* Caption Footer */}
      {caption && (
        <p className="mt-3 text-center text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
          {caption}
        </p>
      )}
    </div>
  );
}
