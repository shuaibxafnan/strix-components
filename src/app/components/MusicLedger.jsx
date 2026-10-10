"use client";

import { useEffect, useRef, useState } from "react";

// ─── MusicPortfolio ───────────────────────────────────────────────────────────
//
// Apple-to-apple port of the CodePen. Three interactive systems:
//
//   1. HOVER  — mouseenter on a row scrambles its text with hacker chars,
//               fades all other rows to 0.3 opacity, and reveals a fixed
//               background image animating from scale(1.2) → scale(1.0).
//
//   2. IDLE   — after `idleDelay` ms with no interaction a cascading wave
//               dims counters then each column in sequence, repeating on a
//               loop. Stops immediately on mouseenter.
//
//   3. CLOCK  — live blinking clock in bottom-right corner localised to
//               `clockTimezone`.
//
// Props
// ────────────────────────────────────────────────────────────────────────────
// projects         array    DEFAULT_PROJECTS   Row data. Each item:
//                                              { artist, album, category,
//                                                label, year, image }
//                                              `image` → fixed BG on hover
//
// colorFg          string   "rgb(250,225,250)" Text / foreground colour
// colorBg          string   "rgb(5,5,5)"       Page background colour
// colorAccent      string   "rgb(255,223,0)"   Hover accent bar colour
// colorBorder      string   "rgba(200,255,200,0.1)"  Row divider colour
//
// scrambleChars    string   "qwerty1337h@ck3r" Pool cycled during scramble
// scrambleDuration number   800                ms before text resolves back
// scrambleSpeed    number   40                 ms between char swaps (lower=faster)
//
// bgImageWidth     string   "800px"            Width of the fixed BG image
// bgImageHeight    string   "600px"            Height of the fixed BG image
//
// idleDelay        number   3000               ms of inactivity before idle wave
// idleRepeatDelay  number   2                  seconds between idle wave loops
//
// showNoise        boolean  true               SVG fractal noise overlay
// showScanlines    boolean  true               CSS scanline overlay
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_PROJECTS = [
  {
    artist: "DEATH ON THE BALCONY",
    album: "VICE",
    category: "SINGLE",
    label: "SELF RELEASED",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-001.jpg",
  },
  {
    artist: "JIMMY WHOO",
    album: "NIGHTFALL",
    category: "EP",
    label: "DEEP HOUSE",
    year: "2022",
    image: "https://assets.codepen.io/7558/portrait-fashion-002.jpg",
  },
  {
    artist: "HERMANOS GUTIÉRREZ",
    album: "EL BUENO Y EL MALO",
    category: "ALBUM",
    label: "EASY EYE SOUND",
    year: "2022",
    image: "https://assets.codepen.io/7558/portrait-fashion-003.jpg",
  },
  {
    artist: "NEIL FRANCES",
    album: "LINES",
    category: "ALBUM",
    label: "ISKA DHAMD",
    year: "2021",
    image: "https://assets.codepen.io/7558/portrait-fashion-004.jpg",
  },
  {
    artist: "ADDEX",
    album: "MIDNIGHT SESSIONS",
    category: "EP",
    label: "ELECTRONIC",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-005.jpg",
  },
  {
    artist: "BEYHUDE",
    album: "YALNIZLIK",
    category: "SINGLE",
    label: "ALBÜM YAPIM",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-006.jpg",
  },
  {
    artist: "THING",
    album: "SHAPES",
    category: "ALBUM",
    label: "KOMPAKT",
    year: "2021",
    image: "https://assets.codepen.io/7558/portrait-fashion-007.jpg",
  },
  {
    artist: "ABAKUS",
    album: "THAT MUCH CLOSER TO THE SUN",
    category: "ALBUM",
    label: "BEATSERVICE",
    year: "2020",
    image: "https://assets.codepen.io/7558/portrait-fashion-008.jpg",
  },
  {
    artist: "SAINTÉ",
    album: "ANXIETY",
    category: "SINGLE",
    label: "PARLOPHONE",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-001.jpg",
  },
  {
    artist: "CANNONS",
    album: "FEVER DREAM",
    category: "ALBUM",
    label: "COLUMBIA",
    year: "2022",
    image: "https://assets.codepen.io/7558/portrait-fashion-002.jpg",
  },
  {
    artist: "BAWO",
    album: "REAL LIES",
    category: "EP",
    label: "NINJA TUNE",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-003.jpg",
  },
  {
    artist: "SUMAC DUB",
    album: "ECHOES FROM THE VOID",
    category: "ALBUM",
    label: "DUB RECORDS",
    year: "2022",
    image: "https://assets.codepen.io/7558/portrait-fashion-004.jpg",
  },
  {
    artist: "LEISURE",
    album: "THE BIG DOOR",
    category: "ALBUM",
    label: "CASCINE",
    year: "2021",
    image: "https://assets.codepen.io/7558/portrait-fashion-005.jpg",
  },
  {
    artist: "MINDCHATTER",
    album: "IMAGINARY FRIENDS",
    category: "ALBUM",
    label: "INDEPENDENT",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-006.jpg",
  },
  {
    artist: "DJ CINÉMA QUARTIER LATIN",
    album: "NUIT BLANCHE",
    category: "MIX",
    label: "KITSUNE",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-007.jpg",
  },
  {
    artist: "EVREN FURTUNA",
    album: "COSMIC FREQUENCIES",
    category: "EP",
    label: "DEEP TECH",
    year: "2022",
    image: "https://assets.codepen.io/7558/portrait-fashion-008.jpg",
  },
  {
    artist: "PABLO BOLIVAR",
    album: "MEMORIES",
    category: "ALBUM",
    label: "SEVEN VILLAS",
    year: "2021",
    image: "https://assets.codepen.io/7558/portrait-fashion-001.jpg",
  },
  {
    artist: "DIALE",
    album: "FRAGMENTS",
    category: "EP",
    label: "AFTERLIFE",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-002.jpg",
  },
  {
    artist: "MARTIN ROTH",
    album: "REBIRTH",
    category: "ALBUM",
    label: "IBOGA",
    year: "2022",
    image: "https://assets.codepen.io/7558/portrait-fashion-003.jpg",
  },
  {
    artist: "KLARTRAUM",
    album: "LUCID",
    category: "ALBUM",
    label: "LUCIDFLOW",
    year: "2023",
    image: "https://assets.codepen.io/7558/portrait-fashion-004.jpg",
  },
];

