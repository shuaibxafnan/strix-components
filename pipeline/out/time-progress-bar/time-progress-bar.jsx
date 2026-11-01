"use client";

import { useEffect, useState } from "react";

const KEYS = ["year", "month", "day", "hour", "minute"];

export default function TimeProgressBar({
  titleText = "Progress.",
  labels = [
    "Year Progress:",
    "Month Progress:",
    "Day Progress:",
    "Hour Progress:",
    "Minute Progress:",
  ],
  backgroundColor = "#ffffff",
  textColor = "#000000",
  barHeightClass = "h-3",
  transitionDuration = "duration-500",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState({
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
  });

  useEffect(() => {
    setMounted(true);

    const updateMetrics = () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const d = now.getDate();
      const h = now.getHours();
      const mi = now.getMinutes();

      const yearStart = new Date(y, 0, 1);
      const yearEnd = new Date(y + 1, 0, 1);
      const monthStart = new Date(y, m, 1);
      const monthEnd = new Date(y, m + 1, 1);
      const dayStart = new Date(y, m, d);
      const hourStart = new Date(y, m, d, h);
      const minuteStart = new Date(y, m, d, h, mi);

      const year = ((now - yearStart) / (yearEnd - yearStart)) * 100;
      const month = ((now - monthStart) / (monthEnd - monthStart)) * 100;
      const day = ((now - dayStart) / 86400000) * 100;
      const hour = ((now - hourStart) / 3600000) * 100;
      const minute = ((now - minuteStart) / 60000) * 100;

      setProgress({
        year: Math.round(year * 1000) / 1000,
        month: Math.round(month * 100) / 100,
        day: Math.round(day * 1000) / 1000,
        hour: Math.round(hour * 100) / 100,
        minute: Math.round(minute * 10) / 10,
      });
    };

    updateMetrics();
    const metricInterval = setInterval(updateMetrics, 1000);

    return () => clearInterval(metricInterval);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center select-none font-mono text-sm sm:text-[2vh] overflow-hidden ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <h1 className="w-[80vw] text-4xl sm:text-[7vh] mb-[5vh] font-bold tracking-tight">
        {titleText}
      </h1>
      {KEYS.map((key, i) => (
        <div key={key} className="w-[80vw] mb-[5vh]">
          <div className="mb-[1vh]">
            {labels[i]} <span>{progress[key]}%</span>
          </div>
          <div
            className={`w-full border overflow-hidden ${barHeightClass}`}
            style={{ borderColor: textColor }}
          >
            <div
              className={`h-full transition-[width] ${transitionDuration}`}
              style={{ width: `${progress[key]}%`, backgroundColor: textColor }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
