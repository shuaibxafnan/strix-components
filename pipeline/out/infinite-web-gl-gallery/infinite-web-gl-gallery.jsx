"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_LAYOUT = [
  { width: 53, height: 80, left: 0, top: 0 },
  { width: 47, height: 70, left: 73, bottom: 0 },
  { width: 60, height: 90, left: 140, top: 10 },
  { width: 50, height: 75, left: 220, top: 0 },
  { width: 50, height: 75, left: 290, bottom: 0 },
  { width: 50, height: 75, left: 360, top: 20 },
  { width: 70, height: 75, left: 430, top: 30 },
  { width: 50, height: 82, left: 512, top: 5 },
  { width: 58, height: 68, left: 580, bottom: 0 },
  { width: 50, height: 88, left: 655, top: 12 },
  { width: 62, height: 72, left: 722, top: 0 },
  { width: 52, height: 78, left: 800, bottom: 0 },
];

const MEDIA_VERTEX = [
  "#define PI 3.1415926535897932384626433832795",
  "precision highp float;",
  "precision highp int;",
  "attribute vec3 position;",
  "attribute vec2 uv;",
  "uniform mat4 modelViewMatrix;",
  "uniform mat4 projectionMatrix;",
  "uniform float uStrength;",
  "uniform vec2 uViewportSizes;",
  "varying vec2 vUv;",
  "void main() {",
  "  vec4 newPosition = modelViewMatrix * vec4(position, 1.0);",
  "  newPosition.z += -abs(sin(newPosition.x / uViewportSizes.x * PI + PI / 2.0) * uStrength);",
  "  vUv = uv;",
  "  gl_Position = projectionMatrix * newPosition;",
  "}",
].join("\n");

const MEDIA_FRAGMENT = [
  "precision highp float;",
  "uniform vec2 uImageSizes;",
  "uniform vec2 uPlaneSizes;",
  "uniform sampler2D tMap;",
  "varying vec2 vUv;",
  "void main() {",
  "  vec2 ratio = vec2(",
  "    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),",
  "    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)",
  "  );",
  "  vec2 uv = vec2(",
  "    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,",
  "    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5",
  "  );",
  "  gl_FragColor.rgb = texture2D(tMap, uv).rgb;",
  "  gl_FragColor.a = 1.0;",
  "}",
].join("\n");

const POST_FRAGMENT = [
  "precision highp float;",
  "uniform sampler2D tMap;",
  "uniform vec2 uResolution;",
  "uniform float uStrength;",
  "varying vec2 vUv;",
  "void main() {",
  "  vec3 color;",
  "  color.r = texture2D(tMap, vec2(vUv.x + uStrength, vUv.y)).r;",
  "  color.g = texture2D(tMap, vUv).g;",
  "  color.b = texture2D(tMap, vec2(vUv.x - uStrength, vUv.y)).b;",
  "  gl_FragColor = vec4(color, 1.0);",
  "}",
].join("\n");

const lerp = (p1, p2, t) => p1 + (p2 - p1) * t;

const normalizeWheel = (event) => {
  let pixelY = event.deltaY || 0;
  if (event.deltaMode === 1) pixelY *= 16;
  else if (event.deltaMode === 2) pixelY *= 400;
  return pixelY;
};

