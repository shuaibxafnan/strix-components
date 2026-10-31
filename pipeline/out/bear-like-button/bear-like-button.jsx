"use client";

import { useEffect, useId, useRef } from "react";

const STROKED = "[stroke:hsl(204,6%,16%)]";
const BEAR_ONE_DARK = "[fill:hsl(29,59%,23%)]";
const BEAR_ONE_LIGHT = "[fill:hsl(29,59%,40%)]";
const BEAR_TWO_DARK = "[fill:hsl(45,99%,68%)]";
const BEAR_TWO_LIGHT = "[fill:hsl(51,98%,92%)]";
const PAD_LIGHT = "[fill:hsl(24,57%,65%)]";
const PAD_DARK = "[fill:hsl(24,57%,85%)]";

const SEGMENT =
  "transformer__segment flex h-[92px] items-center justify-center bg-white";
const BORDER_COLOR = "border-[color:var(--stroke)]";

const PAW_FINGER_OFFSETS = [
  { tx: 29.867, ty: -10.156 },
  { tx: 36.816, ty: -14.767 },
  { tx: 45.035, ty: -12.361 },
  { tx: 52.184, ty: -7.15 },
];

const PAW_BODY_DARK =
  "M52.665 167.163c-2.333.002-4.55 1.149-6.074 3.142a4.037 4.037 0 00-.478-.036c-4.67.567-5.742 5.429-5.779 8.991-.048 4.657 1.305 8.702 1.514 13.09.445 9.37-.567 28.14-.567 28.14h29.886s-.2-18.156.567-27.188c.373-4.398 1.814-8.794 1.96-13.097.123-3.618-2.536-8.965-6.13-8.965a4.704 4.704 0 00-1.345.208c-1.388-2.135-3.475-3.375-5.68-3.377a6.14 6.14 0 00-3.108.875c-1.38-1.154-3.05-1.779-4.766-1.783z";
const PAW_BODY_LIGHT =
  "M55.386 167.708c-2.627.541-4.348 4.247-5.596 6.946-1.308 2.829-1.573 6.074-1.746 9.187-.257 4.6.846 9.394 1.054 13.781.427 8.97-.261 21.241-.34 22.735l22.409.133s-.2-18.155.567-27.188c.373-4.398 1.814-8.794 1.96-13.096.123-3.619-2.536-8.966-6.13-8.966a4.704 4.704 0 00-1.345.208c-1.388-2.134-3.475-3.375-5.68-3.377a6.14 6.14 0 00-3.108.875 7.783 7.783 0 00-2.045-1.238z";

const WIGGLE_PATH =
  "M1.736 27.128S.528 24.968.678 23.821c.17-1.298 2.117-1.999 2.117-3.308 0-1.308-2.117-1.998-2.117-3.307s2.117-1.998 2.117-3.307S.678 11.9.678 10.592c0-1.31 2.117-1.999 2.117-3.308 0-1.309-1.948-2.01-2.117-3.307C.528 2.829 1.736.67 1.736.67";

