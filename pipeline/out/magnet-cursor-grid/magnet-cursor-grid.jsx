"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  { label: "Facebook", iconPath: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" },
  { label: "Twitter", iconPath: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" },
  { label: "Instagram", iconPath: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { label: "YouTube", iconPath: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { label: "Dribbble", iconPath: "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.322c-.3-.11-.295-.101-1.928-.567a21.464 21.464 0 00-3.303 3.957c2.4 1.758 4.22 1.488 4.3 1.472a10.024 10.024 0 00.931-4.862zm-2.025 6.07c-.012 0-1.504.208-3.791-1.391a23.111 23.111 0 01-3.13-4.156c-.085.034-.176.07-.267.106-2.906 1.13-5.26 3.447-5.337 3.525a9.92 9.92 0 006.185 2.13c2.408 0 4.605-.851 6.34-2.244zm-14.154-1.594c.063-.064 2.193-2.181 4.962-3.27.165-.065.33-.127.498-.188a25.32 25.32 0 01-1.637-4.103c-3.197.943-6.046.841-6.138.837a9.927 9.927 0 002.315 6.724zm-.89-8.498c.101.003 2.651.071 5.672-.82a23.364 23.364 0 00-2.457-4.46A9.957 9.957 0 001.9 9.666zm7.261-5.35c.78 1.258 1.603 2.766 2.33 4.307a21.6 21.6 0 014.283-1.468c-.015-.078-.03-.158-.048-.238A10.211 10.211 0 0012 1.956a9.9 9.9 0 00-2.839 2.36zm6.818 2.016a19.742 19.742 0 00-3.951 1.341 25.132 25.132 0 011.757 4.321c1.55-.417 3.196-.465 3.31-.468.016 0 .032 0 .048.001A24.582 24.582 0 0015.98 6.332z" },
];

export default function MagnetCursorGrid({
  items = DEFAULT_ITEMS,
  bgColor = "rgb(18, 18, 18)",
  cursorColor = "rgb(255, 60, 60)",
  cursorOuterSize = 40,
  cursorInnerSize = 10,
  buttonSize = "60px",
  hoverBgColor = "rgba(255, 255, 255, 0.1)",
  className = "",
}) {
  const mainRef = useRef(null);
  const outerCursorRef = useRef(null);
  const innerCursorRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    import("gsap").then((mod) => {
      if (cancelled) return;
      const gsap = mod.gsap || mod.default;
      const state = { isStuck: false, mouse: { x: -100, y: -100 }, scrollHeight: 0, frameId: null };

      const handleScroll = () => {
        state.scrollHeight = window.scrollY;
      };
      const handleMouseMove = (e) => {
        state.mouse.x = e.pageX;
        state.mouse.y = e.pageY;
      };
      const handleMouseDown = () => {
        gsap.to(innerCursorRef.current, { duration: 0.15, scale: 2 });
      };
      const handleMouseUp = () => {
        gsap.to(innerCursorRef.current, { duration: 0.15, scale: 1 });
      };

      window.addEventListener("scroll", handleScroll);
      document.body.addEventListener("pointermove", handleMouseMove);
      document.body.addEventListener("pointerdown", handleMouseDown);
      document.body.addEventListener("pointerup", handleMouseUp);

      const updateCursor = () => {
        gsap.set(innerCursorRef.current, { x: state.mouse.x, y: state.mouse.y });
        if (!state.isStuck && outerCursorRef.current) {
          gsap.to(outerCursorRef.current, {
            duration: 0.15,
            x: state.mouse.x - cursorOuterSize / 2,
            y: state.mouse.y - cursorOuterSize / 2,
          });
        }
        state.frameId = requestAnimationFrame(updateCursor);
      };
      updateCursor();

      const gridButtons = mainRef.current?.querySelectorAll(".magnet-target") || [];

      const handleMouseEnter = (e) => {
        state.isStuck = true;
        const targetBox = e.currentTarget.getBoundingClientRect();
        gsap.to(outerCursorRef.current, {
          duration: 0.2,
          x: targetBox.left,
          y: targetBox.top + state.scrollHeight,
          width: targetBox.width,
          height: targetBox.height,
          borderRadius: 0,
          backgroundColor: hoverBgColor,
        });
      };
      const handleMouseLeave = () => {
        state.isStuck = false;
        gsap.to(outerCursorRef.current, {
          duration: 0.2,
          width: cursorOuterSize,
          height: cursorOuterSize,
          borderRadius: "50%",
          backgroundColor: "transparent",
        });
      };

      gridButtons.forEach((btn) => {
        btn.addEventListener("pointerenter", handleMouseEnter);
        btn.addEventListener("pointerleave", handleMouseLeave);
      });

      cleanup = () => {
        cancelAnimationFrame(state.frameId);
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handleMouseMove);
        document.body.removeEventListener("pointerdown", handleMouseDown);
        document.body.removeEventListener("pointerup", handleMouseUp);
        gridButtons.forEach((btn) => {
          btn.removeEventListener("pointerenter", handleMouseEnter);
          btn.removeEventListener("pointerleave", handleMouseLeave);
        });
        gsap.killTweensOf([outerCursorRef.current, innerCursorRef.current]);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [cursorOuterSize, hoverBgColor, items]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden [cursor:none] select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={outerCursorRef}
        className="fixed left-0 top-0 pointer-events-none z-[100] border border-solid"
        style={{
          width: `${cursorOuterSize}px`,
          height: `${cursorOuterSize}px`,
          borderColor: cursorColor,
          borderRadius: "50%",
        }}
      />
      <div
        ref={innerCursorRef}
        className="fixed left-0 top-0 pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `${cursorInnerSize}px`,
          height: `${cursorInnerSize}px`,
          backgroundColor: cursorColor,
          borderRadius: "50%",
        }}
      />
      <main ref={mainRef} className="flex flex-wrap justify-center group/grid">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            aria-label={item.label}
            className="magnet-target border-none flex justify-center items-center text-[1.2rem] bg-white/[0.08] text-white transition-[background,color] duration-200 ease-linear [cursor:none] group-hover/grid:bg-white/[0.04] group-hover/grid:text-white/[0.04] hover:!text-white hover:!bg-white/[0.08]"
            style={{ width: buttonSize, height: buttonSize }}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d={item.iconPath} />
            </svg>
          </button>
        ))}
      </main>
    </div>
  );
}
