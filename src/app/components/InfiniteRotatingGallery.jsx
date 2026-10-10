"use client";

import { useEffect, useRef, useState } from "react";

// ─── RotatingImageGallery ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images              string[]  DEFAULT_IMAGES  Image URLs rendered as planes
// oglUrl              string    jsdelivr esm    CDN URL for the OGL ESM build
// bgColor             string    #fffdf8         Page background behind canvas
// planeWidth          number    320             Plane width in screen px
// planeHeight         number    300             Plane height in screen px
// gap                 number    0.8             Vertical gap between planes (world units)
// scrollEase          number    0.01            Lerp factor for scroll smoothing (lower = heavier)
// wheelSensitivity    number    0.005           Wheel delta multiplier
// dragSensitivity     number    0.1             Pointer/touch drag multiplier
// cameraFov           number    45              Perspective camera field of view
// cameraDistance      number    20              Camera Z position
// widthSegments       number    100             Plane subdivisions (rotation smoothness)
// distortion          number    3               Shader stagger across the plane surface
// rotationAxis        number[]  [0, 1, 0]       Axis the plane rotates around
// distortionAxis      number[]  [1, 1, 0]       Axis the distortion offset is measured along
// timeStep            number    0.04            uTime increment per frame
// rotationRangeMin    number    5               uPosition value at bottom of viewport
// rotationRangeMax    number    15              uPosition value at top of viewport
// maxDpr              number    2               Device pixel ratio ceiling
// showLoader          boolean   true            Show the dot loader until images preload
// loaderColor         string    #000010         Loader dot color
// fadeDuration        number    1000            Canvas fade-in duration (ms)
// className           string    ""              Extra classes on the wrapper
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
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

const VERTEX_SHADER = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uPosition;
uniform float uTime;
uniform float uSpeed;
uniform vec3 distortionAxis;
uniform vec3 rotationAxis;
uniform float uDistortion;

varying vec2 vUv;
varying vec3 vNormal;

