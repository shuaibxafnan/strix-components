"use client";

import { useEffect, useId, useRef } from "react";

// ─── GalleryOverlay ──────────────────────────────────────────────────────────
//
// A "field index" of remote stays: a vertical catalog that Flips a chosen
// entry's title + photo into a full dossier overlay. Cold ink, one warm
// lamp-amber accent, grotesk titles against mono field data.
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// items             array    (5 demo lodges)  One entry per row. Each item:
//                                              { title, thumbnail, leftImage,
//                                                rightImage, description,
//                                                region, coords, elevation,
//                                                tag, code? }. title + thumbnail
//                                              are the elements that Flip into
//                                              the overlay; code is auto-numbered
//                                              (N°01…) if omitted.
// bgColor           string   #0B0E14          Page background (cold blue-black)
// panelColor        string   #0F141C          Photo-frame backing
// textColor         string   #AEB6C2          Body / inherited text (mist)
// brightColor       string   #F2F5F8          Titles + key values (chalk)
// accentColor       string   #E9B872          Lamp-amber accent + ticks + focus
// mutedColor        string   #565F6E          Mono labels / dimmed data
// borderColor       string   rgba(...0.10)    Hairline frame borders
// displayFont       string   Bricolage stack  Title + body face
// monoFont          string   JetBrains stack  Data / label face
// baseFontSize      string   1vw              Root size; layout scales in em
// containerPadding  string   2em              Padding on the outer frame
// gap               string   2em              Inset of the page; overlay pad gap*3
// listTitleSize     string   4.25em           Title size in the resting index
// overlayTitleSize  string   9em              Title size once Flipped into dossier
// thumbWidth        string   15em             Resting photo-frame width
// thumbHeight       string   21em             Resting photo-frame height
// heroWidth         string   42em             Flipped hero image width
// heroHeight        string   60em             Flipped hero image height
// ease              string   0.62, 0.05, 0, 1 CustomEase points (also CSS bezier)
// duration          number   0.725            Base tween / Flip duration (s)
// eyebrow           string   Field Index      Top-left mono label
// topRight          string   Remote Stays — 2026  Top-right mono label
// intro             string   (tagline)        Standfirst under the eyebrow
// previewLabel      string   Now previewing   Caption above the live readout
// fieldNoteLabel    string   Field note       Kicker above the dossier paragraph
// footerHint        string   (hint)           Bottom-left mono hint (fades on open)
// backText          string   Back to index    Close-button label
// scrollText        string   Scroll to explore  Right-side dossier nav label
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  {
    title: "Eclipse Lodge",
    region: "Coastal Ridge",
    coords: "36.4°N 25.4°E",
    elevation: "210 m",
    tag: "Sunset / Glass",
    thumbnail:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/676882d4c39ce9e70bcb9745_tobias-reich-AwqQch2wAmM-unsplash.avif",
    leftImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/676882d42e09d4366787f302_tobias-reich-VltYe88rkt8-unsplash.avif",
    rightImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/676882d41f2900efdbe4c20d_tobias-reich-wr6m4OOZZtw-unsplash.avif",
    description:
      "A sophisticated getaway with modern architecture and unforgettable sunsets, where every moment feels timeless.",
  },
  {
    title: "Serenity Peaks",
    region: "Alpine Basin",
    coords: "46.5°N 11.3°E",
    elevation: "1,940 m",
    tag: "Valley / Quiet",
    thumbnail:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/676882d4fad20ba1fac1a107_massimiliano-morosinotto-oJmVzkVStoo-unsplash.avif",
    leftImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/6768a24ba580bdb31f092521_eberhard-grossgasteiger-UclnVUmf5aQ-unsplash.jpg",
    rightImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/6768a2c0717640eb150afb88_filippo-fFh53mf_6iE-unsplash.jpg",
    description:
      "Tucked among towering peaks and serene valleys, this haven offers a peaceful escape from the noise of the world.",
  },
  {
    title: "The Celestial Inn",
    region: "Summit Plateau",
    coords: "28.3°N 16.6°W",
    elevation: "2,360 m",
    tag: "Starfield / Above cloud",
    thumbnail:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/676882d4244a70cbb10a6403_karsten-winegeart-9CTqIV6kPQ0-unsplash.avif",
    leftImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/6768b1abc8db3718aca6b42a_karsten-winegeart-VTzcKDm7Sug-unsplash.jpg",
    rightImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/6768b1fbdc6bc1ff5504e024_karsten-winegeart-EqMRa0cgEiI-unsplash.jpg",
    description:
      "A sanctuary above the clouds, offering celestial views and unmatched tranquility for dreamers and stargazers alike.",
  },
  {
    title: "Aurora Heights",
    region: "Boreal Fjord",
    coords: "69.6°N 18.9°E",
    elevation: "320 m",
    tag: "Aurora / Night",
    thumbnail:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/676882d4be32396ee62f4946_lucas-marcomini-cVBz9q1T_9M-unsplash.avif",
    leftImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/6768b1aba580bdb31f116524_lisha-riabinina-08P8Hzja_Yk-unsplash.jpg",
    rightImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/6768b1abc8db3718aca6b405_laszlo-bajnoczi-tThY14QmOYE-unsplash.jpg",
    description:
      "Nestled in the heart of nature, this retreat is the perfect place to watch the northern lights dance across the sky.",
  },
  {
    title: "Golden Sands",
    region: "Dune Coast",
    coords: "23.7°N 35.5°E",
    elevation: "5 m",
    tag: "Shore / Warm",
    thumbnail:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/676882d42880b4fc111df2bc_sergey-pesterev-i-P1lmY_e1w-unsplash.avif",
    leftImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/6768b1ab95b4aee14bc0aadf_toa-heftiba-hi0Fml1Xj_E-unsplash.jpg",
    rightImage:
      "https://cdn.prod.website-files.com/67684bfc3496e563bea11dc0/6768b1ab27d120c7e32f8578_maria-orlova-b37mDyPzdJM-unsplash.jpg",
    description:
      "Feel the warmth of the sun and the embrace of golden shores, where luxury meets the serenity of the sea.",
  },
];

