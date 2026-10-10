"use client";

import { useEffect, useRef, useState } from "react";

// ─── SweetParallaxCard ────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bodyBgGradient    string    from-[#e68d9f] to-[#ffffff]  Main page backdrop spectrum
// cardWidth         string    600px                        Horizontal base sizing
// cardAspectRatio   string    aspect-[2/1.1]               Strict layout aspect locking ratio
// cardRadius        string    rounded-[4em]                Structural corner curvature styling
// mainTitle         string    CUPCAKES                     Primary bold background banner text
// locationTitle     string    Sweet Dreams Bakery          Primary destination line text
// regionSubTitle    string    Los Angeles, CA              Secondary regional text string
// bgImage           string    ...                          Remote cloud texture background path
// heroImage         string    ...                          Isolated primary floating subject path
// heroWidth         string    200px                        Strict width boundary for hero graphic
// heroHeight        string    250px                        Strict height boundary for hero graphic
// mouseIntensityX   number    30                           Parallax horizontal response weight
// mouseIntensityY   number    20                           Parallax vertical response weight
// ──────────────────────────────────────────────────────────────────────────

export default function SweetParallaxCard({
  bodyBgGradient = "from-[#e68d9f] to-[#ffffff]",
  cardWidth = "600px",
  cardAspectRatio = "aspect-[2/1.1]",
  cardRadius = "rounded-[4em]",
  mainTitle = "CUPCAKES",
  locationTitle = "Sweet Dreams Bakery",
  regionSubTitle = "Los Angeles, CA",
  bgImage = "http://mattcannon.games/codepen/sweet-treats/bg.webp",
  heroImage = "http://mattcannon.games/codepen/sweet-treats/cup-cake.png",
  heroWidth = "200px",
  heroHeight = "250px",
  mouseIntensityX = 30,
  mouseIntensityY = 20,
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // Inject fonts directly to prevent layout shifts and guarantee the exact original appearance
    if (!document.getElementById("parallax-fonts")) {
      const link = document.createElement("link");
      link.id = "parallax-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rubik:ital,wght@0,400;0,500;1,400&display=swap";
      document.head.appendChild(link);
    }

    // Direct DOM manipulation bypasses React render loops to completely eliminate jerky transitions
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
      const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

      containerRef.current.style.setProperty("--x", xNorm);
      containerRef.current.style.setProperty("--y", yNorm);
    };

    const handleOrientation = (e) => {
      if (!containerRef.current) return;
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const beta = e.beta || 0;
      const gamma = e.gamma || 0;

      const xVal = Math.max(
        -1,
        Math.min(1, isLandscape ? beta / 45 : gamma / 45),
      );
      const yVal = Math.max(
        -1,
        Math.min(1, isLandscape ? Math.abs(gamma) / 45 : beta / 45),
      );

      containerRef.current.style.setProperty("--x", xVal);
      containerRef.current.style.setProperty("--y", yVal);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const initOrientation = () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        DeviceOrientationEvent.requestPermission
      ) {
        DeviceOrientationEvent.requestPermission()
          .then((result) => {
            if (result === "granted") {
              window.addEventListener("deviceorientation", handleOrientation);
            }
          })
          .catch((err) => console.error("Orientation permission denied:", err));
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    document.body.addEventListener("click", initOrientation, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
      document.body.removeEventListener("click", initOrientation);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-neutral-900">
        <div
          style={{ maxWidth: cardWidth }}
          className="w-full aspect-[2/1.1] rounded-2xl bg-neutral-800 animate-pulse"
        />
      </div>
    );
  }

  const blurLayers = [
    { index: 1, blur: "1.54px", stop: "7.72%" },
    { index: 2, blur: "2.93px", stop: "14.69%" },
    { index: 3, blur: "4.04px", stop: "20.22%" },
    { index: 4, blur: "4.75px", stop: "23.77%" },
    { index: 5, blur: "5.00px", stop: "25.00%" },
  ];

  return (
    <div
      ref={containerRef}
      style={{ "--x": 0, "--y": 0 }}
      className={`w-full min-h-screen flex items-center justify-center p-2 touch-none select-none bg-gradient-to-b ${bodyBgGradient} bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] bg-blend-overlay font-['Rubik',sans-serif]`}
    >
      <article
        style={{ maxWidth: `calc(100% - 2rem)`, width: cardWidth }}
        className={`w-full ${cardAspectRatio} portrait:min-h-[330px] max-h-[calc(100vh-2rem)] relative overflow-hidden ${cardRadius} shadow-[0_10px_20px_rgba(0,0,0,0.1)]`}
      >
        {/* ─── VISUAL ASSETS CONTAINER LAYER ─── */}
        <div className={`absolute inset-0 ${cardRadius} overflow-hidden z-0`}>
          {/* Background Clouds Graphic */}
          <div
            style={{
              objectPosition: `calc(50% + (var(--x) * ${mouseIntensityX}px)) calc(50% + (var(--y) * ${-mouseIntensityY}px))`,
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[660px] max-w-none saturate-[1.5] brightness-[0.9] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
          >
            <img
              src={bgImage}
              alt="Background clouds"
              className="w-full h-full object-cover object-center pointer-events-none select-none"
            />
          </div>

          {/* Whimsical Hero Text Block */}
          <h3
            style={{
              transform: `translate(calc(-50% + (var(--x) * ${-mouseIntensityX}px)), calc(var(--y) * ${-mouseIntensityY}px))`,
            }}
            className="absolute left-1/2 top-[8%] m-0 text-[8rem] uppercase text-white font-['Bebas_Neue',sans-serif] z-[4] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] leading-none select-none pointer-events-none"
          >
            {mainTitle}
          </h3>

          {/* Floating Cupcake Graphic */}
          <div
            style={{
              width: heroWidth,
              height: heroHeight,
              transform: `translate(calc(-50% + (var(--x) * ${mouseIntensityX * 1.33}px)), calc(var(--y) * ${mouseIntensityY * 0.5}px))`,
            }}
            className="absolute top-0 left-1/2 h-full z-[99] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none select-none"
          >
            <img
              src={heroImage}
              alt="Hero Subject"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* ─── DYNAMIC RADIAL BLUR MATRIX LAYERS ─── */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          {blurLayers.map((layer) => (
            <div
              key={layer.index}
              style={{
                backdropFilter: `blur(min(${layer.blur}, 4px))`,
                maskImage: `radial-gradient(180% 160% at 45% 90%, #fff 10%, rgba(0,0,0,0) calc((10 + ${parseFloat(layer.stop)}) * 1%))`,
                WebkitMaskImage: `radial-gradient(180% 160% at 45% 90%, #fff 10%, rgba(0,0,0,0) calc((10 + ${parseFloat(layer.stop)}) * 1%))`,
              }}
              className="absolute inset-0 bg-white/[0.015] z-[2]"
            />
          ))}
        </div>

        {/* ─── CARD METADATA CONTENT ONDOCK LAYER ─── */}
        <div className="min-h-[32%] absolute bottom-0 w-full text-white grid gap-1 place-items-center align-content-center pb-4 z-[3] font-['Rubik',sans-serif]">
          <p className="m-0 flex items-center gap-2 text-[1.2rem] text-white font-normal relative after:content-[''] after:absolute after:bottom-[calc(100%+1rem)] after:left-1/2 after:-translate-x-1/2 after:w-[20ch] after:bg-white after:h-[1px]">
            {/* Fine-lined Vector Marker Pin */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-[20px] h-[20px] text-white inline-block"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742c1.002-.722 2.607-2.124 3.993-3.778 3.125-3.734 4.542-7.243 4.542-11.383 0-4.418-3.582-8-8-8s-8 3.582-8 8c0 4.14 1.417 7.649 4.542 11.383 1.386 1.654 2.99 3.056 3.993 3.778l.071.04.028.015zm.46-8.351a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                clipRule="evenodd"
              />
            </svg>
            {locationTitle}
          </p>
          <p className="m-0 text-[0.8rem] text-white/80 tracking-wide italic font-light">
            {regionSubTitle}
          </p>
        </div>
      </article>
    </div>
  );
}
