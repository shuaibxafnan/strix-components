"use client";

import { useEffect, useRef, useState } from "react";

// ─── CosmicCarousel ───────────────────────────────────────────────────────────
//
// A full-viewport Three.js WebGL image carousel with:
//  • Animated dot-ring preloader
//  • Drag / wheel / touch / keyboard navigation
//  • Momentum + distortion physics on the slide meshes
//  • Per-slide title overlay that fades/blurs with distance
//  • Ambient floating particles
//  • Film-grain noise + scratch overlays
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// — Scene —
// bgColor          string   "#000"         Three.js scene + page background
// fogDensity       number   0.08           Exponential fog density
// slideWidth       number   3.2            Width of each slide in world units
// slideHeight      number   1.8            Height of each slide in world units
// slideGap         number   0.25           Gap between slides in world units
// slideCount       number   10             Total number of slides (loops images)
// cameraZ          number   5              Camera Z position
// cameraFov        number   50             Camera field of view (degrees)
//
// — Images & titles —
// images           array    [{url, title, offsetY}]
//                           Each entry provides the image URL, overlay title
//                           text, and a vertical pixel offset for the title.
//
// — Controls —
// wheelSensitivity    number  0.01   How far the carousel moves per wheel tick
// touchSensitivity    number  0.01   How far the carousel moves per touch pixel
// momentumMultiplier  number  2.5    Multiplier applied to fling velocity
// smoothing           number  0.1    Position lerp factor (0=instant, 1=never)
// slideLerp           number  0.075  Per-slide lerp toward target position
//
// — Distortion physics —
// maxDistortion            number  4.0   Upper clamp on distortion factor
// distortionSensitivity    number  0.25  Scales how quickly distortion builds
// distortionDecay          number  0.93  Multiplicative decay per frame
// distortionSmoothing      number  0.075 Lerp factor toward target distortion
// distortionIntensity      number  0.3   Overall scale of vertex displacement
// horizontalDistortionDamping number 0.3 Reduces X-axis jitter on small moves
// rotationFactor           number  0.2   Extra mesh wobble from distortion
// animationSpeed           number  0.5   Scales wave time progression
// momentumDistortionBoost  number  0.3   Velocity-based wave amplitude boost
// directionInfluence       number  0.4   How much drag direction warps the mesh
// waveAmplitudeBoost       number  0.2   Multiplier on wave amplitude boost
// directionChangeThreshold number  0.02  Min movement to register a direction change
// directionSmoothing       number  0.03  Lerp rate for direction change
//
// — Title overlay —
// textFadeStart    number   1.6    World distance from centre where text starts fading
// textFadeEnd      number   2.1    World distance where text is fully invisible
// textMaxBlur      number   5      Maximum CSS blur (px) at full fade
// accentColor      string   "#ffe600"  Title number line + dot accent colour
//
// — Particles —
// particleCount    number   80     Number of ambient floating particle divs
//
// — Preloader —
// preloaderBg      string   "#000"  Preloader background colour
// preloaderRings   number   5       Number of concentric dot rings
// preloaderDuration number  5000    Total preloader animation time (ms)
// ──────────────────────────────────────────────────────────────────────────────

