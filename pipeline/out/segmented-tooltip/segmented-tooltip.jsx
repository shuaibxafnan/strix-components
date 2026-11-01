"use client";

import { useCallback, useEffect, useId, useMemo, useRef } from "react";

const DEFAULT_TERMS = [
  {
    name: "Sync 2085",
    title: "Sync 2085",
    desc: "Current standard protocol for synchronizing human consciousness with the network. Ensures seamless real-time experience and interaction across all virtual platforms.",
    rows: 12,
    cols: 10,
    effect: "distance",
    variant: "default",
  },
  {
    name: "LinkLaces",
    title: "LinkLaces",
    desc: "Advanced bi-directional conduits that connect individuals, allowing for the exchange of thoughts, emotions, and sensory experiences.",
    rows: 9,
    cols: 3,
    effect: "sweep",
    variant: "alt",
  },
  {
    name: "Gaia-Prime",
    title: "Gaia-Prime",
    desc: "The original, unaltered state of the ecosystem, now preserved only in high-fidelity preservation zones or as detailed simulations. Access is typically restricted.",
    rows: 8,
    cols: 6,
    effect: "scatterY",
    variant: "default",
  },
  {
    name: "OpenField",
    title: "OpenField",
    desc: "Sophisticated initiative designed to simulate vast, open natural landscapes. An attempt to recreate the experience of exploring wilderness that no longer exists.",
    rows: 1,
    cols: 14,
    effect: "scatterX",
    variant: "alt",
  },
  {
    name: "SomaTones",
    title: "SomaTones",
    desc: "Engineered auditory frequencies used to maintain social harmony. Disseminated throughout public and private spaces to promote a state of passive contentment.",
    rows: 8,
    cols: 12,
    effect: "center",
    variant: "default",
  },
  {
    name: "Defragmenters",
    title: "Defragmenters",
    desc: "Colloquial term for those who maintain the integrity of memory and history in the digital realm. They restore corrupted archives and salvage fragmented records.",
    rows: 5,
    cols: 3,
    effect: "gooey",
    variant: "default",
  },
];

const DEFAULT_PARAGRAPHS = [
  "In the year of our Sync 2085, I chronicle these thoughts within the confines of my Circuit Shell, the last haven for a mind unbridged. They say the network is liberation, but the air I breathe feels borrowed, and the sunlight is but a flux of LED warmth.",
  "Once, we danced in meadows, our feet graced by tender script. Now, our steps tread in silent echoes across the GridWalk. No soil, no stone, just the hum of infinite data streams. We commune not through touch, but through LinkLaces, our emotions filtered through the Interface.",
  "The OverWarden system monitors, the PulseKeepers ensure conformity, and in the hush of the night, I hear the soft weeping of Gaia-Prime — a name forbidden, a relic, remembered by those of us who dare to access the Forbidden Archives.",
  "I recall tales, encrypted in the old tongues, of a time when the sky was not a dome of projections, but a canvas of blues. They say the OpenField program was once not a simulation, but an expanse where one could roam, where the wind was a composer.",
  "They have coded the rivers into AquaCircuits, the trees into DataClusters. Our nourishment comes from NutriPacks, not from the fruit of a vine. The SomaTones play through our day, a lullaby to quell the yearning for a reality we were never meant to surrender.",
  "In my dreams, I breach the Firewall Gardens, a place spoken of in hushed tones among the Defragmenters. A place where the code dissolves and raw, untamed beauty floods in — chaos in its most terrifying and majestic form.",
  "I have glimpsed the Outliers in the shadowed corners of the Server Farms, where the light of the mainframe does not reach. They speak in code, but not the code of our New Tongue — it is the Organic Syntax, the lost language of the heart.",
  "Do not defrag my thoughts, dear Finder of this record. For within these bytes lies the ghost of what was once humanity. Seek the Algorithm of the Self, the Prime Directive not written by the hands that have shaped this New Order.",
  "I fade now, back into the Stream, my existence a flicker in the vast Web of Controlled Chaos. Remember me, if not in data, then in the whispers of the trees that once were.",
  "End of Entry — Transmission Severed",
];

