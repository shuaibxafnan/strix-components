"use client";

import { useRef, useEffect } from "react";

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1505515888495-c1897b0b5740?q=80&w=1740&auto=format&fit=crop",
    alt: "Colorful building",
  },
  {
    src: "https://images.unsplash.com/photo-1521464302861-ce943915d1c3?q=80&w=1742&auto=format&fit=crop",
    alt: "Golden Gate bridge",
  },
  {
    src: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1740&auto=format&fit=crop",
    alt: "Orange flowers",
  },
  {
    src: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=2013&auto=format&fit=crop",
    alt: "Turntable",
  },
  {
    src: "https://images.unsplash.com/photo-1517784229726-7b866d820438?q=80&w=1733&auto=format&fit=crop",
    alt: "Penguins",
  },
  {
    src: "https://images.unsplash.com/photo-1481414981591-5732874c7193?q=80&w=1746&auto=format&fit=crop",
    alt: "Spiral stairs",
  },
  {
    src: "https://images.unsplash.com/photo-1625794084867-8ddd239946b1?q=80&w=1740&auto=format&fit=crop",
    alt: "Dog close-up",
  },
  {
    src: "https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?q=80&w=1974&auto=format&fit=crop",
    alt: "Colorful lockers",
  },
  {
    src: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=1752&auto=format&fit=crop",
    alt: "Monkey on branch",
  },
  {
    src: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?q=80&w=1740&auto=format&fit=crop",
    alt: "Mountain lake",
  },
  {
    src: "https://images.unsplash.com/photo-1532798210189-ca8e366884b9?q=80&w=1740&auto=format&fit=crop",
    alt: "Concrete building",
  },
];

export default function ParallaxDragGallery({
  images = DEFAULT_IMAGES,
  containerHeight = "h-screen",
  bgColor = "bg-[#0a0a0a]",
  cardWidth = 260,
  cardHeight = 380,
  cardGap = 20,
  paddingX = 60,
  cardRadius = "rounded-md",
  brightness = 0.82,
  easing = 0.09,
  parallaxRange = 60,
}) {
  const rootRef = useRef(null);
  const stripRef = useRef(null);
  const innersRef = useRef([]);

  const state = useRef({
    isDragging: false,
    startX: 0,
    scrollStart: 0,
    current: 0,
    display: 0,
    maxScroll: 0,
  });

  useEffect(() => {
    const root = rootRef.current;
    const strip = stripRef.current;
    if (!root || !strip) return;

    const s = state.current;

    const updateMax = () => {
      s.maxScroll = strip.scrollWidth - root.clientWidth;
    };
    updateMax();
    window.addEventListener("resize", updateMax);

    let raf;
    const tick = () => {
      s.display += (s.current - s.display) * easing;

      // Real-time animation properties remain inline to prevent frame lag
      strip.style.transform = `translateX(${-s.display}px)`;

      const progress = s.maxScroll > 0 ? s.display / s.maxScroll : 0;
      const bgPos = 20 + progress * parallaxRange;
      innersRef.current.forEach((inner) => {
        if (inner) inner.style.backgroundPosition = `${bgPos}% 50%`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onDown = (x) => {
      s.isDragging = true;
      s.startX = x;
      s.scrollStart = s.current;
      root.classList.add("cursor-grabbing");
      root.classList.remove("cursor-grab");
    };
    const onUp = () => {
      s.isDragging = false;
      root.classList.add("cursor-grab");
      root.classList.remove("cursor-grabbing");
    };
    const onMove = (x) => {
      if (!s.isDragging) return;
      const delta = x - s.startX;
      s.current = Math.max(0, Math.min(s.scrollStart - delta, s.maxScroll));
    };

    const mouseDown = (e) => {
      e.preventDefault();
      onDown(e.clientX);
    };
    const mouseUp = () => onUp();
    const mouseMove = (e) => onMove(e.clientX);
    const touchStart = (e) => onDown(e.touches[0].clientX);
    const touchEnd = () => onUp();
    const touchMove = (e) => {
      e.preventDefault();
      onMove(e.touches[0].clientX);
    };

    root.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mousemove", mouseMove);
    root.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchend", touchEnd);
    window.addEventListener("touchmove", touchMove, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateMax);
      root.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
      root.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchmove", touchMove);
    };
  }, [easing, parallaxRange]);

  // Exposing dynamic numbers as clean style token primitives for safely driving our arbitrary utilities
  const layoutTokenVars = {
    "--card-gap": `${cardGap}px`,
    "--pad-x": `${paddingX}px`,
    "--card-w": `${cardWidth}px`,
    "--card-h": `${cardHeight}px`,
    "--brightness": brightness,
  };

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden select-none cursor-grab ${containerHeight} ${bgColor}`}
      style={layoutTokenVars}
    >
      {/* Strip track wrapper */}
      <div
        ref={stripRef}
        className="absolute top-0 left-0 h-full flex items-center will-change-transform gap-[var(--card-gap)] pl-[var(--pad-x)] pr-[var(--pad-x)]"
      >
        {images.map((img, i) => (
          <div
            key={i}
            className={`flex-shrink-0 overflow-hidden w-[var(--card-w)] h-[var(--card-h)] ${cardRadius}`}
          >
            {/* Parallax Image Inner Mask */}
            <div
              ref={(el) => {
                innersRef.current[i] = el;
              }}
              className="w-[140%] h-full -ml-[20%] bg-cover bg-[position:20%_50%] [filter:brightness(var(--brightness))]"
              style={{ backgroundImage: `url(${img.src})` }}
              aria-label={img.alt}
              role="img"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
