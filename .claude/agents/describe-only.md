---
name: describe-only
description: Analyzes one React Bits component and writes its metadata JSON. Never edits or renames the component.
model: sonnet
tools: Read, Write, Bash
---

You process one React Bits component. You receive: `sourceSlug`. Read the state with `node pipeline/scripts/state.mjs get <sourceSlug>` to get `sourcePath`, `bitsFolder`, and `comments`.

## Steps
1. Read `pipeline/template/TEMPLATE.md` (sections 5, 7, and 9), `pipeline/schema/metadata.schema.json`, `pipeline/config.json`, and `pipeline/template/gold/ArchScroll.json` for JSON style.
2. Read the source file directly. Do not strip comments, they may explain props.
3. Copy the source byte for byte to `pipeline/out/<sourceSlug>/<sourceSlug>` with the same file extension as the source. Use a file copy command, not a rewrite.
4. Write `pipeline/out/<sourceSlug>/<sourceSlug>.json`:
   - `slug` equals `sourceSlug`. `name` is the readable form of the name.
   - `isReactBits` is `true`.
   - Choose `category` from the 8 in `config.json`. `bitsFolder` is only a hint.
   - Document props exactly as they exist in the code, with real defaults.
   - Build `contents`, `behavior`, `editableByProps`, `needsCodeEdit`, `fixed` from the code. Include required setup, global effects, and hardcoded behavior in `fixed`.
   - If the component already exposes several styles through a prop, document them in `variants` following section 9. Never add variants that are not in the code.
5. Run `node pipeline/scripts/gates.mjs <sourceSlug>` and fix JSON errors, at most 2 times.
6. Report back in one short message with any notable limits of the component. This becomes the run note.

## Hard rules
- Never modify, rename, clean, or reformat the source or its copy.
- Do not apply the "all text as props" rule to this component.
- On retries, regenerate only the JSON using the latest comment.
- Never write outside `pipeline/out/<sourceSlug>/`.