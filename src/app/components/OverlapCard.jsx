"use client";

import { useState, useCallback } from "react";

// ─── CardSwiper ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// groups        array    DEFAULT_GROUPS   Array of { label, bigCards[4], smallCards[4] }
// cardWidthVmin number   30               Stack width in vmin units
// accentColor   string   #3b82f6          Love button + active dot color
// showButtons   bool     true             Show / hide action buttons
// showLabel     bool     true             Show / hide category label
// onLove        fn       —                Called with nextIndex when ❤ clicked
// onHate        fn       —                Called with nextIndex when ✕ clicked
// className     string   ""               Extra class on the root container
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_GROUPS = [
  {
    label: "Dogs",
    bigCards: [
      "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1534351450181-ea9f78427fe8?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=60",
    ],
    smallCards: [
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1548546738-8509cb246ed3?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=500&q=60",
    ],
  },
  {
    label: "Forests",
    bigCards: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=500&q=60",
    ],
    smallCards: [
      "https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=500&q=60",
    ],
  },
  {
    label: "Cities",
    bigCards: [
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1514565131-fce0801e6785?auto=format&fit=crop&w=500&q=60",
    ],
    smallCards: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=500&q=60",
    ],
  },
];

// Runtime transform strings — cannot be expressed as static Tailwind utilities
// because they combine translate + rotate with arbitrary vmin values.
const BIG_CARD_IDLE = [
  "translateX(-10%) rotate(-1deg)",
  "rotate(2deg)",
  "translateX(-6%) rotate(-3deg)",
  "translate(10%, 3%) rotate(5deg)",
];

const BIG_CARD_HOVER = [
  "translate(-75%, 16%) rotate(-24deg)",
  "translate(-25%, 8%) rotate(-8deg)",
  "translate(25%, 8%) rotate(8deg)",
  "translate(75%, 16%) rotate(24deg)",
];

const SMALL_CARD_IDLE = "translate(-50%, -50%)";

const SMALL_CARD_HOVER = [
  "translate(calc(-50% + 200%), calc(-50% - 160%)) rotate(-15deg)",
  "translate(calc(-50% + 160%), calc(-50% + 170%)) rotate(15deg)",
  "translate(calc(-50% - 200%), calc(-50% - 170%)) rotate(15deg)",
  "translate(calc(-50% - 280%), calc(-50% + 140%)) rotate(-15deg)",
];

// card-group[data-status] → Tailwind transform + transition classes
function getGroupClasses(status) {
  const base = "absolute inset-0";
  const map = {
    unknown:                      "scale-0 transition-none",
    active:                       "scale-100 translate-x-0 transition-transform duration-[400ms] ease-[ease] delay-300",
    after:                        "translate-x-[50%] scale-0 transition-transform duration-[400ms] ease-[ease]",
    before:                       "translate-x-[-50%] scale-0 transition-transform duration-[400ms] ease-[ease]",
    "becoming-active-from-after": "translate-x-[50%] scale-0 transition-none",
    "becoming-active-from-before":"translate-x-[-50%] scale-0 transition-none",
  };
  return `${base} ${map[status] ?? "scale-0 transition-none"}`;
}

