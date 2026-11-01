"use client";

import { useEffect, useId, useRef } from "react";

const SEP = {
  aUp: {
    from: "M 0 0 C 37 0 70 0 100 0 L 0 0 Z",
    to: "M 0 0 C 35 21 70 0 100 0 L 0 0 Z",
  },
  aDown: {
    from: "M 0 0 C 18 1 61 9 100 0 L 100 10 H 0 Z",
    to: "M 0 0 C 29 6 78 17 100 0 L 100 10 H 0 Z",
  },
  bUp: {
    from: "M 0 0 C 40 0 60 0 100 0 L 0 0 Z",
    to: "M 0 0 C 40 10 60 10 100 0 L 0 0 Z",
  },
  bDown: {
    from: "M 0 0 C 40 0 60 0 100 0 L 100 10 H 0 Z",
    to: "M 0 0 C 25 13 75 13 100 0 L 100 10 H 0 Z",
  },
  cUp: {
    from: "M 0 0 C 23 0 35 0 50 0 C 65 0 74 0 100 0 L 0 0 Z",
    to: "M 0 0 C 17 21.6 35.2 1.2 50 1.4 C 65.2 1.5 83 21.6 100 0 L 0 0 Z",
  },
  cDown: {
    from: "M 24 0 C 33 0 30 0 49 0 C 64 0 65 0.1 74 0 C 83 0 82 0 100 0 L 100 10 L 0 10 L 0 0 C 11 0 15 0.1 24 0 Z",
    to: "M 24 0 C 33 0 37 10 49 10 C 61 10 65 0.1 74 0 C 83 0 90 10 100 0 L 100 10 L 0 10 L 0 0 C 9 7 15 0.1 24 0 Z",
  },
};

const CLIP_TALL = {
  from: "M 0 0 L 500 0 C 500 599.6 500 677.1 500 750 L 0 750 C 0 205 0 105 0 0 Z",
  to: "M 0 0 L 500 0 C 331 608 485 551 500 750 L 0 750 C 120 281 7 296 0 0 Z",
};

const CLIP_GRID = {
  from: "M 50 0 L 500 1 C 397.3 110.7 380.7 235.5 450 375.5 C 519.3 515.5 519.3 640.7 450 751 L 0 751 C 100.7 624.7 120.7 499.5 60 375.5 C -0.7 251.5 -4 126.3 50 0 Z",
  to: "M 0 0 L 450 1 C 508 97 508 221.8 450 375.5 C 392 529.2 408.7 654.3 500 751 L 50 751 C -6.7 600.3 -3.3 475.2 60 375.5 C 123.3 275.8 103.3 150.7 0 0 Z",
};

const CLIP_WIDE = {
  from: "M 0 169 C 174 56.3 343.7 0 509 0 C 674.3 0 838 46.3 1000 169 L 1000 525 C 831.3 383 664.6 312 500 312 C 335.4 312 168.7 383 0 525 L 0 169 Z",
  to: "M 0 169 C 186.7 325 362.7 403 528 403 C 693.3 403 850.7 315 1000 169 L 1000 525 C 843.9 651.7 683.6 715 519 715 C 354.4 715 181.4 651.7 0 525 L 0 169 Z",
};

const CLIP_BLOB = {
  from: "M494.246 145.646c25 39 10.2 103.8-1.2 157.2-11.4 53.4-19.5 95.3-44.5 129.3-25 34-66.9 60.1-120.6 71.7-53.6 11.7-118.9 9-163.7-25-44.8-34-69.2-99.3-71.9-167.3-2.7-68 16.2-138.7 61-177.7 44.9-39 115.6-46.3 183.4-43.4 67.7 3 132.5 16.2 157.5 55.2",
  to: "M422.248 192.542c44.2 49.2 94.8 86.9 111.3 141.1 16.5 54.2-1.1 124.9-45.3 161.8-44.2 36.8-114.9 39.7-167.9 22.1-53.1-17.7-88.4-56-137.1-92.9-48.6-36.8-110.6-72.1-121.2-118.1-10.6-46 30.1-102.5 78.8-151.7 48.7-49.2 105.2-90.9 152.4-81.5 47.1 9.4 84.8 70 129 119.2",
};

