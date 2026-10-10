"use client";

import { useEffect, useRef, useState } from "react";

// ─── LiquidSlideshow ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images             array    5 photos   Slide image URLs, rendered as WebGL sprites
// captions           array    []         Optional caption per slide, index-matched
// stageWidth         number   1920       Internal render width in pixels
// stageHeight        number   1080       Internal render height in pixels
// canvasScale        number   1.2        CSS scale on the canvas, hides filter edge bleed
// autoPlay           boolean  true       Continuously drift the displacement map
// autoPlaySpeedX     number   10         Idle drift speed on X per tick
// autoPlaySpeedY     number   3          Idle drift speed on Y per tick
// displaceScaleX     number   200        Peak distortion strength on X during a transition
// displaceScaleY     number   70         Peak distortion strength on Y during a transition
// idleDisplaceScale  number   20         Resting distortion strength between transitions
// distortDuration    number   1          Ramp in/out duration of the distortion (s)
// fadeDuration       number   0.5        Cross-fade duration per slide (s)
// noiseSize          number   512        Displacement map resolution, powers of two only
// noiseCells         number   4          Base noise grid, lower is smoother and more liquid
// noiseOctaves       number   4          Noise detail layers, higher is grainier
// noiseContrast      number   1.6        Contrast of the map, raises distortion sharpness
// displacementImage  string   ""         External map URL, replaces the generated noise
// displaceAutoFit    boolean  false      Clamp the filter to the renderer bounds
// wacky              boolean  false      Rotate and pulse the map while transitioning
// interactive        boolean  false      Enable pointer-driven distortion
// interactionEvent   string   hover      hover | click | both, when interactive is on
// loop               boolean  true       Wrap from last slide back to first
// autoAdvance        boolean  false      Advance slides on a timer
// autoAdvanceDelay   number   5000       Delay between automatic advances (ms)
// showArrows         boolean  true       Render the prev/next controls
// showDots           boolean  true       Render the slide indicator dots
// showCounter        boolean  false      Render the numeric slide counter
// bgColor            string   #000       Page background behind the canvas
// navColor           string   #ffffffcc  Arrow and inactive dot color
// navHoverColor      string   #ffffff    Arrow hover and active dot color
// textColor          string   #ffffff    Caption color
// fadeInDuration     number   600        Wrapper fade-in once textures decode (ms)
// className          string   ""         Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const PIXI_SOURCES = [
  "https://cdn.jsdelivr.net/npm/pixi.js@4.8.9/dist/pixi.min.js",
  "https://unpkg.com/pixi.js@4.8.9/dist/pixi.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.7.1/pixi.min.js",
];
const GSAP_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1920&q=80",
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-id="${src}"]`)) {
      const existing = document.querySelector(`script[data-id="${src}"]`);
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`Failed: ${src}`)),
      );
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-id", src);
    el.onload = () => {
      el.setAttribute("data-loaded", "true");
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });
}

function loadFirstAvailable(sources, globalKey) {
  return sources.reduce(
    (chain, src) =>
      chain.catch(() =>
        window[globalKey] ? Promise.resolve() : loadScript(src),
      ),
    Promise.reject(new Error("start")),
  );
}

function createNoiseCanvas(size, cells, octaves, contrast) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);

  const layers = [];
  let resolution = Math.max(2, cells);
  for (let o = 0; o < Math.max(1, octaves); o += 1) {
    const grid = new Float32Array(resolution * resolution);
    for (let i = 0; i < grid.length; i += 1) grid[i] = Math.random();
    layers.push({ resolution, grid, amp: 1 / 2 ** o });
    resolution *= 2;
  }

  const ease = (t) => t * t * (3 - 2 * t);
  const sample = (grid, res, x, y) => {
    const fx = x * res;
    const fy = y * res;
    const x0 = Math.floor(fx) % res;
    const y0 = Math.floor(fy) % res;
    const x1 = (x0 + 1) % res;
    const y1 = (y0 + 1) % res;
    const tx = ease(fx - Math.floor(fx));
    const ty = ease(fy - Math.floor(fy));
    const a = grid[y0 * res + x0];
    const b = grid[y0 * res + x1];
    const c = grid[y1 * res + x0];
    const d = grid[y1 * res + x1];
    return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let value = 0;
      let norm = 0;
      for (let l = 0; l < layers.length; l += 1) {
        const layer = layers[l];
        value +=
          sample(layer.grid, layer.resolution, x / size, y / size) * layer.amp;
        norm += layer.amp;
      }
      value /= norm;
      value = Math.min(1, Math.max(0, (value - 0.5) * contrast + 0.5));
      const px = value * 255;
      const i = (y * size + x) * 4;
      image.data[i] = px;
      image.data[i + 1] = px;
      image.data[i + 2] = px;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export default function LiquidSlideshow({
  images = DEFAULT_IMAGES,
  captions = [],
  stageWidth = 1920,
  stageHeight = 1080,
  canvasScale = 1.2,
  autoPlay = true,
  autoPlaySpeedX = 10,
  autoPlaySpeedY = 3,
  displaceScaleX = 200,
  displaceScaleY = 70,
  idleDisplaceScale = 20,
  distortDuration = 1,
  fadeDuration = 0.5,
  noiseSize = 512,
  noiseCells = 4,
  noiseOctaves = 4,
  noiseContrast = 1.6,
  displacementImage = "",
  displaceAutoFit = false,
  wacky = false,
  interactive = false,
  interactionEvent = "hover",
  loop = true,
  autoAdvance = false,
  autoAdvanceDelay = 5000,
  showArrows = true,
  showDots = true,
  showCounter = false,
  bgColor = "#000",
  navColor = "#ffffffcc",
  navHoverColor = "#ffffff",
  textColor = "#ffffff",
  fadeInDuration = 600,
  className = "",
}) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    Promise.all([
      loadFirstAvailable(PIXI_SOURCES, "PIXI"),
      loadScript(GSAP_SRC),
    ])
      .then(() => {
        const PIXI = window.PIXI;
        const gsap = window.gsap;
        const host = hostRef.current;
        if (disposed || !PIXI || !gsap || !host) return;

        const renderer = new PIXI.autoDetectRenderer(stageWidth, stageHeight, {
          transparent: true,
          antialias: true,
          resolution: 1,
        });
        const view = renderer.view;
        view.style.position = "absolute";
        view.style.top = "0";
        view.style.left = "0";
        view.style.width = "100%";
        view.style.height = "100%";
        view.style.objectFit = "cover";
        view.style.transformOrigin = "center center";
        view.style.transform = `scale(${canvasScale})`;
        host.appendChild(view);

        const stage = new PIXI.Container();
        const slides = new PIXI.Container();
        stage.addChild(slides);
        stage.interactive = true;

        const mapTexture = displacementImage
          ? PIXI.Texture.fromImage(displacementImage)
          : PIXI.Texture.fromCanvas(
              createNoiseCanvas(
                noiseSize,
                noiseCells,
                noiseOctaves,
                noiseContrast,
              ),
            );
        const mapSprite = new PIXI.Sprite(mapTexture);
        mapSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        mapSprite.scale.set(2);

        const filter = new PIXI.filters.DisplacementFilter(mapSprite);
        filter.autoFit = displaceAutoFit;
        stage.filters = [filter];

        const idle = autoPlay ? idleDisplaceScale : 0;
        filter.scale.x = idle;
        filter.scale.y = idle;

        if (wacky) {
          mapSprite.anchor.set(0.5);
          mapSprite.x = stageWidth / 2;
          mapSprite.y = stageHeight / 2;
        }
        stage.addChild(mapSprite);

        let pending = images.length;
        const settle = () => {
          pending -= 1;
          if (pending <= 0 && !disposed) setReady(true);
        };

        const sprites = images.map((src, i) => {
          const texture = PIXI.Texture.fromImage(src);
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.x = stageWidth / 2;
          sprite.y = stageHeight / 2;
          sprite.alpha = i === 0 ? 1 : 0;

          const cover = () => {
            const tw = texture.width || texture.baseTexture.width;
            const th = texture.height || texture.baseTexture.height;
            if (!tw || !th) return;
            const scale = Math.max(stageWidth / tw, stageHeight / th);
            sprite.scale.set(scale);
          };

          if (texture.baseTexture.hasLoaded) {
            cover();
            settle();
          } else {
            texture.baseTexture.once("loaded", () => {
              cover();
              settle();
            });
            texture.baseTexture.once("error", settle);
          }

          slides.addChild(sprite);
          return sprite;
        });

        if (!images.length) setReady(true);

        const ticker = new PIXI.ticker.Ticker();
        ticker.add((delta) => {
          if (autoPlay) {
            mapSprite.x += autoPlaySpeedX * delta;
            mapSprite.y += autoPlaySpeedY;
          }
          renderer.render(stage);
        });
        ticker.start();

        let current = 0;
        let playing = false;
        let timeline = null;

        const moveTo = (next) => {
          if (playing || next === current || !sprites[next]) return;
          playing = true;
          timeline = gsap.timeline({
            onUpdate: () => {
              if (wacky && timeline) {
                mapSprite.rotation += timeline.progress() * 0.02;
                mapSprite.scale.set(timeline.progress() * 3);
              }
            },
            onComplete: () => {
              current = next;
              playing = false;
              if (wacky) mapSprite.scale.set(2);
              if (!disposed) setIndex(next);
            },
          });

          timeline
            .to(filter.scale, {
              duration: distortDuration,
              x: displaceScaleX,
              y: displaceScaleY,
            })
            .to(sprites[current], { duration: fadeDuration, alpha: 0 })
            .to(sprites[next], { duration: fadeDuration, alpha: 1 })
            .to(filter.scale, {
              duration: distortDuration,
              x: idle,
              y: idle,
            });
        };

        const step = (dir) => {
          const last = sprites.length - 1;
          if (dir === "next") {
            if (current < last) moveTo(current + 1);
            else if (loop) moveTo(0);
          } else if (current > 0) moveTo(current - 1);
          else if (loop) moveTo(last);
        };

        let rafId = null;
        const spin = () => {
          mapSprite.rotation += 0.001;
          rafId = requestAnimationFrame(spin);
        };

        if (interactive) {
          slides.interactive = true;
          slides.buttonMode = true;

          const wantHover =
            interactionEvent === "hover" || interactionEvent === "both";
          const wantClick =
            interactionEvent === "click" || interactionEvent === "both";

          if (wantHover) {
            slides.pointerover = (event) => {
              const { x, y } = event.data.global;
              gsap.to(filter.scale, {
                duration: 1,
                x: `+=${Math.sin(x) * 100}`,
                y: `+=${Math.cos(y) * 100}`,
              });
              spin();
            };
            slides.pointerout = () => {
              gsap.to(filter.scale, { duration: 1, x: idle, y: idle });
              if (rafId) cancelAnimationFrame(rafId);
            };
          }

          if (wantClick) {
            slides.pointerdown = (event) => {
              const { x, y } = event.data.global;
              gsap.to(filter.scale, {
                duration: 1,
                x: `+=${Math.sin(x) * 1200}`,
                y: `+=${Math.cos(y) * 200}`,
              });
            };
            slides.pointerup = () => {
              gsap.to(filter.scale, { duration: 1, x: idle, y: idle });
              if (rafId) cancelAnimationFrame(rafId);
            };
          }
        }

        apiRef.current = {
          next: () => step("next"),
          prev: () => step("prev"),
          jump: (target) => moveTo(target),
        };

        cleanup = () => {
          if (rafId) cancelAnimationFrame(rafId);
          if (timeline) timeline.kill();
          gsap.killTweensOf(filter.scale);
          ticker.stop();
          ticker.destroy();
          if (view.parentNode) view.parentNode.removeChild(view);
          renderer.destroy(true);
          apiRef.current = null;
        };
      })
      .catch((e) =>
        console.error("[LiquidSlideshow] library load failed:", e.message),
      );

    return () => {
      disposed = true;
      cleanup();
    };
  }, [
    images,
    stageWidth,
    stageHeight,
    canvasScale,
    autoPlay,
    autoPlaySpeedX,
    autoPlaySpeedY,
    displaceScaleX,
    displaceScaleY,
    idleDisplaceScale,
    distortDuration,
    fadeDuration,
    noiseSize,
    noiseCells,
    noiseOctaves,
    noiseContrast,
    displacementImage,
    displaceAutoFit,
    wacky,
    interactive,
    interactionEvent,
    loop,
  ]);

  useEffect(() => {
    if (!autoAdvance || images.length < 2) return undefined;
    const id = setInterval(() => {
      apiRef.current?.next();
    }, autoAdvanceDelay);
    return () => clearInterval(id);
  }, [autoAdvance, autoAdvanceDelay, images.length]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowRight") apiRef.current?.next();
      else if (event.key === "ArrowLeft") apiRef.current?.prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const total = images.length;

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={hostRef}
        className="absolute inset-0 transition-opacity ease-out"
        style={{
          opacity: ready ? 1 : 0,
          transitionDuration: `${fadeInDuration}ms`,
        }}
      />

      {captions[index] ? (
        <p
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 px-8 text-center text-xs font-medium uppercase tracking-[0.42em] transition-opacity duration-500 sm:text-sm"
          style={{ color: textColor, opacity: ready ? 1 : 0 }}
        >
          {captions[index]}
        </p>
      ) : null}

      {showArrows && total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => apiRef.current?.prev()}
            className="group absolute left-0 top-1/2 z-30 -translate-y-1/2 p-6 sm:p-8"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 transition-colors duration-300"
              style={{ fill: navColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.fill = navHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.fill = navColor;
              }}
            >
              <polygon points="6.3,12.8 20.9,12.8 20.9,11.2 6.3,11.2 10.2,7.2 9,6 3.1,12 9,18 10.2,16.8" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => apiRef.current?.next()}
            className="group absolute right-0 top-1/2 z-30 -translate-y-1/2 p-6 sm:p-8"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 rotate-180 transition-colors duration-300"
              style={{ fill: navColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.fill = navHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.fill = navColor;
              }}
            >
              <polygon points="6.3,12.8 20.9,12.8 20.9,11.2 6.3,11.2 10.2,7.2 9,6 3.1,12 9,18 10.2,16.8" />
            </svg>
          </button>
        </>
      ) : null}

      {showDots && total > 1 ? (
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => apiRef.current?.jump(i)}
              className="h-2 w-2 rounded-full transition-transform duration-300 hover:scale-125"
              style={{
                backgroundColor: i === index ? navHoverColor : navColor,
                opacity: i === index ? 1 : 0.45,
              }}
            />
          ))}
        </div>
      ) : null}

      {showCounter && total > 1 ? (
        <p
          className="absolute bottom-8 right-8 z-30 font-mono text-xs tabular-nums"
          style={{ color: navColor }}
        >
          <span style={{ color: navHoverColor }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="px-1 opacity-50">/</span>
          {String(total).padStart(2, "0")}
        </p>
      ) : null}
    </div>
  );
}
