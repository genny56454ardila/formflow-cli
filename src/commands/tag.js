const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { tagSchema, untagSchema, listTags } = require('../schema/tagger');

function resolveInputPath(input) {
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

async function runTag(options) {
  const { input, field, add, remove, list, output } = options;
  const inputPath = resolveInputPath(input);
  let schema = await loadSchema(inputPath);

  if (list) {
    const tags = listTags(schema);
    if (tags.length === 0) {
      console.log('No tags found in schema.');
    } else {
      console.log('Tags:', tags.join(', '));
    }
    return;
  }

  if (!field) {
    console.error('Error: --field is required for add/remove operations.');
    process.exit(1);
  }

  if (add && add.length > 0) {
    schema = tagSchema(schema, field, add);
  }

  if (remove && remove.length > 0) {
    schema = untagSchema(schema, field, remove);
  }

  const outPath = output ? resolveInputPath(output) : inputPath;
  fs.writeFileSync(outPath, JSON.stringify(schema, null, 2));
  console.log(`Schema tags updated: ${outPath}`);
}

module.exports = { resolveInputPath, runTag };
