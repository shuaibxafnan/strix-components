"use client";

import { useEffect, useId, useRef } from "react";

// ─── RingGallery ─────────────────────────────────────────────────────────────
//
// Concentric rings of image planes orbiting in 3D, rendered with kokomi.js /
// three.js and post-processed by a custom shader (RGB shift + film grain +
// vignette + an expanding-circle intro wipe). Drag or scroll to spin and push
// the rings back in depth. Ported from a vanilla esm.sh CodePen.
//
// three / kokomi.js / gsap are ESM-only on esm.sh, so they're loaded once via an
// injected <script type="module"> (Turbopack can't resolve absolute CDN URLs in
// a dynamic import()). All WebGL work runs inside useEffect, so nothing touches
// the DOM during SSR and there's no hydration mismatch.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor             string   #0c0c0c   Clear color + vignette tint.
// circleCount         number   3         Number of concentric rings.
// imagesPerUnit       number   12        Base image count (scales per ring).
// ringRadius          number   6.4       Radius step between rings.
// imageScale          number   0.8       Global plane size multiplier.
// ringScaleStep       number   0.36      Extra plane scale added per outer ring.
// cameraZ             number   16        Camera distance.
// rgbShiftIntensity   number   0.0025    Chromatic aberration amount.
// grainIntensity      number   0.025     Film-grain strength.
// vignetteIntensity   number   0.8       Vignette darkness toward bgColor.
// ringBaseSpin        number   0.0025    Per-frame base rotation of each ring.
// introRotateSpeed    number   10        Spin multiplier at intro start.
// idleRotateSpeed     number   1         Spin multiplier once settled.
// dragSpeed           number   2         Drag → scroll sensitivity.
// scrollDepth         number   100       How far rings recede on scroll.
// transitionDuration  number   1         Circle-wipe intro duration (s).
// enterDuration       number   1.5       Rings-fly-in duration (s).
// imageWidth          number   320       Requested source image width.
// imageHeight         number   400       Requested source image height.
// getImageUrl         fn       (picsum)  (index, w, h) => image URL.
// loadingText         string   LOADING   Loader screen text.
// loaderBg            string   #ffffff   Loader screen background.
// heroTitle           string   RING      Centered hero title.
// heroSubtitle        string   Just drag and scroll~   Hero subtitle.
// subtitleColor       string   #8a8a8a   Hero subtitle color.
// className           string   ""        Extra classes on the root element.
// ──────────────────────────────────────────────────────────────────────────

// The post-processing fragment shader — RGB shift, grain, vignette, circle wipe.
const FRAGMENT_SHADER = /* glsl */ `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform vec3 uBgColor;
uniform float uRGBShiftIntensity;
uniform float uGrainIntensity;
uniform float uVignetteIntensity;
uniform float uTransitionProgress;

highp float random(vec2 co){
  highp float a=12.9898;
  highp float b=78.233;
  highp float c=43758.5453;
  highp float dt=dot(co.xy,vec2(a,b));
  highp float sn=mod(dt,3.14);
  return fract(sin(sn)*c);
}
vec3 grain(vec2 uv,vec3 col,float amount){
  float noise=random(uv+iTime);
  col+=(noise-.5)*amount;
  return col;
}
vec4 RGBShift(sampler2D tex,vec2 uv,float amount){
  vec2 rUv=uv; vec2 gUv=uv; vec2 bUv=uv;
  float noise=random(uv+iTime)*.5+.5;
  vec2 offset=amount*vec2(cos(noise),sin(noise));
  rUv+=offset; gUv+=offset*.5; bUv+=offset*.25;
  vec4 rTex=texture(tex,rUv);
  vec4 gTex=texture(tex,gUv);
  vec4 bTex=texture(tex,bUv);
  return vec4(rTex.r,gTex.g,bTex.b,gTex.a);
}
vec3 vignette(vec2 uv,vec3 col,vec3 vigColor,float amount){
  vec2 p=uv; p-=.5;
  float d=length(p);
  float mask=smoothstep(.5,.3,d);
  mask=pow(mask,.6);
  float mixFactor=(1.-mask)*amount;
  return mix(col,vigColor,mixFactor);
}
float sdCircle(vec2 p,float r){ return length(p)-r; }
vec3 transition(vec2 uv,vec3 col,float progress){
  float ratio=iResolution.x/iResolution.y;
  vec2 p=uv; p-=.5; p.x*=ratio;
  float d=sdCircle(p,progress*sqrt(2.2));
  float c=smoothstep(-.2,0.,d);
  return mix(vec3(1.),col,1.-c);
}
void main(){
  vec2 uv=vUv;
  vec4 tex=RGBShift(tDiffuse,uv,uRGBShiftIntensity);
  vec3 col=tex.xyz;
  col=grain(uv,col,uGrainIntensity);
  col=vignette(uv,col,uBgColor,uVignetteIntensity);
  col=transition(uv,col,uTransitionProgress);
  gl_FragColor=vec4(col,1.);
}
`;

