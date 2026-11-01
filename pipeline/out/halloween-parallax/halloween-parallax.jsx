"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  uniform mat3 normalMatrix;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D textureImage;
  uniform sampler2D textureDepth;
  uniform sampler2D textureNormal;
  uniform sampler2D textureNoise;
  uniform vec2 mousePosition;
  uniform float time;

  float PI = 3.141592;

  void main () {
    vec4 texDepth = texture2D(textureDepth, vUv);
    vec4 texNoise = texture2D(textureNoise, vUv + time * .05);
    vec4 texNoise2 = texture2D(textureNoise, vUv * .1 + time * .1);

    float depthVal = texDepth.r - .7;
    float noiseVal = texNoise.r - .5;
    float noiseVal2 = texNoise2.r - .5;

    float distToCenter = pow(distance(vUv, vec2(.5, .5)), 4.0);
    float distToMouse = 1.0 - smoothstep(0.0, 0.25, distance(mousePosition + vec2(.5, .5), vUv));

    vec2 dispDepth = vUv + mousePosition * depthVal * .1;
    vec2 dispWaves = vec2(noiseVal * distToCenter);
    vec2 dispMouse = vec2(noiseVal2 * .10 * distToMouse);

    vec4 texImage = texture2D(textureImage, dispDepth + dispWaves + dispMouse);
    vec4 texNormal = texture2D(textureNormal, dispDepth + dispWaves + dispMouse);

    vec4 particles = texture2D(textureNoise, dispWaves + vec2(vUv.x - sin(time * .5), vUv.y - sin(time)));
    float thr1 = .05 + sin(time * 4.0) * .05;
    texImage.rgb *= smoothstep(thr1, thr1 + .03, particles.r);

    vec4 displacedDepth = texture2D(textureDepth, dispDepth + dispWaves + dispMouse);
    vec4 smokeNoise1 = texture2D(textureNoise, dispDepth - vec2(time * .3));
    texImage.r *= 1. + (displacedDepth.b * (40.0 + smokeNoise1.r) * pow(1.0 - vUv.y, 6.0) * (1.0 + sin(time * 1.0)) * .1);

    vec4 smokeNoise2 = texture2D(textureNoise, dispDepth - vec2(time * .1, time * .5));
    texImage.b *= 1. + (displacedDepth.g * (6.0 + sin(time * 5.0)) * (.5 + smokeNoise2.r * (1.0 + sin(time) * .5)) * vUv.y);

    float lighteningValue = texture2D(textureNoise, vec2(time * .1)).r;
    lighteningValue = 1. - smoothstep(.6, .65, lighteningValue) * .3;
    texImage.rg *= lighteningValue;

    vec3 lightDirection = normalize(vec3(mousePosition.x, mousePosition.y, .3));
    vec3 pixDirection = normalize(vec3(texNormal.r * 2.0 - 1.0, texNormal.b * 2.0 - 1.0, -texNormal.g * 2.0 + 1.0));
    float lightVal = dot(pixDirection, lightDirection);
    texImage.rgb *= .9 + (distToMouse * lightVal * (1.0 - displacedDepth.g)) * (2.0 + sin(time) * .5);

    gl_FragColor = vec4(texImage);
  }
