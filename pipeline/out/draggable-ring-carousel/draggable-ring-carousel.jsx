"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `https://picsum.photos/id/${i + 32}/700/300/`,
);

export default function DraggableRingCarousel({
  images = DEFAULT_IMAGES,
  containerPerspective = 2000,
  ringRadius = 500,
  dragVelocityMultiplier = 0.1,
  entryDuration = 1.5,
  entryStagger = 0.1,
  vignetteWidth = "1400px",
  backgroundColor = "#000000",
  className = "",
}) {
  const containerRef = useRef(null);
  const totalCount = images.length;
  const imagesKey = images.join("|");

  useEffect(() => {
    if (!containerRef.current || totalCount === 0) return;

    const mainContainer = containerRef.current;
    const dragger = mainContainer.querySelector("[data-dragger]");
    const ring = mainContainer.querySelector("[data-ring]");
    const imgs = mainContainer.querySelectorAll(".img-node");
    const degreesPerItem = 360 / totalCount;

    let cancelled = false;
    let tl = null;
    let draggable = null;
    let gsapRef = null;
    let xPos = 0;

    (async () => {
      const gsapModule = await import("gsap");
      const draggableModule = await import("gsap/Draggable");
      if (cancelled) return;
      const gsap = gsapModule.gsap || gsapModule.default;
      const Draggable = draggableModule.Draggable || draggableModule.default;
      gsapRef = gsap;

      gsap.registerPlugin(Draggable);

      const getBgPos = (i, currentRotationY) => {
        const wrapped = gsap.utils.wrap(
          0,
          360,
          currentRotationY - 180 - i * degreesPerItem,
        );
        return `${-(wrapped / 360) * 400}px 0px`;
      };

      const updateAllBackgroundPositions = (currentRotationY) => {
        imgs.forEach((img, i) => {
          gsap.set(img, { backgroundPosition: getBgPos(i, currentRotationY) });
        });
      };

      gsap.set([dragger, ring], { width: "100%", height: "100%" });

      tl = gsap.timeline();

      tl.set(dragger, { opacity: 0 });
      tl.set(ring, { rotationY: 180 });

      imgs.forEach((img, i) => {
        gsap.set(img, {
          width: "100%",
          height: "100%",
          rotateY: i * -degreesPerItem,
          transformOrigin: `50% 50% ${ringRadius}px`,
          z: -ringRadius,
          backgroundImage: `url(${images[i]})`,
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

      [draggable] = Draggable.create(dragger, {
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
    })();

    return () => {
      cancelled = true;
      if (draggable) draggable.kill();
      if (tl) tl.kill();
      if (gsapRef) gsapRef.killTweensOf([ring, dragger, ...imgs]);
    };
  }, [
    imagesKey,
    totalCount,
    containerPerspective,
    ringRadius,
    dragVelocityMultiplier,
    entryDuration,
    entryStagger,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen overflow-hidden relative select-none antialiased [transform-style:preserve-3d] ${className}`}
      style={{ backgroundColor }}
    >
      <div
        className="w-[300px] h-[300px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] z-10"
        style={{ perspective: `${containerPerspective}px` }}
      >
        <div
          data-ring
          className="absolute top-0 left-0 [transform-style:preserve-3d]"
        >
          {images.map((src, index) => (
            <div
              key={index}
              className="img-node absolute top-0 left-0 bg-cover bg-no-repeat bg-center pointer-events-none rounded-sm border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] [transform-style:preserve-3d]"
            />
          ))}
        </div>
      </div>

      <div
        className="h-full absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none z-20"
        style={{
          width: vignetteWidth,
          background: `linear-gradient(to right, ${backgroundColor} 12%, transparent 40%, transparent 60%, ${backgroundColor} 88%)`,
        }}
      />

      <div
        data-dragger
        className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing z-30 [transform-style:preserve-3d]"
      />
    </div>
  );
}
