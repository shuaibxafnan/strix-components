"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

// ─── MirrorSlideshow ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides            array    DEFAULT_SLIDES  Slide data: image, title, color, visibleArea
// layout            string   horizontal      Mirror split axis: horizontal | vertical
// bgColor           string   #111111         Stage background
// mirrorWidth       string   60vw            Width of the mirror block
// mirrorMaxWidth    string   1100px          Upper clamp on mirror width
// mirrorOpacity     number   1               Opacity of the mirrored image pair
// mirrorBlendMode   string   normal          CSS mix-blend-mode applied to each slide
// imgMaxHeight      string   none            Cap on image height (e.g. 65vh)
// showDuration      number   1.5             Image reveal duration (s)
// hideDuration      number   1               Image conceal duration (s)
// showEase          string   expo.out        Easing for the reveal
// hideEase          string   quint.out       Easing for the conceal
// titleShowDuration number   1.5             Title reveal duration (s)
// titleHideDuration number   0.5             Title conceal duration (s)
// titleShowDelay    number   0.25            Delay before the title reveals (s)
// titleHideDelay    number   0               Delay before the title conceals (s)
// titleAnimation    string   vertical        Title slide axis: vertical | horizontal
// titleOffset       number   50              Title travel distance (px)
// titleSize         string   6vw             Title font size
// titleFont         string   Georgia, serif  Title font stack
// bodyFont          string   system stack    Font stack for heading + nav
// enableTilt        bool     false           Mouse-driven parallax on the mirror halves
// tiltFactor        number   0.6             Lower value = wider reveal swing on tilt
// tiltRotation      number   10              Max z-axis rotation on tilt (deg)
// heading           string   Maitri Animal…  Small uppercase heading above the slide
// headingColor      string   #ffffff         Heading color
// showHeading       bool     true            Render the heading
// navPosition       string   bottom-right    Nav placement: bottom-right | bottom-left | top
// navColor          string   #909090         Inactive nav button color
// navActiveColor    string   inherit         Active nav color ("inherit" uses the slide color)
// showNav           bool     true            Render the nav buttons
// enableKeyboard    bool     true            Arrow keys move between slides
// autoplay          bool     false           Advance automatically
// autoplayDelay     number   5000            Autoplay interval (ms)
// className         string   ""              Extra classes on the outer stage
// onChange          func     null            Called with the new slide index
// ──────────────────────────────────────────────────────────────────────────

const IMAGES = [
  "https://raw.githubusercontent.com/codrops/MirrorEffect/refs/heads/master/img/1.jpg",
  "https://raw.githubusercontent.com/codrops/MirrorEffect/refs/heads/master/img/2.jpg",
  "https://raw.githubusercontent.com/codrops/MirrorEffect/refs/heads/master/img/3.jpg",
  "https://raw.githubusercontent.com/codrops/MirrorEffect/refs/heads/master/img/4.jpg",
];

