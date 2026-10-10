"use client";

import { useEffect, useRef, useState } from "react";

// ─── ImageGridDisplacement ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// imageUrl       string  "https://..."  Primary interactive image sliced onto grid cells
// fallbackBgUrl  string  "https://..."  CSS background fallback element behind canvas
// canvasWidth    number  384            Core width canvas resolution profile in pixels
// canvasHeight   number  512            Core height canvas resolution profile in pixels
// columns        number  35             Horizontal slice resolution mapping count
// rows           number  55             Vertical slice resolution mapping count
// mouseRadius    number  70             Interaction radius tracking proximity vector boundaries
// easeFactor     number  12             Damping friction applied during return animation loops
// borderColor    string  "border-black" Tailwind utility configuration for canvas perimeter borders
// ──────────────────────────────────────────────────────────────────────────

export default function ImageGridDisplacement({
  imageUrl = "https://ik.imagekit.io/akiAfnan/dinousar.jpg",
  fallbackBgUrl = "https://i.ibb.co/DWx6NW3/my-image.jpg",
  canvasWidth = 384,
  canvasHeight = 512,
  columns = 35,
  rows = 55,
  mouseRadius = 70,
  easeFactor = 12,
  borderColor = "border-black",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const mouse = {
      x: undefined,
      y: undefined,
      radius: mouseRadius,
      moving: false,
      stepCounter: 0,
    };

    let canvasPosition = canvas.getBoundingClientRect();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX - canvasPosition.left;
      mouse.y = e.clientY - canvasPosition.top;

      const newStep = mouse.stepCounter + 1;
      mouse.moving = newStep !== mouse.stepCounter;
      mouse.stepCounter = newStep;
    };

    const handleMouseLeave = () => {
      mouse.x = undefined;
      mouse.y = undefined;
      mouse.moving = false;
    };

    const handleResize = () => {
      canvasPosition = canvas.getBoundingClientRect();
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const imageGrid = [];
    const myImage = new Image();
    myImage.src = imageUrl;

    const cellWidth = canvasWidth / columns;
    const cellHeight = canvasHeight / rows;

    class Cell {
      constructor(x, y) {
        Lorax: this.x = x;
        this.y = y;
        this.width = cellWidth;
        this.height = cellHeight;
        this.baseX = x;
        this.baseY = y;
        this.drawOffsetX = 0;
        this.drawOffsetY = 0;
      }

      update() {
        if (mouse.x === undefined || mouse.y === undefined) {
          if (this.drawOffsetX !== 0)
            this.drawOffsetX -= this.drawOffsetX / easeFactor;
          if (this.drawOffsetY !== 0)
            this.drawOffsetY -= this.drawOffsetY / easeFactor;
          return;
        }

        const dx = mouse.x - (this.x + this.width / 2);
        const dy = mouse.y - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (
          distance < mouse.radius &&
          this.drawOffsetX < cellWidth &&
          this.drawOffsetX > -cellWidth &&
          this.drawOffsetY < cellHeight &&
          this.drawOffsetY > -cellHeight &&
          mouse.moving
        ) {
          this.drawOffsetX -= dx;
          this.drawOffsetY -= dy;
        } else {
          if (this.drawOffsetX !== 0)
            this.drawOffsetX -= this.drawOffsetX / easeFactor;
          if (this.drawOffsetY !== 0)
            this.drawOffsetY -= this.drawOffsetY / easeFactor;
        }
      }

      draw() {
        ctx.drawImage(
          myImage,
          this.x + this.drawOffsetX,
          this.y + this.drawOffsetY,
          cellWidth,
          cellHeight,
          this.x,
          this.y,
          cellWidth,
          cellHeight,
        );
      }
    }

    function init() {
      imageGrid.length = 0;
      for (let y = 0; y < canvasHeight; y += cellHeight) {
        for (let x = 0; x < canvasWidth; x += cellWidth) {
          imageGrid.push(new Cell(x, y));
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      for (let i = 0; i < imageGrid.length; i++) {
        imageGrid[i].update();
        imageGrid[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    myImage.addEventListener("load", () => {
      init();
      animate();
    });

    if (myImage.complete) {
      init();
      animate();
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isClient,
    imageUrl,
    canvasWidth,
    canvasHeight,
    columns,
    rows,
    mouseRadius,
    easeFactor,
  ]);

  if (!isClient) {
    return (
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900"
        style={{ width: canvasWidth, height: canvasHeight }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`border-3 bg-cover bg-center ${borderColor}`}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          backgroundImage: `url('${fallbackBgUrl}')`,
        }}
      />
    </div>
  );
}
