"use client";

import { useEffect, useRef, useState } from "react";

// ─── CreativeJourney ──────────────────────────────────────────────────────────
//
// A full-page immersive scroll experience with audio, geometric SVG background,
// parallax sections, and a scroll-reactive glowing center circle.
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// bgColor            string   "#0a0a0a"    Page / preloader background color
// textColor          string   "rgba(245,245,245,0.9)"  Primary text color
//
// — Header —
// navLinks           array    [{label,href,active}]  Nav items
// contactLabel       string   "+CONNECT"    Right-side contact link
// contactHref        string   "#"           Contact link URL
//
// — Audio-enable screen —
// audioEnterTitle    string   "ENTER EXPERIENCE\nWITH AUDIO"  Prompt text
// startLabel         string   "START"       Button label
//
// — Geometric overlay —
// topLeftLabel       string   "THE CREATIVE\nPROCESS"   SVG top-left text
// topRightLabel      string   "THE ESSENCE\nOF SOUND"   SVG top-right text
// bottomRightLine1   string   "BETWEEN THE"             SVG bottom-right line 1
// bottomRightLine2   string   "HEARTBEATS"              SVG bottom-right line 2
// gridSpacing        number   48            SVG grid cell size (px in 1920-wide viewBox)
// gridOpacity        number   0.3           Base grid stroke opacity
//
// — Center circle —
// circleSize         string   "80px"        Glowing circle base diameter
// circleScaleMax     number   2.8           Max scale at bottom of scroll
// circleGlowColor    string   "255, 255, 0" RGB values for glow shadow color
//
// — Parallax sections —
// sections           array    [{image}]     Background image URLs (3 sections)
//
// — Footer —
// footerLeftLines    array    string[]      Left column text lines
// footerRightLines   array    string[]      Right column text lines
// creditsHtml        string   JSX-safe str  Credits line (rendered as dangerouslySetInnerHTML)
// footerSvgSrc       string   URL           Large footer SVG/image
// ──────────────────────────────────────────────────────────────────────────────

const DEFAULT_NAV = [
  { label: "CREATIVE JOURNEY", href: "#", active: true },
  { label: "ABOUT", href: "#", active: false },
  { label: "SOUND", href: "#", active: false },
];

const DEFAULT_SECTIONS = [
  { image: "https://assets.codepen.io/7558/blue-orange-003.jpg" },
  { image: "https://assets.codepen.io/7558/blue-orange-001.jpg" },
  { image: "https://assets.codepen.io/7558/blue-orange-002.jpg" },
];

const DEFAULT_FOOTER_LEFT = [
  "THE DARKNESS",
  "IS WHERE",
  "LIGHT IS BORN",
  "EMPTINESS",
  "CREATES SPACE",
  "FOR HEALING",
];

const DEFAULT_FOOTER_RIGHT = [
  "CREATIVITY FLOWS THROUGH",
  "INFINITE PATHWAYS",
  "CONSCIOUSNESS EXPANDS",
  "INTO BOUNDLESS REALMS",
  "OF LIGHT AND POSSIBILITY",
  "WHERE HEALING BECOMES ART",
];

