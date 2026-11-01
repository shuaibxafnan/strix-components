"use client";

import { useEffect, useRef } from "react";

const UNSPLASH = [
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1487622750296-6360190669a1?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1441716844725-09cedc13a4e7?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1503435980610-a51f3ddfee50?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1500259783852-0ba1c8563b23?auto=format&fit=crop&w=500&q=80",
];

const CAPTIONS = [
  "Amber Van Cult",
  "Sky Tone No. 5",
  "From the inside",
  "Lonely Friend",
  "Framed Walls",
  "Nesta Gut",
  "Brighton Flies",
  "Never Story",
  "Quilt Fan",
];

function buildDefaultItems() {
  const defs = [
    {
      title: "Nostalgia",
      intro:
        "A sequential collaboration between Nathan Cutward and Henry Baldimore aiming to capture light.",
      date: "February, 2020",
      bgcolor: "#B9793E",
    },
    {
      title: "361 KM",
      intro:
        "What is that lighthouse over there? We will find out soon with Terrance Love.",
      date: "March, 2020",
      bgcolor: "#5B6A63",
    },
    {
      title: "Moonbox",
      intro:
        "Nothing short of a miracle. What a surprise to your millenial birthday.",
      date: "February, 2020",
      bgcolor: "#7C6FA6",
    },
    {
      title: "Beta Z",
      intro:
        "Pointless you say? Of course, that's the whole idea behind reckless yogurt.",
      date: "February, 2020",
      bgcolor: "#8C9257",
    },
    {
      title: "Pink Dream",
      intro:
        "When you say Pasha, I get excited. But wait for winter, it will blow your mind!",
      date: "February, 2020",
      bgcolor: "#A73450",
    },
  ];
  return defs.map((d, i) => {
    const base = i * 6;
    const images = [0, 1, 2, 3, 4, 5].map(
      (n) => UNSPLASH[(base + n) % UNSPLASH.length],
    );
    const galleryImages = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(
      (n) => UNSPLASH[(base + n) % UNSPLASH.length],
    );
    return { ...d, images, galleryImages, captions: CAPTIONS };
  });
}

const GALLERY_LAYOUTS = [
  ["3/2", "8/3", "1/20", "25/5", "25/18", "15/19"],
  ["1/2", "10/3", "10/20", "25/15", "7/16", "21/18"],
  ["3/3", "11/4", "1/16", "25/10", "4/22", "20/18"],
  ["1/9", "2/1", "6/14", "25/15", "23/22", "15/19"],
  ["7/1", "1/15", "2/13", "25/3", "18/19", "25/21"],
];

const PRINT_ROTATIONS = [-4, 3, -2, 5, -3, 2];

