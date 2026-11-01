"use client";

import { useEffect, useRef } from "react";

export default function ImageGridDisplacement({
  imageUrl = "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1200&q=80",
  canvasWidth = 384,
  canvasHeight = 512,
  columns = 35,
  rows = 55,
  mouseRadius = 70,
  easeFactor = 12,
  borderColor = "border-black",
  className = "",
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
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
      const sx = canvasWidth / (canvasPosition.width || canvasWidth);
      const sy = canvasHeight / (canvasPosition.height || canvasHeight);
      mouse.x = (e.clientX - canvasPosition.left) * sx;
      mouse.y = (e.clientY - canvasPosition.top) * sy;

      const newStep = mouse.stepCounter + 1;
      mouse.moving = newStep !== mouse.stepCounter;
      mouse.stepCounter = newStep;
    };

    const handleMouseLeave = () => {
      mouse.x = undefined;
      mouse.y = undefined;
      mouse.moving = false;
    };

    const handleTouchMove = (e) => {
      const t = e.touches[0];
      if (t) handleMouseMove(t);
    };

    const handleResize = () => {
      canvasPosition = canvas.getBoundingClientRect();
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const imageGrid = [];
    const myImage = new Image();
    myImage.src = imageUrl;

    const cellWidth = canvasWidth / columns;
    const cellHeight = canvasHeight / rows;

    class Cell {
      constructor(x, y) {
        this.x = x;
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
      window.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    imageUrl,
    canvasWidth,
    canvasHeight,
    columns,
    rows,
    mouseRadius,
    easeFactor,
  ]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`border-3 bg-cover bg-center max-w-full ${borderColor}`}
        style={{
          width: `${canvasWidth}px`,
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          height: "auto",
        }}
      />
    </div>
  );
}
