"use client";

import { useEffect, useId, useRef, useState } from "react";

const DEFAULT_MENU_ITEMS = [
  { tiny: "always", text: "bold", tinyFirst: true },
  { tiny: "look", text: "casual", tinyFirst: false },
  { tiny: "be", text: "funky", tinyFirst: true },
  { tiny: "feelings", text: "mad", tinyFirst: false },
];

const IMG = [
  "https://images.unsplash.com/photo-1781513747645-757fb2619e57?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780163930838-1502715c3bc1?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1611419010196-a360856fc42f?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777902609361-a8b8b7a697fb?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1777947085284-d454d1aa2f40?auto=format&fit=crop&w=720&q=80",
];

const DEFAULT_TILE_ROWS = [
  [
    { src: IMG[3], large: true },
    { src: IMG[4], large: false },
    { src: IMG[5], large: false },
  ],
  [
    { src: IMG[0], large: false },
    { src: IMG[1], large: false },
    { src: IMG[2], large: true },
  ],
  [
    { src: IMG[5], large: false },
    { src: IMG[0], large: true },
    { src: IMG[2], large: false },
  ],
];

export default function CurveWipeMenu({
  headingMain = "London 2022",
  headingSub = "spring / summer collection",
  titleMain = "Theodore",
  titleSub = "Stravassos",
  openLabel = "Open menu",
  closeLabel = "Close menu",
  className = "",
  menuItems = DEFAULT_MENU_ITEMS,
  tileRows = DEFAULT_TILE_ROWS,
  bgColor = "#4f6c5e",
  menuBgColor = "#000000",
  textColor = "#000000",
  menuTextColor = "#3e4843",
  titleMainColor = "#000000",
  titleMainOpenColor = "#ffffff",
  headingSubColor = "#374b41",
  menuItemColor = "#7ec59d",
  menuItemHover = "#128b47",
  menuTinyColor = "#7ec59d",
  buttonColor = "#000000",
  buttonHoverColor = "#79a18a",
  closeColor = "#ffffff",
  closeHoverColor = "#79a18a",
  overlayColor = "#000000",
  fontUrl = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,300;6..96,400;6..96,500&display=swap",
  fontFamily = "'Bodoni Moda', serif",
  titleMainSize = "20vw",
  titleSubSize = "7vw",
  menuItemSize = "9vw",
  tileRotation = 22.5,
  tileOpacity = 0.5,
  tileSize = "30vh",
  tileLargeSize = "100vh",
  tileSpeeds = [10, 16, 22],
  openDuration = 0.8,
  itemStagger = 0.05,
}) {
  const rawId = useId();
  const uid = "cwm" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const [menuOpen, setMenuOpen] = useState(false);

  const overlayPathRef = useRef(null);
  const menuWrapRef = useRef(null);
  const menuItemsRef = useRef([]);
  const titleMainRef = useRef(null);
  const titleSubRef = useRef(null);
  const gsapRef = useRef(null);
  const animatingRef = useRef(false);
  const tlRef = useRef(null);

  useEffect(() => {
    if (!fontUrl) return;
    if (document.querySelector('link[data-id="' + fontUrl + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.setAttribute("data-id", fontUrl);
    document.head.appendChild(link);
  }, [fontUrl]);

  useEffect(() => {
    let cancelled = false;
    import("gsap").then((mod) => {
      if (cancelled) return;
      gsapRef.current = mod.gsap || mod.default;
    });
    return () => {
      cancelled = true;
      tlRef.current?.kill();
    };
  }, []);

  const openMenu = () => {
    const gsap = gsapRef.current;
    const path = overlayPathRef.current;
    if (!gsap || !path) {
      setMenuOpen(true);
      return;
    }
    if (animatingRef.current) return;
    animatingRef.current = true;

    const items = menuItemsRef.current.filter(Boolean);

    tlRef.current = gsap
      .timeline({
        onComplete: () => {
          animatingRef.current = false;
        },
      })
      .set(path, { attr: { d: "M 0 100 V 100 Q 50 100 100 100 V 100 z" } })
      .to(
        path,
        {
          duration: openDuration,
          ease: "power4.in",
          attr: { d: "M 0 100 V 50 Q 50 0 100 50 V 100 z" },
        },
        0,
      )
      .to(path, {
        duration: 0.3,
        ease: "power2",
        attr: { d: "M 0 100 V 0 Q 50 0 100 0 V 100 z" },
        onComplete: () => setMenuOpen(true),
      })
      .to(
        [titleMainRef.current, titleSubRef.current],
        {
          duration: openDuration,
          ease: "power3.in",
          y: -200,
          stagger: itemStagger,
        },
        0.2,
      )
      .set(items, { opacity: 0 })
      .set(path, { attr: { d: "M 0 0 V 100 Q 50 100 100 100 V 0 z" } })
      .to(path, {
        duration: 0.3,
        ease: "power2.in",
        attr: { d: "M 0 0 V 50 Q 50 0 100 50 V 0 z" },
      })
      .to(path, {
        duration: openDuration,
        ease: "power4",
        attr: { d: "M 0 0 V 0 Q 50 0 100 0 V 0 z" },
      })
      .to(
        items,
        {
          duration: 1.1,
          ease: "power4",
          startAt: { y: 150 },
          y: 0,
          opacity: 1,
          stagger: itemStagger,
        },
        ">-=1.1",
      );
  };

  const closeMenu = () => {
    const gsap = gsapRef.current;
    const path = overlayPathRef.current;
    if (!gsap || !path) {
      setMenuOpen(false);
      return;
    }
    if (animatingRef.current) return;
    animatingRef.current = true;

    const items = menuItemsRef.current.filter(Boolean);

    tlRef.current = gsap
      .timeline({
        onComplete: () => {
          animatingRef.current = false;
        },
      })
      .set(path, { attr: { d: "M 0 0 V 0 Q 50 0 100 0 V 0 z" } })
      .to(
        path,
        {
          duration: openDuration,
          ease: "power4.in",
          attr: { d: "M 0 0 V 50 Q 50 100 100 50 V 0 z" },
        },
        0,
      )
      .to(path, {
        duration: 0.3,
        ease: "power2",
        attr: { d: "M 0 0 V 100 Q 50 100 100 100 V 0 z" },
        onComplete: () => setMenuOpen(false),
      })
      .set(path, { attr: { d: "M 0 100 V 0 Q 50 0 100 0 V 100 z" } })
      .to(path, {
        duration: 0.3,
        ease: "power2.in",
        attr: { d: "M 0 100 V 50 Q 50 100 100 50 V 100 z" },
      })
      .to(path, {
        duration: openDuration,
        ease: "power4",
        attr: { d: "M 0 100 V 100 Q 50 100 100 100 V 100 z" },
      })
      .to(
        [titleMainRef.current, titleSubRef.current],
        {
          duration: 1.1,
          ease: "power4",
          y: 0,
          stagger: -itemStagger,
        },
        ">-=1.1",
      )
      .to(
        items,
        {
          duration: openDuration,
          ease: "power2.in",
          y: 100,
          opacity: 0,
          stagger: -itemStagger,
        },
        0,
      );
  };

  const scopedCss =
    "@keyframes " +
    uid +
    "runner{to{transform:translateX(-25%);}}" +
    "." +
    uid +
    "-line{animation-name:" +
    uid +
    "runner;animation-timing-function:linear;animation-iteration-count:infinite;}" +
    "." +
    uid +
    "-hoverline::before{content:'';height:1px;width:100%;background:currentColor;position:absolute;left:0;top:92%;transition:transform 0.3s;transform-origin:0% 50%;}" +
    "." +
    uid +
    "-hoverline:hover::before{transform:scaleX(0);transform-origin:100% 50%;}" +
    "." +
    uid +
    "-open-btn{border-color:" +
    buttonColor +
    ";fill:" +
    buttonColor +
    ";}" +
    "." +
    uid +
    "-open-btn:hover,." +
    uid +
    "-open-btn:focus-visible{border-color:" +
    buttonHoverColor +
    ";fill:" +
    buttonHoverColor +
    ";}" +
    "." +
    uid +
    "-open-btn:hover svg{transform:scale(1.1);}" +
    "." +
    uid +
    "-close-btn{stroke:" +
    closeColor +
    ";}" +
    "." +
    uid +
    "-close-btn:hover,." +
    uid +
    "-close-btn:focus-visible{stroke:" +
    closeHoverColor +
    ";}" +
    "." +
    uid +
    "-word{color:" +
    menuItemColor +
    ";}" +
    "." +
    uid +
    "-mitem:hover ." +
    uid +
    "-word{color:" +
    menuItemHover +
    ";}" +
    "." +
    uid +
    "-mitem:hover ." +
    uid +
    "-tiny{color:#ffffff;}" +
    "." +
    uid +
    "-title-main{font-size:" +
    titleMainSize +
    ";}" +
    "." +
    uid +
    "-title-sub{font-size:" +
    titleSubSize +
    ";}" +
    "." +
    uid +
    "-word{font-size:" +
    menuItemSize +
    ";}" +
    "." +
    uid +
    "-tiny{font-size:1rem;}" +
    "@media screen and (min-width:53em){." +
    uid +
    "-tiny{font-size:2rem;}}" +
    "@media (prefers-reduced-motion:reduce){." +
    uid +
    "-line{animation:none;}}";

  return (
    <div
      className={
        uid +
        " " +
        className +
        " relative grid w-full h-screen overflow-hidden antialiased [grid-template-columns:100%] [grid-template-rows:100vh]"
      }
      style={{ backgroundColor: bgColor, fontFamily: fontFamily }}
    >
      <style>{scopedCss}</style>

      <div
        className="relative z-[100] grid h-screen items-center content-between px-4 pt-4 pb-2 pointer-events-none [grid-area:1/1/2/2] text-base md:text-2xl"
        style={{ color: menuOpen ? menuTextColor : textColor }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col whitespace-nowrap text-center">
            <span
              className="block leading-[0.8] text-2xl md:text-[2.15rem]"
              style={{ color: menuOpen ? titleMainOpenColor : titleMainColor }}
            >
              {headingMain}
            </span>
            <span
              className="text-xs leading-none md:text-base"
              style={{
                color: headingSubColor,
                opacity: menuOpen ? 0 : 1,
                pointerEvents: menuOpen ? "none" : "auto",
              }}
            >
              {headingSub}
            </span>
          </div>

          <button
            type="button"
            onClick={openMenu}
            aria-label={openLabel}
            className={
              uid +
              "-open-btn pointer-events-auto grid h-16 w-16 place-items-center rounded-full border bg-transparent p-0"
            }
            style={{
              opacity: menuOpen ? 0 : 1,
              pointerEvents: menuOpen ? "none" : "auto",
            }}
          >
            <svg
              width="19"
              height="12"
              viewBox="0 0 19 12"
              className="transition-transform duration-500 ease-out"
            >
              <path d="m.742 3.26.485.874c.043-.024.13-.07.26-.136.22-.11.476-.233.765-.361A22.92 22.92 0 0 1 4.997 2.62c4.476-1.34 8.75-1.219 12.241 1.1.18.12.357.245.531.376l.6-.8a12.46 12.46 0 0 0-.578-.408C14.008.375 9.443.246 4.71 1.663c-1.037.31-2 .675-2.865 1.06a18.83 18.83 0 0 0-1.103.536Z" />
              <path d="m.742 6.748.485.874c.043-.023.13-.07.26-.135.22-.111.476-.233.765-.362A22.92 22.92 0 0 1 4.997 6.11c4.476-1.34 8.75-1.22 12.241 1.1.18.12.357.245.531.375l.6-.8a12.46 12.46 0 0 0-.578-.408C14.008 3.864 9.443 3.735 4.71 5.152c-1.037.31-2 .675-2.865 1.06a18.83 18.83 0 0 0-1.103.536Z" />
              <path d="m.742 10.237.485.874c.043-.024.13-.07.26-.136.22-.11.476-.232.765-.36a22.92 22.92 0 0 1 2.745-1.016c4.476-1.34 8.75-1.22 12.241 1.1.18.12.357.244.531.375l.6-.8a12.46 12.46 0 0 0-.578-.408C14.008 7.353 9.443 7.224 4.71 8.64c-1.037.31-2 .674-2.865 1.06a18.83 18.83 0 0 0-1.103.536Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative flex h-screen w-full flex-col items-center justify-center [grid-area:1/1/2/2]">
        <h2
          className="m-0 mt-[10vh] cursor-default text-center font-normal leading-[0.75]"
          style={{ color: menuOpen ? titleMainOpenColor : titleMainColor }}
        >
          <span
            ref={titleMainRef}
            className={uid + "-title-main mb-12 block will-change-transform"}
          >
            {titleMain}
          </span>
          <span
            ref={titleSubRef}
            className={uid + "-title-sub block will-change-transform"}
          >
            {titleSub}
          </span>
        </h2>

        <button
          type="button"
          disabled
          aria-label="Enter the site"
          className="mt-[4vh] cursor-not-allowed border-0 bg-transparent p-0 transition-transform duration-500 ease-out hover:translate-x-[15px] hover:-rotate-[40deg]"
        >
          <svg width="64" height="51" xmlns="http://www.w3.org/2000/svg">
            <g
              stroke={menuOpen ? titleMainOpenColor : textColor}
              fill="none"
              fillRule="evenodd"
            >
              <path
                strokeLinecap="square"
                d="m55.766 32.528-5.125-1.865M52.677 36.938l3.1-4.618"
              />
              <path d="M8.773 10.587S-.693 49.485 56.13 32.3" />
            </g>
          </svg>
        </button>
      </div>

      <div
        ref={menuWrapRef}
        className="relative grid overflow-hidden [grid-area:1/1/2/2] [grid-template-columns:100%] [grid-template-rows:100vh]"
        style={{
          backgroundColor: menuBgColor,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 flex h-[150vh] flex-col justify-center"
          style={{
            opacity: tileOpacity,
            transform:
              "translate3d(-50%,-50%,0) rotate(" + tileRotation + "deg)",
          }}
        >
          {tileRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={uid + "-line flex translate-x-[25%]"}
              style={{
                animationDuration:
                  (tileSpeeds[rowIndex] || tileSpeeds[0] || 10) + "s",
              }}
            >
              {[...row, ...row].map((tile, tileIndex) => (
                <div
                  key={tileIndex}
                  className="flex-none bg-cover bg-center m-[3vw]"
                  style={{
                    width: tile.large ? tileLargeSize : tileSize,
                    height: tileSize,
                    borderRadius: tile.large ? "20vh" : "50%",
                    backgroundImage: "url(" + tile.src + ")",
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <nav className="relative flex h-full flex-col items-center justify-center [grid-area:1/1/2/2]">
          {menuItems.map((item, index) => (
            <a
              key={index}
              ref={(node) => {
                menuItemsRef.current[index] = node;
              }}
              className={
                uid +
                "-mitem relative cursor-pointer text-right leading-none font-light will-change-transform " +
                (index % 2 === 0 ? "-ml-[10vw]" : "")
              }
            >
              {item.tinyFirst ? (
                <>
                  <span
                    className={uid + "-tiny"}
                    style={{ color: menuTinyColor }}
                  >
                    {item.tiny}
                  </span>
                  <span className={uid + "-word"}>{item.text}</span>
                </>
              ) : (
                <>
                  <span className={uid + "-word"}>{item.text}</span>
                  <span
                    className={uid + "-tiny"}
                    style={{ color: menuTinyColor }}
                  >
                    {item.tiny}
                  </span>
                </>
              )}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={closeMenu}
          aria-label={closeLabel}
          className={
            uid +
            "-close-btn absolute right-0 top-0 m-8 cursor-pointer border-0 bg-transparent p-0 fill-none"
          }
        >
          <svg width="25" height="16" viewBox="0 0 25 16" fill="none">
            <path d="M2.238 7.079h2.727M2.482 9.496l-.666-2.7" />
            <path d="M23.753 5.403s-1.87 16.88-22.03 1.785" />
          </svg>
        </button>
      </div>

      <svg
        className="pointer-events-none relative z-[1000] h-full w-full [grid-area:1/1/2/2]"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          ref={overlayPathRef}
          vectorEffect="non-scaling-stroke"
          fill={overlayColor}
          d="M 0 100 V 100 Q 50 100 100 100 V 100 z"
        />
      </svg>
    </div>
  );
}
