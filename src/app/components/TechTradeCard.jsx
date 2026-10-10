"use client";

import { useEffect, useRef } from "react";

// ─── HoloCard ────────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// cardWidth        string   "260px"     Width of the card (aspect ratio 5:7)
// borderColor      string   "hsl(0 0% 25%)"  Rear-face border / frame tint
// name             string   "Jhey Tompkins"  Top line of the front-face title
// role             string   "Staff Design Engineer"  Second line of the title
// frontImage       string   headshot url     Blended background photo (pattern/watermark layer)
// frameImage       string   transparent headshot url  Foreground cut-out photo shown in the frame
// wordmarkImage    string   codepen wordmark url   Repeated logo art on the card back
// gemstoneImage    string   codepen gemstone url   Center emblem on the card back
// backdropImage    string   codepen backdrop url   Full-bleed background art on the card back
// rotateX          number   25          Max tilt (deg) on the X axis while hovering
// rotateY          number   -20         Max tilt (deg) on the Y axis while hovering
// parallaxImgX     string   "5%"        How far the inner photo shifts horizontally with the pointer
// parallaxImgY     string   "5%"        How far the inner photo shifts vertically with the pointer
// animateIntro     boolean  true        Play the glare-wipe + signature draw-on intro once on mount
// footerCopyright  string   "TechTrades © 2025"  Small embossed text along the card bottom edge
// showBearLink     boolean  false       Show the small top-left social icon link from the original demo
// ──────────────────────────────────────────────────────────────────────────

