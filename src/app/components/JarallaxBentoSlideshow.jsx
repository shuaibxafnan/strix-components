"use client";

import { useCallback, useEffect, useId, useRef } from "react";

// ─── GridLayoutSlideshow ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides            array    DEFAULT_SLIDES  Slide data: name/title/text/images/areas/delays
// images            array    DEFAULT_IMAGES  Fallback image pool used when a slide has no images
// columns           number   30              Grid column count (grid-area line numbers map to this)
// rows              number   30              Grid row count
// gap               number   20              Gap between grid cells (px)
// inset             string   3em             Distance of the grid from each edge of the stage
// bgColor           string   #252626         Stage background
// revealColor       string   #252626         Color of the wipe panel that covers each cell
// revealDuration    number   0.8             Wipe animation duration (s)
// revealEase        string   cubic-bezier(0.7,0,0.3,1)  Wipe easing
// revealDirection   string   ttb             Wipe axis: ttb | btt | ltr | rtl
// textDuration      number   0.8             Fade duration for name/title/text (s)
// nameColor         string   #f95422         Big display name color
// nameSize          string   7vw             Big display name font size
// titleColor        string   #1f2ee0         Vertical title color
// titleSize         string   3.5vh           Vertical title font size
// textColor         string   #ffffff         Paragraph color
// textSize          string   0.85em          Paragraph font size
// displayFont       string   Kanit, sans-serif  Font stack for name + title
// bodyFont          string   -apple-system, ... Font stack for the paragraph
// navColor          string   #000000         Nav arrow color
// navBg             string   #fffa3a         Nav cell background
// navColorHover     string   #ffffff         Nav arrow color on hover
// navBgHover        string   #1f2ee0         Nav cell background on hover
// hoverBlendColor   string   #0013ff         Overlay color blended over an image on hover
// hoverBlendMode    string   exclusion       CSS mix-blend-mode for that overlay
// enableHoverBlend  bool     true            Turn the hover blend overlay on/off
// enableTilt        bool     true            Parallax tilt of image cells on mouse move
// tiltX             number   25              Max horizontal tilt translation (px)
// tiltY             number   25              Max vertical tilt translation (px)
// enableKeyboard    bool     true            Arrow keys navigate slides
// loop              bool     true            Wrap around at the first/last slide
// mobileBreakpoint  string   60em            Below this width the grid collapses to a simple flow
// className         string   ""              Extra classes on the outer stage
// onChange          func     null            Called with the new slide index after each transition
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

const DEFAULT_SLIDES = [
  {
    title: "Belfast",
    textAlign: "left",
    areas: [
      "11 / 1 / 17 / 5",
      "22 / 6 / 28 / 10",
      "8 / 5 / 22 / 15",
      "22 / 10 / 29 / 15",
      "1 / 11 / 8 / 15",
      "17 / 15 / 24 / 20",
      "9 / 15 / 17 / 23",
      "2 / 18 / 9 / 23",
      "17 / 20 / 22 / 26",
      "22 / 20 / 28 / 23",
      "4 / 23 / 11 / 27",
      "11 / 23 / 17 / 30",
      "17 / 26 / 22 / 28",
    ],
    delays: [150, 300, 200, 40, 70, 100, 250, 350, 400, 0, 20, 500, 120],
    titleArea: "1 / 27 / 11 / 29",
    prevArea: "3 / 6 / 8 / 11",
    nextArea: "24 / 15 / 29 / 20",
    prevDelay: 0,
    nextDelay: 0,
    images: DEFAULT_IMAGES.slice(0, 13),
  },
  {
    title: "Minsk",
    textAlign: "right",
    areas: [
      "17 / 1 / 24 / 5",
      "22 / 6 / 28 / 10",
      "14 / 5 / 22 / 10",
      "17 / 10 / 26 / 15",
      "1 / 10 / 17 / 15",
      "11 / 15 / 24 / 20",
      "5 / 15 / 11 / 18",
      "1 / 18 / 11 / 23",
      "20 / 20 / 27 / 24",
      "24 / 15 / 29 / 20",
      "4 / 23 / 11 / 27",
      "11 / 20 / 20 / 30",
      "25 / 24 / 29 / 28",
    ],
    delays: [350, 20, 0, 400, 70, 350, 200, 500, 0, 20, 450, 0, 650],
    titleArea: "1 / 27 / 11 / 29",
    prevArea: "9 / 5 / 14 / 10",
    nextArea: "20 / 24 / 25 / 30",
    prevDelay: 100,
    nextDelay: 0,
    images: DEFAULT_IMAGES.slice(12, 25),
  },
  {
    title: "Paris",
    textAlign: "right",
    areas: [
      "6 / 1 / 14 / 5",
      "3 / 5 / 14 / 10",
      "14 / 1 / 21 / 5",
      "19 / 10 / 28 / 20",
      "1 / 10 / 11 / 18",
      "11 / 10 / 19 / 15",
      "11 / 15 / 19 / 20",
      "1 / 18 / 6 / 23",
      "20 / 20 / 27 / 24",
      "20 / 28 / 25 / 30",
      "4 / 23 / 11 / 27",
      "11 / 20 / 20 / 30",
      "20 / 24 / 26 / 28",
    ],
    delays: [0, 200, 400, 300, 140, 600, 350, 500, 50, 250, 300, 100, 40],
    titleArea: "1 / 27 / 11 / 29",
    prevArea: "14 / 5 / 19 / 10",
    nextArea: "6 / 18 / 11 / 23",
    prevDelay: 0,
    nextDelay: 40,
    images: DEFAULT_IMAGES.slice(6, 19),
  },
];

