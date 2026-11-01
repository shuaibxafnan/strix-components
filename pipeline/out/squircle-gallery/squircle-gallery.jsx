"use client";

import { useEffect, useId, useState } from "react";

const DEFAULT_ITEMS = [
  { title: "The Street", src: "https://picsum.photos/id/57/300/300" },
  { title: "Looking Out", src: "https://picsum.photos/id/447/300/300" },
  { title: "Freedom Above", src: "https://picsum.photos/id/315/300/300" },
  { title: "Greener Grass", src: "https://picsum.photos/id/89/300/300" },
  { title: "Relax", src: "https://picsum.photos/id/103/300/300" },
  { title: "Road to Nowwhere", src: "https://picsum.photos/id/314/300/300" },
  { title: "Spiraling", src: "https://picsum.photos/id/137/300/300" },
  { title: "Abandoned", src: "https://picsum.photos/id/478/300/300" },
  { title: "Path to Paradise", src: "https://picsum.photos/id/316/300/300" },
];

const SQUIRCLE_PATH =
  "M 0.5 0.05 C 0.8 0.05 0.95 0.2 0.95 0.5 C 0.95 0.8 0.8 0.95 0.5 0.95 C 0.2 0.95 0.05 0.8 0.05 0.5 C 0.05 0.2 0.2 0.05 0.5 0.05 Z";

const TITLE_EASE =
  "linear(0, 0.197 6.9%, 1 37.8%, 0.888 44.2%, 0.862 47.1%, 0.853 50%, 0.86 52.6%, 0.881 55.4%, 1 65.5%, 0.97 69.3%, 0.96 73%, 0.967 76.4%, 1 84.5%, 0.993 89.2%, 1)";

export default function SquircleGallery({
  items = DEFAULT_ITEMS,
  initialActiveIndex = 5,
  gridColsMobile = 2,
  gridColsDesktop = 6,
  rowHeightMobile = "180px",
  rowHeightDesktop = "170px",
  activeColSpanMobile = "1 / -1",
  activeRowSpanMobile = "3 / 5",
  activeColSpanDesktop = "3 / 5",
  activeRowSpanDesktop = "1 / 3",
  breakpoint = 800,
  gap = "1rem",
  rowGap = "1.5rem",
  maxWidth = "1200px",
  sepiaAmount = 0.75,
  restZoom = 1.5,
  hoverZoom = 1,
  swapDuration = 300,
  zoomDuration = 1000,
  titleFontFamily = "'Amatic SC', handwriting",
  titleFontSize = "1.6rem",
  titleColor = "white",
  overlayColor = "rgb(0,0,0)",
  fontImportUrl = "https://fonts.bunny.net/css?family=amatic-sc:400",
  className = "",
}) {
  const uid = useId().replace(/[:]/g, "");
  const clipId = `squircleClip-${uid}`;

  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [activeIndex, setActiveIndex] = useState(
    Math.min(initialActiveIndex, items.length - 1),
  );

  useEffect(() => {
    if (document.querySelector(`link[data-id="${fontImportUrl}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontImportUrl;
    link.setAttribute("data-id", fontImportUrl);
    document.head.appendChild(link);
  }, [fontImportUrl]);

  function handleTileClick(clickedOrderPos) {
    const clickedItemIndex = order[clickedOrderPos];
    if (clickedItemIndex === activeIndex) return;

    const activeOrderPos = order.indexOf(activeIndex);

    const applySwap = () => {
      const next = order.slice();

      next[activeOrderPos] = clickedItemIndex;
      next[clickedOrderPos] = activeIndex;
      setOrder(next);
      setActiveIndex(clickedItemIndex);
    };

    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => {
        applySwap();
      });
    } else {
      applySwap();
    }
  }

  const cssVars = `
    #${uid} {
      --grid-cols: repeat(${gridColsMobile}, 1fr);
      --grid-rows: ${rowHeightMobile};
      --grid-cols-active: ${activeColSpanMobile};
      --grid-rows-active: ${activeRowSpanMobile};
    }
    @media (${breakpoint}px < width) {
      #${uid} {
        --grid-cols: repeat(${gridColsDesktop}, 1fr);
        --grid-rows: ${rowHeightDesktop};
        --grid-cols-active: ${activeColSpanDesktop};
        --grid-rows-active: ${activeRowSpanDesktop};
      }
    }
    #${uid} .sg-item {
      view-transition-name: none;
    }
  `;

  return (
    <div
      id={uid}
      className={`mx-auto flex w-full items-center justify-center px-4 ${className}`}
      style={{ maxWidth }}
    >
      <style>{cssVars}</style>

        <svg width="0" height="0" className="absolute">
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={SQUIRCLE_PATH} />
            </clipPath>
          </defs>
        </svg>

        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: "var(--grid-cols)",
            gridAutoRows: "var(--grid-rows)",
            columnGap: gap,
            rowGap: rowGap,
          }}
        >
          {order.map((itemIndex, orderPos) => {
            const item = items[itemIndex];
            const isActive = itemIndex === activeIndex;

            return (
              <div
                key={itemIndex}
                onClick={() => handleTileClick(orderPos)}
                style={{
                  viewTransitionName: `sg-item-${uid}-${itemIndex}`,
                  clipPath: `url(#${clipId})`,
                  WebkitClipPath: `url(#${clipId})`,
                  filter: isActive ? "sepia(0)" : `sepia(${sepiaAmount})`,
                  transitionDuration: `${swapDuration}ms`,
                  gridColumn: isActive ? "var(--grid-cols-active)" : undefined,
                  gridRow: isActive ? "var(--grid-rows-active)" : undefined,
                }}
                className={
                  "sg-item relative isolate w-full h-full overflow-hidden cursor-pointer transition-[filter] ease-in-out" +
                  (isActive ? " z-[2]" : " z-[1]")
                }
              >
                {isActive && (
                  <div
                    className="absolute inset-0 z-[1] pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 300%, ${overlayColor}, transparent)`,
                    }}
                  />
                )}

                <img
                  src={item.src}
                  alt={item.title}
                  className="group w-full h-full object-cover transition-[scale,opacity] ease-in-out hover:![scale:var(--sg-hover-zoom)]"
                  style={{
                    scale: restZoom,
                    "--sg-hover-zoom": hoverZoom,
                    transitionDuration: `${zoomDuration}ms, 150ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.scale = String(hoverZoom);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.scale = String(restZoom);
                  }}
                />

                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 z-[2] pointer-events-none"
                    style={{
                      translate: "-50% -2rem",
                      fontFamily: titleFontFamily,
                      fontSize: titleFontSize,
                      color: titleColor,
                      transition: "translate 500ms 300ms",
                      transitionTimingFunction: TITLE_EASE,
                    }}
                  >
                    {item.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
    </div>
  );
}
