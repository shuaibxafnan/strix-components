"use client";

import { useEffect, useRef, useState } from "react";

export default function RangeSlider({
  min = 1,
  max = 7,
  step = 1,
  defaultValue = 4,
  accentColor = "#ff622a",
  bgColor = "#efefef",
  onChange,
  className = "",
}) {
  const steps = Math.round((max - min) / step) + 1;
  const labels = Array.from({ length: steps }, (_, i) => min + i * step);
  const [value, setValue] = useState(defaultValue);
  const trackRef = useRef(null);
  const [ballX, setBallX] = useState(0);

  useEffect(() => {
    const compute = () => {
      if (!trackRef.current) return;
      const trackW = trackRef.current.getBoundingClientRect().width;
      const ballDiam = 32;
      const usable = trackW - ballDiam;
      const fraction = (value - min) / (max - min);
      setBallX(fraction * usable);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [value, min, max]);

  const handleChange = (e) => {
    const v = Number(e.target.value);
    setValue(v);
    onChange?.(v);
  };

  const glowColor = accentColor + "80";

  const grooveShadow = [
    "inset 0px -2px 8px #fff",
    "inset 0px -2px 4px #fff",
    "0px 2px 4px rgba(255,255,255,0.8)",
    "inset 0px 5px 8px rgba(0,10,20,0.4)",
    "inset 0px 2px 2px rgba(0,10,20,0.4)",
    "0px -1px 4px rgba(0,10,20,0.3)",
    "0px -4px 15px 2px rgba(255,255,255,1)",
    "0px -1px 15px 2px rgba(0,10,20,0.2)",
  ].join(", ");

  const ballShadow = [
    "-10px 10px 10px -5px rgba(136,140,136,0.8)",
    "-4px 4px 2px -5px rgba(85,85,85,0.8)",
    "-6px 12px 4px -10px rgba(102,102,102,0.8)",
    "-16px 12px 16px -10px rgba(153,153,153,0.8)",
    `8px -8px 8px ${glowColor}`,
    "inset 2px -3px 8px rgba(0,0,0,0.4)",
  ].join(", ");

  return (
    <div
      className={`w-full h-screen flex items-center justify-center px-4 ${className}`}
      style={{ background: bgColor }}
    >
      <div
        ref={trackRef}
        className="relative w-full max-w-[32rem] h-12 flex items-stretch overflow-visible"
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ accentColor }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[2rem] pointer-events-none flex items-center justify-between opacity-50 px-[1.125em]"
          style={{ boxShadow: grooveShadow }}
        >
          {labels.map((label) => (
            <span
              key={label}
              className="font-black text-sm select-none"
              style={{
                background: `linear-gradient(0deg, ${bgColor} 40%, rgb(0,0,0) 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow:
                  "1px -1px 1px rgba(0,0,0,0.1), -1px 1px 1px rgba(255,255,255,0.7)",
                filter: "blur(0.45px)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <div
          className="absolute top-2 left-2 pointer-events-none"
          style={{
            transform: `translateX(${ballX}px)`,
            transition: "transform 0.6s cubic-bezier(0.5, 0, 0.5, 1)",
          }}
        >
          <div
            className="w-8 h-8 rounded-full relative"
            style={{
              background: accentColor,
              boxShadow: ballShadow,
            }}
          >
            <span className="absolute opacity-50 bg-white rounded-[40%] blur-[1.6px] top-[0.3em] right-[0.45em] h-[30%] w-[20%] -rotate-[20deg] skew-x-[15deg] skew-y-[15deg]" />
            <span className="absolute rounded-full bg-white blur-[3px] bottom-[0.4em] left-[0.3em] h-[35%] w-[10%] -rotate-[25deg]" />
          </div>
          <div
            className="absolute inset-0 w-8 h-8 rounded-full mix-blend-overlay pointer-events-none shadow-[inset_2px_-2px_4px_rgba(255,255,255,0.35)]"
            style={{
              background:
                "linear-gradient(224.38deg, #FFFFFF 15%, rgba(173,173,173,0.3) 50%, rgba(41,41,41,0.4) 60%, rgba(109,109,109,0.3) 90%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