const NAV_ARROW =
  "14.1333333 2.61666667 18.9333333 7.41666667 0 7.41666667 0 10.0833333 18.9333333 10.0833333 14.1333333 14.8833333 16 16.75 24 8.75 16 0.75";

export default function JarallaxBentoSlideshow({
  slides = DEFAULT_SLIDES,
  images = DEFAULT_IMAGES,
  columns = 30,
  rows = 30,
  gap = 20,
  inset = "3em",
  bgColor = "#252626",
  revealColor = "#252626",
  revealDuration = 0.8,
  revealEase = "cubic-bezier(0.7,0,0.3,1)",
  revealDirection = "ttb",
  textDuration = 0.8,
  nameColor = "#f95422",
  nameSize = "7vw",
  titleColor = "#1f2ee0",
  titleSize = "3.5vh",
  textColor = "#ffffff",
  textSize = "0.85em",
  displayFont = "Kanit, sans-serif",
  bodyFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  navColor = "#000000",
  navBg = "#fffa3a",
  navColorHover = "#ffffff",
  navBgHover = "#1f2ee0",
  hoverBlendColor = "#0013ff",
  hoverBlendMode = "exclusion",
  enableHoverBlend = true,
  enableTilt = true,
  tiltX = 25,
  tiltY = 25,
  enableKeyboard = true,
  loop = true,
  mobileBreakpoint = "60em",
  className = "",
  onChange = null,
}) {
  const uid = `gls-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const rootRef = useRef(null);
  const gridRefs = useRef([]);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);

  const resolveImage = (slide, index) =>
    (slide.images && slide.images[index]) ||
    images[index % Math.max(images.length, 1)];

  const clearRevealer = useCallback(
    (rev) => {
      rev.className = `${uid}-rev ${uid}-vis`;
    },
    [uid],
  );

  const animateRevealer = useCallback(
    (rev, action) =>
      new Promise((resolve) => {
        const delay = Number(rev.dataset.delay || 0);
        window.setTimeout(() => {
          const dir = rev.dataset.direction || revealDirection;
          const vertical = dir === "ttb" || dir === "btt";
          let edge;
          if (dir === "rtl") edge = action === "hide" ? "right" : "left";
          else if (dir === "ltr") edge = action === "hide" ? "left" : "right";
          else if (dir === "btt") edge = action === "hide" ? "bottom" : "top";
          else edge = action === "hide" ? "top" : "bottom";

          rev.className = `${uid}-rev ${uid}-${edge} ${uid}-${action}${
            vertical ? "Y" : "X"
          }`;
          rev.addEventListener("animationend", () => resolve(), { once: true });
        }, delay);
      }),
    [revealDirection, uid],
  );

  const animateText = useCallback(
    (el, action) =>
      new Promise((resolve) => {
        if (!el) {
          resolve();
          return;
        }
        el.classList.add(`${uid}-txt-${action}`);
        el.addEventListener("animationend", () => resolve(), { once: true });
      }),
    [uid],
  );

  const showGrid = useCallback(
    (index) => {
      const grid = gridRefs.current[index];
      if (!grid) return Promise.resolve();
      const revealers = Array.from(grid.querySelectorAll(`.${uid}-rev`));
      const texts = Array.from(grid.querySelectorAll(`.${uid}-txt`));

      grid.classList.add(`${uid}-animating`);
      revealers.forEach(clearRevealer);
      grid.classList.add(`${uid}-cur`);

      return Promise.all([
        ...revealers.map((rev) => animateRevealer(rev, "show")),
        ...texts.map((el) => animateText(el, "in")),
      ]).then(() => {
        texts.forEach((el) => el.classList.remove(`${uid}-txt-in`));
        grid.classList.remove(`${uid}-animating`);
      });
    },
    [animateRevealer, animateText, clearRevealer, uid],
  );

  const hideGrid = useCallback(
    (index) => {
      const grid = gridRefs.current[index];
      if (!grid) return Promise.resolve();
      const revealers = Array.from(grid.querySelectorAll(`.${uid}-rev`));
      const texts = Array.from(grid.querySelectorAll(`.${uid}-txt`));

      grid.classList.add(`${uid}-animating`);

      return Promise.all([
        ...revealers.map((rev) => animateRevealer(rev, "hide")),
        ...texts.map((el) => animateText(el, "out")),
      ]).then(() => {
        texts.forEach((el) => el.classList.remove(`${uid}-txt-out`));
        grid.classList.remove(`${uid}-animating`);
        grid.classList.remove(`${uid}-cur`);
      });
    },
    [animateRevealer, animateText, uid],
  );

  const navigate = useCallback(
    (direction) => {
      if (animatingRef.current || slides.length < 2) return;
      const total = slides.length;
      const from = currentRef.current;
      let to = direction === "next" ? from + 1 : from - 1;
      if (to >= total) {
        if (!loop) return;
        to = 0;
      }
      if (to < 0) {
        if (!loop) return;
        to = total - 1;
      }

      animatingRef.current = true;
      currentRef.current = to;
      hideGrid(from)
        .then(() => showGrid(to))
        .then(() => {
          animatingRef.current = false;
          if (typeof onChange === "function") onChange(to);
        });
    },
    [hideGrid, loop, onChange, showGrid, slides.length],
  );

  useEffect(() => {
    const grid = gridRefs.current[currentRef.current];
    if (grid) grid.classList.add(`${uid}-cur`);
  }, [uid]);

  useEffect(() => {
    if (!enableKeyboard) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "ArrowLeft") navigate("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableKeyboard, navigate]);

  useEffect(() => {
    if (!enableTilt) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    let frame = 0;

    const onMove = (e) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = w / 2;
        const cy = h / 2;
        const transX = (2 * tiltX * e.clientX) / w - tiltX;
        const transY = (2 * tiltY * e.clientY) / h - tiltY;
        const grid = root.querySelector(`.${uid}-cur`);
        if (!grid) return;
        grid.querySelectorAll(`.${uid}-img`).forEach((item) => {
          const b = item.getBoundingClientRect();
          const dist = Math.hypot(
            b.left + b.width / 2 - cx,
            b.top + b.height / 2 - cy,
          );
          item.style.transform = `translate3d(${(transX / w) * dist}px, ${
            (transY / h) * dist
          }px, 0)`;
        });
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [enableTilt, tiltX, tiltY, uid]);

  const css = `
.${uid}-stage { font-family: ${bodyFont}; }
.${uid}-grid {
  position: absolute;
  top: ${inset};
  left: ${inset};
  width: calc(100% - (${inset} * 2));
  height: calc(100% - (${inset} * 2));
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  gap: ${gap}px;
  opacity: 0;
  pointer-events: none;
}
.${uid}-grid.${uid}-cur { opacity: 1; pointer-events: auto; }
.${uid}-item {
  position: relative;
  padding: 1em;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
  transition: transform 0.2s ease-out;
}
.${uid}-img::after {
  content: '';
  position: absolute;
  inset: 0;
  background: ${hoverBlendColor};
  mix-blend-mode: ${hoverBlendMode};
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
${
  enableHoverBlend
    ? `.${uid}-grid:not(.${uid}-animating) .${uid}-img:hover::after { opacity: 1; }`
    : ""
}
.${uid}-nav {
  background: ${navBg};
  color: ${navColor};
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 0;
}
.${uid}-nav:hover { background: ${navBgHover}; color: ${navColorHover}; }
.${uid}-nav svg { display: block; width: 1.5em; height: 1.5em; fill: currentColor; }
.${uid}-nav-next svg { margin: 0 0 0 auto; }
.${uid}-nav-prev svg { transform: rotate(180deg); margin: 0; }
.${uid}-txt { pointer-events: none; padding: 0; margin: 0; }
.${uid}-name {
  text-transform: uppercase;
  line-height: 0.8;
  font-family: ${displayFont};
  font-size: ${nameSize};
  color: ${nameColor};
}
.${uid}-title {
  text-transform: uppercase;
  line-height: 0.8;
  font-family: ${displayFont};
  font-size: ${titleSize};
  writing-mode: vertical-lr;
  -webkit-writing-mode: vertical-lr;
  display: flex;
  justify-content: flex-end;
  text-align: right;
  color: ${titleColor};
}
.${uid}-text {
  font-size: ${textSize};
  line-height: 1.2;
  display: flex;
  color: ${textColor};
}
.${uid}-rev {
  position: absolute;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  top: -2px;
  left: -2px;
  background: ${revealColor};
  opacity: 0;
  pointer-events: none;
}
.${uid}-right { transform-origin: 100% 50%; }
.${uid}-left { transform-origin: 0% 50%; }
.${uid}-top { transform-origin: 50% 0%; }
.${uid}-bottom { transform-origin: 50% 100%; }
.${uid}-vis,
.${uid}-showX,
.${uid}-hideX,
.${uid}-showY,
.${uid}-hideY { opacity: 1; }
.${uid}-hideX { animation: ${uid}-hideX ${revealDuration}s ${revealEase} forwards; }
.${uid}-showX { animation: ${uid}-showX ${revealDuration}s ${revealEase} forwards; }
.${uid}-hideY { animation: ${uid}-hideY ${revealDuration}s ${revealEase} forwards; }
.${uid}-showY { animation: ${uid}-showY ${revealDuration}s ${revealEase} forwards; }
@keyframes ${uid}-hideX { from { transform: scale3d(0,1,1); } to { transform: scale3d(1,1,1); } }
@keyframes ${uid}-showX { to { opacity: 1; transform: scale3d(0,1,1); } }
@keyframes ${uid}-hideY { from { transform: scale3d(1,0,1); } to { transform: scale3d(1,1,1); } }
@keyframes ${uid}-showY { to { opacity: 1; transform: scale3d(1,0,1); } }
.${uid}-txt-in { animation: ${uid}-fadeIn ${textDuration}s ${revealEase} forwards; }
.${uid}-txt-out { animation: ${uid}-fadeOut ${textDuration}s ${revealEase} forwards; }
@keyframes ${uid}-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes ${uid}-fadeOut { to { opacity: 0; } }
@media screen and (max-width: ${mobileBreakpoint}) {
  .${uid}-grid {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0 1.5em;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    grid-template-rows: none;
    grid-auto-rows: minmax(50px, auto);
    gap: 1vw;
    overflow-y: auto;
  }
  .${uid}-item { grid-area: auto !important; min-height: 50px; }
  .${uid}-txt {
    grid-column: 1 / -1 !important;
    grid-row: auto !important;
    justify-content: flex-start;
    text-align: left !important;
    padding: 1vh 0;
  }
  .${uid}-title { writing-mode: horizontal-tb; -webkit-writing-mode: horizontal-tb; }
}
`;

  return (
    <div
      ref={rootRef}
      className={`${uid}-stage relative w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {slides.map((slide, si) => (
        <div
          key={si}
          ref={(el) => (gridRefs.current[si] = el)}
          className={`${uid}-grid`}
        >
          {slide.areas.map((area, ii) => (
            <div
              key={ii}
              className={`${uid}-item ${uid}-img`}
              style={{
                gridArea: area,
                backgroundImage: `url(${resolveImage(slide, ii)})`,
              }}
            >
              <div
                className={`${uid}-rev`}
                data-delay={(slide.delays && slide.delays[ii]) || 0}
                data-direction={revealDirection}
              />
            </div>
          ))}

          <div
            role="button"
            tabIndex={0}
            aria-label="Previous slide"
            className={`${uid}-item ${uid}-nav ${uid}-nav-prev`}
            style={{ gridArea: slide.prevArea }}
            onClick={() => navigate("prev")}
            onKeyDown={(e) => e.key === "Enter" && navigate("prev")}
          >
            <svg viewBox="0 0 24 17" aria-hidden="true">
              <polygon points={NAV_ARROW} />
            </svg>
            <div
              className={`${uid}-rev`}
              data-delay={slide.prevDelay || 0}
              data-direction={revealDirection}
            />
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Next slide"
            className={`${uid}-item ${uid}-nav ${uid}-nav-next`}
            style={{ gridArea: slide.nextArea }}
            onClick={() => navigate("next")}
            onKeyDown={(e) => e.key === "Enter" && navigate("next")}
          >
            <svg viewBox="0 0 24 17" aria-hidden="true">
              <polygon points={NAV_ARROW} />
            </svg>
            <div
              className={`${uid}-rev`}
              data-delay={slide.nextDelay || 0}
              data-direction={revealDirection}
            />
          </div>

          <h3
            className={`${uid}-txt ${uid}-title`}
            style={{ gridArea: slide.titleArea }}
          >
            {slide.title}
          </h3>
          
        </div>
      ))}
    </div>
  );
}
