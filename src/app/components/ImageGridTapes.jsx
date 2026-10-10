"use client";

import { useEffect, useId, useRef } from "react";

// ─── ImageGridMotion ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            array    (13 unsplash)  Background image URLs for tiles
// title             string   "Grip"         Main headline text
// subtitle          string   "tapes"        Secondary headline text
// bgColor           string   #832f05        Page background
// textColor         string   #000000        Main headline color
// subTextColor      string   #ec9e34        Secondary headline color
// cursorStroke      string   #000000        Cursor circle stroke color
// cursorFill        string   none           Cursor circle fill color
// cursorStrokeWidth number   1              Cursor circle stroke width
// cursorSize        number   80             Cursor svg box size (px)
// cursorRadius      number   20             Cursor circle radius
// cursorEase        number   0.2            Cursor follow lerp amount (0-1)
// showCursor        boolean  true           Enable the custom trailing cursor
// gridColumns       number   50             Grid column count
// gridRows          number   50             Grid row count
// gridOverflow      number   10             Extra grid size percent beyond viewport
// itemEase          number   0.07           Tile parallax lerp amount (0-1)
// xRange            array    [15, 60]       Random min/max horizontal travel (px)
// yRange            array    [30, 90]       Random min/max vertical travel (px)
// rotationRange     number   15             Max random rotation degrees
// imgOverflow       number   100            Inner image oversize (px)
// revealDuration    number   2              Scale-in duration (s)
// fadeDuration      number   3              Fade-in duration (s)
// startScale        number   0.7            Initial tile scale
// finalOpacity      number   0.8            Resting tile opacity
// staggerAmount     number   0.6            Total stagger spread (s)
// titleSize         string   10vw           Main headline font size
// subtitleSize      string   4.5vw          Secondary headline font size
// fontUrl           string   (fontshare)    Stylesheet URL for the headline fonts
// fontFamily        string   Switzer, ...   Base font family
// titleFontFamily   string   Zodiak, ...    Headline display font family
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const POSITIONS = [
  "10 / 1 / 26 / 7",
  "1 / 18 / 9 / 27",
  "1 / 36 / 14 / 42",
  "13 / 11 / 32 / 18",
  "17 / 32 / 32 / 38",
  "20 / 46 / 28 / 51",
  "43 / 1 / 51 / 10",
  "38 / 14 / 46 / 22",
  "40 / 26 / 51 / 32",
  "37 / 39 / 48 / 47",
];

