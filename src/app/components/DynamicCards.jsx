"use client";

import { useState } from "react";

// ─── DynamicCards ───────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// title        string   "Dynamic Cards"            Main editorial heading
// subtitle     string   "Component System v2.6"    Micro mono section badge
// description  string   "A rigid, dark-mode..."    Asymmetric summary prose
// cards        array    [INITIAL_CARDS]            Array of data structure shapes
// placeholder  string   "https://images..."        Fallback image resource string
// accentColor  string   "#f0a500"                  Dynamic branding highlight token
// ──────────────────────────────────────────────────────────────────────────

const FALLBACK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";

const DEFAULT_CARDS = [
  {
    id: 1,
    image: FALLBACK_PLACEHOLDER,
    title: "The Architecture of Silence",
    subtitle: "Issue 01 // Spatial",
    body: "Exploring the spatial relationships between concrete structures, raw negative space, and modern minimalist living environments.",
    cta: { label: "Read Monograph", variant: "primary" },
  },
  {
    id: 2,
    image: FALLBACK_PLACEHOLDER,
    title: "Kinetic Frameworks",
    subtitle: "Vol. 14 / Synced Systems",
    body: "An in-depth critical analysis looking into real-time procedural generation pipelines and state machine orchestration paradigms.",
    cta: { label: "View Artifact", variant: "secondary" },
  },
  {
    id: 3,
    image: null,
    title: "Sub-Surface Manifestos",
    subtitle: null,
    body: "A radical exploration of underground digital networks, distributed decentralized archives, and independent publication collectives operating outside mainstream discovery engines.",
    cta: null,
  },
  {
    id: 4,
    image: FALLBACK_PLACEHOLDER,
    title: "Raw Materiality",
    subtitle: "Exhibition 2026",
    body: "Documenting industrial textures, oxidized metals, and unrefined composites through high-contrast macro photography lenses.",
    cta: { label: "Explore Gallery", variant: "warning" },
  },
  {
    id: 5,
    image: null,
    title: "Anarchic Grids & Layout Systems",
    subtitle: "Typographic Study",
    body: "Breaking structural rules using asymmetric alignments, oversized tracking, variable typefaces, and brutalist modular components.",
    cta: { label: "Download Guide", variant: "success" },
  },
  {
    id: 6,
    image: FALLBACK_PLACEHOLDER,
    title: "Post-Human Interface Paradigms",
    subtitle: "Next-Gen Design Spec",
    body: "Moving beyond historical skeuomorphism into hyper-functional text-first terminal layers and contextual semantic workflows.",
    cta: { label: "Review Specs", variant: "danger" },
  },
];

const VARIANT_STYLES = {
  primary:
    "bg-[#f0a500] text-[#0b0b0b] hover:bg-white transition-colors duration-300",
  secondary:
    "bg-transparent text-[#f0f0e8] border border-[#f0f0e8]/20 hover:border-[#f0a500] hover:text-[#f0a500] transition-colors duration-300",
  warning:
    "bg-[#e05c00] text-white hover:bg-[#ff6a00] transition-colors duration-300",
  success:
    "bg-[#0f7a4d] text-white hover:bg-[#149961] transition-colors duration-300",
  danger:
    "bg-[#b82323] text-white hover:bg-[#dc2f2f] transition-colors duration-300",
};

