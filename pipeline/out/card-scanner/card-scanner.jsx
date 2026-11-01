"use client";

import { useCallback, useEffect, useRef } from "react";

const MAX_CARDS = 5;
const REPEATS = 3;

const SCAN_FX_CLASS =
  "pointer-events-none absolute inset-0 z-[5] animate-[csScanFx_0.6s_ease-out] bg-[linear-gradient(90deg,transparent,rgba(var(--scan-light),0.45),transparent)]";

const DEFAULT_CARDS = [
  {
    brand: "Meridian",
    number: "4821 0000 0000 7316",
    holder: "A. Rivera",
    expiry: "09/28",
    from: "#111827",
    to: "#374151",
  },
  {
    brand: "Halcyon",
    number: "5190 0000 0000 2048",
    holder: "J. Okafor",
    expiry: "03/27",
    from: "#18181b",
    to: "#52525b",
  },
  {
    brand: "Vantage",
    number: "3714 0000 0000 9935",
    holder: "M. Lindqvist",
    expiry: "12/29",
    from: "#0f172a",
    to: "#1e3a5f",
  },
  {
    brand: "Orbit",
    number: "6011 0000 0000 5502",
    holder: "S. Tanaka",
    expiry: "06/26",
    from: "#1c1917",
    to: "#57534e",
  },
  {
    brand: "Lumen",
    number: "4539 0000 0000 1187",
    holder: "R. Haddad",
    expiry: "01/30",
    from: "#27235c",
    to: "#5b3fa8",
  },
];

const DEFAULT_SNIPPETS = [
  'const preview = "scanner demo";',
  "const SCAN_WIDTH = 8;",
  "const FADE_ZONE = 35;",
  "const MAX_PARTICLES = 2500;",
  "function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }",
  "function lerp(a, b, t) { return a + (b - a) * t; }",
  "const now = () => performance.now();",
  "function rng(min, max) { return Math.random() * (max - min) + min; }",
  "class Particle0 { constructor(x,y,vx,vy,r,a) { this.x=x; this.y=y; this.vx=vx; this.vy=vy; } step(dt) { this.x+=this.vx*dt; } }",
  "const scanner = { x: Math.floor(window.innerWidth/2), width: SCAN_WIDTH, glow: 3.5, };",
  "function drawParticle(ctx,p) { ctx.globalAlpha=clamp(p.a,0,1); ctx.drawImage(gradient,p.x-p.r,p.y-p.r,p.r*2,p.r*2); }",
  "function tick(t) { const dt=0.016; }",
  "const state = { intensity: 1.2, particles: MAX_PARTICLES };",
  "const bounds = { w: window.innerWidth, h: 300 };",
  "ctx.globalCompositeOperation = 'lighter';",
];

const hexToRgb = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mixWhite = ([r, g, b], t) => [
  Math.round(r + (255 - r) * t),
  Math.round(g + (255 - g) * t),
  Math.round(b + (255 - b) * t),
];

function generateCode(width, height, snippets) {
  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[randInt(0, arr.length - 1)];

  const library = [...snippets];

  for (let i = 0; i < 40; i++) {
    library.push(
      `const v${i} = (${randInt(1, 9)} + ${randInt(10, 99)}) * 0.${randInt(1, 9)};`,
    );
  }
  for (let i = 0; i < 20; i++) {
    library.push(
      `if (state.intensity > ${1 + (i % 3)}) { scanner.glow += 0.01; }`,
    );
  }

  let flow = library.join(" ").replace(/\s+/g, " ").trim();
  const totalChars = width * height;
  while (flow.length < totalChars + width) {
    flow += " " + pick(library).replace(/\s+/g, " ").trim();
  }

  let out = "";
  let offset = 0;
  for (let row = 0; row < height; row++) {
    let line = flow.slice(offset, offset + width);
    if (line.length < width) line = line + " ".repeat(width - line.length);
    out += line + (row < height - 1 ? "\n" : "");
    offset += width;
  }
  return out;
}

function Contactless() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-7 w-7 text-white/70"
      aria-hidden="true"
    >
      <path d="M8 9.5a4 4 0 0 1 0 5" />
      <path d="M11.5 7a8 8 0 0 1 0 10" />
      <path d="M15 4.5a12 12 0 0 1 0 15" />
    </svg>
  );
}

