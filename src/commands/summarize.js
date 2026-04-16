const path = require('path');
const { loadSchema } = require('../schema/loader');
const { summarizeSchema, formatSummary } = require('../schema/summarizer');

function resolveInputPath(inputArg) {
  if (!inputArg) throw new Error('No input file specified');
  return path.isAbsolute(inputArg) ? inputArg : path.resolve(process.cwd(), inputArg);
}

async function runSummarize(args, opts = {}) {
  const log = opts.log || console.log;
  const errorLog = opts.errorLog || console.error;

  let inputPath;
  try {
    inputPath = resolveInputPath(args[0]);
  } catch (err) {
    errorLog(`Error: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  let schema;
  try {
    schema = await loadSchema(inputPath);
  } catch (err) {
    errorLog(`Failed to load schema: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  let summary;
  try {
    summary = summarizeSchema(schema);
  } catch (err) {
    errorLog(`Failed to summarize schema: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    log(JSON.stringify(summary, null, 2));
  } else {
    log(formatSummary(summary));
  }
}

module.exports = { resolveInputPath, runSummarize };
