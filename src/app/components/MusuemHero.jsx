"use client";

import { useEffect, useRef, useState } from "react";

// ─── MuseumHero Premium (Fixed Video Layering) ────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// videoSrc         string    Background video looping track stream link URL
// accentColor      string    Tailwind color token used for micro-highlights/borders
// overlayOpacity   string    Tailwind backdrop opacity class to balance media contrast
// logoTextLeft     string    First line branding logo typography string
// logoTextRight    string    Second line branding logo typography string
// ticketLabel      string    Top caption metadata callout message text
// openLabel        string    Bottom sub-header structural open confirmation message
// copyrightText    string    Legal operational fallback footer reference label
// bookButtonText   string    Call to action circular button link text
// ──────────────────────────────────────────────────────────────────────────

export default function MuseumHero({
  videoSrc = "https://cdn.zajno.com/dev/codepen/fossil/fossil.mp4",
  accentColor = "border-amber-500/30 text-amber-400",
  overlayOpacity = "bg-neutral-950/50",
  logoTextLeft = "ARCHAE",
  logoTextRight = "MUSEUM",
  ticketLabel = "Advance General Admission Required",
  openLabel = "Exhibitions Active Today",
  copyrightText = "2026 ARCHAE MUSEUM ONSITE LLC ©",
  bookButtonText = "Reserve Entry",
}) {
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js",
      ),
    ])
      .then(() => {
        const { gsap, CustomEase } = window;
        if (!gsap || !CustomEase || !containerRef.current) return;

        gsap.registerPlugin(CustomEase);

        const customEaseIn = CustomEase.create(
          "custom-ease-in",
          "0.25, 1, 0.5, 1",
        );
        const fortyFrames = 1.4;
        const fiftyFrames = 1.8;
        const twoFrames = 0.4;
        const fourFrames = 0.6;
        const sixFrames = 0.8;

        const root = containerRef.current;

        const header = root.querySelector("header");
        const book = root.querySelector(".first-desc-span");
        const open = root.querySelector(".second-desc-span");
        const copy = root.querySelector(".copyright-span");
        const scrollToRows = root.querySelectorAll(".scroll-to-span");
        const btnCircle = root.querySelector(".book-btn-circle");
        const btnText = root.querySelector(".btn-text-span");
        const layoutLine = root.querySelector(".layout-decorative-line");

        const eve = root.querySelector("#eve span");
        const ry = root.querySelector("#ry span");
        const fo = root.querySelector("#fo span");
        const ssil = root.querySelector("#ssil span");
        const tells = root.querySelector("#tells span");
        const a = root.querySelector("#a span");
        const st = root.querySelector("#st span");
        const ory = root.querySelector("#ory span");

        const tl = gsap.timeline();

        tl.fromTo(
          btnCircle,
          { autoAlpha: 0, scale: 0.7 },
          { autoAlpha: 1, scale: 1, duration: fortyFrames, ease: customEaseIn },
          0,
        )
          .fromTo(
            header,
            { y: "-100%", opacity: 0 },
            { y: "0%", opacity: 1, duration: fortyFrames, ease: customEaseIn },
            0,
          )
          .fromTo(
            layoutLine,
            { scaleX: 0 },
            { scaleX: 1, duration: fiftyFrames, ease: "power2.out" },
            0.2,
          )
          .fromTo(
            eve,
            { y: "110%" },
            { y: "0%", duration: fiftyFrames, ease: customEaseIn },
            0,
          )
          .fromTo(
            book,
            { y: "150%" },
            { y: "0%", duration: fortyFrames, ease: customEaseIn },
            twoFrames,
          )
          .fromTo(
            fo,
            { y: "110%" },
            { y: "0%", duration: fiftyFrames, ease: customEaseIn },
            twoFrames,
          )
          .fromTo(
            a,
            { y: "110%" },
            { y: "0%", duration: fiftyFrames, ease: customEaseIn },
            twoFrames,
          )
          .fromTo(
            ory,
            { y: "110%" },
            { y: "0%", duration: fiftyFrames, ease: customEaseIn },
            twoFrames,
          )
          .fromTo(
            open,
            { y: "150%" },
            { y: "0%", duration: fortyFrames, ease: customEaseIn },
            fourFrames,
          )
          .fromTo(
            btnText,
            { y: "150%" },
            { y: "0%", duration: fortyFrames, ease: customEaseIn },
            fourFrames,
          )
          .fromTo(
            ry,
            { y: "110%" },
            { y: "0%", duration: fiftyFrames, ease: customEaseIn },
            fourFrames,
          )
          .fromTo(
            ssil,
            { y: "110%" },
            { y: "0%", duration: fiftyFrames, ease: customEaseIn },
            fourFrames,
          )
          .fromTo(
            tells,
            { y: "110%" },
            { y: "0%", duration: fiftyFrames, ease: customEaseIn },
            fourFrames,
          )
          .fromTo(
            st,
            { y: "110%" },
            { y: "0%", duration: fiftyFrames, ease: customEaseIn },
            fourFrames,
          )
          .fromTo(
            copy,
            { y: "150%" },
            { y: "0%", duration: fortyFrames, ease: customEaseIn },
            sixFrames,
          )
          .fromTo(
            scrollToRows,
            { y: "150%" },
            { y: "0%", duration: fortyFrames, ease: customEaseIn },
            sixFrames,
          );
      })
      .catch((e) =>
        console.error("[MuseumHero] GSAP injection sequence failure:", e),
      );
  }, [isClient]);

  if (!isClient) {
    return <div className="w-full h-screen bg-neutral-950" />;
  }

  return (
    <div
      ref={containerRef}
      className="bg-neutral-950 text-neutral-50 min-h-screen w-full select-none overflow-hidden relative antialiased"
    >
      {/* Editorial Navigation Header */}
      <header className="fixed top-0 left-0 w-full h-24 px-6 md:px-12 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 font-serif font-black tracking-[0.25em] text-xs md:text-sm">
          <span className="text-white">{logoTextLeft}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-neutral-400 font-light tracking-[0.4em]">
            {logoTextRight}
          </span>
        </div>
        <ul className="flex items-center gap-8 list-none font-sans text-[10px] tracking-[0.3em] uppercase font-semibold text-neutral-400">
          <li className="cursor-pointer hover:text-white transition-colors relative group py-2">
            Security
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amber-500 transition-all group-hover:w-full" />
          </li>
          <li className="cursor-pointer hover:text-white transition-colors relative group py-2">
            Helpcenter
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amber-500 transition-all group-hover:w-full" />
          </li>
        </ul>
      </header>

      {/* Main Structural Viewport */}
      <section className="w-full h-screen relative flex items-center px-6 md:px-16 lg:px-24">
        {/* Fullscreen Looping Video Background Frame (Layered behind overlay and text) */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-10 pointer-events-none transform scale-[1.01]"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Ambient Dark Dimming Overlay Layer (Sits immediately on top of the video) */}
        <div
          className={`absolute inset-0 z-20 ${overlayOpacity} transition-colors duration-500`}
        />

        {/* Decorative Grid Line Component */}
        <div className="layout-decorative-line absolute top-[52%] left-6 right-6 md:left-16 md:right-24 h-[1px] bg-white/10 origin-left z-30 hidden sm:block" />

        {/* Central Content Text & Button Elements Stage Wrapper */}
        <div className="w-full relative z-30 flex flex-col justify-center">
          <div className="relative">
            {/* Context Label Left Side Hook */}
            <div className="absolute -top-12 left-2 overflow-hidden h-6 flex">
              <span className="first-desc-span text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-neutral-400 font-sans flex items-center gap-2">
                <span
                  className={`w-1 h-1 rounded-full ${accentColor.split(" ")[1] || "bg-amber-400"}`}
                />{" "}
                {ticketLabel}
              </span>
            </div>

            {/* Typography Display Title */}
            <h1 className="text-[11vw] sm:text-[9vw] lg:text-[8.5vw] font-serif font-extrabold uppercase tracking-tight leading-[0.85] text-white">
              {/* Row 1 */}
              <div className="flex flex-wrap mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div id="eve" className="overflow-hidden inline-flex">
                  <span>Eve</span>
                </div>
                <div id="ry" className="overflow-hidden inline-flex mr-[2vw]">
                  <span>ry</span>
                </div>
                <div id="fo" className="overflow-hidden inline-flex">
                  <span>fo</span>
                </div>
                <div id="ssil" className="overflow-hidden inline-flex">
                  <span>ssil</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-wrap pl-[8vw] sm:pl-[12vw] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div
                  id="tells"
                  className="overflow-hidden inline-flex mr-[2vw] text-neutral-300 font-normal italic"
                >
                  <span>tells</span>
                </div>
                <div id="a" className="overflow-hidden inline-flex mr-[2vw]">
                  <span>a</span>
                </div>
                <div id="st" className="overflow-hidden inline-flex">
                  <span>st</span>
                </div>
                <div id="ory" className="overflow-hidden inline-flex">
                  <span>ory</span>
                </div>
              </div>
            </h1>

            {/* Context Label Right Side Hook */}
            <div className="absolute -bottom-12 right-[10%] sm:right-[20%] overflow-hidden h-6 flex">
              <span className="second-desc-span text-[10px] md:text-xs font-semibold tracking-[0.4em] uppercase text-neutral-300 font-sans bg-neutral-900/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/5">
                {openLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Global Footer Layout Elements Matrix */}
        <div className="absolute bottom-10 left-6 right-6 md:left-16 md:right-16 z-30 flex justify-between items-end font-sans">
          {/* Metadata Copyright column */}
          <div className="overflow-hidden h-5 hidden lg:flex">
            <span className="copyright-span text-[10px] tracking-[0.25em] text-neutral-500 font-medium uppercase">
              {copyrightText}
            </span>
          </div>

          {/* Scrolling Action Display Help Node */}
          <div className="flex flex-col text-left tracking-[0.3em] uppercase text-[9px] md:text-[10px] text-neutral-400 pl-0 sm:pl-[8vw]">
            <div className="overflow-hidden h-4 flex">
              <span className="scroll-to-span opacity-60">
                System Navigation
              </span>
            </div>
            <div className="overflow-hidden h-4 flex mt-0.5">
              <span className="scroll-to-span text-white font-bold flex items-center gap-1.5">
                Scroll to Explore{" "}
                <span className="text-amber-500 text-xs">↓</span>
              </span>
            </div>
          </div>

          {/* Premium Call to Action Circular Trigger Component */}
          <div className="book-btn relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center cursor-pointer group">
            {/* Dynamic Glassmorphic Target Ring */}
            <div
              className={`book-btn-circle absolute inset-0 border ${accentColor.split(" ")[0]} rounded-full transition-all duration-500 group-hover:scale-105 group-hover:bg-white/5 group-hover:border-white/40 shadow-[0_0_30px_rgba(0,0,0,0.2)]`}
            />
            <div className="absolute inset-2 border border-dashed border-white/5 rounded-full group-hover:rotate-45 transition-transform duration-1000 ease-out" />

            {/* Label text block */}
            <div className="w-20 text-center overflow-hidden flex justify-center z-10">
              <span className="btn-text-span text-[9px] md:text-[10px] font-black tracking-[0.25em] uppercase text-white leading-tight">
                {bookButtonText}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
