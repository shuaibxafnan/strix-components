"use client";

import { useEffect, useRef } from "react";

// ─── CircularWebGLGallery ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items            array    DEFAULT_ITEMS  [{ image, text }] gallery entries
// duplicate        bool     true           Repeat the set twice for a denser loop
// bgColor          string   #cbcabd        Canvas clear color
// textColor        string   #545050        Caption + counter color
// planeColor       string   #c4c3b6        Floating background plane color
// bendRadius       number   75             Arc radius; higher = flatter curve
// bendOffset       number   74.5           Vertical offset applied after the arc
// rotateAmount     number   1              Multiplier on plane rotation along the arc
// planeWidth       number   700            Plane width basis (px at 1500px height)
// planeHeight      number   900            Plane height basis (px at 1500px height)
// planePadding     number   2              Gap between planes in world units
// scrollEase       number   0.05           Lerp easing for scroll inertia
// wheelStrength    number   0.005          Wheel delta multiplier
// dragStrength     number   0.01           Pointer drag delta multiplier
// snapToItem       bool     true           Snap to the nearest item after input
// snapDelay        number   200            Debounce before snapping (ms)
// waveAmplitude    number   1.5            Vertex wave height on the planes
// waveSpeed        number   0.04           Vertex wave time increment
// cameraFov        number   45             Camera field of view
// cameraZ          number   20             Camera distance
// bgPlaneCount     number   50             Floating background plane count
// bgPlaneDrift     number   0.05           Upward drift speed of background planes
// showCaption      bool     true           Show the HTML caption overlay
// heading          string   Circular…      Fixed heading text
// tagline          string   webgl gallery  Fixed tagline text
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    image:
      "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
    text: "New Synagogue",
  },
  {
    image:
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
    text: "Paro Taktsang",
  },
  {
    image:
      "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
    text: "Petra",
  },
  {
    image:
      "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
    text: "Gooderham Building",
  },
  {
    image:
      "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
    text: "Catherine Palace",
  },
  {
    image:
      "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
    text: "Sheikh Zayed Mosque",
  },
  {
    image:
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
    text: "Madonna Corona",
  },
  {
    image:
      "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
    text: "Plaza de Espana",
  },
  {
    image:
      "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
    text: "Saint Martin",
  },
  {
    image:
      "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
    text: "Tugela Falls",
  },
  {
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
    text: "Sintra-Cascais",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    text: "Mirador del Rio",
  },
];

const IMAGE_VERTEX = [
  "precision highp float;",
  "attribute vec3 position;",
  "attribute vec2 uv;",
  "uniform mat4 modelViewMatrix;",
  "uniform mat4 projectionMatrix;",
  "uniform float uTime;",
  "uniform float uSpeed;",
  "uniform float uAmplitude;",
  "varying vec2 vUv;",
  "void main() {",
  "  vUv = uv;",
  "  vec3 p = position;",
  "  p.z = (sin(p.x * 4.0 + uTime) * uAmplitude + cos(p.y * 2.0 + uTime) * uAmplitude) * (0.1 + uSpeed * 0.5);",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
  "}",
].join("\n");

