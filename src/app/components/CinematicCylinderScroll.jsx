"use client";

import { useEffect, useRef, useState } from "react";
import {
  Renderer,
  Camera,
  Transform,
  Texture,
  Program,
  Mesh,
  Geometry,
} from "ogl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ─── CinematicCylinderScroll ─────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor              string    #000000    Page / canvas background color
// loaderBg             string    #000000    Loader overlay background
// loaderBarColor       string    #ffffff    Loader animated bar color
// textColor            string    #ffffff    Perspective heading/description color
// images               string[]  (25 items) Unsplash URLs painted around the cylinder wall
// perspectives         object[]  (4 items)  Scroll narrative overlays: {title, description, position}
//                                            position: "top" | "top-left" | "left" | "center" |
//                                            "top-right" | "bottom" | "bottom-left" | "bottom-right"
// cylinderRadius        number   2.5         Base cylinder radius on desktop
// cylinderRadiusTablet  number   2.2         Cylinder radius between mobileBreakpoint and tabletBreakpoint
// cylinderRadiusMobile  number   1.8         Cylinder radius below mobileBreakpoint
// cylinderHeight         number   2           Base cylinder height (drives texture aspect-ratio correction)
// cylinderRadialSegments number  64          Radial segment count of the cylinder geometry
// cylinderDarkness       number   0.3         uDarkness shader uniform, 0 = normal, 1 = fully black
// imageTileWidth         number   1024        Source width (px) each image is drawn at before atlas packing
// imageTileHeight        number   1024        Source height (px) each image is drawn at before atlas packing
// cameraFovDesktop       number   45          Camera field of view above mobileBreakpoint
// cameraFovMobile        number   50          Camera field of view below mobileBreakpoint
// cameraZDesktop         number   8           Camera resting Z above tabletBreakpoint
// cameraZTablet          number   7           Camera resting Z between mobileBreakpoint and tabletBreakpoint
// cameraZMobile          number   6           Camera resting Z below mobileBreakpoint
// mobileBreakpoint       number   768         Width (px) below which mobile sizing applies
// tabletBreakpoint       number   1024        Width (px) below which tablet sizing applies
// maxDPR                 number   2           Device pixel ratio cap passed to the renderer
// scrollLength           string   "500svh"    Height of the scroll-driving spacer; controls total animation length
// scrollScrub            number   1           ScrollTrigger scrub value for the camera/rotation timeline
// rotationRadians        number   28.27       Total cylinder Y-rotation (radians) across the whole scroll
// cameraKeyframes        object[] (5 items)   Camera path: [{x, y, z, duration, ease}], played in sequence
// textScrub              number   0.8         ScrollTrigger scrub value for each perspective text fade
// particlesEnabled       bool     true        Toggle the speed-reactive particle trails
// numParticles           number   12          Number of particle trail lines
// particleRadiusOffset   number   0.8         Distance added to cylinderRadius to place particles just outside it
// particleSegments       number   20          Points per particle line
// particleAngleSpan      number   0.3         Arc length (radians) of each particle line
// particleColor          string   #ffffff     Particle line color
// particleInertia        number   0.15        How strongly rotation velocity feeds into particle motion
// particleDecay          number   0.92        Per-frame momentum decay for particle motion
// showScrollHint         bool     true        Show the bottom-right bouncing scroll arrow
// scrollHintText         string   "Scroll"    Label under the scroll arrow
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_PERSPECTIVES = [
  {
    title: "Immersive experiences",
    description: "Where creativity comes to life",
    position: "top",
  },
  {
    title: "Infinite Perspective",
    description: "Explore new dimensions",
    position: "center",
  },
  {
    title: "Inside the Universe",
    description: "Immerse yourself in the extraordinary",
    position: "center",
  },
  { title: "Cinematic GSAP Scroll Experiences", position: "bottom" },
];

