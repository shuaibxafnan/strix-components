"use client";

import { useEffect, useState, useMemo } from "react";

// ─── NextGenFilterGallery ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// initialItems       array     [...]             List of grid cards with captions
// title              string    "COLLECTIONS"     Main page bold heading
// placeholderText    string    "Explore..."      Input field placeholder hint
// bgColor            string    "#08080a"         Deep body backdrop canvas paint
// highlightColor     string    "text-[#00ff66]"  Active highlight micro accent
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_GALLERY_ITEMS = [
  {
    src: "https://images.pexels.com/photos/2356059/pexels-photo-2356059.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    caption:
      "The great thing about reaching the top of the mountain is realising that there’s space for more than one person. And you’re now in the prime position to help others up.",
    title: "Hay Bales",
    category: "CULTURE",
  },
  {
    src: "https://images.pexels.com/photos/814499/pexels-photo-814499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    caption:
      "A lake is a landscape’s most beautiful and expressive feature. It is Earth’s eye; looking into which the beholder measures the depth of his own nature.",
    title: "Lake",
    category: "AQUATIC",
  },
  {
    src: "https://images.pexels.com/photos/2775196/pexels-photo-2775196.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    caption:
      "The human desire to obtain more is a sieve that can never be filled with all the water from the world’s oceans",
    title: "Canyon",
    category: "TERRAIN",
  },
  {
    src: "https://images.pexels.com/photos/20045/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    caption:
      "Knowing trees, I understand the meaning of patience. Knowing grass, I can appreciate persistence.",
    title: "Iceberg",
    category: "GLACIAL",
  },
  {
    src: "https://images.pexels.com/photos/6004828/pexels-photo-6004828.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    caption: "Life is like a train track, full of possibilities and happiness",
    title: "Desert",
    category: "WASTELAND",
  },
  {
    src: "https://images.pexels.com/photos/1533060/pexels-photo-1533060.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    caption:
      "Hell is a swamp, to me - not as something fiery, but as something dank, moist, and wet",
    title: "Fall",
    category: "SEASONAL",
  },
];

export default function ImageFilterGallery({
  initialItems = DEFAULT_GALLERY_ITEMS,
  title = "DESIGN COLLECTIONS",
  placeholderText = "Type to filter: mountain, lake, ocean, tree...",
  bgColor = "#08080a",
  highlightColor = "text-[#00ff66]",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleItems, setVisibleItems] = useState(initialItems);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadStyles = () => {
      if (document.getElementById("baguettebox-css")) return;
      const link = document.createElement("link");
      link.id = "baguettebox-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/baguettebox.js/1.11.1/baguetteBox.min.css";
      document.head.appendChild(link);
    };

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.baguetteBox) return resolve();
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/baguettebox.js/1.11.1/baguetteBox.min.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    loadStyles();
    loadScript().then(() => {
      if (window.baguetteBox) {
        window.baguetteBox.run(".nextgen-gallery-grid", {
          captions: true,
          buttons: "auto",
          animation: "fadeIn",
        });
      }
    });
  }, [visibleItems]);

  useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const matches = initialItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.caption.toLowerCase().includes(query),
    );

    setIsTransitioning(true);

    const handler = setTimeout(() => {
      setVisibleItems(matches);
      setIsTransitioning(false);
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery, initialItems]);

  return (
    <main
      className="min-h-screen w-full antialiased text-neutral-300 font-sans pb-32 pt-12 relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Decorative Minimal Layout Grids */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute left-12 top-0 bottom-0 w-px bg-white/[0.01] hidden lg:block" />
      <div className="absolute right-12 top-0 bottom-0 w-px bg-white/[0.01] hidden lg:block" />

      {/* Floating Interactive Search HUD */}
      <div className="w-full max-w-6xl mx-auto px-6 mb-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
        <div>
          <span className="text-[10px] tracking-[0.4em] text-neutral-500 block mb-2 font-mono">
            // INDEX DISCOVERY
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">
            {title}
          </h1>
        </div>

        <div className="w-full md:w-auto relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholderText}
            className="w-full md:w-[400px] h-12 pl-5 pr-12 text-sm bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-full outline-none text-white tracking-wide transition-all duration-300 focus:border-white/30 focus:shadow-[0_0_30px_rgba(255,255,255,0.03)] placeholder:text-neutral-600"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${searchQuery ? "bg-[#00ff66]" : "bg-white/20"}`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${searchQuery ? "bg-[#00ff66]" : "bg-white/30"}`}
            ></span>
          </span>
        </div>
      </div>

      {/* Fluid Grid Canvas Frame */}
      <div className="w-full max-w-6xl mx-auto px-6">
        {/* Enforced grid-auto-rows-[auto] along with items-start prevents card height stretching */}
        <article className="nextgen-gallery-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start grid-auto-rows-[auto] min-h-[400px]">
          {visibleItems.map((item, index) => (
            <a
              key={`${item.title}-${index}`}
              href={item.src}
              data-caption={item.caption}
              title={item.title}
              className={`group block relative bg-neutral-900/20 border border-white/[0.04] p-4 rounded-xl hover:bg-neutral-900/60 hover:border-white/10 cursor-pointer overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-all duration-500 ease-out h-auto ${
                isTransitioning
                  ? "opacity-0 scale-95 translate-y-4 filter blur-sm"
                  : "opacity-100 scale-100 translate-y-0 filter blur-none"
              }`}
              style={{
                transitionDelay: `${index * 30}ms`,
              }}
            >
              {/* Image Frame Canvas Wrap */}
              <div className="w-full aspect-[4/3] overflow-hidden rounded-lg relative mb-4 bg-neutral-950">
                <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 ease-out"
                />

                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-[9px] font-mono tracking-widest text-white/70 px-2.5 py-1 rounded-md border border-white/5 z-20">
                  {item.category || "VISUAL"}
                </span>
              </div>

              {/* Lower Text Footprint Metadata */}
              <div className="flex justify-between items-center px-1">
                <div>
                  <span className="text-[10px] font-mono text-neutral-600 block mb-0.5">
                    TITLE // 0{index + 1}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-neutral-300 group-hover:text-white transition-colors duration-300">
                    {item.title}
                  </h3>
                </div>
                <div
                  className={`text-xs font-mono opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-500 ${highlightColor}`}
                >
                  VIEW →
                </div>
              </div>
            </a>
          ))}
        </article>

        {/* Empty Search Fallback State */}
        {visibleItems.length === 0 && !isTransitioning && (
          <div className="text-center py-24 border border-dashed border-white/5 rounded-2xl bg-neutral-900/10 backdrop-blur-sm max-w-xl mx-auto transition-all duration-500 animate-fadeIn">
            <span className="text-2xl block mb-2">✦</span>
            <p className="text-sm font-mono text-neutral-500 uppercase tracking-widest">
              No matching collections indexed
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
