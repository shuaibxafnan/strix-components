"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=800&q=80`;

const DEFAULT_SECTIONS = [
  {
    id: "s1",
    layout: "left",
    heading: "Born in Dust",
    body: "Every star begins inside a cold cloud of gas and dust that slowly collapses under its own weight.",
    imageSrc: unsplash("photo-1462332420958-a05d1e002413"),
    imageAlt: "Nebula glowing in deep space",
  },
  {
    id: "s2",
    layout: "right",
    heading: "Old Messengers",
    body: "",
    imageSrc: unsplash("photo-1608178398319-48f814d0750c"),
    imageAlt: "Orion nebula in pink and purple",
  },
  {
    id: "s3",
    layout: "left",
    heading: "Room to Wander",
    body: "A single galaxy holds hundreds of billions of suns, and the universe holds countless galaxies.",
    imageSrc: unsplash("photo-1610296669228-602fa827fc1f"),
    imageAlt: "Blue galaxy against a black sky",
  },
  {
    id: "s4",
    layout: "right",
    heading: "Look Up",
    body: "The light reaching your eyes tonight left its source long before anyone could name the sky above.",
    imageSrc: unsplash("photo-1717705422478-0b42e89e06b7"),
    imageAlt: "Horsehead Nebula among stars",
  },
];

function StorySection({
  section,
  imageOpacity,
  headerSpeed,
  imageParallaxSpeed,
  headingFont,
}) {
  const isLeft = section.layout === "left";

  return (
    <section className="mx-auto max-w-[var(--mw)] px-8 py-[var(--py)]">
      <article className="grid grid-cols-1 md:grid-cols-5">
        <header
          data-speed={headerSpeed}
          className={`z-[2] uppercase md:row-start-1 ${isLeft
              ? "md:col-[1/4] md:self-end"
              : "md:col-[4/-1] md:self-center"
            }`}
        >
          <h2
            className="m-0 text-[clamp(2rem,5vw,6rem)] leading-none tracking-[.5rem]"
            style={{ fontFamily: headingFont }}
          >
            {section.heading}
          </h2>
          {section.body ? (
            <p className="mt-4 text-sm leading-relaxed">{section.body}</p>
          ) : null}
        </header>

        <div
          className={`relative flex items-center justify-center md:row-start-1 ${isLeft ? "md:col-[2/-1]" : "md:col-[1/5]"
            }`}
        >
          <div className="aspect-[3/2] w-full overflow-hidden">
            <img
              data-speed={imageParallaxSpeed}
              src={section.imageSrc}
              alt={section.imageAlt ?? ""}
              className={`block h-[120%] w-full object-cover ${imageOpacity}`}
            />
          </div>
        </div>
      </article>
    </section>
  );
}

export default function ParallaxShowcase({
  sections = DEFAULT_SECTIONS,
  smoothness = 3,
  backgroundColor = "bg-black",
  textColor = "text-white",
  imageOpacity = "opacity-60",
  headerSpeed = 1.25,
  imageParallaxSpeed = "auto",
  maxWidth = "1024px",
  sectionPaddingY = "8em",
  bodyFont = "Roboto",
  headingFont = "Bebas Neue",
  className = "",
}) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return undefined;

    const smoother = ScrollSmoother.create({
      wrapper,
      content,
      smooth: smoothness,
      effects: true,
    });

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    observer.observe(content);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      smoother.kill();
    };
  }, [smoothness]);

  const family = (name, fallback) => `'${name}', ${fallback}`;

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, "+")}&family=${bodyFont.replace(/ /g, "+")}&display=swap`}
        precedence="default"
      />

      <div
        ref={wrapperRef}
        className={`fixed inset-0 overflow-hidden ${backgroundColor} ${textColor} ${className}`}
        style={{
          fontFamily: family(bodyFont, "ui-sans-serif, system-ui, sans-serif"),
          "--mw": maxWidth,
          "--py": sectionPaddingY,
        }}
      >
        <div ref={contentRef} className="w-full overflow-visible">
          {sections.map((section) => (
            <StorySection
              key={section.id}
              section={section}
              imageOpacity={imageOpacity}
              headerSpeed={headerSpeed}
              imageParallaxSpeed={imageParallaxSpeed}
              headingFont={family(headingFont, "ui-sans-serif, sans-serif")}
            />
          ))}
        </div>
      </div>
    </>
  );
}