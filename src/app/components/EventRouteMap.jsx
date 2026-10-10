"use client";

import { useEffect, useRef, useId, useState } from "react";

// ─── EventRouteMap ───────────────────────────────────────────────────────────
//
// Design direction: "field wayfinding" — a civic transit/survey-map aesthetic.
// Warm paper panel, deep ink navy text, a single signal-red route line against
// the map photo. Serif display for the event title, a civic/government-style
// sans for body copy, and mono for schedule times and meta labels — like a
// printed transit notice, not a generic dark dashboard.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// paperColor         string   #F5F1E6    Info panel background (paper)
// inkColor           string   #14243A    Primary text / ink color
// routeColor         string   #D6402B    Route line, travel dot, and accent color
// mutedColor         string   #6B7280    Secondary/meta text color
// fontDisplay        string   "Fraunces"     Serif display typeface for the event title
// fontBody           string   "Public Sans"  Body copy typeface
// fontMono           string   "JetBrains Mono"   Mono typeface for meta labels and schedule times
// mapImageUrl        string   "https://assets.codepen.io/721952/chs_map.jpg"   Map image href
// mapViewBox         string   "0 0 1500 1500"   SVG viewBox for the map
// pathData           string   [see default in code]   Route path `d` the dot travels along
// dotStartX          number   741.6      Starting x coordinate of the route dot
// dotStartY          number   937        Starting y coordinate of the route dot
// eyebrow            string   "◍ MOBILITY MONTH"   Small mono label above the title
// title              string   "Bike to Work Day"   Event title
// dateTimeText       string   "May 15, 2026 @ 9:00AM — 11:00AM Eastern Time (US & Canada)"   Date/time line
// locationText       string   "White Point Garden: 2 Murray Blvd Charleston, SC 29401"   Location line
// paragraphs         array    [3 strings]   Body paragraphs rendered under the meta lines
// scheduleTitle      string   "SCHEDULE"     Heading above the schedule list
// schedule           array    [5 {time,label}]   Timeline entries rendered as a vertical schedule
// expandLabel        string   "EXPAND MAP"   Label on the expand-map button
// pinStart           string   "0 0"      ScrollTrigger start position for pinning the map
// pinEnd             string   "100% 100%"   ScrollTrigger end position for pinning the map
// scrubAmount        number   1          ScrollTrigger scrub smoothing value
// followDuration     number   1          Duration (s) of the camera quickTo follow tween
// followEase         string   "expo"     Ease of the camera quickTo follow tween
// initialPovX        number   750        Initial camera pan-group x offset
// initialPovY        number   750        Initial camera pan-group y offset
// initialPovScale    number   2          Initial camera pan-group scale
// pulseScale         number   4          Scale reached by the intro zoom pulse
// pulseDuration      number   0.15       Duration (s) of the intro zoom pulse
// pulseEase          string   "sine.inOut"   Ease of the intro zoom pulse
// pulseRepeatDelay   number   0.2        Delay (s) between the pulse's yoyo repeat
// expandDuration     number   0.6        Duration (s) of the map expand/collapse width tween (approximate, driven by power eases below)
// expandEase         string   "power3.inOut"   Ease used when expanding the map
// collapseEase       string   "expo.inOut"   Ease used when collapsing the map
// revealEase         string   "power2.inOut"   Ease used when the expand button fast-forwards the route reveal
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_PATH =
  "m741.6 937 18-52 2-28 1.7-25-25.7 3.7-1-24-41 8.3-36.7 4.4-51.3 5.3 10.3 19.7 2.7 26.3 98.7-13.2-3-35";

const DEFAULT_PARAGRAPHS = [
  "In honor of National Bike to Work Day, we are excited to partner with the City of Charleston to host a proclamation honoring May 2026 as Mobility Month. Since 2014, Charleston Moves has hosted this annual celebration to rally the community around bicycle, pedestrian and public transit advancements across Charleston County — inviting the public to experience new infrastructure, learn about forthcoming transportation improvements, and help shape accessible roads, bridges and pathways.",
  "For this year's Bike to Work Day event, we will begin at White Point Garden (meet up at the gazebo) with Mayor Cogswell and City leadership for a bike ride to City Hall, followed by a formal Mobility Month proclamation and community gathering in Washington Park. There will be complimentary iced coffee and pastries, courtesy of Queen Street Grocery. The public is invited to join for the full event, or any part of it. Everyone participating in the ride will be required to sign our waiver.",
  "As your safe streets advocates, Charleston Moves is on the frontlines pushing for dedicated bike/ped infrastructure, comfortable and reliable public transit experiences, and policies to advance a people-first approach to planning, land use and growth. Donations to Charleston Moves serve to bolster these ongoing efforts within the City of Charleston, and across Charleston County as a whole.",
];

