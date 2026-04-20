const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { deprecateSchema, undeprecateSchema, listDeprecated, formatDeprecated } = require('../schema/deprecator');

function resolveInputPath(input) {
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

async function runDeprecate(args) {
  const { input, fields, reason, undo, list, output } = args;

  if (!input) throw new Error('--input is required');
  const inputPath = resolveInputPath(input);
  const schema = await loadSchema(inputPath);

  if (list) {
    const deprecated = listDeprecated(schema);
    console.log(formatDeprecated(deprecated));
    return;
  }

  if (!fields || !fields.length) throw new Error('--fields is required');
  const fieldNames = fields.split(',').map(f => f.trim());

  const updated = undo
    ? undeprecateSchema(schema, fieldNames)
    : deprecateSchema(schema, fieldNames, reason || '');

  const outPath = output ? resolveInputPath(output) : inputPath;
  fs.writeFileSync(outPath, JSON.stringify(updated, null, 2));
  console.log(`Schema written to ${outPath}`);
}

module.exports = { resolveInputPath, runDeprecate };
