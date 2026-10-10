"use client";

import { useEffect, useRef } from "react";

// ─── RomanMuseum ──────────────────────────────────────────────────────────────

// ── B&W place/architecture images (16:9, Unsplash) ───────────────────────────
const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&sat=-100",
    alt: "colosseum rome",
  },
  {
    src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80&sat=-100",
    alt: "paris streets",
  },
  {
    src: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80&sat=-100",
    alt: "ancient temple",
  },
  {
    src: "https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=800&q=80&sat=-100",
    alt: "greek ruins",
  },
  {
    src: "https://images.unsplash.com/photo-1574087631700-abf928509974?w=800&q=80&sat=-100",
    alt: "roman forum",
  },
  {
    src: "https://images.unsplash.com/photo-1529922849788-c39c99b73d84?w=800&q=80&sat=-100",
    alt: "museum interior",
  },
  {
    src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80&sat=-100",
    alt: "athens acropolis",
  },
  {
    src: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80&sat=-100",
    alt: "rome night",
  },
  {
    src: "https://images.unsplash.com/photo-1568091000692-1c34f8c7abc5?w=800&q=80&sat=-100",
    alt: "gothic cathedral",
  },
  {
    src: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80&sat=-100",
    alt: "louvre paris",
  },
  {
    src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&sat=-100",
    alt: "abbey ruins",
  },
  {
    src: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80&sat=-100",
    alt: "arched corridor",
  },
  {
    src: "https://images.unsplash.com/photo-1543832923-44667a44c804?w=800&q=80&sat=-100",
    alt: "stonehenge",
  },
  {
    src: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=80&sat=-100",
    alt: "pantheon interior",
  },
];

// ── UMD scripts — loaded sequentially, all attach to window.THREE ─────────────
// Must be in this exact order: core → shaders → passes
const SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
  "https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js",
  "https://unpkg.com/three@0.128.0/examples/js/shaders/CopyShader.js",
  "https://unpkg.com/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js",
  "https://unpkg.com/three@0.128.0/examples/js/postprocessing/EffectComposer.js",
  "https://unpkg.com/three@0.128.0/examples/js/postprocessing/RenderPass.js",
  "https://unpkg.com/three@0.128.0/examples/js/postprocessing/ShaderPass.js",
  "https://unpkg.com/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js",
];

