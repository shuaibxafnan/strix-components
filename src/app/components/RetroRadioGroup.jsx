"use client";

import { useState, useEffect } from "react";

/**
 * RetroRadioGroup Component
 *
 * Props:
 * - name: string (The input name attribute grouping the radio buttons)
 * - options: array of objects [{ id, label }] (The radio options to display)
 * - defaultValue: string (The id of the option selected by default)
 * - onChange: function (Callback triggered when the selected value changes)
 * - accentColor: string (Hex color for selected items, dots, text hover. Default #d01111)
 * - accentShadowColor: string (Hex color for secondary box-shadow details. Default #770000)
 */
export default function RetroRadioGroup({
  name = "player",
  options = [
    { id: "cassette", label: "Cassette Mode" },
    { id: "walkman", label: "Walkman Style" },
    { id: "mix", label: "80s Mix" },
    { id: "fm", label: "Retro FM" },
  ],
  defaultValue = "cassette",
  onChange = () => {},
  accentColor = "#d11111",
  accentShadowColor = "#770000",
}) {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);

  // Safeguard against server/client state hydration discrepancies
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleRadioChange = (id) => {
    setSelectedValue(id);
    onChange(id);
  };

  return (
    <div
      style={{
        // Passing dynamic theme adjustments down safely using CSS values
        "--retro-accent": accentColor,
        "--retro-accent-shadow": accentShadowColor,
      }}
      className="
        group/panel relative flex w-[320px] flex-col gap-4 rounded-lg border-2 border-[#222] bg-[#fffdf8] p-6 font-['Noto_Sans_JP',_Arial,_sans-serif] shadow-[4px_4px_0_#000] transition-all duration-300 ease-in-out
        hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000]
      "
    >
      {/* Dynamic Keyframe Animations Injected Directly to support specific jitter/bounce behaviors */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes retro-bounce {
          0% { transform: scale(0.3); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes retro-jitter {
          from { transform: rotate(-1deg) translateX(-1px); }
          to { transform: rotate(1deg) translateX(1px); }
        }
        @keyframes retro-scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }
        .animate-retro-bounce { animation: retro-bounce 0.4s ease-out forwards; }
        .group-hover\\/item:hover .animate-retro-jitter { animation: retro-jitter 0.3s infinite alternate; }
        .animate-retro-scanline { animation: retro-scanline 2s linear infinite; }
      `,
        }}
      />

      {/* Moving scanline backdrop overlay structure */}
      <div className="animate-retro-scanline absolute inset-0 pointer-events-none rounded-lg bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_3px)]" />

      {/* Paper texture surface overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-25 rounded-lg bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_2px)]" />

      {options.map((option) => {
        const isChecked = selectedValue === option.id;

        return (
          <label
            key={option.id}
            className="
              group/item relative flex cursor-pointer items-center gap-[0.8rem] rounded-[0.3rem] p-[0.3rem] transition-all duration-200 ease-in-out
              hover:bg-[rgba(209,17,17,0.1)] hover:translate-x-0.5
            "
          >
            {/* Native Hidden Radio Core inputs */}
            <input
              type="radio"
              name={name}
              checked={isChecked}
              onChange={() => handleRadioChange(option.id)}
              className="absolute pointer-events-none opacity-0"
            />

            {/* Hand-drawn Outer Circle Illustration Frame */}
            <div
              className={`
                flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-full border-2 transition-all duration-250 ease-in-out
                shadow-[inset_-2px_-2px_0_#111,_2px_2px_0_#111] group-hover/item:rotate-5
                ${
                  isChecked
                    ? "bg-[#ffe0e0] border-[var(--retro-accent)] !shadow-[inset_-2px_-2px_0_var(--retro-accent),_2px_2px_0_#111]"
                    : "bg-[#fdfaf4] border-[#111]"
                }
              `}
            >
              {/* Inner core radio selection bubble dot indicator */}
              <div
                style={{
                  boxShadow: `inset 1px 1px 0 var(--retro-accent-shadow), 2px 2px 0 #000`,
                }}
                className={`
                  h-[60%] w-[60%] rounded-full bg-[var(--retro-accent)] transition-transform duration-200 ease-out
                  ${isChecked ? "scale-100 animate-retro-bounce" : "scale-0"}
                `}
              />
            </div>

            {/* Radio label typographic container */}
            <span
              className={`
                transition-all duration-200 ease-in-out select-none text-[15px] font-medium
                group-hover/item:text-[var(--retro-accent)] animate-retro-jitter
                ${isChecked ? "text-[var(--retro-accent)] [text-shadow:1px_1px_0_var(--retro-accent-shadow)]" : "text-[#111]"}
              `}
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
