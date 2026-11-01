"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_TILES = [
  { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
  { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
  { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
];

const DEFAULT_GIFS = [
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=1080&q=80",
];

export default function GifPuzzleGrid({
  bgColor = "#000",
  bgHoverColor = "#111",
  accentColor = "#ffffff",
  columnWidth = 100,
  cellHeight = 75,
  columns = 8,
  maxGridWidth = 800,
  gifOptions = DEFAULT_GIFS,
  gifWidth = 400,
  gifHeight = 300,
  puzzleRows = 4,
  puzzleCols = 4,
  tiles = DEFAULT_TILES,
  hintLabel = "Use a 4×4 grid for the full image",
  className = "",
}) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const gsInstanceRef = useRef(null);
  const [scale, setScale] = useState(1);

  const naturalWidth = Math.min(columnWidth * columns, maxGridWidth);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth - 32;
      setScale(Math.min(1, Math.max(0.1, available / naturalWidth)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalWidth]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import("gridstack"),
      import("gridstack/dist/gridstack.min.css"),
    ])
      .then(([mod]) => {
        if (cancelled || !gridRef.current) return;
        const GridStack = mod.GridStack || mod.default?.GridStack || mod.default;

        gsInstanceRef.current = GridStack.init(
          {
            column: columns,
            cellHeight,
            margin: 0,
            float: true,
            disableResize: true,
          },
          gridRef.current
        );

        const selectedGif =
          gifOptions[Math.floor(Math.random() * gifOptions.length)];

        const positions = [];
        for (let row = 0; row < puzzleRows; row++) {
          for (let col = 0; col < puzzleCols; col++) {
            positions.push({ x: -columnWidth * col, y: -cellHeight * row });
          }
        }

        for (let i = positions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        const tileEls = gridRef.current.querySelectorAll(".gs-tile");
        tileEls.forEach((el, i) => {
          const pos = positions[i] ?? { x: 0, y: 0 };
          el.style.backgroundImage = `url('${selectedGif}')`;
          el.style.backgroundSize = `${gifWidth}px ${gifHeight}px`;
          el.style.backgroundPosition = `${pos.x}px ${pos.y}px`;
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (gsInstanceRef.current) {
        gsInstanceRef.current.destroy(false);
        gsInstanceRef.current = null;
      }
    };
  }, [
    columnWidth,
    cellHeight,
    columns,
    gifOptions,
    gifWidth,
    gifHeight,
    puzzleRows,
    puzzleCols,
    tiles,
  ]);

  return (
    <div
      ref={rootRef}
      className={`relative w-full h-screen flex flex-col items-center justify-center gap-5 overflow-hidden font-sans antialiased ${className}`}
    >
      <div
        className="overflow-hidden"
        style={{
          width: naturalWidth * scale,
          height: cellHeight * puzzleRows * scale,
          border: "0.5px solid rgba(255,255,255,0.07)",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: naturalWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            ref={gridRef}
            className="grid-stack w-full text-[0px]"
            style={{ backgroundColor: bgColor }}
          >
            {tiles.map((tile, i) => (
              <div
                key={i}
                className="grid-stack-item !m-0 !p-0"
                gs-x={String(tile.x)}
                gs-y={String(tile.y)}
                gs-w={String(tile.w ?? 1)}
                gs-h={String(tile.h ?? 1)}
              >
                <div className="grid-stack-item-content gs-tile tile !m-0 !p-0 box-border inline-flex bg-no-repeat hover:cursor-pointer active:cursor-grab" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2.5 text-[11px] tracking-widest uppercase font-mono px-4 text-center"
        style={{ color: accentColor, opacity: 0.4 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="0.75" />
          <line x1="6" y1="4" x2="6" y2="6.5" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
          <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
        </svg>
        {hintLabel}
      </div>

      <style>{`
        .grid-stack-item-content {
          max-height: ${cellHeight}px;
          max-width: ${columnWidth}px;
          background-repeat: no-repeat;
          box-shadow: none !important;
          border: none !important;
          margin-right: -14px !important;
        }
        .grid-stack:hover {
          background: ${bgHoverColor} !important;
        }
        .tile:hover {
          animation: gs-pulse 1s ease infinite;
        }
        .tile:active {
          animation: gs-pulse2 1s ease infinite;
        }
        @keyframes gs-pulse {
          0%   { box-shadow: inset 0 0 0 0    rgba(255,255,255,0.15); }
          70%  { box-shadow: inset 0 0 0 10px rgba(255,255,255,0);    }
          100% { box-shadow: 0    0 0 0       rgba(255,255,255,0);    }
        }
        @keyframes gs-pulse2 {
          0%   { box-shadow: inset 0 0 0 0    rgba(255,255,255,0.35); }
          70%  { box-shadow: inset 0 0 0 10px rgba(255,255,255,0);    }
          100% { box-shadow: 0    0 0 0       rgba(255,255,255,0);    }
        }
      `}</style>
    </div>
  );
}
