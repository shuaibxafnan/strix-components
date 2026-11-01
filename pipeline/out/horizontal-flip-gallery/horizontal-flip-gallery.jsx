"use client";

import { useEffect, useRef } from "react";
import { Newsreader, Space_Grotesk } from "next/font/google";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const body = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-body",
});

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const DEFAULT_ITEMS = [
  {
    image: unsplash("photo-1656088239658-ca839d7e8841"),
    alt: "Close-up of a ceramic vase",
    titleTop: "CLAY",
    titleBottom: "CRAFT",
    leftTitle: "FORM",
    leftParagraph:
      "A single lump of clay, centered on the wheel and drawn upward by steady hands until a quiet shape appears.",
    rightTitle: "Touch",
    rightParagraph:
      "Every curve carries the pressure of a thumb, a pause in the rhythm, and a decision made without words.",
  },
  {
    image: unsplash("photo-1726491079206-36a02e6c9cbb"),
    alt: "A vase on a table",
    titleTop: "FIRE",
    titleBottom: "GLAZE",
    leftTitle: "HEAT",
    leftParagraph:
      "Hours in the kiln turn soft earth into something permanent, hard, and quietly bright.",
    rightTitle: "Color",
    rightParagraph:
      "Glazes melt, run, and settle, leaving depths that no two firings will ever repeat.",
  },
  {
    image: unsplash("photo-1738858363202-dd019dadce76"),
    alt: "A large gray vase on a tile floor",
    titleTop: "SHAPE",
    titleBottom: "BALANCE",
    leftTitle: "Contour",
    leftParagraph:
      "A wide shoulder, a narrow neck, a base that holds its ground. The silhouette decides how a room feels.",
    rightTitle: "Weight",
    rightParagraph:
      "Heavy enough to feel real, light enough to lift with one hand. Balance is built in before the first flower.",
  },
  {
    image: unsplash("photo-1634017264120-e34cd8606525"),
    alt: "Two vases on a table",
    titleTop: "EARTH",
    titleBottom: "TEXTURE",
    leftTitle: "Surface",
    leftParagraph:
      "Matte slip, visible grain, a fingerprint left on purpose. The surface keeps a record of how it was made.",
    rightTitle: "Grain",
    rightParagraph:
      "Rough where it needs to grip, smooth where it meets the light. Texture turns a shape into an object.",
  },
  {
    image: unsplash("photo-1757083821615-62de7719c864"),
    alt: "Clay jug with a flower design on a wooden stand",
    titleTop: "LIGHT",
    titleBottom: "SHADOW",
    leftTitle: "Glow",
    leftParagraph:
      "Morning light slides across the glaze and the whole piece warms, as if it had been waiting for the sun.",
    rightTitle: "Depth",
    rightParagraph:
      "Shadow pools inside the neck and under the lip. What you cannot see is part of the design.",
  },
  {
    image: unsplash("photo-1781433869241-1aec734207d2"),
    alt: "Two light pottery vessels on a rustic wooden table",
    titleTop: "STILL",
    titleBottom: "LIFE",
    leftTitle: "Display",
    leftParagraph:
      "On a shelf, a sill, or a bare table. A good vase needs very little around it to feel complete.",
    rightTitle: "Pairing",
    rightParagraph:
      "Two vessels side by side tell a calmer story than one alone. Space between them matters as much as the pots.",
  },
  {
    image: unsplash("photo-1769425105591-428948f6e2f2"),
    alt: "Collection of vintage ceramic pots and vases",
    titleTop: "HAND",
    titleBottom: "MADE",
    leftTitle: "Maker",
    leftParagraph:
      "Small batches, slow days, and a studio that smells of wet clay. Nothing leaves until it feels right.",
    rightTitle: "Story",
    rightParagraph:
      "Each piece carries the hours behind it. Keep it long enough and it becomes part of your own.",
  },
];

const setCursorFlag = (cursor, name, on) => {
  if (cursor) cursor.dataset[name] = on ? "true" : "false";
};