`;

const MAP_WIDTH = 256;

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });

const buildDepthAndNormal = (img) => {
  const width = MAP_WIDTH;
  const height = Math.max(1, Math.round((width * img.naturalHeight) / img.naturalWidth));

  const small = document.createElement("canvas");
  small.width = 64;
  small.height = Math.max(1, Math.round((64 * img.naturalHeight) / img.naturalWidth));
  small.getContext("2d").drawImage(img, 0, 0, small.width, small.height);

  const blurred = document.createElement("canvas");
  blurred.width = width;
  blurred.height = height;
  const bctx = blurred.getContext("2d");
  bctx.imageSmoothingEnabled = true;
  bctx.imageSmoothingQuality = "high";
  bctx.drawImage(small, 0, 0, width, height);

  const { data } = bctx.getImageData(0, 0, width, height);
  const lum = new Float32Array(width * height);
  let min = 1;
  let max = 0;
  for (let i = 0; i < lum.length; i++) {
    const v =
      (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
    lum[i] = v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = Math.max(max - min, 0.001);
  for (let i = 0; i < lum.length; i++) lum[i] = (lum[i] - min) / range;

  const depthCanvas = document.createElement("canvas");
  depthCanvas.width = width;
  depthCanvas.height = height;
  const dctx = depthCanvas.getContext("2d");
  const depthData = dctx.createImageData(width, height);

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = width;
  normalCanvas.height = height;
  const nctx = normalCanvas.getContext("2d");
  const normalData = nctx.createImageData(width, height);

  const at = (x, y) =>
    lum[Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))];
  const strength = 3;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const d = lum[y * width + x] * 255;
      depthData.data[i] = d;
      depthData.data[i + 1] = d;
      depthData.data[i + 2] = d;
      depthData.data[i + 3] = 255;

      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const nx = -dx;
      const ny = dy;
      const length = Math.hypot(nx, ny, 1);
      normalData.data[i] = (nx / length) * 127.5 + 127.5;
      normalData.data[i + 1] = 127.5 - (1 / length) * 127.5;
      normalData.data[i + 2] = (ny / length) * 127.5 + 127.5;
      normalData.data[i + 3] = 255;
    }
  }

  dctx.putImageData(depthData, 0, 0);
  nctx.putImageData(normalData, 0, 0);
  return { depthCanvas, normalCanvas };
};

const buildNoise = () => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(size, size);

  const octaves = [
    { cells: 8, weight: 0.6 },
    { cells: 16, weight: 0.3 },
    { cells: 32, weight: 0.1 },
  ].map(({ cells, weight }) => ({
    cells,
    weight,
    grid: Float32Array.from({ length: cells * cells }, () => Math.random()),
  }));

  const smooth = (t) => t * t * (3 - 2 * t);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let value = 0;
      octaves.forEach(({ cells, weight, grid }) => {
        const gx = (x / size) * cells;
        const gy = (y / size) * cells;
        const x0 = Math.floor(gx) % cells;
        const y0 = Math.floor(gy) % cells;
        const x1 = (x0 + 1) % cells;
        const y1 = (y0 + 1) % cells;
        const tx = smooth(gx - Math.floor(gx));
        const ty = smooth(gy - Math.floor(gy));
        const top = grid[y0 * cells + x0] * (1 - tx) + grid[y0 * cells + x1] * tx;
        const bottom = grid[y1 * cells + x0] * (1 - tx) + grid[y1 * cells + x1] * tx;
        value += (top * (1 - ty) + bottom * ty) * weight;
      });
      const i = (y * size + x) * 4;
      const v = Math.min(255, Math.max(0, value * 255));
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

export default function HalloweenParallax({
  imageUrl = "https://images.unsplash.com/photo-1573306533578-12e23afbf2c6?q=80&w=1080&auto=format&fit=crop",
  depthUrl = null,
  normalUrl = null,
  noiseUrl = null,
  backgroundColor = "bg-black",
  cameraZ = 260,
  fieldOfView = 50,
  planeSize = 200,
  planeSegments = 256,
  mouseLerp = 0.07,
  touchMultiplier = 1.5,
  timeStep = 0.01,
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let disposed = false;
    let cleanup = () => { };

    const start = async () => {
      const THREE = await import("three");
      if (disposed) return;

      const loader = new THREE.TextureLoader();
      loader.crossOrigin = "anonymous";
      const loadTexture = (url) => loader.loadAsync(url);

      const image = await loadImage(imageUrl);
      if (disposed) return;
      const generated = buildDepthAndNormal(image);

      const [imageTexture, depthTexture, normalTexture, noiseTexture] =
        await Promise.all([
          Promise.resolve(new THREE.Texture(image)),
          depthUrl
            ? loadTexture(depthUrl)
            : Promise.resolve(new THREE.CanvasTexture(generated.depthCanvas)),
          normalUrl
            ? loadTexture(normalUrl)
            : Promise.resolve(new THREE.CanvasTexture(generated.normalCanvas)),
          noiseUrl
            ? loadTexture(noiseUrl)
            : Promise.resolve(new THREE.CanvasTexture(buildNoise())),
        ]);
      if (disposed) return;

      imageTexture.needsUpdate = true;
      [imageTexture, depthTexture, normalTexture, noiseTexture].forEach((t) => {
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
      });
      noiseTexture.wrapS = THREE.RepeatWrapping;
      noiseTexture.wrapT = THREE.RepeatWrapping;

      const getSize = () => ({ w: container.clientWidth, h: container.clientHeight });
      const { w, h } = getSize();

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(fieldOfView, w / h, 0.1, 20000);
      camera.position.z = cameraZ;

      const aspect = image.naturalWidth / image.naturalHeight;
      const material = new THREE.RawShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          time: { value: 5 },
          textureImage: { value: imageTexture },
          textureDepth: { value: depthTexture },
          textureNormal: { value: normalTexture },
          textureNoise: { value: noiseTexture },
          mousePosition: { value: new THREE.Vector2(0.5, 0.5) },
        },
      });
      const geometry = new THREE.PlaneGeometry(
        planeSize * aspect,
        planeSize,
        planeSegments,
        planeSegments,
      );
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const fit = () => {
        const size = getSize();
        const visibleH = 2 * cameraZ * Math.tan(THREE.MathUtils.degToRad(fieldOfView / 2));
        const visibleW = visibleH * (size.w / size.h);
        const scale = Math.min(1, (visibleW * 0.95) / (planeSize * aspect));
        mesh.scale.set(scale, scale, 1);
      };
      fit();

      const pointer = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };
      let time = 0;
      let rafId = 0;

      const onPointerMove = (e) => {
        const rect = container.getBoundingClientRect();
        const factor = e.pointerType === "touch" ? touchMultiplier : 1;
        pointer.x = (((e.clientX - rect.left) / rect.width) * 2 - 1) * factor;
        pointer.y = (((e.clientY - rect.top) / rect.height) * 2 - 1) * factor;
      };

      const onResize = () => {
        const size = getSize();
        renderer.setSize(size.w, size.h, false);
        camera.aspect = size.w / size.h;
        camera.updateProjectionMatrix();
        fit();
      };

      const loop = () => {
        rafId = requestAnimationFrame(loop);
        time += timeStep;
        material.uniforms.time.value = time;
        target.x += (pointer.x - target.x) * mouseLerp;
        target.y += (pointer.y - target.y) * mouseLerp;
        material.uniforms.mousePosition.value.set(target.x, -target.y);
        renderer.render(scene, camera);
      };

      const observer = new ResizeObserver(onResize);
      observer.observe(container);
      window.addEventListener("pointermove", onPointerMove);
      loop();

      cleanup = () => {
        cancelAnimationFrame(rafId);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        scene.remove(mesh);
        geometry.dispose();
        [imageTexture, depthTexture, normalTexture, noiseTexture].forEach((t) =>
          t.dispose(),
        );
        material.dispose();
        renderer.dispose();
      };
    };

    start().catch(() => { });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [
    imageUrl,
    depthUrl,
    normalUrl,
    noiseUrl,
    cameraZ,
    fieldOfView,
    planeSize,
    planeSegments,
    mouseLerp,
    touchMultiplier,
    timeStep,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full touch-none select-none overflow-hidden ${backgroundColor} ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}