"use client";

import { useState, useEffect, useCallback } from "react";

const defaultImages = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "A dog gazing at the sky and at a promising future. Or a nearby squirrel.",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "A bulldog with a lot of moxie",
    colSpan: 2,
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1510771463146-e89e6e86560e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "A daring dog carrying a flower between its romantic fangs",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "A cuddly young pup with a sassy red collar",
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "An extremely active dog jumping between the ocean's waves",
    colSpan: 2,
    rowSpan: 2,
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "Two dogs cheerfully hopping along a beaten path.",
  },
  {
    id: "7",
    src: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "A dog diligently sitting and waiting for someone special, with a welcoming flower",
    rowSpan: 2,
  },
  {
    id: "8",
    src: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "A carefree dog licking its nose in a rather blurry picture",
  },
  {
    id: "9",
    src: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "A smart, glass-wearing dog resting on an open book",
  },
  {
    id: "10",
    src: "https://images.unsplash.com/photo-1504595403659-9088ce801e29?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max",
    alt: "Two curious dogs looking above with great expectations",
  },
];

function Modal({ image, index, total, onClose, onPrev, onNext, accentColor }) {
  const visible = !!image;

  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose, onPrev, onNext]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500"
        style={{
          background: "rgba(0, 0, 0, 0.82)",
          backdropFilter: visible ? "blur(8px)" : "blur(0px)",
          opacity: visible ? 1 : 0,
          visibility: visible ? "visible" : "hidden",
          pointerEvents: visible ? "auto" : "none",
          animation: visible ? "modalFadeIn 0.35s ease forwards" : "none",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col items-center max-w-[90vw] max-h-[90vh]"
          style={{
            animation: visible
              ? "modalSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards"
              : "none",
          }}
        >
          <img
            src={image?.src}
            alt={image?.alt}
            className="block max-h-[80vh] max-w-[85vw] object-contain rounded-sm shadow-2xl"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
          />

          <div className="w-full flex items-center justify-between mt-4 px-1 gap-4 font-sans">
            <p className="text-white/60 text-[0.78rem] tracking-wide leading-snug flex-1 line-clamp-1 font-light">
              {image?.alt}
            </p>
            <span
              className="text-[0.72rem] font-semibold tracking-[0.12em] tabular-nums shrink-0"
              style={{ color: accentColor }}
            >
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/60 transition-all duration-200 bg-black/30 backdrop-blur-sm"
        >
          <svg viewBox="-50 -50 100 100" width="16" height="16">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              strokeLinecap="round"
            >
              <path transform="rotate(45)" d="M -40 0 h 80 m -40 -40 v 80" />
            </g>
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/60 transition-all duration-200 bg-black/30 backdrop-blur-sm"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/60 transition-all duration-200 bg-black/30 backdrop-blur-sm"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M5 2l5 5-5 5" />
          </svg>
        </button>
      </div>
    </>
  );
}

export default function BentoGallery({
  images = defaultImages,
  accentColor = "#f0a500",
  bgColor = "#111416",
  gridCols = 5,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const openModal = useCallback((i) => setActiveIndex(i), []);
  const closeModal = useCallback(() => setActiveIndex(null), []);
  const goPrev = useCallback(
    () => setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1)),
    [images.length],
  );
  const goNext = useCallback(
    () => setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0)),
    [images.length],
  );

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  const isWide = typeof window !== "undefined" && window.innerWidth > 640;

  const columnClasses = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
    7: "sm:grid-cols-7",
    8: "sm:grid-cols-8",
  };

  return (
    <div
      className={`font-sans w-full flex flex-col items-center justify-center py-12 px-6 text-white ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <main
        className={`grid grid-cols-2 ${columnClasses[gridCols] || "sm:grid-cols-5"} auto-rows-[140px] sm:auto-rows-[150px] grid-flow-row-dense justify-center content-center gap-[2px] sm:gap-[3px] w-full max-w-[780px]`}
        role="list"
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            className="group relative overflow-hidden cursor-pointer bg-[#1d2125] focus:outline-none transition-all duration-300 col-span-1 row-span-1"
            style={{
              gridColumn:
                img.colSpan && isWide
                  ? `span ${img.colSpan}`
                  : undefined,
              gridRow:
                img.rowSpan && isWide
                  ? `span ${img.rowSpan}`
                  : undefined,
            }}
            onClick={() => openModal(i)}
            aria-label={`View: ${img.alt}`}
            role="listitem"
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${accentColor}`;
              e.currentTarget.style.outlineOffset = "2px";
              e.currentTarget.style.zIndex = "1";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "";
              e.currentTarget.style.outlineOffset = "";
              e.currentTarget.style.zIndex = "";
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="block w-full h-full object-cover brightness-[0.55] saturate-[0.9] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:brightness-100 group-hover:saturate-[1.05] group-hover:scale-[1.07] group-focus:brightness-100 group-focus:saturate-[1.05] group-focus:scale-[1.07] will-change-transform"
            />

            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-250 z-10"
              style={{ border: `2px solid ${accentColor}` }}
            />

            <svg
              className="absolute bottom-2 right-2 w-[22px] h-[22px] opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 group-focus:opacity-100 group-focus:scale-100 transition-all duration-250 pointer-events-none z-20"
              viewBox="0 0 20 20"
              fill="none"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M13 3h4v4M3 7V3h4M7 17H3v-4M17 13v4h-4" />
            </svg>
          </button>
        ))}
      </main>

      <Modal
        image={activeImage}
        index={activeIndex ?? 0}
        total={images.length}
        onClose={closeModal}
        onPrev={goPrev}
        onNext={goNext}
        accentColor={accentColor}
      />
    </div>
  );
}
