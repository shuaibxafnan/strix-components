"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── SectionShowcase ─────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// sections          array    SECTIONS   Section data: { title, description, image, moreText, moreLink, moreBg, facts[], gallery[] }
// menuItems         array    MENU       Labels for the overlay menu
// brand             string   Outdoors   Wordmark in the top-left
// startIndex        number   0          Section shown on mount
// bgColor           string   #fff       Page background
// textColor         string   #000       Primary text color
// panelBg           string   #000       Facts panel / expander background
// panelTextColor    string   #fff       Text color inside the facts panel
// menuBg            string   rgba(0,0,0,0.9)  Menu overlay backdrop
// menuItemColor     string   #fff       Menu link color
// menuItemHover     string   #e0f3ca    Menu link hover color
// navBorderColor    string   #ddd       Resting border of the prev / next circles
// navHoverColor     string   #000       Hover border of the prev / next circles
// titleSize         string   10vw       Section title size on desktop
// titleTracking     string   -0.35vw    Section title letter spacing
// fontFamily        string   sans stack Font family for the whole component
// letterStagger     number   30         Delay between each title letter (ms)
// entryDuration     number   900        Base duration of a section transition (ms)
// titleDelay        number   200        Delay before the title starts moving (ms)
// expanderScaleX    number   0.54       Horizontal scale of the collapsed facts panel
// factsVisibleCount number   2          Facts shown before the panel is expanded
// showMenu          bool     true       Render the overlay menu and its toggle
// showFactsToggle   bool     true       Render the "see more facts" control
// showIndex         bool     true       Render the 01 / 04 index
// showNav           bool     true       Render the prev / next circles
// keyboard          bool     true       Arrow keys navigate the sections
// desktopQuery      string   (min-width: 55em) and (min-height: 40em)  Media query for the split layout
// className         string   ""         Extra classes on the outer wrapper
// ──────────────────────────────────────────────────────────────────────────

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

const MENU = ["Our Story", "Adventures", "Testimonials", "Contact"];

const SECTIONS = [
  {
    title: "Hiking",
    description:
      "Hiking is the preferred term for a long, vigorous walk, usually on trails in the countryside, while the word walking is used for shorter, particularly urban walks.",
    image: IMAGES[0],
    moreText: "Want to know more?",
    moreLink: "Explore all hikes",
    moreBg: "#fee9b1",
    facts: [
      { title: "Longest trail", detail: "Continental divide, 3100 miles" },
      { title: "Best season", detail: "Late spring into early autumn" },
      { title: "Elevation gain", detail: "Roughly 500m on a day hike" },
    ],
    gallery: IMAGES.slice(4, 10),
  },
  {
    title: "Lakes",
    description:
      "A lake is an area filled with water, localized in a basin, surrounded by land apart from any river or other outlet that serves to feed or drain it. Lakes lie on land and are not part of the ocean.",
    image: IMAGES[1],
    moreText: "Want to know more?",
    moreLink: "Explore the lakes",
    moreBg: "#e0f3ca",
    facts: [
      { title: "Biggest lake", detail: "Caspian sea, by a wide margin" },
      { title: "Coolest activity", detail: "Kayaking the whole shoreline" },
      { title: "Lake depth", detail: "At 55m it is the deepest here" },
    ],
    gallery: IMAGES.slice(10, 16),
  },
  {
    title: "Paths",
    description:
      "A footpath is a type of thoroughfare intended for use only by pedestrians and not other forms of traffic such as motorized vehicles, cycles, and horses.",
    image: IMAGES[2],
    moreText: "Want to know more?",
    moreLink: "Explore the paths",
    moreBg: "#f3cae8",
    facts: [
      { title: "Lovely paths", detail: "Coastal routes along the cliffs" },
      { title: "Haunted ways", detail: "Old drovers roads inland" },
      { title: "Running and more", detail: "Soft ground almost year round" },
    ],
    gallery: IMAGES.slice(16, 22),
  },
  {
    title: "Rivers",
    description:
      "A river is a natural flowing watercourse, usually freshwater, flowing towards an ocean, sea, lake or another river. In some cases a river flows into the ground and becomes dry at the end of its course.",
    image: IMAGES[3],
    moreText: "Want to know more?",
    moreLink: "Explore all rivers",
    moreBg: "#cacaf3",
    facts: [
      { title: "River romantics", detail: "Slow water and long evenings" },
      { title: "History calls", detail: "Mills every few miles upstream" },
      { title: "Walking around", detail: "Loop trails on both banks" },
    ],
    gallery: IMAGES.slice(6, 12),
  },
];