export default function HorizontalFlipGallery({
  items = DEFAULT_ITEMS,
  backgroundColor = "bg-black",
  textColor = "text-white",
  labelColor = "text-white/60",
  galleryGapVw = 7.5,
  galleryImageHeightVh = 45,
  scrollEdgePaddingVw = 35,
  contentWidthVw = 50,
  titleFontSizeVw = 6,
  sideTextWidthVw = 17,
  animDuration = 1.25,
  animEase = "power4.inOut",
  cursorSizeRem = 1.5,
  lenisLerp = 0.05,
  lenisWheelMultiplier = 0.85,
  backdropBlurPx = 60,
  backdropOpacity = 0.55,
  scrimOpacity = 0.82,
  className = "",
}) {
  const scrollWrapperRef = useRef(null);
  const sectionContentRef = useRef(null);
  const cursorRef = useRef(null);
  const apiRef = useRef(null);

  const galleryWrapperRefs = useRef([]);
  const galleryImageRefs = useRef([]);
  const contentRefs = useRef([]);
  const contentWrapperRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;
    let teardown = null;

    const init = async () => {
    const [{ gsap }, { Flip }, { default: Lenis }, { default: SplitType }] =
      await Promise.all([
        import("gsap"),
        import("gsap/Flip"),
        import("lenis"),
        import("split-type"),
      ]);
    if (cancelled) return;
    gsap.registerPlugin(Flip);

    const scrollWrapper = scrollWrapperRef.current;
    const sectionContent = sectionContentRef.current;
    const cursor = cursorRef.current;
    if (!scrollWrapper || !sectionContent) return;

    const galleryWrappers = galleryWrapperRefs.current.filter(Boolean);
    const galleryImages = galleryImageRefs.current.filter(Boolean);
    const contents = contentRefs.current.filter(Boolean);
    const contentWrappers = contentWrapperRefs.current.filter(Boolean);

    const lenis = new Lenis({
      autoRaf: true,
      wrapper: scrollWrapper,
      content: scrollWrapper.firstElementChild,
      orientation: "horizontal",
      lerp: lenisLerp,
      wheelMultiplier: lenisWheelMultiplier,
      smoothWheel: true,
    });

    const splitInstances = [];

    const wrapAll = (nodes) =>
      nodes?.forEach((node) => {
        const wrapper = document.createElement("div");
        wrapper.className = "inline-block overflow-hidden";
        node.parentNode.insertBefore(wrapper, node);
        wrapper.appendChild(node);
      });

    const initializeSplitText = (content) => {
      const split = (el, types) => {
        if (!el) return null;
        const instance = new SplitType(el, {
          types,
          charClass: "char inline-block",
        });
        splitInstances.push(instance);
        return instance;
      };

      const titleTopSplit = split(
        content.querySelector('[data-role="text-top"] div'),
        "chars",
      );
      const titleBottomSplit = split(
        content.querySelector('[data-role="text-bottom"] div'),
        "chars",
      );
      wrapAll(titleTopSplit?.chars);
      wrapAll(titleBottomSplit?.chars);

      const textLeftSplits = Array.from(
        content.querySelectorAll('[data-role="text-left"] div'),
        (n) => split(n, "lines"),
      );
      const textRightSplits = Array.from(
        content.querySelectorAll('[data-role="text-right"] div'),
        (n) => split(n, "lines"),
      );
      [...textLeftSplits, ...textRightSplits].forEach((s) => wrapAll(s?.lines));

      return { titleTopSplit, titleBottomSplit, textLeftSplits, textRightSplits };
    };

    const listOfSplits = contents.map(initializeSplitText);

    let currentOpenIndex = null;
    let isAnimating = false;
    let currentAnimation = null;
    let rafId = 0;
    let cursorX = 0;
    let cursorY = 0;
    let targetX = 0;
    let targetY = 0;

    const updateCursor = () => {
      cursorX += (targetX - cursorX) * 0.15;
      cursorY += (targetY - cursorY) * 0.15;
      if (cursor)
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      rafId = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e) => {
      if (!cursor) return;
      const bounds = cursor.getBoundingClientRect();
      targetX = e.clientX - bounds.width / 2;
      targetY = e.clientY - bounds.height / 2;
      if (!rafId) rafId = requestAnimationFrame(updateCursor);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const allLines = (splits) => [
      ...splits.textLeftSplits.flatMap((s) => s.lines),
      ...splits.textRightSplits.flatMap((s) => s.lines),
    ];

    const open = (index) => {
      if (isAnimating || currentOpenIndex !== null) return;
      const splits = listOfSplits[index];
      if (!splits?.titleTopSplit) return;
      isAnimating = true;

      contents[index].style.visibility = "visible";
      const currentWrapper = contentWrappers[index];

      splits.titleTopSplit.chars.forEach((char) => {
        char.style.willChange = "transform, clip-path";
      });

      currentAnimation = gsap.timeline({
        onStart: () => {
          sectionContent.style.visibility = "visible";
          sectionContent.style.zIndex = "10";
        },
        onComplete: () => {
          isAnimating = false;
          currentOpenIndex = index;
          lenis.stop();
          scrollWrapper.style.visibility = "hidden";
          setCursorFlag(cursor, "open", true);
          currentAnimation = null;
          splits.titleTopSplit.chars.forEach((char) => {
            char.style.willChange = "auto";
          });
        },
      });

      currentAnimation
        .addLabel("start", 0)
        .add(() => {
          const flipState = Flip.getState(galleryImages[index]);
          currentWrapper.appendChild(galleryImages[index]);
          Flip.from(flipState, { duration: animDuration, ease: animEase });
        }, "start")
        .to(
          galleryWrappers.filter((_, i) => i !== index),
          { clipPath: "inset(100% 0 0 0)", duration: 0.75, ease: "power3.inOut" },
          0,
        )
        .fromTo(
          [splits.titleTopSplit.elements, splits.titleBottomSplit.elements],
          { xPercent: 15 },
          { xPercent: 0, duration: 1, ease: "power3.out" },
          "start+=1.25",
        )
        .fromTo(
          [splits.titleTopSplit.chars, splits.titleBottomSplit.chars],
          { clipPath: "inset(0 100% 0 0)", xPercent: 10 },
          {
            clipPath: "inset(0 0% 0 0)",
            xPercent: 0,
            duration: 0.75,
            ease: "power3.out",
          },
          "start+=1.25",
        )
        .fromTo(
          allLines(splits),
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, stagger: 0.025 },
          "start+=1.2",
        );
    };

    const close = (index) => {
      if (isAnimating || currentOpenIndex !== index) return;
      isAnimating = true;

      const currentWrapper = contentWrappers[index];
      const splits = listOfSplits[index];
      lenis.start();
      scrollWrapper.style.visibility = "visible";

      currentAnimation = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          currentOpenIndex = null;
          currentAnimation = null;
          setCursorFlag(cursor, "open", false);
          sectionContent.style.visibility = "hidden";
          sectionContent.style.zIndex = "0";
          contents[index].style.visibility = "hidden";
        },
      });

      currentAnimation
        .addLabel("start", 0)
        .fromTo(
          [splits.titleTopSplit.elements, splits.titleBottomSplit.elements],
          { xPercent: 0 },
          { xPercent: 10, ease: "power3.out", duration: 1 },
          "start",
        )
        .fromTo(
          [splits.titleTopSplit.chars, splits.titleBottomSplit.chars],
          { clipPath: "inset(0 0% 0 0)", xPercent: 0 },
          {
            clipPath: "inset(0 100% 0 0)",
            xPercent: 10,
            ease: "power3.out",
            duration: 0.75,
          },
          "start",
        )
        .to(allLines(splits), { yPercent: 100, stagger: 0.025, duration: 0.75 }, "start")
        .add(() => {
          const image = currentWrapper.querySelector('[data-gallery="image"]');
          if (!image) return;
          const flipState = Flip.getState(image);
          galleryWrappers[index].appendChild(image);
          Flip.from(flipState, { duration: animDuration, ease: "power3.inOut" });
        }, "start+=0.25")
        .to(galleryWrappers.filter((_, i) => i !== index), {
          clipPath: "inset(0% 0 0 0)",
        })
        .set(galleryWrappers, { clipPath: "none" });
    };

    apiRef.current = { open, close };

    teardown = () => {
      apiRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
      currentAnimation?.kill();
      lenis.destroy();
      galleryImages.forEach((image, i) => {
        if (image.parentNode !== galleryWrappers[i])
          galleryWrappers[i]?.appendChild(image);
      });
      splitInstances.forEach((instance) => instance.revert());
    };
    };

    init();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [items, animDuration, animEase, lenisLerp, lenisWheelMultiplier]);

  const cursorEnter = () => setCursorFlag(cursorRef.current, "visible", true);
  const cursorLeave = () => setCursorFlag(cursorRef.current, "visible", false);

  const mirrored = (index) => index % 2 === 1;

  return (
    <div
      className={`${heading.variable} ${body.variable} relative h-screen w-full overflow-hidden [font-family:var(--font-heading)] ${backgroundColor} ${textColor} ${className}`}
      style={{
        "--gap": `${galleryGapVw}vw`,
        "--img-h": `${galleryImageHeightVh}vh`,
        "--edge": `${scrollEdgePaddingVw}vw`,
        "--content-w": `${contentWidthVw}vw`,
        "--title-fs": `${titleFontSizeVw}vw`,
        "--side-w": `${sideTextWidthVw}vw`,
        "--cursor": `${cursorSizeRem}rem`,
        "--blur": `${backdropBlurPx}px`,
        "--backdrop-op": backdropOpacity,
        "--scrim-op": scrimOpacity,
      }}
    >
      <div
        ref={cursorRef}
        data-visible="false"
        data-open="false"
        className="pointer-events-none invisible fixed left-0 top-0 z-[9999] h-[var(--cursor)] w-[var(--cursor)] opacity-0 transition-opacity duration-500 data-[visible=true]:visible data-[visible=true]:opacity-100"
      >
        <div className="absolute inset-0 origin-center rotate-45 rounded-full border border-black bg-white transition-transform duration-500 [[data-open=true]_&]:rotate-[405deg]">
          <div className="absolute left-1/2 top-1/2 h-px w-[calc(100%-0.75rem)] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black" />
          <div className="absolute left-1/2 top-1/2 h-px w-[calc(100%-0.75rem)] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black" />
        </div>
      </div>

      <div
        ref={scrollWrapperRef}
        className="relative z-[1] h-screen w-full overflow-hidden"
      >
        <section className="flex h-full w-fit items-center justify-start px-[var(--edge)]">
          <div className="flex h-full items-center justify-center gap-[var(--gap)]">
            {items.map((item, index) => (
              <div
                key={index}
                ref={(el) => (galleryWrapperRefs.current[index] = el)}
                onClick={() => apiRef.current?.open(index)}
                onMouseEnter={cursorEnter}
                onMouseLeave={cursorLeave}
                className="aspect-square h-[var(--img-h)] cursor-pointer odd:translate-y-[30%] even:-translate-y-[30%]"
              >
                <div
                  ref={(el) => (galleryImageRefs.current[index] = el)}
                  data-gallery="image"
                  className="h-full w-full"
                >
                  <img
                    src={item.image}
                    alt={item.alt ?? item.titleTop}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section
        ref={sectionContentRef}
        className="invisible fixed inset-0 z-0 flex w-screen items-center justify-center overflow-hidden"
      >
        {items.map((item, index) => (
          <div
            key={index}
            ref={(el) => (contentRefs.current[index] = el)}
            className="invisible absolute top-0 flex h-screen w-full items-center justify-center"
          >
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <img
                src={item.image}
                alt=""
                className="h-full w-full scale-110 object-cover opacity-[var(--backdrop-op)] [filter:blur(var(--blur))]"
              />
              <div className="absolute inset-0 opacity-[var(--scrim-op)] [background:radial-gradient(120%_100%_at_50%_50%,transparent_0%,#000_78%)]" />
            </div>

            <div
              ref={(el) => (contentWrapperRefs.current[index] = el)}
              onClick={() => apiRef.current?.close(index)}
              onMouseEnter={cursorEnter}
              onMouseLeave={cursorLeave}
              className="relative aspect-video w-[var(--content-w)] cursor-pointer max-md:w-[80vw]"
            >
              <div
                data-role="text-top"
                className={`absolute bottom-[calc(100%-1.5vw)] ml-[2em] flex w-[105%] items-center overflow-hidden [filter:invert()] [mix-blend-mode:difference] ${mirrored(index) ? "justify-end" : "justify-start"
                  }`}
              >
                <div className="overflow-hidden text-[length:var(--title-fs)] max-md:text-[length:12vw] leading-[0.86] tracking-[-0.03em] text-black [font-variation-settings:'wght'_640]">
                  {item.titleTop}
                </div>
              </div>

              <div
                data-role="text-bottom"
                className={`absolute left-0 top-[calc(100%-1.75vw)] ml-[2em] flex w-[105%] items-center overflow-hidden [filter:invert()] [mix-blend-mode:difference] ${mirrored(index) ? "justify-start" : "justify-end"
                  }`}
              >
                <div className="overflow-hidden text-[length:var(--title-fs)] max-md:text-[length:12vw] leading-[0.86] tracking-[-0.03em] text-black [font-variation-settings:'wght'_640]">
                  {item.titleBottom}
                </div>
              </div>

              <div
                data-role="text-left"
                className={`absolute right-full flex h-full w-[var(--side-w)] flex-col py-[2.5em] pr-[1.5em] text-right max-[767px]:hidden ${mirrored(index)
                    ? "items-start justify-start"
                    : "items-end justify-end"
                  }`}
              >
                <div
                  className={`overflow-hidden text-[0.7rem] font-semibold tracking-[0.22em] ${labelColor}`}
                >
                  {item.leftTitle}
                </div>
                <div className="mt-4 block w-full overflow-hidden whitespace-normal text-[clamp(0.95rem,1.15vw,1.5rem)] font-normal italic leading-[1.5] text-white/85 [font-family:var(--font-body)]">
                  {item.leftParagraph}
                </div>
              </div>

              <div
                data-role="text-right"
                className={`absolute left-full flex h-full w-[var(--side-w)] flex-col py-[2.5em] pl-[1.5em] max-[767px]:hidden ${mirrored(index) ? "items-end justify-end" : ""
                  }`}
              >
                <div
                  className={`overflow-hidden text-[0.7rem] font-semibold tracking-[0.22em] ${labelColor}`}
                >
                  {item.rightTitle}
                </div>
                <div className="mt-4 block w-full overflow-hidden whitespace-normal text-[clamp(0.95rem,1.15vw,1.5rem)] font-normal italic leading-[1.5] text-white/85 [font-family:var(--font-body)]">
                  {item.rightParagraph}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}