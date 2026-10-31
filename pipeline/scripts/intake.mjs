import fs from "node:fs";
import path from "node:path";
import {
    ROOT,
    config,
    toPosix,
    slugify,
    hashFile,
    listStates,
    writeState,
} from "./lib.mjs";

const dry = process.argv.includes("--dry");
const compDir = path.join(ROOT, config.componentsPath);
const exts = new Set([".jsx", ".tsx"]);
const bitsPrefix = toPosix(config.bitsPath) + "/";

function walk(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(full));
        else if (exts.has(path.extname(entry.name))) out.push(full);
    }
    return out;
}

const files = walk(compDir)
    .map((f) => toPosix(path.relative(ROOT, f)))
    .sort();

const existing = listStates();
const byPath = new Map(existing.map((s) => [s.sourcePath, s]));
const used = new Set();
for (const s of existing) {
    used.add(s.sourceSlug);
    if (s.slug) used.add(s.slug);
}

const result = { created: [], requeued: [], unchanged: 0, missing: [], errors: [] };
const seen = new Set(files);

for (const rel of files) {
    const hash = hashFile(path.join(ROOT, rel));
    const prev = byPath.get(rel);
    const isReactBits = rel.startsWith(bitsPrefix);

    if (prev) {
        if (prev.sourceHash === hash) {
            result.unchanged++;
            continue;
        }
        prev.sourceHash = hash;
        prev.status = prev.isReactBits ? "analyze_queued" : "rewrite_queued";
        prev.attempt = 0;
        prev.note = "";
        if (!dry) writeState(prev);
        result.requeued.push(prev.sourceSlug);
        continue;
    }

    const parts = isReactBits ? rel.slice(bitsPrefix.length).split("/") : [];
    const bitsFolder = parts.length > 1 ? parts[0] : null;
    const base = slugify(path.basename(rel));
    const prefix = isReactBits ? bitsFolder ?? "bits" : "general";
    const candidate = [base, `${prefix}-${base}`].find((s) => s && !used.has(s));

    if (!candidate) {
        result.errors.push(`${rel}: slug collision for "${base}"`);
        continue;
    }

    used.add(candidate);
    const state = {
        sourceSlug: candidate,
        sourcePath: rel,
        sourceHash: hash,
        isReactBits,
        bitsFolder,
        slug: isReactBits ? candidate : "",
        nameLocked: isReactBits,
        status: isReactBits ? "analyze_queued" : "rewrite_queued",
        attempt: 0,
        comments: [],
        note: "",
        updatedAt: "",
    };
    if (!dry) writeState(state);
    result.created.push(`${candidate}${isReactBits ? " (bits)" : ""}`);
}

for (const s of existing) {
    if (!seen.has(s.sourcePath)) result.missing.push(s.sourcePath);
}

console.log(`${dry ? "[dry run] " : ""}scanned ${files.length} files`);
console.log(`created:   ${result.created.length}`);
console.log(`requeued:  ${result.requeued.length}`);
console.log(`unchanged: ${result.unchanged}`);
console.log(`missing:   ${result.missing.length}`);
for (const m of result.missing) console.log(`  missing source: ${m}`);
for (const e of result.errors) console.log(`  ERROR ${e}`);
if (result.errors.length) process.exit(1);