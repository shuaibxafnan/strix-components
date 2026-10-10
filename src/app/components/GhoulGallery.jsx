"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── GhoulGallery ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// ghouls   array   (built-in 4)   Array of ghoul objects:
//   { id, logo, number, qr, cardbg, riserbg, ghoullogofill, description }
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_GHOULS = [
  {
    id: "ghoul-1",
    logo: "logo-choke",
    number: "no-1",
    qr: "qr-1",
    cardbg: "#8FCCCC",
    riserbg: "#736673",
    ghoullogofill: "#72ADAD",
    description:
      "Not good at breathing. Likes bulging eyes and dizziness. Victims say he's breathtaking.",
  },
  {
    id: "ghoul-2",
    logo: "logo-evel",
    number: "no-1",
    qr: "qr-1",
    cardbg: "#E68AB7",
    riserbg: "#8B5F90",
    ghoullogofill: "#C274A8",
    description:
      "The OG fruit thief. Talks to serpents. Shameful. Banished from the Garden of Ghoul.",
  },
  {
    id: "ghoul-3",
    logo: "logo-adamn",
    number: "no-1",
    qr: "qr-1",
    cardbg: "#F58C77",
    riserbg: "#25537E",
    ghoullogofill: "#DB6E80",
    description:
      "The OG ghoul. Ate Evel's apples. Shameful. Banished from the Garden of Ghoul.",
  },
  {
    id: "ghoul-4",
    logo: "logo-1",
    number: "no-1",
    qr: "qr-1",
    cardbg: "#4ba877",
    riserbg: "#736673",
    ghoullogofill: "rgba(255,255,255,0.3)",
    description:
      "Born in a forgotten fruit salad. Exhibits a preference for malaria and bin mangoes.",
  },
];

