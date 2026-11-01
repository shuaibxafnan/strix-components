"use client";

import { useEffect, useRef, useState } from "react";

const SUN_ICON = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const VOLUME_ICON = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const FONT_ICON = (() => {
  const base = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const scaled = Array.from({ length: 15 }, () => Array(15).fill(0));
  const cx = 7,
    cy = 7;
  base.forEach((row, y) =>
    row.forEach((v, x) => {
      if (!v) return;
      const sx = Math.round((x - cx) * 0.8) + cx;
      const sy = Math.round((y - cy) * 0.8) + cy;
      if (sx >= 0 && sx < 15 && sy >= 0 && sy < 15) scaled[sy][sx] = 1;
    }),
  );
  const out = Array.from({ length: 21 }, () => Array(21).fill(0));
  const ox = Math.floor((21 - 15) / 2);
  const oy = Math.floor((21 - 15) / 2);
  scaled.forEach((row, y) =>
    row.forEach((v, x) => {
      out[y + oy][x + ox] = v;
    }),
  );
  return out;
})();

const TEXT =
  "text-[length:var(--fs)] tracking-[1px] [transition:color_0.3s_ease,font-size_0.3s_ease]";

export default function DotMatrixControls({
  darkBg = "#000000",
  lightBg = null,
  darkFg = "#ffffff",
  lightFg = null,
  accentColor = "hsl(0, 80%, 55%)",
  fontFamily = "JetBrains Mono",
  dotBgDark = "#333",
  dotFgDark = "#ffffff",
  dotBgLight = "#222",
  dotFgLight = "#ffffff",
  patternColorDark = "rgba(255,255,255,0.15)",
  patternColorLight = "rgba(0,0,0,0.07)",
  gridCols = 15,
  gridRows = 30,
  dotRadiusFactor = 0.3,
  targetBrightness = 68,
  targetVolume = 45,
  targetFontIndex = 2,
  animDuration = 800,
  animStagger = 150,
  fontSizes = [10, 12, 14, 16, 18, 20, 22],
  lightModeLabel = "LIGHT MODE",
  darkModeLabel = "DARK MODE",
  brightnessLabel = "Brightness",
  volumeLabel = "Volume",
  fontSizeLabel = "Font Size",
  audioSrc = "",
  className = "",
}) {
  const brightnessCvs = useRef(null);
  const volumeCvs = useRef(null);
  const fontSizeCvs = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ambientRef = useRef(null);
  const rafRef = useRef(null);

  const [brightness, setBrightness] = useState(0);
  const [volume, setVolume] = useState(0);
  const [fontIdx, setFontIdx] = useState(0);
  const [isLightMode, setIsLightMode] = useState(false);

  const bValRef = useRef(0);
  const vValRef = useRef(0);
  const fValRef = useRef(0);

  const setupCanvas = (canvas) => {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return ctx;
  };

  const drawControl = (canvas, value, maxValue, icon, isLight) => {
    if (!canvas) return;
    const ctx = setupCanvas(canvas);
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    const cellW = width / gridCols;
    const cellH = height / gridRows;
    const dotR = Math.min(cellW, cellH) * dotRadiusFactor;
    const fillHeight = height * (value / maxValue);

    const bgCol = isLight ? dotBgLight : dotBgDark;
    const fgCol = isLight ? dotFgLight : dotFgDark;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const x = col * cellW + cellW / 2;
        const y = row * cellH + cellH / 2;

        let isIconDot = false;
        if (icon) {
          const iRows = icon.length;
          const iCols = icon[0].length;
          const iconStartRow =
            Math.floor(gridRows * 0.6) - Math.floor(iRows / 2);
          const iconStartCol = Math.floor((gridCols - iCols) / 2);
          const ir = row - iconStartRow;
          const ic = col - iconStartCol;
          if (
            ir >= 0 &&
            ir < iRows &&
            ic >= 0 &&
            ic < iCols &&
            icon[ir][ic] === 1
          ) {
            isIconDot = true;
          }
        }

        const isFilled = height - y <= fillHeight;

        ctx.beginPath();
        ctx.arc(x, y, isIconDot ? dotR * 1.1 : dotR, 0, Math.PI * 2);
        ctx.fillStyle = isIconDot
          ? isFilled
            ? bgCol
            : fgCol
          : isFilled
            ? fgCol
            : bgCol;
        ctx.fill();
      }
    }
  };

  const redrawAll = (bv, vv, fv, light) => {
    drawControl(brightnessCvs.current, bv, 100, SUN_ICON, light);
    drawControl(volumeCvs.current, vv, 100, VOLUME_ICON, light);
    drawControl(
      fontSizeCvs.current,
      fv,
      fontSizes.length - 1,
      FONT_ICON,
      light,
    );
  };

  const setupDrag = (containerRef, onUpdate) => {
    const el = containerRef.current;
    if (!el) return () => { };

    let dragging = false;

    const getY = (e) =>
      e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

    const update = (e) => {
      const rect = el.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(1, (rect.bottom - getY(e)) / rect.height),
      );
      onUpdate(pct);
    };

    const onMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      update(e);
    };
    const onEnd = () => {
      dragging = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchend", onEnd);
    };
    const onStart = (e) => {
      e.preventDefault();
      dragging = true;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchend", onEnd);
      update(e);
    };

    el.addEventListener("mousedown", onStart);
    el.addEventListener("touchstart", onStart, { passive: false });
    return () => {
      el.removeEventListener("mousedown", onStart);
      el.removeEventListener("touchstart", onStart);
      onEnd();
    };
  };

  const startAmbient = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.resume?.();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = (vValRef.current / 100) * 0.3;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 300 + (bValRef.current / 100) * 2200;
    filter.Q.value = 0.7;
    filter.connect(master);
    master.connect(ctx.destination);

    const notes = [110, 164.81, 220, 261.63, 329.63, 493.88];
    const nodes = [];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 14;

      const gain = ctx.createGain();
      gain.gain.value = Math.max(0.03, 0.14 - i * 0.02);

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + Math.random() * 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = gain.gain.value * 0.6;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      lfo.start();
      nodes.push(osc, lfo);
    });

    audioCtxRef.current = ctx;
    ambientRef.current = { master, filter, nodes };
  };

  const brightnessDragRef = useRef(null);
  const volumeDragRef = useRef(null);
  const fontSizeDragRef = useRef(null);

  useEffect(() => {
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const sync = () => {
      const bv = bValRef.current;
      const vv = vValRef.current;
      const fv = fValRef.current;
      const light = bv > 50;

      setBrightness(Math.round(bv));
      setVolume(Math.round(vv));
      setFontIdx(Math.round(fv));
      setIsLightMode(light);

      if (audioRef.current) audioRef.current.volume = vv / 100;

      const ctx = audioCtxRef.current;
      const amb = ambientRef.current;
      if (ctx && amb) {
        amb.master.gain.setTargetAtTime((vv / 100) * 0.3, ctx.currentTime, 0.05);
        amb.filter.frequency.setTargetAtTime(
          300 + (bv / 100) * 2200,
          ctx.currentTime,
          0.1,
        );
      }

      redrawAll(bv, vv, fv, light);
    };

    const cleanB = setupDrag(brightnessDragRef, (pct) => {
      bValRef.current = Math.round(pct * 100);
      sync();
    });
    const cleanV = setupDrag(volumeDragRef, (pct) => {
      vValRef.current = Math.round(pct * 100);
      sync();
    });
    const cleanF = setupDrag(fontSizeDragRef, (pct) => {
      fValRef.current = Math.min(
        fontSizes.length - 1,
        Math.round(pct * (fontSizes.length - 1)),
      );
      sync();
    });

    const onResize = () => sync();
    window.addEventListener("resize", onResize);

    const onFirstInteraction = () => {
      if (audioSrc) audioRef.current?.play().catch(() => { });
      else startAmbient();
    };
    document.addEventListener("pointerdown", onFirstInteraction, {
      once: true,
    });

    const start = performance.now();
    const animate = (now) => {
      const el = now - start;

      bValRef.current =
        el <= animDuration
          ? easeOutCubic(el / animDuration) * targetBrightness
          : targetBrightness;

      if (el >= animStagger) {
        const p = Math.min(1, (el - animStagger) / animDuration);
        vValRef.current =
          el <= animDuration + animStagger
            ? easeOutCubic(p) * targetVolume
            : targetVolume;
      }

      if (el >= animStagger * 2) {
        const p = Math.min(1, (el - animStagger * 2) / animDuration);
        fValRef.current =
          el <= animDuration + animStagger * 2
            ? easeOutCubic(p) * targetFontIndex
            : targetFontIndex;
      }

      sync();

      if (el < animDuration + animStagger * 2) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 300);

    return () => {
      cleanB();
      cleanV();
      cleanF();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("pointerdown", onFirstInteraction);
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ambientRef.current?.nodes.forEach((n) => {
        try {
          n.stop();
        } catch { }
      });
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      ambientRef.current = null;
    };
  }, []);

  const displayFontSize = fontSizes[Math.min(fontIdx, fontSizes.length - 1)];

  const bgColor = isLightMode
    ? (lightBg ?? `hsl(223, 10%, ${95 - (1 - brightness / 100) * 20}%)`)
    : darkBg;
  const fgColor = isLightMode ? (lightFg ?? "hsl(223, 10%, 15%)") : darkFg;
  const patternColor = isLightMode ? patternColorLight : patternColorDark;

  const controls = [
    { ref: brightnessDragRef, cvs: brightnessCvs, label: brightnessLabel, value: `${brightness}%` },
    { ref: volumeDragRef, cvs: volumeCvs, label: volumeLabel, value: `${volume}%` },
    { ref: fontSizeDragRef, cvs: fontSizeCvs, label: fontSizeLabel, value: `${displayFontSize}px` },
  ];

  return (
    <div
      className={`relative flex h-screen w-full overflow-hidden bg-[var(--bg)] font-[family-name:var(--font)] text-[12px] text-[var(--fg)] [transition:background-color_0.3s_ease,color_0.3s_ease] ${className}`}
      style={{
        "--bg": bgColor,
        "--fg": fgColor,
        "--accent": accentColor,
        "--fs": `${displayFontSize}px`,
        "--font": `"${fontFamily}", "Courier New", monospace`,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
      />

      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dmc-dotgrid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill={patternColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dmc-dotgrid)" />
      </svg>

      <div
        className={`absolute right-4 top-4 z-10 sm:right-8 sm:top-8 flex items-center gap-2 ${TEXT}`}
      >
        <span className="inline-block h-[0.6em] w-[0.6em] rounded-full bg-[var(--fg)] [transition:background-color_0.3s_ease]" />
        <p>{isLightMode ? lightModeLabel : darkModeLabel}</p>
      </div>

      <main className="relative z-[1] flex h-full w-full overflow-x-hidden">
        <div className="m-auto grid grid-cols-3 gap-2 py-6 sm:gap-6">
          {controls.map((c) => (
            <div key={c.label} className="flex flex-col items-center">
              <div
                ref={c.ref}
                className="relative h-[22em] w-[min(10.5em,calc((100vw-2rem)/3-0.5rem))] cursor-pointer"
              >
                <canvas
                  ref={c.cvs}
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <p
                className={`mt-3 uppercase [transition:color_0.5s_ease,font-size_0.3s_ease] text-[length:var(--fs)] tracking-[1px]`}
              >
                {c.label}
              </p>
              <p
                className="mt-1 text-[length:var(--fs)] text-[var(--accent)] [transition:color_0.5s_ease,font-size_0.3s_ease]"
              >
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </main>

      {audioSrc && (
        <audio ref={audioRef} autoPlay loop className="hidden">
          <source src={audioSrc} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}