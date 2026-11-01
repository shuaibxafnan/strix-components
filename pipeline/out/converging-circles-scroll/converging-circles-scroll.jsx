"use client";

import { useEffect, useId, useRef, useState } from "react";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=80`;

const DEFAULT_SECTIONS = [
  { image: photo("1749330513873-09ffa91b0aae") },
  { image: photo("1634325232058-e7b8f80cc20b") },
  { image: photo("1781935307999-e8bb5e62ebb1") },
];

const GRID_LINE =
  "stroke-[rgba(245,245,245,0.15)] [shape-rendering:crispEdges] [stroke-width:1]";
const CIRCLE_OUTLINE =
  "fill-none stroke-[rgba(245,245,245,0.3)] [stroke-width:1] [vector-effect:non-scaling-stroke]";
const CIRCLE_FILLED =
  "fill-[rgba(245,245,245,0.05)] stroke-[rgba(245,245,245,0.3)] [stroke-width:1] [vector-effect:non-scaling-stroke]";

function buildGeometry(svgContainer, circleTransitionsRef) {
  const gridLinesGroup = svgContainer.querySelector("[data-grid]");
  const circlesOutlineGroup = svgContainer.querySelector("[data-outline]");
  const circlesFilledGroup = svgContainer.querySelector("[data-filled]");
  if (!gridLinesGroup || !circlesOutlineGroup || !circlesFilledGroup) return;

  gridLinesGroup.innerHTML = "";
  circlesOutlineGroup.innerHTML = "";
  circlesFilledGroup.innerHTML = "";

  const NS = "http://www.w3.org/2000/svg";
  const gridSpacing = 48;

  for (let i = 0; i <= 40; i++) {
    const vLine = document.createElementNS(NS, "line");
    vLine.setAttribute("class", GRID_LINE);
    vLine.setAttribute("stroke-opacity", 0.3);
    vLine.setAttribute("x1", i * gridSpacing);
    vLine.setAttribute("y1", 0);
    vLine.setAttribute("x2", i * gridSpacing);
    vLine.setAttribute("y2", 1080);
    gridLinesGroup.appendChild(vLine);
    if (i <= 22) {
      const hLine = document.createElementNS(NS, "line");
      hLine.setAttribute("class", GRID_LINE);
      hLine.setAttribute("stroke-opacity", 0.3);
      hLine.setAttribute("x1", 0);
      hLine.setAttribute("y1", i * gridSpacing);
      hLine.setAttribute("x2", 1920);
      hLine.setAttribute("y2", i * gridSpacing);
      gridLinesGroup.appendChild(hLine);
    }
  }

  const d = 80;
  const cx = 960;
  const cy = 540;
  const final = { cx, cy, r: 4 * d };
  const transitions = [
    { initial: { cx: cx - 3 * d, cy, r: d * 0.8 }, final },
    { initial: { cx: cx + 3 * d, cy, r: d * 0.8 }, final },
    { initial: { cx, cy: cy - 3 * d, r: d * 0.8 }, final },
    { initial: { cx, cy: cy + 3 * d, r: d * 0.8 }, final },
    { initial: { cx: cx - 2 * d, cy: cy - 2 * d, r: d * 0.6 }, final },
    { initial: { cx: cx + 2 * d, cy: cy - 2 * d, r: d * 0.6 }, final },
    { initial: { cx: cx - 2 * d, cy: cy + 2 * d, r: d * 0.6 }, final },
    { initial: { cx: cx + 2 * d, cy: cy + 2 * d, r: d * 0.6 }, final },
    { initial: { cx: cx - 4 * d, cy, r: d * 0.4 }, final },
    { initial: { cx: cx + 4 * d, cy, r: d * 0.4 }, final },
    { initial: { cx, cy: cy - 4 * d, r: d * 0.4 }, final },
    { initial: { cx, cy: cy + 4 * d, r: d * 0.4 }, final },
    { initial: { cx, cy, r: d * 0.3 }, final },
  ];

  transitions.forEach((t) => {
    const outline = document.createElementNS(NS, "circle");
    outline.setAttribute("class", CIRCLE_OUTLINE);
    outline.setAttribute("cx", t.initial.cx);
    outline.setAttribute("cy", t.initial.cy);
    outline.setAttribute("r", t.initial.r);
    circlesOutlineGroup.appendChild(outline);

    const filled = document.createElementNS(NS, "circle");
    filled.setAttribute("class", CIRCLE_FILLED);
    filled.setAttribute("cx", t.initial.cx);
    filled.setAttribute("cy", t.initial.cy);
    filled.setAttribute("r", t.initial.r);
    circlesFilledGroup.appendChild(filled);

    t.outlineCircle = outline;
    t.filledCircle = filled;
  });

  circleTransitionsRef.current = transitions;
}

function updateScrollAnimations({
  circleTransitionsRef,
  glowCircleRef,
  circleWrapRef,
  footerRef,
  circleScaleMax,
  circleGlowColor,
  svgContainerRef,
}) {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

  const footer = footerRef.current;
  const footerStart = footer
    ? footer.offsetTop - window.innerHeight
    : maxScroll;
  const footerProgress = Math.max(
    0,
    (scrollY - footerStart) / (window.innerHeight * 0.5),
  );
  const fade = Math.max(0, 1 - footerProgress * 2);

  if (circleWrapRef.current) circleWrapRef.current.style.opacity = fade;
  if (svgContainerRef.current) svgContainerRef.current.style.opacity = fade;

  if (glowCircleRef.current) {
    const scale = 1 + progress * (circleScaleMax - 1);
    const shadowSize = progress * 150;
    const shadowSpread = progress * 35;
    glowCircleRef.current.style.transform = `scale(${scale})`;
    glowCircleRef.current.style.transformOrigin = "center center";
    glowCircleRef.current.style.boxShadow = `0 0 ${shadowSize}px ${shadowSpread}px rgba(${circleGlowColor}, ${progress})`;
  }

  const gridOpacity = Math.max(0, 0.3 * (1 - progress * 1.5));
  svgContainerRef.current
    ?.querySelectorAll("line")
    .forEach((l) => l.setAttribute("stroke-opacity", gridOpacity));

  (circleTransitionsRef.current || []).forEach((t, i) => {
    const curCx = t.initial.cx + (t.final.cx - t.initial.cx) * progress;
    const curCy = t.initial.cy + (t.final.cy - t.initial.cy) * progress;
    const curR = t.initial.r + (t.final.r - t.initial.r) * progress;
    const rot = progress * 360 * (i % 2 === 0 ? 1 : -1);
    const op = Math.max(0.1, 1 - progress * 0.7);

    if (t.outlineCircle) {
      t.outlineCircle.setAttribute("cx", curCx);
      t.outlineCircle.setAttribute("cy", curCy);
      t.outlineCircle.setAttribute("r", curR);
      t.outlineCircle.setAttribute(
        "transform",
        `rotate(${rot} ${curCx} ${curCy})`,
      );
      t.outlineCircle.setAttribute("stroke-opacity", op);
    }
    if (t.filledCircle) {
      t.filledCircle.setAttribute("cx", curCx);
      t.filledCircle.setAttribute("cy", curCy);
      t.filledCircle.setAttribute("r", curR);
      t.filledCircle.setAttribute(
        "transform",
        `rotate(${rot} ${curCx} ${curCy})`,
      );
      t.filledCircle.setAttribute("fill-opacity", op * 0.05);
    }
  });
}

export default function ConvergingCirclesScroll({
  bgColor = "#0a0a0a",
  textColor = "rgba(245, 245, 245, 0.9)",
  fontFamily = "Newsreader",
  monoFont = "JetBrains Mono",
  circleSize = "80px",
  circleScaleMax = 2.8,
  circleGlowColor = "255, 255, 0",
  sections = DEFAULT_SECTIONS,
  className = "",
  imageDim = 0.55,
  footerTitle = "Light begins in the dark.",
  footerText = "A slow scroll through shape and stillness. Stay as long as you like.",
}) {
  const grainId = `grain${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [phase, setPhase] = useState("loading");
  const [counter, setCounter] = useState(0);

  const rootRef = useRef(null);
  const svgContainerRef = useRef(null);
  const glowCircleRef = useRef(null);
  const circleWrapRef = useRef(null);
  const circleTransitionsRef = useRef([]);
  const gradientRef = useRef(null);
  const footerRef = useRef(null);
  const footerTitleRef = useRef(null);
  const footerTextRef = useRef(null);

  useEffect(() => {
    if (phase !== "loading") return;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      setCounter(count);
      if (count >= 100) {
        clearInterval(timer);
        setTimeout(() => setPhase("ready"), 500);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "ready") return;

    let cancelled = false;
    let teardown = () => {};
    let frame = 0;

    buildGeometry(svgContainerRef.current, circleTransitionsRef);

    const refresh = () =>
      updateScrollAnimations({
        circleTransitionsRef,
        glowCircleRef,
        circleWrapRef,
        footerRef,
        circleScaleMax,
        circleGlowColor,
        svgContainerRef,
      });

    const handleScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    };

    window.addEventListener("scroll", handleScroll);
    refresh();

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]).then(([gsapMod, stMod, lenisMod]) => {
        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const Lenis = lenisMod.default;
        const root = rootRef.current;
        if (cancelled || !root) return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          gsap.to(gradientRef.current, {
            y: "-500vh",
            duration: 2,
            ease: "power2.inOut",
            delay: 0.25,
          });

          root.querySelectorAll("[data-section]").forEach((section) => {
            gsap.to(section, {
              backgroundPositionY: "50%",
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            });
          });

          gsap.fromTo(
            [footerTitleRef.current, footerTextRef.current],
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: "none",
              stagger: 0.15,
              scrollTrigger: {
                trigger: footerRef.current,
                start: "top 70%",
                end: "top 20%",
                scrub: true,
              },
            },
          );
        }, root);

        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          touchMultiplier: 2,
        });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        teardown = () => {
          ctx.revert();
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
      teardown();
    };
  }, [phase, circleScaleMax, circleGlowColor]);

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-x-hidden bg-[var(--bg)] font-[family-name:var(--font)] text-[var(--fg)] ${className}`}
      style={{
        "--bg": bgColor,
        "--fg": textColor,
        "--font": `"${fontFamily}", serif`,
        "--mono": `"${monoFont}", monospace`,
        "--circle": circleSize,
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
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500&display=swap"
      />

      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1000] h-full w-full opacity-[0.08]"
      >
        <filter id={grainId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>

      {phase === "loading" && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[var(--bg)] font-[family-name:var(--mono)] text-xs tabular-nums text-[var(--fg)]">
          {counter}
        </div>
      )}

      <div
        ref={gradientRef}
        className="pointer-events-none fixed left-0 top-0 z-[1500] h-[500vh] w-screen bg-[linear-gradient(to_bottom,#000_0%,#000_20%,rgba(0,0,0,0.8)_40%,rgba(0,0,0,0.4)_70%,transparent_100%)]"
      />

      <div
        ref={svgContainerRef}
        className="pointer-events-none fixed inset-0 z-[50]"
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 1920 1080"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g data-grid />
          <g data-outline />
          <g>
            <clipPath id={`${grainId}-right`}>
              <rect x="960" y="0" width="960" height="1080" />
            </clipPath>
            <g data-filled clipPath={`url(#${grainId}-right)`} />
          </g>
        </svg>
      </div>

      <div
        ref={circleWrapRef}
        className="pointer-events-none fixed inset-0 z-[60] grid place-items-center"
      >
        <div
          ref={glowCircleRef}
          className="h-[var(--circle)] w-[var(--circle)] rounded-full bg-white"
        />
      </div>

      {sections.map((sec, i) => (
        <section
          key={i}
          data-section
          className="relative block h-[200vh] w-full bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url("${sec.image}")` }}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-black"
            style={{ opacity: imageDim }}
          />
        </section>
      ))}

      <footer
        ref={footerRef}
        className="relative z-10 flex h-screen w-full flex-col items-center justify-center bg-[var(--bg)] px-8 text-center"
      >
        <h2
          ref={footerTitleRef}
          className="max-w-[14ch] text-[clamp(2.75rem,8vw,7rem)] font-light italic leading-none tracking-[-0.02em]"
        >
          {footerTitle}
        </h2>
        <p
          ref={footerTextRef}
          className="mt-8 max-w-[38ch] text-[1.05rem] leading-relaxed text-[color-mix(in_srgb,var(--fg)_60%,transparent)]"
        >
          {footerText}
        </p>
      </footer>
    </div>
  );
}