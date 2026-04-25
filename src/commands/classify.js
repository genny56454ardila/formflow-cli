/**
 * classify.js — CLI command to classify fields in a schema file
 */

const path = require('path');
const { loadSchema } = require('../schema/loader');
const { classifySchema } = require('../schema/classifier');
const { exportSchema } = require('../schema/exporter');

function resolveInputPath(input) {
  if (!input) throw new Error('Input path is required');
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

async function runClassify(args, opts = {}) {
  const { log = console.log, error = console.error } = opts;

  try {
    const inputPath = resolveInputPath(args.input);
    const schema = await loadSchema(inputPath);
    const classified = classifySchema(schema);

    const summary = classified._classificationSummary;

    log(`\nClassification Summary for: ${schema.name || inputPath}`);
    log(`  Total fields : ${summary.total}`);
    log(`  Categories   :`);
    for (const [cat, count] of Object.entries(summary.categories)) {
      log(`    ${cat.padEnd(12)}: ${count}`);
    }
    log(`  Complexity   :`);
    log(`    simple      : ${summary.complexities.simple}`);
    log(`    moderate    : ${summary.complexities.moderate}`);
    log(`    complex     : ${summary.complexities.complex}`);

    if (args.output) {
      const outputPath = path.isAbsolute(args.output)
        ? args.output
        : path.resolve(process.cwd(), args.output);
      await exportSchema(classified, outputPath, args.format || 'json');
      log(`\nClassified schema written to: ${outputPath}`);
    }

    return classified;
  } catch (err) {
    error(`classify error: ${err.message}`);
    throw err;
  }
}

module.exports = { resolveInputPath, runClassify };
