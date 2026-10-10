"use client";

import { useEffect, useId, useRef } from "react";

// ─── DraggableGridMenu ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// sections            array    (5 demo)  [{ title, images: [] }] — one entry per menu item
// bgColor             string   #f1f1f1   Page background
// textColor           string   #1e1e1e   Filled letter / text color
// strokeColor         string   #1e1e1e   Outline color of the stroke letters
// accentColor         string   #de6565   Explore link, back arrow and cursor color
// fontFamily          string   sans      Font stack for the whole component
// menuFontSize        string   12vw      Menu item font size
// menuGap             string   10vw      Horizontal gap between menu items
// showCounters        boolean  true      Show the 01 / 02 numbering beside each item
// letterExitShift     string   40%       Distance letters slide when the grid view opens
// letterExitStagger   number   0.02      Per-letter delay of that slide (s)
// exploreLabel        string   explore   Text of the link that opens the grid
// dragFactor          number   1         Multiplier on pointer travel (higher = menu moves further)
// dragThreshold       number   0.04      Fraction of viewport width needed to commit a navigation
// menuLerp            number   0.1       Smoothing of the menu translation (0–1, lower = laggier)
// letterLerp          number   0.1       Smoothing of the letter fill/stroke swap
// imageLerp           number   0.1       Smoothing of grid image opacity and translation
// imageScaleLerp      number   0.06      Smoothing of grid image scale
// imgScaleXTarget     number   2         Horizontal stretch the outgoing grid reaches
// imgScaleYTarget     number   0.8       Vertical squash the outgoing grid reaches
// imgShiftTarget      number   150       Distance (%) the outgoing grid images travel
// settleDuration      number   0.8       Snap/settle duration after the drag ends (s)
// settleEase          string   power2.out  Ease of the settle animation
// imageDuration       number   1         Grid image transition duration on commit (s)
// imageEase           string   power4.out  Ease of the grid image transition
// gridDuration        number   0.8       Spread / collapse duration (s)
// gridEase            string   expo.out  Ease of the spread / collapse
// spreadScale         number   0.35      Scale of the scattered thumbnails in menu mode
// spreadMarginX       number   0.02      Horizontal keep-inside margin when scattering (× vw)
// spreadMarginY       number   0.04      Vertical keep-inside margin when scattering (× vh)
// gridHeight          string   80vw      Height of the expanded grid canvas
// gridGap             string   1vw       Gap between grid cells
// gridPadding         string   2.5rem 3rem  Padding around the grid canvas
// previewFilter       string   grayscale(0.5) contrast(0.4) brightness(1.5)  Filter on scattered thumbs
// enableCursor        boolean  true      Custom circular cursor with drag arrows
// cursorSize          number   25        Cursor circle diameter (px)
// cursorHoverScale    number   1.9       Cursor scale on hovering a link
// cursorDragScale     number   1.5       Cursor scale while dragging
// cursorLerp          number   0.2       Cursor follow smoothing (0–1)
// initialSection      number   0         Menu item shown first
// className           string   ""        Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const IMAGES = [
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
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

const pick = (start, count) =>
  Array.from({ length: count }, (_, i) => IMAGES[(start + i) % IMAGES.length]);

const DEFAULT_SECTIONS = [
  { title: "Mezcala", images: pick(0, 9) },
  { title: "Caricia", images: pick(9, 8) },
  { title: "Esquirla", images: pick(4, 9) },
  { title: "Sangre", images: pick(13, 8) },
  { title: "Petricor", images: pick(6, 9) },
];

