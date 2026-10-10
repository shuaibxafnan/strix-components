"use client";

import { useEffect, useRef, useState } from "react";

// ─── TipCoin ──────────────────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// Appearance:
//   buttonBg        string   "#1871f4"           Button background color
//   buttonText      string   "Leave tip"         Button label text
//   coinFace        string   "#ffdc02"           Coin face fill color
//   coinSide        string   "#f4ae00"           Coin edge / side color
//   coinDetail      string   "hsl(43 97% 46%)"   Icon color on coin face
//   coinDepth       number   2                   Half-thickness of coin (px)
//   coinThickness   number   4                   Scene depth units for hole
//   rotationUnits   number   15                  Max tilt degrees on press-hold
//   coinIconPath    string   (Webflow SVG path)  SVG <path d="…"> for coin icon
// Animation:
//   muted           bool     true                Mute coin flip sound
//   timeScale       number   1.1                 Global animation speed multiplier
//   distanceLower   number   100                 Min launch distance (px)
//   distanceUpper   number   350                 Max launch distance (px)
//   bounceLower     number   2                   Min button bounce (%)
//   bounceUpper     number   12                  Max button bounce (%)
//   velocityLower   number   300                 Min launch velocity
//   velocityUpper   number   700                 Max launch velocity
//   rotationLower   number   0                   Rotation threshold lower bound
//   rotationUpper   number   15                  Rotation threshold upper bound
//   flipSpeedLower  number   0.25                Min flip duration (s)
//   flipSpeedUpper  number   0.6                 Max flip duration (s)
//   spinsLower      number   1                   Min coin spin count
//   spinsUpper      number   6                   Max coin spin count
//   rotateLower     number   0                   Min landing off-rotation (deg)
//   rotateUpper     number   90                  Max landing off-rotation (deg)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ICON_PATH =
  "m24 4.515-7.658 14.97H9.149l3.205-6.204h-.144C9.566 16.713 5.621 18.973 0 19.485v-6.118s3.596-.213 5.71-2.435H0V4.515h6.417v5.278l.144-.001 2.622-5.277h4.854v5.244h.144l2.72-5.244H24Z";

const ARROW_PATH =
  "M74.568 0.553803C74.0753 0.881909 73.6295 1.4678 73.3713 2.12401C73.1367 2.70991 72.3858 4.67856 71.6584 6.50658C70.9544 8.35803 69.4526 11.8031 68.3498 14.1936C66.1441 19.0214 65.839 20.2167 66.543 21.576C67.4581 23.3337 69.4527 23.9196 71.3064 22.9821C72.4797 22.3728 74.8965 19.5839 76.9615 16.4435C78.8387 13.5843 78.8387 13.6077 78.1113 18.3418C77.3369 23.4275 76.4687 26.2866 74.5915 30.0364C73.254 32.7316 71.8461 34.6299 69.218 37.3485C65.9563 40.6999 62.2254 42.9732 57.4385 44.4965C53.8718 45.6449 52.3935 45.8324 47.2546 45.8324C43.3594 45.8324 42.1158 45.7386 39.9805 45.2933C32.2604 43.7466 25.3382 40.9577 19.4015 36.9735C15.0839 34.0909 12.5028 31.7004 9.80427 27.9975C6.80073 23.9196 4.36038 17.2403 3.72682 11.475C3.37485 8.1471 3.1402 7.32683 2.43624 7.13934C0.770217 6.71749 0.183578 7.77211 0.0193217 11.5219C-0.26226 18.5996 2.55356 27.1304 7.17619 33.1066C13.8403 41.7545 25.432 48.4103 38.901 51.2696C41.6465 51.8555 42.2566 51.9023 47.4893 51.9023C52.3935 51.9023 53.426 51.832 55.5144 51.3867C62.2723 49.9337 68.5375 46.6292 72.949 42.1998C76.0464 39.1296 78.1113 36.2939 79.8946 32.7081C82.1942 28.0912 83.5317 23.3103 84.2591 17.17C84.3999 15.8576 84.6111 14.7795 84.7284 14.7795C84.8223 14.7795 85.4559 15.1311 86.1364 15.5763C88.037 16.7716 90.3835 17.8965 93.5748 19.0918C96.813 20.3339 97.3996 20.287 96.4141 18.9512C94.9123 16.9122 90.055 11.5219 87.1219 8.63926C84.0949 5.66288 83.8368 5.33477 83.5552 4.1864C83.3909 3.48332 83.0155 2.68649 82.6401 2.31151C82.0065 1.6553 80.4109 1.04595 79.9885 1.30375C79.8712 1.37406 79.2845 1.11626 78.6744 0.717845C77.2431 -0.172727 75.7413 -0.243024 74.568 0.553803Z";

