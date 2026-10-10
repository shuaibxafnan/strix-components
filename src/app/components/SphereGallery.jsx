"use client";

import { useEffect, useMemo, useRef, useId } from "react";

// ─── CubicGallery ────────────────────────────────────────────────────────────
//
// A draggable 3D sphere of images with inertia + a FLIP-style lightbox.
// Ported from a vanilla JS / Hammer.js / SCSS CodePen into a single, self
// contained client component. The sphere geometry is pure CSS 3D transforms;
// the only JS is gesture handling (Hammer), inertia, and the enlarge/collapse
// FLIP animation.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            string[] (sample)  Image URLs. The pool is tiled across the
//                                       grid, so fewer images than cells is fine.
// columns           number   37         Number of vertical columns of tiles.
// rows              number   5          Tiles per column (staggered each column).
// radius            string   max(1300px,100vw)  Sphere radius (drives curvature).
// segmentsX         number   37         Horizontal segments → degrees per column.
// segmentsY         number   37         Vertical segments → degrees per row.
// bgColor           string   rgb(235,235,235)   Page / stage background.
// itemBg            string   rgb(225,225,225)   Tile placeholder background.
// gradientCenter    string   rgba(235,235,235,0)   Vignette inner color (clear).
// gradientEdge      string   rgba(235,235,235,.5)  Vignette outer color (fades).
// scrimColor        string   rgba(0,0,0,.4)     Lightbox backdrop color.
// maxPolarRotDeg    number   3          Max up/down tilt (clamps rotateX).
// panSensitivity    number   18         Higher = slower drag response.
// transitionMs      number   300        Tile + enlarge transition duration (ms).
// enableInertia     boolean  true       Fling-to-spin after a drag.
// friction          number   0.92       Inertia decay per frame (0–1).
// itemGap           number   10         Inset (px) of the image inside its tile.
// itemRadius        number   12         Tile corner radius (px).
// frameRadius       number   32         Lightbox frame corner radius (px).
// viewerPadding     number   100        Padding (px) around the enlarged image.
// blurAmount        number   3          Vignette + scrim blur strength (px).
// grayscale         boolean  false      Desaturate every tile image.
// enableHighRes     boolean  true       Swap to a larger source once enlarged.
// getHighResSrc     fn       (default)  (src) => high-res URL used when enlarging.
// className         string   ""         Extra classes on the root element.
// style             object   {}         Extra inline styles on the root element.
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://assets.codepen.io/215059/photo-1594149221886-eb520f85ad25.jpg",
  "https://assets.codepen.io/215059/photo-1589156191108-c762ff4b96ab.jpg",
  "https://assets.codepen.io/215059/photo-1488197047962-b48492212cda.jpg",
  "https://assets.codepen.io/215059/photo-1469565686301-a0cf06bacf92.jpg",
  "https://assets.codepen.io/215059/photo-1559827291-72ee739d0d9a.jpg",
  "https://assets.codepen.io/215059/photo-1459213599465-03ab6a4d5931.jpg",
  "https://assets.codepen.io/215059/photo-1679540375857-dd5a85bfd3d6.jpg",
  "https://assets.codepen.io/215059/photo-1444044205806-38f3ed106c10.jpg",
  "https://assets.codepen.io/215059/photo-1580996554587-5d5cfc78b004.jpg",
  "https://assets.codepen.io/215059/photo-1488161628813-04466f872be2.jpg",
  "https://assets.codepen.io/215059/photo-1548783307-f63adc3f200b.jpg",
  "https://assets.codepen.io/215059/photo-1587653263995-422546a7a569.jpg",
  "https://assets.codepen.io/215059/photo-1447871622716-5dc761437456.jpg",
  "https://assets.codepen.io/215059/photo-1693043906043-fc76548579af.jpg",
  "https://assets.codepen.io/215059/photo-1559827260-dc66d52bef19.jpg",
  "https://assets.codepen.io/215059/photo-1539125530496-3ca408f9c2d9.jpg",
  "https://assets.codepen.io/215059/photo-1600679620924-47bf7fcbd629.jpg",
  "https://assets.codepen.io/215059/photo-1640008404828-3d3cc5a11fd4.jpg",
  "https://assets.codepen.io/215059/photo-1608965112849-6eb5e5d106b0.jpg",
  "https://assets.codepen.io/215059/photo-1751460374271-377219ff8336.jpg",
  "https://assets.codepen.io/215059/photo-1749460396807-b065b6694f02.jpg",
  "https://assets.codepen.io/215059/photo-1750008172607-d6408ebfc9b5.jpg",
  "https://assets.codepen.io/215059/photo-1663747638247-f2317493492c.jpg",
  "https://assets.codepen.io/215059/photo-1523547743064-d0936dbb6ed3.jpg",
  "https://assets.codepen.io/215059/photo-1660749120048-589827cd6181.jpg",
  "https://assets.codepen.io/215059/photo-1707161692345-8e4684a77d8c.jpg",
  "https://assets.codepen.io/215059/photo-1752481444912-6a4c322de10b.jpg",
];

