"use client";

import { useEffect, useRef, useId } from "react";

// ─── ScrollGraphReveal ───────────────────────────────────────────────────────
//
// Design direction: "phosphor trace" — an analog oscilloscope / seismograph
// readout. Warm amber phosphor line on a warm near-black screen, mono
// instrument labels, a soft afterglow trailing the traveling point, and
// readout ticks dropping from each data point to a baseline grid.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #14100A    Screen/page background (phosphor-off black)
// panelColor         string   #1F160D    Vignette panel color layered behind the graph
// textColor          string   #FDF6E9    Intro/outro text color
// signalColor        string   #FFB000    Core color of the line, dots, and focal point (phosphor amber)
// signalDimColor     string   #6B4A1E    Dimmed color used for grid lines and drop ticks
// highlightColor     string   #FFD666    Secondary glow/highlight color for the focal afterglow
// fontDisplay        string   "Space Grotesk"   Display typeface for intro/outro headlines
// fontMono           string   "IBM Plex Mono"   Monospace typeface for eyebrow/instrument labels
// introEyebrow       string   "◍ SIGNAL LIVE"    Small mono label above the intro headline
// introHeadline      string   "Scroll to trace the signal"   Intro headline text
// outroEyebrow       string   "◍ END OF TRACE"   Small mono label above the outro headline
// outroHeadline      string   "You've reached the source"    Outro headline text
// introHeight        string   50vh       Height of the intro section
// scrollHeight       string   300vh      Height of the scrollable pinned section (controls scrub length)
// outroHeight        string   100vh      Height of the outro section
// bgImageUrl         string   null       Optional custom background image href drawn under the grid (omit to use the drawn grid only)
// dotRadius          number   1.5        Radius of each dot along the graph
// focalRadius        number   2          Radius of the core focal point circle
// glowRadius         number   6          Radius of the blurred afterglow behind the focal point
// pathData           string   [see default in code]   SVG path `d` the focal point travels along
// dots               array    [10 points]   Array of {cx, cy} objects for the scatter dots drawn along the graph
// baselineY          number   95         Y coordinate (in the 122x98 viewBox) the drop ticks fall to
// showDropTicks      boolean  true       Toggle the vertical readout ticks under each dot
// showGrid           boolean  true       Toggle the static horizontal instrument grid lines
// gridLineCount      number   5          Number of horizontal grid lines drawn across the viewBox
// showScanlines      boolean  true       Toggle the subtle static CRT scanline overlay
// scanlineOpacity    number   0.05       Opacity of the scanline overlay
// panScaleStart      number   2          Initial scale of the pan/zoom group before scroll begins
// panScaleEnd        number   0.4        Final scale of the pan/zoom group at scroll end
// panXStart          number   61         Initial x offset of the pan/zoom group
// panXEnd            number   81         Final x offset of the pan/zoom group
// panYStart          number   50         Initial y offset of the pan/zoom group
// panYEnd            number   45         Final y offset of the pan/zoom group
// panScaleEase       string   "expo.inOut"   Easing used for the pan/zoom scale+position tween
// panFollowDuration  number   0.3        Duration (s) of the smoothing quickTo tween that follows the focal point
// drawDuration       number   1          Portion of the scrub timeline (relative units) used to draw the path
// dotsStartOffset    number   0.13       Timeline offset (relative units) at which dot pop-in begins
// dotsStagger        number   0.102      Stagger (s) between each dot's pop-in animation
// dotsPopDuration    number   0.03       Duration (s) of each individual dot's pop-in animation
// fadeInDuration     number   0.1        Duration (relative units) of the initial graph opacity fade-in
// pinStart           string   "0 0"      ScrollTrigger start position for pinning
// pinEnd             string   "100% 100%"   ScrollTrigger end position for pinning
// scrubAmount        number   1          ScrollTrigger scrub smoothing value
// ringPulseDuration  number   2.4        Duration (s) of the idle pulse ring animation around the focal point
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_DOTS = [
  { cx: 26, cy: 42 },
  { cx: 35.3, cy: 33 },
  { cx: 44.9, cy: 21 },
  { cx: 54.2, cy: 14 },
  { cx: 63.6, cy: 22 },
  { cx: 73, cy: 30 },
  { cx: 82.5, cy: 26 },
  { cx: 92, cy: 33 },
  { cx: 101.4, cy: 38.5 },
  { cx: 110.5, cy: 35 },
];

