"use client";

import { useEffect, useState, useRef } from "react";

// ─── InkTransitionShowcase ───────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// backgroundColor         string   "bg-[#fcfbf7]"       Warm off-white museum canvas backdrop
// maxContainerWidth       string   "max-w-[640px]"      Optimal reading measure constraint
// liquifyBaseFrequency   number   0.012                Refined organic texture distortion density
// liquifyScale            number   250                  Controlled displacement matrix reach
// revealDuration          number   1.8                  Snappy, premium frame playback rate
// textColorKorean         string   "text-neutral-900"   Deep editorial charcoal for native text
// textColorEnglish        string   "text-neutral-600"   Elegant muted slate for translations
// ──────────────────────────────────────────────────────────────────────────

const SECTION_DATA = [
  {
    img: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/Hyewon-Wolha-jeongin.jpg",
    alt: "Lovers under the moon",
    isPortrait: false,
    width: "w-[600px]",
    height: "h-[375px]",
    aspect: "aspect-[16/10]",
    frameUrl:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/ink-photo-frame.png",
    ko: "혜원 신윤복 (1758-1813)은 조선시대의 화가이다.",
    en: "Shin Yun-bok, better known by his pen name Hyewon (1758–1813), was a Korean painter of the Joseon Dynasty.",
    delayKo: "0.2",
    delayEn: "0.4",
  },
  {
    img: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/Hyewon-Jusa.geobae.jpg",
    alt: "Drinking bout",
    isPortrait: false,
    width: "w-[540px]",
    height: "h-[338px]",
    aspect: "aspect-[16/10]",
    frameUrl:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/ink-photo-frame.png",
    ko: "당대의 단원 김홍도와 긍재 김득신과 같이, 그때 당시의 일상생활의 사실적 묘사로 잘 알려져 있다.",
    en: "Like his contemporaries Danwon and Geungjae, he is known for his realistic depictions of daily life in his time.",
    delayKo: "0.1",
    delayEn: "0.3",
  },
  {
    img: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/Hyewon-Dano.pungjeong.jpg",
    alt: "Dano day",
    isPortrait: false,
    width: "w-[540px]",
    height: "h-[338px]",
    aspect: "aspect-[16/10]",
    frameUrl:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/ink-photo-frame.png",
    ko: "혜원의 그림은 단원의 작품보다 성적묘사가 훨씬 강했고, 이것은 당시 왕립 미술 학교에서 파면을 당하는데 이유가 되었다.",
    en: "His genre paintings are distinctly more erotic than Danwon's, a fact which contributed to his expulsion from the royal painting institute, Dohwaseo.",
    delayKo: "0.1",
    delayEn: "0.3",
  },
  {
    img: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/Hyewon-Miindo.jpg",
    alt: "Miindo",
    isPortrait: true,
    width: "w-[280px]",
    height: "h-[448px]",
    aspect: "aspect-[1/1.6]",
    frameUrl:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/ink-photo-frame-portrait.png",
    ko: '단원, 오원과 더불어, 혜원은 현재 조선시대 "3원 화가"로 불리우고 있다.',
    en: 'Together with Danwon and the later painter Owon, Hyewon is remembered today as one of the "Three Wons" of Joseon-period painting.',
    delayKo: "0.1",
    delayEn: "0.3",
  },
];

