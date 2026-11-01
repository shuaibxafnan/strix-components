"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const BASE = "https://images.unsplash.com/";
const PARAMS =
  "&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&h=900";

const defaultImages = [
  {
    id: "1",
    src: BASE + "photo-1577833780113-9ce85d64d49d?ixlib=rb-1.2.1" + PARAMS,
    alt: "Misty forest path with soft morning light",
  },
  {
    id: "2",
    src: BASE + "photo-1513836279014-a89f7a76ae86?ixlib=rb-1.2.1" + PARAMS,
    alt: "Towering pine trees reaching into sky",
  },
  {
    id: "3",
    src: BASE + "photo-1518495973542-4542c06a5843?ixlib=rb-1.2.1" + PARAMS,
    alt: "Golden sunlight streaming through leaves",
  },
  {
    id: "4",
    src: BASE + "photo-1439853949127-fa647821eba0?ixlib=rb-1.2.1" + PARAMS,
    alt: "Still mountain lake at dusk",
  },
  {
    id: "5",
    src: BASE + "photo-1501854140801-50d01698950b?ixlib=rb-1.2.1" + PARAMS,
    alt: "Aerial view of green valley and hills",
  },
  {
    id: "6",
    src: BASE + "photo-1433086966358-54859d0ed716?ixlib=rb-1.2.1" + PARAMS,
    alt: "Waterfall cascading over mossy rocks",
  },
  {
    id: "7",
    src: BASE + "photo-1503656142023-618e7d1f435a?ixlib=rb-1.2.1" + PARAMS,
    alt: "Rocky coastal cliffs at golden hour",
  },
  {
    id: "8",
    src: BASE + "photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1" + PARAMS,
    alt: "Deep forest canopy with dappled light",
  },
  {
    id: "9",
    src: BASE + "photo-1578259985882-c9018b301aaa?ixlib=rb-1.2.1" + PARAMS,
    alt: "Snow-capped peaks above the clouds",
  },
  {
    id: "10",
    src: BASE + "photo-1540206395-68808572332f?ixlib=rb-1.2.1" + PARAMS,
    alt: "Desert sand dunes at sunset",
  },
  {
    id: "11",
    src: BASE + "photo-1521651201144-634f700b36ef?ixlib=rb-1.2.1" + PARAMS,
    alt: "Cherry blossom trees in full bloom",
  },
  {
    id: "12",
    src: BASE + "photo-1456926631375-92c8ce872def?ixlib=rb-1.2.1" + PARAMS,
    alt: "Frozen lake surrounded by birch trees",
  },
  {
    id: "13",
    src: BASE + "photo-1505764761634-1d77b57e1966?ixlib=rb-1.2.1" + PARAMS,
    alt: "Rolling green hills under cloudy sky",
  },
  {
    id: "14",
    src: BASE + "photo-1454496522488-7a8e488e8606?ixlib=rb-1.2.1" + PARAMS,
    alt: "Mountain ridgeline at sunrise",
  },
  {
    id: "15",
    src: BASE + "photo-1543946207-39bd91e70ca7?ixlib=rb-1.2.1" + PARAMS,
    alt: "Autumn forest in warm amber tones",
  },
  {
    id: "16",
    src: BASE + "photo-1504208434309-cb69f4fe52b0?ixlib=rb-1.2.1" + PARAMS,
    alt: "Open field under dramatic storm clouds",
  },
  {
    id: "17",
    src: BASE + "photo-1503066211613-c17ebc9daef0?ixlib=rb-1.2.1" + PARAMS,
    alt: "Alpine meadow with wildflowers",
  },
  {
    id: "18",
    src: BASE + "photo-1503942142281-94af0aded523?ixlib=rb-1.2.1" + PARAMS,
    alt: "Coastal rocks at low tide",
  },
  {
    id: "19",
    src: BASE + "photo-1511497584788-876760111969?ixlib=rb-1.2.1" + PARAMS,
    alt: "Dense jungle foliage with filtered light",
  },
  {
    id: "20",
    src: BASE + "photo-1497290756760-23ac55edf36f?ixlib=rb-1.2.1" + PARAMS,
    alt: "River winding through autumn forest",
  },
  {
    id: "21",
    src: BASE + "photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1" + PARAMS,
    alt: "Turquoise ocean meeting white sand",
  },
  {
    id: "22",
    src: BASE + "photo-1511207538754-e8555f2bc187?ixlib=rb-1.2.1" + PARAMS,
    alt: "Wildflower meadow at golden hour",
  },
  {
    id: "23",
    src: BASE + "photo-1490100667990-4fced8021649?ixlib=rb-1.2.1" + PARAMS,
    alt: "Tropical palm trees silhouetted at dusk",
  },
  {
    id: "24",
    src: BASE + "photo-1508672019048-805c876b67e2?ixlib=rb-1.2.1" + PARAMS,
    alt: "Glassy lake reflecting mountain peaks",
  },
  {
    id: "25",
    src: BASE + "photo-1519681393784-d120267933ba?ixlib=rb-1.2.1" + PARAMS,
    alt: "Starry sky over snowy landscape",
  },
  {
    id: "26",
    src: BASE + "photo-1534067783941-51c9c23ecefd?ixlib=rb-1.2.1" + PARAMS,
    alt: "Mossy boulders in a woodland stream",
  },
  {
    id: "27",
    src: BASE + "photo-1485470733090-0aae1788d5af?ixlib=rb-1.2.1" + PARAMS,
    alt: "Foggy valley between pine-covered slopes",
  },
  {
    id: "28",
    src: BASE + "photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1" + PARAMS,
    alt: "Vivid wildflowers against a blue sky",
  },
];

