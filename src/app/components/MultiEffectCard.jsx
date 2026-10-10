"use client";

import { useEffect, useRef, useState } from "react";

// ─── ImageStackHover ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// imageUrl         string   portrait-fashion-009.jpg   Image shown on every stacked layer
// layerCount       number   10                         Number of stacked layers
// size             number   600                        Container width/height (px)
// initialShape     string   "rectangle"                Starting clip shape: rectangle | circle | diamond | hexagon
// depthStep        number   36                          3D z-offset between layers (px)
// scale3d          number   0.07                        Per-layer scale falloff in 3D mode
// tiltMax          number   45                          Max tilt rotation in 3D mode (deg)
// panMax           number   88                          Max pan translation in 3D mode (px)
// opacityFalloff   number   0.1                          Per-layer opacity falloff in 3D mode
// moveAmplify      number   0.54                        Overall 3D pointer-response multiplier
// tiltBoost        number   1.25                        Extra multiplier applied to tilt
// panBoost         number   1.25                        Extra multiplier applied to pan
// showCredit       boolean  true                        Show the small credit link under the widget
// creditText       string   "ORIGINAL IDEA BY BL/S®"    Credit link label
// creditHref       string   codepen link                Credit link target
// ──────────────────────────────────────────────────────────────────────────

const SHAPES = ["rectangle", "circle", "diamond", "hexagon"];

const CLIP_PATHS = {
  rectangle: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  circle: "circle(45% at 50% 50%)",
  diamond: "polygon(50% 0%, 14.1% 50%, 50% 100%, 85.9% 50%)",
  hexagon:
    "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
};

