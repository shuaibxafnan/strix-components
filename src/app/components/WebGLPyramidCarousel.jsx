"use client";

import { useEffect, useRef } from "react";

// ─── WebGLPyramidCarousel ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            array    [...]      Texture URLs, one plane per entry
// bgColor           string   #d5d5d5    Canvas clear color
// height            string   100vh      Height of the component
// planeWidth        number   1          Plane width in world units
// planeHeight       number   2.5        Plane height in world units
// planeGap          number   0.1        Gap between neighbouring planes
// segments          number   30         Plane geometry subdivisions per axis
// stackOffset       number   0.1        Y step of the pyramidal stagger
// cameraZ           number   5          Camera distance from the plane row
// cameraFov         number   45         Camera field of view
// speedWheel        number   0.02       Progress gained per wheel unit
// speedDrag         number   -0.3       Progress gained per px dragged
// tweenDuration     number   2.5        Duration of the reposition tween (s)
// tweenEase         string   power3.out Ease of the reposition tween
// hoverScale        number   1.1        Scale applied to a hovered plane
// hoverDuration     number   0.5        Hover scale tween duration (s)
// openDuration      number   2.5        Fullscreen open/close tween (s)
// waveFrequency     number   15         Ripple frequency during the open morph
// waveSpeed         number   12         Ripple phase shift during the open morph
// enableWheel       bool     true       Allow wheel/trackpad scrubbing
// enableDrag        bool     true       Allow pointer dragging
// enableClick       bool     true       Allow click to open a plane fullscreen
// startProgress     number   0          Initial scrub position (0–100)
// dpr               number   2          Max device pixel ratio cap
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=900&q=80",
];

const VERTEX_SHADER = `
varying vec2 vUv;
uniform float uProgress;
uniform vec2 uZoomScale;
uniform float uWaveFrequency;
uniform float uWaveSpeed;
void main() {
  vUv = uv;
  vec3 pos = position;
  float angle = uProgress * 3.14159265 / 2.;
  float wave = cos(angle);
  float c = sin(length(uv - .5) * uWaveFrequency + uProgress * uWaveSpeed) * .5 + .5;
  pos.x *= mix(1., uZoomScale.x + wave * c, uProgress);
  pos.y *= mix(1., uZoomScale.y + wave * c, uProgress);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uZoomScale;
uniform vec2 uImageRes;
varying vec2 vUv;
vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st;
  return u * s / st + o;
}
void main() {
  vec2 uv = CoverUV(vUv, uRes, uImageRes);
  vec3 tex = texture2D(uTex, uv).rgb;
  gl_FragColor = vec4(tex, 1.0);
}
`;

