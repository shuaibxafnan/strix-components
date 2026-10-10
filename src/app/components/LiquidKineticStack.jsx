"use client";

import { useEffect, useRef, useState } from "react";

// ─── LiquidKineticStack ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// maxCards          number   4           Visible card layer count in deck depth
// dragThreshold     number   120         Distance required to flip a card out (px)
// baseBg            string   "#090a0f"   Ultra-dark void aesthetic background
// collection        array    [...]       Curated modern imagery & typography arrays
// ──────────────────────────────────────────────────────────────────────────

const SAMPLE_COLLECTION = [
  {
    id: "art-01",
    title: "Silent Monolith",
    tag: "A01 // ARCH",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "art-02",
    title: "Fluid Void",
    tag: "E04 // LINE",
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "art-03",
    title: "Brutalist Shadow",
    tag: "M09 // TECT",
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "art-04",
    title: "Asymmetric Light",
    tag: "X12 // CORE",
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function LiquidKineticStack({
  maxCards = 4,
  dragThreshold = 120,
  baseBg = "#090a0f",
  collection = SAMPLE_COLLECTION,
}) {
  const [deck, setDeck] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false); // Guard against multi-swipes during ejection

  const dragRef = useRef({
    startY: 0,
    currentY: 0,
    isPressing: false,
  });

  const cardContainerRef = useRef(null);

  useEffect(() => {
    setDeck(collection);
    setActiveItem(collection[0]);
    setIsReady(true);
  }, [collection]);

  if (!isReady || deck.length === 0) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: baseBg }} />
    );
  }

  const calculateCardStyle = (index) => {
    if (index >= maxCards) return { opacity: 0, pointerEvents: "none" };

    const scaleFactor = 1 - index * 0.05;
    const translateYFactor = index * -24;
    const zIndexFactor = 100 - index;
    const opacityFactor = index === 0 ? 1 : 0.6 / index;

    return {
      transform: `translateY(${translateYFactor}px) scale(${scaleFactor})`,
      zIndex: zIndexFactor,
      opacity: opacityFactor,
    };
  };

  const handlePointerDown = (e) => {
    if (isAnimating) return; // Block interaction if card cycle is completing

    dragRef.current.isPressing = true;
    dragRef.current.startY = e.clientY;
    dragRef.current.currentY = e.clientY;

    if (cardContainerRef.current) {
      const topCard = cardContainerRef.current.children[0];
      if (topCard) topCard.style.transition = "none";
    }
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isPressing || isAnimating) return;
    dragRef.current.currentY = e.clientY;
    const deltaY = dragRef.current.currentY - dragRef.current.startY;

    if (cardContainerRef.current && deltaY < 0) {
      const topCard = cardContainerRef.current.children[0];
      if (topCard) {
        topCard.style.transform = `translateY(${deltaY}px) rotate(${deltaY * 0.03}deg)`;
      }
    }
  };

  const handlePointerUp = () => {
    if (!dragRef.current.isPressing) return;
    dragRef.current.isPressing = false;

    const deltaY = dragRef.current.currentY - dragRef.current.startY;
    const topCard = cardContainerRef.current?.children[0];

    if (!topCard) return;

    // Smooth snappy transition return parameters
    topCard.style.transition =
      "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s";

    if (deltaY < -dragThreshold) {
      setIsAnimating(true);

      // Eject upwards seamlessly
      topCard.style.transform = "translateY(-150%) rotate(-15deg)";
      topCard.style.opacity = "0";

      // Match state updates precisely to the 100ms transition duration
      setTimeout(() => {
        setDeck((prevDeck) => {
          const updated = [...prevDeck.slice(1), prevDeck[0]];
          setActiveItem(updated[0]);
          return updated;
        });
        setIsAnimating(false);
      }, 100);
    } else {
      topCard.style.transform = "translateY(0px) rotate(0deg)";
    }
  };

  return (
    <div
      className="w-full h-screen overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-24 select-none touch-none font-sans"
      style={{ backgroundColor: baseBg }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Left Panel */}
      <div className="w-full md:w-1/3 flex flex-col justify-between h-1/4 md:h-1/2 text-white z-10 pointer-events-none">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs tracking-[0.3em] text-white/30 uppercase">
            {activeItem?.tag}
          </span>
          <h1 className="text-4xl md:text-6xl font-extralight tracking-tight text-white/95 transition-all duration-500">
            {activeItem?.title}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-white/20 pt-4 border-t border-white/[0.05]">
          <span>GUEST PREVIEW</span>
          <span>•</span>
          <span>SWIPE CARD UP TO CYCLE</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center relative h-2/3 md:h-full">
        <div
          ref={cardContainerRef}
          className="relative w-[280px] h-[380px] sm:w-[320px] sm:h-[440px]"
          onPointerDown={handlePointerDown}
        >
          {deck.map((card, index) => {
            const calculatedStyle = calculateCardStyle(index);

            return (
              <div
                key={card.id}
                className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/[0.06] shadow-[0_40px_90px_rgba(0,0,0,0.7)] backdrop-blur-sm"
                style={{
                  ...calculatedStyle,
                  pointerEvents: index === 0 && !isAnimating ? "auto" : "none", // Prevent capturing swipes on background cards
                  transition:
                    dragRef.current.isPressing && index === 0
                      ? "none"
                      : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s, z-index 0.5s",
                }}
              >
                <img
                  src={card.src}
                  alt={card.title}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none brightness-[0.85] contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
