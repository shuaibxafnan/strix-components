"use client";

import { useId } from "react";

// ─── MarqueeMenu ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items              array    (see below)  Menu entries: { label, marquee, image }
// bgColor            string   #f8ecde      Page background
// textColor          string   #111         Counter / solid text color
// strokeColor        string   #000         Outline color of the menu labels
// strokeWidth        number   1.5          Outline thickness in px
// fontFamily         string   sans-serif   Font stack for labels and marquee
// itemFontSize       string   10vw         Label + marquee font size
// itemFontWeight     number   900          Label + marquee weight
// menuPaddingTop     string   10vh         Space above the menu
// menuPaddingBottom  string   25vh         Space below the menu
// itemPaddingX       string   5vw          Horizontal inset of each row
// marqueeWidth       string   100vw        Width of the marquee viewport
// marqueeOffset      string   20vw         Horizontal start offset of the strip
// marqueeDuration    number   5            Seconds for one marquee loop
// marqueeRepeat      number   4            Copies of the word inside the strip
// marqueeItalic      boolean  true         Italicize the marquee text
// marqueeBlendMode   string   color-burn   CSS mix-blend-mode of the marquee
// linkFadeDuration   number   0.1          Seconds for the label to fade out
// linkResetDuration  number   0.4          Seconds for the label to fade back
// imageHeight        string   50vh         Preview image height
// imageMaxHeight     string   400px        Preview image height cap
// imageOffsetX       string   6vw          Distance of the image from the right edge
// imageRotation      number   4            Degrees the image tilts on hover
// imageTransition    number   0.4          Seconds for the image reveal
// showCounter        boolean  true         Show the index number above each label
// counterFontSize    string   1rem         Index number size
// showGrain          boolean  true         Animated grain overlay
// grainOpacity       number   0.6          Grain overlay opacity
// grainDuration      number   8            Seconds for one grain animation cycle
// className          string   ""           Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    label: "Showreel",
    marquee: "Showreel",
    image:
      "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Case Studies",
    marquee: "Case Studies",
    image:
      "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Experiments",
    marquee: "Experiments",
    image:
      "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Our Crew",
    marquee: "The Crew",
    image:
      "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  },
  {
    label: "Contact",
    marquee: "Contact",
    image:
      "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  },
];

