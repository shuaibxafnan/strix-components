"use client";

import { useEffect, useRef } from "react";

// ─── CoverflowCarousel ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// slides           array    [...]            Slide objects { title, kicker, text, buttonText, image }
// background       string    <gradient>      Page backdrop behind the cards
// fgColor          string   #e7ecf2          Base foreground / text color
// accentColor      string   #9ef7d2          Primary accent (kicker, button, dot)
// accent2Color     string   #82a0ff          Secondary accent (dot / progress gradient)
// glassColor       string   rgba(...)        Translucent card base fill
// glowColor        string   rgba(...)        Button glow shadow color
// gap              number   28               Px gap between slides in 3D layout
// peek             number   0.15             Side peek fraction (bounds slide width)
// rotateY          number   34               Degrees Y-rotation per unit distance
// zDepth           number   150              Px Z push-back per unit distance
// scaleDrop        number   0.09             Scale shrink per unit distance
// blurMax          number   2.0              Max blur (px) on far slides
// activeLeftBias   number   0.12             Leftward nudge of the active slide
// interval         number   4500             Autoplay dwell per slide (ms)
// transitionMs     number   900              Snap animation duration (ms)
// keyboard         boolean  true             Enable arrow-key navigation
// autoplay         boolean  true             Toggle auto-advance loop
// showArrows       boolean  true             Show prev/next buttons
// showDots         boolean  true             Show pagination dots
// showProgress     boolean  true             Show bottom progress bar
// prevIcon         string   ‹                Prev button glyph
// nextIcon         string   ›                Next button glyph
// breakpoints      array    [...]            Responsive engine-opt overrides
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    title: "Edge Visuals",
    kicker: "Design systems that breathe",
    text: "Build adaptive UI foundations with tokens, motion, and accessible color ramps. Ship faster without sameness.",
    buttonText: "See case study",
    image: "https://picsum.photos/id/1015/1600/1000",
  },
  {
    title: "Realtime Dashboards",
    kicker: "Signal over noise",
    text: "Stream metrics, smooth spikes, and highlight deltas. Clarity first, chrome last.",
    buttonText: "View live demo",
    image: "https://picsum.photos/id/1011/1600/1000",
  },
  {
    title: "Brand Motion",
    kicker: "Identity in motion",
    text: "Translate marks into kinetic systems. Timing, easing, and restraint create memory.",
    buttonText: "Explore reels",
    image: "https://picsum.photos/id/1018/1600/1000",
  },
  {
    title: "E-commerce UX",
    kicker: "Frictionless paths",
    text: "Model intent, compress choice, and keep the dopamine loop honest. Checkout in one breath.",
    buttonText: "See patterns",
    image: "https://picsum.photos/id/1021/1600/1000",
  },
  {
    title: "Content Engines",
    kicker: "Scale without sludge",
    text: "Structured content, image policy, and smart defaults. Publish daily, stay sharp.",
    buttonText: "Read playbook",
    image: "https://picsum.photos/id/1005/1600/1000",
  },
];

const DEFAULT_BREAKPOINTS = [
  {
    mq: "(max-width: 1200px)",
    gap: 24,
    peek: 0.12,
    rotateY: 28,
    zDepth: 120,
    scaleDrop: 0.08,
    activeLeftBias: 0.1,
  },
  {
    mq: "(max-width: 1000px)",
    gap: 18,
    peek: 0.09,
    rotateY: 22,
    zDepth: 90,
    scaleDrop: 0.07,
    activeLeftBias: 0.09,
  },
  {
    mq: "(max-width: 768px)",
    gap: 14,
    peek: 0.06,
    rotateY: 16,
    zDepth: 70,
    scaleDrop: 0.06,
    activeLeftBias: 0.08,
  },
  {
    mq: "(max-width: 560px)",
    gap: 12,
    peek: 0.05,
    rotateY: 12,
    zDepth: 60,
    scaleDrop: 0.05,
    activeLeftBias: 0.07,
  },
];

const DEFAULT_BACKGROUND =
  "radial-gradient(1200px 600px at 10% -10%, #1a2140 0%, transparent 40%)," +
  "radial-gradient(900px 600px at 110% 10%, #0e3d3f 0%, transparent 40%)," +
  "linear-gradient(180deg, #0a0d12 0%, #0c1117 100%)";

