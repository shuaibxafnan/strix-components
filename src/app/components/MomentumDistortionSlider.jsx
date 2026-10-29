"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&w=1600&q=80",
    title: "Cosmic Voyage",
    offsetY: -25,
  },
  {
    url: "https://images.unsplash.com/photo-1608178398319-48f814d0750c?auto=format&fit=crop&w=1600&q=80",
    title: "Astral Nebula",
    offsetY: 30,
  },
  {
    url: "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?auto=format&fit=crop&w=1600&q=80",
    title: "Stellar Drift",
    offsetY: 20,
  },
  {
    url: "https://images.unsplash.com/photo-1717705422478-0b42e89e06b7?auto=format&fit=crop&w=1600&q=80",
    title: "Orbital Path",
    offsetY: -20,
  },
  {
    url: "https://images.unsplash.com/photo-1706800696671-570820e7ff39?auto=format&fit=crop&w=1600&q=80",
    title: "Celestial Flow",
    offsetY: -15,
  },
];

const DOT_STEP_MS = 20;

export default function MomentumDistortionSlider({
  bgColor = "#000000",
  fogDensity = 0.08,
  slideWidth = 3.2,
  slideHeight = 1.8,
  slideGap = 0.25,
  slideCount = 10,
  cameraZ = 5,
  cameraFov = 50,
  images = DEFAULT_IMAGES,
  wheelSensitivity = 0.01,
  touchSensitivity = 0.01,
  momentumMultiplier = 2.5,
  smoothing = 0.1,
  slideLerp = 0.075,
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
  textFadeStart = 1.6,
  textFadeEnd = 2.1,
  textMaxBlur = 5,
  accentColor = "#ffe600",
  particleCount = 80,
  preloaderBg = "#000000",
  preloaderRings = 5,
  preloaderDuration = 5000,
  preloaderLabel = "Initializing",
  hintText = "Drag to explore",
  titleFont = "ui-sans-serif, system-ui, sans-serif",
  monoFont = "ui-monospace, SFMono-Regular, Menlo, monospace",
  className = "",
}) {
  const canvasRef = useRef(null);
  const titleRefs = useRef([]);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [dotStage, setDotStage] = useState("idle");
  const [barFull, setBarFull] = useState(false);
  const [particles, setParticles] = useState([]);

  const dots = useMemo(() => {
    const list = [];
    for (let r = 0; r < preloaderRings; r++) {
      const radius = 15 + r * 20;
      const total = 6 + r * 6;
      const yellow = Math.max(0, 1 - r / Math.max(1, preloaderRings - 1));
      const g = Math.floor(230 + 25 * (1 - yellow));
      const b = Math.floor(255 * (1 - yellow));
      const size = 3 + r * 0.8;
      for (let i = 0; i < total; i++) {
        const angle = (i / total) * Math.PI * 2;
        list.push({
          ring: r,
          index: i,
          size,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          color: `rgb(255,${g},${b})`,
        });
      }
    }
    const reversed = [...list].sort((a, b) =>
      a.ring !== b.ring ? b.ring - a.ring : a.index - b.index,
    );
    return list.map((dot, order) => ({
      ...dot,
      inDelay: order * DOT_STEP_MS,
      outDelay: 200 + reversed.indexOf(dot) * DOT_STEP_MS,
    }));
  }, [preloaderRings]);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: particleCount }, () => ({
        size: Math.random() * 5 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.1,
      })),
    );
  }, [particleCount]);

  useEffect(() => {
    const n = dots.length;
    const tOut = 750 + n * DOT_STEP_MS + 750;
    const tReady = tOut + 200 + n * DOT_STEP_MS + 250;
    const timers = [
      setTimeout(() => setBarFull(true), 50),
      setTimeout(() => setDotStage("in"), 750),
      setTimeout(() => setDotStage("out"), tOut),
      setTimeout(() => setReady(true), tReady),
      setTimeout(() => setShowPreloader(false), tReady + 800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [dots.length]);

  useEffect(() => {
    let disposed = false;
    let teardown = () => { };

    const initScene = (THREE) => {
      const canvas = canvasRef.current;
      if (!canvas) return () => { };

      const imagesCount = images.length;
      const slideUnit = slideWidth + slideGap;
      const totalWidth = slideCount * slideUnit;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(bgColor);
      scene.fog = new THREE.FogExp2(bgColor, fogDensity);

      const camera = new THREE.PerspectiveCamera(
        cameraFov,
        window.innerWidth / window.innerHeight,
        0.1,
        100,
      );
      camera.position.z = cameraZ;

      scene.add(new THREE.AmbientLight(0x404040, 1));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(0, 1, 1);
      scene.add(dirLight);
      const pointLight = new THREE.PointLight(0xffffff, 2, 10);
      pointLight.position.set(0, 0, 2);
      scene.add(pointLight);

      const slides = [];
      const textures = [];
      const loader = new THREE.TextureLoader();

      for (let index = 0; index < slideCount; index++) {
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
        mesh.position.x = index * slideUnit - totalWidth / 2;
        mesh.rotation.x = (Math.random() - 0.5) * 0.1;
        mesh.rotation.y = (Math.random() - 0.5) * 0.1;
        mesh.userData = {
          originalVertices: [...geometry.attributes.position.array],
          time: Math.random() * 1000,
          waveSpeed: 0.5 + Math.random() * 0.5,
          waveAmplitude: 1.0,
          wavePhase: Math.random() * Math.PI * 2,
          targetX: mesh.position.x,
          currentX: mesh.position.x,
          currentRotFactor: 0,
        };

        loader.load(
          images[index % imagesCount].url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            textures.push(texture);
            material.map = texture;
            material.needsUpdate = true;
            const imgAspect = texture.image.width / texture.image.height;
            const slideAspect = slideWidth / slideHeight;
            if (imgAspect > slideAspect) mesh.scale.y = slideAspect / imgAspect;
            else mesh.scale.x = imgAspect / slideAspect;
          },
          undefined,
          () => { },
        );

        scene.add(mesh);
        slides.push(mesh);
      }

      const state = {
        currentPosition: 0,
        targetPosition: 0,
        isScrolling: false,
        autoScrollSpeed: 0,
        lastTime: 0,
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
      };
      const timeouts = new Set();
      const later = (fn, ms) => {
        const id = setTimeout(() => {
          timeouts.delete(id);
          fn();
        }, ms);
        timeouts.add(id);
        return id;
      };
      let scrollTimeout = null;
      let rafId = 0;

      const vec = new THREE.Vector3();
      const updateTitles = () => {
        titleRefs.current.forEach((element, index) => {
          const slide = slides[index];
          if (!element || !slide) return;
          vec.set(slide.position.x, slide.position.y, slide.position.z);
          vec.project(camera);
          const sx = (vec.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-vec.y * 0.5 + 0.5) * window.innerHeight;
          const offset = images[index % imagesCount].offsetY ?? 0;
          element.style.left = `${sx}px`;
          element.style.top = `${sy + offset}px`;
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

      const updateDistortion = (mesh, distortionFactor, deltaTime) => {
        mesh.userData.time +=
          deltaTime * animationSpeed * mesh.userData.waveSpeed;
        const time = mesh.userData.time;
        const posAttr = mesh.geometry.attributes.position;
        const orig = mesh.userData.originalVertices;

        const momentumBoost = Math.min(
          1.0,
          state.peakVelocity * momentumDistortionBoost,
        );
        const targetWA = 1.0 + momentumBoost * waveAmplitudeBoost * 3.0;
        mesh.userData.waveAmplitude +=
          (targetWA - mesh.userData.waveAmplitude) * 0.05;

        const effDist = distortionFactor * distortionIntensity;
        const gcX = Math.sin(time * 0.1) * 0.5;
        const gcY = Math.cos(time * 0.15) * 0.3;
        const gravStr = Math.min(2.0, Math.max(0, effDist)) * 2.0;
        const dx = mesh.userData.targetX - mesh.userData.currentX;
        const dxAbs = Math.abs(dx);

        if (dxAbs > directionChangeThreshold) {
          const newDir = dx > 0 ? -1 : 1;
          const blend = Math.min(1.0, directionSmoothing * (1 + dxAbs * 5));
          state.movementDirection.x +=
            (newDir - state.movementDirection.x) * blend;
        }
        const velScale = Math.min(1.0, state.peakVelocity * 2);
        const effDirInfl = directionInfluence * velScale;

        for (let i = 0; i < posAttr.count; i++) {
          const x = orig[i * 3];
          const y = orig[i * 3 + 1];
          const distX = x - gcX;
          const distY = y - gcY;
          const dist = Math.sqrt(distX * distX + distY * distY + 0.0001);
          const grav = Math.min(1, 1 / (1 + dist * 8));
          const dirWX =
            state.movementDirection.x * Math.sin(dist * 5 + time) * effDirInfl;
          const dirWY =
            state.movementDirection.y *
            Math.cos(dist * 5 + time) *
            effDirInfl *
            0.3;
          const pullX = distX * grav * gravStr * 0.5;
          const pullY = distY * grav * gravStr * 0.5;
          const strF = effDist * 0.3 * velScale;
          const strX =
            state.movementDirection.x * strF * (1 - Math.min(1, Math.abs(y)));
          const strY =
            state.movementDirection.y * strF * (1 - Math.min(1, Math.abs(x)));
          const pulse =
            Math.sin(time + dist * 3 + mesh.userData.wavePhase) *
            0.05 *
            effDist *
            mesh.userData.waveAmplitude;
          const twistAmt = effDist * 0.1 * grav * velScale;
          const twistX = -y * twistAmt;
          const twistY = x * twistAmt;
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

      const animate = (time) => {
        rafId = requestAnimationFrame(animate);
        const deltaTime = state.lastTime ? (time - state.lastTime) / 1000 : 0.016;
        state.lastTime = time;

        const prevPos = state.currentPosition;
        if (state.isScrolling) {
          state.targetPosition += state.autoScrollSpeed;
          const speedDecay = 0.97 - Math.abs(state.autoScrollSpeed) * 0.5;
          state.autoScrollSpeed *= Math.max(0.92, speedDecay);
          if (Math.abs(state.autoScrollSpeed) < 0.001) state.autoScrollSpeed = 0;
        }

        const posDelta = Math.abs(state.targetPosition - state.currentPosition);
        const adaptSmooth = smoothing * (posDelta < 0.1 ? 0.5 : 1.0);
        state.currentPosition +=
          (state.targetPosition - state.currentPosition) * adaptSmooth;

        const curVel = Math.abs(state.currentPosition - prevPos) / deltaTime;
        state.velocityHistory.push(curVel > 0.01 ? curVel : 0);
        state.velocityHistory.shift();
        const weights = [0.1, 0.15, 0.2, 0.25, 0.3];
        let wSum = 0;
        let wVel = 0;
        state.velocityHistory.forEach((v, i) => {
          wVel += v * weights[i];
          wSum += weights[i];
        });
        const avgVel = wSum > 0 ? wVel / wSum : 0;

        if (avgVel > state.peakVelocity) {
          state.peakVelocity += (avgVel - state.peakVelocity) * 0.3;
          state.targetDistortionFactor = Math.min(
            maxDistortion,
            state.targetDistortionFactor + Math.min(0.1, avgVel * 0.03),
          );
        }
        const velRatio = avgVel / (state.peakVelocity + 0.001);
        const isDecel = velRatio < 0.7 && state.peakVelocity > 0.3;
        state.peakVelocity *= 0.98;
        const moveDist = Math.min(1.0, curVel * curVel * 2);
        if (curVel > 0.03) {
          state.targetDistortionFactor +=
            (moveDist - state.targetDistortionFactor) * Math.min(0.2, curVel);
        }
        if (isDecel) state.targetDistortionFactor *= distortionDecay * 1.01;
        else if (avgVel < 0.1)
          state.targetDistortionFactor *= distortionDecay * 0.9;

        const distDelta = Math.abs(
          state.targetDistortionFactor - state.currentDistortionFactor,
        );
        const adaptDistSmooth =
          distortionSmoothing * (distDelta < 0.05 ? 0.5 : 1.0);
        state.currentDistortionFactor +=
          (state.targetDistortionFactor - state.currentDistortionFactor) *
          adaptDistSmooth;

        camera.lookAt(0, 0, 0);

        slides.forEach((slide, i) => {
          let baseX = i * slideUnit - state.currentPosition;
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
            updateDistortion(slide, state.currentDistortionFactor, deltaTime);
          }
        });

        updateTitles();
        renderer.render(scene, camera);
      };
      animate(0);

      const applyDrag = (clientX, lastKey) => {
        state.accumulatedMovement += clientX - state[lastKey];
        const now = performance.now();
        if (
          Math.abs(state.accumulatedMovement) > 1 ||
          now - state.lastMovementInput > 50
        ) {
          state[lastKey] = clientX;
          state.targetDistortionFactor = Math.min(
            1.0,
            state.targetDistortionFactor +
            Math.abs(state.accumulatedMovement) * 0.02,
          );
          state.targetPosition -= state.accumulatedMovement * touchSensitivity;
          state.accumulatedMovement = 0;
          state.lastMovementInput = now;
          return true;
        }
        return false;
      };

      const release = (velocity) => {
        if (Math.abs(velocity) <= 0.5) return;
        state.autoScrollSpeed = -velocity * momentumMultiplier * 0.05;
        state.targetDistortionFactor = Math.min(
          1.0,
          Math.abs(velocity) * 3 * distortionSensitivity,
        );
        state.isScrolling = true;
        later(() => {
          state.isScrolling = false;
        }, 800);
      };

      const onMouseMove = (e) => {
        pointLight.position.x = ((e.clientX / window.innerWidth) * 2 - 1) * 3;
        pointLight.position.y = (-(e.clientY / window.innerHeight) * 2 + 1) * 2;
        if (state.isDragging) applyDrag(e.clientX, "dragLastX");
      };
      const onMouseDown = (e) => {
        state.isDragging = true;
        state.dragStartX = e.clientX;
        state.dragLastX = e.clientX;
      };
      const onMouseUp = () => {
        if (!state.isDragging) return;
        state.isDragging = false;
        release((state.dragLastX - state.dragStartX) * 0.005);
      };
      const onMouseLeave = () => {
        state.isDragging = false;
      };
      const onWheel = (e) => {
        e.preventDefault();
        state.targetDistortionFactor = Math.min(
          1.0,
          state.targetDistortionFactor + Math.abs(e.deltaY) * 0.001,
        );
        state.targetPosition -= e.deltaY * wheelSensitivity;
        state.isScrolling = true;
        state.autoScrollSpeed =
          Math.min(Math.abs(e.deltaY) * 0.0005, 0.05) * Math.sign(e.deltaY);
        state.movementDirection.x = Math.sign(e.deltaY) * -1;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          state.isScrolling = false;
        }, 150);
      };
      const onKeyDown = (e) => {
        const dir = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
        if (!dir) return;
        state.targetPosition += dir * slideUnit;
        state.targetDistortionFactor = Math.min(
          1.0,
          state.targetDistortionFactor + 0.4,
        );
        state.movementDirection.x = dir;
      };
      const onTouchStart = (e) => {
        state.touchStartX = e.touches[0].clientX;
        state.touchLastX = e.touches[0].clientX;
        state.isScrolling = false;
      };
      const onTouchMove = (e) => {
        e.preventDefault();
        if (applyDrag(e.touches[0].clientX, "touchLastX"))
          state.isScrolling = true;
      };
      const onTouchEnd = () => {
        const velocity = (state.touchLastX - state.touchStartX) * 0.005;
        if (Math.abs(velocity) > 0.5)
          state.movementDirection.x = Math.sign(velocity) * -1;
        release(velocity);
      };
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateTitles();
      };

      canvas.addEventListener("mousedown", onMouseDown);
      canvas.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mouseleave", onMouseLeave);
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("touchstart", onTouchStart, { passive: false });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(scrollTimeout);
        timeouts.forEach(clearTimeout);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("wheel", onWheel);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mouseleave", onMouseLeave);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("resize", onResize);
        slides.forEach((slide) => {
          slide.geometry.dispose();
          slide.material.dispose();
        });
        textures.forEach((texture) => texture.dispose());
        renderer.dispose();
      };
    };

    import("three").then((THREE) => {
      if (!disposed) teardown = initScene(THREE);
    });

    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  const fade = `transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`;

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor, fontFamily: monoFont }}
    >
      {showPreloader ? (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${ready ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          style={{ backgroundColor: preloaderBg }}
        >
          <div className="relative mb-8 w-[200px] h-[200px]">
            <div
              className={`absolute w-2 h-2 rounded-full left-[calc(50%-4px)] top-[calc(50%-4px)] transition-all duration-[400ms] ${dotStage === "out"
                  ? "opacity-0 scale-0 ease-in"
                  : "animate-pulse"
                }`}
              style={{ backgroundColor: accentColor }}
            />
            {(mounted ? dots : []).map((dot, i) => (
              <div
                key={i}
                className={`absolute rounded-full transition-[opacity,transform] duration-[400ms] ${dotStage === "in"
                    ? "opacity-100 scale-100 ease-out"
                    : "opacity-0 scale-0 ease-in"
                  }`}
                style={{
                  width: dot.size,
                  height: dot.size,
                  left: `calc(50% + ${dot.x}px - ${dot.size / 2}px)`,
                  top: `calc(50% + ${dot.y}px - ${dot.size / 2}px)`,
                  backgroundColor: dot.color,
                  transitionDelay: `${dotStage === "in"
                      ? dot.inDelay
                      : dotStage === "out"
                        ? dot.outDelay
                        : 0
                    }ms`,
                }}
              />
            ))}
          </div>

          <div className="relative mt-8 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full transition-[width] ease-linear"
              style={{
                width: barFull ? "100%" : "0%",
                transitionDuration: `${preloaderDuration}ms`,
                backgroundColor: accentColor,
              }}
            />
            <p
              className="relative z-[2] text-white text-[12px] tracking-[3px] uppercase mix-blend-difference"
              style={{ fontFamily: monoFont }}
            >
              {preloaderLabel}
            </p>
          </div>
        </div>
      ) : null}

      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-screen h-screen z-0 cursor-grab active:cursor-grabbing ${fade}`}
      />

      <div
        className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${fade}`}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      <div
        className={`fixed inset-0 w-full h-full pointer-events-none z-[1] ${fade}`}
      >
        {Array.from({ length: slideCount }, (_, i) => (
          <div
            key={i}
            ref={(el) => (titleRefs.current[i] = el)}
            className="absolute -translate-x-1/2 text-white opacity-0 pointer-events-none transition-[opacity,filter] duration-300 ease-in-out"
          >
            <h2
              className="m-0 text-[6vw] font-normal leading-[0.9] tracking-[-0.03em] uppercase whitespace-nowrap"
              style={{ fontFamily: titleFont }}
            >
              {images[i % images.length].title}
            </h2>
            <p
              className="m-0 pt-2.5 flex items-center text-[0.8vw] uppercase tracking-[0.05em]"
              style={{ fontFamily: monoFont }}
            >
              <span
                className="inline-block w-10 h-[3px] mr-2.5 shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              {String(i + 1).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      <footer
        className={`fixed bottom-0 right-0 w-screen px-8 py-8 flex justify-end items-center z-[2] mix-blend-difference ${fade}`}
      >
        <p
          className="uppercase text-[13px] tracking-[0.05em] text-white antialiased"
          style={{ fontFamily: monoFont }}
        >
          {hintText}
        </p>
      </footer>
    </div>
  );
}