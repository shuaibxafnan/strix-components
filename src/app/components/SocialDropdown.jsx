"use client";

import { useState, useRef, useEffect } from "react";

// ─── Shared Platform Vectors Mapping Configuration ───────────────────────────
const ICONS = {
  linkedin: "M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z",
  instagram: "M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z",
  facebook: "M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z",
  twitter: "M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z",
  youtube: "M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"
};

const PLATFORMS = ["Linkedin", "Instagram", "Facebook", "Twitter", "Youtube"];

export default function SocialDropdown({
  defaultPlatform = "facebook",
  panelTitle = "Connect Account",
  panelMaxWidth = "360px",
  cardBg = "#09090C",
  accentActiveColor = "#FFFFFF"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultPlatform.toLowerCase());
  const [hoverIndex, setHoverIndex] = useState(null);
  const [floatingPos, setFloatingPos] = useState({ x: 0, y: 0, show: false, icon: "" });

  const listRef = useRef(null);

  useEffect(() => {
    if (!document.querySelector('link[href*="fonts.googleapis"]')) {
      const fontSheet = document.createElement("link");
      fontSheet.rel = "stylesheet";
      fontSheet.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap";
      document.head.appendChild(fontSheet);
    }
  }, []);

  const handleMouseMove = (e, platformName) => {
    if (!listRef.current) return;
    const bounds = listRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left - 14; 
    const y = e.clientY - bounds.top - 14;

    setFloatingPos({
      x,
      y,
      show: true,
      icon: ICONS[platformName.toLowerCase()] || ""
    });
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center m-0 bg-[#040406] font-['Plus_Jakarta_Sans',_sans-serif] selection:bg-white/10">
      <div
        style={{ maxWidth: panelMaxWidth }}
        className="w-full flex flex-col relative px-4"
      >
        {/* Section Heading */}
        <label className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 block pl-1">
          {panelTitle}
        </label>

        {/* Selected View Window */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ backgroundColor: cardBg }}
          className="h-14 rounded-2xl border border-white/[0.06] px-5 text-white/70 flex items-center justify-between text-sm font-medium tracking-wide w-full cursor-pointer outline-none shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:text-white hover:border-white/15 transition-all duration-300 group focus:border-white/20"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="inline-flex h-4 w-4 fill-white/40 group-hover:fill-white/90 transition-colors duration-300">
              <svg viewBox="0 0 16 16" className="w-4 h-4">
                <path d={ICONS[selected]} />
              </svg>
            </span>
            <span className="capitalize truncate tracking-wide font-normal text-white/80 group-hover:text-white">
              {selected}
            </span>
          </div>

          <span className={`inline-flex fill-white/30 group-hover:fill-white/80 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isOpen ? "rotate-180 text-white" : "rotate-0"}`}>
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="0.5">
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
            </svg>
          </span>
        </button>

        {/* Dynamic Nested Drawer Base - Fixed clipping with grid transitions */}
        <div
          className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            isOpen ? "grid-rows-[1fr] opacity-100 mt-2.5" : "grid-rows-[0fr] opacity-0 mt-0"
          }`}
        >
          <div className="overflow-hidden">
            <div
              style={{ backgroundColor: cardBg }}
              className="p-2 rounded-2xl border border-white/[0.05] relative shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl mb-1"
            >
              <ul
                ref={listRef}
                onMouseLeave={() => {
                  setHoverIndex(null);
                  setFloatingPos((prev) => ({ ...prev, show: false }));
                }}
                className="relative list-none m-0 p-0 flex flex-col gap-1 z-10"
              >
                {/* Backdrop Track Hover Overlay */}
                <div
                  style={{
                    transform: hoverIndex !== null ? `translateY(${hoverIndex * 48}px)` : "translateY(0px)",
                    opacity: hoverIndex !== null ? 1 : 0
                  }}
                  className="absolute top-0 right-0 left-0 h-[44px] bg-white/[0.04] border border-white/[0.02] rounded-xl pointer-events-none transition-all duration-200 ease-out z-0"
                />

                {PLATFORMS.map((platform, idx) => (
                  <li
                    key={platform}
                    className={`flex flex-col relative transition-all duration-300 z-10 ${
                      isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                    style={{ transitionDelay: `${idx * 15}ms` }}
                  >
                    <button
                      onClick={() => {
                        setSelected(platform.toLowerCase());
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseMove={(e) => handleMouseMove(e, platform)}
                      className="h-[44px] text-white/50 hover:text-white font-normal text-[13.5px] tracking-wide px-4 text-left cursor-none overflow-hidden truncate w-full flex items-center transition-colors duration-200 relative z-10"
                    >
                      {platform}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Dynamic Lens Cursor Tracker */}
              <div
                style={{
                  left: `${floatingPos.x}px`,
                  top: `${floatingPos.y}px`,
                  opacity: floatingPos.show ? 1 : 0,
                  backgroundColor: accentActiveColor
                }}
                className="h-7 w-7 absolute rounded-lg pointer-events-none flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-opacity duration-150 ease-out z-40"
              >
                {floatingPos.icon && (
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-[#09090C]">
                    <path d={floatingPos.icon} />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}