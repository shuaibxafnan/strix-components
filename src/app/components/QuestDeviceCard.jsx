"use client";

import { useEffect, useRef, useState } from "react";

// ─── QuestCard ───────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// maxTilt          number   10               Max tilt rotation (degrees)
// tiltSpeed        number   400              Speed of transition on enter/exit (ms)
// tiltScale        number   1.05             Card scale on hover
// tiltPerspective  number   1000             3D Perspective depth (px)
// showGlare        boolean  true             Enable reflection/glare overlay effect
// maxGlare         number   0.4              Maximum opacity of glare layer (0-1)
// projectKey       string   "jSQIShw8nR..."  Unicorn Studio project identifier
// cardTitle        string   "Grab A Device"  Heading text content
// cardDescription  string   "Your journey.." Paragraph body text content
// buttonText       string   "Purchase a..."  Call-to-action link text content
// buttonHref       string   ""               Call-to-action redirection target URL
// ──────────────────────────────────────────────────────────────────────────

export default function QuestCard({
  maxTilt = 10,
  tiltSpeed = 400,
  tiltScale = 1.05,
  tiltPerspective = 1000,
  showGlare = true,
  maxGlare = 0.4,
  projectKey = "jSQIShw8nRxgcNnhfv18",
  cardTitle = "Grab A Device",
  cardDescription = "Your journey into spatial starts now. Get Meta Horizon OS for yourself or power up your entire team.",
  buttonText = "Purchase a Meta Quest",
  buttonHref = "",
}) {
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Injection of Unicorn Studio WebGL script assets
  useEffect(() => {
    if (!mounted) return;

    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false };
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.20/dist/unicornStudio.umd.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (!window.UnicornStudio.isInitialized && window.UnicornStudio.init) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      document.head.appendChild(script);
    } else if (
      !window.UnicornStudio.isInitialized &&
      window.UnicornStudio.init
    ) {
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
    }
  }, [mounted]);

  // Premium Custom Reactive VanillaTilt Engine
  useEffect(() => {
    if (!mounted || !cardRef.current) return;

    const element = cardRef.current;
    let width = element.offsetWidth;
    let height = element.offsetHeight;
    let left = 0;
    let top = 0;
    let updateCall = null;
    let transitionTimeout = null;
    let glareElement = null;

    // Build Glare Layout Layer dynamically if enabled
    if (showGlare) {
      const wrapper = document.createElement("div");
      wrapper.className =
        "absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit] z-20";

      glareElement = document.createElement("div");
      glareElement.className =
        "absolute top-1/2 left-1/2 pointer-events-none bg-gradient-to-b from-white/40 to-transparent opacity-0 origin-[0%_0%]";

      const glareSize = Math.max(width, height) * 2;
      glareElement.style.width = `${glareSize}px`;
      glareElement.style.height = `${glareSize}px`;
      glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
      glareElement.style.transition = `opacity ${tiltSpeed}ms cubic-bezier(.03,.98,.52,.99)`;

      wrapper.appendChild(glareElement);
      element.appendChild(wrapper);
    }

    const setTransition = () => {
      clearTimeout(transitionTimeout);
      element.style.transition = `${tiltSpeed}ms cubic-bezier(.03,.98,.52,.99)`;
      if (glareElement) {
        glareElement.style.transition = `opacity ${tiltSpeed}ms cubic-bezier(.03,.98,.52,.99)`;
      }
      transitionTimeout = setTimeout(() => {
        element.style.transition = "";
        if (glareElement) glareElement.style.transition = "";
      }, tiltSpeed);
    };

    const handleMouseEnter = () => {
      const rect = element.getBoundingClientRect();
      width = element.offsetWidth;
      height = element.offsetHeight;
      left = rect.left;
      top = rect.top;

      element.style.willChange = "transform";
      setTransition();
    };

    const updatePosition = (event) => {
      let x = (event.clientX - left) / width;
      let y = (event.clientY - top) / height;

      x = Math.min(Math.max(x, 0), 1);
      y = Math.min(Math.max(y, 0), 1);

      const tiltX = (maxTilt - x * maxTilt * 2).toFixed(2);
      const tiltY = (y * maxTilt * 2 - maxTilt).toFixed(2);

      const angle =
        Math.atan2(
          event.clientX - (left + width / 2),
          -(event.clientY - (top + height / 2)),
        ) *
        (180 / Math.PI);

      element.style.transform = `perspective(${tiltPerspective}px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) scale3d(${tiltScale}, ${tiltScale}, ${tiltScale})`;

      if (glareElement) {
        glareElement.style.transform = `rotate(${angle}deg) translate(-50%, -50%)`;
        glareElement.style.opacity = `${y * maxGlare}`;
      }

      updateCall = null;
    };

    const handleMouseMove = (event) => {
      if (updateCall !== null) cancelAnimationFrame(updateCall);
      updateCall = requestAnimationFrame(() => updatePosition(event));
    };

    const handleMouseLeave = () => {
      setTransition();
      element.style.transform = `perspective(${tiltPerspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      if (glareElement) {
        glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
        glareElement.style.opacity = "0";
      }
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(transitionTimeout);
      if (updateCall !== null) cancelAnimationFrame(updateCall);
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.innerHTML = element.innerHTML; // Clean out any appended glare layout elements
    };
  }, [
    mounted,
    maxTilt,
    tiltSpeed,
    tiltScale,
    tiltPerspective,
    showGlare,
    maxGlare,
  ]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100lvh] flex items-center justify-center overflow-hidden select-none"
    >
      {/* Google fonts declaration injected inside isolated native scoping blocks */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,600&family=Montserrat:wght@600&display=swap");
        .text-rendering-precision {
          text-rendering: geometricPrecision;
        }
        .custom-card-border {
          background:
            linear-gradient(#fff, #fff) padding-box,
            linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.2),
                rgba(255, 255, 255, 0.05)
              )
              border-box;
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
        }
      `}</style>

      {/* ─── WEBGL BACKGROUND LAYER ────────────────────────────────────────── */}
      <div className="webgl fixed inset-0 -z-10" data-us-project={projectKey} />

      {/* ─── INTERACTIVE TILT CONTAINER CARD ───────────────────────────────── */}
      <main
        ref={cardRef}
        className="relative w-[684px] h-[550px] rounded-[36px] border-2 border-transparent overflow-visible custom-card-border [transform-style:preserve-3d] text-rendering-precision"
      >
        {/* Layer pattern background layer element */}
        <div
          className="absolute inset-0 z-10 rounded-[36px] bg-repeat opacity-100"
          style={{
            backgroundImage:
              "url('https://assets.codepen.io/3165458/pattern.png')",
          }}
        />

        {/* Shading gradient backdrop element overlay layer */}
        <div className="absolute inset-0 z-[2] rounded-[36px] bg-gradient-to-t from-white via-white/0 to-transparent" />

        {/* Floating Asset Block Layer */}
        <div className="absolute z-[3] top-[-20%] left-1/2 -translate-x-1/2 [perspective:1000px] [transform-style:preserve-3d]">
          <img
            src="https://assets.codepen.io/3165458/quest.png"
            alt="Meta Quest 3"
            className="relative block w-[552px] aspect-[552/468] [transform:translateZ(50px)]"
          />
        </div>

        {/* Content Block Area Layer */}
        <article className="absolute z-[3] bottom-0 inset-x-0 flex flex-col items-center justify-center gap-3 p-12 text-center [perspective:1000px] [transform-style:preserve-3d]">
          <h2
            className="m-0 text-[#1c2b33] text-[48px] font-semibold leading-[1.2] tracking-normal [transform:translateZ(50px)]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {cardTitle}
          </h2>

          <p
            className="m-0 text-[#1c2b33] max-w-[70%] mx-auto text-[16px] font-normal leading-[1.44] tracking-normal [transform:translateZ(50px)]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {cardDescription}
          </p>

          <a
            href={buttonHref}
            className="mt-3 px-6 py-[18px] bg-[#0081fa] rounded-z-[12px] rounded-[12px] no-underline text-white text-[16px] font-normal leading-[1.44] tracking-normal [transform:translateZ(50px)] transition-colors duration-200 hover:bg-[#0069cc]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {buttonText}
          </a>
        </article>
      </main>
    </div>
  );
}
