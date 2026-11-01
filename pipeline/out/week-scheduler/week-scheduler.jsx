"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const DEFAULT_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function randomTime(startHour = 6, endHour = 18) {
  const h = Math.floor(Math.random() * (endHour - startHour) + startHour);
  const m = Math.floor(Math.random() * 4) * 15;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function makeSlot() {
  const from = randomTime(7, 16);
  const to = randomTime(parseInt(from) + 1, 20);
  return { id: crypto.randomUUID(), from, to };
}

function TimeBox({
  label,
  value,
  onChange,
  inputBg,
  inputBorder,
  bodyFont,
  accentColor,
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-[10px] px-3 py-2 flex-1 min-w-[120px]"
      style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
    >
      <span
        className="text-[0.6rem] tracking-[0.15em] uppercase font-normal flex-shrink-0 opacity-55"
        style={{ fontFamily: bodyFont, color: accentColor }}
      >
        {label}
      </span>
      <input
        type="time"
        className="ws-time-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: bodyFont }}
      />
    </div>
  );
}

export default function WeekScheduler({
  days = DEFAULT_DAYS,

  cardWidth = "min(480px, 94vw)",
  cardBorderRadius = "16px",
  cardGap = "10px",

  backgroundColor = "#0c0c0c",
  cardBackground = "#141414",
  cardBorder = "rgba(255,255,255,0.07)",
  cardExpandedBg = "#161616",
  accentColor = "#c9a96e",
  toggleOnColor = "#c9a96e",
  toggleOffColor = "rgba(255,255,255,0.1)",
  inputBackground = "#1c1c1c",
  inputBorder = "rgba(255,255,255,0.08)",
  addBtnBg = "rgba(255,255,255,0.04)",
  addBtnBorder = "rgba(255,255,255,0.08)",
  removeColor = "rgba(255,255,255,0.2)",

  bodyFont = "'DM Sans', system-ui, sans-serif",
  dayFont = "'Cormorant Garamond', Georgia, serif",
  daySize = "1.4rem",
  titleColor = "#f0ece4",
  dayColor = "#f0ece4",
  title = "Schedule",
  dayInitials = ["M", "T", "W", "T", "F", "S", "S"],
  fromLabel = "From",
  toLabel = "To",
  addLabel = "Add slot",
  removeLabel = "Remove slot",

  className = "",
}) {
  const [schedule, setSchedule] = useState(() =>
    Object.fromEntries(days.map((d) => [d, { enabled: false, slots: [] }])),
  );
  const [removing, setRemoving] = useState({});
  const timers = useRef(new Set());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const toggleDay = useCallback((day) => {
    setSchedule((prev) => {
      const cur = prev[day];
      const nextEnabled = !cur.enabled;
      return {
        ...prev,
        [day]: {
          enabled: nextEnabled,
          slots:
            nextEnabled && cur.slots.length === 0 ? [makeSlot()] : cur.slots,
        },
      };
    });
  }, []);

  const addSlot = useCallback((day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], slots: [...prev[day].slots, makeSlot()] },
    }));
  }, []);

  const removeSlot = useCallback((day, id) => {
    setRemoving((prev) => ({ ...prev, [id]: true }));
    const t = setTimeout(() => {
      timers.current.delete(t);
      setSchedule((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          slots: prev[day].slots.filter((s) => s.id !== id),
        },
      }));
      setRemoving((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }, 220);
    timers.current.add(t);
  }, []);

  const updateSlot = useCallback((day, id, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((s) =>
          s.id === id ? { ...s, [field]: value } : s,
        ),
      },
    }));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400&display=swap');

        .ws-card { transition: background 0.25s ease, box-shadow 0.25s ease; }
        .ws-container {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease, padding 0.3s ease;
        }
        .ws-container.open { max-height: 800px; opacity: 1; }
        .ws-row { transition: opacity 0.2s ease, transform 0.2s ease; }
        .ws-row.removing { opacity: 0; transform: translateX(-8px); }
        .ws-toggle {
          appearance: none;
          width: 44px; height: 24px;
          border-radius: 24px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s ease;
          flex-shrink: 0;
          border: none; outline: none;
        }
        .ws-toggle::before {
          content: '';
          position: absolute;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          top: 3px; left: 3px;
          transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .ws-toggle:checked::before { transform: translateX(20px); }
        .ws-time-input {
          background: transparent;
          border: none; outline: none;
          color: rgba(240,236,228,0.85);
          font-size: 0.9rem; font-weight: 300;
          width: 100%; cursor: pointer; padding: 0;
        }
        .ws-time-input::-webkit-calendar-picker-indicator { display: none; }
        .ws-time-input::-webkit-inner-spin-button { display: none; }
        .ws-add-btn:hover { border-color: rgba(255,255,255,0.18) !important; color: rgba(255,255,255,0.7) !important; }
        .ws-remove-btn:hover svg path { stroke: rgba(255,255,255,0.6) !important; }
      `}</style>

      <div
        className={`w-full min-h-screen flex flex-col items-center justify-start pt-10 px-4 pb-10 ${className}`}
        style={{ background: backgroundColor }}
      >
        {}
        <div className="w-full mb-9" style={{ maxWidth: cardWidth }}>
          {}
          <div className="flex gap-1 mb-4">
            {dayInitials.map((d, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border border-white/[0.07] flex items-center justify-center text-[0.5rem]"
                style={{
                  fontFamily: bodyFont,
                  color:
                    i < 5 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {}
          <h2
            className="m-0 font-light leading-[0.95] tracking-[-0.025em]"
            style={{
              color: titleColor,
              fontFamily: dayFont,
              fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
            }}
          >
            {title}
          </h2>
        </div>

        {}
        <div
          className="w-full flex flex-col"
          style={{ maxWidth: cardWidth, gap: cardGap }}
        >
          {days.map((day, di) => {
            const { enabled, slots } = schedule[day];
            return (
              <div
                key={day}
                className="ws-card overflow-hidden"
                style={{
                  background: enabled ? cardExpandedBg : cardBackground,
                  border: `1px solid ${enabled ? "rgba(255,255,255,0.1)" : cardBorder}`,
                  borderRadius: cardBorderRadius,
                  boxShadow: enabled
                    ? "0 8px 32px rgba(0,0,0,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {}
                <div
                  className="flex items-center justify-between px-[22px] py-[18px] cursor-pointer"
                  onClick={() => toggleDay(day)}
                >
                  <div className="flex items-center gap-3">
                    {}
                    <span
                      className="text-[0.55rem] tracking-[0.15em] min-w-[18px] opacity-70 transition-colors duration-200"
                      style={{
                        fontFamily: bodyFont,
                        color: enabled ? accentColor : "rgba(255,255,255,0.18)",
                      }}
                    >
                      {String(di + 1).padStart(2, "0")}
                    </span>

                    {}
                    <h3
                      className="m-0 font-light tracking-[-0.01em] transition-colors duration-[250ms]"
                      style={{
                        fontFamily: dayFont,
                        fontSize: daySize,
                        color: enabled ? dayColor : "rgba(240,236,228,0.45)",
                      }}
                    >
                      {day}
                    </h3>
                  </div>

                  {}
                  <input
                    type="checkbox"
                    className="ws-toggle"
                    checked={enabled}
                    style={{
                      background: enabled ? toggleOnColor : toggleOffColor,
                    }}
                    onChange={() => toggleDay(day)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {}
                <div className={`ws-container${enabled ? " open" : ""}`}>
                  <div className="flex flex-col gap-2.5 px-[22px] pb-5">
                    {}
                    <div className="h-px bg-white/[0.05] mb-1" />

                    {}
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`ws-row flex flex-wrap items-center gap-2${removing[slot.id] ? " removing" : ""}`}
                      >
                        <TimeBox
                          label={fromLabel}
                          value={slot.from}
                          onChange={(v) => updateSlot(day, slot.id, "from", v)}
                          inputBg={inputBackground}
                          inputBorder={inputBorder}
                          bodyFont={bodyFont}
                          accentColor={accentColor}
                        />

                        {}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="flex-shrink-0 opacity-20"
                        >
                          <path
                            d="M2 7h10M8 3l4 4-4 4"
                            stroke="#fff"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <TimeBox
                          label={toLabel}
                          value={slot.to}
                          onChange={(v) => updateSlot(day, slot.id, "to", v)}
                          inputBg={inputBackground}
                          inputBorder={inputBorder}
                          bodyFont={bodyFont}
                          accentColor={accentColor}
                        />

                        {}
                        <button
                          className="ws-remove-btn bg-transparent border-none p-1.5 cursor-pointer ml-auto flex-shrink-0"
                          onClick={() => removeSlot(day, slot.id)}
                          aria-label={removeLabel}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M2 2l10 10M12 2L2 12"
                              stroke={removeColor}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {}
                    <button
                      className="ws-add-btn flex items-center gap-1.5 self-start mt-1 px-4 py-2.5 rounded-[10px] text-[0.75rem] font-light tracking-[0.05em] cursor-pointer transition-[border-color,color] duration-200 text-white/30"
                      onClick={() => addSlot(day)}
                      style={{
                        background: addBtnBg,
                        border: `1px solid ${addBtnBorder}`,
                        fontFamily: bodyFont,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M6 1v10M1 6h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      {addLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
