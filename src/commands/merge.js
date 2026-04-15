/**
 * merge.js
 * CLI command handler for merging two schema files.
 */

const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { mergeSchemas } = require('../schema/merger');
const { validateSchema } = require('../schema/validator');

/**
 * Resolves a file path relative to cwd if not absolute.
 * @param {string} filePath
 * @returns {string}
 */
function resolveInputPath(filePath) {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
}

/**
 * Runs the merge command.
 * @param {string} pathA - Path to the base schema file.
 * @param {string} pathB - Path to the schema file to merge in.
 * @param {object} options
 * @param {string} [options.output] - Optional output file path.
 * @param {boolean} [options.validate] - Whether to validate the merged result.
 */
async function runMerge(pathA, pathB, options = {}) {
  const resolvedA = resolveInputPath(pathA);
  const resolvedB = resolveInputPath(pathB);

  let schemaA, schemaB;

  try {
    schemaA = loadSchema(resolvedA);
    schemaB = loadSchema(resolvedB);
  } catch (err) {
    console.error(`Error loading schemas: ${err.message}`);
    process.exit(1);
  }

  let merged;
  try {
    merged = mergeSchemas(schemaA, schemaB);
  } catch (err) {
    console.error(`Error merging schemas: ${err.message}`);
    process.exit(1);
  }

  if (options.validate) {
    const errors = validateSchema(merged);
    if (errors.length > 0) {
      console.error('Merged schema validation failed:');
      errors.forEach((e) => console.error(` - ${e}`));
      process.exit(1);
    }
    console.log('Merged schema is valid.');
  }

  const output = JSON.stringify(merged, null, 2);

  if (options.output) {
    const outPath = resolveInputPath(options.output);
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`Merged schema written to ${outPath}`);
  } else {
    console.log(output);
  }
}

module.exports = { resolveInputPath, runMerge };