const DEFAULT_NAV = [
  {
    label: "Spotify",
    href: "https://open.spotify.com/user/226ilulo57zutgtiwjsjqnqsy?si=0004e7bc669a406e",
  },
  { label: "Email", href: "mailto:hi@filip.fyi" },
  { label: "X", href: "https://x.com/filipz" },
];

// ── loadScript helper ─────────────────────────────────────────────────────────

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



// ── MusicLedger ────────────────────────────────────────────────────────────

export default function MusicLedger({
  projects = DEFAULT_PROJECTS,
  colorFg = "rgb(250, 225, 250)",
  colorBg = "rgb(5, 5, 5)",
  colorAccent = "rgb(255, 223, 0)",
  colorBorder = "rgba(200, 255, 200, 0.1)",
  scrambleChars = "qwerty1337h@ck3r",
  scrambleDuration = 800,
  scrambleSpeed = 40,
  bgImageWidth = "800px",
  bgImageHeight = "600px",
  idleDelay = 3000,
  idleRepeatDelay = 2,
  showNoise = true,
  showScanlines = true,
}) {
  const bgImageRef = useRef(null); // the fixed background image div
  const containerRef = useRef(null); // .mp-container — the <main>
  const listRef = useRef(null); // <ul>
  const rowRefs = useRef([]); // <li> nodes, indexed by row
  const activeRef = useRef(-1); // index of hovered row, -1 = none
  const idleTimerRef = useRef(null);
  const idleTlRef = useRef(null);
  const scrambleMap = useRef(new Map()); // span → { intervalId, resolveId }

  // Live ref so long-lived event-handler closures always read fresh prop values
  const propsRef = useRef({});
  propsRef.current = { scrambleChars, scrambleDuration, scrambleSpeed };

  useEffect(() => {
    // Preload images so BG swap is instant on first hover
    projects.forEach(({ image }) => {
      if (!image) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
    });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !containerRef.current) return;
        gsap.config({ trialWarn: false });

        // ── Scramble engine ───────────────────────────────────────────────────
        // Pure JS — no ScrambleText plugin needed. Cycles pool chars on an
        // interval then resolves back to the original after scrambleDuration ms.

        const scramble = (span, original) => {
          const {
            scrambleChars: pool,
            scrambleDuration: dur,
            scrambleSpeed: spd,
          } = propsRef.current;

          // Clear any in-flight scramble for this span
          const prev = scrambleMap.current.get(span);
          if (prev) {
            clearInterval(prev.intervalId);
            clearTimeout(prev.resolveId);
          }

          const intervalId = setInterval(() => {
            span.textContent = pool[Math.floor(Math.random() * pool.length)];
          }, spd);

          const resolveId = setTimeout(() => {
            clearInterval(intervalId);
            span.textContent = original;
            scrambleMap.current.delete(span);
          }, dur);

          scrambleMap.current.set(span, { intervalId, resolveId });
        };

        const stopAllScrambles = () => {
          scrambleMap.current.forEach(({ intervalId, resolveId }) => {
            clearInterval(intervalId);
            clearTimeout(resolveId);
          });
          scrambleMap.current.clear();
        };

        // ── Background image ─────────────────────────────────────────────────
        // Mirrors the original exactly:
        //   1. Kill transition, snap to scale(1.2), set new image, opacity stays 0
        //   2. Double-rAF so browser commits the snap before we re-enable transition
        //   3. Then animate opacity → 1 and scale → 1.0 together

        const showBg = (url) => {
          const el = bgImageRef.current;
          if (!el) return;
          // Step 1: reset without transition
          el.style.transition = "none";
          el.style.transform = "translate(-50%, -50%) scale(1.2)";
          el.style.backgroundImage = `url(${url})`;
          el.style.opacity = "0";
          // Step 2-3: animate in
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              el.style.transition =
                "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
              el.style.opacity = "1";
              el.style.transform = "translate(-50%, -50%) scale(1.0)";
            }),
          );
        };

        const hideBg = () => {
          const el = bgImageRef.current;
          if (!el) return;
          el.style.opacity = "0";
        };

        // ── Active state ──────────────────────────────────────────────────────
        // Mirrors original: add has-active to container, toggle active on rows.

        const activate = (index) => {
          activeRef.current = index;
          containerRef.current.classList.add("has-active");
          rowRefs.current.forEach((row, i) => {
            if (!row) return;
            row.classList.toggle("active", i === index);
          });
        };

        const deactivate = () => {
          activeRef.current = -1;
          containerRef.current.classList.remove("has-active");
          rowRefs.current.forEach((row) => {
            if (!row) return;
            row.classList.remove("active");
            // Restore any mid-scramble text
            row.querySelectorAll("[data-original]").forEach((span) => {
              span.textContent = span.dataset.original;
            });
          });
          stopAllScrambles();
        };

        // ── Idle wave animation ───────────────────────────────────────────────
        // Exact replication of original AnimationManager.startIdleAnimation:
        //   — counters cascade hide/show via class toggle (GSAP .call)
        //   — then each column fades out row-by-row, then fades back in

        const startIdle = () => {
          if (idleTlRef.current) return;

          const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: idleRepeatDelay,
          });
          idleTlRef.current = tl;

          const COLS = ["artist", "album", "category", "label", "year"];
          const ROW_STAGGER = 0.05;
          const COL_STAGGER = 0.25;
          const totalRows = rowRefs.current.length;
          const REVEAL_GAP = totalRows * ROW_STAGGER * 0.5;

          // Counters wave
          rowRefs.current.forEach((row, i) => {
            if (!row) return;
            tl.call(
              () => row.classList.add("counter-hidden"),
              [],
              i * ROW_STAGGER,
            );
            tl.call(
              () => row.classList.remove("counter-hidden"),
              [],
              REVEAL_GAP + i * ROW_STAGGER,
            );
          });

          // Column waves
          COLS.forEach((col, ci) => {
            const base = (ci + 1) * COL_STAGGER;
            rowRefs.current.forEach((row, ri) => {
              const span = row?.querySelector(`[data-col="${col}"]`);
              if (!span) return;
              tl.to(
                span,
                { duration: 0.1, opacity: 0.05, ease: "power2.inOut" },
                base + ri * ROW_STAGGER,
              );
              tl.to(
                span,
                { duration: 0.1, opacity: 1, ease: "power2.inOut" },
                base + REVEAL_GAP + ri * ROW_STAGGER,
              );
            });
          });
        };

        const stopIdle = () => {
          if (!idleTlRef.current) return;
          idleTlRef.current.kill();
          idleTlRef.current = null;
          // Snap everything back — GSAP may have left opacities mid-tween
          rowRefs.current.forEach((row) => {
            if (!row) return;
            row.classList.remove("counter-hidden");
            row.querySelectorAll("[data-col]").forEach((span) => {
              gsap.set(span, { opacity: 1 });
            });
          });
        };

        const scheduleIdle = () => {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = setTimeout(() => {
            if (activeRef.current === -1) startIdle();
          }, idleDelay);
        };

        const cancelIdle = () => {
          clearTimeout(idleTimerRef.current);
          stopIdle();
        };

        // ── Row listeners ─────────────────────────────────────────────────────
        rowRefs.current.forEach((row, index) => {
          if (!row) return;
          const spans = [...row.querySelectorAll("[data-original]")];

          row.addEventListener("mouseenter", () => {
            cancelIdle();
            if (activeRef.current === index) return;
            activate(index);
            spans.forEach((span) => scramble(span, span.dataset.original));
            const { image } = projects[index] || {};
            if (image) showBg(image);
          });

          // Individual row mouseleave: restore text after short debounce
          // (matches original's 50 ms debounce on text reset)
          row.addEventListener("mouseleave", () => {
            setTimeout(() => {
              spans.forEach((span) => {
                const s = scrambleMap.current.get(span);
                if (s) {
                  clearInterval(s.intervalId);
                  clearTimeout(s.resolveId);
                  scrambleMap.current.delete(span);
                }
                span.textContent = span.dataset.original;
              });
            }, 50);
          });
        });

        // Container mouseleave — clears everything and starts idle countdown
        containerRef.current.addEventListener("mouseleave", () => {
          deactivate();
          hideBg();
          scheduleIdle();
        });

        // Boot the idle timer on mount
        scheduleIdle();

        return () => {
          clearTimeout(idleTimerRef.current);
          stopIdle();
          stopAllScrambles();
        };
      })
      .catch((e) =>
        console.error("[MusicPortfolio] GSAP load failed:", e.message),
      );
  }, [projects, idleDelay, idleRepeatDelay]);

  return (
    <>
      {/* ── Global styles ───────────────────────────────────────────────────────
          Everything that Tailwind can't express: pseudo-elements, CSS counters,
          font-face, the scanline/noise overlays, and state-driven class rules.
          Colours are threaded in via CSS custom properties set on .mp-root.    */}
      <style>{`
        @font-face {
          font-family: "PP Supply Mono";
          src: url("https://assets.codepen.io/7558/PPSupplyMono-Variable.woff2") format("woff2");
          font-weight: 100 900;
          font-display: swap;
        }

        /* ── Root resets ── */
        .mp-root *, .mp-root *::before, .mp-root *::after { box-sizing: border-box; }

        .mp-root {
          margin: 0;
          font-family: "PP Supply Mono", monospace;
          background-color: var(--mp-bg);
          color: var(--mp-fg);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 400;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
          overflow: hidden;
          z-index: 10;
        }

        /* Scanline overlay — matches original body::after */
        .mp-root.mp-scanlines::after {
          content: "";
          position: fixed;
          top: 0; left: 0;
          height: 100%; width: 100%;
          background-image: repeating-linear-gradient(
            transparent, transparent 2px, #ffffff0d 4px
          );
          pointer-events: none;
          z-index: -1;
        }

        /* Noise overlay — matches original .portfolio-container::before */
        .mp-container::before {
          content: "";
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-color: var(--mp-bg);
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.3;
          z-index: 100;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* ── Container ── */
        .mp-container {
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 100vw;
          padding: 0 2rem;
          position: relative;
          counter-reset: project-counter 0;
        }

        /* ── List ── */
        .mp-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        /* ── Row — matches original grid: 40px 1fr 2fr 1fr 1fr 80px ── */
        .mp-row {
          cursor: pointer;
          width: 100%;
          display: grid;
          grid-template-columns: 40px 1fr 2fr 1fr 1fr 80px;
          column-gap: 2rem;
          padding: 12px 0;
          align-items: center;
          border-bottom: 1px solid var(--mp-border);
          transition: all 0.3s ease;
          opacity: 1;
          position: relative;
        }

        /* Counter cell — first implicit grid column */
        .mp-row::before {
          content: counter(project-counter, decimal-leading-zero);
          counter-increment: project-counter;
          padding: 4px 0;
          line-height: 0.8;
          opacity: 0.6;
          justify-self: start;
          z-index: 10;
          position: relative;
          transition: opacity 0.1s ease;
        }

        .mp-row.counter-hidden::before { opacity: 0.05; }

        /* Active state — original .project-item.active */
        .mp-row.active {
          opacity: 1;
          box-shadow:
            inset 0  1px 0 rgba(200, 255, 200, 0.2),
            inset 0 -1px 0 rgba(200, 255, 200, 0.2);
        }

        /* Dim non-active rows when any row is active */
        .mp-container.has-active .mp-row        { opacity: 0.3; }
        .mp-container.has-active .mp-row.active { opacity: 1; }

        /* ── Cell — matches original .project-data ── */
        .mp-cell {
          font-family: "PP Supply Mono", monospace;
          position: relative;
          white-space: nowrap;
          color: var(--mp-fg);
          z-index: 1;
          transition: all 0.3s ease;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
          padding: 2px;
        }

        /* Accent bar — matches original .project-data::after */
        .mp-cell::after {
          content: "";
          position: absolute;
          top: 0;
          left: -8px;
          width: calc(100% + 16px);
          height: calc(100% - 2px);
          background: var(--mp-accent);
          transition: transform 0.3s ease;
          transform: scaleX(0);
          transform-origin: left;
          z-index: -1;
        }

        .mp-row:hover .mp-cell::after { transform: scaleX(1); }
        .mp-row:hover .mp-cell        { color: rgb(10, 10, 10) !important; }

        /* Year — right-aligned */
        .mp-cell-year { justify-self: end; text-align: right; }

        /* ── Responsive — matches original breakpoints ── */
        @media (max-width: 1200px) {
          .mp-row {
            grid-template-columns: 30px 1fr 1.5fr 0.8fr 0.8fr 60px;
            column-gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .mp-container { padding: 0 1rem; }
          .mp-row { grid-template-columns: 30px 1fr 1fr; column-gap: 1rem; }
          .mp-cell-category,
          .mp-cell-label,
          .mp-cell-year { display: none; }
        }

        /* ── Clock blink ── */
        .mp-blink { animation: mp-blink 1s steps(1) infinite; }
        @keyframes mp-blink { 50% { opacity: 0; } }
      `}</style>

      {/* ── Root wrapper ────────────────────────────────────────────────────────
          Sets CSS vars consumed by all child pseudo-elements and rules above.
          No overflow-hidden here — the fixed bg image must bleed through.     */}
      <div
        className={`mp-root${showScanlines ? " mp-scanlines" : ""}`}
        style={{
          "--mp-fg": colorFg,
          "--mp-bg": colorBg,
          "--mp-accent": colorAccent,
          "--mp-border": colorBorder,
        }}
      >
        {/* ── Fixed background image ─────────────────────────────────────────
            position:fixed, z-index:-2 — sits behind everything, matches
            original .background-image exactly. JS toggles opacity / transform. */}
        <div
          ref={bgImageRef}
          role="img"
          aria-hidden="true"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            width: bgImageWidth,
            height: bgImageHeight,
            transform: "translate(-50%, -50%) scale(1)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0,
            transition:
              "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            zIndex: -2,
          }}
        />

        {/* ── Portfolio list ─────────────────────────────────────────────────
            ref={containerRef} receives has-active class toggles from JS.
            showNoise controls the ::before pseudo in CSS above.               */}
        <main
          ref={containerRef}
          className={`mp-container${showNoise ? "" : " mp-no-noise"}`}
        >
          <h1 className="sr-only">Music Portfolio</h1>

          <ul ref={listRef} className="mp-list" role="list">
            {projects.map((p, i) => (
              <li
                key={i}
                ref={(el) => (rowRefs.current[i] = el)}
                className="mp-row"
              >
                {/* Counter rendered via CSS ::before — no DOM node needed */}

                {/* Artist */}
                <span
                  className="mp-cell"
                  data-col="artist"
                  data-original={p.artist}
                >
                  {p.artist}
                </span>

                {/* Album */}
                <span
                  className="mp-cell"
                  data-col="album"
                  data-original={p.album}
                >
                  {p.album}
                </span>

                {/* Category — hidden below 768px via CSS */}
                <span
                  className="mp-cell mp-cell-category"
                  data-col="category"
                  data-original={p.category}
                >
                  {p.category}
                </span>

                {/* Label — hidden below 768px via CSS */}
                <span
                  className="mp-cell mp-cell-label"
                  data-col="label"
                  data-original={p.label}
                >
                  {p.label}
                </span>

                {/* Year — right-aligned, hidden below 768px */}
                <span
                  className="mp-cell mp-cell-year"
                  data-col="year"
                  data-original={p.year}
                >
                  {p.year}
                </span>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </>
  );
}
