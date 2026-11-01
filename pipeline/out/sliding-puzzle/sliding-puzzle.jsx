"use client";

import { useEffect, useRef } from "react";

const DEFAULT_PIECES = [
  "https://kdrive.infomaniak.com/app/share/457035/03ef02e7-6bcd-4719-b144-665ea831b144/2077/preview",
  "https://kdrive.infomaniak.com/app/share/457035/03ef02e7-6bcd-4719-b144-665ea831b144/2073/preview",
  "https://kdrive.infomaniak.com/app/share/457035/03ef02e7-6bcd-4719-b144-665ea831b144/2075/preview",
  "https://kdrive.infomaniak.com/app/share/457035/03ef02e7-6bcd-4719-b144-665ea831b144/2080/preview",
  "https://kdrive.infomaniak.com/app/share/457035/03ef02e7-6bcd-4719-b144-665ea831b144/2081/preview",
  "https://kdrive.infomaniak.com/app/share/457035/03ef02e7-6bcd-4719-b144-665ea831b144/2076/preview",
  "https://kdrive.infomaniak.com/app/share/457035/03ef02e7-6bcd-4719-b144-665ea831b144/2078/preview",
  "https://kdrive.infomaniak.com/app/share/457035/03ef02e7-6bcd-4719-b144-665ea831b144/2079/preview",
];

