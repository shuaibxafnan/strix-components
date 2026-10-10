"use client";

import { useEffect, useRef, useId } from "react";

// ─── MosaicRevealCanvas ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   #000       Page background color
// imgSrc           string   (flowers)  Image URL drawn onto the canvas
// canvasSize       number   2000       Internal canvas resolution (square). Higher = sharper but slower
// boxSize          number   123        Size of each grid box in canvas px
// fade             bool     false      Fade box opacity based on distance from pointer
// dots             bool     true       Draw dots on top of each grid box
// dotColor         string   #fff       Fill color of the dots
// dotScale         number   0.15       Dot radius as a ratio of boxSize
// initialScale     number   1.5        Starting reveal radius multiplier (m.s)
// moveDuration     number   1          gsap.quickTo duration (s) for pointer x/y follow
// moveEase         string   expo       gsap.quickTo ease for pointer x/y follow
// scaleDuration    number   2          gsap.quickTo duration (s) for reveal radius scale
// scaleEase        string   power2     gsap.quickTo ease for reveal radius scale
// ──────────────────────────────────────────────────────────────────────────

export default function MosaicRevealCanvas({
  bgColor = "#000",
  imgSrc = "https://images.unsplash.com/photo-1777059269563-51fdb397358c?q=80&w=2000",
  canvasSize = 2000,
  boxSize = 123,
  fade = false,
  dots = true,
  dotColor = "#fff",
  dotScale = 0.15,
  initialScale = 1.5,
  moveDuration = 1,
  moveEase = "expo",
  scaleDuration = 2,
  scaleEase = "power2",
}) {
  const uid = useId();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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

    let cleanupFns = [];
    let cancelled = false;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        if (cancelled) return;
        const { gsap } = window;
        const canvas = canvasRef.current;
        if (!gsap || !canvas) return;

        gsap.config({ trialWarn: false });

        const ctx = canvas.getContext("2d");
        const cw = canvasSize;
        const ch = canvasSize;
        canvas.width = cw;
        canvas.height = ch;

        let cRect = canvas.getBoundingClientRect();
        let sx = cw / cRect.width;
        let sy = ch / cRect.height;
        const T = Math.PI * 2;

        const m = {
          x: cw / 2,
          y: ch / 2,
          s: initialScale,
          x2: cw / 2,
          y2: ch / 2,
        };
        const xTo = gsap.quickTo(m, "x", {
          duration: moveDuration,
          ease: moveEase,
        });
        const yTo = gsap.quickTo(m, "y", {
          duration: moveDuration,
          ease: moveEase,
        });
        const sTo = gsap.quickTo(m, "s", {
          duration: scaleDuration,
          ease: scaleEase,
        });

        let boxes = [];
        ctx.fillStyle = dotColor;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgSrc;

        function initImg() {
          boxes = [];
          for (let x = 0; x <= cw; x += boxSize) {
            for (let y = 0; y <= ch; y += boxSize) {
              boxes.push({ x, y, d: 0, s: 0 });
            }
          }
        }

        function drawImg(box) {
          box.d = Math.hypot(box.x - m.x, box.y - m.y);
          box.s = 1 - gsap.utils.clamp(0, 1, box.d / cw / m.s);
          if (box.s < 0.001) return;
          const boxScaled = boxSize * box.s;
          if (fade) ctx.globalAlpha = box.s;
          ctx.drawImage(
            img,
            box.x + boxScaled / 2,
            box.y + boxScaled / 2,
            boxSize - boxScaled,
            boxSize - boxScaled,
            box.x,
            box.y,
            boxSize,
            boxSize,
          );
        }

        function drawDots(box) {
          ctx.beginPath();
          ctx.arc(box.x, box.y, boxSize * dotScale * box.s, 0, T);
          ctx.fill();
        }

        function update() {
          const d = Math.hypot(m.x - m.x2, m.y - m.y2);
          sTo((d / cw) * 2);
          ctx.clearRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch, 0, 0, cw, ch);
          boxes.forEach(drawImg);
          if (fade) ctx.globalAlpha = 1;
          if (dots) boxes.forEach(drawDots);
        }

        function handlePointerMove(e) {
          cRect = canvas.getBoundingClientRect();
          m.x2 = (e.clientX - cRect.left) * sx;
          m.y2 = (e.clientY - cRect.top) * sy;
          xTo(m.x2);
          yTo(m.y2);
        }

        function handleResize() {
          cRect = canvas.getBoundingClientRect();
          sx = cw / cRect.width;
          sy = ch / cRect.height;
        }

        img.onload = () => {
          if (cancelled) return;
          initImg();
          gsap.ticker.add(update);
        };

        canvas.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("resize", handleResize);

        cleanupFns.push(() => {
          gsap.ticker.remove(update);
          canvas.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("resize", handleResize);
        });
      })
      .catch((e) =>
        console.error("[MosaicRevealCanvas] GSAP load failed:", e.message),
      );

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, [
    imgSrc,
    canvasSize,
    boxSize,
    fade,
    dots,
    dotColor,
    dotScale,
    initialScale,
    moveDuration,
    moveEase,
    scaleDuration,
    scaleEase,
  ]);

  return (
    <div
      ref={containerRef}
      data-uid={uid}
      className="fixed left-1/2 top-1/2 w-screen h-screen -translate-x-1/2 -translate-y-1/2 flex justify-center"
      style={{ backgroundColor: bgColor }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square h-full w-auto [@media(min-aspect-ratio:1)]:w-full [@media(min-aspect-ratio:1)]:h-auto"
      />
    </div>
  );
}