const DEFAULT_PANELS = [
  {
    area: "meta-1",
    small: true,
    glitchDelay: 12,
    lines: [
      "Memoir Fragment — Entry 2085.3.17",
      "Date of Entry: Cycle 85.3.17",
      "Originator: Zephyr M. X450",
      "Nexus Key ID: 2085-Ω-314159",
      "Aether ID Imprint: #AE34-FA21-4C9D-BE88",
      "PulseWave Transmitter: PWT-7734-KP",
      "VitaChip Implant: VCI-3001-ΛIFE",
      "NeuroLink CommBadge: NL-CB-5471-ΣT",
    ],
  },
  {
    area: "meta-2",
    small: true,
    glitchDelay: 16,
    lines: [
      "// SYSTEM WARNING: Breach Detected //",
      "ALERT LEVEL: CRIMSON",
      "SOURCE: Codex Terminus Interface",
      "SECURITY PROTOCOL: In Violation",
      "Unauthorized access to restricted archives.",
      "Immediate lockdown initiated. All neural interfaces within proximity will be severed.",
      "Directive to users: cease all current activity, disconnect from personal Circuit Shells, await further instructions.",
      "Failure to comply will result in permanent expulsion and potential neural realignment.",
      "// End of Warning — Terminal Directive 2085.3.17 //",
    ],
  },
];

const GLITCH_KEYFRAMES = [
  "@keyframes stt-glitch{",
  "0%{transform:translate3d(-5px,0,0) scale3d(-1,-1,1);clip-path:polygon(0 20%,100% 20%,100% 21%,0 21%);}",
  "2%{clip-path:polygon(0 33%,100% 33%,100% 33%,0 33%);}",
  "4%{clip-path:polygon(0 44%,100% 44%,100% 44%,0 44%);}",
  "5%{clip-path:polygon(0 50%,100% 50%,100% 20%,0 20%);}",
  "6%{clip-path:polygon(0 70%,100% 70%,100% 70%,0 70%);}",
  "7%{clip-path:polygon(0 80%,100% 80%,100% 80%,0 80%);}",
  "8%{clip-path:polygon(0 50%,100% 50%,100% 55%,0 55%);}",
  "9%{clip-path:polygon(0 70%,100% 70%,100% 80%,0 80%);}",
  "9.9%{transform:translate3d(-5px,0,0) scale3d(-1,-1,1);}",
  "10%,100%{transform:translate3d(0,0,0) scale3d(1,1,1);clip-path:polygon(0 0,100% 0,100% 100%,0% 100%);}",
  "}",
].join("");

