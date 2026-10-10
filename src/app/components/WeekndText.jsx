"use client";

import { useEffect, useRef } from "react";

// ─── WeekendMorph ─────────────────────────────────────────────────────────────
//
// Renders "WEEKND" as four stacked colored SVG letter layers that animate
// through a stretch → squish → stretch → restore bounce cycle. Each layer
// starts slightly offset in time, producing a chromatic shadow ripple.
//
// No GSAP Club plugins required — uses only gsap core (free CDN) with
// scaleY / translateY transforms anchored to each glyph's bottom edge.
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// bgColor          string    "#000"       Canvas background color
//
// colorOne         string    "#F41144"    Bottom layer fill — red
// colorTwo         string    "#6E0DFE"    Second layer fill  — purple
// colorThree       string    "#F3C607"    Third layer fill   — yellow
// colorFour        string    "#ffffff"    Top layer fill     — white
//                                         (top layer is what you actually read;
//                                          lower layers peek out as colored
//                                          shadows during the stretch phase)
//
// stretchScale     number    4.5          scaleY value at peak stretch.
//                                         Higher = taller elastic pull.
//
// squishScale      number    0.35         scaleY value at squish / landing.
//                                         Lower = flatter splat on drop.
//
// squishShift      number    68           translateY (SVG px) downward at squish.
//                                         Moves the flat glyph toward baseline.
//
// stretchShift     number    -52          translateY (SVG px) upward at stretch.
//                                         Pulls glyph above its resting position.
//
// morphDuration    number    0.22         Duration of each individual tween step (s).
//
// morphDelay       number    0.12         Delay between steps within one cycle (s).
//                                         More delay = letters "hang" at each shape.
//
// staggerEach      number    0.065        Time between consecutive letters animating
//                                         inside one color group. 0 = all at once;
//                                         0.12 = strong cascade wave left→right.
//
// layerDelays      number[]  [0.15,       Per-layer start offset (s). Widening the
//                             0.10,       spread exaggerates the chromatic trail;
//                             0.05,       collapsing to [0,0,0,0] locks all layers
//                             0.00]       in sync.
//
// repeatDelay      number    0.65         Pause at rest before the next bounce (s).
// ──────────────────────────────────────────────────────────────────────────────

// ─── Glyph path data ──────────────────────────────────────────────────────────
// Order: W, E, E, K, E, N, D
// viewBox is 132.29 × 132.29; glyphs sit in the top strip ~y18→y39.

const LETTER_PATHS = [
  // W
  "m 18.33988,18.473947 2.972799,21.264027 h 6.897396 l 0.775947,-10.56614 1.138518,10.56614 h 5.695787 L 39.166408,18.473947 H 33.07115 L 32.697866,29.705355 31.532573,18.473947 h -5.24299 L 25.360746,29.705355 24.624891,18.473947 Z",
  // E1
  "m 39.996414,18.473947 v 21.264027 h 9.993666 v -4.85919 h -4.680578 v -3.170869 h 2.840073 v -5.388356 h -2.840073 v -2.986422 h 4.680578 v -4.85919 z",
  // E2
  "m 50.93967,18.473947 v 21.264027 h 9.993663 v -4.85919 h -4.680577 v -3.170869 h 2.840074 v -5.388356 h -2.840074 v -2.986422 h 4.680577 v -4.85919 z",
  // K
  "m 67.132759,18.473947 h -5.313086 v 21.264027 h 5.313086 V 31.85948 l 3.099302,7.878494 h 5.313088 l -3.66856,-10.197247 3.66856,-11.06678 h -5.313088 l -3.099302,8.748026 z",
  // E3
  "m 76.532304,18.473947 v 21.264027 h 9.993663 v -4.85919 h -4.680575 v -3.170869 h 2.840072 v -5.388356 h -2.840072 v -2.986422 h 4.680575 v -4.85919 z",
  // N
  "m 87.349058,18.473947 v 21.264027 h 5.842254 l -1.058333,-10.452033 3.202647,10.452033 h 6.578104 V 18.473947 h -5.842247 l 1.05833,10.452033 -3.202646,-10.452033 z",
  // D
  "M 114.98702,35.759203 V 22.452718 c 0,-1.212076 0.31626,-2.661297 -1.39152,-3.372733 -1.77103,-0.737785 -5.75585,-0.606038 -7.96962,-0.606038 h -2.78305 v 21.264027 h 2.78305 c 2.21377,0 6.19859,0.105398 7.96962,-0.606038 1.70778,-0.711436 1.39152,-2.160657 1.39152,-3.372733 z m -5.27168,-12.349195 -0.0414,11.365555 c -5.8e-4,0.158097 0.12651,0.632388 -0.94876,0.632388 h -0.0884 V 22.80397 h 0.0884 c 1.07527,0 0.99017,0.737785 0.99017,0.606038 z",
];

