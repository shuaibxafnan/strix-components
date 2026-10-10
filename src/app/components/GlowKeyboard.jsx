"use client";

import React, { useState, useEffect } from "react";

// ─── GlowKeyboard ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// defaultTheme      string   "winter"    Initial theme selection ("spring"|"summer"|"autumn"|"winter"|"custom")
// maxContainerWidth string   "max-w-5xl" Tailwind max-width bounding box class
// textGlowOpacity   number   0.25        Opacity level of individual key text glow drops
// boxGlowOpacity    number   0.50        Opacity level of individual key box perimeter shadows
// ──────────────────────────────────────────────────────────────────────────

const THEMES = {
  spring: [
    { r: 174, g: 195, b: 214 },
    { r: 135, g: 172, b: 139 },
    { r: 204, g: 213, b: 132 },
    { r: 175, g: 121, b: 219 },
    { r: 92, g: 140, b: 154 },
  ],
  summer: [
    { r: 0, g: 107, b: 166 },
    { r: 4, g: 150, b: 255 },
    { r: 255, g: 188, b: 66 },
    { r: 216, g: 17, b: 89 },
    { r: 143, g: 45, b: 86 },
  ],
  autumn: [
    { r: 96, g: 108, b: 56 },
    { r: 140, g: 159, b: 104 },
    { r: 214, g: 210, b: 184 },
    { r: 221, g: 161, b: 94 },
    { r: 188, g: 108, b: 37 },
  ],
  winter: [
    { r: 89, g: 187, b: 255 },
    { r: 190, g: 233, b: 232 },
    { r: 98, g: 182, b: 203 },
    { r: 202, g: 233, b: 255 },
    { r: 95, g: 168, b: 211 },
  ],
  custom: [
    { r: 0, g: 83, b: 255 },
    { r: 0, g: 239, b: 255 },
    { r: 0, g: 255, b: 135 },
    { r: 70, g: 191, b: 176 },
  ],
};

const KEYBOARD_LAYOUT = [
  // Row 1
  [
    { label: "Esc", widthClass: "flex-[1_6.63%]" },
    { label: "1 !", widthClass: "flex-[1_6.63%]" },
    { label: "2 @", widthClass: "flex-[1_6.63%]" },
    { label: "3 #", widthClass: "flex-[1_6.63%]" },
    { label: "4 $", widthClass: "flex-[1_6.63%]" },
    { label: "5 %", widthClass: "flex-[1_6.63%]" },
    { label: "6 ^", widthClass: "flex-[1_6.63%]" },
    { label: "7 &", widthClass: "flex-[1_6.63%]" },
    { label: "8 &", widthClass: "flex-[1_6.63%]" },
    { label: "9 (", widthClass: "flex-[1_6.63%]" },
    { label: "0 )", widthClass: "flex-[1_6.63%]" },
    { label: "- _", widthClass: "flex-[1_6.63%]" },
    { label: "= +", widthClass: "flex-[1_6.63%]" },
    { label: "←", widthClass: "flex-[1_13.81%]" },
  ],
  // Row 2
  [
    { label: "→b", widthClass: "flex-[1_10.21%]" },
    { label: "Q", widthClass: "flex-[1_6.63%]" },
    { label: "W", widthClass: "flex-[1_6.63%]" },
    { label: "E", widthClass: "flex-[1_6.63%]" },
    { label: "R", widthClass: "flex-[1_6.63%]" },
    { label: "T", widthClass: "flex-[1_6.63%]" },
    { label: "Y", widthClass: "flex-[1_6.63%]" },
    { label: "U", widthClass: "flex-[1_6.63%]" },
    { label: "I", widthClass: "flex-[1_6.63%]" },
    { label: "O", widthClass: "flex-[1_6.63%]" },
    { label: "P", widthClass: "flex-[1_6.63%]" },
    { label: "[ {", widthClass: "flex-[1_6.63%]" },
    { label: "] }", widthClass: "flex-[1_6.63%]" },
    { label: "\\ |", widthClass: "flex-[1_10.21%]" },
  ],
  // Row 3
  [
    { label: "⤚", widthClass: "flex-[1_11.92%]" },
    { label: "A", widthClass: "flex-[1_6.63%]" },
    { label: "S", widthClass: "flex-[1_6.63%]" },
    { label: "D", widthClass: "flex-[1_6.63%]" },
    { label: "F", widthClass: "flex-[1_6.63%]" },
    { label: "G", widthClass: "flex-[1_6.63%]" },
    { label: "H", widthClass: "flex-[1_6.63%]" },
    { label: "J", widthClass: "flex-[1_6.63%]" },
    { label: "K", widthClass: "flex-[1_6.63%]" },
    { label: "L", widthClass: "flex-[1_6.63%]" },
    { label: "; :", widthClass: "flex-[1_6.63%]" },
    { label: "' \"", widthClass: "flex-[1_6.63%]" },
    { label: "↵", widthClass: "flex-[1_15.15%]" },
  ],
  // Row 4
  [
    { label: "↑", widthClass: "flex-[1_15.36%]" },
    { label: "Z", widthClass: "flex-[1_6.63%]" },
    { label: "X", widthClass: "flex-[1_6.63%]" },
    { label: "C", widthClass: "flex-[1_6.63%]" },
    { label: "V", widthClass: "flex-[1_6.63%]" },
    { label: "B", widthClass: "flex-[1_6.63%]" },
    { label: "N", widthClass: "flex-[1_6.63%]" },
    { label: "M", widthClass: "flex-[1_6.63%]" },
    { label: ", <", widthClass: "flex-[1_6.63%]" },
    { label: ". >", widthClass: "flex-[1_6.63%]" },
    { label: "/ ?", widthClass: "flex-[1_6.63%]" },
    { label: "↑", widthClass: "flex-[1_18.37%]" },
  ],
  // Row 5
  [
    { label: "Ctrl", widthClass: "flex-[1_8.33%]" },
    { label: "Cmd", widthClass: "flex-[1_8.33%]" },
    { label: "Alt", widthClass: "flex-[1_8.33%]" },
    { label: "—", widthClass: "flex-[1_41.67%]" },
    { label: "Alt", widthClass: "flex-[1_8.33%]" },
    { label: "Menu", widthClass: "flex-[1_8.33%]" },
    { label: "Ctrl", widthClass: "flex-[1_8.33%]" },
    { label: "Fn", widthClass: "flex-[1_8.33%]" },
  ],
];

