"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    id: 1,
    title: "SERENE WATERS",
    tag: "LANDSCAPE",
    image: "https://picsum.photos/id/192/700/1400",
  },
  {
    id: 2,
    title: "URBAN COMPLEXITY",
    tag: "ARCHITECTURE",
    image: "https://picsum.photos/id/209/700/1400",
  },
  {
    id: 3,
    title: "MINIMALIST FORMS",
    tag: "STUDIO",
    image: "https://picsum.photos/id/175/700/1400",
  },
  {
    id: 4,
    title: "CYAN HORIZONS",
    tag: "CONCEPTUAL",
    image: "https://picsum.photos/id/302/700/1400",
  },
];

export default function SlideUpImageGallery({
  items = DEFAULT_ITEMS,
  heading = "EXPLORE DISCOVERIES",
  subheading = "VOL. 26 — ISSUE IV",
  label = "[ SELECTED SCENICS ]",
  backLabel = "RETURN TO INDEX",
  gridBg = "bg-neutral-950",
  transitionOverlayBg = "bg-white",
  titleColor = "text-white",
  subTitleColor = "text-neutral-500",
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let cleanups = [];
    let gsapRef = null;

    (async () => {
      const { gsap } = await import("gsap");
      if (cancelled || !containerRef.current) return;
      gsapRef = gsap;

      const root = containerRef.current;
      const gridItems = Array.from(root.querySelectorAll(".js-grid-item"));
      const backBtn = root.querySelector(".js-content-back");
      const overlayPanel = root.querySelector(".js-transition-overlay");
      const fullContentView = root.querySelector(".js-full-content");

      gridItems.forEach((el) => {
        const title = el.querySelector(".js-grid-title");
        const image = el.querySelector(".js-grid-image");

        const state = {
          offsetX: el.offsetLeft,
          offsetY: el.offsetTop,
          elWidth: el.offsetWidth,
          elHeight: el.offsetHeight,
        };

        const handleMouseMove = (e) => {
          const mouseX = e.clientX - state.offsetX - state.elWidth / 2;
          const mouseY = e.clientY - state.offsetY - state.elHeight / 2;

          gsap.to(title, { duration: 1, x: mouseX * 0.06, y: mouseY * 0.04 });
          gsap.to(image, { duration: 1, x: mouseX * 0.03, y: mouseY * 0.03 });
        };

        const handleMouseLeave = () => {
          gsap.to([title, image], { duration: 1, x: 0, y: 0 });
        };

        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);

        cleanups.push(() => {
          el.removeEventListener("mousemove", handleMouseMove);
          el.removeEventListener("mouseleave", handleMouseLeave);
        });
      });

      const onItemClick = (index) => {
        const selectedImgUrl = items[index].image;
        fullContentView.style.backgroundImage = `url(${selectedImgUrl})`;

        const tl = gsap.timeline();

        gridItems.forEach((el) => {
          tl.to(
            el,
            {
              duration: 0.65 + Math.random() * 0.2,
              y: `-${window.innerHeight}px`,
              ease: "power4.in",
            },
            0,
          );
        });

        tl.fromTo(
          overlayPanel,
          { y: "100%" },
          { duration: 0.7, y: "0%", ease: "power4.inOut" },
          "-=0.25",
        );

        tl.to(overlayPanel, {
          duration: 0.5,
          y: "-100%",
          ease: "power3.inOut",
        });
        tl.to(
          fullContentView,
          { duration: 0.85, y: "-100%", ease: "power4.out" },
          "-=0.3",
        );
      };

      gridItems.forEach((el, index) => {
        const clickHandler = () => onItemClick(index);
        el.addEventListener("click", clickHandler);
        cleanups.push(() => el.removeEventListener("click", clickHandler));
      });

      const onBackClick = (e) => {
        e.preventDefault();
        gsap.to(fullContentView, {
          duration: 0.85,
          y: `${window.innerHeight}px`,
          ease: "power4.inOut",
        });

        gridItems.forEach((el) => {
          gsap.to(el, {
            duration: 1 + Math.random() * 0.4,
            y: "0px",
            ease: "power4.inOut",
          });
        });
      };

      backBtn.addEventListener("click", onBackClick);
      cleanups.push(() => backBtn.removeEventListener("click", onBackClick));
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      cleanups = [];
      if (gsapRef && containerRef.current) {
        const root = containerRef.current;
        gsapRef.killTweensOf(
          root.querySelectorAll(
            ".js-grid-item, .js-grid-title, .js-grid-image, .js-transition-overlay, .js-full-content",
          ),
        );
      }
    };
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden select-none font-sans antialiased ${gridBg} ${className}`}
    >
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div
        className={`absolute inset-0 z-20 translate-y-full backdrop-blur-xl border-t border-white/10 js-transition-overlay ${transitionOverlayBg}`}
      />

      <div className="absolute top-0 inset-x-0 z-10 flex justify-between items-center p-12 pointer-events-none">
        <div className="flex flex-col gap-1">
          <h2
            className={`text-xs tracking-[0.3em] font-medium uppercase ${titleColor}`}
          >
            {heading}
          </h2>
          <p
            className={`text-[11px] font-mono tracking-wider ${subTitleColor}`}
          >
            {subheading}
          </p>
        </div>
        <div className={`text-xs font-mono tracking-widest ${subTitleColor}`}>
          {label}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-screen flex items-end justify-center px-12 box-border gap-6 max-w-7xl mx-auto">
        {items.map((item, idx) => {
          let wrapperHeightClass = "h-[45vh]";
          if (idx === 1) wrapperHeightClass = "h-[58vh]";
          if (idx === 2) wrapperHeightClass = "h-[40vh]";
          if (idx === 3) wrapperHeightClass = "h-[52vh]";

          return (
            <div
              key={item.id}
              className="js-grid-item relative flex-1 cursor-pointer group pb-12"
            >
              <div
                className={`relative w-full overflow-hidden rounded-xl border border-white/[0.06] shadow-2xl shadow-black/40 transition-all duration-500 group-hover:border-white/20 group-hover:shadow-indigo-500/10 ${wrapperHeightClass} js-imagewrap`}
              >
                <div
                  className="w-full h-full bg-cover bg-no-repeat bg-center scale-[1.12] transition-transform duration-700 ease-out group-hover:scale-[1.18] js-grid-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              </div>

              <div className="absolute left-4 bottom-16 flex flex-col gap-1 pointer-events-none">
                <span
                  className={`text-[10px] font-mono font-bold tracking-widest ${subTitleColor} opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75`}
                >
                  {item.tag}
                </span>
                <h3
                  className={`text-sm font-light tracking-[0.2em] whitespace-nowrap uppercase js-grid-title ${titleColor}`}
                >
                  {item.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 top-full h-screen flex items-center justify-center bg-cover bg-no-repeat bg-center js-full-content">
        <a
          href="#"
          className="js-content-back relative z-10 block px-10 py-4 text-center text-xs font-mono tracking-[0.25em] uppercase text-black bg-white rounded-full font-medium shadow-2xl"
        >
          {backLabel}
        </a>
      </div>
    </div>
  );
}
