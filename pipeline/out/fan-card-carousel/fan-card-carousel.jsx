"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    id: "01",
    title: "Paris",
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "02",
    title: "Warsaw",
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "03",
    title: "Madrid",
    src: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "04",
    title: "Sydney",
    src: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "05",
    title: "Istanbul",
    src: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "06",
    title: "Prague",
    src: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "07",
    title: "Munich",
    src: "https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "08",
    title: "Venice",
    src: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "09",
    title: "Oslo",
    src: "https://images.unsplash.com/photo-1579282240050-352db0a14c21?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "10",
    title: "London",
    src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
  },
];

export default function FanCardCarousel({
  bgGradientStart = "#000000",
  bgGradientEnd = "#220033",
  speedWheel = 0.02,
  speedDrag = -0.1,
  customItems = DEFAULT_ITEMS,
  className = "",
}) {
  const containerRef = useRef(null);

  const progressRef = useRef(50);
  const startXRef = useRef(0);
  const isDownRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const mainContainer = containerRef.current;
    const items = mainContainer.querySelectorAll(".carousel-item");
    const cursorElements = mainContainer.querySelectorAll(".cursor-node");

    const getZindex = (arrayLength, activeIndex) => {
      const indexes = [];
      for (let i = 0; i < arrayLength; i++) {
        indexes.push(
          activeIndex === i
            ? arrayLength
            : arrayLength - Math.abs(activeIndex - i),
        );
      }
      return indexes;
    };

    const renderTick = () => {
      progressRef.current = Math.max(0, Math.min(progressRef.current, 100));
      const activeIndex = Math.floor(
        (progressRef.current / 100) * (items.length - 1),
      );

      const zIndexMatrix = getZindex(items.length, activeIndex);

      items.forEach((item, index) => {
        const currentZIndex = zIndexMatrix[index];
        const computedActive = (index - activeIndex) / items.length;

        item.style.setProperty("--zIndex", currentZIndex.toString());
        item.style.setProperty("--active", computedActive.toString());

        const computedOpacity = (currentZIndex / items.length) * 3 - 2;
        const box = item.querySelector(".carousel-box");
        if (box) {
          box.style.setProperty("--opacity", computedOpacity.toString());
        }
      });
    };

    const onWheel = (e) => {
      const wheelProgress = e.deltaY * parseFloat(speedWheel);
      progressRef.current += wheelProgress;
      renderTick();
    };

    const onMouseDown = (e) => {
      isDownRef.current = true;
      startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    };

    const onMouseMove = (e) => {
      if (e.type === "mousemove") {
        cursorElements.forEach((cursor) => {
          cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });
      }

      if (!isDownRef.current) return;

      const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const mouseProgress =
        (currentX - startXRef.current) * parseFloat(speedDrag);

      progressRef.current += mouseProgress;
      startXRef.current = currentX;
      renderTick();
    };

    const onMouseUp = () => {
      isDownRef.current = false;
    };

    const setupItemClicks = () => {
      items.forEach((item, i) => {
        const handleClick = () => {
          progressRef.current = (i / items.length) * 100 + 10;
          renderTick();
        };
        item.addEventListener("click", handleClick);
        item._cardClick = handleClick;
      });
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onMouseDown, { passive: true });
    window.addEventListener("touchmove", onMouseMove, { passive: true });
    window.addEventListener("touchend", onMouseUp);

    setupItemClicks();
    renderTick();

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onMouseDown);
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);

      items.forEach((item) => {
        if (item._cardClick) {
          item.removeEventListener("click", item._cardClick);
        }
      });
    };
  }, [speedWheel, speedDrag, customItems]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen overflow-hidden relative select-none antialiased ${className}`}
      style={{
        background: `linear-gradient(135deg, ${bgGradientStart}, ${bgGradientEnd})`,
      }}
    >
      <div className="carousel relative w-full h-screen overflow-hidden pointer-events-none z-10">
        {customItems.map((item, index) => (
          <div
            key={index}
            className="carousel-item absolute top-1/2 left-1/2 rounded-[10px] bg-black select-none pointer-events-auto cursor-pointer overflow-hidden origin-[0%_100%] transition-transform duration-700 ease-[cubic-bezier(0,0.02,0,1)]"
            style={{
              width: "clamp(150px, 30vw, 300px)",
              height: "clamp(200px, 40vw, 400px)",
              marginTop: "calc(clamp(200px, 40vw, 400px) * -0.5)",
              marginLeft: "calc(clamp(150px, 30vw, 300px) * -0.5)",
              zIndex: "var(--zIndex)",
              transform:
                "translate(calc(var(--active) * 800%), calc(var(--active) * 200%)) rotate(calc(var(--active) * 120deg))",
              boxShadow: "0 10px 50px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="carousel-box absolute top-0 left-0 w-full h-full opacity-[var(--opacity)] transition-opacity duration-700 ease-[cubic-bezier(0,0.02,0,1)] z-10 before:content-[''] before:absolute before:inset-0 before:z-10 before:bg-gradient-to-b before:from-black/30 before:via-transparent before:to-black/50">
              <div className="title absolute z-10 text-white bottom-5 left-5 text-[clamp(20px,3vw,30px)] [text-shadow:0_4px_4px_rgba(0,0,0,0.1)] font-serif">
                {item.title}
              </div>
              <div className="num absolute z-10 text-white top-2 left-5 text-[clamp(20px,10vw,80px)] font-bold tracking-tighter opacity-90">
                {item.id}
              </div>
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover pointer-events-none"
                draggable="false"
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="cursor-node hidden pointer-events-none fixed z-50 top-0 left-0 rounded-full border border-white/20 -mt-5 -ml-5 transition-transform duration-[850ms] ease-[cubic-bezier(0,0.02,0,1)] [@media(pointer:fine)]:block"
        style={{
          "--size": "40px",
          width: "var(--size)",
          height: "var(--size)",
        }}
      />
      <div
        className="cursor-node hidden pointer-events-none fixed z-50 top-0 left-0 rounded-full bg-white/40 -mt-[1px] -ml-[1px] transition-transform duration-700 ease-[cubic-bezier(0,0.02,0,1)] [@media(pointer:fine)]:block"
        style={{ "--size": "2px", width: "var(--size)", height: "var(--size)" }}
      />
    </div>
  );
}
