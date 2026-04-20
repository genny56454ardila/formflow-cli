// masker.js — mask/unmask sensitive fields in a schema

const SENSITIVE_DEFAULTS = ['password', 'secret', 'token', 'apiKey', 'api_key', 'ssn', 'creditCard'];

function maskField(field, maskChar = '***') {
  return { ...field, masked: true, defaultValue: maskChar };
}

function unmaskField(field) {
  const updated = { ...field };
  delete updated.masked;
  delete updated.defaultValue;
  return updated;
}

function maskSchema(schema, targets, maskChar = '***') {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: expected fields array');
  }

  const targetSet = new Set(
    targets && targets.length > 0 ? targets : SENSITIVE_DEFAULTS
  );

  const fields = schema.fields.map(field =>
    targetSet.has(field.name) ? maskField(field, maskChar) : field
  );

  return { ...schema, fields };
}

function unmaskSchema(schema) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: expected fields array');
  }

  const fields = schema.fields.map(field =>
    field.masked ? unmaskField(field) : field
  );

  return { ...schema, fields };
}

function listMaskedFields(schema) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: expected fields array');
  }
  return schema.fields.filter(f => f.masked).map(f => f.name);
}

module.exports = { maskField, unmaskField, maskSchema, unmaskSchema, listMaskedFields };
