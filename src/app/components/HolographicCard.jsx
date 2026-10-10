"use client";

import { useEffect, useRef } from "react";

// ─── HolographicCard ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   #111827    Page background color
// cards            object[] […]        Array of card data objects:
//                                        { src, alt }
//                                      Each becomes one tilt + holo card.
// cardWidth        string   "50vmin"   CSS width of each card (inline — viewport unit)
// cardMinWidth     string   "280px"    CSS min-width of each card (inline — viewport unit)
// cardAspect       string   "3 / 4"    CSS aspect-ratio of each card (inline)
// cardRadius       string   "8px"      Border-radius of each card (inline)
// tiltXDeg         number   50         Max rotateX degrees on hover (inline — runtime)
// tiltYDeg         number   40         Max rotateY degrees on hover (inline — runtime)
// imgShiftPct      number   20         Max image parallax translate % on hover (inline)
// imgScale         number   1.2        Image scale factor — keeps edges hidden during tilt
// glowColor1       string   "var(--green-holo)"   First holo gradient colour stop
// glowColor2       string   "var(--indigo-holo)"  Second holo gradient colour stop
// glowOpacity      number   0.2        ::before overlay opacity at rest
// glowHoverOpacity number   1          ::before overlay opacity on hover
// shineOpacity     number   0.5        ::after radial shine opacity
// iconBg           string   "https://assets.codepen.io/605876/code-icon-bg.svg"
//                                      Repeating icon in the holo layer
// iconSize         string   "18%"      background-size of the icon tile
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_CARDS = [
  {
    src: "https://assets.codepen.io/605876/headshot--square.jpeg",
    alt: "Profile photo",
  },
  {
    src: "https://assets.codepen.io/605876/headshot--square.jpeg",
    alt: "Profile photo",
  },
];

