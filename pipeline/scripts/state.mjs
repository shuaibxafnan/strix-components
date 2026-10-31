import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PIPELINE, config, readState, writeState, listStates } from "./lib.mjs";

const QUEUED = ["rewrite_queued", "analyze_queued", "retry_requested"];

const [cmd, ...rest] = process.argv.slice(2);
const flags = {};
const args = [];
for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith("--")) {
        flags[rest[i].slice(2)] = rest[i + 1];
        i++;
    } else args.push(rest[i]);
}

const fail = (msg) => {
    console.error(msg);
    process.exit(1);
};

const need = (sourceSlug) => {
    const s = readState(sourceSlug);
    if (!s) fail(`no state for ${sourceSlug}`);
    return s;
};

const slugTaken = (slug, selfSourceSlug) =>
    listStates().some(
        (s) =>
            s.sourceSlug !== selfSourceSlug &&
            (s.sourceSlug === slug || s.slug === slug),
    );

const runGates = (slug) => {
    const gates = path.join(PIPELINE, "scripts", "gates.mjs");
    if (!fs.existsSync(gates)) fail("scripts/gates.mjs not found");
    const run = spawnSync(process.execPath, [gates, slug], { encoding: "utf8" });
    const output = `${run.stdout ?? ""}${run.stderr ?? ""}`.trim().slice(0, 2000);
    return { ok: run.status === 0, output };
};

if (cmd === "list") {
    const order = (s) => (s.status === "retry_requested" ? 0 : 1);
    listStates()
        .filter((s) => args.includes(s.status))
        .sort((a, b) => order(a) - order(b) || a.sourceSlug.localeCompare(b.sourceSlug))
        .forEach((s) => console.log(s.sourceSlug));
} else if (cmd === "summary") {
    const counts = {};
    for (const s of listStates()) counts[s.status] = (counts[s.status] ?? 0) + 1;
    for (const [k, v] of Object.entries(counts).sort()) console.log(`${k}: ${v}`);
} else if (cmd === "get") {
    console.log(JSON.stringify(need(args[0]), null, 2));
} else if (cmd === "start") {
    const s = need(args[0]);
    if (!QUEUED.includes(s.status)) fail(`${s.sourceSlug} is ${s.status}, not queued`);
    s.resumeStatus = s.status;
    s.status = "in_progress";
    s.startedAt = new Date().toISOString();
    writeState(s);
    console.log(`started ${s.sourceSlug}`);
} else if (cmd === "finish") {
    const s = need(args[0]);
    if (s.status !== "in_progress") fail(`${s.sourceSlug} is ${s.status}, not in_progress`);

    const slug = s.isReactBits ? s.sourceSlug : flags.slug;
    if (!slug) fail("--slug is required");

    if (s.nameLocked && slug !== s.slug && flags.rename !== "yes") {
        fail(`name is locked as ${s.slug}, pass --rename yes to change it`);
    }
    if (slugTaken(slug, s.sourceSlug)) fail(`slug ${slug} is already used`);

    s.slug = slug;
    s.nameLocked = true;
    s.note = flags.note ?? "";
    writeState(s);

    const result = runGates(slug);
    s.gateOutput = result.output;
    s.status = result.ok ? "in_review" : "gate_failed";
    delete s.startedAt;
    delete s.resumeStatus;
    writeState(s);
    console.log(`${s.sourceSlug} -> ${s.status}`);
    if (!result.ok) console.log(result.output);
} else if (cmd === "regate") {
    const s = need(args[0]);
    if (!["gate_failed", "in_review"].includes(s.status)) {
        fail(`${s.sourceSlug} is ${s.status}, regate only works on gate_failed or in_review`);
    }
    const result = runGates(s.slug || s.sourceSlug);
    s.gateOutput = result.output;
    s.status = result.ok ? "in_review" : "gate_failed";
    writeState(s);
    console.log(`${s.sourceSlug} -> ${s.status}`);
    if (!result.ok) console.log(result.output);
} else if (cmd === "retry") {
    const s = need(args[0]);
    if (!["gate_failed", "in_review"].includes(s.status)) fail(`${s.sourceSlug} is ${s.status}`);
    if (!flags.comment) fail("--comment is required");
    if (s.attempt >= config.retryCap) {
        s.status = "needs_manual";
        writeState(s);
        fail(`${s.sourceSlug} reached the retry cap of ${config.retryCap}`);
    }
    s.attempt += 1;
    s.comments.push({ at: new Date().toISOString(), text: flags.comment });
    s.status = "retry_requested";
    writeState(s);
    console.log(`${s.sourceSlug} -> retry_requested (attempt ${s.attempt})`);
} else if (cmd === "reset-stale") {
    const limit = config.staleInProgressMinutes * 60 * 1000;
    let count = 0;
    for (const s of listStates()) {
        if (s.status !== "in_progress") continue;
        if (flags.force !== "yes" && Date.now() - new Date(s.startedAt).getTime() < limit) continue;
        s.status =
            s.resumeStatus ?? (s.isReactBits ? "analyze_queued" : "rewrite_queued");
        delete s.startedAt;
        delete s.resumeStatus;
        writeState(s);
        count++;
    }
    console.log(`reset ${count}`);
} else {
    fail("commands: list <status...>, summary, get <slug>, start <slug>, finish <slug> --slug <s> --note <n>, regate <slug>, reset-stale [--force yes]");
}