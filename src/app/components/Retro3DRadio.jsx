"use client";

import { useId, useMemo, useRef, useState } from "react";

// ─── AsiaticRadio ─────────────────────────────────────────────────────────────
//
// A 3D CSS cassette-radio. Click the orange (CTA) button or the speaker icon to
// play / pause the track; the device wiggles, the cover lifts and the shadow
// breathes while it plays.
//
// Original concept by liukui (https://dribbble.com/shots/3029443-Radio-Gif),
// CodePen by Ricardo Oliva Alonso. Ported apple-to-apple.
//
// Geometry note
// ──────────────────────────────────────────────────────────────────────────
// Every solid is built from six absolutely-positioned `.face` elements. The SCSS
// `@mixin cube` is reproduced as six generic `.f-*` rules driven by three CSS
// custom properties on each cube container: --w (width), --h (height/length),
// --d (depth). Because CSS variables inherit, a nested cube (the volume knob, the
// cassette, the lid) simply re-declares its own --w/--h/--d and its faces pick
// them up — no per-cube transform math repeated.
//
// SCSS `darken()` is reproduced with `color-mix(in srgb, <var>, black <pct>%)`,
// so the whole palette stays prop-driven from a handful of base colors.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// audioSrc        string   <github mp3>  Track to play
// loop            boolean  true          Loop the track while playing
// bgColor         string   #FCCD64       Page / stage background (yellow-2)
// shadowColor     string   #D1A551       Floor shadow color (yellow-3)
// accentColor     string   #FFA460       CTA button + cassette tint base (yellow-1)
// darkColor       string   #383832       Speaker grille / cassette / knob (black-1)
// casePrimary     string   #E9EBDB       Main case highlight tone (white-1)
// caseShade2      string   #DEE0D3       Secondary case tone (white-2)
// caseShade3      string   #AAAAAA       Case shadow tone (white-3)
// caseShade4      string   #666666       Deep recess tone (white-4)
// iconColor       string   #FFFFFF       Speaker on/off SVG fill
// scale           number   1             Uniform size multiplier for the device
// swingDuration   number   0.6           Swing / shadow animation duration (s)
// showSoundToggle boolean  true          Render the speaker on/off icon
// className       string   ""            Extra classes for the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

// Sound-on (speaker with waves) icon path
const ICON_ON =
  "M17.969,10c0,1.707-0.5,3.366-1.446,4.802c-0.076,0.115-0.203,0.179-0.333,0.179c-0.075,0-0.151-0.022-0.219-0.065c-0.184-0.122-0.233-0.369-0.113-0.553c0.86-1.302,1.314-2.812,1.314-4.362s-0.454-3.058-1.314-4.363c-0.12-0.183-0.07-0.43,0.113-0.552c0.186-0.12,0.432-0.07,0.552,0.114C17.469,6.633,17.969,8.293,17.969,10 M15.938,10c0,1.165-0.305,2.319-0.88,3.339c-0.074,0.129-0.21,0.201-0.347,0.201c-0.068,0-0.134-0.016-0.197-0.052c-0.191-0.107-0.259-0.351-0.149-0.542c0.508-0.9,0.776-1.918,0.776-2.946c0-1.028-0.269-2.046-0.776-2.946c-0.109-0.191-0.042-0.434,0.149-0.542c0.193-0.109,0.436-0.042,0.544,0.149C15.634,7.681,15.938,8.834,15.938,10 M13.91,10c0,0.629-0.119,1.237-0.354,1.811c-0.063,0.153-0.211,0.247-0.368,0.247c-0.05,0-0.102-0.01-0.151-0.029c-0.203-0.084-0.301-0.317-0.217-0.521c0.194-0.476,0.294-0.984,0.294-1.508s-0.1-1.032-0.294-1.508c-0.084-0.203,0.014-0.437,0.217-0.52c0.203-0.084,0.437,0.014,0.52,0.217C13.791,8.763,13.91,9.373,13.91,10 M11.594,3.227v13.546c0,0.161-0.098,0.307-0.245,0.368c-0.05,0.021-0.102,0.03-0.153,0.03c-0.104,0-0.205-0.04-0.281-0.117l-3.669-3.668H2.43c-0.219,0-0.398-0.18-0.398-0.398V7.012c0-0.219,0.179-0.398,0.398-0.398h4.815l3.669-3.668c0.114-0.115,0.285-0.149,0.435-0.087C11.496,2.92,11.594,3.065,11.594,3.227 M7.012,7.41H2.828v5.18h4.184V7.41z M10.797,4.189L7.809,7.177v5.646l2.988,2.988V4.189z";