export default function InkTransition({
  backgroundColor = "bg-[#fcfbf7]",
  maxContainerWidth = "max-w-[640px]",
  liquifyBaseFrequency = 0.012,
  liquifyScale = 250,
  revealDuration = 1.8,
  textColorKorean = "text-neutral-900",
  textColorEnglish = "text-neutral-600",
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [liquidScale, setLiquidScale] = useState(liquifyScale);
  const [authorOpacity, setAuthorOpacity] = useState(0);
  const [authorY, setAuthorY] = useState(30);

  const authorRef = useRef(null);
  const textGroupRef = useRef([]);
  const inkGroupRef = useRef([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Title Entry Fluid Animation Pipeline
  useEffect(() => {
    if (!isMounted || !authorRef.current) return;

    let animationFrameId;
    let startTime = null;
    const duration = 2200;
    const delay = 800;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const runAnimation = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            if (elapsed >= delay) {
              const progress = Math.min((elapsed - delay) / duration, 1);

              // Custom cubic-bezier approximation (Cubic Out)
              const easeOutCubic = 1 - Math.pow(1 - progress, 3);

              setLiquidScale(liquifyScale * (1 - easeOutCubic));
              setAuthorOpacity(easeOutCubic);
              setAuthorY(30 * (1 - easeOutCubic));

              if (progress < 1) {
                animationFrameId = requestAnimationFrame(runAnimation);
              }
            } else {
              animationFrameId = requestAnimationFrame(runAnimation);
            }
          };
          animationFrameId = requestAnimationFrame(runAnimation);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(authorRef.current);
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [isMounted, liquifyScale]);

  // Viewport tracking logic mapping across sequential typography blocks
  useEffect(() => {
    if (!isMounted || textGroupRef.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const runtimeDelay = target.getAttribute("data-delay-val") || "0.2";

            target.style.transition = `transform 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) ${runtimeDelay}s, opacity 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) ${runtimeDelay}s`;
            target.style.transform = "translateY(0px)";
            target.style.opacity = "1";

            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.05 },
    );

    textGroupRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMounted]);

  // Scroll triggers running sprite transitions inside frame layers
  useEffect(() => {
    if (!isMounted || inkGroupRef.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const container = entry.target;
            const spriteSheet = container.querySelector(".js-sprite-layer");
            const structuralImg = container.querySelector(".js-target-img");

            if (spriteSheet) {
              spriteSheet.style.animation = `ink-sequence ${revealDuration}s steps(39) 0.3s forwards`;
            }
            if (structuralImg) {
              structuralImg.style.transition =
                "opacity 0.6s cubic-bezier(0.215, 0.61, 0.355, 1) 0.8s";
              structuralImg.style.opacity = "1";
            }
            observer.unobserve(container);
          }
        });
      },
      { threshold: 0.1 },
    );

    inkGroupRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMounted, revealDuration]);

  if (!isMounted) {
    return <div className={`w-full min-h-screen ${backgroundColor}`} />;
  }

  return (
    <div
      className={`w-full min-h-screen overflow-x-hidden font-sans antialiased ${backgroundColor} selection:bg-neutral-200 text-neutral-900 pb-32`}
    >
      {/* ─── Hidden SVG Distortion Filter Context ──────────────────────────── */}
      <svg
        className="absolute w-0 h-0 pointer-events-none opacity-0 invisible"
        aria-hidden="true"
      >
        <defs>
          <filter id="next-liquify">
            <feTurbulence
              baseFrequency={liquifyBaseFrequency}
              numOctaves="4"
              result="warp"
              type="fractalNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="warp"
              scale={liquidScale}
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      <main className={`mx-auto ${maxContainerWidth} px-6 md:px-8 pt-24`}>
        {/* ─── Premium Header Title Layer ─────────────────────────────────── */}
        <header
          ref={authorRef}
          style={{
            filter: "url('#next-liquify')",
            opacity: authorOpacity,
            transform: `translateY(${authorY}px)`,
          }}
          className="text-center will-change-transform select-none mb-32"
        >
          <h1 className="font-['Nanum_Pen_Script',cursive] text-[5.5rem] sm:text-[6.5rem] font-normal leading-none tracking-normal text-neutral-900">
            신윤복
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mt-4 text-neutral-400 font-mono">
            Shin Yun-bok
          </p>
        </header>

        {/* ─── Iterative Editorial Grid Layout ───────────────────────────── */}
        <div className="space-y-36 md:space-y-48">
          {SECTION_DATA.map((section, idx) => {
            const textIdxKo = idx * 2;
            const textIdxEn = idx * 2 + 1;

            return (
              <section key={idx} className="flex flex-col items-center">
                {/* Visual Canvas Element Frame Wrap */}
                <div
                  ref={(el) => (inkGroupRef.current[idx] = el)}
                  className={`relative mx-auto mb-12 overflow-hidden max-w-full ${section.width} ${section.height} ${section.aspect} transition-shadow duration-700 hover:shadow-sm`}
                >
                  <div
                    style={{ backgroundImage: `url(${section.frameUrl})` }}
                    className="absolute inset-0 bg-[size:100%_100%] bg-center z-10 pointer-events-none"
                  />
                  <div className="js-sprite-layer absolute top-0 left-1/2 h-full w-[4000%] bg-[url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/ink-transition-sprite.png')] bg-[size:100%_100%] z-20 pointer-events-none -translate-x-[1.25%]" />
                  <img
                    className={`js-target-img w-full h-full object-cover opacity-0 select-none pointer-events-none ${
                      section.isPortrait ? "object-top" : "object-center"
                    }`}
                    src={section.img}
                    alt={section.alt}
                  />
                </div>

                {/* Literary Description Block */}
                <div className="w-full max-w-[520px] text-center px-2">
                  <p
                    ref={(el) => (textGroupRef.current[textIdxKo] = el)}
                    data-delay-val={section.delayKo}
                    className={`font-['Nanum_Gothic',sans-serif] text-[0.975rem] sm:text-[1.05rem] leading-[1.85] font-medium tracking-wide opacity-0 translate-y-4 mb-4 ${textColorKorean}`}
                  >
                    {section.ko}
                  </p>

                  {/* Subtle Separator Accent Line */}
                  <div className="w-6 h-[1px] bg-neutral-200 mx-auto my-4" />

                  <p
                    ref={(el) => (textGroupRef.current[textIdxEn] = el)}
                    data-delay-val={section.delayEn}
                    className={`text-xs sm:text-[0.85rem] leading-[1.75] tracking-wide opacity-0 translate-y-4 font-serif italic ${textColorEnglish}`}
                  >
                    {section.en}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        {/* ─── Decorative Artist Identity Stamp ────────────────────────────── */}
        <footer className="mt-36 flex flex-col items-center justify-center space-y-6">
          <img
            className="block w-7 h-7 object-contain opacity-85 transition-opacity duration-300 hover:opacity-100"
            src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/heywon-stamp.png"
            alt="Hyewon signature stamp"
          />
        </footer>
      </main>

      {/* Global Optimization Stylesheets */}
      <style jsx global>{`
        @keyframes ink-sequence {
          0% {
            transform: translateX(-1.25%);
          }
          99% {
            transform: translateX(-98.75%);
            opacity: 1;
          }
          100% {
            transform: translateX(-98.75%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
