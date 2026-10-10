"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ThreeDRainbowCanvas Component
 *
 * Props:
 * - bgColor: string (Background viewport color wrapper)
 * - zoomFactor: number (Initial camera render zoom step)
 * - initialXRotation: number (Default X axis slant angle)
 * - initialYRotation: number (Default Y axis slant angle)
 * - baseRainbowDiameter: number (Width scale of outer rainbow band)
 * - strokeThickness: number (Line stroke size width for arcs)
 * - spinningSpeed: number (Automatic idle angular velocity multiplier)
 */
export default function ThreeDRainbowCanvas({
  bgColor = "#FABEF2",
  zoomFactor = 0.5,
  initialXRotation = -0.2225,
  initialYRotation = -202.39,
  baseRainbowDiameter = 400,
  strokeThickness = 30,
  spinningSpeed = 0.02,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef(null);
  const isSpinningRef = useRef(true);

  useEffect(() => {
    setIsMounted(true);

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () =>
          reject(new Error(`Failed to script load package: ${src}`));
        document.head.appendChild(el);
      });

    // Zdog CDN production release package script load
    loadScript("https://unpkg.com/zdog@1/dist/zdog.dist.min.js")
      .then(() => {
        const Zdog = window.Zdog;
        if (!Zdog || !canvasRef.current) return;

        // Custom Hex Theme Color Space Maps
        const red = "#f25774";
        const orange = "#ffb65b";
        const yellow = "#fdda74";
        const green = "#4cbe5d";
        const blue = "#4080ff";
        const purple = "#7b64c0";

        // Global Illustration Framework Init Anchor
        const illo = new Zdog.Illustration({
          element: canvasRef.current,
          dragRotate: true,
          zoom: zoomFactor,
          onDragStart: () => {
            isSpinningRef.current = false;
          },
          onDragEnd: () => {
            isSpinningRef.current = true;
          },
          rotate: { x: initialXRotation, y: initialYRotation },
        });

        // Nesting Ring 1: Red Arc
        const rectRed = new Zdog.Ellipse({
          addTo: illo,
          diameter: baseRainbowDiameter,
          quarters: 2,
          stroke: strokeThickness,
          color: red,
          rotate: { x: Zdog.TAU / 2, z: Zdog.TAU / 4 },
          translate: { y: 100 },
        });

        // Nesting Ring 2: Orange Arc
        const rectOrange = rectRed.copy({
          addTo: rectRed,
          diameter: baseRainbowDiameter - 1 - strokeThickness * 2,
          rotate: null,
          color: orange,
          translate: null,
        });

        // Nesting Ring 3: Yellow Arc
        rectOrange.copy({
          addTo: rectOrange,
          diameter: baseRainbowDiameter - 1 - strokeThickness * 4,
          color: yellow,
        });

        // Nesting Ring 4: Green Arc
        rectOrange.copy({
          addTo: rectOrange,
          diameter: baseRainbowDiameter - 1 - strokeThickness * 6,
          color: green,
        });

        // Nesting Ring 5: Blue Arc
        rectOrange.copy({
          addTo: rectOrange,
          diameter: baseRainbowDiameter - 1 - strokeThickness * 8,
          color: blue,
        });

        // Nesting Ring 6: Purple Arc
        rectOrange.copy({
          addTo: rectOrange,
          diameter: baseRainbowDiameter - 1 - strokeThickness * 10,
          color: purple,
        });

        // Compound Geometric Structure: Left Cloud Node Assembly
        const cloud1 = new Zdog.Shape({
          addTo: illo,
          translate: { x: -160, y: -120, z: -150 },
          stroke: 120,
          color: "#F5F5F3",
        });

        cloud1.copy({
          addTo: cloud1,
          translate: { x: -30, y: 10, z: 10 },
          stroke: 96,
          color: "#FAFAF8",
        });

        cloud1.copy({
          addTo: cloud1,
          translate: { x: 50, y: 10 },
          stroke: 70,
          color: "#FAFAF8",
        });

        cloud1.copy({
          addTo: cloud1,
          translate: { x: 0, z: 20 },
          stroke: 96,
          color: "#F5F5F3",
        });

        // Compound Geometric Structure Clone: Right Cloud Node Assembly
        cloud1.copyGraph({
          translate: { x: 140, y: -60, z: 150 },
        });

        let animationFrameId;

        // Vector Render Engine Animation Frame Tick Processing Setup
        const renderLoop = () => {
          illo.rotate.y -= isSpinningRef.current ? spinningSpeed : 0;
          illo.updateRenderGraph();
          animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () => {
          cancelAnimationFrame(animationFrameId);
        };
      })
      .catch((err) =>
        console.error(
          "[ThreeDRainbowCanvas] Zdog loader setup initialization error:",
          err.message,
        ),
      );
  }, [
    bgColor,
    zoomFactor,
    initialXRotation,
    initialYRotation,
    baseRainbowDiameter,
    strokeThickness,
    spinningSpeed,
  ]);

  if (!isMounted) {
    return (
      <div
        className="w-full min-h-screen"
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center m-0 overflow-hidden select-none"
      style={{ backgroundColor: bgColor }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        className="cursor-move block max-w-full h-auto active:cursor-grabbing"
      />
    </div>
  );
}
