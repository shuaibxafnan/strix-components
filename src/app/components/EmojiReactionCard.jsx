"use client";

import { useRef, useState, useId, useCallback } from "react";

// ─── EmojiSlider ──────────────────────────────────────────────────────────────
//
// A full-card gradient emoji rating slider. The card background, face, and
// accent colors all transition smoothly as the thumb is dragged across five
// snap points. A large watermark word sits behind the face, and a bottom bar
// shows "I'm feeling [rating]" alongside a Save button.
//
// This is a sibling to RatingSlider — same face morphing and drag mechanics,
// completely different visual shell. Original by Aaron Iker (aaroniker).
//
// GSAP MorphSVGPlugin + Draggable are replaced with:
//   – Pointer-capture drag (onPointerDown / onPointerMove / onPointerUp)
//   – CSS `d` property transition on SVG <path> for smooth face morphing
//   – React state + inline style driving all CSS custom properties
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// morphDuration    number   0.35       Face morph + color cross-fade duration (s)
// snapDuration     number   0.25       Thumb snap spring animation duration (s)
// onSave           func     undefined  Called with rating name when Save is clicked
//                                      e.g. onSave("great")
// saveLabel        string   "Save"     Text on the save button
// promptText       string   "I'm feeling"  Prefix text in the bottom bar
// showSave         bool     true       Show / hide the Save button
// ─────────────────────────────────────────────────────────────────────────────

// ── Per-rating theme tokens ───────────────────────────────────────────────────
// Each rating has its own gradient pair, face colors, and accent word color.
// Not exposed as props — 40+ color tokens would swamp the API. Override by
// forking the RATINGS array or wrapping in a CSS custom property override.
const RATINGS = [
  {
    name: "awful",
    gradStart: "#FD8D58",
    gradEnd: "#DC611E",
    fill: "#FB8043",
    radial: "#FFCCB0",
    border: "rgba(222,91,26,0.5)",
    shadow: "rgba(144,66,14,0.5)",
    mouthFill: "#A34106",
    mouthShadow: "rgba(196,95,40,0.6)",
    mouthShine: "#FEC6A7",
    wordColor: "#ffaa68",
    teeth: false,
  },
  {
    name: "bad",
    gradStart: "#FEA954",
    gradEnd: "#DA7315",
    fill: "#FCA730",
    radial: "#FEE8C6",
    border: "rgba(224,123,19,0.5)",
    shadow: "rgba(188,96,12,0.5)",
    mouthFill: "#AB6C09",
    mouthShadow: "rgba(148,89,7,0.4)",
    mouthShine: "#FDE0B4",
    wordColor: "#fbba4a",
    teeth: false,
  },
  {
    name: "okay",
    gradStart: "#FEBE53",
    gradEnd: "#DF820F",
    fill: "#FBBB1F",
    radial: "#FEF3BD",
    border: "rgba(224,143,6,0.5)",
    shadow: "rgba(190,109,9,0.5)",
    mouthFill: "#AB7509",
    mouthShadow: "rgba(146,104,7,0.4)",
    mouthShine: "#FFEECE",
    wordColor: "#fbd24b",
    teeth: false,
  },
  {
    name: "good",
    gradStart: "#FED151",
    gradEnd: "#DE981F",
    fill: "#FBD51F",
    radial: "#FEF3BD",
    border: "rgba(213,165,14,0.5)",
    shadow: "rgba(187,132,15,0.5)",
    mouthFill: "#AB7509",
    mouthShadow: "rgba(146,104,7,0.4)",
    mouthShine: "#FFEECE",
    wordColor: "#fcd34a",
    teeth: false,
  },
  {
    name: "great",
    gradStart: "#A1BD53",
    gradEnd: "#73AD5F",
    fill: "#F4EF51",
    radial: "#FDFDEC",
    border: "rgba(167,187,46,0.5)",
    shadow: "rgba(136,134,50,0.5)",
    mouthFill: "#8A8313",
    mouthShadow: "rgba(93,80,3,0.25)",
    mouthShine: "#FDF8B4",
    wordColor: "#d2f482",
    teeth: true,
  },
];

