"use client";

import { useEffect, useState, useRef } from "react";

// ─── MagicWandReveal ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor               string    #11151c     Container background color
// tileBgColor           string    #212d40     Tile background fallback color
// iconColor             string    #364156     Default placeholder icon color
// wandWidth             string    10vmin      Width dimension of the magic wand
// tileWidth             string    40vmin      Sizing metric for squared cards
// wandAnimationDuration number    500         Smooth animation timing in ms
// images                string[]  [...]       List of Unsplash source image URLs
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1580014317999-e9f1936787a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDc2OTI0MjZ8&ixlib=rb-4.0.3&q=85",
  "https://images.unsplash.com/photo-1522878129833-838a904a0e9e?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDc2OTI1ODd8&ixlib=rb-4.0.3&q=85",
  "https://images.unsplash.com/photo-1690571128844-dbd116258e3a?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDc2OTI2Njl8&ixlib=rb-4.0.3&q=85",
  "https://images.unsplash.com/photo-1507608443039-bfde4fbcd142?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDc2OTE5Nzl8&ixlib=rb-4.0.3&q=85",
];

export default function MagicWandReveal({
  bgColor = "#11151c",
  tileBgColor = "#212d40",
  iconColor = "#364156",
  wandWidth = "10vmin",
  tileWidth = "40vmin",
  wandAnimationDuration = 500,
  images = DEFAULT_IMAGES,
}) {
  const wandRef = useRef(null);
  const tilesRef = useRef([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // FontAwesome styles dynamically loaded to ensure proper rendering without layouts breaks
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      document.head.appendChild(link);
    }

    const xy = (x, y) => ({ x, y });
    const px = (value) => `${value}px`;
    const deg = (value) => `${value}deg`;
    const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

    const updateMouse = (mouseX, mouseY) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const mouse = {
        position: xy(mouseX, mouseY),
        decimal: xy(mouseX / windowWidth, mouseY / windowHeight),
        multiplier: xy(1.3, 0.4),
        offset: xy(windowWidth * -0.15, windowHeight * 0.1),
        modifiedPosition: xy(0, 0),
      };

      mouse.modifiedPosition.x =
        mouse.position.x * mouse.multiplier.x + mouse.offset.x;
      mouse.modifiedPosition.y =
        mouse.position.y * mouse.multiplier.y + mouse.offset.y;
      return mouse;
    };

    const revealImages = (mouseX) => {
      tilesRef.current.forEach((tile) => {
        if (!tile) return;
        const dims = tile.getBoundingClientRect();
        const relMouseX = mouseX - dims.left;
        const mouseXAsDecimal = clamp(relMouseX / dims.width, 0, 1);

        const opacity = mouseXAsDecimal;
        const blur = 1 - mouseXAsDecimal;

        tile.style.setProperty("--opacity", opacity);
        tile.style.setProperty("--blur", blur);
      });
    };

    const getWandStyles = (mouse) => ({
      left: px(mouse.modifiedPosition.x),
      top: px(mouse.modifiedPosition.y),
      rotate: deg(mouse.decimal.x * 20 - 10),
    });

    const handleMouseMove = (e) => {
      const mouse = updateMouse(e.clientX, e.clientY);
      const wandStyles = getWandStyles(mouse);

      if (wandRef.current) {
        wandRef.current.animate(wandStyles, {
          duration: wandAnimationDuration,
          fill: "forwards",
        });
      }
      revealImages(mouse.modifiedPosition.x);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mounted, wandAnimationDuration]);

  if (!mounted) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: bgColor }} />
    );
  }

  return (
    <div
      className="w-full h-screen overflow-hidden grid place-items-center relative select-none"
      style={{ backgroundColor: bgColor }}
    >
      {/* Magic Wand */}
      <div
        ref={wandRef}
        className="absolute left-[5%] top-[20%] -translate-x-1/2 -rotate-[3deg] z-[100] rounded-[3vmin] shadow-[0vmin_1vmin_4vmin_rgba(0,0,0,0.8)] overflow-hidden aspect-[1/10]"
        style={{
          width: wandWidth,
          background:
            "linear-gradient(to right, rgb(26 24 28) 10%, rgb(42 40 44) 45% 55%, rgb(26 24 28) 90%)",
        }}
      >
        <div
          className="h-1/5 w-full"
          style={{
            background:
              "linear-gradient(to right, rgb(212 221 236) 10%, rgb(255 255 255) 45% 55%, rgb(212 221 236) 90%)",
          }}
        />
      </div>

      {/* Tiles Container */}
      <div className="flex">
        {images.map((src, index) => {
          const rotations = [
            "-rotate-[4deg]",
            "rotate-[4deg]",
            "-rotate-[4deg]",
            "rotate-[4deg]",
          ];
          const zIndexes = ["z-[4]", "z-[3]", "z-[2]", "z-[1]"];
          const rotClass = rotations[index % rotations.length];
          const zClass = zIndexes[index % zIndexes.length];
          const marginClass = index > 0 ? "-ml-[12vmin]" : "";

          return (
            <div
              key={index}
              ref={(el) => (tilesRef.current[index] = el)}
              className={`grid place-items-center relative overflow-hidden aspect-square rounded-[6vmin] shadow-[0vmin_3vmin_6vmin_rgba(0,0,0,0.25),inset_0vmin_0.5vmin_1vmin_rgba(255,255,255,0.15)] ${rotClass} ${zClass} ${marginClass}`}
              style={{
                width: tileWidth,
                backgroundColor: tileBgColor,
              }}
            >
              <i
                className="fa-solid fa-image text-[14vmin]"
                style={{ color: iconColor }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Revealable scene ${index + 1}`}
                className="h-full aspect-square absolute left-0 top-0 object-cover pointer-events-none"
                style={{
                  opacity: "var(--opacity, 0)",
                  filter: "blur(calc(var(--blur, 1) * 10px))",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
