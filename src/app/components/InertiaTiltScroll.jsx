"use client";

import { useEffect, useRef } from "react";

// ─── ScrollRevealGallery ──────────────────────────────────────────────────────
//
// Scroll-driven gallery with per-image 3D rotate + translateX animations.
// Uses a "fake scroll" technique: the grid container is fixed-positioned and
// driven by translateY matching window.scrollY, while each image gets an
// individual perspective transform as it crosses the viewport.
//
// The scroll container is the wrapper div itself (overflow-y: scroll,
// height: 100vh) — NOT window — so it works correctly inside Next.js layouts.
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// imageSrc         string[]   (10 CDN images)   Array of image URLs to display
// columnGap        string     "10%"             CSS gap between the two columns
// imageWidth       number     300               Width (px) of each image card
// ease             number     0.075             Scroll lag (lower = lazier)
// translateXMax    number     -200              Max px images slide horizontally
//                                               on desktop (odd column slides in)
// rotateXMin       number     20                Min abs X-rotation per image (deg)
// rotateXMax       number     40                Max abs X-rotation per image (deg)
// rotateYMin       number     20                Min abs Y-rotation per image (deg)
// rotateYMax       number     60                Max abs Y-rotation per image (deg)
// bgColor          string     "#9f9eac"         Page background color
// bgImage          string     (wave SVG)        CSS background-image value
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BG_IMAGE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg %3E%3Cpath fill='%23aeadbc' d='M486 705.8c-109.3-21.8-223.4-32.2-335.3-19.4C99.5 692.1 49 703 0 719.8V800h843.8c-115.9-33.2-230.8-68.1-347.6-92.2C492.8 707.1 489.4 706.5 486 705.8z'/%3E%3Cpath fill='%23bdbccc' d='M1600 0H0v719.8c49-16.8 99.5-27.8 150.7-33.5c111.9-12.7 226-2.4 335.3 19.4c3.4 0.7 6.8 1.4 10.2 2c116.8 24 231.7 59 347.6 92.2H1600V0z'/%3E%3Cpath fill='%23cdccdd' d='M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z'/%3E%3Cpath fill='%23dcdbee' d='M0 0v429.4c55.6-18.4 113.5-27.3 171.4-27.7c102.8-0.8 203.2 22.7 299.3 54.5c3 1 5.9 2 8.9 3c183.6 62 365.7 146.1 562.4 192.1c186.7 43.7 376.3 34.4 557.9-12.6V0H0z'/%3E%3Cpath fill='%23ecebff' d='M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z'/%3E%3Cpath fill='%23dcdbee' d='M1600 0H0v136.3c62.3-20.9 127.7-27.5 192.2-19.2c93.6 12.1 180.5 47.7 263.3 89.6c2.6 1.3 5.1 2.6 7.7 3.9c158.4 81.1 319.7 170.9 500.3 223.2c210.5 61 430.8 49 636.6-16.6V0z'/%3E%3Cpath fill='%23cdccdd' d='M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z'/%3E%3Cpath fill='%23bdbccc' d='M1600 0H498c118.1 85.8 243.5 164.5 386.8 216.2c191.8 69.2 400 74.7 595 21.1c40.8-11.2 81.1-25.2 120.3-41.7V0z'/%3E%3Cpath fill='%23aeadbc' d='M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z'/%3E%3Cpath fill='%239f9eac' d='M1315.3 72.4c75.3-12.6 148.9-37.1 216.8-72.4h-723C966.8 71 1144.7 101 1315.3 72.4z'/%3E%3C/g%3E%3C/svg%3E\")";

const DEFAULT_IMAGES = Array.from(
  { length: 10 },
  (_, i) =>
    `https://cdn.jsdelivr.net/gh/lmgonzalves/scroll-based-animation/img/image${i + 1}.jpg`,
);

// Easing: ease-out quad — used for translateX deceleration
function easeOutQuad(t) {
  return t * (2 - t);
}

