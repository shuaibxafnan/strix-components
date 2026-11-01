"use client";

import { useEffect, useState, useRef } from "react";

export default function BakedRoomViewer({
  modelUrl = "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room09/2515f48ad0b678bb7e16821ffb1960e01d35c65d/dist/model.glb",
  textureUrl = "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room09/63b22b78b58af29d8b0d2ca196e241e1e8490fe7/dist/baked.jpg",
  pageBgColor = "bg-[#AFA698]",
  loaderBgColor = "rgba(175,166,152,0.9)",
  grassColor = 0x3c6436,
  minCamDistance = 50,
  maxCamDistance = 80,
  loaderTextColor = "text-neutral-800",
  loaderTitle = "Assembling Room Assets",
  loaderProgressLabel = "% Complete",
  resetLabel = "Reset Viewport",
  hintText = "Drag to Orbit • Scroll to Zoom",
  className = "",
}) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let animationFrameId;
    let cleanup = () => {};

    const init = async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );
      if (cancelled || !canvasRef.current) return;

      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        10,
        sizes.width / sizes.height,
        0.1,
        1000,
      );
      camera.position.set(50, 35, 50);
      scene.add(camera);
      cameraRef.current = camera;

      const controls = new OrbitControls(camera, canvasRef.current);
      controls.enableDamping = true;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.minDistance = minCamDistance;
      controls.maxDistance = maxCamDistance;
      controlsRef.current = controls;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const textureLoader = new THREE.TextureLoader();
      const bakedTexture = textureLoader.load(textureUrl);
      bakedTexture.flipY = false;
      bakedTexture.colorSpace = THREE.SRGBColorSpace;

      const bakedMaterial = new THREE.MeshBasicMaterial({
        map: bakedTexture,
      });
      const cubeMaterial = new THREE.MeshBasicMaterial({ color: grassColor });

      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          if (cancelled) return;
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
            setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (error) => {
          console.error("An error occurred loading the GLTF scene:", error);
        },
      );

      const handleResize = () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      };
      window.addEventListener("resize", handleResize);

      const tick = () => {
        controls.update();
        renderer.render(scene, camera);
        animationFrameId = window.requestAnimationFrame(tick);
      };
      tick();

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        window.cancelAnimationFrame(animationFrameId);
        controls.dispose();
        bakedTexture.dispose();
        bakedMaterial.dispose();
        cubeMaterial.dispose();
        renderer.dispose();
      };
    };

    init().catch((err) => console.error("Room viewer init failed:", err));

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [modelUrl, textureUrl, grassColor, minCamDistance, maxCamDistance]);

  const resetCameraView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(50, 35, 50);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  return (
    <div
      className={`fixed inset-0 ${pageBgColor} select-none overflow-hidden h-screen w-screen cursor-grab active:cursor-grabbing font-mono ${className}`}
    >
      {isLoaded && (
        <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-end items-center z-20 pointer-events-none">
          <button
            onClick={resetCameraView}
            className="pointer-events-auto bg-neutral-900/80 hover:bg-neutral-900 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-xl border border-neutral-800 transition-all active:scale-95 shadow-md"
          >
            {resetLabel}
          </button>
        </header>
      )}

      {!isLoaded && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-30 backdrop-blur-sm transition-opacity duration-500"
          style={{ backgroundColor: loaderBgColor }}
        >
          <div className="flex flex-col items-center space-y-4 max-w-xs w-full px-6">
            <h2
              className={`text-base font-bold tracking-widest uppercase animate-pulse text-center ${loaderTextColor}`}
            >
              {loaderTitle}
            </h2>
            <div className="w-full h-1.5 bg-neutral-900/10 rounded-full overflow-hidden relative border border-white/10">
              <div
                className="h-full bg-neutral-800 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-neutral-700">
              {loadingProgress}
              {loaderProgressLabel}
            </span>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full block z-10 outline-none"
      />

      {isLoaded && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[90vw] text-center bg-neutral-900/40 backdrop-blur-md border border-white/10 text-white/90 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest shadow-lg pointer-events-none z-20">
          {hintText}
        </div>
      )}
    </div>
  );
}