const GRAIN_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="220" height="220" filter="url(#n)" opacity="0.55"/></svg>`,
  );

export default function MarqueeMenu({
  items = DEFAULT_ITEMS,
  bgColor = "#f8ecde",
  textColor = "#111",
  strokeColor = "#000",
  strokeWidth = 1.5,
  fontFamily = "'Sofia Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  itemFontSize = "10vw",
  itemFontWeight = 900,
  menuPaddingTop = "10vh",
  menuPaddingBottom = "25vh",
  itemPaddingX = "5vw",
  marqueeWidth = "100vw",
  marqueeOffset = "20vw",
  marqueeDuration = 5,
  marqueeRepeat = 4,
  marqueeItalic = true,
  marqueeBlendMode = "color-burn",
  linkFadeDuration = 0.1,
  linkResetDuration = 0.4,
  imageHeight = "50vh",
  imageMaxHeight = "400px",
  imageOffsetX = "6vw",
  imageRotation = 4,
  imageTransition = 0.4,
  showCounter = true,
  counterFontSize = "1rem",
  showGrain = true,
  grainOpacity = 0.6,
  grainDuration = 8,
  className = "",
}) {
  const rawId = useId();
  const uid = `mm-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const css = `
#${uid} {
  --mm-marquee-width: ${marqueeWidth};
  --mm-offset: ${marqueeOffset};
  --mm-move-initial: calc(-25% + var(--mm-offset));
  --mm-move-final: calc(-50% + var(--mm-offset));
  --mm-font-size: ${itemFontSize};
  font-family: ${fontFamily};
  color: ${textColor};
  background-color: ${bgColor};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#${uid} .mm-grain {
  position: absolute;
  top: -100%;
  left: -50%;
  width: 300%;
  height: 300%;
  background-image: url("${GRAIN_URI}");
  opacity: ${grainOpacity};
  pointer-events: none;
  animation: ${uid}-grain ${grainDuration}s steps(10) infinite;
}
@keyframes ${uid}-grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  20% { transform: translate(-15%, 5%); }
  30% { transform: translate(7%, -25%); }
  40% { transform: translate(-5%, 25%); }
  50% { transform: translate(-15%, 10%); }
  60% { transform: translate(15%, 0%); }
  70% { transform: translate(0%, 15%); }
  80% { transform: translate(3%, 35%); }
  90% { transform: translate(-10%, 10%); }
}
#${uid} .mm-menu {
  padding: ${menuPaddingTop} 0 ${menuPaddingBottom};
  -webkit-touch-callout: none;
  user-select: none;
}
#${uid} .mm-item { padding: 0 ${itemPaddingX}; }
#${uid} .mm-link,
#${uid} .mm-marquee span {
  white-space: nowrap;
  font-size: var(--mm-font-size);
  padding: 0 1vw;
  font-weight: ${itemFontWeight};
  line-height: 1.15;
}
#${uid} .mm-link {
  -webkit-text-stroke: ${strokeWidth}px ${strokeColor};
  -webkit-text-fill-color: transparent;
  color: transparent;
  transition: opacity ${linkResetDuration}s;
}
#${uid} .mm-link:hover,
#${uid} .mm-link:focus-visible {
  transition-duration: ${linkFadeDuration}s;
  opacity: 0;
}
#${uid} .mm-counter {
  all: initial;
  font-family: ${fontFamily};
  font-size: ${counterFontSize};
  color: ${textColor};
  position: absolute;
  bottom: 60%;
  left: 0;
  pointer-events: none;
}
#${uid} .mm-img {
  position: absolute;
  height: ${imageHeight};
  max-height: ${imageMaxHeight};
  width: auto;
  opacity: 0;
  left: 100%;
  top: 50%;
  pointer-events: none;
  object-fit: cover;
  transform: translate3d(calc(-100% - ${imageOffsetX}), -30%, 0) translate3d(0, 20px, 0);
}
#${uid} .mm-link:hover + .mm-img,
#${uid} .mm-link:focus-visible + .mm-img {
  opacity: 1;
  transform: translate3d(calc(-100% - ${imageOffsetX}), -30%, 0) rotate3d(0, 0, 1, ${imageRotation}deg);
  transition: all ${imageTransition}s;
}
#${uid} .mm-marquee {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--mm-marquee-width);
  overflow: hidden;
  pointer-events: none;
  mix-blend-mode: ${marqueeBlendMode};
}
#${uid} .mm-marquee-inner {
  width: fit-content;
  display: flex;
  position: relative;
  transform: translate3d(var(--mm-move-initial), 0, 0);
  animation: ${uid}-marquee ${marqueeDuration}s linear infinite;
  animation-play-state: paused;
  opacity: 0;
  transition: opacity ${linkFadeDuration}s;
}
#${uid} .mm-link:hover ~ .mm-marquee .mm-marquee-inner,
#${uid} .mm-link:focus-visible ~ .mm-marquee .mm-marquee-inner {
  animation-play-state: running;
  opacity: 1;
  transition-duration: ${imageTransition}s;
}
#${uid} .mm-marquee span {
  text-align: center;
  font-style: ${marqueeItalic ? "italic" : "normal"};
}
@keyframes ${uid}-marquee {
  0% { transform: translate3d(var(--mm-move-initial), 0, 0); }
  100% { transform: translate3d(var(--mm-move-final), 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  #${uid} .mm-grain { animation: none; }
  #${uid} .mm-marquee-inner { animation-duration: 0s; }
}
`;

  return (
    <div
      id={uid}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {showGrain ? <div className="mm-grain" aria-hidden="true" /> : null}

      <nav className="mm-menu relative z-10">
        {items.map((item, i) => (
          <div className="mm-item relative" key={`${item.label}-${i}`}>
            <a
              href={item.href || undefined}
              className="mm-link relative inline-block cursor-pointer"
            >
              {showCounter ? (
                <span className="mm-counter" aria-hidden="true">
                  {i + 1}
                </span>
              ) : null}
              {item.label}
            </a>

            {item.image ? (
              <img
                src={item.image}
                alt=""
                aria-hidden="true"
                className="mm-img"
              />
            ) : null}

            <div className="mm-marquee">
              <div className="mm-marquee-inner" aria-hidden="true">
                {Array.from({ length: marqueeRepeat }).map((_, k) => (
                  <span key={k}>{item.marquee || item.label}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
