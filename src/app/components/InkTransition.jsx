"use client";

import { useEffect, useId, useRef, useState } from "react";

const DEFAULT_SECTIONS = [
  {
    img: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=1600&q=80",
    alt: "Lovers under the moon",
    isPortrait: false,
    sizeClass: "w-[600px] h-[375px]",
    ko: "혜원 신윤복 (1758-1813)은 조선시대의 화가이다.",
    en: "Shin Yun-bok, better known by his pen name Hyewon (1758–1813), was a Korean painter of the Joseon Dynasty.",
    delayKo: "0.2",
    delayEn: "0.4",
  },
  {
    img: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=1600&q=80",
    alt: "Drinking bout",
    isPortrait: false,
    sizeClass: "w-[540px] h-[338px]",
    ko: "당대의 단원 김홍도와 긍재 김득신과 같이, 그때 당시의 일상생활의 사실적 묘사로 잘 알려져 있다.",
    en: "Like his contemporaries Danwon and Geungjae, he is known for his realistic depictions of daily life in his time.",
    delayKo: "0.1",
    delayEn: "0.3",
  },
  {
    img: "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1600&q=80",
    alt: "Dano day",
    isPortrait: false,
    sizeClass: "w-[540px] h-[338px]",
    ko: "혜원의 그림은 단원의 작품보다 성적묘사가 훨씬 강했고, 이것은 당시 왕립 미술 학교에서 파면을 당하는데 이유가 되었다.",
    en: "His genre paintings are distinctly more erotic than Danwon's, a fact which contributed to his expulsion from the royal painting institute, Dohwaseo.",
    delayKo: "0.1",
    delayEn: "0.3",
  },
  {
    img: "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=900&q=80",
    alt: "Miindo",
    isPortrait: true,
    sizeClass: "w-[280px] h-[448px]",
    ko: '단원, 오원과 더불어, 혜원은 현재 조선시대 "3원 화가"로 불리우고 있다.',
    en: 'Together with Danwon and the later painter Owon, Hyewon is remembered today as one of the "Three Wons" of Joseon-period painting.',
    delayKo: "0.1",
    delayEn: "0.3",
  },
];

const MASK_GRADIENT =
  "radial-gradient(ellipse closest-side, #000 65%, transparent 100%)";