function LazyImage({ src, alt, dimOnHover }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;
    if (imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
      return;
    }
    const el = imgRef.current;
    const onLoad = () => setLoaded(true);
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full h-full object-cover block will-change-[transform,filter] transition-all duration-500 ease-out
        ${loaded ? "opacity-100" : "opacity-0"} 
        ${dimOnHover ? "brightness-[0.62] saturate-[0.85]" : "brightness-100"}
        group-hover:brightness-100 group-hover:saturate-100 group-focus-visible:brightness-100 group-focus-visible:saturate-100 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]`}
    />
  );
}

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

  if (!visible) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d0f12]/95 backdrop-blur-md animate-[fadeIn_0.3s_ease_forwards]"
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center max-w-[90vw] max-h-[90vh] animate-[slideUp_0.38s_cubic-bezier(0.22,1,0.36,1)_forwards]"
      >
        <img
          src={image.src}
          alt={image.alt}
          className="block max-h-[78vh] max-w-[85vw] object-contain rounded-sm shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
        />

        <div className="w-full flex items-center justify-between mt-4 px-1 gap-4 font-sans">
          <p className="text-white/50 text-[0.8rem] tracking-wide font-light flex-1 overflow-hidden truncate">
            {image.alt}
          </p>
          <span
            style={{ color: accentColor }}
            className="text-[0.75rem] font-semibold tracking-[0.14em] tabular-nums shrink-0"
          >
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 w-10 h-10 bg-white/5 border border-white/10 rounded-full text-white/50 cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:text-white hover:scale-105 active:scale-95"
      >
        <svg viewBox="-50 -50 100 100" width="14" height="14">
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
        aria-label="Previous"
        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 border border-white/10 rounded-full text-white/50 cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:text-white hover:scale-105 active:scale-95"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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
        aria-label="Next"
        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 border border-white/10 rounded-full text-white/50 cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:text-white hover:scale-105 active:scale-95"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M5 2l5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}

export default function JustifiedLightboxGallery({
  images = defaultImages,
  rowHeight = "h-[32vh] sm:h-[40vh]",
  gap = "p-[3px]",
  bgColor = "bg-[#18191e]",
  accentColor = "#c8a96e",
  dimOnHover = true,
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

  return (
    <div className={`${bgColor} font-sans py-8 ${className}`}>
      <ul
        className={`flex flex-wrap ${gap} list-none items-stretch after:content-[''] after:block after:flex-grow-[999] max-w-[1800px] mx-auto px-4
        max-[480px]:flex-col max-[480px]:px-4`}
      >
        {images.map((img, i) => (
          <li
            key={img.id}
            className={`group relative flex-grow overflow-hidden cursor-pointer transition-all duration-200 outline-none
              ${rowHeight} ${gap}
              max-[480px]:h-auto max-[480px]:w-full max-[480px]:flex-grow-0 max-[480px]:mb-3
              landscape:max-[900px]:h-[30vh]`}
            tabIndex={0}
            role="button"
            aria-label={`View: ${img.alt}`}
            onClick={() => openModal(i)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && openModal(i)
            }
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${accentColor}`;
              e.currentTarget.style.zIndex = "1";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "";
              e.currentTarget.style.zIndex = "";
            }}
          >
            <div className="w-full h-full max-[480px]:aspect-[4/3] max-[480px]:max-h-[60vh] overflow-hidden">
              <LazyImage src={img.src} alt={img.alt} dimOnHover={dimOnHover} />
            </div>

            <div
              className="absolute inset-0 border-0 pointer-events-none opacity-0 group-hover:opacity-75 transition-all duration-300 z-10"
              style={{ border: `2px solid ${accentColor}` }}
            />
          </li>
        ))}
      </ul>

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
