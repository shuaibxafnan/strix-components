"use client";

import { useEffect, useId, useRef } from "react";

// ─── FlipTabShowcase ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// tabs             array    (3 demo tabs)   Array of { label, heading, description, image, alt } — one per tab
// heading          string   "Explore the Layers of Abstract Design and Depth"   Big H1 above the tab nav
// ctaLabel         string   "Become a member"   Text on the bottom pill link
// ctaHref          string   "#"             Href for the bottom pill link
// bgColor          string   #000            Page background
// textColor        string   #efeeec         Default text color
// surfaceColor     string   #efeeec         Base color the pill / borders / cta-bg tint themselves from
// ctaTextColor     string   #131313         Text color on the "Become a member" pill
// rootFontSizeVw   number   1               Base fluid font-size (vw) that every "em" value below cascades from
// easeParams       string   "0.625, 0.05, 0, 1"   CustomEase control points, registered as "osmo-ease"
// flipDuration     number   0.4             Duration (s) of the highlight-pill Flip animation
// contentEase      string   "power3.inOut" Ease for the outgoing/incoming content + visual crossfade
// contentStagger   number   0.075           Stagger (s) between incoming heading/paragraph lines
// visualHeightEm   number   42              Visual panel height in em
// visualMaxHeightVh number  80              Visual panel max-height in vh
// cursorDefaultUrl string   (Osmo default cursor svg)   Custom cursor image for the page
// cursorPointerUrl string   (Osmo pointer cursor svg)   Custom cursor image for buttons/links
// fontUrl          string   (Osmo PP Neue Montreal woff2)   @font-face source used for credits text
// showCredits      boolean  true            Whether to render the fixed "Resource by Osmo" footer credit
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_TABS = [
  {
    label: "Shapes",
    heading: "Shifting Perspectives",
    description:
      "A dynamic exploration of structure, balance, and creative symmetry.",
    image:
      "https://cdn.prod.website-files.com/67726722d415dc401ae23cf6/677289e14dd4dbca1d8e5930_philip-oroni-IANBrm46bF0-unsplash%20(2).avif",
    alt: "",
  },
  {
    label: "Depth",
    heading: "Fragments of Motion",
    description:
      "Where design meets depth—an abstract dance of light and form.",
    image:
      "https://cdn.prod.website-files.com/67726722d415dc401ae23cf6/677289e19e4d013c6a4c5a1b_philip-oroni-Zx_G3LpNnV4-unsplash%20(1).avif",
    alt: "",
  },
  {
    label: "Layers",
    heading: "Echoes in Orange",
    description:
      "A journey through layered geometry and endless possibilities.",
    image:
      "https://cdn.prod.website-files.com/67726722d415dc401ae23cf6/677289e1c88b5b4c14d1e6fd_philip-oroni-h9N7bm-HRCo-unsplash.avif",
    alt: "",
  },
];

