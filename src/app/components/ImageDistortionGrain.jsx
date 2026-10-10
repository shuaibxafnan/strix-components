"use client";

import { useEffect, useId, useRef } from "react";
import * as THREE from "three";

// ─── ImageDistortionGrain ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #fff      Page background
// textColor          string   #232222   Base text color
// images             array    [...]     Array of { src, alt, code, name } — one figure per entry
// imageRadiusClassName string "rounded-none"  Tailwind rounded-* class applied to each <img> (read back via getComputedStyle to drive the shader's rounded-corner uniform)
// canvasOpacity      number   1         Opacity of the WebGL canvas layer sitting on top of the (hidden) DOM images
// cameraDistance     number   500       Camera Z position, controls the perspective/fov used to match WebGL plane size to DOM pixel size
// cursorLerp         number   0.05      Damping factor for the smoothed global cursor position
// hoverLerp          number   0.05      Damping factor for the smoothed per-image mouse-over position
// hoverDuration      number   0.6       Duration (s) of the mouse-enter/leave uMouseEnter tween
// hoverEase          string   "0.4, 0, 0.2, 1"   Cubic-bezier control points for the CustomEase used on hover tweens
// circleRadius       number   15        Size of the mouse-follow distortion circle (higher = smaller circle)
// noiseStrength      number   0.01      Strength of the grain/noise UV displacement
// scrollInfluence    number   0.1       How much scroll velocity adds into the noise displacement mix
// maxScrollDeform    number   5         Clamp on scroll velocity used for the vertical wave deformation
// deformStrength     number   0.01      Strength of the per-vertex scroll deformation curve
// lerp               number   1         Lenis smooth-scroll lerp amount (1 = default/no extra smoothing beyond Lenis's own easing)
// containerMaxWidth  string   "120rem"  Max width of the image grid container
// gridColumns        number   6         Number of columns in the outer grid
// gridGutter         string   "clamp(0.625rem, -0.2463rem + 3.7175vw, 3.75rem)"   Column/row gutter formula for the outer grid
// figureSpans        array    [...]     Per-figure grid placement: [{ col: "2 / span 3", row: "1" }, ...] — must match `images` length
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=900&q=80",
    alt: "Ceramic piece one",
    code: "X05",
    name: "Kenji Sato",
  },
  {
    src: "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=900&q=80",
    alt: "Ceramic piece two",
    code: "M33",
    name: "Yusuke Tanaka",
  },
  {
    src: "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=900&q=80",
    alt: "Ceramic piece three",
    code: "Y78",
    name: "Mei Yamamoto",
  },
  {
    src: "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=900&q=80",
    alt: "Ceramic piece four",
    code: "K08",
    name: "Natsumi Ito",
  },
  {
    src: "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=900&q=80",
    alt: "Ceramic piece five",
    code: "F03",
    name: "Miku Inoue",
  },
];

// Mirrors the original .img-wrap-1..5 grid-column/grid-row placement exactly.
const DEFAULT_FIGURE_SPANS = [
  { col: "2 / span 3", row: "1" },
  { col: "4 / span 3", row: "2" },
  { col: "3 / span 3", row: "3" },
  { col: "1 / span 3", row: "4" },
  { col: "4 / span 3", row: "5" },
];

// ─── Inlined GLSL — the original demo pulls these in via #include; browsers
// can't resolve that, so the noise/utils source is merged directly into the
// vertex/fragment strings below. ─────────────────────────────────────────────
const UTILS_GLSL = `
vec2 getCoverUvVert(vec2 uv, vec2 textureSize, vec2 quadSize) {
  vec2 ratio = vec2(
    min((quadSize.x / quadSize.y) / (textureSize.x / textureSize.y), 1.0),
    min((quadSize.y / quadSize.x) / (textureSize.y / textureSize.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}
`;

const NOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const SHARED_UNIFORMS_GLSL = `
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uCursor;
uniform float uScrollVelocity;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform vec2 uQuadSize;
uniform float uBorderRadius;
uniform float uMouseEnter;
uniform vec2 uMouseOverPos;
uniform float uCircleRadius;
uniform float uNoiseStrength;
uniform float uScrollInfluence;
uniform float uMaxScrollDeform;
uniform float uDeformStrength;
`;

const EFFECT_VERTEX = `
${SHARED_UNIFORMS_GLSL}
${UTILS_GLSL}
out vec2 vUv;
out vec2 vUvCover;

float PI = 3.141592653589793;
vec3 deformationCurve(vec3 position, vec2 uv) {
  position.y = position.y - (sin(uv.x * PI) * min(abs(uScrollVelocity), uMaxScrollDeform) * sign(uScrollVelocity) * -uDeformStrength);
  return position;
}
void main() {
  vUv = uv;
  vUvCover = getCoverUvVert(uv, uTextureSize, uQuadSize);
  vec3 deformedPosition = deformationCurve(position, vUvCover);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(deformedPosition, 1.0);
}
`;

