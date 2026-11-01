"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, addEffect, extend, useFrame } from "@react-three/fiber";
import {
  OrthographicCamera,
  Preload,
  View,
  shaderMaterial,
} from "@react-three/drei";
import * as THREE from "three";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_ITEMS = [
  { title: "Embrace of Heat", year: "2023", r: 1, c: 1, s: 4 },
  { title: "Silence in Sand", year: "2022", r: 2, c: 5, s: 3 },
  { title: "Whispers of Earth", year: "2024", r: 3, c: 3, s: 2 },
  { title: "Mirage in Time", year: "2021", r: 4, c: 1, s: 2 },
  { title: "Veiled in Gold", year: "2023", r: 5, c: 3, s: 5 },
  { title: "Ancient Sands Speak", year: "2022", r: 6, c: 2, s: 1 },
  { title: "Dreams of Dust", year: "2024", r: 7, c: 3, s: 3 },
  { title: "Gilded Sands Sing", year: "2021", r: 8, c: 6, s: 2 },
  { title: "Mirrored Illusions Fade", year: "2023", r: 9, c: 1, s: 5 },
  { title: "Ripples in Time", year: "2022", r: 10, c: 6, s: 3 },
  { title: "Essence of Silence", year: "2024", r: 11, c: 4, s: 2 },
  { title: "Luxury in Lines", year: "2021", r: 12, c: 1, s: 3 },
  { title: "Escape in Shadows", year: "2023", r: 13, c: 4, s: 5 },
];

const PIXELS = [
  1, 1.5, 2, 2.5, 3, 1, 1.5, 2, 2.5, 3, 3.5, 4, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5,
  6, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 20, 100,
].map((v) => v / 100);

const VARIANT_TYPES = {
  "pixel-wipe": 0,
  "noise-curtain": 1,
  "dither-fade": 2,
  "wave-dissolve": 3,
  "pixel-resolve": 4,
};

