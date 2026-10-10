"use client";

import { useEffect, useId, useRef } from "react";

// ─── PushGrid ────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images           string[] (25 urls)  Background image urls, one per grid item
// positions        string[] (13 areas) grid-area value for each item, index-matched to images
// rows             number   7          Grid row count (includes the offscreen ring)
// columns          number   7          Grid column count (includes the offscreen ring)
// rowGap           string   '5%'       Vertical gap between items
// columnGap        string   '5%'       Horizontal gap between items
// variant          string   'default'  'default' | 'rounded' | 'scale'
// bgColor          string   #000       Page background base color
// gradTop          string   #081326    Radial gradient color at top
// gradBottom       string   #24112f    Radial gradient color at bottom
// brightness       number   0.6        Idle image brightness filter
// brightnessOpen   number   1          Brightness once expanded
// borderRadius     number   12         Idle corner radius, px (rounded variant)
// borderRadiusOpen number   20         Expanded corner radius, px (rounded variant)
// scaleHeight      string   '40vh'     Expanded square size (scale variant)
// duration         number   0.9        FLIP animation duration (s)
// ease             string   'expo'     GSAP ease for the FLIP
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_POSITIONS = [
  "2 / 2 / 3 / 3",
  "4 / 2 / 5 / 3",
  "6 / 2 / 7 / 3",
  "3 / 3 / 4 / 4",
  "5 / 3 / 6 / 4",
  "2 / 4 / 3 / 5",
  "4 / 4 / 5 / 5",
  "6 / 4 / 7 / 5",
  "3 / 5 / 4 / 6",
  "5 / 5 / 6 / 6",
  "2 / 6 / 3 / 7",
  "4 / 6 / 5 / 7",
  "6 / 6 / 7 / 7",
];

