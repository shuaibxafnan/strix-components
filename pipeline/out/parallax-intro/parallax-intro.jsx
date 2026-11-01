"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_PLANE_LAYOUT = [
  { x: -7, y: 2, z: -2.5, width: 5, height: 4, blurred: true, delay: 0.32 },
  { x: -4, y: 3, z: -1, width: 3.8, height: 3, blurred: false, delay: 0.16 },
  { x: 1, y: 3, z: 0, width: 2.4, height: 3.2, blurred: false, delay: 0.12 },
  { x: 6, y: 3.5, z: -3, width: 4, height: 4, blurred: true, delay: 0.2 },
  { x: 5, y: -0.25, z: 0, width: 3.5, height: 2.5, blurred: false, delay: 0 },
  { x: -4, y: -2, z: -0.5, width: 2.8, height: 2.8, blurred: false, delay: 0.48 },
  { x: -6.5, y: -4, z: -2, width: 6, height: 4, blurred: true, delay: 0.3 },
  { x: 1, y: -3.8, z: -1, width: 4.5, height: 3, blurred: false, delay: 0.6 },
];

const DEFAULT_PARAGRAPH =
  "We build {{highlight}}considered digital products{{/highlight}} for teams who care about the details, blending {{highlight}}design{{/highlight}} and {{highlight}}engineering{{/highlight}} into one seamless process.";

const VERTEX_SHADER = `
uniform float u_enterProgress;
uniform float u_exitProgress;
uniform vec3 u_exitDir;
varying vec2 v_uv;

mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

void main() {
    v_uv = uv;
    float enterMinusOne = 1.0 - u_enterProgress;
    vec3 pos = position * rotateY(enterMinusOne);
    pos -= vec3(0.0, enterMinusOne * 2.0, enterMinusOne * 2.0);
    pos += u_exitDir * u_exitProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform sampler2D u_texture;
uniform float u_planeAspect;
uniform float u_imageAspect;
uniform float u_reveal;
uniform float u_isBlurred;
uniform float u_blurStrength;
uniform float u_borderRadiusAmount;
varying vec2 v_uv;

vec2 coverUv(vec2 uv, float planeAspect, float imageAspect) {
    if (planeAspect > imageAspect) {
        return vec2(uv.x, (uv.y - 0.5) * (imageAspect / planeAspect) + 0.5);
    }
    return vec2((uv.x - 0.5) * (planeAspect / imageAspect) + 0.5, uv.y);
}

vec3 sampleBlur(vec2 uv) {
    vec3 sum = vec3(0.0);
    float total = 0.0;
    for (int x = -3; x <= 3; x++) {
        for (int y = -3; y <= 3; y++) {
            vec2 offset = vec2(float(x), float(y)) * u_blurStrength;
            sum += texture2D(u_texture, uv + offset).rgb;
            total += 1.0;
        }
    }
    return sum / total;
}

void main() {
    vec2 cuv = coverUv(v_uv, u_planeAspect, u_imageAspect);
    vec3 col = u_isBlurred > 0.5 ? sampleBlur(cuv) : texture2D(u_texture, cuv).rgb;

    vec2 d = abs(cuv - 0.5);
    float borderRadius = u_borderRadiusAmount * u_reveal;
    vec2 maxHalf = u_planeAspect > u_imageAspect
        ? vec2(0.5, 0.5 * (u_imageAspect / u_planeAspect))
        : vec2(0.5 * (u_planeAspect / u_imageAspect), 0.5);
    vec2 revealedHalf = maxHalf * u_reveal;
    float softness = mix(0.1, u_isBlurred > 0.5 ? 0.12 : 0.0001, u_reveal);
    vec2 distToEdge = d - (revealedHalf - borderRadius - softness);
    float sdf = min(max(distToEdge.x, distToEdge.y), 0.0) + length(max(distToEdge, 0.0)) - borderRadius;
    float mask = 1.0 - smoothstep(0.0, softness, sdf);

    gl_FragColor = vec4(col, mask);
}
`;

