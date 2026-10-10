"use client";

import { useEffect, useRef } from "react";

// ─── PanoCylinder ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// imageUrl         string   pano.jpg URL     Panoramic image to wrap around cylinder
// tileCount        number   20               Number of vertical tile slices
// tileWidth        number   318              Width of each tile in px (adjust to avoid gaps)
// tileHeight       string   "110%"           Height of each tile (covers viewport height)
// perspective      number   900              CSS perspective depth (px) for 3D feel
// radius           number   1000             Cylinder radius — transformOrigin Z offset (px)
// startZ           number   2000             Initial Z position of tiles (flies in from far)
// imageOffsetY     number   -220             Vertical offset of bg image (px)
// rotateDuration   number   0.6              GSAP tween duration on mouse move (s)
// bgColor          string   "#000"           Container background color
// ──────────────────────────────────────────────────────────────────────────────

export default function PanoCylinder({
  imageUrl = "https://assets.codepen.io/721952/pano.jpg",
  tileCount = 20,
  tileWidth = 318,
  tileHeight = "110%",
  perspective = 900,
  radius = 1000,
  startZ = 2000,
  imageOffsetY = -220,
  rotateDuration = 0.6,
  bgColor = "#000",
}) {
  const containerRef = useRef(null);
  const tilesRef = useRef([]);

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

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        const { gsap } = window;
        if (!gsap || !containerRef.current) return;

        gsap.config({ trialWarn: false });

        const container = containerRef.current;

        // Set 3D perspective on container
        gsap.set(container, { perspective });

        // Build tiles
        const tiles = [];
        tilesRef.current = tiles;

        for (let i = 0; i < tileCount; i++) {
          const tile = document.createElement("div");
          tile.classList.add("pano-tile");
          container.appendChild(tile);
          tiles.push(tile);

          gsap.set(tile, {
            position: "absolute",
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
            color: "#fff",
            z: startZ,
            width: tileWidth,
            height: tileHeight,
            rotationY: (i / tileCount) * 360,
            // Push tiles outward along Z to form the cylinder wall
            transformOrigin: `50% 50% -${radius}px`,
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${i * -tileWidth}px ${imageOffsetY}px`,
            overflow: "hidden",
            userSelect: "none",
          });
        }

        // Mouse move handler — rotate all tiles to follow cursor X
        const handleMouseMove = (e) => {
          gsap.to(".pano-tile", {
            duration: rotateDuration,
            rotationY: (idx) =>
              -180 +
              (idx / tileCount) * 360 +
              360 * (e.clientX / window.innerWidth),
          });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          // Remove tiles from DOM on cleanup
          tiles.forEach((t) => t.remove());
        };
      })
      .catch((e) =>
        console.error("[PanoCylinder] GSAP load failed:", e.message),
      );
  }, [
    imageUrl,
    tileCount,
    tileWidth,
    tileHeight,
    perspective,
    radius,
    startZ,
    imageOffsetY,
    rotateDuration,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: bgColor }}
    />
  );
}
