"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_PLANES = [
  {
    textureSrc:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    position: { x: -0.8, y: 0.3 },
    fallbackColor: "#e8d9c5",
    accentColor: "#c9a227",
    backgroundColor: "#FBE8CD",
    blob1Color: "#FFD56D",
    blob2Color: "#5D816A",
    label: { word: "amber field", pms: "7407 C", color: "#1b1b1b" },
  },
  {
    textureSrc:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    position: { x: 0.7, y: -0.25 },
    fallbackColor: "#d5ddd6",
    accentColor: "#5d816a",
    backgroundColor: "#E4EDE4",
    blob1Color: "#A8C5A0",
    blob2Color: "#3F5D4B",
    label: { word: "moss shade", pms: "5555 C", color: "#1b1b1b" },
  },
  {
    textureSrc:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    position: { x: -0.55, y: -0.4 },
    fallbackColor: "#c2ccd8",
    accentColor: "#4a6484",
    backgroundColor: "#2E3A46",
    blob1Color: "#5C7C9E",
    blob2Color: "#1B2028",
    label: { word: "slate dusk", pms: "5405 C", color: "#f4f4f4" },
  },
  {
    textureSrc:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    position: { x: 0.85, y: 0.35 },
    fallbackColor: "#b9a9c9",
    accentColor: "#6b4f7a",
    backgroundColor: "#241C2E",
    blob1Color: "#7A5B8E",
    blob2Color: "#120E18",
    label: { word: "violet haze", pms: "2603 C", color: "#f4f4f4" },
  },
  {
    textureSrc:
      "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    position: { x: -0.7, y: 0.15 },
    fallbackColor: "#d8a48f",
    accentColor: "#a2513a",
    backgroundColor: "#2A1A16",
    blob1Color: "#9E4F35",
    blob2Color: "#0F0A08",
    label: { word: "rust ember", pms: "1685 C", color: "#f4f4f4" },
  },
  {
    textureSrc:
      "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    position: { x: 0.6, y: -0.2 },
    fallbackColor: "#9fb3bd",
    accentColor: "#2f5c6b",
    backgroundColor: "#101A1F",
    blob1Color: "#2F5C6B",
    blob2Color: "#060B0E",
    label: { word: "deep tide", pms: "5473 C", color: "#f4f4f4" },
  },
];

const VERTEX_SHADER = [
  "varying vec2 vUv;",
  "void main() {",
  "  vUv = uv;",
  "  gl_Position = vec4(position.xy, 0.0, 1.0);",
  "}",
].join("\n");

const FRAGMENT_SHADER = [
  "varying vec2 vUv;",
  "uniform vec3 uBackgroundColor;",
  "uniform vec3 uBlob1Color;",
  "uniform vec3 uBlob2Color;",
  "uniform float uNoiseStrength;",
  "uniform float uBlobRadius;",
  "uniform float uBlobRadiusSecondary;",
  "uniform float uBlobStrength;",
  "uniform float uTime;",
  "uniform float uVelocityIntensity;",
  "float random(vec2 coord) {",
  "  return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453123);",
  "}",
  "void main() {",
  "  vec3 color = uBackgroundColor;",
  "  float animTime = uTime * 0.00028;",
  "  vec2 blob1Center = vec2(",
  "    0.50 + sin(animTime * 1.000) * 0.13 + sin(animTime * 1.618) * 0.05,",
  "    0.48 + cos(animTime * 0.794) * 0.09 + cos(animTime * 1.272) * 0.03",
  "  );",
  "  vec2 blob2Center = vec2(",
  "    0.35 + cos(animTime * 0.927) * 0.11 + cos(animTime * 1.414) * 0.04,",
  "    0.55 + sin(animTime * 1.175) * 0.07 + sin(animTime * 0.618) * 0.03",
  "  );",
  "  float blob1 = smoothstep(uBlobRadius, 0.0, distance(vUv, blob1Center));",
  "  float blob2 = smoothstep(uBlobRadiusSecondary, 0.0, distance(vUv, blob2Center));",
  "  vec3 blob1SoftColor = mix(uBlob1Color, uBackgroundColor, 0.35);",
  "  vec3 blob2SoftColor = mix(uBlob2Color, uBackgroundColor, 0.35);",
  "  color = mix(color, blob1SoftColor, blob1 * uBlobStrength);",
  "  color = mix(color, blob2SoftColor, blob2 * uBlobStrength);",
  "  color += uVelocityIntensity * 0.10;",
  "  float grain = random(vUv * vec2(1387.13, 947.91)) - 0.5;",
  "  color += grain * uNoiseStrength;",
  "  color = clamp(color, 0.0, 1.0);",
  "  gl_FragColor = vec4(color, 1.0);",
  "}",
].join("\n");