// ─── Geometric background setup (runs once after preloader) ──────────────────
function buildGeometry(svgContainerRef, circleTransitionsRef) {
  const gridLinesGroup = svgContainerRef.current?.querySelector("#grid-lines");
  const circlesOutlineGroup =
    svgContainerRef.current?.querySelector("#circles-outline");
  const circlesFilledGroup = svgContainerRef.current?.querySelector(
    "#circles-filled > g",
  );
  if (!gridLinesGroup || !circlesOutlineGroup || !circlesFilledGroup) return;

  const NS = "http://www.w3.org/2000/svg";
  const gridSpacing = 48;

  // Grid lines
  for (let i = 0; i <= 40; i++) {
    const vLine = document.createElementNS(NS, "line");
    vLine.setAttribute("class", "cj-grid-line");
    vLine.setAttribute("x1", i * gridSpacing);
    vLine.setAttribute("y1", 0);
    vLine.setAttribute("x2", i * gridSpacing);
    vLine.setAttribute("y2", 1080);
    gridLinesGroup.appendChild(vLine);
    if (i <= 22) {
      const hLine = document.createElementNS(NS, "line");
      hLine.setAttribute("class", "cj-grid-line");
      hLine.setAttribute("x1", 0);
      hLine.setAttribute("y1", i * gridSpacing);
      hLine.setAttribute("x2", 1920);
      hLine.setAttribute("y2", i * gridSpacing);
      gridLinesGroup.appendChild(hLine);
    }
  }

  // Circle transitions
  const d = 80;
  const cx = 960;
  const cy = 540;
  const transitions = [
    {
      initial: { cx: cx - 3 * d, cy, r: d * 0.8 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx: cx + 3 * d, cy, r: d * 0.8 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx, cy: cy - 3 * d, r: d * 0.8 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx, cy: cy + 3 * d, r: d * 0.8 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx: cx - 2 * d, cy: cy - 2 * d, r: d * 0.6 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx: cx + 2 * d, cy: cy - 2 * d, r: d * 0.6 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx: cx - 2 * d, cy: cy + 2 * d, r: d * 0.6 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx: cx + 2 * d, cy: cy + 2 * d, r: d * 0.6 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx: cx - 4 * d, cy, r: d * 0.4 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx: cx + 4 * d, cy, r: d * 0.4 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx, cy: cy - 4 * d, r: d * 0.4 },
      final: { cx, cy, r: 4 * d },
    },
    {
      initial: { cx, cy: cy + 4 * d, r: d * 0.4 },
      final: { cx, cy, r: 4 * d },
    },
    { initial: { cx, cy, r: d * 0.3 }, final: { cx, cy, r: 4 * d } },
  ];

  transitions.forEach((t) => {
    const outline = document.createElementNS(NS, "circle");
    outline.setAttribute("class", "cj-circle-outline");
    outline.setAttribute("cx", t.initial.cx);
    outline.setAttribute("cy", t.initial.cy);
    outline.setAttribute("r", t.initial.r);
    circlesOutlineGroup.appendChild(outline);

    const filled = document.createElementNS(NS, "circle");
    filled.setAttribute("class", "cj-circle-filled");
    filled.setAttribute("cx", t.initial.cx);
    filled.setAttribute("cy", t.initial.cy);
    filled.setAttribute("r", t.initial.r);
    circlesFilledGroup.appendChild(filled);

    t.outlineCircle = outline;
    t.filledCircle = filled;
  });

  circleTransitionsRef.current = transitions;
}

