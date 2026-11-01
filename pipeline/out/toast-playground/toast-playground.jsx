"use client";

import { useState, useEffect, useRef } from "react";

const THEMES = {
  cyber: {
    label: "ARCADE // 01",
    classes:
      "bg-[#0b0f19] border-[#0ff]/30 text-[#e2e8f0] [box-shadow:0_10px_30px_rgba(0,255,255,0.05)]",
    underline: "bg-gradient-to-r from-[#0ff] to-blue-500",
  },
  stealth: {
    label: "STEALTH // 02",
    classes: "bg-[#0f1011] border-[#262930] text-[#a0a5b0]",
    underline: "bg-[#262930]",
  },
  "neo-brutal": {
    label: "BRUTAL // 03",
    classes:
      "bg-white border-4 border-black text-black font-mono !rounded-none [box-shadow:6px_6px_0px_#000]",
    underline: "bg-black h-[2px]",
  },
  "liquid-glass": {
    label: "LIQUID // 04",
    classes:
      "bg-white/[0.03] border border-white/10 text-white backdrop-blur-[24px] [box-shadow:0_20px_50px_rgba(0,0,0,0.5)]",
    underline: "bg-white/20",
  },
  toxic: {
    label: "TOXIC // 05",
    classes:
      "bg-black border-[#0f0] text-[#0f0] font-mono [text-shadow:0_0_5px_#0f0]",
    underline: "bg-[#0f0]",
  },
};

const ANIMATIONS = {
  "glitch-slide": "0.45s",
  "elastic-pop": "0.6s",
  dissolve: "0.3s",
  "axis-flip": "0.5s",
  warp: "0.4s",
};

export default function ToastPlayground({
  variant = "cyber",
  animation = "glitch-slide",
  title = "Runtime Output Simulator",
  description = "Compile selected attributes into memory stack arrays to observe immediate structural frame behavior layout instantly inside sandbox environment workspace.",
  buttonLabel = "Execute Sequence",
  toastLabel = "",
  toastIdPrefix = "TRANS_ID//",
  toastMessage = "Loaded via engineering state logic successfully.",
  maxToastWidth = "w-[340px]",
  toastDuration = 5500,
  interactionSounds = false,
  panelBg = "#0c0e11",
  panelBorderColor = "#1c1f24",
  titleColor = "#8690a0",
  descriptionColor = "#4b525d",
  buttonTextColor = "#000000",
  className = "",
}) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef([]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach(clearTimeout);
    };
  }, []);

  const themeKey = THEMES[variant] ? variant : "cyber";
  const theme = THEMES[themeKey];
  const animKey = ANIMATIONS[animation] ? animation : "glitch-slide";

  const playClickSound = () => {
    if (!interactionSounds) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      osc.onended = () => ctx.close();
    } catch (e) {}
  };

  const triggerToast = () => {
    playClickSound();
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      theme: themeKey,
      animation: animKey,
      label: toastLabel || theme.label,
      text: `${toastIdPrefix}${Math.floor(Math.random() * 90000 + 10000)} • ${toastMessage}`,
    };

    setToasts((prev) => [...prev, newToast]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toastDuration);
    timers.current.push(timer);
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center p-4 sm:p-6 font-sans antialiased ${className}`}
    >
      <div
        className="w-full max-w-[380px] border p-6 lg:p-8 space-y-6 flex flex-col justify-center relative"
        style={{ backgroundColor: panelBg, borderColor: panelBorderColor }}
      >
        <div className="space-y-2">
          <div
            className="font-mono text-xs tracking-wide uppercase"
            style={{ color: titleColor }}
          >
            {title}
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        </div>
        <button
          onClick={triggerToast}
          style={{ color: buttonTextColor }}
          className="w-full relative group bg-gradient-to-r from-white via-[#f4f4f6] to-[#dcdce1] font-mono text-xs font-black tracking-[0.15em] uppercase py-4 px-6 shadow-2xl transition-all duration-200 active:scale-[0.99] cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        >
          {buttonLabel}
        </button>
      </div>

      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((toast) => {
          const t = THEMES[toast.theme];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 border relative overflow-hidden flex flex-col gap-2 max-w-[calc(100vw-2rem)] ${maxToastWidth} ${t.classes}`}
              style={{
                animationName: toast.animation,
                animationDuration: ANIMATIONS[toast.animation],
                animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                animationFillMode: "both",
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] tracking-widest uppercase opacity-60">
                  {toast.label}
                </span>
                <span className="font-mono text-[9px] opacity-30">■</span>
              </div>
              <p className="text-xs font-mono leading-relaxed tracking-tight break-words">
                {toast.text}
              </p>
              <div className={`w-full h-[1px] mt-1 ${t.underline}`} />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes glitch-slide {
          0% { opacity: 0; transform: translateY(20px) skewX(-8deg); filter: brightness(2); }
          60% { opacity: 0.9; transform: translateY(-2px) skewX(2deg); }
          100% { opacity: 1; transform: translateY(0) skewX(0); filter: brightness(1); }
        }
        @keyframes elastic-pop {
          0% { opacity: 0; transform: scale(0.88) translateY(30px); }
          60% { transform: scale(1.03) translateY(-4px); }
          80% { transform: scale(0.99); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes dissolve {
          0% { opacity: 0; filter: blur(4px) saturate(0); }
          100% { opacity: 1; filter: blur(0) saturate(1); }
        }
        @keyframes axis-flip {
          0% { opacity: 0; transform: perspective(600px) rotateX(-45deg); transform-origin: bottom; }
          100% { opacity: 1; transform: perspective(600px) rotateX(0deg); transform-origin: bottom; }
        }
        @keyframes warp {
          0% { opacity: 0; transform: scaleX(0.3) translateX(40px); filter: contrast(3); }
          100% { opacity: 1; transform: scaleX(1) translateX(0); filter: contrast(1); }
        }
      `}</style>
    </div>
  );
}
