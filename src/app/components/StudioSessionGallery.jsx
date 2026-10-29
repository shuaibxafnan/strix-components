"use client";

import { useEffect, useRef } from "react";
import { Instrument_Serif } from "next/font/google";

const titleFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const DEFAULT_IMAGES = [
  {
    number: "01",
    src: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=480&q=80",
    alt: "Studio Session 01",
    title: "Creative Flow",
    className: "col-span-2 col-start-1",
  },
  {
    number: "03",
    src: "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=480&q=80",
    alt: "Recording Session 03",
    title: "In The Moment",
    className: "col-span-2 col-start-5",
  },
  {
    number: "05",
    src: "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=480&q=80",
    alt: "Producer Notes 05",
    title: "Deep Focus",
    className: "col-span-2 col-start-11",
  },
  {
    number: "06",
    src: "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=480&q=80",
    alt: "Studio Portrait 06",
    title: "Behind Lens",
    className: "col-span-2 col-start-1",
  },
  {
    number: "09",
    src: "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    alt: "Band Session 09",
    title: "Movement Study",
    className: "col-span-5 col-start-7",
  },
  {
    number: "11",
    src: "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=480&q=80",
    alt: "Console Work 11",
    title: "Process Work",
    className: "col-span-2 col-start-1",
  },
  {
    number: "13",
    src: "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=480&q=80",
    alt: "Live Room 13",
    title: "Raw Energy",
    className: "col-span-2 col-start-5",
  },
  {
    number: "17",
    src: "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=480&q=80",
    alt: "Final Mix 17",
    title: "Final Take",
    className: "col-span-2 col-start-1",
  },
  {
    number: "20",
    src: "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
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
  title = "Sessions",
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
}) {
  const gridRef = useRef(null);
  const settingsRef = useRef({});

  settingsRef.current = {
    textColor,
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
  };

  useEffect(() => {
    let disposed = false;
    const resizeHandlers = new Map();
    const cleanupFns = [];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (window.gsap) {
          resolve();
          return;
        }
        const existing = document.querySelector(`script[data-id="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === "true") {
            resolve();
            return;
          }
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error(`Failed: ${src}`)),
            { once: true },
          );
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = () => {
          el.dataset.loaded = "true";
          resolve();
        };
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    const init = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        );
      } catch (e) {
        console.error("[StudioSessionsGallery] CDN load failed:", e.message);
        return;
      }

      if (disposed) return;

      const { gsap } = window;
      if (!gsap || !gridRef.current) return;

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

              resizeHandlers.set(canvas, updateCanvasSize);

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
                opacity: settingsRef.current.canvasOpacity,
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
                color: settingsRef.current.textColor,
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
          if (hoverTimeline) hoverTimeline.kill();
          if (effect) effect.dispose();
        });
      });
    };

    init();

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
      resizeHandlers.clear();
    };
  }, []);

  return (
    <div
      className="w-screen min-h-screen overflow-x-hidden uppercase text-[12px]"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="w-screen relative p-8">
        <h1
          className={`${titleFont.className} w-full mb-16 text-4xl md:text-5xl italic normal-case tracking-tight`}
        >
          {title}
        </h1>

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
                <img
                  src={item.src}
                  alt={item.alt}
                  crossOrigin="anonymous"
                  className="w-full h-full object-fill grayscale contrast-[1.2]"
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
      </div>
    </div>
  );
}