"use client";

import { useEffect, useRef, useState } from "react";

// ─── LangMatrixRain ──────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// charSize        number    18         Size of fonts and columns pitch spacing
// minSpeed        number    2          Minimum fall rate velocity multiplier
// maxSpeed        number    10         Maximum fall rate velocity multiplier
// baseHue         number    120        Matrix tone base HSB Hue (120 = Matrix Green)
// fontStyle       string    monospace  CSS Font styling family for string rendering
// fadeAlpha       number    0.08       Tail transparency trace (Lower = longer trail)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_LANGS = [
  "Hello World",
  "مرحبا بالعالم",
  "Salam Dünya",
  "Прывітанне Сусвет",
  "Здравей свят",
  "ওহে বিশ্ব",
  "Zdravo svijete",
  "Hola món",
  "Kumusta Kalibutan",
  "Ahoj světe",
  "Helo Byd",
  "Hej Verden",
  "Hallo Welt",
  "Γειά σου Κόσμε",
  "Hello World",
  "Hello World",
  "Hola Mundo",
  "Tere, Maailm",
  "Kaixo Mundua",
  "سلام دنیا",
  "Hei maailma",
  "Bonjour le monde",
  "Dia duit an Domhan",
  "Ola mundo",
  "હેલો વર્લ્ડ",
  "Sannu Duniya",
  "नमस्ते दुनिया",
  "Hello World",
  "Pozdrav svijete",
  "Bonjou Mondyal la",
  "Helló Világ",
  "Բարեւ աշխարհ",
  "Halo Dunia",
  "Ndewo Ụwa",
  "Halló heimur",
  "Ciao mondo",
  "שלום עולם",
  "こんにちは世界",
  "Hello World",
  "Გამარჯობა მსოფليო",
  "Сәлем Әлем",
  "សួស្តី​ពិភពលោក",
  "ಹಲೋ ವರ್ಲ್ಡ್",
  "안녕하세요 월드",
  "Ciao mondo",
  "ສະ​ບາຍ​ດີ​ຊາວ​ໂលກ",
  "Labas pasauli",
  "Sveika pasaule",
  "Hello World",
  "Kia Ora",
  "Здраво свету",
  "ഹലോ വേൾഡ്",
  "Сайн уу",
  "हॅलो वर्ल्ड",
  "Hai dunia",
  "Hello dinja",
  "မင်္ဂလာပါကမ္ဘာလောက",
  "नमस्कार संसार",
  "Hallo Wereld",
  "Hei Verden",
  "Moni Dziko Lapansi",
  "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨਿਆ",
  "Witaj świecie",
  "Olá Mundo",
  "Salut Lume",
  "Привет, мир",
  "හෙලෝ වර්ල්ඩ්",
  "Ahoj svet",
  "Pozdravljen, svet",
  "Waad salaaman tihiin",
  "Përshendetje Botë",
  "Здраво Свете",
  "Lefatše Lumela",
  "Halo Dunya",
  "Hej världen",
  "Salamu, Dunia",
  "ஹலோ வேர்ல்ட்",
  "హలో వరల్ഡ്",
  "Салом Ҷαҳон",
  "สวัสดีชาวโลก",
  "Kamusta Mundo",
  "Selam Dünya",
  "Привіт Світ",
  "ہیلو ورلڈ",
  "Salom Dunyo",
  "Chào thế giới",
  "העלא וועלט",
  "Mo ki O Ile Aiye",
  "你好，世界",
  "你好，世界",
  "你好，世界",
  "Sawubona Mhlaba",
];

export default function LangMatrixRain({
  charSize = 18,
  minSpeed = 1,
  maxSpeed = 3,
  baseHue = 120,
  fontStyle = "monospace",
  fadeAlpha = 0.08,
}) {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Context Configuration
    ctx.font = `${charSize}px ${fontStyle}`;
    ctx.textBaseline = "top";

    // Helper utilities mapping p5 mechanics into raw Canvas api
    const randomRange = (min, max) => Math.random() * (max - min) + min;
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // ─── OOP Character Node Module ───────────────────────────────────────────
    class Char {
      constructor(value, x, y, speed) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.speed = speed;
      }

      draw(isLitTail, isHead) {
        const flick = randomRange(0, 100);

        // Color targeting translated cleanly from original HSB rulesets
        if (isHead) {
          ctx.fillStyle = `hsla(${baseHue}, 30%, 100%, 1)`; // Bright white/pale head node
        } else if (isLitTail) {
          ctx.fillStyle = `hsla(${baseHue}, 100%, 90%, 1)`; // Illuminated trail segment
        } else {
          ctx.fillStyle = `hsla(${baseHue}, 100%, 50%, 1)`; // Default matrix stream state
        }

        if (flick < 10) {
          // 10% chance of flickering a random numerical glyph
          const numericalGlyph = Math.round(randomRange(0, 9));
          ctx.fillText(numericalGlyph, this.x, this.y);
        } else {
          ctx.fillText(this.value, this.x, this.y);
        }

        // Advance step positions down viewport
        this.y = this.y > h ? 0 : this.y + this.speed;
      }
    }

    // ─── OOP Column Stream Collection Module ─────────────────────────────────
    class Stream {
      constructor(text, x) {
        const textLen = text.length;
        const startY = randomRange(0, textLen * 4);
        const speed = randomRange(minSpeed, maxSpeed);
        this.chars = [];
        this.litRands = [];

        // Precompute static structural visibility variants to emulate rendering stability
        for (let i = textLen; i >= 0; i--) {
          const charY = (startY + textLen - i) * charSize;
          this.chars.push(new Char(text[i] || " ", x, charY, speed));
          this.litRands.push(randomRange(0, 100));
        }
      }

      draw() {
        this.chars.forEach((c, i) => {
          const litChance = this.litRands[i];
          const isLitTail = litChance < 30;
          const isHead = i === this.chars.length - 1;

          c.draw(isLitTail, isHead);
        });
      }
    }

    let streams = [];

    const initializeStreams = () => {
      streams = [];
      for (let i = 0; i < w; i += charSize) {
        streams.push(new Stream(randomChoice(DEFAULT_LANGS), i));
      }
    };

    // ─── Main Render Frame Loop ──────────────────────────────────────────────
    const renderLoop = () => {
      // Replaces p5's background(0, 0.4) transparent overlay trail formula
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
      ctx.fillRect(0, 0, w, h);

      streams.forEach((s) => s.draw());
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      ctx.font = `${charSize}px ${fontStyle}`;
      ctx.textBaseline = "top";
      initializeStreams();
    };

    // Boot pipeline instance
    initializeStreams();
    renderLoop();

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted, charSize, minSpeed, maxSpeed, baseHue, fontStyle, fadeAlpha]);

  if (!mounted) {
    return <div className="w-full h-screen bg-black" />;
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden select-none touch-none m-0 p-0 flex items-center justify-center">
      <canvas ref={canvasRef} className="block w-full h-full object-cover" />
    </div>
  );
}
