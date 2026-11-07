import fs from "node:fs";
import path from "node:path";
import { ROOT, PIPELINE, listStates, writeState } from "./lib.mjs";

const FILE = path.join(PIPELINE, "licenses.json");
const CSV = path.join(PIPELINE, "licenses.csv");
const DECISIONS = ["unknown", "cleared", "attribution", "blocked"];
const COLS = [
    "sourceSlug", "slug", "isReactBits", "bitsFolder", "sourcePath",
    "decision", "license", "author", "sourceUrl", "notes", "hints",
];

const [cmd, ...rest] = process.argv.slice(2);
const flags = {};
const args = [];
for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith("--")) {
        flags[rest[i].slice(2)] = rest[i + 1];
        i++;
    } else args.push(rest[i]);
}

const fail = (m) => {
    console.error(m);
    process.exit(1);
};
const load = () => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : {});
const save = (d) => {
    const sorted = Object.fromEntries(Object.entries(d).sort(([a], [b]) => a.localeCompare(b)));
    fs.writeFileSync(FILE, JSON.stringify(sorted, null, 2) + "\n");
};
const states = listStates();
const bySource = new Map(states.map((s) => [s.sourceSlug, s]));

const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function parseCsv(text) {
    const rows = [];
    let row = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (q) {
            if (c === '"') {
                if (text[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else q = false;
            } else cur += c;
        } else if (c === '"') q = true;
        else if (c === ",") {
            row.push(cur);
            cur = "";
        } else if (c === "\n") {
            row.push(cur);
            rows.push(row);
            row = [];
            cur = "";
        } else if (c !== "\r") cur += c;
    }
    if (cur || row.length) {
        row.push(cur);
        rows.push(row);
    }
    return rows;
}

function hints(rel) {
    try {
        const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
        const urls = [...new Set(text.match(/https?:\/\/[^\s"'`)<>\\]+/g) ?? [])]
            .filter((u) => !/unsplash|pexels|fonts\.g|cdnjs|jsdelivr|unpkg|w3\.org|googleapis|gstatic/.test(u))
            .slice(0, 4);
        const lines = text
            .split(/\r?\n/)
            .filter((l) => /licen[sc]e|credit|author|copyright|©|inspired|codrops|codepen|tympanus|osmo/i.test(l))
            .map((l) => l.trim().slice(0, 120))
            .slice(0, 3);
        return [...urls, ...lines].join(" | ");
    } catch {
        return "";
    }
}

if (cmd === "export") {
    const data = load();
    const lines = [COLS.join(",")];
    for (const s of [...states].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath))) {
        const e = data[s.sourceSlug] ?? {};
        lines.push(
            [
                s.sourceSlug, s.slug, s.isReactBits, s.bitsFolder ?? "", s.sourcePath,
                e.decision ?? "unknown", e.license ?? "", e.author ?? "", e.sourceUrl ?? "",
                e.notes ?? "", hints(s.sourcePath),
            ].map(esc).join(","),
        );
    }
    fs.writeFileSync(CSV, "\uFEFF" + lines.join("\r\n") + "\r\n");
    console.log(`wrote ${states.length} rows to pipeline/licenses.csv`);
} else if (cmd === "import") {
    if (!fs.existsSync(CSV)) fail("pipeline/licenses.csv not found, run export first");
    const rows = parseCsv(fs.readFileSync(CSV, "utf8").replace(/^\uFEFF/, ""));
    const head = rows.shift().map((h) => h.trim());
    const col = (name) => head.indexOf(name);
    for (const c of ["sourceSlug", "decision", "license", "author", "sourceUrl", "notes"]) {
        if (col(c) < 0) fail(`missing column ${c}`);
    }
    const data = load();
    let changed = 0;
    const problems = [];
    for (const r of rows) {
        const sourceSlug = (r[col("sourceSlug")] ?? "").trim();
        if (!sourceSlug) continue;
        if (!bySource.has(sourceSlug)) {
            problems.push(`${sourceSlug}: not a known component`);
            continue;
        }
        const decision = (r[col("decision")] ?? "").trim().toLowerCase() || "unknown";
        if (!DECISIONS.includes(decision)) {
            problems.push(`${sourceSlug}: bad decision "${decision}"`);
            continue;
        }
        const entry = {
            decision,
            license: (r[col("license")] ?? "").trim(),
            author: (r[col("author")] ?? "").trim(),
            sourceUrl: (r[col("sourceUrl")] ?? "").trim(),
            notes: (r[col("notes")] ?? "").trim(),
        };
        if (["cleared", "attribution"].includes(decision) && !entry.license) {
            problems.push(`${sourceSlug}: ${decision} needs a license name`);
            continue;
        }
        if (decision === "attribution" && !entry.author && !entry.sourceUrl) {
            problems.push(`${sourceSlug}: attribution needs an author or source url`);
            continue;
        }
        const empty = decision === "unknown" && !entry.license && !entry.author && !entry.sourceUrl && !entry.notes;
        if (empty) {
            delete data[sourceSlug];
            continue;
        }
        if (JSON.stringify(data[sourceSlug]) !== JSON.stringify(entry)) changed++;
        data[sourceSlug] = entry;
    }
    save(data);
    console.log(`imported, ${changed} changed`);
    for (const p of problems) console.log(`  PROBLEM ${p}`);
} else if (cmd === "set") {
    const targets = new Set(args);
    if (flags.bits === "yes") states.filter((s) => s.isReactBits).forEach((s) => targets.add(s.sourceSlug));
    if (flags.folder) {
        states
            .filter((s) => s.isReactBits && s.bitsFolder === flags.folder)
            .forEach((s) => targets.add(s.sourceSlug));
    }
    if (!targets.size) fail("no targets: pass source slugs, --bits yes, or --folder <name>");
    const decision = flags.decision;
    if (decision && !DECISIONS.includes(decision)) fail(`decision must be one of ${DECISIONS.join(", ")}`);
    const data = load();
    for (const t of targets) {
        if (!bySource.has(t)) fail(`unknown component ${t}`);
        const e = { decision: "unknown", license: "", author: "", sourceUrl: "", notes: "", ...data[t] };
        if (decision) e.decision = decision;
        if (flags.license) e.license = flags.license;
        if (flags.author) e.author = flags.author;
        if (flags.url) e.sourceUrl = flags.url;
        if (flags.notes) e.notes = flags.notes;
        data[t] = e;
    }
    save(data);
    console.log(`updated ${targets.size}`);
} else if (cmd === "summary") {
    const data = load();
    const counts = {};
    for (const s of states) {
        const d = data[s.sourceSlug]?.decision ?? "unknown";
        counts[d] = (counts[d] ?? 0) + 1;
    }
    for (const [k, v] of Object.entries(counts).sort()) console.log(`${k}: ${v}`);
} else if (cmd === "check") {
    const key = args[0];
    const s = states.find((x) => x.sourceSlug === key || x.slug === key);
    if (!s) fail(`no component ${key}`);
    const e = load()[s.sourceSlug];
    if (e && ["cleared", "attribution"].includes(e.decision)) {
        console.log(`${s.sourceSlug}: ${e.decision} (${e.license})`);
    } else {
        fail(`${s.sourceSlug}: license is ${e?.decision ?? "unknown"}, publishing blocked`);
    }
} else if (cmd === "drop-blocked") {
    const data = load();
    let n = 0;
    for (const s of states) {
        if (data[s.sourceSlug]?.decision !== "blocked") continue;
        if (s.status === "published") {
            console.log(`  ALREADY PUBLISHED, remove from R2 by hand: ${s.slug}`);
            continue;
        }
        if (s.status === "dropped") continue;
        s.status = "dropped";
        writeState(s);
        n++;
    }
    console.log(`dropped ${n}`);
} else {
    fail("commands: export, import, set <slugs> [--bits yes] [--folder <n>] --decision <d> --license <l> [--author <a>] [--url <u>] [--notes <n>], summary, check <slug>, drop-blocked");
}