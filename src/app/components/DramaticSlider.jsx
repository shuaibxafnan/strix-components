"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ─── DramaticSlider ───────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items               array    DEFAULT_ITEMS   Array of { image, label, title, description, cta }
// cardWidth           number   200             Width (px) of each small peek card
// cardHeight          number   300             Height (px) of each small peek card
// cardSpacing         number   220             Horizontal gap between peek cards (px)
// cardStartOffset     string   "50%"           Left offset where first peek card begins
// transitionDuration  string   "0.75s"         CSS transition duration for card movement
// contentLeft         string   "4rem"          Left offset of text inside active slide
// showInsetShadow     boolean  true            Inset white glow on peek cards
// gradientOpacity     number   0.75            Opacity of left-side readability gradient
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    image: "https://cdn.mos.cms.futurecdn.net/dP3N4qnEZ4tCTCLq59iysd.jpg",
    label: "Featured Film",
    title: "Lossless Youths",
    description:
      "A generation unmoored — drifting between memory and simulation, searching for something the world forgot to preserve.",
    cta: "Read the story",
  },
  {
    image: "https://i.redd.it/tc0aqpv92pn21.jpg",
    label: "Now Showing",
    title: "Estrange Bond",
    description:
      "Two strangers. One collapsing city. The architecture of trust rebuilt in the shadow of everything they've lost.",
    cta: "Read the story",
  },
  {
    image: "https://wharferj.files.wordpress.com/2015/11/bio_north.jpg",
    label: "Director's Cut",
    title: "The Gate Keeper",
    description:
      "At the edge of a forgotten frontier, one figure holds the line between what was permitted and what was possible.",
    cta: "Read the story",
  },
  {
    image: "https://images7.alphacoders.com/878/878663.jpg",
    label: "In Memoriam",
    title: "Last Trace of Us",
    description:
      "When the signals finally went quiet, only the landscape remembered. A meditation on absence and what it leaves behind.",
    cta: "Read the story",
  },
  {
    image:
      "https://theawesomer.com/photos/2017/07/simon_stalenhag_the_electric_state_6.jpg",
    label: "Anthology",
    title: "Urban Decay",
    description:
      "Steel rusts. Concrete cracks. The machines kept moving long after the people stopped watching.",
    cta: "Read the story",
  },
  {
    image: "https://da.se/app/uploads/2015/09/simon-december1994.jpg",
    label: "World Premiere",
    title: "The Migration",
    description:
      "Thousands left. Some arrived. The distance between those two facts is where the real story lives.",
    cta: "Read the story",
  },
];

// ── Per-slot positioning — mirrors original CSS nth-child rules.
// ── All values depend on props so must be inline styles.
function slotStyle(
  slot,
  cardWidth,
  cardHeight,
  cardSpacing,
  cardStartOffset,
  transitionDuration,
  showInsetShadow,
) {
  const transition =
    "transform 0.1s, left " +
    transitionDuration +
    ", top " +
    transitionDuration +
    ", width " +
    transitionDuration +
    ", height " +
    transitionDuration;

  if (slot === 0 || slot === 1) {
    return {
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      transform: "none",
      borderRadius: 0,
      boxShadow: "none",
      opacity: 1,
      transition,
      zIndex: 1,
    };
  }

  const peekIndex = slot - 2;
  return {
    width: cardWidth + "px",
    height: cardHeight + "px",
    left: "calc(" + cardStartOffset + " + " + peekIndex * cardSpacing + "px)",
    top: "50%",
    transform: "translateY(-50%)",
    borderRadius: "16px",
    boxShadow: showInsetShadow
      ? "0 20px 30px rgba(255,255,255,0.3) inset"
      : "none",
    opacity: slot >= 5 ? 0 : 1,
    transition,
    zIndex: 1,
  };
}

// ── Zero-pad a number to 2 digits — "1" → "01"
function pad(n) {
  return String(n).padStart(2, "0");
}

