"use client";

import { useEffect, useRef, useState } from "react";

const GSAP_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";

const scriptCache = new Map();

const loadScript = (src) => {
  if (scriptCache.has(src)) return scriptCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = resolve;
    el.onerror = () => {
      scriptCache.delete(src);
      reject(new Error(`Failed: ${src}`));
    };
    document.head.appendChild(el);
  });
  scriptCache.set(src, promise);
  return promise;
};

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

const DEFAULT_ITEMS = [
  {
    image: photo("1595598034023-ca08624ce05d"),
    title: "Silence",
    year: "2021",
    description: "Where sound drops away and the frame holds still.",
  },
  {
    image: photo("1781798715946-2e198afc29a7"),
    title: "Resonance",
    year: "2022",
    description: "A single note carried through an empty room.",
  },
  {
    image: photo("1725161834547-ba8a90bf5a15"),
    title: "Essence",
    year: "2022",
    description: "Everything unnecessary taken out, what stays is enough.",
  },
  {
    image: photo("1782806007529-90a2ab4b98d9"),
    title: "Void",
    year: "2023",
    description: "Negative space treated as the subject, not the background.",
  },
  {
    image: photo("1779877716206-f441d5d384d4"),
    title: "Presence",
    year: "2023",
    description: "Being fully in one place for the length of an exposure.",
  },
  {
    image: photo("1779862946918-a129ac57c60e"),
    title: "Flow",
    year: "2024",
    description: "Movement caught between one moment and the next.",
  },
  {
    image: photo("1780580940878-248a6ad4b626"),
    title: "Clarity",
    year: "2024",
    description: "Hard light, clean edges, nothing left to interpret.",
  },
  {
    image: photo("1781513747645-757fb2619e57"),
    title: "Breath",
    year: "2024",
    description: "Slow rhythm, held at the top of the inhale.",
  },
  {
    image: photo("1780163930838-1502715c3bc1"),
    title: "Stillness",
    year: "2025",
    description: "The pause that makes the surrounding motion readable.",
  },
  {
    image: photo("1780269579991-79bc18ee6f56"),
    title: "Surrender",
    year: "2025",
    description: "Letting the scene decide how it wants to be seen.",
  },
  {
    image: photo("1781798715946-2e198afc29a7"),
    title: "Drift",
    year: "2025",
    description: "No destination, only direction.",
  },
  {
    image: photo("1779862946918-a129ac57c60e"),
    title: "Echo",
    year: "2026",
    description: "The same idea, returning quieter each time.",
  },
];

const COLUMNS = 5;
const ROWS = 5;
const COLUMN_DURATION = [40, 35, 26];
const REST = "grayscale(0) brightness(1)";
const DIMMED = "grayscale(1) brightness(0.35)";

const pad = (n) => String(n).padStart(2, "0");