export default function WebGLPyramidCarousel({
  images = DEFAULT_IMAGES,
  bgColor = "#d5d5d5",
  height = "100vh",
  planeWidth = 1,
  planeHeight = 2.5,
  planeGap = 0.1,
  segments = 30,
  stackOffset = 0.1,
  cameraZ = 5,
  cameraFov = 45,
  speedWheel = 0.02,
  speedDrag = -0.3,
  tweenDuration = 2.5,
  tweenEase = "power3.out",
  hoverScale = 1.1,
  hoverDuration = 0.5,
  openDuration = 2.5,
  waveFrequency = 15,
  waveSpeed = 12,
  enableWheel = true,
  enableDrag = true,
  enableClick = true,
  startProgress = 0,
  dpr = 2,
}) {
  const mountRef = useRef(null);
  const propsRef = useRef({});

  propsRef.current = {
    images,
    planeWidth,
    planeHeight,
    planeGap,
    segments,
    stackOffset,
    cameraZ,
    cameraFov,
    speedWheel,
    speedDrag,
    tweenDuration,
    tweenEase,
    hoverScale,
    hoverDuration,
    openDuration,
    waveFrequency,
    waveSpeed,
    enableWheel,
    enableDrag,
    enableClick,
    startProgress,
    dpr,
    bgColor,
  };

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

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

    const importModule = new Function("url", "return import(url)");

    const boot = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      );
      const THREE = await importModule(
        "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      );
      if (disposed || !mountRef.current) return;

      const { gsap } = window;
      const P = propsRef.current;
      const mount = mountRef.current;

      const scene = new THREE.Scene();
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, P.dpr));
      renderer.setClearColor(new THREE.Color(P.bgColor), 1);
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      const camera = new THREE.PerspectiveCamera(P.cameraFov, 1, 0.1, 100);
      camera.position.z = P.cameraZ;

      const viewport = { width: 1, height: 1 };
      const computeViewport = () => {
        const h = 2 * Math.tan((P.cameraFov * Math.PI) / 360) * P.cameraZ;
        viewport.height = h;
        viewport.width = h * camera.aspect;
      };

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");

      const group = new THREE.Group();
      scene.add(group);

      const planes = P.images.map((src, i) => {
        const uniforms = {
          uProgress: { value: 0 },
          uZoomScale: { value: new THREE.Vector2(1, 1) },
          uTex: { value: null },
          uRes: { value: new THREE.Vector2(P.planeWidth, P.planeHeight) },
          uImageRes: { value: new THREE.Vector2(1, 1) },
          uWaveFrequency: { value: P.waveFrequency },
          uWaveSpeed: { value: P.waveSpeed },
        };
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(
            P.planeWidth,
            P.planeHeight,
            P.segments,
            P.segments,
          ),
          new THREE.ShaderMaterial({
            uniforms,
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
          }),
        );
        mesh.position.z = -0.01;
        mesh.userData.index = i;
        group.add(mesh);

        loader.load(src, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          uniforms.uTex.value = tex;
          uniforms.uImageRes.value.set(tex.image.width, tex.image.height);
        });

        return mesh;
      });

      const state = {
        progress: P.startProgress,
        oldProgress: P.startProgress,
        active: null,
        hovered: null,
        isDown: false,
        startX: 0,
        moved: 0,
      };

      const pyramidal = (index) =>
        planes.map((_, i) =>
          index === i ? planes.length : planes.length - Math.abs(index - i),
        );

      const layout = () => {
        const active = Math.floor((state.progress / 100) * (planes.length - 1));
        const py = pyramidal(active);
        planes.forEach((mesh, i) => {
          gsap.killTweensOf(mesh.position);
          gsap.to(mesh.position, {
            duration: P.tweenDuration,
            ease: P.tweenEase,
            x: (i - active) * (P.planeWidth + P.planeGap),
            y: planes.length * -P.stackOffset + py[i] * P.stackOffset,
          });
          mesh.renderOrder = py[i];
        });
      };

      const setOpen = (index) => {
        planes.forEach((mesh, i) => {
          const on = index === i;
          const u = mesh.material.uniforms;
          gsap.killTweensOf(u.uProgress);
          gsap.killTweensOf(u.uRes.value);
          gsap.to(u.uProgress, {
            duration: P.openDuration,
            ease: P.tweenEase,
            value: on ? 1 : 0,
          });
          gsap.to(u.uRes.value, {
            duration: P.openDuration,
            ease: P.tweenEase,
            x: on ? viewport.width : P.planeWidth,
            y: on ? viewport.height : P.planeHeight,
          });
          mesh.position.z = on ? 0 : -0.01;
          mesh.renderOrder = on ? 999 : 0;
        });
      };

      const resize = () => {
        const w = mount.clientWidth || 1;
        const h = mount.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        computeViewport();
        planes.forEach((mesh) => {
          const u = mesh.material.uniforms;
          u.uZoomScale.value.set(
            viewport.width / P.planeWidth,
            viewport.height / P.planeHeight,
          );
          if (state.active === mesh.userData.index) {
            u.uRes.value.set(viewport.width, viewport.height);
          }
        });
      };

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const pick = (clientX, clientY) => {
        const rect = mount.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(planes, false);
        return hits.length ? hits[0].object : null;
      };

      const applyHover = (mesh) => {
        planes.forEach((m) => {
          const s = m === mesh && state.active === null ? P.hoverScale : 1;
          gsap.to(m.scale, {
            duration: P.hoverDuration,
            ease: "power3.out",
            x: s,
            y: s,
          });
        });
      };

      const onWheel = (e) => {
        if (!P.enableWheel || state.active !== null) return;
        const vertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
        state.progress += (vertical ? e.deltaY : e.deltaX) * P.speedWheel;
      };

      const onDown = (e) => {
        if (state.active !== null) return;
        state.isDown = true;
        state.moved = 0;
        state.startX = e.clientX;
      };

      const onMove = (e) => {
        if (state.active !== null) return;
        if (state.isDown && P.enableDrag) {
          const dx = e.clientX - state.startX;
          state.moved += Math.abs(dx);
          state.progress += dx * P.speedDrag;
          state.startX = e.clientX;
        }
        const hit = pick(e.clientX, e.clientY);
        if (hit !== state.hovered) {
          state.hovered = hit;
          applyHover(hit);
          mount.style.cursor = hit ? "pointer" : "grab";
        }
      };

      const onUp = (e) => {
        const wasDown = state.isDown;
        state.isDown = false;
        if (!P.enableClick) return;
        if (state.active !== null) {
          state.active = null;
          setOpen(null);
          layout();
          return;
        }
        if (!wasDown || state.moved > 6) return;
        const hit = pick(e.clientX, e.clientY);
        if (!hit) return;
        const index = hit.userData.index;
        state.active = index;
        state.progress = (index / (planes.length - 1)) * 100;
        applyHover(null);
        gsap.killTweensOf(hit.scale);
        hit.scale.set(1, 1, 1);
        gsap.killTweensOf(hit.position);
        gsap.to(hit.position, {
          duration: 0.6,
          ease: "power3.out",
          x: 0,
          y: 0,
        });
        planes.forEach((mesh, i) => {
          if (i === index) return;
          const py = pyramidal(index);
          gsap.killTweensOf(mesh.position);
          gsap.to(mesh.position, {
            duration: P.tweenDuration,
            ease: P.tweenEase,
            x: (i - index) * (P.planeWidth + P.planeGap),
            y: planes.length * -P.stackOffset + py[i] * P.stackOffset,
          });
        });
        setOpen(index);
      };

      let raf;
      let lastActive = -1;
      const tick = () => {
        state.progress = Math.max(0, Math.min(state.progress, 100));
        const active = Math.floor((state.progress / 100) * (planes.length - 1));
        if (active !== lastActive) {
          lastActive = active;
          if (state.active === null) layout();
        }
        state.oldProgress += (state.progress - state.oldProgress) * 0.1;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };

      resize();
      layout();
      mount.style.cursor = "grab";
      tick();

      const ro = new ResizeObserver(resize);
      ro.observe(mount);
      mount.addEventListener("wheel", onWheel, { passive: true });
      mount.addEventListener("pointerdown", onDown);
      mount.addEventListener("pointermove", onMove);
      mount.addEventListener("pointerup", onUp);
      mount.addEventListener("pointerleave", () => (state.isDown = false));

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        mount.removeEventListener("wheel", onWheel);
        mount.removeEventListener("pointerdown", onDown);
        mount.removeEventListener("pointermove", onMove);
        mount.removeEventListener("pointerup", onUp);
        planes.forEach((m) => {
          m.geometry.dispose();
          if (m.material.uniforms.uTex.value)
            m.material.uniforms.uTex.value.dispose();
          m.material.dispose();
        });
        renderer.dispose();
        if (renderer.domElement.parentNode)
          renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    };

    boot().catch((e) =>
      console.error("[WebGLPyramidCarousel] init failed:", e.message),
    );

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative w-full select-none overflow-hidden touch-none"
      style={{ height, backgroundColor: bgColor }}
    />
  );
}
