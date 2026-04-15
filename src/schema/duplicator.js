const { loadSchema } = require('./loader');

/**
 * Duplicate a single field with a new name.
 * @param {object} field
 * @param {string} newName
 * @returns {object}
 */
function duplicateField(field, newName) {
  if (!field || typeof field !== 'object') {
    throw new Error('Invalid field: must be a non-null object');
  }
  if (!newName || typeof newName !== 'string' || !newName.trim()) {
    throw new Error('Invalid newName: must be a non-empty string');
  }
  return { ...field, name: newName.trim() };
}

/**
 * Duplicate a field within a schema by its name, inserting the copy after the original.
 * @param {object} schema
 * @param {string} fieldName  - name of the field to duplicate
 * @param {string} newName    - name for the duplicated field
 * @returns {object}          - new schema with the duplicated field inserted
 */
function duplicateFieldInSchema(schema, fieldName, newName) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: must have a fields array');
  }

  const idx = schema.fields.findIndex((f) => f.name === fieldName);
  if (idx === -1) {
    throw new Error(`Field "${fieldName}" not found in schema`);
  }

  if (schema.fields.some((f) => f.name === newName)) {
    throw new Error(`Field "${newName}" already exists in schema`);
  }

  const duplicated = duplicateField(schema.fields[idx], newName);
  const newFields = [
    ...schema.fields.slice(0, idx + 1),
    duplicated,
    ...schema.fields.slice(idx + 1),
  ];

  return { ...schema, fields: newFields };
}

/**
 * Load a schema from a file, duplicate a field, and return the updated schema.
 * @param {string} inputPath
 * @param {string} fieldName
 * @param {string} newName
 * @returns {object}
 */
async function duplicateSchemaField(inputPath, fieldName, newName) {
  const schema = await loadSchema(inputPath);
  return duplicateFieldInSchema(schema, fieldName, newName);
}

module.exports = { duplicateField, duplicateFieldInSchema, duplicateSchemaField };
