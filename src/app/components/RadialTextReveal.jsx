"use client";

import { useEffect, useRef, useState } from "react";

// ─── TextReveal ───────────────────────────────────────────────────────────────
//
// A two-layer animated text reveal inspired by jh3yy's "Craft of UI" about page.
// The text appears to "materialize" upward through a radial-gradient wipe, while
// a duplicate hidden layer shows a glowing color-bleed effect during the transition.
// After the text settles, an SVG signature draws itself stroke-by-stroke.
//
// ─── Props ────────────────────────────────────────────────────────────────────
//
// content          string | ReactNode  "Your text here"
//                  The paragraph content rendered in all three layers. Accepts
//                  raw strings or JSX (e.g. with <a> links inside).
//
// duration         number              1.8
//                  How long the reveal animation runs in seconds. Maps to
//                  --duration CSS custom property.
//
// delay            number              0.5
//                  Seconds before the reveal starts after mount. Maps to
//                  --delay CSS custom property.
//
// color            string              "hsla(280, 80%, 50%, 0.5)"
//                  The accent bleed color visible on the hidden duplicate layer
//                  during transition. Any valid CSS color works — try a vivid
//                  hsl value with ~0.5 opacity for the best effect.
//
// theme            "light" | "dark" | "system"   "system"
//                  Controls color-scheme on the root wrapper. "system" respects
//                  the OS preference.
//
// showSignature    bool                true
//                  Whether to render the hand-drawn SVG signature after the
//                  text finishes revealing.
//
// signatureColor   string              "currentColor"
//                  Stroke color for the SVG signature. Defaults to the inherited
//                  text color so it adapts to light/dark automatically.
//
// fontFamily       string              "'Inter', sans-serif"
//                  Font family applied to the text block. Must be loaded
//                  externally (e.g. via a <link> in your layout).
//
// fontSize         string              "1.25rem"
//                  Base font size for the reveal text.
//
// textColor        string              undefined
//                  Optional explicit text color override. Defaults to the
//                  browser's canvasText (auto light/dark aware).
//
// width            string              "50ch"
//                  Max content width for the text block.
//
// className        string              ""
//                  Extra Tailwind / CSS classes on the outermost wrapper.
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── SVG Signature paths ─────────────────────────────────────────────────────
// Each path has:
//   d            — the SVG path data
//   speed        — fraction of total draw time this stroke takes
//   delay        — fraction offset into the total draw sequence
//   type         — "body" | "ear" | "eye" | "nose" (controls fill animation)
const SIG_PATHS = [
  {
    d: "M40.3725 26.8984C58.6558 41.1564 141.659 43.1867 128.248 5.48254C127.911 4.53766 127.085 2.2403 125.938 2.0095C124.714 1.76297 121.929 6.39448 121.627 6.82375C100.965 36.1863 95.2641 73.5992 74.5923 102.644C63.7045 117.942 14.7891 145.678 5.55986 113.481C-17.5939 32.705 78.7483 76.0672 105.741 67.4678C119.757 63.0021 125.297 50.6825 132.831 39.1622C135.218 35.5126 137.628 24.6153 140.043 28.2467C144.771 35.3581 119.642 69.8761 115.559 78.4692C110.959 88.1482 129.228 46.7461 136.796 54.3333C146.229 63.7897 128.236 82.7359 153.367 61.6804C157.634 58.1059 166.582 46.4029 161.033 46.8455C153.977 47.4085 141.565 67.0198 151.685 70.0327C161.531 72.9635 176.039 38.7196 174.012 48.7901C173.009 53.769 168.343 67.3695 175.978 68.9069C186.537 71.0328 191.574 35.8659 197.537 44.8359C240.356 109.24 81.7126 283.324 50.2184 167.261C25.2159 75.1229 240.563 89.2082 268.88 137.08",
    speed: 0.831875,
    delay: 0,
    type: "body",
  },
  {
    d: "M187.183 101.246C182.107 82.5407 155.739 77.9455 151.5 99",
    speed: 0.031875,
    delay: 0.831875,
    type: "ear",
  },
  {
    d: "M117.998 100.704C117.998 91.1516 103.912 87.3662 96.5585 89.3717C84.7816 92.5836 80.6315 99.053 80.6315 110.505",
    speed: 0.035625,
    delay: 0.86375,
    type: "ear",
  },
  {
    d: "M170.025 108.347C168.627 105.551 162.781 110.631 165.494 114.577C168.207 118.523 173.936 114.091 171.643 109.965C171.035 108.871 168.547 107.832 167.355 108.428",
    speed: 0.0175,
    delay: 0.899375,
    type: "eye",
  },
  {
    d: "M102.952 112.797C97.2672 112.797 96.7371 120.527 102.224 119.917C108.363 119.235 105.409 110.012 100.363 113.04",
    speed: 0.01625,
    delay: 0.916875,
    type: "eye",
  },
  {
    d: "M144.745 123.82C146.652 122.562 141.479 121.621 140.561 121.402C136.485 120.429 124.736 118.793 124.42 125.721C123.695 141.628 160.767 131.457 140.492 121.735",
    speed: 0.04,
    delay: 0.933125,
    type: "nose",
  },
];