export default function RomanMuseum() {
  const canvasRef = useRef(null);
  const preloaderRef = useRef(null);
  const disposeRef = useRef(null);

  useEffect(() => {
    // Deduplicating script loader — same pattern across all strix-components
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

    let cancelled = false;

    const bootstrap = async () => {
      for (const src of SCRIPTS) {
        await loadScript(src);
        if (cancelled) return;
      }

      const THREE = window.THREE;
      const { gsap } = window;
      if (!THREE || !gsap || !canvasRef.current) return;

      gsap.registerPlugin(window.ScrollTrigger);

      // ── Scene ────────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      const canvas = canvasRef.current;

      // ── Group for torus + model (rotate together on scroll) ──────────────────
      const group = new THREE.Group();
      scene.add(group);

      // ── Torus with emissive wireframe ────────────────────────────────────────
      const geometry = new THREE.TorusGeometry(0.2, 0.04, 4, 20);
      const material = new THREE.MeshStandardMaterial({
        color: 0x2555fd,
        emissive: 0x2555fd,
        emissiveIntensity: 5,
        wireframe: true,
      });
      const torus = new THREE.Mesh(geometry, material);
      torus.position.set(0, 1.8, 0);
      group.add(torus);

      // ── Lights (tuned for sRGB + ACESFilmic — intensities scaled down
      //    from originals which were calibrated for linear/no-toneMapping) ──────
      const torusLight = new THREE.PointLight(0xffffff, 0.01, 0.25, 0.0004);
      torusLight.position.set(0, 1.8, -2);
      scene.add(torusLight);

      // spotLight: original 17 — in sRGB+ACES that blows the model out, use 8
      const spotLight = new THREE.SpotLight(0xffffff, 8, 100, 10, 10);
      spotLight.position.set(0, 3, 0.5);
      spotLight.castShadow = true;
      scene.add(spotLight);

      // rimLight: original 20 — scaled to 6 for correct appearance
      const rimLight = new THREE.PointLight(0xffffff, 6, 1, 1.5);
      rimLight.position.set(1, 1, 1);
      scene.add(rimLight);

      // ── Sizes / Camera ───────────────────────────────────────────────────────
      const sizes = { width: window.innerWidth, height: window.innerHeight };
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
      );
      camera.position.set(0, 2, 2);
      scene.add(camera);

      // ── Renderer — sRGB + ACESFilmic fixes the washed-out / wrong-colour model
      const renderer = new THREE.WebGLRenderer({ canvas });
      renderer.shadowMap.enabled = true;
      renderer.outputEncoding = THREE.sRGBEncoding; // correct gamma
      renderer.toneMapping = THREE.ACESFilmicToneMapping; // faithful colours
      renderer.toneMappingExposure = 1.0;
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // ── GSAP scroll: group rotation + camera dolly ───────────────────────────
      gsap.to(group.rotation, {
        y: "+=6.28",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      gsap.to(camera.position, {
        y: 1,
        z: 1.7,
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // ── EffectComposer + UnrealBloom ─────────────────────────────────────────
      // threshold 0.85 → only the emissive torus (brightness > 0.85) glows;
      // the model's diffuse surfaces stay at natural colour
      const composer = new THREE.EffectComposer(renderer);
      composer.setSize(sizes.width, sizes.height);
      composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      composer.addPass(new THREE.RenderPass(scene, camera));
      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(sizes.width, sizes.height),
        0.6, // strength  — was 1, reduced so model isn't blown out
        1.0, // radius
        0.85, // threshold — only catches the bright emissive torus
      );
      composer.addPass(bloomPass);

      // ── GLTF model ───────────────────────────────────────────────────────────
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load(
        "https://raw.githubusercontent.com/Sabur-Ahemad/roman-godess-3d/main/flora/scene.gltf",
        (gltf) => {
          const mesh = gltf.scene;
          mesh.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          mesh.position.set(0, 10.8, -15);
          group.add(mesh);

          if (preloaderRef.current) {
            gsap.to(preloaderRef.current, {
              scale: 1.5,
              opacity: 0,
              duration: 0.5,
              ease: "linear",
              onComplete: () => {
                if (preloaderRef.current) preloaderRef.current.remove();
              },
            });
          }
        },
        undefined,
        (err) => console.error("[RomanMuseum] GLTF error:", err),
      );

      // ── Gallery parallax / opacity reveal ────────────────────────────────────
      document.querySelectorAll(".img-main").forEach((img) => {
        gsap.to(img, {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      });

      // ── Banner + gallery entrance on load ────────────────────────────────────
      gsap.from(".banner-section", {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: "power2.out",
      });
      gsap.from(".images-container .img", {
        opacity: 0,
        scale: 0.8,
        stagger: 0.2,
        duration: 1.2,
        ease: "power2.out",
      });

      // ── Resize ───────────────────────────────────────────────────────────────
      const onResize = () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        composer.setSize(sizes.width, sizes.height);
        composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      };
      window.addEventListener("resize", onResize);

      // ── Tick loop ────────────────────────────────────────────────────────────
      let time = 0;
      let animId;
      const animationParams = {
        flickerSpeed: 0.02,
        flickerIntensity: 10,
        rotationSpeed: 1,
      };
      const tick = () => {
        if (cancelled) return;
        time += animationParams.flickerSpeed;
        torusLight.intensity =
          torusLight.intensity +
          Math.sin(time) * animationParams.flickerIntensity;
        torus.rotation.z += 0.01 * animationParams.rotationSpeed;
        renderer.render(scene, camera);
        composer.render();
        animId = window.requestAnimationFrame(tick);
      };
      tick();

      disposeRef.current = () => {
        cancelled = true;
        cancelAnimationFrame(animId);
        renderer.dispose();
        window.removeEventListener("resize", onResize);
        window.ScrollTrigger?.getAll().forEach((t) => t.kill());
      };
    };

    bootstrap().catch((e) =>
      console.error("[RomanMuseum] bootstrap error:", e),
    );
    return () => {
      cancelled = true;
      disposeRef.current?.();
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Golos+Text:wght@400..900&display=swap');

        *                                       { margin: 0; padding: 0; box-sizing: border-box; }
        img                                     { width: 100%; height: auto; }
        button, a                               { border: 1px solid transparent; background: transparent; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #EBEBEB; }
        body                                    { font-family: "Golos Text"; }
        .webgl                                  { position: fixed; left: 0; top: 0; width: 100vw; height: 100dvh; z-index: -1; }
        .banner-section                         { max-width: 1122px; margin: 0 auto; text-align: center; }
        h1                                      { font-size: 100px; line-height: 140px; color: white; font-weight: 900; text-transform: uppercase; }
        p                                       { color: #949494; }
        .banner-section a                       { display: flex; align-items: center; gap: 4px; color: #D6F844; position: relative; max-width: fit-content; margin: 30px auto 0; font-weight: 500; text-transform: uppercase; }
        .banner-section a img                   { width: 18px; aspect-ratio: 1; transition: all ease-in-out 0.15s; transform-origin: center; }
        .banner-section a::after                { content: ''; position: absolute; right: 0; top: calc(100% + 2px); width: 0%; height: 1px; background: #D6F844; transition: all ease-in-out 0.15s; }
        .banner-section a:hover:after           { width: 100%; left: 0; right: unset; }
        .banner-section a:hover img             { transform: rotate(45deg); }
        .images-container                       { display: flex; justify-content: space-between; flex-wrap: wrap; padding: 100px 40px; }
        .images-container .img                  { width: 100%; display: flex; }
        .images-container .img:nth-child(even)  { justify-content: end; }
        .images-container img                   { aspect-ratio: 16 / 9; object-fit: cover; transition: all ease 1s; }
        .img-main                               { max-width: 30vw; width: 100%; border: 1px solid transparent; overflow: hidden; position: relative; line-height: 0; opacity: 0; transition: all ease-in-out 0.15s; }
        .img-main:hover:after                   { content: ''; position: absolute; top: -100%; left: -100%; height: 200%; width: 200%; background: linear-gradient(to bottom right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%); animation: slide 1s forwards; filter: blur(33px); }
        @keyframes slide                        { from { top: -100%; left: -100%; } to { top: 100%; left: 100%; } }
        .img-main:hover img                     { transform: scale(1.2); }
        .img-main:hover                         { border-color: #5599FF; }
        section                                 { min-height: 100vh; }
        #preloader                              { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1001; }
        .loader-info-text                       { position: absolute; left: 50%; transform: translate(-50%, -50%); top: 70%; font-size: 1rem; line-height: 1; font-weight: 400; color: #D6F844; }

        @media screen and (max-width: 1024px)   { h1 { font-size: 80px; line-height: 120px; } }
        @media screen and (max-width: 768px)    { h1 { font-size: 60px; line-height: 80px; } .banner-section { padding: 0 20px; } .images-container { padding: 40px 20px; flex-direction: column; align-items: center; gap: 30px; } .img-main { max-width: 35vw; } }
        @media screen and (max-width: 575px)    { .img-main { max-width: 50vw; width: 100%; } }
        @media screen and (max-width: 480px)    { h1 { font-size: 40px; line-height: 50px; } .banner-section { padding: 0 15px; } .banner-section a { margin: 20px auto 0; font-size: 14px; } .images-container { padding: 40px 15px; gap: 20px; } }
        @media screen and (max-width: 360px)    { h1 { font-size: 32px; line-height: 40px; } .banner-section { padding: 0 10px; } .images-container { padding: 30px 10px; } }
        @media screen and (max-height: 500px) and (orientation: landscape) { h1 { font-size: 50px; line-height: 60px; } .banner-section { margin-top: 20px; } }
      `}</style>

      {/* Three.js canvas */}
      <canvas ref={canvasRef} className="webgl" />

      {/* Preloader */}
      <div ref={preloaderRef} id="preloader" style={{ display: "block" }}>
        <p className="loader-info-text">
          Please wait while the model is loading...
        </p>
      </div>

      <main>
        {/* ── Banner — no header above it ────────────────────────────────────── */}
        <section>
          <div className="banner-section">
            <h1>delve into relics</h1>
            <p>
              Welcome to the relics museum, where history and art come to life.
              Explore our diverse collection of artifacts, paintings, and
              sculptures, each with its own unique story to tell, Plan your
              visit and book tickets online.
            </p>
            <a href="#">
              plan your visit
              <img
                src="https://webprojects.cloud/r&d/roman-structure/images/arrow-green.svg"
                alt="arrow"
              />
            </a>
          </div>
        </section>

        {/* ── Gallery ────────────────────────────────────────────────────────── */}
        <section className="images-container">
          {IMAGES.map(({ src, alt }, i) => (
            <div key={i} className="img">
              <div className="img-main">
                <img src={src} alt={alt} />
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
