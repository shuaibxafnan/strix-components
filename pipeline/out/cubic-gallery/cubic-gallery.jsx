"use client";

import { useEffect, useRef, useCallback } from "react";

const DEFAULT_IMAGES = [
  "https://picsum.photos/id/106/900/500",
  "https://picsum.photos/id/115/900/500",
  "https://picsum.photos/id/116/900/500",
  "https://picsum.photos/id/124/900/500",
  "https://picsum.photos/id/126/900/500",
  "https://picsum.photos/id/130/900/500",
  "https://picsum.photos/id/143/900/500",
  "https://picsum.photos/id/152/900/500",
  "https://picsum.photos/id/167/900/500",
  "https://picsum.photos/id/190/900/500",
  "https://picsum.photos/id/191/900/500",
  "https://picsum.photos/id/193/900/500",
  "https://picsum.photos/id/195/900/500",
  "https://picsum.photos/id/204/900/500",
  "https://picsum.photos/id/227/900/500",
  "https://picsum.photos/id/251/900/500",
  "https://picsum.photos/id/253/900/500",
  "https://picsum.photos/id/256/900/500",
  "https://picsum.photos/id/257/900/500",
  "https://picsum.photos/id/259/900/500",
  "https://picsum.photos/id/271/900/500",
  "https://picsum.photos/id/274/900/500",
  "https://picsum.photos/id/277/900/500",
  "https://picsum.photos/id/278/900/500",
  "https://picsum.photos/id/289/900/500",
  "https://picsum.photos/id/291/900/500",
];

const DIRECTIONS = ["top", "right", "bottom", "left"];

const TILE_DEPTH = {
  top: () => "-100vh",
  left: () => "-50vw",
  bottom: () => "-50vh",
  right: () => "-50vw",
};

const GRADIENT_DIR = {
  top: "180deg",
  left: "90deg",
  bottom: "0deg",
  right: "270deg",
};

