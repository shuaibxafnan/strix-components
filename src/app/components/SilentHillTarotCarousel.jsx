"use client";

import { useEffect, useState } from "react";

// ─── SilentHillTarotCarousel ─────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// radius             number   420                3D depth space calculation index
// title              string   "The Door Awaiting" Custom header typography layout line
// glowColor          string   "rgba(185,28,28,0.15)" Ambient backing radial aura channel
// ──────────────────────────────────────────────────────────────────────────

const MODERN_TAROT_CARDS = [
  {
    id: "card-0",
    symbol: "∅",
    title: "EYE OF NIGHT",
    num: "XXII",
    content: "Found this in the chapel. Is this a real tarot card, though?",
    backText:
      "A mysterious card found in the chapel. Its design suggests an ancient origin lost to time.",
    img: "https://assets.codepen.io/13223981/eyeofthenight.png",
  },
  {
    id: "card-1",
    symbol: "II",
    title: "HIGH PRIESTESS",
    num: "II",
    content: "Didn't this card mean something like 'Genuine Belief'?",
    backText:
      "Symbol of spiritual insight. Heather believed this card represented genuine belief in the unknown.",
    img: "https://assets.codepen.io/13223981/highpriestess+1.png",
  },
  {
    id: "card-2",
    symbol: "0",
    title: "FOOL",
    num: "0",
    content: "Found in the Aglaophotis book in Alessa's room",
    backText:
      "An odd card found in Alessa’s room. Connected to innocence and the start of a journey, perhaps hers.",
    img: "https://assets.codepen.io/13223981/fool.png",
  },
  {
    id: "card-3",
    symbol: "XII",
    title: "HANGED MAN",
    num: "XII",
    content: "Found on a gurney in the Morgue",
    backText:
      "Found in the morgue. Some say it represents sacrifice or surrender—fitting for Silent Hill’s twisted lore.",
    img: "https://assets.codepen.io/13223981/hangedman.png",
  },
  {
    id: "card-4",
    symbol: "XVIII",
    title: "MOON",
    num: "XVIII",
    content: "Found in the library of the Order's chapel",
    backText:
      "Pulled from the Order’s library. This card hints at illusion, fear, and secrets hiding in the shadows.",
    img: "https://assets.codepen.io/13223981/moon.png",
  },
];

