"use client";

import { useEffect, useRef } from "react";
import { Bebas_Neue, Rubik } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-rubik",
});

const REPO =
  "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main";

const BLUR_LAYERS = [
  "backdrop-blur-[1.54px] [mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_17.72%)] [-webkit-mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_17.72%)]",
  "backdrop-blur-[2.93px] [mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_24.69%)] [-webkit-mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_24.69%)]",
  "backdrop-blur-[4px] [mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_30.22%)] [-webkit-mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_30.22%)]",
  "backdrop-blur-[4px] [mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_33.77%)] [-webkit-mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_33.77%)]",
  "backdrop-blur-[4px] [mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_35%)] [-webkit-mask-image:radial-gradient(180%_160%_at_45%_90%,#fff_10%,transparent_35%)]",
];

const EASE = "ease-[cubic-bezier(0.25,1,0.5,1)]";

export default function SweetParallaxCard({
  bodyBgGradient = "from-black to-white",
  cardWidth = "600px",
  cardAspectRatio = "aspect-[2/1.1]",
  cardRadius = "rounded-[4em]",
  mainTitle = "Ceramics",
  locationTitle = "Kiln Studio",
  regionSubTitle = "Handmade in small batches",
  bgImage = "https://images.unsplash.com/photo-1769203905448-0ba060069e6f?auto=format&fit=crop&w=1400&q=80",
  bgAlt = "Earthenware jug on draped fabric",
  heroImage = `${REPO}/duo-brown.png`,
  heroAlt = "Two tone brown vase",
  heroWidth = "60%",
  heroHeight = "100%",
  mouseIntensityX = 30,
  mouseIntensityY = 20,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const setPointer = (x, y) => {
      container.style.setProperty("--x", x);
      container.style.setProperty("--y", y);
    };

    const onMouseMove = (e) =>
      setPointer(
        (e.clientX / window.innerWidth - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      );

    const onOrientation = (e) => {
      const landscape = window.matchMedia("(orientation: landscape)").matches;
      const beta = e.beta || 0;
      const gamma = e.gamma || 0;
      const clamp = (v) => Math.max(-1, Math.min(1, v));
      setPointer(
        clamp(landscape ? beta / 45 : gamma / 45),
        clamp(landscape ? Math.abs(gamma) / 45 : beta / 45),
      );
    };

    const enableOrientation = () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        DeviceOrientationEvent.requestPermission
      ) {
        DeviceOrientationEvent.requestPermission()
          .then((result) => {
            if (result === "granted")
              window.addEventListener("deviceorientation", onOrientation);
          })
          .catch(() => { });
      } else {
        window.addEventListener("deviceorientation", onOrientation);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", enableOrientation, { once: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", enableOrientation);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        "--x": 0,
        "--y": 0,
        "--ix": `${mouseIntensityX}px`,
        "--iy": `${mouseIntensityY}px`,
      }}
      className={`${bebas.variable} ${rubik.variable} flex min-h-screen w-full touch-none select-none items-center justify-center bg-gradient-to-b p-2 [font-family:var(--font-rubik)] ${bodyBgGradient} ${className}`}
    >
      <article
        style={{ width: cardWidth }}
        className={`relative max-h-[calc(100vh-2rem)] w-full max-w-[calc(100%-2rem)] overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.1)] [container-type:inline-size] portrait:min-h-[330px] ${cardAspectRatio} ${cardRadius}`}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-full w-[660px] max-w-none -translate-x-1/2 brightness-90 saturate-150">
            <img
              src={bgImage}
              alt={bgAlt}
              className={`pointer-events-none h-full w-full select-none object-cover transition-[object-position] duration-300 [object-position:calc(50%_+_var(--x)_*_var(--ix))_calc(50%_-_var(--y)_*_var(--iy))] ${EASE}`}
            />
          </div>

          <h3
            className={`pointer-events-none absolute left-1/2 top-[8%] z-[4] m-0 select-none text-[21cqi] uppercase leading-none text-white transition-transform duration-300 [font-family:var(--font-bebas)] [transform:translate(calc(-50%_-_var(--x)_*_var(--ix)),calc(var(--y)_*_var(--iy)_*_-1))] ${EASE}`}
          >
            {mainTitle}
          </h3>
        </div>

        <div className="pointer-events-none absolute inset-0 z-[1]">
          {BLUR_LAYERS.map((layer) => (
            <div
              key={layer}
              className={`absolute inset-0 z-[2] bg-white/[0.015] ${layer}`}
            />
          ))}
        </div>

        <div
          style={{ width: heroWidth, height: heroHeight }}
          className={`pointer-events-none absolute left-1/2 top-0 z-[4] select-none transition-transform duration-300 [transform:translate(calc(-50%_+_var(--x)_*_var(--ix)_*_1.33),calc(var(--y)_*_var(--iy)_*_0.5))] ${EASE}`}
        >
          <img
            src={heroImage}
            alt={heroAlt}
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="absolute bottom-0 z-[3] grid min-h-[32%] w-full place-items-center gap-1 pb-4 text-white">
          <p className="relative m-0 flex items-center gap-2 text-[clamp(0.9rem,3cqi,1.2rem)] font-normal text-white after:absolute after:bottom-[calc(100%+1rem)] after:left-1/2 after:h-px after:w-[20ch] after:-translate-x-1/2 after:bg-white after:content-['']">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="inline-block h-5 w-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742c1.002-.722 2.607-2.124 3.993-3.778 3.125-3.734 4.542-7.243 4.542-11.383 0-4.418-3.582-8-8-8s-8 3.582-8 8c0 4.14 1.417 7.649 4.542 11.383 1.386 1.654 2.99 3.056 3.993 3.778l.071.04.028.015zm.46-8.351a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                clipRule="evenodd"
              />
            </svg>
            {locationTitle}
          </p>
          <p className="m-0 text-[clamp(0.7rem,2.2cqi,0.8rem)] font-light italic tracking-wide text-white/80">
            {regionSubTitle}
          </p>
        </div>
      </article>
    </div>
  );
}