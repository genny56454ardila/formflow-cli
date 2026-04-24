// commands/version.js — CLI command for schema versioning
const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { bumpVersion, setVersion, getVersion } = require('../schema/versioner');

function resolveInputPath(inputArg) {
  return path.isAbsolute(inputArg) ? inputArg : path.resolve(process.cwd(), inputArg);
}

async function runVersion(args, opts = {}) {
  const { log = console.log, error = console.error } = opts;

  const inputPath = resolveInputPath(args.input);
  let schema;
  try {
    schema = await loadSchema(inputPath);
  } catch (e) {
    error(`Error loading schema: ${e.message}`);
    return 1;
  }

  const before = getVersion(schema);
  let updated;

  try {
    if (args.set) {
      updated = setVersion(schema, args.set);
    } else {
      const releaseType = args.bump || 'patch';
      updated = bumpVersion(schema, releaseType);
    }
  } catch (e) {
    error(`Version error: ${e.message}`);
    return 1;
  }

  const after = getVersion(updated);

  const outputPath = args.output ? resolveInputPath(args.output) : inputPath;
  try {
    fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (e) {
    error(`Failed to write output: ${e.message}`);
    return 1;
  }

  log(`Version updated: ${before} → ${after}`);
  log(`Saved to: ${outputPath}`);
  return 0;
}

module.exports = { resolveInputPath, runVersion };
