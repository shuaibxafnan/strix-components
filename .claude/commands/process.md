---
description: Process queued components until the queue is empty or the run limit is reached
---

Work from the repo root. Read `pipeline/CLAUDE.md` first.

1. Run `npm ci --prefix pipeline`. If it fails, stop and report the error. Do not continue.
2. Run `node pipeline/scripts/state.mjs reset-stale --force yes`.
3. Run `node pipeline/scripts/state.mjs summary` and print it.
4. Read `maxPerRun` from `pipeline/config.json`. Set `done = 0` and `failStreak = 0`.
5. Loop:
   a. If arguments were given (`$ARGUMENTS`), treat them as a space-separated list of slugs and take the next one not yet handled in this run, each slug once. Otherwise get the next item with `node pipeline/scripts/state.mjs list retry_requested analyze_queued rewrite_queued` and take the first line. If none remain, go to step 7.
   b. If `done >= maxPerRun`, go to step 7.
   c. `node pipeline/scripts/state.mjs get <slug>` to read `isReactBits`.
   d. `node pipeline/scripts/state.mjs start <slug>`. If it fails because the item is not queued, skip it and continue.
   e. Invoke the subagent `describe-only` if `isReactBits` is true, otherwise `rewrite-and-describe`. Pass only the sourceSlug. Wait for its report.
   f. `node pipeline/scripts/state.mjs finish <slug> --slug <final slug> --note "<report>"`. If it crashes or errors for any reason other than a gate failure, stop the run and report the error.
   g. `git add pipeline/out pipeline/state`, commit with message `process <slug>`, push. If the push fails, stop the run and report the error.
   h. `done = done + 1`. If finish ended in `gate_failed`, `failStreak = failStreak + 1`, otherwise `failStreak = 0`. If `failStreak >= 5`, stop the run, report the last gate messages, and go to step 7.
6. If any command or tool fails with a rate limit, usage limit, or authentication error, stop immediately. Do not retry. Go to step 7.
7. Run `node pipeline/scripts/state.mjs summary` and print it. Then stop.
