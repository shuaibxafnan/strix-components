"use client";

import { useEffect, useRef, useState, useId } from "react";

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

const STYLE_RULES = `
@keyframes esr-loader { 0% { transform: scaleX(0); transform-origin: 0% 50%; } 50% { transform: scaleX(1); transform-origin: 0% 50%; } 50.1% { transform: scaleX(1); transform-origin: 100% 50%; } 100% { transform: scaleX(0); transform-origin: 100% 50%; } }
.esr-frame { filter: saturate(0.7) brightness(0.85); box-shadow: 0 0 0 0 rgba(226,71,43,0); transition: filter 0.5s ease, box-shadow 0.5s ease, transform 0.5s ease; }
.esr-frame.is-focused { filter: saturate(1.1) brightness(1); box-shadow: 0 0 60px 6px rgba(226,71,43,0.35); }
`;

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
  className = "",
}) {
  const uid = useId();
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
    let cancelled = false;
    let onResize = null;
    let tickerFn = null;
    let gsapRef = null;

    async function init() {
      const [gsapMod, stMod, lenisMod, ilMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
        import("imagesloaded"),
      ]);
      if (cancelled) return;

      const gsap = gsapMod.gsap || gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      const Lenis = lenisMod.default || lenisMod.Lenis;
      const imagesLoaded = ilMod.default;
      gsapRef = gsap;
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
      if (gsapRef && tickerFn) gsapRef.ticker.remove(tickerFn);
      if (lenisRef.current) lenisRef.current.destroy();
    };
  }, [images.length]);

  return (
    <div
      className={`relative w-full overflow-x-clip ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "-0.01em",
      }}
    >
      <style>{STYLE_RULES}</style>
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

      <div
        className="fixed inset-0 z-[1000] pointer-events-none"
        style={{
          background: `radial-gradient(${shadowInColor} 10%, ${shadowOutColor} 85%)`,
        }}
      />

      <div
        className="fixed inset-0 z-[999] pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

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

      {showFrameCounter && (
        <div
          className="fixed bottom-6 right-6 z-10 text-xs tabular-nums tracking-[0.15em]"
          style={{ fontFamily: "ui-monospace, monospace", color: mutedColor }}
        >
          <span ref={counterRef}>{`${pad(1)} / ${pad(images.length)}`}</span>
        </div>
      )}

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