const IMAGE_FRAGMENT = [
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

const BG_VERTEX = [
  "attribute vec3 position;",
  "attribute vec3 normal;",
  "uniform mat4 modelViewMatrix;",
  "uniform mat4 projectionMatrix;",
  "void main() {",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
  "}",
].join("\n");

const BG_FRAGMENT = [
  "precision highp float;",
  "uniform vec3 uColor;",
  "void main() {",
  "  gl_FragColor.rgb = uColor;",
  "  gl_FragColor.a = 1.0;",
  "}",
].join("\n");

const lerpFn = (a, b, t) => a + (b - a) * t;
const mapFn = (n, a1, b1, a2, b2) => ((n - a1) / (b1 - a1)) * (b2 - a2) + a2;
const randomFn = (min, max) => Math.random() * (max - min) + min;

export default function CircularWebGLGallery({
  items = DEFAULT_ITEMS,
  duplicate = true,
  bgColor = "#cbcabd",
  textColor = "#545050",
  planeColor = "#c4c3b6",
  bendRadius = 75,
  bendOffset = 74.5,
  rotateAmount = 1,
  planeWidth = 700,
  planeHeight = 900,
  planePadding = 2,
  scrollEase = 0.05,
  wheelStrength = 0.005,
  dragStrength = 0.01,
  snapToItem = true,
  snapDelay = 200,
  waveAmplitude = 1.5,
  waveSpeed = 0.04,
  cameraFov = 45,
  cameraZ = 20,
  bgPlaneCount = 50,
  bgPlaneDrift = 0.05,
  showCaption = true,
  heading = "Circular Gallery",
  tagline = "an endless webgl carousel",
}) {
  const wrapRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const captionRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    let killed = false;
    const cleanups = [];

    const importModule = new Function("url", "return import(url)");

    importModule("https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm")
      .then((ogl) => {
        if (killed || !canvasWrapRef.current) return;

        const {
          Renderer,
          Camera,
          Transform,
          Plane,
          Mesh,
          Program,
          Texture,
          Color,
        } = ogl;

        const list = duplicate ? items.concat(items) : items.slice();
        if (!list.length) return;

        const renderer = new Renderer({
          alpha: false,
          dpr: Math.min(window.devicePixelRatio, 2),
        });
        const gl = renderer.gl;
        const clear = new Color(bgColor);
        gl.clearColor(clear.r, clear.g, clear.b, 1);

        const canvas = gl.canvas;
        canvas.className = "block h-full w-full";
        canvasWrapRef.current.appendChild(canvas);

        const camera = new Camera(gl);
        camera.fov = cameraFov;
        camera.position.z = cameraZ;

        const scene = new Transform();
        const planeGeometry = new Plane(gl, {
          heightSegments: 50,
          widthSegments: 100,
        });
        const bgGeometry = new Plane(gl);

        const scroll = {
          ease: scrollEase,
          current: 0,
          target: 0,
          last: 0,
          position: 0,
        };
        let screen = { width: 0, height: 0 };
        let viewport = { width: 0, height: 0 };
        let direction = "right";
        let isDown = false;
        let startX = 0;
        let snapTimer = null;
        let activeIndex = -1;

        const medias = list.map((entry, index) => {
          const texture = new Texture(gl, { generateMipmaps: false });
          const program = new Program(gl, {
            depthTest: false,
            depthWrite: false,
            vertex: IMAGE_VERTEX,
            fragment: IMAGE_FRAGMENT,
            uniforms: {
              tMap: { value: texture },
              uPlaneSizes: { value: [0, 0] },
              uImageSizes: { value: [0, 0] },
              uSpeed: { value: 0 },
              uAmplitude: { value: waveAmplitude },
              uTime: { value: 100 * Math.random() },
            },
            transparent: true,
          });

          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.src = entry.image;
          img.onload = () => {
            texture.image = img;
            program.uniforms.uImageSizes.value = [
              img.naturalWidth,
              img.naturalHeight,
            ];
          };

          const plane = new Mesh(gl, { geometry: planeGeometry, program });
          plane.setParent(scene);

          return {
            plane,
            program,
            index,
            extra: 0,
            x: 0,
            width: 0,
            widthTotal: 0,
            speed: 0,
          };
        });

        const bgProgram = new Program(gl, {
          vertex: BG_VERTEX,
          fragment: BG_FRAGMENT,
          uniforms: { uColor: { value: new Color(planeColor) } },
          transparent: true,
        });
        const bgMeshes = [];

        const layoutMedia = (media) => {
          const scale = screen.height / 1500;
          media.plane.scale.y =
            (viewport.height * (planeHeight * scale)) / screen.height;
          media.plane.scale.x =
            (viewport.width * (planeWidth * scale)) / screen.width;
          media.program.uniforms.uPlaneSizes.value = [
            media.plane.scale.x,
            media.plane.scale.y,
          ];
          media.width = media.plane.scale.x + planePadding;
          media.widthTotal = media.width * list.length;
          media.x = media.width * media.index;
        };

        const onResize = () => {
          if (!canvasWrapRef.current) return;
          screen = {
            width: canvasWrapRef.current.clientWidth || window.innerWidth,
            height: canvasWrapRef.current.clientHeight || window.innerHeight,
          };
          renderer.setSize(screen.width, screen.height);
          camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });

          const fovRad = camera.fov * (Math.PI / 180);
          const height = 2 * Math.tan(fovRad / 2) * camera.position.z;
          viewport = { height, width: height * camera.aspect };

          medias.forEach(layoutMedia);
        };

        onResize();

        for (let i = 0; i < bgPlaneCount; i++) {
          const mesh = new Mesh(gl, {
            geometry: bgGeometry,
            program: bgProgram,
          });
          const scale = randomFn(0.75, 1);
          mesh.scale.x = 1.6 * scale;
          mesh.scale.y = 0.9 * scale;
          mesh.speed = randomFn(0.75, 1);
          mesh.xExtra = 0;
          mesh.x = mesh.position.x = randomFn(
            -viewport.width * 0.5,
            viewport.width * 0.5,
          );
          mesh.y = mesh.position.y = randomFn(
            -viewport.height * 0.5,
            viewport.height * 0.5,
          );
          bgMeshes.push(mesh);
          scene.addChild(mesh);
        }

        const snap = () => {
          if (!snapToItem || !medias.length) return;
          const width = medias[0].width;
          if (!width) return;
          const itemIndex = Math.round(Math.abs(scroll.target) / width);
          const target = width * itemIndex;
          scroll.target = scroll.target < 0 ? -target : target;
        };

        const queueSnap = () => {
          if (snapTimer) clearTimeout(snapTimer);
          snapTimer = setTimeout(snap, snapDelay);
        };

        const onWheel = (event) => {
          const delta = event.deltaY || event.wheelDelta || event.detail || 0;
          scroll.target += delta * wheelStrength;
          queueSnap();
        };

        const onDown = (event) => {
          isDown = true;
          scroll.position = scroll.current;
          startX = event.touches ? event.touches[0].clientX : event.clientX;
        };

        const onMove = (event) => {
          if (!isDown) return;
          const x = event.touches ? event.touches[0].clientX : event.clientX;
          scroll.target = scroll.position + (startX - x) * dragStrength;
        };

        const onUp = () => {
          if (!isDown) return;
          isDown = false;
          snap();
        };

        const updateCaption = () => {
          if (!showCaption || !medias.length || !medias[0].width) return;
          const count = items.length;
          const raw = Math.round(scroll.current / medias[0].width) % count;
          const idx = ((raw % count) + count) % count;
          if (idx === activeIndex) return;
          activeIndex = idx;
          if (captionRef.current)
            captionRef.current.textContent = items[idx].text || "";
          if (counterRef.current) {
            counterRef.current.textContent =
              String(idx + 1).padStart(2, "0") +
              " / " +
              String(count).padStart(2, "0");
          }
        };

        let rafId;
        const update = () => {
          scroll.current = lerpFn(scroll.current, scroll.target, scroll.ease);
          direction = scroll.current > scroll.last ? "right" : "left";

          medias.forEach((media) => {
            const plane = media.plane;
            plane.position.x = media.x - scroll.current - media.extra;
            plane.position.y =
              Math.cos((plane.position.x / media.widthTotal) * Math.PI) *
                bendRadius -
              bendOffset;
            plane.rotation.z =
              mapFn(
                plane.position.x,
                -media.widthTotal,
                media.widthTotal,
                Math.PI,
                -Math.PI,
              ) * rotateAmount;

            media.speed = scroll.current - scroll.last;
            media.program.uniforms.uTime.value += waveSpeed;
            media.program.uniforms.uSpeed.value = media.speed;

            const planeOffset = plane.scale.x / 2;
            const viewportOffset = viewport.width;
            const isBefore = plane.position.x + planeOffset < -viewportOffset;
            const isAfter = plane.position.x - planeOffset > viewportOffset;
            if (direction === "right" && isBefore)
              media.extra -= media.widthTotal;
            if (direction === "left" && isAfter)
              media.extra += media.widthTotal;
          });

          bgMeshes.forEach((mesh) => {
            mesh.position.x =
              mesh.x - scroll.current * mesh.speed - mesh.xExtra;
            const viewportOffset = viewport.width * 0.5;
            const widthTotal = viewport.width + mesh.scale.x;
            const isBefore = mesh.position.x < -viewportOffset;
            const isAfter = mesh.position.x > viewportOffset;
            if (direction === "right" && isBefore) mesh.xExtra -= widthTotal;
            if (direction === "left" && isAfter) mesh.xExtra += widthTotal;
            mesh.position.y += bgPlaneDrift * mesh.speed;
            if (mesh.position.y > viewport.height * 0.5 + mesh.scale.y) {
              mesh.position.y -= viewport.height + mesh.scale.y;
            }
          });

          updateCaption();
          renderer.render({ scene, camera });
          scroll.last = scroll.current;
          rafId = requestAnimationFrame(update);
        };
        rafId = requestAnimationFrame(update);

        const host = wrapRef.current;
        window.addEventListener("resize", onResize);
        host.addEventListener("wheel", onWheel, { passive: true });
        host.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        host.addEventListener("touchstart", onDown, { passive: true });
        window.addEventListener("touchmove", onMove, { passive: true });
        window.addEventListener("touchend", onUp);

        cleanups.push(() => {
          cancelAnimationFrame(rafId);
          if (snapTimer) clearTimeout(snapTimer);
          window.removeEventListener("resize", onResize);
          host.removeEventListener("wheel", onWheel);
          host.removeEventListener("mousedown", onDown);
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
          host.removeEventListener("touchstart", onDown);
          window.removeEventListener("touchmove", onMove);
          window.removeEventListener("touchend", onUp);
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
          const ext = gl.getExtension("WEBGL_lose_context");
          if (ext) ext.loseContext();
        });
      })
      .catch((e) =>
        console.error("[CircularWebGLGallery] OGL load failed:", e.message),
      );

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [
    items,
    duplicate,
    bgColor,
    planeColor,
    bendRadius,
    bendOffset,
    rotateAmount,
    planeWidth,
    planeHeight,
    planePadding,
    scrollEase,
    wheelStrength,
    dragStrength,
    snapToItem,
    snapDelay,
    waveAmplitude,
    waveSpeed,
    cameraFov,
    cameraZ,
    bgPlaneCount,
    bgPlaneDrift,
    showCaption,
  ]);

  return (
    <div
      ref={wrapRef}
      className="relative h-screen w-full cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div ref={canvasWrapRef} className="absolute inset-0" />

      <div className="pointer-events-none relative z-[100] grid h-full w-full content-between p-8 text-center min-[53em]:grid-cols-[75%_25%] min-[53em]:p-12 min-[53em]:text-left">
        <div className="min-[53em]:flex min-[53em]:items-baseline">
          <h1 className="m-0 text-[15px] font-normal">{heading}</h1>
          <p className="m-0 mt-2 text-[15px] opacity-50 min-[53em]:mt-0 min-[53em]:ml-4 min-[53em]:pl-4">
            {tagline}
          </p>
        </div>

        {showCaption ? (
          <div className="col-start-1 self-end min-[53em]:col-span-2">
            <p
              ref={captionRef}
              className="m-0 text-[clamp(1.5rem,4vw,3rem)] font-light leading-none tracking-tight"
            />
            <p
              ref={counterRef}
              className="m-0 mt-2 text-[13px] tracking-[0.2em] opacity-50"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