const DEFAULT_CAMERA_KEYFRAMES = [
  { x: 0, y: 0, z: null, duration: 1, ease: "power2.inOut" },
  { x: 0, y: 5, z: 5, duration: 1, ease: "power3.inOut" },
  { x: 1.5, y: 2, z: 2, duration: 2, ease: "none" },
  { x: 0.5, y: 0, z: 0.8, duration: 3.5, ease: "power1.inOut" },
  { x: -6, y: -1, z: null, duration: 1, ease: "power2.out" },
];

const CYLINDER_VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CYLINDER_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uDarkness;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(tMap, vUv);
    tex.rgb *= (1.0 - uDarkness);
    gl_FragColor = tex;
  }
`;

const PARTICLE_VERTEX = /* glsl */ `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PARTICLE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = w / h;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = img.naturalWidth;
  let sourceHeight = img.naturalHeight;

  if (imgRatio > canvasRatio) {
    sourceWidth = img.naturalHeight * canvasRatio;
    sourceX = (img.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = img.naturalWidth / canvasRatio;
    sourceY = (img.naturalHeight - sourceHeight) / 2;
  }

  ctx.save();
  ctx.translate(x, y + h);
  ctx.scale(1, -1);
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, w, h);
  ctx.restore();
}

function getPositionClasses(position) {
  switch (position) {
    case "top":
      return "top-20 left-1/2 -translate-x-1/2 max-md:top-[25vh]";
    case "top-left":
      return "top-20 left-20";
    case "left":
      return "left-20 top-1/2 -translate-y-1/2";
    case "center":
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    case "top-right":
      return "top-20 right-20 max-md:top-12 max-md:right-12 flex flex-col items-end";
    case "bottom":
      return "bottom-20 left-1/2 -translate-x-1/2 text-center max-md:px-6";
    case "bottom-left":
      return "bottom-20 left-20 max-md:bottom-[10vh] max-md:left-6 flex flex-col items-start text-left";
    case "bottom-right":
      return "bottom-20 right-20 max-md:bottom-12 max-md:right-12 flex flex-col items-end text-right";
    default:
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}

function hexToRGB(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean,
    16,
  );
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ];
}

function createCylinderGeometry(
  gl,
  radius,
  height,
  radialSegments,
  heightSegments,
) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const yPos = (v - 0.5) * height;

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments;
      const theta = u * Math.PI * 2;
      positions.push(Math.cos(theta) * radius, yPos, Math.sin(theta) * radius);
      uvs.push(u, 1 - v);
    }
  }

  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = a + radialSegments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(positions) },
    uv: { size: 2, data: new Float32Array(uvs) },
    index: { data: new Uint16Array(indices) },
  });
}

function createParticleGeometry(
  gl,
  index,
  numParticles,
  particleRadius,
  segments,
  angleSpan,
  height,
) {
  const linePositions = [];
  const startAngle = (index / numParticles) * Math.PI * 2;
  const isTopHalf = index < numParticles / 2;
  const yPosition = isTopHalf
    ? height * 0.7 + Math.random() * height * 0.3
    : -height * 1.0 + Math.random() * height * 0.3;

  for (let j = 0; j <= segments; j++) {
    const t = j / segments;
    const angle = startAngle + angleSpan * t;
    linePositions.push(
      Math.cos(angle) * particleRadius,
      yPosition,
      Math.sin(angle) * particleRadius,
    );
  }

  return {
    geometry: new Geometry(gl, {
      position: { size: 3, data: new Float32Array(linePositions) },
    }),
    userData: {
      baseAngle: startAngle,
      angleSpan,
      baseY: yPosition,
      speed: 0.5 + Math.random() * 1.0,
      radius: particleRadius,
    },
  };
}