const WAVE_LINES = [
  {
    from: "M1,4 C17.6666667,34.6666667 52,50 104,50 C182,50 246.6,-27.4 386.8,11.3 C527,50 553,68 643.8,38.2 C704.333333,18.3333333 790.066667,11.6 901,18 L901,305 C501,305 286.733333,305 258.2,305 C215.3,305 172.7,305 129.8,305 C101.266667,305 58.3333333,305 1,305 L1,4 Z",
    to: "M0,3 C16.6666667,33.6666667 75,-15 128.8,10.3 C174.770703,31.918193 272,-26 320,17 C368,60 431.272051,-18.4516816 525,10.3 C599,33 775,60 900,17 L900,304 C500,304 285.733333,304 257.2,304 C214.3,304 171.7,304 128.8,304 C100.266667,304 57.3333333,304 0,304 L0,3 Z",
  },
  {
    from: "M1,91 C32.7333333,71.9333333 75.6666667,82.8333333 129.8,123.7 C211,185 352,42 479,86 C606,130 694.4,114.4 772.2,100.2 C824.066667,90.7333333 867,102.666667 901,136 L901,305 L879.5,305 C858,305 686.7,305 643.8,305 C601,305 429.7,305 386.8,305 C344,305 301,305 258.2,305 C215.3,305 172.7,305 129.8,305 C87,305 44,305 22.5,305 L1,305 L1,91 Z",
    to: "M0,90 C31.7333333,70.9333333 128.8,-21 226,66 C295.950087,128.609646 399,135 480,66 C561,-3 702.670114,107.309964 746,83 C853.3,22.8 866,101.666667 900,135 L900,304 L878.5,304 C857,304 685.7,304 642.8,304 C600,304 428.7,304 385.8,304 C343,304 300,304 257.2,304 C214.3,304 171.7,304 128.8,304 C86,304 43,304 21.5,304 L0,304 L0,90 Z",
  },
  {
    from: "M1,139 C53.6666667,127.666667 96.6,139.5 129.8,174.5 C179.6,227 242.1,149.3 285,150.2 C327.9,151.1 322.6,219 386.8,181.5 C451,144 478,187 597,187 C716,187 695,139 772.2,160.5 C823.666667,174.833333 866.6,190.666667 901,208 L901,312 L879.5,312 C858,312 815,312 772.2,312 C729.3,312 686.7,312 643.8,312 C601,312 558,312 515.2,312 C472.3,312 429.7,312 386.8,312 C344,312 301,312 258.2,312 C215.3,312 172.7,312 129.8,312 C87,312 44,312 22.5,312 L1,312 L1,139 Z",
    to: "M0,149.2 C52.6666667,137.866667 45,100 128.8,173.5 C188.188882,225.589294 203,75.9791366 284,149.2 C365,222.420863 421,105 478,173.5 C535,242 554,253 596,186 C638,119 721.4,83 771.2,159.5 C821,236 865.6,189.666667 900,207 L900,311 L878.5,311 C857,311 814,311 771.2,311 C728.3,311 685.7,311 642.8,311 C600,311 557,311 514.2,311 C471.3,311 428.7,311 385.8,311 C343,311 300,311 257.2,311 C214.3,311 171.7,311 128.8,311 C86,311 43,311 21.5,311 L0,311 L0,149.2 Z",
  },
  {
    from: "M1,243 C58.3333333,236.333333 101.266667,232.833333 129.8,232.5 C172.7,232 164.4,204.4 258.2,232.2 C352,260 380,165 479,204 C578,243 729.3,230 772.2,224 C800.733333,220 843.666667,213.333333 901,204 L901,305 L1,305 L1,243 Z",
    to: "M0,242 C57.3333333,235.333333 27.6,275 128.8,231.5 C230,188 197.2,242.2 291,270 C384.8,297.8 444,209.729976 543,248.729976 C642,287.729976 689.4,223 771.2,223 C853,223 842.666667,272.333333 900,263 L900,304 L0,304 L0,242 Z",
  },
];

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

