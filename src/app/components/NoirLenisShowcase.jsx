"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── SelectedWorks ────────────────────────────────────────────────────────────
//
// A full-page portfolio showcase with list/grid view toggle, GSAP Flip
// animated transitions, a hover-driven image popup, smooth Lenis scrolling,
// clip-path logo reveal animations, and animated footer sections.
//
// Props
// ──────────────────────────────────────────────────────────────────────────────
// — Colours —
// bgColor          string  "#1a1917"   Page + header + footer background (dark)
// fgColor          string  "#f8f5f2"   Text + logo fill colour (light)
//
// — Navigation —
// navLinks         array   [{label, href, active, count}]
//                          Nav items. `count` renders as <sup> if provided.
// contactLabel     string  "+GET IN TOUCH"   Right-side contact label
// contactHref      string  "mailto:…"        Contact link href
//
// — Hero section —
// sectionLabel     string  "SELECTED WORKS"  Section heading text
// sectionCount     number  10                Count shown as <sup> next to heading
//
// — Projects —
// projects         array   [{id, title, year, image}]
//                          Each project card. `image` is shown in grid view
//                          and as the hover popup in list view.
// initialView      string  "list"    Starting view mode: "list" | "grid"
//
// — Popup —
// popupBg          string  "rgba(26,25,23,0.9)"  Background of the image popup overlay
// popupFadeDuration  number  0.5     Popup open/close fade duration in seconds
// popupSwitchDuration number 0.1     Duration of the image crossfade when switching projects
//
// — Animations —
// logoRevealDelay  number  0.3       Delay before the header logo paths animate in (s)
// logoRevealStagger number 0.15      Stagger between each logo path reveal (s)
// itemEntryStagger number  0.08      Stagger between project item entrance animations (s)
//
// — Footer —
// footerTagline    string  "Find the essence in simplicity,"
// footerBold       string  "Create without boundaries."
// footerColumns    array   [{sections: [{heading, links: [{label, href}]}]}]
//                          Three-column footer grid. Each column has sections;
//                          each section has an optional heading and link rows.
// footerLocation   string  "40.7128° N, 74.0060° W"
// ──────────────────────────────────────────────────────────────────────────────

// ─── SVG logo paths (shared between header and footer instances) ──────────────
const LOGO_PATHS = [
  "m56.7888 18c0-5.304 2.256-10.72798 5.208-13.24798v-.048h-7.848v-3.288h12.168v3.048c-3.768 3.048-5.208 8.42398-5.208 13.53598z",
  "m39.4973 18v-17.159973h8.088c3.816 0 6.12 1.776003 6.12 4.896003 0 2.4-1.344 3.816-3.48 4.29597v.048c4.296.744 2.736 7.392 3.72 7.68v.24h-4.488c-.84-.72.72-5.976-2.952-5.976h-2.688v5.976zm4.32-9.50397h2.928c1.728 0 2.64-.624 2.64-2.064s-.912-2.064-2.64-2.064h-2.928z",
  "m33.022 18v-17.159973h4.32v17.159973z",
  "m24.173 18.384c-4.968 0-7.296-3.72-7.296-8.66402 0-4.944 2.328-8.688 7.296-8.688s7.272 3.744 7.272 8.688c0 4.94402-2.304 8.66402-7.272 8.66402zm-3.048-8.66402c0 3.00002.672 5.30402 3.048 5.30402s3.024-2.304 3.024-5.30402c0-3-.648-5.328-3.048-5.328s-3.048 2.328-3.048 5.328z",
  "m.594849 18v-17.159973h4.320001l5.99995 10.199973h.048v-10.199973h4.3201v17.159973h-4.3201l-5.99995-10.19997h-.048v10.19997z",
];

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Silence",
    year: "2021",
    image:
      "https://cdn.cosmos.so/7d47d4e2-0eff-4e2f-9734-9d24a8ba067e?format=jpeg",
  },
  {
    id: 2,
    title: "Resonance",
    year: "2022",
    image:
      "https://cdn.cosmos.so/5eee2d2d-3d4d-4ae5-96d4-cdbae70a2387?format=jpeg",
  },
  {
    id: 3,
    title: "Essence",
    year: "2022",
    image:
      "https://cdn.cosmos.so/def30e8a-34b2-48b1-86e1-07ec5c28f225?format=jpeg",
  },
  {
    id: 4,
    title: "Void",
    year: "2023",
    image:
      "https://cdn.cosmos.so/44d7cb23-6759-49e4-9dc1-acf771b3a0d1?format=jpeg",
  },
  {
    id: 5,
    title: "Presence",
    year: "2023",
    image:
      "https://cdn.cosmos.so/7712fe42-42ca-4fc5-9590-c89f2db99978?format=jpeg",
  },
  {
    id: 6,
    title: "Flow",
    year: "2024",
    image:
      "https://cdn.cosmos.so/cbee1ec5-01b6-4ffe-9f34-7da7980454cf?format=jpeg",
  },
  {
    id: 7,
    title: "Clarity",
    year: "2024",
    image:
      "https://cdn.cosmos.so/2e91a9d1-db85-4499-ad37-6222a6fea23b?format=jpeg",
  },
  {
    id: 8,
    title: "Breath",
    year: "2024",
    image:
      "https://cdn.cosmos.so/ff2ac3d3-fa94-4811-89f6-0d008b27e439?format=jpeg",
  },
  {
    id: 9,
    title: "Stillness",
    year: "2025",
    image:
      "https://cdn.cosmos.so/c39a4043-f489-4406-8018-a103a3f89802?format=jpeg",
  },
  {
    id: 10,
    title: "Surrender",
    year: "2025",
    image:
      "https://cdn.cosmos.so/e5e399f2-4050-463b-a781-4f5a1615f28e?format=jpeg",
  },
];

