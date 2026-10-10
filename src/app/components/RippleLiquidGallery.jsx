"use client";

import { useEffect, useRef, useState } from "react";

// ─── RippleLiquidGallery ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              Array       [...]       Array of items with images & text
// rippleStrength     number      0.15        Intensity of WebGL wave distortion
// rippleSpeed        number      1.8         Velocity of wave propagation
// rippleFrequency    number      14.0        Density/tightness of wave rings
// animationDuration  number      0.6         GSAP blend duration (seconds)
// ──────────────────────────────────────────────────────────────────────────

const LOCKED_BENTO_ITEMS = [
  {
    id: 1,
    title: "Abstract Luminescence",
    category: "Digital Art",
    src: "https://cdn.dribbble.com/userupload/15845431/file/original-7cb3b3121ef8688728259541f449aa90.png?resize=1024x768&vertical=center",
    size: "md:col-span-2 md:row-span-2 min-h-[320px] md:min-h-auto", // Big Hero Block (Top Left)
  },
  {
    id: 2,
    title: "Neon Horizon",
    category: "CGI / Motion",
    src: "https://cdn.dribbble.com/userupload/20812023/file/original-f847da681530f812dd38e256eff7bfc9.png?resize=1024x768&vertical=center",
    size: "md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-auto", // Upper Right Slot
  },
  {
    id: 3,
    title: "Chroma Vapor",
    category: "Vaporwave Aesthetic",
    src: "https://cdn.dribbble.com/userupload/42761901/file/original-be28570edb00fadcbd4adb574a8aac5d.png?resize=1024x768&vertical=center",
    size: "md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-auto", // Middle Right Slot (Completes Hero Height)
  },
  {
    id: 4,
    title: "Cybernetic Oasis",
    category: "Surrealism",
    src: "https://cdn.dribbble.com/userupload/16578759/file/original-22d4b6fd5cf661342470f433ea9e9656.png?resize=1024x1024&vertical=center",
    size: "md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-auto", // Lower Left Slot
  },
  {
    id: 5,
    title: "Liquid Prismatic",
    category: "3D Experiment",
    src: "https://cdn.dribbble.com/userupload/16588483/file/original-46d9db02da77a89dbf219607d15e5f3d.png?resize=1024x768&vertical=center",
    size: "md:col-span-2 md:row-span-1 min-h-[160px] md:min-h-auto", // Lower Right Wide Slot (Completes Row 3)
  },
  {
    id: 6,
    title: "Gilded Velvet",
    category: "Fine Grain Art",
    src: "https://cdn.dribbble.com/userupload/16204274/file/original-24f91da70cb6de87ca4fdcd75d00ec00.jpg?resize=1024x683&vertical=center",
    size: "md:col-span-3 md:row-span-1 min-h-[160px] md:min-h-auto", // Full-Width Panoramic Base Row
  },
];

