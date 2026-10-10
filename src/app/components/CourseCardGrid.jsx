'use client';

import { useState, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Default cards
// ---------------------------------------------------------------------------
const DEFAULT_CARDS = [
  {
    id:       'craft',
    title:    'The Craft',
    desc:     'Gain the confidence to build anything you envision, transforming motion, interaction, and design principles into second nature.',
    href:     '#',
    cta:      'Watch now',
    image:    'https://picsum.photos/720/720?random=12',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>
      </svg>
    ),
  },
  {
    id:       'css',
    title:    'CSS Animation',
    desc:     'Master CSS animations from your very first @keyframes right through to techniques no one else teaches.',
    href:     '#',
    cta:      'Watch now',
    image:    'https://picsum.photos/720/720?random=17',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>
      </svg>
    ),
  },
  {
    id:       'svg',
    title:    'SVG Filters',
    desc:     'Shaders on a budget. Learn to use noise to your advantage whilst making flames and stickers.',
    href:     '#',
    cta:      'Watch now',
    image:    'https://picsum.photos/720/720?random=19',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    ),
  },
  {
    id:       'scroll',
    title:    'Scroll Anim',
    desc:     'Take your users on a journey with the joy of tasteful scroll animation. You might not even need JavaScript.',
    href:     '#',
    cta:      'Watch now',
    image:    'https://picsum.photos/720/720?random=42',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>
      </svg>
    ),
  },
  {
    id:       'canvas',
    title:    'Canvas',
    desc:     'Grasp how to tame the pixel playground and when to do so, whilst building with Performance Driven Development.',
    href:     '#',
    cta:      'Watch now',
    image:    'https://picsum.photos/720/720?random=128',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    ),
  },
  {
    id:       'layout',
    title:    'Layout',
    desc:     'Do you really need a library for that? Sometimes stepping back and rethinking the problem yields a nifty solution.',
    href:     '#',
    cta:      'Watch now',
    image:    'https://picsum.photos/720/720?random=56',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>
      </svg>
    ),
  },
  {
    id:       'time',
    title:    'Timing',
    desc:     'Time plays a crucial part in various UI patterns. Learn easings, compositions, and timing patterns that aren\'t obvious.',
    href:     '#',
    cta:      'Watch now',
    image:    'https://picsum.photos/720/720?random=39',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CourseCardGrid({
  cards             = DEFAULT_CARDS,
  initialActive     = 0,

  // Layout
  height            = 'clamp(300px, 42vh, 480px)',
  maxWidth          = '860px',
  gap               = 8,
  collapsedFlex     = 1,
  activeFlex        = 10,

  // Colors — runtime prop values, kept as inline styles
  backgroundColor   = '#0a0a0a',
  cardBg            = '#0f0f0f',
  cardBorder        = 'rgba(255,255,255,0.08)',
  accentColor       = '#c9a96e',
  textPrimary       = '#f0ece4',
  textMuted         = 'rgba(240,236,228,0.45)',

  // Typography — font family strings, kept as inline styles
  titleFont         = "'Cormorant Garamond', Georgia, serif",
  bodyFont          = "'DM Sans', system-ui, sans-serif",
  headingSize       = 'clamp(1.6rem, 3vw, 2.2rem)',

  // Transition
  transitionSpeed   = '0.55s',
  transitionEasing  = 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Header
  showHeader        = true,
  headerTitle       = 'The craft of UI',
  headerDesc        = "Unlock the art and science of interface development. This isn't just about pushing pixels — it's about mastering tools, understanding nuances, and shaping experiences with intention.",

  className         = '',
}) {
  const [activeIdx, setActiveIdx] = useState(initialActive);
  const gridRef    = useRef(null);

  const gridCols = cards
    .map((_, i) => (i === activeIdx ? `${activeFlex}fr` : `${collapsedFlex}fr`))
    .join(' ');

  const handleInteraction = useCallback((e) => {
    const li = e.target.closest('li');
    if (!li || !gridRef.current) return;
    const items = [...gridRef.current.querySelectorAll('li')];
    const idx   = items.indexOf(li);
    if (idx !== -1) setActiveIdx(idx);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .cg-list {
          display: grid;
          list-style: none;
          padding: 0;
          margin: 0;
          transition: grid-template-columns ${transitionSpeed} ${transitionEasing};
        }

        /* Image mask */
        .cg-img {
          mask-image: radial-gradient(ellipse 80% 90% at 100% 0%, #fff 30%, transparent 100%);
        }

        /* ── Collapsed label fix ──
           We write the text vertically using writing-mode so it always flows
           along the card's height, never wider than the collapsed card width.
           No rotation means no overflow on the narrow axis. */
        .cg-label {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);   /* bottom-to-top reading direction */
          transition: opacity ${transitionSpeed} ${transitionEasing};
        }
        .cg-card.active .cg-label { opacity: 0; pointer-events: none; }

        /* CTA arrow nudge */
        .cg-cta::after  { content: '→'; transition: transform 0.2s ease; display: inline-block; }
        .cg-cta:hover::after { transform: translateX(3px); }

        /* Staggered reveal helpers */
        .cg-reveal {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .cg-card.active .cg-reveal { opacity: 1; transform: translateY(0); }

        .cg-accent-line {
          width: 0;
          transition: width 0.5s ease;
        }
        .cg-card.active .cg-accent-line {
          width: 28px;
          transition-delay: 0.2s;
        }

        .cg-icon-wrap {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .cg-card.active .cg-icon-wrap {
          opacity: 0.8;
          transform: translateY(0);
          transition-delay: 0.1s;
        }
        .cg-card.active .cg-title-el  { transition-delay: 0.15s; }
        .cg-card.active .cg-desc-el   { transition-delay: 0.22s; }
        .cg-card.active .cg-cta-el    { transition-delay: 0.3s;  }

        .cg-index {
          transition: opacity ${transitionSpeed} ease;
        }
        .cg-card.active .cg-index { opacity: 0; }
      `}</style>

      {/* Page wrapper */}
      <div
        className={`w-full flex flex-col items-center px-6 py-12 ${className}`}
        style={{ background: backgroundColor }}
      >

        {/* ── Header ── */}
        {showHeader && (
          <div className="w-full mb-10" style={{ maxWidth }}>
            {/* Meta row */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-[0.56rem] tracking-[0.28em] uppercase text-white/[0.18]"
                style={{ fontFamily: bodyFont }}
              >
                UI Development
              </span>
              <span
                className="text-[0.56rem] tracking-[0.2em]"
                style={{ color: accentColor, opacity: 0.5, fontFamily: bodyFont }}
              >
                {String(cards.length).padStart(2, '0')} modules
              </span>
            </div>

            {/* Big italic title */}
            <h1
              className="m-0 mb-4 font-light italic leading-none tracking-[-0.02em]"
              style={{
                fontFamily: titleFont,
                fontSize:   'clamp(2.4rem, 6vw, 4.2rem)',
                color:      textPrimary,
              }}
            >
              {headerTitle}
            </h1>

            {/* Description */}
            <p
              className="m-0 text-[0.78rem] font-light leading-relaxed max-w-[52ch]"
              style={{ color: textMuted, fontFamily: bodyFont }}
            >
              {headerDesc}
            </p>
          </div>
        )}

        {/* ── Card grid ── */}
        <ul
          ref={gridRef}
          className="cg-list w-full"
          style={{
            gridTemplateColumns: gridCols,
            gap:                 `${gap}px`,
            height,
            maxWidth,
          }}
          onClick={handleInteraction}
          onPointerMove={handleInteraction}
        >
          {cards.map((card, i) => {
            const isActive = i === activeIdx;
            return (
              <li
                key={card.id}
                className={`cg-card relative overflow-hidden rounded-xl cursor-pointer min-w-0${isActive ? ' active' : ''}`}
                style={{
                  border:     `1px solid ${cardBorder}`,
                  background: cardBg,
                }}
              >
                {/* Background image */}
                <img
                  className={`cg-img absolute inset-0 w-full h-full object-cover pointer-events-none select-none
                    transition-[filter,transform] duration-[${transitionSpeed}]
                    ${isActive
                      ? 'grayscale-0 brightness-[0.7] scale-100'
                      : 'grayscale brightness-50 scale-105'
                    }`}
                  style={{ transitionTimingFunction: transitionEasing }}
                  src={card.image}
                  alt=""
                  draggable={false}
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/[0.92] via-black/30 to-transparent" />

                {/* ── Collapsed: vertical label (writing-mode, no rotation overflow) ──
                     Centred horizontally; text flows top-to-bottom then we flip
                     it so it reads bottom-to-top via rotate(180deg) in CSS above. */}
                <div
                  className={`cg-label absolute inset-0 flex items-center justify-center
                    text-[0.62rem] font-normal tracking-[0.2em] uppercase text-[rgba(240,236,228,0.3)]
                    pointer-events-none select-none`}
                  style={{ fontFamily: bodyFont }}
                >
                  {card.title}
                </div>

                {/* Collapsed: index number at bottom */}
                <div
                  className="cg-index absolute bottom-3.5 left-1/2 -translate-x-1/2 text-[0.52rem] tracking-[0.15em] text-white/15 pointer-events-none"
                  style={{ fontFamily: bodyFont }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* ── Active: content panel ── */}
                <div className="absolute bottom-0 left-0 right-0 z-[2] flex flex-col gap-2.5 px-7 py-6">
                  {/* Icon */}
                  <div className="cg-icon-wrap w-[18px] h-[18px]" style={{ color: accentColor }}>
                    {card.icon}
                  </div>

                  {/* Title */}
                  <h3
                    className="cg-reveal cg-title-el m-0 font-light leading-[1.05] tracking-[-0.01em]"
                    style={{
                      fontFamily: titleFont,
                      fontSize:   headingSize,
                      color:      textPrimary,
                    }}
                  >
                    {card.title}
                  </h3>

                  {/* Accent line */}
                  <div
                    className="cg-accent-line h-[1.5px]"
                    style={{ background: accentColor, opacity: 0.6 }}
                  />

                  {/* Description */}
                  <p
                    className="cg-reveal cg-desc-el m-0 text-[0.78rem] font-light leading-relaxed max-w-[36ch]"
                    style={{ color: textMuted, fontFamily: bodyFont }}
                  >
                    {card.desc}
                  </p>

                  {/* CTA */}
                  <a
                    className="cg-reveal cg-cta-el cg-cta inline-flex items-center gap-1.5 text-[0.7rem] font-normal tracking-[0.12em] uppercase no-underline w-fit"
                    href={card.href}
                    tabIndex={isActive ? 0 : -1}
                    onClick={e => e.stopPropagation()}
                    style={{ color: accentColor, fontFamily: bodyFont }}
                  >
                    {card.cta}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ── Dot navigation ── */}
        <div className="flex gap-2 mt-6">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              aria-label={`Go to ${cards[i].title}`}
              className="h-1.5 rounded-[3px] border-none p-0 cursor-pointer"
              style={{
                width:      i === activeIdx ? '20px' : '6px',
                background: i === activeIdx ? accentColor : 'rgba(255,255,255,0.15)',
                transition: `width ${transitionSpeed} ${transitionEasing}, background 0.3s ease`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}