const LAYOUTS = [
  [
    "3 / 1 / 8 / 4",
    "1 / 2 / 3 / 4",
    "5 / 4 / 8 / 8",
    "2 / 7 / 5 / 11",
    "1 / 4 / 5 / 7",
    "8 / 5 / 11 / 2",
    "10 / 9 / 8 / 11",
    "5 / 8 / 8 / 10",
    "8 / 5 / 11 / 9",
  ],
  [
    "2 / 1 / 5 / 4",
    "1 / 4 / 4 / 7",
    "1 / 7 / 5 / 10",
    "5 / 1 / 7 / 4",
    "4 / 4 / 7 / 7",
    "7 / 7 / 11 / 4",
    "5 / 7 / 8 / 11",
    "7 / 2 / 9 / 4",
    "9 / 4 / 11 / 7",
  ],
  [
    "1 / 2 / 3 / 5",
    "3 / 1 / 6 / 5",
    "1 / 5 / 5 / 8",
    "2 / 8 / 6 / 11",
    "5 / 5 / 8 / 8",
    "6 / 8 / 8 / 11",
    "6 / 2 / 8 / 5",
    "11 / 4 / 8 / 7",
    "8 / 9 / 11 / 7",
  ],
  [
    "2 / 1 / 4 / 4",
    "1 / 4 / 3 / 7",
    "3 / 4 / 5 / 7",
    "1 / 7 / 4 / 11",
    "4 / 2 / 7 / 4",
    "5 / 7 / 8 / 4",
    "4 / 7 / 8 / 11",
    "8 / 9 / 11 / 4",
    "8 / 1 / 11 / 4",
  ],
  [
    "2 / 1 / 5 / 4",
    "1 / 4 / 5 / 7",
    "5 / 2 / 7 / 5",
    "1 / 7 / 4 / 11",
    "5 / 7 / 7 / 5",
    "7 / 5 / 10 / 1",
    "4 / 7 / 7 / 9",
    "4 / 9 / 9 / 11",
    "7 / 5 / 11 / 9",
  ],
];

