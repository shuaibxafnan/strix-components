"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  Plane,
  Text,
  shaderMaterial,
  useProgress,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_ITEMS = [
  {
    title: "White Low-Top Sneaker",
    price: "$75",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-001.png",
    brand: "Nike",
    primary_color: "white",
    primary_color_hex: "#f1f0eb",
  },
  {
    title: "Black Mesh Running Shoe",
    price: "$89",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-002.png",
    brand: "Nike",
    primary_color: "black",
    primary_color_hex: "#202124",
  },
  {
    title: "Cream Retro Basketball Sneaker",
    price: "$95",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-003.png",
    brand: "Nike",
    primary_color: "cream",
    primary_color_hex: "#d9cfb9",
  },
  {
    title: "Nike Air Max 90",
    price: "$130",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-004.png",
    brand: "Nike",
    primary_color: "white",
    primary_color_hex: "#e9e7e2",
  },
  {
    title: "Nike Air Max 97",
    price: "$175",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-005.png",
    brand: "Nike",
    primary_color: "silver",
    primary_color_hex: "#a7adb5",
  },
  {
    title: "Nike Air Max 270",
    price: "$150",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-006.png",
    brand: "Nike",
    primary_color: "black",
    primary_color_hex: "#202124",
  },
  {
    title: "Nike Air Max DN",
    price: "$160",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-007.png",
    brand: "Nike",
    primary_color: "black",
    primary_color_hex: "#242a26",
  },
  {
    title: "Nike Air Force 1 Low White",
    price: "$115",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-008.png",
    brand: "Nike",
    primary_color: "white",
    primary_color_hex: "#f5f4ef",
  },
  {
    title: "Nike Air Force 1 Low Triple Black",
    price: "$115",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-009.png",
    brand: "Nike",
    primary_color: "black",
    primary_color_hex: "#171717",
  },
  {
    title: "Nike Dunk Low Navy",
    price: "$110",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-010.png",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#243d70",
  },
  {
    title: "Nike SB Dunk Low Brown Cream",
    price: "$120",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-011.png",
    brand: "Nike",
    primary_color: "brown",
    primary_color_hex: "#76513e",
  },
  {
    title: "Air Jordan 1 High",
    price: "$180",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-012.png",
    brand: "Nike",
    primary_color: "red",
    primary_color_hex: "#b5282d",
  },
  {
    title: "Air Jordan 4",
    price: "$210",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-013.png",
    brand: "Nike",
    primary_color: "gray",
    primary_color_hex: "#96999b",
  },
  {
    title: "Nike LeBron Basketball Shoe",
    price: "$190",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-014.png",
    brand: "Nike",
    primary_color: "purple",
    primary_color_hex: "#67449b",
  },
  {
    title: "Nike KD Basketball Shoe",
    price: "$160",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-015.png",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#1769d2",
  },
  {
    title: "Nike Giannis Basketball Shoe",
    price: "$130",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-016.png",
    brand: "Nike",
    primary_color: "green",
    primary_color_hex: "#72c83c",
  },
  {
    title: "Nike Pegasus",
    price: "$140",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-017.png",
    brand: "Nike",
    primary_color: "gray",
    primary_color_hex: "#a6a8aa",
  },
  {
    title: "Nike Vomero",
    price: "$150",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-018.png",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#a8c9df",
  },
  {
    title: "Nike Alphafly",
    price: "$285",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-019.png",
    brand: "Nike",
    primary_color: "white",
    primary_color_hex: "#f1f0eb",
  },
  {
    title: "Nike Vaporfly",
    price: "$260",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-020.png",
    brand: "Nike",
    primary_color: "pink",
    primary_color_hex: "#ed8eb4",
  },
  {
    title: "Nike Metcon",
    price: "$130",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-021.png",
    brand: "Nike",
    primary_color: "black",
    primary_color_hex: "#292929",
  },
  {
    title: "Nike Free Run",
    price: "$100",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-022.png",
    brand: "Nike",
    primary_color: "gray",
    primary_color_hex: "#414348",
  },
  {
    title: "Nike ZoomX Invincible Run",
    price: "$180",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-023.png",
    brand: "Nike",
    primary_color: "white",
    primary_color_hex: "#efeee9",
  },
  {
    title: "Nike Mercurial Football Boot",
    price: "$150",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-024.png",
    brand: "Nike",
    primary_color: "orange",
    primary_color_hex: "#f07827",
  },
  {
    title: "Nike Phantom GX Football Boot",
    price: "$160",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-025.png",
    brand: "Nike",
    primary_color: "green",
    primary_color_hex: "#a5df4a",
  },
  {
    title: "Nike Tiempo Legend Football Boot",
    price: "$190",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-026.png",
    brand: "Nike",
    primary_color: "black",
    primary_color_hex: "#202020",
  },
  {
    title: "Nike Pegasus Trail",
    price: "$150",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-027.png",
    brand: "Nike",
    primary_color: "green",
    primary_color_hex: "#68734b",
  },
  {
    title: "Nike ACG Hiking Shoe",
    price: "$145",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-028.png",
    brand: "Nike",
    primary_color: "brown",
    primary_color_hex: "#78634c",
  },
  {
    title: "Nike Calm Slide",
    price: "$55",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-029.png",
    brand: "Nike",
    primary_color: "black",
    primary_color_hex: "#171717",
  },
  {
    title: "Nike Air Max 1 Black White Blue",
    price: "$140",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-030.png",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#2456a6",
  },
  {
    title: "New Balance 574",
    price: "$100",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-031.png",
    brand: "New Balance",
    primary_color: "gray",
    primary_color_hex: "#85888b",
  },
  {
    title: "New Balance 990v6",
    price: "$200",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-032.png",
    brand: "New Balance",
    primary_color: "gray",
    primary_color_hex: "#85878a",
  },
  {
    title: "New Balance 991v2",
    price: "$250",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-033.png",
    brand: "New Balance",
    primary_color: "gray",
    primary_color_hex: "#4a4b4e",
  },
  {
    title: "New Balance 2002R",
    price: "$145",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-034.png",
    brand: "New Balance",
    primary_color: "gray",
    primary_color_hex: "#a5a7aa",
  },
  {
    title: "New Balance 1906R",
    price: "$155",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-035.png",
    brand: "New Balance",
    primary_color: "silver",
    primary_color_hex: "#b9bdc2",
  },
  {
    title: "New Balance 9060 Cream Beige",
    price: "$160",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-036.png",
    brand: "New Balance",
    primary_color: "cream",
    primary_color_hex: "#d7cbb5",
  },
  {
    title: "New Balance 530",
    price: "$100",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-037.png",
    brand: "New Balance",
    primary_color: "white",
    primary_color_hex: "#eeece7",
  },
  {
    title: "New Balance 327",
    price: "$100",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-038.png",
    brand: "New Balance",
    primary_color: "cream",
    primary_color_hex: "#ded3bd",
  },
  {
    title: "New Balance 550",
    price: "$110",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-039.png",
    brand: "New Balance",
    primary_color: "green",
    primary_color_hex: "#315a43",
  },
  {
    title: "New Balance 650",
    price: "$130",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-040.png",
    brand: "New Balance",
    primary_color: "red",
    primary_color_hex: "#79343d",
  },
  {
    title: "New Balance Fresh Foam X 1080",
    price: "$165",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-041.png",
    brand: "New Balance",
    primary_color: "blue",
    primary_color_hex: "#8bbbdc",
  },
  {
    title: "New Balance Fresh Foam X More",
    price: "$155",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-042.png",
    brand: "New Balance",
    primary_color: "black",
    primary_color_hex: "#252525",
  },
  {
    title: "New Balance FuelCell Rebel",
    price: "$140",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-043.png",
    brand: "New Balance",
    primary_color: "green",
    primary_color_hex: "#b2df42",
  },
  {
    title: "New Balance FuelCell SuperComp Elite",
    price: "$250",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-044.png",
    brand: "New Balance",
    primary_color: "red",
    primary_color_hex: "#d94343",
  },
  {
    title: "New Balance Fresh Foam X Hierro",
    price: "$150",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-045.png",
    brand: "New Balance",
    primary_color: "green",
    primary_color_hex: "#555d3b",
  },
  {
    title: "New Balance Minimus",
    price: "$110",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-046.png",
    brand: "New Balance",
    primary_color: "black",
    primary_color_hex: "#202020",
  },
  {
    title: "New Balance 480",
    price: "$90",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-047.png",
    brand: "New Balance",
    primary_color: "white",
    primary_color_hex: "#f0eee8",
  },
  {
    title: "New Balance 1000",
    price: "$150",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-048.png",
    brand: "New Balance",
    primary_color: "silver",
    primary_color_hex: "#aeb8c4",
  },
  {
    title: "New Balance 9060 Dusty Pink",
    price: "$160",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-049.png",
    brand: "New Balance",
    primary_color: "pink",
    primary_color_hex: "#c99fa8",
  },
  {
    title: "New Balance 574 Outdoor",
    price: "$110",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-050.png",
    brand: "New Balance",
    primary_color: "green",
    primary_color_hex: "#455a40",
  },
  {
    title: "Adidas Ultraboost",
    price: "$180",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-051.png",
    brand: "Adidas",
    primary_color: "black",
    primary_color_hex: "#222222",
  },
  {
    title: "Adidas Samba OG",
    price: "$100",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-052.png",
    brand: "Adidas",
    primary_color: "white",
    primary_color_hex: "#f0eee8",
  },
  {
    title: "Adidas Superstar",
    price: "$95",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-053.png",
    brand: "Adidas",
    primary_color: "white",
    primary_color_hex: "#f2f0e9",
  },
  {
    title: "Adidas Adizero Adios Pro",
    price: "$250",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-054.png",
    brand: "Adidas",
    primary_color: "yellow",
    primary_color_hex: "#d7ed42",
  },
  {
    title: "Adidas Predator Elite",
    price: "$280",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-055.png",
    brand: "Adidas",
    primary_color: "red",
    primary_color_hex: "#d52e35",
  },
  {
    title: "Adidas Terrex Hiking Shoe",
    price: "$140",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-056.png",
    brand: "Adidas",
    primary_color: "green",
    primary_color_hex: "#68734a",
  },
  {
    title: "Adidas Forum Low",
    price: "$100",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-057.png",
    brand: "Adidas",
    primary_color: "blue",
    primary_color_hex: "#2855a2",
  },
  {
    title: "Adidas Gazelle Indoor",
    price: "$120",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-058.png",
    brand: "Adidas",
    primary_color: "red",
    primary_color_hex: "#762d3e",
  },
  {
    title: "Adidas Copa Pure",
    price: "$180",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-059.png",
    brand: "Adidas",
    primary_color: "black",
    primary_color_hex: "#202020",
  },
  {
    title: "Adidas Adilette Slide",
    price: "$35",
    image_url: "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/shoe-060.png",
    brand: "Adidas",
    primary_color: "black",
    primary_color_hex: "#171717",
  },
];

