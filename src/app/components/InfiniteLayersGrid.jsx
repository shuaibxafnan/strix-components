"use client";

import { useEffect, useId, useRef } from "react";

// ─── InfiniteLayersGrid ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor                string   #ffffff    Page background color
// textColor              string   #000000    Base text color (header + captions)
// fontFamily             string   "'Roboto Mono', monospace"  Font used throughout (loaded from Google Fonts automatically)
// images                 array    [see DEFAULT_IMAGES]  [{ src, caption: string[] }] — caption is an array of lines
// layoutData             array    [see DEFAULT_LAYOUT]  [{ x, y, w, h }] source-resolution tile positions/sizes
// originalSize           object   { w: 1522, h: 1238 }  Resolution the layoutData coordinates were authored at
// scrollEase             number   0.06       Lerp ease applied to scroll/drag momentum each frame
// wheelFactor            number   0.4        Multiplier applied to wheel delta before it moves the grid
// introDuration          number   2          Duration (s) of the opening "items fly into place" animation
// introStagger           number   0.05       Stagger (s) between each item in the intro animation
// mouseParallaxStrength  number   0.6        How far each tile shifts toward the cursor, as a fraction of its own size
// baseImageScale         number   1.2        Resting zoom applied to every image inside its tile
// pressImageScaleBoost   number   0.2        Extra zoom added to images while the mouse is held down
// captionFontSize        string   "0.7rem"   Font size for the line-mask caption under each tile
// showHeader             boolean  true       Show the fixed top header bar
// headerTitle            string   "#Infinite Layers Grid"  Header heading text
// headerLinks            array    [see DEFAULT_LINKS]  [{ label, href }] rendered next to the header title
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=800&q=80",
    caption: [
      "Thirty Knots",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2021",
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=800&q=80",
    caption: [
      "Sad Mis-Step",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2024",
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=800&q=80",
    caption: [
      "Mini Orange",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2014",
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=800&q=80",
    caption: [
      "After Storm",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2022",
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=800&q=80",
    caption: [
      "Untitled",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2016",
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=800&q=80",
    caption: [
      "Toilet Paper",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2022",
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=800&q=80",
    caption: [
      "Cocoa Eggplant Tomato",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2025",
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=800&q=80",
    caption: [
      "Toilet Paper II",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2022",
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=800&q=80",
    caption: [
      "Production Fun Fact",
      "12 x 16 inch print",
      "Edition of 1 + artist proof",
      "2024",
    ],
  },
];

const DEFAULT_LAYOUT = [
  { x: 71, y: 58, w: 400, h: 270 },
  { x: 211, y: 255, w: 540, h: 360 },
  { x: 631, y: 158, w: 400, h: 270 },
  { x: 1191, y: 245, w: 260, h: 195 },
  { x: 351, y: 687, w: 260, h: 290 },
  { x: 751, y: 824, w: 205, h: 154 },
  { x: 911, y: 540, w: 260, h: 350 },
  { x: 1051, y: 803, w: 400, h: 300 },
  { x: 71, y: 922, w: 350, h: 260 },
];

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

const loadFont = (href) => {
  if (document.querySelector(`link[data-id="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-id", href);
  document.head.appendChild(link);
};

export default function InfiniteLayersGrid({
  bgColor = "#ffffff",
  textColor = "#000000",
  fontFamily = "'Roboto Mono', monospace",
  images = DEFAULT_IMAGES,
  layoutData = DEFAULT_LAYOUT,
  originalSize = { w: 1522, h: 1238 },
  scrollEase = 0.06,
  wheelFactor = 0.4,
  introDuration = 2,
  introStagger = 0.05,
  mouseParallaxStrength = 0.6,
  baseImageScale = 1.2,
  pressImageScaleBoost = 0.2,
  captionFontSize = "0.7rem",
  showHeader = true,
}) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef(null);

  useEffect(() => {
    loadFont(
      "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100..700&display=swap",
    );

    let cancelled = false;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(() => {
        if (cancelled) return;
        const { gsap } = window;
        const $container = containerRef.current;
        if (!gsap || !$container) return;

        gsap.config({ trialWarn: false });

        // ── state ────────────────────────────────────────────────────
        const scroll = {
          current: { x: 0, y: 0 },
          target: { x: 0, y: 0 },
          last: { x: 0, y: 0 },
          delta: { x: { c: 0, t: 0 }, y: { c: 0, t: 0 } },
        };
        const mouse = {
          x: { t: 0.5, c: 0.5 },
          y: { t: 0.5, c: 0.5 },
          press: { t: 0, c: 0 },
        };
        const drag = { startX: 0, startY: 0, scrollX: 0, scrollY: 0 };
        let isDragging = false;
        let items = [];
        let tileSize = { w: 0, h: 0 };
        let winW = 0;
        let winH = 0;
        let rafId = null;

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("visible", entry.isIntersecting);
          });
        });

        // ── build/rebuild the tiled grid ────────────────────────────
        const build = () => {
          winW = window.innerWidth;
          winH = window.innerHeight;

          tileSize = {
            w: winW,
            h: winW * (originalSize.h / originalSize.w),
          };

          scroll.current = { x: 0, y: 0 };
          scroll.target = { x: 0, y: 0 };
          scroll.last = { x: 0, y: 0 };

          $container.innerHTML = "";

          const baseItems = layoutData.map((d, i) => {
            const scaleX = tileSize.w / originalSize.w;
            const scaleY = tileSize.h / originalSize.h;
            const source = images[i % images.length];
            return {
              src: source.src,
              caption: source.caption,
              x: d.x * scaleX,
              y: d.y * scaleY,
              w: d.w * scaleX,
              h: d.h * scaleY,
            };
          });

          items = [];
          const repsX = [0, tileSize.w];
          const repsY = [0, tileSize.h];

          baseItems.forEach((base) => {
            repsX.forEach((offsetX) => {
              repsY.forEach((offsetY) => {
                const el = document.createElement("div");
                el.style.position = "absolute";
                el.style.top = "0";
                el.style.left = "0";
                el.style.willChange = "transform";
                el.style.width = `${base.w}px`;

                const wrapper = document.createElement("div");
                wrapper.style.willChange = "transform";
                el.appendChild(wrapper);

                const itemImage = document.createElement("div");
                itemImage.style.overflow = "hidden";
                itemImage.style.width = `${base.w}px`;
                itemImage.style.height = `${base.h}px`;
                wrapper.appendChild(itemImage);

                const img = new Image();
                img.src = base.src;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "cover";
                img.style.willChange = "transform";
                itemImage.appendChild(img);

                const caption = document.createElement("small");
                caption.className = `${uid}-caption`;
                caption.style.width = "100%";
                caption.style.display = "block";
                caption.style.fontSize = captionFontSize;
                caption.style.lineHeight = "1.25";
                caption.style.marginTop = "0.75rem";
                caption.style.color = textColor;
                caption.style.fontFamily = fontFamily;

                base.caption.forEach((line, i) => {
                  const mask = document.createElement("span");
                  mask.className = `${uid}-line-mask`;
                  mask.style.overflow = "hidden";
                  mask.style.display = "block";
                  mask.style.transitionDelay = `${i * 0.15}s`;

                  const lineEl = document.createElement("span");
                  lineEl.className = `${uid}-line`;
                  lineEl.style.display = "block";
                  lineEl.style.transitionDelay = `${i * 0.15}s`;
                  lineEl.textContent = line;

                  mask.appendChild(lineEl);
                  caption.appendChild(mask);
                });

                wrapper.appendChild(caption);
                $container.appendChild(el);
                observer.observe(caption);

                items.push({
                  el,
                  img,
                  x: base.x + offsetX,
                  y: base.y + offsetY,
                  w: base.w,
                  h: base.h,
                  extraX: 0,
                  extraY: 0,
                  rect: el.getBoundingClientRect(),
                  ease: Math.random() * 0.5 + 0.5,
                });
              });
            });
          });

          tileSize.w *= 2;
          tileSize.h *= 2;

          scroll.current.x = scroll.target.x = scroll.last.x = -winW * 0.1;
          scroll.current.y = scroll.target.y = scroll.last.y = -winH * 0.1;
        };

        // ── intro animation ──────────────────────────────────────────
        const playIntro = () => {
          const wrappers = [
            ...$container.querySelectorAll(":scope > div > div"),
          ].filter((item) => {
            const rect = item.getBoundingClientRect();
            return (
              rect.x > -rect.width &&
              rect.x < window.innerWidth + rect.width &&
              rect.y > -rect.height &&
              rect.y < window.innerHeight + rect.height
            );
          });

          wrappers.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const x = -rect.x + window.innerWidth * 0.5 - rect.width * 0.5;
            const y = -rect.y + window.innerHeight * 0.5 - rect.height * 0.5;
            gsap.set(item, { x, y });
          });

          gsap.to(wrappers.reverse(), {
            duration: introDuration,
            ease: "expo.inOut",
            x: 0,
            y: 0,
            stagger: introStagger,
          });
        };

        // ── render loop ──────────────────────────────────────────────
        const render = () => {
          scroll.current.x += (scroll.target.x - scroll.current.x) * scrollEase;
          scroll.current.y += (scroll.target.y - scroll.current.y) * scrollEase;

          scroll.delta.x.t = scroll.current.x - scroll.last.x;
          scroll.delta.y.t = scroll.current.y - scroll.last.y;
          scroll.delta.x.c += (scroll.delta.x.t - scroll.delta.x.c) * 0.04;
          scroll.delta.y.c += (scroll.delta.y.t - scroll.delta.y.c) * 0.04;
          mouse.x.c += (mouse.x.t - mouse.x.c) * 0.04;
          mouse.y.c += (mouse.y.t - mouse.y.c) * 0.04;
          mouse.press.c += (mouse.press.t - mouse.press.c) * 0.04;

          const dirX = scroll.current.x > scroll.last.x ? "right" : "left";
          const dirY = scroll.current.y > scroll.last.y ? "down" : "up";

          items.forEach((item) => {
            const newX =
              5 * scroll.delta.x.c * item.ease +
              (mouse.x.c - 0.5) * item.rect.width * mouseParallaxStrength;
            const newY =
              5 * scroll.delta.y.c * item.ease +
              (mouse.y.c - 0.5) * item.rect.height * mouseParallaxStrength;
            const scrollX = scroll.current.x;
            const scrollY = scroll.current.y;
            const posX = item.x + scrollX + item.extraX + newX;
            const posY = item.y + scrollY + item.extraY + newY;

            const beforeX = posX > winW;
            const afterX = posX + item.rect.width < 0;
            if (dirX === "right" && beforeX) item.extraX -= tileSize.w;
            if (dirX === "left" && afterX) item.extraX += tileSize.w;

            const beforeY = posY > winH;
            const afterY = posY + item.rect.height < 0;
            if (dirY === "down" && beforeY) item.extraY -= tileSize.h;
            if (dirY === "up" && afterY) item.extraY += tileSize.h;

            const fx = item.x + scrollX + item.extraX + newX;
            const fy = item.y + scrollY + item.extraY + newY;
            item.el.style.transform = `translate(${fx}px, ${fy}px)`;
            item.img.style.transform = `scale(${
              baseImageScale + pressImageScaleBoost * mouse.press.c * item.ease
            }) translate(${-mouse.x.c * item.ease * 10}%, ${-mouse.y.c * item.ease * 10}%)`;
          });

          scroll.last.x = scroll.current.x;
          scroll.last.y = scroll.current.y;

          rafId = requestAnimationFrame(render);
        };

        // ── events ───────────────────────────────────────────────────
        const onResize = () => build();

        const onWheel = (e) => {
          e.preventDefault();
          scroll.target.x -= e.deltaX * wheelFactor;
          scroll.target.y -= e.deltaY * wheelFactor;
        };

        const onMouseDown = (e) => {
          e.preventDefault();
          isDragging = true;
          $container.style.cursor = "grabbing";
          mouse.press.t = 1;
          drag.startX = e.clientX;
          drag.startY = e.clientY;
          drag.scrollX = scroll.target.x;
          drag.scrollY = scroll.target.y;
        };

        const onMouseUp = () => {
          isDragging = false;
          $container.style.cursor = "grab";
          mouse.press.t = 0;
        };

        const onMouseMove = (e) => {
          mouse.x.t = e.clientX / winW;
          mouse.y.t = e.clientY / winH;

          if (isDragging) {
            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;
            scroll.target.x = drag.scrollX + dx;
            scroll.target.y = drag.scrollY + dy;
          }
        };

        window.addEventListener("resize", onResize);
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("mousemove", onMouseMove);
        $container.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);

        build();
        render();
        playIntro();

        containerRef.current._cleanup = () => {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("mousemove", onMouseMove);
          $container.removeEventListener("mousedown", onMouseDown);
          window.removeEventListener("mouseup", onMouseUp);
          observer.disconnect();
          if (rafId) cancelAnimationFrame(rafId);
        };
      })
      .catch((e) =>
        console.error("[InfiniteLayersGrid] Setup failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (containerRef.current?._cleanup) containerRef.current._cleanup();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className="relative h-screen w-full overflow-hidden uppercase"
      style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
    >
      <section
        ref={containerRef}
        className="relative h-full w-full cursor-grab select-none normal-case"
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${uid}-line-mask,
            .${uid}-line {
              transition: transform 2s cubic-bezier(0.6, 0.14, 0, 1);
            }
            .${uid}-caption:not(.visible) .${uid}-line-mask {
              transform: translateY(100%);
            }
            .${uid}-caption:not(.visible) .${uid}-line {
              transform: translateY(110%);
            }
          `,
        }}
      />
    </main>
  );
}
