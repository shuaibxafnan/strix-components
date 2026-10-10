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
  Fn,
  max,
  mod,
  oneMinus,
  pass,
  select,
  smoothstep,
  sub,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";

extend(THREE);

const tomorrow = Tomorrow({ weight: "600", subsets: ["latin"] });

// ─── NatureRhythmReveal ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// textureSrc        string   ""          Color/raw image URL rendered on the plane. Leave
//                                         empty and it falls back to a transparent 1x1 pixel
//                                         so the scene never crashes before you wire up assets.
// depthSrc          string   ""          Grayscale depth-map URL driving the pointer ripple and
//                                         the scanning-line mask. Same empty-string fallback.
// planeWidth        number   1226        Native pixel width of the source image (sets plane aspect).
// planeHeight       number   650         Native pixel height of the source image (sets plane aspect).
// distortionStrength number  0.01        How far the depth map pushes UVs toward the pointer.
// baseDim           number   0.5         Multiplier darkening the base image before the glow blends in.
// tiling            number   50          Density of the repeating cross-pattern grid.
// crossWidth        number   0.3         Half-length of each cross arm (SDF box half-extent x).
// crossThickness    number   0.02        Half-thickness of each cross arm (SDF box half-extent y).
// crossRadius       number   0           Corner rounding radius applied to the cross SDF.
// scanTarget        number   0.9         Value the scan progress animates to before looping (was 1 in the other two effects).
// scanDuration      number   3           Seconds for one full sweep of the depth-scan line (looping).
// maskColor         array    [10,10,10]  RGB multiplier tinting the revealed scan-line crosses (white/neutral by default).
// bloomStrength     number   0.3         Bloom post-processing intensity.
// bloomRadius       number   0.5         Bloom blur radius.
// bloomThreshold    number   1           Luminance threshold before bloom kicks in.
// bgColor           string   "#000"      Page background shown behind/while the canvas loads.
// loaderBgColor     string   "#6b7280"   Full-screen loader background color (gray-500 by default).
// loaderDotColor    string   "#fff"      Color of the pulsing loader dot.
// title             string   "Embrace Nature's Rhythm"   Headline text, split and animated word by word.
// titleSizeClassName string  "text-xl md:text-4xl xl:text-6xl 2xl:text-7xl"   Tailwind size classes for the headline (smaller than the other two effects by design).
// subtitleLines     array    ["where one endless road leads to an uncertain future."]
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

const sdCross = Fn(([p_immutable, b_immutable, r_immutable]) => {
  const r = float(r_immutable).toVar();
  const b = vec2(b_immutable).toVar();
  const p = vec2(p_immutable).toVar();
  p.assign(abs(p));
  p.assign(select(p.y.greaterThan(p.x), p.yx, p.xy));
  const q = vec2(p.sub(b)).toVar();
  const k = float(max(q.y, q.x)).toVar();
  const w = vec2(
    select(k.greaterThan(0.0), q, vec2(b.y.sub(p.x), k.negate())),
  ).toVar();
  const d = float(max(w, 0.0).length()).toVar();

  return select(k.greaterThan(0.0), d, d.negate()).add(r);
});

function Scene({
  textureSrc,
  depthSrc,
  planeWidth,
  planeHeight,
  distortionStrength,
  baseDim,
  tiling,
  crossWidth,
  crossThickness,
  crossRadius,
  scanTarget,
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
    ).mul(baseDim);

    const aspect = float(planeWidth).div(planeHeight);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tilingVec = vec2(tiling);
    const tiledUv = mod(tUv.mul(tilingVec), 2.0).sub(1.0);

    const dist = sdCross(
      tiledUv,
      vec2(crossWidth, crossThickness),
      crossRadius,
    );
    const cross = vec3(smoothstep(0.0, 0.02, dist));

    const depth = oneMinus(tDepthMap);
    const flow = sub(1, smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    const mask = oneMinus(cross)
      .mul(flow)
      .mul(vec3(maskColor[0], maskColor[1], maskColor[2]));

    const final = blendScreen(tMap, mask);

    const mat = new THREE.MeshBasicNodeMaterial({ colorNode: final });

    return { material: mat, uniforms: { uPointer, uProgress } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rawMap,
    depthMap,
    distortionStrength,
    baseDim,
    planeWidth,
    planeHeight,
    tiling,
    crossWidth,
    crossThickness,
    crossRadius,
  ]);

  const [w, h] = useAspect(planeWidth, planeHeight);

  useGSAP(() => {
    gsap.to(uniforms.uProgress, {
      value: scanTarget,
      repeat: -1,
      duration: scanDuration,
      ease: "power1.out",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniforms.uProgress, scanTarget, scanDuration]);

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

export default function NatureRhythmReveal({
  textureSrc = "https://raw.githubusercontent.com/d3adrabbit/ScanningEffectWithDepthMap/refs/heads/main/assets/raw-3.jpg",
  depthSrc = "https://raw.githubusercontent.com/d3adrabbit/ScanningEffectWithDepthMap/refs/heads/main/assets/depth-3.png",
  planeWidth = 1226,
  planeHeight = 650,
  distortionStrength = 0.01,
  baseDim = 0.5,
  tiling = 50,
  crossWidth = 0.3,
  crossThickness = 0.02,
  crossRadius = 0,
  scanTarget = 0.9,
  scanDuration = 3,
  maskColor = [10, 10, 10],
  bloomStrength = 0.3,
  bloomThreshold = 1,
  bloomRadius = 0.5,
  bgColor = "#000",
  loaderBgColor = "#6b7280",
  loaderDotColor = "#fff",
  title = "Embrace Nature's Rhythm",
  titleSizeClassName = "text-xl md:text-4xl xl:text-6xl 2xl:text-7xl",
  subtitleLines = ["where one endless road leads to an uncertain future."],
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
              className={`${titleSizeClassName} ${tomorrow.className}`}
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
              planeWidth={planeWidth}
              planeHeight={planeHeight}
              distortionStrength={distortionStrength}
              baseDim={baseDim}
              tiling={tiling}
              crossWidth={crossWidth}
              crossThickness={crossThickness}
              crossRadius={crossRadius}
              scanTarget={scanTarget}
              scanDuration={scanDuration}
              maskColor={maskColor}
            />
          </WebGPUCanvas>
        </div>
      </div>
    </LoadingContext.Provider>
  );
}
