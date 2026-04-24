const VALID_TYPES = ['text', 'email', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date', 'password'];

function normalizeField(field) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');

  const normalized = { ...field };

  // normalize type
  if (normalized.type) {
    normalized.type = normalized.type.toLowerCase().trim();
    if (!VALID_TYPES.includes(normalized.type)) {
      normalized.type = 'text';
    }
  } else {
    normalized.type = 'text';
  }

  // normalize name
  if (normalized.name) {
    normalized.name = normalized.name.trim().replace(/\s+/g, '_').toLowerCase();
  }

  // normalize label
  if (normalized.label) {
    normalized.label = normalized.label.trim();
  } else if (normalized.name) {
    normalized.label = normalized.name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // normalize required
  if (normalized.required !== undefined) {
    normalized.required = Boolean(normalized.required);
  } else {
    normalized.required = false;
  }

  // normalize options for select/radio
  if (['select', 'radio'].includes(normalized.type) && Array.isArray(normalized.options)) {
    normalized.options = normalized.options
      .map(o => (typeof o === 'string' ? { label: o, value: o.toLowerCase().replace(/\s+/g, '_') } : o))
      .filter(o => o && o.value !== undefined);
  }

  return normalized;
}

function normalizeSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be an object');
  }

  if (!Array.isArray(schema.fields)) {
    throw new Error('Schema must have a fields array');
  }

  if (schema.fields.length === 0) {
    throw new Error('Schema fields array must not be empty');
  }

  return {
    ...schema,
    fields: schema.fields.map((field, index) => {
      try {
        return normalizeField(field);
      } catch (err) {
        throw new Error(`Invalid field at index ${index}: ${err.message}`);
      }
    }),
  };
}

module.exports = { normalizeField, normalizeSchema };
