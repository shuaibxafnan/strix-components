'use client';

import { useState, useRef, useEffect } from 'react';

const DEFAULT_SECTIONS = [
  {
    title: 'Ordering & Payment',
    items: [
      { q: 'How do I place an order?', a: 'Browse our product offerings and select items you wish to purchase. Proceed to checkout and enter your shipping and payment information to complete the order.' },
      { q: 'What payment methods do you accept?', a: 'We accept credit and debit cards, PayPal, Apple Pay, and bank transfers.' },
      { q: 'How do I change or update my order?', a: 'Contact our customer service team as soon as possible. They will assist you with any necessary changes before the order ships.' },
      { q: 'How do I cancel an order?', a: 'Contact our customer service team as soon as possible. They will assist with cancellation and process a refund if applicable.' },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      { q: 'How long does shipping take?', a: 'Shipping time depends on the method chosen and your location. We offer standard (5–7 days), express (2–3 days), and overnight options.' },
      { q: 'Can I track my order?', a: 'Yes. You will receive a tracking number once your order has shipped, and you can track the status of your delivery online.' },
      { q: 'Do you offer free shipping?', a: 'We offer free standard shipping on orders over $75. Check our shipping page for the latest promotions.' },
      { q: 'Do you ship internationally?', a: 'Yes, we ship to over 50 countries. Visit our shipping information page for a complete list of destinations.' },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      { q: 'How do I return or exchange an item?', a: 'Contact our customer service team to initiate a return or exchange. We will provide a prepaid return label and instructions.' },
      { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery for most items in original condition. Some exclusions apply — see our full policy for details.' },
    ],
  },
  {
    title: 'Customer Support',
    items: [
      { q: 'How do I get assistance with an order?', a: 'Reach out via email at support@store.com or by phone at +1 (555) 555-5555. We are available Monday–Friday, 9am–5pm EST.' },
      { q: 'What are your business hours?', a: 'Our customer support team is available Monday–Friday from 9:00am to 5:00pm EST.' },
      { q: 'How do I report an issue with my order?', a: 'Contact us via email or phone with your order number and a description of the issue. We aim to resolve all issues within one business day.' },
    ],
  },
  {
    title: 'Security & Privacy',
    items: [
      { q: 'Is shopping on your site secure?', a: 'Yes. We use TLS encryption and industry-standard security protocols to protect your personal and financial information at all times.' },
      { q: 'How is my personal information protected?', a: 'We adhere to strict privacy policies and never sell or share your data with third parties. Full details are in our Privacy Policy.' },
    ],
  },
  {
    title: 'Account Management',
    items: [
      { q: 'How do I create an account?', a: 'Click "Create Account" on our website and follow the prompts. An account lets you save addresses, view order history, and check out faster.' },
      { q: 'How do I update my account information?', a: 'Log in and navigate to "My Account". From there you can update your personal details, addresses, and preferences.' },
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email address, and follow the link we send you to set a new password.' },
    ],
  },
];

function AnimatedPanel({ open, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    setHeight(open ? ref.current.scrollHeight : 0);
  }, [open]);

  return (
    <div
      className="overflow-hidden transition-[height] duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ height }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

function SubItem({ item, accentColor, bodyFont, answerColor, questionColor, borderColor }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: `1px solid ${borderColor}` }}>
      {}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 py-3.5 bg-transparent border-none cursor-pointer text-left"
      >
        <span
          className="text-[0.88rem] font-light leading-[1.4] flex-1 transition-colors duration-200"
          style={{
            fontFamily: bodyFont,
            color:      open ? questionColor : 'rgba(240,236,228,0.55)',
          }}
        >
          {item.q}
        </span>

        {}
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-[border-color] duration-200"
          style={{ border: `1px solid ${open ? accentColor : borderColor}` }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            {open
              ? <path d="M1 4h6" stroke={accentColor} strokeWidth="1.4" strokeLinecap="round"/>
              : <path d="M4 1v6M1 4h6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round"/>
            }
          </svg>
        </span>
      </button>

      {}
      <AnimatedPanel open={open}>
        <p
          className="m-0 pb-4 text-[0.82rem] font-light leading-[1.7]"
          style={{ fontFamily: bodyFont, color: answerColor }}
        >
          {item.a}
        </p>
      </AnimatedPanel>
    </div>
  );
}

