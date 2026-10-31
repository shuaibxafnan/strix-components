---
description: Process queued components until the queue is empty or the run limit is reached
---

Work from the repo root. Read `pipeline/CLAUDE.md` first.

1. Run `npm ci --prefix pipeline`.
2. Run `node pipeline/scripts/state.mjs reset-stale --force yes`.
3. Read `maxPerRun` from `pipeline/config.json`. Set `done = 0`.
4. Loop:
   a. If arguments were given (`$ARGUMENTS`), treat them as a space-separated list of slugs and take the next one not yet handled in this run, each slug once. Otherwise get the next item with `node pipeline/scripts/state.mjs list retry_requested analyze_queued rewrite_queued` and take the first line. If none remain, go to step 6.
   b. If `done >= maxPerRun`, go to step 6.
   c. `node pipeline/scripts/state.mjs get <slug>` to read `isReactBits`.
   d. `node pipeline/scripts/state.mjs start <slug>`. If it fails because the item is not queued, skip it and continue.
   e. Invoke the subagent `describe-only` if `isReactBits` is true, otherwise `rewrite-and-describe`. Pass only the sourceSlug. Wait for its report.
   f. `node pipeline/scripts/state.mjs finish <slug> --slug <final slug> --note "<report>"`.
   g. `git add pipeline/out pipeline/state`, commit with message `process <slug>`, push.
   h. `done = done + 1`.
5. If any command or tool fails with a rate limit, usage limit, or authentication error, stop immediately. Do not retry. Go to step 6.
6. Run `node pipeline/scripts/state.mjs summary` and print it. Then stop.