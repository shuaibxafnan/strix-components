"use client";

import { useEffect, useId, useRef, useState } from "react";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=Jost:wght@400;500;600&display=swap";

const DEFAULT_PARAGRAPHS = [
  "Then they opened the firmaments and the Light descended below to the lower regions and to those who were without form, having no true likeness. It was thus that they got the likeness of the Light for themselves. Some rejoiced because the Light had come to them, and that they had been made rich thereby. Others mourned because they were made poor and that which they thought they had was taken away from them. Thus came He, who went forth full of grace, and was taken captive with a captivity. A light of glory was given to the aeons who had received the Spark, and guardian spirits were sent to them, and those who are with them. They bring help to those who have believed in the Spark of Light.",
  "Now in the Space of the Indivisible Atom are twelve Founts, above which are the twelve Paternities who surround the Indivisible Queen like Deeps or like Skies and make for Her a crown in which is every kind of life: all modes of Triple-powered life, of Uncontainable life, of Infinite life, of Ineffable life, of Silent life, of Unknown life, of Solitary life, of Unshakable life, of First-manifested life, of Self-born life, of True life. All is therein. Every species is in it, all Gnoses and every power which has received the Light, yea, all Mind manifests itself therein. This is the Crown which the Father of the Universe has placed upon the Indivisible Queen with three hundred and sixty-five kinds in it, brilliant and filling the Universe with an incorruptible and unfailing light.",
];