function PawFingerGroup({ tx, ty }) {
  return (
    <g transform={`translate(${tx} ${ty})`}>
      <circle
        className={`${PAD_LIGHT} ${STROKED}`}
        cx="16.124"
        cy="188.105"
        r="3.274"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".794"
      />
      <path
        className={PAD_DARK}
        d="M16.916 184.933a3.274 3.274 0 00-2.479 3.172 3.274 3.274 0 002.482 3.173 3.274 3.274 0 002.479-3.173 3.274 3.274 0 00-2.482-3.172z"
      />
      <circle
        className={STROKED}
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

function BearPaw({ variant }) {
  const dark = variant === "one" ? BEAR_ONE_DARK : BEAR_TWO_DARK;
  const light = variant === "one" ? BEAR_ONE_LIGHT : BEAR_TWO_LIGHT;

  return (
    <svg
      className="bear-paw absolute left-1/2 top-0 h-[150%] overflow-visible [opacity:var(--hovered,0)] [transform:translate(-50%,-14%)] [transition:0.2s]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 34.611 55.365"
    >
      <g transform="translate(-39.71 -165.748)">
        <circle cx="43.184" cy="170.945" r="1.323" />
        <circle cx="51.121" cy="167.071" r="1.323" />
        <circle cx="61.421" cy="167.732" r="1.323" />
        <circle cx="69.075" cy="171.417" r="1.323" />
        <path
          className={`${STROKED} ${dark}`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.246"
          d={PAW_BODY_DARK}
        />
        <path className={light} d={PAW_BODY_LIGHT} />
        <path
          className={STROKED}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.587"
          d={PAW_BODY_DARK}
        />
        {variant === "one" && (
          <>
            <ellipse
              className={`${PAD_LIGHT} ${STROKED}`}
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
              className={PAD_DARK}
              d="M58.589 182.14a8.728 6.154 1.436 00-8.247 6.185 8.728 6.154 1.436 006.665 5.911 8.728 6.154 1.436 008.245-6.186 8.728 6.154 1.436 00-6.663-5.91z"
            />
            <ellipse
              className={STROKED}
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
          </>
        )}
      </g>
    </svg>
  );
}

function Wiggle() {
  return (
    <svg
      className="wiggle absolute left-1/2 top-1/2 z-10 hidden h-[100px] overflow-visible [transform:translate(-50%,-50%)]"
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

function Dashed({ clipId }) {
  return (
    <span className="dashed__container absolute left-1/2 top-1/2 z-[11] hidden h-[100px] [transform:translate(-50%,-50%)]">
      <svg className="dashed h-full overflow-visible" viewBox="-0.25 -0.25 0.5 30">
        <defs>
          <clipPath id={clipId}>
            <rect height="31" width="1" x="-0.5" y="-0.5" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path
            className="dashed__line celebration-line"
            d="M 0 0, L 0 30"
            strokeLinecap="round"
            strokeDasharray="2"
            strokeWidth="0.75"
          />
        </g>
      </svg>
    </span>
  );
}

function Burst() {
  return (
    <span className="burst absolute left-1/2 top-1/2 z-[12] hidden h-[30px] w-[30px] [transform:translate(-50%,-50%)_rotate(calc(var(--rotate,0)*1deg))_translateY(calc(var(--translate,0)*-1px))]">
      {[0, 1, 2, 3].map((i) => (
        <svg
          key={i}
          className="burst__line absolute left-1/2 top-1/2 z-[12] h-[30px] overflow-visible [transform-origin:50%_100%] [transform:translate(-50%,-50%)_rotate(calc((-45_+_(var(--index)*30))*1deg))]"
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
    </span>
  );
}

export default function BearLikeButton({
  label = "Like",
  initialCount = 86,
  className = "",
}) {
  const btnRef = useRef(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let cancelled = false;
    let teardown = () => { };

    import("gsap")
      .then(({ gsap }) => {
        const TRANSFORMER = btnRef.current;
        if (cancelled || !TRANSFORMER) return;

        gsap.config({ trialWarn: false });
        const { timeline } = gsap;
        const q = gsap.utils.selector(TRANSFORMER);
        const TTEXT = q(".transformer__middle")[0];
        const duration = 0.2;

        const celebrationEls = () => [
          ...q(".wiggle"),
          ...q(".dashed__container"),
          ...q(".burst"),
        ];

        gsap.set(q(".number--next"), { yPercent: -100, opacity: 0 });
        gsap.set(q(".slap__line"), {
          transformOrigin: "50% 50%",
          rotate: (i) => -45 + i * 45,
        });
        gsap.set(q(".slap__line path"), {
          transformOrigin: "50% 50%",
          yPercent: -350,
          scaleY: 0.75,
        });
        gsap.set(q(".heart__segment"), { opacity: 0 });

        const LEFT_PAW_TL = () =>
          timeline({})
            .set(q(".transformer__feature"), { transition: "none" })
            .to(q(".transformer__feature"), {
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

        const RIGHT_PAW_TL = () =>
          timeline().to(q(".paw--right"), {
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

        const RESIZE_TL = () =>
          timeline({})
            .set(q(".bear-paw"), { opacity: 1 })
            .to(
              TRANSFORMER,
              {
                "--stroke": "hsl(326, 56%, 85%)",
                "--color": "hsl(204, 6%, 16%)",
                duration,
              },
              0,
            )
            .to(
              q(".transformer__segment"),
              { backgroundColor: "hsl(327, 91%, 96%)", duration },
              0,
            )
            .to(q(".transformer__heart"), { opacity: 1, duration }, 0)
            .to(q(".paw--left"), { opacity: 0, duration }, 0)
            .to(q(".transformer__feature"), { xPercent: -100, duration }, 0)
            .to(q(".transformer__outline"), { scaleX: 0.6, duration }, 0)
            .to(
              q(".transformer__front"),
              { x: TTEXT.offsetWidth / 2, duration },
              0,
            )
            .to(
              q(".transformer__back"),
              { x: -(TTEXT.offsetWidth / 2), duration },
              0,
            )
            .to(
              q(".number.number--current.number--single"),
              { yPercent: 100, opacity: 0, duration },
              0,
            )
            .to(
              q(".number.number--next.number--single"),
              { yPercent: 0, opacity: 1, duration },
              0,
            )
            .to(q(".heart__segment"), { opacity: 1, duration }, 0);

        const SLAP_TL = () =>
          gsap
            .timeline({
              onStart: () => {
                gsap.set(q(".slap"), { display: "block" });
              },
              onComplete: () => {
                gsap.set(q(".slap"), { display: "none" });
                gsap.set(q(".slap__circle"), { clearProps: "all" });
              },
            })
            .set(q(".slap__circle"), {
              stroke: `hsl(${Math.random() * 359}, 85%, 60%)`,
            })
            .to(q(".slap__circle"), {
              strokeWidth: 0,
              scale: 2.5,
              duration: 0.15,
              transformOrigin: "50% 50%",
            })
            .fromTo(
              q(".slap__line path"),
              { strokeDashoffset: -11 },
              { yPercent: -400, duration: 0.15, strokeDashoffset: 11 },
              0,
            );

        const CELEBRATE_TL = () =>
          gsap
            .timeline({
              repeatRefresh: true,
              onStart: () => {
                gsap.set(celebrationEls(), { display: "block" });
              },
              onComplete: () => {
                gsap.set(celebrationEls(), { display: "none" });
              },
            })
            .set(q(".celebration-line"), {
              stroke: () => `hsl(${Math.random() * 359}, 100%, 70%)`,
            })
            .set(q(".dashed__line"), { yPercent: -120 })
            .set(q(".dashed"), { yPercent: 0 })
            .set(q(".burst"), {
              "--rotate": () => Math.random() * 360,
              "--translate": () => Math.random() * 100 + 180,
            })
            .set([...q(".wiggle"), ...q(".dashed__container")], {
              rotate: () => Math.random() * 360,
            })
            .set([...q(".wiggle__line"), ...q(".dashed")], {
              yPercent: () => Math.random() * 150 + 180,
              scaleY: () => Math.random() + 0.5,
            })
            .fromTo(
              q(".dashed__line"),
              { yPercent: -120 },
              { yPercent: 120, duration: 0.5 },
              0,
            )
            .to(q(".dashed"), { yPercent: "random(20, 100)" })
            .fromTo(
              q(".wiggle__line"),
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
              q(".burst__line path"),
              { strokeDashoffset: -32 },
              {
                delay: () => Math.random() * 0.5,
                yPercent: "-=50",
                strokeDashoffset: 32,
              },
              0,
            );

        const TRANSFORMER_TL = () =>
          timeline({
            onComplete: () => TRANSFORMER.removeAttribute("disabled"),
          })
            .set(q(".transformer__feature"), { "--hovered": 1 })
            .set(q(".bear-paw"), { opacity: 1 })
            .set(q(".transformer__text"), { yPercent: 80, opacity: 0 })
            .add(LEFT_PAW_TL(), 0.25)
            .add(RIGHT_PAW_TL(), "<")
            .add(SLAP_TL(), ">-0.5")
            .add(CELEBRATE_TL(), "<")
            .add(RESIZE_TL(), "<+0.5")
            .to(
              q(".transformer__heart"),
              { scale: 1.25, repeat: 1, yoyo: true, ease: "elastic.in" },
              ">-0.2",
            );

        const RESET_TL = timeline({
          paused: true,
          onComplete: () => {
            gsap.set(
              [
                ...q(".transformer__heart"),
                ...q(".paw--left"),
                ...q(".bear-paw"),
              ],
              { clearProps: "all" },
            );
          },
        })
          .set([...q(".transformer__feature"), ...q(".transformer__text")], {
            clearProps: "all",
          })
          .to(q(".transformer__front"), { x: 0, duration })
          .to(q(".heart__segment"), { opacity: 0, duration }, 0)
          .to(q(".transformer__outline"), { scaleX: 1, duration }, 0)
          .to(
            q(".transformer__segment"),
            { backgroundColor: "hsl(0, 0%, 100%)", duration },
            0,
          )
          .to(q(".transformer__back"), { x: 0, duration }, 0)
          .to(
            TRANSFORMER,
            {
              "--stroke": "hsl(180, 3%, 94%)",
              "--color": "hsl(180, 2%, 77%)",
              duration,
            },
            0,
          )
          .to(
            q(".number.number--current.number--single"),
            { yPercent: 0, opacity: 1, duration },
            0,
          )
          .to(
            q(".number.number--next.number--single"),
            { yPercent: -100, opacity: 0, duration },
            0,
          )
          .to(q(".paw--left"), { opacity: 1, duration }, 0)
          .to(q(".transformer__heart"), { opacity: 0, duration }, 0);

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
              overflow: "visible",
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

        TRANSFORMER.addEventListener("pointerdown", handlePointerDown);
        gsap.set(TRANSFORMER, { display: "block" });

        teardown = () => {
          TRANSFORMER.removeEventListener("pointerdown", handlePointerDown);
          gsap.killTweensOf([
            TRANSFORMER,
            ...TRANSFORMER.querySelectorAll("*"),
          ]);
          RESET_TL.kill();
        };
      })
      .catch((e) => console.error("[BearLikeButton] GSAP load error:", e.message));

    return () => {
      cancelled = true;
      teardown();
    };
  }, []);

  const next = initialCount + 1;
  const tens = Math.floor((initialCount % 100) / 10);
  const units = initialCount % 10;
  const nextTens = Math.floor((next % 100) / 10);
  const nextUnits = next % 10;
  const carry = tens !== nextTens;
  const single = carry ? " number--single" : "";
  const numberCls = "number absolute left-0 inline-block";
  const placeCls =
    "number__place relative inline-block h-[32px] w-[18px]";

  return (
    <div
      className={`w-full h-screen flex items-center justify-center ${className}`}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap"
      />

      <button
        ref={btnRef}
        type="button"
        aria-pressed="false"
        className="transformer relative m-0 hidden cursor-pointer select-none appearance-none overflow-hidden border-0 bg-transparent p-0 font-['Roboto',sans-serif] text-[32px] font-medium outline-transparent [--color:hsl(180,2%,77%)] [--hovered:0] [--stroke:hsl(180,3%,94%)] hover:[--hovered:1]"
      >
        <span className="transformer__container relative inline-flex items-center justify-center overflow-hidden">
          <span
            className={`transformer__front z-[2] rounded-l-[10px] border-4 border-r-0 pl-[36px] pr-[14px] ${BORDER_COLOR} ${SEGMENT}`}
          >
            <span className="transformer__feature relative h-[32px] w-[32px] [transform:translate(-6px,0)_translateX(calc(var(--hovered,0)*100%))] [transition:transform_0.2s]">
              <svg
                className="transformer__heart heart absolute left-1/2 top-1/2 h-full overflow-visible [opacity:calc(1_-_var(--hovered,0))] [transform:translate(-50%,-50%)]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 12.115 11.096"
              >
                <defs>
                  <clipPath id={`${uid}-heart-outline`}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth=".822"
                      d="M1.325 1.386a3.307 3.307 0 00.055 4.621l4.677 4.678 4.678-4.678A3.308 3.308 0 009.252.474c-1.141-.306-2.36.55-3.195 1.385C5.222 1.023 4.004.168 2.862.474a3.307 3.307 0 00-1.537.912z"
                    />
                  </clipPath>
                  <clipPath id={`${uid}-heart-inner`}>
                    <path
                      clipPath={`url(#${uid}-heart-outline)`}
                      d="M-.2.044c-.383.4-.191 2.762-.335 3.297a3.307 3.307 0 00.856 3.195L5 11.214l4.677-4.678a3.308 3.308 0 00-1.482-5.533C7.052.697 4.176-1.237 3.34-.401c-.836-.835 1.141-.305 0 0-.586.158-3.123.005-3.542.445z"
                    />
                  </clipPath>
                </defs>
                <path
                  className="heart__segment [fill:hsl(325,93%,95%)]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth=".822"
                  d="M1.325 1.386a3.307 3.307 0 00.055 4.621l4.677 4.678 4.678-4.678A3.308 3.308 0 009.252.474c-1.141-.306-2.36.55-3.195 1.385C5.222 1.023 4.004.168 2.862.474a3.307 3.307 0 00-1.537.912z"
                />
                <path
                  className="heart__segment [fill:hsl(326,78%,65%)]"
                  clipPath={`url(#${uid}-heart-outline)`}
                  d="M-.2.044c-.383.4-.191 2.762-.335 3.297a3.307 3.307 0 00.856 3.195L5 11.214l4.677-4.678a3.308 3.308 0 00-1.482-5.533C7.052.697 4.176-1.237 3.34-.401c-.836-.835 1.141-.305 0 0-.586.158-3.123.005-3.542.445z"
                />
                <path
                  className="heart__segment [fill:hsl(326,98%,82%)]"
                  clipPath={`url(#${uid}-heart-inner)`}
                  d="M4.611.073a3.307 3.307 0 00-1.418 4.4l2.947 5.921 5.922-2.947a3.308 3.308 0 00.354-5.718c-.985-.653-1.116-2.76-2.174-2.233-.527-1.058-2.704.274-3.884.201a3.308 3.308 0 00-1.747.376z"
                />
                <path
                  className="[stroke-width:1.25px] [stroke:var(--color)]"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth=".822"
                  d="M1.325 1.386a3.307 3.307 0 00.055 4.621l4.677 4.678 4.678-4.678A3.308 3.308 0 009.252.474c-1.141-.306-2.36.55-3.195 1.385C5.222 1.023 4.004.168 2.862.474a3.307 3.307 0 00-1.537.912z"
                />
              </svg>

              <span className="paw paw--left absolute left-1/2 top-0 block h-[64px] w-[32px] [transform:translate(-50%,0%)]">
                <BearPaw variant="one" />
              </span>
            </span>
          </span>

          <span
            className={`transformer__middle border-x-0 border-y-4 px-[10px] ${BORDER_COLOR} ${SEGMENT}`}
          >
            <span className="transformer__text inline-block text-[32px] leading-[32px] text-[hsl(180,6%,19%)] [opacity:calc(1_-_var(--hovered,0))] [transform:translateY(calc(var(--hovered,0)*80%))] [transition:transform_0.2s,opacity_0.2s]">
              {label}
            </span>
          </span>

          <span
            className={`transformer__back z-[2] rounded-r-[10px] border-4 border-l-0 pl-[4px] pr-[36px] ${BORDER_COLOR} ${SEGMENT}`}
          >
            <span className="transformer__number inline-block h-[32px] text-[32px] leading-[32px] text-[color:var(--color)] [transform:translate(6px,0)]">
              <span className={placeCls}>
                <span
                  className={`${numberCls} number--ten number--current${single}`}
                >
                  {tens}
                </span>
                <span
                  className={`${numberCls} number--ten number--next${single}`}
                >
                  {nextTens}
                </span>
              </span>
              <span className={placeCls}>
                <span
                  className={`${numberCls} number--current number--single`}
                >
                  {units}
                </span>
                <span className={`${numberCls} number--next number--single`}>
                  {nextUnits}
                </span>
              </span>
            </span>
          </span>
        </span>

        <span className="paw paw--right absolute left-[55%] top-[125%] z-[5] block h-[64px] w-[32px] [transform:translate(-50%,0%)]">
          <BearPaw variant="two" />
        </span>

        <svg
          className="slap absolute left-[38%] top-1/2 z-[4] hidden h-[64px] w-[64px] overflow-visible [transform:translate(-50%,-50%)]"
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
            {[0, 1, 2].map((i) => (
              <g key={i} className="slap__line">
                <path
                  stroke="#000"
                  strokeWidth="2.117"
                  strokeDasharray="11"
                  d="M78.374 137.592v10.423"
                />
              </g>
            ))}
          </g>
        </svg>

        <span className="transformer__outline absolute left-1/2 top-0 z-10 h-full w-[90%] border-x-0 border-y-4 border-[color:var(--stroke)] [transform:translate3d(-50%,0,0)]" />

        {Array.from({ length: 20 }, (_, i) => (
          <Wiggle key={i} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <Dashed key={i} clipId={`${uid}-line-clip-${i}`} />
        ))}
        <Burst />
        <Burst />
      </button>
    </div>
  );
}