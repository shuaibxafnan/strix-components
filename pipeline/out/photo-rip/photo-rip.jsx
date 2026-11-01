"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const bgVertexShader = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, -1., 1.);
  }
`;

const bgFragmentShader = `
  varying vec2 vUv;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  void main(){
    gl_FragColor = vec4(mix(uColorA, uColorB, vec3(vUv.y)), 1.);
  }
`;

const ripVertexShader = `
  uniform float uTearAmount;
  uniform float uTearWidth;
  uniform float uTearXAngle;
  uniform float uTearYAngle;
  uniform float uTearZAngle;
  uniform float uTearXOffset;
  uniform float uXDirection;
  uniform float uRipSide;

  varying vec2 vUv;
  varying float vAmount;

  mat4 rotationX(in float angle){
    return mat4(1,0,0,0, 0,cos(angle),-sin(angle),0, 0,sin(angle),cos(angle),0, 0,0,0,1);
  }
  mat4 rotationY(in float angle){
    return mat4(cos(angle),0,sin(angle),0, 0,1,0,0, -sin(angle),0,cos(angle),0, 0,0,0,1);
  }
  mat4 rotationZ(in float angle){
    return mat4(cos(angle),-sin(angle),0,0, sin(angle),cos(angle),0,0, 0,0,1,0, 0,0,0,1);
  }

  void main(){
    float yAmount  = max(0.0, (uTearAmount - (1.0 - uv.y)));
    float zRotate  = uTearZAngle * yAmount;
    float xRotate  = uTearXAngle * yAmount;
    float yRotate  = uTearYAngle * yAmount;

    float halfHeight = float(HEIGHT) * 0.5;
    float halfWidth  = (float(WIDTH) - uTearWidth * 0.5) * 0.5;

    vec4 vertex = vec4(
      position.x + (halfWidth * uXDirection) - halfWidth,
      position.y + halfHeight,
      position.z,
      1.0
    );

    vertex    = vertex * rotationY(yRotate * yAmount) * rotationX(xRotate * yAmount) * rotationZ(zRotate * yAmount);
    vertex.x += uTearXOffset * yAmount + halfWidth;
    vertex.y -= halfHeight;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vertex;
    vUv     = uv;
    vAmount = yAmount;
  }
`;

const ripFragmentShader = `
  uniform sampler2D uMap;
  uniform sampler2D uRip;
  uniform vec3  uShadeColor;
  uniform float uUvOffset;
  uniform float uRipSide;
  uniform float uShadeAmount;
  uniform float uTearWidth;
  uniform float uWhiteThreshold;
  uniform float uTearOffset;

  varying vec2  vUv;
  varying float vAmount;

  void main(){
    bool  rightSide    = uRipSide == 1.0;
    float width        = float(WIDTH);
    float widthOverlap = (uTearWidth * 0.5) + width;
    float xScale       = widthOverlap / float(FULL_WIDTH);
    vec2  uvOffset     = vec2(vUv.x * xScale + uUvOffset, vUv.y);

    vec4 textureColor = texture2D(uMap, uvOffset);

    float ripRange = uTearWidth / widthOverlap;
    float ripStart = rightSide ? 0.0 : 1.0 - ripRange;
    float ripX     = (vUv.x - ripStart) / ripRange;
    float ripY     = vUv.y * 0.5 + (0.5 * uTearOffset);

    vec4  ripCut    = texture2D(uRip, vec2(ripX, ripY));
    vec4  ripColor  = texture2D(uRip, vec2(ripX * 0.9, ripY - 0.02));
    float whiteness = dot(vec4(1.0), ripCut) / 4.0;
    float alpha     = 1.0;

    if(!rightSide && whiteness <= uWhiteThreshold){
      whiteness = dot(vec4(1.0), ripColor) / 4.0;
      if(whiteness >= uWhiteThreshold) textureColor = ripColor;
      else alpha = 0.0;
    }
    if(rightSide && whiteness >= uWhiteThreshold) alpha = 0.0;

    gl_FragColor = mix(
      vec4(textureColor.rgb, alpha),
      vec4(uShadeColor, alpha),
      vAmount * uShadeAmount
    );
  }
`;

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1500&h=1000&q=80`;

