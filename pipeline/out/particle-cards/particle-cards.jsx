"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_CARDS = [
  {
    id: "desert",
    label: "DESERT",
    imageURL: {
      default:
        "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
      hovered:
        "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
    },
  },
  {
    id: "forest",
    label: "FOREST",
    imageURL: {
      default:
        "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
      hovered:
        "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    },
  },
  {
    id: "ocean",
    label: "OCEAN",
    imageURL: {
      default:
        "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
      hovered:
        "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
    },
  },
];

const SHARED_PARTICLES_CONFIG = {
  jumpToRandomPosition: false,
  fill: true,
  randomRadius: true,
  minRadius: 1,
  maxRadius: 2,
};
const SHARED_TOTAL_PARTICLES = 1500;
const SHARED_MOUSE_RANGE = 80;

function randomIntegerFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function dist(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
function returnPixelColor(imageData, width, position) {
  const index = (position.x + position.y * width) * 4;
  return `rgb(${imageData.data[index]}, ${imageData.data[index + 1]}, ${imageData.data[index + 2]})`;
}
function returnImageData(image, dimensions) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  c.width = dimensions.width;
  c.height = dimensions.height;
  ctx.drawImage(image, 0, 0, c.width, c.height);
  return ctx.getImageData(0, 0, c.width, c.height);
}
function toDataURL(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  });
}
function loadImage(url, cb) {
  toDataURL(url).then((data) => {
    const img = new Image();
    img.src = data;
    img.onload = () => cb(img);
  });
}
function loadImages(urls, cb) {
  let idx = 0;
  const arr = [];
  const load = () =>
    loadImage(urls[idx], (img) => {
      arr.push(img);
      idx++;
      if (idx === urls.length) cb(arr);
      else load();
    });
  load();
}

