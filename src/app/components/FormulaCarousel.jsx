"use client";

import { useEffect, useState, useRef } from "react";

const FORMULA_DEFAULT_DATA = [
  {
    id: "post-1",
    tag: "News",
    published: "16 August 2019",
    title:
      "New McLaren wind tunnel 'critical' to future performance, says Tech Director Key",
    img: "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1440&auto=format&fit=crop",
    type: "link",
    linkText: "find out more",
  },
  {
    id: "post-2",
    tag: "Video",
    published: "12 August 2019",
    title: "What To Watch For in the 2019 Hungarian Grand Prix",
    img: "https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=1440&auto=format&fit=crop",
    type: "video",
    linkText: "play video",
  },
  {
    id: "post-3",
    tag: "News",
    published: "08 August 2019",
    title:
      "Hamilton wants harder championship fight from Leclerc and Verstappen",
    img: "https://images.unsplash.com/photo-1774487671647-613e738aa000?q=80&w=1440&auto=format&fit=crop",
    type: "link",
    linkText: "find out more",
  },
];

export default function FormulaCarousel({
  accentColor = "#c20000",
  loopIntervalMs = 5000,
  mixBlendBg = "rgba(7, 5, 5, 0.45)",
  animationDuration = "duration-700",
  timingFunction = "ease-[cubic-bezier(0.25,1,0.5,1)]",
  textAlignment = "items-start text-left",
  glassOpacity = "bg-zinc-900/80",
  scaleIntensity = "scale-105",
  carouselData = FORMULA_DEFAULT_DATA,
}) {
  const [mounted, setMounted] = useState(false);
  const [postIndex, setPostIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  const progressIntervalRef = useRef(null);
  const globalProgressCountRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const runProgressEngine = () => {
      if (globalProgressCountRef.current >= 100) {
        globalProgressCountRef.current = -5;
        setProgress(0);
        setPostIndex((prevIndex) => (prevIndex + 1) % carouselData.length);
      } else {
        globalProgressCountRef.current += 1;
        setProgress(globalProgressCountRef.current);
      }
    };

    progressIntervalRef.current = setInterval(
      runProgressEngine,
      loopIntervalMs / 100,
    );

    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, [mounted, postIndex, loopIntervalMs, carouselData.length]);

  if (!mounted) {
    return <div className="min-h-screen w-full bg-[#090707]" />;
  }

  const handlePostTabClick = (index) => {
    if (isDisabled) return;

    setIsDisabled(true);
    globalProgressCountRef.current = 0;
    setProgress(0);
    setPostIndex(index);

    setTimeout(() => {
      setIsDisabled(false);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full relative bg-[#090707] font-sans text-zinc-100 antialiased overflow-hidden">
      {/* Mobile view top primary timeline track layout indicator node */}
      <div className="absolute top-0 left-0 h-[4px] w-full z-50 lg:hidden bg-zinc-950/40">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>

      {/* Main interactive background deck staging view section wrapper */}
      <header className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="w-full h-full relative overflow-hidden">
          {carouselData.map((slide, idx) => {
            const isActive = postIndex === idx;
            return (
              <article
                key={slide.id}
                className={`absolute inset-0 w-full h-full select-none overflow-hidden transition-all ${animationDuration} ${timingFunction} ${
                  isActive
                    ? "top-0 z-10 translate-y-0 opacity-100 pointer-events-auto"
                    : "top-full z-0 translate-y-8 opacity-0 pointer-events-none"
                }`}
              >
                {/* Visual graphic framing plate overlay container */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={slide.img}
                    alt={slide.title}
                    loading="lazy"
                    className={`w-full h-full block object-cover ${scaleIntensity}`}
                  />
                  {/* Progressive dark gradient vignetting overlay */}
                  <div
                    className="absolute inset-0 z-10 bg-gradient-to-tr from-black via-black/40 to-transparent"
                    style={{ backgroundColor: mixBlendBg }}
                  />
                </div>

                {/* Content positioning: Centered vertically on left edge */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 left-[5%] lg:left-[8%] w-[90%] md:w-[80%] lg:w-[50%] xl:w-[42%] z-20 flex flex-col ${textAlignment}`}
                >
                  {/* Tag Indicator Cluster */}
                  <div className="mb-5 inline-flex overflow-hidden rounded-sm">
                    <span
                      className={`text-[11px] px-4 py-1.5 text-white font-semibold tracking-[0.2em] uppercase transition-all duration-500 ${
                        isActive
                          ? "w-full opacity-100 translate-y-0 delay-300"
                          : "w-0 opacity-0 translate-y-full"
                      }`}
                      style={{ backgroundColor: accentColor }}
                    >
                      {slide.tag}
                    </span>
                  </div>

                  {/* Header typography layout block */}
                  <h1
                    className={`font-black text-3xl md:text-5xl xl:text-[3.4rem] leading-[1.1] text-white tracking-tight transition-all duration-500 ease-out ${
                      isActive
                        ? "opacity-100 translate-y-0 delay-200"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    {slide.title}
                  </h1>

                  {/* Action Navigation Interface Systems Link */}
                  <div className="mt-8 h-10 overflow-hidden">
                    <a
                      href="#"
                      className={`inline-flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.25em] text-zinc-100 group transition-all duration-500 ${
                        isActive
                          ? "opacity-100 translate-y-0 delay-400"
                          : "opacity-0 translate-y-4"
                      }`}
                    >
                      {slide.type === "video" && (
                        <div className="relative flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm group-hover:border-white group-hover:bg-white/20 transition-all duration-300">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 20 20"
                            fill="none"
                            className="translate-x-[1px]"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M16 10L6 4V16L16 10Z" fill="white" />
                          </svg>
                        </div>
                      )}

                      <span
                        className="relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:transition-all after:duration-300 group-hover:after:w-full"
                        style={{ "--tw-after-bg": accentColor }}
                      >
                        {slide.linkText}
                      </span>

                      {slide.type === "link" && (
                        <svg
                          className="transform transition-transform duration-300 ease-out group-hover:translate-x-2"
                          width="28"
                          height="10"
                          viewBox="0 0 37 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 6H36.0001M36.0001 6L31.0001 1M36.0001 6L31.0001 11"
                            stroke="white"
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </header>

      {/* Desktop navigation dashboard tabs layout control row */}
      <div className="hidden lg:grid grid-cols-3 gap-4 absolute bottom-12 left-1/2 xl:left-[78%] -translate-x-1/2 xl:-translate-x-[78%] w-full max-w-[90%] xl:max-w-[65%] z-30 px-2">
        {carouselData.map((post, index) => {
          const isTabActive = postIndex === index;
          return (
            <article
              key={`tab-${post.id}`}
              onClick={() => handlePostTabClick(index)}
              className={`relative px-6 py-5 rounded-md backdrop-blur-md transition-all duration-300 border border-white/[0.04] ${
                isTabActive
                  ? `opacity-100 ${glassOpacity} shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] pointer-events-none scale-[1.02]`
                  : "opacity-40 bg-black/40 hover:opacity-90 hover:bg-zinc-900/40 cursor-pointer"
              }`}
            >
              {/* Internal horizontal loading progressive tracker element */}
              <div className="absolute top-0 left-0 h-[3px] w-full overflow-hidden rounded-t-md">
                <div
                  className="h-full transition-[width] duration-150 ease-out"
                  style={{
                    width: isTabActive ? `${progress}%` : "0%",
                    backgroundColor: accentColor,
                  }}
                />
              </div>

              <header className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest mb-3">
                <span
                  style={{ color: isTabActive ? accentColor : "#a1a1aa" }}
                  className="transition-colors duration-300"
                >
                  {post.tag}
                </span>
                <p className="m-0 text-zinc-500 font-medium">
                  {post.published}
                </p>
              </header>

              <h2 className="font-semibold text-xs xl:text-[13px] leading-relaxed text-zinc-200 line-clamp-2 tracking-wide">
                {post.title}
              </h2>
            </article>
          );
        })}
      </div>
    </div>
  );
}
