"use client";

import { useEffect, useId, useRef } from "react";

const FRAGMENT_SHADER =  `
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

const defaultGetImageUrl = (i, w, h) =>
  "https://picsum.photos/id/" + (i + 1) + "/" + w + "/" + h;

const loadDeps = async () => {
  const [kokomi, THREE, gsapModule] = await Promise.all([
    import("kokomi.js"),
    import("three"),
    import("gsap"),
  ]);
  return { kokomi, THREE, gsap: gsapModule.default || gsapModule.gsap };
};

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
  heroTitleColor = "#ffffff",
  loadingColor = "#000000",
  className = "",
}) {
  const rootRef = useRef(null);
  const sketchHostRef = useRef(null);
  const heroRef = useRef(null);

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

    return () => {
      cancelled = true;
      if (timeline) timeline.kill();
      if (sketch && typeof sketch.dispose === "function") sketch.dispose();
      const canvas = host.querySelector("canvas");
      if (canvas) canvas.remove();
    };

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
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div
        id={rid}
        ref={sketchHostRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "#000000" }}
      />

      <div
          className="loader-screen absolute z-[5] inset-0 w-full h-full transition-all duration-300"
        style={{ background: loaderBg }}
      >
        <div className="hv-center">
          <div className="loading text-2xl sm:text-3xl tracking-[0.25em] whitespace-nowrap" style={{ color: loadingColor }}>
            {loadingText.split("").map((ch, i) => (
              <span key={i} style={{ "--i": i }}>
                {ch}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div ref={heroRef} className="hero-dom opacity-0">
        <div className="hv-center">
          <div className="flex flex-col items-center space-y-2 whitespace-nowrap">
            <div className="text-6xl sm:text-8xl" style={{ color: heroTitleColor }}>{heroTitle}</div>
            <div className="text-base sm:text-xl" style={{ color: subtitleColor }}>
              {heroSubtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
