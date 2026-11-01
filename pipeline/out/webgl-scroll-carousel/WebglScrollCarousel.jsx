"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=1080&q=80",
];

export default function WebglScrollCarousel({
  watermarkText = "Culture",
  watermarkOpacity = 0.05,
  watermarkFontSize = "35vw",
  scrollPinLength = "+=500%",
  watermarkPinLength = "+=600%",
  watermarkStartX = "20%",
  watermarkEndX = "-60%",
  lenisDuration = 1.2,
  cameraZ = 1.75,
  cameraY = 0.3,
  cameraRotationZ = 0.01,
  planeWidth = 1,
  planeHeight = 0.75,
  planeSpacing = 1.1,
  planeRotationY = 0.03,
  velocityScale = 0.00002,
  images = DEFAULT_IMAGES,
  className = "",
}) {
  const watermarkWrapRef = useRef(null);
  const watermarkTextRef = useRef(null);
  const carouselWrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let lenisInstance = null;
    let rafId = null;
    let renderRafId = null;
    let disposed = false;
    let cleanup = null;

    const init = async () => {
      try {
        const [{ default: Lenis }, gsapMod, stMod, THREE] = await Promise.all([
          import("@studio-freight/lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("three"),
        ]);
        if (disposed || !canvasRef.current) return;
        const gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;

        gsap.registerPlugin(ScrollTrigger);

        lenisInstance = new Lenis({
          duration: lenisDuration,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: "vertical",
          gestureDirection: "vertical",
          smooth: true,
          mouseMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false,
        });

        const lenisRaf = (time) => {
          lenisInstance.raf(time);
          rafId = requestAnimationFrame(lenisRaf);
        };
        rafId = requestAnimationFrame(lenisRaf);

        const tlWatermark = gsap.timeline({
          scrollTrigger: {
            trigger: watermarkWrapRef.current,
            start: "top top",
            end: watermarkPinLength,
            scrub: true,
            pin: true,
            pinSpacing: false,
          },
          defaults: { ease: "none" },
        });

        tlWatermark.fromTo(
          watermarkTextRef.current,
          { x: watermarkStartX },
          { x: watermarkEndX },
        );

        const st = ScrollTrigger.create({
          trigger: carouselWrapRef.current,
          start: "top top",
          end: scrollPinLength,
          pin: true,
        });

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
          50,
          window.innerWidth / window.innerHeight,
          0.1,
          100,
        );
        camera.position.z = cameraZ;
        camera.position.y = cameraY;
        camera.rotation.z = 2 * Math.PI * cameraRotationZ;

        const textureLoader = new THREE.TextureLoader();
        const textures = images.map((img) => textureLoader.load(img));

        const geometry = new THREE.PlaneGeometry(
          planeWidth,
          planeHeight,
          10,
          10,
        );
        const uOffset = new THREE.Vector2(0, 0);

        const vertexShader = `
          float PI = 3.141592653589793;
          uniform vec2 uOffset;
          varying vec2 vUv;

          vec3 deformationCurve(vec3 position, vec2 uv) {
            position.x = position.x - (sin(uv.y * PI) * uOffset.x);
            return position;
          }

          void main() {
            vUv = uv;
            vec3 newPosition = deformationCurve(position, uv);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `;

        const fragmentShader = `
          uniform vec2 uOffset;
          uniform sampler2D uTexture;
          uniform float uAlpha;
          varying vec2 vUv;

          vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
            vec2 rg = texture2D(textureImage, uv).rg;
            float b = texture2D(textureImage, uv + offset).b;
            return vec3(rg, b);
          }

          void main() {
            vec3 color = rgbShift(uTexture, vUv, uOffset);
            gl_FragColor = vec4(color, uAlpha);
          }
        `;

        const items = [];
        for (let i = 0; i < textures.length; i++) {
          const mesh = new THREE.Mesh(
            geometry,
            new THREE.ShaderMaterial({
              uniforms: {
                uOffset: { value: uOffset },
                uTexture: { value: textures[i] },
                uAlpha: { value: 1.0 },
              },
              vertexShader,
              fragmentShader,
            }),
          );
          items.push({ mesh, index: i });
          scene.add(mesh);
        }

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        let resizeTimer;
        const onResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }, 300);
        };
        window.addEventListener("resize", onResize);

        const totalTravel = (items.length - 1) * planeSpacing;

        const updateMeshes = () => {
          const groupOffset = st.progress * totalTravel;
          items.forEach((item) => {
            item.mesh.position.x = planeSpacing * item.index - groupOffset;
            item.mesh.rotation.y = 2 * Math.PI * planeRotationY;
          });
        };

        const render = () => {
          if (st.isActive) {
            uOffset.set(st.getVelocity() * velocityScale, 0);
          } else {
            uOffset.set(0, 0);
          }

          updateMeshes();
          renderer.render(scene, camera);
          renderRafId = requestAnimationFrame(render);
        };
        renderRafId = requestAnimationFrame(render);

        cleanup = () => {
          window.removeEventListener("resize", onResize);
          clearTimeout(resizeTimer);
          cancelAnimationFrame(rafId);
          cancelAnimationFrame(renderRafId);
          lenisInstance?.destroy?.();
          renderer.dispose();
          ScrollTrigger.getAll().forEach((t) => t.kill());
        };
      } catch (e) {
        console.error(e);
      }
    };

    init();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [
    watermarkPinLength,
    watermarkStartX,
    watermarkEndX,
    scrollPinLength,
    lenisDuration,
    cameraZ,
    cameraY,
    cameraRotationZ,
    planeWidth,
    planeHeight,
    planeSpacing,
    planeRotationY,
    velocityScale,
    images,
  ]);

  return (
    <div className={`w-full overflow-x-hidden ${className}`}>
      <div ref={watermarkWrapRef} className="overflow-hidden w-full">
        <span
          ref={watermarkTextRef}
          className="inline-block font-black uppercase leading-none pointer-events-none select-none"
          style={{
            fontSize: watermarkFontSize,
            opacity: watermarkOpacity,
            fontFamily:
              "'Clash Display', 'Open Sans', 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {watermarkText}
        </span>
      </div>

      <div ref={carouselWrapRef} className="w-full h-screen overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
