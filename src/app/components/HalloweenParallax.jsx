'use client';

import { useEffect, useRef } from 'react';

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

    // PARTICLES
    vec4 particles = texture2D(textureNoise, dispWaves + vec2(vUv.x - sin(time * .5), vUv.y - sin(time)));
    float thr1 = .05 + sin(time * 4.0) * .05;
    texImage.rgb *= smoothstep(thr1, thr1 + .03, particles.r);

    // FOG RED
    vec4 displacedDepth = texture2D(textureDepth, dispDepth + dispWaves + dispMouse);
    vec4 smokeNoise1 = texture2D(textureNoise, dispDepth - vec2(time * .3));
    texImage.r *= 1. + (displacedDepth.b * (40.0 + smokeNoise1.r) * pow(1.0 - vUv.y, 6.0) * (1.0 + sin(time * 1.0)) * .1);

    // FOG BLUE
    vec4 smokeNoise2 = texture2D(textureNoise, dispDepth - vec2(time * .1, time * .5));
    texImage.b *= 1. + (displacedDepth.g * (6.0 + sin(time * 5.0)) * (.5 + smokeNoise2.r * (1.0 + sin(time) * .5)) * vUv.y);

    // LIGHTENING
    float lighteningValue = texture2D(textureNoise, vec2(time * .1)).r;
    lighteningValue = 1. - smoothstep(.6, .65, lighteningValue) * .3;
    texImage.rg *= lighteningValue;

    // MOUSE LIGHT
    vec3 lightDirection = normalize(vec3(mousePosition.x, mousePosition.y, .3));
    vec3 pixDirection = normalize(vec3(texNormal.r * 2.0 - 1.0, texNormal.b * 2.0 - 1.0, -texNormal.g * 2.0 + 1.0));
    float lightVal = dot(pixDirection, lightDirection);
    texImage.rgb *= .9 + (distToMouse * lightVal * (1.0 - displacedDepth.g)) * (2.0 + sin(time) * .5);

    gl_FragColor = vec4(texImage);
  }