const BASE_CONFIG = {
  gridCols: 8,
  itemSize: 2.5,
  gap: 0.4,
  dragSpeed: 2.2,
  dampFactor: 0.2,
  tiltFactor: 0.08,
  clickThreshold: 5,
  dragResistance: 0.25,
  zoomIn: 12,
  zoomOut: 31,
  zoomDamp: 0.25,
  focusScale: 1.5,
  dimScale: 0.5,
  dimOpacity: 0.15,
  curvatureStrength: 0.06,
  fogNear: 19,
  fogFar: 100,
  enterStartOpacity: 0,
  enterStartZ: -50,
  exitEndZ: 20,
  transitionZDamp: 0.25,
  enterOpacityDamp: 0.85,
  exitOpacityDamp: 0.15,
  recoverOpacityDamp: 0.06,
  enterStaggerDelay: 400,
  exitStaggerDelay: 300,
  cleanupTimeout: 700,
  exitSpreadY: 0.5,
  enterSpreadY: 1,
  transitionYDamp: 0.08,
  cullDistance: 14,
  bgOpacity: 0.4,
  bgSpeed: 0.05,
  bgScale: 3,
  bgLineThickness: 0.03,
};

const calcGridDims = (count, config) => {
  const rows = Math.ceil(count / config.gridCols) || 1;
  const spacing = config.itemSize + config.gap;
  return { width: config.gridCols * spacing, height: rows * spacing };
};

