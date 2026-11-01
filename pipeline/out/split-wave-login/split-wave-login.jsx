"use client";

import { useEffect, useState } from "react";

export default function SplitWaveLogin({
  accentColor = "#9333EA",
  panelBg = "#ffffff",
  pageBg = "#fafafa",
  imageUrl = "https://images.unsplash.com/photo-1637611331620-51149c7ceb94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  title = "Welcome Back",
  subtitle = "Login to access your dashboard",
  emailLabel = "Email Address",
  passwordLabel = "Password",
  forgotLabel = "Forgot Password?",
  forgotHref = "#",
  submitLabel = "Sign In",
  registerPrompt = "Don't have an account?",
  registerLabel = "Register here",
  registerHref = "#",
  transitionDelayMs = 40,
  className = ""
}) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-full h-screen ${className}`} style={{ backgroundColor: pageBg }} />;
  }

  const renderWavyLabel = (text, valueString) => {
    const isActive = valueString.length > 0;
    return text.split("").map((letter, idx) => (
      <span
        key={idx}
        className="inline-block text-sm font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          transitionDelay: `${idx * transitionDelayMs}ms`,
          transform: isActive ? "translateY(-24px) scale(0.85)" : "translateY(0px) scale(1)",
          color: isActive ? accentColor : "#9ca3af",
          transformOrigin: "left center"
        }}
      >
        {letter === " " ? " " : letter}
      </span>
    ));
  };

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center p-4 antialiased font-sans ${className}`}
      style={{ backgroundColor: pageBg }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] max-w-md md:max-w-4xl w-full border border-gray-100"
        style={{ backgroundColor: panelBg }}
      >
        <div className="md:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{title}</h1>
            <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-7">
            <div className="relative w-full">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-b-2 border-gray-200 block w-full py-3 px-0 text-gray-900 placeholder-transparent focus:outline-none focus:border-b-2 transition-colors relative z-10"
              />
              <label className="absolute top-3 left-0 pointer-events-none flex z-0">
                {renderWavyLabel(emailLabel, email)}
              </label>
            </div>

            <div className="relative w-full">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-b-2 border-gray-200 block w-full py-3 px-0 text-gray-900 placeholder-transparent focus:outline-none focus:border-b-2 transition-colors relative z-10"
              />
              <label className="absolute top-3 left-0 pointer-events-none flex z-0">
                {renderWavyLabel(passwordLabel, password)}
              </label>
            </div>

            <div className="flex justify-end text-xs font-semibold">
              <a href={forgotHref} className="hover:underline transition-all opacity-80 hover:opacity-100" style={{ color: accentColor }}>
                {forgotLabel}
              </a>
            </div>

            <button
              className="relative group overflow-hidden w-full text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/10 active:scale-[0.99] hover:brightness-105 transition-all outline-none"
              style={{ backgroundColor: accentColor }}
            >
              <span className="relative z-10">{submitLabel}</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
            </button>

            <p className="text-center text-sm text-gray-500 pt-2 font-medium">
              {registerPrompt}{" "}
              <a href={registerHref} className="font-semibold hover:underline" style={{ color: accentColor }}>
                {registerLabel}
              </a>
            </p>
          </form>
        </div>

        <div
          className="hidden md:block md:col-span-5 bg-no-repeat bg-cover bg-center relative min-h-full order-1 md:order-2"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 backdrop-blur-[1px] bg-white/[0.02]" />
        </div>
      </div>

      <style jsx global>{`
        input:focus {
          border-bottom-color: ${accentColor} !important;
        }
        input:focus + label span {
          color: ${accentColor} !important;
          transform: translateY(-24px) scale(0.85) !important;
        }
      `}</style>
    </div>
  );
}
