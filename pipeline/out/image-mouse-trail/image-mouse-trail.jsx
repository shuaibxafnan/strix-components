"use client";

import { useEffect, useRef, useId } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1200&q=80",
];

export default function ImageMouseTrail({
  images = DEFAULT_IMAGES,
  imageWidth = 200,
  imageHeight = 300,
  objectFit = "cover",
  borderRadius = 3,
  movementThreshold = 100,
  spawnDelay = 70,
  maxRotation = 20,
  entranceDuration = 0.6,
  entranceEase = "back.out(2)",
  exitDelay = 0.6,
  exitDuration = 0.6,
  exitEase = "power2.in",
  fadeIn = false,
  fadeOut = false,
  zIndex = 9999,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const trailerRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    let destroyed = false;
    let mouseMoveHandler = null;
    const activeTweens = new Set();
    const clones = new Set();

    import("gsap")
      .then(({ gsap }) => {
        if (destroyed) return;
        if (!trailerRef.current || !galleryRef.current) return;

        const trailer = trailerRef.current;
        const imageEls = galleryRef.current.querySelectorAll(
          `[data-trail-item="${uid}"]`,
        );
        if (!imageEls.length) return;

        let currentImageIndex = 0;
        let lastMousePos = { x: 0, y: 0 };
        let lastImageTime = Date.now();

        mouseMoveHandler = (e) => {
          const dx = e.clientX - lastMousePos.x;
          const dy = e.clientY - lastMousePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < movementThreshold) return;

          const now = Date.now();
          if (now - lastImageTime < spawnDelay) return;

          const image = imageEls[currentImageIndex].cloneNode();
          currentImageIndex = (currentImageIndex + 1) % imageEls.length;

          image.style.left = `${e.clientX - imageWidth / 2}px`;
          image.style.top = `${e.clientY - imageHeight / 2}px`;
          trailer.appendChild(image);
          clones.add(image);

          const entranceTween = gsap.fromTo(
            image,
            {
              opacity: fadeIn ? 0 : 1,
              scale: 0,
              rotation: gsap.utils.random(-maxRotation, maxRotation),
            },
            {
              opacity: 1,
              scale: 1,
              duration: entranceDuration,
              ease: entranceEase,
            },
          );
          activeTweens.add(entranceTween);

          const exitTween = gsap.to(image, {
            opacity: fadeOut ? 0 : 1,
            scale: 0,
            duration: exitDuration,
            delay: exitDelay,
            ease: exitEase,
            onComplete: () => {
              image.remove();
              clones.delete(image);
              activeTweens.delete(exitTween);
            },
          });
          activeTweens.add(exitTween);

          lastMousePos = { x: e.clientX, y: e.clientY };
          lastImageTime = now;
        };

        document.addEventListener("mousemove", mouseMoveHandler);
      })
      .catch((e) =>
        console.error("[ImageMouseTrail] GSAP load failed:", e.message),
      );

    return () => {
      destroyed = true;
      if (mouseMoveHandler) {
        document.removeEventListener("mousemove", mouseMoveHandler);
      }
      activeTweens.forEach((tween) => tween.kill());
      activeTweens.clear();
      clones.forEach((el) => el.remove());
      clones.clear();
    };
  }, [
    images,
    imageWidth,
    imageHeight,
    movementThreshold,
    spawnDelay,
    maxRotation,
    entranceDuration,
    entranceEase,
    exitDelay,
    exitDuration,
    exitEase,
    fadeIn,
    fadeOut,
  ]);

  return (
    <div
      ref={trailerRef}
      className={`fixed inset-0 pointer-events-none [&_img]:pointer-events-none [&_img]:absolute [&_img]:opacity-0 ${className}`}
      style={{ zIndex }}
    >
      <div ref={galleryRef} className="hidden">
        {images.map((src, i) => (
          <img
            key={src + i}
            data-trail-item={uid}
            src={src}
            alt={`Trail source ${i + 1}`}
            className="absolute opacity-0"
            style={{
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
              objectFit,
              borderRadius: `${borderRadius}px`,
              transformOrigin: "center",
            }}
          />
        ))}
      </div>
    </div>
  );
}
