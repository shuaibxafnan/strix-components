"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=640&q=80",
];

export default function RadialCardDeck({
  images = DEFAULT_IMAGES,
  bgColor = "#fff",
  cardBorderColor = "#000",
  cardBorderWidth = 10,
  cardRadius = 17,
  grayscale = true,
  cardWidth = 430,
  cardHeight = 610,
  cardWidthMd = 350,
  cardHeightMd = 497,
  cardWidthSm = 300,
  cardHeightSm = 400,
  originDistanceVh = 200,
  entranceDuration = 1,
  entranceEase = "power4.out",
  settleEase = "power1.out",
  staggerStep = 0.15,
  draggable = true,
  className = "",
}) {
  const reactId = useId();
  const uid = reactId.replace(/[:]/g, "");
  const itemsRef = useRef(null);
  const draggableInstanceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let timeline = null;

    Promise.all([import("gsap"), import("gsap/Draggable")])
      .then(([gsapMod, dragMod]) => {
        if (cancelled) return;
        const gsap = gsapMod.gsap || gsapMod.default;
        const Draggable = dragMod.Draggable || dragMod.default;
        const itemsEl = itemsRef.current;
        if (!gsap || !itemsEl) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(Draggable);

        const items = gsap.utils.toArray(
          itemsEl.querySelectorAll(`.item-${uid}`),
        );
        const imageSize = items.length;
        const total = items.length;
        const degree = 360 / total;

        timeline = gsap.timeline();
        items.forEach((image, index) => {
          const sign = Math.floor((index / 2) % 2) ? 1 : -1;
          const value = Math.floor((index + 4) / 4) * 4;
          const rotation = index > imageSize - 3 ? 0 : sign * value;

          gsap.set(image, { rotation, scale: 0.5 });

          timeline.from(
            image,
            {
              x: () =>
                index % 2
                  ? window.innerWidth + image.clientWidth * 4
                  : -window.innerWidth - image.clientWidth * 4,
              y: () => window.innerHeight - image.clientHeight,
              rotation: index % 2 ? 200 : -200,
              scale: 4,
              opacity: 1,
              ease: entranceEase,
              duration: entranceDuration,
              delay: staggerStep * Math.floor(index / 2),
            },
            0,
          );

          const rotationAngle = index * degree;
          const settleTime = staggerStep * (imageSize / 2 - 1) + 1;

          timeline.to(image, { scale: 1, duration: 0 }, settleTime);
          timeline.to(
            image,
            {
              transformOrigin: `center ${originDistanceVh}vh`,
              rotation:
                index > imageSize / 2
                  ? -degree * (imageSize - index)
                  : rotationAngle,
              duration: 1,
              ease: settleEase,
            },
            settleTime,
          );
        });

        if (draggable) {
          let start = 0;
          const [instance] = Draggable.create(itemsEl, {
            type: "rotation",
            onDragStart: function () {
              start = this.rotation;
            },
            onDragEnd: function () {
              const rotation = this.rotation;
              const offset = Math.abs(rotation - start);
              if (rotation > start) {
                if (rotation - start < degree / 2) {
                  gsap.to(itemsEl, { rotation: `-=${offset}` });
                } else {
                  gsap.to(itemsEl, { rotation: `+=${2 * degree - offset}` });
                }
              } else {
                if (Math.abs(rotation - start) < degree / 2) {
                  gsap.to(itemsEl, { rotation: `+=${offset}` });
                } else {
                  gsap.to(itemsEl, { rotation: `-=${2 * degree - offset}` });
                }
              }
            },
          });
          draggableInstanceRef.current = instance;
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (timeline) timeline.kill();
      if (draggableInstanceRef.current) {
        draggableInstanceRef.current.kill();
        draggableInstanceRef.current = null;
      }
    };
  }, [
    uid,
    originDistanceVh,
    entranceDuration,
    entranceEase,
    settleEase,
    staggerStep,
    draggable,
  ]);

  const cardCss =
    `.card-${uid} { width: min(${cardWidth}px, 80vw); height: ${cardHeight}px; border-width: ${cardBorderWidth}px; border-color: ${cardBorderColor}; border-radius: ${cardRadius}px; }` +
    `.image-${uid} { filter: ${grayscale ? "grayscale(100%)" : "none"}; }` +
    `@media screen and (max-height: 1000px) { .card-${uid} { width: min(${cardWidthMd}px, 80vw); height: ${cardHeightMd}px; } }` +
    `@media screen and (max-height: 800px) { .card-${uid} { width: min(${cardWidthSm}px, 80vw); height: ${cardHeightSm}px; } }`;

  return (
    <div
      className={`relative h-screen w-full select-none overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <style dangerouslySetInnerHTML={{ __html: cardCss }} />

      <div
        className="absolute left-1/2 h-screen -translate-x-1/2 select-none"
        style={{ top: "28%" }}
      >
        <div
          ref={itemsRef}
          className="flex select-none"
          style={{
            transformOrigin: `center ${originDistanceVh}vh`,
            transform: "rotate(0deg)",
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className={`item-${uid} absolute -translate-x-1/2 select-none cursor-pointer`}
            >
              <div
                className={`card-${uid} relative block overflow-hidden text-white`}
                style={{ cursor: "grab" }}
              >
                <img
                  src={src}
                  alt=""
                  className={`image-${uid} pointer-events-none absolute left-0 top-0 h-full w-full object-cover`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
