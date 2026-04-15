const { loadSchema } = require('./loader');

/**
 * Rename a field key within a schema's fields array.
 * Returns a new fields array with the renamed field.
 */
function renameField(fields, oldName, newName) {
  if (!Array.isArray(fields)) {
    throw new Error('fields must be an array');
  }
  if (!oldName || typeof oldName !== 'string') {
    throw new Error('oldName must be a non-empty string');
  }
  if (!newName || typeof newName !== 'string') {
    throw new Error('newName must be a non-empty string');
  }

  const fieldExists = fields.some((f) => f.name === oldName);
  if (!fieldExists) {
    throw new Error(`Field "${oldName}" not found in schema`);
  }

  const conflict = fields.some((f) => f.name === newName);
  if (conflict) {
    throw new Error(`Field "${newName}" already exists in schema`);
  }

  return fields.map((field) => {
    if (field.name === oldName) {
      return { ...field, name: newName };
    }
    return field;
  });
}

/**
 * Rename a field in a full schema object loaded from a file path or
 * provided directly as a plain object.
 */
function renameSchema(schemaOrPath, oldName, newName) {
  let schema;

  if (typeof schemaOrPath === 'string') {
    schema = loadSchema(schemaOrPath);
  } else if (schemaOrPath && typeof schemaOrPath === 'object') {
    schema = schemaOrPath;
  } else {
    throw new Error('schemaOrPath must be a file path string or schema object');
  }

  if (!schema.fields || !Array.isArray(schema.fields)) {
    throw new Error('Schema must have a fields array');
  }

  const updatedFields = renameField(schema.fields, oldName, newName);

  return {
    ...schema,
    fields: updatedFields,
  };
}

module.exports = { renameField, renameSchema };