export default function FlipTabShowcase({
  tabs = DEFAULT_TABS,
  heading = "Explore the Layers of Abstract Design and Depth",
  ctaLabel = "Become a member",
  ctaHref = "#",
  bgColor = "#000",
  textColor = "#efeeec",
  surfaceColor = "#efeeec",
  ctaTextColor = "#131313",
  rootFontSizeVw = 1,
  easeParams = "0.625, 0.05, 0, 1",
  flipDuration = 0.4,
  contentEase = "power3.inOut",
  contentStagger = 0.075,
  visualHeightEm = 42,
  visualMaxHeightVh = 80,
  cursorDefaultUrl = "https://cdn.prod.website-files.com/6708f85ff3d3cba6aff436fb/671251b239d7aeb290a31ac5_cursor-default%402x.svg",
  cursorPointerUrl = "https://cdn.prod.website-files.com/6708f85ff3d3cba6aff436fb/671251b212e6b71494aa67ff_cursor-pointer%402x.svg",
  fontUrl = "https://cdn.prod.website-files.com/6819ed8312518f61b84824df/6819ed8312518f61b84825ba_PPNeueMontreal-Medium.woff2",
  showCredits = true,
}) {
  const reactId = useId();
  const uid = reactId.replace(/[:]/g, "");
  const wrapperRef = useRef(null);

  useEffect(() => {
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
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Flip.min.js",
      ),
    ])
      .then(() => {
        const { gsap, CustomEase, Flip } = window;
        const wrapper = wrapperRef.current;
        if (!gsap || !CustomEase || !Flip || !wrapper) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(CustomEase, Flip);
        CustomEase.create("osmo-ease", easeParams);
        gsap.defaults({ ease: "osmo-ease", duration: 0.8 });

        // ── highlight-pill Flip behavior ──
        const navEl = wrapper.querySelector(`[data-flip-button-${uid}="wrap"]`);
        const flipButtons = navEl.querySelectorAll(
          `[data-flip-button-${uid}="button"]`,
        );
        const bg = navEl.querySelector(`[data-flip-button-${uid}="bg"]`);

        const moveBgTo = (el) => {
          const state = Flip.getState(bg);
          el.appendChild(bg);
          Flip.from(state, { duration: flipDuration });
        };

        const flipHandlers = [];
        flipButtons.forEach((button) => {
          const onEnter = () => moveBgTo(button);
          const onLeave = () => {
            const activeLink = navEl.querySelector(".active");
            if (activeLink) moveBgTo(activeLink);
          };
          button.addEventListener("mouseenter", onEnter);
          button.addEventListener("focus", onEnter);
          button.addEventListener("mouseleave", onLeave);
          button.addEventListener("blur", onLeave);
          flipHandlers.push({ button, onEnter, onLeave });
        });

        // ── tab-switching behavior ──
        const buttons = wrapper.querySelectorAll(`[data-tabs-${uid}="button"]`);
        const contentItems = wrapper.querySelectorAll(
          `[data-tabs-${uid}="content-item"]`,
        );
        const visualItems = wrapper.querySelectorAll(
          `[data-tabs-${uid}="visual-item"]`,
        );

        let activeButton = buttons[0];
        let activeContent = contentItems[0];
        let activeVisual = visualItems[0];
        let isAnimating = false;

        const switchTab = (index) => {
          if (isAnimating || buttons[index] === activeButton) return;
          isAnimating = true;

          const outgoingContent = activeContent;
          const incomingContent = contentItems[index];
          const outgoingVisual = activeVisual;
          const incomingVisual = visualItems[index];

          const outgoingLines = outgoingContent.querySelectorAll(
            `[data-tabs-fade-${uid}]`,
          );
          const incomingLines = incomingContent.querySelectorAll(
            `[data-tabs-fade-${uid}]`,
          );

          const timeline = gsap.timeline({
            defaults: { ease: contentEase },
            onComplete: () => {
              outgoingContent.classList.remove("active");
              outgoingVisual.classList.remove("active");
              activeContent = incomingContent;
              activeVisual = incomingVisual;
              isAnimating = false;
            },
          });

          incomingContent.classList.add("active");
          incomingVisual.classList.add("active");

          timeline
            .to(outgoingLines, { y: "-2em", autoAlpha: 0 }, 0)
            .to(outgoingVisual, { autoAlpha: 0, xPercent: 3 }, 0)
            .fromTo(
              incomingLines,
              { y: "2em", autoAlpha: 0 },
              { y: "0em", autoAlpha: 1, stagger: contentStagger },
              0.4,
            )
            .fromTo(
              incomingVisual,
              { autoAlpha: 0, xPercent: 3 },
              { autoAlpha: 1, xPercent: 0 },
              "<",
            );

          activeButton.classList.remove("active");
          buttons[index].classList.add("active");
          activeButton = buttons[index];
        };

        const tabClickHandlers = [];
        buttons.forEach((button, i) => {
          const onClick = () => switchTab(i);
          button.addEventListener("click", onClick);
          tabClickHandlers.push({ button, onClick });
        });

        return () => {
          flipHandlers.forEach(({ button, onEnter, onLeave }) => {
            button.removeEventListener("mouseenter", onEnter);
            button.removeEventListener("focus", onEnter);
            button.removeEventListener("mouseleave", onLeave);
            button.removeEventListener("blur", onLeave);
          });
          tabClickHandlers.forEach(({ button, onClick }) => {
            button.removeEventListener("click", onClick);
          });
        };
      })
      .catch((e) =>
        console.error("[FlipTabShowcase] GSAP load failed:", e.message),
      );
  }, [uid, easeParams, flipDuration, contentEase, contentStagger]);

  const cursorCss =
    `.cursor-root-${uid} { cursor: url("${cursorDefaultUrl}") 2 0, auto; }` +
    `.cursor-pointer-${uid} { cursor: url("${cursorPointerUrl}") 12 0, pointer; }` +
    `@font-face { font-family: "PP Neue Montreal Osmo ${uid}"; src: url("${fontUrl}") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }` +
    `.tab-content-item-${uid} { visibility: hidden; }` +
    `.tab-content-item-${uid}.active { visibility: visible; }` +
    `.tab-visual-item-${uid} { visibility: hidden; }` +
    `.tab-visual-item-${uid}.active { visibility: visible; }` +
    `.filter-button-${uid}.active { border-color: ${surfaceColor}4d; border-radius: 0.25em; }` +
    `.credits-font-${uid} { font-family: "PP Neue Montreal Osmo ${uid}", Arial, sans-serif; }`;

  return (
    <div
      ref={wrapperRef}
      className={`cursor-root-${uid} relative min-h-screen w-full`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontSize: `${rootFontSizeVw}vw`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: cursorCss }} />

      <section className="relative flex min-h-screen items-center justify-center p-[2em] text-[1.1vw]">
        <div className="relative flex w-full min-h-[37em] flex-wrap gap-y-[3em]">
          {/* ── left column: heading, tab nav, active tab copy, cta ── */}
          <div className="w-1/2">
            <div className="ml-auto mr-0 h-full w-full max-w-[36em] px-0 py-[1em] pb-[2em]">
              <div className="flex h-full min-h-full flex-col items-start justify-between gap-[3em] pr-[2.5em]">
                <div className="flex flex-col items-start gap-[2em]">
                  <h1 className="m-0 text-[4em] font-medium leading-none tracking-tight">
                    {heading}
                  </h1>

                  <div
                    className="flex rounded-[.5em] border p-[.5em]"
                    style={{
                      backgroundColor: `${surfaceColor}0f`,
                      borderColor: `${surfaceColor}14`,
                    }}
                    ref={(el) => {
                      if (el)
                        el.setAttribute(`data-flip-button-${uid}`, "wrap");
                    }}
                  >
                    {tabs.map((tab, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`filter-button-${uid} cursor-pointer-${uid} relative border border-transparent px-[1.5em] py-[1.125em] text-[1em] transition-[border-color] duration-200 ${
                          i === 0 ? "active" : ""
                        }`}
                        ref={(el) => {
                          if (el) {
                            el.setAttribute(`data-tabs-${uid}`, "button");
                            el.setAttribute(
                              `data-flip-button-${uid}`,
                              "button",
                            );
                          }
                        }}
                      >
                        <div
                          className="relative z-[1] text-[1.125em]"
                          style={{ color: textColor }}
                        >
                          {tab.label}
                        </div>

                        {i === 0 && (
                          <div
                            className="absolute inset-0 z-0 h-full w-full rounded-[.25em] border"
                            style={{
                              backgroundColor: `${surfaceColor}0f`,
                              borderColor: `${surfaceColor}14`,
                            }}
                            ref={(el) => {
                              if (el)
                                el.setAttribute(
                                  `data-flip-button-${uid}`,
                                  "bg",
                                );
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-[2em]">
                  <div className="relative w-full min-w-[24em]">
                    {tabs.map((tab, i) => (
                      <div
                        key={i}
                        className={`tab-content-item-${uid} absolute inset-x-0 bottom-0 top-auto z-[1] flex flex-col gap-[1.25em] ${
                          i === 0 ? "active" : ""
                        }`}
                        ref={(el) => {
                          if (el)
                            el.setAttribute(`data-tabs-${uid}`, "content-item");
                        }}
                      >
                        <h2
                          className="m-0 text-[1.75em] font-medium leading-none tracking-tight"
                          ref={(el) => {
                            if (el)
                              el.setAttribute(`data-tabs-fade-${uid}`, "");
                          }}
                        >
                          {tab.heading}
                        </h2>
                        <p
                          className="m-0 text-[1.25em] leading-snug opacity-80"
                          ref={(el) => {
                            if (el)
                              el.setAttribute(`data-tabs-fade-${uid}`, "");
                          }}
                        >
                          {tab.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <a
                    href={ctaHref}
                    className={`cursor-pointer-${uid} relative flex h-[4em] items-center justify-center px-[1.5em] no-underline`}
                    style={{ color: ctaTextColor }}
                  >
                    <p className="relative z-[1] m-0 text-[1.25em] leading-snug">
                      {ctaLabel}
                    </p>
                    <div
                      className="absolute inset-0 rounded-[.25em]"
                      style={{ backgroundColor: surfaceColor }}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── right column: crossfading visual panel ── */}
          <div className="w-1/2">
            <div
              className="relative w-full overflow-hidden rounded-[.5em]"
              style={{
                height: `${visualHeightEm}em`,
                maxHeight: `${visualMaxHeightVh}vh`,
              }}
            >
              {tabs.map((tab, i) => (
                <div
                  key={i}
                  className={`tab-visual-item-${uid} absolute flex h-full w-full items-center justify-start ${
                    i === 0 ? "active" : ""
                  }`}
                  ref={(el) => {
                    if (el) el.setAttribute(`data-tabs-${uid}`, "visual-item");
                  }}
                >
                  <img
                    src={tab.image}
                    alt={tab.alt || ""}
                    loading="lazy"
                    className="h-full w-full max-w-none rounded-[.5em] object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
