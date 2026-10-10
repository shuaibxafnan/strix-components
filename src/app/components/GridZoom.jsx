"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── GridZoom ────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              array    ITEMS      Grid items { image, number, heading, text, prevImage, nextImage, col, row }
// fontUrl            string   Fontshare  Stylesheet URL for the display font
// fontFamily         string   Satoshi..  CSS font-family stack applied to the component
// headingTracking    string   -0.03em    Letter spacing of the content heading
// bgColor            string   #f7f5ee    Page background
// textColor          string   #000       Text / stroke color
// accentColor        string   #823725    Back arrow hover color
// rowHeight          string   32vmin     Height of each large grid row
// gridPadding        string   0.5vw      Gutter between grid cells
// borderRadius       string   8px        Cell corner radius
// hoverOuterScale    number   0.95       Outer cell scale on hover
// hoverInnerScale    number   1.4        Inner image scale on hover
// hoverDuration      number   2.4        Hover tween duration (s)
// zoomDuration       number   1.2        Open / zoom tween duration (s)
// closeDuration      number   1          Close / change tween duration (s)
// zoomWidthRatio     number   0.54       Zoomed image width as ratio of viewport width
// zoomCenterX        number   0.65       Zoomed image center X as ratio of viewport width
// zoomCenterY        number   0.5        Zoomed image center Y as ratio of viewport height
// othersOpacity      number   0          Opacity of non-active cells when zoomed
// othersScale        number   0.8        Scale of non-active cells when zoomed
// staggerAmount      number   0.17       Stagger amount for the cell fade out
// contentWidth       string   38%        Width of the content panel (md and up)
// contentPadding     string   15vh 8vw 0 Padding of the content panel
// headingSize        string   4vw        Font size of the content heading
// miniGridWidth      string   220px      Mini grid width
// miniGridHeight     string   190px      Mini grid height
// showMiniGrid       bool     true       Show the mini grid navigation
// showSideNav        bool     true       Show the fixed prev / next preview strips
// linkLabel          string   "View more" Label of the content link
// className          string   ""         Extra classes for the root element
// ──────────────────────────────────────────────────────────────────────────

const ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
    number: "01",
    heading: "Masses",
    text: "The instruments by which public opinion is organized and focused may be misused. But such organization and focusing are necessary to orderly life.",
    prevImage:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    col: 1,
    row: 1,
  },
  {
    image:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    number: "02",
    heading: "Invisible",
    text: "As civilization has become more complex, and as the need for invisible government has been increasingly demonstrated, the technical means have been invented and developed by which opinion may be regimented.",
    prevImage:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    col: 3,
    row: 1,
  },
  {
    image:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
    number: "03",
    heading: "Expense",
    text: "The invisible government tends to be concentrated in the hands of the few because of the expense of manipulating the social machinery which controls the opinions and habits of the masses.",
    prevImage:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
    col: 4,
    row: 1,
  },
  {
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    number: "04",
    heading: "Mechanism",
    text: "No matter how sophisticated, how cynical the public may become about publicity methods, it must respond to the basic appeals, because it will always need food, crave amusement, long for beauty, respond to leadership.",
    prevImage:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
    col: 1,
    row: 2,
  },
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    number: "05",
    heading: "Millions",
    text: "This practice of creating circumstances and of creating pictures in the minds of millions of persons is very common.",
    prevImage:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    col: 3,
    row: 2,
  },
  {
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    number: "06",
    heading: "Continuous",
    text: "The important thing is that it is universal and continuous; and in its sum total it is regimenting the public mind every bit as much as an army regiments the bodies of its soldiers.",
    prevImage:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    col: 2,
    row: 3,
  },
  {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    number: "07",
    heading: "Irresistible",
    text: "When regimented, a group at times offers an irresistible pressure before which legislators, editors, and teachers are helpless.",
    prevImage:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    col: 4,
    row: 3,
  },
  {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    number: "08",
    heading: "Pressure",
    text: "A desire for a specific reform, however widespread, cannot be translated into action until it is made articulate, and until it has exerted sufficient pressure upon the proper law-making bodies.",
    prevImage:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    col: 1,
    row: 4,
  },
  {
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    number: "09",
    heading: "Interests",
    text: "In the active proselytizing minorities in whom selfish interests and public interests coincide lie the progress and development of the world.",
    prevImage:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    col: 3,
    row: 4,
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    number: "10",
    heading: "Think",
    text: "Small groups of persons can, and do, make the rest of us think what they please about a given subject.",
    prevImage:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    nextImage:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    col: 3,
    row: 5,
  },
];

