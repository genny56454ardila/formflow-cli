const { v4: uuidv4 } = require('uuid');

/**
 * Deep clone a single field, optionally assigning a new name.
 */
function cloneField(field, newName) {
  if (!field || typeof field !== 'object') {
    throw new Error('Invalid field: must be a non-null object');
  }
  const cloned = JSON.parse(JSON.stringify(field));
  if (newName) {
    cloned.name = newName;
  } else {
    cloned.name = `${field.name}_copy_${uuidv4().slice(0, 6)}`;
  }
  return cloned;
}

/**
 * Clone a field within a schema by field name.
 */
function cloneFieldInSchema(schema, fieldName, newName) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: must have a fields array');
  }
  const source = schema.fields.find(f => f.name === fieldName);
  if (!source) {
    throw new Error(`Field "${fieldName}" not found in schema`);
  }
  if (newName && schema.fields.some(f => f.name === newName)) {
    throw new Error(`Field "${newName}" already exists in schema`);
  }
  const cloned = cloneField(source, newName);
  return {
    ...schema,
    fields: [...schema.fields, cloned],
  };
}

/**
 * Deep clone an entire schema, optionally with a new title.
 */
function cloneSchema(schema, newTitle) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Invalid schema');
  }
  const cloned = JSON.parse(JSON.stringify(schema));
  if (newTitle) {
    cloned.title = newTitle;
  } else {
    cloned.title = `${schema.title || 'schema'}_clone`;
  }
  return cloned;
}

module.exports = { cloneField, cloneFieldInSchema, cloneSchema };