export default function ParallaxIntro({
  images = DEFAULT_IMAGES,
  planeLayout = DEFAULT_PLANE_LAYOUT,
  bgColor = "#ffffff",
  textColor = "#202124",
  accentFrom = "#4285F4",
  accentTo = "#2DAEB8",
  title = "Studio",
  subtitle = "A creative team crafting digital experiences",
  replayLabel = "Replay Intro",
  paragraphText = DEFAULT_PARAGRAPH,
  cameraDistance = 6,
  cameraFov = 70,
  pointerMaxAzimuthDeg = 9,
  pointerMinPolarDeg = 80,
  pointerMaxPolarDeg = 100,
  pointerLerpSpeed = 4,
  pointerMinWidth = 480,
  revealDuration = 1,
  enterDuration = 1.8,
  enterDelayOffset = 0.2,
  exitTranslateY = 10,
  exitTranslateX = 1.5,
  exitTranslateZ = 2,
  blurStrength = 0.0025,
  borderRadiusAmount = 0.08,
  className = "",
}) {
  const uid = useId();
  const canvasRef = useRef(null);
  const replayHandlerRef = useRef(() => {});

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    Promise.all([import("three"), import("gsap")])
      .then(([THREE, gsapModule]) => {
        if (cancelled || !canvasRef.current) return;
        const gsap = gsapModule.gsap || gsapModule.default;

        const canvas = canvasRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(cameraFov, 1, 0.1, 50);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);

        const textureLoader = new THREE.TextureLoader();
        const planes = planeLayout.map((cfg, i) => {
          const tex = textureLoader.load(images[i]);
          tex.colorSpace = THREE.SRGBColorSpace;

          const uniforms = {
            u_texture: { value: tex },
            u_planeAspect: { value: cfg.width / cfg.height },
            u_imageAspect: { value: 1 },
            u_reveal: { value: 0 },
            u_isBlurred: { value: cfg.blurred ? 1 : 0 },
            u_blurStrength: { value: blurStrength },
            u_borderRadiusAmount: { value: borderRadiusAmount },
            u_enterProgress: { value: 0 },
            u_exitProgress: { value: 0 },
            u_exitDir: {
              value: new THREE.Vector3(cfg.x < 0 ? -exitTranslateX : exitTranslateX, exitTranslateY, exitTranslateZ),
            },
          };

          tex.onUpdate = () => {
            uniforms.u_imageAspect.value = tex.image.width / tex.image.height;
          };

          const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(cfg.width, cfg.height, 1, 1),
            new THREE.ShaderMaterial({
              uniforms,
              vertexShader: VERTEX_SHADER,
              fragmentShader: FRAGMENT_SHADER,
              transparent: true,
              depthTest: false,
            }),
          );
          mesh.position.set(cfg.x, cfg.y, cfg.z);
          scene.add(mesh);

          return { mesh, uniforms, delay: cfg.delay };
        });

        const tweens = [];
        function playIntro() {
          tweens.forEach((t) => t.kill());
          tweens.length = 0;
          planes.forEach((p) => {
            tweens.push(
              gsap.fromTo(
                p.uniforms.u_reveal,
                { value: 0 },
                { value: 1, duration: revealDuration, ease: "power1.out", delay: p.delay },
              ),
            );
            tweens.push(
              gsap.fromTo(
                p.uniforms.u_enterProgress,
                { value: 0 },
                { value: 1, duration: enterDuration, ease: "power1.out", delay: enterDelayOffset + p.delay },
              ),
            );
          });
        }
        replayHandlerRef.current = playIntro;
        playIntro();

        const pointerTarget = { azimuth: 0, polar: Math.PI / 2 };
        const pointerCurrent = { azimuth: 0, polar: Math.PI / 2 };
        const minPolar = THREE.MathUtils.degToRad(pointerMinPolarDeg);
        const maxPolar = THREE.MathUtils.degToRad(pointerMaxPolarDeg);
        const maxAzimuth = THREE.MathUtils.degToRad(pointerMaxAzimuthDeg);

        function onPointerMove(e) {
          if (window.innerWidth < pointerMinWidth) return;
          const nx = e.clientX / window.innerWidth;
          const ny = e.clientY / window.innerWidth;
          pointerTarget.azimuth = THREE.MathUtils.lerp(-maxAzimuth, maxAzimuth, nx);
          pointerTarget.polar = THREE.MathUtils.lerp(minPolar, maxPolar, ny);
        }
        window.addEventListener("pointermove", onPointerMove);

        function onResize() {
          const w = canvas.parentElement.clientWidth;
          const h = window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
        window.addEventListener("resize", onResize);
        onResize();

        let rafId;
        let lastTime = performance.now();
        function animate() {
          rafId = requestAnimationFrame(animate);
          const now = performance.now();
          const delta = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;

          pointerCurrent.azimuth = THREE.MathUtils.lerp(pointerCurrent.azimuth, pointerTarget.azimuth, delta * pointerLerpSpeed);
          pointerCurrent.polar = THREE.MathUtils.lerp(pointerCurrent.polar, pointerTarget.polar, delta * pointerLerpSpeed);

          camera.position.set(
            cameraDistance * Math.sin(pointerCurrent.polar) * Math.sin(pointerCurrent.azimuth),
            cameraDistance * Math.cos(pointerCurrent.polar),
            cameraDistance * Math.sin(pointerCurrent.polar) * Math.cos(pointerCurrent.azimuth),
          );
          camera.lookAt(0, 0, 0);

          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const exitProgress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
          planes.forEach((p) => {
            p.uniforms.u_exitProgress.value = exitProgress;
          });

          renderer.render(scene, camera);
        }
        animate();

        cleanup = () => {
          cancelAnimationFrame(rafId);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("resize", onResize);
          tweens.forEach((t) => t.kill());
          planes.forEach((p) => {
            p.mesh.material.dispose();
            p.uniforms.u_texture.value?.dispose();
          });
          renderer.dispose();
        };
      })
      .catch((e) => console.error("[ParallaxIntro] scene setup failed:", e.message));

    return () => {
      cancelled = true;
      cleanup();
    };

  }, [images, planeLayout]);

  const renderHighlighted = (text) => {
    const parts = text.split(/{{highlight}}|{{\/highlight}}/);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={`${uid}-hl-${i}`} className="bg-clip-text [-webkit-text-fill-color:transparent]" style={{ backgroundImage: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}>
          {part}
        </span>
      ) : (
        <span key={`${uid}-txt-${i}`}>{part}</span>
      ),
    );
  };

  return (
    <main className={`relative w-full overflow-hidden ${className}`} style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="fixed inset-0 h-dvh w-full">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>

      <header className="relative flex h-svh w-full flex-col items-center justify-center gap-6 pointer-events-none">
        <h1 className="text-3xl md:text-8xl font-medium tracking-tighter" style={{ color: textColor }}>
          {title}
        </h1>
        <p className="text-lg opacity-70" style={{ color: textColor }}>
          {subtitle}
        </p>
        <div className="flex gap-4 pointer-events-auto">
          <button
            type="button"
            onClick={() => replayHandlerRef.current()}
            className="flex items-center gap-2 rounded-full px-7 py-3 font-semibold text-white transition-all duration-200 hover:shadow-md cursor-pointer"
            style={{ backgroundImage: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
          >
            {replayLabel}
          </button>
        </div>
      </header>

      <section className="relative flex w-full justify-center py-24">
        <p className="max-w-4xl text-balance text-center text-xl font-medium tracking-tight leading-snug md:text-4xl">
          {renderHighlighted(paragraphText)}
        </p>
      </section>

    </main>
  );
}