export default function DragPhotoGrid({
  sections = DEFAULT_SECTIONS,
  bgColor = "#f1f1f1",
  textColor = "#1e1e1e",
  strokeColor = "#1e1e1e",
  accentColor = "#de6565",
  fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif',
  menuFontSize = "12vw",
  menuGap = "10vw",
  letterExitShift = "40%",
  letterExitStagger = 0.02,
  exploreLabel = "explore",
  dragFactor = 1,
  dragThreshold = 0.04,
  menuLerp = 0.1,
  letterLerp = 0.1,
  imageLerp = 0.1,
  imageScaleLerp = 0.06,
  imgScaleXTarget = 2,
  imgScaleYTarget = 0.8,
  imgShiftTarget = 150,
  settleDuration = 0.8,
  settleEase = "power2.out",
  imageDuration = 1,
  imageEase = "power4.out",
  gridDuration = 0.8,
  gridEase = "expo.out",
  spreadScale = 0.35,
  spreadMarginX = 0.02,
  spreadMarginY = 0.04,
  gridHeight = "80vw",
  gridGap = "1vw",
  gridPadding = "2.5rem 3rem",
  previewFilter = "grayscale(0.5) contrast(0.4) brightness(1.5)",
  enableCursor = true,
  cursorSize = 25,
  cursorHoverScale = 1.9,
  cursorDragScale = 1.5,
  cursorLerp = 0.2,
  initialSection = 0,
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    const cleanups = [];
    let rafId;

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

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(() => {
        if (disposed) return;
        const { gsap } = window;
        if (!gsap) return;

        const lerp = (a, b, n) => (1 - n) * a + n * b;
        const lineEq = (y2, y1, x2, x1, v) => {
          const m = (y2 - y1) / (x2 - x1);
          return m * v + (y1 - m * x1);
        };
        const randFloat = (min, max) => Math.random() * (max - min) + min;

        const winsize = { width: 0, height: 0 };
        const calcWinsize = () => {
          winsize.width = window.innerWidth;
          winsize.height = window.innerHeight;
        };
        calcWinsize();

        const stage = root.querySelector("[data-dm='stage']");
        const menuEl = root.querySelector("[data-dm='menu']");
        const dragEl = root.querySelector("[data-dm='draggable']");
        const backCtrl = root.querySelector("[data-dm='back']");
        const cursorEl = root.querySelector("[data-dm='cursor']");
        const cursorArrows = [
          root.querySelector("[data-dm='cursor-left']"),
          root.querySelector("[data-dm='cursor-right']"),
        ].filter(Boolean);

        const mousepos = { x: winsize.width / 2, y: winsize.height / 2 };
        const onMouseMove = (ev) => {
          mousepos.x = ev.clientX;
          mousepos.y = ev.clientY;
        };
        window.addEventListener("mousemove", onMouseMove);
        cleanups.push(() =>
          window.removeEventListener("mousemove", onMouseMove),
        );

        const cursorStyles = {
          tx: { previous: 0, current: 0, amt: cursorLerp },
          ty: { previous: 0, current: 0, amt: cursorLerp },
          scale: { previous: 1, current: 1, amt: cursorLerp },
        };

        const grids = Array.from(root.querySelectorAll("[data-dm='grid']")).map(
          (el) => ({
            el,
            wraps: Array.from(el.querySelectorAll("[data-dm='cell']")),
            images: Array.from(el.querySelectorAll("[data-dm='img']")),
          }),
        );

        const spread = (grid, animate = false) =>
          new Promise((resolve) => {
            const gridHeightPx = grid.el.scrollHeight;
            const gridTop = grid.el.offsetTop;
            let count = 0;
            const totalCells = grid.wraps.length;
            if (!totalCells) return resolve();
            grid.wraps.forEach((item) => {
              const rect = item.getBoundingClientRect();
              const center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              };
              const quadrant =
                center.x >= winsize.width / 2
                  ? center.y <= gridHeightPx / 2 + gridTop
                    ? 1
                    : 4
                  : center.y <= gridHeightPx / 2 + gridTop
                    ? 2
                    : 3;
              const margins = {
                x: winsize.width * spreadMarginX,
                y: winsize.height * spreadMarginY,
              };
              const tx =
                quadrant === 1 || quadrant === 4
                  ? randFloat(
                      -center.x + winsize.width / 2 + margins.x * 4,
                      winsize.width - center.x - margins.x,
                    )
                  : randFloat(
                      -center.x + margins.x,
                      winsize.width / 2 - center.x - margins.x * 4,
                    );
              const ty =
                quadrant === 1 || quadrant === 2
                  ? randFloat(
                      -center.y + margins.y,
                      winsize.height / 2 - center.y - margins.y * 4,
                    )
                  : randFloat(
                      -center.y + winsize.height / 2 + margins.y * 4,
                      winsize.height - center.y - margins.y,
                    );
              if (animate) {
                gsap.to(item, {
                  duration: gridDuration,
                  ease: gridEase,
                  x: tx,
                  y: ty,
                  scale: spreadScale,
                  onComplete: () => {
                    if (++count === totalCells) resolve();
                  },
                });
              } else {
                gsap.set(item, { x: tx, y: ty, scale: spreadScale });
              }
            });
            if (!animate) resolve();
          });

        const collapse = (grid) =>
          new Promise((resolve) => {
            gsap.to(grid.wraps, {
              duration: gridDuration,
              ease: gridEase,
              x: 0,
              y: 0,
              scale: 1.01,
              onComplete: resolve,
            });
          });

        grids.forEach((grid) => spread(grid, false));

        const items = Array.from(root.querySelectorAll("[data-dm='item']")).map(
          (el, index) => {
            const link = el.querySelector("[data-dm='link']");
            if (link.dataset.rawText === undefined) {
              link.dataset.rawText = link.textContent;
            }
            const raw = link.dataset.rawText;
            link.textContent = "";
            for (const ch of raw) {
              const letter = document.createElement("span");
              letter.className = "dm-letter";
              const filled = document.createElement("span");
              filled.className = "dm-letter-inner dm-letter-filled";
              filled.textContent = ch === " " ? "\u00A0" : ch;
              const stroke = document.createElement("span");
              stroke.className = "dm-letter-inner dm-letter-stroke";
              stroke.textContent = filled.textContent;
              letter.appendChild(filled);
              letter.appendChild(stroke);
              link.appendChild(letter);
            }
            return {
              el,
              link,
              explore: el.querySelector("[data-dm='explore']"),
              letters: Array.from(el.querySelectorAll(".dm-letter-inner")),
              filled: Array.from(el.querySelectorAll(".dm-letter-filled")),
              stroke: Array.from(el.querySelectorAll(".dm-letter-stroke")),
              grid: grids[index],
              rect: el.getBoundingClientRect(),
            };
          },
        );

        const totalItems = items.length;
        let current = Math.min(Math.max(initialSection, 0), totalItems - 1);

        const showExplore = (item) =>
          new Promise((resolve) => {
            gsap.to(item.explore, {
              duration: 0.6,
              ease: "expo.out",
              startAt: { scale: 0.5 },
              opacity: 1,
              scale: 1,
              onComplete: resolve,
            });
          });

        const hideExplore = (item) =>
          new Promise((resolve) => {
            gsap.to(item.explore, {
              duration: 0.6,
              ease: "expo.out",
              opacity: 0,
              scale: 0.8,
              onComplete: resolve,
            });
          });

        const setBlend = (item, p) => {
          gsap.set(item.filled, { opacity: 1 - p });
          gsap.set(item.stroke, { opacity: p });
        };

        const blendTo = (item, p, tl, duration, ease) => {
          tl.to(item.filled, { duration, ease, opacity: 1 - p }, 0).to(
            item.stroke,
            { duration, ease, opacity: p },
            0,
          );
        };

        const toggleLetters = (item, action) =>
          new Promise((resolve) => {
            const isCurrent = item.el.dataset.state === "current";
            if (action === "hide") {
              gsap.to(item.letters, {
                duration: gridDuration,
                ease: gridEase,
                x: letterExitShift,
                opacity: 0,
                stagger: letterExitStagger,
                onComplete: resolve,
              });
            } else {
              gsap.to(item.letters, {
                duration: gridDuration,
                ease: gridEase,
                startAt: { x: letterExitShift },
                x: "0%",
                opacity: (i, target) =>
                  target.classList.contains("dm-letter-stroke")
                    ? isCurrent
                      ? 1
                      : 0
                    : isCurrent
                      ? 0
                      : 1,
                stagger: letterExitStagger,
                onComplete: resolve,
              });
            }
          });

        items.forEach((item, i) => {
          item.el.dataset.state = i === current ? "current" : "idle";
          gsap.set(item.letters, { x: "0%" });
          setBlend(item, i === current ? 1 : 0);
          gsap.set(item.explore, { opacity: 0, scale: 0.8 });
        });
        gsap.set(items[current].grid.images, { opacity: 1 });
        showExplore(items[current]);

        let minDrag = winsize.width * dragThreshold;
        let initTx =
          winsize.width / 2 -
          items[current].el.offsetLeft -
          items[current].rect.width / 2;
        let currentPosition = initTx;
        gsap.set(menuEl, { x: initTx });

        const styles = {
          menuTranslation: { previous: initTx, current: initTx, amt: menuLerp },
          letterTranslation: { previous: 0, current: 0, amt: letterLerp },
          imgOpacity: { previous: 1, current: 1, amt: imageLerp },
          imgScaleX: { previous: 1, current: 1, amt: imageScaleLerp },
          imgScaleY: { previous: 1, current: 1, amt: imageScaleLerp },
          imgTranslation: { previous: 0, current: 0, amt: imageLerp },
        };

        let dragging = false;
        let dragX = 0;
        let dragStartX = 0;
        let dragDirection = "";
        let currentDirection = "";
        let cachedX = 0;
        let amountToMove = minDrag;
        let upcomingIdx;
        let currentItem;
        let upcomingItem;
        let isAnimating = false;
        let dragPosition = 0;
        let looping = true;

        const render = () => {
          if (disposed) return;
          for (const key in styles) {
            styles[key].previous = lerp(
              styles[key].previous,
              styles[key].current,
              styles[key].amt,
            );
          }
          gsap.set(menuEl, { x: styles.menuTranslation.previous });

          if (enableCursor && cursorEl) {
            cursorStyles.tx.current = mousepos.x - cursorSize / 2;
            cursorStyles.ty.current = mousepos.y - cursorSize / 2;
            for (const key in cursorStyles) {
              cursorStyles[key].previous = lerp(
                cursorStyles[key].previous,
                cursorStyles[key].current,
                cursorStyles[key].amt,
              );
            }
            cursorEl.style.transform = `translateX(${cursorStyles.tx.previous}px) translateY(${cursorStyles.ty.previous}px) scale(${cursorStyles.scale.previous})`;
          }

          if (dragDirection !== "" && currentItem && upcomingItem) {
            const p = styles.letterTranslation.previous / 100;
            setBlend(currentItem, 1 - p);
            setBlend(upcomingItem, p);
            gsap.set(currentItem.grid.images, {
              transformOrigin: dragDirection === "left" ? "100% 50%" : "0% 50%",
              opacity: styles.imgOpacity.previous,
              scaleX: styles.imgScaleX.previous,
              scaleY: styles.imgScaleY.previous,
              x:
                (dragDirection === "left"
                  ? -styles.imgTranslation.previous
                  : styles.imgTranslation.previous) + "%",
            });
            gsap.set(upcomingItem.grid.images, {
              transformOrigin: dragDirection === "left" ? "0% 50%" : "100% 50%",
              opacity: Math.abs(1 - styles.imgOpacity.previous),
              scaleX: 1 + imgScaleXTarget - styles.imgScaleX.previous,
              scaleY: 1 + imgScaleYTarget - styles.imgScaleY.previous,
              x:
                (dragDirection === "left"
                  ? imgShiftTarget - styles.imgTranslation.previous
                  : -(imgShiftTarget - styles.imgTranslation.previous)) + "%",
            });
          }

          if (looping) rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        const stopLoop = () => {
          looping = false;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = undefined;
        };
        const startLoop = () => {
          if (looping && rafId) return;
          looping = true;
          rafId = requestAnimationFrame(render);
        };

        const resetStyleValues = () => {
          styles.letterTranslation.current =
            styles.letterTranslation.previous = 0;
          styles.imgOpacity.current = styles.imgOpacity.previous = 1;
          styles.imgScaleX.current = styles.imgScaleX.previous = 1;
          styles.imgScaleY.current = styles.imgScaleY.previous = 1;
          styles.imgTranslation.current = styles.imgTranslation.previous = 0;
        };

        const onPointerDown = (ev) => {
          if (isAnimating || stage.dataset.view === "grid") return;
          dragging = true;
          dragStartX = ev.clientX;
          dragX = 0;
          dragDirection = "";
          cachedX = 0;
          dragEl.setPointerCapture?.(ev.pointerId);
          if (enableCursor) {
            cursorStyles.scale.current = cursorDragScale;
            gsap.to(cursorArrows, {
              duration: 1,
              ease: "expo.out",
              startAt: { x: (i) => (i ? 10 : -10) },
              opacity: 1,
              x: 0,
            });
          }
        };

        const onPointerMove = (ev) => {
          if (!dragging || isAnimating) return;
          dragX = (ev.clientX - dragStartX) * dragFactor;

          if (dragX !== cachedX) {
            currentDirection = dragX > cachedX ? "right" : "left";
            cachedX = dragX;
          }

          if (dragDirection === "") {
            if (Math.abs(dragX) < 2) return;
            hideExplore(items[current]);
            dragDirection = dragX > 0 ? "right" : "left";
            if (
              (dragDirection === "right" && current === 0) ||
              (dragDirection === "left" && current === totalItems - 1)
            ) {
              amountToMove = minDrag;
              currentItem = undefined;
              upcomingItem = undefined;
            } else {
              upcomingIdx =
                dragDirection === "left" ? current + 1 : current - 1;
              currentItem = items[current];
              upcomingItem = items[upcomingIdx];
              const a = currentItem.el;
              const b = upcomingItem.el;
              amountToMove = Math.abs(
                a.offsetLeft +
                  a.offsetWidth / 2 -
                  (b.offsetLeft + b.offsetWidth / 2),
              );
            }
          }

          dragPosition = lineEq(amountToMove, 0, winsize.width, 0, dragX);
          const travel =
            dragDirection === "left"
              ? Math.abs(Math.min(dragX, 0))
              : Math.abs(Math.max(dragX, 0));

          styles.menuTranslation.current = dragPosition + currentPosition;
          styles.letterTranslation.current = lineEq(
            100,
            0,
            winsize.width,
            0,
            travel,
          );
          styles.imgOpacity.current = lineEq(0, 1, winsize.width, 0, travel);
          styles.imgScaleX.current = lineEq(
            imgScaleXTarget,
            1,
            winsize.width,
            0,
            travel,
          );
          styles.imgScaleY.current = lineEq(
            imgScaleYTarget,
            1,
            winsize.width,
            0,
            travel,
          );
          styles.imgTranslation.current = lineEq(
            imgShiftTarget,
            0,
            winsize.width,
            0,
            travel,
          );
        };

        const onPointerUp = () => {
          if (!dragging) return;
          dragging = false;
          if (enableCursor) {
            cursorStyles.scale.current = 1;
            gsap.to(cursorArrows, {
              duration: 1,
              ease: "expo.out",
              x: (i) => (i ? 10 : -10),
              opacity: 0,
            });
          }

          if (dragDirection === "") {
            dragPosition = 0;
            return;
          }

          if (!isAnimating) {
            isAnimating = true;
            stopLoop();

            const cancelled =
              Math.abs(dragPosition) <= minDrag ||
              dragDirection !== currentDirection ||
              !currentItem ||
              !upcomingItem;

            if (cancelled) {
              showExplore(items[current]);
              styles.menuTranslation.current = styles.menuTranslation.previous =
                currentPosition;
              resetStyleValues();

              const tl = gsap.timeline({
                onComplete: () => {
                  startLoop();
                  currentItem = undefined;
                  upcomingItem = undefined;
                  isAnimating = false;
                },
              });
              tl.to(
                menuEl,
                {
                  duration: settleDuration,
                  ease: settleEase,
                  x: currentPosition,
                },
                0,
              );
              if (currentItem && upcomingItem) {
                blendTo(currentItem, 1, tl, settleDuration, settleEase);
                blendTo(upcomingItem, 0, tl, settleDuration, settleEase);
                tl.to(
                  currentItem.grid.images,
                  {
                    duration: imageDuration,
                    ease: imageEase,
                    opacity: 1,
                    scaleX: 1,
                    scaleY: 1,
                    x: "0%",
                  },
                  0,
                ).to(
                  upcomingItem.grid.images,
                  {
                    duration: imageDuration,
                    ease: imageEase,
                    opacity: 0,
                    scaleX: imgScaleXTarget,
                    scaleY: imgScaleYTarget,
                    x:
                      dragDirection === "left"
                        ? `${imgShiftTarget}%`
                        : `-${imgShiftTarget}%`,
                  },
                  0,
                );
              }
            } else {
              showExplore(items[upcomingIdx]);
              currentPosition =
                styles.menuTranslation.current =
                styles.menuTranslation.previous =
                  dragDirection === "left"
                    ? currentPosition - amountToMove
                    : currentPosition + amountToMove;
              resetStyleValues();

              const outgoing = currentItem;
              const incoming = upcomingItem;
              const dir = dragDirection;

              const commitTl = gsap
                .timeline({
                  onComplete: () => {
                    startLoop();
                    outgoing.el.dataset.state = "idle";
                    incoming.el.dataset.state = "current";
                    current = upcomingIdx;
                    currentItem = undefined;
                    upcomingItem = undefined;
                    isAnimating = false;
                  },
                })
                .to(
                  menuEl,
                  {
                    duration: settleDuration,
                    ease: settleEase,
                    x: currentPosition,
                  },
                  0,
                )
                .to(
                  outgoing.grid.images,
                  {
                    duration: imageDuration,
                    ease: imageEase,
                    opacity: 0,
                    scaleX: imgScaleXTarget,
                    scaleY: imgScaleYTarget,
                    x:
                      dir === "left"
                        ? `-${imgShiftTarget}%`
                        : `${imgShiftTarget}%`,
                  },
                  0,
                )
                .to(
                  incoming.grid.images,
                  {
                    duration: imageDuration,
                    ease: imageEase,
                    opacity: 1,
                    scaleX: 1,
                    scaleY: 1,
                    x: "0%",
                  },
                  0,
                );
              blendTo(outgoing, 0, commitTl, settleDuration, settleEase);
              blendTo(incoming, 1, commitTl, settleDuration, settleEase);
            }
          }

          dragPosition = 0;
          dragDirection = "";
        };

        dragEl.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
        cleanups.push(() => {
          dragEl.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);
          window.removeEventListener("pointercancel", onPointerUp);
        });

        const toggleBackCtrl = (action) =>
          new Promise((resolve) => {
            gsap.to(backCtrl, {
              duration: 0.6,
              ease: "expo.out",
              startAt: action === "hide" ? {} : { x: "100%" },
              opacity: action === "hide" ? 0 : 1,
              x: action === "hide" ? "-100%" : "0%",
              onComplete: resolve,
            });
          });

        const showContent = () => {
          if (isAnimating) return;
          isAnimating = true;
          stopLoop();
          stage.dataset.view = "grid";
          const jobs = [
            collapse(items[current].grid),
            hideExplore(items[current]),
            ...items.map((item) => toggleLetters(item, "hide")),
            toggleBackCtrl("show"),
          ];
          Promise.all(jobs).then(() => {
            isAnimating = false;
          });
        };

        const hideContent = () => {
          if (isAnimating) return;
          isAnimating = true;
          stage.scrollTo({ top: 0, behavior: "auto" });
          stage.dataset.view = "menu";
          startLoop();
          const jobs = [
            spread(items[current].grid, true),
            showExplore(items[current]),
            ...items.map((item) => toggleLetters(item, "show")),
            toggleBackCtrl("hide"),
          ];
          Promise.all(jobs).then(() => {
            isAnimating = false;
          });
        };

        items.forEach((item) => {
          const onExplore = () => showContent();
          item.explore.addEventListener("click", onExplore);
          cleanups.push(() =>
            item.explore.removeEventListener("click", onExplore),
          );
        });

        if (backCtrl) {
          const onBack = () => hideContent();
          backCtrl.addEventListener("click", onBack);
          cleanups.push(() => backCtrl.removeEventListener("click", onBack));
        }

        if (enableCursor) {
          root.querySelectorAll("[data-dm-hover]").forEach((el) => {
            const onEnter = () => {
              cursorStyles.scale.current = cursorHoverScale;
            };
            const onLeave = () => {
              cursorStyles.scale.current = 1;
            };
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
            cleanups.push(() => {
              el.removeEventListener("mouseenter", onEnter);
              el.removeEventListener("mouseleave", onLeave);
            });
          });
        }

        const onResize = () => {
          calcWinsize();
          minDrag = winsize.width * dragThreshold;
          items.forEach((item) => {
            item.rect = item.el.getBoundingClientRect();
          });
          currentPosition =
            winsize.width / 2 -
            items[current].el.offsetLeft -
            items[current].el.offsetWidth / 2;
          styles.menuTranslation.current = styles.menuTranslation.previous =
            currentPosition;
          if (stage.dataset.view === "menu") {
            grids.forEach((grid, i) => {
              if (i === current) spread(grid, false);
            });
          }
        };
        window.addEventListener("resize", onResize);
        cleanups.push(() => window.removeEventListener("resize", onResize));

        gsap.set(root, { autoAlpha: 1 });
      })
      .catch((e) =>
        console.error("[DraggableGridMenu] GSAP load failed:", e.message),
      );

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
      root.querySelectorAll("[data-raw-text]").forEach((el) => {
        el.textContent = el.dataset.rawText;
      });
    };
  }, [
    sections,
    dragFactor,
    dragThreshold,
    menuLerp,
    letterLerp,
    imageLerp,
    imageScaleLerp,
    imgScaleXTarget,
    imgScaleYTarget,
    imgShiftTarget,
    settleDuration,
    settleEase,
    imageDuration,
    imageEase,
    gridDuration,
    gridEase,
    spreadScale,
    spreadMarginX,
    spreadMarginY,
    enableCursor,
    cursorSize,
    cursorHoverScale,
    cursorDragScale,
    cursorLerp,
    initialSection,
  ]);

  const scope = `dm-${uid}`;

  const layoutCss = LAYOUTS.map((layout, li) =>
    layout
      .map(
        (area, ci) =>
          `.${scope} .dm-grid[data-layout="${li}"] .dm-cell:nth-child(${ci + 1}) { grid-area: ${area}; }`,
      )
      .join("\n"),
  ).join("\n");

  const css = `
.${scope} {
  font-family: ${fontFamily};
  color: ${textColor};
  background-color: ${bgColor};
  visibility: hidden;
}
.${scope} .dm-stage { scrollbar-width: thin; }
.${scope} .dm-stage[data-view="menu"] { overflow: hidden; }
.${scope} .dm-stage[data-view="grid"] { overflow-y: auto; }
.${scope} .dm-menu-wrap { pointer-events: none; }
.${scope} .dm-stage[data-view="menu"] .dm-menu-wrap { pointer-events: auto; }
.${scope} .dm-draggable { cursor: grab; }
.${scope} .dm-draggable:active { cursor: grabbing; }
.${scope} .dm-item { margin: 0 ${menuGap} 0 0; --dm-counter-opacity: 0; }
.${scope} .dm-stage[data-view="menu"] .dm-item { --dm-counter-opacity: 1; }
.${scope} .dm-item::before {
  counter-increment: dm-number;
  content: counter(dm-number, decimal-leading-zero);
  position: absolute;
  top: 0;
  right: 100%;
  opacity: var(--dm-counter-opacity);
  transition: opacity 0.3s;
  font-size: 1rem;
}
.${scope} .dm-link { font-size: ${menuFontSize}; line-height: 1.2; }
.${scope} .dm-explore { color: ${accentColor}; opacity: 0; }
.${scope} .dm-stage[data-view="menu"] .dm-item[data-state="current"] .dm-explore { pointer-events: auto; }
.${scope} .dm-letter { position: relative; display: inline-block; }
.${scope} .dm-letter-inner { display: block; will-change: transform, opacity; }
.${scope} .dm-letter-stroke {
  position: absolute;
  left: 0;
  top: 0;
  -webkit-text-stroke: 1px ${strokeColor};
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.${scope} .dm-grid {
  grid-area: 2 / 1 / 3 / 2;
  --dm-gap: ${gridGap};
  --dm-h: ${gridHeight};
  display: grid;
  width: 100%;
  height: var(--dm-h);
  grid-template-rows: repeat(10, calc(var(--dm-h) / 10 - var(--dm-gap)));
  grid-template-columns: repeat(10, calc(100% / 10 - var(--dm-gap)));
  grid-gap: var(--dm-gap);
  align-content: center;
  justify-content: center;
}
.${scope} .dm-img {
  filter: grayscale(0) contrast(1) brightness(1);
  will-change: transform;
}
.${scope} .dm-stage[data-view="menu"] .dm-img { filter: ${previewFilter}; }
.${scope} .dm-back { color: ${accentColor}; opacity: 0; }
.${scope} .dm-stage[data-view="menu"] .dm-back { pointer-events: none; }
.${scope} .dm-grid-wrap { padding: 13rem 5vw 2rem; }
.${scope} .dm-cursor-side { background: ${accentColor}; }
.${scope} .dm-cursor-circle {
  width: ${cursorSize}px;
  height: ${cursorSize}px;
  border: 1px solid ${accentColor};
}
${layoutCss}
@media screen and (min-width: 53em) {
  .${scope} .dm-grid-wrap { padding: ${gridPadding}; grid-template-rows: 1.25rem 1fr; grid-gap: 3rem; }
  .${scope} .dm-grid { padding: 0 10vw; }
  .${scope} .dm-back { justify-self: end; }
}
@media (any-pointer: coarse) {
  .${scope} .dm-cursor { display: none; }
}
`;

  return (
    <div
      ref={rootRef}
      className={`${scope} relative w-full overflow-hidden`}
      style={{ height: "100vh" }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div
        data-dm="stage"
        data-view="menu"
        className={`dm-stage relative h-full w-full ${className}`}
      >
        <div className="dm-grid-wrap pointer-events-none relative mx-auto grid grid-cols-[100%] grid-rows-[3rem_1fr]">
          <button
            type="button"
            data-dm="back"
            data-dm-hover="1"
            aria-label="Back to menu"
            className="dm-back cursor-pointer pointer-events-auto col-start-1 row-start-1 m-0 self-start justify-self-center border-0 bg-transparent p-0 outline-none"
          >
            <svg width="27" height="15" viewBox="0 0 27 15" className="block">
              <path
                d="M1.469 6.75l-.719.719 7.938 6.937.718-.719L1.47 6.75zM8.594.531L.75 7.375l.688.688L9.28 1.218 8.594.53zM1.406 6.938v1h24.75v-1H1.406z"
                fill="currentColor"
              />
            </svg>
          </button>

          {sections.map((section, si) => (
            <div
              key={si}
              data-dm="grid"
              data-layout={si % LAYOUTS.length}
              className="dm-grid"
            >
              {section.images.slice(0, 9).map((src, ii) => (
                <div key={ii} data-dm="cell" className="dm-cell relative">
                  <div
                    data-dm="img"
                    className="dm-img relative h-full w-full bg-cover bg-center bg-no-repeat opacity-0"
                    style={{ backgroundImage: `url(${src})` }}
                    role="img"
                    aria-label={section.title}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="dm-menu-wrap absolute left-0 top-0 h-full w-full overflow-hidden">
          <div
            data-dm="draggable"
            className="dm-draggable absolute left-0 top-0 h-full w-full touch-none"
          />
          <nav
            data-dm="menu"
            className="dm-menu relative flex h-full w-fit items-center justify-start pointer-events-none select-none [counter-reset:dm-number] will-change-transform"
          >
            {sections.map((section, si) => (
              <div
                key={si}
                data-dm="item"
                data-state="idle"
                className="dm-item relative text-center"
              >
                <span data-dm="link" className="dm-link flex font-bold">
                  {section.title}
                </span>
                <span
                  data-dm="explore"
                  data-dm-hover="1"
                  className="dm-explore mt-2 inline-block cursor-pointer px-2 pt-2 underline will-change-transform hover:no-underline"
                  role="button"
                  tabIndex={0}
                >
                  {exploreLabel}
                </span>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {enableCursor && (
        <div className="dm-cursor pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block">
          <div
            data-dm="cursor"
            className="dm-cursor-circle absolute left-0 top-0 rounded-full mix-blend-difference"
          >
            <div
              data-dm="cursor-left"
              className="dm-cursor-side absolute top-1/2 h-px w-[5px] opacity-0 right-[calc(100%+5px)]"
            />
            <div
              data-dm="cursor-right"
              className="dm-cursor-side absolute top-1/2 h-px w-[5px] opacity-0 left-[calc(100%+5px)]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
