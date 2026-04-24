// commands/reference.js — CLI command handler for field reference operations

const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const {
  addReferenceInSchema,
  removeReferenceInSchema,
  listAllReferences
} = require('../schema/referencer');

function resolveInputPath(inputArg) {
  return path.isAbsolute(inputArg) ? inputArg : path.resolve(process.cwd(), inputArg);
}

async function runReference(args, options = {}) {
  const { action, field, ref, description, output } = options;
  const inputPath = resolveInputPath(args[0]);
  const schema = await loadSchema(inputPath);

  if (action === 'list') {
    const refs = listAllReferences(schema);
    if (refs.length === 0) {
      console.log('No references found in schema.');
    } else {
      console.log('References found:');
      refs.forEach(r => console.log(`  - ${r}`));
    }
    return refs;
  }

  if (!field) throw new Error('--field is required for add/remove actions');
  if (!ref) throw new Error('--ref is required for add/remove actions');

  let updated;
  if (action === 'add') {
    updated = addReferenceInSchema(schema, field, ref, description || '');
    console.log(`Added reference "${ref}" to field "${field}".`);
  } else if (action === 'remove') {
    updated = removeReferenceInSchema(schema, field, ref);
    console.log(`Removed reference "${ref}" from field "${field}".`);
  } else {
    throw new Error(`Unknown action: ${action}. Use add, remove, or list.`);
  }

  const outPath = output ? resolveInputPath(output) : inputPath;
  fs.writeFileSync(outPath, JSON.stringify(updated, null, 2));
  console.log(`Schema written to ${outPath}`);
  return updated;
}

module.exports = { resolveInputPath, runReference };
