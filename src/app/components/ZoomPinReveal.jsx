"use client";

import { useEffect, useId, useRef } from "react";

// ─── ZoomPinReveal ───────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgImage          string   unsplash city   Background hero image (behind, faux depth layer)
// bgSize           string   cover           CSS background-size for the hero layer
// bgPosition       string   center center   CSS background-position for the hero layer
// foregroundImage  string   home image      Foreground image that zooms toward the viewer
// pinEnd           string   "+=150%"        ScrollTrigger end value (scroll distance while pinned)
// scrub            boolean  true            Whether the timeline scrubs with scroll position
// markers          boolean  false           Show ScrollTrigger debug markers
// imgScale         number   2               Final scale applied to the foreground image
// imgZ             number   350             Final translateZ (px) applied to the foreground image, drives the "zoom past camera" feel
// perspective      number   500             CSS perspective (px) on the image container, controls how strong the z-translate looks
// heroScale        number   1.1             Final scale applied to the background hero section
// ease             string   power1.inOut    GSAP ease used for both tweens
// ──────────────────────────────────────────────────────────────────────────

export default function ZoomPinReveal({
  bgImage = "https://images.unsplash.com/photo-1589848315097-ba7b903cc1cc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  bgSize = "cover",
  bgPosition = "center center",
  foregroundImage = "https://assets-global.website-files.com/63ec206c5542613e2e5aa784/643312a6bc4ac122fc4e3afa_main%20home.webp",
  pinEnd = "+=150%",
  scrub = true,
  markers = false,
  imgScale = 2,
  imgZ = 350,
  perspective = 500,
  heroScale = 1.1,
  ease = "power1.inOut",
}) {
  const uid = useId().replace(/:/g, "");
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);
  const imgRef = useRef(null);

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

    let st;

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
    ])
      .then(() => {
        const { gsap } = window;
        if (!gsap || !wrapperRef.current || !imgRef.current || !heroRef.current)
          return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(window.ScrollTrigger);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: pinEnd,
            pin: true,
            scrub,
            markers,
          },
        });

        tl.to(imgRef.current, {
          scale: imgScale,
          z: imgZ,
          transformOrigin: "center center",
          ease,
        }).to(
          heroRef.current,
          {
            scale: heroScale,
            transformOrigin: "center center",
            ease,
          },
          "<",
        );

        st = tl.scrollTrigger;
      })
      .catch((e) =>
        console.error("[ZoomPinReveal] GSAP load failed:", e.message),
      );

    return () => {
      if (st) st.kill();
    };
  }, [pinEnd, scrub, markers, imgScale, imgZ, heroScale, ease]);

  return (
    <div ref={wrapperRef} className="relative w-full z-[1]">
      <div className="relative w-full overflow-x-hidden z-[1]">
        <section
          ref={heroRef}
          className="w-full h-screen bg-no-repeat"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: bgSize,
            backgroundPosition: bgPosition,
          }}
        />
      </div>

      <div
        className="absolute inset-0 z-[2] w-full h-screen overflow-hidden"
        style={{ perspective: `${perspective}px` }}
      >
        <img
          ref={imgRef}
          src={foregroundImage}
          alt={`zoom-pin-reveal-${uid}`}
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
