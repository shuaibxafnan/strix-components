'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_SLIDES = [
  { image: 'https://images.pexels.com/photos/35061233/pexels-photo-35061233.jpeg',  name: 'Anthony Lee',      title: 'Creative Director'  },
  { image: 'https://images.pexels.com/photos/15052472/pexels-photo-15052472.jpeg',  name: 'Alicia Chevalier', title: 'Brand Strategist'    },
  { image: 'https://images.pexels.com/photos/30389345/pexels-photo-30389345.jpeg',  name: 'Nate Boucher',     title: 'UX Researcher'       },
  { image: 'https://images.pexels.com/photos/33674865/pexels-photo-33674865.jpeg',  name: 'Leah Harris',      title: 'Visual Designer'     },
  { image: 'https://images.pexels.com/photos/6419332/pexels-photo-6419332.jpeg',    name: 'Angelina Laurent', title: 'Art Director'        },
  { image: 'https://images.pexels.com/photos/36878627/pexels-photo-36878627.jpeg',  name: 'Marc Sørensen',    title: 'Motion Designer'     },
  { image: 'https://images.pexels.com/photos/36878624/pexels-photo-36878624.jpeg',  name: 'Candice Marchand', title: 'Product Designer'    },
];

export default function ExpandingCarousel({
  slides             = DEFAULT_SLIDES,
  activeIndex        = 4,
  autoPlay           = true,
  autoPlayInterval   = 3500,

  cardHeight         = '75vh',
  activeCardWidth    = 'min(380px, 40vw)',
  collapsedCardWidth = 'clamp(14px, 4vw, 56px)',
  cardBorderRadius   = '10px',
  cardGap            = '8px',

  backgroundColor    = '#080808',
  accentColor        = '#c9a96e',

  nameFont           = "'Cormorant Garamond', Georgia, serif",
  titleFont          = "'DM Sans', system-ui, sans-serif",
  nameFontSize       = '1.85rem',
  titleFontSize      = '0.62rem',

  transitionMs       = 500,

  showNav            = true,

  onSlideChange      = null,
  className          = '',
}) {
  const [list, setList]           = useState(() => [...slides]);
  const [activePos, setActivePos] = useState(activeIndex);

  const [activeId, setActiveId]   = useState(() => slides[activeIndex]?.name ?? slides[0].name);
  const autoRef = useRef(null);

  const stopAuto = useCallback(() => clearInterval(autoRef.current), []);

  const goNext = useCallback(() => {
    setList(prev => {
      const next = [...prev];
      next.push(next.shift());
      setActiveId(next[activePos].name);
      onSlideChange?.(next[activePos]);
      return next;
    });
  }, [activePos, onSlideChange]);

  const goPrev = useCallback(() => {
    setList(prev => {
      const next = [...prev];
      next.unshift(next.pop());
      setActiveId(next[activePos].name);
      onSlideChange?.(next[activePos]);
      return next;
    });
  }, [activePos, onSlideChange]);

  const startAuto = useCallback(() => {
    stopAuto();
    if (!autoPlay) return;
    autoRef.current = setInterval(goNext, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, goNext, stopAuto]);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  const handleCardClick = useCallback((clickedPos) => {
    if (clickedPos === activePos) return;
    stopAuto();
    if (clickedPos > activePos) {
      const steps = clickedPos - activePos;
      setList(prev => {
        const next = [...prev];
        for (let i = 0; i < steps; i++) next.push(next.shift());
        setActiveId(next[activePos].name);
        onSlideChange?.(next[activePos]);
        return next;
      });
    } else {
      const steps = activePos - clickedPos;
      setList(prev => {
        const next = [...prev];
        for (let i = 0; i < steps; i++) next.unshift(next.pop());
        setActiveId(next[activePos].name);
        onSlideChange?.(next[activePos]);
        return next;
      });
    }
    setTimeout(startAuto, 200);
  }, [activePos, stopAuto, startAuto, onSlideChange]);

  const handleNext = useCallback(() => { stopAuto(); goNext(); setTimeout(startAuto, 200); }, [stopAuto, goNext, startAuto]);
  const handlePrev = useCallback(() => { stopAuto(); goPrev(); setTimeout(startAuto, 200); }, [stopAuto, goPrev, startAuto]);

  const totalVisible = list.length;
  const transition   = `all ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400&display=swap');

        .ec-card {
          transition: ${transition};
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        .ec-card img {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          display: block;
          transition: filter ${transitionMs}ms ease;
          pointer-events: none; user-select: none;
        }
        .ec-nav-btn:hover {
          border-color: rgba(255,255,255,0.3) !important;
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }
      `}</style>
      <div
        className={`relative flex flex-col items-center justify-center w-full h-full overflow-hidden ${className}`}
        style={{ background: backgroundColor }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '160px',
          }}
        />
        <div className="relative z-10 flex items-center justify-center w-full px-6 py-8">
          <div className="flex items-stretch" style={{ gap: cardGap }}>
            {list.map((slide, pos) => {
              const isActive = pos === activePos;
              const dist     = Math.abs(pos - activePos);
              const sat      = isActive ? 1.05 : Math.max(0, 1 - dist * 0.35);
              const bri      = isActive ? 0.9  : Math.max(0.3, 0.7 - dist * 0.1);

              return (
                <div
                  key={slide.name}
                  className="ec-card bg-[#111]"
                  onClick={() => handleCardClick(pos)}
                  style={{
                    width:        isActive ? activeCardWidth : collapsedCardWidth,
                    height:       cardHeight,
                    borderRadius: cardBorderRadius,
                    cursor:       isActive ? 'default' : 'pointer',
                    boxShadow:    isActive
                      ? '0 32px 80px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)'
                      : '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <img
                    src={`${slide.image}?w=600&fit=crop&auto=compress`}
                    alt={slide.name}
                    style={{ filter: `saturate(${sat}) brightness(${bri}) contrast(1.05)` }}
                    draggable={false}
                  />
                  {isActive && (
                    <>
                      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px] z-[2] opacity-80"
                        style={{ background: accentColor }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 z-[2] flex flex-col gap-1 p-5">
                        <p
                          className="m-0 text-[0.62rem] font-normal tracking-[0.22em] uppercase"
                          style={{
                            fontFamily: titleFont,
                            fontSize:   titleFontSize,
                            color:      accentColor,
                          }}
                        >
                          {slide.title}
                        </p>
                        <h2
                          className="m-0 font-light leading-[1.15] tracking-[0.01em] text-[#f0ece4]"
                          style={{
                            fontFamily: nameFont,
                            fontSize:   nameFontSize,
                          }}
                        >
                          {slide.name}
                        </h2>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {showNav && (
          <div className="relative z-10 flex items-center gap-5 pb-5">
            <button
              className="ec-nav-btn w-9 h-9 rounded-full border border-white/[0.12] bg-white/[0.05] flex items-center justify-center cursor-pointer text-white/50 transition-[border-color,background,color] duration-200"
              onClick={handlePrev}
              aria-label="Previous"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              {slides.map((slide) => {
                const isActiveDot = slide.name === activeId;
                return (
                  <button
                    key={slide.name}
                    aria-label={slide.name}
                    onClick={() => {
                      const pos = list.findIndex(s => s.name === slide.name);
                      if (pos !== -1) handleCardClick(pos);
                    }}
                    className="p-0 border-none cursor-pointer rounded-full transition-all duration-500"
                    style={{
                      width:      isActiveDot ? '22px' : '6px',
                      height:     '6px',
                      borderRadius: '3px',
                      background: isActiveDot ? accentColor : 'rgba(255,255,255,0.18)',
                    }}
                  />
                );
              })}
            </div>
            <button
              className="ec-nav-btn w-9 h-9 rounded-full border border-white/[0.12] bg-white/[0.05] flex items-center justify-center cursor-pointer text-white/50 transition-[border-color,background,color] duration-200"
              onClick={handleNext}
              aria-label="Next"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}