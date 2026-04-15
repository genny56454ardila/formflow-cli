const fs = require('fs');
const path = require('path');
const { loadSchema } = require('../schema/loader');
const { filterSchema } = require('../schema/filter');
const { formatSchema } = require('../schema/formatter');

/**
 * Resolve and validate the input file path.
 * @param {string} inputArg
 * @returns {string}
 */
function resolveInputPath(inputArg) {
  if (!inputArg) throw new Error('Input file path is required');
  const resolved = path.resolve(process.cwd(), inputArg);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Input file not found: ${resolved}`);
  }
  return resolved;
}

/**
 * Run the filter command.
 * @param {string} inputArg - Path to schema file
 * @param {Object} options
 * @param {string} [options.type] - Filter by field type
 * @param {boolean} [options.required] - Filter by required status
 * @param {string} [options.output] - Optional output file path
 */
async function runFilter(inputArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);
  const schema = loadSchema(inputPath);

  const filterOptions = {};
  if (options.type) filterOptions.type = options.type;
  if (options.required !== undefined) filterOptions.required = options.required === true || options.required === 'true';

  const filtered = filterSchema(schema, filterOptions);

  if (options.output) {
    const outputPath = path.resolve(process.cwd(), options.output);
    fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), 'utf8');
    console.log(`Filtered schema written to ${outputPath}`);
  } else {
    console.log(formatSchema(filtered));
  }

  console.log(`Fields matched: ${filtered.fields.length}`);
  return filtered;
}

module.exports = { resolveInputPath, runFilter };