const CAROUSEL_CSS = `
.mzaCarousel, .mzaCarousel *, .mzaCarousel *::before, .mzaCarousel *::after {
  box-sizing: border-box;
}
.mzaCarousel {
  --mzaC-slideW: min(880px, 90vw);
  --mzaC-peek: 0.15;
  --mzaPagH: 64px;
  --mzaCardH: clamp(360px, 62vh, 600px);
  position: relative;
  height: 100vh;
  max-width: 100vw;
  margin: 0 auto;
  padding: 0 18px;
  overflow: hidden;
  contain: layout paint;
  touch-action: none;
  font: 16px/1.4 system-ui, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial;
}
.mzaCarousel-viewport {
  position: relative;
  outline: none;
  overflow: hidden;
  height: 100%;
}
.mzaCarousel-track {
  position: relative;
  height: calc(100% - var(--mzaPagH) - max(env(safe-area-inset-bottom), 12px));
  transform-style: preserve-3d;
  perspective: 1200px;
  overflow: hidden;
}
.mzaCarousel-slide {
  position: absolute;
  top: calc(50% + 5px);
  left: 50%;
  width: var(--mzaC-slideW);
  height: min(var(--mzaCardH), calc(100% - 50px));
  transform-style: preserve-3d;
  display: grid;
  place-items: center;
  border-radius: 22px;
  overflow: hidden;
  will-change: transform, filter;
}
.mzaCard {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
  background: var(--mzaC-glass);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  backdrop-filter: saturate(120%) blur(4px);
  transform: translateZ(0);
  cursor: grab;
}
.mzaCard::before {
  content: "";
  position: absolute;
  inset: -2%;
  background-image: var(--mzaCard-bg);
  background-size: cover;
  background-position: center;
  filter: contrast(1.02) saturate(1.08) brightness(0.9);
  transform: translateZ(-60px) scale(1.18)
    translate3d(var(--mzaParBgX, 0px), var(--mzaParBgY, 0px), 0);
  transition: transform 800ms cubic-bezier(0.2, 0.7, 0, 1),
    filter 800ms cubic-bezier(0.2, 0.7, 0, 1);
}
.mzaCard::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.25) 100%);
}
.mzaCard-head {
  position: absolute;
  inset: 20px auto auto 20px;
  z-index: 2;
}
.mzaCard-title {
  margin: 0;
  font-weight: 800;
  letter-spacing: 0.2px;
  font-size: clamp(22px, 3.1vw, 38px);
  text-shadow: 2px 2px 15px rgba(0, 0, 0, 0.6);
  line-height: 110%;
  cursor: text;
}
.mzaCard-kicker {
  margin: 0.5rem 0;
  color: var(--mzaC-accent);
  font-size: clamp(12px, 1.7vw, 14px);
  font-weight: 600;
  text-shadow: 1px 1px 10px rgba(0, 0, 0, 0.6);
  cursor: text;
}
.mzaCard-text {
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: absolute;
  inset: auto 20px 85px 20px;
  z-index: 2;
  max-width: 60ch;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 20px;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 10px;
  text-wrap: balance;
  cursor: text;
  color: #ddd;
}
.mzaCard-actions {
  position: absolute;
  inset: auto auto 18px 18px;
  z-index: 2;
}
.mzaBtn {
  appearance: none;
  border: 1px solid #9ef7d2;
  border-radius: 14px;
  padding: 15px 20px;
  font-weight: 700;
  color: #0b0e13;
  background-image: linear-gradient(180deg, #9ef7d2, #97ebc8, #8fe0be, #88d5b5, #81c9ab, #7abea2, #73b398, #6ca88f, #659d86, #5e937d, #588874, #517e6b);
  box-shadow: 0 3px 15px var(--mzaC-glow);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.mzaBtn:active {
  transform: translateY(1px);
  box-shadow: 0 3px 10px rgba(130, 160, 255, 0.25);
}
.mzaCarousel-controls {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}
.mzaCarousel-prev,
.mzaCarousel-next {
  pointer-events: auto;
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 0;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
  color: var(--mzaC-fg);
  font-size: 22px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.mzaCarousel-prev { margin-left: 6px; }
.mzaCarousel-next { margin-right: 6px; }
.mzaCarousel-prev:hover,
.mzaCarousel-next:hover { background: rgba(255, 255, 255, 0.14); }
.mzaCarousel-prev:active,
.mzaCarousel-next:active { transform: scale(0.98); }
.mzaCarousel-pagination {
  position: absolute;
  left: 0;
  right: 0;
  bottom: max(27px, env(safe-area-inset-bottom));
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}
.mzaCarousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  border: 0;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}
.mzaCarousel-dot[aria-selected="true"] {
  background: linear-gradient(180deg, var(--mzaC-accent2), var(--mzaC-accent));
  transform: scale(1.35);
}
.mzaCarousel-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  z-index: 9999;
  overflow: hidden;
}
.mzaCarousel-progressBar {
  display: block;
  height: 100%;
  width: 100%;
  transform-origin: left;
  transform: scaleX(0);
  will-change: transform;
  background: linear-gradient(90deg, var(--mzaC-accent), var(--mzaC-accent2));
}
.mzaCarousel-slide[data-state="active"] .mzaCard::before {
  filter: contrast(1.06) saturate(1.12) brightness(1.02);
}
.mzaCarousel-slide[data-state="active"] .mzaCard {
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}
.mzaPar-1, .mzaPar-2, .mzaPar-3 {
  will-change: transform;
  transition: transform 500ms cubic-bezier(0.2, 0.7, 0, 1);
}
.mzaPar-1 { transform: translate3d(calc(var(--mzaParX, 0px) * 0.35), calc(var(--mzaParY, 0px) * 0.35), 0); }
.mzaPar-2 { transform: translate3d(calc(var(--mzaParX, 0px) * 0.25), calc(var(--mzaParY, 0px) * 0.25), 0); }
.mzaPar-3 { transform: translate3d(calc(var(--mzaParX, 0px) * 0.18), calc(var(--mzaParY, 0px) * 0.18), 0); }
@media (max-width: 1000px) {
  .mzaCarousel { --mzaC-slideW: min(92vw, 620px); }
  .mzaCard-head { inset: 16px auto auto 16px; }
  .mzaCard-title { font-size: clamp(20px, 5.4vw, 30px); }
  .mzaCard-kicker { font-size: clamp(12px, 3.6vw, 13px); }
  .mzaCard-text { inset: auto 16px 62px 16px; }
}
@media (max-width: 768px) {
  .mzaCarousel { --mzaC-slideW: min(94vw, 560px); }
  .mzaCard-text, .mzaCard-title, .mzaCard-kicker { max-width: 45%; }
  .mzaCard-text::after {
    position: absolute;
    width: 100%;
    height: 100%;
    inset: 0;
    background-image: linear-gradient(0deg, rgba(0,0,0,1) 2%, rgba(0,0,0,0) 25%);
    content: "";
    z-index: 1;
  }
}
@media (max-width: 560px) {
  .mzaCarousel { --mzaC-slideW: min(96vw, 520px); }
}
@media (max-height: 400px) { .mzaCard-text { display: none; } }
@media (max-height: 280px) { .mzaCard-kicker { display: none; } }
@media (max-height: 240px) { .mzaBtn { display: none; } }
`;