function Section({ section, index, accentColor, titleFont, bodyFont, sectionBg, borderColor, questionColor, answerColor }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-[border-color,background] duration-[250ms] ease-in-out"
      style={{
        border:     `1px solid ${open ? 'rgba(255,255,255,0.1)' : borderColor}`,
        background: open ? sectionBg : 'transparent',
      }}
    >
      {}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 bg-transparent border-none cursor-pointer text-left"
      >
        <div className="flex items-center gap-3.5">
          {}
          <span
            className="text-[0.55rem] tracking-[0.18em] min-w-[18px] transition-colors duration-200"
            style={{
              fontFamily: bodyFont,
              color:      open ? accentColor : 'rgba(255,255,255,0.18)',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {}
          <span
            className="font-light tracking-[-0.01em] transition-colors duration-[250ms]"
            style={{
              fontFamily: titleFont,
              fontSize:   'clamp(1rem, 2vw, 1.3rem)',
              color:      open ? '#f0ece4' : 'rgba(240,236,228,0.55)',
            }}
          >
            {section.title}
          </span>
        </div>

        {}
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className="flex-shrink-0 transition-transform duration-[280ms] ease-in-out"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path
            d="M2.5 5l4.5 4 4.5-4"
            stroke={open ? accentColor : 'rgba(255,255,255,0.25)'}
            strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>

      {}
      <AnimatedPanel open={open}>
        <div className={`px-6 ${open ? 'pb-2' : 'pb-0'}`}>
          {}
          <div className="h-px mb-1" style={{ background: borderColor }} />

          {section.items.map((item, i) => (
            <SubItem
              key={i}
              item={item}
              accentColor={accentColor}
              bodyFont={bodyFont}
              questionColor={questionColor}
              answerColor={answerColor}
              borderColor={i < section.items.length - 1 ? borderColor : 'transparent'}
            />
          ))}
        </div>
      </AnimatedPanel>
    </div>
  );
}

export default function NestedFaq({
  sections         = DEFAULT_SECTIONS,

  maxWidth         = 'min(680px, 92vw)',
  sectionGap       = '10px',

  backgroundColor  = '#0c0c0c',
  sectionBg        = '#141414',
  borderColor      = 'rgba(255,255,255,0.07)',
  accentColor      = '#c9a96e',
  questionColor    = '#f0ece4',
  answerColor      = 'rgba(240,236,228,0.45)',

  titleFont        = "'Cormorant Garamond', Georgia, serif",
  bodyFont         = "'DM Sans', system-ui, sans-serif",

  showTitle        = true,
  eyebrowText      = 'Help Center',
  titleText        = 'FAQ',
  titleSize        = 'clamp(2.5rem, 6vw, 4.5rem)',

  className        = '',
}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400&display=swap');
        button:focus-visible { outline: 1px solid ${accentColor}; outline-offset: 2px; }
      `}</style>

      <div
        className={`w-full min-h-screen flex flex-col items-center pt-12 px-4 pb-20 ${className}`}
        style={{ background: backgroundColor }}
      >
        <div className="w-full" style={{ maxWidth }}>

          {}
          {showTitle && (
            <div className="relative overflow-hidden mb-6 pb-2">
              {}
              <span
                className="absolute top-[-0.1em] right-0 font-light leading-none select-none pointer-events-none text-transparent"
                style={{
                  fontFamily:       titleFont,
                  fontSize:         'clamp(7rem, 20vw, 14rem)',
                  WebkitTextStroke: '1px rgba(255,255,255,0.04)',
                }}
              >
                ?
              </span>

              {}
              <p
                className="m-0 mb-2 text-[0.56rem] tracking-[0.32em] uppercase opacity-45"
                style={{ fontFamily: bodyFont, color: accentColor }}
              >
                {eyebrowText}
              </p>

              {}
              <h1
                className="m-0 font-light leading-[0.95] tracking-[-0.03em] text-[#f0ece4]"
                style={{ fontFamily: titleFont, fontSize: titleSize }}
              >
                {titleText}
              </h1>
            </div>
          )}

          {}
          <div className="flex flex-col" style={{ gap: sectionGap }}>
            {sections.map((section, i) => (
              <Section
                key={i}
                section={section}
                index={i}
                accentColor={accentColor}
                titleFont={titleFont}
                bodyFont={bodyFont}
                sectionBg={sectionBg}
                borderColor={borderColor}
                questionColor={questionColor}
                answerColor={answerColor}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}