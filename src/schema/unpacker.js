const { loadSchema } = require('./loader');

/**
 * Unpack a schema into individual field definitions keyed by field name
 * @param {object} schema
 * @returns {object} map of fieldName -> field definition
 */
function unpackFields(schema) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: missing fields array');
  }
  return schema.fields.reduce((acc, field) => {
    if (!field.name) throw new Error('Field missing required name property');
    acc[field.name] = { ...field };
    return acc;
  }, {});
}

/**
 * Reconstruct a schema from an unpacked field map
 * @param {object} fieldMap
 * @param {object} meta - optional schema metadata
 * @returns {object} schema
 */
function repackFields(fieldMap, meta = {}) {
  if (!fieldMap || typeof fieldMap !== 'object') {
    throw new Error('Invalid field map');
  }
  return {
    ...meta,
    fields: Object.values(fieldMap),
  };
}

/**
 * Unpack schema from file path
 * @param {string} filePath
 * @returns {{ fieldMap: object, meta: object }}
 */
function unpackSchema(filePath) {
  const schema = loadSchema(filePath);
  const { fields, ...meta } = schema;
  const fieldMap = unpackFields(schema);
  return { fieldMap, meta };
}

module.exports = { unpackFields, repackFields, unpackSchema };
