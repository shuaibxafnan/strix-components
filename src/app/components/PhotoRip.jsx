'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------
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

// Border removed — no white edge forced onto texture
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

// ---------------------------------------------------------------------------
// Default images — dark moody tones
// ---------------------------------------------------------------------------
const DEFAULT_IMAGES = [
  { url: 'https://images.pexels.com/photos/35061233/pexels-photo-35061233.jpeg', colorTop: [18,18,22],   colorBottom: [35,28,38]  },
  { url: 'https://images.pexels.com/photos/15052472/pexels-photo-15052472.jpeg', colorTop: [14,18,24],   colorBottom: [28,22,18]  },
  { url: 'https://images.pexels.com/photos/30389345/pexels-photo-30389345.jpeg', colorTop: [20,20,28],   colorBottom: [12,16,20]  },
  { url: 'https://images.pexels.com/photos/33674865/pexels-photo-33674865.jpeg', colorTop: [22,16,14],   colorBottom: [18,18,22]  },
  { url: 'https://images.pexels.com/photos/6419332/pexels-photo-6419332.jpeg', colorTop: [12,20,22],   colorBottom: [20,20,16]  },
  { url: 'https://images.pexels.com/photos/36878627/pexels-photo-36878627.jpeg', colorTop: [18,14,22],   colorBottom: [22,20,24]  },
  { url: 'https://images.pexels.com/photos/36878624/pexels-photo-36878624.jpeg', colorTop: [16,16,20],   colorBottom: [24,18,16]  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PhotoRip({
  images               = DEFAULT_IMAGES,

  // Texture assets
  ripTextureUrl        = 'https://assets.codepen.io/557388/rip.jpg',

  // Photo geometry
  photoWidth           = 3,
  photoHeight          = 2,
  widthSegments        = 30,
  heightSegments       = 50,
  tearWidth            = 0.4,

  // Tear physics
  ripWhiteThreshold    = 0.7,
  ripCompleteThreshold = 1.5,
  ripResetThreshold    = 1.15,
  tearSensitivity      = 2,

  // Left sheet
  leftTearXAngle       = -0.01,
  leftTearYAngle       = -0.1,
  leftTearZAngle       = 0.05,
  leftShadeAmount      = 0.15,

  // Right sheet
  rightTearXAngle      = 0.2,
  rightTearYAngle      = 0.1,
  rightTearZAngle      = -0.1,
  rightShadeAmount     = 0.35,

  // Camera
  fov                  = 30,
  cameraZ              = 6,
  cameraZMobile        = 10,
  mobileBreakpoint     = 800,

  // Hint
  showHint             = true,
  hintDelayMs          = 4000,

  // Background defaults
  defaultColorTop      = [18, 18, 22],
  defaultColorBottom   = [30, 24, 28],

  // Callbacks
  onPhotoRipped        = null,

  className            = '',
}) {
  const canvasRef = useRef(null);
  const hintRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // -------------------------------------------------------------------------
    // Scene / Renderer / Camera
    // -------------------------------------------------------------------------
    const scene    = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const sizes = { width: window.innerWidth, height: window.innerHeight };
    renderer.setSize(sizes.width, sizes.height);

    const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = sizes.width < mobileBreakpoint ? cameraZMobile : cameraZ;
    scene.add(camera);

    // -------------------------------------------------------------------------
    // Background gradient
    // -------------------------------------------------------------------------
    const bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: {
          uColorA: { value: new THREE.Color(...defaultColorBottom.map(v => v / 255)) },
          uColorB: { value: new THREE.Color(...defaultColorTop.map(v => v / 255)) },
        },
        vertexShader:   bgVertexShader,
        fragmentShader: bgFragmentShader,
        depthWrite: false,
      })
    );
    bgMesh.renderOrder = -99999;
    scene.add(bgMesh);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 5));
    const pLight = new THREE.PointLight(0xffffff, 15);
    pLight.position.z = -1;
    scene.add(pLight);

    // -------------------------------------------------------------------------
    // Textures
    // -------------------------------------------------------------------------
    const textureLoader = new THREE.TextureLoader();
    const texRip        = textureLoader.load(ripTextureUrl);

    const loadedImages = images.map((img) => ({
      ...img,
      texture: textureLoader.load(img.url),
    }));

    // -------------------------------------------------------------------------
    // Photo state
    // -------------------------------------------------------------------------
    const photoMeshes = [];
    let currentIndex  = -1;
    let mouseDown     = false;
    let interacted    = false;
    const mouseStart  = new THREE.Vector2();

    const sheetPlane = new THREE.PlaneGeometry(
      photoWidth / 2 + tearWidth / 2,
      photoHeight,
      widthSegments,
      heightSegments
    );

    const makeSideCfgs = () => ({
      left: {
        uvOffset:    0,
        ripSide:     0,
        tearXAngle:  leftTearXAngle,
        tearYAngle:  leftTearYAngle,
        tearZAngle:  leftTearZAngle,
        tearXOffset: 0,
        direction:   -1,
        shadeColor:  new THREE.Color(0.9, 0.9, 0.9),
        shadeAmount: leftShadeAmount,
      },
      right: {
        uvOffset:    ((photoWidth - tearWidth) / photoWidth) * 0.5,
        ripSide:     1,
        tearXAngle:  rightTearXAngle,
        tearYAngle:  rightTearYAngle,
        tearZAngle:  rightTearZAngle,
        tearXOffset: 0,
        direction:   1,
        shadeColor:  new THREE.Color(0.05, 0.05, 0.05),
        shadeAmount: rightShadeAmount,
      },
    });

    function makeMaterial(cfg, photoTex, tearOffset) {
      return new THREE.ShaderMaterial({
        defines: {
          HEIGHT:          photoHeight,
          WIDTH:           photoWidth / 2,
          FULL_WIDTH:      photoWidth,
          HEIGHT_SEGMENTS: heightSegments,
          WIDTH_SEGMENTS:  widthSegments,
        },
        uniforms: {
          uMap:            { value: photoTex },
          uRip:            { value: texRip },
          uRipSide:        { value: cfg.ripSide },
          uTearWidth:      { value: tearWidth },
          uWhiteThreshold: { value: ripWhiteThreshold },
          uTearAmount:     { value: 0 },
          uTearOffset:     { value: tearOffset },
          uUvOffset:       { value: cfg.uvOffset },
          uTearXAngle:     { value: cfg.tearXAngle },
          uTearYAngle:     { value: cfg.tearYAngle },
          uTearZAngle:     { value: cfg.tearZAngle },
          uTearXOffset:    { value: cfg.tearXOffset },
          uXDirection:     { value: cfg.direction },
          uShadeColor:     { value: cfg.shadeColor },
          uShadeAmount:    { value: cfg.shadeAmount },
        },
        transparent:    true,
        vertexShader:   ripVertexShader,
        fragmentShader: ripFragmentShader,
      });
    }

    function addPhoto() {
      currentIndex = (currentIndex + 1) % loadedImages.length;
      const imgData    = loadedImages[currentIndex];
      const tearOffset = Math.random();
      const settings   = { tearAmount: 0, tearOffset };
      const cfgs       = makeSideCfgs();
      let   interactive = false;

      const group = new THREE.Group();
      group.rotation.z = (Math.random() * 2 - 1) * Math.PI;
      group.position.y = 10;
      scene.add(group);

      const meshes = ['left', 'right'].map((side) => {
        const mat  = makeMaterial(cfgs[side], imgData.texture, tearOffset);
        const mesh = new THREE.Mesh(sheetPlane, mat);
        if (cfgs[side].tearXAngle > 0) mesh.position.z += 0.0001;
        group.add(mesh);
        return { side, mesh, mat, cfg: cfgs[side] };
      });

      // Intro
      const introTl = gsap.timeline({
        delay: 0.2,
        defaults: { duration: 0.7, ease: 'power3.out' },
        onComplete: () => { interactive = true; },
      });
      introTl.to(group.rotation, { z: 0 }, 0);
      introTl.to(group.position, { y: 0 }, 0);

      // Background transition
      gsap.to(bgMesh.material.uniforms.uColorB.value, {
        r: imgData.colorTop[0] / 255,
        g: imgData.colorTop[1] / 255,
        b: imgData.colorTop[2] / 255,
        ease: 'power4.inOut', duration: 1.2,
      });
      gsap.to(bgMesh.material.uniforms.uColorA.value, {
        r: imgData.colorBottom[0] / 255,
        g: imgData.colorBottom[1] / 255,
        b: imgData.colorBottom[2] / 255,
        ease: 'power4.inOut', duration: 1.2,
      });

      function updateUniforms(amount) {
        settings.tearAmount = amount;
        meshes.forEach(({ mat, cfg }) => {
          const u = mat.uniforms;
          u.uTearAmount.value  = amount;
          u.uTearOffset.value  = settings.tearOffset;
          u.uTearXAngle.value  = cfg.tearXAngle;
          u.uTearYAngle.value  = cfg.tearYAngle;
          u.uTearZAngle.value  = cfg.tearZAngle;
          u.uShadeColor.value  = cfg.shadeColor;
          u.uShadeAmount.value = cfg.shadeAmount;
        });
      }

      function removePhoto() {
        interactive = false;
        onPhotoRipped?.(currentIndex);
        addPhoto();

        const removeTl = gsap.timeline({
          defaults: { duration: 1, ease: 'power2.in' },
          onComplete: () => {
            meshes.forEach(({ mat }) => mat.dispose());
            scene.remove(group);
          },
        });
        removeTl.to(settings, {
          tearAmount: 1.5 + Math.random() * 1.5,
          ease: 'power2.out',
          onUpdate: () => updateUniforms(settings.tearAmount),
        });
        removeTl.to(group.position, { z: 1 }, 0);
        meshes.forEach(({ mesh, cfg }) => {
          const dir = cfg.ripSide - 0.5;
          removeTl.to(mesh.position, { y: -3 + Math.random() * -3, x: (2 + Math.random() * 3) * dir }, 0);
          removeTl.to(mesh.rotation, { z: (-2 + Math.random() * -3) * dir }, 0);
        });
      }

      photoMeshes.unshift({
        group, settings,
        interactive: () => interactive,
        updateUniforms,
        removePhoto,
      });
    }

    addPhoto();

    // -------------------------------------------------------------------------
    // Input — mouseup/touchend on WINDOW so drag leaving canvas still completes
    // -------------------------------------------------------------------------
    const getPos = (x, y) => ({
      x:  (x / sizes.width)  *  2 - 1,
      y: -(y / sizes.height) *  2 + 1,
    });

    const onDown = (x, y) => {
      const top = photoMeshes[0];
      if (!top?.interactive()) return;
      interacted = true;
      hideHint();
      const pos = getPos(x, y);
      mouseStart.set(pos.x, pos.y);
      mouseDown = true;
    };

    const onMove = (x, y) => {
      const top = photoMeshes[0];
      if (!mouseDown || !top?.interactive()) return;
      const pos  = getPos(x, y);
      const dist = mouseStart.y - pos.y;
      const amt  = Math.max(tearSensitivity * dist, 0);
      top.settings.tearAmount = amt;
      top.updateUniforms(amt);
    };

    // ← KEY FIX: mouseup/touchend on window, not canvas
    const onUp = () => {
      const top = photoMeshes[0];
      if (!mouseDown) return;
      mouseDown = false;
      if (!top?.interactive()) return;
      const amt = top.settings.tearAmount;
      if (amt >= ripResetThreshold) {
        top.removePhoto();
      } else {
        gsap.to(top.settings, {
          tearAmount: 0,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: () => top.updateUniforms(top.settings.tearAmount),
        });
      }
    };

    const onMouseDown  = (e) => onDown(e.clientX, e.clientY);
    const onTouchStart = (e) => onDown(e.touches[0].clientX, e.touches[0].clientY);
    const onMouseMove  = (e) => onMove(e.clientX, e.clientY);
    const onTouchMove  = (e) => onMove(e.touches[0].clientX, e.touches[0].clientY);

    // Down on canvas, move + up on window
    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('touchend',   onUp);

    // -------------------------------------------------------------------------
    // Hint
    // -------------------------------------------------------------------------
    let hintTl;
    const hint = hintRef.current;

    function showHintAnim() {
      if (interacted || !hint) return;
      hintTl = gsap.timeline({ repeat: -1, defaults: { duration: 1.8, ease: 'power4.inOut' } });
      hintTl.fromTo(hint, { y: '-80%', opacity: 0 }, { y: '10%', opacity: 1 });
      hintTl.to(hint, { y: '80%', opacity: 0, duration: 1 });
    }

    function hideHint() {
      if (!hint) return;
      gsap.to(hint, { opacity: 0, duration: 0.3, onComplete: () => hintTl?.kill() });
    }

    const hintTimer = showHint ? setTimeout(showHintAnim, hintDelayMs) : null;

    // -------------------------------------------------------------------------
    // Resize
    // -------------------------------------------------------------------------
    const onResize = () => {
      sizes.width  = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.position.z = sizes.width < mobileBreakpoint ? cameraZMobile : cameraZ;
      camera.aspect     = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
    };
    window.addEventListener('resize', onResize);

    // -------------------------------------------------------------------------
    // Render loop
    // -------------------------------------------------------------------------
    let animId;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    tick();

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animId);
      if (hintTimer) clearTimeout(hintTimer);
      hintTl?.kill();
      gsap.killTweensOf('*');
      canvas.removeEventListener('mousedown',  onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('touchend',   onUp);
      window.removeEventListener('resize',     onResize);
      sheetPlane.dispose();
      renderer.dispose();
    };
  }, [
    images, ripTextureUrl,
    photoWidth, photoHeight, widthSegments, heightSegments, tearWidth,
    ripWhiteThreshold, ripCompleteThreshold, ripResetThreshold, tearSensitivity,
    leftTearXAngle, leftTearYAngle, leftTearZAngle, leftShadeAmount,
    rightTearXAngle, rightTearYAngle, rightTearZAngle, rightShadeAmount,
    fov, cameraZ, cameraZMobile, mobileBreakpoint,
    showHint, hintDelayMs,
  ]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>

      {/* WebGL canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: 'grab' }}
      />

      {/* Vignette — adds depth and focus to center */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Minimal drag hint — arrow down */}
      {showHint && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            ref={hintRef}
            className="flex flex-col items-center gap-1 opacity-0"
          >
            <span
              style={{
                fontSize: 'clamp(10px, 1.2vw, 14px)',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.2em',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 300,
                textTransform: 'uppercase',
              }}
            >
              drag down to tear
            </span>
            <svg
              width="20" height="28" viewBox="0 0 20 28"
              fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="10" y1="0" x2="10" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <polyline points="4,14 10,22 16,14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}