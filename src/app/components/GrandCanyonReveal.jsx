"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── SliceReveal ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides           array    [...]             Slide objects { titleOne, titleTwo, photo }
// fontFamily       string   Valencia Regular   Title font-family name
// fontUrl          string   https://...otf     Remote font file used for @font-face
// bgColor          string   #141419            Page background
// titleColor       string   grey               Title text color
// titleFontSize    number   300                Title font size (px)
// titleWidth       number   500                Title block width (px)
// stripCount       number   8                  Number of mask strips
// stripSpacing     number   8                  X offset between strips (viewBox units)
// stripWidth       string   5%                 Width of each mask strip
// fadeDuration     number   1                  Title fade in/out duration (s)
// wipeInDuration   number   1                  Initial strip wipe duration (s)
// sweepDuration    number   4                  Strip sweep duration per leg (s)
// wipeOutDuration  number   1                  Closing strip wipe duration (s)
// wipeStart        number   160                Strip xPercent after first wipe
// wipeMid          number   760                Strip xPercent at sweep peak
// wipeEnd          number   200                Strip xPercent before close
// slideInterval    number   10000              Time between slide swaps (ms)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    titleOne: "GRAND",
    titleTwo: "CANYON",
    photo: "https://assets.codepen.io/489403/grand_canyon.jpeg",
  },
  {
    titleOne: "VENICE",
    titleTwo: "BEACH",
    photo: "https://assets.codepen.io/489403/venice_beach.jpeg",
  },
  {
    titleOne: "NEW",
    titleTwo: "YORK",
    photo: "https://assets.codepen.io/489403/new_york.jpeg",
  },
];

export default function GrandCanyonReveal({
  slides = DEFAULT_SLIDES,
  fontFamily = "Valencia Regular",
  fontUrl = "https://assets.codepen.io/489403/ValenciaRegular.otf",
  bgColor = "#141419",
  titleColor = "grey",
  titleFontSize = 300,
  titleWidth = 500,
  stripCount = 8,
  stripSpacing = 8,
  stripWidth = "5%",
  fadeDuration = 1,
  wipeInDuration = 1,
  sweepDuration = 4,
  wipeOutDuration = 1,
  wipeStart = 160,
  wipeMid = 760,
  wipeEnd = 200,
  slideInterval = 10000,
}) {
  const rootRef = useRef(null);
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const maskId = "sliceMask" + uid;
  const titleClass = "sliceTitle" + uid;
  const stripClass = "sliceStrip" + uid;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    }, slideInterval);
    return () => clearInterval(id);
  }, [slides.length, slideInterval]);

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

    let ctx;
    let cancelled = false;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        if (cancelled) return;
        const { gsap } = window;
        if (!gsap || !rootRef.current) return;

        gsap.config({ trialWarn: false });

        ctx = gsap.context(() => {
          const tl = gsap.timeline({ repeat: -1, repeatRefresh: true });

          tl.to("." + titleClass, {
            duration: fadeDuration,
            autoAlpha: 1,
          })
            .to(
              "." + stripClass,
              {
                xPercent: wipeStart,
                ease: "none",
                duration: wipeInDuration,
                fill: "white",
              },
              "-=" + fadeDuration,
            )
            .to("." + stripClass, {
              xPercent: wipeMid,
              ease: "none",
              duration: sweepDuration,
              fill: "white",
            })
            .to("." + stripClass, {
              xPercent: wipeEnd,
              ease: "none",
              duration: sweepDuration,
              fill: "white",
            })
            .to("." + stripClass, {
              xPercent: 0,
              ease: "none",
              duration: wipeOutDuration,
              fill: "black",
            })
            .to(
              "." + titleClass,
              {
                ease: "none",
                duration: fadeDuration,
                autoAlpha: 0,
              },
              "-=" + fadeDuration,
            );
        }, rootRef);
      })
      .catch((e) =>
        console.error("[SliceReveal] GSAP load failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
    };
  }, [
    titleClass,
    stripClass,
    fadeDuration,
    wipeInDuration,
    sweepDuration,
    wipeOutDuration,
    wipeStart,
    wipeMid,
    wipeEnd,
  ]);

  const fontFaceCss =
    "@font-face {" +
    'font-family: "' +
    fontFamily +
    '";' +
    'src: url("' +
    fontUrl +
    '");' +
    "}";

  const titleStyle = {
    fontFamily: fontFamily,
    fontSize: titleFontSize + "px",
    width: titleWidth + "px",
    color: titleColor,
    opacity: 0,
  };

  const current = slides[index] || slides[0];

  return (
    <div
      ref={rootRef}
      className="w-screen h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <style>{fontFaceCss}</style>

      <div className="flex items-center justify-center w-screen h-screen max-h-[800px] max-w-[1280px] min-h-[600px] min-w-[1000px]">
        <h1 className={titleClass + " text-center p-5"} style={titleStyle}>
          {current.titleOne}
        </h1>

        <svg viewBox="0 0 100 100" className="w-1/2">
          <mask id={maskId}>
            {Array.from({ length: stripCount }).map((_, i) => (
              <rect
                key={i}
                className={stripClass}
                x={i * stripSpacing}
                y="0"
                width={stripWidth}
                height="100%"
                fill="black"
              />
            ))}
          </mask>
          <image
            x="0"
            y="0"
            width="100%"
            height="100%"
            href={current.photo}
            preserveAspectRatio="xMidYMid slice"
            mask={`url(#${maskId})`}
          />
        </svg>

        <h1 className={titleClass + " text-center p-5"} style={titleStyle}>
          {current.titleTwo}
        </h1>
      </div>
    </div>
  );
}
