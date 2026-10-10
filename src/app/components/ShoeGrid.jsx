"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Plane, useTexture, Text, useProgress } from "@react-three/drei";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import { motion, AnimatePresence } from "framer-motion";
import { useLayoutEffect } from "react";

// ─── ShoeGrid ────────────────────────────────────────────────────────────────
//
// A single-file, prop-driven 3D catalog wall. Drop in a `items` array (see
// shape below) and it renders a draggable/zoomable field of product tiles
// with a bottom "control island" for switching collections and filtering,
// plus a floating archive map in the corner.
//
// This file intentionally keeps all Three.js/R3F logic in plain JS (canvas
// materials, drag physics, shaders) since those values are computed at
// runtime and cannot be expressed in Tailwind. Every other surface — the
// header, the control island, the map frame, labels, spacing, color — is
// built with Tailwind utility classes so it can be restyled by editing
// className strings or the props below, with no SSR/hydration risk (the
// component renders a static placeholder on the server and mounts the
// Canvas only after hydration).
//
// ──────────────────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              array    []        Product records. Each item:
//                                        { title, price, image_url, product_url,
//                                          brand, primary_color, primary_color_hex }
// collections        array    see below Tabs shown in the control island. Each:
//                                        { label, filterFn(items) => item[] }
//                                        Defaults to "All / Under $150" using
//                                        the given items array.
// brandName          string   "ARCHIVE" Wordmark shown top-left.
// brandTagline       string   "Field Index" Small caption under the wordmark.
// bgColor            string   "#EDEAE2" Page/canvas background (paper tone).
// inkColor           string   "#17181B" Primary text / dark ink color.
// accentColor        string   "#C1422E" Signature accent (active states, CTA).
// mutedColor         string   "#8A8578" Secondary/quiet text color.
// lineColor          string   "#D8D3C7" Hairline divider color.
// gridCols           number   8         Columns in the 3D tile grid.
// itemSize           number   2.5       Tile size (world units).
// gap                number   0.4       Gap between tiles (world units).
// zoomOutLevel       number   31        Camera distance when zoomed out.
// zoomInLevel        number   12        Camera distance when zoomed in.
// onBuyNow           func     null      Called with the active item on "Buy Now".
// ──────────────────────────────────────────────────────────────────────────

// ─── Config / shared mutable state (kept outside React for 60fps drag) ─────

function makeConfig(overrides = {}) {
  return {
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
    rotationStrength: 0,
    fogNear: 19,
    fogFar: 100,
    enterStartOpacity: 0.0,
    enterStartZ: -50,
    exitEndZ: 20,
    transitionZDamp: 0.25,
    enterOpacityDamp: 0.85,
    exitOpacityDamp: 0.15,
    enterStaggerDelay: 400,
    exitStaggerDelay: 300,
    cleanupTimeout: 700,
    exitSpreadY: 0.5,
    enterSpreadY: 1,
    transitionYDamp: 0.08,
    filterOpacityDamp: 0.06,
    filterScaleTarget: 0.5,
    cullDistance: 14,
    bgColor: "#EDEAE2",
    bgOpacity: 0.4,
    bgSpeed: 0.05,
    bgScale: 3.0,
    bgLineThickness: 0.03,
    ...overrides,
  };
}

const EMPTY_COLORS = [];

function calcGridDims(count, CONFIG) {
  const rows = Math.ceil(count / CONFIG.gridCols) || 1;
  const spacing = CONFIG.itemSize + CONFIG.gap;
  return { width: CONFIG.gridCols * spacing, height: rows * spacing };
}

function matchesFilter(item, filter, colorFilter = EMPTY_COLORS) {
  let matchesType = true;
  if (filter !== "all") {
    const title = (item.title || "").toLowerCase();
    if (filter === "jordan") matchesType = title.includes("jordan");
    else if (filter === "dunk") matchesType = title.includes("dunk");
  }
  let matchesColor = true;
  if (colorFilter.length > 0) {
    const shoeColor = item.primary_color || "";
    matchesColor = colorFilter.some((c) =>
      c === "gray" ? shoeColor.includes("gray") : shoeColor === c,
    );
  }
  return matchesType && matchesColor;
}

// ─── Shaders (inlined so the whole thing is one file) ──────────────────────

const TOPOGRAPHY_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Lightweight value-noise replacement for glsl-noise so this file has no
// external shader-chunk dependency.
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

let materialsRegistered = false;
function registerMaterialsOnce() {
  if (materialsRegistered) return;
  materialsRegistered = true;

  const TopographyMaterial = shaderMaterial(
    {
      uTime: 0,
      uColor: new THREE.Color("#e0e0e0"),
      uResolution: new THREE.Vector2(1, 1),
      uOpacity: 1.0,
      uLineOpacity: 0.4,
      uScale: 3.0,
      uLineThickness: 0.03,
    },
    TOPOGRAPHY_VERT,
    TOPOGRAPHY_FRAG,
  );
  extend({ TopographyMaterial });

  const HoloCardMaterial = shaderMaterial(
    { uTime: 0, uTexture: new THREE.Texture(), uOpacity: 1, uActive: 0 },
    HOLO_VERT,
    HOLO_FRAG,
  );
  extend({ HoloCardMaterial });
}

// ─── Background plane ───────────────────────────────────────────────────────

function TopologyBackground({
  isZoomedIn,
  color,
  opacity,
  speed,
  scale,
  lineThickness,
}) {
  const materialRef = useRef();
  const planeWidth = 90;
  const planeHeight = 40;

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uTime += delta * (speed / 0.05);
    materialRef.current.uResolution.set(planeWidth, planeHeight);
    materialRef.current.uColor.set(color);
    materialRef.current.uLineOpacity = opacity;
    materialRef.current.uScale = scale;
    materialRef.current.uLineThickness = lineThickness;
    const targetOpacity = isZoomedIn ? 0.25 : 1.0;
    easing.damp(materialRef.current, "uOpacity", targetOpacity, 0.3, delta);
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

// ─── Camera rig (drag / zoom / tilt) ────────────────────────────────────────

function Rig({ gridW, gridH, rigState, CONFIG }) {
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
      const distance = Math.sqrt(dx * dx + dy * dy);
      maxDragDistance = Math.max(maxDragDistance, distance);
      const threshold = "ontouchstart" in window ? 15 : CONFIG.clickThreshold;
      if (maxDragDistance > threshold) {
        rigState.isDragging = true;
        rigState.activeId = null;
      }
      const { x: bx, y: by, visibleHeight } = getBounds();
      const sensitivity =
        (visibleHeight / window.innerHeight) * CONFIG.dragSpeed;
      let rawTargetX = initialRigX + dx * sensitivity;
      let rawTargetY = initialRigY - dy * sensitivity;
      if (rawTargetX > bx)
        rawTargetX = bx + (rawTargetX - bx) * CONFIG.dragResistance;
      if (rawTargetX < -bx)
        rawTargetX = -bx + (rawTargetX + bx) * CONFIG.dragResistance;
      if (rawTargetY > by)
        rawTargetY = by + (rawTargetY - by) * CONFIG.dragResistance;
      if (rawTargetY < -by)
        rawTargetY = -by + (rawTargetY + by) * CONFIG.dragResistance;
      const maxOvershoot = 3;
      rawTargetX = Math.max(
        -bx - maxOvershoot,
        Math.min(bx + maxOvershoot, rawTargetX),
      );
      rawTargetY = Math.max(
        -by - maxOvershoot,
        Math.min(by + maxOvershoot, rawTargetY),
      );
      rigState.target.set(rawTargetX, rawTargetY, 0);
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      rigState.isDragging = false;
      canvas.style.cursor = "grab";
      if (rigState.activeId !== null) return;
      const { x: bx, y: by } = getBounds();
      const isZoomedOut = camera.position.z > CONFIG.zoomIn + 2;
      const snapX = isZoomedOut
        ? 0
        : Math.max(-bx, Math.min(bx, rigState.target.x));
      const snapY = isZoomedOut
        ? 2
        : Math.max(-by, Math.min(by, rigState.target.y));
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
  }, [gl, camera, gridW, gridH, getBounds, rigState, CONFIG]);

  useFrame((state, delta) => {
    easing.damp3(rigState.current, rigState.target, CONFIG.dampFactor, delta);
    easing.damp(camera.position, "z", rigState.zoom, CONFIG.zoomDamp, delta);
    rigState.velocity.copy(rigState.current).sub(prevPos.current);
    prevPos.current.copy(rigState.current);
    const zoomFactor = Math.min(1, CONFIG.zoomIn / rigState.zoom);
    const tiltX = rigState.velocity.y * CONFIG.tiltFactor * zoomFactor;
    const tiltY = -rigState.velocity.x * CONFIG.tiltFactor * zoomFactor;
    easing.damp(camera.rotation, "x", tiltX, 0.2, delta);
    easing.damp(camera.rotation, "y", tiltY, 0.2, delta);
  });

  return null;
}