const DEFAULT_PATH =
  "M16.5 54c3.83-6 9.33-12 9.33-12L35.5 32.5S44 22.33 44.67 21s6.33-6.83 9.5-7 13.83 14 19 15.67 7.17-4 9.17-3.5 14.5 11.33 18.17 12 8.67-.67 10-3";

export default function ScrollGraph({
  bgColor = "#14100A",
  panelColor = "#1F160D",
  textColor = "#FDF6E9",
  signalColor = "#FFB000",
  signalDimColor = "#6B4A1E",
  highlightColor = "#FFD666",
  fontDisplay = "Space Grotesk",
  fontMono = "IBM Plex Mono",
  introEyebrow = "◍ SIGNAL LIVE",
  introHeadline = "Scroll to trace the signal",
  outroEyebrow = "◍ END OF TRACE",
  outroHeadline = "You've reached the source",
  introHeight = "50vh",
  scrollHeight = "300vh",
  outroHeight = "100vh",
  bgImageUrl = null,
  dotRadius = 1.5,
  focalRadius = 2,
  glowRadius = 6,
  pathData = DEFAULT_PATH,
  dots = DEFAULT_DOTS,
  baselineY = 95,
  showDropTicks = true,
  showGrid = true,
  gridLineCount = 5,
  showScanlines = true,
  scanlineOpacity = 0.05,
  panScaleStart = 2,
  panScaleEnd = 0.4,
  panXStart = 61,
  panXEnd = 81,
  panYStart = 50,
  panYEnd = 45,
  panScaleEase = "expo.inOut",
  panFollowDuration = 0.3,
  drawDuration = 1,
  dotsStartOffset = 0.13,
  dotsStagger = 0.102,
  dotsPopDuration = 0.03,
  fadeInDuration = 0.1,
  pinStart = "0 0",
  pinEnd = "100% 100%",
  scrubAmount = 1,
  ringPulseDuration = 2.4,
}) {
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const focalGroupRef = useRef(null);
  const graphRef = useRef(null);
  const povPanRef = useRef(null);
  const povScaleRef = useRef(null);
  const dotsWrapRef = useRef(null);
  const ticksWrapRef = useRef(null);
  const ctxRef = useRef(null);

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

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/MotionPathPlugin.min.js",
      ),
    ])
      .then(() => {
        const { gsap } = window;
        if (!gsap || !rootRef.current) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(window.ScrollTrigger, window.MotionPathPlugin);

        const ctx = gsap.context(() => {
          const pathEl = pathRef.current;
          const focalEl = focalGroupRef.current;
          const dotEls = dotsWrapRef.current
            ? dotsWrapRef.current.querySelectorAll("circle")
            : [];
          const tickEls = ticksWrapRef.current
            ? ticksWrapRef.current.querySelectorAll("line")
            : [];

          const pathLength = pathEl.getTotalLength();
          gsap.set(pathEl, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          });

          const xTo = gsap.quickTo(povPanRef.current, "x", {
            duration: panFollowDuration,
          });
          const yTo = gsap.quickTo(povPanRef.current, "y", {
            duration: panFollowDuration,
          });

          gsap.set(povPanRef.current, {
            x: -gsap.getProperty(focalEl, "x"),
            y: -gsap.getProperty(focalEl, "y"),
          });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: rootRef.current.querySelector("[data-scroll-section]"),
                start: pinStart,
                end: pinEnd,
                pin: graphRef.current,
                scrub: scrubAmount,
              },
              onUpdate: () => {
                xTo(-gsap.getProperty(focalEl, "x"));
                yTo(-gsap.getProperty(focalEl, "y"));
              },
              defaults: { duration: 1, ease: "none" },
            })
            .fromTo(
              graphRef.current,
              { opacity: 0 },
              { duration: fadeInDuration, opacity: 1 },
              0,
            )
            .fromTo(
              pathEl,
              { strokeDashoffset: pathLength },
              { strokeDashoffset: 0, duration: drawDuration },
              0,
            )
            .to(
              focalEl,
              {
                motionPath: {
                  path: pathEl,
                },
                immediateRender: true,
                duration: drawDuration,
              },
              0,
            )
            .from(
              dotEls,
              {
                attr: { r: 0 },
                stagger: dotsStagger,
                duration: dotsPopDuration,
              },
              dotsStartOffset,
            )
            .from(
              tickEls,
              {
                scaleY: 0,
                opacity: 0,
                transformOrigin: "50% 100%",
                stagger: dotsStagger,
                duration: dotsPopDuration,
              },
              dotsStartOffset,
            )
            .fromTo(
              povScaleRef.current,
              { x: panXStart, y: panYStart, scale: panScaleStart },
              {
                scale: panScaleEnd,
                x: panXEnd,
                y: panYEnd,
                ease: panScaleEase,
                duration: 1,
              },
              0,
            );
        }, rootRef);

        ctxRef.current = ctx;
      })
      .catch((e) =>
        console.error("[ScrollGraphReveal] GSAP load failed:", e.message),
      );

    return () => {
      if (ctxRef.current) ctxRef.current.revert();
    };
  }, [
    pathData,
    panFollowDuration,
    pinStart,
    pinEnd,
    scrubAmount,
    fadeInDuration,
    drawDuration,
    dotsStagger,
    dotsPopDuration,
    dotsStartOffset,
    panXStart,
    panXEnd,
    panYStart,
    panYEnd,
    panScaleStart,
    panScaleEnd,
    panScaleEase,
  ]);

  const gridLines = Array.from({ length: gridLineCount }, (_, i) => {
    return (98 / (gridLineCount + 1)) * (i + 1);
  });

  return (
    <div ref={rootRef} style={{ backgroundColor: bgColor, color: textColor }}>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');" +
            ".sgr-" +
            uid +
            "-eyebrow{font-family:'" +
            fontMono +
            "',monospace;}" +
            ".sgr-" +
            uid +
            "-headline{font-family:'" +
            fontDisplay +
            "',sans-serif;}" +
            ".sgr-" +
            uid +
            "-dot{animation:sgr-" +
            uid +
            "-blink 1.6s ease-in-out infinite;}" +
            "@keyframes sgr-" +
            uid +
            "-blink{0%,100%{opacity:1;}50%{opacity:0.25;}}" +
            ".sgr-" +
            uid +
            "-ring{animation:sgr-" +
            uid +
            "-pulse " +
            ringPulseDuration +
            "s ease-out infinite;transform-box:fill-box;transform-origin:center;}" +
            "@keyframes sgr-" +
            uid +
            "-pulse{0%{transform:scale(0.6);opacity:0.6;}100%{transform:scale(2.4);opacity:0;}}" +
            "@media (prefers-reduced-motion: reduce){.sgr-" +
            uid +
            "-dot,.sgr-" +
            uid +
            "-ring{animation:none;}}",
        }}
      />

      <section
        className="relative left-0 top-0 w-full flex items-end justify-center px-6 pb-16"
        style={{ height: introHeight }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className={
              "sgr-" + uid + "-eyebrow text-[11px] tracking-[0.3em] uppercase"
            }
            style={{ color: signalColor }}
          >
            <span className={"sgr-" + uid + "-dot inline-block"}>
              {introEyebrow}
            </span>
          </span>
          <h2
            className={
              "sgr-" +
              uid +
              "-headline text-3xl sm:text-5xl font-semibold max-w-2xl leading-tight"
            }
            style={{ color: textColor }}
          >
            {introHeadline}
          </h2>
        </div>
      </section>

      <section
        data-scroll-section
        className="relative left-0 top-0 w-full flex items-center justify-center"
        style={{ height: scrollHeight }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, " +
              panelColor +
              " 0%, " +
              bgColor +
              " 70%)",
          }}
        />

        {showScanlines && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              opacity: scanlineOpacity,
              backgroundImage:
                "repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)",
            }}
          />
        )}

        <svg
          ref={graphRef}
          className="absolute top-0 w-screen h-screen overflow-visible opacity-0"
          viewBox="0 0 122 98"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter
              id={"sgr-glow-" + uid}
              x="-200%"
              y="-200%"
              width="500%"
              height="500%"
            >
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id={"sgr-focal-glow-" + uid}>
              <stop offset="0%" stopColor={highlightColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={highlightColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          <g ref={povScaleRef}>
            <g ref={povPanRef}>
              {bgImageUrl && (
                <image
                  href={bgImageUrl}
                  width="122"
                  height="98"
                  opacity="0.5"
                />
              )}

              {showGrid &&
                gridLines.map((y, i) => (
                  <line
                    key={i}
                    x1="0"
                    x2="122"
                    y1={y}
                    y2={y}
                    stroke={signalDimColor}
                    strokeWidth="0.15"
                    opacity="0.5"
                  />
                ))}

              {showGrid && (
                <line
                  x1="0"
                  x2="122"
                  y1={baselineY}
                  y2={baselineY}
                  stroke={signalDimColor}
                  strokeWidth="0.25"
                  opacity="0.8"
                />
              )}

              {showDropTicks && (
                <g ref={ticksWrapRef}>
                  {dots.map((d, i) => (
                    <line
                      key={i}
                      x1={d.cx}
                      x2={d.cx}
                      y1={d.cy}
                      y2={baselineY}
                      stroke={signalDimColor}
                      strokeWidth="0.25"
                      strokeDasharray="0.8 0.8"
                      opacity="0.7"
                    />
                  ))}
                </g>
              )}

              <g fill={signalColor}>
                <circle cx="16.5" cy="54" r={dotRadius} />
              </g>
              <g ref={dotsWrapRef} fill={signalColor}>
                {dots.map((d, i) => (
                  <circle key={i} cx={d.cx} cy={d.cy} r={dotRadius} />
                ))}
              </g>

              <path
                ref={pathRef}
                fill="none"
                stroke={signalColor}
                strokeWidth="0.6"
                strokeLinecap="round"
                filter={"url(#sgr-glow-" + uid + ")"}
                d={pathData}
              />

              <g ref={focalGroupRef}>
                <circle
                  className={"sgr-" + uid + "-ring"}
                  r={glowRadius}
                  fill="none"
                  stroke={highlightColor}
                  strokeWidth="0.3"
                />
                <circle
                  r={glowRadius}
                  fill={"url(#sgr-focal-glow-" + uid + ")"}
                />
                <circle r={focalRadius} fill={signalColor} />
                <circle r={focalRadius * 0.4} fill={textColor} />
              </g>
            </g>
          </g>
        </svg>
      </section>

      <section
        className="relative left-0 top-0 w-full flex items-start justify-center px-6 pt-16"
        style={{ height: outroHeight }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className={
              "sgr-" + uid + "-eyebrow text-[11px] tracking-[0.3em] uppercase"
            }
            style={{ color: signalColor }}
          >
            <span className={"sgr-" + uid + "-dot inline-block"}>
              {outroEyebrow}
            </span>
          </span>
          <h2
            className={
              "sgr-" +
              uid +
              "-headline text-3xl sm:text-5xl font-semibold max-w-2xl leading-tight"
            }
            style={{ color: textColor }}
          >
            {outroHeadline}
          </h2>
        </div>
      </section>
    </div>
  );
}
