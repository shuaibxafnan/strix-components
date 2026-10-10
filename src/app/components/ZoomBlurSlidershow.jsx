'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D map;
  uniform vec2 center;
  uniform float strength;
  uniform vec2 uvOffset;
  uniform vec2 uvScale;
  uniform float samples;
  varying vec2 vUv;

  float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
  }

  void main() {
    vec2 tUv = vUv * uvScale + uvOffset;

    if (abs(strength) > 0.001) {
      vec4 color = vec4(0.0);
      float total = 0.0;
      vec2 toCenter = center * uvScale + uvOffset - tUv;
      float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

      for (float t = 0.0; t <= 40.0; t++) {
        if (t >= samples) break;
        float percent = (t + offset) / samples;
        float weight = 2.0 * (percent - percent * percent);
        vec4 texel = texture2D(map, tUv + toCenter * percent * strength);
        texel.rgb *= texel.a;
        color += texel * weight;
        total += weight;
      }

      gl_FragColor = color / total;
      gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
      gl_FragColor.a = 1.0 - abs(strength);
    } else {
      gl_FragColor = texture2D(map, tUv);
    }
  }
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const lerp = (a, b, t) => a + (b - a) * t;

function createImagePlane(scene, wWidth, wHeight) {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map:      { value: null },
      center:   { value: new THREE.Vector2(0.5, 0.5) },
      strength: { value: -1 },
      uvOffset: { value: new THREE.Vector2(0, 0) },
      uvScale:  { value: new THREE.Vector2(1, 1) },
      samples:  { value: 20.0 },
    },
    vertexShader,
    fragmentShader,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return { mesh, material };
}

