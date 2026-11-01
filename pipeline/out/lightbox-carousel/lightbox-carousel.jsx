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
  overlayColor = "rgba(0,0,0,0.8)",
  closeColor = "#ffffff",
  expandedAlt = "Expanded view",
  className = "",
  cardItems = DEFAULT_ITEMS,
}) {
  const carouselRef = useRef(null);
  const autoRotationRef = useRef(null);

  const [lightbox, setLightbox] = useState({ isOpen: false, src: "", alt: "" });
  const [isReady, setIsReady] = useState(false);

  const interactionState = useRef({
    startY: 0,
    isDragging: false,
    currentRotationX: 0,
  });

  const totalCards = cardItems.length;
  const angleStep = 360 / totalCards;

  useEffect(() => {
    setIsReady(true);
    startAutoRotation();

    return () => stopAutoRotation();
  }, [autoRotateDelay]);

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

  const openLightbox = (src, alt) => {
    stopAutoRotation();
    setLightbox({ isOpen: true, src, alt });
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
    startAutoRotation();
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden select-none font-sans ${className}`}
      style={{ backgroundColor: bodyBg }}
      onMouseMove={(e) => handleDragMove(e.clientY)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
    >
      <div
        className="relative max-w-full"
        style={{
          width,
          height,
          perspective,
        }}
      >
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
                role="img"
                aria-label={item.alt || expandedAlt}
                onClick={() => openLightbox(item.src, item.alt)}
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

      <div
        onClick={(e) => e.target === e.currentTarget && closeLightbox()}
        className={`fixed inset-0 w-screen h-screen flex items-center justify-center [z-index:999] transition-opacity duration-300 ease-in-out ${lightbox.isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
        style={{ backgroundColor: overlayColor }}
      >
        <span
          onClick={closeLightbox}
          className="absolute top-5 right-7 text-3xl cursor-pointer [z-index:1000]"
          style={{ color: closeColor }}
        >
          &times;
        </span>
        {lightbox.src && (
          <img
            src={lightbox.src}
            alt={lightbox.alt || expandedAlt}
            draggable={false}
            className="max-w-[90%] max-h-[80%] rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] object-contain"
          />
        )}
      </div>

      <style>{`
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
