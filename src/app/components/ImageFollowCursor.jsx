"use client";

import { useEffect, useState, useRef } from "react";

// ─── ModernFluidNav ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items           array    Items array with text, image, and optional subtitles
// imageWidth      number   800         Unsplash image width optimization parameter
// fontClass       string   Custom typography weights, clamping, or styling
// trackingSpeed   number   0.08        Cursor lag inertia (Lower = more fluid/lazy trail)
// scaleRatio      string   w-[22vw]    Responsive asset scaling container framework
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  { text: "Tiger", subtitle: "Panthera tigris", img: "https://images.unsplash.com/photo-1605092676920-8ac5ae40c7c8" },
  { text: "Lion", subtitle: "Panthera leo", img: "https://images.unsplash.com/photo-1611450206852-05ef18194716" },
  { text: "Jaguar", subtitle: "Panthera onca", img: "https://images.unsplash.com/photo-1573663209453-93f1875e5a7b" },
  { text: "Leopard", subtitle: "Panthera pardus", img: "https://images.unsplash.com/photo-1591699335321-5adb2e169cbc" },
];

export default function ImageFollowCursor({
  items = DEFAULT_ITEMS,
  imageWidth = 800,
  fontClass = "text-[clamp(2.5rem,7vw,12rem)] font-light tracking-[-0.03em]",
  trackingSpeed = 0.08,
  scaleRatio = "w-[24vw] aspect-[3/4]",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  
  // Tracking targets and dampening values for organic motion interpolation
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
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

    // Custom Animation Loop for fluid, inertia-based trail physics
    let animationFrameId;
    
    const updatePositions = () => {
      // Linear interpolation math: current + (target - current) * speed
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * trackingSpeed;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * trackingSpeed;

      if (activeIndex !== null && linksRef.current[activeIndex]) {
        const targetLink = linksRef.current[activeIndex];
        const rect = targetLink.getBoundingClientRect();
        
        // Calculate relative local points inside the parent target bounding box
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

  if (!mounted) {
    return <div className="w-full min-h-screen bg-[#0a0a0a]" />;
  }

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-screen bg-[#0a0a0a] flex items-center justify-center select-none overflow-hidden font-sans px-6"
    >
      <nav className="w-full max-w-7xl flex flex-col items-start gap-1 md:gap-2">
        {items.map((item, index) => {
          const imageUrl = `${item.img}?auto=format&fit=crop&w=${imageWidth}&q=80`;
          const isHovered = activeIndex === index;
          
          return (
            <a
              key={index}
              ref={(el) => (linksRef.current[index] = el)}
              href="#"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className="
                group relative block w-full py-2 border-b border-white/5 
                text-white/40 hover:text-white transition-colors duration-300 ease-out
                no-underline outline-none last:border-b-0 z-10 hover:z-20
              "
              style={{
                "--x": "0px",
                "--y": "0px",
              }}
            >
              {/* Flexbox Row Wrapper containing text elements */}
              <div className="flex items-baseline justify-between pointer-events-none">
                <h2 className={`${fontClass} transition-transform duration-500 ease-out group-hover:translate-x-2`}>
                  {item.text}
                </h2>
                
                {item.subtitle && (
                  <span className="hidden md:inline text-xs font-mono tracking-widest text-white/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {item.subtitle}
                  </span>
                )}
              </div>

              {/* Dynamic Inertia Image Element Container */}
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
                {/* Visual subtle zoom scaling effect on hover inside container */}
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