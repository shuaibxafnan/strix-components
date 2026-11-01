"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Loader } from "@react-three/drei";
import ReactLenis, { useLenis } from "lenis/react";
import {
  forwardRef,
  Suspense,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import * as THREE from "three";

const DEFAULT_IMAGES = [
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
];

const IMAGE_FRAGMENT_SHADER = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec2 uPlaneSizes;
  uniform vec2 uImageSizes;
  varying vec2 vUv;
  void main() {
    vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    vec4 finalColor = texture2D(uTexture, uv);
    gl_FragColor = finalColor;
  }
`;

const VERTICAL_VERTEX_SHADER = `
  uniform float uScrollSpeed;
  uniform float uCurveStrength;
  uniform float uCurveFrequency;
  varying vec2 vUv;
  #define PI 3.141592653
  void main() {
    vec3 pos = position;
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    float xDisplacement = uCurveStrength * cos(worldPosition.y * uCurveFrequency);
    pos.x += xDisplacement;
    pos.x -= uCurveStrength;
    float yDisplacement = -sin(uv.x * PI) * uScrollSpeed;
    pos.y += yDisplacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
  }
`;

const HORIZONTAL_VERTEX_SHADER = `
  uniform float uScrollSpeed;
  uniform float uCurveStrength;
  uniform float uCurveFrequency;
  varying vec2 vUv;
  #define PI 3.141592653
  void main() {
    vec3 pos = position;
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    float yDisplacement = uCurveStrength * cos(worldPosition.x * uCurveFrequency);
    pos.y += yDisplacement;
    pos.y -= uCurveStrength;
    float xDisplacement = -sin(uv.y * PI) * uScrollSpeed;
    pos.x += xDisplacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
  }
`;

function mod(n, m) {
  return ((n % m) + m) % m;
}

const GLImage = forwardRef(
  (
    {
      imageUrl,
      scale,
      position = [0, 0, 0],
      curveStrength,
      curveFrequency,
      geometry,
      direction = "vertical",
    },
    forwardedRef,
  ) => {
    const localRef = useRef(null);
    const imageRef = forwardedRef || localRef;
    const texture = useTexture(imageUrl);

    const imageSizes = useMemo(() => {
      if (!texture?.image) return [1, 1];
      return [texture.image.width, texture.image.height];
    }, [texture]);

    const shaderArgs = useMemo(
      () => ({
        uniforms: {
          uTexture: { value: texture },
          uScrollSpeed: { value: 0.0 },
          uPlaneSizes: { value: new THREE.Vector2(scale[0], scale[1]) },
          uImageSizes: {
            value: new THREE.Vector2(imageSizes[0], imageSizes[1]),
          },
          uCurveStrength: { value: curveStrength || 0 },
          uCurveFrequency: { value: curveFrequency || 0 },
        },
        vertexShader:
          direction === "vertical"
            ? VERTICAL_VERTEX_SHADER
            : HORIZONTAL_VERTEX_SHADER,
        fragmentShader: IMAGE_FRAGMENT_SHADER,
      }),
      [texture, direction, curveStrength, curveFrequency, scale, imageSizes],
    );

    return (
      <mesh position={position} ref={imageRef} scale={scale}>
        <primitive object={geometry} attach="geometry" />
        <shaderMaterial {...shaderArgs} />
      </mesh>
    );
  },
);
GLImage.displayName = "GLImage";

function ReelColumn({
  images,
  position,
  rotation,
  imageSize,
  gap,
  wheelFactor = 1,
  wheelDirection = 1,
  curveStrength = 0,
  curveFrequency = 0,
  direction = "vertical",
  scrollSpeedSmoothing = 0,
}) {
  const imageRefs = useRef([]);
  const planeGeometry = useMemo(
    () => new THREE.PlaneGeometry(1, 1, 16, 16),
    [],
  );

  const totalHeight = images.length * gap + images.length * imageSize[1];
  const totalWidth = images.length * gap + images.length * imageSize[0];

  useFrame((_, dt) => {
    if (direction === "vertical") {
      imageRefs.current.forEach((ref) => {
        if (!ref) return;
        ref.position.y =
          mod(ref.position.y + totalHeight / 2, totalHeight) - totalHeight / 2;
        if (scrollSpeedSmoothing > 0) {
          const u = ref.material.uniforms.uScrollSpeed;
          u.value = THREE.MathUtils.lerp(
            u.value,
            u.targetValue ?? 0,
            1 - Math.pow(scrollSpeedSmoothing, dt),
          );
        }
      });
    } else {
      imageRefs.current.forEach((ref) => {
        if (!ref) return;
        ref.position.x =
          mod(ref.position.x + totalWidth / 2, totalWidth) - totalWidth / 2;
        if (scrollSpeedSmoothing > 0) {
          const u = ref.material.uniforms.uScrollSpeed;
          u.value = THREE.MathUtils.lerp(
            u.value,
            u.targetValue ?? 0,
            1 - Math.pow(scrollSpeedSmoothing, dt),
          );
        }
      });
    }
  });

  useLenis(({ velocity }) => {
    if (direction === "vertical") {
      imageRefs.current.forEach((ref) => {
        if (!ref) return;
        ref.position.y -= velocity * 0.005 * wheelFactor * wheelDirection;
        const target = velocity * 0.005 * wheelFactor * wheelDirection;
        if (scrollSpeedSmoothing > 0) {
          ref.material.uniforms.uScrollSpeed.targetValue = target;
        } else {
          ref.material.uniforms.uScrollSpeed.value = target;
        }
      });
    } else {
      imageRefs.current.forEach((ref) => {
        if (!ref) return;
        ref.position.x += velocity * 0.005 * wheelFactor * wheelDirection;
        const target = -velocity * 0.005 * wheelFactor * wheelDirection;
        if (scrollSpeedSmoothing > 0) {
          ref.material.uniforms.uScrollSpeed.targetValue = target;
        } else {
          ref.material.uniforms.uScrollSpeed.value = target;
        }
      });
    }
  });

  return (
    <group position={position || [0, 0, 0]} rotation={rotation || [0, 0, 0]}>
      {images.map((url, index) => (
        <GLImage
          key={index}
          imageUrl={url}
          scale={[imageSize[0], imageSize[1], 1]}
          geometry={planeGeometry}
          curveStrength={curveStrength}
          curveFrequency={curveFrequency}
          position={
            direction === "vertical"
              ? [0, index * (imageSize[1] + gap), 0]
              : [index * (imageSize[0] + gap), 0, 0]
          }
          ref={(el) => {
            if (el) imageRefs.current[index] = el;
          }}
          direction={direction}
        />
      ))}
    </group>
  );
}

function ReelScene({
  images,
  imageSize,
  gap,
  direction,
  columns,
  scrollSpeedSmoothing,
}) {
  return (
    <>
      {columns.map((col, i) => (
        <ReelColumn
          key={i}
          images={images}
          position={col.position}
          rotation={col.rotation}
          imageSize={imageSize}
          gap={gap}
          curveStrength={col.curveStrength}
          curveFrequency={col.curveFrequency}
          wheelFactor={col.wheelFactor}
          wheelDirection={col.wheelDirection ?? 1}
          direction={direction}
          scrollSpeedSmoothing={scrollSpeedSmoothing}
        />
      ))}
    </>
  );
}

const DEFAULT_COLUMNS = [
  {
    position: [0, 0, 0],
    wheelFactor: 0.4,
    curveFrequency: 0.5,
    curveStrength: -1,
  },
  {
    position: [0, 0, 0],
    rotation: [0, 0, Math.PI / 5],
    wheelFactor: 0.3,
    curveStrength: 1,
    curveFrequency: 0.5,
  },
  {
    position: [2, 0, 0],
    rotation: [0, 0, -Math.PI / 6],
    wheelFactor: 0.2,
    curveStrength: 1.4,
    curveFrequency: 0.5,
  },
  {
    position: [-2, 0, 0],
    rotation: [0, 0, -Math.PI / 8],
    wheelFactor: 0.5,
    curveStrength: 1.4,
    curveFrequency: 0.5,
  },
  {
    position: [2, 0, 0],
    rotation: [0, 0, Math.PI / 8],
    wheelFactor: 0.35,
    curveStrength: -1.8,
    curveFrequency: 0.3,
  },
  {
    position: [-1.7, 0, 0],
    rotation: [0, 0, Math.PI / 9],
    wheelFactor: 0.45,
    curveStrength: -1.8,
    curveFrequency: 0.3,
  },
];

export default function WeaveReel({
  images = DEFAULT_IMAGES,
  imageSize = [0.3, 0.4],
  gap = 0,
  direction = "vertical",
  columns = DEFAULT_COLUMNS,
  scrollSpeedSmoothing = 0,
  cameraZ = 3,
  bgColor = "#f8f8f8",
  includeLenis = true,
  lenisOptions = { infinite: true, syncTouch: true },
  showLoader = true,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scene = (
    <>
      <Canvas
        style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0 }}
        camera={{ position: [0, 0, cameraZ] }}
      >
        <Suspense fallback={null}>
          <ReelScene
            images={images}
            imageSize={imageSize}
            gap={gap}
            direction={direction}
            columns={columns}
            scrollSpeedSmoothing={scrollSpeedSmoothing}
          />
        </Suspense>
      </Canvas>
      {showLoader && <Loader />}
    </>
  );

  return (
    <div className={className} style={{ backgroundColor: bgColor }}>
      {includeLenis && mounted && <ReactLenis root options={lenisOptions} />}
      {mounted && scene}
    </div>
  );
}
