"use client";

import { useEffect, useRef, useState, useId, useCallback } from "react";

const RATINGS = [
  {
    name: "awful",
    mouth:
      "M32,2 C41.5729357,2 58,10.8218206 58,21 C50.2396023,18.9643641 41.5729357,17.9465462 32,17.9465462 C22.4270643,17.9465462 13.7603977,18.9643641 6,21 C6,10.8218206 22.4270643,2 32,2 Z",
    eye: "M12.6744144,18.0128897 C17.3794842,15.6567898 19.3333811,9.83072065 17.0385652,5 C15.7595661,7.57089081 13.5517099,9.64170285 10.4149967,11.2124361 C7.27828344,12.7831694 3.80661788,13.5564215 0,13.5321925 C2.2948159,18.3629131 7.9693445,20.3689896 12.6744144,18.0128897 Z",
    fill: "#FB8043",
    radial: "#FFCCB0",
    border: "rgba(222,91,26,0.5)",
    shadow: "rgba(144,66,14,0.5)",
    mouthFill: "#A34106",
    mouthShadow: "rgba(196,95,40,0.5)",
    mouthShine: "#FEC6A7",
    teeth: false,
  },
  {
    name: "bad",
    mouth:
      "M32,6 C41.5729357,6 62,10.80044 62,23 C52.2396023,17.5602347 42.2396023,14.840352 32,14.840352 C21.7603977,14.840352 11.7603977,17.5602347 2,23 C2,10.80044 22.4270643,6 32,6 Z",
    eye: "M9,19 C14.418278,19 17,15.418278 17,11 C17,6.581722 14.418278,3 9,3 C3.581722,3 1,6.581722 1,11 C1,15.418278 3.581722,19 9,19 Z",
    fill: "#FCA730",
    radial: "#FEE8C6",
    border: "rgba(224,123,19,0.5)",
    shadow: "rgba(188,96,12,0.5)",
    mouthFill: "#AB6C09",
    mouthShadow: "rgba(148,89,7,0.3)",
    mouthShine: "#FDE0B4",
    teeth: false,
  },
  {
    name: "okay",
    mouth:
      "M32,11.3326144 C41.5729357,11.3326144 51.5729357,9.55507624 62,4 C62,12.8056732 46.3594035,23 32,23 C17.6405965,23 2,12.8056732 2,4 C12.4270643,9.55507624 22.4270643,11.3326144 32,11.3326144 Z",
    eye: "M9,19 C14.418278,19 17,15.418278 17,11 C17,6.581722 14.418278,3 9,3 C3.581722,3 1,6.581722 1,11 C1,15.418278 3.581722,19 9,19 Z",
    fill: "#FBBB1F",
    radial: "#FEF3BD",
    border: "rgba(224,143,6,0.5)",
    shadow: "rgba(190,109,9,0.5)",
    mouthFill: "#AB7509",
    mouthShadow: "rgba(146,104,7,0.3)",
    mouthShine: "#FFEECE",
    teeth: false,
  },
  {
    name: "good",
    mouth:
      "M32,6.33261436 C41.5729357,6.33261436 51.5729357,5.55507624 62,0 C62,8.80567319 46.3594035,25 32,25 C17.6405965,25 2,8.80567319 2,0 C12.4270643,5.55507624 22.4270643,6.33261436 32,6.33261436 Z",
    eye: "M9,21 C13.418278,21 17,16.418278 17,11 C17,5.581722 13.418278,1 9,1 C4.581722,1 1,5.581722 1,11 C1,16.418278 4.581722,21 9,21 Z",
    fill: "#FBD51F",
    radial: "#FEF3BD",
    border: "rgba(213,165,14,0.5)",
    shadow: "rgba(187,132,15,0.5)",
    mouthFill: "#AB7509",
    mouthShadow: "rgba(146,104,7,0.3)",
    mouthShine: "#FFEECE",
    teeth: false,
  },
  {
    name: "great",
    mouth:
      "M32,6.33261436 C41.5729357,6.33261436 53.5729357,5.55507624 64,0 C64,8.80567319 51.3594035,27 32,27 C12.6405965,27 0,8.80567319 0,0 C10.4270643,5.55507624 22.4270643,6.33261436 32,6.33261436 Z",
    eye: "M9,22 C13.418278,22 17,16.418278 17,11 C17,5.581722 13.418278,0 9,0 C4.581722,0 1,5.581722 1,11 C1,16.418278 4.581722,22 9,22 Z",
    fill: "#F3E837",
    radial: "#FFFFDC",
    border: "rgba(189,189,52,0.5)",
    shadow: "rgba(209,203,48,0.5)",
    mouthFill: "#A79627",
    mouthShadow: "rgba(93,80,3,0.25)",
    mouthShine: "#FDF8B4",
    teeth: true,
  },
];

