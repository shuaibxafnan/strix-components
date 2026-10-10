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
  oneMinus,
  pass,
  smoothstep,
  sub,
  texture,
  uniform,
  uv,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";

extend(THREE);

const tomorrow = Tomorrow({ weight: "600", subsets: ["latin"] });

// ─── NeonHorizonReveal ───────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// textureSrc        string   ""          Color/raw image URL rendered on the plane. Leave
//                                         empty and it falls back to a transparent 1x1 pixel
//                                         so the scene never crashes before you wire up assets.
// depthSrc          string   ""          Grayscale depth-map URL driving the pointer ripple and
//                                         the scanning-line mask. Same empty-string fallback.
// edgeSrc           string   ""          Edge/outline map URL — inverted and multiplied into the
//                                         mask so only outlines glow inside the scan band. Same
//                                         empty-string fallback.
// planeWidth        number   1600        Native pixel width of the source image (sets plane aspect).
// planeHeight       number   900         Native pixel height of the source image (sets plane aspect).
// distortionStrength number  0.01        How far the depth map pushes UVs toward the pointer.
// baseDim           number   0.5         Multiplier darkening the base image before the glow blends in.
// scanDuration      number   3           Seconds for one full sweep of the depth-scan line (looping).
// maskColor         array    [10,0.4,10] RGB multiplier tinting the revealed scan-line edges (neon magenta/green by default).
// bloomStrength     number   1           Bloom post-processing intensity.
// bloomRadius       number   0.5         Bloom blur radius.
// bloomThreshold    number   1           Luminance threshold before bloom kicks in.
// bgColor           string   "#000"      Page background shown behind/while the canvas loads.
// loaderBgColor     string   "#1e1b4b"   Full-screen loader background color (indigo-950 by default).
// loaderDotColor    string   "#fff"      Color of the pulsing loader dot.
// title             string   "Neon Horizon"   Headline text, split and animated word by word.
// subtitleLines     array    ["A city consumed by light and shadow,", "where one endless road leads to an uncertain future."]
//                                         Sub-headline, one array entry per rendered line.
// titleTextColor    string   "#fff"      Headline text color.
// descTextColor     string   "#fff"      Sub-headline text color.
// (Tomorrow display font is loaded at module scope with weight "600" —
//  next/font requires this call to be static, so weight isn't prop-driven.
//  Edit the `Tomorrow({...})` call directly if you need a different weight.)
// ──────────────────────────────────────────────────────────────────────────

const FALLBACK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const LoadingContext = createContext({
  isLoading: true,
  setIsLoading: () => {},
});

function Scene({
  textureSrc,
  depthSrc,
  edgeSrc,
  planeWidth,
  planeHeight,
  distortionStrength,
  baseDim,
  scanDuration,
  maskColor,
}) {
  const { setIsLoading } = useContext(LoadingContext);

  const [rawMap, depthMap, edgeMap] = useTexture(
    [
      textureSrc || FALLBACK_IMAGE,
      depthSrc || FALLBACK_IMAGE,
      edgeSrc || FALLBACK_IMAGE,
    ],
    () => {
      setIsLoading(false);
      rawMap.colorSpace = THREE.SRGBColorSpace;
    },
  );

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const tDepthMap = texture(depthMap);
    const tEdgeMap = texture(edgeMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(distortionStrength)),
    ).mul(baseDim);

    const depth = tDepthMap;
    const flow = sub(1, smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    const mask = oneMinus(tEdgeMap)
      .mul(flow)
      .mul(vec3(maskColor[0], maskColor[1], maskColor[2]));

    const final = blendScreen(tMap, mask);

    const mat = new THREE.MeshBasicNodeMaterial({ colorNode: final });

    return { material: mat, uniforms: { uPointer, uProgress } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMap, depthMap, edgeMap, distortionStrength, baseDim]);

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

export default function NeonHorizonReveal({
  textureSrc = "https://raw.githubusercontent.com/d3adrabbit/ScanningEffectWithDepthMap/refs/heads/main/assets/raw-2.png",
  depthSrc = "https://raw.githubusercontent.com/d3adrabbit/ScanningEffectWithDepthMap/refs/heads/main/assets/depth-2.png",
  edgeSrc = "https://raw.githubusercontent.com/d3adrabbit/ScanningEffectWithDepthMap/refs/heads/main/assets/edge-2.png",
  planeWidth = 1600,
  planeHeight = 900,
  distortionStrength = 0.01,
  baseDim = 0.5,
  scanDuration = 3,
  maskColor = [10, 0.4, 10],
  bloomStrength = 1,
  bloomThreshold = 1,
  bloomRadius = 0.5,
  bgColor = "#000",
  loaderBgColor = "#1e1b4b",
  loaderDotColor = "#fff",
  title = "Neon Horizon",
  subtitleLines = [
    "A city consumed by light and shadow,",
    "where one endless road leads to an uncertain future.",
  ],
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
              className="text-center text-base xl:text-xl mt-4 overflow-hidden"
              style={{ color: descTextColor }}
            >
              <div data-desc>
                {subtitleLines.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
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
              edgeSrc={edgeSrc}
              planeWidth={planeWidth}
              planeHeight={planeHeight}
              distortionStrength={distortionStrength}
              baseDim={baseDim}
              scanDuration={scanDuration}
              maskColor={maskColor}
            />
          </WebGPUCanvas>
        </div>
      </div>
    </LoadingContext.Provider>
  );
}
