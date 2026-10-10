"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Script from "next/script";

// ─── RecipeSwipeCards ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// recipe              object    DEFAULT_RECIPE    Full recipe data object
//   .title            string                      Recipe title
//   .coverImage       string                      Cover image URL
//   .coverImageAlt    string                      Cover image alt text
//   .servings         number    4                 Number of servings
//   .cookTime         string    "25 min"          Cook time label
//   .about            object                      { intro, image, imageAlt, outro }
//   .ingredients      string[]                    Ingredient strings
//   .variation        string                      Tip / variation note
//   .process          { text }[]                  Step objects
//   .pesto            { text }[]                  Pesto info panel steps
//
// bgColor             string    "#0c0b0a"         Page background
// accentColor         string    "#f0e6d0"         Primary text/icon color
// highlightColor      string    "#c8975a"         Warm amber accent
// swipeThreshold      number    72                px drag before card flies off
// velocityThreshold   number    0.45              velocity before card flies off
// idlePromptDelay     number    10000             ms before swipe hint appears
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_RECIPE = {
  title: "Pasta with Pesto & Tomatoes",
  coverImage:
    "https://assets.codepen.io/652/shania-pinnata-7E-vKgzahd8-unsplash.jpg",
  coverImageAlt: "Spaghetti with pesto sauce and cherry tomatoes",
  servings: 4,
  cookTime: "25 min",
  about: {
    intro:
      "A summer pasta that comes together in under 30 minutes — fresh basil, blistered tomatoes, and good olive oil doing all the heavy lifting.",
    image:
      "https://assets.codepen.io/652/tamanna-rumee-nswz6tIpgZk-unsplash.jpg",
    imageAlt: "Tomato halves surrounded by basil leaves and peppercorns",
    outro:
      "No garden? No problem. A good jar of pesto works beautifully here — the blistered tomatoes bring freshness either way.",
  },
  ingredients: [
    "8 oz spaghetti or linguine",
    "2 cups fresh basil leaves",
    "2 cloves garlic",
    "2 tbsp pine nuts or almonds",
    "½ cup extra-virgin olive oil",
    "½ cup grated Parmigiano-Reggiano",
    "⅛ tsp fine sea salt",
    "1 pint cherry tomatoes",
    "1 tsp olive oil, for tomatoes",
  ],
  variation:
    "Shortcut: swap homemade pesto for a 6 oz jar of prepared — still exceptional.",
  process: [
    {
      text: "Bring 4 quarts of heavily salted water to a rolling boil. Add pasta and cook until al dente.",
    },
    { text: "While pasta cooks, make the pesto (see How to below)." },
    { text: "Heat a skillet over medium-high. Add 1 tsp olive oil." },
    {
      text: "Add cherry tomatoes. Let them blister undisturbed for 2 min, then gently toss.",
    },
    { text: "Remove tomatoes from heat. Season with salt and set aside." },
    { text: "Reserve ¼ cup of pasta cooking water before draining." },
    {
      text: "Return drained pasta to the pot. Add pesto and cooking water. Toss well.",
    },
    { text: "Divide into bowls. Crown each with 6–8 blistered tomatoes." },
    { text: "Finish with torn basil, extra Parmigiano, and a drizzle of oil." },
  ],
  pesto: [
    { text: "Strip stems from basil — only the leaves go in." },
    {
      text: "Pulse basil, garlic, and pine nuts in a food processor until roughly chopped.",
    },
    {
      text: "With the motor running, stream in olive oil slowly until emulsified.",
    },
    { text: "Scrape down the sides; process until smooth but still textured." },
    {
      text: "Add salt and Parmigiano, pulse 3–4 times to incorporate. Taste and adjust.",
    },
  ],
};

// ─── Card type definitions ────────────────────────────────────────────────
const CARD_TYPES = ["cover", "about", "ingredients", "process"];

// ─── Sub-card renderers ───────────────────────────────────────────────────