export default function DynamicCards({
  title = "Dynamic Cards",
  subtitle = "Component System v2.6",
  description = "A rigid, dark-mode technical matrix balancing editorial elegance with structural modularity.",
  cards: initialCards = DEFAULT_CARDS,
  placeholder = FALLBACK_PLACEHOLDER,
  accentColor = "#f0a500",
}) {
  const [cards, setCards] = useState(initialCards);

  const handleClose = (id) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, image: c.image ? null : placeholder } : c,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#f0f0e8] px-6 py-12 md:px-16 md:py-24 selection:bg-[#f0a500] selection:text-black">
      {/* ─── Editorial Header Element ─────────────────────────────────────── */}
      <header className="max-w-[1600px] mx-auto mb-20 border-b border-white/10 pb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40">
              {subtitle}
            </p>
          </div>

          {/* Creative Display Heading */}
          <h1 className="font-serif tracking-tight text-white leading-none text-5xl sm:text-6xl lg:text-7xl">
            <span className="block italic font-light opacity-50 text-[0.45em] tracking-widest font-mono uppercase mb-2">
              [INDEX // ARCHIVE]
            </span>
            {title}
          </h1>
        </div>

        {/* Descriptive Callout block */}
        <div className="md:text-right flex flex-col md:items-end gap-3 max-w-xs">
          <div className="h-px w-12 bg-white/20 hidden md:block" />
          <p className="font-mono text-xs text-white/30 leading-relaxed">
            {description}
          </p>
        </div>
      </header>

      {/* ─── Grid Matrix ──────────────────────────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const hasImage = !!card.image;

          return (
            <article
              key={card.id}
              className="group relative flex flex-col justify-between overflow-hidden border border-white/10 bg-[#121212] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 animate-in fade-in slide-in-from-bottom-6"
              style={{
                animationDuration: "700ms",
                animationDelay: `${idx * 60}ms`,
                animationFillMode: "both",
              }}
            >
              {/* Dynamic Structural Grid Overlay */}
              {!hasImage && (
                <div
                  className="absolute inset-0 opacity-10 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `repeating-linear-gradient(-45deg, ${accentColor}, ${accentColor} 1px, transparent 1px, transparent 20px)`,
                  }}
                />
              )}

              {/* Functional Header Trim */}
              <div className="p-4 flex items-center justify-between border-b border-white/5 z-10 bg-[#121212]/90 backdrop-blur-sm">
                <span
                  className="font-mono text-[11px] font-bold tracking-widest text-white/30 transition-colors duration-300"
                  style={{ "--tw-group-hover-text-color": accentColor }}
                >
                  <span className="group-hover:text-[var(--tw-group-hover-text-color)] transition-colors duration-300">
                    [{String(card.id).padStart(2, "0")}]
                  </span>
                </span>

                {/* Control Toggle */}
                <button
                  type="button"
                  aria-label={
                    hasImage ? "Remove image aspect" : "Restore image aspect"
                  }
                  onClick={() => handleClose(card.id)}
                  className={`w-7 h-7 flex items-center justify-center border transition-all duration-300 ease-out active:scale-95 ${
                    hasImage
                      ? "border-white/10 hover:border-red-500/50 hover:bg-red-950/20 text-white/60 hover:text-red-400"
                      : "border-white/10 hover:bg-green-950/20 text-white/60 hover:text-green-400"
                  }`}
                  style={
                    !hasImage
                      ? { borderColor: `${accentColor}20`, color: accentColor }
                      : {}
                  }
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className={`transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${!hasImage ? "rotate-45" : "group-hover:rotate-90"}`}
                  >
                    <path
                      d="M1 1L9 9M9 1L1 7"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="square"
                    />
                  </svg>
                </button>
              </div>

              {/* Graphic Media Module */}
              {hasImage && (
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/5 bg-black/40">
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-60" />
                </div>
              )}

              {/* Text Core Block */}
              <div
                className={`flex-1 p-6 flex flex-col justify-between ${!hasImage ? "min-h-[220px] justify-center items-start text-left" : ""}`}
              >
                <div className="space-y-4">
                  {card.subtitle && (
                    <p
                      className="font-mono text-[9px] uppercase tracking-[0.3em]"
                      style={{ color: `${accentColor}cc` }}
                    >
                      {card.subtitle}
                    </p>
                  )}

                  {card.title && (
                    <h2
                      className={`font-serif tracking-tight text-white transition-colors duration-300 ${
                        hasImage
                          ? "text-xl sm:text-2xl group-hover:text-[var(--accent)]"
                          : "text-3xl italic group-hover:text-[var(--accent)]"
                      }`}
                      style={{ "--accent": accentColor }}
                    >
                      {card.title}
                    </h2>
                  )}

                  <p
                    className={`text-white/50 leading-relaxed font-sans ${hasImage ? "text-xs" : "text-sm max-w-md"}`}
                  >
                    {card.body}
                  </p>
                </div>

                {/* Optional Action Callout */}
                {card.cta && (
                  <div className="mt-8 pt-2">
                    <a
                      href="#"
                      className={`inline-block font-mono text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 font-medium ${
                        VARIANT_STYLES[card.cta.variant] ??
                        VARIANT_STYLES.primary
                      }`}
                    >
                      {card.cta.label}
                    </a>
                  </div>
                )}
              </div>

              {/* Base Structural Line Transition Accent */}
              <div
                className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 ease-out group-hover:w-full"
                style={{
                  backgroundImage: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
                }}
              />
            </article>
          );
        })}
      </section>
    </div>
  );
}
