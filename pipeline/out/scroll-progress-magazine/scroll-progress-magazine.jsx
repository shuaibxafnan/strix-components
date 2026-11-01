"use client";

import { useState, useEffect } from "react";

const DEFAULT_BLOCKS = [
  {
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer mattis turpis eu neque tincidunt lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam auctor ultrices tortor et volutpat. Donec eu semper orci, eu fermentum orci. Vivamus aliquam lobortis egestas. Proin vel mauris vitae sem auctor cursus. Aenean sit amet odio at magna pharetra luctus nec eget urna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Praesent in leo at tellus ultricies laoreet."
  },
  {
    "text": "Nam pulvinar congue condimentum. Pellentesque fringilla ante sed massa tincidunt feugiat. Nulla bibendum est eros, non malesuada dolor vehicula in. Morbi eu cursus arcu. Phasellus ultricies ornare lorem, non interdum orci condimentum eu. Donec condimentum condimentum ligula ut placerat. Vestibulum id neque condimentum, molestie nunc vel, suscipit turpis. Quisque orci velit, mattis et nibh non, tempor finibus erat. Nullam tristique, tortor non commodo cursus, magna turpis rhoncus leo, quis porta quam ante sed orci. Nunc vehicula imperdiet leo in vulputate. Quisque quis dolor orci."
  },
  {
    "text": "Curabitur ultrices fringilla libero sit amet porta. Nulla rhoncus venenatis euismod. Praesent non interdum sem. Nunc in nibh tincidunt, faucibus sem at, finibus turpis. Nullam vel odio blandit, tincidunt urna et, luctus lectus. Vivamus porta sem vitae turpis interdum porta eu id ligula. Fusce non nisi fringilla, malesuada metus ut, imperdiet ligula. Nunc quis lorem nibh. Duis pharetra magna vestibulum metus convallis, id mollis ligula vulputate. Sed purus est, consectetur non suscipit sit amet, hendrerit at dolor. Maecenas feugiat, quam vel ullamcorper feugiat, sapien ipsum viverra justo, id cursus metus nisi quis enim."
  },
  {
    "imgSrc": "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    "imgAlt": "Polar bear traversing snowy fields",
    "caption": "Fig 01. Polar bear walking",
    "credit": "Daniel Bosse",
    "creditHref": "https://unsplash.com/@dtbosse"
  },
  {
    "text": "Duis nec nisi a eros dictum euismod nec non enim. Donec augue neque, aliquam id finibus a, volutpat ut ligula. Nam feugiat odio elit, ut molestie mi tempus vel. Etiam vitae velit eget massa scelerisque hendrerit cursus vel justo. Sed eget euismod lectus. Morbi tincidunt diam ac diam tempor molestie. Mauris eget lectus leo. Etiam id porta turpis."
  },
  {
    "text": "Aenean ac pellentesque ante. In hac habitasse platea dictumst. Nullam efficitur, dolor ac pharetra iaculis, sem elit maximus ex, et malesuada est ipsum tempor nisi. Phasellus auctor et turpis ultrices fermentum. Mauris ac orci sapien. Quisque auctor, mi eu vestibulum dictum, nisl felis pulvinar dui, non dictum justo tellus a urna. Morbi suscipit et odio a feugiat. Sed dui nisi, iaculis a lacus posuere, dictum laoreet felis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos."
  },
  {
    "text": "Nam pulvinar congue condimentum. Pellentesque fringilla ante sed massa tincidunt feugiat. Nulla bibendum est eros, non malesuada dolor vehicula in. Morbi eu cursus arcu. Phasellus ultricies ornare lorem, non interdum orci condimentum eu. Donec condimentum condimentum ligula ut placerat. Vestibulum id neque condimentum, molestie nunc vel, suscipit turpis. Quisque orci velit, mattis et nibh non, tempor finibus erat. Nullam tristique, tortor non commodo cursus, magna turpis rhoncus leo, quis porta quam ante sed orci. Nunc vehicula imperdiet leo in vulputate. Quisque quis dolor orci."
  },
  {
    "imgSrc": "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
    "imgAlt": "Polar bear shaking water droplets from its fur coat",
    "caption": "Fig 02. Fluid dynamics tracking",
    "credit": "Daniel Bosse",
    "creditHref": "https://unsplash.com/@dtbosse"
  },
  {
    "text": "Curabitur ultrices fringilla libero sit amet porta. Nulla rhoncus venenatis euismod. Praesent non interdum sem. Nunc in nibh tincidunt, faucibus sem at, finibus turpis. Nullam vel odio blandit, tincidunt urna et, luctus lectus. Vivamus porta sem vitae turpis interdum porta eu id ligula. Fusce non nisi fringilla, malesuada metus ut, imperdiet ligula. Nunc quis lorem nibh. Duis pharetra magna vestibulum metus convallis, id mollis ligula vulputate. Sed purus est, consectetur non suscipit sit amet, hendrerit at dolor. Maecenas feugiat, quam vel ullamcorper feugiat, sapien ipsum viverra justo, id cursus metus nisi quis enim."
  }
];

