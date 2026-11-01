"use client";

import { useEffect, useRef, useState } from "react";

export default function FireflyCanvas({
  maxFireflies = 100,
  spawnRate = 5,
  fireflyColor = "#fddba3",
  blurAmount = "blur-[1px]",
  bgImage = "https://images.unsplash.com/photo-1589848315097-ba7b903cc1cc?q=80&w=1920&auto=format&fit=crop",
  trailLength = 6,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    class Firefly {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.s = Math.random() * 2;
        this.ang = Math.random() * 2 * Math.PI;
        this.v = (this.s * this.s) / 4;

        this.history = [];
      }

      move() {

        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > trailLength) {
          this.history.shift();
        }

        this.x += this.v * Math.cos(this.ang);
        this.y += this.v * Math.sin(this.ang);
        this.ang += (Math.random() * 20 * Math.PI) / 180 - (10 * Math.PI) / 180;
      }

      show() {

        for (let i = 0; i < this.history.length; i++) {
          const pos = this.history[i];
          const opacity = ((i + 1) / this.history.length) * 0.4;

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, this.s * 0.8, 0, 2 * Math.PI);
          ctx.globalAlpha = opacity;
          ctx.fillStyle = fireflyColor;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
        ctx.fillStyle = fireflyColor;
        ctx.fill();
      }
    }

    let fireflies = [];

    const renderLoop = () => {

      ctx.clearRect(0, 0, w, h);

      if (fireflies.length < maxFireflies) {
        for (let j = 0; j < spawnRate; j++) {
          fireflies.push(new Firefly());
        }
      }

      for (let i = fireflies.length - 1; i >= 0; i--) {
        const fly = fireflies[i];
        fly.move();
        fly.show();

        if (fly.x < 0 || fly.x > w || fly.y < 0 || fly.y > h) {
          fireflies.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted, maxFireflies, spawnRate, fireflyColor, trailLength]);

  if (!mounted) {
    return <div className={`fixed inset-0 bg-neutral-950 ${className}`} />;
  }

  return (
    <div
      className={`fixed inset-0 w-full h-screen m-0 p-0 bg-cover bg-center overflow-hidden touch-none select-none ${className}`}
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <canvas ref={canvasRef} className={`w-full h-full block ${blurAmount}`} />
    </div>
  );
}
