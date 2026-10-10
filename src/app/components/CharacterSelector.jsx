"use client";

import { useState, useRef } from "react";

// ─── CharacterSelector ──────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// characters           Character[]   See default below — list of {name, pic}
// imageBaseUrl         string        Base URL for character images
// imageExtension       string        ".png"    File extension for images
// fontFamily           string        "'Staatliches', sans-serif"  Caption font
// captionColor         string        "rgb(5,5,102)"  Character name color
// captionSize          string        "4rem"    Character caption font size
// captionTop           string        "5%"      Caption top offset
// captionLeft          string        "5%"      Caption left offset
// bgColor              string        "#fefefe" Page background color
// bgTexture            string|null   URL to a texture overlay image
// gridCols             number        8         Number of columns in selector grid
// gridColsMobile       number        4         Columns on screens ≤ 770px
// thumbBlurAmount      string        "0.05em"  Blur on non-hovered thumbnails
// thumbTranslateY      string        "20px"    Y-shift on non-hovered thumbnails
// thumbTranslateMobile string        "0px"     Y-shift override for mobile
// figureMixBlend       string        "multiply" CSS mix-blend-mode on figures
// figureZIndex         number        2         z-index for character figures
// asideZIndex          number        3         z-index for selector tray
// transitionDuration   string        "0.3s"    Hover transition on thumbnails
// containerMaxWidth    string        "1024px"  Max width of the container
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CHARACTERS = [
  { name: "Ryu", pic: "sf-ryu" },
  { name: "Ken", pic: "sf-ken" },
  { name: "Chun-Li", pic: "sf-chun-li" },
  { name: "Akuma", pic: "sf-akuma" },
  { name: "Dhalsim", pic: "sf-dhalsim" },
  { name: "Cammy", pic: "sf-cammy" },
  { name: "Bison", pic: "sf-bison" },
  { name: "Zangief", pic: "sf-zangief" },
];

const DEFAULT_BASE_URL =
  "http://sicontis.infinityfreeapp.com/codepen/cpc-css-has";

export default function CharacterSelector({
  characters = DEFAULT_CHARACTERS,
  imageBaseUrl = DEFAULT_BASE_URL,
  imageExtension = ".png",
  fontFamily = "'Staatliches', sans-serif",
  captionColor = "rgb(5, 5, 102)",
  captionSize = "4rem",
  captionTop = "5%",
  captionLeft = "5%",
  bgColor = "#fefefe",
  bgTexture = "https://www.transparenttextures.com/patterns/brushed-alum-dark.png",
  gridCols = 8,
  gridColsMobile = 4,
  thumbBlurAmount = "0.05em",
  thumbTranslateY = "20px",
  thumbTranslateMobile = "0px",
  figureMixBlend = "multiply",
  figureZIndex = 2,
  asideZIndex = 3,
  transitionDuration = "0.3s",
  containerMaxWidth = "1024px",
}) {
  const [selected, setSelected] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const imgUrl = (pic) => `${imageBaseUrl}/${pic}${imageExtension}`;

  return (
    <>
      {/* Google Font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Staatliches&display=swap"
      />

      <div
        className="min-h-screen grid place-items-center"
        style={{
          fontFamily,
          backgroundColor: bgColor,
          backgroundImage: bgTexture ? `url("${bgTexture}")` : undefined,
        }}
      >
        {/* Container */}
        <div
          className="w-full relative overflow-hidden"
          style={{ maxWidth: containerMaxWidth, height: "100%" }}
        >
          {/* Character figures */}
          <section
            className="absolute left-0 top-0 w-full"
            style={{ zIndex: figureZIndex }}
          >
            {characters.map((chr) => {
              const visible = selected === null || selected === chr.name;
              return (
                <figure
                  key={chr.name}
                  className="relative w-full"
                  style={{
                    display: visible ? "block" : "none",
                    mixBlendMode: figureMixBlend,
                  }}
                >
                  <img
                    src={imgUrl(chr.pic)}
                    alt={chr.name}
                    className="w-full"
                  />
                  <figcaption
                    className="absolute"
                    style={{
                      top: captionTop,
                      left: captionLeft,
                      fontSize: captionSize,
                      color: captionColor,
                    }}
                  >
                    {chr.name}
                  </figcaption>
                </figure>
              );
            })}
          </section>

          {/* Selector tray */}
          <aside
            className="fixed left-0 bottom-0 w-full"
            style={{ zIndex: asideZIndex }}
          >
            <ul
              className="list-none m-0 p-0"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              }}
            >
              {characters.map((chr, i) => {
                const isHoveredGroup = hoveredIndex !== null;
                const isThisHovered = hoveredIndex === i;
                const isSelected = selected === chr.name;

                const blurVal =
                  isHoveredGroup && !isThisHovered
                    ? `grayscale(1) blur(${thumbBlurAmount})`
                    : "none";

                const translateVal =
                  isHoveredGroup && !isThisHovered
                    ? `translateY(${thumbTranslateY})`
                    : "none";

                return (
                  <li
                    key={chr.name}
                    className="cursor-pointer"
                    style={{
                      transition: transitionDuration,
                      transformOrigin: "0 100%",
                      filter: blurVal,
                      transform: translateVal,
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() =>
                      setSelected(selected === chr.name ? null : chr.name)
                    }
                  >
                    <img
                      src={imgUrl(chr.pic)}
                      alt={chr.name}
                      className="w-full block"
                      style={{
                        outline: isSelected
                          ? "3px solid white"
                          : "3px solid transparent",
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>

      {/* Responsive overrides via <style> because Tailwind can't express
          dynamic column counts or mobile-specific prop-driven values */}
      <style>{`
        @media (max-width: 770px) {
          [data-char-grid] {
            grid-template-columns: repeat(${gridColsMobile}, 1fr) !important;
          }
          [data-char-thumb] {
            transform: translateY(${thumbTranslateMobile}) !important;
          }
        }
        @media (max-width: 500px) {
          [data-char-caption] {
            font-size: 3rem !important;
          }
        }
      `}</style>
    </>
  );
}
