"use client";

import { useEffect, useRef } from "react";

// ─── CursorTrailHero ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// navItems           array    [6 default effects]     Nav links, each: { label, effect, active }
// logoColor          string   #ffffff                  Logo circle fill color
// bgGradient         string   linear-gradient(135deg,  Hero section background gradient
//                             #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)
// letterColor        string   #ffffff                   Fill color of the "FLAME" letter SVGs
// touchInstructionText string "Swipe your finger to see the magic unfold"  Mobile-only instruction text
// images             array    [14 default image URLs]  Pool of images used for the trail effect
// imageLifespan      number   600                       How long (ms) each trail image stays before removal
// removalDelay       number   16                        Min ms between trail-image cleanup passes
// mouseThresholdDesktop number 40                        Min mouse movement (px) to trigger a new image (desktop)
// mouseThresholdMobile  number 20                        Min movement (px) to trigger a new image (mobile)
// scrollThreshold    number   50                        Min ms between scroll-triggered images
// inDuration         number   600                       Reveal animation duration (ms)
// outDuration        number   800                       Collapse animation duration (ms)
// touchImageInterval number   40                        Min ms between images while touch-dragging
// minMovementForImage number  5                         Min movement (px, desktop) needed to spawn an image at all
// minImageSizeDesktop number  160                       Smallest trail image size (px, desktop)
// maxImageSizeDesktop number  340                       Largest trail image size (px, desktop)
// minImageSizeMobile  number  120                       Smallest trail image size (px, mobile)
// maxImageSizeMobile  number  260                       Largest trail image size (px, mobile)
// baseRotation       number   30                        Base random rotation range (deg) for flame effect
// maxRotationFactor  number   3                         Rotation multiplier scaling with cursor speed
// speedSmoothingFactor number 0.25                      Smoothing factor (0-1) applied to speed calculation
// showSpeedIndicator bool     true                      Show the "<Effect> Intensity: N%" label while moving
// staggerRange       number   50                        Max stagger delay (ms) spread across fragment reveals
// fontSansUrl        string   GT Standard woff2 URL      @font-face src for the heading/body font
// fontMonoUrl        string   PPSupplyMono ttf URL        @font-face src for the nav/mono font
// noiseOverlayUrl    string   noise-002.png URL           Full-screen noise texture overlay image
// noiseOpacity       number   0.05                        Opacity of the noise overlay
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_NAV_ITEMS = [
  { label: "Flame", effect: "flame", active: true },
  { label: "Venetian", effect: "venetian", active: false },
  { label: "Curtain", effect: "curtain", active: false },
  { label: "Hexagon", effect: "hexagon", active: false },
  { label: "Liquid", effect: "liquid", active: false },
  { label: "Zoom Split", effect: "zoomsplit", active: false },
];

const DEFAULT_IMAGES = [
  "https://assets.codepen.io/7558/cr-blurry-orange-small-001.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-002.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-003.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-004.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-005.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-006.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-007.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-008.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-009.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-010.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-011.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-012.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-013.jpg",
  "https://assets.codepen.io/7558/cr-blurry-orange-small-014.jpg",
];

