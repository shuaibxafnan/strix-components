"use client";

import { useEffect, useRef } from "react";

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

const STYLES = `
  @import url("https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap");
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

  .sch-font { font-family: "Oswald", sans-serif; }

  .sch-nav-link {
    position: relative;
    font-weight: 500;
    text-transform: uppercase;
    text-decoration: none;
    color: inherit;
  }
  .sch-nav-link::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: currentColor;
    transition: width 0.5s;
  }
  .sch-nav-link:hover::after { width: 100%; }

  .sch-right-h1 {
    position: relative;
    padding-right: 60px;
    text-align: right;
    margin-bottom: 20px;
  }
  .sch-right-h1::after {
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

export default function SphereCollisionHero({
  brandName = "Festivity",
  navLinks = DEFAULT_NAV,
  tagline = "Dynamic Collisions",
  leftLabel = "X",
  leftTitle = "Pink & Rose Gold",
  leftSubtitle = "Lighting & Material Study",
  rightLabel = "01",
  socialLinks = DEFAULT_SOCIAL,
  socialLabel = "Social Links",
  topDescTitle = "Dispersion Collisions",
  topDescSub = "Research & Development",
  rotatedText = "Drag cursor to interact",
  sphereColor = "#c7a5a5",
  sphereEmissive = "#ff0000",
  bgGradient = "linear-gradient(to right,#fbfaff 0%,#fbfaff 80%,#ecf0fb 100%)",
  textColor = "#101117",
  cameraZ = 24,
  cameraFov = 25,
  ambientIntensity = 1.0,
  spotIntensity = 0.52,
  breathingAmp = 0.1,
  breathingSpeed = 0.002,
  repulseStrength = 0.2,
  revolutionDur = 2,
  staggerDelay = 0.02,
  className = "",
}) {
  const canvasRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const overlayRef = useRef(null);
  const mainTxtRef = useRef(null);
  const rotatedRef = useRef(null);
  const cursorWrapRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { OrbitControls }, gsapModule] = await Promise.all([
        import("three"),
        import("three/examples/jsm/controls/OrbitControls.js"),
        import("gsap"),
      ]);
      if (disposed || !canvasRef.current) return;
      const gsap = gsapModule.gsap || gsapModule.default;

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

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      const material = new THREE.MeshLambertMaterial({
        color: sphereColor,
        emissive: sphereEmissive,
      });
      const group = new THREE.Group();
      const spheres = [];
      const geometries = [];

      POSITIONS.forEach((pos, i) => {
        const radius = RADII[i];
        const geometry = new THREE.SphereGeometry(radius, 64, 64);
        geometries.push(geometry);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(pos.x, pos.y, pos.z);
        sphere.userData = { originalPosition: { ...pos }, radius };
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        spheres.push(sphere);
        group.add(sphere);
      });
      scene.add(group);

      scene.add(new THREE.AmbientLight(0xffffff, ambientIntensity));

      const spotLight = new THREE.SpotLight(0xffffff, spotIntensity);
      spotLight.position.set(14, 24, 30);
      spotLight.castShadow = true;
      scene.add(spotLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
      dirLight.position.set(0, -4, 0);
      scene.add(dirLight);

      const INIT_Y = -25;
      const REVOLUTION_R = 4;
      const timelines = [];

      spheres.forEach((sphere, i) => {
        sphere.position.y = INIT_Y;

        const tl = gsap
          .timeline({ delay: i * staggerDelay })
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
          .to(sphere.position, {
            duration: 0.6,
            x: sphere.userData.originalPosition.x,
            y: sphere.userData.originalPosition.y,
            z: sphere.userData.originalPosition.z,
            ease: "power1.out",
          });
        timelines.push(tl);
      });

      const revealDelay = (revolutionDur + 1) * 1000;
      let loadingComplete = false;

      const revealTimer = setTimeout(() => {
        loadingComplete = true;
        if (overlayRef.current) overlayRef.current.style.opacity = "1";
        if (rotatedRef.current) rotatedRef.current.style.opacity = "1";
        if (mainTxtRef.current) mainTxtRef.current.style.opacity = "0";
      }, revealDelay);

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

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const tempVector = new THREE.Vector3();
      const forces = new Map();

      function onMouseMove(e) {
        xDot(e.clientX);
        yDot(e.clientY);
        xRing(e.clientX);
        yRing(e.clientY);

        if (cursorWrapRef.current) cursorWrapRef.current.style.opacity = "1";

        if (!loadingComplete) return;

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

      let rafId;
      function animate() {
        rafId = requestAnimationFrame(animate);

        if (loadingComplete) {
          const t = Date.now() * breathingSpeed;
          spheres.forEach((sphere, i) => {
            const offset = i * 0.2;
            const breathingY = Math.sin(t + offset) * breathingAmp;
            const breathingZ = Math.cos(t + offset) * breathingAmp * 0.5;

            const force = forces.get(sphere.uuid);
            if (force) {
              sphere.position.add(force);
              force.multiplyScalar(0.95);
              if (force.length() < 0.01) forces.delete(sphere.uuid);
            }

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

      function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", onResize);

      cleanup = () => {
        clearTimeout(revealTimer);
        cancelAnimationFrame(rafId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        timelines.forEach((tl) => tl.kill());
        gsap.killTweensOf([cursorDotRef.current, cursorRingRef.current]);
        controls.dispose();
        geometries.forEach((g) => g.dispose());
        material.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [
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

  return (
    <div
      className={`sch-font relative w-full min-h-screen overflow-x-hidden text-[16px] leading-[1.3] ${className}`}
      style={{ background: bgGradient, color: textColor }}
    >
      <style>{STYLES}</style>

      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      <div
        ref={cursorWrapRef}
        className="fixed top-0 left-0 pointer-events-none select-none hidden lg:block"
        style={{ zIndex: 111111, opacity: 0 }}
      >
        <div
          ref={cursorDotRef}
          className="absolute w-[10px] h-[10px] rounded-full bg-current"
          style={{ left: 0, top: 0, transition: "all 0.05s" }}
        />
        <div
          ref={cursorRingRef}
          className="absolute w-[40px] h-[40px] rounded-full border border-current"
          style={{ left: 0, top: 0, transition: "all 0.1s" }}
        />
      </div>

      <h1
        ref={mainTxtRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(56px,16vw,160px)] uppercase tracking-[-4px] font-black pointer-events-none select-none max-w-full"
        style={{ zIndex: 1, transition: "opacity 0.5s ease-in-out" }}
      >
        {brandName}
      </h1>

      <div
        ref={overlayRef}
        className="relative w-full pointer-events-none"
        style={{
          opacity: 0,
          transition: "opacity 0.5s ease-in-out",
          zIndex: 10,
        }}
      >
        <header>
          <div className="flex justify-between items-center px-5 py-4">
            <a
              href="#"
              className="sch-font text-[42px] font-black tracking-[-1px] uppercase text-inherit no-underline pointer-events-auto"
            >
              {brandName}
            </a>

            <nav className="hidden md:block">
              <ul className="flex gap-[120px] items-center lg:gap-[80px] xl:gap-[120px]">
                {navLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="sch-nav-link pointer-events-auto"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <button className="bg-transparent border-0 cursor-pointer pointer-events-auto md:hidden">
              <i className="fa-solid fa-bars text-[24px] leading-none" />
            </button>
          </div>
        </header>

        <section>
          <div
            className="flex flex-col justify-between gap-[10px] px-5 pt-[100px] pb-[30px]"
            style={{ minHeight: "calc(100dvh - 90px)" }}
          >
            <div>
              <h5 className="text-[16px] font-semibold mb-1">{topDescTitle}</h5>
              <h6 className="text-[14px] font-normal mb-2">{topDescSub}</h6>
              <span className="inline-block w-5 h-[3px] bg-current rounded-full" />
            </div>

            <div className="flex justify-between items-end gap-2">
              <div>
                <h1 className="text-[64px] sm:text-[88px] font-black mb-5 leading-none md:text-[100px] lg:text-[140px] xl:text-[160px]">
                  {leftLabel}
                </h1>
                <div>
                  <h5 className="text-[16px] font-medium mb-1">{leftTitle}</h5>
                  <h6 className="text-[14px] font-normal">{leftSubtitle}</h6>
                </div>
              </div>

              <div className="hidden md:block">
                <h2 className="text-[34px] uppercase tracking-[-2px] md:text-[20px] lg:text-[28px] xl:text-[34px]">
                  {tagline}
                </h2>
              </div>

              <div>
                <h1 className="sch-right-h1 text-[64px] sm:text-[88px] font-black leading-none md:text-[100px] lg:text-[140px] xl:text-[160px]">
                  {rightLabel}
                </h1>
                <div className="flex flex-wrap gap-x-[30px] gap-y-2 items-center">
                  <span className="uppercase text-[14px]">{socialLabel}</span>
                  <ul className="flex gap-2">
                    {socialLinks.map((s, i) => (
                      <li key={i}>
                        <a
                          href={s.href}
                          className="text-inherit no-underline pointer-events-auto"
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

      <span
        ref={rotatedRef}
        className="fixed top-1/2 right-5 uppercase text-[14px] pointer-events-none select-none hidden md:block"
        style={{
          transform: "translate(45%, -600%) rotate(90deg)",
          zIndex: 10,
          opacity: 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        {rotatedText}
      </span>
    </div>
  );
}
