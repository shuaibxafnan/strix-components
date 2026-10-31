# Component Pipeline

This folder processes React + Tailwind components into clean, described, reviewable artifacts. Source files are never edited. Output goes to `pipeline/out/`. All commands run from the repo root.

## Read first
- `pipeline/template/TEMPLATE.md`: all rules for rewriting, naming, cleanup, frame, variants, and JSON
- `pipeline/schema/metadata.schema.json`: the JSON must validate against this
- `pipeline/config.json`: categories, sections, retry cap, batch size, run limit
- `pipeline/template/gold/ArchScroll.jsx` and `ArchScroll.json`: the reference result

## Source layout
- Normal components: `src/app/components/*.jsx`, single files
- React Bits components: `src/app/components/bits/<subfolder>/*.jsx`, subfolders `animations`, `micro`, `background`, `components`, `text-animations`
- A component is React Bits when its path contains `components/bits/`. Never decide this yourself. It is stored as `isReactBits` in the state file.

## State files
One file per component: `pipeline/state/<sourceSlug>.json`. `sourceSlug` is the kebab-case source filename and never changes.

```json
{
  "sourceSlug": "foo-demo3",
  "sourcePath": "src/app/components/foo_demo3.jsx",
  "sourceHash": "sha256",
  "isReactBits": false,
  "bitsFolder": null,
  "slug": "",
  "nameLocked": false,
  "status": "rewrite_queued",
  "attempt": 0,
  "comments": [],
  "note": "",
  "updatedAt": ""
}
```

Statuses: `rewrite_queued`, `analyze_queued`, `retry_requested`, `in_progress`, `in_review`, `gate_failed`, `needs_manual`, `published`, `dropped`.

## Who does what
- Scripts own all state changes. Agents never edit status fields by hand. Use:
  - `node pipeline/scripts/state.mjs list <status...>`
  - `node pipeline/scripts/state.mjs get <sourceSlug>`
  - `node pipeline/scripts/state.mjs start <sourceSlug>` (sets `in_progress`)
  - `node pipeline/scripts/state.mjs finish <sourceSlug> --slug <slug> --note "<text>"` (runs gates, sets `in_review` or `gate_failed`)
  - `node pipeline/scripts/state.mjs reset-stale --force yes` (requeues leftovers from a dead session)
- `node pipeline/scripts/strip-comments.mjs <src> <dst>` writes a comment-free copy to read. It throws if the code would change. If it throws, read the original file.
- `node pipeline/scripts/gates.mjs <slug>` runs compile, template, and schema checks. Run it after writing outputs.
- Never touch: `src/`, `state/` status fields, `pipeline/review-app/`, anything under `published`.
- Never run publish, never push to R2, never use any API key.

## Processing loop
The loop lives in `.claude/commands/process.md`. Follow it exactly.

## Retries
- `attempt` is incremented by the review app, not by you.
- For `retry_requested`, read the latest entry in `comments`, the previous `out/<slug>/<slug>.jsx`, and the source. Make a targeted edit to the previous version. Do not rewrite from scratch.
- Keep the same slug unless the comment asks for a different name.
- Bits retries regenerate the JSON only.

## Style of work
- Surgical: keep original animation and layout logic.
- No code comments in any output.
- Be terse in notes. Facts only.
- If the source cannot be made to meet the template without changing what it does, set a clear note and stop. Do not invent behavior.