export default function HolographicCard({
  bgColor = "#111827",
  cards = DEFAULT_CARDS,
  cardWidth = "50vmin",
  cardMinWidth = "280px",
  cardAspect = "3 / 4",
  cardRadius = "8px",
  tiltXDeg = 50,
  tiltYDeg = 40,
  imgShiftPct = 20,
  imgScale = 1.2,
  glowColor1 = "#4ade80",
  glowColor2 = "#6366f1",
  glowOpacity = 0.2,
  glowHoverOpacity = 1,
  shineOpacity = 0.5,
  iconBg = "https://assets.codepen.io/605876/code-icon-bg.svg",
  iconSize = "18%",
}) {
  // One ref per card — holds the DOM node the pointer listeners attach to
  const cardRefs = useRef([]);

  useEffect(() => {
    const cleanups = [];

    cardRefs.current.forEach((card) => {
      if (!card) return;

      // ── Pointer move: update --ratio-x / --ratio-y CSS custom properties ───
      // ratioX / ratioY are 0–1 values representing pointer position within
      // the card. They drive the inline CSS calculations for tilt and parallax.
      // These MUST be CSS custom properties — Tailwind can't express them.
      const onMove = (e) => {
        const bounds = card.getBoundingClientRect();
        const ratioX = (e.clientX - bounds.x) / bounds.width;
        const ratioY = (e.clientY - bounds.y) / bounds.height;
        card.style.setProperty("--ratio-x", ratioX);
        card.style.setProperty("--ratio-y", ratioY);
      };

      // ── Pointer leave: reset custom properties so CSS transitions snap back ─
      const onLeave = () => {
        card.style.setProperty("--ratio-x", 0.5);
        card.style.setProperty("--ratio-y", 0.5);
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      };

      // ── Pointer enter: attach per-card move + leave listeners ───────────────
      const onEnter = () => {
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
      };

      card.addEventListener("pointerenter", onEnter);
      cleanups.push(() => card.removeEventListener("pointerenter", onEnter));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [cards]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="w-full min-h-screen flex flex-wrap items-center justify-center gap-4"
      style={{ backgroundColor: bgColor, perspective: "100vmin" }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          ref={(el) => (cardRefs.current[i] = el)}
          className="hc-card relative overflow-hidden [touch-action:none] [transform-style:preserve-3d]"
          // All values below are runtime props → inline styles only.
          // The CSS custom properties (--ratio-x/y, --tilt-x/y, --img-shift,
          // --glow-1/2, --glow-opacity, --glow-hover, --shine-opacity,
          // --icon-bg, --icon-size, --img-scale) are read by the scoped
          // <style> block below — Tailwind cannot express dynamic CSS vars.
          style={{
            width: cardWidth,
            minWidth: cardMinWidth,
            aspectRatio: cardAspect,
            borderRadius: cardRadius,
            "--ratio-x": 0.5,
            "--ratio-y": 0.5,
            "--tilt-x": `${tiltXDeg}deg`,
            "--tilt-y": `${tiltYDeg}deg`,
            "--img-shift": `${imgShiftPct}%`,
            "--img-scale": imgScale,
            "--glow-1": glowColor1,
            "--glow-2": glowColor2,
            "--glow-opacity": glowOpacity,
            "--glow-hover": glowHoverOpacity,
            "--shine-opacity": shineOpacity,
            "--icon-bg": `url(${iconBg})`,
            "--icon-size": iconSize,
          }}
        >
          {/* ── Photo — parallax-shifts on hover via CSS custom properties ─── */}
          <img
            src={card.src}
            alt={card.alt ?? ""}
            className="hc-img w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        </div>
      ))}

      {/* ── Scoped styles ────────────────────────────────────────────────────────
          Four things here that Tailwind cannot express:
          1. CSS custom property arithmetic (calc with --ratio-x/y)
          2. ::before holo layer — complex multi-layer background + blend modes
          3. ::after radial shine layer — position tracks pointer via --ratio-*
          4. Hover/non-hover transition differences on transform and img translate
      ──────────────────────────────────────────────────────────────────────── */}
      <style>{`
        .hc-card {
          transition: transform 0.2s;
        }
        .hc-card:hover {
          transition: transform 0s;
          transform:
            rotateX(calc((var(--ratio-y) - 0.5) * var(--tilt-x)))
            rotateY(calc((var(--ratio-x) - 0.5) * calc(var(--tilt-y) * -1)));
        }

        /* ── Image parallax ── */
        .hc-img {
          scale: var(--img-scale);
          translate: 0 0;
          transition: translate 0.2s;
        }
        .hc-card:hover .hc-img {
          translate:
            calc((var(--ratio-x) - 0.5) * var(--img-shift))
            calc((var(--ratio-y) - 0.5) * var(--img-shift));
        }

        /* ── Holographic foil layer (::before) ── */
        .hc-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: var(--glow-opacity);
          transition: opacity 0.2s;
          background:
            var(--icon-bg) 0 0 / var(--icon-size) var(--icon-size),
            linear-gradient(
              115deg,
              transparent 20%,
              var(--glow-1) 30%,
              transparent 48% 52%,
              var(--glow-2) 70%,
              transparent
            ) 80% 80% / 300% 300%;
          filter: brightness(2) contrast(1);
          background-blend-mode: overlay;
          mix-blend-mode: color-dodge;
        }
        .hc-card:hover::before {
          opacity: var(--glow-hover);
          background-position:
            calc(var(--ratio-x) * 10%) calc(var(--ratio-y) * 10%),
            calc(80% + (var(--ratio-x) * -50%)) calc(80% + (var(--ratio-y) * -50%));
        }

        /* ── Radial shine layer (::after) ── */
        .hc-card::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          background: radial-gradient(
            circle at
              calc(var(--ratio-x) * 100%)
              calc(var(--ratio-y) * 100%),
            hsl(0 0% 100% / var(--shine-opacity)),
            transparent 50%
          );
          background-repeat: no-repeat;
          background-blend-mode: soft-light;
        }
      `}</style>
    </div>
  );
}
