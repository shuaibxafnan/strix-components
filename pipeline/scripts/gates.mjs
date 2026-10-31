import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import { transformSync } from "esbuild";
import { parse } from "@babel/parser";
import { ROOT, PIPELINE, OUT_DIR, listStates, hashFile } from "./lib.mjs";

const arg = process.argv[2];
if (!arg) {
    console.error("usage: gates.mjs <slug>");
    process.exit(1);
}

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function done() {
    for (const e of errors) console.log(`ERROR ${e}`);
    for (const w of warnings) console.log(`WARN  ${w}`);
    if (!errors.length) console.log("gates passed");
    process.exit(errors.length ? 1 : 0);
}

const states = listStates();
let matches = states.filter((s) => s.slug === arg);
if (!matches.length) matches = states.filter((s) => s.sourceSlug === arg);
if (!matches.length) {
    console.error(`no state for ${arg}`);
    process.exit(1);
}
if (matches.length > 1) {
    err(`slug ${arg} is used by ${matches.map((m) => m.sourceSlug).join(", ")}`);
}
const state = matches[0];
const slug = arg;

if (states.some((s) => s.sourceSlug === slug && s.sourceSlug !== state.sourceSlug)) {
    err(`slug ${slug} collides with another component's source name`);
}

const dir = path.join(OUT_DIR, slug);
const ext = state.isReactBits ? path.extname(state.sourcePath) : ".jsx";
const codeFile = path.join(dir, `${slug}${ext}`);
const jsonFile = path.join(dir, `${slug}.json`);

if (!fs.existsSync(codeFile)) err(`missing ${path.relative(ROOT, codeFile)}`);
if (!fs.existsSync(jsonFile)) err(`missing ${path.relative(ROOT, jsonFile)}`);
if (errors.length) done();

let meta;
try {
    meta = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
} catch (e) {
    err(`json parse: ${e.message}`);
    done();
}

const schema = JSON.parse(
    fs.readFileSync(path.join(PIPELINE, "schema", "metadata.schema.json"), "utf8"),
);
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
if (!validate(meta)) {
    for (const e of validate.errors) err(`schema ${e.instancePath || "/"} ${e.message}`);
}
if (meta.slug !== slug) err(`json slug "${meta.slug}" does not match "${slug}"`);
if (meta.isReactBits !== state.isReactBits) {
    err(`json isReactBits is ${meta.isReactBits}, state says ${state.isReactBits}`);
}

const code = fs.readFileSync(codeFile, "utf8");
const isTs = ext === ".tsx";

let ast;
try {
    ast = parse(code, {
        sourceType: "module",
        plugins: isTs ? ["jsx", "typescript"] : ["jsx"],
    });
} catch (e) {
    err(`parse error: ${e.message}`);
    done();
}
try {
    transformSync(code, { loader: isTs ? "tsx" : "jsx", jsx: "automatic" });
} catch (e) {
    err(`compile error: ${e.errors?.[0]?.text ?? e.message}`);
}

const BUILTIN = new Set(["react", "react-dom", "next"]);
const pkgName = (spec) =>
    spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
const imported = new Set();
const relative = [];
for (const m of code.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g)) {
    const spec = m[1];
    if (/^(\.|@\/|~\/)/.test(spec)) relative.push(spec);
    else imported.add(pkgName(spec));
}
const deps = new Set(Array.isArray(meta.dependencies) ? meta.dependencies : []);
for (const p of imported) {
    if (!BUILTIN.has(p) && !deps.has(p)) err(`imports ${p} but it is not in dependencies`);
}
for (const d of deps) {
    if (!imported.has(d)) warn(`dependency ${d} is listed but not imported`);
}
for (const r of relative) {
    (state.isReactBits ? warn : err)(`relative or alias import ${r}, component must be one file`);
}

const jsonProps = Array.isArray(meta.props) ? meta.props.map((p) => p.name) : [];
const fixedText = Array.isArray(meta.fixed) ? meta.fixed.join(" ") : "";

if (meta.variants) {
    const { prop, default: def, options } = meta.variants;
    const values = options.map((o) => o.value);
    if (!jsonProps.includes(prop)) err(`variants.prop ${prop} is not in props`);
    if (!values.includes(def)) err(`variants.default ${def} is not one of the options`);
    if (new Set(values).size !== values.length) err("duplicate variant values");
    for (const v of values) {
        const safe = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const quoted = new RegExp(`["'\`]${safe}["'\`]`).test(code);
        const asKey = new RegExp(`(^|[\\s,{])${safe}\\s*:`, "m").test(code);
        const asWord = new RegExp(`\\b${safe}\\b`).test(code);
        if (!quoted && !asKey) {
            if (asWord) warn(`variant value ${v} only found as a bare word in code`);
            else err(`variant value ${v} not found in code`);
        }
    }
    const safeProp = prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeDef = def.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`${safeProp}\\s*=\\s*["'\`]${safeDef}["'\`]`).test(code)) {
        (state.isReactBits ? warn : err)(`default for ${prop} in the code is not ${def}`);
    }
}

