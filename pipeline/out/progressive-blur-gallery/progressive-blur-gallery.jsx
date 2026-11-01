"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1200&q=80",
];

const DEFAULT_LIST_COLUMNS = [
  ["Santa Marta", "Curramba", "Spheres", "Catedral", "The Bird"],
  ["Tricycle", "Fashion", "NINI9", "Tote bags", "Window"],
  ["Monteria", "Sky", "Clothes", "Buildings", "Nature"],
];

const VERTEX_SHADER = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const buildFragmentShader = (noiseAmount, blurRadius) => `
precision highp float;
uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform vec2 uViewportSize;
uniform float uBlurStrength;
uniform float uTime;
uniform sampler2D tMap;
varying vec2 vUv;
float tvNoise (vec2 p, float ta, float tb) {
  return fract(sin(p.x * ta + p.y * tb) * 5678.);
}
vec3 draw(sampler2D image, vec2 uv) {
  return texture2D(image, vec2(uv.x, uv.y)).rgb;
}
float rand(vec2 co){
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
vec3 blur(vec2 uv, sampler2D image, float blurAmount){
  vec3 blurredImage = vec3(0.);
  float gradient = smoothstep(0.8, 0.0, 3.4 - (gl_FragCoord.y / uViewportSize.y) / uViewportSize.y) * uBlurStrength + smoothstep(0.8, 0.0, (gl_FragCoord.y / uViewportSize.y) / uViewportSize.y) * uBlurStrength;
  #define repeats 40.
  for (float i = 0.; i < repeats; i++) {
    vec2 q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i, uv.x + uv.y)) + blurAmount);
    vec2 uv2 = uv + (q * blurAmount * gradient);
    blurredImage += draw(image, uv2) / 2.;
    q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i + 2., uv.x + uv.y + 24.)) + blurAmount);
    uv2 = uv + (q * blurAmount * gradient);
    blurredImage += draw(image, uv2) / 2.;
  }
  return blurredImage / repeats;
}
void main() {
  vec2 ratio = vec2(
    min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.0),
    min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.0)
  );
  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
  float t = uTime + 123.0;
  float ta = t * 0.654321;
  float tb = t * (ta * 0.123456);
  vec4 noise = vec4(1. - tvNoise(uv, ta, tb));
  vec4 final = vec4(blur(uv, tMap, ${blurRadius.toFixed(4)}), 1.);
  final = final - noise * ${noiseAmount.toFixed(4)};
  gl_FragColor = final;
}
`;

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export default function ProgressiveBlurGallery({
  className = "",
  images = DEFAULT_IMAGES,
  listColumns = DEFAULT_LIST_COLUMNS,
  heroEyebrow = "WebGL / OGL",
  heroTitle = "Progressive Blur",
  bgColor = "#e3e3e3",
  textColor = "#000000",
  fontSans = "Fustat, sans-serif",
  fontSerif = "'Bodoni Moda', serif",
  showCaptions = true,
  sectionMargin = 200,
  gutter = 20,
  cameraFov = 45,
  cameraZ = 20,
  widthSegments = 100,
  heightSegments = 50,
  blurStrength = 1,
  heroBlurAmount = 0.8,
  heroScaleAmount = 0.05,
  heroRange = 0.57,
  noiseAmount = 0.08,
  blurRadius = 0.08,
  timeSpeed = 0.04,
  lenisEnabled = true,
  lenisDuration = 1.2,
  listBlur = 5,
  listScale = 1.4,
  listOffsetY = 40,
  listStagger = 0.2,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const items = listRef.current
      ? Array.from(listRef.current.querySelectorAll("li"))
      : [];
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      });
    });
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [listColumns]);

  useEffect(() => {
    let raf = 0;
    let destroyed = false;
    let lenisInstance = null;
    const cleanupFns = [];

    const boot = async () => {
      const OGL = await import("ogl");
      if (destroyed || !canvasRef.current || !rootRef.current) return;

      const { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } = OGL;

      const renderer = new Renderer({ canvas: canvasRef.current, alpha: true });
      const gl = renderer.gl;

      const camera = new Camera(gl);
      camera.fov = cameraFov;
      camera.position.z = cameraZ;

      const scene = new Transform();
      const geometry = new Plane(gl, { heightSegments, widthSegments });

      let screen = { width: 0, height: 0 };
      let viewport = { width: 0, height: 0 };
      let currentScroll = 0;

      const elements = Array.from(rootRef.current.querySelectorAll("[data-media]"));

      const medias = elements.map(($el) => {
        const imgEl = $el.querySelector("img");
        const texture = new Texture(gl, { generateMipmaps: false });

        const program = new Program(gl, {
          depthTest: false,
          depthWrite: false,
          fragment: buildFragmentShader(noiseAmount, blurRadius),
          vertex: VERTEX_SHADER,
          uniforms: {
            tMap: { value: texture },
            uPlaneSize: { value: [0, 0] },
            uImageSize: { value: [0, 0] },
            uViewportSize: { value: [0, 0] },
            uTime: { value: 100 * Math.random() },
            uBlurStrength: { value: blurStrength },
          },
          transparent: true,
        });

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = imgEl.currentSrc || imgEl.src;
        image.onload = () => {
          texture.image = image;
          program.uniforms.uImageSize.value = [
            image.naturalWidth,
            image.naturalHeight,
          ];
        };

        const plane = new Mesh(gl, { geometry, program });
        plane.setParent(scene);

        const media = { $el, plane, program, x: 0, y: 0, blur: blurStrength };

        media.setScale = (x, y) => {
          const w = x || $el.offsetWidth;
          const h = y || $el.offsetHeight;
          plane.scale.x = (viewport.width * w) / screen.width;
          plane.scale.y = (viewport.height * h) / screen.height;
          program.uniforms.uPlaneSize.value = [plane.scale.x, plane.scale.y];
        };

        media.setX = (x = media.x) => {
          media.x = x;
          plane.position.x =
            -(viewport.width / 2) +
            plane.scale.x / 2 +
            (media.x / screen.width) * viewport.width;
        };

        media.setY = (y = media.y) => {
          media.y = y;
          plane.position.y =
            viewport.height / 2 -
            plane.scale.y / 2 -
            ((media.y - currentScroll) / screen.height) * viewport.height;
        };

        media.onResize = () => {
          program.uniforms.uViewportSize.value = [viewport.width, viewport.height];
          const rect = $el.getBoundingClientRect();
          media.setScale();
          media.setX(rect.left + window.scrollX);
          media.setY(rect.top + window.scrollY);
        };

        media.update = () => {
          program.uniforms.uTime.value += timeSpeed;
          program.uniforms.uBlurStrength.value = media.blur;
        };

        return media;
      });

      const checkHeroProgress = () => {
        if (!medias.length) return;
        const p = easeInOut(
          Math.min(currentScroll / (screen.height * heroRange), 1)
        );
        const hero = medias[0];
        const height = hero.$el.offsetHeight;
        hero.setScale(null, height * (1 + heroScaleAmount * p));
        hero.blur = blurStrength - heroBlurAmount * blurStrength * (1 - p);
      };

      const onScroll = (value) => {
        currentScroll = value;
        medias.forEach((media) => media.setY());
        checkHeroProgress();
      };

      const onResize = () => {
        screen = { width: window.innerWidth, height: window.innerHeight };
        renderer.setSize(screen.width, screen.height);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });

        const fov = camera.fov * (Math.PI / 180);
        const height = 2 * Math.tan(fov / 2) * camera.position.z;
        viewport = { height, width: height * camera.aspect };

        medias.forEach((media) => media.onResize());
        onScroll(window.scrollY);
      };

      const update = () => {
        medias.forEach((media) => media.update());
        renderer.render({ scene, camera });
        raf = window.requestAnimationFrame(update);
      };

      if (lenisEnabled) {
        const LenisModule = await import("lenis");
        if (destroyed) return;
        const Lenis = LenisModule.default || LenisModule.Lenis;
        lenisInstance = new Lenis({ duration: lenisDuration });
        lenisInstance.on("scroll", (e) => onScroll(e.scroll));
        const lenisRaf = (time) => {
          lenisInstance.raf(time);
          lenisRaf.id = window.requestAnimationFrame(lenisRaf);
        };
        lenisRaf.id = window.requestAnimationFrame(lenisRaf);
        cleanupFns.push(() => window.cancelAnimationFrame(lenisRaf.id));
      } else {
        const nativeScroll = () => onScroll(window.scrollY);
        window.addEventListener("scroll", nativeScroll, { passive: true });
        cleanupFns.push(() =>
          window.removeEventListener("scroll", nativeScroll)
        );
      }

      onResize();
      update();

      window.addEventListener("resize", onResize);
      cleanupFns.push(() => window.removeEventListener("resize", onResize));
    };

    boot().catch((e) =>
      console.error("[ProgressiveBlurGallery] init failed:", e.message)
    );

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(raf);
      cleanupFns.forEach((fn) => fn());
      if (lenisInstance) lenisInstance.destroy();
    };
  }, [
    images,
    cameraFov,
    cameraZ,
    widthSegments,
    heightSegments,
    blurStrength,
    heroBlurAmount,
    heroScaleAmount,
    heroRange,
    noiseAmount,
    blurRadius,
    timeSpeed,
    lenisEnabled,
    lenisDuration,
  ]);

  const caption = (n) =>
    showCaptions ? (
      <small
        className="block text-center font-normal mt-[10px] leading-[0.8]"
        style={{ fontFamily: fontSerif }}
      >
        ({String(n).padStart(2, "0")})
      </small>
    ) : null;

  const figure = (src, ratioClass) => (
    <figure
      data-media
      className={`inline-flex w-full ${ratioClass}`}
    >
      <img src={src} alt="" className="w-full invisible" />
    </figure>
  );

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-x-hidden ${className}`}
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: fontSans }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            [data-list-item] {
              will-change: transform, filter;
              transition: transform 2.5s cubic-bezier(0.6,0.14,0,1), filter 2s cubic-bezier(0.6,0.14,0,1);
              filter: blur(${listBlur}px);
              transform: scale(${listScale}) translateY(${listOffsetY}px);
            }
            [data-list-item][data-visible="true"] {
              filter: blur(0px);
              transform: none;
            }
          `,
        }}
      />

      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-[100dvh] z-0 pointer-events-none"
      />

      <section
        className="w-full flex flex-col justify-center items-center relative text-center pt-[35dvh] mx-0"
        style={{ paddingLeft: gutter, paddingRight: gutter }}
      >
        <h2
          className="cursor-default flex flex-col items-center font-normal mb-[40px] text-[clamp(1.5rem,6.5vw,8rem)] leading-none"
          style={{ fontFamily: fontSerif }}
        >
          <span className="block text-[0.5em] uppercase mb-[15px]">
            {heroEyebrow}
          </span>
          <strong
            className="block font-semibold leading-[0.9] tracking-[-0.05em] uppercase"
            style={{ fontFamily: fontSans }}
          >
            {heroTitle}
          </strong>
        </h2>
        <div className="w-full max-w-[1080px] inline-flex flex-col">
          {figure(images[5], "aspect-[1080/950]")}
          {caption(1)}
        </div>
      </section>

      <section
        className="flex mx-auto"
        style={{
          marginTop: sectionMargin,
          marginBottom: sectionMargin,
          paddingLeft: gutter,
          paddingRight: gutter,
          gap: gutter,
        }}
      >
        <div className="inline-flex flex-col w-[32.0713235%]">
          {figure(images[0], "h-[40.7142857vw]")}
          {caption(2)}
        </div>
        <div className="inline-flex flex-col w-[51.8926471%]">
          {figure(images[1], "h-[40.7142857vw]")}
          {caption(3)}
        </div>
        <div className="inline-flex flex-col w-[15.9558824%]">
          {figure(images[2], "h-[40.7142857vw]")}
          {caption(4)}
        </div>
      </section>

      <section
        className="flex flex-col items-center justify-center mx-auto"
        style={{
          marginTop: sectionMargin,
          marginBottom: sectionMargin,
          paddingLeft: gutter,
          paddingRight: gutter,
        }}
      >
        <div className="inline-flex flex-col w-[20%]">
          {figure(images[3], "aspect-square")}
          {caption(5)}
        </div>
        <div
          className="inline-flex flex-col w-[61.8033989%]"
          style={{ marginTop: gutter }}
        >
          {figure(images[4], "aspect-[376/400]")}
          {caption(6)}
        </div>
      </section>

      <section
        className="flex mx-auto"
        style={{
          marginTop: sectionMargin,
          marginBottom: sectionMargin,
          paddingLeft: gutter,
          paddingRight: gutter,
          gap: gutter,
        }}
      >
        <div className="inline-flex flex-col w-[59.2857143%]">
          {figure(images[6], "aspect-square")}
          {caption(7)}
        </div>
        <div className="inline-flex flex-col w-[22.5714286%]">
          {figure(images[7], "aspect-[316/444]")}
          {caption(8)}
        </div>
      </section>

      <section
        ref={listRef}
        className="flex justify-center text-center mx-auto"
        style={{
          marginTop: sectionMargin,
          marginBottom: sectionMargin,
          paddingLeft: gutter,
          paddingRight: gutter,
        }}
      >
        {listColumns.map((column, ci) => (
          <ul
            key={ci}
            className={`list-none ${ci < listColumns.length - 1 ? "mr-6 md:mr-[86px]" : ""}`}
            style={{ fontFamily: fontSerif }}
          >
            {column.map((label, li) => (
              <li
                key={li}
                data-list-item
                style={{ transitionDelay: `${(li + 1) * listStagger}s` }}
              >
                {label}
              </li>
            ))}
          </ul>
        ))}
      </section>

      <section
        className="flex justify-center mx-auto"
        style={{
          marginTop: sectionMargin,
          marginBottom: sectionMargin,
          paddingLeft: gutter,
          paddingRight: gutter,
        }}
      >
        <div className="inline-flex flex-col w-full max-w-[720px]">
          {figure(images[8], "aspect-[376/400]")}
          {caption(9)}
        </div>
      </section>
    </div>
  );
}