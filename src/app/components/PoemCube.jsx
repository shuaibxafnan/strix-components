"use client";

import { useEffect, useRef } from "react";

// ─── PoemCube ─────────────────────────────────────────────────────────────────
//
// A 3D CSS cube that scrolls poem text across its left / back / right faces,
// with a blurred reflection below, layered over a background + foreground image
// pair, a slow zoom and a cycling hue-rotate overlay.
//
// Props
// ────────────────────────────────────────────────────────────────────────────
// backgroundImage  string  (drive url)   URL of the static background image
// foregroundImage  string  (drive url)   URL of the image layered in front
//                                        (animates to blur over scrollDuration)
//
// poemHtml         string  KIPLING       Inner HTML for the poem. Use <span>
//                                        tags to colour accent words.
// accentColor      string  "red"         CSS colour for <span> highlights
// textColor        string  "#fff"        Base poem text colour
// fontFamily       string  "Bebas Neue"  Google Font name (CDN-loaded)
// fontSize         string  "calc(6em + (190px / 10) * 0.7)"  CSS font-size
//
// cardWidth        number  1000          Content area width in px
// cardHeight       number  562           Content area height in px
// borderRadius     number  40            Content border-radius in px
//
// cubeW            number  870           Cube + face width in px
// cubeH            number  190           Cube + face height in px
// cubeDepth        number  435           Half-depth = translateZ distance in px
//
// hueColor         string  "#1e5799"     Hue overlay base colour
// hueColor2        string  "#7db9e8"     Hue overlay radial edge colour
// hueRotateMax     number  100           Max hue-rotate degrees in the cycle
// hueCycleDuration number  8             Hue cycle duration in seconds
//
// scrollDuration   number  200           Seconds for text scroll + all slow anims
// zoomEnd          number  2.5           Final scale of the slow zoom-in
// ────────────────────────────────────────────────────────────────────────────

const KIPLING_HTML = `<p>If you can <span>keep</span> your head when all about you    
Are <span>losing</span> theirs and <span>blaming</span> it on you; 
If you can <span>trust</span> yourself when all men <span>doubt</span> you,    
But make <span>allowance</span> for their doubting too; 
If you can <span>wait</span> and not be tired by waiting,    
Or, being <span>lied</span> about, don't deal in <span>lies</span>, 
Or, being <span>hated</span>, don't give way to <span>hating</span>,    
And yet don't look too good, nor talk too wise;
If you can <span>dream</span>—and not make dreams your <span>master</span>; 
If you can <span>think</span>—and not make thoughts your <span>aim</span>; 
If you can meet with <span>triumph</span> and <span>disaster</span>    
And treat those two <span>impostors</span> just the same; 
If you can bear to hear the <span>truth</span> you've spoken    
<span>Twisted</span> by knaves to make a <span>trap</span> for fools, 
Or watch the things you gave your life to <span>broken</span>,    
And <span>stoop</span> and build 'em up with wornout tools;
If you can make one <span>heap</span> of all your <span>winnings</span>    
And <span>risk</span> it on one turn of pitch-and-toss, 
And <span>lose</span>, and start again at your beginnings    
And never breathe a word about your <span>loss</span>; 
If you can <span>force</span> your heart and nerve and <span>sinew</span>    
To <span>serve</span> your turn long after they are gone, 
And so <span>hold on</span> when there is nothing in you    
Except the <span>Will</span> which says to them: "Hold on";
If you can <span>talk</span> with crowds and keep your <span>virtue</span>,    
Or <span>walk</span> with kings—nor lose the common <span>touch</span>; 
If neither <span>foes</span> nor loving friends can hurt you;    
If all men <span>count</span> with you, but none too much; 
If you can fill the unforgiving <span>minute</span> 
With sixty seconds' worth of distance <span>run</span>—    
Yours is the <span>Earth</span> and everything that's in it, 
And—which is more—you'll be a <span>Man</span>, my son!     -Rudyard Kipling</p>`;

