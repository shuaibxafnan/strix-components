"use client";

import { useEffect, useRef, useState } from "react";

// ─── TravelOverlayMenu ────────────────────────────────────────────────────────
//
// Props Explanation
// ──────────────────────────────────────────────────────────────────────────
// menuLinks         array     Main links containing `label` and `href`
// socialLinks       array     Social ecosystem links containing `label` and `href`
// bgImages          array     Background images mapping to the respective menu item hover index
// logoUrl           string    Source URL for the brand navbar logo
// navCtaText        string    Text rendered inside the navbar action button
// heroHeader        string    The prominent text rendered inside the hero banner
// heroCtaText       string    Text rendered inside the hero banner call-to-action button
// heroCtaDesc       string    The body paragraph layout adjacent to the main CTA button
// accentElementUrl  string    The SVG decorative graphic inside the hero CTA container
// heroBgUrl         string    Main fallback background image for the hero section
// ──────────────────────────────────────────────────────────────────────────

export default function VoyageMenu({
  menuLinks = [
    { label: "HOME", href: "/" },
    { label: "ABOUT US", href: "/" },
    { label: "EXPLORE TRIPS", href: "/" },
    { label: "SERVICES", href: "/" },
    { label: "CONTACT US", href: "/" },
  ],
  socialLinks = [
    { label: "Instagram", href: "/" },
    { label: "TikTok", href: "/" },
    { label: "Facebook", href: "/" },
  ],
  bgImages = [
    "https://ik.imagekit.io/kg2nszxjp/travel-menu/bg-1.webp", // Default
    "https://ik.imagekit.io/kg2nszxjp/travel-menu/bg-2.webp", // Home
    "https://ik.imagekit.io/kg2nszxjp/travel-menu/bg-3.webp", // About Us
    "https://ik.imagekit.io/kg2nszxjp/travel-menu/bg-4.webp", // Explore Trips
    "https://ik.imagekit.io/kg2nszxjp/travel-menu/bg-5.webp", // Services
    "https://ik.imagekit.io/kg2nszxjp/travel-menu/bg-6.webp", // Contact Us
  ],
  logoUrl = "https://ik.imagekit.io/kg2nszxjp/travel-menu/logo.svg",
  navCtaText = "EXPLORE TRIPS",
  heroHeader = "Find Your Way to Anywhere in the world",
  heroCtaText = "EXPLORE TRIPS",
  heroCtaDesc = "From cityscapes to beaches, we guide you. We handle details so you can focus on getting lost in the moment.",
  accentElementUrl = "https://ik.imagekit.io/kg2nszxjp/travel-menu/accent-element.svg",
  heroBgUrl = "https://ik.imagekit.io/kg2nszxjp/travel-menu/home-bg.webp",
}) {
  const containerRef = useRef(null);
  const menuTimelineRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Eliminate server-side layout shifts and hydration mismatch errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Dynamically inject Google Fonts safely within client boundaries
    if (!document.getElementById("travel-fonts")) {
      const link = document.createElement("link");
      link.id = "travel-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Anton&family=Mona+Sans:wght@400;600&display=swap";
      document.head.appendChild(link);
    }

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
        el.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(el);
      });

    // Cascade loading sequence for GSAP and dependencies
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
    ])
      .then(() => {
        // Load custom SplitText or simulation safely after GSAP is natively available on window
        return loadScript(
          "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/EasePack.min.js",
        ).then(() => window.gsap);
      })
      .then((gsap) => {
        if (!gsap || !containerRef.current) return;

        const container = containerRef.current;
        const items = container.querySelectorAll(".menu-overlay__main ul li");
        const bgImgs = container.querySelectorAll(".menu-overlay__bg-img img");
        const menuOverlay = container.querySelector(".menu-overlay");
        const pageContent = container.querySelector(".page-content");
        const toggleButton = container.querySelector("#menu-toggle");

        // ─── Menu Overlay Background Hover Logic ─────────────────────────────
        gsap.set(bgImgs[0], { opacity: 1 });

        items.forEach((item, index) => {
          item.addEventListener("mouseenter", () => {
            gsap.to(bgImgs, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut",
            });
            if (bgImgs[index + 1]) {
              gsap.to(bgImgs[index + 1], {
                opacity: 1,
                scale: 1.18,
                duration: 0.5,
                ease: "power3.inOut",
              });
            }
          });

          item.addEventListener("mouseleave", () => {
            gsap.to(bgImgs, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut",
              scale: 1,
            });
            gsap.to(bgImgs[0], {
              opacity: 1,
              duration: 0.5,
              ease: "power3.inOut",
            });
          });
        });

        // ─── Menu Panel Opening/Closing Timelines ───────────────────────────
        const menuTimeline = gsap.timeline({ paused: true });
        menuTimelineRef.current = menuTimeline;

        menuTimeline
          .to(
            menuOverlay,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 120%, 0% 100%)",
              duration: 0.8,
              ease: "power3.inOut",
              onStart: () => {
                menuOverlay.style.pointerEvents = "none";
              },
              onComplete: () => {
                menuOverlay.style.clipPath = "none";
                menuOverlay.style.pointerEvents = "auto";
              },
            },
            0,
          )
          .to(
            pageContent,
            {
              yPercent: 20,
              rotation: 18,
              scale: 1.3,
              transformOrigin: "left top",
              duration: 0.8,
              ease: "power3.inOut",
            },
            0,
          )
          .to(
            bgImgs,
            {
              scale: 1.1,
              duration: 1,
              ease: "power3.inOut",
            },
            0,
          )
          .to(
            container.querySelector(".toggle-line-top"),
            {
              transformOrigin: "center",
              y: 4,
              scaleX: 0.8,
              rotation: 45,
              duration: 0.4,
              ease: "back.out(1.5)",
            },
            0.2,
          )
          .to(
            container.querySelector(".toggle-line-bottom"),
            {
              transformOrigin: "center",
              y: -4,
              scaleX: 0.8,
              rotation: -45,
              duration: 0.4,
              ease: "back.out(1.5)",
            },
            0.2,
          );

        // Character staggered text animations
        const linkTexts = container.querySelectorAll("[data-text-anim]");
        linkTexts.forEach((el) => {
          gsap.set(el, { visibility: "visible" });
          const rawText = el.textContent || "";

          // Clear current content and replace with split inline characters
          el.innerHTML = "";
          const charElements = [];

          for (let char of rawText) {
            const span = document.createElement("span");
            span.textContent = char === " " ? "\u00A0" : char;
            span.style.display = "inline-block";
            el.appendChild(span);
            charElements.push(span);
          }

          menuTimeline.fromTo(
            charElements,
            { yPercent: -200 },
            { yPercent: 0, ease: "power2.inOut", duration: 0.5, stagger: 0.01 },
            0.2,
          );
        });

        // Click interaction callback
        const handleToggle = () => {
          if (menuTimeline.progress() === 1) {
            menuTimeline.reverse();
            menuTimeline.eventCallback("onReverseComplete", () => {
              menuOverlay.style.pointerEvents = "none";
            });
          } else {
            menuTimeline.play();
          }
        };

        toggleButton.addEventListener("click", handleToggle);

        return () => {
          toggleButton.removeEventListener("click", handleToggle);
        };
      })
      .catch((err) =>
        console.error("[TravelOverlayMenu] Animation setup failed:", err),
      );
  }, [isMounted, menuLinks, socialLinks, bgImages]);

  if (!isMounted) {
    // Return placeholder layout to prevent hydration flickering
    return <div className="min-height-screen bg-[#1d1404] text-white" />;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#1d1404] select-none [font-family:'Mona_Sans',sans-serif]"
    >
      {/* ─── Navigation Overlay Panel ────────────────────────────────────────── */}
      <div className="menu-overlay fixed inset-0 h-screen w-screen z-[9999] [clip-path:polygon(0_0,100%_0,100%_0,0_0)] overflow-hidden">
        <div className="menu-overlay__bg-container absolute inset-0 bg-[#ffdcac] pointer-events-none z-[-1]">
          {bgImages.map((src, idx) => (
            <div key={idx} className="menu-overlay__bg-img absolute inset-0">
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 pointer-events-none"
                style={{ opacity: 0 }}
              />
            </div>
          ))}
        </div>

        <div className="menu-overlay__content w-full h-full flex">
          <div className="menu-overlay__links bg-[rgba(29,20,4,0.21)] backdrop-blur-[67px] w-full md:w-1/2 h-full px-[30px] py-[44px] flex flex-col gap-2.5 items-center justify-center text-center">
            <div className="menu-overlay__main text-[#fff7e8] [font-family:Anton] text-[clamp(2rem,4.862vw+0.936rem,5.313rem)] leading-[90%] tracking-[-1.2px] group">
              <ul className="list-none m-0 p-0">
                {menuLinks.map((item, index) => (
                  <li
                    key={index}
                    className="mb-2.5 w-fit mx-auto transition-opacity duration-300 hover:!opacity-100 group-hover:opacity-50"
                  >
                    <a
                      href={item.href}
                      data-text-anim
                      className="inline-block overflow-hidden leading-[93%]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="menu-overlay__socials mt-6">
              <ul className="flex gap-3.5 text-[#fff7e8] text-[clamp(1rem,0.55vw+0.88rem,1.375rem)] font-semibold tracking-[-0.44px] list-none p-0 m-0">
                {socialLinks.map((social, idx) => (
                  <li key={idx}>
                    <a
                      href={social.href}
                      className="hover:underline transition-all"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Global Base Navbar ──────────────────────────────────────────────── */}
      <header className="navbar fixed top-[18px] w-full z-[9999]">
        <nav className="max-w-[1440px] px-8 mx-auto">
          <div className="menu-bar flex justify-between items-center">
            <div className="logo-wrapper max-w-[120px]">
              <img src={logoUrl} alt="Logo" className="w-full h-auto" />
            </div>

            {/* Center Absolute Interactive Hamburger Toggle */}
            <div
              id="menu-toggle"
              className="w-11 h-11 relative flex flex-col gap-[7px] items-center justify-center bg-[#fff0dc] rounded-[10px] cursor-pointer"
            >
              <span className="toggle-line-top w-[29px] h-[2px] bg-[#2f2411]"></span>
              <span className="toggle-line-bottom w-[29px] h-[2px] bg-[#2f2411]"></span>
            </div>

            <a
              href="#"
              className="navbar__btn hidden sm:flex gap-2.5 p-3.5 rounded-[10px] bg-[#fff0dc] [font-family:Anton,sans-serif] items-center justify-center text-[#2f2411] tracking-wide"
            >
              <span className="text-sm font-normal">{navCtaText}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="14"
                fill="none"
              >
                <path
                  fill="#2F2411"
                  d="m17.76 6.857-5.727-5.688a.821.821 0 0 0-1.147.01.81.81 0 0 0-.01 1.139l4.33 4.3H.819a.821.821 0 0 0-.578.238.81.81 0 0 0 .578 1.388h14.389l-4.33 4.3a.813.813 0 0 0-.19.892.813.813 0 0 0 .765.505.824.824 0 0 0 .581-.248l5.727-5.688a.81.81 0 0 0 0-1.148Z"
                />
              </svg>
            </a>
          </div>
        </nav>
      </header>

      {/* ─── Hero Canvas and Underlying Viewport ─────────────────────────────── */}
      <div className="page-content h-full w-full will-change-transform origin-left-top">
        <section
          id="hero-section"
          style={{ backgroundImage: `url(${heroBgUrl})` }}
          className="bg-no-repeat bg-center bg-cover h-screen min-h-[700px] flex flex-col justify-end pb-9"
        >
          <div className="max-w-[1440px] w-full px-8 mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5">
            <h1 className="hero__header [font-family:Anton,sans-serif] text-[clamp(2.75rem,7.89vw+1.024rem,8.125rem)] leading-[99%] tracking-[-2.6px] uppercase max-w-[751px] bg-gradient-to-t from-[#ffd08e] to-[#fff9ee] bg-clip-text text-transparent">
              {heroHeader}
            </h1>

            <div className="hero__cta rounded-[20px] bg-gradient-to-b from-[rgba(23,20,14,0.59)] to-[rgba(106,63,2,0.59)] backdrop-blur-[10px] z-0 max-w-[385px] p-[22px_18px] text-white/85">
              <img src={accentElementUrl} alt="" className="w-12 h-auto" />
              <p className="my-3 text-[18px] leading-[23px] tracking-[-0.36px]">
                {heroCtaDesc}
              </p>

              <a
                href="#"
                className="w-full flex gap-2.5 p-3.5 rounded-[10px] bg-[#ffad3b] [font-family:Anton,sans-serif] items-center justify-center text-white text-xl"
              >
                <span>{heroCtaText}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  fill="none"
                >
                  <path
                    fill="#fff"
                    d="m17.76 6.857-5.727-5.688a.821.821 0 0 0-1.147.01.81.81 0 0 0-.01 1.139l4.33 4.3H.819a.821.821 0 0 0-.578.238.81.81 0 0 0 .578 1.388h14.389l-4.33 4.3a.813.813 0 0 0-.19.892.813.813 0 0 0 .765.505.824.824 0 0 0 .581-.248l5.727-5.688a.81.81 0 0 0 0-1.148Z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Continuous Scroll Spacer Section */}
        <section
          id="spacer-section"
          className="h-screen bg-[#1d1404]"
        ></section>
      </div>
    </div>
  );
}
