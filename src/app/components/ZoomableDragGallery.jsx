"use client";

import { useEffect, useRef, useId } from "react";

// ─── ZoomableDragGallery ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images              string[]  14 orange-portrait URLs   Image sources cycled into the grid
// slides              object[]  14 default poem slides     [{ number, title, description }] shown on zoom-in, cycles by index
// rows                number    8                          Grid rows
// cols                number    12                         Grid columns
// itemSize            number    320                        Grid cell size in px (square)
// initialZoom         number    0.6                         Starting zoom level (also "NORMAL" preset)
// zoomOutLevel        number    0.3                         Zoom level for the "ZOOM OUT" button / key "1"
// zoomInLevel         number    1.0                         Zoom level for the "ZOOM IN" button / key "3"
// bgColor             string    #000000                     Page background color
// textColor           string    #ffffff                     Header/footer/link text color
// fontFamily          string    "PPNeueMontreal, sans-serif" Body font stack (loaded externally by the consumer)
// monoFontFamily      string    "TheGoodMonolith, monospace" Monospace font stack for coordinates/labels
// preloaderDuration   number    2000                        Preloader animation length in ms
// preloaderBg         string    #000000                     Preloader background color
// preloaderPrimary    string    #2C1B14                     Preloader dot/line primary color
// preloaderAccent     string    #A64B23                     Preloader dot/line accent (pulse) color
// enableSound         boolean   false                        Sound effects on by default
// soundUrls           object    {see default below}         { click, open, close, zoomIn, zoomOut, dragStart, dragEnd } mp3 URLs
// soundVolume         number    0.3                          Volume (0–1) for all sound effects
// gsapCdnUrl          string    cdnjs GSAP core URL          Overridable CDN URL for GSAP core
// gsapPluginsCdnUrls  object    {see default below}          { draggable, inertia, customEase, flip } CDN URLs
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = Array.from({ length: 14 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `https://assets.codepen.io/7558/orange-portrait_${n}.jpg`;
});

const DEFAULT_SLIDES = [
  {
    number: "01",
    title: "Begin Before You're Ready",
    description:
      "The work starts when you notice the quiet pull. Breathe once, clear the room inside you, and move one pixel forward.",
  },
  {
    number: "02",
    title: "Negative Space, Positive Signal",
    description:
      "Leave room around the idea. In the silence, the design answers back and shows you what to remove.",
  },
  {
    number: "03",
    title: "Friction Is a Teacher",
    description:
      "When the line resists, listen. Constraints are coordinates—plot them, then chart a cleaner route.",
  },
  {
    number: "04",
    title: "Golden Minute",
    description:
      "Catch the light while it's honest. One honest frame beats a hundred almosts.",
  },
  {
    number: "05",
    title: "Shadow Carries Form",
    description:
      "The dark reveals the edge. Let contrast articulate what you mean but can't yet say.",
  },
  {
    number: "06",
    title: "City Breath",
    description:
      "Steel, glass, heartbeat. Edit until the street's rhythm fits inside a single grid.",
  },
  {
    number: "07",
    title: "Soft Focus, Sharp Intent",
    description:
      "Blur the noise, not the purpose. What matters remains in crisp relief.",
  },
  {
    number: "08",
    title: "Time-Tested, Future-Ready",
    description:
      "Classics survive because they serve. Keep the spine, tune the surface, respect the lineage.",
  },
  {
    number: "09",
    title: "Grace Under Revision",
    description:
      "Drafts don't apologize. They evolve. Let elegance emerge through cuts, not flourishes.",
  },
  {
    number: "10",
    title: "Style That Outlasts Seasons",
    description:
      "Trends talk. Principles walk. Build on principles and let trends accessorize.",
  },
  {
    number: "11",
    title: "Edges and Experiments",
    description:
      "Push just past comfort. Leave a fingerprint the algorithm can't fake.",
  },
  {
    number: "12",
    title: "Portrait of Attention",
    description:
      "Form is what you see. Presence is what you feel. Aim for presence.",
  },
  {
    number: "13",
    title: "Light Speaks First",
    description:
      "Expose for truth. Shadows are sentences, highlights the punctuation.",
  },
  {
    number: "14",
    title: "Contemporary Is a Moving Target",
    description:
      "Design for now by listening deeper than now. The signal is older than the feed.",
  },
];

const DEFAULT_SOUND_URLS = {
  click: "https://assets.codepen.io/7558/glitch-fx-001.mp3",
  open: "https://assets.codepen.io/7558/click-glitch-001.mp3",
  close: "https://assets.codepen.io/7558/click-glitch-001.mp3",
  zoomIn: "https://assets.codepen.io/7558/whoosh-fx-001.mp3",
  zoomOut: "https://assets.codepen.io/7558/whoosh-fx-001.mp3",
  dragStart: "https://assets.codepen.io/7558/preloader-2s-001.mp3",
  dragEnd: "https://assets.codepen.io/7558/preloader-2s-001.mp3",
};

// As of GSAP's 2025 licensing change (sponsored by Webflow), every bonus plugin
// that used to be Club-GreenSock-only — Draggable, InertiaPlugin, CustomEase,
// Flip, etc. — is now free for commercial use and mirrored on cdnjs alongside
// the core.
const DEFAULT_GSAP_PLUGIN_URLS = {
  draggable:
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/Draggable.min.js",
  inertia:
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/InertiaPlugin.min.js",
  customEase:
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/CustomEase.min.js",
  flip: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/Flip.min.js",
};

