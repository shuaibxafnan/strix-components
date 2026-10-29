"use client";

import { useEffect, useRef } from "react";

const FLUORESCENT = {
  cyan: 0x00ffff,
  lime: 0x00ff00,
  magenta: 0xff00ff,
  yellow: 0xffff00,
  orange: 0xff4500,
  pink: 0xff1493,
  purple: 0x9400d3,
  blue: 0x0080ff,
  green: 0x00ff80,
  red: 0xff0040,
  teal: 0x00ffaa,
  violet: 0x8a2be2,
};

export default function SpectralGhost({
  bodyColor = 0x0f2027,
  glowColor = "orange",
  eyeGlowColor = "green",
  ghostOpacity = 0.88,

  emissiveIntensity = 5.8,
  pulseSpeed = 1.6,
  pulseIntensity = 0.6,

  eyeGlowDecay = 0.95,
  eyeGlowResponse = 0.31,
  movementThreshold = 0.07,

  rimLightIntensity = 1.8,

  followSpeed = 0.075,
  wobbleAmount = 0.35,
  floatSpeed = 1.6,

  particleCount = 250,
  particleDecayRate = 0.005,
  particleColor = "orange",
  createParticlesOnlyWhenMoving = true,
  particleCreationRate = 5,

  revealRadius = 43,
  fadeStrength = 2.2,
  baseOpacity = 0.35,
  revealOpacity = 0.0,

  fireflyGlowIntensity = 2.6,
  fireflySpeed = 0.04,

  analogIntensity = 0.6,
  analogGrain = 0.4,
  analogBleeding = 1.0,
  analogVSync = 1.0,
  analogScanlines = 1.0,
  analogVignette = 1.0,
  analogJitter = 0.4,
  limboMode = false,

  quote = "Veil of Dust\nTrail of Ash\nHeart of Ice",
  author = "Whispers through memory",
  loadingText = "Summoning spirits",

  className = "",
}) {
  const rootRef = useRef(null);
  const preloaderRef = useRef(null);
  const contentRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    let rafId;
    let disposed = false;

    // ── Load ESM modules from esm.sh (same CDN as original CodePen) ──────────
    async function boot() {
      const THREE = await import(
        /* webpackIgnore: true */ "https://esm.sh/three"
      );
      const { EffectComposer } = await import(
        /* webpackIgnore: true */ "https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js"
      );
      const { RenderPass } = await import(
        /* webpackIgnore: true */ "https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js"
      );
      const { UnrealBloomPass } = await import(
        /* webpackIgnore: true */ "https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js"
      );
      const { OutputPass } = await import(
        /* webpackIgnore: true */ "https://esm.sh/three/examples/jsm/postprocessing/OutputPass.js"
      );
      const { ShaderPass } = await import(
        /* webpackIgnore: true */ "https://esm.sh/three/examples/jsm/postprocessing/ShaderPass.js"
      );

      if (disposed || !rootRef.current) return;

      // ── Preloader helpers ─────────────────────────────────────────────────
      let loadingSteps = 0;
      const totalSteps = 5;

      function updateProgress(step) {
        loadingSteps = Math.min(step, totalSteps);
        if (progressRef.current)
          progressRef.current.style.width = `${(loadingSteps / totalSteps) * 100}%`;
      }

      function completePreloader(canvas) {
        updateProgress(totalSteps);
        setTimeout(() => {
          if (preloaderRef.current) {
            preloaderRef.current.style.opacity = "0";
            preloaderRef.current.style.pointerEvents = "none";
          }
          if (contentRef.current) contentRef.current.style.opacity = "1";
          canvas.style.opacity = "1";
          setTimeout(() => {
            if (preloaderRef.current)
              preloaderRef.current.style.display = "none";
          }, 1000);
        }, 1500);
      }

      updateProgress(1);

      // ── Scene ─────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      camera.position.z = 20;

      updateProgress(2);

      // ── Renderer ──────────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
        premultipliedAlpha: false,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      renderer.setClearColor(0x000000, 0);

      const canvas = renderer.domElement;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.zIndex = "2";
      canvas.style.pointerEvents = "auto";
      canvas.style.background = "transparent";
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 2s ease-in";
      rootRef.current.appendChild(canvas);

      // ── Post-processing ───────────────────────────────────────────────────
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.3, // strength
        1.25, // radius
        0.0, // threshold
      );
      composer.addPass(bloomPass);

      updateProgress(3);

      // ── Analog Decay shader (exact copy from original) ────────────────────
      const analogDecayShader = {
        uniforms: {
          tDiffuse: { value: null },
          uTime: { value: 0.0 },
          uResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          uAnalogGrain: { value: analogGrain },
          uAnalogBleeding: { value: analogBleeding },
          uAnalogVSync: { value: analogVSync },
          uAnalogScanlines: { value: analogScanlines },
          uAnalogVignette: { value: analogVignette },
          uAnalogJitter: { value: analogJitter },
          uAnalogIntensity: { value: analogIntensity },
          uLimboMode: { value: limboMode ? 1.0 : 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float uTime;
          uniform vec2 uResolution;
          uniform float uAnalogGrain;
          uniform float uAnalogBleeding;
          uniform float uAnalogVSync;
          uniform float uAnalogScanlines;
          uniform float uAnalogVignette;
          uniform float uAnalogJitter;
          uniform float uAnalogIntensity;
          uniform float uLimboMode;
          varying vec2 vUv;

          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }
          float random(float x) {
            return fract(sin(x) * 43758.5453123);
          }
          float gaussian(float z, float u, float o) {
            return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
          }
          vec3 grain(vec2 uv, float time, float intensity) {
            float seed  = dot(uv, vec2(12.9898, 78.233));
            float noise = fract(sin(seed) * 43758.5453 + time * 2.0);
            noise = gaussian(noise, 0.0, 0.5 * 0.5);
            return vec3(noise) * intensity;
          }

          void main() {
            vec2 uv   = vUv;
            float time = uTime * 1.8;
            vec2 jitteredUV = uv;

            if (uAnalogJitter > 0.01) {
              float ja = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter * uAnalogIntensity;
              jitteredUV.x += ja;
              jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter * uAnalogIntensity;
            }
            if (uAnalogVSync > 0.01) {
              float vr = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync * uAnalogIntensity;
              float vc = step(0.95, random(vec2(floor(time * 4.0))));
              jitteredUV.y += vr * vc;
            }

            vec4 color = texture2D(tDiffuse, jitteredUV);

            if (uAnalogBleeding > 0.01) {
              float ba  = 0.012 * uAnalogBleeding * uAnalogIntensity;
              float op  = time * 1.5 + uv.y * 20.0;
              vec2 ro   = vec2(sin(op) * ba, 0.0);
              vec2 bo   = vec2(-sin(op * 1.1) * ba * 0.8, 0.0);
              float r   = texture2D(tDiffuse, jitteredUV + ro).r;
              float g   = texture2D(tDiffuse, jitteredUV).g;
              float b   = texture2D(tDiffuse, jitteredUV + bo).b;
              color     = vec4(r, g, b, color.a);
            }
            if (uAnalogGrain > 0.01) {
              vec3 ge    = grain(uv, time, 0.075 * uAnalogGrain * uAnalogIntensity);
              ge        *= (1.0 - color.rgb);
              color.rgb += ge;
            }
            if (uAnalogScanlines > 0.01) {
              float sf    = 600.0 + uAnalogScanlines * 400.0;
              float sp    = sin(uv.y * sf) * 0.5 + 0.5;
              float si    = 0.1 * uAnalogScanlines * uAnalogIntensity;
              color.rgb  *= (1.0 - sp * si);
              float hl    = sin(uv.y * sf * 0.1) * 0.02 * uAnalogScanlines * uAnalogIntensity;
              color.rgb  *= (1.0 - hl);
            }
            if (uAnalogVignette > 0.01) {
              vec2  vu    = (uv - 0.5) * 2.0;
              float vg    = 1.0 - dot(vu, vu) * 0.3 * uAnalogVignette * uAnalogIntensity;
              color.rgb  *= vg;
            }
            if (uLimboMode > 0.5) {
              float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
              color.rgb  = vec3(gray);
            }

            gl_FragColor = color;
          }
        `,
      };

      const analogDecayPass = new ShaderPass(analogDecayShader);
      composer.addPass(analogDecayPass);
      composer.addPass(new OutputPass());

      // ── Atmosphere overlay ────────────────────────────────────────────────
      const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
          ghostPosition: { value: new THREE.Vector3(0, 0, 0) },
          revealRadius: { value: revealRadius },
          fadeStrength: { value: fadeStrength },
          baseOpacity: { value: baseOpacity },
          revealOpacity: { value: revealOpacity },
          time: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3  ghostPosition;
          uniform float revealRadius;
          uniform float fadeStrength;
          uniform float baseOpacity;
          uniform float revealOpacity;
          uniform float time;
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          void main() {
            float dist          = distance(vWorldPosition.xy, ghostPosition.xy);
            float dynamicRadius = revealRadius + sin(time * 2.0) * 5.0;
            float reveal        = smoothstep(dynamicRadius * 0.2, dynamicRadius, dist);
            reveal              = pow(reveal, fadeStrength);
            float opacity       = mix(revealOpacity, baseOpacity, reveal);
            gl_FragColor        = vec4(0.001, 0.001, 0.002, opacity);
          }
        `,
        transparent: true,
        depthWrite: false,
      });

      const atmosphere = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 300),
        atmosphereMaterial,
      );
      atmosphere.position.z = -50;
      atmosphere.renderOrder = -100;
      scene.add(atmosphere);

      // ── Lights ────────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x0a0a2e, 0.08));

      const rimLight1 = new THREE.DirectionalLight(0x4a90e2, rimLightIntensity);
      rimLight1.position.set(-8, 6, -4);
      scene.add(rimLight1);

      const rimLight2 = new THREE.DirectionalLight(
        0x50e3c2,
        rimLightIntensity * 0.7,
      );
      rimLight2.position.set(8, -4, -6);
      scene.add(rimLight2);

      updateProgress(4);

      // ── Ghost group & body ────────────────────────────────────────────────
      const ghostGroup = new THREE.Group();
      scene.add(ghostGroup);

      const ghostGeometry = new THREE.SphereGeometry(2, 40, 40);
      const posAttr = ghostGeometry.getAttribute("position");
      const positions = posAttr.array;
      for (let i = 0; i < positions.length; i += 3) {
        if (positions[i + 1] < -0.2) {
          const x = positions[i];
          const z = positions[i + 2];
          positions[i + 1] =
            -2.0 +
            Math.sin(x * 5) * 0.35 +
            Math.cos(z * 4) * 0.25 +
            Math.sin((x + z) * 3) * 0.15;
        }
      }
      ghostGeometry.computeVertexNormals();

      const ghostMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        transparent: true,
        opacity: ghostOpacity,
        emissive: new THREE.Color(FLUORESCENT[glowColor] ?? FLUORESCENT.orange),
        emissiveIntensity: emissiveIntensity,
        roughness: 0.02,
        metalness: 0.0,
        side: THREE.DoubleSide,
        alphaTest: 0.1,
      });

      const ghostBody = new THREE.Mesh(ghostGeometry, ghostMaterial);
      ghostGroup.add(ghostBody);

      // ── Eyes ──────────────────────────────────────────────────────────────
      const eyeGroup = new THREE.Group();
      ghostGroup.add(eyeGroup);

      const socketGeo = new THREE.SphereGeometry(0.45, 16, 16);
      const socketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

      const leftSocket = new THREE.Mesh(socketGeo, socketMat);
      leftSocket.position.set(-0.7, 0.6, 1.9);
      leftSocket.scale.set(1.1, 1.0, 0.6);
      eyeGroup.add(leftSocket);

      const rightSocket = new THREE.Mesh(socketGeo, socketMat);
      rightSocket.position.set(0.7, 0.6, 1.9);
      rightSocket.scale.set(1.1, 1.0, 0.6);
      eyeGroup.add(rightSocket);

      const eyeColor = FLUORESCENT[eyeGlowColor] ?? FLUORESCENT.green;
      const eyeGeo = new THREE.SphereGeometry(0.3, 12, 12);
      const outerGeo = new THREE.SphereGeometry(0.525, 12, 12);

      const leftEyeMat = new THREE.MeshBasicMaterial({
        color: eyeColor,
        transparent: true,
        opacity: 0,
      });
      const leftEye = new THREE.Mesh(eyeGeo, leftEyeMat);
      leftEye.position.set(-0.7, 0.6, 2.0);
      eyeGroup.add(leftEye);

      const rightEyeMat = new THREE.MeshBasicMaterial({
        color: eyeColor,
        transparent: true,
        opacity: 0,
      });
      const rightEye = new THREE.Mesh(eyeGeo, rightEyeMat);
      rightEye.position.set(0.7, 0.6, 2.0);
      eyeGroup.add(rightEye);

      const leftOuterMat = new THREE.MeshBasicMaterial({
        color: eyeColor,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
      });
      const leftOuter = new THREE.Mesh(outerGeo, leftOuterMat);
      leftOuter.position.set(-0.7, 0.6, 1.95);
      eyeGroup.add(leftOuter);

      const rightOuterMat = new THREE.MeshBasicMaterial({
        color: eyeColor,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
      });
      const rightOuter = new THREE.Mesh(outerGeo, rightOuterMat);
      rightOuter.position.set(0.7, 0.6, 1.95);
      eyeGroup.add(rightOuter);

      // ── Fireflies ─────────────────────────────────────────────────────────
      const fireflies = [];
      const fireflyGroup = new THREE.Group();
      scene.add(fireflyGroup);

      for (let i = 0; i < 20; i++) {
        const ffMat = new THREE.MeshBasicMaterial({
          color: 0xffff44,
          transparent: true,
          opacity: 0.9,
        });
        const ff = new THREE.Mesh(new THREE.SphereGeometry(0.02, 2, 2), ffMat);
        ff.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
        );

        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xffff88,
          transparent: true,
          opacity: 0.4,
          side: THREE.BackSide,
        });
        const glowMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          glowMat,
        );
        ff.add(glowMesh);

        const ffLight = new THREE.PointLight(0xffff44, 0.8, 3, 2);
        ff.add(ffLight);

        ff.userData = {
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * fireflySpeed,
            (Math.random() - 0.5) * fireflySpeed,
            (Math.random() - 0.5) * fireflySpeed,
          ),
          basePosition: ff.position.clone(),
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 2 + Math.random() * 3,
          glow: glowMesh,
          glowMaterial: glowMat,
          fireflyMaterial: ffMat,
          light: ffLight,
        };

        fireflyGroup.add(ff);
        fireflies.push(ff);
      }

      // ── Particles ─────────────────────────────────────────────────────────
      const particles = [];
      const particlePool = [];
      const particleGroup = new THREE.Group();
      scene.add(particleGroup);

      const pGeos = [
        new THREE.SphereGeometry(0.05, 6, 6),
        new THREE.TetrahedronGeometry(0.04, 0),
        new THREE.OctahedronGeometry(0.045, 0),
      ];
      const pColorHex = FLUORESCENT[particleColor] ?? FLUORESCENT.orange;
      const pBaseMat = new THREE.MeshBasicMaterial({
        color: pColorHex,
        transparent: true,
        opacity: 0,
        alphaTest: 0.1,
      });

      function initParticlePool(count) {
        for (let i = 0; i < count; i++) {
          const geomIndex = Math.floor(Math.random() * pGeos.length);
          const mat = pBaseMat.clone();
          const p = new THREE.Mesh(pGeos[geomIndex], mat);
          p.visible = false;
          particleGroup.add(p);
          particlePool.push(p);
        }
      }
      initParticlePool(100);

      function createParticle() {
        let p;
        if (particlePool.length > 0) {
          p = particlePool.pop();
          p.visible = true;
        } else if (particles.length < particleCount) {
          const gi = Math.floor(Math.random() * pGeos.length);
          const mat = pBaseMat.clone();
          p = new THREE.Mesh(pGeos[gi], mat);
          particleGroup.add(p);
        } else {
          return null;
        }

        const pc = new THREE.Color(pColorHex);
        pc.offsetHSL(Math.random() * 0.1 - 0.05, 0, 0);
        p.material.color = pc;

        p.position.copy(ghostGroup.position);
        p.position.z -= 0.8 + Math.random() * 0.6;
        p.position.x += (Math.random() - 0.5) * 3.5;
        p.position.y += (Math.random() - 0.5) * 3.5 - 0.8;

        const sv = 0.6 + Math.random() * 0.7;
        p.scale.set(sv, sv, sv);
        p.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        );

        p.userData.life = 1.0;
        p.userData.decay = Math.random() * 0.003 + particleDecayRate;
        p.userData.rotationSpeed = {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.015,
        };
        p.userData.velocity = {
          x: (Math.random() - 0.5) * 0.012,
          y: (Math.random() - 0.5) * 0.012 - 0.002,
          z: (Math.random() - 0.5) * 0.012 - 0.006,
        };

        p.material.opacity = Math.random() * 0.9;
        particles.push(p);
        return p;
      }

      // ── Resize ────────────────────────────────────────────────────────────
      let resizeTimeout;
      function onResize() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          composer.setSize(window.innerWidth, window.innerHeight);
          bloomPass.setSize(window.innerWidth, window.innerHeight);
          analogDecayPass.uniforms.uResolution.value.set(
            window.innerWidth,
            window.innerHeight,
          );
        }, 250);
      }
      window.addEventListener("resize", onResize);

      // ── Mouse ─────────────────────────────────────────────────────────────
      const mouse = new THREE.Vector2();
      const prevMouse = new THREE.Vector2();
      const mouseSpeed = new THREE.Vector2();
      let lastMouseUpdate = 0;
      let isMouseMoving = false;
      let mouseMovementTimer = null;

      function onMouseMove(e) {
        const now = performance.now();
        if (now - lastMouseUpdate > 16) {
          prevMouse.x = mouse.x;
          prevMouse.y = mouse.y;
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
          mouseSpeed.x = mouse.x - prevMouse.x;
          mouseSpeed.y = mouse.y - prevMouse.y;
          isMouseMoving = true;
          if (mouseMovementTimer) clearTimeout(mouseMovementTimer);
          mouseMovementTimer = setTimeout(() => {
            isMouseMoving = false;
          }, 80);
          lastMouseUpdate = now;
        }
      }
      window.addEventListener("mousemove", onMouseMove);

      // ── Animation loop (exact logic from original) ────────────────────────
      let time = 0;
      let currentMovement = 0;
      let lastFrameTime = 0;
      let frameCount = 0;
      let lastParticleTime = 0;
      let isInitialized = false;

      function forceInitialRender() {
        for (let i = 0; i < 3; i++) composer.render();
        for (let i = 0; i < 10; i++) createParticle();
        composer.render();
        isInitialized = true;
        completePreloader(canvas);
      }

      updateProgress(5);
      setTimeout(forceInitialRender, 100);

      function animate(timestamp) {
        rafId = requestAnimationFrame(animate);
        if (!isInitialized) return;

        const deltaTime = timestamp - lastFrameTime;
        lastFrameTime = timestamp;
        if (deltaTime > 100) return;

        time += (deltaTime / 16.67) * 0.01;
        frameCount++;

        // Update shader uniforms
        atmosphereMaterial.uniforms.time.value = time;
        analogDecayPass.uniforms.uTime.value = time;
        analogDecayPass.uniforms.uLimboMode.value = limboMode ? 1.0 : 0.0;

        // Ghost follows mouse
        const targetX = mouse.x * 11;
        const targetY = mouse.y * 7;
        const prevGhostPos = ghostGroup.position.clone();

        ghostGroup.position.x +=
          (targetX - ghostGroup.position.x) * followSpeed;
        ghostGroup.position.y +=
          (targetY - ghostGroup.position.y) * followSpeed;

        atmosphereMaterial.uniforms.ghostPosition.value.copy(
          ghostGroup.position,
        );

        const movementAmount = prevGhostPos.distanceTo(ghostGroup.position);
        currentMovement =
          currentMovement * eyeGlowDecay + movementAmount * (1 - eyeGlowDecay);

        // Floating animation — applied AFTER mouse lerp (same as original)
        const float1 = Math.sin(time * floatSpeed * 1.5) * 0.03;
        const float2 = Math.cos(time * floatSpeed * 0.7) * 0.018;
        const float3 = Math.sin(time * floatSpeed * 2.3) * 0.008;
        ghostGroup.position.y += float1 + float2 + float3;

        // Pulse
        const pulse1 = Math.sin(time * pulseSpeed) * pulseIntensity;
        const breathe = Math.sin(time * 0.6) * 0.12;
        ghostMaterial.emissiveIntensity = emissiveIntensity + pulse1 + breathe;

        // Fireflies
        fireflies.forEach((firefly) => {
          const ud = firefly.userData;
          const pulse = Math.sin(time + ud.phase * ud.pulseSpeed) * 0.4 + 0.6;

          ud.glowMaterial.opacity = fireflyGlowIntensity * 0.4 * pulse;
          ud.fireflyMaterial.opacity = fireflyGlowIntensity * 0.9 * pulse;
          ud.light.intensity = fireflyGlowIntensity * 0.8 * pulse;

          ud.velocity.x += (Math.random() - 0.5) * 0.001;
          ud.velocity.y += (Math.random() - 0.5) * 0.001;
          ud.velocity.z += (Math.random() - 0.5) * 0.001;
          ud.velocity.clampLength(0, fireflySpeed);
          firefly.position.add(ud.velocity);

          if (Math.abs(firefly.position.x) > 30) ud.velocity.x *= -0.5;
          if (Math.abs(firefly.position.y) > 20) ud.velocity.y *= -0.5;
          if (Math.abs(firefly.position.z) > 15) ud.velocity.z *= -0.5;
        });

        // Body tilt (exact from original)
        const mouseDirection = new THREE.Vector2(
          targetX - ghostGroup.position.x,
          targetY - ghostGroup.position.y,
        ).normalize();

        const tiltStrength = 0.1 * wobbleAmount;
        const tiltDecay = 0.95;
        ghostBody.rotation.z =
          ghostBody.rotation.z * tiltDecay +
          -mouseDirection.x * tiltStrength * (1 - tiltDecay);
        ghostBody.rotation.x =
          ghostBody.rotation.x * tiltDecay +
          mouseDirection.y * tiltStrength * (1 - tiltDecay);
        ghostBody.rotation.y = Math.sin(time * 1.4) * 0.05 * wobbleAmount;

        // Scale (exact from original)
        const scaleVariation =
          1 + Math.sin(time * 2.1) * 0.025 * wobbleAmount + pulse1 * 0.015;
        const scaleBreath = 1 + Math.sin(time * 0.8) * 0.012;
        const finalScale = scaleVariation * scaleBreath;
        ghostBody.scale.set(finalScale, finalScale, finalScale);

        // Eye glow (exact from original)
        const normalizedMouseSpeed =
          Math.sqrt(mouseSpeed.x * mouseSpeed.x + mouseSpeed.y * mouseSpeed.y) *
          8;
        const isMoving = currentMovement > movementThreshold;
        const targetGlow = isMoving ? 1.0 : 0.0;
        const glowChangeSpeed = isMoving
          ? eyeGlowResponse * 2
          : eyeGlowResponse;
        const newOpacity =
          leftEyeMat.opacity +
          (targetGlow - leftEyeMat.opacity) * glowChangeSpeed;

        leftEyeMat.opacity = newOpacity;
        rightEyeMat.opacity = newOpacity;
        leftOuterMat.opacity = newOpacity * 0.3;
        rightOuterMat.opacity = newOpacity * 0.3;

        // Particle creation
        const shouldCreate = createParticlesOnlyWhenMoving
          ? currentMovement > 0.005 && isMouseMoving
          : currentMovement > 0.005;

        if (shouldCreate && timestamp - lastParticleTime > 100) {
          const speedRate = Math.floor(normalizedMouseSpeed * 3);
          const rate = Math.min(particleCreationRate, Math.max(1, speedRate));
          for (let i = 0; i < rate; i++) createParticle();
          lastParticleTime = timestamp;
        }

        // Particle update (exact from original)
        const particlesToUpdate = Math.min(particles.length, 60);
        for (let i = 0; i < particlesToUpdate; i++) {
          const index = (frameCount + i) % particles.length;
          if (index < particles.length) {
            const p = particles[index];
            p.userData.life -= p.userData.decay;
            p.material.opacity = p.userData.life * 0.85;

            if (p.userData.velocity) {
              p.position.x += p.userData.velocity.x;
              p.position.y += p.userData.velocity.y;
              p.position.z += p.userData.velocity.z;
              const swirl = Math.cos(time * 1.8 + p.position.y) * 0.0008;
              p.position.x += swirl;
            }
            if (p.userData.rotationSpeed) {
              p.rotation.x += p.userData.rotationSpeed.x;
              p.rotation.y += p.userData.rotationSpeed.y;
              p.rotation.z += p.userData.rotationSpeed.z;
            }
            if (p.userData.life <= 0) {
              p.visible = false;
              p.material.opacity = 0;
              particlePool.push(p);
              particles.splice(index, 1);
              i--;
            }
          }
        }

        composer.render();
      }

      // Seed mouse to center (same as original)
      window.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        }),
      );

      animate(0);

      // ── Cleanup ───────────────────────────────────────────────────────────
      return () => {
        disposed = true;
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
        if (resizeTimeout) clearTimeout(resizeTimeout);
        renderer.dispose();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    }

    let cleanupFn;
    boot().then((fn) => {
      cleanupFn = fn;
      if (disposed) cleanupFn?.();
    });

    return () => {
      disposed = true;
      cleanupFn?.();
    };
  }, []); // props captured via closure — re-mount to change

  const quoteLines = quote.split("\n");

  return (
    <>
      {/* ── Font imports ── */}
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=JetBrains+Mono:wght@400;500;700&display=swap");

        :root {
          --font-display: 'Cinzel Decorative', serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes eyePulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.3); }
        }
        @keyframes textPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.1; }
        }
      `}</style>

      {/* ── Root ── */}
      <div
        ref={rootRef}
        className={[
          "relative w-full h-screen overflow-hidden bg-[#111]",
          className,
        ].join(" ")}
        style={{ letterSpacing: "-0.03em" }}
      >
        {/* ── Preloader ── */}
        <div
          ref={preloaderRef}
          className="absolute inset-0 flex items-center justify-center z-[10000]"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
            transition: "opacity 1s ease-out",
          }}
        >
          <div className="text-center text-[#e0e0e0]">
            {/* Ghost SVG — matches original HTML exactly */}
            <div className="relative w-16 h-16 mx-auto mb-[30px] flex items-center justify-center">
              <svg
                height="80"
                width="80"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))",
                  animation: "ghostFloat 3s ease-in-out infinite",
                }}
              >
                <path
                  d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z"
                  fill="white"
                  opacity="0.9"
                />
                <circle
                  cx="208"
                  cy="225"
                  r="22"
                  fill="black"
                  style={{
                    animation: "eyePulse 2s ease-in-out infinite",
                    transformOrigin: "center",
                  }}
                />
                <circle
                  cx="297"
                  cy="225"
                  r="22"
                  fill="black"
                  style={{
                    animation: "eyePulse 2s ease-in-out 0.1s infinite",
                    transformOrigin: "center",
                  }}
                />
              </svg>
            </div>

            <p
              className="text-[12px] uppercase mb-3"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                animation: "textPulse 2s ease-in-out infinite",
              }}
            >
              {loadingText}
            </p>

            {/* Progress bar */}
            <div className="w-24 h-px mx-auto rounded-sm overflow-hidden">
              <div
                ref={progressRef}
                className="h-full w-0"
                style={{
                  background: "linear-gradient(90deg, #00ff80, #00cc66)",
                  opacity: 0.1,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div
          ref={contentRef}
          className="absolute inset-0 z-[1] flex flex-col items-center justify-center p-5 text-center text-[#e0e0e0]"
          style={{ opacity: 0, transition: "opacity 1.5s ease-in" }}
        >
          <div className="max-w-[90%] overflow-hidden">
            <h1
              className="font-normal uppercase mb-[5vh]"
              style={{
                fontFamily: '"Cinzel Decorative", system-ui',
                fontSize: "6vw",
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
              }}
            >
              {quoteLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < quoteLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <span
              className="block text-[12px] uppercase mt-[2vh]"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                opacity: 0.7,
              }}
            >
              {author}
            </span>
          </div>
        </div>

        {/* Three.js canvas is injected here by useEffect */}
      </div>
    </>
  );
}
