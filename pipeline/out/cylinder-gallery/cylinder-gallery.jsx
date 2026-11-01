"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=512&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=512&q=80",
];

const INSTANCED_VERTEX_SHADER = `
#define PI 3.14159265359
attribute float aAngle;
attribute float aHeight;
attribute float aRadius;
attribute float aAspectRatio;
attribute float aSpeed;
attribute vec4 aTextureCoords;
varying vec4 vTextureCoords;
varying vec2 vUv;
uniform float uMaxZ;
uniform float uZrange;
uniform float uScrollY;
uniform float uSpeedY;

vec4 getQuaternionFromAxisAngle(vec3 axis, float angle) {
    float halfAngle = angle * 0.5;
    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
}

void main() {
    vec3 scaledPosition = position;
    scaledPosition.y /= aAspectRatio;

    float zPos = aHeight + uScrollY;
    float zRange = uZrange;
    float minZ = (uMaxZ - uZrange);
    zPos = mod(zPos - minZ, zRange) + minZ;

    float theta = aAngle + uSpeedY * 0.4 * aSpeed;
    vec3 instancePosition = vec3(cos(theta) * aRadius, zPos, sin(theta) * aRadius);

    float angle = atan(instancePosition.x, instancePosition.z);
    vec4 rotation = getQuaternionFromAxisAngle(vec3(0.0, 1.0, 0.0), angle);
    vec3 finalPosition = scaledPosition +
        2.0 * cross(rotation.xyz, cross(rotation.xyz, scaledPosition) + rotation.w * scaledPosition);

    vec4 modelPosition = modelMatrix * vec4(instancePosition + finalPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    vUv = uv;
    vTextureCoords = aTextureCoords;
}
`;

const INSTANCED_FRAGMENT_SHADER = `
varying vec2 vUv;
varying vec4 vTextureCoords;
uniform sampler2D uAtlas;

void main() {
    float xStart = vTextureCoords.x;
    float xEnd = vTextureCoords.y;
    float yStart = vTextureCoords.z;
    float yEnd = vTextureCoords.w;

    vec2 atlasUv = vec2(
        mix(xStart, xEnd, vUv.x),
        mix(yStart, yEnd, 1.0 - vUv.y)
    );

    gl_FragColor = texture2D(uAtlas, atlasUv);
}
`;

const CENTER_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    vUv = uv;
}
`;

const CENTER_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform sampler2D uAtlas;
uniform vec4 uTextureCoords;

void main() {
    float xStart = uTextureCoords.x;
    float xEnd = uTextureCoords.y;
    float yStart = uTextureCoords.z;
    float yEnd = uTextureCoords.w;

    vec2 atlasUv = vec2(
        mix(xStart, xEnd, vUv.x),
        mix(yStart, yEnd, 1.0 - vUv.y)
    );

    gl_FragColor = texture2D(uAtlas, atlasUv);
}
`;

function normalizeWheelDelta(event) {
  let deltaY = event.deltaY;
  if (event.deltaMode === 1) deltaY *= 18;
  else if (event.deltaMode === 2) deltaY *= window.innerHeight;
  return deltaY;
}

function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

