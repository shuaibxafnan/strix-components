"use client";

import { useEffect, useRef, useState } from "react";

// ─── Inject scroll-highlight keyframes once ────────────────────────────────
function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById("sh-styles")) return;
    const style = document.createElement("style");
    style.id = "sh-styles";
    style.textContent = `
      ::view-transition-new(root) { animation: sh-grow 0.8s ease; }
      ::view-transition-old(root) { animation: none; }
      @keyframes sh-grow {
        from { clip-path: polygon(50vmax 50vmax, 50vmax 50vmax, 50vmax 50vmax); }
        to   { clip-path: polygon(50vmax -100vmax, -100vmax 200vmax, 200vmax 200vmax); }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

// ─── Mark ──────────────────────────────────────────────────────────────────
export function Mark({ children, hue = 45 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      {
        threshold: 0.8,
      },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const color = `hsl(${hue} 80% 80%)`;

  return (
    <mark ref={ref} className="bg-transparent text-inherit">
      <span
        style={{
          backgroundImage: `linear-gradient(120deg, ${color} 50%, transparent 50%)`,
          backgroundSize: "200% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: visible ? "0% 0" : "110% 0",
          transition: "background-position 1s",
        }}
        className="text-inherit"
      >
        {children}
      </span>
    </mark>
  );
}

// ─── Theme toggle ──────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 z-50 w-12 h-12 rounded-xl border-none bg-transparent cursor-pointer grid place-items-center text-current"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// ─── Grid overlay ──────────────────────────────────────────────────────────
function GridOverlay({ size = 80, opacity = 0.25 }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        opacity,
        background: `
          repeating-linear-gradient(transparent 0 ${size - 1}px, currentColor ${size - 1}px ${size}px),
          repeating-linear-gradient(90deg, transparent 0 ${size - 1}px, currentColor ${size - 1}px ${size}px)
        `,
        maskImage: "linear-gradient(-35deg, transparent 50%, white)",
        WebkitMaskImage: "linear-gradient(-35deg, transparent 50%, white)",
      }}
    />
  );
}

// ─── ScrollHighlight shell ─────────────────────────────────────────────────
export default function ScrollHighlight({
  children,
  defaultDark = false,
  showToggle = true,
  useViewTransition = true,
  showGrid = true,
  gridSize = 80,
  gridOpacity = 0.25,
  contentWidth = "72ch",
  className = "",
}) {
  const [dark, setDark] = useState(defaultDark);
  useGlobalStyles();

  const toggle = () => {
    const update = () => setDark((d) => !d);
    if (useViewTransition && document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  };

  return (
    <div
      className={`min-h-screen relative transition-colors duration-400 ${
        dark
          ? "bg-[hsl(0_0%_6%)] text-[hsl(0_0%_96%)]"
          : "bg-[hsl(0_0%_98%)] text-[hsl(0_0%_6%)]"
      } font-[system-ui,Helvetica,Arial,sans-serif] ${className}`}
    >
      {showGrid && <GridOverlay size={gridSize} opacity={gridOpacity} />}
      {showToggle && <ThemeToggle dark={dark} onToggle={toggle} />}

      <div
        className="relative z-10 mx-auto px-6 pb-[30vmin]"
        style={{ maxWidth: contentWidth }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Demo ──────────────────────────────────────────────────────────────────
export function ScrollHighlightDemo() {
  return (
    <ScrollHighlight>
      {/* Hero logo */}
      <div className="flex items-center min-h-[200px] h-[50vmin]">
        <svg
          viewBox="0 0 76 65"
          fill="none"
          className="w-[35%] drop-shadow-[0_0_20px_hsl(0_0%_50%/0.75)]"
        >
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
        </svg>
      </div>

      {/* Intro */}
      <section className="mb-10">
        <h1 className="text-4xl mb-6">Next.js on Vercel</h1>
        <p className="mb-4 leading-relaxed text-lg">
          Vercel is the native Next.js platform, designed to enhance the Next.js
          experience.
        </p>
        <p className="mb-4 leading-relaxed text-lg">
          Next.js is a fullstack React framework for the web, maintained by
          Vercel.
        </p>
        <p className="mb-4 leading-relaxed text-lg">
          While Next.js works when self-hosting, deploying to Vercel is
          zero-configuration and provides additional enhancements for{" "}
          <Mark>scalability, availability, and performance globally.</Mark>
        </p>
      </section>

      {/* Getting started */}
      <section className="mb-10">
        <h2 className="text-2xl font-light mb-4">Getting started</h2>
        <p className="mb-4 leading-relaxed text-lg">
          There are multiple ways to get started with Next.js on Vercel:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2 text-lg leading-relaxed">
          <li>
            Install Vercel CLI and run the vercel command from your project root
          </li>
          <li>Clone a Next.js example repo and deploy it on Vercel</li>
          <li>Choose a template from Vercel&apos;s marketplace</li>
        </ul>
        <p className="mb-4 leading-relaxed text-lg">
          <Mark hue={200}>
            Vercel deployments can integrate with your git provider to generate
            preview URLs for each pull request you make
          </Mark>{" "}
          to your Next.js project.
        </p>
      </section>

      {/* ISR */}
      <section className="mb-10">
        <h2 className="text-2xl font-light mb-4">
          Incremental Static Regeneration
        </h2>
        <p className="mb-4 leading-relaxed text-lg">
          ISR allows you to{" "}
          <Mark hue={280}>
            create or update content without redeploying your site.
          </Mark>{" "}
          ISR has three main benefits: better performance, improved security,
          and faster build times.
        </p>
        <p className="leading-relaxed text-lg">
          <Mark hue={30}>
            To enable ISR with Next.js in the app router, add a revalidate
            property to your fetch requests.
          </Mark>
        </p>
      </section>

      {/* SSR */}
      <section className="mb-10">
        <h2 className="text-2xl font-light mb-4">
          Server-Side Rendering (SSR)
        </h2>
        <p className="leading-relaxed text-lg">
          On Vercel,{" "}
          <Mark hue={220}>
            you can server-render Next.js applications in either the Node.js
            runtime with Serverless Functions or the Edge runtime with Edge
            Functions.
          </Mark>
        </p>
      </section>

      {/* Image Optimization */}
      <section className="mb-10">
        <h2 className="text-2xl font-light mb-4">Image Optimization</h2>
        <p className="mb-4 leading-relaxed text-lg">
          When deploying to Vercel,{" "}
          <Mark hue={140}>images are automatically optimized on demand,</Mark>{" "}
          keeping your build times fast while improving Core Web Vitals.
        </p>
        <p className="mb-4 leading-relaxed text-lg">
          To use Image Optimization,{" "}
          <Mark hue={10}>
            import the next/image component into the component you&apos;d like
            to add an image to.
          </Mark>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-lg leading-relaxed">
          <li>Zero-configuration Image Optimization when using next/image</li>
          <li>
            <Mark hue={190}>
              Keeps your builds fast by optimizing images on-demand
            </Mark>
          </li>
          <li>No additional services needed</li>
        </ul>
      </section>

      <hr className="my-10 opacity-20" />
      <p className="text-center text-lg">
        <a
          href="https://vercel.com/docs/frameworks/nextjs"
          className="text-blue-500 hover:underline"
        >
          Check out the Vercel Docs for more.
        </a>
      </p>
    </ScrollHighlight>
  );
}