// ── SVG path data — mouth and eye morph targets ───────────────────────────────
const PATHS = [
  {
    mouth:
      "M32,2 C41.5729357,2 58,10.8218206 58,21 C50.2396023,18.9643641 41.5729357,17.9465462 32,17.9465462 C22.4270643,17.9465462 13.7603977,18.9643641 6,21 C6,10.8218206 22.4270643,2 32,2 Z",
    eye: "M12.6744144,18.0128897 C17.3794842,15.6567898 19.3333811,9.83072065 17.0385652,5 C15.7595661,7.57089081 13.5517099,9.64170285 10.4149967,11.2124361 C7.27828344,12.7831694 3.80661788,13.5564215 0,13.5321925 C2.2948159,18.3629131 7.9693445,20.3689896 12.6744144,18.0128897 Z",
  },
  {
    mouth:
      "M32,6 C41.5729357,6 62,10.80044 62,23 C52.2396023,17.5602347 42.2396023,14.840352 32,14.840352 C21.7603977,14.840352 11.7603977,17.5602347 2,23 C2,10.80044 22.4270643,6 32,6 Z",
    eye: "M9,19 C14.418278,19 17,15.418278 17,11 C17,6.581722 14.418278,3 9,3 C3.581722,3 1,6.581722 1,11 C1,15.418278 3.581722,19 9,19 Z",
  },
  {
    mouth:
      "M32,11.3326144 C41.5729357,11.3326144 51.5729357,9.55507624 62,4 C62,12.8056732 46.3594035,23 32,23 C17.6405965,23 2,12.8056732 2,4 C12.4270643,9.55507624 22.4270643,11.3326144 32,11.3326144 Z",
    eye: "M9,19 C14.418278,19 17,15.418278 17,11 C17,6.581722 14.418278,3 9,3 C3.581722,3 1,6.581722 1,11 C1,15.418278 3.581722,19 9,19 Z",
  },
  {
    mouth:
      "M32,6.33261436 C41.5729357,6.33261436 51.5729357,5.55507624 62,0 C62,8.80567319 46.3594035,25 32,25 C17.6405965,25 2,8.80567319 2,0 C12.4270643,5.55507624 22.4270643,6.33261436 32,6.33261436 Z",
    eye: "M9,21 C13.418278,21 17,16.418278 17,11 C17,5.581722 13.418278,1 9,1 C4.581722,1 1,5.581722 1,11 C1,16.418278 4.581722,21 9,21 Z",
  },
  {
    mouth:
      "M32,6.33261436 C41.5729357,6.33261436 53.5729357,5.55507624 64,0 C64,8.80567319 51.3594035,27 32,27 C12.6405965,27 0,8.80567319 0,0 C10.4270643,5.55507624 22.4270643,6.33261436 32,6.33261436 Z",
    eye: "M9,22 C13.418278,22 17,16.418278 17,11 C17,5.581722 13.418278,0 9,0 C4.581722,0 1,5.581722 1,11 C1,16.418278 4.581722,22 9,22 Z",
  },
];

// Snap x-positions (px) for the 264px wide drag track
const SNAP_X = [0, 61, 134, 207, 264];
const TRACK_W = 264;