const SNAP_X = [0, 61, 134, 207, 264];

const TRACK_WIDTH = 264;

export default function EmojiReactionSlider({
  cardBg = "#ffffff",
  cardBorderColor = "#D1D6EE",
  cardShadow = "0 1px 6px -1px rgba(0,9,61,0.16)",
  trackColor = "#E1E6F9",
  labelColor = "#2B3044",
  ratingLabelColor = "#BBC1E1",
  morphDuration = 0.35,
  snapDuration = 0.25,
  title = "Rate your experience",
  labels = ["awful", "bad", "okay", "good", "great"],
  className = "",
  onChange,
}) {
  const uid = useId().replace(/:/g, "");
  const [ratingIdx, setRatingIdx] = useState(0);
  const [thumbX, setThumbX] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [bounce, setBounce] = useState(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartThumb = useRef(0);
  const trackRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);
  const rating = RATINGS[ratingIdx];
  const snapTo = useCallback(
    (rawX) => {
      const clamped = Math.max(0, Math.min(TRACK_WIDTH, rawX));
      const nearest = SNAP_X.reduce((best, pt) =>
        Math.abs(pt - clamped) < Math.abs(best - clamped) ? pt : best,
      );
      const idx = SNAP_X.indexOf(nearest);
      setThumbX(nearest);
      setSnapping(true);
      if (idx !== ratingIdx) {
        setRatingIdx(idx);
        setBounce(true);
        onChange?.(labels[idx]);
        timers.current.push(setTimeout(() => setBounce(false), 600));
      }
      timers.current.push(setTimeout(() => setSnapping(false), snapDuration * 1000 + 50));
    },
    [ratingIdx, snapDuration, onChange],
  );
  function handlePointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartThumb.current = thumbX;
  }
  function handlePointerMove(e) {
    if (!dragging.current) return;
    const delta = e.clientX - dragStartX.current;
    const rawX = dragStartThumb.current + delta;
    const clamped = Math.max(0, Math.min(TRACK_WIDTH, rawX));
    setThumbX(clamped);
    setSnapping(false);
    const nearest = SNAP_X.reduce((best, pt) =>
      Math.abs(pt - clamped) < Math.abs(best - clamped) ? pt : best,
    );
    const idx = SNAP_X.indexOf(nearest);
    if (idx !== ratingIdx) {
      setRatingIdx(idx);
      onChange?.(labels[idx]);
    }
  }
  function handlePointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    snapTo(thumbX);
  }
  const scopedCSS = `
    .rs_mouth_${uid},
    .rs_eye_${uid} {
      transition: d ${morphDuration}s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes rs_scale_${uid} {
      50% { transform: scale(1.08) translateZ(0); filter: drop-shadow(0 8px 24px rgba(0,0,0,0.12)); }
    }
    .rs_bounce_${uid} {
      animation: rs_scale_${uid} 0.6s ease forwards;
    }
    .rs_eye_svg_${uid} {
      filter: drop-shadow(0 0.5px 1px var(--rs-mouth-shine)) url(#rs_inset_${uid});
    }
    .rs_mouth_svg_${uid} {
      filter: drop-shadow(0 0.5px 1px var(--rs-mouth-shine)) drop-shadow(0 -0.25px 0.25px var(--rs-mouth-shadow)) url(#rs_inset_${uid});
    }
    .rs_label_list_${uid} li {
      transition: opacity 0.2s ease;
    }
  `;
  const cardVars = {
    "--rs-fill": rating.fill,
    "--rs-radial": rating.radial,
    "--rs-border": rating.border,
    "--rs-shadow": rating.shadow,
    "--rs-mouth-fill": rating.mouthFill,
    "--rs-mouth-shadow": rating.mouthShadow,
    "--rs-mouth-shine": rating.mouthShine,
    "--rs-w": thumbX + "px",
  };
  return (
    <div className={"w-full h-screen flex items-center justify-center " + className}>
      <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />
      <svg
        aria-hidden="true"
        className="absolute w-0 h-0 overflow-hidden"
        style={{ position: "absolute", visibility: "hidden" }}
      >
        <defs>
          <filter id={"rs_inset_" + uid}>
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
        <div
          className="inline-grid items-center gap-x-4 sm:gap-x-6 gap-y-4 rounded-[9px] p-4 sm:p-6 select-none"
          style={{
            gridTemplateColumns: "40px auto",
            backgroundColor: cardBg,
            border: "1px solid " + cardBorderColor,
            boxShadow: cardShadow,
            ...cardVars,
            transition: [
              "--rs-fill " + morphDuration + "s ease",
              "--rs-radial " + morphDuration + "s ease",
              "--rs-border " + morphDuration + "s ease",
              "--rs-shadow " + morphDuration + "s ease",
              "--rs-mouth-fill " + morphDuration + "s ease",
              "--rs-mouth-shadow " + morphDuration + "s ease",
              "--rs-mouth-shine " + morphDuration + "s ease",
            ].join(", "),
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div className="col-span-2 flex items-center justify-between">
            <strong
              className="block text-[18px] font-medium"
              style={{ color: labelColor }}
            >
              {title}
            </strong>
            <ul
              className={
                "rs_label_list_" +
                uid +
                " m-0 p-0 list-none text-right text-sm font-medium relative"
              }
              style={{ color: ratingLabelColor, height: "1.2em" }}
            >
              {RATINGS.map((r, i) => (
                <li
                  key={r.name}
                  className="capitalize"
                  style={{
                    opacity: i === ratingIdx ? 1 : 0,
                    position: i === 0 ? "relative" : "absolute",
                    top: i === 0 ? undefined : 0,
                    right: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {labels[i]}
                </li>
              ))}
            </ul>
          </div>
          <div
            className={
              "relative w-10 h-10 rounded-full z-10 " +
              (bounce ? "rs_bounce_" + uid : "")
            }
            style={{
              background:
                "radial-gradient(circle, var(--rs-radial) 0%, var(--rs-fill) 70%)",
              backgroundSize: "100% 180%",
              backgroundPosition: "center bottom",
              boxShadow:
                "inset 0 0 0 2px var(--rs-border), inset 0 -4px 8px var(--rs-shadow)",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
              transition: [
                "background " + morphDuration + "s ease",
                "box-shadow " + morphDuration + "s ease",
              ].join(", "),
            }}
          >
            <svg
              className={"rs_eye_svg_" + uid + " block absolute"}
              viewBox="0 0 18 22"
              style={{
                width: 7,
                height: 10,
                top: 10,
                left: 22,
                fill: "var(--rs-mouth-fill)",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            >
              <path className={"rs_eye_" + uid} d={rating.eye} />
            </svg>
            <svg
              className={"rs_eye_svg_" + uid + " block absolute"}
              viewBox="0 0 18 22"
              style={{
                width: 7,
                height: 10,
                top: 10,
                right: 22,
                fill: "var(--rs-mouth-fill)",
                backfaceVisibility: "hidden",
                transform: "scaleX(-1) translateZ(0)",
              }}
            >
              <path className={"rs_eye_" + uid} d={rating.eye} />
            </svg>
            <svg
              className={"rs_mouth_svg_" + uid + " block absolute"}
              viewBox="0 0 64 28"
              style={{
                width: 26,
                height: 10,
                left: 7,
                bottom: 7,
                fill: "var(--rs-mouth-fill)",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            >
              <path className={"rs_mouth_" + uid} d={rating.mouth} />
            </svg>
            <svg
              className="block absolute"
              viewBox="0 0 64 28"
              style={{
                width: 26,
                height: 10,
                left: 7,
                bottom: 7,
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
          <div
            ref={trackRef}
            className="relative"
            style={{ height: 12, width: TRACK_WIDTH }}
          >
            <svg
              className="block absolute top-0"
              style={{ left: -3, color: trackColor, width: 273, height: 12 }}
              viewBox="0 0 273 12"
              fill="currentColor"
            >
              <path d="M266.934082,0.00110627889 C270.247182,-0.0357036686 272.96282,2.62025389 272.99963,5.93335351 C272.999877,5.95556942 273,5.97778653 273,6.00000382 C273,9.31330792 270.314036,11.9992716 267.000732,11.9992716 C266.978515,11.9992716 266.956298,11.9991482 266.934082,11.9989014 L2.96667078,9.06611103 C1.32291919,9.04784825 1.97412392e-14,7.71014921 0,6.06629617 L0,5.93371146 C9.7279267e-16,4.28985843 1.32291919,2.95215939 2.96667078,2.93389661 L266.934082,0.00110627889 Z M267,1.45028446 C264.514719,1.45028446 262.5,3.4872632 262.5,6.00000382 C262.5,8.51274443 264.514719,10.5497232 267,10.5497232 C269.485281,10.5497232 271.5,8.51274443 271.5,6.00000382 C271.5,3.4872632 269.485281,1.45028446 267,1.45028446 Z M210,1.95580884 C207.790861,1.95580884 206,3.7664566 206,6.00000382 C206,8.23355103 207.790861,10.0441988 210,10.0441988 C212.209139,10.0441988 214,8.23355103 214,6.00000382 C214,3.7664566 212.209139,1.95580884 210,1.95580884 Z M137,2.46133321 C135.067003,2.46133321 133.5,4.04565001 133.5,6.00000382 C133.5,7.95435763 135.067003,9.53867443 137,9.53867443 C138.932997,9.53867443 140.5,7.95435763 140.5,6.00000382 C140.5,4.04565001 138.932997,2.46133321 137,2.46133321 Z M64,2.96685758 C62.3431458,2.96685758 61,4.32484341 61,6.00000382 C61,7.67516423 62.3431458,9.03315005 64,9.03315005 C65.6568542,9.03315005 67,7.67516423 67,6.00000382 C67,4.32484341 65.6568542,2.96685758 64,2.96685758 Z M3,3.97790633 C1.8954305,3.97790633 1,4.88323021 1,6.00000382 C1,7.11677742 1.8954305,8.02210131 3,8.02210131 C4.1045695,8.02210131 5,7.11677742 5,6.00000382 C5,4.88323021 4.1045695,3.97790633 3,3.97790633 Z" />
            </svg>
            <span
              className="block absolute top-0 overflow-hidden"
              style={{ left: -3, width: "var(--rs-w, 0px)", height: 12 }}
            >
              <svg
                className="block"
                style={{
                  color: "var(--rs-fill)",
                  width: 273,
                  height: 12,
                  flexShrink: 0,
                }}
                viewBox="0 0 273 12"
                fill="currentColor"
              >
                <path d="M266.934082,0.00110627889 C270.247182,-0.0357036686 272.96282,2.62025389 272.99963,5.93335351 C272.999877,5.95556942 273,5.97778653 273,6.00000382 C273,9.31330792 270.314036,11.9992716 267.000732,11.9992716 C266.978515,11.9992716 266.956298,11.9991482 266.934082,11.9989014 L2.96667078,9.06611103 C1.32291919,9.04784825 1.97412392e-14,7.71014921 0,6.06629617 L0,5.93371146 C9.7279267e-16,4.28985843 1.32291919,2.95215939 2.96667078,2.93389661 L266.934082,0.00110627889 Z M267,1.45028446 C264.514719,1.45028446 262.5,3.4872632 262.5,6.00000382 C262.5,8.51274443 264.514719,10.5497232 267,10.5497232 C269.485281,10.5497232 271.5,8.51274443 271.5,6.00000382 C271.5,3.4872632 269.485281,1.45028446 267,1.45028446 Z M210,1.95580884 C207.790861,1.95580884 206,3.7664566 206,6.00000382 C206,8.23355103 207.790861,10.0441988 210,10.0441988 C212.209139,10.0441988 214,8.23355103 214,6.00000382 C214,3.7664566 212.209139,1.95580884 210,1.95580884 Z M137,2.46133321 C135.067003,2.46133321 133.5,4.04565001 133.5,6.00000382 C133.5,7.95435763 135.067003,9.53867443 137,9.53867443 C138.932997,9.53867443 140.5,7.95435763 140.5,6.00000382 C140.5,4.04565001 138.932997,2.46133321 137,2.46133321 Z M64,2.96685758 C62.3431458,2.96685758 61,4.32484341 61,6.00000382 C61,7.67516423 62.3431458,9.03315005 64,9.03315005 C65.6568542,9.03315005 67,7.67516423 67,6.00000382 C67,4.32484341 65.6568542,2.96685758 64,2.96685758 Z M3,3.97790633 C1.8954305,3.97790633 1,4.88323021 1,6.00000382 C1,7.11677742 1.8954305,8.02210131 3,8.02210131 C4.1045695,8.02210131 5,7.11677742 5,6.00000382 C5,4.88323021 4.1045695,3.97790633 3,3.97790633 Z" />
              </svg>
            </span>
            <div
              className="absolute rounded-full cursor-grab active:cursor-grabbing"
              style={{
                width: 24,
                height: 24,
                top: -6,
                left: thumbX - 12,
                backgroundColor: cardBg,
                border: "1px solid " + cardBorderColor,
                boxShadow: "0 1px 3px rgba(0,9,61,0.16)",
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
        </div>
    </div>
  );
}
