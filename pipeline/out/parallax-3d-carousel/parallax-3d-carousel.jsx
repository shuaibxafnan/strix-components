"use client";

import { useEffect, useRef, useState } from "react";

const SELECTION_ITEMS = [
  {
    id: 1,
    tag: "Aesthetics",
    title: "Minimal Form",
    meta: "Studio Architecture",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    tag: "Concept",
    title: "Brutal Lines",
    meta: "Monochrome Concrete",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    tag: "Curation",
    title: "Shadow Play",
    meta: "Natural Projections",
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    tag: "Exotic",
    title: "Sleek Geometry",
    meta: "Structural Grid",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    tag: "Identity",
    title: "Linear Spaces",
    meta: "Spatial Volume",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    tag: "Tactile",
    title: "Raw Textures",
    meta: "Organic Finishes",
    imageUrl:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    tag: "Archived",
    title: "Nordic Lounge",
    meta: "Interior Proportion",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    tag: "Editorial",
    title: "Muted Palettes",
    meta: "Warm Sandtones",
    imageUrl:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    tag: "Symmetry",
    title: "Light Portals",
    meta: "Atmospheric Depth",
    imageUrl:
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 10,
    tag: "Premium",
    title: "Glass Pavilion",
    meta: "Reflective Planes",
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Parallax3DCarousel({
  width = "320px",
  height = "440px",
  perspective = "2300px",
  ringRadius = 520,
  baseDuration = 1.2,
  bodyBg = "#090b11",
  cardAccentColor = "#38bdf8",
  carouselItems = SELECTION_ITEMS,
  className = "",
}) {
  const ringRef = useRef(null);
  const gsapRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const dragTracker = useRef({
    xPos: 0,
    isDragging: false,
    currentRotationY: 180,
  });

  useEffect(() => {
    let cancelled = false;
    let ctx = null;

    import("gsap").then((mod) => {
      if (cancelled || !ringRef.current) return;
      const gsap = mod.gsap || mod.default;
      gsapRef.current = gsap;
      gsap.config({ trialWarn: false });

      ctx = gsap.context(() => {
        const anglePerItem = 360 / carouselItems.length;

        gsap.set(ringRef.current, { rotationY: 180 });

        const cards = ringRef.current.querySelectorAll(".carousel-card");
        cards.forEach((card, i) => {
          gsap.set(card, {
            rotationY: i * -anglePerItem,
            transformOrigin: `50% 50% ${ringRadius}px`,
            z: -ringRadius,
          });

          gsap.fromTo(
            card,
            { y: 160, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: baseDuration,
              delay: i * 0.08,
              ease: "expo.out",
            },
          );
        });
      }, ringRef);
      setIsReady(true);
    });

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
      if (gsapRef.current && ringRef.current) {
        gsapRef.current.killTweensOf(ringRef.current);
      }
    };
  }, [carouselItems, ringRadius, baseDuration]);

  const updateBackgroundParallax = () => {
    const gsap = gsapRef.current;
    if (!gsap || !ringRef.current) return;

    const cards = ringRef.current.querySelectorAll(".carousel-card");
    const anglePerItem = 360 / carouselItems.length;
    const currentRingRotY = gsap.getProperty(ringRef.current, "rotationY");

    cards.forEach((card, i) => {
      const imgLayer = card.querySelector(".parallax-bg");
      if (!imgLayer) return;

      const targetAngle = currentRingRotY - 180 - i * anglePerItem;
      const wrappedAngle = gsap.utils.wrap(0, 360, targetAngle);
      const computedX = (100 - (wrappedAngle / 360) * 500) * 0.4;

      gsap.set(imgLayer, { backgroundPosition: `${computedX}px 0px` });
    });
  };

  const handleDragStart = (e) => {
    if (!isReady) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    dragTracker.current.isDragging = true;
    dragTracker.current.xPos = Math.round(clientX);

    gsapRef.current.set(ringRef.current, { cursor: "grabbing" });
  };

  const handleDragMove = (e) => {
    const tracker = dragTracker.current;
    const gsap = gsapRef.current;
    if (!tracker.isDragging || !gsap) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = (Math.round(clientX) - tracker.xPos) % 360;

    gsap.to(ringRef.current, {
      rotationY: `-=${deltaX}`,
      duration: 0.75,
      ease: "power2.out",
      onUpdate: updateBackgroundParallax,
    });

    tracker.xPos = Math.round(clientX);
  };

  const handleDragEnd = () => {
    dragTracker.current.isDragging = false;
    if (gsapRef.current && ringRef.current) {
      gsapRef.current.set(ringRef.current, { cursor: "grab" });
    }
  };

  const handleCardMouseEnter = (id, index) => {
    setHoveredId(id);
    const gsap = gsapRef.current;
    if (!gsap) return;

    const cards = ringRef.current.querySelectorAll(".carousel-card");
    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: i === index ? 1 : 0.35,
        scale: i === index ? 1.03 : 0.98,
        duration: 0.4,
        ease: "power3.out",
      });
    });
  };

  const handleCardMouseLeave = () => {
    setHoveredId(null);
    const gsap = gsapRef.current;
    if (!gsap) return;

    const cards = ringRef.current.querySelectorAll(".carousel-card");
    cards.forEach((card) => {
      gsap.to(card, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.inOut",
      });
    });
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden font-sans select-none touch-none ${className}`}
      style={{ backgroundColor: bodyBg }}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerLeave={handleDragEnd}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width,
          height,
          perspective,
        }}
      >
          <div
          ref={ringRef}
          className="absolute w-full h-full cursor-grab"
          style={{
            transformStyle: "preserve-3d",
          }}
          onPointerDown={handleDragStart}
        >
          {carouselItems.map((item, index) => {
            const isSelfHovered = hoveredId === item.id;

            return (
              <article
                key={item.id}
                data-index={index}
                className="carousel-card absolute top-0 left-0 w-full h-full rounded-2xl bg-[#121622] border border-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col justify-between p-5 backface-hidden will-change-transform group"
                style={{
                  transformStyle: "preserve-3d",
                }}
                onMouseEnter={() => handleCardMouseEnter(item.id, index)}
                onMouseLeave={handleCardMouseLeave}
              >
                          <div
                  className="flex items-center justify-between pointer-events-none transition-transform duration-500"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 rounded-md">
                    {item.tag}
                  </span>
                  <div
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isSelfHovered
                        ? cardAccentColor
                        : "rgba(255,255,255,0.2)",
                      boxShadow: isSelfHovered
                        ? `0 0 12px ${cardAccentColor}`
                        : "none",
                    }}
                  />
                </div>

                          <div
                  className="relative flex-1 my-4 w-full overflow-hidden rounded-xl bg-black/40 border border-white/[0.04] pointer-events-none"
                  style={{ transform: "translateZ(15px)" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
                  <div
                    className="parallax-bg absolute inset-0 w-full h-full scale-110 transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "50% 50%",
                    }}
                  />
                </div>

                          <div
                  className="flex flex-col gap-0.5 pointer-events-none transition-transform duration-500"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <h3 className="text-lg font-medium text-white/90 tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] tracking-normal text-white/30 font-mono">
                    {item.meta}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