export default function MultiEffectCard({
  imageUrl = "https://assets.codepen.io/7558/portrait-fashion-009.jpg",
  layerCount = 10,
  size = 600,
  initialShape = "rectangle",
  depthStep = 36,
  scale3d = 0.07,
  tiltMax = 45,
  panMax = 88,
  opacityFalloff = 0.1,
  moveAmplify = 0.54,
  tiltBoost = 1.25,
  panBoost = 1.25,
  showCredit = true,
  creditText = "ORIGINAL IDEA BY BL/S®",
  creditHref = "https://codepen.io/blacklead-studio/pen/QwjGRmo",
}) {
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const settingsRef = useRef(null);
  const apiRef = useRef(null);

  const [activeShape, setActiveShape] = useState(initialShape);
  const [rotationOn, setRotationOn] = useState(false);
  const [blurOn, setBlurOn] = useState(false);
  const [colorOn, setColorOn] = useState(false);
  const [opacityOn, setOpacityOn] = useState(false);
  const [parallaxOn, setParallaxOn] = useState(false);
  const [threeDOn, setThreeDOn] = useState(false);

  const [tilt, setTilt] = useState(tiltMax);
  const [pan, setPan] = useState(panMax);
  const [depth, setDepth] = useState(depthStep);
  const [amp, setAmp] = useState(Math.round(moveAmplify * 100));

  useEffect(() => {
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

    let cancelled = false;
    let cleanup = () => {};

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        if (cancelled) return;
        const { gsap } = window;
        if (!gsap || !containerRef.current || !rootRef.current) return;

        const root = rootRef.current;
        const container = containerRef.current;
        const stackEl = document.createElement("div");
        stackEl.className = "ish-image-stack";
        Object.assign(stackEl.style, {
          position: "absolute",
          inset: "0",
          willChange: "transform",
        });
        const layers = Array.from(
          container.querySelectorAll(".ish-image-layer"),
        );
        layers.forEach((l) => stackEl.appendChild(l));
        container.appendChild(stackEl);

        const duration = 0.8,
          ease = "power2.inOut",
          scaleInterval = 0.06,
          opacityInterval = 0.05,
          rotationInterval = 15;
        const blurSeq = [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1.0, 1.3, 1.6];
        const stagger = 0.1,
          followStrength = 0.15;

        const cssVarCache = {
          depthStep,
          scale3D: scale3d,
          tiltMax,
          panMax,
          opacityFalloff,
          moveAmplify,
          tiltBoost,
          panBoost,
        };

        const updateCSSCache = () => {
          const css = getComputedStyle(root);
          cssVarCache.depthStep =
            parseFloat(css.getPropertyValue("--ish-depth-step")) || depthStep;
          cssVarCache.scale3D =
            parseFloat(css.getPropertyValue("--ish-scale-3d")) || scale3d;
          cssVarCache.tiltMax =
            parseFloat(css.getPropertyValue("--ish-tilt-max")) || tiltMax;
          cssVarCache.panMax =
            parseFloat(css.getPropertyValue("--ish-pan-max")) || panMax;
          cssVarCache.opacityFalloff =
            parseFloat(css.getPropertyValue("--ish-opacity-falloff")) ||
            opacityFalloff;
          cssVarCache.moveAmplify =
            parseFloat(css.getPropertyValue("--ish-move-amplify")) ||
            moveAmplify;
          cssVarCache.tiltBoost =
            parseFloat(css.getPropertyValue("--ish-tilt-boost")) || tiltBoost;
          cssVarCache.panBoost =
            parseFloat(css.getPropertyValue("--ish-pan-boost")) || panBoost;
        };
        updateCSSCache();

        let timeline = null,
          isTransitioning = false,
          isParallax = false,
          isOpacity = false,
          isRotation = false,
          isBlur = false,
          isColor = false,
          is3D = false,
          isHovered = false;
        let rect = container.getBoundingClientRect();

        let rafId = null;
        let pendingMouseEvent = null;

        const onResize = () => {
          rect = container.getBoundingClientRect();
        };
        let resizeTimer;
        const debouncedResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(onResize, 50);
        };
        window.addEventListener("resize", debouncedResize);

        const quickTos = layers
          .map((layer, i) => {
            if (i === 0) return null;
            const sv = 1 - scaleInterval * i;
            const mult = sv > 0 ? (1 - sv) * 3 + 0.2 : 1;
            return {
              layer,
              mult,
              xTo: gsap.quickTo(layer, "x", { duration: 0.6, ease: "power3" }),
              yTo: gsap.quickTo(layer, "y", { duration: 0.6, ease: "power3" }),
            };
          })
          .filter(Boolean);

        const getScale = (i) => Math.max(1 - scaleInterval * i, 0);
        const getOpacity = (i) =>
          !isOpacity ? 1 : Math.max(1 - opacityInterval * i, 0.1);
        const getRotVal = (i) => rotationInterval * i * (i % 2 === 0 ? 1 : -1);
        const getBlur = (i) =>
          !isBlur || i === 0 ? 0 : blurSeq[Math.min(i, blurSeq.length - 1)];
        const getColor = (i) => {
          if (!isColor) return "none";
          if (i === 0) return "grayscale(1)";
          const ci = Math.min(i * 0.15, 1),
            sat = 1 + ci * 0.5;
          return `grayscale(${1 - ci}) saturate(${sat})`;
        };

        function applyFilters() {
          layers.forEach((l, i) => {
            const b = getBlur(i),
              c = getColor(i);
            let f = "";
            if (b > 0) f += `blur(${b}px) `;
            if (c !== "none") f += c;
            l.style.filter = f.trim() || "none";
          });
        }

        function reset2D() {
          gsap.killTweensOf(stackEl);
          gsap.set(layers, {
            scale: (i, t) => (t === layers[0] ? 1 : 0.95),
            opacity: (i, t) => (t === layers[0] ? 1 : 0),
            rotation: 0,
            rotationZ: 0,
            x: 0,
            y: 0,
            z: 0,
          });
          layers.forEach((l) => (l.style.filter = "none"));
          gsap.set(stackEl, {
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            x: 0,
            y: 0,
            z: 0,
            scale: 1,
          });
        }

        function createTimeline() {
          if (timeline) timeline.kill();
          const rev = [...layers].reverse();
          timeline = gsap.timeline({ paused: true }).to(rev, {
            scale: (i, t) => getScale(layers.indexOf(t)),
            opacity: (i, t) => {
              const idx = layers.indexOf(t);
              return idx === 0 ? 1 : getOpacity(idx);
            },
            rotation: (i, t) => {
              if (!isRotation) return 0;
              return getRotVal(layers.indexOf(t));
            },
            duration,
            ease,
            stagger,
          });
          applyFilters();
        }

        function applyShape(shape) {
          layers.forEach((l, i) => {
            if (i === 0) return;
            l.style.clipPath = CLIP_PATHS[shape];
          });
        }

        function center2D() {
          quickTos.forEach(({ layer }) =>
            gsap.to(layer, { x: 0, y: 0, duration: 0.6, ease: "power2.out" }),
          );
        }

        function compute3DOpacity(i) {
          const base = Math.max(1 - cssVarCache.opacityFalloff * i, 0.25);
          return isOpacity ? Math.max(base - opacityInterval * i, 0.1) : base;
        }

        function layout3D(depthFactor = 1) {
          const d = cssVarCache.depthStep * depthFactor;
          layers.forEach((l, i) => {
            const z = Math.round(i * d) + i * 0.1;
            const s = Math.max(1 - i * cssVarCache.scale3D, 0.35);
            const o = compute3DOpacity(i);
            const rotZ = isRotation ? getRotVal(i) : 0;
            l.style.transform = `translateZ(${z}px) scale(${s}) rotateZ(${rotZ}deg)`;
            l.style.opacity = o;
          });
          applyFilters();
        }

        function pose3DFlat() {
          gsap.to(stackEl, {
            rotationX: 0,
            rotationY: 0,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        }

        function center3D() {
          gsap.to(stackEl, {
            rotationX: 0,
            rotationY: 0,
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        }

        function enable3D() {
          is3D = true;
          if (timeline) timeline.pause(0);
          const rev = [...layers].reverse();
          gsap.to(rev, {
            scale: (i, t) => {
              const idx = layers.indexOf(t);
              return idx === 0
                ? 1
                : Math.max(1 - idx * cssVarCache.scale3D, 0.35);
            },
            opacity: (i, t) => {
              const idx = layers.indexOf(t);
              return idx === 0 ? 1 : compute3DOpacity(idx);
            },
            duration,
            ease,
            stagger,
            onComplete: () => {
              layout3D();
              if (isHovered) {
                container.classList.add("ish-is-3d");
                pose3DFlat();
              }
            },
          });
        }

        function disable3D() {
          is3D = false;
          container.classList.remove("ish-is-3d");
          gsap.killTweensOf(stackEl);
          gsap.to(stackEl, {
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            x: 0,
            y: 0,
            z: 0,
            scale: 1,
            duration: 0.28,
            ease: "power2.out",
          });
          const rev = [...layers].reverse();
          gsap.to(rev, {
            scale: (i, t) => (layers.indexOf(t) === 0 ? 1 : 0.95),
            opacity: (i, t) => (layers.indexOf(t) === 0 ? 1 : 0),
            rotation: 0,
            duration,
            ease,
            stagger: -stagger,
            onComplete: () => {
              layers.forEach((l) => (l.style.transform = ""));
              reset2D();
              createTimeline();
            },
          });
        }

        function tiltPan(e) {
          if (!is3D || !isHovered) return;
          const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
          const d = Math.min(1, Math.hypot(nx, ny));
          const depthFactor = 0.9 + d * 0.2;
          layout3D(depthFactor);

          const t =
            cssVarCache.tiltMax *
            cssVarCache.tiltBoost *
            cssVarCache.moveAmplify;
          const p =
            cssVarCache.panMax * cssVarCache.panBoost * cssVarCache.moveAmplify;

          gsap.to(stackEl, {
            rotationY: nx * t,
            rotationX: -ny * t,
            x: nx * p,
            y: ny * p,
            scale: 1,
            duration: 0.18,
            ease: "power2.out",
          });
        }

        function onEnter() {
          isHovered = true;
          if (is3D) {
            container.classList.add("ish-is-3d");
            layout3D();
            pose3DFlat();
          } else if (timeline) {
            timeline.play();
          }
        }

        function onLeave() {
          isHovered = false;
          if (is3D) {
            center3D();
            container.classList.remove("ish-is-3d");
          } else if (timeline && !isParallax) {
            timeline.reverse();
          }
          if (isParallax) center2D();
          setTimeout(() => {
            if (!isHovered && !is3D && !isParallax) center2D();
          }, duration * 1000);
        }

        function processMouseMove() {
          if (!pendingMouseEvent) {
            rafId = null;
            return;
          }
          const e = pendingMouseEvent;
          pendingMouseEvent = null;
          rafId = null;

          if (is3D) {
            const inside =
              e.clientX >= rect.left &&
              e.clientX <= rect.left + rect.width &&
              e.clientY >= rect.top &&
              e.clientY <= rect.top + rect.height;
            if (inside) tiltPan(e);
            else center3D();
            return;
          }
          if (!isParallax || !isHovered) return;
          const rx = (e.clientX - rect.left) / rect.width - 0.5,
            ry = (e.clientY - rect.top) / rect.height - 0.5;
          quickTos.forEach(({ xTo, yTo, mult }) => {
            xTo(rx * 2 * rect.width * followStrength * mult);
            yTo(ry * 2 * rect.height * followStrength * mult);
          });
        }

        function onMove(e) {
          pendingMouseEvent = e;
          if (!rafId) rafId = requestAnimationFrame(processMouseMove);
        }

        document.addEventListener("mousemove", onMove);
        container.addEventListener("mouseenter", onEnter);
        container.addEventListener("mouseleave", onLeave);

        const api = {
          changeShape(shape) {
            if (isTransitioning) return;
            isTransitioning = true;
            if (timeline) timeline.pause();
            reset2D();
            applyShape(shape);
            createTimeline();
            isTransitioning = false;
            if (is3D) layout3D();
          },
          toggleRotation(v) {
            isRotation = v;
            if (is3D) {
              layout3D();
            } else {
              if (!isRotation)
                layers.forEach((l) => gsap.set(l, { rotation: 0 }));
              if (timeline) timeline.kill();
              createTimeline();
              timeline.progress(isHovered ? 1 : 0);
            }
          },
          toggleBlur(v) {
            isBlur = v;
            applyFilters();
            if (is3D) layout3D();
          },
          toggleColor(v) {
            isColor = v;
            applyFilters();
            if (is3D) layout3D();
          },
          toggleOpacity(v) {
            isOpacity = v;
            if (is3D) {
              layout3D();
            } else {
              if (timeline) timeline.kill();
              createTimeline();
              timeline.progress(isHovered ? 1 : 0);
            }
          },
          toggleParallax(v) {
            isParallax = v;
            if (!isParallax) {
              center2D();
              if (timeline) {
                isHovered ? timeline.play() : timeline.reverse();
              }
            }
          },
          toggle3D(v) {
            v ? enable3D() : disable3D();
          },
          updateCSSCache,
        };
        apiRef.current = api;

        reset2D();
        applyShape(initialShape);
        createTimeline();

        cleanup = () => {
          document.removeEventListener("mousemove", onMove);
          container.removeEventListener("mouseenter", onEnter);
          container.removeEventListener("mouseleave", onLeave);
          window.removeEventListener("resize", debouncedResize);
          if (rafId) cancelAnimationFrame(rafId);
          if (timeline) timeline.kill();
          gsap.killTweensOf(stackEl);
          apiRef.current = null;
        };
      })
      .catch((e) =>
        console.error("[ImageStackHover] script load failed:", e.message),
      );

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.setProperty("--ish-tilt-max", String(tilt));
    }
    apiRef.current?.updateCSSCache();
  }, [tilt]);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.setProperty("--ish-pan-max", `${pan}px`);
    }
    apiRef.current?.updateCSSCache();
  }, [pan]);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.setProperty("--ish-depth-step", `${depth}px`);
    }
    apiRef.current?.updateCSSCache();
  }, [depth]);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.setProperty(
        "--ish-move-amplify",
        String(amp / 100),
      );
    }
    apiRef.current?.updateCSSCache();
  }, [amp]);

  const handleShapeClick = (shape) => {
    setActiveShape(shape);
    apiRef.current?.changeShape(shape);
  };

  const makeToggleHandler = (name) => () => {
    const willBeOn = !{
      rotation: rotationOn,
      blur: blurOn,
      color: colorOn,
      opacity: opacityOn,
      parallax: parallaxOn,
      "3d": threeDOn,
    }[name];

    if (willBeOn && name === "parallax" && threeDOn) {
      setThreeDOn(false);
      apiRef.current?.toggle3D(false);
    }
    if (willBeOn && name === "3d" && parallaxOn) {
      setParallaxOn(false);
      apiRef.current?.toggleParallax(false);
    }

    if (name === "rotation") {
      setRotationOn(willBeOn);
      apiRef.current?.toggleRotation(willBeOn);
    } else if (name === "blur") {
      setBlurOn(willBeOn);
      apiRef.current?.toggleBlur(willBeOn);
    } else if (name === "color") {
      setColorOn(willBeOn);
      apiRef.current?.toggleColor(willBeOn);
    } else if (name === "opacity") {
      setOpacityOn(willBeOn);
      apiRef.current?.toggleOpacity(willBeOn);
    } else if (name === "parallax") {
      setParallaxOn(willBeOn);
      apiRef.current?.toggleParallax(willBeOn);
    } else if (name === "3d") {
      setThreeDOn(willBeOn);
      apiRef.current?.toggle3D(willBeOn);
    }
  };

  return (
    <div
      ref={rootRef}
      className="ish-root min-h-screen flex flex-col items-center justify-center bg-black text-white gap-8 relative"
      style={{
        "--ish-depth-step": `${depthStep}px`,
        "--ish-scale-3d": scale3d,
        "--ish-tilt-max": tiltMax,
        "--ish-pan-max": `${panMax}px`,
        "--ish-opacity-falloff": opacityFalloff,
        "--ish-move-amplify": moveAmplify,
        "--ish-tilt-boost": tiltBoost,
        "--ish-pan-boost": panBoost,
        backgroundImage:
          "url(\"data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='dot' patternUnits='userSpaceOnUse' width='20' height='20'%3e%3ccircle cx='10' cy='10' r='1' fill='%23222'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23dot)'/%3e%3c/svg%3e\")",
      }}
    >
      <div
        ref={containerRef}
        className={
          "ish-image-container relative cursor-pointer border border-white/15" +
          (threeDOn ? " ish-is-3d" : "")
        }
        style={{
          width: `${size}px`,
          height: `${size}px`,
          overflow: threeDOn ? "visible" : "hidden",
        }}
      >
        {Array.from({ length: layerCount }).map((_, i) => (
          <div
            key={i}
            className="ish-image-layer absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backfaceVisibility: "hidden",
              willChange: "transform, opacity",
              opacity: i === 0 ? 1 : 0,
              transform: i === 0 ? "none" : "scale(0.95)",
              clipPath: i === 0 ? undefined : CLIP_PATHS[initialShape],
            }}
          />
        ))}
      </div>

      <div
        className="ish-controls flex justify-between items-start relative"
        style={{ width: `${size}px` }}
      >
        <div className="flex gap-2.5 items-center">
          {SHAPES.map((shape) => (
            <button
              key={shape}
              type="button"
              aria-label={shape}
              onClick={() => handleShapeClick(shape)}
              className={
                "ish-shape-btn bg-white border-none cursor-pointer transition-opacity duration-300 " +
                (shape === "circle" ? "rounded-full " : "") +
                (shape === "diamond" ? "rotate-45 " : "") +
                (activeShape === shape
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-80")
              }
              style={{
                width:
                  shape === "diamond"
                    ? "14px"
                    : shape === "hexagon"
                      ? "19px"
                      : "16px",
                height:
                  shape === "diamond"
                    ? "14px"
                    : shape === "hexagon"
                      ? "19px"
                      : "16px",
                clipPath: shape === "hexagon" ? CLIP_PATHS.hexagon : undefined,
              }}
            />
          ))}
        </div>

        <div className="ish-toggle-controls flex flex-col gap-2 items-end relative">
          <ToggleButton
            label="rotation"
            active={rotationOn}
            onClick={makeToggleHandler("rotation")}
          />
          <ToggleButton
            label="blur"
            active={blurOn}
            onClick={makeToggleHandler("blur")}
          />
          <ToggleButton
            label="color"
            active={colorOn}
            onClick={makeToggleHandler("color")}
          />
          <ToggleButton
            label="opacity"
            active={opacityOn}
            onClick={makeToggleHandler("opacity")}
          />
          <ToggleButton
            label="parallax"
            active={parallaxOn}
            onClick={makeToggleHandler("parallax")}
          />
          <ToggleButton
            label="3d"
            active={threeDOn}
            onClick={makeToggleHandler("3d")}
          />

          <div
            ref={settingsRef}
            className={
              "ish-settings-3d absolute top-full right-0 mt-2 overflow-hidden transition-all duration-700 z-[1000] " +
              (threeDOn ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0")
            }
          >
            <TunerRow
              label="tilt"
              min={1}
              max={50}
              value={tilt}
              display={String(tilt).padStart(3, " ")}
              onChange={setTilt}
              active={threeDOn}
              delayIndex={0}
            />
            <TunerRow
              label="pan"
              min={1}
              max={200}
              value={pan}
              display={String(pan).padStart(3, " ")}
              onChange={setPan}
              active={threeDOn}
              delayIndex={1}
            />
            <TunerRow
              label="depth"
              min={1}
              max={100}
              value={depth}
              display={String(depth).padStart(3, " ")}
              onChange={setDepth}
              active={threeDOn}
              delayIndex={2}
            />
            <TunerRow
              label="amp"
              min={1}
              max={300}
              value={amp}
              display={(amp / 100).toFixed(2)}
              onChange={setAmp}
              active={threeDOn}
              delayIndex={3}
            />
          </div>
        </div>
      </div>

      {showCredit && (
        <a
          href={creditHref}
          target="_blank"
          rel="noreferrer"
          className="ish-credit fixed bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-wide text-white/30 no-underline transition-opacity duration-200 hover:opacity-80 hover:text-white/50"
        >
          {creditText}
        </a>
      )}

      <style>
        {"" +
          "@font-face { font-family: 'PP Supply Mono'; src: url('https://assets.codepen.io/7558/PPSupplyMono-Variable.woff2') format('woff2'); font-weight: 400; font-display: swap; } " +
          ".ish-image-container.ish-is-3d { perspective: 1600px; perspective-origin: 50% 50%; isolation: isolate; } " +
          ".ish-image-stack { transform-style: flat; } " +
          ".ish-image-container.ish-is-3d .ish-image-stack { transform-style: preserve-3d; } " +
          ".ish-credit, .ish-toggle-controls button, .ish-controls span { font-family: 'PP Supply Mono', monospace; } " +
          ".ish-tuner-slider { -webkit-appearance: none; appearance: none; height: 2px; background: rgba(255,255,255,0.2); outline: none; cursor: pointer; } " +
          ".ish-tuner-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 8px; height: 8px; background: #4ade80; border-radius: 50%; cursor: pointer; transition: all 0.2s ease; } " +
          ".ish-tuner-slider::-webkit-slider-thumb:hover { transform: scale(1.3); } " +
          ".ish-tuner-slider::-moz-range-thumb { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; border: none; cursor: pointer; } " +
          "@media (max-width: 480px) { .ish-controls { flex-direction: column; gap: 15px; align-items: center; } .ish-toggle-controls { align-items: center; } }"}
      </style>
    </div>
  );
}

function ToggleButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "bg-transparent border-none cursor-pointer font-mono text-xs uppercase tracking-wide transition-colors duration-200 " +
        (active ? "text-green-400" : "text-gray-400 hover:text-white")
      }
    >
      {active ? `${label} on` : label}
    </button>
  );
}

function TunerRow({
  label,
  min,
  max,
  value,
  display,
  onChange,
  active,
  delayIndex,
}) {
  return (
    <div
      className="flex items-center gap-2 mb-1.5 justify-end transition-all duration-500"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(10px)",
        transitionDelay: active
          ? `${0.1 + delayIndex * 0.05}s`
          : `${0.25 - delayIndex * 0.05}s`,
      }}
    >
      <label className="w-[50px] font-mono text-[0.6rem] uppercase tracking-wide text-gray-400 text-right">
        {label}
      </label>
      <input
        type="range"
        className="ish-tuner-slider w-20"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-[35px] font-mono text-[0.6rem] text-green-400 text-right [font-variant-numeric:tabular-nums]">
        {display}
      </span>
    </div>
  );
}
