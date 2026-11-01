"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9",
];

const COPY = [
  {
    title: "Salty sea",
    text: "The water keeps no record of who looked at it, which is why people keep coming back to look at it again.",
  },
  {
    title: "Warm waves",
    text: "Heat arrives before the sound does, and by the time you hear the break it has already reached your feet.",
  },
  {
    title: "Inner life",
    text: "Everything worth noticing happens just under the surface, moving slowly enough that you have to stay still to see it.",
  },
];

const DEFAULT_ITEMS = IMAGES.map((url, i) => ({
  image: `${url}?auto=format&fit=crop&w=720&q=80`,
  imageLarge: `${url}?auto=format&fit=crop&w=1800&q=85`,
  title: COPY[i].title,
  text: COPY[i].text,
}));

const MOUSE_ACTIVATION = `float getActivation(vec2 uv){ float maxDistance = distance(uMouse, 1.-floor(uMouse+0.5)); return smoothstep(0.,maxDistance,distance(uMouse,uv)); }`;

const ensureFloat = (n) => {
  const s = String(n);
  return s.indexOf(".") === -1 ? s + "." : s;
};

const WAVY_TRANSFORM = (p) => `
    float limit = 0.5;
    float wavyProgress = min(clamp(vertexProgress/limit,0.,1.), clamp((1.-vertexProgress)/(1.-limit),0.,1.));
    float dist = length(transformedPos.xy);
    float angle = atan(transformedPos.x, transformedPos.y);
    float nextDist = dist * (${ensureFloat(p.amplitude)} * (sin(angle * ${ensureFloat(p.frequency)} + uSeed)/2.+0.5) + 1.);
    transformedPos.x = mix(transformedPos.x, sin(angle)*nextDist, wavyProgress);
    transformedPos.y = mix(transformedPos.y, cos(angle)*nextDist, wavyProgress);
  `;

const SIMPLEX = `
vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const buildShaders = (activation, transform) => ({
  vertex: `
uniform float uProgress;
uniform vec2 uScaleToViewSize;
uniform vec2 uPlaneCenter;
uniform vec2 uMeshScale;
uniform vec2 uMouse;
uniform vec2 uViewSize;
uniform float uClosestCorner;
uniform float uSeed;
uniform float uSyncLatestStart;
uniform float uActivationParts;
uniform bool uProgressByParts;
varying vec2 vUv;
varying vec2 scale;
varying float vProgress;
${SIMPLEX}
${activation}
float linearStep(float edge0, float edge1, float val){ return clamp((val - edge0)/(edge1 - edge0), 0., 1.); }
void main(){
  vec3 pos = position.xyz;
  vec2 newUV = uv;
  float activation = getActivation(uv);
  float startAt = activation * uSyncLatestStart;
  float vertexProgress = smoothstep(startAt, 1., uProgress);
  if (uProgressByParts) {
    float activationPart = 1./uActivationParts;
    float activationPartDuration = 1./(uActivationParts+1.);
    float progressStart = (activation / activationPart) * activationPartDuration;
    float progressEnd = min(progressStart + activationPartDuration, 1.);
    vertexProgress = linearStep(progressStart, progressEnd, uProgress);
  }
  vec3 transformedPos = pos;
  vec2 transformedUV = uv;
  ${transform}
  pos = transformedPos;
  newUV = transformedUV;
  scale = vec2(1. + uScaleToViewSize * vertexProgress);
  pos.xy *= scale;
  pos.y += -uPlaneCenter.y * vertexProgress;
  pos.x += -uPlaneCenter.x * vertexProgress;
  pos.z += vertexProgress;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  vProgress = vertexProgress;
  vUv = newUV;
}
`,
  fragment: `
