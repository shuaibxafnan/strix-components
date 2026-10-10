"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

// ─── ModernDraggableGrid ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// initialItems  array    List of strings to populate the layout nodes
// cols          number   3            Grid column distribution count
// rows          number   3            Grid row distribution count
// colGap        number   16           Horizontal padding spacing in pixels
// rowGap        number   16           Vertical padding spacing in pixels
// itemWidth     number   240          Base layout width per grid element
// itemHeight    number   140          Base layout height per grid element
// ──────────────────────────────────────────────────────────────────────────

export default function ModernDraggableGrid({
  initialItems = [
    "Alpha",
    "Bravo",
    "Charlie",
    "Delta",
    "Echo",
    "Foxtrot",
    "Gulf",
    "Hotel",
    "India",
  ],
  cols = 3,
  rows = 3,
  colGap = 16,
  rowGap = 16,
  itemWidth = 240,
  itemHeight = 140,
}) {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Compute calculated dimensions based on standard configuration metrics
  const totalWidth = cols * itemWidth + (cols - 1) * colGap;
  const totalHeight = rows * itemHeight + (rows - 1) * rowGap;

  useEffect(() => {
    // Dynamic import to isolate execution context strictly within window bounds
    async function initDraggableGrid() {
      const { Draggable } = await import("gsap/Draggable");
      gsap.registerPlugin(Draggable);

      const container = containerRef.current;
      if (!container) return;

      const listItems = gsap.utils.toArray(".grid-sort-item");
      let sortables = [];

      const clampCol = gsap.utils.clamp(0, cols - 1);
      const clampRow = gsap.utils.clamp(0, rows - 1);

      // Generate dynamic spatial coordinate structural frames
      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            row: r,
            col: c,
            x: c * (itemWidth + colGap),
            y: r * (itemHeight + rowGap),
          });
        }
      }

      function arrayMove(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
      }

      function changeIndex(item, to, sameRow, sameCol) {
        if ((sameRow && !sameCol) || (!sameRow && sameCol)) {
          const temp = sortables[to];
          sortables[to] = item;
          sortables[item.index] = temp;
        } else {
          arrayMove(sortables, item.index, to);
        }

        // Maintain continuous structural append update passes securely
        sortables.forEach((sortable) =>
          container.appendChild(sortable.element),
        );
        sortables.forEach((sortable, idx) => sortable.setIndex(idx));
      }

      function createSortable(element, index) {
        const content = element.querySelector(".item-card-ui");
        const orderLabel = element.querySelector(".order-badge");
        const getProp = gsap.getProperty(element);

        // Modern pop-out hover scale and soft dramatic drop-shadow mapping
        const interactionAnim = gsap.to(content, {
          duration: 0.3,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          borderColor: "rgba(168, 85, 247, 0.4)", // Purple accent border glow on pick
          scale: 1.04,
          paused: true,
          force3D: true,
        });

        const dragger = new Draggable(element, {
          onDragStart() {
            interactionAnim.play();
            this.update();
          },
          onRelease() {
            interactionAnim.reverse();
            layout();
          },
          onDrag() {
            const curCol = clampCol(Math.round(this.x / (itemWidth + colGap)));
            const curRow = clampRow(Math.round(this.y / (itemHeight + rowGap)));

            const currentCell = sortable.cell;
            const sameCol = curCol === currentCell.col;
            const sameRow = curRow === currentCell.row;

            if (!sameRow || !sameCol) {
              const targetIndex = cols * curRow + curCol;
              changeIndex(sortable, targetIndex, sameRow, sameCol);
            }
          },
          cursor: "grab",
          activeCursor: "grabbing",
        });

        const sortable = {
          cell: cells[index],
          dragger: dragger,
          element: element,
          index: index,
          setIndex(newIdx) {
            const targetCell = cells[newIdx];
            const isDirty =
              getProp("x") !== targetCell.x || getProp("y") !== targetCell.y;

            sortable.cell = targetCell;
            sortable.index = newIdx;

            if (orderLabel) {
              orderLabel.textContent = String(newIdx + 1).padStart(2, "0");
            }

            if (!dragger.isDragging && isDirty) {
              layout();
            }
          },
        };

        gsap.set(element, {
          x: sortable.cell.x,
          y: sortable.cell.y,
        });

        function layout() {
          gsap.to(element, {
            duration: 0.35,
            ease: "power2.out",
            x: sortable.cell.x,
            y: sortable.cell.y,
          });
        }

        return sortable;
      }

      // Initialize primary sortable map structural reference points
      sortables = listItems.map((el, idx) => createSortable(el, idx));

      // Reveal layout seamlessly once calculations finish
      gsap.to(container, { autoAlpha: 1, duration: 0.4 });
      setIsReady(true);
    }

    initDraggableGrid();
  }, [cols, rows, colGap, rowGap, itemWidth, itemHeight]);

  return (
    <div className="w-full min-h-screen bg-[#0b0c0e] flex flex-col items-center justify-center p-8 overflow-hidden select-none">
      {/* Decorative background grid layout accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e2026_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Component Title Header Block */}
      <div className="mb-12 text-center relative z-10">
        <h2 className="text-sm font-semibold tracking-[0.2em] text-purple-400 uppercase mb-2">
          Interactive Canvas
        </h2>
        <p className="text-2xl font-light text-zinc-100 tracking-wide">
          Draggable Matrix Sort
        </p>
      </div>

      {/* Primary Bounds Sorting Container Frame */}
      <div
        className="relative overflow-visible invisible opacity-0"
        ref={containerRef}
      >
        <div
          style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
          className="relative transition-opacity duration-300"
        >
          {initialItems.slice(0, cols * rows).map((item, index) => (
            <div
              key={item}
              style={{ width: `${itemWidth}px`, height: `${itemHeight}px` }}
              className="grid-sort-item absolute top-0 left-0 will-change-transform"
            >
              {/* Card visual design block layout */}
              <div className="item-card-ui w-full h-full bg-[#13151a] border border-zinc-800/80 rounded-xl p-6 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] transition-colors duration-200 hover:border-zinc-700/50 backdrop-blur-sm group">
                <div className="flex items-center justify-between w-full">
                  {/* Styled incremental index counter badge window */}
                  <span className="order-badge font-mono text-xs font-bold tracking-wider text-zinc-500 bg-zinc-900/80 border border-zinc-800/60 px-2.5 py-1 rounded-md shadow-inner transition-colors group-hover:text-purple-400 group-hover:border-purple-500/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Grip anchor layout visual icon indicator */}
                  <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-80 transition-opacity">
                    <div className="flex gap-1">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Target label content layout string */}
                <div className="text-lg font-medium tracking-wide text-zinc-300 group-hover:text-zinc-100 transition-colors">
                  {item}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
