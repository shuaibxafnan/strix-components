"use client";

import { useEffect, useRef, useId } from "react";

function seededRandom(seed) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export default function DragFloat3dGallery({
  images = [
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=500&q=80"
  ],
  bgColor = "#ffffff",
  baseHeightVh = 22,
  viewportPadding = 0.3,
  focalLength = 600,
  zSpread = 350,
  nearClip = 50,
  dragSensitivity = 0.003,
  momentumDecay = 0.95,
  momentumMin = 0.00005,
  cornerRadius = 8,
  seed = 0,
  imageAlt = "",
  className = "",
}) {
  const uid = useId();
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const imgAspects = useRef([]);
  const worldPositions = useRef([]);
  const baseSizes = useRef([]);
  const rotX = useRef(0);
  const rotY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const rafId = useRef(null);
  const loadedCount = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) return;

    function computeLayout() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const xRange = vw * (1 - 2 * viewportPadding);
      const yRange = vh * (1 - 2 * viewportPadding);
      const baseH = vh * (baseHeightVh / 100);

      for (let i = 0; i < images.length; i++) {
        const aspect = imgAspects.current[i] ?? 4 / 5;
        const zNorm = seededRandom(seed + i * 31 + 7);
        const zWorld = (zNorm - 0.5) * 2 * zSpread;
        const baseW = baseH * aspect;
        const xWorld = -xRange / 2 + seededRandom(seed + i * 17 + 3) * xRange;
        const yWorld = -yRange / 2 + seededRandom(seed + i * 23 + 11) * yRange;
        worldPositions.current[i] = { x: xWorld, y: yWorld, z: zWorld };
        baseSizes.current[i] = { w: baseW, h: baseH };
      }
    }

    function project() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cosX = Math.cos(rotX.current);
      const sinX = Math.sin(rotX.current);
      const cosY = Math.cos(rotY.current);
      const sinY = Math.sin(rotY.current);

      for (let i = 0; i < images.length; i++) {
        const pos = worldPositions.current[i];
        const size = baseSizes.current[i];
        const el = itemRefs.current[i];
        if (!pos || !size || !el) continue;

        const rx = pos.x * cosY + pos.z * sinY;
        let ry = pos.y;
        let rz = -pos.x * sinY + pos.z * cosY;
        const ry2 = ry * cosX - rz * sinX;
        const rz2 = ry * sinX + rz * cosX;
        ry = ry2;
        rz = rz2;

        const depth = focalLength + rz;
        if (depth < nearClip) {
          el.style.opacity = "0";
          continue;
        }

        const f = focalLength / depth;
        const w = size.w * f;
        const h = size.h * f;
        const cx = rx * f + vw / 2;
        const cy = ry * f + vh / 2;

        el.style.opacity = "1";
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.transform = `translate(${cx - w / 2}px, ${cy - h / 2}px)`;
        el.style.zIndex = String(Math.round(1000 - rz));
      }
    }

    function onDown(e) {
      isDragging.current = true;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      velX.current = 0;
      velY.current = 0;
    }

    function onMove(e) {
      if (!isDragging.current) return;
      const dx = e.clientX - lastX.current;
      const dy = e.clientY - lastY.current;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      rotY.current += dx * dragSensitivity;
      rotX.current += dy * dragSensitivity;
      velY.current = dx * dragSensitivity;
      velX.current = dy * dragSensitivity;
      project();
    }

    function onUp() {
      isDragging.current = false;
    }

    function onResize() {
      computeLayout();
      project();
    }

    function tick() {
      rafId.current = requestAnimationFrame(tick);
      if (isDragging.current) return;
      if (
        Math.abs(velX.current) < momentumMin &&
        Math.abs(velY.current) < momentumMin
      ) {
        velX.current = 0;
        velY.current = 0;
        return;
      }
      rotX.current += velX.current;
      rotY.current += velY.current;
      velX.current *= momentumDecay;
      velY.current *= momentumDecay;
      project();
    }

    function tryStart() {
      loadedCount.current += 1;
      if (loadedCount.current < images.length) return;
      computeLayout();
      project();
      rafId.current = requestAnimationFrame(tick);
    }

    images.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        imgAspects.current[i] = img.naturalWidth / img.naturalHeight;
        tryStart();
      };
      img.onerror = () => {
        imgAspects.current[i] = 4 / 5;
        tryStart();
      };
      img.src = src;
    });

    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      container.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, [
    images,
    baseHeightVh,
    viewportPadding,
    focalLength,
    zSpread,
    nearClip,
    dragSensitivity,
    momentumDecay,
    momentumMin,
    seed,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden cursor-grab active:cursor-grabbing touch-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {images.map((src, i) => (
        <div
          key={`${uid}-${i}`}
          ref={(el) => (itemRefs.current[i] = el)}
          className="absolute top-0 left-0 opacity-0 pointer-events-none will-change-transform"
          style={{ borderRadius: `${cornerRadius}px`, overflow: "hidden" }}
        >
          <img
            src={src}
            alt={imageAlt}
            draggable={false}
            className="w-full h-full object-cover select-none"
          />
        </div>
      ))}
    </div>
  );
}
