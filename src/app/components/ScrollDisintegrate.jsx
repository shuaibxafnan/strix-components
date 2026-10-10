"use client";

import { useEffect, useRef, useState } from "react";

// ─── ScrollDisintegrate ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// imageSrc          string   Base64 or URL asset path for target element
// particleCount     number   Amount of distinct canvas layers to construct (COUNT)
// fragmentOverlap   number   Redundancy assignment count loop (REPEAT_COUNT)
// scrubSpeed        number   Smooth scrub mapping delay in seconds
// scrollDistance    string   Total artificial viewport scroll canvas length
// containerWidth    string   Tailwind explicitly configured container width bounds
// containerHeight   string   Tailwind explicitly configured container height bounds
// maxRotation       number   Maximum randomized structural spin degree variation
// maxDisplacement   number   Radial structural dispersion offset vector boundary
// ──────────────────────────────────────────────────────────────────────────

export default function ScrollDisintegrate({
  imageSrc = "https://ik.imagekit.io/akiAfnan/Odyssey/resorts/pexels-introspectivedsgn-8266881.jpg",
  particleCount = 75,
  fragmentOverlap = 3,
  scrubSpeed = 1,
  scrollDistance = "300vh",
  containerWidth = "w-[600px]",
  containerHeight = "h-[400px]",
  maxRotation = 30,
  maxDisplacement = 40,
}) {
  const containerRef = useRef(null);
  const captureRef = useRef(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Safely inject external processing environments asynchronously to avoid Hydration mismatches
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed to load dependency script: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/5.0.0/imagesloaded.pkgd.min.js"),
    ])
      .then(() => {
        setScriptsLoaded(true);
      })
      .catch((err) => console.error("[ScrollDisintegrate] Script boot pipeline failed:", err));
  }, []);

  // Initialize Canvas Fragment Matrix once libraries and resources are available
  useEffect(() => {
    if (!scriptsLoaded || !captureRef.current) return;

    const { gsap, ScrollTrigger, html2canvas, imagesLoaded } = window;
    if (!gsap || !ScrollTrigger || !html2canvas || !imagesLoaded) return;

    gsap.registerPlugin(ScrollTrigger);

    const captureEl = captureRef.current;
    const generatedCanvases = [];

    const createCanvases = (targetEl) => {
      html2canvas(targetEl, {
        useCORS: true,
        backgroundColor: null,
        logging: false,
      }).then((canvas) => {
        const width = canvas.width;
        const height = canvas.height;
        const ctx = canvas.getContext("2d");
        
        // Read native pixel buffer data map from static target element capture
        const imageData = ctx.getImageData(0, 0, width, height);
        const dataList = [];

        // Generate empty image data grids first
        for (let i = 0; i < particleCount; i++) {
          dataList.push(ctx.createImageData(width, height));
        }

        // Segment core visual raw data arrays randomly across our particle layers
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            for (let l = 0; l < fragmentOverlap; l++) {
              const index = (x + y * width) * 4;
              // Horizontal linear bias equation recreating Thanos dispersion path layout
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

        // Mount layers into the viewport and bind into the main timeline
        dataList.forEach((data, i) => {
          const clonedCanvas = canvas.cloneNode();
          clonedCanvas.getContext("2d").putImageData(data, 0, 0);
          
          // Apply styling layout directly mirroring fixed structure properties
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

          tl.to(clonedCanvas, {
            duration: 1,
            rotate: randomRotationAngle,
            translateX: maxDisplacement * Math.sin(randomAngle),
            translateY: maxDisplacement * Math.cos(randomAngle),
            opacity: 0,
            delay: (i / dataList.length) * 2,
          });
        });

        // HANDSHAKE FIXED: Switch visibility ONLY after all particle canvas shards are generated & attached to DOM
        targetEl.style.visibility = "hidden";
      });
    };

    // Ensure assets are compiled cleanly before initializing computation layers
    const imgElements = captureEl.querySelectorAll("img");
    imagesLoaded(imgElements, () => {
      createCanvases(captureEl);
    });

    // Cleanup generated canvas frames and kill active ScrollTrigger lifecycles upon unmounting
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      generatedCanvases.forEach((canvas) => {
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      });
      if (captureEl) {
        captureEl.style.visibility = "";
      }
    };
  }, [
    scriptsLoaded,
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
      className="relative w-full block"
      style={{ height: scrollDistance }}
    >
      {/* Target Content Node Box pinned inside the sticky viewport block */}
      <div
        id="capture"
        ref={captureRef}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 overflow-hidden ${containerWidth} ${containerHeight}`}
      >
        <img
          src={imageSrc}
          alt="Disintegration Target Source"
          className="w-full h-full object-cover inline-block"
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
}