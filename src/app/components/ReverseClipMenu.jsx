"use client";

import { useEffect, useId, useRef, useState } from "react";

// ─── ClipRevealMenu ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor              string   #090909    Page background color
// menuItemColor        string   #ffffff    Menu item text color
// menuAccentColor      string   #8b7cff    Hover accent (underline + index number)
// menuOverlayColor     string   rgba(0,0,0,0.55)  Vignette color drawn behind the open menu
// toggleColor          string   #ffffff    Toggle button icon + border color
// toggleBg             string   rgba(255,255,255,0.08)  Toggle button background
// title                array    ["Human","Zero"]  Lines rendered in the center title stack (hidden while menu is open)
// titleFontFamily      string   "'Unbounded', sans-serif"  Title font (loaded from Google Fonts automatically)
// titleFontSize        string   "clamp(2rem, 10vw, 9rem)"  Title font size (CSS clamp, runtime value)
// menuItems            array    [see DEFAULT_MENU_ITEMS]  Labels rendered as clip-reveal menu links
// menuFontFamily       string   "'Unbounded', sans-serif"  Menu item font (loaded from Google Fonts automatically)
// menuFontSize         string   "clamp(1.75rem, 6vw, 4rem)"  Menu item font size (CSS clamp, runtime value)
// images               array    [see DEFAULT_IMAGES]  Background images for the scattered cover grid
// gridColumns          number   20         Cover grid column count
// gridRows             number   10         Cover grid row count
// coverPositions       array    [see DEFAULT_POSITIONS]  [row, column] grid-area placement per cover image
// videoSrc             string   ""         Optional background video shown behind the open menu (skipped if empty)
// radialDistance       number   600        Distance (px) each cover item flies outward when the menu opens
// menuClipDelay        number   0.3        Timeline delay (s) before the clip-path reveal starts
// coverItemMaxDelay    number   0.3        Max stagger delay (s) applied to the farthest cover items
// fullCloseEase        string   "elastic.out(0.3)"  easeReverse used when closing from a fully open menu
// interruptSpeed       number   2          timeScale used when the toggle is clicked again mid-open (fast interrupted close)
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
];

const DEFAULT_POSITIONS = [
  [1, 2],
  [2, 6],
  [1, 10],
  [3, 14],
  [2, 17],
  [4, 4],
  [5, 8],
  [4, 12],
  [6, 16],
  [5, 19],
  [7, 3],
  [8, 7],
  [7, 11],
  [9, 15],
];

const DEFAULT_MENU_ITEMS = [
  "NEW GAME",
  "MISSIONS",
  "SKILLS",
  "QUEST LOG",
  "ABOUT PLAYER",
  "SETTINGS",
  "EXIT",
];

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

