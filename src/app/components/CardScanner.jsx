"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── CardScanner ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// cardCount           number    30         Number of cards in the stream
// cardWidth           number    400        Width of each card (px)
// cardHeight          number    250        Height of each card (px)
// cardGap             number    60         Gap between cards (px)
// initialVelocity     number    120        Starting scroll speed (px/s)
// friction            number    0.95       Drag deceleration factor
// minVelocity         number    30         Minimum scroll speed floor (px/s)
// scannerWidth        number    8          Width of the scanner beam (px)
// particleCount       number    400        Three.js background particles
// scanParticleMax     number    2500       Max particles when scanning active
// baseParticleMax     number    800        Max particles at idle
// cardImages          string[]  [...]      Array of card image URLs
// showControls        boolean   true       Show pause/reset/direction buttons
// showSpeedIndicator  boolean   true       Show speed readout
// showCredit          boolean   true       Show inspiration credit
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_CARD_IMAGES = [
  "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b55e654d1341fb06f8_4.1.png",
  "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5a080a31ee7154b19_1.png",
  "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5c1e4919fd69672b8_3.png",
  "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5f6a5e232e7beb4be_2.png",
  "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5bea2f1b07392d936_4.png",
];

function generateCode(width, height) {
  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[randInt(0, arr.length - 1)];

  const library = [
    "// compiled preview • scanner demo",
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

export default function CardScanner({
  cardCount = 30,
  cardWidth = 400,
  cardHeight = 250,
  cardGap = 60,
  initialVelocity = 120,
  friction = 0.95,
  minVelocity = 30,
  scannerWidth = 8,
  particleCount = 400,
  scanParticleMax = 2500,
  baseParticleMax = 800,
  cardImages = DEFAULT_CARD_IMAGES,
  showControls = true,
  showSpeedIndicator = true,
  showCredit = true,
}) {
  const containerRef = useRef(null);
  const cardStreamRef = useRef(null);
  const cardLineRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const scannerCanvasRef = useRef(null);
  const speedValueRef = useRef(null);
  const controlBtnRef = useRef(null);

  const stateRef = useRef({
    position: 0,
    velocity: initialVelocity,
    direction: -1,
    isAnimating: true,
    isDragging: false,
    lastTime: 0,
    lastMouseX: 0,
    mouseVelocity: 0,
    containerWidth: 0,
    cardLineWidth: 0,
    scanningActive: false,
    animFrameId: null,
    particleAnimId: null,
    scannerAnimId: null,
    threeScene: null,
    threeCamera: null,
    threeRenderer: null,
    threeParticles: null,
    threeVelocities: null,
    scannerParticles: [],
    scannerCount: 0,
    scannerIntensity: 0.8,
    scannerMaxParticles: baseParticleMax,
    scannerFadeZone: 60,
    scannerCurrentIntensity: 0.8,
    scannerCurrentMaxParticles: baseParticleMax,
    scannerCurrentFadeZone: 60,
    scannerCurrentGlowIntensity: 1,
    gradientCanvas: null,
  });

  const calculateCodeDimensions = useCallback((cw, ch) => {
    const fontSize = 11;
    const lineHeight = 13;
    const charWidth = 6;
    return {
      width: Math.floor(cw / charWidth),
      height: Math.floor(ch / lineHeight),
      fontSize,
      lineHeight,
    };
  }, []);

  const updateSpeedIndicator = useCallback((vel) => {
    if (speedValueRef.current) {
      speedValueRef.current.textContent = Math.round(vel);
    }
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
      const normalCard = wrapper.querySelector(".cs-card-normal");
      const asciiCard = wrapper.querySelector(".cs-card-ascii");
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
          fx.className = "cs-scan-effect";
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
    if (s.position < -s.cardLineWidth) s.position = s.containerWidth;
    else if (s.position > s.containerWidth) s.position = -s.cardLineWidth;
    if (cardLineRef.current) {
      cardLineRef.current.style.transform = `translateX(${s.position}px)`;
    }
    updateCardClipping();
  }, [updateCardClipping]);

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
      updateSpeedIndicator(s.velocity);
    }

    s.animFrameId = requestAnimationFrame(animate);
  }, [friction, minVelocity, updateCardPosition, updateSpeedIndicator]);

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
      if (cardLineRef.current) {
        cardLineRef.current.style.transform = `translateX(${s.position}px)`;
      }
      updateCardClipping();
    },
    [updateCardClipping],
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
    updateSpeedIndicator(s.velocity);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, [minVelocity, initialVelocity, updateSpeedIndicator]);

  const toggleAnimation = useCallback(() => {
    const s = stateRef.current;
    s.isAnimating = !s.isAnimating;
    if (controlBtnRef.current) {
      controlBtnRef.current.textContent = s.isAnimating ? "⏸ Pause" : "▶ Play";
    }
  }, []);

  const resetPosition = useCallback(() => {
    const s = stateRef.current;
    s.position = s.containerWidth;
    s.velocity = initialVelocity;
    s.direction = -1;
    s.isAnimating = true;
    s.isDragging = false;
    if (cardLineRef.current) {
      cardLineRef.current.style.transform = `translateX(${s.position}px)`;
      cardLineRef.current.classList.remove("cs-dragging");
    }
    updateSpeedIndicator(s.velocity);
    if (controlBtnRef.current) controlBtnRef.current.textContent = "⏸ Pause";
  }, [initialVelocity, updateSpeedIndicator]);

  const changeDirection = useCallback(() => {
    stateRef.current.direction *= -1;
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    const cardLine = cardLineRef.current;
    const stream = cardStreamRef.current;
    if (!cardLine || !stream) return;

    cardLine.innerHTML = "";
    s.containerWidth = stream.offsetWidth;
    s.cardLineWidth = (cardWidth + cardGap) * cardCount;
    s.position = s.containerWidth;

    for (let i = 0; i < cardCount; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "cs-card-wrapper";
      wrapper.style.cssText = `position:relative;width:${cardWidth}px;height:${cardHeight}px;flex-shrink:0;`;

      const normalCard = document.createElement("div");
      normalCard.className = "cs-card-normal";
      normalCard.style.cssText = `
        position:absolute;top:0;left:0;width:${cardWidth}px;height:${cardHeight}px;
        border-radius:15px;overflow:hidden;z-index:2;
        clip-path:inset(0 0 0 var(--cs-clip-right,0%));
        box-shadow:0 15px 40px rgba(0,0,0,0.4);
      `;

      const img = document.createElement("img");
      img.src = cardImages[i % cardImages.length];
      img.alt = "Card";
      img.style.cssText = `width:100%;height:100%;object-fit:cover;border-radius:15px;filter:brightness(1.1) contrast(1.1);`;
      img.onerror = () => {
        const c = document.createElement("canvas");
        c.width = cardWidth;
        c.height = cardHeight;
        const ctx = c.getContext("2d");
        const g = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        g.addColorStop(0, "#667eea");
        g.addColorStop(1, "#764ba2");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cardWidth, cardHeight);
        img.src = c.toDataURL();
      };
      normalCard.appendChild(img);

      const asciiCard = document.createElement("div");
      asciiCard.className = "cs-card-ascii";
      asciiCard.style.cssText = `
        position:absolute;top:0;left:0;width:${cardWidth}px;height:${cardHeight}px;
        border-radius:15px;overflow:hidden;z-index:1;
        clip-path:inset(0 calc(100% - var(--cs-clip-left,0%)) 0 0);
      `;

      const asciiContent = document.createElement("div");
      asciiContent.className = "cs-ascii-content";
      const dims = calculateCodeDimensions(cardWidth, cardHeight);
      asciiContent.style.cssText = `
        position:absolute;top:0;left:0;width:100%;height:100%;
        color:rgba(220,210,255,0.6);
        font-family:'Courier New',monospace;
        font-size:${dims.fontSize}px;line-height:${dims.lineHeight}px;
        overflow:hidden;white-space:pre;margin:0;padding:0;text-align:left;
        box-sizing:border-box;
        -webkit-mask-image:linear-gradient(to right,rgba(0,0,0,1) 0%,rgba(0,0,0,0.8) 30%,rgba(0,0,0,0.6) 50%,rgba(0,0,0,0.4) 80%,rgba(0,0,0,0.2) 100%);
        mask-image:linear-gradient(to right,rgba(0,0,0,1) 0%,rgba(0,0,0,0.8) 30%,rgba(0,0,0,0.6) 50%,rgba(0,0,0,0.4) 80%,rgba(0,0,0,0.2) 100%);
      `;
      asciiContent.textContent = generateCode(dims.width, dims.height);
      asciiCard.appendChild(asciiContent);

      wrapper.appendChild(normalCard);
      wrapper.appendChild(asciiCard);
      cardLine.appendChild(wrapper);
    }

    s.lastTime = performance.now();
    s.animFrameId = requestAnimationFrame(animate);

    const asciiInterval = setInterval(() => {
      document.querySelectorAll(".cs-ascii-content").forEach((el) => {
        if (Math.random() < 0.15) {
          const dims = calculateCodeDimensions(cardWidth, cardHeight);
          el.textContent = generateCode(dims.width, dims.height);
        }
      });
    }, 200);

    const clipLoop = () => {
      updateCardClipping();
      s.clipLoopId = requestAnimationFrame(clipLoop);
    };
    clipLoop();

    const onMouseDown = (e) => startDrag(e.clientX);
    const onMouseMove = (e) => onDrag(e.clientX);
    const onMouseUp = () => endDrag();
    const onTouchStart = (e) => {
      e.preventDefault();
      startDrag(e.touches[0].clientX);
    };
    const onTouchMove = (e) => {
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
    const onResize = () => {
      s.containerWidth = stream.offsetWidth;
    };

    cardLine.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    cardLine.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    cardLine.addEventListener("wheel", onWheel, { passive: false });
    cardLine.addEventListener("selectstart", onSelectStart);
    cardLine.addEventListener("dragstart", onDragStart);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(s.animFrameId);
      cancelAnimationFrame(s.clipLoopId);
      clearInterval(asciiInterval);
      cardLine.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      cardLine.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      cardLine.removeEventListener("wheel", onWheel);
      cardLine.removeEventListener("selectstart", onSelectStart);
      cardLine.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("resize", onResize);
    };
  }, [
    cardCount,
    cardWidth,
    cardHeight,
    cardGap,
    cardImages,
    animate,
    startDrag,
    onDrag,
    endDrag,
    updateCardPosition,
    updateCardClipping,
    calculateCodeDimensions,
  ]);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas || typeof window === "undefined") return;
    if (!window.THREE) return;

    const THREE = window.THREE;
    const s = stateRef.current;

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

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { pointTexture: { value: texture }, size: { value: 15.0 } },
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
    s.threeScene = scene;
    s.threeCamera = camera;
    s.threeRenderer = renderer;
    s.threeParticles = particles;
    s.threeVelocities = velocities;

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

    return () => {
      cancelAnimationFrame(s.particleAnimId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [particleCount]);

  useEffect(() => {
    const canvas = scannerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    let w = window.innerWidth;
    let h = 300;
    canvas.width = w;
    canvas.height = h;

    const gcCanvas = document.createElement("canvas");
    gcCanvas.width = 16;
    gcCanvas.height = 16;
    const gcCtx = gcCanvas.getContext("2d");
    const half = 8;
    const grad = gcCtx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(196,181,253,0.8)");
    grad.addColorStop(0.7, "rgba(139,92,246,0.4)");
    grad.addColorStop(1, "transparent");
    gcCtx.fillStyle = grad;
    gcCtx.beginPath();
    gcCtx.arc(half, half, half, 0, Math.PI * 2);
    gcCtx.fill();
    s.gradientCanvas = gcCanvas;

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

    let particles = [];
    let count = 0;
    for (let i = 0; i < baseParticleMax; i++) {
      const p = createParticle(baseIntensity);
      p.originalAlpha = p.alpha;
      count++;
      particles[count] = p;
    }
    s.scannerParticles = particles;
    s.scannerCount = count;

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
      g1.addColorStop(0, "rgba(139,92,246,0)");
      g1.addColorStop(0.5, `rgba(196,181,253,${0.8 * glowInt})`);
      g1.addColorStop(1, "rgba(139,92,246,0)");
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
      g2.addColorStop(0, "rgba(139,92,246,0)");
      g2.addColorStop(0.5, `rgba(139,92,246,${0.4 * glowInt})`);
      g2.addColorStop(1, "rgba(139,92,246,0)");
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
        g3.addColorStop(0, "rgba(139,92,246,0)");
        g3.addColorStop(0.5, "rgba(139,92,246,0.2)");
        g3.addColorStop(1, "rgba(139,92,246,0)");
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
  }, [scannerWidth, baseParticleMax, scanParticleMax]);

  return (
    <>
      <style>{`
        .cs-card-line { display:flex;align-items:center;gap:${cardGap}px;white-space:nowrap;cursor:grab;user-select:none;will-change:transform; }
        .cs-card-line:active,.cs-card-line.cs-dragging { cursor:grabbing; }
        @keyframes cs-scan-fx { 0%{transform:translateX(-100%);opacity:0} 50%{opacity:1} 100%{transform:translateX(100%);opacity:0} }
        .cs-scan-effect { position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(0,255,255,0.4),transparent);animation:cs-scan-fx 0.6s ease-out;pointer-events:none;z-index:5; }
      `}</style>

      <div className="relative w-screen h-screen overflow-hidden bg-black">
        {showControls && (
          <div className="absolute top-5 left-5 flex gap-2.5 z-[100]">
            <button
              ref={controlBtnRef}
              onClick={toggleAnimation}
              className="px-5 py-2.5 bg-white/20 border-none rounded-full text-white font-bold cursor-pointer backdrop-blur-sm transition-all text-sm hover:bg-white/30 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              ⏸ Pause
            </button>
            <button
              onClick={resetPosition}
              className="px-5 py-2.5 bg-white/20 border-none rounded-full text-white font-bold cursor-pointer backdrop-blur-sm transition-all text-sm hover:bg-white/30 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              🔄 Reset
            </button>
            <button
              onClick={changeDirection}
              className="px-5 py-2.5 bg-white/20 border-none rounded-full text-white font-bold cursor-pointer backdrop-blur-sm transition-all text-sm hover:bg-white/30 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              ↔ Direction
            </button>
          </div>
        )}

        {showSpeedIndicator && (
          <div className="absolute top-5 right-5 text-white text-base bg-black/30 px-4 py-2 rounded-2xl backdrop-blur-sm z-[100]">
            Speed:{" "}
            <span ref={speedValueRef} className="font-bold">
              {initialVelocity}
            </span>{" "}
            px/s
          </div>
        )}

        <div
          className="absolute inset-0 flex items-center justify-center"
          ref={containerRef}
        >
          <canvas
            ref={particleCanvasRef}
            className="absolute top-1/2 left-0 -translate-y-1/2 w-screen pointer-events-none z-0"
            style={{ height: "250px" }}
          />
          <canvas
            ref={scannerCanvasRef}
            className="absolute top-1/2 left-0 -translate-y-1/2 w-screen pointer-events-none z-[15]"
            style={{ height: "300px", left: "-3px" }}
          />

          <div
            ref={cardStreamRef}
            id="cardStream"
            className="absolute w-screen flex items-center overflow-visible"
            style={{ height: `${cardHeight}px` }}
          >
            <div ref={cardLineRef} className="cs-card-line" />
          </div>
        </div>

        {showCredit && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs font-black text-[#ff9a9c] z-[1000] text-center">
            Inspired by{" "}
            <a
              href="https://evervault.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff9a9c] no-underline hover:text-[#ff7a7c] transition-colors"
            >
              @evervault.com
            </a>
          </div>
        )}
      </div>
    </>
  );
}
