"use client";

import { useEffect, useRef } from "react";

// ─── FestivityScene ───────────────────────────────────────────────────────────
//
// A full-page Three.js sphere cluster scene with a GSAP loading animation,
// mouse-repulsion interaction, and a glassmorphic UI layout overlay.
//
// On load: all spheres start below the screen and arc upward in a staggered
// revolution before settling into their resting positions.
// On mouse move: a raycaster finds the hovered sphere and pushes it away.
// After loading: header + banner text fade in, cursor effect becomes active.
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// brandName        string   "Festivity"        Logo / brand name (top-left)
// navLinks         array    [...]              Nav items: [{ label, href }]
// tagline          string   "Dynamic Collisions"  Center headline (h2)
// leftLabel        string   "X"                Large glyph bottom-left
// leftTitle        string   "Pink & Rose Gold"  Small title under left glyph
// leftSubtitle     string   "Lighting & Material Study"  Under leftTitle
// rightLabel       string   "01"               Large glyph bottom-right
// socialLinks      array    [...]              Social items: [{ icon, href }]
//                                               icon is a Font Awesome class
//                                               e.g. "fa-brands fa-x-twitter"
// topDescTitle     string   "Dispersion Collisions"  Top-left descriptor
// topDescSub       string   "Research & Development"
// rotatedText      string   "Drag cursor to interact"  Fixed right-edge text
//
// sphereColor      string   "#c7a5a5"          Base color of all spheres
// sphereEmissive   string   "red"              Emissive color of all spheres
// bgGradient       string   (see default)      CSS background for the page
//
// cameraZ          number   24                 Camera distance from origin
// cameraFov        number   25                 Perspective FOV in degrees
//
// ambientIntensity number   1.0                Ambient light intensity
// spotIntensity    number   0.52               Spot light intensity
//
// breathingAmp     number   0.1                Max Y displacement per breath
// breathingSpeed   number   0.002              Breathing oscillation speed
// repulseStrength  number   0.2                Mouse push force magnitude
// revolutionDur    number   2                  Sphere intro animation duration(s)
// staggerDelay     number   0.02               Per-sphere stagger in intro (s)
// ─────────────────────────────────────────────────────────────────────────────

// ── Sphere data — positions + radii are tightly paired by index ──────────────
// Splitting into two arrays keeps them readable and matches the original source.

const RADII = [
  1, 0.6, 0.8, 0.4, 0.9, 0.7, 0.9, 0.3, 0.2, 0.5, 0.6, 0.4, 0.5, 0.6, 0.7, 0.3,
  0.4, 0.8, 0.7, 0.5, 0.4, 0.6, 0.35, 0.38, 0.9, 0.3, 0.6, 0.4, 0.2, 0.35, 0.5,
  0.15, 0.2, 0.25, 0.4, 0.8, 0.76, 0.8, 1, 0.8, 0.7, 0.8, 0.3, 0.5, 0.6, 0.55,
  0.42, 0.75, 0.66, 0.6, 0.7, 0.5, 0.6, 0.35, 0.35, 0.35, 0.8, 0.6, 0.7, 0.8,
  0.4, 0.89, 0.3, 0.3, 0.6, 0.4, 0.2, 0.52, 0.5, 0.15, 0.2, 0.25, 0.4, 0.8,
  0.76, 0.8, 1, 0.8, 0.7, 0.8, 0.3, 0.5, 0.6, 0.8, 0.7, 0.75, 0.66, 0.6, 0.7,
  0.5, 0.6, 0.35, 0.35, 0.35, 0.8, 0.6, 0.7, 0.8, 0.4, 0.89, 0.3,
];

