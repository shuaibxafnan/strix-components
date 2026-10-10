"use client";

import { useEffect, useRef, useId } from "react";

// ─── WindClothFrame ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   #111111    Scene/canvas background color
// defaultMediaUrl    string   (sample)   Image URL loaded into the cloth on mount
// cameraZ            number   2.5        Camera distance from the mesh
// baseHeight         number   1.3        Base mesh height (width auto-derived from media aspect ratio)
// enableOrbitControls bool    true       Allow drag-to-orbit / scroll-to-zoom on the canvas
// enableFileUpload   bool     true       Show a small "Load File" button that opens a file picker
// uploadButtonLabel  string   Load File  Text shown on the upload button
// windForce          number   0.2        Overall wind strength multiplier (0–2)
// fabricDetail       number   0.45       Ripple/wave frequency detail on the cloth (0–1)
// shadowOpacity      number   0.4        Strength of the self-shadowing from cloth displacement (0–1)
// edgeScale          number   8.8        Noise scale used to make the torn edge ragged (1–20)
// edgeAmp            number   0.07       Amplitude of the torn-edge raggedness (0–0.2)
// frameSize          number   0.0        Outer crop/frame margin (0–0.2)
// photoInset         number   0.013      Extra inset of the photo mask from the torn edge (0–0.2)
// paperColor         string   #f0ebe0    Color of the visible cloth/paper backing
// edgeShadowColor    string   #000000    Color of the soft shadow along the torn edge
// edgeShadowOpacity  number   0.071      Strength of the torn-edge shadow (0–1)
// grainAmp           number   0.034925   Dust/grain overlay strength on the media (0–0.275)
// scratchAmp         number   0.0106272  Scratch overlay strength on the media (0–0.0648)
// vignette           number   0.0        Vignette darkening toward the media edges (0–1)
// seed               number   0.0        Noise seed, changes grain/dust variation (0–5)
// ──────────────────────────────────────────────────────────────────────────

const VERTEX_SHADER = `
    uniform float uTime;
    uniform float uWindStrength;
    uniform float uFabricFreq;

    varying vec2 vUv;
    varying float vZ;

    void main() {
        vUv = uv;
        vec3 pos = position;

        float looseFactor = 1.0 - uv.y;
        float pinInfluence = pow(looseFactor, 1.8);

        float wave1 = sin(uv.x * 5.0 + uTime * 2.0);
        float wave2 = sin(uv.x * 12.0 + uTime * 4.0 + uv.y * 5.0);
        float wave3 = sin(uTime * 1.5);

        float ripples = (wave1 * 0.5 + wave2 * 0.2 + wave3 * 0.3);

        float displacement = (uWindStrength * 2.0 + ripples * uFabricFreq) * pinInfluence;

        pos.y += (sin(displacement) * 0.1) * pinInfluence;
        pos.z += displacement;

        vZ = displacement;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const FRAGMENT_SHADER = `
    uniform sampler2D uTexture;
    uniform float uRatio;

    uniform float uEdgeScale;
    uniform float uEdgeAmp;
    uniform float uFrameSize;
    uniform float uPhotoInset;
    uniform vec3 uPaperColor;

    uniform float uScratchAmp;
    uniform float uGrainAmp;
    uniform float uVignette;
    uniform float uSeed;
    uniform float uShadowOpacity;

    uniform vec3 uEdgeShadowColor;
    uniform float uEdgeShadowOpacity;

    varying vec2 vUv;
    varying float vZ;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
    float fbm(vec2 x) {
        float v = 0.0; float a = 0.5; vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 5; ++i) { v += a * snoise(x + uSeed); x = rot * x * 2.0 + shift; a *= 0.5; }
        return v;
    }

    void main() {
        vec2 uv = vUv - 0.5;
        vec2 aspectUV = uv;
        aspectUV.x *= uRatio;

        float noise = fbm(aspectUV * uEdgeScale);
        float dist = max(abs(uv.x), abs(uv.y));
        float raggedDist = dist + noise * uEdgeAmp;

        float borderLimit = 0.5 - uFrameSize;
        float alpha = 1.0 - smoothstep(borderLimit, borderLimit + 0.01, raggedDist);
        if (alpha < 0.01) discard;

        float paperGrain = fbm(vUv * 60.0);
        vec3 paperCol = uPaperColor - paperGrain * 0.05;

        vec4 photoTex = texture2D(uTexture, vUv);
        float photoNoise = snoise(aspectUV * 30.0) * 0.005;
        float photoDist = max(abs(uv.x), abs(uv.y)) + photoNoise;
        float photoLimit = borderLimit - uPhotoInset;
        float photoMask = 1.0 - smoothstep(photoLimit, photoLimit + 0.02, photoDist);

        float scratches = snoise(vec2(vUv.x * 300.0, vUv.y * 3.0));
        float dust = fbm(vUv * 40.0 + uSeed);

        vec3 grungePhoto = photoTex.rgb;
        grungePhoto = mix(grungePhoto, vec3(0.6, 0.5, 0.4), dust * uGrainAmp);
        grungePhoto -= scratches * uScratchAmp;
        float len = length(uv);
        grungePhoto -= len * uVignette;

        vec3 finalRGB = mix(paperCol, grungePhoto, photoMask);

        finalRGB += vZ * uShadowOpacity;

        float edgeShadowFactor = smoothstep(borderLimit - 0.05, borderLimit, raggedDist);
        finalRGB = mix(finalRGB, uEdgeShadowColor, edgeShadowFactor * uEdgeShadowOpacity);

        gl_FragColor = vec4(finalRGB, 1.0);
    }
