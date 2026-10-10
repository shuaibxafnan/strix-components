"use client";

import { useState, useEffect, useRef } from "react";

// ─── ProgressCar ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// carImageUrl        string   "..."    Dynamic vector image source path for the car
// wheelImageUrl      string   "..."    Dynamic vector image source path for the wheel rims
// accentColor        string   "#ec4899" Primary highlight hue used across layout rulers
// carHeightScale     number   3.2      Proportional aspect ratio divisor for the body profile
// wheelPositionFront number   5.4      Horizontal placement scale constant for front wheel
// wheelPositionRear  number   7        Horizontal placement scale constant for rear wheel
// ──────────────────────────────────────────────────────────────────────────

export default function ProgressCar({
  carImageUrl = "https://ik.imagekit.io/akiAfnan/bullitt-mustang-to-be-restored-jpg-Photoroom.png",
  wheelImageUrl = "https://cdn-icons-png.flaticon.com/512/3721/3721665.png",
  accentColor = "#ec4899",
  carHeightScale = 3.2,
  wheelPositionFront = 5.4,
  wheelPositionRear = 7,
}) {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isDebug, setIsDebug] = useState(false);

  const articleRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = window.scrollY / totalHeight;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!mounted) return null;

  const currentCarWidth = Math.min(windowWidth / 3, 600);
  const wheelSize = currentCarWidth / 14;
  const PI = 3.14159;
  const circumference = PI * wheelSize;
  const roadLength = windowWidth - currentCarWidth;
  const totalRotations = roadLength / circumference;
  const currentRotation = 360 * totalRotations * scrollProgress;

  return (
    <div
      className={`min-h-screen font-mono antialiased bg-[#09090b] text-[#a1a1aa] transition-colors duration-500 selection:bg-zinc-800 selection:text-white ${
        isDebug ? "bg-grid-pattern text-zinc-400" : ""
      }`}
    >
      {/* Editorial Glassmorphic Header Controls */}
      <div className="fixed top-6 right-6 z-50 backdrop-blur-md bg-zinc-900/40 border border-zinc-800/80 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-xl">
        <span className="text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          System Diagnostics
        </span>
        <div className="h-3 w-[1px] bg-zinc-800" />
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-200">
          <input
            type="checkbox"
            checked={isDebug}
            onChange={() => setIsDebug(!isDebug)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-zinc-200 peer-checked:after:bg-zinc-900 relative" />
          <span className="min-w-[40px] uppercase text-[11px]">
            {isDebug ? "Active" : "Muted"}
          </span>
        </label>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-6 py-24 sm:py-32">
        <header className="mb-20">
          <span className="text-xs uppercase tracking-[0.25em] text-zinc-600 font-semibold block mb-2">
            Dynamic Scroll Metric
          </span>
          <h1 className="text-4xl font-light text-zinc-100 tracking-tight sm:text-5xl">
            Kinematic Interface
          </h1>
          <div className="w-12 h-[1px] bg-zinc-800 mt-6" />
        </header>

        <main
          ref={articleRef}
          className={`space-y-8 text-sm leading-relaxed text-justify transition-opacity duration-500 ${
            isDebug ? "opacity-10" : "opacity-100"
          }`}
        >
          <article className="space-y-6">
            <h2 className="text-zinc-200 font-medium text-lg tracking-tight mb-4">
              An Architectural Framework
            </h2>
            <p>
              Lorem quasi magni placeat voluptates deserunt, eos ex, eum Quod
              molestiae odio fugit ad ullam Hic suscipit obcaecati nulla non
              maiores, qui. Ratione optio obcaecati error nihil deleniti Sit
              odit? Dolor tempora harum cum rerum sunt magnam! Est id iure
              repellat necessitatibus earum voluptates Quaerat libero rem
              cupiditate corporis repudiandae? Repellendus eaque quas laborum
              error labore Facilis sunt exercitationem dolor.
            </p>
            <p>
              Amet ipsa beatae harum voluptatem laudantium delectus? Suscipit in
              rerum culpa rerum harum totam illum! Similique nam officiis sit
              recusandae temporibus. Id officia reiciendis iusto neque iure hic.
              Delectus exercitationem? Consectetur delectus dolorem doloribus
              quisquam officiis earum Doloribus fuga cumque ipsa sint
              voluptatibus, similique Praesentium itaque quisquam officiis
              labore id? Architecto hic odit perspiciatis facilis officiis
              expedita, dolorum Dolore veritatis.
            </p>
            <p>
              Lorem quasi magni placeat voluptates deserunt, eos ex, eum Quod
              molestiae odio fugit ad ullam Hic suscipit obcaecati nulla non
              maiores, qui. Ratione optio obcaecati error nihil deleniti Sit
              odit? Dolor tempora harum cum rerum sunt magnam! Est id iure
              repellat necessitatibus earum voluptates Quaerat libero rem
              cupiditate corporis repudiandae? Repellendus eaque quas laborum
              error labore Facilis sunt exercitationem dolor.
            </p>
            <p>
              Amet ipsa beatae harum voluptatem laudantium delectus? Suscipit in
              rerum culpa rerum harum totam illum! Similique nam officiis sit
              recusandae temporibus. Id officia reiciendis iusto neque iure hic.
              Delectus exercitationem? Consectetur delectus dolorem doloribus
              quisquam officiis earum Doloribus fuga cumque ipsa sint
              voluptatibus, similique Praesentium itaque quisquam officiis
              labore id? Architecto hic odit perspiciatis facilis officiis
              expedita, dolorum Dolore veritatis Sit nostrum sunt eligendi
              delectus quis? Facilis quos sapiente libero repellat rem. Culpa
              similique minima corporis laudantium est, quis Natus velit cumque
              eligendi amet rem. Similique voluptas rerum dignissimos laborum?
            </p>
            <p>
              Lorem quasi magni placeat voluptates deserunt, eos ex, eum Quod
              molestiae odio fugit ad ullam Hic suscipit obcaecati nulla non
              maiores, qui. Ratione optio obcaecati error nihil deleniti Sit
              odit?
            </p>
            <p>
              Consectetur delectus dolorem doloribus quisquam officiis earum
              Doloribus fuga cumque ipsa sint voluptatibus, similique
              Praesentium itaque quisquam officiis labore id? Architecto hic
              odit perspiciatis facilis officiis expedita, dolorum Dolore
              veritatis.
            </p>
            <p>
              Sit nostrum sunt eligendi delectus quis? Facilis quos sapiente
              libero repellat rem. Culpa similique minima corporis laudantium
              est, quis Natus velit cumque eligendi amet rem. Similique voluptas
              rerum dignissimos laborum? Lorem quasi magni placeat voluptates
              deserunt, eos ex, eum Quod molestiae odio fugit ad ullam Hic
              suscipit obcaecati nulla non maiores, qui. Ratione optio obcaecati
              error nihil deleniti Sit odit?
            </p>
          </article>
        </main>
      </div>

      {/* Debug Layout Metrics / Rulers */}
      {isDebug && (
        <div className="fixed bottom-[35%] left-0 w-full h-12 flex z-0 border-t border-b border-zinc-900/60 opacity-80 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="h-full border-r border-zinc-900 flex items-end p-1 text-[9px] font-mono text-zinc-600"
              style={{
                width: `${circumference}px`,
                backgroundColor: i % 2 === 0 ? "#121214" : "#18181b",
              }}
            >
              <span>REV_0{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress Track Blueprint Line */}
      <div className="fixed bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent z-10" />

      {/* Moving Vehicle Frame Rig */}
      <div
        className="fixed transition-all duration-100 ease-out z-20 pointer-events-none will-change-transform -scale-x-100"
        style={{
          width: `${currentCarWidth}px`,
          height: `${currentCarWidth / carHeightScale}px`,
          bottom: isDebug ? "35%" : "0px",
          transform: `translateX(${-scrollProgress * roadLength}px)`
        }}
      >
        {/* Car chassis container */}
        <div
          className="w-full h-full bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url('${carImageUrl}')` }}
        />

        {/* Wheel - Left / Front */}
        <div
          className="absolute transition-transform duration-100 ease-out rounded-full bg-center bg-no-repeat bg-contain flex items-center justify-center"
          style={{
            width: `${wheelSize}px`,
            height: `${wheelSize}px`,
            bottom: `${wheelSize / 4}px`,
            left: `${currentCarWidth / wheelPositionFront}px`,
            transform: `rotate(${currentRotation}deg)`,
            backgroundImage: `url('${wheelImageUrl}')`,
          }}
        >
          {isDebug && (
            <div
              className="absolute w-0.5 h-16 origin-center pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />
          )}
        </div>

        {/* Wheel - Right / Rear */}
        <div
          className="absolute transition-transform duration-100 ease-out rounded-full bg-center bg-no-repeat bg-contain flex items-center justify-center"
          style={{
            width: `${wheelSize}px`,
            height: `${wheelSize}px`,
            bottom: `${wheelSize / 4}px`,
            right: `${currentCarWidth / wheelPositionRear}px`,
            transform: `rotate(${currentRotation}deg)`,
            backgroundImage: `url('${wheelImageUrl}')`,
          }}
        >
          {isDebug && (
            <div
              className="absolute w-0.5 h-16 origin-center pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
