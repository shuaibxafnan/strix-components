"use client";

import { useEffect, useRef } from "react";

const ENTER =
  "opacity-0 [transition:opacity_650ms_ease_var(--delay,0ms),transform_650ms_cubic-bezier(0.16,1,0.3,1)_var(--delay,0ms)] group-[.dp-visible]/sec:translate-x-0 group-[.dp-visible]/sec:opacity-100";
const ENTER_LEFT = `${ENTER} -translate-x-[50px]`;
const ENTER_RIGHT = `${ENTER} translate-x-[50px]`;

const DEFAULT_SECTIONS = [
  {
    eyebrow: "Zone 01",
    count: "47",
    title: "Gentle\nGiants",
    intro:
      "Go on safari and come face to face with the largest animals to have ever walked the earth, towering herbivores whose footsteps shake the ground beneath you.",
    linkLabel: "Explore the zone",
    linkHref: "/",
    imgSrc:
      "https://images.phylopic.org/images/ef954cac-604a-4e1f-9b8d-bd92bf3cc3f6/vector.svg",
    imgAlt: "Parasaurolophus",
    imgSide: "right",
    bgColor: "#0d2b27",
    accentColor: "#3de0c4",
  },
  {
    eyebrow: "Zone 02",
    count: "12",
    title: "Carnivore\nKingdom",
    intro:
      "Step inside the most dangerous square mile on the planet. The fiercest predators in history, separated from you by nothing but reinforced glass and a prayer.",
    linkLabel: "Enter if you dare",
    linkHref: "/",
    imgSrc:
      "https://images.phylopic.org/images/6a38b924-85c4-46b6-a04a-0e53f2f4d77f/vector.svg",
    imgAlt: "T-Rex",
    imgSide: "left",
    bgColor: "#1e0a04",
    accentColor: "#ff5a1f",
  },
  {
    eyebrow: "Zone 03",
    count: "28",
    title: "Aerial\nAdventure",
    intro:
      "Look up. Magnificent winged predators circle the skies of our open-air aviary, the largest in the world. A spectacle not for the faint-hearted.",
    linkLabel: "Take flight",
    linkHref: "/",
    imgSrc:
      "https://images.phylopic.org/images/0b4b95c2-615a-45df-adaa-a63fbd039eb2/vector.svg",
    imgAlt: "Pterodactyl",
    imgSide: "right",
    bgColor: "#110920",
    accentColor: "#b97fff",
  },
];

