"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── FlowField ────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// bgColor          string   "black"    Canvas background color
// particleCount    number   600        Number of flow particles
// noiseScale       number   0.009      Perlin noise zoom (smaller = smoother)
// baseAngle        number   -90        Initial flow angle in degrees
// tail             number   82         Trail fade amount (0=full trails,100=none)
// strokeWeight     number   1.2        Particle line thickness
// maxSpeedA        number   3          Max speed for hue-group A particles
// maxSpeedB        number   2          Max speed for hue-group B particles
// hueOffset        number   20         Hue shift added to both color groups
// satMin           number   20         Min saturation for random color gen
// satMax           number   90         Max saturation for random color gen
// lightMin         number   30         Min lightness for random color gen
// lightMax         number   80         Max lightness for random color gen
// strokeAlpha      number   0.5        Opacity of each particle stroke
// className        string   ""         Extra tailwind classes for wrapper
// ──────────────────────────────────────────────────────────────────────────────

// ── Minimal seeded Perlin noise (no p5 dependency) ───────────────────────────
// Classic improved noise, single octave, 3D
function buildNoise() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const grad = (hash, x, y, z) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  };

  return function noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x),
      v = fade(y),
      w = fade(z);
    const A = perm[X] + Y,
      AA = perm[A] + Z,
      AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y,
      BA = perm[B] + Z,
      BB = perm[B + 1] + Z;
    return lerp(
      lerp(
        lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
        lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u),
        v,
      ),
      lerp(
        lerp(
          grad(perm[AA + 1], x, y, z - 1),
          grad(perm[BA + 1], x - 1, y, z - 1),
          u,
        ),
        lerp(
          grad(perm[AB + 1], x, y - 1, z - 1),
          grad(perm[BB + 1], x - 1, y - 1, z - 1),
          u,
        ),
        v,
      ),
      w,
    );
  };
}

const randInt = (v1, v2) => Math.floor(v1 + Math.random() * (v2 - v1));
const degToRad = (a) => (Math.PI / 180) * a;

class FlowParticle {
  constructor(x, y, w, h, opt, noise) {
    this.w = w;
    this.h = h;
    this.opt = opt;
    this.noise = noise;
    this.x = x;
    this.y = y;
    this.lx = x;
    this.ly = y;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.hueSeed = Math.random();
    this._applyColor();
  }

  _applyColor() {
    const { opt } = this;
    const a = this.hueSeed > 0.5;
    this.hue = (a ? opt.h1 : opt.h2) + opt.hueOffset;
    this.sat = a ? opt.s1 : opt.s2;
    this.light = a ? opt.l1 : opt.l2;
    this.maxSpeed = a ? opt.maxSpeedA : opt.maxSpeedB;
  }

  randomize() {
    this.hueSeed = Math.random();
    this._applyColor();
  }

  follow(time) {
    const angle =
      this.noise(
        this.x * this.opt.noiseScale,
        this.y * this.opt.noiseScale,
        time * this.opt.noiseScale,
      ) *
        Math.PI *
        0.5 +
      this.opt.angle;
    this.ax += Math.cos(angle);
    this.ay += Math.sin(angle);
  }

  update(time) {
    this.follow(time);
    this.vx += this.ax;
    this.vy += this.ay;
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const ang = Math.atan2(this.vy, this.vx);
    const m = Math.min(this.maxSpeed, spd);
    this.vx = Math.cos(ang) * m;
    this.vy = Math.sin(ang) * m;
    this.x += this.vx;
    this.y += this.vy;
    this.ax = 0;
    this.ay = 0;
    this._edges();
  }

  _edges() {
    if (this.x < 0) {
      this.x = this.w;
      this.lx = this.x;
      this.ly = this.y;
    }
    if (this.x > this.w) {
      this.x = 0;
      this.lx = this.x;
      this.ly = this.y;
    }
    if (this.y < 0) {
      this.y = this.h;
      this.lx = this.x;
      this.ly = this.y;
    }
    if (this.y > this.h) {
      this.y = 0;
      this.lx = this.x;
      this.ly = this.y;
    }
  }

  render(ctx) {
    ctx.strokeStyle = `hsla(${this.hue},${this.sat}%,${this.light}%,${this.opt.strokeAlpha})`;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.lx, this.ly);
    ctx.stroke();
    this.lx = this.x;
    this.ly = this.y;
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
  }
}

export default function FlowField({
  bgColor = "black",
  particleCount = 600,
  noiseScale = 0.009,
  baseAngle = -90,
  tail = 85,
  strokeWeight = 1.2,
  maxSpeedA = 3,
  maxSpeedB = 2,
  hueOffset = 20,
  satMin = 20,
  satMax = 90,
  lightMin = 30,
  lightMax = 80,
  strokeAlpha = 0.5,
  className = "",
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  const makeOpt = useCallback(
    (prevAngle) => ({
      noiseScale,
      angle: prevAngle ?? degToRad(baseAngle),
      h1: randInt(0, 360),
      h2: randInt(0, 360),
      s1: randInt(satMin, satMax),
      s2: randInt(satMin, satMax),
      l1: randInt(lightMin, lightMax),
      l2: randInt(lightMin, lightMax),
      strokeAlpha,
      maxSpeedA,
      maxSpeedB,
      hueOffset,
    }),
    [
      noiseScale,
      baseAngle,
      satMin,
      satMax,
      lightMin,
      lightMax,
      strokeAlpha,
      maxSpeedA,
      maxSpeedB,
      hueOffset,
    ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const noise = buildNoise();

    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();

    let opt = makeOpt(null);
    let particles = [];
    let time = 0;
    let raf = null;

    const spawn = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(
          new FlowParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            canvas.width,
            canvas.height,
            opt,
            noise,
          ),
        );
      }
    };
    spawn();

    const loop = () => {
      time++;
      const alpha = (100 - tail) / 100;
      ctx.fillStyle =
        bgColor === "black"
          ? `rgba(0,0,0,${alpha})`
          : hexOrNameToRgba(bgColor, alpha);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = strokeWeight;
      for (const p of particles) {
        p.update(time);
        p.render(ctx);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = () => {
      opt.h1 = randInt(0, 360);
      opt.h2 = randInt(0, 360);
      opt.s1 = randInt(satMin, satMax);
      opt.s2 = randInt(satMin, satMax);
      opt.l1 = randInt(lightMin, lightMax);
      opt.l2 = randInt(lightMin, lightMax);
      opt.angle += degToRad(randInt(30, 60)) * (Math.random() > 0.5 ? 1 : -1);
      for (const p of particles) p.randomize();
    };

    const onResize = () => {
      setSize();
      for (const p of particles) p.resize(canvas.width, canvas.height);
    };

    canvas.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);
    stateRef.current = { cancel: () => cancelAnimationFrame(raf) };

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, [
    bgColor,
    particleCount,
    tail,
    strokeWeight,
    satMin,
    satMax,
    lightMin,
    lightMax,
    makeOpt,
  ]);

  return (
    <div
      className={`w-full h-full overflow-hidden ${className}`}
      style={{ background: bgColor }}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />
    </div>
  );
}

// Helper: converts any CSS color string to rgba(r,g,b,a) for the fade overlay
function hexOrNameToRgba(color, alpha) {
  // Fast path for hex
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(0,0,0,${alpha})`;
}