const STYLE_TEXT =
  "*,*::before,*::after{box-sizing:border-box;}" +
  ".mgg-root{--mgg-mono:'IBM Plex Mono',ui-monospace,monospace;--mgg-display:'Fraunces','Iowan Old Style',serif;--mgg-body:'Inter',system-ui,sans-serif;position:relative;min-height:100vh;overflow:hidden;font-family:var(--mgg-body);isolation:isolate;}" +
  ".mgg-grain{position:absolute;inset:-20%;z-index:1;pointer-events:none;opacity:0.05;mix-blend-mode:overlay;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");}" +
  ".mgg-bg-wrap{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2;}" +
  ".mgg-bg-gallery{position:absolute;top:0;left:0;width:100%;height:min(62vh,520px);display:grid;grid-template-columns:repeat(25,4%);grid-template-rows:repeat(25,4%);}" +
  ".mgg-print{opacity:0;position:relative;justify-self:start;padding:6px 6px 20px;background:var(--mgg-paper);box-shadow:0 12px 30px -12px rgba(0,0,0,0.55);will-change:transform;}" +
  ".mgg-print img{display:block;width:100%;height:100%;object-fit:cover;filter:sepia(0.12) contrast(1.03);}" +
  ".mgg-print::after{content:attr(data-idx);position:absolute;left:6px;bottom:5px;font-family:var(--mgg-mono);font-size:8px;letter-spacing:0.08em;color:#00000088;}" +
  ".mgg-print.mgg-size-a{width:clamp(130px,26vw,260px);}" +
  ".mgg-print.mgg-size-b{width:clamp(96px,19vw,180px);}" +
  ".mgg-print.mgg-align-start{align-self:start;}" +
  ".mgg-print.mgg-align-end{align-self:end;}" +
  ".mgg-menu{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;width:100%;max-width:980px;margin:16vh auto 0;padding:0 2rem;user-select:none;}" +
  ".mgg-row{cursor:pointer;position:relative;display:flex;justify-content:center;align-items:baseline;gap:1.25rem;padding:1.1rem 0;width:100%;border-top:1px solid var(--mgg-line);overflow:hidden;}" +
  ".mgg-menu > .mgg-row:first-child{border-top:none;}" +
  ".mgg-menu > .mgg-row:last-child{border-bottom:1px solid var(--mgg-line);}" +
  ".mgg-plate{font-family:var(--mgg-mono);font-size:0.75rem;letter-spacing:0.1em;color:var(--mgg-accent);flex:0 0 auto;padding-top:0.6em;}" +
  ".mgg-row-title{font-family:var(--mgg-display);font-style:italic;font-weight:650;font-size:clamp(2.4rem,7vw,6rem);line-height:1;overflow:hidden;flex:1 1 auto;}" +
  ".mgg-row-title span{display:inline-block;color:var(--mgg-paper);transition:color 0.25s ease;}" +
  ".mgg-row.is-selected .mgg-row-title span,.mgg-row:hover .mgg-row-title span{color:var(--mgg-accent);}" +
  ".mgg-row-cta{display:inline-flex;align-items:center;gap:0.5rem;font-family:var(--mgg-mono);font-size:0.72rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--mgg-paper);opacity:0;flex:0 0 auto;padding-top:0.6em;}" +
  ".mgg-row-cta::after{content:'\\2192';font-size:0.9rem;transition:transform 0.25s ease;}" +
  ".mgg-row-cta:hover::after{transform:translateX(4px);}" +
  ".mgg-page{position:fixed;inset:0;z-index:30;overflow-y:auto;pointer-events:none;opacity:0;transition:opacity 0.4s ease;}" +
  ".mgg-page.is-open{pointer-events:auto;opacity:1;}" +
  ".mgg-content{max-width:980px;margin:0 auto;padding:5rem 2rem 8rem;text-align:center;}" +
  ".mgg-back{display:inline-flex;align-items:center;gap:0.6rem;cursor:pointer;margin-bottom:3rem;font-family:var(--mgg-mono);font-size:0.72rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--mgg-paper);}" +
  ".mgg-back svg{transform:rotate(180deg);}" +
  ".mgg-content-eyebrow{display:block;font-family:var(--mgg-mono);font-size:0.72rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--mgg-accent-strong);margin-bottom:1rem;}" +
  ".mgg-content-title{font-family:var(--mgg-display);font-style:italic;font-weight:650;font-size:clamp(2.6rem,7vw,6.5rem);margin:0 0 1.75rem;line-height:0.98;color:var(--mgg-paper);}" +
  ".mgg-content-intro{margin:0 auto 1.25rem;font-size:1.2rem;line-height:1.55;max-width:440px;color:var(--mgg-paper);}" +
  ".mgg-content-date{display:block;margin-bottom:3rem;font-family:var(--mgg-mono);font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--mgg-muted);}" +
  ".mgg-gallery{margin-top:2rem;display:grid;grid-gap:1px;background:var(--mgg-line);border:1px solid var(--mgg-line);grid-template-columns:repeat(3,1fr);}" +
  ".mgg-gallery figure{margin:0;opacity:0;transform:translateY(18px);background:var(--mgg-ink);padding:0.85rem 0.85rem 1.1rem;}" +
  ".mgg-gallery img{width:100%;display:block;object-fit:cover;aspect-ratio:4/5;filter:sepia(0.1) contrast(1.03);}" +
  ".mgg-gallery figcaption{margin-top:0.65rem;display:flex;justify-content:space-between;font-family:var(--mgg-mono);font-size:0.68rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--mgg-muted);}" +
  ".mgg-cursor{display:none;}" +
  "@media (any-pointer:fine){.mgg-cursor{position:fixed;top:0;left:0;pointer-events:none;z-index:9999;display:block;}}" +
  ".mgg-cursor-ring{width:26px;height:26px;border-radius:50%;border:1.5px solid var(--mgg-accent-strong);transition:border-color 0.2s ease;}" +
  ".mgg-cursor-dot{position:absolute;top:11px;left:11px;width:4px;height:4px;border-radius:50%;background:var(--mgg-accent-strong);}" +
  "@media (max-width:640px){.mgg-gallery{grid-template-columns:repeat(2,1fr);}.mgg-row{gap:0.75rem;}.mgg-plate{display:none;}}" +
  "@media (prefers-reduced-motion:reduce){.mgg-print,.mgg-row-title span,.mgg-gallery figure{transition:none !important;}}";

