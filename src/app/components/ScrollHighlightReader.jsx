"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── ScrollHighlightReader ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// articleTitle      string   "The Carbon in Our Apple Pies" Title text header
// defaultStyle      string   "background"                   "background" | "half" | "underline"
// highlightColor    string   "bg-amber-300/80"              Tailwind highlight color class
// ──────────────────────────────────────────────────────────────────────────

const PARAGRAPHS = [
  {
    id: "p1",
    text: [
      {
        content:
          "Galaxies ship of the imagination across the centuries at the edge of forever take root and flourish billions upon billions. Stirred by starlight how far away not a sunrise but a galaxyrise Sea of Tranquility concept of the number one dispassionate extraterrestrial observer. The carbon in our apple pies emerged into consciousness Sea of Tranquility something incredible is waiting to be known made in the interiors of collapsing stars inconspicuous motes of rock and gas.",
      },
    ],
  },
  {
    id: "p2",
    text: [
      {
        content:
          "Great turbulent clouds something incredible is waiting to be known Jean-François Champollion hundreds of thousands science hearts of the stars. ",
      },
      { content: "Bits of moving fluff", highlight: true },
      {
        content:
          " another world brain is the seed of intelligence how far away bits of moving fluff realm of the galaxies? Cosmic fugue a still more glorious dawn awaits rings of Uranus dream of the mind's eye not a sunrise but a galaxyrise the only home we've ever known.",
      },
    ],
  },
  {
    id: "p3",
    text: [
      {
        content:
          "Quasar intelligent beings cosmic ocean realm of the galaxies Jean-François Champollion descended from astronomers? ",
      },
      {
        content:
          "Flatland prime number concept of the number one Euclid the carbon in our apple pies bits of moving fluff",
        highlight: true,
      },
      {
        content:
          ". Star stuff harvesting star light inconspicuous motes of rock and gas the ash of stellar alchemy encyclopaedia galactica bits of moving fluff the only home we've ever known. Made in the interiors of collapsing stars the ash of stellar alchemy made in the interiors of collapsing stars not a sunrise but a galaxyrise made in the interiors of collapsing stars something incredible is waiting to be known.",
      },
    ],
  },
  {
    id: "p4",
    text: [
      {
        content:
          "Permanence of the stars billions upon billions tingling of the spine culture realm of the galaxies corpus callosum. Hydrogen atoms rich in mystery vastness is bearable only through love prime number paroxysm of global death another world. Encyclopaedia galactica emerged into consciousness the sky calls to us at the edge of forever across the centuries emerged into consciousness. ",
      },
      {
        content:
          "At the edge of forever descended from astronomers vanquish the impossible descended from astronomers another world invent the universe",
        highlight: true,
      },
      { content: "." },
    ],
  },
  {
    id: "p5",
    text: [
      {
        content:
          "Galaxies Hypatia trillion radio telescope paroxysm of global death emerged into consciousness. Vanquish the impossible Orion's sword hearts of the stars muse about are creatures of the cosmos made in the interiors of collapsing stars? Made in the interiors of collapsing stars two ghostly white figures in coveralls and helmets are softly dancing dream of the mind's eye Apollonius of Perga ",
      },
      { content: "inconspicuous motes of rock and gas", highlight: true },
      { content: " Apollonius of Perga?" },
    ],
  },
  {
    id: "p6",
    text: [
      {
        content:
          "Not a sunrise but a galaxyrise a very small stage in a vast cosmic arena preserve and cherish that pale blue dot consciousness shores of the cosmic ocean decipherment? Of brilliant syntheses rich in mystery something incredible is waiting to be known colonies rings of Uranus hundreds of thousands? ",
      },
      {
        content:
          "From which we spring of brilliant syntheses extraordinary claims require extraordinary evidence Orion's sword Sea of Tranquility descended from astronomers",
        highlight: true,
      },
      { content: "." },
    ],
  },
  {
    id: "p7",
    text: [
      {
        content:
          "Cosmos of brilliant syntheses Rig Veda rings of Uranus explorations rich in heavy atoms. Shores of the cosmic ocean extraordinary claims require extraordinary evidence made ",
      },
      {
        content:
          "in the interiors of collapsing stars the carbon in our apple pies paroxysm",
        highlight: true,
      },
      {
        content:
          " of global death realm of the galaxies? Hundreds of thousands globular star cluster across the centuries a mote of dust suspended in a sunbeam globular star cluster made in the interiors of collapsing stars.",
      },
    ],
  },
];

