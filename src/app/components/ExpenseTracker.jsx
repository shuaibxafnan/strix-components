'use client';

import { useState } from 'react';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
const Icons = {
  groceries: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  snacks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  essentials: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  health: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  electricity: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  water: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
    </svg>
  ),
  internet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  streaming: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  courses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  software: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  close: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Default categories
// ---------------------------------------------------------------------------
const DEFAULT_CATEGORIES = [
  {
    id:    'daily',
    title: 'Daily Needs',
    items: [
      { id: 'groceries',  icon: 'groceries',  title: 'Groceries',         amount: 500.56, trend: +12 },
      { id: 'snacks',     icon: 'snacks',      title: 'Snacks & Drinks',   amount: 45.20,  trend: -5  },
      { id: 'essentials', icon: 'essentials',  title: 'Essentials',        amount: 120.34, trend: +3  },
      { id: 'health',     icon: 'health',      title: 'Health & Wellness', amount: 75.80,  trend: -8  },
    ],
  },
  {
    id:    'utilities',
    title: 'Utilities',
    items: [
      { id: 'electricity', icon: 'electricity', title: 'Electricity', amount: 150.00, trend: +6  },
      { id: 'water',       icon: 'water',        title: 'Water',       amount: 50.00,  trend: 0   },
      { id: 'internet',    icon: 'internet',     title: 'Internet',    amount: 100.00, trend: 0   },
    ],
  },
  {
    id:    'subscriptions',
    title: 'Subscriptions',
    items: [
      { id: 'streaming', icon: 'streaming', title: 'Streaming',       amount: 80.00,  trend: +15 },
      { id: 'courses',   icon: 'courses',   title: 'Courses',         amount: 100.00, trend: -10 },
      { id: 'software',  icon: 'software',  title: 'Software & Apps', amount: 120.00, trend: +4  },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmt = (n) => `$${n.toFixed(2)}`;
const sum = (items) => items.reduce((a, b) => a + b.amount, 0);

// ---------------------------------------------------------------------------
// TrendBadge
// ---------------------------------------------------------------------------
function TrendBadge({ trend, bodyFont }) {
  if (trend === 0) return null;
  const up = trend > 0;
  return (
    <span
      className={`text-[0.58rem] font-normal tracking-[0.05em] rounded-[6px] px-1.5 py-0.5 border ${
        up
          ? 'text-[#e07070] bg-[rgba(224,112,112,0.1)] border-[rgba(224,112,112,0.2)]'
          : 'text-[#70c090] bg-[rgba(112,192,144,0.1)] border-[rgba(112,192,144,0.2)]'
      }`}
      style={{ fontFamily: bodyFont }}
    >
      {up ? '↑' : '↓'} {Math.abs(trend)}%
    </span>
  );
}

// ---------------------------------------------------------------------------
// CategoryCard
// ---------------------------------------------------------------------------
function CategoryCard({
  category,
  expanded,
  onToggle,
  accentColor,
  cardBg,
  cardExpandedBg,
  borderColor,
  iconBg,
  iconExpandedBg,
  bodyFont,
  titleFont,
  textPrimary,
  textSecondary,
  textMuted,
}) {
  const total      = sum(category.items);
  const isExpanded = expanded;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-[background,border-color,box-shadow] duration-300"
      style={{
        background: isExpanded ? cardExpandedBg : cardBg,
        border:     `1px solid ${isExpanded ? 'rgba(255,255,255,0.1)' : borderColor}`,
        boxShadow:  isExpanded ? '0 12px 40px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-[18px] py-4 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {/* Collapsed: mini icon cluster */}
          {!isExpanded && (
            <div className="flex gap-1 flex-wrap w-[52px]">
              {category.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
                  style={{ background: iconBg, color: textMuted }}
                >
                  <svg width="10" height="10" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {Icons[item.icon]?.props?.children}
                  </svg>
                </div>
              ))}
            </div>
          )}

          <div>
            <div
              className="font-light leading-[1.2] tracking-[-0.01em] transition-[font-size,color] duration-300"
              style={{
                fontFamily: titleFont,
                fontSize:   isExpanded ? '1.3rem' : '1rem',
                color:      isExpanded ? textPrimary : 'rgba(240,236,228,0.7)',
              }}
            >
              {category.title}
            </div>
            {!isExpanded && (
              <div
                className="text-[0.68rem] mt-0.5"
                style={{ fontFamily: bodyFont, color: textMuted }}
              >
                {category.items.length} items
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!isExpanded && (
            <span
              className="text-[0.9rem] font-normal"
              style={{ fontFamily: bodyFont, color: textSecondary }}
            >
              {fmt(total)}
            </span>
          )}

          {/* Toggle button */}
          <div
            className="w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 transition-[border-color,color,transform] duration-300"
            style={{
              border:    `1px solid ${isExpanded ? accentColor : borderColor}`,
              color:     isExpanded ? accentColor : textMuted,
              transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            {isExpanded ? Icons.close : Icons.chevron}
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-[max-height] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ maxHeight: isExpanded ? '600px' : '0' }}
      >
        <div className="px-[18px] pb-[18px]">

          {/* Total row */}
          <div
            className="flex items-center justify-between py-2.5 mb-3.5 border-b"
            style={{ borderColor }}
          >
            <span
              className="text-[0.6rem] tracking-[0.2em] uppercase"
              style={{ fontFamily: bodyFont, color: textMuted }}
            >
              Total
            </span>
            <span
              className="text-[1.1rem] font-normal"
              style={{ fontFamily: bodyFont, color: accentColor }}
            >
              {fmt(total)}
            </span>
          </div>

          {/* Line items */}
          {category.items.map((item, ii) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
              style={{
                borderColor,
                animation: isExpanded ? `slideIn 0.3s ease ${ii * 0.05}s both` : 'none',
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
                style={{
                  background: iconExpandedBg,
                  borderColor,
                  color:      textSecondary,
                }}
              >
                {Icons[item.icon]}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[0.85rem] font-normal truncate"
                  style={{ fontFamily: bodyFont, color: textPrimary }}
                >
                  {item.title}
                </div>
              </div>

              {/* Trend + amount */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <TrendBadge trend={item.trend} bodyFont={bodyFont} />
                <span
                  className="text-[0.88rem] font-normal min-w-[64px] text-right"
                  style={{ fontFamily: bodyFont, color: textPrimary }}
                >
                  {fmt(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ExpenseTracker({
  categories       = DEFAULT_CATEGORIES,

  // Layout — runtime values, kept as inline styles
  maxWidth         = 'min(480px, 94vw)',
  cardGap          = '10px',

  // Colors — runtime values, kept as inline styles
  backgroundColor  = '#0c0c0c',
  cardBg           = '#141414',
  cardExpandedBg   = '#181818',
  borderColor      = 'rgba(255,255,255,0.07)',
  iconBg           = 'rgba(255,255,255,0.06)',
  iconExpandedBg   = '#1e1e1e',
  accentColor      = '#c9a96e',
  textPrimary      = '#f0ece4',
  textSecondary    = 'rgba(240,236,228,0.65)',
  textMuted        = 'rgba(240,236,228,0.28)',

  // Typography — runtime font strings, kept as inline styles
  titleFont        = "'Cormorant Garamond', Georgia, serif",
  bodyFont         = "'DM Sans', system-ui, sans-serif",

  // Header
  showHeader       = true,
  headerTitle      = 'Expenses',
  headerSubtitle   = null,

  className        = '',
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggle     = (id) => setExpandedId(prev => prev === id ? null : id);
  const grandTotal = categories.reduce((a, c) => a + sum(c.items), 0);
  const subtitle   = headerSubtitle ?? `${fmt(grandTotal)} this month`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400&display=swap');
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className={`w-full min-h-full flex flex-col items-center pt-10 px-4 pb-16 ${className}`}
        style={{ background: backgroundColor }}
      >
        <div className="w-full" style={{ maxWidth }}>

          {/* Header */}
          {showHeader && (
            <div className="mb-8">
              {/* Top row: month pill + running total */}
              <div className="flex items-center justify-between mb-3.5">
                {/* Month pill */}
                <div
                  className="inline-flex items-center gap-1.5 rounded-[20px] px-3 py-1 border"
                  style={{
                    background:  'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.07)',
                  }}
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full flex-shrink-0 opacity-70"
                    style={{ background: accentColor }}
                  />
                  <span
                    className="text-[0.58rem] tracking-[0.18em] uppercase text-white/30"
                    style={{ fontFamily: bodyFont }}
                  >
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Total */}
                <span
                  className="text-[0.85rem] font-normal tracking-[0.02em] opacity-85"
                  style={{ fontFamily: bodyFont, color: accentColor }}
                >
                  {subtitle}
                </span>
              </div>

              {/* Big title */}
              <h1
                className="m-0 font-light leading-[0.95] tracking-[-0.03em]"
                style={{
                  fontFamily: titleFont,
                  fontSize:   'clamp(2.4rem, 6vw, 3.8rem)',
                  color:      textPrimary,
                }}
              >
                {headerTitle}
              </h1>
            </div>
          )}

          {/* Category cards */}
          <div className="flex flex-col" style={{ gap: cardGap }}>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                expanded={expandedId === cat.id}
                onToggle={() => toggle(cat.id)}
                accentColor={accentColor}
                cardBg={cardBg}
                cardExpandedBg={cardExpandedBg}
                borderColor={borderColor}
                iconBg={iconBg}
                iconExpandedBg={iconExpandedBg}
                bodyFont={bodyFont}
                titleFont={titleFont}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textMuted={textMuted}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}