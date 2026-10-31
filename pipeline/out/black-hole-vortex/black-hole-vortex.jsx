"use client";

import { useEffect, useRef, useId } from "react";

const DEFAULT_AURA_GRADIENT =
  "linear-gradient(20deg, #00f8f1, #ffbd1e20 16.5%, #fe848f 33%, #fe848f20 49.5%, #00f8f1 66%, #00f8f160 85.5%, #ffbd1e 100%) 0 100% / 100% 200%";

export default function BlackHoleVortex({
  bgColor = "#141414",
  discColor = "#444444",
  discLineWidth = 2,
  totalDiscs = 100,
  totalLines = 100,
  totalParticles = 100,
  startDiscWidthRatio = 0.75,
  startDiscHeightRatio = 0.7,
  startDiscYRatio = 0.45,
  endDiscYRatio = 0.95,
  particleAreaHeightRatio = 0.85,
  vignetteInnerStop = "10%",
  vignetteOuterStop = "50%",
  glowColor = "#a900ff",
  glowInnerStop = "20%",
  glowOuterStop = "75%",
  auraGradient = DEFAULT_AURA_GRADIENT,
  auraBlur = 50,
  auraOpacity = 0.75,
  auraAnimationDuration = 5,
  overlayOpacity = 0.5,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let destroyed = false;
    let animationFrameId = null;
    let resizeHandler = null;

    import("easing-utils")
      .then((mod) => {
        if (destroyed) return;
        const easingUtils = mod.default || mod;

        const container = containerRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let rect, render, discs, lines, linesCanvas, linesCtx;
        let particles, particleArea, startDisc, endDisc, clip;

        function setSize() {
          rect = container.getBoundingClientRect();
          render = {
            width: rect.width,
            height: rect.height,
            dpi: window.devicePixelRatio,
          };
          canvas.width = render.width * render.dpi;
          canvas.height = render.height * render.dpi;
        }

        function tweenValue(start, end, p, ease = false) {
          const delta = end - start;
          const easeFn =
            easingUtils[
              ease
                ? "ease" + ease.charAt(0).toUpperCase() + ease.slice(1)
                : "linear"
            ];
          return start + delta * easeFn(p);
        }

        function tweenDisc(disc) {
          disc.x = tweenValue(startDisc.x, endDisc.x, disc.p);
          disc.y = tweenValue(startDisc.y, endDisc.y, disc.p, "inExpo");
          disc.w = tweenValue(startDisc.w, endDisc.w, disc.p);
          disc.h = tweenValue(startDisc.h, endDisc.h, disc.p);
          return disc;
        }

        function setDiscs() {
          const { width, height } = rect;
          discs = [];

          startDisc = {
            x: width * 0.5,
            y: height * startDiscYRatio,
            w: width * startDiscWidthRatio,
            h: height * startDiscHeightRatio,
          };
          endDisc = {
            x: width * 0.5,
            y: height * endDiscYRatio,
            w: 0,
            h: 0,
          };

          let prevBottom = height;
          clip = {};

          for (let i = 0; i < totalDiscs; i++) {
            const p = i / totalDiscs;
            const disc = tweenDisc({ p });
            const bottom = disc.y + disc.h;

            if (bottom <= prevBottom) {
              clip = { disc: { ...disc }, i };
            }
            prevBottom = bottom;
            discs.push(disc);
          }

          clip.path = new Path2D();
          clip.path.ellipse(
            clip.disc.x,
            clip.disc.y,
            clip.disc.w,
            clip.disc.h,
            0,
            0,
            Math.PI * 2,
          );
          clip.path.rect(
            clip.disc.x - clip.disc.w,
            0,
            clip.disc.w * 2,
            clip.disc.y,
          );
        }

        function setLines() {
          const { width, height } = rect;
          lines = [];

          const linesAngle = (Math.PI * 2) / totalLines;
          for (let i = 0; i < totalLines; i++) lines.push([]);

          discs.forEach((disc) => {
            for (let i = 0; i < totalLines; i++) {
              const angle = i * linesAngle;
              lines[i].push({
                x: disc.x + Math.cos(angle) * disc.w,
                y: disc.y + Math.sin(angle) * disc.h,
              });
            }
          });

          const OffscreenCtor =
            typeof OffscreenCanvas !== "undefined" ? OffscreenCanvas : null;
          if (OffscreenCtor) {
            linesCanvas = new OffscreenCtor(width, height);
          } else {
            linesCanvas = document.createElement("canvas");
            linesCanvas.width = width;
            linesCanvas.height = height;
          }
          linesCtx = linesCanvas.getContext("2d");

          lines.forEach((line) => {
            linesCtx.save();
            let lineIsIn = false;

            line.forEach((p1, j) => {
              if (j === 0) return;
              const p0 = line[j - 1];

              if (
                !lineIsIn &&
                (linesCtx.isPointInPath(clip.path, p1.x, p1.y) ||
                  linesCtx.isPointInStroke(clip.path, p1.x, p1.y))
              ) {
                lineIsIn = true;
              } else if (lineIsIn) {
                linesCtx.clip(clip.path);
              }

              linesCtx.beginPath();
              linesCtx.moveTo(p0.x, p0.y);
              linesCtx.lineTo(p1.x, p1.y);
              linesCtx.strokeStyle = discColor;
              linesCtx.lineWidth = discLineWidth;
              linesCtx.stroke();
              linesCtx.closePath();
            });

            linesCtx.restore();
          });
        }

        function initParticle(start = false) {
          const sx = particleArea.sx + particleArea.sw * Math.random();
          const ex = particleArea.ex + particleArea.ew * Math.random();
          const dx = ex - sx;
          const y = start ? particleArea.h * Math.random() : particleArea.h;
          const r = 0.5 + Math.random() * 4;
          const vy = 0.5 + Math.random();

          return {
            x: sx,
            sx,
            dx,
            y,
            vy,
            p: 0,
            r,
            c: `rgba(255, 255, 255, ${Math.random()})`,
          };
        }

        function setParticles() {
          const { width, height } = rect;
          particles = [];

          particleArea = {
            sw: clip.disc.w * 0.5,
            ew: clip.disc.w * 2,
            h: height * particleAreaHeightRatio,
          };
          particleArea.sx = (width - particleArea.sw) / 2;
          particleArea.ex = (width - particleArea.ew) / 2;

          for (let i = 0; i < totalParticles; i++) {
            particles.push(initParticle(true));
          }
        }

        function drawDiscs() {
          ctx.strokeStyle = discColor;
          ctx.lineWidth = discLineWidth;

          ctx.beginPath();
          ctx.ellipse(
            startDisc.x,
            startDisc.y,
            startDisc.w,
            startDisc.h,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
          ctx.closePath();

          discs.forEach((disc, i) => {
            if (i % 5 !== 0) return;

            if (disc.w < clip.disc.w - 5) {
              ctx.save();
              ctx.clip(clip.path);
            }

            ctx.beginPath();
            ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();

            if (disc.w < clip.disc.w - 5) {
              ctx.restore();
            }
          });
        }

        function drawLines() {
          ctx.drawImage(linesCanvas, 0, 0);
        }

        function drawParticles() {
          ctx.save();
          ctx.clip(clip.path);

          particles.forEach((particle) => {
            ctx.fillStyle = particle.c;
            ctx.beginPath();
            ctx.rect(particle.x, particle.y, particle.r, particle.r);
            ctx.closePath();
            ctx.fill();
          });

          ctx.restore();
        }

        function moveDiscs() {
          discs.forEach((disc) => {
            disc.p = (disc.p + 0.001) % 1;
            tweenDisc(disc);
          });
        }

        function moveParticles() {
          particles.forEach((particle) => {
            particle.p = 1 - particle.y / particleArea.h;
            particle.x = particle.sx + particle.dx * particle.p;
            particle.y -= particle.vy;

            if (particle.y < 0) {
              particle.y = initParticle().y;
            }
          });
        }

        function tick() {
          if (destroyed) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.scale(render.dpi, render.dpi);

          moveDiscs();
          moveParticles();

          drawDiscs();
          drawLines();
          drawParticles();

          ctx.restore();

          animationFrameId = requestAnimationFrame(tick);
        }

        function init() {
          setSize();
          setDiscs();
          setLines();
          setParticles();
          animationFrameId = requestAnimationFrame(tick);
        }

        resizeHandler = () => {
          setSize();
          setDiscs();
          setLines();
          setParticles();
        };

        init();
        window.addEventListener("resize", resizeHandler);

        containerRef.current.__cleanupVortex = () => {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          window.removeEventListener("resize", resizeHandler);
        };
      });

    return () => {
      destroyed = true;
      containerRef.current?.__cleanupVortex?.();
    };

  }, [
    totalDiscs,
    totalLines,
    totalParticles,
    startDiscWidthRatio,
    startDiscHeightRatio,
    startDiscYRatio,
    endDiscYRatio,
    particleAreaHeightRatio,
    discColor,
    discLineWidth,
  ]);

  return (
    <div
      className={`relative w-screen h-screen m-0 p-0 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes aura-glow-${uid} {
              0% { background-position: 0 100%; }
              100% { background-position: 0 300%; }
            }
          `,
        }}
      />

      <div
        ref={containerRef}
        className="absolute top-0 left-0 m-0 p-0 w-full h-full overflow-hidden"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
        <div
          className="absolute top-1/2 left-1/2 z-[2] block w-[150%] h-[140%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `radial-gradient(ellipse at 50% 55%, transparent ${vignetteInnerStop}, black ${vignetteOuterStop})`,
          }}
        />
        <div
          className="absolute top-[-71.5%] left-1/2 z-[3] w-[30%] h-[140%] -translate-x-1/2 rounded-b-full [mix-blend-mode:plus-lighter]"
          style={{
            background: auraGradient,
            filter: `blur(${auraBlur}px)`,
            opacity: auraOpacity,
            animation: `aura-glow-${uid} ${auraAnimationDuration}s infinite linear`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 z-[5] block w-full h-full -translate-x-1/2 -translate-y-1/2 [mix-blend-mode:overlay]"
          style={{
            background: `radial-gradient(ellipse at 50% 75%, ${glowColor} ${glowInnerStop}, transparent ${glowOuterStop})`,
          }}
        />
        <div
          className="absolute top-0 left-0 z-10 w-full h-full [mix-blend-mode:overlay] [background-image:repeating-linear-gradient(transparent,transparent_1px,white_1px,white_2px)]"
          style={{ opacity: overlayOpacity }}
        />
      </div>
    </div>
  );
}
