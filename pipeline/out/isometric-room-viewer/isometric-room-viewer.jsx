"use client";

import { useEffect, useRef, useState } from "react";

export default function IsometricRoomViewer({
  modelUrl = "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room01/98fd8d7909308ec03a596928a394bb25ed9239f1/THREEJS2.glb",
  textureUrl = "https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room01/98fd8d7909308ec03a596928a394bb25ed9239f1/baked.jpg",
  bgColor = "#383B50",
  cameraFov = 30,
  minCamDistance = 10,
  maxCamDistance = 20,
  title = "Isometric Studio Canvas",
  resetLabel = "Reset Camera",
  loadingLabel = "Parsing Volumetrics",
  loadedLabel = "% Loaded",
  hint = "Orbit Constrained By Scene Matrix Boundaries",
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
    let renderer;
    let controls;
    let handleResize;
    let bakedTexture;
    let bakedMaterial;

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
        cameraFov,
        sizes.width / sizes.height,
        0.1,
        100,
      );
      camera.position.set(18, 10, 20);
      scene.add(camera);
      cameraRef.current = camera;

      controls = new OrbitControls(camera, canvasRef.current);
      controls.enableDamping = true;
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.minDistance = minCamDistance;
      controls.maxDistance = maxCamDistance;
      controls.minPolarAngle = Math.PI / 4;
      controls.maxPolarAngle = Math.PI / 2.25;
      controls.minAzimuthAngle = -Math.PI / 16;
      controls.maxAzimuthAngle = Math.PI / 2;
      controlsRef.current = controls;

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const textureLoader = new THREE.TextureLoader();
      bakedTexture = textureLoader.load(textureUrl);
      bakedTexture.flipY = false;
      bakedTexture.colorSpace = THREE.SRGBColorSpace;

      bakedMaterial = new THREE.MeshBasicMaterial({
        map: bakedTexture,
        side: THREE.DoubleSide,
      });

      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          if (cancelled) return;
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.material = bakedMaterial;
            }
          });
          scene.position.set(0, -2, 0);
          scene.add(model);
          setIsLoaded(true);
        },
        (xhr) => {
          if (!cancelled && xhr.total > 0) {
            setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (error) => {
          console.error(error);
        },
      );

      handleResize = () => {
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
    };

    init().catch((err) => console.error(err));

    return () => {
      cancelled = true;
      if (handleResize) window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrameId);
      if (controls) controls.dispose();
      if (bakedTexture) bakedTexture.dispose();
      if (bakedMaterial) bakedMaterial.dispose();
      if (renderer) renderer.dispose();
    };
  }, [modelUrl, textureUrl, cameraFov, minCamDistance, maxCamDistance]);

  const resetCameraView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(18, 10, 20);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`fixed inset-0 select-none overflow-hidden h-screen w-screen cursor-grab active:cursor-grabbing font-mono ${className}`}
    >
      <header className="absolute top-0 left-0 right-0 p-3 sm:p-6 flex justify-between items-center gap-2 z-20 pointer-events-none">
        <div className="bg-neutral-900/40 backdrop-blur-md border border-white/10 px-3 sm:px-4 py-2 rounded-xl shadow-xl">
          <h1 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white uppercase">
            {title}
          </h1>
        </div>

        {isLoaded && (
          <button
            onClick={resetCameraView}
            className="pointer-events-auto bg-white/90 hover:bg-white text-neutral-950 text-xs font-bold tracking-wide px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-md"
          >
            {resetLabel}
          </button>
        )}
      </header>

      {!isLoaded && (
        <div
          style={{ backgroundColor: bgColor }}
          className="absolute inset-0 flex flex-col items-center justify-center z-30 backdrop-blur-md transition-opacity duration-500"
        >
          <div className="flex flex-col items-center space-y-4 max-w-[240px] w-full px-4">
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-white/80 animate-pulse">
              {loadingLabel}
            </h2>
            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-white/50 tracking-wider">
              {loadingProgress}
              {loadedLabel}
            </span>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full block z-10 outline-none"
      />

      {isLoaded && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[90vw] text-center bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.15em] shadow-2xl pointer-events-none z-20">
          {hint}
        </div>
      )}
    </div>
  );
}