function fitUV(material, texture, viewportRatio) {
  if (!texture?.image) return;
  const iRatio = texture.image.width / texture.image.height;
  const uvOffset = material.uniforms.uvOffset.value;
  const uvScale  = material.uniforms.uvScale.value;
  uvOffset.set(0, 0);
  uvScale.set(1, 1);
  if (iRatio > viewportRatio) {
    uvScale.x  = viewportRatio / iRatio;
    uvOffset.x = (1 - uvScale.x) / 2;
  } else {
    uvScale.y  = iRatio / viewportRatio;
    uvOffset.y = (1 - uvScale.y) / 2;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ZoomBlurSlideshow({
  // Content
  images = [
    'https://images.pexels.com/photos/35061233/pexels-photo-35061233.jpeg',
    'https://images.pexels.com/photos/15052472/pexels-photo-15052472.jpeg',
    'https://images.pexels.com/photos/30389345/pexels-photo-30389345.jpeg',
  ],

  // Transition
  transitionSpeed = 0.05,       // lerp factor for progress (0.01 slow – 0.2 fast)
  blurSamples = 20,             // quality of zoom-blur (10 fast, 40 high quality)
  maxBlurStrength = 1.0,        // peak blur during transition (0.5 subtle – 2.0 heavy)
  introBlurDuration = 2.0,      // seconds for initial zoom-in reveal (0 to disable)

  // Mouse influence on blur center
  enableMouseCenter = true,     // blur center follows mouse
  mouseLerpSpeed = 0.1,         // how fast blur center tracks mouse

  // Navigation
  scrollSensitivity = 0.05,     // progress per scroll tick
  enableKeyboard = true,        // arrow key navigation
  enableClick = true,           // click top/bottom half to navigate
  enableSwipe = true,           // touch swipe navigation

  // Auto-play
  autoPlay = false,             // automatically advance slides
  autoPlayInterval = 3000,      // ms between slides when autoPlay is true

  // UI
  showDots = true,              // show slide indicator dots
  dotColor = 'rgba(255,255,255,0.4)',
  dotActiveColor = '#ffffff',
  dotSize = 8,                  // px

  // Scene
  backgroundColor = '#000000',
  fov = 45,
  cameraZ = 5,

  className = '',
}) {
  const mountRef   = useRef(null);
  const stateRef   = useRef(null); // mutable scene state, avoids re-renders
  const dotsRef    = useRef([]);

  // Update dot UI
  const updateDots = useCallback((rawProgress, total) => {
    const active = Math.round(rawProgress) % total;
    dotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      dot.style.background    = i === active ? dotActiveColor : dotColor;
      dot.style.transform     = i === active ? 'scale(1.3)' : 'scale(1)';
    });
  }, [dotColor, dotActiveColor]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || images.length < 2) return;

    // -----------------------------------------------------------------------
    // Renderer / Scene / Camera
    // -----------------------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(backgroundColor);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const aspect = mount.clientWidth / mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.z = cameraZ;

    // Visible world size at z=0
    const getWorldSize = () => {
      const vFov   = (fov * Math.PI) / 180;
      const height = 2 * Math.tan(vFov / 2) * cameraZ;
      const width  = height * (mount.clientWidth / mount.clientHeight);
      return { width, height };
    };

    // -----------------------------------------------------------------------
    // Load textures
    // -----------------------------------------------------------------------
    const loader   = new THREE.TextureLoader();
    const textures = new Array(images.length).fill(null);

    const loadAll = images.map((src, i) =>
      new Promise(resolve => {
        loader.load(src, tex => { textures[i] = tex; resolve(); });
      })
    );

    // -----------------------------------------------------------------------
    // Planes
    // -----------------------------------------------------------------------
    let plane1, plane2;
    let progress = 0, targetProgress = 0;
    const mouseCenter = new THREE.Vector2(0.5, 0.5);
    const lerpCenter1 = new THREE.Vector2(0.5, 0.5);
    const lerpCenter2 = new THREE.Vector2(0.5, 0.5);

    const setPlaneTexture = (plane, index) => {
      const tex = textures[((index % textures.length) + textures.length) % textures.length];
      if (!tex) return;
      plane.material.uniforms.map.value = tex;
      const ws = getWorldSize();
      plane.mesh.scale.set(ws.width, ws.height, 1);
      fitUV(plane.material, tex, mount.clientWidth / mount.clientHeight);
    };

    const setProgress = (p) => {
      plane1.material.uniforms.strength.value =  p * maxBlurStrength;
      plane2.material.uniforms.strength.value = (-1 + p) * maxBlurStrength;
      plane1.material.uniforms.samples.value  = blurSamples;
      plane2.material.uniforms.samples.value  = blurSamples;
    };

    // -----------------------------------------------------------------------
    // Navigation helpers
    // -----------------------------------------------------------------------
    const setTargetProgress = (val) => {
      targetProgress = val;
      if (targetProgress < 0) {
        progress       += images.length;
        targetProgress += images.length;
      }
    };

    const navNext = () => {
      if (Number.isInteger(targetProgress)) setTargetProgress(targetProgress + 1);
      else setTargetProgress(Math.ceil(targetProgress));
    };

    const navPrev = () => {
      if (Number.isInteger(targetProgress)) setTargetProgress(targetProgress - 1);
      else setTargetProgress(Math.floor(targetProgress));
    };

    // -----------------------------------------------------------------------
    // After all textures load
    // -----------------------------------------------------------------------
    let animId;
    let introStart = null;
    let autoPlayTimer = null;

    Promise.all(loadAll).then(() => {
      const ws = getWorldSize();
      plane1 = createImagePlane(scene, ws.width, ws.height);
      plane2 = createImagePlane(scene, ws.width, ws.height);

      setPlaneTexture(plane1, 0);
      setPlaneTexture(plane2, 1);
      setProgress(0);

      // Intro blur
      if (introBlurDuration > 0) {
        introStart = performance.now();
      }

      // Auto-play
      if (autoPlay) {
        autoPlayTimer = setInterval(navNext, autoPlayInterval);
      }

      // -----------------------------------------------------------------------
      // Animate
      // -----------------------------------------------------------------------
      const animate = (timestamp) => {
        animId = requestAnimationFrame(animate);

        // Intro reveal
        if (introStart !== null) {
          const elapsed = (timestamp - introStart) / 1000;
          const t = Math.min(elapsed / introBlurDuration, 1);
          plane1.material.uniforms.strength.value = lerp(-maxBlurStrength * 2, 0, t);
          if (t >= 1) introStart = null;
        }

        // Progress lerp
        const prevProgress = progress;
        progress = lerp(progress, targetProgress, transitionSpeed);
        const pdiff = progress - prevProgress;

        if (Math.abs(pdiff) > 0.00001) {
          const p0 = prevProgress % 1;
          const p1 = progress % 1;
          if ((pdiff > 0 && p1 < p0) || (pdiff < 0 && p0 < p1)) {
            const i = Math.floor(progress) % images.length;
            const j = ((i + 1) % images.length + images.length) % images.length;
            setPlaneTexture(plane1, i);
            setPlaneTexture(plane2, j);
          }
          if (introStart === null) setProgress(progress % 1);
        }

        // Mouse center lerp
        if (enableMouseCenter) {
          lerpCenter1.x = lerp(lerpCenter1.x, mouseCenter.x, mouseLerpSpeed);
          lerpCenter1.y = lerp(lerpCenter1.y, mouseCenter.y, mouseLerpSpeed);
          lerpCenter2.x = lerp(lerpCenter2.x, mouseCenter.x, mouseLerpSpeed);
          lerpCenter2.y = lerp(lerpCenter2.y, mouseCenter.y, mouseLerpSpeed);
          plane1.material.uniforms.center.value.copy(lerpCenter1);
          plane2.material.uniforms.center.value.copy(lerpCenter2);
        }

        updateDots(progress, images.length);
        renderer.render(scene, camera);
      };

      animate(performance.now());
    });

    // -----------------------------------------------------------------------
    // Event listeners
    // -----------------------------------------------------------------------
    const onMouseMove = (e) => {
      if (!enableMouseCenter) return;
      const rect = mount.getBoundingClientRect();
      mouseCenter.x = (e.clientX - rect.left) / rect.width;
      mouseCenter.y = 1 - (e.clientY - rect.top) / rect.height;
    };

    const onWheel = (e) => {
      e.preventDefault();
      setTargetProgress(
        targetProgress + (e.deltaY > 0 ? scrollSensitivity : -scrollSensitivity)
      );
    };

    const onClick = (e) => {
      if (!enableClick) return;
      const rect = mount.getBoundingClientRect();
      if (e.clientY - rect.top < rect.height / 2) navPrev();
      else navNext();
    };

    const onKeyUp = (e) => {
      if (!enableKeyboard) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navPrev();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navNext();
    };

    // Touch / swipe
    let touchStartY = 0, touchStartX = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
      if (!enableSwipe) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      const dx = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) navNext();
        else if (dx < -30) navPrev();
      } else {
        if (dy > 30) navNext();
        else if (dy < -30) navPrev();
      }
    };

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (plane1 && plane2) {
        setPlaneTexture(plane1, Math.floor(progress) % images.length);
        setPlaneTexture(plane2, (Math.floor(progress) + 1) % images.length);
      }
    };

    mount.addEventListener('mousemove', onMouseMove);
    mount.addEventListener('wheel', onWheel, { passive: false });
    mount.addEventListener('click', onClick);
    mount.addEventListener('touchstart', onTouchStart, { passive: true });
    mount.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);

    stateRef.current = { navNext, navPrev };

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(autoPlayTimer);
      mount.removeEventListener('mousemove', onMouseMove);
      mount.removeEventListener('wheel', onWheel);
      mount.removeEventListener('click', onClick);
      mount.removeEventListener('touchstart', onTouchStart);
      mount.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [
    images, transitionSpeed, blurSamples, maxBlurStrength, introBlurDuration,
    enableMouseCenter, mouseLerpSpeed, scrollSensitivity,
    enableKeyboard, enableClick, enableSwipe,
    autoPlay, autoPlayInterval, backgroundColor, fov, cameraZ,
    updateDots,
  ]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {/* Dot indicators */}
      {showDots && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 pointer-events-none">
          {images.map((_, i) => (
            <div
              key={i}
              ref={el => (dotsRef.current[i] = el)}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                background: dotColor,
                transition: 'background 0.3s, transform 0.3s',
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows (optional always-visible hint) */}
      {enableClick && (
        <>
          <button
            className="absolute top-1/2 left-4 -translate-y-1/2 z-10 text-white opacity-30 hover:opacity-80 transition-opacity text-3xl select-none pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); stateRef.current?.navPrev(); }}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="absolute top-1/2 right-4 -translate-y-1/2 z-10 text-white opacity-30 hover:opacity-80 transition-opacity text-3xl select-none pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); stateRef.current?.navNext(); }}
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}