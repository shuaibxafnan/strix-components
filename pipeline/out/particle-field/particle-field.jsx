"use client";

import { useEffect, useRef } from "react";

export default function ParticleField({
  maxPop = 300,
  birthFreq = 2,
  lifespan = 1000,
  gridSize = 8,
  zoom = 1.6,
  particleColor = "hue",
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let width = canvas.width;
    let height = canvas.height;
    let xC = width / 2;
    let yC = height / 2;

    ctx.imageSmoothingEnabled = false;

    let stepCount = 0;
    let particles = [];
    let deathCount = 0;
    let drawnInLastFrame = 0;
    const popPerBirth = 1;

    const gridSteps = Math.floor(1000 / gridSize);
    const grid = [];
    let gridIndex = 0;

    for (let xx = -500; xx < 500; xx += gridSize) {
      for (let yy = -500; yy < 500; yy += gridSize) {
        const r = Math.sqrt(xx * xx + yy * yy);
        const r0 = 100;
        let field;

        if (r < r0) {
          field = (255 / r0) * r;
        } else {
          field = 255 - Math.min(255, (r - r0) / 2);
        }

        const isEdge =
          xx === -500
            ? "left"
            : xx === -500 + gridSize * (gridSteps - 1)
              ? "right"
              : yy === -500
                ? "top"
                : yy === -500 + gridSize * (gridSteps - 1)
                  ? "bottom"
                  : false;

        grid.push({
          x: xx,
          y: yy,
          busyAge: 0,
          spotIndex: gridIndex,
          isEdge: isEdge,
          field: field,
        });
        gridIndex++;
      }
    }
    const gridMaxIndex = gridIndex;

    const dataXYtoCanvasXY = (x, y) => {
      const xx = xC + x * zoom;
      const yy = yC + y * zoom;
      return { x: xx, y: yy };
    };

    const birth = () => {
      const gridSpotIndex = Math.floor(Math.random() * gridMaxIndex);
      const gridSpot = grid[gridSpotIndex];
      if (!gridSpot) return;

      const particle = {
        hue: 200,
        sat: 95,
        lum: 20 + Math.floor(40 * Math.random()),
        x: gridSpot.x,
        y: gridSpot.y,
        xLast: gridSpot.x,
        yLast: gridSpot.y,
        xSpeed: 0,
        ySpeed: 0,
        age: 0,
        ageSinceStuck: 0,
        attractor: {
          oldIndex: gridSpotIndex,
          gridSpotIndex: gridSpotIndex,
        },
        name: "seed-" + Math.ceil(10000000 * Math.random()),
      };
      particles.push(particle);
    };

    const kill = (particleName) => {
      particles = particles.filter((seed) => seed.name !== particleName);
    };

    const move = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.xLast = p.x;
        p.yLast = p.y;

        const index = p.attractor.gridSpotIndex;
        let gridSpot = grid[index];

        if (Math.random() < 0.5) {
          if (gridSpot && !gridSpot.isEdge) {
            const topIndex = index - 1;
            const bottomIndex = index + 1;
            const leftIndex = index - gridSteps;
            const rightIndex = index + gridSteps;

            const neighbors = [
              grid[topIndex],
              grid[bottomIndex],
              grid[leftIndex],
              grid[rightIndex],
            ].filter(Boolean);

            const chaos = 30;
            let maxFieldSpot = neighbors[0];
            let maxVal = -Infinity;
            for (let n = 0; n < neighbors.length; n++) {
              const val = neighbors[n].field + chaos * Math.random();
              if (val > maxVal) {
                maxVal = val;
                maxFieldSpot = neighbors[n];
              }
            }

            const potentialNewGridSpot = maxFieldSpot;
            if (
              potentialNewGridSpot &&
              (potentialNewGridSpot.busyAge === 0 ||
                potentialNewGridSpot.busyAge > 15)
            ) {
              p.ageSinceStuck = 0;
              p.attractor.oldIndex = index;
              p.attractor.gridSpotIndex = potentialNewGridSpot.spotIndex;
              gridSpot = potentialNewGridSpot;
              gridSpot.busyAge = 1;
            } else {
              p.ageSinceStuck++;
            }
          } else {
            p.ageSinceStuck++;
          }

          if (p.ageSinceStuck === 10) {
            kill(p.name);
            continue;
          }
        }

        if (gridSpot) {
          const k = 8;
          const visc = 0.4;
          const dx = p.x - gridSpot.x;
          const dy = p.y - gridSpot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const xAcc = -k * dx;
          const yAcc = -k * dy;

          p.xSpeed += xAcc;
          p.ySpeed += yAcc;
          p.xSpeed *= visc;
          p.ySpeed *= visc;

          p.speed = Math.sqrt(p.xSpeed * p.xSpeed + p.ySpeed * p.ySpeed);
          p.dist = dist;

          p.x += 0.1 * p.xSpeed;
          p.y += 0.1 * p.ySpeed;
        }

        p.age++;

        if (p.age > lifespan) {
          kill(p.name);
          deathCount++;
        }
      }
    };

    const draw = () => {
      drawnInLastFrame = 0;
      if (!particles.length) return;

      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fill();
      ctx.closePath();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const h =
          particleColor === "hue" ? p.hue + stepCount / 30 : particleColor;
        const s = p.sat;
        const l = p.lum;
        const a = 1;

        const last = dataXYtoCanvasXY(p.xLast, p.yLast);
        const now = dataXYtoCanvasXY(p.x, p.y);

        const attracSpot = grid[p.attractor.gridSpotIndex];
        const oldAttracSpot = grid[p.attractor.oldIndex];

        if (!attracSpot || !oldAttracSpot) continue;

        const attracXY = dataXYtoCanvasXY(attracSpot.x, attracSpot.y);
        const oldAttracXY = dataXYtoCanvasXY(oldAttracSpot.x, oldAttracSpot.y);

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(now.x, now.y);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.moveTo(oldAttracXY.x, oldAttracXY.y);
        ctx.lineTo(attracXY.x, attracXY.y);
        ctx.arc(attracXY.x, attracXY.y, 1.5, 0, 2 * Math.PI, false);
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        drawnInLastFrame++;
      }
    };

    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    const evolve = () => {
      stepCount++;

      grid.forEach((e) => {
        if (e.busyAge > 0) e.busyAge++;
      });

      if (
        stepCount % birthFreq === 0 &&
        particles.length + popPerBirth < maxPop
      ) {
        birth();
      }

      move();
      draw();
    };

    const frame = () => {
      evolve();
      requestRef.current = requestAnimationFrame(frame);
    };

    requestRef.current = requestAnimationFrame(frame);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      width = canvas.width;
      height = canvas.height;
      xC = width / 2;
      yC = height / 2;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [maxPop, birthFreq, lifespan, gridSize, zoom, particleColor]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-black ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}
