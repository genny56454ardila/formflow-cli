const fs = require('fs');
const path = require('path');
const { loadSchema } = require('../schema/loader');
const { mapSchema } = require('../schema/mapper');

function resolveInputPath(inputArg) {
  return path.resolve(process.cwd(), inputArg);
}

async function runMap(inputArg, mappingsArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);
  const schema = await loadSchema(inputPath);

  let mappings;
  try {
    const mappingsPath = resolveInputPath(mappingsArg);
    const raw = fs.readFileSync(mappingsPath, 'utf-8');
    mappings = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to load mappings file: ${e.message}`);
  }

  if (!Array.isArray(mappings)) {
    throw new Error('Mappings file must contain a JSON array');
  }

  const result = mapSchema(schema, mappings);

  if (options.output) {
    const outPath = resolveInputPath(options.output);
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`Mapped schema written to ${outPath}`);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }

  return result;
}

module.exports = { resolveInputPath, runMap };
