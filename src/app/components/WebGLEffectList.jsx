"use client";

import { useEffect, useRef } from "react";

// ─── WebGLEffectList ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items                array    [...]       Text layout items matching corresponding image endpoints
// mainHeading          string   "..."       Focal background tracking string applied behind layouts
// smoothTime           number   1.2         Damping delay values applied across container smooth passes
// deformationStrength  number   0.00005     Vertex displacement scale based on active container momentum
// rgbShiftStrength     number   0.00003     Color splits displacement scale tracking container velocity
// lerpSpeed            number   0.075       Eased linear step tracking values behind rendering math ticks
// meshSkewAngle        number   -5          Rotational transformation angle applied across Three planes
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    subtitle: "001 / CORE",
    title: "Street Vignettes",
    img: "https://assets.codepen.io/204808/night-in-korea-1.jpg",
  },
  {
    subtitle: "002 / PATH",
    title: "Neon Highways",
    img: "https://assets.codepen.io/204808/night-in-korea-2.jpg",
  },
  {
    subtitle: "003 / FORM",
    title: "Asymmetric Space",
    img: "https://assets.codepen.io/204808/night-in-korea-3.jpg",
  },
  {
    subtitle: "004 / LIFE",
    title: "Midnight Kitchen",
    img: "https://assets.codepen.io/204808/night-in-korea-4.jpg",
  },
  {
    subtitle: "005 / ARCH",
    title: "Dynasty Walls",
    img: "https://assets.codepen.io/204808/night-in-korea-5.jpg",
  },
  {
    subtitle: "006 / VIEW",
    title: "Obsidian Skyline",
    img: "https://assets.codepen.io/204808/night-in-korea-6.jpg",
  },
];

const VERTEX_SHADER = `
  uniform vec2 uOffset;
  varying vec2 vUv;
  #define M_PI 3.1415926535897932384626433832795

  vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
     position.x += sin(uv.y * M_PI) * offset.x;
     position.y += sin(uv.x * M_PI) * offset.y;
     return position;
  }

  void main() {
     vUv = uv;
     vec3 newPosition = deformationCurve(position, uv, uOffset);
     gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uAlpha;
  uniform vec2 uOffset;
  varying vec2 vUv;
  uniform vec2 uRGBShift;

  vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 shift) {
     vec2 verticalShift = vec2(0.0, shift.y);
     float r = texture2D(textureImage, uv + verticalShift).r;
     vec2 gb = texture2D(textureImage, uv).gb;
     return vec3(r, gb);
  }

  void main() {
     vec3 color = rgbShift(uTexture, vUv, uRGBShift);
     gl_FragColor = vec4(color, uAlpha);
  }
`;

