"use client";

import { useContext, useMemo, useState, createContext } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useAspect, useTexture } from "@react-three/drei";
import { Tomorrow } from "next/font/google";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  pass,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";

extend(THREE);

const tomorrow = Tomorrow({ weight: "600", subsets: ["latin"] });

const FALLBACK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const LoadingContext = createContext({
  isLoading: true,
  setIsLoading: () => {},
});

function Scene({
  textureSrc,
  depthSrc,
  planeWidth,
  planeHeight,
  distortionStrength,
  tiling,
  scanDuration,
  maskColor,
}) {
  const { setIsLoading } = useContext(LoadingContext);

  const [rawMap, depthMap] = useTexture(
    [textureSrc || FALLBACK_IMAGE, depthSrc || FALLBACK_IMAGE],
    () => {
      setIsLoading(false);
      rawMap.colorSpace = THREE.SRGBColorSpace;
    },
  );

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(distortionStrength)),
    );

    const aspect = float(planeWidth).div(planeHeight);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tilingVec = vec2(tiling);
    const tiledUv = mod(tUv.mul(tilingVec), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tilingVec).div(2));

    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    const depth = tDepthMap;
    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    const mask = dot
      .mul(flow)
      .mul(vec3(maskColor[0], maskColor[1], maskColor[2]));

    const final = blendScreen(tMap, mask);

    const mat = new THREE.MeshBasicNodeMaterial({ colorNode: final });

    return { material: mat, uniforms: { uPointer, uProgress } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMap, depthMap, distortionStrength, planeWidth, planeHeight, tiling]);

  const [w, h] = useAspect(planeWidth, planeHeight);

  useGSAP(() => {
    gsap.to(uniforms.uProgress, {
      value: 1,
      repeat: -1,
      duration: scanDuration,
      ease: "power1.out",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniforms.uProgress, scanDuration]);

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  return (
    <mesh scale={[w, h, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
}

function PostProcessingEffect({ strength, threshold, radius }) {
  const { gl, scene, camera } = useThree();

  const render = useMemo(() => {
    const postProcessing = new THREE.PostProcessing(gl);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode("output");
    const bloomPass = bloom(scenePassColor, strength, radius, threshold);
    const final = scenePassColor.add(bloomPass);
    postProcessing.outputNode = final;
    return postProcessing;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, scene, strength, threshold, radius]);

  useFrame(() => {
    render.renderAsync();
  }, 1);

  return null;
}

function WebGPUCanvas({ children }) {
  return (
    <Canvas
      flat
      gl={async (canvasProps) => {
        const renderer = new THREE.WebGPURenderer(canvasProps);
        await renderer.init();
        return renderer;
      }}
    >
      {children}
    </Canvas>
  );
}

export default function EmberDepthReveal({
  textureSrc = "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/dungeon.png",
  depthSrc = "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/dungeon-depth.png",
  planeWidth = 1600,
  planeHeight = 900,
  distortionStrength = 0.01,
  tiling = 120,
  scanDuration = 3,
  maskColor = [10, 0, 0],
  bloomStrength = 1,
  bloomThreshold = 1,
  bloomRadius = 0.5,
  bgColor = "#000",
  loaderBgColor = "#78350f",
  loaderDotColor = "#fff",
  title = "Crown of Fire",
  subtitle = "The Majesty and Glory of the Young King",
  titleTextColor = "#fff",
  descTextColor = "#fff",
}) {
  const [isLoading, setIsLoading] = useState(true);

  useGSAP(() => {
    if (!isLoading) {
      gsap
        .timeline()
        .to("[data-loader]", { opacity: 0 })
        .from("[data-title]", {
          yPercent: -100,
          stagger: { each: 0.15 },
          ease: "power1.out",
        })
        .from("[data-desc]", {
          opacity: 0,
          yPercent: 100,
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <div className="h-svh relative" style={{ backgroundColor: bgColor }}>
        <div
          data-loader
          className="h-svh fixed z-[90] pointer-events-none w-full flex justify-center items-center"
          style={{ backgroundColor: loaderBgColor }}
        >
          <div
            className="w-6 h-6 animate-ping rounded-full"
            style={{ backgroundColor: loaderDotColor }}
          />
        </div>

        <div className="h-svh">
          <div className="h-svh uppercase items-center w-full absolute z-[60] pointer-events-none px-10 flex justify-center flex-col">
            <div
              className={`text-4xl md:text-7xl xl:text-8xl 2xl:text-9xl ${tomorrow.className}`}
              style={{ color: titleTextColor }}
            >
              <div className="flex space-x-2 lg:space-x-6 overflow-hidden">
                {title.split(" ").map((word, index) => (
                  <div data-title key={index}>
                    {word}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden"
              style={{ color: descTextColor }}
            >
              <div data-desc>{subtitle}</div>
            </div>
          </div>

          <WebGPUCanvas>
            <PostProcessingEffect
              strength={bloomStrength}
              threshold={bloomThreshold}
              radius={bloomRadius}
            />
            <Scene
              textureSrc={textureSrc}
              depthSrc={depthSrc}
              planeWidth={planeWidth}
              planeHeight={planeHeight}
              distortionStrength={distortionStrength}
              tiling={tiling}
              scanDuration={scanDuration}
              maskColor={maskColor}
            />
          </WebGPUCanvas>
        </div>
      </div>
    </LoadingContext.Provider>
  );
}
