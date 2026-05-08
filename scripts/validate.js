import fs from "node:fs";
import { validateRepresentativeSuite } from "../src/validators/scenarioValidator.js";
import { buildValidationArtifacts, buildWebSmokeArtifact, buildQcdsArtifacts, buildDocsZip, assertReleaseEvidenceSchema } from "../src/report/buildReport.js";
const suite = JSON.parse(fs.readFileSync("samples/representative-suite.json", "utf8"));
const validation = validateRepresentativeSuite(suite);
buildValidationArtifacts(validation);
buildWebSmokeArtifact();
buildQcdsArtifacts();
assertReleaseEvidenceSchema();
buildDocsZip();
if (!validation.ok) { console.error(JSON.stringify(validation, null, 2)); process.exit(1); }
console.log("validation: pass");