export default function InteractivePhotoGrid({
  items = DEFAULT_ITEMS,
  heading = "Selected Works",
  subheading = "Quiet studies in light, space and absence.",
  hint = "Hover to pause a column. Click to open.",
  backLabel = "Back to grid",
  prevLabel = "Previous",
  nextLabel = "Next",
  backgroundColor = "bg-black",
  textColor = "text-white",
  panelPerspective = 800,
  gridRotationX = 15,
  gridRotationY = -15,
  gridRotationZ = 10,
  gridLeftPosition = "75%",
  gridWidth = 1200,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const mainRef = useRef(null);
  const mainBoxesRef = useRef(null);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  const stateRef = useRef({
    currentImg: null,
    currentImgProps: { x: 0, y: 0 },
    isZooming: false,
    delayedPlay: null,
    boxes: [],
    base: 0.5,
    hover: 0.62,
  });

  const perCol = ROWS;
  const loopItems = Array.from(
    { length: COLUMNS * ROWS },
    (_, i) => items[i % items.length],
  );
  const active = items[activeIndex] || items[0];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    let cancelled = false;

    loadScript(GSAP_SRC)
      .then(() => {
        if (cancelled) return;
        const { gsap } = window;
        if (!gsap || !mainBoxesRef.current || !mainRef.current) return;

        const nodes = Array.from(mainBoxesRef.current.children);
        const height = mainRef.current.clientHeight;
        const k = Math.min(Math.max(height / 880, 0.8), 1.7);
        const base = 0.5 * k;
        const spacing = 343.75 * k;
        const travel = perCol * spacing;
        const startTop = -615 * k - 320 * (1 - base);
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        stateRef.current.base = base;
        stateRef.current.hover = base * 1.24;

        const boxes = nodes.map((el, i) => {
          const col = Math.min(Math.floor(i / perCol), COLUMNS - 1);
          const down = col % 2 === 0;
          const startY = down ? startTop : startTop + travel;
          const endY = down ? startTop + travel : startTop;
          const centerX = 480 + (col - (COLUMNS - 1) / 2) * 220 * k;

          gsap.set(el, {
            x: centerX - 200,
            scale: base,
            zIndex: 1,
            filter: REST,
          });

          const tl = gsap
            .timeline({ paused: true, repeat: -1 })
            .fromTo(
              el,
              { y: startY, rotation: -0.05 },
              {
                duration:
                  COLUMN_DURATION[col % COLUMN_DURATION.length] *
                  (perCol / 4),
                y: endY,
                rotation: 0.05,
                ease: "none",
              },
            )
            .progress((i - col * perCol) / perCol);

          return { el, col, tl };
        });

        stateRef.current.boxes = boxes;

        gsap.set(mainRef.current, { perspective: panelPerspective });
        gsap.set(nodes, { opacity: 1, cursor: "pointer" });
        gsap.set(mainBoxesRef.current, {
          left: gridLeftPosition,
          xPercent: -50,
          width: gridWidth,
          rotationX: gridRotationX,
          rotationY: gridRotationY,
          rotationZ: gridRotationZ,
        });

        gsap.fromTo(
          mainRef.current,
          { autoAlpha: 0 },
          {
            duration: 0.6,
            delay: 0.2,
            ease: "power2.inOut",
            autoAlpha: 1,
            onStart: () => {
              if (reduceMotion) return;
              boxes.forEach(({ tl }) => {
                tl.play();
                gsap.to(tl, {
                  duration: 0.4,
                  timeScale: 1,
                  ease: "sine.in",
                  overwrite: true,
                });
              });
            },
          },
        );

        gsap.fromTo(
          overlayRef.current,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 1.2, delay: 0.6, ease: "expo.out" },
        );
      })
      .catch((err) => {
        console.error("[InteractivePhotoGrid] Setup failed:", err.message);
        if (mainRef.current) mainRef.current.style.visibility = "visible";
      });

    return () => {
      cancelled = true;
      const { gsap } = window;
      const state = stateRef.current;
      if (state.delayedPlay) state.delayedPlay.kill();
      state.boxes.forEach(({ tl }) => tl.kill());
      if (gsap) {
        gsap.killTweensOf([
          mainRef.current,
          mainBoxesRef.current,
          overlayRef.current,
          panelRef.current,
          ...state.boxes.map((b) => b.el),
        ]);
      }
      state.boxes = [];
      state.currentImg = null;
    };
  }, [
    isMounted,
    perCol,
    panelPerspective,
    gridLeftPosition,
    gridWidth,
    gridRotationX,
    gridRotationY,
    gridRotationZ,
  ]);

  const playBoxes = () => {
    const { gsap } = window;
    if (!gsap) return;
    stateRef.current.boxes.forEach(({ tl }) => {
      tl.play();
      gsap.to(tl, {
        duration: 0.4,
        timeScale: 1,
        ease: "sine.in",
        overwrite: true,
      });
    });
  };

  const pauseColumn = (col) => {
    const { gsap } = window;
    if (!gsap) return;
    stateRef.current.boxes.forEach((b) => {
      if (b.col === col) {
        gsap.to(b.tl, { timeScale: 0, ease: "sine", overwrite: true });
      }
    });
  };

  const handleMouseEnter = (e) => {
    const { gsap } = window;
    const state = stateRef.current;
    if (!gsap || state.currentImg || !mainBoxesRef.current) return;

    if (state.delayedPlay) state.delayedPlay.kill();

    const target = e.currentTarget;
    pauseColumn(Number(target.dataset.col));

    gsap.to(mainBoxesRef.current.children, {
      duration: 0.3,
      overwrite: "auto",
      filter: (i, t) => (t === target ? REST : DIMMED),
    });
    gsap.fromTo(
      target,
      { zIndex: 100 },
      { duration: 0.2, scale: state.hover, overwrite: "auto", ease: "power3" },
    );
  };

  const handleMouseLeave = (e) => {
    const { gsap } = window;
    const state = stateRef.current;
    if (!gsap || state.currentImg || !mainBoxesRef.current) return;

    const target = e.currentTarget;

    if (gsap.getProperty(target, "scale") > state.hover * 0.99) {
      state.delayedPlay = gsap.delayedCall(0.3, playBoxes);
    } else {
      playBoxes();
    }

    gsap
      .timeline()
      .set(target, { zIndex: 1 })
      .to(
        target,
        { duration: 0.3, scale: state.base, overwrite: "auto", ease: "expo" },
        0,
      )
      .to(
        mainBoxesRef.current.children,
        { duration: 0.5, filter: REST, ease: "power2.inOut" },
        0,
      );
  };

  const openCard = (target) => {
    const { gsap } = window;
    const state = stateRef.current;
    const main = mainRef.current;
    if (!gsap || !main || !mainBoxesRef.current || !panelRef.current) return;

    const w = main.clientWidth;
    const h = main.clientHeight;
    const compact = w < 768;
    const frame = compact
      ? { x: 0, width: w, height: h * 0.55 }
      : { x: w * 0.4, width: w * 0.6, height: h };

    const record = state.boxes.find((b) => b.el === target);
    pauseColumn(Number(target.dataset.col));
    if (record) record.tl.pause();

    target.dataset.zoomed = "true";
    state.currentImg = target;
    state.currentImgProps.x = gsap.getProperty(target, "x");
    state.currentImgProps.y = gsap.getProperty(target, "y");
    setActiveIndex(Number(target.dataset.item));

    const img = target.querySelector("img");
    const panelItems = panelRef.current.querySelectorAll(".js-panel-item");

    gsap
      .timeline({ defaults: { duration: 0.8, ease: "expo.inOut" } })
      .set(target, { zIndex: 100 })
      .to(overlayRef.current, { autoAlpha: 0, y: -20, duration: 0.4 }, 0)
      .to(
        mainBoxesRef.current.children,
        { opacity: (i, t) => (t === target ? 1 : 0), duration: 0.5 },
        0,
      )
      .to(
        target,
        {
          width: frame.width,
          height: frame.height,
          x: frame.x,
          y: 0,
          top: 0,
          scale: 1,
          rotation: 0,
          filter: REST,
        },
        0,
      )
      .to(
        mainBoxesRef.current,
        {
          duration: 0.6,
          left: "50%",
          width: "100%",
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          overwrite: true,
        },
        0.1,
      )
      .fromTo(
        img,
        { scale: 1.25 },
        { scale: 1, duration: 1.4, ease: "expo.out" },
        0.2,
      )
      .set(panelRef.current, { autoAlpha: 1 }, 0.3)
      .fromTo(
        panelItems,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 },
        0.4,
      );
  };

  const closeCard = (keepOverlay) => {
    const { gsap } = window;
    const state = stateRef.current;
    const closing = state.currentImg;
    if (!gsap || !closing || !mainBoxesRef.current) return;

    closing.dataset.zoomed = "false";
    state.currentImg = null;

    const tl = gsap
      .timeline({ defaults: { ease: "expo.inOut" } })
      .to(panelRef.current, { duration: 0.3, autoAlpha: 0 }, 0)
      .to(
        mainBoxesRef.current,
        {
          duration: 0.6,
          left: gridLeftPosition,
          width: gridWidth,
          rotationX: gridRotationX,
          rotationY: gridRotationY,
          rotationZ: gridRotationZ,
          overwrite: true,
        },
        0,
      )
      .to(
        mainBoxesRef.current.children,
        { duration: 0.6, opacity: 1, filter: REST, ease: "power4.inOut" },
        0,
      )
      .to(
        closing,
        {
          duration: 0.6,
          width: 400,
          height: 640,
          x: state.currentImgProps.x,
          y: state.currentImgProps.y,
          scale: state.base,
          rotation: 0,
          zIndex: 1,
        },
        0,
      );

    if (!keepOverlay) {
      tl.to(
        overlayRef.current,
        { duration: 0.8, autoAlpha: 1, y: 0, ease: "expo.out" },
        0.3,
      );
    }
  };

  const handleBoxClick = (e) => {
    const { gsap } = window;
    const state = stateRef.current;
    if (!gsap || state.isZooming || !mainBoxesRef.current) return;

    state.isZooming = true;
    gsap.delayedCall(0.8, () => {
      state.isZooming = false;
    });

    if (state.currentImg) {
      closeCard(false);
      gsap.delayedCall(0.6, playBoxes);
    } else {
      openCard(e.currentTarget);
    }
  };

  const handleBack = () => {
    const state = stateRef.current;
    if (state.currentImg) handleBoxClick({ currentTarget: state.currentImg });
  };

  const goTo = (delta) => {
    const { gsap } = window;
    const state = stateRef.current;
    if (!gsap || state.isZooming || !state.currentImg) return;

    const nodes = Array.from(mainBoxesRef.current.children);
    const index = Number(state.currentImg.dataset.index);
    const next = nodes[(index + delta + nodes.length) % nodes.length];

    state.isZooming = true;
    closeCard(true);
    gsap.delayedCall(0.55, () => {
      playBoxes();
      openCard(next);
    });
    gsap.delayedCall(1.4, () => {
      state.isZooming = false;
    });
  };

  const handleCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBoxClick(e);
    }
  };

  const handleRootKeyDown = (e) => {
    if (e.key === "Escape") handleBack();
  };

  if (!isMounted) {
    return <div className={`h-screen w-full ${backgroundColor}`} />;
  }

  return (
    <div
      ref={mainRef}
      onKeyDown={handleRootKeyDown}
      className={`invisible relative h-screen w-full select-none overflow-hidden ${backgroundColor} ${textColor}`}
    >
      <div
        ref={mainBoxesRef}
        className="absolute top-0 h-full w-full"
      >
        {loopItems.map((item, i) => {
          const col = Math.min(Math.floor(i / perCol), COLUMNS - 1);
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-label={item.title}
              data-col={col}
              data-index={i}
              data-item={i % items.length}
              data-zoomed="false"
              className="group absolute h-[640px] w-[400px] cursor-pointer overflow-hidden bg-white/5 outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-white"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleMouseEnter}
              onBlur={handleMouseLeave}
              onClick={handleBoxClick}
              onKeyDown={handleCardKeyDown}
            >
              <img
                src={item.image}
                alt={item.title}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
              />
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-full items-end justify-between p-6 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 group-data-[zoomed=true]:invisible ${backgroundColor} ${textColor}`}
              >
                <span className="text-[2rem] font-semibold leading-none tracking-tight">
                  {item.title}
                </span>
                <span className="text-lg tabular-nums opacity-60">
                  {item.year}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        ref={overlayRef}
        className="pointer-events-none absolute bottom-10 left-6 z-20 max-w-[min(90vw,44rem)] text-white mix-blend-difference md:left-12"
      >
        <h1 className="text-[clamp(3.5rem,10vw,10rem)] font-semibold leading-[0.88] tracking-[-0.05em]">
          {heading}
        </h1>
        <p className="mt-6 max-w-sm text-base text-white/70">{subheading}</p>
        <p className="mt-2 text-sm text-white/50">{hint}</p>
      </div>

      <div
        ref={panelRef}
        className={`invisible absolute inset-x-0 bottom-0 z-30 flex h-[45%] flex-col justify-between p-6 md:inset-y-0 md:left-0 md:h-full md:w-[40%] md:p-12 ${textColor}`}
      >
        <button
          type="button"
          onClick={handleBack}
          className="js-panel-item self-start border-b border-current pb-1 text-sm outline-none focus-visible:opacity-60"
        >
          {backLabel}
        </button>

        <div>
          <p className="js-panel-item text-sm tabular-nums opacity-60">
            {pad(activeIndex + 1)} / {pad(items.length)}
          </p>
          <h2 className="js-panel-item mt-4 text-[clamp(3rem,7vw,8rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
            {active.title}
          </h2>
          <p className="js-panel-item mt-3 text-xl tabular-nums opacity-60">
            {active.year}
          </p>
          {active.description ? (
            <p className="js-panel-item mt-6 max-w-sm text-base opacity-70">
              {active.description}
            </p>
          ) : null}
        </div>

        <div className="js-panel-item flex items-center gap-8 text-sm">
          <button
            type="button"
            onClick={() => goTo(-1)}
            className="border-b border-current pb-1 outline-none focus-visible:opacity-60"
          >
            {prevLabel}
          </button>
          <button
            type="button"
            onClick={() => goTo(1)}
            className="border-b border-current pb-1 outline-none focus-visible:opacity-60"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}