"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
];

export default function InfiniteGradientCarousel({
  images = DEFAULT_IMAGES,
  bgColor = "#f0f0f0",
  canvasBaseColor = "#f6f7f9",
  cardWidth = "min(26vw,360px)",
  cardRadius = "15px",
  gap = 28,
  friction = 0.9,
  wheelSensitivity = 0.6,
  dragSensitivity = 1.0,
  maxRotation = 28,
  maxDepth = 140,
  minScale = 0.92,
  scaleRange = 0.1,
  gradientDuration = 0.45,
  loaderColor = "#333",
  className = "",
}) {
  const stageRef = useRef(null);
  const cardsRootRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const loaderRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    if (!images.length) return;

    let cancelled = false;
    const preloadLinks = [];

    import("gsap")
      .then(({ default: gsap }) => {
        if (cancelled) return;

        const stage = stageRef.current;
        const cardsRoot = cardsRootRef.current;
        const bgCanvas = bgCanvasRef.current;
        const loader = loaderRef.current;
        if (!stage || !cardsRoot || !bgCanvas) return;

        const bgCtx = bgCanvas.getContext("2d", { alpha: false });
        const s = stateRef.current;

        s.items = [];
        s.positions = [];
        s.activeIndex = -1;
        s.isEntering = true;
        s.CARD_W = 300;
        s.CARD_H = 400;
        s.STEP = s.CARD_W + gap;
        s.TRACK = 0;
        s.SCROLL_X = 0;
        s.VW_HALF = window.innerWidth * 0.5;
        s.vX = 0;
        s.rafId = null;
        s.bgRAF = null;
        s.lastTime = 0;
        s.lastBgDraw = 0;
        s.gradPalette = [];
        s.gradCurrent = {
          r1: 240,
          g1: 240,
          b1: 240,
          r2: 235,
          g2: 235,
          b2: 235,
        };
        s.bgFastUntil = 0;
        s.dragging = false;
        s.lastX = 0;
        s.lastT = 0;
        s.lastDelta = 0;

        const mod = (n, m) => ((n % m) + m) % m;

        const preloadImageLinks = (srcs) => {
          if (!document.head) return;
          srcs.forEach((href) => {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = href;
            link.fetchPriority = "high";
            document.head.appendChild(link);
            preloadLinks.push(link);
          });
        };

        const waitForImages = () =>
          Promise.all(
            s.items.map((it) => {
              const img = it.el.querySelector("img");
              if (!img || img.complete) return Promise.resolve();
              return new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              });
            }),
          );

        const decodeAllImages = async () => {
          const tasks = s.items.map((it) => {
            const img = it.el.querySelector("img");
            if (!img || typeof img.decode !== "function")
              return Promise.resolve();
            return img.decode().catch(() => {});
          });
          await Promise.allSettled(tasks);
        };

        const createCards = () => {
          cardsRoot.innerHTML = "";
          s.items = [];
          const fragment = document.createDocumentFragment();

          images.forEach((src, i) => {
            const card = document.createElement("article");
            card.className =
              "absolute top-1/2 left-1/2 [transform-style:preserve-3d] [backface-visibility:hidden] will-change-transform [transform-origin:90%_center] [contain:layout_paint]";
            card.style.width = cardWidth;
            card.style.aspectRatio = "4/5";

            const img = new Image();
            img.className =
              "block w-full h-full object-cover pointer-events-none";
            img.style.borderRadius = cardRadius;
            img.decoding = "async";
            img.loading = "eager";
            img.fetchPriority = "high";
            img.draggable = false;
            img.src = src;

            card.appendChild(img);
            fragment.appendChild(card);
            s.items.push({ el: card, x: i * s.STEP });
          });

          cardsRoot.appendChild(fragment);
        };

        const measure = () => {
          const sample = s.items[0]?.el;
          if (!sample) return;
          const r = sample.getBoundingClientRect();
          s.CARD_W = r.width || s.CARD_W;
          s.CARD_H = r.height || s.CARD_H;
          s.STEP = s.CARD_W + gap;
          s.TRACK = s.items.length * s.STEP;
          s.items.forEach((it, i) => (it.x = i * s.STEP));
          s.positions = new Float32Array(s.items.length);
        };

        const computeTransformComponents = (screenX) => {
          const norm = Math.max(-1, Math.min(1, screenX / s.VW_HALF));
          const absNorm = Math.abs(norm);
          const invNorm = 1 - absNorm;
          const ry = -norm * maxRotation;
          const tz = invNorm * maxDepth;
          const scale = minScale + invNorm * scaleRange;
          return { norm, absNorm, invNorm, ry, tz, scale };
        };

        const transformForScreenX = (screenX) => {
          const { ry, tz, scale } = computeTransformComponents(screenX);
          return {
            transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
            z: tz,
          };
        };

        const updateCarouselTransforms = () => {
          const half = s.TRACK / 2;
          let closestIdx = -1;
          let closestDist = Infinity;

          for (let i = 0; i < s.items.length; i++) {
            let pos = s.items[i].x - s.SCROLL_X;
            if (pos < -half) pos += s.TRACK;
            if (pos > half) pos -= s.TRACK;
            s.positions[i] = pos;
            const dist = Math.abs(pos);
            if (dist < closestDist) {
              closestDist = dist;
              closestIdx = i;
            }
          }

          const prevIdx = (closestIdx - 1 + s.items.length) % s.items.length;
          const nextIdx = (closestIdx + 1) % s.items.length;

          for (let i = 0; i < s.items.length; i++) {
            const it = s.items[i];
            const pos = s.positions[i];
            const norm = Math.max(-1, Math.min(1, pos / s.VW_HALF));
            const { transform, z } = transformForScreenX(pos);

            it.el.style.transform = transform;
            it.el.style.zIndex = String(1000 + Math.round(z));

            const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
            const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
            it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
          }

          if (closestIdx !== s.activeIndex) setActiveGradient(closestIdx);
        };

        const tick = (t) => {
          const dt = s.lastTime ? (t - s.lastTime) / 1000 : 0;
          s.lastTime = t;

          s.SCROLL_X = mod(s.SCROLL_X + s.vX * dt, s.TRACK);
          const decay = Math.pow(friction, dt * 60);
          s.vX *= decay;
          if (Math.abs(s.vX) < 0.02) s.vX = 0;

          updateCarouselTransforms();
          s.rafId = requestAnimationFrame(tick);
        };

        const startCarousel = () => {
          cancelCarousel();
          s.lastTime = 0;
          s.rafId = requestAnimationFrame((t) => {
            updateCarouselTransforms();
            tick(t);
          });
        };
        const cancelCarousel = () => {
          if (s.rafId) cancelAnimationFrame(s.rafId);
          s.rafId = null;
        };

        const rgbToHsl = (r, g, b) => {
          r /= 255;
          g /= 255;
          b /= 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h, sat;
          const l = (max + min) / 2;
          if (max === min) {
            h = 0;
            sat = 0;
          } else {
            const d = max - min;
            sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              default:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
          }
          return [h * 360, sat, l];
        };

        const hslToRgb = (h, sat, l) => {
          h = ((h % 360) + 360) % 360;
          h /= 360;
          let r, g, b;
          if (sat === 0) {
            r = g = b = l;
          } else {
            const hue2rgb = (p, q, t) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1 / 6) return p + (q - p) * 6 * t;
              if (t < 1 / 2) return q;
              if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
              return p;
            };
            const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
          }
          return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255),
          ];
        };

        const fallbackFromIndex = (idx) => {
          const h = (idx * 37) % 360;
          const sat = 0.65;
          return { c1: hslToRgb(h, sat, 0.52), c2: hslToRgb(h, sat, 0.72) };
        };

        const extractColors = (img, idx) => {
          try {
            const MAX = 48;
            const ratio =
              img.naturalWidth && img.naturalHeight
                ? img.naturalWidth / img.naturalHeight
                : 1;
            const tw = ratio >= 1 ? MAX : Math.max(16, Math.round(MAX * ratio));
            const th = ratio >= 1 ? Math.max(16, Math.round(MAX / ratio)) : MAX;

            const canvas = document.createElement("canvas");
            canvas.width = tw;
            canvas.height = th;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, tw, th);
            const data = ctx.getImageData(0, 0, tw, th).data;

            const H_BINS = 36;
            const S_BINS = 5;
            const SIZE = H_BINS * S_BINS;
            const wSum = new Float32Array(SIZE);
            const rSum = new Float32Array(SIZE);
            const gSum = new Float32Array(SIZE);
            const bSum = new Float32Array(SIZE);

            for (let i = 0; i < data.length; i += 4) {
              const a = data[i + 3] / 255;
              if (a < 0.05) continue;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const [h, sat, l] = rgbToHsl(r, g, b);
              if (l < 0.1 || l > 0.92 || sat < 0.08) continue;
              const w = a * (sat * sat) * (1 - Math.abs(l - 0.5) * 0.6);
              const hi = Math.max(
                0,
                Math.min(H_BINS - 1, Math.floor((h / 360) * H_BINS)),
              );
              const si = Math.max(
                0,
                Math.min(S_BINS - 1, Math.floor(sat * S_BINS)),
              );
              const bidx = hi * S_BINS + si;
              wSum[bidx] += w;
              rSum[bidx] += r * w;
              gSum[bidx] += g * w;
              bSum[bidx] += b * w;
            }

            let pIdx = -1;
            let pW = 0;
            for (let i = 0; i < SIZE; i++) {
              if (wSum[i] > pW) {
                pW = wSum[i];
                pIdx = i;
              }
            }
            if (pIdx < 0 || pW <= 0) return fallbackFromIndex(idx);

            const pHue = Math.floor(pIdx / S_BINS) * (360 / H_BINS);

            let sIdx = -1;
            let sW = 0;
            for (let i = 0; i < SIZE; i++) {
              const w = wSum[i];
              if (w <= 0) continue;
              const h = Math.floor(i / S_BINS) * (360 / H_BINS);
              let dh = Math.abs(h - pHue);
              dh = Math.min(dh, 360 - dh);
              if (dh >= 25 && w > sW) {
                sW = w;
                sIdx = i;
              }
            }

            const avgRGB = (idx) => {
              const w = wSum[idx] || 1e-6;
              return [
                Math.round(rSum[idx] / w),
                Math.round(gSum[idx] / w),
                Math.round(bSum[idx] / w),
              ];
            };

            const [pr, pg, pb] = avgRGB(pIdx);
            let [h1, s1] = rgbToHsl(pr, pg, pb);
            s1 = Math.max(0.45, Math.min(1, s1 * 1.15));
            const c1 = hslToRgb(h1, s1, 0.5);

            let c2;
            if (sIdx >= 0 && sW >= pW * 0.6) {
              const [sr, sg, sb] = avgRGB(sIdx);
              let [h2, s2] = rgbToHsl(sr, sg, sb);
              s2 = Math.max(0.45, Math.min(1, s2 * 1.05));
              c2 = hslToRgb(h2, s2, 0.72);
            } else {
              c2 = hslToRgb(h1, s1, 0.72);
            }

            return { c1, c2 };
          } catch {
            return fallbackFromIndex(idx);
          }
        };

        const buildPalette = () => {
          s.gradPalette = s.items.map((it, i) =>
            extractColors(it.el.querySelector("img"), i),
          );
        };

        const setActiveGradient = (idx) => {
          if (
            !bgCtx ||
            idx < 0 ||
            idx >= s.items.length ||
            idx === s.activeIndex
          )
            return;
          s.activeIndex = idx;
          const pal = s.gradPalette[idx] || {
            c1: [240, 240, 240],
            c2: [235, 235, 235],
          };
          const to = {
            r1: pal.c1[0],
            g1: pal.c1[1],
            b1: pal.c1[2],
            r2: pal.c2[0],
            g2: pal.c2[1],
            b2: pal.c2[2],
          };

          if (gsap) {
            s.bgFastUntil = performance.now() + 800;
            gsap.to(s.gradCurrent, {
              ...to,
              duration: gradientDuration,
              ease: "power2.out",
            });
          } else {
            Object.assign(s.gradCurrent, to);
          }
        };

        const resizeBG = () => {
          if (!bgCanvas || !bgCtx) return;
          const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
          const w = bgCanvas.clientWidth || stage.clientWidth;
          const h = bgCanvas.clientHeight || stage.clientHeight;
          const tw = Math.floor(w * dpr);
          const th = Math.floor(h * dpr);
          if (bgCanvas.width !== tw || bgCanvas.height !== th) {
            bgCanvas.width = tw;
            bgCanvas.height = th;
            bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
        };

        const drawBackground = () => {
          if (!bgCanvas || !bgCtx) return;
          const now = performance.now();
          const minInterval = now < s.bgFastUntil ? 16 : 33;

          if (now - s.lastBgDraw < minInterval) {
            s.bgRAF = requestAnimationFrame(drawBackground);
            return;
          }
          s.lastBgDraw = now;
          resizeBG();

          const w = bgCanvas.clientWidth || stage.clientWidth;
          const h = bgCanvas.clientHeight || stage.clientHeight;

          bgCtx.fillStyle = canvasBaseColor;
          bgCtx.fillRect(0, 0, w, h);

          const time = now * 0.0002;
          const cx = w * 0.5;
          const cy = h * 0.5;
          const a1 = Math.min(w, h) * 0.35;
          const a2 = Math.min(w, h) * 0.28;

          const x1 = cx + Math.cos(time) * a1;
          const y1 = cy + Math.sin(time * 0.8) * a1 * 0.4;
          const x2 = cx + Math.cos(-time * 0.9 + 1.2) * a2;
          const y2 = cy + Math.sin(-time * 0.7 + 0.7) * a2 * 0.5;

          const r1 = Math.max(w, h) * 0.75;
          const r2 = Math.max(w, h) * 0.65;

          const { r1: gr1, g1, b1, r2: gr2, g2, b2 } = s.gradCurrent;

          const grad1 = bgCtx.createRadialGradient(x1, y1, 0, x1, y1, r1);
          grad1.addColorStop(0, `rgba(${gr1},${g1},${b1},0.85)`);
          grad1.addColorStop(1, "rgba(255,255,255,0)");
          bgCtx.fillStyle = grad1;
          bgCtx.fillRect(0, 0, w, h);

          const grad2 = bgCtx.createRadialGradient(x2, y2, 0, x2, y2, r2);
          grad2.addColorStop(0, `rgba(${gr2},${g2},${b2},0.70)`);
          grad2.addColorStop(1, "rgba(255,255,255,0)");
          bgCtx.fillStyle = grad2;
          bgCtx.fillRect(0, 0, w, h);

          s.bgRAF = requestAnimationFrame(drawBackground);
        };

        const startBG = () => {
          if (!bgCanvas || !bgCtx) return;
          cancelBG();
          s.bgRAF = requestAnimationFrame(drawBackground);
        };
        const cancelBG = () => {
          if (s.bgRAF) cancelAnimationFrame(s.bgRAF);
          s.bgRAF = null;
        };

        const onResize = () => {
          const prevStep = s.STEP || 1;
          const ratio = s.SCROLL_X / (s.items.length * prevStep);
          measure();
          s.VW_HALF = window.innerWidth * 0.5;
          s.SCROLL_X = mod(ratio * s.TRACK, s.TRACK);
          updateCarouselTransforms();
          resizeBG();
        };
        const onResizeDebounced = () => {
          clearTimeout(s._resizeT);
          s._resizeT = setTimeout(onResize, 80);
        };

        const onWheel = (e) => {
          if (s.isEntering) return;
          e.preventDefault();
          const delta =
            Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          s.vX += delta * wheelSensitivity * 20;
        };

        const onDragStartNative = (e) => e.preventDefault();

        const onPointerDown = (e) => {
          if (s.isEntering) return;
          s.dragging = true;
          s.lastX = e.clientX;
          s.lastT = performance.now();
          s.lastDelta = 0;
          stage.setPointerCapture(e.pointerId);
          stage.classList.add("dragging");
        };

        const onPointerMove = (e) => {
          if (!s.dragging) return;
          const now = performance.now();
          const dx = e.clientX - s.lastX;
          const dt = Math.max(1, now - s.lastT) / 1000;
          s.SCROLL_X = mod(s.SCROLL_X - dx * dragSensitivity, s.TRACK);
          s.lastDelta = dx / dt;
          s.lastX = e.clientX;
          s.lastT = now;
        };

        const onPointerUp = (e) => {
          if (!s.dragging) return;
          s.dragging = false;
          stage.releasePointerCapture(e.pointerId);
          s.vX = -s.lastDelta * dragSensitivity;
          stage.classList.remove("dragging");
        };

        const onVisibilityChange = () => {
          if (document.hidden) {
            cancelCarousel();
            cancelBG();
          } else {
            startCarousel();
            startBG();
          }
        };

        stage.addEventListener("wheel", onWheel, { passive: false });
        stage.addEventListener("dragstart", onDragStartNative);
        stage.addEventListener("pointerdown", onPointerDown);
        stage.addEventListener("pointermove", onPointerMove);
        stage.addEventListener("pointerup", onPointerUp);
        window.addEventListener("resize", onResizeDebounced);
        document.addEventListener("visibilitychange", onVisibilityChange);

        const animateEntry = async (visibleCards) => {
          await new Promise((r) => requestAnimationFrame(r));
          const tl = gsap.timeline();
          s.tl = tl;

          visibleCards.forEach(({ item, screenX }, idx) => {
            const anim = { p: 0 };
            const {
              ry,
              tz,
              scale: baseScale,
            } = computeTransformComponents(screenX);
            const START_SCALE = 0.92;
            const START_Y = 40;

            item.el.style.opacity = "0";
            item.el.style.transform = `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${START_SCALE}) translateY(${START_Y}px)`;

            tl.to(
              anim,
              {
                p: 1,
                duration: 0.6,
                ease: "power3.out",
                onUpdate: () => {
                  const t = anim.p;
                  const currentScale =
                    START_SCALE + (baseScale - START_SCALE) * t;
                  const currentY = START_Y * (1 - t);
                  item.el.style.opacity = t.toFixed(3);

                  if (t >= 0.999) {
                    const { transform } = transformForScreenX(screenX);
                    item.el.style.transform = transform;
                  } else {
                    item.el.style.transform = `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${currentScale}) translateY(${currentY}px)`;
                  }
                },
              },
              idx * 0.05,
            );
          });

          await new Promise((resolve) =>
            tl.eventCallback("onComplete", resolve),
          );
        };

        const warmupCompositing = async () => {
          const originalScrollX = s.SCROLL_X;
          const stepSize = s.STEP * 0.5;
          const numSteps = Math.ceil(s.TRACK / stepSize);

          for (let i = 0; i < numSteps; i++) {
            s.SCROLL_X = mod(originalScrollX + i * stepSize, s.TRACK);
            updateCarouselTransforms();
            if (i % 3 === 0) await new Promise((r) => requestAnimationFrame(r));
          }

          s.SCROLL_X = originalScrollX;
          updateCarouselTransforms();
          await new Promise((r) => requestAnimationFrame(r));
          await new Promise((r) => requestAnimationFrame(r));
        };

        const runInit = async () => {
          preloadImageLinks(images);
          createCards();
          measure();
          updateCarouselTransforms();
          stage.classList.add("carousel-mode");

          await waitForImages();
          if (cancelled) return;
          await decodeAllImages();
          if (cancelled) return;

          s.items.forEach((it) => {
            const img = it.el.querySelector("img");
            if (img) void img.offsetHeight;
          });

          buildPalette();

          const half = s.TRACK / 2;
          let closestIdx = 0;
          let closestDist = Infinity;
          for (let i = 0; i < s.items.length; i++) {
            let pos = s.items[i].x - s.SCROLL_X;
            if (pos < -half) pos += s.TRACK;
            if (pos > half) pos -= s.TRACK;
            const d = Math.abs(pos);
            if (d < closestDist) {
              closestDist = d;
              closestIdx = i;
            }
          }
          setActiveGradient(closestIdx);

          resizeBG();
          if (bgCtx) {
            const w = bgCanvas.clientWidth || stage.clientWidth;
            const h = bgCanvas.clientHeight || stage.clientHeight;
            bgCtx.fillStyle = canvasBaseColor;
            bgCtx.fillRect(0, 0, w, h);
          }

          await warmupCompositing();
          if (cancelled) return;

          if ("requestIdleCallback" in window) {
            await new Promise((r) => requestIdleCallback(r, { timeout: 100 }));
          }

          startBG();
          await new Promise((r) => setTimeout(r, 100));
          if (cancelled) return;

          const viewportWidth = window.innerWidth;
          const visibleCards = [];
          for (let i = 0; i < s.items.length; i++) {
            let pos = s.items[i].x - s.SCROLL_X;
            if (pos < -half) pos += s.TRACK;
            if (pos > half) pos -= s.TRACK;
            if (Math.abs(pos) < viewportWidth * 0.6) {
              visibleCards.push({ item: s.items[i], screenX: pos, index: i });
            }
          }
          visibleCards.sort((a, b) => a.screenX - b.screenX);

          if (loader) loader.classList.add("opacity-0", "invisible");

          await animateEntry(visibleCards);
          if (cancelled) return;

          s.isEntering = false;
          startCarousel();
        };

        runInit();

        s.cleanup = () => {
          if (s.tl) s.tl.kill();
          gsap.killTweensOf(s.gradCurrent);
          preloadLinks.forEach((l) => l.remove());
          stage.classList.remove("dragging", "carousel-mode");
          cancelCarousel();
          cancelBG();
          clearTimeout(s._resizeT);
          stage.removeEventListener("wheel", onWheel);
          stage.removeEventListener("dragstart", onDragStartNative);
          stage.removeEventListener("pointerdown", onPointerDown);
          stage.removeEventListener("pointermove", onPointerMove);
          stage.removeEventListener("pointerup", onPointerUp);
          window.removeEventListener("resize", onResizeDebounced);
          document.removeEventListener("visibilitychange", onVisibilityChange);
        };
      })
      .catch((e) =>
        console.error(
          "[InfiniteGradientCarousel] GSAP load failed:",
          e.message,
        ),
      );

    return () => {
      cancelled = true;
      if (stateRef.current.cleanup) stateRef.current.cleanup();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-screen overflow-hidden select-none [perspective:1800px] [overscroll-behavior:none] [&.carousel-mode]:cursor-grab [&.carousel-mode]:[touch-action:none] [&.carousel-mode.dragging]:cursor-grabbing ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={loaderRef}
        className="absolute inset-0 z-[100] grid place-items-center bg-white transition-opacity duration-200"
        aria-label="Loading"
        aria-live="assertive"
      >
        <div className="grid gap-3 justify-items-center min-w-[220px]">
          <div
            className="w-9 h-9 rounded-full border-[3px] border-neutral-300 animate-spin [border-top-color:var(--loader-accent)]"
            style={{ "--loader-accent": loaderColor }}
            aria-hidden="true"
          />
        </div>
      </div>

      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 z-0 w-full h-full block pointer-events-none [filter:blur(24px)_saturate(1.05)]"
        aria-hidden="true"
      />

      <section
        ref={cardsRootRef}
        className="absolute inset-0 z-10 [transform-style:preserve-3d]"
        aria-label="Infinite carousel of images"
      />
    </div>
  );
}
