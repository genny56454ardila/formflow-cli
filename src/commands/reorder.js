const fs = require('fs');
const path = require('path');
const { loadSchema } = require('../schema/loader');
const { reorderSchema } = require('../schema/reorder');

function resolveInputPath(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
}

async function runReorder(inputPath, order, options = {}) {
  const resolved = resolveInputPath(inputPath);
  const schema = await loadSchema(resolved);

  if (!order || order.length === 0) {
    console.error('Error: no field order provided');
    process.exit(1);
  }

  let reordered;
  try {
    reordered = reorderSchema(schema, order);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  const output = JSON.stringify(reordered, null, 2);

  if (options.output) {
    const outPath = resolveInputPath(options.output);
    fs.writeFileSync(outPath, output, 'utf-8');
    console.log(`Reordered schema written to ${outPath}`);
  } else if (options.inPlace) {
    fs.writeFileSync(resolved, output, 'utf-8');
    console.log(`Schema reordered in place: ${resolved}`);
  } else {
    console.log(output);
  }
}

module.exports = { resolveInputPath, runReorder };
