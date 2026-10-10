"use client";

import { useEffect, useRef } from "react";

// ─── BearLike ─────────────────────────────────────────────────────────────────
//
// Apple-to-apple Next.js conversion of the "Bear Like" CodePen by jh3y.
// Original: https://codepen.io/jh3y/pen/abMgvQp
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// initialCount     number   86     Starting like count (units digit animates +1)
// ─────────────────────────────────────────────────────────────────────────────
//
// All CSS is injected once via a <style> tag to faithfully reproduce the
// original Stylus rules. Runtime-animated CSS custom properties (--stroke,
// --color, --backdrop-opacity) are tweened by GSAP on :root exactly as the
// original does. No scoping is applied — class names match the source 1-to-1
// so the JS animation logic is a verbatim port.
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap');

*,
*::before,
*::after { box-sizing: border-box; user-select: none; }

:root {
  --pink:        hsl(326, 98%, 82%);
  --pink-bg:     hsl(325, 90%, 98%);
  --pink-light:  hsl(325, 93%, 95%);
  --pink-dark:   hsl(326, 78%, 65%);
  --button-bg:   hsl(0, 0%, 100%);
  --stroke:      hsl(180, 3%, 94%);
  --text:        hsl(180, 6%, 19%);
  --number:      hsl(180, 2%, 67%);
  --color:       hsl(180, 2%, 77%);
  --heart-stroke:hsl(180, 2%, 77%);
  --stroke-active: hsl(204, 6%, 16%);
  --transition:  0.2s;
}

/* ── Bear colours ── */
.stroked        { stroke: var(--stroke-active); }
.bear-one--light { fill: hsl(29, 59%, 40%); }
.bear-one--dark  { fill: hsl(29, 59%, 23%); }
.bear-two--light { fill: hsl(51, 98%, 92%); }
.bear-two--dark  { fill: hsl(45, 99%, 68%); }
.bear-pad--light { fill: hsl(24, 57%, 65%); }
.bear-pad--dark  { fill: hsl(24, 57%, 85%); }

/* ── Heart ── */
.heart {
  overflow: visible !important;
  height: 100%;
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  opacity: calc(1 - var(--hovered, 0));
}
.heart__baseline { stroke: var(--color); stroke-width: 1.25px; }
.heart__body     { fill: var(--pink); }
.heart__shine    { fill: var(--pink-light); }
.heart__shadow   { fill: var(--pink-dark); }

/* ── Button shell ── */
button.transformer {
  --hovered: 0;
  --font-size: 32px;
  --border-width: 4px;
  --border-radius: 10px;
  --padding-v: 26px;
  --padding-h: 36px;
  --padding-t: 10px;
  --padding-b: 4px;
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-size);
  cursor: pointer;
  padding: 0; margin: 0; border: 0;
  appearance: none;
  background: transparent;
  position: relative;
  outline: transparent;
  display: none;
}
button.transformer:hover { --hovered: 1; }

