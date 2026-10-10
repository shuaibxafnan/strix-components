"use client";

import { useEffect, useRef, useState } from "react";

// ─── CardStackCarousel ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// width             string   "22rem"     Width of the stack container
// height            string   "28rem"     Height of the stack container
// perspective       string   "1000px"    CSS 3D perspective depth for bold spatial depth
// zOffset           number   16          Z-axis translation step per card (px)
// yOffset           number   10          Y-axis translation step per card (px)
// maxZIndex         number   100         Base z-index for structural stacking
// swapDuration      number   400         Animation duration when switching cards (ms)
// threshold         number   60          Swipe distance threshold to trigger swap (px)
// bodyBg            string   "#0b0f19"   Page background color matching sleek editor themes
// cardsData         array    [...]       Array of modern product cards
// ──────────────────────────────────────────────────────────────────────────

const MODERN_CARDS = [
  {
    id: "vapor-01",
    tag: "Archived Collection",
    title: "Liquid Cyber",
    subtitle: "Edition 001 / Chronos",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    accent: "#a855f7",
  },
  {
    id: "vapor-02",
    tag: "Premium Drop",
    title: "Neo Obsidian",
    subtitle: "Edition 042 / Core",
    image:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
    accent: "#06b6d4",
  },
  {
    id: "vapor-03",
    tag: "Studio Lab",
    title: "Solar Flared",
    subtitle: "Edition 109 / Plasma",
    image:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=600&q=80",
    accent: "#f97316",
  },
  {
    id: "vapor-04",
    tag: "Curated Craft",
    title: "Prismatic Wave",
    subtitle: "Edition 088 / Flow",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
    accent: "#ec4899",
  },
];

export default function CardStackCarousel({
  width = "22rem",
  height = "28rem",
  perspective = "1000px",
  zOffset = 16,
  yOffset = 10,
  maxZIndex = 100,
  swapDuration = 400,
  threshold = 60,
  bodyBg = "#0b0f19",
  cardsData = MODERN_CARDS,
}) {
  const [cards, setCards] = useState([]);
  const [swipeState, setSwipeState] = useState({
    isSwiping: false,
    startX: 0,
    currentX: 0,
    deltaX: 0,
    isAnimating: false,
    flipRotation: false,
  });

  const stateRef = useRef(swipeState);
  stateRef.current = swipeState;

  useEffect(() => {
    setCards(cardsData.map((card, index) => ({ ...card, renderIndex: index })));
  }, [cardsData]);

  useEffect(() => {
    const handlePointerUp = () => {
      if (stateRef.current.isSwiping) {
        processSwipeEnd();
      }
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [cards]);

  const handlePointerDown = (e) => {
    if (swipeState.isAnimating) return;
    setSwipeState((prev) => ({
      ...prev,
      isSwiping: true,
      startX: e.clientX,
      currentX: e.clientX,
      deltaX: 0,
    }));
  };

  const handlePointerMove = (e) => {
    if (!swipeState.isSwiping) return;
    const currentX = e.clientX;
    const deltaX = currentX - swipeState.startX;

    setSwipeState((prev) => ({
      ...prev,
      currentX,
      deltaX,
    }));
  };

  const processSwipeEnd = () => {
    const { deltaX, isAnimating } = stateRef.current;
    if (isAnimating) return;

    if (Math.abs(deltaX) > threshold) {
      setSwipeState((prev) => ({
        ...prev,
        isAnimating: true,
        isSwiping: false,
      }));

      setTimeout(() => {
        setSwipeState((prev) => ({ ...prev, flipRotation: true }));
      }, swapDuration * 0.5);

      setTimeout(() => {
        setCards((prevCards) => {
          if (prevCards.length === 0) return prevCards;
          const [first, ...rest] = prevCards;
          return [...rest, first];
        });
        setSwipeState({
          isSwiping: false,
          startX: 0,
          currentX: 0,
          deltaX: 0,
          isAnimating: false,
          flipRotation: false,
        });
      }, swapDuration);
    } else {
      setSwipeState({
        isSwiping: false,
        startX: 0,
        currentX: 0,
        deltaX: 0,
        isAnimating: false,
        flipRotation: false,
      });
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden selection:bg-transparent tracking-tight font-sans"
      style={{ backgroundColor: bodyBg }}
    >
      <div
        className="relative grid grid-flow-col place-content-center select-none touch-none"
        style={{
          width,
          height,
          transformStyle: "preserve-3d",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {cards.map((card, i) => {
          const isTopCard = card.renderIndex === cards[0]?.renderIndex;

          let transformX = 0;
          let rotateY = 0;
          let opacity = 1;
          let zIndex = maxZIndex - i;

          if (isTopCard) {
            if (swipeState.isSwiping) {
              transformX = swipeState.deltaX;
              rotateY = swipeState.deltaX * 0.15; // Refined rotation sensitivity
              opacity =
                1 - Math.min(Math.abs(swipeState.deltaX) / 120, 1) * 0.4;
            } else if (swipeState.isAnimating) {
              const direction = Math.sign(swipeState.deltaX) || 1;

              if (!swipeState.flipRotation) {
                transformX = direction * 340;
                rotateY = direction * 25;
                opacity = 0.15;
              } else {
                transformX = 0;
                rotateY = -direction * 15;
                opacity = 1;
                zIndex = maxZIndex - cards.length;
              }
            }
          }

          const effectiveIndex =
            isTopCard && swipeState.flipRotation ? cards.length - 1 : i;

          const cardStyle = {
            width: "calc(100% - 1.5rem)",
            height: "calc(100% - 1.5rem)",
            zIndex: zIndex,
            transform: `perspective(${perspective}) translateZ(${-1 * zOffset * effectiveIndex}px) translateY(${yOffset * effectiveIndex}px) translateX(${transformX}px) rotateY(${rotateY}deg)`,
            transition:
              swipeState.isSwiping && isTopCard
                ? "none"
                : `transform ${swapDuration}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${swapDuration}ms ease`,
            opacity: isTopCard ? opacity : 1,
          };

          return (
            <article
              key={card.id}
              style={cardStyle}
              className={`absolute flex flex-col justify-between overflow-hidden rounded-2xl bg-[#131926]/90 p-5 border border-white/[0.06] shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-md will-change-transform group ${
                isTopCard
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-inherit"
              }`}
            >
              {/* Top Meta Details Row */}
              <div className="flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.03]">
                  {card.tag}
                </span>
                <div
                  className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ color: card.accent, backgroundColor: card.accent }}
                />
              </div>

              {/* Central Immersive Media Block */}
              <div className="my-4 relative flex-1 w-full overflow-hidden rounded-xl border border-white/[0.05] bg-black/20 pointer-events-none">
                {/* Subtle depth gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                <img
                  src={card.image}
                  alt={card.title}
                  draggable={false}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Editorial Typography Footer */}
              <div className="flex flex-col gap-1 pointer-events-none">
                <h3 className="text-xl font-medium text-white/90 font-sans tracking-tight">
                  {card.title}
                </h3>
                <p className="text-xs font-mono text-white/40">
                  {card.subtitle}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