export default function ZoomableDragGallery({
  images = DEFAULT_IMAGES,
  slides = DEFAULT_SLIDES,
  rows = 8,
  cols = 12,
  itemSize = 320,
  initialZoom = 0.6,
  zoomOutLevel = 0.3,
  zoomInLevel = 1.0,
  bgColor = "#000000",
  textColor = "#ffffff",
  fontFamily = "PPNeueMontreal, sans-serif",
  monoFontFamily = "TheGoodMonolith, monospace",
  preloaderDuration = 2000,
  preloaderBg = "#000000",
  preloaderPrimary = "#2C1B14",
  preloaderAccent = "#A64B23",
  enableSound = false,
  soundUrls = DEFAULT_SOUND_URLS,
  soundVolume = 0.3,
  gsapCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js",
  gsapPluginsCdnUrls = DEFAULT_GSAP_PLUGIN_URLS,
}) {
  const uid = useId().replace(/:/g, "");

  const rootRef = useRef(null);
  const preloaderRef = useRef(null);
  const viewportRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const gridContainerRef = useRef(null);
  const splitScreenRef = useRef(null);
  const splitLeftRef = useRef(null);
  const splitRightRef = useRef(null);
  const zoomTargetRef = useRef(null);
  const titleOverlayRef = useRef(null);
  const slideNumberRef = useRef(null);
  const slideTitleRef = useRef(null);
  const slideDescRef = useRef(null);
  const closeButtonRef = useRef(null);
  const controlsRef = useRef(null);
  const percentageRef = useRef(null);
  const soundToggleRef = useRef(null);
  const soundWaveCanvasRef = useRef(null);

  useEffect(() => {
    let destroyed = false;
    let galleryInstance = null;
    let preloaderInstance = null;
    let resizeHandler = null;
    let mouseLeaveHandler = null;
    let keydownHandler = null;
    let preloaderTimeout = null;

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
        el.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(el);
      });

    const loadAllScripts = () =>
      loadScript(gsapCdnUrl).then(() =>
        Promise.all([
          loadScript(gsapPluginsCdnUrls.draggable),
          loadScript(gsapPluginsCdnUrls.inertia),
          loadScript(gsapPluginsCdnUrls.customEase),
          loadScript(gsapPluginsCdnUrls.flip),
        ]),
      );

    loadAllScripts()
      .then(() => {
        if (destroyed) return;
        const { gsap, Draggable, InertiaPlugin, CustomEase, Flip } = window;
        if (!gsap || !Draggable || !InertiaPlugin || !CustomEase || !Flip)
          return;

        gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase, Flip);

        // ── Preloader (canvas dot-ring pulse) ──────────────────────────────
        class PreloaderManager {
          constructor() {
            this.overlay = preloaderRef.current;
            this.duration = preloaderDuration;
            this.startTime = null;
            this.animationId = null;
            this.canvas = document.createElement("canvas");
            this.canvas.width = 300;
            this.canvas.height = 300;
            this.ctx = this.canvas.getContext("2d");
            this.overlay.appendChild(this.canvas);
            this.startAnimation();
          }
          startAnimation() {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            let time = 0;
            let lastTime = 0;
            const dotRings = [
              { radius: 20, count: 8 },
              { radius: 35, count: 12 },
              { radius: 50, count: 16 },
              { radius: 65, count: 20 },
              { radius: 80, count: 24 },
            ];
            const hexToRgb = (hex) => [
              parseInt(hex.slice(1, 3), 16),
              parseInt(hex.slice(3, 5), 16),
              parseInt(hex.slice(5, 7), 16),
            ];
            const animate = (timestamp) => {
              if (!this.startTime) this.startTime = timestamp;
              if (!lastTime) lastTime = timestamp;
              const deltaTime = timestamp - lastTime;
              lastTime = timestamp;
              time += deltaTime * 0.001;
              this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
              this.ctx.beginPath();
              this.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
              const rgb = hexToRgb(preloaderPrimary);
              this.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
              this.ctx.fill();
              dotRings.forEach((ring, ringIndex) => {
                for (let i = 0; i < ring.count; i++) {
                  const angle = (i / ring.count) * Math.PI * 2;
                  const radiusPulse = Math.sin(time * 2 - ringIndex * 0.4) * 3;
                  const x =
                    centerX + Math.cos(angle) * (ring.radius + radiusPulse);
                  const y =
                    centerY + Math.sin(angle) * (ring.radius + radiusPulse);
                  const opacityWave =
                    0.4 + Math.sin(time * 2 - ringIndex * 0.4 + i * 0.2) * 0.6;
                  const isActive =
                    Math.sin(time * 2 - ringIndex * 0.4 + i * 0.2) > 0.6;
                  this.ctx.beginPath();
                  this.ctx.moveTo(centerX, centerY);
                  this.ctx.lineTo(x, y);
                  this.ctx.lineWidth = 0.8;
                  const activeRgb = hexToRgb(preloaderAccent);
                  const idleRgb = hexToRgb(preloaderPrimary);
                  this.ctx.strokeStyle = isActive
                    ? `rgba(${activeRgb[0]}, ${activeRgb[1]}, ${activeRgb[2]}, ${opacityWave * 0.7})`
                    : `rgba(${idleRgb[0]}, ${idleRgb[1]}, ${idleRgb[2]}, ${opacityWave * 0.5})`;
                  this.ctx.stroke();
                  this.ctx.beginPath();
                  this.ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                  this.ctx.fillStyle = isActive
                    ? `rgba(${activeRgb[0]}, ${activeRgb[1]}, ${activeRgb[2]}, ${opacityWave})`
                    : `rgba(${idleRgb[0]}, ${idleRgb[1]}, ${idleRgb[2]}, ${opacityWave})`;
                  this.ctx.fill();
                }
              });
              if (timestamp - this.startTime >= this.duration) {
                this.complete();
                return;
              }
              this.animationId = requestAnimationFrame(animate);
            };
            this.animationId = requestAnimationFrame(animate);
          }
          complete(onComplete) {
            if (this.animationId) cancelAnimationFrame(this.animationId);
            if (this.overlay) {
              this.overlay.style.opacity = "0";
              this.overlay.style.transition = "opacity 0.8s ease";
              preloaderTimeout = setTimeout(() => {
                this.overlay?.remove();
                if (onComplete) onComplete();
              }, 800);
            }
          }
        }

        // ── Main gallery controller ────────────────────────────────────────
        class FashionGalleryController {
          constructor() {
            this.viewport = viewportRef.current;
            this.canvasWrapper = canvasWrapperRef.current;
            this.gridContainer = gridContainerRef.current;
            this.splitScreenContainer = splitScreenRef.current;
            this.imageTitleOverlay = titleOverlayRef.current;
            this.closeButton = closeButtonRef.current;
            this.controlsContainer = controlsRef.current;
            this.soundToggle = soundToggleRef.current;

            this.customEase = CustomEase.create(`smooth-${uid}`, ".87,0,.13,1");
            this.centerEase = CustomEase.create(
              `center-${uid}`,
              ".25,.46,.45,.94",
            );

            this.config = {
              itemSize,
              rows,
              cols,
              currentZoom: initialZoom,
              currentGap: 32,
            };
            this.zoomState = {
              isActive: false,
              selectedItem: null,
              flipAnimation: null,
              scalingOverlay: null,
            };
            this.gridItems = [];
            this.gridDimensions = {};
            this.lastValidPosition = { x: 0, y: 0 };
            this.draggable = null;
            this.viewportObserver = null;

            this.initSoundSystem();
          }

          initSoundSystem() {
            this.soundSystem = {
              enabled: enableSound,
              sounds: {
                click: new Audio(soundUrls.click),
                open: new Audio(soundUrls.open),
                close: new Audio(soundUrls.close),
                "zoom-in": new Audio(soundUrls.zoomIn),
                "zoom-out": new Audio(soundUrls.zoomOut),
                "drag-start": new Audio(soundUrls.dragStart),
                "drag-end": new Audio(soundUrls.dragEnd),
              },
              play: (soundName) => {
                if (
                  !this.soundSystem.enabled ||
                  !this.soundSystem.sounds[soundName]
                )
                  return;
                try {
                  const audio = this.soundSystem.sounds[soundName];
                  audio.currentTime = 0;
                  audio.play().catch(() => {});
                } catch (e) {}
              },
              toggle: () => {
                this.soundSystem.enabled = !this.soundSystem.enabled;
                this.soundToggle.classList.toggle(
                  "ring-2",
                  this.soundSystem.enabled,
                );
                if (this.zoomState.isActive) return;
                if (this.soundSystem.enabled) {
                  setTimeout(() => this.soundSystem.play("click"), 50);
                }
              },
            };
            Object.values(this.soundSystem.sounds).forEach((audio) => {
              audio.preload = "auto";
              audio.volume = soundVolume;
            });
            this.initSoundWave();
          }

          initSoundWave() {
            const canvas = soundWaveCanvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            const width = 32;
            const height = 16;
            const centerY = Math.floor(height / 2);
            const startTime = Date.now();
            let currentAmplitude = this.soundSystem.enabled ? 1 : 0;
            const interpolateColor = (c1, c2, factor) => {
              const r1 = parseInt(c1.substring(1, 3), 16);
              const g1 = parseInt(c1.substring(3, 5), 16);
              const b1 = parseInt(c1.substring(5, 7), 16);
              const r2 = parseInt(c2.substring(1, 3), 16);
              const g2 = parseInt(c2.substring(3, 5), 16);
              const b2 = parseInt(c2.substring(5, 7), 16);
              const r = Math.round(r1 + factor * (r2 - r1))
                .toString(16)
                .padStart(2, "0");
              const g = Math.round(g1 + factor * (g2 - g1))
                .toString(16)
                .padStart(2, "0");
              const b = Math.round(b1 + factor * (b2 - b1))
                .toString(16)
                .padStart(2, "0");
              return `#${r}${g}${b}`;
            };
            const animate = () => {
              if (destroyed) return;
              const targetAmplitude = this.soundSystem.enabled ? 1 : 0;
              currentAmplitude += (targetAmplitude - currentAmplitude) * 0.08;
              ctx.clearRect(0, 0, width, height);
              const time = (Date.now() - startTime) / 1000;
              const muteFactor = 1 - currentAmplitude;
              const primaryColor = "#2C1B14";
              const accentColor = "#A64B23";
              const muteColor = "#D9C4AA";
              if (!this.soundSystem.enabled && currentAmplitude < 0.01) {
                ctx.fillStyle = muteColor;
                ctx.fillRect(0, centerY, width, 2);
              } else {
                ctx.fillStyle = interpolateColor(
                  primaryColor,
                  muteColor,
                  muteFactor,
                );
                for (let i = 0; i < width; i++) {
                  const x = i - width / 2;
                  const e = Math.exp((-x * x) / 50);
                  const y =
                    centerY +
                    Math.cos(x * 0.4 - time * 8) *
                      e *
                      height *
                      0.35 *
                      currentAmplitude;
                  ctx.fillRect(i, Math.round(y), 1, 2);
                }
                ctx.fillStyle = interpolateColor(
                  accentColor,
                  muteColor,
                  muteFactor,
                );
                for (let i = 0; i < width; i++) {
                  const x = i - width / 2;
                  const e = Math.exp((-x * x) / 80);
                  const y =
                    centerY +
                    Math.cos(x * 0.3 - time * 5) *
                      e *
                      height *
                      0.25 *
                      currentAmplitude;
                  ctx.fillRect(i, Math.round(y), 1, 2);
                }
              }
              this.soundWaveAnimationId = requestAnimationFrame(animate);
            };
            animate();
          }

          splitTextIntoLines(element, text) {
            element.innerHTML = "";
            const sentences = text.split(/(?<=[.!?])\s+/);
            const lines = [];
            const temp = document.createElement("div");
            temp.style.cssText = `position:absolute;visibility:hidden;width:${element.offsetWidth}px;font-family:${fontFamily};font-size:16px;font-weight:300;line-height:1.4;`;
            document.body.appendChild(temp);
            let currentLine = "";
            sentences.forEach((sentence) => {
              sentence.split(" ").forEach((word) => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                temp.textContent = testLine;
                if (temp.offsetWidth > element.offsetWidth && currentLine) {
                  lines.push(currentLine);
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
              });
            });
            if (currentLine) lines.push(currentLine);
            document.body.removeChild(temp);
            lines.forEach((lineText) => {
              const lineSpan = document.createElement("span");
              lineSpan.className =
                "description-line block text-white/80 text-base font-light leading-snug";
              lineSpan.style.fontFamily = fontFamily;
              lineSpan.textContent = lineText;
              element.appendChild(lineSpan);
            });
            return element.querySelectorAll(".description-line");
          }

          calculateGapForZoom(zoomLevel) {
            if (zoomLevel >= 1.0) return 16;
            if (zoomLevel >= 0.6) return 32;
            return 64;
          }

          calculateGridDimensions(gap = this.config.currentGap) {
            const totalWidth =
              this.config.cols * (this.config.itemSize + gap) - gap;
            const totalHeight =
              this.config.rows * (this.config.itemSize + gap) - gap;
            this.gridDimensions = {
              width: totalWidth,
              height: totalHeight,
              scaledWidth: totalWidth * this.config.currentZoom,
              scaledHeight: totalHeight * this.config.currentZoom,
              gap,
            };
            return this.gridDimensions;
          }

          generateGridItems() {
            this.config.currentGap = this.calculateGapForZoom(
              this.config.currentZoom,
            );
            this.calculateGridDimensions();
            this.canvasWrapper.style.width = `${this.gridDimensions.width}px`;
            this.canvasWrapper.style.height = `${this.gridDimensions.height}px`;
            this.gridContainer.innerHTML = "";
            this.gridItems = [];

            let imageIndex = 0;
            for (let row = 0; row < this.config.rows; row++) {
              for (let col = 0; col < this.config.cols; col++) {
                const item = document.createElement("div");
                item.className =
                  "grid-item absolute cursor-pointer opacity-100 transition-opacity duration-500";
                item.style.width = `${itemSize}px`;
                item.style.height = `${itemSize}px`;
                item.style.willChange = "transform, opacity";
                item.style.zIndex = "1";

                const x = col * (this.config.itemSize + this.config.currentGap);
                const y = row * (this.config.itemSize + this.config.currentGap);
                item.style.left = `${x}px`;
                item.style.top = `${y}px`;
                item.style.opacity = "0";

                const imageUrl = images[imageIndex % images.length];
                imageIndex++;
                const img = document.createElement("img");
                img.src = imageUrl;
                img.alt = `Gallery item ${imageIndex}`;
                img.className =
                  "w-full h-full object-cover block pointer-events-none select-none";
                item.appendChild(img);

                const itemData = {
                  element: item,
                  img,
                  row,
                  col,
                  baseX: x,
                  baseY: y,
                  imageUrl,
                  index: this.gridItems.length,
                };

                item.addEventListener("click", () => {
                  if (!this.zoomState.isActive) {
                    this.soundSystem.play("click");
                    this.enterZoomMode(itemData);
                  }
                });

                this.gridContainer.appendChild(item);
                this.gridItems.push(itemData);
              }
            }
          }

          setupViewportObserver() {
            if (this.viewportObserver) this.viewportObserver.disconnect();
            this.viewportObserver = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (
                    this.zoomState.selectedItem &&
                    entry.target === this.zoomState.selectedItem.element
                  ) {
                    return;
                  }
                  if (entry.isIntersecting) {
                    gsap.to(entry.target, {
                      opacity: 1,
                      duration: 0.6,
                      ease: "power2.out",
                    });
                  } else {
                    gsap.to(entry.target, {
                      opacity: 0.1,
                      duration: 0.6,
                      ease: "power2.out",
                    });
                  }
                });
              },
              { root: null, threshold: 0.15, rootMargin: "10%" },
            );
            this.gridItems.forEach((item) =>
              this.viewportObserver.observe(item.element),
            );
          }

          updateTitleOverlay(imageIndex) {
            const data = slides[imageIndex % slides.length];
            const numberElement = slideNumberRef.current?.querySelector("span");
            const titleElement = slideTitleRef.current?.querySelector("h1");
            const descriptionElement = slideDescRef.current;
            if (numberElement && titleElement && descriptionElement) {
              numberElement.textContent = data.number;
              titleElement.textContent = data.title;
              this.descriptionLines = this.splitTextIntoLines(
                descriptionElement,
                data.description,
              );
            }
          }

          createScalingOverlay(sourceImg) {
            const overlay = document.createElement("div");
            overlay.className = "fixed top-0 left-0 z-[3] pointer-events-none";
            overlay.style.willChange = "transform";
            overlay.style.opacity = "1";
            const img = document.createElement("img");
            img.src = sourceImg.src;
            img.alt = sourceImg.alt;
            img.className = "w-full h-full object-cover block";
            overlay.appendChild(img);
            document.body.appendChild(overlay);
            const rect = sourceImg.getBoundingClientRect();
            gsap.set(overlay, {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              opacity: 1,
            });
            return overlay;
          }

          enterZoomMode(selectedItemData) {
            if (this.zoomState.isActive) return;
            this.zoomState.isActive = true;
            this.zoomState.selectedItem = selectedItemData;
            this.soundSystem.play("open");
            if (this.draggable) this.draggable.disable();
            rootRef.current.classList.add("cursor-default");

            const splitContainer = this.splitScreenContainer;
            const zoomTarget = zoomTargetRef.current;
            splitContainer.classList.remove("opacity-0", "pointer-events-none");
            splitContainer.classList.add("pointer-events-auto");
            gsap.to(splitContainer, {
              opacity: 1,
              duration: 1.2,
              ease: this.customEase,
            });

            this.zoomState.scalingOverlay = this.createScalingOverlay(
              selectedItemData.img,
            );
            gsap.set(selectedItemData.img, { opacity: 0 });

            this.zoomState.flipAnimation = Flip.fit(
              this.zoomState.scalingOverlay,
              zoomTarget,
              {
                duration: 1.2,
                ease: this.customEase,
                absolute: true,
                onComplete: () => {
                  this.updateTitleOverlay(selectedItemData.index);
                  const overlay = this.imageTitleOverlay;
                  gsap.set(slideNumberRef.current?.querySelector("span"), {
                    y: 20,
                    opacity: 0,
                  });
                  gsap.set(slideTitleRef.current?.querySelector("h1"), {
                    y: 60,
                    opacity: 0,
                  });
                  gsap.set(this.descriptionLines, { y: 80, opacity: 0 });
                  overlay.classList.remove("opacity-0");
                  gsap.to(overlay, {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out",
                  });
                  gsap.to(slideNumberRef.current?.querySelector("span"), {
                    duration: 0.8,
                    y: 0,
                    opacity: 1,
                    ease: this.customEase,
                    delay: 0.1,
                  });
                  gsap.to(slideTitleRef.current?.querySelector("h1"), {
                    duration: 0.8,
                    y: 0,
                    opacity: 1,
                    ease: this.customEase,
                    delay: 0.15,
                  });
                  gsap.to(this.descriptionLines, {
                    duration: 0.8,
                    y: 0,
                    opacity: 1,
                    ease: this.customEase,
                    delay: 0.2,
                    stagger: 0.15,
                  });
                },
              },
            );

            this.controlsContainer.style.left = "75%";
            gsap.fromTo(
              this.closeButton,
              { x: 40, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",
                delay: 0.9,
              },
            );
            this.closeButton.classList.remove(
              "opacity-0",
              "pointer-events-none",
            );
            this.closeButton.classList.add("pointer-events-auto");

            this.onSplitAreaClick = (e) => {
              if (e.target === e.currentTarget) this.exitZoomMode();
            };
            splitLeftRef.current.addEventListener(
              "click",
              this.onSplitAreaClick,
            );
            splitRightRef.current.addEventListener(
              "click",
              this.onSplitAreaClick,
            );
            this.onZoomKeys = (e) => {
              if (!this.zoomState.isActive) return;
              if (e.key === "Escape") this.exitZoomMode();
            };
            document.addEventListener("keydown", this.onZoomKeys);
          }

          exitZoomMode() {
            if (
              !this.zoomState.isActive ||
              !this.zoomState.selectedItem ||
              !this.zoomState.scalingOverlay
            )
              return;
            this.soundSystem.play("close");
            if (this.onZoomKeys)
              document.removeEventListener("keydown", this.onZoomKeys);
            if (this.onSplitAreaClick) {
              splitLeftRef.current?.removeEventListener(
                "click",
                this.onSplitAreaClick,
              );
              splitRightRef.current?.removeEventListener(
                "click",
                this.onSplitAreaClick,
              );
            }

            const splitContainer = this.splitScreenContainer;
            const selectedElement = this.zoomState.selectedItem.element;
            const selectedImg = this.zoomState.selectedItem.img;
            if (this.zoomState.flipAnimation)
              this.zoomState.flipAnimation.kill();

            const overlayElement = this.imageTitleOverlay;
            gsap.to(overlayElement, {
              opacity: 0,
              duration: 0.3,
              ease: "power2.out",
            });
            gsap.to(slideNumberRef.current?.querySelector("span"), {
              duration: 0.4,
              y: -20,
              opacity: 0,
              ease: "power2.out",
            });
            gsap.to(slideTitleRef.current?.querySelector("h1"), {
              duration: 0.4,
              y: -60,
              opacity: 0,
              ease: "power2.out",
            });
            if (this.descriptionLines) {
              gsap.to(this.descriptionLines, {
                duration: 0.4,
                y: -80,
                opacity: 0,
                ease: "power2.out",
                stagger: -0.05,
                onComplete: () => {
                  overlayElement.classList.add("opacity-0");
                },
              });
            }

            gsap.to(this.closeButton, {
              duration: 0.3,
              opacity: 0,
              x: 40,
              ease: "power2.in",
            });
            this.controlsContainer.style.left = "50%";
            gsap.to(splitContainer, {
              opacity: 0,
              duration: 0.8,
              ease: "power2.out",
            });

            Flip.fit(this.zoomState.scalingOverlay, selectedElement, {
              duration: 1.2,
              ease: this.customEase,
              absolute: true,
              onComplete: () => {
                gsap.set(selectedImg, { opacity: 1 });
                if (this.zoomState.scalingOverlay) {
                  document.body.removeChild(this.zoomState.scalingOverlay);
                  this.zoomState.scalingOverlay = null;
                }
                splitContainer.classList.add(
                  "opacity-0",
                  "pointer-events-none",
                );
                rootRef.current.classList.remove("cursor-default");
                this.closeButton.classList.add(
                  "opacity-0",
                  "pointer-events-none",
                );
                this.closeButton.classList.remove("pointer-events-auto");
                if (this.draggable) this.draggable.enable();
                this.zoomState.isActive = false;
                this.zoomState.selectedItem = null;
                this.zoomState.flipAnimation = null;
              },
            });

            if (this.zoomState.scalingOverlay) {
              gsap.to(this.zoomState.scalingOverlay, {
                opacity: 0.4,
                duration: 0.8,
                ease: "power2.out",
              });
            }
          }

          calculateBounds() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const { scaledWidth, scaledHeight } = this.gridDimensions;
            const marginX = this.config.currentGap * this.config.currentZoom;
            const marginY = this.config.currentGap * this.config.currentZoom;
            let minX, maxX, minY, maxY;
            if (scaledWidth <= vw) {
              minX = maxX = (vw - scaledWidth) / 2;
            } else {
              maxX = marginX;
              minX = vw - scaledWidth - marginX;
            }
            if (scaledHeight <= vh) {
              minY = maxY = (vh - scaledHeight) / 2;
            } else {
              maxY = marginY;
              minY = vh - scaledHeight - marginY;
            }
            return { minX, maxX, minY, maxY };
          }

          initDraggable() {
            if (this.draggable) this.draggable.kill();
            this.calculateGridDimensions(this.config.currentGap);
            const bounds = this.calculateBounds();
            this.draggable = Draggable.create(this.canvasWrapper, {
              type: "x,y",
              bounds,
              edgeResistance: 0.8,
              inertia: true,
              throwProps: {
                x: {
                  velocity: "auto",
                  resistance: 300,
                  end: (v) => Math.round(v),
                },
                y: {
                  velocity: "auto",
                  resistance: 300,
                  end: (v) => Math.round(v),
                },
              },
              onDragStart: () => {
                rootRef.current.classList.add("cursor-grabbing");
                this.soundSystem.play("drag-start");
                this.lastValidPosition.x = this.draggable.x;
                this.lastValidPosition.y = this.draggable.y;
              },
              onDrag: () => {
                this.lastValidPosition.x = this.draggable.x;
                this.lastValidPosition.y = this.draggable.y;
              },
              onDragEnd: () => {
                rootRef.current.classList.remove("cursor-grabbing");
                this.soundSystem.play("drag-end");
              },
            })[0];
          }

          handleMouseLeave() {
            if (rootRef.current.classList.contains("cursor-grabbing")) {
              rootRef.current.classList.remove("cursor-grabbing");
              gsap.to(this.canvasWrapper, {
                duration: 0.6,
                x: this.lastValidPosition.x,
                y: this.lastValidPosition.y,
                ease: "power2.out",
              });
              if (this.draggable) this.draggable.endDrag();
            }
          }

          calculateFitZoom() {
            const vw = window.innerWidth;
            const vh = window.innerHeight - 80;
            const currentGap = this.calculateGapForZoom(1.0);
            const gridWidth =
              this.config.cols * (this.config.itemSize + currentGap) -
              currentGap;
            const gridHeight =
              this.config.rows * (this.config.itemSize + currentGap) -
              currentGap;
            const margin = 40;
            const zoomToFitWidth = (vw - margin * 2) / gridWidth;
            const zoomToFitHeight = (vh - margin * 2) / gridHeight;
            return Math.max(
              0.1,
              Math.min(2.0, Math.min(zoomToFitWidth, zoomToFitHeight)),
            );
          }

          playIntroAnimation() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const screenCenterX = vw / 2;
            const screenCenterY = vh / 2;
            const canvasStyle = getComputedStyle(this.canvasWrapper);
            const canvasMatrix = new DOMMatrix(canvasStyle.transform);
            const canvasX = canvasMatrix.m41;
            const canvasY = canvasMatrix.m42;
            const canvasScale = canvasMatrix.a;
            const centerX =
              (screenCenterX - canvasX) / canvasScale -
              this.config.itemSize / 2;
            const centerY =
              (screenCenterY - canvasY) / canvasScale -
              this.config.itemSize / 2;

            this.gridItems.forEach((itemData, index) => {
              gsap.set(itemData.element, {
                left: centerX,
                top: centerY,
                scale: 0.8,
                zIndex: this.gridItems.length - index,
                opacity: 0,
              });
            });

            gsap.to(
              this.gridItems.map((item) => item.element),
              {
                duration: 0.2,
                left: (index) => this.gridItems[index].baseX,
                top: (index) => this.gridItems[index].baseY,
                scale: 1,
                opacity: 1,
                ease: "power2.out",
                stagger: {
                  amount: 1.5,
                  from: "start",
                  grid: [this.config.rows, this.config.cols],
                },
                onComplete: () => {
                  this.gridItems.forEach((itemData) =>
                    gsap.set(itemData.element, { zIndex: 1 }),
                  );
                  const percentageIndicator = percentageRef.current;
                  const switchElement =
                    this.controlsContainer.querySelector("[data-switch]");
                  const soundToggle = this.soundToggle;
                  gsap.set(this.controlsContainer, { opacity: 0 });
                  gsap.set(percentageIndicator, { x: "-3em" });
                  gsap.set(switchElement, { y: "2em" });
                  gsap.set(soundToggle, { x: "3em" });
                  const navTimeline = gsap.timeline();
                  navTimeline.to(
                    this.controlsContainer,
                    { opacity: 1, duration: 0.5, ease: "power2.out" },
                    0,
                  );
                  navTimeline.to(
                    percentageIndicator,
                    { x: 0, duration: 0.2, ease: "power2.out" },
                    0.25,
                  );
                  navTimeline.to(
                    switchElement,
                    { y: 0, duration: 0.2, ease: "power2.out" },
                    0.3,
                  );
                  navTimeline.to(
                    soundToggle,
                    { x: 0, duration: 0.2, ease: "power2.out" },
                    0.35,
                  );
                  this.controlsContainer.classList.remove("opacity-0");
                },
              },
            );
          }

          repositionGrid(newGap, targetScale) {
            this.gridItems.forEach((itemData) => {
              const newX = itemData.col * (this.config.itemSize + newGap);
              const newY = itemData.row * (this.config.itemSize + newGap);
              itemData.baseX = newX;
              itemData.baseY = newY;
              gsap.to(itemData.element, {
                duration: 1.0,
                left: newX,
                top: newY,
                ease: this.customEase,
              });
            });
            const newWidth =
              this.config.cols * (this.config.itemSize + newGap) - newGap;
            const newHeight =
              this.config.rows * (this.config.itemSize + newGap) - newGap;
            gsap.to(this.canvasWrapper, {
              duration: 1.0,
              width: newWidth,
              height: newHeight,
              ease: this.customEase,
            });
            this.config.currentGap = newGap;
          }

          applyZoom(targetZoom, buttonElement) {
            if (this.zoomState.isActive) {
              this.exitZoomMode();
              return;
            }
            const newGap = this.calculateGapForZoom(targetZoom);
            const oldZoom = this.config.currentZoom;
            this.config.currentZoom = targetZoom;
            this.soundSystem.play(
              targetZoom < oldZoom ? "zoom-out" : "zoom-in",
            );
            this.calculateGridDimensions(this.config.currentGap);

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const currentScaledWidth = this.gridDimensions.width * oldZoom;
            const currentScaledHeight = this.gridDimensions.height * oldZoom;
            const centerX = (vw - currentScaledWidth) / 2;
            const centerY = (vh - currentScaledHeight) / 2;

            gsap.to(this.canvasWrapper, {
              duration: 0.6,
              x: centerX,
              y: centerY,
              ease: this.centerEase,
              onComplete: () => {
                if (newGap !== this.config.currentGap) {
                  this.repositionGrid(newGap, targetZoom);
                }
                this.calculateGridDimensions(newGap);
                const finalScaledWidth = this.gridDimensions.width * targetZoom;
                const finalScaledHeight =
                  this.gridDimensions.height * targetZoom;
                const finalCenterX = (vw - finalScaledWidth) / 2;
                const finalCenterY = (vh - finalScaledHeight) / 2;
                gsap.to(this.canvasWrapper, {
                  duration: 1.2,
                  scale: targetZoom,
                  x: finalCenterX,
                  y: finalCenterY,
                  ease: this.customEase,
                  onComplete: () => {
                    this.lastValidPosition.x = finalCenterX;
                    this.lastValidPosition.y = finalCenterY;
                    this.calculateGridDimensions(newGap);
                    this.initDraggable();
                  },
                });
              },
            });

            this.updatePercentageIndicator(targetZoom);
            this.rootEl
              .querySelectorAll("[data-switch-button]")
              .forEach((btn) => {
                btn.classList.remove("text-white");
                btn.classList.add("text-neutral-500");
              });
            if (buttonElement) {
              buttonElement.classList.add("text-white");
              buttonElement.classList.remove("text-neutral-500");
            }
          }

          autoFitZoom(buttonElement) {
            if (this.zoomState.isActive) {
              this.exitZoomMode();
              return;
            }
            const fitZoom = this.calculateFitZoom();
            this.applyZoom(fitZoom, buttonElement);
          }

          updatePercentageIndicator(zoomLevel) {
            if (percentageRef.current) {
              percentageRef.current.textContent = `${Math.round(zoomLevel * 100)}%`;
            }
          }

          resetPosition() {
            if (this.zoomState.isActive) {
              this.exitZoomMode();
              return;
            }
            this.calculateGridDimensions(this.config.currentGap);
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const { scaledWidth, scaledHeight } = this.gridDimensions;
            const centerX = (vw - scaledWidth) / 2;
            const centerY = (vh - scaledHeight) / 2;
            gsap.to(this.canvasWrapper, {
              duration: 1.0,
              x: centerX,
              y: centerY,
              ease: this.centerEase,
              onComplete: () => {
                this.lastValidPosition.x = centerX;
                this.lastValidPosition.y = centerY;
                this.initDraggable();
              },
            });
          }

          init(rootEl) {
            this.rootEl = rootEl;
            this.config.currentGap = this.calculateGapForZoom(
              this.config.currentZoom,
            );
            this.generateGridItems();

            gsap.set(this.viewport, { opacity: 0 });
            gsap.set(this.canvasWrapper, { scale: this.config.currentZoom });
            this.calculateGridDimensions(this.config.currentGap);

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const { scaledWidth, scaledHeight } = this.gridDimensions;
            const centerX = (vw - scaledWidth) / 2;
            const centerY = (vh - scaledHeight) / 2;
            gsap.set(this.canvasWrapper, { x: centerX, y: centerY });
            this.lastValidPosition.x = centerX;
            this.lastValidPosition.y = centerY;
            this.updatePercentageIndicator(this.config.currentZoom);

            gsap.to(this.viewport, {
              duration: 0.6,
              opacity: 1,
              ease: "power2.inOut",
              onComplete: () => {
                this.playIntroAnimation();
                gsap.to(rootEl.querySelectorAll("[data-header]"), {
                  duration: 1.2,
                  opacity: 1,
                  ease: "power2.out",
                  delay: 0.8,
                });
                gsap.to(rootEl.querySelectorAll("[data-footer]"), {
                  duration: 1.4,
                  opacity: 1,
                  ease: "power2.out",
                  delay: 1,
                });
                setTimeout(() => {
                  this.initDraggable();
                  this.setupViewportObserver();
                }, 1500);
              },
            });
          }

          destroy() {
            if (this.viewportObserver) this.viewportObserver.disconnect();
            if (this.draggable) this.draggable.kill();
            if (this.soundWaveAnimationId)
              cancelAnimationFrame(this.soundWaveAnimationId);
            Object.values(this.soundSystem?.sounds || {}).forEach((audio) => {
              audio.pause();
              audio.src = "";
            });
            if (this.onZoomKeys)
              document.removeEventListener("keydown", this.onZoomKeys);
          }
        }

        preloaderInstance = new PreloaderManager();
        preloaderTimeout = setTimeout(() => {
          if (destroyed) return;
          preloaderInstance.complete(() => {
            if (destroyed) return;
            galleryInstance = new FashionGalleryController();
            galleryInstance.init(rootRef.current);

            resizeHandler = () => {
              setTimeout(() => {
                galleryInstance.resetPosition();
                galleryInstance.initDraggable();
              }, 100);
            };
            window.addEventListener("resize", resizeHandler);

            mouseLeaveHandler = () => galleryInstance.handleMouseLeave();
            document.addEventListener("mouseleave", mouseLeaveHandler);
            viewportRef.current.addEventListener(
              "mouseleave",
              mouseLeaveHandler,
            );

            closeButtonRef.current.addEventListener("click", () =>
              galleryInstance.exitZoomMode(),
            );
            soundToggleRef.current.addEventListener("click", () =>
              galleryInstance.soundSystem.toggle(),
            );

            keydownHandler = (e) => {
              if (galleryInstance.zoomState.isActive) return;
              if (e.key === "1") galleryInstance.applyZoom(zoomOutLevel);
              else if (e.key === "2") galleryInstance.applyZoom(initialZoom);
              else if (e.key === "3") galleryInstance.applyZoom(zoomInLevel);
              else if (e.key === "f" || e.key === "F")
                galleryInstance.autoFitZoom();
            };
            document.addEventListener("keydown", keydownHandler);

            rootRef.current.__galleryInstance = galleryInstance;
          });
        }, preloaderDuration);
      })
      .catch((e) =>
        console.error("[FashionGallery] Script load failed:", e.message),
      );

    return () => {
      destroyed = true;
      if (preloaderTimeout) clearTimeout(preloaderTimeout);
      const galleryInstance = rootRef.current?.__galleryInstance;
      if (galleryInstance) galleryInstance.destroy();
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (mouseLeaveHandler) {
        document.removeEventListener("mouseleave", mouseLeaveHandler);
        viewportRef.current?.removeEventListener(
          "mouseleave",
          mouseLeaveHandler,
        );
      }
      if (keydownHandler)
        document.removeEventListener("keydown", keydownHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleZoomButtonClick = (level) => (e) => {
    rootRef.current?.__galleryInstance?.applyZoom(level, e.currentTarget);
  };
  const handleFitButtonClick = (e) => {
    rootRef.current?.__galleryInstance?.autoFitZoom(e.currentTarget);
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full h-screen overflow-hidden cursor-grab select-none"
      style={{ backgroundColor: bgColor, fontFamily }}
    >
      {/* Preloader */}
      <div
        ref={preloaderRef}
        className="fixed inset-0 z-[100000] flex items-center justify-center"
        style={{ backgroundColor: preloaderBg }}
      />

      {/* Header — logo only */}
      <div
        data-header
        className="fixed top-0 left-0 w-screen p-6 z-[10000] opacity-0 pointer-events-none [&>*]:pointer-events-auto"
      >
        <div className="group block w-12 h-6 relative cursor-pointer">
          <div className="relative w-full h-full">
            <span
              className="absolute rounded-full w-[1.4rem] h-[1.4rem] top-1/2 left-0 -translate-y-1/2 transition-transform duration-300 group-hover:-translate-x-2"
              style={{ backgroundColor: textColor }}
            />
            <span
              className="absolute rounded-full w-[1.4rem] h-[1.4rem] top-1/2 left-[0.8rem] -translate-y-1/2 mix-blend-exclusion transition-transform duration-300 group-hover:translate-x-2"
              style={{ backgroundColor: textColor }}
            />
          </div>
        </div>
      </div>

      {/* Viewport / Grid */}
      <div
        ref={viewportRef}
        className="fixed inset-0 w-screen h-screen overflow-hidden z-[1] opacity-0"
      >
        <div
          ref={canvasWrapperRef}
          className="absolute top-0 left-0 origin-top-left will-change-transform isolate"
        >
          <div ref={gridContainerRef} className="relative w-full h-full" />
        </div>
      </div>

      {/* Split screen zoom overlay */}
      <div
        ref={splitScreenRef}
        className="fixed inset-0 w-screen h-screen flex z-[2] opacity-0 pointer-events-none"
      >
        <div
          ref={splitLeftRef}
          className="relative w-1/2 h-screen bg-black/60 flex items-center justify-center z-[1] cursor-pointer"
        >
          <div
            ref={zoomTargetRef}
            className="w-full h-full relative flex items-center justify-center z-[1] before:content-['IMAGE_TARGET'] before:text-white/50 before:font-normal before:uppercase before:tracking-[2px] before:text-xs"
            style={{ fontFamily: monoFontFamily }}
          />
        </div>
        <div
          ref={splitRightRef}
          className="relative w-1/2 h-screen bg-black/60 flex items-center justify-center z-[1] cursor-pointer"
        />
      </div>

      {/* Image title overlay */}
      <div
        ref={titleOverlayRef}
        className="absolute bottom-10 left-10 z-[4] opacity-0 pointer-events-none text-white"
      >
        <div
          ref={slideNumberRef}
          className="relative w-[400px] h-5 mb-2 overflow-hidden [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_0%)] max-[900px]:w-[300px] max-[900px]:h-[18px]"
        >
          <span
            className="absolute top-0 left-0 text-xs font-normal leading-normal uppercase tracking-[0.1em] will-change-transform max-[900px]:text-[10px]"
            style={{ fontFamily: monoFontFamily }}
          >
            01
          </span>
        </div>
        <div
          ref={slideTitleRef}
          className="relative w-[400px] h-[60px] mb-4 overflow-hidden max-[900px]:w-[300px] max-[900px]:h-[50px]"
        >
          <h1
            className="absolute top-0 left-0 text-5xl font-medium tracking-[-0.02em] leading-tight will-change-transform max-[900px]:text-4xl"
            style={{ fontFamily }}
          >
            Title
          </h1>
        </div>
        <div
          ref={slideDescRef}
          className="relative w-[400px] min-h-[80px] overflow-hidden max-[900px]:w-[300px] max-[900px]:min-h-[70px]"
        />
      </div>

      {/* Close button */}
      <button
        ref={closeButtonRef}
        aria-label="Close zoom view"
        className="fixed top-1/2 right-5 -translate-y-1/2 translate-x-10 w-16 h-16 flex items-center justify-center z-[5] opacity-0 pointer-events-none hover:opacity-70 transition-opacity duration-200"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 16 16"
          fill="none"
          className="rotate-180"
        >
          <path
            d="M7.89873 16L6.35949 14.48L11.8278 9.08H0V6.92H11.8278L6.35949 1.52L7.89873 0L16 8L7.89873 16Z"
            fill={textColor}
          />
        </svg>
      </button>

      {/* Controls */}
      <div
        ref={controlsRef}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 flex z-[6] opacity-0 transition-[left] duration-[1200ms] [transition-timing-function:cubic-bezier(0.87,0,0.13,1)]"
      >
        <div
          ref={percentageRef}
          className="bg-neutral-100 px-5 py-2.5 rounded-l-md flex items-center justify-center text-xs font-normal uppercase text-neutral-800 min-w-[5em] whitespace-nowrap"
          style={{ fontFamily: monoFontFamily }}
        >
          60%
        </div>
        <div data-switch className="flex gap-5 bg-neutral-900 px-5 py-2.5">
          <button
            data-switch-button
            onClick={handleZoomButtonClick(zoomOutLevel)}
            className="relative bg-transparent border-0 text-neutral-500 cursor-pointer text-xs font-normal uppercase px-2.5 py-1 whitespace-nowrap transition-colors duration-300 hover:text-neutral-300"
            style={{ fontFamily: monoFontFamily }}
          >
            Zoom Out
          </button>
          <button
            data-switch-button
            onClick={handleZoomButtonClick(initialZoom)}
            className="relative bg-transparent border-0 text-white cursor-pointer text-xs font-normal uppercase px-2.5 py-1 whitespace-nowrap transition-colors duration-300"
            style={{ fontFamily: monoFontFamily }}
          >
            Normal
          </button>
          <button
            data-switch-button
            onClick={handleZoomButtonClick(zoomInLevel)}
            className="relative bg-transparent border-0 text-neutral-500 cursor-pointer text-xs font-normal uppercase px-2.5 py-1 whitespace-nowrap transition-colors duration-300 hover:text-neutral-300"
            style={{ fontFamily: monoFontFamily }}
          >
            Zoom In
          </button>
          <button
            data-switch-button
            onClick={handleFitButtonClick}
            className="relative bg-transparent border-0 text-neutral-500 cursor-pointer text-xs font-normal uppercase px-2.5 py-1 whitespace-nowrap transition-colors duration-300 hover:text-neutral-300"
            style={{ fontFamily: monoFontFamily }}
          >
            Fit
          </button>
        </div>
        <button
          ref={soundToggleRef}
          aria-label="Toggle sound"
          className="bg-neutral-100 rounded-r-md px-3 py-2 flex items-center justify-center cursor-pointer transition-all duration-300 min-w-[3.75em]"
        >
          <canvas
            ref={soundWaveCanvasRef}
            width={32}
            height={16}
            className="w-8 h-4 border-0 outline-0 bg-transparent"
          />
        </button>
      </div>

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[9998]">
        <div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 20%, transparent 40%)",
          }}
        />
      </div>
    </div>
  );
}
