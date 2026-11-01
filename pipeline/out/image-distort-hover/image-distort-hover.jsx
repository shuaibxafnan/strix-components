"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    filterType: "turbulence",
    caption: "Weightless forms held still between two frames of motion.",
    link: "Explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    filterType: "turbulence",
    caption: "A study in interference, where the signal outlives the noise.",
    link: "Explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    filterType: "displacementMap",
    noiseType: "fractalNoise",
    baseFrequency: "0.01 0.005",
    caption: "Long horizontal drift, sampled at the edge of legibility.",
    link: "Explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    filterType: "displacementMap",
    noiseType: "turbulence",
    baseFrequency: "0.07 0.01",
    caption: "Scanlines pulled apart until the surface admits its grain.",
    link: "Explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    filterType: "displacementMap",
    noiseType: "turbulence",
    baseFrequency: "0.1",
    caption: "Dense turbulence, resolved only when the pointer leaves.",
    link: "Explore",
  },
];

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&display=swap";

const loadFonts = (href) => {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-id="' + href + '"]')) return;
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = href;
  el.setAttribute("data-id", href);
  document.head.appendChild(el);
};

export default function ImageDistortHover({
  items = DEFAULT_ITEMS,
  kicker = "Selected Work",
  title = "Index",
  note = "2019 — 2023",
  showHeader = true,
  bgColor = "#0b0b0c",
  textColor = "#e8e4dd",
  mutedColor = "#6f6a63",
  accentColor = "#c8452f",
  captionBgColor = "#0b0b0c",
  captionTextColor = "#e8e4dd",
  serifFontFamily = "'Instrument Serif', Georgia, serif",
  sansFontFamily = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  loadGoogleFonts = true,
  className = "",
  staggerLayout = true,
  staggerAmount = 8,
  gapX = 2,
  gapY = 4,
  thumbWidth = 220,
  thumbHeight = 300,
  svgWidth = 380,
  svgHeight = 500,
  imageWidth = 280,
  imageHeight = 400,
  turbulenceStart = 0.09,
  displacementScale = 150,
  imageZoom = 1.15,
  grayscale = true,
  hoverDuration = 0.7,
  hoverEase = "power2",
  showIndex = true,
  showCaption = true,
  showCursor = true,
  cursorSize = 40,
  cursorRadius = 9,
  cursorEase = 0.15,
  cursorHoverScale = 2,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorApi = useRef(null);

  useEffect(() => {
    if (loadGoogleFonts) loadFonts(FONTS_HREF);
  }, [loadGoogleFonts]);

  useEffect(() => {
    if (!showCursor) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(any-pointer: fine)").matches) return;

    let raf = 0;
    let started = false;
    let killed = false;
    const mouse = { x: 0, y: 0 };
    const styles = {
      tx: { previous: 0, current: 0, amt: cursorEase },
      ty: { previous: 0, current: 0, amt: cursorEase },
      scale: { previous: 1, current: 1, amt: cursorEase },
      opacity: { previous: 1, current: 1, amt: 0.1 },
    };
    const lerp = (a, b, n) => (1 - n) * a + n * b;

    cursorApi.current = {
      enter: () => {
        styles.scale.current = cursorHoverScale;
        styles.opacity.current = 0.75;
      },
      leave: () => {
        styles.scale.current = 1;
        styles.opacity.current = 1;
      },
    };

    const render = () => {
      if (killed) return;
      const el = cursorRef.current;
      if (!el) return;
      const half = cursorSize / 2;
      styles.tx.current = mouse.x - half;
      styles.ty.current = mouse.y - half;
      for (const key in styles) {
        styles[key].previous = lerp(
          styles[key].previous,
          styles[key].current,
          styles[key].amt,
        );
      }
      el.style.transform =
        "translateX(" +
        styles.tx.previous +
        "px) translateY(" +
        styles.ty.previous +
        "px) scale(" +
        styles.scale.previous +
        ")";
      el.style.opacity = styles.opacity.previous;
      raf = requestAnimationFrame(render);
    };

    const onMove = (ev) => {
      mouse.x = ev.clientX;
      mouse.y = ev.clientY;
      if (!started) {
        started = true;
        const half = cursorSize / 2;
        styles.tx.previous = styles.tx.current = mouse.x - half;
        styles.ty.previous = styles.ty.current = mouse.y - half;
        raf = requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      killed = true;
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      cursorApi.current = null;
    };
  }, [showCursor, cursorEase, cursorHoverScale, cursorSize]);

  useEffect(() => {
    let cleanups = [];
    let cancelled = false;

    import("gsap")
      .then((mod) => {
        if (cancelled) return;
        const gsap = mod.default || mod.gsap;
        const root = rootRef.current;
        if (!gsap || !root) return;

        const nodes = [].slice.call(root.querySelectorAll("[data-item]"));

        nodes.forEach((node) => {
          const thumb = node.querySelector("[data-thumb]");
          const svgFilter = node.querySelector("filter");
          const thumbSVG = node.querySelector("[data-thumb-svg]");
          const svgImage = node.querySelector("[data-distort-img]");
          const feTurbulence = node.querySelector("feTurbulence");
          const feDisplacementMap = node.querySelector("feDisplacementMap");
          const caption = node.querySelector("[data-caption]");
          const captionTitle = node.querySelector("[data-caption-title]");
          const captionLink = node.querySelector("[data-caption-link]");
          const label = node.querySelector("[data-label]");

          if (!thumb || !svgFilter || !svgImage) return;

          const filterType = svgFilter.getAttribute("data-type");
          const values =
            filterType === "turbulence" ? { baseFrequency: 0 } : { scale: 0 };

          const applyValues = () => {
            if (filterType === "turbulence") {
              feTurbulence.setAttribute("baseFrequency", values.baseFrequency);
            } else {
              feDisplacementMap.setAttribute("scale", values.scale);
            }
          };

          gsap.set(svgImage, { transformOrigin: "50% 50%" });

          const tl = gsap.timeline({
            paused: true,
            defaults: { duration: hoverDuration, ease: hoverEase },
            onUpdate: applyValues,
            onReverseComplete: () => {
              if (filterType === "turbulence") {
                values.baseFrequency = 0;
                applyValues();
              }
            },
          });

          if (filterType === "turbulence") {
            tl.to(
              values,
              { startAt: { baseFrequency: turbulenceStart }, baseFrequency: 0 },
              0,
            );
          } else {
            tl.to(
              values,
              { startAt: { scale: 0 }, scale: displacementScale },
              0,
            );
          }

          if (caption) {
            tl.to(caption, { y: "0%" }, 0).to(
              [captionTitle, captionLink].filter(Boolean),
              {
                y: 0,
                startAt: { y: 60, opacity: 0 },
                opacity: 1,
                stagger: 0.08,
              },
              0.08,
            );
          }

          if (label) {
            tl.to(
              label,
              { duration: 0.5, ease: "power3", opacity: 1, x: 6 },
              0,
            );
          }

          if (grayscale && thumbSVG) {
            tl.to(
              thumbSVG,
              {
                duration: 0.5,
                ease: "power2",
                filter: "grayscale(0) contrast(1)",
              },
              0,
            );
          }

          if (navigator.userAgent.indexOf("Firefox") === -1) {
            tl.to(svgImage, { scale: imageZoom }, 0);
          }

          const onEnter = () => tl.restart();
          const onLeave = () => tl.reverse();
          thumb.addEventListener("mouseenter", onEnter);
          thumb.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            thumb.removeEventListener("mouseenter", onEnter);
            thumb.removeEventListener("mouseleave", onLeave);
            tl.kill();
          });
        });

        const targets = [].slice.call(
          root.querySelectorAll("[data-cursor-target]"),
        );
        targets.forEach((t) => {
          const onEnter = () => cursorApi.current && cursorApi.current.enter();
          const onLeave = () => cursorApi.current && cursorApi.current.leave();
          t.addEventListener("mouseenter", onEnter);
          t.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            t.removeEventListener("mouseenter", onEnter);
            t.removeEventListener("mouseleave", onLeave);
          });
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      cleanups = [];
    };
  }, [
    items,
    hoverDuration,
    hoverEase,
    turbulenceStart,
    displacementScale,
    imageZoom,
    grayscale,
    showCaption,
  ]);

  const scopedCss =
    "#" +
    uid +
    "-root [data-cursor]{display:none;}" +
    "@media (any-pointer:fine){#" +
    uid +
    "-root [data-cursor]{display:block;}#" +
    uid +
    "-root,#" +
    uid +
    "-root a{cursor:none;}}" +
    "#" +
    uid +
    "-root [data-thumb]::after{content:'';position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(232,228,221,0.10);}" +
    "#" +
    uid +
    "-grid{column-gap:" +
    gapX +
    "rem;row-gap:" +
    gapY +
    "rem;}" +
    (staggerLayout
      ? "@media screen and (min-width:64em){#" +
        uid +
        "-grid [data-item]:nth-child(even){transform:translateY(" +
        staggerAmount +
        "vh);}}"
      : "");

  return (
    <div
      id={uid + "-root"}
      ref={rootRef}
      className={"relative flex min-h-screen w-full flex-col justify-center overflow-x-clip px-6 py-16 md:px-12 lg:px-16 " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: sansFontFamily,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />

      {showHeader ? (
        <header
          className="mx-auto mb-16 flex w-full max-w-[1200px] items-end justify-between gap-8 pb-6"
          style={{ borderColor: "rgba(232,228,221,0.12)" }}
        >
          <div>
            <p
              className="m-0 text-[0.7rem] uppercase tracking-[0.28em]"
              style={{ color: accentColor }}
            >
              {kicker}
            </p>
            <h2
              className="m-0 mt-3 text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.85]"
              style={{ fontFamily: serifFontFamily, fontWeight: 400 }}
            >
              {title}
            </h2>
          </div>
          <p
            className="m-0 hidden shrink-0 text-[0.7rem] uppercase tracking-[0.22em] sm:block"
            style={{ color: mutedColor }}
          >
            {note}
          </p>
        </header>
      ) : null}

      <div
        id={uid + "-grid"}
        className="mx-auto flex w-full max-w-[1200px] flex-wrap items-start justify-center lg:justify-between"
      >
        {items.map((item, i) => {
          const filterId = uid + "-filter-" + i;
          const isTurbulence =
            (item.filterType || "turbulence") === "turbulence";
          const imgX = (svgWidth - imageWidth) / 2;
          const imgY = (svgHeight - imageHeight) / 2;
          const marginTop = -((svgHeight - thumbHeight) / 2);
          const marginLeft = -((svgWidth - thumbWidth) / 2);
          return (
            <div key={i} data-item className="flex-none">
              <figure
                data-thumb
                className="relative m-0 overflow-hidden"
                style={{
                  width: thumbWidth + "px",
                  height: thumbHeight + "px",
                  backgroundColor: "rgba(232,228,221,0.04)",
                }}
              >
                <svg
                  data-thumb-svg
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={"0 0 " + svgWidth + " " + svgHeight}
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none"
                  style={{
                    margin: marginTop + "px 0 0 " + marginLeft + "px",
                    filter: grayscale
                      ? "grayscale(1) contrast(1.05)"
                      : undefined,
                  }}
                >
                  <filter
                    id={filterId}
                    data-type={isTurbulence ? "turbulence" : "displacementMap"}
                  >
                    {isTurbulence ? (
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0"
                        numOctaves="1"
                        result="warp"
                      />
                    ) : (
                      <feTurbulence
                        type={item.noiseType || "turbulence"}
                        baseFrequency={item.baseFrequency || "0.1"}
                        numOctaves="5"
                        seed="2"
                        result="noise"
                      />
                    )}
                    {isTurbulence ? (
                      <feDisplacementMap
                        xChannelSelector="R"
                        yChannelSelector="G"
                        scale="250"
                        in="SourceGraphic"
                      />
                    ) : (
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="0"
                        xChannelSelector="R"
                        yChannelSelector="B"
                        filterUnits="userSpaceOnUse"
                      />
                    )}
                  </filter>
                  <image
                    data-distort-img
                    data-cursor-target
                    filter={"url(#" + filterId + ")"}
                    x={imgX}
                    y={imgY}
                    width={imageWidth}
                    height={imageHeight}
                    preserveAspectRatio="xMidYMid slice"
                    href={item.image}
                  />
                </svg>

                {showCaption ? (
                  <figcaption
                    data-caption
                    className="absolute left-0 top-0 flex h-full w-full flex-col justify-end p-5"
                    style={{
                      background: captionBgColor,
                      transform: "translate3d(0,100%,0)",
                    }}
                  >
                    <p
                      data-caption-title
                      className="m-0 text-[0.95rem] leading-snug"
                      style={{
                        color: captionTextColor,
                        fontFamily: serifFontFamily,
                      }}
                    >
                      {item.caption}
                    </p>
                    <a
                      data-caption-link
                      data-cursor-target
                      className="mt-4 inline-block cursor-pointer text-[0.65rem] uppercase tracking-[0.24em]"
                      style={{ color: accentColor }}
                    >
                      {item.link}
                    </a>
                  </figcaption>
                ) : null}
              </figure>

              {showIndex ? (
                <div className="relative mt-3 flex items-center">
                  <span
                    data-label
                    className="text-[0.65rem] uppercase tracking-[0.24em] opacity-40"
                    style={{ color: mutedColor }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {showCursor ? (
        <svg
          data-cursor
          ref={cursorRef}
          width={cursorSize}
          height={cursorSize}
          viewBox={"0 0 " + cursorSize + " " + cursorSize}
          className="pointer-events-none fixed left-0 top-0 z-[10000] opacity-0"
        >
          <circle
            cx={cursorSize / 2}
            cy={cursorSize / 2}
            r={cursorRadius}
            fill={accentColor}
          />
        </svg>
      ) : null}
    </div>
  );
}
