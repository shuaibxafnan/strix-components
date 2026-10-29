"use client";

import { useEffect, useMemo, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=600&q=80",
];

const defaultGetHighResSrc = (src) => {
  if (!src.includes("images.unsplash.com")) return src;
  try {
    const url = new URL(src);
    url.searchParams.set("w", "1600");
    return url.toString();
  } catch (e) {
    return src;
  }
};

const buildTiles = (columns, rows, images) => {
  const tiles = [];
  const startX = -(columns - 1);
  const yStart = -(rows - 1);
  let i = 0;

  for (let col = 0; col < columns; col++) {
    const x = startX + col * 2;
    const stagger = col % 2;
    for (let r = 0; r < rows; r++) {
      const y = yStart + r * 2 + stagger;
      tiles.push({ key: x + "_" + y, x, y, src: images[i % images.length] });
      i++;
    }
  }
  return tiles;
};

const ITEM_IMAGE_CLASS =
  "absolute inset-[var(--item-gap)] block cursor-pointer overflow-hidden rounded-[var(--item-radius)] bg-[color:var(--item-bg)] [backface-visibility:hidden] [transition:transform_var(--transition)]";

const ENLARGE_CLASS =
  "absolute z-[1] overflow-hidden rounded-[var(--frame-radius)] [transition:opacity_var(--transition)] [&_img]:h-full [&_img]:w-full [&_img]:object-cover";

const SPHERE_CLASS =
  "[transform-style:preserve-3d] [transform:translateZ(calc(var(--radius)_*_-1))_rotateX(var(--sphere-rotation-x))_rotateY(var(--sphere-rotation-y))]";

const ITEM_CLASS =
  "absolute -inset-[999px] m-auto h-[calc(var(--item-height)_*_var(--item-size-y))] w-[calc(var(--item-width)_*_var(--item-size-x))] origin-center text-transparent [backface-visibility:hidden] [transform-style:preserve-3d] [transition:transform_var(--transition)] [transform:rotateY(calc(var(--rot-y)_*_(var(--offset-x)_+_((var(--item-size-x)_-_1)_/_2))_+_var(--rot-y-delta,0deg)))_rotateX(calc(calc(var(--rot-x)_*_(var(--offset-y)_-_((var(--item-size-y)_-_1)_/_2)))_+_var(--rot-x-delta,0deg)))_translateZ(var(--radius))]";

const OVERLAY_CLASS =
  "pointer-events-none absolute inset-0 z-[3] m-auto opacity-100 [background-image:var(--gradient)]";

const OVERLAY_BLUR_CLASS =
  "[-webkit-backdrop-filter:blur(var(--blur))] [-webkit-mask-image:var(--gradient-blur)] [backdrop-filter:blur(var(--blur))] [mask-image:var(--gradient-blur)]";

