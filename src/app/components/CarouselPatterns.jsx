"use client";

import { useEffect, useRef } from "react";

// ─── CarouselPatterns ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// images              array    see IMAGE_DEFAULTS  Array of image URLs (12 items)
// bgColor             string   "#111111"           Page background color
// cardWidth           number   430                 Card width in px
// cardHeight          number   610                 Card height in px
// cardRadius          number   6                   Card border radius in px
// wheelRadius         number   35                  Circle radius as % of viewport
// totalCards          number   12                  Number of cards to render
// showCardNumbers     boolean  true                Show 001/002/... label on cards
// transitionDuration  number   1.2                 Pattern transition duration (s)
// fontFamily          string   see below           CSS font-family for all text
// ──────────────────────────────────────────────────────────────────────────────

const IMAGE_DEFAULTS = [
  "https://assets.codepen.io/7558/bw-portrait-001.jpg",
  "https://assets.codepen.io/7558/bw-portrait-002.jpg",
  "https://assets.codepen.io/7558/bw-portrait-003.jpg",
  "https://assets.codepen.io/7558/bw-portrait-004.jpg",
  "https://assets.codepen.io/7558/bw-portrait-005.jpg",
  "https://assets.codepen.io/7558/bw-portrait-006.jpg",
  "https://assets.codepen.io/7558/bw-portrait-007.jpg",
  "https://assets.codepen.io/7558/bw-portrait-008.jpg",
  "https://assets.codepen.io/7558/bw-portrait-009.jpg",
  "https://assets.codepen.io/7558/bw-portrait-010.jpg",
  "https://assets.codepen.io/7558/bw-portrait-011.jpg",
  "https://assets.codepen.io/7558/bw-portrait-012.jpg",
];

// ── Patterns shown in the switch bar (order is preserved) ────────────────────
const PATTERNS = ["circle", "wave", "stagger", "grid", "fan", "depth"];

