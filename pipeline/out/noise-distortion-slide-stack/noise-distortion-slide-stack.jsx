"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  { src: "https://picsum.photos/seed/nova1/1600/1000", title: "Drift" },
  { src: "https://picsum.photos/seed/nova2/1600/1000", title: "Signal" },
  { src: "https://picsum.photos/seed/nova3/1600/1000", title: "Aperture" },
  { src: "https://picsum.photos/seed/nova4/1600/1000", title: "Static" },
  { src: "https://picsum.photos/seed/nova5/1600/1000", title: "Residue" },
];

const NOISE_GLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 =   v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX_GLSL = `
varying vec2 vUv;
uniform float u_activeProgress;
uniform float u_bulge;
void main() {
  vUv = uv;
  vec3 transformed = vec3(position);
  vec2 center = vec2(0.5, 0.5);
  float circle = 1.0 - distance(center, transformed.xy);
  transformed.z += circle * u_activeProgress * u_bulge;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const FRAGMENT_GLSL = `
varying vec2 vUv;
uniform sampler2D u_map;
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_mouseUV;
uniform float u_mouseIntensity;
uniform vec2 u_uvScale;
uniform float u_noiseScale;
uniform float u_hoverRadius;
uniform float u_distortion;
uniform float u_hoverStrength;
void main() {
  vec2 mouse = vec2(u_mouseUV.x * u_aspect, 1.0 - u_mouseUV.y);
  vec2 point = vec2(vUv.x * u_aspect, vUv.y);
  float intensity = u_mouseIntensity * u_hoverStrength;

  float cursorCircle = distance(point, mouse);
  cursorCircle = smoothstep(0.0, u_hoverRadius, cursorCircle);
  cursorCircle = 1.0 - cursorCircle;
  cursorCircle *= intensity;

  float noise1 = snoise(vec3(vUv * u_noiseScale, cursorCircle + u_time));
  noise1 = smoothstep(0.0, 0.1, noise1);
  float noise2 = snoise(vec3(vUv * u_noiseScale * 0.995, cursorCircle + u_time));
  noise2 = smoothstep(0.0, 0.1, noise2);
  float noise = clamp(noise1 - noise2, 0.0, 1.0);

  vec2 uv = (vUv - 0.5) * u_uvScale + 0.5;
  vec2 coords = uv;
  coords -= vec2(0.5);
  coords /= 1.0 + cursorCircle;
  coords += vec2(0.5);
  coords += noise * cursorCircle * u_distortion;

  gl_FragColor = texture2D(u_map, coords);
}
`;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, e) => a + (b - a) * e;
const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeInOutBack = (t) => {
  const c = 1.70158 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
};

export default function NoiseDistortionSlideStack({
  slides = DEFAULT_SLIDES,
  perspective = 2000,
  dpr = 1.25,
  antialias = false,
  segments = 100,
  planeGap = 0.4,
  depthFactor = 0.4,
  ease = 0.075,
  snapEase = 0.06,
  snapDelay = 180,
  wheelSpeed = 1,
  dragSpeed = 1.6,
  mouseEase = 0.1,
  scrollRotation = 0.2,
  mouseRotation = 0.05,
  parallax = 0.025,
  noiseScale = 4.25,
  hoverRadius = 0.9,
  distortion = 0.75,
  hoverStrength = 3,
  bulge = 1,
  activeDuration = 2000,
  showDuration = 2500,
  colorIntensity = 0.6,
  fogMultiplier = 8,
  titleSize = "clamp(2.5rem, 9vw, 9rem)",
  titleColor = "#ffffff",
  overlayColor = "rgba(0, 0, 0, 0.35)",
  letterStagger = 0.035,
  lineColor = "#ffffff",
  lineWidth = 4,
  uiColor = "rgba(255, 255, 255, 0.35)",
  showPreloader = true,
  preloaderBg = "#000000",
  showArrows = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const apiRef = useRef(null);
  const configRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  configRef.current = {
    perspective,
    dpr,
    antialias,
    segments,
    planeGap,
    depthFactor,
    ease,
    snapEase,
    snapDelay,
    wheelSpeed,
    dragSpeed,
    mouseEase,
    scrollRotation,
    mouseRotation,
    parallax,
    noiseScale,
    hoverRadius,
    distortion,
    hoverStrength,
    bulge,
    activeDuration,
    showDuration,
    colorIntensity,
    fogMultiplier,
  };

  const slidesKey = slides.map((item) => item.src).join("|");

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(src));
        img.src = src;
      });

    const averageColor = (THREE, image, intensity) => {
      const ratio = image.naturalHeight / image.naturalWidth || 1;
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = Math.max(1, Math.round(ratio * 100));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      let r = 0;
      let g = 0;
      let b = 0;
      try {
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        const total = data.length / 4;
        r = (r / total / 255) * intensity;
        g = (g / total / 255) * intensity;
        b = (b / total / 255) * intensity;
      } catch (e) {
        r = 0.05;
        g = 0.05;
        b = 0.05;
      }
      return new THREE.Color(r, g, b);
    };

    const boot = async () => {
      const THREE = await import("three");
      if (disposed) return;

      const images = [];
      let done = 0;
      await Promise.all(
        slides.map((item, index) =>
          loadImage(item.src)
            .then((img) => {
              images[index] = img;
            })
            .catch(() => {})
            .finally(() => {
              done += 1;
              if (!disposed) setProgress(done / slides.length);
            }),
        ),
      );
      if (disposed) return;

      const container = containerRef.current;
      if (!container) return;

      const cfg = () => configRef.current;
      const count = images.filter(Boolean).length;
      if (!count) return;

      const canvas = document.createElement("canvas");
      canvas.className = "absolute inset-0 w-full h-full";
      container.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
      const group = new THREE.Group();
      scene.add(group);

      const fog = new THREE.Fog(0x000000, 0, 1);
      scene.fog = fog;

      let width = 1;
      let height = 1;

      const startSize = {
        width: container.clientWidth || 1,
        height: container.clientHeight || 1,
      };

      const planes = images.filter(Boolean).map((image, index) => {
        const texture = new THREE.Texture(image);
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;

        const geometry = new THREE.PlaneGeometry(
          startSize.width,
          startSize.height,
          cfg().segments,
          cfg().segments,
        );

        const material = new THREE.ShaderMaterial({
          vertexShader: VERTEX_GLSL,
          fragmentShader: NOISE_GLSL + FRAGMENT_GLSL,
          side: THREE.DoubleSide,
          uniforms: {
            u_map: { value: texture },
            u_time: { value: index * 10 },
            u_aspect: { value: 1 },
            u_mouseUV: { value: new THREE.Vector2(0, 0) },
            u_mouseIntensity: { value: 0 },
            u_activeProgress: { value: 0 },
            u_uvScale: { value: new THREE.Vector2(1, 1) },
            u_noiseScale: { value: cfg().noiseScale },
            u_hoverRadius: { value: cfg().hoverRadius },
            u_distortion: { value: cfg().distortion },
            u_hoverStrength: { value: cfg().hoverStrength },
            u_bulge: { value: cfg().bulge },
          },
        });

        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        return {
          mesh,
          material,
          geometry,
          texture,
          image,
          color: averageColor(THREE, image, cfg().colorIntensity),
          mouse: {
            current: new THREE.Vector2(0, 0),
            target: new THREE.Vector2(0, 0),
          },
        };
      });

      const resize = () => {
        width = container.clientWidth || 1;
        height = container.clientHeight || 1;

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(cfg().dpr, window.devicePixelRatio));

        const fovRad = 2 * Math.atan(height / 2 / cfg().perspective);
        camera.fov = (180 * fovRad) / Math.PI;
        camera.aspect = width / height;
        camera.position.set(0, 0, cfg().perspective);
        camera.updateProjectionMatrix();

        planes.forEach((plane) => {
          plane.mesh.scale.set(
            width / startSize.width,
            height / startSize.height,
            1,
          );

          const aspect = width / height;
          const imageAspect =
            plane.image.naturalWidth / plane.image.naturalHeight;
          const uvScale = plane.material.uniforms.u_uvScale.value;
          if (aspect < imageAspect) uvScale.set(aspect / imageAspect, 1);
          else uvScale.set(1, imageAspect / aspect);
        });
      };

      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      window.addEventListener("resize", resize);

      const min = -0.1;
      const max = count - 1 + 0.1;
      const slide = { current: 0, target: 0, lastInput: 0, snapping: false };
      const intensity = { current: 0, target: 0 };
      const mouse = {
        x: { current: 0, target: 0 },
        y: { current: 0, target: 0 },
        power: { current: 0, target: 0 },
        ndc: new THREE.Vector2(0, 0),
      };
      const activeTl = { value: 0, from: 0, to: 0, start: 0, playing: false };
      const showTl = { value: 0, start: 0, playing: false };
      let active = null;
      const raycaster = new THREE.Raycaster();

      const pushIntensity = (value) => {
        intensity.target = clamp(intensity.target + Math.abs(value), 0, 100);
      };

      const input = (delta) => {
        if (active !== null) return;
        slide.target = clamp(slide.target + delta, min, max);
        slide.lastInput = performance.now();
        slide.snapping = false;
      };

      const onWheel = (event) => {
        input((event.deltaY / 500) * cfg().wheelSpeed);
        pushIntensity(event.deltaY);
      };

      let dragging = false;
      let dragY = 0;
      let dragMoved = 0;

      const onPointerDown = (event) => {
        if (event.target.closest("button")) return;
        dragging = true;
        dragMoved = 0;
        dragY = event.clientY;
      };

      const onPointerMove = (event) => {
        const rect = container.getBoundingClientRect();
        const relX = event.clientX - rect.left;
        const relY = event.clientY - rect.top;

        mouse.x.target = (relX - width / 2) / (width / 2);
        mouse.y.target = (relY - height / 2) / (height / 2);
        mouse.ndc.set((relX / width) * 2 - 1, -(relY / height) * 2 + 1);
        mouse.power.target = clamp(
          mouse.power.target + Math.abs(event.movementX) + Math.abs(event.movementY),
          0,
          Math.sqrt(width * width + height * height) / 2,
        );

        if (!dragging) return;
        const step = dragY - event.clientY;
        dragY = event.clientY;
        dragMoved += Math.abs(step);
        input((step / (height * 0.5)) * cfg().dragSpeed);
        pushIntensity(step * 2);
      };

      const onPointerUp = () => {
        dragging = false;
      };

      const onClick = (event) => {
        if (event.target.closest("button")) return;
        if (dragMoved > 8) return;
        api.activate();
      };

      container.addEventListener("wheel", onWheel, { passive: true });
      container.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      container.addEventListener("click", onClick);

      const renderPlane = (plane, index, shared) => {
        const {
          globalProgress,
          scrollY,
          mouseY,
          mouseX,
          offsetX,
          offsetY,
          multiplier,
          intersects,
          normalizedPower,
        } = shared;

        const progressValue = globalProgress - index;
        const activeProgress =
          active === index ? easeInOutBack(activeTl.value) : 0;
        const reverse = 1 - activeProgress;
        const hit = intersects.find((item) => item.object === plane.mesh);

        const easeAmount = cfg().mouseEase * multiplier;
        if (hit && hit.uv) {
          plane.mouse.target.set(hit.uv.x, hit.uv.y);
        }
        plane.mouse.current.x = lerp(
          plane.mouse.current.x,
          plane.mouse.target.x,
          easeAmount,
        );
        plane.mouse.current.y = lerp(
          plane.mouse.current.y,
          plane.mouse.target.y,
          easeAmount,
        );

        const { uniforms } = plane.material;
        const tick = 0.01;
        uniforms.u_time.value +=
          tick * multiplier + tick * normalizedPower * 10;
        uniforms.u_aspect.value = width / height;
        uniforms.u_activeProgress.value = Math.sin(Math.PI * activeProgress);
        uniforms.u_bulge.value = cfg().bulge;
        uniforms.u_mouseUV.value = plane.mouse.current;
        uniforms.u_mouseIntensity.value =
          normalizedPower * clamp(1 - progressValue, 0, 1);
        uniforms.u_noiseScale.value = cfg().noiseScale;
        uniforms.u_hoverRadius.value = cfg().hoverRadius;
        uniforms.u_distortion.value = cfg().distortion;
        uniforms.u_hoverStrength.value = cfg().hoverStrength;

        const { mesh } = plane;
        const zStatic = -cfg().perspective * cfg().depthFactor * reverse;
        const zIteration = zStatic * 1.5;
        const yRotation = scrollY * reverse;
        const xShift = progressValue * width * -cfg().planeGap;
        const x = offsetX * reverse + xShift * reverse;
        const y = offsetY * reverse;

        if (progressValue < 0) {
          mesh.position.x = x;
          mesh.position.y = height * 1.25 * progressValue * reverse + y;
          mesh.position.z = zStatic;
          mesh.rotation.x = (Math.PI / 2.5) * progressValue * -1 + mouseX * reverse;
          mesh.rotation.y = yRotation * progressValue * 0.5 + mouseY * reverse;
          return;
        }

        mesh.position.x = x;
        mesh.position.y = height * progressValue * reverse * -0.1 + y;
        mesh.position.z = zStatic + zIteration * progressValue;
        mesh.rotation.x = mouseX * reverse;
        mesh.rotation.y =
          yRotation * Math.min(progressValue, 1) + mouseY * reverse;
      };

      const renderBackground = () => {
        const last = planes.length - 1;
        const prev = clamp(Math.floor(slide.current), 0, last);
        const next = clamp(Math.ceil(slide.current), 0, last);
        const mix = clamp(slide.current, 0, last) % 1;

        const color = planes[prev].color.clone();
        color.lerp(planes[next].color, mix);

        scene.background = color;
        fog.color = color;
        fog.near = 0;
        fog.far = cfg().perspective * cfg().fogMultiplier;
      };

      let raf = 0;
      let last = performance.now();

      const frame = (now) => {
        raf = requestAnimationFrame(frame);
        const delta = now - last;
        last = now;
        const multiplier = clamp(delta / (1000 / 60), 0.5, 3);
        const easeAmount = cfg().mouseEase * multiplier;

        if (showTl.playing) {
          const t = clamp((now - showTl.start) / cfg().showDuration, 0, 1);
          showTl.value = easeInOut(t);
          if (t === 1) showTl.playing = false;
        }
        group.position.y = height * (1 - showTl.value) * -2;
        group.rotation.x = Math.PI * 0.35 * (1 - showTl.value);

        if (activeTl.playing) {
          const t = clamp((now - activeTl.start) / cfg().activeDuration, 0, 1);
          activeTl.value = activeTl.from + (activeTl.to - activeTl.from) * t;
          if (t === 1) {
            activeTl.playing = false;
            if (activeTl.to === 0) active = null;
          }
        }

        if (
          active === null &&
          !dragging &&
          now - slide.lastInput > cfg().snapDelay
        ) {
          slide.snapping = true;
        }
        if (slide.snapping) {
          const target = clamp(Math.round(slide.target), 0, count - 1);
          slide.target = lerp(
            slide.target,
            target,
            cfg().snapEase * multiplier,
          );
        }

        slide.current = lerp(slide.current, slide.target, cfg().ease * multiplier);

        intensity.target = lerp(intensity.target, 0, 0.05 * multiplier);
        intensity.current = lerp(
          intensity.current,
          intensity.target,
          0.1 * multiplier,
        );

        mouse.x.current = lerp(mouse.x.current, mouse.x.target, easeAmount);
        mouse.y.current = lerp(mouse.y.current, mouse.y.target, easeAmount);
        mouse.power.current = lerp(
          mouse.power.current,
          mouse.power.target,
          easeAmount,
        );
        mouse.power.target = lerp(mouse.power.target, 0, easeAmount * 2);

        raycaster.setFromCamera(mouse.ndc, camera);
        const intersects = raycaster.intersectObjects(group.children);

        const radius = Math.sqrt(width * width + height * height) / 2;
        const normalizedPower = clamp(mouse.power.current / radius, 0, 1);

        const shared = {
          globalProgress: slide.current,
          scrollY: Math.PI * cfg().scrollRotation * (intensity.current / 100),
          mouseY: Math.PI * cfg().mouseRotation * mouse.x.current,
          mouseX: Math.PI * cfg().mouseRotation * mouse.y.current,
          offsetX: width * -cfg().parallax * mouse.x.current,
          offsetY: height * cfg().parallax * mouse.y.current,
          multiplier,
          intersects,
          normalizedPower,
        };

        planes.forEach((plane, index) => renderPlane(plane, index, shared));

        renderBackground();
        renderer.render(scene, camera);

        const ratio =
          count > 1 ? clamp(slide.current / (count - 1), 0, 1) : 1;
        if (lineRef.current) {
          lineRef.current.style.transform = `scale(1, ${ratio})`;
        }
      };

      raf = requestAnimationFrame(frame);

      const api = {
        activate: () => {
          if (active !== null || activeTl.playing) return;
          active = clamp(Math.round(slide.current), 0, count - 1);
          slide.target = active;
          activeTl.from = activeTl.value;
          activeTl.to = 1;
          activeTl.start = performance.now();
          activeTl.playing = true;
          setActiveIndex(active);
        },
        deactivate: () => {
          if (active === null) return;
          activeTl.from = activeTl.value;
          activeTl.to = 0;
          activeTl.start = performance.now();
          activeTl.playing = true;
          setActiveIndex(null);
        },
        go: (direction) => {
          if (active !== null) return;
          slide.target = clamp(
            Math.round(slide.target) + direction,
            0,
            count - 1,
          );
          slide.lastInput = performance.now();
          slide.snapping = true;
        },
        reveal: () => {
          if (showTl.playing || showTl.value > 0) return;
          showTl.start = performance.now();
          showTl.playing = true;
        },
      };

      apiRef.current = api;
      setLoaded(true);

      const onKeyDown = (event) => {
        if (event.key === "Escape") api.deactivate();
        if (event.key === "ArrowRight" || event.key === "ArrowDown") api.go(1);
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") api.go(-1);
      };
      window.addEventListener("keydown", onKeyDown);

      cleanup = () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        container.removeEventListener("wheel", onWheel);
        container.removeEventListener("pointerdown", onPointerDown);
        container.removeEventListener("click", onClick);
        planes.forEach((plane) => {
          group.remove(plane.mesh);
          plane.geometry.dispose();
          plane.material.dispose();
          plane.texture.dispose();
        });
        renderer.dispose();
        canvas.remove();
        apiRef.current = null;
      };
    };

    boot().catch((error) =>
      console.error("[NoiseDistortionSlideStack]", error.message),
    );

    return () => {
      disposed = true;
      cleanup();
    };
  }, [slidesKey]);

  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => {
      apiRef.current?.reveal();
      setRevealed(true);
    }, showPreloader ? 700 : 0);
    return () => window.clearTimeout(id);
  }, [loaded, showPreloader]);

  const percent = `${String(Math.min(Math.floor(progress * 100), 99)).padStart(2, "0")}%`;

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-pointer select-none touch-none"
      />

      {slides.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <div
            key={`${item.src}-${index}`}
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 pointer-events-none"
            style={{
              backgroundColor: overlayColor,
              opacity: isActive ? 1 : 0,
              visibility: isActive ? "visible" : "hidden",
            }}
          >
            <p
              className="m-0 uppercase text-center [perspective:1000px] [transform-style:preserve-3d]"
              style={{ fontSize: titleSize, color: titleColor, letterSpacing: "0.02em" }}
            >
              {(item.title || "").split("").map((char, charIndex) => (
                <span
                  key={charIndex}
                  className="inline-block origin-bottom-left transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transitionDelay: `${(isActive ? charIndex : 0) * letterStagger}s`,
                    opacity: isActive ? 1 : 0,
                    transform: isActive
                      ? "rotateX(0deg) translate3d(0,0,0)"
                      : "rotateX(-90deg) translate3d(0,-50%,0)",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </p>
          </div>
        );
      })}

      <div
        ref={lineRef}
        className="absolute top-0 right-0 h-full origin-top-left transition-opacity duration-1000 scale-y-0"
        style={{
          width: `${lineWidth}px`,
          backgroundColor: lineColor,
          opacity: activeIndex === null ? 1 : 0,
        }}
      />

      <button
        type="button"
        onClick={() => apiRef.current?.deactivate()}
        title="Close"
        className="absolute top-10 right-10 w-[50px] h-[50px] rounded-full bg-transparent transition-[border-color,transform,opacity] duration-500 hover:rotate-90"
        style={{
          border: `1px solid ${uiColor}`,
          opacity: activeIndex === null ? 0 : 1,
          pointerEvents: activeIndex === null ? "none" : "auto",
        }}
      >
        <span
          className="block w-full h-full bg-center bg-no-repeat bg-[length:45%_auto]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'><path d='M6 6L18 18M18 6L6 18' stroke='white' stroke-width='2' stroke-linecap='round'/></svg>\")",
          }}
        />
      </button>

      {showArrows && (
        <ul
          className="absolute bottom-10 right-10 m-0 p-0 list-none flex flex-row items-center gap-2 transition-opacity duration-1000"
          style={{
            opacity: revealed && activeIndex === null ? 1 : 0,
            pointerEvents: revealed && activeIndex === null ? "auto" : "none",
          }}
        >
          {[-1, 1].map((direction) => (
            <li key={direction}>
              <button
                type="button"
                title={direction === -1 ? "Previous slide" : "Next slide"}
                onClick={() => apiRef.current?.go(direction)}
                className="relative w-[50px] h-[50px] rounded-full bg-transparent overflow-hidden transition-colors duration-300"
                style={{
                  border: `1px solid ${uiColor}`,
                  transform: direction === -1 ? "rotate(180deg)" : "none",
                }}
              >
                <span
                  className="block w-full h-full bg-center bg-no-repeat bg-[length:45%_auto]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'><path d='M4 12H20M20 12L14 6M20 12L14 18' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
                  }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showPreloader && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-700"
          style={{
            opacity: loaded ? 0 : 1,
            pointerEvents: loaded ? "none" : "auto",
          }}
        >
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-[1000ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{
              backgroundColor: preloaderBg,
              transform: loaded ? "scale(1, 0)" : "scale(1, 1)",
            }}
          />
          <div
            className="relative text-white text-[clamp(1.5rem,4vw,3rem)] transition-[transform,opacity] duration-700"
            style={{
              transform: loaded ? "scale(1.4)" : "scale(1)",
              opacity: loaded ? 0 : 1,
            }}
          >
            {percent}
          </div>
        </div>
      )}
    </div>
  );
}