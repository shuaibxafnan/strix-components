"use client";

import { useEffect, useRef, useState, useId } from "react";

// ─── ImpactFreezeScrollGallery ───────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// images              array    DEFAULT_IMAGES (14)          [{ src, alt, caption }] — omit to use the built-in set
// names               array    DEFAULT_NAMES (10)            Marquee names — omit to use the built-in set
// bgColor             string   #141414                       Page background (also mirrored onto html/body so overscroll can't reveal a mismatched color)
// textColor           string   #797979                       Base text color
// bodyFont            string   "'Inter', system-ui, sans-serif"          Base body/UI font
// marqueeFont         string   "'Space Grotesk', system-ui, sans-serif"  Marquee display font (stands in for the original's licensed variable font)
// itemAspectRatio     string   "4 / 5"                        CSS aspect-ratio for each frame
// itemWidthPx         number   300                            Max width of each frame (px)
// itemBorderRadius    number   0                              Corner rounding on each frame (px)
// itemGapRem          number   -10                            Vertical overlap between stacked frames (rem, negative = overlap — this variant's original is the deepest overlap of the five)
// marqueeColor        string   rgb(56, 56, 56)                 Marquee text color
// marqueeFontSize     string   "clamp(2rem, 16vw, 3rem)"       Marquee font-size (smallest of the five variants)
// blendMode           string   plus-lighter                    mix-blend-mode of the marquee layer
// shadowInColor       string   rgba(0,0,0,0.2)                 Center color of the vignette
// shadowOutColor      string   rgba(0,0,0,0.8)                 Edge color of the vignette
// amplitudeFactor     number   0.05                            Horizontal sine-wave spread, as a fraction of viewport width (tightest of the five)
// angleStep           number   0.9                             Radians added per item when placing them along the sine wave
// rotationXRange      [num,num] [130, 220]                     Min/max starting |rotationX| in degrees
// rotationZ           number   -50                              Fixed rotationZ swing (± this value), unlike the other variants' randomized Z
// holdFraction        number   0.25                             Fraction of the scroll progress held flat at the centered pose before easing onward
// zAmplitude          number   750                              Max depth punch (px) at the centered pose — far deeper than the other variants
// blurMax             number   12                               Blur (px) applied away from the centered pose
// scaleXExtra         number   0.6                              Extra horizontal stretch added away from center
// scaleYBase          number   0.5                              Minimum vertical scale (squash) at the extremes
// scaleYExtra         number   0.5                              Additional vertical scale restored at center
// brightnessPower     number   6                                Exponent shaping the brightness pulse at center (higher = sharper flash)
// marginTopVh         number   25                               Space above the gallery (vh)
// marginBottomVh      number   35                               Space below the gallery (vh)
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
];

const DEFAULT_NAMES = [
  "Haru Fujita",
  "Airi Matsuda",
  "Renji Yokoyama",
  "Misuzu Ota",
  "Takuma Hori",
  "Nao Kimura",
  "Shun Morita",
  "Kaede Nagasawa",
  "Yusei Imai",
  "Mao Kurihara",
  "Haru Fujita",
  "Airi Matsuda",
  "Renji Yokoyama",
  "Misuzu Ota",
  "Takuma Hori",
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

const STYLE_ID = "impact-freeze-scroll-gallery-styles";
const STYLE_RULES =
  "@keyframes ifg-loader { 0% { transform: scaleX(0); transform-origin: 0% 50%; } " +
  "50% { transform: scaleX(1); transform-origin: 0% 50%; } " +
  "50.1% { transform: scaleX(1); transform-origin: 100% 50%; } " +
  "100% { transform: scaleX(0); transform-origin: 100% 50%; } }";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE_RULES;
  document.head.appendChild(style);
}

const FONT_LINK_ID = "impact-freeze-scroll-gallery-fonts";

function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&display=swap";
  document.head.appendChild(link);
}

function syncDocumentBackground(color) {
  if (typeof document === "undefined") return () => {};
  const { documentElement, body } = document;
  const prevHtml = documentElement.style.backgroundColor;
  const prevBody = body.style.backgroundColor;
  documentElement.style.backgroundColor = color;
  body.style.backgroundColor = color;
  return () => {
    documentElement.style.backgroundColor = prevHtml;
    body.style.backgroundColor = prevBody;
  };
}

function holdAtMiddle(gsapInstance, progress, hold) {
  const half = hold * 0.5;
  if (progress < 0.5 - half) {
    return gsapInstance.utils.mapRange(0, 0.5 - half, 0, 0.5, progress);
  }
  if (progress > 0.5 + half) {
    return gsapInstance.utils.mapRange(0.5 + half, 1, 0.5, 1, progress);
  }
  return 0.5;
}