// ─── Close ("×") button shown on the active tile ───────────────────────────

function CloseButton({ isActive, position, onClose, accentColor }) {
  const { gl } = useThree();
  const [shouldShow, setShouldShow] = useState(false);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    canvasRef.current = gl.domElement;
  }, [gl]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isActive) {
      timerRef.current = setTimeout(() => setShouldShow(false), 0);
      return () => timerRef.current && clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setShouldShow(true), 250);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [isActive]);

  if (!isActive) return null;
  const [x, y, z] = position;

  return (
    <Html
      position={[x, y, z]}
      center
      style={{ pointerEvents: "auto", transform: "translate(-50%, -150%)" }}
      occlude
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onMouseEnter={() =>
          canvasRef.current && (canvasRef.current.style.cursor = "pointer")
        }
        onMouseLeave={() =>
          canvasRef.current && (canvasRef.current.style.cursor = "grab")
        }
        className={`flex h-8 w-8 items-center justify-center border p-0 transition-opacity duration-200 ${
          shouldShow ? "opacity-70 hover:opacity-100" : "scale-90 opacity-0"
        }`}
        style={{ borderColor: accentColor, background: "transparent" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accentColor}
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

// ─── A single tile in the grid ──────────────────────────────────────────────
// Direct port of the original ShoeTile.js: parallax curvature toward the
// cursor/center when zoomed out, per-tile stagger on enter/exit, dynamic
// distance culling, and the click → pan-and-zoom-to-focus → name/price
// label behavior.

function ShoeTile({
  data,
  index,
  basePos,
  gridVisible,
  transitionStartTime,
  interactive,
  matchesFilter = true,
  gridHeight,
  rigState,
  CONFIG,
  accentColor,
  focusedIndex,
}) {
  const ref = useRef();
  const imageRef = useRef();
  const titleRef = useRef();
  const priceRef = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(data.image_url);

  const focusZ = useRef(0);
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const curveZ = useRef(0);
  const transitionZ = useRef(0);
  const transitionY = useRef(0);
  const breathScale = useRef(1);
  const animatedPos = useRef({ x: basePos.x, y: basePos.y });
  const filterOpacity = useRef(1);
  const filterScale = useRef(1);
  const isSleep = useRef(false);
  const wasDimmedByFocus = useRef(false);

  useLayoutEffect(() => {
    const normalizedY = gridHeight > 0 ? basePos.y / (gridHeight / 2) : 0;
    if (gridVisible) {
      transitionZ.current = CONFIG.enterStartZ;
      transitionY.current = normalizedY * CONFIG.enterSpreadY;
      if (imageRef.current)
        imageRef.current.material.uOpacity = CONFIG.enterStartOpacity;
      isSleep.current = false;
    } else {
      transitionZ.current = 0;
      transitionY.current = 0;
      if (imageRef.current) imageRef.current.material.uOpacity = 1;
    }
  }, []);

  const imageDims = useMemo(() => {
    const maxSize = CONFIG.itemSize * 0.9;
    if (!texture.image) return { width: maxSize, height: maxSize };
    const imgAspect = texture.image.width / texture.image.height;
    return imgAspect > 1
      ? { width: maxSize, height: maxSize / imgAspect }
      : { width: maxSize * imgAspect, height: maxSize };
  }, [texture, CONFIG.itemSize]);

  useFrame((state, delta) => {
    if (!ref.current || isSleep.current) return;

    easing.damp(animatedPos.current, "x", basePos.x, 0.2, delta);
    easing.damp(animatedPos.current, "y", basePos.y, 0.2, delta);
    const targetFilterOpacity = matchesFilter ? 1 : 0;
    const targetFilterScale = matchesFilter ? 1 : CONFIG.filterScaleTarget;
    easing.damp(
      filterOpacity,
      "current",
      targetFilterOpacity,
      CONFIG.filterOpacityDamp,
      delta,
    );
    easing.damp(
      filterScale,
      "current",
      targetFilterScale,
      CONFIG.filterOpacityDamp,
      delta,
    );

    const actualOpacity = imageRef.current?.material?.uOpacity ?? 1;
    if (actualOpacity < 0.01 && !matchesFilter) {
      ref.current.visible = false;
      return;
    }

    const now = Date.now();
    const timeSinceTrigger = now - transitionStartTime;
    const staggerDelay = data.randomDelay || 0;
    const canTransition = timeSinceTrigger > staggerDelay;

    let targetTransitionOpacity = 1.0;
    let targetTransitionZ = 0;
    const normalizedY = gridHeight > 0 ? basePos.y / (gridHeight / 2) : 0;
    let targetTransitionY = 0;

    if (gridVisible) {
      if (canTransition) {
        targetTransitionOpacity = 1.0;
        targetTransitionZ = 0;
        targetTransitionY = 0;
      } else {
        targetTransitionOpacity = CONFIG.enterStartOpacity;
        targetTransitionZ = CONFIG.enterStartZ;
        targetTransitionY = normalizedY * CONFIG.enterSpreadY;
      }
    } else {
      if (canTransition) {
        targetTransitionOpacity = 0.0;
        targetTransitionZ = CONFIG.exitEndZ;
        targetTransitionY = normalizedY * CONFIG.exitSpreadY;
      } else {
        targetTransitionOpacity = 1.0;
        targetTransitionZ = 0;
        targetTransitionY = 0;
      }
    }

    const x = animatedPos.current.x + rigState.current.x;
    const y = animatedPos.current.y + rigState.current.y;

    const currentCull = CONFIG.cullDistance * (rigState.zoom / 8);
    const isPositionVisible =
      Math.abs(x) < currentCull && Math.abs(y) < currentCull;

    if (
      !gridVisible &&
      targetTransitionOpacity < 0.01 &&
      filterOpacity.current < 0.01
    ) {
      ref.current.visible = false;
      isSleep.current = true;
      return;
    }
    if (!isPositionVisible && !(!gridVisible && canTransition)) {
      ref.current.visible = false;
      return;
    }
    if (
      imageRef.current?.material.uOpacity < 0.01 &&
      targetTransitionOpacity < 0.01
    ) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;

    const isZoomedIn = rigState.zoom <= CONFIG.zoomIn + 0.5;
    const maxZoom = CONFIG.zoomOut || 50;
    const zoomRatio = isZoomedIn
      ? 0
      : THREE.MathUtils.clamp(
          (rigState.zoom - CONFIG.zoomIn) / (maxZoom - CONFIG.zoomIn),
          0,
          1,
        );
    const smoothRatio = easing.cubic.inOut(zoomRatio);
    const distSq = x * x + y * y;
    const dist = Math.sqrt(distSq);
    const targetCurveZ = -distSq * CONFIG.curvatureStrength * smoothRatio;

    let rotX = 0,
      rotY = 0;
    if (targetTransitionOpacity > 0.1) {
      const rotationIntensity = Math.min(dist * 0.4, 2.0) * smoothRatio;
      rotX =
        y *
        CONFIG.curvatureStrength *
        CONFIG.rotationStrength *
        rotationIntensity;
      rotY =
        -x *
        CONFIG.curvatureStrength *
        CONFIG.rotationStrength *
        rotationIntensity;
    }

    const isFocusMode = rigState.activeId !== null;
    const isActive = rigState.activeId === index;
    const isHovered = hovered && interactive;
    let interactionScale = 1.0;
    let interactionOpacity = 1.0;
    let targetTextOpacity = 0;
    let targetFocusZ = 0;

    if (isFocusMode) {
      if (isActive) {
        interactionScale = CONFIG.focusScale;
        interactionOpacity = 1.0;
        targetTextOpacity = 1.0;
        targetFocusZ = 2;
      } else {
        interactionScale = CONFIG.dimScale;
        interactionOpacity = CONFIG.dimOpacity;
        targetTextOpacity = 0;
        targetFocusZ = -0.5;
        wasDimmedByFocus.current = true;
      }
    } else {
      interactionScale = isHovered && !rigState.isDragging ? 1.05 : 1.0;
      targetFocusZ = isHovered && !rigState.isDragging ? 0.5 : 0;
    }

    const finalOpacity =
      interactionOpacity * targetTransitionOpacity * filterOpacity.current;
    const combinedScale = interactionScale * filterScale.current;

    easing.damp(ref.current.scale, "x", combinedScale, 0.15, delta);
    easing.damp(ref.current.scale, "y", combinedScale, 0.15, delta);
    easing.damp(focusZ, "current", targetFocusZ, 0.2, delta);
    easing.damp(curveZ, "current", targetCurveZ, 0.2, delta);
    easing.damp(
      transitionZ,
      "current",
      targetTransitionZ,
      CONFIG.transitionZDamp,
      delta,
    );
    easing.damp(
      transitionY,
      "current",
      targetTransitionY,
      CONFIG.transitionYDamp,
      delta,
    );
    ref.current.position.set(
      x,
      y + transitionY.current,
      curveZ.current + focusZ.current + transitionZ.current,
    );
    easing.damp(rotationX, "current", rotX, 0.2, delta);
    easing.damp(rotationY, "current", rotY, 0.2, delta);
    ref.current.rotation.set(rotationX.current, rotationY.current, 0);

    if (imageRef.current) {
      imageRef.current.material.uTime = state.clock.elapsedTime;
      const activeDamp = isActive ? 0.6 : 0.15;
      easing.damp(
        imageRef.current.material,
        "uActive",
        isActive ? 1 : 0,
        activeDamp,
        delta,
      );

      let opacityDamp;
      const isFilterTransition = !matchesFilter || filterOpacity.current < 0.99;
      const isFocusRecovery = !isFocusMode && wasDimmedByFocus.current;
      if (isFilterTransition && gridVisible) {
        opacityDamp = CONFIG.filterOpacityDamp;
      } else if (isFocusRecovery && gridVisible) {
        opacityDamp = CONFIG.filterOpacityDamp;
        if (imageRef.current.material.uOpacity > 0.95)
          wasDimmedByFocus.current = false;
      } else if (gridVisible) {
        opacityDamp = CONFIG.enterOpacityDamp;
      } else {
        opacityDamp = CONFIG.exitOpacityDamp;
      }
      easing.damp(
        imageRef.current.material,
        "uOpacity",
        finalOpacity,
        opacityDamp,
        delta,
      );
    }

    if (gridVisible) {
      const textTarget = targetTransitionOpacity < 0.8 ? 0 : targetTextOpacity;
      if (titleRef.current)
        easing.damp(titleRef.current, "fillOpacity", textTarget, 0.1, delta);
      if (priceRef.current)
        easing.damp(priceRef.current, "fillOpacity", textTarget, 0.1, delta);

      const isActiveItem = rigState.activeId === index;
      const targetBreath = isActiveItem
        ? 1 + Math.sin(state.clock.elapsedTime * 2.0) * 0.035
        : 1;
      easing.damp(breathScale, "current", targetBreath, 0.1, delta);
      if (titleRef.current)
        titleRef.current.scale.setScalar(breathScale.current);
      if (priceRef.current)
        priceRef.current.scale.setScalar(breathScale.current);
    }
  });

  const handleClick = (e) => {
    if (!interactive) return;
    if (rigState.isDragging) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    if (rigState.activeId === index) {
      rigState.activeId = null;
    } else {
      const isZoomedOut = rigState.zoom > CONFIG.zoomIn + 2;
      rigState.target.set(-basePos.x, -basePos.y, 0);
      rigState.activeId = index;
      if (isZoomedOut) rigState.zoom = CONFIG.zoomIn;
    }
  };

  const textY = -(imageDims.height / 2) - 0.25;
  const isActive = focusedIndex === index;

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
              color="#555"
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
        isActive={isActive}
        position={[
          imageDims.width / 2 - 0.15,
          imageDims.height / 2 - 0.15,
          0.02,
        ]}
        onClose={() => (rigState.activeId = null)}
        accentColor={accentColor}
      />
    </group>
  );
}

// ─── One "layer" of tiles (a whole collection entering or exiting) ─────────

function GridCanvas({
  items,
  gridVisible,
  transitionStartTime,
  interactive,
  filter,
  colorFilter,
  rigState,
  CONFIG,
  accentColor,
  onBuyNow,
  focusedIndex,
}) {
  const { mappedItems, filteredGridDims } = useMemo(() => {
    const spacing = CONFIG.itemSize + CONFIG.gap;
    const filteredItems = items.filter((item) =>
      matchesFilter(item, filter, colorFilter),
    );
    const filteredCount = filteredItems.length;
    const filteredDims = calcGridDims(filteredCount, CONFIG);
    const maxDelay = gridVisible
      ? CONFIG.enterStaggerDelay
      : CONFIG.exitStaggerDelay;
    let filteredIdx = 0;

    const mapped = items.map((shoe, i) => {
      const matches = matchesFilter(shoe, filter, colorFilter);
      let targetPos;
      if (matches) {
        const col = filteredIdx % CONFIG.gridCols;
        const row = Math.floor(filteredIdx / CONFIG.gridCols);
        targetPos = {
          x: col * spacing - filteredDims.width / 2 + spacing / 2,
          y: -(row * spacing) + filteredDims.height / 2 - spacing / 2,
        };
        filteredIdx++;
      } else {
        const col = i % CONFIG.gridCols;
        const row = Math.floor(i / CONFIG.gridCols);
        const originalDims = calcGridDims(items.length, CONFIG);
        targetPos = {
          x: col * spacing - originalDims.width / 2 + spacing / 2,
          y: -(row * spacing) + originalDims.height / 2 - spacing / 2,
        };
      }
      return {
        ...shoe,
        index: i,
        randomDelay: Math.random() * maxDelay,
        basePos: targetPos,
        matchesFilter: matches,
      };
    });

    return { mappedItems: mapped, filteredGridDims: filteredDims };
  }, [items, filter, colorFilter, gridVisible, CONFIG]);

  return (
    <>
      {mappedItems.map((item) => {
        return (
          <ShoeTile
            key={item.product_url || item.index}
            data={item}
            index={item.index}
            basePos={item.basePos}
            gridVisible={gridVisible}
            transitionStartTime={transitionStartTime}
            interactive={interactive && item.matchesFilter}
            matchesFilter={item.matchesFilter}
            gridHeight={filteredGridDims.height}
            rigState={rigState}
            CONFIG={CONFIG}
            accentColor={accentColor}
            onBuyNow={onBuyNow}
            focusedIndex={focusedIndex}
          />
        );
      })}
    </>
  );
}

// ─── Header (Tailwind) ──────────────────────────────────────────────────────

function GridHeader({
  brandName,
  brandTagline,
  inkColor,
  mutedColor,
  activeLabel,
  itemCount,
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 py-5 sm:px-8 sm:py-6">
      <div className="pointer-events-auto flex flex-col">
        <span
          className="font-serif text-lg font-semibold uppercase tracking-[0.14em] sm:text-xl"
          style={{ color: inkColor }}
        >
          {brandName}
        </span>
        <span
          className="mt-0.5 text-[10px] uppercase tracking-[0.28em]"
          style={{ color: mutedColor }}
        >
          {brandTagline}
        </span>
      </div>

      <div
        className="pointer-events-auto hidden items-baseline gap-2 border-b pb-0.5 text-right sm:flex"
        style={{ borderColor: mutedColor + "40" }}
      >
        <span
          className="font-serif text-2xl leading-none"
          style={{ color: inkColor }}
        >
          {String(itemCount).padStart(2, "0")}
        </span>
        <span
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: mutedColor }}
        >
          in view — {activeLabel}
        </span>
      </div>
    </header>
  );
}

