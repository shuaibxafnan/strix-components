"use client";

import { useEffect, useRef, useState } from "react";

function Mark({ children, hue = 45 }) {
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

function GridOverlay({ size, opacity }) {
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

function Parts({ parts }) {
  return parts.map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <Mark key={i} hue={part.hue}>
        {part.mark}
      </Mark>
    ),
  );
}

const DEFAULT_SECTIONS = [
  {
    title: "Next.js on Vercel",
    blocks: [
      {
        parts: [
          "Vercel is the native Next.js platform, designed to enhance the Next.js experience.",
        ],
      },
      {
        parts: [
          "Next.js is a fullstack React framework for the web, maintained by Vercel.",
        ],
      },
      {
        parts: [
          "While Next.js works when self-hosting, deploying to Vercel is zero-configuration and provides additional enhancements for ",
          {
            mark: "scalability, availability, and performance globally.",
            hue: 45,
          },
        ],
      },
    ],
  },
  {
    title: "Getting started",
    blocks: [
      {
        parts: [
          "There are multiple ways to get started with Next.js on Vercel:",
        ],
      },
      {
        list: [
          [
            "Install Vercel CLI and run the vercel command from your project root",
          ],
          ["Clone a Next.js example repo and deploy it on Vercel"],
          ["Choose a template from Vercel's marketplace"],
        ],
      },
      {
        parts: [
          {
            mark: "Vercel deployments can integrate with your git provider to generate preview URLs for each pull request you make",
            hue: 200,
          },
          " to your Next.js project.",
        ],
      },
    ],
  },
  {
    title: "Incremental Static Regeneration",
    blocks: [
      {
        parts: [
          "ISR allows you to ",
          {
            mark: "create or update content without redeploying your site.",
            hue: 280,
          },
          " ISR has three main benefits: better performance, improved security, and faster build times.",
        ],
      },
      {
        parts: [
          {
            mark: "To enable ISR with Next.js in the app router, add a revalidate property to your fetch requests.",
            hue: 30,
          },
        ],
      },
    ],
  },
  {
    title: "Server-Side Rendering (SSR)",
    blocks: [
      {
        parts: [
          "On Vercel, ",
          {
            mark: "you can server-render Next.js applications in either the Node.js runtime with Serverless Functions or the Edge runtime with Edge Functions.",
            hue: 220,
          },
        ],
      },
    ],
  },
  {
    title: "Image Optimization",
    blocks: [
      {
        parts: [
          "When deploying to Vercel, ",
          { mark: "images are automatically optimized on demand,", hue: 140 },
          " keeping your build times fast while improving Core Web Vitals.",
        ],
      },
      {
        parts: [
          "To use Image Optimization, ",
          {
            mark: "import the next/image component into the component you'd like to add an image to.",
            hue: 10,
          },
        ],
      },
      {
        list: [
          ["Zero-configuration Image Optimization when using next/image"],
          [
            {
              mark: "Keeps your builds fast by optimizing images on-demand",
              hue: 190,
            },
          ],
          ["No additional services needed"],
        ],
      },
    ],
  },
];

export default function ScrollHighlight({
  sections = DEFAULT_SECTIONS,
  backgroundColor = "hsl(0 0% 98%)",
  textColor = "hsl(0 0% 6%)",
  showGrid = true,
  gridSize = 80,
  gridOpacity = 0.25,
  contentWidth = "72ch",
  className = "",
}) {
  return (
    <div
      className={`min-h-screen relative font-[system-ui,Helvetica,Arial,sans-serif] ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      {showGrid && <GridOverlay size={gridSize} opacity={gridOpacity} />}

      <div
        className="relative z-10 mx-auto px-6 pt-[10vmin] pb-[30vmin]"
        style={{ maxWidth: contentWidth }}
      >
        {sections.map((section, si) => (
          <section key={si} className="mb-10">
            {si === 0 ? (
              <h1 className="text-4xl mb-6">{section.title}</h1>
            ) : (
              <h2 className="text-2xl font-light mb-4">{section.title}</h2>
            )}
            {section.blocks.map((block, bi) =>
              block.list ? (
                <ul
                  key={bi}
                  className="list-disc pl-6 mb-4 space-y-2 text-lg leading-relaxed"
                >
                  {block.list.map((item, ii) => (
                    <li key={ii}>
                      <Parts parts={item} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={bi} className="mb-4 leading-relaxed text-lg">
                  <Parts parts={block.parts} />
                </p>
              ),
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
