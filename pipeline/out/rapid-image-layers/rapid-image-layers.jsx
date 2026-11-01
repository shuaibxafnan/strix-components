"use client";

import { useEffect, useId, useRef, useState } from "react";

const DEFAULT_LAYER_IMAGES = [
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_GRID_IMAGES = [
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_GRID_AREAS = [
  "2 / 1 / 5 / 3",
  "6 / 2 / 9 / 5",
  "3 / 4 / 7 / 7",
  "1 / 8 / 4 / 10",
  "4 / 10 / 7 / 14",
  "6 / 9 / 9 / 12",
];

const DEFAULT_MENU_ITEMS = [
  { title: "Underground", subtitle: "Hey, dreamypie, wake up!" },
  { title: "Commotion", subtitle: "Yo, sleepyhead! What's up?" },
  { title: "Interrogation", subtitle: "Ho ho, honey! What's the matter?" },
];

export default function RapidImageLayers({
  layerImages = DEFAULT_LAYER_IMAGES,
  gridImages = DEFAULT_GRID_IMAGES,
  gridAreas = DEFAULT_GRID_AREAS,
  menuItems = DEFAULT_MENU_ITEMS,
  activeIndex = 1,
  replayable = true,
  bgColor = "#0F0E0E",
  lineColor = "#ffffff",
  gridWidth = "80vw",
  gridHeight = "93%",
  gridGap = "1vw",
  gridColumns = 13,
  gridRows = 8,
  imageBrightness = 0.7,
  menuWidth = "110vw",
  stageHeightMobile = "400px",
  titleFontFamily = "Georgia, 'Times New Roman', serif",
  idleTitleColor = "#3c3a3b",
  idleSubtitleColor = "#3e3c3d",
  introTitleColor = "#e5e2e2",
  revealedTitleColor = "#ffffff",
  activeSubtitleColor = "#644B47",
  hoverTitleColor = "#ffffff",
  hoverSubtitleColor = "#88524a",
  introTitleSize = "5vw",
  activeTitleSize = "7vw",
  revealedTitleSize = "9vw",
  subtitleSize = "1.5vw",
  counterLabel = "01",
  layerDuration = 1,
  panelDelay = 0.15,
  panelEase = "power2.inOut",
  exitEase = "expo.inOut",
  gridEase = "expo.out",
  gridRevealFactor = 2,
  gridOffsetMin = 100,
  gridOffsetMax = 500,
  layersZIndex = 50,
  cursorEnabled = true,
  cursorRadius = 60,
  cursorHoverRadius = 100,
  cursorStroke = "#644B47",
  cursorStrokeWidth = 1,
  cursorFill = "none",
  cursorEase = 0.2,
  turbulenceAmount = 0.09,
  turbulenceDuration = 0.4,
  onRevealStart,
  onRevealComplete,
  className = "",
}) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const c = `ril-${uid}`;
  const filterId = `ril-filter-${uid}`;

  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const revealRef = useRef(null);
  const cursorApiRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);

  const cfgRef = useRef(null);
  cfgRef.current = {
    layerDuration,
    panelDelay,
    panelEase,
    exitEase,
    gridEase,
    gridRevealFactor,
    gridOffsetMin,
    gridOffsetMax,
    replayable,
    onRevealStart,
    onRevealComplete,
  };

  useEffect(() => {
    let disposed = false;
    let rafId = null;
    let timeline = null;
    const cleanups = [];

    import("gsap")
      .then((mod) => {
        const gsap = mod.gsap || mod.default;
        const root = rootRef.current;
        if (disposed || !gsap || !root) return;

        const layerEls = Array.from(root.querySelectorAll(`.${c}-layer`));
        const layerImgs = layerEls.map((el) =>
          el.querySelector(`.${c}-layer-img`),
        );
        const gridItems = Array.from(root.querySelectorAll(`.${c}-item`));
        const total = layerEls.length;
        if (!total) return;

        const randomFloat = (min, max) =>
          parseFloat(
            Math.min(min + Math.random() * (max - min), max).toFixed(2),
          );

        const resetStage = () => {
          gsap.set(layerEls, { y: "101%", opacity: 1, visibility: "visible" });
          gsap.set(layerImgs, { y: "-101%" });
          gsap.set(gridItems, { opacity: 0, y: 0 });
          root.classList.add(`${c}-intro`);
        };

        resetStage();
        setIsMounted(true);

        const buildTimeline = () => {
          const cfg = cfgRef.current;
          const tl = gsap.timeline({
            paused: true,
            onStart: () => {
              if (typeof cfg.onRevealStart === "function") cfg.onRevealStart();
            },
            onComplete: () => {
              if (typeof cfg.onRevealComplete === "function")
                cfg.onRevealComplete();
            },
          });

          for (let i = 0; i < total; i += 1) {
            tl.to(
              [layerEls[i], layerImgs[i]],
              {
                duration: cfg.layerDuration,
                ease: cfg.panelEase,
                y: "0%",
              },
              cfg.panelDelay * i,
            );
          }

          const halfway = cfg.panelDelay * (total - 1) + cfg.layerDuration;

          tl.addLabel("halfway", halfway)
            .call(
              () => {
                layerEls.forEach((el, pos) => {
                  if (pos !== total - 1) gsap.set(el, { opacity: 0 });
                });
                root.classList.remove(`${c}-intro`);
              },
              null,
              "halfway",
            )
            .to(
              layerEls[total - 1],
              {
                duration: cfg.layerDuration,
                ease: cfg.exitEase,
                y: "101%",
              },
              "halfway",
            )
            .to(
              layerImgs[total - 1],
              {
                duration: cfg.layerDuration,
                ease: cfg.exitEase,
                y: "-101%",
              },
              "halfway",
            )
            .fromTo(
              gridItems,
              { y: () => randomFloat(cfg.gridOffsetMin, cfg.gridOffsetMax) },
              {
                duration: cfg.layerDuration * cfg.gridRevealFactor,
                ease: cfg.gridEase,
                y: 0,
                opacity: 1,
              },
              "halfway",
            );

          return tl;
        };

        timeline = buildTimeline();

        revealRef.current = () => {
          if (!timeline) return;
          const p = timeline.progress();
          if (timeline.isActive()) return;
          if (p >= 1) {
            if (!cfgRef.current.replayable) return;
            timeline.kill();
            resetStage();
            timeline = buildTimeline();
          }
          timeline.play(0);
        };

        if (!cursorEnabled) return;

        const cursorEl = cursorRef.current;
        if (!cursorEl) return;

        const circle = cursorEl.querySelector(`.${c}-cursor-inner`);
        const feTurbulence = cursorEl.querySelector("feTurbulence");
        const bounds = cursorEl.getBoundingClientRect();
        const mouse = { x: 0, y: 0 };
        const primitives = { turbulence: 0 };
        let started = false;

        const styles = {
          tx: { previous: 0, current: 0 },
          ty: { previous: 0, current: 0 },
          radius: { previous: cursorRadius, current: cursorRadius },
        };

        const lerp = (a, b, n) => (1 - n) * a + n * b;

        const distortTl = gsap
          .timeline({
            paused: true,
            onStart: () => {
              circle.style.filter = `url(#${filterId})`;
            },
            onUpdate: () => {
              feTurbulence.setAttribute("baseFrequency", primitives.turbulence);
            },
            onComplete: () => {
              circle.style.filter = "none";
            },
          })
          .to(primitives, {
            duration: turbulenceDuration,
            startAt: { turbulence: turbulenceAmount },
            turbulence: 0,
          });

        const render = () => {
          styles.tx.current = mouse.x - bounds.width / 2;
          styles.ty.current = mouse.y - bounds.height / 2;
          Object.keys(styles).forEach((key) => {
            styles[key].previous = lerp(
              styles[key].previous,
              styles[key].current,
              cursorEase,
            );
          });
          cursorEl.style.transform = `translateX(${styles.tx.previous}px) translateY(${styles.ty.previous}px)`;
          circle.setAttribute("r", styles.radius.previous);
          rafId = requestAnimationFrame(render);
        };

        const onMouseMove = (ev) => {
          mouse.x = ev.clientX;
          mouse.y = ev.clientY;
          if (!started) {
            started = true;
            styles.tx.previous = styles.tx.current = mouse.x - bounds.width / 2;
            styles.ty.previous = styles.ty.current =
              mouse.y - bounds.height / 2;
            gsap.to(cursorEl, {
              duration: 0.9,
              ease: "power3.out",
              opacity: 1,
            });
            rafId = requestAnimationFrame(render);
          }
        };

        window.addEventListener("mousemove", onMouseMove);
        cleanups.push(() =>
          window.removeEventListener("mousemove", onMouseMove),
        );

        cursorApiRef.current = {
          enter: () => {
            styles.radius.current = cursorHoverRadius;
            distortTl.restart();
          },
          leave: () => {
            styles.radius.current = cursorRadius;
            distortTl.progress(1).kill();
          },
        };

        cleanups.push(() => {
          distortTl.kill();
          cursorApiRef.current = null;
        });
      })
      .catch((e) =>
        console.error("[RapidImageLayers] init failed:", e.message),
      );

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (timeline) timeline.kill();
      cleanups.forEach((fn) => fn());
      revealRef.current = null;
    };
  }, [
    c,
    filterId,
    cursorEnabled,
    cursorRadius,
    cursorHoverRadius,
    cursorEase,
    turbulenceAmount,
    turbulenceDuration,
  ]);

  const css = `
.${c}-stage { height: ${stageHeightMobile}; }
.${c}-grid {
  grid-area: 1 / 1 / 2 / 2;
  width: 100%;
  height: ${gridHeight};
  margin: auto;
  display: grid;
  grid-template-columns: repeat(${gridColumns}, 1fr);
  grid-template-rows: repeat(${gridRows}, 1fr);
  grid-gap: ${gridGap};
  position: relative;
}
.${c}-intro .${c}-grid::after { display: none; }
.${c}-item {
  background-size: cover;
  background-position: center;
  opacity: 0;
  -webkit-filter: brightness(${imageBrightness});
  filter: brightness(${imageBrightness});
  will-change: transform, opacity;
}
.${c}-menu {
  grid-area: 1 / 1 / 2 / 2;
  display: flex;
  width: 130vw;
  justify-content: space-between;
  align-self: center;
  justify-self: start;
  position: relative;
}
.${c}-mi {
  --title-color: ${idleTitleColor};
  --subtitle-color: ${idleSubtitleColor};
  --title-style: italic;
  --title-weight: 400;
  --title-size: ${activeTitleSize};
  --title-display: none;
  --subtitle-display: none;
  pointer-events: none;
}
.${c}-mi-title {
  font-family: ${titleFontFamily};
  font-size: var(--title-size);
  font-style: var(--title-style);
  font-weight: var(--title-weight);
  color: var(--title-color);
  margin: 0;
  display: var(--title-display);
  line-height: 1.05;
}
.${c}-mi-sub {
  font-family: ${titleFontFamily};
  color: var(--subtitle-color);
  text-align: right;
  margin: 0 -3rem 0 0;
  font-size: ${subtitleSize};
  display: var(--subtitle-display);
}
.${c}-mi--current {
  --title-color: ${revealedTitleColor};
  --subtitle-color: ${activeSubtitleColor};
  --title-style: italic;
  --title-weight: 900;
  --title-display: block;
  --title-size: ${revealedTitleSize};
  cursor: pointer;
}
.${c}-intro .${c}-mi--current::before {
  content: '${counterLabel}';
  position: absolute;
  bottom: 110%;
  color: var(--title-color);
}
.${c}-intro .${c}-mi--current:hover {
  --title-color: ${hoverTitleColor};
  --subtitle-color: ${hoverSubtitleColor};
}
.${c}-intro .${c}-mi--current {
  --title-color: ${introTitleColor};
  --title-style: normal;
  --title-size: ${activeTitleSize};
  pointer-events: auto;
}
.${c}-intro .${c}-mi {
  --title-size: ${introTitleSize};
  --subtitle-display: block;
  --title-display: block;
}
.${c}-layer {
  will-change: transform, opacity;
  backface-visibility: hidden;
}
.${c}-layer-img {
  background-size: cover;
  background-position: 50% 50%;
  will-change: transform;
  backface-visibility: hidden;
}
.${c}-cursor { display: none; }
@media (any-pointer: fine) {
  .${c}-cursor {
    position: fixed;
    top: 0;
    left: 0;
    display: block;
    pointer-events: none;
    opacity: 0;
    z-index: ${layersZIndex + 10};
  }
}
@media screen and (min-width: 53em) {
  .${c}-stage { height: 100vh; }
  .${c}-grid { width: ${gridWidth}; }
  .${c}-menu { width: ${menuWidth}; }
}
`;

  const handleEnter = () => {
    if (cursorApiRef.current) cursorApiRef.current.enter();
  };

  const handleLeave = () => {
    if (cursorApiRef.current) cursorApiRef.current.leave();
  };

  const handleClick = () => {
    if (revealRef.current) revealRef.current();
  };

  return (
    <div
      ref={rootRef}
      className={`${c}-root ${c}-intro relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`${c}-stage grid w-full justify-center overflow-hidden`}>
        <div className={`${c}-grid`}>
          {gridImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className={`${c}-item`}
              style={{
                gridArea: gridAreas[i % gridAreas.length],
                backgroundImage: `url(${src})`,
              }}
            />
          ))}
        </div>

        <nav className={`${c}-menu`}>
          {menuItems.map((item, i) => (
            <div
              key={`${item.title}-${i}`}
              className={`${c}-mi ${
                i === activeIndex ? `${c}-mi--current` : ""
              }`}
              onClick={i === activeIndex ? handleClick : undefined}
              onMouseEnter={i === activeIndex ? handleEnter : undefined}
              onMouseLeave={i === activeIndex ? handleLeave : undefined}
            >
              <h2 className={`${c}-mi-title`}>{item.title}</h2>
              <p className={`${c}-mi-sub`}>{item.subtitle}</p>
            </div>
          ))}
        </nav>
      </div>

      <div
        className={`${c}-layers pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden`}
        style={{ zIndex: layersZIndex }}
      >
        {layerImages.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`${c}-layer absolute left-0 top-0 h-full w-full overflow-hidden`}
            style={{ visibility: isMounted ? "visible" : "hidden" }}
          >
            <div
              className={`${c}-layer-img h-full w-full`}
              style={{ backgroundImage: `url(${src})` }}
            />
          </div>
        ))}
      </div>

      {cursorEnabled ? (
        <svg
          ref={cursorRef}
          className={`${c}-cursor`}
          width="220"
          height="220"
          viewBox="0 0 220 220"
        >
          <defs>
            <filter
              id={filterId}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
              filterUnits="objectBoundingBox"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0"
                numOctaves="1"
                result="warp"
              />
              <feOffset dx="-30" result="warpOffset" />
              <feDisplacementMap
                xChannelSelector="R"
                yChannelSelector="G"
                scale="30"
                in="SourceGraphic"
                in2="warpOffset"
              />
            </filter>
          </defs>
          <circle
            className={`${c}-cursor-inner`}
            cx="110"
            cy="110"
            r={cursorRadius}
            fill={cursorFill}
            stroke={cursorStroke}
            strokeWidth={cursorStrokeWidth}
          />
        </svg>
      ) : null}
    </div>
  );
}
