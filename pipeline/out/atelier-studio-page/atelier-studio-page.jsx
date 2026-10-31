"use client";

import { useEffect, useRef } from "react";

const loadFonts = () => {
    if (document.querySelector('link[data-id="atelier-fonts"]')) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href =
        "https://fonts.googleapis.com/css2?family=Anton&family=Kode+Mono:wght@400..700&display=swap";
    l.dataset.id = "atelier-fonts";
    document.head.appendChild(l);
};

const wrap = "px-[clamp(16px,calc(7.762px_+_2.197vw),64px)]";
const base = "text-[clamp(0.75rem,0.706rem_+_0.1878vw,0.875rem)] leading-[1.2]";
const sm = "text-[clamp(0.625rem,0.581rem_+_0.1878vw,0.75rem)] leading-[1.2]";
const anton = "font-['Anton',sans-serif] font-normal leading-none";
const big = "text-[clamp(4rem,1.8873rem_+_9.0141vw,10rem)]";
const btnText = "text-[clamp(0.875rem,0.831rem_+_0.1878vw,1rem)]";
const pixelGrid =
    "grid grid-cols-[repeat(25,1fr)] grid-rows-[repeat(6,1fr)] gap-0 overflow-hidden";

const projectSlots = [
    "col-[1/11] lg:col-[1/6] lg:row-[1/2]",
    "col-[6/13] row-[2/3] lg:mt-60 lg:col-[9/13] lg:row-[1/2]",
    "col-[1/10] row-[3/4] lg:col-[8/12] lg:row-[2/3]",
    "col-[6/13] row-[4/5] lg:col-[1/5] lg:row-[2/3] lg:self-end",
    "col-[2/12] row-[5/6] lg:mt-60 lg:col-[7/13] lg:row-[3/4]",
];

const memberSlots = [
    "col-[1/10] row-[1/2] lg:col-[1/4] lg:row-[1/2] lg:translate-x-10",
    "col-[4/13] row-[2/3] lg:col-[9/12] lg:row-[1/2] lg:translate-y-[400px]",
    "col-[1/10] row-[3/4] lg:col-[3/6] lg:row-[2/3]",
    "col-[4/13] row-[4/5] lg:col-[8/11] lg:row-[2/3] lg:translate-y-[400px]",
    "col-[1/10] row-[5/6] lg:col-[2/5] lg:row-[3/4]",
    "col-[4/13] row-[6/7] lg:col-[7/10] lg:row-[3/4] lg:translate-y-[400px]",
];

const ArrowIcon = ({ className }) => (
    <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className={className}
    >
        <path d="M2 10L10 2M4 2H10V8" />
    </svg>
);

const Chars = ({ text }) =>
    [...text].map((ch, i) => (
        <span key={i} data-char className="inline-block">
            {ch === " " ? "\u00A0" : ch}
        </span>
    ));

const CtaLink = ({ href, label, className = "" }) => (
    <a
        href={href}
        className={
            "group relative flex w-fit items-center gap-3 bg-[var(--tx)] py-3 pr-4 pl-6 tracking-[0.01em] text-[var(--bg)] lg:py-4 lg:pr-6 lg:pl-8 " +
            btnText +
            " " +
            anton +
            " " +
            className
        }
    >
        <span className="relative flex overflow-hidden">
            <span className="inline-block transition-transform duration-300 ease-out lg:group-hover:-translate-y-full">
                {label}
            </span>
            <span className="absolute top-0 left-0 inline-block translate-y-[105%] transition-transform duration-300 ease-out lg:group-hover:translate-y-0">
                {label}
            </span>
        </span>
        <span className="w-px shrink-0 self-stretch bg-[var(--bg)]" />
        <span className="relative flex overflow-hidden">
            <ArrowIcon className="inline-block w-[10px] transition-transform duration-300 ease-out lg:w-3 lg:group-hover:-translate-y-4 lg:group-hover:translate-x-4" />
            <ArrowIcon className="absolute top-0 left-0 w-[10px] -translate-x-4 translate-y-4 transition-transform duration-300 ease-out lg:w-3 lg:group-hover:translate-x-0 lg:group-hover:translate-y-0" />
        </span>
    </a>
);

const SlideLink = ({ href, label, target, className = "", after, dataAttr }) => (
    <a
        href={href}
        target={target}
        {...dataAttr}
        className={"group flex w-fit items-center gap-1 " + sm + " " + className}
    >
        <span className="relative flex overflow-hidden">
            <span className="inline-block transition-transform duration-[400ms] ease-out lg:group-hover:-translate-y-full">
                {label}
            </span>
            <span className="absolute top-0 left-0 hidden translate-y-full transition-transform duration-[400ms] ease-out lg:inline-block lg:group-hover:translate-y-0">
                {label}
            </span>
        </span>
        {after}
    </a>
);

