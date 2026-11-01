"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  {
    title: "Great Wall of China",
    description:
      "An awe-inspiring series of fortifications made of stone and earth, stretching thousands of miles across northern China.",
    url_img: "https://images.pexels.com/photos/19872/pexels-photo.jpg",
    url_external:
      "https://www.pexels.com/photo/aerial-photography-of-great-wall-of-china-19872/",
    photographer: "Manuel Joseph",
  },
  {
    title: "Petra, Jordan",
    description:
      "The ancient rock-cut city famous for its rose-red sandstone architecture and intricate water conduit system.",
    url_img:
      "https://images.pexels.com/photos/1631665/pexels-photo-1631665.jpeg",
    url_external:
      "https://www.pexels.com/photo/horse-with-trailer-in-front-of-petra-1631665/",
    photographer: "Abdullah Ghatasheh",
  },
  {
    title: "Chichen Itza",
    description:
      "A large pre-Columbian archaeological site built by the Maya civilization in Mexico's Yucatán Peninsula.",
    url_img:
      "https://images.pexels.com/photos/17429064/pexels-photo-17429064.jpeg",
    url_external:
      "https://www.pexels.com/photo/chichen-itza-in-mexico-17429064/",
    photographer: "Mauricio Artieda",
  },
  {
    title: "Machu Picchu",
    description:
      "A majestic Incan citadel nestled high in the Andes Mountains of Peru, surrounded by misty peaks.",
    url_img: "https://images.pexels.com/photos/612451/pexels-photo-612451.jpeg",
    url_external: "https://www.pexels.com/photo/mountain-and-houses-612451/",
    photographer: "Laetitia Saad",
  },
  {
    title: "Roman Colosseum",
    description:
      "The grand amphitheater in the heart of Rome, symbolizing the power and ingenuity of ancient Rome.",
    url_img:
      "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg",
    url_external: "https://www.pexels.com/photo/colosseum-rome-italy-2064827/",
    photographer: "Davi Pimentel",
  },
  {
    title: "Christ the Redeemer",
    description:
      "The iconic Art Deco statue of Jesus Christ overlooking Rio de Janeiro from the Corcovado mountain.",
    url_img:
      "https://images.pexels.com/photos/13911606/pexels-photo-13911606.jpeg",
    url_external:
      "https://www.pexels.com/photo/christ-the-redeemer-statue-in-rio-de-janeiro-17782075/",
    photographer: "Abraham Challco",
  },
  {
    title: "Eiffel Tower",
    description:
      "The world-famous iron lattice tower that defines the Paris skyline and is a global symbol of France.",
    url_img: "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg",
    url_external:
      "https://www.pexels.com/photo/picture-of-eiffel-tower-338515/",
    photographer: "Thorsten technoman",
  },
  {
    title: "Sydney Opera House",
    description:
      "An architectural marvel on Sydney's harbor, known for its distinctive sail-like design.",
    url_img:
      "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg",
    url_external:
      "https://www.pexels.com/photo/white-sydney-opera-house-2193300/",
    photographer: "Rijan Hamidovic",
  },
  {
    title: "Taj Mahal",
    description:
      "A breathtaking white marble mausoleum and a masterpiece of Mughal architecture in India.",
    url_img:
      "https://images.pexels.com/photos/1260801/pexels-photo-1260801.jpeg",
    url_external:
      "https://www.pexels.com/photo/taj-mahal-surrounded-by-fog-1260801/",
    photographer: "vishnudeep dixit",
  },
  {
    title: "Burj Khalifa",
    description:
      "The tallest man-made structure in the world, soaring high above Dubai with a futuristic design.",
    url_img:
      "https://images.pexels.com/photos/3629227/pexels-photo-3629227.jpeg",
    url_external:
      "https://www.pexels.com/photo/silhouette-of-buildings-3629227/",
    photographer: "Aleksandar Pasaric",
  },
];