// Sound-off (speaker with X) icon path
const ICON_OFF =
  "M18.084,11.639c0.168,0.169,0.168,0.442,0,0.611c-0.084,0.084-0.195,0.127-0.306,0.127c-0.111,0-0.221-0.043-0.306-0.127l-1.639-1.639l-1.639,1.639c-0.084,0.084-0.195,0.127-0.306,0.127c-0.111,0-0.222-0.043-0.307-0.127c-0.168-0.169-0.168-0.442,0-0.611L15.223,10l-1.64-1.639c-0.168-0.168-0.168-0.442,0-0.61c0.17-0.169,0.442-0.169,0.612,0l1.639,1.639l1.639-1.639c0.169-0.169,0.442-0.169,0.611,0c0.168,0.168,0.168,0.442,0,0.61L16.445,10L18.084,11.639z M12.161,2.654v14.691c0,0.175-0.105,0.333-0.267,0.4c-0.054,0.021-0.109,0.032-0.166,0.032c-0.111,0-0.223-0.043-0.305-0.127l-3.979-3.979H2.222c-0.237,0-0.432-0.194-0.432-0.432V6.759c0-0.237,0.195-0.432,0.432-0.432h5.222l3.979-3.978c0.123-0.125,0.309-0.163,0.471-0.095C12.056,2.322,12.161,2.479,12.161,2.654 M7.192,7.192H2.654v5.617h4.538V7.192z M11.296,3.698l-3.24,3.241v6.123l3.24,3.24V3.698z";

// Faces of a cube. `front` injects children into the front face (the cassette
// uses it for its tape line). `back` is omitted on cubes whose back face was
// commented out in the source — notably the lid (cover-b), so the cassette
// stays visible through the transparent front instead of being occluded.
function CubeFaces({ front = null, back = true }) {
  return (
    <>
      <div className="face f-front">{front}</div>
      {back && <div className="face f-back" />}
      <div className="face f-right" />
      <div className="face f-left" />
      <div className="face f-top" />
      <div className="face f-bottom" />
    </>
  );
}

