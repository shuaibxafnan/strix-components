"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Loader, useTexture } from "@react-three/drei";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DoubleSide, Mesh, ShaderMaterial, Vector2 } from "three";

// ─── InfiniteGallery ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images               array    ["/tube/im1.jpg", ...]   Image URLs used as tiles
// labels               array    []                        Optional label per image (falls back to "Project N")
// bgClassName          string   "bg-black"                Tailwind class for page background
// rows                 number   5                          Number of distinct rows in the drum
// cols                 number   12                         Tiles per row
// radius               number   4                          Drum radius
// tileWidth            number   0.72                       Tile width (3D units)
// tileHeight           number   1                           Tile height (3D units)
// rowSpacing           number   2.7                        Vertical gap between rows
// baseSpeed            number   0.25                       Idle auto-rotation speed
// hoverSlowdownEnabled boolean  true                       Slow rotation on tile hover
// hoverSlowdownScale   number   0.35                       Speed multiplier while hovering (0-1)
// dragToSpin           boolean  true                       Allow wheel/scroll to spin + fling the drum
// showGridBackdrop     boolean  true                       Render the animated shader grid behind the drum
// gridScale            number   28                         Grid density
// gridLineOpacity      number   0.18                       Grid line blend strength on the backdrop plane
// gridLineColor        string   "#ffffff"                  Grid line color (backdrop plane)
// gridBaseColor        string   "#000000"                  Grid base color (backdrop plane), the plane auto-sizes to always fill the frame
// showTooltip          boolean  true                       Show a floating label following the cursor on hover
// showCustomCursor     boolean  true                       Show a custom circular cursor (mix-blend difference)
// cameraFov            number   50                          Camera field of view
// cameraDistance       number   6.5                        Camera distance on Z axis
// ambientIntensity     number   0.5                         Ambient light intensity
// directionalIntensity number   1                           Directional light intensity
// environmentPreset    string   "studio"                    @react-three/drei Environment preset
// ──────────────────────────────────────────────────────────────────────────

function GridBackdrop({
  targetCenterUv,
  gridScale,
  lineOpacity,
  lineColorHex,
  baseColorHex,
}) {
  const meshRef = useRef(null);
  const { viewport, camera, size } = useThree();

  // Plane sits at z = -5.2; size it off the viewport measured at that depth
  // (padded 1.6x) so it always covers the frame, on ultra-wide screens too.
  const planeSize = useMemo(() => {
    const depthViewport = viewport.getCurrentViewport(camera, [0, 0, -5.2]);
    const width = Math.max(depthViewport.width, depthViewport.height) * 1.6;
    return Math.max(24, width);
  }, [viewport, camera, size.width, size.height]);

  const uniforms = useMemo(
    () => ({
      uGridScale: { value: gridScale },
      uLineWidth: { value: 0.5 },
      uEdgeWidth: { value: 0.14 },
      uEdgeAmp: { value: 1.35 },
      uCenterRadius: { value: 0.22 },
      uCenterAmp: { value: 0.9 },
      uCenter: { value: new Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uScrollSpeed: { value: 0.01 },
      uLineOpacity: { value: lineOpacity },
      uBaseColor: { value: [1, 1, 1] },
      uLineColor: { value: [0, 0, 0] },
    }),
    [],
  );

  useEffect(() => {
    const toRgb = (hex) => {
      const clean = hex.replace("#", "");
      const bigint = parseInt(clean, 16);
      return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255,
      ];
    };
    uniforms.uBaseColor.value = toRgb(baseColorHex);
    uniforms.uLineColor.value = toRgb(lineColorHex);
    uniforms.uGridScale.value = gridScale;
    uniforms.uLineOpacity.value = lineOpacity;
  }, [baseColorHex, lineColorHex, gridScale, lineOpacity, uniforms]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const material = mesh.material;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uCenter.value.lerp(targetCenterUv.current, 0.08);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5.2]}>
      <planeGeometry args={[planeSize, planeSize, 400, 400]} />
      <shaderMaterial
        attach="material"
        args={[
          {
            uniforms,
            vertexShader: `
              varying vec2 vUv;
              uniform float uEdgeWidth;
              uniform float uEdgeAmp;
              uniform float uCenterRadius;
              uniform float uCenterAmp;
              uniform vec2 uCenter;
              void main() {
                vUv = uv;
                vec3 p = position;
                float dEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
                float edgeMask = 1.0 - smoothstep(0.0, uEdgeWidth, dEdge);
                float dCenter = distance(vUv, uCenter);
                float centerMask = 1.0 - smoothstep(0.0, uCenterRadius, dCenter);
                float zOffset = edgeMask * uEdgeAmp + centerMask * uCenterAmp;
                p.z += zOffset;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
              }
            `,
            fragmentShader: `
              varying vec2 vUv;
              uniform float uGridScale;
              uniform float uLineWidth;
              uniform float uTime;
              uniform float uScrollSpeed;
              uniform float uLineOpacity;
              uniform vec3 uBaseColor;
              uniform vec3 uLineColor;
              float gridLine(float coord, float width) {
                float fw = fwidth(coord);
                float p = abs(fract(coord - 0.5) - 0.5);
                return 1.0 - smoothstep(width * fw, (width + 1.0) * fw, p);
              }
              void main() {
                vec2 uv = (vUv + vec2(uTime * uScrollSpeed, 0.0)) * uGridScale;
                float gx = gridLine(uv.x, uLineWidth);
                float gy = gridLine(uv.y, uLineWidth);
                float g = max(gx, gy);
                vec3 col = mix(uBaseColor, uLineColor, g * uLineOpacity);
                gl_FragColor = vec4(col, 1.0);
              }
            `,
            side: DoubleSide,
          },
        ]}
      />
    </mesh>
  );
}