export default function SlidingPuzzle({
  gridSize = 3,
  overlapThreshold = "20%",
  swapDuration = 0.2,
  accentColor = "#84cc16",
  badgeLabel = "New game",
  headingLight = "Solve",
  headingBold = "the puzzle.",
  subheading = "Discover the image by moving the pieces one by one.",
  gridLabel = "Grid",
  piecesLabel = "Pieces",
  movesLabel = "Moves",
  resetLabel = "Start again",
  pieces = DEFAULT_PIECES,
  piecePadding = "3px",
  pieceRadius = "4px",
  bgFrom = "#d7ff96",
  bgTo = "#a3e635",
  backgroundColor = "#f5f5f4",
  textColor = "#1c1917",
  mutedColor = "#a8a29e",
  buttonColor = "#1c1917",
  buttonTextColor = "#ffffff",
  className = "",
}) {
  const puzzleRef = useRef(null);
  const resetBtnRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let draggables = [];
    let timers = [];
    let resetBtn = null;
    let onReset = null;
    let gsapRef = null;

    const init = async () => {
      const gsapModule = await import("gsap");
      const draggableModule = await import("gsap/Draggable");
      if (cancelled || !puzzleRef.current) return;
      const gsap = gsapModule.gsap || gsapModule.default;
      const Draggable = draggableModule.Draggable || draggableModule.default;
      gsap.registerPlugin(Draggable);
      gsapRef = gsap;

      const puzzle = puzzleRef.current;
      const allPieces = puzzle.querySelectorAll(".sp-piece");
      resetBtn = resetBtnRef.current;

      const totalCols = gridSize;
      const totalRows = gridSize;
      const gridWidth = Math.round(puzzle.offsetWidth / totalCols);
      const gridHeight = gridWidth;

      gsap.set(puzzle, {
        width: totalCols * gridWidth,
        height: totalRows * gridHeight,
      });

      allPieces.forEach((piece) => {
        const { positionLeft, positionTop } = piece.dataset;
        gsap.set(piece, {
          width: gridWidth,
          height: gridHeight,
          x: gridWidth * (positionLeft - 1),
          y: gridHeight * (positionTop - 1),
        });
      });

      const swapOverlap = (el) => {
        allPieces.forEach((piece) => {
          if (el.hitTest(piece, overlapThreshold)) {
            if (piece.classList.contains("sp-empty")) {
              gsap.to(piece, { duration: swapDuration, x: el.startX, y: el.startY });
              if (resetBtn) resetBtn.disabled = false;
            } else {
              gsap.to(el.target, {
                duration: swapDuration,
                x: el.startX,
                y: el.startY,
              });
            }
          }
        });
      };

      const refreshDraggable = () => {
        const emptyEl = puzzle.querySelector(".sp-empty");
        if (!emptyEl) return;
        const emptyRect = emptyEl.getBoundingClientRect();

        allPieces.forEach((piece) => {
          if (piece.classList.contains("sp-empty")) return;
          const r = piece.getBoundingClientRect();

          const adjacentH =
            (Math.abs(Math.floor(r.left) - Math.floor(emptyRect.right)) <= 10 &&
              r.top === emptyRect.top) ||
            (Math.abs(Math.floor(r.right) - Math.floor(emptyRect.left)) <= 10 &&
              r.top === emptyRect.top);

          const adjacentV =
            (Math.abs(Math.floor(r.top) - Math.floor(emptyRect.bottom)) <= 10 &&
              r.left === emptyRect.left) ||
            (Math.abs(Math.floor(r.bottom) - Math.floor(emptyRect.top)) <= 10 &&
              r.left === emptyRect.left);

          piece.classList.toggle("sp-draggable", adjacentH || adjacentV);
        });
      };
      const scheduleRefresh = () => {
        timers.push(setTimeout(refreshDraggable, 300));
      };
      refreshDraggable();

      if (resetBtn) {
        onReset = (e) => {
          resetBtn.disabled = true;
          allPieces.forEach((piece) => {
            const { positionLeft, positionTop } = piece.dataset;
            gsap.to(piece, {
              duration: swapDuration,
              x: gridWidth * (positionLeft - 1),
              y: gridHeight * (positionTop - 1),
            });
          });
          scheduleRefresh();
          e.preventDefault();
        };
        resetBtn.addEventListener("click", onReset);
      }

      draggables = Draggable.create(allPieces, {
        bounds: puzzle,
        dragResistance: 1,
        edgeResistance: 0.9,
        type: "x,y",
        onPressInit: function () {
          this.startX = gsap.getProperty(this.target, "x");
          this.startY = gsap.getProperty(this.target, "y");
          this.dragResistance = this.target.classList.contains("sp-draggable")
            ? 0
            : 1;
        },
        onDragEnd: function () {
          const snappedX = Math.round(this.x / gridWidth) * gridWidth;
          const snappedY = Math.round(this.y / gridHeight) * gridHeight;

          gsap.to(this.target, {
            duration: swapDuration,
            x: snappedX,
            y: snappedY,
            onComplete: () => {
              swapOverlap(this);
              scheduleRefresh();
            },
          });
        },
      });
    };

    init();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      draggables.forEach((d) => d.kill());
      if (resetBtn && onReset) resetBtn.removeEventListener("click", onReset);
      if (gsapRef && puzzleRef.current) {
        gsapRef.killTweensOf(puzzleRef.current.querySelectorAll(".sp-piece"));
      }
    };
  }, [gridSize, overlapThreshold, swapDuration, pieces]);

  const cells = [];
  let pieceIndex = 0;

  for (let row = 1; row <= gridSize; row++) {
    for (let col = 1; col <= gridSize; col++) {
      const isEmpty = row === 1 && col === 1;
      cells.push({
        row,
        col,
        isEmpty,
        url: isEmpty ? null : pieces[pieceIndex++],
      });
    }
  }

  return (
    <section
      className={`p-10 lg:p-20 xl:px-40 min-h-screen flex flex-col justify-center items-center overflow-hidden relative z-10 cursor-default antialiased ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <div
        className="absolute inset-0 -z-10 overflow-hidden blur-3xl opacity-30 pointer-events-none"
        style={{ transform: "translateZ(0) translate3d(0,0,0)" }}
      >
        <svg
          className="w-full h-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-125"
          viewBox="0 0 1425 1119"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient
              id="sp-blob-grad"
              cx="712.5"
              cy="559.5"
              gradientUnits="userSpaceOnUse"
              r="640.5843"
            >
              <stop offset="0" stopColor={bgFrom} />
              <stop offset="1" stopColor={bgTo} />
            </radialGradient>
          </defs>
          <path
            d="m76.6 98c102.5-76.8 532.4-197 253.5 48.8s251.7 32.8 343.7 81.6-69.5 382.7-226.3 342.4-204.7-249.6-340-143.6-139.9-247.6-30.9-329.2zm983.4 868.8c118.6-107.8 166.1-217.7 314.9-310.3 148.8-92.7-73.3-140.1-155.3-60.3-82 79.7-166.8-10.9-256.6 142.2-73.3 125-21.6 336.2 97 228.4zm-899.1-142.6c23.1-38.3 225.3 16.2 235.8 91.7 6.7 48.7-69.5 82.1-57.6 136.3 10.2 46.4 77.6 73.3 83.8 65.5 14.7-18.2-293.7-241-262-293.5z"
            fill="url(#sp-blob-grad)"
          />
        </svg>
      </div>

      <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-12 gap-x-12 gap-y-10 max-w-screen-2xl w-full">
        <div className="lg:col-span-5 flex flex-col justify-center gap-y-6 md:gap-y-8">
          <div className="flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <span
              className="text-xs tracking-widest uppercase font-medium"
              style={{ color: mutedColor }}
            >
              {badgeLabel}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl leading-[1.05] tracking-tight">
            <span className="font-light" style={{ color: mutedColor }}>
              {headingLight}
            </span>{" "}
            <span className="font-bold">{headingBold}</span>
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-sm opacity-70"
          >
            {subheading}
          </p>

          <div className="flex items-center gap-6 text-sm" style={{ color: mutedColor }}>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-2xl" style={{ color: textColor }}>
                {gridSize}x{gridSize}
              </span>
              <span className="text-xs uppercase tracking-wider">{gridLabel}</span>
            </div>
            <div className="w-px h-8 shrink-0 bg-current opacity-30" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-2xl" style={{ color: textColor }}>
                {gridSize * gridSize - 1}
              </span>
              <span className="text-xs uppercase tracking-wider">{piecesLabel}</span>
            </div>
            <div className="w-px h-8 shrink-0 bg-current opacity-30" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-2xl" style={{ color: accentColor }}>
                &#8734;
              </span>
              <span className="text-xs uppercase tracking-wider">{movesLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              ref={resetBtnRef}
              type="button"
              disabled
              className="px-6 py-2.5 text-sm font-medium tracking-wide rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
            >
              {resetLabel}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center gap-y-0.5">
          <div ref={puzzleRef} className="w-full relative">
            {cells.map(({ row, col, isEmpty, url }) =>
              isEmpty ? (
                <div
                  key={`${col}-${row}`}
                  className="sp-piece sp-empty absolute"
                  data-position-left={col}
                  data-position-top={row}
                />
              ) : (
                <div
                  key={`${col}-${row}`}
                  className="sp-piece absolute"
                  data-position-left={col}
                  data-position-top={row}
                  style={{ padding: piecePadding }}
                >
                  <div
                    className="w-full h-full bg-center bg-no-repeat bg-cover"
                    style={{
                      backgroundImage: `url(${url})`,
                      borderRadius: pieceRadius,
                    }}
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sp-piece:not(.sp-draggable) { cursor: default !important; }
        .sp-piece.sp-draggable       { cursor: grab; touch-action: none; }
        .sp-piece.sp-draggable:active{ cursor: grabbing; }
      `}</style>
    </section>
  );
}
