# Component Template

Every normal component is rewritten to this spec. The goal: a clean, single-structure component that contains only what it is meant to show, with all content and colors controlled by props.

## 1. Structure

1. One `.jsx` file with one default export, named in PascalCase after the final slug.
2. Keep `"use client"` when the component uses hooks or browser APIs.
3. Tailwind only. Custom CSS only where Tailwind cannot do it (keyframes, shaders, pseudo-element tricks), kept in a template literal inside the file.
4. The root element accepts a `className` prop and applies it.
5. Font is inherited from the host. No font imports, no font props, no remote font links.
6. Every listener, observer, timeline, ticker, animation frame, and library instance is cleaned up on unmount.
7. Global side effects (body styles, smooth scroll, window listeners) are reset on unmount.
8. Heavy dependencies are dynamic-imported. Dependencies are npm packages only.
9. No code comments.
10. Rewrites are surgical. Keep the original layout and animation logic. Change only what these rules require.

## 2. Props

1. All visible text, links, image sources, and alt text are props with defaults.
2. Repeating content is an array prop of objects.
3. Colors that affect the look are props with sensible defaults.
4. No dark or light mode logic inside the component. The host controls the theme through color props.
5. Props have clear camelCase names and every default renders a complete, good looking component.

## 3. Cleanup checklist

Remove the following when present and not part of what the component is meant to do:

1. Author credits, "made by" links, source site mentions, tutorial notes, demo page titles
2. Logos, brand names, social links
3. Placeholder headers, navbars, footers, hero text, or other sections around the component
4. Dummy content above or below the component
5. Empty spacer blocks and oversized margins or padding that exist only to make a demo page scroll
6. Demo-only controls (theme switchers, debug panels, FPS counters)
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

## 6. Run note

Each run writes a short note into the state file with:

1. Renames as `old name -> new name`
2. Anything removed under the cleanup checklist that was ambiguous
3. Anything kept that looks unusual but was needed

The review app shows the note next to the diff.

## 7. React Bits components

1. Never rewritten and never renamed. The output file is a byte copy of the source.
2. Analyze only: write the metadata JSON from the existing code and props.
3. Props are documented as they exist. The "all text as props" rule is not applied.
4. `fixed` lists any hardcoded behavior, global effects, and required setup.