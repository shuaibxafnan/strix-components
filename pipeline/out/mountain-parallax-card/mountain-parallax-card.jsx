"use client";

import { useEffect, useRef } from "react";

export default function MountainParallaxCard({
  cardWidth = "350px",
  cardAspectRatio = "aspect-[9/12]",
  bgImage = "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1080&q=80",
  borderGlowColor = "rgba(255,214,102,0.4)",
  elevationText = "4,478 m",
  locationName = "Matterhorn",
  destinationText = "Zermatt, Switzerland",
  btnText = "Take the tour",
  maxTilt = 10,
  tiltSpeed = 500,
  perspective = 1800,
  className = "",
}) {
  const tiltCardRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("mountain-card-fonts")) {
      const link = document.createElement("link");
      link.id = "mountain-card-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap";
      document.head.appendChild(link);
    }

    let cancelled = false;
    const node = tiltCardRef.current;

    import("vanilla-tilt").then((mod) => {
      if (cancelled || !node) return;
      const VanillaTilt = mod.default || mod.VanillaTilt;
      VanillaTilt.init(node, {
        max: maxTilt,
        speed: tiltSpeed,
        perspective: perspective,
        glare: true,
        "max-glare": 0.1,
        scale: 1.03,
        reset: true,
      });
    });

    return () => {
      cancelled = true;
      if (node && node.vanillaTilt) {
        node.vanillaTilt.destroy();
      }
    };
  }, [maxTilt, tiltSpeed, perspective]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center p-6 overflow-hidden select-none font-['Inter',sans-serif] ${className}`}
    >
      <div
        ref={tiltCardRef}
        style={{
          maxWidth: cardWidth,
          backgroundImage: `url('${bgImage}')`,
          boxShadow: `0 0 0 2px ${borderGlowColor}, 0 0 25px 8px rgba(255,214,102,0.15)`,
        }}
        className={`w-full ${cardAspectRatio} max-h-[90vh] rounded-[1.75rem] overflow-hidden bg-cover bg-center [transform-style:preserve-3d] will-change-transform cursor-grab transition-shadow duration-300 ease-out hover:shadow-[0_0_0_3px_rgba(255,214,102,0.6),0_0_35px_12px_rgba(255,214,102,0.25)] relative group`}
      >
          <div
          style={{ transform: "translateZ(30px)" }}
          className="absolute inset-[14px] rounded-[1.375rem] pointer-events-none z-10 box-border border border-[rgba(255,214,102,0.1)] shadow-[inset_0.5px_0.5px_1.5px_rgba(255,235,180,0.6),inset_-1px_-1px_1px_rgba(160,110,0,0.5),inset_3px_3px_6px_rgba(0,0,0,0.25)] will-change-transform"
        />

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

          <div
          style={{ transform: "translateZ(60px)" }}
          className="absolute inset-[14px] rounded-[1.375rem] overflow-hidden flex flex-col justify-end p-4 sm:p-5 lg:p-7 z-5 will-change-transform"
        >
              <div
            style={{ transform: "translateZ(5px)" }}
            className="absolute bottom-0 left-0 right-0 h-[75%] bg-gradient-to-t from-black/90 via-black/65 to-transparent pointer-events-none z-15 will-change-transform"
          />

              <div
            style={{ transform: "translateZ(25px)" }}
            className="relative z-20 color-[#f8fafc] text-center [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] flex flex-col items-center gap-2 will-change-transform mb-2"
          >
            <h1 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl font-bold tracking-wide flex items-center justify-center gap-2">
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
