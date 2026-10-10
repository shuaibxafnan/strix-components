"use client";

import { useEffect, useState, useRef } from "react";

// ─── Holographic3DCardGrid ──────────────────────────────────────────────────
//
// Props Explanation
// ──────────────────────────────────────────────────────────────────────────
// items             array     List of main foreground image layers
// holographicOverlay string    Background asset URL driving the edge lighting shine
// gridWidth         string    Responsive structural tailwind constraints for the container
// sensitivityX      number    0.1       Horizontal tracking scale multi-factor
// sensitivityY      number    0.1       Vertical tracking scale multi-factor
// ──────────────────────────────────────────────────────────────────────────

export default function ShineFoilCard({
  items = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTQ0MDUyNDN8&ixlib=rb-4.1.0&q=85",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1575396574188-ccf23d32d4b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTQ0ODM3MTN8&ixlib=rb-4.1.0&q=85",
    },
  ],
  holographicOverlay = "https://images.unsplash.com/photo-1615715874901-ad6a07ec5c88?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTQ0MjE2ODd8&ixlib=rb-4.1.0&q=85",
  gridWidth = "max-w-[700px]",
  sensitivityX = 0.1,
  sensitivityY = 0.1,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const boundsRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseEnter = (e, id) => {
    setHoveredCardId(id);
    boundsRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleMouseMove = (e) => {
    if (!boundsRef.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = boundsRef.current;

    const offsetX = clientX - left;
    const offsetY = clientY - top;

    const centerX = offsetX - width * 0.5;
    const centerY = offsetY - height * 0.5;

    const posX = Math.round(-1 * centerX * sensitivityX);
    const posY = Math.round(centerY * sensitivityY);

    setCoords({ x: posY, y: posX });
  };

  const handleMouseLeave = () => {
    setHoveredCardId(null);
    setCoords({ x: 0, y: 0 });
    boundsRef.current = null;
  };

  if (!isMounted) {
    return (
      <div className="w-full min-h-screen bg-[#E0E0E0] flex items-center justify-center" />
    );
  }

  // Calculate the live trigonometric angle for the reflective foil sheen mapping
  const atan2Val = Math.atan2(coords.x, coords.y);
  const calculatedAtan = -1 * atan2Val;

  return (
    <div className="w-full min-h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(#424242_0_1px,#0000_1px_10px)] bg-[size:1em_1em] bg-[#E0E0E0] p-6 select-none">
      {/* Dynamic Embedded Convolution Matrix Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="filterEdges">
            <feConvolveMatrix
              kernelMatrix="0 1 0 1 -4 1 0 1 0"
              order="3 3"
              bias="0"
              divisor="1"
              preserveAlpha="true"
            />
          </filter>
        </defs>
      </svg>

      <main
        className={`w-full ${gridWidth} grid grid-cols-1 md:grid-cols-2 gap-[30px] justify-items-center justify-content-center`}
      >
        {items.map((card) => {
          const isCurrent = hoveredCardId === card.id;

          // Compute transform profiles conditionally to preserve 400ms transition breaks during live drag
          const currentX = isCurrent ? coords.x : 0;
          const currentY = isCurrent ? coords.y : 0;

          return (
            <div
              key={card.id}
              className="w-[300px] aspect-[9/12] [perspective:1200px] [transform-style:preserve-3d] group"
              onMouseEnter={(e) => handleMouseEnter(e, card.id)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <figure
                className="relative w-full h-full rounded-[1em] overflow-hidden will-change-transform"
                style={{
                  transform: `rotateX(${currentX}deg) rotateY(${currentY}deg)`,
                  transition: isCurrent ? "none" : "transform 400ms ease",
                }}
              >
                {/* Main Foreground Card Graphic */}
                <img
                  src={card.src}
                  alt="Artwork canvas"
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Foil Sheen Overlay Layer */}
                <div
                  className="absolute inset-0 pointer-events-none object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200 [mix-blend-mode:plus-lighter] [backdrop-filter:url(#filterEdges)]"
                  style={{
                    backgroundImage: `url(${holographicOverlay})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    maskImage: isCurrent
                      ? `conic-gradient(from ${calculatedAtan}rad, #0000, #fffa, #0000, #fffa, #0000)`
                      : "none",
                    WebkitMaskImage: isCurrent
                      ? `conic-gradient(from ${calculatedAtan}rad, #0000, #fffa, #0000, #fffa, #0000)`
                      : "none",
                  }}
                />
              </figure>
            </div>
          );
        })}
      </main>
    </div>
  );
}
