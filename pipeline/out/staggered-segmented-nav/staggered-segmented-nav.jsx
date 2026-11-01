"use client";

import { useEffect, useRef, useState } from "react";

export default function StaggeredSegmentedNav({
  triggerColor = "#252525",
  triggerOpenColor = "#fff",
  triggerTransitionEase = "cubic-bezier(.17, .67, 0, 1)",
  navBgColor = "#FF3C3C",
  navSlideOutDuration = 0.9,
  navSlideInDuration = 0,
  menuItems = [
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  menuItemFontSize = "calc(100vw / 24 * 2)",
  menuItemFontWeight = 700,
  menuItemHoverFontWeight = 900,
  menuItemMarginTop = "0.35em",
  menuItemColor = "#fff",
  panelAnimationDuration = 0.4,
  panelAnimationEase = "power1.out",
  panelAnimationStagger = 0.1,
  fontFamily = "Anybody",
  className = "",
}) {
  const navRef = useRef(null);
  const gsapRef = useRef(null);
  const timelineRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("gsap").then((mod) => {
      if (!cancelled) gsapRef.current = mod.gsap || mod.default;
    });
    return () => {
      cancelled = true;
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, []);

  const handleToggle = () => {
    const gsap = gsapRef.current;
    if (!gsap || !navRef.current) return;

    const newOpenState = !isOpen;
    const amount = newOpenState ? 100 : 0;

    if (timelineRef.current) timelineRef.current.kill();
    const tl = gsap.timeline({});
    [1, 2, 3, 4].forEach((n, i) => {
      tl.to(
        navRef.current,
        {
          [`--panel-bottom-${n}`]: `${amount}%`,
          duration: panelAnimationDuration,
          ease: panelAnimationEase,
        },
        panelAnimationStagger * i,
      );
    });
    timelineRef.current = tl;

    setIsOpen(newOpenState);
  };

  return (
    <div
      className={className}
      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anybody:wght@400;700;900&display=swap');
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-[10] flex items-center justify-between px-6 py-6 md:px-[calc(100vw/24*1)] w-full pointer-events-none">
        <button
          onClick={handleToggle}
          className="relative w-6 h-6 bg-transparent border-0 p-0 cursor-pointer transition-colors duration-400 hover:opacity-80 pointer-events-auto"
          style={{
            color: isOpen ? triggerOpenColor : triggerColor,
          }}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span
            className="absolute block w-6 h-[2px] bg-current rounded-[1px] origin-center transition-all duration-1000"
            style={{
              top: "0px",
              transform: isOpen
                ? "translateY(14px) rotate(45deg) scale(0.85)"
                : "translateY(10px)",
              transitionTimingFunction: triggerTransitionEase,
            }}
          />
          <span
            className="absolute block w-6 h-[2px] bg-current rounded-[1px] origin-center transition-all duration-1000"
            style={{
              top: "0px",
              transform: isOpen
                ? "translateY(14px) rotate(-45deg) scale(0.85)"
                : "translateY(17px)",
              transitionTimingFunction: triggerTransitionEase,
            }}
          />
        </button>
      </header>

      <nav
        ref={navRef}
        className={`fixed inset-0 w-full h-full p-[calc(100vw/24*2)] md:p-[8rem_1.5rem] z-[9] overflow-y-auto ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          "--panel-bottom-1": "0%",
          "--panel-bottom-2": "0%",
          "--panel-bottom-3": "0%",
          "--panel-bottom-4": "0%",
          backgroundColor: navBgColor,
          transform: isOpen ? "translateY(0)" : "translateY(-101%)",
          transition: isOpen
            ? `transform ${navSlideInDuration}s`
            : `transform ${navSlideOutDuration}s ${navSlideOutDuration}s`,
          clipPath: `polygon(
            0 0,
            0 var(--panel-bottom-1),
            25% var(--panel-bottom-1),
            25% 0,
            25% 0,
            25% var(--panel-bottom-2),
            50% var(--panel-bottom-2),
            50% 0,
            50% 0,
            50% var(--panel-bottom-3),
            75% var(--panel-bottom-3),
            75% 0,
            75% 0,
            75% var(--panel-bottom-4),
            100% var(--panel-bottom-4),
            100% 0
          )`,
        }}
      >
        <ul className="list-none p-0 m-0">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="transition-all duration-1000 hover:opacity-80"
              style={{
                fontSize: menuItemFontSize,
                fontVariationSettings: `'wght' ${menuItemFontWeight}`,
                transitionTimingFunction: triggerTransitionEase,
                marginTop: index > 0 ? menuItemMarginTop : "0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.fontVariationSettings = `'wght' ${menuItemHoverFontWeight}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.fontVariationSettings = `'wght' ${menuItemFontWeight}`;
              }}
            >
              <a
                href={item.href}
                className="no-underline block py-1"
                style={{ color: menuItemColor }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