export default function ImpactFreezeScrollGallery({
  images = DEFAULT_IMAGES,
  names = DEFAULT_NAMES,
  bgColor = "#141414",
  textColor = "#797979",
  bodyFont = "'Inter', system-ui, sans-serif",
  marqueeFont = "'Space Grotesk', system-ui, sans-serif",
  itemAspectRatio = "4 / 5",
  itemWidthPx = 300,
  itemBorderRadius = 0,
  itemGapRem = -5,
  marqueeColor = "rgb(56, 56, 56)",
  marqueeFontSize = "clamp(2rem, 16vw, 3rem)",
  blendMode = "plus-lighter",
  shadowInColor = "rgba(0,0,0,0.2)",
  shadowOutColor = "rgba(0,0,0,0.8)",
  amplitudeFactor = 0.05,
  angleStep = 0.9,
  rotationXRange = [130, 220],
  rotationZ = -50,
  holdFraction = 0.25,
  zAmplitude = 750,
  blurMax = 12,
  scaleXExtra = 0.6,
  scaleYBase = 0.5,
  scaleYExtra = 0.5,
  brightnessPower = 6,
  marginTopVh = 25,
  marginBottomVh = 35,
}) {
  const uid = useId();
  const rootRef = useRef(null);
  const galleryRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const wrapRefs = useRef([]);
  const itemRefs = useRef([]);
  const lenisRef = useRef(null);
  const triggersRef = useRef([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureStyles();
    ensureFonts();
    const restoreDocumentBackground = syncDocumentBackground(bgColor);
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
        itemRefs.current.forEach((item) => {
          if (!item) return;
          const rotationX = gsap.utils.random(minX, maxX);
          const setTransform = gsap.quickSetter(item, "css");
          const setFilter = gsap.quickSetter(item, "filter");

          const st = ScrollTrigger.create({
            trigger: item,
            start: "top bottom+=20%",
            end: "bottom top-=20%",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate(self) {
              const t = holdAtMiddle(gsap, self.progress, holdFraction);

              const rX = gsap.utils.interpolate(-rotationX, rotationX, t);
              const rZ = gsap.utils.interpolate(-rotationZ, rotationZ, t);
              const z = Math.sin(t * Math.PI) * -zAmplitude;
              const blur = Math.pow(Math.cos(t * Math.PI), 2) * blurMax;
              const scaleX =
                1 + Math.pow(Math.cos(t * Math.PI), 2) * scaleXExtra;
              const scaleY =
                scaleYBase + Math.pow(Math.sin(t * Math.PI), 2) * scaleYExtra;
              const brightness = Math.pow(
                Math.sin(t * Math.PI),
                brightnessPower,
              );

              setTransform({ scaleX, scaleY, rotationX: rX, rotationZ: rZ, z });
              setFilter(`blur(${blur}px) brightness(${brightness})`);
            },
          });
          triggersRef.current.push(st);
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
      restoreDocumentBackground();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, bgColor]);

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-x-clip"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
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
            backgroundColor: textColor,
            animation: loading
              ? "ifg-loader 1.5s ease-in-out infinite alternate forwards"
              : "none",
          }}
        />
      </div>

      {/* vignette */}
      <div
        className="fixed inset-0 z-[1000] pointer-events-none"
        style={{
          background: `radial-gradient(${shadowInColor} 10%, ${shadowOutColor} 80%)`,
        }}
      />

      {/* marquee */}
      <div
        className="fixed top-1/2 left-0 w-screen -translate-y-1/2 z-[1] overflow-hidden"
        style={{ mixBlendMode: blendMode }}
      >
        <div
          ref={marqueeInnerRef}
          className="flex gap-12 w-max relative will-change-transform"
        >
          {names.map((name, i) => (
            <span
              key={`${uid}-name-${i}`}
              className="whitespace-nowrap uppercase leading-none font-bold"
              style={{
                color: marqueeColor,
                fontSize: marqueeFontSize,
                fontFamily: marqueeFont,
              }}
            >
              {name} {i < names.length - 1 ? "/" : ""}
            </span>
          ))}
        </div>
      </div>

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
            className="w-full"
            style={{
              maxWidth: `${itemWidthPx}px`,
              perspective: "900px",
              marginBottom: i < images.length - 1 ? `${itemGapRem}rem` : 0,
            }}
          >
            <div
              ref={(el) => (itemRefs.current[i] = el)}
              className="w-full bg-cover bg-center bg-no-repeat"
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
          </div>
        ))}
      </div>
    </div>
  );
}