export default function EmojiReactionCard({
  morphDuration = 0.35,
  snapDuration = 0.25,
  onSave,
  saveLabel = "Save",
  promptText = "I'm feeling",
  showSave = true,
}) {
  const uid = useId().replace(/:/g, "");

  // ── state ──────────────────────────────────────────────────────────────────
  const [ratingIdx, setRatingIdx] = useState(0);
  const [thumbX, setThumbX] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [bounce, setBounce] = useState(false);

  // ── drag refs ──────────────────────────────────────────────────────────────
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartThumb = useRef(0);

  // ── derived ────────────────────────────────────────────────────────────────
  const rating = RATINGS[ratingIdx];
  const paths = PATHS[ratingIdx];

  // ── snap ───────────────────────────────────────────────────────────────────
  const snapTo = useCallback(
    (rawX) => {
      const clamped = Math.max(0, Math.min(TRACK_W, rawX));
      const nearest = SNAP_X.reduce((best, pt) =>
        Math.abs(pt - clamped) < Math.abs(best - clamped) ? pt : best,
      );
      const idx = SNAP_X.indexOf(nearest);
      setThumbX(nearest);
      setSnapping(true);
      if (idx !== ratingIdx) {
        setRatingIdx(idx);
        setBounce(true);
        setTimeout(() => setBounce(false), 600);
      }
      setTimeout(() => setSnapping(false), snapDuration * 1000 + 50);
    },
    [ratingIdx, snapDuration],
  );

  // ── drag handlers ──────────────────────────────────────────────────────────
  function handlePointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartThumb.current = thumbX;
  }

  function handlePointerMove(e) {
    if (!dragging.current) return;
    const clamped = Math.max(
      0,
      Math.min(
        TRACK_W,
        dragStartThumb.current + (e.clientX - dragStartX.current),
      ),
    );
    setThumbX(clamped);
    setSnapping(false);
    const nearest = SNAP_X.reduce((best, pt) =>
      Math.abs(pt - clamped) < Math.abs(best - clamped) ? pt : best,
    );
    const idx = SNAP_X.indexOf(nearest);
    if (idx !== ratingIdx) setRatingIdx(idx);
  }

  function handlePointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    snapTo(thumbX);
  }

  const scopedCSS = `
    /* Smooth SVG face morph via CSS d property */
    .es_mouth_${uid}, .es_eye_${uid} {
      transition: d ${morphDuration}s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Bounce animation on rating change */
    @keyframes es_scale_${uid} {
      50% { transform: scale(1.08) translateZ(0); filter: drop-shadow(0 8px 24px rgba(0,0,0,0.12)); }
    }
    .es_bounce_${uid} {
      animation: es_scale_${uid} 0.6s ease forwards;
    }

    /* Inset shadow on face features */
    .es_eye_svg_${uid} {
      filter: drop-shadow(0 1px 2px var(--es-mouth-shine)) url(#es_inset_${uid});
    }
    .es_mouth_svg_${uid} {
      filter: drop-shadow(0 1px 2px var(--es-mouth-shine)) drop-shadow(0 -1px 1px var(--es-mouth-shadow)) url(#es_inset_${uid});
    }

    /* Gradient clip on the big watermark word */
    .es_word_${uid} {
      background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0) 90%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Track background SVG via pseudo-element */
    .es_track_${uid}::before {
      content: '';
      position: absolute;
      top: 0;
      left: -3px;
      width: 273px;
      height: 12px;
      background-image: url('data:image/svg+xml;utf8,<svg width="273" height="12" viewBox="0 0 273 12" xmlns="http://www.w3.org/2000/svg"><path d="M266.934082,0.00110627889 C270.247182,-0.0357036686 272.96282,2.62025389 272.99963,5.93335351 C272.999877,5.95556942 273,5.97778653 273,6.00000382 C273,9.31330792 270.314036,11.9992716 267.000732,11.9992716 C266.978515,11.9992716 266.956298,11.9991482 266.934082,11.9989014 L2.96667078,9.06611103 C1.32291919,9.04784825 1.97412392e-14,7.71014921 0,6.06629617 L0,5.93371146 C9.7279267e-16,4.28985843 1.32291919,2.95215939 2.96667078,2.93389661 L266.934082,0.00110627889 Z M267,1.45028446 C264.514719,1.45028446 262.5,3.4872632 262.5,6.00000382 C262.5,8.51274443 264.514719,10.5497232 267,10.5497232 C269.485281,10.5497232 271.5,8.51274443 271.5,6.00000382 C271.5,3.4872632 269.485281,1.45028446 267,1.45028446 Z M210,1.95580884 C207.790861,1.95580884 206,3.7664566 206,6.00000382 C206,8.23355103 207.790861,10.0441988 210,10.0441988 C212.209139,10.0441988 214,8.23355103 214,6.00000382 C214,3.7664566 212.209139,1.95580884 210,1.95580884 Z M137,2.46133321 C135.067003,2.46133321 133.5,4.04565001 133.5,6.00000382 C133.5,7.95435763 135.067003,9.53867443 137,9.53867443 C138.932997,9.53867443 140.5,7.95435763 140.5,6.00000382 C140.5,4.04565001 138.932997,2.46133321 137,2.46133321 Z M64,2.96685758 C62.3431458,2.96685758 61,4.32484341 61,6.00000382 C61,7.67516423 62.3431458,9.03315005 64,9.03315005 C65.6568542,9.03315005 67,7.67516423 67,6.00000382 C67,4.32484341 65.6568542,2.96685758 64,2.96685758 Z M3,3.97790633 C1.8954305,3.97790633 1,4.88323021 1,6.00000382 C1,7.11677742 1.8954305,8.02210131 3,8.02210131 C4.1045695,8.02210131 5,7.11677742 5,6.00000382 C5,4.88323021 4.1045695,3.97790633 3,3.97790633 Z" fill="white" fill-opacity=".25"/></svg>');
    }

    /* Rating word stack transition */
    .es_label_${uid} li { transition: opacity 0.2s ease; }
  `;

  // CSS custom properties — all runtime color values that change per rating
  const cardVars = {
    "--es-fill": rating.fill,
    "--es-radial": rating.radial,
    "--es-border": rating.border,
    "--es-shadow": rating.shadow,
    "--es-mouth-fill": rating.mouthFill,
    "--es-mouth-shadow": rating.mouthShadow,
    "--es-mouth-shine": rating.mouthShine,
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />

      {/* Hidden inset-shadow SVG filter — referenced via url(#id) */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          visibility: "hidden",
          width: 0,
          height: 0,
        }}
      >
        <defs>
          <filter id={"es_inset_" + uid}>
            <feOffset dx="0" dy="3" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite
              operator="out"
              in="SourceGraphic"
              in2="offset-blur"
              result="inverse"
            />
            <feFlood floodColor="black" floodOpacity="0.5" result="color" />
            <feComposite
              operator="in"
              in="color"
              in2="inverse"
              result="shadow"
            />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      {/* ── Card ── */}
      <div className="w-full h-screen flex items-center justify-center">
        <div
          className="relative overflow-hidden select-none"
          style={{
            width: 320,
            height: 288,
            borderRadius: 13,
            backgroundImage:
              "linear-gradient(" +
              rating.gradStart +
              ", " +
              rating.gradEnd +
              ")",
            transition: "background-image " + morphDuration + "s ease",
            fontFamily: "'Inter UI', 'Inter', Arial",
            WebkitTapHighlightColor: "transparent",
            ...cardVars,
            // Transition all CSS custom properties that the face reads
            transition: [
              "background-image " + morphDuration + "s ease",
              "--es-fill " + morphDuration + "s ease",
              "--es-radial " + morphDuration + "s ease",
              "--es-border " + morphDuration + "s ease",
              "--es-shadow " + morphDuration + "s ease",
              "--es-mouth-fill " + morphDuration + "s ease",
              "--es-mouth-shadow " + morphDuration + "s ease",
              "--es-mouth-shine " + morphDuration + "s ease",
            ].join(", "),
          }}
        >
          <div
            className="absolute top-3 left-0 right-0 text-center pointer-events-none"
            style={{ opacity: 0.4 }}
          >
            <ul
              className={"es_label_" + uid + " m-0 p-0 list-none relative"}
              style={{ height: "1em" }}
            >
              {RATINGS.map((r, i) => (
                <li
                  key={r.name}
                  className={
                    "es_word_" +
                    uid +
                    " text-[80px] font-black uppercase leading-none"
                  }
                  style={{
                    opacity: i === ratingIdx ? 1 : 0,
                    position: i === 0 ? "relative" : "absolute",
                    top: i === 0 ? undefined : 0,
                    left: 0,
                    right: 0,
                    userSelect: "none",
                  }}
                >
                  {r.name}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Emoji face ── */}
          <div
            className={
              "relative rounded-full mx-auto z-[1] " +
              (bounce ? "es_bounce_" + uid : "")
            }
            style={{
              width: 120,
              height: 120,
              marginTop: 60,
              background:
                "radial-gradient(circle, var(--es-radial) 0%, var(--es-fill) 70%)",
              backgroundSize: "100% 180%",
              backgroundPosition: "center bottom",
              boxShadow:
                "inset 0 0 0 4px var(--es-border), inset 0 -10px 12px var(--es-shadow)",
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.16))",
              transition: [
                "background " + morphDuration + "s ease",
                "box-shadow " + morphDuration + "s ease",
              ].join(", "),
            }}
          >
            {/* Left eye */}
            <svg
              className={"es_eye_svg_" + uid + " block absolute"}
              viewBox="0 0 18 22"
              style={{
                width: 18,
                height: 22,
                top: 34,
                left: 30,
                fill: "var(--es-mouth-fill)",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            >
              <path className={"es_eye_" + uid} d={paths.eye} />
            </svg>

            {/* Right eye (mirrored) */}
            <svg
              className={"es_eye_svg_" + uid + " block absolute"}
              viewBox="0 0 18 22"
              style={{
                width: 18,
                height: 22,
                top: 34,
                right: 30,
                fill: "var(--es-mouth-fill)",
                backfaceVisibility: "hidden",
                transform: "scaleX(-1) translateZ(0)",
              }}
            >
              <path className={"es_eye_" + uid} d={paths.eye} />
            </svg>

            {/* Mouth */}
            <svg
              className={"es_mouth_svg_" + uid + " block absolute"}
              viewBox="0 0 64 28"
              style={{
                width: 64,
                height: 28,
                left: 28,
                bottom: 24,
                fill: "var(--es-mouth-fill)",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            >
              <path className={"es_mouth_" + uid} d={paths.mouth} />
            </svg>

            {/* Teeth — only visible at "great" */}
            <svg
              className="block absolute"
              viewBox="0 0 64 28"
              style={{
                width: 64,
                height: 28,
                left: 28,
                bottom: 24,
                fill: "#fff",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
                opacity: rating.teeth ? 1 : 0,
                transition: "opacity " + morphDuration + "s ease",
              }}
            >
              <path d="M32,7.83261436 C41.5729357,7.83261436 52.5729357,7.05507624 63,1.5 C63,10.3056732 46.3594035,14.5 32,14.5 C17.6405965,14.5 1,10.3056732 1,1.5 C11.4270643,7.05507624 22.4270643,7.83261436 32,7.83261436 Z" />
            </svg>
          </div>

          {/* ── Draggable track ── */}
          {/* Positioned absolutely matching original: left/right 28px, bottom 68px */}
          <div
            className={"es_track_" + uid + " absolute"}
            style={{
              left: 28,
              right: 28,
              bottom: 68,
              height: 12,
              // right: 28 gives us 320 - 56 = 264px — exactly TRACK_W
            }}
          >
            {/* Draggable thumb */}
            <div
              className="absolute rounded-full cursor-grab active:cursor-grabbing bg-white"
              style={{
                width: 24,
                height: 24,
                top: -6,
                left: thumbX - 12,
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                transition: snapping
                  ? "left " + snapDuration + "s cubic-bezier(0.34,1.56,0.64,1)"
                  : "none",
                touchAction: "none",
                zIndex: 2,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>

          {/* ── Bottom bar ── */}
          {/* Dark frosted strip with "I'm feeling [word]" and Save button */}
          <div
            className="absolute left-0 right-0 bottom-0 flex items-center"
            style={{
              padding: "8px 16px",
              borderRadius: "0 0 13px 13px",
              backgroundColor: "rgba(0,0,0,0.1)",
              fontSize: 14,
              lineHeight: "23px",
              color: "rgba(255,255,255,0.8)",
              fontFamily: "'Inter UI', 'Inter', Arial",
            }}
          >
            {/* Prompt prefix */}
            <span className="shrink-0">{promptText}&nbsp;</span>

            {/* Stacked rating words — only active is visible */}
            <span
              className="relative inline-block font-black align-top"
              style={{
                color: rating.wordColor,
                height: "23px",
                minWidth: 48,
                transition: "color " + morphDuration + "s ease",
              }}
            >
              <ul className={"es_label_" + uid + " m-0 p-0 list-none"}>
                {RATINGS.map((r, i) => (
                  <li
                    key={r.name}
                    className="capitalize"
                    style={{
                      opacity: i === ratingIdx ? 1 : 0,
                      position: i === 0 ? "relative" : "absolute",
                      top: i === 0 ? undefined : 0,
                      left: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.name}
                  </li>
                ))}
              </ul>
            </span>

            {/* Save button */}
            {showSave && (
              <button
                className="absolute right-4 top-[7px] uppercase font-bold text-white cursor-pointer border-0 outline-none"
                style={{
                  padding: "0 12px",
                  lineHeight: "25px",
                  height: 25,
                  borderRadius: 13,
                  fontSize: 12,
                  backgroundColor: rating.gradEnd,
                  transition: "background-color " + morphDuration + "s ease",
                  WebkitAppearance: "none",
                }}
                onClick={() => onSave?.(rating.name)}
              >
                {saveLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
