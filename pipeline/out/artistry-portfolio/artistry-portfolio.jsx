"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const photo = (id, w, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const EASE = "ease-[cubic-bezier(.2,.7,.1,1)]";

const Icon = ({ className = "h-5 w-5", children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);
const PrevIcon = (p) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);
const NextIcon = (p) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);
const UpRightIcon = (p) => (
  <Icon {...p}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </Icon>
);
const UpIcon = (p) => (
  <Icon {...p}>
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </Icon>
);

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[900ms] ${EASE} motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        } ${className}`}
    >
      {children}
    </div>
  );
}

function Lightbox({ items, index, onClose, onStep, labels }) {
  const [shown, setShown] = useState(false);
  const item = items[index];

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!item) return null;

  const btn =
    "grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-sm transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"
        }`}
    >
      <button
        type="button"
        autoFocus
        aria-label={labels.close}
        onClick={onClose}
        className={`${btn} absolute right-4 top-4 md:right-8 md:top-8`}
      >
        <CloseIcon />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label={labels.previous}
            onClick={(e) => {
              e.stopPropagation();
              onStep(-1);
            }}
            className={`${btn} absolute left-4 top-1/2 -translate-y-1/2 md:left-8`}
          >
            <PrevIcon />
          </button>
          <button
            type="button"
            aria-label={labels.next}
            onClick={(e) => {
              e.stopPropagation();
              onStep(1);
            }}
            className={`${btn} absolute right-4 top-1/2 -translate-y-1/2 md:right-8`}
          >
            <NextIcon />
          </button>
        </>
      )}

      <figure
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full max-w-full flex-col items-center gap-4"
      >
        <img
          src={item.src}
          alt={item.alt}
          className="max-h-[78vh] max-w-[88vw] object-contain"
        />
        {(item.title || item.meta) && (
          <figcaption className="text-center">
            {item.title && (
              <span className="block text-base font-light tracking-tight text-white">
                {item.title}
              </span>
            )}
            {item.meta && (
              <span className="mt-1 block font-mono text-xs text-zinc-400">
                {item.meta}
              </span>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

export default function ArtistryPortfolio({
  brand = "STUDIO NAME",
  tagline = "Visual Archetype Studio",
  navItems = [
    { id: "home", label: "home" },
    { id: "about", label: "about" },
    { id: "exhibitions", label: "exhibitions" },
  ],
  contactLabel = "Contact",
  title = "The Architecture of Silent Canvas.",
  aboutText = "I am a visual artist exploring the intersection of mental landscapes and corporal reality. Through stark structures and negative space, my canvas strips away chaos to present what remains.",
  heroImage = photo("1595598034023-ca08624ce05d", 1600, 1000),
  heroImageAlt = "Primary visual canvas portrait",
  heroCaption = "Untitled study, 2026",
  galleryAlt = "Gallery work",
  images = [
    {
      src: photo("1781798715946-2e198afc29a7", 1200, 1600),
      title: "Study in Grey I",
      meta: "Charcoal on paper, 2025",
    },
    {
      src: photo("1725161834547-ba8a90bf5a15", 1200, 1600),
      title: "Study in Grey II",
      meta: "Charcoal on paper, 2025",
    },
    {
      src: photo("1782806007529-90a2ab4b98d9", 1200, 1600),
      title: "Negative Space",
      meta: "Ink on linen, 2024",
    },
    {
      src: photo("1779877716206-f441d5d384d4", 1200, 1600),
      title: "Structural Thread",
      meta: "Graphite on board, 2024",
    },
  ],
  quote = '"When the mind becomes a labyrinth of anxious thoughts, art offers a thin structural thread back to reality."',
  quoteCredit = "",
  exhibitionsHeading = "Selected Exhibitions",
  exhibitionsSubheading = "Chronology",
  exhibitions = [
    {
      year: "2026",
      title: "Monolithic Void",
      location: "Metropolitan Gallery, Berlin",
      type: "Solo Exhibition",
    },
    {
      year: "2025",
      title: "Brutalist Mindscapes",
      location: "Espace Minimal, Paris",
      type: "Group Show",
    },
    {
      year: "2024",
      title: "Echoes of Silence",
      location: "Somerset House, London",
      type: "Curated Showcase",
    },
    {
      year: "2023",
      title: "Anxious Geometry",
      location: "Modernist Archive, New York",
      type: "Solo Debut",
    },
  ],
  email = "hello@example.com",
  footerStatus = "Available for Global Collaborations",
  socialsHeading = "Socials",
  socials = [
    { label: "Instagram", href: "#instagram" },
    { label: "Twitter", href: "#twitter" },
  ],
  studioHeading = "Studio",
  studioLines = ["Stockholm, SE", "Remote / Worldwide"],
  copyright = "Studio Name. All Rights Reserved.",
  backToTopLabel = "Back to top",
  lightboxLabels = {
    close: "Close",
    previous: "Previous image",
    next: "Next image",
  },
  bgColor = "#fbfbfa",
  textColor = "#1c1c1b",
  footerColor = "#18181b",
  className = "",
}) {
  const grainId = `grain${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [ready, setReady] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [activeNav, setActiveNav] = useState(navItems[0]?.id ?? null);
  const [scroll, setScroll] = useState({ y: 0, progress: 0 });
  const [lightbox, setLightbox] = useState(null);

  const homeId = navItems[0]?.id ?? "home";
  const aboutId = navItems[1]?.id ?? "about";
  const exhibitionsId = navItems[2]?.id ?? "exhibitions";

  const items = images.map((img, i) => ({
    alt: `${galleryAlt} ${i + 1}`,
    title: "",
    meta: "",
    ...(typeof img === "string" ? { src: img } : img),
  }));

  const lines = title.split("\n").map((l) => l.split(" ").filter(Boolean));
  const lineOffsets = lines.reduce(
    (acc, l) => [...acc, acc[acc.length - 1] + l.length],
    [0],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScroll({
        y: window.scrollY,
        progress: total > 0 ? (window.scrollY / total) * 100 : 0,
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const navKey = navItems.map((n) => n.id).join("|");
  useEffect(() => {
    const els = navItems
      .map((n) => document.getElementById(n.id))
      .filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [navKey]);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const stepLightbox = useCallback(
    (dir) =>
      setLightbox((i) =>
        i === null ? i : (i + dir + items.length) % items.length,
      ),
    [items.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, closeLightbox, stepLightbox]);

  const goTo = (id) => (e) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heroShift = Math.min(scroll.y * 0.06, 40);

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`relative min-h-screen w-full font-sans antialiased selection:bg-zinc-200 ${className}`}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[90] h-full w-full opacity-[0.12]"
      >
        <filter id={grainId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>

      <header className="fixed left-0 top-0 z-50 w-full border-b border-zinc-100 bg-[#fbfbfa]/70 py-6 backdrop-blur-md mix-blend-difference">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          <div className="flex flex-col">
            <span className="text-base font-black uppercase leading-none tracking-[0.25em]">
              {brand}
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              {tagline}
            </span>
          </div>

          <div className="mx-12 hidden max-w-sm flex-1 items-center md:flex">
            <div className="relative h-[1px] w-full overflow-hidden bg-zinc-200/80">
              <div
                className="absolute left-0 top-0 h-full bg-zinc-900 transition-all duration-300 ease-out"
                style={{ width: `${scroll.progress}%` }}
              />
            </div>
          </div>

          <nav className="flex items-center gap-4 font-mono text-[11px] tracking-widest md:gap-8 md:text-xs">
            {navItems.map((item) => {
              const underlined = hoveredNav
                ? hoveredNav === item.id
                : activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={goTo(item.id)}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="relative py-1 text-[#1c1c1b] transition-opacity duration-300"
                  style={{
                    opacity: hoveredNav && hoveredNav !== item.id ? 0.4 : 1,
                  }}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-px w-full origin-left bg-zinc-900 transition-transform duration-300 ${underlined ? "scale-x-100" : "scale-x-0"
                      }`}
                  />
                </a>
              );
            })}

            <a
              href={`mailto:${email}`}
              className="bg-[#1c1c1b] px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-800 md:px-4 md:text-xs"
            >
              {contactLabel}
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-40 px-6 pt-40 md:space-y-56 md:px-12">
        <section
          id={homeId}
          className="flex min-h-[75vh] scroll-mt-24 flex-col justify-center pt-4"
        >
          <div className="mb-12 w-full md:mb-20">
            <h1
              aria-label={title.replace(/\n/g, " ")}
              className="text-[10vw] font-extralight uppercase leading-[0.9] tracking-tighter md:text-[7.5vw]"
            >
              {lines.map((words, li) => (
                <span key={li} aria-hidden="true" className="block">
                  {words.map((word, wi) => (
                    <span
                      key={wi}
                      className="mr-[0.22em] inline-block overflow-hidden pb-[0.04em] align-bottom"
                    >
                      <span
                        style={{
                          transitionDelay: `${(lineOffsets[li] + wi) * 80}ms`,
                        }}
                        className={`inline-block transition-transform duration-[1100ms] ${EASE} motion-reduce:translate-y-0 motion-reduce:transition-none ${ready ? "translate-y-0" : "translate-y-[110%]"
                          }`}
                      >
                        {word}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-12">
            <figure className="col-span-1 md:col-span-7">
              <div
                className={`group relative aspect-[4/5] overflow-hidden bg-zinc-100 transition-[clip-path] duration-[1400ms] ${EASE} motion-reduce:transition-none md:aspect-[16/10] ${ready
                    ? "[clip-path:inset(0_0_0_0)]"
                    : "[clip-path:inset(0_0_100%_0)]"
                  }`}
              >
                <div
                  style={{ transform: `translate3d(0, ${heroShift}px, 0)` }}
                  className="absolute inset-x-0 -top-[8%] h-[116%] will-change-transform"
                >
                  <img
                    src={heroImage}
                    alt={heroImageAlt}
                    className="h-full w-full object-cover contrast-[1.05] grayscale transition duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
              </div>
              {heroCaption && (
                <figcaption className="mt-3 font-mono text-[11px] tracking-wide text-zinc-400">
                  {heroCaption}
                </figcaption>
              )}
            </figure>

            <div className="col-span-1 flex flex-col justify-end pt-4 md:col-span-5 md:pt-12">
              <div
                className={`mb-6 h-[1px] w-16 origin-left bg-zinc-900 transition-transform delay-[700ms] duration-[1000ms] ${EASE} motion-reduce:transition-none ${ready ? "scale-x-100" : "scale-x-0"
                  }`}
              />
              <p
                className={`max-w-md text-base font-light leading-relaxed text-zinc-600 transition-all delay-[900ms] duration-[1000ms] ${EASE} motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none md:text-lg ${ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
              >
                {aboutText}
              </p>
            </div>
          </div>
        </section>

        <section id={aboutId} className="w-full scroll-mt-24 space-y-16">
          <div className="grid grid-cols-2 gap-4 pb-0 md:grid-cols-4 md:gap-6 md:pb-12">
            {items.map((item, i) => (
              <Reveal
                key={i}
                delay={(i % 4) * 120}
                className="md:even:mt-12"
              >
                <button
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={item.title || item.alt}
                  className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-zinc-100 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="h-full w-full object-cover contrast-[1.05] grayscale transition duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                  />
                  {(item.title || item.meta) && (
                    <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-white transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 max-md:translate-y-0">
                      {item.title && (
                        <span className="block text-sm font-light tracking-tight">
                          {item.title}
                        </span>
                      )}
                      {item.meta && (
                        <span className="mt-0.5 block font-mono text-[10px] text-zinc-300">
                          {item.meta}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              </Reveal>
            ))}
          </div>

          {quote && (
            <Reveal className="mx-auto max-w-3xl pt-4 text-center">
              <p className="font-serif text-base italic leading-relaxed text-zinc-700 md:text-xl">
                {quote}
              </p>
              {quoteCredit && (
                <p className="mt-4 font-mono text-xs text-zinc-400">
                  {quoteCredit}
                </p>
              )}
            </Reveal>
          )}
        </section>

        <section
          id={exhibitionsId}
          className="w-full scroll-mt-24 border-t border-zinc-200/80 pt-20"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="col-span-1 md:col-span-4">
              <h2 className="sticky top-32 font-mono text-xs uppercase tracking-[0.3em] text-zinc-400">
                {exhibitionsHeading}
                {exhibitionsSubheading && (
                  <>
                    <br />
                    {exhibitionsSubheading}
                  </>
                )}
              </h2>
            </div>

            <div className="col-span-1 divide-y divide-zinc-200/60 font-sans md:col-span-8">
              {exhibitions.map((exhibit, idx) => {
                const Row = exhibit.href ? "a" : "div";
                return (
                  <Reveal key={idx} delay={idx * 80}>
                    <Row
                      {...(exhibit.href ? { href: exhibit.href } : {})}
                      className="group grid grid-cols-12 gap-2 px-2 py-6 transition-colors hover:bg-zinc-50"
                    >
                      <div className="col-span-2 pt-1 font-mono text-xs text-zinc-400 transition-colors group-hover:text-zinc-900">
                        {exhibit.year}
                      </div>
                      <div className="col-span-6">
                        <h3 className="text-base font-medium tracking-tight text-zinc-900 transition-transform duration-300 group-hover:translate-x-1">
                          {exhibit.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {exhibit.location}
                        </p>
                      </div>
                      <div className="col-span-4 flex items-start justify-end gap-2 pt-1 text-right font-mono text-xs text-zinc-400">
                        <span>{exhibit.type}</span>
                        <UpRightIcon className="h-3.5 w-3.5 -translate-x-1 translate-y-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                      </div>
                    </Row>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{ backgroundColor: footerColor }}
        className="mt-40 w-full border-t border-zinc-200/60 py-16 text-zinc-100"
      >
        <div className="mx-auto flex max-w-7xl flex-col space-y-12 px-6 md:px-12">
          <div className="flex flex-col items-start justify-between space-y-8 md:flex-row md:items-center md:space-y-0">
            <div className="space-y-2">
              <span className="block font-mono text-xs uppercase tracking-[0.3em] text-zinc-400">
                {footerStatus}
              </span>
              <a
                href={`mailto:${email}`}
                className="group relative inline-block pb-1 text-2xl font-extralight tracking-tight text-white md:text-4xl"
              >
                {email}
                <span className="absolute bottom-0 left-0 h-px w-full bg-zinc-700" />
                <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
              </a>
            </div>

            <div className="flex gap-16 font-mono text-xs tracking-wider text-zinc-400">
              <div className="flex flex-col space-y-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white">
                  {socialsHeading}
                </span>
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="transition-colors hover:text-white"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-col space-y-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white">
                  {studioHeading}
                </span>
                {studioLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-zinc-800" />

          <div className="flex flex-col items-center justify-between space-y-4 font-mono text-[11px] text-zinc-500 md:flex-row md:space-y-0">
            <div>
              &copy; {new Date().getFullYear()} {copyright}
            </div>
            <a
              href={`#${homeId}`}
              onClick={goTo(homeId)}
              className="group flex items-center gap-1 text-zinc-400 transition-colors hover:text-white"
            >
              {backToTopLabel}
              <UpIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </footer>

      {lightbox !== null && (
        <Lightbox
          items={items}
          index={lightbox}
          onClose={closeLightbox}
          onStep={stepLightbox}
          labels={lightboxLabels}
        />
      )}
    </div>
  );
}