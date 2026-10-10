"use client";

import { useEffect, useRef, useState } from "react";

// ─── FireflyCanvas ───────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// maxFireflies    number    100        Total concurrent firefly instances
// spawnRate       number    5          Amount of new fireflies added per pass
// fireflyColor    string    #fddba3    Hex/RGB color code of particles
// blurAmount      string    blur-[1px] Custom Tailwind blur modifier for canvas
// bgImage         string    url(...)   Background cover graphic URL
// trailLength     number    6          Number of trail segments per firefly
// ──────────────────────────────────────────────────────────────────────────

export default function FireflyCanvas({
  maxFireflies = 100,
  spawnRate = 5,
  fireflyColor = "#fddba3",
  blurAmount = "blur-[1px]",
  bgImage = "https://external-preview.redd.it/Tf2MC-orVRAI8OL5tjyF4k4H2Q6QLHTWllekGfqdt3c.png?width=960&crop=smart&auto=webp&s=be4ab9a2fa3ca2f7011799377f118a8dbc64aacb",
  trailLength = 6,
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

    // ─── OOP Particle Definition with Transparent Trails ──────────────────────
    class Firefly {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.s = Math.random() * 2;
        this.ang = Math.random() * 2 * Math.PI;
        this.v = (this.s * this.s) / 4;

        // Track historical coordinates for rendering ghost trails
        this.history = [];
      }

      move() {
        // Record current position into history cache before mutating coordinates
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > trailLength) {
          this.history.shift();
        }

        this.x += this.v * Math.cos(this.ang);
        this.y += this.v * Math.sin(this.ang);
        this.ang += (Math.random() * 20 * Math.PI) / 180 - (10 * Math.PI) / 180;
      }

      show() {
        // 1. Draw older tracking history paths (Fading Trails)
        for (let i = 0; i < this.history.length; i++) {
          const pos = this.history[i];
          const opacity = ((i + 1) / this.history.length) * 0.4; // Fades out older segments

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, this.s * 0.8, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(253, 219, 163, ${opacity})`;
          ctx.fill();
        }

        // 2. Draw active lead node head particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
        ctx.fillStyle = fireflyColor;
        ctx.fill();
      }
    }

    let fireflies = [];

    // ─── Main Render Pipeline Loop ───────────────────────────────────────────
    const renderLoop = () => {
      // CLEAR TO TRANSPARENT: This ensures the DOM background image stays visible!
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
    return <div className="fixed inset-0 bg-neutral-950" />;
  }

  return (
    <div
      className="fixed inset-0 w-full h-screen m-0 p-0 bg-cover bg-center overflow-hidden touch-none select-none"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <canvas ref={canvasRef} className={`w-full h-full block ${blurAmount}`} />
    </div>
  );
}