export default function ImageGridTapes({
  images = DEFAULT_IMAGES,
  title = "Grip",
  subtitle = "tapes",
  bgColor = "#832f05",
  textColor = "#000000",
  subTextColor = "#ec9e34",
  cursorStroke = "#000000",
  cursorFill = "none",
  cursorStrokeWidth = 1,
  cursorSize = 80,
  cursorRadius = 20,
  cursorEase = 0.2,
  showCursor = true,
  gridColumns = 50,
  gridRows = 50,
  gridOverflow = 10,
  itemEase = 0.07,
  xRange = [15, 60],
  yRange = [30, 90],
  rotationRange = 15,
  imgOverflow = 100,
  revealDuration = 2,
  fadeDuration = 3,
  startScale = 0.7,
  finalOpacity = 0.8,
  staggerAmount = 0.6,
  titleSize = "10vw",
  subtitleSize = "4.5vw",
  fontUrl = "https://api.fontshare.com/v2/css?f[]=zodiak@400,700&f[]=switzer@400,500&display=swap",
  fontFamily = "Switzer, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif",
  titleFontFamily = "Zodiak, Georgia, Times New Roman, serif",
}) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const cursorRef = useRef(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    if (!fontUrl) return;
    if (document.querySelector('link[data-id="' + fontUrl + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.setAttribute("data-id", fontUrl);
    document.head.appendChild(link);
  }, [fontUrl]);

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector('script[data-id="' + src + '"]')) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    let frames = [];
    let cleanupFns = [];

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    )
      .then(() => {
        const { gsap } = window;
        if (!gsap || !gridRef.current) return;

        gsap.config({ trialWarn: false });

        const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
        const lerp = (a, b, n) => (1 - n) * a + n * b;
        const rand = (min, max) =>
          Math.floor(Math.random() * (max - min + 1) + min);

        let winsize = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        let mousepos = { x: winsize.width / 2, y: winsize.height / 2 };

        const onResize = () => {
          winsize = { width: window.innerWidth, height: window.innerHeight };
        };
        const onMouseMove = (ev) => {
          mousepos = { x: ev.clientX, y: ev.clientY };
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("mousemove", onMouseMove);
        cleanupFns.push(() => {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("mousemove", onMouseMove);
        });

        const items = Array.from(
          gridRef.current.querySelectorAll("[data-grid-item]"),
        );

        items.forEach((item) => {
          const vals = { tx: 0, ty: 0, r: 0 };
          const xstart = rand(xRange[0], xRange[1]);
          const ystart = rand(yRange[0], yRange[1]);
          const randR = rand(-rotationRange, rotationRange);

          const render = () => {
            vals.tx = lerp(
              vals.tx,
              map(mousepos.x, 0, winsize.width, -xstart, xstart),
              itemEase,
            );
            vals.ty = lerp(
              vals.ty,
              map(mousepos.y, 0, winsize.height, -ystart, ystart),
              itemEase,
            );
            vals.r = lerp(
              vals.r,
              map(mousepos.x, 0, winsize.width, -randR, randR),
              itemEase,
            );
            gsap.set(item, { x: vals.tx, y: vals.ty, rotation: vals.r });
            frames.push(requestAnimationFrame(render));
          };
          frames.push(requestAnimationFrame(render));
        });

        gsap
          .timeline()
          .set(items, { scale: startScale, opacity: 0 }, 0)
          .to(
            items,
            {
              duration: revealDuration,
              ease: "expo.out",
              scale: 1,
              stagger: { amount: staggerAmount, grid: "auto", from: "center" },
            },
            0,
          )
          .to(
            items,
            {
              duration: fadeDuration,
              ease: "power1.out",
              opacity: finalOpacity,
              stagger: { amount: staggerAmount, grid: "auto", from: "center" },
            },
            0,
          );

        if (showCursor && cursorRef.current) {
          const el = cursorRef.current;
          const bounds = el.getBoundingClientRect();
          const styles = {
            tx: { previous: 0, current: 0 },
            ty: { previous: 0, current: 0 },
          };

          const renderCursor = () => {
            styles.tx.current = mousepos.x - bounds.width / 2;
            styles.ty.current = mousepos.y - bounds.height / 2;
            styles.tx.previous = lerp(
              styles.tx.previous,
              styles.tx.current,
              cursorEase,
            );
            styles.ty.previous = lerp(
              styles.ty.previous,
              styles.ty.current,
              cursorEase,
            );
            el.style.transform =
              "translateX(" +
              styles.tx.previous +
              "px) translateY(" +
              styles.ty.previous +
              "px)";
            frames.push(requestAnimationFrame(renderCursor));
          };

          const onFirstMove = (ev) => {
            styles.tx.previous = styles.tx.current = ev.clientX - bounds.width / 2;
            styles.ty.previous = styles.ty.current = ev.clientY - bounds.height / 2;
            gsap.to(el, { duration: 0.9, ease: "power3.out", opacity: 1 });
            frames.push(requestAnimationFrame(renderCursor));
            window.removeEventListener("mousemove", onFirstMove);
          };
          window.addEventListener("mousemove", onFirstMove);
          cleanupFns.push(() =>
            window.removeEventListener("mousemove", onFirstMove),
          );
        }
      })
      .catch((e) =>
        console.error("[ImageGridMotion] GSAP load failed:", e.message),
      );

    return () => {
      frames.forEach((f) => cancelAnimationFrame(f));
      cleanupFns.forEach((fn) => fn());
    };
  }, [
    itemEase,
    rotationRange,
    revealDuration,
    fadeDuration,
    startScale,
    finalOpacity,
    staggerAmount,
    cursorEase,
    showCursor,
  ]);

  const tiles = POSITIONS.map((area, i) => ({
    area,
    src: images[i % images.length],
  }));

  return (
    <div
      ref={rootRef}
      className="relative w-full h-screen overflow-hidden cursor-none"
      style={{ backgroundColor: bgColor, fontFamily }}
    >
      <style>
        {".igm-" +
          uid +
          " { -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }"}
      </style>

      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div
          ref={gridRef}
          className="pointer-events-none absolute grid"
          style={{
            width: 100 + gridOverflow + "%",
            height: 100 + gridOverflow + "%",
            top: -(gridOverflow / 2) + "%",
            left: -(gridOverflow / 2) + "%",
            gridTemplateColumns:
              "repeat(" + gridColumns + ", " + 100 / gridColumns + "%)",
            gridTemplateRows:
              "repeat(" + gridRows + ", " + 100 / gridRows + "%)",
          }}
        >
          {tiles.map((tile, i) => (
            <div
              key={i}
              data-grid-item
              className="relative flex items-center justify-center overflow-hidden opacity-0 will-change-transform"
              style={{ gridArea: tile.area }}
            >
              <div
                className="relative flex-none bg-cover bg-center will-change-transform"
                style={{
                  width: "calc(100% + " + imgOverflow + "px)",
                  height: "calc(100% + " + imgOverflow + "px)",
                  backgroundImage: "url(" + tile.src + ")",
                }}
              />
            </div>
          ))}
        </div>

        <h2
          className={"relative z-10 m-0 leading-none igm-" + uid}
          style={{
            fontSize: titleSize,
            color: textColor,
            fontFamily: titleFontFamily,
            fontWeight: 400,
          }}
        >
          <span>{title}</span>
          <span
            className="block"
            style={{
              color: subTextColor,
              fontSize: subtitleSize,
              marginLeft: "3vw",
              lineHeight: 0.5,
            }}
          >
            {subtitle}
          </span>
        </h2>
      </div>

      {showCursor ? (
        <svg
          ref={cursorRef}
          className="fixed top-0 left-0 z-50 hidden pointer-events-none opacity-0 [@media(any-pointer:fine)]:block"
          width={cursorSize}
          height={cursorSize}
          viewBox={"0 0 " + cursorSize + " " + cursorSize}
        >
          <circle
            cx={cursorSize / 2}
            cy={cursorSize / 2}
            r={cursorRadius}
            fill={cursorFill}
            stroke={cursorStroke}
            strokeWidth={cursorStrokeWidth}
          />
        </svg>
      ) : null}
    </div>
  );
}