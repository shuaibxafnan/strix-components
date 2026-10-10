"use client";

import { useEffect, useRef } from "react";

// ─── VisualSilence ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// bgColor              string   "#0a0a0a"           Page background color
// logoText             string   "VISUAL SILENCE"    Logo text (space = separator)
// mysteriousMessage    string   see below           Bottom-left hint text
// duration             number   0.64                Card expand animation duration (s)
// flipDuration         number   0.8                 Flip card animation duration (s)
// showNoise            boolean  true                Film grain noise overlay
// cards                array    see CARD_DEFAULTS   Array of card objects
//   .image             string   url                 Card background image
//   .title             string   "THE SPACE BETWEEN" Card title
//   .subtitle          string   "Where movement..." Card subtitle
// flipCardIndex        number   6                   0-based index of the flip card
// flipCardQuote        string   see below           Quote shown on card back
// flipCardAuthor       string   "VS"                Author shown on card back
// categories           array    see below           Right-side category tags
// ──────────────────────────────────────────────────────────────────────────────

const CARD_DEFAULTS = [
  {
    image:
      "https://images.pexels.com/photos/36411473/pexels-photo-36411473.jpeg",
    title: "THE SPACE BETWEEN",
    subtitle: "Where movement reveals truth",
  },
  {
    image:
      "https://cdn.cosmos.so/c3aa56e7-ac0c-47aa-ab1d-26d4b5ee8948?format=jpeg",
    title: "CAPTURED STILLNESS",
    subtitle: "Motion suspended in time",
  },
  {
    image:
      "https://cdn.cosmos.so/0b0960ef-5e0a-4df5-8a08-44aa57b4cabc.?format=jpeg",
    title: "NEGATIVE PRESENCE",
    subtitle: "Finding meaning in absence",
  },
  {
    image:
      "https://cdn.cosmos.so/60509a1f-769c-4d50-bf6d-04e7de80c369?format=jpeg",
    title: "TEXTURE OF LIGHT",
    subtitle: "When shadows become tangible",
  },
  {
    image:
      "https://cdn.cosmos.so/a4131540-1ed8-41a8-84de-580b1327cbfd?format=jpeg",
    title: "MONOCHROME MEDITATION",
    subtitle: "Beyond what eyes perceive",
  },
  {
    image:
      "https://cdn.cosmos.so/49037a37-144f-4d11-8466-22e9e1c71797.?format=jpeg",
    title: "FORMLESS FORM",
    subtitle: "The geometry of feeling",
  },
  {
    image:
      "https://cdn.cosmos.so/fddfc757-d9c3-44f1-af6e-a607c3746738?format=jpeg",
    title: "SPATIAL SILENCE",
    subtitle: "Presence within emptiness",
  },
  {
    image:
      "https://cdn.cosmos.so/b0c8552f-2acf-4206-9086-a14e7ebcc0d2?format=jpeg",
    title: "LIMINAL THRESHOLD",
    subtitle: "Between known and unknown",
  },
  {
    image:
      "https://cdn.cosmos.so/d15e33c9-6306-4e93-9fc3-a11bca3be70a?format=jpeg",
    title: "ESSENTIAL HARMONY",
    subtitle: "The beauty of reduction",
  },
];

const CATEGORY_DEFAULTS = [
  "Movement",
  "Stillness",
  "Minimalism",
  "Negative Space",
  "Monochrome",
  "Essence",
  "Contrast",
  "Silence",
];

// ─── loadScript ───────────────────────────────────────────────────────────────
// Injects a <script> tag once; resolves on load. Never uses import() so
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