function GhoulCard({ data, cardRef, uid }) {
  if (!data)
    return (
      <div
        ref={cardRef}
        className={`gg-card-${uid} absolute top-0 left-0 w-full h-full rounded-[22px] invisible z-[2] p-[22px] [transform-style:preserve-3d] will-change-transform`}
      />
    );

  return (
    <div
      ref={cardRef}
      className={`gg-card-${uid} absolute top-0 left-0 w-full h-full rounded-[22px] invisible z-[2] p-[22px] [transform-style:preserve-3d] will-change-transform`}
      style={{ background: data.cardbg, "--gg-logo-fill": data.ghoullogofill }}
    >
      {/* 3D Ghoul image block */}
      <div className="relative block w-full pb-[100%] will-change-transform [transform-style:preserve-3d] z-[5]">
        {/* Riser sides — complex 3D transforms in scoped CSS */}
        <div
          className={`gg-riser gg-riser-1-${uid}`}
          style={{ background: data.riserbg }}
        />
        <div
          className={`gg-riser gg-riser-2-${uid}`}
          style={{ background: data.riserbg }}
        />
        <div
          className={`gg-riser gg-riser-3-${uid}`}
          style={{ background: data.riserbg }}
        />
        <div
          className={`gg-riser gg-riser-4-${uid}`}
          style={{ background: data.riserbg }}
        />
        {/* Drop shadow */}
        <div className="gg-riser absolute w-full h-full bg-black opacity-50 -bottom-10 left-0 blur-[20px]" />
        {/* Ghoul SVG */}
        <svg
          viewBox="0 0 1600 1600"
          className={`gg-ghoul-img-${uid} absolute top-0 left-0 w-full h-full [backface-visibility:hidden]`}
        >
          <use href={`#${data.id}`} />
        </svg>
      </div>

      {/* Logo + name */}
      <div className="relative -mt-[22px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 115"
          className="w-full"
        >
          <use href="#ghoul-logo" />
        </svg>
        <svg className="absolute top-[70px] w-4/5 h-[100px] inset-x-0 bottom-0 mx-auto">
          <use href={`#${data.logo}`} />
        </svg>
      </div>

      {/* Bottom row: number | description | qr */}
      <div className="absolute flex justify-between bottom-[20px] left-[20px] w-[calc(100%-40px)]">
        <div className="max-w-[120px] max-h-[60px]">
          <svg className="w-full h-full">
            <use href={`#${data.number}`} />
          </svg>
        </div>
        <p className="text-white text-sm font-sans w-[calc(100%-100px)] m-0 mx-[20px] p-0">
          {data.description}
        </p>
        <div className="max-w-[60px] max-h-[60px] relative">
          <svg className="w-full h-full">
            <use href={`#${data.qr}`} />
          </svg>
        </div>
      </div>

      {/* Card back face */}
      <div
        className={`gg-back-${uid} absolute top-0 left-0 w-full h-full rounded-[22px] bg-[#ffe14b] grid place-content-center`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 180 244"
          className="w-[180px]"
        >
          <use href="#back-logo" />
        </svg>
      </div>
    </div>
  );
}

export default function GhoulGallery({ ghouls = DEFAULT_GHOULS }) {
  const uid = "gg";

  // Ping-pong card state: each slot holds a ghoul or null
  const [cardSlots, setCardSlots] = useState([null, null]);

  // Active card index (0 or 1), incoming card index
  const aCRef = useRef(0);
  const iACRef = useRef(1);
  const currentGhoulRef = useRef(0);

  const card0Ref = useRef(null);
  const card1Ref = useRef(null);
  const gsapRef = useRef(null);

  // Mouse tilt
  const wW = useRef(0);
  const wH = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const speed = 0.125;
  const xSetRef = useRef(null);
  const ySetRef = useRef(null);
  const tiltSetterRef = useRef(null);

  const getCardEls = useCallback(
    () => [card0Ref.current, card1Ref.current],
    [],
  );

  useEffect(() => {
    wW.current = window.innerWidth;
    wH.current = window.innerHeight;
    pos.current = { x: wW.current / 2, y: wH.current / 2 };
    mouse.current = { x: pos.current.x, y: pos.current.y };

    const loadScript = (src) =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[data-gg="${src}"]`)) {
          res();
          return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.setAttribute("data-gg", src);
        el.onload = res;
        el.onerror = rej;
        document.head.appendChild(el);
      });

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    ).then(() => {
      const { gsap } = window;
      if (!gsap) return;
      gsapRef.current = gsap;

      // Build tilt setters after GSAP loaded
      xSetRef.current = gsap.utils.pipe(
        gsap.quickSetter(getCardEls(), "rotateY", "deg"),
      );
      ySetRef.current = gsap.utils.pipe(
        gsap.quickSetter(getCardEls(), "rotateX", "deg"),
      );

      tiltSetterRef.current = () => {
        const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
        pos.current.x += (mouse.current.x - pos.current.x) * dt;
        pos.current.y += (mouse.current.y - pos.current.y) * dt;
        xSetRef.current(
          (gsap.utils.normalize(0, wW.current, pos.current.x) - 0.5) * 40,
        );
        ySetRef.current(
          (gsap.utils.normalize(0, wH.current, pos.current.y) - 0.5) * -40,
        );
      };
    });
  }, []);

  const getCards = useCallback(() => [card0Ref.current, card1Ref.current], []);

  const moveMouse = useCallback((e) => {
    mouse.current.x = e.x;
    mouse.current.y = e.y;
  }, []);

  const tilt = useCallback(() => {
    window.addEventListener("mousemove", moveMouse);
    if (gsapRef.current && tiltSetterRef.current) {
      gsapRef.current.ticker.add(tiltSetterRef.current);
    }
  }, [moveMouse]);

  const unTilt = useCallback(() => {
    window.removeEventListener("mousemove", moveMouse);
    if (gsapRef.current && tiltSetterRef.current) {
      gsapRef.current.ticker.remove(tiltSetterRef.current);
    }
  }, [moveMouse]);

  const openModal = useCallback(
    (i) => {
      const gsap = gsapRef.current;
      if (!gsap) return;

      currentGhoulRef.current = i;
      aCRef.current = 0;
      iACRef.current = 1;

      // Load ghoul data into card slot 0
      setCardSlots([ghouls[i], null]);

      // Need to wait for React to render the card data before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const cards = getCards();
          const modal = document.getElementById("gg-modal");

          gsap.set(modal, { autoAlpha: 1 });
          gsap.fromTo(
            modal,
            { backgroundColor: "rgba(255,255,255,0)" },
            { backgroundColor: "rgba(255,255,255,0.9)" },
          );

          gsap.set(cards[0], { autoAlpha: 1 });

          gsap
            .timeline({ onComplete: tilt })
            .set(cards[0], { rotationY: 180 })
            .fromTo(
              cards[0],
              { y: "50vh", yPercent: 50, rotateX: -130 },
              { y: 0, yPercent: 0, rotateX: 0, ease: "back", duration: 1 },
            )
            .to(
              cards[0],
              { rotationY: 740, duration: 1.25, ease: "sine.inOut" },
              "-=0.5",
            )
            .set(cards[0], { rotationY: 20 })
            .to(cards[0], { rotationY: 0, duration: 0.5, ease: "sine.inOut" });
        });
      });
    },
    [ghouls, getCards, tilt],
  );

  const closeModal = useCallback(() => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    unTilt();

    const cards = getCards();
    const aC = aCRef.current;
    const modal = document.getElementById("gg-modal");

    gsap
      .timeline()
      .to(cards[aC], { y: "50vh", yPercent: 50, ease: "back.in" })
      .to(modal, { autoAlpha: 0 })
      .set(cards[aC], { rotationY: 0 });
  }, [getCards, unTilt]);

  const nextAnimation = useCallback(() => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    unTilt();

    const aC = aCRef.current;
    const iAC = iACRef.current;
    let nextGhoulIndex = currentGhoulRef.current + 1;
    if (nextGhoulIndex > ghouls.length - 1) nextGhoulIndex = 0;

    // Load next ghoul into incoming slot
    setCardSlots((prev) => {
      const next = [...prev];
      next[iAC] = ghouls[nextGhoulIndex];
      return next;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const cards = getCards();
        gsap
          .timeline({ onComplete: tilt })
          .set(cards[iAC], { autoAlpha: 1 })
          .to(
            cards[aC],
            { duration: 1, rotateY: 360, x: "-50vw", xPercent: -100 },
            "sync",
          )
          .fromTo(
            cards[iAC],
            { rotateY: -360, x: "50vw", xPercent: 100 },
            { duration: 1, rotateY: 18, x: 0, xPercent: 0 },
            "sync",
          );

        aCRef.current = aC >= 1 ? 0 : aC + 1;
        iACRef.current = iAC >= 1 ? 0 : iAC + 1;
        currentGhoulRef.current = nextGhoulIndex;
      });
    });
  }, [ghouls, getCards, tilt, unTilt]);

  const prevAnimation = useCallback(() => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    unTilt();

    const aC = aCRef.current;
    const iAC = iACRef.current;
    let prevGhoulIndex = currentGhoulRef.current - 1;
    if (prevGhoulIndex < 0) prevGhoulIndex = ghouls.length - 1;

    setCardSlots((prev) => {
      const next = [...prev];
      next[iAC] = ghouls[prevGhoulIndex];
      return next;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const cards = getCards();
        gsap
          .timeline({ onComplete: tilt })
          .set(cards[iAC], { autoAlpha: 1 })
          .to(
            cards[aC],
            { duration: 1, rotateY: -360, x: "50vw", xPercent: 100 },
            "sync",
          )
          .fromTo(
            cards[iAC],
            { rotateY: 360, x: "-50vw", xPercent: -100 },
            { duration: 1, rotateY: -18, x: 0, xPercent: 0 },
            "sync",
          );

        aCRef.current = aC >= 1 ? 0 : aC + 1;
        iACRef.current = iAC >= 1 ? 0 : iAC + 1;
        currentGhoulRef.current = prevGhoulIndex;
      });
    });
  }, [ghouls, getCards, tilt, unTilt]);

  return (
    <>
      <style>{`
        /* --gg-logo-fill flows into the SVG symbol */
        .gg-card-${uid} .ghoul-logo use,
        .gg-card-${uid} [data-ghoul-logo] use {
          --ghoul-logo-fill: var(--gg-logo-fill, rgba(255,255,255,0.3));
        }

        /* Card initial state (GSAP overrides after open) */
        .gg-card-${uid} {
          --riser: 25px;
        }

        /* Riser 3D faces */
        .gg-riser {
          position: absolute;
          backface-visibility: hidden;
          width: 100%;
          height: var(--riser, 25px);
        }

        .gg-riser-1-${uid} {
          left: 0; top: 0;
          transform-origin: top center;
          transform: rotateX(90deg);
        }
        .gg-riser-2-${uid} {
          right: 0; top: 0;
          transform-origin: top right;
          transform: translateZ(var(--riser, 25px)) rotate(-90deg) rotateX(-90deg);
        }
        .gg-riser-3-${uid} {
          left: 0; bottom: 0;
          transform-origin: bottom center;
          transform: rotateX(-90deg);
        }
        .gg-riser-4-${uid} {
          left: 0; top: 0;
          transform-origin: top left;
          transform: translateZ(var(--riser, 25px)) rotate(90deg) rotateX(-90deg);
        }

        /* Ghoul image lifted above the 3D box */
        .gg-ghoul-img-${uid} {
          transform: translateZ(var(--riser, 25px));
        }

        /* Card back face */
        .gg-back-${uid} {
          transform: translateZ(-2px) rotateY(180deg);
        }
      `}</style>

      {/* Hidden SVG defs */}
      <svg style={{ display: "none" }}>
        <symbol id="ghoul-logo" viewBox="0 0 400 115">
          <g fill="var(--ghoul-logo-fill)" fillRule="nonzero">
            <path d="M0 0v115h75V40H40v42.1h-5V35h40V0zM120 0v41.1h-5V0H80v115h35V73.9h5V115h35V0zM160 0v115h75V0h-75zm40 85h-5V30h5v55zM279.9 0v82.1h-5V0H240v115h75V0zM355 0h-35v115h80V80h-45z" />
          </g>
        </symbol>
        <symbol id="back-logo" viewBox="0 0 180 244">
          <g fill="#99872D" fillRule="nonzero">
            <path d="M0 0h180v64.3H64.3v51.4h51.4V77.1H180V180H0zM0 244h33v-32.8H18.3v18.2h-3.6v-21.8H33V193H0zM54.3 193v18.2h-3.6V193H36v51h14.7v-18.2h3.6V244H69v-51zM72 193v51h33v-51H72zm19 37h-4v-22h4v22zM127.3 229.4h-3.6V193H108v51h35v-51h-15.7zM161 193h-15v51h34v-18h-19z" />
          </g>
        </symbol>
      </svg>

      {/* Ghoul character symbols */}
      <svg style={{ display: "none" }}>
        <symbol id="ghoul-1" viewBox="0 0 1600 1600">
          <g fill="none" fillRule="nonzero">
            <path
              fill="#134252"
              d="M0 0v1600h600v-100h400v100h600V0H0zm1500 1500h-400v-100H500v100H100V100h1400v1400z"
            />
            <path fill="#40AECC" d="M1000 400h300v100h-300z" />
            <path fill="#E37A25" d="M1000 600h100v100h-100z" />
            <path fill="#FDE04B" d="M1600 1600v-100h-100v100z" />
            <path
              fill="#988631"
              d="M1515 1515h70v25h-45v20h20v-15h25v40h-70z"
            />
            <path fill="#40AECC" d="M300 400h300v100H300z" />
            <path fill="#E37A25" d="M500 600h100v100H500z" />
            <path fill="#66CCE9" d="M800 100H100v100h1400V100z" />
            <path fill="#78979F" d="M600 1500v100h400v-100z" />
            <path
              fill="#368DA4"
              d="M1200 1200v100H400v-100H300v300h200v-100h600v100h200v-300z"
            />
            <path
              fill="#1B5A7B"
              d="M1200 1100V900h-100v300H500V900H400v200H300v100h100v100h800v-100h100v-100z"
            />
            <path
              fill="#134252"
              d="M900 300v600h500V300H900zm100 300h300v200h-300V600zm0-200h300v100h-300V400zM200 300v600h500V300H200zm400 500H300V600h300v200zm0-300H300V400h300v100z"
            />
            <path
              fill="#F6EE3E"
              d="M500 700V600H300v200h300V700zM1100 700V600h200v200h-300V700z"
            />
            <path
              fill="#368DA4"
              d="M100 200v700h100V300h500v300h200V300h500v600h100V200z"
            />
            <path
              fill="#66CCE9"
              d="M900 900V600H700v300H500v300h600V900zM100 900v600h200v-400h100V900zM1500 900v600h-200v-400h-100V900z"
            />
          </g>
        </symbol>
        <symbol id="ghoul-2" viewBox="0 0 1600 1600">
          <g fill="none" fillRule="nonzero">
            <path
              fill="#402640"
              d="M0 0v1600h300v-100h1000v100h300V0H0zm400 1400H300v-100h100v100zm200 0H500v-100h100v100zm300 0H700v-100h200v100zm200 0h-100v-100h100v100zm200 0h-100v-100h100v100zm200 100h-100v-300H200v300H100V100h1400v1400z"
            />
            <path fill="#FDE04B" d="M1600 1600v-100h-100v100z" />
            <path
              fill="#988631"
              d="M1515 1515h70v25h-45v20h20v-15h25v40h-70z"
            />
            <path fill="#8B5F90" d="M600 1100H200V800H100v700h100v-300h400z" />
            <path
              fill="#402640"
              d="M200 300v800h500V300H200zm400 700H300V400h300v600z"
            />
            <path fill="#DF2564" d="M300 400h300v200H300z" />
            <path fill="#333332" d="M300 600h100v200H300z" />
            <path fill="#F7EF3C" d="M400 600v200H300v100h300V600z" />
            <path fill="#FAC43D" d="M600 1000H300V900h300z" />
            <path
              fill="#F8EACC"
              d="M300 1300h100v100H300zM500 1300h100v100H500z"
            />
            <path
              fill="#8B5F90"
              d="M200 200h500v100H200zM1000 1100h400V800h100v700h-100v-300h-400z"
            />
            <path
              fill="#AC75B3"
              d="M100 100v700h100V200h500v900H600v99h400v-99H900V200h500v600h100V100z"
            />
            <path
              fill="#402640"
              d="M900 300v800h500V300H900zm100 100h300v600h-300V400z"
            />
            <path fill="#DF2564" d="M1000 400h300v200h-300z" />
            <path fill="#333332" d="M1200 600h100v200h-100z" />
            <path fill="#F7EF3C" d="M1200 600v200h100v100h-300V600z" />
            <path fill="#FAC43D" d="M1000 1000h300V900h-300z" />
            <path
              fill="#F8EACC"
              d="M1200 1300h100v100h-100zM1000 1300h100v100h-100z"
            />
            <path fill="#8B5F90" d="M900 200h500v100H900z" />
            <path fill="#F8EACC" d="M700 1300h200v100H700z" />
            <path fill="#9C7F9C" d="M300 1500h1000v100H300z" />
          </g>
        </symbol>
        <symbol id="ghoul-3" viewBox="0 0 1600 1600">
          <g fill="none" fillRule="nonzero">
            <path fill="#397EB9" d="M900 200h500v100H900z" />
            <path
              fill="#28313A"
              d="M900 300v800h500V300H900zm100 100h300v600h-300V800h100V600h-100V400z"
            />
            <path fill="#4679A9" d="M1000 400h300v100h-300z" />
            <path fill="#305678" d="M1000 500h300v100h-300z" />
            <path fill="#F5F077" d="M1100 800V600h200v400h-300V800z" />
            <path
              fill="#377FB9"
              d="M1100 1300v-200h300v-100h100v500h-200v-100h-300v-100z"
            />
            <path fill="#397EB9" d="M200 200h500v100H200z" />
            <path
              fill="#28313A"
              d="M200 300v800h500V300H200zm400 400H500v100h100v200H300V400h300v300z"
            />
            <path fill="#4679A9" d="M300 400h300v200H300z" />
            <path fill="#305678" d="M300 600h300v100H300z" />
            <path fill="#F5F077" d="M500 800V700H300v300h300V800z" />
            <path
              fill="#377FB9"
              d="M500 1300v-200H200v-100H100v500h200v-100h300v-100z"
            />
            <path
              fill="#262D35"
              d="M0 0v1600h400v-100h800v100h400V0H0zm1500 1500h-200v-100H300v100H100V100h1400v1400z"
            />
            <path
              fill="#5F9ED3"
              d="M100 100v900h100V200h500v100h200V200h500v800h100V100z"
            />
            <path
              fill="#25537E"
              d="M900 1200v100H700v-100H500v100h100v100h400v-100h100v-100z"
            />
            <path
              fill="#89BAE2"
              d="M900 1100V300H700v800H500v100h200v100h200v-100h200v-100z"
            />
            <path fill="#FDE04B" d="M1600 1600v-100h-100v100z" />
            <path
              fill="#988631"
              d="M1515 1515h70v25h-45v20h20v-15h25v40h-70z"
            />
            <path fill="#7A7775" d="M400 1500h800v100H400z" />
          </g>
        </symbol>
        <symbol id="ghoul-4" viewBox="0 0 1600 1600">
          <path fill="#C37ACC" d="M0 0h1600v1600H0z" />
          <path fill="#9C7F9C" d="M300 1500h1000v100H300z" />
          <path
            fill="#9862A1"
            d="M1400 900v400H200V900H100v600h100v-100h1200v100h100V900z"
          />
          <g fill="#FFC34B">
            <path d="M300 700h300v300H300zM1000 800h300v200h-300z" />
          </g>
          <g fill="#51B581">
            <path d="M300 500h300v200H300zM1000 500h300v300h-300z" />
          </g>
          <g fill="#784E80">
            <path d="M300 200v100h300v100h100V200H600zM1000 200H900v200h100V300h300V200z" />
          </g>
          <g fill="#F5EDB8">
            <path d="M200 200h100v100H200zM1300 200h100v100h-100z" />
          </g>
          <g fill="#403A40">
            <path d="M600 1100h100V400H200v700h400zM300 500h300v200H400v100h200v200H300V500zM200 1200h1200v100H200z" />
            <path d="M0 0v1600h300v-100h1000v100h300V0H0zm1500 1500h-100v-100H200v100H100V100h1400v1400z" />
            <path d="M1300 1100h100V400H900v700h400zm-300-200h200V800h-200V500h300v500h-300V900z" />
          </g>
          <path fill="#FDE04B" d="M1500 1500h100v100h-100z" />
          <path fill="#988631" d="M1515 1515h70v25h-45v20h20v-15h25v40h-70z" />
        </symbol>
      </svg>

      {/* Name logo symbols */}
      <svg style={{ display: "none" }}>
        <symbol id="logo-adamn" viewBox="0 0 217 80">
          <g fill="none" fillRule="nonzero">
            <path
              fill="#F5F077"
              d="M120.5 19c-1.9 9-3 18.2-3.5 27.5l3.9-1.1-.8 2.4c-.3.5-.7 1-1.2 1.3-.5.3-.9.9-1 1.5 0 .3 0 .7.2 1l.3 1.2c-.3.6-.5 1.4-.8 2.5l-1.2.4v12l-1.2.3-1.5 2.3c-.6.7-1.3 1.3-2.2 1.7.1.1.1.2 0 .2-.4 0-.7-.2-.9-.4-.3-.4-.6-.5-.8-.5-.1 0-.1 0 0 .1l-5 1.9c-.4-4.3-.6-8.9-.7-13.8-3 1-7 2.7-12.2 5-1.3 3.6-2.6 7.2-3.7 10.8h-.3c-.3 0-.5-.1-.6-.5-.2-.4-.4-.6-.6-.6-.3 0-.7.5-1.1 1.4a4 4 0 01-1 1.5l-.1-.1c-.5.2-1 .5-1.5 1l-1.4 1c.7-1 1.2-2 1.4-3.2l.6-.6-.4-1.3-2.2 2.3-.3 3.1c-.4.2-1 .4-1.4.4-.4 0-.6-.3-.7-.8l-.1-.8c-.2 0-.6.5-1.3 1.6H77c1.2-4 2.3-8.5 3.3-13.5C82.8 55 87 41.6 93 26l5.6-1.8c1-.5 2-1 3-1.7s2.2-1 3.4-1c2-.3 3.9-.9 5.7-1.7a66 66 0 00-1.6 4l2.5-.9a8 8 0 011.8-1.4l.7-.2-1.2 2 1.3 3.6 1.2-2.7-.3-2.1.2-.7-.2-.4c1.2-.5 3-1.2 5.5-2zm-77.1 0a192 192 0 00-3.5 27.5l3.9-1.1-.8 2.4c-.3.5-.7 1-1.2 1.3-.5.3-.9.9-1 1.5 0 .3 0 .7.2 1l.3 1.2-.8 2.5-1.2.4v12L38 68l-1.5 2.3c-.6.7-1.3 1.3-2.2 1.7.1.1.1.2 0 .2-.4 0-.7-.2-.9-.4-.3-.4-.6-.5-.8-.5-.1 0 0 0 0 .1l-5 1.9c-.3-4.3-.6-9-.7-13.8-3 1-7 2.7-12.2 5-1.4 3.6-2.6 7.2-3.7 10.8h-.3c-.3 0-.5-.1-.7-.5-.1-.4-.3-.6-.5-.6-.3 0-.7.5-1.1 1.4-.2.6-.6 1.1-1 1.5l-.1-.1c-.5.2-1 .5-1.4.9l-1.4 1c.7-.9 1.2-2 1.3-3l.6-.7-.3-1.3-2.3 2.3-.3 3.1c-.4.2-.9.4-1.4.4-.4 0-.6-.3-.6-.8s-.1-.8-.2-.8c-.2 0-.6.5-1.2 1.6H0c1.1-4 2.2-8.5 3.3-13.5C5.7 55 9.8 41.6 15.8 26l5.6-1.8c1-.5 2-1 3-1.7s2.2-1 3.4-1c2-.3 3.9-.9 5.7-1.7l-1.6 4 2.6-.9a8 8 0 011.7-1.4l.7-.2-1.2 2 1.3 3.6 1.1-2.7-.2-2.1.2-.7-.2-.4c1.2-.5 3-1.2 5.5-2zm26.8.5c5.4 0 9.5 1.1 12.5 3.2 3.3 2.3 5 5.7 5 10.1 0 1.5-.2 3-.6 4.5a41.9 41.9 0 01-7 15c-5.2 7-11.5 13-18.8 17.7-7 4.7-15 7.7-23.3 9l1.1-3h2.5l4-3.4-2.8.4-.7.4L42 68l2.8-.6c.8-9 2-18 3.6-27.4-2.2 1.1-4.3 2.3-6.4 3.6.7-3 1.9-6 3.5-8.8l-1.3-2h1l3.3-2.9-2.3.4-2 1.2 1-3.4-1.2-1.3c9.2-4.9 18-7.3 26.2-7.3zm99.9-2.7l-.4 4.6 2.8-1.7a161.5 161.5 0 00-1.5 44.7l-3.9 3.2-1.7-2.7a89 89 0 01-2.4 3l1 3-4.8 1.3c-2-8.1-3.5-16.4-4.3-24.7a129.5 129.5 0 00-10.5 22v1c0 .1-.2.2-.3.1 0 .4-.3.5-.7.5l-.4-.1.2-1.5.4-.7-.6-1.2-1.8 2.3.3 1.8-3 1c-2.4-4.7-4.4-9-5.9-12.7l-4 14h-.3a2 2 0 01-1-.2c-.7-.5-1.6-.4-2 .2v-.2l-.3-1.4.2-.6-.6-.7-1 1.8.8 1.9h-1l-.6 2-5.3 1.3a216 216 0 0111-49.1h3.3l-1.2 1.6.4 4 1.3-2.3.1-2.1.4-.7-.2-.5.7-.1h.8c.4 0 .7.2.8.8.2.7.5 1 1 1 1.3-.4 2.5-.9 3.6-1.6l3.9-3.5-.3 1.8c.6-.3 1.2-.4 1.8-.4-1 2-1.8 4-2.6 6a46.5 46.5 0 00.2 20.3c1.8-7.8 5.5-17.6 11.3-29.2l3.8.8.6-2.5 4-1.9-.6 1.1 1 2.7.5-1.9-.1-1.3.2-.5-.3-.4 7.2-3.4zm45.2 2.1l-1 4.4 2.2-1a230.3 230.3 0 00-7.2 44.5c-1.3 1-2.4 1.6-3 2-.5-1-.8-2.1-1-3.3L203 68l.3 3.1H201l-1 2.9c-6.6-7.6-11.4-14-14.4-19.6-.3.8-.8 3-1.5 6.3a58.2 58.2 0 01-2.2 8 117 117 0 00-1 7l-2.3.7-.5-.6.8-1.6.3-2 .3-.5-.4-1.3-1.7 2.2.2 2.5-.8-1.2-3.3 3.9-1-.9-1.8 1.1c2-20.2 4.4-37 7.3-50.8.8-.1 1.5-.2 2.3-.1 1 0 2-.4 2.7-1 .8-.6 1.6-1.2 2.5-1.6V29l1.6-2.3c.4-.9.9-1.7 1.5-2.4l3.7-1.2c0 .4 0 .7.3 1 .2.3.3.6.2 1h.2l.3-.3v.8a.3.3 0 00.5.2l-.2.9c1.7 10 3.8 17.6 6.2 23-.2-4 .6-12.2 2.6-24.3l2.7-1.5c.2-1 .4-2 .8-3l4.7-1-1.2 1.6.4 4 1.3-2.3.2-2.1.4-.7-.3-.7c1-.1 2.3-.4 3.8-.8z"
            />
            <path
              fill="#262D35"
              d="M144.6.5c1 .7 1.7 1.8 1.7 3v.2a3.4 3.4 0 11-6.8 0 3.4 3.4 0 015.1-3.2zm15.3 0c1 .7 1.7 1.8 1.7 3v.2a3.4 3.4 0 11-6.8.2v-.2A3.4 3.4 0 01160 .5zm-66.3.6l-1 1.5c-.7-.5-1.4-.7-2.1-.7-.4 0-.5 0-.6.2 0 .2.2.4 1 .5 1.7.3 2.9.8 3 2.1V5c0 1.4-1.2 2.3-3.1 2.3-1.3.1-2.6-.3-3.6-1.1l1.2-1.5a4 4 0 002.5.8c.4 0 .5 0 .6-.2 0-.3-.2-.4-1-.5-1.5-.3-3-.8-3-2.1v-.2c0-1.3 1-2.3 3-2.3 1.1 0 2.2.3 3.1 1zM53 0v2h-3.5V3h3.2v1.9h-3.2V7H47v-7h5.9zm10.9 0v7h-2.3v-7h2.3zm67 0v7h-2.3v-5l-1.2.3-.4-1.7L129 0h1.8zM78.5.9c.4.4.6 1 .7 1.5v.2c0 1-.6 1.8-1.4 2.1l1.6 2.4h-2.6l-1.3-2H75v2h-2.4v-7H76c1 0 1.8.3 2.5.8zm29.8-.8v2h-2v5h-2.4v-5h-2v-2h6.4zm34.6 2c-.6 0-1 .5-1 1.4v.1c0 1 .4 1.7 1 1.7s1-.6 1-1.5v-.1c0-1-.4-1.7-1-1.7zm15.3 0c-.6 0-1 .5-1 1.4v.1c0 1 .4 1.7 1 1.7s1-.6 1-1.5v-.1c0-1-.4-1.7-1-1.7zM76 2h-1v1.4h1c.5 0 .8-.2.9-.6v-.1c0-.5-.4-.7-.9-.7z"
            />
          </g>
        </symbol>
        <symbol id="logo-choke" viewBox="0 0 201 86">
          <path
            fill="#134252"
            fillRule="nonzero"
            d="M151.8 14.1a6 6 0 01-.9 2c0 .2-.1.4-.3.4v.4c.6-.7 1-1.2 1-1.5l.7-.8h.2l-2.3 4c0 .2 0 .3-.3.6.2 0 .3 0 .3.2 0 .1.3-.2.4-.6h-.2l.1-.2h.4c.6-1.3 1-2 1.2-2v.2c-.4.7-.8 1.3-1 2-1 1.1-1.7 2.3-2.3 3.6-.3 0-.5.3-.6.8-.5.5-1 1-1.2 1.7-.2.2-.3.3-.5.3v.3h.2l1-1v.2l-1.2 1.6-1.3 1.7h.1c.9-.6 1.3-1 1.3-1.2l1.1-1.2c0-.2.3-.4.7-.7l.7-1.2.2.2c0-.2.1-.3.3-.3h-.2l.3-.5c.2 0 .3.1.3.2l-.7 1v.2c.5-.7 1-1.3 1.6-1.8v.1c-.5 1-1 2-1.8 2.7v.1l3.5-3.3c.7-.9 1.4-1.7 2.2-2.4h.3l-.3.5h.2c0 .5-.3 1-.5 1.4 0 .7-1 2.3-3.2 4.8a21 21 0 01-2 2.4c0 .4-1.3 2-3.7 5l-5.2 6c-.9.6-1.7 1.4-2.5 2.2-1.4 1.8-2.3 2.6-2.6 2.6a3 3 0 00-.3.8s.3.4.5 1.1l.8 1.5c1 2.3 2.4 4.5 4 6.6a37.4 37.4 0 004 6.6c.8 1 1.6 2 2.2 3.1 1 1.4 2 2.7 3.2 4 1.2 1.3 2.4 3 3.8 4.8 0 .2.7 1 2.2 2.3 0 .1.4.7 1.2 1.5.8.9 1.4 1.5 1.4 1.7l-2.5-1.4c-.5-.7-1-1.3-1.8-1.7l1.3 1c-.4 0-.8-.3-1.4-.9-.3-.1-.4-.3-.4-.5h-.1v.1l.8.8v.2h-.2l-.4-.3v.1l.5.5v-.1h.4v.3l-.3-.1a6 6 0 012.1 2.8c-.6-.4-1.1-1-1.6-1.5-.2 0-1.8-1.6-4.7-4.8.4 1 1 1.7 1.7 2.3l1 1 .8.8c.5.5.9 1.1 1 1.8h.3l-.2-.3h.3v.5l.2.2h-.1l-.3-.2-.3.2-.4-.5h.1v-.4h-.3v.1l.1.3c-1-.7-1.8-1.5-2.6-2.3v-.2h.1l.3.1s0-.2-.3-.3l-.6.1c-.2-.4-.5-.8-1-1l.1.2v.2c.3 0 .6.4.9 1.3h.2l-.2-.3v-.1h.1l.6.7h.1V77.8h.1v-.2l.1-.1.8 1h-.1l-.2-.2v.1l1 .9v.4l-1.5-1.4c-.5-.5-.8-.8-1.1-.8-.6-.7-1.2-1.3-1.9-1.8a84.1 84.1 0 01-7.8-7.5l-.2.1-.4-.5v.2a95 95 0 0010.3 11.4V79.7h-.3c0 .2.1.3.3.5l1 .9v.3c-.3 0-.8-.4-1.6-1.2-.5-.5-1-1-1.3-1.5-.2 0-.9-.5-2-1.6-.2-.3-.4-.5-.6-.5 0-.3-.2-.6-.7-.9v.3l-.2-.1v.1a9 9 0 001.5 1.7h-.4c.5 1 1.2 1.8 2 2.5l-.2.2v.1c1.3 1.1 2.4 2.3 3.4 3.6h-.2l-.2-.1v.2l.8 1v.2h-.3v-.5l-.2.1c-.6-.4-1.2-1-1.9-1.7a9.3 9.3 0 00-2-2c.5 1 1.2 1.9 2 2.7l.2.3h-.2l-1.3-1.2-.1-.3h-.3l.1.2h-.2l-.7-.9V82h-.2l.2.1-.5.3.1.5c-.7-.6-1.4-1.3-2-2.1l-.2-.1a.2.2 0 01-.2.2l-2.4-2.6h-.3c.6 1.1 1.3 2.1 2 3a9 9 0 001.7 2.4c.3.3.5.8.7 1.2l-.2.1a8.8 8.8 0 01-3.6-2.7c-.8-1-1.6-2-2.5-2.8-.5-1-1.2-1.7-2-2.2-.6-.6-1.1-1.2-1.6-2-.3-1-1-2-2.1-2.6-.6-.8-1-1.6-1.4-2.5-1.8-1.9-2.7-3.1-2.8-3.8l-1.5-2.2c-.9-1.9-2-3.7-3.3-5.3a7 7 0 00-1.1-1.8l-.2.8v.7l-.9 8v.2c0 .4 0 1-.2 1.4l.1.2c-.2 0-.5 2.3-1 7l-.1.2v.3c-.5.6-.8 1.4-.8 2.2h-.3l-.4.2.1-3.7v-1.4l.1-.2v-1.5c0-.3 0-.5.2-.7-.1 0-.2-.2-.3-.8h-.1c-.2 2.8-.4 4.2-.6 4.2h-.1c0-.1 0-1.2.3-3.3v-.2h-.1l-.4 4h-.2v-3l.2-.1-.2-.2v-.7l.2-.2h-.2l.4-1.4-.2-.5c-.2 0-.4 1.7-.6 5v.5h-.3l-.1-.2.1-.2-.1-.4c.2-1 .4-1.9.4-2.8l.2-1.9v-.4l.4-4.3h-.2l.2-.3c0-.8 0-1.5.2-2.2l-.2-.3a.2.2 0 00.3-.3l-.1-1.3v-1.6s-.2 0-.2.2c0 1-.3 4.4-1 10.4 0 .5-.2.7-.5.7v.2h.2v.2h-.2c0 .2-.2.4-.5.4v.1c.2 0 .4.1.4.3v.1l-.1 1.8h-.3v-1.3h-.2v1l.1.4-.2.5h-.2v-2l.2-.2h-.1c0-.5.1-.8.2-.8 0-.2-.1-.3-.2-.3l.4-.9v.7h.2l.1-.7v-.3h-.3v.2c-.1 0-.2-.4-.2-1.1h-.1l-.2.7a42.8 42.8 0 00-.7 4.8v-.2l.2-3-.1-.2.2-.4h-.3c0 .9-.2 1.8-.4 2.6l-.2.7-.2-.2v.6h-.2V72c.2 0 .3 0 .3-.2v-.1c-.2 0-.3 0-.3-.2v-1.4c.2.4.2.7.2 1h.1c0-.4.1-.7.2-.7 0-.3-.2-.4-.5-.4v-.3h.2v.2h.2v-.4h-.3c0-.2-.2-.5-.5-.7 0-.1 0-.2.2-.2 0 .2 0 .4.3.4 0-.3 0-.5.2-.5h.2v-.2a1 1 0 01-.4 0l.1-.6v-.5a.2.2 0 00-.2.2.8.8 0 00-.3-.1v-.9l-.4 2.2v-.2-.3l-.2-.1v.1c0-.7 0-1-.2-1l.1-.4v-.3h.3l-.3-.9h.3v.1-.6l-.2.1c-.2.2-.2.6-.3 1l.1.1-.3 1.5.1.2v.4c-.2 0-.3 0-.3-.3 0-1.6 0-3.3.3-5v-.3h.1v-1l.1-1.2a3 3 0 010-.8h-.3c0 .5 0 .9-.2 1.3.1 0 .2 0 .2.2 0 .4-.1.6-.4.6l.2.6-.2 2.6h-.1l.1.2-.2 2.8h-.2v.2l.1.2h-.2v-.2-2.2l-.1-.1c0 .7-.1 1.5-.3 2.2V68.8c-.4 2.4-1 3.7-1.3 4 0 .7-.3 1.1-.8 1.2v.4h-.2v-4.1l.2-.4-.1-.4V69v-2-.1c0-1 .1-2 .4-3l-.1-.2c.2 0 0-.2 0-.2v-1.1c0-.7.1-1.4.4-2h-.1l.5-3v-2l.7-4.4h-.2.2l-.2-.3v-.1l.5-5.4.2-.2h-.1l.8-3.8h-.1c.4-2 .6-4.2.6-6.3l.9-5.9h-.1l.8-6.2h-.1l.4-2.5V20l1-2.5h.1l.1.4V20l.1 2.5-.2.9v.5l.2.8v2h.1a.1.1 0 01.1-.1v-.8l.1-.7h-.1l.2-1c0-1.3.4-2.6 1-3.8h.1v1h.1l.2-.7c.3-1.5.5-2.3.7-2.3v.2c0 .9-.1 1.3-.2 1.3v3.5c0 1 0 2-.3 3l.1.3v1l.7-.3V27l-.1-.4c0-.8.3-1.7.6-2.4.1-1 .4-2 .8-3a12.6 12.6 0 011.4-3.8c0 .3 0 .5.2.8h-.2v.2h.2l-.4 1.6.1.4c-.2.4-.5 2-1 4.5h.5l-.1.3c.3-.2.4-.6.5-.9a.8.8 0 00-.4-.1l1.5-6.2c.2-.7.5-1.3 1-1.8v.7c.2.7.3 1.3.3 2h.1l.2-.2v.8c0 .5-.1.9-.3 1.3l.1.2-.2.5v2.7h.2a.2.2 0 00.2-.2v-.7l.1-.9h.2c.5-1 .8-2.2.9-3.4h.1l-.1-.2 1-3.2h.1v.5a43.8 43.8 0 010 2.6l-.1.7V23a31.4 31.4 0 00-.2 3.8l-.3 1.4v2.5c0 .6-.1 1.2-.3 1.7v.3a31.2 31.2 0 01-.1 3 54.7 54.7 0 008-8c1.1-1 2-2 2.9-3.2l2-2.2c0-.3.5-.9 1.6-1.7.3-.7 1-1.4 1.7-1.7.6-.9 1.4-1.6 2.2-2.1l-.4.6v.1l.2.1-1.4 2.7c-.2 0-.4.3-.9 1-.4.5-.7 1-.8 1.6h.2a6 6 0 00-1.3 2v.5c.7-.6 1.2-1.3 1.7-2.1v.2c-.3.7-.7 1.4-1.2 2l5-6.4c.8-.8 1.6-1.7 2.1-2.7.4-.7.7-1 .8-1v.2l-.6 1.2h.1l1.6-2.5h.2c-.2.7-.6 1.3-1 1.8v.5a27 27 0 00-2.2 3.2c-.3.5-.6.9-1 1.2l.1.3h.3c.4-.5.9-1.1 1.2-1.8.8-.7 1.4-1.6 1.9-2.6l.7-.8v.2a130.7 130.7 0 01-5.7 8.2l-4 5.4-1 1.3c-.3 0-.4.2-.4.6a33 33 0 003.1-3.4c0-.4.3-.8.5-1 1-1 1.7-2.1 2.3-3.3 1.8-2 3.5-4.2 4.9-6.6l2.3-3.4z"
          />
        </symbol>
        <symbol id="logo-evel" viewBox="0 0 195 92">
          <g fill="none" fillRule="nonzero">
            <path
              fill="#F7EF3C"
              d="M57.9 12.9c1.2 2.2 2.2 4.6 3 7.1l.8 2.6h.1v.2c.4 1.7.8 3.5 1 5.2.3 0 .9 1.1 1.7 3.2h.1V31c-.3-1.8-.8-3.6-1.3-5.3l-.8-3.3.2-.3-.4-1.6c.1-.5.2-.7.4-.7.3 1.9 1 3.7 2 5.4 1 2.6 1.7 5.2 2.3 7.8l1.5 4.5a16 16 0 011.3 4.5c.4 2 1 4 1.6 6 0 1 .8 4 2.4 9.4l-.2.2c.4 1.8.7 2.7 1 2.7h.2a34 34 0 001.8-6.6 53.7 53.7 0 013.3-9.3c.1-.9.4-1.7.8-2.4l-.2-.2c1-1.7 1.7-3.5 2.1-5.3.3 0 .7-1.2 1.3-3.6.6-1 .9-2.2 1-3.4.6-1.2 1-2.5 1-3.8.8-1.2 1.3-2.6 1.7-4 0-.4 0-.6.2-.6l.2.3c0 .4-.1.6-.3.6l.1.1-.2 1.5v.4l-.5 1.6.1.4c-.2.3-.4 1.5-.6 3.6-.2 0-.4.6-.7 1.8a.1.1 0 010 .2c-.1 1.1-.5 2.2-1 3 0 .8.2 1.2.4 1.2l2-6.1h.2l-.1.2h.1l-.1.2v.2l.6-1.1-.3-.3.6-1.8.4-.3v.3a23 23 0 01-1.2 4.4v.2l-.4 1.6v.4h.1c.2-1 .6-1.8 1-2.7.3-1.7.7-3.3 1.3-5l.2.2.3-.1v.1l-.8 3.3v.2h.1c.1-.5.2-.8.4-.8v.3c0 .4 0 .6-.3.6l.2.2-1.3 4.8h.2c-.6 1.4-1 3-1.3 4.4.2 0 .5-.7 1-2.2V37h.3v.2h.2l.1-.6v-.1.2h-.3c.1-.8.3-1.2.5-1.2l-.2.6v.2h.2l1-2.8c0-.6.4-1.2.8-1.6v.4a33.5 33.5 0 00-1.1 3.6.1.1 0 00.1.2l-.1.2v.2h.3c0-.1 0-.2-.2-.2.6-1 1-2.3 1.2-3.6.5-1.1 1-2.4 1.3-3.6h.2l-1.1 4h.1c-.4 1.1-.7 2.2-.8 3.4v.1h.1c.8-2.4 1.4-3.6 1.6-3.6v.1a58.7 58.7 0 01-3.2 10.2 4 4 0 01-.6 1.8v.2c.4-.4 1.5-3 3.3-8l2.6-8.2h.2l-1.3 4.5-.2.7v.1c.3 0 .7-1 1.1-3.3.7-1.6 1.3-3.3 1.8-5h.2v.1c-.3 1.3-.6 2.6-.7 3.9-.2 0-.3 0-.3.2v.5c.1 0 .4-.6.9-2h.1v-1.3l1-2.9c.2 0 .4-.4.5-1.3h.2v.4a73 73 0 01-2 7.6l-1.4 5.1c.2 0 .5-1 1-3h.4l-.1.2v.2h.2v.6l-2.8 7.8h.4l2.4-6.9A76.4 76.4 0 00100 25c.6-1.5 1.1-2.3 1.5-2.5.2 0 .4.4.5 1.3l-1.9 5.1c-.4 1.7-1 3.4-1.8 5-.4 1.5-1 3.1-1.6 4.6-1 3-2 5.9-3.2 8.7a33 33 0 01-1.4 4c-.4 1.8-1 3.5-2 5.1-.1.9-.5 1.7-1 2.4a46 46 0 01-2.1 5.1 74.6 74.6 0 00-3.3 8.5 66.3 66.3 0 01-2.4 5.5l-2.2 6.6-2 3a.2.2 0 01-.2-.3l3.2-9.8h-.3c-.5 1-1 2.2-1.2 3.3l-.5.4 2.3-8.1h-.2c-.2 1-.6 2-1.1 3h.1l-.2.1c-.2 0-.3-.1-.3-.4l.2-.6A61 61 0 0073 87.4l-.3.1v-.2a25 25 0 002.3-7.2v-.4c0 1.3-.2 2.1-.7 2.5H74V82c-.2 0-.5 1-1 3h-.1v-.1l.2-2v-.3H73c-.1 1-.4 1.9-.8 2.7 0 .4 0 .5-.2.5h-.2v-2.2l-.3 1.4.1.2c-.3.3-.6.7-.6 1.1h-.1l-.1-1 .1-.2-.1-.5.1-1h-.1l.1-.2-.1-2.1c-.3 0-.5.7-.5 2h-.1l-.2-.6h-.1l-.1 1-.4-.3V85h-.1c0-.4-.1-.8-.3-1.1a.1.1 0 01.2-.1L69 83v-1.3l-.1-.5.1-.4a1 1 0 01-.1-.4h-.1l-.1 1.6h.1l-.1.3V86c-.2 0-.3.3-.5 1-.2 0-.4.1-.5.4h-.1v1.2h.1c-.4.8-.6 1.7-.6 2.5l-.3.2A35.2 35.2 0 0165 81.3l-1-4c-.5-.5-.9-2-1.3-4.8-.8-1.4-1.3-3-1.4-4.6A90.1 90.1 0 0058 57.2c-.3-1.4-1.1-4-2.3-7.7-.7-1.7-1.2-3.5-1.5-5.3l-.6-2.2-1-3.7a9 9 0 00-.8-3.6 52.3 52.3 0 00-2-8v-1.4h.3c.2 0 .4.5.5 1.5.2 0 .5.4.9 1l.2.2-.1.4c.7 1.6 1.2 3.2 1.6 5 .3 1 .8 2 1.3 2.8h.3l-.7-2.6c.1 0 .2 0 .2-.2l-.1-.8h.1a1 1 0 01-.1-.4l-.4.2h-.2c-.1-.6-.3-1.3-.6-1.8l.1-.5-1.7-5.2.2-.1.1.5h.2v-.1l-.6-1.6.2 1.2-.6-1.4h.2a.1.1 0 00.2 0v-.3a602 602 0 015.4 15.6c.1 0 .2-.1.2-.3-.2-1.1-1.4-5-3.7-11.4 0-.1-.7-2.6-2.3-7.2l-.2-.7-.7-2h.1a224.2 224.2 0 018.2 23L59 42h.3l-2.8-9.6V32l.5.4-.8-2.8v-.1a.1.1 0 00.1-.2H56v-.1h.2l-.6-2.3v-.4h.1l1.3 3.3c.2 1 .3 1.4.5 1.4h.1l-2-6.4.4-.3A156.8 156.8 0 0161.3 40h.1v-.1c0-1.1-.2-1.7-.3-1.7v-.3a50.2 50.2 0 01-2.7-9.7H58L58 28l.2-.1v-.4l-.3.1.1-.6v-1.1c.2 0 .7 1.3 1.6 4h.1v-.3L58 24.2V24l.2-.2c.5 1 1 1.8 1.3 2.7h.1v-.2c-.6-1.3-1-2.6-1.5-4l.1-.5c-.2 0-.3-.4-.3-1.1h.1l-.3-.9h.2l2 4.5h.2v-.2l-2.7-6.5h.3c-.4 0-.5-.3-.5-.7l-.8-1.9h.3l1.4 3.2h.2c.3.9.7 1.7 1.2 2.4a32.4 32.4 0 002 4.5h.1v-.4l-1.4-4.6c-.5-1.6-1.1-3.6-2-5.7l-.3-1.5v-.1z"
            />
            <path
              fill="#402640"
              d="M132.9.5c1 .7 1.6 1.8 1.6 3v.2a3.4 3.4 0 11-6.8 0A3.4 3.4 0 01133 .5zm15.2 0c1 .7 1.7 1.8 1.6 3v.2a3.4 3.4 0 11-6.7 0 3.4 3.4 0 015.1-3.2zM82 1.1l-1.1 1.5c-.6-.5-1.4-.7-2.1-.7-.3 0-.5 0-.5.2s.1.4.9.5c1.7.3 2.9.8 3 2.1V5c0 1.4-1.2 2.3-3.1 2.3-1.3.1-2.6-.3-3.6-1.1l1.3-1.5a4 4 0 002.4.8c.4 0 .6 0 .6-.2 0-.3-.2-.4-1-.5-1.5-.3-2.9-.8-3-2.1v-.2c0-1.3 1-2.3 3-2.3 1.1 0 2.3.3 3.2 1zM41 0v2h-3.5V3h3.3v1.9h-3.3V7h-2.4v-7h5.9zM52 .1v7h-2.3v-7H52zm14.8.8c.4.4.6 1 .6 1.5v.2c0 1-.5 1.8-1.4 2.2L67.6 7H65l-1.3-2h-.5v2h-2.4v-7h3.5c.9 0 1.8.3 2.5.8zM119 .1v7h-2.3v-5l-1.1.3-.4-1.7 2-.6h1.8zM96.6.1v2h-2.1v5h-2.3v-5H90v-2h6.5z"
            />
          </g>
        </symbol>
        <symbol id="logo-1" viewBox="0 0 274 66">
          <g fill="#FFF" fillRule="nonzero">
            <path d="M49.5 15.4A29.5 29.5 0 0136.7 33c3 1 4.6 3 4.6 5.9-.2 2.4-1 4.8-2.3 6.9a28.7 28.7 0 01-13.6 12 40 40 0 01-17 3.5l-.9 1.1-1-.8L4.7 63l.2-1.9c-1.7-.1-3.3-.4-4.9-.8l.7-1.4c1.4-.3 2.7-.8 4-1.6l-.9-.7 2-.7-1.2-.3-1.2.1H2.8l-.3-.2-.3-.8 3-1.3-.6-2.8 1.3.2C7 40.5 8.3 31.5 9.7 23.7l-6.4 4v-3.4H5l3.8-3-2.6.4-2 1.2-.7.1-.3.3v-1.6l.4-.3-.4-.4a.9.9 0 01-.4-.6l.4-.2V20c.4-.4 1-.8 1.5-1 1-.5 1.5-.8 1.6-1l-.1-.5c0-.1-.4-.3-1-.3s-1-.3-1-.5l.3-.3a8 8 0 01-1.8.4c-.4 0-.5-.2-.2-.4l-.3.3c-.3 0-.1-.3.4-1l.9-1H3l.3-1.3 2-1.3A57.2 57.2 0 0135.6 2c3.4-.2 6.9.7 9.9 2.4a8.8 8.8 0 014.3 8l-.3 3z" />
            <path d="M273.6 3L251 29.2a629 629 0 00-25.3 33.3h-4.2l1.2-1.8-1.6.3.8-.5 1.4-2 .8-.3.4-1.5-2.7 1.1L220 61l-3 .4 4.2-6.9-6.5 5.8-.5-.4L231.6 34c-4.8-8-8.3-14.4-10.6-19.1l2-2.8-.2 1.5 3 3V14l-1.2-1.7v-.9l-.8-.3 2-2.5 2.3 2 .6-3.9c1-1 1.7-1.9 2.5-2.9a41 41 0 011.7 3.5l1.7-1.6c1.6 4.5 3.7 9.5 6.1 15 3.4-4.9 8.5-11.7 15.5-20.7a3 3 0 011.6 1.4c.4.8 1.1 1.2 2 1.3-.2 0 1.1-.4 3.8-1l-1 .4-2.9 5.4 3-2 1.9-2.4.9-.5.1-.7.8 1.6c.3.6.9.9 1.5.8a9 9 0 002.6-.6 9 9 0 012.7-.7h.4z" />
          </g>
        </symbol>
      </svg>

      {/* Number + QR symbols */}
      <svg style={{ display: "none" }}>
        <symbol id="no-1" viewBox="0 0 97 49">
          <g fill="none" fillRule="nonzero">
            <path
              fill="#F7F7F7"
              d="M4.7 36v11h3V36H11v11H9.3v1.6H3.1V47H1.5V36h3.2zm28 0v3.3H31v-1.6h-3V47h3v-1.6h1.6V47H31v1.6h-4.7V47h-1.6v-9.3h1.6V36h6.2zm10.8 0v1.7H45V47h-1.5v1.6h-6.3V47h-1.5v-9.3h1.5V36h6.3zm40.3 0v1.7h1.5V47h-1.5v1.6h-6.2V47H76v-9.3h1.5V36h6.3zM17 36v3.2h1.6v3.1h1.5v-6.2h1.6v12.4h-3.2v-3h-1.5v-3.2h-1.6v6.3H14V36h3.1zm34.1 0v3.2h1.6v3.1h1.5v-3.1h1.5v-3.1H59v12.4h-3.2v-6.2h-1.5v3.1h-3.1v-3h-1.5v6.1H48V36.1h3.1zm14 0v3.2h1.5v3.1h1.5v-3.1h1.6v-3.1H73v12.4h-3v-6.2h-1.6v3.1h-3.1v-3h-1.6v6.1h-1.5V36.1h3zm26.4 0v3.2H93v3.1h1.6v-6.2h1.5v12.4h-3.1v-3h-1.6v-3.2H90v6.3h-1.5V36h3zm-49.7 1.7h-3V47h3v-9.3zm40.3 0h-3V47h3v-9.3z"
            />
            <path
              fill="#FFE14B"
              d="M55.6 0v29.3h-7.4V7.5h-3.6V3.7h3.6V.1h7.4zm24.7 0v3.8H73v3.7h-3.6V11h11v3.7H84v11h-3.7v3.6H65.7v-3.7h-3.6V7.4h3.6V3.8h3.6V0h11zm-73 0v7.3H11v7.3h3.6V0h3.7v29.2h-7.4V22H7.3v-7.3H3.7v14.6H0V0h7.3zm69.3 14.7h-7.2v10.9h7.2V14.7zm-39.8 3.6v3.8H22v-3.8h14.8zM35 0v1.9h1.9v10.8H35v1.9H23.9v-1.9H22V2h1.8V0H35zm-1.9 3.7h-7.4V11H33V3.7z"
            />
          </g>
        </symbol>
        <symbol id="qr-1" viewBox="0 0 60 60">
          <path
            fill="#FFE14B"
            fillRule="nonzero"
            d="M32.4 57.6h.1a1.2 1.2 0 01-.1 2.4h-.1a1.2 1.2 0 01.1-2.4zm4.8 0h.1a1.2 1.2 0 01-.1 2.4h-.1a1.2 1.2 0 01.1-2.4zm19.2-2.4c.7 0 1.2.5 1.2 1.2a1.2 1.2 0 001.2 1.2h.1a1.2 1.2 0 01-.1 2.4H54a1.2 1.2 0 110-2.4h.1c.6 0 1.1-.6 1.1-1.2v-.1c0-.6.6-1.1 1.2-1.1zm-40.1-12c.3 0 .5.2.5.5v15.8c0 .3-.2.5-.5.5H.5a.5.5 0 01-.5-.5V43.7c0-.3.2-.5.5-.5zm8.9-4.8c.7 0 1.2.5 1.2 1.2V42c0 .7.5 1.2 1.2 1.2h1.2v2.4-2.4h3.6a1.2 1.2 0 010 2.4H30c-.6 0-1.1.5-1.2 1v.2c0 .7.5 1.2 1.2 1.2a1.2 1.2 0 011.2 1.2v2.4c0 .7.5 1.2 1.2 1.2h.1a1.2 1.2 0 01-.1 2.4c-.7 0-1.2.5-1.2 1.2v.1a1.2 1.2 0 01-2.4-.1v-4.8c0-.7-.5-1.2-1.2-1.2s-1.2.5-1.2 1.2v7.2c0 .7-.5 1.2-1.2 1.2h-3.6v-2.4V60h-1.2c-.7 0-1.2-.5-1.2-1.2v-9.7a1.2 1.2 0 012.4.1v7.2c0 .7.5 1.2 1.2 1.2h.1c.6 0 1.1-.6 1.1-1.2v1.2-8.4a1.2 1.2 0 011.2-1.2c.7 0 1.2-.5 1.2-1.2V48v-2.4 1.2c0-.7-.5-1.2-1.2-1.2s-1.2-.5-1.2-1.2v-1.2 1.2c0-.7-.5-1.2-1.2-1.2s-1.2.5-1.2 1.2v.1a1.2 1.2 0 01-2.4-.1V39.5a1.2 1.2 0 012.4.1 1.2 1.2 0 002.4 0v1.2-1.3c0-.6.6-1.1 1.2-1.1zM14.1 45.6H2.7c-.2 0-.3.1-.3.3v11.4c0 .2.1.3.3.3H14c.2 0 .3-.1.3-.3V46c0-.2-.1-.3-.3-.3zM11.5 48c.3 0 .5.2.5.5v6.2c0 .3-.2.5-.5.5H5.3a.5.5 0 01-.5-.5v-6.2c0-.3.2-.5.5-.5zM1.2 24c.7 0 1.2.5 1.2 1.2v2.5a1.2 1.2 0 01-2.4-.1v-2.5c0-.6.6-1.1 1.2-1.1zm16.1-5.8v2.4-2.4h2.4v2.4-2.4h3.6c.6 0 1.1.5 1.2 1v.2c0 .7.5 1.2 1.2 1.2h.1a1.2 1.2 0 01-.1 2.4c-.6 0-1.1.5-1.2 1v.2c0 .7.5 1.2 1.2 1.2h.1a1.2 1.2 0 01-.1 2.4h-2.4a1.2 1.2 0 01-1.2-1.2v-4.8c0-.7-.5-1.2-1.2-1.2a1.2 1.2 0 00-1.2 1.2v.1a1.2 1.2 0 01-2.4-.1v-.1c0-.6-.6-1.1-1.2-1.1H1.2a1.2 1.2 0 110-2.4h3.6zM1.2 31.2c.7 0 1.2.5 1.2 1.2v7.3a1.2 1.2 0 01-2.4-.1v-7.3c0-.6.6-1.1 1.2-1.1zM16.2 19.2c.3 0 .5.2.5.5v15.8c0 .3-.2.5-.5.5H.5a.5.5 0 01-.5-.5V19.7c0-.3.2-.5.5-.5zm43.3 0c.3 0 .5.2.5.5v15.8c0 .3-.2.5-.5.5H43.7a.5.5 0 01-.5-.5V19.7c0-.3.2-.5.5-.5zM14 21.6H2.7c-.2 0-.3.1-.3.3V33c0 .2.1.3.3.3H14c.2 0 .3-.1.3-.3V21.9c0-.2-.1-.3-.3-.3zm43.2 0H46c-.2 0-.3.1-.3.3V33c0 .2.1.3.3.3h11.4c.2 0 .3-.1.3-.3V21.9c0-.2-.1-.3-.3-.3zM11.5 24c.3 0 .5.2.5.5v6.2c0 .3-.2.5-.5.5H5.3a.5.5 0 01-.5-.5v-6.2c0-.3.2-.5.5-.5zm43.2 0c.3 0 .5.2.5.5v6.2c0 .3-.2.5-.5.5h-6.2a.5.5 0 01-.5-.5v-6.2c0-.3.2-.5.5-.5zM16.2 0c.3 0 .5.2.5.5v15.8c0 .3-.2.5-.5.5H.5a.5.5 0 01-.5-.5V.5C0 .2.2 0 .5 0zm43.3 0c.3 0 .5.2.5.5v15.8c0 .3-.2.5-.5.5H43.7a.5.5 0 01-.5-.5V.5c0-.3.2-.5.5-.5zM14 2.4H2.7c-.2 0-.3.1-.3.3V14c0 .2.1.3.3.3H14c.2 0 .3-.1.3-.3V2.7c0-.2-.1-.3-.3-.3zm43.2 0H46c-.2 0-.3.1-.3.3V14c0 .2.1.3.3.3h11.4c.2 0 .3-.1.3-.3V2.7c0-.2-.1-.3-.3-.3zM11.5 4.8c.3 0 .5.2.5.5v6.2c0 .3-.2.5-.5.5H5.3a.5.5 0 01-.5-.5V5.3c0-.3.2-.5.5-.5zm43.2 0c.3 0 .5.2.5.5v6.2c0 .3-.2.5-.5.5h-6.2a.5.5 0 01-.5-.5V5.3c0-.3.2-.5.5-.5z"
          />
        </symbol>
      </svg>

      {/* Grid thumbnails */}
      <div className="flex justify-center">
        {ghouls.map((g, i) => (
          <div
            key={g.id}
            onClick={() => openModal(i)}
            className="relative w-[100px] h-[100px] m-5 cursor-pointer"
            style={{ background: g.cardbg }}
          >
            <svg className="absolute top-0 left-0 w-full h-full">
              <use href={`#${g.id}`} />
            </svg>
          </div>
        ))}
      </div>

      {/* Modal */}
      <div
        id="gg-modal"
        className="fixed top-0 left-0 w-full h-screen grid place-content-center invisible z-[5]"
      >
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 w-[50px] h-[50px] border border-[#222] text-[#222] rounded-full grid place-content-center z-[999] cursor-pointer bg-transparent text-xl"
        >
          ×
        </button>

        {/* Prev */}
        <button
          onClick={prevAnimation}
          className="absolute left-5 top-1/2 -translate-y-1/2 w-[50px] h-[50px] border border-[#222] text-[#222] text-xs rounded-full grid place-content-center z-[999] cursor-pointer bg-transparent"
        >
          Prev
        </button>

        {/* Next */}
        <button
          onClick={nextAnimation}
          className="absolute right-5 top-1/2 -translate-y-1/2 w-[50px] h-[50px] border border-[#222] text-[#222] text-xs rounded-full grid place-content-center z-[999] cursor-pointer bg-transparent"
        >
          Next
        </button>

        {/* Card wrapper */}
        <div className="relative w-[450px] h-[650px] [transform-style:preserve-3d] [perspective:3000px]">
          <GhoulCard data={cardSlots[0]} cardRef={card0Ref} uid={uid} />
          <GhoulCard data={cardSlots[1]} cardRef={card1Ref} uid={uid} />
        </div>
      </div>
    </>
  );
}