function ImageDrum({
  images,
  labels,
  rows,
  cols,
  radius,
  tileWidth,
  tileHeight,
  rowSpacing,
  baseSpeed,
  hoverSlowdownEnabled,
  hoverSlowdownScale,
  scrollTargetRef,
  spinVelocityRef,
  naturalDirRef,
  onHoverStart,
  onHoverMove,
  onHoverEnd,
}) {
  const groupRef = useRef(null);
  const rowGroupRefs = useRef([]);
  const scrollCurrent = useRef(0);
  const angle = useRef(0);
  const rotationSpeedScale = useRef(1);
  const rotationSpeedScaleTarget = useRef(1);

  const textures = useTexture(images);

  const projectNames = useMemo(
    () => images.map((url, i) => labels[i] || `Project ${i + 1}`),
    [images, labels],
  );

  const loopHeight = rows * rowSpacing;
  const repeatCount = 3;
  const totalRows = rows * repeatCount;

  const rowSpeed = useMemo(() => {
    const speeds = [];
    for (let r = 0; r < rows; r++) {
      const t = rows <= 1 ? 0 : r / (rows - 1);
      speeds.push(0.65 + t * 0.9);
    }
    return speeds;
  }, [rows]);

  const rowPositions = useMemo(() => {
    const out = [];
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const y = (rowIndex - (totalRows - 1) / 2) * rowSpacing;
      const baseRow = rowIndex % rows;
      const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;
      out.push({ rowIndex, y, baseRow, rowOffset });
    }
    return out;
  }, [rows, totalRows, rowSpacing]);

  const handleHoverStart = useCallback(
    (projectName, event) => {
      if (hoverSlowdownEnabled)
        rotationSpeedScaleTarget.current = hoverSlowdownScale;
      onHoverStart(projectName, event);
    },
    [hoverSlowdownEnabled, hoverSlowdownScale, onHoverStart],
  );

  const handleHoverEnd = useCallback(() => {
    rotationSpeedScaleTarget.current = 1;
    onHoverEnd();
  }, [onHoverEnd]);

  useFrame((_state, dt) => {
    scrollCurrent.current +=
      (scrollTargetRef.current - scrollCurrent.current) * 0.12;

    if (scrollCurrent.current > loopHeight / 2) {
      scrollCurrent.current -= loopHeight;
      scrollTargetRef.current -= loopHeight;
    } else if (scrollCurrent.current < -loopHeight / 2) {
      scrollCurrent.current += loopHeight;
      scrollTargetRef.current += loopHeight;
    }

    const damping = 0.92;
    spinVelocityRef.current *= Math.pow(damping, dt * 60);
    spinVelocityRef.current = Math.max(
      -2,
      Math.min(2, spinVelocityRef.current),
    );

    rotationSpeedScale.current +=
      (rotationSpeedScaleTarget.current - rotationSpeedScale.current) * 0.12;
    const scaledDt = dt * rotationSpeedScale.current;

    const base = naturalDirRef.current * baseSpeed;
    angle.current += (base + spinVelocityRef.current) * scaledDt;

    const group = groupRef.current;
    if (!group) return;
    group.position.y = -scrollCurrent.current;

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowObj = rowGroupRefs.current[rowIndex];
      if (!rowObj) continue;
      const baseRow = rowIndex % rows;
      rowObj.rotation.y = angle.current * rowSpeed[baseRow];
    }
  });

  return (
    <group ref={groupRef}>
      {rowPositions.map(({ rowIndex, y, baseRow, rowOffset }) => (
        <group
          key={rowIndex}
          position={[0, y, 0]}
          ref={(obj) => {
            rowGroupRefs.current[rowIndex] = obj;
          }}
        >
          {Array.from({ length: cols }).map((_, col) => {
            const theta = ((col + rowOffset) / cols) * Math.PI * 2;
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            const ry = -(theta + Math.PI / 2);
            const texIndex = (baseRow * cols + col) % images.length;
            const projectName = projectNames[texIndex] || "";

            return (
              <mesh
                key={col}
                position={[x, 0, z]}
                rotation={[0, ry, 0]}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  handleHoverStart(projectName, e);
                }}
                onPointerMove={(e) => {
                  e.stopPropagation();
                  onHoverMove(e);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  handleHoverEnd();
                }}
              >
                <planeGeometry args={[tileWidth, tileHeight]} />
                <meshBasicMaterial
                  map={textures[texIndex]}
                  toneMapped={false}
                  side={DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

export default function ImageTubeGallery3D({
  images = [
    "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
  ],
  labels = [],
  bgClassName = "bg-black",
  rows = 5,
  cols = 12,
  radius = 4,
  tileWidth = 0.72,
  tileHeight = 1,
  rowSpacing = 2.7,
  baseSpeed = 0.25,
  hoverSlowdownEnabled = true,
  hoverSlowdownScale = 0.35,
  dragToSpin = true,
  showGridBackdrop = true,
  gridScale = 28,
  gridLineOpacity = 0.18,
  gridLineColor = "#ffffff",
  gridBaseColor = "#000000",
  showTooltip = true,
  showCustomCursor = true,
  cameraFov = 50,
  cameraDistance = 6.5,
  ambientIntensity = 0.5,
  directionalIntensity = 1,
  environmentPreset = "studio",
}) {
  const containerRef = useRef(null);
  const targetCenterUv = useRef(new Vector2(0.5, 0.5));

  const scrollTarget = useRef(0);
  const spinVelocity = useRef(0);
  const naturalDir = useRef(1);

  const [hoveredProject, setHoveredProject] = useState(null);

  const tooltipElRef = useRef(null);
  const tooltipTarget = useRef({ x: 0, y: 0 });
  const tooltipCurrent = useRef({ x: 0, y: 0 });
  const tooltipRaf = useRef(null);

  const cursorElRef = useRef(null);
  const cursorTarget = useRef({ x: 0, y: 0 });
  const cursorCurrent = useRef({ x: 0, y: 0 });
  const cursorActive = useRef(false);
  const cursorRaf = useRef(null);

  const setTooltipFromClientPoint = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    tooltipTarget.current = { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  useEffect(() => {
    if (!showTooltip) return undefined;

    const tick = () => {
      const el = tooltipElRef.current;
      if (el) {
        const lerp = 0.18;
        tooltipCurrent.current.x +=
          (tooltipTarget.current.x - tooltipCurrent.current.x) * lerp;
        tooltipCurrent.current.y +=
          (tooltipTarget.current.y - tooltipCurrent.current.y) * lerp;
        const x = tooltipCurrent.current.x + 12;
        const y = tooltipCurrent.current.y - 18;
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      }
      tooltipRaf.current = requestAnimationFrame(tick);
    };

    tooltipRaf.current = requestAnimationFrame(tick);
    return () => {
      if (tooltipRaf.current != null) cancelAnimationFrame(tooltipRaf.current);
    };
  }, [showTooltip]);

  useEffect(() => {
    if (!showCustomCursor) return undefined;

    const tick = () => {
      const el = cursorElRef.current;
      if (el) {
        const lerp = 0.14;
        cursorCurrent.current.x +=
          (cursorTarget.current.x - cursorCurrent.current.x) * lerp;
        cursorCurrent.current.y +=
          (cursorTarget.current.y - cursorCurrent.current.y) * lerp;
        const x = cursorCurrent.current.x + 8;
        const y = cursorCurrent.current.y + 8;
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = cursorActive.current ? "1" : "0";
      }
      cursorRaf.current = requestAnimationFrame(tick);
    };

    cursorRaf.current = requestAnimationFrame(tick);
    return () => {
      if (cursorRaf.current != null) cancelAnimationFrame(cursorRaf.current);
    };
  }, [showCustomCursor]);

  const onImageHoverStart = useCallback(
    (projectName, event) => {
      if (!showTooltip) return;
      setHoveredProject(projectName);
      setTooltipFromClientPoint(
        event.nativeEvent.clientX,
        event.nativeEvent.clientY,
      );
      tooltipCurrent.current = { ...tooltipTarget.current };
    },
    [setTooltipFromClientPoint, showTooltip],
  );

  const onImageHoverMove = useCallback(
    (event) => {
      if (!showTooltip) return;
      setTooltipFromClientPoint(
        event.nativeEvent.clientX,
        event.nativeEvent.clientY,
      );
    },
    [setTooltipFromClientPoint, showTooltip],
  );

  const onImageHoverEnd = useCallback(() => {
    setHoveredProject(null);
  }, []);

  const onPointerEnter = useCallback(
    (event) => {
      if (!showCustomCursor) return;
      const rect = event.currentTarget.getBoundingClientRect();
      cursorTarget.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      cursorCurrent.current = { ...cursorTarget.current };
      cursorActive.current = true;
    },
    [showCustomCursor],
  );

  const onPointerMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      if (showCustomCursor) {
        cursorTarget.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }

      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      const clampedX = Math.min(1, Math.max(0, nx));
      const clampedY = Math.min(1, Math.max(0, ny));

      const uvX = clampedX;
      const uvY = 1 - clampedY;
      const strength = 0.4;
      const cx = 0.5 + (uvX - 0.5) * strength;
      const cy = 0.5 + (uvY - 0.5) * strength;

      targetCenterUv.current.set(
        Math.min(1, Math.max(0, cx)),
        Math.min(1, Math.max(0, cy)),
      );
    },
    [showCustomCursor],
  );

  const onPointerLeave = useCallback(() => {
    targetCenterUv.current.set(0.5, 0.5);
    cursorActive.current = false;
    onImageHoverEnd();
  }, [onImageHoverEnd]);

  const onWheel = useCallback(
    (event) => {
      if (!dragToSpin) return;
      scrollTarget.current += event.deltaY * 0.002;
      spinVelocity.current += event.deltaY * 0.004;

      if (event.deltaY < 0) naturalDir.current = -1;
      else if (event.deltaY > 0) naturalDir.current = 1;
    },
    [dragToSpin],
  );

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen overflow-hidden touch-none cursor-none ${bgClassName}`}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onWheel={onWheel}
    >
      <Canvas
        className="absolute inset-0 w-full h-full"
        camera={{ position: [0, 0, cameraDistance], fov: cameraFov }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={ambientIntensity} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={directionalIntensity}
          />

          <Environment preset={environmentPreset} blur={10.5} />

          {showGridBackdrop && (
            <GridBackdrop
              targetCenterUv={targetCenterUv}
              gridScale={gridScale}
              lineOpacity={gridLineOpacity}
              lineColorHex={gridLineColor}
              baseColorHex={gridBaseColor}
            />
          )}

          <ImageDrum
            images={images}
            labels={labels}
            rows={rows}
            cols={cols}
            radius={radius}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
            rowSpacing={rowSpacing}
            baseSpeed={baseSpeed}
            hoverSlowdownEnabled={hoverSlowdownEnabled}
            hoverSlowdownScale={hoverSlowdownScale}
            scrollTargetRef={scrollTarget}
            spinVelocityRef={spinVelocity}
            naturalDirRef={naturalDir}
            onHoverStart={onImageHoverStart}
            onHoverMove={onImageHoverMove}
            onHoverEnd={onImageHoverEnd}
          />
        </Suspense>
      </Canvas>

      {showTooltip && hoveredProject && (
        <div
          ref={tooltipElRef}
          role="status"
          aria-live="polite"
          className="absolute top-0 left-0 z-10 pointer-events-none select-none whitespace-nowrap rounded-lg border border-white/20 bg-black/70 px-2.5 py-2 text-xs tracking-wide text-white/90"
        >
          {hoveredProject}
        </div>
      )}

      {showCustomCursor && (
        <div
          ref={cursorElRef}
          aria-hidden="true"
          className="absolute top-0 left-0 z-30 h-[18px] w-[18px] rounded-full bg-white/90 opacity-0 pointer-events-none will-change-transform [mix-blend-mode:difference] [transition:opacity_150ms_linear]"
        />
      )}

      <Loader />
    </div>
  );
}
