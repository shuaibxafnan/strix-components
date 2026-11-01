'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv; 

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const buildFragmentShader = (zoomLevel, rgbShift, pixelDisplace) => `
  precision highp float; 

  uniform sampler2D uTexture;
  uniform float imageAspectRatio;
  uniform float aspectRatio;
  uniform float opacity;
  uniform float hover;
  varying vec2 vUv;

  float exponentialInOut(float t) {
    return t == 0.0 || t == 1.0 
      ? t 
      : t < 0.5
        ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
        : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
  } 

  void main() {
    vec2 uv = vUv;

    float u = imageAspectRatio / aspectRatio;
    if (imageAspectRatio > aspectRatio) {
      u = 1.0 / u;
    }
    uv.y *= u;
    uv.y -= (u) / 2.0 - 0.5;

    float zoomLevel = ${zoomLevel.toFixed(3)};
    float hoverLevel = exponentialInOut(min(1.0, (distance(vec2(0.5), uv) * hover) + hover));
    uv *= 1.0 - zoomLevel * hoverLevel;
    uv += zoomLevel / 2.0 * hoverLevel;
    uv = clamp(uv, 0.0, 1.0);
    vec4 color = texture2D(uTexture, uv);

    if (hoverLevel > 0.0) {
      hoverLevel = 1.0 - abs(hoverLevel - 0.5) * 2.0;
      uv.y += color.r * hoverLevel * ${pixelDisplace.toFixed(3)};
      color = texture2D(uTexture, uv);
      color.r = texture2D(uTexture, uv + hoverLevel * ${rgbShift.toFixed(3)}).r;
      color.g = texture2D(uTexture, uv - hoverLevel * ${rgbShift.toFixed(3)}).g;
    }

    gl_FragColor = mix(vec4(1.0, 1.0, 1.0, opacity), color, opacity);
  }
`;

export default function TiltDistortImage({
  imageUrl         = 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?auto=format&fit=crop&w=934&q=80',
  imageAspectRatio = 0.8,

  backgroundColor  = '#111111',
  opacity          = 1.0,

  planeWidth  = 5,
  planeHeight = 7,

  fov     = 60,
  cameraZ = 8,

  zoomLevel               = 0.2,
  rgbShiftIntensity       = 0.01,
  pixelDisplaceIntensity  = 0.05,

  rotationIntensity  = 0.3,
  scaleIntensity     = 0.1,
  positionIntensity  = 1.0,

  hoverLerpSpeed     = 0.02,
  transformLerpSpeed = 0.08,

  className = '',
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(fov, mount.clientWidth / mount.clientHeight, 1, 100);
    camera.position.z = cameraZ;

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageUrl);

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: buildFragmentShader(zoomLevel, rgbShiftIntensity, pixelDisplaceIntensity),
      uniforms: {
        uTexture:         { value: texture },
        imageAspectRatio: { value: imageAspectRatio },
        aspectRatio:      { value: mount.clientWidth / mount.clientHeight },
        opacity:          { value: opacity },
        hover:            { value: 0.0 },
      },
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const target  = { hover: 0, scaleX: 1, scaleY: 1, posX: 0, rotX: 0, rotY: 0 };
    const current = { hover: 0, scaleX: 1, scaleY: 1, posX: 0, rotX: 0, rotY: 0 };

    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      target.hover  = intersects.length > 0 ? 1 : 0;
      target.scaleX = 1 - mouse.y * scaleIntensity;
      target.scaleY = 1 - mouse.y * scaleIntensity;
      target.posX   = mouse.x * positionIntensity;
      target.rotX   = -mouse.y * (Math.PI / 3) * rotationIntensity;
      target.rotY   =  mouse.x * (Math.PI / 3) * rotationIntensity;
    };

    const onMouseLeave = () => {
      target.hover  = 0;
      target.scaleX = 1;
      target.scaleY = 1;
      target.posX   = 0;
      target.rotX   = 0;
      target.rotY   = 0;
    };

    mount.addEventListener('mousemove',  onMouseMove);
    mount.addEventListener('mouseleave', onMouseLeave);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      material.uniforms.aspectRatio.value = w / h;
    };
    window.addEventListener('resize', onResize);

    let animId;
    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      current.hover  = lerp(current.hover,  target.hover,  hoverLerpSpeed);
      current.scaleX = lerp(current.scaleX, target.scaleX, transformLerpSpeed);
      current.scaleY = lerp(current.scaleY, target.scaleY, transformLerpSpeed);
      current.posX   = lerp(current.posX,   target.posX,   transformLerpSpeed);
      current.rotX   = lerp(current.rotX,   target.rotX,   transformLerpSpeed);
      current.rotY   = lerp(current.rotY,   target.rotY,   transformLerpSpeed);

      material.uniforms.hover.value = current.hover;
      mesh.scale.set(current.scaleX, current.scaleY, 1);
      mesh.position.x = current.posX;
      mesh.rotation.x = current.rotX;
      mesh.rotation.y = current.rotY;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousemove',  onMouseMove);
      mount.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [
    imageUrl, imageAspectRatio, backgroundColor, opacity,
    planeWidth, planeHeight, fov, cameraZ,
    zoomLevel, rgbShiftIntensity, pixelDisplaceIntensity,
    rotationIntensity, scaleIntensity, positionIntensity,
    hoverLerpSpeed, transformLerpSpeed,
  ]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-screen flex items-center justify-center ${className}`}
    />
  );
}