const loadFont = (href) => {
  if (document.querySelector(`link[data-id="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-id", href);
  document.head.appendChild(link);
};

const preloadImages = (srcs) =>
  Promise.all(
    srcs.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        }),
    ),
  );

const mapRange = (value, inMin, inMax, outMin, outMax) =>
  ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

const clampNum = (value, min, max) => Math.min(Math.max(value, min), max);

const getElementCenter = (element) => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

const getDistanceFromViewportCenter = (element) => {
  const center = getElementCenter(element);
  const viewportCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
  return Math.hypot(center.x - viewportCenter.x, center.y - viewportCenter.y);
};

const getRadialPosition = (element, distance) => {
  const center = getElementCenter(element);
  const viewportCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
  let dx = center.x - viewportCenter.x;
  let dy = center.y - viewportCenter.y;
  if (dx === 0 && dy === 0) {
    dx = 1;
    dy = 1;
  }
  const length = Math.hypot(dx, dy);
  return { x: (dx / length) * distance, y: (dy / length) * distance };
};

export default function ReverseClipMenu({
  bgColor = "#090909",
  menuItemColor = "#ffffff",
  menuAccentColor = "#8b7cff",
  menuOverlayColor = "rgba(0,0,0,0.55)",
  toggleColor = "#ffffff",
  toggleBg = "rgba(255,255,255,0.08)",
  title = ["Human", "Zero"],
  titleFontFamily = "'Unbounded', sans-serif",
  titleFontSize = "clamp(2rem, 10vw, 9rem)",
  menuItems = DEFAULT_MENU_ITEMS,
  menuFontFamily = "'Unbounded', sans-serif",
  menuFontSize = "clamp(1.75rem, 6vw, 4rem)",
  images = DEFAULT_IMAGES,
  gridColumns = 20,
  gridRows = 10,
  coverPositions = DEFAULT_POSITIONS,
  videoSrc = "",
  radialDistance = 600,
  menuClipDelay = 0.3,
  coverItemMaxDelay = 0.3,
  fullCloseEase = "elastic.out(0.3)",
  interruptSpeed = 2,
}) {
  const uid = useId().replace(/:/g, "");
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);
  const titleRef = useRef(null);
  const videoRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const coverItemRefs = useRef([]);
  const menuItemRefs = useRef([]);

  const isMenuOpenRef = useRef(false);
  const menuTimelineRef = useRef(null);

  useEffect(() => {
    loadFont(
      "https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;800&display=swap",
    );

    let cancelled = false;

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(() => preloadImages(images))
      .then(() => {
        if (cancelled) return;
        const { gsap } = window;
        if (!gsap || !menuRef.current) return;

        gsap.config({ trialWarn: false });
        setIsLoading(false);

        const menu = menuRef.current;
        const titleEl = titleRef.current;
        const coverItems = coverItemRefs.current.filter(Boolean);
        const menuLinkEls = menuItemRefs.current.filter(Boolean);
        const bgVideo = videoRef.current;

        const updateMenuInteractivity = () => {
          menu.setAttribute("aria-hidden", String(!isMenuOpenRef.current));
          menuLinkEls.forEach((item) => {
            item.tabIndex = isMenuOpenRef.current ? 0 : -1;
          });
        };

        const updateToggleA11y = () => {
          const btn = toggleButtonRef.current;
          if (!btn) return;
          btn.setAttribute("aria-expanded", String(isMenuOpenRef.current));
          btn.setAttribute(
            "aria-label",
            isMenuOpenRef.current ? "Close menu" : "Open menu",
          );
          updateMenuInteractivity();
        };

        const playBgVideo = () => bgVideo && bgVideo.play();
        const pauseBgVideo = () => bgVideo && bgVideo.pause();

        const createMenuTimeline = (reverseEase = fullCloseEase) => {
          const maxDistance = Math.hypot(
            window.innerWidth / 2,
            window.innerHeight / 2,
          );

          const tl = gsap.timeline({
            paused: true,
            onReverseComplete: pauseBgVideo,
          });
          tl.addLabel("start", 0);

          tl.to(
            menu,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 0.8,
              ease: "expo",
              easeReverse: reverseEase || true,
            },
            `start+=${menuClipDelay}`,
          );

          if (titleEl) {
            tl.to(
              titleEl,
              {
                opacity: 0,
                scale: 0.94,
                duration: 0.5,
                ease: "power2.out",
                easeReverse: reverseEase || true,
              },
              "start",
            );
          }

          coverItems.forEach((item) => {
            const distanceFromCenter = getDistanceFromViewportCenter(item);
            const progress = clampNum(distanceFromCenter / maxDistance, 0, 1);
            const delay = mapRange(progress, 0, 1, coverItemMaxDelay, 0);
            const { x, y } = getRadialPosition(item, radialDistance);

            tl.to(
              item,
              {
                x,
                y,
                opacity: 0,
                rotation: gsap.utils.random(-30, 30),
                duration: 0.7,
                ease: "expo",
                easeReverse: reverseEase || true,
              },
              `start+=${delay}`,
            );
          });

          return tl;
        };

        const rebuildMenuTimeline = ({
          progress = 0,
          reverseEase = fullCloseEase,
        } = {}) => {
          const safeProgress = clampNum(progress, 0, 1);

          if (menuTimelineRef.current) menuTimelineRef.current.revert();

          gsap.set(coverItems, { x: 0, y: 0, rotation: 0, opacity: 1 });
          if (titleEl) gsap.set(titleEl, { opacity: 1, scale: 1 });
          gsap.set(menu, {
            clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
          });

          menuTimelineRef.current = createMenuTimeline(reverseEase);
          menuTimelineRef.current.progress(safeProgress).pause();
        };

        const toggleMenu = () => {
          const currentProgress = menuTimelineRef.current.progress();
          const isFullyOpen = currentProgress >= 0.999;

          isMenuOpenRef.current = !isMenuOpenRef.current;
          updateToggleA11y();
          setIsOpen(isMenuOpenRef.current);

          if (isMenuOpenRef.current) {
            playBgVideo();
            menuTimelineRef.current.timeScale(1).play();
            return;
          }

          if (isFullyOpen) {
            rebuildMenuTimeline({ progress: 1, reverseEase: fullCloseEase });
            menuTimelineRef.current.timeScale(1).reverse();
            return;
          }

          rebuildMenuTimeline({ progress: currentProgress, reverseEase: true });
          menuTimelineRef.current.timeScale(interruptSpeed).reverse();
        };

        const handleKeydown = (event) => {
          if (event.key === "Escape" && isMenuOpenRef.current) {
            toggleMenu();
            toggleButtonRef.current?.focus();
          }
        };

        toggleButtonRef.current?.addEventListener("click", toggleMenu);
        document.addEventListener("keydown", handleKeydown);

        updateToggleA11y();
        rebuildMenuTimeline({ progress: 0, reverseEase: fullCloseEase });

        menuRef.current._cleanup = () => {
          toggleButtonRef.current?.removeEventListener("click", toggleMenu);
          document.removeEventListener("keydown", handleKeydown);
        };
      })
      .catch((e) => console.error("[ClipRevealMenu] Setup failed:", e.message));

    return () => {
      cancelled = true;
      if (menuTimelineRef.current) menuTimelineRef.current.kill();
      if (menuRef.current?._cleanup) menuRef.current._cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {isLoading && (
        <div
          className="fixed inset-0 z-[10000] pointer-events-none"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className={`${uid}-loader absolute top-1/2 left-1/2 w-[100px] h-[1px] -ml-[50px]`}
            style={{ backgroundColor: toggleColor }}
          />
        </div>
      )}

      <button
        ref={toggleButtonRef}
        type="button"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls={`${uid}-menu`}
        className="group absolute top-6 right-6 z-[1000] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95"
        style={{ backgroundColor: toggleBg, borderColor: `${toggleColor}33` }}
      >
        <span className="relative flex h-4 w-6 flex-col justify-between">
          <span
            className="h-[2px] w-full rounded-full transition-transform duration-300 ease-out"
            style={{
              backgroundColor: toggleColor,
              transform: isOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="h-[2px] w-full rounded-full transition-opacity duration-200 ease-out"
            style={{
              backgroundColor: toggleColor,
              opacity: isOpen ? 0 : 1,
            }}
          />
          <span
            className="h-[2px] w-full rounded-full transition-transform duration-300 ease-out"
            style={{
              backgroundColor: toggleColor,
              transform: isOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </span>
      </button>

      <div
        className="absolute inset-0 z-0 grid overflow-hidden pointer-events-none"
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        }}
      >
        {images.map((src, i) => {
          const [row, col] = coverPositions[i] || [1, 1];
          return (
            <div
              key={i}
              ref={(el) => (coverItemRefs.current[i] = el)}
              className="aspect-[4/5] w-full"
              style={{ gridArea: `${row} / ${col}` }}
            >
              <div
                className="h-full w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${src})` }}
              />
            </div>
          );
        })}
      </div>

      <div
        ref={titleRef}
        className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none"
      >
        {title.map((line, i) => (
          <span
            key={i}
            className="leading-[0.95] tracking-tight"
            style={{
              fontSize: titleFontSize,
              color: menuItemColor,
              fontFamily: titleFontFamily,
              fontWeight: 800,
            }}
          >
            {line}
          </span>
        ))}
      </div>

      <nav
        ref={menuRef}
        id={`${uid}-menu`}
        aria-hidden="true"
        className="relative z-[200] grid h-full w-full place-content-center justify-items-start gap-3 overflow-hidden pl-[8vw] sm:gap-5"
        style={{ clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" }}
      >
        {videoSrc && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            className="fixed inset-0 -z-10 h-full w-full object-cover pointer-events-none"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}

        <div
          className="pointer-events-none absolute inset-0 z-[250]"
          style={{
            background: `radial-gradient(ellipse at center, transparent 35%, ${menuOverlayColor} 100%)`,
          }}
        />

        {menuItems.map((item, i) => (
          <a
            key={i}
            ref={(el) => (menuItemRefs.current[i] = el)}
            tabIndex={-1}
            className="group/item relative z-[1] flex cursor-pointer select-none items-baseline gap-4"
          >
            <span
              className="text-sm font-medium tracking-widest opacity-0 transition-opacity duration-300 group-hover/item:opacity-100 sm:text-base"
              style={{ color: menuAccentColor, fontFamily: menuFontFamily }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="relative whitespace-nowrap font-normal leading-none tracking-tight transition-colors duration-300"
              style={{
                fontSize: menuFontSize,
                color: menuItemColor,
                fontFamily: menuFontFamily,
                fontWeight: 600,
              }}
            >
              {item}
              <span
                className="absolute -bottom-1 left-0 h-[3px] w-0 rounded-full transition-all duration-300 ease-out group-hover/item:w-full"
                style={{ backgroundColor: menuAccentColor }}
              />
            </span>
          </a>
        ))}
      </nav>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${uid}-loader {
              animation: ${uid}-loaderAnim 1.5s ease-in-out infinite alternate forwards;
            }
            @keyframes ${uid}-loaderAnim {
              0% { transform: scaleX(0); transform-origin: 0% 50%; }
              50% { transform: scaleX(1); transform-origin: 0% 50%; }
              50.1% { transform: scaleX(1); transform-origin: 100% 50%; }
              100% { transform: scaleX(0); transform-origin: 100% 50%; }
            }
          `,
        }}
      />
    </div>
  );
}
