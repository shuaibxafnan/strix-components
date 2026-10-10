"use client";

import { useEffect, useId, useRef } from "react";

// ─── DualWaveGallery ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items             array    [see DEFAULT_ITEMS]  Array of { label, rightLabel, image } — label/image drive the left column, rightLabel drives the right column (falls back to label)
// waveNumber        number   12         Wave frequency multiplier used in the sine phase calc
// waveSpeed         number   1          Wave travel speed as scroll progresses
// bgColor           string   #000       Section background color
// textColor         string   #4d4d4d    Unfocused text color
// focusedColor      string   #fff       Focused (centered) text color
// columnGap         string   "clamp(2.5rem, 15vw, 25vw)"  Horizontal gap between left/right columns (clamped so it never eats the whole screen on mobile)
// itemGap           string   "1.25rem"  Vertical gap between stacked text items
// fontSize          string   "clamp(1.1rem, 6vw, 3rem)"  Text size (CSS clamp, runtime value) — smaller floor on mobile to reduce column overflow
// thumbnailWidth    string   "clamp(5.5rem, 20vw, 12rem)"  Width of the floating center image wrapper — floor keeps it visible on small screens
// thumbnailMaxHeight string  "30vh"     Max height of the floating center image
// spacerTop         string   "75svh"    Empty space before the wave section (lets scroll "arrive")
// spacerBottom      string   "100svh"   Empty space after the wave section
// enableSmoothScroll boolean false      Wraps content in GSAP ScrollSmoother — only enable if this component owns the whole page's scroll container, since ScrollSmoother is a single global instance
// smoothAmount      number   1.5        ScrollSmoother smoothing amount (only used if enableSmoothScroll is true)
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

const DEFAULT_LABELS = [
  "Tesla",
  "Chanel",
  "Apple",
  "BMW",
  "Saint Laurent",
  "Nike",
  "Hermès",
  "Adidas",
  "Prada",
  "Google",
  "Polestar",
  "Balenciaga",
  "Audi",
  "Valentino",
  "Samsung",
  "Bottega Veneta",
  "Sony",
  "Aesop",
  "Dior",
  "Porsche",
  "Microsoft",
  "Lexus",
  "Mercedes-Benz",
  "Huawei",
];

const DEFAULT_ITEMS = DEFAULT_LABELS.map((label, i) => ({
  label,
  rightLabel: label,
  image: DEFAULT_IMAGES[i % DEFAULT_IMAGES.length],
}));

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

const preloadImages = (srcs) =>
  Promise.all(
    srcs.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        }),
    ),
  );