export default function CylinderGallery({
  images = DEFAULT_IMAGES,
  bgColor = "#0a0a0a",
  radius = 6,
  cylinderHeight = 120,
  instanceCount = 600,
  boxWidth = 1.5,
  boxHeight = 1.5,
  boxDepth = 0.075,
  centerPlaneWidth = 1.7,
  centerPlaneHeight = 2.3,
  cameraZ = 5,
  cameraFov = 50,
  autoScrollSpeed = 0.015,
  scrollSpeedMultiplier = 1,
  smoothing = 0.1,
  rotationSpeedMin = 0.8,
  rotationSpeedMax = 1,
  pixelRatioMax = 2,
  preventPageScroll = true,
  className = "",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {

    let cancelled = false;
    let cleanup = () => {};

    import("three")
      .then(async (THREE) => {
        if (cancelled || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;

        const loadedImages = await Promise.all(
          images.map(
            (src) =>
              new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = src;
              }),
          ),
        );
        const validImages = loadedImages.filter(Boolean);
        if (cancelled || validImages.length === 0) return;

        const atlasWidth = Math.max(...validImages.map((img) => img.width));
        const totalHeight = validImages.reduce(
          (sum, img) => sum + img.height,
          0,
        );

        const atlasCanvas = document.createElement("canvas");
        atlasCanvas.width = atlasWidth;
        atlasCanvas.height = totalHeight;
        const ctx = atlasCanvas.getContext("2d");

        let currentY = 0;
        const imageInfos = validImages.map((img) => {
          ctx.drawImage(img, 0, currentY);
          const info = {
            aspectRatio: img.width / img.height,
            uvs: {
              xStart: 0,
              xEnd: img.width / atlasWidth,
              yStart: 1 - currentY / totalHeight,
              yEnd: 1 - (currentY + img.height) / totalHeight,
            },
          };
          currentY += img.height;
          return info;
        });

        const atlasTexture = new THREE.Texture(atlasCanvas);
        atlasTexture.colorSpace = THREE.SRGBColorSpace;
        atlasTexture.needsUpdate = true;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(cameraFov, 1, 0.1, 200);
        camera.position.z = cameraZ;
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });

        const scrollY = {
          speedTarget: 0,
          speedCurrent: 0,
          target: 0,
          current: 0,
          direction: 1,
        };
        let lastWheelDirection = 1;
        let textureIndex = 0;

        const instancedGeometry = new THREE.BoxGeometry(
          boxWidth,
          boxHeight,
          boxDepth,
        );
        const instancedMaterial = new THREE.ShaderMaterial({
          vertexShader: INSTANCED_VERTEX_SHADER,
          fragmentShader: INSTANCED_FRAGMENT_SHADER,
          precision: "highp",
          transparent: true,
          uniforms: {
            uAtlas: { value: atlasTexture },
            uScrollY: { value: 0 },
            uSpeedY: { value: 0 },
            uZrange: { value: cylinderHeight },
            uMaxZ: { value: cylinderHeight * 0.5 },
          },
        });

        const instancedMesh = new THREE.InstancedMesh(
          instancedGeometry,
          instancedMaterial,
          instanceCount,
        );

        const ringCount = Math.max(1, Math.floor(cylinderHeight / 3));
        const ringHeight = cylinderHeight / ringCount;
        const ringSpeeds = new Float32Array(ringCount);
        for (let r = 0; r < ringCount; r++) {
          ringSpeeds[r] =
            rotationSpeedMin +
            Math.random() * (rotationSpeedMax - rotationSpeedMin);
        }

        const aAngles = new Float32Array(instanceCount);
        const aHeights = new Float32Array(instanceCount);
        const aRadiuses = new Float32Array(instanceCount);
        const aAspectRatios = new Float32Array(instanceCount);
        const aSpeeds = new Float32Array(instanceCount);
        const aTextureCoords = new Float32Array(instanceCount * 4);

        for (let i = 0; i < instanceCount; i++) {
          const imageIndex = Math.floor(Math.random() * imageInfos.length);
          const info = imageInfos[imageIndex];

          aTextureCoords[i * 4 + 0] = info.uvs.xStart;
          aTextureCoords[i * 4 + 1] = info.uvs.xEnd;
          aTextureCoords[i * 4 + 2] = info.uvs.yStart;
          aTextureCoords[i * 4 + 3] = info.uvs.yEnd;

          aAngles[i] = (i / instanceCount) * Math.PI * 2;
          aHeights[i] = (i % ringCount) * ringHeight - cylinderHeight / 2;
          aRadiuses[i] = radius;
          aAspectRatios[i] = info.aspectRatio;
          aSpeeds[i] = ringSpeeds[i % ringCount];
        }

        instancedMesh.geometry.setAttribute(
          "aAngle",
          new THREE.InstancedBufferAttribute(aAngles, 1),
        );
        instancedMesh.geometry.setAttribute(
          "aHeight",
          new THREE.InstancedBufferAttribute(aHeights, 1),
        );
        instancedMesh.geometry.setAttribute(
          "aRadius",
          new THREE.InstancedBufferAttribute(aRadiuses, 1),
        );
        instancedMesh.geometry.setAttribute(
          "aAspectRatio",
          new THREE.InstancedBufferAttribute(aAspectRatios, 1),
        );
        instancedMesh.geometry.setAttribute(
          "aSpeed",
          new THREE.InstancedBufferAttribute(aSpeeds, 1),
        );
        instancedMesh.geometry.setAttribute(
          "aTextureCoords",
          new THREE.InstancedBufferAttribute(aTextureCoords, 4),
        );
        scene.add(instancedMesh);

        const centerGeometry = new THREE.PlaneGeometry(
          centerPlaneWidth,
          centerPlaneHeight,
        );
        const centerMaterial = new THREE.ShaderMaterial({
          vertexShader: CENTER_VERTEX_SHADER,
          fragmentShader: CENTER_FRAGMENT_SHADER,
          uniforms: {
            uAtlas: { value: atlasTexture },
            uTextureCoords: {
              value: new THREE.Vector4(
                imageInfos[0].uvs.xStart,
                imageInfos[0].uvs.xEnd,
                imageInfos[0].uvs.yStart,
                imageInfos[0].uvs.yEnd,
              ),
            },
          },
        });
        const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);
        scene.add(centerMesh);

        function onWheel(event) {
          if (preventPageScroll) event.preventDefault();
          const normalizedDelta =
            normalizeWheelDelta(event) * 0.01 * scrollSpeedMultiplier;
          const direction = Math.sign(event.deltaY) || lastWheelDirection;
          lastWheelDirection = direction;
          scrollY.direction = direction;
          scrollY.speedTarget += normalizedDelta;
          scrollY.target += normalizedDelta;
        }

        function onResize() {
          const w = container.clientWidth;
          const h = container.clientHeight || window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(
            Math.min(pixelRatioMax, window.devicePixelRatio || 1),
          );
          renderer.setSize(w, h);
        }

        window.addEventListener("wheel", onWheel, {
          passive: !preventPageScroll,
        });
        window.addEventListener("resize", onResize);
        onResize();

        const clock = new THREE.Clock();
        let rafId;
        function animate() {
          rafId = requestAnimationFrame(animate);

          scrollY.target += autoScrollSpeed * scrollY.direction;
          scrollY.speedTarget += autoScrollSpeed * scrollY.direction;

          textureIndex = Math.abs(
            Math.floor(scrollY.speedTarget % (imageInfos.length - 1 || 1)),
          );
          const info = imageInfos[textureIndex] || imageInfos[0];
          centerMaterial.uniforms.uTextureCoords.value.set(
            info.uvs.xStart,
            info.uvs.xEnd,
            info.uvs.yStart,
            info.uvs.yEnd,
          );

          scrollY.current = lerp(scrollY.current, scrollY.target, smoothing);
          scrollY.speedCurrent = lerp(
            scrollY.speedCurrent,
            scrollY.speedTarget,
            smoothing,
          );

          instancedMaterial.uniforms.uScrollY.value = scrollY.current;
          instancedMaterial.uniforms.uSpeedY.value = scrollY.speedCurrent;

          renderer.render(scene, camera);
        }
        animate();

        cleanup = () => {
          cancelAnimationFrame(rafId);
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("resize", onResize);
          instancedGeometry.dispose();
          instancedMaterial.dispose();
          centerGeometry.dispose();
          centerMaterial.dispose();
          atlasTexture.dispose();
          renderer.dispose();
          clock.stop();
        };
      })
      .catch((e) =>
        console.error("[CylinderGallery] scene setup failed:", e.message),
      );

    return () => {
      cancelled = true;
      cleanup();
    };

  }, [images, instanceCount]);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
