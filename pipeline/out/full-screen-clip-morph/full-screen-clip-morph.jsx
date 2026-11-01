"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1200&q=80",
];

export default function FullScreenClipMorph({
  images = DEFAULT_IMAGES,
  currentIndex = 2,
  title = "Monom",
  buttonLabel = "Toggle effect",
  startOpen = true,
  bgColor = "#3d4a54",
  bgColor2 = "#38454d",
  titleColor = "#fcf8ec",
  titleSize = "11vw",
  titleWeight = 700,
  titleTracking = "-0.02em",
  uppercase = true,
  buttonBg = "#151c1e",
  buttonColor = "#ece1d4",
  charSpread = 80,
  insetY = 22,
  insetX = 39,
  clipRadius = "23vw",
  slideRadius = "23vw",
  slideHeight = "56vh",
  slideWidth = "22%",
  slideGap = "2.5vw",
  previewScale = 1.2,
  pushDistance = 800,
  skewAmount = 25,
  scaleXAmount = 5,
  duration = 1.2,
  staggerAmount = 0.1,
  easeIn = "power4.inOut",
  easeOut = "expo.inOut",
  flashFilter = true,
  className = "",
}) {
  const clipRef = useRef(null);
  const clipImgRef = useRef(null);
  const slideRefs = useRef([]);
  const charRefs = useRef([]);
  const gsapRef = useRef(null);
  const tlRef = useRef(null);
  const stateRef = useRef({ open: startOpen, animating: false });
  const [ready, setReady] = useState(false);

  const chars = String(title).split("");
  const safeIndex = Math.min(Math.max(currentIndex, 0), images.length - 1);

  const otherSlides = () =>
    slideRefs.current.filter((el, i) => el && i !== safeIndex);

  useEffect(() => {
    let cancelled = false;

    import("gsap").then((mod) => {
      if (cancelled) return;
      const gsap = mod.gsap || mod.default;
      gsapRef.current = gsap;

      const active = charRefs.current.filter(Boolean);
      const open = stateRef.current.open;

      gsap.set(active, {
        x: (position, _, arr) =>
          open ? (position - Math.floor(arr.length / 2)) * charSpread : 0,
      });
      gsap.set(clipRef.current, {
        clipPath: open
          ? "inset(0% 0% round 0vw)"
          : `inset(${insetY}% ${insetX}% round ${clipRadius})`,
      });
      gsap.set(clipImgRef.current, { scale: open ? 1 : previewScale });
      gsap.set(otherSlides(), { opacity: open ? 0 : 1 });
      setReady(true);
    });

    return () => {
      cancelled = true;
      const gsap = gsapRef.current;
      if (tlRef.current) tlRef.current.kill();
      if (gsap) {
        gsap.killTweensOf([
          clipRef.current,
          clipImgRef.current,
          ...charRefs.current.filter(Boolean),
          ...slideRefs.current.filter(Boolean),
        ]);
      }
    };
  }, []);

  const showSlider = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const st = stateRef.current;
    st.animating = true;
    const slides = otherSlides();

    tlRef.current = gsap
      .timeline({
        defaults: { duration, ease: easeIn },
        onComplete: () => (st.animating = false),
      })
      .addLabel("start", 0)
      .set(clipRef.current, { willChange: "clip-path" })
      .to(
        clipRef.current,
        { clipPath: `inset(${insetY}% ${insetX}% round ${clipRadius})` },
        "start",
      )
      .to(clipImgRef.current, { scale: previewScale }, "start")
      .set(
        slides,
        {
          transformOrigin: (position, _, arr) =>
            position < arr.length / 2 ? "100% 50%" : "0% 50%",
          x: (position, _, arr) => {
            const p = position < arr.length / 2 ? position : position + 1;
            return pushDistance * (p - arr.length / 2);
          },
          scaleX: scaleXAmount,
          skewX: (position, _, arr) =>
            position < arr.length / 2 ? skewAmount : -skewAmount,
        },
        "start",
      )
      .fromTo(
        slides,
        { opacity: 0 },
        {
          duration: duration + 0.2,
          stagger: { amount: staggerAmount, from: "center" },
          opacity: 1,
          x: 0,
          scaleX: 1,
          skewX: 0,
        },
        "start",
      )
      .to(
        charRefs.current.filter(Boolean),
        {
          duration: duration + 0.2,
          x: 0,
          stagger: { grid: "auto", amount: staggerAmount, from: "center" },
        },
        "start",
      );
  };

  const showPreview = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const st = stateRef.current;
    st.animating = true;
    const slides = otherSlides();

    const tl = (tlRef.current = gsap
      .timeline({
        defaults: { duration, ease: easeOut },
        onComplete: () => (st.animating = false),
      })
      .addLabel("start", 0)
      .set(clipRef.current, { willChange: "clip-path" })
      .to(
        slides,
        {
          stagger: { amount: staggerAmount, from: "edges" },
          opacity: 0,
          x: (position, _, arr) => {
            const p = position < arr.length / 2 ? position : position + 1;
            return pushDistance * (p - arr.length / 2);
          },
          scaleX: 2,
          skewX: (position, _, arr) =>
            position < arr.length / 2 ? skewAmount : -skewAmount,
        },
        "start",
      )
      .to(clipImgRef.current, { scale: 1 }, "start+=0.15")
      .fromTo(
        clipRef.current,
        { clipPath: `inset(${insetY}% ${insetX}% round ${clipRadius})` },
        { clipPath: "inset(0% 0% round 0vw)" },
        "start+=0.25",
      ));

    if (flashFilter) {
      tl.fromTo(
        clipImgRef.current,
        { filter: "brightness(100%) saturate(100%)" },
        {
          duration: 0.4,
          ease: "power1.in",
          filter: "brightness(200%) saturate(200%)",
        },
        "start+=0.25",
      ).to(
        clipImgRef.current,
        {
          duration: 0.8,
          ease: "power1",
          filter: "brightness(100%) saturate(100%)",
        },
        "start+=0.65",
      );
    }

    tl.to(
      charRefs.current.filter(Boolean),
      {
        duration: duration + 0.2,
        x: (position, _, arr) =>
          (position - Math.floor(arr.length / 2)) * charSpread,
      },
      "start+=0.15",
    );
  };

  const toggle = () => {
    const st = stateRef.current;
    if (st.animating || !gsapRef.current) return;
    if (st.open) showSlider();
    else showPreview();
    st.open = !st.open;
  };

  return (
    <div
      className={`relative grid h-screen w-full overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(0deg, ${bgColor}, ${bgColor2}, ${bgColor})`,
      }}
    >
      <div
        className="pointer-events-none grid h-screen items-center justify-center justify-items-center"
        style={{
          gridArea: "1 / 1 / -1 / -1",
          gridTemplateColumns: `repeat(${images.length}, ${slideWidth})`,
          gap: slideGap,
          alignContent: "center",
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            ref={(el) => (slideRefs.current[i] = el)}
            className="grid w-full overflow-hidden"
            style={{
              height: slideHeight,
              borderRadius: slideRadius,
              opacity: 0,
              visibility: i === safeIndex ? "hidden" : "visible",
            }}
          >
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${src})` }}
            />
          </div>
        ))}
      </div>

      <div
        ref={clipRef}
        className="grid"
        style={{
          gridArea: "1 / 1 / -1 / -1",
          clipPath: startOpen
            ? "inset(0% 0% round 0vw)"
            : `inset(${insetY}% ${insetX}% round ${clipRadius})`,
        }}
      >
        <div
          ref={clipImgRef}
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${images[safeIndex]})` }}
        />
      </div>

      <div
        className="z-[100] grid justify-center"
        style={{ gridArea: "1 / 1 / -1 / -1", gridTemplateRows: "1fr auto" }}
      >
        <h2
          className={
            "pointer-events-none m-0 mt-[10vh] self-center whitespace-nowrap leading-none " +
            (uppercase ? "uppercase" : "")
          }
          style={{
            color: titleColor,
            fontSize: titleSize,
            fontWeight: titleWeight,
            letterSpacing: titleTracking,
          }}
        >
          {chars.map((c, i) => (
            <span
              key={i}
              ref={(el) => (charRefs.current[i] = el)}
              className="inline-block"
            >
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
        </h2>

        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          className="mb-12 w-min cursor-pointer justify-self-center whitespace-nowrap rounded-[4rem] border-0 px-8 py-4 text-sm uppercase tracking-wide outline-none transition-opacity disabled:opacity-40"
          style={{ background: buttonBg, color: buttonColor }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
