"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// ─── ImageScale ───────────────────────────────────────────────────────────────
//
// On load: full-bleed image covers 100% viewport, zero text visible.
// On scroll: section pins, image slides right revealing text beneath,
// counter animates 0 → targetNumber, image scales down, boxes trim.
//
// Mobile (< mobileBreakpoint px): side-by-side layout is replaced with a
// stacked layout — text above, image below. Image scales down on scroll
// and counter still animates, but no horizontal slide (no room).
//
// Requires: npm install gsap
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   "#ffffff"                  Page + box fill
// dividerColor       string   "#ebebeb"                  Center line + box borders
// topline            string   "Our solutions use"        Label above heading
// targetNumber       number   97                         Counter end value
// unit               string   "%"                        Suffix after counter
// headingLine2       string   "less water"               Second line of h2
// headingColor       string   "#000000"                  h2 color at start
// headingColorEnd    string   "#91a052"                  h2 color at end of scroll
// bodyText           string   "Over 600 gallons…"        Paragraph copy
// imageSrc           string   "…field.jpeg"              Image URL
// imageAlt           string   "Scale image"              Image alt text
// scrollDistance     number   1500                       px pinned while scrolling (desktop)
// mobileScrollDist   number   800                        px pinned on mobile
// smoothness         number   2                          ScrollSmoother lag
// fontFamily         string   "sans-serif"               CSS font-family
// toplineFontSize    string   "1.5rem"                   Topline font-size
// headingFontSize    string   "clamp(4rem, 8vw, 12rem)"  h2 font-size
// bodyColor          string   "#82837f"                  Paragraph color
// mobileBreakpoint   number   768                        px below which mobile layout fires
// ──────────────────────────────────────────────────────────────────────────

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function ImageScaleScroller({
  bgColor = "#ffffff",
  dividerColor = "#ebebeb",
  topline = "Our solutions use",
  targetNumber = 97,
  unit = "%",
  headingLine2 = "less water",
  headingColor = "#000000",
  headingColorEnd = "#91a052",
  bodyText = "Over 600 gallons of water is wasted every minute by using outdated methods. Our improved technology reduces both water waste and land needed to grow.",
  imageSrc = "https://assets.codepen.io/2479807/field.jpeg",
  imageAlt = "Scale image",
  scrollDistance = 1500,
  mobileScrollDist = 800,
  smoothness = 2,
  fontFamily = "sans-serif",
  toplineFontSize = "1.5rem",
  headingFontSize = "clamp(2.5rem, 6vw, 12rem)",
  bodyColor = "#82837f",
  mobileBreakpoint = 768,
}) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const sectionRef = useRef(null);
  const imageWrapRef = useRef(null);
  const imageRef = useRef(null);
  const counterRef = useRef(null);
  const headingRef = useRef(null);
  const box1Ref = useRef(null);
  const box2Ref = useRef(null);
  const box3Ref = useRef(null);
  const box4Ref = useRef(null);

  useEffect(() => {
    const els = [
      wrapperRef,
      contentRef,
      sectionRef,
      imageWrapRef,
      imageRef,
      counterRef,
      headingRef,
    ];
    if (els.some((r) => !r.current)) return;

    const isMobile = window.innerWidth < mobileBreakpoint;

    // Stamp initial image position — always starts covering full section
    gsap.set(imageWrapRef.current, { xPercent: 0 });

    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: smoothness,
      effects: true,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        pin: true,
        end: `+=${isMobile ? mobileScrollDist : scrollDistance}`,
        scrub: true,
      },
    });

    // Counter always animates regardless of viewport
    tl.to(
      counterRef.current,
      { duration: 90, textContent: targetNumber, snap: { textContent: 1 } },
      0,
    );

    // Heading color always animates
    tl.to(headingRef.current, { duration: 60, color: headingColorEnd }, 0);

    if (isMobile) {
      // ── Mobile: no horizontal slide, no boxes ──
      // Image scales down in place so user sees content above it
      tl.to(
        imageRef.current,
        { transformOrigin: "bottom center", scale: 0.85, duration: 90 },
        0,
      );
    } else {
      // ── Desktop: full side-by-side reveal ──
      // Image wrapper slides right, exposing left text panel beneath
      tl.fromTo(
        imageWrapRef.current,
        { xPercent: 0 },
        { xPercent: 50, duration: 20 },
        0,
      );

      // Image counter-pans left inside wrapper as wrapper moves right
      tl.to(imageRef.current, { xPercent: -40, duration: 20 }, 0);

      // Image scales down anchored at bottom center
      tl.to(
        imageRef.current,
        { transformOrigin: "bottom center", scale: 0.9, duration: 70 },
        30,
      );

      // Boxes progressively trim the image into a data-card
      tl.to(box1Ref.current, { scaleY: 1, duration: 10 }, 30);
      tl.to(box2Ref.current, { scaleX: 1, duration: 10 }, 40);
      tl.to(box3Ref.current, { scaleY: 0.7, duration: 10 }, 50);
      tl.to(box4Ref.current, { scaleX: 1, duration: 10 }, 60);
    }

    return () => {
      smoother.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [
    smoothness,
    scrollDistance,
    mobileScrollDist,
    targetNumber,
    headingColorEnd,
    mobileBreakpoint,
  ]);

  return (
    <>
      <style>{`
        .is-smooth-wrapper {
          overflow: hidden;
          position: fixed;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
        }
        .is-smooth-content {
          overflow: visible;
          width: 100%;
        }
        .is-heading {
          font-size: ${headingFontSize};
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: ${headingColor};
        }
        .is-topline { font-size: ${toplineFontSize}; }
        .is-body    { color: ${bodyColor}; }
        .is-divider { background-color: ${dividerColor}; }
        .is-box--one { border-bottom: 1px solid ${dividerColor}; }
        .is-box--two { border-left:   1px solid ${dividerColor}; }

        /* Mobile layout: stack text above image */
        @media (max-width: ${mobileBreakpoint - 1}px) {
          .is-text-panel {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            z-index: 4 !important;
            padding: 8vw 6vw 4vw !important;
            background-color: ${bgColor};
          }
          .is-image-wrap {
            position: relative !important;
            width: 100% !important;
            /* On mobile the section is auto height — image is 50vh tall */
            height: 50vh !important;
            z-index: 2 !important;
          }
          .is-section-inner {
            /* Switch from absolute stacking to flex column on mobile */
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh !important;
          }
          /* Hide desktop boxes on mobile — they don't make sense in stacked layout */
          .is-box--one,
          .is-box--two,
          .is-box--three,
          .is-box--four {
            display: none !important;
          }
          /* Hide center divider on mobile */
          .is-divider {
            display: none !important;
          }
        }
      `}</style>

      <div ref={wrapperRef} className="is-smooth-wrapper">
        <div ref={contentRef} className="is-smooth-content">
          <section
            ref={sectionRef}
            className="relative h-screen"
            style={{ backgroundColor: bgColor, fontFamily }}
          >
            {/* Center vertical divider — desktop only, hidden via media query above */}
            <div className="is-divider absolute top-0 left-1/2 w-px h-full -translate-x-px z-0" />

            {/* Overlay boxes — desktop only, hidden on mobile via media query */}
            <div
              ref={box1Ref}
              className="is-box--one absolute z-[3] top-0 left-1/2 h-1/2 w-1/2 origin-top [transform:scaleY(0)]"
              style={{ backgroundColor: bgColor }}
            />
            <div
              ref={box2Ref}
              className="is-box--two absolute z-[3] top-1/2 left-3/4 w-1/4 h-1/2 origin-right [transform:scaleX(0)]"
              style={{ backgroundColor: bgColor }}
            />
            <div
              ref={box3Ref}
              className="is-box--three absolute z-[3] top-1/2 left-1/2 w-1/4 h-1/2 origin-bottom [transform:scaleY(0)]"
              style={{ backgroundColor: bgColor }}
            />
            <div
              ref={box4Ref}
              className="is-box--four absolute z-[3] top-1/2 left-1/2 w-[12.5%] h-1/4 origin-left [transform:scaleX(0)]"
              style={{ backgroundColor: bgColor }}
            />

            {/*
              is-section-inner switches from position:relative (desktop absolute children)
              to flex-col on mobile so text stacks above image naturally.
              On desktop: h-full + relative so absolute children position against it.
            */}
            <div className="is-section-inner relative w-full h-full">
              {/*
                Text panel:
                Desktop — absolute z-[1], w-1/2, hidden under image until slide.
                Mobile  — relative, w-full, sits above image in flex-col flow.
                Both breakpoints: overridden by the media query in <style>.
              */}
              <div className="is-text-panel absolute top-0 left-0 z-[1] w-1/2 h-full flex flex-col justify-center pl-[6%] pr-[4%]">
                <span className="is-topline block mb-4">{topline}</span>
                <h2 ref={headingRef} className="is-heading font-normal mb-10">
                  <span ref={counterRef}>0</span>
                  {unit}
                  <br />
                  {headingLine2}
                </h2>
                <p className="is-body max-w-[50ch] leading-relaxed">
                  {bodyText}
                </p>
              </div>

              {/*
                Image wrapper:
                Desktop — absolute z-[2], covers full section (full bleed on load).
                Mobile  — relative, 50vh tall, sits below text in flex-col flow.
              */}
              <div
                ref={imageWrapRef}
                className="is-image-wrap absolute top-0 left-0 z-[2] w-full h-full overflow-hidden"
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt={imageAlt}
                  className="block w-full h-full object-cover"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
