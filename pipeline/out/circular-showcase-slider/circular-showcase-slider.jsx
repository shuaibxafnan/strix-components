"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

const DEFAULT_SLIDES = [
  {
    id: 1,
    title: "Beverage Branding",
    desc: "Fresh and vibrant packaging design for premium juice products with natural ingredients.",
    img: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&h=800&fit=crop",
  },
  {
    id: 2,
    title: "Apparel Design",
    desc: "Minimalist fashion collection with sustainable materials and modern aesthetics.",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=800&fit=crop",
  },
  {
    id: 3,
    title: "Luxury Packaging",
    desc: "Premium product packaging with attention to detail and sophisticated finishes.",
    img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop",
  },
  {
    id: 4,
    title: "Cosmetics Brand",
    desc: "Clean beauty brand identity with elegant and timeless design approach.",
    img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=800&fit=crop",
  },
  {
    id: 5,
    title: "Fashion Editorial",
    desc: "Editorial photography and art direction for contemporary fashion magazine.",
    img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=800&fit=crop",
  },
  {
    id: 6,
    title: "Botanical Series",
    desc: "Natural product line with organic ingredients and eco-friendly packaging.",
    img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=800&fit=crop",
  },
  {
    id: 7,
    title: "Product Photography",
    desc: "Professional product photography with creative lighting and composition.",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop",
  },
  {
    id: 8,
    title: "Streetwear Brand",
    desc: "Urban fashion line with bold graphics and contemporary street style.",
    img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop",
  },
  {
    id: 9,
    title: "Tech Accessories",
    desc: "Minimalist tech product design with user-centered functionality.",
    img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop",
  },
  {
    id: 10,
    title: "Wellness Products",
    desc: "Holistic wellness brand with natural and calming visual identity.",
    img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=800&fit=crop",
  },
  {
    id: 11,
    title: "Home Decor",
    desc: "Contemporary home accessories with Scandinavian design influence.",
    img: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600&h=800&fit=crop",
  },
];

const POSITIONS = [
  {
    height: 620,
    z: 220,
    rotateY: 48,
    y: 0,
    clip: "polygon(0px 0px, 100% 10%, 100% 90%, 0px 100%)",
  },
  {
    height: 580,
    z: 165,
    rotateY: 35,
    y: 0,
    clip: "polygon(0px 0px, 100% 8%,  100% 92%, 0px 100%)",
  },
  {
    height: 495,
    z: 110,
    rotateY: 15,
    y: 0,
    clip: "polygon(0px 0px, 100% 7%,  100% 93%, 0px 100%)",
  },
  {
    height: 420,
    z: 66,
    rotateY: 15,
    y: 0,
    clip: "polygon(0px 0px, 100% 7%,  100% 93%, 0px 100%)",
  },
  {
    height: 353,
    z: 46,
    rotateY: 6,
    y: 0,
    clip: "polygon(0px 0px, 100% 7%,  100% 93%, 0px 100%)",
  },
  {
    height: 310,
    z: 0,
    rotateY: 0,
    y: 0,
    clip: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
  },
  {
    height: 353,
    z: 54,
    rotateY: 348,
    y: 0,
    clip: "polygon(0px 7%, 100% 0px, 100% 100%, 0px 93%)",
  },
  {
    height: 420,
    z: 89,
    rotateY: -15,
    y: 0,
    clip: "polygon(0px 7%, 100% 0px, 100% 100%, 0px 93%)",
  },
  {
    height: 495,
    z: 135,
    rotateY: -15,
    y: 1,
    clip: "polygon(0px 7%, 100% 0px, 100% 100%, 0px 93%)",
  },
  {
    height: 580,
    z: 195,
    rotateY: 325,
    y: 0,
    clip: "polygon(0px 8%, 100% 0px, 100% 100%, 0px 92%)",
  },
  {
    height: 620,
    z: 240,
    rotateY: 312,
    y: 0,
    clip: "polygon(0px 10%, 100% 0px, 100% 100%, 0px 90%)",
  },
];

const DEFAULT_TAGS = ["Identity", "Packaging", "Editorial"];

const STYLES = `
  .css-modal-backdrop { transition: opacity 0.4s ease; }
  .css-modal-panel { transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  .css-track-blurred > * {
    filter: blur(8px);
    opacity: 0.35;
    transition: filter 0.4s ease, opacity 0.4s ease;
  }
`;

