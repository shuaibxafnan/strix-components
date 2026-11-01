"use client";

import { useEffect, useId, useRef, useState } from "react";

const IMG = {
  introBack: `https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80`,
  introFront: `https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80`,
  dosFront: `https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80`,
  dosBack: `https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80`,
  tresFront: `https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80`,
  tresBack: `https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80`,
  grid: [
    `https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80`,
    `https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80`,
    `https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80`,
    `https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80`,
  ],
  last: `https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80`,
};

const DEFAULT_CONTROLS = [
  { label: "Vertical", angle: 90 },
  { label: "Angled", angle: 17 },
  { label: "Horizontal", angle: 0 },
];

const VERTEX_SHADER = `
uniform float angle;
uniform float progress;
uniform float uRolls;
uniform float uRadius;
uniform float uShadow;
varying vec2 vUv;
varying float vFrontShadow;
mat4 rotationMatrix(vec3 axis, float a) {
  axis = normalize(axis);
  float s = sin(a);
  float c = cos(a);
  float oc = 1.0 - c;
  return mat4(
    oc * axis.x * axis.x + c,          oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
    oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c,          oc * axis.y * axis.z - axis.x * s, 0.0,
    oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c,          0.0,
    0.0, 0.0, 0.0, 1.0
  );
}
vec3 rotate(vec3 v, vec3 axis, float a) {
  return (rotationMatrix(axis, a) * vec4(v, 1.0)).xyz;
}
void main() {
  vUv = uv;
  float pi = 3.14159265359;
  float finalAngle = angle;
  vec3 newposition = position;
  float rad = uRadius;
  float rolls = uRolls;
  newposition = rotate(newposition - vec3(-0.5, 0.5, 0.0), vec3(0.0, 0.0, 1.0), -finalAngle) + vec3(-0.5, 0.5, 0.0);
  float offs = (newposition.x + 0.5) / (sin(finalAngle) + cos(finalAngle));
  float tProgress = clamp((progress - offs * 0.99) / 0.01, 0.0, 1.0);
  vFrontShadow = clamp((progress - offs * 0.95) / 0.05, 1.0 - uShadow, 1.0);
  newposition.z = rad + rad * (1.0 - offs / 2.0) * sin(-offs * rolls * pi - 0.5 * pi);
  newposition.x = -0.5 + rad * (1.0 - offs / 2.0) * cos(-offs * rolls * pi + 0.5 * pi);
  newposition = rotate(newposition - vec3(-0.5, 0.5, 0.0), vec3(0.0, 0.0, 1.0), finalAngle) + vec3(-0.5, 0.5, 0.0);
  newposition = rotate(newposition - vec3(-0.5, 0.5, rad), vec3(sin(finalAngle), cos(finalAngle), 0.0), -pi * progress * rolls);
  newposition += vec3(
    -0.5 + progress * cos(finalAngle) * (sin(finalAngle) + cos(finalAngle)),
    0.5 - progress * sin(finalAngle) * (sin(finalAngle) + cos(finalAngle)),
    rad * (1.0 - progress / 2.0)
  );
  vec3 finalposition = mix(newposition, position, tProgress);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalposition, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying float vFrontShadow;
void main() {
  vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
  gl_FragColor = texture2D(texture1, newUV);
  gl_FragColor.rgb *= vFrontShadow;
  gl_FragColor.a = clamp(progress * 5.0, 0.0, 1.0);
}
`;

const SECTION =
  "py-[20vh] mx-[100px] min-h-screen min-[1480px]:mx-auto min-[1480px]:max-w-[1200px] max-[750px]:mx-[50px]";
const META = "font-bold";
const META_SUB = "text-[1.2em] whitespace-nowrap";
const META_TITLE = "text-[2.5em] whitespace-nowrap";

