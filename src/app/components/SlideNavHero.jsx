"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Libre_Franklin, Barlow_Semi_Condensed } from "next/font/google";

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-primary",
});

const barlowSemiCondensed = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-button",
});

function easeOutPower3(t) { return 1 - Math.pow(1 - t, 3); }
function easeInPower1(t)  { return t; }

function tween(duration, onUpdate, onComplete, easeFn = easeOutPower3) {
  const ms    = duration * 1000;
  const start = performance.now();
  function tick(now) {
    const raw = Math.min((now - start) / ms, 1);
    onUpdate(easeFn(raw));
    if (raw < 1) requestAnimationFrame(tick);
    else onComplete?.();
  }
  requestAnimationFrame(tick);
}

export default function SlideNavHero() {
  const [navOpen,    setNavOpen]    = useState(false);
  const [showActive, setShowActive] = useState(false);

  const headerRef         = useRef(null);
  const headerDefaultRef  = useRef(null);
  const headerActiveRef   = useRef(null);
  const brandmarkDecorRef = useRef(null);
  const activeChildrenRef = useRef([]);

  useEffect(() => {
    if (!navOpen) return;
    function closeOnEsc(e) {
      if (e.keyCode === 27) closeNavigation();
    }
    document.addEventListener("keydown", closeOnEsc);
    return () => document.removeEventListener("keydown", closeOnEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navOpen]);

  function openNavigation() {
    setShowActive(true);

    function headerPosition() {
      const width = window.getComputedStyle(headerRef.current).width;
      return Math.round(parseInt(width, 10) * 0.8);
    }

    requestAnimationFrame(() => {
      const travelX = headerPosition();

      activeChildrenRef.current.forEach((el) => {
        if (el) {
          el.style.transform = "translateX(-80px)";
          el.style.opacity   = "0";
        }
      });

      tween(1.4, (t) => {
        if (headerActiveRef.current)
          headerActiveRef.current.style.transform = `translateX(${-100 + 100 * t}%)`;
      });

      tween(1.4, (t) => {
        if (headerDefaultRef.current)
          headerDefaultRef.current.style.transform = `translateX(${travelX * t}px)`;
      });

      setTimeout(() => {
        activeChildrenRef.current.forEach((el) => {
          if (!el) return;
          tween(1, (t) => {
            el.style.transform = `translateX(${-80 + 80 * t}px)`;
            el.style.opacity   = String(t);
          });
        });
      }, 300);

      setTimeout(() => {
        tween(0.7, (t) => {
          if (brandmarkDecorRef.current)
            brandmarkDecorRef.current.style.right = `${-6.5 + 2.5 * t}rem`;
        }, () => {
          setNavOpen(true);
        });
      }, 600);
    });
  }

  const closeNavigation = useCallback(() => {
    setNavOpen(false);

    tween(1, (t) => {
      if (headerActiveRef.current)
        headerActiveRef.current.style.transform = `translateX(${-100 * t}%)`;
    }, () => {
      setShowActive(false);
      if (headerDefaultRef.current)
        headerDefaultRef.current.style.transform = "translateX(0)";
    }, easeInPower1);

    setTimeout(() => {
      const width   = window.getComputedStyle(headerRef.current).width;
      const travelX = Math.round(parseInt(width, 10) * 0.8);
      tween(0.9, (t) => {
        if (headerDefaultRef.current)
          headerDefaultRef.current.style.transform = `translateX(${travelX * (1 - t)}px)`;
      }, undefined, easeInPower1);
    }, 100);

    tween(0.6, (t) => {
      if (brandmarkDecorRef.current)
        brandmarkDecorRef.current.style.right = `${-4 - 2.5 * t}rem`;
    }, undefined, easeInPower1);
  }, []);

  return (
    <div
      className={`
        ${libreFranklin.variable} ${barlowSemiCondensed.variable}
        [font-family:var(--font-primary)]
        bg-black text-white h-screen max-w-[120rem] mx-auto
        grid
        grid-rows-[4rem_minmax(min-content,19.5rem)_1fr]
        grid-cols-[[grid-start]_7rem_repeat(11,1fr)_[grid-end]]
        max-[1279px]:grid-cols-[[grid-start]_7rem_repeat(5,6rem)_repeat(6,1fr)_[grid-end]]
        max-[980px]:grid-rows-[36rem_4rem_minmax(min-content,19.5rem)_26rem]
        max-[980px]:grid-cols-[[grid-start]_7rem_repeat(11,1fr)_[grid-end]]
        max-[480px]:grid-cols-[[grid-start]_4rem_repeat(11,1fr)_[grid-end]]
      `}
    >
      <style>{`
        .nav__link { display: inline-block; }
        .breadcrumb__item + .breadcrumb__item::before {
          content: url(https://nav-slide-bikes.netlify.app/images/icon__caret--right.svg);
          margin-left: 0.5rem;
          margin-right: 0.5rem;
        }
      `}</style>

      <header
        ref={headerRef}
        className={[
          "row-start-1 row-end-[-1] col-start-1 col-end-7 overflow-hidden",
          "max-[980px]:col-start-1 max-[980px]:col-end-[-1] max-[980px]:fixed max-[980px]:w-full",
          showActive ? "z-10" : "",
        ].join(" ")}
      >
        <div className="grid relative z-[1] h-full">

          <div
            ref={headerDefaultRef}
            className={`row-start-1 row-end-[-1] col-start-1 col-end-[-1] flex flex-col items-center bg-[#ff671f] h-full max-w-[7rem] max-[480px]:max-w-[4rem] z-[1] ${showActive ? "pointer-events-none" : ""}`}
          >
            <div className="mt-8">
              <svg width="40" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="logo-title-d" aria-describedby="logo-desc-d">
                <title id="logo-title-d">Harley Davidson logo</title>
                <desc id="logo-desc-d">White badge with only the outlines</desc>
                <path fillRule="evenodd" clipRule="evenodd" d="M2.47 18.875h35.06v-5.458H2.47v5.458zm27.993 4.88S25.938 27.84 20 29.315c-5.938-1.475-10.46-5.56-10.46-5.56 1.347-.799 1.802-1.83 1.954-2.468h17.013c.153.639.606 1.67 1.956 2.468zM9.5 7.452s5.098.265 10.5-3.707c5.402 3.972 10.5 3.707 10.5 3.707-1.653 1.66-1.928 2.983-1.962 3.553H11.461c-.033-.57-.307-1.894-1.961-3.553zM40 11.005h-8.788c.052-1.38 1.856-2.04 1.856-2.04V5.409C23.255 4.88 20 0 20 0S16.745 4.88 6.932 5.41v3.555s1.804.66 1.856 2.04H0v10.282h8.759c-.501 1.773-2.997 2.222-2.997 2.222C12.912 30.829 20 32 20 32s7.09-1.172 14.237-8.491c0 0-2.496-.45-2.995-2.222H40V11.005z" fill="#fff" />
              </svg>
            </div>

            <button
              className="mt-8 bg-transparent border-none cursor-pointer [font-family:var(--font-button)] text-[1.125rem] leading-[1] font-medium uppercase"
              aria-labelledby="button-open-navigation"
              aria-expanded={navOpen}
              onClick={openNavigation}
            >
              <span id="button-open-navigation" hidden>Open Navigation</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                <line x1="0" x2="32" y1="12" y2="12" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="2" />
                <line x1="0" x2="32" y1="18" y2="18" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="2" />
                <line x1="0" x2="32" y1="24" y2="24" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="2" />
              </svg>
            </button>

            <div className="mt-auto mb-8" aria-labelledby="social-networks-menu-d">
              <h2 id="social-networks-menu-d" hidden>Social Networks Menu</h2>
              <ul className="list-none p-0 leading-none">
                <li className="mb-2">
                  <a href="#" className="inline-block p-1" target="_blank" rel="noopener" aria-labelledby="icon-facebook-d">
                    <span id="icon-facebook-d" hidden>Visit our Facebook page (opens in new tab)</span>
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                      <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M15.75 8.25h-1.5A2.25 2.25 0 0012 10.5V21M9 13.5h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="inline-block p-1" target="_blank" rel="noopener" aria-labelledby="icon-instagram-d">
                    <span id="icon-instagram-d" hidden>Visit our Instagram page (opens in new tab)</span>
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                      <path d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" stroke="#fff" strokeWidth="2" strokeMiterlimit="10" />
                      <path d="M16.125 3.375h-8.25a4.5 4.5 0 00-4.5 4.5v8.25a4.5 4.5 0 004.5 4.5h8.25a4.5 4.5 0 004.5-4.5v-8.25a4.5 4.5 0 00-4.5-4.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16.875 8.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" fill="#fff" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" className="inline-block p-1" target="_blank" rel="noopener" aria-labelledby="icon-twitter-d">
                    <span id="icon-twitter-d" hidden>Visit our Twitter page (opens in new tab)</span>
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                      <path d="M21 6.86a10.357 10.357 0 01-2.601 2.588h0A10.38 10.38 0 013 18.155h0a10.325 10.325 0 005.677-1.795h0A10.394 10.394 0 014.513 5h0a10.376 10.376 0 007.474 4.652h0a3.244 3.244 0 016.002-2.254h0A10.43 10.43 0 0021 6.859" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {showActive && (
            <div
              ref={headerActiveRef}
              className="row-start-1 row-end-[-1] col-start-1 col-end-[-1] flex flex-col bg-[#ff671f] h-full relative z-[2] overflow-hidden pt-16 pl-28 max-[480px]:pt-12 max-[480px]:pl-12"
              style={{ transform: "translateX(-100%)" }}
            >
              <button
                className="absolute right-6 top-12 z-[999] max-[480px]:top-10 bg-transparent border-none cursor-pointer [font-family:var(--font-button)] text-[1.125rem] leading-[1] font-medium uppercase"
                aria-labelledby="button-close-navigation"
                onClick={closeNavigation}
              >
                <span id="button-close-navigation" hidden>Close Navigation</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true" focusable="false">
                  <line x1="12" x2="44" y1="28" y2="28" transform="rotate(45 28 28)"  fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="2" />
                  <line x1="12" x2="44" y1="28" y2="28" transform="rotate(-45 28 28)" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="2" />
                </svg>
              </button>

              <div ref={(el) => { activeChildrenRef.current[0] = el; }} className="mt-0 mb-6">
                <svg width="40" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="logo-title-a" aria-describedby="logo-desc-a">
                  <title id="logo-title-a">Harley Davidson logo</title>
                  <desc id="logo-desc-a">White badge with only the outlines</desc>
                  <path fillRule="evenodd" clipRule="evenodd" d="M2.47 18.875h35.06v-5.458H2.47v5.458zm27.993 4.88S25.938 27.84 20 29.315c-5.938-1.475-10.46-5.56-10.46-5.56 1.347-.799 1.802-1.83 1.954-2.468h17.013c.153.639.606 1.67 1.956 2.468zM9.5 7.452s5.098.265 10.5-3.707c5.402 3.972 10.5 3.707 10.5 3.707-1.653 1.66-1.928 2.983-1.962 3.553H11.461c-.033-.57-.307-1.894-1.961-3.553zM40 11.005h-8.788c.052-1.38 1.856-2.04 1.856-2.04V5.409C23.255 4.88 20 0 20 0S16.745 4.88 6.932 5.41v3.555s1.804.66 1.856 2.04H0v10.282h8.759c-.501 1.773-2.997 2.222-2.997 2.222C12.912 30.829 20 32 20 32s7.09-1.172 14.237-8.491c0 0-2.496-.45-2.995-2.222H40V11.005z" fill="#fff" />
                </svg>
              </div>

              <nav ref={(el) => { activeChildrenRef.current[1] = el; }} className="[font-family:var(--font-button)] text-[1.75rem] leading-[2] uppercase" aria-labelledby="main-menu">
                <h2 id="main-menu" hidden>Main Menu</h2>
                <ul className="list-none p-0">
                  <li className="nav__item"><a className="nav__link text-white no-underline" href="#">Bikes</a></li>
                  <li className="nav__item"><a className="nav__link text-white no-underline" href="#">Parts</a></li>
                  <li className="nav__item"><a className="nav__link text-white no-underline" href="#">Mens</a></li>
                  <li className="nav__item"><a className="nav__link text-white no-underline" href="#">Womens</a></li>
                  <li className="nav__item"><a className="nav__link text-white no-underline" href="#">Goods &amp; Gifts</a></li>
                  <li className="nav__item"><a className="nav__link text-white no-underline" href="#">Experience H-D</a></li>
                </ul>
              </nav>

              <div ref={(el) => { activeChildrenRef.current[2] = el; }} className="mt-auto mb-8" aria-labelledby="social-networks-menu-a">
                <h2 id="social-networks-menu-a" hidden>Social Networks Menu</h2>
                <ul className="list-none p-0 leading-none flex gap-2">
                  <li>
                    <a href="#" className="inline-block p-1" target="_blank" rel="noopener" aria-labelledby="icon-facebook-a">
                      <span id="icon-facebook-a" hidden>Visit our Facebook page (opens in new tab)</span>
                      <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                        <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.75 8.25h-1.5A2.25 2.25 0 0012 10.5V21M9 13.5h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="inline-block p-1" target="_blank" rel="noopener" aria-labelledby="icon-instagram-a">
                      <span id="icon-instagram-a" hidden>Visit our Instagram page (opens in new tab)</span>
                      <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                        <path d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" stroke="#fff" strokeWidth="2" strokeMiterlimit="10" />
                        <path d="M16.125 3.375h-8.25a4.5 4.5 0 00-4.5 4.5v8.25a4.5 4.5 0 004.5 4.5h8.25a4.5 4.5 0 004.5-4.5v-8.25a4.5 4.5 0 00-4.5-4.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16.875 8.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" fill="#fff" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="inline-block p-1" target="_blank" rel="noopener" aria-labelledby="icon-twitter-a">
                      <span id="icon-twitter-a" hidden>Visit our Twitter page (opens in new tab)</span>
                      <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                        <path d="M21 6.86a10.357 10.357 0 01-2.601 2.588h0A10.38 10.38 0 013 18.155h0a10.325 10.325 0 005.677-1.795h0A10.394 10.394 0 014.513 5h0a10.376 10.376 0 007.474 4.652h0a3.244 3.244 0 016.002-2.254h0A10.43 10.43 0 0021 6.859" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>

              <div
                ref={brandmarkDecorRef}
                className="absolute bottom-0 w-full max-w-[352px] max-[480px]:max-w-[232px] pointer-events-none"
                style={{ right: "-6.5rem", transform: "rotate(-15deg)" }}
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://nav-slide-bikes.netlify.app/images/brandmark__full.svg" alt="" className="w-full" />
              </div>
            </div>
          )}

        </div>
      </header>

      <figure className="row-start-1 row-end-[-1] col-start-2 col-end-7 overflow-hidden z-[2] m-0 max-[980px]:row-start-1 max-[980px]:row-end-2 max-[980px]:col-start-2 max-[980px]:col-end-[-1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://nav-slide-bikes.netlify.app/images/product__main.webp" className="object-cover h-full w-full" alt="Motorcycle image" />
      </figure>

      <div className="row-start-1 row-end-2 col-start-7 col-end-[-1] flex items-end z-[2] bg-black max-[980px]:row-start-2 max-[980px]:row-end-3 max-[980px]:col-start-2 max-[980px]:col-end-[-1]">
        <nav aria-label="breadcrumbs">
          <ol className="[font-family:var(--font-button)] text-[1.125rem] font-medium list-none flex ml-8 breadcrumb">
            <li className="breadcrumb__item">
              <a className="no-underline uppercase text-[#ff671f]" href="#">Motorcycles</a>
            </li>
            <li className="breadcrumb__item">
              <a className="no-underline text-white" href="#" aria-current="page">Electric</a>
            </li>
          </ol>
        </nav>
      </div>

      <article className="row-start-2 row-end-3 col-start-7 col-end-11 z-[2] w-full max-h-[19.5rem] p-8 bg-black max-[1279px]:col-start-7 max-[1279px]:col-end-[-1] max-[980px]:row-start-3 max-[980px]:row-end-4 max-[980px]:col-start-2 max-[980px]:col-end-[-1] max-[980px]:text-center max-[980px]:pb-12">
        <h1 className="[font-family:var(--font-primary)] text-[3rem] font-bold leading-[1.167] mb-6 max-w-[32ch] max-[1279px]:max-w-[50ch]">
          LiveWire
        </h1>
        <p className="mb-6 max-w-[32ch] max-[1279px]:max-w-[50ch] max-[980px]:mx-auto">
          <span className="font-bold">A new way to ride. </span>Get instant
          power and acceleration with just a twist of the throttle.
        </p>
        <button
          className="[font-family:var(--font-button)] text-[1.125rem] leading-[1] font-medium uppercase bg-transparent cursor-pointer h-12 w-56 text-white"
          style={{ border: "2px solid #ff671f" }}
          aria-describedby="button-motorcycle-details"
        >
          <span className="align-text-top">Details</span>
        </button>
        <span id="button-motorcycle-details" hidden>Open Details Page</span>
      </article>

      <aside className="row-start-3 row-end-[-1] col-start-7 col-end-[-1] overflow-hidden z-[2] max-[980px]:row-start-4 max-[980px]:row-end-5 max-[980px]:col-start-2 max-[980px]:col-end-[-1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://nav-slide-bikes.netlify.app/images/product__support--horizontal.webp" className="object-cover h-full w-full" alt="" />
      </aside>

      <aside className="row-start-2 row-end-[-1] col-start-10 col-end-[-1] overflow-hidden z-[3] max-h-96 pl-16 text-right max-[1279px]:hidden max-[1279px]:invisible">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://nav-slide-bikes.netlify.app/images/product__support--vertical.webp" alt="" />
      </aside>

    </div>
  );
}