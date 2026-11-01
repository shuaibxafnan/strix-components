"use client";

import { useEffect, useId, useRef, useState } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1749330513873-09ffa91b0aae?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778789172736-e8ba37c71124?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1778961938903-96617183f739?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1678112553355-a9dab855ebf3?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1634325232058-e7b8f80cc20b?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1759458856846-097935f54111?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1533387520709-752d83de3630?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1752150127767-77bccbed07e2?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781935307999-e8bb5e62ebb1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1595598034023-ca08624ce05d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781798715946-2e198afc29a7?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780580940878-248a6ad4b626?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const pick = (start, count) => {
  const out = [];
  for (let i = 0; i < count; i++) out.push(IMAGES[(start + i) % IMAGES.length]);
  return out;
};

const DEFAULT_ITEMS = [
  {
    label: "Cogno Frank",
    title: "Cogno Frank",
    text: "My cold human, you inspire me to write.\nI love the way you pray, resist and fly,\nInvading my mind day and through the night,\nAlways dreaming about the hot hereby.",
    images: pick(0, 7),
  },
  {
    label: "Loca di Marta",
    title: "Loca di Marta",
    text: "Let me compare you to a green balloon?\nYou are more dandy, bandy and freaky.\nBig sun heats the handy peaches of June,\nAnd summertime has the randy rekey.",
    images: pick(7, 7),
  },
  {
    label: "Missy Mac Blue",
    title: "Missy Mac Blue",
    text: "How do I love you? Let me count the ways.\nI love your lovely heart, soul and head.\nThinking of your sandy soul fills my days.\nMy love for you is the cheeky embed.",
    images: pick(14, 7),
  },
  {
    label: "Luxtroc Chunk",
    title: "Luxtroc Chunk",
    text: "My cold human, you inspire me to write.\nI love the way you pray, resist and fly,\nInvading my mind day and through the night,\nAlways dreaming about the hot hereby.",
    images: pick(21, 7),
  },
  {
    label: "Muck Galli",
    title: "Muck Galli",
    text: "Let me compare you to a green balloon?\nYou are more dandy, bandy and freaky.\nBig sun heats the handy peaches of June,\nAnd summertime has the randy rekey.",
    images: pick(3, 7),
  },
  {
    label: "Iris Catapult",
    title: "Iris Catapult",
    text: "How do I love you? Let me count the ways.\nI love your lovely heart, soul and head.\nThinking of your sandy soul fills my days.\nMy love for you is the cheeky embed.",
    images: pick(11, 7),
  },
];

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,200;0,300;0,400;1,200;1,300;1,400&display=swap";

const loadFonts = (href) => {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-id="' + href + '"]')) return;
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = href;
  el.setAttribute("data-id", href);
  document.head.appendChild(el);
};

const splitChars = (str) =>
  str.split("").map((c, i) => ({ c: c === " " ? "\u00A0" : c, i }));

