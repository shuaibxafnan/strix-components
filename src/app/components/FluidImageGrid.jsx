"use client";

import { useEffect, useRef } from "react";

// ─── ModernFluidGrid ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            array     [...]     List of image source URLs to populate the grid
// columnsDesktop    number    3         Grid columns shown on desktop viewport width (> 600px)
// columnsMobile     number    1         Grid columns shown on mobile viewport width (< 600px)
// spacingX          number    2.0       Horizontal padding space scaling factor between meshes
// spacingY          number    2.0       Vertical padding space scaling factor between meshes
// planeSizeDesktop  number    1.4       Dimensions multiplier for WebGL meshes on desktop viewports
// planeSizeMobile   number    2.2       Dimensions multiplier for WebGL meshes on mobile screens
// liquidSpeed       number    0.01      Time delta scale speed driving the continuous background noise waves
// waveStrength      number    1.5       Interaction factor scaling the mesh bend on hover state changes
// lerpFactor        number    0.06      Slerp/lerp exponential decay parameter for smooth movement physics
// accentColor       string    #3b82f6   Tailwind configuration highlight color applied to micro elements
// ──────────────────────────────────────────────────────────────────────────

export default function ModernFluidGrid({
  images = [
    "https://images.unsplash.com/photo-1576506542790-51244b486a6b?q=80&w=687&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1170&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1749916884078-e8359b2adcdd?q=80&w=687&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1751554827598-c96cb294c0e6?q=80&w=1170&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1750117839548-0500942b9dfe?q=80&w=1170&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1752643719885-d3a7408ec711?q=80&w=1332&auto=format&fit=crop",
  ],
  columnsDesktop = 3,
  columnsMobile = 1,
  spacingX = 2.0,
  spacingY = 2.0,
  planeSizeDesktop = 1.4,
  planeSizeMobile = 2.2,
  liquidSpeed = 0.01,
  waveStrength = 1.5,
  lerpFactor = 0.06,
  accentColor = "bg-blue-500",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let container = containerRef.current;
    let canvas = canvasRef.current;
    if (!container || !canvas) return;

    let THREE, Fancybox;
    let scene,
      camera,
      renderer,
      planes = [];
    let raycaster, mouse;
    let currentColumns = columnsDesktop;
    let currentPlaneSize = planeSizeDesktop;
    let animationFrameId;

    const loadDependencies = async () => {
      const threeUrl =
        "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
      const fancyboxUrl =
        "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.esm.js";

      const threeModule = await import(/* webpackIgnore: true */ threeUrl);
      THREE = threeModule;

      const fancyboxModule = await import(
        /* webpackIgnore: true */ fancyboxUrl
      );
      Fancybox = fancyboxModule.Fancybox;

      if (!document.querySelector('link[href*="fancybox.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css";
        document.head.appendChild(link);
      }
    };

    const initWebGL = () => {
      scene = new THREE.Scene();

      const width = container.clientWidth;
      const height = container.clientHeight;

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 6.5;

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2(-999, -999); // Offscreen initialization to prevent unintended hover shifts

      const loader = new THREE.TextureLoader();

      images.forEach((img, i) => {
        const texture = loader.load(img);
        const planeUniforms = {
          uTime: { value: 0 },
          uTexture: { value: texture },
          uStrength: { value: 0 },
          uHoverTime: { value: 0 },
        };

        const material = new THREE.ShaderMaterial({
          uniforms: planeUniforms,
          vertexShader: `
            precision mediump float;
            uniform float uTime;
            uniform float uStrength;
            uniform float uHoverTime;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                float individualTime = uTime + float(${i}) * 0.35;
                pos.z += uStrength * 0.18 * sin(individualTime * 2.5 + pos.x * 7.0) * cos(individualTime * 2.5 + pos.y * 7.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: `
            precision mediump float;
            uniform float uTime;
            uniform float uStrength;
            uniform float uHoverTime;
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main() {
                vec2 uv = vUv;
                float individualTime = uTime + float(${i}) * 0.35;
                vec2 aspect = vec2(1.0, 1.0);
                vec2 imageUv = (uv - 0.5) / aspect + 0.5;
                imageUv = clamp(imageUv, 0.0, 1.0);
                imageUv.y += uStrength * 0.025 * sin(imageUv.x * 12.0 + individualTime * 3.5);
                imageUv.x += uStrength * 0.025 * cos(imageUv.y * 12.0 + individualTime * 3.5);
                gl_FragColor = texture2D(uTexture, imageUv);
            }
          `,
          transparent: true,
        });

        const geometry = new THREE.PlaneGeometry(
          currentPlaneSize,
          currentPlaneSize,
          32,
          32,
        );
        const mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);
        planes.push({
          mesh: mesh,
          uniforms: planeUniforms,
          isHovering: false,
          imgSrc: img,
          targetStrength: 0,
        });
      });

      layoutGrid();

      window.addEventListener("resize", handleResize);
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
      container.addEventListener("click", handleMouseClick);

      animate();
    };

    const layoutGrid = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;

      if (width < 600) {
        currentColumns = columnsMobile;
        currentPlaneSize = planeSizeMobile;
      } else {
        currentColumns = columnsDesktop;
        currentPlaneSize = planeSizeDesktop;
      }

      const totalRows = Math.ceil(planes.length / currentColumns);

      planes.forEach((p, i) => {
        const col = i % currentColumns;
        const row = Math.floor(i / currentColumns);

        p.mesh.geometry.dispose();
        p.mesh.geometry = new THREE.PlaneGeometry(
          currentPlaneSize,
          currentPlaneSize,
          32,
          32,
        );

        // Center matrix geometry perfectly across both screen dimensions
        const originX = (col - (currentColumns - 1) / 2) * spacingX;
        const originY = ((totalRows - 1) / 2 - row) * spacingY;

        p.mesh.position.x = originX;
        p.mesh.position.y = originY;

        p.targetStrength = 0;
        p.uniforms.uStrength.value = 0;
      });
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planes.map((p) => p.mesh));

      container.style.cursor = intersects.length > 0 ? "pointer" : "default";

      planes.forEach((planeData) => {
        const { mesh } = planeData;
        const isHit = intersects.find((hit) => hit.object === mesh);
        if (isHit) {
          if (!planeData.isHovering) {
            planeData.isHovering = true;
            planeData.targetStrength = waveStrength;
          }
        } else {
          if (planeData.isHovering) {
            planeData.isHovering = false;
            planeData.targetStrength = 0;
          }
        }
      });
    };

    const handleMouseLeave = () => {
      mouse.set(-999, -999);
      planes.forEach((planeData) => {
        planeData.isHovering = false;
        planeData.targetStrength = 0;
      });
      container.style.cursor = "default";
    };

    const handleMouseClick = (e) => {
      if (mouse.x === -999) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planes.map((p) => p.mesh));

      if (intersects.length > 0) {
        const clickedPlane = planes.find(
          (p) => p.mesh === intersects[0].object,
        );
        if (clickedPlane && Fancybox) {
          Fancybox.show([{ src: clickedPlane.imgSrc, type: "image" }]);
        }
      }
    };

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      layoutGrid();
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      planes.forEach(({ uniforms, targetStrength }) => {
        uniforms.uTime.value += liquidSpeed;
        uniforms.uHoverTime.value += 0.015;

        const strengthDiff = targetStrength - uniforms.uStrength.value;
        uniforms.uStrength.value += strengthDiff * lerpFactor;

        if (Math.abs(uniforms.uStrength.value) < 0.001) {
          uniforms.uStrength.value = 0;
        }
      });

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    loadDependencies()
      .then(() => {
        initWebGL();
      })
      .catch((err) =>
        console.error("Error configuration loading failed:", err),
      );

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
        container.removeEventListener("click", handleMouseClick);
      }
      planes.forEach((p) => {
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        if (p.mesh.material) p.mesh.material.dispose();
      });
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [
    images,
    columnsDesktop,
    columnsMobile,
    spacingX,
    spacingY,
    planeSizeDesktop,
    planeSizeMobile,
    liquidSpeed,
    waveStrength,
    lerpFactor,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#070709] font-['Poppins',_sans-serif] overflow-hidden select-none flex items-center justify-center antialiased"
    >
      {/* Dynamic Background Noise Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,25,35,0.4)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40 z-0" />

      {/* Futuristic Border Frame Overlays */}
      <div className="absolute top-6 left-6 right-6 bottom-6 border border-white/[0.04] pointer-events-none z-20 rounded-xl">
        <div
          className={`absolute top-0 left-10 w-24 h-[2px] ${accentColor} opacity-70`}
        />
        <div className="absolute bottom-0 right-10 w-24 h-[2px] bg-white/20" />
      </div>

      {/* Cyber HUD Minimal Header UI */}
      <div className="absolute top-10 left-12 right-12 flex justify-between items-center z-30 pointer-events-none mix-blend-difference">
        <div className="flex items-center space-x-3">
          <span
            className={`w-[6px] h-[6px] rounded-full ${accentColor} animate-pulse`}
          />
          <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-white/50">
            Fluid Engine v1.6
          </p>
        </div>
      </div>

      {/* Perfectly Positioned Interactive WebGL Engine */}
      <canvas
        ref={canvasRef}
        id="webgl"
        className="block relative z-10 max-w-full max-h-full outline-none"
      />

      {/* Interaction Signifier Hint Footer */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
        <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-light translate-y-0 hover:translate-y-[-2px] transition-transform duration-300">
          [ Hover to distort / Click to expand ]
        </p>
      </div>
    </div>
  );
}