export default function WebGLEffectList({
  items = DEFAULT_ITEMS,
  mainHeading = "Seoul Dynamics",
  smoothTime = 1.2,
  deformationStrength = 0.00004, // Slightly pulled back for organic smoothness
  rgbShiftStrength = 0.00002, // Refined subtle color fringing
  lerpSpeed = 0.08,
  meshSkewAngle = -4, // Sophisticated editorial skew degree
}) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    let smootherInstance;
    let animationFrameId;
    let renderer;
    let scene;
    let camera;
    let meshItems = [];

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
        el.onerror = () =>
          reject(new Error(`Failed to load pipeline element: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
      ),
    ])
      .then(() =>
        loadScript("https://assets.codepen.io/16327/ScrollTrigger.min.js"),
      )
      .then(() =>
        loadScript("https://assets.codepen.io/16327/ScrollSmoother.min.js"),
      )
      .then(() => {
        const { gsap, THREE, ScrollTrigger, ScrollSmoother } = window;
        if (
          !gsap ||
          !THREE ||
          !ScrollTrigger ||
          !ScrollSmoother ||
          !wrapperRef.current
        )
          return;

        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";

        smootherInstance = ScrollSmoother.create({
          wrapper: wrapperRef.current,
          content: wrapperRef.current.querySelector("#smooth-content"),
          smooth: smoothTime,
          effects: true,
        });

        // Kinetic text transformation timeline
        gsap.utils.toArray(".js-image-container").forEach((section) => {
          const heading = section.querySelector(".js-kinetic-title");
          gsap.fromTo(
            heading,
            { x: "10%" },
            {
              x: () => {
                const rect = heading.getBoundingClientRect();
                return -(rect.width * 0.4);
              },
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        class MeshItem {
          constructor(element, sceneIndex) {
            this.element = element;
            this.index = sceneIndex;
            this.sizes = new THREE.Vector2(0, 0);
            this.offset = new THREE.Vector2(0, 0);
            this.targetOffset = new THREE.Vector2(0, 0);
            this.currentOffset = new THREE.Vector2(0, 0);
            this.targetRGB = new THREE.Vector2(0, 0);
            this.currentRGB = new THREE.Vector2(0, 0);

            this.createMesh();
          }

          getDimensions() {
            const rect = this.element.getBoundingClientRect();
            const width = rect.width || window.innerWidth * 0.35;
            const height = rect.height || window.innerHeight * 0.55;

            this.sizes.set(width, height);
            this.offset.set(
              rect.left - window.innerWidth / 2 + width / 2,
              -rect.top + window.innerHeight / 2 - height / 2,
            );
          }

          createMesh() {
            this.geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
            this.imageTexture = new THREE.TextureLoader().load(
              this.element.src,
            );

            this.uniforms = {
              uTexture: { value: this.imageTexture },
              uOffset: { value: new THREE.Vector2(0.0, 0.0) },
              uAlpha: { value: 1.0 },
              uRGBShift: { value: new THREE.Vector2(0.0, 0.0) },
            };

            this.material = new THREE.ShaderMaterial({
              uniforms: this.uniforms,
              vertexShader: VERTEX_SHADER,
              fragmentShader: FRAGMENT_SHADER,
              transparent: true,
              side: THREE.DoubleSide,
            });

            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.getDimensions();

            const offsetStepY = 180;
            const offsetStepX = 80;
            const diagX = this.index * offsetStepX;
            const diagY = -this.index * offsetStepY;

            this.mesh.position.set(
              this.offset.x + diagX,
              this.offset.y + diagY,
              0,
            );
            this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
          }

          renderLoop() {
            this.getDimensions();
            const rect = this.element.getBoundingClientRect();
            const width = rect.width || this.sizes.x;
            const height = rect.height || this.sizes.y;

            const relativeY = rect.top + height / 2 - window.innerHeight / 2;
            const diagX = relativeY * -0.15; // Tightened tracking alignment
            const diagY = relativeY * -0.15;

            const baseX = rect.left - window.innerWidth / 2 + width / 2;
            const baseY = -rect.top + window.innerHeight / 2 - height / 2;

            this.mesh.position.set(baseX + diagX, baseY + diagY, 0);
            this.mesh.rotation.z = THREE.MathUtils.degToRad(meshSkewAngle);
            this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);

            const velocityY = smootherInstance
              ? smootherInstance.getVelocity()
              : 0;

            this.targetOffset.set(0, velocityY * deformationStrength);
            this.currentOffset.lerp(this.targetOffset, lerpSpeed);
            this.uniforms.uOffset.value.copy(this.currentOffset);

            this.targetRGB.set(0, velocityY * rgbShiftStrength);
            this.currentRGB.lerp(this.targetRGB, 0.1);

            if (Math.abs(this.currentRGB.y) < 0.00001) this.currentRGB.y = 0;
            this.uniforms.uRGBShift.value.copy(this.currentRGB);
          }
        }

        scene = new THREE.Scene();
        const perspective = 1000;
        const fov =
          (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) /
          Math.PI;

        camera = new THREE.PerspectiveCamera(
          fov,
          window.innerWidth / window.innerHeight,
          1,
          2000,
        );
        camera.position.set(0, 0, 1600);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        wrapperRef.current.appendChild(renderer.domElement);
        renderer.domElement.className =
          "fixed top-0 left-0 pointer-events-none z-0 opacity-85 mix-blend-screen";

        const meshGroup = new THREE.Group();
        scene.add(meshGroup);
        meshGroup.scale.set(1.4, 1.4, 1.4);
        meshGroup.position.x = 150;

        const images = [
          ...wrapperRef.current.querySelectorAll(".js-target-img"),
        ];
        meshItems = images.map((img, index) => {
          const item = new MeshItem(img, index);
          meshGroup.add(item.mesh);
          return item;
        });

        meshGroup.rotation.y = -0.4;
        meshGroup.rotation.x = -0.2;
        meshGroup.rotation.z = -0.2;

        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize, false);

        const draw = () => {
          for (let i = 0; i < meshItems.length; i++) {
            meshItems[i].renderLoop();
          }
          renderer.render(scene, camera);
          animationFrameId = requestAnimationFrame(draw);
        };
        draw();
      })
      .catch((err) =>
        console.error("[WebGLEffectList] System fault:", err.message),
      );

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (smootherInstance) smootherInstance.kill();
      if (renderer && renderer.domElement) {
        renderer.domElement.remove();
        renderer.dispose();
      }
    };
  }, [
    items,
    smoothTime,
    deformationStrength,
    rgbShiftStrength,
    lerpSpeed,
    meshSkewAngle,
  ]);

  return (
    <div
      id="smooth-wrapper"
      ref={wrapperRef}
      className="w-full min-h-screen bg-[#070708] text-[#f4f4f5] antialiased select-none overflow-y-auto overflow-x-hidden relative"
    >
      {/* Structural Editorial Layout Badges */}
      <div className="fixed top-8 left-8 z-30 pointer-events-none mix-blend-difference hidden md:block">
        <p className="text-[10px] font-mono tracking-[0.4em] text-neutral-400 uppercase">
          {mainHeading}
        </p>
      </div>
      <div className="fixed top-8 right-8 z-30 pointer-events-none mix-blend-difference hidden md:block">
        <p className="text-[10px] font-mono tracking-[0.4em] text-neutral-400 uppercase">
          CULTURE OBSERVATORY ©2026
        </p>
      </div>

      {/* Atmospheric Underlay Type */}
      <div className="absolute top-[12vh] left-1/2 -translate-x-1/2 w-full text-center z-0 pointer-events-none select-none overflow-hidden">
        <h1 className="text-[14vw] font-serif italic text-neutral-900 leading-none tracking-tight opacity-40">
          {mainHeading}
        </h1>
      </div>

      {/* Main Stream Sequence Container */}
      <div
        id="smooth-content"
        className="w-full flex flex-col relative z-10 will-change-transform pt-[25vh]"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="js-image-container flex flex-col items-center justify-center h-[90vh] w-full relative mb-[15vh] last:mb-[35vh]"
          >
            {/* Fine Typography Container */}
            <div className="w-full max-w-5xl px-8 md:px-16 flex flex-col items-start relative z-20 pointer-events-none">
              <span className="text-[11px] font-mono tracking-[0.3em] text-neutral-500 mb-3 block">
                {item.subtitle}
              </span>

              {/* Flowing Kinetic Text Title Layer */}
              <div className="w-full overflow-visible whitespace-nowrap">
                <h1 className="js-kinetic-title text-[7vw] font-light tracking-tight text-neutral-100 font-serif leading-[1.1] mix-blend-difference">
                  {item.title}
                </h1>
              </div>
            </div>

            {/* Hidden Source Vector Hooked Upstream Into WebGL Rendering Pipeline */}
            <img
              className="js-target-img w-[28%] aspect-[3/4] md:w-[24%] object-cover absolute invisible pointer-events-none origin-center"
              src={item.img}
              alt={item.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
