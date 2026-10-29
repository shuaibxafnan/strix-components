"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveRepulsionGrid({
  imageUrl = "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1080&q=80",
  baseGridSize = 30,
  baseDotRadius = 1,
  mouseProximity = 125,
  maxGrowthAmt = 60,
  easeValue = 0.075,
  bgColorClass = "bg-[#1a1a1a]",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Local component-scoped point logic matching vector classes
  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  class Circle {
    constructor(radius, x, y) {
      this._radius = radius;
      this.radius = radius;
      this.growthValue = 0;
      this.position = new Point(x, y);
    }

    draw(context, ease) {
      this.radius += (this._radius + this.growthValue - this.radius) * ease;
      context.moveTo(this.position.x, this.position.y);
      context.arc(
        this.position.x,
        this.position.y,
        this.radius,
        0,
        2 * Math.PI,
      );
    }

    addRadius(value) {
      this.growthValue = value;
    }

    get x() {
      return this.position.x;
    }
    get y() {
      return this.position.y;
    }
  }

  // Linear mathematical utility functions for coordinate manipulation
  const normalize = (value, min, max) => (value - min) / (max - min);
  const interpolate = (value, min, max) => min + (max - min) * value;
  const mapValue = (value, min1, max1, min2, max2) =>
    interpolate(normalize(value, min1, max1), min2, max2);

  const findPreferredRatio = (width, height, maxWidth, maxHeight) => {
    let dw = maxWidth / width;
    let dh = maxHeight / height;
    return dw > dh ? dw : dh;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    let circles = [];
    let imageLoaded = false;
    const image = new Image();
    let animationFrameId;

    const buildGrid = () => {
      circles = [];
      const columns = Math.ceil(window.innerWidth / baseGridSize) + 1;
      const rows = Math.ceil(window.innerHeight / baseGridSize) + 1;
      const totalCircles = columns * rows;

      for (let i = 0; i < totalCircles; i++) {
        const column = i % columns;
        const row = Math.floor(i / columns);
        circles.push(
          new Circle(baseDotRadius, baseGridSize * column, baseGridSize * row),
        );
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildGrid();
    };

    const proximityHandler = (clientX, clientY) => {
      for (let c of circles) {
        let distance = Math.sqrt(
          Math.pow(c.x - clientX, 2) + Math.pow(c.y - clientY, 2),
        );
        let d = mapValue(
          distance,
          c._radius,
          c._radius + mouseProximity,
          maxGrowthAmt,
          0,
        );
        if (d < 0) d = 0;
        c.addRadius(d);
      }
    };

    const handleMouseMove = (e) => proximityHandler(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        proximityHandler(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const drawImage = () => {
      context.clip();
      const { naturalHeight, naturalWidth } = image;
      const ratio = findPreferredRatio(
        naturalWidth,
        naturalHeight,
        window.innerWidth,
        window.innerHeight,
      );
      const w = naturalWidth * ratio;
      const h = naturalHeight * ratio;
      const x = window.innerWidth / 2 - w / 2;
      const y = window.innerHeight / 2 - h / 2;
      context.drawImage(image, 0, 0, naturalWidth, naturalHeight, x, y, w, h);
    };

    const renderLoop = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.save();
      context.beginPath();
      context.fillStyle = "#000000";

      for (let circle of circles) {
        circle.draw(context, easeValue);
      }

      if (imageLoaded) {
        drawImage();
      } else {
        context.fill();
      }

      context.restore();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Initialize asset routines
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    handleResize();

    image.onload = () => {
      imageLoaded = true;
    };
    image.src = imageUrl;

    renderLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isClient,
    imageUrl,
    baseGridSize,
    baseDotRadius,
    mouseProximity,
    maxGrowthAmt,
    easeValue,
  ]);

  if (!isClient) {
    return <div className={`w-full h-screen ${bgColorClass}`} />;
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen relative overflow-hidden select-none ${bgColorClass}`}
    >
      {/* Interactive Vector Masking Surface */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Premium Rotating Graphic Identity Badge */}
      <div className="absolute right-[6vmax] top-[6vmax] flex flex-col items-center justify-center z-20"></div>
    </div>
  );
}