function createCarousel(root, opts) {
  const ac = new AbortController();
  const signal = ac.signal;

  const eng = {
    root,
    viewport: root.querySelector(".mzaCarousel-viewport"),
    track: root.querySelector(".mzaCarousel-track"),
    slides: Array.from(root.querySelectorAll(".mzaCarousel-slide")),
    prevBtn: root.querySelector(".mzaCarousel-prev"),
    nextBtn: root.querySelector(".mzaCarousel-next"),
    pagination: root.querySelector(".mzaCarousel-pagination"),
    progressBar: root.querySelector(".mzaCarousel-progressBar"),
    isFF: typeof InstallTrigger !== "undefined",
    mediaHandlers: [],
    ro: null,
    dots: [],
  };
  eng.n = eng.slides.length;
  eng.opts = Object.assign({}, opts);
  if (eng.isFF) {
    eng.opts.rotateY = 10;
    eng.opts.zDepth = 0;
    eng.opts.blurMax = 0;
  }
  eng.state = {
    index: 0,
    pos: 0,
    width: 0,
    height: 0,
    gap: eng.opts.gap,
    dragging: false,
    pointerId: null,
    x0: 0,
    v: 0,
    t0: 0,
    animating: false,
    hovering: false,
    startTime: 0,
    pausedAt: 0,
    rafId: 0,
  };

  const mod = (i, n) => ((i % n) + n) % n;
  const nearest = (from, target) => {
    let d = target - Math.round(from);
    if (d > eng.n / 2) d -= eng.n;
    if (d < -eng.n / 2) d += eng.n;
    return Math.round(from) + d;
  };

  function preloadImages() {
    eng.slides.forEach((sl) => {
      const card = sl.querySelector(".mzaCard");
      const bg = getComputedStyle(card).getPropertyValue("--mzaCard-bg");
      const m = /url\((?:'|")?([^'")]+)(?:'|")?\)/.exec(bg);
      if (m && m[1]) {
        const img = new Image();
        img.src = m[1];
      }
    });
  }

  function setupDots() {
    eng.pagination.innerHTML = "";
    eng.dots = eng.slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mzaCarousel-dot";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      b.addEventListener("click", () => goTo(i), { signal });
      eng.pagination.appendChild(b);
      return b;
    });
  }

  function measure() {
    const viewRect = eng.viewport.getBoundingClientRect();
    const rootRect = eng.root.getBoundingClientRect();
    const pagRect = eng.pagination.getBoundingClientRect();
    const bottomGap = Math.max(
      12,
      Math.round(rootRect.bottom - pagRect.bottom),
    );
    const pagSpace = pagRect.height + bottomGap;
    const availH = viewRect.height - pagSpace;
    const cardH = Math.max(320, Math.min(640, Math.round(availH)));
    eng.state.width = viewRect.width;
    eng.state.height = viewRect.height;
    eng.state.gap = eng.opts.gap;
    eng.slideW = Math.min(880, eng.state.width * (1 - eng.opts.peek * 2));
    eng.root.style.setProperty("--mzaPagH", pagSpace + "px");
    eng.root.style.setProperty("--mzaCardH", cardH + "px");
  }

  function onTilt(e) {
    const r = eng.viewport.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - 0.5;
    const my = (e.clientY - r.top) / r.height - 0.5;
    eng.root.style.setProperty("--mzaTiltX", (my * -6).toFixed(3));
    eng.root.style.setProperty("--mzaTiltY", (mx * 6).toFixed(3));
  }

  function onDragStart(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    eng.state.dragging = true;
    eng.state.pointerId = e.pointerId;
    eng.viewport.setPointerCapture(e.pointerId);
    eng.state.x0 = e.clientX;
    eng.state.t0 = performance.now();
    eng.state.v = 0;
    eng.state.pausedAt = performance.now();
  }

  function onDragMove(e) {
    if (!eng.state.dragging || e.pointerId !== eng.state.pointerId) return;
    const dx = e.clientX - eng.state.x0;
    const dt = Math.max(16, performance.now() - eng.state.t0);
    eng.state.v = dx / dt;
    const slideSpan = eng.slideW + eng.state.gap;
    eng.state.pos = mod(eng.state.index - dx / slideSpan, eng.n);
    render();
  }

  function onDragEnd(e) {
    if (!eng.state.dragging || (e && e.pointerId !== eng.state.pointerId))
      return;
    eng.state.dragging = false;
    try {
      if (eng.state.pointerId != null)
        eng.viewport.releasePointerCapture(eng.state.pointerId);
    } catch (err) {}
    eng.state.pointerId = null;
    if (eng.state.pausedAt) {
      eng.state.startTime += performance.now() - eng.state.pausedAt;
      eng.state.pausedAt = 0;
    }
    const v = eng.state.v;
    const threshold = 0.18;
    const target = Math.round(
      eng.state.pos - Math.sign(v) * (Math.abs(v) > threshold ? 0.5 : 0),
    );
    goTo(mod(target, eng.n));
  }

  function startCycle() {
    eng.state.startTime = performance.now();
    renderProgress(0);
  }

  function loop() {
    const step = (t) => {
      if (!eng.state.dragging && !eng.state.hovering && !eng.state.animating) {
        const elapsed = t - eng.state.startTime;
        const p = Math.min(1, elapsed / eng.opts.interval);
        renderProgress(p);
        if (eng.opts.autoplay && elapsed >= eng.opts.interval) next();
      }
      eng.state.rafId = requestAnimationFrame(step);
    };
    eng.state.rafId = requestAnimationFrame(step);
  }

  function renderProgress(p) {
    eng.progressBar.style.transform =
      "scaleX(" + (eng.opts.autoplay ? p : 0) + ")";
  }

  function prev() {
    goTo(mod(eng.state.index - 1, eng.n));
  }
  function next() {
    goTo(mod(eng.state.index + 1, eng.n));
  }

  function goTo(i, animate = true) {
    const start = eng.state.pos || eng.state.index;
    const end = nearest(start, i);
    const dur = animate ? eng.opts.transitionMs : 0;
    const t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 4);
    eng.state.animating = true;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const p = dur ? ease(t) : 1;
      eng.state.pos = start + (end - start) * p;
      render();
      if (t < 1) requestAnimationFrame(step);
      else afterSnap(i);
    };
    requestAnimationFrame(step);
  }

  function afterSnap() {
    eng.state.index = mod(Math.round(eng.state.pos), eng.n);
    eng.state.pos = eng.state.index;
    eng.state.animating = false;
    render(true);
    startCycle();
  }

  function render(markActive = false) {
    const span = eng.slideW + eng.state.gap;
    const tiltX = parseFloat(
      eng.root.style.getPropertyValue("--mzaTiltX") || 0,
    );
    const tiltY = parseFloat(
      eng.root.style.getPropertyValue("--mzaTiltY") || 0,
    );
    for (let i = 0; i < eng.n; i++) {
      let d = i - eng.state.pos;
      if (d > eng.n / 2) d -= eng.n;
      if (d < -eng.n / 2) d += eng.n;
      const weight = Math.max(0, 1 - Math.abs(d) * 2);
      const biasActive = -eng.slideW * eng.opts.activeLeftBias * weight;
      const tx = d * span + biasActive;
      const depth = -Math.abs(d) * eng.opts.zDepth;
      const rot = -d * eng.opts.rotateY;
      const scale = 1 - Math.min(Math.abs(d) * eng.opts.scaleDrop, 0.42);
      const blur = Math.min(Math.abs(d) * eng.opts.blurMax, eng.opts.blurMax);
      const z = Math.round(1000 - Math.abs(d) * 10);
      const s = eng.slides[i];
      if (eng.isFF) {
        s.style.transform = "translate(" + tx + "px,-50%) scale(" + scale + ")";
        s.style.filter = "none";
      } else {
        s.style.transform =
          "translate3d(" +
          tx +
          "px,-50%," +
          depth +
          "px) rotateY(" +
          rot +
          "deg) scale(" +
          scale +
          ")";
        s.style.filter = "blur(" + blur + "px)";
      }
      s.style.zIndex = z;
      if (markActive)
        s.dataset.state = Math.round(eng.state.index) === i ? "active" : "rest";
      const card = s.querySelector(".mzaCard");
      const parBase = Math.max(-1, Math.min(1, -d));
      const parX = parBase * 48 + tiltY * 2.0;
      const parY = tiltX * -1.5;
      const bgX = parBase * -64 + tiltY * -2.4;
      card.style.setProperty("--mzaParX", parX.toFixed(2) + "px");
      card.style.setProperty("--mzaParY", parY.toFixed(2) + "px");
      card.style.setProperty("--mzaParBgX", bgX.toFixed(2) + "px");
      card.style.setProperty("--mzaParBgY", (parY * 0.35).toFixed(2) + "px");
    }
    const active = mod(Math.round(eng.state.pos), eng.n);
    eng.dots.forEach((dot, i) =>
      dot.setAttribute("aria-selected", i === active ? "true" : "false"),
    );
  }

  function bind() {
    if (eng.prevBtn) eng.prevBtn.addEventListener("click", prev, { signal });
    if (eng.nextBtn) eng.nextBtn.addEventListener("click", next, { signal });
    if (eng.opts.keyboard) {
      eng.root.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "ArrowLeft") prev();
          if (e.key === "ArrowRight") next();
        },
        { signal },
      );
    }
    const pe = eng.viewport;
    pe.addEventListener("pointerdown", onDragStart, { signal });
    pe.addEventListener("pointermove", onDragMove, { signal });
    pe.addEventListener("pointerup", onDragEnd, { signal });
    pe.addEventListener("pointercancel", onDragEnd, { signal });
    eng.root.addEventListener(
      "mouseenter",
      () => {
        eng.state.hovering = true;
        eng.state.pausedAt = performance.now();
      },
      { signal },
    );
    eng.root.addEventListener(
      "mouseleave",
      () => {
        if (eng.state.pausedAt) {
          eng.state.startTime += performance.now() - eng.state.pausedAt;
          eng.state.pausedAt = 0;
        }
        eng.state.hovering = false;
      },
      { signal },
    );
    eng.ro = new ResizeObserver(() => measure());
    eng.ro.observe(eng.viewport);
    eng.opts.breakpoints.forEach((bp) => {
      const m = window.matchMedia(bp.mq);
      const apply = () => {
        Object.keys(bp).forEach((k) => {
          if (k !== "mq") eng.opts[k] = bp[k];
        });
        measure();
        render();
      };
      m.addEventListener("change", apply);
      eng.mediaHandlers.push({ m, apply });
      if (m.matches) apply();
    });
    eng.viewport.addEventListener("pointermove", onTilt, { signal });
    window.addEventListener(
      "orientationchange",
      () => setTimeout(() => measure(), 250),
      { signal },
    );
  }

  setupDots();
  bind();
  preloadImages();
  measure();
  goTo(0, false);
  startCycle();
  loop();

  return {
    destroy() {
      ac.abort();
      cancelAnimationFrame(eng.state.rafId);
      if (eng.ro) eng.ro.disconnect();
      eng.mediaHandlers.forEach(({ m, apply }) =>
        m.removeEventListener("change", apply),
      );
      eng.pagination.innerHTML = "";
    },
  };
}