function CoverCard({ recipe, accent, highlight }) {
  return (
    <div className="flex flex-col h-full select-none">
      {/* Hero image — 58% */}
      <div className="relative overflow-hidden" style={{ height: "58%" }}>
        <img
          src={recipe.coverImage}
          alt={recipe.coverImageAlt}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        {/* dual gradient: darken top for badge, darken bottom for text */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        {/* top-left badge */}
        <div className="absolute top-5 left-5 flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: highlight }}
          />
          <span
            className="text-[9px] font-semibold tracking-[0.28em] uppercase"
            style={{ color: accent, opacity: 0.9 }}
          >
            Recipe
          </span>
        </div>
        {/* cook time chip bottom-right */}
        <div
          className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium"
          style={{
            background: "rgba(0,0,0,0.55)",
            color: accent,
            border: `1px solid rgba(255,255,255,0.1)`,
            backdropFilter: "blur(8px)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <circle
              cx="6"
              cy="6"
              r="5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M6 3.5V6L7.5 7.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          {recipe.cookTime}
        </div>
      </div>

      {/* Info section */}
      <div className="flex flex-col flex-1 px-6 pt-5 pb-6 justify-between">
        <div>
          <h2
            className="leading-[1.1] mb-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(22px,5vw,28px)",
              color: accent,
              fontWeight: 400,
            }}
          >
            {recipe.title}
          </h2>
          {/* thin rule */}
          <div className="w-8 h-px mb-4" style={{ background: highlight }} />
        </div>

        {/* servings row */}
        <div className="flex items-center gap-5">
          <div>
            <p
              className="text-[9px] tracking-[0.22em] uppercase mb-1.5"
              style={{ color: accent, opacity: 0.4 }}
            >
              Serves
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: recipe.servings }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: i < 2 ? highlight : `${highlight}50` }}
                />
              ))}
            </div>
          </div>
          <div
            className="w-px self-stretch"
            style={{ background: `${accent}15` }}
          />
          <div>
            <p
              className="text-[9px] tracking-[0.22em] uppercase mb-1"
              style={{ color: accent, opacity: 0.4 }}
            >
              Time
            </p>
            <p className="text-lg font-light" style={{ color: accent }}>
              {recipe.cookTime}
            </p>
          </div>
          <div
            className="ml-auto text-[10px] tracking-[0.2em] uppercase opacity-25"
            style={{ color: accent }}
          >
            swipe →
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutCard({ recipe, accent, highlight }) {
  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Header band */}
      <div className="px-6 pt-6 pb-5 flex-shrink-0">
        <p
          className="text-[9px] tracking-[0.3em] uppercase mb-3 font-medium"
          style={{ color: highlight }}
        >
          About
        </p>
        <h2
          className="leading-none mb-4"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px,7vw,36px)",
            color: accent,
            fontWeight: 400,
          }}
        >
          The Story
        </h2>
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: accent, opacity: 0.65 }}
        >
          {recipe.about.intro}
        </p>
      </div>

      {/* full-bleed image */}
      <div className="relative mx-0 flex-shrink-0" style={{ height: 160 }}>
        <img
          src={recipe.about.image}
          alt={recipe.about.imageAlt}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </div>

      <div className="px-6 py-5">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: accent, opacity: 0.65 }}
        >
          {recipe.about.outro}
        </p>
      </div>
    </div>
  );
}

function IngredientsCard({ recipe, accent, highlight }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <p
          className="text-[9px] tracking-[0.3em] uppercase mb-3 font-medium"
          style={{ color: highlight }}
        >
          What you need
        </p>
        <h2
          className="leading-none"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px,7vw,36px)",
            color: accent,
            fontWeight: 400,
          }}
        >
          Ingredients
        </h2>
      </div>

      {/* thin rule */}
      <div className="mx-6 mb-1 h-px" style={{ background: `${accent}12` }} />

      <ul
        className="flex-1 overflow-y-auto px-6 py-3 flex flex-col gap-0"
        style={{ scrollbarWidth: "none" }}
      >
        {recipe.ingredients.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-4 py-3 text-[13px]"
            style={{
              color: accent,
              borderBottom: `1px solid ${accent}08`,
            }}
          >
            <span
              className="text-[10px] font-bold w-5 text-right flex-shrink-0 tabular-nums"
              style={{ color: highlight, opacity: 0.8 }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ opacity: 0.75 }}>{item}</span>
          </li>
        ))}
      </ul>

      {recipe.variation && (
        <div
          className="mx-6 mb-5 mt-3 px-4 py-3 rounded-lg text-[11px] leading-relaxed"
          style={{
            color: accent,
            opacity: 0.5,
            background: `${accent}06`,
            borderLeft: `2px solid ${highlight}`,
            fontStyle: "italic",
          }}
        >
          {recipe.variation}
        </div>
      )}
    </div>
  );
}