export default function RippleLiquidGallery({
  items = LOCKED_BENTO_ITEMS,
  rippleStrength = 0.15,
  rippleSpeed = 1.8,
  rippleFrequency = 14.0,
  animationDuration = 0.6,
}) {
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let activeInstances = [];

    const loadScript = (src, id) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${id}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", id);
        el.async = true;
        el.onload = resolve;
        el.onerror = () =>
          reject(new Error(`Failed to load dependency: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        "three-js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        "gsap-js",
      ),
    ])
      .then(() => {
        const THREE = window.THREE;
        const gsap = window.gsap;

        if (!THREE || !gsap || !containerRef.current) return;

        const canvases = containerRef.current.querySelectorAll(".webgl-canvas");
        const textureLoader = new THREE.TextureLoader();

        canvases.forEach((canvas) => {
          const imageUrl = canvas.getAttribute("data-image");
          if (!imageUrl) return;

          const scene = new THREE.Scene();
          const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
          camera.position.z = 1;

          const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
          });
          renderer.setSize(canvas.clientWidth, canvas.clientHeight);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

          const geometry = new THREE.PlaneGeometry(2, 2);

          const material = new THREE.ShaderMaterial({
            uniforms: {
              uTexture: { value: null },
              uTime: { value: 0 },
              uMouse: { value: new THREE.Vector2(0.5, 0.5) },
              uHover: { value: 0 },
              uRippleStrength: { value: rippleStrength },
              uRippleSpeed: { value: rippleSpeed },
              uRippleFrequency: { value: rippleFrequency },
              uImageAspect: { value: 1.0 },
              uCanvasAspect: {
                value: canvas.clientWidth / canvas.clientHeight,
              },
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform sampler2D uTexture;
              uniform float uTime;
              uniform vec2 uMouse;
              uniform float uHover;
              uniform float uRippleStrength;
              uniform float uRippleSpeed;
              uniform float uRippleFrequency;
              uniform float uImageAspect;
              uniform float uCanvasAspect;
              varying vec2 vUv;

              void main() {
                // Real-time object-fit cover math computations
                vec2 ratio = vec2(
                  min(uCanvasAspect / uImageAspect, 1.0),
                  min(uImageAspect / uCanvasAspect, 1.0)
                );
                
                vec2 fixedUv = vec2(
                  vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
                  vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
                );

                float dist = distance(vUv, uMouse);
                float ripple = sin(dist * uRippleFrequency - uTime * uRippleSpeed) * uHover * uRippleStrength;
                
                fixedUv += ripple * 0.04;
                
                vec4 color = texture2D(uTexture, fixedUv);
                gl_FragColor = color;
              }
            `,
          });

          textureLoader.load(imageUrl, (texture) => {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;

            material.uniforms.uTexture.value = texture;
            material.uniforms.uImageAspect.value =
              texture.image.width / texture.image.height;
            material.uniforms.uCanvasAspect.value =
              canvas.clientWidth / canvas.clientHeight;
          });

          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);

          let animationFrameId;
          const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            material.uniforms.uTime.value += 0.04;
            renderer.render(scene, camera);
          };
          animate();

          const mousePosition = new THREE.Vector2(0.5, 0.5);

          const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            mousePosition.x = (event.clientX - rect.left) / rect.width;
            mousePosition.y = 1.0 - (event.clientY - rect.top) / rect.height;
            material.uniforms.uMouse.value.set(
              mousePosition.x,
              mousePosition.y,
            );
          };

          const handleMouseEnter = () => {
            gsap.to(material.uniforms.uHover, {
              value: 1,
              duration: animationDuration,
              ease: "expo.out",
            });
          };

          const handleMouseLeave = () => {
            gsap.to(material.uniforms.uHover, {
              value: 0,
              duration: animationDuration,
              ease: "power3.out",
            });
          };

          canvas.addEventListener("mousemove", handleMouseMove);
          canvas.addEventListener("mouseenter", handleMouseEnter);
          canvas.addEventListener("mouseleave", handleMouseLeave);

          activeInstances.push({
            canvas,
            renderer,
            material,
            geometry,
            animationFrameId,
            handlers: { handleMouseMove, handleMouseEnter, handleMouseLeave },
          });
        });

        const handleResize = () => {
          activeInstances.forEach(({ canvas, renderer, material }) => {
            if (canvas && renderer && material) {
              renderer.setSize(canvas.clientWidth, canvas.clientHeight);
              material.uniforms.uCanvasAspect.value =
                canvas.clientWidth / canvas.clientHeight;
            }
          });
        };
        window.addEventListener("resize", handleResize);
        containerRef.current.resizeHandler = handleResize;
      })
      .catch((err) =>
        console.error("[ModernRippleGallery] Engine error:", err),
      );

    return () => {
      if (containerRef.current?.resizeHandler) {
        window.removeEventListener(
          "resize",
          containerRef.current.resizeHandler,
        );
      }

      activeInstances.forEach(
        ({
          canvas,
          renderer,
          material,
          geometry,
          animationFrameId,
          handlers,
        }) => {
          cancelAnimationFrame(animationFrameId);

          canvas.removeEventListener("mousemove", handlers.handleMouseMove);
          canvas.removeEventListener("mouseenter", handlers.handleMouseEnter);
          canvas.removeEventListener("mouseleave", handlers.handleMouseLeave);

          if (material.uniforms.uTexture.value)
            material.uniforms.uTexture.value.dispose();
          material.dispose();
          geometry.dispose();
          renderer.dispose();
        },
      );
    };
  }, [
    isMounted,
    items,
    rippleStrength,
    rippleSpeed,
    rippleFrequency,
    animationDuration,
  ]);

  if (!isMounted) {
    return <div className="w-full min-h-screen bg-[#0a0a0c]" />;
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-[#0a0a0c] text-[#f3f4f6] px-6 py-16 md:px-12"
    >
      {/* Header Context Banner */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#00f2fe] uppercase mb-2">
            Interactive Showcase
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#e5e7eb] to-zinc-500">
            Fluid Motion.
          </h1>
        </div>
        <p className="max-w-sm text-sm text-zinc-400 font-light leading-relaxed">
          An error-free structural bento grid mapping interactive liquid
          interactions seamlessly across locked visual spaces.
        </p>
      </div>

      {/* Flawless Fully Interlocked Bento Grid Framework */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto md:auto-rows-[170px]">
        {items.map((item) => (
          <div
            key={item.id}
            className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/50 transition-all duration-500 hover:border-white/[0.15] hover:shadow-[0_0_50px_rgba(0,242,254,0.05)] flex ${item.size}`}
          >
            {/* Scale-Invariant Dynamic WebGL Layer */}
            <canvas
              className="webgl-canvas w-full h-full block cursor-crosshair transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              data-image={item.src}
            />

            {/* Layout Typography Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" />

            <div className="absolute bottom-0 left-0 w-full p-6 pointer-events-none flex flex-col justify-end transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
              <span className="text-[10px] uppercase tracking-widest text-[#00f2fe] mb-1 font-mono opacity-0 transition-all duration-500 delay-70 group-hover:opacity-100">
                {item.category}
              </span>
              <h3 className="text-lg font-medium text-white tracking-wide opacity-80 transition-opacity duration-500 group-hover:opacity-100">
                {item.title}
              </h3>
            </div>

            {/* Shimmer Border Accent */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
