<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


## Pipeline work
Tasks under `pipeline/` or run through `/process` follow `pipeline/CLAUDE.md` and `pipeline/template/TEMPLATE.md`. Where they conflict with the rules above, the pipeline rules win.
- Do not read Next.js docs or look in `node_modules/next` during pipeline runs. Components are processed as plain React files and are never built or run here.
- Do not run builds, lint, or the dev server.