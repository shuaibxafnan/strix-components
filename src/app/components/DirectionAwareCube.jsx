"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Default items
// ---------------------------------------------------------------------------
const DEFAULT_ITEMS = [
  {
    title: "Angus Young",
    image:
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Aurora",
    image:
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Bride of Frankenstein",
    image:
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Dracula",
    image:
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Salvador Dalí",
    image:
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Ilhuicatl Xoxouhqui",
    image:
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "L'Homme qui rit",
    image:
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Visualization",
    image:
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Visualization II",
    image:
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Visualization III",
    image:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Zombie",
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "X-Rays",
    image:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=1200&q=80",
  },
];
// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DirectionAwareCube({
  items = DEFAULT_ITEMS,

  // Sizing
  tileSize = 180,
  gap = 6,
  columns = 4,

  // Animation
  duration = 220,
  easing = "ease-out",
  perspective = 320,

  // Colors — runtime values, kept as inline styles
  backgroundColor = "#0a0a0a",
  frontGradFrom = "#1a1a2e",
  frontGradTo = "#0f0f1e",
  backBackground = "radial-gradient(circle at 50% 40%, #1e1e2e, #0a0a0a 160%)",
  titleColor = "#f0ece4",

  // Typography — runtime font strings, kept as inline styles
  titleFont = "'Cormorant Garamond', Georgia, serif",
  titleSize = "1.1rem",

  // Header
  showHeader = true,
  headerTitle = "Direction Aware",
  headerSubtitle = "Hover from any edge",

  className = "",
}) {
  const listRef = useRef(null);
  const half = tileSize / 2;
  const negHalf = -half;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const tiles = Array.from(list.querySelectorAll(".dac-tile"));
    const nodes = tiles.map((el) => ({
      el,
      w: el.offsetWidth,
      h: el.offsetHeight,
      l: el.offsetLeft,
      t: el.offsetTop,
    }));

    const update = () =>
      nodes.forEach((n) => {
        n.w = n.el.offsetWidth;
        n.h = n.el.offsetHeight;
        n.l = n.el.offsetLeft;
        n.t = n.el.offsetTop;
      });

    const getDirection = (ev, node) => {
      const { w, h, l, t } = node;
      const x = ev.pageX - l - (w / 2) * (w > h ? h / w : 1);
      const y = ev.pageY - t - (h / 2) * (h > w ? w / h : 1);
      return Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
    };

    const DIRS = ["top", "right", "bottom", "left"];
    const ALL = [
      "in-top",
      "in-right",
      "in-bottom",
      "in-left",
      "out-top",
      "out-right",
      "out-bottom",
      "out-left",
    ];

    const setClass = (el, state, dir) => {
      ALL.forEach((c) => el.classList.remove(c));
      el.classList.add(`${state}-${DIRS[dir]}`);
    };

    const handlers = nodes.map((node) => {
      const onEnter = (ev) => setClass(node.el, "in", getDirection(ev, node));
      const onOut = (ev) => setClass(node.el, "out", getDirection(ev, node));
      node.el.addEventListener("mouseenter", onEnter);
      node.el.addEventListener("mouseleave", onOut);
      return { el: node.el, onEnter, onOut };
    });

    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      handlers.forEach(({ el, onEnter, onOut }) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onOut);
      });
    };
  }, [items]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .dac-w {
          position: absolute; inset: 0;
          transform-style: preserve-3d;
          transform-origin: 50% 50% ${negHalf}px;
          will-change: transform;
          pointer-events: none;
          animation-duration: ${duration}ms;
          animation-timing-function: ${easing};
          animation-fill-mode: forwards;
          animation-play-state: paused;
          animation-iteration-count: 1;
        }

        .dac-front {
          position: absolute; inset: 0;
          transform: translate3d(0, 0, 0);
          overflow: hidden;
        }
        .dac-front img {
          width: 100%; height: 100%;
          object-fit: cover;
          mix-blend-mode: luminosity;
          display: block;
        }

        .dac-back {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 1rem;
          transform: translate3d(0, 0, -1px);
        }

        .in-top .dac-back,    .out-top .dac-back    { transform-origin: 0% 100%; transform: translate3d(0, -100%, 0) rotate3d(1,0,0,90deg); }
        .in-right .dac-back,  .out-right .dac-back  { transform-origin: 0% 0%;   transform: translate3d(100%, 0, 0) rotate3d(0,1,0,90deg); }
        .in-bottom .dac-back, .out-bottom .dac-back { transform-origin: 0% 0%;   transform: translate3d(0, 100%, 0) rotate3d(-1,0,0,90deg); }
        .in-left .dac-back,   .out-left .dac-back   { transform-origin: 100% 0;  transform: translate3d(-100%, 0, 0) rotate3d(0,-1,0,90deg); }

        .in-top .dac-w    { animation-name: dac-in-top;    animation-play-state: running; }
        .in-right .dac-w  { animation-name: dac-in-right;  animation-play-state: running; }
        .in-bottom .dac-w { animation-name: dac-in-bottom; animation-play-state: running; }
        .in-left .dac-w   { animation-name: dac-in-left;   animation-play-state: running; }
        .out-top .dac-w    { animation-name: dac-out-top;    animation-play-state: running; }
        .out-right .dac-w  { animation-name: dac-out-right;  animation-play-state: running; }
        .out-bottom .dac-w { animation-name: dac-out-bottom; animation-play-state: running; }
        .out-left .dac-w   { animation-name: dac-out-left;   animation-play-state: running; }

        @keyframes dac-in-top    { from{transform:rotate3d(0,0,0,0deg)}    to{transform:rotate3d(-1,0,0,90deg)} }
        @keyframes dac-out-top   { from{transform:rotate3d(-1,0,0,90deg)}  to{transform:rotate3d(0,0,0,0deg)} }
        @keyframes dac-in-right  { from{transform:rotate3d(0,0,0,0deg)}    to{transform:rotate3d(0,-1,0,90deg)} }
        @keyframes dac-out-right { from{transform:rotate3d(0,-1,0,90deg)}  to{transform:rotate3d(0,0,0,0deg)} }
        @keyframes dac-in-bottom { from{transform:rotate3d(0,0,0,0deg)}    to{transform:rotate3d(1,0,0,90deg)} }
        @keyframes dac-out-bottom{ from{transform:rotate3d(1,0,0,90deg)}   to{transform:rotate3d(0,0,0,0deg)} }
        @keyframes dac-in-left   { from{transform:rotate3d(0,0,0,0deg)}    to{transform:rotate3d(0,1,0,90deg)} }
        @keyframes dac-out-left  { from{transform:rotate3d(0,1,0,90deg)}   to{transform:rotate3d(0,0,0,0deg)} }
      `}</style>

      <div
        className={`w-full min-h-full flex flex-col items-center py-16 px-6 ${className}`}
        style={{ backgroundColor }}
      >
        {/* Header */}
        {showHeader && (
          <div className="w-full text-center mb-12">
            <h1
              className="font-light italic leading-none mb-3 tracking-[-0.02em]"
              style={{
                fontFamily: titleFont,
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                color: titleColor,
              }}
            >
              {headerTitle}
            </h1>
            <p
              className="text-[0.65rem] tracking-widest uppercase text-[rgba(240,236,228,0.25)] font-light"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {headerSubtitle}
            </p>
          </div>
        )}

        {/* Tile grid */}
        <ul
          ref={listRef}
          className="list-none p-0 m-0 flex flex-wrap justify-center"
          style={{
            gap: `${gap}px`,
            maxWidth: `${(tileSize + gap) * columns}px`,
          }}
        >
          {items.map((item, i) => (
            <li
              key={i}
              className="dac-tile relative cursor-pointer rounded-[10px] overflow-hidden flex-shrink-0"
              style={{
                width: tileSize,
                height: tileSize,
                perspective: `${perspective}px`,
              }}
            >
              <div className="dac-w">
                {/* Front face */}
                <div
                  className="dac-front rounded-[10px]"
                  style={{
                    background: `linear-gradient(180deg, ${frontGradFrom}, ${frontGradTo})`,
                  }}
                >
                  <img src={item.image} alt={item.title} draggable={false} />
                </div>

                {/* Back face — gold top line removed */}
                <div
                  className="dac-back rounded-[10px]"
                  style={{ background: backBackground }}
                >
                  <h3
                    className="font-light italic leading-tight tracking-[0.01em]"
                    style={{
                      fontFamily: titleFont,
                      fontSize: titleSize,
                      color: titleColor,
                      textShadow: "0 8px 24px rgba(0,0,0,0.8)",
                    }}
                  >
                    {item.title}
                  </h3>

                  {/* Index number — bottom right */}
                  <span
                    className="absolute bottom-3 right-4 text-[0.5rem] tracking-[0.15em] opacity-40"
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      color: "rgba(240,236,228,0.5)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
