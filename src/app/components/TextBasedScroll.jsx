"use client";

import { useEffect, useId, useRef } from "react";

// ─── ScrollTextPath ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// bgColor              string   #0a0104     Page background color
// textColor            string   #fff        Base text color
// mutedColor           string   #504f4f     Grid paragraph color
// linkColor            string   #5c5c5c     Frame link / nav color
// linkHoverColor       string   #fff        Frame link hover color
// serifFont            string   Georgia..   Font stack for headings + curved text
// sansFont             string   Inter..     Font stack for grid descriptions
// eyebrow              string   "Animating…" Small top-left frame title
// heading              string   "A NOVA…"   Small top-center frame heading
// navLinks             array    [...]       Top-right nav labels (strings)
// counter              array    [...]       Frame counter pairs {value,label}
// introTitle           string   Terraforming Giant hero word
// introHint            string   "Discover…" Hero sub-hint with the vertical rule
// gridItems            array    [...]       {number,img,title,description} ×8
// curves               array    [...]       Curved text definitions (see below)
// bigImages            array    [...]       Two full-width image URLs
// heroHeight           string   100vh       Min height of the intro block
// gridGap              string   10vw        Gap between the two grid columns
// gridMargin           string   15rem       Vertical margin around each grid
// offsetLerp           number   0.22        Smoothing for textPath startOffset
// scrollLerp           number   0.17        Smoothing for the scroll tracker
// blurMaxDistance      number   400         Scroll delta that maps to max blur
// distortMaxDistance   number   200         Scroll delta that maps to max warp
// enableFilters        boolean  true        Master switch for SVG filters
// disableOnFirefox     boolean  true        Strip filters on Firefox
// className            string   ""          Extra classes on the root wrapper
//
// curves[] item shape
// ──────────────────────────────────────────────────────────────────────────
// text        string   The sentence rendered along the path
// path        string   SVG path "d" the text follows
// viewBox     string   viewBox of that curve's svg
// filter      string   "blur" | "glow" | "distortion" | "distortionGlow"
// fontSize    number   Font size in viewBox units
// color       string   Fill color for this curve's text
// minBlur     number   stdDeviation at zero scroll speed
// maxBlur     number   stdDeviation at max scroll speed
// minScale    number   Displacement scale at zero scroll speed
// maxScale    number   Displacement scale at max scroll speed
// absolute    boolean  Position the curve absolutely over the last grid
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_GRID_ITEMS = [
  {
    number: "01",
    img: "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
    title: "One man, one mission",
    description:
      "Hating the long exile and touched by the love of his birthplace, he had been closed in by the sea. Although the land and waves are obstructed, the sky at least lies open; we will fly there.",
  },
  {
    number: "02",
    img: "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
    title: "Geode planning",
    description:
      "He sends down his mind into unknown arts and changes his nature. He puts feathers in a row beginning with the small ones, so that you should think it has grown on an incline.",
  },
  {
    number: "03",
    img: "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
    title: "Disaster management",
    description:
      "He binds the middle ones with thread and the last feathers with wax, then bends what he has created by a small curvature as to mimic real birds.",
  },
  {
    number: "04",
    img: "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
    title: "Impact theory",
    description:
      "Travel in the middle course, so that the waves may not weigh down your wings if you go too low, and so that the sun will not scorch them if you go too high. Stay between both.",
  },
  {
    number: "05",
    img: "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
    title: "Incubation assertion",
    description:
      "With me leading, seize the way. He hands over the rules of flying and fits the unknown wings on his shoulders, and having lifted himself up he flies before and fears for his comrade.",
  },
  {
    number: "06",
    img: "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
    title: "Hyperdrive vessel",
    description:
      "Just as a bird who has led forth a tender offspring from a high nest into the air, he moves himself and looks back at the wings of his son.",
  },
  {
    number: "07",
    img: "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
    title: "Icarian engine",
    description:
      "Islands had been left behind on either side when the boy began to rejoice in his bold flight, and deserted his leader, and attracted by a desire for the sky he took his path higher.",
  },
  {
    number: "08",
    img: "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
    title: "Neutrospace accelerator",
    description:
      "The vicinity of the sun softens the fragrant wax, the chains of the feathers. He shook his bare arms and, lacking oarage, he takes up no air.",
  },
];

