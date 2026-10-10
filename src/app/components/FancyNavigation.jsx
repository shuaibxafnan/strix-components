"use client";

import { useState, useEffect } from "react";

// ─── FancyNavigation Component Props ────────────────────────────────────────
//
// Props:
// ────────────────────────────────────────────────────────────────────────────
// speed            number            Global micro-transition duration in seconds (Default: 0.5)
// glowIntensity    'low'|'med'|'hi'  Intensity of the futuristic cyber-neon glow styling (Default: 'med')
// customItems      array             Optional payload override matching the item schema layout array below.
// ────────────────────────────────────────────────────────────────────────────

export default function FancyNavigation({
  speed = 0.5,
  glowIntensity = "med",
  customItems = null,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent SSR & Hydration layout shift issues securely
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default futuristic high-fidelity payload config
  const defaultItems = [
    {
      title: "We’re not afraid to rethink things",
      shortDesc:
        "Breaking paradigms through algorithmic spatial sequencing and architectural quantum logic processing structures.",
      img: "https://assets.codepen.io/3341051/interior1.jpg",
      // Cyberpunk Colorways: Seamlessly transitioning backgrounds & high-saturation neon anchors
      accentBg: "group-hover:bg-cyan-950/60",
      glowColor: "shadow-cyan-500/40",
      lineColor: "bg-cyan-400",
      textColor: "text-cyan-400",
      tabBg:
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950 via-zinc-950 to-black",
      paragraphs: [
        "Lorem ipsum dolor sit amet consectetur adipiscing elit venenatis, pharetra tempor est hac commodo nulla. Nullam fusce habitasse est lectus dapibus aenean et, inceptos sem placerat quam laoreet purus velit, aliquam venenatis ut eleifend montes porttitor scelerisque, vel vitae potenti per facilisi commodo. Aptent inceptos malesuada suspendisse mauris curae luctus faucibus in, varius facilisis conubia vulputate praesent nulla sem, urna velit blandit condimentum ad at senectus.",
        "In mattis nunc ornare habitant lacus suscipit lectus fames maecenas, tempor gravida ut vestibulum eros semper vitae. Velit justo commodo suspendisse odio metus malesuada vulputate nisl vel, dui blandit maecenas cum ullamcorper ornare fusce torquent at morbi, volutpat nisi pharetra arcu parturient sapien quis sociis. Ut metus volutpat molestie sollicitudin",
      ],
    },
    {
      title: "Enthusiastic creators for living environments",
      shortDesc:
        "Adapting biophilic systemic parameters into self-sustaining atmospheric synthetic modules.",
      img: "https://assets.codepen.io/3341051/interior2.jpg",
      accentBg: "group-hover:bg-violet-950/60",
      glowColor: "shadow-violet-500/40",
      lineColor: "bg-violet-400",
      textColor: "text-violet-400",
      tabBg:
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950 via-zinc-950 to-black",
      paragraphs: [
        "Lorem ipsum dolor sit amet consectetur adipiscing elit venenatis, pharetra tempor est hac commodo nulla. Nullam fusce habitasse est lectus dapibus aenean et, inceptos sem placerat quam laoreet purus velit, aliquam venenatis ut eleifend montes porttitor scelerisque, vel vitae potenti per facilisi commodo. Aptent inceptos malesuada suspendisse mauris curae luctus faucibus in, varius facilisis conubia vulputate praesent nulla sem, urna velit blandit condimentum ad at senectus.",
      ],
    },
    {
      title: "Create modern yet timeless experiences",
      shortDesc:
        "Projecting multi-dimensional interactive aesthetics that transcend linear chronologies.",
      img: "https://assets.codepen.io/3341051/interior3.jpg",
      accentBg: "group-hover:bg-fuchsia-950/60",
      glowColor: "shadow-fuchsia-500/40",
      lineColor: "bg-fuchsia-400",
      textColor: "text-fuchsia-400",
      tabBg:
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-950 via-zinc-950 to-black",
      paragraphs: [
        "Lorem ipsum dolor sit amet consectetur adipiscing elit venenatis, pharetra tempor est hac commodo nulla. Nullam fusce habitasse est lectus dapibus aenean et, inceptos sem placerat quam laoreet purus velit, aliquam venenatis ut eleifend montes porttitor scelerisque, vel vitae potenti per facilisi commodo.",
        "eu litora eros, enim mollis blandit rhoncus consequat augue iaculis justo, volutpat ac hac lectus nisl dictum metus primis. Ultrices et nisi urna eleifend sodales montes inceptos placerat eget, quisque leo curabitur risus convallis blandit ac class, mi ridiculus vestibulum pretium taciti cursus morbi commodo.",
      ],
    },
    {
      title: "Ultimately, design is about being",
      shortDesc:
        "Existential spatial matrices rendered inside clean minimal physical structural layers.",
      img: "https://assets.codepen.io/3341051/interior4.jpg",
      accentBg: "group-hover:bg-lime-950/60",
      glowColor: "shadow-lime-500/40",
      lineColor: "bg-lime-400",
      textColor: "text-lime-400",
      tabBg:
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-950 via-zinc-950 to-black",
      paragraphs: [
        "Lorem ipsum dolor sit amet consectetur adipiscing elit venenatis, pharetra tempor est hac commodo nulla. Nullam fusce habitasse est lectus dapibus aenean et, inceptos sem placerat quam laoreet purus velit, aliquam venenatis ut eleifend montes porttitor scelerisque, vel vitae potenti per facilisi commodo. Aptent inceptos malesuada suspendisse mauris curae luctus faucibus in, varius facilisis conubia vulputate praesent nulla sem, urna velit blandit condimentum ad at senectus.",
      ],
    },
  ];

  const items = customItems || defaultItems;

  const glowClassMap = {
    low: "shadow-sm",
    med: "shadow-md backdrop-blur-sm",
    hi: "shadow-2xl shadow-current backdrop-blur-xl",
  };

  if (!isMounted) return null;

  return (
    <div className="relative w-full h-screen font-sans antialiased text-neutral-200 overflow-hidden bg-black select-none">
      {/* ─── Global Background Masking Overlays ──────────────────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10 pointer-events-none" />

      {/* ─── Modular Interactive Columns Grid ──────────────────────────────── */}
      <nav className="relative flex flex-col md:flex-row h-full w-full z-0 box-border">
        {items.map((item, idx) => {
          const isCurrentHovered = hoveredIndex === idx;
          return (
            <div
              key={`item-${idx}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(idx)}
              style={{ transitionDuration: `${speed}s` }}
              className={`
                relative flex flex-col justify-end w-full h-1/4 md:w-1/4 md:h-full 
                cursor-pointer overflow-hidden group border-zinc-800/80
                border-b md:border-b-0 md:border-r last:border-0
                transition-all ease-[cubic-bezier(0.16,1,0.3,1)]
              `}
            >
              {/* ── Individual Native Column Image Background ── */}
              <div
                className="absolute inset-0 w-full h-full z-0 pointer-events-none transition-all"
                style={{
                  transitionDuration: `${speed * 1.5}s`,
                  transform: isCurrentHovered ? "scale(1.05)" : "scale(1.0)",
                }}
              >
                <img
                  src={item.img}
                  alt=""
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isCurrentHovered
                      ? "grayscale-0 brightness-[0.65] saturate-[1.1] contrast-[1.1]"
                      : "grayscale tracking-wide brightness-[0.45] contrast-[1.05]"
                  }`}
                  loading="lazy"
                />
              </div>

              {/* Futuristic Interactive Fluid Tint Matrix Overlay */}
              <div
                style={{ transitionDuration: `${speed}s` }}
                className={`absolute inset-0 bg-zinc-950/20 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all z-10 ${item.accentBg}`}
              />

              {/* Column Meta Text Indexing */}
              <div className="absolute top-6 left-6 font-mono text-[10px] tracking-widest text-zinc-400/60 group-hover:text-white/90 transition-colors z-20">
                // LAYER_NODE_0{idx + 1}
              </div>

              {/* Card Contents Wrapper */}
              <div
                style={{ transitionDuration: `${speed}s` }}
                className="relative w-full p-6 md:p-8 box-border transform transition-transform ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-[52px] md:translate-y-[100px] group-hover:translate-y-0 z-20"
              >
                <h3 className="m-0 text-white font-bold tracking-wide uppercase leading-tight text-base md:text-md lg:text-lg transition-transform duration-300">
                  <span
                    className={`inline-block mr-2 opacity-0 group-hover:opacity-100 transition-opacity ${item.textColor}`}
                  >
                    &gt;
                  </span>
                  {item.title}
                </h3>

                <div
                  className="mt-3 text-zinc-300 text-xs leading-relaxed line-clamp-1 md:line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                  style={{ transitionDelay: "40ms" }}
                >
                  <p className="m-0 font-normal font-mono tracking-tight">
                    {item.shortDesc}
                  </p>
                </div>

                <button
                  type="button"
                  className={`
                    relative inline-flex items-center justify-center px-5 py-2 mt-6 text-[10px] font-mono font-bold tracking-widest uppercase bg-transparent border rounded-sm overflow-hidden transition-all duration-300
                    border-zinc-500 text-zinc-200 group-hover:border-white hover:text-black focus:outline-none
                    ${isCurrentHovered ? `shadow-lg ${item.glowColor}` : ""}
                  `}
                >
                  <span className="relative z-10">INITIALIZE</span>
                  <span className="absolute inset-0 bg-white transform scale-y-0 origin-bottom transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-bottom hover:scale-y-100 -z-0" />
                </button>
              </div>

              {/* Futuristic Laser Border Highlight */}
              <div
                style={{ transitionDuration: `${speed}s` }}
                className={`absolute bottom-0 left-0 h-[3px] ${item.lineColor} w-0 group-hover:w-full transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${glowClassMap[glowIntensity]} ${item.glowColor} z-20`}
              />
            </div>
          );
        })}
      </nav>

      {/* ─── Fully Expanded Holographic Display Panel Drawers ────────────────── */}
      <div
        style={{ transitionDuration: `${speed}s` }}
        className={`absolute inset-0 w-full h-full z-30 transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
          activeIndex !== null
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
      >
        {items.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div
              key={`tab-${idx}`}
              style={{ transitionDuration: `${speed}s` }}
              className={`
                absolute inset-0 w-full h-full px-4 py-8 md:p-12 box-border overflow-y-auto transition-all ease-[cubic-bezier(0.16,1,0.3,1)]
                ${item.tabBg} ${isActive ? "opacity-100 scale-100 visible" : "opacity-0 scale-105 invisible pointer-events-none"}
              `}
            >
              <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
                {/* Close Controls Header Ribbon */}
                <div className="flex justify-between items-center w-full border-b border-zinc-800 pb-4">
                  <div className="font-mono text-xs tracking-widest text-zinc-500">
                    CORE_INTERFACE /{" "}
                    <span className={item.textColor}>NODE_0{idx + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(null);
                    }}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-bl-xl border border-zinc-800 hover:border-zinc-400 bg-zinc-900/50 backdrop-blur-xl text-white cursor-pointer transition-all duration-300 focus:outline-none"
                    title="Terminate Protocol"
                  >
                    <span className="sr-only">Close Terminal</span>
                    <div className="relative w-4 h-4">
                      <span className="absolute block w-full h-[1.5px] bg-zinc-400 rounded-sm top-1/2 left-0 -translate-y-1/2 rotate-45 transition-transform duration-300 group-hover:rotate-[135deg] group-hover:bg-white" />
                      <span className="absolute block w-full h-[1.5px] bg-zinc-400 rounded-sm top-1/2 left-0 -translate-y-1/2 -rotate-45 transition-transform duration-300 group-hover:rotate-[45deg] group-hover:bg-white" />
                    </div>
                  </button>
                </div>

                {/* Expanded Screen Graphic Projection Base */}
                <div
                  style={{ transitionDuration: `${speed * 1.3}s` }}
                  className={`relative w-full h-[220px] md:h-[380px] rounded-sm overflow-hidden border border-zinc-800 transition-all transform ${
                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] saturate-[1.15]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1/2 animate-pulse pointer-events-none" />
                </div>

                {/* Monolithic Glassmorphic Description Data Engine Board */}
                <div
                  style={{ transitionDuration: `${speed}s` }}
                  className={`relative w-full p-6 md:p-10 -mt-12 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 rounded-sm box-border transition-all ${
                    isActive
                      ? "opacity-100 transform translate-y-0"
                      : "opacity-0 transform translate-y-8"
                  }`}
                >
                  <h3 className="mt-0 text-lg md:text-2xl font-black tracking-wide text-white uppercase leading-tight border-b border-zinc-900 pb-4 mb-6 flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-3 animate-ping ${item.lineColor}`}
                    />
                    {item.title}
                  </h3>

                  <div className="text-zinc-400 text-xs md:text-sm leading-relaxed font-mono space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {item.paragraphs.map((para, pIdx) => (
                      <p
                        key={`p-${pIdx}`}
                        className="m-0 font-light border-l-2 border-zinc-800 pl-4 hover:border-zinc-500 transition-colors duration-200"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
