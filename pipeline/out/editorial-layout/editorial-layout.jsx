export default function EditorialLayout({
  title = "The Quarterly",
  issueText = "Issue 04 — Winter 2026",
  headline = "The Architecture<br />of Silence",
  summaryText = "How negative space shapes modern design philosophy and influences contemporary creative practice",
  author = "Eleanor Chen",
  photographer = "Marcus Webb",
  featuredImage = "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=1440&q=80",
  featuredCaption = "Figure 01 — Spatial composition study, 2025",
  bodyParagraphs = [
    "In the pursuit of visual clarity, what we choose to omit becomes as crucial as what we include. This fundamental principle guides contemporary design thinking.",
    "The intentional use of empty space — what designers call negative space or white space — creates rhythm, hierarchy, and breathing room within compositions. It allows elements to exist without competing for attention, establishing a visual language that speaks through restraint rather than abundance.",
    "Throughout history, masters of various disciplines have understood this principle. Japanese aesthetics celebrate ma, the meaningful void. Minimalist composers explore silence as counterpoint to sound. Architects design with light and air as tangible materials.",
  ],
  sidebarTitle = "Key Concepts",
  sidebarItems = [
    "Negative space as active element",
    "Visual hierarchy through spacing",
    "Rhythm and pacing in layout",
    "Material reduction strategies",
  ],
  blockquoteText = "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
  blockquoteAttr = "Antoine de Saint-Exupéry",
  columnTextLeft = "Implementing these principles requires discipline and confidence. The designer must resist the urge to fill every available space, trusting that emptiness serves a purpose beyond mere aesthetics. Consider the page spread: generous margins frame the content, line spacing allows text to breathe, paragraph breaks create natural pauses.",
  columnTextRight = "Digital interfaces present unique challenges. Screen real estate feels precious, stakeholders request more features, analytics drive density. Yet the most successful platforms maintain spatial generosity. The lesson remains consistent across media: clarity emerges from selective focus, enhanced by the strategic use of nothing at all.",
  gridImages = [
    "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
    "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
  ],
  footerLeft = "Continue reading in Issue 05",
  footerRight = "thequarterly.com",
  themeColor = "#1a1a1a",
  accentMuted = "#a3a3a3",
  grayBg = "#f7f7f5",
  backgroundColor = "#fafafa",
  featuredAlt = "Featured editorial image",
  gridImageAlt = "Supporting editorial image",
  introLabel = "Intro",
  contextLabel = "Context",
  quoteLabel = "Perspective",
  className = "",
}) {
  return (
    <div
      className={`w-full min-h-screen px-6 sm:px-12 lg:px-24 py-12 lg:py-20 selection:bg-black selection:text-white antialiased overflow-x-hidden ${className}`}
      style={{ color: themeColor, backgroundColor }}
    >
      <div className="w-full max-w-[1360px] mx-auto flex flex-col">
        <header
          className="w-full flex justify-between items-baseline pb-6 mb-20 relative group"
          style={{ borderBottom: `1px solid ${themeColor}` }}
        >
          <h1 className="text-[0.8rem] sm:text-[0.875rem] font-medium tracking-[0.35em] uppercase select-none transition-colors duration-300 hover:opacity-70">
            {title}
          </h1>
          <time className="text-[0.75rem] sm:text-[0.875rem] font-light tracking-widest opacity-80 uppercase">
            {issueText}
          </time>
        </header>

        <section className="w-full grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-12 lg:gap-24 mb-28">
          <div>
            <h2
              className="text-[clamp(2.5rem,7.5vw,5.25rem)] font-light leading-[0.92] tracking-tighter mb-10 text-[#111111]"
              dangerouslySetInnerHTML={{ __html: headline }}
            />
            <p className="text-[clamp(1.15rem,1.8vw,1.45rem)] font-light leading-relaxed max-w-[38rem] text-[#4a4a4a] text-balance">
              {summaryText}
            </p>
          </div>
          <div className="flex flex-col justify-end gap-2.5 text-[0.85rem] font-normal tracking-wide lg:text-right border-t lg:border-t-0 pt-6 lg:pt-0 border-black/5">
            <p className="text-[#1a1a1a]">
              By{" "}
              <span className="underline decoration-black/20 underline-offset-4 font-light">
                {author}
              </span>
            </p>
            <p className="text-[#666666] font-light">
              Photography by {photographer}
            </p>
          </div>
        </section>

        <section className="w-full mb-28 group/hero">
          <div className="w-full aspect-[21/9] bg-neutral-200 overflow-hidden mb-4 relative shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
            <img
              src={featuredImage}
              alt={featuredAlt}
              className="w-full h-full object-cover block grayscale contrast-[0.92] brightness-[1.05] scale-100 group-hover/hero:scale-[1.02] transition-transform duration-[1200ms] ease-out"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/5 pointer-events-none mix-blend-multiply opacity-40" />
          </div>
          <p
            className="text-[0.725rem] tracking-widest uppercase opacity-80"
            style={{ color: accentMuted }}
          >
            {featuredCaption}
          </p>
        </section>

        <section className="w-full grid grid-cols-1 md:grid-cols-[1fr_3.8fr] lg:grid-cols-[1.2fr_4fr_2.2fr] gap-12 lg:gap-16 mb-28 items-start">
            <div
            className="text-[0.725rem] font-medium tracking-[0.25em] uppercase md:sticky md:top-12 self-start pt-1.5 border-t w-8"
            style={{ color: accentMuted, borderColor: accentMuted }}
          >
            {introLabel}
          </div>

            <div className="flex flex-col gap-8 text-[1.05rem] lg:text-[1.125rem] font-light leading-[1.85] text-[#333333] max-w-[42rem]">
            {bodyParagraphs.map((para, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? "text-[1.35rem] leading-[1.65] text-[#111111] font-normal first-letter:text-7xl first-letter:font-light first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:leading-[0.8] first-letter:text-black"
                    : ""
                }
              >
                {para}
              </p>
            ))}
          </div>

            <aside
            className="w-full p-8 md:col-start-2 lg:col-start-3 md:sticky md:top-12 self-start border border-black/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.01)]"
            style={{ backgroundColor: grayBg }}
          >
            <h3 className="text-[0.725rem] font-semibold tracking-[0.25em] uppercase mb-6 text-[#1a1a1a]">
              {sidebarTitle}
            </h3>
            <ul className="list-none flex flex-col gap-4">
              {sidebarItems.map((item, idx) => (
                <li
                  key={idx}
                  className="text-[0.85rem] font-light text-[#444444] leading-relaxed flex items-baseline group/item"
                >
                  <span
                    className="mr-3 select-none text-[0.65rem] transition-transform duration-300 group-hover/item:translate-x-0.5"
                    style={{ color: accentMuted }}
                  >
                    ■
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section
          className="w-full py-20 my-16 flex flex-col items-center border-y relative"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-[0.65rem] tracking-[0.4em] uppercase text-neutral-400 select-none whitespace-nowrap"
            style={{ backgroundColor }}>
            {quoteLabel}
          </div>
          <blockquote className="w-full max-w-[54rem] mx-auto text-center text-[clamp(1.5rem,3.2vw,2.4rem)] font-light leading-[1.35] tracking-tight text-[#161616] text-balance">
            &ldquo;{blockquoteText}&rdquo;
          </blockquote>
          <p className="w-full text-center text-[0.75rem] font-medium tracking-[0.2em] uppercase text-[#666666] mt-8">
            &mdash; {blockquoteAttr}
          </p>
        </section>

        <section className="w-full grid grid-cols-1 md:grid-cols-[1fr_3.8fr] lg:grid-cols-[1.2fr_6.2fr] gap-12 mb-28 items-start">
          <div
            className="text-[0.725rem] font-medium tracking-[0.25em] uppercase pt-1.5 border-t w-8"
            style={{ color: accentMuted, borderColor: accentMuted }}
          >
            {contextLabel}
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-16 text-[0.95rem] font-light leading-[1.8] text-[#3c3c3c] max-w-[42rem] sm:max-w-none">
            <div className="flex flex-col gap-6">
              <p className="first-line:uppercase first-line:tracking-wider first-line:text-[0.85rem] first-line:font-normal">
                {columnTextLeft}
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <p>{columnTextRight}</p>
            </div>
          </div>
        </section>

        <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 mb-32">
          {gridImages.map((srcUrl, index) => (
            <div
              key={index}
              className="w-full aspect-[3/4] overflow-hidden group/grid relative shadow-[0_8px_25px_rgba(0,0,0,0.01)]"
              style={{
                background:
                  index === 1
                    ? "linear-gradient(180deg, #e5e5e5 0%, #fafafa 100%)"
                    : "linear-gradient(180deg, #e5e5e5 0%, #f5f5f5 100%)",
              }}
            >
              <img
                src={srcUrl}
                alt={`${gridImageAlt} ${index + 1}`}
                className="w-full h-full object-cover block grayscale contrast-[0.9] brightness-[1.04] scale-100 group-hover/grid:scale-[1.04] transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-multiply" />
            </div>
          ))}
        </section>

        <footer
          className="w-full pt-8 flex flex-wrap gap-4 justify-between items-center text-[0.8rem] tracking-wider font-light"
          style={{ borderTop: `1px solid ${themeColor}` }}
        >
          <p className="text-[#666666] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-black/20 animate-pulse" />
            {footerLeft}
          </p>
          <p className="underline underline-offset-4 decoration-black/10 hover:decoration-black cursor-pointer transition-colors duration-300 select-all font-normal">
            {footerRight}
          </p>
        </footer>
      </div>
    </div>
  );
}