const DEFAULT_CURVES = [
  {
    text: "You may think I'm small, but I have a universe inside my mind.",
    path: "M 0 100 Q 250 200 500 100 Q 750 0 1000 100",
    viewBox: "0 0 1000 200",
    filter: "blur",
    fontSize: 42,
    color: "#ffffff",
    minBlur: 0,
    maxBlur: 10,
  },
  {
    text: "Don't forget about the stardust. Don't forget about the quartz rocks in the woods.",
    path: "M 0 100 Q 250 0 500 100 Q 750 200 1000 100",
    viewBox: "0 0 1000 200",
    filter: "glow",
    fontSize: 42,
    color: "#ffffff",
    minBlur: 0,
    maxBlur: 30,
  },
  {
    text: "Dwell on the beauty of life. Watch the stars.",
    path: "M 0 50 Q 100 0 200 100 Q 300 200 650 50 C 750 0 750 150 1000 50",
    viewBox: "0 0 1000 200",
    filter: "distortion",
    fontSize: 42,
    color: "#8569c2",
    minScale: 0,
    maxScale: 100,
  },
  {
    text: "The cosmos is within us. We are made of star-stuff.",
    path: "M 0 200 Q 150 300 300 200 Q 700 0 1000 150",
    viewBox: "0 0 1000 300",
    filter: "distortionGlow",
    fontSize: 42,
    color: "#8569c2",
    minScale: 0,
    maxScale: 50,
  },
  {
    text: "When it is dark enough, you can see the stars.",
    path: "M 0 150 Q 200 50 500 50 Q 800 50 1000 150",
    viewBox: "0 0 1000 200",
    filter: "blur",
    fontSize: 32,
    color: "#ffffff",
    minBlur: 0,
    maxBlur: 10,
  },
  {
    text: "It is not the one who has too little, but the one who craves more, that is poor.",
    path: "M 0 150 Q 200 50 500 50 Q 800 50 1000 150",
    viewBox: "0 0 1000 200",
    filter: "blur",
    fontSize: 32,
    color: "#ffffff",
    minBlur: 0,
    maxBlur: 10,
  },
  {
    text: "Live by love though the stars walk backward.",
    path: "M 0 150 Q 200 50 500 50 Q 800 50 1000 150",
    viewBox: "0 0 1000 200",
    filter: "blur",
    fontSize: 32,
    color: "#ffffff",
    minBlur: 0,
    maxBlur: 10,
  },
  {
    text: "Yours is the light by which my spirit is born: you are my sun, my moon, and all my stars.",
    path: "M 0 0 Q 200 150 500 150 Q 850 150 1000 0",
    viewBox: "0 0 1000 200",
    filter: "blur",
    fontSize: 48,
    color: "#f9e9a4",
    minBlur: 0,
    maxBlur: 10,
    absolute: true,
  },
];

const DEFAULT_BIG_IMAGES = [
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=1600&q=80",
];

const DEFAULT_COUNTER = [
  { value: "06", label: "months" },
  { value: "04", label: "days left" },
];

const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
const lerp = (a, b, n) => (1 - n) * a + n * b;
const clamp = (val, min, max) => Math.max(Math.min(val, max), min);