const CSS_TEXT = `
.holo-card-scope * , .holo-card-scope *::before, .holo-card-scope *::after {
  box-sizing: border-box;
  transform-style: preserve-3d;
}

.holo-card-scope {
  --pointer-x: 0;
  --pointer-y: 0;
}

.holo-card-scope .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.holo-card-scope .bear-link {
  color: canvasText;
  position: fixed;
  top: 1rem;
  left: 1rem;
  display: grid;
  place-items: center;
  opacity: 0.8;
}
.holo-card-scope .bear-link:hover { opacity: 1; }

.holo-card-scope .scene {
  perspective: 1000px;
  position: fixed;
  inset: 0;
  transform: translate3d(0, 0, 100vmin);
}

.holo-card-scope .card {
  --border: 8cqi;
  aspect-ratio: 5 / 7;
  width: var(--card-width);
  container-type: inline-size;
  touch-action: none;
  background: transparent;
  color: hsl(0 0% 10%);
  font-family: "Sora", sans-serif;
  perspective: 1600px;
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  display: block;
  transition: transform 0.2s;
}

.holo-card-scope .card img,
.holo-card-scope .card *::after,
.holo-card-scope .card *::before {
  will-change: translate, scale, filter;
}

.holo-card-scope .card button {
  position: absolute;
  z-index: 100;
  inset: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  opacity: 0;
}

.holo-card-scope .card *:not(button) {
  pointer-events: none;
}

.holo-card-scope .card .img,
.holo-card-scope .card .pattern,
.holo-card-scope .card .spotlight,
.holo-card-scope .card .watermark,
.holo-card-scope .card .card__rear,
.holo-card-scope .card .card__content,
.holo-card-scope .card .card__emboss,
.holo-card-scope .card .glare-container,
.holo-card-scope .card .card__front {
  position: absolute;
  inset: 0;
  border-radius: var(--border);
}

.holo-card-scope .card .card__emboss {
  filter: url(#lighting);
}

.holo-card-scope .card__front .img::before {
  content: "";
  position: absolute;
  inset: 0;
  background: hsl(0 0% 50%);
}

.holo-card-scope .card__front,
.holo-card-scope .card__rear {
  backface-visibility: hidden;
}

.holo-card-scope .card__front > *:not(.debug) {
  clip-path: inset(0 0 0 0 round var(--border));
}

.holo-card-scope .card__rear {
  clip-path: inset(0 0 0 0 round var(--border));
  transform-style: preserve-3d;
  position: absolute;
  inset: 0;
  background: color-mix(in oklch, var(--border-color), #000);
  transform: rotateY(180deg) translate3d(0, 0, 1px);
}

.holo-card-scope .card__rear > img,
.holo-card-scope .card__front > .img img {
  width: 100%;
  object-fit: cover;
  height: 100%;
  scale: 1.1;
  position: absolute;
  inset: 0;
}

.holo-card-scope .card__frame {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: var(--border);
}

.holo-card-scope .card__frame * {
  will-change: translate, scale, filter;
}

.holo-card-scope .card__frame h3 {
  margin: 0;
  top: var(--border);
  right: var(--border);
  text-align: right;
  letter-spacing: -0.05em;
  font-weight: 1000;
  line-height: 1;
  z-index: 100;
  position: absolute;
}

.holo-card-scope .card__frame h3 span {
  filter: url(#sticker);
  display: block;
}

.holo-card-scope .card__frame h3 span:first-of-type { font-size: 10cqi; }
.holo-card-scope .card__frame h3 span:last-of-type { font-size: 5cqi; }

.holo-card-scope .card__frame img {
  width: 100%;
  object-fit: cover;
  height: 100%;
  scale: 1.1;
  position: absolute;
  inset: 0;
  filter: saturate(0.8) contrast(1.2) drop-shadow(0 0 10cqi hsl(0 0% 10% / 0.75));
}

.holo-card-scope .card__frame .signature {
  color: hsl(45 20% 60%);
  position: absolute;
  z-index: 100;
  width: 38cqi;
  bottom: calc(var(--border) * 1.1);
  right: calc(var(--border) * 0.6);
  rotate: 20deg;
}

.holo-card-scope .card__frame .sticker {
  position: absolute;
  width: calc(var(--border) * 2.75);
  bottom: calc(var(--border) * 0.75);
  left: calc(var(--border) * 0.65);
  z-index: 100;
}

.holo-card-scope .card:has([aria-pressed="true"]) .card__content {
  rotate: 180deg y;
}

.holo-card-scope .card__content {
  transition: rotate 0.26s ease-out;
  transform-style: preserve-3d;
}

.holo-card-scope .card__emboss {
  position: absolute;
  inset: 0;
  filter: url(#lighting);
  border-radius: var(--border);
  clip-path: inset(0 0 0 0 round var(--border));
}

.holo-card-scope .card__emboss::before {
  content: "TechTrades";
  position: absolute;
  bottom: 0;
  left: 50%;
  height: calc(var(--border) * 0.5);
  display: flex;
  place-items: center;
  translate: -50% 0;
  color: #fff;
  font-size: 1.5cqi;
  opacity: 0.8;
  z-index: 100;
}

.holo-card-scope .card__emboss::after {
  content: "";
  position: absolute;
  inset: 0;
  border: calc(var(--border) * 0.5) solid var(--border-color);
  border-radius: var(--border);
  z-index: 99;
}

.holo-card-scope .img img {
  filter: brightness(0.85);
}

.holo-card-scope .pattern,
.holo-card-scope .watermark {
  filter: saturate(0.8) contrast(1) brightness(1);
  mask: url(https://assets.codepen.io/605876/figma-texture.png) 50% 50% / 4cqi 4cqi;
  opacity: 0.4;
  mix-blend-mode: multiply;
}

.holo-card-scope .pattern::before {
  content: "";
  position: absolute;
  inset: 0;
  background: hsl(0 0% 80%);
}

.holo-card-scope .watermark {
  filter: saturate(0.9) contrast(1.1) brightness(1.2);
  mask: url(https://assets.codepen.io/605876/shopify-pattern.svg) 50% 50% / 14cqi 14cqi repeat;
  opacity: 1;
  mix-blend-mode: hard-light;
}

.holo-card-scope .watermark::before {
  content: "";
  position: absolute;
  inset: 0;
  background: hsl(0 0% 100% / 0.2);
}

.holo-card-scope .refraction {
  position: absolute;
  width: 500%;
  aspect-ratio: 1 / 1;
  bottom: 0;
  left: 0;
  filter: saturate(2);
  will-change: translate, scale, filter;
  background: radial-gradient(circle at 0 100%, transparent 10%, hsl(5 100% 80%), hsl(150 100% 60%), hsl(220 90% 70%), transparent 60%);
  transform-origin: 0 100%;
  scale: min(1, 0.15 + var(--pointer-x) * 0.25);
  translate: clamp(-10%, -10% + var(--pointer-x) * 10%, 10%) calc(max(0%, (var(--pointer-y) * -1) * 10%));
  opacity: 0;
  transition: opacity 0.2s ease-out;
}

.holo-card-scope .refraction:nth-of-type(2) {
  bottom: unset;
  top: 0;
  left: unset;
  right: 0;
  scale: min(1, 0.15 + var(--pointer-x) * -0.65);
  translate: clamp(-10%, 10% - var(--pointer-x) * -10%, 10%) calc(min(0%, var(--pointer-y) * -10%));
  transform-origin: 100% 0;
  background: radial-gradient(circle at 100% 0, transparent 10%, hsl(5 100% 80%), hsl(150 100% 60%), hsl(220 90% 70%), transparent 60%);
}

.holo-card-scope .card[data-active="true"]:hover .refraction,
.holo-card-scope .card[data-active="true"]:hover .spotlight::before {
  opacity: 1;
}

.holo-card-scope .glare {
  position: absolute;
  opacity: 0.5;
  inset: 0;
  background: linear-gradient(-65deg, transparent 0 40%, #fff 40% 50%, transparent 30% 50%, transparent 50% 55%, #fff 55% 60%, transparent 60% 100%);
}

.holo-card-scope .spotlight {
  mix-blend-mode: overlay;
  z-index: 9999999;
  clip-path: inset(0 0 0 0 round var(--border));
}

.holo-card-scope .spotlight::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 500%;
  opacity: 0;
  aspect-ratio: 1;
  background: radial-gradient(hsl(0 0% 100% / 0.4) 0 2%, hsl(0 0% 10% / 0.2) 20%);
  filter: brightness(1.2) contrast(1.2);
  translate: calc(-50% + (var(--pointer-x) * 20%)) calc(-50% + (var(--pointer-y) * 20%));
  z-index: 99999;
  transition: opacity 0.2s ease-out;
}

.holo-card-scope .wordmark {
  position: absolute;
  width: 70%;
  left: 50%;
  translate: -50% 0;
  top: 12%;
  height: max-content;
}

.holo-card-scope .wordmark::after {
  content: "\\2122";
  position: absolute;
  top: 100%;
  right: 0;
  color: #fff;
}

.holo-card-scope .wordmark:last-of-type {
  top: unset;
  bottom: 12%;
  rotate: 180deg;
}

.holo-card-scope .wordmark img {
  position: static;
  width: 100%;
  height: auto;
}

.holo-card-scope .gemstone {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: auto;
  translate: -50% -50%;
  filter: hue-rotate(320deg);
}

.holo-card-scope .card[data-active="true"]:hover {
  transition: transform 0s;
  transform: rotateX(calc(var(--pointer-y) * var(--rotate-x))) rotateY(calc(var(--pointer-x) * var(--rotate-y)));
}

.holo-card-scope .card[data-active="true"]:hover .card__front img {
  transition: transform 0s;
  translate: calc(var(--pointer-x) * var(--parallax-img-x)) calc(var(--pointer-y) * var(--parallax-img-y));
}

.holo-card-scope .flip-hint {
  position: absolute;
  top: calc(100% + 1.5rem);
  left: 50%;
  translate: -50% 0;
  white-space: nowrap;
  font-size: 0.875rem;
  font-family: "Sora", sans-serif;
  color: hsl(0 0% 40%);
  opacity: 0.8;
  transition: opacity 0.3s ease-out;
}

.holo-card-scope .card:has([aria-pressed="true"]) .flip-hint {
  opacity: 0;
}

.holo-card-scope .card[data-active="false"] .flip-hint {
  opacity: 0;
}

.holo-card-scope .card:not(:hover) img {
  transition: translate 0.2s;
}
`;