const EmergeMaterial = shaderMaterial(
  {
    uTime: 0,
    uFillColor: new THREE.Color("#f60"),
    uProgress: 0,
    uPixels: new Array(36).fill(0),
    uType: 0,
    uTexture: null,
    uTextureSize: new THREE.Vector2(1, 1),
    uElementSize: new THREE.Vector2(1, 1),
  },
   `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
   `
    uniform float uTime;
    uniform vec3 uFillColor;
    uniform float uProgress;
    uniform float uType;
    uniform float uPixels[36];
    uniform vec2 uTextureSize;
    uniform vec2 uElementSize;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    vec3 blendNormal(vec3 base, vec3 blend) { return blend; }
    vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
      return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
    }

    float hashwithoutsine12(vec2 p){
      vec3 p3 = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
    vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
    float cnoise(vec2 P){
      vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
      Pi = mod(Pi, 289.0);
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
      vec4 i = permute(permute(ix) + iy);
      vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
      vec4 gy = abs(gx) - 0.5;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
      vec2 g00 = vec2(gx.x,gy.x);
      vec2 g10 = vec2(gx.y,gy.y);
      vec2 g01 = vec2(gx.z,gy.z);
      vec2 g11 = vec2(gx.w,gy.w);
      vec4 norm = 1.79284291400159 - 0.85373472095314 *
        vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
      g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
      return 2.3 * n_xy;
    }

    float PristineGrid(vec2 uv, vec2 lineWidth){
      vec4 uvDDXY = vec4(dFdx(uv), dFdy(uv));
      vec2 uvDeriv = vec2(length(uvDDXY.xz), length(uvDDXY.yw));
      bool invertLine = lineWidth.x > 0.5;
      vec2 targetWidth = invertLine ? vec2(1.0) - lineWidth : lineWidth;
      vec2 drawWidth = clamp(targetWidth, uvDeriv, vec2(0.5));
      vec2 lineAA = max(uvDeriv, 0.000001) * 5.5;
      vec2 gridUV = abs(fract(uv) * 2.0 - 1.0);
      gridUV = invertLine ? gridUV : 1.0 - gridUV;
      vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);
      grid2 *= clamp(targetWidth / drawWidth, 0., 1.);
      grid2 = mix(grid2, targetWidth, clamp(uvDeriv * 2.0 - vec2(1.0), vec2(0.), vec2(1.)));
      grid2 = invertLine ? 1.0 - grid2 : grid2;
      return mix(grid2.x, 1.0, grid2.y);
    }

    float cubicOut(float t) { float f = t - 1.0; return f * f * f + 1.0; }
    float quadraticOut(float t) { return -t * (t - 2.0); }
    float map(float value, float min1, float max1, float min2, float max2) {
      float val = min2 + (value - min1) * (max2 - min2) / (max1 - min1);
      return clamp(val, min2, max2);
    }
    float cubicInOut(float t) {
      return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    float quadraticInOut(float t) {
      float p = 2.0 * t * t;
      return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
    }
    float parabola(float x, float k) { return pow(4. * x * (1. - x), k); }

    void main() {
      vec2 uv = vUv - vec2(0.5);
      float aspect1 = uTextureSize.x / uTextureSize.y;
      float aspect2 = uElementSize.x / uElementSize.y;
      if (aspect1 > aspect2) { uv *= vec2(aspect2 / aspect1, 1.); }
      else { uv *= vec2(1., aspect1 / aspect2); }
      uv += vec2(0.5);
      float uAspect = uElementSize.x / uElementSize.y;
      float imageAspect = uTextureSize.x / uTextureSize.y;

      vec4 defaultColor = texture2D(uTexture, uv);
      gl_FragColor = vec4(0.0);

      if (uType < 0.5) {
        float pixelateProgress = map(uProgress, 0.3, 1., 0., 1.);
        pixelateProgress = floor(pixelateProgress * 12.) / 12.;
        float s = floor(mix(11., 50., quadraticOut(pixelateProgress)));
        vec2 gridSize = vec2(s, floor(s / uAspect));

        vec2 newUV = floor(vUv * gridSize) / gridSize + 0.5 / vec2(gridSize);
        vec4 color = texture2D(uTexture, newUV);
        float finalProgress = map(uProgress, 0.75, 1., 0., 1.);
        color = mix(color, defaultColor, finalProgress);

        float lines = PristineGrid(vUv * gridSize, vec2(0.2 * (1. - uProgress)));

        float discardProgress = map(uProgress, 0., 0.8, 0., 1.);
        if (vUv.x > cubicOut(discardProgress)) discard;

        float gradWidth = mix(0.4, 0.2, uProgress);
        float customProg = map(cubicInOut(uProgress), 0.0, 1., -gradWidth, 1. - gradWidth);
        float fillGradient = smoothstep(customProg, customProg + gradWidth, vUv.x);

        gl_FragColor.a = 1.;
        gl_FragColor.rgb = blendNormal(vec3(1. - lines), color.rgb, 0.9);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uFillColor, fillGradient);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, defaultColor.rgb, finalProgress);

      } else if (uType < 1.5) {
        float hash = hashwithoutsine12(vUv * 1000. + floor(uTime * 3.) * 0.1);
        vec3 fillColor = uFillColor + (vec3(hash) - vec3(0.5)) * 0.2;

        float n = (cnoise(vUv * vec2(35., 1.)) + 1.) * 0.5;
        float dt = parabola(cubicInOut(uProgress), 1.);
        vec2 distUV = uv;
        distUV.y = 1. - (1. - uv.y) * (1. - dt * 0.3);
        vec4 distColor = texture2D(uTexture, distUV);
        float w = dt;

        float maskvalue = smoothstep(1. - w, 1., vUv.y + mix(-w / 2., 1. - w / 2., cubicInOut(uProgress)));
        float mask = maskvalue + maskvalue * n;
        float final = smoothstep(1., 1. + 0.01, mask);
        float final1 = smoothstep(1., 1. + 0.01, mask + 0.5);
        if (final1 == 0.) discard;

        gl_FragColor = vec4(mix(fillColor, distColor.rgb, final), 1.);

      } else if (uType < 2.5) {
        float s = 120.;
        vec2 gridSize = vec2(s, floor(s / uAspect));
        float pattern = hashwithoutsine12(floor(vUv * gridSize));

        float w = 0.5;
        float p0 = clamp(uProgress / 0.8, 0., 1.);
        float p1 = clamp((uProgress - 0.2) / 0.8, 0., 1.);

        p0 = map(p0, 0., 1., -w, 1.);
        p0 = smoothstep(p0, p0 + w, 1. - vUv.y);
        float p0_ = clamp(1. - 2. * p0 + pattern, 0., 1.);

        p1 = map(p1, 0., 1., -w, 1.);
        p1 = smoothstep(p1, p1 + w, 1. - vUv.y);
        float p1_ = clamp(1. - 2. * p1 + pattern, 0., 1.);

        gl_FragColor = vec4(mix(uFillColor, defaultColor.rgb, p1_), p0_);

      } else if (uType < 3.5) {
        float progress = quadraticInOut(1. - uProgress);
        float s = 50.;
        vec2 gridSize = vec2(s, floor(s / imageAspect));

        float v = smoothstep(0.0, 1.0, vUv.y + sin(vUv.x * 4.0 + progress * 6.0) *
          mix(0.3, 0.1, abs(0.5 - vUv.x)) * 0.5 * smoothstep(0.0, 0.2, progress) +
          (1.0 - progress * 2.0));

        float mixnewUV = (vUv.x * 3. + (1.0 - v) * 50.0) * progress;
        vec2 subUv = mix(uv, floor(uv * gridSize) / gridSize, mixnewUV);

        vec4 color = texture2D(uTexture, subUv);
        color.a = pow(v, 1.0);
        color.rgb = mix(color.rgb, uFillColor, smoothstep(0.5, 0.0, abs(0.5 - color.a)) * progress);

        gl_FragColor = color;

      } else {
        int indexProgress = int(clamp(uProgress, 0., 1.) * 35.);
        float pixellation = max(floor(uElementSize.x * uPixels[indexProgress]), 1.);
        vec2 gridSize = vec2(pixellation, max(floor(pixellation / imageAspect), 1.));
        vec2 newUV = floor(uv * gridSize) / gridSize + 0.5 / vec2(gridSize);
        gl_FragColor = texture2D(uTexture, newUV);
      }

      gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1. / 2.2));
    }
  `,
);

extend({ EmergeMaterial });

function EmergeMesh({
  texture,
  textureSize,
  type,
  fillColor,
  revealDuration,
  revealEase,
  revealMargin,
  pixelSteps,
  boundsRef,
}) {
  const meshRef = useRef(null);
  const tween = useRef({ from: 0, to: 0, start: 0, active: false });
  const ready = useRef(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const color = useMemo(() => new THREE.Color(fillColor), [fillColor]);
  const texSize = useMemo(
    () => new THREE.Vector2(textureSize[0], textureSize[1]),
    [textureSize],
  );
  const elSize = useMemo(() => new THREE.Vector2(1, 1), []);

  useLayoutEffect(() => {
    const el = boundsRef.current;
    const mesh = meshRef.current;
    if (!el || !mesh) return;

    const measure = () => {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      mesh.scale.set(b.width, b.height, 1);
      elSize.set(b.width, b.height);
      if (mesh.material?.uniforms?.uElementSize) {
        mesh.material.uniforms.uElementSize.value = elSize;
      }
    };

    measure();

    const io = new IntersectionObserver(
      ([e]) => setIsIntersecting(e.isIntersecting),
      { rootMargin: revealMargin },
    );
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, [boundsRef, elSize, revealMargin]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh?.material?.uniforms) return;
    mesh.material.uniforms.uType.value = type;
    mesh.material.uniforms.uProgress.value = 0;
    ready.current = false;
    tween.current = {
      from: 0,
      to: isIntersecting ? 1 : 0,
      start: -1,
      active: true,
    };
  }, [type]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh?.material?.uniforms) return;
    tween.current = {
      from: mesh.material.uniforms.uProgress.value,
      to: isIntersecting ? 1 : 0,
      start: -1,
      active: true,
    };
  }, [isIntersecting]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh?.material?.uniforms) return;
    const u = mesh.material.uniforms;
    const t = state.clock.elapsedTime;

    u.uTime.value = t;

    if (!ready.current) {
      ready.current = true;
      return;
    }

    const tw = tween.current;
    if (!tw.active) return;
    if (tw.start < 0) tw.start = t;

    const easings = {
      none: (x) => x,
      power1: (x) => 1 - Math.pow(1 - x, 2),
      power2: (x) => 1 - Math.pow(1 - x, 3),
      power3: (x) => 1 - Math.pow(1 - x, 4),
    };
    const ease = easings[revealEase] || easings.none;

    const p = Math.min((t - tw.start) / Math.max(revealDuration, 0.0001), 1);
    u.uProgress.value = tw.from + (tw.to - tw.from) * ease(p);
    if (p >= 1) tw.active = false;
  });

  return (
    <mesh ref={meshRef}>
      <emergeMaterial
        key={EmergeMaterial.key}
        transparent
        depthWrite={false}
        uFillColor={color}
        uTexture={texture}
        uPixels={pixelSteps}
        uTextureSize={texSize}
        uElementSize={elSize}
      />
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

function EmergingImage({
  url,
  type,
  fillColor,
  revealDuration,
  revealEase,
  revealMargin,
  pixelSteps,
}) {
  const [texture, setTexture] = useState(null);
  const [textureSize, setTextureSize] = useState([1, 1]);
  const viewRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    loader
      .loadAsync(url)
      .then((data) => {
        if (cancelled) return;
        data.minFilter = THREE.LinearFilter;
        data.generateMipmaps = false;
        setTextureSize([data.image.width, data.image.height]);
        setTexture(data);
      })
      .catch(() => {
        console.error("Texture failed to load:", url);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <View ref={viewRef} className="w-full h-full">
      {texture ? (
        <EmergeMesh
          texture={texture}
          textureSize={textureSize}
          type={type}
          fillColor={fillColor}
          revealDuration={revealDuration}
          revealEase={revealEase}
          revealMargin={revealMargin}
          pixelSteps={pixelSteps}
          boundsRef={viewRef}
        />
      ) : null}
    </View>
  );
}

export default function EmergingImages({
  items = DEFAULT_ITEMS,
  images = DEFAULT_IMAGES,
  variant = "pixel-wipe",
  fillColor = "#403fb7",
  bgColor = "#101014",
  textColor = "#f0f0f0",
  titleColor = "#7f7f8f",
  yearColor = "#b9b3af",
  displayFont = "ui-monospace, monospace",
  baseFontSize = "12px",
  imgRatio = 1.3,
  gridColumns = 10,
  gridGap = "3vw",
  gridPadding = "3rem",
  revealDuration = 1.5,
  revealEase = "none",
  revealMargin = "-10% 0px",
  pixelSteps = PIXELS,
  showFallback = false,
  smoothScroll = true,
  lerp = 0.1,
  dpr = [1, 2],
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scope = `rwi-${uid}`;

  const rootRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const type = VARIANT_TYPES[variant] ?? 0;

  useEffect(() => setMounted(true), []);

  const model = useMemo(
    () =>
      items.map((item, i) => ({
        ...item,
        src: item.src || images[i % images.length],
        s: item.s || 1,
      })),
    [items, images],
  );

  useEffect(() => {
    if (!smoothScroll) return;
    let lenis;
    let removeEffect;
    let killed = false;

    import("lenis").then((mod) => {
      if (killed) return;
      const Lenis = mod.default;
      lenis = new Lenis({ lerp });
      removeEffect = addEffect((t) => lenis.raf(t));
    });

    return () => {
      killed = true;
      if (removeEffect) removeEffect();
      if (lenis) lenis.destroy();
    };
  }, [smoothScroll, lerp]);

  const css = `