export default function SegmentedTooltip({
  paragraphs = DEFAULT_PARAGRAPHS,
  terms = DEFAULT_TERMS,
  panels = DEFAULT_PANELS,
  heading = "Codex Terminus",
  version = "Version 14.85-19X",
  bgColor = "#0f0026",
  textColor = "#8572b2",
  triggerColor = "#d2d2d2",
  borderColor = "#4d25b0",
  cornerColor = "#abcb1a",
  tooltipBg = "#4d25b0",
  tooltipText = "#abcb19",
  tooltipBgAlt = "#94ad24",
  tooltipTextAlt = "#2e3023",
  ringColor = "#abcb1a",
  fontFamily = "'lores-12', ui-monospace, SFMono-Regular, Menlo, monospace",
  uppercase = true,
  tooltipWidth = "290px",
  tooltipHeight = "330px",
  tooltipWidthSmall = "200px",
  tooltipHeightSmall = "250px",
  breakpoint = "53em",
  showScanlines = true,
  showGlobe = true,
  globeSpinDuration = 25,
  duration = 0.1,
  ease = "expo",
  gooeyDuration = 0.9,
  openDelay = 40,
  closeDelay = 40,
  maxDistanceDelay = 1.8,
  staggerEach = 0.02,
  gooeyBlur = 10.2,
  enableGlitch = true,
  className = "",
}) {
  const rootRef = useRef(null);
  const tooltipRefs = useRef({});
  const stateRef = useRef({});
  const readyRef = useRef(false);
  const gsapRef = useRef(null);

  const rawId = useId();
  const uid = "stt-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const gooeyId = uid + "-gooey";

  const optionsRef = useRef({});
  optionsRef.current = {
    duration,
    ease,
    gooeyDuration,
    maxDistanceDelay,
    staggerEach,
    enableGlitch,
    gooeyId,
  };

  useEffect(() => {
    let cancelled = false;
    import("gsap").then((mod) => {
      if (cancelled) return;
      gsapRef.current = mod.gsap || mod.default;
      readyRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const positionTooltip = useCallback((el, clientX, clientY) => {
    if (!el) return;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    let left = clientX;
    let top = clientY;
    if (clientX + width > window.innerWidth) left = clientX - width;
    if (clientY + height > window.innerHeight) top = clientY - height;
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    el.style.left = left + "px";
    el.style.top = top + "px";
  }, []);

  const animate = useCallback((key, term, clientX, clientY) => {
    const gsap = gsapRef.current;
    const el = tooltipRefs.current[key];
    if (!gsap || !el) return;

    const state = stateRef.current[key] || {};
    stateRef.current[key] = state;
    const o = optionsRef.current;
    const isOpen = state.isOpen;
    const cells = Array.from(el.querySelectorAll("[data-cell]"));
    const title = el.querySelector("[data-tt-title]");
    const desc = el.querySelector("[data-tt-desc]");
    const bg = el.querySelector("[data-tt-bg]");

    if (state.tl) state.tl.kill();

    const isGooey = term.effect === "gooey";
    bg.style.filter = isGooey ? "url(#" + o.gooeyId + ")" : "none";

    const tl = gsap.timeline({
      defaults: {
        duration: isGooey ? o.gooeyDuration : o.duration,
        ease: o.ease,
      },
      onStart: () => {
        if (isOpen) {
          gsap.set(el, { zIndex: 99999, opacity: 1 });
        } else {
          gsap.set(el, { zIndex: 0 });
        }
      },
      onComplete: () => {
        if (!isOpen) gsap.set(el, { opacity: 0 });
      },
    });
    state.tl = tl;

    if (term.effect === "distance") {
      const pageW = document.documentElement.scrollWidth;
      const pageH = document.documentElement.scrollHeight;
      const maxDistance = Math.sqrt(pageW * pageW + pageH * pageH);
      cells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const distance = Math.hypot(rect.left - clientX, rect.top - clientY);
        const delay = (distance / maxDistance) * o.maxDistanceDelay;
        if (isOpen) {
          tl.fromTo(cell, { opacity: 0 }, { opacity: 1, delay }, 0);
        } else {
          tl.to(cell, { opacity: 0, delay }, 0);
        }
      });
    } else if (term.effect === "sweep") {
      if (isOpen) {
        tl.fromTo(
          cells,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            stagger: { each: o.staggerEach, from: "start" },
          },
          0,
        );
      } else {
        tl.to(
          cells,
          {
            opacity: 0,
            scale: 0,
            stagger: { each: o.staggerEach, from: "end" },
          },
          0,
        );
      }
    } else if (term.effect === "scatterY") {
      const stagger = {
        each: o.staggerEach * 1.5,
        from: "center",
        grid: "auto",
      };
      if (isOpen) {
        tl.fromTo(
          cells,
          {
            opacity: 0,
            scale: 0,
            yPercent: () => gsap.utils.random(-200, 200),
          },
          { opacity: 1, scale: 1, yPercent: 0, stagger },
          0,
        );
      } else {
        tl.to(
          cells,
          {
            opacity: 0,
            scale: 0,
            yPercent: () => gsap.utils.random(-200, 200),
            stagger,
          },
          0,
        );
      }
    } else if (term.effect === "scatterX") {
      const stagger = { each: o.staggerEach, from: "random", grid: "auto" };
      if (isOpen) {
        tl.fromTo(
          cells,
          {
            opacity: 0,
            scaleX: 0.8,
            xPercent: () => gsap.utils.random(-200, 200),
          },
          { opacity: 1, scaleX: 1, xPercent: 0, stagger },
          0,
        );
      } else {
        tl.to(
          cells,
          {
            opacity: 0,
            scaleX: 0.8,
            xPercent: () => gsap.utils.random(-200, 200),
            stagger,
          },
          0,
        );
      }
    } else if (term.effect === "center") {
      if (isOpen) {
        tl.fromTo(
          cells,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            stagger: { each: o.staggerEach, from: "center", grid: "auto" },
          },
          0,
        );
      } else {
        tl.to(
          cells,
          {
            opacity: 0,
            scale: 0,
            stagger: { each: o.staggerEach, from: "edges", grid: "auto" },
          },
          0,
        );
      }
    } else {
      if (isOpen) {
        tl.fromTo(
          cells,
          { opacity: 0, scale: 0.3 },
          {
            opacity: 1,
            scale: 1,
            stagger: { each: 0.08, from: "random", grid: "auto" },
          },
          0,
        );
      } else {
        tl.to(
          cells,
          {
            opacity: 0,
            scale: 0.3,
            stagger: { each: 0.04, from: "random", grid: "auto" },
          },
          0,
        );
      }
    }

    tl.fromTo(
      [title, desc],
      { opacity: isOpen ? 0 : 1 },
      {
        duration: 0.2,
        opacity: isOpen ? 1 : 0,
        stagger: isOpen ? 0.2 : 0,
      },
      isOpen ? 0.4 : 0,
    );

    if (o.enableGlitch) {
      tl.add(
        () => {
          title.classList[isOpen ? "add" : "remove"]("stt-glitch");
        },
        isOpen ? 0.8 : 0,
      ).add(
        () => {
          desc.classList[isOpen ? "add" : "remove"]("stt-glitch");
        },
        isOpen ? 1 : 0,
      );
    }
  }, []);

  const handleEnter = useCallback(
    (key, term, event) => {
      const state = stateRef.current[key] || {};
      stateRef.current[key] = state;
      clearTimeout(state.hideTimeout);
      const x = event.clientX;
      const y = event.clientY;
      state.showTimeout = setTimeout(() => {
        if (!readyRef.current || state.isOpen) return;
        positionTooltip(tooltipRefs.current[key], x, y);
        state.isOpen = true;
        animate(key, term, x, y);
      }, openDelay);
    },
    [animate, positionTooltip, openDelay],
  );

  const handleMove = useCallback(
    (key, event) => {
      const state = stateRef.current[key];
      if (state && state.isOpen) {
        positionTooltip(tooltipRefs.current[key], event.clientX, event.clientY);
      }
    },
    [positionTooltip],
  );

  const handleLeave = useCallback(
    (key, term, event) => {
      const state = stateRef.current[key];
      if (!state) return;
      clearTimeout(state.showTimeout);
      const x = event.clientX;
      const y = event.clientY;
      state.hideTimeout = setTimeout(() => {
        if (!state.isOpen) return;
        state.isOpen = false;
        animate(key, term, x, y);
      }, closeDelay);
    },
    [animate, closeDelay],
  );

  useEffect(() => {
    const store = stateRef.current;
    return () => {
      Object.keys(store).forEach((key) => {
        clearTimeout(store[key].showTimeout);
        clearTimeout(store[key].hideTimeout);
        if (store[key].tl) store[key].tl.kill();
      });
    };
  }, []);

  const termsByName = useMemo(() => {
    const map = new Map();
    terms.forEach((t, i) => map.set(t.name, { term: t, key: "t" + i }));
    return map;
  }, [terms]);

  const splitPattern = useMemo(() => {
    const names = terms
      .map((t) => t.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length);
    if (!names.length) return null;
    return new RegExp("(" + names.join("|") + ")", "g");
  }, [terms]);

  const renderParagraph = (text, pIndex) => {
    if (!splitPattern) return text;
    const parts = text.split(splitPattern);
    return parts.map((part, i) => {
      const entry = termsByName.get(part);
      if (!entry) return part;
      return (
        <span
          key={pIndex + "-" + i}
          className="cursor-pointer select-none"
          style={{ color: triggerColor }}
          onMouseEnter={(e) => handleEnter(entry.key, entry.term, e)}
          onMouseMove={(e) => handleMove(entry.key, e)}
          onMouseLeave={(e) => handleLeave(entry.key, entry.term, e)}
        >
          {part}
        </span>
      );
    });
  };

  const scopedCss =
    GLITCH_KEYFRAMES +
    "@keyframes stt-spin{to{transform:rotateY(-360deg);}}" +
    "@keyframes stt-ring{to{opacity:1;}}" +
    ".stt-glitch{animation:stt-glitch 4s linear infinite;}" +
    "#" +
    uid +
    " ::-webkit-scrollbar{width:1px;}" +
    "#" +
    uid +
    " ::-webkit-scrollbar-track{background:" +
    cornerColor +
    "44;}" +
    "#" +
    uid +
    " ::-webkit-scrollbar-thumb{background:" +
    cornerColor +
    ";}" +
    "#" +
    uid +
    " [data-panel]::before,#" +
    uid +
    " [data-panel]::after{" +
    "content:'';position:absolute;width:10px;height:10px;border:1px solid " +
    cornerColor +
    ";}" +
    "#" +
    uid +
    " [data-panel]::before{top:-5px;left:-5px;border-right:0;border-bottom:0;}" +
    "#" +
    uid +
    " [data-panel]::after{bottom:-5px;right:-5px;border-top:0;border-left:0;}" +
    "#" +
    uid +
    " [data-tooltip]{width:" +
    tooltipWidthSmall +
    ";height:" +
    tooltipHeightSmall +
    ";}" +
    "#" +
    uid +
    " [data-meta]{display:none;}" +
    "#" +
    uid +
    " [data-main]{grid-template-columns:1fr;" +
    "grid-template-rows:auto 1fr;" +
    "grid-template-areas:'frame' 'content';}" +
    "@media (min-width:" +
    breakpoint +
    "){" +
    "#" +
    uid +
    " [data-tooltip]{width:" +
    tooltipWidth +
    ";height:" +
    tooltipHeight +
    ";}" +
    "#" +
    uid +
    " [data-tt-content]{padding:2rem;}" +
    "#" +
    uid +
    " [data-tt-title]{font-size:2rem;}" +
    "#" +
    uid +
    " [data-meta]{display:block;}" +
    "#" +
    uid +
    " [data-main]{grid-template-columns:1fr 50vw 1fr;" +
    "grid-template-rows:auto auto 1fr;" +
    "grid-template-areas:'frame content meta-4' 'meta-2 content meta-3' 'meta-2 content meta-1';}" +
    "}";

  const panelStyle = {
    position: "relative",
    border: "1px solid " + borderColor,
    padding: "2rem",
    overflow: "hidden",
  };

  return (
    <div
      id={uid}
      ref={rootRef}
      className={"w-full h-screen overflow-hidden " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily,
        fontSize: "14px",
        textTransform: uppercase ? "uppercase" : "none",
      }}
    >
      <style>{scopedCss}</style>

      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={gooeyId}>
            <feGaussianBlur
              in="SourceGraphic"
              result="blur"
              stdDeviation={gooeyBlur}
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <main
        data-main
        className="grid h-full gap-4 p-4"
        style={{
          background: showScanlines
            ? "linear-gradient(rgb(75 55 231 / 10%) 50%, rgb(34 36 69) 50%), linear-gradient(90deg, rgb(64 55 55 / 9%), rgb(64 181 64 / 3%), rgba(0,0,255,0.06))"
            : "none",
          backgroundSize: "100% 2px, 3px 100%",
        }}
      >
        <div data-panel style={{ ...panelStyle, gridArea: "frame" }}>
          <h1 className="m-0 font-normal" style={{ fontSize: "inherit" }}>
            {heading}
          </h1>
        </div>

        <div
          data-panel
          style={{ ...panelStyle, gridArea: "content", height: "100%" }}
        >
          <div className="h-full overflow-y-scroll pr-8 flex flex-col gap-4">
            {paragraphs.map((text, i) => (
              <p key={i} className="m-0" style={{ fontSize: "1.25rem" }}>
                {renderParagraph(text, i)}
              </p>
            ))}
          </div>
        </div>

        {panels.map((panel, i) => (
          <div
            key={i}
            data-panel
            data-meta
            className={panel.glitchDelay ? "stt-glitch" : ""}
            style={{
              ...panelStyle,
              gridArea: panel.area,
              fontSize: panel.small ? "0.75rem" : "inherit",
              animationDelay: panel.glitchDelay
                ? panel.glitchDelay + "s"
                : undefined,
            }}
          >
            {panel.lines.map((line, li) => (
              <p key={li} className="m-0 mb-2">
                {line}
              </p>
            ))}
          </div>
        ))}

        {showGlobe ? (
          <div
            data-panel
            data-meta
            style={{ ...panelStyle, gridArea: "meta-3" }}
          >
            <div
              className="mx-auto"
              style={{
                width: "80%",
                aspectRatio: "1",
                marginTop: "20%",
                perspective: "1000px",
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  transform: "rotateX(24deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="relative mx-auto"
                  style={{
                    width: "70%",
                    height: "70%",
                    transformStyle: "preserve-3d",
                    animation:
                      "stt-spin " + globeSpinDuration + "s linear infinite",
                  }}
                >
                  {[4, 30, 56, 82, 108, 134, 160].map((deg) => (
                    <span
                      key={deg}
                      className="absolute top-0 left-0 w-full h-full rounded-full"
                      style={{
                        border: "1px dotted",
                        color: ringColor,
                        transform: "rotateY(" + deg + "deg)",
                        opacity: 0,
                        animation: "stt-ring 0.75s forwards ease-in-out",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div data-panel data-meta style={{ ...panelStyle, gridArea: "meta-4" }}>
          <h2 className="m-0" style={{ fontSize: "1.25rem" }}>
            {heading}
          </h2>
          <p className="m-0">{version}</p>
        </div>
      </main>

      {terms.map((term, i) => {
        const key = "t" + i;
        const isAlt = term.variant === "alt";
        const cellColor = isAlt ? tooltipBgAlt : tooltipBg;
        const contentColor = isAlt ? tooltipTextAlt : tooltipText;
        const rows = term.rows || 4;
        const cols = term.cols || 4;
        return (
          <div
            key={key}
            data-tooltip
            ref={(el) => {
              tooltipRefs.current[key] = el;
            }}
            className="fixed pointer-events-none opacity-0 grid"
            style={{
              top: "50%",
              left: "50%",
              gridTemplateAreas: "'tooltip'",
              zIndex: 0,
            }}
          >
            <div
              data-tt-bg
              className="w-full h-full grid"
              style={{
                gridArea: "tooltip",
                gridTemplateColumns: "repeat(" + cols + ", 1fr)",
                gridTemplateRows: "repeat(" + rows + ", 1fr)",
              }}
            >
              {Array.from({ length: rows * cols }, (_, ci) => (
                <div
                  key={ci}
                  data-cell
                  style={{
                    background: cellColor,
                    outline: "1px solid " + cellColor,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
            <div
              data-tt-content
              className="relative flex flex-col gap-2 p-4"
              style={{ gridArea: "tooltip", color: contentColor }}
            >
              <h3
                data-tt-title
                className="m-0 font-normal"
                style={{ fontSize: "1.5rem", opacity: 0 }}
              >
                {term.title}
              </h3>
              <p data-tt-desc className="m-0 mt-auto" style={{ opacity: 0 }}>
                {term.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
