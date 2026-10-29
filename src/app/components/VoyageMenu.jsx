"use client";

import { useEffect, useRef } from "react";
import { Anton, Inter_Tight } from "next/font/google";

const anton = Anton({ subsets: ["latin"], weight: "400" });
const inter = Inter_Tight({ subsets: ["latin"], weight: ["400", "600"] });

const MENU_LINKS = [
  { label: "HOME", href: "/" },
  { label: "ABOUT US", href: "/" },
  { label: "EXPLORE TRIPS", href: "/" },
  { label: "SERVICES", href: "/" },
  { label: "CONTACT US", href: "/" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "/" },
  { label: "TikTok", href: "/" },
  { label: "Facebook", href: "/" },
];

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=1600&q=80",
];

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (window.gsap) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[data-id="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed: ${src}`)),
        { once: true },
      );
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-id", src);
    el.onload = () => {
      el.dataset.loaded = "true";
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });

function Arrow({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      className={className}
    >
      <path
        fill="currentColor"
        d="m17.76 6.857-5.727-5.688a.821.821 0 0 0-1.147.01.81.81 0 0 0-.01 1.139l4.33 4.3H.819a.821.821 0 0 0-.578.238.81.81 0 0 0 .578 1.388h14.389l-4.33 4.3a.813.813 0 0 0-.19.892.813.813 0 0 0 .765.505.824.824 0 0 0 .581-.248l5.727-5.688a.81.81 0 0 0 0-1.148Z"
      />
    </svg>
  );
}

