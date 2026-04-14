const VALID_FIELD_TYPES = ['text', 'email', 'password', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date'];

/**
 * Validates a form schema object parsed from a JSON config file.
 * Returns an object with `valid` boolean and `errors` array.
 */
function validateSchema(schema) {
  const errors = [];

  if (!schema || typeof schema !== 'object') {
    return { valid: false, errors: ['Schema must be a non-null object'] };
  }

  if (!schema.formId || typeof schema.formId !== 'string') {
    errors.push('Missing or invalid "formId" (must be a non-empty string)');
  }

  if (!schema.title || typeof schema.title !== 'string') {
    errors.push('Missing or invalid "title" (must be a non-empty string)');
  }

  if (!Array.isArray(schema.fields) || schema.fields.length === 0) {
    errors.push('"fields" must be a non-empty array');
    return { valid: errors.length === 0, errors };
  }

  const seenIds = new Set();

  schema.fields.forEach((field, index) => {
    const prefix = `fields[${index}]`;

    if (!field.id || typeof field.id !== 'string') {
      errors.push(`${prefix}: missing or invalid "id"`);
    } else if (seenIds.has(field.id)) {
      errors.push(`${prefix}: duplicate field id "${field.id}"`);
    } else {
      seenIds.add(field.id);
    }

    if (!field.type || !VALID_FIELD_TYPES.includes(field.type)) {
      errors.push(`${prefix}: "type" must be one of [${VALID_FIELD_TYPES.join(', ')}]`);
    }

    if (!field.label || typeof field.label !== 'string') {
      errors.push(`${prefix}: missing or invalid "label"`);
    }

    if ((field.type === 'select' || field.type === 'radio') && (!Array.isArray(field.options) || field.options.length === 0)) {
      errors.push(`${prefix}: "options" array is required for type "${field.type}"`);
    }
  });

  return { valid: errors.length === 0, errors };
}

module.exports = { validateSchema, VALID_FIELD_TYPES };
