"use client";

import { useId } from "react";

// ─── DeckCarousel ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides            array    6 items    [{ image, alt, caption, bgColor }]
// baseColor         string   #2a2a2a    Backdrop behind the first slide
// textColor         string   #ffffff    Base text color
// heading           string   Collections  Header label, top-left
// showHeader        boolean  true       Render the header bar
// showIndicator     boolean  true       Render the rolling counter + progress bar
// showCaptions      boolean  true       Render the giant scrolling caption strip
// itemAspect        number   0.655      Photo slot width as a fraction of its height
// itemMaxHeight     number   1000       Hard ceiling on photo height (px)
// photoInsetY       string   7.5cqh     Vertical inset of the photo stage
// stageMinHeight    string   300px      Minimum height of the photo stage
// deckRotations     array    [-5,5,-9,9.5,9.5,9.5]   Degrees added per stack position
// exitRotation      number   -22        Rotation of the departing top card
// exitShiftX        string   -120%      translateX of the departing top card
// scrollSmooth      boolean  true       Smooth scrolling behavior
// captionOpacity    number   0.5        Opacity of the caption strip
// captionSize       string   min(15.625rem,20vh)   Caption font size
// captionLeading    number   1.2        Caption line-height multiplier
// velocityScale     number   2          How much scroll speed squashes captions
// velocityLag       string   0.15s      Delay constant for the velocity readout
// serifFamily       string   Cardo, ui-serif, Georgia, serif   Caption font stack
// sansFamily        string   Inter, ui-sans-serif, system-ui, sans-serif   Base font stack
// progressHeight    string   8rem       Height of the vertical progress track
// noiseUrl          string   ""         Optional tiling noise texture overlay
// fallbackText      string   ...        Message for browsers without SDA support
// className         string   ""         Extra classes on the root element
// ──────────────────────────────────────────────────────────────────────────

const ORDINALS = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
];

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    alt: "fashion",
    caption: "Fashion",
    bgColor: "#2a2a2a",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    alt: "artwork",
    caption: "Artworks",
    bgColor: "#C09E6F",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    alt: "portrait",
    caption: "Portraits",
    bgColor: "#B4806A",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    alt: "still life",
    caption: "Still Life",
    bgColor: "#68432D",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    alt: "lifestyle",
    caption: "Lifestyle",
    bgColor: "#3B626E",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    alt: "wedding",
    caption: "Wedding",
    bgColor: "#2E423D",
  },
];