export default function VoyageMenu({
  menuLinks = MENU_LINKS,
  socialLinks = SOCIAL_LINKS,
  bgImages = BG_IMAGES,
  logoText = "VOYAGE",
  menuToggleLabel = "Toggle menu",
  heroHeader = "Find Your Way to Anywhere in the world",
  heroCtaText = "EXPLORE TRIPS",
  heroCtaHref = "#",
  heroCtaDesc = "From cityscapes to beaches, we guide you. We handle details so you can focus on getting lost in the moment.",
  heroBgUrl = "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=2000&q=80",
  footerTitle = "Where Will You Wander Next",
  footerText = "Every journey starts with a single step. Tell us where your curiosity points and we will map the route, book the details, and leave the wonder to you.",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let teardown = null;

    const init = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
        );
      } catch (e) {
        console.error("[VoyageMenu] CDN load failed:", e.message);
        return;
      }
      if (cancelled) return;

      const { gsap } = window;
      const container = containerRef.current;
      if (!gsap || !container) return;

      const items = container.querySelectorAll("[data-menu-item]");
      const bgImgs = container.querySelectorAll("[data-bg-img]");
      const menuOverlay = container.querySelector("[data-overlay]");
      const pageContent = container.querySelector("[data-page]");
      const toggleButton = container.querySelector("[data-toggle]");
      const lineTop = container.querySelector("[data-line-top]");
      const lineBottom = container.querySelector("[data-line-bottom]");
      const links = container.querySelectorAll("[data-menu-link]");
      const cleanups = [];

      const on = (el, ev, fn) => {
        el.addEventListener(ev, fn);
        cleanups.push(() => el.removeEventListener(ev, fn));
      };

      gsap.set(bgImgs, { opacity: 0 });
      gsap.set(bgImgs[0], { opacity: 1 });

      items.forEach((item, index) => {
        on(item, "mouseenter", () => {
          gsap.to(bgImgs, { opacity: 0, duration: 0.5, ease: "power2.inOut" });
          if (bgImgs[index + 1]) {
            gsap.to(bgImgs[index + 1], {
              opacity: 1,
              scale: 1.18,
              duration: 0.5,
              ease: "power3.inOut",
            });
          }
        });
        on(item, "mouseleave", () => {
          gsap.to(bgImgs, {
            opacity: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.inOut",
          });
          gsap.to(bgImgs[0], {
            opacity: 1,
            duration: 0.5,
            ease: "power3.inOut",
          });
        });
      });

      const menuTimeline = gsap.timeline({
        paused: true,
        onComplete: () => {
          menuOverlay.style.pointerEvents = "auto";
        },
        onReverseComplete: () => {
          menuOverlay.style.pointerEvents = "none";
        },
      });

      menuTimeline
        .to(
          menuOverlay,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 120%, 0% 100%)",
            duration: 0.8,
            ease: "power3.inOut",
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
        .to(bgImgs, { scale: 1.1, duration: 1, ease: "power3.inOut" }, 0)
        .to(
          lineTop,
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
          lineBottom,
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

      links.forEach((link) => {
        const chars = link.querySelectorAll("[data-char]");
        menuTimeline.fromTo(
          chars,
          { yPercent: -200 },
          { yPercent: 0, ease: "power2.inOut", duration: 0.5, stagger: 0.01 },
          0.2,
        );
      });

      let isOpen = false;

      const closeMenu = () => {
        if (!isOpen) return;
        isOpen = false;
        menuOverlay.style.pointerEvents = "none";
        menuTimeline.reverse();
      };

      on(toggleButton, "click", () => {
        if (isOpen) {
          closeMenu();
          return;
        }
        isOpen = true;
        menuTimeline.play();
      });

      links.forEach((link) => on(link, "click", closeMenu));

      teardown = () => {
        cleanups.forEach((fn) => fn());
        menuTimeline.kill();
        gsap.killTweensOf(bgImgs);
        gsap.set([pageContent, lineTop, lineBottom], { clearProps: "all" });
      };
    };

    init();

    return () => {
      cancelled = true;
      if (teardown) teardown();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${inter.className} relative w-full select-none overflow-hidden bg-[#1d1404]`}
    >
      <div
        data-overlay
        className="pointer-events-none fixed inset-0 z-[9999] h-[100svh] w-screen overflow-hidden [clip-path:polygon(0_0,100%_0,100%_0,0_0)]"
      >
        <div className="pointer-events-none absolute inset-0 z-[-1] bg-[#ffdcac]">
          {bgImages.map((src, idx) => (
            <div key={idx} data-bg-img className="absolute inset-0">
              <img
                src={src}
                alt=""
                className="pointer-events-none h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="flex h-full w-full">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 overflow-y-auto bg-[rgba(29,20,4,0.21)] px-[30px] py-[88px] text-center backdrop-blur-[67px] md:w-1/2">
            <div
              className={`${anton.className} group text-[clamp(2rem,4.862vw+0.936rem,5.313rem)] leading-[90%] tracking-[-1.2px] text-[#fff7e8]`}
            >
              <ul className="m-0 list-none p-0">
                {menuLinks.map((item, index) => (
                  <li
                    key={index}
                    data-menu-item
                    className="mx-auto mb-2.5 w-fit transition-opacity duration-300 hover:!opacity-100 group-hover:opacity-50"
                  >
                    <a
                      href={item.href}
                      data-menu-link
                      className="inline-block overflow-hidden leading-[93%]"
                    >
                      {item.label.split("").map((char, ci) => (
                        <span
                          key={ci}
                          data-char
                          className="inline-block"
                        >
                          {char === " " ? "\u00A0" : char}
                        </span>
                      ))}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="m-0 mt-6 flex list-none flex-wrap justify-center gap-3.5 p-0 text-[clamp(1rem,0.55vw+0.88rem,1.375rem)] font-semibold tracking-[-0.44px] text-[#fff7e8]">
              {socialLinks.map((social, idx) => (
                <li key={idx}>
                  <a
                    href={social.href}
                    className="transition-all hover:underline"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <header className="fixed top-[18px] z-[9999] w-full">
        <nav className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <div className="flex items-center justify-between">
            <span
              className={`${anton.className} text-2xl tracking-[0.08em] text-[#fff0dc] mix-blend-difference`}
            >
              {logoText}
            </span>

            <button
              type="button"
              data-toggle
              aria-label={menuToggleLabel}
              className="relative flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[7px] rounded-[10px] bg-[#fff0dc]"
            >
              <span
                data-line-top
                className="h-[2px] w-[29px] bg-[#2f2411]"
              />
              <span
                data-line-bottom
                className="h-[2px] w-[29px] bg-[#2f2411]"
              />
            </button>
          </div>
        </nav>
      </header>

      <div data-page className="h-full w-full will-change-transform">
        <section className="relative flex h-[100svh] min-h-[620px] flex-col justify-end pb-9">
          <img
            src={heroBgUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

          <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-5 px-5 sm:px-8 lg:flex-row lg:items-end">
            <h1
              className={`${anton.className} max-w-[751px] bg-gradient-to-t from-[#ffd08e] to-[#fff9ee] bg-clip-text text-[clamp(2.75rem,7.89vw+1.024rem,8.125rem)] uppercase leading-[99%] tracking-[-2.6px] text-transparent`}
            >
              {heroHeader}
            </h1>

            <div className="w-full max-w-[385px] rounded-[20px] bg-gradient-to-b from-[rgba(23,20,14,0.59)] to-[rgba(106,63,2,0.59)] px-[18px] py-[22px] text-white/85 backdrop-blur-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-9 w-9 text-[#ffad3b]"
                fill="currentColor"
              >
                <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
              </svg>
              <p className="my-3 text-[16px] leading-[22px] tracking-[-0.36px] sm:text-[18px] sm:leading-[23px]">
                {heroCtaDesc}
              </p>

              <a
                href={heroCtaHref}
                className={`${anton.className} flex w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#ffad3b] p-3.5 text-xl text-white`}
              >
                <span>{heroCtaText}</span>
                <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section className="flex min-h-[80svh] flex-col items-center justify-center bg-[#1d1404] px-6 py-24 text-center">
          <h2
            className={`${anton.className} max-w-[900px] text-[clamp(2.25rem,6vw+0.5rem,6rem)] uppercase leading-[100%] tracking-[-1.5px] text-[#fff7e8]`}
          >
            {footerTitle}
          </h2>
          <p className="mt-6 max-w-[560px] text-base leading-relaxed text-[#fff7e8]/70 sm:text-lg">
            {footerText}
          </p>
        </section>
      </div>
    </div>
  );
}