// Default high-res resolver — mirrors the original Unsplash swap. It only fires
// for the bundled CodePen assets; any other URL is returned unchanged so custom
// galleries don't get a broken src.
const defaultGetHighResSrc = (src) => {
  if (!src.includes("assets.codepen.io/215059")) return src;
  const slug = src
    .replace(".jpg", "")
    .replace("https://assets.codepen.io/215059", "");
  return "https://images.unsplash.com" + slug + "?w=1200&h=1200&fit=crop";
};

// Build the staggered grid of tiles. Each column steps the horizontal segment
// (data-item x) by 2; alternate columns shift their vertical segments by 1 so
// neighbouring tiles interlock like bricks — exactly the pattern the original
// hand-authored markup encoded.
const buildTiles = (columns, rows, images) => {
  const tiles = [];
  const startX = -(columns - 1); // center the band around 0
  const yStart = -(rows - 1); // center the rows around ~0
  let i = 0;

  for (let col = 0; col < columns; col++) {
    const x = startX + col * 2;
    const stagger = col % 2; // 0 or 1 — interlocks alternate columns
    for (let r = 0; r < rows; r++) {
      const y = yStart + r * 2 + stagger;
      tiles.push({ key: x + "_" + y, x, y, src: images[i % images.length] });
      i++;
    }
  }
  return tiles;
};