.${scope} { font-size: ${baseFontSize}; background-color: ${bgColor}; color: ${textColor}; font-family: ${displayFont}; font-weight: 600; width: 100%; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
.${scope} .rwi-grid { position: relative; z-index: 1; width: 100%; display: grid; margin: 0 auto; padding: 5vh ${gridPadding}; grid-row-gap: 3rem; }
.${scope} .rwi-item { position: relative; margin: 0; }
.${scope} .rwi-item-img { position: relative; overflow: hidden; display: grid; place-items: center; width: 100%; height: auto; aspect-ratio: ${imgRatio}; background-size: cover; background-position: 50%; }
.${scope} .rwi-item-caption { position: absolute; padding: 0.5rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.${scope} .rwi-item-caption h3 { font-weight: bold; font-size: inherit; margin: 0; color: ${titleColor}; }
.${scope} .rwi-item-caption span { font-weight: bold; color: ${yearColor}; }
@media screen and (max-width: 53em) {
  .${scope} .rwi-grid { padding-left: 1.25rem; padding-right: 1.25rem; }
  .${scope} .rwi-item-caption { position: relative; }
}
@media screen and (min-width: 53em) {
  .${scope} .rwi-grid { gap: ${gridGap}; grid-template-columns: repeat(${gridColumns}, 1fr); grid-auto-rows: auto; }
  .${scope} .rwi-item { grid-column: var(--c) / span var(--s); grid-row: var(--r); }
}
`;

  return (
    <div ref={rootRef} className={`${scope} ${className}`.trim()}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {mounted && (
        <Canvas
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 2,
          }}
          dpr={dpr}
          eventSource={rootRef}
        >
          <View.Port />
          <OrthographicCamera makeDefault position={[0, 0, 300]} zoom={1} />
          <Preload all />
        </Canvas>
      )}

      <main>
        <div className="rwi-grid">
          {model.map((item, i) => (
            <figure
              key={`${uid}-i${i}`}
              className="rwi-item"
              style={{ "--r": item.r, "--c": item.c, "--s": item.s }}
            >
              <div
                className="rwi-item-img"
                style={
                  showFallback
                    ? { backgroundImage: `url(${item.src})` }
                    : undefined
                }
              >
                {mounted && (
                  <EmergingImage
                    type={type}
                    url={item.src}
                    fillColor={fillColor}
                    revealDuration={revealDuration}
                    revealEase={revealEase}
                    revealMargin={revealMargin}
                    pixelSteps={pixelSteps}
                  />
                )}
              </div>
              <figcaption className="rwi-item-caption">
                <h3>{item.title}</h3> <span>{item.year}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </main>
    </div>
  );
}