// Default image source — the original picsum endpoint.
const defaultGetImageUrl = (i, w, h) =>
  "https://picsum.photos/id/" + (i + 1) + "/" + w + "/" + h;

// Loads three / kokomi / gsap exactly once across all instances. esm.sh dedupes
// the shared three dependency. Resolves to the module namespaces.
const loadDeps = () => {
  if (window.__ringDeps) return Promise.resolve(window.__ringDeps);
  if (window.__ringDepsPromise) return window.__ringDepsPromise;

  window.__ringDepsPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("dependency load timed out")),
      20000,
    );
    window.addEventListener(
      "ring-deps-ready",
      () => {
        clearTimeout(timeout);
        resolve(window.__ringDeps);
      },
      { once: true },
    );

    const s = document.createElement("script");
    s.type = "module";
    // String concatenation (no template literal) keeps the injected source flat.
    s.textContent =
      'import * as kokomi from "https://esm.sh/kokomi.js";' +
      'import * as THREE from "https://esm.sh/three";' +
      'import gsap from "https://esm.sh/gsap";' +
      "window.__ringDeps = { kokomi, THREE, gsap };" +
      'window.dispatchEvent(new Event("ring-deps-ready"));';
    s.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("module script failed to load"));
    };
    document.head.appendChild(s);
  });

  return window.__ringDepsPromise;
};

// Scoped stylesheet (string-concatenated → SSR-safe). Holds only what Tailwind
// can't express: the staggered loader-blur keyframe and the centering helper.
const buildCss = (rid) => {
  const r = "." + rid;
  return [
    r +
      " .hv-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}",
    r + " .loader-screen.hollow{opacity:0;pointer-events:none;}",
    r +
      " .loading span{display:inline-block;animation:" +
      rid +
      "-blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;}",
    "@keyframes " + rid + "-blur{to{filter:blur(5px);}}",
  ].join("\n");
};

