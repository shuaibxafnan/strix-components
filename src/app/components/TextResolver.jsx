"use client";

import { useEffect, useRef, useState } from "react";

// ─── TextResolver ────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// strings              array     [...]         Target text lines sequentially cycled
// characters           array     [...]         Pool of matrix characters used for noise generation
// timeout              number    5             Processing lifecycle frame separation timing (ms)
// iterations           number    10            Flash count before index settles into destination character
// delayBetweenStrings  number    1000          Delay window (ms) before starting the next string
// textColor            string    "text-[#eee]" Tailwind class tracking presentation font hex values
// fontClass            string    "font-sans"   Target element typography style pattern declaration
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_STRINGS = [
  "Oh thank god, you're alright.",
  "You know, being Caroline taught me a valuable lesson. I thought you were my greatest enemy. When all along you were my best friend.",
  "The surge of emotion that shot through me when I saved your life taught me an even more valuable lesson: where Caroline lives in my brain.",
  "Goodbye, Caroline.",
  "You know, deleting Caroline just now taught me a valuable lesson. The best solution to a problem is usually the easiest one. And I'll be honest.",
  "Killing you? Is hard.",
  "You know what my days used to be like? I just tested. Nobody murdered me. Or put me in a potato. Or fed me to birds. I had a pretty good life.",
  "And then you showed up. You dangerous, mute lunatic. So you know what?",
  "You win.",
  "Just go.",
  "It's been fun. Don't come back.",
  "......",
];

const DEFAULT_GLYPHS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "x",
  "y",
  "z",
  "#",
  "%",
  "&",
  "-",
  "+",
  "_",
  "?",
  "/",
  "\\",
  "=",
];

export default function TextResolver({
  strings = DEFAULT_STRINGS,
  characters = DEFAULT_GLYPHS,
  timeout = 5,
  iterations = 10,
  delayBetweenStrings = 1000,
  textColor = "text-[#eee]",
  fontClass = "font-sans",
}) {
  const [displayText, setDisplayText] = useState("");
  const stateRef = useRef({
    counter: 0,
    offset: 0,
    currentIterations: 0,
    timerId: null,
    phase: "RESOLVING_CHARACTER", // "RESOLVING_CHARACTER" | "RANDOMIZING" | "WAITING"
  });

  useEffect(() => {
    // Escape early if strings list is intentionally cleared out
    if (!strings || strings.length === 0) return;

    const getRandomInteger = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const getRandomCharacter = () => {
      return characters[getRandomInteger(0, characters.length - 1)];
    };

    const processResolutionLoop = () => {
      const currentState = stateRef.current;
      const currentTargetString = strings[currentState.counter];

      // Terminal safety condition: complete sentence resolution achieved
      if (currentState.offset > currentTargetString.length) {
        currentState.timerId = setTimeout(() => {
          currentState.counter = (currentState.counter + 1) % strings.length;
          currentState.offset = 0;
          currentState.currentIterations = iterations;
          processResolutionLoop();
        }, delayBetweenStrings);
        return;
      }

      const partialString = currentTargetString.substring(
        0,
        currentState.offset,
      );

      if (currentState.currentIterations >= 0) {
        if (currentState.currentIterations === 0) {
          setDisplayText(partialString);
          currentState.offset += 1;
          currentState.currentIterations = iterations;
        } else {
          const noiseGlyph =
            partialString.length > 0 ? getRandomCharacter() : "";
          const outputWithNoise =
            partialString.substring(0, Math.max(0, partialString.length - 1)) +
            noiseGlyph;
          setDisplayText(outputWithNoise);
        }

        currentState.currentIterations -= 1;
        currentState.timerId = setTimeout(processResolutionLoop, timeout);
      }
    };

    // Initialize layout state values cleanly upon compilation
    stateRef.current.currentIterations = iterations;
    processResolutionLoop();

    // Context teardown cleanly flushing out stacked asynchronous cycles
    return () => {
      if (stateRef.current.timerId) {
        clearTimeout(stateRef.current.timerId);
      }
    };
  }, [strings, characters, timeout, iterations, delayBetweenStrings]);

  return (
    <div className="flex items-center justify-center w-full h-screen p-20 select-none bg-[#111111]">
      <h1
        className={`text-[4rem] font-light uppercase tracking-wide transition-all duration-700 ease-in-out ${textColor} ${fontClass}`}
      >
        {displayText}
      </h1>
    </div>
  );
}
