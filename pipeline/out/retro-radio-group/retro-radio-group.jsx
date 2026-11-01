"use client";

import { useState, useEffect } from "react";

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
  className = "",
}) {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);
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
        "--retro-accent": accentColor,
        "--retro-accent-shadow": accentShadowColor,
      }}
      className={`
        group/panel relative flex w-[320px] max-w-full flex-col gap-4 rounded-lg border-2 border-[#222] bg-[#fffdf8] p-6 font-['Noto_Sans_JP',_Arial,_sans-serif] shadow-[4px_4px_0_#000] transition-all duration-300 ease-in-out
        hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] ${className}
      `}
    >
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
      <div className="animate-retro-scanline absolute inset-0 pointer-events-none rounded-lg bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_3px)]" />
      <div className="absolute inset-0 pointer-events-none opacity-25 rounded-lg bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_2px)]" />

      {options.map((option) => {
        const isChecked = selectedValue === option.id;

        return (
          <label
            key={option.id}
            className="
              group/item relative flex cursor-pointer items-center gap-[0.8rem] rounded-[0.3rem] p-[0.3rem] transition-all duration-200 ease-in-out
              hover:bg-[color-mix(in_srgb,var(--retro-accent)_10%,transparent)] hover:translate-x-0.5
            "
          >
            <input
              type="radio"
              name={name}
              checked={isChecked}
              onChange={() => handleRadioChange(option.id)}
              className="absolute pointer-events-none opacity-0"
            />
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