const POSITIONS = [
  { x: 0, y: 0, z: 0 },
  { x: 1.2, y: 0.9, z: -0.5 },
  { x: 1.8, y: -0.3, z: 0 },
  { x: -1, y: -1, z: 0 },
  { x: -1, y: 1.62, z: 0 },
  { x: -1.65, y: 0, z: -0.4 },
  { x: -2.13, y: -1.54, z: -0.4 },
  { x: 0.8, y: 0.94, z: 0.3 },
  { x: 0.5, y: -1, z: 1.2 },
  { x: -0.16, y: -1.2, z: 0.9 },
  { x: 1.5, y: 1.2, z: 0.8 },
  { x: 0.5, y: -1.58, z: 1.4 },
  { x: -1.5, y: 1, z: 1.15 },
  { x: -1.5, y: -1.5, z: 0.99 },
  { x: -1.5, y: -1.5, z: -1.9 },
  { x: 1.85, y: 0.8, z: 0.05 },
  { x: 1.5, y: -1.2, z: -0.75 },
  { x: 0.9, y: -1.62, z: 0.22 },
  { x: 0.45, y: 2, z: 0.65 },
  { x: 2.5, y: 1.22, z: -0.2 },
  { x: 2.35, y: 0.7, z: 0.55 },
  { x: -1.8, y: -0.35, z: 0.85 },
  { x: -1.02, y: 0.2, z: 0.9 },
  { x: 0.2, y: 1, z: 1 },
  { x: -2.88, y: 0.7, z: 1 },
  { x: -2, y: -0.95, z: 1.5 },
  { x: -2.3, y: 2.4, z: -0.1 },
  { x: -2.5, y: 1.9, z: 1.2 },
  { x: -1.8, y: 0.37, z: 1.2 },
  { x: -2.4, y: 1.42, z: 0.05 },
  { x: -2.72, y: -0.9, z: 1.1 },
  { x: -1.8, y: -1.34, z: 1.67 },
  { x: -1.6, y: 1.66, z: 0.91 },
  { x: -2.8, y: 1.58, z: 1.69 },
  { x: -2.97, y: 2.3, z: 0.65 },
  { x: 1.1, y: -0.2, z: -1.45 },
  { x: -4, y: 1.78, z: 0.38 },
  { x: 0.12, y: 1.4, z: -1.29 },
  { x: -1.64, y: 1.4, z: -1.79 },
  { x: -3.5, y: -0.58, z: 0.1 },
  { x: -0.1, y: -1, z: -2 },
  { x: -4.5, y: 0.55, z: -0.5 },
  { x: -3.87, y: 0, z: 1 },
  { x: -4.6, y: -0.1, z: 0.65 },
  { x: -3, y: 1.5, z: -0.7 },
  { x: -0.5, y: 0.2, z: -1.5 },
  { x: -1.3, y: -0.45, z: -1.5 },
  { x: -3.35, y: 0.25, z: -1.5 },
  { x: -4.76, y: -1.26, z: 0.4 },
  { x: -4.32, y: 0.85, z: 1.4 },
  { x: -3.5, y: -1.82, z: 0.9 },
  { x: -3.6, y: -0.6, z: 1.46 },
  { x: -4.55, y: -1.5, z: 1.63 },
  { x: -3.8, y: -1.15, z: 2.1 },
  { x: -2.9, y: -0.25, z: 1.86 },
  { x: -2.2, y: -0.4, z: 1.86 },
  { x: -5.1, y: -0.24, z: 1.86 },
  { x: -5.27, y: 1.24, z: 0.76 },
  { x: -5.27, y: 2, z: -0.4 },
  { x: -6.4, y: 0.4, z: 1 },
  { x: -5.15, y: 0.95, z: 2 },
  { x: -6.2, y: 0.5, z: -0.8 },
  { x: -4, y: 0.08, z: 1.8 },
  { x: 2, y: -0.95, z: 1.5 },
  { x: 2.3, y: 2.4, z: -0.1 },
  { x: 2.5, y: 1.9, z: 1.2 },
  { x: 1.8, y: 0.37, z: 1.2 },
  { x: 3.24, y: 0.6, z: 1.05 },
  { x: 2.72, y: -0.9, z: 1.1 },
  { x: 1.8, y: -1.34, z: 1.67 },
  { x: 1.6, y: 1.99, z: 0.91 },
  { x: 2.8, y: 1.58, z: 1.69 },
  { x: 2.97, y: 2.3, z: 0.65 },
  { x: -1.3, y: -0.2, z: -2.5 },
  { x: 4, y: 1.78, z: 0.38 },
  { x: 1.72, y: 1.4, z: -1.29 },
  { x: 2.5, y: -1.2, z: -2 },
  { x: 3.5, y: -0.58, z: 0.1 },
  { x: 0.1, y: 0.4, z: -2.42 },
  { x: 4.5, y: 0.55, z: -0.5 },
  { x: 3.87, y: 0, z: 1 },
  { x: 4.6, y: -0.1, z: 0.65 },
  { x: 3, y: 1.5, z: -0.7 },
  { x: 2.3, y: 0.6, z: -2.6 },
  { x: 4, y: 1.5, z: -1.6 },
  { x: 3.35, y: 0.25, z: -1.5 },
  { x: 4.76, y: -1.26, z: 0.4 },
  { x: 4.32, y: 0.85, z: 1.4 },
  { x: 3.5, y: -1.82, z: 0.9 },
  { x: 3.6, y: -0.6, z: 1.46 },
  { x: 4.55, y: -1.5, z: 1.63 },
  { x: 3.8, y: -1.15, z: 2.1 },
  { x: 2.9, y: -0.25, z: 1.86 },
  { x: 2.2, y: -0.4, z: 1.86 },
  { x: 5.1, y: -0.24, z: 1.86 },
  { x: 5.27, y: 1.24, z: 0.76 },
  { x: 5.27, y: 2, z: -0.4 },
  { x: 6.4, y: 0.4, z: 1 },
  { x: 5.15, y: 0.95, z: 2 },
  { x: 6.2, y: 0.5, z: -0.8 },
  { x: 4, y: 0.08, z: 1.8 },
];