function CurvedText({
  curve,
  uid,
  index,
  serifFont,
  offsetLerp,
  scrollLerp,
  blurMaxDistance,
  distortMaxDistance,
  enableFilters,
  disableOnFirefox,
}) {
  const svgRef = useRef(null);
  const textPathRef = useRef(null);
  const primitiveRef = useRef(null);

  const pathId = `${uid}-path-${index}`;
  const filterId = `${uid}-filter-${index}`;
  const isDistortion =
    curve.filter === "distortion" || curve.filter === "distortionGlow";

  useEffect(() => {
    const svg = svgRef.current;
    const textPath = textPathRef.current;
    if (!svg || !textPath) return;

    const isFirefox =
      typeof navigator !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") > -1;
    const filtersActive = enableFilters && !(disableOnFirefox && isFirefox);

    if (!filtersActive) {
      const textEl = svg.querySelector("text");
      if (textEl) textEl.removeAttribute("filter");
    }

    const pathEl = svg.querySelector("path");
    const pathLength = pathEl ? pathEl.getTotalLength() : 1000;

    let rect = svg.getBoundingClientRect();
    let positionY = rect.top + window.pageYOffset;
    let winHeight = window.innerHeight;

    const computeOffset = () =>
      map(
        positionY - window.pageYOffset,
        winHeight,
        0,
        pathLength,
        -pathLength / 2,
      );

    let offsetValue = computeOffset();
    let scrollValue = window.pageYOffset;
    let entered = false;
    let visible = false;
    let frame = 0;

    textPath.setAttribute("startOffset", offsetValue);

    const updatePrimitive = (distance) => {
      const el = primitiveRef.current;
      if (!el || !filtersActive) return;
      if (isDistortion) {
        const min = curve.minScale ?? 0;
        const max = curve.maxScale ?? 100;
        const value = clamp(
          map(distance, 0, distortMaxDistance, min, max),
          min,
          max,
        );
        el.setAttribute("scale", value);
      } else {
        const min = curve.minBlur ?? 0;
        const max = curve.maxBlur ?? 10;
        const value = clamp(
          map(distance, 0, blurMaxDistance, min, max),
          min,
          max,
        );
        el.setAttribute("stdDeviation", value);
      }
    };

    const update = () => {
      const currentOffset = computeOffset();
      offsetValue = !entered
        ? currentOffset
        : lerp(offsetValue, currentOffset, offsetLerp);
      textPath.setAttribute("startOffset", offsetValue);

      const currentScroll = window.pageYOffset;
      scrollValue = !entered
        ? currentScroll
        : lerp(scrollValue, currentScroll, scrollLerp);
      updatePrimitive(Math.abs(scrollValue - currentScroll));

      if (!entered) entered = true;
    };

    const onResize = () => {
      rect = svg.getBoundingClientRect();
      positionY = rect.top + window.pageYOffset;
      winHeight = window.innerHeight;
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.intersectionRatio > 0;
        if (!visible) {
          entered = false;
          update();
        }
      });
    });
    observer.observe(svg);

    const render = () => {
      if (visible) update();
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [
    curve,
    isDistortion,
    offsetLerp,
    scrollLerp,
    blurMaxDistance,
    distortMaxDistance,
    enableFilters,
    disableOnFirefox,
  ]);

  const renderFilter = () => {
    if (curve.filter === "blur") {
      return (
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur ref={primitiveRef} stdDeviation="0" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
          </feMerge>
        </filter>
      );
    }
    if (curve.filter === "glow") {
      return (
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur
            ref={primitiveRef}
            in="SourceAlpha"
            stdDeviation="0"
            result="glow"
          />
          <feColorMatrix
            result="bluralpha"
            type="matrix"
            values="0 -1 0 0 0 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1.8 0"
          />
          <feOffset in="bluralpha" dx="0" dy="0" result="offsetBlur" />
          <feMerge>
            <feMergeNode in="offsetBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      );
    }
    if (curve.filter === "distortion") {
      return (
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.03"
            numOctaves="2"
            seed="2"
            stitchTiles="stitch"
            result="noise"
          />
          <feDisplacementMap
            ref={primitiveRef}
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      );
    }
    return (
      <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="10" result="glow" />
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0 0.1"
          numOctaves="2"
          seed="2"
          stitchTiles="noStitch"
          result="noise"
        />
        <feDisplacementMap
          ref={primitiveRef}
          in="SourceGraphic"
          in2="noise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="B"
          result="displacement"
        />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="displacement" />
        </feMerge>
      </filter>
    );
  };

  return (
    <svg
      ref={svgRef}
      width="120%"
      preserveAspectRatio="xMidYMid meet"
      viewBox={curve.viewBox}
      className={`flex-none left-[-10%] ${
        curve.absolute ? "absolute top-0" : "relative"
      }`}
    >
      <defs>{renderFilter()}</defs>
      <path id={pathId} d={curve.path} fill="none" />
      <text
        filter={`url(#${filterId})`}
        fill={curve.color}
        style={{ fontSize: `${curve.fontSize}px`, fontFamily: serifFont }}
      >
        <textPath ref={textPathRef} href={`#${pathId}`} startOffset="0">
          {curve.text}
        </textPath>
      </text>
    </svg>
  );
}

