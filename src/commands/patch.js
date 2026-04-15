const fs = require('fs');
const path = require('path');
const { loadSchema } = require('../schema/loader');
const { patchSchema } = require('../schema/patcher');
const { formatErrors } = require('../schema/formatter');

function resolveInputPath(inputArg) {
  return path.resolve(process.cwd(), inputArg);
}

async function runPatch(inputArg, patchArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);
  const patchPath = resolveInputPath(patchArg);

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: schema file not found: ${inputPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(patchPath)) {
    console.error(`Error: patch file not found: ${patchPath}`);
    process.exit(1);
  }

  let schema;
  try {
    schema = loadSchema(inputPath);
  } catch (err) {
    console.error(`Error loading schema: ${err.message}`);
    process.exit(1);
  }

  let patches;
  try {
    const raw = fs.readFileSync(patchPath, 'utf8');
    patches = JSON.parse(raw);
    if (!Array.isArray(patches)) patches = [patches];
  } catch (err) {
    console.error(`Error loading patch file: ${err.message}`);
    process.exit(1);
  }

  let patched;
  try {
    patched = patchSchema(schema, patches);
  } catch (err) {
    console.error(`Patch failed: ${err.message}`);
    process.exit(1);
  }

  const output = JSON.stringify(patched, null, 2);

  if (options.output) {
    const outPath = resolveInputPath(options.output);
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`Patched schema written to ${outPath}`);
  } else {
    console.log(output);
  }
}

module.exports = { resolveInputPath, runPatch };
