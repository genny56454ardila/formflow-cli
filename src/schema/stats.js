const FIELD_TYPES = ['text', 'email', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date', 'password', 'file'];

/**
 * Compute stats for a single field
 * @param {object} field
 * @returns {object}
 */
function fieldStats(field) {
  return {
    name: field.name,
    type: field.type || 'unknown',
    required: field.required === true,
    hasValidation: !!(field.validation && Object.keys(field.validation).length > 0),
    hasDefault: field.default !== undefined,
    hasPlaceholder: typeof field.placeholder === 'string',
    hasLabel: typeof field.label === 'string',
  };
}

/**
 * Compute aggregate stats for a schema
 * @param {object} schema
 * @returns {object}
 */
function schemaStats(schema) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: expected an object with a fields array');
  }

  const fields = schema.fields;
  const total = fields.length;
  const requiredCount = fields.filter(f => f.required === true).length;
  const optionalCount = total - requiredCount;

  const typeCounts = {};
  for (const type of FIELD_TYPES) {
    typeCounts[type] = 0;
  }
  typeCounts['unknown'] = 0;

  for (const field of fields) {
    const t = field.type || 'unknown';
    if (typeCounts[t] !== undefined) {
      typeCounts[t]++;
    } else {
      typeCounts['unknown']++;
    }
  }

  const withValidation = fields.filter(f => f.validation && Object.keys(f.validation).length > 0).length;
  const withDefaults = fields.filter(f => f.default !== undefined).length;

  return {
    name: schema.name || 'unnamed',
    totalFields: total,
    requiredFields: requiredCount,
    optionalFields: optionalCount,
    typeCounts,
    fieldsWithValidation: withValidation,
    fieldsWithDefaults: withDefaults,
    fieldDetails: fields.map(fieldStats),
  };
}

module.exports = { fieldStats, schemaStats };
