"use client";

import { useEffect, useRef } from "react";

// ─── TextSparks ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// canvasBg           string    "#111111"     Clear-fill frame background color
// displayTime        number    3000          Active textual display phase (ms)
// fadeInDuration     number    50            Scale variable for progressive alpha introduction
// fadeOutDuration    number    50            Scale variable for progressive alpha extraction
// particlesPerFrame  number    50            Quantity of discrete vectors injected per execution frame
// fontStyle          string    "bold Arial"  Target CSS Canvas rendering font engine identity
// baseSize           number    200           Resolution layout baseline multiplier mapping width scale
// textItems          array     [...]         Configurable target collection rendering textual layers
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_TEXT_ITEMS = [
  { text: "D", hue: 197, saturation: 100, lightness: 50 },
  { text: "E", hue: 0, saturation: 100, lightness: 50 },
  { text: "V", hue: 197, saturation: 100, lightness: 50 },
  { text: "I", hue: 197, saturation: 100, lightness: 50 },
  { text: "L", hue: 45, saturation: 100, lightness: 50 },
];

export default function TextSparks({
  canvasBg = "#111111",
  displayTime = 3000,
  fadeInDuration = 50,
  fadeOutDuration = 50,
  particlesPerFrame = 50,
  fontStyle = "bold Arial",
  baseSize = 200,
  textItems = DEFAULT_TEXT_ITEMS,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Isolate execution parameters safely inside client mount to prevent SSR collisions
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) return;

    const ctx = currentCanvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Core operational state definitions
    let tick = 0;
    let opa = 0;
    let stackId = -1;
    let maskTick = 0;
    let mask = null;
    let maskCache = [];
    const particleMap = new Map();

    // Internal configuration builder utilizing functional tracking definitions
    const colorString = (hsl, opacity) => {
      return `hsla(${hsl.h | 0}, ${hsl.s}%, ${hsl.l}%, ${opacity})`;
    };

    // Construct baseline metrics
    const stack = [
      {
        ticks: 0.05 * displayTime,
        fadeIn: fadeInDuration ? 50 / fadeInDuration : 0,
        fadeOut: fadeOutDuration ? 50 / fadeOutDuration : 0,
        texts: textItems.map((item) => ({
          text: item.text,
          hsl: {
            h: item.hue ?? 0,
            s: item.saturation ?? 100,
            l: item.lightness ?? 50,
          },
        })),
      },
    ];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (currentCanvas) {
        currentCanvas.setAttribute("width", width.toString());
        currentCanvas.setAttribute("height", height.toString());
      }
    };

    const buildTextMask = (texts) => {
      const internalMask = [];
      const textAll = texts.reduce(
        (all, textStack) => all.concat(textStack.text),
        "",
      );

      const sizeFactor = 0.8;
      const maskWidth = baseSize;
      const maskHeight = (maskWidth / (width / height)) | 0;
      const baseFontSize = 20;

      const maskCanvas = document.createElement("canvas");
      const maskEngine = maskCanvas.getContext("2d");

      maskCanvas.setAttribute("width", maskWidth.toString());
      maskCanvas.setAttribute("height", maskHeight.toString());

      const getFontDescriptor = (size) => `bold ${size}px Arial`;

      maskEngine.fillStyle = "#000000";
      maskEngine.font = getFontDescriptor(baseFontSize);

      const textMeasurement = maskEngine.measureText(textAll);
      const rel = textMeasurement.width / (maskWidth * sizeFactor);
      const fSize = Math.min(maskHeight * 0.8, (baseFontSize / rel) | 0);

      maskEngine.font = getFontDescriptor(fSize);
      const fontWidth = maskEngine.measureText(textAll).width;

      let left = (maskWidth - fontWidth) / 2;
      const bot = maskHeight / 2 + fSize * 0.35;

      texts.forEach((textStack) => {
        maskEngine.clearRect(0, 0, maskWidth, maskHeight);
        maskEngine.fillText(textStack.text, left, bot);
        left += maskEngine.measureText(textStack.text).width;

        const imgData = maskEngine.getImageData(0, 0, maskWidth, maskHeight);
        const subStack = [];

        for (let i = 0, max = imgData.width * imgData.height; i < max; i++) {
          if (imgData.data[i * 4 + 3]) {
            subStack.push({
              x: (i % imgData.width) / imgData.width,
              y: ((i / imgData.width) | 0) / imgData.height,
              o: Math.random(),
              t: Math.random(),
            });
          }
        }

        internalMask.push({
          hsl: textStack.hsl,
          s: subStack,
        });
      });

      return internalMask;
    };

    const prepareParticle = (particle) => {
      const r1 = Math.random();
      const r2 = Math.random();
      const r3 = Math.random();
      const rad = r3 * Math.PI * 2;

      particle.x += (-0.5 + r1) / 300;
      particle.y += (-0.5 + r2) / 300;
      particle.si = (1 + Math.random() * 4) | 0;
      particle.s = 0.003 + (r1 + r2) / 2 / 10;
      particle.l = 0;
      particle.mx = Math.cos(rad) * (particle.s / (r1 < 0.05 ? 10 : 400));
      particle.my = Math.sin(rad) * (particle.s / (r1 < 0.05 ? 10 : 400));

      particle.updateAndDraw = drawParticle;
    };

    const drawParticle = (particle) => {
      if (particle.l >= 1) {
        particle.updateAndDraw = null;
        return;
      }

      particle.l += particle.s;
      particle.x += particle.mx;
      particle.y += particle.my;

      ctx.fillStyle = colorString(
        particle.hsl,
        opa * Math.sin(particle.l * Math.PI),
      );
      ctx.fillRect(
        particle.x * width,
        particle.y * height,
        particle.si,
        particle.si,
      );
    };

    const createNewParticle = () => {
      if (!mask || mask.length === 0) return;

      for (let i = 0; i < particlesPerFrame; i++) {
        const main = (Math.random() * mask.length) | 0;
        const subMask = mask[main];
        if (!subMask || !subMask.s.length) continue;

        const maskElement = subMask.s[(Math.random() * subMask.s.length) | 0];

        if (maskElement) {
          const particle = {
            x: maskElement.x,
            y: maskElement.y,
            hsl: subMask.hsl,
            updateAndDraw: prepareParticle,
          };
          particleMap.set(particle, particle);
        }
      }
    };

    const clear = () => {
      ctx.fillStyle = canvasBg;
      ctx.fillRect(0, 0, width, height);
    };

    const renderParticles = () => {
      particleMap.forEach((particle) => {
        if (particle.updateAndDraw) {
          particle.updateAndDraw(particle);
        }
        if (!particle.updateAndDraw) {
          particleMap.delete(particle);
        }
      });
    };

    const drawStatic = () => {
      if (!mask) return;

      let i = 0;
      const step = 0.01;

      mask.forEach((subMask) => {
        subMask.s.forEach((pos) => {
          i++;
          ctx.fillStyle = colorString(
            subMask.hsl,
            ((1 + Math.cos(pos.x * 5 * pos.y * 5 + tick / 10)) / 2) *
              opa *
              pos.t *
              0.5,
          );
          ctx.fillRect(pos.x * width, pos.y * height, width / 150, width / 150);

          if (i % 2) return;

          pos.o += step;
          const currentOpa = Math.max(0, Math.sin(pos.o * Math.PI * 2));
          const padding = (currentOpa * width) / 200;

          ctx.fillStyle = colorString(subMask.hsl, opa * currentOpa * 0.2);

          if (pos.t < 0.5) {
            ctx.beginPath();
            ctx.arc(
              pos.x * width,
              pos.y * height,
              width / 500 + padding,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          } else {
            ctx.fillRect(
              pos.x * width - padding,
              pos.y * height - padding,
              width / 150 + padding * 2,
              width / 150 + padding * 2,
            );
          }
        });
      });
    };

    // State Sequencer Logic
    let nextMaskCb;

    const afterFadeIn = () => {
      opa = 1;
      if (stack[stackId].ticks) {
        maskTick = 0;
        nextMaskCb = tickMask;
      } else {
        nextMaskCb = () => {};
      }
    };

    const fadeInMask = () => {
      opa += stack[stackId].fadeIn;
      if (opa >= 1) {
        opa = 1;
        afterFadeIn();
      }
    };

    const afterFadeOut = () => {
      opa = 0;
      nextMaskCb = nextMask;
    };

    const fadeOutMask = () => {
      opa -= stack[stackId].fadeOut;
      if (opa <= 0) {
        afterFadeOut();
      }
    };

    const tickMask = () => {
      maskTick++;
      if (maskTick >= stack[stackId].ticks) {
        if (stack[stackId].fadeOut) {
          nextMaskCb = fadeOutMask;
        } else {
          afterFadeOut();
        }
      }
    };

    const nextMask = () => {
      stackId++;
      if (stackId >= stack.length) {
        stackId = 0;
      }
      mask = maskCache[stackId];

      if (stack[stackId].fadeIn) {
        nextMaskCb = fadeInMask;
      } else {
        opa = 1;
        afterFadeIn();
      }
    };

    const draw = () => {
      tick++;
      nextMaskCb();
      createNewParticle();
      clear();

      ctx.globalCompositeOperation = "lighter";
      drawStatic();
      renderParticles();
      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(draw);
    };

    // Initialization Sequence
    resize();
    maskCache = stack.map((s) => buildTextMask(s.texts));
    nextMaskCb = nextMask;
    window.addEventListener("resize", resize);

    // Initial Engine Kickoff
    draw();

    // Context Tear-down Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [
    canvasBg,
    displayTime,
    fadeInDuration,
    fadeOutDuration,
    particlesPerFrame,
    fontStyle,
    baseSize,
    textItems,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none bg-[#111111]"
    >
      {/* Configuration data isolated out of standard DOM structure layout to keep output performant */}
      <canvas ref={canvasRef} className="block w-full h-full touch-none" />
    </div>
  );
}
