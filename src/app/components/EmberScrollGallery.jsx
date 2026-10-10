"use client";

import { useEffect, useRef, useState, useId } from "react";

// ─── EmberScrollReel ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images              array    DEFAULT_IMAGES (10)          [{ src, alt, caption }] — omit to use the built-in set
// names               array    DEFAULT_NAMES (10)            Marquee names — omit to use the built-in set
// bgColor             string   #120705                       Page background
// textColor           string   #F5ECE7                       Base text color
// accentColor         string   #E2472B                       Ember accent — marquee, active index, glow
// mutedColor          string   #8C6156                       Inactive index numbers / captions
// itemAspectRatio     string   "4 / 5"                        CSS aspect-ratio for each frame (portrait, per this variant)
// itemWidthPx         number   340                            Max width of each frame (px)
// itemBorderRadius    number   2                              Corner rounding on each frame (px)
// itemGapRem          number   3                              Vertical space between stacked frames (rem)
// focusGlow           bool     true                            Pulse an ember glow + slight scale on the centered frame
// marqueeColor        string   #F5ECE7                        Marquee text color
// marqueeFontSize     string   "clamp(2rem, 15vw, 7.5rem)"     Marquee font-size
// blendMode           string   difference                      mix-blend-mode of the marquee layer
// shadowInColor       string   rgba(20,4,2,0.1)                 Center color of the vignette
// shadowOutColor      string   rgba(0,0,0,0.85)                 Edge color of the vignette
// amplitudeFactor     number   0.2                              Horizontal sine-wave spread, as a fraction of viewport width
// angleStep           number   0.45                             Radians added per item when placing them along the sine wave
// rotationXRange      [num,num] [240, 290]                      Min/max starting |rotationX| in degrees
// rotationZRange      [num,num] [-50, 50]                       Min/max starting rotationZ in degrees
// zAmplitude          number   300                              Max depth punch (px) applied mid-scroll per item
// zSnapPower          number   4                                Exponent sharpening the depth punch near the frame's center (higher = snappier)
// marginTopVh         number   28                               Space above the gallery (vh)
// marginBottomVh      number   38                               Space below the gallery (vh)
// showIndexRail       bool     true                             Show the numbered frame index beside each item
// showFrameCounter    bool     true                             Show the fixed "n / total" readout, bottom-right
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=1200&q=80",
    alt: "K2 summit under clear sky",
    caption: "K2",
  },
  {
    src: "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=1200&q=80",
    alt: "Monument Valley at golden hour",
    caption: "Monument Valley",
  },
  {
    src: "https://images.unsplash.com/photo-1546419793-1ee93d7cff56?auto=format&fit=crop&w=1200&q=80",
    alt: "Snow-covered alpine peak",
    caption: "The North Face",
  },
  {
    src: "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=1200&q=80",
    alt: "Aerial view of a valley surrounded by mountains",
    caption: "Kanas Valley",
  },
  {
    src: "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=1200&q=80",
    alt: "Seealpsee alpine lake, Switzerland",
    caption: "Seealpsee",
  },
  {
    src: "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=1200&q=80",
    alt: "Aerial view of a mountain at golden hour",
    caption: "Golden Ridge",
  },
  {
    src: "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=1200&q=80",
    alt: "Mount Everest ridgeline",
    caption: "Mount Everest",
  },
  {
    src: "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=1200&q=80",
    alt: "Mountains and tree range at golden hour",
    caption: "Hřensko",
  },
  {
    src: "https://images.unsplash.com/photo-1706341299879-4c52bd9c88fa?auto=format&fit=crop&w=1200&q=80",
    alt: "Aoraki Mount Cook, New Zealand",
    caption: "Aoraki",
  },
  {
    src: "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=1200&q=80",
    alt: "Golden sunrise over a foggy mountain range",
    caption: "Foggy Sunrise",
  },
  {
    src: "https://images.unsplash.com/photo-1765871319901-0aaafe3f1a2a?auto=format&fit=crop&w=1200&q=80",
    alt: "Misty forest valley with mountains in background",
    caption: "Misty Valley",
  },
  {
    src: "https://images.unsplash.com/photo-1754637024977-368665e88caf?auto=format&fit=crop&w=1200&q=80",
    alt: "Lush green valley with misty mountain peaks",
    caption: "Green Valley",
  },
  {
    src: "https://images.unsplash.com/photo-1756155129837-4291ad0e89c0?auto=format&fit=crop&w=1200&q=80",
    alt: "Misty forest covering a mountain slope, Falcade, Italy",
    caption: "Falcade",
  },
  {
    src: "https://images.unsplash.com/photo-1758642882005-447873fd2d29?auto=format&fit=crop&w=1200&q=80",
    alt: "Misty mountain slope covered in evergreen trees",
    caption: "Evergreen Slope",
  },
];