// Injected once — handles pseudo-elements, :active state, hover, and preserve-3d
// that cannot be expressed in Tailwind.
const INJECTED_CSS = `
  .tc-scene,
  .tc-scene *,
  .tc-scene *::before,
  .tc-scene *::after {
    transform-style: preserve-3d;
  }

  /* Tilt button on press-hold */
  .tc-button[data-tipping="false"]:active {
    transform: rotate(calc(var(--ru, 15) * -1deg)) !important;
    box-shadow:
      -0.5px 0.7px 1px hsl(0 0% 0% / 0.14),
      -1.8px 2.3px 3.3px -0.8px hsl(0 0% 0% / 0.14),
      -4.6px 6px 8.5px -1.7px hsl(0 0% 0% / 0.14),
      -11.4px 14.6px 20.8px -2.5px hsl(0 0% 0% / 0.14) !important;
  }

  /* Darken bg on hover/focus */
  .tc-button:is(:focus-visible, :hover) {
    background: color-mix(in oklch, var(--btn-bg), #000 5%) !important;
  }

  /* Spin purse on hover */
  .tc-button:is(:focus-visible, :hover) .tc-purse {
    rotate: y 360deg;
    transition: rotate 0.26s 0.12s ease-out;
  }

  /* Coin hole – dark oval below the coin slot */
  .tc-hole::before {
    content: '';
    position: absolute;
    width: 125%;
    height: 40%;
    border-radius: 50%;
    top: 70%;
    left: 50%;
    translate: -50% -50%;
    background: black;
    box-shadow: 0 2px hsl(0 0% 20%) inset;
  }

  /* Coin hole – button-coloured flap that hides the coin re-entry */
  .tc-hole::after {
    transform-style: preserve-3d;
    content: '';
    background: var(--btn-bg);
    height: 200%;
    top: 0;
    left: 50%;
    translate: -50% 25%;
    width: 121%;
    position: absolute;
    transform: translate3d(0, 0, calc(var(--coin-thickness, 4) * 5px));
    mask: radial-gradient(125% 32% at 50% 3%, rgba(0,0,0,0) 50%, #fff 50%);
  }

  /* Coin positioning – kept in stylesheet so GSAP clearProps doesn't clobber it */
  .tc-coin {
    position: absolute;
    inset: 0;
    border-radius: 50%;
  }

  /* Edge-core strips that form the coin's 3-D thickness */
  .tc-core {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 100%;
    width: calc(var(--depth, 2) * 2px);
    background: var(--side-color);
    translate: -50% -50%;
    transform-style: preserve-3d;
  }
  .tc-core--a {
    --base: 0;
    transform: rotateY(90deg) rotateX(calc((90 - var(--rx, 0)) * -1deg));
  }
  .tc-core--b {
    --base: 90;
    transform: rotateY(90deg) rotateX(calc((90 - var(--rx, 0)) * 1deg));
  }
  .tc-core::after,
  .tc-core::before {
    content: '';
    height: 100%;
    width: calc(var(--depth, 2) * 2px);
    background: var(--side-color);
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
  }
  .tc-core::after {
    transform: rotateX(calc((var(--base, 0) - var(--rx, 0)) * 1deg));
  }
  .tc-core::before {
    transform: rotateX(calc((var(--base, 0) - var(--rx, 0)) * -1deg));
  }

  /* Coin faces */
  .tc-face {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    transform-style: preserve-3d;
    display: grid;
    place-items: center;
  }
  /* Gold rim ring on each face (backface-hidden so only shows on correct side) */
  .tc-face::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--side-color);
    backface-visibility: hidden;
  }
`;