// ─── Scroll-driven animation loop ─────────────────────────────────────────────
function updateScrollAnimations({
  circleTransitionsRef,
  glowCircleRef,
  debugRefs,
  circleScaleMax,
  circleGlowColor,
  svgContainerRef,
}) {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = Math.min(scrollY / maxScroll, 1);

  // Footer fade-out for geometric texts
  const footer = document.querySelector(".cj-footer");
  const footerStart = footer
    ? footer.offsetTop - window.innerHeight
    : maxScroll;
  const footerProgress = Math.max(
    0,
    (scrollY - footerStart) / (window.innerHeight * 0.5),
  );
  const textOpacity = Math.max(0, 1 - footerProgress * 2);
  svgContainerRef.current
    ?.querySelectorAll(".cj-geo-text")
    .forEach((t) => (t.style.opacity = textOpacity));

  // Frequency / state labels
  const freq1 = (432 + progress * 108).toFixed(1);
  const freq2 = (528 - progress * 156).toFixed(1);
  const energy = (progress * 99.9).toFixed(1);
  const presence = ((1 - progress) * 100).toFixed(1);

  let aw, st, en;
  if (progress <= 0.1) {
    aw = `[${freq1}] AWARENESS: SILENCE`;
    st = `.${freq2} STATE: VOID`;
    en = `{${energy}} ENERGY: DORMANT`;
  } else if (progress <= 0.25) {
    aw = `[${freq1}] AWARENESS: STIRRING`;
    st = `.${freq2} STATE: EMERGING`;
    en = `{${energy}} ENERGY: AWAKENING`;
  } else if (progress <= 0.5) {
    aw = `[${freq1}] AWARENESS: FLOWING`;
    st = `.${freq2} STATE: EXPANDING`;
    en = `{${energy}} ENERGY: BUILDING`;
  } else if (progress <= 0.75) {
    aw = `[${freq1}] AWARENESS: ASCENDING`;
    st = `.${freq2} STATE: DISSOLVING`;
    en = `{${energy}} ENERGY: RADIATING`;
  } else if (progress <= 0.9) {
    aw = `[${freq1}] AWARENESS: TRANSCENDING`;
    st = `.${freq2} STATE: INFINITE`;
    en = `{${energy}} ENERGY: OVERFLOWING`;
  } else {
    aw = `[${freq1}] AWARENESS: UNITY`;
    st = `.${freq2} STATE: ETERNAL`;
    en = `{${energy}} ENERGY: PURE`;
  }

  const pi = Math.max(0, 1 - progress);
  let pr;
  if (pi > 0.8) pr = `.${presence} PRESENCE: SOLID`;
  else if (pi > 0.6) pr = `.${presence} PRESENCE: SOFTENING`;
  else if (pi > 0.4) pr = `.${presence} PRESENCE: TRANSLUCENT`;
  else if (pi > 0.2) pr = `.${presence} PRESENCE: ETHEREAL`;
  else pr = `.${presence} PRESENCE: VOID`;

  if (debugRefs[0]?.current) debugRefs[0].current.textContent = aw;
  if (debugRefs[1]?.current) debugRefs[1].current.textContent = st;
  if (debugRefs[2]?.current) debugRefs[2].current.textContent = en;
  if (debugRefs[3]?.current) debugRefs[3].current.textContent = pr;

  // Center circle
  if (glowCircleRef.current) {
    const scale = 1 + progress * (circleScaleMax - 1);
    const shadowSize = progress * 150;
    const shadowSpread = progress * 35;
    glowCircleRef.current.style.transform = `scale(${scale})`;
    glowCircleRef.current.style.transformOrigin = "center center";
    glowCircleRef.current.style.boxShadow = `0 0 ${shadowSize}px ${shadowSpread}px rgba(${circleGlowColor}, ${progress})`;
  }

  // Grid fade
  const gridOpacity = Math.max(0, 0.3 * (1 - progress * 1.5));
  svgContainerRef.current
    ?.querySelectorAll(".cj-grid-line")
    .forEach((l) => l.setAttribute("stroke-opacity", gridOpacity));

  // Moving / rotating circles
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreativeJourney({
  // Colors
  bgColor = "#0a0a0a",
  textColor = "rgba(245, 245, 245, 0.9)",
  // Header
  navLinks = DEFAULT_NAV,
  contactLabel = "+CONNECT",
  contactHref = "https://x.com/filipz",
  // Audio screen
  audioEnterTitle = "ENTER EXPERIENCE\nWITH AUDIO",
  startLabel = "START",
  // Geometric overlay
  topLeftLabel = "THE CREATIVE\nPROCESS",
  topRightLabel = "THE ESSENCE\nOF SOUND",
  bottomRightLine1 = "BETWEEN THE",
  bottomRightLine2 = "HEARTBEATS",
  // Center circle
  circleSize = "80px",
  circleScaleMax = 2.8,
  circleGlowColor = "255, 255, 0",
  // Parallax sections
  sections = DEFAULT_SECTIONS,
  // Footer
  footerLeftLines = DEFAULT_FOOTER_LEFT,
  footerRightLines = DEFAULT_FOOTER_RIGHT,
  creditsText = "Sound Design & Music by @LXSTNGHT",
  creditsHref = "https://open.spotify.com/artist/6YXgRMajnjib8j6Cxzcryp",
  footerSvgSrc = "https://assets.codepen.io/7558/arrival-text.svg",
}) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState("audio-gate"); // "audio-gate" | "loading" | "ready"
  const [counter, setCounter] = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const svgContainerRef = useRef(null);
  const glowCircleRef = useRef(null);
  const circleTransitionsRef = useRef([]);
  const gradientRef = useRef(null);
  const debugRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const rafRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const currentSectionRef = useRef(1);

  // Audio element refs (populated after user gesture)
  const audioRefs = useRef({});

  // ── Start handler (user gesture → audio unlock → preloader) ───────────────
  function handleStart() {
    const ids = [
      "startClickSound",
      "preloaderSound",
      "scrollSound1",
      "scrollSound2",
      "scrollSound3",
      "backgroundMusic",
      "hoverSound",
    ];
    ids.forEach((id) => {
      audioRefs.current[id] = document.getElementById(`cj-${id}`);
    });

    audioRefs.current.startClickSound?.play().catch(() => {});
    audioRefs.current.preloaderSound?.play().catch(() => {});

    setTimeout(() => {
      const bg = audioRefs.current.backgroundMusic;
      if (bg) {
        bg.volume = 0.5;
        bg.play().catch(() => {});
      }
    }, 500);

    setPhase("loading");
  }

  // ── Counter animation during preload ──────────────────────────────────────
  useEffect(() => {
    if (phase !== "loading") return;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      setCounter(count);
      if (count >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          audioRefs.current.preloaderSound?.pause();
          if (audioRefs.current.preloaderSound)
            audioRefs.current.preloaderSound.currentTime = 0;
          setPhase("ready");
        }, 500);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [phase]);

  // ── After ready: setup geometry, GSAP, scroll ─────────────────────────────
  useEffect(() => {
    if (phase !== "ready") return;

    buildGeometry(svgContainerRef, circleTransitionsRef);

    // Load GSAP + Lenis then wire up animations
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
      loadScript("https://cdn.jsdelivr.net/npm/lenis@latest/dist/lenis.min.js"),
    ])
      .then(() => {
        const { gsap, ScrollTrigger, Lenis } = window;
        if (!gsap) return;

        gsap.registerPlugin(ScrollTrigger);

        // Gradient reveal
        if (gradientRef.current) {
          gsap.to(gradientRef.current, {
            y: "-500vh",
            duration: 2,
            ease: "power2.inOut",
            delay: 0.25,
          });
        }

        // Parallax on each section
        document.querySelectorAll(".cj-section").forEach((section) => {
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

        // Lenis smooth scroll
        if (Lenis) {
          const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothTouch: false,
            touchMultiplier: 2,
          });
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add((time) => lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
        }

        // Nav hover squares
        document.querySelectorAll(".cj-nav-item").forEach((item) => {
          const square = item.querySelector(".cj-nav-square");
          const hoverSnd = audioRefs.current.hoverSound;
          item.addEventListener("mouseenter", () => {
            gsap.to(square, { scaleX: 1, duration: 0.3, ease: "power2.out" });
            if (hoverSnd) {
              hoverSnd.currentTime = 0;
              hoverSnd.volume = 0.3;
              hoverSnd.play().catch(() => {});
            }
          });
          item.addEventListener("mouseleave", () => {
            gsap.to(square, { scaleX: 0, duration: 0.2, ease: "power2.in" });
          });
        });
      })
      .catch((e) => console.error("[CreativeJourney] script load failed:", e));

    // Scroll → scroll sounds + circle animation
    function handleScroll() {
      const scrollY = window.scrollY;
      const sectionHeight = window.innerHeight * 2;
      const newSection =
        scrollY < sectionHeight ? 1 : scrollY < sectionHeight * 2 ? 2 : 3;

      if (newSection !== currentSectionRef.current) {
        [1, 2, 3].forEach((n) => {
          const snd = audioRefs.current[`scrollSound${n}`];
          if (snd && !snd.paused) {
            snd.pause();
            snd.currentTime = 0;
          }
        });
        currentSectionRef.current = newSection;
      }
      const curSnd =
        audioRefs.current[`scrollSound${currentSectionRef.current}`];
      if (curSnd?.paused) {
        curSnd.currentTime = 0;
        curSnd.play().catch(() => {});
      }

      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        [1, 2, 3].forEach((n) => {
          const snd = audioRefs.current[`scrollSound${n}`];
          if (snd && !snd.paused) {
            snd.pause();
            snd.currentTime = 0;
          }
        });
      }, 150);

      // Raf-throttled visual update
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() =>
        updateScrollAnimations({
          circleTransitionsRef,
          glowCircleRef,
          debugRefs,
          circleScaleMax,
          circleGlowColor,
          svgContainerRef,
        }),
      );
    }

    window.addEventListener("scroll", handleScroll);
    updateScrollAnimations({
      circleTransitionsRef,
      glowCircleRef,
      debugRefs,
      circleScaleMax,
      circleGlowColor,
      svgContainerRef,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Derived top-left / top-right label lines ───────────────────────────────
  const [tlLine1, tlLine2 = ""] = topLeftLabel.split("\n");
  const [trLine1, trLine2 = ""] = topRightLabel.split("\n");

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Scoped styles (grid lines, SVG classes, noise overlay) ── */}
      <style>{`
        .cj-root {
          background: ${bgColor};
          color: ${textColor};
        }
        .cj-root body, .cj-root * { box-sizing: border-box; }
        /* Noise overlay */
        .cj-root::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("https://assets.codepen.io/7558/noise-002.png");
          background-repeat: repeat;
          opacity: 0.08;
          z-index: 1000;
          pointer-events: none;
        }
        .cj-grid-line {
          stroke: rgba(245,245,245,0.15);
          stroke-width: 1;
          stroke-opacity: 0.3;
          shape-rendering: crispEdges;
        }
        .cj-circle-outline {
          stroke: rgba(245,245,245,0.3);
          stroke-width: 1;
          fill: none;
          vector-effect: non-scaling-stroke;
        }
        .cj-circle-filled {
          stroke: rgba(245,245,245,0.3);
          stroke-width: 1;
          fill: rgba(245,245,245,0.05);
          vector-effect: non-scaling-stroke;
        }
        .cj-geo-text {
          font-family: "PPSupplyMono", "Courier New", monospace;
          font-size: 12px;
          fill: rgba(245,245,245,0.6);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: opacity 0.3s ease;
        }
        .cj-nav-square {
          position: absolute;
          top: 50%;
          left: 0;
          width: 4px;
          height: 4px;
          background: ${textColor};
          transform: translateY(-50%) scaleX(0);
          transform-origin: left center;
        }
        @font-face {
          font-family: "PPSupplyMono";
          src: url("https://assets.codepen.io/7558/PPSupplyMono-Regular.ttf") format("truetype");
          font-weight: normal;
          font-style: normal;
        }
      `}</style>

      {/* ── Root wrapper — drives full-page height ── */}
      <div
        className="cj-root relative w-screen font-mono text-[11px] uppercase leading-[1.2] overflow-x-hidden"
        style={{
          background: bgColor,
          color: textColor,
          height: "700vh",
          fontFamily: '"PPSupplyMono", "Courier New", monospace',
        }}
      >
        {/* ── Audio-gate overlay ── */}
        {phase === "audio-gate" && (
          <div
            className="fixed inset-0 flex flex-col items-center justify-center gap-8 text-center px-4 z-[2000] uppercase text-[12px]"
            style={{ background: bgColor, color: textColor }}
          >
            <p className="whitespace-pre-line leading-relaxed">
              {audioEnterTitle}
            </p>
            <button
              onClick={handleStart}
              className="border px-8 py-4 text-[12px] uppercase tracking-widest cursor-pointer transition-all duration-300 hover:bg-[rgba(245,245,245,0.9)] hover:text-[#0a0a0a]"
              style={{
                borderColor: textColor,
                background: "transparent",
                color: textColor,
                fontFamily: '"PPSupplyMono", "Courier New", monospace',
              }}
            >
              {startLabel}
            </button>
          </div>
        )}

        {/* ── Preloader overlay ── */}
        {phase === "loading" && (
          <div
            className="fixed inset-0 flex items-center justify-center z-[2000] text-[12px] tracking-widest uppercase"
            style={{ background: bgColor, color: textColor }}
          >
            <span>[{counter.toString().padStart(3, "0")}]</span>
          </div>
        )}

        {/* ── Gradient reveal curtain ── */}
        <div
          ref={gradientRef}
          className="fixed top-0 left-0 w-screen pointer-events-none z-[1500]"
          style={{
            height: "500vh",
            background:
              "linear-gradient(to bottom, #000 0%, #000 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)",
          }}
        />

        {/* ── Fixed header ── */}
        <header className="fixed top-0 left-0 w-full h-20 z-[100] flex items-center">
          <div
            className="grid gap-4 items-center px-8 w-full h-full"
            style={{ gridTemplateColumns: "repeat(12, 1fr)" }}
          >
            {/* Logo */}
            <div
              className="relative flex items-center h-8 group"
              style={{ gridColumn: "1 / 3" }}
            >
              <div className="relative w-full h-full">
                <div
                  className="absolute rounded-full transition-transform duration-500 ease-in-out group-hover:[-translate-x-2] top-1/2 -translate-y-1/2 w-[1.8rem] h-[1.8rem] left-0"
                  style={{ background: textColor }}
                />
                <div
                  className="absolute rounded-full transition-transform duration-500 ease-in-out group-hover:[translate-x-2] top-1/2 -translate-y-1/2 w-[1.8rem] h-[1.8rem] left-4"
                  style={{
                    background: textColor,
                    mixBlendMode: "exclusion",
                  }}
                />
              </div>
            </div>

            {/* Nav */}
            <nav style={{ gridColumn: "4 / 8" }}>
              <ul className="flex list-none gap-6 flex-wrap">
                {navLinks.map((link, i) => (
                  <li key={i} className="cj-nav-item relative">
                    <a
                      href={link.href}
                      className="block relative pl-2 text-[12px] tracking-widest uppercase transition-colors duration-200 no-underline"
                      style={{ color: textColor }}
                    >
                      {link.label}
                    </a>
                    <div className="cj-nav-square" />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact */}
            <div className="text-right" style={{ gridColumn: "9 / 13" }}>
              <a
                href={contactHref}
                className="text-[12px] tracking-widest uppercase no-underline transition-opacity duration-300 hover:opacity-70"
                style={{ color: textColor }}
              >
                {contactLabel}
              </a>
            </div>
          </div>
        </header>

        {/* ── Geometric SVG overlay ── */}
        <div
          ref={svgContainerRef}
          className="fixed inset-0 z-[50] pointer-events-none"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1920 1080"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="grid-lines" />
            <g id="circles-outline" />
            <g id="circles-filled">
              <clipPath id="right-half">
                <rect x="960" y="0" width="960" height="1080" />
              </clipPath>
              <g clipPath="url(#right-half)" />
            </g>

            {/* Top-left label */}
            <text className="cj-geo-text" x="100" y="100">
              {tlLine1}
            </text>
            {tlLine2 && (
              <text className="cj-geo-text" x="100" y="115">
                {tlLine2}
              </text>
            )}

            {/* Top-right label */}
            <text className="cj-geo-text" x="1720" y="100">
              {trLine1}
            </text>
            {trLine2 && (
              <text className="cj-geo-text" x="1720" y="115">
                {trLine2}
              </text>
            )}

            {/* Bottom-left debug lines */}
            <text ref={debugRefs[0]} className="cj-geo-text" x="100" y="980">
              AWARENESS: SILENCE
            </text>
            <text ref={debugRefs[1]} className="cj-geo-text" x="100" y="995">
              STATE: VOID
            </text>
            <text ref={debugRefs[2]} className="cj-geo-text" x="100" y="1010">
              ENERGY: DORMANT
            </text>
            <text ref={debugRefs[3]} className="cj-geo-text" x="100" y="1025">
              PRESENCE: SOLID
            </text>

            {/* Bottom-right */}
            <text className="cj-geo-text" x="1620" y="980">
              {bottomRightLine1}
            </text>
            <text className="cj-geo-text" x="1620" y="995">
              {bottomRightLine2}
            </text>
          </svg>
        </div>

        {/* ── Center glowing circle ── */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] flex flex-col items-center justify-center w-full">
          <div className="flex items-center justify-center">
            <div
              ref={glowCircleRef}
              className="rounded-full bg-white"
              style={{ width: circleSize, height: circleSize }}
            />
          </div>
        </div>

        {/* ── Parallax sections ── */}
        {sections.map((sec, i) => (
          <section
            key={i}
            className="cj-section relative bg-cover bg-center bg-fixed m-0 p-0 block float-left w-full clear-both"
            style={{
              height: "200vh",
              backgroundImage: `url("${sec.image}")`,
              // Mobile fallback: no fixed attachment
            }}
          >
            <div className="relative z-[2] h-full p-8" />
          </section>
        ))}

        {/* ── Footer ── */}
        <footer
          className="cj-footer relative w-full z-[10] flex flex-col items-center justify-between p-8 clear-both"
          style={{ height: "50vh", background: bgColor }}
        >
          <div className="w-full h-full flex flex-col justify-between">
            {/* Text columns */}
            <div className="flex justify-between w-full items-start mb-8">
              <div
                className="flex flex-col gap-[0.15rem] text-[12px] uppercase leading-[1.2]"
                style={{ color: textColor }}
              >
                {footerLeftLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <div
                className="flex flex-col gap-[0.15rem] text-[12px] uppercase leading-[1.2] text-right max-w-[40%]"
                style={{ color: textColor }}
              >
                {footerRightLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            {/* Credits */}
            <p
              className="text-[10px] uppercase tracking-[0.7em] text-left mb-4"
              style={{ color: "rgba(245,245,245,0.6)" }}
            >
              {creditsText.split("@")[0]}
              {creditsHref && (
                <a
                  href={creditsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-opacity duration-300 hover:opacity-70 no-underline"
                  style={{ color: textColor }}
                >
                  @{creditsText.split("@")[1]}
                </a>
              )}
            </p>
          </div>

          {/* Full-width footer SVG */}
          {footerSvgSrc && (
            <div className="w-full">
              <img
                src={footerSvgSrc}
                alt=""
                className="w-full h-auto"
                style={{ maxWidth: "none" }}
              />
            </div>
          )}
        </footer>

        {/* ── Hidden audio elements ── */}
        <audio id="cj-startClickSound" preload="auto">
          <source
            src="https://assets.codepen.io/7558/preloader-2s-001.mp3"
            type="audio/mpeg"
          />
        </audio>
        <audio id="cj-preloaderSound" preload="auto">
          <source
            src="https://assets.codepen.io/7558/preloader-5s-001.mp3"
            type="audio/mpeg"
          />
        </audio>
        <audio id="cj-scrollSound1" loop preload="auto">
          <source
            src="https://assets.codepen.io/7558/glitch-fx-001.mp3"
            type="audio/mpeg"
          />
        </audio>
        <audio id="cj-scrollSound2" loop preload="auto">
          <source
            src="https://assets.codepen.io/7558/glitch-fx-001.mp3"
            type="audio/mpeg"
          />
        </audio>
        <audio id="cj-scrollSound3" loop preload="auto">
          <source
            src="https://assets.codepen.io/7558/glitch-fx-001.mp3"
            type="audio/mpeg"
          />
        </audio>
        <audio id="cj-hoverSound" preload="auto">
          <source
            src="https://assets.codepen.io/7558/preloader-2s-001.mp3"
            type="audio/mpeg"
          />
        </audio>
        <audio id="cj-backgroundMusic" loop preload="auto">
          <source
            src="https://assets.codepen.io/7558/lxstnght-night-angel.mp3"
            type="audio/mpeg"
          />
        </audio>
      </div>
    </>
  );
}