class Particle {
  constructor(opts = {}) {
    this.ctx = opts.ctx;
    this.position = opts.position || { x: 0, y: 0 };
    this.maxVelocity = opts.maxVelocity || 5;
    this.velocity = {
      x: (0.5 - Math.random()) * this.maxVelocity,
      y: (0.5 - Math.random()) * this.maxVelocity,
    };
    this.radius = opts.radius;
    this.minRadius = this.radius;
    this.color = opts.color;
    this.imageData = opts.imageData;
    this.rotation = 0;
    this.rotationIncrement = randomIntegerFromRange(2, 5);
    this.shape = opts.shape || "circle";
    this.edges = opts.edges || null;
    this.bounceFromEdges = opts.bounceFromEdges;
    this.avoidEdges = opts.avoidEdges || false;
    this.tick = 0;
    this.tickIncrement = 0.02 + Math.random() * 0.03;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.save();
    this.ctx.translate(this.position.x, this.position.y);
    this.ctx.rotate((Math.PI / 180) * this.rotation);
    this.drawShape(this.shape);
    this.ctx.restore();
    this.ctx.closePath();
  }
  fillShape() {
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
  strokeShape() {
    this.ctx.strokeStyle = this.color;
    this.ctx.stroke();
  }
  drawShape(shape) {
    if (shape === "square")
      this.ctx.rect(
        -this.radius / 2,
        -this.radius / 2,
        this.radius,
        this.radius,
      );
    else if (shape === "circle")
      this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    else if (shape === "hexagon") {
      this.ctx.moveTo(this.radius * Math.cos(0), this.radius * Math.sin(0));
      for (let s = 0; s < 7; s++)
        this.ctx.lineTo(
          this.radius * Math.cos((s * 2 * Math.PI) / 6),
          this.radius * Math.sin((s * 2 * Math.PI) / 6),
        );
    }
  }
  update() {
    if (this.bounceFromEdges) this.changeVelocityOnBounce();
    else this.continueFromEdge();
    this.rotation += this.rotationIncrement;
    this.tick += this.tickIncrement;
  }
  updatePosition() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  jumpToRandomPosition(b) {
    this.position.x = Math.random() * b.width;
    this.position.y = Math.random() * b.height;
  }
  growAndShrink(max) {
    this.radius = this.minRadius + Math.abs(Math.sin(this.tick)) * max;
  }
  updateColor(color) {
    this.color = color;
  }
  continueFromEdge() {
    if (!this.avoidEdges) {
      if (this.position.x > this.edges.width) this.position.x = 0;
      else if (this.position.x < 0) this.position.x = this.edges.width;
      if (this.position.y > this.edges.height) this.position.y = 0;
      else if (this.position.y < 0) this.position.y = this.edges.height;
    }
  }
  changeVelocityOnBounce() {
    if (!this.avoidEdges) {
      if (
        this.position.x + this.radius > this.edges.width ||
        this.position.x - this.radius < 0
      )
        this.velocity.x *= -1;
      if (
        this.position.y + this.radius > this.edges.height ||
        this.position.y - this.radius < 0
      )
        this.velocity.y *= -1;
    }
  }
}

class ParticlesCollection {
  constructor(opts = {}) {
    this.ctx = opts.ctx;
    this.totalParticles = opts.totalParticles;
    this.maxBounds = opts.maxBounds;
    this.imageData = opts.imageData;
    this.particles = [];
    this.particlesConfig = {
      jumpToRandomPosition: opts.particlesConfig.jumpToRandomPosition ?? false,
      growAndShrink: opts.particlesConfig.growAndShrink ?? false,
      fill: opts.particlesConfig.fill ?? true,
      bounceFromEdges: opts.particlesConfig.bounceFromEdges ?? true,
      shape: opts.particlesConfig.shape ?? "circle",
      radius: opts.particlesConfig.radius ?? 5,
      randomRadius: opts.particlesConfig.randomRadius ?? false,
      maxRadius: opts.particlesConfig.maxRadius ?? 5,
      minRadius: opts.particlesConfig.minRadius ?? 2,
      maxVelocity: opts.particlesConfig.maxVelocity ?? 8,
    };
    this.init();
  }
  init() {
    for (let i = 0; i < this.totalParticles; i++) {
      const radius = this.particlesConfig.randomRadius
        ? randomIntegerFromRange(
            this.particlesConfig.minRadius,
            this.particlesConfig.maxRadius,
          )
        : this.particlesConfig.radius;
      this.particles.push(
        new Particle({
          ctx: this.ctx,
          position: {
            x: randomIntegerFromRange(radius, this.maxBounds.width - radius),
            y: randomIntegerFromRange(radius, this.maxBounds.height - radius),
          },
          radius,
          color: "transparent",
          imageData: this.imageData,
          maxVelocity: 8,
          bounceFromEdges: this.particlesConfig.bounceFromEdges,
          shape: this.particlesConfig.shape,
          edges: { width: this.maxBounds.width, height: this.maxBounds.height },
        }),
      );
    }
  }
  update() {
    this.particles.forEach((p) => {
      p.draw();
      if (this.particlesConfig.fill) p.fillShape();
      else p.strokeShape();
      p.update();
      if (this.particlesConfig.growAndShrink)
        p.growAndShrink(p.minRadius * 0.65);
      if (!this.particlesConfig.jumpToRandomPosition) p.updatePosition();
      else
        p.jumpToRandomPosition({
          width: this.maxBounds.width,
          height: this.maxBounds.height,
        });
    });
  }
}

class CanvasController {
  constructor(opts = {}) {
    this.parent = opts.parent;
    this.dimensions = opts.dimensions;
    this.imageURL = opts.imageURL || {};
    this.images = opts.images || {};
    this.imagesData = { default: null, hovered: null };
    this.currentImageData = null;
    this.particles = null;
    this.totalParticles = opts.totalParticles || 400;
    this.hovered = false;
    this.particlesConfig = opts.particlesConfig;
    this.mouseRange = opts.mouseRange || null;
    this.mouse = null;
    this._rafId = null;
    this._alive = true;
    this.init();
  }
  init() {
    this.canvas = this.parent;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.dimensions.width;
    this.canvas.height = this.dimensions.height;

    const initialize = () => {
      this.currentImageData = this.imagesData.default;
      this.particles = new ParticlesCollection({
        ctx: this.ctx,
        totalParticles: this.totalParticles,
        maxBounds: {
          width: this.dimensions.width,
          height: this.dimensions.height,
        },
        imageData: this.currentImageData,
        particlesConfig: this.particlesConfig,
      });
      this.initEvents();
      this.render();
    };

    if (this.images.default && this.images.hovered) {
      this.imagesData.default = returnImageData(
        this.images.default,
        this.dimensions,
      );
      this.imagesData.hovered = returnImageData(
        this.images.hovered,
        this.dimensions,
      );
      initialize();
    } else {
      loadImages([this.imageURL.default, this.imageURL.hovered], (imgs) => {
        if (!this._alive) return;
        this.imagesData.default = returnImageData(imgs[0], this.dimensions);
        this.imagesData.hovered = returnImageData(imgs[1], this.dimensions);
        initialize();
      });
    }

    if (this.mouseRange != null) {
      this.mouse = new Particle({
        ctx: this.ctx,
        position: { x: 0, y: 0 },
        radius: this.mouseRange,
        color: "#000",
        avoidEdges: true,
        shape: "circle",
      });
    }
  }
  initEvents() {
    this._onEnter = () => {
      this.hovered = true;
      this.currentImageData = this.imagesData.hovered;
    };
    this._onLeave = () => {
      this.hovered = false;
      this.currentImageData = this.imagesData.default;
    };
    this._onMove = (e) => {
      if (this.mouse && this.hovered) {
        this.mouse.position.x = e.offsetX;
        this.mouse.position.y = e.offsetY;
      }
    };
    this.canvas.addEventListener("mouseenter", this._onEnter);
    this.canvas.addEventListener("mouseleave", this._onLeave);
    this.canvas.addEventListener("mousemove", this._onMove);
  }
  updateParticleColor(imageData, particle) {
    const color = returnPixelColor(
      imageData,
      Math.floor(this.dimensions.width),
      {
        x: Math.floor(particle.position.x),
        y: Math.floor(particle.position.y),
      },
    );
    particle.updateColor(color);
  }
  render() {
    if (!this._alive) return;
    this.particles.particles.forEach((p) => {
      if (this.mouseRange != null) {
        const d = dist(this.mouse.position, p.position);
        if (d < this.mouse.radius + p.radius && this.hovered)
          this.updateParticleColor(this.imagesData.hovered, p);
        else this.updateParticleColor(this.imagesData.default, p);
      } else {
        this.updateParticleColor(this.currentImageData, p);
      }
    });
    this.particles.update();
    this._rafId = requestAnimationFrame(() => this.render());
  }
  destroy() {
    this._alive = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this.canvas.removeEventListener("mouseenter", this._onEnter);
    this.canvas.removeEventListener("mouseleave", this._onLeave);
    this.canvas.removeEventListener("mousemove", this._onMove);
  }
}

function CanvasCard({
  card,
  cardWidth,
  cardHeight,
  totalParticles,
  mouseRange,
  particlesConfig,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctrl = new CanvasController({
      parent: canvas,
      dimensions: { width: cardWidth, height: cardHeight },
      imageURL: card.imageURL,
      totalParticles,
      mouseRange,
      particlesConfig,
    });
    return () => ctrl.destroy();
  }, [
    card,
    cardWidth,
    cardHeight,
    totalParticles,
    mouseRange,
    particlesConfig,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{ transform: "scale(1.02)" }}
    />
  );
}

