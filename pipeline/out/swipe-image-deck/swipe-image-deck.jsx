"use client";

import { useEffect, useRef, useState } from "react";

const NO_IMAGES = [];

export default function SwipeImageDeck({
  boardBg = "bg-[#f5f7fa]",
  cardWidth = "320px",
  cardHeight = "320px",
  swipeThreshold = 0.25,
  transitionDuration = 200,
  initialImages = NO_IMAGES,
  className = "",
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
}) {
  const boardRef = useRef(null);
  const hammerInstanceRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const [imagePool, setImagePool] = useState(() => {
    if (initialImages.length > 0) return initialImages;
    return Array.from(
      { length: 10 },
      () =>
        `https://picsum.photos/320/320/?random=${Math.round(Math.random() * 1000000)}`,
    );
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let isPanning = false;
    let startPosX = 0;
    let startPosY = 0;
    let isDraggingFrom = 1;

    let cancelled = false;

    import("hammerjs")
      .then((mod) => {
        const Hammer = mod.default || mod;
        if (cancelled || !boardRef.current) return;

        const setupGestures = () => {
          const cards = boardRef.current.querySelectorAll(".card-item");
          if (cards.length === 0) return;

          const topCard = cards[cards.length - 1];
          const nextCard = cards[cards.length - 2];

          topCard.style.transform =
            "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)";

          if (hammerInstanceRef.current) {
            hammerInstanceRef.current.destroy();
          }

          const mc = new Hammer(topCard);
          hammerInstanceRef.current = mc;

          mc.add(new Hammer.Tap());
          mc.add(
            new Hammer.Pan({
              position: Hammer.position_ALL,
              threshold: 0,
            }),
          );

          mc.on("tap", (e) => {
            const rect = e.target.getBoundingClientRect();
            const propX = (e.center.x - rect.left) / e.target.clientWidth;
            const rotateY = 15 * (propX < 0.05 ? -1 : 1);

            topCard.style.transition = "transform 100ms ease-out";
            topCard.style.transform = `translateX(-50%) translateY(-50%) rotate(0deg) rotateY(${rotateY}deg) scale(1)`;

            setTimeout(() => {
              topCard.style.transform =
                "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)";
            }, 100);
          });

          mc.on("pan", (e) => {
            if (!isPanning) {
              isPanning = true;
              topCard.style.transition = null;
              if (nextCard) nextCard.style.transition = null;

              const style = window.getComputedStyle(topCard);
              const mx = style.transform.match(/^matrix\((.+)\)$/);
              startPosX = mx ? parseFloat(mx[1].split(", ")[4]) : 0;
              startPosY = mx ? parseFloat(mx[1].split(", ")[5]) : 0;

              const bounds = topCard.getBoundingClientRect();
              isDraggingFrom =
                e.center.y - bounds.top > topCard.clientHeight / 2 ? -1 : 1;
            }

            let posX = e.deltaX + startPosX;
            let posY = e.deltaY + startPosY;

            const propX = e.deltaX / boardRef.current.clientWidth;
            const propY = e.deltaY / boardRef.current.clientHeight;
            const dirX = e.deltaX < 0 ? -1 : 1;
            const deg = isDraggingFrom * dirX * Math.abs(propX) * 45;
            const scale = (95 + 5 * Math.abs(propX)) / 100;

            topCard.style.transform = `translateX(${posX}px) translateY(${posY}px) rotate(${deg}deg) rotateY(0deg) scale(1)`;

            if (nextCard) {
              nextCard.style.transform = `translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(${scale})`;
            }

            if (e.isFinal) {
              isPanning = false;
              let successful = false;

              topCard.style.transition = `transform ${transitionDuration}ms ease-out`;
              if (nextCard) {
                nextCard.style.transition = `transform ${transitionDuration / 2}ms linear`;
              }

              if (
                propX > swipeThreshold &&
                e.direction === Hammer.DIRECTION_RIGHT
              ) {
                successful = true;
                posX = boardRef.current.clientWidth;
                if (onSwipeRight) onSwipeRight();
              } else if (
                propX < -swipeThreshold &&
                e.direction === Hammer.DIRECTION_LEFT
              ) {
                successful = true;
                posX = -(boardRef.current.clientWidth + topCard.clientWidth);
                if (onSwipeLeft) onSwipeLeft();
              } else if (
                propY < -swipeThreshold &&
                e.direction === Hammer.DIRECTION_UP
              ) {
                successful = true;
                posY = -(boardRef.current.clientHeight + topCard.clientHeight);
                if (onSwipeUp) onSwipeUp();
              }

              if (successful) {
                topCard.style.transform = `translateX(${posX}px) translateY(${posY}px) rotate(${deg}deg)`;

                setTimeout(() => {
                  setCurrentIndex((prev) => prev + 1);
                  setImagePool((prevPool) => {
                    if (initialImages.length === 0) {
                      return [
                        ...prevPool,
                        `https://picsum.photos/320/320/?random=${Math.round(Math.random() * 1000000)}`,
                      ];
                    }
                    return prevPool;
                  });
                }, transitionDuration);
              } else {
                topCard.style.transform =
                  "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)";
                if (nextCard) {
                  nextCard.style.transform =
                    "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(0.95)";
                }
              }
            }
          });
        };

        setupGestures();
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
      if (hammerInstanceRef.current) {
        hammerInstanceRef.current.destroy();
        hammerInstanceRef.current = null;
      }
    };
  }, [
    mounted,
    currentIndex,
    initialImages,
    swipeThreshold,
    transitionDuration,
    onSwipeRight,
    onSwipeLeft,
    onSwipeUp,
  ]);

  if (!mounted) {
    return <div className={`w-full h-screen ${boardBg} ${className}`} />;
  }

  const activeCards = imagePool.slice(currentIndex, currentIndex + 2).reverse();

  return (
    <div
      ref={boardRef}
      className={`w-full h-screen relative overflow-hidden select-none touch-none ${boardBg} ${className}`}
    >
      {activeCards.map((url, idx) => (
        <div
          key={url}
          className="card-item absolute top-1/2 left-1/2 bg-white rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] bg-cover bg-center origin-center"
          style={{
            width: cardWidth,
            maxWidth: "85%",
            height: cardHeight,
            maxHeight: "85%",
            backgroundImage: `url('${url}')`,
            transform: "translateX(-50%) translateY(-50%) scale(0.95)",
          }}
        />
      ))}
    </div>
  );
}
