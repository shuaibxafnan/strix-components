"use client";

import { useEffect, useRef, useCallback } from "react";

const COLORS = (opacity) => [
  `rgba(0,0,0,${opacity})`,
  `rgba(192,192,192,${opacity})`,
  `rgba(128,128,128,${opacity})`,
  `rgba(128,0,0,${opacity})`,
  `rgba(255,0,0,${opacity})`,
  `rgba(0,255,0,${opacity})`,
  `rgba(0,0,255,${opacity})`,
  `rgba(255,0,255,${opacity})`,
  `rgba(128,128,0,${opacity})`,
  `rgba(0,128,0,${opacity})`,
  `rgba(128,0,128,${opacity})`,
  `rgba(0,128,128,${opacity})`,
  `rgba(0,0,128,${opacity})`,
  `rgba(138,57,0,${opacity})`,
  `rgba(205,133,63,${opacity})`,
  `rgba(244,164,96,${opacity})`,
  `rgba(139,105,30,${opacity})`,
  `rgba(165,42,42,${opacity})`,
  `rgba(178,34,34,${opacity})`,
  `rgba(220,20,60,${opacity})`,
  `rgba(255,140,0,${opacity})`,
  `rgba(255,165,0,${opacity})`,
  `rgba(255,215,0,${opacity})`,
  `rgba(184,134,11,${opacity})`,
  `rgba(218,165,32,${opacity})`,
  `rgba(238,232,170,${opacity})`,
  `rgba(189,183,107,${opacity})`,
  `rgba(240,230,140,${opacity})`,
  `rgba(0,100,0,${opacity})`,
  `rgba(34,139,34,${opacity})`,
  `rgba(32,178,170,${opacity})`,
  `rgba(47,79,79,${opacity})`,
  `rgba(0,139,139,${opacity})`,
  `rgba(95,158,160,${opacity})`,
  `rgba(70,130,180,${opacity})`,
  `rgba(25,25,112,${opacity})`,
  `rgba(0,0,128,${opacity})`,
  `rgba(0,0,139,${opacity})`,
  `rgba(72,61,139,${opacity})`,
  `rgba(75,0,130,${opacity})`,
  `rgba(139,0,139,${opacity})`,
  `rgba(105,105,105,${opacity})`,
  `rgba(169,169,169,${opacity})`,
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function getColorObj(opacity, isRandom, index) {
  const colors = COLORS(opacity);
  if (isRandom) {
    const i = Math.floor(rand(0, colors.length - 1));
    return { color: colors[i], index: i };
  }
  return colors[index >= 0 && index < colors.length ? index : 0];
}

class GridWormEntity {
  constructor(
    point,
    interval,
    pointsList,
    screenWidth,
    screenHeight,
    speed,
    junctionMemoryLength,
    radius,
  ) {
    this.radius = radius;
    this.xCoord = point.x;
    this.yCoord = point.y;
    this.interval = interval;
    this.color = getColorObj(1, true);
    this.mainColor = this.color.color;
    this.mainColorIndex = this.color.index;
    this.nColor = getColorObj(1, true);
    this.arrowHeadColor = this.nColor.color;
    this.arrowHeadColorIndex = this.nColor.index;
    this.pointsList = pointsList;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.speed = speed;
    this.velocity = this.getVelocity();
    this.junctionMemory = [{ point, velocity: this.velocity }];
    this.junctionMemoryLength = Math.max(1, junctionMemoryLength);
  }

  getVelocity() {
    let x, y;
    if (Math.random() > 0.5) {
      x = 0;
      y = Math.random() > 0.5 ? -this.speed : this.speed;
    } else {
      x = Math.random() > 0.5 ? -this.speed : this.speed;
      y = 0;
    }
    return { x, y };
  }

  getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  drawCircle(x, y, r, ctx, colorIndex) {
    const configs = [
      { r: r, op: 1 },
      { r: r * 2, op: 0.5 },
      { r: r * 6, op: 0.2 },
    ];
    for (const { r: cr, op } of configs) {
      const color = getColorObj(op, false, colorIndex);
      ctx.beginPath();
      ctx.arc(x, y, cr, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  drawArrowHead(x, y, r, ctx, colorIndex) {
    let points = [];
    const off = this.interval / 3;
    if (this.velocity.x === 0) {
      if (this.velocity.y > 0) {
        points = [
          { x: x + off, y },
          { x: x - off, y },
          { x, y: y + off },
        ];
      } else {
        points = [
          { x: x + off, y },
          { x: x - off, y },
          { x, y: y - off },
        ];
      }
    } else {
      if (this.velocity.x > 0) {
        points = [
          { x: x + off, y },
          { x, y: y - off },
          { x, y: y + off },
        ];
      } else {
        points = [
          { x: x - off, y },
          { x, y: y - off },
          { x, y: y + off },
        ];
      }
    }
    for (const p of points) this.drawCircle(p.x, p.y, r / 2, ctx, colorIndex);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fill();
  }

  draw(ctx) {
    this.drawCircle(
      this.xCoord,
      this.yCoord,
      this.radius / 2,
      ctx,
      this.mainColorIndex,
    );
    this.drawArrowHead(
      this.xCoord,
      this.yCoord,
      this.radius / 2,
      ctx,
      this.arrowHeadColorIndex,
    );

    for (let i = 0; i < this.junctionMemory.length; i++) {
      const junction =
        this.junctionMemory[this.junctionMemory.length - (i + 1)];
      this.drawCircle(
        junction.point.x,
        junction.point.y,
        this.radius / 2,
        ctx,
        this.mainColorIndex,
      );
      ctx.fillStyle = getColorObj(0.1, false, this.mainColorIndex);
      ctx.fillRect(
        junction.point.x,
        junction.point.y,
        this.interval,
        this.interval,
      );
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = this.radius;
    ctx.beginPath();
    ctx.moveTo(this.xCoord, this.yCoord);
    for (let i = 0; i < this.junctionMemory.length; i++) {
      const junction =
        this.junctionMemory[this.junctionMemory.length - (i + 1)];
      ctx.lineTo(junction.point.x, junction.point.y);
    }
    ctx.stroke();
    ctx.closePath();
  }

  getJunctionReached(currentCoord) {
    for (const point of this.pointsList) {
      if (
        Math.abs(currentCoord.x - point.x) > 2 * this.interval ||
        Math.abs(currentCoord.y - point.y) > 2 * this.interval
      )
        continue;
      if (this.getDistance(currentCoord, point) <= this.radius) return point;
    }
    return currentCoord;
  }

  update() {
    this.xCoord += this.velocity.x;
    this.yCoord += this.velocity.y;

    if (this.xCoord <= this.interval) {
      this.xCoord = this.interval;
      this.velocity.x = -this.velocity.x;
      this.xCoord += this.velocity.x * 3;
    }
    if (this.xCoord >= this.screenWidth - this.interval) {
      this.xCoord = this.junctionMemory[this.junctionMemory.length - 1].point.x;
      this.velocity.x = -this.velocity.x;
      this.xCoord += this.velocity.x * 3;
    }
    if (this.yCoord <= this.interval) {
      this.yCoord = this.interval;
      this.velocity.y = -this.velocity.y;
      this.yCoord += this.velocity.y * 3;
    }
    if (this.yCoord >= this.screenHeight - this.interval) {
      this.yCoord = this.junctionMemory[this.junctionMemory.length - 1].point.y;
      this.velocity.y = -this.velocity.y;
      this.yCoord += this.velocity.y * 4;
    }

    const current = { x: this.xCoord, y: this.yCoord };
    const junction = this.getJunctionReached(current);
    if (junction !== current) {
      const origV = this.velocity;
      const newV = this.getVelocity();

      if (origV.y === 0) {
        this.velocity = newV;
        if (!(newV.y === 0 && newV.x === -origV.x)) {
          const mem = { point: junction, velocity: this.velocity };
          this.junctionMemory.push(mem);
        }
        this.xCoord += this.velocity.x * 3;
      } else {
        this.velocity = newV;
        if (!(newV.x === 0 && newV.y === -origV.y)) {
          const mem = { point: junction, velocity: this.velocity };
          this.junctionMemory.push(mem);
        }
        this.yCoord += this.velocity.y * 3;
      }
    }

    if (this.junctionMemory.length > this.junctionMemoryLength) {
      this.junctionMemory.shift();
    }
  }

  resize(screenWidth, screenHeight, pointsList) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.pointsList = pointsList;
  }
}

function createPoints(screenWidth, screenHeight, interval) {
  const points = [];
  for (let y = interval; y < screenHeight; y += interval) {
    if (y + interval > screenHeight) continue;
    for (let x = interval; x < screenWidth; x += interval) {
      if (x + interval > screenWidth) continue;
      points.push({ x, y });
    }
  }
  return points;
}

export default function GridWorm({
  bgColor = "white",
  numWorms = 30,
  interval = 40,
  wormLength = 6,
  speed = 5,
  arrowOpacity = 0.1,
  lineWidth = 2,
  circleRadius = 2,
  showGrid = false,
  gridDotColor = "#eee",
  className = "",
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    worms: [],
    points: [],
    raf: null,
    lastTime: 100,
    w: 0,
    h: 0,
  });

  const spawnWorms = useCallback(
    (w, h, pts) => {
      const worms = [];
      for (let i = 0; i < numWorms; i++) {
        const point = pts[Math.floor(rand(0, pts.length - 1))];
        worms.push(
          new GridWormEntity(
            point,
            interval,
            pts,
            w,
            h,
            speed,
            wormLength,
            circleRadius,
          ),
        );
      }
      return worms;
    },
    [numWorms, interval, speed, wormLength, circleRadius],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    const init = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      state.w = w;
      state.h = h;
      state.points = createPoints(w, h, interval);
      state.worms = spawnWorms(w, h, state.points);
    };

    const loop = (ts) => {
      const { w, h, worms, points } = state;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      if (showGrid) {
        ctx.fillStyle = gridDotColor;
        for (const p of points) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const worm of worms) worm.update();
      for (const worm of worms) worm.draw(ctx);

      state.raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === state.w && h === state.h) return;
      canvas.width = w;
      canvas.height = h;
      state.w = w;
      state.h = h;
      state.points = createPoints(w, h, interval);
      state.worms = spawnWorms(w, h, state.points);
    };

    const onClick = () => {
      state.points = createPoints(state.w, state.h, interval);
      state.worms = spawnWorms(state.w, state.h, state.points);
    };

    init();
    state.raf = requestAnimationFrame(loop);
    window.addEventListener("resize", onResize);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onClick);
    };
  }, [bgColor, interval, showGrid, gridDotColor, spawnWorms]);

  return (
    <div className={`relative w-full h-full min-h-screen ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-pointer"
        style={{ backgroundColor: bgColor }}
      />
    </div>
  );
}
