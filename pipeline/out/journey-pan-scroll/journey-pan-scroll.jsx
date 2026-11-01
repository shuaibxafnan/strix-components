"use client";

import { useEffect, useRef, useId } from "react";

const DEFAULT_CHAPTERS = [
  {
    eyebrow: "01 — DEPARTURE",
    title: "Every trail starts as a single decision to leave.",
  },
  {
    eyebrow: "02 — THE CLIMB",
    title: "Elevation changes how a place sounds, not just how it looks.",
  },
  {
    eyebrow: "03 — THE RIDGE",
    title: "From up here, the map finally agrees with the ground.",
  },
  {
    eyebrow: "04 — THE DESCENT",
    title: "Going down is its own kind of skill.",
  },
  {
    eyebrow: "05 — THE VALLEY",
    title: "Everything you climbed for is waiting quietly below.",
  },
  {
    eyebrow: "06 — ARRIVAL",
    title: "The journey ends where the next one starts.",
  },
];

const DEFAULT_PATH_SEGMENTS = [
  { d: "M196 434c66-49 230 44 322 18", rotate: -5, scale: 2.5 },
  { d: "M518 452c22-1 228 65 303 56", rotate: 8, scale: 3.3 },
  { d: "M821 508s-81 263-18 399", rotate: -4, scale: 2.75 },
  { d: "M803 907s-238-64-317-47", rotate: 5, scale: 2 },
  { d: "M486 860s-160 76-298 17", rotate: -5, scale: 3 },
];

