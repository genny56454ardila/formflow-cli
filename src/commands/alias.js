const path = require('path');
const { loadSchema } = require('../schema/loader');
const { aliasSchema, unaliasSchema, listSchemaAliases } = require('../schema/aliaser');
const { generateSchema } = require('../schema/generator');
const fs = require('fs');

function resolveInputPath(input) {
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

async function runAlias(options) {
  const { input, field, alias, remove, list } = options;
  const inputPath = resolveInputPath(input);
  const schema = await loadSchema(inputPath);

  if (list) {
    const aliases = listSchemaAliases(schema);
    const entries = Object.entries(aliases);
    if (entries.length === 0) {
      console.log('No aliases defined.');
    } else {
      entries.forEach(([name, als]) => {
        console.log(`${name}: ${als.join(', ')}`);
      });
    }
    return;
  }

  if (!field) throw new Error('--field is required');
  if (!alias) throw new Error('--alias is required');

  const updated = remove
    ? unaliasSchema(schema, field, alias)
    : aliasSchema(schema, field, alias);

  const outputPath = options.output ? resolveInputPath(options.output) : inputPath;
  fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2));
  console.log(`Alias "${alias}" ${remove ? 'removed from' : 'added to'} field "${field}".`);
}

module.exports = { resolveInputPath, runAlias };
