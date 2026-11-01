"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveStarField({
  starColor = "#fff",
  starSize = 3,
  starMinScale = 0.2,
  overflowThreshold = 50,
  baseVelocityZ = 0.0005,
  friction = 0.96,
  easeFactor = 0.8,
  customStarCount = null,
  backgroundColor = "#000000",
  className = "",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    let scale = 1;
    let width = 0;
    let height = 0;
    let stars = [];
    let pointerX = null;
    let pointerY = null;
    let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: baseVelocityZ };
    let touchInput = false;
    let animationFrameId;

    const starCount =
      customStarCount ||
      Math.floor((window.innerWidth + window.innerHeight) / 8);

    function generate() {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: 0,
          y: 0,
          z: starMinScale + Math.random() * (1 - starMinScale),
        });
      }
    }

    function placeStar(star) {
      star.x = Math.random() * width;
      star.y = Math.random() * height;
    }

    function recycleStar(star) {
      let direction = "z";
      let vx = Math.abs(velocity.x);
      let vy = Math.abs(velocity.y);

      if (vx > 1 || vy > 1) {
        let axis =
          vx > vy
            ? Math.random() < vx / (vx + vy)
              ? "h"
              : "v"
            : Math.random() < vy / (vx + vy)
              ? "v"
              : "h";

        if (axis === "h") {
          direction = velocity.x > 0 ? "l" : "r";
        } else {
          direction = velocity.y > 0 ? "t" : "b";
        }
      }

      star.z = starMinScale + Math.random() * (1 - starMinScale);

      if (direction === "z") {
        star.z = 0.1;
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      } else if (direction === "l") {
        star.x = -overflowThreshold;
        star.y = height * Math.random();
      } else if (direction === "r") {
        star.x = width + overflowThreshold;
        star.y = height * Math.random();
      } else if (direction === "t") {
        star.x = width * Math.random();
        star.y = -overflowThreshold;
      } else if (direction === "b") {
        star.x = width * Math.random();
        star.y = height + overflowThreshold;
      }
    }

    function resize() {
      scale = window.devicePixelRatio || 1;

      if (containerRef.current) {
        width = containerRef.current.clientWidth * scale;
        height = containerRef.current.clientHeight * scale;
      } else {
        width = window.innerWidth * scale;
        height = window.innerHeight * scale;
      }

      canvas.width = width;
      canvas.height = height;

      stars.forEach(placeStar);
    }

    function update() {
      velocity.tx *= friction;
      velocity.ty *= friction;

      velocity.x += (velocity.tx - velocity.x) * easeFactor;
      velocity.y += (velocity.ty - velocity.y) * easeFactor;

      stars.forEach((star) => {
        star.x += velocity.x * star.z;
        star.y += velocity.y * star.z;

        star.x += (star.x - width / 2) * velocity.z * star.z;
        star.y += (star.y - height / 2) * velocity.z * star.z;
        star.z += velocity.z;

        if (
          star.x < -overflowThreshold ||
          star.x > width + overflowThreshold ||
          star.y < -overflowThreshold ||
          star.y > height + overflowThreshold
        ) {
          recycleStar(star);
        }
      });
    }

    function render() {
      stars.forEach((star) => {
        context.beginPath();
        context.lineCap = "round";
        context.lineWidth = starSize * star.z * scale;
        context.globalAlpha = 0.5 + 0.5 * Math.random();
        context.strokeStyle = starColor;

        context.moveTo(star.x, star.y);

        let tailX = velocity.x * 2;
        let tailY = velocity.y * 2;

        if (Math.abs(tailX) < 0.1) tailX = 0.5;
        if (Math.abs(tailY) < 0.1) tailY = 0.5;

        context.lineTo(star.x + tailX, star.y + tailY);
        context.stroke();
      });
    }

    function step() {
      context.clearRect(0, 0, width, height);
      update();
      render();
      animationFrameId = requestAnimationFrame(step);
    }

    function movePointer(x, y) {
      if (typeof pointerX === "number" && typeof pointerY === "number") {
        let ox = x - pointerX;
        let oy = y - pointerY;

        velocity.tx = velocity.tx + (ox / (8 * scale)) * (touchInput ? 1 : -1);
        velocity.ty = velocity.ty + (oy / (8 * scale)) * (touchInput ? 1 : -1);
      }
      pointerX = x;
      pointerY = y;
    }

    function onMouseMove(event) {
      touchInput = false;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        movePointer(event.clientX - rect.left, event.clientY - rect.top);
      } else {
        movePointer(event.clientX, event.clientY);
      }
    }

    function onTouchMove(event) {
      touchInput = true;
      if (event.touches[0]) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          movePointer(
            event.touches[0].clientX - rect.left,
            event.touches[0].clientY - rect.top,
          );
        } else {
          movePointer(event.touches[0].clientX, event.touches[0].clientY);
        }
      }
      if (event.cancelable) event.preventDefault();
    }

    function onMouseLeave() {
      pointerX = null;
      pointerY = null;
    }

    generate();
    resize();
    step();

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onMouseLeave);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onMouseLeave);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [
    mounted,
    starColor,
    starSize,
    starMinScale,
    overflowThreshold,
    baseVelocityZ,
    friction,
    easeFactor,
    customStarCount,
  ]);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor }}
      className={`fixed inset-0 w-full h-screen overflow-hidden touch-none select-none bg-[radial-gradient(circle_at_top_right,rgba(121,68,154,0.13),transparent),radial-gradient(circle_at_20%_80%,rgba(41,196,255,0.13),transparent)] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
