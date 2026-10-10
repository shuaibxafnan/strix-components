"use client";

import { useEffect, useRef, useState } from "react";

// ─── ClimbingCardSwiper ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor            string   "#090d16"          Deep premium cosmic dark background
// cardWidth          string   "420px"            Desktop slide element width
// cardHeight         string   "540px"            Desktop slide element height
// accentColor        string   "#3b82f6"          Signature modern focus glow tint (e.g. blue-500)
// rotateAngle        number   40                 Sleek coverflow perspective rotation angle
// slideDepth         number   140                Elegant Z-axis depth displacement
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES = [
  {
    img: "https://cdn.josetxu.com/img/gp-tonin-rocodromo.jpg",
    climber: "Carlos Rubio",
    photo: "Josetxu López",
    route: "Toñin (7b)",
    sector: "El Rocodromo",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-normal-caliz.jpg",
    climber: "Josetxu López",
    photo: "Uge Garcia",
    route: "Normal (Ae)",
    sector: "El Caliz",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-cumbre-totem.jpg",
    climber: "Antonio, Aitor, Uge & Josefer",
    photo: "Josetxu López",
    route: "Sur Clasica (6a)",
    sector: "El Totem",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-oscar-raul-hueco-hoces2.jpg",
    climber: "Aitor Saz",
    photo: "Tximo",
    route: "Oscar & Raul (6a)",
    sector: "Hueco de las Hoces",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-gallego-cueva-mora.jpg",
    climber: "Jarutxi Mora",
    photo: "Fernando Bulnes",
    route: "Gallego (V+)",
    sector: "Cueva de la Mora",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-chimenea-tortuga.jpg",
    climber: "Nacho Ruiz",
    photo: "Josetxu López",
    route: "Chimenea (6a)",
    sector: "La Tortuga",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-blues-ojos-bonitos-tres-coronas.jpg",
    climber: "Marino",
    photo: "Josetxu López",
    route: "Blues de los ojos bonitos (6a+)",
    sector: "Tres Coronas",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-capuchon-sarcofago.jpg",
    climber: "Josetxu & Uge",
    photo: "Antonio Montes",
    route: "El Capuchon (6a/A1)",
    sector: "El Sarcofago",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-rosario-cueva-mora.jpg",
    climber: "Eloy Atajos",
    photo: "Josetxu López",
    route: "Rosario (Vº)",
    sector: "Cueva de la Mora",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-me-pesa-hasta-el-aire-dehesilla.jpg",
    climber: "Indio",
    photo: "Jarutxi Mora",
    route: "Me pesa hasta el aire (A2/A3?)",
    sector: "Risco de la Dehesilla",
    zone: "La Pedriza",
  },
  {
    img: "https://cdn.josetxu.com/img/gp-anonima-tres-coronas.jpg",
    climber: "Krispin Talavera",
    photo: "Josetxu López",
    route: "Anónima (6c)",
    sector: "Tres Coronas",
    zone: "La Pedriza",
  },
];

