"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=1920&q=80",
];

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

export default function LiquidHoldSlideshow({
  images = DEFAULT_IMAGES,
  captions = [],
  stageWidth = 1920,
  stageHeight = 1080,
  canvasScale = 1.2,
  autoPlay = true,
  autoPlaySpeedX = 0.3,
  autoPlaySpeedY = 0.3,
  displaceScaleX = 800,
  displaceScaleY = 500,
  idleDisplaceScale = 20,
  rampDuration = 1.5,
  releaseDuration = 1.5,
  releaseOffset = 0.8,
  fadeOutDuration = 1.5,
  fadeInDuration = 1,
  fadeInOffset = 1,
  rampEase = "power2.out",
  releaseEase = "expo.out",
  noiseSize = 512,
  noiseCells = 3,
  noiseOctaves = 4,
  noiseContrast = 1.4,
  displacementImage = "",
  displaceAutoFit = true,
  displacementCenter = true,
  mapScale = 2,
  interactive = true,
  interactionEvent = "click",
  holdStrengthX = 1200,
  holdStrengthY = 200,
  hoverStrength = 100,
  holdDuration = 1,
  dispatchPointerOver = false,
  spinOnHover = true,
  captionColor = "#ffffff",
  captionSize = 14,
  captionSpacing = 20,
  captionWrapWidth = 400,
  loop = true,
  autoAdvance = false,
  autoAdvanceDelay = 6000,
  showArrows = true,
  showDots = true,
  showHint = true,
  hintText = "Click and hold",
  bgColor = "#000",
  navColor = "#ffffffcc",
  navHoverColor = "#ffffff",
  revealDuration = 600,
  className = "",
}) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    Promise.all([import("pixi.js"), import("gsap")])
      .then(([pixiModule, gsapModule]) => {
        const PIXI = pixiModule.default ?? pixiModule;
        const gsap = gsapModule.gsap ?? gsapModule.default;
        const host = hostRef.current;
        if (disposed || !PIXI || !gsap || !host) return;

        const renderer = new PIXI.autoDetectRenderer(stageWidth, stageHeight, {
          transparent: true,
          antialias: true,
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
        mapSprite.scale.set(mapScale);

        const filter = new PIXI.filters.DisplacementFilter(mapSprite);
        filter.autoFit = displaceAutoFit;
        stage.filters = [filter];

        const idle = autoPlay ? idleDisplaceScale : 0;
        filter.scale.x = idle;
        filter.scale.y = idle;

        if (displacementCenter) {
          mapSprite.anchor.set(0.5);
          mapSprite.x = stageWidth / 2;
          mapSprite.y = stageHeight / 2;
        }
        stage.addChild(mapSprite);

        const captionStyle = new PIXI.TextStyle({
          fill: captionColor,
          wordWrap: true,
          wordWrapWidth: captionWrapWidth,
          letterSpacing: captionSpacing,
          fontSize: captionSize,
          align: "center",
        });

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

          if (captions[i]) {
            const label = new PIXI.Text(captions[i], captionStyle);
            label.anchor.set(0.5);
            sprite.addChild(label);
          }

          const cover = () => {
            const tw = texture.width || texture.baseTexture.width;
            const th = texture.height || texture.baseTexture.height;
            if (!tw || !th) return;
            const scale = Math.max(stageWidth / tw, stageHeight / th);
            sprite.scale.set(scale);
            if (sprite.children.length) {
              const label = sprite.children[0];
              label.scale.set(1 / scale);
              label.x = 0;
              label.y = 0;
            }
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
            onComplete: () => {
              current = next;
              playing = false;
              if (!disposed) setIndex(next);
            },
          });

          timeline
            .to(filter.scale, {
              duration: rampDuration,
              x: displaceScaleX,
              y: displaceScaleY,
              ease: rampEase,
            })
            .to(
              sprites[current],
              { duration: fadeOutDuration, alpha: 0, ease: rampEase },
              0,
            )
            .to(
              sprites[next],
              { duration: fadeInDuration, alpha: 1, ease: rampEase },
              fadeInOffset,
            )
            .to(
              filter.scale,
              {
                duration: releaseDuration,
                x: idle,
                y: idle,
                ease: releaseEase,
              },
              releaseOffset,
            );
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
        const stopSpin = () => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = null;
        };

        const release = () => {
          if (dispatchPointerOver) {
            gsap.to(filter.scale, {
              duration: holdDuration,
              x: 0,
              y: 0,
              onComplete: () => {
                gsap.to(filter.scale, {
                  duration: holdDuration,
                  x: idle,
                  y: idle,
                });
              },
            });
          } else {
            gsap.to(filter.scale, {
              duration: holdDuration,
              x: idle,
              y: idle,
            });
            stopSpin();
          }
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
                duration: holdDuration,
                x: `+=${Math.sin(x) * hoverStrength}`,
                y: `+=${Math.cos(y) * hoverStrength}`,
              });
              if (spinOnHover) spin();
            };
          }

          if (wantClick) {
            slides.pointerdown = (event) => {
              if (playing) return;
              const { x, y } = event.data.global;
              gsap.to(filter.scale, {
                duration: holdDuration,
                x: `+=${Math.sin(x) * holdStrengthX}`,
                y: `+=${Math.cos(y) * holdStrengthY}`,
              });
              if (spinOnHover) spin();
            };
            slides.pointerup = release;
          }

          slides.pointerout = release;
        }

        apiRef.current = {
          next: () => step("next"),
          prev: () => step("prev"),
          jump: (target) => moveTo(target),
        };

        cleanup = () => {
          stopSpin();
          if (timeline) timeline.kill();
          gsap.killTweensOf(filter.scale);
          sprites.forEach((sprite) => gsap.killTweensOf(sprite));
          ticker.stop();
          ticker.destroy();
          if (view.parentNode) view.parentNode.removeChild(view);
          renderer.destroy(true);
          apiRef.current = null;
        };
      })
      .catch(() => {});

    return () => {
      disposed = true;
      cleanup();
    };
  }, [
    images,
    captions,
    stageWidth,
    stageHeight,
    canvasScale,
    autoPlay,
    autoPlaySpeedX,
    autoPlaySpeedY,
    displaceScaleX,
    displaceScaleY,
    idleDisplaceScale,
    rampDuration,
    releaseDuration,
    releaseOffset,
    fadeOutDuration,
    fadeInDuration,
    fadeInOffset,
    rampEase,
    releaseEase,
    noiseSize,
    noiseCells,
    noiseOctaves,
    noiseContrast,
    displacementImage,
    displaceAutoFit,
    displacementCenter,
    mapScale,
    interactive,
    interactionEvent,
    holdStrengthX,
    holdStrengthY,
    hoverStrength,
    holdDuration,
    dispatchPointerOver,
    spinOnHover,
    captionColor,
    captionSize,
    captionSpacing,
    captionWrapWidth,
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
          transitionDuration: `${revealDuration}ms`,
        }}
      />

      {showHint && interactive ? (
        <p
          className="pointer-events-none absolute left-1/2 top-8 z-30 -translate-x-1/2 text-[10px] font-medium uppercase tracking-[0.32em] transition-opacity duration-500"
          style={{ color: navColor, opacity: ready ? 1 : 0 }}
        >
          {hintText}
        </p>
      ) : null}

      {showArrows && total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => apiRef.current?.prev()}
            className="absolute left-0 top-1/2 z-30 -translate-y-1/2 p-6 sm:p-8"
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
            className="absolute right-0 top-1/2 z-30 -translate-y-1/2 p-6 sm:p-8"
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
    </div>
  );
}