const normalizeHex = (raw) => {
  const fallback = "#ffffff";
  if (typeof raw !== "string") return fallback;
  let hex = raw.trim();
  if (!hex) return fallback;
  if (!hex.startsWith("#")) hex = "#" + hex;
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    hex =
      "#" +
      hex
        .slice(1)
        .split("")
        .map((c) => c + c)
        .join("");
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return fallback;
  return hex.toLowerCase();
};

const hexToRgb = (hex) => {
  const n = normalizeHex(hex).slice(1);
  return {
    r: Number.parseInt(n.slice(0, 2), 16),
    g: Number.parseInt(n.slice(2, 4), 16),
    b: Number.parseInt(n.slice(4, 6), 16),
  };
};

const rgbToCmyk = ({ r, g, b }) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const black = 1 - Math.max(red, green, blue);
  if (black >= 0.999) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - red - black) / (1 - black)) * 100),
    m: Math.round(((1 - green - black) / (1 - black)) * 100),
    y: Math.round(((1 - blue - black) / (1 - black)) * 100),
    k: Math.round(black * 100),
  };
};

const buildSpecs = (accentColor, pms) => {
  const hex = normalizeHex(accentColor);
  const rgb = hexToRgb(hex);
  const cmyk = rgbToCmyk(rgb);
  return {
    chip: hex,
    cmyk: cmyk.c + ", " + cmyk.m + ", " + cmyk.y + ", " + cmyk.k,
    rgb: rgb.r + ", " + rgb.g + ", " + rgb.b,
    hex: hex.slice(1).toUpperCase(),
    pms: pms || "N/A",
  };
};

