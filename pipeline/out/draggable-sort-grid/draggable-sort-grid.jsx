"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function DraggableSortGrid({
  items = [
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
  cardColor = "#13151a",
  borderColor = "#27272a",
  textColor = "#d4d4d8",
  mutedColor = "#71717a",
  accentColor = "#a855f7",
  className = "",
}) {
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const [avail, setAvail] = useState(0);

  const fitWidth = avail
    ? Math.max(40, Math.min(itemWidth, (avail - (cols - 1) * colGap) / cols))
    : itemWidth;
  const ratio = fitWidth / itemWidth;
  const w = Math.floor(fitWidth);
  const h = Math.floor(itemHeight * ratio);
  const totalWidth = cols * w + (cols - 1) * colGap;
  const totalHeight = rows * h + (rows - 1) * rowGap;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setAvail(Math.max(0, root.clientWidth - 32));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const draggers = [];
    const tweens = [];
    let sortables = [];
    let container = null;

    async function initDraggableGrid() {
      const { Draggable } = await import("gsap/Draggable");
      gsap.registerPlugin(Draggable);
      if (cancelled) return;

      container = containerRef.current;
      if (!container) return;

      const listItems = gsap.utils.toArray(".grid-sort-item", container);

      const clampCol = gsap.utils.clamp(0, cols - 1);
      const clampRow = gsap.utils.clamp(0, rows - 1);

      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            row: r,
            col: c,
            x: c * (w + colGap),
            y: r * (h + rowGap),
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

        sortables.forEach((sortable) =>
          container.appendChild(sortable.element),
        );
        sortables.forEach((sortable, idx) => sortable.setIndex(idx));
      }

      function createSortable(element, index) {
        const content = element.querySelector(".item-card-ui");
        const orderLabel = element.querySelector(".order-badge");
        const getProp = gsap.getProperty(element);

        const interactionAnim = gsap.to(content, {
          duration: 0.3,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          borderColor: accentColor,
          scale: 1.04,
          paused: true,
          force3D: true,
        });
        tweens.push(interactionAnim);

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
            const curCol = clampCol(Math.round(this.x / (w + colGap)));
            const curRow = clampRow(Math.round(this.y / (h + rowGap)));

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
        draggers.push(dragger);

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

      sortables = listItems.map((el, idx) => createSortable(el, idx));

      gsap.to(container, { autoAlpha: 1, duration: 0.4 });
    }

    initDraggableGrid();

    return () => {
      cancelled = true;
      draggers.forEach((d) => d.kill());
      tweens.forEach((t) => t.kill());
      if (container) {
        gsap.killTweensOf(container);
        gsap.utils
          .toArray(".grid-sort-item", container)
          .forEach((el) => gsap.killTweensOf(el));
      }
    };
  }, [cols, rows, colGap, rowGap, w, h, accentColor, items]);

  return (
    <div
      ref={rootRef}
      className={`w-full h-screen flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      <div
        className="relative overflow-visible invisible opacity-0"
        ref={containerRef}
      >
        <div
          style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
          className="relative"
        >
          {items.slice(0, cols * rows).map((item, index) => (
            <div
              key={item}
              style={{ width: `${w}px`, height: `${h}px`, touchAction: "none" }}
              className="grid-sort-item absolute top-0 left-0 will-change-transform"
            >
              <div
                style={{
                  backgroundColor: cardColor,
                  borderColor,
                  color: textColor,
                }}
                className="item-card-ui w-full h-full border rounded-xl p-3 sm:p-6 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-sm"
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    style={{ color: accentColor, borderColor }}
                    className="order-badge font-mono text-xs font-bold tracking-wider bg-black/30 border px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow-inner"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-1 opacity-50">
                    {[0, 1, 2].map((row) => (
                      <div key={row} className="flex gap-1">
                        <span
                          style={{ backgroundColor: mutedColor }}
                          className="w-1 h-1 rounded-full"
                        />
                        <span
                          style={{ backgroundColor: mutedColor }}
                          className="w-1 h-1 rounded-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm sm:text-lg font-medium tracking-wide truncate">
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