const DEFAULT_SCHEDULE = [
  {
    time: "9-9:30 am",
    label: "Gather at White Point Garden (meet up at the gazebo)",
  },
  { time: "9:30 am", label: "Ride departs White Point Garden" },
  { time: "9:50 am", label: "Ride concludes at Washington Square" },
  {
    time: "10 am",
    label:
      "Mobility Month Proclamation by Mayor Cogswell in Washington Square (behind City Hall)",
  },
  {
    time: "10-11 am",
    label:
      "Social gathering with photos and complimentary iced coffee and pastries",
  },
];

export default function EventRouteMap({
  inkColor = "#14243A",
  routeColor = "#D6402B",
  mutedColor = "#6B7280",
  fontDisplay = "Fraunces",
  fontBody = "Public Sans",
  fontMono = "JetBrains Mono",
  mapImageUrl = "https://assets.codepen.io/721952/chs_map.jpg",
  mapViewBox = "0 0 1500 1500",
  pathData = DEFAULT_PATH,
  dotStartX = 741.6,
  dotStartY = 937,
  eyebrow = "◍ MOBILITY MONTH",
  title = "Bike to Work Day",
  dateTimeText = "May 15, 2026 @ 9:00AM — 11:00AM Eastern Time (US & Canada)",
  locationText = "White Point Garden: 2 Murray Blvd Charleston, SC 29401",
  paragraphs = DEFAULT_PARAGRAPHS,
  scheduleTitle = "SCHEDULE",
  schedule = DEFAULT_SCHEDULE,
  expandLabel = "EXPAND MAP",
  pinStart = "0 0",
  pinEnd = "100% 100%",
  scrubAmount = 1,
  followDuration = 1,
  followEase = "expo",
  initialPovX = 750,
  initialPovY = 750,
  initialPovScale = 2,
  pulseScale = 4,
  pulseDuration = 0.15,
  pulseEase = "sine.inOut",
  pulseRepeatDelay = 0.2,
  expandEase = "power3.inOut",
  collapseEase = "expo.inOut",
  revealEase = "power2.inOut",
}) {
  const uid = useId().replace(/:/g, "");
  const [expanded, setExpanded] = useState(false);

  const sectionRef = useRef(null);
  const mapRef = useRef(null);
  const povRef = useRef(null);
  const povInnerRef = useRef(null);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const closeBtnRef = useRef(null);
  const timelineRef = useRef(null);
  const ctxRef = useRef(null);

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
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/MotionPathPlugin.min.js",
      ),
    ])
      .then(() => {
        const { gsap } = window;
        if (!gsap || !sectionRef.current) return;

        gsap.config({ trialWarn: false });
        gsap.registerPlugin(window.ScrollTrigger, window.MotionPathPlugin);

        const ctx = gsap.context(() => {
          const pathEl = pathRef.current;
          const dotEl = dotRef.current;
          const povInnerEl = povInnerRef.current;
          const povEl = povRef.current;

          const pathLength = pathEl.getTotalLength();
          gsap.set(pathEl, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          });

          const xTo = gsap.quickTo(povInnerEl, "x", {
            duration: followDuration,
            ease: followEase,
          });
          const yTo = gsap.quickTo(povInnerEl, "y", {
            duration: followDuration,
            ease: followEase,
          });

          const tl = gsap
            .timeline({
              scrollTrigger: {
                trigger: sectionRef.current,
                start: pinStart,
                end: pinEnd,
                pin: mapRef.current,
                scrub: scrubAmount,
              },
              onUpdate: () => {
                xTo(-gsap.getProperty(dotEl, "x"));
                yTo(-gsap.getProperty(dotEl, "y"));
              },
            })
            .to(
              dotEl,
              { motionPath: pathEl, immediateRender: true, ease: "none" },
              0,
            )
            .fromTo(
              pathEl,
              { strokeDashoffset: pathLength },
              { strokeDashoffset: 0, ease: "none" },
              0,
            )
            .fromTo(
              povEl,
              { x: initialPovX, y: initialPovY, scale: initialPovScale },
              {
                scale: pulseScale,
                ease: pulseEase,
                duration: pulseDuration,
                yoyo: true,
                repeat: 1,
                repeatDelay: pulseRepeatDelay,
              },
              0,
            );

          gsap.set(povInnerEl, {
            x: -gsap.getProperty(dotEl, "x"),
            y: -gsap.getProperty(dotEl, "y"),
          });

          timelineRef.current = tl;

          const handleResize = () => {
            gsap.set(closeBtnRef.current, { autoAlpha: 0 });
            gsap.set("body", { overflow: "scroll" });
            window.ScrollTrigger.refresh();
          };
          window.addEventListener("resize", handleResize);

          return () => window.removeEventListener("resize", handleResize);
        }, sectionRef);

        ctxRef.current = ctx;
      })
      .catch((e) =>
        console.error("[EventRouteMap] GSAP load failed:", e.message),
      );

    return () => {
      if (ctxRef.current) ctxRef.current.revert();
    };
  }, [
    pathData,
    pinStart,
    pinEnd,
    scrubAmount,
    followDuration,
    followEase,
    initialPovX,
    initialPovY,
    initialPovScale,
    pulseScale,
    pulseDuration,
    pulseEase,
    pulseRepeatDelay,
  ]);

  const handleExpand = () => {
    const { gsap } = window;
    if (!gsap || !timelineRef.current) return;
    setExpanded(true);
    gsap
      .timeline()
      .set("body", { overflow: "hidden" })
      .to(mapRef.current, { width: "100%", maxWidth: "100%", ease: expandEase })
      .to(timelineRef.current, { progress: 1, ease: revealEase }, 0)
      .to(closeBtnRef.current, { autoAlpha: 1 }, 0.3);
  };

  const handleClose = () => {
    const { gsap } = window;
    if (!gsap) return;
    gsap
      .timeline({ onComplete: () => setExpanded(false) })
      .to(closeBtnRef.current, { duration: 0.2, autoAlpha: 0 })
      .to(
        mapRef.current,
        { width: "50%", maxWidth: "50%", ease: collapseEase },
        0,
      )
      .set("body", { overflow: "scroll" });
  };

  return (
    <div style={{ fontFamily: "'" + fontBody + "', sans-serif" }}>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Public+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');" +
            ".erm-" +
            uid +
            "-title{font-family:'" +
            fontDisplay +
            "',serif;}" +
            ".erm-" +
            uid +
            "-mono{font-family:'" +
            fontMono +
            "',monospace;}" +
            ".erm-" +
            uid +
            "-dot{animation:erm-" +
            uid +
            "-blink 1.6s ease-in-out infinite;}" +
            "@keyframes erm-" +
            uid +
            "-blink{0%,100%{opacity:1;}50%{opacity:0.3;}}" +
            "@media (prefers-reduced-motion: reduce){.erm-" +
            uid +
            "-dot{animation:none;}}",
        }}
      />

      <section
        ref={sectionRef}
        className="relative left-0 top-0 w-full min-h-[150vh]"
      >
        <svg
          ref={mapRef}
          className="absolute z-[999] top-0 left-0 w-full md:w-1/2 h-[60vh] md:h-screen overflow-hidden"
          viewBox={mapViewBox}
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <g ref={povRef}>
            <g
              ref={povInnerRef}
              stroke={routeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <image href={mapImageUrl} width="1500" height="1500" />
              <path ref={pathRef} strokeWidth="4" fill="none" d={pathData} />
              <circle
                r="4"
                fill="#fff"
                strokeWidth="2.4"
                cx={dotStartX}
                cy={dotStartY}
              />
              <circle ref={dotRef} r="4" fill="#fff" strokeWidth="2.4" />
            </g>
          </g>
        </svg>

        <div
          className="relative w-full md:w-2/5 md:left-1/2 p-[5%] text-[1.05rem] leading-relaxed mt-[60vh] md:mt-0"
          style={{ color: inkColor }}
        >
          <span
            className={
              "erm-" + uid + "-mono text-[11px] tracking-[0.25em] uppercase"
            }
            style={{ color: routeColor }}
          >
            {eyebrow}
          </span>

          <h1
            className={
              "erm-" +
              uid +
              "-title text-4xl sm:text-5xl font-semibold mt-3 mb-6"
            }
          >
            {title}
          </h1>

          <h4
            className="flex items-start gap-2 text-base mb-3"
            style={{ color: mutedColor }}
          >
            <svg
              viewBox="0 0 448 512"
              className="w-[15px] mt-1 shrink-0"
              fill={routeColor}
            >
              <title>calendar-icon</title>
              <path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z" />
            </svg>
            <span>{dateTimeText}</span>
          </h4>

          <h4
            className="flex items-start gap-2 text-base mb-8"
            style={{ color: mutedColor }}
          >
            <svg
              viewBox="0 0 384 512"
              className="w-[15px] mt-1 shrink-0"
              fill={routeColor}
            >
              <title>map-marker</title>
              <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" />
            </svg>
            <span>{locationText}</span>
          </h4>

          {paragraphs.map((p, i) => (
            <p key={i} className="mt-6">
              {p}
            </p>
          ))}

          <div
            className="mt-10 rounded-xl px-6 py-5 text-white"
            style={{ backgroundColor: inkColor }}
          >
            <h3
              className={"erm-" + uid + "-mono text-sm tracking-[0.2em] mb-4"}
              style={{ color: routeColor }}
            >
              {scheduleTitle}
            </h3>
            <ul
              className="list-none p-0 m-0 border-l pl-5"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              {schedule.map((item, i) => (
                <li key={i} className="relative pb-7 last:pb-0">
                  <span
                    className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: routeColor }}
                  />
                  <span
                    className={"erm-" + uid + "-mono block text-sm mb-1"}
                    style={{ color: routeColor }}
                  >
                    {item.time}
                  </span>
                  <span className="text-[0.95rem] leading-snug opacity-90">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={handleExpand}
            className={
              "erm-" +
              uid +
              "-mono mt-6 inline-flex items-center gap-2 border-0 rounded-lg px-4 py-2 text-sm tracking-wide cursor-pointer"
            }
            style={{
              backgroundColor: "transparent",
              color: inkColor,
              outline: "1px solid " + mutedColor,
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill={routeColor}>
              <path d="m11.39 15.18-4.97 4.97 1.76 1.66c.81.81.24 2.19-.91 2.19H1.28C.57 24 0 23.42 0 22.71v-6a1.28 1.28 0 0 1 2.19-.91l1.66 1.77 4.97-4.97a.86.86 0 0 1 1.21 0l1.36 1.36c.33.33.33.88 0 1.21Zm1.22-6.36 4.97-4.97-1.76-1.66A1.28 1.28 0 0 1 16.73 0h6c.71 0 1.28.58 1.28 1.29v6a1.28 1.28 0 0 1-2.19.91l-1.66-1.77-4.97 4.97a.86.86 0 0 1-1.21 0l-1.36-1.36a.86.86 0 0 1 0-1.21Z" />
            </svg>
            {expandLabel}
          </button>
        </div>
      </section>

      <button
        ref={closeBtnRef}
        type="button"
        onClick={handleClose}
        className="opacity-0 invisible z-[9999] fixed right-2.5 bottom-2.5 p-0 border-0 bg-transparent cursor-pointer"
      >
        <svg width="30" viewBox="0 0 24 24" fill={inkColor}>
          <path d="M20.58.33a1.1 1.1 0 0 1 1.59 0l1.5 1.5c.44.44.44 1.15 0 1.59L19.59 7.5l1.83 1.83a1.13 1.13 0 0 1-.8 1.93h-6.75c-.62 0-1.12-.5-1.12-1.12V3.38a1.12 1.12 0 0 1 1.92-.8l1.83 1.83zM3.37 12.75h6.75c.62 0 1.12.5 1.12 1.12v6.75a1.12 1.12 0 0 1-1.92.8l-1.83-1.83-4.08 4.08c-.44.44-1.15.44-1.59 0l-1.5-1.5a1.1 1.1 0 0 1 0-1.59L4.4 16.5l-1.83-1.83a1.1 1.1 0 0 1-.24-1.23c.17-.42.58-.7 1.04-.7Z" />
        </svg>
      </button>
    </div>
  );
}