// ─── Signature ───────────────────────────────────────────────────────────────
// Renders the bear-face SVG with CSS-driven stroke-dashoffset animation.
// base-delay = duration + delay (seconds), i.e. it starts after text settles.
function Signature({ duration, delay, color, signatureColor }) {
  // Total time the text animation runs before signature starts
  const baseDelay = duration + delay;

  return (
    <svg
      viewBox="0 0 271 209"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // position: absolute below the <hr>, rotated 10deg to look hand-drawn
      className="absolute w-40 right-0 pointer-events-none"
      style={{
        top: "calc(100% + 1rem)",
        rotate: "10deg",
        color: signatureColor,
      }}
    >
      <style>{`
        @keyframes sig-draw { to { stroke-dashoffset: 0; } }
        @keyframes sig-fill { to { fill: currentColor; } }
        @keyframes sig-blink {
          0%, 46%, 48%, 50%, 100% { transform: scaleY(1); }
          47%, 49% { transform: scaleY(0.1); }
        }
      `}</style>

      {SIG_PATHS.map((p, i) => {
        // Each path treats pathLength="1" so dasharray/offset are in [0,1] space
        const strokeAnim = `sig-draw ${p.speed}s ${baseDelay + p.delay}s ease-in forwards`;

        // Eyes and nose also get fill + blink
        const isEye = p.type === "eye";
        const isFillable = p.type === "eye" || p.type === "nose";
        const nattyDelay = baseDelay + 0.973125; // total sequence end

        return (
          <path
            key={i}
            d={p.d}
            stroke={
              signatureColor === "currentColor"
                ? "currentColor"
                : signatureColor
            }
            strokeWidth="4"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            style={{
              strokeDasharray: "1.025",
              strokeDashoffset: "1.025",
              fill: isFillable ? "transparent" : "none",
              // compose multiple animations for eye/nose
              animation: isFillable
                ? `${strokeAnim}, sig-fill 0.5s ${nattyDelay}s forwards${isEye ? `, sig-blink 6s ${nattyDelay}s infinite` : ""}`
                : strokeAnim,
              // blink needs transform-origin at center of the eye path bbox
              ...(isEye && {
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
              }),
            }}
          />
        );
      })}
    </svg>
  );
}

