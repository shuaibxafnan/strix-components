"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── SidebarTree ─────────────────────────────────────────────────────────────
//
// Props
// ──────────────────────────────────────────────────────────────────────────
// data         object    TREE_DATA    Navigation tree data structure
// duration     number    0.26         Expand/collapse animation duration (s)
// opacity      number    0.4          Collapsed group opacity
// blur         number    10           Collapsed group blur (px)
// translate    number    12           Collapsed group translate (px)
// ──────────────────────────────────────────────────────────────────────────

// ── Tree data ────────────────────────────────────────────────────────────────
const TREE_DATA = {
  label: "Mythical University",
  groups: [
    {
      items: [
        { id: "home", label: "Home", href: "#home", current: true },
        { id: "what", label: "What this is", href: "#what" },
      ],
    },
    {
      items: [
        {
          id: "about",
          label: "About",
          href: "#about",
          items: [
            { id: "overview", label: "Overview", href: "#overview" },
            {
              id: "administration",
              label: "Administration",
              href: "#administration",
            },
            {
              id: "facts",
              label: "Facts",
              href: "#facts",
              items: [
                { id: "history", label: "History", href: "#history" },
                {
                  id: "current-statistics",
                  label: "Current Statistics",
                  href: "#current-statistics",
                },
                { id: "awards", label: "Awards", href: "#awards" },
              ],
            },
            {
              id: "campus-tours",
              label: "Campus Tours",
              href: "#campus-tours",
              items: [
                {
                  id: "prospective-students",
                  label: "For Prospective Students",
                  href: "#prospective-students",
                },
                { id: "alumni", label: "For Alumni", href: "#alumni" },
                { id: "visitors", label: "For Visitors", href: "#visitors" },
              ],
            },
          ],
        },
        {
          id: "admissions",
          label: "Admissions",
          href: "#admissions",
          items: [
            { id: "apply", label: "Apply", href: "#apply" },
            {
              id: "tuition",
              label: "Tuition",
              href: "#tuition",
              items: [
                {
                  id: "undergraduate",
                  label: "Undergraduate",
                  href: "#undergraduate",
                },
                { id: "graduate", label: "Graduate", href: "#graduate" },
                {
                  id: "professional-schools",
                  label: "Professional Schools",
                  href: "#professional-schools",
                },
              ],
            },
            { id: "sign-up", label: "Sign Up", href: "#sign-up" },
            { id: "visit", label: "Visit", href: "#visit" },
            { id: "photo-tour", label: "Photo Tour", href: "#photo-tour" },
            { id: "connect", label: "Connect", href: "#connect" },
          ],
        },
        {
          id: "academics",
          label: "Academics",
          href: "#academics",
          items: [
            {
              id: "colleges-schools",
              label: "Colleges & Schools",
              href: "#colleges-schools",
            },
            {
              id: "programs-of-study",
              label: "Programs of Study",
              href: "#programs-of-study",
            },
            {
              id: "honors-programs",
              label: "Honors Programs",
              href: "#honors-programs",
            },
            {
              id: "online-courses",
              label: "Online Courses",
              href: "#online-courses",
            },
            {
              id: "course-explorer",
              label: "Course Explorer",
              href: "#course-explorer",
            },
            {
              id: "register-for-classes",
              label: "Register for Classes",
              href: "#register-for-classes",
            },
            {
              id: "academic-calendar",
              label: "Academic Calendar",
              href: "#academic-calendar",
            },
            { id: "transcripts", label: "Transcripts", href: "#transcripts" },
          ],
        },
      ],
    },
  ],
};

