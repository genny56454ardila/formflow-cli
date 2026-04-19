// labeler.js — add/remove/list labels on schema fields

function labelField(field, label) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  if (!label || typeof label !== 'string') throw new Error('Invalid label');
  const labels = field.labels ? [...field.labels] : [];
  if (!labels.includes(label)) labels.push(label);
  return { ...field, labels };
}

function unlabelField(field, label) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  if (!field.labels) return { ...field };
  return { ...field, labels: field.labels.filter(l => l !== label) };
}

function listLabels(field) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  return field.labels ? [...field.labels] : [];
}

function labelSchema(schema, fieldName, label) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map(f =>
    f.name === fieldName ? labelField(f, label) : f
  );
  return { ...schema, fields };
}

function unlabelSchema(schema, fieldName, label) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map(f =>
    f.name === fieldName ? unlabelField(f, label) : f
  );
  return { ...schema, fields };
}

function listSchemaLabels(schema) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const all = new Set();
  schema.fields.forEach(f => (f.labels || []).forEach(l => all.add(l)));
  return [...all];
}

module.exports = { labelField, unlabelField, listLabels, labelSchema, unlabelSchema, listSchemaLabels };
