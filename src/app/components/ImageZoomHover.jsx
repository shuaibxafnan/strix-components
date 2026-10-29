"use client";

import { useEffect, useState } from "react";

const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Silence",
    year: "2021",
    image:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Resonance",
    year: "2022",
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Essence",
    year: "2022",
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Void",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    title: "Presence",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    title: "Flow",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 7,
    title: "Clarity",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 8,
    title: "Breath",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 9,
    title: "Stillness",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 10,
    title: "Surrender",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function ImageZoomHover({
  projectData = DEFAULT_PROJECTS,
  noiseOpacity = 0.09,
  zoomDuration = "0.8s",
  staggerDelay = 60,
  maxContainerHeight = "max-h-[80vh]",
  listItemPadding = "py-[0.7rem]",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [visibleItems, setVisibleItems] = useState({});

  // Fixes hydration mismatches by ensuring DOM manipulations only occur on clients
  useEffect(() => {
    setMounted(true);

    // Preload all dynamic target hover assets inside background pools
    projectData.forEach((project) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = project.image;
    });

    // Trigger sequential item entry animations
    projectData.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => ({ ...prev, [item.id]: true }));
      }, index * staggerDelay);
    });
  }, [projectData, staggerDelay]);

  const handleMouseEnter = (imageUrl) => {
    setIsZooming(false);
    setActiveImage(imageUrl);
    setIsHovered(true);

    // Forces browser transition resets to capture scaling animations on every change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsZooming(true);
      });
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen bg-[#1a1917] text-[#f8f5f2] font-['PP_Neue_Montreal',sans-serif] font-bold text-[18px] uppercase tracking-[-0.03em] flex items-center justify-center overflow-hidden antialiased select-none">
      {/* ─── Animated Noise Layer ─── */}
      <div
        className="fixed pointer-events-none top-[-50%] left-[-50%] w-[200%] h-[200%]"
        style={{ opacity: noiseOpacity }}
      />

      {/* ─── Injectable Global Animation Helper Keyframes ─── */}
      <style jsx global>{`
        @keyframes noise {
          0% {
            transform: translate(0, 0);
          }
          10% {
            transform: translate(-2%, -3%);
          }
          20% {
            transform: translate(-4%, 2%);
          }
          30% {
            transform: translate(2%, -4%);
          }
          40% {
            transform: translate(-2%, 5%);
          }
          50% {
            transform: translate(-4%, 2%);
          }
          60% {
            transform: translate(3%, 0);
          }
          70% {
            transform: translate(0, 3%);
          }
          80% {
            transform: translate(-3%, 0);
          }
          90% {
            transform: translate(2%, 2%);
          }
          100% {
            transform: translate(1%, 0);
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ─── Canvas View Background Image Container ─── */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id="background-image"
          crossOrigin="anonymous"
          src={
            activeImage ||
            "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          }
          alt=""
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isZooming ? "scale(1.0)" : "scale(1.2)",
            transition: isZooming
              ? `transform ${zoomDuration} cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease`
              : "none",
          }}
        />
      </div>

      {/* ─── Scrollable Row Interfaces ─── */}
      <div className="w-full max-w-[1000px] h-full flex items-center justify-center z-10 relative px-4">
        <div
          className={`w-full relative z-10 overflow-y-auto p-5 no-scrollbar ${maxContainerHeight}`}
          onMouseLeave={handleMouseLeave}
        >
          {projectData.map((project, index) => (
            <div
              key={project.id}
              onMouseEnter={() => handleMouseEnter(project.image)}
              className={`group relative flex flex-col md:flex-row md:items-center justify-between border-b border-[#f8f5f2]/10 cursor-pointer gap-2 md:gap-0 px-2 transition-all duration-[800ms] ease-out ${listItemPadding}`}
              style={{
                opacity: visibleItems[project.id] ? 1 : 0,
                transform: visibleItems[project.id]
                  ? "translateY(0)"
                  : "translateY(20px)",
              }}
            >
              <div className="absolute bottom-0 left-0 w-full h-0 bg-[#f8f5f2] z-[1] pointer-events-none transition-[height] duration-[800ms] ease-[cubic-bezier(0.445,0.05,0.55,0.95)] group-hover:h-full group-hover:duration-200" />

              <div className="relative z-[2] mix-blend-exclusion flex items-baseline gap-4 md:gap-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                <span className="text-[0.75rem] md:text-[0.85rem] tabular-nums opacity-40 transition-opacity duration-300 group-hover:opacity-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[1.4rem] md:text-[1.8rem] leading-none">
                  {project.title}
                </span>
              </div>

              <div className="relative z-[2] mix-blend-exclusion flex items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-2">
                <span className="hidden md:block h-px w-6 bg-current opacity-30 origin-right scale-x-50 transition-all duration-500 group-hover:scale-x-150 group-hover:opacity-100" />
                <span className="text-[1.4rem] md:text-[1.8rem] leading-none opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                  {project.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
