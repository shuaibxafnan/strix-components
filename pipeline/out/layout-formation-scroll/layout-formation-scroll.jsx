"use client";

import { useEffect, useRef } from "react";

const DEFAULT_IMAGES = [
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

const POS = {
  1: "1/1",
  2: "1/3",
  3: "1/4",
  4: "1/5",
  5: "1/7",
  6: "2/1",
  7: "2/3",
  8: "2/4",
  9: "2/6",
  10: "2/7",
  11: "2/8",
  12: "3/1",
  13: "3/2",
  14: "3/4",
  15: "3/5",
  16: "3/7",
  17: "3/8",
  18: "2/5",
};
const areaOf = (n) => `[grid-area:${POS[n]}]`;

const GRID1_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export default function LayoutFormationScroll({
  name = "Lennox Montgomery",
  tagline = "Layout Formation on Scroll",
  logoText = "LM",
  tags = ["#scroll", "#grid"],
  bgColor = "#0e0d0e",
  frameBgColor = "#7a7364",
  textColor = "#f5f3ee",
  images = DEFAULT_IMAGES,
  introText = "Welcome to the portfolio. In a world dominated by speed and constant motion, this photography invites you to slow down and immerse yourself in a visual experience that touches human fragility.",
  aboutText = "The lens captures the quiet ache of reality, where shadow and light blur the line between seen and felt. Soft, muted tones breathe life into the ordinary, revealing textures hidden in plain sight.",
  lifeText = "Born amid the gentle interplay of light and shadow in the city's quieter corners, the eye was drawn early on to the unnoticed beauty in the mundane, the softness in the grit.",
  workEthicsText = "Driven by a strong sense of discipline and dedication, the work reflects a deep commitment to craft and personal growth, with a relentless focus on innovation and detail.",
  inspirationText = "Inspiration comes from the quiet, in-between moments of everyday life — the fleeting light at dawn, the subtle movement of shadows, the way stillness can carry untold stories.",
  processText = "The creative process begins with stillness and observation, letting the moment speak before any action is taken, immersing in the quiet shifts of light, texture, and mood.",
  collaborationsText = "Known for openness to new ideas and innovative approaches, the work thrives on the energy of collaborating with fellow artists, designers, and creative professionals.",
  styleText = "The style is rooted in subtlety and restraint, capturing the delicate balance between light and shadow, presence and absence, favoring soft textures and a timeless aesthetic.",
  futureText = "Looking ahead, the work envisions diving deeper into the exploration of intimacy and impermanence, blending photography with film and sound for immersive experiences.",
  title1 = "Rawness",
  subtitle1 = "Captured in every moment",
  title2 = "Explorations",
  subtitle2 = "Nothing left unseen",
  title3 = "Unspoken",
  subtitle3 = "Love will not save us",
  scrubSpeed = 0.4,
  lerp = 0.15,
  scrollHint = "Scroll to explore",
  contactText = "Interested in collaborating or just want to say hello? Reach out — always open to new projects and conversations.",
  grid2Items = [
    { label: "Vision", text: "Unveiling the unseen" },
    { label: "Focus", text: "Where color meets form" },
    { label: "Essence", text: "Moments in motion" },
  ],
  grid3Items = [
    { label: "Craft", text: "Craft reveals the quiet beauty in life's fleeting moments." },
    { label: "Perspective", text: "Perspective finds depth in stillness, where the unseen speaks." },
  ],
  grid7Items = [
    { label: "Opalescent", text: "Two hearts glow softly, bound by a love so pure." },
    { label: "Softness", text: "Blissful serenity embraces the world in gentle tones." },
  ],
  className = "",
}) {
  const rootRef = useRef(null);
  const img = (i) =>
    images[((i % images.length) + images.length) % images.length];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let lenisInstance;
    let rafCallback;
    let gsap;
    let scrollTriggers = [];

    const preloadImages = (selector) =>
      new Promise((resolve) => {
        const els = Array.from(root.querySelectorAll(selector));
        if (els.length === 0) {
          resolve();
          return;
        }
        let loaded = 0;
        const done = () => {
          loaded += 1;
          if (loaded >= els.length) resolve();
        };
        els.forEach((el) => {
          const bg = el.style.backgroundImage;
          const url = bg.slice(5, -2);
          if (!url) {
            done();
            return;
          }
          const image = new Image();
          image.onload = done;
          image.onerror = done;
          image.src = url;
        });
      });

    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")])
      .then(([gsapMod, stMod, lenisMod]) =>
        preloadImages(".lfs-img").then(() => ({ gsapMod, stMod, lenisMod })),
      )
      .then(({ gsapMod, stMod, lenisMod }) => {
        if (cancelled) return;
        gsap = gsapMod.gsap || gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const Lenis = lenisMod.default;

        gsap.registerPlugin(ScrollTrigger);
        root.classList.remove("lfs-loading");

        lenisInstance = new Lenis({ lerp });
        lenisInstance.on("scroll", ScrollTrigger.update);
        rafCallback = (time) => lenisInstance.raf(time * 1000);
        gsap.ticker.add(rafCallback);
        gsap.ticker.lagSmoothing(0);

        const frame = root.querySelector(".lfs-frame");

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: frame,
              start: "clamp(top bottom)",
              end: "bottom top",
              scrub: true,
            },
          })
          .to(frame, {
            yPercent: 35,
            scale: 0.95,
            startAt: { filter: "brightness(100%)" },
            filter: "brightness(30%)",
          });

        const grid1 = root.querySelector("[data-grid-1]");
        gsap
          .timeline({
            defaults: { ease: "sine" },
            scrollTrigger: {
              trigger: grid1,
              start: "center center",
              end: "+=250%",
              pin: grid1.parentNode,
              scrub: scrubSpeed,
            },
          })
          .from(grid1.querySelectorAll(".lfs-img"), {
            stagger: 0.07,
            y: () =>
              gsap.utils.random(window.innerHeight, window.innerHeight * 1.8),
          })
          .from(
            grid1.parentNode.querySelector(".lfs-title"),
            { duration: 1.2, ease: "power4", yPercent: 180, autoAlpha: 0 },
            0.8,
          );

        const grid2 = root.querySelector("[data-grid-2]");
        const grid2Images = grid2.querySelectorAll(".lfs-img");
        const midIndex = Math.floor(grid2Images.length / 2);
        gsap
          .timeline({
            defaults: { ease: "power3" },
            scrollTrigger: {
              trigger: grid2,
              start: "center center",
              end: "+=250%",
              pin: grid2.parentNode,
              scrub: scrubSpeed,
            },
          })
          .from(grid2Images, {
            stagger: { amount: 0.3, from: "center" },
            y: window.innerHeight,
            transformOrigin: "50% 0%",
            rotation: (pos) => {
              const dist = Math.abs(pos - midIndex);
              return pos < midIndex ? dist * 3 : dist * -3;
            },
          })
          .from(
            grid2.querySelectorAll(".lfs-item"),
            {
              stagger: { amount: 0.3, from: "center" },
              yPercent: 100,
              autoAlpha: 0,
            },
            0,
          );

        const grid3 = root.querySelector("[data-grid-3]");
        const grid3Images = grid3.querySelectorAll(".lfs-img");
        gsap
          .timeline({
            defaults: { ease: "power3" },
            scrollTrigger: {
              trigger: grid3,
              start: "center center",
              end: "+=200%",
              pin: grid3.parentNode,
              scrub: 0.2,
            },
          })
          .from(grid3Images, {
            stagger: 0.06,
            y: window.innerHeight,
            rotation: () => gsap.utils.random(-15, 15),
            transformOrigin: "50% 0%",
          })
          .fromTo(
            grid3Images,
            { filter: "brightness(100%)" },
            {
              ease: "none",
              stagger: 0.06,
              filter: (pos) =>
                pos < grid3Images.length - 1
                  ? "brightness(20%)"
                  : "brightness(100%)",
            },
            0,
          )
          .from(
            grid3.querySelectorAll(".lfs-item"),
            { xPercent: (pos) => (pos % 2 ? 100 : -100), autoAlpha: 0 },
            0.06 * grid3Images.length,
          );

        const calcInitialTransform = (
          element,
          offsetDistance = 250,
          maxRotation = 300,
          maxZTranslation = 2000,
        ) => {
          const viewportCenter = {
            width: window.innerWidth / 2,
            height: window.innerHeight / 2,
          };
          const elementCenter = {
            x: element.offsetLeft + element.offsetWidth / 2,
            y: element.offsetTop + element.offsetHeight / 2,
          };
          const angle = Math.atan2(
            Math.abs(viewportCenter.height - elementCenter.y),
            Math.abs(viewportCenter.width - elementCenter.x),
          );
          const translateX = Math.abs(Math.cos(angle) * offsetDistance);
          const translateY = Math.abs(Math.sin(angle) * offsetDistance);
          const maxDistance = Math.sqrt(
            viewportCenter.width ** 2 + viewportCenter.height ** 2,
          );
          const currentDistance = Math.sqrt(
            (viewportCenter.width - elementCenter.x) ** 2 +
              (viewportCenter.height - elementCenter.y) ** 2,
          );
          const distanceFactor = currentDistance / maxDistance;
          const rotationX =
            (elementCenter.y < viewportCenter.height ? -1 : 1) *
            (translateY / offsetDistance) *
            maxRotation *
            distanceFactor;
          const rotationY =
            (elementCenter.x < viewportCenter.width ? 1 : -1) *
            (translateX / offsetDistance) *
            maxRotation *
            distanceFactor;
          const translateZ = maxZTranslation * distanceFactor;
          return {
            x:
              elementCenter.x < viewportCenter.width ? -translateX : translateX,
            y:
              elementCenter.y < viewportCenter.height
                ? -translateY
                : translateY,
            z: translateZ,
            rotateX: rotationX,
            rotateY: rotationY,
          };
        };

        const grid4 = root.querySelector("[data-grid-4]");
        const grid4Images = grid4.querySelectorAll(".lfs-img");
        gsap
          .timeline({
            defaults: { ease: "expo" },
            scrollTrigger: {
              trigger: grid4,
              start: "center center",
              end: "+=200%",
              pin: grid4.parentNode,
              scrub: 0.2,
            },
          })
          .set(grid4, { perspective: 1000 })
          .fromTo(
            grid4Images,
            {
              x: (_, el) => calcInitialTransform(el).x,
              y: (_, el) => calcInitialTransform(el).y,
              z: (_, el) => calcInitialTransform(el).z,
              rotateX: (_, el) => calcInitialTransform(el).rotateX * 0.5,
              rotateY: (_, el) => calcInitialTransform(el).rotateY,
              autoAlpha: 0,
              scale: 0.7,
            },
            {
              x: 0,
              y: 0,
              z: 0,
              rotateX: 0,
              rotateY: 0,
              autoAlpha: 1,
              scale: 1,
              stagger: { amount: 0.2, from: "center", grid: [4, 9] },
            },
          );

        const grid4v2 = root.querySelector("[data-grid-4v2]");
        const grid4v2Images = grid4v2.querySelectorAll(".lfs-img");
        gsap
          .timeline({
            defaults: { ease: "power4" },
            scrollTrigger: {
              trigger: grid4v2,
              start: "center center",
              end: "+=200%",
              pin: grid4v2.parentNode,
              scrub: 0.2,
            },
          })
          .set(grid4v2, { perspective: 1200 })
          .fromTo(
            grid4v2Images,
            {
              x: (_, el) => calcInitialTransform(el, 900).x,
              y: (_, el) => calcInitialTransform(el, 600).y,
              z: (_, el) => calcInitialTransform(el, 250, 300, -3000).z,
              rotateX: (_, el) =>
                calcInitialTransform(el, 250, -160, -3000).rotateX,
              rotateY: (_, el) =>
                calcInitialTransform(el, 250, -160, -3000).rotateY,
              autoAlpha: 0,
              scale: 0.4,
            },
            {
              x: 0,
              y: 0,
              z: 0,
              rotateX: 0,
              rotateY: 0,
              autoAlpha: 1,
              scale: 1,
              stagger: { amount: 0.15, from: "center", grid: [4, 9] },
            },
          );

        const grid5 = root.querySelector("[data-grid-5]");
        gsap
          .timeline({
            defaults: { ease: "sine" },
            scrollTrigger: {
              trigger: grid5,
              start: "center center",
              end: "+=250%",
              pin: grid5.parentNode,
              scrub: 0.3,
            },
          })
          .set(grid5, { perspective: 1000 })
          .from(grid5.querySelectorAll(".lfs-img"), {
            stagger: { amount: 0.4, from: "random", grid: [4, 9] },
            y: window.innerHeight,
            rotationX: -70,
            transformOrigin: "50% 0%",
            z: -900,
            autoAlpha: 0,
          });

        const grid6 = root.querySelector("[data-grid-6]");
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: grid6,
              start: "center center",
              end: "+=200%",
              pin: grid6.parentNode,
              scrub: scrubSpeed,
            },
          })
          .from(grid6.querySelectorAll(".lfs-img"), {
            stagger: { amount: 0.03, from: "edges", grid: [3, 3] },
            scale: 0.7,
            autoAlpha: 0,
          })
          .from(grid6, { scale: 0.7, skewY: 5 }, 0);

        const grid7 = root.querySelector("[data-grid-7]");
        const grid7Images = grid7.querySelectorAll(".lfs-img");
        gsap
          .timeline({
            defaults: { ease: "power1" },
            scrollTrigger: {
              trigger: grid7,
              start: "center center",
              end: "+=150%",
              pin: grid7.parentNode,
              scrub: scrubSpeed,
            },
          })
          .fromTo(
            grid7Images,
            { yPercent: -102 },
            { stagger: 0.08, yPercent: 0 },
          )
          .from(
            Array.from(grid7Images).map((el) =>
              el.querySelector(".lfs-img-inner"),
            ),
            { stagger: 0.08, yPercent: 102 },
            0,
          )
          .from(
            grid7.querySelectorAll(".lfs-item"),
            {
              yPercent: 20,
              stagger: (grid7Images.length / 2) * 0.08,
              autoAlpha: 0,
            },
            0,
          );

        const grid8 = root.querySelector("[data-grid-8]");
        gsap
          .timeline({
            defaults: { ease: "expo" },
            scrollTrigger: {
              trigger: grid8,
              start: "center center",
              end: "+=250%",
              pin: grid8.parentNode,
              scrub: true,
            },
          })
          .set(grid8, { perspective: 2000 })
          .from(grid8.querySelectorAll(".lfs-img"), {
            stagger: { amount: 0.8, from: "start" },
            rotationY: 65,
            transformOrigin: "0% 50%",
            z: -200,
            yPercent: 10,
          })
          .from(
            grid8.querySelectorAll(".lfs-img"),
            {
              stagger: { amount: 0.8, from: "start" },
              duration: 0.2,
              autoAlpha: 0,
            },
            0,
          );

        const grid9 = root.querySelector("[data-grid-9]");
        gsap
          .timeline({
            defaults: { ease: "power3" },
            scrollTrigger: {
              trigger: grid9,
              start: "center center",
              end: "+=200%",
              pin: grid9.parentNode,
              scrub: true,
            },
          })
          .from(grid9.querySelectorAll(".lfs-img"), {
            transformOrigin: "100% -450%",
            stagger: 0.07,
            scaleX: 1.05,
            skewX: 15,
            xPercent: 50,
            rotation: -10,
            autoAlpha: 0,
          });

        scrollTriggers = ScrollTrigger.getAll();
        window.scrollTo(0, 0);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      scrollTriggers.forEach((st) => st.kill());
      if (gsap && rafCallback) gsap.ticker.remove(rafCallback);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  const TextSection = ({ heading, children }) => (
    <section className="flex min-h-[100dvh] flex-col justify-center p-2 sm:p-4">
      <h4 className="text-[11px] font-normal uppercase">{heading}</h4>
      <p className="my-2 max-w-[625px] text-[1.7rem] font-medium leading-[1.4] tracking-[-0.025em] [text-wrap:balance]">
        {children}
      </p>
    </section>
  );

  const FullSection = ({ padded, cutoff, children }) => (
    <section
      className={`relative grid h-screen w-full place-items-center [grid-template-areas:'main'] [grid-template-rows:100%] [grid-template-columns:100%] ${
        padded ? "p-2 sm:p-4" : ""
      } ${cutoff ? "overflow-hidden" : ""}`}
    >
      {children}
    </section>
  );

  return (
    <div
      ref={rootRef}
      className={`lfs-loading w-full overflow-x-hidden font-sans ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .lfs-loading .lfs-reveal, .lfs-loading .lfs-title { visibility: hidden; }
            html, body { scrollbar-width: none; -ms-overflow-style: none; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
          `,
        }}
      />

      <header
        className="lfs-frame relative flex h-screen flex-col justify-between p-6 sm:p-10"
        style={{ backgroundColor: frameBgColor }}
      >
        <div className="flex items-center justify-between text-[11px] font-normal uppercase tracking-[0.1em]">
          <span>{logoText}</span>
          <nav className="flex flex-wrap gap-4">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="lfs-frame-title m-0 text-[clamp(2.5rem,10vw,7rem)] font-medium leading-[0.95] tracking-[-0.03em]">
            {name}
          </h2>
          <p className="mt-4 text-[11px] font-normal uppercase tracking-[0.15em]">
            {tagline}
          </p>
        </div>

        <div className="text-[11px] font-normal uppercase tracking-[0.1em] opacity-70">
          {scrollHint}
        </div>
      </header>

      <TextSection heading="Intro">{introText}</TextSection>

      <FullSection padded>
        <div
          data-grid-1
          className="lfs-reveal grid h-full w-full gap-2 [grid-area:main] [grid-template-columns:repeat(8,1fr)] [grid-template-rows:1fr_1fr_1fr]"
        >
          {GRID1_ORDER.map((pos, i) => (
            <div
              key={i}
              className={`lfs-img pointer-events-none bg-cover bg-center ${areaOf(pos)}`}
              style={{ backgroundImage: `url(${img(i)})` }}
            />
          ))}
        </div>
        <div className="lfs-title relative flex h-full w-full flex-col [grid-area:main]">
          <h2 className="my-2 text-[clamp(2rem,7vw,4.5rem)] font-medium leading-none tracking-[-0.025em] [text-wrap:balance]">
            {title1}
          </h2>
          <p className="mt-auto max-w-[100px] self-end text-right text-[11px] font-normal uppercase">
            {subtitle1}
          </p>
        </div>
      </FullSection>

      <TextSection heading="About">{aboutText}</TextSection>

      <FullSection padded>
        <div
          data-grid-2
          className="lfs-reveal grid w-full content-center gap-2 [grid-area:main] [grid-template-columns:repeat(5,1fr)] [grid-template-rows:repeat(2,min-content)]"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="lfs-img aspect-[2/3] h-min pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${img(i + 20)})` }}
            />
          ))}
          {grid2Items.slice(0, 3).map((it, i) => (
            <div key={i} className={`lfs-item ${areaOf([6, 7, 18][i])}`}>
              <h4 className="text-[11px] font-normal uppercase">{it.label}</h4>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </FullSection>

      <TextSection heading="Life">{lifeText}</TextSection>

      <FullSection padded>
        <div
          data-grid-3
          className="lfs-reveal grid h-auto w-full justify-self-center gap-2 [grid-area:main] [grid-template-columns:repeat(5,1fr)] [grid-template-rows:repeat(2,min-content)]"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`lfs-img aspect-[2/3] h-min pointer-events-none bg-cover bg-center ${areaOf(2)}`}
              style={{ backgroundImage: `url(${img(i + 3)})` }}
            />
          ))}
          {grid3Items.slice(0, 2).map((it, i) => (
            <div key={i} className={`lfs-item self-center ${areaOf([1, 4][i])}`}>
              <h4 className="text-[11px] font-normal uppercase">{it.label}</h4>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </FullSection>

      <TextSection heading="Work Ethics">{workEthicsText}</TextSection>

      <FullSection padded>
        <div
          data-grid-4
          className="lfs-reveal grid h-full w-full gap-2 [grid-area:main] [grid-template-columns:repeat(9,1fr)] [grid-auto-rows:1fr]"
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="lfs-img pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${img(i)})` }}
            />
          ))}
        </div>
      </FullSection>

      <FullSection>
        <div
          data-grid-4v2
          className="lfs-reveal grid h-full w-full gap-2 [grid-area:main] [grid-template-columns:repeat(9,1fr)] [grid-auto-rows:1fr]"
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="lfs-img pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${img(i + 7)})` }}
            />
          ))}
        </div>
      </FullSection>

      <TextSection heading="Inspiration">{inspirationText}</TextSection>

      <FullSection padded>
        <div
          data-grid-5
          className="lfs-reveal grid h-full w-full gap-2 [grid-area:main] [grid-template-columns:repeat(5,1fr)] [grid-template-rows:repeat(4,1fr)]"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="lfs-img pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${img(i + 11)})` }}
            />
          ))}
        </div>
        <div className="relative flex h-full w-full flex-col [grid-area:main]">
          <h2 className="my-2 text-[clamp(2rem,7vw,4.5rem)] font-medium leading-none tracking-[-0.025em] [text-wrap:balance]">
            {title2}
          </h2>
          <p className="mt-auto max-w-[100px] self-end text-right text-[11px] font-normal uppercase">
            {subtitle2}
          </p>
        </div>
      </FullSection>

      <TextSection heading="Process">{processText}</TextSection>

      <FullSection padded cutoff>
        <div
          data-grid-6
          className="lfs-reveal mx-auto grid aspect-[2/1] w-full content-center justify-center gap-8 [grid-area:main] [grid-template-columns:repeat(3,70%)] [grid-template-rows:repeat(3,60%)]"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="lfs-img h-full w-full pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${img(i + 18)})` }}
            />
          ))}
        </div>
        <div className="relative flex h-full w-full flex-col [grid-area:main]">
          <h2 className="my-2 text-[clamp(2rem,7vw,4.5rem)] font-medium leading-none tracking-[-0.025em] [text-wrap:balance]">
            {title3}
          </h2>
          <p className="mt-auto max-w-[100px] self-end text-right text-[11px] font-normal uppercase">
            {subtitle3}
          </p>
        </div>
      </FullSection>

      <TextSection heading="Collaborations">{collaborationsText}</TextSection>

      <section className="flex min-h-[100dvh] flex-col justify-center p-2 sm:p-4">
        <div
          data-grid-7
          className="lfs-reveal grid gap-[10px] [grid-template-columns:repeat(15,calc((100%-140px)/15))] [grid-auto-rows:auto]"
        >
          <div className="lfs-item col-[auto/span_3]">
            <h4 className="text-[11px] font-normal uppercase">
              {grid7Items[0]?.label}
            </h4>
            <p>{grid7Items[0]?.text}</p>
          </div>
          {[
            { span: 2, ar: "aspect-square" },
            { span: 1, ar: "aspect-[4/3]" },
            { span: 2, ar: "aspect-[4/3]" },
            { span: 2, ar: "aspect-[2/3]" },
            { span: 1, ar: "aspect-[4/3]" },
            { span: 2, ar: "aspect-[4/3]" },
            { span: 2, ar: "aspect-[2/3]" },
          ].map((cfg, i) => (
            <div
              key={i}
              className={`lfs-img relative grid max-h-full min-w-full place-items-center overflow-hidden ${cfg.ar} ${cfg.span === 2 ? "col-[auto/span_2]" : ""}`}
            >
              <div
                className="lfs-img-inner h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img(i + 1)})` }}
              />
            </div>
          ))}

          <div className="lfs-item col-[auto/span_3]">
            <h4 className="text-[11px] font-normal uppercase">
              {grid7Items[1]?.label}
            </h4>
            <p>{grid7Items[1]?.text}</p>
          </div>
          {[
            { span: 2, ar: "aspect-[2/3]" },
            { span: 2, ar: "aspect-[4/3]" },
            { span: 1, ar: "aspect-square" },
            { span: 2, ar: "aspect-[4/3]" },
            { span: 2, ar: "aspect-[2/3]" },
            { span: 3, ar: "aspect-[4/3]" },
          ].map((cfg, i) => (
            <div
              key={`b-${i}`}
              className={`lfs-img relative grid max-h-full min-w-full place-items-center overflow-hidden ${cfg.ar} ${
                cfg.span === 2
                  ? "col-[auto/span_2]"
                  : cfg.span === 3
                    ? "col-[auto/span_3]"
                    : ""
              }`}
            >
              <div
                className="lfs-img-inner h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img(i + 15)})` }}
              />
            </div>
          ))}
        </div>
      </section>

      <TextSection heading="Style">{styleText}</TextSection>

      <FullSection>
        <div
          data-grid-8
          className="lfs-reveal grid h-[60vh] w-full [grid-area:main] [grid-template-columns:repeat(14,1fr)] [grid-auto-rows:auto]"
        >
          {Array.from({ length: 34 }).map((_, i) => (
            <div
              key={i}
              className="lfs-img pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${img(i + 2)})` }}
            />
          ))}
        </div>
      </FullSection>

      <TextSection heading="Future">{futureText}</TextSection>

      <FullSection>
        <div
          data-grid-9
          className="lfs-reveal grid w-full content-center [grid-area:main] [grid-template-columns:repeat(5,1fr)] [grid-template-rows:repeat(2,min-content)]"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="lfs-img aspect-[2/3] h-min pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${img(i + 9)})` }}
            />
          ))}
        </div>
      </FullSection>

      <TextSection heading="Contact">
        {contactText}
      </TextSection>
    </div>
  );
}