const TOPOGRAPHY_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const TOPOGRAPHY_FRAG = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uOpacity;
uniform float uLineOpacity;
uniform float uScale;
uniform float uLineThickness;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 noiseUv = uv;
  noiseUv.x *= aspect;

  vec2 centeredUv = uv - 0.5;
  centeredUv.x *= aspect;
  float dist = length(centeredUv);
  float radius = 0.6;
  float mask = 1.0 - smoothstep(radius - 0.01, radius + 0.01, dist);

  float n = noise(noiseUv * uScale + uTime * 0.05);
  float lines = fract(n * 5.0);
  float pattern = smoothstep(0.5 - uLineThickness, 0.5, lines) -
    smoothstep(0.5, 0.5 + uLineThickness, lines);

  float grain = (hash(vUv * 500.0) - 0.5) * 0.15;
  vec3 finalColor = uColor + grain;

  gl_FragColor = vec4(finalColor, pattern * uLineOpacity * mask * uOpacity);
}
`;

const HOLO_VERT = `
varying vec2 vUv;
uniform float uTime;
uniform float uActive;
void main() {
  vUv = uv;
  vec3 pos = position;
  float breath = sin(uTime * 2.0) * 0.015 * uActive;
  float scale = 1.0 + breath;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos * scale, 1.0);
}
`;

const HOLO_FRAG = `
uniform sampler2D uTexture;
uniform float uOpacity;
uniform float uActive;
varying vec2 vUv;
void main() {
  vec4 texColor = texture2D(uTexture, vUv);
  vec3 baseColor = texColor.rgb;
  if (uActive < 0.01) {
    gl_FragColor = vec4(baseColor, texColor.a * uOpacity);
    return;
  }
  float diagonal = (vUv.x * 0.8) + vUv.y;
  float sheenPos = uActive * 2.5;
  float sheenWidth = 0.5;
  float dist = abs(diagonal - sheenPos);
  float intensity = 1.0 - smoothstep(0.0, sheenWidth, dist);
  intensity = pow(intensity, 3.0);
  float sheenFade = 1.0 - smoothstep(0.7, 1.0, uActive);
  vec3 sheenColor = vec3(0.85, 0.92, 1.0) * intensity * 0.9 * sheenFade;
  vec3 finalColor = baseColor + sheenColor * texColor.a;
  gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
}
`;

const TopographyMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#e0e0e0"),
    uResolution: new THREE.Vector2(1, 1),
    uOpacity: 1,
    uLineOpacity: 0.4,
    uScale: 3,
    uLineThickness: 0.03,
  },
  TOPOGRAPHY_VERT,
  TOPOGRAPHY_FRAG,
);

const HoloCardMaterial = shaderMaterial(
  { uTime: 0, uTexture: new THREE.Texture(), uOpacity: 1, uActive: 0 },
  HOLO_VERT,
  HOLO_FRAG,
);

extend({ TopographyMaterial, HoloCardMaterial });

function TopologyBackground({ isZoomedIn, color, config }) {
  const materialRef = useRef();
  const planeWidth = 90;
  const planeHeight = 40;

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    material.uTime += delta * (config.bgSpeed / 0.05);
    material.uResolution.set(planeWidth, planeHeight);
    material.uColor.set(color);
    material.uLineOpacity = config.bgOpacity;
    material.uScale = config.bgScale;
    material.uLineThickness = config.bgLineThickness;
    easing.damp(material, "uOpacity", isZoomedIn ? 0.25 : 1, 0.3, delta);
  });

  return (
    <Plane
      args={[planeWidth, planeHeight]}
      position={[0, 0, -15]}
      renderOrder={-1}
    >
      <topographyMaterial ref={materialRef} transparent depthWrite={false} />
    </Plane>
  );
}

function Rig({ gridW, gridH, rigState, config }) {
  const { camera, gl } = useThree();
  const prevPos = useRef(new THREE.Vector3());
  const hasSetInitialZoom = useRef(false);

  useEffect(() => {
    if (!hasSetInitialZoom.current && rigState.zoom) {
      camera.position.z = rigState.zoom;
      hasSetInitialZoom.current = true;
    }
  }, [camera, rigState]);

  const getBounds = useCallback(() => {
    const dist = camera.position.z;
    const vFov = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
    const visibleWidth = visibleHeight * camera.aspect;
    return {
      x: Math.max(0, (gridW - visibleWidth) / 2 + 2),
      y: Math.max(0, (gridH - visibleHeight) / 2 + 2),
      visibleHeight,
    };
  }, [camera, gridW, gridH]);

  useEffect(() => {
    const canvas = gl.domElement;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let initialRigX = 0;
    let initialRigY = 0;
    let maxDragDistance = 0;

    const onDown = (e) => {
      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      initialRigX = rigState.target.x;
      initialRigY = rigState.target.y;
      maxDragDistance = 0;
      rigState.isDragging = false;
      canvas.style.cursor = "grabbing";
    };

    const onMove = (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      maxDragDistance = Math.max(maxDragDistance, Math.hypot(dx, dy));
      const threshold = "ontouchstart" in window ? 15 : config.clickThreshold;
      if (maxDragDistance > threshold) {
        rigState.isDragging = true;
        rigState.activeId = null;
      }
      const { x: bx, y: by, visibleHeight } = getBounds();
      const sensitivity = (visibleHeight / window.innerHeight) * config.dragSpeed;
      let targetX = initialRigX + dx * sensitivity;
      let targetY = initialRigY - dy * sensitivity;
      if (targetX > bx) targetX = bx + (targetX - bx) * config.dragResistance;
      if (targetX < -bx) targetX = -bx + (targetX + bx) * config.dragResistance;
      if (targetY > by) targetY = by + (targetY - by) * config.dragResistance;
      if (targetY < -by) targetY = -by + (targetY + by) * config.dragResistance;
      const maxOvershoot = 3;
      targetX = Math.max(-bx - maxOvershoot, Math.min(bx + maxOvershoot, targetX));
      targetY = Math.max(-by - maxOvershoot, Math.min(by + maxOvershoot, targetY));
      rigState.target.set(targetX, targetY, 0);
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      rigState.isDragging = false;
      canvas.style.cursor = "grab";
      if (rigState.activeId !== null) return;
      const { x: bx, y: by } = getBounds();
      const isZoomedOut = camera.position.z > config.zoomIn + 2;
      const snapX = isZoomedOut ? 0 : Math.max(-bx, Math.min(bx, rigState.target.x));
      const snapY = isZoomedOut ? 2 : Math.max(-by, Math.min(by, rigState.target.y));
      rigState.target.set(snapX, snapY, 0);
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl, camera, getBounds, rigState, config]);

  useFrame((_, delta) => {
    easing.damp3(rigState.current, rigState.target, config.dampFactor, delta);
    easing.damp(camera.position, "z", rigState.zoom, config.zoomDamp, delta);
    rigState.velocity.copy(rigState.current).sub(prevPos.current);
    prevPos.current.copy(rigState.current);
    const zoomFactor = Math.min(1, config.zoomIn / rigState.zoom);
    const tiltX = rigState.velocity.y * config.tiltFactor * zoomFactor;
    const tiltY = -rigState.velocity.x * config.tiltFactor * zoomFactor;
    easing.damp(camera.rotation, "x", tiltX, 0.2, delta);
    easing.damp(camera.rotation, "y", tiltY, 0.2, delta);
  });

  return null;
}

function CloseButton({ isActive, position, onClose }) {
  const { gl } = useThree();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShown(false);
      return;
    }
    const id = setTimeout(() => setShown(true), 250);
    return () => clearTimeout(id);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <Html
      position={position}
      center
      occlude
      style={{ pointerEvents: "auto", transform: "translate(-50%, -150%)" }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onMouseEnter={() => (gl.domElement.style.cursor = "pointer")}
        onMouseLeave={() => (gl.domElement.style.cursor = "grab")}
        className={`flex h-8 w-8 items-center justify-center border border-[var(--accent)] bg-transparent p-0 text-[var(--accent)] transition-opacity duration-200 ${shown ? "opacity-70 hover:opacity-100" : "scale-90 opacity-0"
          }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </Html>
  );
}

