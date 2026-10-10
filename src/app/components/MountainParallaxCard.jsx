"use client";

import { useEffect, useRef, useState } from "react";

// ─── MountainParallaxCard ────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bodyBgGradient    string    from-[#0f172a] to-[#1e293b]  Main container viewport backdrop
// cardWidth         string    380px                        Horizontal base boundary size
// cardAspectRatio   string    aspect-[9/15.5]              Original card presentation geometry
// bgImage           string    ...                          Card background photo path
// borderGlowColor   string    rgba(255,214,102,0.4)        Outer frame border rim color
// elevationText     string    4,478 m                      Text displayed inside the altitude badge
// locationName      string    Matterhorn                   Primary card title text
// destinationText   string    Zermatt, Switzerland         Subtext details string
// btnText           string    Take the tour                Interactive action button string
// maxTilt           number    10                           Maximum tilt rotation degrees
// tiltSpeed         number    500                          Speed of the entering/exiting transitions (ms)
// perspective       number    1800                         3D depth parallax intensity setting
// ──────────────────────────────────────────────────────────────────────────

export default function MountainParallaxCard({
  bodyBgGradient = "from-[#0f172a] to-[#1e293b]",
  cardWidth = "350px",
  cardAspectRatio = "aspect-[9/12]",
  bgImage = "https://static.wixstatic.com/media/3d9313_45b151504946477791c3add537ac398a~mv2.png",
  borderGlowColor = "rgba(255,214,102,0.4)",
  elevationText = "4,478 m",
  locationName = "Matterhorn",
  destinationText = "Zermatt, Switzerland",
  btnText = "Take the tour",
  maxTilt = 10,
  tiltSpeed = 500,
  perspective = 1800,
}) {
  const [mounted, setMounted] = useState(false);
  const tiltCardRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // Dynamic style injector to resolve standard google fonts accurately without layout flashes
    if (!document.getElementById("mountain-card-fonts")) {
      const link = document.createElement("link");
      link.id = "mountain-card-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap";
      document.head.appendChild(link);
    }

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () =>
          reject(new Error(`Failed to initialize script node: ${src}`));
        document.head.appendChild(el);
      });

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js",
    )
      .then(() => {
        const { VanillaTilt } = window;
        if (VanillaTilt && tiltCardRef.current) {
          VanillaTilt.init(tiltCardRef.current, {
            max: maxTilt,
            speed: tiltSpeed,
            perspective: perspective,
            glare: true,
            "max-glare": 0.1,
            scale: 1.03,
            reset: true,
          });
        }
      })
      .catch((err) =>
        console.error("[MountainCard] Tilt framework crash:", err.message),
      );

    return () => {
      if (tiltCardRef.current && tiltCardRef.current.vanillaTilt) {
        tiltCardRef.current.vanillaTilt.destroy();
      }
    };
  }, [maxTilt, tiltSpeed, perspective]);

  // Safe SSR compilation breakout layout to prevent hydration comparison errors
  if (!mounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0f172a]">
        <div
          style={{ maxWidth: cardWidth }}
          className={`w-full ${cardAspectRatio} max-h-[90vh] rounded-[1.75rem] bg-slate-800 animate-pulse`}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center p-6 overflow-hidden select-none bg-gradient-to-br ${bodyBgGradient} text-slate-100 font-['Inter',sans-serif]`}
    >
      {/* ─── PARALLAX CARD WRAPPER CONTAINER ─── */}
      <div
        ref={tiltCardRef}
        style={{
          maxWidth: cardWidth,
          backgroundImage: `url('${bgImage}')`,
          boxShadow: `0 0 0 2px ${borderGlowColor}, 0 0 25px 8px rgba(255,214,102,0.15)`,
        }}
        className={`w-full ${cardAspectRatio} max-h-[90vh] rounded-[1.75rem] overflow-hidden bg-cover bg-center [transform-style:preserve-3d] will-change-transform cursor-grab transition-shadow duration-300 ease-out hover:shadow-[0_0_0_3px_rgba(255,214,102,0.6),0_0_35px_12px_rgba(255,214,102,0.25)] relative group`}
      >
        {/* Inner Border Structural Rim Overlay */}
        <div
          style={{ transform: "translateZ(30px)" }}
          className="absolute inset-[14px] rounded-[1.375rem] pointer-events-none z-10 box-border border border-[rgba(255,214,102,0.1)] shadow-[inset_0.5px_0.5px_1.5px_rgba(255,235,180,0.6),inset_-1px_-1px_1px_rgba(160,110,0,0.5),inset_3px_3px_6px_rgba(0,0,0,0.25)] will-change-transform"
        />

        {/* ─── ELEVATION METRIC BADGE ─── */}
        <div
          style={{ transform: "translateZ(70px)" }}
          className="absolute top-8 right-8 bg-yellow-400/85 rounded-full px-4 py-2 text-[#422006] text-xs font-semibold tracking-wide flex items-center gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/30 z-[25] will-change-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M12 2L6.5 12h11L12 2zm5.5 11l-5.5 9-5.5-9h11z" />
          </svg>
          {elevationText}
        </div>

        {/* ─── MAIN INTERACTIVE CONTENT BOUNDS ─── */}
        <div
          style={{ transform: "translateZ(60px)" }}
          className="absolute inset-[14px] rounded-[1.375rem] overflow-hidden flex flex-col justify-end p-4 sm:p-5 lg:p-7 z-5 will-change-transform"
        >
          {/* Deep Cinematic Atmosphere Darkening Mask */}
          <div
            style={{ transform: "translateZ(5px)" }}
            className="absolute bottom-0 left-0 right-0 h-[75%] bg-gradient-to-t from-black/90 via-black/65 to-transparent pointer-events-none z-15 will-change-transform"
          />

          {/* Core Descriptive Text Element */}
          <div
            style={{ transform: "translateZ(25px)" }}
            className="relative z-20 color-[#f8fafc] text-center [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] flex flex-col items-center gap-2 will-change-transform mb-2"
          >
            <h1 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl font-bold tracking-wide flex items-center justify-center gap-2">
              {/* Custom Vector Mountain Graphic Asset */}
              <svg
                className="w-[1em] h-[1em] fill-current opacity-80 inline-block align-middle"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M14.344 6.219l-2.344-3.219-2.344 3.219-4.656 7.781h14l-4.656-7.781zm-7.344 9.781l-1 2h10l1.625-2.708-1.501-.292-1.124 1h-4l-1.125-1-1.875.001zm11.69-1l-.69.999 1.311 1.311 1.689.69-1.311-1.311-.689-.69z" />
              </svg>
              {locationName}
            </h1>
            <p className="text-base lg:text-md font-light text-slate-300">
              {destinationText}
            </p>
          </div>

          {/* 3D Elevated Tour Execution CTA Button */}
          <button
            style={{ transform: "translateZ(40px)" }}
            className="relative z-20 bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-300 active:from-yellow-500 active:to-yellow-600 text-[#422006] hover:text-[#3f2810] font-semibold py-3 px-7 rounded-full text-center w-auto min-w-[190px] max-w-[85%] mx-auto shadow-[inset_2px_2px_4px_rgba(160,110,0,0.6),inset_-2px_-2px_4px_rgba(255,245,200,0.5),0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[inset_2px_2px_5px_rgba(160,110,0,0.5),inset_-2px_-2px_5px_rgba(255,245,200,0.6),0_2px_4px_rgba(0,0,0,0.15)] transition-all duration-300 border-none flex items-center justify-center gap-3 tracking-wide mt-4 will-change-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {btnText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5l7 7-7 7" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