export default function PushGrid({
  images = DEFAULT_IMAGES,
  positions = DEFAULT_POSITIONS,
  rows = 7,
  columns = 7,
  rowGap = "5%",
  columnGap = "5%",
  variant = "default",
  bgColor = "#000",
  gradTop = "#081326",
  gradBottom = "#24112f",
  brightness = 0.6,
  brightnessOpen = 1,
  borderRadius = 12,
  borderRadiusOpen = 20,
  scaleHeight = "40vh",
  duration = 0.9,
  ease = "expo",
}) {
  const rawId = useId();
  const uid = `pg${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const gridRef = useRef(null);
  const fullscreenRef = useRef(null);
  const isOpenRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

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

    const preload = (urls) =>
      Promise.all(
        urls.map(
          (url) =>
            new Promise((resolve) => {
              const img = new window.Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = url;
            }),
        ),
      );

    const cleanups = [];

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ).then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
        ),
      ),
      preload(images.slice(0, positions.length)),
    ])
      .then(() => {
        if (cancelled) return;

        const { gsap, Flip } = window;
        const gridEl = gridRef.current;
        const fsEl = fullscreenRef.current;
        if (!gsap || !Flip || !gridEl || !fsEl) return;

        gsap.registerPlugin(Flip);
        gsap.set(gridEl, { autoAlpha: 1 });

        const items = Array.from(gridEl.querySelectorAll(`.${uid}-item`));
        const animationDefaults = { duration, ease };

        const determinePositionClass = (itemRect, clickedRect) => {
          if (itemRect.bottom < clickedRect.top) return `${uid}-north`;
          if (itemRect.top > clickedRect.bottom) return `${uid}-south`;
          if (itemRect.right < clickedRect.left) return `${uid}-west`;
          if (itemRect.left > clickedRect.right) return `${uid}-east`;
          return "";
        };

        const flipImage = (item, image) => {
          gsap.set(item, { zIndex: 99 });
          const state = Flip.getState(image);

          if (isOpenRef.current) {
            item.appendChild(image);
            image.classList.remove(`${uid}-open`);
          } else {
            fsEl.appendChild(image);
            image.classList.add(`${uid}-open`);
          }

          Flip.from(state, {
            ...animationDefaults,
            scale: true,
            prune: true,
            onComplete: () => {
              if (isOpenRef.current) gsap.set(item, { zIndex: "auto" });
              isOpenRef.current = !isOpenRef.current;
            },
          });
        };

        const moveOtherItems = (item) => {
          const clickedRect = item.getBoundingClientRect();
          const others = items.filter((i) => i !== item);
          const state = Flip.getState(others);

          others.forEach((other) => {
            const classname = determinePositionClass(
              other.getBoundingClientRect(),
              clickedRect,
            );
            if (classname)
              other.classList.toggle(classname, !isOpenRef.current);
          });

          Flip.from(state, { ...animationDefaults, scale: true, prune: true });
        };

        items.forEach((item) => {
          const image = item.querySelector(`.${uid}-img`);
          if (!image) return;
          const handler = () => {
            flipImage(item, image);
            moveOtherItems(item);
          };
          image.addEventListener("click", handler);
          cleanups.push(() => image.removeEventListener("click", handler));
        });
      })
      .catch((e) => console.error("[PushGrid] load failed:", e.message));

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [uid, images, positions, duration, ease]);

  const css = `
    .${uid}-stage {
      --cgap: ${columnGap};
      --rgap: ${rowGap};
      --rows: ${rows};
      --columns: ${columns};
      --item-width: calc((100% + (var(--columns) - 1) * var(--cgap)) / var(--columns));
      --item-height: calc((100% + (var(--rows) - 1) * var(--rgap)) / var(--rows));
      width: calc(100% + var(--item-width) * 2 + var(--cgap) * 2);
      height: calc(100% + var(--item-height) * 2 + var(--rgap) * 2);
      left: calc(-1 * var(--item-width) - var(--cgap));
      top: calc(-1 * var(--item-height) - var(--rgap));
      grid-template-areas: 'main';
      grid-template-columns: 100%;
      grid-template-rows: 100%;
    }
    .${uid}-grid {
      grid-area: main;
      grid-template-columns: repeat(var(--columns), 1fr);
      grid-template-rows: repeat(var(--rows), 1fr);
      grid-row-gap: var(--rgap);
      grid-column-gap: var(--cgap);
    }
    ${positions
      .map((area, i) => `.${uid}-pos-${i} { grid-area: ${area}; }`)
      .join("\n")}
    .${uid}-north { grid-row: 1; }
    .${uid}-south { grid-row: var(--rows); }
    .${uid}-west  { grid-column: 1; }
    .${uid}-east  { grid-column: var(--columns); }
    .${uid}-img {
      filter: brightness(${brightness});
      ${variant === "rounded" ? `border-radius: ${borderRadius}px;` : ""}
      ${variant === "scale" ? "aspect-ratio: 1; width: auto; height: 100%;" : ""}
    }
    .${uid}-img.${uid}-open {
      filter: brightness(${brightnessOpen});
      ${variant === "rounded" ? `border-radius: ${borderRadiusOpen}px;` : ""}
      ${variant === "scale" ? `height: ${scaleHeight};` : ""}
    }
    .${uid}-fs {
      ${
        variant === "rounded"
          ? "width: calc(100% - 30px); height: calc(100% - 30px); top: 15px; left: 15px;"
          : variant === "scale"
            ? "width: 100%; height: 100%; top: 0; left: 0; display: flex; align-items: center; justify-content: center;"
            : "width: calc(100% + 8px); height: calc(100% + 8px); top: -4px; left: -4px;"
      }
    }
  `;

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundColor: bgColor,
        backgroundImage: `radial-gradient(ellipse at top, ${gradTop}, transparent), radial-gradient(ellipse at bottom, ${gradBottom}, transparent)`,
        backgroundSize: "100%, 200%",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`${uid}-stage relative grid`}>
        <div
          ref={gridRef}
          className={`${uid}-grid grid grid-flow-col pointer-events-none invisible opacity-0`}
        >
          {positions.map((_, i) => (
            <div
              key={i}
              className={`${uid}-item ${uid}-pos-${i} relative w-full h-full [will-change:transform,opacity]`}
            >
              <div
                className={`${uid}-img w-full h-full bg-cover bg-center pointer-events-auto cursor-pointer [will-change:transform,border-radius,filter]`}
                style={{ backgroundImage: `url(${images[i % images.length]})` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        ref={fullscreenRef}
        className={`${uid}-fs absolute pointer-events-none`}
      />
    </div>
  );
}