`;

export default function WindClothFrame({
  bgColor = "#111111",
  defaultMediaUrl = "https://iili.io/fvTp5sS.md.jpg",
  cameraZ = 2.5,
  baseHeight = 1.3,
  enableOrbitControls = true,
  enableFileUpload = true,
  uploadButtonLabel = "Load File",
  windForce = 0.2,
  fabricDetail = 0.45,
  shadowOpacity = 0.4,
  edgeScale = 8.8,
  edgeAmp = 0.07,
  frameSize = 0.0,
  photoInset = 0.013,
  paperColor = "#f0ebe0",
  edgeShadowColor = "#000000",
  edgeShadowOpacity = 0.071,
  grainAmp = 0.034925,
  scratchAmp = 0.0106272,
  vignette = 0.0,
  seed = 0.0,
}) {
  const uid = useId();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let renderer, scene, camera, controls, mesh, material, clock;
    let animationId = null;
    let currentVideoElement = null;
    let resizeHandler = null;
    const container = containerRef.current;

    async function init() {
      // esm.sh rewrites bare specifiers (e.g. OrbitControls' internal `import ... from "three"`)
      // into resolvable URLs on the fly. Do NOT add `?external=three` here — that flag tells
      // esm.sh to leave the "three" import as a bare specifier (assuming an import map exists to
      // resolve it), which is exactly the unresolvable state we're trying to avoid. Without the
      // flag, esm.sh rewrites the import to its own hosted three URL for the same version.
      //
      // Turbopack also statically intercepts `import(someVar)` even with a webpackIgnore comment
      // (that comment is webpack-only), bundles the fetched module itself, and then fails to
      // resolve any bare specifiers inside it. Routing the call through `new Function` hides the
      // import from Turbopack's static analyzer entirely, so the browser's native dynamic import
      // handles the fetch instead and esm.sh's URL-rewriting actually takes effect.
      const dynamicImport = new Function("url", "return import(url)");

      const threeUrl = "https://esm.sh/three@0.160.0";
      const orbitUrl =
        "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";

      const [THREE, orbitModule] = await Promise.all([
        dynamicImport(threeUrl),
        dynamicImport(orbitUrl),
      ]);

      if (cancelled || !container) return;

      const { OrbitControls } = orbitModule;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(bgColor);

      camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100,
      );
      camera.position.set(0, 0, cameraZ);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      if (enableOrbitControls) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
      }

      const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);

      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uTexture: { value: null },
          uRatio: { value: 1.0 },
          uTime: { value: 0 },
          uWindStrength: { value: windForce * 0.3 },
          uFabricFreq: { value: fabricDetail },
          uShadowOpacity: { value: shadowOpacity },
          uEdgeScale: { value: edgeScale },
          uEdgeAmp: { value: edgeAmp },
          uFrameSize: { value: frameSize },
          uPhotoInset: { value: photoInset },
          uPaperColor: { value: new THREE.Color(paperColor) },
          uScratchAmp: { value: scratchAmp },
          uGrainAmp: { value: grainAmp },
          uVignette: { value: vignette },
          uSeed: { value: seed },
          uEdgeShadowColor: { value: new THREE.Color(edgeShadowColor) },
          uEdgeShadowOpacity: { value: edgeShadowOpacity },
        },
        side: THREE.DoubleSide,
        transparent: true,
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const textureLoader = new THREE.TextureLoader();

      function applyTexture(texture, width, height) {
        material.uniforms.uTexture.value = texture;
        const aspect = width / height;
        material.uniforms.uRatio.value = aspect;
        mesh.scale.set(baseHeight * aspect, baseHeight, 1);
      }

      textureLoader.load(defaultMediaUrl, (tex) => {
        applyTexture(tex, tex.image.width, tex.image.height);
      });

      function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (currentVideoElement) {
          currentVideoElement.pause();
          currentVideoElement.removeAttribute("src");
          currentVideoElement.load();
          currentVideoElement = null;
        }

        const objectUrl = URL.createObjectURL(file);

        if (file.type.startsWith("video")) {
          const video = document.createElement("video");
          video.src = objectUrl;
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.crossOrigin = "anonymous";
          video.play();

          currentVideoElement = video;

          const videoTexture = new THREE.VideoTexture(video);
          videoTexture.minFilter = THREE.LinearFilter;
          videoTexture.magFilter = THREE.LinearFilter;
          videoTexture.format = THREE.RGBAFormat;

          video.addEventListener("loadedmetadata", () => {
            applyTexture(videoTexture, video.videoWidth, video.videoHeight);
          });
        } else {
          textureLoader.load(objectUrl, (tex) => {
            applyTexture(tex, tex.image.width, tex.image.height);
          });
        }
      }

      if (enableFileUpload && fileInputRef.current) {
        fileInputRef.current.addEventListener("change", handleFileChange);
      }

      clock = new THREE.Clock();

      function animate() {
        animationId = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        material.uniforms.uTime.value = time;

        let gust = Math.sin(time * 0.7) + Math.sin(time * 2.3) * 0.5 + 0.5;
        gust = Math.max(0.0, gust);

        material.uniforms.uWindStrength.value = gust * windForce * 0.3;

        if (controls) controls.update();
        renderer.render(scene, camera);
      }
      animate();

      resizeHandler = () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", resizeHandler);

      init._cleanup = () => {
        if (enableFileUpload && fileInputRef.current) {
          fileInputRef.current.removeEventListener("change", handleFileChange);
        }
        if (currentVideoElement) {
          currentVideoElement.pause();
          currentVideoElement.removeAttribute("src");
          currentVideoElement.load();
        }
      };
    }

    init().catch((e) =>
      console.error("[WindClothFrame] init failed:", e.message),
    );

    return () => {
      cancelled = true;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (animationId) cancelAnimationFrame(animationId);
      if (init._cleanup) init._cleanup();
      if (controls) controls.dispose();
      if (material) material.dispose();
      if (mesh && mesh.geometry) mesh.geometry.dispose();
      if (renderer) {
        renderer.dispose();
        if (
          container &&
          renderer.domElement &&
          container.contains(renderer.domElement)
        ) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [
    bgColor,
    defaultMediaUrl,
    cameraZ,
    baseHeight,
    enableOrbitControls,
    enableFileUpload,
    uploadButtonLabel,
    windForce,
    fabricDetail,
    shadowOpacity,
    edgeScale,
    edgeAmp,
    frameSize,
    photoInset,
    paperColor,
    edgeShadowColor,
    edgeShadowOpacity,
    grainAmp,
    scratchAmp,
    vignette,
    seed,
  ]);

  return (
    <div
      ref={containerRef}
      data-uid={uid}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {enableFileUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="absolute bottom-3 right-3 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            {uploadButtonLabel}
          </button>
        </>
      )}
    </div>
  );
}