export default function GallerytoOverlay({
  items = DEFAULT_ITEMS,
  bgColor = "#0B0E14",
  panelColor = "#0F141C",
  textColor = "#AEB6C2",
  brightColor = "#F2F5F8",
  accentColor = "#E9B872",
  mutedColor = "#565F6E",
  borderColor = "rgba(255,255,255,0.10)",
  displayFont = "'Bricolage Grotesque', system-ui, sans-serif",
  monoFont = "'JetBrains Mono', ui-monospace, monospace",
  baseFontSize = "1vw",
  containerPadding = "2em",
  gap = "2em",
  listTitleSize = "4.25em",
  overlayTitleSize = "9em",
  thumbWidth = "15em",
  thumbHeight = "21em",
  heroWidth = "42em",
  heroHeight = "60em",
  ease = "0.62, 0.05, 0, 1",
  duration = 0.725,
  eyebrow = "Field Index",
  topRight = "Remote Stays — 2026",
  intro = "Five quiet places, indexed by light and elevation. Hover to preview, select to open the dossier.",
  previewLabel = "Now previewing",
  fieldNoteLabel = "Field note",
  footerHint = "Select an entry to open its dossier",
  backText = "Back to index",
}) {
  const rootRef = useRef(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cls = "gallery-" + uid;

  const codeFor = (item, i) =>
    item.code || "N°" + String(i + 1).padStart(2, "0");

  const styleContent =
    "." +
    cls +
    " .t-mono{font-family:var(--ov-mono);}" +
    "." +
    cls +
    " .t-display{font-family:var(--ov-display);}" +
    "." +
    cls +
    " .t-accent{color:var(--ov-accent);}" +
    "." +
    cls +
    " .t-muted{color:var(--ov-muted);}" +
    "." +
    cls +
    " .t-bright{color:var(--ov-bright);}" +
    "." +
    cls +
    " .main-title{color:var(--ov-bright);}" +
    "." +
    cls +
    " .main-title__list:hover:has(.main-title__item:hover) .main-title__item:not(:hover){opacity:.3;}" +
    "." +
    cls +
    " .row-code{color:var(--ov-muted);transition:color .45s cubic-bezier(" +
    ease +
    ");}" +
    "." +
    cls +
    " .main-title__item:hover .row-code{color:var(--ov-accent);}" +
    "." +
    cls +
    " .row-meta{opacity:0;transform:translateX(-.5em);transition:opacity .5s cubic-bezier(" +
    ease +
    "),transform .5s cubic-bezier(" +
    ease +
    ");}" +
    "." +
    cls +
    " .main-title__item:hover .row-meta{opacity:1;transform:translateX(0);}" +
    "." +
    cls +
    " .overlay-title__wrap .main-title{position:absolute;font-size:" +
    overlayTitleSize +
    ";}" +
    "." +
    cls +
    " .button:focus-visible{outline:1.5px solid var(--ov-accent);outline-offset:.35em;}" +
    "@media (prefers-reduced-motion: reduce){." +
    cls +
    " *{transition-duration:1ms !important;animation-duration:1ms !important;}}";

  useEffect(() => {
    let killed = false;
    const handlers = [];

    const loadStyle = (href) =>
      new Promise((resolve) => {
        if (document.querySelector(`link[data-id="${href}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("link");
        el.rel = "stylesheet";
        el.href = href;
        el.setAttribute("data-id", href);
        el.onload = resolve;
        el.onerror = resolve;
        document.head.appendChild(el);
      });

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-id="${src}"]`)) {
          resolve();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-id", src);
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(el);
      });

    const init = async () => {
      await loadStyle(
        "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..700&family=JetBrains+Mono:wght@400;500&display=swap",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js",
      );

      if (killed) return;
      const root = rootRef.current;
      const { gsap, CustomEase, Flip } = window;
      if (!gsap || !CustomEase || !Flip || !root) return;

      gsap.registerPlugin(CustomEase, Flip);
      const easeName = "ease-" + uid;
      CustomEase.create(easeName, ease);

      const rm =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const D = rm ? 0.001 : duration;
      const def = { ease: easeName, duration: D };

      const listItems = root.querySelectorAll(".main-title__item");
      const imageItems = root.querySelectorAll(".main-img__item");
      const overlayItems = root.querySelectorAll(".overlay-item");
      const overlayNav = root.querySelector(".overlay-nav");
      const navItems = root.querySelectorAll("[data-overlay='nav-item']");
      const closeButton = root.querySelector("[data-overlay='close']");
      const chrome = root.querySelectorAll(".index-chrome");

      const fCode = root.querySelector("[data-field='code']");
      const fRegion = root.querySelector("[data-field='region']");
      const fCoords = root.querySelector("[data-field='coords']");
      const fElev = root.querySelector("[data-field='elevation']");

      let activeListItem = null;

      const openOverlay = (index) => {
        listItems.forEach((item) => item.classList.remove("active"));
        activeListItem = listItems[index];
        activeListItem.classList.add("active");

        const title = activeListItem.querySelector(".main-title");
        const titleState = Flip.getState(title, { props: "fontSize" });

        const image = imageItems[index].querySelector(".image");
        const imageState = Flip.getState(image);

        const overlayItem = overlayItems[index];
        const content = overlayItem.querySelector(".overlay-row");
        const heroMeta = overlayItem.querySelector(".overlay-meta");

        gsap.set(overlayItem, { display: "block", autoAlpha: 1 });
        gsap.fromTo(
          [heroMeta, content],
          { autoAlpha: 0, y: "1em" },
          { autoAlpha: 1, y: 0, delay: 0.45, stagger: 0.08, ...def },
        );

        const textTarget = overlayItem.querySelector(
          "[data-overlay='text-target']",
        );
        const imgTarget = overlayItem.querySelector(
          "[data-overlay='img-target']",
        );

        textTarget.appendChild(title);
        imgTarget.appendChild(image);

        Flip.from(titleState, { ...def });
        Flip.from(imageState, { ...def });

        gsap.set(overlayNav, { display: "flex" });
        gsap.fromTo(
          navItems,
          { yPercent: 110 },
          { yPercent: 0, stagger: 0.1, ...def },
        );

        gsap.set(imageItems, { autoAlpha: 0 });
        gsap.to(chrome, { autoAlpha: 0, duration: D * 0.6 });

        const aCode = activeListItem.querySelector(".row-code");
        const aMeta = activeListItem.querySelector(".row-meta");
        gsap.to([aCode, aMeta], { autoAlpha: 0, duration: D * 0.5 });

        listItems.forEach((li, i) => {
          if (i !== index) {
            gsap.to(li, {
              yPercent: 60,
              autoAlpha: 0,
              duration: D * 0.7,
              delay: 0.18 - i * 0.04,
              ease: easeName,
            });
          }
        });
      };

      const closeOverlay = () => {
        if (!activeListItem) return;

        const index = Array.from(listItems).indexOf(activeListItem);
        const overlayItem = overlayItems[index];
        const title = overlayItem.querySelector(
          "[data-overlay='text-target'] .main-title",
        );
        const image = overlayItem.querySelector(
          "[data-overlay='img-target'] .image",
        );
        const content = overlayItem.querySelector(".overlay-row");
        const heroMeta = overlayItem.querySelector(".overlay-meta");

        const titleState = Flip.getState(title, { props: "fontSize" });
        const imageState = Flip.getState(image);

        gsap.to(navItems, {
          yPercent: 110,
          ...def,
          onComplete: () => {
            overlayNav.style.display = "none";
          },
        });
        gsap.to([heroMeta, content], {
          autoAlpha: 0,
          ...def,
          onComplete: () => {
            overlayItem.style.display = "none";
          },
        });

        activeListItem.querySelector(".button").appendChild(title);
        imageItems[index].appendChild(image);
        gsap.set(imageItems[index], { autoAlpha: 1 });

        Flip.from(titleState, { ...def });
        Flip.from(imageState, { ...def });

        const aCode = activeListItem.querySelector(".row-code");
        const aMeta = activeListItem.querySelector(".row-meta");
        gsap.to([aCode, aMeta], { autoAlpha: 1, delay: 0.25, ...def });

        activeListItem.classList.remove("active");
        activeListItem = null;

        gsap.to(chrome, { autoAlpha: 1, delay: 0.25, ...def });
        gsap.to(listItems, {
          yPercent: 0,
          autoAlpha: 1,
          delay: 0.2,
          stagger: 0.04,
          ...def,
        });
      };

      listItems.forEach((listItem, index) => {
        const clickFn = () => openOverlay(index);
        listItem.addEventListener("click", clickFn);
        handlers.push({ el: listItem, type: "click", fn: clickFn });

        const hoverFn = () => {
          gsap.set(imageItems, { autoAlpha: 0 });
          gsap.set(imageItems[index], { autoAlpha: 1 });
          const code =
            items[index].code || "N°" + String(index + 1).padStart(2, "0");
          if (fCode) fCode.textContent = code;
          if (fRegion) fRegion.textContent = items[index].region || "";
          if (fCoords) fCoords.textContent = items[index].coords || "";
          if (fElev) fElev.textContent = items[index].elevation || "";
        };
        listItem.addEventListener("mouseenter", hoverFn);
        handlers.push({ el: listItem, type: "mouseenter", fn: hoverFn });
      });

      const escFn = (e) => {
        if (e.key === "Escape") closeOverlay();
      };
      document.addEventListener("keydown", escFn);
      handlers.push({ el: document, type: "keydown", fn: escFn });

      const closeFn = () => closeOverlay();
      closeButton.addEventListener("click", closeFn);
      handlers.push({ el: closeButton, type: "click", fn: closeFn });
    };

    init().catch((e) =>
      console.error("[GalleryOverlay] load failed:", e.message),
    );

    return () => {
      killed = true;
      handlers.forEach((h) => h.el.removeEventListener(h.type, h.fn));
    };
  }, [items, ease, duration, uid]);

  const ticks = [
    "-left-px -top-px border-l-[1.5px] border-t-[1.5px]",
    "-right-px -top-px border-r-[1.5px] border-t-[1.5px]",
    "-left-px -bottom-px border-l-[1.5px] border-b-[1.5px]",
    "-right-px -bottom-px border-r-[1.5px] border-b-[1.5px]",
  ];

  return (
    <div
      ref={rootRef}
      className={
        cls + " relative flex min-h-screen items-center justify-center"
      }
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontSize: baseFontSize,
        padding: containerPadding,
        ["--ov-accent"]: accentColor,
        ["--ov-muted"]: mutedColor,
        ["--ov-bright"]: brightColor,
        ["--ov-mono"]: monoFont,
        ["--ov-display"]: displayFont,
      }}
    >
      <style>{styleContent}</style>

      <div className="page absolute z-0 flex flex-col" style={{ inset: gap }}>
        <header className="flex items-start justify-between">
          <div>
            <div className="t-mono t-accent text-[0.95em] uppercase tracking-[.24em]">
              {eyebrow}
            </div>
            <div className="t-mono t-muted mt-[0.6em] max-w-[24em] text-[0.9em] leading-[1.55]">
              {intro}
            </div>
          </div>
          <div className="t-mono t-muted text-right text-[0.9em] uppercase tracking-[.2em]">
            {topRight}
            <div className="t-bright mt-[0.4em]">
              {String(items.length).padStart(2, "0")} entries
            </div>
          </div>
        </header>

        <div className="main flex flex-1 items-center justify-between gap-[4em]">
          <div className="flex w-[38%] flex-col items-start justify-center">
            <div
              className="preview-frame index-chrome relative"
              style={{
                width: thumbWidth,
                height: thumbHeight,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: borderColor,
                backgroundColor: panelColor,
              }}
            >
              <div className="main-img__list relative h-full w-full">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="main-img__item absolute inset-0 z-[1] h-full w-full"
                  >
                    <img
                      src={item.thumbnail}
                      loading="lazy"
                      alt={item.title}
                      className="image h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {ticks.map((t, i) => (
                <span
                  key={i}
                  className={
                    "pointer-events-none absolute z-[2] h-[0.8em] w-[0.8em] " +
                    t
                  }
                  style={{ borderColor: accentColor }}
                />
              ))}
            </div>

            <div className="preview-meta index-chrome t-mono mt-[1.5em] text-[0.95em] leading-[1.7]">
              <div className="t-muted mb-[0.6em] text-[0.78em] uppercase tracking-[.22em]">
                {previewLabel}
              </div>
              <div className="t-bright tracking-[.04em]">
                <span data-field="code">{codeFor(items[0], 0)}</span>
                <span className="t-muted">{"  ·  "}</span>
                <span data-field="region">{items[0].region}</span>
              </div>
              <div className="t-muted tracking-[.04em]">
                <span data-field="coords">{items[0].coords}</span>
                {"  ·  "}
                <span data-field="elevation">{items[0].elevation}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 justify-end">
            <ul className="main-title__list relative flex list-none flex-col items-end justify-center gap-[0.25em] p-0 text-right">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="main-title__item relative flex cursor-pointer items-baseline justify-end gap-[0.8em] py-[0.12em]"
                >
                  <span className="row-meta t-mono whitespace-nowrap text-[0.82em] uppercase tracking-[.08em]">
                    {item.region} · {item.tag}
                  </span>
                  <span className="row-code t-mono text-[0.95em] tracking-[.05em]">
                    {codeFor(item, i)}
                  </span>
                  <button
                    type="button"
                    aria-label={"Open " + item.title}
                    className="button border-none bg-transparent p-0 text-right"
                  >
                    <h2
                      className="main-title t-display whitespace-nowrap font-medium leading-[1.05] tracking-[-.02em]"
                      style={{ fontSize: listTitleSize }}
                    >
                      {item.title}
                    </h2>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="flex items-end justify-between">
          <div className="index-chrome t-mono t-muted text-[0.88em] uppercase tracking-[.16em]">
            {footerHint}
          </div>
        </footer>
      </div>

      <div
        className="overlay-wrap pointer-events-none absolute inset-0 z-[2]"
        style={{ paddingTop: "calc(" + gap + " * 3)" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="overlay-item pointer-events-auto relative z-[1] hidden pb-[16em]"
          >
            <div className="overlay-hero mb-[5em] flex flex-col items-center justify-start gap-[3.5em]">
              <div className="overlay-meta t-mono flex flex-wrap items-center justify-center gap-x-[1.7em] gap-y-[0.5em] text-[1em] uppercase tracking-[.12em]">
                <span className="t-accent">{codeFor(item, i)}</span>
                <span className="t-muted">{item.region}</span>
                <span className="t-bright">{item.coords}</span>
                <span className="t-muted">{item.elevation}</span>
                <span className="t-bright">{item.tag}</span>
              </div>
              <div
                data-overlay="text-target"
                className="overlay-title__wrap relative flex h-[9em] w-full flex-col items-center justify-center text-center"
              ></div>
              <div
                data-overlay="img-target"
                className="overlay-img__wrap relative"
                style={{
                  width: heroWidth,
                  height: heroHeight,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: borderColor,
                }}
              >
                <span className="t-mono t-muted absolute left-[1em] top-[1em] z-[2] text-[0.9em] tracking-[.12em]">
                  {codeFor(item, i)}
                </span>
              </div>
            </div>

            <div className="overlay-row flex items-center justify-between pl-[6em]">
              <div className="overlay-col col-left flex max-w-[26em] translate-y-1/2 flex-col gap-[2em]">
                <div className="overlay-col__img h-[26em]">
                  <img
                    src={item.leftImage}
                    loading="lazy"
                    alt={item.title}
                    className="image h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="overlay-col col-right flex max-w-[34em] flex-col gap-[2em]">
                <div className="overlay-col__img h-[26em]">
                  <img
                    src={item.rightImage}
                    loading="lazy"
                    alt={item.title}
                    className="image h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="t-mono t-accent mb-[1em] text-[0.85em] uppercase tracking-[.22em]">
                    {fieldNoteLabel}
                  </div>
                  <p className="paragraph t-display mb-0 max-w-[24em] text-[1.25em] font-normal leading-[1.45]">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="overlay-nav pointer-events-auto absolute inset-x-0 bottom-8 left-8 z-[2] hidden items-end justify-between overflow-hidden">
          <button
            data-overlay="close"
            type="button"
            aria-label={backText}
            className="button t-mono t-bright flex cursor-pointer items-center gap-[0.6em] border-none bg-transparent p-0 text-[0.95em] uppercase tracking-[.16em] transition-opacity duration-200 hover:opacity-60"
          >
            <span aria-hidden="true">←</span>
            <p data-overlay="nav-item" className="m-0">
              {backText}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
