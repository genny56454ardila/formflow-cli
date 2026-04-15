const path = require('path');
const { loadSchema } = require('../schema/loader');
const { lintSchema } = require('../schema/linter');
const { formatErrors } = require('../schema/formatter');

function resolveInputPath(inputArg) {
  if (!inputArg) throw new Error('Input path is required.');
  return path.isAbsolute(inputArg) ? inputArg : path.resolve(process.cwd(), inputArg);
}

async function runLint(inputArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);
  let schema;

  try {
    schema = await loadSchema(inputPath);
  } catch (err) {
    console.error(`Error loading schema: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const warnings = lintSchema(schema);

  if (warnings.length === 0) {
    console.log('✔  No lint warnings found.');
    return;
  }

  const messages = warnings.map(w => w.message);

  if (options.format === 'json') {
    console.log(JSON.stringify(warnings, null, 2));
  } else {
    console.warn(`⚠  ${warnings.length} lint warning(s) found:\n`);
    console.warn(formatErrors(messages));
  }

  if (options.strict) {
    process.exitCode = 1;
  }
}

module.exports = { resolveInputPath, runLint };
