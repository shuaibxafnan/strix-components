"use client";

import { useEffect, useState, useRef } from "react";

// ─── MinimalistProjectList ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// projectData         Array    (See Default) Array of projects to render
// noiseOpacity        number   0.09          Intensity of the animated noise overlay
// zoomDuration        string   "0.8s"        CSS transition duration for background image zoom
// staggerDelay        number   60            Stagger delay in ms for the opening fade-in animation
// maxContainerHeight  string   "max-h-[80vh]" Tailwind class defining maximum scroll height of the list
// listItemPadding     string   "py-[0.7rem]"  Tailwind class adjusting list line item vertical density
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Silence",
    year: "2021",
    image:
      "https://cdn.cosmos.so/7d47d4e2-0eff-4e2f-9734-9d24a8ba067e?format=jpeg",
  },
  {
    id: 2,
    title: "Resonance",
    year: "2022",
    image:
      "https://cdn.cosmos.so/5eee2d2d-3d4d-4ae5-96d4-cdbae70a2387?format=jpeg",
  },
  {
    id: 3,
    title: "Essence",
    year: "2022",
    image:
      "https://cdn.cosmos.so/def30e8a-34b2-48b1-86e1-07ec5c28f225?format=jpeg",
  },
  {
    id: 4,
    title: "Void",
    year: "2023",
    image:
      "https://cdn.cosmos.so/44d7cb23-6759-49e4-9dc1-acf771b3a0d1?format=jpeg",
  },
  {
    id: 5,
    title: "Presence",
    year: "2023",
    image:
      "https://cdn.cosmos.so/7712fe42-42ca-4fc5-9590-c89f2db99978?format=jpeg",
  },
  {
    id: 6,
    title: "Flow",
    year: "2024",
    image:
      "https://cdn.cosmos.so/cbee1ec5-01b6-4ffe-9f34-7da7980454cf?format=jpeg",
  },
  {
    id: 7,
    title: "Clarity",
    year: "2024",
    image:
      "https://cdn.cosmos.so/2e91a9d1-db85-4499-ad37-6222a6fea23b?format=jpeg",
  },
  {
    id: 8,
    title: "Breath",
    year: "2024",
    image:
      "https://cdn.cosmos.so/ff2ac3d3-fa94-4811-89f6-0d008b27e439?format=jpeg",
  },
  {
    id: 9,
    title: "Stillness",
    year: "2025",
    image:
      "https://cdn.cosmos.so/c39a4043-f489-4406-8018-a103a3f89802?format=jpeg",
  },
  {
    id: 10,
    title: "Surrender",
    year: "2025",
    image:
      "https://cdn.cosmos.so/e5e399f2-4050-463b-a781-4f5a1615f28e?format=jpeg",
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
        className="fixed pointer-events-none top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('http://assets.iceable.com/img/noise-transparent.png')] bg-[size:300px_300px] animate-[noise_0.3s_steps(5)_infinite] z-[100]"
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
          {projectData.map((project) => (
            <div
              key={project.id}
              onMouseEnter={() => handleMouseEnter(project.image)}
              className={`group relative flex flex-col md:flex-row justify-between border-b border-[#f8f5f2]/10 cursor-pointer gap-2 md:gap-0 transition-all duration-[800ms] ease-out ${listItemPadding}`}
              style={{
                opacity: visibleItems[project.id] ? 1 : 0,
                transform: visibleItems[project.id]
                  ? "translateY(0)"
                  : "translateY(20px)",
              }}
            >
              {/* Dynamic Overlay Hover Background Curtain */}
              <div className="absolute bottom-0 left-0 w-full h-0 bg-[#f8f5f2] z-1 pointer-events-none transition-[height] duration-800 cubic-bezier(0.445,0.05,0.55,0.95) group-hover:h-full group-hover:duration-200" />

              {/* Context Copy Strings */}
              <div className="text-[1.4rem] md:text-[1.8rem] relative z-2 mix-blend-exclusion">
                {project.title}
              </div>
              <div className="text-[1.4rem] md:text-[1.8rem] relative z-2 mix-blend-exclusion">
                {project.year}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
