"use client";

import { useEffect, useRef, useState } from "react";

// ─── CustomCursorGallery ─────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor          string   "bg-[#0a0f14]"      Page background color
// cursorBgColor    string   "bg-white"          Custom mouse follower circle background
// cursorSize       number   20                  Default diameter of custom cursor (px)
// scaleMultiplier  number   6                   Cursor scale factor when hovering cards
// animDuration     number   600                 Cursor trailing follow speed (ms)
// initialOpacity   number   0.5                 Un-hovered card picture opacity
// hoverOpacity     number   0.9                 Hovered card picture opacity
// items            array    [...]               Custom list of images & context icons
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    type: "dog",
    image:
      "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?q=80&w=1886&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    iconClass: "fa-solid fa-dog",
  },
  {
    type: "cat",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1915&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    iconClass: "fa-solid fa-cat",
  },
  {
    type: "fish",
    image:
      "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=1912&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    iconClass: "fa-solid fa-fish-fins",
  },
  {
    type: "horse",
    image:
      "https://images.unsplash.com/photo-1593179449458-e0d43d512551?q=80&w=1882&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    iconClass: "fa-solid fa-horse-head",
  },
  {
    type: "dove",
    image:
      "https://images.unsplash.com/photo-1580980407668-6bb45a674180?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    iconClass: "fa-solid fa-dove",
  },
  {
    type: "otter",
    image:
      "https://images.unsplash.com/photo-1576518985746-7b3924507c48?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    iconClass: "fa-solid fa-otter",
  },
];

export default function SmartMouseGallery({
  bgColor = "bg-[#0a0f14]",
  cursorBgColor = "bg-white",
  cursorSize = 20,
  scaleMultiplier = 6,
  animDuration = 600,
  initialOpacity = "opacity-50",
  hoverOpacity = "hover:opacity-90",
  items = DEFAULT_ITEMS,
}) {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const iconRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Eliminate hydration mismatch issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Load FontAwesome Font Library Dynamically
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      document.head.appendChild(link);
    }

    const cursorElement = cursorRef.current;
    const iconElement = iconRef.current;

    const animateCursor = (e, interacting) => {
      if (!cursorElement) return;
      const x = e.clientX - cursorSize / 2;
      const y = e.clientY - cursorSize / 2;

      const keyframes = {
        transform: `translate(${x}px, ${y}px) scale(${interacting ? scaleMultiplier : 1})`,
      };

      cursorElement.animate(keyframes, {
        duration: animDuration,
        fill: "forwards",
      });
    };

    const getCursorIconClass = (type) => {
      const matchedItem = items.find((item) => item.type === type);
      return matchedItem ? matchedItem.iconClass : "fa-solid fa-arrow-pointer";
    };

    const handleMouseMove = (e) => {
      if (!cursorElement || !iconElement) return;

      const interactable = e.target.closest("[data-interactable]");
      const interacting = interactable !== null;

      animateCursor(e, interacting);

      if (interacting) {
        cursorElement.setAttribute("data-active", "true");
        const currentType = interactable.getAttribute("data-type");
        iconElement.className = `${getCursorIconClass(currentType)} text-[6px] leading-[4px] text-black opacity-100 transition-opacity duration-500 ease-out`;
      } else {
        cursorElement.removeAttribute("data-active");
        iconElement.className =
          "fa-solid fa-arrow-pointer text-[6px] leading-[4px] text-black opacity-0 transition-opacity duration-500 ease-out";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMounted, cursorSize, scaleMultiplier, animDuration, items]);

  if (!isMounted) {
    return <div className={`w-full min-h-screen ${bgColor}`} />;
  }

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-screen px-4 flex items-center justify-center gap-[clamp(10px,2vw,100px)] overflow-hidden relative group/window ${bgColor}`}
    >
      {/* Dynamic Cursor Target Layer */}
      <div
        ref={cursorRef}
        className={`fixed left-0 top-0 z-[100] grid place-items-center pointer-events-none opacity-0 group-hover/window:opacity-100 transition-opacity duration-500 ease-out rounded-full ${cursorBgColor}`}
        style={{
          width: `${cursorSize}px`,
          height: `${cursorSize}px`,
        }}
      >
        <i
          ref={iconRef}
          className="fa-solid fa-arrow-pointer text-[6px] leading-[4px] text-black opacity-0"
        />
      </div>

      {/* Interactable Track Node Set */}
      {items.map((item, index) => (
        <div
          key={index}
          data-interactable
          data-type={item.type}
          className={`aspect-[1/1.25] w-[clamp(150px,30vmin,500px)] bg-center bg-[length:110%] hover:bg-[length:120%] cursor-none transition-all duration-[600ms] ease-out rounded-sm ${initialOpacity} ${hoverOpacity}`}
          style={{
            backgroundImage: `url(${item.image})`,
          }}
        />
      ))}
    </div>
  );
}
