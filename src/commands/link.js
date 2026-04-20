const path = require('path');
const { loadSchema } = require('../schema/loader');
const { saveSnapshot } = require('../schema/snapshotter');
const {
  linkFieldInSchema,
  unlinkFieldInSchema,
  listLinks,
} = require('../schema/linker');
const fs = require('fs');

/**
 * Resolve and validate the input schema path
 * @param {string} inputPath
 * @returns {string}
 */
function resolveInputPath(inputPath) {
  const resolved = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Schema file not found: ${resolved}`);
  }
  return resolved;
}

/**
 * Run the link command
 * @param {Object} options
 */
async function runLink(options) {
  const { input, field, targets, unlink, list, output } = options;

  const inputPath = resolveInputPath(input);
  const schema = loadSchema(inputPath);

  if (list) {
    const links = listLinks(schema);
    if (links.length === 0) {
      console.log('No field links defined in this schema.');
    } else {
      links.forEach(({ field: f, linkedTo }) => {
        console.log(`  ${f} → ${linkedTo.join(', ')}`);
      });
    }
    return;
  }

  if (!field) {
    throw new Error('--field is required for link/unlink operations');
  }

  let updated;
  if (unlink) {
    const targetList = (targets || '').split(',').map((t) => t.trim()).filter(Boolean);
    updated = targetList.reduce(
      (s, t) => unlinkFieldInSchema(s, field, t),
      schema
    );
    console.log(`Unlinked field "${field}" from: ${targetList.join(', ')}`);
  } else {
    const targetList = (targets || '').split(',').map((t) => t.trim()).filter(Boolean);
    if (targetList.length === 0) {
      throw new Error('--targets must specify at least one field name');
    }
    updated = linkFieldInSchema(schema, field, targetList);
    console.log(`Linked field "${field}" to: ${targetList.join(', ')}`);
  }

  const outPath = output ? path.resolve(process.cwd(), output) : inputPath;
  fs.writeFileSync(outPath, JSON.stringify(updated, null, 2));
  console.log(`Schema written to ${outPath}`);
}

module.exports = { resolveInputPath, runLink };
