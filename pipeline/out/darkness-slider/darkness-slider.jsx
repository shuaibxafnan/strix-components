"use client";

import { useEffect, useRef, useState } from "react";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=560&h=800&q=80`;

const DEFAULT_CREATURES = [
  {
    image: photo("1749330513873-09ffa91b0aae"),
    tag: "Night",
    title: "After hours",
    caption: "Streets that only belong to you.",
  },
  {
    image: photo("1627896157734-4d7d4388f28b"),
    tag: "Shadow",
    title: "Long exposure",
    caption: "Light that never quite arrives.",
  },
  {
    image: photo("1778789172736-e8ba37c71124"),
    tag: "Quiet",
    title: "Still room",
    caption: "Nothing moves except the dust.",
  },
  {
    image: photo("1778961938903-96617183f739"),
    tag: "Dusk",
    title: "Last light",
    caption: "Whatever remains of the day.",
  },
  {
    image: photo("1678112553355-a9dab855ebf3"),
    tag: "Fog",
    title: "Low cloud",
    caption: "The edges soften first.",
  },
  {
    image: photo("1743309411498-a0f4f4b96b65"),
    tag: "Ember",
    title: "Slow burn",
    caption: "Warm things in cold places.",
  },
];

export default function DarknessSlider({
  scrollSpeed = 0.5,
  showCursorLight = true,
  cursorLightSize = 300,
  maxGlowing = 3,
  glowInterval = 2000,
  imageBrightness = 0.55,
  imageSaturation = 0,
  glowColor = "rgba(255, 255, 255, 0.35)",
  fontFamily = "Hanken Grotesk",
  initialCreatures = DEFAULT_CREATURES,
  backgroundColor = "#050505",
  className = "",
}) {
  const cardsContainerRef = useRef(null);
  const cursorLightRef = useRef(null);

  const [cards, setCards] = useState([]);

  useEffect(() => {
    const tripleSet = [];
    for (let loop = 0; loop < 3; loop++) {
      initialCreatures.forEach((creature, idx) => {
        tripleSet.push({
          ...creature,
          id: `${loop}-${idx}-${creature.image}`,
        });
      });
    }
    setCards(tripleSet);
  }, [initialCreatures]);

  useEffect(() => {
    if (!showCursorLight || !cursorLightRef.current) return;

    const cursorElement = cursorLightRef.current;

    const handleMouseMove = (e) => {
      cursorElement.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showCursorLight]);

  useEffect(() => {
    if (cards.length === 0 || !cardsContainerRef.current) return;

    let scrollPosition = 0;
    let animationFrameId = null;
    const cardsContainer = cardsContainerRef.current;

    const computeLoopBoundaries = () => {
      const firstCard = cardsContainer.firstElementChild;
      if (!firstCard) return 0;

      const style = window.getComputedStyle(cardsContainer);
      const gap = parseInt(style.gap || "40px", 10);
      const cardWidth = firstCard.offsetWidth;

      return initialCreatures.length * (cardWidth + gap);
    };

    const runRenderLoop = () => {
      scrollPosition += scrollSpeed;
      const boundary = computeLoopBoundaries();

      if (boundary > 0 && scrollPosition >= boundary) {
        scrollPosition = 0;
      }

      cardsContainer.style.transform = `translate3d(-${scrollPosition}px, 0, 0)`;
      animationFrameId = requestAnimationFrame(runRenderLoop);
    };

    animationFrameId = requestAnimationFrame(runRenderLoop);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [cards, scrollSpeed, initialCreatures.length]);

  useEffect(() => {
    if (cards.length === 0 || !cardsContainerRef.current) return;

    const container = cardsContainerRef.current;

    const pickLit = () => {
      const all = Array.from(container.children);
      const vw = window.innerWidth;
      const onScreen = all.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > 0 && r.left < vw;
      });
      const fully = onScreen.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left >= 0 && r.right <= vw;
      });
      const pool = fully.length ? fully : onScreen;

      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const next = new Set(pool.slice(0, maxGlowing));
      all.forEach((el) => el.classList.toggle("lit", next.has(el)));
    };

    pickLit();
    const timer = setInterval(pickLit, glowInterval);
    return () => clearInterval(timer);
  }, [cards, maxGlowing, glowInterval]);

  return (
    <div
      className={`relative flex h-screen w-full cursor-none select-none items-center justify-center overflow-hidden bg-[var(--bg)] font-[family-name:var(--font)] [text-rendering:geometricPrecision] ${className}`}
      style={{
        "--bg": backgroundColor,
        "--font": `"${fontFamily}", sans-serif`,
        "--light": `${cursorLightSize}px`,
        "--dim": imageBrightness,
        "--sat": imageSaturation,
        "--glow-color": glowColor,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700&display=swap"
      />
      <style>{`
        @keyframes dsFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
      `}</style>

      {showCursorLight && (
        <div
          ref={cursorLightRef}
          className="pointer-events-none fixed left-0 top-0 z-10 h-[var(--light)] w-[var(--light)] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] mix-blend-screen will-change-transform [transform:translate3d(-100%,-100%,0)]"
        />
      )}

      <div
        ref={cardsContainerRef}
        className="relative flex gap-10 p-[50px] will-change-transform [transform-style:preserve-3d] md:gap-5 md:p-5"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="group relative h-[400px] w-[280px] shrink-0 animate-[dsFloat_3s_ease-in-out_infinite] overflow-hidden rounded-[15px] bg-neutral-950 opacity-[0.1] shadow-[0_0_25px_rgba(255,255,255,0)] will-change-transform [filter:brightness(0.1)] [transition:opacity_1.4s_ease,filter_1.4s_ease,box-shadow_1.4s_ease] hover:scale-105 md:h-[320px] md:w-[220px] [&.lit]:opacity-100 [&.lit]:shadow-[0_0_25px_var(--glow-color)] [&.lit]:[filter:brightness(1.3)]"
          >
            <img
              src={card.image}
              alt={card.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 ease-out will-change-transform [filter:brightness(var(--dim))_contrast(1.1)_saturate(var(--sat))] group-hover:scale-110"
            />

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.88),rgba(0,0,0,0.15)_55%,rgba(0,0,0,0.3))]" />

            <span className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white/80">
              {card.tag}
            </span>

            <div className="absolute inset-x-4 bottom-4 z-20">
              <h3 className="text-lg font-medium leading-tight text-white">
                {card.title}
              </h3>
              <p className="mt-1 text-[0.8rem] leading-snug text-white/60">
                {card.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}