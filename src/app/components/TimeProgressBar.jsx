"use client";

import { useEffect, useState } from "react";

// ─── TimeProgressBarComponent ────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// titleText          string   "Progress."  Title string element header
// barHeightClass     string   "h-3"        Height parameters for track containers
// transitionDuration string   "duration-500" Width scaling CSS animation token
// ──────────────────────────────────────────────────────────────────────────

export default function TimeProgressBar({
  titleText = "Progress.",
  barHeightClass = "h-3",
  transitionDuration = "duration-500",
}) {
  // Safe client-side mount flag to prevent SSR hydration gaps
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Structural runtime metrics container state
  const [progress, setProgress] = useState({
    year: { percentage: "0%", width: "0vw" },
    month: { percentage: "0%", width: "0vw" },
    day: { percentage: "0%", width: "0vw" },
    hour: { percentage: "0%", width: "0vw" },
    minute: { percentage: "0%", width: "0vw" },
  });

  // Helper date configuration operations
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const getSecondsPerYear = (year) => {
    return isLeapYear(year) ? 31622400 : 31536000;
  };

  const getSecondsPerMonth = (year, month) => {
    return new Date(year, month, 0).getDate() * 24 * 3600;
  };

  useEffect(() => {
    setMounted(true);

    // Synchronize layout theme setup with OS system configuration preferences
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setIsDarkMode(true);
    }

    const updateMetrics = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const defaultWidthBase = 80; // Maps to reference design 80vw framework scale

      // 1. Year Calculations
      const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const elapsedYearMs = now - startOfYear;
      const secondsInYear = getSecondsPerYear(currentYear);
      let yearPercentage = elapsedYearMs / 1000 / secondsInYear;
      yearPercentage = Math.round(yearPercentage * 10000000) / 100000;

      // 2. Month Calculations
      const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
      const elapsedMonthMs = now - startOfMonth;
      const secondsInMonth = getSecondsPerMonth(currentYear, currentMonth + 1);
      let monthPercentage = elapsedMonthMs / 1000 / secondsInMonth;
      monthPercentage = Math.round(monthPercentage * 1000000) / 10000;

      // 3. Day Calculations
      const startOfDay = new Date(
        currentYear,
        currentMonth,
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      const elapsedDayMs = now - startOfDay;
      let dayPercentage = elapsedDayMs / 1000 / 86400;
      dayPercentage = Math.round(dayPercentage * 100000) / 1000;

      // 4. Hour Calculations
      const startOfHour = new Date(
        currentYear,
        currentMonth,
        now.getDate(),
        now.getHours(),
        0,
        0,
        0,
      );
      const elapsedHourMs = now - startOfHour;
      let hourPercentage = elapsedHourMs / 1000 / 3600;
      hourPercentage = Math.round(hourPercentage * 10000) / 100;

      // 5. Minute Calculations
      const startOfMinute = new Date(
        currentYear,
        currentMonth,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        0,
        0,
      );
      const elapsedMinuteMs = now - startOfMinute;
      let minutePercentage = elapsedMinuteMs / 1000 / 60;
      minutePercentage = Math.round(minutePercentage * 1000) / 10;

      setProgress({
        year: {
          percentage: `${yearPercentage}%`,
          width: `${(defaultWidthBase * yearPercentage) / 100}vw`,
        },
        month: {
          percentage: `${monthPercentage}%`,
          width: `${(defaultWidthBase * monthPercentage) / 100}vw`,
        },
        day: {
          percentage: `${dayPercentage}%`,
          width: `${(defaultWidthBase * dayPercentage) / 100}vw`,
        },
        hour: {
          percentage: `${hourPercentage}%`,
          width: `${(defaultWidthBase * hourPercentage) / 100}vw`,
        },
        minute: {
          percentage: `${minutePercentage}%`,
          width: `${(defaultWidthBase * minutePercentage) / 100}vw`,
        },
      });
    };

    updateMetrics();
    const metricInterval = setInterval(updateMetrics, 1000);

    return () => clearInterval(metricInterval);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`absolute inset-0 select-none font-mono text-[2vh] overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Absolute Header Menu Actions Bar */}
      <div className="absolute top-[4vh] right-[10vw] z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-[3.5vh] p-2 rounded-lg cursor-pointer transition-transform duration-200 active:scale-90 hover:scale-110 focus:outline-none select-none"
          aria-label="Toggle theme profile"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Metrics Container Bars Grid Layout Section */}
      <div className="absolute top-[18vh] left-0 right-0 h-[75vh] overflow-hidden">
        <h1 className="text-[7vh] ml-[10vw] mb-[7vh] font-bold tracking-tight">
          {titleText}
        </h1>

        {/* Year Progress metric */}
        <div className="ml-[10vw] mb-[1vh]">
          Year Progress: <span>{progress.year.percentage}</span>
        </div>
        <div
          className={`w-[80vw] border ml-[10vw] mb-[5vh] overflow-hidden ${
            barHeightClass
          } ${isDarkMode ? "border-white" : "border-black"}`}
        >
          <div
            className={`h-full transition-[width] ${transitionDuration} ${
              isDarkMode ? "bg-white" : "bg-black"
            }`}
            style={{ width: progress.year.width }}
          />
        </div>

        {/* Month Progress metric */}
        <div className="ml-[10vw] mb-[1vh]">
          Month Progress: <span>{progress.month.percentage}</span>
        </div>
        <div
          className={`w-[80vw] border ml-[10vw] mb-[5vh] overflow-hidden ${
            barHeightClass
          } ${isDarkMode ? "border-white" : "border-black"}`}
        >
          <div
            className={`h-full transition-[width] ${transitionDuration} ${
              isDarkMode ? "bg-white" : "bg-black"
            }`}
            style={{ width: progress.month.width }}
          />
        </div>

        {/* Day Progress metric */}
        <div className="ml-[10vw] mb-[1vh]">
          Day Progress: <span>{progress.day.percentage}</span>
        </div>
        <div
          className={`w-[80vw] border ml-[10vw] mb-[5vh] overflow-hidden ${
            barHeightClass
          } ${isDarkMode ? "border-white" : "border-black"}`}
        >
          <div
            className={`h-full transition-[width] ${transitionDuration} ${
              isDarkMode ? "bg-white" : "bg-black"
            }`}
            style={{ width: progress.day.width }}
          />
        </div>

        {/* Hour Progress metric */}
        <div className="ml-[10vw] mb-[1vh]">
          Hour Progress: <span>{progress.hour.percentage}</span>
        </div>
        <div
          className={`w-[80vw] border ml-[10vw] mb-[5vh] overflow-hidden ${
            barHeightClass
          } ${isDarkMode ? "border-white" : "border-black"}`}
        >
          <div
            className={`h-full transition-[width] ${transitionDuration} ${
              isDarkMode ? "bg-white" : "bg-black"
            }`}
            style={{ width: progress.hour.width }}
          />
        </div>

        {/* Minute Progress metric */}
        <div className="ml-[10vw] mb-[1vh]">
          Minute Progress: <span>{progress.minute.percentage}</span>
        </div>
        <div
          className={`w-[80vw] border ml-[10vw] mb-[5vh] overflow-hidden ${
            barHeightClass
          } ${isDarkMode ? "border-white" : "border-black"}`}
        >
          <div
            className={`h-full transition-[width] ${transitionDuration} ${
              isDarkMode ? "bg-white" : "bg-black"
            }`}
            style={{ width: progress.minute.width }}
          />
        </div>
      </div>
    </div>
  );
}