const DEFAULT_IMAGES = [
  { url: unsplash("photo-1656088239658-ca839d7e8841"), colorTop: [10, 10, 10], colorBottom: [26, 26, 26] },
  { url: unsplash("photo-1726491079206-36a02e6c9cbb"), colorTop: [14, 14, 14], colorBottom: [22, 22, 22] },
  { url: unsplash("photo-1738858363202-dd019dadce76"), colorTop: [8, 8, 8], colorBottom: [30, 30, 30] },
  { url: unsplash("photo-1634017264120-e34cd8606525"), colorTop: [12, 12, 12], colorBottom: [24, 24, 24] },
  { url: unsplash("photo-1781433869241-1aec734207d2"), colorTop: [10, 10, 10], colorBottom: [28, 28, 28] },
  { url: unsplash("photo-1771627278991-8922851b9435"), colorTop: [14, 14, 14], colorBottom: [18, 18, 18] },
];

const createRipTexture = () => {
  const width = 512;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);

  const octaves = [
    [3, 0.12],
    [7, 0.08],
    [15, 0.05],
    [31, 0.03],
    [63, 0.018],
    [127, 0.01],
  ].map(([frequency, amplitude]) => ({
    frequency,
    amplitude,
    phase: Math.random() * Math.PI * 2,
  }));

  for (let y = 0; y < height; y++) {
    const t = y / height;
    let boundary = 0.5 + (Math.random() - 0.5) * 0.012;
    octaves.forEach(({ frequency, amplitude, phase }) => {
      boundary += amplitude * Math.sin(Math.PI * 2 * frequency * t + phase);
    });
    boundary = Math.min(0.88, Math.max(0.12, boundary));

    for (let x = 0; x < width; x++) {
      const coverage = Math.min(1, Math.max(0, (boundary - x / width) * (width / 2) + 0.5));
      const grain = (Math.random() - 0.5) * 10;
      const i = (y * width + x) * 4;
      imageData.data[i] = (243 + grain) * coverage;
      imageData.data[i + 1] = (239 + grain) * coverage;
      imageData.data[i + 2] = (230 + grain) * coverage;
      imageData.data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
};

export default function PhotoRip({
  images = DEFAULT_IMAGES,
  ripTextureUrl = null,
  photoWidth = 3,
  photoHeight = 2,
  widthSegments = 30,
  heightSegments = 50,
  tearWidth = 0.4,
  ripWhiteThreshold = 0.7,
  ripResetThreshold = 1.15,
  tearSensitivity = 2,
  leftTearXAngle = -0.01,
  leftTearYAngle = -0.1,
  leftTearZAngle = 0.05,
  leftShadeAmount = 0.15,
  rightTearXAngle = 0.2,
  rightTearYAngle = 0.1,
  rightTearZAngle = -0.1,
  rightShadeAmount = 0.35,
  fov = 30,
  cameraZ = 6,
  cameraZMobile = 10,
  mobileBreakpoint = 800,
  showHint = true,
  hintText = "Drag down to tear",
  hintDelayMs = 4000,
  defaultColorTop = [10, 10, 10],
  defaultColorBottom = [24, 24, 24],
  onPhotoRipped = null,
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const sizes = { width: container.clientWidth, height: container.clientHeight };

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(sizes.width, sizes.height, false);

    const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = sizes.width < mobileBreakpoint ? cameraZMobile : cameraZ;
    scene.add(camera);

    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(...defaultColorBottom.map((v) => v / 255)) },
        uColorB: { value: new THREE.Color(...defaultColorTop.map((v) => v / 255)) },
      },
      vertexShader: bgVertexShader,
      fragmentShader: bgFragmentShader,
      depthWrite: false,
    });
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.renderOrder = -99999;
    bgMesh.frustumCulled = false;
    scene.add(bgMesh);

    scene.add(new THREE.AmbientLight(0xffffff, 5));
    const pointLight = new THREE.PointLight(0xffffff, 15);
    pointLight.position.z = -1;
    scene.add(pointLight);

    const textureLoader = new THREE.TextureLoader();
    const ripTexture = ripTextureUrl ? textureLoader.load(ripTextureUrl) : createRipTexture();
    const loadedImages = images.map((img) => ({
      ...img,
      texture: textureLoader.load(img.url),
    }));

    const photos = [];
    let currentIndex = -1;
    let mouseDown = false;
    let interacted = false;
    const mouseStart = new THREE.Vector2();

    const sheetPlane = new THREE.PlaneGeometry(
      photoWidth / 2 + tearWidth / 2,
      photoHeight,
      widthSegments,
      heightSegments,
    );

    const makeSideConfigs = () => ({
      left: {
        uvOffset: 0,
        ripSide: 0,
        tearXAngle: leftTearXAngle,
        tearYAngle: leftTearYAngle,
        tearZAngle: leftTearZAngle,
        tearXOffset: 0,
        direction: -1,
        shadeColor: new THREE.Color(0.9, 0.9, 0.9),
        shadeAmount: leftShadeAmount,
      },
      right: {
        uvOffset: ((photoWidth - tearWidth) / photoWidth) * 0.5,
        ripSide: 1,
        tearXAngle: rightTearXAngle,
        tearYAngle: rightTearYAngle,
        tearZAngle: rightTearZAngle,
        tearXOffset: 0,
        direction: 1,
        shadeColor: new THREE.Color(0.05, 0.05, 0.05),
        shadeAmount: rightShadeAmount,
      },
    });

    const makeMaterial = (cfg, photoTexture, tearOffset) =>
      new THREE.ShaderMaterial({
        defines: {
          HEIGHT: photoHeight,
          WIDTH: photoWidth / 2,
          FULL_WIDTH: photoWidth,
          HEIGHT_SEGMENTS: heightSegments,
          WIDTH_SEGMENTS: widthSegments,
        },
        uniforms: {
          uMap: { value: photoTexture },
          uRip: { value: ripTexture },
          uRipSide: { value: cfg.ripSide },
          uTearWidth: { value: tearWidth },
          uWhiteThreshold: { value: ripWhiteThreshold },
          uTearAmount: { value: 0 },
          uTearOffset: { value: tearOffset },
          uUvOffset: { value: cfg.uvOffset },
          uTearXAngle: { value: cfg.tearXAngle },
          uTearYAngle: { value: cfg.tearYAngle },
          uTearZAngle: { value: cfg.tearZAngle },
          uTearXOffset: { value: cfg.tearXOffset },
          uXDirection: { value: cfg.direction },
          uShadeColor: { value: cfg.shadeColor },
          uShadeAmount: { value: cfg.shadeAmount },
        },
        transparent: true,
        vertexShader: ripVertexShader,
        fragmentShader: ripFragmentShader,
      });

    const addPhoto = () => {
      currentIndex = (currentIndex + 1) % loadedImages.length;
      const imgData = loadedImages[currentIndex];
      const tearOffset = Math.random();
      const settings = { tearAmount: 0, tearOffset };
      const configs = makeSideConfigs();
      let interactive = false;

      const group = new THREE.Group();
      group.rotation.z = (Math.random() * 2 - 1) * Math.PI;
      group.position.y = 10;
      scene.add(group);

      const meshes = ["left", "right"].map((side) => {
        const material = makeMaterial(configs[side], imgData.texture, tearOffset);
        const mesh = new THREE.Mesh(sheetPlane, material);
        if (configs[side].tearXAngle > 0) mesh.position.z += 0.0001;
        group.add(mesh);
        return { mesh, material, cfg: configs[side] };
      });

      gsap
        .timeline({
          delay: 0.2,
          defaults: { duration: 0.7, ease: "power3.out" },
          onComplete: () => {
            interactive = true;
          },
        })
        .to(group.rotation, { z: 0 }, 0)
        .to(group.position, { y: 0 }, 0);

      gsap.to(bgMaterial.uniforms.uColorB.value, {
        r: imgData.colorTop[0] / 255,
        g: imgData.colorTop[1] / 255,
        b: imgData.colorTop[2] / 255,
        ease: "power4.inOut",
        duration: 1.2,
      });
      gsap.to(bgMaterial.uniforms.uColorA.value, {
        r: imgData.colorBottom[0] / 255,
        g: imgData.colorBottom[1] / 255,
        b: imgData.colorBottom[2] / 255,
        ease: "power4.inOut",
        duration: 1.2,
      });

      const updateUniforms = (amount) => {
        settings.tearAmount = amount;
        meshes.forEach(({ material }) => {
          material.uniforms.uTearAmount.value = amount;
        });
      };

      const entry = {
        settings,
        interactive: () => interactive,
        updateUniforms,
        removePhoto: () => {
          interactive = false;
          onPhotoRipped?.(currentIndex);
          addPhoto();

          const removeTl = gsap.timeline({
            defaults: { duration: 1, ease: "power2.in" },
            onComplete: () => {
              meshes.forEach(({ material }) => material.dispose());
              scene.remove(group);
              const at = photos.indexOf(entry);
              if (at >= 0) photos.splice(at, 1);
            },
          });
          removeTl.to(settings, {
            tearAmount: 1.5 + Math.random() * 1.5,
            ease: "power2.out",
            onUpdate: () => updateUniforms(settings.tearAmount),
          });
          removeTl.to(group.position, { z: 1 }, 0);
          meshes.forEach(({ mesh, cfg }) => {
            const dir = cfg.ripSide - 0.5;
            removeTl.to(
              mesh.position,
              { y: -3 + Math.random() * -3, x: (2 + Math.random() * 3) * dir },
              0,
            );
            removeTl.to(mesh.rotation, { z: (-2 + Math.random() * -3) * dir }, 0);
          });
        },
      };

      photos.unshift(entry);
    };

    addPhoto();

    const getPos = (x, y) => {
      const rect = container.getBoundingClientRect();
      return {
        x: ((x - rect.left) / rect.width) * 2 - 1,
        y: -((y - rect.top) / rect.height) * 2 + 1,
      };
    };

    let hintTimeline;
    const hint = hintRef.current;

    const hideHint = () => {
      if (!hint) return;
      gsap.to(hint, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => hintTimeline?.kill(),
      });
    };

    const showHintAnimation = () => {
      if (interacted || !hint) return;
      hintTimeline = gsap.timeline({
        repeat: -1,
        defaults: { duration: 1.8, ease: "power4.inOut" },
      });
      hintTimeline.fromTo(hint, { y: "-80%", opacity: 0 }, { y: "10%", opacity: 1 });
      hintTimeline.to(hint, { y: "80%", opacity: 0, duration: 1 });
    };

    const onPointerDown = (e) => {
      const top = photos[0];
      if (!top?.interactive()) return;
      interacted = true;
      hideHint();
      const pos = getPos(e.clientX, e.clientY);
      mouseStart.set(pos.x, pos.y);
      mouseDown = true;
    };

    const onPointerMove = (e) => {
      const top = photos[0];
      if (!mouseDown || !top?.interactive()) return;
      const pos = getPos(e.clientX, e.clientY);
      const amount = Math.max(tearSensitivity * (mouseStart.y - pos.y), 0);
      top.updateUniforms(amount);
    };

    const onPointerUp = () => {
      const top = photos[0];
      if (!mouseDown) return;
      mouseDown = false;
      if (!top?.interactive()) return;
      if (top.settings.tearAmount >= ripResetThreshold) {
        top.removePhoto();
      } else {
        gsap.to(top.settings, {
          tearAmount: 0,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: () => top.updateUniforms(top.settings.tearAmount),
        });
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    const hintTimer = showHint ? setTimeout(showHintAnimation, hintDelayMs) : null;

    const onResize = () => {
      sizes.width = container.clientWidth;
      sizes.height = container.clientHeight;
      if (!sizes.width || !sizes.height) return;
      camera.position.z = sizes.width < mobileBreakpoint ? cameraZMobile : cameraZ;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height, false);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    let frameId = 0;
    const tick = () => {
      frameId = requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(hintTimer);
      hintTimeline?.kill();
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      gsap.killTweensOf([
        bgMaterial.uniforms.uColorA.value,
        bgMaterial.uniforms.uColorB.value,
        hint,
      ]);
      photos.forEach(({ settings }) => gsap.killTweensOf(settings));
      sheetPlane.dispose();
      bgGeometry.dispose();
      bgMaterial.dispose();
      ripTexture.dispose();
      loadedImages.forEach(({ texture }) => texture.dispose());
      renderer.dispose();
    };
  }, [
    images,
    ripTextureUrl,
    photoWidth,
    photoHeight,
    widthSegments,
    heightSegments,
    tearWidth,
    ripWhiteThreshold,
    ripResetThreshold,
    tearSensitivity,
    leftTearXAngle,
    leftTearYAngle,
    leftTearZAngle,
    leftShadeAmount,
    rightTearXAngle,
    rightTearYAngle,
    rightTearZAngle,
    rightShadeAmount,
    fov,
    cameraZ,
    cameraZMobile,
    mobileBreakpoint,
    showHint,
    hintDelayMs,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden bg-black ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
      />

      <div className="pointer-events-none absolute inset-0 z-10 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />

      {showHint ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div
            ref={hintRef}
            className="flex flex-col items-center gap-1 text-white/50 opacity-0"
          >
            <span className="text-[clamp(10px,1.2vw,14px)] font-light uppercase tracking-[0.2em]">
              {hintText}
            </span>
            <svg
              width="20"
              height="28"
              viewBox="0 0 20 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <line x1="10" y1="0" x2="10" y2="20" />
              <polyline points="4,14 10,22 16,14" />
            </svg>
          </div>
        </div>
      ) : null}
    </div>
  );
}