export default function MenuGridGallery({
  inkColor = "#121410",
  paperColor = "#EDE6D8",
  accentColor = "#C97A3B",
  items = buildDefaultItems(),
  enableCursor = true,
  plateLabel = "N\u00b0",
  exploreLabel = "Explore",
  backLabel = "Back to archive",
  eyebrowLabel = "Plate",
  className = "",
}) {
  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const currentRef = useRef(0);

  useEffect(() => {
    if (document.querySelector('link[data-id="mgg-fonts"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;1,600;1,650&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap";
    link.setAttribute("data-id", "mgg-fonts");
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let ctx = null;
    const prevBodyBg = document.body.style.backgroundColor;

    let mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    import("gsap")
      .then((mod) => {
        const gsap = mod.gsap || mod.default;
        if (cancelled || !gsap || !rootRef.current) return;
        const root = rootRef.current;
        ctx = gsap.context(() => {});

        const menuItemEls = [...root.querySelectorAll(".mgg-row")];
        const galleryEls = [...root.querySelectorAll(".mgg-bg-gallery")];
        const pageEls = [...root.querySelectorAll(".mgg-page")];

        gsap.set(
          menuItemEls.map((el) => el.querySelector(".mgg-row-cta")),
          { opacity: 0 },
        );

        const highlight = (idx) => {
          const gallery = galleryEls[idx];
          const bgItems = [...gallery.querySelectorAll(".mgg-print")];
          menuItemEls[idx].classList.add("is-selected");
          gsap.set(menuItemEls[idx].querySelector(".mgg-row-cta"), {
            opacity: 1,
          });
          gsap.fromTo(
            bgItems,
            {
              scale: 0.01,
              rotation: () => gsap.utils.random(-20, 20),
              opacity: 0,
            },
            {
              duration: 1,
              ease: "expo.out",
              scale: 1,
              opacity: 1,
              rotation: (i, t) => t.dataset.rot,
              stagger: 0.05,
            },
          );
        };

        highlight(0);

        const toggleMenuItems = (nextIdx, direction) => {
          const dir = direction === "up" ? 1 : -1;
          const curIdx = currentRef.current;
          const curItem = menuItemEls[curIdx];
          const nextItem = menuItemEls[nextIdx];
          curItem.classList.remove("is-selected");
          nextItem.classList.add("is-selected");

          const curGalleryItems = [
            ...galleryEls[curIdx].querySelectorAll(".mgg-print"),
          ];
          const nextGalleryItems = [
            ...galleryEls[nextIdx].querySelectorAll(".mgg-print"),
          ];

          gsap
            .timeline({
              defaults: { duration: 1, ease: "expo.inOut" },
              onStart: () => (isAnimatingRef.current = true),
              onComplete: () => (isAnimatingRef.current = false),
            })
            .to(
              nextItem.querySelector(".mgg-row-title span"),
              { ease: "expo.in", duration: 0.5, y: dir * -100 + "%" },
              0,
            )
            .to(
              nextItem.querySelector(".mgg-row-title span"),
              {
                ease: "expo",
                duration: 0.8,
                startAt: { y: dir * 100 + "%" },
                y: "0%",
              },
              0.5,
            )
            .to(
              curItem.querySelector(".mgg-row-cta"),
              { y: "100%", opacity: 0 },
              0,
            )
            .to(
              curGalleryItems,
              {
                y: dir * -window.innerHeight * 1.2,
                stagger: dir * 0.05,
                rotation: () => gsap.utils.random(-30, 30),
              },
              0,
            )
            .addLabel("upcoming", 0.1)
            .to(
              nextItem.querySelector(".mgg-row-cta"),
              { startAt: { y: dir * 100 + "%" }, y: "0%", opacity: 1 },
              "upcoming",
            )
            .to(
              nextGalleryItems,
              {
                startAt: {
                  y: dir * window.innerHeight * 1.2,
                  rotation: () => gsap.utils.random(-30, 30),
                },
                y: 0,
                opacity: 1,
                rotation: (i, t) => t.dataset.rot,
                stagger: dir * 0.05,
              },
              "upcoming",
            );

          currentRef.current = nextIdx;
        };

        const showContent = (idx) => {
          const page = pageEls[idx];
          const item = menuItemEls[idx];
          const galleryItems = [
            ...galleryEls[idx].querySelectorAll(".mgg-print"),
          ];
          const figures = [...page.querySelectorAll(".mgg-gallery figure")];

          gsap
            .timeline({
              defaults: { duration: 0.8, ease: "expo.inOut" },
              onStart: () => (isAnimatingRef.current = true),
              onComplete: () => (isAnimatingRef.current = false),
            })
            .to(
              galleryItems,
              {
                y: -window.innerHeight * 1.2,
                opacity: 0,
                stagger: 0.05,
                rotation: () => gsap.utils.random(-30, 30),
              },
              0,
            )
            .to(
              menuItemEls.map((el) => el.querySelector(".mgg-row-title span")),
              { y: "100%", stagger: { each: 0.03, from: "end" } },
              0,
            )
            .set(page, { onComplete: () => page.classList.add("is-open") })
            .fromTo(
              figures,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, stagger: 0.08 },
              "-=0.3",
            )
            .to(document.body, { backgroundColor: items[idx].bgcolor }, 0);
        };

        const showMenu = (idx) => {
          const page = pageEls[idx];
          window.scrollTo({ top: 0, behavior: "smooth" });
          gsap
            .timeline({
              defaults: { duration: 0.8, ease: "expo.inOut" },
              onStart: () => (isAnimatingRef.current = true),
              onComplete: () => {
                page.classList.remove("is-open");
                isAnimatingRef.current = false;
              },
            })
            .to(document.body, { backgroundColor: inkColor }, 0)
            .to(
              page.querySelectorAll(".mgg-gallery figure"),
              { opacity: 0, y: 18, stagger: 0.05 },
              0,
            )
            .addLabel("menuBack", 0.3)
            .to(
              menuItemEls.map((el) => el.querySelector(".mgg-row-title span")),
              { y: "0%", stagger: { each: 0.03, from: "start" } },
              "menuBack",
            )
            .to(
              [...galleryEls[idx].querySelectorAll(".mgg-print")],
              {
                y: 0,
                rotation: (i, t) => t.dataset.rot,
                opacity: 1,
                stagger: -0.05,
              },
              "menuBack",
            )
            .to(
              menuItemEls[idx].querySelector(".mgg-row-cta"),
              { y: "0%" },
              "menuBack",
            );
        };

        menuItemEls.forEach((itemEl, idx) => {
          const onItemClick = (ev) => {
            ev.preventDefault();
            if (idx === currentRef.current || isAnimatingRef.current) return;
            const direction = currentRef.current < idx ? "up" : "down";
            ctx.add(() => toggleMenuItems(idx, direction));
          };
          const ctaEl = itemEl.querySelector(".mgg-row-cta");
          const onCtaClick = (ev) => {
            ev.stopPropagation();
            if (isAnimatingRef.current) return;
            ctx.add(() => showContent(idx));
          };
          itemEl.addEventListener("click", onItemClick);
          ctaEl.addEventListener("click", onCtaClick);
          itemEl._mggCleanup = () => {
            itemEl.removeEventListener("click", onItemClick);
            ctaEl.removeEventListener("click", onCtaClick);
          };
        });

        pageEls.forEach((page, idx) => {
          const backEl = page.querySelector(".mgg-back");
          const onBack = (ev) => {
            ev.preventDefault();
            ctx.add(() => showMenu(idx));
          };
          backEl.addEventListener("click", onBack);
          page._mggCleanup = () => backEl.removeEventListener("click", onBack);
        });

        if (enableCursor && cursorRef.current) {
          const cursorEl = cursorRef.current;
          let raf;
          const state = { tx: mouse.x - 13, ty: mouse.y - 13, scale: 1 };
          cursorEl.style.opacity = "0";

          const onFirstMove = (e) => {
            state.tx = e.clientX - 13;
            state.ty = e.clientY - 13;
            cursorEl.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`;
            cursorEl.style.transition = "opacity 0.4s ease";
            cursorEl.style.opacity = "1";
            raf = requestAnimationFrame(render);
          };

          const render = () => {
            state.tx += (mouse.x - 13 - state.tx) * 0.2;
            state.ty += (mouse.y - 13 - state.ty) * 0.2;
            cursorEl.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`;
            raf = requestAnimationFrame(render);
          };

          window.addEventListener("mousemove", onFirstMove, { once: true });

          const links = [...root.querySelectorAll("a, .mgg-row, .mgg-back")];
          const onEnter = () => (state.scale = 1.9);
          const onLeave = () => (state.scale = 1);
          links.forEach((l) => {
            l.addEventListener("mouseenter", onEnter);
            l.addEventListener("mouseleave", onLeave);
          });

          root._mggCursorCleanup = () => {
            if (raf) cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onFirstMove);
            links.forEach((l) => {
              l.removeEventListener("mouseenter", onEnter);
              l.removeEventListener("mouseleave", onLeave);
            });
          };
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      window.removeEventListener("mousemove", onMouseMove);
      if (ctx) ctx.revert();
      document.body.style.backgroundColor = prevBodyBg;
      const root = rootRef.current;
      if (!root) return;
      root
        .querySelectorAll(".mgg-row")
        .forEach((el) => el._mggCleanup && el._mggCleanup());
      root
        .querySelectorAll(".mgg-page")
        .forEach((el) => el._mggCleanup && el._mggCleanup());
      if (root._mggCursorCleanup) root._mggCursorCleanup();
    };
  }, [items, inkColor, enableCursor]);

  const rootVars = {
    backgroundColor: inkColor,
    color: paperColor,
    "--mgg-ink": inkColor,
    "--mgg-paper": paperColor,
    "--mgg-accent": accentColor,
    "--mgg-accent-strong": accentColor,
    "--mgg-muted": "rgba(237,230,216,0.5)",
    "--mgg-line": "rgba(237,230,216,0.16)",
  };

  return (
    <div ref={rootRef} className={`mgg-root ${className}`} style={rootVars}>
      <style>{STYLE_TEXT}</style>
      <div className="mgg-grain" />

      <div className="mgg-bg-wrap">
        {items.map((item, idx) => (
          <div className="mgg-bg-gallery" key={`bg-${idx}`}>
            {item.images.map((src, i) => {
              const [row, col] =
                GALLERY_LAYOUTS[idx % GALLERY_LAYOUTS.length][i].split("/");
              const isOdd = (i + 1) % 2 !== 0;
              const sizeClass = isOdd ? "mgg-size-b" : "mgg-size-a";
              const alignClass = i < 3 ? "mgg-align-start" : "mgg-align-end";
              return (
                <div
                  key={i}
                  className={`mgg-print ${sizeClass} ${alignClass}`}
                  data-idx={`${String(idx + 1).padStart(2, "0")}.${i + 1}`}
                  data-rot={PRINT_ROTATIONS[i]}
                  style={{ gridRow: row, gridColumn: col }}
                >
                  <img src={src} alt="" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <nav className="mgg-menu">
        {items.map((item, idx) => (
          <a
            key={idx}
            href={`#content-${idx}`}
            className={`mgg-row${idx === 0 ? " is-selected" : ""}`}
          >
            <span className="mgg-plate">
              {plateLabel}{String(idx + 1).padStart(2, "0")}
            </span>
            <span className="mgg-row-title">
              <span>{item.title}</span>
            </span>
            <span className="mgg-row-cta">{exploreLabel}</span>
          </a>
        ))}
      </nav>

      {items.map((item, idx) => (
        <div className="mgg-page" key={`page-${idx}`}>
          <div className="mgg-content">
            <div className="mgg-back">
              <svg
                width="16"
                height="16"
                viewBox="0 0 511.996 511.996"
                fill="currentColor"
              >
                <path d="M462.51 220.392H172.707l67.017-68.342a7.133 7.133 0 00.014-9.956l-39.544-40.612a7.13 7.13 0 00-10.204 0L44.383 251.028a7.128 7.128 0 000 9.941L189.99 410.514c1.338 1.375 3.176 2.15 5.099 2.15s3.76-.775 5.105-2.15l39.544-40.612a7.126 7.126 0 00-.014-9.956l-67.017-68.342H462.51c3.93 0 7.12-3.19 7.12-7.12v-56.97a7.124 7.124 0 00-7.12-7.122z" />
              </svg>
              <span>{backLabel}</span>
            </div>
            <span className="mgg-content-eyebrow">
              {eyebrowLabel} {plateLabel}{String(idx + 1).padStart(2, "0")}
            </span>
            <h2 className="mgg-content-title">{item.title}</h2>
            <p className="mgg-content-intro">{item.intro}</p>
            <span className="mgg-content-date">{item.date}</span>
            <div className="mgg-gallery">
              {item.galleryImages.map((src, i) => (
                <figure key={i}>
                  <img src={src} alt="" />
                  <figcaption>
                    <span>{item.captions[i % item.captions.length]}</span>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      ))}

      {enableCursor && (
        <div ref={cursorRef} className="mgg-cursor">
          <div className="mgg-cursor-ring" />
          <div className="mgg-cursor-dot" />
        </div>
      )}
    </div>
  );
}