export default function CursorTrailHero({
  navItems = DEFAULT_NAV_ITEMS,
  logoColor = "#ffffff",
  bgGradient = "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
  letterColor = "#ffffff",
  touchInstructionText = "Swipe your finger to see the magic unfold",
  images = DEFAULT_IMAGES,
  imageLifespan = 600,
  removalDelay = 16,
  mouseThresholdDesktop = 40,
  mouseThresholdMobile = 20,
  scrollThreshold = 50,
  inDuration = 600,
  outDuration = 800,
  touchImageInterval = 40,
  minMovementForImage = 5,
  minImageSizeDesktop = 160,
  maxImageSizeDesktop = 340,
  minImageSizeMobile = 120,
  maxImageSizeMobile = 260,
  baseRotation = 30,
  maxRotationFactor = 3,
  speedSmoothingFactor = 0.25,
  showSpeedIndicator = true,
  staggerRange = 50,
  fontSansUrl = "https://assets.codepen.io/7558/GT-Standard-VF-Trial.woff2",
  fontMonoUrl = "https://assets.codepen.io/7558/PPSupplyMono-Regular.ttf",
  noiseOverlayUrl = "https://assets.codepen.io/7558/noise-002.png",
  noiseOpacity = 0.05,
}) {
  const containerRef = useRef(null);
  const speedIndicatorRef = useRef(null);
  const navRefs = useRef([]);
  const activeEffectRef = useRef(
    navItems.find((n) => n.active)?.effect || navItems[0]?.effect || "flame",
  );

  useEffect(() => {
    const container = containerRef.current;
    const speedIndicator = speedIndicatorRef.current;
    if (!container) return;

    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;

    const config = {
      imageLifespan,
      removalDelay,
      mouseThreshold: isMobile ? mouseThresholdMobile : mouseThresholdDesktop,
      scrollThreshold,
      inDuration,
      outDuration,
      inEasing: "cubic-bezier(.07,.5,.5,1)",
      outEasing: "cubic-bezier(.87, 0, .13, 1)",
      touchImageInterval,
      minMovementForImage: isMobile ? 3 : minMovementForImage,
      minImageSize: isMobile ? minImageSizeMobile : minImageSizeDesktop,
      maxImageSize: isMobile ? maxImageSizeMobile : maxImageSizeDesktop,
      baseRotation,
      maxRotationFactor,
      speedSmoothingFactor,
      showSpeedIndicator,
      staggerRange,
      easing: {
        scale: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        reveal: "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    };

    const PATTERNS = {
      flame: {
        name: "Flame Trail",
        create: (c, imageSrc, size) => {
          const img = document.createElement("img");
          img.className = "trail-img";
          img.src = imageSrc;
          img.width = img.height = size;
          return [
            { element: img, index: 0, reveal: () => {}, collapse: () => {} },
          ];
        },
        revealTiming: () => 0,
        collapseTiming: () => 0,
      },
      venetian: {
        name: "Venetian Blinds",
        create: (c, imageSrc) => {
          const fragments = [];
          const stripCount = 12;
          const stripHeight = 100 / stripCount;
          for (let i = 0; i < stripCount; i++) {
            const fragment = document.createElement("div");
            fragment.className = "image-fragment";
            const bg = document.createElement("div");
            bg.className = "fragment-bg";
            bg.style.backgroundImage = `url(${imageSrc})`;
            const y = i * stripHeight;
            fragment.style.cssText = `
              top: 0; left: 0; width: 100%; height: 100%;
              transform: translate3d(0, 0, 0) rotateX(90deg);
              transform-origin: 50% ${y + stripHeight / 2}%;
              clip-path: polygon(0% ${y}%, 100% ${y}%, 100% ${y + stripHeight}%, 0% ${y + stripHeight}%);
              transition: transform ${config.inDuration}ms ${config.easing.reveal};
            `;
            fragment.appendChild(bg);
            fragments.push({
              element: fragment,
              index: i,
              reveal: () => {
                fragment.style.transform = `translate3d(0, 0, 0) rotateX(0deg)`;
              },
              collapse: () => {
                fragment.style.transform = `translate3d(0, 0, 0) rotateX(-90deg)`;
              },
            });
          }
          return fragments;
        },
        revealTiming: (i, total) => Math.abs(i - total / 2) * 0.08,
        collapseTiming: (i) => i * 0.04,
      },
      liquid: {
        name: "Liquid Drops",
        create: (c, imageSrc) => {
          const fragments = [];
          const positions = [
            { x: 25, y: 20, r: 16 },
            { x: 70, y: 15, r: 12 },
            { x: 45, y: 35, r: 18 },
            { x: 15, y: 55, r: 14 },
            { x: 80, y: 45, r: 15 },
            { x: 55, y: 70, r: 20 },
            { x: 30, y: 80, r: 13 },
            { x: 75, y: 75, r: 17 },
          ];
          positions.forEach((pos, i) => {
            const fragment = document.createElement("div");
            fragment.className = "image-fragment";
            const bg = document.createElement("div");
            bg.className = "fragment-bg";
            bg.style.backgroundImage = `url(${imageSrc})`;
            fragment.style.cssText = `
              top: 0; left: 0; width: 100%; height: 100%;
              clip-path: circle(0% at ${pos.x}% ${pos.y}%);
              transition: clip-path ${config.inDuration}ms ${config.easing.reveal};
            `;
            fragment.appendChild(bg);
            fragments.push({
              element: fragment,
              index: i,
              reveal: () => {
                fragment.style.clipPath = `circle(${pos.r}% at ${pos.x}% ${pos.y}%)`;
              },
              collapse: () => {
                fragment.style.clipPath = `circle(0% at ${pos.x}% ${pos.y}%)`;
              },
            });
          });
          return fragments;
        },
        revealTiming: (i, total) => (i / total) * 0.4,
        collapseTiming: (i, total) => ((total - 1 - i) / total) * 0.25,
      },
      curtain: {
        name: "Curtain Sweep",
        create: (c, imageSrc) => {
          const fragments = [];
          const stripCount = 10;
          for (let i = 0; i < stripCount; i++) {
            const fragment = document.createElement("div");
            fragment.className = "image-fragment";
            const bg = document.createElement("div");
            bg.className = "fragment-bg";
            bg.style.backgroundImage = `url(${imageSrc})`;
            const x = (i / stripCount) * 100;
            const w = 100 / stripCount;
            fragment.style.cssText = `
              top: 0; left: 0; width: 100%; height: 100%;
              clip-path: polygon(${x + w / 2}% 0%, ${x + w / 2}% 0%, ${x + w / 2}% 100%, ${x + w / 2}% 100%);
              transition: clip-path ${config.inDuration}ms ${config.easing.reveal};
            `;
            fragment.appendChild(bg);
            fragments.push({
              element: fragment,
              index: i,
              reveal: () => {
                fragment.style.clipPath = `polygon(${x}% 0%, ${x + w}% 0%, ${x + w}% 100%, ${x}% 100%)`;
              },
              collapse: () => {
                fragment.style.clipPath = `polygon(${x + w / 2}% 0%, ${x + w / 2}% 0%, ${x + w / 2}% 100%, ${x + w / 2}% 100%)`;
              },
            });
          }
          return fragments;
        },
        revealTiming: (i, total) => (i / total) * 0.6,
        collapseTiming: (i, total) => ((total - 1 - i) / total) * 0.3,
      },
      hexagon: {
        name: "Hexagon Bloom",
        create: (c, imageSrc) => {
          const fragments = [];
          const hexagons = [
            { x: 50, y: 50, size: 20 },
            { x: 25, y: 25, size: 15 },
            { x: 75, y: 25, size: 15 },
            { x: 85, y: 50, size: 15 },
            { x: 75, y: 75, size: 15 },
            { x: 25, y: 75, size: 15 },
            { x: 15, y: 50, size: 15 },
          ];
          hexagons.forEach((hex, i) => {
            const fragment = document.createElement("div");
            fragment.className = "image-fragment";
            const bg = document.createElement("div");
            bg.className = "fragment-bg";
            bg.style.backgroundImage = `url(${imageSrc})`;
            const s = hex.size;
            const x = hex.x;
            const y = hex.y;
            const hexShape = `polygon(${x - s * 0.5}% ${y - s * 0.87}%, ${x + s * 0.5}% ${y - s * 0.87}%, ${x + s}% ${y}%, ${x + s * 0.5}% ${y + s * 0.87}%, ${x - s * 0.5}% ${y + s * 0.87}%, ${x - s}% ${y}%)`;
            fragment.style.cssText = `
              top: 0; left: 0; width: 100%; height: 100%;
              clip-path: polygon(${x}% ${y}%, ${x}% ${y}%, ${x}% ${y}%);
              transition: clip-path ${config.inDuration}ms ${config.easing.reveal};
            `;
            fragment.appendChild(bg);
            fragments.push({
              element: fragment,
              index: i,
              reveal: () => {
                fragment.style.clipPath = hexShape;
              },
              collapse: () => {
                fragment.style.clipPath = `polygon(${x}% ${y}%, ${x}% ${y}%, ${x}% ${y}%)`;
              },
            });
          });
          return fragments;
        },
        revealTiming: (i) => (i === 0 ? 0 : 0.2 + (i - 1) * 0.06),
        collapseTiming: (i) => (i === 0 ? 0.3 : (i - 1) * 0.04),
      },
      zoomsplit: {
        name: "Zoom Split",
        create: (c, imageSrc) => {
          const fragments = [];
          const gridSize = 3;
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const fragment = document.createElement("div");
              fragment.className = "image-fragment";
              const bg = document.createElement("div");
              bg.className = "fragment-bg";
              bg.style.backgroundImage = `url(${imageSrc})`;
              const x = (col / gridSize) * 100;
              const y = (row / gridSize) * 100;
              const w = 100 / gridSize;
              const h = 100 / gridSize;
              fragment.style.cssText = `
                top: 0; left: 0; width: 100%; height: 100%;
                clip-path: polygon(${x + w / 2}% ${y + h / 2}%, ${x + w / 2}% ${y + h / 2}%, ${x + w / 2}% ${y + h / 2}%, ${x + w / 2}% ${y + h / 2}%);
                transition: clip-path ${config.inDuration}ms ${config.easing.scale};
              `;
              fragment.appendChild(bg);
              fragments.push({
                element: fragment,
                index: row * gridSize + col,
                reveal: () => {
                  fragment.style.clipPath = `polygon(${x}% ${y}%, ${x + w}% ${y}%, ${x + w}% ${y + h}%, ${x}% ${y + h}%)`;
                },
                collapse: () => {
                  fragment.style.clipPath = `polygon(${x + w / 2}% ${y + h / 2}%, ${x + w / 2}% ${y + h / 2}%, ${x + w / 2}% ${y + h / 2}%, ${x + w / 2}% ${y + h / 2}%)`;
                },
              });
            }
          }
          return fragments;
        },
        revealTiming: (i, total) => {
          const gridSize = Math.sqrt(total);
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          const centerX = (gridSize - 1) / 2;
          const centerY = (gridSize - 1) / 2;
          return Math.hypot(col - centerX, row - centerY) * 0.15;
        },
        collapseTiming: (i, total) => {
          const gridSize = Math.sqrt(total);
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          const centerX = (gridSize - 1) / 2;
          const centerY = (gridSize - 1) / 2;
          return Math.hypot(col - centerX, row - centerY) * 0.08;
        },
      },
    };

    const trail = [];
    let mouseX = 0,
      mouseY = 0,
      lastMouseX = 0,
      lastMouseY = 0,
      prevMouseX = 0,
      prevMouseY = 0;
    let isMoving = false,
      isCursorInContainer = false,
      isTouching = false;
    let lastRemovalTime = 0,
      lastTouchImageTime = 0,
      lastScrollTime = 0,
      lastMoveTime = Date.now();
    let isScrolling = false,
      scrollTicking = false;
    let smoothedSpeed = 0,
      maxSpeed = 0;
    let imageIndex = 0;
    const imagePool = [];
    let moveTimeout, scrollTimeout, speedTimeout;

    const isInContainer = (x, y) => {
      const rect = container.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    };

    const setInitialMousePos = (e) => {
      mouseX = lastMouseX = prevMouseX = e.clientX;
      mouseY = lastMouseY = prevMouseY = e.clientY;
      isCursorInContainer = isInContainer(mouseX, mouseY);
      document.removeEventListener("mouseover", setInitialMousePos);
    };
    document.addEventListener("mouseover", setInitialMousePos);

    const hasMovedEnough = () =>
      Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY) >
      config.mouseThreshold;

    const hasMovedAtAll = () =>
      Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY) >
      config.minMovementForImage;

    const calculateSpeed = () => {
      const now = Date.now();
      const dt = now - lastMoveTime;
      if (dt <= 0) return 0;
      const dist = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
      const raw = dist / dt;
      if (raw > maxSpeed) maxSpeed = raw;
      const norm = Math.min(raw / (maxSpeed || 0.5), 1);
      smoothedSpeed =
        smoothedSpeed * (1 - config.speedSmoothingFactor) +
        norm * config.speedSmoothingFactor;
      lastMoveTime = now;

      if (config.showSpeedIndicator && speedIndicator) {
        const effectName = PATTERNS[activeEffectRef.current].name;
        speedIndicator.textContent = `${effectName} Intensity: ${(smoothedSpeed * 100).toFixed(0)}%`;
        speedIndicator.style.opacity = "1";
        clearTimeout(speedTimeout);
        speedTimeout = setTimeout(() => {
          speedIndicator.style.opacity = "0";
        }, 1500);
      }
      return smoothedSpeed;
    };

    const createImageElement = () => {
      if (imagePool.length > 0) return imagePool.pop();
      const element = document.createElement("div");
      element.className = "trail-image";
      return element;
    };

    const returnToPool = (element) => {
      if (element.parentNode) element.parentNode.removeChild(element);
      element.innerHTML = "";
      element.style.cssText = "";
      element.className = "trail-image";
      if (imagePool.length < 20) imagePool.push(element);
    };

    const createImage = (speed = 0.5) => {
      const imageSrc = images[imageIndex];
      imageIndex = (imageIndex + 1) % images.length;
      const size =
        config.minImageSize +
        (config.maxImageSize - config.minImageSize) * speed;
      const currentEffect = activeEffectRef.current;
      const pattern = PATTERNS[currentEffect];

      if (currentEffect === "flame") {
        const img = document.createElement("img");
        img.className = "trail-img";
        const rotFactor = 1 + speed * (config.maxRotationFactor - 1);
        const rot = (Math.random() - 0.5) * config.baseRotation * rotFactor;
        img.src = imageSrc;
        img.width = img.height = size;
        const rect = container.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0)`;
        img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;
        container.appendChild(img);
        setTimeout(() => {
          img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
        }, 10);
        trail.push({
          element: img,
          rotation: rot,
          removeTime: Date.now() + config.imageLifespan,
          isFlame: true,
        });
      } else {
        const imageContainer = createImageElement();
        const rect = container.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;
        imageContainer.style.cssText = `
          left: ${x}px; top: ${y}px; width: ${size}px; height: ${size}px;
          transform: translate3d(-50%, -50%, 0) scale(0);
          transition: transform ${config.inDuration}ms ${config.easing.scale};
        `;
        const fragments = pattern.create(imageContainer, imageSrc, size);
        fragments.forEach((fragment) =>
          imageContainer.appendChild(fragment.element),
        );
        container.appendChild(imageContainer);

        requestAnimationFrame(() => {
          imageContainer.style.transform =
            "translate3d(-50%, -50%, 0) scale(1)";
          fragments.forEach((fragment) => {
            const revealTime = pattern.revealTiming(
              fragment.index,
              fragments.length,
              fragment,
            );
            const delay = revealTime * config.staggerRange;
            setTimeout(() => fragment.reveal(), delay);
          });
        });

        trail.push({
          element: imageContainer,
          fragments,
          pattern: currentEffect,
          removeTime: Date.now() + config.imageLifespan,
        });
      }
    };

    const createTrailImage = () => {
      if (!isCursorInContainer) return;
      if ((isMoving || isTouching) && hasMovedEnough() && hasMovedAtAll()) {
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        const speed = calculateSpeed();
        createImage(speed);
        prevMouseX = mouseX;
        prevMouseY = mouseY;
      }
    };

    const createTouchTrailImage = () => {
      if (!isCursorInContainer || !isTouching || !hasMovedAtAll()) return;
      const now = Date.now();
      if (now - lastTouchImageTime < config.touchImageInterval) return;
      lastTouchImageTime = now;
      const speed = calculateSpeed();
      createImage(speed);
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    };

    const createScrollTrailImage = () => {
      if (!isCursorInContainer || !isScrolling) return;
      lastMouseX +=
        (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
      lastMouseY +=
        (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
      createImage(0.5);
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    };

    const removeOldImages = () => {
      const now = Date.now();
      if (now - lastRemovalTime < config.removalDelay || !trail.length) return;
      if (now >= trail[0].removeTime) {
        const imgObj = trail.shift();
        if (imgObj.isFlame) {
          imgObj.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
          imgObj.element.style.transform = `translate(-50%, -50%) rotate(${imgObj.rotation + 360}deg) scale(0)`;
          setTimeout(() => imgObj.element.remove(), config.outDuration);
        } else {
          const { element, fragments, pattern: imagePattern } = imgObj;
          const pattern = PATTERNS[imagePattern];
          if (fragments) {
            fragments.forEach((fragment) => {
              const collapseTime = pattern.collapseTiming(
                fragment.index,
                fragments.length,
                fragment,
              );
              const delay = collapseTime * config.staggerRange;
              setTimeout(() => fragment.collapse(), delay);
            });
          }
          element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
          element.style.transform = "translate3d(-50%, -50%, 0) scale(0)";
          setTimeout(() => returnToPool(element), config.outDuration);
        }
        lastRemovalTime = now;
      }
    };

    const handleNavClick = (e, effect) => {
      e.preventDefault();
      navRefs.current.forEach((l) => l && l.classList.remove("active"));
      e.currentTarget.classList.add("active");
      activeEffectRef.current = effect;
    };

    navRefs.current.forEach((link, i) => {
      if (!link) return;
      const effect = navItems[i].effect;
      link.addEventListener("click", (e) => handleNavClick(e, effect));
    });

    const onMouseMove = (e) => {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      isCursorInContainer = isInContainer(mouseX, mouseY);
      if (isCursorInContainer && hasMovedAtAll()) {
        isMoving = true;
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => (isMoving = false), 100);
      }
    };
    document.addEventListener("mousemove", onMouseMove);

    const onTouchStart = (e) => {
      const touch = e.touches[0];
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = touch.clientX;
      mouseY = touch.clientY;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      isCursorInContainer = true;
      isTouching = true;
      lastMoveTime = Date.now();
    };
    container.addEventListener("touchstart", onTouchStart);

    const onTouchMove = (e) => {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - prevMouseX);
      const dy = Math.abs(touch.clientY - prevMouseY);
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = touch.clientX;
      mouseY = touch.clientY;
      isCursorInContainer = true;
      if (dy > dx) return;
      createTouchTrailImage();
    };
    container.addEventListener("touchmove", onTouchMove);

    const onTouchEnd = () => {
      isTouching = false;
    };
    container.addEventListener("touchend", onTouchEnd);

    const onDocTouchStart = (e) => {
      const t = e.touches[0];
      if (!isInContainer(t.clientX, t.clientY)) {
        isCursorInContainer = false;
        isTouching = false;
      }
    };
    document.addEventListener("touchstart", onDocTouchStart);

    const onScrollTrack = () => {
      isCursorInContainer = isInContainer(mouseX, mouseY);
      if (isCursorInContainer) {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => (isScrolling = false), 100);
      }
    };
    window.addEventListener("scroll", onScrollTrack, { passive: true });

    const onScrollTrigger = () => {
      const now = Date.now();
      if (now - lastScrollTime < config.scrollThreshold) return;
      lastScrollTime = now;
      if (!scrollTicking && isCursorInContainer) {
        requestAnimationFrame(() => {
          if (isScrolling) createScrollTrailImage();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };
    window.addEventListener("scroll", onScrollTrigger, { passive: true });

    let rafId;
    (function animate() {
      if (isMoving || isTouching || isScrolling) createTrailImage();
      removeOldImages();
      rafId = requestAnimationFrame(animate);
    })();

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(moveTimeout);
      clearTimeout(scrollTimeout);
      clearTimeout(speedTimeout);
      document.removeEventListener("mouseover", setInitialMousePos);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchstart", onDocTouchStart);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", onScrollTrack);
      window.removeEventListener("scroll", onScrollTrigger);
    };
  }, [
    images,
    imageLifespan,
    removalDelay,
    mouseThresholdDesktop,
    mouseThresholdMobile,
    scrollThreshold,
    inDuration,
    outDuration,
    touchImageInterval,
    minMovementForImage,
    minImageSizeDesktop,
    maxImageSizeDesktop,
    minImageSizeMobile,
    maxImageSizeMobile,
    baseRotation,
    maxRotationFactor,
    speedSmoothingFactor,
    showSpeedIndicator,
    staggerRange,
    navItems,
  ]);

  return (
    <>
      <header className="fixed left-0 top-0 z-[100] w-full bg-transparent p-8 max-[768px]:p-4">
        <div className="flex w-full items-start justify-between max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-5">
          <div className="group relative block h-6 w-12">
            <div className="relative h-full w-full">
              <div
                className="absolute top-1/2 left-0 h-[1.4rem] w-[1.4rem] -translate-y-1/2 rounded-full transition-transform duration-300 group-hover:-translate-x-2"
                style={{ backgroundColor: logoColor }}
              />
              <div
                className="absolute top-1/2 left-[0.8rem] h-[1.4rem] w-[1.4rem] -translate-y-1/2 rounded-full transition-transform duration-300 mix-blend-exclusion group-hover:translate-x-2"
                style={{ backgroundColor: logoColor }}
              />
            </div>
          </div>

          <div className="text-left">
            <ul className="list-none">
              {navItems.map((item, i) => (
                <li key={item.effect}>
                  <a
                    ref={(el) => (navRefs.current[i] = el)}
                    href="#"
                    data-effect={item.effect}
                    className={`nav-link relative z-[1] inline-block cursor-pointer font-[var(--trail-font-mono)] text-[10px] uppercase tracking-normal text-white no-underline opacity-70 transition-colors duration-300 hover:opacity-100 ${item.active ? "active opacity-100" : ""}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <section
        ref={containerRef}
        className="relative m-0 flex h-screen w-screen items-center justify-center overflow-hidden p-0"
        style={{ background: bgGradient }}
      >
        <svg
          fill="none"
          height="9"
          viewBox="0 0 34 9"
          width="34"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute z-[13] h-auto w-screen select-none"
        >
          <g fill={letterColor}>
            <path d="m.585938.410156h5.595702v1.341794h-3.41016c-.18359 0-.33007.04688-.43945.14063-.10547.08984-.1582.21484-.1582.375 0 .16797.05273.30078.1582.39844.10938.09375.25586.14062.43945.14062h3.41016v1.34766h-3.35156c-.20313 0-.36328.05859-.48047.17578s-.17578.27734-.17578.48047v4.18945h-1.587892z" />
          </g>
        </svg>

        <svg
          fill="none"
          height="9"
          viewBox="0 0 34 9"
          width="34"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute z-[11] h-auto w-screen select-none"
        >
          <g fill={letterColor}>
            <path d="m6.96094.410156h1.58789v6.585934c0 .21094.05664.375.16992.49219.11719.11328.2793.16992.48633.16992h3.35152v1.3418h-5.59566z" />
          </g>
        </svg>

        <svg
          fill="none"
          height="9"
          viewBox="0 0 34 9"
          width="34"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute z-[13] h-auto w-screen select-none"
        >
          <g fill={letterColor}>
            <path d="m14.9941.410156h2.543l2.2793 8.589844h-1.6816l-.17-.65039c-.0117-.05078-.041-.11914-.0878-.20508-.043-.08594-.1192-.16601-.2286-.24023-.1093-.07813-.2519-.11719-.4277-.11719h-1.9922c-.25 0-.4277.06445-.5332.19336-.1055.125-.1758.24805-.2109.36914l-.1641.65039h-1.6113zm.1993 5.302734c-.0118.07031-.0176.13281-.0176.1875 0 .14844.043.27734.1289.38672.0859.10547.2422.1582.4687.1582h.9082c.2266 0 .3829-.05273.4688-.1582.0859-.10938.1289-.23828.1289-.38672 0-.05469-.0059-.11719-.0176-.1875l-.8789-3.82617c-.0078-.04297-.0254-.08008-.0527-.11133-.0235-.03125-.0586-.04687-.1055-.04687-.0859 0-.1367.05273-.1523.1582z" />
          </g>
        </svg>

        <svg
          fill="none"
          height="9"
          viewBox="0 0 34 9"
          width="34"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute z-[11] h-auto w-screen select-none"
        >
          <g fill={letterColor}>
            <path d="m20.4141.410156h1.5879l1.1367 1.271484c.0703.07813.1465.13867.2285.18164.082.03906.1621.0586.2402.0586.1602 0 .3164-.08008.4688-.24024l1.1426-1.271484h1.6054v8.589844h-1.582v-5.53125c0-.14453-.0371-.25781-.1113-.33984-.0704-.08594-.1621-.12891-.2754-.12891-.125 0-.252.07227-.3809.2168l-.8555.99609h-.0117l-.8496-.96094c-.1133-.13672-.2422-.20507-.3867-.20507-.1055 0-.1934.04101-.2637.12304-.0703.07813-.1054.18946-.1054.33399v5.49609h-1.5879z" />
          </g>
        </svg>

        <svg
          fill="none"
          height="9"
          viewBox="0 0 34 9"
          width="34"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute z-[13] h-auto w-screen select-none"
        >
          <g fill={letterColor}>
            <path d="m27.9961.410156h5.5957v1.341794h-3.4102c-.1836 0-.33.04688-.4394.14063-.1055.08984-.1582.21484-.1582.375 0 .16797.0527.30078.1582.39844.1094.09375.2558.14062.4394.14062h3.4102v1.34766h-3.3516c-.2031 0-.3632.05859-.4804.17578s-.1758.27734-.1758.48047v2.18554c0 .20313.0586.36524.1758.48633.1172.11719.2773.17578.4804.17578h3.3516v1.3418h-5.5957z" />
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-x-0 bottom-[30px] z-[20] hidden text-center font-[var(--trail-font-mono)] text-[10px] uppercase text-white opacity-70 max-[768px]:block">
          {touchInstructionText}
        </div>

        <div
          ref={speedIndicatorRef}
          className="pointer-events-none absolute bottom-5 left-1/2 z-[20] -translate-x-1/2 font-[var(--trail-font-mono)] text-[10px] uppercase text-white opacity-0 transition-opacity duration-300"
        />
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: "TrailFontMono";
              src: url("${fontMonoUrl}") format("truetype");
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: "TrailFontSans";
              src: url("${fontSansUrl}") format("woff2-variations");
              font-weight: 300 900;
              font-stretch: 0% 150%;
              font-style: normal;
            }
            :root {
              --trail-font-sans: "TrailFontSans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              --trail-font-mono: "TrailFontMono", "Courier New", monospace;
            }
            body::after {
              content: "";
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: url("${noiseOverlayUrl}");
              background-repeat: repeat;
              background-size: 200px 200px;
              opacity: ${noiseOpacity};
              pointer-events: none;
              z-index: 9999;
              mix-blend-mode: screen;
            }
            .nav-link {
              font-family: var(--trail-font-mono);
            }
            .nav-link::after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 0;
              height: 100%;
              background-color: #fff;
              z-index: -1;
              transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .nav-link:hover::after,
            .nav-link.active::after {
              width: 100%;
            }
            .nav-link:hover,
            .nav-link.active {
              color: #222220;
              mix-blend-mode: difference;
              opacity: 1;
            }
            .trail-img {
              position: absolute;
              object-fit: cover;
              transform-origin: center;
              pointer-events: none;
              will-change: transform;
              z-index: 12;
            }
            .trail-image {
              position: absolute;
              overflow: hidden;
              will-change: transform;
              transform-origin: center;
              backface-visibility: hidden;
              transform: translate3d(0, 0, 0);
              z-index: 12;
            }
            .image-fragment {
              position: absolute;
              overflow: hidden;
              will-change: transform, clip-path;
              backface-visibility: hidden;
              transform: translate3d(0, 0, 0);
            }
            .fragment-bg {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              transform: translate3d(0, 0, 0);
            }
          `,
        }}
      />
    </>
  );
}
