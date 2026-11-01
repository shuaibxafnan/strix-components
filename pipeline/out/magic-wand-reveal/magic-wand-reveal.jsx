"use client";

import { useEffect, useState, useRef } from "react";

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
  imageAlt = "Revealable scene",
  className = "",
}) {
  const wandRef = useRef(null);
  const tilesRef = useRef([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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

    const handleTouchMove = (e) => {
      const t = e.touches[0];
      if (t) handleMouseMove({ clientX: t.clientX, clientY: t.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [mounted, wandAnimationDuration]);

  if (!mounted) {
    return (
      <div
        className={`w-full h-screen ${className}`}
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  return (
    <div
      className={`w-full h-screen overflow-hidden grid place-items-center relative select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-[14vmin] h-[14vmin]"
                fill={iconColor}
                aria-hidden="true"
              >
                <path d="M448 80c8.8 0 16 7.2 16 16v319.8l-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7c-4.5-6.3-11.8-10-19.5-10s-15 3.7-19.5 10l-80 112-4.5 6.3V96c0-8.8 7.2-16 16-16h384zM64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" />
              </svg>
                      <img
                src={src}
                alt={`${imageAlt} ${index + 1}`}
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
