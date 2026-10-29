"use client";

import { useEffect, useRef, useState } from "react";

const unsplash = (id, w, h) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const PHOTOS = [
  ["photo-1462332420958-a05d1e002413", "Cosmic Voyage"],
  ["photo-1608178398319-48f814d0750c", "Astral Nebula"],
  ["photo-1610296669228-602fa827fc1f", "Stellar Drift"],
  ["photo-1717705422478-0b42e89e06b7", "Orbital Path"],
];

const DEFAULT_IMAGES = PHOTOS.map(([id, title]) => ({
  url: unsplash(id, 1200, 1200),
  title,
}));

const DEFAULT_THUMBNAILS = PHOTOS.map(([id, title]) => ({
  url: unsplash(id, 300, 440),
  title,
}));

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const buildFragmentShader = (gridResolution) => `
  uniform vec3 uFillColor;
  uniform float uProgress;
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
    if (aspect1 > aspect2) {
      uv *= vec2(aspect2 / aspect1, 1.0);
    } else {
      uv *= vec2(1.0, aspect1 / aspect2);
    }
    uv += vec2(0.5);

    float progress = quadraticInOut(1.0 - uProgress);
    float s = ${gridResolution.toFixed(1)};
    vec2 gridSize = vec2(s, floor(s / aspect1));

    float v = smoothstep(0.0, 1.0, vUv.y + sin(vUv.x * 4.0 + progress * 6.0) * mix(0.3, 0.1, abs(0.5 - vUv.x)) * 0.5 * smoothstep(0.0, 0.2, progress) + (1.0 - progress * 2.0));
    float mixnewUV = (vUv.x * 3.0 + (1.0 - v) * 50.0) * progress;
    vec2 subUv = mix(uv, floor(uv * gridSize) / gridSize, mixnewUV);

    vec4 color = mix(texture2D(uTexture, subUv), texture2D(uNextTexture, subUv), uProgress);
    color.a = v;
    color.rgb = mix(color.rgb, uFillColor, smoothstep(0.5, 0.0, abs(0.5 - color.a)) * progress);
    gl_FragColor = color;
    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 1.2));
  }
`;

export default function FuturisticGallery({
  backgroundColor = "#000000",
  frameColor = "#ffffff",
  fillColor = "#000000",
  accentColor = "#ffffff",
  canvasSize = 450,
  innerBorderColor = "#000000",
  innerBorderWidth = 10,
  gradientStart = "#ffffff",
  gradientEnd = "#000000",
  animationSpeed = 0.02,
  gridResolution = 50.0,
  mainImages = DEFAULT_IMAGES,
  thumbnailImages = DEFAULT_THUMBNAILS,
  className = "",
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    material: null,
    textures: [],
    activeImage: 0,
    transitionImage: null,
    progress: 1,
    isAnimating: false,
  });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let stopped = false;
    let teardown = () => { };

    const init = (THREE) => {
      const mount = mountRef.current;
      if (!mount) return () => { };
      const state = stateRef.current;
      Object.assign(state, {
        material: null,
        textures: [],
        activeImage: 0,
        transitionImage: null,
        progress: 1,
        isAnimating: false,
      });
      setActiveIndex(0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 10;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvasSize, canvasSize);
      mount.appendChild(renderer.domElement);

      let rafId = 0;
      let geometry = null;

      const step = () => {
        rafId = requestAnimationFrame(step);
        renderer.render(scene, camera);
        if (!state.isAnimating) return;
        state.progress += animationSpeed;
        if (state.progress >= 1) {
          state.progress = 1;
          state.activeImage = state.transitionImage;
          state.material.uniforms.uTexture.value =
            state.textures[state.activeImage];
          state.transitionImage = null;
          state.isAnimating = false;
        }
        state.material.uniforms.uProgress.value = state.progress;
      };

      const loader = new THREE.TextureLoader();
      Promise.all(mainImages.map((img) => loader.loadAsync(img.url))).then(
        (textures) => {
          if (stopped) {
            textures.forEach((texture) => texture.dispose());
            return;
          }
          textures.forEach((texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
          });
          state.textures = textures;

          const first = textures[0];
          state.material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: buildFragmentShader(gridResolution),
            uniforms: {
              uFillColor: { value: new THREE.Color(fillColor) },
              uProgress: { value: 1 },
              uTextureSize: {
                value: new THREE.Vector2(first.image.width, first.image.height),
              },
              uElementSize: { value: new THREE.Vector2(1, 1) },
              uTexture: { value: first },
              uNextTexture: { value: first },
            },
            transparent: true,
          });

          geometry = new THREE.PlaneGeometry(8.3, 8.3);
          scene.add(new THREE.Mesh(geometry, state.material));
          step();
        },
      );

      return () => {
        stopped = true;
        cancelAnimationFrame(rafId);
        geometry?.dispose();
        state.material?.dispose();
        state.textures.forEach((texture) => texture.dispose());
        state.material = null;
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    import("three").then((THREE) => {
      if (!stopped) teardown = init(THREE);
    });

    return () => {
      stopped = true;
      teardown();
    };
  }, [canvasSize, animationSpeed, gridResolution, fillColor, mainImages]);

  const switchImage = (idx) => {
    const state = stateRef.current;
    if (!state.material || idx === state.activeImage || state.isAnimating)
      return;
    const next = state.textures[idx];
    if (!next) return;
    state.transitionImage = idx;
    state.material.uniforms.uNextTexture.value = next;
    state.material.uniforms.uTextureSize.value.set(
      next.image.width,
      next.image.height,
    );
    state.progress = 0;
    state.isAnimating = true;
    setActiveIndex(idx);
  };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none ${className}`}
      style={{ backgroundColor }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-[0_4px_30px_rgba(255,255,255,0.15)]"
        style={{
          width: canvasSize + 14,
          height: canvasSize + 14,
          backgroundColor: frameColor,
        }}
      >
        <div
          className="absolute inset-0 rounded-full scale-[0.98]"
          style={{
            backgroundImage: `linear-gradient(180deg, ${gradientStart}, transparent 50%, ${gradientEnd})`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
          style={{ width: canvasSize, height: canvasSize }}
        >
          <div ref={mountRef} className="h-full w-full" />
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10"
            style={{
              width: canvasSize - 10,
              height: canvasSize - 10,
              border: `${innerBorderWidth}px solid ${innerBorderColor}`,
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-5 right-5 z-20 flex flex-row gap-2.5">
        {thumbnailImages.map((img, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              type="button"
              aria-label={img.title}
              aria-pressed={isActive}
              onClick={() => switchImage(idx)}
              className={`h-[105px] w-[74px] cursor-pointer p-[2px] transition duration-300 ease-in-out [clip-path:polygon(10px_0,calc(100%-10px)_0,100%_10px,100%_calc(100%-10px),calc(100%-10px)_100%,10px_100%,0_calc(100%-10px),0_10px)] ${isActive
                  ? "bg-[var(--accent)] opacity-100"
                  : "bg-transparent opacity-60 hover:bg-[var(--accent)] hover:opacity-100"
                }`}
              style={{ "--accent": accentColor }}
            >
              <img
                src={img.url}
                alt={img.title}
                className="h-full w-full object-cover [clip-path:polygon(8px_0,calc(100%-8px)_0,100%_8px,100%_calc(100%-8px),calc(100%-8px)_100%,8px_100%,0_calc(100%-8px),0_8px)]"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}