const { validateSchema } = require('./validator');

/**
 * Generates a scaffold JSON schema from a simplified field config.
 * @param {Object} config - The simplified config object
 * @param {string} config.formId - Unique identifier for the form
 * @param {string} [config.title] - Display title (defaults to formId)
 * @param {string} [config.description] - Optional form description
 * @param {string} [config.version] - Schema version (defaults to '1.0.0')
 * @param {Array} config.fields - Array of field definition objects
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

/**
 * Deserializes a JSON string back into a schema object, with basic validation.
 * @param {string} jsonString - A JSON string representing a schema
 * @returns {Object} - The parsed schema object
 * @throws {Error} If the string is not valid JSON or the parsed result is not an object
 */
function deserializeSchema(jsonString) {
  if (typeof jsonString !== 'string') {
    throw new Error('Input must be a string');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Failed to parse schema JSON: ${e.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Parsed schema must be a non-null object');
  }

  return parsed;
}

module.exports = { generateSchema, serializeSchema, deserializeSchema };
