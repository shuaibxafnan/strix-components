"use client";

import { useId } from "react";

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    eyebrow: "Commuter Helmet",
    title: "Perfect for urban",
    emphasis: "riders",
    description:
      "Move around your city safely and comfortably, while reducing your carbon footprint and helping to keep the air we breathe clean.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
    eyebrow: "Smart bottle",
    title: "We're all",
    emphasis: "connected",
    description:
      "Do it responsibly and avoid having more plastic in the sea than fish. Take a refillable bottle with you and say no to plastic when drinking water.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
    eyebrow: "Reflective Helmet",
    title: "Ready for",
    emphasis: "late nights",
    description:
      "The reflective shell integrates visibility technology without drawing unnecessary attention. The considered choice for the mindful cyclist.",
  },
];

export default function SideHopCarousel({
  slides = DEFAULT_SLIDES,
  bgColor = "#000000",
  textColor = "#ffffff",
  heading = "Field Notes",
  showHeader = true,
  showEyebrow = true,
  showDescription = true,
  showIndicator = true,
  slideWidth = "70cqw",
  slidePeek = "30cqw",
  rangeStart = "30cqw",
  growStartScale = 0.15,
  growStartInsetX = "25%",
  growStartRound = "35cqmin",
  growStartShiftX = "70%",
  growSettle = 58.75,
  growEndScale = 1.5,
  growEndShiftX = "-16%",
  idleOpacity = 0.5,
  scrollSmooth = true,
  descriptionWidth = "17rem",
  captionWidth = "31rem",
  titleClassName = "text-6xl md:text-8xl",
  serifFamily = "Cardo, ui-serif, Georgia, serif",
  sansFamily = "Inter, ui-sans-serif, system-ui, sans-serif",
  fallbackText = "This browser does not support scroll-driven animations.",
  className = "",
}) {
  const uid = `sc${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const count = slides.length;

  const keyframes = `
@keyframes ${uid}-grow {
  0% {
    clip-path: inset(0 ${growStartInsetX} round ${growStartRound});
    transform: translateX(${growStartShiftX}) scale(${growStartScale});
  }
  ${growSettle}% { clip-path: inset(0 round 0); transform: none; }
  100% { transform: scale(${growEndScale}) translateX(${growEndShiftX}); }
}
@keyframes ${uid}-page {
  0%, 100% { opacity: ${idleOpacity}; }
  58% { opacity: 1; }
}
@keyframes ${uid}-progress {
  from { transform: scaleX(calc(1 / ${count})); }
}
@keyframes ${uid}-text {
  0%, 25% { opacity: 0; }
  50% { opacity: 1; transform: none; }
  75%, 100% { opacity: 0; }
}
@keyframes ${uid}-text-up {
  0%, 25% { opacity: ${idleOpacity}; transform: translateY(105%); }
  50% { opacity: 1; transform: none; }
  75%, 100% { opacity: ${idleOpacity}; transform: translateY(-105%); }
}
`;

  return (
    <div
      className={`relative isolate flex min-h-screen flex-col gap-8 overflow-clip [container-type:inline-size] supports-[timeline-scope:none]:pointer-events-none ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: sansFamily,
        timelineScope: [
          `--${uid}-scroller`,
          ...slides.map((_, i) => `--${uid}-slide-${i}`),
        ].join(", "),
        "--sw": slideWidth,
        "--sp": slidePeek,
        "--rs": rangeStart,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      {slides.map((slide, i) => (
        <img
          key={`bg-${i}`}
          src={slide.image}
          alt=""
          className="absolute inset-0 -z-20 hidden h-full w-full object-cover [animation:var(--kf)_linear_both] [animation-timeline:var(--tl)] supports-[timeline-scope:none]:block"
          style={{ "--tl": `--${uid}-slide-${i}`, "--kf": `${uid}-grow` }}
        />
      ))}

      <div
        className={`absolute inset-0 -z-10 hidden h-full w-full snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scroll-timeline-axis:x] [scroll-timeline-name:var(--st)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden supports-[timeline-scope:none]:pointer-events-auto supports-[timeline-scope:none]:block ${
          scrollSmooth ? "scroll-smooth" : ""
        }`}
        style={{ "--st": `--${uid}-scroller` }}
      >
        <div className="grid h-full w-fit grid-flow-col auto-cols-[var(--sw)] pr-[var(--sp)]">
          {slides.map((_, i) => (
            <div
              key={`anchor-${i}`}
              role="none"
              id={`${uid}-slide-${i}`}
              className="snap-start [view-timeline-axis:x] [view-timeline-name:var(--vt)]"
              style={{ "--vt": `--${uid}-slide-${i}` }}
            />
          ))}
        </div>
      </div>

      {showHeader && (
        <header className="relative z-50 mx-7 flex justify-between gap-2 border-b border-[color-mix(in_srgb,currentColor_60%,transparent)] py-6 max-lg:flex-col supports-[timeline-scope:none]:pointer-events-auto">
          <h1 className="inline align-middle text-sm font-bold tracking-widest whitespace-nowrap uppercase">
            {heading}
          </h1>
        </header>
      )}

      <div className="relative hidden flex-1 flex-col gap-[inherit] px-7 supports-[timeline-scope:none]:flex">
        {showDescription && (
          <div
            className="grid max-w-full [grid-template-areas:'overlap'] [&>*]:[grid-area:overlap]"
            style={{ width: descriptionWidth }}
          >
            {slides.map((slide, i) => (
              <p
                key={`desc-${i}`}
                className="translate-y-1/2 skew-y-[1.5deg] text-sm leading-relaxed [animation:var(--kf)_linear_both] [animation-range-start:var(--rs)] [animation-timeline:var(--tl)]"
                style={{ "--tl": `--${uid}-slide-${i}`, "--kf": `${uid}-text` }}
              >
                {slide.description}
              </p>
            ))}
          </div>
        )}

        {showIndicator && (
          <div className="my-auto w-60 max-w-full">
            <nav className="flex gap-5 text-sm font-medium">
              {slides.map((_, i) => (
                <a
                  key={`page-${i}`}
                  href={`#${uid}-slide-${i}`}
                  className="[animation:var(--kf)_linear_both] [animation-range-start:var(--rs)] [animation-timeline:var(--tl)] supports-[timeline-scope:none]:pointer-events-auto"
                  style={{
                    "--tl": `--${uid}-slide-${i}`,
                    "--kf": `${uid}-page`,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </a>
              ))}
            </nav>
            <div className="mt-2 bg-[color-mix(in_srgb,currentColor_60%,transparent)]">
              <div
                className="h-0.5 origin-left bg-current [animation:var(--kf)_linear_both] [animation-timeline:var(--tl)]"
                style={{
                  "--tl": `--${uid}-scroller`,
                  "--kf": `${uid}-progress`,
                }}
              />
            </div>
          </div>
        )}

        <div
          className="grid max-w-full items-end [grid-template-areas:'overlap'] [&>*]:[grid-area:overlap]"
          style={{ width: captionWidth }}
        >
          {slides.map((slide, i) => (
            <div key={`cap-${i}`}>
              {showEyebrow && (
                <span className="block overflow-clip">
                  <span
                    className="mb-4 block text-xs font-medium tracking-[0.3em] uppercase [animation:var(--kf)_linear_both] [animation-range-start:var(--rs)] [animation-timeline:var(--tl)]"
                    style={{
                      "--tl": `--${uid}-slide-${i}`,
                      "--kf": `${uid}-text-up`,
                    }}
                  >
                    {slide.eyebrow}
                  </span>
                </span>
              )}
              <p
                className={`translate-y-[205%] skew-y-6 pb-7 leading-[0.95] [animation:var(--kf)_linear_both] [animation-range-start:var(--rs)] [animation-timeline:var(--tl)] ${titleClassName}`}
                style={{
                  "--tl": `--${uid}-slide-${i}`,
                  "--kf": `${uid}-text`,
                  fontFamily: serifFamily,
                }}
              >
                {slide.title} <em>{slide.emphasis}</em>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="block px-7 pb-7 text-sm supports-[timeline-scope:none]:hidden">
        {fallbackText}
      </div>
    </div>
  );
}