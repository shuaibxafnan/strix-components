"use client";

import { useEffect, useRef } from "react";

// ─── StudioSessionsGallery ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor              string   #fafafa   Page background color
// textColor            string   #1a1a1a   Base text / ink color
// eyebrowText          string   "Studio Sessions"   Top-left header label
// cycleText            string   "∞.Cycles"          Second header label
// moodText             string   "[analog.mystic]"   Third header label
// email                string   "hi@filip.fyi"      Contact email (mailto link)
// yearLabel            string   "— 2024.25"         Text after the email
// sessionsSvgUrl       string   codepen asset       Big inverted hero SVG banner
// images               array    see DEFAULT_IMAGES  Gallery items: { src, alt, title, number, className }
//                                                    `className` sets the tailwind grid placement
//                                                    for that item (grid-column / grid-row + margin)
// fisheyeStrength      number   1.0       Max lens-bulge strength on hover
// vignetteStart        number   0.3       Distance (0-1) where vignette begins
// vignetteEnd          number   0.8       Distance (0-1) where vignette is fully applied
// fisheyeRadius        number   0.8       Radius (0-1.5) of the fisheye bulge area
// chromaticAberration  number   0.015     RGB channel split amount during distortion
// noiseIntensity       number   0.08      Grain/noise amount added during distortion
// vignetteIntensity    number   0.32      Darkening amount at the vignette edge
// mouseEffect          number   0.02      Extra UV push driven by cursor position
// mouseRadius          number   0.3       Cursor influence radius (0-1)
// animationDuration    number   0.64      Seconds for the hover fisheye ramp in/out
// canvasOpacity        number   1.0       Max opacity of the WebGL canvas while hovered
// scrollEffectStrength number   0.7       Fisheye intensity auto-triggered by fast scroll
// scrollEffectOpacity  number   0.6       Canvas opacity during the scroll-triggered effect
// scrollTriggerThreshold number 0.08      Scroll velocity needed to trigger the effect
// footerText           string   "Press D for Debug Grid — Press H for Controls" is REMOVED;
//                                default footer text shown bottom-right
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  {
    number: "01",
    src: "https://assets.codepen.io/7558/bw-blurry-001.jpg",
    alt: "Studio Session 01",
    title: "Creative Flow",
    className: "col-span-2 col-start-1",
  },
  {
    number: "03",
    src: "https://assets.codepen.io/7558/bw-blurry-002.jpg",
    alt: "Recording Session 03",
    title: "In The Moment",
    className: "col-span-2 col-start-5",
  },
  {
    number: "05",
    src: "https://assets.codepen.io/7558/bw-blurry-004.jpg",
    alt: "Producer Notes 05",
    title: "Deep Focus",
    className: "col-span-2 col-start-11",
  },
  {
    number: "06",
    src: "https://assets.codepen.io/7558/bw-blurry-005.jpg",
    alt: "Studio Portrait 06",
    title: "Behind Lens",
    className: "col-span-2 col-start-1",
  },
  {
    number: "09",
    src: "https://assets.codepen.io/7558/bw-blurry-007.jpg",
    alt: "Band Session 09",
    title: "Movement Study",
    className: "col-span-5 col-start-7",
  },
  {
    number: "11",
    src: "https://assets.codepen.io/7558/bw-blurry-006.jpg",
    alt: "Console Work 11",
    title: "Process Work",
    className: "col-span-2 col-start-1",
  },
  {
    number: "13",
    src: "https://assets.codepen.io/7558/bw-blurry-010.jpg",
    alt: "Live Room 13",
    title: "Raw Energy",
    className: "col-span-2 col-start-5",
  },
  {
    number: "17",
    src: "https://assets.codepen.io/7558/bw-blurry-011.jpg",
    alt: "Final Mix 17",
    title: "Final Take",
    className: "col-span-2 col-start-1",
  },
  {
    number: "20",
    src: "https://assets.codepen.io/7558/bw-blurry-012.jpg",
    alt: "Album Complete 20",
    title: "Complete Vision",
    className: "col-span-3 col-start-9 row-span-2 row-start-3",
  },
];

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uFisheyeIntensity;
  uniform float uFisheyeStrength;
  uniform float uVignetteStart;
  uniform float uVignetteEnd;
  uniform float uFisheyeRadius;
  uniform float uChromaticAberration;
  uniform float uNoiseIntensity;
  uniform float uVignetteIntensity;
  uniform float uMouseEffect;
  uniform float uMouseRadius;
  uniform vec2 uMouse;
  uniform float uAspectRatio;
  varying vec2 vUv;

  vec4 sampleTextureSafe(sampler2D tex, vec2 uv) {
    vec2 clampedUV = clamp(uv, 0.001, 0.999);
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      vec2 edgeUV = clamp(uv, 0.0, 1.0);
      vec4 edgeColor = texture2D(tex, edgeUV);
      float fadeX = 1.0 - smoothstep(0.0, 0.1, abs(uv.x - clamp(uv.x, 0.0, 1.0)));
      float fadeY = 1.0 - smoothstep(0.0, 0.1, abs(uv.y - clamp(uv.y, 0.0, 1.0)));
      return edgeColor * fadeX * fadeY;
    }
    return texture2D(tex, clampedUV);
  }

  vec2 fisheyeDistortion(vec2 uv, float intensity) {
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    delta.x *= uAspectRatio;
    float distance = length(delta);
    if (distance < uFisheyeRadius && distance > 0.0) {
      float percent = distance / uFisheyeRadius;
      float theta = percent * percent * intensity * uFisheyeStrength;
      float beta = max(0.00001, distance);
      delta = delta / beta * tan(theta) * beta;
    }
    delta.x /= uAspectRatio;
    return center + delta;
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    delta.x *= uAspectRatio;
    float distanceFromCenter = length(delta);
    float vignetteMask = smoothstep(uVignetteStart, uVignetteEnd, distanceFromCenter);

    vec2 finalUV = uv;
    if (uFisheyeIntensity > 0.001) {
      vec2 distortedUV = fisheyeDistortion(uv, uFisheyeIntensity);
      finalUV = mix(uv, distortedUV, vignetteMask);
      vec2 mousePos = uMouse * 0.5 + 0.5;
      float mouseDist = distance(uv, mousePos);
      float mouseEffectStrength = smoothstep(uMouseRadius, 0.0, mouseDist) * uFisheyeIntensity * uMouseEffect;
      vec2 mouseDistortion = normalize(uv - mousePos) * mouseEffectStrength;
      finalUV += mouseDistortion;
    }

    vec3 color;
    if (uFisheyeIntensity > 0.001) {
      vec2 direction = normalize(finalUV - vec2(0.5));
      float aberrationStrength = uChromaticAberration * uFisheyeIntensity;
      float r = sampleTextureSafe(uTexture, finalUV + direction * aberrationStrength).r;
      float g = sampleTextureSafe(uTexture, finalUV).g;
      float b = sampleTextureSafe(uTexture, finalUV - direction * aberrationStrength).b;
      color = vec3(r, g, b);
    } else {
      color = sampleTextureSafe(uTexture, finalUV).rgb;
    }

    if (uFisheyeIntensity > 0.001) {
      float noise = fract(sin(dot(uv * uTime * 0.05, vec2(12.9898, 78.233))) * 43758.5453) * uNoiseIntensity * uFisheyeIntensity;
      color += noise;
    }

    float vignetteEffect = 1.0 - smoothstep(uVignetteStart, uVignetteEnd, distanceFromCenter) * uVignetteIntensity;
    color *= vignetteEffect;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function StudioSessionsGallery({
  bgColor = "#fafafa",
  textColor = "#1a1a1a",
  eyebrowText = "Studio Sessions",
  cycleText = "∞.Cycles",
  moodText = "[analog.mystic]",
  sessionsSvgUrl = "https://assets.codepen.io/7558/sessions-text.svg",
  images = DEFAULT_IMAGES,
  fisheyeStrength = 1.0,
  vignetteStart = 0.3,
  vignetteEnd = 0.8,
  fisheyeRadius = 0.8,
  chromaticAberration = 0.015,
  noiseIntensity = 0.08,
  vignetteIntensity = 0.32,
  mouseEffect = 0.02,
  mouseRadius = 0.3,
  animationDuration = 0.64,
  canvasOpacity = 1.0,
  scrollEffectStrength = 0.7,
  scrollEffectOpacity = 0.6,
  scrollTriggerThreshold = 0.08,
  footerText = "Studio Sessions",
}) {
  const gridRef = useRef(null);
  const settingsRef = useRef({
    fisheyeStrength,
    vignetteStart,
    vignetteEnd,
    fisheyeRadius,
    chromaticAberration,
    noiseIntensity,
    vignetteIntensity,
    mouseEffect,
    mouseRadius,
    animationDuration,
    canvasOpacity,
    scrollEffectStrength,
    scrollEffectOpacity,
    scrollTriggerThreshold,
  });

  useEffect(() => {
    settingsRef.current = {
      fisheyeStrength,
      vignetteStart,
      vignetteEnd,
      fisheyeRadius,
      chromaticAberration,
      noiseIntensity,
      vignetteIntensity,
      mouseEffect,
      mouseRadius,
      animationDuration,
      canvasOpacity,
      scrollEffectStrength,
      scrollEffectOpacity,
      scrollTriggerThreshold,
    };
  }, [
    fisheyeStrength,
    vignetteStart,
    vignetteEnd,
    fisheyeRadius,
    chromaticAberration,
    noiseIntensity,
    vignetteIntensity,
    mouseEffect,
    mouseRadius,
    animationDuration,
    canvasOpacity,
    scrollEffectStrength,
    scrollEffectOpacity,
    scrollTriggerThreshold,
  ]);

  useEffect(() => {
    let disposed = false;
    let lenis = null;
    let rafHandle = null;
    let scrollTimeout = null;
    let scrollVelocity = 0;
    let targetScrollVelocity = 0;
    let scrollEffectActive = false;
    const allImageEffects = [];
    const allEffects = [];
    const resizeHandlers = new Map();
    const cleanupFns = [];

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

    const init = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        );
        await loadScript("https://unpkg.com/lenis@1.1.13/dist/lenis.min.js");
      } catch (e) {
        console.error("[StudioSessionsGallery] CDN load failed:", e.message);
        return;
      }

      if (disposed) return;

      const { gsap, ScrollTrigger, Lenis } = window;
      if (!gsap || !ScrollTrigger || !Lenis || !gridRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      const handleGlobalResize = (() => {
        let resizeTimeout = null;
        return () => {
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            resizeHandlers.forEach((handler) => handler());
          }, 16);
        };
      })();
      window.addEventListener("resize", handleGlobalResize);
      cleanupFns.push(() =>
        window.removeEventListener("resize", handleGlobalResize),
      );

      const activateScrollEffect = () => {
        if (scrollEffectActive) return;
        scrollEffectActive = true;
        allImageEffects.forEach((effectData) => {
          if (effectData.effect && !effectData.isHovered) {
            effectData.effect.startWithIntensity(
              settingsRef.current.scrollEffectStrength,
            );
            gsap.to(effectData.canvas, {
              opacity: settingsRef.current.scrollEffectOpacity,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        });
      };

      const deactivateScrollEffect = () => {
        if (!scrollEffectActive) return;
        scrollEffectActive = false;
        allImageEffects.forEach((effectData) => {
          if (effectData.effect && !effectData.isHovered) {
            effectData.effect.stop();
            gsap.to(effectData.canvas, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out",
            });
          }
        });
      };

      const onLenisScroll = (data) => {
        ScrollTrigger.update();
        targetScrollVelocity = Math.abs(data.velocity) * 0.02;

        if (
          targetScrollVelocity > settingsRef.current.scrollTriggerThreshold &&
          !scrollEffectActive
        ) {
          activateScrollEffect();
        }

        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          gsap.to(
            { value: scrollVelocity },
            {
              value: 0,
              duration: 0.5,
              ease: "power2.out",
              onUpdate: function () {
                scrollVelocity = this.targets()[0].value;
              },
              onComplete: () => {
                if (scrollEffectActive && scrollVelocity < 0.02)
                  deactivateScrollEffect();
              },
            },
          );
        }, 50);
      };
      lenis.on("scroll", onLenisScroll);

      const tickerFn = (time) => {
        lenis.raf(time * 1000);
        scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.15;

        gridRef.current.querySelectorAll("[data-image-box]").forEach((box) => {
          const img = box.querySelector("img");
          const isHovered = box.matches(":hover");
          if (scrollVelocity > 0.001 && !isHovered) {
            const strength = Math.min(scrollVelocity * 10, 0.1);
            img.style.filter = `grayscale(100%) contrast(1.2) drop-shadow(${strength}px 0 0 #ff0000) drop-shadow(-${strength}px 0 0 #00ffff)`;
          } else if (!isHovered) {
            img.style.filter = "grayscale(100%) contrast(1.2)";
          }
        });
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
      cleanupFns.push(() => gsap.ticker.remove(tickerFn));

      const THREE = await import("three");
      if (disposed) return;

      const createFisheyeEffect = (canvas, imageUrl) =>
        new Promise((resolve) => {
          const scene = new THREE.Scene();
          const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
          let renderer;
          let material;

          try {
            renderer = new THREE.WebGLRenderer({
              canvas,
              alpha: true,
              premultipliedAlpha: false,
              antialias: true,
            });
          } catch (e) {
            resolve(null);
            return;
          }

          const updateCanvasSize = () => {
            const container = canvas.parentElement;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const width = Math.max(1, Math.floor(rect.width));
            const height = Math.max(1, Math.floor(rect.height));
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setSize(width, height);
            renderer.setPixelRatio(pixelRatio);
            if (material) material.uniforms.uAspectRatio.value = width / height;
          };

          const textureLoader = new THREE.TextureLoader();
          textureLoader.crossOrigin = "anonymous";

          textureLoader.load(
            imageUrl,
            (texture) => {
              const geometry = new THREE.PlaneGeometry(2, 2);
              texture.wrapS = THREE.ClampToEdgeWrapping;
              texture.wrapT = THREE.ClampToEdgeWrapping;
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;

              material = new THREE.ShaderMaterial({
                uniforms: {
                  uTexture: { value: texture },
                  uTime: { value: 0 },
                  uFisheyeIntensity: { value: 0 },
                  uFisheyeStrength: {
                    value: settingsRef.current.fisheyeStrength,
                  },
                  uVignetteStart: { value: settingsRef.current.vignetteStart },
                  uVignetteEnd: { value: settingsRef.current.vignetteEnd },
                  uFisheyeRadius: { value: settingsRef.current.fisheyeRadius },
                  uChromaticAberration: {
                    value: settingsRef.current.chromaticAberration,
                  },
                  uNoiseIntensity: {
                    value: settingsRef.current.noiseIntensity,
                  },
                  uVignetteIntensity: {
                    value: settingsRef.current.vignetteIntensity,
                  },
                  uMouseEffect: { value: settingsRef.current.mouseEffect },
                  uMouseRadius: { value: settingsRef.current.mouseRadius },
                  uMouse: { value: new THREE.Vector2(0, 0) },
                  uAspectRatio: { value: 1 },
                },
                vertexShader: VERTEX_SHADER,
                fragmentShader: FRAGMENT_SHADER,
                transparent: true,
              });

              const mesh = new THREE.Mesh(geometry, material);
              scene.add(mesh);
              updateCanvasSize();

              const resizeHandler = () => updateCanvasSize();
              resizeHandlers.set(canvas, resizeHandler);

              const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                  const { width, height } = entry.contentRect;
                  if (width > 0 && height > 0) updateCanvasSize();
                }
              });
              resizeObserver.observe(canvas.parentElement || canvas);

              let animationId;
              let time = 0;
              let mouseX = 0;
              let mouseY = 0;

              const effect = {
                currentTween: null,
                _fisheyeIntensity: 0,
                start() {
                  if (this.currentTween) this.currentTween.kill();
                  this.currentTween = gsap.to(this, {
                    _fisheyeIntensity: 1,
                    duration: settingsRef.current.animationDuration,
                    ease: "cubic-bezier(0.23, 1, 0.32, 1)",
                    onComplete: () => (this.currentTween = null),
                  });
                },
                startWithIntensity(intensity) {
                  if (this.currentTween) this.currentTween.kill();
                  this.currentTween = gsap.to(this, {
                    _fisheyeIntensity: intensity,
                    duration: settingsRef.current.animationDuration,
                    ease: "cubic-bezier(0.23, 1, 0.32, 1)",
                    onComplete: () => (this.currentTween = null),
                  });
                },
                stop() {
                  if (this.currentTween) this.currentTween.kill();
                  this.currentTween = gsap.to(this, {
                    _fisheyeIntensity: 0,
                    duration: settingsRef.current.animationDuration,
                    ease: "cubic-bezier(0.23, 1, 0.32, 1)",
                    onComplete: () => (this.currentTween = null),
                  });
                },
                dispose() {
                  if (this.currentTween) this.currentTween.kill();
                  canvas.removeEventListener("mousemove", handleMouseMove);
                  resizeHandlers.delete(canvas);
                  resizeObserver.disconnect();
                  if (animationId) cancelAnimationFrame(animationId);
                  geometry.dispose();
                  material.dispose();
                  texture.dispose();
                  renderer.dispose();
                },
              };

              const animate = () => {
                time += 0.016;
                material.uniforms.uTime.value = time;
                material.uniforms.uFisheyeIntensity.value =
                  effect._fisheyeIntensity;
                material.uniforms.uMouse.value.set(mouseX, mouseY);
                renderer.render(scene, camera);
                animationId = requestAnimationFrame(animate);
              };

              const handleMouseMove = (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
              };

              canvas.addEventListener("mousemove", handleMouseMove);
              animate();
              allEffects.push(effect);
              resolve(effect);
            },
            undefined,
            () => resolve(null),
          );
        });

      const boxes = Array.from(
        gridRef.current.querySelectorAll("[data-image-box]"),
      );
      boxes.forEach((box) => {
        const img = box.querySelector("img");
        const canvas = box.querySelector("canvas");
        const title = box.parentElement.querySelector("[data-image-title]");
        if (!img || !canvas) return;

        let effect = null;
        let hoverTimeline = null;

        const initializeEffect = () => {
          createFisheyeEffect(canvas, img.src).then((createdEffect) => {
            effect = createdEffect;
            if (effect) {
              allImageEffects.push({ effect, canvas, box, isHovered: false });
            }
          });
        };

        const delay = box.dataset.priority === "true" ? 150 : 50;

        if (img.complete && img.naturalWidth > 0) {
          setTimeout(initializeEffect, delay);
        } else {
          img.addEventListener(
            "load",
            () => setTimeout(initializeEffect, delay),
            { once: true },
          );
        }

        const onEnter = () => {
          const effectData = allImageEffects.find((item) => item.box === box);
          if (effectData) effectData.isHovered = true;
          if (effect) effect.start();

          if (hoverTimeline) hoverTimeline.kill();
          hoverTimeline = gsap.timeline();
          hoverTimeline
            .to(
              img,
              {
                opacity: 0,
                duration: 0.64,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
              },
              0,
            )
            .to(
              canvas,
              {
                opacity: canvasOpacity,
                duration: 0.64,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
              },
              0,
            )
            .to(
              title,
              {
                color: "#666",
                x: 12,
                "--before-opacity": 1,
                "--before-x": "0px",
                duration: 0.2,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
              },
              0,
            );
          box.style.zIndex = "20";
        };

        const onLeave = () => {
          const effectData = allImageEffects.find((item) => item.box === box);
          if (effectData) effectData.isHovered = false;
          if (effect) effect.stop();

          if (hoverTimeline) hoverTimeline.kill();
          hoverTimeline = gsap.timeline();
          hoverTimeline
            .to(
              img,
              {
                opacity: 1,
                duration: 0.64,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
              },
              0,
            )
            .to(
              canvas,
              {
                opacity: 0,
                duration: 0.64,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
              },
              0,
            )
            .to(
              title,
              {
                color: textColor,
                x: 0,
                "--before-opacity": 0,
                "--before-x": "-8px",
                duration: 0.2,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
              },
              0,
            );
          box.style.zIndex = "1";
        };

        box.addEventListener("mouseenter", onEnter);
        box.addEventListener("mouseleave", onLeave);
        cleanupFns.push(() => {
          box.removeEventListener("mouseenter", onEnter);
          box.removeEventListener("mouseleave", onLeave);
          if (effect) effect.dispose();
        });
      });
    };

    init();

    return () => {
      disposed = true;
      if (lenis) lenis.destroy();
      if (rafHandle) cancelAnimationFrame(rafHandle);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      cleanupFns.forEach((fn) => fn());
      resizeHandlers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="w-screen min-h-screen overflow-x-hidden uppercase text-[12px]"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="w-screen relative p-8">
        <div className="grid grid-cols-12 gap-4 pb-8 mb-8 text-[12px]">
          <div className="col-span-12 grid grid-cols-12 gap-4">
            <div className="col-start-1 col-end-4">
              <p>{eyebrowText}</p>
            </div>
            <div className="col-start-4 col-end-6">
              <span>{cycleText}</span>
            </div>
            <div className="col-start-6 col-end-9">
              <span>{moodText}</span>
            </div>
          </div>
        </div>

        <div className="w-full mb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sessionsSvgUrl}
            alt="Sessions Text"
            className="w-full h-auto block invert"
          />
        </div>

        <div ref={gridRef} className="grid grid-cols-12 gap-4 relative">
          {images.map((item, i) => (
            <div
              key={item.number ?? i}
              className={`relative mb-[20vh] ${item.className}`}
            >
              <div
                data-image-box
                data-priority={i === images.length - 1 ? "true" : "false"}
                className="aspect-[4/5] bg-black relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-2 left-2 text-[10px] text-white z-[5]">
                  {item.number}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  crossOrigin="anonymous"
                  className="w-full h-full object-fill grayscale contrast-[1.2] transition-[filter] duration-100 ease-out"
                />
                <canvas className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none" />
              </div>
              <div
                data-image-title
                className="mt-2 text-[10px] relative inline-block transition-[color,transform] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] before:content-['•'] before:absolute before:-left-3 before:top-0 before:text-[#666] before:opacity-[var(--before-opacity,0)] before:[transform:translateX(var(--before-x,-8px))] before:transition-[opacity,transform] before:duration-200 before:[transition-timing-function:cubic-bezier(0.23,1,0.32,1)]"
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-8 right-8 text-[10px] text-[#666] z-[1000]">
          {footerText}
        </div>
      </div>
    </div>
  );
}
