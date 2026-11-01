"use client";

import { useEffect, useRef } from "react";

const DEFAULT_LABELS = [
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

const DEFAULT_ITEMS = DEFAULT_LABELS.map((label, index) => ({
  label,
  href: "#",
  imgSrc: `https://picsum.photos/1000/1500?random=${index}`,
  imgAlt: "",
}));

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
  className = "",
}) {
  const listRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    const wrapper = wrapperRef.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let velX = 0;
    let lastX = 0;
    let lastTime = 0;
    let rafId = null;

    const throwLoop = () => {
      velX *= friction;
      el.scrollLeft -= velX;
      if (Math.abs(velX) > 0.5) {
        rafId = requestAnimationFrame(throwLoop);
      }
    };

    const onPointerDown = (e) => {

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

      if (dt > 0) velX = ((e.clientX - lastX) / dt) * 16;

      lastX = e.clientX;
      lastTime = now;

      el.scrollLeft = startScrollLeft - (e.clientX - startX);
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      if (wrapper) wrapper.dataset.dragging = "false";

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
      <style>{dynamicCSS}</style>

      <div
        id={scopeId}
        ref={wrapperRef}
        data-dragging="false"
        className={`fixed bottom-0 left-0 right-0 flex items-end pointer-events-none ${className}`}
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
          {items.map((item, index) => (
            <li
              key={item.label + index}
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
                  href={item.href}
                  className="relative z-10 uppercase no-underline mb-1"
                  style={{
                    fontWeight: labelFontWeight,
                    fontSize: labelFontSize,
                    color: "inherit",
                  }}
                  onClick={(e) => {
                    if (!item.href || item.href === "#") e.preventDefault();
                  }}
                  draggable={false}
                >
                  <span aria-hidden="true">
                    {(index + 1).toString().padStart(2, "0")}.&nbsp;
                  </span>
                  {item.label}
                </a>

                <div className="relative flex-1">
                  <img
                    src={item.imgSrc}
                    alt={item.imgAlt || ""}
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