export default function PoemCube({
  backgroundImage = "https://drive.google.com/thumbnail?id=1_ZMV_LcmUXLsRokuz6WXGyN9zVCGfAHp&sz=w1920",
  foregroundImage = "https://drive.google.com/thumbnail?id=1eGqJskQQgBJ67myGekmo4YfIVI3lfDTm&sz=w1920",
  poemHtml = KIPLING_HTML,
  accentColor = "red",
  textColor = "#fff",
  fontFamily = "Bebas Neue",
  fontSize = "calc(6em + (190px / 10) * 0.7)",
  cardWidth = 1000,
  cardHeight = 562,
  borderRadius = 40,
  cubeW = 870,
  cubeH = 190,
  cubeDepth = 435,
  hueColor = "#1e5799",
  hueColor2 = "#7db9e8",
  hueRotateMax = 100,
  hueCycleDuration = 8,
  scrollDuration = 200,
  zoomEnd = 2.5,
}) {
  const contentRef = useRef(null);

  // ── Responsive scale: shrink below cardWidth ──────────────────────────────
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const adjust = () => {
      const vw = window.innerWidth;
      const scale = vw < cardWidth ? (vw / cardWidth) * 0.8 : 1;
      content.style.transform = `scale(${scale})`;
    };

    adjust();
    window.addEventListener("resize", adjust);
    return () => window.removeEventListener("resize", adjust);
  }, [cardWidth]);

  // ── Google Font loader ────────────────────────────────────────────────────
  useEffect(() => {
    const id = `gfont-${fontFamily.replace(/\s+/g, "-")}`;
    if (document.querySelector(`link[data-id="${id}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}&display=swap`;
    link.setAttribute("data-id", id);
    document.head.appendChild(link);
  }, [fontFamily]);

  // ── Derived keyframe end positions ───────────────────────────────────────
  // The original scrolls each face independently. Left starts at 480px and
  // scrolls 54480px total; back at -390px → -54870px; right at -1260px → -55740px.
  // These are hardcoded in the original — we expose scrollDuration as the
  // only scroll prop since the end positions are tied to the poem length.
  const sd = `${scrollDuration}s`;

  return (
    <>
      {/* ── Injected styles ──────────────────────────────────────────────────
          All values that depend on runtime props (cubeW, cubeH, cubeDepth,
          cardWidth, cardHeight, borderRadius, colors, durations) live here.
          Static structural rules use Tailwind on the JSX below.             */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}&display=swap');

        /* ── Slow animations ── */
        @keyframes pc-zoom-in {
          0%   { transform: scale(1); }
          100% { transform: scale(${zoomEnd}); }
        }
        @keyframes pc-blur {
          0%   { filter: blur(0px); }
          100% { filter: blur(3px); }
        }
        @keyframes pc-brightness {
          0%   { filter: brightness(1) contrast(1); }
          100% { filter: brightness(0.8) contrast(1.3); }
        }

        /* ── Hue overlay cycle ── */
        @keyframes pc-hue {
          0%,100% { filter: hue-rotate(0deg); }
          50%     { filter: hue-rotate(${hueRotateMax}deg); }
        }

        /* ── Text scroll per face ──
           Matches original: each face starts at a different margin-left and
           scrolls the full poem width over scrollDuration. The offsets are
           baked to match the original's 54k-range end values.               */
        @keyframes pc-left  { 100% { margin-left: -54000px; } }
        @keyframes pc-back  { 100% { margin-left: -54870px; } }
        @keyframes pc-right { 100% { margin-left: -55740px; } }

        /* ── Cube faces ── */
        .pc-face {
          position: absolute;
          display: flex;
          align-items: center;
          overflow: hidden;
          width: ${cubeW}px;
          height: ${cubeH}px;
          background: transparent;
          border: 0 solid #000;
          opacity: 0.5;
        }

        .pc-face-top {
          width: ${cubeW}px;
          height: ${cubeW}px;
          transform: translateY(-${cubeDepth}px) rotateX(90deg) scaleY(-1);
        }
        .pc-face-bottom {
          width: ${cubeW}px;
          height: ${cubeW}px;
          transform: translateY(-245px) rotateX(-90deg) scaleY(-1);
        }
        .pc-face-front {
          transform: translateZ(${cubeDepth}px);
          display: none;
        }
        .pc-face-back {
          transform: translateZ(-${cubeDepth}px) rotateY(180deg) scaleX(-1);
        }
        .pc-face-left {
          transform: translateX(-${cubeDepth}px) rotateY(-90deg) scaleX(-1);
        }
        .pc-face-right {
          transform: translateX(${cubeDepth}px) rotateY(90deg) scaleX(-1);
        }

        /* Reflection variants — flipped Y on each face */
        .pc-reflect .pc-face-back  { transform: translateZ(-${cubeDepth}px) rotateY(180deg) scaleX(-1) scaleY(-1); }
        .pc-reflect .pc-face-left  { transform: translateX(-${cubeDepth}px) rotateY(-90deg) scaleX(-1) scaleY(-1); }
        .pc-reflect .pc-face-right { transform: translateX(${cubeDepth}px) rotateY(90deg) scaleX(-1) scaleY(-1); }
        .pc-reflect p { transform: scaleY(70%); }

        /* ── Poem text ── */
        .pc-face p {
          white-space: nowrap;
          overflow: hidden;
          font-family: "${fontFamily}", sans-serif;
          font-weight: 400;
          font-size: ${fontSize};
          padding-top: 20px;
          color: ${textColor};
        }
        .pc-face span { color: ${accentColor}; }

        /* Scrolling margins per face */
        .pc-face-left p  { margin-left: 480px;   animation: ${sd} linear infinite pc-left; }
        .pc-face-back p  { margin-left: -390px;  animation: ${sd} linear infinite pc-back; }
        .pc-face-right p { margin-left: -1260px; animation: ${sd} linear infinite pc-right; }
      `}</style>

      {/* ── Page shell ───────────────────────────────────────────────────────
          Black full-screen, items centred — matches original body.          */}
      <div className="w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
        {/* ── Scaled content card ───────────────────────────────────────────
            Fixed cardWidth × cardHeight, scales down on small viewports.
            borderRadius and dimensions are runtime props → inline style.    */}
        <div
          ref={contentRef}
          className="relative overflow-hidden"
          style={{
            width: cardWidth,
            height: cardHeight,
            borderRadius,
            // brightness animation matched to original .content keyframe
            animation: `pc-brightness ${sd} linear infinite`,
          }}
        >
          {/* ── Container-full: holds images + cubes, zooms in slowly ──── */}
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              width: cardWidth,
              height: cardHeight,
              animation: `pc-zoom-in ${sd} linear infinite`,
            }}
          >
            {/* ── z-index stack (low → high) ──────────────────────────────
                1  background image  — static scene
                2  hue overlay       — colour cast, mix-blend-mode overlay
                3  cube + reflection — scrolling text on 3D faces
                5  foreground image  — figure silhouette, always on top      */}

            {/* 1 — Background image */}
            <img
              src={backgroundImage}
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ width: cardWidth, zIndex: 1 }}
            />

            {/* 2 — Hue overlay: above bg, below cube */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                zIndex: 2,
                mixBlendMode: "overlay",
                background: `radial-gradient(ellipse at center, ${hueColor} 0%, ${hueColor2} 100%)`,
                animation: `pc-hue ${hueCycleDuration}s infinite`,
              }}
            />

            {/* 3 — Main cube */}
            <div
              className="flex items-center justify-center"
              style={{ zIndex: 3 }}
            >
              <div
                className="relative"
                style={{
                  width: cubeW,
                  height: cubeH,
                  transformStyle: "preserve-3d",
                  perspective: "480px",
                  perspectiveOrigin: "51% 70%",
                }}
              >
                <div className="pc-face pc-face-top" />
                <div className="pc-face pc-face-bottom" />
                {/* Text faces — poemHtml injected via dangerouslySetInnerHTML.
                    The HTML comes from the prop (default is the Kipling poem),
                    fully under the author's control — no user input path.    */}
                <div
                  className="pc-face pc-face-left"
                  dangerouslySetInnerHTML={{ __html: poemHtml }}
                />
                <div
                  className="pc-face pc-face-right"
                  dangerouslySetInnerHTML={{ __html: poemHtml }}
                />
                <div className="pc-face pc-face-front" />
                <div
                  className="pc-face pc-face-back"
                  dangerouslySetInnerHTML={{ __html: poemHtml }}
                />
              </div>
            </div>

            {/* 3 — Reflected cube (same z-level as main cube, behind figure) */}
            <div
              className="pc-reflect absolute flex items-center justify-center"
              style={{
                marginTop: 380,
                filter: "blur(10px)",
                zIndex: 3,
              }}
            >
              <div
                className="relative"
                style={{
                  width: cubeW,
                  height: cubeH,
                  transformStyle: "preserve-3d",
                  perspective: "480px",
                  perspectiveOrigin: "51% -30%",
                }}
              >
                <div className="pc-face pc-face-top" />
                <div className="pc-face pc-face-bottom" />
                <div
                  className="pc-face pc-face-left"
                  dangerouslySetInnerHTML={{ __html: poemHtml }}
                />
                <div
                  className="pc-face pc-face-right"
                  dangerouslySetInnerHTML={{ __html: poemHtml }}
                />
                <div className="pc-face pc-face-front" />
                <div
                  className="pc-face pc-face-back"
                  dangerouslySetInnerHTML={{ __html: poemHtml }}
                />
              </div>
            </div>

            {/* 5 — Foreground image: figure silhouette sits above everything.
                Slowly blurs over scrollDuration — same as original .boyImage */}
            <img
              src={foregroundImage}
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{
                width: cardWidth,
                zIndex: 5,
                animation: `pc-blur ${sd} linear infinite`,
              }}
            />
          </div>
          {/* end container-full */}
        </div>
        {/* end content card */}
      </div>
      {/* end page shell */}
    </>
  );
}
