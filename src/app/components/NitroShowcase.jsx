"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── NitroSlider ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// brandName     string   "NITRO"         Large brand label top of left panel
// transitionMs  number   500             Slide transition duration (ms)
// sceneColors   array    [...]           One accent hex per scene
// scenes        array    DEFAULT_SCENES  Array of scene objects:
//   {
//     name        string  Board name displayed large
//     boardImg    string  PNG url (transparent bg board image)
//     specs       array   [{ label, value }] — spec table rows
//     topPhoto    string  Photo url — smaller top frame (right panel)
//     bottomPhoto string  Photo url — larger bottom frame (right panel)
//     riderName   string  Rider name
//     riderTag    string  e.g. "Riding The Cannon"
//   }
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_SCENES = [
  {
    name: "THE CANNON",
    boardImg: "http://pngimg.com/uploads/snowboard/snowboard_PNG8008.png",
    specs: [
      { label: "Size", value: "153cm" },
      { label: "Shape", value: "Tapered Swallowtail" },
      { label: "Camber", value: "True Camber" },
      { label: "Width", value: "Mid-Wide" },
      { label: "Flex", value: "All Terrain" },
      { label: "Sidecut", value: "Progressive" },
    ],
    topPhoto:
      "https://images.unsplash.com/photo-1495468286609-71018e87abc5?auto=format&fit=crop&w=670&q=80",
    bottomPhoto:
      "https://images.unsplash.com/photo-1486335223442-a034129506f6?auto=format&fit=crop&w=1350&q=80",
    riderName: "Brion Fox",
    riderTag: "Riding The Cannon",
  },
  {
    name: "THE POW",
    boardImg: "http://pngimg.com/uploads/snowboard/snowboard_PNG8006.png",
    specs: [
      { label: "Size", value: "148cm" },
      { label: "Shape", value: "Twin Tip" },
      { label: "Camber", value: "Flat" },
      { label: "Width", value: "Wide" },
      { label: "Flex", value: "All Terrain" },
      { label: "Sidecut", value: "Progressive" },
    ],
    topPhoto:
      "https://images.unsplash.com/photo-1536099876051-79f4cbffeed1?auto=format&fit=crop&w=1350&q=80",
    bottomPhoto:
      "https://images.unsplash.com/photo-1522056615691-da7b8106c665?auto=format&fit=crop&w=1352&q=80",
    riderName: "Austin Smith",
    riderTag: "Riding The Pow",
  },
  {
    name: "THE SPLASH",
    boardImg: "http://pngimg.com/uploads/snowboard/snowboard_PNG7998.png",
    specs: [
      { label: "Size", value: "156cm" },
      { label: "Shape", value: "Reverse Camber" },
      { label: "Camber", value: "True Rocker" },
      { label: "Width", value: "Mid-Wide" },
      { label: "Flex", value: "All Terrain" },
      { label: "Sidecut", value: "Progressive" },
    ],
    topPhoto:
      "https://images.unsplash.com/photo-1512821062947-6eda5253c3e2?auto=format&fit=crop&w=1351&q=80",
    bottomPhoto:
      "https://images.unsplash.com/photo-1478700485868-972b69dc3fc4?auto=format&fit=crop&w=1350&q=80",
    riderName: "Sally Blue",
    riderTag: "Riding The Splash",
  },
];

const DEFAULT_COLORS = ["#E41936", "#E7E31D", "#3BB7CE"];

// ── Scoped keyframe — cover wipe animation for photo frames.
// ── Plain string concat, no backticks (avoids SSR chunk syntax errors).
const SCOPED_CSS =
  "@keyframes ns-wipe {" +
  "  0%   { transform: translateX(-100%); }" +
  "  50%  { transform: translateX(0%); }" +
  "  100% { transform: translateX(100%); }" +
  "}" +
  ".ns-wipe-run { animation: ns-wipe 0.5s cubic-bezier(.55,0,.1,1) both; }";

// ── Build transition shorthand with delay baked in — avoids React's
// ── warning about mixing `transition` shorthand and `transitionDelay` longhand.
// ── CSS 4-value shorthand: property duration timing-function delay
function tr(prop, ms, delay) {
  var d = delay || 0;
  return prop + " " + ms + "ms cubic-bezier(.55,0,.1,1) " + d + "ms";
}

