"use client";

import { useEffect, useRef } from "react";

// ─── ScrambleText ─────────────────────────────────────────────────────────────
//
// Wraps a block of text in SplitText character spans. When the user hovers
// near a character, it scrambles briefly using GSAP's ScrambleText plugin
// before resolving back to the original letter. The effect radius and scramble
// characters are fully configurable via props.
//
// Props
// ────────────────────────────────────────────────────────────────────────────
// text             string    "Lorem ipsum…"   The paragraph content to render
// fontFamily       string    "Space Mono"     Google Font name (loaded via CDN)
// fontSize         string    "clamp(16px,4vw,40px)"  Responsive font-size
// fontWeight       string    "400"            CSS font-weight value
// textColor        string    "#ffffff"        Text color
// bgColor          string    "#000000"        Page / wrapper background color
// scrambleChars    string    ".:"             Characters used during scramble
// scrambleRadius   number    100              Pixel radius that triggers effect
// scrambleSpeed    number    0.5              SplitText scramble speed (0–1)
// marginX          string    "15vw"           Horizontal margin around the block
// maxWidth         string    "800px"          Max width of the text block
// ────────────────────────────────────────────────────────────────────────────

export default function ScrambleText({
  text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  fontFamily = "Space Mono",
  fontSize = "clamp(16px, 4vw, 40px)",
  fontWeight = "400",
  textColor = "#ffffff",
  bgColor = "#000000",
  scrambleChars = ".:",
  scrambleRadius = 100,
  scrambleSpeed = 0.5,
  marginX = "15vw",
  maxWidth = "800px",
}) {
  const paraRef = useRef(null);

  useEffect(() => {
    // ── helpers ──────────────────────────────────────────────────────────────
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    const loadFont = (family) => {
      const id = `gfont-${family.replace(/\s+/g, "-")}`;
      if (document.querySelector(`link[data-id="${id}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`;
      link.setAttribute("data-id", id);
      document.head.appendChild(link);
    };

    // ── bootstrap ────────────────────────────────────────────────────────────
    loadFont(fontFamily);

    // SplitText + ScrambleText ship in GSAP's bonus plugins bundle on the CDN
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/TextPlugin.min.js"),
    ])
      .then(() => {
        // GSAP's free CDN build ships SplitText & ScrambleText as globals when
        // the bonus plugins are loaded. Fall back gracefully if unavailable.
        const { gsap } = window;
        if (!gsap || !paraRef.current) return;

        gsap.config({ trialWarn: false });

        // ── Manual character split (no SplitText plugin needed) ──────────────
        // We store each character's original content in a data attribute so the
        // scramble always resolves back to the correct glyph.
        const para = paraRef.current;
        const originalText = para.textContent;

        // Build spans for every character including spaces
        para.innerHTML = originalText
          .split("")
          .map((ch) => {
            const safe = ch
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
            return `<span class="char" data-content="${safe}" style="will-change:transform;display:inline-block;">${safe}</span>`;
          })
          .join("");

        const chars = para.querySelectorAll(".char");

        // ── Pointer move handler ──────────────────────────────────────────────
        const handlePointerMove = (e) => {
          chars.forEach((char) => {
            // Skip whitespace spans — no visual payoff
            if (char.dataset.content === " ") return;

            const rect = char.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < scrambleRadius) {
              // Proximity-based duration: closer → faster scramble
              const duration = 1.2 - dist / scrambleRadius;

              // ScrambleText plugin (GSAP bonus) — if available
              if (gsap.plugins && gsap.plugins.scrambleText) {
                gsap.to(char, {
                  overwrite: true,
                  duration,
                  scrambleText: {
                    text: char.dataset.content,
                    chars: scrambleChars,
                    speed: scrambleSpeed,
                  },
                  ease: "none",
                });
              } else {
                // Lightweight fallback: quick opacity pulse
                gsap.to(char, {
                  overwrite: true,
                  duration: duration * 0.4,
                  opacity: 0.3,
                  yoyo: true,
                  repeat: 1,
                  ease: "none",
                  onComplete: () =>
                    gsap.set(char, { innerHTML: char.dataset.content, opacity: 1 }),
                });
              }
            }
          });
        };

        para.addEventListener("pointermove", handlePointerMove);

        // ── cleanup ───────────────────────────────────────────────────────────
        return () => {
          para.removeEventListener("pointermove", handlePointerMove);
          // Restore plain text to avoid stale spans on hot-reload
          if (paraRef.current) paraRef.current.innerHTML = originalText;
        };
      })
      .catch((e) => console.error("[ScrambleText] GSAP load failed:", e.message));
  }, [fontFamily, scrambleChars, scrambleRadius, scrambleSpeed]);

  return (
    // ── Wrapper — full-screen centred stage ───────────────────────────────────
    // bgColor is runtime-dynamic → inline style
    // Everything else is static layout → Tailwind
    <div
      className="w-full min-h-screen flex items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      {/* ── Text block ────────────────────────────────────────────────────────
          marginX / maxWidth / fontSize are all runtime props → inline styles.
          font-weight is also prop-driven → inline style.
          cursor-crosshair gives a visual cue that the area is interactive.
      */}
      <p
        ref={paraRef}
        className="cursor-crosshair leading-relaxed"
        style={{
          margin: `0 ${marginX}`,
          maxWidth,
          fontFamily: `"${fontFamily}", monospace`,
          fontSize,
          fontWeight,
          color: textColor,
        }}
      >
        {text}
      </p>
    </div>
  );
}