"use client";

import { useEffect, useRef, useState } from "react";

// ─── ThreeDRingCarousel ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// containerPerspective  number    2000     3D perspective field depth distance (px)
// ringRadius            number    500      Z-depth tracking radius placement offset (px)
// dragVelocityMultiplier number   0.35     Drag sensitivity (Lower = slower, smoother rotation)
// entryDuration         number    1.5      GSAP initial entrance sequence run-time (s)
// entryStagger          number    0.1      Stagger delay separation gap per image (s)
// totalItems            number    10       Total calculated nodes matching DOM markup mapping
// vignetteWidth         string    "1400px" Edge blending layer explicit configuration mask
// customImageIdOffset   number    32       Base identifier parameter for source asset images
// ──────────────────────────────────────────────────────────────────────────

export default function Carousel3DRing({
  containerPerspective = 2000,
  ringRadius = 500,
  dragVelocityMultiplier = 0.1,
  entryDuration = 1.5,
  entryStagger = 0.1,
  totalItems = 10,
  vignetteWidth = "1400px",
  customImageIdOffset = 32,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const mainContainer = containerRef.current;
    const dragger = mainContainer.querySelector("#dragger");
    const ring = mainContainer.querySelector("#ring");
    const imgs = mainContainer.querySelectorAll(".img-node");

    let xPos = 0;
    const totalCount = parseInt(totalItems, 10);
    const degreesPerItem = 360 / totalCount;

    // Helper utility computing parallax image coordinates
    const getBgPos = (i, currentRotationY) => {
      const { gsap } = window;
      if (!gsap) return "0px 0px";
      const wrapped = gsap.utils.wrap(
        0,
        360,
        currentRotationY - 180 - i * degreesPerItem,
      );
      return `${-(wrapped / 360) * 400}px 0px`;
    };

    const updateAllBackgroundPositions = (currentRotationY) => {
      const { gsap } = window;
      if (!gsap) return;
      imgs.forEach((img, i) => {
        gsap.set(img, { backgroundPosition: getBgPos(i, currentRotationY) });
      });
    };

    // Dynamically query script dependencies asynchronously to eliminate hydration/SSR mismatch loops
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
        el.onerror = () =>
          reject(new Error(`Failed to initialize dependency: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js",
      ),
    ])
      .then(() => {
        const { gsap, Draggable } = window;
        if (!gsap || !Draggable) return;

        gsap.registerPlugin(Draggable);

        // Standardize base styling values using the execution matrix
        gsap.set([dragger, ring], { width: "100%", height: "100%" });

        // Build core production timeline pipeline
        const tl = gsap.timeline();

        tl.set(dragger, { opacity: 0 });
        tl.set(ring, { rotationY: 180 });

        imgs.forEach((img, i) => {
          gsap.set(img, {
            width: "100%",
            height: "100%",
            rotateY: i * -degreesPerItem,
            transformOrigin: `50% 50% ${ringRadius}px`,
            z: -ringRadius,
            backgroundImage: `url(https://picsum.photos/id/${i + parseInt(customImageIdOffset, 10)}/700/300/)`,
            backgroundPosition: getBgPos(i, 180),
            backfaceVisibility: "hidden",
          });
        });

        tl.from(imgs, {
          duration: parseFloat(entryDuration),
          y: 200,
          opacity: 0,
          stagger: parseFloat(entryStagger),
          ease: "expo.out",
        });

        // Initialize active interactions setup
        Draggable.create(dragger, {
          onDragStart: function (e) {
            let clientX = e.clientX;
            if (e.touches && e.touches.length > 0) {
              clientX = e.touches[0].clientX;
            }
            xPos = Math.round(clientX);
          },

          onDrag: function (e) {
            let clientX = e.clientX;
            if (e.touches && e.touches.length > 0) {
              clientX = e.touches[0].clientX;
            }

            const currentX = Math.round(clientX);
            // Apply drag velocity multiplier to reduce rotation speed sensitivity
            const delta =
              ((currentX - xPos) * parseFloat(dragVelocityMultiplier)) % 360;

            gsap.to(ring, {
              rotationY: `-=${delta}`,
              duration: 0,
              onUpdate: () => {
                const updatedRotationY = gsap.getProperty(ring, "rotationY");
                updateAllBackgroundPositions(updatedRotationY);
              },
            });

            xPos = currentX;
          },

          onDragEnd: function () {
            gsap.set(dragger, { x: 0, y: 0 });
          },
        });
      })
      .catch((err) =>
        console.error(
          "[ThreeDRingCarousel] Failed loading core GSAP components:",
          err,
        ),
      );
  }, [
    isMounted,
    containerPerspective,
    ringRadius,
    dragVelocityMultiplier,
    entryDuration,
    entryStagger,
    totalItems,
    customImageIdOffset,
  ]);

  // Handle server rendering cleanly safely escaping content layouts
  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-black text-white/40 font-mono text-xs flex items-center justify-center opacity-0 select-none">
        Preparing 3D environment stack context pipeline loop...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-black overflow-hidden relative select-none antialiased [transform-style:preserve-3d]"
    >
      {/* 3D Main Workspace Viewport Root Shell */}
      <div
        className="w-[300px] h-[300px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] z-10"
        style={{ perspective: `${containerPerspective}px` }}
      >
        <div
          id="ring"
          className="absolute top-0 left-0 [transform-style:preserve-3d]"
        >
          {Array.from({ length: parseInt(totalItems, 10) }).map((_, index) => (
            <div
              key={index}
              className="img-node absolute top-0 left-0 bg-cover bg-no-repeat bg-center pointer-events-none rounded-sm border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] [transform-style:preserve-3d]"
            />
          ))}
        </div>
      </div>

      {/* Original Vignette Shadow Effect: Explicitly applies deep gradient falls to the left and right corners */}
      <div
        className="vignette h-full absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none z-20 bg-gradient-to-r from-black via-transparent to-black [background-size:100%_100%] [mask-image:none]"
        style={{
          width: vignetteWidth,
          background:
            "linear-gradient(to right, rgba(0,0,0,1) 12%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 88%)",
        }}
      />

      {/* Invisible Capture Layer Receiving Global Controller Inputs */}
      <div
        id="dragger"
        className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing z-30 [transform-style:preserve-3d]"
      />
    </div>
  );
}