const DEFAULT_NAMES = [
  "Hinata Kuroda",
  "Reina Fujii",
  "Yuto Nakajima",
  "Ayaka Ueda",
  "Shoma Endo",
  "Nozomi Kaneko",
  "Kazuki Hara",
  "Mai Tsuchiya",
  "Ryota Ono",
  "Saki Hirano",
  "Haru Ishikawa",
  "Yui Kobayashi",
  "Kaito Yamaguchi",
  "Mio Sakamoto",
];

const SCRIPT_URLS = {
  gsap: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  scrollTrigger:
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  lenis: "https://unpkg.com/lenis@1.1.13/dist/lenis.min.js",
  imagesLoaded:
    "https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/5.0.0/imagesloaded.pkgd.min.js",
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-id="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-id", src);
    el.onload = resolve;
    el.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(el);
  });
}

const STYLE_ID = "ember-scroll-reel-styles";
const STYLE_RULES =
  "@keyframes esr-loader { 0% { transform: scaleX(0); transform-origin: 0% 50%; } " +
  "50% { transform: scaleX(1); transform-origin: 0% 50%; } " +
  "50.1% { transform: scaleX(1); transform-origin: 100% 50%; } " +
  "100% { transform: scaleX(0); transform-origin: 100% 50%; } } " +
  ".esr-frame { filter: saturate(0.7) brightness(0.85); " +
  "box-shadow: 0 0 0 0 rgba(226,71,43,0); " +
  "transition: filter 0.5s ease, box-shadow 0.5s ease, transform 0.5s ease; } " +
  ".esr-frame.is-focused { filter: saturate(1.1) brightness(1); " +
  "box-shadow: 0 0 60px 6px rgba(226,71,43,0.35); }";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE_RULES;
  document.head.appendChild(style);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function EmberScrollGallery({
  images = DEFAULT_IMAGES,
  names = DEFAULT_NAMES,
  bgColor = "#120705",
  textColor = "#F5ECE7",
  accentColor = "#E2472B",
  mutedColor = "#8C6156",
  itemAspectRatio = "4 / 5",
  itemWidthPx = 340,
  itemBorderRadius = 2,
  itemGapRem = 3,
  focusGlow = true,
  marqueeColor = "#F5ECE7",
  marqueeFontSize = "clamp(2rem, 15vw, 7.5rem)",
  blendMode = "difference",
  shadowInColor = "rgba(20,4,2,0.1)",
  shadowOutColor = "rgba(0,0,0,0.85)",
  amplitudeFactor = 0.2,
  angleStep = 0.45,
  rotationXRange = [240, 290],
  rotationZRange = [-50, 50],
  zAmplitude = 300,
  zSnapPower = 4,
  marginTopVh = 28,
  marginBottomVh = 38,
  showIndexRail = true,
  showFrameCounter = true,
}) {
  const uid = useId();
  const rootRef = useRef(null);
  const galleryRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const counterRef = useRef(null);
  const wrapRefs = useRef([]);
  const itemRefs = useRef([]);
  const indexRefs = useRef([]);
  const lenisRef = useRef(null);
  const triggersRef = useRef([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureStyles();
    let cancelled = false;
    let onResize = null;
    let tickerFn = null;

    async function init() {
      await loadScript(SCRIPT_URLS.gsap);
      await Promise.all([
        loadScript(SCRIPT_URLS.scrollTrigger),
        loadScript(SCRIPT_URLS.lenis),
        loadScript(SCRIPT_URLS.imagesLoaded),
      ]);
      if (cancelled) return;

      const { gsap, ScrollTrigger, Lenis, imagesLoaded } = window;
      if (!gsap || !ScrollTrigger || !Lenis || !imagesLoaded) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis();
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      tickerFn = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      function positionGalleryItems() {
        const amplitude = window.innerWidth * amplitudeFactor;
        wrapRefs.current.forEach((wrap, i) => {
          if (!wrap) return;
          const angle = i * angleStep;
          gsap.set(wrap, { x: Math.sin(angle) * amplitude });
        });
      }

      function initGalleryAnimation() {
        const [minX, maxX] = rotationXRange;
        const [minZ, maxZ] = rotationZRange;
        itemRefs.current.forEach((item, i) => {
          if (!item) return;
          const rotationX = gsap.utils.random(minX, maxX);
          const rotationY = gsap.utils.random(-20, 20);
          const rotationZ = gsap.utils.random(minZ, maxZ);
          const setZ = gsap.quickSetter(item, "z", "px");
          const label = indexRefs.current[i];

          const tween = gsap.fromTo(
            item,
            { rotationX, rotationY, rotationZ },
            {
              rotationX: -rotationX,
              rotationY: -rotationY,
              rotationZ: -rotationZ,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom+=20%",
                end: "bottom top-=20%",
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate(self) {
                  const z =
                    Math.pow(Math.sin(self.progress * Math.PI), zSnapPower) *
                    -zAmplitude;
                  setZ(z);
                  if (label)
                    label.style.opacity = String(
                      Math.sin(self.progress * Math.PI),
                    );
                },
              },
            },
          );
          triggersRef.current.push(tween.scrollTrigger);

          const focusTrigger = ScrollTrigger.create({
            trigger: item,
            start: "top center",
            end: "bottom center",
            onToggle(self) {
              if (self.isActive) {
                if (focusGlow) item.classList.add("is-focused");
                if (counterRef.current) {
                  counterRef.current.textContent = `${pad(i + 1)} / ${pad(images.length)}`;
                }
              } else if (focusGlow) {
                item.classList.remove("is-focused");
              }
            },
          });
          triggersRef.current.push(focusTrigger);
        });
      }

      function animateMarquee() {
        if (!marqueeInnerRef.current || !galleryRef.current) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: galleryRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
        tl.fromTo(
          marqueeInnerRef.current,
          { x: "100vw" },
          { x: "-100%", ease: "none" },
        );
        triggersRef.current.push(tl.scrollTrigger);
      }

      function boot() {
        positionGalleryItems();
        initGalleryAnimation();
        animateMarquee();
        setLoading(false);
      }

      imagesLoaded(galleryRef.current, { background: true }, boot);

      onResize = () => {
        positionGalleryItems();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);
    }

    init();

    return () => {
      cancelled = true;
      if (onResize) window.removeEventListener("resize", onResize);
      triggersRef.current.forEach((st) => st && st.kill());
      triggersRef.current = [];
      if (window.gsap && tickerFn) window.gsap.ticker.remove(tickerFn);
      if (lenisRef.current) lenisRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-x-clip"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "-0.01em",
      }}
    >
      {/* preloader */}
      <div
        className={
          "fixed inset-0 z-[10000] pointer-events-none transition-opacity duration-500 " +
          (loading ? "opacity-100" : "opacity-0")
        }
        aria-hidden={!loading}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: bgColor }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[100px] h-px -ml-[50px]"
          style={{
            backgroundColor: accentColor,
            animation: loading
              ? "esr-loader 1.5s ease-in-out infinite alternate forwards"
              : "none",
          }}
        />
      </div>

      {/* vignette */}
      <div
        className="fixed inset-0 z-[1000] pointer-events-none"
        style={{
          background: `radial-gradient(${shadowInColor} 10%, ${shadowOutColor} 85%)`,
        }}
      />

      {/* fine grain */}
      <div
        className="fixed inset-0 z-[999] pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* marquee */}
      <div
        className="fixed top-1/2 left-0 w-screen -translate-y-1/2 z-[1] overflow-hidden"
        style={{ mixBlendMode: blendMode }}
      >
        <div
          ref={marqueeInnerRef}
          className="flex gap-16 w-max relative will-change-transform"
        >
          {names.map((name, i) => (
            <span
              key={`${uid}-name-${i}`}
              className="whitespace-nowrap uppercase leading-none font-extrabold"
              style={{ color: marqueeColor, fontSize: marqueeFontSize }}
            >
              {name} {i < names.length - 1 ? "/" : ""}
            </span>
          ))}
        </div>
      </div>

      {/* frame counter */}
      {showFrameCounter && (
        <div
          className="fixed bottom-6 right-6 z-10 text-xs tabular-nums tracking-[0.15em]"
          style={{ fontFamily: "ui-monospace, monospace", color: mutedColor }}
        >
          <span ref={counterRef}>{`${pad(1)} / ${pad(images.length)}`}</span>
        </div>
      )}

      {/* gallery */}
      <div
        ref={galleryRef}
        className="relative flex flex-col items-center"
        style={{
          marginTop: `${marginTopVh}vh`,
          marginBottom: `${marginBottomVh}vh`,
        }}
      >
        {images.map((img, i) => (
          <div
            key={`${uid}-item-${i}`}
            ref={(el) => (wrapRefs.current[i] = el)}
            className="relative w-full"
            style={{
              maxWidth: `${itemWidthPx}px`,
              perspective: "900px",
              marginBottom: i < images.length - 1 ? `${itemGapRem}rem` : 0,
            }}
          >
            {showIndexRail && (
              <span
                ref={(el) => (indexRefs.current[i] = el)}
                className="absolute -left-2 -top-2 -translate-x-full text-xs tabular-nums tracking-[0.1em] hidden md:block"
                style={{
                  fontFamily: "ui-monospace, monospace",
                  color: accentColor,
                  opacity: 0,
                }}
              >
                {pad(i + 1)}
              </span>
            )}
            <div
              ref={(el) => (itemRefs.current[i] = el)}
              className="esr-frame w-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${img.src})`,
                aspectRatio: itemAspectRatio,
                borderRadius: `${itemBorderRadius}px`,
                transformStyle: "preserve-3d",
                willChange: "transform, filter",
              }}
              role="img"
              aria-label={img.alt ?? ""}
            />
            {img.caption && (
              <p
                className="mt-3 text-sm tracking-wide"
                style={{ color: mutedColor }}
              >
                {img.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
