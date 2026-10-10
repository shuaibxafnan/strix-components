"use client";

import { useEffect, useRef } from "react";

// ─── GifPuzzleGrid ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   #000         Page + grid background color
// bgHoverColor     string   #111         Grid background on hover
// accentColor      string   #fff         Accent color used for dots, borders, highlights
// columnWidth      number   100          Width of each grid column (px, runtime CSS var)
// cellHeight       number   75           Height of each grid cell  (px, runtime CSS var)
// columns          number   8            Total GridStack columns
// maxGridWidth     number   800          Max-width of the grid container (px, inline only)
// gifOptions       string[] […]          Pool of GIF URLs — one is picked at random
// gifWidth         number   400          Width of the source GIF used for bg-size  (px)
// gifHeight        number   300          Height of the source GIF used for bg-size (px)
// puzzleRows       number   4            Rows in the image slice grid
// puzzleCols       number   4            Cols in the image slice grid
// tiles            object[] […]          Array of { x, y, w?, h? } GridStack positions
// eyebrow          string   "Interactive" Small label above the heading
// headingLight     string   "Drag the"   Light-weight part of the split headline
// headingBold      string   "tiles."     Bold part of the split headline
// subheading       string   …            Sentence below the headline
// hintLabel        string   "Use a 4×4 grid" Instruction shown below the puzzle
// statLabel1       string   "4×4"        First stat value
// statSub1         string   "Grid"       First stat label
// statLabel2       string   "16"         Second stat value
// statSub2         string   "Tiles"      Second stat label
// statLabel3       string   "∞"          Third stat value
// statSub3         string   "Layouts"    Third stat label
// credits          object[] […]          Array of { label, author, href }
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_TILES = [
  { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
  { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
  { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
];

const DEFAULT_GIFS = [
  "https://imgeasy.com/share/sY189QE7SAfKZ1R8BJQC.gif",
  "https://imgeasy.com/share/J12WHOFDW8Ksnkzk1NCB.gif",
  "https://imgeasy.com/share/0MndNWXp0h3nO1Qzty9W.gif",
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
}) {
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);
  const gsInstanceRef = useRef(null);

  useEffect(() => {
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

    const loadLink = (href) => {
      if (document.querySelector(`link[data-id="${href}"]`)) return;
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      el.setAttribute("data-id", href);
      document.head.appendChild(el);
    };

    // GridStack CSS must load before JS so the grid renders correctly
    loadLink("https://cdn.jsdelivr.net/npm/gridstack@latest/dist/gridstack.min.css");

    loadScript("https://cdn.jsdelivr.net/npm/gridstack@latest/dist/gridstack-all.js")
      .then(() => {
        const { GridStack } = window;
        if (!GridStack || !gridRef.current) return;

        // ── Set GridStack CSS custom properties ───────────────────────────────
        // Runtime prop values — cannot be expressed as Tailwind classes
        const root = document.documentElement;
        root.style.setProperty("--gs-column-width", `${columnWidth}px`);
        root.style.setProperty("--gs-cell-height",  `${cellHeight}px`);
        root.style.setProperty("--gs-item-margin-left",   "0px");
        root.style.setProperty("--gs-item-margin-right",  "0px");
        root.style.setProperty("--gs-item-margin-top",    "0px");
        root.style.setProperty("--gs-item-margin-bottom", "0px");

        // ── Destroy stale instance before re-init (HMR safety) ───────────────
        if (gsInstanceRef.current) {
          gsInstanceRef.current.destroy(false);
          gsInstanceRef.current = null;
        }

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

        // ── Pick a random GIF from the pool ───────────────────────────────────
        const selectedGif =
          gifOptions[Math.floor(Math.random() * gifOptions.length)];

        // ── Build shuffled slice positions for the chosen GIF ─────────────────
        const positions = [];
        for (let row = 0; row < puzzleRows; row++) {
          for (let col = 0; col < puzzleCols; col++) {
            positions.push({ x: -columnWidth * col, y: -cellHeight * row });
          }
        }
        // Fisher-Yates shuffle — each tile gets a unique image slice
        for (let i = positions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // ── Apply background image slice to each tile ─────────────────────────
        // backgroundImage / backgroundSize / backgroundPosition are runtime
        // values derived from props — inline styles only, never Tailwind
        const tileEls = gridRef.current.querySelectorAll(".gs-tile");
        tileEls.forEach((el, i) => {
          const pos = positions[i] ?? { x: 0, y: 0 };
          el.style.backgroundImage    = `url('${selectedGif}')`;
          el.style.backgroundSize     = `${gifWidth}px ${gifHeight}px`;
          el.style.backgroundPosition = `${pos.x}px ${pos.y}px`;
        });
      })
      .catch((e) => console.error("[GifPuzzleGrid] GridStack load failed:", e.message));

    return () => {
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full min-h-screen flex flex-col overflow-hidden font-sans antialiased"
      style={{ backgroundColor: bgColor }}
    >

      {/* ── Top nav bar ───────────────────────────────────────────────────────
          Thin line at the top with a wordmark left + a small tag right.
          Both accentColor-dependent → inline for the border only.          */}
      <header
        className="w-full flex items-center justify-between px-8 py-5"
        style={{ borderBottom: `0.5px solid rgba(255,255,255,0.08)` }}
      >
        {/* Wordmark */}
        <span className="text-white text-sm font-medium tracking-[0.2em] uppercase opacity-60 select-none">
          Gif Puzzle
        </span>

        {/* Status pill — purely decorative, shows the component is live */}
        <span className="flex items-center gap-2 text-xs tracking-widest uppercase text-white/30">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: accentColor, opacity: 0.5 }}
          />
          Live
        </span>
      </header>

      {/* ── Hero section — left col copy + right col puzzle ───────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 px-8 lg:px-16 py-16 lg:py-20 max-w-screen-xl mx-auto w-full">

        {/* ── Left: editorial copy ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-7 lg:w-2/5 shrink-0">

          {/* Eyebrow — dot + small-caps label */}
          <div className="flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: accentColor, opacity: 0.4 }}
            />
            <span className="text-white/40 text-xs tracking-[0.22em] uppercase font-medium">
              {eyebrow}
            </span>
          </div>

          {/* Split-weight headline */}
          <div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-[1.0] tracking-tight">
              <span className="font-extralight text-white/30">{headingLight} </span>
              <span className="font-bold text-white">{headingBold}</span>
            </h1>
            {/* Thin accent rule — terminates the heading block */}
            <div
              className="mt-5 w-8 h-px"
              style={{ backgroundColor: accentColor, opacity: 0.25 }}
            />
          </div>

          {/* Subheading */}
          <p className="text-white/40 text-sm lg:text-base leading-loose max-w-xs">
            {subheading}
          </p>

          {/* Stat row */}
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

        {/* ── Right: puzzle grid + hint ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-5 w-full lg:flex-1">

          {/* Outer frame — subtle border wraps the entire grid area */}
          <div
            className="w-full overflow-hidden"
            style={{
              border: "0.5px solid rgba(255,255,255,0.07)",
              borderRadius: 2,
            }}
          >
            {/* Grid container — centred, max-width capped at prop value */}
            <div
              ref={wrapperRef}
              className="mx-auto w-full"
              style={{ maxWidth: maxGridWidth }}
            >
              {/*
                grid-stack class required by GridStack — read from the DOM.
                text-[0px] collapses inline-block whitespace gaps between tiles.
                bgHoverColor is runtime → handled via scoped <style> below.
              */}
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
                    {/*
                      gs-tile: scoped selector for bg-image injection in useEffect.
                      tile + grid-stack-item-content: required by GridStack internals.
                    */}
                    <div className="grid-stack-item-content gs-tile tile !m-0 !p-0 box-border inline-flex bg-no-repeat hover:cursor-pointer active:cursor-grab" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hint line below the grid */}
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

      {/* ── Scoped styles ─────────────────────────────────────────────────────
          Tailwind cannot handle:
          1. GridStack tile max-height / max-width (runtime columnWidth / cellHeight)
          2. .grid-stack:hover background (runtime bgHoverColor)
          3. @keyframes for pulse animations
      ──────────────────────────────────────────────────────────────────────── */}
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