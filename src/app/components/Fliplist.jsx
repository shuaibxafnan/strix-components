"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  {
    name: "Alexandra Chen",
    role: "Product Designer",
    avatar: "https://images.pexels.com/photos/35061233/pexels-photo-35061233.jpeg?w=200&fit=crop",
    tags: ["Figma", "Motion", "Research"],
    detail: "Led end-to-end design for three product launches, increasing user retention by 34%. Specialises in design systems and interaction design.",
  },
  {
    name: "Marcus Webb",
    role: "Frontend Engineer",
    avatar: "https://images.pexels.com/photos/15052472/pexels-photo-15052472.jpeg?w=200&fit=crop",
    tags: ["React", "TypeScript", "WebGL"],
    detail: "Eight years building performant web applications. Core contributor to the open-source component library used by 4 000+ projects.",
  },
  {
    name: "Leila Nasser",
    role: "Brand Strategist",
    avatar: "https://images.pexels.com/photos/30389345/pexels-photo-30389345.jpeg?w=200&fit=crop",
    tags: ["Identity", "Copy", "GTM"],
    detail: "Shaped the brand voice for eleven startups from seed to Series B. Former creative director at a global communications agency.",
  },
  {
    name: "Daniel Park",
    role: "Data Scientist",
    avatar: "https://images.pexels.com/photos/33674865/pexels-photo-33674865.jpeg?w=200&fit=crop",
    tags: ["Python", "ML", "Analytics"],
    detail: "Builds predictive models that power real-time personalisation. Previously at a leading fintech, reducing churn by 22% with ML.",
  },
  {
    name: "Sofia Reyes",
    role: "Art Director",
    avatar: "https://images.pexels.com/photos/6419332/pexels-photo-6419332.jpeg?w=200&fit=crop",
    tags: ["Print", "Art", "Campaign"],
    detail: "Award-winning director with work featured in Cannes and D&AD. Blends editorial instinct with a sharp commercial eye.",
  },
  {
    name: "James Okafor",
    role: "Motion Designer",
    avatar: "https://images.pexels.com/photos/36878627/pexels-photo-36878627.jpeg?w=200&fit=crop",
    tags: ["After Effects", "GSAP", "3D"],
    detail: "Crafts animations that tell stories — from micro-interactions to full title sequences. Collaborated with Netflix and Apple.",
  },
];

