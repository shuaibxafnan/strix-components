"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Gloria_Hallelujah } from "next/font/google";

const hand = Gloria_Hallelujah({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hand",
});

const DEFAULT_ICON_PATH =
  "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.1L12 17.5 5.7 21.3l1.7-7.1L2 9.5l7.1-.6L12 2z";

const RIM_SEGMENTS = Array.from({ length: 36 }, (_, i) => i);

const BUTTON_SHADOW =
  "[box-shadow:0px_0.6px_0.7px_hsl(0_0%_0%/0.14),0px_2.3px_2.6px_-0.8px_hsl(0_0%_0%/0.14),0px_5.9px_6.6px_-1.7px_hsl(0_0%_0%/0.14),0px_14.5px_16.3px_-2.5px_hsl(0_0%_0%/0.14)] data-[pressed=true]:[box-shadow:-0.5px_0.7px_1px_hsl(0_0%_0%/0.14),-1.8px_2.3px_3.3px_-0.8px_hsl(0_0%_0%/0.14),-4.6px_6px_8.5px_-1.7px_hsl(0_0%_0%/0.14),-11.4px_14.6px_20.8px_-2.5px_hsl(0_0%_0%/0.14)]";

export default function TipCoin({
  buttonBg = "#000000",
  buttonText = "Leave tip",
  buttonTextColor = "text-white",
  ariaLabel = "Leave a tip",
  hintText = "hold to flip coin",
  coinFace = "#ffffff",
  coinSide = "#a3a3a3",
  coinDetail = "#171717",
  coinIconPath = DEFAULT_ICON_PATH,
  coinSize = 24,
  coinDepth = 2,
  coinThickness = 4,
  rotationUnits = 15,
  backgroundColor = "bg-white",
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
  className = "",
}) {
  const buttonRef = useRef(null);
  const coinRef = useRef(null);
  const purseRef = useRef(null);
  const holeRef = useRef(null);
  const pressedRef = useRef(false);
  const tippingRef = useRef(false);
  const [hasFlipped, setHasFlipped] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(Physics2DPlugin);
    return () => {
      gsap.killTweensOf([
        buttonRef.current,
        coinRef.current,
        purseRef.current,
        holeRef.current,
      ]);
    };
  }, []);

  const press = () => {
    if (tippingRef.current) return;
    pressedRef.current = true;
    buttonRef.current.dataset.pressed = "true";
    gsap.to(buttonRef.current, {
      rotation: -rotationUnits,
      duration: 0.26,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const cancelPress = () => {
    if (!pressedRef.current || tippingRef.current) return;
    pressedRef.current = false;
    buttonRef.current.dataset.pressed = "false";
    gsap.to(buttonRef.current, {
      rotation: 0,
      duration: 0.26,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const launch = () => {
    if (!pressedRef.current || tippingRef.current) return;
    pressedRef.current = false;
    tippingRef.current = true;

    const button = buttonRef.current;
    const coin = coinRef.current;
    const purse = purseRef.current;
    const hole = holeRef.current;
    button.dataset.pressed = "false";

    const currentRotation = gsap.getProperty(button, "rotation");
    if (currentRotation < 0) setHasFlipped(true);
    const abs = Math.abs(currentRotation);

    const duration = gsap.utils.mapRange(rotationLower, rotationUpper, 0, flipSpeedUpper)(abs);
    const distance = gsap.utils.snap(
      1,
      gsap.utils.mapRange(rotationLower, rotationUpper, distanceLower, distanceUpper)(abs),
    );
    const velocity = gsap.utils.mapRange(rotationLower, rotationUpper, velocityLower, velocityUpper)(abs);
    const bounce = gsap.utils.mapRange(
      velocityLower,
      velocityUpper,
      bounceLower,
      bounceUpper,
    )(Math.abs(velocity));
    const distanceDuration = gsap.utils.mapRange(
      distanceLower,
      distanceUpper,
      flipSpeedLower,
      flipSpeedUpper,
    )(distance);
    const spin = gsap.utils.snap(
      1,
      gsap.utils.mapRange(distanceLower, distanceUpper, spinsLower, spinsUpper)(distance),
    );
    const offRotate = gsap.utils.random(rotateLower, rotateUpper, 1) * -1;
    const hangtime = Math.max(1, duration * 4);

    const settle = () => {
      gsap.set(coin, { yPercent: 100 });
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(button, { clearProps: "transform,transition" });
            gsap.set(coin, { clearProps: "transform" });
            gsap.set(purse, { clearProps: "transform" });
            button.dataset.pressed = "false";
            tippingRef.current = false;
          },
        })
        .to(button, { yPercent: bounce, repeat: 1, duration: 0.12, yoyo: true })
        .fromTo(hole, { scale: 1 }, { scale: 0, duration: 0.2, delay: 0.2 })
        .set(coin, { clearProps: "transform" })
        .fromTo(
          purse,
          { xPercent: -200 },
          { delay: 0.5, xPercent: 0, duration: 0.5, ease: "power1.out" },
        )
        .fromTo(
          coin,
          { rotation: -460 },
          { rotation: 0, duration: 0.5, ease: "power1.out" },
          "<",
        )
        .timeScale(timeScale);
    };

    const tl = gsap
      .timeline({ onComplete: settle })
      .set(button, { transition: "none" })
      .fromTo(
        button,
        { rotation: currentRotation },
        { rotation: 0, duration, ease: "elastic.out(1.75,0.75)" },
      )
      .to(
        coin,
        {
          onUpdate: function () {
            if (gsap.getProperty(coin, "y") >= coin.offsetHeight) {
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
      .fromTo(hole, { scale: 0 }, { scale: 1, duration: 0.2 }, hangtime * 0.35)
      .timeScale(timeScale);
  };

  const faceClass =
    "absolute inset-0 grid place-items-center rounded-full border-2 border-[var(--side)] bg-[var(--face)] text-[var(--detail)] [backface-visibility:hidden]";
  const frontFace = `${faceClass} [transform:translateZ(var(--depth))]`;
  const backFace = `${faceClass} [transform:rotateY(180deg)_translateZ(var(--depth))]`;

  const icon = (
    <svg viewBox="0 0 24 24" className="w-[65%]" aria-hidden="true">
      <path d={coinIconPath} fill="currentColor" />
    </svg>
  );

  return (
    <div
      className={`${hand.variable} relative flex min-h-screen w-full items-center justify-center overflow-hidden ${backgroundColor} ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 [background-image:linear-gradient(90deg,rgba(128,128,128,0.2)_1px,transparent_1px),linear-gradient(rgba(128,128,128,0.2)_1px,transparent_1px)] [background-size:45px_45px] [mask-image:linear-gradient(-20deg,transparent_50%,white)]"
      />

      <span
        aria-hidden="true"
        className={`pointer-events-none fixed left-1/2 top-1/2 inline-block text-sm text-neutral-500 transition-opacity duration-[260ms] [font-family:var(--font-hand)] [rotate:-10deg] [translate:-190%_150%] ${hasFlipped ? "opacity-0" : "opacity-80"
          }`}
      >
        <span>{hintText}</span>
        <svg
          viewBox="0 0 100 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-[-10%] top-[130%] w-[80%] [rotate:20deg] [translate:105%_40%]"
        >
          <path d="M4 8C20 40 60 46 92 30" />
          <path d="M80 28l12 2-6 11" />
        </svg>
      </span>

      <main className="scale-[1.2]">
        <button
          ref={buttonRef}
          type="button"
          aria-label={ariaLabel}
          data-pressed="false"
          onPointerDown={press}
          onPointerUp={launch}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          style={{ "--btn-bg": buttonBg }}
          className={`group relative cursor-pointer touch-none select-none rounded-[6px] border border-white/10 bg-[var(--btn-bg)] p-0 text-sm font-sans ${buttonTextColor} origin-[75%_50%] transition-shadow duration-[260ms] hover:[background:color-mix(in_oklch,var(--btn-bg),#fff_12%)] focus-visible:[background:color-mix(in_oklch,var(--btn-bg),#fff_12%)] ${BUTTON_SHADOW}`}
        >
          <span className="flex h-full items-center gap-3 px-3 py-2 [clip-path:inset(-100vmax_0_1px_0)]">
            <span
              className="relative inline-block h-[var(--size)] w-[var(--size)] shrink-0 [perspective:100vh] [transform-style:preserve-3d]"
              style={{
                "--size": `${coinSize}px`,
                "--r": `${coinSize / 2}px`,
                "--rim-w": `${((Math.PI * coinSize) / 36) * 1.25}px`,
                "--rim-h": `${coinDepth * 2 + 1}px`,
                "--depth": `${coinDepth}px`,
                "--coin-thickness": coinThickness,
                "--face": coinFace,
                "--side": coinSide,
                "--detail": coinDetail,
              }}
            >
              <span
                ref={holeRef}
                className="absolute inset-0 z-10 origin-[50%_70%] scale-0 [transform-style:preserve-3d] [transform:translate3d(0,0,calc(var(--coin-thickness)_*_-2px))]"
              >
                <span className="absolute left-1/2 top-[70%] h-[40%] w-[125%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black [box-shadow:inset_0_2px_hsl(0_0%_20%)]" />
                <span className="absolute left-1/2 top-0 h-[200%] w-[121%] bg-[var(--btn-bg)] [mask:radial-gradient(125%_32%_at_50%_3%,rgba(0,0,0,0)_50%,#fff_50%)] [transform:translate3d(0,0,calc(var(--coin-thickness)_*_5px))] [translate:-50%_25%]" />
              </span>

              <span
                ref={purseRef}
                className="absolute inset-0 [transform-style:preserve-3d] transition-[rotate] duration-[260ms] ease-out group-hover:delay-[120ms] group-hover:[rotate:y_360deg]"
              >
                <span
                  ref={coinRef}
                  className="absolute inset-0 rounded-full [transform-style:preserve-3d]"
                >
                  {RIM_SEGMENTS.map((i) => (
                    <span
                      key={i}
                      style={{ "--i": i }}
                      className="absolute left-1/2 top-1/2 h-[var(--rim-h)] w-[var(--rim-w)] bg-[var(--side)] [transform:rotateZ(calc(var(--i)_*_10deg))_translateY(calc(var(--r)_*_-1))_rotateX(90deg)] [translate:-50%_-50%]"
                    />
                  ))}
                  <span className={frontFace}>{icon}</span>
                  <span className={backFace}>{icon}</span>
                </span>
              </span>
            </span>

            <span>{buttonText}</span>
          </span>
        </button>
      </main>
    </div>
  );
}