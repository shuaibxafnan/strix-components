"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    id: 1,
    title: "Abstract Luminescence",
    category: "Digital Art",
    src: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=80",
    size: "md:col-span-2 md:row-span-2 min-h-[320px] md:min-h-auto",
  },
  {
    id: 2,
    title: "Neon Horizon",
    category: "CGI / Motion",
    src: "https://images.unsplash.com/photo-1519607641169-6b8a9b9b1c0b?auto=format&fit=crop&w=1600&q=80",
    size: "md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-auto",
  },
  {
    id: 3,
    title: "Chroma Vapor",
    category: "Vaporwave Aesthetic",
    src: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1600&q=80",
    size: "md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-auto",
  },
  {
    id: 4,
    title: "Cybernetic Oasis",
    category: "Surrealism",
    src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80",
    size: "md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-auto",
  },
  {
    id: 5,
    title: "Liquid Prismatic",
    category: "3D Experiment",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    size: "md:col-span-2 md:row-span-1 min-h-[160px] md:min-h-auto",
  },
  {
    id: 6,
    title: "Gilded Velvet",
    category: "Fine Grain Art",
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    size: "md:col-span-3 md:row-span-1 min-h-[160px] md:min-h-auto",
  },
];

export default function RippleLiquidGallery({
  items = DEFAULT_ITEMS,
  rippleStrength = 0.15,
  rippleSpeed = 1.8,
  rippleFrequency = 14.0,
  animationDuration = 0.6,
  backgroundColor = "#0a0a0c",
  textColor = "#f3f4f6",
  accentColor = "#00f2fe",
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let activeInstances = [];
    let handleResize = null;

    const init = async () => {
      const [THREE, gsapModule] = await Promise.all([
        import("three"),
        import("gsap"),
      ]);
      const gsap = gsapModule.gsap || gsapModule.default;
      if (cancelled || !containerRef.current) return;

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
          if (cancelled) {
            texture.dispose();
            return;
          }
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

        const instance = {
          canvas,
          renderer,
          material,
          geometry,
          animationFrameId: 0,
        };

        const animate = () => {
          instance.animationFrameId = requestAnimationFrame(animate);
          material.uniforms.uTime.value += 0.04;
          renderer.render(scene, camera);
        };
        animate();

        const handleMouseMove = (event) => {
          const rect = canvas.getBoundingClientRect();
          material.uniforms.uMouse.value.set(
            (event.clientX - rect.left) / rect.width,
            1.0 - (event.clientY - rect.top) / rect.height,
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

        instance.gsap = gsap;
        instance.handlers = { handleMouseMove, handleMouseEnter, handleMouseLeave };
        activeInstances.push(instance);
      });

      handleResize = () => {
        activeInstances.forEach(({ canvas, renderer, material }) => {
          renderer.setSize(canvas.clientWidth, canvas.clientHeight);
          material.uniforms.uCanvasAspect.value =
            canvas.clientWidth / canvas.clientHeight;
        });
      };
      window.addEventListener("resize", handleResize);
    };

    init();

    return () => {
      cancelled = true;
      if (handleResize) window.removeEventListener("resize", handleResize);

      activeInstances.forEach(
        ({ canvas, renderer, material, geometry, animationFrameId, handlers, gsap }) => {
          cancelAnimationFrame(animationFrameId);
          gsap.killTweensOf(material.uniforms.uHover);

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
      activeInstances = [];
    };
  }, [items, rippleStrength, rippleSpeed, rippleFrequency, animationDuration]);

  return (
    <div
      ref={containerRef}
      className={`w-full px-6 py-16 md:px-12 ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto md:auto-rows-[170px]">
        {items.map((item) => (
          <div
            key={item.id}
            className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/50 transition-all duration-500 hover:border-white/[0.15] hover:shadow-[0_0_50px_rgba(0,242,254,0.05)] flex ${item.size}`}
          >
            <canvas
              className="webgl-canvas w-full h-full block cursor-crosshair transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              data-image={item.src}
            />

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" />

            <div className="absolute bottom-0 left-0 w-full p-6 pointer-events-none flex flex-col justify-end transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
              <span
                className="text-[10px] uppercase tracking-widest mb-1 font-mono opacity-0 transition-all duration-500 delay-75 group-hover:opacity-100"
                style={{ color: accentColor }}
              >
                {item.category}
              </span>
              <h3 className="text-lg font-medium text-white tracking-wide opacity-80 transition-opacity duration-500 group-hover:opacity-100">
                {item.title}
              </h3>
            </div>

            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