export default function TechTradeCard({
  cardWidth = "260px",
  borderColor = "hsl(0 0% 25%)",
  name = "Jhey Tompkins",
  role = "Staff Design Engineer",
  frontImage = "https://assets.codepen.io/605876/headshot--square.jpeg",
  frameImage = "https://assets.codepen.io/605876/headshot--square-transparent.png",
  wordmarkImage = "https://assets.codepen.io/605876/techtrades-wordmark.png",
  gemstoneImage = "https://assets.codepen.io/605876/techtrades-gemstone.png",
  backdropImage = "https://assets.codepen.io/605876/techtrades-backdrop.png",
  rotateX = 25,
  rotateY = -20,
  parallaxImgX = "5%",
  parallaxImgY = "5%",
  animateIntro = true,
  showBearLink = false,
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    const cleanupFns = [];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector('script[data-id="' + src + '"]')) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error("Failed: " + src));
        document.head.appendChild(el);
      });

    const init = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js",
        );
      } catch (e) {
        console.error("[HoloCard] CDN load failed:", e.message);
        return;
      }

      if (disposed) return;
      const gsap = window.gsap;
      if (!gsap || !cardRef.current) return;

      const card = cardRef.current;
      const lightNode = card.querySelector("fePointLight");

      const syncLight = (x, y) => {
        const bounds = card.getBoundingClientRect();
        gsap.set(lightNode, {
          attr: { x: Math.floor(x - bounds.x), y: Math.floor(y - bounds.y) },
        });
      };

      const onMove = (e) => {
        const bounds = card.getBoundingClientRect();
        const posX = e.clientX - bounds.x;
        const posY = e.clientY - bounds.y;
        const ratioX = posX / bounds.width - 0.5;
        const ratioY = posY / bounds.height - 0.5;
        const pointerX = gsap.utils.clamp(-1, 1, ratioX * 2).toFixed(2);
        const pointerY = gsap.utils.clamp(-1, 1, ratioY * 2).toFixed(2);
        gsap.set(card, { "--pointer-x": pointerX, "--pointer-y": pointerY });
        syncLight(e.clientX, e.clientY);
      };

      syncLight(window.innerWidth / 2, window.innerHeight);
      document.body.addEventListener("pointermove", onMove);
      cleanupFns.push(() =>
        document.body.removeEventListener("pointermove", onMove),
      );

      const flipper = card.querySelector("button");
      const onFlip = () => {
        if (card.dataset.active === "false") return;
        flipper.ariaPressed = flipper.matches('[aria-pressed="false"]')
          ? "true"
          : "false";
      };
      if (flipper) {
        flipper.addEventListener("click", onFlip);
        cleanupFns.push(() => flipper.removeEventListener("click", onFlip));
      }

      if (!animateIntro) {
        card.dataset.active = "true";
        const glareContainer = card.querySelector(".glare-container");
        if (glareContainer) glareContainer.style.display = "none";
        return;
      }

      const signaturePaths = card.querySelectorAll(".sig, .ear, .eye, .nose");
      gsap.set(signaturePaths, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(card.querySelector(".glare"), { xPercent: 100 });
      gsap.set(
        [
          card.querySelector(".sticker"),
          card.querySelector("h3"),
          card.querySelector(".card__front > .img img"),
          card.querySelector(".watermark"),
        ],
        { opacity: 0 },
      );

      const activate = () => {
        card.dataset.active = "true";
        gsap.set(
          [
            card,
            card.querySelector(".watermark"),
            card.querySelector(".card__front > .img img"),
            card.querySelector(".sticker"),
            card.querySelector("h3"),
          ],
          { clearProps: "all" },
        );
      };

      const tl = gsap.timeline({
        delay: 0.5,
        onComplete: () => {
          const glareContainer = card.querySelector(".glare-container");
          if (glareContainer) glareContainer.remove();
          activate();
        },
      });

      tl.to(card.querySelector(".glare"), {
        delay: 0.25,
        xPercent: -100,
        duration: 0.65,
        ease: "power2.inOut",
      })
        .to(
          card.querySelector(".watermark"),
          { opacity: 1, duration: 0.5 },
          "<50%",
        )
        .to(
          card.querySelector(".card__front > .img img"),
          { opacity: 1, duration: 0.5 },
          "<",
        )
        .to(card.querySelector(".sticker"), { opacity: 1, duration: 0.5 })
        .to(card.querySelector("h3"), { opacity: 1 })
        .to(card.querySelector(".sig"), {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power2.in",
        })
        .to(card.querySelectorAll(".ear"), {
          strokeDashoffset: 0,
          duration: 0.1,
          ease: "power2.in",
        })
        .to(card.querySelectorAll(".eye"), {
          strokeDashoffset: 0,
          duration: 0.1,
          ease: "power2.in",
        })
        .to(card.querySelector(".nose"), {
          strokeDashoffset: 0,
          duration: 0.1,
          ease: "power2.in",
        })
        .to(card.querySelectorAll(".eye, .nose"), {
          fill: "hsl(45 20% 60%)",
          duration: 0.2,
        });

      cleanupFns.push(() => tl.kill());
    };

    init();

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateIntro]);

  return (
    <div
      className="holo-card-scope relative w-screen h-screen overflow-hidden bg-white"
      style={{
        "--card-width": cardWidth,
        "--border-color": borderColor,
        "--rotate-x": rotateX + "deg",
        "--rotate-y": rotateY + "deg",
        "--parallax-img-x": parallaxImgX,
        "--parallax-img-y": parallaxImgY,
      }}
    >
      <div className="scene">
        <article ref={cardRef} className="card" data-active="false">
          <button aria-label="Flip card" aria-pressed="false" />
          <div className="flip-hint">Tap on card to flip</div>
          <div className="card__content">
            <div className="card__rear">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={backdropImage} alt="" />
              <div className="card__emboss">
                <div className="wordmark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={wordmarkImage} alt="Wordmark" />
                </div>
                <div className="wordmark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={wordmarkImage} alt="Wordmark" />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="gemstone" src={gemstoneImage} alt="" />
              </div>
              <div className="spotlight" />
            </div>

            <div className="card__front">
              <div className="img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frontImage} alt="" />
              </div>

              <div className="pattern">
                <div className="refraction" />
                <div className="refraction" />
              </div>

              <div className="watermark">
                <div className="refraction" />
                <div className="refraction" />
              </div>

              <div className="card__frame card__emboss">
                <h3>
                  <span>{name}</span>
                  <br />
                  <span>{role}</span>
                </h3>

                <svg
                  className="signature"
                  viewBox="0 0 271 209"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="sig"
                    d="M40.3725 26.8984C58.6558 41.1564 141.659 43.1867 128.248 5.48254C127.911 4.53766 127.085 2.2403 125.938 2.0095C124.714 1.76297 121.929 6.39448 121.627 6.82375C100.965 36.1863 95.2641 73.5992 74.5923 102.644C63.7045 117.942 14.7891 145.678 5.55986 113.481C-17.5939 32.705 78.7483 76.0672 105.741 67.4678C119.757 63.0021 125.297 50.6825 132.831 39.1622C135.218 35.5126 137.628 24.6153 140.043 28.2467C144.771 35.3581 119.642 69.8761 115.559 78.4692C110.959 88.1482 129.228 46.7461 136.796 54.3333C146.229 63.7897 128.236 82.7359 153.367 61.6804C157.634 58.1059 166.582 46.4029 161.033 46.8455C153.977 47.4085 141.565 67.0198 151.685 70.0327C161.531 72.9635 176.039 38.7196 174.012 48.7901C173.009 53.769 168.343 67.3695 175.978 68.9069C186.537 71.0328 191.574 35.8659 197.537 44.8359C240.356 109.24 81.7126 283.324 50.2184 167.261C25.2159 75.1229 240.563 89.2082 268.88 137.08"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                  />
                  <path
                    className="ear"
                    d="M187.183 101.246C182.107 82.5407 155.739 77.9455 151.5 99"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                  />
                  <path
                    className="ear"
                    d="M117.998 100.704C117.998 91.1516 103.912 87.3662 96.5585 89.3717C84.7816 92.5836 80.6315 99.053 80.6315 110.505"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                  />
                  <path
                    className="eye"
                    d="M170.025 108.347C168.627 105.551 162.781 110.631 165.494 114.577C168.207 118.523 173.936 114.091 171.643 109.965C171.035 108.871 168.547 107.832 167.355 108.428"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                  />
                  <path
                    className="eye"
                    d="M102.952 112.797C97.2672 112.797 96.7371 120.527 102.224 119.917C108.363 119.235 105.409 110.012 100.363 113.04"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                  />
                  <path
                    className="nose"
                    d="M144.745 123.82C146.652 122.562 141.479 121.621 140.561 121.402C136.485 120.429 124.736 118.793 124.42 125.721C123.695 141.628 160.767 131.457 140.492 121.735"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                  />
                </svg>

                <div className="sticker">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.4424 2C11.9459 2 12.4309 2.19736 12.834 2.54395C13.886 2.67641 14.5463 3.39492 14.9531 4.12695C14.9629 4.12666 14.973 4.12598 14.9834 4.12598C15.0672 4.12598 15.1497 4.13696 15.2295 4.15723C15.3369 4.15986 15.4444 4.17904 15.5479 4.2168C15.6375 4.24958 15.7129 4.28866 15.7754 4.32715L15.9277 4.43555L15.9336 4.44043C16.038 4.52674 16.3555 4.83697 16.5879 5.06445C16.6718 5.14653 16.7544 5.22729 16.8271 5.29883C16.9299 5.30628 17.0455 5.3149 17.1621 5.32324C17.3399 5.33596 17.5194 5.34896 17.6582 5.3584C17.8286 5.36999 17.8758 5.37207 17.8496 5.37207C18.416 5.37207 18.895 5.78432 18.9932 6.33789H18.9941C18.9944 6.33958 18.9944 6.34291 18.9951 6.34766C18.9958 6.35188 18.9964 6.35612 18.9971 6.36035C19.0447 6.66662 19.5269 9.88637 20 13.0498C20.2478 14.7065 20.4953 16.3608 20.6807 17.6006C20.7733 18.2202 20.8503 18.7364 20.9043 19.0977C20.9313 19.2783 20.9523 19.4208 20.9668 19.5176C20.974 19.5658 20.9797 19.603 20.9834 19.6279C20.9853 19.6404 20.9864 19.6499 20.9873 19.6562C20.9877 19.6592 20.988 19.6615 20.9883 19.6631L20.9893 19.665C21.0673 20.1873 20.7253 20.6805 20.209 20.791L14.7383 21.9619C14.6696 21.9766 14.5995 21.9844 14.5293 21.9844H14.5117C14.495 21.9844 14.4785 21.9823 14.4619 21.9814C14.3428 22.0034 14.2194 22.006 14.0977 21.9834L3.81738 20.0732C3.29502 19.9762 2.94007 19.4868 3.00879 18.96V18.959C3.00895 18.9578 3.00945 18.9555 3.00977 18.9531C3.01041 18.9482 3.01144 18.9403 3.0127 18.9307C3.01521 18.9114 3.0186 18.8828 3.02344 18.8457C3.03319 18.7709 3.0472 18.6612 3.06543 18.5215C3.10191 18.2419 3.15401 17.842 3.2168 17.3613C3.34242 16.3996 3.51079 15.1132 3.68066 13.8164C4.00323 11.3539 4.33802 8.80754 4.39453 8.41992L4.41992 8.2334C4.43049 8.16437 4.44351 8.09076 4.46094 8.02051C4.50083 7.85986 4.58002 7.63519 4.7666 7.42773C4.94521 7.22918 5.15029 7.12714 5.28516 7.07031C5.4127 7.01657 5.55986 6.97143 5.6748 6.93555V6.93652C5.8434 6.87969 6.26083 6.74923 6.79102 6.58789C7.01733 5.83529 7.38744 4.90112 7.94824 4.07617C8.65879 3.03094 9.79438 2.00001 11.4424 2ZM8.44141 12.6699C8.46512 12.8773 8.52598 13.0209 8.5957 13.1338C8.69653 13.297 8.84542 13.4455 9.07324 13.6338C9.25478 13.7838 9.61582 14.0528 9.86816 14.3301C10.167 14.6585 10.4423 15.1192 10.4424 15.7451C10.4424 16.2802 10.1291 16.9729 9.4668 17.2822C9.81294 17.2261 10.0876 17.0743 10.2891 16.8594C10.5485 16.5825 10.751 16.1354 10.751 15.4883C10.751 14.8598 10.4364 14.4804 9.90723 14.0674C9.7707 13.9608 9.63557 13.8637 9.4834 13.7529C9.34086 13.6492 9.17593 13.528 9.02637 13.3994C8.85891 13.2554 8.60201 13.0136 8.44141 12.6699ZM11.0898 10.1641C10.9756 10.1641 10.866 10.1687 10.7607 10.1768C10.905 10.1896 11.0421 10.2095 11.1699 10.2344L11.1934 10.167C11.1599 10.1661 11.1254 10.1641 11.0898 10.1641Z"
                      fill="#fff"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.5027 20.9843L19.9147 19.8135C19.9147 19.8135 17.9617 6.60375 17.9459 6.516C17.9324 6.429 17.8604 6.372 17.7877 6.372C17.7149 6.372 16.3409 6.27 16.3409 6.27C16.3409 6.27 15.3847 5.3145 15.2617 5.21175C15.2279 5.184 15.2054 5.169 15.1709 5.15625L14.4854 20.9843H14.5027ZM11.7824 11.4788C11.7824 11.4788 11.1749 11.1607 10.4519 11.1607C9.36669 11.1607 9.32394 11.8403 9.32394 12.0165C9.32394 12.9405 11.7539 13.3027 11.7539 15.4882C11.7539 17.2095 10.6739 18.3082 9.19944 18.3082C7.43394 18.3082 6.54444 17.2095 6.54444 17.2095L7.02894 15.645C7.02894 15.645 7.96269 16.4445 8.73894 16.4445C9.24519 16.4445 9.47019 16.0357 9.47019 15.7455C9.47019 14.5312 7.47969 14.475 7.47969 12.4763C7.45419 10.7985 8.65794 9.16425 11.0999 9.16425C12.0427 9.16425 12.5062 9.435 12.5062 9.435L11.7974 11.4713L11.7824 11.4788ZM11.3774 3.6225C11.4794 3.6225 11.5807 3.651 11.6812 3.72375C10.9432 4.0725 10.1332 4.953 9.80019 6.71775C9.30819 6.8775 8.83044 7.0215 8.38344 7.15125C8.77269 5.8125 9.71319 3.63 11.3774 3.63V3.6225ZM12.3037 5.83425V5.9355C11.7382 6.1095 11.1164 6.2985 10.5082 6.4875C10.8577 5.15475 11.5079 4.50375 12.0719 4.25925C12.2167 4.635 12.3037 5.14125 12.3037 5.83425ZM12.7079 4.15875C13.2284 4.21425 13.5637 4.809 13.7797 5.475C13.5179 5.5605 13.2284 5.64825 12.9112 5.7495V5.5605C12.9112 4.9965 12.8392 4.53225 12.7079 4.15725V4.15875ZM14.9519 5.1255C14.9369 5.1255 14.9069 5.14125 14.8934 5.14125C14.8799 5.14125 14.6767 5.1975 14.3579 5.29875C14.0407 4.374 13.4759 3.52125 12.4769 3.52125H12.3907C12.1012 3.15675 11.7517 3 11.4487 3C9.11919 3 8.00619 5.90775 7.65744 7.3845C6.76194 7.65825 6.11019 7.8615 6.03744 7.89C5.53119 8.04975 5.51694 8.064 5.45844 8.5425C5.40219 8.889 4.08594 19.0897 4.08594 19.0897L14.2567 21L14.9519 5.1255Z"
                      fill="black"
                    />
                  </svg>
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frameImage} alt="" />
              </div>

              <div className="spotlight" />
              <div className="glare-container">
                <div className="glare" />
              </div>
            </div>
          </div>
        </article>
      </div>

      <svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="lighting">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feSpecularLighting
              result="lighting"
              in="blur"
              surfaceScale="8"
              specularConstant="12"
              specularExponent="120"
              lightingColor="hsl(0 0% 6%)"
            >
              <fePointLight x="50" y="50" z="300" />
            </feSpecularLighting>
            <feComposite
              in="lighting"
              in2="SourceAlpha"
              operator="in"
              result="composite"
            />
            <feComposite
              in="SourceGraphic"
              in2="composite"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              result="litPaint"
            />
          </filter>
          <filter id="sticker">
            <feMorphology
              in="SourceAlpha"
              result="dilate"
              operator="dilate"
              radius="2"
            />
            <feFlood floodColor="hsl(0 0% 100%)" result="outlinecolor" />
            <feComposite
              in="outlinecolor"
              in2="dilate"
              operator="in"
              result="outlineflat"
            />
            <feMerge result="merged">
              <feMergeNode in="outlineflat" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {showBearLink ? (
        <a
          className="bear-link"
          href="https://twitter.com/intent/follow?screen_name=jh3yy"
          target="_blank"
          rel="noreferrer noopener"
        >
          <svg
            viewBox="0 0 969 955"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "36px" }}
          >
            <circle
              cx="161.191"
              cy="320.191"
              r="133.191"
              stroke="currentColor"
              strokeWidth="20"
            />
            <circle
              cx="806.809"
              cy="320.191"
              r="133.191"
              stroke="currentColor"
              strokeWidth="20"
            />
            <circle cx="695.019" cy="587.733" r="31.4016" fill="currentColor" />
            <circle cx="272.981" cy="587.733" r="31.4016" fill="currentColor" />
            <path
              d="M564.388 712.083C564.388 743.994 526.035 779.911 483.372 779.911C440.709 779.911 402.356 743.994 402.356 712.083C402.356 680.173 440.709 664.353 483.372 664.353C526.035 664.353 564.388 680.173 564.388 712.083Z"
              fill="currentColor"
            />
            <rect
              x="310.42"
              y="448.31"
              width="343.468"
              height="51.4986"
              fill="#FF1E1E"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M745.643 288.24C815.368 344.185 854.539 432.623 854.539 511.741H614.938V454.652C614.938 433.113 597.477 415.652 575.938 415.652H388.37C366.831 415.652 349.37 433.113 349.37 454.652V511.741L110.949 511.741C110.949 432.623 150.12 344.185 219.845 288.24C289.57 232.295 384.138 200.865 482.744 200.865C581.35 200.865 675.918 232.295 745.643 288.24Z"
              fill="currentColor"
            />
          </svg>
        </a>
      ) : null}

      <style>{CSS_TEXT}</style>
    </div>
  );
}
