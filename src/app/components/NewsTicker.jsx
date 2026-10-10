"use client";

import { useEffect, useRef, useState } from "react";

// ─── NewsTicker ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items         array    [...]    List of news items containing HTML markup strings
// duration      number   2000     Slide and progress circle period (ms)
// lineClamp     number   2        Total text lines permitted before clipping
// darkColor     string   #00172F  Primary text and active stroke color
// minWidth      string   300px    Minimum horizontal dimension bounds
// maxWidth      string   30em     Maximum text row container span
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  { text: "<strong>NEWS:</strong> The most important news you've ever read." },
  { text: "<strong>SALE:</strong> That's some shorter news." },
  { text: "<strong>NEWS:</strong> Another news bites the dust." },
];

export default function NewsTicker({
  items = DEFAULT_ITEMS,
  duration = 2000,
  lineClamp = 2,
  darkColor = "#00172F",
  minWidth = "300px",
  maxWidth = "30em",
}) {
  const sliderRef = useRef(null);
  const pathRef = useRef(null);

  // Mounted status shields layout reads from running server-side (Hydration Safe)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !sliderRef.current || !pathRef.current) return;

    let counter = 1;
    let timerId = null;

    const slider = sliderRef.current;
    const path = pathRef.current;

    // Total geometric length of SVG circle perimeter path
    const length = path.getTotalLength();
    const itemHeight =
      slider.firstElementChild?.getBoundingClientRect().height || 0;

    // Orchestrates path animations alongside slider translation jumps
    function animateTicker() {
      // 1. Reset SVG Stroke Positions Instantaneously
      path.style.transition = "none";
      path.style.strokeDasharray = `${length} ${length}`;
      path.style.strokeDashoffset = length;

      // Trigger native browser layout recalculation flush
      path.getBoundingClientRect();

      // 2. Animate Circular Progress Bar Ring Fill Down to Zero
      path.style.transition = `stroke-dashoffset ${duration / 1000}s linear`;
      path.style.strokeDashoffset = "0";

      // 3. Queue item slide sequence at terminal marker of display phase
      timerId = setTimeout(() => {
        slideItem();
      }, duration);
    }

    function slideItem() {
      const slideTransitionDuration = duration / 1000 / 4;

      // Shift viewport position downward
      slider.style.transition = `transform ${slideTransitionDuration}s ease-in-out`;
      slider.style.transform = `translate3d(0, -${itemHeight * counter}px, 0)`;

      // Handle cyclic loop resets safely when reaching the virtual clone element
      if (counter === items.length) {
        setTimeout(() => {
          if (!slider) return;
          slider.style.transition = "none";
          slider.style.transform = "translate3d(0, 0, 0)";
          counter = 1;
        }, slideTransitionDuration * 1000);
      } else {
        counter++;
      }

      // Re-trigger loop
      animateTicker();
    }

    // Begin execution sequence
    animateTicker();

    // Prevent loose references and interval memory leaks during component hot-reloads
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isMounted, items, duration]);

  // Prevent SSR rendering layout mismatch states during structural initialization
  if (!isMounted) {
    return null;
  }

  // Calculated configuration constants based on dynamic props
  const tickerHeight = `${lineClamp * 1.2}em`;

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 antialiased select-none"
        style={{ minWidth: minWidth }}
      >
        <div className="relative flex items-center">
          {/* Slider Window Frame Window */}
          <div
            className="overflow-hidden w-full"
            style={{ height: tickerHeight }}
          >
            <ul
              ref={sliderRef}
              className="m-0 p-0 list-none flex flex-col mr-[1.5em] will-change-transform"
              style={{ transform: "translate3d(0, 0, 0)" }}
            >
              {/* Map over incoming reactive news blocks */}
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center w-full"
                  style={{
                    maxHeight: tickerHeight,
                    height: tickerHeight,
                    maxWidth: maxWidth,
                  }}
                >
                  <a
                    href="#"
                    className="w-full text-left md:text-right overflow-hidden font-sans tracking-wide leading-[1.2] opacity-90 hover:opacity-100 transition-opacity"
                    style={{
                      color: darkColor,
                      maxHeight: tickerHeight,
                      display: "-webkit-box",
                      WebkitLineClamp: lineClamp,
                      WebkitBoxOrient: "vertical",
                    }}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                </li>
              ))}

              {/* Seamless Infinite Looping Terminal Node Clone */}
              <li
                className="flex items-center w-full"
                style={{
                  maxHeight: tickerHeight,
                  height: tickerHeight,
                  maxWidth: maxWidth,
                }}
              >
                <a
                  href="#"
                  className="w-full text-left md:text-right overflow-hidden font-sans tracking-wide leading-[1.2]"
                  style={{
                    color: darkColor,
                    maxHeight: tickerHeight,
                    display: "-webkit-box",
                    WebkitLineClamp: lineClamp,
                    WebkitBoxOrient: "vertical",
                  }}
                  dangerouslySetInnerHTML={{ __html: items[0].text }}
                />
              </li>
            </ul>
          </div>

          {/* Dynamic Graphic Timer Widgets Container */}
          <div className="w-[3em] h-[3em] shrink-0 relative">
            {/* Static Centered Megaphone Graphic */}
            <svg
              className="w-[30px] h-[30px] absolute top-[calc(50%-1px)] left-[calc(50%-1px)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
              viewBox="0 0 30 30"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill={darkColor}
                d="M10.8 12.6H7v4.7h2.4c.2 2 1.7 3.9 3.7 4.5.4.1.8.2 1.2.2.7 0 1.3-.2 1.8-.6.6-.4.9-1 1.1-1.6L23 22V8l-12.2 4.6zm4.4 7.6c-.4.3-1 .3-1.6.1-1.3-.4-2.4-1.7-2.6-2.9l4.7 1.8c0 .4-.2.8-.5 1zm6.2-.5L11.8 16v-2l9.6-3.7v9.4z"
              />
            </svg>

            {/* Dual-path Circular Progress Ring Engine */}
            <svg
              className="block w-full h-full overflow-visible"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Path 1: Progress Circle Track Background */}
              <path
                className="stroke-[3] fill-none"
                style={{ stroke: darkColor, opacity: 0.1 }}
                d="M 50,50 m 0,-48.5 a 48.5,48.5 0 1 1 0,97 a 48.5,48.5 0 1 1 0,-97"
              />
              {/* Path 2: Active Timed Progress Foreground Bar */}
              <path
                ref={pathRef}
                className="stroke-[3] fill-none z-[1] will-change-[stroke-dashoffset]"
                style={{ stroke: darkColor }}
                d="M 50,50 m 0,-48.5 a 48.5,48.5 0 1 1 0,97 a 48.5,48.5 0 1 1 0,-97"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