export default function DramaticSlider({
  items = DEFAULT_ITEMS,
  cardWidth = 200,
  cardHeight = 300,
  cardSpacing = 220,
  cardStartOffset = "50%",
  transitionDuration = "0.75s",
  contentLeft = "4rem",
  showInsetShadow = true,
  gradientOpacity = 0.75,
}) {
  const [order, setOrder] = useState(
    items.map(function (_, i) {
      return i;
    }),
  );
  const [animKey, setAnimKey] = useState(0);
  const lockedRef = useRef(false);

  // ── Font injection — Cormorant Garamond (editorial serif) + Inter (body)
  useEffect(function () {
    const id = "ds-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=Inter:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const navigate = useCallback(
    function (dir) {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setOrder(function (prev) {
        const next = [...prev];
        dir === "next" ? next.push(next.shift()) : next.unshift(next.pop());
        return next;
      });
      setAnimKey(function (k) {
        return k + 1;
      });
      setTimeout(
        function () {
          lockedRef.current = false;
        },
        parseFloat(transitionDuration) * 1000,
      );
    },
    [transitionDuration],
  );

  // ── Active item for counter display
  const activeItem = items[order[1]];
  const activeIndex = order[1]; // original index → used as slide number

  // ── Scoped keyframes — plain string concat, no backticks (SSR-safe)
  const scopedCSS =
    // ── Google Fonts preconnect inserted at component level; font loads async.
    // ── Content entrance: blur + upward drift → sharp + settled
    "@keyframes ds-show {" +
    "  0%   { opacity:0; filter:blur(6px); transform:translateY(calc(-50% + 60px)); }" +
    "  100% { opacity:1; filter:blur(0);   transform:translateY(-50%); }" +
    "}" +
    // ── Eyebrow line grows in from left
    "@keyframes ds-line {" +
    "  0%   { transform:scaleX(0); opacity:0; }" +
    "  100% { transform:scaleX(1); opacity:1; }" +
    "}" +
    ".ds-active { animation: ds-show 0.8s cubic-bezier(0.22,1,0.36,1) 0.25s forwards; }" +
    ".ds-line   { transform-origin:left; animation: ds-line 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s forwards; opacity:0; }";

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />

      {/* ── Slides ──────────────────────────────────────────────────────── */}
      {order.map(function (itemIndex, slot) {
        const item = items[itemIndex];
        const isActive = slot === 1;

        return (
          <div
            key={itemIndex}
            className="absolute bg-center bg-cover"
            style={{
              backgroundImage: "url(" + item.image + ")",
              ...slotStyle(
                slot,
                cardWidth,
                cardHeight,
                cardSpacing,
                cardStartOffset,
                transitionDuration,
                showInsetShadow,
              ),
            }}
          >
            {/* ── Left-side gradient — readability without muddying the image */}
            {isActive && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0," +
                    gradientOpacity +
                    ") 0%, rgba(0,0,0,0.3) 45%, transparent 70%)",
                }}
              />
            )}

            {/* ── Content — only on active slide ────────────────────────── */}
            {isActive && (
              <div
                key={"content-" + animKey}
                className="ds-active absolute opacity-0 text-white"
                style={{
                  top: "50%",
                  left: contentLeft,
                  width: "min(38vw, 480px)",
                }}
              >
                {/* ── Eyebrow: thin rule + label ──────────────────────── */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-white/60 tracking-[0.2em] uppercase"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* ── Title — Cormorant Garamond italic, tall + editorial ── */}
                <h2
                  className="text-white leading-[0.95] mb-5"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
                    fontWeight: 300,
                    fontStyle: "italic",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.title}
                </h2>

                {/* ── Thin rule between title and body ────────────────── */}
                <div className="w-full h-px bg-white/20 mb-4" />

                {/* ── Description — Inter light ────────────────────────── */}
                <p
                  className="text-white/75 leading-relaxed mb-7"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(0.75rem, 1.1vw, 0.875rem)",
                    fontWeight: 300,
                  }}
                >
                  {item.description}
                </p>

                {/* ── CTA — text link with animated underline + arrow ──── */}
                <a
                  href="#"
                  className="group inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  <span className="border-b border-white/30 group-hover:border-white/80 transition-colors pb-px">
                    {item.cta}
                  </span>
                  <span className="transition-transform group-hover:translate-x-1">
                    &#8594;
                  </span>
                </a>

                {/* ── Slide counter ────────────────────────────────────── */}
                <div
                  className="absolute right-0 top-0 flex items-start gap-1 text-white/40"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 300,
                  }}
                >
                  <span
                    className="text-white/80"
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      lineHeight: 1,
                    }}
                  >
                    {pad(activeIndex + 1)}
                  </span>
                  <span className="mt-1">/ {pad(items.length)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Nav — bottom-left, typographic style ────────────────────────── */}
      <nav
        className="absolute z-[5] flex items-center gap-6 select-none"
        style={{ bottom: "2.5rem", left: contentLeft }}
      >
        <button
          onClick={function () {
            navigate("prev");
          }}
          aria-label="Previous slide"
          className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.15em",
          }}
        >
          <span className="transition-transform group-hover:-translate-x-1">
            &#8592;
          </span>
          <span>PREV</span>
        </button>

        {/* ── Thin vertical divider ──────────────────────────────────── */}
        <div className="w-px h-4 bg-white/25" />

        <button
          onClick={function () {
            navigate("next");
          }}
          aria-label="Next slide"
          className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.15em",
          }}
        >
          <span>NEXT</span>
          <span className="transition-transform group-hover:translate-x-1">
            &#8594;
          </span>
        </button>
      </nav>
    </div>
  );
}