export default function CircularShowcaseSlider({
  slides = DEFAULT_SLIDES,
  subtitle = "Behind creativity",
  mainTitle = "Curious what else we've created?",
  hintText = "[ Drag or use Arrow Keys ]",
  modalEyebrow = "Selected Canvas",
  modalTags = DEFAULT_TAGS,
  modalCtaLabel = "View Project →",
  accentColor = "#ff6b35",
  pageBg = "#070709",
  textColor = "#ffffff",
  dragThreshold = 60,
  duration = 0.6,
  ease = "power3.out",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(null);
  const [modalPhase, setModalPhase] = useState("closed");
  const [isDraggingState, setIsDraggingState] = useState(false);

  const trackRef = useRef(null);
  const cardsOrderRef = useRef([]);
  const gsapRef = useRef(null);
  const timersRef = useRef({ raf1: 0, raf2: 0, close: 0 });
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    processedSteps: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const applyPositions = (animate = false) => {
    const gsap = gsapRef.current;
    if (!gsap) return;

    cardsOrderRef.current.forEach((card, index) => {
      const pos = POSITIONS[index % POSITIONS.length];
      if (!pos) return;

      const props = {
        height: pos.height,
        clipPath: pos.clip,
        transform: `translateZ(${pos.z}px) rotateY(${pos.rotateY}deg) translateY(${pos.y}px)`,
      };

      animate
        ? gsap.to(card, { ...props, duration, ease, overwrite: "auto" })
        : gsap.set(card, props);
    });
  };

  useEffect(() => {
    if (!mounted || !trackRef.current) return;

    cardsOrderRef.current = Array.from(trackRef.current.children);
    let cancelled = false;

    import("gsap").then((mod) => {
      if (cancelled) return;
      gsapRef.current = mod.gsap || mod.default;
      applyPositions(false);
    });

    return () => {
      cancelled = true;
      if (gsapRef.current) gsapRef.current.killTweensOf(cardsOrderRef.current);
    };
  }, [mounted]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      cancelAnimationFrame(timers.raf1);
      cancelAnimationFrame(timers.raf2);
      clearTimeout(timers.close);
    };
  }, []);

  const rotateTrack = useCallback(
    (direction) => {
      if (activeSlide || !gsapRef.current) return;

      const cards = cardsOrderRef.current;

      if (direction === "next") {
        const first = cards.shift();
        cards.push(first);
        trackRef.current.appendChild(first);
      } else {
        const last = cards.pop();
        cards.unshift(last);
        trackRef.current.insertBefore(last, trackRef.current.firstChild);
      }

      applyPositions(true);
    },
    [activeSlide, duration, ease],
  );

  const openModal = useCallback(
    (slide) => {
      if (activeSlide || dragRef.current.isDragging) return;
      setActiveSlide(slide);
      setModalPhase("opening");
      const timers = timersRef.current;
      timers.raf1 = requestAnimationFrame(() => {
        timers.raf2 = requestAnimationFrame(() => setModalPhase("open"));
      });
    },
    [activeSlide],
  );

  const closeModal = useCallback(() => {
    setModalPhase("closing");
    clearTimeout(timersRef.current.close);
    timersRef.current.close = setTimeout(() => {
      setActiveSlide(null);
      setModalPhase("closed");
    }, 400);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeSlide) closeModal();
      if (e.key === "ArrowLeft" && !activeSlide) rotateTrack("prev");
      if (e.key === "ArrowRight" && !activeSlide) rotateTrack("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlide, rotateTrack, closeModal]);

  const handleDragStart = (clientX) => {
    if (activeSlide) return;
    dragRef.current = { isDragging: true, startX: clientX, processedSteps: 0 };
    setIsDraggingState(true);
  };

  const handleDragMove = (clientX, e) => {
    if (!dragRef.current.isDragging) return;
    if (e.cancelable) e.preventDefault();

    const distance = clientX - dragRef.current.startX;
    const steps = Math.floor(Math.abs(distance) / dragThreshold);

    if (steps > dragRef.current.processedSteps) {
      rotateTrack(distance > 0 ? "prev" : "next");
      dragRef.current.processedSteps = steps;
    }
  };

  const handleDragEnd = () => {
    dragRef.current.isDragging = false;
    setIsDraggingState(false);
  };

  if (!mounted) {
    return (
      <div
        className={`w-full min-h-screen ${className}`}
        style={{ background: pageBg }}
      />
    );
  }

  const modalEntered = modalPhase === "open";

  return (
    <>
      <style>{STYLES}</style>

      <div
        className={`w-full min-h-screen flex flex-col items-center justify-between select-none py-14 px-6 overflow-hidden font-sans relative antialiased ${className}`}
        style={{ background: pageBg, color: textColor }}
        onMouseMove={(e) => handleDragMove(e.clientX, e)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e)}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[130px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[130px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="text-center mt-4 max-w-2xl z-10 pointer-events-none">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.4em] mb-3 ml-[0.4em]"
            style={{ color: accentColor }}
          >
            {subtitle}
          </p>
          <h1 className="text-[clamp(24px,3.5vw,42px)] font-light tracking-tight leading-tight uppercase">
            {mainTitle}
          </h1>
        </div>

        <div
          className={`w-full max-w-[1400px] py-6 overflow-visible z-10 ${
            isDraggingState ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ perspective: "1500px", perspectiveOrigin: "50% 50%" }}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        >
          <div
            ref={trackRef}
            className={`flex items-center justify-center gap-2 ${activeSlide ? "css-track-blurred" : ""}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                data-slide-id={slide.id}
                onClick={() => openModal(slide)}
                className="flex-shrink-0 w-[240px] bg-[#111116] overflow-hidden relative group rounded-sm border border-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-[border-color] duration-300 hover:border-white/30 cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="w-full h-full object-cover block pointer-events-none brightness-75 group-hover:brightness-90 transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center z-10 text-neutral-600 font-mono text-[9px] tracking-[0.25em] uppercase mb-2 pointer-events-none">
          {hintText}
        </div>

        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            onClick={() => rotateTrack("prev")}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 backdrop-blur-sm flex items-center justify-center transition-all duration-200 text-white/60 hover:text-white"
            aria-label="Previous"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            onClick={() => rotateTrack("next")}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 backdrop-blur-sm flex items-center justify-center transition-all duration-200 text-white/60 hover:text-white"
            aria-label="Next"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                d="M9 18l6-6-6-6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {activeSlide && (
        <div
          className={`css-modal-backdrop fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10`}
          style={{
            background: "rgba(4, 4, 6, 0.85)",
            backdropFilter: "blur(16px)",
            opacity: modalEntered ? 1 : 0,
          }}
          onClick={closeModal}
        >
          <div
            className={`css-modal-panel relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-[0_40px_100px_rgba(0,0,0,0.9)]`}
            style={{
              background: "rgba(12, 12, 16, 0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              opacity: modalEntered ? 1 : 0,
              transform: modalEntered
                ? "translateY(0) scale(1)"
                : "translateY(24px) scale(0.97)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full md:w-[55%] flex-shrink-0 relative overflow-hidden"
              style={{ minHeight: "280px" }}
            >
              <img
                src={activeSlide.img}
                alt={activeSlide.title}
                className="w-full h-full object-cover"
                style={{ minHeight: "280px" }}
              />
              <div
                className="absolute inset-0 hidden md:block"
                style={{
                  background:
                    "linear-gradient(to right, transparent 70%, rgba(12,12,16,0.8) 100%)",
                }}
              />
            </div>

            <div className="flex flex-col justify-between p-8 md:p-10 flex-1 min-h-0">
              <div className="flex flex-col gap-4">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.4em]"
                  style={{ color: accentColor }}
                >
                  {modalEyebrow}
                </p>

                <h2
                  className="text-2xl md:text-3xl font-light uppercase tracking-wider leading-tight"
                  style={{ color: textColor }}
                >
                  {activeSlide.title}
                </h2>

                <p className="text-sm text-neutral-400 font-light leading-relaxed tracking-wide">
                  {activeSlide.desc}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {modalTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10 text-neutral-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <button
                  className="text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors duration-200 font-mono"
                  onClick={closeModal}
                >
                  {modalCtaLabel}
                </button>

                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all duration-200 text-white/60 hover:text-white hover:rotate-90 group"
                  aria-label="Close"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90"
                  >
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