export default function DeckSlideCarousel({
  slides = DEFAULT_SLIDES,
  baseColor = "#2a2a2a",
  textColor = "#ffffff",
  heading = "Collections",
  showHeader = true,
  showIndicator = true,
  showCaptions = true,
  itemAspect = 0.655,
  itemMaxHeight = 1000,
  photoInsetY = "7.5cqh",
  stageMinHeight = "300px",
  deckRotations = [-5, 5, -9, 9.5, 9.5, 9.5],
  exitRotation = -22,
  exitShiftX = "-120%",
  scrollSmooth = true,
  captionOpacity = 0.5,
  captionSize = "min(15.625rem,20vh)",
  captionLeading = 1.2,
  velocityScale = 2,
  velocityLag = "0.15s",
  serifFamily = "Cardo, ui-serif, Georgia, serif",
  sansFamily = "Inter, ui-sans-serif, system-ui, sans-serif",
  progressHeight = "8rem",
  noiseUrl = "",
  fallbackText = "This browser does not support scroll-driven animations.",
  className = "",
}) {
  const uid = `dc${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const count = slides.length;

  const kf = (n) => `${uid}-${ORDINALS[n] || `pos${n}`}`;
  const tl = (i) => `--${uid}-slide-${i}`;

  const itemWidth = `calc(min(100cqh, ${itemMaxHeight}px) * ${itemAspect})`;
  const insetX = `calc(50cqw - (${itemWidth}) / 2)`;

  const deckFrames = slides
    .map((_, n) =>
      n === 0
        ? `@keyframes ${kf(0)} {
  50% { transform: rotate(${deckRotations[0] ?? -5}deg); }
  100% { transform: rotate(${exitRotation}deg) translateX(${exitShiftX}); }
}`
        : `@keyframes ${kf(n)} {
  50% { transform: rotate(${deckRotations[n] ?? 0}deg); }
}`,
    )
    .join("\n");

  const sheet = `
@property --${uid}-pos {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
@property --${uid}-posd {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
${deckFrames}
@keyframes ${uid}-fadeout {
  50% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes ${uid}-fade {
  0% { opacity: 0; }
  50% { opacity: 1; }
}
@keyframes ${uid}-captions {
  100% { transform: translateY(calc((${count} - 1) / ${count} * -100%)); }
}
@keyframes ${uid}-indicator {
  100% { transform: translateY(calc((${count} - 1) * -100%)); }
}
@keyframes ${uid}-progress {
  from { transform: scaleY(calc(1 / ${count})); }
}
@keyframes ${uid}-adjustpos {
  to { --${uid}-pos: 1; --${uid}-posd: 1; }
}
`;

  const deckStyle = (i) => {
    const names = [];
    const timelines = [];
    const comps = [];
    for (let k = 0; k <= i; k++) {
      names.push(`${kf(i - k)} auto linear both`);
      timelines.push(tl(k));
      comps.push("add");
    }
    if (i < count - 1) {
      names.push(`${uid}-fadeout auto linear both`);
      timelines.push(tl(i));
      comps.push("replace");
    }
    return {
      animation: names.join(", "),
      animationTimeline: timelines.join(", "),
      animationComposition: comps.join(", "),
      zIndex: -i,
      width: itemWidth,
      maxHeight: `${itemMaxHeight}px`,
    };
  };

  return (
    <div
      className={`relative isolate flex min-h-screen flex-col overflow-clip ${className}`}
      style={{
        backgroundColor: baseColor,
        color: textColor,
        fontFamily: sansFamily,
        timelineScope: [
          `--${uid}-scroller`,
          ...slides.map((_, i) => tl(i)),
        ].join(", "),
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: sheet }} />

      {noiseUrl && (
        <div
          className="pointer-events-none absolute inset-0 -z-40 h-full w-full"
          style={{ backgroundImage: `url("${noiseUrl}")` }}
        />
      )}

      {slides.slice(1).map((slide, i) => (
        <div
          key={`bg-${i}`}
          className="absolute inset-0 -z-30 h-full w-full opacity-0 [animation:var(--kf)_linear_both] [animation-timeline:var(--tl)]"
          style={{
            backgroundColor: slide.bgColor,
            "--tl": tl(i + 1),
            "--kf": `${uid}-fade`,
          }}
        />
      ))}

      {showHeader && (
        <header className="relative z-50 mx-7 flex justify-between gap-2 py-6 max-lg:flex-col">
          <h1 className="inline align-middle text-sm font-bold tracking-widest whitespace-nowrap uppercase">
            {heading}
          </h1>
        </header>
      )}

      <div
        className="hidden flex-1 items-stretch supports-[timeline-scope:none]:flex"
        style={{ minHeight: stageMinHeight }}
      >
        <div className="relative w-full [container-type:size]">
          <div
            className={`absolute inset-0 h-full w-full snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scroll-timeline-axis:x] [scroll-timeline-name:var(--st)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              scrollSmooth ? "scroll-smooth" : ""
            }`}
            style={{
              "--st": `--${uid}-scroller`,
              "--iw": itemWidth,
              "--ix": insetX,
            }}
          >
            <div className="grid h-full w-fit grid-flow-col auto-cols-[var(--iw)] px-[var(--ix)]">
              {slides.map((_, i) => (
                <div
                  key={`anchor-${i}`}
                  role="none"
                  className="snap-center [view-timeline-axis:x] [view-timeline-inset:var(--ix)] [view-timeline-name:var(--vt)]"
                  style={{ "--vt": tl(i) }}
                />
              ))}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 isolate"
            style={{ top: photoInsetY, bottom: photoInsetY }}
          >
            {slides.map((slide, i) => (
              <img
                key={`photo-${i}`}
                src={slide.image}
                alt={slide.alt || ""}
                className="absolute inset-y-0 left-1/2 h-full -translate-x-1/2 object-cover"
                style={deckStyle(i)}
              />
            ))}
          </div>
        </div>

        {showIndicator && (
          <div className="absolute top-1/2 left-7 z-40 flex -translate-y-1/2 flex-col items-center gap-2 text-sm font-medium">
            <span className="block h-[1.2em] overflow-y-clip">
              <span
                aria-hidden="true"
                className="flex flex-col items-center leading-[1.2] [animation:var(--kf)_linear_both] [animation-timeline:var(--tl)]"
                style={{
                  "--tl": `--${uid}-scroller`,
                  "--kf": `${uid}-indicator`,
                }}
              >
                {slides.map((_, i) => (
                  <span key={`num-${i}`}>{String(i + 1).padStart(2, "0")}</span>
                ))}
              </span>
            </span>
            <div className="bg-white/20">
              <div
                className="w-0.5 origin-top bg-white [animation:var(--kf)_linear_both] [animation-timeline:var(--tl)]"
                style={{
                  height: progressHeight,
                  "--tl": `--${uid}-scroller`,
                  "--kf": `${uid}-progress`,
                }}
              />
            </div>
            {String(count).padStart(2, "0")}
          </div>
        )}
      </div>

      {showCaptions && (
        <div
          className="hidden h-[0.65em] overflow-clip select-none [animation:var(--kf)_linear_both] [animation-timeline:var(--tl)] [clip-path:inset(0.05em_0_0)] supports-[timeline-scope:none]:block"
          style={{
            fontFamily: serifFamily,
            fontSize: captionSize,
            lineHeight: captionLeading,
            "--tl": `--${uid}-scroller`,
            "--kf": `${uid}-adjustpos`,
          }}
        >
          <div
            className="flex w-fit translate-x-[calc(50vw-50%)] flex-col items-center whitespace-nowrap [animation:var(--kf)_linear_both] [animation-composition:add] [animation-timeline:var(--tl)] [&>*]:scale-y-[calc(var(--vabs)*var(--vs)+1)] [&>*]:translate-y-[calc(var(--v)*-100%)]"
            style={{
              opacity: captionOpacity,
              transition: `--${uid}-posd ${velocityLag} linear`,
              "--tl": `--${uid}-scroller`,
              "--kf": `${uid}-captions`,
              "--vs": velocityScale,
              "--v": `calc(var(--${uid}-pos) - var(--${uid}-posd))`,
              "--vabs": `max(var(--v), -1 * var(--v))`,
            }}
          >
            {slides.map((slide, i) => (
              <span key={`cap-${i}`}>{slide.caption}</span>
            ))}
          </div>
        </div>
      )}

      <div className="block px-7 pb-7 text-sm supports-[timeline-scope:none]:hidden">
        {fallbackText}
      </div>
    </div>
  );
}
