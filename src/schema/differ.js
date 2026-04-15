const { loadSchema } = require('./loader');

/**
 * Compare two schema fields and return differences
 * @param {Object} fieldA
 * @param {Object} fieldB
 * @returns {Object|null}
 */
function diffFields(fieldA, fieldB) {
  const changes = {};
  const keys = new Set([...Object.keys(fieldA), ...Object.keys(fieldB)]);

  for (const key of keys) {
    if (JSON.stringify(fieldA[key]) !== JSON.stringify(fieldB[key])) {
      changes[key] = { from: fieldA[key], to: fieldB[key] };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Diff two schema objects and return a structured diff report
 * @param {Object} schemaA - base schema
 * @param {Object} schemaB - target schema
 * @returns {Object} diff report
 */
function diffSchemas(schemaA, schemaB) {
  const fieldsA = schemaA.fields || [];
  const fieldsB = schemaB.fields || [];

  const mapA = Object.fromEntries(fieldsA.map(f => [f.name, f]));
  const mapB = Object.fromEntries(fieldsB.map(f => [f.name, f]));

  const added = fieldsB.filter(f => !mapA[f.name]);
  const removed = fieldsA.filter(f => !mapB[f.name]);
  const modified = [];

  for (const field of fieldsA) {
    if (mapB[field.name]) {
      const changes = diffFields(field, mapB[field.name]);
      if (changes) {
        modified.push({ name: field.name, changes });
      }
    }
  }

  return {
    added,
    removed,
    modified,
    hasChanges: added.length > 0 || removed.length > 0 || modified.length > 0
  };
}

/**
 * Load two schema files and diff them
 * @param {string} pathA
 * @param {string} pathB
 * @returns {Object}
 */
async function diffSchemaFiles(pathA, pathB) {
  const schemaA = await loadSchema(pathA);
  const schemaB = await loadSchema(pathB);
  return diffSchemas(schemaA, schemaB);
}

module.exports = { diffFields, diffSchemas, diffSchemaFiles };