`;

export default function HalloweenParallax({
  // Textures
  imageUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/264161/halloween.jpg',
  depthUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/264161/halloween-depth.jpg',
  normalUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/264161/halloween-normal.jpg',
  noiseUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/264161/noiseTexture.jpg',

  // Scene
  backgroundColor = '#000000',
  cameraZ = 260,
  fieldOfView = 50,
  planeSize = 200,
  planeSegments = 256,

  // Mouse tracking
  mouseLerp = 0.07,
  touchMultiplier = 1.5,

  // Animation
  timeStep = 0.01,

  // Overlay UI
  showOverlay = true,
  overlayLinks = [
    { label: 'My other codepens', href: 'https://codepen.io/Yakudoo/', target: '_blank' },
    { label: 'epic.net', href: 'https://www.epic.net', target: '_blank' },
  ],
  overlayFont = "'Voltaire', sans-serif",
  overlayColor = '#d45e59',
  overlayLinkColor = '#b92721',
  overlayFontSize = '1.0em',

  // Layout
  width = '100%',
  height = '100%',

  className = '',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let THREE;
    let renderer, scene, camera, material, shape;
    let timer = 0;
    let rafId;
    let targetX = 0;
    let targetY = 0;
    let mousePos = { x: 0, y: 0, px: 0, py: 0 };
    let mounted = true;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const getSize = () => ({
      w: container.clientWidth,
      h: container.clientHeight,
    });

    async function init() {
      THREE = (await import('three')).default ?? (await import('three'));

      const { w, h } = getSize();

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(w, h);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(fieldOfView, w / h, 0.1, 20000);
      camera.position.z = cameraZ;

      loadTextures(THREE, w, h);
    }

    function loadTextures(THREE, w, h) {
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = '';
      let nLoaded = 0;

      const onLoad = () => {
        nLoaded++;
        if (nLoaded >= 4 && mounted) {
          createPlane(THREE);
          loop();
        }
      };

      const texImage = loader.load(imageUrl, onLoad);
      texImage.minFilter = THREE.LinearFilter;

      const texDepth = loader.load(depthUrl, onLoad);
      texDepth.magFilter = texDepth.minFilter = THREE.LinearFilter;

      const texNormal = loader.load(normalUrl, onLoad);
      texNormal.magFilter = texNormal.minFilter = THREE.LinearFilter;

      const texNoise = loader.load(noiseUrl, onLoad);
      texNoise.magFilter = texNoise.minFilter = THREE.LinearFilter;
      texNoise.wrapT = texNoise.wrapS = THREE.RepeatWrapping;

      // store for cleanup
      material && (material._textures = [texImage, texDepth, texNormal, texNoise]);
      // temporarily hold refs
      window.__hlw_tex = { texImage, texDepth, texNormal, texNoise };
    }

    function createPlane(THREE) {
      const { texImage, texDepth, texNormal, texNoise } = window.__hlw_tex ?? {};
      delete window.__hlw_tex;

      material = new THREE.RawShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          time: { type: 'f', value: 5 },
          textureImage: { type: 't', value: texImage },
          textureDepth: { type: 't', value: texDepth },
          textureNormal: { type: 't', value: texNormal },
          textureNoise: { type: 't', value: texNoise },
          mousePosition: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) },
        },
      });

      const geometry = new THREE.PlaneGeometry(planeSize, planeSize, planeSegments, planeSegments);
      shape = new THREE.Mesh(geometry, material);
      scene.add(shape);
    }

    function render() {
      if (!material || !shape) return;
      timer += timeStep;
      shape.material.uniforms.time.value = timer;

      targetX += (mousePos.px - targetX) * mouseLerp;
      targetY += (mousePos.py - targetY) * mouseLerp;
      shape.material.uniforms.mousePosition.value.set(targetX, -targetY);

      renderer.render(scene, camera);
    }

    function loop() {
      if (!mounted) return;
      render();
      rafId = requestAnimationFrame(loop);
    }

    function handleResize() {
      if (!renderer || !camera) return;
      const { w, h } = getSize();
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function handleMouseMove(e) {
      const w = container.clientWidth;
      const h = container.clientHeight;

      if (e.clientX && e.clientY) {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
        mousePos.px = (mousePos.x / w) * 2 - 1;
        mousePos.py = (mousePos.y / h) * 2 - 1;
      } else if (e.targetTouches) {
        mousePos.x = e.targetTouches[0].clientX;
        mousePos.y = e.targetTouches[0].clientY;
        mousePos.px = ((mousePos.x / w) * 2 - 1) * touchMultiplier;
        mousePos.py = ((mousePos.y / h) * 2 - 1) * touchMultiplier;
        e.preventDefault();
      }
    }

    init().then(() => {
      window.addEventListener('resize', handleResize, false);
      window.addEventListener('mousemove', handleMouseMove, false);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);

      if (shape) {
        shape.geometry.dispose();
        scene.remove(shape);
      }
      if (material) {
        Object.values(material.uniforms).forEach((u) => {
          if (u.value && u.value.dispose) u.value.dispose();
        });
        material.dispose();
      }
      if (renderer) {
        renderer.dispose();
      }
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
      className={`relative overflow-hidden select-none cursor-default ${className}`}
      style={{ width, height, background: backgroundColor }}
    >
      {/* Three.js canvas — passed by ref, never appended via DOM */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />

      {/* Overlay credits */}
      {showOverlay && overlayLinks?.length > 0 && (
        <div
          className="absolute bottom-0 left-0 w-full text-center uppercase tracking-widest pb-5 pointer-events-none"
          style={{
            fontFamily: overlayFont,
            color: overlayColor,
            fontSize: overlayFontSize,
          }}
        >
          <p className="pointer-events-auto">
            {overlayLinks.map((link, i) => (
              <span key={link.label}>
                {i > 0 && <span className="mx-2 opacity-50">|</span>}
                <a
                  href={link.href}
                  target={link.target ?? '_blank'}
                  rel="noopener noreferrer"
                  className="no-underline hover:opacity-80 transition-opacity duration-200"
                  style={{ color: overlayLinkColor }}
                >
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}