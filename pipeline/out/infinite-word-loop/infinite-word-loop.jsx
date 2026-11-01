"use client";

import { useEffect, useRef } from "react";

const DEFAULT_WORDS = [
  "Infinite",
  "loops",
  "without",
  "repeating",
  "or",
  "shuffling",
  "elements",
  "using",
  "GSAP",
  "🤙",
];

export default function InfiniteWordLoop({
  className = "",
  words = DEFAULT_WORDS,
  fontLevel = 6,
  stepDuration = 1,
  stepDelay = 1,
  elasticity = 1,
  elasticityDecay = 0.875,
  indicatorColor = "oklch(0.75 1 320)",
  textColor = null,
  showGrid = true,
  fontFamily = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  uppercase = true,
}) {
  const containerRef = useRef(null);
  const ulRef = useRef(null);
  const indicatorRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let ctx = null;

    import("gsap").then(({ gsap }) => {
      if (cancelled || !ulRef.current || !containerRef.current) return;

      gsap.config({ trialWarn: false });

      ctx = gsap.context(() => {
        const liEls = gsap.utils.toArray(ulRef.current.querySelectorAll("li"));
        gsap.set(liEls, { yPercent: 450 });

        const tl = gsap.timeline({ paused: true });
        const paddedLines = [...liEls, ...liEls, ...liEls];

        paddedLines.forEach((line, i) => {
          const lineTl = gsap.timeline().set(line, { yPercent: 450 }).to(
            line,
            {
              yPercent: "-=900",
              repeatRefresh: true,
              immediateRender: false,
              ease: "none",
              duration: 6,
            },
            0,
          );
          tl.add(lineTl, i);
        });

        const scrubber = gsap.timeline({ paused: true }).fromTo(
          tl,
          { totalTime: liEls.length + 1 },
          {
            totalTime: liEls.length * 2 + 1,
            ease: "none",
            duration: liEls.length,
            repeat: -1,
          },
        );
        gsap.set(scrubber, { totalTime: liEls.length + 2 });

        const syncIndicator = () => {
          indexRef.current += 1;
          const el = liEls[indexRef.current % liEls.length];
          if (!indicatorRef.current || !el) return;
          indicatorRef.current.style.setProperty(
            "--iw-width",
            `${el.getBoundingClientRect().width}px`,
          );
          indicatorRef.current.style.setProperty(
            "--iw-hue",
            String(Math.floor(Math.random() * 360)),
          );
        };

        const firstEl = liEls[0];
        if (indicatorRef.current && firstEl) {
          indicatorRef.current.style.setProperty(
            "--iw-width",
            `${firstEl.getBoundingClientRect().width}px`,
          );
        }

        gsap.to(scrubber, {
          delay: 1,
          totalTime: "+=1",
          duration: stepDuration,
          repeat: -1,
          repeatDelay: stepDelay,
          repeatRefresh: true,
          onStart: syncIndicator,
          onRepeat: syncIndicator,
          ease: `elastic.out(${elasticity}, ${elasticityDecay})`,
        });

        gsap.set(containerRef.current, { opacity: 1 });
      }, containerRef);
    });

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
    };
  }, [words, stepDuration, stepDelay, elasticity, elasticityDecay]);

  const fontSize = `clamp(
    calc(calc(16 * pow(1.2, ${fontLevel})) / 16 * 1rem),
    calc(calc(16 * pow(1.2, ${fontLevel})) / 16 * 1rem) + (calc((calc(20 * pow(1.33, ${fontLevel})) - calc(16 * pow(1.2, ${fontLevel}))) / (1500 - 375)) * (100vw - 375px)),
    calc(calc(20 * pow(1.33, ${fontLevel})) / 16 * 1rem)
  )`;

  return (
    <div
      className={`relative w-full h-screen flex items-center justify-center ${className}`}
      style={{
        fontFamily:
          "'SF Pro Text','SF Pro Icons','Helvetica Neue',Helvetica,Arial,sans-serif,system-ui",
        colorScheme: "light dark",
      }}
    >
      {showGrid && (
        <div
          className="fixed inset-0 pointer-events-none -z-10"
          style={{
            background: `
              linear-gradient(90deg, color-mix(in hsl, canvasText, transparent 70%) 1px, transparent 1px 45px) 50% 50% / 45px 45px,
              linear-gradient(color-mix(in hsl, canvasText, transparent 70%) 1px, transparent 1px 45px) 50% 50% / 45px 45px
            `,
            mask: "linear-gradient(-20deg, transparent 50%, white)",
          }}
        />
      )}

      <div
        ref={containerRef}
        className="relative flex items-center justify-center text-center opacity-0"
        style={{
          fontSize,
          height: "3lh",
          mask: "linear-gradient(#0000 0.25lh, #fff calc(50% - 0.5lh) calc(50% + 0.5lh), #0000 calc(100% - 0.25lh))",
          color: textColor ?? "color-mix(in lch, canvasText, canvas 15%)",
        }}
      >
          <div
          ref={indicatorRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-[width,border-color] duration-[250ms]"
          style={{
            height: "1lh",
            border: `0.05em solid ${indicatorColor}`,
            width: "calc(var(--iw-width, 200px) + 0.175em)",
            clipPath: `polygon(
              0 0, 0.175em 0, 0.175em 0.175em, 0 0.175em, 0 100%,
              0 calc(100% - 0.175em), 0.175em calc(100% - 0.175em), 0.175em 100%, 0 100%,
              calc(100% - 0.175em) 100%, calc(100% - 0.175em) calc(100% - 0.175em), 100% calc(100% - 0.175em), 100% 100%,
              100% 0.175em, calc(100% - 0.175em) 0.175em, calc(100% - 0.175em) 0, 100% 0,
              100% 100%, 0 100%
            )`,
          }}
        />

        <ul
          ref={ulRef}
          className="p-0 m-0 list-none gap-4 relative inline-grid items-center content-center justify-center justify-items-center text-center"
          style={{
            textTransform: uppercase ? "uppercase" : "none",
            lineHeight: 1,
            fontFamily,
            height: "1lh",
            paddingInline: "0.25em",
          }}
        >
          {words.map((word, i) => (
            <li
              key={i}
              className="inline-block"
              style={{
                width: word === "🤙" ? "1.5em" : "fit-content",
                height: "1lh",
                gridArea: "1 / 1",
                lineHeight: 1,
              }}
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