export default function TextBasedScroll({
  bgColor = "#0a0104",
  textColor = "#ffffff",
  mutedColor = "#504f4f",
  linkColor = "#5c5c5c",
  linkHoverColor = "#ffffff",
  serifFont = 'Georgia, "Times New Roman", serif',
  sansFont = 'Inter, "Helvetica Neue", Arial, sans-serif',
  eyebrow = "Animating Text on a Path",
  heading = "A Nova space project",
  navLinks = ["Updates", "About", "Careers"],
  counter = DEFAULT_COUNTER,
  introTitle = "Terraforming",
  introHint = "Discover our mission",
  gridItems = DEFAULT_GRID_ITEMS,
  curves = DEFAULT_CURVES,
  bigImages = DEFAULT_BIG_IMAGES,
  heroHeight = "100vh",
  gridGap = "10vw",
  gridMargin = "15rem",
  offsetLerp = 0.22,
  scrollLerp = 0.17,
  blurMaxDistance = 400,
  distortMaxDistance = 200,
  enableFilters = true,
  disableOnFirefox = true,
  className = "",
}) {
  const uid = `stp-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const gridStyle = {
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, calc(390px + 3rem)))",
    gap: gridGap,
    margin: `${gridMargin} auto`,
  };

  const renderGrid = (from, to) => (
    <div
      className="grid justify-center w-full max-w-[1100px] px-6"
      style={gridStyle}
    >
      {gridItems.slice(from, to).map((item, i) => (
        <div
          key={item.number}
          className={`p-6 ${i % 2 === 1 ? "md:mt-[35vh] md:text-right" : ""}`}
        >
          <span
            className="block text-right text-5xl leading-none md:text-[4.75rem]"
            style={{ fontFamily: serifFont }}
          >
            {item.number}
          </span>
          <img
            src={item.img}
            alt=""
            className="mt-4 mb-7 block w-full max-w-full"
          />
          <h3
            className="mb-11 text-xl font-normal uppercase tracking-wide"
            style={{ fontFamily: serifFont }}
          >
            {item.title}
          </h3>
          <p
            className="text-base leading-relaxed"
            style={{ color: mutedColor, fontFamily: sansFont }}
          >
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );

  const curveProps = {
    uid,
    serifFont,
    offsetLerp,
    scrollLerp,
    blurMaxDistance,
    distortMaxDistance,
    enableFilters,
    disableOnFirefox,
  };

  const renderCurve = (i) =>
    curves[i] ? (
      <CurvedText key={i} curve={curves[i]} index={i} {...curveProps} />
    ) : null;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `#${uid} a{color:${linkColor};text-decoration:none;transition:color .3s}#${uid} a:hover{color:${linkHoverColor}}`,
        }}
      />
      <div id={uid} className="relative flex w-full flex-col items-center">
        <div className="pointer-events-none absolute top-0 left-0 z-50 hidden w-full md:grid md:h-screen md:grid-cols-[30%_40%_30%] md:content-between md:px-10 md:py-9">
          <h2
            className="m-0 text-base font-normal uppercase tracking-wide"
            style={{ fontFamily: serifFont }}
          >
            {heading}
          </h2>
          <div className="flex items-baseline justify-self-center uppercase">
            {counter.map((c) => (
              <span key={c.label} className="mx-1">
                <span className="text-[200%]">{c.value}</span>
                <span className="ml-1 mr-4 text-sm">{c.label}</span>
              </span>
            ))}
          </div>
          <nav className="pointer-events-auto justify-self-end uppercase">
            {navLinks.map((l) => (
              <span key={l} className="mr-4 last:mr-0">
                <a href="#">{l}</a>
              </span>
            ))}
          </nav>
          <div className="col-span-3 row-start-3 flex">
            <h1 className="m-0 text-base font-normal uppercase tracking-wide">
              {eyebrow}
            </h1>
          </div>
        </div>

        <header
          className="pointer-events-none flex flex-col items-center justify-center"
          style={{ minHeight: heroHeight }}
        >
          <h1
            className="m-0 font-normal leading-none"
            style={{ fontSize: "12vw", fontFamily: serifFont }}
          >
            {introTitle}
          </h1>
          <p
            className="relative mt-[8vh] mb-0 uppercase tracking-widest"
            style={{ fontFamily: sansFont }}
          >
            {introHint}
          </p>
        </header>

        {renderGrid(0, 2)}
        {renderCurve(0)}
        {renderCurve(1)}
        {renderGrid(2, 4)}

        {bigImages[0] ? (
          <img
            src={bigImages[0]}
            alt=""
            className="my-[25vh] block w-full max-w-[1000px] px-6"
          />
        ) : null}

        {renderCurve(2)}
        {renderCurve(3)}
        {renderGrid(4, 6)}
        {renderCurve(4)}
        {renderCurve(5)}
        {renderCurve(6)}

        {bigImages[1] ? (
          <img
            src={bigImages[1]}
            alt=""
            className="my-[25vh] block w-full max-w-[1000px] px-6"
          />
        ) : null}

        <div className="relative flex w-full flex-col items-center">
          {renderCurve(7)}
          {renderGrid(6, 8)}
        </div>

        <footer className="relative z-50 px-[5vw] py-12 text-center uppercase tracking-wide">
          {navLinks.map((l) => (
            <span key={l} className="mr-4 last:mr-0">
              <a href="#">{l}</a>
            </span>
          ))}
        </footer>
      </div>
    </div>
  );
}