function resolveFn(node) {
    if (!node) return null;
    if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(node.type)) {
        return node;
    }
    if (node.type === "Identifier") {
        for (const n of ast.program.body) {
            const d = n.type === "ExportNamedDeclaration" ? n.declaration : n;
            if (!d) continue;
            if (d.type === "FunctionDeclaration" && d.id?.name === node.name) return d;
            if (d.type === "VariableDeclaration") {
                for (const v of d.declarations) {
                    if (v.id.name === node.name) return resolveFn(v.init);
                }
            }
        }
    }
    return null;
}

if (state.isReactBits) {
    const src = path.join(ROOT, state.sourcePath);
    if (!fs.existsSync(src)) err("source file not found for hash comparison");
    else if (hashFile(src) !== hashFile(codeFile)) {
        err("output differs from source, React Bits files must be copied unchanged");
    }
    for (const n of jsonProps) {
        const safe = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (!new RegExp(`\\b${safe}\\b`).test(code)) err(`prop ${n} not found in source`);
    }
} else {
    if (ast.comments.length) err(`${ast.comments.length} code comments found`);

    const hasUseClient = ast.program.directives.some((d) => d.value.value === "use client");
    if (/\buse(State|Effect|Ref|LayoutEffect|Memo|Callback|Reducer|Context|Id|Transition)\b/.test(code) && !hasUseClient) {
        err('uses hooks but has no "use client" directive');
    }

    const exp = ast.program.body.find((n) => n.type === "ExportDefaultDeclaration");
    if (!exp) err("no default export");
    else {
        const decl = exp.declaration;
        const name = decl.id?.name ?? (decl.type === "Identifier" ? decl.name : null);
        const pascal = slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
        if (!/^[0-9]/.test(pascal) && name !== pascal) {
            err(`default export is ${name ?? "anonymous"}, expected ${pascal}`);
        }
        const fn = resolveFn(decl);
        if (!fn) warn("could not resolve the default export function, props not checked");
        else {
            const p = fn.params[0];
            const names = [];
            if (p?.type === "ObjectPattern") {
                for (const prop of p.properties) {
                    if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
                        names.push(prop.key.name);
                    } else warn("rest or computed props in signature, not checked");
                }
            } else if (p) err("props must be destructured in the function signature");
            for (const n of names) if (!jsonProps.includes(n)) err(`prop ${n} is in code but not in JSON props`);
            for (const n of jsonProps) if (!names.includes(n)) err(`prop ${n} is in JSON props but not in the signature`);
            if (!names.includes("className")) err("component must accept className");
        }
    }

    if (/<style\b/.test(code) && !/`/.test(code)) warn("style tag without template literal");

    const has = (re) => re.test(code);
    if (has(/addEventListener\(/) && !has(/removeEventListener\(/)) {
        if (has(/once\s*:\s*true/)) warn("addEventListener with once and no removeEventListener");
        else if (!has(/AbortController|\bsignal\s*[:,}]/)) err("addEventListener without removeEventListener");
    }
    if (has(/setInterval\(/) && !has(/clearInterval\(/)) err("setInterval without clearInterval");
    if (has(/requestAnimationFrame\(/) && !has(/cancelAnimationFrame\(/)) warn("requestAnimationFrame without cancelAnimationFrame");
    if (has(/setTimeout\(/) && !has(/clearTimeout\(/)) warn("setTimeout without clearTimeout");
    if (has(/new (Resize|Intersection|Mutation)Observer\(/) && !has(/\.(disconnect|unobserve)\(/)) {
        warn("observer without disconnect or unobserve");
    }
    if (!hasUseClient && has(/\b(window|document)\./)) warn("uses window or document without use client");

    if (has(/document\.(body|documentElement)\.|new Lenis\(/) && !/body|document|page|global|scroll/i.test(fixedText)) {
        warn("global side effect in code but not described in fixed");
    }
}

for (const item of Array.isArray(meta.needsCodeEdit) ? meta.needsCodeEdit : []) {
    const tokens = String(item.where ?? "")
        .split(/[\s,.;()'"`]+/)
        .filter((t) => t.length >= 4 && /[A-Z_\-:0-9]/.test(t.slice(1)));
    const lower = code.toLowerCase();
    if (tokens.length && !tokens.some((t) => lower.includes(t.toLowerCase()))) {
        warn(`needsCodeEdit "${item.change}": where does not match anything in the code`);
    }
}

done();