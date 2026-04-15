const path = require('path');
const { searchSchema } = require('../schema/searcher');
const { formatField } = require('../schema/formatter');

/**
 * Resolve the input path (absolute or relative to cwd).
 * @param {string} inputPath
 * @returns {string}
 */
function resolveInputPath(inputPath) {
  if (!inputPath) throw new Error('Input path is required');
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
}

/**
 * Run the search command.
 * @param {string} inputPath
 * @param {string} query
 * @param {object} options
 * @param {object} io  - { log, error } for testability
 */
async function runSearch(inputPath, query, options = {}, io = { log: console.log, error: console.error }) {
  const resolved = resolveInputPath(inputPath);

  let schema, results;
  try {
    ({ schema, results } = await searchSchema(resolved, query, {
      caseSensitive: options.caseSensitive || false,
      searchIn: options.searchIn ? options.searchIn.split(',') : ['name', 'label', 'type'],
    }));
  } catch (err) {
    io.error(`Error: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (results.length === 0) {
    io.log(`No fields matched "${query}" in ${schema.name || resolved}.`);
    return;
  }

  io.log(`Found ${results.length} field(s) matching "${query}" in ${schema.name || resolved}:\n`);
  results.forEach((field) => {
    io.log(formatField(field));
  });
}

module.exports = { resolveInputPath, runSearch };
