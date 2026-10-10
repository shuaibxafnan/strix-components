"use client";

import { useState, useEffect, useRef } from "react";

// ─── SkewScroll ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// title               string    "SKEW SCROLL"  Floating layout focal header overlay text
// maxSkew             number    45             Maximum allowed degree threshold for skew transform
// scrollSpeedModifier number    1.0            Multiplier adjustments to scale skew aggressiveness
// containerBg         string    "bg-[#1a1a1a]" Page layout background wrapper style match
// titleColor          string    "text-white"   Color class assignment for central text element
// resetDuration       number    100            Timeout frequency monitoring track to flatten items
// imagesCol1          array     [...]          Asset collections tracking Column One blocks
// imagesCol2          array     [...]          Asset collections tracking Column Two blocks
// imagesCol3          array     [...]          Asset collections tracking Column Three blocks
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES_1 = [
  "https://images.unsplash.com/photo-1506471895742-d523008d053d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=641&q=80",
  "https://images.unsplash.com/photo-1517436919841-345c048c421d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
  "https://images.unsplash.com/photo-1511966344804-3847f3b298c9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
];

export default function SkewScroll({
  title = "Gallery",
  maxSkew = 45,
  scrollSpeedModifier = 1.0,
  containerBg = "bg-[#1a1a1a]",
  titleColor = "text-white",
  resetDuration = 100,
  imagesCol1 = Array(4).fill(DEFAULT_IMAGES_1).flat(),
  imagesCol2 = Array(4)
    .fill([DEFAULT_IMAGES_1[1], DEFAULT_IMAGES_1[2], DEFAULT_IMAGES_1[0]])
    .flat(),
  imagesCol3 = Array(4)
    .fill([DEFAULT_IMAGES_1[2], DEFAULT_IMAGES_1[0], DEFAULT_IMAGES_1[1]])
    .flat(),
}) {
  const [mounted, setMounted] = useState(false);
  const [skewDeg, setSkewDeg] = useState(0);
  const [scrollTransforms, setScrollTransforms] = useState({
    col1And3: 0,
    col2: -3100,
  });

  const lastScrollY = useRef(0);
  const resetTimer = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      lastScrollY.current = window.scrollY;

      // Mirror initialization alignments
      const initialWpos = window.scrollY;
      setScrollTransforms({
        col1And3: -initialWpos,
        col2: initialWpos - 3211,
      });
    }

    const handleScroll = () => {
      if (typeof window === "undefined") return;

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Compute speed tracking mechanics to deduce dynamic warping value parameters
      let computedSkew = delta * 0.5 * scrollSpeedModifier;
      if (computedSkew > maxSkew) computedSkew = maxSkew;
      if (computedSkew < -maxSkew) computedSkew = -maxSkew;

      setSkewDeg(computedSkew);

      // Mutate layout offsets synchronously across alternate directional vector streams
      setScrollTransforms({
        col1And3: -currentScrollY,
        col2: currentScrollY - 3211,
      });

      // Clear layout runtime transitions on energetic movement updates
      if (resetTimer.current) clearTimeout(resetTimer.current);

      // Debounce loop mapping to gradually ease items flat when scrolling actions cease
      resetTimer.current = setTimeout(() => {
        setSkewDeg(0);
      }, resetDuration);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [maxSkew, scrollSpeedModifier, resetDuration]);

  // Protect SSR boundaries and protect layout markers against baseline state mutations
  if (!mounted) {
    return <div className={`w-full min-h-screen ${containerBg}`} />;
  }

  return (
    <div
      className={`w-full h-[4200px] ${containerBg} relative font-sans antialiased`}
    >
      {/* ─── Hero Floating Text Frame ─── */}
      <div
        className={`fixed z-30 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] mx-auto text-center text-[92px] font-black select-none pointer-events-none tracking-tight ${titleColor}`}
      >
        {title}
      </div>

      {/* ─── Column Split Matrix Interface ─── */}
      <div className="w-full h-screen sticky top-0 left-0 overflow-hidden flex">
        {/* Column 1: Standard Downward Sequence */}
        <div className="w-1/3 h-full relative px-5">
          <div
            className="w-[91.8%] absolute h-[200vh] top-0 left-5 transition-transform duration-[600ms] ease-[cubic-bezier(0.04,0.72,0.09,0.99)]"
            style={{
              transform: `translate3d(0px, ${scrollTransforms.col1And3}px, 0px)`,
            }}
          >
            {imagesCol1.map((img, idx) => (
              <div
                key={`col1-${idx}`}
                className="relative w-full h-[33.3%] mt-5 bg-center bg-cover rounded-sm transition-transform duration-1000 ease-[cubic-bezier(0.04,0.72,0.09,0.99)]"
                style={{
                  backgroundImage: `url('${img}')`,
                  transform: `skewY(${skewDeg}deg)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Column 2: Inverted Upward Sequence */}
        <div className="w-1/3 h-full relative px-5">
          <div
            className="w-[91.8%] absolute h-[200vh] top-0 left-5 transition-transform duration-[600ms] ease-[cubic-bezier(0.04,0.72,0.09,0.99)]"
            style={{
              transform: `translate3d(0px, ${scrollTransforms.col2}px, 0px)`,
            }}
          >
            {imagesCol2.map((img, idx) => (
              <div
                key={`col2-${idx}`}
                className="relative w-full h-[33.3%] mt-5 bg-center bg-cover rounded-sm transition-transform duration-1000 ease-[cubic-bezier(0.04,0.72,0.09,0.99)]"
                style={{
                  backgroundImage: `url('${img}')`,
                  transform: `skewY(${-skewDeg}deg)`, // Inverse axis tracking skew
                }}
              />
            ))}
          </div>
        </div>

        {/* Column 3: Standard Downward Sequence */}
        <div className="w-1/3 h-full relative px-5">
          <div
            className="w-[91.8%] absolute h-[200vh] top-0 left-5 transition-transform duration-[600ms] ease-[cubic-bezier(0.04,0.72,0.09,0.99)]"
            style={{
              transform: `translate3d(0px, ${scrollTransforms.col1And3}px, 0px)`,
            }}
          >
            {imagesCol3.map((img, idx) => (
              <div
                key={`col3-${idx}`}
                className="relative w-full h-[33.3%] mt-5 bg-center bg-cover rounded-sm transition-transform duration-1000 ease-[cubic-bezier(0.04,0.72,0.09,0.99)]"
                style={{
                  backgroundImage: `url('${img}')`,
                  transform: `skewY(${skewDeg}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
