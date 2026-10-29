"use client";

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=1200&q=80`;

const DEFAULT_CARDS = [
  { src: unsplash("photo-1749330513873-09ffa91b0aae"), alt: "Card image one" },
  { src: unsplash("photo-1627896157734-4d7d4388f28b"), alt: "Card image two" },
];

export default function HolographicCard({
  backgroundColor = "bg-black",
  cards = DEFAULT_CARDS,
  cardWidth = "50vmin",
  cardMinWidth = "280px",
  cardAspect = "3 / 4",
  cardRadius = "8px",
  tiltXDeg = 50,
  tiltYDeg = 40,
  imgShiftPct = 20,
  imgScale = 1.2,
  glowColor1 = "#ffffff",
  glowColor2 = "#a3a3a3",
  glowOpacity = 0.2,
  glowHoverOpacity = 1,
  shineOpacity = 0.5,
  patternSize = "6%",
  className = "",
}) {
  const track = (e) => {
    const card = e.currentTarget;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--ratio-x", (e.clientX - bounds.x) / bounds.width);
    card.style.setProperty("--ratio-y", (e.clientY - bounds.y) / bounds.height);
  };

  const reset = (e) => {
    e.currentTarget.style.setProperty("--ratio-x", 0.5);
    e.currentTarget.style.setProperty("--ratio-y", 0.5);
  };

  return (
    <div
      className={`flex min-h-screen w-full flex-wrap items-center justify-center gap-4 [perspective:100vmin] ${backgroundColor} ${className}`}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          onPointerMove={track}
          onPointerLeave={reset}
          className="group relative w-[var(--card-w)] min-w-[var(--card-min)] touch-none overflow-hidden rounded-[var(--radius)] transition-transform duration-200 [aspect-ratio:var(--aspect)] [transform-style:preserve-3d] hover:duration-0 hover:[transform:rotateX(calc((var(--ratio-y)_-_0.5)_*_var(--tilt-x)))_rotateY(calc((var(--ratio-x)_-_0.5)_*_var(--tilt-y)_*_-1))]"
          style={{
            "--card-w": cardWidth,
            "--card-min": cardMinWidth,
            "--aspect": cardAspect,
            "--radius": cardRadius,
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
            "--pattern-size": patternSize,
          }}
        >
          <img
            src={card.src}
            alt={card.alt ?? ""}
            draggable={false}
            className="pointer-events-none h-full w-full select-none object-cover transition-[translate] duration-200 [scale:var(--img-scale)] [translate:0_0] group-hover:[translate:calc((var(--ratio-x)_-_0.5)_*_var(--img-shift))_calc((var(--ratio-y)_-_0.5)_*_var(--img-shift))]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] opacity-[var(--glow-opacity)] mix-blend-color-dodge transition-opacity duration-200 [background-blend-mode:overlay] [background-image:radial-gradient(circle,rgba(255,255,255,0.9)_1px,transparent_1.5px),linear-gradient(115deg,transparent_20%,var(--glow-1)_30%,transparent_48%_52%,var(--glow-2)_70%,transparent)] [background-position:0_0,80%_80%] [background-size:var(--pattern-size)_var(--pattern-size),300%_300%] group-hover:opacity-[var(--glow-hover)] group-hover:[background-position:calc(var(--ratio-x)_*_10%)_calc(var(--ratio-y)_*_10%),calc(80%_+_var(--ratio-x)_*_-50%)_calc(80%_+_var(--ratio-y)_*_-50%)]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-no-repeat [background-blend-mode:soft-light] [background-image:radial-gradient(circle_at_calc(var(--ratio-x)*100%)_calc(var(--ratio-y)*100%),hsl(0_0%_100%/var(--shine-opacity)),transparent_50%)]"
          />
        </div>
      ))}
    </div>
  );
}