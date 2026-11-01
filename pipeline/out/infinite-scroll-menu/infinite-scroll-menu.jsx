"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  { label: "Fascination Street", href: "#" },
  { label: "The Last Dance", href: "#" },
  { label: "Rebel Fantasies", href: "#" },
  { label: "Love Letters to Cipher", href: "#" },
  { label: "Henry and the Kids", href: "#" },
  { label: "Downtown Blank", href: "#" },
  { label: "Georgetown Blues", href: "#" },
  { label: "When Alice comes", href: "#" },
  { label: "A Rabbit's Dream", href: "#" },
  { label: "Schizophrenia House", href: "#" },
  { label: "Foundation Fabrics", href: "#" },
  { label: "Whenever Whatever", href: "#" },
  { label: "Feathers of Babel", href: "#" },
  { label: "Golden Freckles", href: "#" },
];

const MOBILE_REGEX =
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;

export default function InfiniteScrollMenu({
  items = DEFAULT_ITEMS,
  bgColor = "#fff",
  textColor = "#111",
  menuColor = "#000",
  menuHoverColor = "#c0092b",
  linkColor = "#c0092b",
  linkHoverColor = "#000",
  fontSizeMobile = "7vw",
  fontSizeDesktop = "9.5vh",
  itemGapMobile = "4rem",
  itemGapDesktop = "25vw",
  desktopBreakpoint = "848px",
  className = "",
}) {
  const navRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ clonesHeight: 0, scrollHeight: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(
      MOBILE_REGEX.test(navigator.userAgent) ||
        MOBILE_REGEX.test(navigator.userAgent.substr(0, 4)),
    );
  }, []);

  useEffect(() => {
    if (!mounted || isMobile || !navRef.current) return;

    const nav = navRef.current;

    const getScrollPos = () => (nav.scrollTop || 0) - (nav.clientTop || 0);
    const setScrollPos = (pos) => {
      nav.scrollTop = pos;
    };

    const cloneItems = () => {
      const originals = [
        ...nav.querySelectorAll(".menu-item:not(.loop-clone)"),
      ];
      if (originals.length === 0) return;

      const itemHeight = originals[0].offsetHeight;
      const fitIn = Math.ceil(window.innerHeight / itemHeight);

      nav
        .querySelectorAll(".loop-clone")
        .forEach((clone) => nav.removeChild(clone));

      let totalClones = 0;
      originals
        .filter((_, index) => index < fitIn)
        .forEach((target) => {
          const clone = target.cloneNode(true);
          clone.classList.add("loop-clone");
          nav.appendChild(clone);
          totalClones += 1;
        });

      stateRef.current.clonesHeight = totalClones * itemHeight;
      stateRef.current.scrollHeight = nav.scrollHeight;
    };

    const initScroll = () => {
      if (getScrollPos() <= 0) setScrollPos(1);
    };

    const scrollUpdate = () => {
      const pos = getScrollPos();
      const { clonesHeight, scrollHeight } = stateRef.current;

      if (clonesHeight + pos >= scrollHeight) {
        setScrollPos(1);
      } else if (pos <= 0) {
        setScrollPos(scrollHeight - clonesHeight);
      }
    };

    const render = () => {
      scrollUpdate();
      rafRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      cloneItems();
      initScroll();
    };

    cloneItems();
    initScroll();
    rafRef.current = requestAnimationFrame(render);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      nav
        .querySelectorAll(".loop-clone")
        .forEach((clone) => nav.removeChild(clone));
    };
  }, [mounted, isMobile, items]);

  return (
    <div
      className={`w-full ${className}`}
      style={{
        "--menu-color": menuColor,
        "--menu-hover-color": menuHoverColor,
        "--link-color": linkColor,
        "--link-hover-color": linkHoverColor,
        "--item-gap-mobile": itemGapMobile,
        "--item-gap-desktop": itemGapDesktop,
        "--font-size-mobile": fontSizeMobile,
        "--font-size-desktop": fontSizeDesktop,
        "--desktop-bp": desktopBreakpoint,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {isMobile ? (
        <nav className="w-full flex flex-col items-end text-right py-20">
          {items.map((item, i) => (
            <MenuLink key={i} item={item} />
          ))}
        </nav>
      ) : (
        <nav
          ref={navRef}
          className="w-full h-screen relative overflow-auto flex flex-col items-end text-right select-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-touch-callout:none]"
        >
          {items.map((item, i) => (
            <MenuLink key={i} item={item} />
          ))}
        </nav>
      )}
    </div>
  );
}

function MenuLink({ item }) {
  return (
    <div className="menu-item flex-none pr-8 mr-[var(--item-gap-mobile)] md:mr-[var(--item-gap-desktop)]">
      <a
        href={item.href}
        className="group relative block whitespace-nowrap p-2 text-[var(--menu-color)] hover:italic hover:translate-x-8 hover:text-[var(--menu-hover-color)] transition-transform duration-200"
        style={{ fontFamily: "var(--font-family, inherit)" }}
      >
        <span
          className="absolute top-[55%] right-[calc(100%+2rem)] w-14 h-px bg-current opacity-0 group-hover:opacity-100 pointer-events-none"
          aria-hidden="true"
        />
        <span className="text-[length:var(--font-size-mobile)] md:text-[length:var(--font-size-desktop)]">
          {item.label}
        </span>
      </a>
    </div>
  );
}