const DEFAULT_NAV = [
  { label: "SELECTED WORKS", href: "#", active: true, count: 10 },
  { label: "ABOUT", href: "#", active: false },
  { label: "JOURNAL", href: "#", active: false },
];

const DEFAULT_FOOTER_COLUMNS = [
  {
    sections: [
      {
        heading: "Contact",
        links: [
          { label: "hello@studio.com", href: "mailto:hello@studio.com" },
          { label: "+1.000.000.0000", href: "tel:+10000000000" },
        ],
      },
      { heading: "\u00a0", links: [{ label: "\u00a0", href: "#" }] },
    ],
  },
  {
    sections: [
      {
        heading: null,
        links: [
          { label: "Sound", href: "#" },
          { label: "Vision", href: "#" },
          { label: "Feeling", href: "#" },
        ],
      },
      {
        heading: "Fragments",
        links: [{ label: "Receive Signals", href: "#" }],
      },
    ],
  },
  {
    sections: [
      {
        heading: null,
        links: [
          { label: "Works(10)", href: "#", sup: "(10)" },
          { label: "About", href: "#" },
          { label: "Journal", href: "#" },
        ],
      },
      { heading: "Location", links: [] },
    ],
  },
];

// ─── LogoSVG: reusable NORI wordmark ─────────────────────────────────────────
function LogoSVG({ fill, pathRefs }) {
  return (
    <svg
      viewBox="0 0 67 19"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <g fill={fill}>
        {LOGO_PATHS.map((d, i) => (
          <path
            key={i}
            ref={
              pathRefs
                ? (el) => {
                    pathRefs.current[i] = el;
                  }
                : undefined
            }
            d={d}
            // Initially hidden via clip-path — GSAP will reveal each path
            style={{ clipPath: "inset(100% 0 0 0)" }}
          />
        ))}
      </g>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NoirLenisShowcase({
  // Colours
  bgColor = "#1a1917",
  fgColor = "#f8f5f2",
  // Nav
  navLinks = DEFAULT_NAV,
  contactLabel = "+GET IN TOUCH",
  contactHref = "mailto:hello@studio.com",
  // Hero
  sectionLabel = "SELECTED WORKS",
  sectionCount = 10,
  // Projects
  projects = DEFAULT_PROJECTS,
  initialView = "list",
  // Popup
  popupBg = "rgba(26, 25, 23, 0.9)",
  popupFadeDuration = 0.5,
  popupSwitchDuration = 0.1,
  // Animations
  logoRevealDelay = 0.3,
  logoRevealStagger = 0.15,
  itemEntryStagger = 0.08,
  // Footer
  footerTagline = "Find the essence in simplicity,",
  footerBold = "Create without boundaries.",
  footerColumns = DEFAULT_FOOTER_COLUMNS,
  footerLocation = "40.7128° N, 74.0060° W",
}) {
  // ── View state ─────────────────────────────────────────────────────────────
  const [view, setView] = useState(initialView); // "list" | "grid"

  // ── Refs ───────────────────────────────────────────────────────────────────
  const containerRef = useRef(null); // projects grid/list container
  const popupRef = useRef(null); // popup overlay
  const popupImgRef = useRef(null); // popup <img>
  const headerLogoRefs = useRef([]); // header logo path elements
  const footerLogoRefs = useRef([]); // footer logo path elements

  // Mutable interaction state — kept in refs to avoid triggering re-renders
  const viewRef = useRef(initialView);
  const isAnimatingRef = useRef(false);
  const isPopupVisibleRef = useRef(false);
  const currentHoveredRef = useRef(null);
  const mouseOverImgRef = useRef(false);
  const hideTimeoutRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const lastInteractionRef = useRef(0);

  // ── Script loader ──────────────────────────────────────────────────────────
  const loadScript = useCallback(
    (src) =>
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
      }),
    [],
  );

  // ── Popup helpers ──────────────────────────────────────────────────────────
  const showPopup = useCallback(
    (src) => {
      const overlay = popupRef.current;
      const img = popupImgRef.current;
      const { gsap } = window;
      if (!src || !overlay || !img || !gsap) return;

      if (overlay.style.display !== "flex") {
        // First open
        isPopupVisibleRef.current = true;
        img.src = src;
        overlay.style.display = "flex";
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, duration: popupFadeDuration, ease: "power2.out" },
        );
      } else if (img.src !== src) {
        // Crossfade to new image
        gsap.to(img, {
          opacity: 0,
          duration: popupSwitchDuration,
          ease: "power2.out",
          onComplete: () => {
            img.src = src;
            gsap.to(img, {
              opacity: 1,
              duration: popupSwitchDuration,
              ease: "power2.out",
            });
          },
        });
      }
    },
    [popupFadeDuration, popupSwitchDuration],
  );

  const hidePopup = useCallback(() => {
    if (Date.now() - lastInteractionRef.current < 100) return;
    const overlay = popupRef.current;
    const { gsap } = window;
    if (!overlay || !gsap) return;
    isPopupVisibleRef.current = false;
    gsap.to(overlay, {
      opacity: 0,
      duration: popupFadeDuration,
      ease: "power2.out",
      onComplete: () => {
        overlay.style.display = "none";
      },
    });
  }, [popupFadeDuration]);

  // ── Hover event handlers ───────────────────────────────────────────────────
  // These are attached/reattached after every view switch in attachHoverEvents.
  // Kept stable with useCallback so we can removeEventListener cleanly.
  const onListItemEnter = useCallback(
    function () {
      if (viewRef.current !== "list") return;
      this.dataset.hovered = "true";
      clearTimeout(hideTimeoutRef.current);
      currentHoveredRef.current = this;
      lastInteractionRef.current = Date.now();
      setTimeout(() => {
        if (this.dataset.hovered !== "true") return;
        const project = projects.find((p) => p.id == this.dataset.id);
        if (project) showPopup(project.image);
      }, 10);
    },
    [projects, showPopup],
  );

  const onListItemLeave = useCallback(
    function () {
      if (viewRef.current !== "list") return;
      this.dataset.hovered = "false";
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        const any = Array.from(
          document.querySelectorAll(".sw-project-item"),
        ).some((p) => p.dataset.hovered === "true");
        if (!any) {
          hidePopup();
          currentHoveredRef.current = null;
        }
      }, 150);
    },
    [hidePopup],
  );

  const onGridImgEnter = useCallback(
    function () {
      if (viewRef.current !== "grid") return;
      this.dataset.hovered = "true";
      mouseOverImgRef.current = true;
      clearTimeout(hideTimeoutRef.current);
      const item = this.closest(".sw-project-item");
      currentHoveredRef.current = item;
      lastInteractionRef.current = Date.now();
      setTimeout(() => {
        if (this.dataset.hovered !== "true") return;
        const img = this.querySelector(".sw-project-image");
        if (img?.src) showPopup(img.src);
      }, 10);
    },
    [showPopup],
  );

  const onGridImgLeave = useCallback(
    function () {
      if (viewRef.current !== "grid") return;
      this.dataset.hovered = "false";
      mouseOverImgRef.current = false;
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        const any = Array.from(
          document.querySelectorAll(".sw-img-container"),
        ).some((c) => c.dataset.hovered === "true");
        if (!any) {
          hidePopup();
          currentHoveredRef.current = null;
        }
      }, 150);
    },
    [hidePopup],
  );

  // ── Attach / detach hover events after view switch ─────────────────────────
  const attachHoverEvents = useCallback(() => {
    // Clean up all listeners first
    document.querySelectorAll(".sw-project-item").forEach((el) => {
      el.removeEventListener("mouseenter", onListItemEnter);
      el.removeEventListener("mouseleave", onListItemLeave);
    });
    document.querySelectorAll(".sw-img-container").forEach((el) => {
      el.removeEventListener("mouseenter", onGridImgEnter);
      el.removeEventListener("mouseleave", onGridImgLeave);
    });

    if (viewRef.current === "list") {
      document.querySelectorAll(".sw-project-item").forEach((el) => {
        el.dataset.hovered = "false";
        el.addEventListener("mouseenter", onListItemEnter);
        el.addEventListener("mouseleave", onListItemLeave);
      });
    } else {
      document.querySelectorAll(".sw-img-container").forEach((el) => {
        el.dataset.hovered = "false";
        el.addEventListener("mouseenter", onGridImgEnter);
        el.addEventListener("mouseleave", onGridImgLeave);
      });
    }
  }, [onListItemEnter, onListItemLeave, onGridImgEnter, onGridImgLeave]);

  // ── Grid image clip-path reveal / hide ────────────────────────────────────
  const animateImagesIn = useCallback(() => {
    const { gsap } = window;
    if (!gsap) {
      isAnimatingRef.current = false;
      return;
    }
    const imgs = document.querySelectorAll(".sw-project-image");
    gsap.to(imgs, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1,
      ease: "power2.out",
      stagger: 0.06,
      onComplete: () => {
        isAnimatingRef.current = false;
        attachHoverEvents();
      },
    });
  }, [attachHoverEvents]);

  const animateImagesOut = useCallback(() => {
    const { gsap } = window;
    if (!gsap) {
      isAnimatingRef.current = false;
      return;
    }
    const imgs = document.querySelectorAll(".sw-project-image");
    const containers = document.querySelectorAll(".sw-img-container");
    gsap.to(imgs, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 1,
      ease: "power2.out",
      stagger: 0.06,
      onComplete: () => {
        containers.forEach((c) => {
          c.classList.remove("sw-transitioning");
          c.style.display = "none";
          c.style.visibility = "hidden";
        });
        isAnimatingRef.current = false;
        attachHoverEvents();
      },
    });
  }, [attachHoverEvents]);

  // ── View toggle with GSAP Flip ─────────────────────────────────────────────
  const toggleView = useCallback(
    (nextView) => {
      if (viewRef.current === nextView || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // Reset popup state
      hidePopup();
      currentHoveredRef.current = null;
      mouseOverImgRef.current = false;
      clearTimeout(hideTimeoutRef.current);
      clearTimeout(showTimeoutRef.current);

      const { gsap, Flip } = window;
      const container = containerRef.current;
      if (!container) return;

      // ── Fallback (no GSAP Flip) ──
      if (!gsap || !Flip) {
        viewRef.current = nextView;
        setView(nextView);
        isAnimatingRef.current = false;
        requestAnimationFrame(attachHoverEvents);
        return;
      }

      const items = container.querySelectorAll(".sw-project-item");
      const titles = container.querySelectorAll(".sw-project-title");
      const years = container.querySelectorAll(".sw-project-year");
      const imgConts = container.querySelectorAll(".sw-img-container");

      // If going to list view, briefly make image containers visible for the
      // FLIP out-animation before we hide them at the end of animateImagesOut
      if (nextView === "list") {
        imgConts.forEach((c) => {
          c.classList.add("sw-transitioning");
          c.style.display = "block";
          c.style.visibility = "visible";
        });
      }

      const state = Flip.getState([items, titles, years, imgConts]);

      // Update React state → DOM re-renders with new CSS classes
      viewRef.current = nextView;
      setView(nextView);

      // After React commits the layout change, run Flip.from
      requestAnimationFrame(() => {
        if (nextView === "grid") {
          gsap.set(imgConts, {
            display: "block",
            visibility: "visible",
            opacity: 1,
          });
          gsap.set(container.querySelectorAll(".sw-project-image"), {
            clipPath: "inset(100% 0% 0% 0%)",
          });
        }

        Flip.from(state, {
          duration: 1,
          ease: "power2.out",
          absolute: true,
          nested: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { opacity: 0 },
              { opacity: 1, duration: 0.5, ease: "power2.out" },
            ),
          onLeave: (els) =>
            gsap.to(els, { opacity: 0, duration: 0.5, ease: "power2.out" }),
          onComplete: () => {
            nextView === "grid" ? animateImagesIn() : animateImagesOut();
          },
        });
      });
    },
    [hidePopup, attachHoverEvents, animateImagesIn, animateImagesOut],
  );

  // ── Boot: load scripts, wire everything ───────────────────────────────────
  useEffect(() => {
    let lenisInstance = null;

    const init = async () => {
      await Promise.all([
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        ),
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
        ),
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
        ),
        loadScript(
          "https://cdn.jsdelivr.net/npm/lenis@latest/dist/lenis.min.js",
        ),
      ]);

      const { gsap, ScrollTrigger, Flip, Lenis } = window;
      if (!gsap) return;

      // Register plugins
      if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
      if (Flip) gsap.registerPlugin(Flip);

      // ── Lenis smooth scroll ──
      if (Lenis) {
        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothTouch: false,
          touchMultiplier: 2,
        });
        if (ScrollTrigger) lenisInstance.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      // ── Header logo reveal ──
      const hPaths = headerLogoRefs.current.filter(Boolean);
      gsap.set(hPaths, { clipPath: "inset(100% 0 0 0)" });
      gsap.to(hPaths, {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.2,
        ease: "power2.out",
        stagger: logoRevealStagger,
        delay: logoRevealDelay,
      });

      // ── Initial project item entrance ──
      gsap.set(".sw-project-item", { opacity: 0, y: 30 });
      gsap.to(".sw-project-item", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: { each: itemEntryStagger, from: "start" },
        delay: logoRevealDelay,
      });

      // ── Footer logo reveal on scroll ──
      if (ScrollTrigger) {
        const fPaths = footerLogoRefs.current.filter(Boolean);
        gsap.set(fPaths, { clipPath: "inset(100% 0 0 0)" });
        ScrollTrigger.create({
          trigger: ".sw-footer-logo",
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(fPaths, {
              clipPath: "inset(0% 0 0 0)",
              duration: 1.2,
              ease: "power2.out",
              stagger: logoRevealStagger,
            });
          },
        });

        // Footer sections fade-in
        ScrollTrigger.batch(".sw-footer-section", {
          start: "top 90%",
          once: true,
          onEnter: (batch) => {
            gsap.from(batch, {
              opacity: 0,
              y: 30,
              stagger: 0.1,
              duration: 0.8,
              ease: "power2.out",
            });
          },
        });

        // Footer headline
        ScrollTrigger.create({
          trigger: ".sw-footer-header",
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.from(".sw-footer-tagline", {
              opacity: 0,
              y: 20,
              duration: 0.8,
              ease: "power2.out",
            });
            gsap.from(".sw-footer-bold", {
              opacity: 0,
              y: 20,
              duration: 0.8,
              delay: 0.2,
              ease: "power2.out",
            });
          },
        });
      }

      // ── Attach initial hover events ──
      attachHoverEvents();

      // ── Global mousemove: handle both views ──
      const handleMouseMove = (e) => {
        lastInteractionRef.current = Date.now();

        if (viewRef.current === "grid") {
          // Find the image container under the cursor
          let found = null;
          document.querySelectorAll(".sw-img-container").forEach((c) => {
            const r = c.getBoundingClientRect();
            if (
              e.clientX >= r.left &&
              e.clientX <= r.right &&
              e.clientY >= r.top &&
              e.clientY <= r.bottom
            )
              found = c;
          });
          if (found) {
            mouseOverImgRef.current = true;
            clearTimeout(hideTimeoutRef.current);
            const item = found.closest(".sw-project-item");
            if (item !== currentHoveredRef.current) {
              currentHoveredRef.current = item;
              const img = found.querySelector(".sw-project-image");
              if (img?.src) showPopup(img.src);
            }
          } else {
            mouseOverImgRef.current = false;
            if (isPopupVisibleRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = setTimeout(() => {
                if (!mouseOverImgRef.current) {
                  hidePopup();
                  currentHoveredRef.current = null;
                }
              }, 150);
            }
          }
        } else {
          let found = null;
          document.querySelectorAll(".sw-project-item").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (
              e.clientX >= r.left - 2 &&
              e.clientX <= r.right + 2 &&
              e.clientY >= r.top - 2 &&
              e.clientY <= r.bottom + 2
            )
              found = el;
          });
          if (found) {
            if (found !== currentHoveredRef.current) {
              currentHoveredRef.current = found;
              clearTimeout(hideTimeoutRef.current);
              clearTimeout(showTimeoutRef.current);
              showTimeoutRef.current = setTimeout(() => {
                const project = projects.find((p) => p.id == found.dataset.id);
                if (project) showPopup(project.image);
              }, 10);
            }
          } else {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = setTimeout(() => {
              hidePopup();
              currentHoveredRef.current = null;
            }, 150);
          }
        }
      };

      // Leave document → hide popup
      const handleMouseOut = (e) => {
        if (e.relatedTarget === null || e.relatedTarget.nodeName === "HTML") {
          hidePopup();
          mouseOverImgRef.current = false;
          currentHoveredRef.current = null;
        }
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseout", handleMouseOut);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseout", handleMouseOut);
      };
    };

    let cleanup = () => {};
    init().then((fn) => {
      if (fn) cleanup = fn;
    });

    return () => {
      cleanup();
      if (lenisInstance) lenisInstance.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-attach hover events whenever view actually changes ──────────────────
  useEffect(() => {
    attachHoverEvents();
  }, [view, attachHoverEvents]);

  // ── Derived Tailwind classes for the projects container ───────────────────
  const containerClass =
    view === "list"
      ? "sw-projects-container flex flex-col min-h-screen mb-[20vh]"
      : "sw-projects-container grid gap-8 min-h-screen mb-[20vh] grid-cols-5 max-[1200px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1";

  return (
    <>
      {/* ── Scoped styles: noise animation + mix-blend hover + Lenis ── */}
      <style>{`
        @import url('https://fonts.cdnfonts.com/css2?family=PP+Neue+Montreal&display=swap');

        /* Animated noise overlay */
        .sw-root::before {
          content: "";
          position: fixed;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: transparent url("http://assets.iceable.com/img/noise-transparent.png") repeat 0 0;
          background-size: 300px 300px;
          animation: sw-noise 0.3s steps(5) infinite;
          opacity: 0.9;
          will-change: transform;
          z-index: 100;
          pointer-events: none;
        }
        @keyframes sw-noise {
          0%   { transform: translate(0,0); }
          10%  { transform: translate(-2%,-3%); }
          20%  { transform: translate(-4%,2%); }
          30%  { transform: translate(2%,-4%); }
          40%  { transform: translate(-2%,5%); }
          50%  { transform: translate(-4%,2%); }
          60%  { transform: translate(3%,0); }
          70%  { transform: translate(0,3%); }
          80%  { transform: translate(-3%,0); }
          90%  { transform: translate(2%,2%); }
          100% { transform: translate(1%,0); }
        }

        /* Dust/scratch overlay */
        .sw-root::after {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("https://img.freepik.com/premium-photo/white-dust-scratches-black-background_279525-2.jpg?w=640");
          background-repeat: repeat;
          opacity: 0.05;
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 999;
        }

        /* Lenis */
        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto; }
        .lenis.lenis-stopped { overflow: hidden; }
        .lenis.lenis-scrolling iframe { pointer-events: none; }

        /* List item hover wipe (exclusion blend) */
        .sw-list-item {
          position: relative;
          overflow: hidden;
        }
        .sw-list-item::before {
          content: "";
          position: absolute;
          bottom: 0; left: 0;
          width: 100%; height: 0;
          background-color: ${fgColor};
          z-index: 1;
          pointer-events: none;
          transition: height 0.2s cubic-bezier(0.445,0.05,0.55,0.95);
        }
        .sw-list-item:hover::before { height: 100%; }
        .sw-list-item:not(:hover)::before { transition-duration: 0.8s; }
        .sw-list-title, .sw-list-year {
          position: relative;
          z-index: 2;
          mix-blend-mode: exclusion;
        }

        /* Grid image container transitions */
        .sw-img-container.sw-transitioning {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: -1;
        }
        .sw-img-container.sw-transitioning .sw-project-image {
          width: 100%; height: 100%; object-fit: cover;
        }
      `}</style>

      {/* ── Page root ── */}
      <div
        className="sw-root relative w-full overflow-x-hidden uppercase tracking-[-0.03em]"
        style={{
          backgroundColor: bgColor,
          color: fgColor,
          fontFamily: '"PP Neue Montreal", sans-serif',
          fontWeight: 700,
          fontSize: "1.8rem",
        }}
      >

        {/* ── Main content ── */}
        <main className="w-full px-0">
          <div className="grid grid-cols-12 gap-4 px-8 w-full">
            {/* Hero wordmark — clip-path revealed by GSAP */}
            <div className="col-span-12 w-full my-16 min-h-[60vh] max-h-[60vh] flex items-start">
              <LogoSVG fill={fgColor} pathRefs={headerLogoRefs} />
            </div>

            {/* Section header + view toggle */}
            <div className="col-span-12 flex justify-between items-center mb-16">
              <div>
                <h1 className="text-[4rem] uppercase m-0">
                  {sectionLabel}
                  <sup className="text-[2rem] ml-2">{sectionCount}</sup>
                </h1>
              </div>
              <div className="flex gap-8">
                {["list", "grid"].map((v) => (
                  <button
                    key={v}
                    onClick={() => toggleView(v)}
                    className="bg-transparent border-none text-[1.4rem] cursor-pointer transition-all duration-300 py-3 capitalize"
                    style={{
                      fontFamily: '"PP Neue Montreal", sans-serif',
                      fontWeight: 700,
                      color:
                        view === v
                          ? fgColor
                          : `color-mix(in srgb, ${fgColor}, transparent 50%)`,
                    }}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Projects container ── */}
            <div ref={containerRef} className={`col-span-12 ${containerClass}`}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`sw-project-item relative will-change-transform overflow-visible cursor-pointer ${
                    view === "list"
                      ? "sw-list-item flex justify-between py-8 border-b border-[rgba(248,245,242,0.1)]"
                      : "flex flex-col"
                  }`}
                  data-id={project.id}
                >
                  {/* Image container — hidden in list view, shown in grid */}
                  <div
                    className={`sw-img-container ${
                      view === "list"
                        ? "hidden invisible"
                        : "sw-img-container w-full relative mb-4 overflow-hidden block"
                    }`}
                    style={
                      view === "grid"
                        ? {
                            aspectRatio:
                              project.id % 2 !== 0 ? "1 / 1" : "1 / 1.5",
                          }
                        : {}
                    }
                  >
                    <img
                      className="sw-project-image w-full h-full object-cover absolute top-0 left-0"
                      src={project.image}
                      alt={project.title}
                      crossOrigin="anonymous"
                    />
                  </div>

                  {/* Title */}
                  <div
                    className={`sw-project-title ${
                      view === "list"
                        ? "sw-list-title text-[1.8rem]"
                        : "text-[1.6rem] mb-1"
                    }`}
                  >
                    {project.title}
                  </div>

                  {/* Year */}
                  <div
                    className={`sw-project-year ${
                      view === "list"
                        ? "sw-list-year text-[1.8rem]"
                        : "text-[1.4rem] opacity-70"
                    }`}
                  >
                    {project.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ── Image popup overlay ── */}
        <div
          ref={popupRef}
          className="fixed inset-0 items-center justify-center z-[1000] pointer-events-none"
          style={{ background: popupBg, display: "none" }}
        >
          <div
            className="flex items-center justify-center overflow-hidden relative"
            style={{
              width: "40vw",
              maxWidth: "640px",
              aspectRatio: "16 / 9",
              backgroundColor: bgColor,
            }}
          >
            <img
              ref={popupImgRef}
              src={null}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <footer
          className="w-full px-8 py-16 min-h-[75vh] flex flex-col gap-16 justify-between relative"
          style={{ backgroundColor: fgColor, color: bgColor }}
        >
          {/* Footer headline */}
          <div className="sw-footer-header">
            <h2 className="text-[4.5rem] leading-[1.1] tracking-[-0.03em] normal-case m-0">
              <span className="sw-footer-tagline block font-normal opacity-70">
                {footerTagline}
              </span>
              <span className="sw-footer-bold block font-bold">
                {footerBold}
              </span>
            </h2>
          </div>

          {/* Footer wordmark — clip-path revealed on scroll */}
          <div className="sw-footer-logo w-full">
            <LogoSVG fill={bgColor} pathRefs={footerLogoRefs} />
          </div>
        </footer>
      </div>
    </>
  );
}
