"use client";

import { useEffect, useRef, useState } from "react";

// ─── FlightCard ───────────────────────────────────────────────────────────────
//
// A cinematic boarding-pass style flight tracker card with:
//   • VanillaTilt 3D tilt on the card wrapper
//   • Three.js Boeing 787 GLB model with HDRI lighting + post-processing
//   • Motion-library staggered intro animations
//   • Animated SVG flight path (dashed white + green progress stroke)
//   • Live-updating speed / altitude / pitch counters
//   • Hover tooltips (destination weather / ETA) that follow the cursor
//   • AudioMotion waveform visualiser triggered on card press
//
// ─── HYDRATION / TURBOPACK FIX NOTES ────────────────────────────────────────
//
// Bug 1 — Hydration mismatch with Iconify:
//   The Iconify CDN script converts <span class="iconify"> → <svg> at runtime.
//   When Next.js SSR renders the page, it emits bare <span> tags. By the time
//   React hydrates on the client, Iconify has already replaced them with <svg>,
//   so the DOM doesn't match. Fix: gate all Iconify-containing JSX behind a
//   `mounted` state flag that starts false and becomes true inside useEffect.
//   SSR renders null for those sections; client renders the real markup.
//
// Bug 2 — __turbopack_context__.x is not a function:
//   Turbopack intercepts dynamic import() calls and tries to resolve them
//   through its own module graph. https://esm.sh URLs are external and can't
//   be resolved this way, causing the runtime error. Fix: use the same
//   loadScript() helper pattern as SwingLight — append a <script> tag to
//   <head> and wait for onload, then access the lib via window.* globals.
//   For ESM-only libs that don't expose globals (motion, AudioMotionAnalyzer)
//   we use a data-src script with type="module" and a self-contained module
//   body that assigns to window. See loadEsm() below.
//
// ─── Props ────────────────────────────────────────────────────────────────────
//
// ── Flight info ───────────────────────────────────────────────────────────────
// flightNumber     string   "QR1399"          IATA flight code shown top-right
// status           string   "On Time"         Status badge text
// statusColor      string   "#29c676"         Badge + dot + glow accent color
//
// ── Route ─────────────────────────────────────────────────────────────────────
// fromCode         string   "DOH"             3-letter IATA origin code
// fromCountry      string   "Qatar"           Origin country label
// fromFlagIcon     string   "circle-flags:qa" Iconify icon id for origin flag
// fromWeather      string   "34° Clear"       Tooltip weather text for origin
// fromDeparture    string   "Departed Today 3:20PM"
// fromWeatherIcon  string   "material-symbols:nights-stay"
//
// toCode           string   "TUN"             3-letter IATA destination code
// toCountry        string   "Tunisia"         Destination country label
// toFlagIcon       string   "circle-flags:tn" Iconify icon id for destination flag
// toWeather        string   "23° Cloudy"      Tooltip weather text for destination
// toArrival        string   "Arriving Today 8:40PM"
// toWeatherIcon    string   "famicons:cloudy-night"
//
// duration         string   "5h 20min"        Flight duration label
// etaMinutes       number   17                ETA display value (minutes)
//
// ── Aircraft ──────────────────────────────────────────────────────────────────
// aircraftName     string   "Boeing 787-9 Dreamliner"
// modelUrl         string   (CDN)             URL to the .glb 3D model
// hdrUrl           string   (CDN)             URL to the .hdr environment map
// cloudUrl         string   (CDN)             URL to cloud PNG overlay
//
// ── Passenger details ─────────────────────────────────────────────────────────
// seatClass        string   "Business"
// seatNumber       string   "3A"
// luggageCount     number   2
// classImageUrl    string   (imgur)           Hover preview image for class
// seatImageUrl     string   (imgur)           Hover preview image for seat
//
// ── Branding ──────────────────────────────────────────────────────────────────
// airlineLogoUrl   string   (brandfetch CDN)  Airline logo
// thumbnailUrl     string   (imgur)           Decorative overlay PNG
// audioUrl         string   (CDN)             MP3 played on card press
//
// ── Live telemetry seeds ──────────────────────────────────────────────────────
// initSpeed        number   290               Starting speed (km/h)
// initAltitude     number   5500              Starting altitude (meters)
// initPitch        number   3.5               Starting pitch (degrees)
//
// ─────────────────────────────────────────────────────────────────────────────