export default function ThumbnailExpand({
  bgColor = "#E9E6E2",
  textColor = "#111110",
  footerBgColor = "#DAD6CF",
  cursorFill = "#C5B4B2",
  cursorSize = 30,
  cursorHoverScale = 4.5,
  heroImage = "https://images.unsplash.com/photo-1725161834547-ba8a90bf5a15?auto=format&fit=crop&w=720&q=80",
  bodyImage = "https://images.unsplash.com/photo-1782806007529-90a2ab4b98d9?auto=format&fit=crop&w=720&q=80",
  leftThumb = {
    image:
      "https://images.unsplash.com/photo-1779877716206-f441d5d384d4?auto=format&fit=crop&w=720&q=80",
    number: "07",
    title: "Into Light",
  },
  rightThumb = {
    image:
      "https://images.unsplash.com/photo-1779862946918-a129ac57c60e?auto=format&fit=crop&w=720&q=80",
    number: "02",
    title: "Surrender",
  },
  metaNumber = "01",
  title = "Gnostic Love",
  subtitle = "What is wanted is not the will to believe, but the wish to find out, which is its exact opposite.",
  paragraphs = DEFAULT_PARAGRAPHS,
  pullQuote = "The Crown that the Deathless pray for",
  footerLabel = "Selected Works",
  footerNextLabel = "Next Project",
  imageHeightStart = 555,
  imageWidthEnd = 260,
  imageHeightEnd = 320,
  metaOffset = 100,
  contentWidth = 850,
  contentPadding = 50,
  expandDuration = 1,
  expandEase = "expo.inOut",
  textRevealDuration = 0.8,
  textRevealStagger = 0.3,
  textRevealRotation = 3,
  hoverScale = 1.2,
  hoverDuration = 1,
  sideThumbShiftX = "25%",
  sideThumbRotateY = 15,
  sideThumbOpacity = 0.8,
  sideThumbExitX = "150%",
  sideThumbExitRotateY = 45,
  parallaxStrength = 0.18,
  displayFont = "'Playfair Display', serif",
  bodyFont = "'Jost', sans-serif",
  loadGoogleFonts = true,
  className = "",
}) {
  const rawId = useId();
  const uid = "tfx-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const introRef = useRef(null);
  const introImgRef = useRef(null);
  const introImgWrapRef = useRef(null);
  const metaRef = useRef(null);
  const metaTitleRef = useRef(null);
  const titleBlockRef = useRef(null);
  const subtitleBlockRef = useRef(null);
  const sideThumbsRef = useRef([]);
  const cursorRef = useRef(null);
  const bodyImageRef = useRef(null);

  const isThumbViewRef = useRef(true);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loadGoogleFonts) return;
    if (document.querySelector('link[data-id="' + FONTS_HREF + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    link.setAttribute("data-id", FONTS_HREF);
    document.head.appendChild(link);
  }, [loadGoogleFonts]);

  useEffect(() => {
    let killed = false;
    let cleanup = () => {};

    import("gsap")
      .then((mod) => {
        if (killed) return;
        const gsap = mod.gsap || mod.default;
        const intro = introRef.current;
        const introImg = introImgRef.current;
        const meta = metaRef.current;
        if (!gsap || !intro || !introImg || !meta) return;

        const layout = () => {
          gsap.set([titleBlockRef.current, subtitleBlockRef.current], {
            y: "100%",
          });

          const winW = window.innerWidth;
          const winH = window.innerHeight;

          let introRect = intro.getBoundingClientRect();
          const scaleX = imageWidthEnd / winW;
          const scaleY = imageHeightEnd / imageHeightStart;
          const y = winH / 2 - introRect.top - introRect.height / 2;

          gsap.set(intro, { y: y, scaleX: scaleX, scaleY: scaleY });
          gsap.set(introImg, {
            scaleX: (1 / scaleX) * (imageWidthEnd / introImg.clientWidth),
            scaleY: (1 / scaleY) * (imageHeightEnd / introImg.clientHeight),
          });

          introRect = intro.getBoundingClientRect();
          const metaRect = meta.getBoundingClientRect();
          gsap.set(meta, {
            x: introRect.left - metaRect.left,
            y: introRect.top - metaRect.top - metaOffset,
          });
          gsap.set(metaTitleRef.current, { opacity: 1 });
        };

        layout();
        setReady(true);

        const sideThumbs = sideThumbsRef.current.filter(Boolean);

        const onEnter = () => {
          if (!isThumbViewRef.current) return;
          cursorApi.enter();
          gsap.to(introImgWrapRef.current, {
            duration: hoverDuration,
            ease: "expo",
            scale: hoverScale,
          });
          gsap.to(sideThumbs, {
            duration: 1,
            ease: "expo",
            opacity: sideThumbOpacity,
            x: (i) => (i ? sideThumbShiftX : "-" + sideThumbShiftX),
            rotateY: (i) => (i ? -sideThumbRotateY : sideThumbRotateY),
            z: 40,
          });
        };

        const onLeave = () => {
          if (!isThumbViewRef.current) return;
          cursorApi.leave();
          gsap.to(introImgWrapRef.current, {
            duration: hoverDuration,
            ease: "expo",
            scale: 1,
          });
          gsap.to(sideThumbs, {
            duration: 1,
            ease: "expo",
            opacity: 1,
            x: "0%",
            rotateY: 0,
            z: 0,
          });
        };

        const onClick = () => {
          if (!isThumbViewRef.current) return;
          isThumbViewRef.current = false;
          cursorApi.leave();

          gsap.to(sideThumbs, {
            duration: 0.8,
            ease: "power3.inOut",
            opacity: 0,
            x: (i) => (i ? sideThumbExitX : "-" + sideThumbExitX),
            rotateY: (i) => (i ? -sideThumbExitRotateY : sideThumbExitRotateY),
            z: 200,
          });

          gsap
            .timeline()
            .to(intro, {
              duration: expandDuration,
              ease: expandEase,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              onComplete: () => setExpanded(true),
            })
            .to(
              introImg,
              {
                duration: expandDuration,
                ease: expandEase,
                scaleX: 1,
                scaleY: 1,
              },
              0,
            )
            .to(
              introImgWrapRef.current,
              { duration: expandDuration, ease: expandEase, scale: 1 },
              0,
            )
            .to(
              metaTitleRef.current,
              { duration: 0.6, ease: expandEase, opacity: 0 },
              0,
            )
            .to(
              meta,
              { duration: expandDuration, ease: expandEase, x: 0, y: 0 },
              0,
            )
            .to(
              [titleBlockRef.current, subtitleBlockRef.current],
              {
                duration: textRevealDuration,
                ease: "expo",
                startAt: { rotation: textRevealRotation },
                y: "0%",
                rotation: 0,
                stagger: textRevealStagger,
              },
              0.7,
            );
        };

        const onResize = () => {
          if (!isThumbViewRef.current) return;
          intro.style.transform = "none";
          introImg.style.transform = "none";
          meta.style.transform = "none";
          layout();
        };

        const cursorEl = cursorRef.current;
        const state = {
          tx: { previous: 0, current: 0, amt: 0.2 },
          ty: { previous: 0, current: 0, amt: 0.2 },
          scale: { previous: 1, current: 1, amt: 0.15 },
        };
        let mouse = { x: 0, y: 0 };
        let rafId = null;
        let started = false;
        const half = cursorSize / 2;

        const cursorApi = {
          enter: () => {
            state.scale.current = cursorHoverScale;
          },
          leave: () => {
            state.scale.current = 1;
          },
        };

        const render = () => {
          state.tx.current = mouse.x - half;
          state.ty.current = mouse.y - half;
          for (const key in state) {
            state[key].previous =
              (1 - state[key].amt) * state[key].previous +
              state[key].amt * state[key].current;
          }
          if (cursorEl) {
            cursorEl.style.transform =
              "translateX(" +
              state.tx.previous +
              "px) translateY(" +
              state.ty.previous +
              "px) scale(" +
              state.scale.previous +
              ")";
          }
          rafId = requestAnimationFrame(render);
        };

        const onMouseMove = (ev) => {
          mouse = { x: ev.clientX, y: ev.clientY };
          if (!started) {
            started = true;
            state.tx.previous = state.tx.current = mouse.x - half;
            state.ty.previous = state.ty.current = mouse.y - half;
            if (cursorEl) {
              gsap.to(cursorEl, {
                duration: 0.9,
                ease: "power3.out",
                opacity: 1,
              });
            }
            rafId = requestAnimationFrame(render);
          }
        };

        const onScroll = () => {
          const el = bodyImageRef.current;
          if (!el) return;
          const rect = el.parentElement.getBoundingClientRect();
          const offset =
            (window.innerHeight / 2 - (rect.top + rect.height / 2)) *
            parallaxStrength;
          el.style.transform = "translate3d(0," + offset + "px,0)";
        };

        const revealEls = rootRef.current
          ? rootRef.current.querySelectorAll("[data-reveal]")
          : [];
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting)
                entry.target.setAttribute("data-inview", "true");
            });
          },
          { threshold: 0.15 },
        );
        revealEls.forEach((el) => observer.observe(el));

        intro.addEventListener("click", onClick);
        intro.addEventListener("mouseenter", onEnter);
        intro.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", onResize);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("scroll", onScroll, { passive: true });

        cleanup = () => {
          intro.removeEventListener("click", onClick);
          intro.removeEventListener("mouseenter", onEnter);
          intro.removeEventListener("mouseleave", onLeave);
          window.removeEventListener("resize", onResize);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("scroll", onScroll);
          observer.disconnect();
          if (rafId) cancelAnimationFrame(rafId);
          gsap.killTweensOf([
            intro,
            introImg,
            meta,
            introImgWrapRef.current,
            metaTitleRef.current,
            titleBlockRef.current,
            subtitleBlockRef.current,
            cursorEl,
            ...sideThumbs,
          ]);
        };
      })
      .catch(() => {
        setReady(true);
      });

    return () => {
      killed = true;
      cleanup();
    };
  }, []);

  const scopedCss =
    "#" +
    uid +
    " .anim-block-wrap{position:relative;overflow:hidden}" +
    "#" +
    uid +
    " .anim-block{display:block}" +
    "#" +
    uid +
    " [data-reveal]{transform:translateY(100%);opacity:0;transition:transform .8s cubic-bezier(.2,1,.3,1),opacity .8s cubic-bezier(.2,1,.3,1)}" +
    "#" +
    uid +
    " [data-reveal][data-inview='true']{transform:translateY(0);opacity:1}" +
    "@media (prefers-reduced-motion: reduce){#" +
    uid +
    " [data-reveal]{transition:none}}" +
    "@media (any-pointer: coarse){#" +
    uid +
    " .tfx-cursor{display:none}}";

  const breakoutStyle = {
    width: "100vw",
    left: "50%",
    right: "50%",
    marginLeft: "-50vw",
    marginRight: "-50vw",
  };

  const innerStyle = {
    maxWidth: contentWidth + "px",
    paddingLeft: contentPadding + "px",
    paddingRight: contentPadding + "px",
  };

  const bodyImageWrapHeight =
    ((contentWidth - contentPadding) * 828) / 1000 - 100;
  const bodyImageHeight = ((contentWidth - contentPadding) * 828) / 1000;

  const renderThumb = (thumb, index) => (
    <div
      ref={(el) => {
        sideThumbsRef.current[index] = el;
      }}
      className="relative flex flex-col justify-center text-[0.85rem] will-change-transform"
      style={{ width: imageWidthEnd + "px" }}
    >
      <span
        className="absolute bottom-full font-bold uppercase tracking-wide"
        style={{
          transform: "translateY(calc(-1 * " + metaOffset + "px + 100%))",
        }}
      >
        {thumb.number}
      </span>
      <div
        className="w-full bg-cover bg-center"
        style={{
          height: imageHeightEnd + "px",
          backgroundImage: "url(" + thumb.image + ")",
        }}
      />
      <span
        className="absolute left-0 top-full uppercase tracking-wide"
        style={{ transform: "translateY(calc(" + metaOffset + "px - 100%))" }}
      >
        {thumb.title}
      </span>
    </div>
  );

  return (
    <div
      id={uid}
      ref={rootRef}
      className={"relative w-full text-[15px] antialiased " + className}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
      }}
    >
      <style>{scopedCss}</style>

      <div
        className="pointer-events-none fixed inset-0 z-[1000] transition-opacity duration-500"
        style={{
          backgroundColor: bgColor,
          opacity: ready ? 0 : 1,
          visibility: ready ? "hidden" : "visible",
        }}
      />

      <main className="relative overflow-x-clip">
        <section
          ref={contentRef}
          className={
            "relative " +
            (expanded
              ? "h-auto overflow-visible pointer-events-auto"
              : "h-screen overflow-hidden pointer-events-none")
          }
        >
          <div className="mx-auto" style={innerStyle}>
            <header className="flex flex-col pt-40">
              <div
                ref={metaRef}
                className="relative text-[0.85rem] uppercase"
                style={{ width: imageWidthEnd + "px" }}
              >
                <span className="font-bold">{metaNumber}</span>
                <span
                  ref={metaTitleRef}
                  className="absolute left-0 top-0 uppercase opacity-0"
                  style={{
                    transform:
                      "translateY(calc(" +
                      metaOffset * 2 +
                      "px + " +
                      imageHeightEnd +
                      "px)) translateY(-100%)",
                  }}
                >
                  {title}
                </span>
              </div>

              <h2
                className="anim-block-wrap my-4 leading-none"
                style={{
                  fontFamily: displayFont,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  fontSize: "clamp(1.5rem, 10vw, 8rem)",
                }}
              >
                <span ref={titleBlockRef} className="anim-block">
                  {title}
                </span>
              </h2>

              <p
                className="anim-block-wrap mb-12 mt-2 text-[1.25rem] leading-[1.2]"
                style={{ fontFamily: displayFont, fontWeight: 600 }}
              >
                <span ref={subtitleBlockRef} className="anim-block">
                  {subtitle}
                </span>
              </p>

              <div className="relative mb-0" style={breakoutStyle}>
                <div
                  ref={introRef}
                  className="pointer-events-auto flex cursor-pointer items-center overflow-hidden will-change-transform"
                  style={{ height: imageHeightStart + "px" }}
                >
                  <div ref={introImgWrapRef} className="will-change-transform">
                    <img
                      ref={introImgRef}
                      src={heroImage}
                      alt=""
                      className="relative h-auto w-screen select-none"
                      draggable="false"
                    />
                  </div>
                </div>
              </div>
            </header>

            <div
              className={
                "pb-40 font-normal leading-[1.6] transition-opacity duration-500 md:grid md:grid-cols-[50%_25%_25%] md:items-start " +
                (expanded ? "opacity-100" : "opacity-0")
              }
            >
              <p className="my-16 px-4 text-left md:col-[1/span_2] md:text-right">
                {paragraphs[0]}
              </p>

              <p data-reveal className="my-16 px-4 md:col-[3]">
                <strong>{pullQuote}</strong>
              </p>

              <div
                className="relative my-16 flex w-full items-center justify-center overflow-hidden md:col-[1/span_3] md:my-16"
                style={{ height: bodyImageWrapHeight + "px" }}
              >
                <div
                  ref={bodyImageRef}
                  className="w-full bg-cover bg-center will-change-transform"
                  style={{
                    height: bodyImageHeight + "px",
                    backgroundImage: "url(" + bodyImage + ")",
                  }}
                />
              </div>

              <p className="my-16 px-4 md:col-[2/span_2]">{paragraphs[1]}</p>
            </div>
          </div>

          <footer
            className="relative px-16 pb-14 pt-12"
            style={Object.assign({}, breakoutStyle, {
              backgroundColor: footerBgColor,
            })}
          >
            <div
              className="mx-auto text-left md:grid md:grid-cols-2 md:items-center"
              style={innerStyle}
            >
              <span className="text-[0.85rem] uppercase tracking-wide">
                {footerLabel}
              </span>
              <span
                data-reveal
                className="block text-[3rem]"
                style={{ fontFamily: displayFont, fontWeight: 600 }}
              >
                {footerNextLabel}
              </span>
            </div>
          </footer>
        </section>

        <section
          className="pointer-events-none fixed inset-0 hidden h-screen w-full items-center justify-between p-11 md:flex"
          style={{ perspective: "1000px" }}
        >
          {renderThumb(leftThumb, 0)}
          {renderThumb(rightThumb, 1)}
        </section>
      </main>

      <svg
        ref={cursorRef}
        className="tfx-cursor pointer-events-none fixed left-0 top-0 z-[900] opacity-0 mix-blend-color-burn"
        width={cursorSize}
        height={cursorSize}
        viewBox={"0 0 " + cursorSize + " " + cursorSize}
      >
        <circle
          cx={cursorSize / 2}
          cy={cursorSize / 2}
          r={cursorSize / 4}
          fill={cursorFill}
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