export default function MenuThumbStack({
  items = DEFAULT_ITEMS,
  bgColor = "#101010",
  textColor = "#6d6d6d",
  menuColor = "#e84e77",
  menuHoverColor = "#ffffff",
  contentColor = "#ffffff",
  fontStyle = "italic",
  hoverImageCount = 3,
  openImageScale = 0.9,
  openPadding = 60,
  letterSpacing = "-0.01em",
  fontFamily = "Epilogue, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  loadGoogleFonts = true,
  menuFontSize = "clamp(2rem, 5.2vw, 5rem)",
  menuFontWeight = 300,
  titleFontWeight = 300,
  menuGap = "0.9rem",
  titleFontSize = "clamp(2.5rem, 7vw, 6.5rem)",
  menuOffsets = ["0vw", "-6vw", "-9vw", "10vw", "-6vw", "0vw"],
  stackGap = "5vh",
  stackImageWidth = "clamp(180px, 20vw, 300px)",
  stackImageHeight = "clamp(240px, 26vw, 400px)",
  stackOpacity = 0.5,
  imageGap = 40,
  imageRise = 35,
  openDuration = 1.6,
  closeDuration = 1.4,
  charSpread = 17,
  itemDrift = 10,
  stackDriftX = 50,
  stackDriftY = 100,
  driftEase = 0.07,
  hoverDelay = 125,
  showGrain = true,
  grainOpacity = 0.35,
  closeLabel = "Close",
  className = "",
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef(null);
  const apiRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    if (loadGoogleFonts) loadFonts(FONTS_HREF);
  }, [loadGoogleFonts]);

  useEffect(() => {
    let cancelled = false;
    let cleanups = [];

    import("gsap")
      .then((mod) => {
        if (cancelled) return;
        const gsap = mod.gsap || mod.default;
        const root = rootRef.current;
        if (!gsap || !root) return;

        const win = { w: window.innerWidth, h: window.innerHeight };
        const mouse = { x: win.w / 2, y: win.h / 2 };
        const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
        const lerp = (a, b, n) => (1 - n) * a + n * b;

        const onResize = () => {
          win.w = window.innerWidth;
          win.h = window.innerHeight;
        };
        const onMove = (ev) => {
          mouse.x = ev.clientX;
          mouse.y = ev.clientY;
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("mousemove", onMove);
        cleanups.push(() => {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("mousemove", onMove);
        });

        const makeDrifter = (el, bounds) => {
          const vals = { tx: 0, ty: 0, r: 0 };
          let raf;
          const render = () => {
            raf = undefined;
            vals.tx = lerp(
              vals.tx,
              map(mouse.x, 0, win.w, -bounds.x, bounds.x),
              driftEase,
            );
            vals.ty = lerp(
              vals.ty,
              map(mouse.y, 0, win.h, -bounds.y, bounds.y),
              driftEase,
            );
            vals.r = lerp(
              vals.r,
              map(mouse.x, 0, win.w, -(bounds.r || 0), bounds.r || 0),
              driftEase,
            );
            gsap.set(el, { x: vals.tx, y: vals.ty, rotation: vals.r });
            start();
          };
          const start = () => {
            if (!raf) raf = requestAnimationFrame(render);
          };
          const stop = () => {
            if (raf) {
              cancelAnimationFrame(raf);
              raf = undefined;
            }
          };
          return { start, stop };
        };

        const itemEls = [].slice.call(root.querySelectorAll("[data-menu-item]"));
        const stackEls = [].slice.call(root.querySelectorAll("[data-stack]"));

        const units = itemEls.map((el, i) => {
          const stack = stackEls[i];
          const images = [].slice.call(stack.querySelectorAll("img"));
          const content = root.querySelector('[data-content="' + i + '"]');
          const titleChars = [].slice.call(
            content.querySelectorAll("[data-char]"),
          );
          const text = content.querySelector("[data-text]");
          const chars = [].slice.call(el.querySelectorAll("[data-char]"));
          return {
            el,
            stack,
            images,
            hoverImages: images.slice(0, hoverImageCount),
            restImages: images.slice(hoverImageCount),
            content,
            titleChars,
            text,
            chars,
            itemDrifter: makeDrifter(el, {
              x: gsap.utils.random(-itemDrift, itemDrift),
              y: gsap.utils.random(-itemDrift * 1.5, itemDrift * 1.5),
              r: gsap.utils.random(-2, 2),
            }),
            stackDrifter: makeDrifter(stack, { x: stackDriftX, y: stackDriftY }),
            timer: 0,
          };
        });

        const closeCtrl = root.querySelector("[data-close]");
        const state = { open: false, animating: false, current: -1 };

        const glitchIn = (u) => {
          gsap.killTweensOf(u.stack);
          gsap.set(u.restImages, { display: "none" });
          gsap
            .timeline()
            .set(u.stack, { opacity: stackOpacity }, 0.04)
            .set(u.hoverImages, { x: () => gsap.utils.random(-8, 8) + "%" }, 0.04)
            .set(u.stack, { opacity: stackOpacity * 0.4 }, "+=0.04")
            .set(
              u.hoverImages,
              {
                x: () => gsap.utils.random(-8, 8) + "%",
                rotation: () => gsap.utils.random(-2, 2),
              },
              "+=0.04",
            )
            .set(u.stack, { opacity: stackOpacity }, "+=0.04")
            .set(u.hoverImages, { x: "0%", y: "0%", rotation: 0 }, "+=0.04");
        };

        const glitchOpen = (u) => {
          gsap.killTweensOf(u.stack);
          gsap
            .timeline()
            .set(u.stack, { opacity: 0.2 }, 0.04)
            .set(
              u.images,
              {
                x: () => "+=" + gsap.utils.random(-15, 15) + "%",
                y: () => "+=" + gsap.utils.random(-15, 15) + "%",
                opacity: () => gsap.utils.random(1, 10) / 10,
              },
              0.08,
            )
            .set(u.stack, { opacity: 0.4 }, "+=0.04")
            .set(
              u.images,
              {
                y: () => "+=" + gsap.utils.random(-8, 8) + "%",
                rotation: () => gsap.utils.random(-2, 2),
                opacity: () => gsap.utils.random(1, 10) / 10,
                scale: (_, t) =>
                  (t.dataset.s ? parseFloat(t.dataset.s) : 1) *
                  (gsap.utils.random(75, 95) / 100),
              },
              "+=0.06",
            )
            .set(u.stack, { opacity: 1 }, "+=0.06")
            .set(
              u.images,
              {
                x: (_, t) => t.dataset.tx,
                y: (_, t) => t.dataset.ty,
                rotation: (_, t) => t.dataset.r,
                opacity: 1,
                scale: (_, t) => (t.dataset.s ? parseFloat(t.dataset.s) : 1),
              },
              "+=0.06",
            );
        };

        const layoutImages = (u, setOnly) => {
          const count = u.images.length;
          const natural = u.images[0] ? u.images[0].offsetWidth : 0;
          const avail = win.w - openPadding * 2;
          const needed = count * natural + imageGap * (count - 1);
          const fit = needed > 0 ? Math.min(1, avail / needed) : 1;
          const s = fit * openImageScale;
          const w = natural * s;
          const total = count * w + imageGap * (count - 1);
          const startX = (win.w - total) / 2;

          let n = -1;
          const cfg = {
            scale: (_, t) => {
              t.dataset.s = s;
              return s;
            },
            x: (_, t) => {
              n++;
              const center = startX + n * (w + imageGap) + w / 2;
              const tx = center - win.w / 2;
              t.dataset.tx = tx;
              return tx;
            },
            y: (_, t) => {
              const ty =
                win.h / 2 -
                (t.offsetTop + t.offsetHeight / 2) +
                (n % 2 ? imageRise : -imageRise);
              t.dataset.ty = ty;
              return ty;
            },
            rotation: (_, t) => {
              const r =
                n % 2 ? gsap.utils.random(3, 7) : gsap.utils.random(-7, -3);
              t.dataset.r = r;
              return r;
            },
            stagger: { grid: "auto", from: "center", amount: 0.2 },
          };
          if (setOnly) {
            gsap.set(u.images, cfg);
            return null;
          }
          return Object.assign(
            { duration: openDuration, ease: "expo.inOut" },
            cfg,
          );
        };

        const open = (pos) => {
          if (state.current === pos || state.open || state.animating) return;
          state.open = true;
          state.animating = true;
          state.current = pos;
          const u = units[pos];

          u.stackDrifter.stop();
          units.forEach((x) => x.itemDrifter.stop());
          setOpenIndex(pos);

          const tl = gsap.timeline({
            onComplete: () => {
              state.animating = false;
            },
          });
          apiRef.current.openTl = tl;

          gsap.set(u.images, { display: "block" });

          tl.set([u.titleChars, u.text], { opacity: 0 }, 0)
            .to(
              u.stack,
              {
                duration: openDuration,
                ease: "expo.inOut",
                opacity: 1,
                x: "0%",
                y: "0%",
              },
              0,
            )
            .to(u.images, layoutImages(u, false), 0)
            .to(
              u.titleChars,
              {
                duration: 0.8,
                ease: "power4.out",
                opacity: 1,
                startAt: {
                  x: (p, _, arr) => charSpread * (p - arr.length / 2),
                },
                x: 0,
                stagger: { grid: "auto", from: "center" },
              },
              1,
            )
            .to(
              u.text,
              {
                duration: 1.8,
                ease: "power4.out",
                opacity: 1,
                startAt: { y: "10%" },
                y: "0%",
              },
              1,
            )
            .set(closeCtrl, { opacity: 0 }, 0)
            .to(closeCtrl, { duration: 1, opacity: 1 }, 0.5);

          units.forEach((x) => {
            tl.to(
              x.chars,
              {
                duration: 0.8,
                ease: "power4.in",
                opacity: 0,
                x: (p, _, arr) => charSpread * (p - arr.length / 2),
                stagger: { grid: "auto", from: "center" },
              },
              0,
            );
          });
        };

        const close = () => {
          if (!state.open || state.animating) return;
          state.animating = true;
          const u = units[state.current];

          const tl = gsap.timeline({
            onComplete: () => {
              state.current = -1;
              state.animating = false;
              setOpenIndex(-1);
            },
          });
          apiRef.current.closeTl = tl;

          tl.add(() => {
            state.open = false;
          }, 0.8)
            .to(closeCtrl, { duration: 0.5, opacity: 0 }, 0)
            .to(
              u.titleChars,
              {
                duration: 0.8,
                ease: "power4.in",
                opacity: 0,
                x: (p, _, arr) => charSpread * (p - arr.length / 2),
                stagger: { grid: "auto", from: "center" },
              },
              0,
            )
            .to(
              u.text,
              { duration: 0.8, ease: "power4.in", opacity: 0, y: "10%" },
              0,
            )
            .to(
              u.images,
              {
                duration: closeDuration,
                ease: "expo.inOut",
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                stagger: { grid: "auto", from: "center", amount: -0.2 },
              },
              0,
            )
            .to(
              u.stack,
              { duration: closeDuration, ease: "power2.inOut", opacity: 0 },
              0,
            );

          units.forEach((x) => {
            x.itemDrifter.start();
            tl.to(
              x.chars,
              {
                duration: 1.2,
                ease: "power4.out",
                opacity: 1,
                x: 0,
                stagger: { grid: "auto", from: "center" },
              },
              1.1,
            );
          });
        };

        apiRef.current = { open, close, state };

        units.forEach((u, pos) => {
          u.itemDrifter.start();

          const onClick = (ev) => {
            ev.preventDefault();
            open(pos);
          };
          const onEnter = () => {
            if (state.open) return;
            u.stackDrifter.start();
            u.timer = setTimeout(() => glitchIn(u), hoverDelay);
          };
          const onLeave = () => {
            if (state.open) return;
            clearTimeout(u.timer);
            u.stackDrifter.stop();
            gsap.killTweensOf(u.stack);
            gsap.set(u.stack, { opacity: 0 });
          };

          u.el.addEventListener("click", onClick);
          u.el.addEventListener("mouseenter", onEnter);
          u.el.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            clearTimeout(u.timer);
            u.itemDrifter.stop();
            u.stackDrifter.stop();
            u.el.removeEventListener("click", onClick);
            u.el.removeEventListener("mouseenter", onEnter);
            u.el.removeEventListener("mouseleave", onLeave);
          });
        });

        const onCloseClick = () => close();
        const onCloseEnter = () => {
          if (state.current > -1) glitchOpen(units[state.current]);
        };
        closeCtrl.addEventListener("click", onCloseClick);
        closeCtrl.addEventListener("mouseenter", onCloseEnter);

        const onWinResize = () => {
          if (!state.open || state.current < 0) return;
          layoutImages(units[state.current], true);
        };
        window.addEventListener("resize", onWinResize);

        cleanups.push(() => {
          closeCtrl.removeEventListener("click", onCloseClick);
          closeCtrl.removeEventListener("mouseenter", onCloseEnter);
          window.removeEventListener("resize", onWinResize);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      cleanups = [];
      apiRef.current = null;
    };
  }, [
    items,
    driftEase,
    itemDrift,
    stackDriftX,
    stackDriftY,
    hoverDelay,
    stackOpacity,
    imageGap,
    imageRise,
    openDuration,
    closeDuration,
    charSpread,
    hoverImageCount,
    openImageScale,
    openPadding,
  ]);

  const scopedCss =
    "#" +
    uid +
    "-root [data-menu-item]{color:" +
    menuColor +
    ";}" +
    "#" +
    uid +
    "-root [data-menu-item]:hover,#" +
    uid +
    "-root [data-menu-item][data-current='true']{color:" +
    menuHoverColor +
    ";}" +
    "#" +
    uid +
    "-root [data-close]:hover{color:" +
    menuHoverColor +
    ";}" +
    "@keyframes " +
    uid +
    "grain{0%,100%{transform:translate(0,0);}10%{transform:translate(-5%,-10%);}20%{transform:translate(-15%,5%);}30%{transform:translate(7%,-25%);}40%{transform:translate(-5%,25%);}50%{transform:translate(-15%,10%);}60%{transform:translate(15%,0%);}70%{transform:translate(0%,15%);}80%{transform:translate(3%,35%);}90%{transform:translate(-10%,10%);}}" +
    "#" +
    uid +
    "-grain{animation:" +
    uid +
    "grain 8s steps(10) infinite;}";

  const grainUrl =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.55'/></svg>";

  return (
    <div
      id={uid + "-root"}
      ref={rootRef}
      className={"relative grid h-screen w-full place-items-center overflow-hidden " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: fontFamily,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />

      {showGrain ? (
        <div
          id={uid + "-grain"}
          className="pointer-events-none fixed left-[-50%] top-[-100%] z-[1] h-[300%] w-[300%]"
          style={{
            backgroundImage: "url(\"" + grainUrl + "\")",
            opacity: grainOpacity,
          }}
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        aria-hidden="true"
      >
        {items.map((item, i) => (
          <div
            key={i}
            data-stack
            className="pointer-events-none absolute left-0 top-0 grid h-screen w-full place-items-center content-center justify-center opacity-0"
            style={{ gap: stackGap }}
          >
            {(item.images || []).map((src, j) => (
              <img
                key={j}
                src={src}
                alt=""
                className="block object-cover will-change-transform"
                style={{ width: stackImageWidth, height: stackImageHeight }}
              />
            ))}
          </div>
        ))}
      </div>

      <nav
        className="relative z-[10] col-start-1 row-start-1 grid place-items-center"
        style={{
          gap: menuGap,
          pointerEvents: openIndex > -1 ? "none" : "auto",
        }}
      >
        {items.map((item, i) => (
          <a
            key={i}
            data-menu-item
            data-current={openIndex === i ? "true" : "false"}
            className="cursor-pointer select-none uppercase leading-[0.9] will-change-transform"
            style={{
              fontSize: menuFontSize,
              fontWeight: menuFontWeight,
              fontStyle: fontStyle,
              letterSpacing: letterSpacing,
              marginLeft: menuOffsets[i % menuOffsets.length],
              transform: "translate3d(0,0,0)",
            }}
          >
            {splitChars(item.label).map((ch) => (
              <span
                key={ch.i}
                data-char
                className="inline-block will-change-transform"
              >
                {ch.c}
              </span>
            ))}
          </a>
        ))}
      </nav>

      <section className="pointer-events-none col-start-1 row-start-1 z-[20] grid w-full place-items-center overflow-hidden">
        {items.map((item, i) => (
          <div
            key={i}
            data-content={i}
            className="col-start-1 row-start-1 grid h-screen place-items-center"
            style={{
              opacity: openIndex === i ? 1 : 0,
              pointerEvents: openIndex === i ? "auto" : "none",
            }}
          >
            <h2
              className="col-start-1 row-start-1 m-0 whitespace-nowrap uppercase"
              style={{
                color: contentColor,
                fontSize: titleFontSize,
                fontWeight: titleFontWeight,
                  letterSpacing: letterSpacing,
              }}
            >
              {splitChars(item.title).map((ch) => (
                <span
                  key={ch.i}
                  data-char
                  className="inline-block will-change-transform"
                >
                  {ch.c}
                </span>
              ))}
            </h2>
            <p
              data-text
              className="col-start-1 row-start-1 relative mx-auto mb-12 max-w-[50ch] self-end text-center text-[1.1rem] leading-relaxed will-change-transform"
              style={{ whiteSpace: "pre-line" }}
            >
              {item.text}
            </p>
          </div>
        ))}

        <button
          data-close
          type="button"
          className="absolute right-4 top-3 z-[150] m-0 border-0 bg-transparent p-0 text-sm uppercase tracking-wider leading-none opacity-0"
          style={{
            color: menuColor,
            fontFamily: "inherit",
            fontWeight: 500,
            cursor: "pointer",
            pointerEvents: openIndex > -1 ? "auto" : "none",
          }}
        >
          <span className="mr-1 text-[120%]">&#10539;</span>
          <span>{closeLabel}</span>
        </button>
      </section>
    </div>
  );
}