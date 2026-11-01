"use client";

import { useRef, useEffect, useState } from "react";

const NAV_ITEMS = [
  {
    label: "I Can",
    img: "https://images.unsplash.com/photo-1660167941111-f7ccce818728?auto=format&fit=crop&w=800&q=60",
  },
  {
    label: "Show",
    img: "https://images.unsplash.com/photo-1660070918769-f34c724cfe43?auto=format&fit=crop&w=800&q=60",
  },
  {
    label: "You",
    img: "https://images.unsplash.com/photo-1660169376132-409f66fedcee?auto=format&fit=crop&w=800&q=60",
  },
  {
    label: "How",
    img: "https://images.unsplash.com/photo-1660201367471-9fc0cb34734f?auto=format&fit=crop&w=800&q=60",
  },
  {
    label: "To Make",
    img: "https://images.unsplash.com/photo-1660158847730-e93a2a96ca59?auto=format&fit=crop&w=800&q=60",
  },
  {
    label: "This",
    img: "https://images.unsplash.com/photo-1660074519968-d718487e9a7b?auto=format&fit=crop&w=800&q=60",
  },
  {
    label: "In 60",
    img: "https://images.unsplash.com/photo-1657299156568-c94580e20fb6?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Seconds",
    img: "https://images.unsplash.com/photo-1660087031197-f483b4388e91?auto=format&fit=crop&w=500&q=60",
  },
];

export default function HoverImageNav({
  items = NAV_ITEMS,
  animDuration = 4000,
  eyebrow = "Selected works",
  bgColor = "#0a0a0a",
  textColor = "#ffffff",
  className = "",
}) {
  const navRef = useRef(null);
  const imgRef = useRef(null);
  const linkRefs = useRef([]);
  const activeIndex = useRef(-1);

  useEffect(() => {
    const nav = navRef.current;
    const img = imgRef.current;
    if (!nav || !img) return;

    const moveHandlers = linkRefs.current.map((link, i) => {
      const onEnter = () => {
        activeIndex.current = i;
        img.src = items[i].img;
        img.style.opacity = "1";
        img.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)";
      };
      const onLeave = () => {
        activeIndex.current = -1;
        img.style.opacity = "0";
        img.style.transform = "translate(-50%, -50%) scale(0.88) rotate(-1deg)";
      };
      const onMove = (e) => {
        img.style.left = `${e.clientX}px`;
        img.style.top = `${e.clientY}px`;
      };
      link.addEventListener("mouseenter", onEnter);
      link.addEventListener("mouseleave", onLeave);
      link.addEventListener("mousemove", onMove);
      return { onEnter, onLeave, onMove };
    });

    const onWindowMove = (e) => {
      const percent = e.clientY / window.innerHeight;
      nav.animate(
        { transform: `translateY(${percent * nav.offsetHeight * -1}px)` },
        { fill: "forwards", duration: animDuration },
      );
    };
    window.addEventListener("mousemove", onWindowMove);

    return () => {
      linkRefs.current.forEach((link, i) => {
        if (!link) return;
        link.removeEventListener("mouseenter", moveHandlers[i].onEnter);
        link.removeEventListener("mouseleave", moveHandlers[i].onLeave);
        link.removeEventListener("mousemove", moveHandlers[i].onMove);
      });
      window.removeEventListener("mousemove", onWindowMove);
    };
  }, [animDuration, items]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300&display=swap');

        .nav-root {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .nav-index {
          font-family: 'DM Mono', 'Courier New', monospace;
          font-size: clamp(10px, 1vw, 13px);
          font-weight: 300;
          color: color-mix(in srgb, var(--hn-text) 20%, transparent);
          letter-spacing: 0.1em;
          transition: color 400ms ease;
          padding-top: 0.35em;
          min-width: 3ch;
          flex-shrink: 0;
        }
        .nav-link {
          display: flex;
          align-items: baseline;
          gap: clamp(12px, 2vw, 28px);
          color: color-mix(in srgb, var(--hn-text) 18%, transparent);
          text-decoration: none;
          position: relative;
          padding: 0.05em 0;
          transition: color 350ms ease;
          font-weight: 300;
          font-size: clamp(48px, 7.5vw, 130px);
          line-height: 1.05;
          letter-spacing: -0.02em;
        }
        .nav-link::before {
          content: '';
          position: absolute;
          left: -20px;
          top: 15%;
          height: 70%;
          width: 1px;
          background: color-mix(in srgb, var(--hn-text) 60%, transparent);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover::before { transform: scaleY(1); }
        .nav-link:hover          { color: color-mix(in srgb, var(--hn-text) 92%, transparent); }
        .nav-link:hover .nav-index { color: color-mix(in srgb, var(--hn-text) 45%, transparent); }
        .nav-label {
          display: block;
          transition: letter-spacing 350ms ease;
        }
        .nav-link:hover .nav-label {
          font-style: italic;
          letter-spacing: -0.03em;
        }
        .nav-divider {
          width: 100%;
          height: 1px;
          background: color-mix(in srgb, var(--hn-text) 6%, transparent);
        }
        .nav-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: color-mix(in srgb, var(--hn-text) 25%, transparent);
          text-transform: uppercase;
          font-weight: 300;
        }
      `}</style>

      <div
        className={`nav-root relative w-full h-screen overflow-hidden ${className}`}
        style={{ backgroundColor: bgColor, "--hn-text": textColor }}
      >
        <img
          ref={imgRef}
          src={items[0].img}
          alt=""
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            width: "min(38vw, 460px)",
            aspectRatio: "3 / 2",
            objectFit: "cover",
            borderRadius: "4px",
            opacity: "0",
            pointerEvents: "none",
            zIndex: 9999,
            transform: "translate(-50%, -50%) scale(0.88) rotate(-1deg)",
            transition:
              "opacity 280ms ease, transform 350ms cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3)",
          }}
        />

        <nav
          ref={navRef}
          className="flex flex-col mt-[18vh] px-[clamp(28px,6vw,96px)]"
        >
          <span className="nav-eyebrow mb-[clamp(20px,3vh,40px)]">
            {eyebrow}
          </span>

          {items.map((item, i) => (
            <div key={i}>
              <div className="nav-divider" />
              <a
                href={item.href ?? "#"}
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                className="nav-link"
              >
                <span className="nav-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="nav-label">{item.label}</span>
              </a>
            </div>
          ))}

          <div className="nav-divider" />
        </nav>
      </div>
    </>
  );
}