// Scoped stylesheet. Built with string concatenation (NOT a template literal)
// so it streams cleanly through SSR without chunk syntax errors. Every selector
// is namespaced under `.${rid}` so multiple galleries can share a page without
// their `.item` / `.overlay` / `.viewer` rules colliding.
const buildCss = (rid) => {
  const r = "." + rid;
  return [
    // The sphere itself — JS overwrites this transform every frame, but we seed
    // it here so the very first paint is already curved.
    r + " .sphere{",
    "  transform-style:preserve-3d;",
    "  transform:translateZ(calc(var(--radius) * -1)) rotateX(var(--sphere-rotation-x)) rotateY(var(--sphere-rotation-y));",
    "}",

    // Each tile is positioned on the sphere by converting its grid offset into a
    // rotateY/rotateX pair, then pushed out by the radius. --rot-*-delta lets the
    // FLIP code peel a single tile flat toward the camera.
    r + " .item{",
    "  position:absolute;top:-999px;bottom:-999px;left:-999px;right:-999px;margin:auto;",
    "  width:calc(var(--item-width) * var(--item-size-x));",
    "  height:calc(var(--item-height) * var(--item-size-y));",
    "  transform-origin:50% 50%;backface-visibility:hidden;color:transparent;",
    "  transform-style:preserve-3d;transition:transform " +
      "var(--transition)" +
      ";",
    "  transform:rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta,0deg)))",
    "    rotateX(calc(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2))) + var(--rot-x-delta,0deg)))",
    "    translateZ(var(--radius));",
    "}",

    // The framed image inside each tile.
    r + " .item__image{",
    "  position:absolute;display:block;inset:var(--item-gap);overflow:hidden;",
    "  border-radius:var(--item-radius);background-color:var(--item-bg);",
    "  backface-visibility:hidden;transition:transform " +
      "var(--transition)" +
      ";cursor:pointer;",
    "}",
    r + " .item__image img{",
    "  width:100%;height:100%;object-fit:cover;pointer-events:none;backface-visibility:hidden;",
    "  filter:var(--img-filter);",
    "}",

    // Radial vignette + an optional blurred copy of it, both fixed over the stage.
    r +
      " .overlay{position:absolute;inset:0;margin:auto;z-index:3;pointer-events:none;opacity:1;background-image:var(--gradient);}",
    r +
      " .overlay--blur{position:absolute;inset:0;margin:auto;z-index:3;pointer-events:none;opacity:1;mask-image:var(--gradient-blur);-webkit-mask-image:var(--gradient-blur);backdrop-filter:blur(var(--blur));-webkit-backdrop-filter:blur(var(--blur));}",

    // Lightbox layer. The frame is a square (or full-width on portrait screens)
    // target that a tapped tile scales up into.
    r +
      " .viewer{position:absolute;inset:0;z-index:9;pointer-events:none;display:flex;align-items:center;justify-content:center;padding:var(--viewer-padding);}",
    r +
      " .viewer .frame{height:100%;aspect-ratio:1;border-radius:var(--frame-radius);display:flex;}",
    r +
      " .viewer .enlarge{position:absolute;z-index:1;border-radius:var(--frame-radius);overflow:hidden;transition:opacity " +
      "var(--transition)" +
      ";}",
    r + " .viewer .enlarge img{width:100%;height:100%;object-fit:cover;}",
    r +
      " .viewer .scrim{position:absolute;inset:0;background-color:var(--bg-scrim);pointer-events:none;opacity:0;transition:opacity " +
      "var(--transition)" +
      ";backdrop-filter:blur(var(--blur));-webkit-backdrop-filter:blur(var(--blur));}",
    r + '[data-enlarging="true"] .scrim{opacity:1;pointer-events:all;}',

    // On portrait viewports the frame fills width instead of height.
    "@media (max-aspect-ratio:1/1){" +
      r +
      " .viewer .frame{height:auto;width:100%;}}",
  ].join("\n");
};

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

  // useId is SSR-safe and stable across hydration; sanitize the colons so it is
  // a valid CSS class / selector token.
  const rawId = useId();
  const rid = "cg-" + rawId.replace(/:/g, "");

  // Deterministic on server and client → no hydration mismatch.
  const tiles = useMemo(
    () => buildTiles(columns, rows, images),
    [columns, rows, images],
  );

  const css = useMemo(() => buildCss(rid), [rid]);

  // Runtime/prop-driven CSS variables live inline on the root. Keeping them here
  // (rather than in the scoped stylesheet) means the static <style> never needs
  // to interpolate prop values.
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
    "--viewer-padding": viewerPadding + "px",
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

    // ── Loader for the Hammer UMD global (CDN can't be resolved via dynamic
    //    import under Turbopack, so inject a <script> tag with dedupe). ──
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (window.Hammer) {
          resolve();
          return;
        }
        if (document.querySelector('script[data-id="' + src + '"]')) {
          const existing = document.querySelector(
            'script[data-id="' + src + '"]',
          );
          existing.addEventListener("load", resolve);
          existing.addEventListener("error", reject);
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

    // ── Gestures (Hammer pan → sphere rotation + fling) ──
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

    // ── Taps → FLIP enlarge / collapse ──
    const frame = root.querySelector(".frame");
    const viewer = root.querySelector(".viewer");
    const scrim = root.querySelector(".scrim");
    const itemImages = root.querySelectorAll(".item__image");

    // Reads the literal rotateX/rotateY from an inline transform string.
    const getTransformRotation = (el) => {
      const str = el.style.transform;
      const matchX = str.match(/rotateX\((-?\d+(\.\d+)?)deg\)/);
      const matchY = str.match(/rotateY\((-?\d+(\.\d+)?)deg\)/);
      return {
        rotateX: matchX ? parseFloat(matchX[1]) : 0,
        rotateY: matchY ? parseFloat(matchY[1]) : 0,
      };
    };

    // Decomposes a tile's computed matrix3d back into rotateX/rotateY.
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

      const referenceDiv = root.querySelector(".item__image--reference");
      if (referenceDiv) referenceDiv.remove();

      const enlargedImg = root.querySelector(".enlarge");
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

      const el = e.currentTarget; // the .item__image
      const parentEl = el.parentNode; // the .item
      el.setAttribute("data-focused", "true");

      const parentRotation = getRotationXY(parentEl);
      const globalRotation = getTransformRotation(sphere);

      // Counter-rotate the tile so it faces the camera dead-on.
      const normalizeDegrees = (deg) => ((deg % 360) + 360) % 360;
      const parentY = normalizeDegrees(parentRotation.rotateY);
      const globalY = normalizeDegrees(globalRotation.rotateY);

      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      parentEl.style.setProperty("--rot-y-delta", rotY + "deg");

      const rotX = -parentRotation.rotateX - globalRotation.rotateX;
      parentEl.style.setProperty("--rot-x-delta", rotX + "deg");

      // Invisible reference clone used purely to measure the flattened size.
      const referenceDiv = document.createElement("div");
      parentEl.appendChild(referenceDiv);
      referenceDiv.style.opacity = 0;
      referenceDiv.classList.add("item__image", "item__image--reference");
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

      // Load the tile src first, then optionally swap to a high-res source.
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

      // After the tile has flattened, lift a free-floating clone into the viewer
      // and fade it in — the classic FLIP hand-off.
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

        enlargementEl.classList.add("enlarge");
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
        console.error("[CubicGallery] Hammer load failed:", err.message),
      );

    // ── Cleanup ──
    return () => {
      cancelled = true;
      stopInertia();
      if (hammer) hammer.destroy();
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
      className={
        rid +
        " relative flex w-full h-screen items-center justify-center overflow-hidden touch-none " +
        className
      }
    >
      {/* Scoped, prop-free stylesheet — string-concatenated for safe SSR. */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="[perspective:calc(var(--radius)*2)]">
        <div ref={sphereRef} className="sphere">
          {tiles.map((tile) => (
            <div
              key={tile.key}
              className="item"
              data-src={tile.src}
              style={{ "--offset-x": tile.x, "--offset-y": tile.y }}
            >
              <div className="item__image">
                <img src={tile.src} draggable="false" alt="" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vignette + blurred vignette */}
      <div className="overlay" />
      <div className="overlay overlay--blur" />

      {/* Lightbox */}
      <div className="viewer">
        <div className="scrim" />
        <div className="frame">
          <div className="enlarged" />
        </div>
      </div>
    </main>
  );
}
