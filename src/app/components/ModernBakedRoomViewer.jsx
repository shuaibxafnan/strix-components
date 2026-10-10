"use client";

import { useEffect, useState, useRef } from "react";

// ─── ModernBakedRoomViewer ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// modelUrl          string   GLTF Model URL asset source path
// textureUrl        string   Baked JPEG base mapping texture source path
// pageBgColor       string   Tailwind background color container configuration
// grassColor        number   Hexadecimal color override mask for specific nodes
// minCamDistance    number   OrbitControls lower boundary zoom clamp range
// maxCamDistance    number   OrbitControls upper boundary zoom clamp range
// loaderTextColor   string   Tailwind typography color config for loading message
// ──────────────────────────────────────────────────────────────────────────

export default function ModernBakedRoomViewer({
  modelUrl = "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room09/2515f48ad0b678bb7e16821ffb1960e01d35c65d/dist/model.glb",
  textureUrl = "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room09/63b22b78b58af29d8b0d2ca196e241e1e8490fe7/dist/baked.jpg",
  pageBgColor = "bg-[#AFA698]",
  grassColor = 0x3c6436,
  minCamDistance = 50,
  maxCamDistance = 80,
  loaderTextColor = "text-neutral-800",
}) {
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef(null);
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

    // Helper promise chain to cleanly inject standard script requirements
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

    // Sequential asset pipeline initializer script tracking
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js",
      ),
    ])
      .then(() => {
        // Expose global THREE module object configuration mapping reference
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

        // 1. Scene Initialization
        scene = new THREE.Scene();

        // 2. Camera Viewport Calculation Config
        camera = new THREE.PerspectiveCamera(
          10,
          sizes.width / sizes.height,
          0.1,
          1000,
        );
        camera.position.set(50, 35, 50);
        scene.add(camera);
        cameraRef.current = camera;

        // 3. Orbit Controls Instantiation Setup
        controls = new THREE.OrbitControls(camera, canvasRef.current);
        controls.enableDamping = true;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.minDistance = minCamDistance;
        controls.maxDistance = maxCamDistance;
        controlsRef.current = controls;

        // 4. WebGL Renderer Configurations
        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;

        // 5. Textures & Materials Construction
        const textureLoader = new THREE.TextureLoader();
        const bakedTexture = textureLoader.load(textureUrl);
        bakedTexture.flipY = false;
        bakedTexture.encoding = THREE.sRGBEncoding;

        const bakedMaterial = new THREE.MeshBasicMaterial({
          map: bakedTexture,
        });
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: grassColor });

        // 6. Asynchronous GLTF Model Loading Execution Path
        const loader = new THREE.GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
              if (child.isMesh) {
                child.material = bakedMaterial;
                if (child.name === "Pasto") {
                  child.material = cubeMaterial;
                }
              }
            });
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
              "An error occurred loading the GLTF scene metadata:",
              error,
            );
          },
        );

        // 7. Dynamic Viewport Resizing Handler Hook
        const handleResize = () => {
          sizes.width = window.innerWidth;
          sizes.height = window.innerHeight;

          camera.aspect = sizes.width / sizes.height;
          camera.updateProjectionMatrix();

          renderer.setSize(sizes.width, sizes.height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener("resize", handleResize);

        // 8. Cyclical Frame Render Loop Loop Updates
        const tick = () => {
          controls.update();
          renderer.render(scene, camera);
          animationFrameId = window.requestAnimationFrame(tick);
        };
        tick();

        // Clean-up garbage collection routine logic on unmount instances
        return () => {
          window.removeEventListener("resize", handleResize);
          window.cancelAnimationFrame(animationFrameId);
          if (renderer) renderer.dispose();
        };
      })
      .catch((err) =>
        console.error(
          "Script asset initialization chain pipeline failure:",
          err,
        ),
      );
  }, [
    mounted,
    modelUrl,
    textureUrl,
    grassColor,
    minCamDistance,
    maxCamDistance,
  ]);

  // Viewport Control Helper Method for UI Node triggers
  const resetCameraView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(50, 35, 50);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  if (!mounted) {
    return <div className={`fixed inset-0 ${pageBgColor}`} />;
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 ${pageBgColor} select-none overflow-hidden h-screen w-screen cursor-grab active:cursor-grabbing font-mono`}
    >
      {/* Immersive HUD Header Panel Layout */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-lg">
          <h1 className="text-sm font-bold tracking-wider text-neutral-900 uppercase">
            3D Room Spatial View
          </h1>
        </div>

        {isLoaded && (
          <button
            onClick={resetCameraView}
            className="pointer-events-auto bg-neutral-900/80 hover:bg-neutral-900 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-xl border border-neutral-800 transition-all active:scale-95 shadow-md"
          >
            Reset Viewport
          </button>
        )}
      </header>

      {/* Modern Centered Asynchronous Loading Screen Panel Screen */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#AFA698]/90 backdrop-blur-sm transition-opacity duration-500">
          <div className="flex flex-col items-center space-y-4 max-w-xs w-full px-6">
            <h2
              className={`text-base font-bold tracking-widest uppercase animate-pulse ${loaderTextColor}`}
            >
              Assembling Room Assets
            </h2>

            {/* Custom Modern Progress Loading Bar Indicator Structure Container */}
            <div className="w-full h-1.5 bg-neutral-900/10 rounded-full overflow-hidden relative border border-white/10">
              <div
                className="h-full bg-neutral-800 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <span className="text-xs font-bold text-neutral-700">
              {loadingProgress}% Complete
            </span>
          </div>
        </div>
      )}

      {/* Target WebGL Canvas Anchor Node Instance Context mapping target */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full block z-10 outline-none"
      />

      {/* Bottom Sub-Text Ambient Control Instruction Badge HUD */}
      {isLoaded && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/40 backdrop-blur-md border border-white/10 text-white/90 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest shadow-lg pointer-events-none z-20">
          Drag to Orbit • Scroll to Zoom
        </div>
      )}
    </div>
  );
}
