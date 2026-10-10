"use client";

import { useEffect, useRef } from "react";

// ─── ScrollGallery ────────────────────────────────────────────────────────────
//
// Props
// ─────────────────────────────────────────────────────────────────────────────
// items        GalleryItem[]   Array of gallery items (see shape below)
// title        string          "#scroll"     Page heading text
// scrollEase   number          0.1           Lerp ease factor (0–1)
// ─────────────────────────────────────────────────────────────────────────────
//
// GalleryItem shape:
// { id, title, description, image, aspectRatio: "700/525" }

const DEFAULT_ITEMS = [
  {
    id: 1,
    title: "Leopard",
    description:
      "The English name 'leopard' comes from Old French: leupart or Middle French: liepart, that derives from Latin: leopardus and Ancient Greek: λέοπάρδος (leopardos).",
    image:
      "https://images.pexels.com/photos/1642068/pexels-photo-1642068.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "700/525",
  },
  {
    id: 2,
    title: "Irbis",
    description:
      "The name 'irbis' comes from the Turkic language, it was borrowed by Russian fur traders from local hunters in the XVII century. In different regions of Central Asia, the predator was called differently: irbish, irbiz, irvish, ilbers.",
    image:
      "https://images.pexels.com/photos/208840/pexels-photo-208840.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "700/460",
  },
  {
    id: 3,
    title: "Tiger",
    description:
      "The Middle English 'tigre' and Old English tigras derive French tigre, from Latin tigris.",
    image:
      "https://images.pexels.com/photos/146067/pexels-photo-146067.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/450",
  },
  {
    id: 4,
    title: "Lion",
    description:
      "The word 'lion' is derived from Latin: leo and Ancient Greek: λέων (leon).",
    image:
      "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/500",
  },
  {
    id: 5,
    title: "Cheetah",
    description:
      "The vernacular name 'cheetah' is derived from Hindustani Urdu: چیتا‎ and Hindi: चीता (ćītā).",
    image:
      "https://images.pexels.com/photos/2544554/pexels-photo-2544554.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/455",
  },
  {
    id: 6,
    title: "Lynx",
    description:
      "The name 'lynx' originated in Middle English via Latin from the Greek word λύγξ, derived from the Indo-European root leuk- ('light, brightness') in reference to the luminescence of its reflective eyes.",
    image:
      "https://images.pexels.com/photos/7386324/pexels-photo-7386324.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/470",
  },
  {
    id: 7,
    title: "Manul",
    description:
      "'Manul' is the Pallas's cat's name in the Kyrgyz language. It is called 'manol' in the Mongolian language. The name 'Pallas's cat' was coined by William Thomas Blanford in honour of Peter Simon Pallas.",
    image: "https://get.wallhere.com/photo/manul-wool-fur-snout-667968.jpg",
    aspectRatio: "600/460",
  },
  {
    id: 8,
    title: "Cat",
    description:
      "The origin of the English word 'cat', Old English catt, is thought to be the Late Latin word cattus, which was first used at the beginning of the 6th century.",
    image:
      "https://images.pexels.com/photos/177809/pexels-photo-177809.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    aspectRatio: "600/460",
  },
];

// ─── MathUtils (same as original) ────────────────────────────────────────────
const MathUtils = {
  map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,
  lerp: (a, b, n) => (1 - n) * a + n * b,
  getRandomFloat: (min, max) =>
    parseFloat((Math.random() * (max - min) + min).toFixed(2)),
};

