"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const NOISE_SHADER = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const FRAGMENT_SHADER = `
varying vec2 vUv;
struct Point {
  float currentX;
  float currentY;
};
uniform float u_aspect;
uniform float u_time;
uniform float u_radius;
uniform float u_loopProgress;
uniform float u_textureNoiseShift;
uniform float u_textureNoiseScale;
uniform float u_metaballsNoiseShift;
uniform float u_metaballsNoiseScale;
uniform sampler2D u_textures[TEXTURES_COUNT];
uniform Point u_points[POINTS_COUNT];
vec2 getAspectCoords(vec2 coords) {
  coords.x *= u_aspect;
  return coords;
}
void main() {
  float textureNoise = snoise(vec3(vUv * u_textureNoiseShift, 0.0)) * u_textureNoiseScale;
  float metaballsNoise = snoise(vec3(vUv * u_metaballsNoiseShift, u_time)) * u_metaballsNoiseScale;
  float radius = u_radius - (u_radius * u_loopProgress) * 0.2;
  float metaballs = 0.0;
  for (int i = 0; i < POINTS_COUNT; i += 1) {
    Point point = u_points[i];
    float x = point.currentX + metaballsNoise;
    float y = point.currentY + metaballsNoise;
    float dist = distance(vec2(x * u_aspect, 1.0 - y), getAspectCoords(vUv));
    metaballs += radius / dist;
  }
  float smoothMetaballs = smoothstep(0.95, 1.0, metaballs);
  float prevDistortion = metaballs < 1.0 ? 1.0 - metaballs : 0.0;
  prevDistortion *= 3.0;
  prevDistortion += u_loopProgress * textureNoise;
  vec4 prev = texture2D(u_textures[PREV_INDEX], vUv + prevDistortion);
  vec4 next = texture2D(u_textures[NEXT_INDEX], vUv);
  vec3 color = mix(next.rgb, prev.rgb, smoothMetaballs);
  gl_FragColor = vec4(color, 1.0);
}
`;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const wrapIndex = (max, value) => ((value % max) + max) % max;

const spreadScope = (length, shift) => {
  const size = 1 / (1 + (length - 1) * shift);
  return Array.from({ length }, (_, i) => {
    const start = i * size * shift;
    return [start, start + size];
  });
};

const clampScope = (value, scope) =>
  clamp01((value - scope[0]) / (scope[1] - scope[0] || 1));

const easeInOut = (v, power) =>
  v < 0.5 ? Math.pow(2 * v, power) / 2 : 1 - Math.pow(2 * (1 - v), power) / 2;

const shuffle = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export default function MetaballsCarousel({
  images = DEFAULT_IMAGES,
  className = "",
  bgColor = "#000",
  textColor = "#fff",
  dpr = 0,
  gridCount = 10,
  radius = 0.007,
  rowShift = 1,
  isReverse = true,
  riseDistance = 1.25,
  xDrift = 0.25,
  easingPower = 3,
  time = 0.005,
  textureNoiseShift = 59,
  textureNoiseScale = 0.0215,
  metaballsNoiseShift = 50,
  metaballsNoiseScale = 0.002,
  wheelSpeed = 0.5,
  dragSpeed = 0.5,
  friction = 0,
  enableWheel = true,
  enableDrag = true,
  preventPageScroll = true,
  slideDuration = 2500,
  showHint = true,
  hintLabel = "Scroll down",
  showNav = true,
  prevLabel = "Prev",
  nextLabel = "Next",
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  const liveRef = useRef({});
  liveRef.current = {
    radius,
    rowShift,
    isReverse,
    riseDistance,
    xDrift,
    easingPower,
    time,
    textureNoiseShift,
    textureNoiseScale,
    metaballsNoiseShift,
    metaballsNoiseScale,
    wheelSpeed,
    dragSpeed,
    friction,
    slideDuration,
    preventPageScroll,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let raf = 0;
    let disposers = [];

    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Image failed: ${src}`));
        img.src = src;
      });

    const boot = async () => {
      const THREE = await import("three");
      const loaded = await Promise.all(images.map(loadImage));
      if (cancelled || !containerRef.current) return;

      const pixelRatio =
        dpr > 0 ? dpr : Math.min(window.devicePixelRatio || 1, 2);

      const canvas = document.createElement("canvas");
      canvas.className = "absolute inset-0 block h-full w-full";
      container.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
      });
      renderer.setPixelRatio(pixelRatio);

      const scene = new THREE.Scene();

      let width = container.clientWidth || 1;
      let height = container.clientHeight || 1;

      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
      camera.position.z = 1;

      const geometry = new THREE.PlaneGeometry(1, 1);

      const prerenderTextures = () => {
        return loaded.map((img) => {
          const c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(width));
          c.height = Math.max(1, Math.round(height));
          const ctx = c.getContext("2d");
          const ir = img.naturalWidth / img.naturalHeight;
          const cr = c.width / c.height;
          let dw;
          let dh;
          if (ir > cr) {
            dh = c.height;
            dw = c.height * ir;
          } else {
            dw = c.width;
            dh = c.width / ir;
          }
          ctx.drawImage(img, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
          const texture = new THREE.Texture(c);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.needsUpdate = true;
          return texture;
        });
      };

      let textures = prerenderTextures();

      const count = gridCount;
      const rows = [];
      let pointIndex = 0;
      for (let iy = 0; iy <= count; iy += 1) {
        const points = [];
        for (let ix = 0; ix <= count; ix += 1) {
          const x = ix / count;
          const y = iy / count;
          points.push({
            index: pointIndex,
            startX: x,
            startY: y,
            currentX: x,
            currentY: y,
            progress: 0,
            xDirection: Math.random() > 0.5 ? 1 : -1,
            xMove: Math.random(),
          });
          pointIndex += 1;
        }
        rows.push({
          points,
          pointsSpreadScopes: shuffle(spreadScope(points.length, 0.9)),
        });
      }

      const flatPoints = rows.map((row) => row.points).flat();
      const uniformPoints = flatPoints.map((p) => ({
        currentX: p.startX,
        currentY: p.startY,
      }));

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: NOISE_SHADER + FRAGMENT_SHADER,
        uniforms: {
          u_aspect: { value: width / height },
          u_time: { value: 0 },
          u_radius: { value: liveRef.current.radius },
          u_loopProgress: { value: 0 },
          u_textureNoiseShift: { value: liveRef.current.textureNoiseShift },
          u_textureNoiseScale: { value: liveRef.current.textureNoiseScale },
          u_metaballsNoiseShift: { value: liveRef.current.metaballsNoiseShift },
          u_metaballsNoiseScale: { value: liveRef.current.metaballsNoiseScale },
          u_textures: { value: textures },
          u_points: { value: uniformPoints },
        },
        defines: {
          TEXTURES_COUNT: textures.length,
          POINTS_COUNT: uniformPoints.length,
          PREV_INDEX: 0,
          NEXT_INDEX: 0,
        },
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const resize = () => {
        width = container.clientWidth || 1;
        height = container.clientHeight || 1;
        renderer.setSize(width, height, false);
        material.uniforms.u_aspect.value = width / height;
        textures.forEach((t) => t.dispose());
        textures = prerenderTextures();
        material.uniforms.u_textures.value = textures;
      };
      resize();

      const observer = new ResizeObserver(() => resize());
      observer.observe(container);
      disposers.push(() => observer.disconnect());

      const state = {
        target: 0,
        current: 0,
        tween: null,
        lastPrev: -1,
        lastNext: -1,
      };

      const onWheel = (e) => {
        const live = liveRef.current;
        if (live.preventPageScroll) e.preventDefault();
        state.tween = null;
        state.target += (e.deltaY / window.innerHeight) * live.wheelSpeed * 2;
      };

      if (enableWheel) {
        container.addEventListener("wheel", onWheel, { passive: false });
        disposers.push(() => container.removeEventListener("wheel", onWheel));
      }

      if (enableDrag) {
        let dragging = false;
        let lastY = 0;
        const onMove = (e) => {
          if (!dragging) return;
          const dy = e.clientY - lastY;
          lastY = e.clientY;
          state.target -= (dy / height) * liveRef.current.dragSpeed * 3;
        };
        const onDown = (e) => {
          if (e.target.closest("[data-nav-ui]")) return;
          dragging = true;
          lastY = e.clientY;
          state.tween = null;
          container.setPointerCapture?.(e.pointerId);
        };
        const onUp = (e) => {
          dragging = false;
          if (e?.pointerId != null)
            container.releasePointerCapture?.(e.pointerId);
        };
        container.addEventListener("pointerdown", onDown);
        container.addEventListener("pointermove", onMove);
        container.addEventListener("pointerup", onUp);
        container.addEventListener("pointercancel", onUp);
        disposers.push(() => {
          container.removeEventListener("pointerdown", onDown);
          container.removeEventListener("pointermove", onMove);
          container.removeEventListener("pointerup", onUp);
          container.removeEventListener("pointercancel", onUp);
        });
      }

      const goTo = (value) => {
        state.tween = {
          from: state.current,
          to: value,
          start: performance.now(),
          duration: liveRef.current.slideDuration,
        };
      };

      apiRef.current = {
        next: () => goTo(Math.round(state.current) + 1),
        prev: () => goTo(Math.round(state.current) - 1),
      };

      const renderPoints = (loopProgress) => {
        const live = liveRef.current;
        const ordered = live.isReverse ? [...rows].reverse() : rows;
        const progress =
          loopProgress < 0 ? 1 - Math.abs(loopProgress % 1) : loopProgress % 1;
        const rowsSpreadScopes = spreadScope(ordered.length, live.rowShift);

        ordered.forEach((row, rowIdx) => {
          const rowProgress = clampScope(progress, rowsSpreadScopes[rowIdx]);
          row.points.forEach((point, i) => {
            const pointProgress = clampScope(
              rowProgress,
              row.pointsSpreadScopes[i],
            );
            point.progress = easeInOut(pointProgress, live.easingPower);
            point.currentX =
              point.startX +
              point.progress * point.xMove * live.xDrift * point.xDirection;
            point.currentY = point.startY - point.progress * live.riseDistance;
          });
        });

        flatPoints.forEach((point, i) => {
          uniformPoints[i].currentX = point.currentX;
          uniformPoints[i].currentY = point.currentY;
        });
      };

      const tick = () => {
        raf = requestAnimationFrame(tick);
        const live = liveRef.current;

        if (state.tween) {
          const t = clamp01(
            (performance.now() - state.tween.start) / state.tween.duration,
          );
          const eased = easeInOut(t, 3);
          state.current =
            state.tween.from + (state.tween.to - state.tween.from) * eased;
          state.target = state.current;
          if (t >= 1) state.tween = null;
        } else {
          const lerp = 1 - Math.min(0.99, Math.max(0, live.friction));
          state.current += (state.target - state.current) * lerp;
        }

        const progress = state.current;
        const isEnd = progress % 1 === 0;
        let loopProgress =
          progress < 0 ? 1 - Math.abs(progress % 1) : progress % 1;
        loopProgress = isEnd ? 0 : loopProgress;

        const prevIndex = wrapIndex(textures.length, Math.floor(progress));
        const nextIndex = wrapIndex(textures.length, Math.ceil(progress));

        renderPoints(progress);

        const u = material.uniforms;
        u.u_time.value += live.time;
        u.u_loopProgress.value = loopProgress;
        u.u_radius.value = live.radius;
        u.u_textureNoiseShift.value = live.textureNoiseShift;
        u.u_textureNoiseScale.value = live.textureNoiseScale;
        u.u_metaballsNoiseShift.value = live.metaballsNoiseShift;
        u.u_metaballsNoiseScale.value = live.metaballsNoiseScale;

        if (prevIndex !== state.lastPrev || nextIndex !== state.lastNext) {
          material.defines.PREV_INDEX = prevIndex;
          material.defines.NEXT_INDEX = nextIndex;
          material.needsUpdate = true;
          state.lastPrev = prevIndex;
          state.lastNext = nextIndex;
        }

        if (width > 0 && height > 0) renderer.render(scene, camera);
      };

      raf = requestAnimationFrame(tick);

      disposers.push(() => {
        cancelAnimationFrame(raf);
        scene.remove(mesh);
        geometry.dispose();
        material.dispose();
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        canvas.remove();
        apiRef.current = null;
      });
    };

    boot().catch((e) =>
      console.error("[MetaballsCarousel] init failed:", e.message),
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      disposers.forEach((fn) => fn());
      disposers = [];
    };
  }, [images, dpr, gridCount, enableWheel, enableDrag]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden touch-none select-none h-screen ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {showHint && (
        <div className="pointer-events-none absolute bottom-5 left-5 z-10 text-[20px] uppercase tracking-[0.08em]">
          {hintLabel}
        </div>
      )}

      {showNav && (
        <div
          data-nav-ui
          className="absolute bottom-5 right-5 z-10 flex flex-row items-center justify-center gap-[10px]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => apiRef.current?.prev()}
            className="border border-current bg-transparent px-4 py-2 text-[13px] uppercase tracking-[0.12em] transition-colors hover:bg-white hover:text-black"
          >
            {prevLabel}
          </button>
          <button
            type="button"
            onClick={() => apiRef.current?.next()}
            className="border border-current bg-transparent px-4 py-2 text-[13px] uppercase tracking-[0.12em] transition-colors hover:bg-white hover:text-black"
          >
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}
