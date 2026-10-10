"use client";

import { useEffect, useState, useRef } from "react";

// ─── ModernIsometricRoomViewer ───────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// modelUrl          string   GLTF Model URL target source mapping
// textureUrl        string   Baked JPEG base mapping layout source
// pageBgColor       string   Tailwind background color layout container
// cameraFov         number   30        PerspectiveCamera field of view config
// minCamDistance    number   10        OrbitControls strict zoom in clamp
// maxCamDistance    number   20        OrbitControls strict zoom out clamp
// ──────────────────────────────────────────────────────────────────────────

export default function ModernIsometricRoomViewer({
  modelUrl = "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room01/98fd8d7909308ec03a596928a394bb25ed9239f1/THREEJS2.glb",
  textureUrl = "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room01/98fd8d7909308ec03a596928a394bb25ed9239f1/baked.jpg",
  pageBgColor = "bg-[#383B50]",
  cameraFov = 30,
  minCamDistance = 10,
  maxCamDistance = 20,
}) {
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let THREE;
    let animationFrameId;
    let scene, camera, renderer, controls;

    // Async third-party module element generator
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Sequential script dependency resolving pipeline
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js",
      ),
    ])
      .then(() => {
        THREE = window.THREE;
        return Promise.all([
          loadScript(
            "https://unpkg.com/three@0.126.0/examples/js/loaders/GLTFLoader.js",
          ),
          loadScript(
            "https://unpkg.com/three@0.126.0/examples/js/controls/OrbitControls.js",
          ),
        ]);
      })
      .then(() => {
        if (!canvasRef.current) return;

        const sizes = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        // 1. Scene setup
        scene = new THREE.Scene();

        // 2. Camera Viewport Matrix Configuration
        camera = new THREE.PerspectiveCamera(
          cameraFov,
          sizes.width / sizes.height,
          0.1,
          100,
        );
        camera.position.set(18, 10, 20);
        scene.add(camera);
        cameraRef.current = camera;

        // 3. Constrained Orbit Controls Mapping Setup
        controls = new THREE.OrbitControls(camera, canvasRef.current);
        controls.enableDamping = true;
        controls.enableZoom = true;
        controls.enablePan = false; // Preserving code logic block override rules
        controls.minDistance = minCamDistance;
        controls.maxDistance = maxCamDistance;

        // Exact mathematical angle boundaries from source script
        controls.minPolarAngle = Math.PI / 4;
        controls.maxPolarAngle = Math.PI / 2.25;
        controls.minAzimuthAngle = -Math.PI / 16;
        controls.maxAzimuthAngle = Math.PI / 2;

        controlsRef.current = controls;

        // 4. WebGL Native Rendering Setup Contexts
        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;

        // 5. Texture Matrix Asset Load Processing
        const textureLoader = new THREE.TextureLoader();
        const bakedTexture = textureLoader.load(textureUrl);
        bakedTexture.flipY = false;
        bakedTexture.encoding = THREE.sRGBEncoding;

        const bakedMaterial = new THREE.MeshBasicMaterial({
          map: bakedTexture,
          side: THREE.DoubleSide,
        });

        // 6. Asynchronous GLTF Model Mesh Processing Architecture
        const loader = new THREE.GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
              if (child.isMesh) {
                child.material = bakedMaterial;
              }
            });
            // Match the precise local positioning coordinates specified
            scene.position.set(0, -2, 0);
            scene.add(model);
            setIsLoaded(true);
          },
          (xhr) => {
            if (xhr.total > 0) {
              const percent = Math.round((xhr.loaded / xhr.total) * 100);
              setLoadingProgress(percent);
            }
          },
          (error) => {
            console.error(
              "An error occurred during GLTF compilation loops:",
              error,
            );
          },
        );

        // 7. Dynamic Matrix Window Resizing System
        const handleResize = () => {
          sizes.width = window.innerWidth;
          sizes.height = window.innerHeight;

          camera.aspect = sizes.width / sizes.height;
          camera.updateProjectionMatrix();

          renderer.setSize(sizes.width, sizes.height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener("resize", handleResize);

        // 8. Recursive Engine Animation Loop Execution
        const tick = () => {
          controls.update();
          renderer.render(scene, camera);
          animationFrameId = window.requestAnimationFrame(tick);
        };
        tick();

        // Standard React side-effect dismantling engine garbage cleanup mapping rules
        return () => {
          window.removeEventListener("resize", handleResize);
          window.cancelAnimationFrame(animationFrameId);
          if (renderer) renderer.dispose();
        };
      })
      .catch((err) =>
        console.error(
          "Isometric Room asset script loader pipelines failed:",
          err,
        ),
      );
  }, [
    mounted,
    modelUrl,
    textureUrl,
    cameraFov,
    minCamDistance,
    maxCamDistance,
  ]);

  const resetCameraView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(18, 10, 20);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  if (!mounted) {
    return <div className={`fixed inset-0 ${pageBgColor}`} />;
  }

  return (
    <div
      className={`fixed inset-0 ${pageBgColor} select-none overflow-hidden h-screen w-screen cursor-grab active:cursor-grabbing font-mono`}
    >
      {/* Sleek Cinematic Header Control Deck */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 pointer-events-none">
        <div className="bg-neutral-900/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-xl">
          <h1 className="text-xs font-bold tracking-[0.2em] text-white uppercase">
            Isometric Studio Canvas
          </h1>
        </div>

        {isLoaded && (
          <button
            onClick={resetCameraView}
            className="pointer-events-auto bg-white/90 hover:bg-white text-neutral-950 text-xs font-bold tracking-wide px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-md"
          >
            Reset Camera
          </button>
        )}
      </header>

      {/* Modern Glass Loading Shield Screen */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#383B50]/95 backdrop-blur-md transition-opacity duration-500">
          <div className="flex flex-col items-center space-y-4 max-w-[240px] w-full px-4">
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-white/80 animate-pulse">
              Parsing Volumetrics
            </h2>

            {/* Minimalist Micro Progress Tracking Layout Bar Component */}
            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <span className="text-[10px] font-bold text-white/50 tracking-wider">
              {loadingProgress}% Loaded
            </span>
          </div>
        </div>
      )}

      {/* Structural Anchor Target Layer Canvas Element for ThreeJS Engine Instance */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full block z-10 outline-none"
      />

      {/* Interaction Help Floating UI Tag Component Overlay */}
      {isLoaded && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.15em] shadow-2xl pointer-events-none z-20">
          Orbit Constrained By Scene Matrix Boundaries
        </div>
      )}
    </div>
  );
}
