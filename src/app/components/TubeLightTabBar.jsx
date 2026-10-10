"use client";

import { useEffect, useState, useRef } from "react";

// ─── TubelightTabBar ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// containerBgColor     string    "#cecece"          Overall page context viewport background
// navBgColor           string    "rgb(0,0,0)"       The navigation wrapper base block fill
// activeColor          string    "#ffffff"          The color applied to the light indicator beam
// iconUnlitColor       string    "#ffffff"          Color applied to inactive structural icons
// unlitOpacity         number    0.4                Opacity state for non-selected items
// transitionSpeed      number    400                Slide delay duration for the beam (ms)
// initialIndex         number    0                  Index position forced active on render
// onTabChange          function  undefined          Trigger callback returning current index
// ──────────────────────────────────────────────────────────────────────────

// Global Icon Registry Vector Master Object Matrix Mapping
const NAV_ICONS = [
  {
    id: "home-icon",
    viewBox: "0 0 16 16",
    path: "M13.1428571,14.5 C13.6571429,14.5 14,14.175507 14,13.6887676 L14,6.38767551 C14,6.14430577 13.9142857,5.90093604 13.6571429,5.73868955 L8.51428571,1.6825273 C8.17142857,1.43915757 7.74285714,1.43915757 7.4,1.6825273 L2.25714286,5.73868955 C2.08571429,5.90093604 2,6.14430577 2,6.38767551 L2,13.6887676 C2,14.175507 2.34285714,14.5 2.85714286,14.5 L13.1428571,14.5 Z M5.42857143,12.8775351 L3.71428571,12.8775351 L3.71428571,6.79329173 L8,3.38611544 L12.2857143,6.79329173 L12.2857143,12.8775351 L10.5714286,12.8775351 L5.42857143,12.8775351 Z",
  },
  {
    id: "bookmark-icon",
    viewBox: "0 0 24 24",
    path: "M7 3H17C18.1 3 19 3.89999 19 5V21L12 18L5 21V5C5 3.89999 5.90002 3 7 3ZM12 15.82L17 18V5H7V18L12 15.82Z",
  },
  {
    id: "plus-icon",
    viewBox: "0 0 24 24",
    path: "M12 2C6.48 2 2 6.48001 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48001 17.52 2 12 2ZM11 7V11H7V13H11V17H13V13H17V11H13V7H11ZM4 12C4 16.41 7.59 20 12 20C16.41 20 20 16.41 20 12C20 7.59 16.41 4 12 4C7.59 4 4 7.59 4 12Z",
  },
  {
    id: "user-icon",
    viewBox: "0 0 448 570",
    path: "M313.6 304c-28.7 0-42.5 16-89.6 16-47.1 0-60.8-16-89.6-16C60.2 304 0 364.2 0 438.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-25.6c0-74.2-60.2-134.4-134.4-134.4zM400 464H48v-25.6c0-47.6 38.8-86.4 86.4-86.4 14.6 0 38.3 16 89.6 16 51.7 0 74.9-16 89.6-16 47.6 0 86.4 38.8 86.4 86.4V464zM224 288c79.5 0 144-64.5 144-144S303.5 0 224 0 80 64.5 80 144s64.5 144 144 144zm0-240c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96z",
  },
  {
    id: "settings-icon",
    viewBox: "0 0 512 568",
    path: "M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z",
  },
];

export default function TubelightTabBar({
  containerBgColor = "#cecece",
  navBgColor = "rgb(0,0,0)",
  activeColor = "#ffffff",
  iconUnlitColor = "#ffffff",
  unlitOpacity = 0.4,
  transitionSpeed = 400,
  initialIndex = 0,
  onTabChange = undefined,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [lightLeft, setLightLeft] = useState(0);

  const linksRef = useRef([]);
  const lightRef = useRef(null);

  // Eliminate Hydration/SSR mismatches cleanly
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Recalculate beam position when state index mutations lock
  useEffect(() => {
    if (!isMounted) return;
    const currentActiveLink = linksRef.current[activeIndex];
    const lightEl = lightRef.current;
    if (currentActiveLink && lightEl) {
      const calculatedLeft =
        currentActiveLink.offsetLeft + lightEl.offsetWidth / 4;
      setLightLeft(calculatedLeft);
    }
  }, [activeIndex, isMounted]);

  // Tab fluid incremental ripple click tracker
  const handleTabClick = (e, index) => {
    let localCurrent = currentIndex;
    const increment = index > localCurrent ? 1 : -1;

    const intervalTimer = setInterval(() => {
      localCurrent += increment;
      setCurrentIndex(localCurrent);

      if (localCurrent === index) {
        setActiveIndex(index);
        clearInterval(intervalTimer);
        if (onTabChange) onTabChange(index);
      }
    }, 50);

    const currentActiveLink = linksRef.current[index];
    const lightEl = lightRef.current;
    if (currentActiveLink && lightEl) {
      const calculatedLeft =
        currentActiveLink.offsetLeft + lightEl.offsetWidth / 4;
      setLightLeft(calculatedLeft);
    }
  };

  if (!isMounted) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center select-none"
        style={{ backgroundColor: containerBgColor }}
      />
    );
  }

  return (
    <div
      className="w-full h-screen flex items-center justify-center select-none antialiased"
      style={{ backgroundColor: containerBgColor }}
    >
      <nav
        className="relative w-[350px] h-[80px] grid grid-cols-5 rounded-[10px] px-[15px] overflow-hidden shadow-[0_6.7px_5.3px_rgba(0,0,0,0.12),0_22.3px_17.9px_rgba(0,0,0,0.08),0_100px_80px_rgba(0,0,0,0.04)]"
        style={{ backgroundColor: navBgColor }}
      >
        {NAV_ICONS.map((icon, index) => {
          const isCurrentlyActive =
            index === currentIndex || index === activeIndex;

          return (
            <ul
              key={icon.id}
              className="h-full flex justify-center items-center"
            >
              <li className="list-none w-[24px] h-[24px]">
                <button
                  ref={(el) => (linksRef.current[index] = el)}
                  onClick={(e) => handleTabClick(e, index)}
                  type="button"
                  className="block w-full h-full cursor-pointer bg-transparent border-none outline-none p-0 [WebkitTapHighlightColor:transparent]"
                >
                  <svg
                    className="w-full h-full pointer-events-none"
                    viewBox={icon.viewBox}
                    style={{
                      fill: isCurrentlyActive ? activeColor : iconUnlitColor,
                      opacity: isCurrentlyActive ? 1 : unlitOpacity,
                      transition: "opacity 100ms ease, fill 100ms ease",
                    }}
                  >
                    <path d={icon.path} />
                  </svg>
                </button>
              </li>
            </ul>
          );
        })}

        {/* Ray Beam Frame Tracker Elements */}
        <div
          ref={lightRef}
          className="absolute top-0 w-[45px] h-[5px] rounded-[5px] -translate-x-1/2 z-10"
          style={{
            left: `${lightLeft}px`,
            backgroundColor: activeColor,
            transition: `left ${transitionSpeed}ms ease`,
          }}
        >
          <div
            className="absolute left-[-30%] top-[5px] width-[160%] w-[72px] h-[80px] [clip-path:polygon(5%_100%,25%_0px,75%_0px,95%_100%)] pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3) -50%, rgba(255, 255, 255, 0) 90%)`,
            }}
          />
        </div>
      </nav>
    </div>
  );
}