export default function FlipList({
  items = DEFAULT_ITEMS,

  // Layout — prop-driven, kept as inline styles
  maxWidth        = "520px",
  itemGap         = "10px",
  borderRadius    = "14px",
  padding         = "18px 20px",
  expandedPadding = "24px",

  // Colors — runtime values, kept as inline styles
  backgroundColor = "#0c0c0c",
  itemBackground  = "#141414",
  itemBorderColor = "rgba(255,255,255,0.06)",
  expandedBg      = "#181818",
  accentColor     = "#c9a96e",
  tagBackground   = "rgba(255,255,255,0.06)",
  tagColor        = "rgba(255,255,255,0.45)",

  // Typography — runtime font strings, kept as inline styles
  nameFont   = "'Cormorant Garamond', Georgia, serif",
  bodyFont   = "'DM Sans', system-ui, sans-serif",
  nameSize   = "1.15rem",
  roleSize   = "0.7rem",
  detailSize = "0.82rem",

  // Avatar
  avatarSize         = 44,
  avatarExpandedSize = 72,

  // Animation
  flipDuration = 0.45,

  className = "",
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const listRef  = useRef(null);
  const gsapRef  = useRef(null);
  const FlipRef  = useRef(null);

  useEffect(() => {
    (async () => {
      const g = await import("gsap");
      const f = await import("gsap/Flip");
      gsapRef.current = g.gsap;
      FlipRef.current = f.Flip;
      gsapRef.current.registerPlugin(FlipRef.current);
    })();
  }, []);

  const handleClick = (index) => {
    const gsap = gsapRef.current;
    const Flip = FlipRef.current;
    if (!gsap || !Flip || !listRef.current) return;

    const isSame    = index === expandedIndex;
    const nextIndex = isSame ? null : index;

    const allItems    = [...listRef.current.querySelectorAll(".fl-item")];
    const allChildren = [...listRef.current.querySelectorAll(".fl-item *")];
    const targets     = [...allItems, ...allChildren];

    const state = Flip.getState(targets);
    setExpandedIndex(nextIndex);

    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: flipDuration,
        ease: "power2.inOut",
        absolute: true,
        nested: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: flipDuration / 2, delay: flipDuration / 2 }),
        onLeave: (els) =>
          gsap.fromTo(els, { opacity: 1 }, { opacity: 0, duration: flipDuration / 2 }),
      });
    });
  };

  const flipMs = flipDuration * 1000;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400&display=swap');
        .fl-item { cursor: pointer; transition: background ${flipMs}ms ease, border-color ${flipMs}ms ease; }
        .fl-item:hover { border-color: rgba(255,255,255,0.12) !important; }
        .fl-tag { transition: none; }
      `}</style>

      {/* Root */}
      <div
        className={`w-full h-full flex items-start justify-center p-8 ${className}`}
        style={{ background: backgroundColor }}
      >
        <div className="w-full" style={{ maxWidth }}>

          {/* Header */}
          <div className="mb-9">
            <div className="flex flex-col gap-5">
              {/* Member count pill */}
              <span
                className="text-[0.62rem] tracking-[0.15em] rounded-[20px] px-2.5 py-[3px] w-fit border"
                style={{
                  fontFamily: bodyFont,
                  color:      accentColor,
                  background: "rgba(201,169,110,0.08)",
                  borderColor:"rgba(201,169,110,0.15)",
                }}
              >
                {items.length} members
              </span>

              {/* Big title */}
              <h2
                className="m-0 font-light leading-[0.9] tracking-[-0.03em] text-[#f0ece4]"
                style={{
                  fontFamily: nameFont,
                  fontSize:   "clamp(2.8rem, 8vw, 5rem)",
                }}
              >
                Team
              </h2>
            </div>
          </div>

          {/* List */}
          <ul
            ref={listRef}
            className="list-none p-0 m-0 flex flex-col"
            style={{ gap: itemGap }}
          >
            {items.map((item, i) => {
              const isExpanded = i === expandedIndex;

              return (
                <li
                  key={i}
                  className={`fl-item overflow-hidden ${
                    isExpanded
                      ? "flex flex-col items-start gap-4"
                      : "flex flex-row items-center gap-3.5"
                  }`}
                  onClick={() => handleClick(i)}
                  style={{
                    background:   isExpanded ? expandedBg : itemBackground,
                    border:       `1px solid ${itemBorderColor}`,
                    borderRadius,
                    padding:      isExpanded ? expandedPadding : padding,
                    boxShadow:    isExpanded
                      ? "0 12px 48px rgba(0,0,0,0.5)"
                      : "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* ── Expanded top row ── */}
                  {isExpanded && (
                    <div className="flex items-center gap-3.5 w-full">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="rounded-full object-cover object-top flex-shrink-0 border border-white/[0.08]"
                        style={{ width: avatarExpandedSize, height: avatarExpandedSize }}
                        draggable={false}
                      />
                      <div>
                        <h3
                          className="m-0 font-light text-[1.5rem] leading-[1.1] tracking-[-0.01em] text-[#f0ece4]"
                          style={{ fontFamily: nameFont }}
                        >
                          {item.name}
                        </h3>
                        <p
                          className="m-0 mt-[5px] font-normal tracking-[0.16em] uppercase opacity-80"
                          style={{
                            fontFamily: bodyFont,
                            fontSize:   roleSize,
                            color:      accentColor,
                          }}
                        >
                          {item.role}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Collapsed row ── */}
                  {!isExpanded && (
                    <>
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="rounded-full object-cover object-top flex-shrink-0 border border-white/[0.06]"
                        style={{ width: avatarSize, height: avatarSize }}
                        draggable={false}
                      />

                      <div className="flex-1 min-w-0">
                        <h3
                          className="m-0 font-light leading-[1.2] text-[#f0ece4] truncate"
                          style={{ fontFamily: nameFont, fontSize: nameSize }}
                        >
                          {item.name}
                        </h3>
                        <p
                          className="m-0 mt-[3px] font-normal tracking-[0.12em] uppercase text-white/30"
                          style={{ fontFamily: bodyFont, fontSize: roleSize }}
                        >
                          {item.role}
                        </p>
                      </div>

                      {/* Expand chevron */}
                      <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M2 4l3 3 3-3"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </>
                  )}

                  {/* ── Expanded detail ── */}
                  {isExpanded && (
                    <>
                      {/* Divider */}
                      <div className="w-full h-px bg-white/[0.06]" />

                      {/* Bio */}
                      <p
                        className="m-0 font-light leading-[1.7] text-[rgba(240,236,228,0.5)]"
                        style={{ fontFamily: bodyFont, fontSize: detailSize }}
                      >
                        {item.detail}
                      </p>

                      {/* Tags */}
                      {item.tags?.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {item.tags.map((tag, t) => (
                            <span
                              key={t}
                              className="fl-tag text-[0.62rem] font-normal tracking-[0.1em] uppercase rounded-[6px] px-2.5 py-1 border border-white/[0.07]"
                              style={{
                                fontFamily: bodyFont,
                                color:      tagColor,
                                background: tagBackground,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}