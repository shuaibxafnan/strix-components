"use client";

import { useEffect, useRef, useState } from "react";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";

const bodoni = Bodoni_Moda({
    subsets: ["latin"],
    weight: "400",
    display: "swap",
    variable: "--font-bodoni",
});

const hanken = Hanken_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500"],
    display: "swap",
    variable: "--font-hanken",
});

const slots = [
    "-rotate-[8deg] translate-y-3",
    "-rotate-[1deg] -translate-y-3",
    "rotate-[9deg] translate-y-2",
];

const atCard =
    "top-[var(--y)] left-[var(--x)] h-[var(--h)] w-[var(--w)] -rotate-[1deg] border-[10px] ";

const frames = {
    idle: atCard + "opacity-0 transition-none",
    ready: atCard + "opacity-100 transition-none",
    open: "top-0 left-0 h-screen w-screen rotate-0 border-0 opacity-100 transition-all duration-[1250ms] ease-[cubic-bezier(0.7,0,0.2,1)] motion-reduce:duration-[1ms]",
    closing:
        "top-0 left-0 h-screen w-screen rotate-0 border-0 opacity-0 transition-opacity duration-[700ms] motion-reduce:duration-[1ms]",
};

export default function VideoOpener({
    cards = [
        {
            image:
                "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
            alt: "Tall pine trees in morning mist",
            caption: "Mist",
        },
        {
            image:
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
            alt: "Sunlight falling through a forest canopy",
            caption: "Light",
        },
        {
            image:
                "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
            alt: "A narrow trail winding through green woods",
            caption: "Trail",
        },
    ],
    video = "https://videos.pexels.com/video-files/5214219/5214219-hd_1920_1080_25fps.mp4",
    backgroundImage = "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1800&q=80",
    buttonLabel = "Watch the video",
    closeLabel = "Close preview",
    loadingLabel = "Loading video",
    errorLabel = "The video could not be loaded.",
    muted = false,
    bgColor = "#000000",
    textColor = "#ffffff",
    className = "",
}) {
    const list = cards.slice(0, 3);
    const mid = Math.floor(list.length / 2);

    const [phase, setPhase] = useState("idle");
    const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    const midRef = useRef(null);
    const videoRef = useRef(null);
    const closeRef = useRef(null);
    const timers = useRef([]);
    const frameId = useRef(0);

    const later = (fn, ms) => {
        timers.current.push(setTimeout(fn, ms));
    };

    const show = () => {
        const img = midRef.current;
        const el = videoRef.current;
        if (!img || !el || phase !== "idle") return;
        const r = img.getBoundingClientRect();
        const w = img.offsetWidth + 20;
        const h = img.offsetHeight + 20;
        setRect({ x: r.left + r.width / 2 - w / 2, y: r.top + r.height / 2 - h / 2, w, h });
        el.currentTime = 0;
        setPhase("ready");
        frameId.current = requestAnimationFrame(() => {
            frameId.current = requestAnimationFrame(() => setPhase("open"));
        });
        later(() => el.play().catch(() => { }), 900);
        later(() => closeRef.current && closeRef.current.focus(), 1400);
    };

    const hide = () => {
        if (phase !== "open") return;
        timers.current.forEach(clearTimeout);
        timers.current = [];
        if (videoRef.current) videoRef.current.pause();
        setPhase("closing");
        later(() => setPhase("idle"), 700);
    };

    useEffect(() => {
        if (phase !== "open") return;
        const onKey = (e) => {
            if (e.key === "Escape") hide();
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [phase]);

    useEffect(
        () => () => {
            cancelAnimationFrame(frameId.current);
            timers.current.forEach(clearTimeout);
        },
        [],
    );

    const active = phase === "open";

    return (
        <div
            className={
                "relative flex h-screen w-full items-center justify-center overflow-hidden border-[clamp(8px,1.5vw,20px)] border-[var(--fg)] bg-[var(--bg)] bg-[image:var(--bgimg)] bg-cover bg-center font-[family-name:var(--font-hanken)] text-[var(--fg)] " +
                bodoni.variable +
                " " +
                hanken.variable +
                " " +
                className
            }
            style={{
                "--bg": bgColor,
                "--fg": textColor,
                "--bgimg": backgroundImage ? "url(" + backgroundImage + ")" : "none",
                "--x": rect.x + "px",
                "--y": rect.y + "px",
                "--w": rect.w + "px",
                "--h": rect.h + "px",
            }}
        >
            <div className="absolute inset-0 bg-[var(--bg)] opacity-50" />

            <div className="relative z-10 flex flex-col items-center gap-14">
                <ul className="flex items-center justify-center">
                    {list.map((c, i) => (
                        <li
                            key={i}
                            className={
                                "-mx-[clamp(8px,2.2vw,40px)] transition-transform duration-500 ease-out hover:z-10 hover:-translate-y-4 hover:rotate-0 motion-reduce:transition-none " +
                                slots[i % slots.length]
                            }
                        >
                            <figure className="bg-[var(--fg)] p-2.5">
                                <img
                                    ref={i === mid ? midRef : null}
                                    src={c.image}
                                    alt={c.alt}
                                    className="block aspect-square w-[clamp(110px,22vmin,260px)] object-cover"
                                />
                                <figcaption className="pt-3 pb-1 text-center font-[family-name:var(--font-bodoni)] text-lg leading-none text-[var(--bg)]">
                                    {c.caption}
                                </figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>

                <div className="relative flex h-14 items-center justify-center">
                    {!loaded && !failed && (
                        <span
                            role="status"
                            className="size-8 animate-spin rounded-full border-2 border-[var(--fg)] border-t-transparent"
                        >
                            <span className="sr-only">{loadingLabel}</span>
                        </span>
                    )}
                    {failed && <p className="text-sm opacity-70">{errorLabel}</p>}
                    <button
                        type="button"
                        onClick={show}
                        tabIndex={loaded ? 0 : -1}
                        className={
                            "absolute flex items-center gap-4 border border-[var(--fg)] px-8 py-4 text-sm font-medium tracking-wide whitespace-nowrap transition duration-300 hover:bg-[var(--fg)] hover:text-[var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--fg)] " +
                            (loaded ? "opacity-100" : "pointer-events-none opacity-0")
                        }
                    >
                        <svg viewBox="0 0 12 14" className="h-3.5 w-3 fill-current" aria-hidden="true">
                            <path d="M0 0L12 7L0 14Z" />
                        </svg>
                        {buttonLabel}
                    </button>
                </div>
            </div>

            <div
                className={
                    "fixed z-50 overflow-hidden border-[var(--fg)] bg-[var(--bg)] " +
                    frames[phase] +
                    (phase === "idle" ? " pointer-events-none" : "")
                }
            >
                <img
                    src={list[mid] ? list[mid].image : ""}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <video
                    ref={videoRef}
                    src={video}
                    muted={muted}
                    playsInline
                    preload="auto"
                    onCanPlayThrough={() => setLoaded(true)}
                    onLoadedData={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    onEnded={hide}
                    className={
                        "absolute inset-0 h-full w-full object-cover " +
                        (active
                            ? "scale-100 opacity-100 transition-[opacity,transform] delay-[700ms] duration-[900ms] ease-out"
                            : "scale-[1.25] opacity-0 transition-none")
                    }
                />
                <button
                    ref={closeRef}
                    type="button"
                    onClick={hide}
                    aria-label={closeLabel}
                    className={
                        "absolute top-[clamp(16px,3vw,32px)] right-[clamp(16px,3vw,32px)] z-10 flex size-14 items-center justify-center border border-[var(--fg)] bg-[var(--bg)] text-[var(--fg)] transition-[opacity,background-color,color] duration-300 hover:bg-[var(--fg)] hover:text-[var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--fg)] " +
                        (active
                            ? "opacity-100 delay-[1300ms] hover:delay-0"
                            : "pointer-events-none opacity-0")
                    }
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="size-5 fill-none stroke-current stroke-[1.5]"
                        aria-hidden="true"
                    >
                        <path d="M4 4L20 20M20 4L4 20" />
                    </svg>
                </button>
            </div>
        </div>
    );
}