// ─── Control island (Tailwind + framer-motion) ─────────────────────────────

const islandTransition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 1,
};

function ControlIsland({
  collections,
  currentCollection,
  onSwitch,
  setZoomTrigger,
  isZoomedIn,
  hasActiveSelection,
  nikeFilter,
  onFilterChange,
  showNikeFilters,
  inkColor,
  accentColor,
  mutedColor,
  bgPaper,
  onBuyNow,
}) {
  const nikeFilters = [
    { id: "all", label: "All" },
    { id: "jordan", label: "Jordan" },
    { id: "dunk", label: "Dunk" },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 sm:bottom-9">
      {/* Mobile filter row, sits above the island */}
      <AnimatePresence>
        {showNikeFilters && !isZoomedIn && !hasActiveSelection && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={islandTransition}
            className="pointer-events-auto flex gap-1 rounded-2xl border px-2 py-1.5 backdrop-blur-2xl sm:hidden"
            style={{
              background: bgPaper + "D9",
              borderColor: mutedColor + "33",
            }}
          >
            {nikeFilters.map((f) => (
              <FilterChip
                key={`m-${f.id}`}
                isActive={nikeFilter === f.id}
                onClick={() => onFilterChange(f.id)}
                accentColor={accentColor}
                inkColor={inkColor}
                layoutGroup="mobile"
              >
                {f.label}
              </FilterChip>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={islandTransition}
        className="pointer-events-auto flex h-12 items-center overflow-hidden rounded-[28px] border p-1.5 shadow-lg backdrop-blur-2xl sm:h-14 sm:rounded-[32px] sm:p-1.5"
        style={{
          background: bgPaper + "CC",
          borderColor: mutedColor + "33",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {hasActiveSelection ? (
            <motion.button
              key="buy-now"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              transition={{ ...islandTransition, opacity: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
              onClick={onBuyNow}
              className="flex h-9 items-center whitespace-nowrap rounded-full px-6 text-sm font-semibold sm:h-11"
              style={{ background: inkColor, color: bgPaper }}
            >
              Buy now
            </motion.button>
          ) : isZoomedIn ? (
            <motion.div
              key="compact"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={{ ...islandTransition, opacity: { duration: 0.2 } }}
            >
              <IconButton
                icon="minus"
                onClick={() => setZoomTrigger("OUT")}
                label="Zoom out"
                inkColor={inkColor}
              />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              transition={{ ...islandTransition, opacity: { duration: 0.2 } }}
              className="flex items-center gap-1.5 px-0.5"
            >
              <IconButton
                icon="plus"
                onClick={() => setZoomTrigger("IN")}
                label="Zoom in"
                inkColor={inkColor}
              />
              <div
                className="mx-1 h-6 w-px"
                style={{ background: mutedColor + "40" }}
              />

              <div className="flex items-baseline gap-1">
                {collections.map((col, index) => (
                  <TabButton
                    key={col.label}
                    isActive={currentCollection === index}
                    onClick={() => onSwitch(index)}
                    inkColor={inkColor}
                    mutedColor={mutedColor}
                    accentColor={accentColor}
                    count={col.count}
                  >
                    {col.label}
                  </TabButton>
                ))}
              </div>

              {showNikeFilters && (
                <div className="hidden items-center sm:flex">
                  <div
                    className="mx-1.5 h-6 w-px"
                    style={{ background: mutedColor + "40" }}
                  />
                  <div className="flex gap-1">
                    {nikeFilters.map((f) => (
                      <FilterChip
                        key={f.id}
                        isActive={nikeFilter === f.id}
                        onClick={() => onFilterChange(f.id)}
                        accentColor={accentColor}
                        inkColor={inkColor}
                        layoutGroup="desktop"
                      >
                        {f.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function IconButton({ onClick, icon, label, inkColor }) {
  return (
    <motion.button
      layout="position"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 sm:h-11 sm:w-11"
      style={{ color: inkColor }}
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

function TabButton({
  children,
  isActive,
  onClick,
  inkColor,
  mutedColor,
  accentColor,
  count,
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className="relative whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-wide sm:text-sm"
      style={{ color: isActive ? inkColor : mutedColor, zIndex: 1 }}
    >
      <span className="flex items-baseline gap-1.5">
        {children}
        {typeof count === "number" && (
          <span className="font-serif text-[11px] normal-case tracking-normal opacity-70">
            {count}
          </span>
        )}
      </span>
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          transition={islandTransition}
          className="absolute inset-0 -z-10 rounded-full border"
          style={{ background: "#FFFFFF99", borderColor: accentColor + "55" }}
        />
      )}
    </motion.button>
  );
}

function FilterChip({
  children,
  isActive,
  onClick,
  accentColor,
  inkColor,
  layoutGroup,
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={islandTransition}
      className="relative whitespace-nowrap rounded-2xl px-3 py-1.5 text-[11px] font-medium"
      style={{ color: isActive ? "#fff" : inkColor, zIndex: 1 }}
    >
      {isActive ? (
        <motion.div
          layoutId={`activeFilter-${layoutGroup}`}
          transition={islandTransition}
          className="absolute inset-0 -z-10 rounded-2xl"
          style={{ background: accentColor }}
        />
      ) : (
        <div className="absolute inset-0 -z-10 rounded-2xl bg-black/5" />
      )}
      {children}
    </motion.button>
  );
}

// ─── Archive map (bottom-right minimap, canvas 2D) ─────────────────────────

function ArchiveMap({
  gridDims,
  rigState,
  config,
  totalItems,
  isZoomedIn,
  inkColor,
  accentColor,
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

  useEffect(() => {
    const update = () => {
      let wp = 8;
      if (window.innerWidth < 480) wp = 20;
      else if (window.innerWidth < 768) wp = 15;
      setWidthPercent(wp);
      const width = (window.innerWidth * wp) / 100;
      setDims({ width, height: width / aspectRatio });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [aspectRatio]);

  const cols = config.gridCols;
  const rows = Math.ceil(totalItems / cols) || 1;

  useEffect(() => {
    let rafId;
    const draw = () => {
      if (!containerRef.current || !canvasRef.current) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      const isMobile = window.innerWidth < 768;
      const isActive = rigState.isDragging || rigState.activeId !== null;
      const shouldShow = isMobile ? isActive && isZoomedIn : isActive;
      opacityRef.current += ((shouldShow ? 1 : 0) - opacityRef.current) * 0.1;
      containerRef.current.style.opacity = opacityRef.current;

      if (opacityRef.current < 0.02) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const isFocused = rigState.activeId !== null;
      const targetZoom = isFocused ? 2.5 : 1;
      let targetCenterX = 0.5;
      let targetCenterY = 0.5;
      if (isFocused) {
        const col = rigState.activeId % cols;
        const row = Math.floor(rigState.activeId / cols);
        targetCenterX = (col + 0.5) / cols;
        targetCenterY = (row + 0.5) / rows;
      }
      zoomRef.current += (targetZoom - zoomRef.current) * 0.08;
      centerRef.current.x += (targetCenterX - centerRef.current.x) * 0.08;
      centerRef.current.y += (targetCenterY - centerRef.current.y) * 0.08;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      const zoom = zoomRef.current;
      const cx = centerRef.current.x * w;
      const cy = centerRef.current.y * h;
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);

      const baseDotSize = Math.max(w, h) * 0.015;
      for (let i = 0; i < totalItems; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const nX = (c + 0.5) / cols;
        const nY = (r + 0.5) / rows;
        const isSelected = rigState.activeId === i;
        const dotSize = isSelected ? baseDotSize * 2 : baseDotSize;
        ctx.beginPath();
        ctx.arc(nX * w, nY * h, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? accentColor : "rgba(255,255,255,0.45)";
        ctx.fill();
      }

      if (!isFocused) {
        const offPctX = -rigState.current.x / gridDims.width;
        const offPctY = rigState.current.y / gridDims.height;
        const vFov = (45 * Math.PI) / 180;
        const viewHeight = 2 * Math.tan(vFov / 2) * 10;
        const viewWidth = viewHeight * (window.innerWidth / window.innerHeight);
        const rectW = Math.min(viewWidth / gridDims.width, 1) * w;
        const rectH = Math.min(viewHeight / gridDims.height, 1) * h;
        const rectX = (0.5 + offPctX) * w - rectW / 2;
        const rectY = (0.5 + offPctY) * h - rectH / 2;
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 1.5 / zoom;
        ctx.strokeRect(rectX, rectY, rectW, rectH);
      }
      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [
    gridDims,
    cols,
    rows,
    rigState,
    config,
    totalItems,
    isZoomedIn,
    accentColor,
  ]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed z-[100] overflow-hidden border opacity-0"
      style={{
        bottom: "2vh",
        right: "2vw",
        width: `${widthPercent}vw`,
        aspectRatio,
        background: `${inkColor}CC`,
        borderColor: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <span className="absolute left-1.5 top-1 text-[8px] uppercase tracking-[0.2em] text-white/50">
        Map
      </span>
      <canvas
        ref={canvasRef}
        width={dims.width * dpr}
        height={dims.height * dpr}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

function LoadingScreen({ bgColor, inkColor, mutedColor, brandName }) {
  const { progress, active } = useProgress();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setDismissed(true), 350);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-300"
      style={{ backgroundColor: bgColor, opacity: active ? 1 : 0 }}
    >
      <span
        className="font-serif text-sm uppercase tracking-[0.3em]"
        style={{ color: inkColor }}
      >
        {brandName}
      </span>
      <div
        className="mt-5 h-px w-40 overflow-hidden"
        style={{ backgroundColor: mutedColor + "33" }}
      >
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: inkColor,
          }}
        />
      </div>
      <span
        className="mt-3 text-[10px] uppercase tracking-[0.2em]"
        style={{ color: mutedColor }}
      >
        Loading {Math.round(progress)}%
      </span>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    title: "Nike Dunk Low 'Athletic Department - Deep Jungle'",
    price: "$66",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-016.png",
    product_url:
      "https://www.goat.com/sneakers/dunk-low-athletic-department-deep-jungle-fq8080-133",
    brand: "Nike",
    primary_color: "dark_gray",
    primary_color_hex: "#384243",
  },
  {
    title: "Nike Dunk Low 'Midnight Navy Smoke Grey'",
    price: "$103",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-017.png",
    product_url:
      "https://www.goat.com/sneakers/dunk-low-midnight-navy-smoke-grey-fd9749-400",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#31405e",
  },
  {
    title: "Nike Dunk Low GS 'Year of the Dragon'",
    price: "$99",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-018.png",
    product_url:
      "https://www.goat.com/sneakers/dunk-low-gs-year-of-the-dragon-fz5528-101",
    brand: "Nike",
    primary_color: "red",
    primary_color_hex: "#c93d3b",
  },
  {
    title: "Nike Dunk Low 'Silver Surfer' 2024",
    price: "$39",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-019.png",
    product_url:
      "https://www.goat.com/sneakers/dunk-low-silver-surfer-2024-hf0391-001",
    brand: "Nike",
    primary_color: "gray",
    primary_color_hex: "#808388",
  },
  {
    title: "The Powerpuff Girls x Nike Dunk Low Pro SB QS 'Buttercup'",
    price: "$274",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-024.png",
    product_url:
      "https://www.goat.com/sneakers/the-powerpuff-girls-x-dunk-low-pro-sb-qs-buttercup-fz8319-300",
    brand: "Nike",
    primary_color: "green",
    primary_color_hex: "#6fa94b",
  },
  {
    title: "Nike Dunk Low ‘What the Duck - University of Oregon Alternate’ PE",
    price: "$300",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-025.png",
    product_url:
      "https://www.goat.com/sneakers/dunk-low-what-the-phk-university-of-oregon-pe-hv1470-001",
    brand: "Nike",
    primary_color: "dark_gray",
    primary_color_hex: "#3a3c42",
  },
  {
    title:
      "Cactus Plant Flea Market x Nike Dunk Low 'Swamp Sponge Pack - Photo Blue'",
    price: "$249",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-026.png",
    product_url:
      "https://www.goat.com/sneakers/cactus-plant-flea-market-x-dunk-low-swamp-sponge-pack-photo-blue-ih5094-400",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#0472be",
  },
  {
    title: "Verdy x Nike Dunk Low SB 'Visty'",
    price: "$239",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-027.png",
    product_url:
      "https://www.goat.com/sneakers/verdy-x-dunk-low-sb-visty-fn6040-400",
    brand: "Nike",
    primary_color: "green",
    primary_color_hex: "#bad1c5",
  },
  {
    title: "Nike Dunk Low 'Kentucky' 2025",
    price: "$105",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-028.png",
    product_url:
      "https://www.goat.com/sneakers/dunk-low-kentucky-2025-hf5441-112",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#043182",
  },
  {
    title: "Union LA x Nike Dunk Low 'Passport Pack - Argon'",
    price: "$165",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-029.png",
    product_url: "https://www.goat.com/sneakers/union-la-x-dunk-low-dj9649-400",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#6e829a",
  },
  {
    title: "Nike Dunk Low 'Valerian Blue'",
    price: "$79",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-030.png",
    product_url: "https://www.goat.com/sneakers/dunk-low-usa-dd1391-400",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#2c3d4c",
  },
  {
    title: "Nike Wmns Dunk Low 'Cacao Wow'",
    price: "$86",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-031.png",
    product_url:
      "https://www.goat.com/sneakers/wmns-dunk-low-cacao-wow-dd1503-124",
    brand: "Nike",
    primary_color: "yellow",
    primary_color_hex: "#d4d4bc",
  },
  {
    title: "Limosine Skateboards x Nike Dunk Low SB 'Football'",
    price: "$87",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-032.png",
    product_url:
      "https://www.goat.com/sneakers/limosine-skateboards-x-dunk-low-sb-basketball-leather-hj4131-200",
    brand: "Nike",
    primary_color: "red",
    primary_color_hex: "#371718",
  },
  {
    title: "Supreme x Nike Dunk Low SB 'Ocean Fog'",
    price: "$316",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-033.png",
    product_url:
      "https://www.goat.com/sneakers/supreme-x-dunk-low-sb-ocean-fog-hq8487-400",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#3c4c58",
  },
  {
    title: "Nike Dunk Low SB 'Sandy Bodecker'",
    price: "$142",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-034.png",
    product_url:
      "https://www.goat.com/sneakers/ebay-x-dunk-low-sb-sandy-bodecker-fd8777-100",
    brand: "Nike",
    primary_color: "yellow",
    primary_color_hex: "#e6b211",
  },
  {
    title: "Jarritos x Nike Dunk Low SB",
    price: "$404",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-035.png",
    product_url:
      "https://www.goat.com/sneakers/jarritos-x-dunk-low-sb-fd0860-001",
    brand: "Nike",
    primary_color: "teal",
    primary_color_hex: "#1f735d",
  },
  {
    title: "Nike SB x Air Jordan 4 Retro SP 'Navy'",
    price: "$166",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-041.png",
    product_url:
      "https://www.goat.com/sneakers/nike-sb-x-air-jordan-4-retro-sp-navy-dr5415-100",
    brand: "Nike",
    primary_color: "orange",
    primary_color_hex: "#e3a97b",
  },
  {
    title: "Air Jordan 4 Retro OG 'Bred' 2019",
    price: "$389",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-053.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-bred-2019-308497-060",
    brand: "Nike",
    primary_color: "red",
    primary_color_hex: "#a95c60",
  },
  {
    title: "A Ma Maniére x Wmns Air Jordan 4 Retro 'While You Were Sleeping'",
    price: "$155",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-054.png",
    product_url:
      "https://www.goat.com/sneakers/a-ma-maniere-x-wmns-air-jordan-4-retro-fossil-stone-fz4810-200",
    brand: "Nike",
    primary_color: "orange",
    primary_color_hex: "#cdb9ac",
  },
  {
    title: "Air Jordan 4 Retro 'Black Cat' 2025",
    price: "$277",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-039.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-black-cat-2025-fv5029-010",
    brand: "Nike",
    primary_color: "black",
    primary_color_hex: "#0c040b",
  },
  {
    title: "Air Jordan 4 Retro 'Fear' 2024",
    price: "$226",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-055.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-fear-2024-fq8138-002",
    brand: "Nike",
    primary_color: "gray",
    primary_color_hex: "#7b7a7a",
  },
  {
    title: "Air Jordan 4 Retro OG 'Fire Red' 2020",
    price: "$311",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-056.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-og-fire-red-2020-dc7770-160",
    brand: "Nike",
    primary_color: "red",
    primary_color_hex: "#b91817",
  },
  {
    title: "Wmns Air Jordan 4 Retro 'Orchid'",
    price: "$307",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-057.png",
    product_url:
      "https://www.goat.com/sneakers/wmns-air-jordan-4-retro-orchid-aq9129-501",
    brand: "Nike",
    primary_color: "pink",
    primary_color_hex: "#cca5bc",
  },
  {
    title: "Air Jordan 4 Retro 'Thunder' 2023",
    price: "$291",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-058.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-thunder-2023-dh6927-017",
    brand: "Nike",
    primary_color: "orange",
    primary_color_hex: "#494233",
  },
  {
    title: "Air Jordan 4 Retro SE 'Black Canvas'",
    price: "$333",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-059.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-black-canvas-dh7138-006",
    brand: "Nike",
    primary_color: "light_gray",
    primary_color_hex: "#bdc1c4",
  },
  {
    title: "Off-White x Wmns Air Jordan 4 Retro SP 'Sail'",
    price: "$743",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-060.png",
    product_url:
      "https://www.goat.com/sneakers/off-white-x-wmns-air-jordan-4-sp-sail-cv9388-100",
    brand: "Nike",
    primary_color: "orange",
    primary_color_hex: "#ccc4b4",
  },
  {
    title: "Air Jordan 4 Retro 'University Blue'",
    price: "$390",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-062.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-university-blue-ct8527-400",
    brand: "Nike",
    primary_color: "blue",
    primary_color_hex: "#557fa9",
  },
  {
    title: "Air Jordan 4 Retro '25th Silver Anniversary'",
    price: "$135",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-067.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-silver-anniversary-408202-101",
    brand: "Nike",
    primary_color: "light_gray",
    primary_color_hex: "#c5c2ca",
  },
  {
    title: "A Ma Maniére x Air Jordan 4 Retro 'Violet Ore'",
    price: "$198",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-068.png",
    product_url:
      "https://www.goat.com/sneakers/a-ma-maniere-x-air-jordan-4-retro-violet-ore-dv6773-220",
    brand: "Nike",
    primary_color: "yellow",
    primary_color_hex: "#dbd1b3",
  },
  {
    title: "Air Jordan 4 Retro 'White Oreo'",
    price: "$382",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-069.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-oreo-ct8527-100",
    brand: "Nike",
    primary_color: "dark_gray",
    primary_color_hex: "#494948",
  },
  {
    title: "Air Jordan 4 Retro 'Taupe Haze'",
    price: "$352",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-070.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-taupe-haze-db0732-200",
    brand: "Nike",
    primary_color: "gray",
    primary_color_hex: "#83776e",
  },
  {
    title: "Air Jordan 4 Retro OG GS 'White Cement' 2025",
    price: "$149",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-071.png",
    product_url:
      "https://www.goat.com/sneakers/air-jordan-4-retro-og-gs-white-cement-2025-ib4171-100",
    brand: "Nike",
    primary_color: "light_gray",
    primary_color_hex: "#c8cccc",
  },
  {
    title: "Action Bronson x New Balance 990v6 Made in USA 'Lapis Lazuli'",
    price: "$173",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-115.png",
    product_url:
      "https://www.goat.com/sneakers/action-bronson-x-990v6-made-in-usa-lapis-lazuli-m990ac6",
    brand: "New Balance",
    primary_color: "blue",
    primary_color_hex: "#687eb2",
  },
  {
    title: "New Balance 990v4 Made In USA 'Red Label - Grey'",
    price: "$268",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-116.png",
    product_url:
      "https://www.goat.com/sneakers/990v4-made-in-usa-red-label-grey-m990vs4",
    brand: "New Balance",
    primary_color: "light_gray",
    primary_color_hex: "#b6b8bc",
  },
  {
    title: "New Balance 990v4 Made in USA 'Black Silver' 2023",
    price: "$154",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-117.png",
    product_url:
      "https://www.goat.com/sneakers/990v4-made-in-usa-black-silver-2023-u990bl4",
    brand: "New Balance",
    primary_color: "dark_gray",
    primary_color_hex: "#474646",
  },
  {
    title: "Action Bronson x New Balance 990v6 Made in USA 'Untitled'",
    price: "$229",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-118.png",
    product_url:
      "https://www.goat.com/sneakers/action-bronson-x-990v6-made-in-usa-multi-color-u990at6",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#d4c49e",
  },
  {
    title: "New Balance Teddy Santis x 990v4 Made in USA 'Grey Black'",
    price: "$132",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-119.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v4-made-in-usa-grey-cream-u990tg4",
    brand: "New Balance",
    primary_color: "gray",
    primary_color_hex: "#7f7c7a",
  },
  {
    title: "Teddy Santis x New Balance 990v3 Made in USA 'Tan Orange'",
    price: "$166",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-120.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v3-made-in-usa-khaki-orange-m990bt3",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#9f855e",
  },
  {
    title: "Teddy Santis x New Balance 990v4 Made in USA 'Plum Purple'",
    price: "$147",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-121.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v4-made-in-usa-purple-suede-u990tb4",
    brand: "New Balance",
    primary_color: "purple",
    primary_color_hex: "#3c2c5c",
  },
  {
    title: "New Balance 990v6 Made in USA 'Workwear'",
    price: "$69",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-122.png",
    product_url:
      "https://www.goat.com/sneakers/990v6-made-in-usa-workwear-grey-u990tn6",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#b98651",
  },
  {
    title: "Teddy Santis x New Balance 990v3 Made in USA 'Green Gold'",
    price: "$183",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-123.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v3-made-in-usa-green-yellow-m990gg3",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#cfc4a4",
  },
  {
    title:
      "Teddy Santis x New Balance 990v6 Made in USA 'Reflection Marblehead'",
    price: "$149",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-124.png",
    product_url:
      "https://www.goat.com/sneakers/990v6-made-in-usa-reflection-marblehead-u990nc6",
    brand: "New Balance",
    primary_color: "gray",
    primary_color_hex: "#787573",
  },
  {
    title: "Action Bronson x New Balance 990v6 Made in USA 'Baklava'",
    price: "$215",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-125.png",
    product_url:
      "https://www.goat.com/sneakers/action-bronson-x-990v6-made-in-usa-baklava-m990ab6",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#d0b587",
  },
  {
    title: "Teddy Santis x New Balance 990v6 Made in USA 'Paris'",
    price: "$723",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-126.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v6-made-in-usa-paris-u990pa6",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#544639",
  },
  {
    title:
      "Teddy Santis x New Balance 990v6 Made in USA 'Community Pack - Red'",
    price: "$98",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-127.png",
    product_url:
      "https://www.goat.com/sneakers/action-bronson-x-990v6-made-in-usa-community-red-u990rt6",
    brand: "New Balance",
    primary_color: "red",
    primary_color_hex: "#dd817f",
  },
  {
    title: "JJJJound x New Balance 990v3 Made in USA 'Olive'",
    price: "$308",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-128.png",
    product_url:
      "https://www.goat.com/sneakers/jjjjound-x-990v3-made-in-usa-olive-m990jd3",
    brand: "New Balance",
    primary_color: "green",
    primary_color_hex: "#8c9370",
  },
  {
    title: "New Balance 990v6 Made in USA 'Triple Black'",
    price: "$149",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-129.png",
    product_url:
      "https://www.goat.com/sneakers/990v6-made-in-usa-triple-black-u990bb6",
    brand: "New Balance",
    primary_color: "dark_gray",
    primary_color_hex: "#34343c",
  },
  {
    title: "JJJJound x New Balance 990v3 Made in USA 'Brown'",
    price: "$284",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-130.png",
    product_url:
      "https://www.goat.com/sneakers/jjjjound-x-990v3-made-in-usa-brown-m990jj3",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#544430",
  },
  {
    title: "New Balance 990v6 Made in USA 'Salmon'",
    price: "$77",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-131.png",
    product_url:
      "https://www.goat.com/sneakers/990v6-made-in-usa-salmon-u990sr6",
    brand: "New Balance",
    primary_color: "red",
    primary_color_hex: "#f88984",
  },
  {
    title: "New Balance 990v3 Made In USA 'Navy'",
    price: "$139",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-132.png",
    product_url:
      "https://www.goat.com/sneakers/990-made-in-usa-navy-denim-m990nb3",
    brand: "New Balance",
    primary_color: "gray",
    primary_color_hex: "#767a79",
  },
  {
    title:
      "Teddy Santis x New Balance 990v6 Made in USA 'Light Mushroom Moonrock'",
    price: "$154",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-133.png",
    product_url:
      "https://www.goat.com/sneakers/990v6-made-in-usa-light-mushroom-moonrock-u990mm6",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#99826b",
  },
  {
    title:
      "Teddy Santis x New Balance 990v6 Made in USA 'Community Pack - Navy'",
    price: "$174",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-134.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v6-made-in-usa-community-pack-vintage-indigo-u990lt6",
    brand: "New Balance",
    primary_color: "blue",
    primary_color_hex: "#5c6f88",
  },
  {
    title: "Teddy Santis x New Balance 990v3 Made in USA 'Raw Amethyst'",
    price: "$275",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-135.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v3-made-in-usa-raw-amethyst-m990td3",
    brand: "New Balance",
    primary_color: "purple",
    primary_color_hex: "#bcacc4",
  },
  {
    title: "Teddy Santis x New Balance 990v3 Made in USA 'Green Purple'",
    price: "$156",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-136.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v3-made-in-usa-olive-burgundy-m990gp3",
    brand: "New Balance",
    primary_color: "red",
    primary_color_hex: "#5e4a44",
  },
  {
    title: "New Balance Teddy Santis x 990v3 Made in USA 'Scarlet Marblehead'",
    price: "$234",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-137.png",
    product_url:
      "https://www.goat.com/sneakers/990v3-made-in-usa-scarlet-marblehead-m990tf3",
    brand: "New Balance",
    primary_color: "gray",
    primary_color_hex: "#7c7978",
  },
  {
    title: "New Balance 990v5 Made in USA 'Castlerock'",
    price: "$192",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-138.png",
    product_url: "https://www.goat.com/sneakers/990v5-grey-m990gl5",
    brand: "New Balance",
    primary_color: "light_gray",
    primary_color_hex: "#c0bfbe",
  },
  {
    title: "Teddy Santis x New Balance 990v3 Made in USA 'Black Tan'",
    price: "$135",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-139.png",
    product_url:
      "https://www.goat.com/sneakers/990v3-made-in-usa-black-tan-m990bb3",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#524c3c",
  },
  {
    title: "Kith x New Balance 990v3 Made in USA 'Steel Blue'",
    price: "$239",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-140.png",
    product_url:
      "https://www.goat.com/sneakers/kith-x-990v3-made-in-usa-steel-blue-m990ks3",
    brand: "New Balance",
    primary_color: "dark_gray",
    primary_color_hex: "#443c3c",
  },
  {
    title: "New Balance Aimé Leon Dore x 990v4 Made in USA 'True Camo'",
    price: "$233",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-142.png",
    product_url:
      "https://www.goat.com/sneakers/aime-leon-dore-x-990v4-made-in-usa-true-camo-u990ct4",
    brand: "New Balance",
    primary_color: "orange",
    primary_color_hex: "#50452c",
  },
  {
    title:
      "Teddy Santis x New Balance 990v6 Made in USA 'Community Pack - Mint'",
    price: "$118",
    image_url:
      "https://raw.githubusercontent.com/MatthewGreenberg/shoe-finder/refs/heads/main/public/shoes/shoe-143.png",
    product_url:
      "https://www.goat.com/sneakers/teddy-santis-x-990v6-made-in-usa-clay-ash-u990gt6",
    brand: "New Balance",
    primary_color: "teal",
    primary_color_hex: "#245254",
  },
];

export default function ShoeGrid({
  items = DEFAULT_ITEMS,
  collections: collectionsProp = null,
  brandName = "ARCHIVE",
  brandTagline = "Field Index",
  bgColor = "#EDEAE2",
  inkColor = "#17181B",
  accentColor = "#C1422E",
  mutedColor = "#8A8578",
  gridCols = 8,
  itemSize = 2.5,
  gap = 0.4,
  zoomOutLevel = 31,
  zoomInLevel = 12,
  onBuyNow = null,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    items.forEach((item) => {
      if (item.image_url) useTexture.preload(item.image_url);
    });
  }, [mounted, items]);

  const CONFIG = useMemo(
    () =>
      makeConfig({
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
      zoom: CONFIG.zoomOut,
      isDragging: false,
      activeId: null,
    }),
    [CONFIG],
  );

  useEffect(() => {
    registerMaterialsOnce();
  }, []);

  const [currentCollection, setCurrentCollection] = useState(0);
  const [nikeFilter, setNikeFilter] = useState("all");
  const [colorFilter] = useState(EMPTY_COLORS);
  const [currentZoom, setCurrentZoom] = useState(rigState.zoom);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const hasActiveSelection = focusedIndex !== null;

  useEffect(() => {
    if (!mounted) return;
    const i = setInterval(() => setCurrentZoom(rigState.zoom), 50);
    return () => clearInterval(i);
  }, [mounted, rigState]);

  useEffect(() => {
    if (!mounted) return;
    const i = setInterval(() => setFocusedIndex(rigState.activeId), 16);
    return () => clearInterval(i);
  }, [mounted, rigState]);

  const isZoomedIn = currentZoom <= CONFIG.zoomIn + 0.5;

  const collectionsData = useMemo(() => {
    if (collectionsProp)
      return collectionsProp.map((c) => ({
        label: c.label,
        items: c.filterFn(items),
      }));

    const nike = items.filter((s) => s.brand === "Nike");

    // New Balance items shown as-is, once each — no padding/duplication.
    const newBalance = items.filter((s) => s.brand === "New Balance");

    const budget = items.filter((s) => {
      const price = parseInt((s.price || "999").replace(/[$,]/g, ""), 10);
      return price < 150;
    });

    return [
      { label: "Nike", items: nike },
      { label: "New Balance", items: newBalance },
      { label: "Under $150", items: budget },
    ];
  }, [items, collectionsProp]);

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
    setGridLayers((prev) => {
      const exiting = prev.map((layer) =>
        layer.mode === "enter"
          ? { ...layer, mode: "exit", startTime: now }
          : layer,
      );
      return [
        ...exiting,
        {
          id: `grid-${index}-${now}`,
          items: collectionsData[index].items,
          mode: "enter",
          startTime: now,
        },
      ];
    });
    setCurrentCollection(index);
    setNikeFilter("all");
    rigState.target.set(0, 2, 0);
    rigState.activeId = null;
    setTimeout(() => {
      setGridLayers((prev) => prev.filter((l) => l.mode === "enter"));
    }, CONFIG.cleanupTimeout);
  };

  const handleFilterChange = (filter) => {
    if (filter === nikeFilter) return;
    setNikeFilter(filter);
    rigState.activeId = null;
  };

  const handleZoom = (target) => {
    if (target === "OUT") {
      rigState.zoom = CONFIG.zoomOut;
      setCurrentZoom(CONFIG.zoomOut);
      rigState.target.set(0, 2, 0);
    } else if (target === "IN") {
      rigState.zoom = CONFIG.zoomIn;
      setCurrentZoom(CONFIG.zoomIn);
    }
  };

  const activeLayer = gridLayers[gridLayers.length - 1];
  const showNikeFilters =
    currentCollection === 0 && !!collectionsProp === false;

  const filteredItemCount = useMemo(() => {
    if (!showNikeFilters) return activeLayer.items.length;
    return activeLayer.items.filter((item) =>
      matchesFilter(item, nikeFilter, colorFilter),
    ).length;
  }, [activeLayer.items, showNikeFilters, nikeFilter, colorFilter]);

  const activeDims = calcGridDims(filteredItemCount, CONFIG);

  const tabCollections = collectionsData.map((c) => ({
    label: c.label,
    count: c.items.length,
  }));

  const handleBuyNow = () => {
    const item = activeLayer.items[rigState.activeId];
    if (onBuyNow) onBuyNow(item);
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0" style={{ backgroundColor: bgColor }} />
    );
  }

  return (
    <div
      className="fixed inset-0 touch-none overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <LoadingScreen
        bgColor={bgColor}
        inkColor={inkColor}
        mutedColor={mutedColor}
        brandName={brandName}
      />
      <GridHeader
        brandName={brandName}
        brandTagline={brandTagline}
        inkColor={inkColor}
        mutedColor={mutedColor}
        activeLabel={collectionsData[currentCollection]?.label ?? ""}
        itemCount={filteredItemCount}
      />

      <Canvas
        camera={{ position: [0, 0, CONFIG.zoomOut], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      >
        <Rig
          gridW={activeDims.width}
          gridH={activeDims.height}
          rigState={rigState}
          CONFIG={CONFIG}
        />
        <TopologyBackground
          isZoomedIn={isZoomedIn}
          color={bgColor}
          opacity={CONFIG.bgOpacity}
          speed={CONFIG.bgSpeed}
          scale={CONFIG.bgScale}
          lineThickness={CONFIG.bgLineThickness}
        />
        <fog attach="fog" args={[bgColor, CONFIG.fogNear, CONFIG.fogFar]} />
        <Suspense fallback={null}>
          {gridLayers.map((layer) => (
            <GridCanvas
              key={layer.id}
              items={layer.items}
              gridVisible={layer.mode === "enter"}
              transitionStartTime={layer.startTime}
              interactive={layer.mode === "enter"}
              filter={showNikeFilters ? nikeFilter : "all"}
              colorFilter={showNikeFilters ? colorFilter : EMPTY_COLORS}
              rigState={rigState}
              CONFIG={CONFIG}
              accentColor={accentColor}
              onBuyNow={handleBuyNow}
              focusedIndex={focusedIndex}
            />
          ))}
        </Suspense>
      </Canvas>

      <ArchiveMap
        gridDims={activeDims}
        rigState={rigState}
        config={CONFIG}
        totalItems={filteredItemCount}
        isZoomedIn={isZoomedIn}
        inkColor={inkColor}
        accentColor={accentColor}
      />

      <ControlIsland
        collections={tabCollections}
        currentCollection={currentCollection}
        onSwitch={handleCollectionSwitch}
        setZoomTrigger={handleZoom}
        isZoomedIn={isZoomedIn}
        hasActiveSelection={hasActiveSelection}
        nikeFilter={nikeFilter}
        onFilterChange={handleFilterChange}
        showNikeFilters={showNikeFilters}
        inkColor={inkColor}
        accentColor={accentColor}
        mutedColor={mutedColor}
        bgPaper={bgColor}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
