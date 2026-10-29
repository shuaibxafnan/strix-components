"use client";

import { useEffect, useMemo, useRef } from "react";

const DEFAULT_PICS = [
  "https://images.unsplash.com/photo-1542662565-7e4b66bae529?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=282&q=80",
  "https://images.unsplash.com/photo-1525153537143-f88592837fb1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=332&q=80",
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
  "https://images.unsplash.com/photo-1507400492013-162706c8c05e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=309&q=80",
  "https://images.unsplash.com/photo-1436891620584-47fd0e565afb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=750&q=80",
];

const DEFAULT_TITLES = ["Mountain", "Stars", "Skies", "Water", "Trips"];
const DEFAULT_TYPES = ["Guide", "Planner", "Discuss"];

function CardContent({ pic, title, type, isReflection, bgCssVar }) {
  return (
    <>
      {/* Card face */}
      <div className="card__content bg-gray-800 overflow-hidden relative h-full w-full rounded-md font-sans">
        {/* Background image */}
        <img
          className="absolute inset-0 h-full w-full object-cover scale-110"
          src={pic}
          alt={title}
        />
        {/* Text overlay */}
        <div className="absolute inset-0 pt-52 flex items-center justify-center flex-col">
          <span className="text-gray-300 uppercase text-xs w-full text-center">
            {type}
          </span>
          <h2 className="p-2 text-white font-black text-xl text-center w-full pb-12">
            {title}
          </h2>
        </div>
      </div>

      {/* Overlay — reflection gets gradient fade, card face is transparent */}
      {isReflection ? (
        <div
          className="z-50 absolute inset-0 h-full w-full"
          style={{
            background: `linear-gradient(${bgCssVar} 50%, transparent)`,
            clipPath: "inset(50% 0 0 0)",
          }}
        />
      ) : (
        <div className="z-50 absolute inset-0 h-full w-full" />
      )}
    </>
  );
}

