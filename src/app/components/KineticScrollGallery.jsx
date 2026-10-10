"use client";

import { useEffect, useRef, useState } from "react";

// ─── InfiniteScrollGallery ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// baseDuration      number   20           Base loop duration for even columns (s)
// oddDuration       number   26           Base loop duration for odd columns (s)
// scrollIntensity   number   300          Lower = stronger scroll speed kick
//                                         (boost = 1 + |velocity| / scrollIntensity)
// boostDecay        number   1.5          Seconds for speed to ease back to 1× after scroll
// gapX              string   "8px"        Horizontal gap between columns
// gapY              string   "8px"        Vertical gap between images (also seam padding)
// bgColor           string   "#111"       Page background color
// headlineText      string   "Gallery"    Overlay headline copy
// headlineColor     string   "#ffffff"    Headline base color (mix-blend-difference applied)
// headlineFontSize  string   "12vw"       Headline font size
// headlineFont      string   "Bebas Neue" Google Font family for headline
// grayscale         boolean  true         Images desaturated at rest, full color on hover
// imageRadius       string   "0px"        Border radius on each image card
// columns           array    [[...]]      Nested image URL arrays — one sub-array per column
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_COLUMNS = [
  [
    "https://images.pexels.com/photos/10324713/pexels-photo-10324713.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/10533885/pexels-photo-10533885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/10253213/pexels-photo-10253213.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  [
    "https://images.pexels.com/photos/10050979/pexels-photo-10050979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/1128660/pexels-photo-1128660.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/9699293/pexels-photo-9699293.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  [
    "https://images.pexels.com/photos/6405575/pexels-photo-6405575.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/10162526/pexels-photo-10162526.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/4394807/pexels-photo-4394807.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
];

export default function KineticScrollGallery({
  baseDuration = 20,
  oddDuration = 26,
  scrollIntensity = 300,
  boostDecay = 1.5,
  gapX = "16px",
  gapY = "16px",
  bgColor = "#EEE",
  headlineText = "Gallery",
  headlineColor = "#ffffff",
  headlineFontSize = "10vw",
  headlineFont = "Bebas Neue",
  grayscale = true,
  imageRadius = "0px",
  columns = DEFAULT_COLUMNS,
}) {
  const stripRefs = useRef([]);
  const cleanupRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(function () {
    setMounted(true);
  }, []);

  useEffect(
    function () {
      if (!mounted) return;

      // ── Script loader ────────────────────────────────────────────────────
      const loadScript = function (src) {
        return new Promise(function (resolve, reject) {
          if (document.querySelector('script[data-id="' + src + '"]')) {
            resolve();
            return;
          }
          const el = document.createElement("script");
          el.src = src;
          el.setAttribute("data-id", src);
          el.onload = resolve;
          el.onerror = function () {
            reject(new Error("Failed: " + src));
          };
          document.head.appendChild(el);
        });
      };

      // ── Font loader ──────────────────────────────────────────────────────
      const loadFont = function (family) {
        const id = "gfont-" + family.replace(/\s+/g, "-");
        if (document.getElementById(id)) return;
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=" +
          encodeURIComponent(family) +
          "&display=swap";
        document.head.appendChild(link);
      };

      loadFont(headlineFont);

      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      )
        .then(function () {
          const gsap = window.gsap;
          if (!gsap) return;

          gsap.config({ trialWarn: false });

          const tweens = [];

          // ── One seamless loop tween per strip ────────────────────────────
          //
          // The strip DOM is: [orig-0][orig-1][orig-2][clone-0][clone-1][clone-2]
          // All items + gaps are identical in both halves, PLUS the strip has
          // paddingBottom equal to gapY so the seam between clone-last and
          // orig-first (at the wrap point) matches every other inter-item gap.
          //
          // GSAP % in transforms = % of the element's own offsetHeight.
          // Because both halves are identical, translateY(-50%) lands the strip
          // at the exact same visual position as translateY(0%), making repeat:-1
          // a zero-stutter seamless restart.
          //
          // Even columns scroll UP   (0% → -50%)
          // Odd  columns scroll DOWN (-50% → 0%)   ← reversed for visual variety

          stripRefs.current.forEach(function (strip, i) {
            if (!strip) return;

            const isOdd = i % 2 !== 0;
            const duration = isOdd ? oddDuration : baseDuration;

            const tween = gsap.fromTo(
              strip,
              { y: isOdd ? "-50%" : "0%" },
              {
                y: isOdd ? "0%" : "-50%",
                duration: duration,
                ease: "none",
                repeat: -1,
                // ── immediateRender:true ensures the from-state is applied
                // ── on the very first frame, before any paint, so there's no
                // ── flash of un-transformed content on load.
                immediateRender: true,
              },
            );

            tweens.push(tween);
          });

          // ── Velocity tracker ─────────────────────────────────────────────
          //
          // We use a raw scroll event + manual velocity calculation instead of
          // ScrollTrigger. This fires unconditionally on any window scroll,
          // regardless of where the component sits in the document, and avoids
          // ScrollTrigger's start/end bounds cutting off onUpdate.
          //
          // Velocity = Δscroll / Δtime  (px per ms → scaled up for readability)

          let lastScrollY = window.scrollY;
          let lastScrollTime = performance.now();
          let decayAnims = [];

          const onScroll = function () {
            const now = performance.now();
            const dy = window.scrollY - lastScrollY;
            const dt = now - lastScrollTime;

            lastScrollY = window.scrollY;
            lastScrollTime = now;

            // ── Guard against zero dt (two events in same frame)
            if (dt === 0) return;

            // ── px/ms velocity, scaled to a usable magnitude
            const velocity = Math.abs(dy / dt) * 1000; // → px/s equivalent
            if (velocity < 10) return;

            // ── Kill any in-progress decay animations
            decayAnims.forEach(function (a) {
              if (a) a.kill();
            });
            decayAnims = [];

            // ── boost = how many times faster than normal to run
            const boost = 1 + velocity / scrollIntensity;

            tweens.forEach(function (tween) {
              tween.timeScale(boost);

              // ── Proxy-tween the timeScale back to 1× smoothly
              const proxy = { ts: boost };
              const decay = gsap.to(proxy, {
                ts: 1,
                duration: boostDecay,
                ease: "power2.out",
                onUpdate: function () {
                  tween.timeScale(proxy.ts);
                },
              });
              decayAnims.push(decay);
            });
          };

          window.addEventListener("scroll", onScroll, { passive: true });

          // ── Store cleanup so useEffect return can call it
          cleanupRef.current = function () {
            window.removeEventListener("scroll", onScroll);
            decayAnims.forEach(function (a) {
              if (a) a.kill();
            });
            tweens.forEach(function (t) {
              t.kill();
            });
          };
        })
        .catch(function (err) {
          console.error("[InfiniteScrollGallery] GSAP load error:", err);
        });

      return function () {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    },
    [
      mounted,
      baseDuration,
      oddDuration,
      scrollIntensity,
      boostDecay,
      headlineFont,
      columns,
    ],
  );

  if (!mounted) return null;

  return (
    // ── Tall scroll surface — gives the window something to scroll against.
    // ── The gallery grid itself is position:fixed so it fills the viewport
    // ── while the page scrolls underneath it.
    <div
      className="relative w-full min-h-[500vh]"
      style={{ backgroundColor: bgColor }}
    >
      {/* ── Overlay headline ──────────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        <h1
          className="uppercase select-none text-center leading-none mix-blend-difference"
          style={{
            fontFamily: "'" + headlineFont + "', sans-serif",
            fontSize: headlineFontSize,
            color: headlineColor,
            letterSpacing: "0.02em",
          }}
        >
          {headlineText}
        </h1>
      </div>

      {/* ── Fixed viewport column grid ────────────────────────────────── */}
      <div
        className="fixed inset-0 z-10 flex flex-row overflow-hidden"
        style={{ gap: gapX }}
      >
        {columns.map(function (colImages, colIndex) {
          return (
            <div key={colIndex} className="relative flex-1 overflow-hidden">
              {/*
               * Strip = [originals] + [clones] — exactly 2× the content height.
               *
               * paddingBottom = gapY closes the seam: without it the gap between
               * clone-last → orig-first at the wrap point would be 0 (no flex gap
               * after the final child), making the loop visually jerk.
               * With paddingBottom = gapY the strip ends with the same spacing
               * as every other inter-item gap, so the repeat restart is invisible.
               */}
              <div
                ref={function (el) {
                  stripRefs.current[colIndex] = el;
                }}
                className="flex flex-col will-change-transform"
                style={{
                  gap: gapY,
                  paddingBottom: gapY,
                }}
              >
                {/* ── Originals ─────────────────────────────────────── */}
                {colImages.map(function (src, imgIndex) {
                  return (
                    <div
                      key={"orig-" + imgIndex}
                      className="w-full flex-shrink-0 overflow-hidden"
                      style={{ borderRadius: imageRadius }}
                    >
                      <img
                        src={src}
                        alt={
                          "Gallery col " +
                          (colIndex + 1) +
                          " image " +
                          (imgIndex + 1)
                        }
                        className={
                          "w-full object-cover block " +
                          (grayscale
                            ? "grayscale hover:grayscale-0 transition-[filter] duration-300 ease-out"
                            : "")
                        }
                      />
                    </div>
                  );
                })}

                {/* ── Clones — aria-hidden, seamless visual repeat ──── */}
                {colImages.map(function (src, imgIndex) {
                  return (
                    <div
                      key={"clone-" + imgIndex}
                      className="w-full flex-shrink-0 overflow-hidden"
                      style={{ borderRadius: imageRadius }}
                      aria-hidden="true"
                    >
                      <img
                        src={src}
                        alt=""
                        className={
                          "w-full object-cover block " +
                          (grayscale
                            ? "grayscale hover:grayscale-0 transition-[filter] duration-300 ease-out"
                            : "")
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
