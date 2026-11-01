"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1501949997128-2fdb9f6428f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTIyNjYzNTZ8&ixlib=rb-4.1.0&q=80&w=400",
    alt: "Closeup of a curling ocean wave.",
  },
  {
    src: "https://images.unsplash.com/photo-1476673160081-cf065607f449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTIyNjYzOTJ8&ixlib=rb-4.1.0&q=80&w=400",
    alt: "Foamy waves gently lapping a sandy beach shore.",
  },
  {
    src: "https://images.unsplash.com/photo-1490365728022-deae76380607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTIyNjY0Mzd8&ixlib=rb-4.1.0&q=80&w=400",
    alt: "A starfish at the shallow edge of ocean water, alone on a backdrop of white sand.",
  },
  {
    src: "https://images.unsplash.com/photo-1506252374453-ef5237291d83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTIyNjY0NzR8&ixlib=rb-4.1.0&q=80&w=400",
    alt: "An aerial view of waves rolling onto a sandy beach.",
  },
];

export default function ProjectorSlideshow({
  images = DEFAULT_IMAGES,
  slideDuration = 5000,
  transitionDuration = 270,
  size = "w-[100vmin] h-[80vmin]",
  containerBg = "bg-[#eee]",
  pageBg = "bg-[#888]",
  baseBlur = 0.4,
  flickerInterval = 16,
  boxShadow = "shadow-[0.25em_0.25em_2.5em_rgba(0,0,0,0.6),inset_0_0_6em_rgba(0,0,0,0.375)]",
  moteSpawnInterval = 4000,
  moteBaseDuration = 8500,
  moteRandomDurationRange = 3000,
  moteColor = "bg-black",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [blurAmount, setBlurAmount] = useState(baseBlur);
  const [brightness, setBrightness] = useState(0.99);
  const [motes, setMotes] = useState([]);

  const moteIdCounter = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      setBlurAmount(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || images.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;

        setVisibleIndex(nextIndex);
        return nextIndex;
      });
    }, slideDuration);

    return () => clearInterval(interval);
  }, [mounted, images.length, slideDuration]);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setBrightness(0.98 + Math.random() * 0.02);
    }, flickerInterval);

    return () => clearInterval(interval);
  }, [mounted, flickerInterval]);

  useEffect(() => {
    if (!mounted) return;

    const createMote = () => {
      const id = moteIdCounter.current++;
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = Math.random() * 100;
      const endY = Math.random() * 100;
      const duration =
        moteBaseDuration + Math.random() * moteRandomDurationRange;
      const maxOpacity = Math.random() * 0.25 + 0.5;
      const sizeEm = Math.random() * 0.6 + 0.3;

      const newMote = {
        id,
        sizeEm,
        startX,
        startY,
        endX,
        endY,
        duration,
        maxOpacity,
        currentX: startX,
        currentY: startY,
        opacity: 0,
      };

      setMotes((prev) => [...prev, newMote]);

      setTimeout(() => {
        setMotes((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, currentX: endX, currentY: endY, opacity: maxOpacity }
              : m,
          ),
        );
      }, 50);

      setTimeout(() => {
        setMotes((prev) =>
          prev.map((m) => (m.id === id ? { ...m, opacity: 0 } : m)),
        );
      }, duration * 0.5);

      setTimeout(() => {
        setMotes((prev) => prev.filter((m) => m.id !== id));
      }, duration);
    };

    createMote();
    const interval = setInterval(createMote, moteSpawnInterval);

    return () => clearInterval(interval);
  }, [mounted, moteBaseDuration, moteRandomDurationRange, moteSpawnInterval]);

  if (!mounted) {
    return <div className={`w-full h-screen ${pageBg} ${className}`} />;
  }

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden select-none relative ${pageBg} ${className}`}
    >
      <div
        className={`text-[2vmin] relative overflow-hidden bg-center ${size} ${containerBg} ${boxShadow}`}
        style={{ filter: `brightness(${brightness})` }}
      >
        {images.map((img, index) => {
          const isVisible = index === visibleIndex;
          const isPastSlide =
            index === (activeIndex === 0 ? images.length - 1 : activeIndex - 1);

          const shouldRender = isVisible || isPastSlide;

          if (!shouldRender) return null;

          return (
            <img
              key={index}
              src={img.src}
              alt={img.alt}
              className="absolute rounded-[2.5%] w-[90%] h-[90%] left-[5%] top-[5%] object-cover mix-blend-darken origin-center"
              style={{
                filter: `blur(${blurAmount}em)`,
                transform: isVisible
                  ? "translateX(0%) rotate(0deg) translateX(0%) rotate(1.5deg)"
                  : "translateX(1000%) rotate(8deg) translateX(-1000%) rotate(1.5deg)",
                transition: `transform ${transitionDuration}ms linear, filter 8000ms`,
              }}
            />
          );
        })}

        {motes.map((mote) => (
          <div
            key={mote.id}
            className={`absolute rounded-full pointer-events-none blur-[0.6em] ${moteColor}`}
            style={{
              width: `${mote.sizeEm}em`,
              height: `${mote.sizeEm}em`,
              left: `${mote.currentX}%`,
              top: `${mote.currentY}%`,
              opacity: mote.opacity,
              transition: `left ${mote.duration}ms linear, top ${mote.duration}ms linear, opacity ${mote.duration * 0.5}ms linear`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
