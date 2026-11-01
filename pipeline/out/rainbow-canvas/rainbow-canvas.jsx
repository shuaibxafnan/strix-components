"use client";

import { useEffect, useRef } from "react";

export default function RainbowCanvas({
  bgColor = "#FABEF2",
  rainbowColors = ["#f25774", "#ffb65b", "#fdda74", "#4cbe5d", "#4080ff", "#7b64c0"],
  cloudColors = ["#F5F5F3", "#FAFAF8"],
  zoomFactor = 0.5,
  initialXRotation = -0.2225,
  initialYRotation = -202.39,
  baseRainbowDiameter = 400,
  strokeThickness = 30,
  spinningSpeed = 0.02,
  className = "",
}) {
  const canvasRef = useRef(null);
  const isSpinningRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    let animationFrameId;

    import("zdog").then((mod) => {
      const Zdog = mod.default || mod;
      if (cancelled || !canvasRef.current) return;

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

      const rectRed = new Zdog.Ellipse({
        addTo: illo,
        diameter: baseRainbowDiameter,
        quarters: 2,
        stroke: strokeThickness,
        color: rainbowColors[0],
        rotate: { x: Zdog.TAU / 2, z: Zdog.TAU / 4 },
        translate: { y: 100 },
      });

      const rectOrange = rectRed.copy({
        addTo: rectRed,
        diameter: baseRainbowDiameter - 1 - strokeThickness * 2,
        rotate: null,
        color: rainbowColors[1],
        translate: null,
      });

      for (let i = 2; i < rainbowColors.length; i++) {
        rectOrange.copy({
          addTo: rectOrange,
          diameter: baseRainbowDiameter - 1 - strokeThickness * i * 2,
          color: rainbowColors[i],
        });
      }

      const cloud1 = new Zdog.Shape({
        addTo: illo,
        translate: { x: -160, y: -120, z: -150 },
        stroke: 120,
        color: cloudColors[0],
      });

      cloud1.copy({
        addTo: cloud1,
        translate: { x: -30, y: 10, z: 10 },
        stroke: 96,
        color: cloudColors[1],
      });

      cloud1.copy({
        addTo: cloud1,
        translate: { x: 50, y: 10 },
        stroke: 70,
        color: cloudColors[1],
      });

      cloud1.copy({
        addTo: cloud1,
        translate: { x: 0, z: 20 },
        stroke: 96,
        color: cloudColors[0],
      });

      cloud1.copyGraph({
        translate: { x: 140, y: -60, z: 150 },
      });

      const renderLoop = () => {
        illo.rotate.y -= isSpinningRef.current ? spinningSpeed : 0;
        illo.updateRenderGraph();
        animationFrameId = requestAnimationFrame(renderLoop);
      };

      renderLoop();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    rainbowColors,
    cloudColors,
    zoomFactor,
    initialXRotation,
    initialYRotation,
    baseRainbowDiameter,
    strokeThickness,
    spinningSpeed,
  ]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden select-none ${className}`}
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