// ── Tree node component ───────────────────────────────────────────────────────
function TreeItem({
  item,
  level,
  setSize,
  posInSet,
  currentId,
  onActivate,
  onToggle,
  expandedIds,
  searchState,
}) {
  const hasChildren = item.items && item.items.length > 0;
  const isExpanded = expandedIds.has(item.id);
  const isCurrent = currentId === item.id;
  const itemId = `tree-item-${item.id}`;
  const groupId = hasChildren ? `tree-group-${item.id}` : null;

  const searchMatch = searchState.filtering && searchState.matches.has(item.id);
  const searchRelated =
    searchState.filtering && searchState.related.has(item.id);
  const searchFiltered =
    searchState.filtering && !searchMatch && !searchRelated;

  return (
    <li role="none">
      <a
        id={itemId}
        role="treeitem"
        href={item.href || "#"}
        tabIndex={isCurrent ? 0 : -1}
        aria-level={level}
        aria-setsize={setSize}
        aria-posinset={posInSet}
        aria-current={isCurrent ? "page" : undefined}
        aria-expanded={hasChildren ? String(isExpanded) : undefined}
        aria-owns={groupId || undefined}
        data-search-match={searchMatch ? "true" : undefined}
        data-search-related={searchRelated ? "true" : undefined}
        data-filtered={searchFiltered ? "true" : undefined}
        onClick={(e) => {
          const icon = e.target.closest(".tree-icon");
          if (icon && hasChildren) {
            e.preventDefault();
            onToggle(item.id);
          } else if (!icon) onActivate(item.id);
        }}
        className="tree-item-link"
      >
        <span style={{ flex: 1 }}>{item.label}</span>
        {hasChildren && (
          <span
            className="tree-icon"
            aria-hidden="true"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(item.id);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </span>
        )}
      </a>

      {hasChildren && (
        <div
          className="tree-expand-wrapper"
          {...(!isExpanded ? { inert: true } : {})}
        >
          <ul id={groupId} role="group">
            {item.items.map((child, idx) => (
              <TreeItem
                key={child.id}
                item={child}
                level={level + 1}
                setSize={item.items.length}
                posInSet={idx + 1}
                currentId={currentId}
                onActivate={onActivate}
                onToggle={onToggle}
                expandedIds={expandedIds}
                searchState={searchState}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SidebarTree({
  data = TREE_DATA,
  duration = 0.26,
  opacity = 0.4,
  blur = 10,
  translate = 12,
}) {
  const treeRef = useRef(null);
  const searchRef = useRef(null);
  const [currentId, setCurrentId] = useState(() => {
    const findCurrent = (items) => {
      for (const item of items) {
        if (item.current) return item.id;
        if (item.items) {
          const found = findCurrent(item.items);
          if (found) return found;
        }
      }
      return null;
    };
    const allItems = data.groups.flatMap((g) => g.items);
    return findCurrent(allItems) ?? allItems[0]?.id ?? null;
  });
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [searchState, setSearchState] = useState({
    filtering: false,
    matches: new Set(),
    related: new Set(),
  });

  // ── helpers ─────────────────────────────────────────────────────────────────
  const getAllItems = useCallback((items, result = []) => {
    items.forEach((item) => {
      result.push(item);
      if (item.items) getAllItems(item.items, result);
    });
    return result;
  }, []);

  const allItems = getAllItems(data.groups.flatMap((g) => g.items));

  const getVisibleItems = useCallback(() => {
    const walk = (items) => {
      const result = [];
      items.forEach((item) => {
        result.push(item.id);
        if (item.items && expandedIds.has(item.id))
          result.push(...walk(item.items));
      });
      return result;
    };
    return walk(data.groups.flatMap((g) => g.items));
  }, [expandedIds, data]);

  const getAncestors = useCallback((targetId, items, path = []) => {
    for (const item of items) {
      if (item.id === targetId) return path;
      if (item.items) {
        const found = getAncestors(targetId, item.items, [...path, item.id]);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const toggleExpanded = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const activateItem = useCallback(
    (id) => {
      setCurrentId(id);
      // expand ancestors
      const ancestors = getAncestors(
        id,
        data.groups.flatMap((g) => g.items),
      );
      if (ancestors?.length) {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          ancestors.forEach((a) => next.add(a));
          return next;
        });
      }
    },
    [getAncestors, data],
  );

  // ── keyboard navigation ──────────────────────────────────────────────────────
  const handleKeydown = useCallback(
    (e) => {
      const el = e.target.closest("[role='treeitem']");
      if (!el) return;
      const itemId = el.id.replace("tree-item-", "");
      const visible = getVisibleItems();
      const idx = visible.indexOf(itemId);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (idx < visible.length - 1) focusById(visible[idx + 1]);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (idx > 0) focusById(visible[idx - 1]);
          break;
        case "ArrowRight":
          e.preventDefault();
          {
            const item = allItems.find((i) => i.id === itemId);
            if (item?.items) {
              if (!expandedIds.has(itemId)) toggleExpanded(itemId);
              else if (item.items[0]) focusById(item.items[0].id);
            }
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          {
            if (expandedIds.has(itemId)) {
              toggleExpanded(itemId);
              break;
            }
            const ancestors = getAncestors(
              itemId,
              data.groups.flatMap((g) => g.items),
            );
            if (ancestors?.length) focusById(ancestors[ancestors.length - 1]);
          }
          break;
        case "Home":
          e.preventDefault();
          focusById(visible[0]);
          break;
        case "End":
          e.preventDefault();
          focusById(visible[visible.length - 1]);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          activateItem(itemId);
          break;
        default:
          if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
            e.preventDefault();
            const char = e.key.toLowerCase();
            const from = idx + 1;
            const search = [...visible.slice(from), ...visible.slice(0, from)];
            const match = search.find((id) => {
              const i = allItems.find((x) => x.id === id);
              return i?.label.toLowerCase().startsWith(char);
            });
            if (match) focusById(match);
          }
      }
    },
    [
      getVisibleItems,
      expandedIds,
      allItems,
      toggleExpanded,
      activateItem,
      getAncestors,
      data,
    ],
  );

  const focusById = (id) => {
    const el = document.getElementById(`tree-item-${id}`);
    if (!el) return;
    treeRef.current
      ?.querySelectorAll("[role='treeitem']")
      .forEach((e) => e.setAttribute("tabindex", "-1"));
    el.setAttribute("tabindex", "0");
    el.focus();
  };

  // ── search ───────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (value) => {
      setSearchTerm(value);
      const term = value.trim().toLowerCase();
      if (!term || term.length < 3) {
        setSearchState({
          filtering: false,
          matches: new Set(),
          related: new Set(),
        });
        return;
      }
      const matches = new Set();
      const related = new Set();
      const toExpand = new Set();

      allItems.forEach((item) => {
        if (item.label.toLowerCase().includes(term)) {
          matches.add(item.id);
          const ancestors = getAncestors(
            item.id,
            data.groups.flatMap((g) => g.items),
          );
          ancestors?.forEach((a) => {
            related.add(a);
            toExpand.add(a);
          });
          if (item.items)
            getAllItems(item.items).forEach((d) => related.add(d.id));
        }
      });

      setExpandedIds((prev) => {
        const next = new Set(prev);
        toExpand.forEach((id) => next.add(id));
        return next;
      });
      setSearchState({ filtering: true, matches, related });
    },
    [allItems, getAncestors, getAllItems, data],
  );

  // "/" shortcut
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (
        e.key === "/" &&
        !["input", "textarea", "select"].includes(tag) &&
        !e.target.isContentEditable
      ) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@400;500&display=swap');

        .sidebar-root {
          --border-color: rgba(0,0,0,0.2);
          --focus-color: hsl(0 90% 66%);
          --duration: ${duration};
          --opacity: ${opacity};
          --blur: ${blur};
          --translate: ${translate};
        }

        /* expand/collapse grid animation */
        .tree-expand-wrapper {
          display: grid;
          grid-template-rows: 1fr;
          transition: grid-template-rows calc(var(--duration) * 1s) ease-out;
          overflow: hidden;
        }
        .tree-expand-wrapper[inert] { grid-template-rows: 0fr; }
        .tree-expand-wrapper > ul    { min-height: 0; }

        [inert] > [role="group"] {
          opacity: var(--opacity);
          translate: 0 calc(var(--translate) * 1px);
          filter: blur(calc(var(--blur) * 1px));
        }
        [role="group"] {
          transition-property: translate, opacity, filter;
          transition-duration: calc(var(--duration) * 1s);
          transition-timing-function: ease-in-out;
          translate: 0 0; filter: blur(0px); opacity: 1;
        }

        /* nested indent + vertical line */
        .sidebar-root li > div ul[role="group"] {
          margin-left: 1rem;
          position: relative;
        }
        .sidebar-root li > div ul[role="group"] > li:first-of-type { margin-top: .5rem; }
        .sidebar-root li > div ul[role="group"] > li:last-of-type  { margin-bottom: .5rem; }
        .sidebar-root li > div ul[role="group"]::before {
          content: '';
          position: absolute;
          left: 0; top: .5rem; bottom: .5rem;
          width: 2px;
          background: rgba(0,0,0,0.15);
        }

        /* tree item link */
        .tree-item-link {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          padding: 0.25rem 0.75rem;
          line-height: 1.6;
          width: 100%;
          gap: 0.5rem;
          position: relative;
        }
        .tree-item-link:hover { color: hsl(0 0% 20%); }
        .tree-item-link:focus {
          outline: none;
          color: hsl(0 0% 20%);
          background-color: rgba(234,57,57,0.08);
        }
        .tree-item-link[aria-current="page"] { color: #000; }
        .tree-item-link[aria-current="page"]::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--focus-color);
        }
        .tree-item-link[aria-current="page"][aria-level="1"]::before { left: 2px; }
        .tree-item-link[aria-expanded="true"] .tree-icon svg { rotate: 135deg; }

        /* tree icon */
        .tree-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; cursor: pointer; border-radius: 4px;
        }
        .tree-icon:hover { background-color: rgba(0,0,0,0.06); }
        .tree-icon svg { width: 16px; transition: rotate 0.26s ease-out; }

        /* search states */
        ul[role="tree"][data-filtering="true"] .tree-item-link { opacity: 0.6; }
        ul[role="tree"][data-filtering="true"] .tree-item-link[data-search-match="true"] {
          opacity: 1;
          color: #000;
          background-color: rgba(234,57,57,0.25);
        }
        ul[role="tree"][data-filtering="true"] .tree-item-link[data-search-related="true"] {
          opacity: 1;
          color: hsl(0 0% 20%);
          background-color: rgba(234,57,57,0.1);
        }
        ul[role="tree"][data-filtering="true"] .tree-item-link:focus { opacity: 1; }

        /* search input */
        .tree-search-input {
          width: 100%;
          line-height: 2;
          border: 2px solid var(--border-color);
          border-radius: 2px;
          font-size: inherit;
          background: #f9f9f9;
          color: #111;
          padding-left: 26px;
          padding-right: 28px;
        }
        .tree-search-input::selection { background: var(--focus-color); color: #fff; }
        .tree-search-input:focus-visible { outline: none; border-color: var(--focus-color); }
        .tree-search-input::placeholder { color: #aaa; }

        /* scrollbar */
        .tree-scroll {
          scrollbar-color: rgba(234,57,57,0.4) transparent;
        }

        /* bear link */
        .bear-link {
          color: #111;
          position: fixed;
          top: 1rem; left: 1rem;
          width: 48px;
          aspect-ratio: 1;
          display: grid;
          place-items: center;
          opacity: 0.8;
        }
        .bear-link:is(:hover,:focus-visible) { opacity: 1; }
        .bear-link svg { width: 75%; }
      `}</style>

      {/* page */}
      <div className="grid place-items-center min-h-screen bg-white font-[SF_Pro_Text,Helvetica,Arial,sans-serif]">
        {/* resize container */}
        <div
          className="overflow-hidden resize-y p-8 min-h-[400px] max-h-[80vh] sidebar-root"
          style={{ height: 600 }}
        >
          <aside
            className="min-w-[250px] rounded-[12px] border-2 h-full text-[.875rem] grid"
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.85)",
              gridTemplateRows: "auto 1fr",
              fontFamily: "'Noto Sans Mono', monospace",
              color: "hsl(0 0% 54%)",
            }}
          >
            {/* header */}
            <header
              className="p-2 grid gap-2 border-b-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              <h1 className="text-[.875rem] m-0">
                <a
                  href="#"
                  className="py-2 pl-[2px] flex items-center gap-2 no-underline"
                  style={{
                    color: "hsl(0 0% 40%)",
                    outlineColor: "var(--focus-color)",
                  }}
                >
                  {/* logo svg */}
                  <svg
                    className="w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m3.98448 20.5882-1.17645 1.6174m-.22047-1.3969 1.61739 1.1764M22.144.730378 20.6832 2.09646m.0474-1.413417 1.366 1.460757"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m3.90821 18.5526-.59559.0726c.03203.2626.23224.4732.49285.5185l.10274-.5911ZM20.601 4.22249l.3908.45525c.1679-.14415.2428-.36902.195-.58508-.0479-.21606-.2109-.38822-.424-.44793l-.1618.57776Zm.6023-.00906c-.0066-.33131-.2805-.59453-.6118-.58794-.3313.0066-.5945.28052-.5879.61183l1.1997-.02389Zm-.2556 17.30047-.1028.5911c.1766.0307.3576-.0191.4935-.1358.136-.1168.2127-.2881.2091-.4673l-.5998.012ZM3.03505 11.3945l-.39082-.4552c-.15222.1306-.22906.3287-.20477.5279l.59559-.0727ZM13.8216 1.69999c-.3191-.0894-.6502.0968-.7396.41588-.0894.31909.0968.65023.4159.73963l.3237-1.15551ZM4.29903 19.0078 20.9918 4.67774l-.7816-.91051L3.51739 18.0973l.78164.9105ZM20.0036 4.23732l.3442 17.28848 1.1997-.0239-.3442-17.28847-1.1997.02389ZM3.80547 19.1437 20.8449 22.105l.2055-1.1823-17.03946-2.9613-.20547 1.1823Zm-.3796-7.2939L14.0485 2.73064l-.7816-.91052L2.64423 10.9393l.78164.9105Zm1.07792 6.6301-.87316-7.158-1.19117.1453.87316 7.158 1.19117-.1453ZM20.7628 3.64473l-6.9412-1.94474-.3237 1.15551 6.9412 1.94474.3237-1.15551Z"
                      fill="currentColor"
                    />
                    <path
                      d="m15.7227 7.75 4.9996 13.5001M8.13672 14.2656 20.724 21.2521"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M7.0673 8.29748c-.11208-.31184-.45574-.47378-.76758-.36169-.31184.11208-.47377.45574-.36169.76758l1.12927-.40589Zm2.05515 5.71782L7.0673 8.29748l-1.12927.40589 2.05515 5.71783 1.12927-.4059Z"
                      fill="currentColor"
                    />
                    <path
                      d="m15.6133 8.16406-5.1156-2.66251"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>the craft of ui</span>
                </a>
              </h1>

              {/* search */}
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="absolute top-1/2 left-2 -translate-y-1/2 w-4 opacity-85 pointer-events-none"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    id="tree-search"
                    placeholder="search..."
                    aria-label="Filter navigation tree"
                    className="tree-search-input"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        handleSearch("");
                        setSearchTerm("");
                      }
                    }}
                  />
                  <kbd
                    className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-[.625rem] rounded-[2px] grid place-items-center"
                    style={{
                      border: "1px solid var(--border-color)",
                      background: "rgba(0,0,0,0.08)",
                      color: "#555",
                    }}
                  >
                    /
                  </kbd>
                </div>
              </form>
            </header>

            {/* nav */}
            <nav aria-label={data.label} className="overflow-hidden">
              <div className="h-full">
                <ul
                  ref={treeRef}
                  role="tree"
                  aria-label={data.label}
                  className="list-none m-0 p-0 grid h-full"
                  style={{ gridTemplateRows: "auto 1fr" }}
                  data-filtering={searchState.filtering ? "true" : undefined}
                  onKeyDown={handleKeydown}
                >
                  {data.groups.map((group, gi) => (
                    <li
                      key={gi}
                      role="none"
                      className="tree-group-container"
                      style={{
                        paddingBlock: ".5rem",
                        ...(gi === 0
                          ? { borderBottom: "2px solid var(--border-color)" }
                          : { height: "100%", overflow: "auto" }),
                      }}
                    >
                      <ul
                        role="group"
                        id={`tree-group-toplevel-${gi}`}
                        className="list-none m-0 p-0"
                      >
                        {group.items.map((item, idx) => (
                          <TreeItem
                            key={item.id}
                            item={item}
                            level={1}
                            setSize={group.items.length}
                            posInSet={idx + 1}
                            currentId={currentId}
                            onActivate={activateItem}
                            onToggle={toggleExpanded}
                            expandedIds={expandedIds}
                            searchState={searchState}
                          />
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </aside>
        </div>

        {/* bear link */}
        <a
          aria-label="Follow Jhey"
          className="bear-link"
          href="https://twitter.com/intent/follow?screen_name=jh3yy"
          target="_blank"
          rel="noreferrer noopener"
        >
          <svg
            viewBox="0 0 969 955"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="161.191"
              cy="320.191"
              r="133.191"
              stroke="currentColor"
              strokeWidth="20"
            />
            <circle
              cx="806.809"
              cy="320.191"
              r="133.191"
              stroke="currentColor"
              strokeWidth="20"
            />
            <circle cx="695.019" cy="587.733" r="31.4016" fill="currentColor" />
            <circle cx="272.981" cy="587.733" r="31.4016" fill="currentColor" />
            <path
              d="M564.388 712.083C564.388 743.994 526.035 779.911 483.372 779.911C440.709 779.911 402.356 743.994 402.356 712.083C402.356 680.173 440.709 664.353 483.372 664.353C526.035 664.353 564.388 680.173 564.388 712.083Z"
              fill="currentColor"
            />
            <rect
              x="310.42"
              y="448.31"
              width="343.468"
              height="51.4986"
              fill="#FF1E1E"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M745.643 288.24C815.368 344.185 854.539 432.623 854.539 511.741H614.938V454.652C614.938 433.113 597.477 415.652 575.938 415.652H388.37C366.831 415.652 349.37 433.113 349.37 454.652V511.741L110.949 511.741C110.949 432.623 150.12 344.185 219.845 288.24C289.57 232.295 384.138 200.865 482.744 200.865C581.35 200.865 675.918 232.295 745.643 288.24Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </>
  );
}