export default function CubicGallery({
  images = DEFAULT_IMAGES,
  density = 5,
  fillSpeed = 200,
  wallSize = "1800px",
  perspective = "1000px",
  tileGap = 6,
  revealDistance = 0,
  themeColor = "#fff",
  accentColor = "orangered",
  tileBorderColor = "#fff",
  showHeroContent = true,
  heroTitle = "Photo",
  heroSubtitle = "A cubic photo gallery experiment.",
  focusBtnLabel = "Focus",
  backBtnLabel = "Back to Gallery",
  className = "",
}) {
  const containerRef = useRef(null);
  const faceRefs = useRef({});
  const stateRef = useRef({
    allTiles: [],
    intervalId: null,
    isPaused: false,
    loadedCount: 0,
    revDis: revealDistance,
  });
  const animFrameRef = useRef(null);

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const preload = (srcs, cb) => {
    let done = 0;
    if (srcs.length === 0) {
      cb();
      return;
    }
    srcs.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (++done === srcs.length) cb();
      };
      img.src = src;
    });
  };

  const pauseInterval = useCallback(() => {
    stateRef.current.isPaused = true;
    if (stateRef.current.intervalId) {
      clearInterval(stateRef.current.intervalId);
      stateRef.current.intervalId = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    const s = stateRef.current;
    if (s.intervalId) clearInterval(s.intervalId);
    s.loadedCount = 0;
    s.isPaused = false;

    s.intervalId = setInterval(() => {
      if (s.isPaused) return;
      const unloaded = s.allTiles.filter((t) => !t.dataset.loaded);
      if (unloaded.length === 0) {
        clearInterval(s.intervalId);
        return;
      }

      const tile = pick(unloaded);
      const img = pick(images);

      tile.style.backgroundImage = `url('${img}')`;
      tile.style.backgroundSize = "cover";
      tile.style.backgroundPosition = "center";
      tile.dataset.loaded = "1";

      tile.style.opacity = "1";
      tile.style.transform = "translate3d(0,0,-1px)";
      tile.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";

      tile.addEventListener(
        "click",
        () => {
          tile.classList.add("cg-selected");
          tile.parentElement.classList.add("cg-selectedPane");
          pauseInterval();
        },
        { once: true },
      );

      s.loadedCount++;
    }, fillSpeed);
  }, [images, fillSpeed, pauseInterval]);

  const buildWalls = useCallback(() => {
    const s = stateRef.current;
    s.allTiles = [];

    DIRECTIONS.forEach((dir) => {
      const face = faceRefs.current[dir];
      if (!face) return;

      Array.from(face.querySelectorAll(".cg-tile")).forEach((t) => t.remove());

      const count = density * density;
      for (let i = 0; i < count; i++) {
        const tile = document.createElement("div");
        tile.className = "cg-tile";

        const depth = TILE_DEPTH[dir]();
        tile.style.cssText = `
          width:100%; height:100%;
          opacity:0;
          background:repeating-linear-gradient(45deg,#94a4c211 0%,#94a4c211 5%,transparent 5%,transparent 10%);
          cursor:pointer;
          box-sizing:border-box;
          transform: translate3d(0,0,${depth});
        `;

        tile.addEventListener("mouseenter", () => {
          if (!tile.dataset.loaded) return;
          tile.style.outline = `4px solid ${tileBorderColor}`;
        });
        tile.addEventListener("mouseleave", () => {
          tile.style.outline = "none";
        });

        face.appendChild(tile);
        s.allTiles.push(tile);
      }
    });

    startInterval();
  }, [density, startInterval, tileBorderColor]);

  const handleBack = useCallback(() => {
    const selected = containerRef.current?.querySelector(".cg-selected");
    const pane = containerRef.current?.querySelector(".cg-selectedPane");
    selected?.classList.remove("cg-selected");
    pane?.classList.remove("cg-selectedPane");
    stateRef.current.isPaused = false;
    startInterval();
  }, [startInterval]);

  const animateReveal = useCallback((toValue, duration = 1000) => {
    const s = stateRef.current;
    const fromValue = s.revDis;
    const start = performance.now();

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = fromValue + (toValue - fromValue) * eased;
      s.revDis = cur;
      containerRef.current?.style.setProperty("--rev-dis", cur.toFixed(2));
      if (t < 1) animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.style.setProperty("--sz", wallSize);
    container.style.setProperty("--grid-sz", density);
    container.style.setProperty("--rev-dis", revealDistance);

    preload(images, buildWalls);

    return () => {
      if (stateRef.current.intervalId)
        clearInterval(stateRef.current.intervalId);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

  }, [density, fillSpeed, images, wallSize]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.perspective = perspective;
    }
  }, [perspective]);

  const handleFocus = () => {
    const current = stateRef.current.revDis;
    animateReveal(current >= 99 ? 0 : 100);
  };

  return (
    <div
      className={`relative w-full h-screen overflow-hidden flex items-center justify-center ${className}`}
      style={{
        backgroundColor: themeColor,
        fontFamily: "'Mona Sans', sans-serif",
      }}
    >

      <button
        onClick={handleBack}
        className="
          absolute top-4 left-4 z-[101]
          bg-[#1e1e1e] text-white px-10 py-1.5 rounded-xl
          border border-[#aaa] cursor-pointer
          transition-shadow duration-200
          hover:shadow-[inset_0_0_8px_1px_#fff,inset_0_0_0_1px_#fff]
          opacity-0 pointer-events-none
          [.cg-has-pane_&]:opacity-100 [.cg-has-pane_&]:pointer-events-auto
        "
        id="cg-back-btn"
      >
        {backBtnLabel}
      </button>

      {showHeroContent && (
        <div
          className="
            absolute inset-0 m-auto
            w-[34%] h-[34%] min-w-[240px]
            z-[5] rounded-lg
            flex flex-col items-center gap-3 justify-center
            [.cg-has-pane_&]:opacity-0 [.cg-has-pane_&]:-z-10
            transition-opacity duration-[400ms]
          "
          style={{ backdropFilter: "blur(3px)" }}
        >
          <h2 className="text-5xl font-semibold m-0 text-black select-none">
            {heroTitle}
            <span style={{ color: accentColor }}>³</span>
          </h2>
          <p className="text-[#333] font-medium text-center text-sm">
            <span style={{ color: accentColor }}>
              {heroSubtitle.split(" ")[0]}{" "}
            </span>
            {heroSubtitle.split(" ").slice(1).join(" ")}
          </p>
          <button
            onClick={handleFocus}
            className="
              bg-[#1e1e1e] text-white px-10 py-1.5 rounded-md mt-2 cursor-pointer
              transition-shadow duration-200
              hover:shadow-[inset_0_0_8px_1px_#fff,inset_0_0_0_1px_#fff]
              border-0
            "
          >
            {focusBtnLabel}
          </button>
        </div>
      )}

      <section
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          perspective,

          "--sz": wallSize,
          "--grid-sz": density,
          "--rev-dis": revealDistance,
          "--theme-clr": themeColor,
          "--tile-gap": `${tileGap}px`,
        }}
        id="cg-container"
      >
        {DIRECTIONS.map((dir) => (
          <div
            key={dir}
            ref={(el) => {
              faceRefs.current[dir] = el;
            }}
            className={`cg-face cg-face-${dir}`}
            data-dir={dir}
          />
        ))}
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&display=swap');

        .cg-face {
          position: absolute;
          width: 100%; height: 100%;
          transform-style: preserve-3d;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(var(--grid-sz), 1fr);
          grid-template-rows: repeat(var(--grid-sz), 1fr);
          gap: var(--tile-gap, 6px);
        }

        .cg-face::after {
          content: '';
          display: block;
          height: 100%;
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
        }

        .cg-face-top {
          top: 0;
          transform-origin: top center;
          transform: rotateX(-90deg);
          height: var(--sz);
        }
        .cg-face-top::after {
          background: linear-gradient(
            180deg,
            transparent,
            var(--theme-clr) calc(1% * (100 - var(--rev-dis)))
          );
        }

        .cg-face-left {
          left: 0;
          transform-origin: center left;
          transform: rotateY(90deg);
          width: var(--sz);
        }
        .cg-face-left::after {
          background: linear-gradient(
            90deg,
            transparent,
            var(--theme-clr) calc(1% * (100 - var(--rev-dis)))
          );
        }

        .cg-face-bottom {
          bottom: 0;
          transform-origin: bottom center;
          transform: rotateX(90deg);
          height: var(--sz);
        }
        .cg-face-bottom::after {
          background: linear-gradient(
            0deg,
            transparent,
            var(--theme-clr) calc(1% * (100 - var(--rev-dis)))
          );
        }

        .cg-face-right {
          right: 0;
          transform-origin: center right;
          transform: rotateY(-90deg);
          width: var(--sz);
        }
        .cg-face-right::after {
          background: linear-gradient(
            270deg,
            transparent,
            var(--theme-clr) calc(1% * (100 - var(--rev-dis)))
          );
        }

        .cg-selectedPane {
          transform: rotateX(0deg) !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 100;
          transition: all 1s ease-in-out;
          position: absolute;
        }
        .cg-selectedPane::after { background: none !important; }

        .cg-selectedPane .cg-tile { opacity: 0 !important; }

        .cg-selectedPane .cg-selected {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          opacity: 0;
          z-index: 100;
          cursor: default !important;
          background-repeat: no-repeat !important;
          background-size: cover !important;
          background-position: center !important;
          transform: translate3d(0, 100px, 0);
          animation: cg-fadeIn 1s forwards;
          transition: all 1s ease-in-out;
        }
        .cg-selected:hover { outline: none !important; }

        @keyframes cg-fadeIn { to { opacity: 1; } }

      `}</style>

      <MutationBridge containerRef={containerRef} />
    </div>
  );
}

function MutationBridge({ containerRef }) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root = container.parentElement;
    if (!root) return;

    const observer = new MutationObserver(() => {
      const hasPaneOpen = !!container.querySelector(".cg-selectedPane");
      root.classList.toggle("cg-has-pane", hasPaneOpen);
    });

    observer.observe(container, { subtree: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [containerRef]);

  return null;
}
