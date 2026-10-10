"use client";

import { useEffect, useRef } from "react";

// ─── DraggableCardSlider ──────────────────────────────────────────────────────
//
// Horizontally draggable card strip with momentum/inertia — zero external deps.
// Inertia is implemented natively with pointer events + requestAnimationFrame
// so no GSAP Club plugin is needed at all.
// Cards expand via CSS scroll-timeline animation as they scroll into center.
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// items              string[]  (see default)       Card label strings
// cardAspectRatio    string    "2/3"               CSS aspect-ratio of each card
// cardWidthClamp     string    "clamp(80px,…)"     Resting (shrunk) card width
// expandedWidthClamp string    "clamp(150px,…)"    Width at scroll center peak
// gap                string    "0.5rem"            Gap between cards
// imageGrayscale     number    0.85                filter grayscale (0–1)
// imageContrast      number    1.6                 filter contrast multiplier
// bgColor            string    "transparent"       Outer wrapper background
// labelFontSize      string    "0.625rem"          Card label font-size
// labelFontWeight    string    "300"               Card label font-weight
// paddingBlock       string    "0.75rem"           Top/bottom padding in strip
// friction           number    0.92                Inertia friction (0–1). Higher = slides longer
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  "planning",
  "properties",
  "counters",
  "masking",
  "3D",
  "blending",
  "siblings",
  "speech",
  "typography",
  "magnetism",
  "keyframes",
  "easing",
  "staggers",
  "composition",
  "popovers",
  "transitions",
  "clipping",
  "morphing",
  "timing",
  "paths",
  "svg",
  "scrolling",
];

export default function ScrollWaveSlider({
  items = DEFAULT_ITEMS,
  cardAspectRatio = "2/3",
  cardWidthClamp = "clamp(80px, 10vw, 160px)",
  expandedWidthClamp = "clamp(150px, 30vw, 300px)",
  gap = "0.5rem",
  imageGrayscale = 0.85,
  imageContrast = 1.6,
  bgColor = "transparent",
  labelFontSize = "0.625rem",
  labelFontWeight = "300",
  paddingBlock = "0.75rem",
  friction = 0.92,
}) {
  const listRef = useRef(null);
  const wrapperRef = useRef(null);

  // ── Native inertia drag ──────────────────────────────────────────────────
  useEffect(() => {
    const el = listRef.current;
    const wrapper = wrapperRef.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let velX = 0; // velocity in px/frame
    let lastX = 0;
    let lastTime = 0;
    let rafId = null;

    // ── Inertia throw loop ───────────────────────────────────────────────
    const throwLoop = () => {
      velX *= friction;
      el.scrollLeft -= velX;
      if (Math.abs(velX) > 0.5) {
        rafId = requestAnimationFrame(throwLoop);
      }
    };

    const onPointerDown = (e) => {
      // Ignore right-click
      if (e.button !== 0) return;

      isDragging = true;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      lastX = e.clientX;
      lastTime = performance.now();
      velX = 0;

      if (rafId) cancelAnimationFrame(rafId);

      el.setPointerCapture(e.pointerId);
      if (wrapper) wrapper.dataset.dragging = "true";
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;

      const now = performance.now();
      const dt = now - lastTime;

      // Velocity as px per frame (approx 16ms frame budget)
      if (dt > 0) velX = ((e.clientX - lastX) / dt) * 16;

      lastX = e.clientX;
      lastTime = now;

      el.scrollLeft = startScrollLeft - (e.clientX - startX);
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      if (wrapper) wrapper.dataset.dragging = "false";

      // Kick off inertia throw with the last measured velocity
      rafId = requestAnimationFrame(throwLoop);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [friction]);

  // ── Scoped injected CSS ──────────────────────────────────────────────────
  // Only runtime-prop values Tailwind can't express:
  //   • @keyframes targeting a clamp() prop value
  //   • animation-timeline: view(inline) — not in Tailwind
  //   • combined filter shorthand (two functions, both props)
  //   • cursor swap via data-dragging
  //   • scrollbar hiding (needs vendor prefix)
  const scopeId = "dcs-scope";

  const dynamicCSS = `
    #${scopeId} li article {
      animation: dcs-expand both
        linear(
          0 0%, 0.0027 3.64%, 0.0106 7.29%, 0.0425 14.58%,
          0.0957 21.87%, 0.1701 29.16%, 0.2477 35.19%, 0.3401 41.23%,
          0.5982 55.18%, 0.7044 61.56%, 0.7987 68.28%, 0.875 75%,
          0.9297 81.25%, 0.9687 87.5%, 0.9922 93.75%, 1 100%
        );
      animation-timeline: view(inline);
    }
    @keyframes dcs-expand {
      50% { width: ${expandedWidthClamp}; }
    }
    #${scopeId}[data-dragging="true"] ul {
      cursor: grabbing;
    }
    #${scopeId}[data-dragging="true"] li a {
      cursor: grabbing !important;
    }
    #${scopeId} ul {
      scrollbar-width: none;
      cursor: grab;
    }
    #${scopeId} ul::-webkit-scrollbar {
      display: none;
    }
    #${scopeId} img {
      filter: grayscale(${imageGrayscale}) contrast(${imageContrast});
    }
  `;

  return (
    <>
      {/* Injected styles — scoped to #dcs-scope, runtime values only */}
      <style>{dynamicCSS}</style>

      {/*
        Fixed to bottom of viewport full width.
        pointer-events-none on wrapper keeps page content above clickable;
        pointer-events-auto on <ul> restores drag interaction on the strip.
      */}
      <div
        id={scopeId}
        ref={wrapperRef}
        data-dragging="false"
        className="fixed bottom-0 left-0 right-0 flex items-end pointer-events-none"
        style={{ background: bgColor }}
      >
        <ul
          ref={listRef}
          className="list-none flex overflow-x-auto overflow-y-hidden p-0 m-0 w-full pointer-events-auto select-none"
          style={{
            gap,
            paddingBlock,
            paddingInline: `calc(50% - ${expandedWidthClamp} * 0.5)`,
            minHeight: `calc(${expandedWidthClamp} * 1.75)`,
          }}
        >
          {items.map((label, index) => (
            <li
              key={label + index}
              className="flex items-end justify-end flex-col flex-1 max-h-full"
              style={{ aspectRatio: cardAspectRatio }}
            >
              <article
                className="overflow-hidden relative flex flex-col justify-end max-h-full"
                style={{
                  width: cardWidthClamp,
                  aspectRatio: cardAspectRatio,
                }}
              >
                <a
                  href="#"
                  className="relative z-10 uppercase no-underline mb-1"
                  style={{
                    fontWeight: labelFontWeight,
                    fontSize: labelFontSize,
                    color: "inherit",
                  }}
                  onClick={(e) => e.preventDefault()}
                  draggable={false}
                >
                  <span aria-hidden="true">
                    {(index + 1).toString().padStart(2, "0")}.&nbsp;
                  </span>
                  {label}
                </a>

                <div className="relative flex-1">
                  <img
                    src={`https://picsum.photos/1000/1500?random=${index}`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
