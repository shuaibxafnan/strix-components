"use client";

import { useEffect, useState } from "react";

export default function UserFilterPanel({
  panelTitle = "Directory",
  panelSubtitle = "Active network profiles",
  cardBg = "#0B0B0F",
  inputBg = "rgba(255,255,255,0.03)",
  accentColor = "#F5F5F7",
  listHeight = "400px",
  apiResultsCount = 50,
  searchPlaceholder = "Search profiles...",
  emptyText = "No active profiles match your query",
  className = "",
}) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let googleFontLink = null;
    if (!document.querySelector('link[href*="fonts.googleapis"]')) {
      googleFontLink = document.createElement("link");
      googleFontLink.rel = "stylesheet";
      googleFontLink.href =
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap";
      document.head.appendChild(googleFontLink);
    }
    let cancelled = false;

    async function fetchUserData() {
      try {
        const res = await fetch(
          `https://randomuser.me/api?results=${apiResultsCount}`,
        );
        const data = await res.json();
        if (!cancelled) setUsers(data.results || []);
      } catch (error) {
        console.error("[UserFilterPanel] API data link broken:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchUserData();
    return () => {
      cancelled = true;
      if (googleFontLink) googleFontLink.remove();
    };
  }, [apiResultsCount]);

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
    const location =
      `${user.location.city} ${user.location.country}`.toLowerCase();
    const query = searchTerm.toLowerCase();

    return fullName.includes(query) || location.includes(query);
  });

  return (
    <div
      className={`w-full h-screen flex items-center justify-center font-['Plus_Jakarta_Sans',_sans-serif] selection:bg-white/20 ${className}`}
    >
      <div
        style={{ backgroundColor: cardBg }}
        className="w-full max-w-[400px] rounded-3xl relative border border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl mx-4"
      >
        <div className="flex flex-col p-8 gap-8">
                    <div className="flex flex-col gap-1">
            <h2
              style={{ color: accentColor }}
              className="text-2xl font-light tracking-tight"
            >
              {panelTitle}
            </h2>
            <p className="text-xs text-white/40 font-medium tracking-wide uppercase">
              {panelSubtitle}
            </p>
          </div>

                    <div className="relative group">
            <input
              type="text"
              placeholder={searchTerm ? "" : searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: inputBg }}
              className="w-full font-light text-sm text-white/90 border border-white/[0.05] rounded-xl p-[14px_18px_14px_44px] transition-all duration-300 focus:outline-none focus:border-white/20 focus:bg-white/[0.05]"
            />
                        <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 transition-colors group-focus-within:text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

                <ul
          style={{ height: listHeight }}
          className="list-none overflow-y-auto px-2 flex flex-col gap-1.5 overflow-x-hidden [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 transition-all"
        >
          {isLoading ? (
            <div className="w-full h-32 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user, idx) => (
              <li
                key={user.login?.uuid || idx}
                className="flex items-center p-3 rounded-xl border border-transparent hover:border-white/[0.04] hover:bg-white/[0.02] transition-all duration-200 group cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.picture.large}
                    alt={user.name.first}
                    className="rounded-full object-cover h-11 w-11 border border-white/[0.08] filter grayscale-[25%] group-hover:grayscale-0 transition-all duration-300"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B0B0F] ring-1 ring-emerald-500/30" />
                </div>
                <div className="ml-4 flex-grow min-w-0">
                  <h4
                    style={{ color: accentColor }}
                    className="m-0 text-[14px] font-medium tracking-wide truncate group-hover:translate-x-0.5 transition-transform duration-200"
                  >
                    {user.name.first} {user.name.last}
                  </h4>
                  <p className="text-[11px] m-0 text-white/40 tracking-normal truncate mt-0.5">
                    {user.location.city}, {user.location.country}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center px-4">
              <p className="m-0 text-xs text-white/30 tracking-wide font-light">
                {emptyText}
              </p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
