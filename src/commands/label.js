// label command — label/unlabel fields in a schema file
const fs = require('fs');
const path = require('path');
const { labelSchema, unlabelSchema, listSchemaLabels } = require('../schema/labeler');
const { loadSchema } = require('../schema/loader');

function resolveInputPath(input) {
  return path.resolve(process.cwd(), input);
}

async function runLabel(options) {
  const { input, field, label, remove, list, output } = options;
  const inputPath = resolveInputPath(input);
  const schema = await loadSchema(inputPath);

  if (list) {
    const labels = listSchemaLabels(schema);
    if (labels.length === 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:', labels.join(', '));
    }
    return;
  }

  if (!field) throw new Error('--field is required');
  if (!label) throw new Error('--label is required');

  const updated = remove
    ? unlabelSchema(schema, field, label)
    : labelSchema(schema, field, label);

  const outPath = output ? resolveInputPath(output) : inputPath;
  fs.writeFileSync(outPath, JSON.stringify(updated, null, 2));
  console.log(`${remove ? 'Removed' : 'Applied'} label "${label}" on field "${field}" → ${outPath}`);
}

module.exports = { resolveInputPath, runLabel };