export default function AtmosphericDepthGallery({
  planes = DEFAULT_PLANES,
  showLabels = true,
  labelColor = "rgba(244,244,244,0.92)",
  fontFamily = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  letterSpacing = "0.08em",
  className = "",
  planeGap = 5,
  desktopPlaneScale = 1,
  mobilePlaneScale = 0.65,
  mobileXSpreadFactor = 0.25,
  mobileBreakpoint = 768,
  planeFadeSampleOffset = 1,
  planeFadeSmoothing = 0.14,
  moodSampleOffset = 1,
  parallaxEnabled = true,
  parallaxAmountX = 0.16,
  parallaxAmountY = 0.08,
  parallaxSmoothing = 0.08,
  breathEnabled = true,
  breathTiltAmount = 0.045,
  breathScaleAmount = 0.03,
  breathSmoothing = 0.14,
  breathGain = 1.1,
  gestureParallaxEnabled = true,
  gestureParallaxAmountY = 0.05,
  gestureParallaxSmoothing = 0.05,
  scrollSmoothing = 0.08,
  scrollToWorldFactor = 0.01,
  wheelScrollSpeed = 1,
  touchScrollSpeed = 1.8,
  invertScroll = false,
  useScrollBounds = true,
  firstPlaneViewOffset = 5,
  lastPlaneViewOffset = 5,
  velocityDamping = 0.12,
  velocityMax = 1.5,
  baseBlobRadius = 0.65,
  secondaryBlobRadiusRatio = 0.78,
  baseBlobStrength = 0.9,
  noiseStrength = 0.04,
  depthToRadiusAmount = 0.08,
  velocityToStrengthAmount = 0.1,
  motionSmoothing = 0.1,
  trailEnabled = true,
  trailColor = "#f6f9ff",
  trailGlowColor = "#ffffff",
  trailGlowIntensity = 1.35,
  trailOpacity = 0.51,
  trailRadiusHead = 0.012,
  trailRadiusTail = 0.003,
  trailWidth = 3,
  trailHorizontalCycles = 1.85,
  trailVerticalCycles = 2.1,
  trailVerticalAmplitude = 0.78,
  trailMinPoints = 14,
  trailMaxPoints = 220,
  trailCurveTension = 0.67,
  trailPointSmoothing = 0.53,
}) {
  const canvasRef = useRef(null);
  const optionsRef = useRef({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [ready, setReady] = useState(false);

  optionsRef.current = {
    planes,
    planeGap,
    desktopPlaneScale,
    mobilePlaneScale,
    mobileXSpreadFactor,
    mobileBreakpoint,
    planeFadeSampleOffset,
    planeFadeSmoothing,
    moodSampleOffset,
    parallaxEnabled,
    parallaxAmountX,
    parallaxAmountY,
    parallaxSmoothing,
    breathEnabled,
    breathTiltAmount,
    breathScaleAmount,
    breathSmoothing,
    breathGain,
    gestureParallaxEnabled,
    gestureParallaxAmountY,
    gestureParallaxSmoothing,
    scrollSmoothing,
    scrollToWorldFactor,
    wheelScrollSpeed,
    touchScrollSpeed,
    invertScroll,
    useScrollBounds,
    firstPlaneViewOffset,
    lastPlaneViewOffset,
    velocityDamping,
    velocityMax,
    baseBlobRadius,
    secondaryBlobRadiusRatio,
    baseBlobStrength,
    noiseStrength,
    depthToRadiusAmount,
    velocityToStrengthAmount,
    motionSmoothing,
    trailEnabled,
    trailColor,
    trailGlowColor,
    trailGlowIntensity,
    trailOpacity,
    trailRadiusHead,
    trailRadiusTail,
    trailWidth,
    trailHorizontalCycles,
    trailVerticalCycles,
    trailVerticalAmplitude,
    trailMinPoints,
    trailMaxPoints,
    trailCurveTension,
    trailPointSmoothing,
  };

  useEffect(() => {
    let disposed = false;
    let cleanup = null;

    import("three")
      .then(async (THREE) => {
        if (disposed || !canvasRef.current) return;
        const o = optionsRef.current;
        const canvas = canvasRef.current;

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        const textures = new Map();
        await Promise.all(
          o.planes.map(async (p) => {
            if (!p.textureSrc) return;
            try {
              const t = await loader.loadAsync(p.textureSrc);
              t.colorSpace = THREE.SRGBColorSpace;
              textures.set(p.textureSrc, t);
            } catch (e) {
              console.warn(
                "[AtmosphericDepthGallery] texture failed",
                p.textureSrc,
              );
            }
          }),
        );
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.autoClear = false;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

        const bgScene = new THREE.Scene();
        const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const bgColorA = new THREE.Color(o.planes[0].backgroundColor);
        const bgColorB = new THREE.Color(o.planes[0].blob1Color);
        const bgColorC = new THREE.Color(o.planes[0].blob2Color);
        const bgMaterial = new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          depthWrite: false,
          depthTest: false,
          uniforms: {
            uBackgroundColor: { value: bgColorA },
            uBlob1Color: { value: bgColorB },
            uBlob2Color: { value: bgColorC },
            uNoiseStrength: { value: o.noiseStrength },
            uBlobRadius: { value: o.baseBlobRadius },
            uBlobRadiusSecondary: {
              value: o.baseBlobRadius * o.secondaryBlobRadiusRatio,
            },
            uBlobStrength: { value: o.baseBlobStrength },
            uTime: { value: 0 },
            uVelocityIntensity: { value: 0 },
          },
        });
        const bgGeometry = new THREE.PlaneGeometry(2, 2);
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        bgScene.add(bgMesh);
        const tmpA = new THREE.Color();
        const tmpB = new THREE.Color();
        const tmpC = new THREE.Color();

        const planeGeometry = new THREE.PlaneGeometry(3, 3);
        const meshes = o.planes.map((p, index) => {
          const texture = textures.get(p.textureSrc) || null;
          const img = texture && texture.image;
          const aspect =
            img && img.width > 0 && img.height > 0 ? img.width / img.height : 1;
          const fallback = p.fallbackColor || "#ffffff";
          const material = new THREE.MeshBasicMaterial({
            color: texture ? "#ffffff" : fallback,
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            opacity: index === 0 ? 1 : 0,
          });
          const mesh = new THREE.Mesh(planeGeometry, material);
          mesh.userData.basePosition = p.position || { x: 0, y: 0 };
          mesh.userData.aspectRatio = aspect;
          scene.add(mesh);
          return mesh;
        });

        const isMobile = () => window.innerWidth <= o.mobileBreakpoint;
        const xSpread = () => (isMobile() ? o.mobileXSpreadFactor : 1);
        const planeScale = () =>
          isMobile() ? o.mobilePlaneScale : o.desktopPlaneScale;

        const layout = () => {
          const spread = xSpread();
          const scale = planeScale();
          meshes.forEach((m, i) => {
            const base = m.userData.basePosition;
            m.position.set(base.x * spread, base.y, -i * o.planeGap);
            const a = m.userData.aspectRatio;
            m.scale.set(scale * a, scale, 1);
          });
        };
        layout();

        const depthRange = () => {
          const zs = meshes.map((m) => m.position.z);
          return { nearestZ: Math.max(...zs), deepestZ: Math.min(...zs) };
        };

        const blendData = (cameraZ) => {
          const gap = Math.max(o.planeGap, 0.0001);
          const first = meshes[0].position.z;
          const last = meshes.length - 1;
          const sampled = cameraZ - gap * o.planeFadeSampleOffset;
          const norm = THREE.MathUtils.clamp((first - sampled) / gap, 0, last);
          const currentIndex = Math.floor(norm);
          return {
            currentIndex,
            nextIndex: Math.min(currentIndex + 1, last),
            blend: norm - currentIndex,
          };
        };

        const moodBlendData = (cameraZ) => {
          const last = meshes.length - 1;
          if (last === 0 || o.planeGap <= 0) return null;
          const sampled = cameraZ - o.planeGap * o.moodSampleOffset;
          const first = meshes[0].position.z;
          const norm = THREE.MathUtils.clamp(
            (first - sampled) / o.planeGap,
            0,
            last,
          );
          const currentIndex = Math.floor(norm);
          const nextIndex = Math.min(currentIndex + 1, last);
          return {
            current: o.planes[currentIndex],
            next: o.planes[nextIndex],
            blend: norm - currentIndex,
          };
        };

        const pointerTarget = new THREE.Vector2(0, 0);
        const pointerCurrent = new THREE.Vector2(0, 0);
        const onPointerMove = (event) => {
          pointerTarget.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -((event.clientY / window.innerHeight) * 2 - 1),
          );
        };
        const onPointerLeave = () => pointerTarget.set(0, 0);

        const scrollState = {
          target: 0,
          current: 0,
          previous: 0,
          velocity: 0,
          startZ: 0,
          minZ: -Infinity,
          maxZ: Infinity,
          touchY: 0,
        };

        const updateBounds = () => {
          const { nearestZ, deepestZ } = depthRange();
          scrollState.maxZ = nearestZ + o.firstPlaneViewOffset;
          scrollState.minZ = deepestZ + o.lastPlaneViewOffset;
          if (scrollState.minZ > scrollState.maxZ) {
            scrollState.minZ = scrollState.maxZ;
          }
        };
        updateBounds();
        scrollState.startZ = scrollState.maxZ;
        camera.position.set(0, 0, scrollState.startZ);

        const zFromScroll = (s) =>
          scrollState.startZ - s * o.scrollToWorldFactor;
        const scrollFromZ = (z) =>
          o.scrollToWorldFactor === 0
            ? 0
            : (scrollState.startZ - z) / o.scrollToWorldFactor;

        const normalizeWheel = (event) => {
          if (event.deltaMode === 1) return event.deltaY * 16;
          if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
          return event.deltaY;
        };
        const addInput = (delta) => {
          scrollState.target += delta * (o.invertScroll ? -1 : 1);
        };
        const onWheel = (event) => {
          event.preventDefault();
          addInput(normalizeWheel(event) * o.wheelScrollSpeed);
        };
        const onTouchStart = (event) => {
          scrollState.touchY = event.touches[0] ? event.touches[0].clientY : 0;
        };
        const onTouchMove = (event) => {
          event.preventDefault();
          const y = event.touches[0]
            ? event.touches[0].clientY
            : scrollState.touchY;
          addInput((scrollState.touchY - y) * o.touchScrollSpeed);
          scrollState.touchY = y;
        };

        const trailGroup = new THREE.Group();
        trailGroup.renderOrder = 1200;
        scene.add(trailGroup);
        const trailMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(o.trailColor),
          emissive: new THREE.Color(o.trailGlowColor),
          emissiveIntensity: o.trailGlowIntensity,
          roughness: 0.2,
          metalness: 0.05,
          transparent: true,
          opacity: o.trailOpacity,
          depthWrite: false,
          depthTest: false,
        });
        let trailMesh = null;
        let trailPoints = [];
        let trailMaxPointCount = o.trailMinPoints;
        const trailHead = new THREE.Vector3();

        const buildTube = (curve, segments, rHead, rTail) => {
          const pathPoints = curve.getSpacedPoints(segments);
          const radial = 8;
          const ring = radial + 1;
          const vertices = [];
          const indices = [];
          const up = new THREE.Vector3(0, 0, 1);
          const tangent = new THREE.Vector3();
          const normal = new THREE.Vector3();
          const binormal = new THREE.Vector3();
          const offset = new THREE.Vector3();
          const vertex = new THREE.Vector3();

          for (let i = 0; i < pathPoints.length; i += 1) {
            const t = i / Math.max(pathPoints.length - 1, 1);
            const radius = rHead + (rTail - rHead) * Math.pow(t, 1.5);
            curve.getTangent(t, tangent).normalize();
            normal.crossVectors(up, tangent).normalize();
            if (normal.lengthSq() === 0) normal.set(1, 0, 0);
            binormal.crossVectors(tangent, normal).normalize();
            for (let j = 0; j <= radial; j += 1) {
              const angle = (j / radial) * Math.PI * 2;
              offset
                .copy(normal)
                .multiplyScalar(-Math.cos(angle) * radius)
                .addScaledVector(binormal, Math.sin(angle) * radius);
              vertex.copy(pathPoints[i]).add(offset);
              vertices.push(vertex.x, vertex.y, vertex.z);
            }
          }
          for (let i = 0; i < pathPoints.length - 1; i += 1) {
            for (let j = 0; j < radial; j += 1) {
              const b = i * ring + j;
              indices.push(b, b + ring, b + 1);
              indices.push(b + ring, b + ring + 1, b + 1);
            }
          }
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3),
          );
          geometry.setIndex(indices);
          geometry.computeVertexNormals();
          return geometry;
        };

        const addTrailPoint = (position) => {
          const last = trailPoints[trailPoints.length - 1] || null;
          if (last && position.distanceToSquared(last) < 0.006 * 0.006) return;
          const next = position.clone();
          const eased = last
            ? last.clone().lerp(next, o.trailPointSmoothing)
            : next;
          trailPoints.push(eased);
          while (trailPoints.length > trailMaxPointCount) trailPoints.shift();
          if (trailPoints.length < 2) return;

          const curve = new THREE.CatmullRomCurve3(
            trailPoints,
            false,
            "centripetal",
            o.trailCurveTension,
          );
          const segments = Math.max(24, Math.min(220, trailPoints.length * 4));
          const geometry = buildTube(
            curve,
            segments,
            o.trailRadiusHead,
            o.trailRadiusTail,
          );
          if (!trailMesh) {
            trailMesh = new THREE.Mesh(geometry, trailMaterial);
            trailMesh.renderOrder = 1200;
            trailGroup.add(trailMesh);
            return;
          }
          trailMesh.geometry.dispose();
          trailMesh.geometry = geometry;
        };

        const computeTrailHead = (cameraZ, progress) => {
          const p = THREE.MathUtils.clamp(progress, 0, 1);
          const mobile = isMobile();
          const startX = -0.96 + (mobile ? 0.35 : 0);
          const width = o.trailWidth * (mobile ? 0.35 : 1);
          const x =
            startX +
            Math.sin(
              p * Math.PI * 2 * Math.max(o.trailHorizontalCycles, 0.0001),
            ) *
              width;
          const y =
            -1.05 +
            Math.sin(
              p * Math.PI * 2 * Math.max(o.trailVerticalCycles, 0.0001),
            ) *
              o.trailVerticalAmplitude;
          const depthProgress = -0.1 + p * 1.1;
          const z = cameraZ + 1.65 - (4.78 + depthProgress * 6.52);
          trailHead.set(x, y, z);
          return trailHead;
        };

        let smoothedDepth = 0;
        let smoothedVelocity = 0;
        let breathIntensity = 0;
        let driftCurrent = 0;
        let lastLabelIndex = -1;
        let frameId = null;

        const resize = () => {
          const width = canvas.clientWidth || window.innerWidth || 1;
          const height = canvas.clientHeight || window.innerHeight || 1;
          if (width <= 0 || height <= 0) return;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          layout();
        };
        resize();

        const tick = () => {
          frameId = requestAnimationFrame(tick);
          const time = performance.now();

          updateBounds();
          scrollState.current = THREE.MathUtils.lerp(
            scrollState.current,
            scrollState.target,
            o.scrollSmoothing,
          );
          if (o.useScrollBounds) {
            const minScroll = scrollFromZ(scrollState.maxZ);
            const maxScroll = scrollFromZ(scrollState.minZ);
            scrollState.target = THREE.MathUtils.clamp(
              scrollState.target,
              minScroll,
              maxScroll,
            );
            scrollState.current = THREE.MathUtils.clamp(
              scrollState.current,
              minScroll,
              maxScroll,
            );
          }
          const raw = scrollState.current - scrollState.previous;
          scrollState.velocity = THREE.MathUtils.clamp(
            THREE.MathUtils.lerp(scrollState.velocity, raw, o.velocityDamping),
            -o.velocityMax,
            o.velocityMax,
          );
          if (Math.abs(scrollState.velocity) < 0.0001) scrollState.velocity = 0;
          scrollState.previous = scrollState.current;

          const nextZ = zFromScroll(scrollState.current);
          camera.position.z = o.useScrollBounds
            ? THREE.MathUtils.clamp(nextZ, scrollState.minZ, scrollState.maxZ)
            : nextZ;

          const cameraZ = camera.position.z;
          const blend = blendData(cameraZ);

          meshes.forEach((mesh, index) => {
            let target = 0;
            if (index === blend.currentIndex) target = 1 - blend.blend;
            if (index === blend.nextIndex)
              target = Math.max(target, blend.blend);
            mesh.material.opacity = THREE.MathUtils.lerp(
              mesh.material.opacity,
              target,
              o.planeFadeSmoothing,
            );
          });

          pointerCurrent.lerp(pointerTarget, o.parallaxSmoothing);
          const vMax = Math.max(o.velocityMax, 0.0001);
          const vNorm = THREE.MathUtils.clamp(
            Math.abs(scrollState.velocity) / vMax,
            0,
            1,
          );
          const drift = THREE.MathUtils.clamp(
            scrollState.velocity / vMax,
            -1,
            1,
          );
          breathIntensity = THREE.MathUtils.lerp(
            breathIntensity,
            o.breathEnabled
              ? THREE.MathUtils.clamp(vNorm * o.breathGain, 0, 1)
              : 0,
            o.breathSmoothing,
          );
          driftCurrent = THREE.MathUtils.lerp(
            driftCurrent,
            o.gestureParallaxEnabled ? drift : 0,
            o.gestureParallaxSmoothing,
          );

          const spread = xSpread();
          const scale = planeScale();
          meshes.forEach((mesh, index) => {
            const base = mesh.userData.basePosition;
            const opacity = mesh.material.opacity;
            const influence = o.parallaxEnabled
              ? opacity * (1 + index * 0.05)
              : 0;
            mesh.position.x =
              base.x * spread +
              pointerCurrent.x * o.parallaxAmountX * influence;
            mesh.position.y =
              base.y +
              pointerCurrent.y * o.parallaxAmountY * influence +
              driftCurrent * o.gestureParallaxAmountY;
            mesh.position.z = -index * o.planeGap;

            const breath = o.breathEnabled ? breathIntensity * opacity : 0;
            mesh.rotation.x = -pointerCurrent.y * o.breathTiltAmount * breath;
            mesh.rotation.y = pointerCurrent.x * o.breathTiltAmount * breath;
            const pulse = 1 + o.breathScaleAmount * breath;
            const a = mesh.userData.aspectRatio;
            mesh.scale.set(scale * a * pulse, scale * pulse, 1);
          });

          const labelIndex =
            blend.blend >= 0.5 ? blend.nextIndex : blend.currentIndex;
          if (labelIndex !== lastLabelIndex) {
            lastLabelIndex = labelIndex;
            setActiveIndex(labelIndex);
          }

          const mood = moodBlendData(cameraZ);
          if (mood) {
            const safe = THREE.MathUtils.clamp(mood.blend, 0, 1);
            bgColorA
              .set(mood.current.backgroundColor)
              .lerp(tmpA.set(mood.next.backgroundColor), safe);
            bgColorB
              .set(mood.current.blob1Color)
              .lerp(tmpB.set(mood.next.blob1Color), safe);
            bgColorC
              .set(mood.current.blob2Color)
              .lerp(tmpC.set(mood.next.blob2Color), safe);
            bgMaterial.uniforms.uBackgroundColor.value.copy(bgColorA);
            bgMaterial.uniforms.uBlob1Color.value.copy(bgColorB);
            bgMaterial.uniforms.uBlob2Color.value.copy(bgColorC);
          }

          const { nearestZ, deepestZ } = depthRange();
          const span = nearestZ - deepestZ;
          const depthProgress =
            span > 0
              ? THREE.MathUtils.clamp((nearestZ - cameraZ) / span, 0, 1)
              : 0;
          const distFromCenter = Math.abs(blend.blend - 0.5) * 2;
          const stability = THREE.MathUtils.smoothstep(distFromCenter, 0.35, 1);
          smoothedDepth = THREE.MathUtils.lerp(
            smoothedDepth,
            depthProgress,
            o.motionSmoothing,
          );
          smoothedVelocity = THREE.MathUtils.lerp(
            smoothedVelocity,
            vNorm * stability,
            o.motionSmoothing,
          );

          const radius = THREE.MathUtils.clamp(
            o.baseBlobRadius + smoothedDepth * o.depthToRadiusAmount,
            0.05,
            1,
          );
          bgMaterial.uniforms.uTime.value = time;
          bgMaterial.uniforms.uVelocityIntensity.value = smoothedVelocity;
          bgMaterial.uniforms.uNoiseStrength.value = o.noiseStrength;
          bgMaterial.uniforms.uBlobRadius.value = radius;
          bgMaterial.uniforms.uBlobRadiusSecondary.value =
            radius * o.secondaryBlobRadiusRatio;
          bgMaterial.uniforms.uBlobStrength.value = THREE.MathUtils.clamp(
            o.baseBlobStrength + smoothedVelocity * o.velocityToStrengthAmount,
            0,
            1,
          );

          trailGroup.visible = o.trailEnabled;
          if (o.trailEnabled) {
            const range = scrollState.maxZ - scrollState.minZ;
            const progress =
              range > 0
                ? THREE.MathUtils.clamp(
                    (scrollState.maxZ - cameraZ) / range,
                    0,
                    1,
                  )
                : 0;
            trailMaxPointCount = Math.round(
              THREE.MathUtils.lerp(
                o.trailMinPoints,
                o.trailMaxPoints,
                progress,
              ),
            );
            trailMaterial.opacity =
              o.trailOpacity *
              THREE.MathUtils.smoothstep(
                Math.min(progress + 0.1, 1 - progress),
                0.04,
                0.2,
              );
            addTrailPoint(computeTrailHead(cameraZ, progress));
          }

          renderer.clear(true, true, true);
          renderer.render(bgScene, bgCamera);
          renderer.clearDepth();
          renderer.render(scene, camera);
        };

        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", onPointerMove, {
          passive: true,
        });
        window.addEventListener("pointerleave", onPointerLeave, {
          passive: true,
        });
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });

        setReady(true);
        tick();

        cleanup = () => {
          if (frameId !== null) cancelAnimationFrame(frameId);
          window.removeEventListener("resize", resize);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerleave", onPointerLeave);
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchmove", onTouchMove);
          if (trailMesh) trailMesh.geometry.dispose();
          trailMaterial.dispose();
          meshes.forEach((m) => m.material.dispose());
          planeGeometry.dispose();
          bgGeometry.dispose();
          bgMaterial.dispose();
          textures.forEach((t) => t.dispose());
          renderer.dispose();
        };
      })
      .catch((e) =>
        console.error("[AtmosphericDepthGallery] init failed:", e.message),
      );

    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, []);

  const activePlane = planes[activeIndex] || planes[0];
  const activeLabel = (activePlane && activePlane.label) || {};
  const specs = buildSpecs(
    activePlane && activePlane.accentColor,
    activeLabel.pms,
  );
  const overlayColor = activeLabel.color || labelColor;

  return (
    <div
      className={"relative w-full h-screen overflow-hidden " + className}
      style={{ fontFamily, letterSpacing, textTransform: "uppercase" }}
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{ touchAction: "none" }}
      />

      {showLabels ? (
        <div
          className="fixed inset-0 z-20 pointer-events-none"
          style={{
            color: overlayColor,
            opacity: ready ? 1 : 0,
            transition: "opacity 260ms ease, color 520ms ease",
          }}
        >
          <div
            className="absolute top-1/2 grid gap-3"
            style={{ left: "clamp(2.5rem, 8vw, 12rem)" }}
          >
            <p className="m-0" style={{ fontSize: "9px" }}>
              {String(activeIndex + 1).padStart(2, "0")}
            </p>
            <p
              className="m-0 whitespace-nowrap"
              style={{ fontSize: "clamp(9px, 0.78vw, 11px)" }}
            >
              {activeLabel.word || "tone"}
            </p>
            <span
              className="inline-block w-[18px] h-[18px] rounded-full"
              style={{
                backgroundColor: specs.chip,
                boxShadow: "0 0 0 1px rgba(255,255,255,0.14)",
              }}
            />
          </div>

          <div
            className="absolute top-1/2"
            style={{
              right: "clamp(2.5rem, 7vw, 10rem)",
              width: "min(28vw, 360px)",
            }}
          >
            <dl className="m-0 grid gap-1">
              {[
                ["CMYK", specs.cmyk],
                ["RGB", specs.rgb],
                ["HEX", specs.hex],
                ["PMS", specs.pms],
              ].map(([term, value]) => (
                <div
                  key={term}
                  className="m-0 grid items-baseline"
                  style={{ gridTemplateColumns: "3.5rem 1fr", gap: "0.8rem" }}
                >
                  <dt className="m-0" style={{ fontSize: "9px" }}>
                    {term}
                  </dt>
                  <dd
                    className="m-0"
                    style={{ fontSize: "clamp(9px, 0.72vw, 11px)" }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
