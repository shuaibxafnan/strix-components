"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

// ─── SlicedDualImageLayout ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides            array    see below   Slide data: images, nav label, lines
// sliceCount        number   179         Number of alternating image slices
// orientation       string   horizontal  'horizontal' | 'vertical' slicing
// sliceGap          number   0           Gap in px between slices
// sliceLayout       string   full        'full' | 'offset' (staggered slices)
// offsetAmount      number   10          % inset used when sliceLayout='offset'
// bgColor           string   #000        Page background behind the slices
// overlayColor      string   #555555     Fill shown when images fail to load
// headingColor      string   #f3dd20     Color of the large heading lines
// accentColor       string   #22f7c5     Color of lines marked accent
// dateColor         string   #ffffff     Color of the date strip
// navColor          string   #f3dd22     Idle nav link color
// navActiveColor    string   #f09467     Active nav link color
// fontFamily        string   monospace   Font stack for all layout text
// headingSize       string   8vmax       font-size of large heading lines
// accentSize        string   4vh         font-size of accent lines
// navSize           string   3.5vh       font-size of nav items
// dateSize          string   6vh         font-size of the date strip
// dateText          string   —           Text rendered in the date strip
// showDate          bool     true        Toggle the date strip entirely
// showNav           bool     true        Toggle the slide nav entirely
// gridColumns       number   20          Layout grid column count
// gridRows          number   7           Layout grid row count
// navArea           string   —           gridArea for the nav block
// dateArea          string   —           gridArea for the date block
// letterFadeMin     number   200         Min per-letter reveal delay (ms)
// letterFadeMax     number   1000        Max per-letter reveal delay (ms)
// letterFadeSpeed   number   120         Per-letter fade transition (ms)
// glitchLeadMs      number   1000        Glitch duration before images swap
// glitchTailMs      number   500         Glitch duration after images swap
// glitchStepMin     number   50          Min ms a slice holds a glitch offset
// glitchStepMax     number   100          Max ms a slice holds a glitch offset
// glitchIterations  number   5           Offset changes per glitch burst
// glitchAmplitude   number   0.5         Offset range as fraction of slice size
// crossfadeMs       number   500         Slice container fade in/out duration
// glitchDate        bool     true        Apply jitter to the date letters
// dateGlitchRange   number   5           Max px jitter on date letters
// className         string   ""          Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    evenImage:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80",
    oddImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=80",
    navLabel: "New York",
    lines: [
      { text: "Ara May", area: "1 / 2 / auto / 20" },
      {
        text: "Creativity takes courage",
        accent: true,
        area: "2 / 2 / auto / 20",
      },
    ],
  },
  {
    evenImage:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80",
    oddImage:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80",
    navLabel: "London",
    lines: [
      { text: "Gary Beck", area: "1 / 2 / auto / 20" },
      { text: "Honesty through arts", accent: true, area: "2 / 2 / auto / 20" },
    ],
  },
  {
    evenImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80",
    oddImage:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=80",
    navLabel: "Paris",
    lines: [
      { text: "Mike Woo", area: "1 / 2 / auto / 20" },
      { text: "Happiness machines", accent: true, area: "2 / 2 / auto / 20" },
    ],
  },
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function SlicedDualImage({
  slides = DEFAULT_SLIDES,
  sliceCount = 179,
  orientation = "horizontal",
  sliceGap = 0,
  sliceLayout = "full",
  offsetAmount = 10,
  bgColor = "#000",
  overlayColor = "#555555",
  headingColor = "#f3dd20",
  accentColor = "#22f7c5",
  dateColor = "#ffffff",
  navColor = "#f3dd22",
  navActiveColor = "#f09467",
  fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace",
  headingSize = "8vmax",
  accentSize = "4vh",
  navSize = "3.5vh",
  dateSize = "6vh",
  dateText = "23 → 28 Jan 2018",
  showDate = true,
  showNav = true,
  gridColumns = 20,
  gridRows = 7,
  navArea = "5 / 2 / auto / 20",
  dateArea = "7 / 5 / auto / 20",
  letterFadeMin = 200,
  letterFadeMax = 1000,
  letterFadeSpeed = 120,
  glitchLeadMs = 1000,
  glitchTailMs = 500,
  glitchStepMin = 50,
  glitchStepMax = 100,
  glitchIterations = 5,
  glitchAmplitude = 0.5,
  crossfadeMs = 500,
  glitchDate = true,
  dateGlitchRange = 5,
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const total = Math.max(2, sliceCount);
  const isVertical = orientation === "vertical";

  const slicesRef = useRef(null);
  const dateRef = useRef(null);
  const slideRefs = useRef([]);
  const busyRef = useRef(false);
  const timersRef = useRef([]);

  const [current, setCurrent] = useState(0);
  const [pair, setPair] = useState({
    even: slides[0]?.evenImage,
    odd: slides[0]?.oddImage,
  });
  const [faded, setFaded] = useState(false);

  const wait = useCallback((ms) => {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      timersRef.current.push(id);
    });
  }, []);

  const revealLetters = useCallback(
    (index, show) => {
      const node = slideRefs.current[index];
      if (!node) return Promise.resolve();
      const letters = Array.from(node.querySelectorAll("[data-letter]"));
      let longest = 0;
      letters.forEach((letter) => {
        const delay = randInt(letterFadeMin, letterFadeMax);
        longest = Math.max(longest, delay);
        letter.style.transitionDuration = `${letterFadeSpeed}ms`;
        letter.style.transitionDelay = `${delay}ms`;
        letter.style.opacity = show ? "1" : "0";
      });
      return wait(longest + letterFadeSpeed);
    },
    [letterFadeMin, letterFadeMax, letterFadeSpeed, wait],
  );

  const runGlitch = useCallback(
    (duration) => {
      const root = slicesRef.current;
      if (!root) return;
      const nodes = Array.from(root.querySelectorAll("[data-slice]"));
      const prop = isVertical ? "right" : "top";
      const stop = Date.now() + duration;

      nodes.forEach((node) => {
        const size = isVertical ? node.offsetWidth : node.offsetHeight;
        const span = Math.max(1, Math.round(size * glitchAmplitude));
        let iteration = 0;
        const tick = () => {
          if (Date.now() > stop) {
            node.style[prop] = "0px";
            return;
          }
          if (iteration >= glitchIterations) {
            node.style[prop] = "0px";
            iteration = 0;
          } else {
            node.style[prop] = `${randInt(-span, span)}px`;
            iteration += 1;
          }
          const id = setTimeout(tick, randInt(glitchStepMin, glitchStepMax));
          timersRef.current.push(id);
        };
        const id = setTimeout(tick, randInt(0, glitchStepMax));
        timersRef.current.push(id);
      });
    },
    [
      isVertical,
      glitchAmplitude,
      glitchIterations,
      glitchStepMin,
      glitchStepMax,
    ],
  );

  useEffect(() => {
    revealLetters(0, true);
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [revealLetters]);

  useEffect(() => {
    if (!glitchDate || !dateRef.current) return;
    const letters = Array.from(
      dateRef.current.querySelectorAll("[data-letter]"),
    );
    let alive = true;
    const local = [];
    letters.forEach((letter) => {
      const loop = () => {
        if (!alive) return;
        letter.style.transform = `translate3d(${randInt(
          -dateGlitchRange,
          dateGlitchRange,
        )}px, ${randInt(-dateGlitchRange, dateGlitchRange)}px, 0)`;
        const id = setTimeout(
          () => {
            if (!alive) return;
            letter.style.transform = "translate3d(0,0,0)";
            const next = setTimeout(loop, randInt(600, 4000));
            local.push(next);
          },
          randInt(glitchStepMin, glitchStepMax),
        );
        local.push(id);
      };
      const id = setTimeout(loop, randInt(400, 3000));
      local.push(id);
    });
    return () => {
      alive = false;
      local.forEach(clearTimeout);
    };
  }, [glitchDate, dateGlitchRange, glitchStepMin, glitchStepMax]);

  const goTo = useCallback(
    async (index) => {
      if (busyRef.current || index === current || !slides[index]) return;
      busyRef.current = true;

      runGlitch(glitchLeadMs + crossfadeMs + glitchTailMs);
      revealLetters(current, false).then(() => revealLetters(index, true));
      setCurrent(index);

      await wait(glitchLeadMs);
      setFaded(true);
      await wait(crossfadeMs);
      setPair({ even: slides[index].evenImage, odd: slides[index].oddImage });
      setFaded(false);
      await wait(crossfadeMs + glitchTailMs);
      busyRef.current = false;
    },
    [
      current,
      slides,
      runGlitch,
      revealLetters,
      wait,
      glitchLeadMs,
      glitchTailMs,
      crossfadeMs,
    ],
  );

  const sliceNodes = Array.from({ length: total }, (_, i) => {
    const even = i % 2 === 0;
    const a = `calc(100% / ${total} * ${i} - 1px)`;
    const b = `calc(100% / ${total} * ${i + 1} + 1px)`;
    const clip = isVertical
      ? `polygon(${a} 0, ${b} 0, ${b} 100%, ${a} 100%)`
      : `polygon(0 ${a}, 100% ${a}, 100% ${b}, 0 ${b})`;
    const offsetStyle =
      sliceLayout === "offset" && !even
        ? isVertical
          ? { top: `${offsetAmount}%` }
          : { left: `${offsetAmount}%` }
        : null;

    return (
      <div
        key={i}
        data-slice=""
        className="relative overflow-hidden"
        style={{
          ...(sliceLayout === "offset"
            ? isVertical
              ? { height: "90%" }
              : { width: "90%" }
            : null),
          ...offsetStyle,
        }}
      >
        <div className="relative w-full h-full">
          <div
            className="absolute top-0 left-0 bg-no-repeat bg-cover bg-center"
            style={{
              width: "100vw",
              height: "100vh",
              backgroundColor: overlayColor,
              backgroundImage: `url(${even ? pair.even : pair.odd})`,
              clipPath: clip,
              WebkitClipPath: clip,
              ...(isVertical
                ? { left: `calc(-100vw / ${total} * ${i})` }
                : { top: `calc(-100vh / ${total} * ${i})` }),
            }}
          />
        </div>
      </div>
    );
  });

  const renderLine = (line, key) => (
    <div
      key={key}
      className="flex flex-wrap items-start uppercase leading-none whitespace-pre"
      style={{
        gridArea: line.area,
        fontSize: line.accent ? accentSize : headingSize,
        color: line.accent ? accentColor : headingColor,
        padding: line.accent ? "0 0.2em" : undefined,
      }}
    >
      {Array.from(line.text).map((ch, i) => (
        <span
          key={i}
          data-letter=""
          className={`relative block flex-none sdil-${uid}-letter`}
        >
          {ch}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`relative w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor, fontFamily }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .sdil-${uid}-letter {
              opacity: 0;
              transition-property: opacity;
              transition-timing-function: linear;
            }
            .sdil-${uid}-slices [data-slice] {
              transition: none;
            }
          `,
        }}
      />

      <div
        ref={slicesRef}
        className={`absolute top-0 left-0 grid sdil-${uid}-slices`}
        style={{
          width: "calc(100vw + 3px)",
          height: "calc(100vh + 3px)",
          gap: `${sliceGap}px`,
          opacity: faded ? 0 : 1,
          transition: `opacity ${crossfadeMs}ms ease`,
          ...(isVertical
            ? { gridTemplateColumns: `repeat(${total}, 1fr)` }
            : { gridTemplateRows: `repeat(${total}, 1fr)` }),
          ...(sliceLayout === "offset"
            ? {
                top: "50%",
                left: "50%",
                transform: "translate3d(-50%, -50%, 0)",
              }
            : null),
        }}
      >
        {sliceNodes}
      </div>

      <div
        className="relative grid h-screen justify-center content-center"
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, ${100 / gridColumns}%)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          padding: "6em 5vw 4em",
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            className="absolute top-0 left-0 grid w-full h-full pointer-events-none"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, ${100 / gridColumns}%)`,
              gridTemplateRows: `repeat(${gridRows}, 1fr)`,
              padding: "6em 5vw 4em",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            {slide.lines.map((line, i) => renderLine(line, i))}
          </div>
        ))}

        {showNav ? (
          <nav
            className="relative z-20 flex flex-col items-start self-center px-2"
            style={{ gridArea: navArea }}
          >
            {slides.map((slide, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className="block mb-2 text-left"
                style={{
                  fontSize: navSize,
                  color: index === current ? navActiveColor : navColor,
                  borderBottom:
                    index === current ? "none" : `2px solid ${navColor}`,
                }}
              >
                {slide.navLabel}
              </button>
            ))}
          </nav>
        ) : null}

        {showDate ? (
          <div
            ref={dateRef}
            className="relative z-10 flex flex-wrap items-start self-end whitespace-pre"
            style={{ gridArea: dateArea, fontSize: dateSize, color: dateColor }}
          >
            {Array.from(dateText).map((ch, i) => (
              <span
                key={i}
                data-letter=""
                className="relative block flex-none"
                style={{ transition: "transform 40ms linear" }}
              >
                {ch}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
