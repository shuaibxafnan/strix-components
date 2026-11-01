"use client";

import { useRef, useCallback } from "react";


const DEFAULT_TILES = [
  {
    bg: "rgb(255, 238, 88)",
    alt: "",
    img: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=800&q=70",
    height: "14%",
    width: "20%",
    left: "5%",
    top: "5%",
  },
  {
    bg: "rgb(66, 165, 245)",
    alt: "",
    img: "https://images.unsplash.com/photo-1515266591878-f93e32bc5937?auto=format&fit=crop&w=800&q=70",
    height: "24%",
    width: "14%",
    left: "42%",
    top: "12%",
  },
  {
    bg: "rgb(239, 83, 80)",
    alt: "",
    img: "https://images.unsplash.com/photo-1587590227264-0ac64ce63ce8?auto=format&fit=crop&w=800&q=70",
    height: "18%",
    width: "16%",
    left: "12%",
    top: "34%",
  },
  {
    bg: "rgb(102, 187, 106)",
    alt: "",
    img: "https://images.unsplash.com/photo-1520121401995-928cd50d4e27?auto=format&fit=crop&w=800&q=70",
    height: "14%",
    width: "12%",
    left: "45%",
    top: "48%",
  },
  {
    bg: "rgb(171, 71, 188)",
    alt: "",
    img: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=70",
    height: "16%",
    width: "32%",
    left: "8%",
    top: "70%",
  },
  {
    bg: "rgb(255, 167, 38)",
    alt: "",
    img: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=800&q=70",
    height: "24%",
    width: "24%",
    left: "68%",
    top: "8%",
  },
  {
    bg: "rgb(63, 81, 181)",
    alt: "",
    img: "https://images.unsplash.com/photo-1520338258525-606b90f95b04?auto=format&fit=crop&w=800&q=70",
    height: "16%",
    width: "20%",
    left: "50%",
    top: "74%",
  },
  {
    bg: "rgb(141, 110, 99)",
    alt: "",
    img: "https://images.unsplash.com/photo-1521127474489-d524412fd439?auto=format&fit=crop&w=800&q=70",
    height: "24%",
    width: "18%",
    left: "72%",
    top: "42%",
  },
  {
    bg: "rgb(250, 250, 250)",
    alt: "",
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=70",
    height: "10%",
    width: "8%",
    left: "84%",
    top: "84%",
  },
];

export default function PanGallery({
  tiles = DEFAULT_TILES,
  gallerySize = 140,
  backgroundColor = "#0a0a0a",
  panDuration = 4000,
  className = "",
}) {
  const galleryRef = useRef(null);

  const handleMove = useCallback(
    (point) => {
      const gallery = galleryRef.current;
      if (!gallery) return;

      const xDecimal = point.clientX / window.innerWidth;
      const yDecimal = point.clientY / window.innerHeight;

      const maxX = gallery.offsetWidth - window.innerWidth;
      const maxY = gallery.offsetHeight - window.innerHeight;

      const panX = maxX * xDecimal * -1;
      const panY = maxY * yDecimal * -1;

      gallery.animate(
        { transform: `translate(${panX}px, ${panY}px)` },
        { duration: panDuration, fill: "forwards", easing: "ease" },
      );
    },
    [panDuration],
  );

  const handleMouseMove = (e) => handleMove(e);
  const handleTouchMove = (e) => {
    if (e.touches[0]) handleMove(e.touches[0]);
  };

  const gallerySizeStyle = `${gallerySize}vmax`;

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${className}`}
      style={{ backgroundColor }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <div
        ref={galleryRef}
        className="absolute"
        style={{ width: gallerySizeStyle, height: gallerySizeStyle }}
      >
        {tiles.map((tile, i) => (
          <div
            key={i}
            className="absolute rounded-[1vmax] transition-transform duration-[800ms] ease-[ease] group hover:scale-110"
            style={{
              backgroundColor: tile.bg,
              height: tile.height,
              width: tile.width,
              left: tile.left,
              top: tile.top,
            }}
          >
            <img
              src={tile.img}
              alt={tile.alt || ""}
              className="h-full w-full object-cover rounded-[inherit] opacity-0 [@media(hover:none)]:opacity-100 transition-[opacity,transform] duration-[800ms] ease-[ease] group-hover:opacity-100 group-hover:scale-[1.01]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
