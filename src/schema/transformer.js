/**
 * transformer.js
 * Transforms schema fields by applying mutations like renaming keys,
 * setting defaults, or remapping field types.
 */

const FIELD_TYPE_MAP = {
  text: 'string',
  number: 'integer',
  checkbox: 'boolean',
  textarea: 'string',
};

/**
 * Transforms a single field by normalizing its type and applying defaults.
 * @param {Object} field
 * @param {Object} options
 * @returns {Object}
 */
function transformField(field, options = {}) {
  if (!field || typeof field !== 'object') {
    throw new Error('transformField: field must be a non-null object');
  }
  if (!field.name) {
    throw new Error('transformField: field must have a name');
  }

  const { normalizeTypes = false, applyDefaults = false } = options;

  const transformed = { ...field };

  if (normalizeTypes && transformed.type && FIELD_TYPE_MAP[transformed.type]) {
    transformed.type = FIELD_TYPE_MAP[transformed.type];
  }

  if (applyDefaults) {
    if (transformed.required === undefined) {
      transformed.required = false;
    }
    if (transformed.label === undefined) {
      transformed.label = transformed.name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
    }
  }

  return transformed;
}

/**
 * Transforms all fields in a schema.
 * @param {Object} schema
 * @param {Object} options
 * @returns {Object}
 */
function transformSchema(schema, options = {}) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('transformSchema: schema must have a fields array');
  }

  const transformedFields = schema.fields.map((field) =>
    transformField(field, options)
  );

  return {
    ...schema,
    fields: transformedFields,
  };
}

module.exports = { transformField, transformSchema };