uniform float uProgress;
uniform sampler2D uImage;
uniform vec2 uImageRes;
uniform sampler2D uImageLarge;
uniform vec2 uImageLargeRes;
uniform vec2 uMeshScale;
varying vec2 vUv;
varying float vProgress;
varying vec2 scale;
vec2 preserveAspectRatioSlice(vec2 uv, vec2 planeSize, vec2 imageSize){
  vec2 ratio = vec2(
    min((planeSize.x / planeSize.y) / (imageSize.x / imageSize.y), 1.0),
    min((planeSize.y / planeSize.x) / (imageSize.y / imageSize.x), 1.0)
  );
  return vec2(uv.x * ratio.x + (1.0-ratio.x)*0.5, uv.y * ratio.y + (1.0-ratio.y)*0.5);
}
void main(){
  vec2 uv = vUv;
  vec2 scaledPlane = uMeshScale * scale;
  vec2 smallImageUV = preserveAspectRatioSlice(uv, scaledPlane, uImageRes);
  vec3 color = texture2D(uImage, smallImageUV).xyz;
  if (vProgress > 0.) {
    vec2 largeImageUV = preserveAspectRatioSlice(uv, scaledPlane, uImageLargeRes);
    color = mix(color, texture2D(uImageLarge, largeImageUV).xyz, vProgress);
  }
  gl_FragColor = vec4(color, 1.);
}
`,
});

export default function LiquidGridGallery({
  items = DEFAULT_ITEMS,
  bgColor = "#2701ad",
  textColor = "#fe952c",
  gridTextColor = "#08afef",
  titleColor = "#ffffff",
  decoColor = "#320db9",
  decoText = "Connect",
  decoRows = 5,
  showDeco = true,
  heading = "Collection",
  duration = 1.6,
  timingSections = 1,
  latestStart = 0.5,
  seed = 800,
  waveAmplitude = 1,
  waveFrequency = 0.1,
  segments = 128,
  easeToFullscreen = "power2.out",
  easeToGrid = "power3.inOut",
  seedPerItem = 10,
  revealDelayFactor = 0.15,
  titleScaleFrom = 0.2,
  gridColumns = "31% 36% 33%",
  gridMaxWidth = "1200px",
  displayFont = "Futura, 'Century Gothic', Helvetica, Arial, sans-serif",
  bodyFont = "Futura, 'Century Gothic', Helvetica, Arial, sans-serif",
  className = "",
}) {
  const rawId = useId();
  const uid = useMemo(
    () => "gf-" + rawId.replace(/[^a-zA-Z0-9]/g, ""),
    [rawId],
  );

  const canvasHostRef = useRef(null);
  const gridRef = useRef(null);
  const thumbRefs = useRef([]);
  const titleRefs = useRef([]);
  const closeRef = useRef(null);

  const fxRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;

    let cleanupResize = null;

    Promise.all([import("three"), import("gsap")])
      .then(([THREE, gsapModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap || gsapModule.default;
        if (!THREE || !gsap || !canvasHostRef.current) return;

        const host = canvasHostRef.current;

        const uniforms = {
          uImage: new THREE.Uniform(null),
          uImageRes: new THREE.Uniform(new THREE.Vector2(1, 1)),
          uImageLarge: new THREE.Uniform(null),
          uImageLargeRes: new THREE.Uniform(new THREE.Vector2(1, 1)),
          uProgress: new THREE.Uniform(0),
          uMeshScale: new THREE.Uniform(new THREE.Vector2(1, 1)),
          uPlaneCenter: new THREE.Uniform(new THREE.Vector2(0, 0)),
          uViewSize: new THREE.Uniform(new THREE.Vector2(1, 1)),
          uScaleToViewSize: new THREE.Uniform(new THREE.Vector2(1, 1)),
          uClosestCorner: new THREE.Uniform(0),
          uMouse: new THREE.Uniform(new THREE.Vector2(0, 0)),
          uSeed: new THREE.Uniform(seed),
          uProgressByParts: new THREE.Uniform(true),
          uActivationParts: new THREE.Uniform(timingSections),
          uSyncLatestStart: new THREE.Uniform(latestStart),
        };

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          10000,
        );
        camera.position.z = 50;

        const getViewSize = () => {
          const fovInRadians = (camera.fov * Math.PI) / 180;
          const height = Math.abs(
            camera.position.z * Math.tan(fovInRadians / 2) * 2,
          );
          return { width: height * camera.aspect, height };
        };

        const vs = getViewSize();
        uniforms.uViewSize.value = new THREE.Vector2(vs.width, vs.height);

        const shaders = buildShaders(
          MOUSE_ACTIVATION,
          WAVY_TRANSFORM({
            amplitude: waveAmplitude,
            frequency: waveFrequency,
          }),
        );

        const geometry = new THREE.PlaneGeometry(
          1,
          1,
          segments,
          segments,
        );
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: shaders.vertex,
          fragmentShader: shaders.fragment,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.00001, 0.00001, 1);
        scene.add(mesh);

        const render = () => renderer.render(scene, camera);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        const makeTexture = (url) =>
          new Promise((resolve) => {
            loader.load(
              url,
              (t) => {
                t.generateMipmaps = false;
                t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
                t.minFilter = THREE.LinearFilter;
                t.needsUpdate = true;
                resolve(t);
              },
              undefined,
              () => resolve(null),
            );
          });

        const textures = [];
        items.forEach((item, i) => {
          Promise.all([
            makeTexture(item.image),
            makeTexture(item.imageLarge || item.image),
          ]).then(([small, large]) => {
            if (cancelled) return;
            textures[i] = { small, large };
          });
        });

        const fx = {
          THREE,
          gsap,
          renderer,
          scene,
          camera,
          mesh,
          uniforms,
          textures,
          render,
          getViewSize,
          host,
          isFullscreen: false,
          isAnimating: false,
          currentIndex: -1,
        };
        fxRef.current = fx;

        fx.recalculate = (clientX, clientY) => {
          const el = thumbRefs.current[fx.currentIndex];
          if (!el) return;
          const rect = el.getBoundingClientRect();

          if (clientX !== undefined && clientY !== undefined) {
            const mx = (clientX - rect.left) / rect.width;
            const my = 1 - (clientY - rect.top) / rect.height;
            const xIndex =
              rect.left > window.innerWidth - (rect.left + rect.width);
            const yIndex =
              rect.top > window.innerHeight - (rect.top + rect.height);
            uniforms.uClosestCorner.value = xIndex * 2 + yIndex;
            uniforms.uMouse.value = new THREE.Vector2(mx, my);
          }

          const viewSize = getViewSize();
          const widthViewUnit =
            (rect.width * viewSize.width) / window.innerWidth;
          const heightViewUnit =
            (rect.height * viewSize.height) / window.innerHeight;
          const xViewUnit =
            (rect.left * viewSize.width) / window.innerWidth -
            viewSize.width / 2;
          const yViewUnit =
            (rect.top * viewSize.height) / window.innerHeight -
            viewSize.height / 2;

          mesh.scale.x = widthViewUnit;
          mesh.scale.y = heightViewUnit;
          const x = xViewUnit + widthViewUnit / 2;
          const y = -yViewUnit - heightViewUnit / 2;
          mesh.position.x = x;
          mesh.position.y = y;

          uniforms.uPlaneCenter.value.x = x / widthViewUnit;
          uniforms.uPlaneCenter.value.y = y / heightViewUnit;
          uniforms.uMeshScale.value.x = widthViewUnit;
          uniforms.uMeshScale.value.y = heightViewUnit;
          uniforms.uScaleToViewSize.value.x =
            viewSize.width / widthViewUnit - 1;
          uniforms.uScaleToViewSize.value.y =
            viewSize.height / heightViewUnit - 1;
        };

        fx.resetUniforms = () => {
          uniforms.uMeshScale.value = new THREE.Vector2(1, 1);
          uniforms.uPlaneCenter.value = new THREE.Vector2(0, 0);
          uniforms.uScaleToViewSize.value = new THREE.Vector2(1, 1);
          uniforms.uClosestCorner.value = 0;
          uniforms.uMouse.value = new THREE.Vector2(0, 0);
          uniforms.uImage.value = null;
          uniforms.uImageLarge.value = null;
          mesh.scale.set(0.00001, 0.00001, 1);
          mesh.position.set(0, 0, 0);
        };

        const onResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          const v = getViewSize();
          uniforms.uViewSize.value.set(v.width, v.height);
          if (fx.currentIndex > -1) {
            fx.recalculate();
            render();
          }
        };
        window.addEventListener("resize", onResize);

        const onScroll = () => {
          if (fx.currentIndex === -1) return;
          fx.recalculate();
          render();
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        cleanupResize = () => {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("scroll", onScroll);
        };
        render();
      })
      .catch((e) =>
        console.error("[LiquidGridGallery] library load failed:", e.message),
      );

    return () => {
      cancelled = true;
      if (cleanupResize) cleanupResize();
      const fx = fxRef.current;
      if (fx) {
        fx.gsap.killTweensOf(fx.uniforms.uProgress);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        fx.renderer.dispose();
        if (fx.renderer.domElement.parentNode) {
          fx.renderer.domElement.parentNode.removeChild(fx.renderer.domElement);
        }
        fxRef.current = null;
      }
    };
  }, [
    items,
    timingSections,
    latestStart,
    seed,
    waveAmplitude,
    waveFrequency,
    segments,
  ]);

  const openFullscreen = (index, e) => {
    const fx = fxRef.current;
    if (!fx || fx.isFullscreen || fx.isAnimating) return;
    const set = fx.textures[index];
    if (!set || !set.small || !set.large) return;

    fx.isAnimating = true;
    fx.currentIndex = index;
    if (seedPerItem) fx.uniforms.uSeed.value = index * seedPerItem;
    fx.recalculate(e.clientX, e.clientY);

    fx.uniforms.uImage.value = set.small;
    fx.uniforms.uImageRes.value.set(
      set.small.image.naturalWidth,
      set.small.image.naturalHeight,
    );
    fx.uniforms.uImageLarge.value = set.large;
    fx.uniforms.uImageLargeRes.value.set(
      set.large.image.naturalWidth,
      set.large.image.naturalHeight,
    );

    if (gridRef.current) gridRef.current.style.zIndex = 0;
    fx.host.style.zIndex = 2;
    if (thumbRefs.current[index]) {
      thumbRefs.current[index].style.opacity = 0;
    }
    setOpenIndex(index);

    fx.gsap.to(fx.uniforms.uProgress, {
      duration,
      value: 1,
      ease: easeToFullscreen,
      onUpdate: fx.render,
      onComplete: () => {
        fx.isAnimating = false;
        fx.isFullscreen = true;
      },
    });
  };

  useEffect(() => {
    const fx = fxRef.current;
    if (!fx || openIndex === -1) return;
    const t = titleRefs.current[openIndex];
    const targets = [t, closeRef.current].filter(Boolean);
    if (!targets.length) return;
    if (t) {
      fx.gsap.fromTo(
        t,
        { scale: titleScaleFrom, opacity: 0 },
        {
          duration: 0.6,
          ease: "power3.out",
          scale: 1,
          opacity: 1,
          delay: duration * revealDelayFactor,
        },
      );
    }
    if (closeRef.current) {
      fx.gsap.fromTo(
        closeRef.current,
        { scale: titleScaleFrom, opacity: 0 },
        {
          duration: 1,
          ease: "power3.out",
          scale: 1,
          opacity: 1,
          delay: duration * revealDelayFactor,
        },
      );
    }
  }, [openIndex, duration, revealDelayFactor, titleScaleFrom]);

  const backToGrid = () => {
    const fx = fxRef.current;
    if (!fx || fx.isAnimating || openIndex === -1) return;
    fx.isAnimating = true;
    const index = openIndex;

    const t = titleRefs.current[index];
    if (t) {
      fx.gsap.to(t, {
        duration: 1,
        ease: "power3.inOut",
        opacity: 0,
        scale: titleScaleFrom,
      });
    }
    if (closeRef.current) {
      fx.gsap.to(closeRef.current, {
        duration: 1,
        ease: "power3.inOut",
        opacity: 0,
        scale: titleScaleFrom,
      });
    }

    fx.gsap.to(fx.uniforms.uProgress, {
      duration,
      value: 0,
      ease: easeToGrid,
      onUpdate: fx.render,
      onComplete: () => {
        fx.isAnimating = false;
        fx.isFullscreen = false;
        if (gridRef.current) gridRef.current.style.zIndex = 1;
        fx.host.style.zIndex = 0;
        if (thumbRefs.current[index]) {
          thumbRefs.current[index].style.opacity = 1;
        }
        fx.resetUniforms();
        fx.render();
        fx.currentIndex = -1;
        setOpenIndex(-1);
      },
    });
  };

  return (
    <div
      className={`${uid} relative w-full overflow-hidden ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