export default function DualWaveGallery({
  items = DEFAULT_ITEMS,
  waveNumber = 12,
  waveSpeed = 1,
  bgColor = "#000",
  textColor = "#4d4d4d",
  focusedColor = "#fff",
  columnGap = "clamp(2.5rem, 15vw, 25vw)",
  itemGap = "1.25rem",
  fontSize = "clamp(1.1rem, 6vw, 3rem)",
  thumbnailWidth = "clamp(5.5rem, 20vw, 12rem)",
  thumbnailMaxHeight = "30vh",
  spacerTop = "75svh",
  spacerBottom = "100svh",
  enableSmoothScroll = false,
  smoothAmount = 1.5,
}) {
  const uid = useId().replace(/:/g, "");
  const wrapperRef = useRef(null);
  const leftRefs = useRef([]);
  const rightRefs = useRef([]);
  const thumbnailRef = useRef(null);
  const smootherRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const resizeHandlerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const scripts = [
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      ),
    ];
    if (enableSmoothScroll) {
      scripts.push(
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollSmoother.min.js",
        ),
      );
    }

    Promise.all(scripts)
      .then(() => preloadImages(items.map((it) => it.image).filter(Boolean)))
      .then(() => {
        if (cancelled) return;
        const { gsap, ScrollTrigger, ScrollSmoother } = window;
        if (!gsap || !ScrollTrigger || !wrapperRef.current) return;

        gsap.registerPlugin(
          ScrollTrigger,
          ...(ScrollSmoother ? [ScrollSmoother] : []),
        );
        gsap.config({ trialWarn: false });

        if (enableSmoothScroll && ScrollSmoother) {
          smootherRef.current = ScrollSmoother.create({
            smooth: smoothAmount,
            normalizeScroll: true,
          });
        }

        const leftTexts = leftRefs.current.filter(Boolean);
        const rightTexts = rightRefs.current.filter(Boolean);
        const thumbnail = thumbnailRef.current;
        if (leftTexts.length === 0 || rightTexts.length === 0) return;

        const leftQuickSetters = leftTexts.map((el) =>
          gsap.quickTo(el, "x", { duration: 0.6, ease: "power4.out" }),
        );
        const rightQuickSetters = rightTexts.map((el) =>
          gsap.quickTo(el, "x", { duration: 0.6, ease: "power4.out" }),
        );

        let leftRange = { minX: 0, maxX: 0 };
        let rightRange = { minX: 0, maxX: 0 };
        let currentImage = null;

        // Use visualViewport height when available so mobile browser
        // chrome (address bar) show/hide doesn't jitter the thumbnail.
        const getViewportHeight = () =>
          window.visualViewport?.height || window.innerHeight;

        const calculateRanges = () => {
          const leftColumn = leftTexts[0].parentElement;
          const rightColumn = rightTexts[0].parentElement;
          const maxLeftWidth = Math.max(...leftTexts.map((t) => t.offsetWidth));
          const maxRightWidth = Math.max(
            ...rightTexts.map((t) => t.offsetWidth),
          );
          // Clamp maxX to >= 0 so overly long labels on narrow columns
          // (mobile) don't produce a negative range and push text
          // off-screen in the wrong direction.
          leftRange = {
            minX: 0,
            maxX: Math.max(0, leftColumn.offsetWidth - maxLeftWidth),
          };
          rightRange = {
            minX: 0,
            maxX: Math.max(0, rightColumn.offsetWidth - maxRightWidth),
          };
        };

        const setInitialPositions = (texts, range, multiplier) => {
          const rangeSize = range.maxX - range.minX;
          texts.forEach((text, index) => {
            const phase = waveNumber * index - Math.PI / 2;
            const wave = Math.sin(phase);
            const progress = (wave + 1) / 2;
            const startX = (range.minX + progress * rangeSize) * multiplier;
            gsap.set(text, { x: startX });
          });
        };

        const calculateWavePosition = (index, globalProgress, minX, range) => {
          const phase =
            waveNumber * index +
            waveSpeed * globalProgress * Math.PI * 2 -
            Math.PI / 2;
          const wave = Math.sin(phase);
          const cycleProgress = (wave + 1) / 2;
          return minX + cycleProgress * range;
        };

        const findClosestToViewportCenter = () => {
          const viewportCenter = getViewportHeight() / 2;
          let closestIndex = 0;
          let minDistance = Infinity;
          leftTexts.forEach((text, index) => {
            const rect = text.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const distance = Math.abs(elementCenter - viewportCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = index;
            }
          });
          return closestIndex;
        };

        const updateColumn = (
          texts,
          setters,
          range,
          progress,
          focusedIndex,
          multiplier,
        ) => {
          const rangeSize = range.maxX - range.minX;
          texts.forEach((text, index) => {
            const finalX =
              calculateWavePosition(index, progress, range.minX, rangeSize) *
              multiplier;
            setters[index](finalX);
            if (index === focusedIndex) {
              text.classList.add(`${uid}-focused`);
            } else {
              text.classList.remove(`${uid}-focused`);
            }
          });
        };

        const updateThumbnail = (focusedIndex) => {
          if (!thumbnail) return;
          const newImage = items[focusedIndex]?.image;
          if (newImage && currentImage !== newImage) {
            currentImage = newImage;
            thumbnail.src = newImage;
          }

          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          const viewportCenter = getViewportHeight() / 2;
          const thumbnailHeight = thumbnail.offsetHeight;
          const wrapperHeight = wrapperRef.current.offsetHeight;

          const idealY = viewportCenter - wrapperRect.top - thumbnailHeight / 2;
          const minY = -thumbnailHeight / 2;
          const maxY = wrapperHeight - thumbnailHeight / 2;
          const clampedY = Math.max(minY, Math.min(maxY, idealY));

          gsap.set(thumbnail, { y: clampedY });
        };

        calculateRanges();
        setInitialPositions(leftTexts, leftRange, 1);
        setInitialPositions(rightTexts, rightRange, -1);

        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const globalProgress = self.progress;
            const closestIndex = findClosestToViewportCenter();
            updateColumn(
              leftTexts,
              leftQuickSetters,
              leftRange,
              globalProgress,
              closestIndex,
              1,
            );
            updateColumn(
              rightTexts,
              rightQuickSetters,
              rightRange,
              globalProgress,
              closestIndex,
              -1,
            );
            updateThumbnail(closestIndex);
          },
        });

        resizeHandlerRef.current = () => calculateRanges();
        window.addEventListener("resize", resizeHandlerRef.current);
      })
      .catch((e) => console.error("[DualWaveText] Setup failed:", e.message));

    return () => {
      cancelled = true;
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
      }
      if (smootherRef.current) smootherRef.current.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="w-full min-h-screen px-4 sm:px-6 overflow-x-hidden"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div style={{ height: spacerTop }} />

      <div
        ref={wrapperRef}
        className="relative flex w-full"
        style={{ gap: columnGap }}
      >
        <div
          className="flex flex-1 min-w-0 flex-col items-start relative z-[100] uppercase font-normal leading-[0.85] sm:leading-[0.7]"
          style={{ gap: itemGap, fontSize }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              ref={(el) => (leftRefs.current[i] = el)}
              className="max-w-full whitespace-nowrap transition-colors duration-300 ease-out"
              style={{ color: textColor }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-[1] grid place-items-center pointer-events-none"
          style={{ width: thumbnailWidth }}
        >
          <img
            ref={thumbnailRef}
            src={items[0]?.image}
            alt="Campaign visual"
            className="w-full h-full object-cover"
            style={{ maxHeight: thumbnailMaxHeight }}
          />
        </div>

        <div
          className="flex flex-1 min-w-0 flex-col items-end relative z-[100] uppercase font-normal leading-[0.85] sm:leading-[0.7]"
          style={{ gap: itemGap, fontSize }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              ref={(el) => (rightRefs.current[i] = el)}
              className="max-w-full whitespace-nowrap transition-colors duration-300 ease-out"
              style={{ color: textColor }}
            >
              {item.rightLabel || item.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: spacerBottom }} />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${uid}-focused {
              color: ${focusedColor} !important;
              z-index: 2;
            }
          `,
        }}
      />
    </div>
  );
}
