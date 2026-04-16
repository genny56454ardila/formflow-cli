const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { tagField, untagField, getFieldsByTag, listAllTags, tagSchema } = require('../schema/tagger');

function resolveInputPath(input) {
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

async function runTag(filePath, options) {
  const resolved = resolveInputPath(filePath);
  const schema = await loadSchema(resolved);

  if (options.list) {
    const tags = listAllTags(schema);
    if (tags.length === 0) {
      console.log('No tags found in schema.');
    } else {
      console.log('Tags found:', tags.join(', '));
    }
    return;
  }

  if (options.filter) {
    const fields = getFieldsByTag(schema, options.filter);
    if (fields.length === 0) {
      console.log(`No fields with tag "${options.filter}".`);
    } else {
      console.log(`Fields tagged "${options.filter}":`);
      fields.forEach(f => console.log(` - ${f.name}`));
    }
    return;
  }

  if (!options.field) {
    console.error('Error: --field is required for tag/untag operations.');
    process.exit(1);
  }

  if (!options.tag) {
    console.error('Error: --tag value is required.');
    process.exit(1);
  }

  let updated;
  if (options.remove) {
    updated = untagField(schema, options.field, options.tag);
    console.log(`Removed tag "${options.tag}" from field "${options.field}".`);
  } else {
    updated = tagField(schema, options.field, options.tag);
    console.log(`Tagged field "${options.field}" with "${options.tag}".`);
  }

  fs.writeFileSync(resolved, JSON.stringify(updated, null, 2));
}

module.exports = { resolveInputPath, runTag };
