"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    title: "Funambulist",
    number: "01",
    tags: ["#house", "#green", "#chair"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    title: "Omophagy",
    number: "02",
    tags: ["#love", "#hug", "#people"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    title: "Conniption",
    number: "03",
    tags: ["#hike", "#nature", "#rain"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    title: "Xenology",
    number: "04",
    tags: ["#free", "#wood", "#fire"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    title: "Lycanthropy",
    number: "05",
    tags: ["#cloud", "#lake", "#frog"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    title: "Mudlark",
    number: "06",
    tags: ["#tent", "#flower", "#love"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    title: "Illywhacker",
    number: "07",
    tags: ["#water", "#bottle", "#hand"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    title: "Disenthral",
    number: "08",
    tags: ["#night", "#stars", "#moon"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    title: "Abaya",
    number: "09",
    tags: ["#sun", "#light", "#air"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    title: "Hallux",
    number: "10",
    tags: ["#vital", "#fog", "#close"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    title: "Lablab",
    number: "11",
    tags: ["#cover", "#bed", "#window"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    title: "Momisom",
    number: "12",
    tags: ["#sad", "#mouth", "#tear"],
    link: "explore",
  },
];

const DEFAULT_INTRO_META = ["Twelve plates", "Drag or scroll to advance"];

const DEFAULT_OUTRO_META = [
  "Twelve of twelve",
  "Drag back to run it in reverse",
];

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@300;400;500&display=swap";

const clamp = (n, min, max) => (n <= min ? min : n >= max ? max : n);
const lerp = (a, b, n) => (1 - n) * a + n * b;
const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export default function DriftRailGallery({
  items = DEFAULT_ITEMS,
  introTitle = "Sidelong",
  introMeta = DEFAULT_INTRO_META,
  outroTitle = "Fin",
  outroMeta = DEFAULT_OUTRO_META,
  bgColor = "#121a27",
  textColor = "#4a525e",
  titleColor = "#4a525e",
  numberColor = "#54d7e4",
  tagColor = "#e95499",
  plateTitleColor = "#e95499",
  linkColor = "#ffffff",
  linkBgColor = "#e95499",
  linkHoverColor = "#e95499",
  linkBgHoverColor = "#ffffff",
  cursorFill = "#79e2e6",
  cursorStroke = "none",
  cursorStrokeWidth = "1px",
  cursorSize = 20,
  cursorHoverScale = 2.5,
  scrollEase = 0.085,
  cursorEase = 0.2,
  scrollSpeed = 1,
  dragSpeed = 1.6,
  rotationRange = 30,
  translationRange = 100,
  effectStart = 0.6,
  linkSize = 120,
  linkOverlap = "3.25rem",
  imageWidth = "21vmax",
  imageHeight = "28vmax",
  itemGap = "3vw",
  plateWidth = "26rem",
  displayFont = "'Instrument Serif', Georgia, 'Times New Roman', serif",
  bodyFont = "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
  loadFonts = true,
  className = "",
}) {
  const rawId = useId();
  const uid = "hsg-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const cursorRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (!loadFonts) return;
    if (document.querySelector('link[data-id="' + FONT_HREF + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    link.setAttribute("data-id", FONT_HREF);
    document.head.appendChild(link);
  }, [loadFonts]);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(any-pointer: fine)").matches;

    const ease = reduced ? 1 : clamp(scrollEase, 0.01, 1);

    const figures = itemsRef.current.filter(Boolean);
    const rotations = figures.map(() =>
      randomNumber(-rotationRange, rotationRange),
    );
    const translations = figures.map(() =>
      randomNumber(-translationRange, translationRange),
    );

    let current = 0;
    let target = 0;
    let max = 0;
    let viewport = 0;
    let frame = 0;
    let cached = [];

    const measure = () => {
      viewport = root.clientWidth;
      max = Math.max(0, track.scrollWidth - viewport);
      cached = figures.map((el) => ({
        el,
        left: el.offsetLeft,
        width: el.offsetWidth,
      }));
      target = clamp(target, 0, max);
      current = clamp(current, 0, max);
    };

    const cursor = fine ? cursorRef.current : null;
    const mouse = { x: 0, y: 0 };
    const cur = {
      tx: { previous: 0, current: 0, amt: cursorEase },
      ty: { previous: 0, current: 0, amt: cursorEase },
      scale: { previous: 1, current: 1, amt: 0.15 },
    };
    let cursorReady = false;

    const onFirstMove = (ev) => {
      mouse.x = ev.clientX;
      mouse.y = ev.clientY;
      cur.tx.previous = cur.tx.current = mouse.x - cursorSize / 2;
      cur.ty.previous = cur.ty.current = mouse.y - cursorSize / 2;
      cursorReady = true;
      if (cursor) cursor.style.opacity = "1";
      window.removeEventListener("mousemove", onFirstMove);
    };

    const onMouseMove = (ev) => {
      mouse.x = ev.clientX;
      mouse.y = ev.clientY;
    };

    if (cursor) {
      cursor.style.opacity = "0";
      window.addEventListener("mousemove", onFirstMove);
      window.addEventListener("mousemove", onMouseMove);
    }

    const enter = () => {
      cur.scale.current = cursorHoverScale;
    };
    const leave = () => {
      cur.scale.current = 1;
    };
    const targets = cursor
      ? Array.from(root.querySelectorAll("[data-cursor-target]"))
      : [];
    targets.forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });

    const onWheel = (ev) => {
      const delta =
        Math.abs(ev.deltaY) > Math.abs(ev.deltaX) ? ev.deltaY : ev.deltaX;
      if (
        (target <= 0 && delta < 0) ||
        (target >= max && delta > 0) ||
        max === 0
      ) {
        return;
      }
      ev.preventDefault();
      target = clamp(target + delta * scrollSpeed, 0, max);
    };
    root.addEventListener("wheel", onWheel, { passive: false });

    let dragging = false;
    let dragStartX = 0;
    let dragStartTarget = 0;

    const onPointerDown = (ev) => {
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      dragging = true;
      dragStartX = ev.clientX;
      dragStartTarget = target;
      root.setPointerCapture(ev.pointerId);
      root.style.cursor = fine ? "none" : "grabbing";
    };
    const onPointerMove = (ev) => {
      if (!dragging) return;
      const delta = (dragStartX - ev.clientX) * dragSpeed;
      target = clamp(dragStartTarget + delta, 0, max);
    };
    const onPointerUp = (ev) => {
      if (!dragging) return;
      dragging = false;
      if (root.hasPointerCapture(ev.pointerId))
        root.releasePointerCapture(ev.pointerId);
      root.style.cursor = fine ? "none" : "grab";
    };
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);

    const onKeyDown = (ev) => {
      const step = viewport * 0.6;
      if (ev.key === "ArrowRight" || ev.key === "PageDown") {
        ev.preventDefault();
        target = clamp(target + step, 0, max);
      } else if (ev.key === "ArrowLeft" || ev.key === "PageUp") {
        ev.preventDefault();
        target = clamp(target - step, 0, max);
      } else if (ev.key === "Home") {
        ev.preventDefault();
        target = 0;
      } else if (ev.key === "End") {
        ev.preventDefault();
        target = max;
      }
    };
    root.addEventListener("keydown", onKeyDown);

    const render = () => {
      current =
        Math.abs(target - current) < 0.05
          ? target
          : lerp(current, target, ease);
      track.style.transform =
        "translate3d(" + -current.toFixed(2) + "px, 0px, 0px)";

      for (let i = 0; i < cached.length; i++) {
        const entry = cached[i];
        const pos = entry.left - current;
        const progress = clamp(
          (viewport - pos) / (viewport + entry.width),
          0,
          1,
        );
        let rotationVal = 0;
        let translationVal = 0;
        if (progress > effectStart) {
          rotationVal = clamp(
            map(progress, effectStart, 1, 0, rotations[i]),
            Math.min(0, rotations[i]),
            Math.max(0, rotations[i]),
          );
          translationVal = clamp(
            map(progress, effectStart, 1, 0, translations[i]),
            Math.min(0, translations[i]),
            Math.max(0, translations[i]),
          );
        }
        entry.el.style.transform =
          "translateY(" +
          translationVal.toFixed(2) +
          "%) rotate(" +
          rotationVal.toFixed(2) +
          "deg)";
      }

      if (cursor && cursorReady) {
        cur.tx.current = mouse.x - cursorSize / 2;
        cur.ty.current = mouse.y - cursorSize / 2;
        cur.tx.previous = lerp(cur.tx.previous, cur.tx.current, cur.tx.amt);
        cur.ty.previous = lerp(cur.ty.previous, cur.ty.current, cur.ty.amt);
        cur.scale.previous = lerp(
          cur.scale.previous,
          cur.scale.current,
          cur.scale.amt,
        );
        cursor.style.transform =
          "translateX(" +
          cur.tx.previous.toFixed(2) +
          "px) translateY(" +
          cur.ty.previous.toFixed(2) +
          "px) scale(" +
          cur.scale.previous.toFixed(3) +
          ")";
      }

      frame = requestAnimationFrame(render);
    };

    measure();
    frame = requestAnimationFrame(render);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(onResize);
      observer.observe(track);
    }

    const imgs = Array.from(root.querySelectorAll("[data-gallery-img]"));
    imgs.forEach((el) => el.addEventListener("load", onResize));

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onFirstMove);
      window.removeEventListener("mousemove", onMouseMove);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("keydown", onKeyDown);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
      imgs.forEach((el) => el.removeEventListener("load", onResize));
      if (observer) observer.disconnect();
    };
  }, [
    items,
    scrollEase,
    cursorEase,
    scrollSpeed,
    dragSpeed,
    rotationRange,
    translationRange,
    effectStart,
    cursorSize,
    cursorHoverScale,
  ]);

  const css =
    "#" +
    uid +
    " { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }" +
    "#" +
    uid +
    " ." +
    uid +
    "-pill { background: " +
    linkBgColor +
    "; color: " +
    linkColor +
    "; transition: background 0.3s ease, color 0.3s ease; }" +
    "#" +
    uid +
    " ." +
    uid +
    "-pill:hover, #" +
    uid +
    " ." +
    uid +
    "-pill:focus-visible { background: " +
    linkBgHoverColor +
    "; color: " +
    linkHoverColor +
    "; text-decoration: none; }" +
    "#" +
    uid +
    " ." +
    uid +
    "-img { transition: transform 0.6s cubic-bezier(0.2, 1, 0.3, 1); }" +
    "#" +
    uid +
    " ." +
    uid +
    "-figure:hover ." +
    uid +
    "-img { transform: scale(1.06); }" +
    "@media (any-pointer: fine) { #" +
    uid +
    " { cursor: none; } #" +
    uid +
    " a, #" +
    uid +
    " [data-cursor-target] { cursor: none; } }" +
    "@media (any-pointer: coarse) { #" +
    uid +
    "-cursor { display: none; } }" +
    "@media (prefers-reduced-motion: reduce) { #" +
    uid +
    " ." +
    uid +
    "-img, #" +
    uid +
    " ." +
    uid +
    "-pill { transition: none; } }";

  return (
    <div
      id={uid}
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-label="Horizontal image gallery"
      className={"relative h-screen w-full select-none overflow-hidden outline-none" + (className ? " " + className : "")}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        touchAction: "pan-y",
      }}
    >
      <style>{css}</style>

      <div
        ref={trackRef}
        className="relative flex h-full items-center will-change-transform"
        style={{ width: "max-content" }}
      >
        <div
          className="flex shrink-0 flex-col items-center justify-center text-center"
          style={{
            width: plateWidth,
            marginLeft: "12vw",
            marginRight: "7vw",
          }}
        >
          <h2
            className="m-0 italic"
            style={{
              color: plateTitleColor,
              fontFamily: displayFont,
              fontWeight: 400,
              fontSize: "clamp(3rem, 6vw, 4.5rem)",
              lineHeight: 1,
            }}
          >
            {introTitle}
          </h2>

          <div className="mt-7 flex flex-col gap-1">
            {introMeta.map((line, i) => (
              <span
                key={i}
                className="text-[0.85rem] uppercase"
                style={{ color: titleColor, letterSpacing: "0.16em" }}
              >
                {line}
              </span>
            ))}
          </div>
        </div>

        {items.map((item, i) => (
          <figure
            key={i}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            className={
              uid + "-figure relative m-0 grid shrink-0 will-change-transform"
            }
            style={{
              marginLeft: itemGap,
              marginRight: itemGap,
              gridTemplateAreas:
                "'dot-a dot-b' 'dot-c gallery-image' 'dot-d dot-e'",
              gridTemplateColumns: "8rem " + imageWidth,
              gridTemplateRows: "8rem " + imageHeight + " 3rem",
            }}
          >
            <div
              data-cursor-target
              className="relative h-full w-full overflow-hidden"
              style={{ gridArea: "gallery-image", transformOrigin: "50% 100%" }}
            >
              <img
                data-gallery-img
                src={item.image}
                alt={item.title}
                draggable="false"
                loading="lazy"
                className={uid + "-img h-full w-full object-cover"}
                style={{ objectPosition: "50% 0" }}
              />
            </div>

            <figcaption
              className="grid"
              style={{
                gridArea: "1 / 1 / 4 / 3",
                gridTemplateAreas:
                  "'gallery-number gallery-title' 'gallery-link dot-f' 'gallery-link gallery-tags'",
                gridTemplateColumns: "8rem auto",
                gridTemplateRows: "8rem auto 3rem",
              }}
            >
              <span
                data-cursor-target
                className="self-center justify-self-end pr-8 italic"
                style={{
                  gridArea: "gallery-number",
                  color: numberColor,
                  fontFamily: displayFont,
                  fontWeight: 400,
                  fontSize: "clamp(2.5rem, 9vw, 6.5rem)",
                  lineHeight: 1,
                }}
              >
                {item.number}
              </span>

              <h2
                className="m-0 self-center italic"
                style={{
                  gridArea: "gallery-title",
                  color: titleColor,
                  fontFamily: displayFont,
                  fontWeight: 400,
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                }}
              >
                {item.title}
              </h2>

              <button
                type="button"
                data-cursor-target
                className={
                  uid +
                  "-pill relative z-10 flex items-center justify-center self-end rounded-full text-[1.5rem] underline"
                }
                style={{
                  gridArea: "gallery-link",
                  fontFamily: bodyFont,
                  height: linkSize + "px",
                  width: linkSize + "px",
                  marginLeft: "auto",
                  marginRight: "-" + linkOverlap,
                }}
              >
                {item.link}
              </button>

              <p
                data-cursor-target
                className="m-0 grid gap-4 self-center justify-self-end text-[1.5rem]"
                style={{
                  gridArea: "gallery-tags",
                  gridAutoFlow: "column",
                  color: tagColor,
                }}
              >
                {item.tags.map((tag, t) => (
                  <span key={t}>{tag}</span>
                ))}
              </p>
            </figcaption>
          </figure>
        ))}

        <div
          className="flex shrink-0 flex-col items-center justify-center text-center"
          style={{
            width: plateWidth,
            marginLeft: "7vw",
            marginRight: "12vw",
          }}
        >

          <h2
            className="m-0 italic"
            style={{
              color: plateTitleColor,
              fontFamily: displayFont,
              fontWeight: 400,
              fontSize: "clamp(3rem, 6vw, 4.5rem)",
              lineHeight: 1,
            }}
          >
            {outroTitle}
          </h2>

          <div className="mt-7 flex flex-col gap-1">
            {outroMeta.map((line, i) => (
              <span
                key={i}
                className="text-[0.85rem] uppercase"
                style={{ color: titleColor, letterSpacing: "0.16em" }}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      </div>

      <svg
        id={uid + "-cursor"}
        ref={cursorRef}
        width={cursorSize}
        height={cursorSize}
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] block"
        style={{ opacity: 0 }}
      >
        <circle
          cx="10"
          cy="10"
          r="5"
          style={{
            fill: cursorFill,
            stroke: cursorStroke,
            strokeWidth: cursorStrokeWidth,
            opacity: 0.7,
          }}
        />
      </svg>
    </div>
  );
}
