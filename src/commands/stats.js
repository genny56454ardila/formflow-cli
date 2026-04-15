const path = require('path');
const { loadSchema } = require('../schema/loader');
const { schemaStats } = require('../schema/stats');

/**
 * Resolve and normalize the input path
 * @param {string} inputArg
 * @returns {string}
 */
function resolveInputPath(inputArg) {
  if (!inputArg) throw new Error('Input path is required');
  return path.isAbsolute(inputArg) ? inputArg : path.resolve(process.cwd(), inputArg);
}

/**
 * Print schema stats to stdout
 * @param {object} stats
 */
function printStats(stats) {
  console.log(`\nSchema: ${stats.name}`);
  console.log(`  Total fields    : ${stats.totalFields}`);
  console.log(`  Required        : ${stats.requiredFields}`);
  console.log(`  Optional        : ${stats.optionalFields}`);
  console.log(`  With validation : ${stats.fieldsWithValidation}`);
  console.log(`  With defaults   : ${stats.fieldsWithDefaults}`);

  console.log('\n  Field type breakdown:');
  for (const [type, count] of Object.entries(stats.typeCounts)) {
    if (count > 0) {
      console.log(`    ${type.padEnd(12)}: ${count}`);
    }
  }

  console.log('\n  Fields:');
  for (const f of stats.fieldDetails) {
    const flags = [
      f.required ? 'required' : 'optional',
      f.hasValidation ? 'validated' : null,
      f.hasDefault ? 'has-default' : null,
    ].filter(Boolean).join(', ');
    console.log(`    - ${f.name} (${f.type}) [${flags}]`);
  }
  console.log('');
}

/**
 * Run the stats command
 * @param {string} inputArg
 */
async function runStats(inputArg) {
  const inputPath = resolveInputPath(inputArg);
  const schema = await loadSchema(inputPath);
  const stats = schemaStats(schema);
  printStats(stats);
}

module.exports = { resolveInputPath, printStats, runStats };