const ROW_BG_COLORS = [
  "bg-[#0e0e0e]",
  "bg-[#0c0c0c]",
  "bg-[#0a0a0a]",
  "bg-[#090909]",
  "bg-[#070707]",
];

export default function GlowKeyboard({
  defaultTheme = "winter",
  maxContainerWidth = "max-w-5xl",
  textGlowOpacity = 0.25,
  boxGlowOpacity = 0.5,
}) {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [keyColors, setKeyColors] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Regenerate colors whenever theme switches or initial client sync occurs
  useEffect(() => {
    const activePalette = THEMES[currentTheme] || THEMES.winter;
    const computedColors = {};

    KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
      row.forEach((key, keyIndex) => {
        const uniqueKeyId = `${rowIndex}-${keyIndex}`;
        const randomPaletteColor =
          activePalette[Math.floor(Math.random() * activePalette.length)];
        computedColors[uniqueKeyId] = randomPaletteColor;
      });
    });

    setKeyColors(computedColors);
  }, [currentTheme]);

  if (!mounted) {
    return <div className="w-full min-h-screen bg-[#020202]" />;
  }

  return (
    <div className="w-full min-h-screen bg-[#020202] text-zinc-200 font-sans flex flex-col items-center justify-center p-6 select-none">
      <section className={`w-full ${maxContainerWidth} flex flex-col gap-6`}>
        {/* Core Layout Keyboard Hardware Outer Edge Chassis */}
        <div
          className="w-full [aspect-ratio:34/11] bg-[#020202] bg-gradient-to-b from-[#1c1c1c] to-[#020202] rounded-[0.5cqi] p-[0.5cqi] pb-[1.25cqi] border-b-[0.2cqi] border-[#020202]"
          style={{ containerType: "size" }}
        >
          {/* Inner Well Plate */}
          <div className="w-full h-full [aspect-ratio:34/11] rounded-[0.5cqi] flex flex-col gap-[0.33cqi] p-[0.25cqi] overflow-hidden [box-shadow:inset_0_0_2cqi_#020202]">
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`flex gap-[0.33cqi] flex-1 ${ROW_BG_COLORS[rowIndex] || "bg-[#070707]"}`}
              >
                {row.map((key, keyIndex) => {
                  const uniqueKeyId = `${rowIndex}-${keyIndex}`;
                  const color = keyColors[uniqueKeyId] || {
                    r: 89,
                    g: 187,
                    b: 255,
                  };

                  // Generate standard functional lighting map rules injected inline
                  const inlineStyles = {
                    "--color": `rgb(${color.r}, ${color.g}, ${color.b})`,
                    "--text-shadow": `rgba(${color.r}, ${color.g}, ${color.b}, ${textGlowOpacity})`,
                    "--box-shadow": `rgba(${color.r}, ${color.g}, ${color.b}, ${boxGlowOpacity})`,
                    "--box-shadow-inner-a": `rgba(${color.r}, ${color.g}, ${color.b}, 0.05)`,
                    "--box-shadow-inner-b": `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`,
                  };

                  return (
                    <div
                      key={keyIndex}
                      className={`
                        ${key.widthClass}
                        relative z-10 rounded-[0.5cqi] flex justify-center items-start pt-[2cqi] overflow-hidden
                        text-[var(--color)] font-normal text-[1.75cqi] leading-none whitespace-nowrap
                        bg-inherit cursor-pointer transition-transform duration-100 ease-linear
                        hover:translate-y-[0.5cqi] hover:z-0
                      `}
                      style={{
                        ...inlineStyles,
                        boxShadow: `
                          inset 0 -0.1cqi 0 var(--box-shadow-inner-b),
                          inset 0.1cqi 0 0 rgba(0, 0, 0, 0.75),
                          inset -0.1cqi 0 0 rgba(0, 0, 0, 0.75),
                          inset 0 0.1cqi 0 var(--box-shadow-inner-b),
                          inset 0 -0.5cqi 0.25cqi 0.85cqi var(--box-shadow-inner-a),
                          0 0 1.25cqi var(--box-shadow)
                        `,
                        textShadow: "0 0 0.5cqi var(--text-shadow)",
                      }}
                    >
                      {key.label}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Modular Theme Selection Base Controls */}
        <div className="flex items-center justify-center gap-2 text-sm text-[#777]">
          <span>Theme:</span>
          <select
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value)}
            className="bg-black text-white border border-white/15 rounded px-2 py-1 outline-none focus:border-white/30 transition-colors cursor-pointer text-xs"
          >
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="autumn">Autumn</option>
            <option value="winter">Winter</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </section>
    </div>
  );
}