// ── Default nav + social data ─────────────────────────────────────────────────
const DEFAULT_NAV = [
  { label: "octane", href: "#" },
  { label: "cinema 4d", href: "#" },
  { label: "dynamics", href: "#" },
  { label: "collisions", href: "#" },
  { label: "simulations", href: "#" },
];

const DEFAULT_SOCIAL = [
  { icon: "fa-brands fa-x-twitter", href: "#" },
  { icon: "fa-brands fa-facebook-f", href: "#" },
  { icon: "fa-brands fa-instagram", href: "#" },
  { icon: "fa-brands fa-youtube", href: "#" },
];

// ── Scoped CSS ────────────────────────────────────────────────────────────────
// Only things Tailwind cannot express:
//   – @import for fonts
//   – pseudo-element underline on nav anchors
//   – the ::after rule on .fs-right-h1 (decorative bar)
//   – cursor-dot / cursor-ring keyframe-free transitions
// Everything else → Tailwind classes on the JSX.
const STYLES = `
  @import url("https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap");
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

  .fs-font { font-family: "Oswald", sans-serif; }

  .fs-nav-link {
    position: relative;
    font-weight: 500;
    text-transform: uppercase;
    text-decoration: none;
    color: inherit;
  }
  .fs-nav-link::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: currentColor;
    transition: width 0.5s;
  }
  .fs-nav-link:hover::after { width: 100%; }

  .fs-right-h1 {
    position: relative;
    padding-right: 60px;
    text-align: right;
    margin-bottom: 20px;
  }
  .fs-right-h1::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0;
    width: 20%;
    height: 6px;
    background: currentColor;
    transform: translate(-30%, 100%);
  }
`;

