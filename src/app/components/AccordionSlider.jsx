'use client';

import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Default slides
// ---------------------------------------------------------------------------
const DEFAULT_SLIDES = [
  {
    image:    'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=2070&q=80',
    number:   '01',
    brand:    'BMW',
    name:     'M3 Competition',
    subtitle: 'Twin-Turbo Inline-6 Performance',
    specs: [
      { label: 'Engine',       value: '3.0L Twin-Turbo I6' },
      { label: 'Power',        value: '503 HP @ 6,250 RPM' },
      { label: 'Torque',       value: '650 Nm @ 2,750 RPM' },
      { label: 'Transmission', value: '8-Speed M Steptronic' },
    ],
    badges: [
      { label: '0–100', value: '3.9s' },
      { label: 'Top Speed', value: '290 km/h' },
      { label: 'Price', value: '$73,400' },
    ],
  },
  {
    image:    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1974&q=80',
    number:   '02',
    brand:    'Lamborghini',
    name:     'Huracán EVO',
    subtitle: 'Naturally Aspirated V10 Excellence',
    specs: [
      { label: 'Engine',       value: '5.2L V10 NA' },
      { label: 'Power',        value: '610 HP @ 8,250 RPM' },
      { label: 'Torque',       value: '560 Nm @ 6,500 RPM' },
      { label: 'Transmission', value: '7-Speed Dual-Clutch' },
    ],
    badges: [
      { label: '0–100', value: '3.2s' },
      { label: 'Top Speed', value: '325 km/h' },
      { label: 'Price', value: '$248,295' },
    ],
  },
  {
    image:    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=2070&q=80',
    number:   '03',
    brand:    'Ferrari',
    name:     'SF90 Stradale',
    subtitle: 'Plug-in Hybrid Revolution',
    specs: [
      { label: 'Engine',       value: '4.0L V8 TT + Electric' },
      { label: 'Power',        value: '1,000 HP Combined' },
      { label: 'Torque',       value: '800 Nm @ 6,000 RPM' },
      { label: 'Transmission', value: '8-Speed F1 DCT' },
    ],
    badges: [
      { label: '0–100', value: '2.5s' },
      { label: 'Top Speed', value: '340 km/h' },
      { label: 'Price', value: '$625,000' },
    ],
  },
  {
    image:    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2070&q=80',
    number:   '04',
    brand:    'Porsche',
    name:     '911 Turbo S',
    subtitle: 'Twin-Turbo Flat-Six Perfection',
    specs: [
      { label: 'Engine',       value: '3.8L Twin-Turbo F6' },
      { label: 'Power',        value: '640 HP @ 6,750 RPM' },
      { label: 'Torque',       value: '800 Nm @ 2,500 RPM' },
      { label: 'Transmission', value: '8-Speed PDK' },
    ],
    badges: [
      { label: '0–100', value: '2.7s' },
      { label: 'Top Speed', value: '330 km/h' },
      { label: 'Price', value: '$207,000' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AccordionSlider({
  slides              = DEFAULT_SLIDES,
  initialActive       = 0,

  // Sizing
  height              = '100vh',
  collapsedFlex       = 1,
  activeFlex          = 3.5,

  // Transition
  transitionDuration  = '0.75s',
  transitionEasing    = 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Colors — kept as props since Tailwind can't resolve runtime values
  accentColor         = '#c9a96e',
  badgeBg             = 'rgba(255,255,255,0.08)',
  overlayColor        = 'rgba(0,0,0,0.55)',
  glassBackground     = 'rgba(10,10,10,0.55)',
  glassBorder         = 'rgba(255,255,255,0.1)',

  // Label
  showroomLabel       = 'Now in Showroom',

  // Typography — font families are runtime strings, kept as inline style
  titleFont           = "'Cormorant Garamond', Georgia, serif",
  bodyFont            = "'DM Sans', system-ui, sans-serif",

  // Navigation
  showNav             = true,
  enableKeyboard      = true,

  // Callbacks
  onSlideChange       = null,

  className           = '',
}) {
  const [active, setActive] = useState(initialActive);

  const setSlide = useCallback((i) => {
    setActive(prev => {
      const next = prev === i ? -1 : i;
      onSlideChange?.(next);
      return next;
    });
  }, [onSlideChange]);

  const goNext = useCallback(() => {
    setActive(prev => {
      const next = prev === -1 ? 0 : (prev + 1) % slides.length;
      onSlideChange?.(next);
      return next;
    });
  }, [slides.length, onSlideChange]);

  const goPrev = useCallback(() => {
    setActive(prev => {
      const next = prev === -1 ? slides.length - 1 : (prev - 1 + slides.length) % slides.length;
      onSlideChange?.(next);
      return next;
    });
  }, [slides.length, onSlideChange]);

  useEffect(() => {
    if (!enableKeyboard) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enableKeyboard, goNext, goPrev]);

  // Transition string is prop-driven — must stay inline
  const transition = `flex ${transitionDuration} ${transitionEasing}, filter ${transitionDuration} ${transitionEasing}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .as-slide { transition: ${transition}; }
        .as-reveal { transition: opacity 0.5s ease, transform 0.5s ease; }
        .as-hidden { opacity: 0 !important; transform: translateY(20px) !important; }
        .as-badge  { transition: opacity 0.4s ease, transform 0.4s ease; }
        .as-badge-hidden { opacity: 0 !important; transform: scale(0.85) !important; }
        .as-spec-row { transition: opacity 0.35s ease, transform 0.35s ease; }
        .as-spec-hidden { opacity: 0 !important; transform: translateX(-12px) !important; }
        .as-nav-btn { transition: background 0.2s ease, border-color 0.2s ease; }
        .as-nav-btn:hover { background: rgba(255,255,255,0.15) !important; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @media (max-width: 768px) {
          .as-track { flex-direction: column !important; }
        }
      `}</style>

      {/* Root */}
      <div
        className={`relative w-full overflow-hidden ${className}`}
        style={{ height, background: '#080808' }}
      >
        {/* Showroom label */}
        <div
          className="absolute top-[22px] left-6 z-10 flex items-center gap-2 text-[0.6rem] font-light tracking-[0.25em] uppercase"
          style={{ color: accentColor, opacity: 0.8, fontFamily: bodyFont }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor, animation: 'pulse 2s ease-in-out infinite' }}
          />
          {showroomLabel}
        </div>

        {/* Slide count */}
        <div
          className="absolute top-[22px] right-6 z-10 text-[0.58rem] tracking-[0.2em] text-white/25"
          style={{ fontFamily: bodyFont }}
        >
          {active >= 0 ? String(active + 1).padStart(2, '0') : '—'} / {String(slides.length).padStart(2, '0')}
        </div>

        {/* Slides track */}
        <div className="as-track flex h-full w-full">
          {slides.map((slide, i) => {
            const isActive = i === active;

            return (
              <div
                key={i}
                className="as-slide relative cursor-pointer overflow-hidden bg-cover bg-center"
                onClick={() => setSlide(i)}
                style={{
                  flex:                isActive ? activeFlex : collapsedFlex,
                  backgroundImage:     `url(${slide.image})`,
                  backgroundSize:      'cover',
                  backgroundPosition:  'center',
                  filter:              isActive
                    ? 'grayscale(0) brightness(0.92)'
                    : 'grayscale(1) brightness(0.55)',
                }}
              >
                {/* Dark overlay */}
                <div
                  className="absolute inset-0 z-[1]"
                  style={{
                    background: isActive
                      ? 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)'
                      : overlayColor,
                    transition: `background ${transitionDuration} ${transitionEasing}`,
                  }}
                />

                {/* Collapsed: vertical brand label */}
                {!isActive && (
                  <div className="absolute inset-0 z-[2] flex items-center justify-center">
                    <span
                      className="text-[0.85rem] font-light tracking-[0.15em] text-white/35 select-none whitespace-nowrap"
                      style={{
                        fontFamily:      titleFont,
                        writingMode:     'vertical-rl',
                        textOrientation: 'mixed',
                        transform:       'rotate(180deg)',
                      }}
                    >
                      {slide.brand}
                    </span>

                    {/* Collapsed number at bottom */}
                    <span
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.55rem] tracking-[0.15em] text-white/20"
                      style={{ fontFamily: bodyFont }}
                    >
                      {slide.number}
                    </span>
                  </div>
                )}

                {/* Active: glassmorphism content card */}
                {isActive && (
                  <div className="absolute bottom-10 left-9 z-[3] w-[clamp(280px,55%,420px)]">
                    {/* Glass card */}
                    <div
                      className="rounded-2xl px-7 pt-6 pb-5"
                      style={{
                        background:          glassBackground,
                        backdropFilter:      'blur(20px) saturate(1.4)',
                        WebkitBackdropFilter:'blur(20px) saturate(1.4)',
                        border:              `1px solid ${glassBorder}`,
                        boxShadow:           '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* Slide number + brand row */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="text-[0.58rem] tracking-[0.22em] font-light"
                          style={{ color: accentColor, opacity: 0.7, fontFamily: bodyFont }}
                        >
                          {slide.number}
                        </span>
                        <span
                          className="text-[0.6rem] tracking-[0.18em] uppercase font-light text-white/30"
                          style={{ fontFamily: bodyFont }}
                        >
                          {slide.brand}
                        </span>
                      </div>

                      {/* Gold divider */}
                      <div
                        className="w-7 h-[1.5px] mb-[14px]"
                        style={{ background: accentColor, opacity: 0.6 }}
                      />

                      {/* Car name */}
                      <h2
                        className={`as-reveal${isActive ? '' : ' as-hidden'} m-0 mb-1 font-light leading-[1.05] tracking-[-0.01em]`}
                        style={{
                          fontFamily:      titleFont,
                          fontSize:        'clamp(1.5rem, 3vw, 2.2rem)',
                          color:           '#f0ece4',
                          transitionDelay: '0.2s',
                        }}
                      >
                        {slide.name}
                      </h2>

                      {/* Subtitle */}
                      <p
                        className={`as-reveal${isActive ? '' : ' as-hidden'} m-0 mb-5 text-[0.7rem] font-light tracking-[0.06em] text-white/40`}
                        style={{ fontFamily: bodyFont, transitionDelay: '0.28s' }}
                      >
                        {slide.subtitle}
                      </p>

                      {/* Specs */}
                      <div className="mb-[18px]">
                        {slide.specs.map((spec, si) => (
                          <div
                            key={si}
                            className={`as-spec-row flex justify-between items-center py-1.5 ${si < slide.specs.length - 1 ? 'border-b border-white/5' : ''}`}
                            style={{ transitionDelay: isActive ? `${0.35 + si * 0.06}s` : '0s' }}
                          >
                            <span
                              className="text-[0.65rem] font-light tracking-[0.08em] uppercase text-white/30"
                              style={{ fontFamily: bodyFont }}
                            >
                              {spec.label}
                            </span>
                            <span
                              className="text-[0.75rem] font-normal text-[rgba(240,236,228,0.85)]"
                              style={{ fontFamily: bodyFont }}
                            >
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Performance badges */}
                      <div
                        className={`as-reveal${isActive ? '' : ' as-hidden'} flex gap-2 flex-wrap`}
                        style={{ transitionDelay: isActive ? '0.6s' : '0s' }}
                      >
                        {slide.badges.map((badge, bi) => (
                          <div
                            key={bi}
                            className={`as-badge${isActive ? '' : ' as-badge-hidden'} flex flex-col gap-0.5 px-3 py-2 rounded-[10px] border border-white/[0.07]`}
                            style={{
                              background:      badgeBg,
                              transitionDelay: isActive ? `${0.65 + bi * 0.06}s` : '0s',
                            }}
                          >
                            <span
                              className="text-[0.55rem] tracking-[0.15em] uppercase"
                              style={{ color: accentColor, opacity: 0.7, fontFamily: bodyFont }}
                            >
                              {badge.label}
                            </span>
                            <span
                              className="text-[0.8rem] font-normal text-[#f0ece4]"
                              style={{ fontFamily: bodyFont }}
                            >
                              {badge.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Active: large ghosted number top-right */}
                {isActive && (
                  <div
                    className="absolute top-8 right-8 z-[2] font-light leading-none select-none pointer-events-none tracking-[-0.04em] text-white/[0.04]"
                    style={{
                      fontFamily: titleFont,
                      fontSize:   'clamp(5rem, 12vw, 10rem)',
                    }}
                  >
                    {slide.number}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nav arrows */}
        {showNav && (
          <>
            <button
              className="as-nav-btn absolute bottom-9 right-20 z-10 w-10 h-10 rounded-full border border-white/[0.12] flex items-center justify-center cursor-pointer text-white/50 backdrop-blur-[10px]"
              onClick={goPrev}
              aria-label="Previous"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="as-nav-btn absolute bottom-9 right-8 z-10 w-10 h-10 rounded-full border border-white/[0.12] flex items-center justify-center cursor-pointer text-white/50 backdrop-blur-[10px]"
              onClick={goNext}
              aria-label="Next"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </>
  );
}