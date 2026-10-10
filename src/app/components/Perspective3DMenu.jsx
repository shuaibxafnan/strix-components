"use client";

import { useEffect, useState } from "react";

// ─── Perspective3DMenu ────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// accentColor        string   "#e20f2f"           Primary interactive emphasis tone
// logoPrimary        string   "Coding"            Brand heading prefix text
// logoAccent         string   "Beast"             Brand heading suffix text
// homeImage          string   "https://..."       Visual slide asset for Home view
// aboutImage         string   "https://..."       Visual slide asset for About view
// servicesImage      string   "https://..."       Visual slide asset for Services view
// portfolioImage     string   "https://..."       Visual slide asset for Portfolio view
// contactImage       string   "https://..."       Visual slide asset for Contact view
// homeTitle          string   "Future is here"    Home prominent title layout copy
// homeDesc           string   "“All our dreams..."Home sub-text summary layout copy
// ──────────────────────────────────────────────────────────────────────────

export default function Perspective3DMenu({
  accentColor = "#e20f2f",
  logoPrimary = "Coding",
  logoAccent = "Beast",
  homeImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop",
  aboutImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
  servicesImage = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
  portfolioImage = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
  contactImage = "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=1200&auto=format&fit=crop",
  homeTitle = "Future is here",
  homeDesc = "“All our dreams can come true, if we have the courage to pursue them.”",
}) {
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-screen bg-[#131414]" />;
  }

  const linksList = [
    { id: "home", label: "Home", delay: "0.05s" },
    { id: "about", label: "About", delay: "0.1s" },
    { id: "contact", label: "Contact", delay: "0.15s" },
    { id: "services", label: "Service", delay: "0.2s" },
    { id: "portfolio", label: "Portfolio", delay: "0.25s" },
  ];

  return (
    <div
      className="w-full min-h-screen relative overflow-hidden bg-[#131414] bg-gradient-to-br from-[#131414] to-[#090a0a] select-none text-white antialiased tracking-tight"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* ─── FIXED GLOBAL NAVIGATION CONSOLE ─── */}
      <nav className="fixed top-0 left-0 w-full h-20 z-50 pointer-events-none">
        <div className="max-w-[72rem] w-full h-full mx-auto px-8 flex justify-between items-center pointer-events-auto">
          <h3 className="text-[1.8rem] font-semibold uppercase tracking-[2px] mt-[20px]">
            {logoPrimary}
            <span
              className="text-[1.8rem] ml-[5px]"
              style={{ color: accentColor }}
            >
              {logoAccent}
            </span>
          </h3>

          {/* Micro-Interactive Custom Hamburger Menu Trigger */}
          <div
            onClick={() => setIsActive(!isActive)}
            className="h-16 w-12 cursor-pointer flex items-center justify-end group z-50"
          >
            <div className="relative w-[1.9rem] h-[1.5px] flex items-center justify-end">
              <span
                className={`h-[1.5px] rounded-[2px] bg-[#eee] transition-all duration-500 relative ${
                  isActive ? "bg-transparent rotate-[360deg] w-full" : "w-full"
                } before:content-[''] before:absolute before:w-inherit before:height-inherit before:bg-[#eee] before:transition-all before:duration-500 after:content-[''] after:absolute after:w-inherit after:height-inherit after:bg-[#eee] after:transition-all after:duration-500 ${
                  isActive
                    ? "before:w-[1.9rem] before:h-[1.5px] before:translate-y-0 before:rotate(45deg) after:w-[1.9rem] after:h-[1.5px] after:translate-y-0 after:rotate(-45deg)"
                    : "before:w-[1.9rem] before:h-[1.5px] before:translate-y-[-9px] after:w-[1.9rem] after:h-[1.5px] after:translate-y-[9px]"
                }`}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MAIN 3D PERSPECTIVE PLATFORM ASSEMBLY ─── */}
      <div className="w-full h-screen overflow-hidden relative">
        <div
          onClick={() => isActive && setIsActive(false)}
          className={`w-full h-full absolute left-0 top-0 overflow-hidden origin-left transition-all duration-500 will-change-transform shadow-[0_15px_50px_rgba(0,0,0,0.9)] rounded-[4px] border border-white/[0.03] ${
            isActive
              ? "cursor-pointer pointer-events-auto z-30 [transform:perspective(1300px)_rotateY(20deg)_translateY(10px)_translateZ(310px)_scale(0.5)] hover:[transform:perspective(1300px)_rotateY(20deg)_translateY(10px)_translateZ(340px)_scale(0.5)]"
              : "z-10 pointer-events-auto [transform:perspective(1300px)_rotateY(0deg)_translateY(0px)_translateZ(0px)_scale(1)]"
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Explicit Core Deck Container ensures no background bleeding/transparency glitches */}
          <div className="w-full h-full bg-[#111214] relative overflow-hidden">
            {/* SCREEN 1: HOME PANEL */}
            <div
              className={`absolute inset-0 w-full h-full bg-cover bg-center bg-[#111214] transition-all duration-700 ease-in-out ${
                activeTab === "home"
                  ? "opacity-100 z-10 scale-100"
                  : "opacity-0 z-0 pointer-events-none scale-105"
              }`}
              style={{ backgroundImage: `url(${homeImage})` }}
            >
              <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center px-8 text-center">
                <h2 className="text-[3rem] font-bold uppercase tracking-wide max-w-4xl leading-tight text-white mb-2">
                  {homeTitle}
                </h2>
                <p className="mb-4 w-full md:w-1/2 text-center text-xl md:text-[1.5rem] text-neutral-200 font-light leading-relaxed max-w-[35rem]">
                  {homeDesc}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsActive(true);
                  }}
                  className="mt-4 px-7 py-2.5 text-white uppercase tracking-wider text-sm font-semibold rounded-[25px] border-none shadow-md transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  Read More
                </button>
              </div>
            </div>

            {/* SCREEN 2: ABOUT PANEL */}
            <div
              className={`absolute inset-0 w-full h-full bg-[#0c0d0e] flex transition-all duration-700 ease-in-out ${
                activeTab === "about"
                  ? "opacity-100 z-10 scale-100"
                  : "opacity-0 z-0 pointer-events-none scale-105"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 w-full h-full">
                <div
                  className="hidden md:block md:col-span-5 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${aboutImage})` }}
                />
                <div className="col-span-1 md:col-span-7 flex flex-col justify-center items-start p-8 md:p-20 space-y-4 max-w-2xl">
                  <span
                    className="text-xs font-bold tracking-widest uppercase opacity-60"
                    style={{ color: accentColor }}
                  >
                    01 // Discovery
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    Architecting Realities
                  </h2>
                  <p className="text-neutral-400 text-sm md:text-base font-light leading-relaxed">
                    We push design parameters past typical industry limitations
                    to craft immersive, minimalist experiences built to scale
                    smoothly across corporate application ecosystems.
                  </p>
                </div>
              </div>
            </div>

            {/* SCREEN 3: CONTACT PANEL */}
            <div
              className={`absolute inset-0 w-full h-full bg-[#0a0a0b] flex transition-all duration-700 ease-in-out ${
                activeTab === "contact"
                  ? "opacity-100 z-10 scale-100"
                  : "opacity-0 z-0 pointer-events-none scale-105"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 w-full h-full">
                <div className="col-span-1 md:col-span-7 flex flex-col justify-center items-start p-8 md:p-20 space-y-4 max-w-xl">
                  <span
                    className="text-xs font-bold tracking-widest uppercase opacity-60"
                    style={{ color: accentColor }}
                  >
                    02 // Integration
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    Let's Interface
                  </h2>
                  <p className="text-neutral-400 text-sm font-light leading-relaxed">
                    Have an optimization challenge, structural web development
                    plan, or minimal sleek layout architecture parameters to
                    talk over? Get in touch immediately.
                  </p>
                  <span className="underline cursor-pointer text-sm text-neutral-300 hover:text-white transition-colors">
                    console@codingbeast.io
                  </span>
                </div>
                <div
                  className="hidden md:block md:col-span-5 bg-cover bg-center opacity-60"
                  style={{ backgroundImage: `url(${contactImage})` }}
                />
              </div>
            </div>

            {/* SCREEN 4: SERVICES PANEL */}
            <div
              className={`absolute inset-0 w-full h-full bg-[#0f1012] flex transition-all duration-700 ease-in-out ${
                activeTab === "services"
                  ? "opacity-100 z-10 scale-100"
                  : "opacity-0 z-0 pointer-events-none scale-105"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 w-full h-full">
                <div className="col-span-1 md:col-span-7 flex flex-col justify-center items-start p-8 md:p-20 space-y-4 max-w-2xl">
                  <span
                    className="text-xs font-bold tracking-widest uppercase opacity-60"
                    style={{ color: accentColor }}
                  >
                    03 // Capabilities
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    Technical Deliverables
                  </h2>
                  <div className="space-y-3 w-full pt-1">
                    {[
                      "Next.js Systems Architecture",
                      "UI/UX Interactive Mapping",
                      "Visual Core Development",
                    ].map((title, i) => (
                      <div
                        key={i}
                        className="border-l-2 pl-4 py-0.5 border-white/10 hover:border-white transition-colors"
                      >
                        <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-200">
                          {title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="hidden md:block md:col-span-5 bg-cover bg-center"
                  style={{ backgroundImage: `url(${servicesImage})` }}
                />
              </div>
            </div>

            {/* SCREEN 5: PORTFOLIO PANEL */}
            <div
              className={`absolute inset-0 w-full h-full bg-[#080809] flex transition-all duration-700 ease-in-out ${
                activeTab === "portfolio"
                  ? "opacity-100 z-10 scale-100"
                  : "opacity-0 z-0 pointer-events-none scale-105"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
                <div
                  className="hidden md:block bg-cover bg-center"
                  style={{ backgroundImage: `url(${portfolioImage})` }}
                />
                <div className="flex flex-col justify-center items-start p-8 md:p-20 space-y-4">
                  <span
                    className="text-xs font-bold tracking-widest uppercase opacity-60"
                    style={{ color: accentColor }}
                  >
                    04 // Production Index
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    Selected Showcases
                  </h2>
                  <p className="text-neutral-400 text-sm font-light leading-relaxed max-w-md">
                    A retrospective review of modern optimized modules running
                    natively over serverless edge structures global nodes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── DYNAMIC BACKGROUND DECK SHADOWS ─── */}
        {/* Shadow One */}
        <div
          className={`absolute inset-0 w-full h-screen top-0 left-0 bg-white origin-left transition-all duration-500 will-change-transform rounded-[4px] ${
            isActive
              ? "z-20 opacity-[0.15] [transform:perspective(1300px)_rotateY(20deg)_translateY(10px)_translateZ(215px)_scale(0.5)] peer-hover:[transform:perspective(1300px)_rotateY(20deg)_translateY(10px)_translateZ(230px)_scale(0.5)]"
              : "z-0 opacity-0 [transform:perspective(1300px)_rotateY(0deg)_translateX(0)_scale(1)]"
          }`}
          style={{ transformStyle: "preserve-3d" }}
        />

        {/* Shadow Two */}
        <div
          className={`absolute inset-0 w-full h-screen top-0 left-0 bg-white origin-left transition-all duration-500 will-change-transform rounded-[4px] ${
            isActive
              ? "z-10 opacity-[0.1] [transform:perspective(1300px)_rotateY(20deg)_translateY(10px)_translateZ(120px)_scale(0.5)]"
              : "z-0 opacity-0 [transform:perspective(1300px)_rotateY(0deg)_translateX(0)_scale(1)]"
          }`}
          style={{ transformStyle: "preserve-3d" }}
        />
      </div>

      {/* ─── ACCURATE LATERAL NAVIGATION LINKS PANEL ─── */}
      <div className="absolute w-[30%] right-0 top-0 h-screen z-20 flex items-center justify-start ml-[10px] pointer-events-none">
        <ul className="list-none pointer-events-auto">
          {linksList.map((link) => {
            const isSelected = activeTab === link.id;

            return (
              <li key={link.id} className="block py-1">
                <button
                  onClick={() => {
                    setActiveTab(link.id);
                    setTimeout(() => setIsActive(false), 380);
                  }}
                  className={`block text-left text-[1.8rem] font-medium uppercase tracking-[1px] py-[0.7rem] no-underline transition-colors duration-300 transform-gpu relative ${
                    isActive
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-[10px] pointer-events-none"
                  }`}
                  style={{
                    color: isSelected ? accentColor : "#eee",
                    transition:
                      "opacity 0.5s ease, transform 0.5s ease, color 0.3s ease",
                    transitionDelay: isActive ? link.delay : "0s",
                  }}
                >
                  <span className="hover:text-[#e20f2f] transition-colors duration-300">
                    {link.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
