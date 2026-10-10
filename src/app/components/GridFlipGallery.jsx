"use client";

import { useEffect, useId, useRef } from "react";

// ─── GridFlipGallery ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images            string[] [25 unsplash urls]  Image URLs for gallery items (cycles if fewer than items)
// items             array    [see DEFAULT_ITEMS]  Array of { aspect, label } objects, one per grid cell
// bgColor           string   #0e0e0e    Gallery background color
// textColor         string   #b0b0b0    Default label/text color
// gap               string   "1.5rem"   Gap between grid items (Tailwind arbitrary value)
// maxWidth          string   "1200px"   Max width of the gallery container
// sizes             array    ["50%","75%","100%","125%","150%"]  Available grid-size presets (controls column count)
// columnsMap        object   { "50%":16, "75%":10, "100%":8, "125%":6, "150%":4 }  Column count per preset (desktop)
// defaultSize       string   "75%"      Initially active preset
// flipDuration      number   1          GSAP Flip animation duration (s)
// staggerAmount     number   0.3        Total stagger spread across items (s)
// ease              string   "expo.inOut"  Flip animation easing
// imageBrightness   number   0.8        Default (non-hover) image brightness filter
// hoverBrightness   number   1          Image brightness on hover
// showButtons       boolean  true       Whether to render the size-toggle button bar
// buttonActiveBg    string   #b0b0b0    Active button background
// buttonActiveText  string   #0e0e0e    Active button text color
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_ITEMS = [
  { aspect: "1 / 1", label: "01" },
  { aspect: "4 / 5", label: "02" },
  { aspect: "16 / 9", label: "03" },
  { aspect: "3 / 4", label: "04" },
  { aspect: "5 / 4", label: "05" },
  { aspect: "1 / 1", label: "06" },
  { aspect: "4 / 5", label: "07" },
  { aspect: "1 / 1", label: "08" },
  { aspect: "4 / 3", label: "09" },
  { aspect: "5 / 7", label: "10" },
  { aspect: "3 / 2", label: "11" },
  { aspect: "1 / 1", label: "12" },
  { aspect: "16 / 9", label: "13" },
  { aspect: "5 / 3", label: "14" },
  { aspect: "4 / 5", label: "15" },
  { aspect: "1 / 1", label: "16" },
  { aspect: "3 / 4", label: "17" },
  { aspect: "1 / 1", label: "18" },
  { aspect: "5 / 7", label: "19" },
  { aspect: "4 / 3", label: "20" },
  { aspect: "4 / 5", label: "21" },
  { aspect: "4 / 5", label: "22" },
  { aspect: "1 / 1", label: "23" },
  { aspect: "4 / 5", label: "24" },
  { aspect: "4 / 3", label: "25" },
];

const DEFAULT_COLUMNS_MAP = {
  "50%": 16,
  "75%": 10,
  "100%": 8,
  "125%": 6,
  "150%": 4,
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-id="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-id", src);
    el.onload = resolve;
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });

export default function GridFlipGallery({
  images = DEFAULT_IMAGES,
  items = DEFAULT_ITEMS,
  bgColor = "#0e0e0e",
  textColor = "#b0b0b0",
  gap = "1.5rem",
  maxWidth = "1200px",
  sizes = ["50%", "75%", "100%", "125%", "150%"],
  columnsMap = DEFAULT_COLUMNS_MAP,
  defaultSize = "75%",
  flipDuration = 1,
  staggerAmount = 0.3,
  ease = "expo.inOut",
  imageBrightness = 0.8,
  hoverBrightness = 1,
  showButtons = true,
  buttonActiveBg = "#b0b0b0",
  buttonActiveText = "#0e0e0e",
}) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const currentSizeRef = useRef(defaultSize);
  const animatedRef = useRef(false);
  const gsapReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
      ),
    ])
      .then(() => {
        if (cancelled) return;
        const { gsap } = window;
        if (!gsap || !gsap.registerPlugin) return;
        gsap.registerPlugin(window.Flip);
        gsap.config({ trialWarn: false });
        gsapReadyRef.current = true;
      })
      .catch((e) =>
        console.error("[GridFlipGallery] Script load failed:", e.message),
      );

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSizeClick = (size) => {
    if (animatedRef.current) return;
    if (size === currentSizeRef.current) return;
    if (!gsapReadyRef.current) return;

    const { gsap, Flip } = window;
    if (!gsap || !Flip) return;

    const allItems = itemRefs.current.filter(Boolean);
    const state = Flip.getState(allItems);

    animatedRef.current = true;
    currentSizeRef.current = size;

    if (containerRef.current) {
      containerRef.current.setAttribute("data-size-grid", size);
      containerRef.current.style.gridTemplateColumns = `repeat(${
        columnsMap[size] || 10
      }, 1fr)`;
    }

    const totalFlipDuration = flipDuration + staggerAmount;

    Flip.from(state, {
      absolute: true,
      duration: flipDuration,
      ease,
      onComplete: () => {
        animatedRef.current = false;
      },
      stagger: {
        amount: staggerAmount,
        from: "random",
      },
    }).fromTo(
      containerRef.current,
      {
        filter: "blur(0px) brightness(100%)",
        willChange: "filter",
      },
      {
        duration: totalFlipDuration,
        keyframes: [
          {
            filter: "blur(10px) brightness(200%)",
            duration: totalFlipDuration * 0.5,
            ease: "power2.in",
          },
          {
            filter: "blur(0px) brightness(100%)",
            duration: totalFlipDuration * 0.5,
            ease: "power2",
            delay: 0.5,
          },
        ],
      },
      0,
    );

    if (typeof window !== "undefined") {
      document
        .querySelectorAll(`[data-grid-btn="${uid}"]`)
        .forEach((btn) => btn.classList.remove("active-btn"));
      const activeBtn = document.querySelector(
        `[data-grid-btn="${uid}"][data-size="${size}"]`,
      );
      if (activeBtn) activeBtn.classList.add("active-btn");
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center gap-10 px-6 py-10"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {showButtons && (
        <div className="flex items-center gap-px bg-[#4c4c4c] border border-[#4c4c4c] rounded-2xl overflow-hidden">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              data-grid-btn={uid}
              data-size={size}
              onClick={() => handleSizeClick(size)}
              className={`text-[1.1rem] px-4 py-3 bg-black transition-colors duration-200 ${
                size === defaultSize ? "active-btn" : ""
              }`}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("active-btn")) {
                  e.currentTarget.style.backgroundColor = bgColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains("active-btn")) {
                  e.currentTarget.style.backgroundColor = "#000";
                }
              }}
            >
              {size}
            </button>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        data-size-grid={defaultSize}
        className="relative grid w-full"
        style={{
          gap,
          maxWidth,
          gridTemplateColumns: `repeat(${columnsMap[defaultSize] || 10}, 1fr)`,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="flex flex-col"
          >
            <div
              className="w-full bg-cover bg-center transition-[filter] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              style={{
                aspectRatio: item.aspect,
                backgroundImage: `url(${images[i % images.length]})`,
                filter: `brightness(${imageBrightness})`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = `brightness(${hoverBrightness})`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = `brightness(${imageBrightness})`)
              }
            />
            <p className="text-[0.6745rem] text-left uppercase mt-1">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          [data-grid-btn="${uid}"].active-btn {
            background-color: ${buttonActiveBg} !important;
            color: ${buttonActiveText} !important;
          }
        `,
        }}
      />
    </div>
  );
}