export default function FestivityScene({
  brandName = "Festivity",
  navLinks = DEFAULT_NAV,
  tagline = "Dynamic Collisions",
  leftLabel = "X",
  leftTitle = "Pink & Rose Gold",
  leftSubtitle = "Lighting & Material Study",
  rightLabel = "01",
  socialLinks = DEFAULT_SOCIAL,
  topDescTitle = "Dispersion Collisions",
  topDescSub = "Research & Development",
  rotatedText = "Drag cursor to interact",
  sphereColor = "#c7a5a5",
  sphereEmissive = "red",
  bgGradient = "linear-gradient(to right,#fbfaff 0%,#fbfaff 80%,#ecf0fb 100%)",
  cameraZ = 24,
  cameraFov = 25,
  ambientIntensity = 1.0,
  spotIntensity = 0.52,
  breathingAmp = 0.1,
  breathingSpeed = 0.002,
  repulseStrength = 0.2,
  revolutionDur = 2,
  staggerDelay = 0.02,
}) {
  // ── Refs ───────────────────────────────────────────────────────────────────
  const canvasRef = useRef(null); // <canvas> for Three.js renderer
  const cursorDotRef = useRef(null); // small filled circle
  const cursorRingRef = useRef(null); // larger hollow ring
  const overlayRef = useRef(null); // wrapper for all UI (header + banner)
  const mainTxtRef = useRef(null); // giant centered brand text
  const rotatedRef = useRef(null); // fixed rotated label on right edge
  const cursorWrapRef = useRef(null); // custom cursor wrapper (opacity reveal)

  useEffect(() => {
    // ── Script loader helper — same pattern used across all components ───────
    // Guards against double-loading via data-id attribute.
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
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    // ── OrbitControls loader — bypasses UMD module detection ─────────────────
    // The OrbitControls UMD wrapper checks `typeof exports !== "undefined"` and
    // switches to CommonJS mode in any webpack/Next.js environment, meaning it
    // never sets window.THREE.OrbitControls. The fix: fetch the source as text,
    // strip the UMD envelope, and call the inner factory directly with the
    // already-loaded window.THREE — guaranteeing the global is set correctly.
    const loadOrbitControls = () =>
      new Promise((resolve, reject) => {
        if (window.THREE && window.THREE.OrbitControls) {
          resolve();
          return;
        }
        fetch(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js",
        )
          .then((r) => r.text())
          .then((code) => {
            // Execute with a fake `exports` object that routes the factory call
            // to set window.THREE.OrbitControls directly.
            const fakeExports = {};
            const fakeModule = { exports: fakeExports };
            // eslint-disable-next-line no-new-func
            const fn = new Function(
              "THREE",
              "exports",
              "module",
              "require",
              code +
                "\nif(typeof module.exports === 'function' || module.exports.OrbitControls)" +
                "{ THREE.OrbitControls = module.exports.OrbitControls || module.exports; }",
            );
            try {
              fn(window.THREE, fakeExports, fakeModule, () => {});
            } catch (_) {
              // If the wrapped call errors, OrbitControls may still have been
              // set via the global branch — check before rejecting.
            }
            // Final fallback: if still not set, patch it from fakeModule.exports
            if (!window.THREE.OrbitControls && fakeModule.exports) {
              window.THREE.OrbitControls =
                fakeModule.exports.OrbitControls || fakeModule.exports;
            }
            resolve();
          })
          .catch(reject);
      });

    // ── Load Three.js + GSAP in parallel, then wire OrbitControls ────────────
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
    ])
      .then(() => loadOrbitControls())
      .then(() => {
        const THREE = window.THREE;
        const gsap = window.gsap;
        if (!THREE || !gsap || !canvasRef.current) return;

        // ── Scene ────────────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          cameraFov,
          window.innerWidth / window.innerHeight,
          0.1,
          1000,
        );
        camera.position.z = cameraZ;

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // ── OrbitControls ────────────────────────────────────────────────────
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // ── Spheres ──────────────────────────────────────────────────────────
        const material = new THREE.MeshLambertMaterial({
          color: sphereColor,
          emissive: sphereEmissive,
        });
        const group = new THREE.Group();
        const spheres = [];

        POSITIONS.forEach((pos, i) => {
          const radius = RADII[i];
          const geometry = new THREE.SphereGeometry(radius, 64, 64);
          const sphere = new THREE.Mesh(geometry, material);
          sphere.position.set(pos.x, pos.y, pos.z);
          sphere.userData = { originalPosition: { ...pos }, radius };
          sphere.castShadow = true;
          sphere.receiveShadow = true;
          spheres.push(sphere);
          group.add(sphere);
        });
        scene.add(group);

        // ── Lights ───────────────────────────────────────────────────────────
        const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, spotIntensity);
        spotLight.position.set(14, 24, 30);
        spotLight.castShadow = true;
        scene.add(spotLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirLight.position.set(0, -4, 0);
        scene.add(dirLight);

        // ── Intro animation ──────────────────────────────────────────────────
        // Spheres start at Y = -25 (off-screen below).
        // Each arcs upward through a z-rotation then settles at its resting pos.
        const INIT_Y = -25;
        const REVOLUTION_R = 4;

        spheres.forEach((sphere, i) => {
          sphere.position.y = INIT_Y;

          gsap
            .timeline({ delay: i * staggerDelay })
            // Rise phase — sweeps +z like the front half of a vertical loop
            .to(sphere.position, {
              duration: revolutionDur / 2,
              y: REVOLUTION_R,
              ease: "power1.out",
              onUpdate: function () {
                const p = this.progress();
                sphere.position.z =
                  sphere.userData.originalPosition.z +
                  Math.sin(p * Math.PI) * REVOLUTION_R;
              },
            })
            // Fall phase — sweeps back on -z
            .to(sphere.position, {
              duration: revolutionDur / 2,
              y: INIT_Y / 5,
              ease: "power1.out",
              onUpdate: function () {
                const p = this.progress();
                sphere.position.z =
                  sphere.userData.originalPosition.z -
                  Math.sin(p * Math.PI) * REVOLUTION_R;
              },
            })
            // Settle to resting position
            .to(sphere.position, {
              duration: 0.6,
              x: sphere.userData.originalPosition.x,
              y: sphere.userData.originalPosition.y,
              z: sphere.userData.originalPosition.z,
              ease: "power1.out",
            });
        });

        // ── Reveal UI after loading completes ────────────────────────────────
        // Timeout matches total intro duration + small buffer.
        const revealDelay = (revolutionDur + 1) * 1000;
        let loadingComplete = false;

        const revealTimer = setTimeout(() => {
          loadingComplete = true;
          if (overlayRef.current) {
            overlayRef.current.style.opacity = "1";
          }
          if (rotatedRef.current) rotatedRef.current.style.opacity = "1";
          if (mainTxtRef.current) {
            mainTxtRef.current.style.opacity = "0";
          }
        }, revealDelay);

        // ── Custom cursor ────────────────────────────────────────────────────
        // GSAP quickTo keeps the dot snappy; the ring follows with more lag.
        // Only active on desktop (pointer: fine). The mouse-effect wrapper
        // starts opacity:0 and becomes visible on first mousemove.
        gsap.set(cursorDotRef.current, { xPercent: -50, yPercent: -50 });
        gsap.set(cursorRingRef.current, { xPercent: -50, yPercent: -50 });

        const xDot = gsap.quickTo(cursorDotRef.current, "x", {
          duration: 0.6,
          ease: "power3",
        });
        const yDot = gsap.quickTo(cursorDotRef.current, "y", {
          duration: 0.6,
          ease: "power3",
        });
        const xRing = gsap.quickTo(cursorRingRef.current, "x", {
          duration: 0.6,
          ease: "power3",
        });
        const yRing = gsap.quickTo(cursorRingRef.current, "y", {
          duration: 0.6,
          ease: "power3",
        });

        // ── Mouse interaction ────────────────────────────────────────────────
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const tempVector = new THREE.Vector3();
        const forces = new Map();

        function onMouseMove(e) {
          // Move cursor elements
          xDot(e.clientX);
          yDot(e.clientY);
          xRing(e.clientX);
          yRing(e.clientY);

          // Show cursor wrapper on first move
          if (cursorWrapRef.current) cursorWrapRef.current.style.opacity = "1";

          if (!loadingComplete) return;

          // Raycasting — find hovered sphere and add a push force
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const hits = raycaster.intersectObjects(spheres);

          if (hits.length > 0) {
            const sphere = hits[0].object;
            const force = new THREE.Vector3();
            force
              .subVectors(hits[0].point, sphere.position)
              .normalize()
              .multiplyScalar(repulseStrength);
            forces.set(sphere.uuid, force);
          }
        }

        window.addEventListener("mousemove", onMouseMove);

        // ── Collision resolution ─────────────────────────────────────────────
        // Simple O(n²) push-apart — runs every frame after loading is done.
        function handleCollisions() {
          for (let i = 0; i < spheres.length; i++) {
            const a = spheres[i];
            const ra = a.userData.radius;
            for (let j = i + 1; j < spheres.length; j++) {
              const b = spheres[j];
              const rb = b.userData.radius;
              const dist = a.position.distanceTo(b.position);
              const min = (ra + rb) * 1.2;
              if (dist < min) {
                tempVector.subVectors(b.position, a.position).normalize();
                const push = (min - dist) * 0.4;
                a.position.sub(tempVector.clone().multiplyScalar(push));
                b.position.add(tempVector.multiplyScalar(push));
              }
            }
          }
        }

        // ── Render loop ──────────────────────────────────────────────────────
        let rafId;
        function animate() {
          rafId = requestAnimationFrame(animate);

          if (loadingComplete) {
            const t = Date.now() * breathingSpeed;
            spheres.forEach((sphere, i) => {
              const offset = i * 0.2;
              const breathingY = Math.sin(t + offset) * breathingAmp;
              const breathingZ = Math.cos(t + offset) * breathingAmp * 0.5;

              // Apply mouse force, then decay it
              const force = forces.get(sphere.uuid);
              if (force) {
                sphere.position.add(force);
                force.multiplyScalar(0.95);
                if (force.length() < 0.01) forces.delete(sphere.uuid);
              }

              // Lerp back toward resting position (with breathing offset)
              const orig = sphere.userData.originalPosition;
              tempVector.set(orig.x, orig.y + breathingY, orig.z + breathingZ);
              sphere.position.lerp(tempVector, 0.018);
            });

            handleCollisions();
          }

          controls.update();
          renderer.render(scene, camera);
        }
        animate();

        // ── Resize handler ───────────────────────────────────────────────────
        function onResize() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener("resize", onResize);

        // ── Cleanup on unmount ───────────────────────────────────────────────
        return () => {
          clearTimeout(revealTimer);
          cancelAnimationFrame(rafId);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
        };
      })
      .catch((e) =>
        console.error("[FestivityScene] Script load failed:", e.message),
      );
  }, [
    // Props that wire into the Three.js setup — changes here rebuild the scene.
    sphereColor,
    sphereEmissive,
    cameraZ,
    cameraFov,
    ambientIntensity,
    spotIntensity,
    breathingAmp,
    breathingSpeed,
    repulseStrength,
    revolutionDur,
    staggerDelay,
  ]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fs-font relative w-full min-h-screen overflow-x-hidden text-[#101117] text-[16px] leading-[1.3]"
      style={{ background: bgGradient }}
    >
      <style>{STYLES}</style>

      {/* ── Three.js canvas — fixed fullscreen at z:0 ── */}
      {/*
        Sits at z-index 0 so it receives pointer events for OrbitControls drag.
        All UI elements float above it via their own z-index values.
        The canvas must NOT have pointer-events:none — OrbitControls attaches
        its listeners directly to renderer.domElement (the canvas itself).
      */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* ── Custom cursor ── */}
      {/*
        Starts opacity:0; made visible on first mousemove in the useEffect.
        Hidden on touch/tablet via the @media(max-width:1199px) display:none
        equivalent — we use a Tailwind responsive class instead.
      */}
      <div
        ref={cursorWrapRef}
        className="fixed top-0 left-0 pointer-events-none select-none hidden lg:block"
        style={{ zIndex: 111111, opacity: 0 }}
      >
        <div
          ref={cursorDotRef}
          className="absolute w-[10px] h-[10px] rounded-full bg-[#101117]"
          style={{ left: 0, top: 0, transition: "all 0.05s" }}
        />
        <div
          ref={cursorRingRef}
          className="absolute w-[40px] h-[40px] rounded-full border border-[#101117]"
          style={{ left: 0, top: 0, transition: "all 0.1s" }}
        />
      </div>

      {/* ── Giant background brand text (visible during loading, fades out) ── */}
      {/*
        Fixed, centered, z-index 1 (above canvas at 0, below overlay at 10).
        Opacity transition handled by the reveal timer in useEffect.
      */}
      <h1
        ref={mainTxtRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   text-[160px] uppercase tracking-[-4px] font-black
                   pointer-events-none select-none"
        style={{ zIndex: 1, transition: "opacity 0.5s ease-in-out" }}
      >
        {brandName}
      </h1>

      {/* ── UI overlay — header + banner, revealed after intro ── */}
      {/*
        Starts opacity:0 in useEffect; overrideRef isn't needed here because
        we grab it via overlayRef and set style.opacity imperatively.
        Using transition in Tailwind for the fade-in.
      */}
      {/*
        The overlay is pointer-events:none so mouse events pass through to the
        canvas underneath. Individual interactive children (links, buttons)
        override this with pointer-events:auto via Tailwind's class.
      */}
      <div
        ref={overlayRef}
        className="relative w-full pointer-events-none"
        style={{
          opacity: 0,
          transition: "opacity 0.5s ease-in-out",
          zIndex: 10,
        }}
      >
        {/* ── Header ── */}
        <header>
          <div className="flex justify-between items-center px-5 py-4">
            {/* Brand */}
            <a
              href="#"
              className="fs-font text-[42px] font-black tracking-[-1px] uppercase text-inherit no-underline pointer-events-auto"
            >
              {brandName}
            </a>

            {/* Nav — hidden on mobile */}
            <nav className="hidden md:block">
              <ul className="flex gap-[120px] items-center lg:gap-[80px] xl:gap-[120px]">
                {navLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="fs-nav-link pointer-events-auto"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Hamburger — shown only on mobile */}
            <button className="bg-transparent border-0 cursor-pointer pointer-events-auto md:hidden">
              <i className="fa-solid fa-bars text-[24px] leading-none text-[#101117]" />
            </button>
          </div>
        </header>

        {/* ── Banner ── */}
        <section>
          <div
            className="flex flex-col justify-between gap-[10px] px-5
                       pt-[100px] pb-[30px]"
            style={{ minHeight: "calc(100dvh - 90px)" }}
          >
            {/* Top descriptor block */}
            <div>
              <h5 className="text-[16px] font-semibold mb-1">{topDescTitle}</h5>
              <h6 className="text-[14px] font-normal mb-2">{topDescSub}</h6>
              {/* Decorative dash */}
              <span className="inline-block w-5 h-[3px] bg-[#101117] rounded-full" />
            </div>

            {/* Bottom three-column layout */}
            <div className="flex justify-between items-end">
              {/* Left — large glyph + descriptor */}
              <div>
                <h1
                  className="text-[160px] font-black mb-5 leading-none
                               md:text-[100px] lg:text-[140px] xl:text-[160px]"
                >
                  {leftLabel}
                </h1>
                <div>
                  <h5 className="text-[16px] font-medium mb-1">{leftTitle}</h5>
                  <h6 className="text-[14px] font-normal">{leftSubtitle}</h6>
                </div>
              </div>

              {/* Center — tagline, hidden on mobile */}
              <div className="hidden md:block">
                <h2
                  className="text-[34px] uppercase tracking-[-2px]
                               md:text-[20px] lg:text-[28px] xl:text-[34px]"
                >
                  {tagline}
                </h2>
              </div>

              {/* Right — large number + social links */}
              <div>
                <h1
                  className="fs-right-h1 text-[160px] font-black leading-none
                             md:text-[100px] lg:text-[140px] xl:text-[160px]"
                >
                  {rightLabel}
                </h1>
                <div className="flex gap-[30px] items-center">
                  <span className="uppercase text-[14px]">Social Links</span>
                  <ul className="flex gap-2">
                    {socialLinks.map((s, i) => (
                      <li key={i}>
                        <a
                          href={s.href}
                          className="text-[#101117] no-underline pointer-events-auto"
                        >
                          <i className={s.icon + " text-[16px]"} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Rotated right-edge label ── */}
      {/*
        Fixed outside overlayRef so it can be truly fixed-positioned.
        Revealed by the same timer via rotatedRef.
      */}
      <span
        ref={rotatedRef}
        className="fixed top-1/2 right-5 uppercase text-[14px] pointer-events-none select-none"
        style={{
          transform: "translate(45%, -600%) rotate(90deg)",
          zIndex: 10,
          opacity: 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        {rotatedText}
      </span>
      {/*
        Sits outside overlayRef so it can be fixed-positioned without
        disrupting the banner layout. Revealed by the same timer via its
        own rotatedRef — the useEffect sets style.opacity = "1" on both.
      */}
    </div>
  );
}