export default function DinosaurPark({
  displayFont = "Anton",
  bodyFont = "DM Sans",
  monoFont = "Overpass Mono",
  sections = DEFAULT_SECTIONS,
  intersectionThreshold = 0.6,
  className = "",
}) {
  const mainRef = useRef(null);

  useEffect(() => {
    const sectionEls = mainRef.current?.querySelectorAll("section") ?? [];

    sectionEls.forEach((sec) => {
      const contentEl = sec.querySelector("[data-content]");
      if (!contentEl) return;
      [...contentEl.children].forEach((child, i) => {
        child.style.setProperty("--delay", `${i * 110}ms`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, intersectionRatio }) => {
          if (intersectionRatio >= intersectionThreshold) {
            target.classList.add("dp-visible");
          } else {
            target.classList.remove("dp-visible");
          }
        });
      },
      { rootMargin: "0px", threshold: intersectionThreshold },
    );

    sectionEls.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [intersectionThreshold]);

  return (
    <div
      className={className}
      style={{
        "--display": `"${displayFont}", sans-serif`,
        "--body": `"${bodyFont}", sans-serif`,
        "--mono": `"${monoFont}", monospace`,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Overpass+Mono:wght@600&display=swap"
      />

      <DotsIndicator count={sections.length} mainRef={mainRef} />

      <main
        ref={mainRef}
        className="h-screen snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((sec, idx) => {
          const imgLeft = sec.imgSide === "left";
          const textEnter = imgLeft ? ENTER_RIGHT : ENTER_LEFT;
          const dinoEnter = imgLeft ? ENTER_LEFT : ENTER_RIGHT;

          return (
            <section
              key={idx}
              className="group/sec relative flex h-screen snap-center flex-col overflow-hidden text-white"
              style={{ backgroundColor: sec.bgColor }}
            >
              <span
                className={`pointer-events-none absolute -bottom-[0.08em] ${imgLeft ? "-right-[0.04em]" : "-left-[0.04em]"
                  } translate-y-6 select-none font-[family-name:var(--display)] text-[clamp(180px,32vw,400px)] font-normal leading-none text-white opacity-0 [transition:opacity_1.1s_ease_0.08s,transform_1.1s_cubic-bezier(0.16,1,0.3,1)_0.08s] group-[.dp-visible]/sec:translate-y-0 group-[.dp-visible]/sec:opacity-[0.04]`}
              >
                {sec.count}
              </span>

              <div
                data-content
                className="relative z-[2] grid h-full w-full flex-grow grid-cols-1 min-[860px]:grid-cols-2"
              >
                <div
                  className={`flex flex-col justify-center gap-7 px-8 py-20 md:px-16 ${imgLeft ? "order-2" : "order-1"
                    }`}
                >
                  <div
                    className={`font-[family-name:var(--body)] text-[11px] font-medium uppercase tracking-[0.28em] ${textEnter}`}
                    style={{ color: sec.accentColor }}
                  >
                    {sec.eyebrow}
                  </div>

                  <h2
                    className={`m-0 font-[family-name:var(--display)] text-[clamp(3rem,7.5vw,7.5rem)] font-normal uppercase leading-[0.9] tracking-[-0.01em] text-white ${textEnter}`}
                  >
                    {sec.title.split("\n").map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>

                  <p
                    className={`m-0 max-w-[34ch] font-[family-name:var(--body)] text-[0.975rem] font-light leading-loose text-white/50 ${textEnter}`}
                  >
                    {sec.intro}
                  </p>

                  <a
                    href={sec.linkHref}
                    className={`inline-flex items-center gap-[10px] self-start border border-current px-[30px] py-[14px] font-[family-name:var(--body)] text-[0.8rem] font-medium uppercase tracking-[0.12em] no-underline hover:brightness-[1.2] ${textEnter}`}
                    style={{
                      color: sec.accentColor,
                      borderColor: sec.accentColor,
                    }}
                  >
                    {sec.linkLabel}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                </div>

                <div
                  className={`relative flex min-h-[38vh] items-end justify-center overflow-hidden ${imgLeft ? "order-1" : "order-2"
                    }`}
                >
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at 50% 80%, ${sec.accentColor}1a 0%, transparent 68%)`,
                    }}
                  />
                  <img
                    src={sec.imgSrc}
                    alt={sec.imgAlt}
                    className={`relative z-10 h-auto w-[90%] max-w-[500px] select-none object-contain ${dinoEnter}`}
                    style={{
                      filter: `invert(1) drop-shadow(0 0 80px ${sec.accentColor}55)`,
                    }}
                  />
                </div>
              </div>

              <div className="absolute bottom-7 right-8 z-10 font-[family-name:var(--body)] text-[10px] uppercase tracking-[0.3em] text-white/20">
                {String(idx + 1).padStart(2, "0")} /{" "}
                {String(sections.length).padStart(2, "0")}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function DotsIndicator({ count, mainRef }) {
  const dotsRef = useRef(null);

  useEffect(() => {
    const container = mainRef.current;
    if (!container || !dotsRef.current) return;

    const dots = [...dotsRef.current.children];
    const sections = [...container.querySelectorAll("section")];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.5) {
            const idx = sections.indexOf(entry.target);
            dots.forEach((d, i) =>
              d.classList.toggle("dp-dot-active", i === idx),
            );
          }
        });
      },
      { root: container, threshold: 0.5 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [count, mainRef]);

  return (
    <div
      ref={dotsRef}
      className="fixed right-6 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-[10px]"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[5px] w-[5px] cursor-pointer rounded-full bg-white/25 transition duration-300 [&.dp-dot-active]:scale-[1.6] [&.dp-dot-active]:bg-white/85"
        />
      ))}
    </div>
  );
}