export default function TipCoin({
  // Appearance
  buttonBg = "#1871f4",
  buttonText = "Leave tip",
  coinFace = "#ffdc02",
  coinSide = "#f4ae00",
  coinDetail = "hsl(43 97% 46%)",
  coinDepth = 2,
  coinThickness = 4,
  rotationUnits = 15,
  coinIconPath = DEFAULT_ICON_PATH,
  // Animation
  muted = true,
  timeScale = 1.1,
  distanceLower = 100,
  distanceUpper = 350,
  bounceLower = 2,
  bounceUpper = 12,
  velocityLower = 300,
  velocityUpper = 700,
  rotationLower = 0,
  rotationUpper = 15,
  flipSpeedLower = 0.25,
  flipSpeedUpper = 0.6,
  spinsLower = 1,
  spinsUpper = 6,
  rotateLower = 0,
  rotateUpper = 90,
}) {
  const buttonRef = useRef(null);
  const coinRef = useRef(null);
  const [hasFlipped, setHasFlipped] = useState(false);

  useEffect(() => {
    // Inject CSS (once per page)
    const STYLE_ID = "tip-coin-injected-css-v1";
    if (!document.getElementById(STYLE_ID)) {
      const styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      styleEl.textContent = INJECTED_CSS;
      document.head.appendChild(styleEl);
    }

    let cleanup = null;

    (async () => {
      try {
        const [{ default: gsap }, { Physics2DPlugin }] = await Promise.all([
          import("https://esm.sh/gsap@3.13.0"),
          import("https://esm.sh/gsap@3.13.0/Physics2DPlugin"),
        ]);
        gsap.registerPlugin(Physics2DPlugin);

        const button = buttonRef.current;
        const coin = coinRef.current;
        if (!button || !coin) return;

        const cfg = {
          muted,
          timeScale,
          distance: { lower: distanceLower, upper: distanceUpper },
          bounce: { lower: bounceLower, upper: bounceUpper },
          velocity: { lower: velocityLower, upper: velocityUpper },
          rotation: { lower: rotationLower, upper: rotationUpper },
          flipSpeed: { lower: flipSpeedLower, upper: flipSpeedUpper },
          spins: { lower: spinsLower, upper: spinsUpper },
          rotate: { lower: rotateLower, upper: rotateUpper },
        };

        const tipSound = new Audio(
          "https://myinstants.com/media/sounds/coin_1.mp3",
        );
        tipSound.volume = 0.3;

        const tip = () => {
          if (button.dataset.tipping === "true") return;

          const currentRotation = gsap.getProperty(button, "rotate");
          if (currentRotation < 0) setHasFlipped(true);
          button.dataset.tipping = "true";

          const abs = Math.abs(currentRotation);

          const duration = gsap.utils.mapRange(
            cfg.rotation.lower,
            cfg.rotation.upper,
            0,
            cfg.flipSpeed.upper,
          )(abs);

          const distance = gsap.utils.snap(
            1,
            gsap.utils.mapRange(
              cfg.rotation.lower,
              cfg.rotation.upper,
              cfg.distance.lower,
              cfg.distance.upper,
            )(abs),
          );

          const velocity = gsap.utils.mapRange(
            cfg.rotation.lower,
            cfg.rotation.upper,
            cfg.velocity.lower,
            cfg.velocity.upper,
          )(abs);

          const bounce = gsap.utils.mapRange(
            cfg.velocity.lower,
            cfg.velocity.upper,
            cfg.bounce.lower,
            cfg.bounce.upper,
          )(Math.abs(velocity));

          const distanceDuration = gsap.utils.mapRange(
            cfg.distance.lower,
            cfg.distance.upper,
            cfg.flipSpeed.lower,
            cfg.flipSpeed.upper,
          )(distance);

          const spin = gsap.utils.snap(
            1,
            gsap.utils.mapRange(
              cfg.distance.lower,
              cfg.distance.upper,
              cfg.spins.lower,
              cfg.spins.upper,
            )(distance),
          );

          const offRotate =
            gsap.utils.random(cfg.rotate.lower, cfg.rotate.upper, 1) * -1;
          const hangtime = Math.max(1, duration * 4);

          const purse = button.querySelector(".tc-purse");
          const hole = button.querySelector(".tc-hole");

          const tl = gsap
            .timeline({
              onComplete: () => {
                if (!cfg.muted) {
                  tipSound.muted = false;
                  tipSound.play().catch(() => {});
                }
                gsap.set(coin, { yPercent: 100 });
                gsap
                  .timeline({
                    onComplete: () => {
                      gsap.set(button, { clearProps: "all" });
                      gsap.set(coin, { clearProps: "all" });
                      gsap.set(purse, { clearProps: "all" });
                      button.dataset.tipping = "false";
                    },
                  })
                  .to(button, {
                    yPercent: bounce,
                    repeat: 1,
                    duration: 0.12,
                    yoyo: true,
                  })
                  .fromTo(
                    hole,
                    { scale: 1 },
                    { scale: 0, duration: 0.2, delay: 0.2 },
                  )
                  .set(coin, { clearProps: "all" })
                  .set(coin, { yPercent: -50 })
                  .fromTo(
                    purse,
                    { xPercent: -200 },
                    {
                      delay: 0.5,
                      xPercent: 0,
                      duration: 0.5,
                      ease: "power1.out",
                    },
                  )
                  .fromTo(
                    coin,
                    { rotate: -460 },
                    { rotate: 0, duration: 0.5, ease: "power1.out" },
                    "<",
                  )
                  .timeScale(cfg.timeScale);
              },
            })
            .set(button, { transition: "none" })
            .fromTo(
              button,
              { rotate: currentRotation },
              { rotate: 0, duration, ease: "elastic.out(1.75,0.75)" },
            )
            .to(
              coin,
              {
                onUpdate: function () {
                  const y = gsap.getProperty(coin, "y");
                  if (y >= coin.offsetHeight) {
                    this.progress(1);
                    tl.progress(1);
                  }
                },
                duration: hangtime,
                physics2D: { velocity, angle: -90, gravity: 1000 },
              },
              `>-${duration * 0.825}`,
            )
            .fromTo(
              coin,
              { rotateX: 0 },
              { duration: distanceDuration * 2, rotateX: spin * -360 },
              "<",
            )
            .to(coin, { rotateY: offRotate, duration: distanceDuration }, "<")
            .to(coin, { "--rx": offRotate, duration: distanceDuration }, "<")
            .fromTo(
              hole,
              { scale: 0 },
              { scale: 1, duration: 0.2 },
              hangtime * 0.35,
            )
            .timeScale(cfg.timeScale);
        };

        button.addEventListener("click", tip);
        cleanup = () => button.removeEventListener("click", tip);
      } catch (err) {
        console.error("[TipCoin] Failed to initialise GSAP:", err);
      }
    })();

    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-white dark:bg-black">
      {/* Subtle grid backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: [
            "linear-gradient(90deg, color-mix(in hsl, canvasText, transparent 80%) 1px, transparent 1px 45px)",
            "linear-gradient(color-mix(in hsl, canvasText, transparent 80%) 1px, transparent 1px 45px)",
          ].join(", "),
          backgroundSize: "45px 45px",
          backgroundPosition: "calc(45px * 0.36) 50%, 0% calc(45px * 0.32)",
          maskImage: "linear-gradient(-20deg, transparent 50%, white)",
        }}
      />

      {/* Handwritten instruction arrow — fades once the user has flipped */}
      <span
        aria-hidden="true"
        className="fixed inline-block text-sm pointer-events-none transition-opacity duration-[260ms] delay-[260ms]"
        style={{
          fontFamily: "'Gloria Hallelujah', cursive",
          top: "50%",
          left: "50%",
          translate: "-190% 150%",
          rotate: "-10deg",
          opacity: hasFlipped ? 0 : 0.8,
        }}
      >
        <span>hold to flip coin</span>
        <svg
          viewBox="0 0 97 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            width: "80%",
            color: "hsl(0 0% 65%)",
            top: "130%",
            rotate: "20deg",
            left: "-10%",
            translate: "105% 40%",
          }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={ARROW_PATH}
            fill="currentColor"
          />
        </svg>
      </span>

      {/* Button wrapper – slight scale-up + z-push matching original */}
      <main
        style={{
          scale: "1.2",
          transform: "translate3d(0, 0, 100vmax)",
          transformStyle: "preserve-3d",
        }}
      >
        <button
          ref={buttonRef}
          aria-label="Leave a tip"
          data-tipping="false"
          className="tc-button relative rounded-[6px] text-sm text-white font-sans cursor-pointer p-0 select-none touch-none transition-[transform,box-shadow] duration-[260ms]"
          style={{
            // CSS custom props used by injected selectors
            "--btn-bg": buttonBg,
            "--ru": rotationUnits,
            background: buttonBg,
            border: `1px solid color-mix(in oklch, ${buttonBg}, #000 12%)`,
            transformOrigin: "75% 50%",
            boxShadow:
              "0px 0.6px 0.7px hsl(0 0% 0%/0.14)," +
              "0px 2.3px 2.6px -0.8px hsl(0 0% 0%/0.14)," +
              "0px 5.9px 6.6px -1.7px hsl(0 0% 0%/0.14)," +
              "0px 14.5px 16.3px -2.5px hsl(0 0% 0%/0.14)",
          }}
        >
          {/* Clipped inner content — 1 px bottom clip hides coin exit */}
          <span
            className="flex items-center gap-3 px-3 py-2 h-full"
            style={{ clipPath: "inset(-100vmax 0 1px 0)" }}
          >
            {/* ── 3-D scene ── */}
            <span
              className="tc-scene inline-block relative"
              style={{
                width: "1.2lh",
                aspectRatio: "1",
                perspective: "100vh",
                // inherited by tc-hole::after for the slot flap depth
                "--coin-thickness": coinThickness,
              }}
            >
              {/* Slot hole that appears when coin launches */}
              <span
                className="tc-hole absolute z-10 inset-0 scale-0"
                style={{
                  transformOrigin: "50% 70%",
                  // pushed back so it sits behind the button face
                  transform: `translate3d(0, 0, calc(${coinThickness} * -2px))`,
                }}
              />

              {/* Purse — full-bleed wrapper; slides in on coin return */}
              <div className="tc-purse absolute inset-0 w-full h-full">
                {/* ── Coin ── */}
                <div
                  ref={coinRef}
                  className="tc-coin"
                  style={{
                    // Depth & side-colour cascades to .tc-core and .tc-face::after
                    "--depth": coinDepth,
                    "--side-color": coinSide,
                  }}
                >
                  {/* Two cross-shaped edge strips that fake coin thickness */}
                  <div className="tc-core tc-core--a" />
                  <div className="tc-core tc-core--b" />

                  {/* Front face (rotateY 180° so it shows when coin flips) */}
                  <div
                    className="tc-face"
                    style={{
                      background: coinFace,
                      color: coinDetail,
                      transform: `translate3d(0,0,calc(${coinDepth}px + 0.5px)) rotateY(180deg)`,
                    }}
                  >
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        width: "65%",
                        scale: "-1 1",
                        translate: "-5% 0",
                      }}
                    >
                      <path d={coinIconPath} fill="currentColor" />
                    </svg>
                  </div>

                  {/* Rear face */}
                  <div
                    className="tc-face"
                    style={{
                      background: coinFace,
                      color: coinDetail,
                      transform: `translate3d(0,0,calc(${coinDepth * -1}px - 0.5px))`,
                    }}
                  >
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        width: "65%",
                        scale: "-1 1",
                        translate: "-5% 0",
                      }}
                    >
                      <path d={coinIconPath} fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </span>

            <span>{buttonText}</span>
          </span>
        </button>
      </main>
    </div>
  );
}
