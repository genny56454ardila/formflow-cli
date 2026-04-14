const { validateSchema } = require('./validator');

/**
 * Generates a scaffold JSON schema from a simplified field config.
 * @param {Object} config - The simplified config object
 * @returns {Object} - A full form schema object
 */
function generateSchema(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be a non-null object');
  }

  if (!config.formId || typeof config.formId !== 'string') {
    throw new Error('Config must include a valid string "formId"');
  }

  if (!Array.isArray(config.fields) || config.fields.length === 0) {
    throw new Error('Config must include a non-empty "fields" array');
  }

  const schema = {
    formId: config.formId,
    title: config.title || config.formId,
    description: config.description || '',
    version: config.version || '1.0.0',
    fields: config.fields.map((field, index) => {
      if (!field.name || typeof field.name !== 'string') {
        throw new Error(`Field at index ${index} must have a valid "name" string`);
      }

      return {
        name: field.name,
        type: field.type || 'text',
        label: field.label || field.name,
        required: field.required === true,
        placeholder: field.placeholder || '',
        validation: field.validation || {},
      };
    }),
  };

  const validationResult = validateSchema(schema);
  if (!validationResult.valid) {
    throw new Error(`Generated schema is invalid: ${validationResult.errors.join(', ')}`);
  }

  return schema;
}

/**
 * Serializes a schema object to a formatted JSON string.
 * @param {Object} schema
 * @returns {string}
 */
function serializeSchema(schema) {
  return JSON.stringify(schema, null, 2);
}

module.exports = { generateSchema, serializeSchema };