// Random integer between min and max inclusive
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random integer, positive or negative
function randomSign(min, max) {
  return random(min, max) * (Math.random() > 0.5 ? 1 : -1);
}

// Sets transform + vendor prefix
function setTransform(el, transform) {
  el.style.transform = transform;
  el.style.WebkitTransform = transform;
}

export default function InertialTiltScroll({
  imageSrc = DEFAULT_IMAGES,
  columnGap = "10%",
  imageWidth = 300,
  ease = 0.075,
  translateXMax = -200,
  rotateXMin = 20,
  rotateXMax = 40,
  rotateYMin = 20,
  rotateYMax = 60,
  bgColor = "#9f9eac",
  bgImage = DEFAULT_BG_IMAGE,
}) {
  // The outer div that acts as the scroll container (height:100vh, overflow-y:scroll)
  const scrollerRef = useRef(null);
  // The fixed-position image grid (moved via translateY to simulate scroll)
  const containerRef = useRef(null);
  // Invisible absolute spacer whose height = total stacked image height
  const fakeScrollRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const container = containerRef.current;
    const fakeScroll = fakeScrollRef.current;
    if (!scroller || !container || !fakeScroll) return;

    // ── Seed per-image random rotation limits ─────────────────────────────────
    // Done here (inside effect) so values are stable and match between runs
    const rotateXMaxList = imageSrc.map(() =>
      randomSign(rotateXMin, rotateXMax),
    );
    const rotateYMaxList = imageSrc.map(() =>
      randomSign(rotateYMin, rotateYMax),
    );

    // ── State variables (mirror the original's IIFE vars exactly) ─────────────
    let current = 0; // animated scroll position
    let target = 0; // native scroll position
    let rafId;
    let rafActive = false;

    // Dimension cache — filled by setupAnimation()
    let windowWidth = 0;
    let imageHeight = 0; // height of ONE image = window.innerHeight (each is 100vh)

    const images = Array.from(container.querySelectorAll(".srg-image"));

    // ── Helpers ───────────────────────────────────────────────────────────────

    function setupAnimation() {
      windowWidth = scroller.clientWidth;
      // Each image is exactly 100vh tall; imageHeight is the per-row height
      // In 2-col layout: rows = images.length/2, in 1-col: rows = images.length
      // But imageHeight should be viewport height (each card is 100vh)
      imageHeight = scroller.clientHeight; // = one viewport height
      // Total scrollable height: number of rows * imageHeight
      const rows =
        windowWidth > 760 ? Math.ceil(images.length / 2) : images.length;
      const totalHeight = rows * imageHeight;
      fakeScroll.style.height = `${totalHeight}px`;
      startAnimation();
    }

    function updateScroll() {
      target = scroller.scrollTop;
      startAnimation();
    }

    function startAnimation() {
      if (!rafActive) {
        rafActive = true;
        rafId = requestAnimationFrame(updateAnimation);
      }
    }

    function updateAnimation() {
      const diff = target - current;
      // Stop when close enough to avoid infinite micro-updates
      const delta = Math.abs(diff) < 0.1 ? 0 : diff * ease;

      if (delta) {
        current += delta;
        current = parseFloat(current.toFixed(2));
        rafId = requestAnimationFrame(updateAnimation);
      } else {
        current = target;
        rafActive = false;
        cancelAnimationFrame(rafId);
      }

      updateAnimationImages();
      // Shift the entire grid up by `current` to simulate scrolling
      setTransform(container, `translateY(${-current}px)`);
    }

    function updateAnimationImages() {
      // ratio: how many full image-heights have been scrolled
      const ratio = current / imageHeight;

      images.forEach((image, index) => {
        // Which "row" does this image sit in?
        const rowIndex = windowWidth > 760 ? Math.floor(index / 2) : index;
        // How far is this row from the currently-scrolled position?
        // 0 = perfectly centered in viewport, ±1 = one full viewport away
        const intersectionRatioValue = ratio - rowIndex;
        // Clamp: 1 = fully visible, 0 = off-screen
        const intersectionRatio = Math.max(
          0,
          1 - Math.abs(intersectionRatioValue),
        );

        // rotateX: full at off-screen, 0 at center
        const rXMax = rotateXMaxList[index];
        let rotateX = parseFloat(
          (rXMax - rXMax * intersectionRatio).toFixed(2),
        );

        // rotateY: same
        const rYMax = rotateYMaxList[index];
        let rotateY = parseFloat(
          (rYMax - rYMax * intersectionRatio).toFixed(2),
        );

        // translateX: desktop only, eased
        let translateX = 0;
        if (windowWidth > 760) {
          translateX = parseFloat(
            (
              translateXMax -
              translateXMax * easeOutQuad(intersectionRatio)
            ).toFixed(2),
          );
        }

        // Invert rotations when image is below the viewport center
        if (intersectionRatioValue < 0) {
          rotateX = -rotateX;
          rotateY = -rotateY;
          // Odd-index (right column) images slide from the right when below
          translateX = index % 2 ? -translateX : 0;
        } else {
          // Even-index (left column) images slide from the left when above
          translateX = index % 2 ? 0 : translateX;
        }

        setTransform(
          image,
          `perspective(500px) translateX(${translateX}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        );
      });
    }

    // ── Wire up events ────────────────────────────────────────────────────────
    scroller.addEventListener("scroll", updateScroll);
    window.addEventListener("resize", setupAnimation);

    // Initial setup
    setupAnimation();

    return () => {
      scroller.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", setupAnimation);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // Props that feed into the animation loop are captured at mount.
    // If they change, the parent should remount this component (add a key prop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    /*
     * Scroll container: 100vh tall, scrolls internally.
     * The background is on this element (fixed attachment so it doesn't move).
     * overflow-x:hidden suppresses horizontal scrollbar from translateX animations.
     */
    <div
      ref={scrollerRef}
      className="relative w-full overflow-x-hidden"
      style={{
        height: "100vh",
        overflowY: "scroll",
        backgroundColor: bgColor,
        backgroundImage: bgImage,
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/*
       * Fake scroll spacer: absolute, full width, height driven by JS.
       * Its height = (number of rows) * 100vh, making the container scrollable.
       * pointer-events:none so it never captures clicks.
       */}
      <div
        ref={fakeScrollRef}
        className="absolute top-0 left-0 w-full pointer-events-none"
        aria-hidden="true"
      />

      {/*
       * Fixed-position image grid (relative to the viewport, NOT the scroller).
       * translateY is applied by JS to fake the scroll movement.
       * pointer-events:none so the fixed layer never blocks scroll on the container.
       * Two columns: left column items align right, right column items align left,
       * creating a centered pair of image strips.
       */}
      <div
        ref={containerRef}
        className="fixed top-0 left-0 w-full pointer-events-none"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap,
          justifyItems: "end",
        }}
      >
        {imageSrc.map((src, i) => (
          /*
           * Each image div:
           * - h-screen = 100vh (one full viewport per image)
           * - background-image, width, justifySelf are runtime values → inline style
           * - will-change:transform promotes each to its own compositor layer
           * - odd-indexed cards (right column) align to the left edge of their cell
           */
          <div
            key={i}
            className="srg-image bg-no-repeat bg-center"
            style={{
              width: imageWidth,
              height: "100vh",
              backgroundImage: `url('${src}')`,
              justifySelf: i % 2 === 1 ? "start" : "end",
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* Mobile: collapse to single centered column */}
      <style>{`
        @media screen and (max-width: 760px) {
          .srg-container {
            grid-template-columns: 1fr !important;
            justify-items: center !important;
          }
          .srg-image {
            justify-self: center !important;
          }
        }
      `}</style>
    </div>
  );
}
