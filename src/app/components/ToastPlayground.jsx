"use client";

import { useState, useEffect } from "react";

// ─── ToastPlayground ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// initialTheme         string   "cyber"         Default active theme variant ('cyber' | 'stealth' | 'neo-brutal' | 'liquid-glass' | 'toxic')
// initialAnimation     string   "glitch-slide"  Default entrance animation behavior ('glitch-slide' | 'elastic-pop' | 'dissolve' | 'axis-flip' | 'warp')
// showBrandHeader      boolean  true            Toggle the experimental header typography layout
// maxToastWidth        string   "w-[340px]"     Tailwind sizing layout constraint for active notifications
// toastDuration        number   5500            Lifespan runtime duration of a single toast inside viewport array (ms)
// interactionSounds    boolean  false           Toggle audio feedback hooks on element click configurations
// ──────────────────────────────────────────────────────────────────────────

export default function ToastPlayground({
  initialTheme = "cyber",
  initialAnimation = "glitch-slide",
  showBrandHeader = true,
  maxToastWidth = "w-[340px]",
  toastDuration = 5500,
  interactionSounds = false,
}) {
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedAnimation, setSelectedAnimation] = useState(initialAnimation);
  const [toasts, setToasts] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const themes = [
    {
      id: "cyber",
      label: "ARCADE // 01",
      subtitle: "Retro-futuristic terminal cyan",
      icon: "▰",
    },
    {
      id: "stealth",
      label: "STEALTH // 02",
      subtitle: "Premium matte monochrome carbon",
      icon: "▱",
    },
    {
      id: "neo-brutal",
      label: "BRUTAL // 03",
      subtitle: "High-contrast raw typography",
      icon: "✖",
    },
    {
      id: "liquid-glass",
      label: "LIQUID // 04",
      subtitle: "Specular index refractive layer",
      icon: "⚯",
    },
    {
      id: "toxic",
      label: "TOXIC // 05",
      subtitle: "Saturated high-frequency overdrive",
      icon: "☣",
    },
  ];

  const animations = [
    { id: "glitch-slide", label: "GLITCH SLIDE", speed: "0.45s", icon: "↴" },
    { id: "elastic-pop", label: "ELASTIC POP", speed: "0.6s", icon: "⤢" },
    { id: "dissolve", label: "DISSOLVE", speed: "0.3s", icon: "◌" },
    { id: "axis-flip", label: "AXIS FLIP", speed: "0.5s", icon: "↷" },
    { id: "warp", label: "SPACE WARP", speed: "0.4s", icon: "⚡" },
  ];

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
    } catch (e) {}
  };

  const triggerToast = () => {
    playClickSound();
    const id = Date.now() + Math.random();
    const activeThemeObj = themes.find((t) => t.id === selectedTheme);

    const newToast = {
      id,
      theme: selectedTheme,
      animation: selectedAnimation,
      label: activeThemeObj?.label || "SYSTEM NOTIFICATION",
      text: `TRANS_ID//${Math.floor(Math.random() * 90000 + 10000)} • Loaded via engineering state logic successfully.`,
    };

    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toastDuration);
  };

  if (!isMounted) return null;

  return (
    <div className="w-full min-h-screen bg-[#090a0c] text-[#f4f4f6] selection:bg-[#fff] selection:text-black font-sans antialiased p-6 md:p-16 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Blueprint Grid System Overlay Lineage */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141619_1px,transparent_1px),linear-gradient(to_bottom,#141619_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-[1100px] mx-auto z-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start mt-4">
        <div className="space-y-12">
          {/* Brand Experimental Typography Header */}
          {showBrandHeader && (
            <div className="border-b border-[#1c1f24] pb-8 relative">
              <span className="text-[10px] tracking-[0.3em] font-mono text-[#4b525d] block mb-2 uppercase">
                Interactive Lab Matrix // Vol. 26
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-[#e2e8f0] to-[#4b525d]">
                Toast Engine.
              </h1>
              <div className="absolute bottom-0 right-0 translate-y-1/2 bg-[#090a0c] px-3 font-mono text-[10px] text-[#0ff]/70 border border-[#1c1f24]">
                SYS_READY // 2026
              </div>
            </div>
          )}

          {/* Selector Interface Matrix */}
          <div className="space-y-10">
            {/* Theme Module Selector */}
            <div>
              <div className="flex justify-between items-baseline mb-4 border-b border-[#1c1f24] pb-1.5">
                <h2 className="font-mono text-xs tracking-[0.2em] text-[#8690a0] uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0ff] block animate-pulse" />{" "}
                  01 // Configuration Skin
                </h2>
                <span className="font-mono text-[10px] text-[#4b525d]">
                  [{selectedTheme.toUpperCase()}]
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedTheme(theme.id);
                    }}
                    className={`group text-left px-5 py-4 border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                      selectedTheme === theme.id
                        ? "bg-[#141619] border-white text-white"
                        : "bg-transparent border-[#1c1f24] text-[#8690a0] hover:border-[#383f49] hover:text-white"
                    }`}
                  >
                    {selectedTheme === theme.id && (
                      <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[#0ff] to-purple-600" />
                    )}
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs ${selectedTheme === theme.id ? "text-[#0ff]" : "text-[#4b525d]"}`}
                      >
                        {theme.icon}
                      </span>
                      <div>
                        <div className="font-mono text-xs font-bold tracking-wider">
                          {theme.label}
                        </div>
                        <div className="text-[11px] text-[#4b525d] mt-0.5 group-hover:text-[#717b8a] transition-colors">
                          {theme.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Core Selection Grid */}
            <div>
              <div className="flex justify-between items-baseline mb-4 border-b border-[#1c1f24] pb-1.5">
                <h2 className="font-mono text-xs tracking-[0.2em] text-[#8690a0] uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0f0] block" /> 02 //
                  Velocity Profile
                </h2>
                <span className="font-mono text-[10px] text-[#4b525d]">
                  [{selectedAnimation.toUpperCase()}]
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedAnimation(anim.id);
                    }}
                    className={`flex flex-col items-center justify-center p-4 border transition-all duration-150 cursor-pointer text-center group ${
                      selectedAnimation === anim.id
                        ? "bg-white text-black border-white"
                        : "bg-transparent border-[#1c1f24] text-[#8690a0] hover:bg-[#0e1012] hover:border-[#383f49]"
                    }`}
                  >
                    <span className="font-mono text-base mb-1 transform group-hover:scale-110 transition-transform">
                      {anim.icon}
                    </span>
                    <span className="font-mono text-[10px] tracking-tight font-bold block">
                      {anim.label.split(" ")[0]}
                    </span>
                    <span className="text-[9px] opacity-40 font-mono mt-0.5 block">
                      {anim.speed}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Trigger Deck */}
        <div className="lg:sticky lg:top-16 bg-[#0c0e11] border border-[#1c1f24] p-6 lg:p-8 space-y-6 self-stretch flex flex-col justify-center relative">
          <div className="space-y-2">
            <div className="font-mono text-xs text-[#8690a0] tracking-wide uppercase">
              Runtime Output Simulator
            </div>
            <p className="text-xs text-[#4b525d] leading-relaxed">
              Compile selected attributes into memory stack arrays to observe
              immediate structural frame behavior layout instantly inside
              sandbox environment workspace.
            </p>
          </div>
          <button
            onClick={triggerToast}
            className="w-full relative group bg-gradient-to-r from-white via-[#f4f4f6] to-[#dcdce1] text-black font-mono text-xs font-black tracking-[0.15em] uppercase py-4 px-6 shadow-2xl transition-all duration-200 active:scale-[0.99] cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#090a0c] transform translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-[#1c1f24]" />
            Execute Sequence
          </button>
        </div>
      </div>

      {/* Experimental Dynamic Toast Container Hub */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((toast) => {
          let themeClasses = "bg-[#111317] border-[#22272f] text-white";
          let elementUnderline = "bg-[#4b525d]";

          if (toast.theme === "cyber") {
            themeClasses =
              "bg-[#0b0f19] border-[#0ff]/30 text-[#e2e8f0] [box-shadow:0_10px_30px_rgba(0,255,255,0.05)]";
            elementUnderline = "bg-gradient-to-r from-[#0ff] to-blue-500";
          } else if (toast.theme === "stealth") {
            themeClasses = "bg-[#0f1011] border-[#262930] text-[#a0a5b0]";
            elementUnderline = "bg-[#262930]";
          } else if (toast.theme === "neo-brutal") {
            themeClasses =
              "bg-white border-4 border-black text-black font-mono !rounded-none [box-shadow:6px_6px_0px_#000]";
            elementUnderline = "bg-black h-[2px]";
          } else if (toast.theme === "liquid-glass") {
            themeClasses =
              "bg-white/[0.03] border border-white/10 text-white backdrop-blur-[24px] [box-shadow:0_20px_50px_rgba(0,0,0,0.5)]";
            elementUnderline = "bg-white/20";
          } else if (toast.theme === "toxic") {
            themeClasses =
              "bg-black border-[#0f0] text-[#0f0] font-mono [text-shadow:0_0_5px_#0f0]";
            elementUnderline = "bg-[#0f0]";
          }

          const speedConfig =
            animations.find((a) => a.id === toast.animation)?.speed || "0.4s";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 border relative overflow-hidden flex flex-col gap-2 ${maxToastWidth} ${themeClasses}`}
              style={{
                animationName: toast.animation,
                animationDuration: speedConfig,
                animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                animationFillMode: "both",
              }}
            >
              {/* Internal Accent Header Tag */}
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] tracking-widest uppercase opacity-60">
                  {toast.label}
                </span>
                <span className="font-mono text-[9px] opacity-30">■</span>
              </div>

              {/* Toast Narrative Body content */}
              <p className="text-xs font-mono leading-relaxed tracking-tight break-words">
                {toast.text}
              </p>

              {/* Layout Base Accent Rule Line */}
              <div className={`w-full h-[1px] mt-1 ${elementUnderline}`} />
            </div>
          );
        })}
      </div>

      {/* Structural Custom Architectural Keyframes */}
      <style jsx global>{`
        @keyframes img-glitch {
          0% {
            clip-path: inset(40% 0 61% 0);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
          }
          40% {
            clip-path: inset(15% 0 80% 0);
          }
          60% {
            clip-path: inset(80% 0 5% 0);
          }
          80% {
            clip-path: inset(3% 0 92% 0);
          }
          100% {
            clip-path: inset(40% 0 61% 0);
          }
        }
        @keyframes glitch-slide {
          0% {
            opacity: 0;
            transform: translateY(20px) skewX(-8deg);
            filter: brightness(2);
          }
          60% {
            opacity: 0.9;
            transform: translateY(-2px) skewX(2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) skewX(0);
            filter: brightness(1);
          }
        }
        @keyframes elastic-pop {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(30px);
          }
          60% {
            transform: scale(1.03) translateY(-4px);
          }
          80% {
            transform: scale(0.99);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes dissolve {
          0% {
            opacity: 0;
            filter: blur(4px) saturate(0);
          }
          100% {
            opacity: 1;
            filter: blur(0) saturate(1);
          }
        }
        @keyframes axis-flip {
          0% {
            opacity: 0;
            transform: perspective(600px) rotateX(-45deg);
            transform-origin: bottom;
          }
          100% {
            opacity: 1;
            transform: perspective(600px) rotateX(0deg);
            transform-origin: bottom;
          }
        }
        @keyframes warp {
          0% {
            opacity: 0;
            transform: scaleX(0.3) translateX(40px);
            filter: contrast(3);
          }
          100% {
            opacity: 1;
            transform: scaleX(1) translateX(0);
            filter: contrast(1);
          }
        }
      `}</style>
    </div>
  );
}