const DEFAULT_LAYER_DELAYS = [0.15, 0.1, 0.05, 0];

export default function WeekendMorph({
  bgColor = "#000",
  colorOne = "#F41144",
  colorTwo = "#6E0DFE",
  colorThree = "#F3C607",
  colorFour = "#ffffff",
  stretchScale = 4.5,
  squishScale = 0.35,
  squishShift = 68,
  stretchShift = -52,
  morphDuration = 0.22,
  morphDelay = 0.12,
  staggerEach = 0.065,
  layerDelays = DEFAULT_LAYER_DELAYS,
  repeatDelay = 0.65,
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    // ── Script loader — deduped by data-id ────────────────────────────────
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
        el.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(el);
      });

    let timelines = [];

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !svgRef.current) return;

        // Each layer is a <g> whose children are individual letter <path>s.
        // We animate the paths directly so transform-origin is per-glyph.
        const layerClasses = [
          ".layer-one path",
          ".layer-two path",
          ".layer-three path",
          ".layer-four path",
        ];

        // Shared tween defaults for every step
        const tlDefaults = {
          duration: morphDuration,
          delay: morphDelay,
          stagger: { each: staggerEach },
          // "50% 100%" anchors the transform to each path's bottom-center,
          // so scaleY grows upward and translateY drops downward naturally.
          transformOrigin: "50% 100%",
          ease: "power2.inOut",
        };

        layerClasses.forEach((selector, idx) => {
          const delay = layerDelays[idx] ?? 0;

          const tl = gsap
            .timeline({ delay, defaults: tlDefaults, repeat: -1, repeatDelay })
            // Step 1 — stretch tall upward
            .to(selector, {
              scaleY: stretchScale,
              y: stretchShift,
            })
            // Step 2 — drop and squish flat at baseline
            .to(selector, {
              scaleY: squishScale,
              y: squishShift,
            })
            // Step 3 — rebound stretch (bounce back up)
            .to(selector, {
              scaleY: stretchScale,
              y: stretchShift,
            })
            // Step 4 — settle back to original shape
            .to(selector, {
              scaleY: 1,
              y: 0,
            });

          timelines.push(tl);
        });
      })
      .catch((e) =>
        console.error("[WeekendMorph] GSAP load failed:", e.message),
      );

    // ── Cleanup on unmount / prop change ──────────────────────────────────
    return () => {
      timelines.forEach((tl) => tl.kill());
      timelines = [];
    };
  }, [
    stretchScale,
    squishScale,
    squishShift,
    stretchShift,
    morphDuration,
    morphDelay,
    staggerEach,
    layerDelays,
    repeatDelay,
  ]);

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 132.29167 132.29167"
        className="w-full max-w-lg"
      >
        {/* Layer 1 — bottom-most, colorOne */}
        <g className="layer-one" style={{ fill: colorOne }}>
          {LETTER_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Layer 2 — colorTwo */}
        <g className="layer-two" style={{ fill: colorTwo }}>
          {LETTER_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Layer 3 — colorThree */}
        <g className="layer-three" style={{ fill: colorThree }}>
          {LETTER_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Layer 4 — top-most, colorFour (the readable white layer) */}
        <g className="layer-four" style={{ fill: colorFour }}>
          {LETTER_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
    </div>
  );
}