export default function SilentHillTarotCarousel({
  radius = 420,
  title = "THE DOOR AWAITING THE TAROT CARDS",
  glowColor = "rgba(185, 28, 28, 0.15)",
}) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full min-h-screen bg-[#070302]" />;
  }

  const totalCards = MODERN_TAROT_CARDS.length;
  const theta = (2 * Math.PI) / totalCards;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const handleCardSelect = (index) => {
    if (currentIndex !== index) {
      setCurrentIndex(index);
    } else {
      setFlippedCards((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070302] text-zinc-400 font-serif flex flex-col justify-between items-center overflow-hidden relative select-none p-6 md:p-12">
      {/* Structural Grain Overlay and Subtle Background Radial Gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')] z-50" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[120px] pointer-events-none transition-colors duration-1000 mix-blend-screen z-0"
        style={{ backgroundColor: glowColor }}
      />

      {/* Modern Minimalist Header Presentation Section */}
      <header className="w-full max-w-5xl flex flex-col items-center text-center mt-4 z-10">
        <span className="font-sans text-[10px] tracking-[0.4em] text-red-500/70 font-semibold mb-3 uppercase">
          Silent Hill III / Artifacts
        </span>
        <h1 className="text-xl md:text-2xl font-light tracking-[0.25em] text-zinc-100 max-w-2xl uppercase leading-relaxed font-sans">
          {title}
        </h1>
        <div className="w-12 h-[1px] bg-zinc-800 mt-6" />
      </header>

      {/* Main 3D Container Node Field Viewport — Explicitly centered layout base */}
      <main className="w-full max-w-4xl h-[460px] flex justify-center items-center relative [perspective:1200px] z-10 my-auto">
        <div
          className="w-full h-full flex justify-center items-center relative [transform-style:preserve-3d]"
          style={{
            transform: `translateZ(-${radius}px) rotateY(${-currentIndex * theta}rad)`,
            transition: "transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {MODERN_TAROT_CARDS.map((card, index) => {
            const angle = theta * index;
            const isFlipped = !!flippedCards[index];
            const isActive = currentIndex === index;

            return (
              <div
                key={card.id}
                onClick={() => handleCardSelect(index)}
                onMouseEnter={() => isActive && setIsHovered(true)}
                onMouseLeave={() => isActive && setIsHovered(false)}
                className="w-[220px] h-[340px] absolute [transform-style:preserve-3d] cursor-pointer group will-change-transform"
                style={{
                  transform: `rotateY(${angle}rad) translateZ(${radius}px)`,
                }}
              >
                {/* Internal card wrapper determining interactive hover states and flipping logic */}
                <div
                  className="w-full h-full relative [transform-style:preserve-3d] will-change-transform"
                  style={{
                    transform: `${isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"} ${isActive && isHovered && !isFlipped ? "translateY(-12px)" : "translateY(0px)"}`,
                    transition: "transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                >
                  {/* Card Front View Plate */}
                  <div
                    className={`absolute inset-0 [backface-visibility:hidden] flex flex-col justify-between p-4 bg-[#0d0908] border border-zinc-800/80 rounded-sm transition-all duration-500 ease-out shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] ${
                      isActive
                        ? "border-red-950/60 ring-1 ring-red-900/10"
                        : "opacity-40 grayscale-[40%] scale-[0.96]"
                    }`}
                    style={{ transform: "rotateY(0deg)" }} // Explicitly anchors front side
                  >
                    {/* Index identity tracker layout row */}
                    <div className="flex justify-between items-center font-sans text-[10px] tracking-widest text-zinc-600">
                      <span>{card.num}</span>
                      <span className="text-red-500/40 text-xs font-serif">
                        {card.symbol}
                      </span>
                    </div>

                    {/* Image framing window element layout node */}
                    <div className="relative flex-1 my-3 bg-zinc-950 overflow-hidden rounded-[1px] border border-zinc-900 shadow-inner group/img">
                      <div
                        className="absolute inset-0 bg-center bg-no-repeat bg-cover transition-transform duration-1000 ease-out opacity-85 scale-100 group-hover:scale-105"
                        style={{ backgroundImage: `url(${card.img})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0908] via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Metadata text label system cluster */}
                    <div className="text-center">
                      <h2 className="text-sm tracking-[0.18em] text-zinc-200 font-sans font-medium uppercase">
                        {card.title}
                      </h2>
                      <p className="text-[11px] leading-relaxed text-zinc-500 italic mt-2 line-clamp-2 px-1 font-serif">
                        {card.content}
                      </p>
                    </div>
                  </div>

                  {/* Card Back View Plate */}
                  <div
                    className="absolute inset-0 [backface-visibility:hidden] flex flex-col justify-between p-6 bg-[#0a0706] border border-red-950/40 rounded-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]"
                    style={{ transform: "rotateY(180deg)" }} // Correctly flips container space backplate
                  >
                    <div className="w-full flex justify-center text-[10px] tracking-[0.3em] text-red-500/40 font-sans">
                      REVERSE
                    </div>

                    <div className="my-auto text-center">
                      <h3 className="text-xs tracking-[0.2em] text-zinc-300 font-sans uppercase mb-4">
                        {card.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-zinc-400 font-serif px-1">
                        {card.backText}
                      </p>
                    </div>

                    <div className="w-2 h-2 rounded-full bg-red-950/40 mx-auto" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Interface Deck controls and context positioning markers */}
      <footer className="w-full max-w-md flex flex-col items-center gap-6 z-10 mb-4">
        {/* Modern Progressive Horizontal Index Tracker Dots */}
        <div className="flex items-center gap-3">
          {MODERN_TAROT_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                currentIndex === i
                  ? "w-6 bg-red-500/70"
                  : "w-1.5 bg-zinc-800 hover:bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Minimal Text Action Button Navigation Line Pair */}
        <div className="flex items-center gap-12 font-sans text-xs tracking-[0.2em] text-zinc-500">
          <button
            onClick={handlePrev}
            className="hover:text-zinc-200 transition-colors duration-300 uppercase py-2"
          >
            Prev
          </button>
          <span className="text-zinc-700 font-light select-none">/</span>
          <button
            onClick={handleNext}
            className="hover:text-zinc-200 transition-colors duration-300 uppercase py-2"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
