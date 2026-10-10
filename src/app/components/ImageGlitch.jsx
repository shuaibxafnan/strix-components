"use client";

import { useEffect, useRef, useState } from "react";

// ─── ImageGlitch ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// imgSrc           string   "https://images.unsplash.com..."   Target source image
// channelLen       number   4                                  RGBA layout channel depth
// flowLineCount    number   1                                  Total tracking flow lines
// shiftLineCount   number   6                                  Slice translation bands
// scatCount        number   3                                  Scattered rectangle overlays
// bgTheme          string   "bg-black"                         Tailwind backdrop class
// ──────────────────────────────────────────────────────────────────────────

export default function ImageGlitch({
  imgSrc = "https://images.unsplash.com/photo-1541892079-2475b9253785?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
  channelLen = 4,
  flowLineCount = 1,
  shiftLineCount = 6,
  scatCount = 3,
  bgTheme = "bg-black",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Eliminate SSR/Hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let throughFlag = true;
    let throughTimeout = null;

    // Handle responsive window constraints
    let windowW = window.innerWidth;
    let windowH = window.innerHeight;
    canvas.width = windowW;
    canvas.height = windowH;

    const handleResize = () => {
      windowW = window.innerWidth;
      windowH = window.innerHeight;
      canvas.width = windowW;
      canvas.height = windowH;
    };
    window.addEventListener("resize", handleResize);

    // Initialize HTML5 Native Image Instance
    const imgOrigin = new Image();
    imgOrigin.crossOrigin = "anonymous";
    imgOrigin.src = imgSrc;

    // Emulate p5.js processing objects setup structural configurations
    let flowLineImgs = [];
    let shiftLineImgs = [];
    let shiftRGBs = Array(1).fill(null);
    let scatImgs = [];

    imgOrigin.onload = () => {
      // Setup dynamic structural profiles based on loaded assets
      for (let i = 0; i < flowLineCount; i++) {
        flowLineImgs.push({
          pixels: null,
          t1: Math.floor(Math.random() * 1000),
          speed: Math.floor(Math.random() * 20) + 4,
          randX: Math.floor(Math.random() * 56) + 24,
        });
      }
      for (let i = 0; i < shiftLineCount; i++) {
        shiftLineImgs.push(null);
      }
      for (let i = 0; i < scatCount; i++) {
        scatImgs.push({ img: null, x: 0, y: 0 });
      }

      // Boot rendering frame engine
      tick();
    };

    // Helper functions duplicating structural pixel manipulators
    const replaceData = (destImageData, srcPixels) => {
      destImageData.data.set(srcPixels);
    };

    const flowLine = (baseData, obj) => {
      const destPixels = new Uint8ClampedArray(baseData.data);
      obj.t1 %= baseData.height;
      obj.t1 += obj.speed;
      const tempY = Math.floor(obj.t1);

      for (let y = 0; y < baseData.height; y++) {
        if (tempY === y) {
          for (let x = 0; x < baseData.width; x++) {
            const index = (y * baseData.width + x) * channelLen;
            destPixels[index] = baseData.data[index] + obj.randX;
            destPixels[index + 1] = baseData.data[index + 1] + obj.randX;
            destPixels[index + 2] = baseData.data[index + 2] + obj.randX;
            destPixels[index + 3] = baseData.data[index + 3];
          }
        }
      }
      return destPixels;
    };

    const shiftLine = (baseData) => {
      const destPixels = new Uint8ClampedArray(baseData.data);
      const rangeMin = Math.floor(Math.random() * baseData.height);
      const rangeMax =
        rangeMin +
        Math.floor(Math.random() * (baseData.height - rangeMin - 1)) +
        1;
      const offsetX = channelLen * (Math.floor(Math.random() * 80) - 40);

      for (let y = 0; y < baseData.height; y++) {
        if (y > rangeMin && y < rangeMax) {
          for (let x = 0; x < baseData.width; x++) {
            const index = (y * baseData.width + x) * channelLen;
            const targetX = index + offsetX;
            if (targetX >= 0 && targetX < baseData.data.length) {
              destPixels[index] = baseData.data[targetX];
              destPixels[index + 1] = baseData.data[targetX + 1];
              destPixels[index + 2] = baseData.data[targetX + 2];
              destPixels[index + 3] = baseData.data[index + 3];
            }
          }
        }
      }
      return destPixels;
    };

    const shiftRGB = (baseData) => {
      const range = 16;
      const destPixels = new Uint8ClampedArray(baseData.data);
      const randR =
        (Math.floor(Math.random() * (range * 2) - range) * baseData.width +
          Math.floor(Math.random() * (range * 2) - range)) *
        channelLen;
      const randG =
        (Math.floor(Math.random() * (range * 2) - range) * baseData.width +
          Math.floor(Math.random() * (range * 2) - range)) *
        channelLen;
      const randB =
        (Math.floor(Math.random() * (range * 2) - range) * baseData.width +
          Math.floor(Math.random() * (range * 2) - range)) *
        channelLen;

      for (let y = 0; y < baseData.height; y++) {
        for (let x = 0; x < baseData.width; x++) {
          const index = (y * baseData.width + x) * channelLen;
          const r2 = Math.abs((index + randR) % baseData.data.length);
          const g2 = Math.abs((index + randG) % baseData.data.length);
          const b2 = Math.abs((index + randB) % baseData.data.length);

          destPixels[index] = baseData.data[r2];
          destPixels[index + 1] = baseData.data[g2];
          destPixels[index + 2] = baseData.data[b2];
          destPixels[index + 3] = baseData.data[index + 3];
        }
      }
      return destPixels;
    };

    const getRandomRectImg = (tempCtx, baseData) => {
      const startX = Math.floor(Math.random() * (baseData.width - 30));
      const startY = Math.floor(Math.random() * (baseData.height - 50));
      const rectW =
        Math.floor(Math.random() * (baseData.width - startX - 30)) + 30;
      const rectH = Math.floor(Math.random() * 49) + 1;

      return tempCtx.getImageData(startX, startY, rectW, rectH);
    };

    // Frame Execution Loop
    const tick = () => {
      ctx.clearRect(0, 0, windowW, windowH);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, windowW, windowH);

      // Create memory-isolated offscreen context matching source image sizing limits
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = imgOrigin.width;
      offscreenCanvas.height = imgOrigin.height;
      const offCtx = offscreenCanvas.getContext("2d");
      offCtx.drawImage(imgOrigin, 0, 0);

      const workingImageData = offCtx.getImageData(
        0,
        0,
        imgOrigin.width,
        imgOrigin.height,
      );
      const cleanBackupPixels = new Uint8ClampedArray(workingImageData.data);

      const renderX = (windowW - imgOrigin.width) / 2;
      const renderY = (windowH - imgOrigin.height) / 2;

      // Handle raw pass through timing sequences
      let n = Math.floor(Math.random() * 100);
      if (n > 75 && throughFlag) {
        throughFlag = false;
        throughTimeout = setTimeout(
          () => {
            throughFlag = true;
          },
          Math.floor(Math.random() * 360) + 40,
        );
      }

      if (!throughFlag) {
        ctx.putImageData(workingImageData, renderX, renderY);
      } else {
        // Apply structural mutations
        flowLineImgs.forEach((v, i) => {
          flowLineImgs[i].pixels = flowLine(workingImageData, v);
          if (flowLineImgs[i].pixels) {
            replaceData(workingImageData, flowLineImgs[i].pixels);
          }
        });

        shiftLineImgs.forEach((v, i) => {
          if (Math.floor(Math.random() * 100) > 50) {
            shiftLineImgs[i] = shiftLine(workingImageData);
            replaceData(workingImageData, shiftLineImgs[i]);
          } else if (shiftLineImgs[i]) {
            replaceData(workingImageData, shiftLineImgs[i]);
          }
        });

        shiftRGBs.forEach((v, i) => {
          if (Math.floor(Math.random() * 100) > 65) {
            shiftRGBs[i] = shiftRGB(workingImageData);
            replaceData(workingImageData, shiftRGBs[i]);
          }
        });

        // Draw primary mutated image base buffer
        offCtx.putImageData(workingImageData, 0, 0);
        ctx.drawImage(offscreenCanvas, renderX, renderY);

        // Calculate and superimpose scattered snapshot components
        scatImgs.forEach((obj) => {
          if (Math.floor(Math.random() * 100) > 80) {
            obj.x =
              Math.floor(Math.random() * (imgOrigin.width * 1.0)) -
              imgOrigin.width * 0.3;
            obj.y =
              Math.floor(Math.random() * (imgOrigin.height * 1.1)) -
              imgOrigin.height * 0.1;

            // Extract from initial unmutated visual state arrays
            offCtx.putImageData(workingImageData, 0, 0);
            obj.img = getRandomRectImg(offCtx, workingImageData);
          }
          if (obj.img) {
            ctx.putImageData(obj.img, renderX + obj.x, renderY + obj.y);
          }
        });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (throughTimeout) clearTimeout(throughTimeout);
    };
  }, [mounted, imgSrc, channelLen, flowLineCount, shiftLineCount, scatCount]);

  if (!mounted) {
    return <div className={`w-full h-screen ${bgTheme}`} />;
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen flex items-center justify-center overflow-hidden ${bgTheme}`}
    >
      <canvas ref={canvasRef} className="block max-w-full max-h-full" />
    </div>
  );
}
