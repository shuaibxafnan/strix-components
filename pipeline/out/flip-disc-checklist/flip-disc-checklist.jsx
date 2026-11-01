"use client";

import React, { useState } from "react";

const DEFAULT_ITEMS = [
  { id: "diag1", label: "Memory Test", checked: true },
  { id: "diag2", label: "Disk Integrity Check", checked: false },
  { id: "diag3", label: "Network Analysis", checked: false },
];

export default function FlipDiscChecklist({
  title = "System Diagnostics",
  cardBg = "bg-[#2a2827]",
  discFrontBg = "bg-[#1c1b1a]",
  discBackGradient = "from-[#ffc857] to-[#fb923c]",
  textUnchecked = "text-[#9e9a94]",
  textChecked = "text-[#ffc857]",
  initialItems = DEFAULT_ITEMS,
  className = "",
}) {
  const [items, setItems] = useState(initialItems);

  const handleCheckboxChange = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center font-mono ${className}`}
    >
      <div
        className={`max-w-[333px] max-h-[444px] w-full ${cardBg} rounded-xl p-6 overflow-y-auto border border-[#403d3b] [box-shadow:inset_0px_2px_2px_rgba(0,0,0,0.5),_inset_-2px_-6px_8px_rgba(0,0,0,0.155),_inset_-4px_-4px_4px_rgba(199,199,199,0.064),_inset_-0px_-2px_1px_rgba(255,255,255,0.269)]`}
      >
        <div className="text-[20px] font-semibold text-[#e0ddd7] mb-6 select-none">
          {title}
        </div>

        <div className="flex flex-col">
          {items.map((item) => (
            <label
              key={item.id}
              htmlFor={item.id}
              className="group flex items-center cursor-pointer p-3 rounded-lg mb-3 [-webkit-tap-highlight-color:transparent] transition-colors duration-300 hover:bg-[#3a3836]"
            >
              <input
                type="checkbox"
                id={item.id}
                checked={item.checked}
                onChange={() => handleCheckboxChange(item.id)}
                className="absolute opacity-0 w-0 h-0 peer"
              />

              <div className="relative w-7 h-7 flex-shrink-0 mr-4 [perspective:800px]">
                <div
                  className={`absolute w-full h-full [transform-style:preserve-3d] transition-transform duration-700 [cubic-bezier(0.7,0,0.2,1)] ${
                    item.checked ? "[transform:rotateX(-180deg)]" : ""
                  }`}
                >
                  <div
                    className={`absolute w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] flex items-center justify-center rounded-[4px] ${discFrontBg} [box-shadow:inset_0_1px_3px_rgba(0,0,0,0.7)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[#fb923c] peer-focus-visible:outline-offset-2`}
                  >
                    <svg
                      className="w-4 h-4 stroke-[#52504d] stroke-[2]"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </div>

                  <div
                    className={`absolute w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] flex items-center justify-center rounded-[4px] bg-radial ${discBackGradient} [box-shadow:0_0_15px_rgba(251,146,60,0.6),_inset_0_1px_2px_rgba(255,255,255,0.3)] [transform:rotateX(180deg)]`}
                  >
                    <svg
                      className="w-[18px] h-[18px] stroke-[#4d2d00] stroke-[2.5]"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <span
                className={`font-medium transition-all duration-500 select-none ${
                  item.checked
                    ? `${textChecked} [text-shadow:0_0_5px_rgba(251,146,60,0.5)]`
                    : textUnchecked
                }`}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
