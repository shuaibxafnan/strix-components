"use client";

import { useEffect, useRef, useState } from "react";


const DEFAULT_ITEMS = [
  {
    type: "link",
    backgroundImage:
      "url(https://images.unsplash.com/photo-1657739774592-14c8f97eaece?auto=format&fit=crop&w=500&q=60)",
  },
  {
    type: "video",
    backgroundImage:
      "url(https://images.unsplash.com/photo-1657779582398-a13b5896ff19?auto=format&fit=crop&w=500&q=60)",
  },
];

const getIconClass = (type) => {
  switch (type) {
    case "video":
      return "fa-solid fa-play";
    default:
      return "fa-solid fa-cancel";
  }
};

export default function MagneticCursor({
  items = DEFAULT_ITEMS,
  cursorSize = 20,
  cursorScaleOnHover = 8,
  cursorAnimDuration = 800,
  cursorColor = "white",
  bgColor = "rgb(20, 20, 20)",
  iconDefaultClass = "fa-solid fa-arrow-up-right",
  className = "",
}) {
  const trailerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [iconClass, setIconClass] = useState(iconDefaultClass);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    const trailer = trailerRef.current;
    if (!trailer) return;

    const handleMouseMove = (e) => {
      const interactable = e.target.closest("[data-interactable]");
      const isInteracting = interactable !== null;

      const x = e.clientX - trailer.offsetWidth / 2;
      const y = e.clientY - trailer.offsetHeight / 2;

      trailer.animate(
        {
          transform: `translate(${x}px, ${y}px) scale(${isInteracting ? cursorScaleOnHover : 1})`,
        },
        { duration: cursorAnimDuration, fill: "forwards" },
      );

      setInteracting(isInteracting);
      setVisible(true);

      if (isInteracting) {
        setIconClass(getIconClass(interactable.dataset.type));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorScaleOnHover, cursorAnimDuration]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        .mc-cursor {
          height: ${cursorSize}px;
          width: ${cursorSize}px;
          background-color: ${cursorColor};
          border-radius: ${cursorSize}px;
        }
        .mc-page {
          background-color: ${bgColor};
        }
      `}</style>
      <div
        className={`mc-page w-full h-screen flex items-center justify-center gap-[clamp(10px,4vw,100px)] ${className}`}
        onMouseEnter={() => setVisible(true)}
      >
        <div
          ref={trailerRef}
          className={`mc-cursor fixed left-0 top-0 z-[10000] pointer-events-none grid place-items-center transition-opacity duration-500 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <i
            className={`${iconClass} text-[6px] leading-[4px] transition-opacity duration-[400ms] ${
              interacting ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        {items.map((item, i) => (
          <div
            key={i}
            data-interactable
            data-type={item.type}
            className="aspect-[1/1.5] opacity-40 bg-center transition-[background-size,opacity] duration-[400ms] ease-[ease] hover:opacity-80 hover:bg-[length:105%]"
            style={{
              width: "clamp(120px, 40vmin, 600px)",
              backgroundImage: item.backgroundImage,
              backgroundSize: "100%",
            }}
          />
        ))}
      </div>
    </>
  );
}