// ─── VisualSilence ────────────────────────────────────────────────────────────
export default function VisualSilence({
  bgColor = "#0a0a0a",
  logoText = "VISUAL SILENCE",
  mysteriousMessage = "The magic lies within the seventh frame...",
  duration = 0.64,
  flipDuration = 0.8,
  showNoise = true,
  cards = CARD_DEFAULTS,
  flipCardIndex = 6,
  flipCardQuote = "In the spaces between light and shadow, the unseen reveals itself. The photograph captures not just what is visible, but the mystery that lies beyond perception.",
  flipCardAuthor = "VS",
  categories = CATEGORY_DEFAULTS,
}) {
  // ── Refs — every element GSAP touches is a ref, never state ──────────────
  const gridRef = useRef(null);
  const centerCardRef = useRef(null);
  const centerImageRef = useRef(null);
  const categoriesRef = useRef(null);
  const categoryRefs = useRef([]);
  const mysteriousRef = useRef(null);
  const logoRef = useRef(null);
  const charRefs = useRef([]);
  const flipCardRef = useRef(null);
  const cardInnerRef = useRef(null);
  const cardRefs = useRef([]);
  const stateRef = useRef({ _cleanup: null });

  // ── Parse logo text into chars (split on first space → "VS" collapse) ────
  const parts = logoText.split(" ");
  const firstWord = parts[0] || "";
  const secondWord = parts.slice(1).join(" ");
  const logoChars = [
    ...firstWord
      .split("")
      .map((c, i) => ({ char: c, isSpacer: false, index: i })),
    { char: " ", isSpacer: true, index: firstWord.length },
    ...secondWord
      .split("")
      .map((c, i) => ({
        char: c,
        isSpacer: false,
        index: firstWord.length + 1 + i,
      })),
  ];
  const totalChars = logoChars.length;

  // ── Font injection ────────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("vs-fonts")) return;
    const link = document.createElement("link");
    link.id = "vs-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/pp-neue-montreal";
    document.head.appendChild(link);
  }, []);

  // ── Main GSAP init ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js",
        );
        if (cancelled) return;

        const { gsap, CustomEase } = window;
        gsap.config({ trialWarn: false });
        CustomEase.create("customEase", "0.86,0,0.07,1");

        const menuInDur = 0.64;
        const menuOutDur = 0.48;
        const charDur = 0.15;
        const finalMergeDur = 0.5;

        const gridEl = gridRef.current;
        const centerCardEl = centerCardRef.current;
        const centerImgEl = centerImageRef.current;
        const categoriesEl = categoriesRef.current;
        const mysteriousEl = mysteriousRef.current;
        const flipCardEl = flipCardRef.current;
        const cardInnerEl = cardInnerRef.current;
        const catEls = categoryRefs.current.filter(Boolean);

        if (!gridEl || !centerCardEl) return;

        gsap.set(catEls, { opacity: 0, y: 20, visibility: "hidden" });
        gsap.set(mysteriousEl, { opacity: 0 });

        // ── expandTimeline ─────────────────────────────────────────────
        const expandTimeline = gsap.timeline({ paused: true });

        const positions = [
          [0, 0, 0, 0],
          [0, "50%", -50, 0],
          [0, "100%", -100, 0],
          ["50%", 0, 0, -50],
          null,
          ["50%", "100%", -100, -50],
          ["100%", 0, 0, -100],
          ["100%", "50%", -50, -100],
          ["100%", "100%", -100, -100],
        ];

        positions.forEach((pos, i) => {
          if (!pos) return;
          const card = cardRefs.current[i];
          if (!card) return;
          expandTimeline.to(
            card,
            {
              top: pos[0],
              left: pos[1],
              xPercent: pos[2],
              yPercent: pos[3],
              opacity: 1,
              scale: 1,
              visibility: "visible",
              ease: "customEase",
              duration,
              delay: 0.05 + i * 0.05,
            },
            0,
          );
        });

        expandTimeline.to(
          mysteriousEl,
          { opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.6 },
          0,
        );

        // ── Center image zoom ──────────────────────────────────────────
        const centerZoom = gsap.timeline({ paused: true });
        centerZoom.to(centerImgEl, {
          scale: 1.08,
          duration,
          ease: "customEase",
        });

        // ── Logo collapse ──────────────────────────────────────────────
        const vCharEl = charRefs.current[0];
        const spacerEl = charRefs.current[firstWord.length];
        const sCharEl = charRefs.current[firstWord.length + 1];
        const hideSeq = [13, 5, 12, 4, 11, 3, 10, 2, 9, 1, 8].filter(
          (idx) => idx < totalChars,
        );
        const logoTl = gsap.timeline({ paused: true });

        hideSeq.forEach((idx, i) => {
          const el = charRefs.current[idx];
          if (!el) return;
          logoTl.to(
            el,
            {
              opacity: 0,
              filter: "blur(8px)",
              duration: charDur,
              ease: "customEase",
            },
            i * 0.05,
          );
        });
        if (spacerEl) {
          logoTl.to(
            spacerEl,
            {
              opacity: 0,
              filter: "blur(8px)",
              duration: charDur,
              ease: "customEase",
            },
            hideSeq.length * 0.05,
          );
        }

        const updateLogoMerge = () => {
          if (!vCharEl || !sCharEl) return;
          const vRect = vCharEl.getBoundingClientRect();
          const sRect = sCharEl.getBoundingClientRect();
          // Remove any previous merge tween before adding new one
          logoTl.to(
            sCharEl,
            {
              x: -(sRect.left - vRect.right),
              duration: finalMergeDur,
              ease: "customEase",
            },
            hideSeq.length * 0.05 + 0.05,
          );
        };
        requestAnimationFrame(updateLogoMerge);

        // ── Flip timelines ─────────────────────────────────────────────
        const flipTl = gsap.timeline({
          paused: true,
          onComplete: () => {
            st.isFlipping = false;
            st.isFlipped = true;
          },
        });
        flipTl
          .to(
            cardInnerEl,
            { rotationY: 900, duration: flipDuration, ease: "power2.inOut" },
            0,
          )
          .to(
            flipCardEl,
            { filter: "blur(8px)", duration: 0.2, ease: "power1.in" },
            0,
          )
          .to(
            flipCardEl,
            { filter: "blur(0px)", duration: 0.2, ease: "power1.out" },
            flipDuration - 0.2,
          );

        const flipBackTl = gsap.timeline({
          paused: true,
          onComplete: () => {
            st.isFlipping = false;
            st.isFlipped = false;
          },
        });
        flipBackTl
          .to(
            cardInnerEl,
            { rotationY: 0, duration: flipDuration, ease: "power2.inOut" },
            0,
          )
          .to(
            flipCardEl,
            { filter: "blur(8px)", duration: 0.2, ease: "power1.in" },
            0,
          )
          .to(
            flipCardEl,
            { filter: "blur(0px)", duration: 0.2, ease: "power1.out" },
            flipDuration - 0.2,
          );

        // ── Interaction state ──────────────────────────────────────────
        const st = {
          isExpanded: false,
          isHoveringGrid: false,
          isHoveringMenu: false,
          isHoveringFlip: false,
          isFlipping: false,
          isFlipped: false,
          menuAnim: null,
        };

        // ── Menu helpers ───────────────────────────────────────────────
        const showMenu = () => {
          st.menuAnim?.kill();
          st.menuAnim = gsap.timeline();
          st.menuAnim.staggerTo([...catEls].reverse(), menuInDur, {
            opacity: 1,
            y: 0,
            visibility: "visible",
            ease: "customEase",
            stagger: 0.08,
          });
        };
        const hideMenu = () => {
          st.menuAnim?.kill();
          st.menuAnim = gsap.timeline();
          st.menuAnim.staggerTo(catEls, menuOutDur, {
            opacity: 0,
            y: 20,
            visibility: "hidden",
            ease: "customEase",
            stagger: 0.05,
          });
        };

        // ── Expand / collapse ──────────────────────────────────────────
        const expandGrid = () => {
          if (st.isExpanded) return;
          st.isExpanded = true;
          expandTimeline.play();
          showMenu();
          centerZoom.play();
          logoTl.play();
        };
        const collapseGrid = () => {
          if (st.isHoveringGrid || st.isHoveringMenu || !st.isExpanded) return;
          st.isExpanded = false;
          expandTimeline.reverse();
          hideMenu();
          centerZoom.reverse();
          logoTl.reverse();
          if (st.isFlipped || st.isFlipping) {
            flipTl.kill();
            flipBackTl.kill();
            gsap.to(cardInnerEl, {
              rotationY: 0,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                st.isFlipped = false;
                st.isFlipping = false;
              },
            });
            gsap.to(flipCardEl, { filter: "blur(0px)", duration: 0.1 });
          }
        };

        // ── Flip helpers ───────────────────────────────────────────────
        const doFlip = () => {
          if (!st.isFlipping && !st.isFlipped) {
            st.isFlipping = true;
            flipTl.restart();
          }
        };
        const doFlipBack = () => {
          if (st.isFlipping || st.isFlipped) {
            flipTl.kill();
            st.isFlipping = true;
            flipBackTl.restart();
          }
        };

        // ── Event listeners ────────────────────────────────────────────
        const supportsHover = window.matchMedia("(hover: hover)").matches;

        if (supportsHover) {
          centerCardEl.addEventListener("mouseenter", () => {
            st.isHoveringGrid = true;
            expandGrid();
          });
          gridEl.addEventListener("mouseenter", () => {
            st.isHoveringGrid = true;
          });
          gridEl.addEventListener("mouseleave", () => {
            st.isHoveringGrid = false;
            setTimeout(collapseGrid, 50);
          });
          categoriesEl.addEventListener("mouseenter", () => {
            st.isHoveringMenu = true;
          });
          categoriesEl.addEventListener("mouseleave", () => {
            st.isHoveringMenu = false;
            setTimeout(collapseGrid, 50);
          });
          if (flipCardEl) {
            flipCardEl.addEventListener("mouseenter", () => {
              if (st.isExpanded) {
                st.isHoveringFlip = true;
                doFlip();
              }
            });
            flipCardEl.addEventListener("mouseleave", () => {
              st.isHoveringFlip = false;
              if (st.isExpanded) doFlipBack();
            });
          }
        } else {
          centerCardEl.addEventListener("click", () => {
            if (!st.isExpanded) expandGrid();
            else {
              st.isHoveringGrid = false;
              st.isHoveringMenu = false;
              collapseGrid();
            }
          });
          if (flipCardEl) {
            flipCardEl.addEventListener("click", () => {
              if (st.isExpanded && !st.isFlipping) {
                if (!st.isFlipped) doFlip();
                else doFlipBack();
              }
            });
          }
        }

        const onResize = () => {
          if (!st.isExpanded) updateLogoMerge();
        };
        window.addEventListener("resize", onResize);

        stateRef.current._cleanup = () => {
          window.removeEventListener("resize", onResize);
          expandTimeline.kill();
          centerZoom.kill();
          logoTl.kill();
          flipTl.kill();
          flipBackTl.kill();
        };
      } catch (e) {
        console.error("[VisualSilence] init failed:", e.message);
      }
    };

    init();
    return () => {
      cancelled = true;
      stateRef.current._cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Card size CSS value — reused in grid + each card ──────────────────────
  const cardSize = "min(calc((100vh - 12rem) / 3), calc((100vw - 12rem) / 3))";

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: bgColor,
        fontFamily: "'PP Neue Montreal', sans-serif",
        letterSpacing: "-0.02em",
      }}
    >
      {/* ── Keyframes ─────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes vs-noise {
          0%   { transform: translate(0,0); }
          10%  { transform: translate(-5%,-5%); }
          20%  { transform: translate(-10%,5%); }
          30%  { transform: translate(5%,-10%); }
          40%  { transform: translate(-5%,15%); }
          50%  { transform: translate(-10%,5%); }
          60%  { transform: translate(15%,0); }
          70%  { transform: translate(0,10%); }
          80%  { transform: translate(-15%,0); }
          90%  { transform: translate(10%,5%); }
          100% { transform: translate(5%,0); }
        }
      `}</style>

      {/* ── Film grain ────────────────────────────────────────────────────────── */}
      {showNoise && (
        <div
          className="fixed pointer-events-none"
          style={{
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background:
              "transparent url('http://assets.iceable.com/img/noise-transparent.png') repeat 0 0",
            backgroundSize: "300px 300px",
            animation: "vs-noise 0.3s steps(5) infinite",
            opacity: 0.5,
            willChange: "transform",
            zIndex: 500,
          }}
        />
      )}

      {/* ── Vignette ──────────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
          zIndex: 2,
        }}
      />

      {/* ── Grid ──────────────────────────────────────────────────────────────── */}
      <div
        ref={gridRef}
        className="relative"
        style={{
          width: `calc(3 * ${cardSize} + 2 * 3px)`,
          height: `calc(3 * ${cardSize} + 2 * 3px)`,
        }}
      >
        {cards.map((card, i) => {
          const isCenter = i === 4;
          const isFlip = i === flipCardIndex;

          return (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
                if (isCenter) centerCardRef.current = el;
                if (isFlip) flipCardRef.current = el;
              }}
              className="absolute overflow-hidden cursor-pointer"
              style={{
                width: cardSize,
                height: cardSize,
                // Sharp 4px radius — editorial, not bubbly
                borderRadius: "4px",
                // 1px hairline border — visible on dark bg, disappears into image
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#000",
                top: isCenter ? "50%" : "50%",
                left: isCenter ? "50%" : "50%",
                transform: isCenter
                  ? "translate(-50%,-50%) scale(1)"
                  : "translate(-50%,-50%) scale(0.6)",
                opacity: isCenter ? 1 : 0,
                visibility: isCenter ? "visible" : "hidden",
                zIndex: isCenter ? 10 : "auto",
                perspective: isFlip ? "1000px" : undefined,
              }}
            >
              {isFlip ? (
                // ── Flip card ───────────────────────────────────────────
                <div
                  ref={cardInnerRef}
                  className="relative w-full h-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      borderRadius: "4px",
                      zIndex: 2,
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Slim bottom bar — title floats on a thin frosted strip */}
                    <div
                      className="absolute bottom-0 left-0 w-full"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
                        padding: "1.25rem 1rem 1rem",
                      }}
                    >
                      <p className="text-[0.55rem] text-white/40 tracking-[0.18em] uppercase mb-[3px]">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="text-[0.8rem] text-white font-medium uppercase tracking-[0.06em] leading-tight">
                        {card.title}
                      </h2>
                      <p className="text-[0.7rem] text-white/50 mt-[2px]">
                        {card.subtitle}
                      </p>
                    </div>
                    {/* Hover: thin top-right corner accent */}
                    <div
                      className="absolute top-0 right-0 w-[28px] h-[28px] pointer-events-none"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.25)",
                        borderRight: "1px solid rgba(255,255,255,0.25)",
                        borderTopRightRadius: "4px",
                      }}
                    />
                  </div>

                  {/* Back — typographic quote treatment */}
                  <div
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderRadius: "4px",
                      background: "#0a0a0a",
                      border: "1px solid rgba(255,255,255,0.06)",
                      padding: "1.5rem",
                    }}
                  >
                    {/* Oversized decorative quotation mark */}
                    <span
                      className="block text-white/[0.04] leading-none select-none pointer-events-none"
                      style={{
                        fontSize: "8rem",
                        fontFamily: "Georgia, serif",
                        lineHeight: 1,
                        marginTop: "-0.5rem",
                        marginLeft: "-0.2rem",
                      }}
                    >
                      "
                    </span>
                    <div>
                      <p className="text-white/70 text-[0.75rem] leading-[1.65] font-light mb-4">
                        {flipCardQuote}
                      </p>
                      {/* Author with thin rule above */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-1 h-px"
                          style={{ background: "rgba(255,255,255,0.12)" }}
                        />
                        <span className="text-white/40 text-[0.6rem] tracking-[0.2em] uppercase">
                          {flipCardAuthor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // ── Regular card ────────────────────────────────────────
                <>
                  <img
                    ref={isCenter ? centerImageRef : undefined}
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
                      padding: "1.25rem 1rem 1rem",
                    }}
                  >
                    <p className="text-[0.55rem] text-white/40 tracking-[0.18em] uppercase mb-[3px]">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="text-[0.8rem] text-white font-medium uppercase tracking-[0.06em] leading-tight">
                      {card.title}
                    </h2>
                    <p className="text-[0.7rem] text-white/50 mt-[2px]">
                      {card.subtitle}
                    </p>
                  </div>
                  {/* Corner accent on every card */}
                  <div
                    className="absolute top-0 right-0 w-[28px] h-[28px] pointer-events-none"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.18)",
                      borderRight: "1px solid rgba(255,255,255,0.18)",
                      borderTopRightRadius: "4px",
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Categories — right edge, numbered with left bar ───────────────────── */}
      <div
        ref={categoriesRef}
        className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col"
        style={{ zIndex: 200, gap: "1px" }}
      >
        {categories.map((cat, i) => (
          <div
            key={i}
            ref={(el) => {
              categoryRefs.current[i] = el;
            }}
            className="flex items-center gap-3 cursor-pointer group"
            style={{
              opacity: 0,
              visibility: "hidden",
              transform: "translateY(20px)",
              padding: "0.45rem 1.25rem 0.45rem 0.75rem",
            }}
          >
            {/* Thin left bar — accent */}
            <div
              className="w-px flex-shrink-0 transition-all duration-300"
              style={{ height: "12px", background: "rgba(255,255,255,0.2)" }}
            />
            {/* Index number */}
            <span className="text-[0.55rem] text-white/25 tracking-[0.15em] tabular-nums w-[18px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            {/* Label */}
            <span className="text-white/60 text-[0.7rem] tracking-[0.08em] uppercase whitespace-nowrap transition-colors duration-200 group-hover:text-white/90">
              {cat}
            </span>
          </div>
        ))}
      </div>

      {/* ── Logo — left side, collapses to "VS" ───────────────────────────────── */}
      <div
        ref={logoRef}
        className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col"
        style={{ zIndex: 100, paddingLeft: "1.5rem" }}
      >
        {/* Small label above */}
        <span
          className="text-white/20 text-[0.5rem] tracking-[0.25em] uppercase mb-2 block"
          style={{ letterSpacing: "0.25em" }}
        >
          Gallery
        </span>

        {/* Logo characters */}
        <div className="relative flex items-baseline">
          {logoChars.map((item, i) => (
            <span
              key={i}
              ref={(el) => {
                charRefs.current[i] = el;
              }}
              data-index={item.index}
              className="inline-block text-white font-semibold"
              style={{
                fontSize: "1.6rem",
                letterSpacing: "-0.03em",
                transition: "opacity 0.4s ease, filter 0.4s ease",
                width: item.isSpacer ? "0.4em" : undefined,
                filter: "blur(0px)",
              }}
            >
              {item.isSpacer ? "\u00A0" : item.char}
            </span>
          ))}
        </div>

        {/* Hairline rule below logo */}
        <div
          className="mt-3"
          style={{
            width: "100%",
            height: "1px",
            background: "rgba(255,255,255,0.1)",
          }}
        />

        {/* Year / edition tag */}
        <span className="text-white/20 text-[0.5rem] tracking-[0.2em] uppercase mt-2">
          Series I
        </span>
      </div>

      {/* ── Mysterious message — bottom left ─────────────────────────────────── */}
      <div
        className="fixed left-0 bottom-8 flex items-center gap-3 opacity-0"
        ref={mysteriousRef}
        style={{ zIndex: 100, paddingLeft: "1.5rem" }}
      >
        {/* Animated blinking dot */}
        <div
          className="w-[4px] h-[4px] rounded-full flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.35)",
            animation: "vs-blink 2s ease-in-out infinite",
          }}
        />
        <span className="text-white/35 text-[0.6rem] tracking-[0.15em] uppercase">
          {mysteriousMessage}
        </span>
        <style>{`@keyframes vs-blink { 0%,100%{opacity:0.35} 50%{opacity:1} }`}</style>
      </div>
    </div>
  );
}