export default function ScrollHighlightReader({
  articleTitle = "The Carbon in Our Apple Pies",
  defaultStyle = "background",
  highlightColor = "bg-amber-300/80",
}) {
  const [highlightStyle, setHighlightStyle] = useState(defaultStyle);
  const [darkMode, setDarkMode] = useState(false);
  const [activeHighlights, setActiveHighlights] = useState({});
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Standard high-performance viewport boundary layout detector
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            setActiveHighlights((prev) => ({ ...prev, [id]: true }));
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -20% 0px", // Triggers just before coming into core reading center
        threshold: 0.1,
      },
    );

    const elements = containerRef.current?.querySelectorAll(
      ".text-highlight-wrapper",
    );
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, [mounted, highlightStyle]); // Re-bind on style change to ensure observer hooks accurate classes

  if (!mounted) return null;

  return (
    <div
      className={`w-full min-h-screen transition-colors duration-500 font-serif ${
        darkMode ? "bg-zinc-950 text-zinc-300" : "bg-neutral-50 text-zinc-800"
      }`}
    >
      {/* Floating Control Center Header */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-2xl rounded-2xl border px-6 py-3 flex items-center justify-between shadow-lg backdrop-blur-md transition-all duration-300 ${
          darkMode
            ? "bg-zinc-900/90 border-zinc-800 text-zinc-200"
            : "bg-white/90 border-zinc-200 text-zinc-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <label className="text-xs font-sans font-bold tracking-wider uppercase opacity-70">
            Style
          </label>
          <div className="relative">
            <select
              value={highlightStyle}
              onChange={(e) => setHighlightStyle(e.target.value)}
              className={`appearance-none font-sans text-sm rounded-lg px-3 py-1 pr-8 font-medium cursor-pointer focus:outline-none border transition-all ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700 text-white focus:border-zinc-500"
                  : "bg-zinc-100 border-zinc-300 text-zinc-800 focus:border-zinc-400"
              }`}
            >
              <option value="background">Full Background</option>
              <option value="half">Marker Pen</option>
              <option value="underline">Minimal Underline</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="mode-toggle"
            className="text-xs font-sans font-bold tracking-wider uppercase opacity-70 cursor-pointer"
          >
            Dark Mode
          </label>
          <button
            id="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              darkMode ? "bg-indigo-600" : "bg-zinc-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                darkMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Reading Canvas Container */}
      <main
        ref={containerRef}
        className="max-w-2xl mx-auto pt-32 pb-24 px-6 md:px-0"
      >
        <h1
          className={`text-4xl md:text-5xl font-extrabold font-sans tracking-tight mb-12 transition-colors duration-300 ${
            darkMode ? "text-zinc-100" : "text-zinc-900"
          }`}
        >
          {articleTitle}
        </h1>

        <div className="space-y-8 text-lg md:text-xl leading-relaxed tracking-wide font-normal">
          {PARAGRAPHS.map((p) => (
            <p key={p.id} className="transition-colors duration-300">
              {p.text.map((chunk, index) => {
                if (!chunk.highlight) {
                  return <span key={index}>{chunk.content}</span>;
                }

                const uniqueId = `${p.id}-${index}`;
                const isActive = activeHighlights[uniqueId];

                // Direct runtime condition routing definitions for cleaner parsing rules
                let textStyleClasses = "transition-all duration-500 ";
                let markerLineElement = null;

                if (isActive) {
                  if (highlightStyle === "background") {
                    textStyleClasses += darkMode
                      ? "bg-indigo-950 text-indigo-200 px-1 rounded"
                      : `${highlightColor} text-zinc-950 px-1 rounded`;
                  } else if (highlightStyle === "half") {
                    textStyleClasses +=
                      "relative inline text-zinc-950 dark:text-white";
                    markerLineElement = (
                      <span
                        className={`absolute bottom-0.5 left-0 h-[0.45em] -z-10 transition-all duration-1000 ease-out origin-left ${
                          darkMode ? "bg-indigo-500/40" : "bg-amber-300/80"
                        } ${isActive ? "w-full scale-x-100" : "w-0 scale-x-0"}`}
                      />
                    );
                  } else if (highlightStyle === "underline") {
                    textStyleClasses +=
                      "border-b-2 " +
                      (darkMode
                        ? "border-indigo-400 text-zinc-100"
                        : "border-zinc-900 text-zinc-9entially");
                  }
                }

                return (
                  <span
                    key={index}
                    data-id={uniqueId}
                    className="text-highlight-wrapper relative inline"
                  >
                    <span className={textStyleClasses}>
                      {chunk.content}
                      {markerLineElement}
                    </span>
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}
