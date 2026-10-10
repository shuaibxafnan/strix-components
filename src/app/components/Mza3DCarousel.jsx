"use client";

import { useEffect, useRef, useState } from "react";

// ─── Mza3DCarousel (Symmetrical Editorial Studio Edition) ──────────────────
const STUDIO_ITEMS = [
  {
    title: "Spatial Typography & Form.",
    kicker: "01 / ARCHITECTURE SYSTEM",
    text: "An exploration into the structural physics of light, casting shadows across raw monolithic canvas forms. We design spaces that reject temporary digital ornamentation to prioritize pure volumetric proportions.",
    btnText: "EXAMINE CASE STUDY",
    bgUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "The Architecture of Data.",
    kicker: "02 / COMPUTATIONAL DESIGN",
    text: "Translating hyper-dense financial transaction matrices into silent, low-latency tracking nodes. Built for immediate visual legibility under load, bypassing standard corporate telemetry conventions.",
    btnText: "INITIALIZE SYSTEM",
    bgUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Kinetic Identity Frameworks.",
    kicker: "03 / MOTION PRINCIPLES",
    text: "Developing highly responsive mechanical animation standards engineered exclusively on strict acceleration math. We treat dynamic layout interpolation as a core asset to establish true brand permanence.",
    btnText: "EXECUTE SHOWREEL",
    bgUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "High-Intent Flow Mechanics.",
    kicker: "04 / INTERACTION MATRIX",
    text: "Compressing friction-heavy consumer choices into a linear, single-axis transaction stream. Every interface state mutation acts as a purposeful micro-bridge accelerating direct digital conversion.",
    btnText: "ANALYZE METRICS",
    bgUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Decentralized Repositories.",
    kicker: "05 / CORE SYSTEM LAYERS",
    text: "Constructing globally distributed headless node assets integrated with automated layout pipeline compilation. Render content seamlessly everywhere at absolute instantaneous zero-millisecond edge speed.",
    btnText: "READ SPECIFICATION",
    bgUrl:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Mza3DCarousel({
  items = STUDIO_ITEMS,
  transitionMs = 900,
  interval = 5000,
  gap = 56,
  peek = 0.15,
  rotateY = 24,
  zDepth = 250,
  scaleDrop = 0.14,
  blurMax = 5.0,
  activeLeftBias = 0.0, // Hard center symmetry lines
  keyboard = true,
}) {
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const n = items.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [dimensions, setDimensions] = useState({
    slideW: 980,
    pagSpace: 110,
    cardH: 580,
  });
  const [isFirefox, setIsFirefox] = useState(false);

  const stateRef = useRef({
    index: 0,
    pos: 0,
    dragging: false,
    pointerId: null,
    x0: 0,
    v: 0,
    t0: 0,
    animating: false,
    hovering: false,
    startTime: 0,
    pausedAt: 0,
    tiltX: 0,
    tiltY: 0,
  });

  const currentOpts = {
    gap,
    peek,
    rotateY,
    zDepth,
    scaleDrop,
    blurMax,
    activeLeftBias,
  };

  useEffect(() => {
    setIsFirefox(
      typeof window !== "undefined" &&
        navigator.userAgent.toLowerCase().includes("firefox"),
    );
    stateRef.current.startTime = performance.now();
  }, []);

  // Sync Global Runtime Progress bar updates safely
  useEffect(() => {
    let rafId;
    const step = (t) => {
      const state = stateRef.current;
      if (!state.dragging && !state.hovering && !state.animating) {
        const elapsed = t - state.startTime;
        const progress = Math.min(1, elapsed / interval);

        if (rootRef.current) {
          const bar = rootRef.current.querySelector(".mza-prog-bar");
          if (bar) bar.style.transform = `scaleX(${progress})`;
        }
        if (elapsed >= interval) handleNext();
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [interval, dimensions.slideW]);

  useEffect(() => {
    if (!viewportRef.current || !rootRef.current) return;

    const measureLayout = () => {
      const viewRect = viewportRef.current.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      const pag = rootRef.current.querySelector(".mza-pagination");
      const pagRect = pag
        ? pag.getBoundingClientRect()
        : { height: 40, bottom: 0 };

      const bottomGap = Math.max(
        32,
        Math.round(rootRect.bottom - pagRect.bottom),
      );
      const pagSpace = pagRect.height + bottomGap;
      const availH = viewRect.height - pagSpace;
      const cardH = Math.max(380, Math.min(640, Math.round(availH * 0.78)));

      let runPeek = peek;
      let runGap = gap;
      if (window.innerWidth <= 1200) {
        runPeek = 0.08;
        runGap = 36;
      }
      if (window.innerWidth <= 768) {
        runPeek = 0.01;
        runGap = 20;
      }

      const slideW = Math.min(980, viewRect.width * (1 - runPeek * 2));
      setDimensions({ slideW, pagSpace, cardH });
    };

    measureLayout();
    const ro = new ResizeObserver(measureLayout);
    ro.observe(viewportRef.current);
    window.addEventListener("orientationchange", measureLayout);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measureLayout);
    };
  }, [peek, gap]);

  const renderFrame = (markActive = false) => {
    if (!rootRef.current) return;
    const slides = rootRef.current.querySelectorAll(".mza-slide");
    if (!slides.length) return;

    const state = stateRef.current;
    const span = dimensions.slideW + currentOpts.gap;

    let runRotateY = currentOpts.rotateY;
    let runZDepth = currentOpts.zDepth;
    let runScaleDrop = currentOpts.scaleDrop;
    let runLeftBias = currentOpts.activeLeftBias;

    if (window.innerWidth <= 1200) {
      runRotateY = 16;
      runZDepth = 180;
      runScaleDrop = 0.12;
    }
    if (window.innerWidth <= 768) {
      runRotateY = 6;
      runZDepth = 80;
      runScaleDrop = 0.08;
    }

    if (isFirefox) {
      runRotateY = 2;
      runZDepth = 0;
    }

    for (let i = 0; i < n; i++) {
      let d = i - state.pos;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;

      const weight = Math.max(0, 1 - Math.abs(d) * 2);
      const biasActive = -dimensions.slideW * runLeftBias * weight;
      const tx = d * span + biasActive;
      const depth = -Math.abs(d) * runZDepth;
      const rot = -d * runRotateY;
      const scale = 1 - Math.min(Math.abs(d) * runScaleDrop, 0.35);
      const blur = Math.min(
        Math.abs(d) * currentOpts.blurMax,
        currentOpts.blurMax,
      );
      const zIndex = Math.round(1000 - Math.abs(d) * 10);

      const s = slides[i];
      if (!s) continue;

      if (isFirefox) {
        s.style.transform = `translate(${tx}px,-50%) scale(${scale})`;
        s.style.filter = "none";
      } else {
        s.style.transform = `translate3d(${tx}px,-50%,${depth}px) rotateY(${rot}deg) scale(${scale})`;
        s.style.filter = `blur(${blur}px)`;
      }
      s.style.zIndex = `${zIndex}`;

      if (markActive) {
        s.setAttribute(
          "data-state",
          Math.round(state.index) === i ? "active" : "rest",
        );
      }

      const card = s.querySelector(".mza-card");
      if (card) {
        const parBase = Math.max(-1, Math.min(1, -d));
        const parX = parBase * 16 + state.tiltY * 0.6;
        const parY = state.tiltX * -0.5;
        card.style.setProperty("--mzaParX", `${parX.toFixed(2)}px`);
        card.style.setProperty("--mzaParY", `${parY.toFixed(2)}px`);
      }
    }
  };

  useEffect(() => {
    renderFrame(true);
  }, [dimensions, isFirefox]);

  const mod = (i, total) => ((i % total) + total) % total;
  const getNearestTarget = (from, target) => {
    let d = target - Math.round(from);
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return Math.round(from) + d;
  };

  const goTo = (targetIndex, animate = true) => {
    const state = stateRef.current;

    // INSTANT PROGRESS CLEARANCE: Prevents timelines from hanging during transition phases
    if (rootRef.current) {
      const bar = rootRef.current.querySelector(".mza-prog-bar");
      if (bar) bar.style.transform = `scaleX(0)`;
    }

    const start = state.pos;
    const end = getNearestTarget(start, targetIndex);
    const duration = animate ? transitionMs : 0;
    const t0 = performance.now();

    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);
    state.animating = true;

    const animateStep = (now) => {
      const timeProgress = Math.min(1, (now - t0) / duration);
      const computedProgress = duration ? easeOutQuart(timeProgress) : 1;

      state.pos = start + (end - start) * computedProgress;
      renderFrame();

      if (timeProgress < 1) {
        requestAnimationFrame(animateStep);
      } else {
        state.index = mod(Math.round(state.pos), n);
        state.pos = state.index;
        state.animating = false;
        setActiveIndex(state.index);
        renderFrame(true);
        // INSTANT CLOCK RESET: Locks timeline engine fresh right on frame completion
        state.startTime = performance.now();
      }
    };
    requestAnimationFrame(animateStep);
  };

  const handlePrev = () => goTo(mod(stateRef.current.index - 1, n));
  const handleNext = () => goTo(mod(stateRef.current.index + 1, n));

  useEffect(() => {
    if (!keyboard) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyboard, dimensions.slideW]);

  const onDragStart = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const state = stateRef.current;
    state.dragging = true;
    state.pointerId = e.pointerId;
    viewportRef.current.setPointerCapture(e.pointerId);
    state.x0 = e.clientX;
    state.t0 = performance.now();
    state.v = 0;
    state.pausedAt = performance.now();
  };

  const onDragMove = (e) => {
    const state = stateRef.current;
    if (!state.dragging || e.pointerId !== state.pointerId) return;
    const dx = e.clientX - state.x0;
    const dt = Math.max(16, performance.now() - state.t0);
    state.v = dx / dt;
    const slideSpan = dimensions.slideW + currentOpts.gap;
    state.pos = mod(state.index - dx / slideSpan, n);
    renderFrame();
  };

  const onDragEnd = (e) => {
    const state = stateRef.current;
    if (!state.dragging || (e && e.pointerId !== state.pointerId)) return;
    state.dragging = false;
    try {
      if (state.pointerId != null)
        viewportRef.current.releasePointerCapture(state.pointerId);
    } catch (_) {}
    if (state.pausedAt) {
      state.startTime += performance.now() - state.pausedAt;
      state.pausedAt = 0;
    }
    const v = state.v;
    let target = Math.round(
      state.pos - Math.sign(v) * (Math.abs(v) > 0.18 ? 0.5 : 0),
    );
    goTo(mod(target, n));
  };

  return (
    <div
      ref={rootRef}
      className="relative h-screen max-w-full mx-auto overflow-hidden select-none bg-[#070708]"
      style={{ contain: "layout paint", touchAction: "none" }}
      onMouseEnter={() => {
        stateRef.current.hovering = true;
        stateRef.current.pausedAt = performance.now();
      }}
      onMouseLeave={() => {
        const state = stateRef.current;
        if (state.pausedAt) {
          state.startTime += performance.now() - state.pausedAt;
          state.pausedAt = 0;
        }
        state.hovering = false;
      }}
    >
      {/* Structural Minimal Inset Frame Border Backdrop */}
      <div className="absolute inset-0 z-0 bg-[#0b0b0c] border-[24px] border-[#070708] max-md:border-[12px] pointer-events-none" />

      <div
        ref={viewportRef}
        tabIndex={0}
        className="relative z-10 outline-none overflow-hidden h-full cursor-grab active:cursor-grabbing"
        onPointerDown={onDragStart}
        onPointerMove={(e) => {
          if (!viewportRef.current) return;
          const r = viewportRef.current.getBoundingClientRect();
          stateRef.current.tiltX =
            ((e.clientY - r.top) / r.height - 0.5) * -2.0;
          stateRef.current.tiltY = ((e.clientX - r.left) / r.width - 0.5) * 2.0;
          onDragMove(e);
        }}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <div
          className="relative overflow-hidden"
          style={{
            height: `calc(100% - ${dimensions.pagSpace}px)`,
            transformStyle: "preserve-3d",
            perspective: "2200px",
          }}
        >
          {items.map((item, i) => {
            const isActive = activeIndex === i;
            return (
              <article
                key={i}
                className="mza-slide absolute top-[50%] left-1/2 -translate-x-1/2 grid place-items-center overflow-hidden"
                style={{
                  width: `${dimensions.slideW}px`,
                  height: `${dimensions.cardH}px`,
                  transformStyle: "preserve-3d",
                  willChange: "transform, filter",
                }}
                role="group"
                aria-label={`${i + 1} of ${n}`}
                data-state={isActive ? "active" : "rest"}
              >
                {/* Clean Geometric Fine-Edge Exhibition Canvas Card */}
                <div
                  className="mza-card group/card relative w-full h-full overflow-hidden bg-[#111112] border border-neutral-900 [transform:translateZ(0)]
                             before:content-[''] before:absolute before:inset-0 before:bg-cover before:bg-center before:opacity-[0.22] before:grayscale before:transition-all before:duration-[1000ms] before:ease-out group-hover/card:before:opacity-[0.42] group-hover/card:before:scale-[1.01] group-hover/card:before:grayscale-0
                             after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-t after:from-[#070708] after:via-[#070708]/65 after:to-transparent"
                  style={{ backgroundImage: `url('${item.bgUrl}')` }}
                >
                  {/* Absolute Corner Blueprint Reticle Layout Marks */}
                  <div className="absolute top-10 left-10 w-2 h-2 border-t border-l border-white/10 pointer-events-none" />
                  <div className="absolute top-10 right-10 w-2 h-2 border-t border-r border-white/10 pointer-events-none" />
                  <div className="absolute bottom-10 left-10 w-2 h-2 border-b border-l border-white/10 pointer-events-none" />
                  <div className="absolute bottom-10 right-10 w-2 h-2 border-b border-r border-white/10 pointer-events-none" />

                  {/* High-Contrast Floating Identity Watermark */}
                  <div className="absolute top-12 right-16 z-[2] font-mono text-[9rem] font-black leading-none tracking-tighter text-white/[0.015] group-hover/card:text-white/[0.035] transition-all duration-700 pointer-events-none select-none max-md:text-[4.5rem] max-md:top-8 max-md:right-10">
                    {(i + 1).toString().padStart(2, "0")}
                  </div>

                  {/* Fully Uncompressed Layout Text Frame Container */}
                  <div
                    className="absolute inset-0 p-20 max-md:p-12 z-[2] flex flex-col justify-between items-start transition-transform duration-500 ease-out will-change-transform"
                    style={{
                      transform: `translate3d(calc(var(--mzaParX, 0px) * 0.4), calc(var(--mzaParY, 0px) * 0.4), 0)`,
                    }}
                  >
                    {/* Top Content Block Group (Clean spacing architecture) */}
                    <div className="flex flex-col items-start gap-6 mt-auto">
                      <span className="text-xs font-mono tracking-[0.4em] text-neutral-100 uppercase">
                        {item.kicker}
                      </span>

                      <h2 className="m-0 font-light tracking-tight text-[clamp(28px,4.5vw,52px)] text-white leading-[1.05] text-balance">
                        {item.title}
                      </h2>

                      <p className="max-w-[48ch] text-[clamp(13px,1.3vw,15px)] font-normal text-neutral-400 leading-relaxed text-pretty mix-blend-plus-lighter max-sm:line-clamp-4">
                        {item.text}
                      </p>
                    </div>

                    {/* Premium Premium Action Trigger Button */}
                    <button
                      type="button"
                      className="mt-12 group/btn appearance-none bg-transparent border-0 p-0 flex items-center gap-4 text-xs font-mono tracking-[0.25em] text-white cursor-pointer relative"
                    >
                      <span className="relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] after:bg-white/20 group-hover/btn:after:bg-white transition-colors duration-300">
                        {item.btnText}
                      </span>
                      <span className="transform transition-transform duration-300 group-hover/btn:translate-x-1.5 text-neutral-400 group-hover/btn:text-white">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Modern Compact Floating Navigation Block Cluster */}
      <div className="absolute right-16 bottom-[42px] z-20 flex items-center gap-5 pointer-events-auto max-md:hidden font-mono text-xs">
        <button
          onClick={handlePrev}
          className="appearance-none border-0 bg-transparent text-neutral-500 hover:text-white cursor-pointer transition-colors p-1"
          aria-label="Previous slide"
        >
          PREV
        </button>
        <span className="w-[1px] h-3 bg-neutral-800" aria-hidden="true" />
        <span className="text-neutral-400 tracking-wider">
          {Math.min(n, activeIndex + 1)
            .toString()
            .padStart(2, "0")}{" "}
          / {n.toString().padStart(2, "0")}
        </span>
        <span className="w-[1px] h-3 bg-neutral-800" aria-hidden="true" />
        <button
          onClick={handleNext}
          className="appearance-none border-0 bg-transparent text-neutral-500 hover:text-white cursor-pointer transition-colors p-1"
          aria-label="Next slide"
        >
          NEXT
        </button>
      </div>

      {/* Symmetrical Inline Progress Line Indicators Track */}
      <div
        className="mza-pagination absolute left-16 bottom-[50px] flex gap-4 items-center z-20 max-md:left-1/2 max-md:-translate-x-1/2 max-md:bottom-8"
        role="tablist"
      >
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`h-[2px] transition-all duration-300 border-0 p-0 cursor-pointer ${
              activeIndex === i
                ? "w-14 bg-white"
                : "w-5 bg-neutral-800 hover:bg-neutral-600"
            }`}
            role="tab"
            aria-selected={activeIndex === i}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Top Edge True Symmetrical Loading Progress Timeline Bar */}
      <div
        className="absolute left-0 right-0 top-0 h-[2px] bg-neutral-950 z-30 overflow-hidden"
        aria-hidden="true"
      >
        <span className="mza-prog-bar block h-full w-full origin-left scale-x-0 will-change-transform bg-neutral-400" />
      </div>
    </div>
  );
}