export default function ClimbingCardSwiper({
  bgColor = "#090d16",
  cardWidth = "420px",
  cardHeight = "540px",
  accentColor = "#3b82f6",
  rotateAngle = 40,
  slideDepth = 140,
  slides = DEFAULT_SLIDES,
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const loadCSS = (href) => {
      if (document.querySelector(`link[href="${href}"]`))
        return Promise.resolve();
      return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    };

    const loadScript = (src) => {
      if (document.querySelector(`script[data-id="${src}"]`))
        return Promise.resolve();
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.setAttribute("data-id", src);
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadCSS("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"),
      loadScript("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"),
    ])
      .then(() => {
        const { Swiper } = window;
        if (!Swiper || !containerRef.current) return;

        new Swiper(containerRef.current, {
          effect: "coverflow",
          loop: true,
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: "1",
          coverflowEffect: {
            rotate: rotateAngle,
            stretch: -20,
            depth: slideDepth,
            modifier: 1,
            slideShadows: true,
          },
          // Pagination config object omitted entirely to cleanly remove the bottom tabs indicator
          breakpoints: {
            320: { slidesPerView: 1.4 },
            580: { slidesPerView: 1.8 },
            767: { slidesPerView: 2.4 },
            992: { slidesPerView: 2.8 },
            1200: { slidesPerView: 3.4 },
            1400: { slidesPerView: 3.8 },
          },
        });
      })
      .catch((err) =>
        console.error("[Modern3DGallery] Swiper initialization crash:", err),
      );
  }, [rotateAngle, slideDepth]);

  if (!mounted) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center overflow-hidden py-16 select-none relative font-sans"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Tech Decorative Ambient Lighting */}
      <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-500/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] rounded-full bg-indigo-500/[0.02] blur-[150px] pointer-events-none" />

      {/* Main Core Carousel Component Viewport */}
      <div
        ref={containerRef}
        className="swiper w-full pt-8 pb-12 overflow-visible"
      >
        <div className="swiper-wrapper">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="swiper-slide relative rounded-[28px] overflow-hidden border border-white/[0.06] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out group p-[2px]"
              style={{
                width: cardWidth,
                height: cardHeight,
              }}
            >
              {/* Inner Isolated Canvas to hold clean styling frame layouts */}
              <div className="w-full h-full relative rounded-[26px] overflow-hidden bg-slate-950">
                {/* Background Image Frame Layer */}
                <div
                  className="absolute inset-0 bg-center bg-cover scale-100 transition-transform duration-[900ms] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
                  style={{ backgroundImage: `url(${slide.img})` }}
                />

                {/* Modern Lens Flare / Linear Highlight Reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.04] to-white/0 opacity-100 transition-opacity pointer-events-none z-10" />

                {/* Dark Vignette Bottom Gradient Shading Shield */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-95" />

                {/* Fully Remastered Glassmorphic Info Control Board */}
                <div className="absolute left-4 right-4 bottom-[-80px] opacity-0 scale-95 group-[.swiper-slide-active]:bottom-4 group-[.swiper-slide-active]:opacity-100 group-[.swiper-slide-active]:scale-100 p-5 rounded-[22px] border border-white/[0.08] bg-slate-900/40 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1) z-20 flex flex-col gap-3.5">
                  {/* Title Header: Route name and Badge Grade details */}
                  <div className="text-left border-b border-white/[0.06] pb-2.5">
                    <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase block mb-0.5">
                      Route Path
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                      {slide.route}
                    </h3>
                  </div>

                  {/* Metadata Compact Minimal Grid Gridlines Layout */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {/* Item Row 1: Climber Identity */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-0.5">
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                        Climber
                      </div>
                      <p className="text-xs font-semibold text-white truncate max-w-full">
                        {slide.climber}
                      </p>
                    </div>

                    {/* Item Row 2: Photo Creator Credits */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-0.5">
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                        Photo
                      </div>
                      <p className="text-xs font-semibold text-white truncate max-w-full">
                        {slide.photo}
                      </p>
                    </div>

                    {/* Item Row 3: Crag Sector Arena */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-0.5">
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                        Sector
                      </div>
                      <p className="text-xs font-semibold text-white truncate max-w-full">
                        {slide.sector}
                      </p>
                    </div>

                    {/* Item Row 4: Territorial Zone Area */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-0.5">
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                        Zone
                      </div>
                      <p className="text-xs font-semibold text-white truncate max-w-full">
                        {slide.zone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global CSS Style Variable Overrides Injection to clean structural frames */}
      <style jsx global>{`
        .swiper-slide-shadow-left,
        .swiper-slide-shadow-right {
          border-radius: 28px !important;
          background-image: linear-gradient(
            to left,
            rgba(0, 0, 0, 0.6),
            rgba(0, 0, 0, 0)
          ) !important;
        }
        .swiper-slide-shadow-right {
          background-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.6),
            rgba(0, 0, 0, 0)
          ) !important;
        }
      `}</style>
    </div>
  );
}
