'use client';

import { useEffect, useRef } from 'react';

const DEFAULT_ITEMS = [
  {
    title:  'All‑screen design.',
    text:   'Immerse yourself in whatever you\'re reading, watching, or creating. The Liquid Retina display features True Tone, P3 wide colour, and an antireflective coating that makes everything look stunning.',
    tag:    'Display',
    stat:   '12.9″',
    statLabel: 'Liquid Retina',
  },
  {
    title:  'Beauty all around.',
    text:   'The M1 chip delivers up to 60% faster performance than the previous generation — a creative and gaming powerhouse. Multitask smoothly between demanding apps without breaking a sweat.',
    tag:    'Performance',
    stat:   '60%',
    statLabel: 'Faster CPU',
  },
  {
    title:  'Take Center Stage.',
    text:   'The Ultra Wide front camera enables Center Stage, making video calls more natural. As you move around the camera automatically pans to keep you centred in the shot.',
    tag:    'Camera',
    stat:   '12MP',
    statLabel: 'Ultra Wide',
  },
  {
    title:  'Connect everywhere.',
    text:   'Join superfast 5G wireless networks on the go. Download files, stream movies, play multiplayer games, and stay connected with friends — wherever you are.',
    tag:    'Connectivity',
    stat:   '5G',
    statLabel: 'Ultra Fast',
  },
];

export default function ScrollAccordion({
  items            = DEFAULT_ITEMS,

  cardWidth        = 'min(680px, 88vw)',
  cardBorderRadius = '20px',
  cardGap          = 14,

  scrubSpeed    = 1,
  scrollPerCard = 350,

  backgroundColor = '#0c0c0c',
  cardBackground  = '#111111',
  cardBorder      = 'rgba(255,255,255,0.07)',
  accentColor     = '#c9a96e',
  titleColor      = '#f0ece4',
  bodyColor       = 'rgba(240,236,228,0.42)',

  titleFont   = "'Cormorant Garamond', Georgia, serif",
  bodyFont    = "'DM Sans', system-ui, sans-serif",
  titleSize   = 'clamp(28px, 3.6vw, 48px)',
  bodySize    = 'clamp(13px, 1.2vw, 15px)',
  titleWeight = 300,

  label = 'features',
  tagBackground = 'rgba(201,169,110,0.07)',
  tagBorder = 'rgba(201,169,110,0.18)',

  className = '',
}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ScrollTrigger, tl;

    const init = async () => {
      const g  = await import('gsap');
      const st = await import('gsap/ScrollTrigger');
      const gsap = g.gsap;
      ScrollTrigger = st.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const cards = sectionRef.current?.querySelectorAll('.sa-card');
      const texts = sectionRef.current?.querySelectorAll('.sa-body');
      if (!cards?.length) return;

      tl = gsap.timeline({
        scrollTrigger: {
          trigger:    sectionRef.current,
          pin:        true,
          pinSpacing: true,
          start:      'top top',
          end:        `+=${items.length * scrollPerCard}`,
          scrub:      scrubSpeed,
        },
      });

      texts.forEach((text, i) => {
        tl.to(text, {
          height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, duration: 0.4,
        }, i * 0.4);
        tl.to(cards[i], {
          marginBottom: -(cardGap * 2.5), duration: 0.4,
        }, i * 0.4);
      });
    };

    init();
    return () => { ScrollTrigger?.getAll().forEach(t => t.kill()); tl?.kill(); };
  }, [items, cardGap, scrubSpeed, scrollPerCard]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');
        .sa-body { overflow: hidden; }
        .sa-card { will-change: margin-bottom; }
      `}</style>

      <div className={`w-full ${className}`} style={{ background: backgroundColor }}>

        
                <div
          ref={sectionRef}
          className="min-h-screen flex flex-col items-center pt-[6vh] box-border"
        >
                    <div
            className="flex items-end justify-between mb-10"
            style={{ width: cardWidth }}
          >
                        <div>
              <span
                className="block font-light leading-[0.85] tracking-[-0.04em] text-transparent"
                style={{
                  fontFamily:       titleFont,
                  fontSize:         'clamp(5rem, 14vw, 9rem)',
                  WebkitTextStroke: '1px rgba(255,255,255,0.07)',
                }}
              >
                {String(items.length).padStart(2, '0')}
              </span>
              <span
                className="text-[0.6rem] tracking-[0.25em] uppercase text-white/20"
                style={{ fontFamily: bodyFont }}
              >
                {label}
              </span>
            </div>

                        <div className="flex gap-1.5 pb-1">
              {items.map((_, i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full opacity-25"
                  style={{ background: accentColor }}
                />
              ))}
            </div>
          </div>

                    {items.map((item, i) => (
            <div
              key={i}
              className="sa-card relative overflow-hidden"
              style={{
                width:        cardWidth,
                marginBottom: cardGap,
                background:   cardBackground,
                borderRadius: cardBorderRadius,
                border:       `1px solid ${cardBorder}`,
                boxShadow:    '0 12px 48px rgba(0,0,0,0.55)',
              }}
            >
                            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] opacity-70"
                style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }}
              />

                            <span
                className="absolute right-5 top-1/2 -translate-y-1/2 font-light leading-none tracking-[-0.06em] text-transparent pointer-events-none select-none"
                style={{
                  fontFamily:       titleFont,
                  fontSize:         'clamp(6rem, 16vw, 11rem)',
                  WebkitTextStroke: '1px rgba(255,255,255,0.04)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

                            <div className="relative flex flex-col pl-8 pr-16 pt-7 pb-0">

                                <div className="flex items-center justify-between mb-5">
                                    <span
                    className="text-[0.56rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border"
                    style={{
                      fontFamily:  bodyFont,
                      color:       accentColor,
                      background:  tagBackground,
                      borderColor: tagBorder,
                    }}
                  >
                    {item.tag}
                  </span>

                                    {item.stat && (
                    <div className="flex flex-col items-end">
                      <span
                        className="font-light leading-none tracking-[-0.02em]"
                        style={{
                          fontFamily: titleFont,
                          fontSize:   'clamp(1.4rem, 2.5vw, 1.9rem)',
                          color:      titleColor,
                        }}
                      >
                        {item.stat}
                      </span>
                      <span
                        className="text-[0.52rem] tracking-[0.16em] uppercase mt-0.5"
                        style={{ fontFamily: bodyFont, color: bodyColor }}
                      >
                        {item.statLabel}
                      </span>
                    </div>
                  )}
                </div>

                                <div
                  className="w-full h-px mb-5 opacity-50"
                  style={{ background: cardBorder }}
                />

                                <h2
                  className="m-0 leading-[1.06] tracking-[-0.02em]"
                  style={{
                    fontFamily: titleFont,
                    fontSize:   titleSize,
                    fontWeight: titleWeight,
                    color:      titleColor,
                  }}
                >
                  {item.title}
                </h2>
              </div>

                            <div className="sa-body" style={{ paddingTop: '12px', paddingBottom: '26px' }}>
                <p
                  className="m-0 font-light leading-[1.68]"
                  style={{
                    fontFamily: bodyFont,
                    fontSize:   bodySize,
                    color:      bodyColor,
                    padding:    '0 24px 0 32px',
                  }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

              </div>
    </>
  );
}