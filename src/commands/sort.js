/**
 * sort.js — CLI command to sort schema fields
 */

const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { sortSchema, VALID_SORT_KEYS, VALID_ORDERS } = require('../schema/sorter');
const { formatSchema } = require('../schema/formatter');

/**
 * Resolve and validate the input path.
 * @param {string} input
 * @returns {string}
 */
function resolveInputPath(input) {
  if (!input) throw new Error('No input file specified.');
  const resolved = path.resolve(process.cwd(), input);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  return resolved;
}

/**
 * Run the sort command.
 * @param {Object} argv
 */
async function runSort(argv) {
  const { input, key = 'name', order = 'asc', output } = argv;

  if (!VALID_SORT_KEYS.includes(key)) {
    console.error(`Invalid sort key: "${key}". Valid: ${VALID_SORT_KEYS.join(', ')}`);
    process.exit(1);
  }

  if (!VALID_ORDERS.includes(order)) {
    console.error(`Invalid order: "${order}". Use "asc" or "desc".`);
    process.exit(1);
  }

  let filePath;
  try {
    filePath = resolveInputPath(input);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const schema = loadSchema(filePath);
  const sorted = sortSchema(schema, key, order);

  if (output) {
    const outPath = path.resolve(process.cwd(), output);
    fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2));
    console.log(`Sorted schema written to: ${outPath}`);
  } else {
    console.log(formatSchema(sorted));
  }
}

module.exports = { resolveInputPath, runSort };
