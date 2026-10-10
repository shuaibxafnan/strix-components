"use client";

import { useState, useEffect } from "react";

// ─── ScrollProgressMagazine ──────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// title            string   "The Polar Bear" Headline title text asset string
// barHeight        string   "h-1.5"          Height density class for track layout
// progressColor    string   "bg-gradient-to-r..." Color theme background token
// maxContentWidth  string   "max-w-2xl"      Text readability layout width scale
// ──────────────────────────────────────────────────────────────────────────

export default function ScrollProgressMagazine({
  title = "The Polar Bear",
  barHeight = "h-1.5",
  progressColor = "bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500",
  maxContentWidth = "max-w-2xl",
}) {
  const [mounted, setMounted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

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
    calculateScrollProgress();

    return () => window.removeEventListener("scroll", calculateScrollProgress);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-[#0b0c10] text-[#a1a1aa] font-sans min-h-screen antialiased selection:bg-teal-500/20 selection:text-teal-300">
      {/* Premium Cinematic Ambient Indicator Bar */}
      <div className="fixed top-0 left-0 w-full z-50 border-b border-zinc-900/40">
        <div
          className={`${barHeight} ${progressColor} origin-left transition-transform duration-75 ease-out shadow-[0_0_20px_rgba(20,184,166,0.3)]`}
          style={{ transform: `scaleX(${readingProgress})` }}
        />

        {/* Subtle Reading Percentage Float */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center text-[10px] font-mono tracking-widest uppercase text-zinc-500">
          <span>Editorial Specimen Archive</span>
          <span className="text-zinc-400 font-bold bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded">
            {Math.round(readingProgress * 100)}% Read
          </span>
        </div>
      </div>

      {/* Main Container Core Layout */}
      <main
        className={`mx-auto px-6 pt-32 pb-24 ${maxContentWidth} flex flex-col`}
      >
        {/* Typography Editorial Block Header */}
        <header className="border-b border-zinc-900 pb-10">
          <h1 className="text-4xl md:text-5xl font-light text-zinc-100 tracking-tight leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 mt-6 text-xs font-mono text-zinc-500">
            <span>Published 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <span>8 Min Read</span>
          </div>
        </header>

        {/* Prose Reading Framework Section */}
        <div className="space-y-8 text-[15px] sm:text-[16px] leading-relaxed text-zinc-300 font-light text-justify">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            mattis turpis eu neque tincidunt lacinia. Pellentesque habitant
            morbi tristique senectus et netus et malesuada fames ac turpis
            egestas. Aliquam auctor ultrices tortor et volutpat. Donec eu semper
            orci, eu fermentum orci. Vivamus aliquam lobortis egestas. Proin vel
            mauris vitae sem auctor cursus. Aenean sit amet odio at magna
            pharetra luctus nec eget urna. Vestibulum ante ipsum primis in
            faucibus orci luctus et ultrices posuere cubilia curae; Praesent in
            leo at tellus ultricies laoreet.
          </p>

          <p>
            Nam pulvinar congue condimentum. Pellentesque fringilla ante sed
            massa tincidunt feugiat. Nulla bibendum est eros, non malesuada
            dolor vehicula in. Morbi eu cursus arcu. Phasellus ultricies ornare
            lorem, non interdum orci condimentum eu. Donec condimentum
            condimentum ligula ut placerat. Vestibulum id neque condimentum,
            molestie nunc vel, suscipit turpis. Quisque orci velit, mattis et
            nibh non, tempor finibus erat. Nullam tristique, tortor non commodo
            cursus, magna turpis rhoncus leo, quis porta quam ante sed orci.
            Nunc vehicula imperdiet leo in vulputate. Quisque quis dolor orci.
          </p>

          <p>
            Curabitur ultrices fringilla libero sit amet porta. Nulla rhoncus
            venenatis euismod. Praesent non interdum sem. Nunc in nibh
            tincidunt, faucibus sem at, finibus turpis. Nullam vel odio blandit,
            tincidunt urna et, luctus lectus. Vivamus porta sem vitae turpis
            interdum porta eu id ligula. Fusce non nisi fringilla, malesuada
            metus ut, imperdiet ligula. Nunc quis lorem nibh. Duis pharetra
            magna vestibulum metus convallis, id mollis ligula vulputate. Sed
            purus est, consectetur non suscipit sit amet, hendrerit at dolor.
            Maecenas feugiat, quam vel ullamcorper feugiat, sapien ipsum viverra
            justo, id cursus metus nisi quis enim.
          </p>

          {/* Premium Immersive Media Embed Block 01 */}
          <figure className="my-12 group">
            <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 transition-all duration-700 ease-out group-hover:border-zinc-800 shadow-2xl">
              <img
                src="https://assets.codepen.io/89905/photo-1610570426407-efa770f9d31a.jpeg?width=1635&height=1090&format=auto&quality=60"
                alt="Polar bear traversing snowy fields"
                className="w-full h-auto object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.01]"
              />
            </div>
            <figcaption className="mt-3 px-1 flex justify-between text-xs font-mono text-zinc-500">
              <span>Fig 01. Polar bear walking</span>
              <span className="text-zinc-600">
                Via{" "}
                <a
                  href="https://unsplash.com/@dtbosse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-400 transition-colors underline underline-offset-2"
                >
                  Daniel Bosse
                </a>
              </span>
            </figcaption>
          </figure>

          <p>
            Duis nec nisi a eros dictum euismod nec non enim. Donec augue neque,
            aliquam id finibus a, volutpat ut ligula. Nam feugiat odio elit, ut
            molestie mi tempus vel. Etiam vitae velit eget massa scelerisque
            hendrerit cursus vel justo. Sed eget euismod lectus. Morbi tincidunt
            diam ac diam tempor molestie. Mauris eget lectus leo. Etiam id porta
            turpis.
          </p>

          <p>
            Aenean ac pellentesque ante. In hac habitasse platea dictumst.
            Nullam efficitur, dolor ac pharetra iaculis, sem elit maximus ex, et
            malesuada est ipsum tempor nisi. Phasellus auctor et turpis ultrices
            fermentum. Mauris ac orci sapien. Quisque auctor, mi eu vestibulum
            dictum, nisl felis pulvinar dui, non dictum justo tellus a urna.
            Morbi suscipit et odio a feugiat. Sed dui nisi, iaculis a lacus
            posuere, dictum laoreet felis. Class aptent taciti sociosqu ad
            litora torquent per conubia nostra, per inceptos himenaeos.
          </p>

          <p>
            Nam pulvinar congue condimentum. Pellentesque fringilla ante sed
            massa tincidunt feugiat. Nulla bibendum est eros, non malesuada
            dolor vehicula in. Morbi eu cursus arcu. Phasellus ultricies ornare
            lorem, non interdum orci condimentum eu. Donec condimentum
            condimentum ligula ut placerat. Vestibulum id neque condimentum,
            molestie nunc vel, suscipit turpis. Quisque orci velit, mattis et
            nibh non, tempor finibus erat. Nullam tristique, tortor non commodo
            cursus, magna turpis rhoncus leo, quis porta quam ante sed orci.
            Nunc vehicula imperdiet leo in vulputate. Quisque quis dolor orci.
          </p>

          {/* Premium Immersive Media Embed Block 02 */}
          <figure className="my-12 group">
            <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 transition-all duration-700 ease-out group-hover:border-zinc-800 shadow-2xl">
              <img
                src="https://assets.codepen.io/89905/photo-1610570311113-79ba0e69768d.jpeg?width=1635&height=1090&format=auto&quality=60"
                alt="Polar bear shaking water droplets from its fur coat"
                className="w-full h-auto object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.01]"
              />
            </div>
            <figcaption className="mt-3 px-1 flex justify-between text-xs font-mono text-zinc-500">
              <span>Fig 02. Fluid dynamics tracking</span>
              <span className="text-zinc-600">
                Via{" "}
                <a
                  href="https://unsplash.com/@dtbosse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-400 transition-colors underline underline-offset-2"
                >
                  Daniel Bosse
                </a>
              </span>
            </figcaption>
          </figure>

          <p>
            Curabitur ultrices fringilla libero sit amet porta. Nulla rhoncus
            venenatis euismod. Praesent non interdum sem. Nunc in nibh
            tincidunt, faucibus sem at, finibus turpis. Nullam vel odio blandit,
            tincidunt urna et, luctus lectus. Vivamus porta sem vitae turpis
            interdum porta eu id ligula. Fusce non nisi fringilla, malesuada
            metus ut, imperdiet ligula. Nunc quis lorem nibh. Duis pharetra
            magna vestibulum metus convallis, id mollis ligula vulputate. Sed
            purus est, consectetur non suscipit sit amet, hendrerit at dolor.
            Maecenas feugiat, quam vel ullamcorper feugiat, sapien ipsum viverra
            justo, id cursus metus nisi quis enim.
          </p>
        </div>
      </main>
    </div>
  );
}