export default function ScrollProgressMagazine({
  title = "The Polar Bear",
  label = "Editorial Specimen Archive",
  readSuffix = "% Read",
  meta = ["Published 2026", "8 Min Read"],
  blocks = DEFAULT_BLOCKS,
  barHeight = "h-1.5",
  progressColor = "bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500",
  maxContentWidth = "max-w-2xl",
  backgroundColor = "#0b0c10",
  textColor = "#d4d4d8",
  titleColor = "#f4f4f5",
  mutedColor = "#71717a",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    const calculateScrollProgress = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = window.scrollY / totalHeight;
      setReadingProgress(Math.min(Math.max(progress, 0), 1));
    };

    window.addEventListener("scroll", calculateScrollProgress, {
      passive: true,
    });
    window.addEventListener("resize", calculateScrollProgress);
    calculateScrollProgress();

    return () => {
      window.removeEventListener("scroll", calculateScrollProgress);
      window.removeEventListener("resize", calculateScrollProgress);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`w-full min-h-screen font-sans antialiased overflow-x-hidden selection:bg-teal-500/20 selection:text-teal-300 ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="fixed top-0 left-0 w-full z-50 border-b border-zinc-900/40">
        <div
          className={`${barHeight} ${progressColor} origin-left transition-transform duration-75 ease-out shadow-[0_0_20px_rgba(20,184,166,0.3)]`}
          style={{ transform: `scaleX(${readingProgress})` }}
        />
        <div
          className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center gap-3 text-[10px] font-mono tracking-widest uppercase"
          style={{ color: mutedColor }}
        >
          <span className="truncate">{label}</span>
          <span className="shrink-0 font-bold bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded">
            {Math.round(readingProgress * 100)}
            {readSuffix}
          </span>
        </div>
      </div>

      <main
        className={`mx-auto px-6 pt-32 pb-24 ${maxContentWidth} flex flex-col`}
      >
        <header className="border-b border-zinc-900 pb-10">
          <h1
            className="text-4xl md:text-5xl font-light tracking-tight leading-tight"
            style={{ color: titleColor }}
          >
            {title}
          </h1>
          <div
            className="flex flex-wrap items-center gap-4 mt-6 text-xs font-mono"
            style={{ color: mutedColor }}
          >
            {meta.map((item, i) => (
              <span key={i} className="flex items-center gap-4">
                {i > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                )}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </header>

        <div className="space-y-8 text-[15px] sm:text-[16px] leading-relaxed font-light text-justify">
          {blocks.map((block, i) =>
            block.imgSrc ? (
              <figure key={i} className="my-12 group">
                <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 transition-all duration-700 ease-out group-hover:border-zinc-800 shadow-2xl">
                  <img
                    src={block.imgSrc}
                    alt={block.imgAlt || ""}
                    className="w-full h-auto object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.01]"
                  />
                </div>
                <figcaption
                  className="mt-3 px-1 flex flex-wrap justify-between gap-2 text-xs font-mono"
                  style={{ color: mutedColor }}
                >
                  <span>{block.caption}</span>
                  {block.credit && (
                    <span>
                      Via{" "}
                      <a
                        href={block.creditHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity underline underline-offset-2"
                      >
                        {block.credit}
                      </a>
                    </span>
                  )}
                </figcaption>
              </figure>
            ) : (
              <p key={i}>{block.text}</p>
            )
          )}
        </div>
      </main>
    </div>
  );
}