export default function JourneyPanScroll({
  className = "",
  imageUrl = "https://images.unsplash.com/photo-1771681617105-745758eae89b?q=80&w=3000",
  imageWidth = 1000,
  bgColor = "#000",
  panelRadius = "2.5vh",
  vignetteColor = "#0A0A08",
  vignetteOpacity = 0.35,
  accentColor = "#6FA39A",
  textColor = "#F4EFE6",
  fontDisplay = "Instrument Serif",
  fontMono = "Space Mono",
  showRoutePaths = false,
  chapters = DEFAULT_CHAPTERS,
  pathSegments = DEFAULT_PATH_SEGMENTS,
  initialX = 500,
  initialY = 500,
  initialScale = 3.2,
  initialRotate = 20,
  followDuration = 1.3,
  followEase = "expo",
  segmentEase = "sine.inOut",
  segmentDuration = 1,
  scrubAmount = 1,
}) {
  const uid = useId().replace(/:/g, "");
  const scrollerRef = useRef(null);
  const firstSectionRef = useRef(null);
  const lastSectionRef = useRef(null);
  const povScaleRef = useRef(null);
  const povPanRef = useRef(null);
  const focalRef = useRef(null);
  const pathsWrapRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/MotionPathPlugin"),
    ])
      .then(([gsapMod, stMod, mpMod]) => {
        if (cancelled || !scrollerRef.current) return;
        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const MotionPathPlugin = mpMod.MotionPathPlugin || mpMod.default;

        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

        const ctx = gsap.context(() => {
          const pathEls = pathsWrapRef.current
            ? pathsWrapRef.current.querySelectorAll("path")
            : [];
          const focalEl = focalRef.current;

          const xTo = gsap.quickTo(povPanRef.current, "x", {
            duration: followDuration,
            ease: followEase,
          });
          const yTo = gsap.quickTo(povPanRef.current, "y", {
            duration: followDuration,
            ease: followEase,
          });

          const tl = gsap
            .timeline({
              scrollTrigger: {
                scroller: scrollerRef.current,
                trigger: firstSectionRef.current,
                endTrigger: lastSectionRef.current,
                start: "0 0",
                end: "100% 100%",
                scrub: scrubAmount,
              },
              onUpdate: () => {
                xTo(-gsap.getProperty(focalEl, "x"));
                yTo(-gsap.getProperty(focalEl, "y"));
              },
              defaults: { duration: segmentDuration, ease: "none" },
            })
            .fromTo(
              povScaleRef.current,
              {
                x: initialX,
                y: initialY,
                scale: initialScale,
                rotate: initialRotate,
              },
              {
                rotate: pathSegments[0]?.rotate ?? initialRotate,
                scale: pathSegments[0]?.scale ?? initialScale,
                ease: segmentEase,
              },
              0,
            );

          if (pathEls[0]) {
            tl.to(
              focalEl,
              { motionPath: pathEls[0], immediateRender: true },
              0,
            );
          }

          pathSegments.forEach((seg, i) => {
            if (i === 0) return;
            const at = i;
            if (pathEls[i]) {
              tl.to(focalEl, { motionPath: pathEls[i] }, at);
            }
            tl.to(
              povScaleRef.current,
              { rotate: seg.rotate, scale: seg.scale, ease: segmentEase },
              at,
            );
          });

          gsap.set(povPanRef.current, {
            x: -gsap.getProperty(focalEl, "x"),
            y: -gsap.getProperty(focalEl, "y"),
          });
        }, scrollerRef);

        ctxRef.current = ctx;
      })
      .catch((e) =>
        console.error("[JourneyPanScroll] GSAP load failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
    };
  }, [
    followDuration,
    followEase,
    segmentEase,
    segmentDuration,
    scrubAmount,
    initialX,
    initialY,
    initialScale,
    initialRotate,
    pathSegments,
  ]);

  return (
    <div className={"relative w-screen h-screen " + className}>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap');" +
            ".sjp-" +
            uid +
            "-title{font-family:'" +
            fontDisplay +
            "',serif;}" +
            ".sjp-" +
            uid +
            "-mono{font-family:'" +
            fontMono +
            "',monospace;}" +
            "html{scrollbar-width:none;}" +
            ".sjp-" +
            uid +
            "-main::-webkit-scrollbar{display:none;}",
        }}
      />

      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        <svg
          className="absolute left-[25%] top-[5%] w-1/2 h-[90%] max-[1024px]:left-[9%] max-[1024px]:w-[82%] overflow-hidden"
          style={{ borderRadius: panelRadius }}
          viewBox={"0 0 " + imageWidth + " " + imageWidth}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id={"sjp-vignette-" + uid}>
              <stop offset="55%" stopColor={vignetteColor} stopOpacity="0" />
              <stop
                offset="100%"
                stopColor={vignetteColor}
                stopOpacity={vignetteOpacity}
              />
            </radialGradient>
          </defs>

          <g ref={povScaleRef}>
            <g ref={povPanRef}>
              <image href={imageUrl} width={imageWidth} />
              <g
                ref={pathsWrapRef}
                fill="none"
                stroke={accentColor}
                strokeWidth="2"
                opacity={showRoutePaths ? 0.5 : 0}
              >
                {pathSegments.map((seg, i) => (
                  <path key={i} d={seg.d} />
                ))}
              </g>
              <circle ref={focalRef} r="0" />
            </g>
          </g>

          <rect
            x="0"
            y="0"
            width={imageWidth}
            height={imageWidth}
            fill={"url(#sjp-vignette-" + uid + ")"}
          />
        </svg>
      </div>

      <main
        ref={scrollerRef}
        className={
          "sjp-" +
          uid +
          "-main relative w-screen h-screen overflow-y-scroll [scroll-snap-type:y_mandatory] [overscroll-behavior:none]"
        }
      >
        {chapters.map((ch, i) => (
          <section
            key={i}
            ref={
              i === 0
                ? firstSectionRef
                : i === chapters.length - 1
                  ? lastSectionRef
                  : null
            }
            className="relative left-0 top-0 w-full min-h-screen [scroll-snap-align:center] flex items-end justify-start p-[6%] sm:p-[8%]"
          >
            <div className="max-w-md">
              <span
                className={
                  "sjp-" + uid + "-mono block text-xs tracking-[0.25em] mb-3"
                }
                style={{ color: accentColor }}
              >
                {ch.eyebrow}
              </span>
              <h2
                className={
                  "sjp-" + uid + "-title text-3xl sm:text-4xl leading-snug"
                }
                style={{ color: textColor }}
              >
                {ch.title}
              </h2>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
