"use client";

import { useEffect, useRef, useState } from "react";

export default function StaggeredSegmentedNav({
  // Hamburger button
  triggerColor = "#252525",
  triggerOpenColor = "#fff",
  triggerTransitionEase = "cubic-bezier(.17, .67, 0, 1)",

  // Navigation panel
  navBgColor = "#FF3C3C",
  navSlideOutDuration = 0.9,
  navSlideInDuration = 0,

  // Menu items
  menuItems = [
    { label: "Work", href: "https://cydstumpel.nl/" },
    { label: "About", href: "https://cydstumpel.nl/about-me" },
    { label: "Contact", href: "https://cydstumpel.nl/contact" },
  ],
  menuItemFontSize = "grid(2)",
  menuItemFontWeight = 700,
  menuItemHoverFontWeight = 900,
  menuItemMarginTop = "0.35em",

  // Panel reveal animation
  panelAnimationDuration = 0.4,
  panelAnimationEase = "Power1.easeOut",
  panelAnimationStagger = 0.1,

  // Content area
  contentPaddingX = "grid(1)",
  contentPaddingY = "grid(3)",
  contentTextColor = "#252525",

  // Typography
  fontFamily = "Anybody",
  headingFontSize = "grid(2)",
  headingFontWeight = 700,
  paragraphMaxWidth = "100ch",
  paragraphLineHeight = 1.5,
  paragraphMarginTop = "1.25em",
  firstParagraphFontSize = "2rem",
  firstParagraphMarginTop = "1.5em",
  highlightBgColor = "#252525",
  highlightTextColor = "#fff",

  // Content data
  mainHeading = "You could read all this text..",
  contentParagraphs = [
    "But really, this pen is all about the navigation animation✨. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi ipsum odit ipsam voluptas magnam et veritatis ad dolore atque aut incidunt commodi nam, dignissimos totam culpa qui optio quisquam molestiae! Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi ipsum odit ipsam voluptas magnam et veritatis ad dolore atque aut incidunt commodi nam, dignissimos totam culpa qui optio quisquam molestiae!",
    "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi ipsum odit ipsam voluptas magnam et veritatis ad dolore atque aut incidunt commodi nam, dignissimos totam culpa qui optio quisquam molestiae!",
  ],
  highlightIndexes = [0],
}) {
  const triggerRef = useRef(null);
  const navRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const gsapRef = useRef(null);

  // Load GSAP library
  useEffect(() => {
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

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js")
      .then(() => {
        gsapRef.current = window.gsap;
        if (gsapRef.current) {
          gsapRef.current.config({ trialWarn: false });
        }
      })
      .catch((e) =>
        console.error("[AnimatedNav] GSAP load failed:", e.message),
      );
  }, []);

  // Handle toggle click
  const handleToggle = () => {
    if (!gsapRef.current || !navRef.current) return;

    const gsap = gsapRef.current;
    const newOpenState = !isOpen;
    const amount = newOpenState ? 100 : 0;

    gsap
      .timeline({})
      .to(
        navRef.current,
        {
          "--panel-bottom-1": `${amount}%`,
          duration: panelAnimationDuration,
          ease: panelAnimationEase,
        },
        0,
      )
      .to(
        navRef.current,
        {
          "--panel-bottom-2": `${amount}%`,
          duration: panelAnimationDuration,
          ease: panelAnimationEase,
        },
        panelAnimationStagger,
      )
      .to(
        navRef.current,
        {
          "--panel-bottom-3": `${amount}%`,
          duration: panelAnimationDuration,
          ease: panelAnimationEase,
        },
        panelAnimationStagger * 2,
      )
      .to(
        navRef.current,
        {
          "--panel-bottom-4": `${amount}%`,
          duration: panelAnimationDuration,
          ease: panelAnimationEase,
        },
        panelAnimationStagger * 3,
      );

    setIsOpen(newOpenState);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anybody:wght@400;700;900&display=swap');
        
        * {
          font-family: "${fontFamily}", sans-serif;
          margin: 0;
          box-sizing: border-box;
          color: ${contentTextColor};
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[10] flex items-center justify-between px-[calc(100vw/24*1)] py-6 md:px-6 md:py-6 w-full">
        {/* Hamburger Trigger */}
        <button
          ref={triggerRef}
          onClick={handleToggle}
          className={`relative w-6 h-6 bg-transparent border-0 p-0 cursor-pointer transition-colors duration-400 group hover:opacity-80 ${
            isOpen ? "text-white" : ""
          }`}
          style={{
            color: isOpen ? triggerOpenColor : triggerColor,
          }}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {/* Top bar */}
          <span
            className="absolute block w-6 h-[2px] bg-current rounded-[1px] origin-center transition-all duration-1000"
            style={{
              top: "0px",
              transform: isOpen
                ? "translateY(14px) rotate(45deg) scale(0.85)"
                : "translateY(10px)",
              transitionTimingFunction: triggerTransitionEase,
            }}
          />
          {/* Bottom bar */}
          <span
            className="absolute block w-6 h-[2px] bg-current rounded-[1px] origin-center transition-all duration-1000"
            style={{
              top: "0px",
              transform: isOpen
                ? "translateY(14px) rotate(-45deg) scale(0.85)"
                : "translateY(17px)",
              transitionTimingFunction: triggerTransitionEase,
            }}
          />
        </button>
      </header>

      {/* Navigation Panel */}
      <nav
        ref={navRef}
        className={`fixed inset-0 w-full h-full bg-[#FF3C3C] p-[calc(100vw/24*2)] md:p-[8rem_1.5rem] z-[9] overflow-y-scroll ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          "--panel-bottom-1": "0%",
          "--panel-bottom-2": "0%",
          "--panel-bottom-3": "0%",
          "--panel-bottom-4": "0%",
          backgroundColor: navBgColor,
          transform: isOpen ? "translateY(0)" : "translateY(-101%)",
          transition: isOpen
            ? `transform ${navSlideInDuration}s`
            : `transform ${navSlideOutDuration}s ${navSlideOutDuration}s`,
          clipPath: `polygon(
            0 0,
            0 var(--panel-bottom-1),
            25% var(--panel-bottom-1),
            25% 0,
            25% 0,
            25% var(--panel-bottom-2),
            50% var(--panel-bottom-2),
            50% 0,
            50% 0,
            50% var(--panel-bottom-3),
            75% var(--panel-bottom-3),
            75% 0,
            75% 0,
            75% var(--panel-bottom-4),
            100% var(--panel-bottom-4),
            100% 0
          )`,
        }}
      >
        {/* Menu List */}
        <ul className="list-none p-0 m-0">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="transition-all duration-1000 hover:opacity-80"
              style={{
                fontSize: menuItemFontSize,
                fontVariationSettings: `'wght' ${menuItemFontWeight}`,
                transitionTimingFunction: triggerTransitionEase,
                marginTop: index > 0 ? menuItemMarginTop : "0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.fontVariationSettings = `'wght' ${menuItemHoverFontWeight}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.fontVariationSettings = `'wght' ${menuItemFontWeight}`;
              }}
            >
              <a
                href={item.href}
                className="text-white no-underline block py-1"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content Area */}
      <section
        className="px-[calc(100vw/24*1)] pt-[calc(100vw/24*3)] md:px-6 md:pt-32"
        style={{
          paddingLeft: contentPaddingX,
          paddingRight: contentPaddingX,
          paddingTop: contentPaddingY,
          paddingBottom: contentPaddingY,
        }}
      >
        {/* Main Heading */}
        <h1
          className="font-bold mb-8"
          style={{
            fontSize: headingFontSize,
            fontVariationSettings: `'wght' ${headingFontWeight}`,
          }}
        >
          {mainHeading}
        </h1>

        {/* Paragraphs */}
        {contentParagraphs.map((para, index) => {
          const isFirstParagraph = index === 0;
          const shouldHighlight = highlightIndexes.includes(index);

          return (
            <p
              key={index}
              className="mb-6"
              style={{
                maxWidth: paragraphMaxWidth,
                lineHeight: paragraphLineHeight,
                marginTop: isFirstParagraph
                  ? firstParagraphMarginTop
                  : paragraphMarginTop,
                fontSize: isFirstParagraph ? firstParagraphFontSize : "1rem",
              }}
            >
              {shouldHighlight ? (
                <span
                  style={{
                    backgroundColor: highlightBgColor,
                    color: highlightTextColor,
                    padding: "0.1em 0.3em",
                  }}
                >
                  {para}
                </span>
              ) : (
                para
              )}
            </p>
          );
        })}
      </section>
    </>
  );
}