export default function CinematicCylinderScroll({
  bgColor = "#000000",
  loaderBg = "#000000",
  loaderBarColor = "#ffffff",
  textColor = "#ffffff",
  images = DEFAULT_IMAGES,
  perspectives = DEFAULT_PERSPECTIVES,
  cylinderRadius = 2.5,
  cylinderRadiusTablet = 2.2,
  cylinderRadiusMobile = 1.8,
  cylinderHeight = 2,
  cylinderRadialSegments = 64,
  cylinderDarkness = 0.3,
  imageTileWidth = 1024,
  imageTileHeight = 1024,
  cameraFovDesktop = 45,
  cameraFovMobile = 50,
  cameraZDesktop = 8,
  cameraZTablet = 7,
  cameraZMobile = 6,
  mobileBreakpoint = 768,
  tabletBreakpoint = 1024,
  maxDPR = 2,
  scrollLength = "500svh",
  scrollScrub = 1,
  rotationRadians = 28.27,
  cameraKeyframes = DEFAULT_CAMERA_KEYFRAMES,
  textScrub = 0.8,
  particlesEnabled = true,
  numParticles = 12,
  particleRadiusOffset = 0.8,
  particleSegments = 20,
  particleAngleSpan = 0.3,
  particleColor = "#ffffff",
  particleInertia = 0.15,
  particleDecay = 0.92,
  showScrollHint = true,
  scrollHintText = "Scroll",
}) {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const textRefs = useRef([]);
  textRefs.current = [];

  const addTextRef = (el) => {
    if (el && !textRefs.current.includes(el)) textRefs.current.push(el);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const renderer = new Renderer({
      canvas: canvasRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio, maxDPR),
      alpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.disable(gl.CULL_FACE);

    const getResponsiveDimensions = () => {
      const width = window.innerWidth;
      const isMobile = width < mobileBreakpoint;
      const isTablet = width >= mobileBreakpoint && width < tabletBreakpoint;
      const targetRadius = isMobile
        ? cylinderRadiusMobile
        : isTablet
          ? cylinderRadiusTablet
          : cylinderRadius;
      const cameraZ = isMobile
        ? cameraZMobile
        : isTablet
          ? cameraZTablet
          : cameraZDesktop;
      const fov = isMobile ? cameraFovMobile : cameraFovDesktop;

      return {
        cylinderScale: targetRadius / cylinderRadius,
        cameraZ,
        fov,
        isMobile,
      };
    };

    const dimensions = getResponsiveDimensions();

    const cameraOptions = { fov: dimensions.fov };
    if (dimensions.isMobile) {
      cameraOptions.aspect = window.innerWidth / window.innerHeight;
    }
    const camera = new Camera(gl, cameraOptions);
    camera.position.set(0, 0, dimensions.cameraZ);

    const scene = new Transform();
    const geometry = createCylinderGeometry(
      gl,
      cylinderRadius,
      cylinderHeight,
      cylinderRadialSegments,
      1,
    );

    const hardwareLimit = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const isMobileDevice = window.innerWidth < mobileBreakpoint;
    const safeLimit = isMobileDevice ? 2048 : Math.min(hardwareLimit, 8192);

    const atlasCanvas = document.createElement("canvas");
    const ctx = atlasCanvas.getContext("2d", {
      willReadFrequently: false,
      alpha: false,
    });
    const numImages = images.length;
    const totalWidthOriginal = imageTileWidth * numImages;
    const heightOriginal = imageTileHeight;
    const atlasScale = Math.min(1, safeLimit / totalWidthOriginal);

    atlasCanvas.width = Math.floor(totalWidthOriginal * atlasScale);
    atlasCanvas.height = Math.floor(heightOriginal * atlasScale);

    let loadedImages = 0;
    const imageElements = [];

    const circumference = 2 * Math.PI * cylinderRadius;
    const textureAspectRatio = imageTileHeight / (imageTileWidth * numImages);
    const idealHeight = circumference * textureAspectRatio;
    const heightCorrection = idealHeight / cylinderHeight;

    let cylinderMesh = null;
    const particles = [];
    let lastRotation = 0;
    let velocity = 0;
    let momentum = 0;
    let rafId = null;
    let lastWidth = window.innerWidth;
    const particleRGB = hexToRGB(particleColor);

    const handleResize = () => {
      if (!cylinderMesh) return;
      const currentWidth = window.innerWidth;
      const newDimensions = getResponsiveDimensions();

      if (newDimensions.isMobile && currentWidth === lastWidth) return;
      lastWidth = currentWidth;

      renderer.setSize(currentWidth, window.innerHeight);
      camera.perspective({
        fov: newDimensions.fov,
        aspect: currentWidth / window.innerHeight,
      });

      if (newDimensions.isMobile) {
        cylinderMesh.scale.set(
          newDimensions.cylinderScale,
          newDimensions.cylinderScale * heightCorrection,
          newDimensions.cylinderScale,
        );
      } else {
        cylinderMesh.scale.set(
          newDimensions.cylinderScale,
          newDimensions.cylinderScale,
          newDimensions.cylinderScale,
        );
      }
    };

    images.forEach((imageSrc, index) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageElements[index] = img;
        loadedImages++;

        if (loadedImages === numImages) {
          imageElements.forEach((tileImg, i) => {
            const xStartExact = (i / numImages) * atlasCanvas.width;
            const xEndExact = ((i + 1) / numImages) * atlasCanvas.width;
            const xPos = Math.floor(xStartExact);
            const xEnd = Math.floor(xEndExact);
            drawImageCover(
              ctx,
              tileImg,
              xPos,
              0,
              xEnd - xPos,
              atlasCanvas.height,
            );
          });

          const texture = new Texture(gl, {
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            minFilter: gl.LINEAR,
            magFilter: gl.LINEAR,
            generateMipmaps: false,
          });
          texture.image = atlasCanvas;
          texture.needsUpdate = true;

          const program = new Program(gl, {
            vertex: CYLINDER_VERTEX,
            fragment: CYLINDER_FRAGMENT,
            uniforms: {
              tMap: { value: texture },
              uDarkness: { value: cylinderDarkness },
            },
            cullFace: null,
          });

          cylinderMesh = new Mesh(gl, { geometry, program });
          cylinderMesh.setParent(scene);
          cylinderMesh.rotation.y = 0.5;
          cylinderMesh.scale.set(
            dimensions.cylinderScale,
            dimensions.cylinderScale,
            dimensions.cylinderScale,
          );

          setIsLoading(false);

          const cameraAnim = { x: 0, y: 0, z: dimensions.cameraZ };
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: scrollScrub,
            },
          });

          cameraKeyframes.forEach((frame) => {
            tl.to(cameraAnim, {
              x: frame.x,
              y: frame.y,
              z: frame.z ?? dimensions.cameraZ,
              duration: frame.duration,
              ease: frame.ease,
            });
          });

          tl.to(
            cylinderMesh.rotation,
            { y: `+=${rotationRadians}`, duration: 8.5, ease: "none" },
            0,
          );

          textRefs.current.forEach((textEl, index) => {
            if (!textEl) return;
            const sectionDuration = 100 / perspectives.length;
            const start = index * sectionDuration;
            const end = (index + 1) * sectionDuration;

            gsap
              .timeline({
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: `${start}% top`,
                  end: `${end}% top`,
                  scrub: textScrub,
                },
              })
              .fromTo(
                textEl,
                { opacity: 0 },
                { opacity: 1, duration: 0.2, ease: "power2.out" },
              )
              .to(textEl, { opacity: 1, duration: 0.6, ease: "none" })
              .to(textEl, { opacity: 0, duration: 0.2, ease: "power2.out" });
          });

          if (particlesEnabled) {
            for (let i = 0; i < numParticles; i++) {
              const { geometry: lineGeometry, userData } =
                createParticleGeometry(
                  gl,
                  i,
                  numParticles,
                  cylinderRadius + particleRadiusOffset,
                  particleSegments,
                  particleAngleSpan,
                  cylinderHeight,
                );

              const lineProgram = new Program(gl, {
                vertex: PARTICLE_VERTEX,
                fragment: PARTICLE_FRAGMENT,
                uniforms: {
                  uColor: { value: particleRGB },
                  uOpacity: { value: 0.0 },
                },
                transparent: true,
                depthTest: true,
              });

              const particle = new Mesh(gl, {
                geometry: lineGeometry,
                program: lineProgram,
                mode: gl.LINE_STRIP,
              });
              particle.userData = userData;
              particle.setParent(scene);
              particles.push(particle);
            }
          }

          window.addEventListener("resize", handleResize);

          const animate = () => {
            rafId = requestAnimationFrame(animate);

            camera.position.set(cameraAnim.x, cameraAnim.y, cameraAnim.z);
            camera.lookAt([0, 0, 0]);

            if (cylinderMesh) {
              const currentRotation = cylinderMesh.rotation.y;
              velocity = currentRotation - lastRotation;
              lastRotation = currentRotation;

              momentum = momentum * particleDecay + velocity * particleInertia;
              const speed = Math.abs(velocity) * 100;
              const isRotating = Math.abs(velocity) > 0.0001;

              particles.forEach((particle) => {
                const userData = particle.userData;
                const targetOpacity = isRotating
                  ? Math.min(speed * 3, 0.95)
                  : 0;
                const currentOpacity = particle.program.uniforms.uOpacity.value;
                particle.program.uniforms.uOpacity.value =
                  currentOpacity + (targetOpacity - currentOpacity) * 0.15;

                if (isRotating) {
                  const rotationOffset = velocity * userData.speed * 1.5;
                  userData.baseAngle += rotationOffset;

                  const positions = particle.geometry.attributes.position.data;
                  for (let j = 0; j <= particleSegments; j++) {
                    const t = j / particleSegments;
                    const angle = userData.baseAngle + userData.angleSpan * t;
                    positions[j * 3] = Math.cos(angle) * userData.radius;
                    positions[j * 3 + 1] = userData.baseY;
                    positions[j * 3 + 2] = Math.sin(angle) * userData.radius;
                  }
                  particle.geometry.attributes.position.needsUpdate = true;
                }
              });
            }

            renderer.render({ scene, camera });
          };
          animate();
        }
      };
      img.onerror = () => {
        setIsLoading(false);
      };
      img.src = imageSrc;
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500"
        style={{
          backgroundColor: loaderBg,
          opacity: isLoading ? 1 : 0,
          pointerEvents: isLoading ? "auto" : "none",
        }}
      >
        <div className="w-40 h-[2px] overflow-hidden">
          <div
            className="w-full h-full animate-loader"
            style={{ backgroundColor: loaderBarColor }}
          />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes ccs-loader {
              0% { transform: scaleX(0); transform-origin: 0% 50%; }
              50% { transform: scaleX(1); transform-origin: 0% 50%; }
              50.1% { transform: scaleX(1); transform-origin: 100% 50%; }
              100% { transform: scaleX(0); transform-origin: 100% 50%; }
            }
            .animate-loader { animation: ccs-loader 1.5s ease-in-out infinite alternate forwards; }
          `,
        }}
      />

      <div
        className="fixed inset-0 w-full h-svh z-0"
        style={{ backgroundColor: bgColor }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{ color: textColor }}
      >
        {perspectives.map((perspective, index) => (
          <div
            key={index}
            ref={addTextRef}
            className={`absolute text-center opacity-0 max-md:w-full ${getPositionClasses(perspective.position)}`}
          >
            <h2 className="text-7xl font-[300] max-md:text-3xl leading-[0.8]">
              {perspective.title}
            </h2>
            {perspective.description && (
              <p className="text-2xl font-[300] max-md:text-base opacity-50 mt-2">
                {perspective.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {showScrollHint && (
        <div className="fixed bottom-8 right-8 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/60"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            <span className="text-m text-white/40">{scrollHintText}</span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative z-20"
        style={{ height: scrollLength }}
      />
    </>
  );
}