export default function FlightCard({
  flightNumber = "QR1399",
  status = "On Time",
  statusColor = "#29c676",

  fromCode = "DOH",
  fromCountry = "Qatar",
  fromFlagIcon = "circle-flags:qa",
  fromWeather = "34° Clear",
  fromDeparture = "Departed Today 3:20PM",
  fromWeatherIcon = "material-symbols:nights-stay",

  toCode = "TUN",
  toCountry = "Tunisia",
  toFlagIcon = "circle-flags:tn",
  toWeather = "23° Cloudy",
  toArrival = "Arriving Today 8:40PM",
  toWeatherIcon = "famicons:cloudy-night",

  duration = "5h 20min",
  etaMinutes = 17,

  aircraftName = "Boeing 787-9 Dreamliner",
  modelUrl = "https://cdn.jsdelivr.net/gh/ouyahama/cdn@main/plane.glb",
  hdrUrl = "https://cdn.jsdelivr.net/gh/ouyahama/cdn@main/light3.hdr",
  cloudUrl = "https://cdn.jsdelivr.net/gh/ouyahama/cdn/cloud.png",

  seatClass = "Business",
  seatNumber = "3A",
  luggageCount = 2,
  classImageUrl = "https://i.imgur.com/LMr8kX8.png",
  seatImageUrl = "https://i.imgur.com/t5xGveQ.png",

  airlineLogoUrl = "https://cdn.brandfetch.io/idZKewuK9S/theme/light/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  thumbnailUrl = "https://i.imgur.com/NtaVpzy.png",
  audioUrl = "https://cdn.jsdelivr.net/gh/ouyahama/cdn@main/land.mp3",

  initSpeed = 290,
  initAltitude = 5500,
  initPitch = 3.5,
}) {
  // ── mounted guard ─────────────────────────────────────────────────────────
  // FIX (Bug 1): All Iconify <span> tags are inside sections gated by this
  // flag. SSR renders null for those sections so the server HTML never
  // contains <span class="iconify">. After hydration the client renders them
  // and Iconify converts them — both sides now agree on the initial DOM.
  const [mounted, setMounted] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const cardWrapRef = useRef(null);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const waveRef = useRef(null);

  // ── Live telemetry state ──────────────────────────────────────────────────
  const [speed, setSpeed] = useState(initSpeed);
  const [altitude, setAltitude] = useState(initAltitude);
  const [pitch, setPitch] = useState(initPitch);

  // ── Tooltip state ─────────────────────────────────────────────────────────
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showTooltipTo, setShowTooltipTo] = useState(false);
  const [showTooltipFrom, setShowTooltipFrom] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // loadScript — appends a classic <script> tag and resolves on load.
  // Used for UMD/IIFE libs that expose a global (VanillaTilt, Iconify, THREE).
  // Deduped via data-id so reloading the component doesn't double-inject.
  // ─────────────────────────────────────────────────────────────────────────
  const loadScript = (src, isModule = false) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-id="${src}"]`)) {
        resolve();
        return;
      }
      const el = document.createElement("script");
      el.src = src;
      if (isModule) el.type = "module";
      el.setAttribute("data-id", src);
      el.onload = resolve;
      el.onerror = () =>
        reject(new Error(`[FlightCard] Script load failed: ${src}`));
      document.head.appendChild(el);
    });

  // ─────────────────────────────────────────────────────────────────────────
  // loadEsm — FIX (Bug 2): Turbopack can't dynamic-import() external https://
  // URLs. Instead we inject an inline <script type="module"> that imports
  // the lib and assigns it to window[globalKey]. We then resolve once that
  // key appears on window (polling every 50ms).
  // ─────────────────────────────────────────────────────────────────────────
  const loadEsm = (src, globalKey) =>
    new Promise((resolve, reject) => {
      if (window[globalKey]) {
        resolve(window[globalKey]);
        return;
      }
      const id = `esm-${globalKey}`;
      if (!document.querySelector(`script[data-id="${id}"]`)) {
        const el = document.createElement("script");
        el.type = "module";
        el.setAttribute("data-id", id);
        el.textContent = `import * as mod from "${src}"; window["${globalKey}"] = mod;`;
        document.head.appendChild(el);
      }
      let attempts = 0;
      const poll = setInterval(() => {
        if (window[globalKey]) {
          clearInterval(poll);
          resolve(window[globalKey]);
        } else if (++attempts > 100) {
          clearInterval(poll);
          reject(new Error(`[FlightCard] ESM load timeout: ${globalKey}`));
        }
      }, 50);
    });

  // ─────────────────────────────────────────────────────────────────────────
  // Main effect — runs once after mount
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    const onMouseMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouseMove);

    const cleanupFns = [];

    (async () => {
      try {
        // ── Step 1: load Iconify (UMD global, no global needed — it scans DOM) ──
        await loadScript("https://code.iconify.design/3/3.1.0/iconify.min.js");

        // ── Step 2: load Motion via ESM shim → window.__motion ───────────────
        // motion v11 is ESM-only; loadEsm wraps it in an inline module script
        // that assigns all named exports to window.__motion.
        const motion = await loadEsm("https://esm.sh/motion", "__motion");
        const { animate, press, hover, stagger } = motion;

        // ── Step 3: VanillaTilt (UMD, exposes window.VanillaTilt) ────────────
        await loadScript(
          "https://cdn.jsdelivr.net/npm/vanilla-tilt@1.8.1/dist/vanilla-tilt.min.js",
        );
        const VanillaTilt = window.VanillaTilt;

        // ── Step 4: Howler (UMD, exposes window.Howl) ────────────────────────
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js",
        );
        const Howl = window.Howl;

        // ── Step 5: AudioMotionAnalyzer via ESM shim ─────────────────────────
        const amMod = await loadEsm(
          "https://esm.sh/audiomotion-analyzer?min",
          "__audiomotion",
        );
        const AudioMotionAnalyzer =
          amMod.default ?? amMod.AudioMotionAnalyzer ?? amMod;

        // ── VanillaTilt ───────────────────────────────────────────────────────
        if (cardWrapRef.current && VanillaTilt) {
          VanillaTilt.init(cardWrapRef.current, {
            speed: 50,
            max: 5,
            glare: true,
            "max-glare": 0.05,
          });
          cleanupFns.push(() => cardWrapRef.current?.vanillaTilt?.destroy());
        }

        // ── Audio ─────────────────────────────────────────────────────────────
        const audioEl = new Audio(audioUrl);
        audioEl.crossOrigin = "anonymous";

        if (waveRef.current && AudioMotionAnalyzer) {
          try {
            new AudioMotionAnalyzer(waveRef.current, {
              source: audioEl,
              mode: 1,
              ledBars: true,
              showBgColor: false,
              showFPS: false,
              showPeaks: false,
              showScaleX: false,
              showScaleY: false,
              gradient: "prism",
              colorMode: "bar",
            });
          } catch (e) {
            console.warn("[FlightCard] AudioMotion init failed:", e.message);
          }
        }

        // Card press → scale + play audio
        if (cardRef.current) {
          const cleanPress = press(cardRef.current, () => {
            animate(cardRef.current, { scale: 1.05 });
            audioEl.play().catch(() => {});
            return () => animate(cardRef.current, { scale: 1 });
          });
          if (typeof cleanPress === "function") cleanupFns.push(cleanPress);
        }

        // ── Staggered intro animation ─────────────────────────────────────────
        animate(".fc-made", { opacity: [0, 0.75] }, { duration: 0.5 });
        animate(".fc-small", { opacity: [0, 0.75] }, { duration: 0.5 });
        animate(
          ".fc-card",
          {
            filter: ["blur(1rem)", "blur(0)"],
            scale: [0.8, 1],
            opacity: [0, 1],
          },
          { duration: 0.3 },
        );
        await animate(
          ".fc-logo",
          { scale: [0, 1], opacity: [0, 1] },
          { duration: 0.2, delay: 0.1 },
        );
        animate(
          ".fc-status",
          { scale: [0.8, 1], opacity: [0, 1] },
          { duration: 0.2 },
        );
        animate(
          ".fc-status-text",
          { scale: [0.8, 1], opacity: [0, 1] },
          { duration: 0.3 },
        );
        animate(
          ".fc-flight-num",
          { scale: [0.8, 1], opacity: [0, 1] },
          { duration: 0.3 },
        );
        await animate(
          ".fc-label",
          { scale: [0.8, 1], opacity: [0, 0.5] },
          { duration: 0.3 },
        );
        await animate(
          ".fc-box",
          {
            filter: ["blur(1rem)", "blur(0)"],
            scale: [0.8, 1],
            opacity: [0, 1],
          },
          { duration: 0.3, delay: stagger(0.1) },
        );
        await animate(
          ".fc-dur",
          { scale: [0, 1], opacity: [0, 1] },
          { duration: 0.3 },
        );
        await animate(
          ".fc-speed-item",
          { scale: [0.8, 1], opacity: [0, 0.5] },
          { duration: 0.3, delay: stagger(0.1) },
        );
        await animate(
          ".fc-plane",
          { scale: [0.8, 1], opacity: [0, 0.9] },
          { duration: 0.3 },
        );
        await animate(
          ".fc-foot-item",
          { scale: [0.8, 1], opacity: [0, 1] },
          { duration: 0.3, delay: stagger(0.1) },
        );

        // ── Three.js 3D model ─────────────────────────────────────────────────
        // Three.js and its extras are ESM-only; load them via the shim pattern.
        // Each sub-path gets its own window key.
        const [
          THREE,
          ocMod,
          gltfMod,
          dracoMod,
          rgbeMod,
          ecMod,
          rpMod,
          spMod,
          bcMod,
        ] = await Promise.all([
          loadEsm("https://esm.sh/three@0.178.0", "__three"),
          loadEsm(
            "https://esm.sh/three@0.178.0/examples/jsm/controls/OrbitControls",
            "__threeOC",
          ),
          loadEsm(
            "https://esm.sh/three@0.178.0/examples/jsm/loaders/GLTFLoader",
            "__threeGLTF",
          ),
          loadEsm(
            "https://esm.sh/three@0.178.0/examples/jsm/loaders/DRACOLoader",
            "__threeDraco",
          ),
          loadEsm(
            "https://esm.sh/three@0.178.0/examples/jsm/loaders/RGBELoader",
            "__threeRGBE",
          ),
          loadEsm(
            "https://esm.sh/three@0.178.0/examples/jsm/postprocessing/EffectComposer",
            "__threeEC",
          ),
          loadEsm(
            "https://esm.sh/three@0.178.0/examples/jsm/postprocessing/RenderPass",
            "__threeRP",
          ),
          loadEsm(
            "https://esm.sh/three@0.178.0/examples/jsm/postprocessing/ShaderPass",
            "__threeSP",
          ),
          loadEsm(
            "https://esm.sh/three@0.178.0/examples/jsm/shaders/BrightnessContrastShader",
            "__threeBC",
          ),
        ]);

        const { OrbitControls } = ocMod;
        const { GLTFLoader } = gltfMod;
        const { DRACOLoader } = dracoMod;
        const { RGBELoader } = rgbeMod;
        const { EffectComposer } = ecMod;
        const { RenderPass } = rpMod;
        const { ShaderPass } = spMod;
        const { BrightnessContrastShader } = bcMod;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const { width, height } = canvas.getBoundingClientRect();

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          35,
          width / height,
          0.1,
          1000,
        );
        camera.position.set(40, 20, 70);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(width, height, false);
        renderer.setPixelRatio(devicePixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.8;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom =
          controls.enablePan =
          controls.enableRotate =
            false;

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.1);
        rimLight.position.set(-5, 5, 10);
        scene.add(rimLight, new THREE.AmbientLight(0xffffff, 0.2));

        const modelGroup = new THREE.Group();
        const baseYaw = Math.PI / 1.6;
        scene.add(modelGroup);

        // Hover card → scale 3D group
        if (cardRef.current) {
          const cleanHover = hover(cardRef.current, () => {
            animate(
              modelGroup.scale,
              { x: 1.05, y: 1.05, z: 1.05 },
              { duration: 0.4 },
            );
            return () =>
              animate(
                modelGroup.scale,
                { x: 1, y: 1, z: 1 },
                { duration: 0.4 },
              );
          });
          if (typeof cleanHover === "function") cleanupFns.push(cleanHover);
        }

        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        new RGBELoader().load(hdrUrl, (hdr) => {
          scene.environment = pmrem.fromEquirectangular(hdr).texture;
          hdr.dispose();
          pmrem.dispose();
        });

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(
          "https://www.gstatic.com/draco/v1/decoders/",
        );
        dracoLoader.setDecoderConfig({ type: "js" });

        new GLTFLoader().setDRACOLoader(dracoLoader).load(modelUrl, (gltf) => {
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.material.roughness = 0.4;
              child.material.metalness = 0.7;
              child.material.envMapIntensity = 0.9;
            }
          });
          modelGroup.add(gltf.scene);
        });

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bcPass = new ShaderPass(BrightnessContrastShader);
        composer.addPass(bcPass);

        const clock = new THREE.Clock();
        let rafId;
        const renderLoop = () => {
          rafId = requestAnimationFrame(renderLoop);
          const t = clock.getElapsedTime();
          modelGroup.rotation.set(
            Math.sin(t * 0.35) * 0.05,
            baseYaw + Math.sin(t * 0.25) * 0.1,
            Math.sin(t * 0.5) * 0.07,
          );
          controls.update();
          composer.render();
        };
        renderLoop();
        animate(canvas, { opacity: [0, 1] }, { duration: 1, delay: 0.2 });

        const onResize = () => {
          const { width, height } = canvas.getBoundingClientRect();
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          composer.setSize(width, height);
        };
        window.addEventListener("resize", onResize);
        cleanupFns.push(() => {
          cancelAnimationFrame(rafId);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
        });
      } catch (err) {
        console.error("[FlightCard] Init error:", err);
      }
    })();

    // ── Live telemetry intervals ───────────────────────────────────────────
    let s = initSpeed;
    const si = setInterval(() => {
      s = Math.min(306, Math.max(278, s + (Math.random() * 6 - 3)));
      setSpeed(Math.round(s));
    }, 500);

    let alt = initAltitude;
    const ai = setInterval(() => {
      alt = Math.max(0, alt - 4.5 + (Math.random() * 6 - 3));
      setAltitude(Math.round(alt));
    }, 500);

    let p = initPitch;
    const pi = setInterval(() => {
      p = Math.min(5, Math.max(2, p - 0.01 + (Math.random() * 0.2 - 0.1)));
      setPitch(p.toFixed(1));
    }, 500);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clearInterval(si);
      clearInterval(ai);
      clearInterval(pi);
      cleanupFns.forEach((fn) => fn?.());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-4 px-4"
      style={{
        background: "black",
        color: "white",
        fontFamily: "'Switzer', sans-serif",
      }}
    >
      {/* ── Keyframe styles ───────────────────────────────────────────────── */}
      {/* Cannot be Tailwind: pseudo-element animations, SVG stroke-dashoffset,
          multi-stop opacity+translate keyframes, parent→child hover triggers  */}
      <style>{`
        @keyframes fc-pulse {
          from { transform: scale(1); opacity: 1; }
          to   { transform: scale(3); opacity: 0; }
        }
        @keyframes fc-dash {
          from { stroke-dashoffset: 1000; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fc-move {
          from      { opacity: 0; transform: translateX(150%); }
          20%       { opacity: 1; }
          55%, 100% { opacity: 0; transform: translateX(-100%); }
        }
        .fc-dot-pulse::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: inherit;
          animation: fc-pulse 1s cubic-bezier(0,0,0.25,1) infinite;
        }
        .fc-path-white { animation: fc-dash 5s linear alternate infinite; }
        .fc-path-green {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: fc-dash 2s ease-in-out forwards;
        }
        .fc-cloud { animation: fc-move 10s linear infinite; }
        .fc-item-hover {
          transition: all 0.5s cubic-bezier(0,0,0.25,1);
          transform: scale(0);
          opacity: 0;
        }
        .fc-foot-item:hover .fc-item-hover {
          transform: scale(1);
          opacity: 1;
        }
      `}</style>

      {/* ── Cursor-following tooltips ──────────────────────────────────────── */}
      {/* FIX (Bug 1): gated behind `mounted` — Iconify spans only render      */}
      {/* after hydration so SSR and client HTML agree on the initial output.  */}
      {mounted &&
        [
          {
            show: showTooltipTo,
            weather: toWeather,
            icon: toWeatherIcon,
            sub: toArrival,
          },
          {
            show: showTooltipFrom,
            weather: fromWeather,
            icon: fromWeatherIcon,
            sub: fromDeparture,
          },
        ].map((tip, i) => (
          <div
            key={i}
            className="fixed z-50 rounded-2xl text-sm flex flex-col items-center gap-1 pointer-events-none"
            style={{
              left: cursorPos.x + 20,
              top: cursorPos.y + 20,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(1rem)",
              padding: "0.5rem",
              width: "8rem",
              opacity: tip.show ? 1 : 0,
              filter: tip.show ? "blur(0)" : "blur(1rem)",
              transform: tip.show ? "scale(1)" : "scale(0)",
              transition: "opacity 0.4s, filter 0.4s, transform 0.4s",
            }}
          >
            <div className="flex items-center">
              <span
                className="iconify mr-1"
                data-icon={tip.icon}
                style={{ fontSize: "0.9rem" }}
              />
              {tip.weather}
            </div>
            <div className="text-[0.7rem] opacity-50 mt-1 text-center">
              {tip.sub}
            </div>
          </div>
        ))}

      {/* ── Card wrapper (VanillaTilt target) ─────────────────────────────── */}
      <div
        ref={cardWrapRef}
        className="fc-card-wrap relative flex justify-center items-center rounded-[2rem]"
        style={{ cursor: "pointer" }}
      >
        {/* Decorative thumbnail — motion lib immediately sets opacity:0 on it */}
        <img
          src={thumbnailUrl}
          alt=""
          draggable={false}
          className="absolute top-0 -left-4 w-[25rem] z-[99] pointer-events-none select-none"
          style={{ opacity: 0 }}
        />

        {/* ── Card ──────────────────────────────────────────────────────────── */}
        <div
          ref={cardRef}
          className="fc-card relative rounded-[2rem] p-6 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.025)",
            backdropFilter: "blur(2rem)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 2rem rgba(255,255,255,0.1)",
            width: "20rem",
            minHeight: "30rem",
            opacity: 0, // motion lib animates this in
          }}
        >
          {/* Top shimmer line */}
          <div
            className="absolute top-0 h-[2px] pointer-events-none"
            style={{
              left: "10%",
              width: "80%",
              background:
                "linear-gradient(0.25turn,rgba(255,255,255,0),rgba(255,255,255,0.4),rgba(255,255,255,0))",
            }}
          />
          {/* Ambient blob */}
          <div
            className="absolute top-0 right-0 rounded-[40%] pointer-events-none -z-10"
            style={{
              height: "10rem",
              width: "10rem",
              background: "rgba(255,255,255,0.2)",
              filter: "blur(3rem)",
            }}
          />

          {/* ── TOP ROW ─────────────────────────────────────────────────────── */}
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-center h-7">
              <img
                src={airlineLogoUrl}
                alt="airline"
                className="fc-logo h-7"
                style={{ opacity: 0 }}
              />
            </div>
            <div className="flex flex-col items-end gap-1">
              {/* Status badge — Iconify span inside, gated by mounted */}
              <div
                className="fc-status flex items-center rounded-full px-2 py-[0.2rem] text-[0.6rem] border"
                style={{
                  background: `linear-gradient(to bottom,#00774f,${statusColor})`,
                  boxShadow: "0 0 1rem rgba(255,255,255,0.2)",
                  borderColor: "green",
                  opacity: 0,
                }}
              >
                {mounted && (
                  <span
                    className="iconify mr-1"
                    data-icon="icon-park-solid:check-one"
                  />
                )}
                <span
                  className="fc-status-text font-bold"
                  style={{ opacity: 0 }}
                >
                  {status}
                </span>
              </div>
              <div
                className="fc-flight-num text-[0.7rem] font-medium"
                style={{ opacity: 0 }}
              >
                {flightNumber}
              </div>
            </div>
          </div>

          {/* ── MID SECTION ───────────────────────────────────────────────────── */}
          <div className="mt-5 relative z-[99]">
            {/* Route row */}
            <div className="flex justify-center my-8">
              {/* FROM box */}
              <div
                className="fc-box relative flex flex-col justify-center items-center text-center rounded-xl p-2"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  height: "4rem",
                  width: "8rem",
                  opacity: 0,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setShowTooltipFrom(true)}
                onMouseLeave={() => setShowTooltipFrom(false)}
              >
                <div
                  className="fc-label flex items-center justify-center text-[0.65rem] uppercase"
                  style={{ opacity: 0 }}
                >
                  {mounted && (
                    <span
                      className="iconify mr-1"
                      data-icon="tabler:plane-departure"
                    />
                  )}
                  from
                </div>
                <div className="flex justify-center items-center gap-2 mt-2">
                  {mounted && (
                    <span className="iconify" data-icon={fromFlagIcon} />
                  )}
                  <div
                    style={{
                      fontFamily: "'Courier New',monospace",
                      fontSize: "1.5rem",
                    }}
                  >
                    {fromCode}
                  </div>
                </div>
                <div className="opacity-20 text-[0.7rem] mt-1">
                  {fromCountry}
                </div>
              </div>

              {/* Arc + duration */}
              <div
                className="fc-dur flex flex-col items-center"
                style={{ opacity: 0 }}
              >
                <div className="mt-3">
                  <svg
                    width="100"
                    viewBox="-40 -10 700 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="fc-path-white"
                      d="M4 143C100.5 38.3333 356.3 -108.2 607.5 143"
                      stroke="white"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="bevel"
                      strokeDasharray="25 25"
                    />
                    <path
                      className="fc-path-green"
                      d="M4 143C101 38.5 321.5 -78.4999 543 87"
                      stroke={statusColor}
                      strokeWidth="20"
                      strokeMiterlimit="16"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="text-[0.8rem] opacity-50 text-center">
                  {duration}
                </div>
                <div
                  className="flex justify-center items-center rounded-full px-1 text-[0.6rem] font-semibold tracking-wide uppercase -ml-3"
                  style={{
                    color: statusColor,
                    textShadow: `0 0 1rem ${statusColor}`,
                  }}
                >
                  <div
                    className="fc-dot-pulse w-[0.4rem] h-[0.4rem] rounded-full mr-2 relative"
                    style={{ background: statusColor }}
                  />
                  ETA&nbsp;<span className="mx-1">{etaMinutes}&nbsp;</span>MIN
                </div>
              </div>

              {/* TO box */}
              <div
                className="fc-box relative flex flex-col justify-center items-center text-center rounded-xl p-2"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  height: "4rem",
                  width: "8rem",
                  opacity: 0,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setShowTooltipTo(true)}
                onMouseLeave={() => setShowTooltipTo(false)}
              >
                <div
                  className="fc-label flex items-center justify-center text-[0.65rem] uppercase"
                  style={{ opacity: 0 }}
                >
                  {mounted && (
                    <span
                      className="iconify mr-1"
                      data-icon="tabler:plane-arrival"
                    />
                  )}
                  to
                </div>
                <div className="flex justify-center items-center gap-2 mt-2">
                  {mounted && (
                    <span className="iconify" data-icon={toFlagIcon} />
                  )}
                  <div
                    style={{
                      fontFamily: "'Courier New',monospace",
                      fontSize: "1.5rem",
                    }}
                  >
                    {toCode}
                  </div>
                </div>
                <div className="opacity-20 text-[0.7rem] mt-1">{toCountry}</div>
              </div>
            </div>

            {/* ── Telemetry row ──────────────────────────────────────────────── */}
            <div className="flex justify-between w-full items-center mt-4">
              {[
                {
                  icon: "material-symbols:speed",
                  label: "Speed",
                  value: speed,
                  unit: "KM/H",
                },
                {
                  icon: "material-symbols-light:altitude-rounded",
                  label: "Altitude",
                  value: altitude,
                  unit: "METER",
                },
                {
                  icon: "radix-icons:angle",
                  label: "Pitch",
                  value: pitch,
                  unit: "°",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="fc-speed-item flex flex-col justify-center items-center rounded-full mx-1 text-[0.6rem] font-normal tracking-wide uppercase"
                  style={{ opacity: 0, padding: "0.25rem" }}
                >
                  <div className="opacity-50 flex items-center">
                    {mounted && (
                      <span className="iconify mr-1" data-icon={stat.icon} />
                    )}
                    {stat.label}
                  </div>
                  <div className="mt-1 font-semibold">
                    {stat.value}
                    <span className="text-[0.55rem] ml-0.5 opacity-70">
                      {stat.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── 3D plane canvas ────────────────────────────────────────────── */}
            <div
              className="fc-plane text-center my-4 relative overflow-hidden"
              style={{ opacity: 0 }}
            >
              <canvas
                ref={canvasRef}
                className="w-full max-h-40 bg-transparent pointer-events-none"
                style={{
                  filter:
                    "brightness(0.8) contrast(1.2) saturate(0.6) hue-rotate(-10deg)",
                  opacity: 0,
                }}
              />
              <div>
                <div className="mb-1 text-[0.7rem] opacity-25 flex items-center justify-center">
                  {mounted && (
                    <span className="iconify mr-1" data-icon="el:plane" />
                  )}
                  Aircraft
                </div>
                <div className="text-[0.75rem] opacity-50 flex items-center justify-center">
                  {mounted && (
                    <span
                      className="iconify mr-1"
                      data-icon="simple-icons:boeing"
                    />
                  )}
                  {aircraftName}
                </div>
              </div>
              <img
                src={cloudUrl}
                alt=""
                className="fc-cloud absolute bottom-4 left-0 h-20 pointer-events-none"
              />
            </div>

            {/* ── Footer items ───────────────────────────────────────────────── */}
            <div className="flex justify-between mt-6 gap-2 relative z-[99]">
              {[
                {
                  label: "Class",
                  value: seatClass,
                  icon: "solar:medal-star-bold-duotone",
                  img: classImageUrl,
                  imgH: "2.5rem",
                  imgCls:
                    "border border-red-400/20 shadow-[0_0_0.5rem_rgba(255,100,100,0.1)]",
                },
                {
                  label: "Seat",
                  value: seatNumber,
                  icon: "ph:seat-fill",
                  img: seatImageUrl,
                  imgH: "3rem",
                  imgCls: "",
                },
                {
                  label: "Luggage",
                  value: luggageCount,
                  icon: "zondicons:travel-case",
                  img: null,
                  imgH: "3rem",
                  imgCls: "",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="fc-foot-item relative rounded-2xl p-3 flex-1"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                >
                  {item.img && (
                    <img
                      src={item.img}
                      alt=""
                      className={`fc-item-hover absolute rounded-lg left-0 ${item.imgCls}`}
                      style={{ height: item.imgH, top: `-${item.imgH}` }}
                    />
                  )}
                  <div className="flex flex-col items-center gap-1 opacity-80 text-[0.75rem]">
                    <span className="flex items-center gap-1 text-[0.75rem] opacity-50">
                      {mounted && (
                        <span className="iconify" data-icon={item.icon} />
                      )}
                      {item.label}
                    </span>
                    <span className="text-[0.7rem] font-semibold tracking-tight mt-1">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── WiFi / Seatbelt row ───────────────────────────────────────────── */}
          <div className="flex justify-between items-center opacity-50 text-[0.6rem] mt-3 px-4 uppercase">
            <div className="flex items-center">
              {mounted && (
                <span
                  className="iconify mr-1"
                  data-icon="material-symbols:wifi-rounded"
                  style={{
                    color: statusColor,
                    filter: `drop-shadow(0 0 1rem ${statusColor})`,
                  }}
                />
              )}
              WIFI ON
            </div>
            <div className="flex items-center">
              {mounted && (
                <span
                  className="iconify mr-1"
                  data-icon="ph:belt-fill"
                  style={{
                    color: "yellow",
                    filter: "drop-shadow(0 0 1rem yellow)",
                  }}
                />
              )}
              fasten seatbelt
            </div>
          </div>

          {/* AudioMotion waveform container */}
          <div
            ref={waveRef}
            className="absolute bottom-0 left-0 w-full -z-10"
            style={{
              height: "15rem",
              opacity: 0.5,
              filter: "saturate(0) blur(0.5rem) brightness(2)",
            }}
          />
        </div>
      </div>

      {/* ── Reload ──────────────────────────────────────────────────────────── */}
      <button
        onClick={() => window.history.go(0)}
        className="mt-4 flex items-center justify-center border border-white/50 rounded-full px-6 py-2 opacity-50 uppercase text-[0.6rem] tracking-wide"
        style={{ background: "black", color: "white", cursor: "pointer" }}
      >
        {mounted && (
          <span className="iconify mr-1" data-icon="ci:arrows-reload-01" />
        )}
        reload
      </button>
    </div>
  );
}
