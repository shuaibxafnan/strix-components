"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  {
    src: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1200&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    src: "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function LightboxCarousel({
  width = "300px",
  height = "400px",
  perspective = "1000px",
  cardWidth = "300px",
  cardHeight = "200px",
  cardRadius = "15px",
  radius = 180,
  autoRotateDelay = 3000,
  dragSensitivity = 0.5,
  bodyBg = "#111",
  cardItems = DEFAULT_ITEMS,
}) {
  const carouselRef = useRef(null);
  const autoRotationRef = useRef(null);

  const [lightbox, setLightbox] = useState({ isOpen: false, src: "" });
  const [isReady, setIsReady] = useState(false);

  // Maintain runtime mutation values without inducing heavy reactive structural loops
  const interactionState = useRef({
    startY: 0,
    isDragging: false,
    currentRotationX: 0,
  });

  const totalCards = cardItems.length;
  const angleStep = 360 / totalCards;

  // Mount logic loop matching window environments perfectly
  useEffect(() => {
    setIsReady(true);
    startAutoRotation();

    return () => stopAutoRotation();
  }, [autoRotateDelay]);

  // Global browser touch/mouse interaction handlers bindings
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (interactionState.current.isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener("mouseup", handleGlobalPointerUp);
    window.addEventListener("touchend", handleGlobalPointerUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalPointerUp);
      window.removeEventListener("touchend", handleGlobalPointerUp);
    };
  }, []);

  // Structural Auto loop controls
  const startAutoRotation = () => {
    stopAutoRotation();
    autoRotationRef.current = setInterval(() => {
      interactionState.current.currentRotationX += angleStep;
      applyRotation();
    }, autoRotateDelay);
  };

  const stopAutoRotation = () => {
    if (autoRotationRef.current) {
      clearInterval(autoRotationRef.current);
    }
  };

  const applyRotation = () => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `rotateX(${interactionState.current.currentRotationX}deg)`;
    }
  };

  // Drag Engine Input Listeners
  const handleDragStart = (clientY) => {
    stopAutoRotation();
    interactionState.current.isDragging = true;
    interactionState.current.startY = clientY;
  };

  const handleDragMove = (clientY) => {
    if (!interactionState.current.isDragging) return;

    const deltaY = clientY - interactionState.current.startY;
    interactionState.current.startY = clientY;
    interactionState.current.currentRotationX += deltaY * dragSensitivity;
    applyRotation();
  };

  const handleDragEnd = () => {
    interactionState.current.isDragging = false;
    startAutoRotation();
  };

  // Lightbox Interface Switches
  const openLightbox = (src) => {
    stopAutoRotation();
    setLightbox({ isOpen: true, src });
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
    startAutoRotation();
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden select-none font-sans"
      style={{ backgroundColor: bodyBg }}
      onMouseMove={(e) => handleDragMove(e.clientY)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
    >
      {/* Viewport Boundary Container Box */}
      <div
        className="relative"
        style={{
          width,
          height,
          perspective,
        }}
      >
        {/* Core Cylindrical Axis */}
        <div
          ref={carouselRef}
          className="w-full h-full relative transition-transform duration-500 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${interactionState.current.currentRotationX}deg)`,
          }}
          onMouseEnter={stopAutoRotation}
          onMouseLeave={startAutoRotation}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        >
          {isReady &&
            cardItems.map((item, i) => (
              <div
                key={i}
                onClick={() => openLightbox(item.src)}
                className="absolute left-0 top-1/4 bg-cover bg-center cursor-pointer [z-index:1] shadow-[0_10px_25px_rgba(0,0,0,0.4)] before:content-[''] before:absolute before:-inset-2.5 before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_10%,transparent_110%)] before:[z-index:-1] before:animate-[pulseGlow_3s_infinite_ease-in-out] before:blur-[20px] before:opacity-60"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: cardRadius,
                  backgroundImage: `url('${item.src}')`,
                  transform: `rotateX(${i * angleStep}deg) translateZ(${radius}px)`,
                }}
              />
            ))}
        </div>
      </div>

      {/* Lightbox Module Frame */}
      <div
        onClick={(e) => e.target === e.currentTarget && closeLightbox()}
        className={`fixed inset-0 w-screen h-screen bg-black/80 flex items-center justify-center [z-index:999] transition-opacity duration-300 ease-in-out ${lightbox.isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
      >
        <span
          onClick={closeLightbox}
          className="absolute top-5 right-7 text-3xl text-white cursor-pointer [z-index:1000]"
        >
          &times;
        </span>
        {lightbox.src && (
          <img
            src={lightbox.src}
            alt="Expanded view content node"
            draggable={false}
            className="max-w-[90%] max-h-[80%] rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] object-contain"
          />
        )}
      </div>

      {/* Embedded Global Stylesheet Segment covering pulse animation parameters safely inside isolated nodes */}
      <style jsx global>{`
        @keyframes pulseGlow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
