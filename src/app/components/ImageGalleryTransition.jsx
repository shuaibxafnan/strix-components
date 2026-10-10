"use client";

import { useState } from "react";

const DEFAULT_THUMBNAILS = [
  { src: "https://i.imgur.com/fr0t90i.png", alt: "Viola" },
  { src: "https://i.imgur.com/xreMn5b.png", alt: "Mathia" },
  { src: "https://i.imgur.com/cQvn0un.png", alt: "Arctica" },
  { src: "https://i.imgur.com/HnhJytt.png", alt: "Taria" },
];

export default function ImageGalleryTransition({
  mainImage: initialMain = "https://i.imgur.com/40tbu6l.png",
  thumbnails = DEFAULT_THUMBNAILS,
  heading = "Fluffy Philharmonic",
  description = "Select a performer",
}) {
  const [currentSrc, setCurrentSrc] = useState(thumbnails[0].src);
  const [activeName, setActiveName] = useState(thumbnails[0].alt);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleThumbnailClick = (e, src, alt, index) => {
    e.preventDefault();
    const update = () => {
      setCurrentSrc(src);
      setActiveName(alt);
      setActiveIndex(index);
    };
    if (!document.startViewTransition) {
      update();
      return;
    }
    document.startViewTransition(() => update());
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Josefin+Sans:wght@200;300&display=swap');

        .vt-gallery-root { font-family: 'Josefin Sans', sans-serif; }
        .vt-label { font-family: 'Cormorant Garamond', serif; font-style: italic; letter-spacing: 0.04em; }

        .vt-gallery-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 100;
          opacity: 0.6;
          mix-blend-mode: overlay;
        }

        .vt-main-img {
          view-transition-name: hero-image;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        ::view-transition-old(hero-image) { animation: vt-out 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        ::view-transition-new(hero-image) { animation: vt-in  0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        @keyframes vt-in  { from { opacity:0; transform:scale(1.04); } to { opacity:1; transform:scale(1); } }
        @keyframes vt-out { from { opacity:1; transform:scale(1);    } to { opacity:0; transform:scale(0.97); } }

        .vt-thumb {
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease, box-shadow 0.3s ease;
        }
        .vt-thumb:hover         { transform:scale(1.06); opacity:1 !important; box-shadow:0 0 0 1px #c9a96e; }
        .vt-thumb.active        { box-shadow:0 0 0 1.5px #c9a96e; opacity:1 !important; }

        @supports not (view-transition-name: hero-image) {
          .vt-unsupported::after {
            content: "View Transitions not supported in this browser.";
            position: fixed; top:0; left:0; right:0;
            text-align:center; padding:0.5em;
            background:#c9a96e; color:#000; font-size:12px; z-index:999;
          }
        }
      `}</style>

      <div className="vt-gallery-root vt-unsupported w-screen h-screen flex items-center justify-center bg-[#0a0a0a] text-[#e8e0d5] overflow-hidden">
        {/* radial glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,169,110,0.05)_0%,transparent_70%)]" />

        <div className="relative flex flex-col items-center gap-8 px-8 w-full max-w-[520px]">
          {/* heading */}
          <div className="flex flex-col items-center gap-1 w-full">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[rgba(232,224,213,0.35)]">
              {description}
            </p>
            <h1 className="vt-label text-[2rem] font-light text-[#e8e0d5]">
              {heading}
            </h1>
          </div>

          {/* gallery row */}
          <div className="flex gap-3 w-full">
            {/* main image */}
            <div className="relative overflow-hidden rounded-[3px] flex-1 aspect-square bg-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <img src={currentSrc} alt="Main" className="vt-main-img" />

              {/* bottom scrim */}
              <div className="absolute bottom-0 inset-x-0 h-2/5 pointer-events-none bg-gradient-to-t from-black/70 to-transparent" />

              {/* glassmorphism name badge */}
              <div className="absolute w-fit bottom-3 left-3 right-3 flex items-center gap-4 px-3 py-2 rounded-[4px] backdrop-blur-md bg-white/10 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <span className="vt-label text-[1.1rem] font-light text-[#e8e0d5] leading-none">
                  {activeName}
                </span>
                <span className="ml-auto w-1 h-1 rounded-full bg-[#c9a96e]" />
              </div>
            </div>

            {/* thumbnails */}
            <div className="flex flex-col justify-between gap-2">
              {thumbnails.map((thumb, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) =>
                    handleThumbnailClick(e, thumb.src, thumb.alt, i)
                  }
                  className="block overflow-hidden rounded-[3px] aspect-square bg-[#111] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  style={{ width: "calc((330px - 1.5em) / 4)" }}
                >
                  <img
                    src={thumb.src}
                    alt={thumb.alt}
                    className={`vt-thumb w-full h-full object-cover ${activeIndex === i ? "active" : "opacity-40"}`}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