const Intro = ({ tag, text, className = "" }) => (
    <div className={"flex flex-col gap-3 lg:gap-4 " + className}>
        <p className={base}>{tag}</p>
        <p className={base + " max-w-[400px]"}>{text}</p>
    </div>
);

export default function AtelierStudioPage({
    bgColor = "#ffffff",
    textColor = "#000000",
    darkColor = "#000000",
    accentColor = "#a3a3a3",
    cardBgColor = "#ffffff",
    cardTextColor = "#000000",
    className = "",
    brandTitleLines = ["ATELIER", "NORTH"],
    visionLabel = "[VISION]",
    visionText = "Creating thoughtful architecture and interior spaces for everyday living. We believe beautiful spaces should feel calm, welcoming, and naturally connected to the people who live in them.",
    ctaHref = "mailto:info@ateliernorth.com",
    ctaLabel = "info@ateliernorth.com",
    scrollLabels = [
        ["SCROLL", "[↓]"],
        ["INDEX", "[+]"],
        ["SCROLL", "[↓]"],
    ],
    indexItems = [
        { tag: "[ABOUT]", label: "WHO WE ARE" },
        { tag: "[PROJECTS]", label: "SELECTED WORKS" },
        { tag: "[MEMBERS]", label: "OUR TEAM" },
        { tag: "[CONTACT]", label: "GET IN TOUCH" },
    ],
    navLinks = [
        { label: "ABOUT", href: "#about" },
        { label: "PROJECTS", href: "#projects" },
        { label: "MEMBERS", href: "#members" },
    ],
    sectionIds = { about: "about", projects: "projects", members: "members" },
    menuOpenLabel = "MENU",
    menuCloseLabel = "CLOSE",
    menuTitle = "[MENU]",
    menuEmailLabel = "[EMAIL]",
    aboutTag = "[ABOUT]",
    aboutText = "We are a small architecture studio based in Tokyo. We work across architecture, interiors, and design consulting, creating thoughtful spaces for modern living.",
    aboutTitleWords = ["WHO", "WE", "ARE"],
    floatingItems = ["WHAT WE DO ???", "WHAT WE DO ???", "WHAT WE DO ???"],
    infoItems = [
        { words: ["We're", "based", "in"], value: "JAPAN" },
        { words: ["We're", "founded", "in"], value: "2026" },
    ],
    services = [
        {
            title: "ARCHITECTURE",
            description:
                "Designing residential and commercial spaces with a timeless, contemporary approach.",
            items: [
                "CUSTOM RESIDENTIAL DESIGN",
                "SMALL COMMERCIAL BUILDINGS",
                "RENOVATIONS & ADAPTIVE REUSE",
            ],
        },
        {
            title: "INTERIORS",
            description:
                "Creating warm, functional interiors that enhance everyday living.",
            items: [
                "INTERIOR SPACE PLANNING",
                "CUSTOM FURNITURE & MATERIAL SELECTION",
                "LIGHTING & ATMOSPHERE DESIGN",
            ],
        },
        {
            title: "CONSULTING",
            description:
                "Helping clients shape clear ideas through thoughtful design direction.",
            items: [
                "DESIGN STRATEGY & CONCEPT DEVELOPMENT",
                "SITE & FEASIBILITY STUDIES",
                "CLIENT WORKSHOPS",
            ],
        },
    ],
    projectsTag = "[PROJECTS]",
    projectsText = "A selection of projects we've had the pleasure of working on. From residential homes to commercial and cultural spaces, each project reflects our commitment to thoughtful design.",
    projectsTitleLines = ["SELECTED", "WORKS"],
    projects = [
        {
            number: "(01)",
            title: "Sora Museum",
            location: "Aoyama, Tokyo",
            image:
                "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80",
        },
        {
            number: "(02)",
            title: "Forest Residence",
            location: "Okutama, Tokyo",
            image:
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        },
        {
            number: "(03)",
            title: "Linear House",
            location: "Kiyosumi, Tokyo",
            image:
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        },
        {
            number: "(04)",
            title: "Glass Pavilion",
            location: "Daikanyama, Tokyo",
            image:
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        },
        {
            number: "(05)",
            title: "Frame Stadio",
            location: "Minato, Tokyo",
            image:
                "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
        },
    ],
    membersTag = "[MEMBERS]",
    membersText = "Meet the people behind our studio. A small team of architects and designers dedicated to creating thoughtful spaces for everyday living.",
    membersTitle = "OUR TEAM",
    members = [
        {
            role: "Founder",
            name: "Haruto Sato",
            bio: "Leads the studio with a focus on residential architecture.",
            number: "/001",
        },
        {
            role: "Lead Architect",
            name: "Mei Takahashi",
            bio: "Develops concepts and architectural planning.",
            number: "/002",
        },
        {
            role: "Interior Designer",
            name: "Yuna Ito",
            bio: "Creates warm and functional interior experiences.",
            number: "/003",
        },
        {
            role: "Project Architect",
            name: "Ren Nakamura",
            bio: "Oversees technical design and project coordination.",
            number: "/004",
        },
        {
            role: "Visual Designer",
            name: "Aoi Kuroda",
            bio: "Shapes the studio's visual identity and presentations.",
            number: "/005",
        },
        {
            role: "New Member",
            name: "Maybe You?",
            bio: "We are always looking for talented individuals to join our team.",
            number: "/006",
        },
    ],
    contactTag = "[CONTACT]",
    contactText = "Thank you for taking the time to explore our studio. No matter how small your project or inquiry may be, we'd love to hear from you. Let's start with a conversation.",
    officeLabel = "OUR OFFICE",
    officeAddressLines = ["2F, 3-12-8 Aoyama", "Minato-ku, Tokyo 107-0062, Japan"],
    footerTitle = "GET IN TOUCH",
    footerLinks = [
        { label: "TERMS OF USE", href: "#" },
        { label: "PRIVACY POLICY", href: "#" },
    ],
    copyright = "© 2026 ATELIER NORTH",
    backToTopLabel = "BACK TO TOP",
    backToTopArrow = "[↑]",
}) {
    const rootRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        let ctx;
        let lenis;
        let rafId;

        const run = async () => {
            loadFonts();
            const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
                import("gsap"),
                import("gsap/ScrollTrigger"),
                import("lenis"),
            ]);
            if (cancelled || !rootRef.current) return;

            gsap.registerPlugin(ScrollTrigger);

            const root = rootRef.current;
            const q = (s) => root.querySelector(s);
            const qa = (s) => [...root.querySelectorAll(s)];
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            ctx = gsap.context(() => {
                let isAutoScrolling = false;
                let isMenuOpen = false;

                if (!reduce) {
                    lenis = new Lenis({
                        duration: 1.2,
                        easing: (t) => 1 - Math.pow(1 - t, 3),
                    });
                    lenis.on("scroll", ScrollTrigger.update);
                    const raf = (time) => {
                        lenis.raf(time);
                        rafId = requestAnimationFrame(raf);
                    };
                    rafId = requestAnimationFrame(raf);
                }

                const header = q("[data-header]");
                const headerItems = qa("[data-header-item]");
                let hidden = false;
                let anim;
                const getHideY = () =>
                    -(header.offsetHeight + parseFloat(getComputedStyle(header).top) + 8);

                ScrollTrigger.create({
                    start: 0,
                    end: "max",
                    onUpdate: (self) => {
                        if (isAutoScrolling) return;
                        if (self.direction === 1 && !hidden) {
                            hidden = true;
                            anim?.kill();
                            anim = gsap.to(header, {
                                y: getHideY(),
                                duration: 0.45,
                                ease: "power3.inOut",
                            });
                        }
                        if (self.direction === -1 && hidden) {
                            hidden = false;
                            anim?.kill();
                            gsap.set(headerItems, { y: -50 });
                            anim = gsap
                                .timeline()
                                .to(header, { y: 0, duration: 0.45, ease: "power3.out" })
                                .to(
                                    headerItems,
                                    { y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" },
                                    "<",
                                );
                        }
                    },
                });

                const menuButton = q("[data-menu-button]");
                const menuButtonBox = q("[data-menu-button-box]");
                const overlay = q("[data-menu]");
                const panel = q("[data-menu-panel]");
                const openLabels = qa("[data-menu-open]");
                const closeLabels = qa("[data-menu-close]");
                const menuItems = qa("[data-menu-item]");

                gsap.set(overlay, { opacity: 0, pointerEvents: "none" });
                gsap.set(panel, { opacity: 0, rotate: -28, transformOrigin: "left top" });
                gsap.set(openLabels, { yPercent: 0 });
                gsap.set(closeLabels, { yPercent: 100 });
                gsap.set(menuButtonBox, { backgroundColor: "transparent" });
                gsap.set(menuItems, { display: "inline-block", yPercent: 100 });

                const openTl = gsap.timeline({ paused: true });
                const closeTl = gsap.timeline({ paused: true });
                const o = { duration: 1, ease: "power4.out" };

                openTl
                    .to(overlay, { opacity: 1, pointerEvents: "all", ...o })
                    .to(panel, { opacity: 1, rotate: 0, ...o }, 0)
                    .to(openLabels, { yPercent: -100, ...o }, 0)
                    .to(closeLabels, { yPercent: 0, ...o }, 0)
                    .to(menuButtonBox, { backgroundColor: textColor, color: bgColor, ...o }, 0)
                    .to(menuItems, { yPercent: 0, stagger: 0.1, ...o }, 0);

                closeTl
                    .to(openLabels, { yPercent: 0, ...o }, 0)
                    .to(menuButtonBox, { backgroundColor: "transparent", color: textColor, ...o }, 0)
                    .to(closeLabels, { yPercent: 100, ...o }, 0)
                    .to(panel, { opacity: 0, rotate: -28, ...o }, 0)
                    .to(overlay, { opacity: 0, pointerEvents: "none", ...o }, 0);

                menuButton.addEventListener("click", () => {
                    isMenuOpen = !isMenuOpen;
                    if (isMenuOpen) {
                        lenis?.stop();
                        openTl.restart();
                    } else {
                        closeTl.restart();
                        closeTl.eventCallback("onComplete", () => {
                            lenis?.start();
                            closeTl.eventCallback("onComplete", null);
                        });
                    }
                });

                qa("[data-smooth]").forEach((el) => {
                    el.addEventListener("click", (e) => {
                        e.preventDefault();
                        const href = el.getAttribute("href");
                        if (isMenuOpen) {
                            isMenuOpen = false;
                            lenis?.start();
                            closeTl.restart();
                        }
                        if (!lenis) {
                            q(href)?.scrollIntoView({ behavior: "smooth" });
                            return;
                        }
                        isAutoScrolling = true;
                        lenis.scrollTo(href, {
                            duration: 1,
                            easing: (t) => 1 - Math.pow(1 - t, 2),
                            lock: true,
                            onComplete: () => (isAutoScrolling = false),
                        });
                    });
                });

                const backTop = q("[data-back-top]");
                backTop.addEventListener("click", (e) => {
                    e.preventDefault();
                    if (lenis) lenis.scrollTo(0, { duration: 2 });
                    else window.scrollTo({ top: 0, behavior: "smooth" });
                });

                if (reduce) return;

                const heroChars = qa("[data-hero-title] [data-char]");
                gsap.set(heroChars, { scaleY: 0, transformOrigin: "bottom center" });
                gsap.to(heroChars, {
                    scaleY: 1,
                    duration: 1.2,
                    ease: "power4.out",
                    stagger: { each: 0.05, from: "random" },
                });

                const layers = qa("[data-about-layer]");
                gsap.set(layers[1], { clipPath: "polygon(0% 0%, 0% 0%, 0 100%, 0 100%)" });
                gsap.to(layers[1], {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0 100%)",
                    ease: "none",
                    scrollTrigger: {
                        trigger: q("[data-about-title]"),
                        start: "top 80%",
                        end: "top 20%",
                        scrub: 1.5,
                    },
                });

                qa("[data-float]").forEach((el) => {
                    gsap.fromTo(
                        el,
                        { y: -8 },
                        {
                            y: 8,
                            duration: gsap.utils.random(1.2, 1.8),
                            ease: "sine.inOut",
                            repeat: -1,
                            yoyo: true,
                            delay: gsap.utils.random(0, 2),
                        },
                    );
                });

                const pt = qa("[data-pt-span]");
                gsap.set([pt[1], pt[3]], { y: "100%" });
                gsap
                    .timeline({
                        scrollTrigger: { trigger: q("[data-projects-title]"), start: "top 65%" },
                    })
                    .to([pt[1], pt[3]], { y: "0%", duration: 1.5, ease: "power3.out", stagger: 0.3 })
                    .to(
                        [pt[0], pt[2]],
                        { y: "-100%", duration: 1.5, stagger: 0.3, ease: "power3.out" },
                        "<",
                    );

                qa("[data-pixel]").forEach((item) => {
                    const canvas = item.querySelector("[data-pixel-canvas]");
                    const img = item.querySelector("[data-pixel-img]");
                    const ctx2d = canvas.getContext("2d");
                    const temp = document.createElement("canvas");
                    const tctx = temp.getContext("2d");
                    const state = { progress: 0 };

                    const render = () => {
                        const w = (canvas.width = img.naturalWidth);
                        const h = (canvas.height = img.naturalHeight);
                        const px = 18 + (w - 18) * Math.pow(state.progress, 2.5);
                        const pw = Math.max(1, Math.round(px));
                        const ph = Math.max(1, Math.round((h / w) * pw));
                        temp.width = pw;
                        temp.height = ph;
                        tctx.clearRect(0, 0, pw, ph);
                        tctx.drawImage(img, 0, 0, pw, ph);
                        ctx2d.imageSmoothingEnabled = false;
                        ctx2d.clearRect(0, 0, w, h);
                        ctx2d.drawImage(temp, 0, 0, pw, ph, 0, 0, w, h);
                    };

                    if (img.complete && img.naturalWidth) render();
                    else img.onload = render;

                    gsap.set(canvas, { scale: 1.1 });
                    gsap
                        .timeline({
                            scrollTrigger: {
                                trigger: item,
                                start: "top center",
                                toggleActions: "play none none none",
                            },
                        })
                        .to(state, { progress: 1, duration: 1.5, onUpdate: render })
                        .to(canvas, { scale: 1, duration: 1.5 }, 0);
                });

                const pixels = (el, from, to, probs, end) => {
                    el.replaceChildren();
                    const targets = [];
                    const cands = [];
                    for (let r = 0; r < 6; r++) {
                        for (let c = 0; c < 25; c++) {
                            const cell = document.createElement("div");
                            cell.className = "-mr-px -mb-px";
                            cell.style.backgroundColor = from;
                            if (Math.random() < probs[r]) {
                                const d = { el: cell, color: to };
                                targets.push(d);
                                if (r < 4) cands.push(d);
                            }
                            el.appendChild(cell);
                        }
                    }
                    gsap.utils.shuffle(cands);
                    cands.slice(0, 6).forEach((d) => (d.color = accentColor));
                    gsap.to(
                        targets.map((t) => t.el),
                        {
                            backgroundColor: (i) => targets[i].color,
                            duration: 0.05,
                            stagger: { each: 0.003, from: "random" },
                            ease: "none",
                            scrollTrigger: {
                                trigger: el,
                                start: "top bottom",
                                end,
                                scrub: true,
                            },
                        },
                    );
                };

                pixels(q("[data-pixel-enter]"), bgColor, darkColor, [0.1, 0.2, 0.5, 0.7, 1, 1], "top 20%");
                pixels(q("[data-pixel-leave]"), darkColor, bgColor, [0.1, 0.2, 0.5, 0.7, 1, 1], "top 20%");
                pixels(q("[data-pixel-footer]"), textColor, bgColor, [0, 0.1, 0.2, 0.3, 0.5, 0.9], "bottom bottom");

                const memberChars = qa("[data-members-title] [data-char]");
                gsap.set(memberChars, { yPercent: 100 });
                gsap.to(memberChars, {
                    yPercent: 0,
                    duration: 1.2,
                    stagger: 0.05,
                    ease: "power4.out",
                    scrollTrigger: { trigger: q("[data-members-title]"), start: "top top" },
                });

                const footerChars = qa("[data-footer-title] [data-char]");
                gsap.set(footerChars, { scaleY: 0, transformOrigin: "top center" });
                gsap.to(footerChars, {
                    scaleY: 1,
                    duration: 1.5,
                    ease: "power3.out",
                    stagger: { each: 0.05, from: "random" },
                    scrollTrigger: { trigger: q("[data-footer-title]"), start: "top 80%" },
                });

                ScrollTrigger.refresh();
            }, root);
        };

        run();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            lenis?.destroy();
            ctx?.revert();
            rootRef.current
                ?.querySelectorAll("[data-pixel-enter],[data-pixel-leave],[data-pixel-footer]")
                .forEach((el) => el.replaceChildren());
        };
    }, [bgColor, textColor, darkColor, accentColor]);

    const lineColor = "border-[color:var(--ln)]";
    const listCls = (i, n) =>
        "relative flex flex-col justify-between p-3 lg:p-4 after:absolute after:top-1/2 after:right-0 after:h-[90%] after:-translate-y-1/2 after:border-r after:content-[''] " +
        "after:border-[color:var(--ln)] " +
        (i % 2 === 0 ? "after:block " : "after:hidden ") +
        (i < n - 1 ? "lg:after:block " : "lg:after:hidden ") +
        (i < n - 2 ? "border-b border-[color:var(--ln)] lg:border-b-0" : "");

    return (
        <div
            ref={rootRef}
            className={
                "min-h-screen bg-[var(--bg)] font-['Kode_Mono',monospace] font-normal text-[var(--tx)] " +
                className
            }
            style={{
                "--bg": bgColor,
                "--tx": textColor,
                "--dk": darkColor,
                "--cb": cardBgColor,
                "--ct": cardTextColor,
                "--ln": "color-mix(in srgb, " + textColor + " 50%, transparent)",
                "--ov": "color-mix(in srgb, " + darkColor + " 30%, transparent)",
            }}
        >
            <div
                data-menu
                className="fixed top-0 left-0 z-[998] h-screen w-screen bg-[var(--ov)] opacity-0 pointer-events-none lg:hidden"
            >
                <div
                    data-menu-panel
                    className={
                        "absolute top-20 right-[clamp(16px,calc(7.762px_+_2.197vw),64px)] flex w-fit flex-col gap-2 bg-[var(--tx)] px-6 pt-12 pb-8 text-[20px] text-[var(--bg)] " +
                        anton
                    }
                >
                    <ul className="flex flex-col gap-2">
                        <li className="mb-3">
                            <span className="inline-block overflow-hidden">
                                <span data-menu-item>{menuTitle}</span>
                            </span>
                        </li>
                        {navLinks.map((l) => (
                            <li key={l.href} className="mb-3">
                                <a href={l.href} data-smooth>
                                    <span className="inline-block overflow-hidden">
                                        <span data-menu-item>{l.label}</span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="my-6 border-b-[0.5px] border-[var(--bg)]" />
                    <div>
                        <p className="mb-3">
                            <span className="inline-block overflow-hidden">
                                <span data-menu-item>{menuEmailLabel}</span>
                            </span>
                        </p>
                        <a href={ctaHref}>
                            <span className="inline-block overflow-hidden">
                                <span data-menu-item>{ctaLabel}</span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>

            <header
                data-header
                className="fixed top-[clamp(24px,calc(21.254px_+_0.732vw),40px)] right-[clamp(16px,calc(7.762px_+_2.197vw),64px)] z-[999]"
            >
                <nav className="hidden lg:block">
                    <ul className="flex gap-4">
                        {navLinks.map((l) => (
                            <li key={l.href} data-header-item>
                                <a
                                    href={l.href}
                                    data-smooth
                                    className={"group relative flex overflow-hidden " + anton}
                                >
                                    <span
                                        className={
                                            "border px-4 py-2 transition-transform duration-[600ms] ease-out group-hover:scale-0 " +
                                            lineColor +
                                            " " +
                                            btnText
                                        }
                                    >
                                        {l.label}
                                    </span>
                                    <span
                                        className={
                                            "absolute top-0 left-0 origin-left translate-y-full rotate-[28deg] bg-[var(--tx)] px-4 py-2 text-[var(--bg)] transition-transform duration-[600ms] ease-out group-hover:translate-y-0 group-hover:rotate-0 " +
                                            btnText
                                        }
                                    >
                                        {l.label}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div data-menu-button className="lg:hidden">
                    <button
                        data-menu-button-box
                        type="button"
                        className={
                            "flex border px-4 py-2 " + lineColor + " " + btnText + " " + anton
                        }
                    >
                        <span className="relative flex min-w-8 overflow-hidden">
                            <span data-menu-open>{menuOpenLabel}</span>
                            <span data-menu-close className="absolute top-0 left-0">
                                {menuCloseLabel}
                            </span>
                        </span>
                    </button>
                </div>
            </header>

            <main>
                <section className="h-svh w-full">
                    <div
                        className={
                            "flex h-full w-full flex-col py-[clamp(24px,calc(21.254px_+_0.732vw),40px)] " +
                            wrap
                        }
                    >
                        <div className="flex flex-col gap-8 lg:gap-10">
                            <h1
                                data-hero-title
                                className={
                                    "flex text-[clamp(4.5rem,2.5634rem_+_8.2629vw,10rem)] " + anton
                                }
                            >
                                <span className="inline-block overflow-hidden">
                                    {brandTitleLines.map((line, i) => (
                                        <span key={i}>
                                            <Chars text={line} />
                                            {i < brandTitleLines.length - 1 && <br className="lg:hidden" />}
                                        </span>
                                    ))}
                                </span>
                            </h1>
                            <div className="flex max-w-[450px] flex-col gap-3 lg:gap-4">
                                <p className={base}>{visionLabel}</p>
                                <p className={base}>{visionText}</p>
                            </div>
                            <CtaLink href={ctaHref} label={ctaLabel} />
                        </div>
                        <div className="mt-auto flex h-[36%] flex-col gap-2 lg:h-[24%] lg:max-h-[300px]">
                            <div className="flex justify-between">
                                {scrollLabels.map((pair, i) => (
                                    <p key={i} className={"flex items-center gap-1 " + sm}>
                                        <span>{pair[0]}</span>
                                        <span>{pair[1]}</span>
                                    </p>
                                ))}
                            </div>
                            <ul
                                className={
                                    "grid flex-grow grid-cols-2 border lg:grid-cols-4 " + lineColor
                                }
                            >
                                {indexItems.map((item, i) => (
                                    <li key={i} className={listCls(i, indexItems.length)}>
                                        <p className={sm}>{item.tag}</p>
                                        <p className={base + " text-right"}>{item.label}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section id={sectionIds.about}>
                    <div className={"pt-20 pb-[120px] lg:py-48 " + wrap}>
                        <h2
                            data-about-title
                            className={"relative mb-6 lg:mb-10 " + big + " " + anton}
                        >
                            <span
                                data-about-layer
                                className="flex justify-between overflow-hidden [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1px_var(--tx)]"
                            >
                                {aboutTitleWords.map((w, i) => (
                                    <span key={i}>{w}</span>
                                ))}
                            </span>
                            <span
                                data-about-layer
                                className="absolute top-0 left-0 flex w-full justify-between overflow-hidden"
                            >
                                {aboutTitleWords.map((w, i) => (
                                    <span key={i}>{w}</span>
                                ))}
                            </span>
                        </h2>

                        <div
                            className={
                                "mb-10 flex flex-col border-y py-6 lg:grid lg:grid-cols-12 lg:overflow-hidden lg:py-10 " +
                                lineColor
                            }
                        >
                            <div className="relative flex flex-col gap-3 lg:col-[1/5] lg:gap-4 lg:after:absolute lg:after:top-1/2 lg:after:right-0 lg:after:h-[120%] lg:after:-translate-y-1/2 lg:after:border-r lg:after:border-[color:var(--ln)] lg:after:content-['']">
                                <p className={base}>{aboutTag}</p>
                                <p className={base + " max-w-[400px]"}>{aboutText}</p>
                            </div>
                            <ul className="hidden lg:col-[5/13] lg:block">
                                <div className="flex flex-row gap-4 lg:pl-10">
                                    {floatingItems.map((t, i) => (
                                        <li
                                            key={i}
                                            className="relative flex-1 lg:aspect-[271/200]"
                                            style={{ zIndex: floatingItems.length - i }}
                                        >
                                            <div
                                                data-float
                                                className={
                                                    "relative h-full border border-dashed " + lineColor
                                                }
                                            >
                                                <p className={"absolute right-4 bottom-4 " + sm}>{t}</p>
                                            </div>
                                        </li>
                                    ))}
                                </div>
                            </ul>
                        </div>

                        <div className="mb-10 flex flex-col lg:mb-20 lg:h-[430px] lg:flex-row">
                            {infoItems.map((item, i) => (
                                <div
                                    key={i}
                                    className={
                                        "relative aspect-[1/0.8] lg:w-1/2 " +
                                        (i === 0
                                            ? "bg-[var(--tx)] text-[var(--bg)]"
                                            : "border-r border-b border-l lg:border-t lg:border-l-0 " +
                                            lineColor)
                                    }
                                >
                                    <p className={"absolute top-6 left-4 lg:top-8 lg:left-6 " + sm}>
                                        {item.words[0]}
                                    </p>
                                    <p className={"absolute top-6 right-4 lg:top-8 lg:right-6 " + sm}>
                                        {item.words[1]}
                                    </p>
                                    <p className={"absolute bottom-6 left-4 lg:bottom-8 lg:left-6 " + sm}>
                                        {item.words[2]}
                                    </p>
                                    <p
                                        className={
                                            "absolute right-4 bottom-6 text-[clamp(2rem,1.2958rem_+_3.0047vw,4rem)] lg:right-6 lg:bottom-8 " +
                                            anton
                                        }
                                    >
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <ul className="flex flex-col gap-6 lg:flex-row">
                            {services.map((s, i) => (
                                <li
                                    key={i}
                                    className={
                                        "flex aspect-[1/0.8] flex-col justify-between border border-dashed px-4 py-6 lg:aspect-[1/0.95] lg:w-[calc(33%-16px)] lg:px-6 lg:py-8 " +
                                        lineColor
                                    }
                                >
                                    <div className="flex flex-col gap-6">
                                        <p className={base}>{s.description}</p>
                                        <ul className="flex flex-col gap-0.5">
                                            {s.items.map((it, j) => (
                                                <li key={j} className={"flex items-center gap-2 " + sm}>
                                                    <span className="block size-1 bg-[var(--tx)]" />
                                                    {it}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p
                                        className={
                                            "text-right text-[clamp(2rem,1.6479rem_+_1.5023vw,3rem)] " +
                                            anton
                                        }
                                    >
                                        {s.title}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section id={sectionIds.projects}>
                    <div className={"pb-[120px] lg:pb-48 " + wrap}>
                        <div className="mb-10 flex flex-col-reverse gap-6 lg:mb-0 lg:flex-row lg:justify-between">
                            <Intro tag={projectsTag} text={projectsText} />
                            <h2
                                data-projects-title
                                className={"flex flex-col items-end text-right " + big + " " + anton}
                            >
                                {projectsTitleLines.map((line, i) => (
                                    <span key={i} className="relative flex justify-end overflow-hidden">
                                        <span data-pt-span>{line}</span>
                                        <span data-pt-span className="absolute top-0 right-0">
                                            {line}
                                        </span>
                                    </span>
                                ))}
                            </h2>
                        </div>
                        <div className="grid grid-cols-12 grid-rows-[repeat(5,auto)] gap-y-16 lg:grid-rows-[repeat(3,auto)]">
                            {projects.map((p, i) => (
                                <article
                                    key={i}
                                    className={"flex flex-col gap-2 lg:gap-3 " + (projectSlots[i] || "")}
                                >
                                    <p className={sm}>{p.number}</p>
                                    <div data-pixel className="overflow-hidden">
                                        <canvas data-pixel-canvas className="block h-auto w-full" />
                                        <img
                                            data-pixel-img
                                            src={p.image}
                                            alt={p.title}
                                            crossOrigin="anonymous"
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={sm}>{p.title}</p>
                                        <p className={sm}>{p.location}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id={sectionIds.members} className="pb-[120px] lg:pb-0">
                    <div
                        data-pixel-enter
                        className={"h-[24.1vw] bg-[var(--bg)] " + pixelGrid}
                    />
                    <div
                        className={
                            "relative h-[600vh] bg-[var(--dk)] text-[var(--bg)] " + wrap
                        }
                    >
                        <div className="sticky top-0 left-0 z-[1] h-screen w-full">
                            <div className="absolute top-10 left-1/2 flex w-full max-w-[600px] -translate-x-1/2 flex-col items-center gap-3 lg:gap-4">
                                <p className={base}>{membersTag}</p>
                                <p className={base}>{membersText}</p>
                            </div>
                            <h2
                                data-members-title
                                className={
                                    "absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(5rem,1.6626rem_+_14.2395vw,18.75rem)] " +
                                    anton
                                }
                            >
                                <span className="inline-block overflow-hidden">
                                    <Chars text={membersTitle} />
                                </span>
                            </h2>
                            <div className="absolute bottom-10 left-1/2 flex w-full max-w-[600px] -translate-x-1/2 flex-col items-center gap-3 lg:gap-4">
                                <p className={base}>{membersTag}</p>
                                <p className={base}>{membersText}</p>
                            </div>
                        </div>
                        <ul className="relative z-[2] mt-[400px] grid grid-cols-12 grid-rows-[repeat(5,auto)] gap-y-[120px] lg:mt-[800px] lg:gap-y-[400px]">
                            {members.map((m, i) => (
                                <li
                                    key={i}
                                    className={
                                        "mx-auto flex aspect-[1/1.25] w-full max-w-[320px] flex-col bg-[var(--cb)] px-6 py-8 text-[var(--ct)] lg:max-w-[500px] " +
                                        (memberSlots[i] || "")
                                    }
                                >
                                    <div>
                                        <p className={sm + " mb-1"}>{m.role}</p>
                                        <p className={"mb-4 text-[20px] " + anton}>{m.name}</p>
                                        <p className={base}>{m.bio}</p>
                                    </div>
                                    <p className={base + " mt-auto text-right"}>{m.number}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div data-pixel-leave className={"h-[24.1vw] bg-[var(--dk)] " + pixelGrid} />
                </section>
            </main>

            <footer className="w-full overflow-hidden lg:h-svh">
                <div className={"flex h-full w-full flex-col lg:pt-10 " + wrap}>
                    <div className="mb-20 flex flex-col-reverse gap-10 lg:mb-0 lg:flex-row lg:justify-between">
                        <div>
                            <Intro tag={contactTag} text={contactText} className="mb-10" />
                            <CtaLink href={ctaHref} label={ctaLabel} className="mb-10 lg:mb-20" />
                            <div
                                className={
                                    "flex flex-col gap-3 text-[clamp(1rem,0.912rem_+_0.3756vw,1.25rem)] " +
                                    anton
                                }
                            >
                                <p>{officeLabel}</p>
                                <p>
                                    {officeAddressLines.map((l, i) => (
                                        <span key={i} className="block">
                                            {l}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                        <h2
                            data-footer-title
                            className={
                                "flex text-[clamp(4rem,1.8873rem_+_9.0141vw,10rem)] " + anton
                            }
                        >
                            <span className="flex overflow-hidden">
                                <Chars text={footerTitle} />
                            </span>
                        </h2>
                    </div>

                    <div className="mt-auto">
                        <div className="mb-4 grid grid-cols-2 gap-y-12 lg:grid-cols-12 lg:items-end">
                            <div className="col-[1/2] flex flex-col lg:col-[6/8]">
                                {footerLinks.map((l) => (
                                    <SlideLink key={l.label} href={l.href} label={l.label} />
                                ))}
                            </div>
                            <div className="col-[2/3] flex flex-col lg:col-[9/11]">
                                <p className={sm}>{copyright}</p>
                            </div>
                            <div className="col-[2/3] flex flex-col lg:col-[11/13] lg:justify-self-end">
                                <SlideLink
                                    href="#top"
                                    label={backToTopLabel}
                                    dataAttr={{ "data-back-top": "" }}
                                    after={<span>{backToTopArrow}</span>}
                                />
                            </div>
                        </div>
                        <div
                            data-pixel-footer
                            className={
                                "mx-[calc(50%-50vw)] h-[40vw] w-screen bg-[var(--tx)] lg:h-[20vw] " +
                                pixelGrid
                            }
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
}