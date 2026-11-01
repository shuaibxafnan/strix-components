"use client";

import { useEffect, useState, useRef } from "react";

const DEFAULT_ITEMS = [
  { text: "Tiger", subtitle: "Panthera tigris", href: "#", img: "https://images.unsplash.com/photo-1605092676920-8ac5ae40c7c8" },
  { text: "Lion", subtitle: "Panthera leo", href: "#", img: "https://images.unsplash.com/photo-1611450206852-05ef18194716" },
  { text: "Jaguar", subtitle: "Panthera onca", href: "#", img: "https://images.unsplash.com/photo-1573663209453-93f1875e5a7b" },
  { text: "Leopard", subtitle: "Panthera pardus", href: "#", img: "https://images.unsplash.com/photo-1591699335321-5adb2e169cbc" },
];

export default function ImageFollowCursor({
  items = DEFAULT_ITEMS,
  imageWidth = 800,
  fontClass = "text-[clamp(2.5rem,7vw,12rem)] font-light tracking-[-0.03em]",
  trackingSpeed = 0.08,
  scaleRatio = "w-[40vw] md:w-[24vw] aspect-[3/4]",
  backgroundColor = "#0a0a0a",
  textColor = "rgba(255,255,255,0.4)",
  hoverTextColor = "#ffffff",
  subtitleColor = "rgba(255,255,255,0.3)",
  borderColor = "rgba(255,255,255,0.05)",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const linksRef = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let animationFrameId;

    const updatePositions = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * trackingSpeed;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * trackingSpeed;

      if (activeIndex !== null && linksRef.current[activeIndex]) {
        const targetLink = linksRef.current[activeIndex];
        const rect = targetLink.getBoundingClientRect();

        const localX = currentPos.current.x - rect.left;
        const localY = currentPos.current.y - rect.top;

        targetLink.style.setProperty("--x", `${localX}px`);
        targetLink.style.setProperty("--y", `${localY}px`);
      }

      animationFrameId = requestAnimationFrame(updatePositions);
    };

    animationFrameId = requestAnimationFrame(updatePositions);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, activeIndex, trackingSpeed]);

  const rootClass = `w-full h-screen flex items-center justify-center select-none overflow-hidden font-sans px-6 ${className}`;

  if (!mounted) {
    return <div className={rootClass} style={{ backgroundColor }} />;
  }

  return (
    <div className={rootClass} style={{ backgroundColor }}>
      <nav className="w-full max-w-7xl flex flex-col items-start gap-1 md:gap-2">
        {items.map((item, index) => {
          const imageUrl = `${item.img}?auto=format&fit=crop&w=${imageWidth}&q=80`;
          const isHovered = activeIndex === index;

          return (
            <a
              key={index}
              ref={(el) => (linksRef.current[index] = el)}
              href={item.href || "#"}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className="group relative block w-full py-2 border-b last:border-b-0 transition-colors duration-300 ease-out no-underline outline-none z-10 hover:z-20"
              style={{
                "--x": "0px",
                "--y": "0px",
                color: isHovered ? hoverTextColor : textColor,
                borderColor,
              }}
            >
              <div className="flex items-baseline justify-between pointer-events-none">
                <h2 className={`${fontClass} transition-transform duration-500 ease-out group-hover:translate-x-2`}>
                  {item.text}
                </h2>

                {item.subtitle && (
                  <span
                    className="hidden md:inline text-xs font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ color: subtitleColor }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </div>

              <div
                className={`
                  absolute top-0 left-0 -z-10 ${scaleRatio}
                  pointer-events-none overflow-hidden rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]
                  opacity-0 scale-[0.6] group-hover:opacity-100 group-hover:scale-100
                  transition-[opacity,scale] duration-500 cubic-bezier(0.16, 1, 0.3, 1)
                `}
                style={{
                  translate: "calc(var(--x) - 50%) calc(var(--y) - 50%)",
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out scale-110 group-hover:scale-100"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              </div>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
