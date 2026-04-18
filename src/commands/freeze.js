const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { freezeSchema, unfreezeSchema, listFrozenFields } = require('../schema/freezer');

function resolveInputPath(input) {
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

async function runFreeze(inputArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);
  const schema = await loadSchema(inputPath);

  if (options.list) {
    const frozen = listFrozenFields(schema);
    if (frozen.length === 0) {
      console.log('No frozen fields.');
    } else {
      console.log('Frozen fields:', frozen.join(', '));
    }
    return;
  }

  const fieldNames = options.fields ? options.fields.split(',').map(s => s.trim()) : null;

  const result = options.unfreeze
    ? unfreezeSchema(schema, fieldNames)
    : freezeSchema(schema, fieldNames);

  const outputPath = options.output
    ? resolveInputPath(options.output)
    : inputPath;

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  const action = options.unfreeze ? 'Unfroze' : 'Froze';
  const target = fieldNames ? fieldNames.join(', ') : 'all fields';
  console.log(`${action} ${target} in schema "${schema.name}".`);
}

module.exports = { resolveInputPath, runFreeze };
