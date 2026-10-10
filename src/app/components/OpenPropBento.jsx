"use client";

import { useEffect, useState } from "react";

// ─── BentoGrid ──────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// sectionTitle         string      "Latest Stories"     Main section layout header
// cardsData            array       [...]               Data array containing objects for items
// gridColumnsMobile    string      "grid-cols-1"        Explicit column layout track for mobile
// gridColumnsTablet    string      "md:grid-cols-2"     Explicit column layout track for tablets
// gridColumnsDesktop   string      "lg:grid-cols-12"    Explicit column track for main viewports
// gapSpacing           string      "gap-8"              Gutter spacing separating bento grids
// cardMinBlockSize     string      "min-h-[360px]"      Minimum height matching structure cards
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_CARDS = [
  {
    id: 1,
    isHero: true,
    tag: "FEATURED STORY",
    title: "Embark on Roaring Adventures with A Tiger's Tale",
    date: "January 8, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/tiger.webp",
    imgAlt: "Cute cartoon tiger illustration",
  },
  {
    id: 2,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Chomping Chronicles: The Crocodile's Adventure",
    date: "January 12, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/crocodile.webp",
    imgAlt: "Cartoon crocodile illustration",
  },
  {
    id: 3,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Vibrant Wings: Journey of the Macaw",
    date: "January 16, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/macaw.webp",
    imgAlt: "Cartoon macaw illustration",
  },
  {
    id: 4,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Moo-rific Tales: The Brave Cow's Journey",
    date: "January 18, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/cow.webp",
    imgAlt: "Cartoon cow illustration",
  },
  {
    id: 5,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Pawsome Quest: A Dog's Adventure",
    date: "January 20, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/dog.webp",
    imgAlt: "Cartoon dog illustration",
  },
  {
    id: 6,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Giant Hearts: An Elephant's Odyssey",
    date: "January 24, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/elephant.webp",
    imgAlt: "Cartoon elephant illustration",
    isHeadingH4: true,
  },
  {
    id: 7,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Explore Undersea Wonders with Starfish's Cosmic Journey",
    date: "January 11, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/starfish.webp",
    imgAlt: "Cartoon starfish illustration",
    isHeadingH4: true,
  },
  {
    id: 8,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Gallop and Giggles: The Whimsical Horse Chronicles",
    date: "February 12, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/horse.webp",
    imgAlt: "Cartoon horse illustration",
    isHeadingH4: true,
  },
  {
    id: 9,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Furry Fantasia: Fox's Enchanted Tale",
    date: "February 16, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/fox.webp",
    imgAlt: "Cartoon fox illustration",
    isHeadingH4: true,
  },
  {
    id: 10,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Slinky Serpent: A Snake's Mysterious Quest",
    date: "February 20, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/snake.webp",
    imgAlt: "Cartoon snake illustration",
    isHeadingH4: true,
  },
  {
    id: 11,
    isHero: false,
    tag: "FEATURED STORY",
    title: "Feathered Friends: The Cockatoo's Symphony",
    date: "February 24, 2024",
    imgSrc:
      "https://raw.githubusercontent.com/mobalti/open-props-interfaces/main/bento-grid/images/cockatoo.webp",
    imgAlt: "Cartoon cockatoo illustration",
    isHeadingH4: true,
  },
];

export default function OpenPropBento({
  sectionTitle = "Latest Stories",
  cardsData = DEFAULT_CARDS,
  gridColumnsMobile = "grid-cols-1",
  gridColumnsTablet = "md:grid-cols-2",
  gridColumnsDesktop = "lg:grid-cols-12",
  gapSpacing = "gap-8",
  cardMinBlockSize = "min-h-[360px]",
}) {
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotionOk(!motionQuery.matches);

    const handleMotionChange = (e) => setMotionOk(!e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    const elements = document.querySelectorAll(".bento-reveal-target");

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
    <section className="grid place-items-center w-full antialiased bg-[#fafafa] text-[#0b0b0c] py-16 px-6">
      <div className="w-full max-w-[366px] md:max-w-[695px] lg:max-w-[975px]">
        {/* Modern Minimal Header Block */}
        <header className="mb-8 border-b border-[#0b0b0c]/5 pb-4">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#0b0b0c]">
            {sectionTitle}
          </h2>
        </header>

        {/* Bento Grid Structural Wrapper (Kept Exactly Same) */}
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
                href="#"
                className={`
                  group block overflow-hidden bg-white rounded-xl transition-all duration-500 ease-out
                  grid items-center gap-0 m-0 p-0 text-[#0b0b0c] no-underline
                  border border-[#0b0b0c]/[0.04] hover:border-[#0b0b0c]/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.02)]
                  ${columnSpanClass} ${heightClass} ${cardMinBlockSize}
                  ${card.isHero ? "grid-cols-1 md:grid-cols-2" : "grid-rows-[1.1fr_0.9fr]"}
                  ${!card.isHero && motionOk ? "bento-reveal-target opacity-0 translate-y-[100px] will-change-transform transition-[opacity,transform] duration-[660ms,1000ms] cubic-bezier(0.16,1,0.3,1)" : ""}
                `}
              >
                {/* Modernized Visual Media Container */}
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

                {/* Modernized Typography Content Block */}
                <div className="grid justify-items-start items-between h-full p-8 grid-rows-[auto_1fr_auto] gap-4">
                  <small className="text-[10px] font-bold tracking-[0.2em] text-[#0b0b0c]/40 uppercase">
                    {card.tag}
                  </small>

                  {/* High Contrast Semantic Title Engine */}
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