export default function InkTransition({
  sections = DEFAULT_SECTIONS,
  titleKo = "신윤복",
  titleEn = "Shin Yun-bok",
  fontDisplayFamily = "Nanum Pen Script",
  fontDisplayUrl = "https://cdn.jsdelivr.net/fontsource/fonts/nanum-pen-script@latest/korean-400-normal.woff2",
  fontBodyFamily = "Nanum Gothic",
  fontBodyUrl = "https://cdn.jsdelivr.net/fontsource/fonts/nanum-gothic@latest/korean-400-normal.woff2",
  backgroundColor = "bg-white",
  maxContainerWidth = "max-w-[640px]",
  titleColor = "text-black",
  subtitleColor = "text-black/40",
  textColorKorean = "text-black",
  textColorEnglish = "text-black/60",
  dividerColor = "bg-black/20",
  liquifyBaseFrequency = 0.012,
  liquifyScale = 250,
  inkEdgeFrequency = 0.035,
  inkEdgeScale = 40,
  revealDuration = 1.8,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [liquidScale, setLiquidScale] = useState(liquifyScale);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [titleY, setTitleY] = useState(30);

  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const liquifyId = "liquify" + uid;
  const inkEdgeId = "inkEdge" + uid;

  const titleRef = useRef(null);
  const textGroupRef = useRef([]);
  const inkGroupRef = useRef([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !titleRef.current) return;

    let frameId;
    let startTime = null;
    const duration = 2200;
    const delay = 800;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const run = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          if (elapsed >= delay) {
            const progress = Math.min((elapsed - delay) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setLiquidScale(liquifyScale * (1 - eased));
            setTitleOpacity(eased);
            setTitleY(30 * (1 - eased));
            if (progress < 1) frameId = requestAnimationFrame(run);
          } else {
            frameId = requestAnimationFrame(run);
          }
        };
        frameId = requestAnimationFrame(run);
        observer.unobserve(entry.target);
      },
      { threshold: 0.05 },
    );

    observer.observe(titleRef.current);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [isMounted, liquifyScale]);

  useEffect(() => {
    if (!isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const delay = target.getAttribute("data-delay-val") || "0.2";
          target.style.transition =
            "transform 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) " +
            delay +
            "s, opacity 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) " +
            delay +
            "s";
          target.style.transform = "translateY(0px)";
          target.style.opacity = "1";
          observer.unobserve(target);
        });
      },
      { threshold: 0.05 },
    );

    textGroupRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMounted, sections]);

  useEffect(() => {
    if (!isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const mask = entry.target.querySelector(".js-ink-mask");
          if (mask) {
            const ease = "cubic-bezier(0.215, 0.61, 0.355, 1)";
            mask.style.transition =
              "mask-size " +
              revealDuration +
              "s " +
              ease +
              " 0.3s, -webkit-mask-size " +
              revealDuration +
              "s " +
              ease +
              " 0.3s";
            mask.style.maskSize = "260% 260%";
            mask.style.webkitMaskSize = "260% 260%";
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 },
    );

    inkGroupRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMounted, revealDuration, sections]);

  const fontCss =
    '@font-face{font-family:"' +
    fontDisplayFamily +
    '";src:url("' +
    fontDisplayUrl +
    '") format("woff2");font-display:swap;}' +
    '@font-face{font-family:"' +
    fontBodyFamily +
    '";src:url("' +
    fontBodyUrl +
    '") format("woff2");font-display:swap;}';

  if (!isMounted) {
    return <div className={`min-h-screen w-full ${backgroundColor}`} />;
  }

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden pb-32 antialiased selection:bg-black selection:text-white ${backgroundColor}`}
    >
      <style>{fontCss}</style>

      <svg
        className="pointer-events-none invisible absolute h-0 w-0 opacity-0"
        aria-hidden="true"
      >
        <defs>
          <filter id={liquifyId}>
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
          <filter id={inkEdgeId}>
            <feTurbulence
              baseFrequency={inkEdgeFrequency}
              numOctaves="3"
              result="edge"
              type="fractalNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="edge"
              scale={inkEdgeScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <main className={`mx-auto px-6 pt-24 md:px-8 ${maxContainerWidth}`}>
        <header
          ref={titleRef}
          style={{
            filter: `url(#${liquifyId})`,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
          className="mb-32 select-none text-center will-change-transform"
        >
          <h1
            className={`text-[5.5rem] font-normal leading-none sm:text-[6.5rem] ${titleColor}`}
            style={{ fontFamily: `"${fontDisplayFamily}", cursive` }}
          >
            {titleKo}
          </h1>
          <p
            className={`mt-4 text-sm tracking-[0.2em] ${subtitleColor}`}
            style={{ fontFamily: `"${fontBodyFamily}", sans-serif` }}
          >
            {titleEn}
          </p>
        </header>

        <div className="space-y-36 md:space-y-48">
          {sections.map((section, idx) => (
            <section key={idx} className="flex flex-col items-center">
              <div
                ref={(el) => (inkGroupRef.current[idx] = el)}
                style={{ filter: `url(#${inkEdgeId})` }}
                className={`relative mx-auto mb-12 max-w-full ${section.sizeClass}`}
              >
                <div
                  className="js-ink-mask h-full w-full"
                  style={{
                    maskImage: MASK_GRADIENT,
                    WebkitMaskImage: MASK_GRADIENT,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "0% 0%",
                    WebkitMaskSize: "0% 0%",
                  }}
                >
                  <img
                    className={`pointer-events-none h-full w-full select-none object-cover ${section.isPortrait ? "object-top" : "object-center"
                      }`}
                    src={section.img}
                    alt={section.alt}
                  />
                </div>
              </div>

              <div className="w-full max-w-[520px] px-2 text-center">
                <p
                  ref={(el) => (textGroupRef.current[idx * 2] = el)}
                  data-delay-val={section.delayKo}
                  style={{
                    opacity: 0,
                    transform: "translateY(1rem)",
                    fontFamily: `"${fontBodyFamily}", sans-serif`,
                  }}
                  className={`mb-4 text-[0.975rem] font-medium leading-[1.85] tracking-wide sm:text-[1.05rem] ${textColorKorean}`}
                >
                  {section.ko}
                </p>

                <div className={`mx-auto my-4 h-px w-6 ${dividerColor}`} />

                <p
                  ref={(el) => (textGroupRef.current[idx * 2 + 1] = el)}
                  data-delay-val={section.delayEn}
                  style={{ opacity: 0, transform: "translateY(1rem)" }}
                  className={`font-serif text-xs italic leading-[1.75] tracking-wide sm:text-[0.85rem] ${textColorEnglish}`}
                >
                  {section.en}
                </p>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}