import fs from "node:fs";
import { evaluateScenario, summarizeProduct } from "../core/product.js";
const suitePath = process.argv.includes("--suite") ? process.argv[process.argv.indexOf("--suite") + 1] : "samples/representative-suite.json";
const suite = JSON.parse(fs.readFileSync(suitePath, "utf8"));
console.log(JSON.stringify({ product: summarizeProduct(), results: suite.scenarios.map((s) => ({ id: s.id, ...evaluateScenario(s) })) }, null, 2));