export default function ScrollPathMorph({
  bgColor = "#e3e0d8",
  textColor = "#211c19",
  footerBg = "#000000",
  footerTextColor = "#ffffff",
  displayFont = "Georgia, 'Times New Roman', serif",
  bodyFont =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  images = DEFAULT_IMAGES,
  heroPre = "Crafting",
  heroTitle = "Transcendence",
  sectionOneHeading = "Mastering the Now",
  sectionOneBody = "Sit down, and I shall tell thee. The thirst for love, without love of learning, sinks into simpleness. Love of knowledge, without love of learning, sinks into vanity. Love of truth, without love of learning, sinks into cruelty. Love of straightness, without love of learning, sinks into rudeness. Love of daring, without love of learning, sinks into turbulence. Love of strength, without love of learning, sinks into oddity.",
  sectionTwoPre = "Studies of",
  sectionTwoTitle = "Discipline",
  sectionThreePre = "Virtues of",
  sectionThreeTitle = "Excellence",
  sectionFourPre = "Language of",
  sectionFourTitle = "Awakening",
  interludeText = "柿くへば\n鐘が鳴るなり\n法隆寺",
  footerHeading = "Without Longing",
  lineStroke = "#000000",
  lineStrokeLight = "#e3e0d8",
  scrub = true,
  smoothScroll = true,
  lerp = 0.1,
  gridMaxWidth = 1200,
  className = "",
}) {
  const rootRef = useRef(null);
  const uid = useId().replace(/[:]/g, "");

  useEffect(() => {
    let killed = false;
    let lenis = null;
    let rafId = null;
    const triggers = [];

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }, lenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        smoothScroll ? import("lenis") : Promise.resolve(null),
      ]);

      if (killed || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      if (smoothScroll && lenisMod) {
        const Lenis = lenisMod.default;
        lenis = new Lenis({ lerp });
        const loop = (time) => {
          lenis.raf(time);
          rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        lenis.on("scroll", ScrollTrigger.update);
      }

      const nodes = rootRef.current.querySelectorAll("path[data-path-to]");
      nodes.forEach((el) => {
        const svgEl = el.closest("svg");
        const pathTo = el.dataset.pathTo;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: svgEl,
            start: "top bottom",
            end: "bottom top",
            scrub,
          },
        });
        tl.to(el, { ease: "none", attr: { d: pathTo } });
        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      });

      ScrollTrigger.refresh();
    };

    run();

    return () => {
      killed = true;
      triggers.forEach((t) => t.kill());
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis && typeof lenis.destroy === "function") lenis.destroy();
    };
  }, [scrub, smoothScroll, lerp]);

  const img = (i) => images[i] || DEFAULT_IMAGES[i];

  const Separator = ({ shape, position }) => (
    <svg
      className={`pointer-events-none absolute left-0 z-10 block h-[150px] w-full ${
        position === "up" ? "-top-px" : "-bottom-px"
      }`}
      width="100%"
      height="100%"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      style={{ fill: bgColor }}
    >
      <path
        data-path-to={shape.to}
        vectorEffect="non-scaling-stroke"
        d={shape.from}
      />
    </svg>
  );

  const WaveBlock = ({ id, stroke }) => (
    <svg
      className="relative block h-auto"
      viewBox="0 0 900 300"
      width="900"
      height="600"
      style={{
        width: "calc(100% + 5px)",
        marginLeft: "-2.5px",
        fill: "none",
        stroke,
        strokeWidth: 1,
      }}
    >
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width="900" height="290" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {WAVE_LINES.map((p, i) => (
          <path
            key={i}
            vectorEffect="non-scaling-stroke"
            data-path-to={p.to}
            d={p.from}
          />
        ))}
      </g>
    </svg>
  );

  const ClipImage = ({ id, shape, src, w, h, className: cls = "" }) => (
    <svg
      className={`h-auto max-w-full ${cls}`}
      width={`${w}px`}
      height={`${h}px`}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <clipPath id={id}>
          <path data-path-to={shape.to} d={shape.from} />
        </clipPath>
      </defs>
      <image
        clipPath={`url(#${id})`}
        href={src}
        xlinkHref={src}
        x="0"
        y="0"
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid slice"
      />
    </svg>
  );

  return (
    <div
      ref={rootRef}
      className={`w-full overflow-x-hidden ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
      }}
    >
      <section className="relative flex min-h-screen flex-col items-center justify-center">
        <div style={{ fontFamily: displayFont, lineHeight: 0.9 }}>
          <span
            className="block"
            style={{ fontSize: "clamp(2rem,10vw,7rem)", marginLeft: "12vw" }}
          >
            {heroPre}
          </span>
          <h2 className="m-0" style={{ fontSize: "11vw" }}>
            {heroTitle}
          </h2>
        </div>
      </section>

      <section className="relative">
        <div
          className="relative grid h-screen w-full place-items-center bg-cover bg-[50%_100%] bg-no-repeat"
          style={{ backgroundImage: `url(${img(0)})` }}
        >
          <Separator shape={SEP.aUp} position="up" />
          <Separator shape={SEP.aDown} position="down" />
        </div>
        <div className="grid items-center justify-center content-center gap-x-[6vw] gap-y-[6vw] px-[10vw] pb-[30vh] pt-[10vh] lg:grid-cols-[55%_1fr]">
          <div className="flex flex-col items-end justify-center text-right">
            <h2
              className="m-0"
              style={{
                fontFamily: displayFont,
                fontSize: "clamp(1.75rem,10vw,7rem)",
                lineHeight: 0.85,
              }}
            >
              {sectionOneHeading}
            </h2>
            <p className="max-w-[40ch] text-xl leading-relaxed">
              {sectionOneBody}
            </p>
          </div>
          <ClipImage
            id={`shape1-${uid}`}
            shape={CLIP_TALL}
            src={img(1)}
            w={500}
            h={750}
            className="justify-self-center"
          />
        </div>
      </section>

      <section className="relative">
        <div
          className="relative grid h-screen w-full place-items-center bg-cover bg-[50%_100%] bg-no-repeat"
          style={{ backgroundImage: `url(${img(2)})` }}
        >
          <Separator shape={SEP.bUp} position="up" />
          <Separator shape={SEP.bDown} position="down" />
          <div
            className="relative z-20 text-right"
            style={{
              fontFamily: displayFont,
              lineHeight: 0.9,
              color: bgColor,
            }}
          >
            <span
              className="block"
              style={{ fontSize: "clamp(2rem,10vw,7rem)" }}
            >
              {sectionTwoPre}
            </span>
            <h2 className="m-0" style={{ fontSize: "11vw" }}>
              {sectionTwoTitle}
            </h2>
          </div>
        </div>
      </section>

      <section
        className="mx-auto grid grid-cols-1 justify-items-center gap-[10vw] px-[10vw] pb-[30vh] pt-[20vh] md:grid-cols-2"
        style={{ maxWidth: `${gridMaxWidth}px` }}
      >
        {[3, 4, 5, 6].map((idx, i) => (
          <div
            key={idx}
            className="w-full max-w-[400px]"
            style={{
              marginTop:
                i === 1 ? "var(--offset-a)" : i === 2 ? "var(--offset-b)" : 0,
            }}
          >
            <ClipImage
              id={`shapeGrid${i}-${uid}`}
              shape={CLIP_GRID}
              src={img(idx)}
              w={500}
              h={750}
              className="w-full"
            />
          </div>
        ))}
      </section>

      <section className="flex min-h-screen flex-col items-center justify-center">
        <WaveBlock id={`wave1-${uid}`} stroke={lineStroke} />
        <div
          className="text-right"
          style={{ fontFamily: displayFont, lineHeight: 0.9 }}
        >
          <span className="block" style={{ fontSize: "clamp(2rem,10vw,7rem)" }}>
            {sectionThreePre}
          </span>
          <h2 className="m-0" style={{ fontSize: "11vw" }}>
            {sectionThreeTitle}
          </h2>
        </div>
        <WaveBlock id={`wave2-${uid}`} stroke={lineStroke} />
      </section>

      <section className="relative">
        <div
          className="relative grid h-screen w-full place-items-center bg-cover bg-[50%_100%] bg-no-repeat"
          style={{ backgroundImage: `url(${img(8)})` }}
        >
          <Separator shape={SEP.cUp} position="up" />
          <Separator shape={SEP.cDown} position="down" />
          <div
            className="relative z-20 text-right"
            style={{
              fontFamily: displayFont,
              lineHeight: 0.9,
              color: bgColor,
            }}
          >
            <span
              className="block"
              style={{ fontSize: "clamp(2rem,10vw,7rem)" }}
            >
              {sectionFourPre}
            </span>
            <h2 className="m-0" style={{ fontSize: "11vw" }}>
              {sectionFourTitle}
            </h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-[10vw] pb-[30vh] pt-[20vh]">
          <div
            className="mb-16"
            style={{
              writingMode: "vertical-rl",
              fontSize: "7vw",
              whiteSpace: "pre-line",
              fontFamily: displayFont,
            }}
          >
            {interludeText}
          </div>
          <ClipImage
            id={`shape8-${uid}`}
            shape={CLIP_WIDE}
            src={img(9)}
            w={1000}
            h={715}
          />
          <ClipImage
            id={`shape9-${uid}`}
            shape={CLIP_WIDE}
            src={img(10)}
            w={1000}
            h={715}
            className="-mt-[20%]"
          />
          <ClipImage
            id={`shape10-${uid}`}
            shape={CLIP_WIDE}
            src={img(11)}
            w={1000}
            h={715}
            className="-mt-[20%]"
          />
        </div>
      </section>

      <section
        className="relative"
        style={{ backgroundColor: footerBg, color: footerTextColor }}
      >
        <div className="grid content-center items-center justify-center gap-0 px-[10vw] pb-0 pt-[10vh] lg:grid-cols-[55%_1fr]">
          <ClipImage
            id={`shape11-${uid}`}
            shape={CLIP_BLOB}
            src={img(12)}
            w={600}
            h={600}
            className="justify-self-center"
          />
          <div className="flex flex-col justify-center text-left">
            <h2
              className="m-0"
              style={{
                fontFamily: displayFont,
                fontSize: "clamp(1.75rem,10vw,7rem)",
                lineHeight: 0.85,
                color: bgColor,
              }}
            >
              {footerHeading}
            </h2>
          </div>
        </div>
        <WaveBlock id={`wave3-${uid}`} stroke={lineStrokeLight} />
        <div className="py-[10vh]" />
      </section>

      <style>
        {
          ":root{--offset-a:0px;--offset-b:0px;}@media (min-width:768px){:root{--offset-a:50vh;--offset-b:-50vh;}}"
        }
      </style>
    </div>
  );
}