function ShoeTile({
  data,
  index,
  basePos,
  gridVisible,
  transitionStartTime,
  interactive,
  gridHeight,
  rigState,
  config,
  accentColor,
  mutedColor,
  focusedIndex,
}) {
  const ref = useRef();
  const imageRef = useRef();
  const titleRef = useRef();
  const priceRef = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(data.image_url);

  const focusZ = useRef(0);
  const curveZ = useRef(0);
  const transitionZ = useRef(0);
  const transitionY = useRef(0);
  const breathScale = useRef(1);
  const animatedPos = useRef({ x: basePos.x, y: basePos.y });
  const wasDimmedByFocus = useRef(false);

  const normalizedY = gridHeight > 0 ? basePos.y / (gridHeight / 2) : 0;

  useLayoutEffect(() => {
    if (gridVisible) {
      transitionZ.current = config.enterStartZ;
      transitionY.current = normalizedY * config.enterSpreadY;
      if (imageRef.current) {
        imageRef.current.material.uOpacity = config.enterStartOpacity;
      }
    } else {
      transitionZ.current = 0;
      transitionY.current = 0;
      if (imageRef.current) imageRef.current.material.uOpacity = 1;
    }
  }, []);

  const imageDims = useMemo(() => {
    const maxSize = config.itemSize * 0.9;
    if (!texture.image) return { width: maxSize, height: maxSize };
    const aspect = texture.image.width / texture.image.height;
    return aspect > 1
      ? { width: maxSize, height: maxSize / aspect }
      : { width: maxSize * aspect, height: maxSize };
  }, [texture, config.itemSize]);

  useFrame((state, delta) => {
    const group = ref.current;
    const material = imageRef.current?.material;
    if (!group || !material) return;

    easing.damp(animatedPos.current, "x", basePos.x, 0.2, delta);
    easing.damp(animatedPos.current, "y", basePos.y, 0.2, delta);

    const canTransition =
      Date.now() - transitionStartTime > (data.randomDelay || 0);

    let targetOpacity = 1;
    let targetZ = 0;
    let targetY = 0;
    if (gridVisible && !canTransition) {
      targetOpacity = config.enterStartOpacity;
      targetZ = config.enterStartZ;
      targetY = normalizedY * config.enterSpreadY;
    } else if (!gridVisible && canTransition) {
      targetOpacity = 0;
      targetZ = config.exitEndZ;
      targetY = normalizedY * config.exitSpreadY;
    }

    const x = animatedPos.current.x + rigState.current.x;
    const y = animatedPos.current.y + rigState.current.y;

    const cull = config.cullDistance * (rigState.zoom / 8);
    const inRange = Math.abs(x) < cull && Math.abs(y) < cull;
    const exiting = !gridVisible && canTransition;
    if (
      (!inRange && !exiting) ||
      (material.uOpacity < 0.01 && targetOpacity < 0.01)
    ) {
      group.visible = false;
      return;
    }
    group.visible = true;

    const isZoomedIn = rigState.zoom <= config.zoomIn + 0.5;
    const zoomRatio = isZoomedIn
      ? 0
      : THREE.MathUtils.clamp(
        (rigState.zoom - config.zoomIn) / (config.zoomOut - config.zoomIn),
        0,
        1,
      );
    const targetCurveZ =
      -(x * x + y * y) *
      config.curvatureStrength *
      easing.cubic.inOut(zoomRatio);

    const isFocusMode = rigState.activeId !== null;
    const isActive = rigState.activeId === index;
    const isHovered = hovered && interactive && !rigState.isDragging;

    let interactionScale = isHovered ? 1.05 : 1;
    let interactionOpacity = 1;
    let targetTextOpacity = 0;
    let targetFocusZ = isHovered ? 0.5 : 0;

    if (isFocusMode) {
      if (isActive) {
        interactionScale = config.focusScale;
        targetTextOpacity = 1;
        targetFocusZ = 2;
      } else {
        interactionScale = config.dimScale;
        interactionOpacity = config.dimOpacity;
        targetFocusZ = -0.5;
        wasDimmedByFocus.current = true;
      }
    }

    easing.damp(group.scale, "x", interactionScale, 0.15, delta);
    easing.damp(group.scale, "y", interactionScale, 0.15, delta);
    easing.damp(focusZ, "current", targetFocusZ, 0.2, delta);
    easing.damp(curveZ, "current", targetCurveZ, 0.2, delta);
    easing.damp(transitionZ, "current", targetZ, config.transitionZDamp, delta);
    easing.damp(transitionY, "current", targetY, config.transitionYDamp, delta);
    group.position.set(
      x,
      y + transitionY.current,
      curveZ.current + focusZ.current + transitionZ.current,
    );

    material.uTime = state.clock.elapsedTime;
    easing.damp(material, "uActive", isActive ? 1 : 0, isActive ? 0.6 : 0.15, delta);

    const recovering = !isFocusMode && wasDimmedByFocus.current;
    let opacityDamp = gridVisible
      ? config.enterOpacityDamp
      : config.exitOpacityDamp;
    if (recovering && gridVisible) {
      opacityDamp = config.recoverOpacityDamp;
      if (material.uOpacity > 0.95) wasDimmedByFocus.current = false;
    }
    easing.damp(
      material,
      "uOpacity",
      interactionOpacity * targetOpacity,
      opacityDamp,
      delta,
    );

    if (gridVisible) {
      const textTarget = targetOpacity < 0.8 ? 0 : targetTextOpacity;
      const targetBreath = isActive
        ? 1 + Math.sin(state.clock.elapsedTime * 2) * 0.035
        : 1;
      easing.damp(breathScale, "current", targetBreath, 0.1, delta);
      [titleRef.current, priceRef.current].forEach((text) => {
        if (!text) return;
        easing.damp(text, "fillOpacity", textTarget, 0.1, delta);
        text.scale.setScalar(breathScale.current);
      });
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!interactive || rigState.isDragging) return;
    if (rigState.activeId === index) {
      rigState.activeId = null;
      return;
    }
    rigState.target.set(-basePos.x, -basePos.y, 0);
    rigState.activeId = index;
    if (rigState.zoom > config.zoomIn + 2) rigState.zoom = config.zoomIn;
  };

  const textY = -(imageDims.height / 2) - 0.25;

  return (
    <group ref={ref}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <planeGeometry args={[imageDims.width * 1.1, imageDims.height * 1.1]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh ref={imageRef}>
        <planeGeometry args={[imageDims.width, imageDims.height, 16, 16]} />
        <holoCardMaterial transparent uTexture={texture} />
      </mesh>
      {gridVisible && (
        <>
          <Text
            ref={titleRef}
            position={[0, textY, 0.01]}
            fontSize={0.1}
            color={accentColor}
            anchorY="top"
            anchorX="center"
            maxWidth={2.5}
            fillOpacity={0}
          >
            {data.title}
          </Text>
          {data.price && (
            <Text
              ref={priceRef}
              position={[0, textY - 0.22, 0.01]}
              fontSize={0.09}
              color={mutedColor}
              anchorY="top"
              anchorX="center"
              fillOpacity={0}
            >
              {data.price}
            </Text>
          )}
        </>
      )}
      <CloseButton
        isActive={focusedIndex === index}
        position={[imageDims.width / 2 - 0.15, imageDims.height / 2 - 0.15, 0.02]}
        onClose={() => (rigState.activeId = null)}
      />
    </group>
  );
}

function GridCanvas({
  items,
  gridVisible,
  transitionStartTime,
  interactive,
  rigState,
  config,
  accentColor,
  mutedColor,
  focusedIndex,
}) {
  const { tiles, gridHeight } = useMemo(() => {
    const spacing = config.itemSize + config.gap;
    const dims = calcGridDims(items.length, config);
    const maxDelay = gridVisible
      ? config.enterStaggerDelay
      : config.exitStaggerDelay;

    return {
      gridHeight: dims.height,
      tiles: items.map((item, i) => ({
        ...item,
        index: i,
        randomDelay: Math.random() * maxDelay,
        basePos: {
          x: (i % config.gridCols) * spacing - dims.width / 2 + spacing / 2,
          y:
            -(Math.floor(i / config.gridCols) * spacing) +
            dims.height / 2 -
            spacing / 2,
        },
      })),
    };
  }, [items, gridVisible, config]);

  return (
    <>
      {tiles.map((tile) => (
        <ShoeTile
          key={tile.index}
          data={tile}
          index={tile.index}
          basePos={tile.basePos}
          gridVisible={gridVisible}
          transitionStartTime={transitionStartTime}
          interactive={interactive}
          gridHeight={gridHeight}
          rigState={rigState}
          config={config}
          accentColor={accentColor}
          mutedColor={mutedColor}
          focusedIndex={focusedIndex}
        />
      ))}
    </>
  );
}

function GridHeader({
  brandName,
  brandTagline,
  activeLabel,
  countLabel,
  itemCount,
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 py-5 sm:px-8 sm:py-6">
      <div className="pointer-events-auto flex flex-col">
        <span className="font-serif text-lg font-semibold uppercase tracking-[0.14em] text-[var(--ink)] sm:text-xl">
          {brandName}
        </span>
        <span className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
          {brandTagline}
        </span>
      </div>

      <div className="pointer-events-auto hidden items-baseline gap-2 border-b border-[color-mix(in_srgb,var(--muted)_25%,transparent)] pb-0.5 text-right sm:flex">
        <span className="font-serif text-2xl leading-none text-[var(--ink)]">
          {String(itemCount).padStart(2, "0")}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          {activeLabel} {countLabel}
        </span>
      </div>
    </header>
  );
}

const islandTransition = { type: "spring", stiffness: 500, damping: 30, mass: 1 };

const swap = {
  initial: { opacity: 0, scale: 0.9, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.9, filter: "blur(4px)" },
  transition: { ...islandTransition, opacity: { duration: 0.2 } },
};

function IconButton({ onClick, icon, label }) {
  return (
    <motion.button
      layout="position"
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] sm:h-11 sm:w-11"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        {icon === "plus" && <line x1="12" y1="5" x2="12" y2="19" />}
      </svg>
    </motion.button>
  );
}

function TabButton({ children, isActive, onClick, count }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      className={`relative z-[1] whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-wide sm:text-sm ${isActive ? "text-[var(--ink)]" : "text-[var(--muted)]"
        }`}
    >
      <span className="flex items-baseline gap-1.5">
        {children}
        <span className="font-serif text-[11px] normal-case tracking-normal opacity-70">
          {count}
        </span>
      </span>
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          transition={islandTransition}
          className="absolute inset-0 -z-10 rounded-full border border-[color-mix(in_srgb,var(--ink)_20%,transparent)] bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
        />
      )}
    </motion.button>
  );
}