// ─── loadScript ───────────────────────────────────────────────────────────────
// Injects a <script> tag once; resolves when loaded. Never uses import() so
// Turbopack never tries to bundle external CDN URLs at build time.
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-cdn="${src}"]`);
    if (existing) {
      if (existing.dataset.ready === "1") resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(`Failed: ${src}`)),
          { once: true },
        );
      }
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-cdn", src);
    el.onload = () => {
      el.dataset.ready = "1";
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });

// ─── CarouselPatterns ─────────────────────────────────────────────────────────
export default function CarouselPatterns({
  images = IMAGE_DEFAULTS,
  bgColor = "#111111",
  cardWidth = 430,
  cardHeight = 610,
  cardRadius = 6,
  wheelRadius = 35,
  totalCards = 12,
  showCardNumbers = true,
  transitionDuration = 1.2,
  fontFamily = "'TheGoodMonolith', 'Courier New', monospace",
}) {
  const containerRef = useRef(null);
  const itemsRef = useRef(null);
  const switchRef = useRef(null);

  // ── All mutable GSAP state lives here — never in React state ─────────────
  const stateRef = useRef({
    currentAnimation: "circle",
    isTransitioning: false,
    activeAnimations: [],
    draggableInstance: null,
    originalZIndices: [],
  });

  // ── Font injection ────────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("carousel-fonts")) return;
    const link = document.createElement("link");
    link.id = "carousel-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/thegoodmonolith";
    document.head.appendChild(link);
  }, []);

  // ── Main GSAP init ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Load GSAP + Draggable + InertiaPlugin via script tags (Turbopack-safe)
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js",
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/Draggable.min.js",
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/InertiaPlugin.min.js",
        );
        if (cancelled) return;

        const { gsap, Draggable, InertiaPlugin } = window;
        gsap.registerPlugin(Draggable, InertiaPlugin);
        gsap.config({ trialWarn: false });

        const st = stateRef.current;
        const carouselItemsEl = itemsRef.current;
        const carouselContainerEl = containerRef.current;
        const switchEl = switchRef.current;

        if (!carouselItemsEl || !carouselContainerEl) return;

        // ── Helpers ──────────────────────────────────────────────────────────

        const getViewport = () => ({
          width: window.innerWidth,
          height: window.innerHeight,
        });

        const getCards = () => gsap.utils.toArray(".cp-card");

        const killActive = () => {
          gsap.killTweensOf(carouselItemsEl);
          gsap.killTweensOf(".cp-card");
          st.activeAnimations.forEach((a) => a?.kill?.());
          st.activeAnimations = [];
        };

        const initZIndices = () => {
          getCards().forEach((card, i) => {
            const z = 100 + (totalCards - i);
            gsap.set(card, { zIndex: z });
            st.originalZIndices[i] = z;
          });
        };

        const restoreZIndices = () => {
          getCards().forEach((card, i) => {
            if (st.originalZIndices[i] !== undefined)
              gsap.set(card, { zIndex: st.originalZIndices[i] });
          });
        };

        // ── updateMenuState — highlight active button ─────────────────────
        const updateMenuState = (pattern) => {
          if (!switchEl) return;
          switchEl.querySelectorAll(".cp-btn").forEach((btn) => {
            btn.classList.toggle(
              "cp-btn-active",
              btn.dataset.pattern === pattern,
            );
          });
        };

        // ── setupDraggable ────────────────────────────────────────────────
        const setupDraggable = () => {
          if (st.draggableInstance) {
            st.draggableInstance.kill();
            st.draggableInstance = null;
          }
          carouselItemsEl.style.cursor = "grab";

          st.draggableInstance = Draggable.create(carouselItemsEl, {
            type: "rotation",
            inertia: true,
            throwResistance: 0.3,
            snap: (v) => v,
            onDrag: updateCardRotations,
            onThrowUpdate: updateCardRotations,
          })[0];
        };

        // ── updateCardRotations — called during drag ───────────────────────
        function updateCardRotations() {
          if (st.isTransitioning) return;
          const rot = this.rotation || 0;
          const cards = getCards();
          if (st.currentAnimation === "circle") {
            cards.forEach((c) => gsap.set(c, { rotation: -rot }));
          } else if (st.currentAnimation === "fan") {
            const vp = getViewport();
            const maxFan = Math.min(180, vp.width / 5);
            cards.forEach((c, i) => {
              const progress = i / (totalCards - 1);
              const angle = -maxFan / 2 + progress * maxFan;
              gsap.set(c, { rotation: angle - rot });
            });
          }
        }

        // ── Pattern position helpers ──────────────────────────────────────

        const setupCirclePositions = (animated = true) => {
          const cards = getCards();
          const vp = Math.min(window.innerWidth, window.innerHeight);
          const radius = vp * (wheelRadius / 100);
          const angleStep = (2 * Math.PI) / totalCards;
          const currentRot =
            (gsap.getProperty(carouselItemsEl, "rotation") || 0) *
            (Math.PI / 180);
          const tl = gsap.timeline();
          cards.forEach((card, i) => {
            const angle = i * angleStep + currentRot;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const props = {
              x,
              y,
              rotation: -(gsap.getProperty(carouselItemsEl, "rotation") || 0),
              scale: 0.8,
            };
            if (animated)
              tl.to(
                card,
                {
                  ...props,
                  duration: transitionDuration,
                  ease: "power2.inOut",
                },
                0,
              );
            else gsap.set(card, props);
          });
          return tl;
        };

        const setupWavePositions = () => {
          const cards = getCards();
          const vp = getViewport();
          const spacing =
            Math.min(vp.width * 0.8, totalCards * cardWidth * 0.4) /
            (totalCards - 1);
          const waveH = Math.min(vp.height * 0.1, 80);
          const tl = gsap.timeline();
          cards.forEach((card, i) => {
            const x = (i - (totalCards - 1) / 2) * spacing;
            const y = Math.sin((i / (totalCards - 1)) * Math.PI * 2) * waveH;
            tl.to(
              card,
              {
                x,
                y,
                rotation: 0,
                scale: 0.7,
                duration: transitionDuration,
                ease: "power2.inOut",
              },
              0,
            );
          });
          return tl;
        };

        const startWaveAnimation = () => {
          const cards = getCards();
          const waveH = Math.min(getViewport().height * 0.1, 80);
          return gsap.to(cards, {
            y: (i) =>
              Math.sin((i / (totalCards - 1)) * Math.PI * 2 + Math.PI) * waveH,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        };

        const setupStaggerPositions = () => {
          const cards = getCards();
          const cols = 4,
            rows = 3;
          const xSp = cardWidth * 0.7,
            ySp = cardHeight * 0.7;
          const tl = gsap.timeline();
          cards.forEach((card, i) => {
            const row = Math.floor(i / cols),
              col = i % cols;
            const xOff = row % 2 === 1 ? xSp / 2 : 0;
            tl.to(
              card,
              {
                x: (col - (cols - 1) / 2) * xSp + xOff,
                y: (row - (rows - 1) / 2) * ySp,
                rotation: 0,
                scale: 0.7,
                duration: transitionDuration,
                ease: "power2.inOut",
              },
              0,
            );
          });
          return tl;
        };

        const setupStaggerMouseTracking = () => {
          const cols = 4,
            rows = 3;
          const xSp = cardWidth * 0.7,
            ySp = cardHeight * 0.7;
          carouselContainerEl.onmousemove = (e) => {
            if (st.currentAnimation !== "stagger" || st.isTransitioning) return;
            const offset = (e.clientY / window.innerHeight - 0.5) * -40;
            getCards().forEach((card, i) => {
              const row = Math.floor(i / cols),
                col = i % cols;
              const xOff = row % 2 === 1 ? xSp / 2 : 0;
              gsap.to(card, {
                y: (row - (rows - 1) / 2) * ySp + offset,
                duration: 0.8,
                ease: "power2.out",
              });
            });
          };
        };

        const setupGridPositions = () => {
          const cards = getCards();
          const vp = getViewport();
          const isLandscape = vp.width / vp.height > 1;
          const rows = isLandscape ? 3 : 4,
            cols = isLandscape ? 4 : 3;
          const scale = Math.min(
            0.8,
            vp.width / (cols * cardWidth * 1.2),
            vp.height / (rows * cardHeight * 1.2),
          );
          const xSp = cardWidth * scale * 1.2,
            ySp = cardHeight * scale * 1.2;
          const tl = gsap.timeline();
          cards.forEach((card, i) => {
            const col = i % cols,
              row = Math.floor(i / cols);
            tl.to(
              card,
              {
                x: (col - (cols - 1) / 2) * xSp,
                y: (row - (rows - 1) / 2) * ySp,
                rotation: 0,
                scale,
                duration: transitionDuration,
                ease: "power2.inOut",
              },
              0,
            );
          });
          return tl;
        };

        const setupFanPositions = () => {
          const cards = getCards();
          const maxFan = Math.min(180, getViewport().width / 5);
          const tl = gsap.timeline();
          cards.forEach((card, i) => {
            const progress = i / (totalCards - 1);
            const angle = -maxFan / 2 + progress * maxFan;
            const yOffset = Math.sin((progress - 0.5) * Math.PI) * 50;
            tl.to(
              card,
              {
                x: 0,
                y: yOffset,
                rotation: angle,
                scale: 0.8,
                duration: transitionDuration,
                ease: "power2.inOut",
              },
              0,
            );
          });
          return tl;
        };

        const setup3DDepthPositions = () => {
          const cards = getCards();
          const vp = getViewport();
          const positions = [
            {
              x: -vp.width * 0.25,
              y: -vp.height * 0.2,
              z: -200,
              scale: 0.9,
              rotX: -5,
              rotY: 5,
            },
            {
              x: vp.width * 0.25,
              y: -vp.height * 0.25,
              z: -300,
              scale: 0.85,
              rotX: -3,
              rotY: -4,
            },
            {
              x: -vp.width * 0.3,
              y: vp.height * 0.2,
              z: -400,
              scale: 0.8,
              rotX: 4,
              rotY: 6,
            },
            {
              x: vp.width * 0.3,
              y: vp.height * 0.25,
              z: -500,
              scale: 0.75,
              rotX: 5,
              rotY: -5,
            },
            {
              x: 0,
              y: -vp.height * 0.3,
              z: -700,
              scale: 0.7,
              rotX: -6,
              rotY: 0,
            },
            {
              x: -vp.width * 0.35,
              y: 0,
              z: -800,
              scale: 0.65,
              rotX: 0,
              rotY: 7,
            },
            {
              x: vp.width * 0.35,
              y: 0,
              z: -900,
              scale: 0.6,
              rotX: 0,
              rotY: -7,
            },
            {
              x: 0,
              y: vp.height * 0.3,
              z: -1000,
              scale: 0.55,
              rotX: 6,
              rotY: 0,
            },
            {
              x: -vp.width * 0.2,
              y: -vp.height * 0.15,
              z: -1200,
              scale: 0.5,
              rotX: -3,
              rotY: 3,
            },
            {
              x: vp.width * 0.2,
              y: -vp.height * 0.15,
              z: -1300,
              scale: 0.45,
              rotX: -3,
              rotY: -3,
            },
            {
              x: -vp.width * 0.2,
              y: vp.height * 0.15,
              z: -1400,
              scale: 0.4,
              rotX: 3,
              rotY: 3,
            },
            {
              x: vp.width * 0.2,
              y: vp.height * 0.15,
              z: -1500,
              scale: 0.35,
              rotX: 3,
              rotY: -3,
            },
          ];
          const tl = gsap.timeline();
          cards.forEach((card, i) => {
            if (i >= positions.length) return;
            const p = positions[i];
            gsap.set(card, { zIndex: 1000 - Math.round(Math.abs(p.z)) });
            tl.to(
              card,
              {
                x: p.x,
                y: p.y,
                z: p.z,
                rotationX: p.rotX,
                rotationY: p.rotY,
                scale: p.scale,
                duration: transitionDuration,
                ease: "power2.inOut",
              },
              0,
            );
          });
          return tl;
        };

        const setup3DDepthMouseTracking = () => {
          carouselContainerEl.onmousemove = (e) => {
            if (st.currentAnimation !== "depth" || st.isTransitioning) return;
            const mx = e.clientX / window.innerWidth - 0.5;
            const my = e.clientY / window.innerHeight - 0.5;
            gsap.to(carouselItemsEl, {
              rotationY: mx * 3,
              rotationX: -my * 3,
              duration: 1.2,
              ease: "power1.out",
            });
          };
        };

        // ── transitionToPattern ───────────────────────────────────────────
        const transitionToPattern = (newPattern) => {
          if (st.isTransitioning) return;
          st.isTransitioning = true;

          updateMenuState(newPattern);
          killActive();

          const prevAnimation = st.currentAnimation;
          st.currentAnimation = newPattern;

          // Kill draggable and clear mouse tracking
          if (st.draggableInstance) {
            st.draggableInstance.kill();
            st.draggableInstance = null;
          }
          carouselItemsEl.style.cursor = "";
          carouselContainerEl.onmousemove = null;

          const tl = gsap.timeline({
            onComplete: () => {
              st.isTransitioning = false;
              if (newPattern === "circle" || newPattern === "fan")
                setupDraggable();
              else if (newPattern === "wave") {
                const a = startWaveAnimation();
                if (a) st.activeAnimations.push(a);
              } else if (newPattern === "stagger") setupStaggerMouseTracking();
              else if (newPattern === "depth") setup3DDepthMouseTracking();
            },
          });
          st.activeAnimations.push(tl);

          // If coming from fan, normalize rotations first for a clean start
          if (prevAnimation === "fan") {
            const norm = gsap.timeline();
            getCards().forEach((c) =>
              norm.to(
                c,
                {
                  rotation: 0,
                  rotationX: 0,
                  rotationY: 0,
                  duration: transitionDuration / 2,
                  ease: "power2.inOut",
                },
                0,
              ),
            );
            tl.add(norm);
            tl.to({}, { duration: 0.1 });
          }

          // Reset wheel rotation for non-rotational patterns
          if (newPattern !== "circle" && newPattern !== "fan") {
            if (prevAnimation === "circle" || prevAnimation === "fan") {
              tl.set(carouselItemsEl, { rotationX: 0, rotationY: 0 });
            } else {
              tl.set(carouselItemsEl, {
                rotation: 0,
                rotationX: 0,
                rotationY: 0,
              });
            }
          }

          // Animate wheel rotation to 0 when leaving circle/fan (except for circle↔fan)
          const needsRotReset =
            (prevAnimation === "circle" || prevAnimation === "fan") &&
            newPattern !== "circle" &&
            newPattern !== "fan";
          if (needsRotReset) {
            tl.to(
              carouselItemsEl,
              {
                rotation: 0,
                duration: transitionDuration,
                ease: "power2.inOut",
              },
              0,
            );
          }

          // Add the pattern-specific timeline
          const patternMap = {
            circle: setupCirclePositions,
            wave: setupWavePositions,
            stagger: setupStaggerPositions,
            grid: setupGridPositions,
            fan: setupFanPositions,
            depth: setup3DDepthPositions,
          };
          const patternTl = patternMap[newPattern]?.();
          if (patternTl) tl.add(patternTl, 0);

          // Depth needs z-indices updated
          if (newPattern !== "depth") restoreZIndices();
        };

        // ── initializeCarousel — stacked intro then circle ────────────────
        const initializeCarousel = () => {
          const cards = getCards();
          gsap.set(cards, { x: 0, y: 0, rotation: 0, scale: 0, opacity: 0 });
          gsap.set(switchEl, { opacity: 0, visibility: "hidden" });

          const tl = gsap.timeline({
            onComplete: () => {
              st.isTransitioning = false;
              setupDraggable();
              gsap.to(switchEl, {
                opacity: 1,
                visibility: "visible",
                duration: 0.8,
                ease: "power2.inOut",
              });
            },
          });

          // Cards appear stacked from last→first
          for (let i = 0; i < totalCards; i++) {
            gsap.set(cards[i], { zIndex: 100 + (totalCards - 1 - i) });
            tl.to(
              cards[i],
              { opacity: 1, scale: 0.8, duration: 0.5, ease: "power2.out" },
              (totalCards - 1 - i) * 0.1,
            );
          }

          tl.to({}, { duration: 0.3 });
          tl.add(setupCirclePositions(true));

          st.currentAnimation = "circle";
          st.activeAnimations.push(tl);
          updateMenuState("circle");
        };

        // ── resetCarousel ─────────────────────────────────────────────────
        const resetCarousel = () => {
          killActive();
          if (st.draggableInstance) {
            st.draggableInstance.kill();
            st.draggableInstance = null;
          }
          carouselContainerEl.onmousemove = null;
          carouselItemsEl.style.cursor = "";

          gsap.set(carouselItemsEl, {
            rotation: 0,
            rotationX: 0,
            rotationY: 0,
          });
          gsap.to(switchEl, {
            opacity: 0,
            visibility: "hidden",
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
              // Re-render cards by wiping and repopulating the container
              carouselItemsEl.innerHTML = generateCardsHTML();
              initZIndices();
              initializeCarousel();
            },
          });

          st.currentAnimation = "circle";
          st.isTransitioning = false;
          updateMenuState("circle");
        };

        // ── Wire up switch buttons ────────────────────────────────────────
        if (switchEl) {
          switchEl.querySelectorAll(".cp-btn").forEach((btn) => {
            const pattern = btn.dataset.pattern;
            if (pattern === "reset") {
              btn.addEventListener("click", resetCarousel);
            } else {
              btn.addEventListener("click", () => transitionToPattern(pattern));
            }
          });
        }

        // ── Resize ────────────────────────────────────────────────────────
        const onResize = () => {
          if (!st.isTransitioning) transitionToPattern(st.currentAnimation);
        };
        window.addEventListener("resize", onResize);

        // ── Kick off ──────────────────────────────────────────────────────
        initZIndices();
        initializeCarousel();

        stateRef.current._cleanup = () => {
          window.removeEventListener("resize", onResize);
          killActive();
          if (st.draggableInstance) {
            st.draggableInstance.kill();
            st.draggableInstance = null;
          }
        };
      } catch (e) {
        console.error("[CarouselPatterns] init failed:", e.message);
      }
    };

    init();
    return () => {
      cancelled = true;
      stateRef.current._cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Generate card HTML string — used both on mount and on reset ────────────
  const generateCardsHTML = () => {
    let html = "";
    for (let i = 0; i < totalCards; i++) {
      const imgUrl = images[i] ?? images[0];
      const num = String(i + 1).padStart(3, "0");
      html += `
        <div class="cp-card" style="
          position:absolute;
          width:${cardWidth}px;
          height:${cardHeight}px;
          border-radius:${cardRadius}px;
          overflow:hidden;
          box-shadow:0 4px 8px rgba(0,0,0,0.2);
          transform:translate(-50%,-50%);
          transform-origin:center center;
          user-select:none;
          cursor:pointer;
          background-size:cover;
          background-position:center;
          background-image:url(${imgUrl});
          z-index:${100 + (totalCards - i)};
        ">
          ${showCardNumbers ? `<div style="position:absolute;top:10px;left:10px;font-size:16px;color:rgba(255,255,255,0.8);z-index:10;font-weight:bold;text-shadow:0 1px 2px rgba(0,0,0,0);font-family:${fontFamily}">${num}</div>` : ""}
        </div>`;
    }
    return html;
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundColor: bgColor,
        fontFamily,
        color: "#f0f0f0",
        // Dotted background pattern
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "11px 11px",
      }}
    >
      {/* ── Carousel container — perspective for 3D depth mode ─────────────── */}
      <div
        ref={containerRef}
        className="fixed inset-0 flex items-center justify-center overflow-hidden select-none"
        style={{ perspective: "2500px" }}
      >
        {/* ── Carousel items wrapper — GSAP rotates this for circle/fan drag ── */}
        <div
          ref={itemsRef}
          className="absolute"
          style={{ top: "50%", left: "50%", transformOrigin: "center center" }}
          // Cards are injected imperatively so GSAP has full control over them.
          // We use dangerouslySetInnerHTML so the DOM matches what generateCards()
          // produces — safe here because all values come from controlled props.
          dangerouslySetInnerHTML={{ __html: generateCardsHTML() }}
        />
      </div>

      {/* ── Switch bar ────────────────────────────────────────────────────────── */}
      <div
        ref={switchRef}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-5 rounded-[4px] z-[1000] transition-[padding] duration-300 ease-in-out invisible opacity-0"
        style={{
          backgroundColor: "#222",
          padding: "10px 20px",
          // Subtle dot texture on the switch bar (matches original)
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 0)",
          backgroundSize: "7px 7px",
          backgroundPosition: "-1px -1px",
        }}
      >
        {/* RESET */}
        <button
          data-pattern="reset"
          className="cp-btn group relative bg-transparent border-none text-[#666] cursor-pointer text-[14px] px-[10px] py-[5px] transition-all duration-300 ease-in-out hover:text-[#f0f0f0]"
          style={{ fontFamily }}
        >
          <span className="absolute w-[5px] h-[5px] rounded-full bg-[#f0f0f0] opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-1/2 -translate-y-1/2 left-[-8px]" />
          RESET
        </button>

        {/* Pattern buttons */}
        {PATTERNS.map((pattern) => (
          <button
            key={pattern}
            data-pattern={pattern}
            className="cp-btn group relative bg-transparent border-none text-[#666] cursor-pointer text-[14px] px-[10px] py-[5px] transition-all duration-300 ease-in-out [&.cp-btn-active]:text-[#f0f0f0] hover:text-[#f0f0f0]"
            style={{ fontFamily }}
          >
            <span className="absolute w-[5px] h-[5px] rounded-full bg-[#f0f0f0] opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-1/2 -translate-y-1/2 left-[-8px]" />
            {pattern === "depth" ? "3D DEPTH" : pattern.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