export default function Retro3DRadio({
  audioSrc = "https://raw.githubusercontent.com/ricardoolivaalonso/recursos/master/asiatic-a/song.mp3",
  loop = true,
  bgColor = "#FCCD64",
  shadowColor = "#D1A551",
  accentColor = "#FFA460",
  darkColor = "#383832",
  casePrimary = "#E9EBDB",
  caseShade2 = "#DEE0D3",
  caseShade3 = "#AAAAAA",
  caseShade4 = "#666666",
  iconColor = "#FFFFFF",
  scale = 1,
  swingDuration = 0.6,
  showSoundToggle = true,
  className = "",
}) {
  const rawId = useId();
  const s = "asiatic-" + rawId.replace(/[:]/g, "");

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = loop;
      if (audio.paused) {
        // play() can reject under autoplay policies; clicking is a user gesture
        // so it normally succeeds — swallow the promise either way.
        const p = audio.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    }
    setPlaying(function (prev) {
      return !prev;
    });
  };

  // The stylesheet depends only on the scope id `s` (every tunable value is fed
  // through CSS custom properties on the wrapper), so it builds once per mount.
  const css = useMemo(
    function () {
      // mix(varName, pct) => SCSS darken() equivalent toward black.
      const mix = function (name, pct) {
        return "color-mix(in srgb, var(" + name + "), black " + pct + "%)";
      };

      const rules = [
        // Reset + 3D context, scoped to the component subtree only.
        [
          "*, *::after, *::before",
          "margin:0;padding:0;box-sizing:border-box;transform-style:preserve-3d;-webkit-tap-highlight-color:transparent;",
        ],
        [".face", "position:absolute;"],

        // Speaker on/off icons.
        [
          ".svgs",
          "position:absolute;z-index:200000;top:50px;left:50%;transform:translateX(-50%);",
        ],
        [".svg-icon", "width:30px;height:30px;cursor:pointer;"],
        [".svg-icon:hover", "transform:scale(1.1);"],
        [
          ".svg-icon path, .svg-icon polygon, .svg-icon rect",
          "fill:var(--c-icon);",
        ],
        [".svg-icon circle", "stroke:var(--c-icon);stroke-width:1;"],
        [".s", "display:none;"],

        // Stage placement shared by the device and its shadow.
        [
          ".radio, .shadows",
          "position:absolute;width:26vw;height:6vw;transform:perspective(10000px) rotateX(80deg) rotateZ(40deg) translateZ(-9vw) scale(var(--scale));",
        ],
        [
          ".shadow-1",
          "position:absolute;width:100%;height:400%;bottom:0;left:0;transform-origin:bottom left;transform:skewX(-10deg) translateZ(-1px);background-color:var(--c-y3);",
        ],
        [
          ".shadow-2",
          "position:absolute;width:102%;height:101%;bottom:-3%;left:-1%;background-image:linear-gradient(to bottom, var(--c-y3), " +
            mix("--c-y3", 10) +
            ");transform:translateZ(-1px);",
        ],

        // Generic cube faces — geometry from inherited --w / --h / --d.
        [
          ".f-front",
          "width:var(--w);height:var(--h);transform-origin:bottom left;transform:rotateX(-90deg) translateZ(calc(-1 * (var(--h) - (var(--d) * 2))));",
        ],
        [
          ".f-back",
          "width:var(--w);height:var(--h);transform-origin:top left;transform:rotateX(-90deg) rotateY(180deg) translateX(calc(-1 * var(--w))) translateY(calc(-1 * var(--h)));",
        ],
        [
          ".f-right",
          "width:calc(var(--d) * 2);height:var(--h);transform-origin:top left;transform:rotateY(90deg) rotateZ(-90deg) translateZ(var(--w)) translateX(calc(-2 * var(--d))) translateY(calc(-1 * var(--h)));",
        ],
        [
          ".f-left",
          "width:calc(var(--d) * 2);height:var(--h);transform-origin:top left;transform:rotateY(-90deg) rotateZ(90deg) translateY(calc(-1 * var(--h)));",
        ],
        [
          ".f-top",
          "width:var(--w);height:calc(var(--d) * 2);transform-origin:top left;transform:translateZ(var(--h));",
        ],
        [
          ".f-bottom",
          "width:var(--w);height:calc(var(--d) * 2);transform-origin:top left;transform:rotateY(180deg) translateX(calc(-1 * var(--w)));",
        ],

        // bf — main body block.
        [
          ".bf",
          "--w:26vw;--h:14vw;--d:1.5vw;width:var(--w);height:var(--d);position:absolute;",
        ],
        [".bf > .f-front", "background-color:var(--c-w1);"],
        [".bf > .f-back", "background-color:var(--c-w3);"],
        [
          ".bf > .f-right",
          "background-color:var(--c-w3);border-left:.125vw solid " +
            mix("--c-w3", 10) +
            ";",
        ],
        [
          ".bf > .f-left",
          "background-color:var(--c-w1);border-right:.125vw solid " +
            mix("--c-w1", 10) +
            ";",
        ],
        [
          ".bf > .f-top",
          "background-color:var(--c-w2);border-bottom:.125vw solid " +
            mix("--c-w2", 10) +
            ";",
        ],
        [".bf > .f-bottom", "background-color:var(--c-w3);"],

        // ffa — speaker grille block (right side).
        [
          ".ffa",
          "--w:12vw;--h:14vw;--d:1.5vw;width:var(--w);height:var(--d);position:absolute;top:50%;right:0;",
        ],
        [".ffa > .f-front", "background-color:var(--c-w1);"],
        [
          ".ffa > .f-front > .circles",
          "width:100%;height:80%;padding:3vw 2vw 1vw;background-image:linear-gradient(-90deg, transparent 0%, transparent 50%, var(--c-w1) 50%, var(--c-w1) 100%), linear-gradient(0deg, var(--c-bk) 0%, var(--c-bk) 50%, var(--c-w1) 50%, var(--c-w1) 100%);background-size:.9vw .9vw;background-clip:content-box;",
        ],
        [".ffa > .f-back", "background-color:var(--c-w2);"],
        [
          ".ffa > .f-right",
          "display:flex;justify-content:center;align-items:flex-start;padding-top:3vw;background-color:var(--c-w3);",
        ],
        [".ffa > .f-left", "background-color:var(--c-w2);"],
        [".ffa > .f-top", "background-color:var(--c-w2);"],
        [".ffa > .f-bottom", "background-color:var(--c-w3);"],

        // range — tiny volume knob nested inside the ffa right face.
        [
          ".range",
          "--w:.4vw;--h:.3vw;--d:.6vw;width:var(--w);height:var(--d);position:absolute;",
        ],
        [".range > .f-front", "background-color:" + mix("--c-bk", 10) + ";"],
        [".range > .f-back", "background-color:" + mix("--c-bk", 5) + ";"],
        [".range > .f-right", "background-color:" + mix("--c-bk", 5) + ";"],
        [".range > .f-left", "background-color:var(--c-bk);"],
        [".range > .f-top", "background-color:" + mix("--c-bk", 10) + ";"],
        [".range > .f-bottom", "background-color:" + mix("--c-bk", 10) + ";"],
        [
          ".range > .f-bottom::before",
          "content:'';position:absolute;width:100%;height:5vw;transform:translateZ(-1px);background-color:var(--c-w4);",
        ],

        // ffb — thin left edge block.
        [
          ".ffb",
          "--w:2vw;--h:14vw;--d:1.5vw;width:var(--w);height:var(--d);position:absolute;top:50%;left:0;",
        ],
        [".ffb > .f-front", "background-color:var(--c-w1);"],
        [".ffb > .f-back", "background-color:var(--c-w2);"],
        [".ffb > .f-right", "background-color:var(--c-w3);"],
        [".ffb > .f-left", "background-color:var(--c-w1);"],
        [".ffb > .f-top", "background-color:var(--c-w2);"],
        [".ffb > .f-bottom", "background-color:var(--c-w3);"],

        // ffc — front-raised control shelf.
        [
          ".ffc",
          "--w:12vw;--h:3vw;--d:1.5vw;width:var(--w);height:var(--d);position:absolute;top:50%;left:2vw;transform:translateZ(11vw);",
        ],
        [".ffc > .f-front", "background-color:var(--c-w1);"],
        [".ffc > .f-back", "background-color:var(--c-w2);"],
        [".ffc > .f-right", "background-color:var(--c-w3);"],
        [".ffc > .f-left", "background-color:var(--c-w1);"],
        [".ffc > .f-top", "background-color:var(--c-w2);"],
        [".ffc > .f-bottom", "background-color:var(--c-w3);"],

        // ffd — rear control shelf.
        [
          ".ffd",
          "--w:12vw;--h:3vw;--d:1.5vw;width:var(--w);height:var(--d);position:absolute;top:50%;left:2vw;transform:translateZ(2vw);",
        ],
        [".ffd > .f-front", "background-color:var(--c-w1);"],
        [".ffd > .f-back", "background-color:var(--c-w2);"],
        [".ffd > .f-right", "background-color:var(--c-w3);"],
        [".ffd > .f-left", "background-color:var(--c-w1);"],
        [".ffd > .f-top", "background-color:var(--c-w3);"],
        [".ffd > .f-bottom", "background-color:var(--c-w3);"],

        // buttons.
        [
          ".buttons",
          "position:absolute;left:2vw;width:12vw;height:50%;bottom:0;transform:translateZ(.1vw);",
        ],
        [
          ".button",
          "--w:2.875vw;--h:1.8vw;--d:1.5vw;width:var(--w);height:var(--d);position:absolute;",
        ],
        [".button:nth-of-type(1)", "left:.1vw;"],
        [".button:nth-of-type(2)", "left:3.1vw;"],
        [".button:nth-of-type(3)", "left:6.1vw;"],
        [".button:nth-of-type(4)", "left:9.1vw;"],
        [".button > .f-front", "background-color:" + mix("--c-w1", 1) + ";"],
        [".button > .f-back", "background-color:var(--c-w2);"],
        [".button > .f-right", "background-color:" + mix("--c-w3", 5) + ";"],
        [".button > .f-left", "background-color:var(--c-w1);"],
        [".button > .f-top", "background-color:" + mix("--c-w3", 5) + ";"],
        [".button > .f-bottom", "background-color:var(--c-w3);"],

        // CTA (play) button — orange tint.
        [
          ".button--cta > .f-front",
          "background-color:" + mix("--c-y1", 15) + ";",
        ],
        [
          ".button--cta > .f-back",
          "background-color:" + mix("--c-y1", 18) + ";",
        ],
        [
          ".button--cta > .f-right",
          "background-color:" + mix("--c-y1", 20) + ";",
        ],
        [
          ".button--cta > .f-left",
          "background-color:" + mix("--c-y1", 15) + ";",
        ],
        [
          ".button--cta > .f-top",
          "background-color:" + mix("--c-y1", 20) + ";",
        ],
        [
          ".button--cta > .f-bottom",
          "background-color:" + mix("--c-y1", 18) + ";",
        ],
        [".button--cta", "cursor:pointer;"],
        [
          ".button--cta:hover > .f-front",
          "background-color:" + mix("--c-y1", 18) + ";transition:.1s;",
        ],

        // cover — the transparent flip lid.
        [
          ".cover",
          "position:absolute;left:2vw;width:12vw;height:50%;bottom:0;transform:translateZ(5vw) rotateX(-20deg);transition:.2s;",
        ],
        [
          ".cover-b",
          "--w:12vw;--h:6vw;--d:.1vw;width:var(--w);height:var(--d);position:absolute;bottom:0;left:.1vw;",
        ],
        [
          ".cover-b > .f-front",
          "background-color:color-mix(in srgb, var(--c-w1) 10%, transparent);border:.11vw solid var(--c-w2);border-bottom:.1vw solid var(--c-w3);box-shadow:inset 1.125vw 1.125vw 0 var(--c-w1), inset -1.125vw -1.125vw 0 var(--c-w1);",
        ],
        [".cover-b > .f-back", "background-color:var(--c-w2);"],
        [".cover-b > .f-right", "background-color:var(--c-w3);"],
        [".cover-b > .f-left", "background-color:var(--c-w2);"],
        [".cover-b > .f-top", "background-color:var(--c-w2);"],
        [".cover-b > .f-bottom", "background-color:var(--c-w3);"],

        // cassette.
        [
          ".cassete",
          "--w:11vw;--h:5vw;--d:1vw;position:absolute;left:2.5vw;width:12vw;height:50%;bottom:-10%;transform:translateZ(5.5vw);",
        ],
        [
          ".cassete__line",
          "position:absolute;bottom:.3vw;width:50%;height:.3vw;background-color:" +
            mix("--c-y1", 12) +
            ";z-index:10;border-radius:1vw;",
        ],
        [
          ".cassete > .f-front",
          "display:flex;justify-content:space-around;align-items:center;background-color:var(--c-w1);border:1vw solid var(--c-bk);border-left:1.35vw solid var(--c-bk);border-right:1.35vw solid var(--c-bk);",
        ],
        [
          ".cassete > .f-front::before, .cassete > .f-front::after",
          "content:'';position:relative;width:1.4vw;height:1.4vw;border-radius:50%;background-color:var(--c-bk);",
        ],
        [".cassete > .f-back", "background-color:" + mix("--c-bk", 5) + ";"],
        [".cassete > .f-right", "background-color:" + mix("--c-bk", 10) + ";"],
        [".cassete > .f-left", "background-color:var(--c-bk);"],
        [".cassete > .f-top", "background-color:" + mix("--c-bk", 5) + ";"],
        [".cassete > .f-bottom", "background-color:" + mix("--c-bk", 10) + ";"],

        // Active (playing) states.
        [
          ".is-radio-active",
          "animation:" +
            ("ar_" + s) +
            " var(--swing-dur) infinite alternate ease-in-out;",
        ],
        [
          ".is-shadow-active",
          "animation:" +
            ("as_" + s) +
            " var(--swing-dur) infinite alternate ease-in-out;",
        ],
        [
          ".is-button-active",
          "transform:translateY(-.4vw) translateZ(.5vw) rotateX(-10deg);transition:.1s;",
        ],
        [
          ".is-button-active > .f-front",
          "background-color:" + mix("--c-y1", 20) + ";",
        ],
        [".is-cover-active", "transform:translateZ(5vw);transition:.2s;"],
        [
          ".is-circle-active",
          "animation:" + ("ac_" + s) + " .2s infinite alternate 1s;",
        ],
      ];

      // Scope every selector under the unique wrapper class.
      const scoped = rules
        .map(function (r) {
          const sel = r[0]
            .split(",")
            .map(function (one) {
              return "." + s + " " + one.trim();
            })
            .join(", ");
          return sel + " { " + r[1] + " }";
        })
        .join("\n");

      // Keyframes use globally-unique (scoped) names; --scale keeps them sized.
      const kf =
        "@keyframes ar_" +
        s +
        " {" +
        "0%,85%{transform:perspective(10000px) rotateX(80deg) rotateZ(40deg) translateZ(-9vw) rotateY(0deg) scale(var(--scale));}" +
        "30%,50%,80%{transform:perspective(10000px) rotateX(80deg) rotateZ(40deg) translateZ(-8.8vw) rotateY(-2deg) scale(var(--scale));}" +
        "60%,100%{transform:perspective(10000px) rotateX(80deg) rotateZ(40deg) translateZ(-8.8vw) rotateY(2deg) scale(var(--scale));}" +
        "}" +
        "@keyframes as_" +
        s +
        " {" +
        "0%,85%{height:400%;left:0%;}" +
        "30%,50%,80%{height:410%;left:3%;}" +
        "60%,100%{height:400%;left:0%;}" +
        "}" +
        "@keyframes ac_" +
        s +
        " {" +
        "0%,10%,30%,50%,80%{background-size:.9vw .9vw;}" +
        "20%,70%,90%,100%{background-size:.91vw .91vw;}" +
        "}";

      return scoped + "\n" + kf;
    },
    [s],
  );

  // CSS custom properties feed every tunable value into the stylesheet.
  const stageStyle = {
    backgroundColor: bgColor,
    "--c-w1": casePrimary,
    "--c-w2": caseShade2,
    "--c-w3": caseShade3,
    "--c-w4": caseShade4,
    "--c-bk": darkColor,
    "--c-y1": accentColor,
    "--c-y3": shadowColor,
    "--c-icon": iconColor,
    "--scale": scale,
    "--swing-dur": swingDuration + "s",
  };

  return (
    <div
      className={
        "relative w-full h-screen flex items-center justify-center overflow-hidden cursor-pointer " +
        s +
        (className ? " " + className : "")
      }
      style={stageStyle}
    >
      <style>{css}</style>

      <audio ref={audioRef}>
        <source src={audioSrc} type="audio/mpeg" />
      </audio>

      {showSoundToggle && (
        <div className="svgs">
          <svg
            className={"svg-icon" + (playing ? "" : " s")}
            viewBox="0 0 20 20"
            onClick={toggle}
          >
            <path d={ICON_ON} />
          </svg>
          <svg
            className={"svg-icon" + (playing ? " s" : "")}
            viewBox="0 0 20 20"
            onClick={toggle}
          >
            <path d={ICON_OFF} />
          </svg>
        </div>
      )}

      <div className="shadows">
        <div className={"shadow-1" + (playing ? " is-shadow-active" : "")} />
        <div className="shadow-2" />
      </div>

      <div className={"radio" + (playing ? " is-radio-active" : "")}>
        {/* Main body */}
        <div className="bf">
          <CubeFaces />
        </div>

        {/* Speaker grille block (with nested volume knob in the right face) */}
        <div className="ffa">
          <div className="face f-front">
            <div className="circles" />
          </div>
          <div className="face f-right">
            <div className="range">
              <CubeFaces />
            </div>
          </div>
          <div className="face f-left" />
          <div className="face f-top" />
          <div className="face f-bottom" />
        </div>

        {/* Side / shelf blocks */}
        <div className="ffb">
          <CubeFaces back={false} />
        </div>
        <div className="ffc">
          <CubeFaces back={false} />
        </div>
        <div className="ffd">
          <CubeFaces back={false} />
        </div>

        {/* Buttons (4th is the play/pause CTA) */}
        <div className="buttons">
          {[0, 1, 2, 3].map(function (i) {
            const isCta = i === 3;
            return (
              <div
                key={i}
                className={
                  "button" +
                  (isCta ? " button--cta" : "") +
                  (isCta && playing ? " is-button-active" : "")
                }
                onClick={isCta ? toggle : undefined}
              >
                <CubeFaces />
              </div>
            );
          })}
        </div>

        {/* Flip lid */}
        <div className={"cover" + (playing ? " is-cover-active" : "")}>
          <div className="cover-b">
            <CubeFaces back={false} />
          </div>
        </div>

        {/* Cassette */}
        <div className="cassete">
          <CubeFaces front={<div className="cassete__line" />} />
        </div>
      </div>
    </div>
  );
}
