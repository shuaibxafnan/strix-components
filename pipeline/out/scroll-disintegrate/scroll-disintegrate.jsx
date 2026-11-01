"use client";

import { useEffect, useRef } from "react";

export default function ScrollDisintegrate({
  imageSrc = "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1600&q=80",
  imageAlt = "Disintegration target",
  particleCount = 75,
  fragmentOverlap = 3,
  scrubSpeed = 1,
  scrollDistance = "300vh",
  containerWidth = "w-[600px]",
  containerHeight = "h-[400px]",
  maxRotation = 30,
  maxDisplacement = 40,
  className = "",
}) {
  const containerRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    if (!captureRef.current) return;

    let cancelled = false;
    const captureEl = captureRef.current;
    const generatedCanvases = [];
    const timelines = [];

    const boot = async () => {
      const [gsapMod, stMod, h2cMod, ilMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("html2canvas"),
        import("imagesloaded"),
      ]);
      if (cancelled) return;

      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const html2canvas = h2cMod.default;
      const imagesLoaded = ilMod.default;

      gsap.registerPlugin(ScrollTrigger);

      const createCanvases = (targetEl) => {
        html2canvas(targetEl, {
          useCORS: true,
          backgroundColor: null,
          logging: false,
        }).then((canvas) => {
          if (cancelled || !containerRef.current) return;
          const width = canvas.width;
          const height = canvas.height;
          const ctx = canvas.getContext("2d");

          const imageData = ctx.getImageData(0, 0, width, height);
          const dataList = [];

          for (let i = 0; i < particleCount; i++) {
            dataList.push(ctx.createImageData(width, height));
          }

          for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
              for (let l = 0; l < fragmentOverlap; l++) {
                const index = (x + y * width) * 4;

                const dataIndex = Math.floor(
                  (particleCount * (Math.random() + (2 * x) / width)) / 3
                );

                if (dataList[dataIndex]) {
                  for (let p = 0; p < 4; p++) {
                    dataList[dataIndex].data[index + p] = imageData.data[index + p];
                  }
                }
              }
            }
          }

          dataList.forEach((data, i) => {
            const clonedCanvas = canvas.cloneNode();
            clonedCanvas.getContext("2d").putImageData(data, 0, 0);

            clonedCanvas.className = "capture-canvas fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10";
            clonedCanvas.style.width = `${targetEl.offsetWidth}px`;
            clonedCanvas.style.height = `${targetEl.offsetHeight}px`;

            containerRef.current.appendChild(clonedCanvas);
            generatedCanvases.push(clonedCanvas);

            const randomAngle = (Math.random() - 0.5) * 2 * Math.PI;
            const randomRotationAngle = maxRotation * (Math.random() - 0.5);

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: containerRef.current,
                scrub: scrubSpeed,
                start: "top top",
                end: () => `+=${window.innerHeight * 2}`,
                invalidateOnRefresh: true,
              },
            });
            timelines.push(tl);

            tl.to(clonedCanvas, {
              duration: 1,
              rotate: randomRotationAngle,
              translateX: maxDisplacement * Math.sin(randomAngle),
              translateY: maxDisplacement * Math.cos(randomAngle),
              opacity: 0,
              delay: (i / dataList.length) * 2,
            });
          });

          targetEl.style.visibility = "hidden";
        });
      };

      imagesLoaded(captureEl.querySelectorAll("img"), () => {
        if (!cancelled) createCanvases(captureEl);
      });
    };

    boot();

    return () => {
      cancelled = true;
      timelines.forEach((tl) => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      });
      generatedCanvases.forEach((canvas) => {
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      });
      captureEl.style.visibility = "";
    };
  }, [
    imageSrc,
    particleCount,
    fragmentOverlap,
    scrubSpeed,
    maxRotation,
    maxDisplacement,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full block ${className}`}
      style={{ height: scrollDistance }}
    >
      <div
        id="capture"
        ref={captureRef}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 overflow-hidden max-w-[92vw] ${containerWidth} ${containerHeight}`}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover inline-block"
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
}