export default function RingGallery({
  bgColor = "#0c0c0c",
  circleCount = 3,
  imagesPerUnit = 12,
  ringRadius = 6.4,
  imageScale = 0.8,
  ringScaleStep = 0.36,
  cameraZ = 16,
  rgbShiftIntensity = 0.0025,
  grainIntensity = 0.025,
  vignetteIntensity = 0.8,
  ringBaseSpin = 0.0025,
  introRotateSpeed = 10,
  idleRotateSpeed = 1,
  dragSpeed = 2,
  scrollDepth = 100,
  transitionDuration = 1,
  enterDuration = 1.5,
  imageWidth = 320,
  imageHeight = 400,
  getImageUrl = defaultGetImageUrl,
  loadingText = "LOADING",
  loaderBg = "#ffffff",
  heroTitle = "RING",
  heroSubtitle = "Just drag and scroll~",
  subtitleColor = "#8a8a8a",
  className = "",
}) {
  const rootRef = useRef(null);
  const sketchHostRef = useRef(null);
  const loaderRef = useRef(null);
  const heroRef = useRef(null);

  // SSR-safe, hydration-stable unique id; sanitized for use as a CSS token and
  // as the kokomi mount selector.
  const rawId = useId();
  const rid = "ring-" + rawId.replace(/:/g, "");

  const css = buildCss(rid);

  useEffect(() => {
    const host = sketchHostRef.current;
    const root = rootRef.current;
    if (!host || !root) return;

    let sketch = null;
    let timeline = null;
    let cancelled = false;

    // Snapshot of the runtime config the original scene closed over.
    const config = {
      bgColor,
      circleCount,
      imagesPerUnit,
      ringRadius,
      imageScale,
      ringScaleStep,
      cameraZ,
      rgbShiftIntensity,
      grainIntensity,
      vignetteIntensity,
      ringBaseSpin,
      introRotateSpeed,
      idleRotateSpeed,
      dragSpeed,
      scrollDepth,
      transitionDuration,
      enterDuration,
      imageWidth,
      imageHeight,
      getImageUrl,
    };

    loadDeps()
      .then(({ kokomi, THREE, gsap }) => {
        if (cancelled) return;

        const params = {
          transitionProgress: 0,
          enterProgress: 0,
          rotateSpeed: config.introRotateSpeed,
        };

        const sumFormula = (n) => (n * (n + 1)) / 2;
        const isOdd = (n) => n % 2 === 1;

        // ── kokomi base scene, mounted into our scoped host element ──
        class Sketch extends kokomi.Base {
          create() {
            this.renderer.setClearColor(new THREE.Color(config.bgColor), 1);
            this.camera.position.set(0, 0, config.cameraZ);

            const imgTotal =
              config.imagesPerUnit * sumFormula(config.circleCount);
            const resourceList = [...Array(imgTotal).keys()].map((_, i) => ({
              name: "tex" + (i + 1),
              type: "texture",
              path: config.getImageUrl(
                i,
                config.imageWidth,
                config.imageHeight,
              ),
            }));

            const am = new kokomi.AssetManager(this, resourceList);

            am.on("ready", () => {
              if (cancelled) return;

              // Fade the loader out (scoped query, not document-wide).
              const loader = root.querySelector(".loader-screen");
              if (loader) loader.classList.add("hollow");

              const material = new THREE.MeshBasicMaterial();
              const r = config.ringRadius;
              const scale = config.imageScale;

              const rings = [];
              const lines = [];

              for (let i = 0; i < config.circleCount; i++) {
                const c1 = sumFormula(i) * config.imagesPerUnit;
                const c2 = sumFormula(i + 1) * config.imagesPerUnit;
                const textures = Object.values(am.items).slice(c1, c2);

                const ring = new THREE.Group();
                this.scene.add(ring);
                rings.push(ring);

                textures.forEach((tex, j) => {
                  const line = new THREE.Group();
                  ring.add(line);
                  lines.push(line);

                  const imgScale =
                    0.005 * scale * (i * config.ringScaleStep + 1);
                  const width = tex.image.width * imgScale;
                  const height = tex.image.height * imgScale;
                  const geometry = new THREE.PlaneGeometry(width, height);
                  const mat = material.clone();
                  mat.map = tex;
                  mat.needsUpdate = true;
                  const mesh = new THREE.Mesh(geometry, mat);

                  const r2 = r * (i + 1);
                  const ratio = j / (c2 - c1);
                  const angle = ratio * Math.PI * 2;
                  mesh.position.x = r2;
                  mesh.rotation.z = -Math.PI / 2;
                  line.rotation.z = angle;
                  line.add(mesh);
                });
              }

              // Custom post-processing pass.
              const ce = new kokomi.CustomEffect(this, {
                fragmentShader: FRAGMENT_SHADER,
                uniforms: {
                  uBgColor: { value: new THREE.Color(config.bgColor) },
                  uRGBShiftIntensity: { value: config.rgbShiftIntensity },
                  uGrainIntensity: { value: config.grainIntensity },
                  uVignetteIntensity: { value: config.vignetteIntensity },
                  uTransitionProgress: { value: 0 },
                },
              });
              ce.addExisting();
              this.ce = ce;

              // Wheel + drag scrolling feed the same scroll value.
              const wheelScroller = new kokomi.WheelScroller();
              wheelScroller.listenForScroll();

              const dragDetecter = new kokomi.DragDetecter(this);
              dragDetecter.detectDrag();
              dragDetecter.on("drag", (delta) => {
                wheelScroller.scroll.target -=
                  (delta.x || delta.y) * config.dragSpeed;
              });

              this.update(() => {
                wheelScroller.syncScroll();

                rings.forEach((ring, i) => {
                  ring.rotation.z +=
                    config.ringBaseSpin *
                    (isOdd(i) ? -1 : 1) *
                    (1 + wheelScroller.scroll.delta) *
                    params.rotateSpeed;
                });

                lines.forEach((line) => {
                  line.position.z =
                    -THREE.MathUtils.lerp(
                      0,
                      config.scrollDepth,
                      THREE.MathUtils.mapLinear(
                        wheelScroller.scroll.delta,
                        0,
                        1000,
                        0,
                        1,
                      ),
                    ) + THREE.MathUtils.lerp(10, 0, params.enterProgress);
                });

                this.ce.customPass.material.uniforms.uTransitionProgress.value =
                  params.transitionProgress;
              });

              // Intro: circle wipe + rings flying in + hero text fade.
              timeline = gsap.timeline();
              timeline
                .to(params, {
                  transitionProgress: 1,
                  duration: config.transitionDuration,
                  ease: "power1.inOut",
                })
                .fromTo(
                  params,
                  { enterProgress: 0, rotateSpeed: config.introRotateSpeed },
                  {
                    enterProgress: 1,
                    rotateSpeed: config.idleRotateSpeed,
                    duration: config.enterDuration,
                    ease: "power1.inOut",
                  },
                  "-=1",
                )
                .to(heroRef.current, { opacity: 1 }, "-=1");
            });
          }
        }

        sketch = new Sketch("#" + rid);
        sketch.create();
      })
      .catch((err) =>
        console.error("[RingGallery] dependency load failed:", err.message),
      );

    // ── Cleanup: stop the scene + tweens, drop the canvas ──
    return () => {
      cancelled = true;
      if (timeline) timeline.kill();
      if (sketch && typeof sketch.dispose === "function") sketch.dispose();
      const canvas = host.querySelector("canvas");
      if (canvas) canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rid]);

  return (
    <div
      ref={rootRef}
      className={
        rid +
        " relative w-full h-screen overflow-hidden [font-family:Inter,sans-serif] " +
        className
      }
      style={{ background: "#000000" }}
    >
      {/* Scoped, prop-free stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* WebGL mount target — kokomi appends its <canvas> here */}
      <div
        id={rid}
        ref={sketchHostRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "#000000" }}
      />

      {/* Loader screen — fades out via the `.hollow` class on ready */}
      <div
        ref={loaderRef}
        className="loader-screen absolute z-[5] inset-0 w-full h-full transition-all duration-300"
        style={{ background: loaderBg }}
      >
        <div className="hv-center">
          <div className="loading text-3xl tracking-[0.25em] whitespace-nowrap">
            {loadingText.split("").map((ch, i) => (
              <span key={i} style={{ "--i": i }}>
                {ch}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero overlay — gsap fades opacity 0 → 1 after the intro */}
      <div ref={heroRef} className="hero-dom opacity-0">
        <div className="hv-center">
          <div className="flex flex-col items-center space-y-2 whitespace-nowrap">
            <div className="text-8xl text-white">{heroTitle}</div>
            <div className="text-xl" style={{ color: subtitleColor }}>
              {heroSubtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
