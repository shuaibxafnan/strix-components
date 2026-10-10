"use client";

import { useEffect, useId, useRef } from "react";

// ─── DiagonalThumbnails ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides           array    (see default)  Slides: { images: [4 urls], top, middle, bottom }
// bgColor          string   #0f0e0e        Page background
// textColor        string   #f6f1f1        Title color
// accentColor      string   #e94b31        Cursor stroke + arrow color
// rotation         number   -22.5          Tilt of the thumbnail cluster (deg)
// imageGap         number   1.5            Gap between thumbnails (rem)
// imageOpacity     number   0.4            Resting opacity of the thumbnails
// clusterWidth     number   790            Minimum width of the cluster (px)
// titleSize        string   clamp(2rem,15vw,14rem)   Font size of the outer title lines
// middleSize       string   2.5rem         Font size of the middle title line
// slideDuration    number   0.8            Image transition duration (s)
// charDuration     number   0.4            Character transition duration (s)
// charStagger      number   0.01           Delay between characters (s)
// charRotation     number   6              Character tilt during transition (deg)
// travel           number   150            Distance images travel off-screen (%)
// cursorSize       number   60             Custom cursor box size (px)
// cursorRadius     number   15             Custom cursor circle radius (px)
// cursorEase       number   0.2            Cursor follow smoothing (0-1)
// showCursor       boolean  true           Enable the custom cursor
// fontUrl          string   (Google Fonts)  Stylesheet injected for the title faces
// titleFont        string   "Bodoni Moda", serif        Face of the outer title lines
// middleFont       string   "Cormorant Garamond", serif Face of the middle title line
// titleWeight      number   400            Weight of the outer title lines
// middleWeight     number   300            Weight of the middle title line
// titleTracking    string   -0.02em        Letter spacing of the outer title lines
// className        string   ""             Extra classes on the root element
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    top: "Look",
    middle: "upon",
    bottom: "Them",
    images: [
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    top: "Till",
    middle: "their",
    bottom: "Rage",
    images: [
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    top: "Has",
    middle: "died",
    bottom: "Away",
    images: [
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    top: "Return",
    middle: "with",
    bottom: "Shame",
    images: [
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    ],
  },
  {
    top: "Blood",
    middle: "thus",
    bottom: "Shed",
    images: [
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    ],
  },
];

const POSITIONS = {
  x: { next: [-1, 0, 0, 1], prev: [0, 1, -1, 0] },
  y: { next: [0, -1, 1, 0], prev: [-1, 0, 0, 1] },
};

export default function DiagonalThumbnails({
  slides = DEFAULT_SLIDES,
  bgColor = "#0f0e0e",
  textColor = "#f6f1f1",
  accentColor = "#e94b31",
  rotation = -22.5,
  imageGap = 1.5,
  imageOpacity = 0.4,
  clusterWidth = 790,
  titleSize = "clamp(2rem,15vw,14rem)",
  middleSize = "2.5rem",
  slideDuration = 0.8,
  charDuration = 0.4,
  charStagger = 0.01,
  charRotation = 6,
  travel = 150,
  cursorSize = 60,
  cursorRadius = 15,
  cursorEase = 0.2,
  showCursor = true,
  fontUrl = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap",
  titleFont = '"Bodoni Moda", serif',
  middleFont = '"Cormorant Garamond", serif',
  titleWeight = 400,
  middleWeight = 300,
  titleTracking = "-0.02em",
  className = "",
}) {
  const rawId = useId();
  const sid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const navigateRef = useRef(null);

  useEffect(() => {
    if (!fontUrl) return;
    if (document.querySelector('link[data-dt-font="' + fontUrl + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.setAttribute("data-dt-font", fontUrl);
    document.head.appendChild(link);
  }, [fontUrl]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let rafId;
    const cleanups = [];

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

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(() => {
        if (disposed) return;
        const gsap = window.gsap;
        if (!gsap) return;

        const groups = Array.from(root.querySelectorAll("[data-dt-slide]")).map(
          (el) => ({
            el,
            imgs: Array.from(el.querySelectorAll("[data-dt-img]")),
            chars: Array.from(el.querySelectorAll("[data-dt-char]")),
          }),
        );

        groups.forEach((g, i) => {
          gsap.set(g.el, { opacity: i === 0 ? 1 : 0 });
          g.el.style.pointerEvents = i === 0 ? "auto" : "none";
          gsap.set(g.imgs, { opacity: i === 0 ? imageOpacity : 0 });
        });

        let index = 0;
        let isAnimating = false;

        const reverse = (d) => (d === "next" ? "prev" : "next");

        navigateRef.current = (direction) => {
          if (isAnimating || groups.length < 2) return;
          isAnimating = true;

          const from = groups[index];
          index =
            direction === "next"
              ? index < groups.length - 1
                ? index + 1
                : 0
              : index > 0
                ? index - 1
                : groups.length - 1;
          const to = groups[index];

          gsap
            .timeline({
              defaults: { duration: slideDuration, ease: "expo" },
              onComplete: () => {
                gsap.set(from.el, { opacity: 0 });
                from.el.style.pointerEvents = "none";
                isAnimating = false;
              },
            })
            .addLabel("start", 0)
            .to(
              from.chars,
              {
                y: direction === "next" ? "100%" : "-100%",
                rotation: direction === "next" ? charRotation : -charRotation,
                duration: charDuration,
                ease: "power3.inOut",
                stagger: direction === "next" ? -charStagger : charStagger,
              },
              "start",
            )
            .to(
              from.imgs,
              {
                x: (pos) => POSITIONS.x[direction][pos] * travel + "%",
                y: (pos) => POSITIONS.y[direction][pos] * travel + "%",
                opacity: 0,
                stagger: direction === "next" ? 0.05 : -0.05,
              },
              "start",
            )
            .addLabel("upcoming", 0.1)
            .add(() => {
              gsap.set(to.imgs, { opacity: 0 });
              gsap.set(to.chars, {
                y: direction === "next" ? "-100%" : "100%",
                rotation: direction === "next" ? charRotation : -charRotation,
              });
              gsap.set(to.el, { opacity: 1 });
              to.el.style.pointerEvents = "auto";
            }, "upcoming")
            .to(
              to.chars,
              {
                y: "0%",
                rotation: 0,
                duration: charDuration,
                ease: "back",
                stagger: direction === "next" ? -charStagger : charStagger,
              },
              "upcoming+=0.1",
            )
            .to(
              to.imgs,
              {
                startAt: {
                  x: (pos) =>
                    POSITIONS.x[reverse(direction)][pos] * travel + "%",
                  y: (pos) =>
                    POSITIONS.y[reverse(direction)][pos] * travel + "%",
                },
                x: "0%",
                y: "0%",
                opacity: imageOpacity,
                ease: "power4",
                stagger: direction === "next" ? 0.05 : -0.05,
              },
              "upcoming",
            );
        };

        const onKey = (ev) => {
          if (ev.key === "ArrowRight") navigateRef.current("next");
          if (ev.key === "ArrowLeft") navigateRef.current("prev");
        };
        window.addEventListener("keydown", onKey);
        cleanups.push(() => window.removeEventListener("keydown", onKey));

        const cursorEl = cursorRef.current;
        if (showCursor && cursorEl) {
          const state = {
            tx: { prev: 0, cur: 0, amt: cursorEase },
            ty: { prev: 0, cur: 0, amt: cursorEase },
            scale: { prev: 1, cur: 1, amt: 0.17 },
            opacity: { prev: 0, cur: 1, amt: 0.17 },
          };
          const half = cursorSize / 2;
          const lerp = (a, b, n) => (1 - n) * a + n * b;
          let started = false;

          const onMove = (ev) => {
            state.tx.cur = ev.clientX - half;
            state.ty.cur = ev.clientY - half;
            if (!started) {
              started = true;
              state.tx.prev = state.tx.cur;
              state.ty.prev = state.ty.cur;
            }
          };
          window.addEventListener("mousemove", onMove);
          cleanups.push(() => window.removeEventListener("mousemove", onMove));

          const hoverables = Array.from(
            root.querySelectorAll("[data-dt-hover]"),
          );
          hoverables.forEach((el) => {
            const onEnter = () => {
              state.scale.cur = 1.8;
              state.opacity.cur = 0.5;
            };
            const onLeave = () => {
              state.scale.cur = 1;
              state.opacity.cur = 1;
            };
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
            cleanups.push(() => {
              el.removeEventListener("mouseenter", onEnter);
              el.removeEventListener("mouseleave", onLeave);
            });
          });

          const render = () => {
            Object.keys(state).forEach((key) => {
              state[key].prev = lerp(
                state[key].prev,
                started ? state[key].cur : 0,
                state[key].amt,
              );
            });
            cursorEl.style.transform =
              "translateX(" +
              state.tx.prev +
              "px) translateY(" +
              state.ty.prev +
              "px) scale(" +
              state.scale.prev +
              ")";
            cursorEl.style.opacity = state.opacity.prev;
            rafId = requestAnimationFrame(render);
          };
          rafId = requestAnimationFrame(render);
        }

        cleanups.push(() => {
          navigateRef.current = null;
          groups.forEach((g) => {
            gsap.killTweensOf(g.el);
            gsap.killTweensOf(g.imgs);
            gsap.killTweensOf(g.chars);
          });
        });
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
    };
  }, [
    slides,
    imageOpacity,
    slideDuration,
    charDuration,
    charStagger,
    charRotation,
    travel,
    cursorSize,
    cursorEase,
    showCursor,
  ]);

  const go = (direction) => {
    if (navigateRef.current) navigateRef.current(direction);
  };

  const chars = (text) =>
    Array.from(text).map((ch, i) => (
      <span
        key={i}
        data-dt-char=""
        className="relative inline-block will-change-transform"
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <div
      ref={rootRef}
      data-dt={sid}
      className={
        "relative grid h-screen min-h-[700px] w-full grid-cols-1 grid-rows-1 overflow-hidden " +
        className
      }
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {slides.map((slide, si) => (
        <div
          key={si}
          data-dt-slide=""
          className="col-start-1 row-start-1 flex h-full w-full items-center justify-center opacity-0"
        >
          <div
            className="flex h-[calc(100%-6rem)] w-full flex-wrap content-center items-center justify-center self-center"
            style={{
              minWidth: clusterWidth + "px",
              transform: "rotate(" + rotation + "deg)",
              transformOrigin: "50% 50%",
            }}
          >
            {slide.images.slice(0, 4).map((src, ii) => (
              <div key={ii} className="contents">
                <img
                  data-dt-img=""
                  src={src}
                  alt=""
                  draggable="false"
                  className={
                    "block w-auto flex-none object-cover opacity-0 " +
                    (ii === 1
                      ? "self-end"
                      : ii === 2
                        ? "self-start"
                        : "self-auto")
                  }
                  style={{
                    height:
                      ii === 0 || ii === 3
                        ? "calc(50% + " + imageGap * 2 + "rem)"
                        : "calc(50% - " + imageGap + "rem)",
                    marginRight:
                      ii === 0 || ii === 2 ? imageGap + "rem" : undefined,
                    marginBottom:
                      ii === 0 || ii === 1 ? imageGap + "rem" : undefined,
                  }}
                />
                {ii === 1 ? <div className="h-0 basis-full" /> : null}
              </div>
            ))}
          </div>

          <h2 className="pointer-events-none absolute inset-0 m-0 flex flex-col items-center justify-center text-center leading-none uppercase select-none">
            <span
              data-dt-line=""
              className="flex overflow-hidden"
              style={{
                fontSize: titleSize,
                fontFamily: titleFont,
                fontWeight: titleWeight,
                letterSpacing: titleTracking,
              }}
            >
              {chars(slide.top)}
            </span>
            <span
              data-dt-line=""
              className="my-2 flex overflow-hidden normal-case italic"
              style={{
                fontSize: middleSize,
                fontFamily: middleFont,
                fontWeight: middleWeight,
                letterSpacing: "0.08em",
              }}
            >
              {chars(slide.middle)}
            </span>
            <span
              data-dt-line=""
              className="flex overflow-hidden"
              style={{
                fontSize: titleSize,
                fontFamily: titleFont,
                fontWeight: titleWeight,
                letterSpacing: titleTracking,
              }}
            >
              {chars(slide.bottom)}
            </span>
          </h2>
        </div>
      ))}

      <button
        type="button"
        data-dt-hover=""
        onClick={() => go("prev")}
        aria-label="Previous slide"
        className="absolute top-1/2 left-[8vw] z-20 m-0 h-5 w-[90px] -translate-y-1/2 cursor-pointer appearance-none border-0 bg-transparent p-0 transition-transform duration-200 ease-out outline-none hover:-translate-x-[15%] md:left-[15vw]"
      >
        <svg viewBox="0 0 82 20" className="block h-full w-full">
          <path d="M82 10H9" stroke={textColor} strokeWidth="2" />
          <path
            d="M10.474 0C7.988 4 4.118 7.422 0 10c4.156 2.539 7.865 6 10.474 10h2.485c-2.608-4-5.744-7.379-9.618-10C7.215 7.34 10.474 4 13 0h-2.526zm6 0C13.987 4 10.116 7.422 6 10c4.156 2.539 7.865 6 10.474 10h2.485c-2.606-4-5.745-7.379-9.617-10C13.214 7.34 16.474 4 19 0h-2.526z"
            fill={textColor}
          />
        </svg>
      </button>

      <button
        type="button"
        data-dt-hover=""
        onClick={() => go("next")}
        aria-label="Next slide"
        className="absolute top-1/2 right-[8vw] z-20 m-0 h-5 w-[90px] -translate-y-1/2 cursor-pointer appearance-none border-0 bg-transparent p-0 transition-transform duration-200 ease-out outline-none hover:translate-x-[15%] md:right-[15vw]"
      >
        <svg viewBox="0 0 82 20" className="block h-full w-full">
          <path d="M0 10h73" stroke={textColor} strokeWidth="2" />
          <path
            d="M71.526 0C74.012 4 77.882 7.422 82 10c-4.156 2.539-7.865 6-10.474 10h-2.485c2.608-4 5.744-7.379 9.618-10C74.785 7.34 71.526 4 69 0h2.526zm-6 0C68.013 4 71.884 7.422 76 10c-4.156 2.539-7.865 6-10.474 10H63.04c2.606-4 5.745-7.379 9.617-10C68.786 7.34 65.526 4 63 0h2.526z"
            fill={textColor}
          />
        </svg>
      </button>

      {showCursor ? (
        <svg
          ref={cursorRef}
          width={cursorSize}
          height={cursorSize}
          viewBox={"0 0 " + cursorSize + " " + cursorSize}
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-50 hidden opacity-0 [@media(any-pointer:fine)]:block"
        >
          <circle
            cx={cursorSize / 2}
            cy={cursorSize / 2}
            r={cursorRadius}
            fill="transparent"
            stroke={accentColor}
            strokeWidth="1"
            opacity="0.7"
          />
        </svg>
      ) : null}
    </div>
  );
}
