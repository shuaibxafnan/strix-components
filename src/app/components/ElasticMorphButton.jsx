"use client";

import { useEffect, useState, useRef } from "react";

// ─── ElasticMorphButton ──────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// label                string    'Normal'    Text rendered inside the container button
// color                string    '#F6F8FF'   Resting state typography color
// colorHover           string    '#F6F8FF'   Hover state typography color
// bg                   string    '#58607F'   Button frame fill background color
// bgHover              string    '#535A79'   Button frame fill color during mouse hover
// borderStroke         string    'none'      Vector stroke outline color outline boundary
// strokeWidth          string    '0'         Vector edge thickness size allocation
// width                number    132         Total fixed width boundaries of container
// height               number    48          Total vertical axis allocation dimension
// ──────────────────────────────────────────────────────────────────────────

// Pre-defined morph states for pure-CSS or direct vector interpolation transition targets
const RESTING_PATH =
  "M4,3 C24.6666667,3 45.3333333,3 66,3 C86.6666667,3 107.333333,3 128,3 C129.104569,3 130,3.8954305 130,5 C130,11.3333333 130,17.6666667 130,24 C130,30.3333333 130,36.6666667 130,43 C130,44.1045695 129.104569,45 128,45 C107.333333,45 86.6666667,45 66,45 C45.3333333,45 24.6666667,45 4,45 C2.8954305,45 2,44.1045695 2,43 C2,36.6666667 2,30.3333333 2,24 C2,17.6666667 2,11.3333333 2,5 C2,3.8954305 2.8954305,3 4,3 Z";

const SQUISHED_PATH =
  "M4.61888061,3.16033114 C25.0792537,4.38677705 45.5396269,5 66,5 C86.4603676,5 106.920735,4.38677738 127.381103,3.16033213 L127.381102,3.16031915 C128.4837,3.09422671 129.43111,3.93448015 129.497203,5.03707774 C129.507043,5.20123476 129.496598,5.36597876 129.466107,5.52757892 C128.488702,10.707648 128,16.8651217 128,24 C128,31.1348854 128.488703,37.2923642 129.46611,42.4724366 L129.466097,42.4724389 C129.670899,43.5578488 128.957025,44.6037719 127.871615,44.8085734 C127.710017,44.8390647 127.545274,44.8495087 127.381119,44.8396689 C106.920746,43.613223 86.4603731,43 66,43 C45.5396324,43 25.0792647,43.6132226 4.61889712,44.8396679 L4.6188979,44.8396809 C3.51630032,44.9057733 2.56888986,44.0655198 2.50279742,42.9629223 C2.49295744,42.7987652 2.50340153,42.6340212 2.53389315,42.4724211 C3.51129772,37.292352 4,31.1348783 4,24 C4,16.8651146 3.51129674,10.7076358 2.53389023,5.52756343 L2.53390261,5.52756109 C2.32910108,4.44215115 3.04297524,3.3962281 4.12838519,3.19142657 C4.28998345,3.16093526 4.45472551,3.15049128 4.61888061,3.16033114 Z";

export default function ElasticMorphButton({
  label = "Normal",
  color = "#F6F8FF",
  colorHover = "#F6F8FF",
  bg = "#58607F",
  bgHover = "#535A79",
  borderStroke = "none",
  strokeWidth = "0",
  width = 132,
  height = 48,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pathData, setPathData] = useState(RESTING_PATH);
  const [isElasticSnapping, setIsElasticSnapping] = useState(false);

  // Prevent server hydration mismatches gracefully
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePointerDown = () => {
    setIsElasticSnapping(false);
    setPathData(SQUISHED_PATH);
  };

  const handlePointerUp = () => {
    setPathData(RESTING_PATH);
    setIsElasticSnapping(true);
  };

  if (!isMounted) {
    // Spacer layout box acts as placeholder preventing Cumulative Layout Shifts (CLS)
    return (
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className="inline-block bg-[#58607F] opacity-20 rounded-[6px]"
      />
    );
  }

  // Calculate dynamic tokens for variable mapping layout configurations
  const currentTextColor = isHovered ? colorHover : color;
  const currentFillColor = isHovered ? bgHover : bg;

  return (
    <div className="relative inline-block select-none">
      {/* Injecting specialized cubic-bezier formulas natively inside a localized, safe style context 
        handles complex physics interpolation seamlessly without relying on expensive Premium core add-ons.
      */}
      <style>{`
        .elastic-transition {
          transition: d 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .elastic-snap {
          transition: d 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>

      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setPathData(RESTING_PATH);
        }}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          color: currentTextColor,
        }}
        className="group relative flex items-center justify-center border-0 bg-transparent px-[36px] py-[8px] font-sans font-semibold text-[14px] leading-[26px] tracking-wide outline-none cursor-pointer [-webkit-tap-highlight-color:transparent]"
      >
        {/* Dynamic Vector Canvas Layer Context */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ height: `${height}px` }}
          className="absolute left-0 top-0 w-full z-0 block pointer-events-none transition-all"
        >
          <path
            d={pathData}
            style={{
              stroke: borderStroke,
              strokeWidth: strokeWidth,
              fill: currentFillColor,
            }}
            className={`transition-colors duration-250 ease-linear ${
              isElasticSnapping ? "elastic-snap" : "elastic-transition"
            }`}
          />
        </svg>

        {/* Text Node Layer Container context */}
        <span className="relative z-10 inline-block pointer-events-none">
          {label}
        </span>
      </button>
    </div>
  );
}
