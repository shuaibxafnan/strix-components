"use client";

import { useEffect, useRef, useState } from "react";

export default function BlackHolePortal({
  maxOrbit = 255,
  starCount = 2500,
  spaceBgColor = "#191919",
  enterTextColor = "#666666",
  enterHoverColor = "#DDDDDD",
  expansionSecs = 25,
  recoverySecs = 8,
  enterLabel = "ENTER",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({
    collapse: false,
    expanse: false,
    returning: false,
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    let disposed = false;
    let animationFrameId;
    {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        const h = container.offsetHeight || 600;
        const w = container.offsetWidth || 800;
        const cw = w;
        const ch = h;
        const centery = ch / 2;
        const centerx = cw / 2;

        const startTime = new Date().getTime();
        let currentTime = 0;
        const stars = [];

        canvas.width = cw;
        canvas.height = ch;
        context.globalCompositeOperation = "multiply";

        const setDPI = (targetCanvas, dpi) => {
          if (!targetCanvas.style.width)
            targetCanvas.style.width = targetCanvas.width + "px";
          if (!targetCanvas.style.height)
            targetCanvas.style.height = targetCanvas.height + "px";

          const scaleFactor = dpi / 96;
          targetCanvas.width = Math.ceil(targetCanvas.width * scaleFactor);
          targetCanvas.height = Math.ceil(targetCanvas.height * scaleFactor);
          const ctx = targetCanvas.getContext("2d");
          ctx.scale(scaleFactor, scaleFactor);
        };
        setDPI(canvas, 192);

        const rotate = (cx, cy, x, y, angle) => {
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const nx = cos * (x - cx) + sin * (y - cy) + cx;
          const ny = cos * (y - cy) - sin * (x - cx) + cy;
          return [nx, ny];
        };

        class Star {
          constructor() {
            const rands = [
              Math.random() * (maxOrbit / 2) + 1,
              Math.random() * (maxOrbit / 2) + maxOrbit,
            ];
            this.orbital = rands.reduce((p, c) => p + c, 0) / rands.length;

            this.x = centerx;
            this.y = centery + this.orbital;
            this.yOrigin = centery + this.orbital;

            this.speed =
              ((Math.floor(Math.random() * 2.5) + 1.5) * Math.PI) / 180;
            this.rotation = 0;
            this.startRotation =
              ((Math.floor(Math.random() * 360) + 1) * Math.PI) / 180;

            this.id = stars.length;
            this.collapseBonus = this.orbital - maxOrbit * 0.7;
            if (this.collapseBonus < 0) this.collapseBonus = 0;

            this.color = `rgba(255,255,255,${1 - this.orbital / 255})`;
            this.hoverPos = centery + maxOrbit / 2 + this.collapseBonus;
            this.expansePos =
              centery +
              (this.id % 100) * -10 +
              (Math.floor(Math.random() * 20) + 1);

            this.prevR = this.startRotation;
            this.prevX = this.x;
            this.prevY = this.y;
            this.originalY = this.yOrigin;

            stars.push(this);
          }

          draw() {
            const { collapse, expanse, returning } = stateRef.current;

            if (!expanse && !returning) {
              this.rotation = this.startRotation + currentTime * this.speed;
              if (!collapse) {
                if (this.y > this.yOrigin) this.y -= 2.5;
                if (this.y < this.yOrigin - 4)
                  this.y += (this.yOrigin - this.y) / 10;
              } else {
                if (this.y > this.hoverPos)
                  this.y -= (this.hoverPos - this.y) / -5;
                if (this.y < this.hoverPos - 4) this.y += 2.5;
              }
            } else if (expanse && !returning) {
              this.rotation =
                this.startRotation + currentTime * (this.speed / 2);
              if (this.y > this.expansePos)
                this.y -= Math.floor(this.expansePos - this.y) / -80;
            } else if (returning) {
              this.rotation = this.startRotation + currentTime * this.speed;
              if (Math.abs(this.y - this.originalY) > 2) {
                this.y += (this.originalY - this.y) / 50;
              } else {
                this.y = this.originalY;
                this.yOrigin = this.originalY;
              }
            }

            context.save();
            context.fillStyle = this.color;
            context.strokeStyle = this.color;
            context.beginPath();
            const oldPos = rotate(
              centerx,
              centery,
              this.prevX,
              this.prevY,
              -this.prevR,
            );
            context.moveTo(oldPos[0], oldPos[1]);
            context.translate(centerx, centery);
            context.rotate(this.rotation);
            context.translate(-centerx, -centery);
            context.lineTo(this.x, this.y);
            context.stroke();
            context.restore();

            this.prevR = this.rotation;
            this.prevX = this.x;
            this.prevY = this.y;
          }
        }

        context.fillStyle = spaceBgColor;
        context.fillRect(0, 0, cw, ch);
        for (let i = 0; i < starCount; i++) {
          new Star();
        }

        const renderLoop = () => {
          const now = new Date().getTime();
          currentTime = (now - startTime) / 50;

          context.fillStyle = "rgba(25,25,25,0.2)";
          context.fillRect(0, 0, cw, ch);

          for (let i = 0; i < stars.length; i++) {
            if (stars[i] !== undefined) {
              stars[i].draw();
            }
          }
          if (!disposed) animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

    }
    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [maxOrbit, starCount, spaceBgColor]);

  const timersRef = useRef([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleTriggerClick = () => {
    stateRef.current.collapse = false;
    stateRef.current.expanse = true;
    stateRef.current.returning = false;
    setIsOpen(true);

    const t1 = setTimeout(() => {
      stateRef.current.expanse = false;
      stateRef.current.returning = true;

      const t2 = setTimeout(() => {
        stateRef.current.returning = false;
        setIsOpen(false);
      }, recoverySecs * 1000);
      timersRef.current.push(t2);
    }, expansionSecs * 1000);
    timersRef.current.push(t1);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full h-screen overflow-hidden select-none ${className}`}
      style={{ backgroundColor: spaceBgColor }}
    >
      <div
        onClick={handleTriggerClick}
        onMouseEnter={() => {
          if (!stateRef.current.expanse) stateRef.current.collapse = true;
        }}
        onMouseLeave={() => {
          if (!stateRef.current.expanse) stateRef.current.collapse = false;
        }}
        className={`group absolute left-1/2 top-1/2 w-[255px] h-[255px] -mt-[128px] -ml-[128px] rounded-full flex items-center justify-center text-center cursor-pointer z-10 transition-all duration-500 bg-transparent ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <span
          className="font-serif text-[18px] relative transition-colors duration-500 flex items-center justify-center"
          style={{
            "--text-color-idle": enterTextColor,
            "--text-color-hover": enterHoverColor,
          }}
        >
              <span
            className="inline-block h-[1px] w-4 mr-3 bg-current transition-colors duration-500 mb-[4px]"
            style={{ color: enterTextColor }}
          />
          <span
            className="transition-colors duration-500 group-hover:text-[--text-color-hover]"
            style={{ color: enterTextColor }}
          >
            {enterLabel}
          </span>
          <span
            className="inline-block h-[1px] w-4 ml-3 bg-current transition-colors duration-500 mb-[4px]"
            style={{ color: enterTextColor }}
          />
        </span>
      </div>

      <canvas ref={canvasRef} className="relative w-full h-full m-auto z-0" />
    </div>
  );
}