function CardFace({ card, labels }) {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-6 text-white [background:linear-gradient(135deg,var(--from),var(--to))]"
      style={{ "--from": card.from, "--to": card.to }}
    >
      <span className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.14),transparent_55%)]" />

      <div className="relative flex items-start justify-between">
        <span className="text-xl font-bold tracking-tight">{card.brand}</span>
        <Contactless />
      </div>

      <div className="relative">
        <div className="mb-5 h-8 w-11 rounded-md bg-gradient-to-br from-white/40 to-white/10 ring-1 ring-white/20" />
        <div className="font-[family-name:var(--mono)] text-[1.3rem] tracking-[0.12em]">
          {card.number}
        </div>
      </div>

      <div className="relative flex items-end justify-between text-sm font-medium">
        <div>
          <span className="block text-xs font-normal text-white/55">
            {labels.holder}
          </span>
          {card.holder}
        </div>
        <div className="text-right">
          <span className="block text-xs font-normal text-white/55">
            {labels.expires}
          </span>
          {card.expiry}
        </div>
      </div>
    </div>
  );
}

export default function CardScanner({
  cards = DEFAULT_CARDS,
  cardWidth = 400,
  cardHeight = 250,
  cardGap = 60,
  initialVelocity = 120,
  friction = 0.95,
  minVelocity = 30,
  scannerWidth = 8,
  scannerColor = "#8b5cf6",
  particleCount = 400,
  scanParticleMax = 2500,
  baseParticleMax = 800,
  codeSnippets = DEFAULT_SNIPPETS,
  swipeLabel = "Swipe",
  cardLabels = { holder: "Card holder", expires: "Expires" },
  fontFamily = "Hanken Grotesk",
  monoFont = "JetBrains Mono",
  backgroundColor = "#000000",
  className = "",
}) {
  const cardStreamRef = useRef(null);
  const cardLineRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const scannerCanvasRef = useRef(null);

  const items = cards.slice(0, MAX_CARDS);
  const itemCount = items.length;
  const loop = Array.from({ length: REPEATS }, (_, r) =>
    items.map((card, i) => ({ card, key: `${r}-${i}` })),
  ).flat();

  const [sr, sg, sb] = hexToRgb(scannerColor);
  const [lr, lg, lb] = mixWhite([sr, sg, sb], 0.55);

  const stateRef = useRef({
    position: 0,
    velocity: initialVelocity,
    direction: -1,
    isAnimating: true,
    isDragging: false,
    lastTime: 0,
    lastMouseX: 0,
    mouseVelocity: 0,
    loopWidth: 0,
    scanningActive: false,
    animFrameId: null,
    particleAnimId: null,
    scannerAnimId: null,
  });

  const codeSize = useCallback((cw, ch) => {
    return { width: Math.floor(cw / 6), height: Math.floor(ch / 13) };
  }, []);

  const wrapPosition = useCallback(() => {
    const s = stateRef.current;
    if (s.loopWidth <= 0) return;
    if (s.position <= -s.loopWidth) s.position += s.loopWidth;
    else if (s.position > 0) s.position -= s.loopWidth;
  }, []);

  const updateCardClipping = useCallback(() => {
    const s = stateRef.current;
    const scanX = window.innerWidth / 2;
    const sLeft = scanX - scannerWidth / 2;
    const sRight = scanX + scannerWidth / 2;
    let anyScanning = false;

    if (!cardLineRef.current) return;
    Array.from(cardLineRef.current.children).forEach((wrapper) => {
      const rect = wrapper.getBoundingClientRect();
      const cardL = rect.left;
      const cardR = rect.right;
      const cw = rect.width;
      const normalCard = wrapper.querySelector("[data-normal]");
      const asciiCard = wrapper.querySelector("[data-ascii]");
      if (!normalCard || !asciiCard) return;

      if (cardL < sRight && cardR > sLeft) {
        anyScanning = true;
        const intLeft = Math.max(sLeft - cardL, 0);
        const intRight = Math.min(sRight - cardL, cw);
        const clipRight = (intLeft / cw) * 100;
        const clipLeft = (intRight / cw) * 100;
        normalCard.style.setProperty("--cs-clip-right", `${clipRight}%`);
        asciiCard.style.setProperty("--cs-clip-left", `${clipLeft}%`);

        if (!wrapper.hasAttribute("data-scanned") && intLeft > 0) {
          wrapper.setAttribute("data-scanned", "true");
          const fx = document.createElement("div");
          fx.className = SCAN_FX_CLASS;
          wrapper.appendChild(fx);
          setTimeout(() => fx.parentNode && fx.parentNode.removeChild(fx), 600);
        }
      } else {
        if (cardR < sLeft) {
          normalCard.style.setProperty("--cs-clip-right", "100%");
          asciiCard.style.setProperty("--cs-clip-left", "100%");
        } else if (cardL > sRight) {
          normalCard.style.setProperty("--cs-clip-right", "0%");
          asciiCard.style.setProperty("--cs-clip-left", "0%");
        }
        wrapper.removeAttribute("data-scanned");
      }
    });

    s.scanningActive = anyScanning;
  }, [scannerWidth]);

  const updateCardPosition = useCallback(() => {
    const s = stateRef.current;
    wrapPosition();
    if (cardLineRef.current) {
      cardLineRef.current.style.transform = `translateX(${s.position}px)`;
    }
    updateCardClipping();
  }, [updateCardClipping, wrapPosition]);

  const animate = useCallback(() => {
    const s = stateRef.current;
    const now = performance.now();
    const dt = (now - s.lastTime) / 1000;
    s.lastTime = now;

    if (s.isAnimating && !s.isDragging) {
      if (s.velocity > minVelocity) {
        s.velocity *= friction;
      } else {
        s.velocity = Math.max(minVelocity, s.velocity);
      }
      s.position += s.velocity * s.direction * dt;
      updateCardPosition();
    }

    s.animFrameId = requestAnimationFrame(animate);
  }, [friction, minVelocity, updateCardPosition]);

  const startDrag = useCallback((clientX) => {
    const s = stateRef.current;
    s.isDragging = true;
    s.isAnimating = false;
    s.lastMouseX = clientX;
    s.mouseVelocity = 0;

    if (cardLineRef.current) {
      const transform = window.getComputedStyle(cardLineRef.current).transform;
      if (transform !== "none") {
        const matrix = new DOMMatrix(transform);
        s.position = matrix.m41;
      }
      cardLineRef.current.classList.add("cs-dragging");
    }
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  }, []);

  const onDrag = useCallback(
    (clientX) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const delta = clientX - s.lastMouseX;
      s.position += delta;
      s.mouseVelocity = delta * 60;
      s.lastMouseX = clientX;
      wrapPosition();
      if (cardLineRef.current) {
        cardLineRef.current.style.transform = `translateX(${s.position}px)`;
      }
      updateCardClipping();
    },
    [updateCardClipping, wrapPosition],
  );

  const endDrag = useCallback(() => {
    const s = stateRef.current;
    if (!s.isDragging) return;
    s.isDragging = false;
    if (cardLineRef.current)
      cardLineRef.current.classList.remove("cs-dragging");

    if (Math.abs(s.mouseVelocity) > minVelocity) {
      s.velocity = Math.abs(s.mouseVelocity);
      s.direction = s.mouseVelocity > 0 ? 1 : -1;
    } else {
      s.velocity = initialVelocity;
    }
    s.isAnimating = true;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, [minVelocity, initialVelocity]);

  useEffect(() => {
    const s = stateRef.current;
    const cardLine = cardLineRef.current;
    const stream = cardStreamRef.current;
    if (!cardLine || !stream) return;

    s.loopWidth = (cardWidth + cardGap) * itemCount;
    s.position = 0;
    cardLine.style.transform = "translateX(0px)";

    const dims = codeSize(cardWidth, cardHeight);
    const fillAscii = (el) => {
      el.textContent = generateCode(dims.width, dims.height, codeSnippets);
    };
    stream.querySelectorAll("[data-ascii-content]").forEach(fillAscii);

    s.lastTime = performance.now();
    s.animFrameId = requestAnimationFrame(animate);

    const asciiInterval = setInterval(() => {
      stream.querySelectorAll("[data-ascii-content]").forEach((el) => {
        if (Math.random() < 0.15) fillAscii(el);
      });
    }, 200);

    const onMouseDown = (e) => startDrag(e.clientX);
    const onMouseMove = (e) => onDrag(e.clientX);
    const onMouseUp = () => endDrag();
    const onTouchStart = (e) => {
      e.preventDefault();
      startDrag(e.touches[0].clientX);
    };
    const onTouchMove = (e) => {
      if (!s.isDragging) return;
      e.preventDefault();
      onDrag(e.touches[0].clientX);
    };
    const onTouchEnd = () => endDrag();
    const onWheel = (e) => {
      e.preventDefault();
      s.position += e.deltaY > 0 ? 20 : -20;
      updateCardPosition();
    };
    const onSelectStart = (e) => e.preventDefault();
    const onDragStart = (e) => e.preventDefault();

    cardLine.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    cardLine.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    cardLine.addEventListener("wheel", onWheel, { passive: false });
    cardLine.addEventListener("selectstart", onSelectStart);
    cardLine.addEventListener("dragstart", onDragStart);

    return () => {
      cancelAnimationFrame(s.animFrameId);
      clearInterval(asciiInterval);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      cardLine.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      cardLine.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      cardLine.removeEventListener("wheel", onWheel);
      cardLine.removeEventListener("selectstart", onSelectStart);
      cardLine.removeEventListener("dragstart", onDragStart);
    };
  }, [
    itemCount,
    cardWidth,
    cardHeight,
    cardGap,
    codeSnippets,
    animate,
    startDrag,
    onDrag,
    endDrag,
    updateCardPosition,
    codeSize,
  ]);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    let cancelled = false;
    let cleanup = () => { };

    import("three")
      .then((THREE) => {
        if (cancelled) return;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
          -window.innerWidth / 2,
          window.innerWidth / 2,
          125,
          -125,
          1,
          1000,
        );
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(window.innerWidth, 250);
        renderer.setClearColor(0x000000, 0);

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount);
        const alphas = new Float32Array(particleCount);

        const gc = document.createElement("canvas");
        gc.width = 100;
        gc.height = 100;
        const gctx = gc.getContext("2d");
        const half = 50;
        const grad = gctx.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0.025, "#fff");
        grad.addColorStop(0.1, "hsl(217,61%,33%)");
        grad.addColorStop(0.25, "hsl(217,64%,6%)");
        grad.addColorStop(1, "transparent");
        gctx.fillStyle = grad;
        gctx.beginPath();
        gctx.arc(half, half, half, 0, Math.PI * 2);
        gctx.fill();
        const texture = new THREE.CanvasTexture(gc);

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
          positions[i * 3 + 2] = 0;
          colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 1;
          const orbitRadius = Math.random() * 200 + 100;
          sizes[i] = (Math.random() * (orbitRadius - 60) + 60) / 8;
          velocities[i] = Math.random() * 60 + 30;
          alphas[i] = (Math.random() * 8 + 2) / 10;
        }

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        );
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            pointTexture: { value: texture },
            size: { value: 15.0 },
          },
          vertexShader: `
            attribute float alpha; varying float vAlpha; varying vec3 vColor; uniform float size;
            void main() { vAlpha=alpha; vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size; gl_Position=projectionMatrix*mv; }
          `,
          fragmentShader: `
            uniform sampler2D pointTexture; varying float vAlpha; varying vec3 vColor;
            void main() { gl_FragColor=vec4(vColor,vAlpha)*texture2D(pointTexture,gl_PointCoord); }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexColors: true,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const threeAnimate = () => {
          s.particleAnimId = requestAnimationFrame(threeAnimate);
          const pos = particles.geometry.attributes.position.array;
          const alps = particles.geometry.attributes.alpha.array;
          const time = Date.now() * 0.001;
          for (let i = 0; i < particleCount; i++) {
            pos[i * 3] += velocities[i] * 0.016;
            if (pos[i * 3] > window.innerWidth / 2 + 100) {
              pos[i * 3] = -window.innerWidth / 2 - 100;
              pos[i * 3 + 1] = (Math.random() - 0.5) * 250;
            }
            pos[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.5;
            const t = Math.floor(Math.random() * 10);
            if (t === 1 && alps[i] > 0) alps[i] -= 0.05;
            else if (t === 2 && alps[i] < 1) alps[i] += 0.05;
            alps[i] = Math.max(0, Math.min(1, alps[i]));
          }
          particles.geometry.attributes.position.needsUpdate = true;
          particles.geometry.attributes.alpha.needsUpdate = true;
          renderer.render(scene, camera);
        };
        threeAnimate();

        const onResize = () => {
          camera.left = -window.innerWidth / 2;
          camera.right = window.innerWidth / 2;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, 250);
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          cancelAnimationFrame(s.particleAnimId);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
          geometry.dispose();
          material.dispose();
          texture.dispose();
        };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [particleCount]);

  useEffect(() => {
    const canvas = scannerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    let w = window.innerWidth;
    const h = 300;
    canvas.width = w;
    canvas.height = h;

    const base = `${sr},${sg},${sb}`;
    const light = `${lr},${lg},${lb}`;

    const gcCanvas = document.createElement("canvas");
    gcCanvas.width = 16;
    gcCanvas.height = 16;
    const gcCtx = gcCanvas.getContext("2d");
    const half = 8;
    const grad = gcCtx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, `rgba(${light},0.8)`);
    grad.addColorStop(0.7, `rgba(${base},0.4)`);
    grad.addColorStop(1, "transparent");
    gcCtx.fillStyle = grad;
    gcCtx.beginPath();
    gcCtx.arc(half, half, half, 0, Math.PI * 2);
    gcCtx.fill();

    const baseIntensity = 0.8;
    const baseFadeZone = 60;
    const scanTargetIntensity = 1.8;
    const scanTargetFadeZone = 35;
    const transSpeed = 0.05;

    const createParticle = (intensity) => {
      const lbx = w / 2;
      const lbWidth = scannerWidth;
      const iRatio = intensity / baseIntensity;
      const speedMul = 1 + (iRatio - 1) * 1.2;
      const sizeMul = 1 + (iRatio - 1) * 0.7;
      return {
        x: lbx + (Math.random() - 0.5) * lbWidth,
        y: Math.random() * h,
        vx: (Math.random() * 0.8 + 0.2) * speedMul,
        vy: (Math.random() * 0.3 - 0.15) * speedMul,
        radius: (Math.random() * 0.6 + 0.4) * sizeMul,
        alpha: Math.random() * 0.4 + 0.6,
        decay: Math.random() * 0.02 + 0.005,
        originalAlpha: 0,
        life: 1.0,
        time: 0,
        twinkleSpeed: (Math.random() * 0.06 + 0.02) * speedMul,
        twinkleAmount: Math.random() * 0.15 + 0.1,
      };
    };

    const particles = [];
    let count = 0;
    for (let i = 0; i < baseParticleMax; i++) {
      const p = createParticle(baseIntensity);
      p.originalAlpha = p.alpha;
      count++;
      particles[count] = p;
    }

    let currentIntensity = baseIntensity;
    let currentMaxParticles = baseParticleMax;
    let currentFadeZone = baseFadeZone;
    let currentGlowIntensity = 1;

    const drawLightBar = (fadeZone, scanning, glowInt) => {
      const lbx = w / 2;
      const lbWidth = scannerWidth;
      const vGrad = ctx.createLinearGradient(0, 0, 0, h);
      vGrad.addColorStop(0, "rgba(255,255,255,0)");
      vGrad.addColorStop(fadeZone / h, "rgba(255,255,255,1)");
      vGrad.addColorStop(1 - fadeZone / h, "rgba(255,255,255,1)");
      vGrad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.globalCompositeOperation = "lighter";

      const cg = ctx.createLinearGradient(
        lbx - lbWidth / 2,
        0,
        lbx + lbWidth / 2,
        0,
      );
      cg.addColorStop(0, "rgba(255,255,255,0)");
      cg.addColorStop(0.5, `rgba(255,255,255,${glowInt})`);
      cg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.roundRect(lbx - lbWidth / 2, 0, lbWidth, h, 15);
      ctx.fill();

      const g1 = ctx.createLinearGradient(
        lbx - lbWidth * 2,
        0,
        lbx + lbWidth * 2,
        0,
      );
      g1.addColorStop(0, `rgba(${base},0)`);
      g1.addColorStop(0.5, `rgba(${light},${0.8 * glowInt})`);
      g1.addColorStop(1, `rgba(${base},0)`);
      ctx.globalAlpha = scanning ? 1.0 : 0.8;
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.roundRect(lbx - lbWidth * 2, 0, lbWidth * 4, h, 25);
      ctx.fill();

      const g2 = ctx.createLinearGradient(
        lbx - lbWidth * 4,
        0,
        lbx + lbWidth * 4,
        0,
      );
      g2.addColorStop(0, `rgba(${base},0)`);
      g2.addColorStop(0.5, `rgba(${base},${0.4 * glowInt})`);
      g2.addColorStop(1, `rgba(${base},0)`);
      ctx.globalAlpha = scanning ? 0.8 : 0.6;
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.roundRect(lbx - lbWidth * 4, 0, lbWidth * 8, h, 35);
      ctx.fill();

      if (scanning) {
        const g3 = ctx.createLinearGradient(
          lbx - lbWidth * 8,
          0,
          lbx + lbWidth * 8,
          0,
        );
        g3.addColorStop(0, `rgba(${base},0)`);
        g3.addColorStop(0.5, `rgba(${base},0.2)`);
        g3.addColorStop(1, `rgba(${base},0)`);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = g3;
        ctx.beginPath();
        ctx.roundRect(lbx - lbWidth * 8, 0, lbWidth * 16, h, 45);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "destination-in";
      ctx.globalAlpha = 1;
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, w, h);
    };

    const scannerLoop = () => {
      s.scannerAnimId = requestAnimationFrame(scannerLoop);
      const scanning = s.scanningActive;
      const targetIntensity = scanning ? scanTargetIntensity : baseIntensity;
      const targetMax = scanning ? scanParticleMax : baseParticleMax;
      const targetFadeZone = scanning ? scanTargetFadeZone : baseFadeZone;
      const targetGlow = scanning ? 3.5 : 1;

      currentIntensity += (targetIntensity - currentIntensity) * transSpeed;
      currentMaxParticles += (targetMax - currentMaxParticles) * transSpeed;
      currentFadeZone += (targetFadeZone - currentFadeZone) * transSpeed;
      currentGlowIntensity += (targetGlow - currentGlowIntensity) * transSpeed;

      const maxP = Math.floor(currentMaxParticles);

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      drawLightBar(currentFadeZone, scanning, currentGlowIntensity);

      ctx.globalCompositeOperation = "lighter";
      for (let i = 1; i <= count; i++) {
        const p = particles[i];
        if (!p) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.time++;
        p.alpha =
          p.originalAlpha * p.life +
          Math.sin(p.time * p.twinkleSpeed) * p.twinkleAmount;
        p.life -= p.decay;

        if (p.x > w + 10 || p.life <= 0) {
          p.x = w / 2 + (Math.random() - 0.5) * scannerWidth;
          p.y = Math.random() * h;
          p.vx = Math.random() * 0.8 + 0.2;
          p.vy = Math.random() * 0.3 - 0.15;
          p.alpha = Math.random() * 0.4 + 0.6;
          p.originalAlpha = p.alpha;
          p.life = 1.0;
          p.time = 0;
        }

        if (p.life <= 0) continue;
        let fadeAlpha = 1;
        if (p.y < currentFadeZone) fadeAlpha = p.y / currentFadeZone;
        else if (p.y > h - currentFadeZone)
          fadeAlpha = (h - p.y) / currentFadeZone;
        fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));
        ctx.globalAlpha = p.alpha * fadeAlpha;
        ctx.drawImage(
          gcCanvas,
          p.x - p.radius,
          p.y - p.radius,
          p.radius * 2,
          p.radius * 2,
        );
      }

      const iRatio = currentIntensity / baseIntensity;
      const spawnChecks = [
        [0, currentIntensity],
        [1.1, (iRatio - 1.0) * 1.2],
        [1.3, (iRatio - 1.3) * 1.4],
        [1.5, (iRatio - 1.5) * 1.8],
        [2.0, (iRatio - 2.0) * 2.0],
      ];
      for (const [threshold, prob] of spawnChecks) {
        if (iRatio > threshold && Math.random() < prob && count < maxP) {
          const np = createParticle(currentIntensity);
          np.originalAlpha = np.alpha;
          count++;
          particles[count] = np;
        }
      }

      if (count > maxP + 200) {
        const excess = Math.min(15, count - maxP);
        for (let i = 0; i < excess; i++) delete particles[count - i];
        count -= excess;
      }
    };
    scannerLoop();

    const onResize = () => {
      w = window.innerWidth;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(s.scannerAnimId);
      window.removeEventListener("resize", onResize);
    };
  }, [scannerWidth, baseParticleMax, scanParticleMax, sr, sg, sb, lr, lg, lb]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap"
      />
      <style>{`
        @keyframes csScanFx { 0% { transform: translateX(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(100%); opacity: 0; } }
        @keyframes csNudge { 0%, 100% { transform: translateX(-6px); } 50% { transform: translateX(6px); } }
      `}</style>

      <div
        className={`relative h-[100dvh] w-full overflow-hidden font-[family-name:var(--font)] ${className}`}
        style={{
          backgroundColor,
          "--font": `"${fontFamily}", sans-serif`,
          "--mono": `"${monoFont}", monospace`,
          "--cw": `${cardWidth}px`,
          "--ch": `${cardHeight}px`,
          "--gap": `${cardGap}px`,
          "--scan-light": `${lr},${lg},${lb}`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas
            ref={particleCanvasRef}
            className="pointer-events-none absolute left-0 top-1/2 z-0 h-[250px] w-screen -translate-y-1/2"
          />
          <canvas
            ref={scannerCanvasRef}
            className="pointer-events-none absolute -left-[3px] top-1/2 z-[15] h-[300px] w-screen -translate-y-1/2"
          />

          <div
            ref={cardStreamRef}
            className="absolute flex h-[var(--ch)] w-screen items-center overflow-visible"
          >
            <div
              ref={cardLineRef}
              className="flex cursor-grab select-none items-center gap-[var(--gap)] whitespace-nowrap will-change-transform active:cursor-grabbing [&.cs-dragging]:cursor-grabbing"
            >
              {loop.map(({ card, key }) => (
                <div
                  key={key}
                  data-card
                  className="relative h-[var(--ch)] w-[var(--cw)] shrink-0"
                >
                  <div
                    data-normal
                    className="absolute left-0 top-0 z-[2] h-full w-full overflow-hidden rounded-[15px] shadow-[0_15px_40px_rgba(0,0,0,0.4)] [clip-path:inset(0_0_0_var(--cs-clip-right,0%))]"
                  >
                    <CardFace card={card} labels={cardLabels} />
                  </div>
                  <div
                    data-ascii
                    className="absolute left-0 top-0 z-[1] h-full w-full overflow-hidden rounded-[15px] [clip-path:inset(0_calc(100%_-_var(--cs-clip-left,0%))_0_0)]"
                  >
                    <div
                      data-ascii-content
                      className="absolute inset-0 m-0 overflow-hidden whitespace-pre p-0 text-left font-[family-name:var(--mono)] text-[11px] leading-[13px] text-[rgba(220,210,255,0.6)] [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,0.8)_30%,rgba(0,0,0,0.6)_50%,rgba(0,0,0,0.4)_80%,rgba(0,0,0,0.2)_100%)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[calc(50%_+_var(--ch)_/_2_+_56px)] z-20 flex -translate-x-1/2 items-center gap-3 text-sm font-medium text-white/60">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 animate-[csNudge_1.8s_ease-in-out_infinite] motion-reduce:animate-none"
            aria-hidden="true"
          >
            <path d="M18 8l4 4-4 4" />
            <path d="M6 8l-4 4 4 4" />
            <path d="M2 12h20" />
          </svg>
          {swipeLabel}
        </div>
      </div>
    </>
  );
}