export default function ParticleCards({
  cards = DEFAULT_CARDS,

  cardWidth: cardWidthProp = 260,
  cardHeight: cardHeightProp = 360,

  totalParticles = SHARED_TOTAL_PARTICLES,
  mouseRange = SHARED_MOUSE_RANGE,
  particlesConfig = SHARED_PARTICLES_CONFIG,

  backgroundColor = "#161616",
  textColor = "#ffffff",
  loaderBg = "#000000",
  loaderTextColor = "#ffffff",

  textFont = "'Red Rose', sans-serif",
  textSize = "3rem",
  loaderFont = "'Red Rose', sans-serif",

  gsapDelay = 0.8,
  gsapDuration = 1.5,
  gsapStagger = 0.1,

  cardGap = "2rem clamp(1.5rem, 5vw, 4rem)",
  padding = "clamp(1rem, 5vw, 4rem)",

  className = "",
}) {
  const [loaded, setLoaded] = useState(false);
  const [viewWidth, setViewWidth] = useState(
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const cardWidth = Math.max(120, Math.min(cardWidthProp, viewWidth - 96));
  const cardHeight = Math.round(cardHeightProp * (cardWidth / cardWidthProp));
  const tlRef = useRef(null);

  useEffect(() => {
    const onResize = () => setViewWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const cardImageRefs = useRef([]);
  const cardImageInnerRefs = useRef([]);
  const cardTextInnerRefs = useRef([]);

  useEffect(() => {
    const href =
      "https://fonts.googleapis.com/css2?family=Red+Rose:wght@400;700&display=swap";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const allURLs = cards.flatMap((c) => [
      c.imageURL.default,
      c.imageURL.hovered,
    ]);

    let alive = true;
    loadImages(allURLs, async () => {
      const gsapMod = await import("gsap");
      if (!alive) return;
      const gsap = gsapMod.gsap ?? gsapMod.default;

      setLoaded(true);

      tlRef.current = gsap
        .timeline({
          delay: gsapDelay,
          defaults: {
            duration: gsapDuration,
            stagger: gsapStagger,
            ease: "expo.out",
          },
        })
        .fromTo(
          cardImageRefs.current,
          { translateY: "-100%" },
          { translateY: "0%" },
        )
        .fromTo(
          cardImageInnerRefs.current,
          { translateY: "100%" },
          { translateY: "0%" },
          0,
        )
        .fromTo(
          cardTextInnerRefs.current,
          { translateY: "100%" },
          { duration: 1.2, translateY: "0%" },
          0.4,
        );
    });
    return () => {
      alive = false;
      if (tlRef.current) tlRef.current.kill();
    };
  }, [cards, gsapDelay, gsapDuration, gsapStagger]);

  return (
    <div
      className={`w-full h-screen grid place-items-center overflow-x-hidden ${className}`}
      style={{ backgroundColor }}
    >
      <main
        className="w-full h-full grid place-items-center"
        style={{ padding }}
      >
        <div className="w-full flex flex-wrap justify-center items-center">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="relative shrink-0"

              style={{ width: cardWidth, height: cardHeight, margin: cardGap }}
            >
              <div
                ref={(el) => (cardImageRefs.current[i] = el)}
                className="relative w-full h-full overflow-hidden"
              >
                <div
                  ref={(el) => (cardImageInnerRefs.current[i] = el)}
                  className="w-full h-full overflow-hidden"
                >
                  <CanvasCard
                    card={card}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    totalParticles={totalParticles}
                    mouseRange={mouseRange}
                    particlesConfig={particlesConfig}
                  />
                </div>
              </div>

              <div
                className="absolute left-0 bottom-[12%] pointer-events-none select-none overflow-hidden"
                style={{ transform: "translateX(-38%)" }}
              >
                <span
                  ref={(el) => (cardTextInnerRefs.current[i] = el)}
                  className="inline-block font-bold"

                  style={{
                    color: textColor,
                    fontSize: textSize,
                    fontFamily: textFont,
                  }}
                >
                  {card.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div
        className={`fixed inset-0 z-[200] flex flex-col justify-center items-center transition-opacity duration-500 ${
          loaded ? "opacity-0 pointer-events-none select-none" : "opacity-100"
        }`}
        style={{ backgroundColor: loaderBg }}
      >
        <p
          className="mb-5 font-normal"
          style={{ color: loaderTextColor, fontFamily: loaderFont }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