export default function NitroShowcase({
  brandName = "NITRO",
  transitionMs = 500,
  sceneColors = DEFAULT_COLORS,
  scenes = DEFAULT_SCENES,
}) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [wiping, setWiping] = useState(false);
  const lockedRef = useRef(false);

  // ── Font injection — Barlow Condensed (display) + Space Grotesk (body/specs)
  useEffect(function () {
    const id = "ns-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=Space+Grotesk:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const navigate = useCallback(
    function (step) {
      if (lockedRef.current) return;
      lockedRef.current = true;
      const n = scenes.length;
      const next = (((current + step) % n) + n) % n;
      setPrev(current);
      setCurrent(next);
      setWiping(true);
      setTimeout(function () {
        setWiping(false);
        setPrev(null);
        lockedRef.current = false;
      }, transitionMs);
    },
    [current, scenes.length, transitionMs],
  );

  // ── Keyboard support
  useEffect(
    function () {
      const fn = function (e) {
        if (e.key === "ArrowRight") navigate(1);
        if (e.key === "ArrowLeft") navigate(-1);
      };
      window.addEventListener("keydown", fn);
      return function () {
        window.removeEventListener("keydown", fn);
      };
    },
    [navigate],
  );

  // ── State for each scene index
  function layerState(i) {
    if (i === current) return "enter";
    if (i === prev) return "exit";
    return "wait";
  }

  // ── Left panel slide: enter from right, exit to left
  // ── "wait" gets transition:none — when prev clears to null the layer snaps
  // ── instantly from translateX(-100%) back to translateX(100%) with no
  // ── visible animation (the ghost second-transition bug).
  function leftStyle(state) {
    var delay = state === "enter" ? transitionMs / 2 : 0;
    var t =
      state === "wait"
        ? "none"
        : tr("transform", transitionMs, delay) +
          ", " +
          tr("opacity", transitionMs, delay);
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      transition: t,
      transform:
        state === "enter"
          ? "translateX(0)"
          : state === "exit"
            ? "translateX(-100%)"
            : "translateX(100%)",
      opacity: state === "enter" ? 1 : 0,
      zIndex: state === "wait" ? 1 : 2,
    };
  }

  // ── Right panel color bg: enter from right, exit freezes (no transition)
  function rightBgStyle(i, state) {
    var color = sceneColors[i % sceneColors.length];
    if (state === "enter")
      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: color,
        zIndex: 2,
        transition: tr("transform", transitionMs, transitionMs / 2),
        transform: "translateX(0)",
      };
    if (state === "exit")
      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: color,
        zIndex: 1,
        transition: "none",
        transform: "translateX(0)",
      };
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: color,
      zIndex: 1,
      transition: tr("transform", transitionMs, transitionMs / 2),
      transform: "translateX(100%)",
    };
  }

  // ── Photo frame image: crossfade opacity
  // ── "wait" gets transition:none — instant reset after prev clears,
  // ── no ghost fade when opacity snaps back from exit→wait position.
  function photoStyle(state, imgUrl) {
    var delay = state === "enter" ? transitionMs / 2 : 0;
    var t = state === "wait" ? "none" : tr("opacity", transitionMs, delay);
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: "url(" + imgUrl + ")",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: state === "enter" ? 1 : 0,
      transition: t,
    };
  }

  // ── Rider name slide: enter from right, exit to left
  // ── "wait" gets transition:none — snaps instantly when prev clears,
  // ── no ghost slide from translateX(-100%) → translateX(100%).
  function nameStyle(state) {
    var delay = state === "enter" ? transitionMs / 2 : 0;
    var t = state === "wait" ? "none" : tr("transform", transitionMs, delay);
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      transition: t,
      transform:
        state === "enter"
          ? "translateX(0)"
          : state === "exit"
            ? "translateX(-100%)"
            : "translateX(100%)",
      zIndex: state === "wait" ? 1 : 2,
    };
  }

  var accentColor = sceneColors[current % sceneColors.length];

  return (
    <div
      className="w-full h-screen overflow-hidden flex"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <style dangerouslySetInnerHTML={{ __html: SCOPED_CSS }} />

      {/* ══════════════════════════════════════════════════════════════════
          LEFT PANEL
          Layout (top→bottom): brand label · board name · board image · specs · nav
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative flex flex-col bg-white"
        style={{ flex: "1 0 0", minWidth: 0 }}
      >
        {/* ── Layer stack — fills left panel, slides transition inside here ── */}
        <div className="relative flex-1 overflow-hidden">
          {scenes.map(function (s, i) {
            var state = layerState(i);
            var color = sceneColors[i % sceneColors.length];
            return (
              <div
                key={i}
                style={leftStyle(state)}
                className="bg-white flex flex-col"
              >
                {/* ── Brand + board name header ──────────────────────── */}
                <div className="flex items-baseline justify-between px-5 pt-5 pb-2 shrink-0">
                  {/* Brand — small, tracking-widest, anchors top-left */}
                  <span
                    className="uppercase tracking-[0.3em] text-black/30 select-none"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(0.6rem, 0.9vw, 0.85rem)",
                    }}
                  >
                    {brandName}
                  </span>
                  {/* Scene index — top-right corner */}
                  <span
                    className="text-black/20 select-none"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 300,
                      fontSize: "clamp(0.6rem, 0.8vw, 0.75rem)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(scenes.length).padStart(2, "0")}
                  </span>
                </div>

                {/* ── Board name — the hero of the left panel ─────────── */}
                <div className="px-5 shrink-0">
                  <h2
                    className="uppercase leading-none"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(2.2rem, 5.5vw, 5rem)",
                      color: color,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.name}
                  </h2>
                </div>

                {/* ── Board image — takes remaining vertical space ─────── */}
                <div
                  className="flex-1 min-h-0 mx-4"
                  style={{
                    backgroundImage: "url(" + s.boardImg + ")",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    backgroundPosition: "center center",
                  }}
                />

                {/* ── Spec table ──────────────────────────────────────── */}
                <div
                  className="shrink-0 px-5 py-4"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.5fr",
                    columnGap: "0.75rem",
                  }}
                >
                  {/* Labels col */}
                  <div className="flex flex-col gap-[5px] items-end">
                    {s.specs.map(function (sp) {
                      return (
                        <span
                          key={sp.label}
                          className="uppercase tracking-wider text-right"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: "clamp(0.58rem, 0.75vw, 0.72rem)",
                            fontWeight: 400,
                            color: "#aaa",
                          }}
                        >
                          {sp.label}
                        </span>
                      );
                    })}
                  </div>
                  {/* Values col */}
                  <div className="flex flex-col gap-[5px]">
                    {s.specs.map(function (sp) {
                      return (
                        <span
                          key={sp.label}
                          className="uppercase"
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "clamp(0.65rem, 0.85vw, 0.82rem)",
                            fontWeight: 700,
                            color: "#111",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {sp.value}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Nav — full-width bottom bar, sits outside the layer stack ─── */}
        <div
          className="shrink-0 flex items-stretch border-t border-black/10"
          style={{ height: "52px" }}
        >
          <button
            onClick={function () {
              navigate(-1);
            }}
            aria-label="Previous board"
            className="flex-1 flex items-center justify-center cursor-pointer active:scale-95 transition-transform border-r border-black/10 bg-white hover:bg-black/5"
            style={{
              border: "none",
              borderRight: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <span
              className="uppercase tracking-[0.2em]"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(0.65rem, 1vw, 0.9rem)",
                color: "#111",
              }}
            >
              ← PREV
            </span>
          </button>
          <button
            onClick={function () {
              navigate(1);
            }}
            aria-label="Next board"
            className="flex-1 flex items-center justify-center cursor-pointer active:scale-95 transition-transform bg-white hover:bg-black/5"
            style={{ border: "none" }}
          >
            <span
              className="uppercase tracking-[0.2em]"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(0.65rem, 1vw, 0.9rem)",
                color: "#111",
              }}
            >
              NEXT →
            </span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT PANEL — accent color flash + two photo frames + rider info
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{ flex: "2 0 0", minWidth: 0 }}
      >
        {/* ── Full-bleed accent color layers ──────────────────────────── */}
        {scenes.map(function (s, i) {
          return <div key={i} style={rightBgStyle(i, layerState(i))} />;
        })}

        {/* ── Top photo frame — smaller, upper-left quadrant ────────── */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: "10%",
            left: "10%",
            width: "40%",
            height: "40%",
            zIndex: 3,
          }}
        >
          {scenes.map(function (s, i) {
            return (
              <div key={i} style={photoStyle(layerState(i), s.topPhoto)} />
            );
          })}
          {/* Cover wipe — keyframe-driven only; transition:none prevents React
               style-diff from animating the park-position reset when wiping→false */}
          <div
            className={wiping ? "ns-wipe-run" : ""}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#111",
              zIndex: 10,
              transition: "none",
              transform: wiping ? undefined : "translateX(-100%)",
            }}
          />
        </div>

        {/* ── Bottom photo frame — larger, lower-right quadrant ────────── */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: "40%",
            left: "20%",
            width: "65%",
            height: "50%",
            zIndex: 2,
          }}
        >
          {scenes.map(function (s, i) {
            return (
              <div key={i} style={photoStyle(layerState(i), s.bottomPhoto)} />
            );
          })}
          {/* Cover wipe — white curtain; transition:none for same reason */}
          <div
            className={wiping ? "ns-wipe-run" : ""}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#fff",
              zIndex: 10,
              transition: "none",
              transform: wiping ? undefined : "translateX(-100%)",
            }}
          />
        </div>

        {/* ── Rider info — bottom-left of right panel, always legible ─── */}
        <div
          className="absolute overflow-hidden"
          style={{ bottom: "5%", left: "10%", width: "45%", zIndex: 5 }}
        >
          <div className="relative" style={{ minHeight: "4rem" }}>
            {scenes.map(function (s, i) {
              return (
                <div key={i} style={nameStyle(layerState(i))}>
                  {/* Rider name — large, punchy */}
                  <span
                    className="block uppercase"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(1.1rem, 2.2vw, 1.9rem)",
                      letterSpacing: "0.04em",
                      color: "#fff",
                    }}
                  >
                    {s.riderName}
                  </span>
                  {/* Board tag — light, below */}
                  <span
                    className="block"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 300,
                      fontSize: "clamp(0.65rem, 1vw, 0.85rem)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.6)",
                      marginTop: "2px",
                    }}
                  >
                    {s.riderTag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