// ─── TextReveal ───────────────────────────────────────────────────────────────
export default function RadialTextReveal({
  content = (
    <>
      Design Engineer, currently with <strong>Vercel</strong>. Formerly CSS + UI
      DevRel at Google.
      <br />
      <br />
      Showing you how to craft high-impact web experiences.
    </>
  ),
  duration = 1.8,
  delay = 0.5,
  color = "hsla(280, 80%, 50%, 0.5)",
  theme = "system",
  showSignature = true,
  signatureColor = "currentColor",
  fontFamily = "'Inter', sans-serif",
  fontSize = "1.25rem",
  textColor,
  width = "50ch",
  className = "",
}) {
  // key lets us replay the animation by bumping a counter → remount children
  const [replayKey, setReplayKey] = useState(0);
  const containerRef = useRef(null);

  // ── CSS custom properties injected at the wrapper level ──────────────────
  // --duration  controls reveal keyframe timing
  // --delay     controls when the reveal starts
  // --color     the accent bleed on the hidden layer
  const cssVars = {
    "--duration": duration,
    "--delay": delay,
    "--color": color,
    // mask radial gradient positions (fixed per the original tuned values)
    "--start-mask": -70,
    "--end-mask": 0,
    "--start-bg": 132,
    "--end-bg": 16,
  };

  // ── color-scheme wrapper class ───────────────────────────────────────────
  const schemeClass =
    theme === "light"
      ? "[color-scheme:light]"
      : theme === "dark"
        ? "[color-scheme:dark]"
        : "[color-scheme:light_dark]";

  return (
    <div
      ref={containerRef}
      className={`grid place-items-center min-h-screen bg-[canvas] ${schemeClass} ${className}`}
      style={{
        ...cssVars,
        fontFamily,
        fontSize,
        ...(textColor && { color: textColor }),
      }}
    >
      {/* ── @property + keyframe definitions ── */}
      {/* Inline <style> is necessary here because:
            1. @property requires a real stylesheet (can't be inline style)
            2. The animation keyframes animate a custom property (--progress)
               which Tailwind cannot express */}
      <style>{`
        @property --progress {
          initial-value: 0;
          syntax: '<number>';
          inherits: true;
        }

        @keyframes tr-reveal {
          0%   { --progress: 0; animation-timing-function: ease-in; }
          40%  { --progress: 1; animation-timing-function: ease-out; }
          90%, 100% { --progress: 2; }
        }
        @keyframes tr-compress {
          40%  { transform: translateY(var(--movement, 0)); }
          50%  { line-height: var(--compression, 1.5); }
          75%  { transform: translateY(0); }
          100% { line-height: 1.5; }
        }
        @keyframes tr-fade {
          0% { opacity: 0; }
        }

        /* ── Hide layer: the glowing color-bleed duplicate ── */
        .tr-hide {
          animation:
            tr-reveal   calc(var(--duration) * 1s) calc(var(--delay) * 1s) ease-in both,
            tr-compress calc(var(--duration) * 0.5s)
              calc((var(--delay) * 1s) + (var(--duration) * 0.44s)) ease-in-out both;
        }
        .tr-hide .tr-content {
          filter: blur(4px);
          background:
            radial-gradient(
              180cqmax 180cqmax at 50%
                calc(
                  (var(--start-bg) * 1cqmax) -
                  (clamp(0, var(--progress), 1) *
                    ((var(--start-bg) - var(--end-bg)) * 1cqmax))
                ),
              var(--color) 25%,
              canvasText,
              #0000
            )
            50% 50% / 100% 100% no-repeat;
          color: #0000;
          background-clip: text;
          mask-image:
            radial-gradient(
              180cqmax 180cqmax at 50%
                calc(
                  (var(--start-mask) * 1cqmax) +
                  ((var(--progress) - 1) * (var(--start-mask) * -1cqmax))
                ),
              #fff 43%, #0000 45%
            ),
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }

        /* ── Reveal layer: the "real" text materialising upward ── */
        .tr-reveal-layer {
          --movement: 0.15lh;
          --compression: 1.55;
          line-height: 1.46;
          animation:
            tr-reveal   calc(var(--duration) * 1s) calc(var(--delay) * 1s) ease-in both,
            tr-compress calc(var(--duration) * 0.5s)
              calc((var(--delay) * 1s) + (var(--duration) * 0.44s)) ease-in-out both;
        }
        .tr-reveal-layer .tr-content {
          mask-image:
            radial-gradient(
              180cqmax 180cqmax at 50%
                calc(
                  (var(--start-mask) * 1cqmax) +
                  ((var(--progress) - 1) * (var(--start-mask) * -1cqmax))
                ),
              #fff 38%, #0000 40%
            );
          mask-composite: exclude;
        }

        /* shared container query context */
        .tr-dupe { container-type: inline-size; }
      `}</style>

      <main
        key={replayKey}
        className="relative"
        style={{ fontFamily, fontSize, lineHeight: 1.5 }}
      >
        {/* ── Text container: three stacked layers ───────────────────────── */}
        <div className="relative">
          {/* Layer 1 — spacer / invisible "ghost" that holds layout height */}
          {/* aria-hidden so screen readers only read the real text once     */}
          <div
            aria-hidden="true"
            style={{
              width,
              maxWidth: "100%",
              padding: "1rem",
              fontWeight: 300,
              opacity: 0,
            }}
          >
            <div>{content}</div>
          </div>

          {/* Layer 2 — the color-bleed / hide duplicate                    */}
          {/* Absolutely positioned over the ghost; animates out as Layer 3 */}
          {/* arrives. Carries the glowing radial-gradient mask trick.       */}
          <div
            aria-hidden="true"
            className="tr-dupe tr-hide absolute bottom-0 left-0 right-0 min-h-full grid place-items-end"
            style={{ width, maxWidth: "100%", fontWeight: 300 }}
          >
            <div className="tr-content" style={{ padding: "1rem" }}>
              {content}
            </div>
          </div>

          {/* Layer 3 — the "reveal" layer; text wipes in from below        */}
          {/* Uses a different mask radial-gradient (tighter cutoff at 38%) */}
          <div
            className="tr-dupe tr-reveal-layer absolute bottom-0 left-0 right-0 min-h-full grid place-items-start"
            style={{ width, maxWidth: "100%", fontWeight: 300 }}
          >
            {/* position:absolute so it overlays exactly on the ghost       */}
            <div
              className="tr-content absolute top-0 left-0 right-0"
              style={{ padding: "1rem" }}
            >
              {content}
            </div>
          </div>
        </div>

        {/* ── Divider — fades in after text animation finishes ───────────── */}
        <hr
          className="opacity-20 inline-block"
          style={{
            width: "calc(100% - 1rem)",
            marginBlock: "2rem",
            // fade starts right after the reveal completes
            animation: `tr-fade 1s calc((var(--duration) + var(--delay)) * 1.1s) both`,
          }}
        />

        {/* ── SVG Signature ───────────────────────────────────────────────── */}
        {showSignature && (
          <Signature
            duration={duration}
            delay={delay}
            color={color}
            signatureColor={signatureColor}
          />
        )}
      </main>

      {/* ── Optional debug replay button (dev helper) ────────────────────── */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={() => setReplayKey((k) => k + 1)}
          className="fixed bottom-4 right-4 px-3 py-1 text-xs rounded bg-black/20 hover:bg-black/40 text-white"
        >
          replay
        </button>
      )}
    </div>
  );
}