export default function ScrollParallaxGallery({
  items = DEFAULT_ITEMS,
  title = "#scroll",
  scrollEase = 0.1,
}) {
  const mainRef = useRef(null);
  const scrollableRef = useRef(null);
  const contentRef = useRef(null);
  const scrollBtnRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    // ── Load external deps ──────────────────────────────────────────────────
    const loadScript = (src, id) =>
      new Promise((res, rej) => {
        if (document.getElementById(id)) {
          res();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.id = id;
        s.onload = res;
        s.onerror = () => rej(new Error(`Failed: ${src}`));
        document.head.appendChild(s);
      });

    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js",
        "jq",
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/4.1.4/imagesloaded.pkgd.min.js",
        "imgloaded",
      ),
    ]).then(() => {
      // make imagesLoaded available as global
      if (!window.imagesLoaded && window.jQuery) {
        window.imagesLoaded = window.jQuery.fn.imagesLoaded
          ? (el, opts, cb) => window.jQuery(el).imagesLoaded(opts, cb)
          : null;
      }
      init();
    });

    // ── Scroll state ────────────────────────────────────────────────────────
    let winsize = { width: window.innerWidth, height: window.innerHeight };
    const calcWinsize = () => {
      winsize = { width: window.innerWidth, height: window.innerHeight };
    };
    window.addEventListener("resize", calcWinsize);

    let docScroll = 0;
    let lastScroll = 0;

    const getPageYScroll = () => {
      docScroll = window.pageYOffset || document.documentElement.scrollTop;
    };
    window.addEventListener("scroll", getPageYScroll);

    // ── Scroll-to-top button ────────────────────────────────────────────────
    const btn = scrollBtnRef.current;
    const handleScrollForBtn = () => {
      const root = document.documentElement;
      const scrollTotal = root.scrollHeight - root.clientHeight;
      if (root.scrollTop / scrollTotal > 0.4) {
        btn?.classList.add("showBtn");
      } else {
        btn?.classList.remove("showBtn");
      }
    };
    document.addEventListener("scroll", handleScrollForBtn);
    btn?.addEventListener("click", () => {
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ── Item class (same logic as original) ─────────────────────────────────
    class Item {
      constructor(el) {
        this.DOM = { el };
        this.DOM.image = el.querySelector(".content__item-img");
        this.DOM.imageWrapper = this.DOM.image.parentNode;
        this.DOM.el.style.perspective = "1000px";
        this.DOM.imageWrapper.style.transformOrigin = "50% 100%";
        this.ry = MathUtils.getRandomFloat(-0.5, 0.5);
        this.rz = MathUtils.getRandomFloat(-0.5, 0.5);
        this.DOM.title = el.querySelector(".content__item-title");
        this.DOM.title.style.transform = "translate3d(0,0,200px)";

        this.renderedStyles = {
          innerTranslationY: {
            previous: 0,
            current: 0,
            ease: scrollEase,
            setValue: () => {
              const toValue = parseInt(
                getComputedStyle(this.DOM.image).getPropertyValue("--overflow"),
                10,
              );
              const fromValue = -1 * toValue;
              return Math.max(
                Math.min(
                  MathUtils.map(
                    this.props.top - docScroll,
                    winsize.height,
                    -1 * this.props.height,
                    fromValue,
                    toValue,
                  ),
                  toValue,
                ),
                fromValue,
              );
            },
          },
          itemRotation: {
            previous: 0,
            current: 0,
            ease: scrollEase,
            toValue: MathUtils.getRandomFloat(-70, -50),
            setValue() {
              const from = this.toValue * -1;
              const val = MathUtils.map(
                this.props?.top - docScroll ?? 0,
                winsize.height * 1.5,
                -1 * (this.props?.height ?? 0),
                from,
                this.toValue,
              );
              return Math.min(Math.max(val, this.toValue), from);
            },
          },
        };
        // bind props reference for itemRotation setValue
        this.renderedStyles.itemRotation.setValue =
          this.renderedStyles.itemRotation.setValue.bind(
            Object.assign(this.renderedStyles.itemRotation, { props: null }),
          );

        this.getSize();
        this.update();

        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((e) => (this.isVisible = e.intersectionRatio > 0));
        });
        this.observer.observe(this.DOM.el);
        window.addEventListener("resize", () => this.resize());
      }

      update() {
        for (const key in this.renderedStyles) {
          this.renderedStyles[key].current = this.renderedStyles[key].previous =
            this.renderedStyles[key].setValue.call(this);
        }
        this.layout();
      }

      getSize() {
        const rect = this.DOM.el.getBoundingClientRect();
        this.props = { height: rect.height, top: docScroll + rect.top };
      }

      resize() {
        this.getSize();
        this.update();
      }

      render() {
        for (const key in this.renderedStyles) {
          this.renderedStyles[key].current =
            this.renderedStyles[key].setValue.call(this);
          this.renderedStyles[key].previous = MathUtils.lerp(
            this.renderedStyles[key].previous,
            this.renderedStyles[key].current,
            this.renderedStyles[key].ease,
          );
        }
        this.layout();
      }

      layout() {
        this.DOM.image.style.transform = `translate3d(0,${this.renderedStyles.innerTranslationY.previous}px,0)`;
        this.DOM.imageWrapper.style.transform = `rotate3d(1,${this.ry},${this.rz},${this.renderedStyles.itemRotation.previous}deg)`;
      }
    }

    // ── SmoothScroll class (same logic as original) ──────────────────────────
    class SmoothScroll {
      constructor() {
        this.DOM = {
          main: mainRef.current,
          scrollable: scrollableRef.current,
          content: contentRef.current,
        };
        this.items = [];
        [...this.DOM.content.querySelectorAll(".content__item")].forEach((el) =>
          this.items.push(new Item(el)),
        );
        this.renderedStyles = {
          translationY: {
            previous: 0,
            current: 0,
            ease: scrollEase,
            setValue: () => docScroll,
          },
        };
        this.setSize();
        this.update();
        this.style();
        window.addEventListener("resize", () => this.setSize());
        requestAnimationFrame(() => this.render());
      }

      update() {
        for (const key in this.renderedStyles) {
          this.renderedStyles[key].current = this.renderedStyles[key].previous =
            this.renderedStyles[key].setValue();
        }
        this.layout();
      }

      layout() {
        this.DOM.scrollable.style.transform = `translate3d(0,${
          -1 * this.renderedStyles.translationY.previous
        }px,0)`;
      }

      setSize() {
        document.body.style.height = `${this.DOM.scrollable.scrollHeight}px`;
      }

      style() {
        this.DOM.main.style.position = "fixed";
        this.DOM.main.style.width = "100%";
        this.DOM.main.style.height = "100%";
        this.DOM.main.style.top = "0";
        this.DOM.main.style.left = "0";
        this.DOM.main.style.overflow = "hidden";
      }

      render() {
        for (const key in this.renderedStyles) {
          this.renderedStyles[key].current =
            this.renderedStyles[key].setValue();
          this.renderedStyles[key].previous = MathUtils.lerp(
            this.renderedStyles[key].previous,
            this.renderedStyles[key].current,
            this.renderedStyles[key].ease,
          );
        }
        this.layout();
        for (const item of this.items) {
          if (item.isVisible) {
            if (item.insideViewport) {
              item.render();
            } else {
              item.insideViewport = true;
              item.update();
            }
          } else {
            item.insideViewport = false;
          }
        }
        rafRef.current = requestAnimationFrame(() => this.render());
      }
    }

    // ── Init ────────────────────────────────────────────────────────────────
    function init() {
      const preloadImages = () =>
        new Promise((resolve) => {
          const imgs = document.querySelectorAll(".content__item-img");
          if (window.imagesLoaded) {
            window.imagesLoaded(imgs, { background: true }, resolve);
          } else {
            resolve();
          }
        });

      preloadImages().then(() => {
        document.body.classList.remove("loading");
        getPageYScroll();
        lastScroll = docScroll;
        new SmoothScroll();
      });
    }

    return () => {
      window.removeEventListener("resize", calcWinsize);
      window.removeEventListener("scroll", getPageYScroll);
      document.removeEventListener("scroll", handleScrollForBtn);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // Reset body height on unmount
      document.body.style.height = "";
    };
  }, [scrollEase]);

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Righteous&display=swap");

        body.loading * { cursor: wait; }

        body {
          --color-text: #905348;
          --color-bg: #120605;
          --color-link: #8f8f76;
          --color-link-hover: #fff;
          --color-description: #7e605b;
          --font-title: "Dancing Script", serif;
          --size-title: 6vw;
          --imgwidthmax: 600px;
          color: var(--color-text);
          background-color: var(--color-bg);
          font-size: 1rem;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-family: 'Montserrat', sans-serif;
        }

        body::-webkit-scrollbar { width: 0.25em; }
        body::-webkit-scrollbar-track { background: #120605; }
        body::-webkit-scrollbar-thumb { border-radius: 20px; background: #8d5146; }
        body::-webkit-scrollbar-corner { background: transparent; }

        a { text-decoration: none; color: var(--color-link); outline: none; }
        a:hover, a:focus { color: var(--color-link-hover); outline: none; }

        .scrollToTopBtn {
          background: transparent;
          border: none;
          cursor: pointer;
          position: fixed;
          width: 100px;
          bottom: 20px;
          right: 0px;
          z-index: 100;
          opacity: 0;
          transform: translateY(200px);
          transition: all 0.5s ease;
          filter: invert(35%) sepia(12%) saturate(1922%) hue-rotate(321deg) brightness(96%) contrast(88%);
        }
        .scrollToTopBtn.showBtn { opacity: 1; transform: translateY(0); }

        .page {
          display: grid;
          padding: 5vw;
          max-width: 1200px;
          margin: 0 auto;
          grid-template-columns: 100%;
          grid-template-areas: "header" "grid";
          will-change: transform;
        }

        .page__title {
          grid-area: header;
          margin: 0 0 0.5rem;
          font-family: "Righteous", cursive;
          font-size: var(--size-title);
          font-weight: 400;
        }

        .arrow {
          width: 60px;
          height: 80px;
          position: absolute;
          top: 1%;
          right: 5%;
          z-index: 999;
        }

        .arrow path {
          stroke: var(--color-text);
          stroke-width: 2px;
          fill: transparent;
          animation: arrowDown 2s infinite;
        }

        @keyframes arrowDown {
          0%   { opacity: 0; }
          25%  { opacity: 1; }
          75%  { opacity: 0; }
          100% { opacity: 0; }
        }

        .arrow path.a1 { animation-delay: -1s; }
        .arrow path.a2 { animation-delay: -0.5s; }
        .arrow path.a3 { animation-delay: 0s; }

        .content {
          grid-area: grid;
          margin: 25vh 0 30vh;
        }

        .content--padded { padding: 0 10vw; }

        .content__item {
          --imgwidth: calc(var(--imgwidthmax) * var(--aspect-ratio));
          width: var(--imgwidth);
          max-width: 100%;
          position: relative;
          will-change: transform;
          margin-bottom: 30vh;
          display: grid;
          grid-template-columns: 50% 50%;
        }

        .content--alternate .content__item { max-width: 90vw; }
        .content--alternate .content__item:nth-child(even) { margin-left: auto; }

        .content__item--expand {
          width: 100%;
          grid-template-columns: minmax(0, var(--imgwidth)) 1fr;
        }

        .content__item--expand:nth-child(even) {
          grid-template-columns: 1fr minmax(0, var(--imgwidth));
        }

        .content__item-imgwrap {
          position: relative;
          --imgwidth: 100%;
          margin: 0 auto;
          grid-area: 1 / 1 / 3 / 3;
          overflow: hidden;
          width: var(--imgwidth);
          padding-bottom: calc(var(--imgwidth) / (var(--aspect-ratio)));
          will-change: transform;
        }

        .content__item--expand .content__item-imgwrap {
          grid-area: 1 / 1 / 3 / 2;
        }

        .content__item--expand:nth-child(even) .content__item-imgwrap {
          grid-area: 1 / 2 / 3 / 3;
          justify-self: end;
        }

        .content__item-img {
          --overflow: 40px;
          height: calc(100% + (2 * var(--overflow)));
          top: calc(-1 * var(--overflow));
          width: 100%;
          position: absolute;
          background-size: cover;
          background-position: 50% 0%;
          will-change: transform;
          opacity: 0.8;
        }

        .content__item-title {
          position: relative;
          font-size: var(--size-title);
          padding: 0 3vw;
          margin: calc(var(--size-title) * -1 / 2) 0 0 0;
          align-self: start;
          line-height: 1;
          font-family: var(--font-title);
          font-weight: 400;
          color: var(--color-title);
          will-change: transform;
          mix-blend-mode: var(--blendmode-title);
        }

        .content__item-description {
          grid-area: 3 / 1 / 3 / 3;
          width: 70%;
          position: relative;
          margin: 0;
          padding: 1rem 0 0 0;
          color: var(--color-description);
        }

        .content--alternate .content__item-title {
          grid-area: 3 / 1 / 4 / 2;
          justify-self: start;
        }

        .content--alternate .content__item:nth-child(even) .content__item-title {
          grid-area: 3 / 2 / 4 / 3;
          justify-self: end;
          width: auto;
        }

        .content__item--expand .content__item-description {
          grid-area: 1 / 2 / 3 / 3;
          justify-self: start;
          align-self: start;
          padding: 0 2rem;
          width: 250px;
          font-size: 0.9rem;
        }

        .content__item--expand:nth-child(even) .content__item-description {
          grid-area: 1 / 1 / 3 / 2;
          justify-self: end;
          text-align: right;
        }

        .credits { text-align: center; }
        .credits a { color: var(--color-text); }
        .credits a:hover { color: #fff; }

        @media screen and (min-width: 53em) {
          .page--layout-2 {
            grid-template-columns: 1fr 1fr;
            grid-template-areas: "header header" "...  meta" "grid grid";
          }
        }

        @media screen and (max-width: 40em) {
          .content__item--expand .content__item-imgwrap,
          .content__item--expand:nth-child(even) .content__item-imgwrap {
            grid-area: 1 / 1 / 3 / 3;
          }
          .content__item--expand .content__item-description,
          .content__item--expand:nth-child(even) .content__item-description {
            grid-area: 3 / 1 / 4 / 3;
            padding: 1rem 0;
            width: 100%;
            text-align: left;
          }
          .content--alternate .content__item-title,
          .content--alternate .content__item:nth-child(even) .content__item-title {
            grid-area: 1 / 1 / 4 / 2;
          }
        }
      `}</style>

      <main ref={mainRef}>
        <div data-scroll ref={scrollableRef} className="page page--layout-2">
          <h1 className="page__title">{title}</h1>

          {/* Animated arrow */}
          <svg className="arrow" viewBox="0 0 60 80">
            <path className="a1" d="M0 0 L30 22 L60 0" />
            <path className="a2" d="M0 20 L30 42 L60 20" />
            <path className="a3" d="M0 40 L30 62 L60 40" />
          </svg>

          <div
            ref={contentRef}
            className="content content--alternate content--padded"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="content__item content__item--expand"
                style={{ "--aspect-ratio": item.aspectRatio }}
              >
                <div className="content__item-imgwrap">
                  <div
                    className="content__item-img"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                </div>
                <h2 className="content__item-title">{item.title}</h2>
                <p className="content__item-description">{item.description}</p>
              </div>
            ))}

            <p className="credits">
              <a
                href="https://codepen.io/DivineBlow"
                target="_blank"
                rel="noreferrer"
              >
                DivineBlow
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Scroll-to-top button */}
      <button
        ref={scrollBtnRef}
        className="scrollToTopBtn"
        aria-label="Scroll to top"
      >
        <svg viewBox="0 0 512.001 512.001" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M403.015,296.471L264.5,108.591c-4.22-5.725-12.778-5.725-16.999,0l-138.515,187.88
            c-5.14,6.972-0.162,16.826,8.499,16.826h277.03C403.177,313.297,408.155,303.443,403.015,296.471z"
          />
          <path
            d="M413.693,288.598L275.18,100.718c-4.471-6.066-11.641-9.688-19.178-9.688s-14.707,3.621-19.178,9.688
            L156.992,209h-34.146L256.001,28.39l136.335,184.924c4.348,5.898,12.653,7.154,18.552,2.806
            c5.898-4.348,7.154-12.655,2.805-18.552L275.18,9.688C270.708,3.621,263.537,0,256.001,0s-14.707,3.621-19.178,9.688
            L98.308,197.568c-5.365,7.279-6.166,16.813-2.09,24.884c4.077,8.071,12.226,13.083,21.268,13.083h19.943
            l-39.121,53.063c-5.365,7.279-6.166,16.813-2.09,24.884c4.077,8.071,12.226,13.083,21.268,13.083h45.236V483.23
            c0,15.864,12.907,28.771,28.771,28.771h129.015c15.864,0,28.771-12.907,28.771-28.771v-88.805
            c0-15.864-12.907-28.771-28.771-28.771h-78.976c-7.326,0-13.268,5.94-13.268,13.268
            c0,7.328,5.941,13.268,13.268,13.268h78.976c1.233,0,2.236,1.003,2.236,2.236v88.805c0,1.233-1.003,2.236-2.236,2.236
            H191.493c-1.233,0-2.236-1.003-2.236-2.236V326.565h205.257c9.042,0,17.191-5.014,21.268-13.083
            C419.86,305.411,419.059,295.877,413.693,288.598z M122.846,300.03L256.001,119.42l133.154,180.61L122.846,300.03z"
          />
        </svg>
      </button>
    </>
  );
}
