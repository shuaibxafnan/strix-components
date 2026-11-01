# Component Template

Every normal component is rewritten to this spec. The goal: a clean, single-structure component that contains only what it is meant to show, with all content and colors controlled by props.

## 1. Structure

1. One `.jsx` file with one default export, named in PascalCase after the final slug.
2. Keep `"use client"` when the component uses hooks or browser APIs.
3. Tailwind only. Custom CSS only where Tailwind cannot do it (keyframes, shaders, pseudo-element tricks), kept in a template literal inside the file.
4. The root element accepts a `className` prop and applies it.
5. Keep font imports (for example Google Fonts links) that the component needs to render correctly. Do not add font imports or font props to components that do not have them.
6. Every listener, observer, timeline, ticker, animation frame, and library instance is cleaned up on unmount.
7. Global side effects (body styles, smooth scroll, window listeners) are reset on unmount.
8. Heavy dependencies are dynamic-imported. Dependencies are npm packages only, and every one the component needs is required and listed in the JSON `dependencies`. Never add an optional or fallback path for a missing package.
9. No code comments.
10. Rewrites are surgical. Keep the original layout and animation logic. Change only what these rules require.

## 2. Props

1. All visible text, links, image sources, and alt text are props with defaults.
2. Repeating content is an array prop of objects.
3. Colors that affect the look are props with sensible defaults.
4. Keep dark and light mode logic or toggles that are already part of the component. Do not add theme logic to components that do not have it. The host controls the theme through color props.
5. Props have clear camelCase names and every default renders a complete, good looking component.

## 3. Cleanup checklist

Remove the following when present and not part of what the component is meant to do:

1. Author credits, "made by" links, source site mentions, tutorial notes, demo page titles
2. Logos, brand names, social links
3. Placeholder headers, navbars, footers, hero text, or other sections around the component
4. Dummy content above or below the component
5. Empty spacer blocks and oversized margins or padding that exist only to make a demo page scroll. Exception: keep spacers the effect needs for its scroll range (pinned sections, scroll-linked animations) and list them under `fixed` in the JSON.
6. Demo-only controls (theme switchers, debug panels, FPS counters). Style switchers become the `variant` prop, see section 9.
7. Unused imports, state, refs, functions, and dead code
8. Hardcoded copy that belongs in props

Keep rule: if removing something changes what the component does when dropped into a page, keep it. If it only existed to make the demo look like a full page, remove it. Anything ambiguous that was removed goes into the run note.

## 4. Naming

1. Name by what the component does or looks like, in 2 to 4 words that someone searching for it would use. Examples: `ArchScroll`, `MagneticButton`, `ImageTrailCursor`, `GlassNavbar`.
2. Keep the existing name if it is already clear. Rename only when it is vague, cryptic, or breaks the rules below.
3. Never include author or brand names, source site names (Codrops, CodePen), demo numbers (`Demo3`, `Test2`), version words (`New`, `Final`, `V2`), or generic words alone (`Component`, `Section`, `Main`, `Index`).
4. Forms from one name: component and file in PascalCase (`ImageTrailCursor.jsx`), slug in kebab-case (`image-trail-cursor`), JSON `name` in plain words ("Image Trail Cursor").
5. The slug must be unique across all state files and the published index. On a collision, add a word describing the visual or behavior difference (`radial`, `split`, `glass`). Never add a number.
6. The name is decided on the first rewrite and stays fixed on retries unless the reviewer's comment asks for a different name.
7. React Bits components are never renamed. Their file and slug stay as they are. Only the JSON `name` is written in plain words.

## 5. Metadata JSON

1. Must validate against `schema/metadata.schema.json`.
2. Build `contents`, `behavior`, `editableByProps`, `needsCodeEdit`, and `fixed` from the final code, never from the component name.
3. Every entry in `props` must exist in the component's signature with the same default.
4. Every `needsCodeEdit.where` must point to something that exists in the file (a class, constant, block, or function).
5. Global side effects, takeover of page scrolling, and body or document changes always go in `fixed`.
6. `mood` has at most 5 tags, `industries` at most 6. No filler.
7. `isReactBits` is injected by the intake script. Do not decide it.
8. `variants` is optional. See section 9.