export default function CoverflowCarousel({
  slides = DEFAULT_SLIDES,
  background = DEFAULT_BACKGROUND,
  fgColor = "#e7ecf2",
  accentColor = "#9ef7d2",
  accent2Color = "#82a0ff",
  glassColor = "rgba(255, 255, 255, 0.06)",
  glowColor = "rgba(130, 160, 255, 0.75)",
  gap = 28,
  peek = 0.15,
  rotateY = 34,
  zDepth = 150,
  scaleDrop = 0.09,
  blurMax = 2.0,
  activeLeftBias = 0.12,
  interval = 4500,
  transitionMs = 900,
  keyboard = true,
  autoplay = true,
  showArrows = true,
  showDots = true,
  showProgress = true,
  prevIcon = "‹",
  nextIcon = "›",
  breakpoints = DEFAULT_BREAKPOINTS,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current || slides.length === 0) return;
    const instance = createCarousel(rootRef.current, {
      gap,
      peek,
      rotateY,
      zDepth,
      scaleDrop,
      blurMax,
      activeLeftBias,
      interval,
      transitionMs,
      keyboard,
      autoplay,
      breakpoints,
    });
    return () => instance.destroy();
  }, [
    slides.length,
    gap,
    peek,
    rotateY,
    zDepth,
    scaleDrop,
    blurMax,
    activeLeftBias,
    interval,
    transitionMs,
    keyboard,
    autoplay,
    breakpoints,
  ]);

  const rootStyle = {
    background,
    color: fgColor,
    "--mzaC-fg": fgColor,
    "--mzaC-accent": accentColor,
    "--mzaC-accent2": accent2Color,
    "--mzaC-glass": glassColor,
    "--mzaC-glow": glowColor,
  };

  return (
    <div
      ref={rootRef}
      className="mzaCarousel"
      style={rootStyle}
      aria-roledescription="carousel"
      aria-label="Featured cards"
    >
      <style>{CAROUSEL_CSS}</style>

      <div className="mzaCarousel-viewport" tabIndex={0}>
        <div className="mzaCarousel-track">
          {slides.map((s, i) => (
            <article
              key={i}
              className="mzaCarousel-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={i + 1 + " of " + slides.length}
            >
              <div
                className="mzaCard"
                style={{ "--mzaCard-bg": "url('" + s.image + "')" }}
              >
                <header className="mzaCard-head mzaPar-1">
                  <h2 className="mzaCard-title">{s.title}</h2>
                  <p className="mzaCard-kicker">{s.kicker}</p>
                </header>
                <p className="mzaCard-text mzaPar-2">{s.text}</p>
                <footer className="mzaCard-actions mzaPar-3">
                  <button className="mzaBtn">{s.buttonText}</button>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </div>

      {showArrows && (
        <div className="mzaCarousel-controls" aria-label="Controls">
          <button
            className="mzaCarousel-prev"
            aria-label="Previous slide"
            type="button"
          >
            {prevIcon}
          </button>
          <button
            className="mzaCarousel-next"
            aria-label="Next slide"
            type="button"
          >
            {nextIcon}
          </button>
        </div>
      )}

      {showDots && (
        <div
          className="mzaCarousel-pagination"
          role="tablist"
          aria-label="Slide navigation"
        />
      )}

      {showProgress && (
        <div className="mzaCarousel-progress" aria-hidden="true">
          <span className="mzaCarousel-progressBar" />
        </div>
      )}
    </div>
  );
}