export default function SphereGallery({
  images = DEFAULT_IMAGES,
  columns = 37,
  rows = 5,
  radius = "max(1300px, 100vw)",
  segmentsX = 37,
  segmentsY = 37,
  bgColor = "rgb(235, 235, 235)",
  itemBg = "rgb(225, 225, 225)",
  gradientCenter = "rgba(235, 235, 235, 0)",
  gradientEdge = "rgba(235, 235, 235, 0.5)",
  scrimColor = "rgba(0, 0, 0, 0.4)",
  maxPolarRotDeg = 3,
  panSensitivity = 18,
  transitionMs = 300,
  enableInertia = true,
  friction = 0.92,
  itemGap = 10,
  itemRadius = 12,
  frameRadius = 32,
  viewerPadding = 100,
  blurAmount = 3,
  grayscale = false,
  enableHighRes = true,
  getHighResSrc = defaultGetHighResSrc,
  className = "",
  style = {},
}) {
  const rootRef = useRef(null);
  const sphereRef = useRef(null);

  const tiles = useMemo(
    () => buildTiles(columns, rows, images),
    [columns, rows, images],
  );

  const rootVars = {
    "--radius": radius,
    "--circ": "calc(" + radius + " * 3.14)",
    "--segments-x": String(segmentsX),
    "--segments-y": String(segmentsY),
    "--rot-y": "calc((360deg / " + segmentsX + ") / 2)",
    "--rot-x": "calc((360deg / " + segmentsY + ") / 2)",
    "--item-width": "calc(var(--circ) / var(--segments-x))",
    "--item-height": "calc(var(--circ) / var(--segments-y))",
    "--item-size-x": "2",
    "--item-size-y": "2",
    "--sphere-rotation-x": "0",
    "--sphere-rotation-y": "0",
    "--transition": transitionMs + "ms",
    "--item-gap": itemGap + "px",
    "--item-radius": itemRadius + "px",
    "--frame-radius": frameRadius + "px",
    "--viewer-padding": "min(" + viewerPadding + "px, 8vw)",
    "--blur": blurAmount + "px",
    "--bg-scrim": scrimColor,
    "--item-bg": itemBg,
    "--img-filter": grayscale ? "grayscale(1)" : "none",
    "--gradient":
      "radial-gradient(" + gradientCenter + " 65%, " + gradientEdge + " 100%)",
    "--gradient-blur":
      "radial-gradient(" + gradientCenter + " 70%, " + gradientEdge + " 90%)",
    backgroundColor: bgColor,
    ...style,
  };

  useEffect(() => {
    const root = rootRef.current;
    const sphere = sphereRef.current;
    if (!root || !sphere) return;

    const TRANSITION_DUR_MS = transitionMs;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (window.Hammer) {
          resolve();
          return;
        }
        const existing = document.querySelector(
          'script[data-id="' + src + '"]',
        );
        if (existing) {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    const state = {
      rotation: { x: 0, y: 0 },
      startRotation: { x: 0, y: 0 },
      inertiaFrame: null,
      cancelTap: false,
    };

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    const applyTransform = () => {
      sphere.style.transform =
        "translateZ(calc(var(--radius) * -1)) rotateX(" +
        state.rotation.x +
        "deg) rotateY(" +
        state.rotation.y +
        "deg)";
    };

    const stopInertia = () => {
      if (state.inertiaFrame) {
        cancelAnimationFrame(state.inertiaFrame);
        state.inertiaFrame = null;
      }
    };

    const startInertia = (velocityX, velocityY) => {
      if (!enableInertia) return;
      let vx = velocityX * 100;
      let vy = velocityY * 100;

      const minVelocity = 0.1;
      const maxFrames = 120;
      let frameCount = 0;

      const step = () => {
        vx *= friction;
        vy *= friction;

        if (Math.abs(vx) < minVelocity && Math.abs(vy) < minVelocity) {
          state.inertiaFrame = null;
          return;
        }

        const proposedX = state.rotation.x - vy / 200;
        state.rotation.x = clamp(proposedX, -maxPolarRotDeg, maxPolarRotDeg);
        state.rotation.y += vx / 200;

        applyTransform();

        frameCount++;
        if (frameCount > maxFrames) {
          state.inertiaFrame = null;
          return;
        }
        state.inertiaFrame = requestAnimationFrame(step);
      };

      stopInertia();
      state.inertiaFrame = requestAnimationFrame(step);
    };

    let hammer = null;
    const setupGestures = () => {
      hammer = new window.Hammer(root);
      hammer.get("pan").set({ direction: window.Hammer.DIRECTION_ALL });

      hammer.on("panstart", () => {
        state.cancelTap = true;
        stopInertia();
        state.startRotation.x = state.rotation.x;
        state.startRotation.y = state.rotation.y;
      });

      hammer.on("panmove", ({ deltaX, deltaY }) => {
        const proposedX = state.startRotation.x - deltaY / panSensitivity;
        state.rotation.y = state.startRotation.y + deltaX / panSensitivity;
        state.rotation.x = clamp(proposedX, -maxPolarRotDeg, maxPolarRotDeg);
        applyTransform();
      });

      hammer.on("panend", ({ velocityX, velocityY }) => {
        setTimeout(() => (state.cancelTap = false), 100);
        startInertia(velocityX, velocityY);
      });
    };

    const frame = root.querySelector("[data-frame]");
    const viewer = root.querySelector("[data-viewer]");
    const scrim = root.querySelector("[data-scrim]");
    const itemImages = root.querySelectorAll("[data-item-image]");

    const getTransformRotation = (el) => {
      const str = el.style.transform;
      const matchX = str.match(/rotateX\((-?\d+(\.\d+)?)deg\)/);
      const matchY = str.match(/rotateY\((-?\d+(\.\d+)?)deg\)/);
      return {
        rotateX: matchX ? parseFloat(matchX[1]) : 0,
        rotateY: matchY ? parseFloat(matchY[1]) : 0,
      };
    };

    const getRotationXY = (el) => {
      const transform = window.getComputedStyle(el).transform;
      if (!transform || transform === "none") return { rotateX: 0, rotateY: 0 };
      if (!transform.startsWith("matrix3d")) return { rotateX: 0, rotateY: 0 };
      const values = transform
        .match(/matrix3d\((.+)\)/)[1]
        .split(",")
        .map(parseFloat);
      return {
        rotateX: Math.asin(-values[9]) * (180 / Math.PI),
        rotateY: Math.atan2(values[8], values[10]) * (180 / Math.PI),
      };
    };

    const handleClickScrim = () => {
      const el = root.querySelector('[data-focused="true"]');
      if (!el) return;
      const parentEl = el.parentNode;

      const referenceDiv = root.querySelector("[data-reference]");
      if (referenceDiv) referenceDiv.remove();

      const enlargedImg = root.querySelector("[data-enlarge]");
      if (enlargedImg) enlargedImg.remove();

      parentEl.style.setProperty("--rot-y-delta", "0deg");
      parentEl.style.setProperty("--rot-x-delta", "0deg");
      el.style.transform = "";
      el.style.zIndex = 0;

      setTimeout(() => {
        root.setAttribute("data-enlarging", "false");
        el.setAttribute("data-focused", "false");
      }, TRANSITION_DUR_MS);
    };

    const handleClick = (e) => {
      if (state.cancelTap) return;

      const el = e.currentTarget;
      const parentEl = el.parentNode;
      el.setAttribute("data-focused", "true");

      const parentRotation = getRotationXY(parentEl);
      const globalRotation = getTransformRotation(sphere);

      const normalizeDegrees = (deg) => ((deg % 360) + 360) % 360;
      const parentY = normalizeDegrees(parentRotation.rotateY);
      const globalY = normalizeDegrees(globalRotation.rotateY);

      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      parentEl.style.setProperty("--rot-y-delta", rotY + "deg");

      const rotX = -parentRotation.rotateX - globalRotation.rotateX;
      parentEl.style.setProperty("--rot-x-delta", rotX + "deg");

      const referenceDiv = document.createElement("div");
      parentEl.appendChild(referenceDiv);
      referenceDiv.style.opacity = 0;
      referenceDiv.className = ITEM_IMAGE_CLASS;
      referenceDiv.setAttribute("data-reference", "");
      referenceDiv.style.transform =
        "rotateX(" +
        -parentRotation.rotateX +
        "deg) rotateY(" +
        -parentRotation.rotateY +
        "deg)";

      const sourceRect = referenceDiv.getBoundingClientRect();
      const targetRect = frame.getBoundingClientRect();
      const deltaScale = Math.min(
        targetRect.width / sourceRect.width,
        targetRect.height / sourceRect.height,
      );

      el.style.transform = "scale(" + deltaScale + ") translateZ(30px)";
      el.style.zIndex = 3;

      const img = document.createElement("img");
      const baseSrc = parentEl.getAttribute("data-src");
      img.src = baseSrc;
      if (enableHighRes) {
        img.addEventListener("load", function onLoad() {
          img.removeEventListener("load", onLoad);
          const hi = getHighResSrc(baseSrc);
          if (hi && hi !== baseSrc) img.src = hi;
        });
      }

      scrim.addEventListener("click", handleClickScrim, { once: true });

      setTimeout(() => {
        const renderedRect = el.getBoundingClientRect();
        const enlargementEl = document.createElement("div");

        Object.assign(enlargementEl.style, {
          top: renderedRect.top - root.getBoundingClientRect().top + "px",
          left: renderedRect.left + "px",
          width: renderedRect.width + "px",
          height: renderedRect.height + "px",
          opacity: 0,
        });

        setTimeout(() => {
          enlargementEl.style.opacity = 1;
          root.setAttribute("data-enlarging", "true");
        }, TRANSITION_DUR_MS);

        enlargementEl.className = ENLARGE_CLASS;
        enlargementEl.setAttribute("data-enlarge", "");
        enlargementEl.appendChild(img);
        viewer.appendChild(enlargementEl);
      }, TRANSITION_DUR_MS);
    };

    itemImages.forEach((el) => el.addEventListener("click", handleClick));

    let cancelled = false;
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js",
    )
      .then(() => {
        if (cancelled || !window.Hammer) return;
        setupGestures();
        applyTransform();
      })
      .catch((err) =>
        console.error("[SphereGallery] Hammer load failed:", err.message),
      );

    return () => {
      cancelled = true;
      stopInertia();
      if (hammer) hammer.destroy();
      scrim.removeEventListener("click", handleClickScrim);
      itemImages.forEach((el) => el.removeEventListener("click", handleClick));
    };
  }, [
    transitionMs,
    enableInertia,
    friction,
    maxPolarRotDeg,
    panSensitivity,
    enableHighRes,
    getHighResSrc,
  ]);

  return (
    <main
      ref={rootRef}
      style={rootVars}
      className={`group relative flex h-[100svh] w-full touch-none items-center justify-center overflow-hidden ${className}`}
    >
      <div className="[perspective:calc(var(--radius)*2)]">
        <div ref={sphereRef} className={SPHERE_CLASS}>
          {tiles.map((tile) => (
            <div
              key={tile.key}
              data-src={tile.src}
              className={ITEM_CLASS}
              style={{ "--offset-x": tile.x, "--offset-y": tile.y }}
            >
              <div data-item-image className={ITEM_IMAGE_CLASS}>
                <img
                  src={tile.src}
                  draggable="false"
                  alt=""
                  className="pointer-events-none h-full w-full object-cover [backface-visibility:hidden] [filter:var(--img-filter)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={OVERLAY_CLASS} />
      <div className={`${OVERLAY_CLASS} ${OVERLAY_BLUR_CLASS}`} />

      <div
        data-viewer
        className="pointer-events-none absolute inset-0 z-[9] flex items-center justify-center p-[var(--viewer-padding)]"
      >
        <div
          data-scrim
          className="pointer-events-none absolute inset-0 bg-[color:var(--bg-scrim)] opacity-0 [-webkit-backdrop-filter:blur(var(--blur))] [backdrop-filter:blur(var(--blur))] [transition:opacity_var(--transition)] group-data-[enlarging=true]:pointer-events-auto group-data-[enlarging=true]:opacity-100"
        />
        <div
          data-frame
          className="flex aspect-square h-full rounded-[var(--frame-radius)] [@media(max-aspect-ratio:1/1)]:h-auto [@media(max-aspect-ratio:1/1)]:w-full"
        />
      </div>
    </main>
  );
}