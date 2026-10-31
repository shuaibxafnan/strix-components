import fs from "node:fs";
import { parse } from "@babel/parser";
import generate from "@babel/generator";

const gen = generate.default ?? generate;

const parseSource = (code, file) =>
    parse(code, {
        sourceType: "module",
        plugins: ["jsx", ...(/\.tsx?$/.test(file) ? ["typescript"] : [])],
    });

const printed = (code, file) => gen(parseSource(code, file), { comments: false }).code;

export function stripComments(code, file = "x.jsx") {
    const ast = parseSource(code, file);
    const expected = gen(ast, { comments: false }).code;
    const ranges = ast.comments.map((c) => [c.start, c.end]).sort((a, b) => b[0] - a[0]);

    let out = code;
    for (const [start, end] of ranges) out = out.slice(0, start) + out.slice(end);

    const tidy = out.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
    if (printed(tidy, file) === expected) return tidy;
    if (printed(out, file) === expected) return out;
    throw new Error(`AST changed after stripping: ${file}`);
}

if (process.argv[1]?.endsWith("strip-comments.mjs")) {
    const [src, dst] = process.argv.slice(2);
    fs.writeFileSync(dst, stripComments(fs.readFileSync(src, "utf8"), src));
}