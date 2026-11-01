"use client";

import { useEffect, useId, useRef, useState } from "react";

const DEFAULT_CAPTIONS = [
  "Zorith - L91",
  "Mykar - L27",
  "Thalon - V75",
  "Vexra - N22",
  "Drosin - X29",
  "Ryndel - Y52",
  "Korin - T18",
  "Nymera - L50",
  "Lektar - X43",
  "Fexil - R50",
  "Jaleth - N49",
  "Torvik - Y15",
  "Lumora - X82",
  "Zekron - X99",
  "Brynd - Q89",
  "Solmir - Q91",
  "Dareon - N38",
  "Noxil - T76",
  "Kairon - R28",
  "Voric - T97",
];

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

const REPEAT_COUNT = 5;

const DEFAULT_ITEMS = Array.from({ length: REPEAT_COUNT }, () =>
  DEFAULT_IMAGES.map((img, i) => ({
    img,
    caption: DEFAULT_CAPTIONS[i % DEFAULT_CAPTIONS.length],
  })),
).flat();

export default function ElasticGridCenterLag({
  items = DEFAULT_ITEMS,
  bgColor = "#111",
  textColor = "#fff",
  showCaptions = false,
  pagePadding = "0",
  columnGap = "0vw",
  rowGap = "0vw",
  columnMinWidth = "80px",
  columnCountMobile = 3,
  columnCountDesktop = 9,
  desktopBreakpoint = "65em",
  baseLag = 0.3,
  lagFactor = 0.15,
  smoothness = 1,
  normalizeScroll = true,
  captionFontSize = "11px",
  overlay = true,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const gridRef = useRef(null);
  const originalItemsRef = useRef([]);
  const currentColumnCountRef = useRef(null);
  const smootherRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const grid = gridRef.current;

    const getColumnCount = () => {
      const styles = window.getComputedStyle(grid);
      return styles
        .getPropertyValue("grid-template-columns")
        .split(" ")
        .filter(Boolean).length;
    };

    const groupItemsByColumn = () => {
      const numColumns = getColumnCount();
      const columns = Array.from({ length: numColumns }, () => []);
      grid
        .querySelectorAll(`[data-egscl-item="${uid}"]`)
        .forEach((item, index) => {
          columns[index % numColumns].push(item);
        });
      return { columns, numColumns };
    };

    const clearGrid = () => {
      grid
        .querySelectorAll(`[data-egscl-column="${uid}"]`)
        .forEach((col) => col.remove());
      originalItemsRef.current.forEach((item) => grid.appendChild(item));
    };

    const buildGrid = (columns, numColumns) => {
      const fragment = document.createDocumentFragment();
      const mid = (numColumns - 1) / 2;
      const maxDistance =
        numColumns % 2 === 1 ? Math.floor(numColumns / 2) : numColumns / 2;
      const columnContainers = [];

      columns.forEach((column, i) => {
        const distance = Math.abs(i - mid);
        const lag = baseLag + (maxDistance - distance + 1) * lagFactor;

        const columnContainer = document.createElement("div");
        columnContainer.setAttribute("data-egscl-column", uid);
        columnContainer.style.display = "flex";
        columnContainer.style.flexDirection = "column";
        columnContainer.style.gap = rowGap;

        column.forEach((item) => columnContainer.appendChild(item));
        fragment.appendChild(columnContainer);
        columnContainers.push({ element: columnContainer, lag });
      });

      grid.appendChild(fragment);
      return columnContainers;
    };

    const applyLagEffects = (columnContainers) => {
      const smoother = smootherRef.current;
      if (!smoother) return;
      columnContainers.forEach(({ element, lag }) => {
        smoother.effects(element, { speed: 1, lag });
      });
    };

    const init = () => {
      clearGrid();
      const { columns, numColumns } = groupItemsByColumn();
      currentColumnCountRef.current = numColumns;
      const columnContainers = buildGrid(columns, numColumns);
      applyLagEffects(columnContainers);
    };

    const handleResize = () => {
      const newColumnCount = getColumnCount();
      if (newColumnCount !== currentColumnCountRef.current) {
        init();
      }
    };

    const boot = async () => {
      try {
        const [gsapMod, stMod, ssMod, ilMod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/ScrollSmoother"),
          import("imagesloaded"),
        ]);

        if (cancelled) return;

        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const ScrollSmoother = ssMod.ScrollSmoother || ssMod.default;
        const imagesLoaded = ilMod.default;
        if (!grid) return;

        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

        originalItemsRef.current = Array.from(
          grid.querySelectorAll(`[data-egscl-item="${uid}"]`),
        );

        smootherRef.current =
          ScrollSmoother.get() ||
          ScrollSmoother.create({
            wrapper: wrapperRef.current,
            content: contentRef.current,
            smooth: smoothness,
            effects: true,
            normalizeScroll,
          });

        await new Promise((resolve) => {
          imagesLoaded(
            grid.querySelectorAll(`[data-egscl-img="${uid}"]`),
            { background: true },
            resolve,
          );
        });

        if (cancelled) return;

        init();
        setReady(true);
        window.addEventListener("resize", handleResize);
      } catch (err) {
        console.error(
          "[ElasticGridCenterLag] failed to initialize:",
          err.message,
        );
      }
    };

    boot();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
    };
  }, [uid, baseLag, lagFactor, rowGap, smoothness, normalizeScroll]);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden transition-opacity duration-300 ${
        ready ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            [data-egscl-grid="${uid}"] {
              grid-template-columns: repeat(${columnCountMobile}, minmax(${columnMinWidth}, 1fr));
            }
            @media screen and (min-width: ${desktopBreakpoint}) {
              [data-egscl-grid="${uid}"] {
                grid-template-columns: repeat(${columnCountDesktop}, minmax(${columnMinWidth}, 1fr));
              }
            }
          `,
        }}
      />
      {overlay && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.85) 0rem, rgba(0,0,0,0) 20rem, rgba(0,0,0,0) calc(100% - 20rem), rgba(0,0,0,0.85) 100%)",
          }}
        />
      )}
      <div ref={contentRef}>
        <div
          ref={gridRef}
          data-egscl-grid={uid}
          className="grid mx-auto"
          style={{
            padding: pagePadding,
            columnGap,
            rowGap,
          }}
        >
          {items.map((item, i) => (
            <figure key={i} data-egscl-item={uid} className="m-0">
              <div
                data-egscl-img={uid}
                className="aspect-[128/160] bg-cover bg-center"
                style={{ backgroundImage: `url(${item.img})` }}
              />
              {showCaptions && (
                <figcaption
                  className="mt-[0.15rem] font-medium"
                  style={{ fontSize: captionFontSize }}
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