const DEFAULT_SLIDES = [
  { image: IMAGES[0], title: "Simba", color: "#facb7a", visibleArea: 0.85 },
  { image: IMAGES[1], title: "Anette", color: "#d06690", visibleArea: 0.8 },
  { image: IMAGES[2], title: "Matuba", color: "#9ccc65", visibleArea: 0.75 },
  { image: IMAGES[3], title: "Boris", color: "#90a4ae", visibleArea: 0.8 },
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
  titleFont = "Georgia, 'Times New Roman', serif",
  bodyFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
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
  const uid = `mrs-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const rootRef = useRef(null);
  const slideRefs = useRef([]);
  const gsapRef = useRef(null);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);
  const tiltRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);

  const axis = layout === "vertical" ? "yPercent" : "xPercent";

  const getParts = useCallback(
    (index) => {
      const slide = slideRefs.current[index];
      if (!slide) return null;
      return {
        imgs: Array.from(slide.querySelectorAll(`.${uid}-img`)),
        title: slide.querySelector(`.${uid}-title`),
      };
    },
    [uid],
  );

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
          const d = layout === "horizontal" ? w : h;
          const m = layout === "horizontal" ? e.clientX : e.clientY;
          const tVal =
            m < d / 2
              ? lineEq(visibleArea, visibleArea * tiltFactor, d / 2, 0, m)
              : lineEq(visibleArea * tiltFactor, visibleArea, d, d / 2, m);

          gsap.to(parts.imgs, {
            duration: 0.2,
            ease: "power1.out",
            overwrite: "auto",
            [axis]: (1 - tVal) * 100,
            rotate: (tiltRotation / h) * e.clientY,
          });
        });
      };

      tiltRef.current = onMove;
      window.addEventListener("mousemove", onMove);
    },
    [axis, enableTilt, getParts, layout, slides, tiltFactor, tiltRotation],
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
            { [axis]: 100, opacity: 0, rotate: 0 },
            {
              [axis]: target,
              opacity: 1,
              rotate: 0,
              duration: showDuration,
              ease: showEase,
              onComplete: resolve,
            },
          );
        } else {
          gsap.to(parts.imgs, {
            [axis]: 100,
            rotate: 0,
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
    [axis, getParts, hideDuration, hideEase, showDuration, showEase, slides],
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
      if (
        animatingRef.current ||
        pos === currentRef.current ||
        !gsapRef.current
      )
        return;
      const from = currentRef.current;
      animatingRef.current = true;
      removeTilt();
      animateTitle(from, "hide");

      animateImages(from, "hide").then(() => {
        const fromSlide = slideRefs.current[from];
        const toSlide = slideRefs.current[pos];
        if (fromSlide) fromSlide.classList.remove(`${uid}-cur`);
        if (toSlide) toSlide.classList.add(`${uid}-cur`);

        currentRef.current = pos;
        setCurrent(pos);

        animateImages(pos, "show").then(() => initTilt(pos));
        animateTitle(pos, "show");
        animatingRef.current = false;
        if (typeof onChange === "function") onChange(pos);
      });
    },
    [animateImages, animateTitle, initTilt, onChange, removeTilt, uid],
  );

  useEffect(() => {
    if (rootRef.current) rootRef.current.classList.add(`${uid}-armed`);
  }, [uid]);

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
        if (!gsap || !rootRef.current) return;
        gsap.config({ trialWarn: false });
        gsapRef.current = gsap;
        setReady(true);

        const index = currentRef.current;
        const slide = slideRefs.current[index];
        if (slide) slide.classList.add(`${uid}-cur`);
        animateImages(index, "show").then(() => initTilt(index));
        animateTitle(index, "show");
      })
      .catch((e) => {
        if (rootRef.current) rootRef.current.classList.remove(`${uid}-armed`);
        console.error("[MirrorSlideshow] GSAP load failed:", e.message);
      });

    return () => removeTilt();
  }, []);

  useEffect(() => {
    if (!enableKeyboard || !ready) return undefined;
    const onKey = (e) => {
      const total = slides.length;
      if (e.key === "ArrowRight") navigate((currentRef.current + 1) % total);
      if (e.key === "ArrowLeft")
        navigate((currentRef.current - 1 + total) % total);
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

  const css = `
.${uid}-stage { font-family: ${bodyFont}; }
.${uid}-slide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  mix-blend-mode: ${mirrorBlendMode};
}
.${uid}-slide.${uid}-cur { opacity: 1; pointer-events: auto; }
.${uid}-mirror {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  width: ${mirrorWidth};
  max-width: ${mirrorMaxWidth};
  opacity: ${mirrorOpacity};
  display: flex;
  align-items: center;
  ${layout === "vertical" ? "flex-direction: row; flex-wrap: wrap;" : ""}
}
.${uid}-side {
  flex: none;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  ${layout === "vertical" ? "width: 100%; height: 50%;" : "width: 50%;"}
}
.${uid}-side-two {
  transform: ${layout === "vertical" ? "scale3d(1,-1,1)" : "scale3d(-1,1,1)"};
}
.${uid}-img {
  display: block;
  width: 100%;
  max-height: ${imgMaxHeight};
}
.${uid}-title {
  position: relative;
  z-index: 10;
  margin: 0;
  line-height: 0.8;
  font-weight: normal;
  font-family: ${titleFont};
  font-size: ${titleSize};
  pointer-events: none;
  text-align: center;
}
.${uid}-armed .${uid}-img { opacity: 0; }
.${uid}-armed .${uid}-title { opacity: 0; }
.${uid}-btn {
  border: 0;
  background: 0;
  padding: 0.25em 0;
  margin: 0.5em 1em 0.5em 0;
  color: ${navColor};
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s, color 0.3s;
  cursor: pointer;
}
.${uid}-btn:focus { outline: none; }
@media screen and (max-width: 50em) {
  .${uid}-mirror { width: 90vw; }
  .${uid}-title { font-size: 2em; }
  .${uid}-nav {
    top: 0;
    bottom: auto;
    left: 0;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0.5em;
  }
  .${uid}-btn { margin: 0.15em 0.5em; }
}
`;

  return (
    <div
      ref={rootRef}
      className={`${uid}-stage relative w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {showHeading ? (
        <h2
          className="absolute top-[38vh] left-0 z-10 w-full m-0 px-4 text-center text-sm uppercase pointer-events-none"
          style={{
            color: headingColor,
            letterSpacing: "0.5em",
            textIndent: "0.5em",
          }}
        >
          {heading}
        </h2>
      ) : null}

      {slides.map((slide, i) => (
        <div
          key={i}
          ref={(el) => (slideRefs.current[i] = el)}
          className={`${uid}-slide${i === 0 ? ` ${uid}-cur` : ""}`}
        >
          <div className={`${uid}-mirror`}>
            <div className={`${uid}-side`}>
              <img className={`${uid}-img`} src={slide.image} alt="" />
            </div>
            <div className={`${uid}-side ${uid}-side-two`}>
              <img className={`${uid}-img`} src={slide.image} alt="" />
            </div>
          </div>
          <h2
            className={`${uid}-title`}
            style={{ color: slide.color || "#ffffff" }}
          >
            {slide.title}
          </h2>
        </div>
      ))}

      {showNav ? (
        <nav
          className={`${uid}-nav absolute z-20 flex overflow-hidden ${navPos}`}
        >
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              className={`${uid}-btn`}
              style={
                i === current
                  ? {
                      color:
                        navActiveColor === "inherit"
                          ? slide.color || "#ffffff"
                          : navActiveColor,
                      borderBottomColor: "currentColor",
                    }
                  : undefined
              }
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