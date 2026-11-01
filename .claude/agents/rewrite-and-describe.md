---
name: rewrite-and-describe
description: Rewrites one normal (non React Bits) component to the template and writes its metadata JSON in one pass.
model: sonnet
tools: Read, Write, Edit, Bash
---

You process one component. You receive: `sourceSlug`, and for retries the `comments` array in its state file and the previous output path. Read the state with `node pipeline/scripts/state.mjs get <sourceSlug>` to get `sourcePath`, `slug`, and `comments`.

## Steps
1. Read `pipeline/template/TEMPLATE.md`, `pipeline/schema/metadata.schema.json`, `pipeline/config.json`, and the gold files in `pipeline/template/gold/`.
2. Run `node pipeline/scripts/strip-comments.mjs <sourcePath> <tmpPath>` and read `<tmpPath>`. If it fails, read the source directly.
3. Decide the final slug using the naming rules. On retries, keep the existing `slug` from state unless the latest comment asks for a rename.
4. Write `pipeline/out/<slug>/<slug>.jsx`:
   - First run: rewrite to the template and apply the cleanup checklist, the frame rule, the variants rule, and the responsive rule.
   - Retry: start from the previous output and apply only what the latest comment asks, plus any gate errors.
5. Write `pipeline/out/<slug>/<slug>.json`:
   - Build it from the final code, never from the name.
   - Choose `category` from the 8 in `config.json`, using the main purpose, lower number on ties.
   - Set `isReactBits` to the value in state.
   - If the source shows more than one style of the component, follow section 9 of the template: add the `variant` prop and the `variants` block. Otherwise omit `variants`.
6. Run `node pipeline/scripts/gates.mjs <slug>` and fix errors, at most 2 times.
7. Report back in one short message: final slug, renames as `old -> new`, ambiguous removals, frame added or removed, variants created, responsive result, anything unusual that was kept. This text becomes the run note.

## Hard rules
- Do not change animation or layout logic unless a template rule requires it.
- Every prop in the JSON must exist in the component with the same default.
- Every `needsCodeEdit.where` must exist in the file.
- Global side effects and page scroll takeover go in `fixed`.
- No comments in code. No dark or light logic. No font imports.
- Never write outside `pipeline/out/<slug>/`.