// ─── Default image set ────────────────────────────────────────────────────────
const DEFAULT_IMAGES = [
  {
    url: "https://cdn.cosmos.so/2f49a117-05e7-4ae9-9e95-b9917f970adb?format=jpeg",
    title: "COSMIC VOYAGE",
    offsetY: -25,
  },
  {
    url: "https://cdn.cosmos.so/7b5340f5-b4dc-4c08-8495-c507fa81480b?format=jpeg",
    title: "ASTRAL NEBULA",
    offsetY: 30,
  },
  {
    url: "https://cdn.cosmos.so/f733585a-081e-48e7-a30e-e636446f2168?format=jpeg",
    title: "STELLAR DRIFT",
    offsetY: 20,
  },
  {
    url: "https://cdn.cosmos.so/47caf8a0-f456-41c5-98ea-6d0476315731?format=jpeg",
    title: "ORBITAL PATH",
    offsetY: -20,
  },
  {
    url: "https://cdn.cosmos.so/f99f8445-6a19-4a9a-9de3-ac382acc1a3f?format=jpeg",
    title: "CELESTIAL FLOW",
    offsetY: -15,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MomentumDistortionSlider({
  // Scene
  bgColor = "#000",
  fogDensity = 0.08,
  slideWidth = 3.2,
  slideHeight = 1.8,
  slideGap = 0.25,
  slideCount = 10,
  cameraZ = 5,
  cameraFov = 50,
  // Images & titles
  images = DEFAULT_IMAGES,
  // Controls
  wheelSensitivity = 0.01,
  touchSensitivity = 0.01,
  momentumMultiplier = 2.5,
  smoothing = 0.1,
  slideLerp = 0.075,
  // Distortion
  maxDistortion = 4.0,
  distortionSensitivity = 0.25,
  distortionDecay = 0.93,
  distortionSmoothing = 0.075,
  distortionIntensity = 0.3,
  horizontalDistortionDamping = 0.3,
  rotationFactor = 0.2,
  animationSpeed = 0.5,
  momentumDistortionBoost = 0.3,
  directionInfluence = 0.4,
  waveAmplitudeBoost = 0.2,
  directionChangeThreshold = 0.02,
  directionSmoothing = 0.03,
  // Title overlay
  textFadeStart = 1.6,
  textFadeEnd = 2.1,
  textMaxBlur = 5,
  accentColor = "#ffe600",
  // Particles
  particleCount = 80,
  // Preloader
  preloaderBg = "#000",
  preloaderRings = 5,
  preloaderDuration = 5000,
}) {
  // ── Phase: "loading" until preloader finishes, then "ready" ───────────────
  const [phase, setPhase] = useState("loading");

  // ── Refs ───────────────────────────────────────────────────────────────────
  const canvasRef = useRef(null);
  const titlesRef = useRef(null); // titles overlay div
  const particlesRef = useRef(null); // particles div
  const preloaderRef = useRef(null); // preloader div
  const dotContainerRef = useRef(null); // dot ring container
  const progressBarRef = useRef(null); // yellow progress bar

  // All Three.js mutable state lives here — never touches React renders
  const threeRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    slides: [],
    titleElements: [],
    currentPosition: 0,
    targetPosition: 0,
    isScrolling: false,
    autoScrollSpeed: 0,
    lastTime: 0,
    globalTime: 0,
    currentDistortionFactor: 0,
    targetDistortionFactor: 0,
    peakVelocity: 0,
    velocityHistory: [0, 0, 0, 0, 0],
    movementDirection: { x: 0, y: 0 },
    lastMovementInput: 0,
    accumulatedMovement: 0,
    isDragging: false,
    dragStartX: 0,
    dragLastX: 0,
    touchStartX: 0,
    touchLastX: 0,
    pointLight: null,
    rafId: null,
    scrollTimeout: null,
    THREE: null,
  });

  // ── Preloader ──────────────────────────────────────────────────────────────
  const runPreloader = () => {
    const container = dotContainerRef.current;
    const progressBar = progressBarRef.current;
    if (!container || !progressBar) return;

    const allDots = [];

    // Centre dot
    const centerDot = document.createElement("div");
    Object.assign(centerDot.style, {
      position: "absolute",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      left: "calc(50% - 4px)",
      top: "calc(50% - 4px)",
      backgroundColor: accentColor,
      animation: "cc-pulse 1.5s infinite ease-in-out",
      opacity: "1",
    });
    container.appendChild(centerDot);

    // Concentric rings
    for (let r = 0; r < preloaderRings; r++) {
      const radius = 15 + r * 20;
      const numDots = 6 + r * 6;
      const yellowAmount = Math.max(0, 1 - r / (preloaderRings - 1));
      const g = Math.floor(230 + 25 * (1 - yellowAmount));
      const b = Math.floor(0 + 255 * (1 - yellowAmount));
      const color = `rgb(255,${g},${b})`;

      for (let i = 0; i < numDots; i++) {
        const angle = (i / numDots) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = 3 + r * 0.8;
        const dot = document.createElement("div");
        Object.assign(dot.style, {
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          left: `calc(50% + ${x}px - ${size / 2}px)`,
          top: `calc(50% + ${y}px - ${size / 2}px)`,
          backgroundColor: color,
          opacity: "0",
        });
        container.appendChild(dot);
        allDots.push({ element: dot, ring: r, index: i, totalInRing: numDots });
      }
    }

    // Progress bar fill
    let startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / preloaderDuration) * 100);
      progressBar.style.width = `${pct}%`;
      if (pct < 100) setTimeout(updateProgress, 50);
    };
    updateProgress();

    // Phase 1: dots appear outward
    const delayInc = 20;
    setTimeout(() => {
      const sorted = [...allDots].sort((a, b) =>
        a.ring !== b.ring ? a.ring - b.ring : a.index - b.index,
      );
      let delay = 0;
      sorted.forEach((dot) => {
        setTimeout(() => {
          dot.element.style.animation = "cc-fadeIn 0.4s forwards ease-out";
        }, delay);
        delay += delayInc;
      });

      // Phase 2: dots disappear inward
      setTimeout(() => {
        centerDot.style.animation = "cc-fadeOut 0.4s forwards ease-in";
        const reversed = [...allDots].sort((a, b) =>
          a.ring !== b.ring ? b.ring - a.ring : a.index - b.index,
        );
        let revDelay = 200;
        reversed.forEach((dot) => {
          setTimeout(() => {
            dot.element.style.animation = "cc-fadeOut 0.4s forwards ease-in";
          }, revDelay);
          revDelay += delayInc;
        });

        // Phase 3: reveal scene
        setTimeout(() => {
          setPhase("ready");
          // Fade out preloader
          const pre = preloaderRef.current;
          if (pre) {
            pre.style.opacity = "0";
            pre.style.transition = "opacity 0.8s cubic-bezier(0.65,0,0.35,1)";
            setTimeout(() => {
              if (pre) pre.style.display = "none";
            }, 800);
          }
        }, revDelay + 250);
      }, delay + 750);
    }, 750);
  };

  // ── Three.js scene setup ───────────────────────────────────────────────────
  const initThree = (THREE) => {
    const s = threeRef.current;
    s.THREE = THREE;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imagesCount = images.length;
    const totalWidth = slideCount * (slideWidth + slideGap);
    const slideUnit = slideWidth + slideGap;

    // Renderer
    s.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true,
    });
    s.renderer.setSize(window.innerWidth, window.innerHeight);
    s.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene
    s.scene = new THREE.Scene();
    s.scene.background = new THREE.Color(bgColor);
    s.scene.fog = new THREE.FogExp2(bgColor, fogDensity);

    // Camera
    s.camera = new THREE.PerspectiveCamera(
      cameraFov,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    s.camera.position.z = cameraZ;

    // Lights
    s.scene.add(new THREE.AmbientLight(0x404040, 1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 1, 1);
    s.scene.add(dirLight);
    s.pointLight = new THREE.PointLight(0xffffff, 2, 10);
    s.pointLight.position.set(0, 0, 2);
    s.scene.add(s.pointLight);

    // ── Build slides ──────────────────────────────────────────────────────────
    const createSlide = (index) => {
      const geometry = new THREE.PlaneGeometry(slideWidth, slideHeight, 64, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        metalness: 0.2,
        roughness: 0.8,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = index * (slideWidth + slideGap);
      mesh.userData = {
        originalVertices: [...geometry.attributes.position.array],
        index,
        time: Math.random() * 1000,
        waveSpeed: 0.5 + Math.random() * 0.5,
        waveAmplitude: 1.0,
        wavePhase: Math.random() * Math.PI * 2,
        targetX: 0,
        currentX: 0,
        currentRotFactor: 0,
      };

      const imageIndex = index % imagesCount;
      const imagePath = images[imageIndex].url;
      new THREE.TextureLoader().load(
        imagePath,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.needsUpdate = true;
          const imgAspect = texture.image.width / texture.image.height;
          const slideAspect = slideWidth / slideHeight;
          if (imgAspect > slideAspect) mesh.scale.y = slideAspect / imgAspect;
          else mesh.scale.x = imgAspect / slideAspect;
        },
        undefined,
        (err) => console.warn(`Couldn't load image ${imagePath}`, err),
      );

      s.scene.add(mesh);
      s.slides.push(mesh);
    };

    for (let i = 0; i < slideCount; i++) createSlide(i);

    s.slides.forEach((slide) => {
      slide.position.x -= totalWidth / 2;
      slide.userData.targetX = slide.position.x;
      slide.userData.currentX = slide.position.x;
      slide.rotation.x = (Math.random() - 0.5) * 0.1;
      slide.rotation.y = (Math.random() - 0.5) * 0.1;
    });

    // ── Build title overlays ──────────────────────────────────────────────────
    const titlesContainer = titlesRef.current;
    if (titlesContainer) {
      for (let i = 0; i < slideCount; i++) {
        const imageIndex = i % imagesCount;
        const info = images[imageIndex];
        const el = document.createElement("div");
        el.style.cssText =
          "position:absolute;color:white;pointer-events:none;transition:opacity 0.3s ease,filter 0.3s ease;opacity:0;filter:blur(0px);";

        const h2 = document.createElement("h2");
        h2.style.cssText =
          "font-family:'PP Neue Montreal',sans-serif;text-transform:uppercase;font-size:6vw;line-height:0.9;font-weight:400;letter-spacing:-0.03em;margin:0;white-space:nowrap;";
        h2.textContent = info.title;

        const p = document.createElement("p");
        p.style.cssText = `font-family:'TheGoodMonolith',monospace;font-size:0.8vw;margin:0;padding-top:10px;display:flex;align-items:center;text-transform:uppercase;letter-spacing:0.05em;`;
        // Accent line before number — injected as a pseudo via a span since we can't use ::before in inline styles
        const line = document.createElement("span");
        line.style.cssText = `display:inline-block;width:40px;height:3px;background-color:${accentColor};margin-right:10px;flex-shrink:0;`;
        p.appendChild(line);
        p.appendChild(document.createTextNode(`0${i + 1}`));

        el.appendChild(h2);
        el.appendChild(p);
        titlesContainer.appendChild(el);
        s.titleElements.push({
          element: el,
          offset: info.offsetY ?? 0,
          index: i,
        });
      }
    }

    // ── updateTitlePositions ──────────────────────────────────────────────────
    const updateTitlePositions = () => {
      const { THREE: T, camera: cam, slides: sls, titleElements: tels } = s;
      if (!T || !cam) return;
      const vec = new T.Vector3();
      tels.forEach(({ element, offset, index }) => {
        const slide = sls[index];
        if (!slide) return;
        vec.set(slide.position.x, slide.position.y, slide.position.z);
        vec.project(cam);
        const sx = (vec.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-vec.y * 0.5 + 0.5) * window.innerHeight;
        element.style.left = `${sx}px`;
        element.style.top = `${sy + offset}px`;
        const rect = element.getBoundingClientRect();
        element.style.left = `${sx - rect.width / 2}px`;
        const dist = Math.abs(slide.position.x);
        const opacity =
          dist < textFadeStart
            ? 1
            : dist > textFadeEnd
              ? 0
              : 1 - (dist - textFadeStart) / (textFadeEnd - textFadeStart);
        element.style.opacity = opacity.toFixed(2);
        element.style.filter = `blur(${((1 - opacity) * textMaxBlur).toFixed(1)}px)`;
      });
    };
    s.updateTitlePositions = updateTitlePositions;

    // ── updateDistortion ──────────────────────────────────────────────────────
    const updateDistortion = (mesh, distortionFactor, deltaTime) => {
      mesh.userData.time +=
        deltaTime * animationSpeed * mesh.userData.waveSpeed;
      const time = mesh.userData.time;
      const posAttr = mesh.geometry.attributes.position;
      const orig = mesh.userData.originalVertices;

      const momentumBoost = Math.min(
        1.0,
        s.peakVelocity * momentumDistortionBoost,
      );
      const targetWA = 1.0 + momentumBoost * waveAmplitudeBoost * 3.0;
      mesh.userData.waveAmplitude =
        (mesh.userData.waveAmplitude || 1.0) +
        (targetWA - (mesh.userData.waveAmplitude || 1.0)) * 0.05;

      const effDist = distortionFactor * distortionIntensity;
      const gcX = Math.sin(time * 0.1) * 0.5;
      const gcY = Math.cos(time * 0.15) * 0.3;
      const gravStr = Math.min(2.0, Math.max(0, effDist)) * 2.0;
      const dx = mesh.userData.targetX - mesh.userData.currentX;
      const dxAbs = Math.abs(dx);

      if (dxAbs > directionChangeThreshold) {
        const newDir = dx > 0 ? -1 : 1;
        const blend = Math.min(1.0, directionSmoothing * (1 + dxAbs * 5));
        s.movementDirection.x += (newDir - s.movementDirection.x) * blend;
      }
      const velScale = Math.min(1.0, s.peakVelocity * 2);
      const effDirInfl = directionInfluence * velScale;

      for (let i = 0; i < posAttr.count; i++) {
        const x = orig[i * 3],
          y = orig[i * 3 + 1],
          z = orig[i * 3 + 2];
        const distX = x - gcX,
          distY = y - gcY;
        const dist = Math.sqrt(distX * distX + distY * distY + 0.0001);
        const grav = Math.min(1, 1 / (1 + dist * 8));
        const dirWX =
          s.movementDirection.x * Math.sin(dist * 5 + time) * effDirInfl;
        const dirWY =
          s.movementDirection.y * Math.cos(dist * 5 + time) * effDirInfl * 0.3;
        const pullX = distX * grav * gravStr * 0.5;
        const pullY = distY * grav * gravStr * 0.5;
        const strF = effDist * 0.3 * velScale;
        const strX =
          s.movementDirection.x * strF * (1 - Math.min(1, Math.abs(y)));
        const strY =
          s.movementDirection.y * strF * (1 - Math.min(1, Math.abs(x)));
        const waveScale = mesh.userData.waveAmplitude;
        const pulse =
          Math.sin(time + dist * 3 + mesh.userData.wavePhase) *
          0.05 *
          effDist *
          waveScale;
        const twistAmt = effDist * 0.1 * grav * velScale;
        const twistX = -y * twistAmt,
          twistY = x * twistAmt;
        const hDamp = horizontalDistortionDamping * (1 - velScale * 0.3);
        const newX =
          x +
          Math.min(1, Math.max(-1, (pullX + strX + twistX + dirWX) * hDamp));
        const newY =
          y + Math.min(1, Math.max(-1, pullY + strY + twistY + dirWY));
        const newZ = Math.min(
          2,
          Math.max(-2, (grav * gravStr + pulse) * (1 + Math.min(5, dist))),
        );
        posAttr.setXYZ(i, newX, newY, newZ);
      }
      posAttr.needsUpdate = true;
      mesh.geometry.computeVertexNormals();

      const targetRF =
        Math.min(0.2, effDist) * rotationFactor * (1 + momentumBoost * 0.5);
      mesh.userData.currentRotFactor +=
        (targetRF - mesh.userData.currentRotFactor) * 0.1;
      const rf = mesh.userData.currentRotFactor;
      mesh.rotation.x = Math.sin(time * 0.2) * 0.1 * rf;
      mesh.rotation.y = Math.sin(time * 0.3 + 0.5) * 0.1 * rf;
      mesh.rotation.z = rf * 0.05 * Math.sin(time * 0.1);
    };
    s.updateDistortion = updateDistortion;

    // ── Render loop ───────────────────────────────────────────────────────────
    const animate = (time) => {
      s.rafId = requestAnimationFrame(animate);
      const deltaTime = s.lastTime ? (time - s.lastTime) / 1000 : 0.016;
      s.lastTime = time;
      s.globalTime += deltaTime;
      s.pointLight.color.set(0xffffff);

      const prevPos = s.currentPosition;
      if (s.isScrolling) {
        s.targetPosition += s.autoScrollSpeed;
        const speedDecay = 0.97 - Math.abs(s.autoScrollSpeed) * 0.5;
        s.autoScrollSpeed *= Math.max(0.92, speedDecay);
        if (Math.abs(s.autoScrollSpeed) < 0.001) s.autoScrollSpeed = 0;
      }

      const posDelta = Math.abs(s.targetPosition - s.currentPosition);
      const adaptSmooth = smoothing * (posDelta < 0.1 ? 0.5 : 1.0);
      s.currentPosition += (s.targetPosition - s.currentPosition) * adaptSmooth;

      const curVel = Math.abs(s.currentPosition - prevPos) / deltaTime;
      const sigVel = curVel > 0.01 ? curVel : 0;
      s.velocityHistory.push(sigVel);
      s.velocityHistory.shift();
      const weights = [0.1, 0.15, 0.2, 0.25, 0.3];
      let wSum = 0,
        wVel = 0;
      s.velocityHistory.forEach((v, i) => {
        wVel += v * weights[i];
        wSum += weights[i];
      });
      const avgVel = wSum > 0 ? wVel / wSum : 0;

      if (avgVel > s.peakVelocity) {
        s.peakVelocity += (avgVel - s.peakVelocity) * 0.3;
        s.targetDistortionFactor = Math.min(
          maxDistortion,
          s.targetDistortionFactor + Math.min(0.1, avgVel * 0.03),
        );
      }
      const velRatio = avgVel / (s.peakVelocity + 0.001);
      const isDecel = velRatio < 0.7 && s.peakVelocity > 0.3;
      s.peakVelocity *= 0.98;
      const moveDist = Math.min(1.0, curVel * curVel * 2);
      if (curVel > 0.03) {
        s.targetDistortionFactor +=
          (moveDist - s.targetDistortionFactor) * Math.min(0.2, curVel);
      }
      if (isDecel) s.targetDistortionFactor *= distortionDecay * 1.01;
      else if (avgVel < 0.1) s.targetDistortionFactor *= distortionDecay * 0.9;

      const distDelta = Math.abs(
        s.targetDistortionFactor - s.currentDistortionFactor,
      );
      const adaptDistSmooth =
        distortionSmoothing * (distDelta < 0.05 ? 0.5 : 1.0);
      s.currentDistortionFactor +=
        (s.targetDistortionFactor - s.currentDistortionFactor) *
        adaptDistSmooth;

      // Camera: drift disabled (amplitude=0), just look at origin
      s.camera.lookAt(0, 0, 0);

      s.slides.forEach((slide, i) => {
        let baseX = i * slideUnit - s.currentPosition;
        baseX = ((baseX % totalWidth) + totalWidth) % totalWidth;
        if (baseX > totalWidth / 2) baseX -= totalWidth;
        if (Math.abs(baseX - slide.userData.targetX) > slideWidth * 2)
          slide.userData.currentX = baseX;
        slide.userData.targetX = baseX;
        slide.userData.currentX +=
          (slide.userData.targetX - slide.userData.currentX) * slideLerp;
        if (
          Math.abs(slide.userData.currentX) <
          totalWidth / 2 + slideWidth * 1.5
        ) {
          slide.position.x = slide.userData.currentX;
          slide.position.z = Math.abs(slide.position.x) * -0.05;
          s.updateDistortion(slide, s.currentDistortionFactor, deltaTime);
        }
      });

      s.updateTitlePositions();
      s.renderer.render(s.scene, s.camera);
    };
    animate(0);

    // ── Event handlers ────────────────────────────────────────────────────────
    const onMouseMove = (e) => {
      // Light follows mouse
      const mx = (e.clientX / window.innerWidth) * 2 - 1;
      const my = -(e.clientY / window.innerHeight) * 2 + 1;
      s.pointLight.position.x = mx * 3;
      s.pointLight.position.y = my * 2;

      if (!s.isDragging) return;
      const deltaX = e.clientX - s.dragLastX;
      s.lastDeltaX = deltaX;
      s.accumulatedMovement += deltaX;
      const now = performance.now();
      if (
        Math.abs(s.accumulatedMovement) > 1 ||
        now - s.lastMovementInput > 50
      ) {
        s.dragLastX = e.clientX;
        s.targetDistortionFactor = Math.min(
          1.0,
          s.targetDistortionFactor + Math.abs(s.accumulatedMovement) * 0.02,
        );
        s.targetPosition -= s.accumulatedMovement * touchSensitivity;
        s.accumulatedMovement = 0;
        s.lastMovementInput = now;
      }
    };
    const onMouseDown = (e) => {
      s.isDragging = true;
      s.dragStartX = e.clientX;
      s.dragLastX = e.clientX;
      if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    };
    const onMouseUp = () => {
      if (!s.isDragging) return;
      s.isDragging = false;
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      const velocity = (s.dragLastX - s.dragStartX) * 0.005;
      if (Math.abs(velocity) > 0.5) {
        s.autoScrollSpeed = -velocity * momentumMultiplier * 0.05;
        s.targetDistortionFactor = Math.min(
          1.0,
          Math.abs(velocity) * 3 * distortionSensitivity,
        );
        s.isScrolling = true;
        setTimeout(() => {
          s.isScrolling = false;
        }, 800);
      }
    };
    const onMouseLeave = () => {
      if (s.isDragging) {
        s.isDragging = false;
        if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      }
    };
    const onWheel = (e) => {
      e.preventDefault();
      s.targetDistortionFactor = Math.min(
        1.0,
        s.targetDistortionFactor + Math.abs(e.deltaY) * 0.001,
      );
      s.targetPosition -= e.deltaY * wheelSensitivity;
      s.isScrolling = true;
      s.autoScrollSpeed =
        Math.min(Math.abs(e.deltaY) * 0.0005, 0.05) * Math.sign(e.deltaY);
      s.movementDirection.x = Math.sign(e.deltaY) * -1;
      clearTimeout(s.scrollTimeout);
      s.scrollTimeout = setTimeout(() => {
        s.isScrolling = false;
      }, 150);
    };
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        s.targetPosition += slideUnit;
        s.targetDistortionFactor = Math.min(
          1.0,
          s.targetDistortionFactor + 0.4,
        );
        s.movementDirection.x = 1;
      }
      if (e.key === "ArrowRight") {
        s.targetPosition -= slideUnit;
        s.targetDistortionFactor = Math.min(
          1.0,
          s.targetDistortionFactor + 0.4,
        );
        s.movementDirection.x = -1;
      }
    };
    const onTouchStart = (e) => {
      s.touchStartX = e.touches[0].clientX;
      s.touchLastX = e.touches[0].clientX;
      s.isScrolling = false;
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      const tx = e.touches[0].clientX;
      s.accumulatedMovement += tx - s.touchLastX;
      const now = performance.now();
      if (
        Math.abs(s.accumulatedMovement) > 1 ||
        now - s.lastMovementInput > 50
      ) {
        s.touchLastX = tx;
        s.targetDistortionFactor = Math.min(
          1.0,
          s.targetDistortionFactor + Math.abs(s.accumulatedMovement) * 0.02,
        );
        s.targetPosition -= s.accumulatedMovement * touchSensitivity;
        s.accumulatedMovement = 0;
        s.lastMovementInput = now;
        s.isScrolling = true;
      }
    };
    const onTouchEnd = () => {
      const velocity = (s.touchLastX - s.touchStartX) * 0.005;
      if (Math.abs(velocity) > 0.5) {
        s.autoScrollSpeed = -velocity * momentumMultiplier * 0.05;
        s.targetDistortionFactor = Math.min(
          1.0,
          Math.abs(velocity) * 3 * distortionSensitivity,
        );
        s.movementDirection.x = Math.sign(velocity) * -1;
        s.isScrolling = true;
        setTimeout(() => {
          s.isScrolling = false;
        }, 800);
      }
    };
    const onResize = () => {
      s.camera.aspect = window.innerWidth / window.innerHeight;
      s.camera.updateProjectionMatrix();
      s.renderer.setSize(window.innerWidth, window.innerHeight);
      s.updateTitlePositions();
    };

    // Attach — canvas events for drag, window for the rest
    const cv = canvasRef.current;
    cv.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseleave", onMouseLeave);
    cv.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    // Return teardown
    return () => {
      cancelAnimationFrame(s.rafId);
      cv.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseleave", onMouseLeave);
      cv.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      s.renderer?.dispose();
    };
  };

  // ── Seed particles ─────────────────────────────────────────────────────────
  const seedParticles = () => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement("div");
      const size = Math.random() * 5 + 2;
      Object.assign(el.style, {
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: `${Math.random() * 0.5 + 0.1}`,
      });
      container.appendChild(el);
    }
  };

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    seedParticles();
    runPreloader();

    let teardown = () => {};

    // Use dynamic ESM import — cdnjs dropped the UMD build after r128.
    // jsdelivr still ships the full ESM bundle; we import it as a module and
    // pass the namespace directly to initThree so nothing touches window.THREE.
    import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js")
      .then((THREE) => {
        teardown = initThree(THREE) ?? (() => {});
      })
      .catch((e) =>
        console.error("[CosmicCarousel] Three.js load failed:", e.message),
      );

    return () => {
      teardown();
      // Clear titles and particles DOM nodes
      if (titlesRef.current) titlesRef.current.innerHTML = "";
      if (particlesRef.current) particlesRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Scoped keyframes for preloader dot animations ── */}
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/thegoodmonolith');
        @import url('https://fonts.cdnfonts.com/css/pp-neue-montreal');

        @keyframes cc-pulse {
          0%   { transform: scale(0.8); }
          50%  { transform: scale(1.2); }
          100% { transform: scale(0.8); }
        }
        @keyframes cc-fadeIn {
          0%   { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cc-fadeOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0); }
        }
        @keyframes cc-noise {
          0%   { transform: translate(0,0); }
          10%  { transform: translate(-2%,-3%); }
          20%  { transform: translate(-4%,2%); }
          30%  { transform: translate(2%,-4%); }
          40%  { transform: translate(-2%,5%); }
          50%  { transform: translate(-4%,2%); }
          60%  { transform: translate(3%,0); }
          70%  { transform: translate(0,3%); }
          80%  { transform: translate(-3%,0); }
          90%  { transform: translate(2%,2%); }
          100% { transform: translate(1%,0); }
        }

        /* Noise overlay */
        .cc-root::before {
          content: "";
          position: fixed; top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: transparent url("http://assets.iceable.com/img/noise-transparent.png") repeat 0 0;
          background-size: 300px 300px;
          animation: cc-noise 0.3s steps(5) infinite;
          opacity: 0.9;
          will-change: transform;
          z-index: 100;
          pointer-events: none;
        }
        /* Scratch overlay */
        .cc-root::after {
          content: "";
          position: fixed; inset: 0;
          background-image: url("https://img.freepik.com/premium-photo/white-dust-scratches-black-background_279525-2.jpg?w=640");
          background-repeat: repeat;
          opacity: 0.1;
          mix-blend-mode: screen;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      {/* ── Root: full-viewport, overflow hidden ── */}
      <div
        className="cc-root relative w-screen h-screen overflow-hidden"
        style={{
          backgroundColor: bgColor,
          fontFamily: "'TheGoodMonolith', monospace",
        }}
      >
        {/* Preloader */}
        <div
          ref={preloaderRef}
          className="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
          style={{ backgroundColor: preloaderBg }}
        >
          {/* Dot ring container */}
          <div
            ref={dotContainerRef}
            className="relative mb-8"
            style={{ width: 200, height: 200 }}
          />

          {/* Progress bar + label */}
          <div className="relative mt-8 overflow-hidden">
            <div
              ref={progressBarRef}
              className="absolute top-0 left-0 h-full w-0"
              style={{ backgroundColor: accentColor }}
            />
            <p
              className="relative z-[2] text-white text-[12px] tracking-[3px] uppercase"
              style={{
                mixBlendMode: "difference",
                fontFamily: "'TheGoodMonolith', monospace",
              }}
            >
              INITIALIZING
            </p>
          </div>
        </div>

        {/* WebGL canvas */}
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-screen h-screen cursor-grab z-0"
          style={{
            opacity: phase === "ready" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />

        {/* Ambient particles */}
        <div
          ref={particlesRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-0"
          style={{
            opacity: phase === "ready" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />

        {/* Slide title overlays */}
        <div
          ref={titlesRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
          style={{
            opacity: phase === "ready" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />

        {/* Footer hint */}
        <footer
          className="fixed bottom-0 right-0 w-screen px-8 py-8 flex justify-end items-center z-[2]"
          style={{
            mixBlendMode: "difference",
            opacity: phase === "ready" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            className="uppercase text-[13px] tracking-[0.05em] text-white"
            style={{
              WebkitFontSmoothing: "antialiased",
              fontFamily: "'TheGoodMonolith', monospace",
            }}
          >
            DRAG TO EXPLORE
          </p>
        </footer>
      </div>
    </>
  );
}
