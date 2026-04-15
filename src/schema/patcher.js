const { loadSchema } = require('./loader');

/**
 * Apply a single patch operation to a field list.
 * Supported ops: 'set', 'unset', 'rename'
 */
function applyPatch(fields, patch) {
  const { op, field: fieldName, key, value, newName } = patch;

  if (!fieldName) throw new Error('Patch must specify a field name');

  const index = fields.findIndex(f => f.name === fieldName);
  if (index === -1) throw new Error(`Field "${fieldName}" not found`);

  const updated = fields.map((f, i) => {
    if (i !== index) return { ...f };

    switch (op) {
      case 'set': {
        if (!key) throw new Error('set op requires a key');
        return { ...f, [key]: value };
      }
      case 'unset': {
        if (!key) throw new Error('unset op requires a key');
        const clone = { ...f };
        delete clone[key];
        return clone;
      }
      case 'rename': {
        if (!newName) throw new Error('rename op requires a newName');
        return { ...f, name: newName };
      }
      default:
        throw new Error(`Unknown patch op: "${op}"`);
    }
  });

  return updated;
}

/**
 * Apply an array of patch operations to a schema.
 */
function patchSchema(schema, patches) {
  if (!Array.isArray(patches) || patches.length === 0) {
    throw new Error('patches must be a non-empty array');
  }

  let fields = [...(schema.fields || [])];

  for (const patch of patches) {
    fields = applyPatch(fields, patch);
  }

  return { ...schema, fields };
}

module.exports = { applyPatch, patchSchema };