export default function OverlapCard({
  groups = DEFAULT_GROUPS,
  cardWidthVmin = 30,
  accentColor = "#3b82f6",
  showButtons = true,
  showLabel = true,
  onLove,
  onHate,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [statuses, setStatuses] = useState(() =>
    groups.map((_, i) => (i === 0 ? "active" : "unknown"))
  );
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const goNext = useCallback(() => {
    const nextIndex = activeIndex + 1 <= groups.length - 1 ? activeIndex + 1 : 0;
    setStatuses((prev) => {
      const next = [...prev];
      next[activeIndex] = "after";
      next[nextIndex] = "becoming-active-from-before";
      return next;
    });
    requestAnimationFrame(() => {
      setStatuses((prev) => {
        const next = [...prev];
        next[nextIndex] = "active";
        return next;
      });
      setActiveIndex(nextIndex);
      onLove?.(nextIndex);
    });
  }, [activeIndex, groups.length, onLove]);

  const goPrev = useCallback(() => {
    const nextIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : groups.length - 1;
    setStatuses((prev) => {
      const next = [...prev];
      next[activeIndex] = "before";
      next[nextIndex] = "becoming-active-from-after";
      return next;
    });
    requestAnimationFrame(() => {
      setStatuses((prev) => {
        const next = [...prev];
        next[nextIndex] = "active";
        return next;
      });
      setActiveIndex(nextIndex);
      onHate?.(nextIndex);
    });
  }, [activeIndex, groups.length, onHate]);

  const cardAspect = { aspectRatio: "5/7" };
  const cardW = `${cardWidthVmin}vmin`;

  // Complex multi-value box-shadow that can't be expressed as a single Tailwind utility
  const cardHoverShadow = "-2vmin 2vmin 3vmin rgba(0,0,0,0.4)";
  const smallCardIdleShadow = "-1vmin 1vmin 2vmin rgba(0,0,0,0.25)";

  return (
    <div
      className={`min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center ${className}`}
    >
      {/* Stack */}
      <div className="relative" style={{ width: cardW, ...cardAspect }}>
        {groups.map((group, gi) => (
          <div
            key={gi}
            className={getGroupClasses(statuses[gi])}
            style={cardAspect}
            onMouseEnter={() => setHoveredGroup(gi)}
            onMouseLeave={() => setHoveredGroup(null)}
          >
            {/* Small satellite cards — pointer-events-none, driven by group hover state */}
            {group.smallCards.map((src, si) => (
              <div
                key={`s${si}`}
                className="absolute pointer-events-none bg-cover bg-center"
                style={{
                  width: "12vmin",
                  ...cardAspect,
                  borderRadius: "2vmin",
                  left: "50%",
                  top: "50%",
                  backgroundImage: `url(${src})`,
                  transform: hoveredGroup === gi ? SMALL_CARD_HOVER[si] : SMALL_CARD_IDLE,
                  boxShadow: hoveredGroup === gi ? cardHoverShadow : smallCardIdleShadow,
                  transition: "transform 800ms cubic-bezier(.05,.43,.25,.95), box-shadow 800ms ease",
                }}
              />
            ))}

            {/* Big background cards */}
            {group.bigCards.map((src, bi) => (
              <div
                key={`b${bi}`}
                className="absolute inset-0 bg-cover bg-center cursor-pointer"
                style={{
                  width: cardW,
                  ...cardAspect,
                  borderRadius: "1vmin",
                  backgroundImage: `url(${src})`,
                  transform: hoveredGroup === gi ? BIG_CARD_HOVER[bi] : BIG_CARD_IDLE[bi],
                  boxShadow: hoveredGroup === gi ? cardHoverShadow : "",
                  transition: "transform 800ms cubic-bezier(.05,.43,.25,.95), box-shadow 800ms ease",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Label */}
      {showLabel && groups[activeIndex]?.label && (
        <p
          className="mt-6 text-white/30 font-light tracking-[0.25em] uppercase"
          style={{ fontSize: "1.4vmin" }}
        >
          {groups[activeIndex].label}
        </p>
      )}

      {/* Buttons + dot indicators */}
      {showButtons && (
        <div className="flex items-center gap-[4vmin] mt-[6vmin]">
          {/* Prev / hate */}
          <button
            onClick={goPrev}
            aria-label="Skip"
            className="rounded-full border border-white/20 flex items-center justify-center text-white/50 bg-transparent transition-all duration-200 hover:border-white/40 hover:text-white/80 hover:scale-105 active:scale-95"
            style={{ width: "7vmin", height: "7vmin" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "2.2vmin", height: "2.2vmin" }}
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-[1.2vmin]">
            {groups.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? "2vmin" : "0.6vmin",
                  height: "0.6vmin",
                  backgroundColor: i === activeIndex ? accentColor : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>

          {/* Next / love */}
          <button
            onClick={goNext}
            aria-label="Like"
            className="rounded-full flex items-center justify-center bg-transparent transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              width: "7vmin",
              height: "7vmin",
              border: `1px solid ${accentColor}`,
              color: accentColor,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "2.2vmin", height: "2.2vmin" }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}