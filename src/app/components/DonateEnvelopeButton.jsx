"use client";

import { useEffect, useState, useRef } from "react";

// ─── DonateButton ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// defaultLabel       string     'Donate'       Resting state button copy text
// thanksLabel        string     'Thank you!'  Completed fly-out text
// initialAmount      string     '$0,00'        Initial form input mask string value
// containerWidth     string     '132px'        Width of the interactive viewport boundary
// themeInputBg       string     '#4171FE'      Form envelop insert background color
// themeInputColor    string     '#FFFFFF'      Typed numeral font color hex
// themeButtonBg      string     '#FFFFFF'      Envelope/Resting button solid base body
// themeButtonHover   string     '#ECEFFC'      Background shade when hovering over un-open state
// themeTextColor     string     '#275EFE'      Primary typography text label fill hue
// themeLetterInner   string     '#CEDAFF'      Inner geometric envelope liner tint
// themeLetterTop     string     '#E0E8FF'      Flap interior color token
// themeBorderShadow  string     '#E5E9F3'      SVG structural separator edge trace drop
// ──────────────────────────────────────────────────────────────────────────

export default function DonateButton({
  defaultLabel = "Donate",
  thanksLabel = "Thank you!",
  initialAmount = "$0,00",
  containerWidth = "132px",
  themeInputBg = "#4171FE",
  themeInputColor = "#FFFFFF",
  themeButtonBg = "#FFFFFF",
  themeButtonHover = "#ECEFFC",
  themeTextColor = "#275EFE",
  themeLetterInner = "#CEDAFF",
  themeLetterTop = "#E0E8FF",
  themeBorderShadow = "#E5E9F3",
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [amount, setAmount] = useState(initialAmount);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Prevent initial server hydration mismatch mismatches safely
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Structural click listener mimicking your vanilla document logic safely scoped to React lifecycle
  useEffect(() => {
    if (!isMounted) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (!isSubmitted) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isMounted, isSubmitted]);

  // Handle local simulation of money masking logic securely on simple events
  const handleInputChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) val = "000";

    // Pad short inputs to ensure fractional format works
    while (val.length < 3) {
      val = "0" + val;
    }

    const integerPart = parseInt(val.slice(0, -2), 10).toString();
    const fractionalPart = val.slice(-2);

    // Formats into custom European monetary standard mask structure match ($X.XXX,XX)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setAmount(`$${formattedInteger},${fractionalPart}`);
  };

  const handleActionTrigger = (e) => {
    // Intercept default container clicks
    if (isSubmitted) return;

    if (isOpen) {
      // Secondary state submission click trigger
      setIsSubmitted(true);
    } else {
      // Open envelope wrapper interface drawer
      setIsOpen(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart =
            inputRef.current.selectionEnd = 10000;
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitted(true);
  };

  if (!isMounted) {
    return (
      <div
        className="h-[44px] bg-white/20 rounded-[6px] animate-pulse"
        style={{ width: containerWidth }}
      />
    );
  }

  // Reactive CSS execution token states variables map assignments
  const activeBackground =
    !isOpen && isHovered ? themeButtonHover : themeButtonBg;

  return (
    <div
      ref={containerRef}
      onClick={handleActionTrigger}
      style={{
        width: containerWidth,
        "--thanks-color": themeTextColor,
        "--button-color": themeTextColor,
        "--button-icon-color": themeTextColor,
        "--letter-inner": themeLetterInner,
        "--letter-inner-top": themeLetterTop,
        "--letter-border": themeBorderShadow,
        "--input-background": themeInputBg,
        "--input-color": themeInputColor,
        "--button-background": themeButtonBg,

        // Runtime interpolation blocks mapped from state shifts
        "--background": activeBackground,
        "--span-opacity": isOpen ? "0" : "1",
        "--span-opacity-delay": isOpen ? "0s" : "1.25s",
        "--letter-opacity": isOpen ? "1" : "0",
        "--letter-opacity-delay": isOpen ? ".2s" : "1.15s",
        "--letter-inside-opacity": isOpen ? "1" : "0",
        "--letter-inside-opacity-delay": isOpen ? ".4s" : "1.15s",
        "--border-radius": isOpen ? "2px" : "6px",
        "--border-radius-delay": isOpen ? "0s" : "1.15s",

        // Non-submitted vs Submitted dynamic transition chains
        "--input-y": isSubmitted ? "0px" : isOpen ? "-92px" : "0px",
        "--input-y-delay": isOpen && !isSubmitted ? ".9s" : ".25s",
        "--letter-top-y": isOpen && !isSubmitted ? "1px" : "0px",
        "--letter-top-rotate": isOpen && !isSubmitted ? "180deg" : "0deg",
        "--letter-top-rotate-delay": isOpen && !isSubmitted ? ".5s" : ".6s",
        "--letter-top-index": isOpen && !isSubmitted ? "0" : "2",
        "--letter-top-index-delay": isOpen && !isSubmitted ? ".9s" : ".6s",
        "--letter-background":
          isOpen && !isSubmitted
            ? "var(--letter-inner-top)"
            : "var(--button-background)",
        "--letter-background-delay": isOpen && !isSubmitted ? ".65s" : ".75s",
        "--input-scale-background": isOpen && !isSubmitted ? "1" : "0.6",
        "--input-scale-background-delay":
          isOpen && !isSubmitted ? "1.1s" : "0s",
        "--input-scale-line": isOpen && !isSubmitted ? "1" : "0",
        "--input-scale-line-delay": isOpen && !isSubmitted ? "1.1s" : "0s",
      }}
      className={`relative text-center select-none font-mono font-medium text-[14px] leading-[20px] transition-all ${
        isOpen ? "open" : ""
      } ${isSubmitted ? "submit" : ""}`}
    >
      {/* Dynamic Overlay Congratulations Label */}
      <div className="absolute left-0 right-0 top-[12px] z-0 font-medium text-[16px] text-[var(--thanks-color)] pointer-events-none">
        {thanksLabel}
      </div>

      {/* Primary Structural Interactive Envelop Button Frame */}
      <button
        type="button"
        className={`relative block w-full m-0 border-none outline-none py-[12px] px-0 cursor-pointer text-[var(--button-color)] rounded-[var(--border-radius,6px)] [transform-style:preserve-3d] origin-left [-webkit-appearance:none] transition-[background,border-radius] duration-200 ease-linear ${
          isSubmitted ? "animate-[move_0.4s_linear_1.1s_forwards]" : ""
        }`}
        style={{
          background: "var(--background, var(--button-background))",
          transitionDelay: "0s, var(--border-radius-delay, 1.15s)",
        }}
      >
        {/* Envelope Base Flap - Triangle Generated via Border Trick */}
        <div
          className="absolute left-[2px] bottom-0 w-0 h-0 border-solid border-t-0 border-x-[64px] border-b-[32px] border-x-transparent border-b-[var(--button-background)] opacity-[var(--letter-opacity,0)] transition-opacity duration-200 [filter:drop-shadow(0_-1px_0_var(--letter-border))] pointer-events-none"
          style={{ transitionDelay: "var(--letter-opacity-delay, 1.15s)" }}
        />

        {/* Envelope Liner Content Anchor Pocket */}
        <div
          className="absolute left-[-40px] right-[-40px] bottom-[16px] h-[120px] opacity-[var(--letter-inside-opacity,0)] transition-opacity duration-0 [clip-path:polygon(0_0,100%_0,100%_72px,50%_100%,0_72px)] pointer-events-auto"
          style={{
            transitionDelay: "var(--letter-inside-opacity-delay, 1.15s)",
          }}
        >
          {/* Internal Colored Envelope Card Sheet Wall */}
          <div className="absolute left-0 right-0 bottom-0 h-[28px] bg-[var(--letter-inner)]" />

          {/* Core Interactive Numeric Value Capture Module Form */}
          <form
            onSubmit={handleSubmitForm}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 bottom-[-12px] m-0 w-[200px] [transform-style:preserve-3d] transition-transform duration-300 ease-out"
            style={{
              transform: "translate(-50%, var(--input-y, 0)) translateZ(0)",
              transitionDelay: "var(--input-y-delay, .25s)",
            }}
          >
            {/* Input Background Block Sheath Layer */}
            <div
              className="absolute inset-0 z-0 bg-[var(--input-background)] [backface-visibility:hidden] transition-all duration-250 ease-linear"
              style={{
                transform:
                  "scaleX(var(--input-scale-background, 0.6)) translateZ(0)",
                transitionDelay: "var(--input-scale-background-delay, 0s)",
              }}
            />

            {/* Input Underscore Indicator Line Accenting Layout */}
            <div
              className="absolute left-0 right-0 bottom-0 h-[1px] bg-[var(--input-line)] opacity-50 [backface-visibility:hidden] transition-all duration-250 ease-linear"
              style={{
                transform: "scaleX(var(--input-scale-line, 0)) translateZ(0)",
                transitionDelay: "var(--input-scale-line-delay, 0s)",
              }}
            />

            <input
              ref={inputRef}
              type="text"
              value={amount}
              onChange={handleInputChange}
              disabled={!isOpen || isSubmitted}
              className="relative z-10 block w-full m-0 p-[8px_0] border-none outline-none font-inherit text-center bg-transparent text-[var(--input-color)] [-webkit-appearance:none]"
            />
          </form>
        </div>

        {/* Envelope Top Interactive Flap Element Overlay */}
        <div
          className="absolute left-[2px] top-0 z-[var(--letter-top-index,2)] w-0 h-0 border-solid border-x-[64px] border-b-0 border-t-[28px] border-x-transparent opacity-[var(--letter-opacity,0)] origin-top [filter:drop-shadow(0_var(--letter-blur,1px)_0_var(--letter-border))]"
          style={{
            borderTopColor:
              "var(--letter-background, var(--button-background))",
            transform:
              "translateY(var(--letter-top-y, 0)) rotateX(var(--letter-top-rotate, 0deg)) translateZ(0)",
            transition:
              "z-index 0s linear var(--letter-top-index-delay, .6s), border-color .1s linear var(--letter-background-delay, .75s), opacity .2s linear var(--letter-opacity-delay, 1.15s), transform .3s linear var(--letter-top-rotate-delay, .6s)",
          }}
        />

        {/* Resting Button Foreground Labels Block */}
        <span
          className="relative block opacity-[var(--span-opacity,1)] transition-opacity duration-150 ease-linear"
          style={{ transitionDelay: "var(--span-opacity-delay, 1.25s)" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="inline-block w-[16px] h-[16px] stroke-[var(--button-icon-color)] stroke-[2.5] fill-none -translate-x-[4px] mt-[2px] vertical-top [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {defaultLabel}
        </span>
      </button>

      {/* Embedded Animation CSS Modules Frame */}
      <style jsx global>{`
        @keyframes move {
          20% {
            transform: translateX(-2px);
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(320px);
          }
        }
      `}</style>
    </div>
  );
}
