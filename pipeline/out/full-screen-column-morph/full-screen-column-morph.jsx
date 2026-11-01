"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1200&q=80",
];

export default function FullScreenColumnMorph({
  className = "",
  images = DEFAULT_IMAGES,
  currentIndex = 2,
  title = "Adventure",
  buttonLabel = "Toggle effect",
  startOpen = true,
  bgColor = "#010101",
  bgColor2 = "#272b31",
  titleColor = "#ffffff",
  titleSize = "11vw",
  titleWeight = 600,
  titleTracking = "-0.01em",
  uppercase = true,
  buttonBg = "#ffffff",
  buttonColor = "#1e2f32",
  clipLeft = 39,
  clipRight = 61,
  columnGap = "0",
  columnRadius = "0",
  previewScale = 1.25,
  perspective = 1000,
  rotateY = 60,
  columnOpacity = 0.7,
  exitScale = 0.8,
  duration = 1.2,
  closeDuration = 1,
  foldDuration = 0.7,
  foldDelay = 0.45,
  charStagger = 0.3,
  columnStagger = 0.2,
  easeIn = "power4.inOut",
  easeOut = "expo",
  flashFilter = true,
}) {
  const railRef = useRef(null);
  const clipRef = useRef(null);
  const clipImgRef = useRef(null);
  const slideRefs = useRef([]);
  const charRefs = useRef([]);
  const gsapRef = useRef(null);
  const ctxRef = useRef(null);
  const stateRef = useRef({ open: startOpen, animating: false });
  const [ready, setReady] = useState(false);

  const chars = String(title).split("");
  const safeIndex = Math.min(Math.max(currentIndex, 0), images.length - 1);

  const FULL_CLIP = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const NARROW_CLIP = `polygon(${clipLeft}% 0%, ${clipRight}% 0%, ${clipRight}% 100%, ${clipLeft}% 100%)`;

  const otherSlides = () =>
    slideRefs.current.filter((el, i) => el && i !== safeIndex);

  useEffect(() => {
    let cancelled = false;
    let ctx = null;

    import("gsap").then((mod) => {
      if (cancelled) return;
      const gsap = mod.gsap || mod.default;
      gsapRef.current = gsap;
      ctx = gsap.context(() => {
        const open = stateRef.current.open;
        gsap.set(railRef.current, { perspective });
        gsap.set(charRefs.current.filter(Boolean), {
          transformOrigin: "0% 50%",
          scaleX: open ? 1 : 0,
        });
        gsap.set(clipRef.current, { clipPath: open ? FULL_CLIP : NARROW_CLIP });
        gsap.set(clipImgRef.current, { scale: open ? 1 : previewScale });
        gsap.set(otherSlides(), {
          opacity: open ? 0 : columnOpacity,
          scale: open ? exitScale : 1,
          rotationY: 0,
        });
      });
      ctxRef.current = ctx;
      setReady(true);
    });

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
      ctxRef.current = null;
      gsapRef.current = null;
    };
  }, []);

  const showSlider = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const st = stateRef.current;
    st.animating = true;
    const slides = otherSlides();

    const ctx = ctxRef.current;
    ctx.add(() => gsap
      .timeline({
        defaults: { duration, ease: easeIn },
        onComplete: () => (st.animating = false),
      })
      .addLabel("start", 0)
      .set(railRef.current, { perspective })
      .set(clipRef.current, { willChange: "clip-path" })
      .set(charRefs.current.filter(Boolean), { transformOrigin: "0% 50%" })
      .fromTo(
        clipRef.current,
        { clipPath: FULL_CLIP },
        { clipPath: NARROW_CLIP },
        "start",
      )
      .to(clipImgRef.current, { scale: previewScale }, "start")
      .set(
        slides,
        {
          transformOrigin: (position, _, arr) =>
            position < arr.length / 2 ? "100% 50%" : "0% 50%",
          rotationY: (position, _, arr) =>
            position < arr.length / 2 ? -rotateY : rotateY,
          scale: 1,
        },
        "start",
      )
      .to(
        slides,
        {
          duration: foldDuration,
          ease: "expo",
          opacity: columnOpacity,
          rotationY: 0,
          stagger: { amount: columnStagger, from: "center" },
        },
        `start+=${foldDelay}`,
      )
      .to(
        charRefs.current.filter(Boolean),
        {
          duration: 1,
          scaleX: 0,
          stagger: { amount: charStagger, from: "0" },
        },
        "start",
      ));
  };

  const showPreview = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const st = stateRef.current;
    st.animating = true;
    const slides = otherSlides();

    let tl;
    ctxRef.current.add(() => {
    tl = gsap
      .timeline({
        defaults: { duration: closeDuration, ease: easeOut },
        onComplete: () => (st.animating = false),
      })
      .addLabel("start", 0)
      .set(clipRef.current, { willChange: "clip-path" })
      .to(slides, { opacity: 0, scale: exitScale }, "start")
      .to(clipImgRef.current, { scale: 1 }, "start")
      .fromTo(
        clipRef.current,
        { clipPath: NARROW_CLIP },
        { clipPath: FULL_CLIP },
        "start+=0.1",
      );
    });

    if (flashFilter) {
      tl.fromTo(
        clipImgRef.current,
        { filter: "brightness(100%) saturate(100%)" },
        {
          duration: 0.2,
          ease: "none",
          filter: "brightness(200%) saturate(200%)",
        },
        "start+=0.1",
      ).to(
        clipImgRef.current,
        {
          duration: 0.8,
          ease: "power1",
          filter: "brightness(100%) saturate(100%)",
        },
        "start+=0.3",
      );
    }

    tl.to(
      charRefs.current.filter(Boolean),
      {
        scaleX: 1,
        stagger: { amount: 0.15, from: "end" },
      },
      "start",
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
        ref={railRef}
        className="pointer-events-none grid h-screen items-center justify-center justify-items-center"
        style={{
          gridArea: "1 / 1 / -1 / -1",
          gridTemplateColumns: `repeat(${images.length}, 1fr)`,
          gap: columnGap,
          alignContent: "center",
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            ref={(el) => (slideRefs.current[i] = el)}
            className="grid h-screen w-full overflow-hidden"
            style={{
              borderRadius: columnRadius,
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
          clipPath: startOpen ? FULL_CLIP : NARROW_CLIP,
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
