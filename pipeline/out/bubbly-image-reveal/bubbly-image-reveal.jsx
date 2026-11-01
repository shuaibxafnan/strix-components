"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const FALLBACK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
];
const DEFAULT_IMAGE_SIZES = [
  [1000, 667],
  [450, 581],
  [553, 600],
  [600, 600],
];

const VERTEX_SHADER = `
varying vec2 vUv;
void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;
    gl_Position = clipPosition;
    vUv = uv;
}
`;

const FRAGMENT_SHADER = `
varying vec2 vUv;
uniform float uProgress;
uniform vec2 uSize;
uniform sampler2D uTexture;
#define PI 3.1415926538
float noise(vec2 point) {
    float frequency = 1.0;
    float angle = atan(point.y,point.x) + uProgress * PI;
    float w0 = (cos(angle * frequency) + 1.0) / 2.0;
    float w1 = (sin(2.*angle * frequency) + 1.0) / 2.0;
    float w2 = (cos(3.*angle * frequency) + 1.0) / 2.0;
    float wave = (w0 + w1 + w2) / 3.0;
    return wave;
}
float softMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}
float softMin(float a, float b, float k) {
    return -softMax(-a, -b, k);
}
float circleSDF(vec2 pos, float rad) {
    float a = sin(uProgress * 0.2) * 0.25;
    float amt = 0.5 + a;
    float circle = length(pos);
    circle += noise(pos) * rad * amt;
    return circle;
}
float radialCircles(vec2 p, float o, float count) {
    vec2 offset = vec2(o, o);
    float angle = (2. * PI)/count;
    float s = round(atan(p.y, p.x)/angle);
    float an = angle * s;
    vec2 q = vec2(offset.x * cos(an), offset.y * sin(an));
    vec2 pos = p - q;
    float circle = circleSDF(pos, 15.0);
    return circle;
}
void main() {
    vec4 bg = vec4(vec3(0.0), 0.0);
    vec4 texture = texture2D(uTexture,vUv);
    vec2 coords = vUv * uSize;
    vec2 o1 = vec2(0.5) * uSize;
    float t = pow(uProgress, 2.5);
    float radius = uSize.x / 2.0;
    float rad = t * radius;
    float c1 = circleSDF(coords - o1, rad);
    vec2 p = (vUv - 0.5) * uSize;
    float r1 = radialCircles(p, 0.2 * uSize.x, 3.0);
    float r2 = radialCircles(p, 0.25 * uSize.x, 3.0);
    float r3 = radialCircles(p, 0.45 * uSize.x, 5.0);
    float k = 50.0 / uSize.x;
    float circle = softMin(c1, r1, k);
    circle = softMin(circle, r2, k);
    circle = softMin(circle, r3, k);
    circle = step(circle, rad);
    vec4 color = mix(bg, texture, circle);
    gl_FragColor = color;
}
`;

const createMeshItem = (w, h, segments) => {
  const geometry = new THREE.PlaneGeometry(w, h, segments, segments);
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    uniforms: {
      uProgress: new THREE.Uniform(0.0),
      uSize: new THREE.Uniform(new THREE.Vector2(w, h)),
      uTexture: new THREE.Uniform(),
    },
  });
  return new THREE.Mesh(geometry, material);
};

export default function BubblyImageReveal({
  images = DEFAULT_IMAGES,
  imageSizes = DEFAULT_IMAGE_SIZES,
  heading = "Image Reveal",
  bgColor = "#000",
  headingColor = "#fff",
  revealDuration = 3.0,
  cameraFov = 35,
  cameraNear = 0.1,
  cameraFar = 2000,
  cameraZ = 1600,
  scrollLerpFactor = 0.1,
  planeSegments = 128,
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!images.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const sizes = { width: window.innerWidth, height: window.innerHeight };

    const camera = new THREE.PerspectiveCamera(
      cameraFov,
      sizes.width / sizes.height,
      cameraNear,
      cameraFar,
    );
    camera.position.set(0, 0, cameraZ);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const objectsDistance = sizes.height;
    const sectionMeshes = images.map((_, i) => {
      const [w, h] = imageSizes[i] ||
        imageSizes[imageSizes.length - 1] || [600, 600];
      const mesh = createMeshItem(w, h, planeSegments);
      mesh.position.y = -objectsDistance * i;
      return mesh;
    });
    sectionMeshes.forEach((mesh) => scene.add(mesh));

    let disposed = false;
    let rafId = null;
    let currentSection = -1;
    let scrollY = window.scrollY;
    let targetPosY = -scrollY;

    const lerp = (a, b, t) => a + (b - a) * t;

    const onSectionEnter = (section) => {
      const mesh = sectionMeshes[section];
      if (!mesh) return;
      gsap.to(mesh.material.uniforms.uProgress, {
        duration: revealDuration,
        value: 1.0,
      });
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      const newSection = Math.round(scrollY / sizes.height);
      if (currentSection !== newSection) {
        currentSection = newSection;
        onSectionEnter(newSection);
      }
    };

    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const tick = () => {
      if (disposed) return;
      targetPosY = lerp(targetPosY, -scrollY, scrollLerpFactor);
      camera.position.y = targetPosY;
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(tick);
    };

    const textureLoader = new THREE.TextureLoader();
    let loadCount = 0;
    const sources = images.map((src) => src || FALLBACK_IMAGE);

    sources.forEach((src, index) => {
      textureLoader.load(src, (texture) => {
        if (disposed) return;
        sectionMeshes[index].material.uniforms.uTexture.value = texture;
        loadCount += 1;
        if (loadCount === sources.length) {
          window.addEventListener("scroll", onScroll);
          window.addEventListener("resize", onResize);
          const startSection = Math.round(window.scrollY / sizes.height);
          currentSection = startSection;
          onSectionEnter(startSection);
          tick();
        }
      });
    });

    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      sectionMeshes.forEach((mesh) => {
        gsap.killTweensOf(mesh.material.uniforms.uProgress);
        mesh.geometry.dispose();
        mesh.material.dispose();
        const tex = mesh.material.uniforms.uTexture.value;
        if (tex) tex.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full ${className}`} style={{ backgroundColor: bgColor }}>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 outline-none [scrollbar-width:none]"
      />

      <h1
        className="fixed bottom-4 right-8 uppercase font-medium text-[12vmin] leading-none [mix-blend-mode:difference]"
        style={{ color: headingColor }}
      >
        {heading}
      </h1>

      {images.map((_, i) => (
        <section key={i} className="relative h-screen" />
      ))}
    </div>
  );
}