const EASE = "cubic-bezier(0.8, 0, 0.2, 1)";
const EASE_EXPO = "cubic-bezier(0.19, 1, 0.22, 1)";
const EASE_SOFT = "cubic-bezier(0.2, 1, 0.3, 1)";

function set(el, styles, transition) {
  if (!el) return;
  el.style.transition = transition || "none";
  Object.keys(styles).forEach((key) => {
    el.style[key] = styles[key];
  });
}

function trans(props, duration, delay, easing) {
  return props
    .map(
      (prop) =>
        prop +
        " " +
        duration +
        "ms " +
        (easing || EASE) +
        " " +
        (delay || 0) +
        "ms",
    )
    .join(", ");
}

function nextFrame(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

export default function SectionShowcase({
  sections = SECTIONS,
  menuItems = MENU,
  brand = "Outdoors",
  startIndex = 0,
  bgColor = "#ffffff",
  textColor = "#000000",
  panelBg = "#000000",
  panelTextColor = "#ffffff",
  menuBg = "rgba(0,0,0,0.9)",
  menuItemColor = "#ffffff",
  menuItemHover = "#e0f3ca",
  navBorderColor = "#dddddd",
  navHoverColor = "#000000",
  titleSize = "10vw",
  titleTracking = "-0.35vw",
  fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif",
  letterStagger = 30,
  entryDuration = 900,
  titleDelay = 200,
  expanderScaleX = 0.54,
  factsVisibleCount = 2,
  showMenu = true,
  showFactsToggle = true,
  showIndex = true,
  showNav = true,
  keyboard = true,
  desktopQuery = "(min-width: 55em) and (min-height: 40em)",
  className = "",
}) {
  const [desktop, setDesktop] = useState(false);
  const [current, setCurrent] = useState(startIndex);
  const [menuOpen, setMenuOpen] = useState(false);
  const [factsOpen, setFactsOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  const currentRef = useRef(startIndex);
  const busyRef = useRef(false);
  const factsTyRef = useRef(0);
  const timersRef = useRef([]);

  const sectionRefs = useRef([]);
  const letterRefs = useRef([]);
  const descRefs = useRef([]);
  const imageRefs = useRef([]);
  const moreRefs = useRef([]);
  const expanderRefs = useRef([]);
  const factRefs = useRef([]);
  const galleryRefs = useRef([]);
  const factsWrapRefs = useRef([]);
  const indexRef = useRef(null);

  const bind = (store, index) => (el) => {
    store.current[index] = el;
  };

  const bindNested = (store, outer, inner) => (el) => {
    if (!store.current[outer]) store.current[outer] = [];
    store.current[outer][inner] = el;
  };

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(desktopQuery);
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [desktopQuery]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const measure = useCallback(() => {
    if (!desktop) {
      factsTyRef.current = 0;
      return;
    }
    const item = (factRefs.current[currentRef.current] || [])[0];
    const wrap = factsWrapRefs.current[currentRef.current];
    if (!item || !wrap) return;
    const style = window.getComputedStyle(item);
    const itemHeight =
      item.getBoundingClientRect().height + parseFloat(style.marginBottom || 0);
    const wrapStyle = window.getComputedStyle(wrap);
    const padding =
      parseFloat(wrapStyle.paddingTop || 0) +
      parseFloat(wrapStyle.paddingBottom || 0);
    factsTyRef.current = Math.max(
      0,
      window.innerHeight - factsVisibleCount * itemHeight - padding,
    );
  }, [desktop, factsVisibleCount]);

  const restLayout = useCallback(() => {
    sections.forEach((section, index) => {
      const active = index === currentRef.current;
      const ty = factsTyRef.current;

      (letterRefs.current[index] || []).forEach((el) => {
        set(el, { transform: "none", opacity: active || !desktop ? "1" : "0" });
      });
      set(descRefs.current[index], {
        transform: "none",
        opacity: active || !desktop ? "1" : "0",
      });
      set(imageRefs.current[index], {
        transform: "none",
        opacity: active || !desktop ? "1" : "0",
      });
      set(moreRefs.current[index], {
        transform: "none",
        opacity: active || !desktop ? "1" : "0",
      });

      set(expanderRefs.current[index], {
        transform:
          "scale3d(" +
          expanderScaleX +
          ",1,1) translate3d(0px," +
          ty +
          "px,0px)",
      });

      (factRefs.current[index] || []).forEach((el, factIndex) => {
        set(el, {
          transform: "translate3d(0px," + ty + "px,0px)",
          opacity: !desktop
            ? "1"
            : factIndex >= factsVisibleCount
              ? "0"
              : active
                ? "1"
                : "0",
        });
      });

      (galleryRefs.current[index] || []).forEach((el) => {
        set(el, { transform: "none", opacity: desktop ? "0" : "1" });
      });
    });
  }, [desktop, expanderScaleX, factsVisibleCount, sections]);

  useEffect(() => {
    measure();
    restLayout();
  }, [measure, restLayout]);

  useEffect(() => {
    const onResize = () => {
      measure();
      restLayout();
      setFactsOpen(false);
      setPreview(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure, restLayout]);

  const toggleEntry = useCallback(
    (index, hide, dir) => {
      const letters = letterRefs.current[index] || [];
      const away = dir === "next" ? "-100%" : "100%";
      const from = dir === "next" ? "100%" : "-100%";

      letters.forEach((el, i) => {
        const delay = i * letterStagger + titleDelay;
        if (hide) {
          set(
            el,
            { transform: "translateY(" + away + ")", opacity: "1" },
            trans(["transform"], entryDuration * 0.78, delay),
          );
          later(
            () => set(el, { opacity: "0" }, "none"),
            entryDuration * 0.78 + delay,
          );
        } else {
          set(
            el,
            { transform: "translateY(" + from + ")", opacity: "0" },
            "none",
          );
        }
      });

      const desc = descRefs.current[index];
      const image = imageRefs.current[index];
      const more = moreRefs.current[index];

      if (hide) {
        set(
          desc,
          {
            transform: "translateY(" + (dir === "next" ? "-10%" : "10%") + ")",
            opacity: "0",
          },
          trans(["transform", "opacity"], entryDuration, 0, EASE_EXPO),
        );
        set(image, { transformOrigin: "50% 50%" }, "none");
        set(
          image,
          { transform: "translateY(" + away + ")", opacity: "1" },
          trans(["transform"], entryDuration),
        );
        later(() => set(image, { opacity: "0" }, "none"), entryDuration);
        set(
          more,
          { transform: "translateY(" + away + ")", opacity: "1" },
          trans(["transform"], entryDuration),
        );
        later(() => set(more, { opacity: "0" }, "none"), entryDuration);
      } else {
        set(
          desc,
          {
            transform: "translateY(" + (dir === "next" ? "20%" : "-20%") + ")",
            opacity: "0",
          },
          "none",
        );
        set(
          image,
          {
            transformOrigin: "50% " + (dir === "next" ? "0" : "100") + "%",
            transform: "translateY(" + from + ") scale(1.8)",
            opacity: "1",
          },
          "none",
        );
        set(
          more,
          { transform: "translateY(" + from + ")", opacity: "1" },
          "none",
        );
      }

      const facts = (factRefs.current[index] || []).slice(0, factsVisibleCount);
      const ty = factsTyRef.current;
      facts.forEach((el, i) => {
        if (hide) {
          set(
            el,
            {
              transform:
                "translate3d(0px," +
                (ty + (dir === "next" ? -20 : 20)) +
                "px,0px)",
              opacity: "0",
            },
            trans(["transform", "opacity"], 300, i * 40),
          );
        } else {
          set(
            el,
            {
              transform:
                "translate3d(0px," +
                (ty + (dir === "next" ? 20 : -20)) +
                "px,0px)",
              opacity: "0",
            },
            "none",
          );
        }
      });

      if (hide) return;

      nextFrame(() => {
        letters.forEach((el, i) => {
          set(
            el,
            { transform: "translateY(0%)", opacity: "1" },
            trans(
              ["transform", "opacity"],
              entryDuration * 0.78,
              i * letterStagger + titleDelay,
            ),
          );
        });
        set(
          desc,
          { transform: "translateY(0%)", opacity: "1" },
          trans(
            ["transform", "opacity"],
            entryDuration,
            entryDuration * 0.5 + 400,
            EASE_EXPO,
          ),
        );
        set(
          image,
          { transform: "translateY(0%) scale(1)", opacity: "1" },
          trans(["transform"], entryDuration),
        );
        set(
          more,
          { transform: "translateY(0%)", opacity: "1" },
          trans(["transform"], entryDuration),
        );
        facts.forEach((el, i) => {
          set(
            el,
            { transform: "translate3d(0px," + ty + "px,0px)", opacity: "1" },
            trans(["transform", "opacity"], 300, i * 40 + 150),
          );
        });
      });
    },
    [entryDuration, factsVisibleCount, later, letterStagger, titleDelay],
  );

  const flipIndex = useCallback(
    (value, dir) => {
      const el = indexRef.current;
      if (!el) return;
      set(
        el,
        {
          transform: "translateY(" + (dir === "next" ? "-100%" : "100%") + ")",
          opacity: "0",
        },
        trans(
          ["transform", "opacity"],
          300,
          400,
          "cubic-bezier(0.45,0,0.55,1)",
        ),
      );
      later(() => {
        el.textContent = String(value + 1).padStart(2, "0");
        set(
          el,
          {
            transform:
              "translateY(" + (dir === "next" ? "100%" : "-100%") + ")",
            opacity: "0",
          },
          "none",
        );
        nextFrame(() => {
          set(
            el,
            { transform: "translateY(0%)", opacity: "1" },
            trans(
              ["transform", "opacity"],
              300,
              0,
              "cubic-bezier(0.45,0,0.55,1)",
            ),
          );
        });
      }, 720);
    },
    [later],
  );

  const navigate = useCallback(
    (dir) => {
      if (busyRef.current || sections.length < 2) return;
      busyRef.current = true;

      const from = currentRef.current;
      let to = dir === "next" ? from + 1 : from - 1;
      if (to >= sections.length) to = 0;
      if (to < 0) to = sections.length - 1;

      currentRef.current = to;
      setFactsOpen(false);
      setPreview(false);

      toggleEntry(from, true, dir);
      toggleEntry(to, false, dir);
      flipIndex(to, dir);
      setCurrent(to);

      later(() => {
        busyRef.current = false;
      }, entryDuration + 600);
    },
    [entryDuration, flipIndex, later, sections.length, toggleEntry],
  );

  useEffect(() => {
    if (!keyboard) return undefined;
    const onKey = (event) => {
      if (event.key === "ArrowUp" || event.key === "ArrowLeft")
        navigate("prev");
      if (event.key === "ArrowDown" || event.key === "ArrowRight")
        navigate("next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard, navigate]);

  const runFacts = useCallback(
    (open) => {
      const index = currentRef.current;
      const ty = factsTyRef.current;
      const expander = expanderRefs.current[index];
      const facts = factRefs.current[index] || [];

      set(
        expander,
        {
          transform:
            "scale3d(" +
            expanderScaleX +
            ",1,1) translate3d(0px," +
            (open ? 0 : ty) +
            "px,0px)",
        },
        trans(["transform"], 800, open ? 0 : 300),
      );

      facts.forEach((el, i) => {
        const delay = open ? (i + 1) * 30 + 150 : (facts.length - i - 1) * 30;
        set(
          el,
          {
            transform: "translate3d(0px," + (open ? 0 : ty) + "px,0px)",
            opacity: open ? "1" : i >= factsVisibleCount ? "0" : "1",
          },
          trans(["transform", "opacity"], 800, delay),
        );
      });
    },
    [expanderScaleX, factsVisibleCount],
  );

  const toggleFacts = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const open = !factsOpen;
    setFactsOpen(open);
    runFacts(open);
    later(() => {
      busyRef.current = false;
    }, 1100);
  }, [factsOpen, later, runFacts]);

  const openPreview = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPreview(true);
    setFactsOpen(false);

    const index = currentRef.current;
    set(
      expanderRefs.current[index],
      { transform: "scale3d(1.05,1,1) translate3d(0px,0px,0px)" },
      trans(["transform"], 800),
    );
    (factRefs.current[index] || []).forEach((el, i) => {
      set(
        el,
        { transform: "translate3d(0px,0px,0px)", opacity: "0" },
        trans(["transform", "opacity"], 800, i * 30),
      );
    });
    (galleryRefs.current[index] || []).forEach((el, i) => {
      set(el, { transform: "scale(0.7)", opacity: "0" }, "none");
      nextFrame(() => {
        set(
          el,
          { transform: "scale(1)", opacity: "1" },
          trans(["transform", "opacity"], 800, i * 100 + 700, EASE_SOFT),
        );
      });
    });

    later(() => {
      busyRef.current = false;
    }, 1600);
  }, [later]);

  const closePreview = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPreview(false);

    const index = currentRef.current;
    const ty = factsTyRef.current;

    (galleryRefs.current[index] || []).forEach((el, i) => {
      set(el, { opacity: "0" }, trans(["opacity"], 500, i * 40, EASE_SOFT));
    });
    set(
      expanderRefs.current[index],
      {
        transform:
          "scale3d(" +
          expanderScaleX +
          ",1,1) translate3d(0px," +
          ty +
          "px,0px)",
      },
      trans(["transform"], 800, 200),
    );
    (factRefs.current[index] || []).forEach((el, i) => {
      set(
        el,
        {
          transform: "translate3d(0px," + ty + "px,0px)",
          opacity: i >= factsVisibleCount ? "0" : "1",
        },
        trans(["transform", "opacity"], 800, i * 30 + 200),
      );
    });

    later(() => {
      busyRef.current = false;
    }, 1200);
  }, [expanderScaleX, factsVisibleCount, later]);

  const shellStyle = desktop
    ? {
        height: "100vh",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "45% 55%",
        gridTemplateRows:
          "6rem calc(30% - 2rem) calc(44% - 2rem) calc(26% - 2rem)",
        gridTemplateAreas:
          '"header expander" "sections-index expander" "gap expander" "sections-nav expander"',
      }
    : {};

  const sectionStyle = desktop
    ? {
        gridArea: "1 / 1 / 5 / 4",
        display: "grid",
        gridTemplateColumns: "47% 25% 28%",
        gridTemplateRows: "39% 39% 22%",
        gridTemplateAreas:
          '"a slide-image slide-image" "slide-content slide-image slide-image" "b c more"',
      }
    : {};

  return (
    <div
      className={"relative w-full " + className}
      style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
    >
      <div className="relative w-full" style={shellStyle}>
        <header
          className="flex px-8 pt-8"
          style={desktop ? { gridArea: "header" } : {}}
        >
          <h1 className="m-0 text-[1.35rem] lowercase">{brand}</h1>
        </header>

        {showIndex ? (
          <div
            className="z-10 flex items-end px-8 pb-12 pt-6 text-[0.75rem] font-bold"
            style={
              desktop ? { gridArea: "sections-index", paddingLeft: "20%" } : {}
            }
          >
            <span className="relative block overflow-hidden">
              <span ref={indexRef} className="block w-[1.15rem]">
                {String(current + 1).padStart(2, "0")}
              </span>
            </span>
            <span className="relative ml-32">
              <span
                className="absolute right-[calc(100%+1rem)] top-1/2 h-[3px] w-24 -translate-y-1/2"
                style={{ backgroundColor: textColor }}
              />
              {String(sections.length).padStart(2, "0")}
            </span>
          </div>
        ) : null}

        {showNav ? (
          <nav
            className="z-20 flex gap-3 px-8 pb-8"
            style={
              desktop
                ? {
                    gridArea: "sections-nav",
                    padding: "2rem 4rem 0",
                    background:
                      "linear-gradient(0deg, " +
                      bgColor +
                      " 90%, rgba(255,255,255,0))",
                  }
                : {}
            }
          >
            {["prev", "next"].map((dir) => (
              <button
                key={dir}
                type="button"
                aria-label={
                  dir === "prev" ? "Previous section" : "Next section"
                }
                onClick={() => navigate(dir)}
                className="h-12 w-12 cursor-pointer rounded-full border-2 bg-transparent transition-colors duration-200 hover:border-[var(--nav-hover)]"
                style={{
                  borderColor: navBorderColor,
                  backgroundColor: bgColor,
                  color: textColor,
                  opacity: preview ? 0 : 1,
                  pointerEvents: preview ? "none" : "auto",
                  transition:
                    "opacity 800ms " + EASE + ", border-color 200ms linear",
                  "--nav-hover": navHoverColor,
                }}
              >
                <svg
                  viewBox="0 0 50 50"
                  className="h-full w-full"
                  fill="currentColor"
                >
                  {dir === "prev" ? (
                    <path d="M20.259 28.211l5.07-5.03 5.075 5.034a.36.36 0 0 0 .51 0 .356.356 0 0 0 0-.506l-5.323-5.28a.404.404 0 0 0-.135-.084.364.364 0 0 0-.384.08l-5.324 5.28a.356.356 0 0 0 0 .506c.141.14.37.14.51 0z" />
                  ) : (
                    <path d="M20.259 22.43l5.07 5.03 5.075-5.034a.36.36 0 0 1 .51 0c.14.14.14.366 0 .506l-5.323 5.28a.404.404 0 0 1-.135.084.364.364 0 0 1-.384-.081l-5.324-5.28a.356.356 0 0 1 0-.505c.141-.14.37-.14.51 0z" />
                  )}
                </svg>
              </button>
            ))}
          </nav>
        ) : null}

        {desktop && showFactsToggle ? (
          <div
            className="relative z-[200] flex flex-col justify-end"
            style={{ gridArea: "expander", pointerEvents: "none" }}
          >
            <button
              type="button"
              onClick={toggleFacts}
              className="relative grid h-20 w-[48%] cursor-pointer border-0 bg-transparent text-left font-bold transition-opacity hover:opacity-60"
              style={{
                padding: "0 0 0 5vw",
                margin: "0 0 0 2vw",
                color: panelTextColor,
                pointerEvents: preview ? "none" : "auto",
                opacity: preview ? 0 : 1,
              }}
            >
              <span
                className="col-start-1 row-start-1 flex items-center text-[0.6rem] uppercase tracking-[0.25rem]"
                style={{
                  opacity: factsOpen ? 0 : 1,
                  transition: "opacity 300ms linear",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M11.5 9c-.69 0-1.28.244-1.768.732A2.41 2.41 0 0 0 9 11.5c0 .69.244 1.28.732 1.767A2.409 2.409 0 0 0 11.5 14c.69 0 1.28-.244 1.768-.733A2.408 2.408 0 0 0 14 11.5c0-.69-.244-1.28-.732-1.768A2.408 2.408 0 0 0 11.5 9z" />
                </svg>
                <span className="ml-1 leading-[1.75]">See more facts</span>
              </span>
              <span
                className="col-start-1 row-start-1 flex items-center text-[0.6rem] uppercase tracking-[0.25rem]"
                style={{
                  opacity: factsOpen ? 1 : 0,
                  transition: "opacity 300ms linear",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M11.449 11.962l-5.1 5.099a.363.363 0 1 0 .513.512L12 12.436l5.137 5.137a.361.361 0 0 0 .513 0 .363.363 0 0 0 0-.512l-5.099-5.1 5.102-5.102a.363.363 0 1 0-.512-.513L12 11.487l-5.141-5.14a.363.363 0 0 0-.513.512l5.103 5.103z" />
                </svg>
                <span className="ml-1 leading-[1.75]">See less facts</span>
              </span>
            </button>

            <button
              type="button"
              onClick={closePreview}
              aria-label="Close gallery"
              className="absolute right-0 top-0 m-8 cursor-pointer border-0 bg-transparent"
              style={{
                color: panelTextColor,
                opacity: preview ? 1 : 0,
                pointerEvents: preview ? "auto" : "none",
                transition: "opacity 300ms " + EASE_EXPO,
              }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="M21 4.565L19.435 3 12 10.435 4.565 3 3 4.565 10.435 12 3 19.435 4.565 21 12 13.565 19.435 21 21 19.435 13.565 12z" />
              </svg>
            </button>
          </div>
        ) : null}

        {sections.map((section, index) => (
          <section
            key={section.title}
            ref={bind(sectionRefs, index)}
            className="relative w-full"
            style={{
              ...sectionStyle,
              pointerEvents: !desktop || index === current ? "auto" : "none",
            }}
          >
            <div
              className="p-8"
              style={
                desktop ? { gridArea: "slide-content", padding: "0 4rem" } : {}
              }
            >
              <h2
                className="relative m-0 overflow-hidden lowercase"
                style={{
                  fontSize: desktop ? titleSize : "3rem",
                  letterSpacing: desktop ? titleTracking : "-0.03em",
                }}
              >
                {section.title.split("").map((char, charIndex) => (
                  <span
                    key={charIndex}
                    ref={bindNested(letterRefs, index, charIndex)}
                    className="inline-block"
                  >
                    {char === " " ? "\u00a0" : char}
                  </span>
                ))}
              </h2>
              <p
                ref={bind(descRefs, index)}
                className="relative overflow-hidden pr-8 font-light leading-[1.75]"
              >
                {section.description}
              </p>
            </div>

            <div
              className="pointer-events-none overflow-hidden"
              style={
                desktop
                  ? { gridArea: "slide-image", height: "auto", zIndex: 99 }
                  : { height: "45vh" }
              }
            >
              <div
                ref={bind(imageRefs, index)}
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: "url(" + section.image + ")" }}
              />
            </div>

            <div
              className="flex items-stretch overflow-hidden"
              style={desktop ? { gridArea: "more" } : {}}
            >
              <div
                ref={bind(moreRefs, index)}
                className="flex w-full flex-col items-center justify-center p-8"
                style={{ backgroundColor: section.moreBg }}
              >
                <span className="mb-4 block font-bold">{section.moreText}</span>
                <span className="flex cursor-pointer items-center font-light">
                  <span className="mr-2 leading-none">{section.moreLink}</span>
                  <svg
                    viewBox="0 0 32 11"
                    className="h-5 w-8"
                    fill="currentColor"
                  >
                    <path d="M27.166.183a.619.619 0 0 0-.878 0 .619.619 0 0 0 0 .878l2.735 2.735H.768a.624.624 0 0 0 0 1.248h28.254L26.287 7.77a.619.619 0 0 0 0 .878.617.617 0 0 0 .441.183c.163 0 .32-.061.442-.183l3.796-3.796a.623.623 0 0 0-.005-.878L27.166.183z" />
                  </svg>
                </span>
              </div>
            </div>

            {desktop ? (
              <div
                ref={bind(expanderRefs, index)}
                className="relative"
                style={{
                  gridArea: "1 / 2 / 4 / 4",
                  backgroundColor: panelBg,
                  transformOrigin: "0 0",
                  left: "-2vw",
                  zIndex: 100,
                }}
              />
            ) : null}

            <ul
              ref={bind(factsWrapRefs, index)}
              className="m-0 list-none"
              style={
                desktop
                  ? {
                      gridArea: "1 / 2 / 4 / 3",
                      padding: "10vh 5vw",
                      background: "transparent",
                      position: "relative",
                      zIndex: 200,
                      pointerEvents: "none",
                      color: panelTextColor,
                    }
                  : {
                      padding: "2rem",
                      backgroundColor: panelBg,
                      color: panelTextColor,
                    }
              }
            >
              {section.facts.map((fact, factIndex) => (
                <li
                  key={fact.title}
                  ref={bindNested(factRefs, index, factIndex)}
                  className="mb-10"
                >
                  <h3 className="m-0 mb-2 text-[1em]">{fact.title}</h3>
                  <span className="block truncate font-light">
                    {fact.detail}
                  </span>
                </li>
              ))}

              {section.gallery && section.gallery.length > 0 ? (
                <li
                  ref={bindNested(factRefs, index, section.facts.length)}
                  className="mb-10"
                  style={{
                    pointerEvents: desktop && !preview ? "auto" : "none",
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openPreview}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") openPreview();
                    }}
                    className="relative mb-8 mt-16 block max-w-[200px] cursor-pointer rounded"
                  >
                    <span
                      className="absolute inset-0 -z-10 block rotate-3"
                      style={{ backgroundColor: "#2f2f2f" }}
                    />
                    <span
                      className="absolute inset-0 -z-10 block -rotate-6"
                      style={{ backgroundColor: "#2f2f2f" }}
                    />
                    <img
                      src={section.gallery[0]}
                      alt=""
                      className="block w-full max-w-none rounded"
                    />
                    <svg
                      viewBox="0 0 24 24"
                      className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
                      fill={panelTextColor}
                    >
                      <path d="M8.982 8.982h5.988v5.988H8.982zM0 0h5.988v5.988H0zM8.982 17.965h5.988v5.988H8.982zM0 8.982h5.988v5.988H0zM0 17.965h5.988v5.988H0zM17.965 0h5.988v5.988h-5.988zM8.982 0h5.988v5.988H8.982zM17.965 8.982h5.988v5.988h-5.988zM17.965 17.965h5.988v5.988h-5.988z" />
                    </svg>
                  </div>
                  <h3 className="m-0 mb-2 text-[1em]">More impressions</h3>
                  <span className="block truncate font-light">
                    A collection of images
                  </span>
                </li>
              ) : null}
            </ul>

            {desktop && section.gallery ? (
              <div
                className="grid"
                style={{
                  gridArea: "1 / 2 / 4 / 4",
                  gridTemplateColumns: "repeat(2, calc(200px + 2rem))",
                  gridTemplateRows: "2rem 1fr 1fr 1fr",
                  gap: "1rem",
                  padding: "10vh 5vw",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 300,
                  position: "relative",
                  pointerEvents: preview && index === current ? "auto" : "none",
                }}
              >
                <h3
                  className="m-0 text-[1em]"
                  style={{
                    gridArea: "1 / 1 / 2 / 3",
                    color: panelTextColor,
                    opacity: preview && index === current ? 1 : 0,
                    transition: "opacity 500ms " + EASE_SOFT,
                  }}
                >
                  More impressions
                </h3>
                {section.gallery.map((src, galleryIndex) => (
                  <span
                    key={src + galleryIndex}
                    ref={bindNested(galleryRefs, index, galleryIndex)}
                    className="grid h-full w-full pl-4 opacity-0"
                  >
                    <img
                      src={src}
                      alt=""
                      className="my-auto block max-h-full max-w-full"
                    />
                  </span>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {showMenu ? (
        <nav
          className="absolute top-0 z-[3000] grid h-screen w-full items-start"
          style={{
            gridTemplateColumns: desktop ? "47% 53%" : "100%",
            pointerEvents: "none",
          }}
        >
          <span
            className="absolute right-0 h-full w-full"
            style={{
              background: menuBg,
              opacity: menuOpen ? 1 : 0,
              pointerEvents: menuOpen ? "auto" : "none",
              transition: "opacity 300ms",
            }}
          />

          <ul
            className="relative col-start-1 row-start-1 m-0 flex list-none flex-col justify-center text-right"
            style={{ padding: desktop ? "4rem 4rem 0 0" : "4rem 2rem 0 0" }}
          >
            {menuItems.map((item, i) => (
              <li
                key={item}
                className="mb-6 text-[2.25rem] font-bold"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateX(0%)" : "translateX(5%)",
                  pointerEvents: menuOpen ? "auto" : "none",
                  transition:
                    "opacity 300ms " +
                    EASE_SOFT +
                    " " +
                    (menuOpen ? i * 80 : 0) +
                    "ms, " +
                    "transform 300ms " +
                    EASE_SOFT +
                    " " +
                    (menuOpen ? i * 80 : 0) +
                    "ms",
                }}
              >
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors duration-200 hover:text-[var(--menu-hover)]"
                  style={{
                    color: menuItemColor,
                    "--menu-hover": menuItemHover,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="absolute top-0 grid cursor-pointer border-0 bg-transparent p-0"
            style={{
              right: desktop ? "53%" : 0,
              margin: desktop ? "2.3rem 4rem 0 0" : "2.3rem 2rem",
              pointerEvents: "auto",
              gridTemplate: "100% / 100%",
            }}
          >
            <span
              className="col-start-1 row-start-1 block"
              style={{
                color: textColor,
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "translateX(-50%)" : "translateX(0%)",
                transition:
                  "opacity 300ms " +
                  EASE_SOFT +
                  ", transform 300ms " +
                  EASE_SOFT,
              }}
            >
              <svg viewBox="0 0 24 13" className="h-5 w-6" fill="currentColor">
                <path d="M.75 1.515h22.498a.75.75 0 0 0 0-1.5H.75a.75.75 0 0 0 0 1.5zM23.248 5.265H8.168a.75.75 0 0 0 0 1.5h15.08a.75.75 0 0 0 0-1.5zM23.248 10.514H4.322a.75.75 0 0 0 0 1.5h18.926a.75.75 0 0 0 0-1.5z" />
              </svg>
            </span>
            <span
              className="col-start-1 row-start-1 block"
              style={{
                color: menuItemColor,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateX(0%)" : "translateX(50%)",
                transition:
                  "opacity 300ms " +
                  EASE_SOFT +
                  ", transform 300ms " +
                  EASE_SOFT,
              }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M21 4.565L19.435 3 12 10.435 4.565 3 3 4.565 10.435 12 3 19.435 4.565 21 12 13.565 19.435 21 21 19.435 13.565 12z" />
              </svg>
            </span>
          </button>
        </nav>
      ) : null}
    </div>
  );
}