.${uid}-deco {
  -webkit-text-stroke: 2px ${decoColor};
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.${uid}-close:focus { outline: none; }
`,
        }}
      />

      <div className="relative z-10 px-6 py-12 md:grid md:grid-cols-[60%_40%] md:px-12 md:py-8">
        <h1
          className="m-0 text-[1rem] font-medium"
          style={{ fontFamily: displayFont }}
        >
          {heading}
        </h1>
      </div>

      {showDeco && (
        <div
          className={`${uid}-deco pointer-events-none absolute inset-0 z-0 text-center uppercase leading-tight`}
          style={{ fontSize: "8.5vw", fontFamily: displayFont }}
        >
          {Array.from({ length: decoRows }).map((_, i) => (
            <div key={i}>{decoText}</div>
          ))}
        </div>
      )}

      <div
        ref={canvasHostRef}
        className="pointer-events-none fixed left-0 top-0 z-0 h-screen w-screen overflow-hidden"
      />

      <div
        ref={gridRef}
        className="relative z-[1] mx-auto max-w-[300px] p-4 md:mt-[10vh] md:grid md:w-full md:p-0"
        style={{ gridTemplateColumns: gridColumns, maxWidth: gridMaxWidth }}
      >
        {items.map((item, i) => (
          <figure
            key={i}
            className={`m-0 mb-16 md:px-[4.5vw] ${
              i % 3 === 0 ? "md:pt-[35%]" : ""
            } ${i % 3 === 2 ? "md:pt-[40%]" : ""}`}
          >
            <img
              ref={(el) => (thumbRefs.current[i] = el)}
              src={item.image}
              alt={item.title}
              draggable={false}
              onMouseDown={(e) => openFullscreen(i, e)}
              onTouchStart={(e) =>
                openFullscreen(i, {
                  clientX: e.touches[0].clientX,
                  clientY: e.touches[0].clientY,
                })
              }
              className="block max-w-full cursor-pointer"
            />
            <figcaption>
              <h2
                className="my-5 text-[2.25rem] font-normal leading-none"
                style={{ color: titleColor, fontFamily: displayFont }}
              >
                {item.title}
              </h2>
              <p className="text-[0.95rem]" style={{ color: gridTextColor }}>
                {item.text}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="pointer-events-none fixed left-0 top-0 z-[3] grid h-full w-full grid-cols-1 p-8">
        {items.map((item, i) => (
          <div
            key={i}
            className={`col-start-1 row-start-1 grid grid-cols-2 ${
              openIndex === i ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <h2
              ref={(el) => (titleRefs.current[i] = el)}
              className="m-0 ml-1 select-none self-end text-[4rem] font-normal leading-none opacity-0"
              style={{ color: titleColor, fontFamily: displayFont }}
            >
              {item.title}
            </h2>
          </div>
        ))}
      </div>

      {openIndex !== -1 && (
        <button
          ref={closeRef}
          type="button"
          onClick={backToGrid}
          aria-label="Close preview"
          className={`${uid}-close pointer-events-auto fixed right-8 top-8 z-[1000] m-0 cursor-pointer border-0 bg-transparent p-0 text-white opacity-0`}
        >
          <svg width="24" height="22" viewBox="0 0 24 22" fill="currentColor">
            <path d="M11 9.586L20.192.393l1.415 1.415L12.414 11l9.193 9.192-1.415 1.415L11 12.414l-9.192 9.193-1.415-1.415L9.586 11 .393 1.808 1.808.393 11 9.586z" />
          </svg>
        </button>
      )}
    </div>
  );
}
