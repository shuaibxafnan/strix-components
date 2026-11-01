"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_CARDS = [
  {
    id: 1,
    href: "#",
    isHero: true,
    tag: "FEATURED COLLECTION",
    title: "Shaped by Hand: The Story of the Clay Vase",
    date: "January 8, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/clay.png",
    imgAlt: "Handmade clay vase",
  },
  {
    id: 2,
    href: "#",
    isHero: false,
    tag: "FEATURED COLLECTION",
    title: "Two Tones of Earth: The Brown Duo Vase",
    date: "January 12, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/duo-brown.png",
    imgAlt: "Two tone brown vase",
  },
  {
    id: 3,
    href: "#",
    isHero: false,
    tag: "FEATURED COLLECTION",
    title: "Deep Blue Calm: The Solid Navy Vase",
    date: "January 16, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/solid-dblue.png",
    imgAlt: "Solid dark blue vase",
  },
  {
    id: 4,
    href: "#",
    isHero: false,
    tag: "FEATURED COLLECTION",
    title: "Warm and Whole: The Solid Brown Vase",
    date: "January 18, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/brown-solid.png",
    imgAlt: "Solid brown vase",
  },
  {
    id: 5,
    href: "#",
    isHero: false,
    tag: "FEATURED COLLECTION",
    title: "Blue on Blue: The Two Tone Vase",
    date: "January 20, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/duo-blue.png",
    imgAlt: "Two tone blue vase",
  },
  {
    id: 6,
    href: "#",
    isHero: false,
    tag: "FEATURED COLLECTION",
    title: "Bent Out of Shape: The Two Tone Deformed Vase",
    date: "January 24, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/duo-deform.png",
    imgAlt: "Two tone vase with a deformed silhouette",
    isHeadingH4: true,
  },
  {
    id: 7,
    href: "#",
    isHero: false,
    tag: "FEATURED COLLECTION",
    title: "Ocean Curves: The Deformed Blue Vase",
    date: "January 11, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/deform-blue.png",
    imgAlt: "Blue vase with a deformed silhouette",
    isHeadingH4: true,
  },
  {
    id: 8,
    href: "#",
    isHero: false,
    tag: "FEATURED COLLECTION",
    title: "Pattern and Poise: The Brown Patterned Vase",
    date: "February 12, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/shuaibxafnan/vintage-collectibles/refs/heads/main/pattern-brown.png",
    imgAlt: "Brown vase with a patterned surface",
    isHeadingH4: true,
  },
];

export default function BentoStoryGrid({
  sectionTitle = "Latest Stories",
  cardsData = DEFAULT_CARDS,
  gridColumnsMobile = "grid-cols-1",
  gridColumnsTablet = "md:grid-cols-2",
  gridColumnsDesktop = "lg:grid-cols-12",
  gapSpacing = "gap-8",
  cardMinBlockSize = "min-h-[360px]",
  bgColor = "#fafafa",
  textColor = "#0b0b0c",
  cardColor = "#ffffff",
  className = "",
}) {
  const rootRef = useRef(null);
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotionOk(!motionQuery.matches);

    const handleMotionChange = (e) => setMotionOk(!e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    const elements = rootRef.current.querySelectorAll(".bento-reveal-target");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-[100px]");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [cardsData]);

  return (
    <section
      ref={rootRef}
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`grid place-items-center w-full antialiased py-16 px-6 ${className}`}
    >
      <div className="w-full max-w-[366px] md:max-w-[695px] lg:max-w-[975px]">
        <header className="mb-8 border-b border-[#0b0b0c]/5 pb-4">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#0b0b0c]">
            {sectionTitle}
          </h2>
        </header>

        <div
          className={`grid ${gridColumnsMobile} ${gridColumnsTablet} ${gridColumnsDesktop} ${gapSpacing}`}
        >
          {cardsData.map((card, index) => {
            const columnSpanClass = card.isHero
              ? "lg:col-span-12"
              : index >= 1 && index <= 4
                ? "lg:col-span-6"
                : "lg:col-span-4";

            const heightClass = card.isHero
              ? "lg:min-h-[540px]"
              : index >= 1 && index <= 4
                ? "lg:min-h-[450px]"
                : cardMinBlockSize;

            return (
              <a
                key={card.id || index}
                href={card.href}
                style={{ backgroundColor: cardColor }}
                className={`
                  group block overflow-hidden rounded-xl transition-all duration-500 ease-out
                  grid items-center gap-0 m-0 p-0 text-[#0b0b0c] no-underline
                  border border-[#0b0b0c]/[0.04] hover:border-[#0b0b0c]/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.02)]
                  ${columnSpanClass} ${heightClass} ${cardMinBlockSize}
                  ${card.isHero ? "grid-cols-1 md:grid-cols-2" : "grid-rows-[1.1fr_0.9fr]"}
                  ${!card.isHero && motionOk ? "bento-reveal-target opacity-0 translate-y-[100px] will-change-transform transition-[opacity,transform] duration-[660ms,1000ms] cubic-bezier(0.16,1,0.3,1)" : ""}
                `}
              >
                <div
                  className={`w-full h-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center relative ${!card.isHero ? "[container-type:size]" : ""}`}
                >
                  <picture className="w-full h-full flex items-center justify-center">
                    <img
                      src={card.imgSrc}
                      alt={card.imgAlt}
                      width="512"
                      height="512"
                      loading="lazy"
                      className={`
                        w-full object-contain transition-all duration-700 ease-out p-6 mix-blend-multiply
                        group-hover:scale-[1.04] group-hover:opacity-90
                        ${card.isHero ? "h-full" : "h-[100cqb]"}
                        ${motionOk ? "animate-fade-in" : "opacity-100"}
                      `}
                    />
                  </picture>
                </div>

                <div className="grid justify-items-start items-between h-full p-8 grid-rows-[auto_1fr_auto] gap-4">
                  <small className="text-[10px] font-bold tracking-[0.2em] text-[#0b0b0c]/40 uppercase">
                    {card.tag}
                  </small>

                  {card.isHero ? (
                    <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl tracking-tight leading-[1.15] text-balance text-[#0b0b0c]">
                      {card.title}
                    </h1>
                  ) : card.isHeadingH4 ? (
                    <h4 className="font-bold text-lg lg:text-xl tracking-tight leading-snug text-pretty self-start text-[#0b0b0c]">
                      {card.title}
                    </h4>
                  ) : (
                    <h3 className="font-bold text-lg lg:text-xl tracking-tight leading-snug text-pretty self-start text-[#0b0b0c]">
                      {card.title}
                    </h3>
                  )}

                  <small className="text-[11px] font-medium tracking-wide text-[#0b0b0c]/40 border-t border-[#0b0b0c]/5 w-full pt-3">
                    {card.date}
                  </small>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
