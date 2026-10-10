"use client";

import { useEffect, useRef } from "react";

// ─── LenticularPanels ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// imageA            string    unsplash   Texture for the first interlaced strip set
// imageB            string    unsplash   Texture for the second interlaced strip set
// bgColor           string    #0b0b0b    Wrapper background (canvas itself is alpha)
// className         string    ""         Extra classes merged onto the wrapper
// planeWidth        number    10         Plane width in world units
// planeHeight       number    10         Plane height in world units
// stripDensity      number    20         Subdivisions per world unit (SW = w × this)
// ridgeDepth        number    0.5        Z displacement between alternating ridges
// cameraFov         number    75         Perspective camera field of view
// cameraDistance    number    8          Camera Z offset from origin
// cameraNear        number    0.1        Near clipping plane
// cameraFar         number    100        Far clipping plane
// lightColor        string    white      Color of both side spotlights
// lightIntensity    number    1          Intensity of both side spotlights
// lightDistance     number    null       Spotlight falloff distance (defaults to planeWidth)
// lightAngle        number    1.5707963  Spotlight cone angle in radians
// enableControls    boolean   true       Mount OrbitControls for drag-to-orbit
// enableDamping     boolean   false      Smooth inertia on the orbit controls
// autoRotate        boolean   false      Let OrbitControls spin the camera on its own
// autoRotateSpeed   number    1          Speed of the OrbitControls auto rotation
// animate           boolean   true       Run the intro reveal timeline
// swingAngle        number    0.6283185  Peak Y rotation of the group in radians
// tiltRatio         number    0.5        Fraction of swingAngle applied as X tilt
// stepDuration      number    0.35       Duration of each timeline leg (s)
// repeat            number    1          Timeline repeat count (-1 for infinite)
// yoyo              boolean   true       Reverse the timeline on each repeat
// delay             number    0          Delay before the timeline starts (s)
// ──────────────────────────────────────────────────────────────────────────

const THREE_URL = "https://unpkg.com/three@0.120.0/build/three.module.js";
const CONTROLS_URL =
  "https://unpkg.com/three@0.120.0/examples/jsm/controls/OrbitControls.js";
const GSAP_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";

export default function LenticularPanels({
  imageA = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
  imageB = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
  bgColor = "#0b0b0b",
  className = "",
  planeWidth = 10,
  planeHeight = 10,
  stripDensity = 20,
  ridgeDepth = 0.5,
  cameraFov = 75,
  cameraDistance = 8,
  cameraNear = 0.1,
  cameraFar = 100,
  lightColor = "white",
  lightIntensity = 1,
  lightDistance = null,
  lightAngle = Math.PI / 2,
  enableControls = true,
  enableDamping = false,
  autoRotate = false,
  autoRotateSpeed = 1,
  animate = true,
  swingAngle = Math.PI / 5,
  tiltRatio = 0.5,
  stepDuration = 0.35,
  repeat = 1,
  yoyo = true,
  delay = 0,
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    const cleanups = [];

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

    const importESM = new Function("url", "return import(url)");

    const boot = async () => {
      const host = hostRef.current;
      if (!host) return;

      await loadScript(GSAP_URL);
      const THREE = await importESM(THREE_URL);
      const controlsMod = await importESM(CONTROLS_URL);
      const OrbitControls = controlsMod.OrbitControls;
      const gsap = window.gsap;
      if (disposed || !hostRef.current) return;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      const canvas = renderer.domElement;
      canvas.className = "block w-full h-full cursor-grab";
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        cameraFov,
        1,
        cameraNear,
        cameraFar,
      );
      camera.position.set(0, 0, cameraDistance);

      let controls = null;
      if (enableControls) {
        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = enableDamping;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = autoRotateSpeed;
      }

      const resize = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };

      const ro = new ResizeObserver(resize);
      ro.observe(host);
      window.addEventListener("resize", resize);
      resize();

      const reach = lightDistance == null ? planeWidth : lightDistance;
      const lights = [-planeWidth, planeWidth].map((x) => {
        const L = new THREE.SpotLight(
          lightColor,
          lightIntensity,
          reach,
          lightAngle,
          0,
          0,
        );
        L.position.set(x, 0, 0);
        scene.add(L);
        return L;
      });

      const SW = Math.max(2, Math.round(planeWidth * stripDensity));
      const SH = Math.max(2, Math.round(planeHeight * stripDensity));

      const grid = [];
      for (let i = 0; i < SH; ++i) {
        grid[i] = [];
        const nY = i / (SH - 1);
        for (let j = 0; j < SW; ++j) {
          const nX = j / (SW - 1);
          grid[i][j] = {
            uv: [nX, nY],
            xyz: [
              (nX - 0.5) * planeWidth,
              (nY - 0.5) * planeHeight,
              ((i + 1) % 2) * (j % 2) * ridgeDepth - ridgeDepth / 2,
            ],
          };
        }
      }

      const geoms = [];
      for (let k = 0; k <= 1; ++k) {
        const geom = new THREE.BufferGeometry();
        const N = ((SW - k) >> 1) * (SH - 1);
        const pos = new Float32Array(N * 3 * 6);
        const uv = new Float32Array(N * 2 * 6);
        let n = 0;
        const push = (v) => {
          pos.set(v.xyz, n * 3);
          uv.set(v.uv, n * 2);
          ++n;
        };
        for (let i = 0, I = SH - 1; i < I; ++i) {
          for (let j = k, J = SW - 1; j < J; j += 2) {
            push(grid[i][j]);
            push(grid[i][j + 1]);
            push(grid[i + 1][j]);
            push(grid[i][j + 1]);
            push(grid[i + 1][j + 1]);
            push(grid[i + 1][j]);
          }
        }
        geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        geom.computeVertexNormals();
        geoms.push(geom);
      }

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      const textures = [imageA, imageB].map((url) => loader.load(url));
      const materials = textures.map(
        (map) => new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide }),
      );

      const group = new THREE.Group();
      geoms.forEach((geom, i) => {
        group.add(new THREE.Mesh(geom, materials[i]));
      });
      scene.add(group);

      let tl = null;
      if (animate) {
        const k = swingAngle;
        tl = gsap
          .timeline({
            defaults: { duration: stepDuration },
            repeat,
            yoyo,
            delay,
          })
          .to(group.rotation, { x: -k * tiltRatio, y: k })
          .to(group.rotation, { x: -k * tiltRatio, y: -k })
          .to(group.rotation, { x: 0, y: 0 });
      }

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
        if (controls) controls.update();
      });

      cleanups.push(() => {
        if (tl) tl.kill();
        renderer.setAnimationLoop(null);
        ro.disconnect();
        window.removeEventListener("resize", resize);
        if (controls) controls.dispose();
        geoms.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        textures.forEach((t) => t.dispose());
        lights.forEach((l) => scene.remove(l));
        renderer.dispose();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      });
    };

    boot().catch((e) =>
      console.error("[LenticularPanels] init failed:", e.message),
    );

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [
    imageA,
    imageB,
    planeWidth,
    planeHeight,
    stripDensity,
    ridgeDepth,
    cameraFov,
    cameraDistance,
    cameraNear,
    cameraFar,
    lightColor,
    lightIntensity,
    lightDistance,
    lightAngle,
    enableControls,
    enableDamping,
    autoRotate,
    autoRotateSpeed,
    animate,
    swingAngle,
    tiltRatio,
    stepDuration,
    repeat,
    yoyo,
    delay,
  ]);

  return (
    <div
      ref={hostRef}
      className={`relative w-full h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    />
  );
}
