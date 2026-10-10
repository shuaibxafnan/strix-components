"use client";

import { useEffect, useRef, useState } from "react";

// ─── Image Shader Gallery (Seamless Blend Fix) ──────────────────────────────
// This version introduces a dual-sampler system inside the fragment shader
// to prevent "flash" pops during transition updates.
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c71c61f6db7df2e5218bc_collections-oranith-1.webp",
    title: "Image 1",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c71c6bd8971b3e73ee7c8_collections-anturax-1.webp",
    title: "Image 2",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c71c6648fdd5236d5b972_collections-oranith-2.webp",
    title: "Image 3",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c71c67e1e5c7edbcc0c3f_collections-anturax-3.webp",
    title: "Image 4",
  },
];

const DEFAULT_THUMBNAILS = [
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c7c7c41d8916da35baa9c_card-Oraniths-1.webp",
    title: "Image 1",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c7c7c65d779e7cfe7a75a_card-anturax-1.webp",
    title: "Image 2",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c7c7c5225fefdd3302e57_card-Oraniths-2.webp",
    title: "Image 3",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c7c7c8c0dbe0a8563fe55_card-anturax-3.webp",
    title: "Image 4",
  },
];

const PIXELS = new Float32Array(
  [
    1, 1.5, 2, 2.5, 3, 1, 1.5, 2, 2.5, 3, 3.5, 4, 2, 2.5, 3, 3.5, 4, 4.5, 5,
    5.5, 6, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 20, 100,
  ].map((v) => v / 100),
);