export default function GridZoom({
  items = ITEMS,
  fontUrl = "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap",
  fontFamily = "Satoshi, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif",
  headingTracking = "-0.03em",
  bgColor = "#f7f5ee",
  textColor = "#000",
  accentColor = "#823725",
  rowHeight = "32vmin",
  gridPadding = "0.5vw",
  borderRadius = "8px",
  hoverOuterScale = 0.95,
  hoverInnerScale = 1.4,
  hoverDuration = 2.4,
  zoomDuration = 1.2,
  closeDuration = 1,
  zoomWidthRatio = 0.54,
  zoomCenterX = 0.65,
  zoomCenterY = 0.5,
  othersOpacity = 0,
  othersScale = 0.8,
  staggerAmount = 0.17,
  contentWidth = "38%",
  contentPadding = "15vh 8vw 0",
  headingSize = "4vw",
  miniGridWidth = "220px",
  miniGridHeight = "190px",
  showMiniGrid = true,
  showSideNav = true,
  linkLabel = "View more",
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const contentRef = useRef(null);
  const backRef = useRef(null);
  const miniGridRef = useRef(null);

  const cellRefs = useRef([]);
  const innerRefs = useRef([]);
  const miniCellRefs = useRef([]);
  const itemRefs = useRef([]);
  const prevRefs = useRef([]);
  const nextRefs = useRef([]);

  const stateRef = useRef({
    isGridView: true,
    isAnimating: false,
    currentCell: -1,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (!fontUrl) return;
    if (document.querySelector('link[data-id="' + fontUrl + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.setAttribute("data-id", fontUrl);
    document.head.appendChild(link);
  }, [fontUrl]);

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector('script[data-id="' + src + '"]')) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    let cleanup = () => {};

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !rootRef.current) return;

        let winsize = { width: window.innerWidth, height: window.innerHeight };

        const adjustedBoundingRect = (el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const tx = style.transform;
          if (!tx || tx === "none") return rect;
          let sx, sy, dx, dy;
          if (tx.startsWith("matrix3d(")) {
            const ta = tx.slice(9, -1).split(/, /);
            sx = +ta[0];
            sy = +ta[5];
            dx = +ta[12];
            dy = +ta[13];
          } else if (tx.startsWith("matrix(")) {
            const ta = tx.slice(7, -1).split(/, /);
            sx = +ta[0];
            sy = +ta[3];
            dx = +ta[4];
            dy = +ta[5];
          } else {
            return rect;
          }
          const to = style.transformOrigin;
          const x = rect.x - dx - (1 - sx) * parseFloat(to);
          const y =
            rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(" ") + 1));
          const w = sx ? rect.width / sx : el.offsetWidth;
          const h = sy ? rect.height / sy : el.offsetHeight;
          return {
            x: x,
            y: y,
            width: w,
            height: h,
            top: y,
            right: x + w,
            bottom: y + h,
            left: x,
          };
        };

        const innersOf = (el) =>
          el ? [...el.querySelectorAll("[data-oh-inner]")] : [];

        const revealIn = (el) => {
          const inner = innersOf(el);
          if (!inner.length) return null;
          gsap.killTweensOf(inner);
          return gsap
            .timeline({ defaults: { duration: 1.2, ease: "expo" } })
            .set(inner, { y: "120%", rotate: 15 })
            .to(inner, { y: "0%", rotate: 0, stagger: 0.03 });
        };

        const revealOut = (el) => {
          const inner = innersOf(el);
          if (!inner.length) return null;
          gsap.killTweensOf(inner);
          return gsap
            .timeline({ defaults: { duration: 0.5, ease: "expo.in" } })
            .to(inner, { y: "-120%", rotate: -5, stagger: 0.03 });
        };

        const calcTransformImage = () => {
          const el = cellRefs.current[stateRef.current.currentCell];
          if (!el) return { scale: 1, x: 0, y: 0 };
          const r = adjustedBoundingRect(el);
          return {
            scale: (winsize.width * zoomWidthRatio) / r.width,
            x: winsize.width * zoomCenterX - (r.left + r.width / 2),
            y: winsize.height * zoomCenterY - (r.top + r.height / 2),
          };
        };

        const otherCells = (index) =>
          cellRefs.current.filter((el, i) => el && i !== index);

        const showContent = (index) => {
          const cell = cellRefs.current[index];
          const inner = innerRefs.current[index];
          const item = itemRefs.current[index];
          const others = otherCells(index);
          const t = calcTransformImage();

          gsap.killTweensOf([cell, inner, ...others]);
          gsap
            .timeline({
              defaults: { duration: zoomDuration, ease: "expo.inOut" },
              onComplete: () => {
                stateRef.current.isAnimating = false;
              },
            })
            .addLabel("start", 0)
            .set(innersOf(item), { y: "120%", rotate: 15 }, "start")
            .set(gridRef.current, { pointerEvents: "none" }, "start")
            .set(cell, { zIndex: 100 }, "start")
            .set(
              [cell, inner, ...others],
              {
                willChange: "transform, opacity",
              },
              "start",
            )
            .to(
              cell,
              {
                scale: t.scale,
                x: t.x,
                y: t.y,
                onComplete: () => gsap.set(cell, { willChange: "" }),
              },
              "start",
            )
            .to(
              inner,
              {
                scale: 1,
                onComplete: () => gsap.set(inner, { willChange: "" }),
              },
              "start",
            )
            .to(
              [prevRefs.current[index], nextRefs.current[index]],
              {
                y: 0,
              },
              "start",
            )
            .to(
              others,
              {
                opacity: othersOpacity,
                scale: othersScale,
                onComplete: () => gsap.set(others, { willChange: "" }),
                stagger: { grid: "auto", amount: staggerAmount, from: index },
              },
              "start",
            )
            .addLabel("showContent", "start+=0.45")
            .to(
              backRef.current,
              {
                ease: "expo",
                startAt: { x: "50%" },
                x: "0%",
                opacity: 1,
              },
              "showContent",
            )
            .set(miniGridRef.current, { opacity: 1 }, "showContent")
            .set(miniCellRefs.current, { opacity: 0 }, "showContent")
            .to(
              miniCellRefs.current,
              {
                duration: 1,
                ease: "expo",
                opacity: 1,
                startAt: { scale: 0.8 },
                scale: 1,
                stagger: { grid: "auto", amount: 0.3, from: index },
              },
              "showContent+=0.2",
            )
            .add(() => {
              revealIn(item);
              setIsOpen(true);
            }, "showContent");
        };

        const closeContent = () => {
          const index = stateRef.current.currentCell;
          const cell = cellRefs.current[index];
          const item = itemRefs.current[index];
          const others = otherCells(index);

          gsap
            .timeline({
              defaults: { duration: closeDuration, ease: "expo.inOut" },
              onComplete: () => {
                stateRef.current.isAnimating = false;
              },
            })
            .addLabel("start", 0)
            .to(backRef.current, { x: "50%", opacity: 0 }, "start")
            .to(
              miniCellRefs.current,
              {
                duration: 0.5,
                ease: "expo.in",
                opacity: 0,
                scale: 0.8,
                stagger: { grid: "auto", amount: 0.1, from: -index },
                onComplete: () => gsap.set(miniGridRef.current, { opacity: 0 }),
              },
              "start",
            )
            .add(() => {
              revealOut(item);
              setIsOpen(false);
            }, "start")
            .addLabel("showGrid", 0)
            .set(
              [cell, ...others],
              {
                willChange: "transform, opacity",
              },
              "showGrid",
            )
            .to(
              cell,
              {
                scale: 1,
                x: 0,
                y: 0,
                onComplete: () => gsap.set(cell, { willChange: "", zIndex: 1 }),
              },
              "showGrid",
            )
            .to(prevRefs.current[index], { y: "-100%" }, "showGrid")
            .to(nextRefs.current[index], { y: "100%" }, "showGrid")
            .to(
              others,
              {
                opacity: 1,
                scale: 1,
                onComplete: () => {
                  gsap.set(others, { willChange: "" });
                  gsap.set(gridRef.current, { pointerEvents: "auto" });
                },
                stagger: { grid: "auto", amount: staggerAmount, from: -index },
              },
              "showGrid",
            );
        };

        const changeContent = (position) => {
          const index = stateRef.current.currentCell;
          const cell = cellRefs.current[index];
          const item = itemRefs.current[index];
          const upcoming = cellRefs.current[position];
          const upcomingItem = itemRefs.current[position];

          stateRef.current.currentCell = position;
          setCurrentIndex(position);
          const t = calcTransformImage();

          gsap
            .timeline({
              defaults: { duration: closeDuration, ease: "expo.inOut" },
              onComplete: () => {
                stateRef.current.isAnimating = false;
              },
            })
            .addLabel("start", 0)
            .add(() => revealOut(item), "start")
            .set(innersOf(upcomingItem), { y: "120%", rotate: 15 }, "start")
            .set(
              [cell, upcoming],
              {
                willChange: "transform, opacity",
              },
              "start",
            )
            .to(
              cell,
              {
                opacity: 0,
                scale: othersScale,
                x: 0,
                y: 0,
                onComplete: () => gsap.set(cell, { willChange: "", zIndex: 1 }),
              },
              "start",
            )
            .to(prevRefs.current[index], { y: "-100%" }, "start")
            .to(nextRefs.current[index], { y: "100%" }, "start")
            .addLabel("showContent", ">-=0.4")
            .set(upcoming, { zIndex: 100 }, "start")
            .to(
              upcoming,
              {
                scale: t.scale,
                x: t.x,
                y: t.y,
                opacity: 1,
                onComplete: () => gsap.set(upcoming, { willChange: "" }),
              },
              "start",
            )
            .to(
              [prevRefs.current[position], nextRefs.current[position]],
              {
                ease: "expo",
                y: 0,
              },
              "showContent",
            )
            .add(() => revealIn(upcomingItem), "showContent");
        };

        const openHandlers = [];
        cellRefs.current.forEach((cell, position) => {
          if (!cell) return;
          const inner = innerRefs.current[position];

          const onClick = () => {
            if (!stateRef.current.isGridView || stateRef.current.isAnimating) {
              return;
            }
            stateRef.current.isAnimating = true;
            stateRef.current.isGridView = false;
            stateRef.current.currentCell = position;
            setCurrentIndex(position);
            showContent(position);
          };

          const onEnter = () => {
            if (!stateRef.current.isGridView) return;
            gsap.killTweensOf([cell, inner]);
            gsap
              .timeline({
                defaults: { duration: hoverDuration, ease: "expo" },
              })
              .to(cell, { scale: hoverOuterScale }, 0)
              .to(inner, { scale: hoverInnerScale }, 0);
          };

          const onLeave = () => {
            if (!stateRef.current.isGridView) return;
            gsap.killTweensOf([cell, inner]);
            gsap
              .timeline({
                defaults: { duration: hoverDuration, ease: "expo" },
              })
              .to([cell, inner], { scale: 1 }, 0);
          };

          cell.addEventListener("click", onClick);
          cell.addEventListener("mouseenter", onEnter);
          cell.addEventListener("mouseleave", onLeave);
          openHandlers.push({ cell, onClick, onEnter, onLeave });
        });

        const onBack = () => {
          if (stateRef.current.isAnimating) return;
          stateRef.current.isAnimating = true;
          stateRef.current.isGridView = true;
          closeContent();
        };
        if (backRef.current) backRef.current.addEventListener("click", onBack);

        const miniHandlers = [];
        miniCellRefs.current.forEach((cell, position) => {
          if (!cell) return;
          const onMiniClick = () => {
            if (
              stateRef.current.isAnimating ||
              stateRef.current.currentCell === position ||
              stateRef.current.isGridView
            ) {
              return;
            }
            stateRef.current.isAnimating = true;
            changeContent(position);
          };
          cell.addEventListener("click", onMiniClick);
          miniHandlers.push({ cell, onMiniClick });
        });

        const onResize = () => {
          winsize = { width: window.innerWidth, height: window.innerHeight };
          if (stateRef.current.isGridView) return;
          const t = calcTransformImage();
          gsap.set(cellRefs.current[stateRef.current.currentCell], {
            scale: t.scale,
            x: t.x,
            y: t.y,
          });
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          openHandlers.forEach((h) => {
            h.cell.removeEventListener("click", h.onClick);
            h.cell.removeEventListener("mouseenter", h.onEnter);
            h.cell.removeEventListener("mouseleave", h.onLeave);
          });
          miniHandlers.forEach((h) =>
            h.cell.removeEventListener("click", h.onMiniClick),
          );
          if (backRef.current) {
            backRef.current.removeEventListener("click", onBack);
          }
          window.removeEventListener("resize", onResize);
        };
      })
      .catch((e) => console.error("[GridZoom] GSAP load failed:", e.message));

    return () => cleanup();
  }, [
    items,
    hoverDuration,
    hoverInnerScale,
    hoverOuterScale,
    zoomDuration,
    closeDuration,
    zoomWidthRatio,
    zoomCenterX,
    zoomCenterY,
    othersOpacity,
    othersScale,
    staggerAmount,
  ]);

  const scope = "gz-" + uid;

  const cellShellStyle = {
    width: "calc(100% - " + gridPadding + " * 2)",
    height: "calc(100% - " + gridPadding + " * 2)",
    margin: gridPadding,
    borderRadius: borderRadius,
  };

  return (
    <div
      ref={rootRef}
      className={scope + " relative w-full antialiased " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: fontFamily,
      }}
    >
      <style>
        {"." +
          scope +
          " .gz-oh{overflow:hidden;}" +
          "." +
          scope +
          " .gz-oh-inner{display:inline-block;transform-origin:0% 50%;will-change:transform;}" +
          "." +
          scope +
          " .gz-content .gz-oh-inner{transform:translateY(120%) rotate(15deg);}" +
          "." +
          scope +
          " .gz-mini-cell:not(.gz-current):hover .gz-mini-img{opacity:0.7;}" +
          "." +
          scope +
          " .gz-current .gz-mini-img{opacity:0.3;}" +
          "." +
          scope +
          " .gz-back:hover svg path{stroke:" +
          accentColor +
          ";}"}
      </style>

      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gridAutoRows: rowHeight, padding: gridPadding }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="grid items-end"
            style={{ gridColumn: item.col, gridRow: item.row }}
          >
            <div
              ref={(el) => (cellRefs.current[i] = el)}
              className="relative block overflow-hidden"
              style={cellShellStyle}
            >
              <div
                ref={(el) => (innerRefs.current[i] = el)}
                className="h-full w-full cursor-pointer bg-cover bg-center"
                style={{ backgroundImage: "url(" + item.image + ")" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        ref={contentRef}
        className="gz-content pointer-events-none fixed inset-0 z-[1000] flex flex-col justify-between"
        style={{ padding: contentPadding, width: contentWidth }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className={
              "grid " +
              (currentIndex === i
                ? "relative opacity-100 " +
                  (isOpen ? "pointer-events-auto" : "pointer-events-none")
                : "pointer-events-none absolute opacity-0")
            }
          >
            <span className="gz-oh block text-xs font-medium uppercase tracking-[0.25em] opacity-60">
              <span className="gz-oh-inner" data-oh-inner>
                {item.number}
              </span>
            </span>
            <h2
              className="gz-oh mb-12 mt-5 font-black leading-[0.95]"
              style={{ fontSize: headingSize, letterSpacing: headingTracking }}
            >
              <span className="gz-oh-inner" data-oh-inner>
                {item.heading}
              </span>
            </h2>
            <p className="gz-oh mb-8 max-w-[32ch] text-[0.95rem] leading-relaxed opacity-75">
              <span className="gz-oh-inner" data-oh-inner>
                {item.text}
              </span>
            </p>
            <span className="gz-oh cursor-pointer text-xs font-medium uppercase tracking-[0.2em]">
              <span className="gz-oh-inner" data-oh-inner>
                {linkLabel}
              </span>
            </span>

            {showSideNav ? (
              <nav
                className="pointer-events-none fixed top-0 grid h-full w-[40%] content-between"
                style={{ right: "15%" }}
              >
                <div
                  ref={(el) => (prevRefs.current[i] = el)}
                  className={
                    "relative h-[10vh] w-full overflow-hidden bg-cover bg-center opacity-30 " +
                    (isOpen ? "pointer-events-auto" : "")
                  }
                  style={{
                    backgroundImage: "url(" + item.prevImage + ")",
                    borderRadius: "0 0 1.5vw 1.5vw",
                    transform: "translateY(-100%)",
                  }}
                />
                <div
                  ref={(el) => (nextRefs.current[i] = el)}
                  className={
                    "relative h-[10vh] w-full overflow-hidden bg-cover bg-center opacity-30 " +
                    (isOpen ? "pointer-events-auto" : "")
                  }
                  style={{
                    backgroundImage: "url(" + item.nextImage + ")",
                    borderRadius: "1.5vw 1.5vw 0 0",
                    transform: "translateY(100%)",
                  }}
                />
              </nav>
            ) : null}
          </div>
        ))}

        <button
          ref={backRef}
          type="button"
          aria-label="Back"
          className={
            "gz-back z-[1000] mb-6 mt-auto w-[50px] cursor-pointer border-0 bg-transparent p-0 opacity-0 " +
            (isOpen ? "pointer-events-auto" : "pointer-events-none")
          }
        >
          <svg viewBox="0 0 50 9" width="100%">
            <path
              d="M0 4.5l5-3M0 4.5l5 3M50 4.5h-77"
              fill="none"
              strokeLinecap="round"
              style={{ stroke: textColor }}
            />
          </svg>
        </button>

        {showMiniGrid ? (
          <nav
            ref={miniGridRef}
            className={
              "relative mb-[3vh] hidden grid-cols-4 opacity-0 md:grid " +
              (isOpen ? "pointer-events-auto" : "pointer-events-none")
            }
            style={{ width: miniGridWidth, height: miniGridHeight }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                ref={(el) => (miniCellRefs.current[i] = el)}
                className={
                  "gz-mini-cell grid cursor-pointer items-end " +
                  (currentIndex === i ? "gz-current" : "")
                }
                style={{ gridColumn: item.col, gridRow: item.row }}
              >
                <div
                  className="gz-mini-img relative m-px block h-[calc(100%-2px)] w-[calc(100%-2px)] overflow-hidden bg-cover bg-center transition-opacity"
                  style={{
                    backgroundImage: "url(" + item.image + ")",
                    borderRadius: borderRadius,
                  }}
                />
              </div>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