const EFFECT_FRAGMENT = `
precision highp float;
${SHARED_UNIFORMS_GLSL}
in vec2 vUv;
in vec2 vUvCover;
${NOISE_GLSL}
out vec4 outColor;
void main() {
  vec2 texCoords = vUvCover;
  float aspectRatio = uQuadSize.y / uQuadSize.x;
  float circle = 1.0 - distance(
    vec2(uMouseOverPos.x, (1.0 - uMouseOverPos.y) * aspectRatio),
    vec2(vUv.x, vUv.y * aspectRatio)
  ) * uCircleRadius;
  float noise = snoise(gl_FragCoord.xy);
  texCoords.x += mix(0.0, circle * noise * uNoiseStrength, uMouseEnter + uScrollVelocity * uScrollInfluence);
  texCoords.y += mix(0.0, circle * noise * uNoiseStrength, uMouseEnter + uScrollVelocity * uScrollInfluence);
  vec3 tex = vec3(texture(uTexture, texCoords));
  outColor = vec4(tex, 1.0);
}
`;

const lerp = (start, end, damping) => start * (1 - damping) + end * damping;
const calcFov = (cameraPos) =>
  (2 * Math.atan(window.innerHeight / 2 / cameraPos) * 180) / Math.PI;
const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(null, args), timeout);
  };
};