export default function SnapScrollGallery({
  linkActiveColor = "#fe9a00",
  linkHoverColor = "#00598a",
  stepDuration = 600,
  captionWidth = "w-[30ch]",
  items = DEFAULT_ITEMS,
  photoCreditLabel = "Photo by",
  className = "",
}) {
  const galleryRef = useRef(null);
  const isAutoScrolling = useRef(false);
  const rafId = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationState, setAnimationState] = useState("scale-up");

  useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrolling.current || !galleryRef.current) return;

      const figures = galleryRef.current.querySelectorAll("figure");
      const viewportCenter = window.scrollY + window.innerHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      figures.forEach((fig, index) => {
        const figTop = fig.offsetTop;
        const figCenter = figTop + fig.offsetHeight / 2;
        const distance = Math.abs(viewportCenter - figCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
      isAutoScrolling.current = false;
    };
  }, []);

  const smoothScrollTo = (targetY, duration) => {
    const startY = window.scrollY;
    const deltaY = targetY - startY;
    let startTime = null;

    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    function animateScroll(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      const nextY = easeInOutQuad(progress, startY, deltaY, duration);
      window.scrollTo(0, nextY);

      if (progress < duration) {
        rafId.current = window.requestAnimationFrame(animateScroll);
      } else {
        window.scrollTo(0, targetY);

        setAnimationState("scale-up");
        isAutoScrolling.current = false;
      }
    }

    rafId.current = window.requestAnimationFrame(animateScroll);
  };

  const handleNavClick = (e, index) => {
    e.preventDefault();
    if (index === activeIndex || isAutoScrolling.current) return;

    isAutoScrolling.current = true;
    setAnimationState("scale-down");

    const distance = Math.abs(index - activeIndex);
    const dynamicDuration = distance * stepDuration;

    setActiveIndex(index);

    if (galleryRef.current) {
      const figures = galleryRef.current.querySelectorAll("figure");
      const targetElement = figures[index];
      if (targetElement) {
        const targetY = targetElement.offsetTop;
        smoothScrollTo(targetY, dynamicDuration);
      }
    }
  };

  return (
    <div className={`font-sans antialiased text-neutral-900 dark:text-neutral-50 bg-[#ffedd4] dark:bg-[#101828] min-h-screen selection:bg-orange-400 ${className}`}>
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[700px] p-4 flex flex-wrap justify-center gap-1 z-50">
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <a
              key={idx}
              href={`#item-${idx + 1}`}
              onClick={(e) => handleNavClick(e, idx)}
              className="text-white text-xs no-underline border border-white/25 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-[3px] transition-all duration-150 ease-in-out outline-none"
              style={{
                backgroundColor: isActive ? linkActiveColor : undefined,
                color: isActive ? "black" : "white",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = linkHoverColor;
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)";
              }}
              onFocus={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = linkHoverColor;
              }}
              onBlur={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)";
              }}
            >
              {item.title}
            </a>
          );
        })}
      </nav>

      <section
        id="gallery"
        ref={galleryRef}
        className="grid grid-auto-cols-[100vw] grid-auto-rows-[100vh] [scroll-snap-type:y_mandatory]"
      >
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;

          return (
            <figure
              key={idx}
              id={`item-${idx + 1}`}
              className={`relative m-0 w-screen h-screen [scroll-snap-align:center] overflow-hidden transition-transform duration-500 ease-out ${
                isActive && animationState === "scale-down"
                  ? "scale-50 pointer-events-none"
                  : "scale-100"
              }`}
            >
              <img
                src={item.url_img}
                alt={item.title}
                className="w-full h-full object-cover"
              />

                      <figcaption
                className={`absolute bottom-8 right-8 bg-black/50 backdrop-blur-sm p-4 rounded-xl text-xs text-white font-light text-pretty transition-all ease-in-out shadow-lg ${captionWidth} ${
                  isActive && animationState === "scale-up"
                    ? "translate-x-0 opacity-100 duration-500"
                    : "translate-x-[500px] opacity-0 duration-300"
                }`}
              >
                <h2 className="text-base font-bold mb-2 tracking-wide">
                  {item.title}
                </h2>
                <p className="mb-4 text-white/80 leading-relaxed">
                  {item.description}
                </p>
                <p className="text-[10px] text-white/60">
                  {photoCreditLabel}{" "}
                  <a
                    href={item.url_external}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-all duration-150 hover:underline"
                    style={{ color: linkActiveColor }}
                  >
                    {item.photographer}
                  </a>
                </p>
              </figcaption>
            </figure>
          );
        })}
      </section>
    </div>
  );
}