export default function InfiniteWebGlGallery({
  images = DEFAULT_IMAGES,
  layout = DEFAULT_LAYOUT,
  unitBase = 1920,
  unitSize = 10,
  galleryUnits = 880,
  bgColor = "#0c0c0c",
  title = "Voltage",
  showTitle = true,
  titleColor = "#ffffff",
  titleClassName = "",
  autoSpeed = 2,
  scrollEase = 0.05,
  wheelMultiplier = 0.5,
  dragMultiplier = 2,
  enableDrag = true,
  enableWheel = true,
  cameraFov = 45,
  cameraZ = 5,
  planeSegments = 20,
  bendStrength = 5,
  rgbShiftStrength = 0.5,
  fadeInDuration = 1,
  className = "",
}) {
  const rootRef = useRef(null);
  const galleryRef = useRef(null);
  const canvasHolderRef = useRef(null);

  const settings = useRef({});
  settings.current = {
    autoSpeed,
    scrollEase,
    wheelMultiplier,
    dragMultiplier,
    enableDrag,
    enableWheel,
    bendStrength,
    rgbShiftStrength,
  };

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let cleanupFns = [];

    import("ogl")
      .then((OGL) => {
        if (disposed) return;
        const root = rootRef.current;
        const gallery = galleryRef.current;
        const holder = canvasHolderRef.current;
        if (!root || !gallery || !holder) return;

        const {
          Renderer,
          Camera,
          Transform,
          Plane,
          Mesh,
          Program,
          Texture,
          Post,
          Vec2,
        } = OGL;

        const renderer = new Renderer({
          alpha: true,
          dpr: Math.min(window.devicePixelRatio, 2),
        });
        const gl = renderer.gl;
        gl.canvas.style.width = "100%";
        gl.canvas.style.height = "100%";
        gl.canvas.style.display = "block";
        gl.canvas.style.opacity = "0";
        gl.canvas.style.transition = "opacity " + fadeInDuration + "s ease";
        holder.appendChild(gl.canvas);

        const camera = new Camera(gl);
        camera.fov = cameraFov;
        camera.position.z = cameraZ;

        const scene = new Transform();

        const resolution = { value: new Vec2() };
        const post = new Post(gl);
        const pass = post.addPass({
          fragment: POST_FRAGMENT,
          uniforms: {
            uResolution: resolution,
            uStrength: { value: 0 },
          },
        });

        const planeGeometry = new Plane(gl, { widthSegments: planeSegments });

        let screen = { width: 1, height: 1 };
        let viewport = { width: 1, height: 1 };
        let stripWidth = 1;

        class Media {
          constructor(element) {
            this.element = element;
            this.image = element.querySelector("img");
            this.extra = 0;
            this.createMesh();
            this.createBounds();
          }

          createMesh() {
            const texture = new Texture(gl, { generateMipmaps: false });
            const program = new Program(gl, {
              vertex: MEDIA_VERTEX,
              fragment: MEDIA_FRAGMENT,
              uniforms: {
                tMap: { value: texture },
                uPlaneSizes: { value: [0, 0] },
                uImageSizes: { value: [0, 0] },
                uViewportSizes: { value: [viewport.width, viewport.height] },
                uStrength: { value: 0 },
              },
              transparent: true,
            });

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = this.image.getAttribute("data-src");
            img.onload = () => {
              program.uniforms.uImageSizes.value = [
                img.naturalWidth,
                img.naturalHeight,
              ];
              texture.image = img;
            };

            this.plane = new Mesh(gl, { geometry: planeGeometry, program });
            this.plane.setParent(scene);
          }

          createBounds() {
            this.bounds = this.element.getBoundingClientRect();
            this.updateScale();
            this.updateX();
            this.updateY();
            this.plane.program.uniforms.uPlaneSizes.value = [
              this.plane.scale.x,
              this.plane.scale.y,
            ];
          }

          updateScale() {
            this.plane.scale.x =
              (viewport.width * this.bounds.width) / screen.width;
            this.plane.scale.y =
              (viewport.height * this.bounds.height) / screen.height;
          }

          updateX(x = 0) {
            this.plane.position.x =
              -(viewport.width / 2) +
              this.plane.scale.x / 2 +
              ((this.bounds.left - x) / screen.width) * viewport.width -
              this.extra;
          }

          updateY(y = 0) {
            this.plane.position.y =
              viewport.height / 2 -
              this.plane.scale.y / 2 -
              ((this.bounds.top - y) / screen.height) * viewport.height;
          }

          update(x, direction) {
            this.updateScale();
            this.updateX(x.current);
            this.updateY();

            const planeOffset = this.plane.scale.x / 2;
            const viewportOffset = viewport.width / 2;

            this.isBefore =
              this.plane.position.x + planeOffset < -viewportOffset;
            this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

            if (direction === "down" && this.isBefore) {
              this.extra -= stripWidth;
              this.isBefore = false;
              this.isAfter = false;
            }

            if (direction === "up" && this.isAfter) {
              this.extra += stripWidth;
              this.isBefore = false;
              this.isAfter = false;
            }

            this.plane.program.uniforms.uStrength.value =
              ((x.current - x.last) / screen.width) *
              settings.current.bendStrength;
          }

          onResize() {
            this.extra = 0;
            this.plane.program.uniforms.uViewportSizes.value = [
              viewport.width,
              viewport.height,
            ];
            this.createBounds();
          }
        }

        let medias = [];

        const onResize = () => {
          const rect = root.getBoundingClientRect();
          screen = { width: rect.width || 1, height: rect.height || 1 };

          renderer.setSize(screen.width, screen.height);
          camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });

          const fovRad = camera.fov * (Math.PI / 180);
          const height = 2 * Math.tan(fovRad / 2) * camera.position.z;
          viewport = { height, width: height * camera.aspect };

          post.resize();
          resolution.value.set(gl.canvas.width, gl.canvas.height);

          const galleryBounds = gallery.getBoundingClientRect();
          stripWidth = (viewport.width * galleryBounds.width) / screen.width;

          medias.forEach((media) => media.onResize());
        };

        onResize();

        medias = Array.from(gallery.querySelectorAll("[data-figure]")).map(
          (element) => new Media(element),
        );

        const scroll = {
          ease: settings.current.scrollEase,
          current: 0,
          target: 0,
          last: 0,
          position: 0,
        };
        let speed = settings.current.autoSpeed;
        let direction = "down";
        let isDown = false;
        let start = 0;

        const onTouchDown = (event) => {
          if (!settings.current.enableDrag) return;
          isDown = true;
          scroll.position = scroll.current;
          start = event.touches ? event.touches[0].clientX : event.clientX;
        };

        const onTouchMove = (event) => {
          if (!isDown || !settings.current.enableDrag) return;
          const x = event.touches ? event.touches[0].clientX : event.clientX;
          const distance = (start - x) * settings.current.dragMultiplier;
          scroll.target = scroll.position + distance;
        };

        const onTouchUp = () => {
          isDown = false;
        };

        const onWheel = (event) => {
          if (!settings.current.enableWheel) return;
          scroll.target +=
            normalizeWheel(event) * settings.current.wheelMultiplier;
        };

        const update = () => {
          scroll.target += speed;
          scroll.current = lerp(
            scroll.current,
            scroll.target,
            settings.current.scrollEase,
          );

          if (scroll.current > scroll.last) {
            direction = "down";
            speed = settings.current.autoSpeed;
          } else if (scroll.current < scroll.last) {
            direction = "up";
            speed = -settings.current.autoSpeed;
          }

          medias.forEach((media) => media.update(scroll, direction));

          pass.uniforms.uStrength.value =
            ((scroll.current - scroll.last) / screen.width) *
            settings.current.rgbShiftStrength;

          post.render({ scene, camera });

          scroll.last = scroll.current;
          raf = window.requestAnimationFrame(update);
        };

        update();
        window.requestAnimationFrame(() => {
          gl.canvas.style.opacity = "1";
        });

        const observer = new ResizeObserver(onResize);
        observer.observe(root);

        window.addEventListener("resize", onResize);
        root.addEventListener("wheel", onWheel, { passive: true });
        root.addEventListener("mousedown", onTouchDown);
        window.addEventListener("mousemove", onTouchMove);
        window.addEventListener("mouseup", onTouchUp);
        root.addEventListener("touchstart", onTouchDown, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchUp);

        cleanupFns.push(() => {
          window.cancelAnimationFrame(raf);
          observer.disconnect();
          window.removeEventListener("resize", onResize);
          root.removeEventListener("wheel", onWheel);
          root.removeEventListener("mousedown", onTouchDown);
          window.removeEventListener("mousemove", onTouchMove);
          window.removeEventListener("mouseup", onTouchUp);
          root.removeEventListener("touchstart", onTouchDown);
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("touchend", onTouchUp);
          if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
          const lose = gl.getExtension("WEBGL_lose_context");
          if (lose) lose.loseContext();
        });
      })
      .catch(() => {});

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];
    };
  }, [
    images,
    layout,
    cameraFov,
    cameraZ,
    planeSegments,
    fadeInDuration,
    galleryUnits,
    unitBase,
    unitSize,
  ]);

  const unit = "calc(100vw / " + unitBase + " * " + unitSize + ")";
  const u = (n) => "calc(" + n + " * " + unit + ")";

  return (
    <div
      ref={rootRef}
      className={
        "relative w-full h-screen overflow-hidden select-none touch-none " +
        className
      }
      style={{ backgroundColor: bgColor }}
    >
      <div ref={canvasHolderRef} className="absolute inset-0 z-[1]" />

      <div
        ref={galleryRef}
        className="absolute left-0 top-0 h-full invisible pointer-events-none"
        style={{ width: u(galleryUnits) }}
      >
        {layout.map((item, i) => (
          <figure
            key={i}
            data-figure="true"
            className="absolute m-0"
            style={{
              width: u(item.width),
              height: u(item.height),
              left: u(item.left),
              top: item.top !== undefined ? u(item.top) : undefined,
              bottom: item.bottom !== undefined ? u(item.bottom) : undefined,
            }}
          >
            <img
              alt=""
              data-src={images[i % images.length]}
              className="absolute left-0 top-0 w-full h-full object-cover"
            />
          </figure>
        ))}
      </div>

      {showTitle ? (
        <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
          <h1
            className={
              "font-serif font-extrabold leading-none tracking-tight text-center " +
              titleClassName
            }
            style={{ color: titleColor, fontSize: u(20) }}
          >
            {title}
          </h1>
        </div>
      ) : null}
    </div>
  );
}