export default function ImageDistortionGrain({
  bgColor = "#fff",
  textColor = "#232222",
  images = DEFAULT_IMAGES,
  imageRadiusClassName = "rounded-none",
  canvasOpacity = 1,
  cameraDistance = 500,
  cursorLerp = 0.05,
  hoverLerp = 0.05,
  hoverDuration = 0.6,
  hoverEase = "0.4, 0, 0.2, 1",
  circleRadius = 15,
  noiseStrength = 0.01,
  scrollInfluence = 0.1,
  maxScrollDeform = 5,
  deformStrength = 0.01,
  lerp: lenisLerp = 1,
  containerMaxWidth = "120rem",
  gridColumns = 6,
  gridGutter = "clamp(0.625rem, -0.2463rem + 3.7175vw, 3.75rem)",
  figureSpans = DEFAULT_FIGURE_SPANS,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const uid = useId();

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let disposed = false;
    let lenisInstance;
    let renderRafId;
    let cursorRafId;
    let observer;
    let mediaStore = [];
    let renderer;
    let scene;
    let geometry;
    let material;
    let camera;
    const handleResize = debounce(onResize);

    const scroll = { scrollY: window.scrollY, scrollVelocity: 0 };
    const cursorPos = {
      current: { x: 0.5, y: 0.5 },
      target: { x: 0.5, y: 0.5 },
    };

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
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    const preloadImages = () => {
      const imgs = Array.from(root.querySelectorAll("[data-webgl-media]"));
      return Promise.all(
        imgs.map(
          (imgEl) =>
            new Promise((resolve) => {
              if (imgEl.complete && imgEl.naturalWidth) {
                resolve();
                return;
              }
              imgEl.onload = resolve;
              imgEl.onerror = resolve;
            }),
        ),
      );
    };

    function lerpCursorPos() {
      cursorPos.current.x = lerp(
        cursorPos.current.x,
        cursorPos.target.x,
        cursorLerp,
      );
      cursorPos.current.y = lerp(
        cursorPos.current.y,
        cursorPos.target.y,
        cursorLerp,
      );

      const delta = Math.sqrt(
        (cursorPos.target.x - cursorPos.current.x) ** 2 +
          (cursorPos.target.y - cursorPos.current.y) ** 2,
      );

      if (delta < 0.001 && cursorRafId) {
        cancelAnimationFrame(cursorRafId);
        cursorRafId = null;
        return;
      }
      cursorRafId = requestAnimationFrame(lerpCursorPos);
    }

    function onMouseMove(event) {
      cursorPos.target.x = event.clientX / window.innerWidth;
      cursorPos.target.y = event.clientY / window.innerHeight;
      if (!cursorRafId) cursorRafId = requestAnimationFrame(lerpCursorPos);
    }

    function handleMouseEnter(index) {
      const { gsap, CustomEase } = window;
      if (!gsap || !CustomEase) return;
      gsap.to(mediaStore[index], {
        mouseEnter: 1,
        duration: hoverDuration,
        ease: CustomEase.create(`${uid}-in`, hoverEase),
      });
    }

    function handleMousePos(e, index) {
      const bounds = mediaStore[index].media.getBoundingClientRect();
      mediaStore[index].mouseOverPos.target.x = e.offsetX / bounds.width;
      mediaStore[index].mouseOverPos.target.y = e.offsetY / bounds.height;
    }

    function handleMouseLeave(index) {
      const { gsap, CustomEase } = window;
      if (!gsap || !CustomEase) return;
      gsap.to(mediaStore[index], {
        mouseEnter: 0,
        duration: hoverDuration,
        ease: CustomEase.create(`${uid}-out`, hoverEase),
      });
      gsap.to(mediaStore[index].mouseOverPos.target, {
        x: 0.5,
        y: 0.5,
        duration: hoverDuration,
        ease: CustomEase.create(`${uid}-out2`, hoverEase),
      });
    }

    function setMediaStore(scrollY) {
      const mediaEls = Array.from(root.querySelectorAll("[data-webgl-media]"));

      mediaStore = mediaEls.map((mediaEl, i) => {
        observer.observe(mediaEl);

        mediaEl.dataset.index = String(i);
        mediaEl.addEventListener("mouseenter", () => handleMouseEnter(i));
        mediaEl.addEventListener("mousemove", (e) => handleMousePos(e, i));
        mediaEl.addEventListener("mouseleave", () => handleMouseLeave(i));

        const bounds = mediaEl.getBoundingClientRect();
        const imageMaterial = material.clone();
        const imageMesh = new THREE.Mesh(geometry, imageMaterial);

        const texture = new THREE.Texture(mediaEl);
        texture.needsUpdate = true;

        imageMaterial.uniforms.uTexture.value = texture;
        imageMaterial.uniforms.uTextureSize.value.x = mediaEl.naturalWidth;
        imageMaterial.uniforms.uTextureSize.value.y = mediaEl.naturalHeight;
        imageMaterial.uniforms.uQuadSize.value.x = bounds.width;
        imageMaterial.uniforms.uQuadSize.value.y = bounds.height;
        imageMaterial.uniforms.uBorderRadius.value =
          parseFloat(getComputedStyle(mediaEl).borderRadius) || 0;

        imageMesh.scale.set(bounds.width, bounds.height, 1);

        if (!(bounds.top >= 0 && bounds.top <= window.innerHeight)) {
          imageMesh.position.y = 2 * window.innerHeight;
        }

        scene.add(imageMesh);

        return {
          media: mediaEl,
          material: imageMaterial,
          mesh: imageMesh,
          width: bounds.width,
          height: bounds.height,
          top: bounds.top + scrollY,
          left: bounds.left,
          isInView:
            bounds.top >= -500 && bounds.top <= window.innerHeight + 500,
          mouseEnter: 0,
          mouseOverPos: {
            current: { x: 0.5, y: 0.5 },
            target: { x: 0.5, y: 0.5 },
          },
        };
      });
    }

    function setPositions() {
      mediaStore.forEach((object) => {
        if (object.isInView) {
          object.mesh.position.x =
            object.left - window.innerWidth / 2 + object.width / 2;
          object.mesh.position.y =
            -object.top +
            window.innerHeight / 2 -
            object.height / 2 +
            scroll.scrollY;
        }
      });
    }

    function render(time = 0) {
      if (disposed) return;
      time /= 1000;

      mediaStore.forEach((object) => {
        if (object.isInView) {
          object.mouseOverPos.current.x = lerp(
            object.mouseOverPos.current.x,
            object.mouseOverPos.target.x,
            hoverLerp,
          );
          object.mouseOverPos.current.y = lerp(
            object.mouseOverPos.current.y,
            object.mouseOverPos.target.y,
            hoverLerp,
          );

          object.material.uniforms.uResolution.value.x = window.innerWidth;
          object.material.uniforms.uResolution.value.y = window.innerHeight;
          object.material.uniforms.uTime.value = time;
          object.material.uniforms.uCursor.value.x = cursorPos.current.x;
          object.material.uniforms.uCursor.value.y = cursorPos.current.y;
          object.material.uniforms.uScrollVelocity.value =
            scroll.scrollVelocity;
          object.material.uniforms.uMouseOverPos.value.x =
            object.mouseOverPos.current.x;
          object.material.uniforms.uMouseOverPos.value.y =
            object.mouseOverPos.current.y;
          object.material.uniforms.uMouseEnter.value = object.mouseEnter;
        } else {
          object.mesh.position.y = 2 * window.innerHeight;
        }
      });

      setPositions();
      renderer.render(scene, camera);
      renderRafId = requestAnimationFrame(render);
    }

    function onResize() {
      const fov = calcFov(cameraDistance);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = fov;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      mediaStore.forEach((object) => {
        const bounds = object.media.getBoundingClientRect();
        object.mesh.scale.set(bounds.width, bounds.height, 1);
        object.width = bounds.width;
        object.height = bounds.height;
        object.top = bounds.top + scroll.scrollY;
        object.left = bounds.left;
        object.isInView = bounds.top >= 0 && bounds.top <= window.innerHeight;
        object.material.uniforms.uTextureSize.value.x =
          object.media.naturalWidth;
        object.material.uniforms.uTextureSize.value.y =
          object.media.naturalHeight;
        object.material.uniforms.uQuadSize.value.x = bounds.width;
        object.material.uniforms.uQuadSize.value.y = bounds.height;
        object.material.uniforms.uBorderRadius.value =
          parseFloat(getComputedStyle(object.media).borderRadius) || 0;
      });
    }

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js",
      ),
      loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"),
    ])
      .then(() => preloadImages())
      .then(() => {
        if (disposed) return;
        const { gsap, CustomEase, Lenis } = window;
        if (!gsap || !CustomEase || !Lenis) return;
        gsap.registerPlugin(CustomEase);

        // Smooth scroll, feeding both ScrollTrigger-less scrollY tracking and
        // the shader's scroll-velocity uniform.
        lenisInstance = new Lenis({ lerp: lenisLerp });
        lenisInstance.on("scroll", (e) => {
          scroll.scrollY = window.scrollY;
          scroll.scrollVelocity = e.velocity;
        });
        const raf = (time) => {
          lenisInstance.raf(time);
          if (!disposed) requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("resize", handleResize);

        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const index = entry.target.dataset.index;
              if (index !== undefined && mediaStore[parseInt(index, 10)]) {
                mediaStore[parseInt(index, 10)].isInView = entry.isIntersecting;
              }
            });
          },
          { rootMargin: "500px 0px 500px 0px" },
        );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
          50,
          window.innerWidth / window.innerHeight,
          10,
          1000,
        );
        camera.position.z = cameraDistance;
        camera.fov = calcFov(cameraDistance);
        camera.updateProjectionMatrix();

        geometry = new THREE.PlaneGeometry(1, 1, 100, 100);
        material = new THREE.ShaderMaterial({
          uniforms: {
            uResolution: {
              value: new THREE.Vector2(window.innerWidth, window.innerHeight),
            },
            uTime: { value: 0 },
            uCursor: { value: new THREE.Vector2(0.5, 0.5) },
            uScrollVelocity: { value: 0 },
            uTexture: { value: null },
            uTextureSize: { value: new THREE.Vector2(100, 100) },
            uQuadSize: { value: new THREE.Vector2(100, 100) },
            uBorderRadius: { value: 0 },
            uMouseEnter: { value: 0 },
            uMouseOverPos: { value: new THREE.Vector2(0.5, 0.5) },
            uCircleRadius: { value: circleRadius },
            uNoiseStrength: { value: noiseStrength },
            uScrollInfluence: { value: scrollInfluence },
            uMaxScrollDeform: { value: maxScrollDeform },
            uDeformStrength: { value: deformStrength },
          },
          vertexShader: EFFECT_VERTEX,
          fragmentShader: EFFECT_FRAGMENT,
          glslVersion: THREE.GLSL3,
        });

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        setMediaStore(scroll.scrollY);
        renderRafId = requestAnimationFrame(render);
        root.classList.remove("idg-loading");
      })
      .catch((e) =>
        console.error("[ImageDistortionGrain] load failed:", e.message),
      );

    return () => {
      disposed = true;
      if (renderRafId) cancelAnimationFrame(renderRafId);
      if (cursorRafId) cancelAnimationFrame(cursorRafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
      if (lenisInstance) lenisInstance.destroy();
      mediaStore.forEach((object) => {
        object.material.uniforms.uTexture.value?.dispose();
        object.material.dispose();
      });
      if (geometry) geometry.dispose();
      if (renderer) renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className="idg-loading relative w-full"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            [data-webgl-media] { opacity: 0; }
            html, body { scrollbar-width: none; -ms-overflow-style: none; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
          `,
        }}
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[100] h-full w-full"
        style={{ opacity: canvasOpacity }}
      />

      <div className="relative p-6">
        <div className="mx-auto" style={{ maxWidth: containerMaxWidth }}>
          <div
            className="grid [padding-block:6rem]"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
              gap: `calc(${gridGutter} * 5) ${gridGutter}`,
            }}
          >
            {images.map((image, i) => {
              const span =
                figureSpans[i] || figureSpans[figureSpans.length - 1];
              return (
                <figure
                  key={i}
                  className="m-0 grid max-w-full grid-cols-3 gap-4"
                  style={{ gridColumn: span.col, gridRow: span.row }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-webgl-media
                    src={image.src}
                    alt={image.alt}
                    crossOrigin="anonymous"
                    className={`col-[1_/_span_2] block max-w-full ${imageRadiusClassName}`}
                  />
                  <figcaption className="max-w-[200px] self-end">
                    <strong className="block">{image.code}</strong>
                    <span className="block">{image.name}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
