"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_PARAGRAPHS = [
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

const VARIANTS = ["background", "half", "underline"];

export default function ScrollHighlightReader({
  articleTitle = "The Carbon in Our Apple Pies",
  paragraphs = DEFAULT_PARAGRAPHS,
  variant = "background",
  highlightColor = "rgba(252, 211, 77, 0.8)",
  highlightTextColor = "#09090b",
  backgroundColor = "#fafafa",
  textColor = "#27272a",
  titleColor = "#18181b",
  className = "",
}) {
  const style = VARIANTS.includes(variant) ? variant : "background";
  const [activeHighlights, setActiveHighlights] = useState({});
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.1,
      },
    );

    const elements = containerRef.current?.querySelectorAll(
      ".text-highlight-wrapper",
    );
    elements?.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [mounted, style, paragraphs]);

  if (!mounted) return null;

  return (
    <div
      className={`relative isolate w-full min-h-screen font-serif ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <main
        ref={containerRef}
        className="max-w-2xl mx-auto pt-16 md:pt-24 pb-24 px-6 md:px-0"
      >
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-sans tracking-tight mb-12 break-words"
          style={{ color: titleColor }}
        >
          {articleTitle}
        </h1>

        <div className="space-y-8 text-lg md:text-xl leading-relaxed tracking-wide font-normal">
          {paragraphs.map((p) => (
            <p key={p.id}>
              {p.text.map((chunk, index) => {
                if (!chunk.highlight) {
                  return <span key={index}>{chunk.content}</span>;
                }

                const uniqueId = `${p.id}-${index}`;
                const isActive = activeHighlights[uniqueId];

                let textStyleClasses = "transition-all duration-500";
                let textStyle = {};
                let markerLineElement = null;

                if (isActive) {
                  if (style === "background") {
                    textStyleClasses += " px-1 rounded";
                    textStyle = {
                      backgroundColor: highlightColor,
                      color: highlightTextColor,
                    };
                  } else if (style === "half") {
                    textStyleClasses += " relative inline";
                    textStyle = { color: highlightTextColor };
                    markerLineElement = (
                      <span
                        className="absolute bottom-0.5 left-0 h-[0.45em] -z-10 transition-all duration-1000 ease-out origin-left w-full scale-x-100"
                        style={{ backgroundColor: highlightColor }}
                      />
                    );
                  } else if (style === "underline") {
                    textStyleClasses += " border-b-2";
                    textStyle = {
                      borderColor: highlightTextColor,
                      color: highlightTextColor,
                    };
                  }
                }

                return (
                  <span
                    key={index}
                    data-id={uniqueId}
                    className="text-highlight-wrapper relative inline"
                  >
                    <span className={textStyleClasses} style={textStyle}>
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
