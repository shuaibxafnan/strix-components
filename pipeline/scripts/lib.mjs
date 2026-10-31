import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const PIPELINE = path.resolve(here, "..");
export const ROOT = path.resolve(PIPELINE, "..");
export const STATE_DIR = path.join(PIPELINE, "state");
export const OUT_DIR = path.join(PIPELINE, "out");
export const config = JSON.parse(
    fs.readFileSync(path.join(PIPELINE, "config.json"), "utf8"),
);

export const toPosix = (p) => p.split(path.sep).join("/");

export function slugify(name) {
    return name
        .replace(/\.[^.]+$/, "")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}

export function hashFile(file) {
    const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
    return crypto.createHash("sha256").update(text).digest("hex");
}

export const statePath = (sourceSlug) =>
    path.join(STATE_DIR, `${sourceSlug}.json`);

export function readState(sourceSlug) {
    const file = statePath(sourceSlug);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeState(state) {
    state.updatedAt = new Date().toISOString();
    fs.writeFileSync(
        statePath(state.sourceSlug),
        JSON.stringify(state, null, 2) + "\n",
    );
}

export function listStates() {
    if (!fs.existsSync(STATE_DIR)) return [];
    return fs
        .readdirSync(STATE_DIR)
        .filter((f) => f.endsWith(".json"))
        .map((f) => JSON.parse(fs.readFileSync(path.join(STATE_DIR, f), "utf8")));
}