"use client";

import { useEffect, useRef, useState } from "react";

// ─── FullscreenColumnMorph ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            array    [...]        Column image URLs (odd count works best)
// currentIndex      number   2            Index shown as the fullscreen preview
// title             string   Adventure    Cover title, split into animated chars
// buttonLabel       string   Toggle...    Label on the toggle button
// startOpen         bool     true         Start on the fullscreen preview
// bgColor           string   #010101      Base background color
// bgColor2          string   #272b31      Mid stop of the background gradient
// titleColor        string   #ffffff      Cover title color
// titleSize         string   11vw         Cover title font size
// titleWeight       number   600          Cover title font weight
// titleTracking     string   -0.01em      Cover title letter spacing
// uppercase         bool     true         Uppercase the cover title
// buttonBg          string   #ffffff      Button background
// buttonColor       string   #1e2f32      Button text color
// clipLeft          number   39           Left edge of the narrowed clip (%)
// clipRight         number   61           Right edge of the narrowed clip (%)
// columnGap         string   0            Gap between the full-height columns
// columnRadius      string   0            Corner radius of the columns
// previewScale      number   1.25         Image scale while the columns show
// perspective       number   1000         Px perspective applied to the column rail
// rotateY           number   60           Degrees each side column folds inward
// columnOpacity     number   0.7          Resting opacity of the side columns
// exitScale         number   0.8          Scale columns shrink to when closing
// duration          number   1.2          Base timeline duration, opening (s)
// closeDuration     number   1            Base timeline duration, closing (s)
// foldDuration      number   0.7          Duration of the column unfold (s)
// foldDelay         number   0.45         Delay before the columns unfold (s)
// charStagger       number   0.3          Stagger spread for the char collapse
// columnStagger     number   0.2          Stagger spread for the column unfold
// easeIn            string   power4.inOut Ease used when revealing the columns
// easeOut           string   expo         Ease used when returning to fullscreen
// flashFilter       bool     true         Brightness/saturation pulse on return
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1200&q=80",
];

export default function FullscreenColumnMorph({
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
  const stateRef = useRef({ open: startOpen, animating: false });
  const [ready, setReady] = useState(false);

  const chars = String(title).split("");
  const safeIndex = Math.min(Math.max(currentIndex, 0), images.length - 1);

  const FULL_CLIP = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const NARROW_CLIP = `polygon(${clipLeft}% 0%, ${clipRight}% 0%, ${clipRight}% 100%, ${clipLeft}% 100%)`;

  const otherSlides = () =>
    slideRefs.current.filter((el, i) => el && i !== safeIndex);

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

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap) return;
        gsapRef.current = gsap;

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
        setReady(true);
      })
      .catch((e) =>
        console.error("[FullscreenColumnMorph] GSAP load failed:", e.message),
      );
  }, []);

  const showSlider = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const st = stateRef.current;
    st.animating = true;
    const slides = otherSlides();

    gsap
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
      );
  };

  const showPreview = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const st = stateRef.current;
    st.animating = true;
    const slides = otherSlides();

    const tl = gsap
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
      className="relative grid h-screen w-full overflow-hidden"
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
