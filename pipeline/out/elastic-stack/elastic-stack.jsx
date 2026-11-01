"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
    label: "Inherited Light",
    meta: "Plate I",
  },
  {
    image:
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
    label: "Red Earth",
    meta: "Plate II",
  },
  {
    image:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
    label: "Soft Sovereignty",
    meta: "Plate III",
  },
  {
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
    label: "Worn Horizon",
    meta: "Plate IV",
  },
  {
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    label: "Language of Dust",
    meta: "Plate V",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    label: "Native Modern",
    meta: "Plate VI",
  },
];

const DEFAULT_FOLLOW = [0.6, 0.3];

export default function ElasticStack({
  items = DEFAULT_ITEMS,
  bgColor = "#dfe4e2",
  cardColor = "#faf8f4",
  textColor = "#1c2b30",
  mutedColor = "#8b9296",
  accentColor = "#b5533a",
  headingFont = 'Georgia, "Times New Roman", serif',
  bodyFont = 'Inter, "Helvetica Neue", Arial, sans-serif',
  title = "Elastic Stack",
  subtitle = "A deck of plates, held loosely",
  showCounter = true,
  showHint = true,
  hintText = "drag a card aside",
  cardWidth = 340,
  cardHeight = 400,
  matTop = 18,
  matSide = 18,
  matBottom = 84,
  visibleCards = 3,
  depthStep = 60,
  perspective = 1000,
  perspectiveOriginY = "150%",
  followFactors = DEFAULT_FOLLOW,
  dragBackDistance = 200,
  dragMaxDistance = 450,
  throwDuration = 0.3,
  settleDuration = 0.4,
  settleEase = "cubic-bezier(0.175, 0.885, 0.470, 1.515)",
  tiltFactor = 0.04,
  randomOrder = false,
  enableKeyboard = true,
  className = "",
}) {
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [current, setCurrent] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState("idle");
  const pointer = useRef({ id: null, startX: 0, startY: 0 });
  const rootRef = useRef(null);

  useEffect(() => {
    if (!randomOrder) return;
    const next = items.map((_, i) => i);
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
  }, [items, randomOrder]);

  const count = order.length;

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % count);
    setDrag({ x: 0, y: 0 });
    setPhase("idle");
  }, [count]);

  const throwAway = useCallback(
    (x, y) => {
      const h = Math.sqrt(x * x + y * y) || 1;
      const target = h + dragBackDistance * 1.6;
      setDrag({ x: (x / h) * target, y: (y / h) * target });
      setPhase("throwing");
    },
    [dragBackDistance],
  );

  const settle = useCallback(() => {
    setDrag({ x: 0, y: 0 });
    setPhase("settling");
  }, []);

  const onPointerDown = (e) => {
    if (phase === "throwing" || count <= 1) return;
    pointer.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setPhase("dragging");
  };

  const onPointerMove = (e) => {
    if (phase !== "dragging" || pointer.current.id !== e.pointerId) return;
    const x = e.clientX - pointer.current.startX;
    const y = e.clientY - pointer.current.startY;
    if (Math.abs(x) > dragMaxDistance || Math.abs(y) > dragMaxDistance) {
      throwAway(x, y);
      return;
    }
    setDrag({ x, y });
  };

  const onPointerUp = (e) => {
    if (phase !== "dragging" || pointer.current.id !== e.pointerId) return;
    const { x, y } = drag;
    if (Math.abs(x) > dragBackDistance || Math.abs(y) > dragBackDistance) {
      throwAway(x, y);
    } else {
      settle();
    }
  };

  const onTransitionEnd = (e) => {
    if (e.propertyName !== "transform") return;
    if (phase === "throwing") advance();
    else if (phase === "settling") setPhase("idle");
  };

  useEffect(() => {
    if (!enableKeyboard) return;
    const onKey = (e) => {
      if (phase !== "idle" || count <= 1) return;
      if (e.key === "ArrowRight" || e.key === "Enter") {
        throwAway(dragBackDistance + 40, -60);
      } else if (e.key === "ArrowLeft") {
        throwAway(-dragBackDistance - 40, -60);
      }
    };
    const el = rootRef.current;
    if (!el) return;
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [enableKeyboard, phase, count, dragBackDistance, throwAway]);

  const stackPosition = (i) => (i - current + count) % count;

  const cardStyle = (pos) => {
    const isFront = pos === 0;
    const hidden = pos >= visibleCards;
    const depth = -depthStep * Math.min(pos, visibleCards);
    const follow = isFront ? 1 : (followFactors[pos - 1] ?? 0);
    const active =
      phase === "dragging" || phase === "settling" || phase === "throwing";
    const x = active ? drag.x * follow : 0;
    const y = active ? drag.y * follow : 0;
    const tilt = isFront ? x * tiltFactor : 0;

    let transition = "none";
    if (phase === "throwing") {
      transition = `transform ${throwDuration}s ease-out, opacity ${throwDuration}s ease-out`;
    } else if (phase === "settling") {
      transition = `transform ${settleDuration}s ${settleEase}, opacity ${settleDuration}s ease-out`;
    } else if (phase === "idle") {
      transition = `transform ${settleDuration}s ${settleEase}, opacity ${settleDuration}s ease-out`;
    }

    let opacity = hidden ? 0 : 1;
    if (isFront && phase === "throwing") opacity = 0;

    return {
      width: "100%",
      height: cardHeight,
      backgroundColor: cardColor,
      paddingTop: matTop,
      paddingLeft: matSide,
      paddingRight: matSide,
      paddingBottom: matBottom,
      zIndex: hidden ? 0 : visibleCards + 2 - pos,
      opacity,
      transform: `translate3d(${x}px, ${y}px, ${
        hidden ? -depthStep * (visibleCards + 1) : depth
      }px) rotate(${tilt}deg)`,
      transition,
      cursor: isFront
        ? phase === "dragging"
          ? "grabbing"
          : "grab"
        : "default",
      pointerEvents: isFront ? "auto" : "none",
      boxShadow:
        "0 1px 1px rgba(28,43,48,0.06), 0 18px 30px -18px rgba(28,43,48,0.35)",
    };
  };

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={`flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-16 outline-none ${className}`}
      style={{ backgroundColor: bgColor, fontFamily: bodyFont }}
    >
      <header className="mb-14 w-full max-w-2xl text-center">
        <div
          className="mb-3 flex items-center justify-center gap-3 text-[0.68rem] uppercase tracking-[0.28em]"
          style={{ color: mutedColor }}
        >
          {subtitle}
        </div>
        <h1
          className="m-0 text-4xl font-normal leading-tight md:text-5xl"
          style={{ color: textColor, fontFamily: headingFont }}
        >
          {title}
        </h1>
      </header>

      <div
        className="relative select-none"
        style={{
          width: `min(${cardWidth}px, 100%)`,
          height: cardHeight,
          perspective: `${perspective}px`,
          perspectiveOrigin: `50% ${perspectiveOriginY}`,
        }}
      >
        {order.map((itemIndex, i) => {
          const item = items[itemIndex];
          if (!item) return null;
          const pos = stackPosition(i);
          return (
            <div
              key={i}
              className="absolute top-0 left-0 will-change-transform"
              style={cardStyle(pos)}
              onPointerDown={pos === 0 ? onPointerDown : undefined}
              onPointerMove={pos === 0 ? onPointerMove : undefined}
              onPointerUp={pos === 0 ? onPointerUp : undefined}
              onPointerCancel={pos === 0 ? onPointerUp : undefined}
              onTransitionEnd={pos === 0 ? onTransitionEnd : undefined}
            >
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.label}
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className="flex items-baseline justify-between"
                style={{
                  height: matBottom,
                  paddingTop: matBottom * 0.28,
                }}
              >
                <span
                  className="text-[1.35rem] leading-none"
                  style={{ color: textColor, fontFamily: headingFont }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[0.62rem] uppercase tracking-[0.22em]"
                  style={{ color: mutedColor }}
                >
                  {item.meta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex items-center gap-5">
        {showCounter ? (
          <div className="flex items-baseline gap-2">
            <span
              className="text-base tabular-nums"
              style={{ color: accentColor, fontFamily: headingFont }}
            >
              {String(current + 1).padStart(2, "0")}
            </span>
            <span
              className="h-px w-5"
              style={{ backgroundColor: mutedColor }}
            />
            <span
              className="text-[0.7rem] tabular-nums"
              style={{ color: mutedColor }}
            >
              {String(count).padStart(2, "0")}
            </span>
          </div>
        ) : null}
        {showHint ? (
          <span
            className="text-[0.62rem] uppercase tracking-[0.26em]"
            style={{ color: mutedColor }}
          >
            {hintText}
          </span>
        ) : null}
      </div>
    </div>
  );
}
