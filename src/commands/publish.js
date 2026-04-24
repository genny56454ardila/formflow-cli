const fs = require('fs');
const path = require('path');
const { loadSchema } = require('../schema/loader');
const { publishSchema, unpublishSchema, isPublished, listPublished } = require('../schema/publisher');

function resolveInputPath(inputArg) {
  return path.resolve(process.cwd(), inputArg);
}

async function runPublish(args, options = {}) {
  const { log = console.log, error = console.error } = options;

  if (args.list) {
    const dir = resolveInputPath(args.list);
    const entries = listPublished(dir);
    if (entries.length === 0) {
      log('No published schemas found.');
    } else {
      log(`Published schemas in ${dir}:`);
      entries.forEach(({ file, schema }) => {
        log(`  ${file} — channel: ${schema.publishChannel}, at: ${schema.publishedAt}`);
      });
    }
    return;
  }

  if (!args.input) {
    error('Error: --input is required.');
    process.exitCode = 1;
    return;
  }

  const inputPath = resolveInputPath(args.input);
  let schema;
  try {
    schema = loadSchema(inputPath);
  } catch (err) {
    error(`Error loading schema: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  let result;
  if (args.unpublish) {
    result = unpublishSchema(schema);
    log(`Schema unpublished.`);
  } else {
    const channel = args.channel || 'default';
    if (isPublished(schema)) {
      log(`Warning: schema is already published on channel "${schema.publishChannel}". Re-publishing.`);
    }
    result = publishSchema(schema, channel);
    log(`Schema published to channel "${channel}" at ${result.publishedAt}.`);
  }

  const outputPath = args.output ? resolveInputPath(args.output) : inputPath;
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  log(`Saved to ${outputPath}`);
}

module.exports = { resolveInputPath, runPublish };
