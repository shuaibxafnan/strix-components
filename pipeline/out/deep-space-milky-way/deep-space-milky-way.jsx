"use client";

import { useEffect, useRef } from "react";

export default function DeepSpaceMilkyWay({
  starCount = 600,
  minStarSize = 0.3,
  starSizeRandomness = 0.6,
  alphaRandomness = 0.5,
  shootingStarDensity = 0.01,
  mwStarCount = 100000,
  mwClusterCount = 300,
  mwClusterStarCount = 1500,
  mwAngle = 0.6,
  radialGradStart = "#100826",
  radialGradEnd = "#060212",
  shootingStarColors = ["#a1ffba", "#a1d2ff", "#fffaa1", "#ffa1a1"],
  className = "",
}) {
  const starsCanvasRef = useRef(null);
  const milkyWayCanvasRef = useRef(null);

  const shootingStarBaseXspeed = 30;
  const shootingStarBaseYspeed = 15;
  const shootingStarBaseLength = 8;
  const shootingStarBaseLifespan = 60;
  const mwRandomStarProp = 0.2;
  const mwClusterSize = 120;
  const mwClusterSizeR = 80;
  const mwClusterLayers = 10;
  const mwHueMin = 150;
  const mwHueMax = 300;
  const mwWhiteProportionMin = 50;
  const mwWhiteProportionMax = 65;
  const randomArrayLength = 1000;
  const hueArrayLength = 1000;

  useEffect(() => {
    const starsCanvas = starsCanvasRef.current;
    const mwCanvas = milkyWayCanvasRef.current;
    if (!starsCanvas || !mwCanvas) return;

    const ctx = starsCanvas.getContext("2d");
    const ctxMw = mwCanvas.getContext("2d");

    let dpr = window.devicePixelRatio || 1;
    let animationFrameId;
    let randomArrayIterator = 0;

    let randomArray = Array.from({ length: randomArrayLength }, () =>
      Math.random(),
    );
    let hueArray = Array.from({ length: hueArrayLength }, () => {
      let rHue = Math.floor(Math.random() * 160);
      if (rHue > 60) rHue += 110;
      return rHue;
    });

    let StarsArray = [];
    let ShootingStarsArray = [];

    class Star {
      constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.alpha = size / (minStarSize + starSizeRandomness);
        this.baseHue = hueArray[Math.floor(Math.random() * hueArrayLength)];
        this.baseHueProportion = Math.random();
        this.randomIndexa = Math.floor(Math.random() * randomArrayLength);
        this.randomIndexh = this.randomIndexa;
        this.randomValue = randomArray[this.randomIndexa];
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        let rAlpha =
          this.alpha + Math.min((this.randomValue - 0.5) * alphaRandomness, 1);
        let rHue =
          randomArray[this.randomIndexh] > this.baseHueProportion
            ? hueArray[this.randomIndexa]
            : this.baseHue;
        ctx.fillStyle = `hsla(${rHue},100%,85%,${rAlpha})`;
        ctx.fill();
      }

      update() {
        this.randomIndexh = this.randomIndexa;
        this.randomIndexa =
          this.randomIndexa >= 999 ? 0 : this.randomIndexa + 1;
        this.randomValue = randomArray[this.randomIndexa];
        this.draw();
      }
    }

    class ShootingStar {
      constructor(x, y, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.framesLeft = shootingStarBaseLifespan;
        this.color = color;
      }

      goingOut() {
        return this.framesLeft <= 0;
      }

      ageModifier() {
        let halfLife = shootingStarBaseLifespan / 2.0;
        return Math.pow(
          1.0 - Math.abs(this.framesLeft - halfLife) / halfLife,
          2,
        );
      }

      draw() {
        let am = this.ageModifier();
        let endX = this.x - this.speedX * shootingStarBaseLength * am;
        let endY = this.y - this.speedY * shootingStarBaseLength * am;
        let gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
        gradient.addColorStop(0, "#fff");
        gradient.addColorStop(Math.min(am, 0.7), this.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      update() {
        this.framesLeft--;
        this.x += this.speedX;
        this.y += this.speedY;
        this.draw();
      }
    }

    class MwStarCluster {
      constructor(x, y, size, hue, baseWhiteProportion, brightnessModifier) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.hue = hue;
        this.baseWhiteProportion = baseWhiteProportion;
        this.brightnessModifier = brightnessModifier;
      }

      draw() {
        let starsPerLayer = Math.floor(mwClusterStarCount / mwClusterLayers);
        for (let layer = 1; layer < mwClusterLayers; layer++) {
          let layerRadius = (this.size * layer) / mwClusterLayers;
          for (let i = 1; i < starsPerLayer; i++) {
            let posX = this.x + 2 * layerRadius * (Math.random() - 0.5);
            let posY =
              this.y +
              2 *
                Math.sqrt(
                  Math.pow(layerRadius, 2) - Math.pow(this.x - posX, 2),
                ) *
                (Math.random() - 0.5);
            let size = 0.05 + Math.random() * 0.15;
            let alpha = 0.3 + Math.random() * 0.4;
            let whitePercentage =
              this.baseWhiteProportion +
              15 +
              15 * this.brightnessModifier +
              Math.floor(Math.random() * 10);
            ctxMw.beginPath();
            ctxMw.arc(posX, posY, size, 0, Math.PI * 2, false);
            ctxMw.fillStyle = `hsla(${this.hue},100%,${whitePercentage}%,${alpha})`;
            ctxMw.fill();
          }
        }

        let gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size,
        );
        gradient.addColorStop(
          0,
          `hsla(${this.hue},100%,${this.baseWhiteProportion}%,0.002)`,
        );
        gradient.addColorStop(
          0.25,
          `hsla(${this.hue},100%,${this.baseWhiteProportion + 30}%,${0.01 + 0.01 * this.brightnessModifier})`,
        );
        gradient.addColorStop(
          0.4,
          `hsla(${this.hue},100%,${this.baseWhiteProportion + 15}%,0.005)`,
        );
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctxMw.beginPath();
        ctxMw.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctxMw.fillStyle = gradient;
        ctxMw.fill();
      }
    }

    const MilkyWayX = () => Math.floor(Math.random() * window.innerWidth);

    const MilkyWayYFromX = (xPos, mode) => {
      let offset = (window.innerWidth / 2 - xPos) * mwAngle;
      if (mode === "star") {
        return (
          Math.floor(
            Math.pow(Math.random(), 1.2) *
              window.innerHeight *
              (Math.random() - 0.5) +
              window.innerHeight / 2 +
              (Math.random() - 0.5) * 100,
          ) + offset
        );
      } else {
        return (
          Math.floor(
            Math.pow(Math.random(), 1.5) *
              window.innerHeight *
              0.6 *
              (Math.random() - 0.5) +
              window.innerHeight / 2 +
              (Math.random() - 0.5) * 100,
          ) + offset
        );
      }
    };

    const DrawMilkyWayCanvas = () => {
      ctxMw.clearRect(0, 0, mwCanvas.width, mwCanvas.height);
      for (let i = 0; i < mwStarCount; i++) {
        ctxMw.beginPath();
        let xPos = MilkyWayX();
        let yPos =
          Math.random() < mwRandomStarProp
            ? Math.floor(Math.random() * window.innerHeight)
            : MilkyWayYFromX(xPos, "star");
        let size = Math.random() * 0.27;
        ctxMw.arc(xPos, yPos, size, 0, Math.PI * 2, false);
        let alpha = 0.4 + Math.random() * 0.6;
        ctxMw.fillStyle = `rgba(255,255,255,${alpha})`;
        ctxMw.fill();
      }
      for (let i = 0; i < mwClusterCount; i++) {
        let xPos = MilkyWayX();
        let yPos = MilkyWayYFromX(xPos, "cluster");
        let distToCenter =
          (1 -
            Math.abs(xPos - window.innerWidth / 2) / (window.innerWidth / 2)) *
          (1 -
            Math.abs(yPos - window.innerHeight / 2) / (window.innerHeight / 2));
        let size = mwClusterSize + Math.random() * mwClusterSizeR;
        let hue =
          mwHueMin +
          Math.floor(
            (Math.random() * 0.5 + distToCenter * 0.5) * (mwHueMax - mwHueMin),
          );
        let baseWhiteProportion =
          mwWhiteProportionMin +
          Math.random() * (mwWhiteProportionMax - mwWhiteProportionMin);
        new MwStarCluster(
          xPos,
          yPos,
          size,
          hue,
          baseWhiteProportion,
          distToCenter,
        ).draw();
      }
    };

    const initializeSpace = () => {
      dpr = window.devicePixelRatio || 1;

      starsCanvas.width = window.innerWidth * dpr;
      starsCanvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      mwCanvas.width = window.innerWidth * dpr;
      mwCanvas.height = window.innerHeight * dpr;
      ctxMw.setTransform(1, 0, 0, 1, 0, 0);
      ctxMw.scale(dpr, dpr);

      StarsArray = [];
      for (let i = 0; i < starCount; i++) {
        let size = Math.random() * starSizeRandomness + minStarSize;
        let x = Math.random() * (window.innerWidth - size * 4) + size * 2;
        let y = Math.random() * (window.innerHeight - size * 4) + size * 2;
        StarsArray.push(new Star(x, y, size));
      }
      ShootingStarsArray = [];
      DrawMilkyWayCanvas();
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < StarsArray.length; i++) {
        StarsArray[i].update();
      }

      if (randomArray[randomArrayIterator] < shootingStarDensity) {
        let posX = Math.floor(Math.random() * window.innerWidth);
        let posY = Math.floor(Math.random() * 150);
        let speedX = Math.floor((Math.random() - 0.5) * shootingStarBaseXspeed);
        let speedY = Math.floor(Math.random() * shootingStarBaseYspeed);
        let color =
          shootingStarColors[
            Math.floor(Math.random() * shootingStarColors.length)
          ];
        ShootingStarsArray.push(
          new ShootingStar(posX, posY, speedX, speedY, color),
        );
      }

      let arrayIterator = ShootingStarsArray.length - 1;
      while (arrayIterator >= 0) {
        if (ShootingStarsArray[arrayIterator].goingOut()) {
          ShootingStarsArray.splice(arrayIterator, 1);
        } else {
          ShootingStarsArray[arrayIterator].update();
        }
        arrayIterator--;
      }

      randomArrayIterator =
        randomArrayIterator + 1 >= randomArrayLength
          ? 0
          : randomArrayIterator + 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", initializeSpace);
    initializeSpace();
    animate();

    return () => {
      window.removeEventListener("resize", initializeSpace);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    starCount,
    minStarSize,
    starSizeRandomness,
    alphaRandomness,
    shootingStarDensity,
    mwStarCount,
    mwClusterCount,
    mwClusterStarCount,
    mwAngle,
    shootingStarColors,
  ]);

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden select-none ${className}`}
      style={{
        background: `radial-gradient(${radialGradStart}, ${radialGradEnd})`,
      }}
    >
      <canvas
        ref={milkyWayCanvasRef}
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none z-10 filter blur-0"
      />

      <canvas
        ref={starsCanvasRef}
        className="absolute top-0 left-0 w-full h-full object-contain bg-transparent pointer-events-none z-20"
      />
    </div>
  );
}
