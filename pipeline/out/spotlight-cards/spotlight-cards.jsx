"use client";

import { useRef } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const DEFAULT_CARDS = [
  {
    icon: "fa-duotone fa-solid fa-brain-circuit",
    title: "Neural Engines",
    subtitle:
      "Deploy highly efficient, quantized language models at the edge with sub-millisecond latencies.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    icon: "fa-duotone fa-solid fa-network-wired",
    title: "Vector Mesh",
    subtitle:
      "Distributed high-dimensional spatial databases optimized for semantic indexing and search.",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: "fa-duotone fa-solid fa-bolt",
    title: "Stream Pipelines",
    subtitle:
      "Real-time, fault-tolerant event ingestion engines processing multi-gigabit streams concurrently.",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    icon: "fa-duotone fa-solid fa-shield-halved",
    title: "Zero-Trust Guard",
    subtitle:
      "Cryptographically enforced state management and isolated micro-runtime security schemas.",
    accent: "from-indigo-400 to-purple-500",
  },
  {
    icon: "fa-duotone fa-solid fa-chart-scatter-3d",
    title: "Telemetry Analytics",
    subtitle:
      "Deep observe observability infrastructure mapping complex application clusters natively.",
    accent: "from-pink-400 to-rose-500",
  },
  {
    icon: "fa-duotone fa-solid fa-cubes",
    title: "Automated Orchestrators",
    subtitle:
      "Declarative, self-healing immutable execution modules operating across global regions.",
    accent: "from-fuchsia-400 to-violet-600",
  },
];

export default function SpotlightCards({
  cards = DEFAULT_CARDS,
  bgColor = "rgb(10, 10, 11)",
  cardBg = "rgb(17, 17, 19)",
  cardBorder = "rgba(255, 255, 255, 0.04)",
  spotlightHover = "rgba(255, 255, 255, 0.03)",
  spotlightBorder = "rgba(255, 255, 255, 0.25)",
  className = "",
}) {
  const gridRef = useRef(null);

  const handleMouseMove = (e) => {
    const grid = gridRef.current;
    if (!grid) return;
    for (const card of grid.querySelectorAll(".sc-card")) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <style>{`
        .sc-page { background-color: ${bgColor}; }
        .sc-card {
          background-color: ${cardBorder};
          cursor: pointer;
          position: relative;
          border-radius: 14px;
        }
        .sc-card::before,
        .sc-card::after {
          border-radius: inherit;
          content: "";
          height: 100%;
          left: 0;
          opacity: 0;
          position: absolute;
          top: 0;
          transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }
        .sc-card::before {
          background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${spotlightHover}, transparent 60%);
          z-index: 3;
        }
        .sc-card::after {
          background: radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), ${spotlightBorder}, transparent 50%);
          z-index: 1;
        }
        .sc-card:hover::before { opacity: 1; }
        .sc-grid:hover .sc-card::after { opacity: 1; }
        .sc-inner {
          background-color: ${cardBg};
          border-radius: inherit;
          inset: 1px;
          position: absolute;
          z-index: 2;
        }
      `}</style>

      <div
        className={`sc-page w-full h-screen flex items-center justify-center p-6 md:p-12 overflow-y-auto ${inter.className} ${className}`}
      >
        <div
          ref={gridRef}
          className="sc-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl w-full py-8 my-auto"
          onMouseMove={handleMouseMove}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="sc-card h-[280px] group w-full flex flex-col transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="sc-inner flex flex-col justify-between p-6 overflow-hidden">
                <div className="relative flex items-center justify-between w-full h-14">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-inner text-xl">
                    <i
                      className={`${card.icon} bg-gradient-to-br ${card.accent} bg-clip-text text-transparent`}
                    />
                  </div>

                  <div className="absolute right-[-10px] top-[-20px] pointer-events-none select-none opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-500 text-[6.5rem]">
                    <i className={card.icon} />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <h3 className="text-zinc-100 font-medium tracking-tight text-[1.15rem] m-0 flex items-center gap-2">
                    {card.title}
                    <i className="fa-solid fa-arrow-up-right text-xs opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>
                  <p className="text-zinc-400 font-normal text-[0.875rem] leading-relaxed m-0">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