function ProcessCard({ recipe, accent, highlight, onInfoClick }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <p
          className="text-[9px] tracking-[0.3em] uppercase mb-3 font-medium"
          style={{ color: highlight }}
        >
          Step by step
        </p>
        <h2
          className="leading-none"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px,7vw,36px)",
            color: accent,
            fontWeight: 400,
          }}
        >
          Process
        </h2>
      </div>

      <div className="mx-6 mb-1 h-px" style={{ background: `${accent}12` }} />

      <ol
        className="flex-1 overflow-y-auto px-6 py-3 flex flex-col gap-0"
        style={{ scrollbarWidth: "none" }}
      >
        {recipe.process.map((step, i) => (
          <li
            key={i}
            className="flex items-start gap-4 py-3"
            style={{ borderBottom: `1px solid ${accent}08` }}
          >
            <span
              className="text-[10px] font-bold w-5 text-right flex-shrink-0 mt-0.5 tabular-nums"
              style={{ color: highlight, opacity: 0.8 }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="text-[13px] leading-relaxed flex-1"
              style={{ color: accent, opacity: 0.72 }}
            >
              {step.text}
              {i === 1 && (
                <button
                  onClick={onInfoClick}
                  className="ml-2 text-[9px] tracking-[0.2em] uppercase font-semibold px-2.5 py-1 rounded-full align-middle"
                  style={{
                    background: `${highlight}20`,
                    color: highlight,
                    border: `1px solid ${highlight}40`,
                  }}
                >
                  How?
                </button>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Page indicator ───────────────────────────────────────────────────────
function PageDots({ total, active, accent, highlight }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === active ? 18 : 5,
            height: 5,
            background: i === active ? highlight : `${accent}25`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export default function RecipeSwipeCards({
  recipe = DEFAULT_RECIPE,
  bgColor = "#0c0b0a",
  accentColor = "#f0e6d0",
  highlightColor = "#c8975a",
  swipeThreshold = 72,
  velocityThreshold = 0.45,
  idlePromptDelay = 10000,
}) {
  // topIndex: which card type is on top (0–3, wraps). Swiping advances it.
  const [topIndex, setTopIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const containerRef = useRef(null);
  const cardRefs = useRef([]); // refs to the 4 physical DOM cards
  const idleTimerRef = useRef(null);
  const hammerInstances = useRef([]); // keep Hammer refs to destroy/recreate
  const topIndexRef = useRef(topIndex); // stable ref for use inside callbacks

  useEffect(() => {
    topIndexRef.current = topIndex;
  }, [topIndex]);

  // ── layout: 4 cards always in DOM, z-index + transform driven by topIndex ──
  // visually: card[topIndex] on top, [topIndex+1] second, etc.
  const getCardStyle = useCallback((cardIndex) => {
    const top = topIndexRef.current;
    // position in stack: 0 = front
    const pos = (cardIndex - top + 4) % 4;
    const scale = (20 - pos) / 20;
    const ty = -50 * pos;
    return {
      zIndex: 20 - pos,
      transform: `scale(${scale}) translateY(${ty}px)`,
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    };
  }, []);

  const applyStackStyles = useCallback(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const s = getCardStyle(i);
      el.style.zIndex = s.zIndex;
      el.style.transform = s.transform;
      el.style.transition = s.transition;
    });
  }, [getCardStyle]);

  // advance top card — wraps circularly
  const advanceTop = useCallback(() => {
    setTopIndex((prev) => {
      const next = (prev + 1) % 4;
      topIndexRef.current = next;
      // re-apply stack layout after state settles
      requestAnimationFrame(() => applyStackStyles());
      return next;
    });
  }, [applyStackStyles]);

  // ── Hammer setup (only once after Hammer.js script loads) ────────────────
  const resetIdleTimer = useCallback(() => {
    setShowPrompt(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(
      () => setShowPrompt(true),
      idlePromptDelay,
    );
  }, [idlePromptDelay]);

  const attachHammers = useCallback(() => {
    if (!window.Hammer) return;

    // destroy old instances
    hammerInstances.current.forEach((h) => h.destroy());
    hammerInstances.current = [];

    cardRefs.current.forEach((el, cardIndex) => {
      if (!el) return;
      const hm = new window.Hammer(el);

      hm.on("pan", (e) => {
        // only move the top card
        if (cardIndex !== topIndexRef.current) return;
        el.classList.add("dragging");
        el.style.transition = "none";
        const xM = e.deltaX * 0.03;
        const yM = e.deltaY / 80;
        el.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px) rotate(${xM * yM}deg)`;

        // tint the bg
        if (containerRef.current) {
          containerRef.current.dataset.swipeDir =
            e.deltaX > 0 ? "right" : "left";
        }
        resetIdleTimer();
      });

      hm.on("panend", (e) => {
        if (cardIndex !== topIndexRef.current) return;
        el.classList.remove("dragging");
        if (containerRef.current) delete containerRef.current.dataset.swipeDir;

        const keep =
          Math.abs(e.deltaX) < swipeThreshold &&
          Math.abs(e.velocityX) < velocityThreshold;

        if (keep) {
          // snap back
          el.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)";
          el.style.transform = getCardStyle(cardIndex).transform;
        } else {
          // fly out
          const mow = document.body.clientWidth;
          const endX = Math.max(Math.abs(e.velocityX) * mow, mow);
          const toX = e.deltaX > 0 ? endX : -endX;
          const toY = Math.abs(e.velocityY) * mow * (e.deltaY > 0 ? 1 : -1);
          const rot = e.deltaX * 0.03 * (e.deltaY / 80);
          el.style.transition = "transform 0.35s ease-out";
          el.style.transform = `translate(${toX}px, ${toY + e.deltaY}px) rotate(${rot}deg)`;

          // after fly-out, advance index and reset this card's position to back
          setTimeout(() => {
            advanceTop();
          }, 350);
        }
        resetIdleTimer();
      });

      hammerInstances.current.push(hm);
    });
  }, [
    swipeThreshold,
    velocityThreshold,
    getCardStyle,
    advanceTop,
    resetIdleTimer,
  ]);

  const handleButtonSwipe = useCallback(
    (goRight) => {
      const topEl = cardRefs.current[topIndexRef.current];
      if (!topEl) return;
      const mow = document.body.clientWidth * 1.5;
      topEl.style.transition = "transform 0.35s ease-out";
      topEl.style.transform = goRight
        ? `translate(${mow}px, -80px) rotate(-25deg)`
        : `translate(-${mow}px, -80px) rotate(25deg)`;
      setTimeout(() => advanceTop(), 350);
      resetIdleTimer();
    },
    [advanceTop, resetIdleTimer],
  );

  // re-stack after topIndex changes
  useEffect(() => {
    applyStackStyles();
  }, [topIndex, applyStackStyles]);

  // idle tracking
  useEffect(() => {
    const evs = ["mousemove", "click", "touchstart", "touchmove"];
    evs.forEach((e) => document.addEventListener(e, resetIdleTimer));
    resetIdleTimer();
    return () => {
      evs.forEach((e) => document.removeEventListener(e, resetIdleTimer));
      clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const onHammerReady = useCallback(() => {
    applyStackStyles();
    attachHammers();
    resetIdleTimer();
  }, [applyStackStyles, attachHammers, resetIdleTimer]);

  // card content lookup by type
  const cardContent = (type) => {
    if (type === "cover")
      return (
        <CoverCard
          recipe={recipe}
          accent={accentColor}
          highlight={highlightColor}
        />
      );
    if (type === "about")
      return (
        <AboutCard
          recipe={recipe}
          accent={accentColor}
          highlight={highlightColor}
        />
      );
    if (type === "ingredients")
      return (
        <IngredientsCard
          recipe={recipe}
          accent={accentColor}
          highlight={highlightColor}
        />
      );
    return (
      <ProcessCard
        recipe={recipe}
        accent={accentColor}
        highlight={highlightColor}
        onInfoClick={() => setShowInfo(true)}
      />
    );
  };

  const CARD_BG = ["#181512", "#121815", "#121518", "#181215"];

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"
        strategy="afterInteractive"
        onLoad={onHammerReady}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@300;400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
        .rc-card { cursor: grab; will-change: transform; position: absolute; }
        .rc-card.dragging { cursor: grabbing; }
        .rc-scrollable { scrollbar-width: none; }
        .rc-scrollable::-webkit-scrollbar { display: none; }
        @keyframes rc-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .rc-prompt { animation: rc-float 1.8s ease-in-out infinite; }
        @keyframes rc-fadein { from { opacity:0; transform:scale(0.94) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .rc-modal { animation: rc-fadein 0.3s cubic-bezier(0.34,1.4,0.64,1) forwards; }
      `}</style>

      <div
        ref={containerRef}
        className="relative w-screen h-screen overflow-hidden flex flex-col"
        style={{ background: bgColor, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-end justify-between px-7 pt-12 pb-3 z-10">
          <div>
            <p
              className="text-[9px] tracking-[0.35em] uppercase mb-1 font-medium"
              style={{ color: highlightColor }}
            >
              Tonight&apos;s
            </p>
            <h1
              className="leading-none text-3xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: accentColor,
                fontWeight: 400,
              }}
            >
              Recipe
            </h1>
          </div>
          <PageDots
            total={4}
            active={topIndex}
            accent={accentColor}
            highlight={highlightColor}
          />
        </div>

        {/* ── Card stack (4 cards always in DOM, circular) ── */}
        <div className="flex-1 relative flex items-end justify-center pb-4">
          {CARD_TYPES.map((type, i) => (
            <div
              key={type}
              ref={(el) => (cardRefs.current[i] = el)}
              className="rc-card rounded-2xl overflow-hidden"
              style={{
                width: "min(88vw, 358px)",
                height: "min(64vh, 510px)",
                background: CARD_BG[i],
                border: `1px solid ${accentColor}0e`,
                boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px ${accentColor}06`,
              }}
            >
              {cardContent(type)}
            </div>
          ))}
        </div>

        {/* ── Swipe prompt (idle) ── */}
        {showPrompt && (
          <div className="rc-prompt pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 4L14 20M14 20L9 15M14 20L19 15"
                stroke={accentColor}
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
              />
              <path
                d="M7 23H21"
                stroke={accentColor}
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.2"
              />
            </svg>
            <span
              className="text-[9px] tracking-[0.3em] uppercase"
              style={{ color: accentColor, opacity: 0.3 }}
            >
              Swipe
            </span>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex-shrink-0 flex items-center justify-center gap-4 pb-10 z-10">
          {/* Prev */}
          <button
            onClick={() => handleButtonSwipe(false)}
            className="flex items-center justify-center w-13 h-13 rounded-full transition-all duration-150 active:scale-90"
            style={{
              width: 52,
              height: 52,
              background: `${accentColor}09`,
              border: `1px solid ${accentColor}18`,
              color: accentColor,
            }}
            aria-label="Skip back"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11 4.5L6.5 9L11 13.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Info */}
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
            style={{
              width: 44,
              height: 44,
              background: `${highlightColor}18`,
              border: `1px solid ${highlightColor}30`,
              color: highlightColor,
            }}
            aria-label="How to make pesto"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <path
                d="M8 7.5V11.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="8" cy="5.5" r="0.7" fill="currentColor" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={() => handleButtonSwipe(true)}
            className="flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
            style={{
              width: 52,
              height: 52,
              background: `${accentColor}09`,
              border: `1px solid ${accentColor}18`,
              color: accentColor,
            }}
            aria-label="Next card"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M7 4.5L11.5 9L7 13.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* ── Info / Pesto modal ── */}
        {showInfo && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center px-5"
            style={{
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(4px)",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowInfo(false);
            }}
          >
            <div
              className="rc-modal w-full rounded-2xl overflow-hidden"
              style={{
                maxWidth: 358,
                background: "#0f1a10",
                border: `1px solid ${accentColor}10`,
                boxShadow: `0 40px 80px rgba(0,0,0,0.8)`,
              }}
            >
              {/* modal header */}
              <div
                className="flex items-start justify-between px-6 pt-6 pb-4"
                style={{ borderBottom: `1px solid ${accentColor}0a` }}
              >
                <div>
                  <p
                    className="text-[9px] tracking-[0.3em] uppercase mb-2 font-medium"
                    style={{ color: highlightColor }}
                  >
                    Side recipe
                  </p>
                  <h2
                    className="text-3xl leading-none"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: accentColor,
                      fontWeight: 400,
                    }}
                  >
                    Make Pesto
                  </h2>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="flex items-center justify-center rounded-full mt-1 transition-opacity duration-150 hover:opacity-60"
                  style={{
                    width: 30,
                    height: 30,
                    background: `${accentColor}10`,
                    color: accentColor,
                  }}
                  aria-label="Close"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 2L10 10M10 2L2 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <ol className="px-6 pt-4 pb-5 flex flex-col gap-0">
                {recipe.pesto.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 py-3.5"
                    style={{
                      borderBottom:
                        i < recipe.pesto.length - 1
                          ? `1px solid ${accentColor}07`
                          : "none",
                    }}
                  >
                    <span
                      className="text-[10px] font-medium flex-shrink-0 w-5 text-right mt-0.5 tabular-nums"
                      style={{ color: highlightColor, opacity: 0.7 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[13px] leading-relaxed"
                      style={{ color: accentColor, opacity: 0.68 }}
                    >
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-full py-3 rounded-xl text-[11px] font-medium tracking-[0.25em] uppercase transition-all duration-150 active:scale-[0.98]"
                  style={{
                    background: `${highlightColor}15`,
                    color: highlightColor,
                    border: `1px solid ${highlightColor}25`,
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
