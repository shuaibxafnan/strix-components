"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    title: "Moonraker",
    number: "01",
    tags: ["#house", "#green", "#chair"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    title: "Nacarat",
    number: "02",
    tags: ["#love", "#hug", "#people"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    title: "Selkie",
    number: "03",
    tags: ["#hike", "#nature", "#rain"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    title: "Thalassic",
    number: "04",
    tags: ["#free", "#wood", "#fire"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    title: "Uroboros",
    number: "05",
    tags: ["#cloud", "#lake", "#frog"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    title: "Waitron",
    number: "06",
    tags: ["#tent", "#flower", "#love"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    title: "Soucouyant",
    number: "07",
    tags: ["#water", "#bottle", "#hand"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    title: "Periapt",
    number: "08",
    tags: ["#night", "#stars", "#moon"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    title: "Cyanic",
    number: "09",
    tags: ["#sun", "#light", "#air"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    title: "Martlet",
    number: "10",
    tags: ["#vital", "#fog", "#close"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    title: "Eurhythmic",
    number: "11",
    tags: ["#cover", "#bed", "#window"],
    link: "explore",
  },
  {
    image:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    title: "Dariole",
    number: "12",
    tags: ["#sad", "#mouth", "#tear"],
    link: "explore",
  },
];

const DEFAULT_TEXT_BLOCKS = [
  { after: 3, words: ["Verjuice", "Zyrian"], speeds: [1, 3] },
  { after: 7, words: ["Tiffin", "Skanky"], speeds: [1, 2] },
  { after: 11, words: ["Deasil", "Zetetic"], speeds: [3, 1] },
];

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@300;400;500&display=swap";

const clamp = (n, min, max) => (n <= min ? min : n >= max ? max : n);
const lerp = (a, b, n) => (1 - n) * a + n * b;
const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;

export default function DriftSkewGallery({
  items = DEFAULT_ITEMS,
  textBlocks = DEFAULT_TEXT_BLOCKS,
  stageRotation = -4,
  bgColor = "#0e0e0d",
  textColor = "#66665d",
  titleColor = "#d9d0be",
  numberColor = "#181817",
  tagColor = "#cc0000",
  strokeColor = "#645c5b",
  strokeWidth = "1px",
  linkColor = "#ffffff",
  linkBgColor = "#cc0000",
  linkHoverColor = "#0e0e0d",
  linkBgHoverColor = "#d9d0be",
  cursorFill = "#cc0000",
  cursorStroke = "none",
  cursorStrokeWidth = "1px",
  cursorSize = 20,
  cursorHoverScale = 2.5,
  scrollEase = 0.085,
  cursorEase = 0.2,
  scrollSpeed = 1,
  dragSpeed = 1.6,
  maxSkew = 15,
  skewRange = 50,
  parallaxStrength = 0.12,
  imageSpeed = -0.8,
  titleSpeed = 1,
  numberSpeed = 1.5,
  imageWidth = "21vmax",
  imageHeight = "28vmax",
  itemGap = "3vw",
  linkSize = 120,
  linkOverlap = "3.25rem",
  displayFont = "'Instrument Serif', Georgia, 'Times New Roman', serif",
  bodyFont = "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
  loadFonts = true,
  ariaLabel = "Horizontal image gallery",
  className = "",
}) {
  const rawId = useId();
  const uid = "ssg-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const cursorRef = useRef(null);

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
    const skewLimit = reduced ? 0 : maxSkew;
    const strength = reduced ? 0 : parallaxStrength;

    const frames = Array.from(root.querySelectorAll("[data-skew-frame]"));
    const parallaxEls = Array.from(root.querySelectorAll("[data-speed]"));

    let current = 0;
    let target = 0;
    let cache = 0;
    let max = 0;
    let viewport = 0;
    let raf = 0;
    let cached = [];

    const measure = () => {
      viewport = root.clientWidth;
      max = Math.max(0, track.scrollWidth - viewport);
      cached = parallaxEls.map((el) => {
        const anchor = el.closest("[data-anchor]") || el;
        return {
          el,
          speed: parseFloat(el.getAttribute("data-speed")) || 0,
          left: anchor.offsetLeft,
          width: anchor.offsetWidth,
        };
      });
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
        max === 0 ||
        (target <= 0 && delta < 0) ||
        (target >= max && delta > 0)
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
    };
    const onPointerMove = (ev) => {
      if (!dragging) return;
      target = clamp(
        dragStartTarget + (dragStartX - ev.clientX) * dragSpeed,
        0,
        max,
      );
    };
    const onPointerUp = (ev) => {
      if (!dragging) return;
      dragging = false;
      if (root.hasPointerCapture(ev.pointerId))
        root.releasePointerCapture(ev.pointerId);
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

      const distance = current - cache;
      cache = current;
      const skewVal = clamp(
        map(distance, -skewRange, skewRange, -skewLimit, skewLimit),
        -skewLimit,
        skewLimit,
      );
      for (let i = 0; i < frames.length; i++) {
        frames[i].style.transform = "skewX(" + skewVal.toFixed(2) + "deg)";
      }

      for (let i = 0; i < cached.length; i++) {
        const entry = cached[i];
        const center = entry.left + entry.width / 2 - current;
        const shift = (viewport / 2 - center) * entry.speed * strength;
        entry.el.style.transform =
          "translate3d(" + shift.toFixed(2) + "px, 0px, 0px)";
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

      raf = requestAnimationFrame(render);
    };

    measure();
    raf = requestAnimationFrame(render);

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
      cancelAnimationFrame(raf);
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
    textBlocks,
    scrollEase,
    cursorEase,
    scrollSpeed,
    dragSpeed,
    maxSkew,
    skewRange,
    parallaxStrength,
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
    "-stroked { color: transparent; -webkit-text-stroke: " +
    strokeWidth +
    " " +
    strokeColor +
    "; -webkit-text-fill-color: transparent; }" +
    "@media (any-pointer: fine) { #" +
    uid +
    " { cursor: none; } #" +
    uid +
    " a, #" +
    uid +
    " button, #" +
    uid +
    " [data-cursor-target] { cursor: none; } }" +
    "@media (any-pointer: coarse) { #" +
    uid +
    "-cursor { display: none; } }" +
    "@media (prefers-reduced-motion: reduce) { #" +
    uid +
    " ." +
    uid +
    "-pill { transition: none; } }";

  const blocksAfter = {};
  textBlocks.forEach((block) => {
    blocksAfter[block.after] = block;
  });

  const renderTextBlock = (block, key) => (
    <div
      key={key}
      className={uid + "-stroked m-0 flex shrink-0 flex-col self-center"}
      style={{
        marginLeft: "12vw",
        marginRight: "12vw",
        fontFamily: displayFont,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: "20vw",
        lineHeight: 0.8,
        textTransform: "lowercase",
        whiteSpace: "nowrap",
      }}
      aria-hidden="true"
    >
      {block.words.map((word, w) => (
        <span
          key={w}
          data-speed={block.speeds && block.speeds[w] ? block.speeds[w] : 0}
          className="block will-change-transform"
        >
          {word}
        </span>
      ))}
    </div>
  );

  return (
    <div
      id={uid}
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      className={"relative h-screen w-full select-none overflow-hidden outline-none " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        touchAction: "pan-y",
      }}
    >
      <style>{css}</style>

      <div
        className="flex h-full w-full items-center"
        style={{ transform: "rotate(" + stageRotation + "deg)" }}
      >
        <div
          ref={trackRef}
          className="relative flex items-center will-change-transform"
          style={{
            width: "max-content",
            marginLeft: "5vw",
            paddingRight: "12vw",
          }}
        >
          {items.map((item, i) => {
            const nodes = [];

            nodes.push(
              <figure
                key={"item-" + i}
                data-anchor
                className="relative m-0 grid shrink-0"
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
                  data-skew-frame
                  data-cursor-target
                  className="relative h-full w-full overflow-hidden will-change-transform"
                  style={{ gridArea: "gallery-image" }}
                >
                  <div
                    data-speed={imageSpeed}
                    className="h-full will-change-transform"
                    style={{ width: "calc(100% + 10vw)", marginLeft: "-5vw" }}
                  >
                    <img
                      data-gallery-img
                      src={item.image}
                      alt={item.title}
                      draggable="false"
                      loading="lazy"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: "50% 0" }}
                    />
                  </div>
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
                    data-speed={numberSpeed}
                    data-cursor-target
                    className="self-center justify-self-end pr-8 italic will-change-transform"
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
                    data-speed={titleSpeed}
                    className="m-0 self-center italic will-change-transform"
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
              </figure>,
            );

            if (blocksAfter[i]) {
              nodes.push(renderTextBlock(blocksAfter[i], "text-" + i));
            }

            return nodes;
          })}
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