function ControlIsland({
  collections,
  currentCollection,
  onSwitch,
  onZoom,
  isZoomedIn,
  hasActiveSelection,
  onBuyNow,
  buyLabel,
  zoomInLabel,
  zoomOutLabel,
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 sm:bottom-9">
      <motion.div
        layout
        transition={islandTransition}
        className="pointer-events-auto flex h-12 items-center overflow-hidden rounded-[28px] border border-[color-mix(in_srgb,var(--muted)_20%,transparent)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] p-1.5 backdrop-blur-2xl sm:h-14 sm:rounded-[32px]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {hasActiveSelection ? (
            <motion.button
              key="buy"
              type="button"
              {...swap}
              whileTap={{ scale: 0.95 }}
              onClick={onBuyNow}
              className="flex h-9 items-center whitespace-nowrap rounded-full bg-[var(--ink)] px-6 text-sm font-semibold text-[var(--bg)] sm:h-11"
            >
              {buyLabel}
            </motion.button>
          ) : isZoomedIn ? (
            <motion.div key="compact" {...swap}>
              <IconButton
                icon="minus"
                onClick={() => onZoom("OUT")}
                label={zoomOutLabel}
              />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              {...swap}
              className="flex items-center gap-1.5 px-0.5"
            >
              <IconButton
                icon="plus"
                onClick={() => onZoom("IN")}
                label={zoomInLabel}
              />
              <div className="mx-1 h-6 w-px bg-[color-mix(in_srgb,var(--muted)_25%,transparent)]" />
              <div className="flex items-baseline gap-1">
                {collections.map((collection, index) => (
                  <TabButton
                    key={collection.label}
                    isActive={currentCollection === index}
                    onClick={() => onSwitch(index)}
                    count={collection.count}
                  >
                    {collection.label}
                  </TabButton>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ArchiveMap({
  gridDims,
  rigState,
  cols,
  totalItems,
  isZoomedIn,
  dotColor,
  label,
}) {
  const containerRef = useRef();
  const canvasRef = useRef();
  const zoomRef = useRef(1);
  const centerRef = useRef({ x: 0.5, y: 0.5 });
  const opacityRef = useRef(0);
  const [widthPercent, setWidthPercent] = useState(8);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  const aspectRatio = gridDims.width / gridDims.height || 1;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const rows = Math.ceil(totalItems / cols) || 1;

  useEffect(() => {
    const update = () => {
      const wp = window.innerWidth < 480 ? 20 : window.innerWidth < 768 ? 15 : 8;
      setWidthPercent(wp);
      const width = (window.innerWidth * wp) / 100;
      setDims({ width, height: width / aspectRatio });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [aspectRatio]);

  useEffect(() => {
    let rafId;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const isMobile = window.innerWidth < 768;
      const isActive = rigState.isDragging || rigState.activeId !== null;
      const shouldShow = isMobile ? isActive && isZoomedIn : isActive;
      opacityRef.current += ((shouldShow ? 1 : 0) - opacityRef.current) * 0.1;
      container.style.opacity = opacityRef.current;
      if (opacityRef.current < 0.02) return;

      const isFocused = rigState.activeId !== null;
      let targetCenterX = 0.5;
      let targetCenterY = 0.5;
      if (isFocused) {
        targetCenterX = ((rigState.activeId % cols) + 0.5) / cols;
        targetCenterY = (Math.floor(rigState.activeId / cols) + 0.5) / rows;
      }
      zoomRef.current += ((isFocused ? 2.5 : 1) - zoomRef.current) * 0.08;
      centerRef.current.x += (targetCenterX - centerRef.current.x) * 0.08;
      centerRef.current.y += (targetCenterY - centerRef.current.y) * 0.08;

      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      const zoom = zoomRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-centerRef.current.x * w, -centerRef.current.y * h);

      const baseDotSize = Math.max(w, h) * 0.015;
      ctx.fillStyle = dotColor;
      for (let i = 0; i < totalItems; i++) {
        const selected = rigState.activeId === i;
        ctx.globalAlpha = selected ? 1 : 0.45;
        ctx.beginPath();
        ctx.arc(
          (((i % cols) + 0.5) / cols) * w,
          ((Math.floor(i / cols) + 0.5) / rows) * h,
          selected ? baseDotSize * 2 : baseDotSize,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      if (!isFocused) {
        const vFov = (45 * Math.PI) / 180;
        const viewHeight = 2 * Math.tan(vFov / 2) * 10;
        const viewWidth = viewHeight * (window.innerWidth / window.innerHeight);
        const rectW = Math.min(viewWidth / gridDims.width, 1) * w;
        const rectH = Math.min(viewHeight / gridDims.height, 1) * h;
        const rectX = (0.5 - rigState.current.x / gridDims.width) * w - rectW / 2;
        const rectY = (0.5 + rigState.current.y / gridDims.height) * h - rectH / 2;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = dotColor;
        ctx.lineWidth = 1.5 / zoom;
        ctx.strokeRect(rectX, rectY, rectW, rectH);
      }
      ctx.restore();
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [gridDims, cols, rows, rigState, totalItems, isZoomedIn, dotColor]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed bottom-[2vh] right-[2vw] z-[100] overflow-hidden border border-[color-mix(in_srgb,var(--bg)_20%,transparent)] bg-[color-mix(in_srgb,var(--ink)_80%,transparent)] opacity-0 backdrop-blur-[10px]"
      style={{ width: `${widthPercent}vw`, aspectRatio }}
    >
      <span className="absolute left-1.5 top-1 text-[8px] uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--bg)_50%,transparent)]">
        {label}
      </span>
      <canvas
        ref={canvasRef}
        width={dims.width * dpr}
        height={dims.height * dpr}
        className="h-full w-full"
      />
    </div>
  );
}

function LoadingScreen({ brandName, loadingLabel }) {
  const { progress, active } = useProgress();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (active || progress < 100) return;
    const id = setTimeout(() => setDismissed(true), 350);
    return () => clearTimeout(id);
  }, [active, progress]);

  if (dismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--bg)] transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"
        }`}
    >
      <span className="font-serif text-sm uppercase tracking-[0.3em] text-[var(--ink)]">
        {brandName}
      </span>
      <div className="mt-5 h-px w-40 overflow-hidden bg-[color-mix(in_srgb,var(--muted)_20%,transparent)]">
        <div
          className="h-full bg-[var(--ink)] transition-[width] duration-150 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
        {loadingLabel} {Math.round(progress)}%
      </span>
    </div>
  );
}

export default function ShoeGrid({
  items = DEFAULT_ITEMS,
  collections: collectionsProp = null,
  brandName = "ARCHIVE",
  brandTagline = "Field Index",
  allLabel = "All",
  countLabel = "in view",
  mapLabel = "Map",
  buyLabel = "Buy now",
  zoomInLabel = "Zoom in",
  zoomOutLabel = "Zoom out",
  loadingLabel = "Loading",
  bgColor = "#ffffff",
  inkColor = "#000000",
  accentColor = "#000000",
  mutedColor = "#737373",
  gridCols = 8,
  itemSize = 2.5,
  gap = 0.4,
  zoomOutLevel = 31,
  zoomInLevel = 12,
  onBuyNow = null,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [currentCollection, setCurrentCollection] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(zoomOutLevel);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const timersRef = useRef([]);

  useEffect(() => {
    setMounted(true);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    items.forEach((item) => {
      if (item.image_url) useTexture.preload(item.image_url);
    });
  }, [mounted, items]);

  const config = useMemo(
    () => ({
      ...BASE_CONFIG,
      gridCols,
      itemSize,
      gap,
      zoomOut: zoomOutLevel,
      zoomIn: zoomInLevel,
    }),
    [gridCols, itemSize, gap, zoomOutLevel, zoomInLevel],
  );

  const rigState = useMemo(
    () => ({
      target: new THREE.Vector3(0, 2, 0),
      current: new THREE.Vector3(0, 2, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      zoom: config.zoomOut,
      isDragging: false,
      activeId: null,
    }),
    [config],
  );

  useEffect(() => {
    if (!mounted) return;
    let id;
    const sync = () => {
      setCurrentZoom(rigState.zoom);
      setFocusedIndex(rigState.activeId);
      id = requestAnimationFrame(sync);
    };
    id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
  }, [mounted, rigState]);

  const collectionsData = useMemo(() => {
    if (collectionsProp) {
      return collectionsProp.map((c) => ({
        label: c.label,
        items: c.filterFn(items),
      }));
    }
    const brands = [...new Set(items.map((item) => item.brand).filter(Boolean))];
    if (brands.length === 0) return [{ label: allLabel, items }];
    return brands.map((brand) => ({
      label: brand,
      items: items.filter((item) => item.brand === brand),
    }));
  }, [items, collectionsProp, allLabel]);

  const [gridLayers, setGridLayers] = useState(() => [
    {
      id: "init",
      items: collectionsData[0]?.items ?? items,
      mode: "enter",
      startTime: 0,
    },
  ]);

  const handleCollectionSwitch = (index) => {
    if (index === currentCollection) return;
    const now = Date.now();
    setGridLayers((prev) => [
      ...prev.map((layer) =>
        layer.mode === "enter"
          ? { ...layer, mode: "exit", startTime: now }
          : layer,
      ),
      {
        id: `grid-${index}-${now}`,
        items: collectionsData[index].items,
        mode: "enter",
        startTime: now,
      },
    ]);
    setCurrentCollection(index);
    rigState.target.set(0, 2, 0);
    rigState.activeId = null;
    timersRef.current.push(
      setTimeout(
        () =>
          setGridLayers((prev) => prev.filter((layer) => layer.mode === "enter")),
        config.cleanupTimeout,
      ),
    );
  };

  const handleZoom = (target) => {
    if (target === "OUT") {
      rigState.zoom = config.zoomOut;
      setCurrentZoom(config.zoomOut);
      rigState.target.set(0, 2, 0);
    } else {
      rigState.zoom = config.zoomIn;
      setCurrentZoom(config.zoomIn);
    }
  };

  const activeLayer = gridLayers[gridLayers.length - 1];
  const itemCount = activeLayer.items.length;
  const activeDims = calcGridDims(itemCount, config);
  const isZoomedIn = currentZoom <= config.zoomIn + 0.5;

  const tabCollections = collectionsData.map((c) => ({
    label: c.label,
    count: c.items.length,
  }));

  const handleBuyNow = () => {
    if (onBuyNow) onBuyNow(activeLayer.items[rigState.activeId]);
  };

  const colorVars = {
    "--bg": bgColor,
    "--ink": inkColor,
    "--accent": accentColor,
    "--muted": mutedColor,
  };

  if (!mounted) {
    return <div className={`fixed inset-0 bg-[var(--bg)] ${className}`} style={colorVars} />;
  }

  return (
    <div
      className={`fixed inset-0 touch-none overflow-hidden bg-[var(--bg)] ${className}`}
      style={colorVars}
    >
      <LoadingScreen brandName={brandName} loadingLabel={loadingLabel} />
      <GridHeader
        brandName={brandName}
        brandTagline={brandTagline}
        activeLabel={collectionsData[currentCollection]?.label ?? ""}
        countLabel={countLabel}
        itemCount={itemCount}
      />

      <Canvas
        camera={{ position: [0, 0, config.zoomOut], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      >
        <Rig
          gridW={activeDims.width}
          gridH={activeDims.height}
          rigState={rigState}
          config={config}
        />
        <TopologyBackground
          isZoomedIn={isZoomedIn}
          color={bgColor}
          config={config}
        />
        <fog attach="fog" args={[bgColor, config.fogNear, config.fogFar]} />
        <Suspense fallback={null}>
          {gridLayers.map((layer) => (
            <GridCanvas
              key={layer.id}
              items={layer.items}
              gridVisible={layer.mode === "enter"}
              transitionStartTime={layer.startTime}
              interactive={layer.mode === "enter"}
              rigState={rigState}
              config={config}
              accentColor={accentColor}
              mutedColor={mutedColor}
              focusedIndex={focusedIndex}
            />
          ))}
        </Suspense>
      </Canvas>

      <ArchiveMap
        gridDims={activeDims}
        rigState={rigState}
        cols={config.gridCols}
        totalItems={itemCount}
        isZoomedIn={isZoomedIn}
        dotColor={bgColor}
        label={mapLabel}
      />

      <ControlIsland
        collections={tabCollections}
        currentCollection={currentCollection}
        onSwitch={handleCollectionSwitch}
        onZoom={handleZoom}
        isZoomedIn={isZoomedIn}
        hasActiveSelection={focusedIndex !== null}
        onBuyNow={handleBuyNow}
        buyLabel={buyLabel}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      />
    </div>
  );
}