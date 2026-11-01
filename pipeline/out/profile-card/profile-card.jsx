"use client";

import { useState, useId } from "react";

export default function ProfileCard({
  imageSrc = "https://i.pravatar.cc/400?img=47",
  imageAlt = "Profile photo",
  name = "Sophia Carter",
  bio = "Digital creator, travel storyteller, and coffee enthusiast sharing moments from around the world.",
  followers = "2.4M",
  dark = false,
  initialFollowing = false,
  onFollowChange,
  width = "20rem",
  height = "30rem",
  imageObjectPos = "20% 5%",
  imageHoverPos = "50% 10%",
  borderRadius = "2rem",
  className = "",
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const uid = useId().replace(/:/g, "");

  function handleFollow() {
    const next = !following;
    setFollowing(next);
    onFollowChange?.(next);
  }

  const cardCssVars = dark
    ? {
        "--pc-bg": "#222",
        "--pc-title": "#fff",
        "--pc-title-hover": "#fff",
        "--pc-text": "#ccc",
        "--pc-btn": "#555",
        "--pc-btn-hover": "#444",
      }
    : {
        "--pc-bg": "#fff",
        "--pc-title": "#fff",
        "--pc-title-hover": "#000",
        "--pc-text": "#666",
        "--pc-btn": "#eee",
        "--pc-btn-hover": "#ddd",
      };

  return (
    <div className={`w-full h-screen flex items-center justify-center ${className}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Montserrat:wght@400;700&display=swap');

        .pc-${uid} {
          font-family: Lato, Montserrat, Helvetica, Arial, sans-serif;
          background: var(--pc-bg);
          border-radius: ${borderRadius};
          width: ${width};
          max-width: 100%;
          height: ${height};
        }
        .pc-${uid} .pc-overlay {
          transition: translate 0.25s;
        }
        .pc-${uid}:hover .pc-overlay,
        .pc-${uid}:focus-within .pc-overlay {
          translate: 0 100%;
        }
        .pc-${uid} .pc-img {
          object-position: ${imageObjectPos};
          transition: aspect-ratio 0.25s, object-position 0.5s;
        }
        .pc-${uid}:hover .pc-img,
        .pc-${uid}:focus-within .pc-img {
          aspect-ratio: 1 / 1;
          object-position: ${imageHoverPos};
          transition: aspect-ratio 0.25s, object-position 0.25s;
        }
        .pc-${uid} .pc-name {
          color: var(--pc-title);
          margin-block-end: 1rem;
          transition: color 0.5s, margin-block-end 0.25s, opacity 1s, translate 0.25s;
        }
        .pc-${uid}:hover .pc-name,
        .pc-${uid}:focus-within .pc-name {
          color: var(--pc-title-hover);
          translate: 0 0;
          margin-block-end: 0.5rem;
        }
        .pc-${uid} .pc-bio {
          color: var(--pc-text);
          transition: margin-block-end 0.25s, opacity 1s 0.2s, translate 0.25s 0.2s;
        }
        .pc-${uid}:hover .pc-bio,
        .pc-${uid}:focus-within .pc-bio {
          translate: 0 0;
          opacity: 1;
          margin-block-end: 0.5rem;
        }
        .pc-${uid} .pc-footer {
          transition: translate 0.25s 0.2s, opacity 1s;
        }
        .pc-${uid}:hover .pc-footer,
        .pc-${uid}:focus-within .pc-footer {
          translate: 0 0;
          opacity: 1;
          transition: translate 0.25s 0.25s, opacity 0.5s 0.25s;
        }
        .pc-${uid} .pc-tag {
          color: var(--pc-title-hover);
        }
        .pc-${uid} .pc-btn {
          background: var(--pc-btn);
          color: var(--pc-title-hover);
          transition: background 0.33s;
        }
        .pc-${uid} .pc-btn:hover {
          background: var(--pc-btn-hover);
        }
        .pc-${uid} .pc-btn:focus {
          outline: 2px solid var(--pc-text);
          outline-offset: 2px;
        }
      `}</style>

      <div
        className={`pc-${uid} relative overflow-hidden p-2`}
        style={cardCssVars}
      >
          <div
          className="pc-overlay absolute bottom-2 left-2 w-[calc(100%-1rem)] h-[30%] rounded-b-[1.5rem] backdrop-blur-[1rem] pointer-events-none z-10"
          style={{
            maskImage: "linear-gradient(#0000, #000f 80%)",
            WebkitMaskImage: "linear-gradient(#0000, #000f 80%)",
          }}
        />

          <img
          src={imageSrc}
          alt={imageAlt}
          className="pc-img w-full h-fit aspect-[2/3] object-cover rounded-[1.5rem] block"
        />

          <section className="relative z-20 m-4 flex flex-col">
          <h2 className="pc-name text-2xl font-normal -translate-y-[180%] opacity-100">
            {name}
          </h2>

          <p className="pc-bio text-[0.95rem] leading-[1.3] m-0 opacity-0 translate-y-full">
            {bio}
          </p>

              <div className="pc-footer flex-1 flex items-end justify-between opacity-0">
                  <div
              className="pc-tag self-center flex items-center gap-1 text-sm"
              aria-label={`${followers} followers`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
              {followers}
            </div>

                  <button
              onClick={handleFollow}
              className="pc-btn px-2 rounded-xl relative border border-transparent cursor-pointer"
            >
              {following ? "Unfollow" : "Follow"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