float PI = 3.141592653589793238;

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(oc * axis.x * axis.x + c,          oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
              oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c,          oc * axis.y * axis.z - axis.x * s, 0.0,
              oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c,          0.0,
              0.0,                               0.0,                               0.0,                               1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

float qinticInOut(float t) {
  return t < 0.5
    ? +16.0 * pow(t, 5.0)
    : -0.5 * abs(pow(2.0 * t - 2.0, 5.0)) + 1.0;
}

void main() {
  vUv = uv;
  float norm = 0.5;

  vec3 newpos = position;
  float offset = (dot(distortionAxis, position) + norm / 2.0) / norm;
  float localprogress = clamp((fract(uPosition * 5.0 * 0.01) - 0.01 * uDistortion * offset) / (1.0 - 0.01 * uDistortion), 0.0, 2.0);
  localprogress = qinticInOut(localprogress) * PI;
  newpos = rotate(newpos, rotationAxis, localprogress);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform sampler2D tMap;

varying vec2 vUv;

void main() {
  vec2 ratio = vec2(
    min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.0),
    min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  gl_FragColor.rgb = texture2D(tMap, uv).rgb;
  gl_FragColor.a = 1.0;
}
`;

const lerp = (p1, p2, t) => p1 + (p2 - p1) * t;

const map = (num, min1, max1, min2, max2) => {
  const normalized = (num - min1) / (max1 - min1);
  return normalized * (max2 - min2) + min2;
};

const normalizeWheel = (event) => {
  const LINE_HEIGHT = 40;
  const PAGE_HEIGHT = 800;
  let delta = event.deltaY || 0;
  if (event.deltaMode === 1) delta *= LINE_HEIGHT;
  else if (event.deltaMode === 2) delta *= PAGE_HEIGHT;
  return delta;
};

export default function InfiniteRotatingGallery({
  images = DEFAULT_IMAGES,
  oglUrl = "https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm",
  bgColor = "#fffdf8",
  planeWidth = 320,
  planeHeight = 300,
  gap = 0.8,
  scrollEase = 0.01,
  wheelSensitivity = 0.005,
  dragSensitivity = 0.1,
  cameraFov = 45,
  cameraDistance = 20,
  widthSegments = 100,
  distortion = 3,
  rotationAxis = [0, 1, 0],
  distortionAxis = [1, 1, 0],
  timeStep = 0.04,
  rotationRangeMin = 5,
  rotationRangeMax = 15,
  maxDpr = 2,
  showLoader = true,
  loaderColor = "#000010",
  fadeDuration = 1000,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const imagesKey = images.join("|");
  const rotationKey = rotationAxis.join(",");
  const distortionKey = distortionAxis.join(",");

  useEffect(() => {
    let cancelled = false;
    let frame = null;
    let cleanupEvents = null;

    const preload = () => {
      let loaded = 0;
      images.forEach((source) => {
        const img = new Image();
        img.src = source;
        img.onload = () => {
          loaded += 1;
          if (loaded === images.length && !cancelled) setReady(true);
        };
        img.onerror = () => {
          loaded += 1;
          if (loaded === images.length && !cancelled) setReady(true);
        };
      });
    };

    const start = async () => {
      const importESM = new Function("url", "return import(url)");
      const ogl = await importESM(oglUrl);
      if (cancelled || !canvasRef.current) return;

      const { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } =
        ogl;

      const renderer = new Renderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio, maxDpr),
      });
      const gl = renderer.gl;

      const camera = new Camera(gl);
      camera.fov = cameraFov;
      camera.position.z = cameraDistance;

      const scene = new Transform();
      const geometry = new Plane(gl, { heightSegments: 1, widthSegments });

      const screen = { width: window.innerWidth, height: window.innerHeight };
      const viewport = { width: 0, height: 0 };

      const computeViewport = () => {
        renderer.setSize(screen.width, screen.height);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        const fov = camera.fov * (Math.PI / 180);
        viewport.height = 2 * Math.tan(fov / 2) * camera.position.z;
        viewport.width = viewport.height * camera.aspect;
      };

      computeViewport();

      const scroll = {
        ease: scrollEase,
        current: 0,
        target: 0,
        last: 0,
        position: 0,
      };

      const createMedia = (source, index) => {
        const texture = new Texture(gl, { generateMipmaps: false });

        const program = new Program(gl, {
          depthTest: false,
          depthWrite: false,
          vertex: VERTEX_SHADER,
          fragment: FRAGMENT_SHADER,
          uniforms: {
            tMap: { value: texture },
            uPosition: { value: 0 },
            uPlaneSize: { value: [0, 0] },
            uImageSize: { value: [0, 0] },
            uSpeed: { value: 0 },
            rotationAxis: { value: rotationAxis },
            distortionAxis: { value: distortionAxis },
            uDistortion: { value: distortion },
            uViewportSize: { value: [viewport.width, viewport.height] },
            uTime: { value: 0 },
          },
          cullFace: false,
        });

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = source;
        img.onload = () => {
          texture.image = img;
          program.uniforms.uImageSize.value = [
            img.naturalWidth,
            img.naturalHeight,
          ];
        };

        const plane = new Mesh(gl, { geometry, program });
        plane.setParent(scene);

        const media = { plane, program, extra: 0, index };

        media.layout = () => {
          plane.scale.x = (viewport.width * planeWidth) / screen.width;
          plane.scale.y = (viewport.height * planeHeight) / screen.height;
          program.uniforms.uPlaneSize.value = [plane.scale.x, plane.scale.y];
          program.uniforms.uViewportSize.value = [
            viewport.width,
            viewport.height,
          ];
          media.height = plane.scale.y + gap;
          media.heightTotal = media.height * images.length;
          media.y = media.height * index;
        };

        media.update = (direction) => {
          plane.position.y = media.y - scroll.current - media.extra;

          program.uniforms.uPosition.value = map(
            plane.position.y,
            -viewport.height,
            viewport.height,
            rotationRangeMin,
            rotationRangeMax,
          );
          program.uniforms.uTime.value += timeStep;
          program.uniforms.uSpeed.value = scroll.current;

          const planeOffset = plane.scale.y / 2;
          const isBefore = plane.position.y + planeOffset < -viewport.height;
          const isAfter = plane.position.y - planeOffset > viewport.height;

          if (direction === "up" && isBefore) media.extra -= media.heightTotal;
          if (direction === "down" && isAfter) media.extra += media.heightTotal;
        };

        media.layout();
        return media;
      };

      const medias = images.map(createMedia);

      const onResize = () => {
        screen.width = window.innerWidth;
        screen.height = window.innerHeight;
        computeViewport();
        medias.forEach((media) => media.layout());
      };

      let isDown = false;
      let startY = 0;

      const onTouchDown = (event) => {
        isDown = true;
        scroll.position = scroll.current;
        startY = event.touches ? event.touches[0].clientY : event.clientY;
      };

      const onTouchMove = (event) => {
        if (!isDown) return;
        const y = event.touches ? event.touches[0].clientY : event.clientY;
        scroll.target = scroll.position + (startY - y) * dragSensitivity;
      };

      const onTouchUp = () => {
        isDown = false;
      };

      const onWheel = (event) => {
        scroll.target += normalizeWheel(event) * wheelSensitivity;
      };

      window.addEventListener("resize", onResize);
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("mousedown", onTouchDown);
      window.addEventListener("mousemove", onTouchMove);
      window.addEventListener("mouseup", onTouchUp);
      window.addEventListener("touchstart", onTouchDown, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchUp);

      cleanupEvents = () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("mousedown", onTouchDown);
        window.removeEventListener("mousemove", onTouchMove);
        window.removeEventListener("mouseup", onTouchUp);
        window.removeEventListener("touchstart", onTouchDown);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchUp);
      };

      const update = () => {
        scroll.current = lerp(scroll.current, scroll.target, scroll.ease);
        const direction = scroll.current > scroll.last ? "up" : "down";
        medias.forEach((media) => media.update(direction));
        renderer.render({ scene, camera });
        scroll.last = scroll.current;
        frame = window.requestAnimationFrame(update);
      };

      update();
    };

    preload();
    start().catch((error) => {
      console.error("[RotatingImageGallery] init failed:", error.message);
    });

    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
      if (cleanupEvents) cleanupEvents();
    };
  }, [
    imagesKey,
    oglUrl,
    planeWidth,
    planeHeight,
    gap,
    scrollEase,
    wheelSensitivity,
    dragSensitivity,
    cameraFov,
    cameraDistance,
    widthSegments,
    distortion,
    rotationKey,
    distortionKey,
    timeStep,
    rotationRangeMin,
    rotationRangeMax,
    maxDpr,
  ]);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden touch-none select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none ease-linear"
        style={{
          opacity: ready ? 1 : 0,
          transition: `opacity ${fadeDuration}ms ease`,
        }}
      />

      {showLoader && !ready && (
        <div
          className="fixed top-1/2 left-1/2 z-[1000] w-[60px] h-[60px] -mt-[30px] -ml-[30px] rounded-full animate-pulse"
          style={{ backgroundColor: loaderColor, opacity: 0.4 }}
        />
      )}
    </div>
  );
}
