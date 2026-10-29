"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const IMAGES = [
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/cat.png",
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/finch.png",
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/dog.png",
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/owl.png",
];

const DEFAULT_SLIDES = [
  { image: IMAGES[0], alt: "Simba", title: "Simba", color: "#facb7a", visibleArea: 0.85 },
  { image: IMAGES[1], alt: "Anette", title: "Anette", color: "#d06690", visibleArea: 0.8 },
  { image: IMAGES[2], alt: "Matuba", title: "Matuba", color: "#9ccc65", visibleArea: 0.75 },
  { image: IMAGES[3], alt: "Boris", title: "Boris", color: "#90a4ae", visibleArea: 0.8 },
];

const lineEq = (y2, y1, x2, x1, v) => {
  const m = (y2 - y1) / (x2 - x1);
  return m * v + (y1 - m * x1);
};

export default function MirrorSlideshow({
  slides = DEFAULT_SLIDES,
  layout = "horizontal",
  bgColor = "#111111",
  mirrorWidth = "60vw",
  mirrorMaxWidth = "1100px",
  mirrorOpacity = 1,
  mirrorBlendMode = "normal",
  imgMaxHeight = "none",
  sideRotation = -15,
  showDuration = 1.5,
  hideDuration = 1,
  showEase = "expo.out",
  hideEase = "quint.out",
  titleShowDuration = 1.5,
  titleHideDuration = 0.5,
  titleShowDelay = 0.25,
  titleHideDelay = 0,
  titleAnimation = "vertical",
  titleOffset = 50,
  titleSize = "6vw",
  titleFont = "ui-serif, serif",
  enableTilt = false,
  tiltFactor = 0.6,
  tiltRotation = 10,
  heading = "Maitri Animal Sanctuary",
  headingColor = "#ffffff",
  showHeading = true,
  navPosition = "bottom-right",
  navColor = "#909090",
  navActiveColor = "inherit",
  showNav = true,
  enableKeyboard = true,
  autoplay = false,
  autoplayDelay = 5000,
  className = "",
  onChange = null,
}) {
  const slideRefs = useRef([]);
  const gsapRef = useRef(null);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);
  const tiltRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);

  const vertical = layout === "vertical";
  const axis = vertical ? "yPercent" : "xPercent";

  const getParts = useCallback((index) => {
    const slide = slideRefs.current[index];
    if (!slide) return null;
    return {
      imgs: Array.from(slide.querySelectorAll("img")),
      title: slide.querySelector("h2"),
    };
  }, []);

  const removeTilt = useCallback(() => {
    if (tiltRef.current) {
      window.removeEventListener("mousemove", tiltRef.current);
      tiltRef.current = null;
    }
  }, []);

  const initTilt = useCallback(
    (index) => {
      if (!enableTilt) return;
      const gsap = gsapRef.current;
      const parts = getParts(index);
      if (!gsap || !parts) return;
      const visibleArea = slides[index].visibleArea ?? 1;
      let frame = 0;

      const onMove = (e) => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const d = vertical ? h : w;
          const m = vertical ? e.clientY : e.clientX;
          const tVal =
            m < d / 2
              ? lineEq(visibleArea, visibleArea * tiltFactor, d / 2, 0, m)
              : lineEq(visibleArea * tiltFactor, visibleArea, d, d / 2, m);

          gsap.to(parts.imgs, {
            duration: 0.2,
            ease: "power1.out",
            overwrite: "auto",
            [axis]: (1 - tVal) * 100,
            rotate: sideRotation + (tiltRotation / h) * e.clientY,
          });
        });
      };

      tiltRef.current = onMove;
      window.addEventListener("mousemove", onMove);
    },
    [axis, enableTilt, getParts, sideRotation, slides, tiltFactor, tiltRotation, vertical],
  );

  const animateImages = useCallback(
    (index, action) =>
      new Promise((resolve) => {
        const gsap = gsapRef.current;
        const parts = getParts(index);
        if (!gsap || !parts) {
          resolve();
          return;
        }
        const visibleArea = slides[index].visibleArea ?? 1;
        const target = Math.ceil((1 - visibleArea) * 100);

        gsap.killTweensOf(parts.imgs);
        if (action === "show") {
          gsap.fromTo(
            parts.imgs,
            { [axis]: 100, opacity: 0, rotate: sideRotation },
            {
              [axis]: target,
              opacity: 1,
              rotate: sideRotation,
              duration: showDuration,
              ease: showEase,
              onComplete: resolve,
            },
          );
        } else {
          gsap.to(parts.imgs, {
            [axis]: 100,
            rotate: sideRotation,
            duration: hideDuration,
            ease: hideEase,
            onComplete: resolve,
          });
          gsap.to(parts.imgs, {
            opacity: 0,
            duration: hideDuration * 0.5,
            ease: hideEase,
          });
        }
      }),
    [axis, getParts, hideDuration, hideEase, showDuration, showEase, sideRotation, slides],
  );

  const animateTitle = useCallback(
    (index, action) => {
      const gsap = gsapRef.current;
      const parts = getParts(index);
      if (!gsap || !parts || !parts.title) return;
      const key = titleAnimation === "vertical" ? "y" : "x";

      gsap.killTweensOf(parts.title);
      if (action === "show") {
        gsap.fromTo(
          parts.title,
          { [key]: titleOffset, opacity: 0 },
          {
            [key]: 0,
            opacity: 1,
            duration: titleShowDuration,
            delay: titleShowDelay,
            ease: showEase,
          },
        );
      } else {
        gsap.to(parts.title, {
          [key]: titleOffset,
          opacity: 0,
          duration: titleHideDuration,
          delay: titleHideDelay,
          ease: showEase,
        });
      }
    },
    [
      getParts,
      showEase,
      titleAnimation,
      titleHideDelay,
      titleHideDuration,
      titleOffset,
      titleShowDelay,
      titleShowDuration,
    ],
  );

  const navigate = useCallback(
    (pos) => {
      if (animatingRef.current || pos === currentRef.current || !gsapRef.current) return;
      const from = currentRef.current;
      animatingRef.current = true;
      removeTilt();
      animateTitle(from, "hide");

      animateImages(from, "hide").then(() => {
        currentRef.current = pos;
        setCurrent(pos);
        animateImages(pos, "show").then(() => initTilt(pos));
        animateTitle(pos, "show");
        animatingRef.current = false;
        if (typeof onChange === "function") onChange(pos);
      });
    },
    [animateImages, animateTitle, initTilt, onChange, removeTilt],
  );

  useEffect(() => {
    setArmed(true);

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (window.gsap) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        gsapRef.current = window.gsap;
        setReady(true);
        const index = currentRef.current;
        animateImages(index, "show").then(() => initTilt(index));
        animateTitle(index, "show");
      })
      .catch(() => setArmed(false));

    return () => removeTilt();
  }, []);

  useEffect(() => {
    if (!enableKeyboard || !ready) return undefined;
    const onKey = (e) => {
      const total = slides.length;
      if (e.key === "ArrowRight") navigate((currentRef.current + 1) % total);
      if (e.key === "ArrowLeft") navigate((currentRef.current - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableKeyboard, navigate, ready, slides.length]);

  useEffect(() => {
    if (!autoplay || !ready) return undefined;
    const id = window.setInterval(
      () => navigate((currentRef.current + 1) % slides.length),
      autoplayDelay,
    );
    return () => window.clearInterval(id);
  }, [autoplay, autoplayDelay, navigate, ready, slides.length]);

  const navPos =
    navPosition === "top"
      ? "top-0 left-0 w-full flex-row justify-center flex-wrap"
      : navPosition === "bottom-left"
        ? "bottom-0 left-0 flex-col items-start px-8 pb-4"
        : "bottom-0 right-0 flex-col items-end px-8 pb-4";

  return (
    <div
      className={`relative w-full h-screen overflow-hidden font-sans ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {showHeading ? (
        <h2
          className="absolute top-[38vh] left-0 z-10 w-full m-0 px-4 text-center text-sm uppercase tracking-[0.5em] indent-[0.5em] pointer-events-none"
          style={{ color: headingColor }}
        >
          {heading}
        </h2>
      ) : null}

      {slides.map((slide, i) => (
        <div
          key={i}
          ref={(el) => (slideRefs.current[i] = el)}
          className={`absolute inset-0 flex flex-col justify-center ${i === current ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          style={{ mixBlendMode: mirrorBlendMode }}
        >
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center w-[var(--mw)] max-[50em]:w-[90vw] ${vertical ? "flex-wrap" : ""
              }`}
            style={{
              "--mw": mirrorWidth,
              maxWidth: mirrorMaxWidth,
              opacity: mirrorOpacity,
            }}
          >
            <div
              className={`flex-none overflow-hidden flex items-end ${vertical ? "w-full h-1/2" : "w-1/2"
                }`}
            >
              <img
                className={`block w-full ${armed ? "opacity-0" : ""}`}
                style={{ maxHeight: imgMaxHeight }}
                src={slide.image}
                alt={slide.alt ?? ""}
              />
            </div>
            <div
              className={`flex-none overflow-hidden flex items-end ${vertical ? "w-full h-1/2 -scale-y-100" : "w-1/2 -scale-x-100"
                }`}
            >
              <img
                className={`block w-full ${armed ? "opacity-0" : ""}`}
                style={{ maxHeight: imgMaxHeight }}
                src={slide.image}
                alt=""
              />
            </div>
          </div>
          <h2
            className={`relative z-10 m-0 text-center font-normal leading-[0.8] pointer-events-none text-[length:var(--ts)] max-[50em]:text-[2em] ${armed ? "opacity-0" : ""
              }`}
            style={{
              "--ts": titleSize,
              fontFamily: titleFont,
              color: slide.color || "#ffffff",
            }}
          >
            {slide.title}
          </h2>
        </div>
      ))}

      {showNav ? (
        <nav
          className={`absolute z-20 flex overflow-hidden ${navPos} max-[50em]:top-0 max-[50em]:bottom-auto max-[50em]:left-0 max-[50em]:w-full max-[50em]:flex-row max-[50em]:flex-wrap max-[50em]:justify-center max-[50em]:items-center max-[50em]:p-2`}
        >
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              className="py-1 my-2 mr-4 border-b-2 border-transparent cursor-pointer transition-colors duration-300 focus:outline-none max-[50em]:mx-2 max-[50em]:my-0.5"
              style={{
                color:
                  i === current
                    ? navActiveColor === "inherit"
                      ? slide.color || "#ffffff"
                      : navActiveColor
                    : navColor,
                borderBottomColor: i === current ? "currentColor" : undefined,
              }}
              onClick={() => navigate(i)}
            >
              {slide.title}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}