export default function FuturisticGallery({
  backgroundColor = "#ffdfc4",
  canvasSize = 450,
  innerBorderColor = "black",
  innerBorderWidth = 10,
  gradientStart = "#ffff82",
  gradientEnd = "#e8a5f3",
  animationSpeed = 0.02, // Slightly accelerated for snappy responses
  gridResolution = 50.0,
  mainImages = DEFAULT_IMAGES,
  thumbnailImages = DEFAULT_THUMBNAILS,
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    material: null,
    textures: [],
    activeImage: 0,
    transitionImage: null,
    progress: 1,
    isAnimating: false,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let THREE;
    let animationFrameId;

    import("three").then((module) => {
      THREE = module;
      initThreeEngine();
    });

    function initThreeEngine() {
      if (!containerRef.current) return;

      const state = stateRef.current;
      state.scene = new THREE.Scene();
      state.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      state.camera.position.z = 10;

      state.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      state.renderer.setSize(canvasSize, canvasSize);

      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(state.renderer.domElement);

      const loader = new THREE.TextureLoader();
      let loadCount = 0;

      mainImages.forEach((img, idx) => {
        loader.load(img.url, (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          state.textures[idx] = tex;
          loadCount++;

          if (loadCount === mainImages.length) {
            buildShaderScene();
            runRenderLoop();
          }
        });
      });
    }

    function buildShaderScene() {
      const state = stateRef.current;

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float uTime;
        uniform vec3 uFillColor;
        uniform float uProgress;
        uniform float uType;
        uniform float uPixels[36];
        uniform vec2 uTextureSize;
        uniform vec2 uElementSize;
        uniform sampler2D uTexture;
        uniform sampler2D uNextTexture;
        varying vec2 vUv;

        float quadraticInOut(float t) {
          float p = 2.0 * t * t;
          return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
        }

        void main() {
          vec2 uv = vUv - vec2(0.5);
          float aspect1 = uTextureSize.x / uTextureSize.y;
          float aspect2 = uElementSize.x / uElementSize.y;
          if (aspect1 > aspect2) { uv *= vec2(aspect2 / aspect1, 1.0); } 
          else { uv *= vec2(1.0, aspect1 / aspect2); }
          uv += vec2(0.5);

          if (uType == 3.0) {
            float progress = quadraticInOut(1.0 - uProgress);
            float s = ${gridResolution.toFixed(1)};
            float imageAspect = uTextureSize.x / uTextureSize.y;
            vec2 gridSize = vec2(s, floor(s / imageAspect));

            float v = smoothstep(0.0, 1.0, vUv.y + sin(vUv.x * 4.0 + progress * 6.0) * mix(0.3, 0.1, abs(0.5 - vUv.x)) * 0.5 * smoothstep(0.0, 0.2, progress) + (1.0 - progress * 2.0));
            float mixnewUV = (vUv.x * 3.0 + (1.0 - v) * 50.0) * progress;
            vec2 subUv = mix(uv, floor(uv * gridSize) / gridSize, mixnewUV);

            // Sample both current and incoming textures simultaneously to build cross-fades
            vec4 colorCurrent = texture2D(uTexture, subUv);
            vec4 colorNext = texture2D(uNextTexture, subUv);
            
            // Mix between old state and incoming state over timeline progress
            vec4 color = mix(colorCurrent, colorNext, uProgress);

            color.a = pow(v, 1.0);
            color.rgb = mix(color.rgb, uFillColor, smoothstep(0.5, 0.0, abs(0.5 - color.a)) * progress);
            gl_FragColor = color;
          }
          gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 1.2));
        }
      `;

      state.material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uFillColor: { value: new THREE.Color("#000000") },
          uProgress: { value: 1 },
          uType: { value: 3 },
          uPixels: { value: PIXELS },
          uTextureSize: { value: new THREE.Vector2(1, 1) },
          uElementSize: { value: new THREE.Vector2(1, 1) },
          uTexture: { value: state.textures[state.activeImage] },
          uNextTexture: { value: state.textures[state.activeImage] },
        },
        transparent: true,
      });

      const currentTexture = state.textures[state.activeImage];
      if (currentTexture) {
        state.material.uniforms.uTextureSize.value.set(
          currentTexture.image.width,
          currentTexture.image.height,
        );
      }

      const geometry = new THREE.PlaneGeometry(8.3, 8.3);
      const plane = new THREE.Mesh(geometry, state.material);
      state.scene.add(plane);
    }

    function runRenderLoop() {
      const state = stateRef.current;
      animationFrameId = requestAnimationFrame(runRenderLoop);

      if (state.renderer && state.scene && state.camera) {
        state.renderer.render(state.scene, state.camera);
      }

      processShaderTransitions();
    }

    function processShaderTransitions() {
      const state = stateRef.current;
      if (state.transitionImage !== null && state.isAnimating) {
        state.progress += animationSpeed;

        if (state.progress >= 1) {
          state.progress = 1;
          state.activeImage = state.transitionImage;

          // Complete transition balance updates
          state.material.uniforms.uTexture.value =
            state.textures[state.activeImage];
          state.transitionImage = null;
          state.isAnimating = false;
        }
        state.material.uniforms.uProgress.value = state.progress;
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasSize, animationSpeed, gridResolution, mainImages]);

  const switchImage = (idx) => {
    const state = stateRef.current;
    if (idx === state.activeImage || state.isAnimating) return;

    // Instantly queue next texture uniform before initializing progress tracking
    state.transitionImage = idx;
    state.material.uniforms.uNextTexture.value = state.textures[idx];
    state.material.uniforms.uTextureSize.value.set(
      state.textures[idx].image.width,
      state.textures[idx].image.height,
    );

    state.progress = 0;
    state.isAnimating = true;
    setActiveIndex(idx);
  };

  const frameOuterSize = canvasSize + 14;
  const frameInnerSize = canvasSize - 10;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ backgroundColor: backgroundColor }}
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('https://img.blacklead.work/grid.svg')`,
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full [clip-path:circle(50%_at_50%_50%)] bg-black shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        style={{ width: `${frameOuterSize}px`, height: `${frameOuterSize}px` }}
      >
        <div
          className="absolute inset-0 rounded-full -z-10 scale-[0.98]"
          style={{
            backgroundImage: `linear-gradient(180deg, ${gradientStart}, ${gradientEnd}00 50%, ${gradientEnd})`,
          }}
        />

        <div
          id="canvasWrapper"
          ref={containerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full [clip-path:circle(50%_at_50%_50%)]"
          style={{ width: `${canvasSize}px`, height: `${canvasSize}px` }}
        >
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10 [clip-path:circle(50%_at_50%_50%)]"
            style={{
              width: `${frameInnerSize}px`,
              height: `${frameInnerSize}px`,
              border: `${innerBorderWidth}px solid ${innerBorderColor}`,
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-5 right-5 flex flex-row gap-2.5 z-20">
        {thumbnailImages.map((img, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              onClick={() => switchImage(idx)}
              className={`flex justify-center items-center relative w-[74px] h-[105px] cursor-pointer overflow-hidden transition-all duration-300 ease-in-out group ${
                isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              <div
                className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-300 pointer-events-none z-10 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{
                  backgroundImage: `url('https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/6762b98cb5e68f0b74323e61_collection-card-frame.svg')`,
                }}
              />
              <img
                src={img.url}
                alt={img.title}
                className="w-[66px] h-[99px] object-cover rounded-sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