## 6. Run note

Each run writes a short note into the state file with:

1. Renames as `old name -> new name`
2. Anything removed under the cleanup checklist that was ambiguous
3. Anything kept that looks unusual but was needed
4. Frame added or removed (section 8)
5. Variants created, as "variants: a, b, c" (section 9)
6. Responsive result (section 10)

The review app shows the note next to the diff.

## 7. React Bits components

1. Never rewritten and never renamed. The output file is a byte copy of the source.
2. Analyze only: write the metadata JSON from the existing code and props.
3. Props are documented as they exist. The "all text as props" rule is not applied.
4. `fixed` lists any hardcoded behavior, global effects, and required setup.

## 8. Frame rule

Components must render correctly when placed alone in an empty page, with no wrapper written by the user.

1. Decide by purpose. Section-like or full-width components (heroes, navbars, scroll sections, sliders, galleries, backgrounds) get no frame. Isolated elements that only looked right in a full-screen centered demo (buttons, cards, loaders, text effects, cursor effects, small widgets) get a frame.
2. Test: if the source demo placed the component inside a full-screen centered container (on body, #root, or a wrapper div) and the component would sit off-center or collapse without it, include the frame in the component.
3. The frame is the root element itself: `w-full h-screen flex items-center justify-center`, with the `className` prop merged after it. Never add a second wrapper div.
4. Carry over only sizing and centering. Drop demo backgrounds, padding, and extra heights from the old wrapper.
5. Record it in the JSON `fixed` list: "Root fills the viewport height and centers its content. Override with className using an important modifier such as !h-auto."
6. No frame for components that already position themselves (fixed, absolute, pinned, or full-bleed).
7. React Bits components are never reframed.

## 9. Variants

1. Applies only when the source already shows more than one style, layout, or mode of the same component (a demo with a switcher, several layouts in one file, style flags). Expect it for roughly 10 to 15 components. Never invent variants and never merge separate components into one.
2. Control it with one string prop named `variant`. For React Bits, keep the existing prop name. The default is the style the source showed first. An unknown value falls back to the default.
3. Remove demo-only switcher UI (buttons, tabs, dropdowns that existed just to change style). The choice is made through the prop.
4. Each variant keeps its own animation and layout logic from the source. Share code only where the source already shared it.
5. Add the prop to `props` with the type written as a union of the option values.
6. Add the `variants` block to the JSON with `prop`, `default`, and for each option `value`, `look`, and `useWhen`. `useWhen` names a concrete page scenario the site builder can match, never a restatement of the look.
7. If there is more than one independent style axis, put the main axis in `variants` and describe the others under `editableByProps`.
8. Components without variants omit the `variants` field entirely.

## 10. Responsive

1. Every component must work on mobile (360px and up), tablet, and desktop, with no horizontal page overflow and no overlapping or clipped content.
2. Most components already do. Check the source first. If it already handles all sizes, change nothing.
3. If it does not, fix it surgically with Tailwind breakpoint prefixes, fluid sizing (w-full, max-w, clamp, vw and vh units, aspect ratio), wrapping flex and grid, and scaled typography. Keep the desktop appearance unchanged.
4. For canvas, WebGL, or JS-measured layouts: size from the container or window, handle resize, and clean up the listener on unmount.
5. Hover-only interactions need a touch equivalent (tap, or a no-hover fallback) when the component would be unusable on touch. Keep the desktop behavior.
6. If a component cannot reasonably work at small sizes, say so in the JSON `fixed` list.
7. Report it in the run note: "responsive: already ok" or what was changed.
8. React Bits components are never changed. If their JSON analysis shows a responsiveness limit, record it in `fixed`.