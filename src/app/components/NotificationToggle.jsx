"use client";

import { useState } from "react";

// ─── NotificationToggle ───────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// id               string    "notif-switch"      Unique id linking label ↔ input
// title            string    "Notifications"     Main label text
// labelOn          string    "On"                Status badge when enabled
// labelOff         string    "Off"               Status badge when disabled
// msgOn            string    "Spam on the way."  Sub-message when enabled
// msgOff           string    "Enjoy your day."   Sub-message when disabled
// iconSize         number    32                  SVG icon px size
// defaultChecked   boolean   false               Initial toggle state
// onChange         function  undefined           Callback (checked: boolean) => void
// buzzDuration     number    250                 Buzz animation ms (runtime → keyframe)
// switchWidth      string    "3.5rem"            Toggle pill width  (runtime CSS)
// switchHeight     string    "2rem"              Toggle pill height (runtime CSS)
// thumbSize        string    "1.25rem"           Thumb circle size  (runtime CSS)
// thumbTravel      string    "1.65rem"           Thumb translateX when checked (runtime CSS)
// textColor        string    "#555"              Text + border + thumb color (runtime CSS)
// activeColor      string    "#555"              Checked pill background (runtime CSS)
// mutedColor       string    "#888"              Sub-message + badge color (runtime CSS)
// focusRingColor   string    "#ff5449"           Focus outline color (runtime CSS)
// ─────────────────────────────────────────────────────────────────────────────

const IconOff = ({ size }) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 0 0 3.536-1.003A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
    />
  </svg>
);

const IconOn = ({ size }) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
    />
  </svg>
);

export default function NotificationToggle({
  id = "notif-switch",
  title = "Notifications",
  labelOn = "On",
  labelOff = "Off",
  msgOn = "Spam on the way.",
  msgOff = "Enjoy your day.",
  iconSize = 32,
  defaultChecked = false,
  onChange,
  buzzDuration = 250,
  switchWidth = "3.5rem",
  switchHeight = "2rem",
  thumbSize = "1.25rem",
  thumbTravel = "1.65rem",
  textColor = "#555",
  activeColor = "#555",
  mutedColor = "#888",
  focusRingColor = "#ff5449",
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [buzzing, setBuzzing] = useState(false);

  const handleChange = (e) => {
    const next = e.target.checked;
    setChecked(next);
    if (next) {
      setBuzzing(true);
      setTimeout(() => setBuzzing(false), buzzDuration + 50);
    }
    onChange?.(next);
  };

  return (
    <>
      <style>{`
        @keyframes ntf-buzz {
          0%,100% { transform: translateX(0) }
          20%      { transform: translateX(-5%) }
          40%      { transform: translateX(5%) }
          60%      { transform: translateX(-5%) }
          80%      { transform: translateX(5%) }
        }
        .ntf-buzz { animation: ntf-buzz ${buzzDuration}ms cubic-bezier(.9,0,.1,1); }
        .ntf-switch {
          -webkit-appearance: none; appearance: none;
          display: flex; align-items: center; justify-content: flex-start;
          padding: 0.25rem;
          width: ${switchWidth}; height: ${switchHeight};
          border: 1px solid ${textColor}; border-radius: 1rem;
          background-color: transparent;
          cursor: pointer;
          transition: background-color 120ms ease-in-out, border-color 120ms ease-in-out;
        }
        .ntf-switch:focus-visible { outline: 2px solid ${focusRingColor}; outline-offset: 2px; }
        .ntf-switch::before {
          content: ""; display: block;
          width: ${thumbSize}; height: ${thumbSize};
          background-color: ${textColor}; border-radius: 1rem;
          transform: translateX(0);
          transition: transform 120ms ease-in-out, background-color 120ms ease-in-out;
        }
        .ntf-switch:checked { background-color: ${activeColor}; border-color: ${activeColor}; }
        .ntf-switch:checked::before { transform: translateX(${thumbTravel}); background-color: white; }
      `}</style>

      <div
        className="grid items-center gap-4"
        style={{
          gridTemplateColumns: `${iconSize}px 10rem 4rem`,
          color: textColor,
        }}
      >
        {/* Icon */}
        <span className={buzzing ? "ntf-buzz" : ""}>
          {checked ? <IconOn size={iconSize} /> : <IconOff size={iconSize} />}
        </span>

        {/* Label */}
        <label
          htmlFor={id}
          className="cursor-pointer select-none flex flex-col gap-[3px]"
        >
          <span className="flex items-baseline gap-1.5 text-sm font-semibold leading-none">
            {title}
            <span className="text-xs font-normal" style={{ color: mutedColor }}>
              {checked ? labelOn : labelOff}
            </span>
          </span>
          <span className="text-xs leading-none" style={{ color: mutedColor }}>
            {checked ? msgOn : msgOff}
          </span>
        </label>

        {/* Toggle */}
        <input
          type="checkbox"
          id={id}
          className="ntf-switch"
          checked={checked}
          onChange={handleChange}
        />
      </div>
    </>
  );
}