// SingleCard — the card + its flipped reflection below it
function SingleCard({ pic, title, type, bgColor, reflectionBlur }) {
  return (
    <li className="card w-56 h-72 absolute">
      {/* Main card face */}
      <div className="card__card h-full w-full">
        <CardContent
          pic={pic}
          title={title}
          type={type}
          isReflection={false}
          bgCssVar={bgColor}
        />
      </div>

      {/* Reflection — flipped 180°, blurred, clipped to bottom half */}
      <div
        aria-hidden="true"
        className="absolute h-full w-full top-8 left-0 rounded-md overflow-hidden"
        style={{
          filter: `blur(${reflectionBlur}px)`,
          transition: "0.2s ease",
          // rotateY flips horizontally so text isn't mirrored left-right,
          // rotate(180deg) flips vertically, translate(0,-100%) repositions below
          transform:
            "translate3d(0, 0, 0) rotate(180deg) translate(0, -100%) rotateY(180deg)",
        }}
      >
        <CardContent
          pic={pic}
          title={title}
          type={type}
          isReflection
          bgCssVar={bgColor}
        />
      </div>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LoopReflectionCarousel({
  pics = DEFAULT_PICS,
  titles = DEFAULT_TITLES,
  types = DEFAULT_TYPES,
  cardCount = 10,
  spacing = 0.2,
  scrollLength = 3000,
  bgColor = "hsl(220, 34%, 5%)",
  reflectionBlur = 5,
}) {
  const galleryRef = useRef(null);
  const nextBtnRef = useRef(null);
  const prevBtnRef = useRef(null);

  const cardTypes = useMemo(
    () =>
      Array.from(
        { length: cardCount },
        (_, i) => types[(i * 3 + 1) % types.length],
      ),
    [cardCount, types],
  );

  useEffect(() => {
    // ── loadScript helper (CDN, Turbopack-safe) ──────────────────────────────
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

    let cleanupFn = null;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() =>
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        ),
      )
      .then(() => {
        const { gsap, ScrollTrigger } = window;
        if (!gsap || !ScrollTrigger || !galleryRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const {
          to,
          set,
          utils: { snap, toArray },
        } = gsap;

        const buildLoop = (cards, cardSpacing) => {
          const OVERLAP = Math.ceil(1 / cardSpacing);
          const START = cards.length * cardSpacing + 0.5;
          const LOOP_TIME = (cards.length + OVERLAP) * cardSpacing + 1;

          const RAW = gsap.timeline({ paused: true });
          const LOOP = gsap.timeline({
            paused: true,
            repeat: -1,
            onRepeat() {
              // Edge-case guard from original GSAP 3.6.1 issue
              this._time === this._dur && (this._tTime += this._dur - 0.01);
            },
          });

          const L = cards.length + OVERLAP * 2;

          // All cards start off to the right, invisible and scaled to 0
          set(cards, { xPercent: 5000, opacity: 0, scale: 0 });

          for (let i = 0; i < L; i++) {
            const index = i % cards.length;
            const item = cards[index];
            const time = i * cardSpacing;

            // Fade in/out
            RAW.fromTo(
              item,
              { opacity: 0 },
              {
                opacity: 1,
                delay: 0.25,
                duration: 0.25,
                yoyo: true,
                ease: "none",
                repeat: 1,
                immediateRender: false,
              },
              time,
            )
              .fromTo(
                item,
                { scale: 0 },
                {
                  scale: 1,
                  zIndex: 100,
                  duration: 0.5,
                  yoyo: true,
                  repeat: 1,
                  ease: "none",
                  immediateRender: false,
                },
                time,
              )
              // Sweep left-to-right across the viewport
              .fromTo(
                item,
                { xPercent: 250 },
                {
                  xPercent: -250,
                  duration: 1,
                  ease: "none",
                  immediateRender: false,
                },
                time,
              );

            // Optional label markers for each card position
            if (i <= cards.length) LOOP.add("label" + i, time);
          }

          // Scrub the rawSequence playhead inside the outer looping timeline
          RAW.time(START);
          LOOP.to(RAW, {
            time: LOOP_TIME,
            duration: LOOP_TIME - START,
            ease: "none",
          }).fromTo(
            RAW,
            { time: OVERLAP * cardSpacing + 1 },
            {
              time: START,
              duration: START - (OVERLAP * cardSpacing + 1),
              immediateRender: false,
              ease: "none",
            },
          );

          return LOOP;
        };

        // ── State ────────────────────────────────────────────────────────────
        let iteration = 0; // increments/decrements on each full scroll-through
        const CARD_SNAP = snap(spacing);
        const CARDS = toArray(".card", galleryRef.current);
        const LOOP = buildLoop(CARDS, spacing);

        // Smooth-scrub tween — drives the LOOP playhead
        const SCRUB = to(LOOP, {
          totalTime: 0,
          duration: 0.5,
          ease: "power3",
          paused: true,
        });

        // ── Scroll-to helper ─────────────────────────────────────────────────
        //
        // Converts an absolute totalTime into a scroll position, handling
        // iteration wrapping so the playhead always moves in the right direction.
        //
        let TRIGGER;

        const scrubTo = (totalTime) => {
          const progress =
            (totalTime - LOOP.duration() * iteration) / LOOP.duration();
          if (progress > 1) {
            wrapForward();
          } else if (progress < 0) {
            wrapBackward();
          } else {
            TRIGGER.scroll(
              TRIGGER.start + progress * (TRIGGER.end - TRIGGER.start),
            );
          }
        };

        // ── Wrap helpers ─────────────────────────────────────────────────────
        const wrapForward = () => {
          iteration++;
          TRIGGER.wrapping = true;
          TRIGGER.scroll(TRIGGER.start + 1);
        };

        const wrapBackward = () => {
          iteration--;
          if (iteration < 0) {
            // Jump 10 loops ahead to avoid stalling at totalTime < 0
            iteration = 9;
            LOOP.totalTime(LOOP.totalTime() + LOOP.duration() * 10);
          }
          TRIGGER.wrapping = true;
          TRIGGER.scroll(TRIGGER.end - 1);
        };

        // ── ScrollTrigger ────────────────────────────────────────────────────
        TRIGGER = ScrollTrigger.create({
          start: 0,
          end: `+=${scrollLength}`,
          horizontal: false,
          pin: ".gallery",
          onUpdate: (self) => {
            if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
              wrapForward();
            } else if (
              self.progress < 1e-5 &&
              self.direction < 0 &&
              !self.wrapping
            ) {
              wrapBackward();
            } else {
              SCRUB.vars.totalTime = CARD_SNAP(
                (iteration + self.progress) * LOOP.duration(),
              );
              SCRUB.invalidate().restart();
              self.wrapping = false;
            }
          },
        });

        // ── Next / Prev button handlers ──────────────────────────────────────
        const handleNext = () => scrubTo(SCRUB.vars.totalTime + spacing);
        const handlePrev = () => scrubTo(SCRUB.vars.totalTime - spacing);

        const nextEl = nextBtnRef.current;
        const prevEl = prevBtnRef.current;
        nextEl?.addEventListener("click", handleNext);
        prevEl?.addEventListener("click", handlePrev);

        // ── Cleanup ──────────────────────────────────────────────────────────
        cleanupFn = () => {
          nextEl?.removeEventListener("click", handleNext);
          prevEl?.removeEventListener("click", handlePrev);
          TRIGGER.kill();
          LOOP.kill();
          SCRUB.kill();
        };
      })
      .catch((e) =>
        console.error("[GalleryCarousel] Script load failed:", e.message),
      );

    return () => {
      if (cleanupFn) cleanupFn();
    };
    // Re-run if tuneable props change
  }, [spacing, scrollLength]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/*
        Scoped styles for pseudo-class interactions that Tailwind cannot express:
        - hover-driven CSS custom property --card-y for the lift effect
        - .card__card transform that reads --card-y at runtime
      */}
      <style>{`
        .card:hover {
          --card-y: -2%;
        }
        .card__card {
          transform: translate3d(0, var(--card-y, 0), 0);
          transition: 0.1s ease;
        }
      `}</style>

      {/*
        overflow-hidden on the outer shell prevents the absolutely-positioned
        cards (xPercent: 250 → -250) from creating a horizontal scrollbar.
        The gallery div itself is sized to the viewport via w-screen/h-screen
        and pinned in place by ScrollTrigger.
      */}
      <div className="w-screen h-screen overflow-hidden">
        <div
          className="gallery w-full h-full relative"
          ref={galleryRef}
          style={{ background: bgColor }}
        >
          {/* Card list — centred on screen, cards are absolutely positioned by GSAP */}
          <ul className="gallery__content w-56 h-72 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            {Array.from({ length: cardCount }).map((_, i) => (
              <SingleCard
                key={i}
                pic={pics[i % pics.length]}
                title={titles[i % titles.length]}
                type={cardTypes[i]}
                bgColor={bgColor}
                reflectionBlur={reflectionBlur}
              />
            ))}
          </ul>

          {/* Navigation buttons */}
          <div className="gallery__actions">
            {/* Prev */}
            <button
              ref={prevBtnRef}
              className="gallery__prev outline-none absolute z-10 rounded-full transition left-8 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
            >
              <span className="sr-only">Prev</span>
              <svg
                className="h-12 w-12 fill-current text-white"
                viewBox="0 0 256 512"
                title="Previous"
              >
                <path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z" />
              </svg>
            </button>

            {/* Next */}
            <button
              ref={nextBtnRef}
              className="gallery__next outline-none absolute z-10 rounded-full right-8 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-12 w-12 fill-current text-white"
                viewBox="0 0 256 512"
                title="Next"
              >
                <path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