/* ── Container ── */
.transformer__container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* ── Segments ── */
.transformer__segment {
  background: var(--button-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 92px;
}
.transformer__front {
  padding: 0 calc(var(--padding-t) + var(--padding-b)) 0 var(--padding-h);
  border: var(--border-width) solid var(--stroke);
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  border-right: 0;
  z-index: 2;
}
.transformer__middle {
  padding: 0 var(--padding-t);
  border: var(--border-width) solid var(--stroke);
  border-radius: 0;
  border-left: 0;
  border-right: 0;
}
.transformer__back {
  border: var(--border-width) solid var(--stroke);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  padding: 0 var(--padding-h) 0 var(--padding-b);
  border-left: 0;
  z-index: 2;
}

/* ── Feature (icon wrapper that slides) ── */
.transformer__feature {
  height: var(--font-size);
  position: relative;
  width: var(--font-size);
  transition: transform var(--transition);
  transform: translate(-6px, 0) translateX(calc(var(--hovered, 0) * 100%));
}

/* ── Text ── */
.transformer__text {
  display: inline-block;
  color: var(--text);
  font-size: var(--font-size);
  line-height: var(--font-size);
  opacity: calc(1 - var(--hovered, 0));
  transition: transform var(--transition), opacity var(--transition);
  transform: translateY(calc(var(--hovered, 0) * 80%));
}

/* ── Number ── */
.transformer__number {
  font-size: var(--font-size);
  line-height: var(--font-size);
  height: var(--font-size);
  color: var(--color);
  transform: translate(6px, 0);
  display: inline-block;
}
.number__place {
  height: var(--font-size);
  display: inline-block;
  position: relative;
  width: 18px;
}
.number {
  position: absolute;
  left: 0;
  display: inline-block;
}

/* ── Outline bar (top+bottom hairlines across middle) ── */
.transformer__outline {
  position: absolute;
  height: 100%;
  width: 90%;
  left: 50%; top: 0;
  border: var(--border-width) solid var(--stroke);
  border-left: 0; border-right: 0;
  z-index: 10;
  transform: translate3d(-50%, 0, 0);
}

/* ── Paw (shared) ── */
.paw {
  height: calc(var(--font-size) * 2);
  position: absolute;
  top: 0%; left: 50%;
  transform: translate(-50%, 0%);
  width: var(--font-size);
}
.paw--right {
  z-index: 5;
  top: 125%;
  left: 55%;
}

/* ── Bear paw SVG ── */
.bear-paw {
  position: absolute;
  height: 150%;
  opacity: var(--hovered, 0);
  transition: var(--transition);
  overflow: visible !important;
  left: 50%; top: 0;
  transform: translate(-50%, -14%);
}

/* ── Slap ── */
.slap {
  position: absolute;
  height: calc(var(--font-size) * 2);
  width: calc(var(--font-size) * 2);
  top: 50%; left: 38%;
  transform: translate(-50%, -50%);
  z-index: 4;
  display: none;
  overflow: visible !important;
}

/* ── Wiggles ── */
.wiggle {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  height: 100px;
  overflow: visible !important;
  display: none;
  z-index: 10;
}

/* ── Dashed ── */
.dashed { height: 100%; overflow: visible !important; }
.dashed__container {
  display: none;
  top: 50%; left: 50%;
  height: 100px;
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 11;
}

/* ── Burst ── */
.burst {
  display: none;
  height: 30px; width: 30px;
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%)
             rotate(calc(var(--rotate, 0) * 1deg))
             translateY(calc(var(--translate, 0) * -1px));
  z-index: 12;
}
.burst__line {
  position: absolute;
  height: 30px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(calc((-45 + (var(--index) * 30)) * 1deg));
  transform-origin: 50% 100%;
  overflow: visible !important;
  z-index: 12;
}
`;

// ─── Bear paw finger-dot positions ───────────────────────────────────────────
const PAW_FINGER_OFFSETS = [
  { tx: 29.867, ty: -10.156 },
  { tx: 36.816, ty: -14.767 },
  { tx: 45.035, ty: -12.361 },
  { tx: 52.184, ty: -7.15 },
];

// ─── Shared paw body paths ───────────────────────────────────────────────────
const PAW_BODY_DARK =
  "M52.665 167.163c-2.333.002-4.55 1.149-6.074 3.142a4.037 4.037 0 00-.478-.036c-4.67.567-5.742 5.429-5.779 8.991-.048 4.657 1.305 8.702 1.514 13.09.445 9.37-.567 28.14-.567 28.14h29.886s-.2-18.156.567-27.188c.373-4.398 1.814-8.794 1.96-13.097.123-3.618-2.536-8.965-6.13-8.965a4.704 4.704 0 00-1.345.208c-1.388-2.135-3.475-3.375-5.68-3.377a6.14 6.14 0 00-3.108.875c-1.38-1.154-3.05-1.779-4.766-1.783z";
const PAW_BODY_LIGHT =
  "M55.386 167.708c-2.627.541-4.348 4.247-5.596 6.946-1.308 2.829-1.573 6.074-1.746 9.187-.257 4.6.846 9.394 1.054 13.781.427 8.97-.261 21.241-.34 22.735l22.409.133s-.2-18.155.567-27.188c.373-4.398 1.814-8.794 1.96-13.096.123-3.619-2.536-8.966-6.13-8.966a4.704 4.704 0 00-1.345.208c-1.388-2.134-3.475-3.375-5.68-3.377a6.14 6.14 0 00-3.108.875 7.783 7.783 0 00-2.045-1.238z";

// ─── Finger pad group (used 4× on the left paw) ──────────────────────────────
function PawFingerGroup({ tx, ty }) {
  return (
    <g transform={`translate(${tx} ${ty})`}>
      <circle
        className="bear-pad--light stroked"
        cx="16.124"
        cy="188.105"
        r="3.274"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".794"
      />
      <path
        className="bear-pad--dark"
        d="M16.916 184.933a3.274 3.274 0 00-2.479 3.172 3.274 3.274 0 002.482 3.173 3.274 3.274 0 002.479-3.173 3.274 3.274 0 00-2.482-3.172z"
      />
      <circle
        className="stroked"
        cx="16.124"
        cy="188.105"
        r="3.274"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".794"
      />
    </g>
  );
}

// ─── Wiggle SVG (repeated 20×) ───────────────────────────────────────────────
const WIGGLE_PATH =
  "M1.736 27.128S.528 24.968.678 23.821c.17-1.298 2.117-1.999 2.117-3.308 0-1.308-2.117-1.998-2.117-3.307s2.117-1.998 2.117-3.307S.678 11.9.678 10.592c0-1.31 2.117-1.999 2.117-3.308 0-1.309-1.948-2.01-2.117-3.307C.528 2.829 1.736.67 1.736.67";

function WiggleSVG() {
  return (
    <svg
      className="wiggle"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3.456 27.798"
    >
      <path
        className="wiggle__line celebration-line"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeWidth="1.323"
        d={WIGGLE_PATH}
      />
    </svg>
  );
}

// ─── Dashed container (repeated 5×) ──────────────────────────────────────────
function DashedContainer() {
  return (
    <div className="dashed__container">
      <svg className="dashed" viewBox="-0.25 -0.25 0.5 30">
        <defs>
          <clipPath id="lineClip">
            <rect height="31" width="1" x="-0.5" y="-0.5" />
          </clipPath>
        </defs>
        <g className="dashed__wrapper" clipPath="url(#lineClip)">
          <path
            className="dashed__line celebration-line"
            d="M 0 0, L 0 30"
            strokeLinecap="round"
            strokeDasharray="2"
            strokeWidth="0.75"
          />
        </g>
      </svg>
    </div>
  );
}

// ─── Burst (repeated 2×, each has 4 burst__lines) ────────────────────────────
function Burst() {
  return (
    <div className="burst">
      {[0, 1, 2, 3].map((i) => (
        <svg
          key={i}
          className="burst__line"
          viewBox="-0.25, -0.25 0.5 30"
          style={{ "--index": i }}
        >
          <path
            className="celebration-line"
            d="M 0 0, L 0 30"
            strokeLinecap="round"
            strokeDasharray="32"
            strokeWidth="1.5"
          />
        </svg>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function BearLike({ initialCount = 86 }) {
  const btnRef = useRef(null);

  // Inject the stylesheet once
  useEffect(() => {
    if (document.getElementById("bear-like-css")) return;
    const style = document.createElement("style");
    style.id = "bear-like-css";
    style.textContent = STYLES;
    document.head.appendChild(style);
  }, []);

  // Load GSAP and wire up all animation logic (verbatim port of original JS)
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-src="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-src", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !btnRef.current) return;

        // ── Aliases matching original ─────────────────────────────────────
        const { timeline } = gsap;
        const TRANSFORMER = btnRef.current;
        const TTEXT = TRANSFORMER.querySelector(".transformer__middle");
        const duration = 0.2;

        const AUDIO = {
          CHEER: new Audio(
            "https://assets.codepen.io/605876/kids-cheering.mp3",
          ),
          SIGH: new Audio("https://assets.codepen.io/605876/sigh.mp3"),
          CLICK: new Audio("https://assets.codepen.io/605876/click.mp3"),
          CLAP: new Audio("https://assets.codepen.io/605876/clap.mp3"),
        };

        // ── Initial state ─────────────────────────────────────────────────
        gsap.set(".number--next", { yPercent: -100, opacity: 0 });
        gsap.set(".slap__line", {
          transformOrigin: "50% 50%",
          rotate: (i) => -45 + i * 45,
        });
        gsap.set(".slap__line path", {
          transformOrigin: "50% 50%",
          yPercent: -350,
          scaleY: 0.75,
        });
        gsap.set(".heart__segment", { opacity: 0 });

        // ── Left paw + feature swipe ──────────────────────────────────────
        const LEFT_PAW_TL = () =>
          timeline({})
            .set(".transformer__feature", { transition: "none" })
            .to(".transformer__feature", {
              keyframes: [
                { xPercent: -130, ease: "power1.out", duration: 0.125 },
                { xPercent: 20, ease: "power1.in", duration: 0.125 },
                {
                  xPercent: -20,
                  delay: 0.1,
                  ease: "power1.out",
                  duration: 0.15,
                },
              ],
            });

        // ── Right paw swipe ───────────────────────────────────────────────
        const RIGHT_PAW_TL = () =>
          timeline().to(".paw--right", {
            keyframes: [
              {
                ease: "power1.in",
                xPercent: -175,
                yPercent: -125,
                duration: 0.25,
              },
              {
                ease: "power1.out",
                delay: 0.15,
                duration: 0.35,
                xPercent: 0,
                yPercent: 0,
              },
            ],
          });

        // ── Resize / liked state transition ──────────────────────────────
        const RESIZE_TL = () =>
          timeline({})
            .set(".bear-paw", { opacity: 1 })
            .to(
              document.documentElement,
              { "--backdrop-opacity": 1, duration },
              0,
            )
            .to(
              document.documentElement,
              {
                "--stroke": "hsl(326, 56%, 85%)",
                "--color": "hsl(204, 6%, 16%)",
                duration,
              },
              0,
            )
            .to(
              ".transformer__segment",
              { background: "hsl(327, 91%, 96%)", duration },
              0,
            )
            .to(".transformer__heart", { opacity: 1, duration }, 0)
            .to(".paw--left", { opacity: 0, duration }, 0)
            .to(".transformer__feature", { xPercent: -100, duration }, 0)
            .to(".transformer__outline", { scaleX: 0.6, duration }, 0)
            .to(
              ".transformer__front",
              { x: TTEXT.offsetWidth / 2, duration },
              0,
            )
            .to(
              ".transformer__back",
              { x: -(TTEXT.offsetWidth / 2), duration },
              0,
            )
            .to(
              ".number.number--current.number--single",
              { yPercent: 100, opacity: 0, duration },
              0,
            )
            .to(
              ".number.number--next.number--single",
              { yPercent: 0, opacity: 1, duration },
              0,
            )
            .to(".heart__segment", { opacity: 1, duration }, 0);

        // ── Slap effect ───────────────────────────────────────────────────
        const SLAP_TL = () =>
          gsap
            .timeline({
              onStart: () => {
                AUDIO.CLAP.play();
                gsap.set(".slap", { display: "block" });
              },
              onComplete: () => {
                gsap.set(".slap", { display: "none" });
                gsap.set(".slap__circle", { clearProps: "all" });
              },
            })
            .set(".slap__circle", {
              stroke: `hsl(${Math.random() * 359}, 85%, 60%)`,
            })
            .to(".slap__circle", {
              strokeWidth: 0,
              scale: 2.5,
              duration: 0.15,
              transformOrigin: "50% 50%",
            })
            .fromTo(
              ".slap__line path",
              { strokeDashoffset: -11 },
              { yPercent: -400, duration: 0.15, strokeDashoffset: 11 },
              0,
            );

        // ── Celebration burst ─────────────────────────────────────────────
        const CELEBRATE_TL = () =>
          gsap
            .timeline({
              repeatRefresh: true,
              onStart: () => {
                gsap.delayedCall(0.25, () => AUDIO.CHEER.play());
                gsap.set([".wiggle", ".dashed__container", ".burst"], {
                  display: "block",
                });
              },
              onComplete: () => {
                gsap.set([".wiggle", ".dashed__container", ".burst"], {
                  display: "none",
                });
              },
            })
            .set(".celebration-line", {
              stroke: () => `hsl(${Math.random() * 359}, 100%, 70%)`,
            })
            .set(".dashed__line", { yPercent: -120 })
            .set(".dashed", { yPercent: 0 })
            .set(".burst", {
              "--rotate": () => Math.random() * 360,
              "--translate": () => Math.random() * 100 + 180,
            })
            .set([".wiggle", ".dashed__container"], {
              rotate: () => Math.random() * 360,
            })
            .set([".wiggle__line", ".dashed"], {
              yPercent: () => Math.random() * 150 + 180,
              scaleY: () => Math.random() + 0.5,
            })
            .fromTo(
              ".dashed__line",
              { yPercent: -120 },
              { yPercent: 120, duration: 0.5 },
              0,
            )
            .to(".dashed", { yPercent: "random(20, 100)" })
            .fromTo(
              [".wiggle__line"],
              { strokeDashoffset: -32 },
              {
                delay: () => Math.random(),
                yPercent: "+=50",
                duration: 0.5,
                strokeDashoffset: 32,
              },
              0,
            )
            .fromTo(
              ".burst__line path",
              { strokeDashoffset: -32 },
              {
                delay: () => Math.random() * 0.5,
                yPercent: "-=50",
                strokeDashoffset: 32,
              },
              0,
            );

        // ── Master "press" timeline ───────────────────────────────────────
        const TRANSFORMER_TL = () =>
          timeline({
            onComplete: () => TRANSFORMER.removeAttribute("disabled"),
          })
            .set(".transformer__feature", { "--hovered": 1 })
            .set(".bear-paw", { opacity: 1 })
            .set(".transformer__text", { yPercent: 80, opacity: 0 })
            .add(LEFT_PAW_TL(), 0.25)
            .add(RIGHT_PAW_TL(), "<")
            .add(SLAP_TL(), ">-0.5")
            .add(CELEBRATE_TL(), "<")
            .add(RESIZE_TL(), "<+0.5")
            .to(
              ".transformer__heart",
              { scale: 1.25, repeat: 1, yoyo: true, ease: "elastic.in" },
              ">-0.2",
            );

        // ── Reset timeline (un-like) ──────────────────────────────────────
        const RESET_TL = timeline({
          paused: true,
          onStart: () => AUDIO.SIGH.play(),
          onComplete: () => {
            gsap.set([".transformer__heart", ".paw--left", ".bear-paw"], {
              clearProps: "all",
            });
          },
        })
          .set([".transformer__feature", ".transformer__text"], {
            clearProps: "all",
          })
          .to(".transformer__front", { x: 0, duration })
          .to(".heart__segment", { opacity: 0, duration }, 0)
          .to(".transformer__outline", { scaleX: 1, duration }, 0)
          .to(
            ".transformer__segment",
            { background: "hsl(0, 0%, 100%)", duration },
            0,
          )
          .to(".transformer__back", { x: 0, duration }, 0)
          .to(
            document.documentElement,
            {
              "--backdrop-opacity": 0,
              "--stroke": "hsl(180, 3%, 94%)",
              "--color": "hsl(180, 2%, 77%)",
              duration,
            },
            0,
          )
          .to(
            ".number.number--current.number--single",
            { yPercent: 0, opacity: 1, duration },
            0,
          )
          .to(
            ".number.number--next.number--single",
            { yPercent: -100, opacity: 0, duration },
            0,
          )
          .to(".paw--left", { opacity: 1, duration }, 0)
          .to(".transformer__heart", { opacity: 0, duration }, 0);

        // ── Pointer handler ───────────────────────────────────────────────
        const handlePointerDown = ({ x, y }) => {
          if (TRANSFORMER.hasAttribute("disabled")) return;
          if (TRANSFORMER.getAttribute("aria-pressed") === "true") {
            TRANSFORMER.setAttribute("aria-pressed", "false");
            RESET_TL.restart();
          } else {
            TRANSFORMER.setAttribute("aria-pressed", "true");
            TRANSFORMER.setAttribute("disabled", "true");

            const SVG = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "svg",
            );
            const CIRCLE = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle",
            );
            const BOUNDS = TRANSFORMER.getBoundingClientRect();

            gsap.set(SVG, {
              height: 50,
              width: 50,
              left: x - BOUNDS.left - 25,
              top: y - BOUNDS.top - 25,
              overflow: "visible !important",
              zIndex: 12,
              transformOrigin: "50% 50%",
              position: "absolute",
              attr: { viewBox: "0 0 100 100", fill: "none" },
            });
            SVG.appendChild(CIRCLE);
            TRANSFORMER.appendChild(SVG);

            gsap.set(CIRCLE, {
              attr: { r: 30, cx: 50, cy: 50 },
              stroke: `hsl(${Math.random() * 359}, 80%, 50%)`,
              strokeWidth: 20,
            });

            gsap
              .timeline({
                onStart: () => TRANSFORMER_TL(),
                onComplete: () => SVG.remove(),
              })
              .fromTo(
                CIRCLE,
                { scale: 0, transformOrigin: "50% 50%" },
                { scale: 1.25, duration: 0.2 },
              )
              .to(CIRCLE, { opacity: 0, duration: 0.1 }, ">-0.1");
          }
        };

        // ── Mouse parallax (body background) ─────────────────────────────
        const LIMIT = 5;
        const handleMouseMove = ({ x, y }) => {
          const posX = gsap.utils.mapRange(
            0,
            window.innerWidth,
            -LIMIT,
            LIMIT,
            x,
          );
          const posY = gsap.utils.mapRange(
            0,
            window.innerHeight,
            -LIMIT,
            LIMIT,
            y,
          );
          gsap.set(document.documentElement, {
            "--x": posX,
            "--mx": x,
            "--y": posY,
            "--my": y,
          });
        };

        TRANSFORMER.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("pointermove", handleMouseMove);

        // ── Reveal button ─────────────────────────────────────────────────
        gsap.set(".transformer", { display: "block" });

        return () => {
          TRANSFORMER.removeEventListener("pointerdown", handlePointerDown);
          document.removeEventListener("pointermove", handleMouseMove);
        };
      })
      .catch((e) => console.error("[BearLike] GSAP load error:", e.message));
  }, []);

  // ── Derive digit characters from initialCount ─────────────────────────────
  const tens = Math.floor((initialCount % 100) / 10);
  const units = initialCount % 10;
  const unitsNext = (units + 1) % 10;

  return (
    <button ref={btnRef} className="transformer overflow-hidden" aria-pressed="false">
      {/* ── transformer__container ──────────────────────────────────────── */}
      <span className="transformer__container">
        {/* ── Front segment: feature (heart + left paw) ─────────────────── */}
        <span className="transformer__front transformer__segment">
          <span className="transformer__feature">
            {/* Heart icon */}
            <svg
              className="transformer__heart heart"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 12.115 11.096"
            >
              <defs>
                <clipPath id="heart-outline">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth=".822"
                    d="M1.325 1.386a3.307 3.307 0 00.055 4.621l4.677 4.678 4.678-4.678A3.308 3.308 0 009.252.474c-1.141-.306-2.36.55-3.195 1.385C5.222 1.023 4.004.168 2.862.474a3.307 3.307 0 00-1.537.912z"
                  />
                </clipPath>
                <clipPath id="heart-inner">
                  <path
                    clipPath="url(#heart-outline)"
                    d="M-.2.044c-.383.4-.191 2.762-.335 3.297a3.307 3.307 0 00.856 3.195L5 11.214l4.677-4.678a3.308 3.308 0 00-1.482-5.533C7.052.697 4.176-1.237 3.34-.401c-.836-.835 1.141-.305 0 0-.586.158-3.123.005-3.542.445z"
                  />
                </clipPath>
              </defs>
              <path
                className="heart__segment heart__shine"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth=".822"
                d="M1.325 1.386a3.307 3.307 0 00.055 4.621l4.677 4.678 4.678-4.678A3.308 3.308 0 009.252.474c-1.141-.306-2.36.55-3.195 1.385C5.222 1.023 4.004.168 2.862.474a3.307 3.307 0 00-1.537.912z"
              />
              <path
                className="heart__segment heart__shadow"
                clipPath="url(#heart-outline)"
                d="M-.2.044c-.383.4-.191 2.762-.335 3.297a3.307 3.307 0 00.856 3.195L5 11.214l4.677-4.678a3.308 3.308 0 00-1.482-5.533C7.052.697 4.176-1.237 3.34-.401c-.836-.835 1.141-.305 0 0-.586.158-3.123.005-3.542.445z"
              />
              <path
                className="heart__segment heart__body"
                clipPath="url(#heart-inner)"
                d="M4.611.073a3.307 3.307 0 00-1.418 4.4l2.947 5.921 5.922-2.947a3.308 3.308 0 00.354-5.718c-.985-.653-1.116-2.76-2.174-2.233-.527-1.058-2.704.274-3.884.201a3.308 3.308 0 00-1.747.376z"
              />
              <path
                className="heart__baseline"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth=".822"
                d="M1.325 1.386a3.307 3.307 0 00.055 4.621l4.677 4.678 4.678-4.678A3.308 3.308 0 009.252.474c-1.141-.306-2.36.55-3.195 1.385C5.222 1.023 4.004.168 2.862.474a3.307 3.307 0 00-1.537.912z"
              />
            </svg>

            {/* Left paw — lives inside transformer__feature */}
            <div className="paw paw--left">
              <svg
                className="bear-paw"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 34.611 55.365"
              >
                <g transform="translate(-39.71 -165.748)">
                  <circle cx="43.184" cy="170.945" r="1.323" />
                  <circle cx="51.121" cy="167.071" r="1.323" />
                  <circle cx="61.421" cy="167.732" r="1.323" />
                  <circle cx="69.075" cy="171.417" r="1.323" />
                  <path
                    className="stroked bear-one bear-one--dark"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.246"
                    d={PAW_BODY_DARK}
                  />
                  <path
                    className="bear-one bear-one--light"
                    d={PAW_BODY_LIGHT}
                  />
                  <path
                    className="stroked"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.587"
                    d={PAW_BODY_DARK}
                  />
                  <ellipse
                    className="bear-pad bear-pad--light stroked"
                    cx="50.143"
                    cy="188.41"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth=".794"
                    rx="8.724"
                    ry="6.159"
                    transform="matrix(1 -.00427 .03389 .99943 0 0)"
                  />
                  <path
                    className="bear-pad bear-pad--dark"
                    d="M58.589 182.14a8.728 6.154 1.436 00-8.247 6.185 8.728 6.154 1.436 006.665 5.911 8.728 6.154 1.436 008.245-6.186 8.728 6.154 1.436 00-6.663-5.91z"
                  />
                  <ellipse
                    className="stroked"
                    cx="50.143"
                    cy="188.41"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth=".794"
                    rx="8.724"
                    ry="6.159"
                    transform="matrix(1 -.00427 .03389 .99943 0 0)"
                  />
                  {PAW_FINGER_OFFSETS.map(({ tx, ty }, i) => (
                    <PawFingerGroup key={i} tx={tx} ty={ty} />
                  ))}
                </g>
              </svg>
            </div>
          </span>
        </span>

        {/* ── Middle segment: "Like" text ────────────────────────────────── */}
        <span className="transformer__middle transformer__segment">
          <span className="transformer__text">Like</span>
        </span>

        {/* ── Back segment: count number ─────────────────────────────────── */}
        <span className="transformer__back transformer__segment">
          <span className="transformer__number">
            {/* Tens place — stays the same on +1 */}
            <span className="number__place">
              <span className="number number--ten number--current">{tens}</span>
              <span className="number number--ten number--next">{tens}</span>
            </span>
            {/* Units place — animates from units → unitsNext */}
            <span className="number__place">
              <span className="number number--current number--single">
                {units}
              </span>
              <span className="number number--next number--single">
                {unitsNext}
              </span>
            </span>
          </span>
        </span>
      </span>
      {/* ── /transformer__container ─────────────────────────────────────── */}

      {/* ── Right paw — direct child of button, outside container ─────── */}
      <div className="paw paw--right">
        <svg
          className="bear-paw"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 34.611 55.365"
        >
          <g transform="translate(-39.71 -165.748)">
            <circle cx="43.184" cy="170.945" r="1.323" />
            <circle cx="51.121" cy="167.071" r="1.323" />
            <circle cx="61.421" cy="167.732" r="1.323" />
            <circle cx="69.075" cy="171.417" r="1.323" />
            <path
              className="stroked bear-two bear-two--dark"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.246"
              d={PAW_BODY_DARK}
            />
            <path className="bear-two bear-two--light" d={PAW_BODY_LIGHT} />
            <path
              className="stroked"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.587"
              d={PAW_BODY_DARK}
            />
          </g>
        </svg>
      </div>

      {/* ── Slap effect SVG ───────────────────────────────────────────────── */}
      <svg
        className="slap"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50.271 50.271"
      >
        <g
          fill="none"
          strokeLinecap="round"
          transform="translate(-53.239 -117.668)"
        >
          <circle
            className="slap__circle"
            cx="78.374"
            cy="142.804"
            r="12.172"
            stroke="#f55"
            strokeLinejoin="round"
            strokeWidth="25.928"
          />
          <g className="slap__line">
            <path
              stroke="#000"
              strokeWidth="2.117"
              strokeDasharray="11"
              d="M78.374 137.592v10.423"
            />
          </g>
          <g className="slap__line">
            <path
              stroke="#000"
              strokeWidth="2.117"
              strokeDasharray="11"
              d="M78.374 137.592v10.423"
            />
          </g>
          <g className="slap__line">
            <path
              stroke="#000"
              strokeWidth="2.117"
              strokeDasharray="11"
              d="M78.374 137.592v10.423"
            />
          </g>
        </g>
      </svg>

      {/* ── Outline top/bottom bar ────────────────────────────────────────── */}
      <span className="transformer__outline transformer__outline--top" />

      {/* ── Celebration: 20 wiggles ───────────────────────────────────────── */}
      {Array.from({ length: 20 }, (_, i) => (
        <WiggleSVG key={i} />
      ))}

      {/* ── Celebration: 5 dashed lines ───────────────────────────────────── */}
      {Array.from({ length: 5 }, (_, i) => (
        <DashedContainer key={i} />
      ))}

      {/* ── Celebration: 2 bursts ─────────────────────────────────────────── */}
      <Burst />
      <Burst />
    </button>
  );
}
