"use client";

import { useEffect, useRef } from "react";

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

export default function GifPuzzleSplit({
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
  eyebrow = "Interactive",
  headingLight = "Drag the",
  headingBold = "tiles.",
  subheading = "Each piece is a fragment of a hidden animation. Rearrange them to reveal the full picture.",
  hintLabel = "Use a 4×4 grid for the full image",
  statLabel1 = "4×4",
  statSub1 = "Grid",
  statLabel2 = "16",
  statSub2 = "Tiles",
  statLabel3 = "∞",
  statSub3 = "Layouts",
  className = "",
}) {
  const gridRef = useRef(null);
  const gsInstanceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const root = document.documentElement;
    const vars = [
      "--gs-column-width",
      "--gs-cell-height",
      "--gs-item-margin-left",
      "--gs-item-margin-right",
      "--gs-item-margin-top",
      "--gs-item-margin-bottom",
    ];

    Promise.all([
      import("gridstack"),
      import("gridstack/dist/gridstack.min.css"),
    ]).then(([mod]) => {
      const GridStack = mod.GridStack || mod.default?.GridStack || mod.default;
      if (cancelled || !GridStack || !gridRef.current) return;

      root.style.setProperty("--gs-column-width", `${columnWidth}px`);
      root.style.setProperty("--gs-cell-height", `${cellHeight}px`);
      root.style.setProperty("--gs-item-margin-left", "0px");
      root.style.setProperty("--gs-item-margin-right", "0px");
      root.style.setProperty("--gs-item-margin-top", "0px");
      root.style.setProperty("--gs-item-margin-bottom", "0px");

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
    });

    return () => {
      cancelled = true;
      if (gsInstanceRef.current) {
        gsInstanceRef.current.destroy(false);
        gsInstanceRef.current = null;
      }
      vars.forEach((v) => root.style.removeProperty(v));
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
      className={`relative w-full min-h-screen flex flex-col overflow-hidden font-sans antialiased ${className}`}
      style={{ backgroundColor: bgColor }}
    >

      <main className="flex-1 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 px-8 lg:px-16 py-16 lg:py-20 max-w-screen-xl mx-auto w-full">

          <div className="flex flex-col gap-7 lg:w-2/5 shrink-0">

              <div className="flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: accentColor, opacity: 0.4 }}
            />
            <span className="text-white/40 text-xs tracking-[0.22em] uppercase font-medium">
              {eyebrow}
            </span>
          </div>

              <div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-[1.0] tracking-tight">
              <span className="font-extralight text-white/30">{headingLight} </span>
              <span className="font-bold text-white">{headingBold}</span>
            </h1>
                  <div
              className="mt-5 w-8 h-px"
              style={{ backgroundColor: accentColor, opacity: 0.25 }}
            />
          </div>

              <p className="text-white/40 text-sm lg:text-base leading-loose max-w-xs">
            {subheading}
          </p>

              <div className="flex items-center gap-7 pt-1">
            <div className="flex flex-col gap-1">
              <span className="text-white text-2xl font-semibold leading-none">{statLabel1}</span>
              <span className="text-white/30 text-[10px] uppercase tracking-widest">{statSub1}</span>
            </div>
            <div className="w-px h-8 bg-white/10 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="text-white text-2xl font-semibold leading-none">{statLabel2}</span>
              <span className="text-white/30 text-[10px] uppercase tracking-widest">{statSub2}</span>
            </div>
            <div className="w-px h-8 bg-white/10 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="text-white text-2xl font-semibold leading-none">{statLabel3}</span>
              <span className="text-white/30 text-[10px] uppercase tracking-widest">{statSub3}</span>
            </div>
          </div>
        </div>

          <div className="flex flex-col items-center gap-5 w-full lg:flex-1">

              <div
            className="w-full overflow-hidden"
            style={{
              border: "0.5px solid rgba(255,255,255,0.07)",
              borderRadius: 2,
            }}
          >
                  <div
              className="mx-auto w-full"
              style={{ maxWidth: maxGridWidth }}
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

              <div className="flex items-center gap-2.5 text-white/20 text-[11px] tracking-widest uppercase font-mono">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-40">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="0.75" />
              <line x1="6" y1="4" x2="6" y2="6.5" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
              <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
            </svg>
            {hintLabel}
          </div>
        </div>
      </main>

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