export default function ImageUnrollGallery({
  bgColor = "#dde8eb",
  textColor = "#000000",
  serifFontFamily = 'Georgia, "Times New Roman", serif',
  sansFontFamily = 'Inter, "Helvetica Neue", Arial, sans-serif',
  showLoader = true,
  loaderDotColor = "#4b4b4b",

  introBackImage = IMG.introBack,
  introFrontImage = IMG.introFront,
  introCaption = "Watson Building, Dubai, 2020",
  introFrontWidth = "60%",
  introBackInset = "20%",
  introBackAspect = "3/2",
  introFrontAspect = "3/4",

  dosFrontImage = IMG.dosFront,
  dosBackImage = IMG.dosBack,
  dosSubtitle = "– architecture",
  dosTitle = "Megalith",
  dosCaption = "Carlon Arc, Chicago, 2019",
  dosBackIndent = "30%",
  dosOverlap = "-14vh",
  dosFrontAspect = "3/4",
  dosBackAspect = "3/2",

  tresFrontImage = IMG.tresFront,
  tresBackImage = IMG.tresBack,
  tresSubtitle = "– innovator",
  tresTitle = "Neon Plex",
  tresCaption = "Plex Construct, Sydney, 2018",
  tresBackWidth = "55%",
  tresOverlap = "-40%",
  tresFrontAspect = "1/1",
  tresBackAspect = "3/4",

  gridImages = IMG.grid,
  gridItemWidthClass = "w-1/2",
  gridMaxWidth = "800px",
  gridAspect = "1/1",
  gridGap = "2em",

  lastImage = IMG.last,
  lastMaxWidth = "400px",
  lastAspect = "1/1",
  showControls = true,
  controls = DEFAULT_CONTROLS,
  buttonClass = "inline-block bg-transparent rounded-none border border-[#94a6ab] cursor-pointer px-[1.3em] py-[0.7em] text-[1em] mx-[0.5em] focus:outline-none max-[750px]:text-[0.8em]",

  angle = 17,
  rolls = 8,
  radius = 0.1,
  unrollDuration = 1.7,
  rollBackDuration = 1.7,
  unrollEase = "power2.out",
  rollBackEase = "power2.inOut",
  replayDuration = 2,
  rollBackOnExit = true,
  unrollThreshold = 0.5,
  shadowStrength = 0.3,
  segments = 80,
  cameraDistance = 400,
  className = "",
  introBackAlt = "Building facade",
  introFrontAlt = "Building detail",
  dosFrontAlt = "Architecture photo",
  dosBackAlt = "Architecture photo detail",
  tresFrontAlt = "Modern structure",
  tresBackAlt = "Modern structure detail",
  gridAlts = ["Gallery image 1", "Gallery image 2", "Gallery image 3", "Gallery image 4"],
  lastAlt = "Closing image",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const canvasHostRef = useRef(null);
  const stateRef = useRef({ meshes: [], angle: 0.3 });
  const [ready, setReady] = useState(false);

  const toRadians = (deg) => {
    const r = (deg * Math.PI) / 180;
    return Math.abs(Math.sin(r) + Math.cos(r)) < 0.001
      ? r + 0.0017
      : r || 0.0001;
  };

  useEffect(() => {
    stateRef.current.angle = toRadians(angle);
  }, [angle]);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    const local = {};

    const decodeAll = (els) =>
      Promise.all(
        els.map(
          (el) =>
            new Promise((resolve) => {
              if (el.complete && el.naturalWidth) {
                resolve(el);
                return;
              }
              el.addEventListener("load", () => resolve(el), { once: true });
              el.addEventListener("error", () => resolve(null), { once: true });
            }),
        ),
      );

    Promise.all([import("three"), import("gsap")])
      .then(([threeModule, gsapModule]) => {
        local.THREE = threeModule;
        local.gsap = gsapModule.gsap || gsapModule.default;
        const root = rootRef.current;
        if (!root) return [];
        return decodeAll(Array.from(root.querySelectorAll("img")));
      })
      .then(() => {
        if (disposed) return;
        const THREE = local.THREE;
        const gsap = local.gsap;
        stateRef.current.gsap = gsap;
        const root = rootRef.current;
        const host = canvasHostRef.current;
        if (!THREE || !gsap || !root || !host) return;

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.sortObjects = false;
        Object.assign(renderer.domElement.style, {
          position: "fixed",
          top: "0",
          left: "0",
          zIndex: "100",
          pointerEvents: "none",
        });
        host.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(70, 1, 100, 2000);
        camera.position.set(0, 0, cameraDistance);
        camera.lookAt(0, 0, 0);

        const geometry = new THREE.PlaneGeometry(1, 1, segments, segments);

        const applyCamera = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.fov =
            2 * Math.atan(h / (2 * cameraDistance)) * (180 / Math.PI);
          camera.updateProjectionMatrix();
        };
        applyCamera();

        const measure = (item) => {
          const rect = item.el.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const imageAspect = item.el.naturalHeight / item.el.naturalWidth;
          let a1;
          let a2;
          if (rect.height / rect.width > imageAspect) {
            a1 = (rect.width / rect.height) * imageAspect;
            a2 = 1;
          } else {
            a1 = 1;
            a2 = rect.height / rect.width / imageAspect;
          }
          item.mesh.scale.set(rect.width, rect.height, rect.width / 2);
          item.material.uniforms.resolution.value.set(
            rect.width,
            rect.height,
            a1,
            a2,
          );
        };

        const meshes = [];
        Array.from(root.querySelectorAll("img[data-unroll]")).forEach((el) => {
          if (!el.naturalWidth) return;
          const texture = new THREE.Texture(el);
          texture.minFilter = THREE.LinearFilter;
          texture.needsUpdate = true;

          const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: {
              progress: { value: 0 },
              angle: { value: stateRef.current.angle },
              uRolls: { value: rolls },
              uRadius: { value: radius },
              uShadow: { value: shadowStrength },
              texture1: { value: texture },
              resolution: { value: new THREE.Vector4(1, 1, 1, 1) },
            },
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.visible = false;
          scene.add(mesh);

          const item = { el, mesh, material, unrolled: false };
          measure(item);
          meshes.push(item);
        });

        stateRef.current.meshes = meshes;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const item = meshes.find((m) => m.el === entry.target);
              if (!item) return;
              if (
                entry.intersectionRatio >= unrollThreshold &&
                !item.unrolled
              ) {
                item.unrolled = true;
                gsap.to(item.material.uniforms.progress, {
                  value: 1,
                  duration: unrollDuration,
                  ease: unrollEase,
                });
              } else if (
                rollBackOnExit &&
                entry.intersectionRatio < unrollThreshold * 0.6 &&
                entry.boundingClientRect.y > 0 &&
                item.unrolled
              ) {
                item.unrolled = false;
                gsap.to(item.material.uniforms.progress, {
                  value: 0,
                  duration: rollBackDuration,
                  ease: rollBackEase,
                });
              }
            });
          },
          { threshold: [0, 0.15, 0.3, 0.45, 0.5, 0.6, 0.75, 0.9, 1] },
        );
        meshes.forEach((m) => observer.observe(m.el));

        const onResize = () => {
          applyCamera();
          meshes.forEach(measure);
        };
        window.addEventListener("resize", onResize);

        const tick = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          meshes.forEach((m) => {
            const rect = m.el.getBoundingClientRect();
            const onScreen = rect.bottom > -300 && rect.top < h + 300;
            m.mesh.visible = onScreen && m.material.uniforms.progress.value > 0;
            if (!onScreen) return;
            m.mesh.position.x = rect.left + rect.width / 2 - w / 2;
            m.mesh.position.y = -(rect.top + rect.height / 2 - h / 2);
            m.material.uniforms.angle.value = stateRef.current.angle;
          });
          renderer.render(scene, camera);
          frame = requestAnimationFrame(tick);
        };
        tick();
        setReady(true);

        local.cleanup = () => {
          cancelAnimationFrame(frame);
          window.removeEventListener("resize", onResize);
          observer.disconnect();
          meshes.forEach((m) => {
            m.material.uniforms.texture1.value.dispose();
            m.material.dispose();
          });
          geometry.dispose();
          renderer.dispose();
          if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        };
      })
      .catch((e) =>
        console.error("[ImageUnrollGallery] init failed:", e.message),
      );

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      if (local.cleanup) local.cleanup();
    };
  }, [
    segments,
    cameraDistance,
    rolls,
    radius,
    shadowStrength,
    unrollDuration,
    rollBackDuration,
    unrollEase,
    rollBackEase,
    rollBackOnExit,
    unrollThreshold,
  ]);

  const replay = (deg) => {
    const gsap = stateRef.current.gsap;
    stateRef.current.angle = toRadians(deg);
    if (!gsap) return;
    stateRef.current.meshes.forEach((m) => {
      m.unrolled = true;
      gsap.fromTo(
        m.material.uniforms.progress,
        { value: 0 },
        { value: 1, duration: replayDuration, ease: unrollEase },
      );
    });
  };

  const plate = "block max-w-full w-full";
  const imgStyle = (aspectRatio, unrolls) => ({
    opacity: unrolls && ready ? 0 : 1,
    ...(aspectRatio ? { aspectRatio, objectFit: "cover" } : null),
  });
  const halfGap = `calc(${gridGap} / 2)`;

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-x-hidden text-[18px] antialiased ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: serifFontFamily,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes uLoader${uid} {
              to { opacity: 1; transform: scale3d(0.5, 0.5, 1); }
            }
          `,
        }}
      />

      {showLoader && !ready ? (
        <div
          className="fixed inset-0 z-[1000] w-full h-full"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className="absolute top-1/2 left-1/2 w-[60px] h-[60px] -mt-[30px] -ml-[30px] rounded-full opacity-40"
            style={{
              backgroundColor: loaderDotColor,
              animation: `uLoader${uid} 0.7s linear infinite alternate forwards`,
            }}
          />
        </div>
      ) : null}

      <div ref={canvasHostRef} />

      <main className="relative">
        <section
          className={`${SECTION} text-right pt-[100px] pb-[20vh] text-[18px]`}
        >
          <div className="relative">
            <div
              className="relative max-[750px]:static"
              style={{ marginRight: introBackInset }}
            >
              <img
                src={introBackImage}
                alt={introBackAlt}
                crossOrigin="anonymous"
                style={imgStyle(introBackAspect, false)}
                className={`${plate} max-[750px]:hidden`}
              />
              <div className="pt-[1em] absolute bottom-[-2em] right-0">
                {introCaption}
              </div>
            </div>
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 max-[750px]:static max-[750px]:m-0 max-[750px]:p-0 max-[750px]:translate-y-0 max-[750px]:!w-auto"
              style={{ width: introFrontWidth }}
            >
              <img
                src={introFrontImage}
                alt={introFrontAlt}
                data-unroll="true"
                crossOrigin="anonymous"
                style={imgStyle(introFrontAspect, true)}
                className={`${plate} max-[750px]:w-full`}
              />
            </div>
          </div>
        </section>

        <section
          className={`${SECTION} !my-[100px] !mx-[50px] relative min-[1480px]:!mx-auto`}
        >
          <div className="w-2/5 relative pl-[6em] max-[750px]:m-0 max-[750px]:absolute max-[750px]:left-0 max-[750px]:w-0">
            <div
              className={`${META} absolute left-0 top-full origin-[0_0] -rotate-90 max-[750px]:left-[-8em] max-[750px]:top-[4em] max-[750px]:w-[8em] max-[750px]:origin-[100%_0] max-[750px]:text-[9px]`}
              style={{ fontFamily: sansFontFamily }}
            >
              <h3 className={META_SUB}>{dosSubtitle}</h3>
              <h2 className={META_TITLE}>{dosTitle}</h2>
            </div>
            <div className="max-[750px]:hidden">
              <img
                src={dosFrontImage}
                alt={dosFrontAlt}
                crossOrigin="anonymous"
                style={imgStyle(dosFrontAspect, false)}
                className={plate}
              />
            </div>
          </div>
          <div
            className="text-right relative max-[750px]:static max-[750px]:!w-full max-[750px]:!m-0 max-[750px]:p-0"
            style={{ marginLeft: dosBackIndent, marginTop: dosOverlap }}
          >
            <div className="max-[750px]:pl-[3em] max-[750px]:min-h-[200px]">
              <img
                src={dosBackImage}
                alt={dosBackAlt}
                data-unroll="true"
                crossOrigin="anonymous"
                style={imgStyle(dosBackAspect, true)}
                className={plate}
              />
            </div>
            <div className="absolute bottom-0 w-2/5 right-[calc(100%+1em)] max-[750px]:static max-[750px]:w-auto max-[750px]:text-right max-[750px]:my-[1em]">
              <p>{dosCaption}</p>
            </div>
          </div>
        </section>

        <section className={`${SECTION} relative`}>
          <div className="pr-[8em] text-right inline-block w-full relative z-[2]">
            <div className="float-right w-[calc(70%-8em)] max-[750px]:w-full max-[750px]:float-none">
              <img
                src={tresFrontImage}
                alt={tresFrontAlt}
                data-unroll="true"
                crossOrigin="anonymous"
                style={imgStyle(tresFrontAspect, true)}
                className={plate}
              />
            </div>
            <div
              className={`${META} absolute right-[-1em] top-full w-[8em] origin-[0_0] -rotate-90 text-left max-[750px]:text-[9px]`}
              style={{ fontFamily: sansFontFamily }}
            >
              <h3 className={META_SUB}>{tresSubtitle}</h3>
              <h2 className={META_TITLE}>{tresTitle}</h2>
            </div>
          </div>
          <div
            className="relative z-[1] max-[750px]:!mt-0 max-[750px]:!w-auto"
            style={{ width: tresBackWidth, marginTop: tresOverlap }}
          >
            <div className="max-[750px]:hidden">
              <img
                src={tresBackImage}
                alt={tresBackAlt}
                crossOrigin="anonymous"
                style={imgStyle(tresBackAspect, false)}
                className={plate}
              />
            </div>
            <div className="absolute top-full w-[20em] left-0 pt-[1em] max-[750px]:static max-[750px]:w-auto max-[750px]:m-0">
              <p>{tresCaption}</p>
            </div>
          </div>
        </section>

        <section className={SECTION}>
          <ul
            className="my-[100px] mx-auto list-none overflow-hidden"
            style={{ maxWidth: `calc(${gridMaxWidth} + ${gridGap})` }}
          >
            {gridImages.map((src, i) => (
              <li
                key={`${src}-${i}`}
                className={`${gridItemWidthClass} text-center float-left max-[750px]:float-none max-[750px]:w-auto`}
                style={{ padding: `0 ${halfGap}`, marginBottom: gridGap }}
              >
                <img
                  src={src}
                  alt={gridAlts[i] || ""}
                  data-unroll="true"
                  crossOrigin="anonymous"
                  style={imgStyle(gridAspect, true)}
                  className={`${plate} mx-auto`}
                />
              </li>
            ))}
          </ul>
        </section>

        <section
          className={`${SECTION} !mx-auto !mt-[100px] !mb-0 pb-[30vh] text-center max-[750px]:!mx-auto`}
        >
          {showControls ? (
            <div className="mb-[100px]">
              {controls.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => replay(c.angle)}
                  className={buttonClass}
                >
                  {c.label}
                </button>
              ))}
            </div>
          ) : null}
          <div
            className="mx-auto max-[750px]:!mx-[20px]"
            style={{ maxWidth: lastMaxWidth }}
          >
            <img
              src={lastImage}
              alt={lastAlt}
              data-unroll="true"
              crossOrigin="anonymous"
              style={imgStyle(lastAspect, true)}
              className={`${plate} mx-auto`}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
